// Handoff 157: pure shared URL rules. No browser globals, imports or side effects.
// Supply the current STORIES records (and PROJECTS for project links) to createRouter.
const freezeRecords = records => Object.freeze(records.map(record => Object.freeze(record)));

export const LANGUAGES = Object.freeze([
  'en', 'ar', 'zh', 'fr', 'ru', 'es', 'hi', 'bn', 'mr', 'te', 'ta', 'gu',
  'ur', 'kn', 'or', 'ml', 'pa', 'as', 'mai', 'sat', 'ks', 'ne', 'kok', 'sd',
  'doi', 'mni', 'brx', 'sa',
]);
export const RTL_LANGUAGES = Object.freeze(['ar', 'ur', 'ks', 'sd']);
export const PROGRAMMES = Object.freeze({
  sol: 'school-of-leadership',
  re: 'rights-and-entitlements',
  cj: 'climate-justice',
  hp: 'human-protection',
});

export const FIXED_ROUTES = freezeRecords([
  { id: 'home', view: 'home', path: '/' },
  { id: 'who', view: 'who', path: '/who' },
  { id: 'work', view: 'work', path: '/work' },
  ...Object.entries(PROGRAMMES).map(([progKey, slug]) => ({
    id: `prog/${progKey}`, view: 'prog', progKey, path: `/programmes/${slug}`,
  })),
  ...['impact', 'stories', 'finance', 'media', 'answers', 'policies'].map(view => ({
    id: view, view, path: `/${view}`,
  })),
  ...['case', 'route', 'give', 'people'].map(pTab => ({
    id: `involved/${pTab}`, view: 'involved', pTab, path: `/get-involved/${pTab}`,
  })),
]);

export const LEGAL_ROUTES = freezeRecords([
  { id: 'privacy-policy', path: '/privacy-policy/', source: 'privacy-policy/index.html' },
  { id: 'refund-policy', path: '/refund-policy/', source: 'refund-policy/index.html' },
  { id: 'terms-and-conditions', path: '/terms-and-conditions/', source: 'terms-and-conditions/index.html' },
]);

export const API_ROUTES = freezeRecords([
  { path: '/api/donations/create-order', method: 'POST' },
  { path: '/api/donations/create-subscription', method: 'POST' },
  { path: '/api/donations/verify', method: 'POST' },
  { path: '/api/donations/webhook', method: 'POST' },
  { path: '/api/paypal/config', method: 'GET' },
  { path: '/api/paypal/create-order', method: 'POST' },
  { path: '/api/paypal/capture-order', method: 'POST' },
]);

const LANG_SET = new Set(LANGUAGES);
const RTL_SET = new Set(RTL_LANGUAGES);
const LEGAL_BY_PATH = new Map(LEGAL_ROUTES.map(route => [route.path, route]));
const LEGACY_VIEWS = new Set(FIXED_ROUTES.map(route => route.view));
const ANCHORS = Object.freeze({
  home: ['cycle', 'where'], who: ['journey'], impact: ['lenses', 'awards'],
  finance: ['allocation', 'compliance', 'governance', 'raise'], media: ['archive'],
  'involved/case': ['case'], 'involved/give': ['give'], 'involved/people': ['partners'],
});
const DIR = lang => RTL_SET.has(lang) ? 'rtl' : 'ltr';
const prefix = (path, lang) => lang === 'en' ? path : `/${lang}${path === '/' ? '' : path}`;

function requireLanguage(lang) {
  if (!LANG_SET.has(lang)) throw new TypeError(`Unsupported language: ${String(lang)}`);
  return lang;
}

// Inspect raw string paths before URL() can normalize dot segments/backslashes away.
function readUrl(input) {
  try {
    if (!(typeof input === 'string' || input instanceof URL)) return null;
    const raw = input instanceof URL ? input.href : input;
    if (!raw || raw.trim() !== raw || /[\u0000-\u0020\u007f\\]/.test(raw)) return null;
    if (!(raw.startsWith('/') || /^https?:\/\//.test(raw)) || raw.startsWith('//')) return null;
    const withoutOrigin = raw.replace(/^https?:\/\/[^/?#]+/, '') || '/';
    const rawPath = withoutOrigin.split(/[?#]/, 1)[0] || '/';
    if (rawPath.includes('//')) return null;
    for (const part of rawPath.split('/')) {
      const decoded = decodeURIComponent(part);
      if (decoded === '.' || decoded === '..' || /[/\\%\u0000-\u0020\u007f]/.test(decoded)) return null;
    }
    const url = new URL(raw, 'https://dehat.invalid');
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return { url, path: decodeURIComponent(url.pathname) };
  } catch {
    return null;
  }
}

function languageAndPath(path) {
  const first = path.split('/')[1];
  if (!LANG_SET.has(first)) return { lang: 'en', path, explicit: false };
  return { lang: first, path: path.slice(first.length + 1) || '/', explicit: true };
}

function notFound(parsed, lang = 'en', reason = 'unknown-path') {
  return {
    status: 404, kind: 'not-found', routeId: null, view: 'not-found',
    lang, dir: DIR(lang), pathname: parsed?.url.pathname || null,
    canonicalPath: null, search: parsed?.url.search || '', hash: parsed?.url.hash || '',
    anchor: null, redirectTo: null, reason,
  };
}

function queryString(value) {
  if (value == null || value === '') return '';
  const query = new URLSearchParams(value instanceof URLSearchParams ? value : String(value).replace(/^\?/, ''));
  return query.size ? `?${query}` : '';
}

/**
 * Returns an immutable router for the supplied public records.
 *
 * parseUrl returns status 200, 301 (redirectTo), or 404. canonicalPath excludes
 * search/fragments. Its app fields map to the existing view/progKey/pTab/storySlug.
 * API_ROUTES and runtime resources are intentionally not app routes.
 */
export function createRouter(stories = [], { projects = [] } = {}) {
  if (!Array.isArray(stories) || !Array.isArray(projects)) throw new TypeError('Route records must be arrays');
  const seen = new Set();
  const storyRoutes = stories.map(story => {
    const slug = typeof story === 'string' ? story : story?.slug;
    if (typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new TypeError(`Invalid story slug: ${String(slug)}`);
    }
    if (seen.has(slug)) throw new TypeError(`Duplicate story slug: ${slug}`);
    seen.add(slug);
    return Object.freeze({ id: `story/${slug}`, view: 'stories', storySlug: slug, path: `/stories/${slug}` });
  });
  const routes = Object.freeze([...FIXED_ROUTES, ...storyRoutes]);
  const byId = new Map(routes.map(route => [route.id, route]));
  const byPath = new Map(routes.map(route => [route.path, route]));
  const projectMap = new Map();
  for (const project of projects) {
    const id = String(project?.id);
    if (!/^[1-9]\d*$/.test(id) || projectMap.has(id)) throw new TypeError(`Invalid or duplicate project ID: ${id}`);
    projectMap.set(id, { id: Number(id), prog: project.prog, cross: [...(project.cross || [])] });
  }

  function allowedAnchor(route, anchor) {
    return (route.view === 'prog' ? ['projects'] : ANCHORS[route.id] || []).includes(anchor);
  }

  function projectFor(route, id) {
    const project = projectMap.get(String(id));
    return route.view === 'prog' && project &&
      (project.prog === route.progKey || project.cross.includes(route.progKey)) ? project.id : null;
  }

  function routeFromState(state) {
    if (typeof state === 'string') return byId.get(state);
    if (!state || typeof state !== 'object') return undefined;
    if (state.routeId || state.id) return byId.get(state.routeId || state.id);
    if (state.view === 'prog') return byId.get(`prog/${state.progKey || 're'}`);
    if (state.view === 'involved') return byId.get(`involved/${state.pTab || 'route'}`);
    if (state.view === 'stories' && state.storySlug) return byId.get(`story/${state.storySlug}`);
    return byId.get(state.view);
  }

  function pathFor(routeOrState, lang = 'en', options = {}) {
    requireLanguage(lang);
    const route = routeFromState(routeOrState);
    if (!route) throw new TypeError('Unknown app route');
    let search = queryString(options.search);
    let anchor = options.anchor || '';
    if (options.projectId != null) {
      const projectId = projectFor(route, options.projectId);
      if (projectId === null) throw new TypeError('Project is not part of this programme');
      const params = new URLSearchParams(search);
      params.set('project', String(projectId));
      search = `?${params}`;
      anchor = 'projects';
    }
    if (anchor && !allowedAnchor(route, anchor)) throw new TypeError(`Unknown route anchor: ${anchor}`);
    return prefix(route.path, lang) + search + (anchor ? `#${anchor}` : '');
  }

  function inventory({ localized = false } = {}) {
    if (!localized) return routes;
    return Object.freeze(routes.flatMap(route => LANGUAGES.map(lang => Object.freeze({
      ...route, lang, dir: DIR(lang), path: prefix(route.path, lang),
    }))));
  }

  function parseUrl(input) {
    const parsed = readUrl(input);
    if (!parsed) return notFound(null, 'en', 'malformed-url');
    const { url, path } = parsed;
    const locale = languageAndPath(path);
    const { lang } = locale;
    // Legal documents are authoritative English only, never /en/ or /hi/ variants.
    const legalPath = path.endsWith('/') ? path : `${path}/`;
    const legal = LEGAL_BY_PATH.get(legalPath);
    if (legal) {
      const canonicalPath = legal.path;
      const redirect = url.pathname !== canonicalPath;
      return {
        status: redirect ? 301 : 200, kind: 'legal', routeId: legal.id, view: null,
        lang: 'en', dir: 'ltr', pathname: url.pathname, canonicalPath,
        search: url.search, hash: url.hash, anchor: null, source: legal.source,
        redirectTo: redirect ? canonicalPath + url.search + url.hash : null,
      };
    }
    let routePath = locale.path;
    if (routePath.length > 1 && routePath.endsWith('/')) routePath = routePath.slice(0, -1);
    // Aliases are finite and explicit. Unknown paths never fall back to home.
    const aliases = { '/get-involved': '/get-involved/case', '/programmes': '/work' };
    if (path === '/DEHAT.dc.html') routePath = '/';
    else if (Object.hasOwn(aliases, routePath)) routePath = aliases[routePath];
    const route = byPath.get(routePath);
    if (!route) return notFound(parsed, lang);
    const canonicalPath = prefix(route.path, lang);
    const redirect = url.pathname !== canonicalPath;
    let anchor = null;
    try {
      const candidate = decodeURIComponent(url.hash.slice(1));
      if (allowedAnchor(route, candidate)) anchor = candidate;
    } catch { /* An invalid fragment is not an HTTP path error. */ }
    const rawProjects = url.searchParams.getAll('project');
    const projectId = rawProjects.length === 1 ? projectFor(route, rawProjects[0]) : null;
    return {
      status: redirect ? 301 : 200, kind: 'app', routeId: route.id,
      view: route.view, progKey: route.progKey || null, pTab: route.pTab || null,
      storySlug: route.storySlug || null, lang, dir: DIR(lang),
      pathname: url.pathname, canonicalPath, search: url.search, hash: url.hash,
      anchor, projectId, redirectTo: redirect ? canonicalPath + url.search + url.hash : null,
    };
  }

  /** Only the exact bare '/' may use a stored, explicit picker preference. */
  function preferredHomeRedirect(input, storedLanguage) {
    const parsed = readUrl(input);
    return parsed && parsed.url.pathname === '/' && !parsed.url.search && !parsed.url.hash &&
      LANG_SET.has(storedLanguage) && storedLanguage !== 'en' ? `/${storedLanguage}` : null;
  }

  /**
   * Return null for ordinary anchors/non-legacy URLs, a 404 for a recognized but
   * invalid legacy route, or { ...resolved, status: 200, replaceTo } for migration.
   * This is client replaceState, never an HTTP redirect inferred from a fragment.
   */
  function migrateLegacy(input, { storedLanguage } = {}) {
    const parsed = readUrl(input);
    if (!parsed || !parsed.url.hash) return null;
    const { url, path } = parsed;
    const locale = languageAndPath(path);
    if (!(path === '/' || path === '/DEHAT.dc.html' || (locale.explicit && ['/', ''].includes(locale.path)))) return null;
    let fragment;
    try { fragment = decodeURIComponent(url.hash.slice(1)); } catch { return null; }
    const [view, sub, ...extra] = fragment.split('/');
    if (!LEGACY_VIEWS.has(view)) return null;
    const lang = locale.explicit ? locale.lang : LANG_SET.has(storedLanguage) ? storedLanguage : 'en';
    if (extra.length || fragment.endsWith('/') || (sub && !['prog', 'involved'].includes(view))) {
      return notFound(parsed, lang, 'unknown-legacy-route');
    }
    const isAnswer = view === 'involved' && sub === 'answer';
    const route = isAnswer ? byId.get('finance') : routeFromState({
      view, progKey: view === 'prog' ? sub || 're' : undefined,
      pTab: view === 'involved' ? sub || 'route' : undefined,
    });
    if (!route) return notFound(parsed, lang, 'unknown-legacy-route');
    const replaceTo = pathFor(route.id, lang, { search: url.search, anchor: isAnswer ? 'governance' : '' });
    return { ...parseUrl(replaceTo), migratedFrom: url.pathname + url.search + url.hash, replaceTo };
  }

  return Object.freeze({ routes, inventory, pathFor, parseUrl, migrateLegacy, preferredHomeRedirect });
}

// Convenience exports use the same contract; createRouter avoids rebuilding maps
// on every call in the app. Pass current public records as the last argument.
export const routeInventory = (stories = [], options = {}) => createRouter(stories).inventory(options);
export const parseUrl = (input, { stories = [], projects = [] } = {}) => createRouter(stories, { projects }).parseUrl(input);
export const pathFor = (route, lang = 'en', options = {}, { stories = [], projects = [] } = {}) => createRouter(stories, { projects }).pathFor(route, lang, options);
export const migrateLegacy = (input, options = {}, { stories = [], projects = [] } = {}) => createRouter(stories, { projects }).migrateLegacy(input, options);
export const preferredHomeRedirect = (input, storedLanguage) => createRouter().preferredHomeRedirect(input, storedLanguage);
