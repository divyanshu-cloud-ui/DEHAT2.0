import test from 'node:test';import assert from 'node:assert/strict';
import {buildSitemap,buildRobots} from '../launch/discovery.mjs';
import {LANGUAGES,createRouter} from '../launch/routes.mjs';
const router=createRouter([]);const origin='https://dehatindia.org';
const entries=[...LANGUAGES.map(lang=>({routeId:'home',lang,path:router.pathFor('home',lang),kind:'app'})),{routeId:'privacy',lang:'en',path:'/privacy-policy/',kind:'legal'}];
test('sitemap preserves ordered entries, all alternates and optional verified dates',()=>{
  const original=JSON.stringify(entries);const xml=buildSitemap({entries,origin,lastmodFor:e=>e.lang==='en'?'2024-02-29':null});
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<urlset'));
  assert.ok(xml.endsWith('</urlset>\n'));assert.equal((xml.match(/<url>/g)||[]).length,29);
  assert.equal((xml.match(/<xhtml:link /g)||[]).length,28*29);
  assert.equal((xml.match(/<lastmod>/g)||[]).length,2);
  assert.equal(JSON.stringify(entries),original);assert.equal(buildSitemap({entries,origin,lastmodFor:()=>null}),buildSitemap({entries,origin,lastmodFor:()=>null}));
});
test('sitemap rejects missing locale, duplicates, impossible dates and entry limit',()=>{
  const options={entries,origin,lastmodFor:()=>null};
  assert.throws(()=>buildSitemap({...options,entries:entries.slice(1)}),/Missing/);
  assert.throws(()=>buildSitemap({...options,entries:[...entries,entries[0]]}),/Duplicate/);
  for(const date of ['2025-02-29','2024-13-01','2024-02-30','2024-1-01'])assert.throws(()=>buildSitemap({...options,lastmodFor:()=>date}),/Invalid/);
  assert.throws(()=>buildSitemap({...options,entries:Array(50001).fill(entries[0])}),/limit/);
});
test('preview and production robots bytes follow the requested crawler order',()=>{
  assert.equal(buildRobots({mode:'preview',origin}),'User-agent: *\nDisallow: /\n');
  const production=buildRobots({mode:'production',origin});assert.ok(production.startsWith('User-agent: *\nDisallow: /api/\n\nUser-agent: GPTBot'));
  assert.ok(production.endsWith('Sitemap: https://dehatindia.org/sitemap.xml\n'));
  assert.equal((production.match(/Disallow: \/api\//g)||[]).length,10);
  assert.throws(()=>buildRobots({mode:'local',origin}),TypeError);
});
