// Read-only release audit for the full, locally generated Build Output.
import path from 'node:path';
import vm from 'node:vm';
import {readFile,readdir,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {digest} from './package-launch.mjs';
import {validateLaunchInputs,seoRecordFor} from './validate-launch-inputs.mjs';
import {createRouter,LEGAL_ROUTES} from '../launch/routes.mjs';
import {PUBLISHED,INDEXED_LANGUAGES,PRODUCTION_ORIGIN,API_ENDPOINTS} from '../launch/config.mjs';
import {buildHead} from '../launch/head.mjs';
import {buildGraph} from '../launch/schema.mjs';
import {serveSiteOutput} from './serve-site-output.mjs';
import {documentGate} from './document-gate.mjs';

const root=process.cwd();
const options=new Set(process.argv.slice(2));
if([...options].some(option=>option!=='--require-documents'))throw new Error('Usage: node tools/verify-site.mjs [--require-documents]');
const requireDocuments=options.has('--require-documents');
const staticRoot=path.join(root,'.vercel/output/static');
let manifest;
try{manifest=JSON.parse(await readFile('generated/site/manifest.json','utf8'));}
catch(error){if(error.code==='ENOENT'){console.error('No full build exists. Run node tools/generate-site.mjs first.');process.exit(2);}throw error;}
const config=JSON.parse(await readFile('.vercel/output/config.json','utf8'));
if(manifest.generation?.mode!=='site')throw new Error('Full site manifest is absent; run tools/generate-site.mjs first');
const report={result:'FAIL',documents:0,indexed:0,files:0,errors:[],warnings:[],http:[],bytes:0,sourceDigest:manifest.sourceDigest};
const fail=(kind,detail)=>report.errors.push({kind,detail});
const occurrences=(text,pattern)=>[...text.matchAll(pattern)].length;
const fileSet=new Set(manifest.files.map(entry=>entry.path));
const routeSet=new Set(manifest.routes.map(entry=>entry.path));
const indexedSet=new Set(manifest.indexedPaths);
const sourceSet=new Set(manifest.sourceFiles.map(entry=>entry.path));
const publishedFile=pathname=>fileSet.has(pathname.replace(/^\//,''));
const staticDocument=pathname=>routeSet.has(pathname)||publishedFile(pathname);
const storyContext={window:{}};
vm.runInNewContext(await readFile('stories-data.js','utf8'),storyContext);
const stories=Array.from(storyContext.window.STORIES);
const router=createRouter(stories);
const expectedPaths=new Set([...router.routes.flatMap(route=>(route.id.startsWith('story/')?PUBLISHED.storyLanguages:PUBLISHED.languages).map(lang=>router.pathFor(route.id,lang))),...LEGAL_ROUTES.map(route=>route.path)]);
const expectedIndexed=new Set([...router.routes.flatMap(route=>(route.id.startsWith('story/')?PUBLISHED.storyLanguages:PUBLISHED.languages).filter(lang=>INDEXED_LANGUAGES.includes(lang)).map(lang=>router.pathFor(route.id,lang))),...LEGAL_ROUTES.map(route=>route.path)]);
const faqContext={};faqContext.window=faqContext;
vm.runInNewContext(await readFile('faq-data.js','utf8'),faqContext);
const faqEnglish=Array.from(faqContext.FAQ.ITEMS);
const faqTranslations=new Map();
for(const lang of PUBLISHED.languages.filter(code=>code!=='en')){
  const context={};context.window=context;
  vm.runInNewContext(await readFile(`content-i18n/${lang}.js`,'utf8'),context);
  faqTranslations.set(lang,context.CONTENT_I18N?.[lang]?.faq||{});
}
const faqItemsFor=lang=>faqEnglish.map((item,index)=>Object.fromEntries(['q','a'].map(field=>{
  const value=faqTranslations.get(lang)?.[index]?.[field];
  return [field,typeof value==='string'&&value.trim()?value:item[field]];
})));
const input=await validateLaunchInputs({root,routes:manifest.routes.map(entry=>({...router.parseUrl(entry.path),...entry,legal:entry.kind==='legal'}))});
const seoFor=(id,lang)=>input.seo?.[lang]?.[id.replace(/^story\//,'')]||input.seo?.[lang]?.[id];
const indexedFor=route=>route.routeId.startsWith('story/')?INDEXED_LANGUAGES.filter(code=>PUBLISHED.storyLanguages.includes(code)):INDEXED_LANGUAGES.filter(code=>PUBLISHED.languages.includes(code));
const assetExists=asset=>manifest.publicFiles.some(record=>record.destination===asset);
const directorySizes=new Map();
for(const entry of manifest.files){
  let directory=path.posix.dirname(entry.path);
  while(directory!=='.'){
    const row=directorySizes.get(directory)||{directory,bytes:0,files:0};
    row.bytes+=entry.bytes;row.files++;
    directorySizes.set(directory,row);
    directory=path.posix.dirname(directory);
  }
}
report.directorySizes=[...directorySizes.values()].sort((a,b)=>b.bytes-a.bytes||a.directory.localeCompare(b.directory));
report.largestFiles=[...manifest.files].sort((a,b)=>b.bytes-a.bytes||a.path.localeCompare(b.path)).slice(0,20).map(({path:filename,bytes})=>({path:filename,bytes}));

try{
  if(config.version!==3||!Array.isArray(config.routes))fail('config','Invalid Vercel Build Output config');
  if(manifest.routes.length!==expectedPaths.size||[...expectedPaths].some(route=>!routeSet.has(route)))fail('count',`Document inventory differs from the publication config: ${manifest.routes.length} actual, ${expectedPaths.size} expected`);
  if(new Set(manifest.routes.map(entry=>entry.file)).size!==manifest.routes.length)fail('routes','Duplicate route output file');
  if(routeSet.size!==manifest.routes.length)fail('routes','Duplicate route path');
  if(indexedSet.size!==manifest.indexedPaths.length)fail('index','Duplicate indexed path');
  if(indexedSet.size!==expectedIndexed.size||[...expectedIndexed].some(route=>!indexedSet.has(route)))fail('index','Indexed inventory differs from config');
  if(manifest.indexedPaths.length!==271&&PUBLISHED.languages.length===28&&PUBLISHED.storyLanguages.length===2&&INDEXED_LANGUAGES.join(',')==='en,hi')fail('index',`Expected 271 indexed paths, got ${manifest.indexedPaths.length}`);
  if(digest(JSON.stringify(manifest.sourceFiles))!==manifest.sourceDigest)fail('digest','Source manifest digest mismatch');
  if(sourceSet.size!==manifest.sourceFiles.length||fileSet.size!==manifest.files.length)fail('digest','Duplicate source or output file');
  for(const entry of manifest.sourceFiles){
    try{if(digest(await readFile(entry.path))!==entry.sha256)fail('source',entry.path);}catch(error){fail('source',`${entry.path}: ${error.message}`);}
  }
  for(const entry of manifest.files){
    try{
      const bytes=await readFile(path.join(staticRoot,entry.path));
      report.bytes+=bytes.length;
      if(bytes.length!==entry.bytes||digest(bytes)!==entry.sha256)fail('output-digest',entry.path);
      if(/(^|\/)(?:_internal|generated|node_modules|\.vercel|\.env|\.image-slots)(?:\/|$)/.test(entry.path))fail('private-file',entry.path);
    }catch(error){fail('output-file',`${entry.path}: ${error.message}`);}
  }
  async function inventory(folder,prefix=''){
    const result=[];
    for(const entry of await readdir(folder,{withFileTypes:true})){
      const name=prefix+entry.name;
      if(entry.isDirectory())result.push(...await inventory(path.join(folder,entry.name),name+'/'));
      else result.push(name);
    }
    return result;
  }
  for(const extra of (await inventory(staticRoot)).filter(name=>!fileSet.has(name)))fail('unmanifested-file',extra);
  const redirectSources=new Set(input.redirects.map(row=>row.source));
  const linkFailures=[];
  const documentLinks=[];
  const relativeDocumentLinks=[];
  const resourceFailures=[];
  for(const entry of manifest.routes){
    const html=await readFile(path.join(staticRoot,entry.file),'utf8');
    const parsed=router.parseUrl(entry.path);
    const route=entry.kind==='legal'?{...parsed,path:entry.path,source:LEGAL_ROUTES.find(item=>item.path===entry.path)?.source}:{...parsed,path:entry.path};
    const titleCount=occurrences(html,/<title\b[^>]*>/gi),descCount=occurrences(html,/<meta\b[^>]*name=["']description["']/gi),canonicalCount=occurrences(html,/<link\b[^>]*rel=["']canonical["']/gi);
    if(titleCount!==1||descCount!==1||canonicalCount!==1)fail('metadata',`${entry.path}: title ${titleCount}, description ${descCount}, canonical ${canonicalCount}`);
    if(!html.includes(`<html lang="${entry.lang}"`))fail('language',entry.path);
    const seo=entry.kind==='legal'?{
      title:(await readFile(route.source,'utf8')).match(/<title>([^<]+)<\/title>/i)?.[1],
      description:(await readFile(route.source,'utf8')).match(/<meta name="description" content="([^"]+)"/i)?.[1],
      ogImage:input.seo.en.home.ogImage,
    }:seoRecordFor(input.seo,route);
    const reference=buildHead({route,seo,origin:PRODUCTION_ORIGIN,languages:entry.kind==='legal'?['en']:entry.routeId.startsWith('story/')?PUBLISHED.storyLanguages:PUBLISHED.languages,indexedLanguages:entry.kind==='legal'?['en']:indexedFor(route),pathFor:router.pathFor});
    if(!html.includes(reference))fail('head-reference',entry.path);
    if(entry.kind==='app'){
      const match=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
      if(!match)fail('schema',`${entry.path}: missing graph`);
      else{
        try{
          const actual=JSON.parse(match[1]);
          const expected=buildGraph({route,seo,seoFor,fields:input.schema,stories,assetExists,origin:PRODUCTION_ORIGIN,faqItems:entry.routeId==='answers'?faqItemsFor(entry.lang):undefined});
          if(JSON.stringify(actual)!==JSON.stringify(expected))fail('schema-reference',entry.path);
        }catch(error){fail('schema',`${entry.path}: ${error.message}`);}
      }
      if(indexedSet.has(entry.path)===html.includes('<meta name="robots" content="noindex,follow">'))fail('indexing',entry.path);
    }
    for(const match of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)){
      const href=match[1].replaceAll('&amp;','&');
      if(/^(?:mailto:|tel:|#)/i.test(href))continue;
      if(/^(?:\.\/)?assets\/docs\/[^?#]+\.pdf(?:[?#].*)?$/i.test(href)){
        const target='/'+href.replace(/^\.\//,'').split(/[?#]/)[0];
        documentLinks.push({page:entry.path,href,target});
        relativeDocumentLinks.push({page:entry.path,href,resolved:new URL(href,PRODUCTION_ORIGIN+entry.path).pathname});
        continue;
      }
      let url;try{url=new URL(href,PRODUCTION_ORIGIN+entry.path);}catch{linkFailures.push({page:entry.path,href,reason:'invalid URL'});continue;}
      if(!['dehatindia.org','www.dehatindia.org'].includes(url.hostname))continue;
      if(/^\/assets\/docs\/[^/]+\.pdf$/i.test(url.pathname)){
        documentLinks.push({page:entry.path,href,target:url.pathname});
        continue;
      }
      if(!staticDocument(url.pathname)&&!redirectSources.has(url.pathname)&&!API_ENDPOINTS.some(api=>api.path===url.pathname))linkFailures.push({page:entry.path,href});
    }
    for(const match of html.matchAll(/<(?:img|script|link)\b[^>]*\b(?:src|href)=["'](\/[^"']+)["']/gi)){
      const url=new URL(match[1],PRODUCTION_ORIGIN);
      if(!['dehatindia.org','www.dehatindia.org'].includes(url.hostname))continue;
      const resource=url.pathname;
      if(!staticDocument(resource)&&!redirectSources.has(resource))resourceFailures.push({page:entry.path,resource});
    }
  }
  if(linkFailures.length)fail('internal-links',`${linkFailures.length} missing targets`);
  if(relativeDocumentLinks.length)fail('relative-document-links',`${relativeDocumentLinks.length} PDF links resolve below their page route instead of /assets/docs/`);
  if(resourceFailures.length)fail('resources',`${resourceFailures.length} missing targets`);
  report.linkFailures=linkFailures;report.relativeDocumentLinks=relativeDocumentLinks;report.resourceFailures=resourceFailures;
  const sitemap=await readFile(path.join(staticRoot,'sitemap.xml'),'utf8');
  const locations=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>new URL(match[1]).pathname);
  if(locations.length!==indexedSet.size||new Set(locations).size!==indexedSet.size||locations.some(pathname=>!indexedSet.has(pathname)))fail('sitemap','Sitemap does not match indexed routes');
  if(occurrences(sitemap,/hreflang="x-default"/g)!==manifest.indexedPaths.length-LEGAL_ROUTES.length)fail('sitemap','Unexpected x-default alternate count');
  const robots=await readFile(path.join(staticRoot,'robots.txt'),'utf8');
  if(/^Disallow: \/$/m.test(robots)||!robots.includes('Sitemap: '+PRODUCTION_ORIGIN+'/sitemap_index.xml')||!robots.includes('User-agent: GPTBot'))fail('robots','Production crawler policy is incorrect');
  const index=await readFile(path.join(staticRoot,'sitemap_index.xml'),'utf8');
  if(!index.includes(PRODUCTION_ORIGIN+'/sitemap.xml'))fail('sitemap-index','Missing sitemap reference');
  for(const [name,expected] of [['llms.txt',input.llms],['llms-full.txt',input.llmsFull]])if(await readFile(path.join(staticRoot,name),'utf8')!==expected)fail('discovery',name);
  const redirectDestinations=[];
  for(const row of input.redirects){
    const rule=config.routes.find(candidate=>candidate.status===row.status&&candidate.src&&new RegExp(candidate.src).test(row.source));
    if(!rule)fail('redirect-rule',row.source);
    if(row.status===301&&row.destination.startsWith('/'))redirectDestinations.push(row.destination);
  }
  const documents=documentGate({documentLinks,redirectDestinations,available:staticDocument,requireDocuments});
  report.errors.push(...documents.errors);
  report.warnings.push(...documents.warnings);
  report.pendingDocumentLinks=documents.pendingDocumentLinks;
  report.missingDocuments=documents.missingDocuments;
  report.missingRedirects=documents.missingRedirects;
  if(JSON.stringify(documents.missingRedirects)!==JSON.stringify(manifest.pendingRedirectDestinations))fail('pending-manifest','Pending redirect list differs from manifest');
  const local=await serveSiteOutput(path.join(root,'.vercel/output'));
  try{
    const cases=[['/',200],['/hi',200],['/ar/impact',200],['/stories/'+stories[0].slug,200],['/hi/stories/'+stories[0].slug,200],['/media',200],['/finance',200],['/answers',200],['/privacy-policy/',200],['/robots.txt',200],['/sitemap.xml',200],['/sitemap_index.xml',200],['/llms.txt',200],['/llms-full.txt',200],['/or/stories/'+stories[0].slug,404],['/ar/does-not-exist',404],['/does-not-exist',404],['/_internal/secret',404],[input.redirects.find(row=>row.status===410).source,410],[input.redirects.find(row=>row.status===301&&!row.destination.startsWith('/assets/press/')).source,301]];
    for(const [pathname,expected] of cases){
      const response=await fetch(local.origin+pathname,{redirect:'manual'});
      const body=pathname.startsWith('/or/stories/')?await response.text():'';
      report.http.push({pathname,status:response.status,cacheControl:response.headers.get('cache-control'),robots:response.headers.get('x-robots-tag'),location:response.headers.get('location')});
      if(response.status!==expected)fail('http',`${pathname}: expected ${expected}, got ${response.status}`);
      if(!response.headers.has('x-content-type-options'))fail('header',`${pathname}: missing nosniff`);
      if(expected===404&&pathname.startsWith('/or/stories/')&&(!body.includes('<html lang="or"')||!body.includes('name="robots" content="noindex"')))fail('localized-404',pathname);
    }
  }finally{await new Promise(resolve=>local.server.close(resolve));}
  report.documents=manifest.routes.length;report.indexed=indexedSet.size;report.files=manifest.files.length;
  report.result=report.errors.length?'FAIL':report.warnings.length?'PASS_WITH_PENDING_UPLOADS':'PASS';
}catch(error){fail('verifier',error.stack||error.message);}
await mkdir('generated/site',{recursive:true});
await writeFile('generated/site/verification.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({result:report.result,documents:report.documents,indexed:report.indexed,files:report.files,bytes:report.bytes,http:report.http.length,errors:report.errors.length,warnings:report.warnings.length},null,2));
console.log(JSON.stringify({directorySizes:report.directorySizes,largestFiles:report.largestFiles},null,2));
if(report.errors.length)console.error(JSON.stringify(report.errors.slice(0,30),null,2));
if(report.errors.length)process.exitCode=1;
