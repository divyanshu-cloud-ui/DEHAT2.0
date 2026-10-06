// Full, prebuilt production output. The only release output is .vercel/output.
import path from 'node:path';
import vm from 'node:vm';
import {readFile,writeFile,mkdir,copyFile,rename,rm,statfs} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {createRouter,LEGAL_ROUTES,RTL_LANGUAGES} from '../launch/routes.mjs';
import {PRODUCTION_ORIGIN,LAUNCH_INPUTS,API_ENDPOINTS,NODE_RUNTIME,PUBLISHED,INDEXED_LANGUAGES,validatePublication} from '../launch/config.mjs';
import {validateLaunchInputs,seoRecordFor} from './validate-launch-inputs.mjs';
import {digest,publicAsset} from './package-launch.mjs';
import {renderSite} from './site-browser.mjs';
import {runtimeTemplate} from './proof-server.mjs';
import {pickerRedirectSource} from '../launch/bootstrap.mjs';
import {buildGraph} from '../launch/schema.mjs';
import {buildHead} from '../launch/head.mjs';
import {buildSitemap,buildRobots} from '../launch/discovery.mjs';
import {buildNotFound} from '../launch/notfound.mjs';
import {buildRoutes} from '../launch/edge.mjs';
import {absoluteDocumentLinks} from './site-links.mjs';

const root=process.cwd();
const start=performance.now();
let peakNodeRssBytes=process.memoryUsage().rss;
const memorySample=setInterval(()=>{peakNodeRssBytes=Math.max(peakNodeRssBytes,process.memoryUsage().rss);},1000);
memorySample.unref();
async function checkDisk(){
  const disk=await statfs(root);
  if(disk.bavail*disk.bsize<2*1024**3)throw new Error('Free disk is below 2 GiB; stopping build');
}
await checkDisk();
validatePublication();
const storySandbox={window:{}};
vm.runInNewContext(await readFile('stories-data.js','utf8'),storySandbox);
const stories=Array.from(storySandbox.window.STORIES);
const storySlugs=new Set(stories.map(story=>story.slug));
const router=createRouter(stories);
const routes=[...router.routes.flatMap(record=>{
  const languages=record.id.startsWith('story/')?PUBLISHED.storyLanguages:PUBLISHED.languages;
  return languages.map(lang=>{
    const route=router.parseUrl(router.pathFor(record.id,lang));
    const routePath=route.canonicalPath;
    return {...route,path:routePath,file:routePath==='/'?'index.html':routePath.slice(1)+'/index.html'};
  });
}),...LEGAL_ROUTES.map(record=>({...router.parseUrl(record.path),path:record.path,file:record.source,legal:true}))];
if(new Set(routes.map(route=>route.path)).size!==routes.length)throw new Error('Duplicate published route');
const input=await validateLaunchInputs({root,routes});
const tracked=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const assets=[...new Set([...tracked.filter(publicAsset),'launch/bootstrap.mjs','launch/routes.mjs','launch/artwork.mjs'])].sort();
const sourcePaths=[...new Set([...assets,'DEHAT.dc.html','stories-data.js','faq-data.js','seo-data.js','launch/config.mjs','launch/head.mjs','launch/discovery.mjs','launch/edge.mjs','launch/schema.mjs','launch/notfound.mjs','launch/notfound-copy.json',...PUBLISHED.languages.filter(lang=>lang!=='en').map(lang=>`content-i18n/${lang}.js`),...API_ENDPOINTS.flatMap(endpoint=>[endpoint.source,endpoint.helper]),...LEGAL_ROUTES.map(route=>route.source),...Object.values(LAUNCH_INPUTS),'tools/generate-site.mjs','tools/site-links.mjs','tools/site-browser.mjs','tools/proof-server.mjs','tools/validate-launch-inputs.mjs','tools/package-launch.mjs'])].sort();
const sourceFiles=await Promise.all(sourcePaths.map(async filename=>({path:filename,sha256:digest(await readFile(filename))})));
const sourceDigest=digest(JSON.stringify(sourceFiles));
const output=path.join(root,'.vercel/output');
const stage=output+'.staging-'+randomUUID();
const staticRoot=path.join(stage,'static');
const files=[];
const cssFiles=new Map();
const used=new Set();
async function emit(filename,contents){
  if(used.has(filename))throw new Error(`Duplicate generated file: ${filename}`);
  used.add(filename);
  const bytes=Buffer.isBuffer(contents)?contents:Buffer.from(contents);
  const full=path.join(staticRoot,filename);
  await mkdir(path.dirname(full),{recursive:true});
  await writeFile(full,bytes);
  files.push({path:filename,sha256:digest(bytes),bytes:bytes.length});
  if(files.length%25===0)await checkDisk();
}
async function cssOutsideHtml(html){
  const split=html.indexOf('</head>');
  if(split<0)throw new Error('Rendered document has no head');
  let head=html.slice(0,split);
  for(const match of [...head.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/g)]){
    const css=match[1];
    if(!css.trim())continue;
    const name=`launch/css/${digest(css).slice(0,16)}.css`;
    if(!cssFiles.has(name)){cssFiles.set(name,css);await emit(name,css);}
    head=head.replace(match[0],`<link rel="stylesheet" href="/${name}">`);
  }
  return head+html.slice(split);
}
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
const indexedFor=route=>route.routeId.startsWith('story/')?INDEXED_LANGUAGES.filter(code=>PUBLISHED.storyLanguages.includes(code)):INDEXED_LANGUAGES.filter(code=>PUBLISHED.languages.includes(code));
const seoFor=(id,lang)=>input.seo?.[lang]?.[id.replace(/^story\//,'')]||input.seo?.[lang]?.[id];
function legalSeo(html){return {title:html.match(/<title>([^<]+)<\/title>/i)?.[1],description:html.match(/<meta name="description" content="([^"]+)"/i)?.[1],ogImage:input.seo.en.home.ogImage};}
function withMetadata(route,html){
  // The app may offer story cards in every locale although Wave 1 publishes
  // story documents in only two. Keep those content links navigable.
  html=html.replace(/href=(['"])\/([a-z]{2,3})\/stories\/([a-z0-9-]+)([^'"]*)\1/g,(whole,quote,lang,slug,suffix)=>
    !PUBLISHED.storyLanguages.includes(lang)&&storySlugs.has(slug)?`href=${quote}/stories/${slug}${suffix}${quote}`:whole);
  // Finance and governance data contain relative document URLs. Published
  // routes have no trailing slash, so those URLs otherwise resolve beneath
  // each page (for example /finance/assets/docs/ instead of /assets/docs/).
  html=absoluteDocumentLinks(html);
  const seo=seoRecordFor(input.seo,route);
  const graph=buildGraph({route,seo,seoFor,fields:input.schema,stories,assetExists:asset=>assets.includes(asset),origin:PRODUCTION_ORIGIN,faqItems:route.routeId==='answers'?faqItemsFor(route.lang):undefined});
  const head=buildHead({route,seo,origin:PRODUCTION_ORIGIN,languages:route.routeId.startsWith('story/')?PUBLISHED.storyLanguages:PUBLISHED.languages,indexedLanguages:indexedFor(route),pathFor:router.pathFor});
  html=html.replace(/<title>[\s\S]*?<\/title>/gi,'').replace(/<meta name="description" content="[^"]*">/gi,'');
  html=html.replace('</head>',head+'<script type="application/ld+json">'+JSON.stringify(graph).replaceAll('<','\\u003c')+'</script></head>');
  if(route.path==='/')html=html.replace('<head>','<head><script>'+pickerRedirectSource+'</script>');
  return html;
}
const dateCache=new Map();
function sourceDate(filename){
  if(!dateCache.has(filename)){
    const result=execFileSync('git',['log','-1','--format=%cs','--',filename],{encoding:'utf8'}).trim();
    dateCache.set(filename,/^\d{4}-\d{2}-\d{2}$/.test(result)?result:null);
  }
  return dateCache.get(filename);
}
function lastmodFor(route){return sourceDate(route.kind==='legal'?route.source:'DEHAT.dc.html');}
async function checkSources(){for(const entry of sourceFiles)if(digest(await readFile(entry.path))!==entry.sha256)throw new Error(`Source changed during generation: ${entry.path}`);}
const appRoutes=routes.filter(route=>!route.legal);
let timings=[],retries=[];
try{
  await mkdir(staticRoot,{recursive:true});
  ({timings,retries}=await renderSite(root,appRoutes,{concurrency:4,onPage:async(route,snapshot)=>emit(route.file,await cssOutsideHtml(withMetadata(route,snapshot)))}));
  await checkSources();
  for(const route of routes.filter(route=>route.legal)){
    let html=await readFile(route.source,'utf8');
    const seo=legalSeo(html);
    html=html.replace(/<title>[\s\S]*?<\/title>/gi,'').replace(/<meta name="description" content="[^"]*">/gi,'').replace('</head>',buildHead({route,seo,origin:PRODUCTION_ORIGIN,languages:['en'],pathFor:router.pathFor})+'</head>');
    await emit(route.file,html);
  }
  const copy=JSON.parse(await readFile('launch/notfound-copy.json','utf8'));
  const siteSource=await readFile('DEHAT.dc.html','utf8');
  const begin=siteSource.indexOf('  _dict() {'),end=siteSource.indexOf('\n  _canonName(',begin);
  if(begin<0||end<0)throw new Error('Site dictionary missing');
  const dictionary=vm.runInNewContext('({'+siteSource.slice(begin,end)+'})')._dict();
  const labelKeys=['nav_home','nav_work','nav_stories','nav_finance','nav_answers'];
  for(const lang of PUBLISHED.languages){
    const labels=Object.fromEntries(labelKeys.map(key=>[key,dictionary[lang]?.[key]||dictionary.en[key]]));
    const pageCopy=copy.copy[lang]||copy.copy.en;
    const route=router.parseUrl(lang==='en'?'/missing':`/${lang}/missing`);
    const head=buildHead({route,seo:{title:pageCopy.title,description:pageCopy.body,ogImage:input.seo.en.home.ogImage},origin:PRODUCTION_ORIGIN,languages:PUBLISHED.languages,pathFor:router.pathFor});
    await emit(lang==='en'?'404.html':`${lang}/404.html`,buildNotFound({lang,copy,labels,pathFor:router.pathFor,head,dir:RTL_LANGUAGES.includes(lang)?'rtl':'ltr'}));
  }
  const runtime=runtimeTemplate(siteSource);
  await emit('launch/runtime-template.html',runtime);
  const indexedRoutes=routes.filter(route=>route.legal||indexedFor(route).includes(route.lang));
  const sitemap=buildSitemap({entries:indexedRoutes.map(route=>({routeId:route.routeId,lang:route.lang,path:route.path,kind:route.kind,source:route.source})),origin:PRODUCTION_ORIGIN,lastmodFor,mode:'production',indexedLanguages:INDEXED_LANGUAGES});
  await emit('sitemap.xml',sitemap);
  await emit('sitemap_index.xml','<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>'+PRODUCTION_ORIGIN+'/sitemap.xml</loc></sitemap></sitemapindex>\n');
  await emit('robots.txt',buildRobots({mode:'production',origin:PRODUCTION_ORIGIN}));
  await emit('ads.txt','# No advertising sellers are authorized.\n');
  await emit('app-ads.txt','# No app advertising sellers are authorized.\n');
  await emit('llms.txt',input.llms);
  await emit('llms-full.txt',input.llmsFull);
  const publicFiles=[];
  for(const asset of assets){
    const data=await readFile(asset);
    await emit(asset,data);
    publicFiles.push({source:asset,destination:asset,sha256:digest(data)});
  }
  for(const endpoint of API_ENDPOINTS){
    const functionRoot=path.join(stage,'functions',endpoint.path.slice(1)+'.func');
    for(const source of [endpoint.source,endpoint.helper]){
      const destination=path.join(functionRoot,source);
      await mkdir(path.dirname(destination),{recursive:true});await copyFile(source,destination);
    }
    await writeFile(path.join(functionRoot,'.vc-config.json'),JSON.stringify({runtime:NODE_RUNTIME,handler:endpoint.source,launcherType:'Nodejs',shouldAddHelpers:!endpoint.rawBody},null,2));
  }
  const publishedPaths=new Set([...routes.map(route=>route.path),...files.map(file=>'/'+file.path),...API_ENDPOINTS.map(endpoint=>endpoint.path)]);
  const missingRedirects=input.redirects.filter(row=>row.status===301&&row.destination.startsWith('/')&&!publishedPaths.has(new URL(row.destination,PRODUCTION_ORIGIN).pathname));
  if(missingRedirects.length)console.warn(`Pending launch uploads: ${missingRedirects.length} redirect destinations are absent: ${missingRedirects.map(row=>row.destination).join(', ')}`);
  // Preserve the 273 reviewed redirects. Their pending PDFs are tracked in the report.
  const edgePaths=new Set([...publishedPaths,...missingRedirects.map(row=>new URL(row.destination,PRODUCTION_ORIGIN).pathname)]);
  const edgeRoutes=buildRoutes({mode:'production',origin:PRODUCTION_ORIGIN,redirects:input.redirects,routes,publishedPaths:edgePaths,files:files.map(file=>file.path),apis:API_ENDPOINTS});
  await writeFile(path.join(stage,'config.json'),JSON.stringify({version:3,routes:edgeRoutes},null,2));
  await checkSources();
  for(const file of files)if(digest(await readFile(path.join(staticRoot,file.path)))!==file.sha256)throw new Error(`Generated digest mismatch: ${file.path}`);
  peakNodeRssBytes=Math.max(peakNodeRssBytes,process.memoryUsage().rss);
  const routeOrder=new Map(appRoutes.map((route,index)=>[route.path,index]));
  retries.sort((a,b)=>routeOrder.get(a.route)-routeOrder.get(b.route));
  const manifest={version:1,generation:{mode:'site',nodeVersion:process.version,elapsedMs:Math.round(performance.now()-start),peakNodeRssBytes,retries},sourceFiles,sourceDigest,files,routes:routes.map(({path,file,routeId,lang,kind})=>({path,file,routeId,lang,kind})),publicFiles,indexedPaths:indexedRoutes.map(route=>route.path),pendingRedirectDestinations:missingRedirects.map(row=>row.destination),timings};
  const previous=output+'.previous-'+randomUUID();
  let hadPrevious=false;
  try{await rename(output,previous);hadPrevious=true;}catch(error){if(error.code!=='ENOENT')throw error;}
  if(hadPrevious)console.log('Verified candidate complete; replacing the previous .vercel/output');
  try{await rename(stage,output);}catch(error){if(hadPrevious)await rename(previous,output);throw error;}
  if(hadPrevious)await rm(previous,{recursive:true,force:true});
  await mkdir('generated/site',{recursive:true});
  await writeFile('generated/site/manifest.json',JSON.stringify(manifest,null,2));
  const size=files.reduce((sum,file)=>sum+file.bytes,0);
  const appHtmlBytes=files.filter(file=>appRoutes.some(route=>route.file===file.path)).reduce((sum,file)=>sum+file.bytes,0);
  console.log(JSON.stringify({documents:routes.length,indexed:indexedRoutes.length,files:files.length,bytes:size,appHtmlBytes,meanAppHtmlBytes:Math.round(appHtmlBytes/appRoutes.length),cssFiles:cssFiles.size,cssBytes:[...cssFiles.values()].reduce((n,css)=>n+Buffer.byteLength(css),0),runtimeTemplateBytes:Buffer.byteLength(runtime),elapsedMs:manifest.generation.elapsedMs,peakNodeRssBytes,retryCount:retries.length,pendingRedirects:missingRedirects.length,sourceDigest},null,2));
}catch(error){await rm(stage,{recursive:true,force:true});throw error;}
finally{clearInterval(memorySample);}
