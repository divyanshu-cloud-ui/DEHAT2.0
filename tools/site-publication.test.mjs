import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createRouter,LEGAL_ROUTES} from '../launch/routes.mjs';
import {PUBLISHED,INDEXED_LANGUAGES,PRODUCTION_ORIGIN,validatePublication} from '../launch/config.mjs';
import {buildHead} from '../launch/head.mjs';
import {buildSitemap} from '../launch/discovery.mjs';
import {buildRoutes} from '../launch/edge.mjs';

const sandbox={window:{}};
vm.runInNewContext(readFileSync(new URL('../stories-data.js',import.meta.url),'utf8'),sandbox);
const router=createRouter(Array.from(sandbox.window.STORIES));
const published=router.routes.flatMap(route=>(route.id.startsWith('story/')?PUBLISHED.storyLanguages:PUBLISHED.languages).map(lang=>({
  ...router.parseUrl(router.pathFor(route.id,lang)),path:router.pathFor(route.id,lang),
})));
const seo={title:'Example',description:'Example description',ogImage:'/dehat-og.png'};

test('wave one inventory has 713 documents and 271 indexed URLs',()=>{
  assert.doesNotThrow(validatePublication);
  assert.equal(published.length+LEGAL_ROUTES.length,713);
  assert.equal(published.filter(route=>INDEXED_LANGUAGES.includes(route.lang)).length+LEGAL_ROUTES.length,271);
  assert.equal(new Set(published.map(route=>route.path)).size,published.length);
});

test('nonindexed page is reachable but absent from discovery and alternates',()=>{
  const route=published.find(entry=>entry.routeId==='impact'&&entry.lang==='ar');
  const head=buildHead({route,seo,origin:PRODUCTION_ORIGIN,languages:PUBLISHED.languages,indexedLanguages:INDEXED_LANGUAGES,pathFor:router.pathFor});
  assert.match(head,/rel="canonical" href="https:\/\/dehatindia.org\/ar\/impact"/);
  assert.match(head,/name="robots" content="noindex,follow"/);
  assert.doesNotMatch(head,/hreflang=/);
  const indexed=published.filter(entry=>INDEXED_LANGUAGES.includes(entry.lang));
  const sitemap=buildSitemap({entries:indexed.map(entry=>({routeId:entry.routeId,lang:entry.lang,path:entry.path,kind:entry.kind})),origin:PRODUCTION_ORIGIN,lastmodFor:()=>null,indexedLanguages:INDEXED_LANGUAGES});
  assert.doesNotMatch(sitemap,/\/ar\/impact/);
  assert.equal((sitemap.match(/<url>/g)||[]).length,268);
  assert.equal((sitemap.match(/hreflang="x-default"/g)||[]).length,268);
  assert.equal((sitemap.match(/hreflang="hi"/g)||[]).length,268);
  assert.doesNotMatch(sitemap,/hreflang="ar"/);
  const en=published.find(entry=>entry.routeId==='impact'&&entry.lang==='en');
  const indexedHead=buildHead({route:en,seo,origin:PRODUCTION_ORIGIN,languages:PUBLISHED.languages,indexedLanguages:INDEXED_LANGUAGES,pathFor:router.pathFor});
  assert.deepEqual([...indexedHead.matchAll(/hreflang="([^"]+)"/g)].map(match=>match[1]),['en','hi','x-default']);
});

test('unpublished localized story returns static localized 404 after filesystem',()=>{
  const rules=buildRoutes({mode:'production',origin:PRODUCTION_ORIGIN,redirects:[{source:'/old',destination:'/',status:301}],routes:[],publishedPaths:new Set(['/']),files:['404.html','or/404.html'],apis:[]});
  const filesystem=rules.findIndex(rule=>rule.handle==='filesystem');
  const fallback=rules.findIndex(rule=>rule.src==='^/or/stories/[^/]+/?$');
  assert.ok(fallback>filesystem);
  assert.deepEqual({...rules[fallback]}, {src:'^/or/stories/[^/]+/?$',dest:'/or/404.html',status:404,headers:{'X-Robots-Tag':'noindex'}});
});
