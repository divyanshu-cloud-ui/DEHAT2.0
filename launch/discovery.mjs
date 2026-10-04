import {LANGUAGES} from './routes.mjs';
import {HREFLANG} from './head.mjs';

const xml = value => String(value).replace(/[&<>]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[char]));
function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)||value.startsWith('0000-')) return false;
  const date=new Date(value+'T00:00:00Z');
  return !Number.isNaN(date.getTime())&&date.toISOString().slice(0,10)===value;
}
export function buildSitemap({entries,origin,lastmodFor,mode='production'}) {
  if(!['preview','production'].includes(mode))throw new TypeError('Unknown sitemap mode');
  if (entries.length>50000) throw new RangeError('Sitemap entry limit exceeded');
  const seen=new Set(),byIdentity=new Map();
  for(const entry of entries){
    if(seen.has(entry.path))throw new TypeError(`Duplicate sitemap path: ${entry.path}`);
    seen.add(entry.path);
    if(entry.kind==='app')byIdentity.set(entry.routeId+'\0'+entry.lang,entry);
  }
  const lines=['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'];
  for(const entry of entries){
    const date=lastmodFor(entry);
    if(date!==null&&!validDate(date))throw new TypeError(`Invalid sitemap lastmod: ${date}`);
    let line=`<url><loc>${xml(origin+entry.path)}</loc>`;
    if(date!==null)line+=`<lastmod>${date}</lastmod>`;
    if(entry.kind==='app'){
      for(const code of LANGUAGES){
        const alternate=byIdentity.get(entry.routeId+'\0'+code);
        if(!alternate&&mode==='preview')continue;
        if(!alternate)throw new TypeError(`Missing ${code} alternate for ${entry.routeId}`);
        line+=`<xhtml:link rel="alternate" hreflang="${HREFLANG[code]}" href="${xml(origin+alternate.path)}"/>`;
      }
      if(byIdentity.has(entry.routeId+'\0en'))line+=`<xhtml:link rel="alternate" hreflang="x-default" href="${xml(origin+byIdentity.get(entry.routeId+'\0en').path)}"/>`;
    }
    lines.push(line+'</url>');
  }
  lines.push('</urlset>');
  const output=lines.join('\n')+'\n';
  if(Buffer.byteLength(output)>52428800)throw new RangeError('Sitemap byte limit exceeded');
  return output;
}

export function buildRobots({mode,origin}) {
  if(mode==='preview')return 'User-agent: *\nDisallow: /\n';
  if(mode!=='production')throw new TypeError('Unknown robots mode');
  const crawlers=['GPTBot','OAI-SearchBot','ChatGPT-User','ClaudeBot','Claude-User','PerplexityBot','Google-Extended','Applebot-Extended','CCBot'];
  return [['User-agent: *','Disallow: /api/'].join('\n'),...crawlers.map(name=>`User-agent: ${name}\nAllow: /\nDisallow: /api/`),`Sitemap: ${origin}/sitemap.xml`].join('\n\n')+'\n';
}
