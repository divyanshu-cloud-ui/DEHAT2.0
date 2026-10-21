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

test('wave one inventory has 830 documents, every one of them indexed',()=>{
  assert.doesNotThrow(validatePublication);
  assert.equal(published.length+LEGAL_ROUTES.length,830);
  assert.equal(published.filter(route=>INDEXED_LANGUAGES.includes(route.lang)).length+LEGAL_ROUTES.length,830);
  assert.deepEqual([...INDEXED_LANGUAGES],[...PUBLISHED.languages]);
  assert.equal(new Set(published.map(route=>route.path)).size,published.length);
});

// The noindex mechanism stays supported for any language held back; these use an explicit subset.
const LIMITED=Object.freeze(['en','hi']);
test('a language held out of the index is reachable but absent from discovery and alternates',()=>{
  const route=published.find(entry=>entry.routeId==='impact'&&entry.lang==='ar');
  const head=buildHead({route,seo,origin:PRODUCTION_ORIGIN,languages:PUBLISHED.languages,indexedLanguages:LIMITED,pathFor:router.pathFor});
  assert.match(head,/rel="canonical" href="https:\/\/dehatindia.org\/ar\/impact"/);
  assert.match(head,/name="robots" content="noindex,follow"/);
  assert.doesNotMatch(head,/hreflang=/);
  const indexed=published.filter(entry=>LIMITED.includes(entry.lang));
  const sitemap=buildSitemap({entries:indexed.map(entry=>({routeId:entry.routeId,lang:entry.lang,path:entry.path,kind:entry.kind})),origin:PRODUCTION_ORIGIN,lastmodFor:()=>null,indexedLanguages:LIMITED});
  assert.doesNotMatch(sitemap,/\/ar\/impact/);
  assert.equal((sitemap.match(/<url>/g)||[]).length,268);
  assert.equal((sitemap.match(/hreflang="x-default"/g)||[]).length,268);
  assert.equal((sitemap.match(/hreflang="hi"/g)||[]).length,268);
  assert.doesNotMatch(sitemap,/hreflang="ar"/);
  const en=published.find(entry=>entry.routeId==='impact'&&entry.lang==='en');
  const indexedHead=buildHead({route:en,seo,origin:PRODUCTION_ORIGIN,languages:PUBLISHED.languages,indexedLanguages:LIMITED,pathFor:router.pathFor});
  assert.deepEqual([...indexedHead.matchAll(/hreflang="([^"]+)"/g)].map(match=>match[1]),['en','hi','x-default']);
});

test('every published language is indexable: canonical, all hreflang alternates, in the sitemap',()=>{
  const ar=published.find(entry=>entry.routeId==='impact'&&entry.lang==='ar');
  const head=buildHead({route:ar,seo,origin:PRODUCTION_ORIGIN,languages:PUBLISHED.languages,indexedLanguages:INDEXED_LANGUAGES,pathFor:router.pathFor});
  assert.match(head,/rel="canonical" href="https:\/\/dehatindia.org\/ar\/impact"/);
  assert.doesNotMatch(head,/name="robots"/);
  const codes=[...head.matchAll(/hreflang="([^"]+)"/g)].map(match=>match[1]);
  assert.deepEqual(codes,[...PUBLISHED.languages,'x-default']);
  const indexed=published.filter(entry=>INDEXED_LANGUAGES.includes(entry.lang));
  const sitemap=buildSitemap({entries:indexed.map(entry=>({routeId:entry.routeId,lang:entry.lang,path:entry.path,kind:entry.kind})),origin:PRODUCTION_ORIGIN,lastmodFor:()=>null,indexedLanguages:INDEXED_LANGUAGES});
  assert.match(sitemap,/<loc>https:\/\/dehatindia.org\/ar\/impact<\/loc>/);
  assert.equal((sitemap.match(/<url>/g)||[]).length,indexed.length);
  assert.ok(indexed.length<50000);
  // a story exists in three languages only: its pages list those three and no others
  const story=published.find(entry=>entry.routeId.startsWith('story/')&&entry.lang==='en');
  const storyHead=buildHead({route:story,seo,origin:PRODUCTION_ORIGIN,languages:PUBLISHED.storyLanguages,indexedLanguages:INDEXED_LANGUAGES.filter(code=>PUBLISHED.storyLanguages.includes(code)),pathFor:router.pathFor});
  assert.deepEqual([...storyHead.matchAll(/hreflang="([^"]+)"/g)].map(match=>match[1]),[...PUBLISHED.storyLanguages,'x-default']);
});

test('unpublished localized story returns static localized 404 after filesystem',()=>{
  const rules=buildRoutes({mode:'production',origin:PRODUCTION_ORIGIN,redirects:[{source:'/old',destination:'/',status:301}],routes:[],publishedPaths:new Set(['/']),files:['404.html','ar/404.html'],apis:[]});
  const filesystem=rules.findIndex(rule=>rule.handle==='filesystem');
  const fallback=rules.findIndex(rule=>rule.src==='^/ar/stories/[^/]+/?$');
  assert.ok(fallback>filesystem);
  assert.deepEqual({...rules[fallback]}, {src:'^/ar/stories/[^/]+/?$',dest:'/ar/404.html',status:404,headers:{'X-Robots-Tag':'noindex'}});
});
