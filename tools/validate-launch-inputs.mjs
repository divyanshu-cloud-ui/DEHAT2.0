import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { LAUNCH_INPUTS, PRODUCTION_ORIGIN, DISCOVERY_FILES } from '../launch/config.mjs';

export class LaunchInputError extends Error {
  constructor(issues) {
    super(`Launch inputs failed validation:\n${issues.map(issue => `- ${issue}`).join('\n')}`);
    this.name = 'LaunchInputError';
    this.issues = issues;
  }
}
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.trim().length > 0;

export const SOCIAL_REDIRECT_HOSTS = Object.freeze(['www.facebook.com', 'facebook.com', 'x.com', 'twitter.com', 'www.twitter.com']);
export function mustBeServed(source) {
  return [...DISCOVERY_FILES, 'llms.txt', 'llms-full.txt'].some(file => source === '/' + file);
}

// Quoted commas/newlines and escaped quotes are supported; malformed CSV is fatal.
export function parseRedirectCSV(source) {
  const rows = []; let row = []; let field = ''; let quoted = false; let closed = false;
  source = source.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') { quoted = false; closed = true; }
      else field += char;
    } else if (char === '"' && !field && !closed) quoted = true;
    else if (char === ',' || char === '\n') {
      row.push(field.trim()); field = ''; closed = false;
      if (char === '\n') { if (row.some(Boolean)) rows.push(row); row = []; }
    } else if (char === '"' || (closed && !/\s/.test(char))) throw new Error('Malformed quoted CSV field');
    else if (!closed) field += char;
  }
  if (quoted) throw new Error('Unclosed quoted CSV field');
  row.push(field.trim()); if (row.some(Boolean)) rows.push(row);
  const headers = rows.shift() || [];
  const required = ['source', 'destination', 'status'];
  if (new Set(headers).size !== headers.length || required.some(name => !headers.includes(name)) || headers.some(name => ![...required, 'evidence', 'wayback_timestamp'].includes(name))) {
    throw new Error('Redirect CSV needs source,destination,status and optional evidence,wayback_timestamp columns');
  }
  const redirects = rows.map((values, index) => {
    if (values.length !== headers.length) throw new Error(`Redirect row ${index + 2}: wrong column count`);
    return Object.fromEntries(headers.map((name, i) => [name, name === 'status' ? Number(values[i]) : values[i]]));
  });
  const seen = new Map();
  for (const redirect of redirects) {
    if (!/^\/(?!\/)[^?#\s\\]*$/.test(redirect.source) || /\/(?:\.|\.\.)(?:\/|$)/.test(redirect.source)) throw new Error(`Invalid redirect source: ${redirect.source}`);
    if (mustBeServed(redirect.source)) throw new Error(`Reserved file must be served, not redirected: ${redirect.source}`);
    if (seen.has(redirect.source)) throw new Error(`Duplicate redirect source: ${redirect.source}`);
    if (![301, 410].includes(redirect.status)) throw new Error(`Redirect status must be 301 or 410: ${redirect.source}`);
    if (redirect.status === 410) {
      if (redirect.destination !== '') throw new Error(`410 destination must be empty: ${redirect.source}`);
      seen.set(redirect.source, null); continue;
    }
    if (!redirect.destination || /[\s\\]/.test(redirect.destination)) throw new Error(`Invalid redirect destination: ${redirect.destination}`);
    let destination;
    try { destination = new URL(redirect.destination, PRODUCTION_ORIGIN); } catch { throw new Error(`Invalid redirect destination: ${redirect.destination}`); }
    const local = redirect.destination.startsWith('/') && !redirect.destination.startsWith('//');
    const external = redirect.destination.startsWith('https://') && SOCIAL_REDIRECT_HOSTS.includes(destination.hostname) && !destination.port && !destination.username && !destination.password;
    if (!(local && destination.origin === PRODUCTION_ORIGIN) && !external) throw new Error(`Redirect destination is not allowlisted: ${redirect.destination}`);
    seen.set(redirect.source, local ? destination.pathname : null);
  }
  for (const start of seen.keys()) {
    const visited = new Set(); let current = start;
    while (seen.has(current)) {
      if (visited.has(current)) throw new Error(`Redirect loop involving ${start}`);
      visited.add(current); current = seen.get(current);
    }
  }
  for (const [source, destination] of seen) {
    if (destination && seen.has(destination)) throw new Error(`Redirect chain from ${source} to ${destination}`);
  }
  return redirects;
}

// English remains the handoff's bare route map. Translations can be per-language
// top-level blocks, or { en: <route map>, ar: <route map>, ... }.
export function normalizeSEO(value) {
  if (!object(value)) throw new Error('SEO data must export a route map or language maps');
  if (object(value.en)) return value;
  const english = {}; const translated = {};
  for (const [key, record] of Object.entries(value)) {
    if (object(record) && (Object.hasOwn(record, 'title') || Object.hasOwn(record, 'description'))) english[key] = record;
    else if (/^[a-z]{2,3}$/.test(key) && object(record)) translated[key] = record;
    else throw new Error(`SEO entry ${key} is neither a route record nor a language block`);
  }
  return { en: english, ...translated };
}

export function seoRecordFor(seo, route) {
  const lang = route.lang || 'en';
  const englishPath = lang === 'en' ? route.path : route.path.replace(new RegExp(`^/${lang}(?=/|$)`), '') || '/';
  const records = seo[lang] || {};
  return records[route.routeId || route.id] || records[englishPath] || records[route.storySlug || route.slug];
}

export async function validateLaunchInputs({ root = process.cwd(), routes = [], inputPaths = LAUNCH_INPUTS } = {}) {
  const issues = []; const input = {}; const sources = {};
  for (const [key, relative] of Object.entries(inputPaths)) {
    try {
      const filename = path.resolve(root, relative);
      if (!(await stat(filename)).isFile()) throw new Error('not a file');
      sources[key] = await readFile(filename, 'utf8');
      if (!sources[key].trim()) throw new Error('empty file');
      input[key] = filename;
    } catch (error) { issues.push(`${relative}: ${error.code === 'ENOENT' ? 'missing required input' : error.message}`); }
  }
  let seo; let schema; let redirects;
  if (input.seo) {
    try {
      const module = await import(pathToFileURL(input.seo).href + `?v=${(await stat(input.seo)).mtimeMs}`);
      seo = normalizeSEO(module.default || module.SEO_DATA || module.seoData);
      for (const route of routes.filter(route => !route.legal)) {
        const record = seoRecordFor(seo, route);
        if (!object(record)) { issues.push(`SEO missing ${route.lang || 'en'}:${route.routeId || route.path}`); continue; }
        for (const field of ['title', 'description', 'ogImage']) {
          if (!text(record[field])) issues.push(`SEO ${route.path}: missing ${field}`);
          else if (/\{\{|\b(?:TODO|TBD|PLACEHOLDER)\b/i.test(record[field])) issues.push(`SEO ${route.path}: unresolved ${field}`);
        }
        if (text(record.ogImage)) {
          try {
            const image = new URL(record.ogImage, PRODUCTION_ORIGIN);
            if (!['https:', 'http:'].includes(image.protocol)) throw new Error('invalid scheme');
          } catch { issues.push(`SEO ${route.path}: invalid ogImage URL`); }
        }
      }
    } catch (error) { issues.push(`${inputPaths.seo}: ${error.message}`); }
  }
  if (input.schema) {
    try {
      schema = JSON.parse(sources.schema);
      if (/"(?:taxID|vatID|bankAccount)"/.test(sources.schema)) throw new Error('Sensitive or unverified schema fields are forbidden');
      if (/guidestarindia\.org/i.test(sources.schema)) throw new Error('Unverified GuideStar schema reference');
      if (!object(schema.organization) || !text(schema.organization.name) || !text(schema.organization.url)) throw new Error('needs organization.name and organization.url');
      if (!Array.isArray(schema.organization.sameAs) || !schema.organization.sameAs.length || schema.organization.sameAs.some(value => !/^https:\/\//.test(value))) throw new Error('needs verified organization.sameAs HTTPS URLs');
      if (!object(schema.website) || !text(schema.website.name) || !text(schema.website.url)) throw new Error('needs website.name and website.url');
      if (!['Article', 'CreativeWork'].includes(schema.storyType)) throw new Error('storyType must be Article or CreativeWork');
    } catch (error) { issues.push(`${inputPaths.schema}: ${error.message}`); }
  }
  if (input.redirects) {
    try { redirects = parseRedirectCSV(sources.redirects); }
    catch (error) { issues.push(`${inputPaths.redirects}: ${error.message}`); }
  }
  if (issues.length) throw new LaunchInputError(issues);
  return { seo, schema, redirects, llms: sources.llms, llmsFull: sources.llmsFull, inputPaths };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  validateLaunchInputs().then(() => console.log('Launch inputs: PASS')).catch(error => { console.error(error.message); process.exitCode = 1; });
}
