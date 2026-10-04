// Strict proof generator. Diagnostics never bypass the launch input gate.
import path from 'node:path';
import {readFile,writeFile,mkdir,rename,rm} from 'node:fs/promises';
import {spawnSync,execFileSync} from 'node:child_process';
import vm from 'node:vm';
import {randomUUID} from 'node:crypto';
import {createRouter,LANGUAGES,LEGAL_ROUTES} from '../launch/routes.mjs';
import {PRODUCTION_ORIGIN,LAUNCH_INPUTS,API_ENDPOINTS,DISCOVERY_FILES} from '../launch/config.mjs';
import {validateLaunchInputs,seoRecordFor} from './validate-launch-inputs.mjs';
import {digest,publicAsset} from './package-launch.mjs';
import {runtimeTemplate} from './proof-server.mjs';
import {pickerRedirectSource} from '../launch/bootstrap.mjs';
import {buildGraph} from '../launch/schema.mjs';
import {buildHead} from '../launch/head.mjs';
import {buildSitemap,buildRobots} from '../launch/discovery.mjs';

const root=process.cwd();
const sandbox={window:{}};vm.runInNewContext(await readFile('stories-data.js','utf8'),sandbox);
const router=createRouter(Array.from(sandbox.window.STORIES));
const faqContext={};faqContext.window=faqContext;
vm.runInNewContext(await readFile('faq-data.js','utf8'),faqContext);
const faqEnglish=Array.from(faqContext.FAQ.ITEMS);
const faqTranslations=new Map();
for(const lang of LANGUAGES.filter(code=>code!=='en')){
  const context={};context.window=context;
  vm.runInNewContext(await readFile(`content-i18n/${lang}.js`,'utf8'),context);
  faqTranslations.set(lang,context.CONTENT_I18N?.[lang]?.faq||{});
}
function faqItemsFor(lang){
  const translated=faqTranslations.get(lang)||{};
  return faqEnglish.map((item,index)=>Object.fromEntries(['q','a'].map(field=>{
    const value=translated[index]?.[field];
    return [field,typeof value==='string'&&value.trim()?value:item[field]];
  })));
}
const paths=['/','/ar/impact','/stories/a-friend-who-noticed','/media','/privacy-policy/'];
const routes=paths.map(p=>({...router.parseUrl(p),path:p,legal:p==='/privacy-policy/',file:p==='/'?'index.html':p.replace(/^\//,'').replace(/\/$/,'')+'/index.html'}));
const input=await validateLaunchInputs({root,routes});
const tracked=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const assets=[...new Set([...tracked.filter(publicAsset),'launch/bootstrap.mjs','launch/routes.mjs','launch/artwork.mjs','dehat-og.png'])].sort();
const sources=[...new Set([...assets,'DEHAT.dc.html','launch/config.mjs','launch/head.mjs','launch/discovery.mjs','launch/edge.mjs','launch/schema.mjs',...API_ENDPOINTS.flatMap(e=>[e.source,e.helper]),...routes.filter(r=>r.legal).map(r=>r.source),...Object.values(LAUNCH_INPUTS),'tools/generate-proof.mjs','tools/proof-server.mjs','tools/proof-browser.mjs','tools/validate-launch-inputs.mjs','tools/package-launch.mjs'])].sort();
const sourceFiles=await Promise.all(sources.map(async p=>({path:p,sha256:digest(await readFile(p))})));
const run=spawnSync(process.execPath,['tools/proof-browser.mjs',root],{stdio:'inherit',env:process.env});
if(run.status!==0)throw new Error('Browser proof failed; no release output written');
// Detect edits made during browser generation rather than stamping stale snapshots.
for(const entry of sourceFiles)if(digest(await readFile(entry.path))!==entry.sha256)throw new Error(`Source changed during generation: ${entry.path}`);
const sitemapEntries=routes.map(({routeId,lang,path,kind})=>({routeId,lang,path,kind}));
const routeDataFiles=entry=>{
  if(entry.kind==='legal')return [LEGAL_ROUTES.find(route=>route.id===entry.routeId).source];
  if(entry.routeId==='stories'||entry.routeId.startsWith('story/'))return ['stories-data.js'];
  if(entry.routeId==='work'||entry.routeId.startsWith('prog/'))return ['programme-extras.js','projects-data.js'];
  return ({home:['journey-data.js'],who:['who-data.js','who-profiles.js'],impact:['impact-lenses.js'],finance:['finance-data.js'],media:['media-data.js'],answers:['faq-data.js']})[entry.routeId]||[];
};
const dateCache=new Map();
function sourceDate(file){
  if(!dateCache.has(file)){
    const result=spawnSync('git',['log','-1','--format=%cs','--',file],{encoding:'utf8'});
    dateCache.set(file,result.status===0&&/^\d{4}-\d{2}-\d{2}$/.test(result.stdout.trim())?result.stdout.trim():null);
  }
  return dateCache.get(file);
}
function lastmodFor(entry){
  const files=['DEHAT.dc.html','seo-data.js',...(entry.lang==='en'?[]:[`content-i18n/${entry.lang}.js`]),...routeDataFiles(entry)];
  const dates=files.map(sourceDate);
  return dates.every(Boolean)?dates.sort().at(-1):null;
}
function legalSeo(route,html){
  const title=html.match(/<title>([^<]+)<\/title>/i)?.[1];
  const description=html.match(/<meta name="description" content="([^"]+)"/i)?.[1];
  return {title,description,ogImage:input.seo.en.home.ogImage};
}
const output=path.join(root,'generated/proof');const staging=output+'.staging-'+randomUUID();
const files=[];
async function emit(relative,text){await mkdir(path.dirname(path.join(staging,relative)),{recursive:true});await writeFile(path.join(staging,relative),text);files.push({path:relative,sha256:digest(text),bytes:Buffer.byteLength(text)});}
try {
  for(const route of routes){
    let html;
    let seo;
    if(route.legal){html=await readFile(route.source,'utf8');seo=legalSeo(route,html);}
    else {
      html=await readFile(path.join(root,'_internal/qa/157/proof',(route.path.replace(/\W+/g,'-')||'home')+'.html'),'utf8');
      seo=seoRecordFor(input.seo,route);
      const seoFor=(id,lang=route.lang)=>input.seo?.[lang]?.[id.replace(/^story\//,'')]||input.seo?.[lang]?.[id];
      const schema=buildGraph({route,seo,seoFor,fields:input.schema,stories:Array.from(sandbox.window.STORIES),assetExists:p=>assets.includes(p),origin:PRODUCTION_ORIGIN,faqItems:route.routeId==='answers'?faqItemsFor(route.lang):undefined});
      html=html.replace(/<title>[\s\S]*?<\/title>/gi,'').replace('</head>','<script type="application/ld+json">'+JSON.stringify(schema).replaceAll('<','\\u003c')+'</script></head>');
      if(route.path==='/')html=html.replace('<head>','<head><script>'+pickerRedirectSource+'</script>');
    }
    html=html.replace(/<title>[\s\S]*?<\/title>/gi,'').replace(/<meta name="description" content="[^"]*">/gi,'').replace('</head>',buildHead({route,seo,origin:PRODUCTION_ORIGIN,languages:LANGUAGES,pathFor:router.pathFor})+'</head>');
    await emit(route.file,html);
  }
  await emit('launch/runtime-template.html',runtimeTemplate(await readFile('DEHAT.dc.html','utf8')));
  const sitemap=buildSitemap({entries:sitemapEntries,origin:PRODUCTION_ORIGIN,lastmodFor,mode:'preview'});
  await emit('sitemap.xml',sitemap);
  for(const name of DISCOVERY_FILES.filter(n=>n.endsWith('.xml')&&n!=='sitemap.xml')) await emit(name,'<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>'+PRODUCTION_ORIGIN+'/sitemap.xml</loc></sitemap></sitemapindex>\n');
  await emit('ads.txt','# No advertising sellers are authorized for this preview.\n');
  await emit('app-ads.txt','# No app advertising sellers are authorized for this preview.\n');
  await emit('robots.txt',buildRobots({mode:'preview',origin:PRODUCTION_ORIGIN}));
  const observations=JSON.parse(await readFile('_internal/qa/157/proof/browser-results.json','utf8'));
  const referenced=new Set(['dehat-og.png']);
  for(const page of observations)for(const resource of page.layout.resources){const url=new URL(resource.name);if(url.hostname==='127.0.0.1')referenced.add(url.pathname.slice(1));}
  for(const route of routes.filter(r=>!r.legal)){
    const snapshot=await readFile(path.join(staging,route.file),'utf8');
    for(const match of snapshot.matchAll(/(?:\.\/|\/)?(assets\/[a-zA-Z0-9_./-]+\.(?:png|webp|jpg|svg))/g))referenced.add(match[1]);
  }
  const publicFiles=assets.filter(source=>(!source.startsWith('assets/')||referenced.has(source))&&(!source.startsWith('content-i18n/')||['content-i18n/en.js','content-i18n/ar.js'].includes(source))).map(source=>({source,destination:source,sha256:sourceFiles.find(f=>f.path===source).sha256}));
  const sorted=[...sourceFiles].sort((a,b)=>a.path.localeCompare(b.path));
  await writeFile(path.join(staging,'manifest.json'),JSON.stringify({version:1,generation:{mode:'proof',nodeVersion:process.version},sourceFiles:sorted,sourceDigest:digest(JSON.stringify(sorted)),files,routes,publicFiles},null,2));
  await mkdir(path.dirname(output),{recursive:true});
  const previous=output+'.previous-'+randomUUID();
  let hadPrevious=false;
  try{await rename(output,previous);hadPrevious=true;}
  catch(error){if(error.code!=='ENOENT')throw error;}
  try{await rename(staging,output);}
  catch(error){if(hadPrevious)await rename(previous,output);throw error;}
  if(hadPrevious)await rm(previous,{recursive:true,force:true});
  console.log('Proof generated at '+output);
}catch(error){await rm(staging,{recursive:true,force:true});throw error;}
