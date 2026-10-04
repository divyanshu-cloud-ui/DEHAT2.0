// Strict proof generator. Diagnostics never bypass the launch input gate.
import path from 'node:path';
import {readFile,writeFile,mkdir,rename,rm} from 'node:fs/promises';
import {spawnSync,execFileSync} from 'node:child_process';
import vm from 'node:vm';
import {randomUUID} from 'node:crypto';
import {createRouter} from '../launch/routes.mjs';
import {PRODUCTION_ORIGIN,LAUNCH_INPUTS,API_ENDPOINTS,DISCOVERY_FILES} from '../launch/config.mjs';
import {validateLaunchInputs,seoRecordFor} from './validate-launch-inputs.mjs';
import {digest,publicAsset} from './package-launch.mjs';
import {runtimeTemplate} from './proof-server.mjs';
import {pickerRedirectSource} from '../launch/bootstrap.mjs';
import {buildGraph} from '../launch/schema.mjs';

const root=process.cwd();
const sandbox={window:{}};vm.runInNewContext(await readFile('stories-data.js','utf8'),sandbox);
const router=createRouter(Array.from(sandbox.window.STORIES));
const paths=['/','/ar/impact','/stories/a-friend-who-noticed','/media','/privacy-policy/'];
const routes=paths.map(p=>({...router.parseUrl(p),path:p,legal:p==='/privacy-policy/',file:p==='/'?'index.html':p.replace(/^\//,'').replace(/\/$/,'')+'/index.html'}));
const input=await validateLaunchInputs({root,routes});
const tracked=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const assets=[...new Set([...tracked.filter(publicAsset),'launch/bootstrap.mjs','launch/routes.mjs','launch/artwork.mjs','dehat-og.png'])].sort();
const sources=[...new Set([...assets,'DEHAT.dc.html','launch/config.mjs',...API_ENDPOINTS.flatMap(e=>[e.source,e.helper]),...routes.filter(r=>r.legal).map(r=>r.source),...Object.values(LAUNCH_INPUTS),'tools/generate-proof.mjs','tools/proof-server.mjs','tools/proof-browser.mjs','tools/validate-launch-inputs.mjs','tools/package-launch.mjs'])].sort();
const sourceFiles=await Promise.all(sources.map(async p=>({path:p,sha256:digest(await readFile(p))})));
const run=spawnSync(process.execPath,['tools/proof-browser.mjs',root],{stdio:'inherit',env:process.env});
if(run.status!==0)throw new Error('Browser proof failed; no release output written');
// Detect edits made during browser generation rather than stamping stale snapshots.
for(const entry of sourceFiles)if(digest(await readFile(entry.path))!==entry.sha256)throw new Error(`Source changed during generation: ${entry.path}`);
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const output=path.join(root,'generated/proof');const staging=output+'.staging-'+randomUUID();
const files=[];
async function emit(relative,text){await mkdir(path.dirname(path.join(staging,relative)),{recursive:true});await writeFile(path.join(staging,relative),text);files.push({path:relative,sha256:digest(text),bytes:Buffer.byteLength(text)});}
try {
  for(const route of routes){
    let html;
    if(route.legal)html=await readFile(route.source,'utf8');
    else {
      html=await readFile(path.join(root,'_internal/qa/157/proof',(route.path.replace(/\W+/g,'-')||'home')+'.html'),'utf8');
      const seo=seoRecordFor(input.seo,route);
      const canonical=PRODUCTION_ORIGIN+route.path;
      const metadata=`<title>${escape(seo.title)}</title><meta name="description" content="${escape(seo.description)}"><link rel="canonical" href="${canonical}"><meta property="og:title" content="${escape(seo.title)}"><meta property="og:description" content="${escape(seo.description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${escape(new URL(seo.ogImage,PRODUCTION_ORIGIN).href)}">`;
      const seoFor=(id,lang=route.lang)=>input.seo?.[lang]?.[id.replace(/^story\//,'')]||input.seo?.[lang]?.[id];
      const schema=buildGraph({route,seo,seoFor,fields:input.schema,stories:Array.from(sandbox.window.STORIES),assetExists:p=>assets.includes(p),origin:PRODUCTION_ORIGIN});
      html=html.replace(/<title>[\s\S]*?<\/title>/gi,'').replace('</head>',metadata+'<script type="application/ld+json">'+JSON.stringify(schema).replaceAll('<','\\u003c')+'</script></head>');
      if(route.path==='/')html=html.replace('<head>','<head><script>'+pickerRedirectSource+'</script>');
    }
    await emit(route.file,html);
  }
  await emit('launch/runtime-template.html',runtimeTemplate(await readFile('DEHAT.dc.html','utf8')));
  await emit('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+routes.map(r=>'<url><loc>'+PRODUCTION_ORIGIN+r.path+'</loc></url>').join('')+'</urlset>');
  const sitemap='<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+routes.map(r=>'<url><loc>'+PRODUCTION_ORIGIN+r.path+'</loc></url>').join('')+'</urlset>';
  for(const name of DISCOVERY_FILES.filter(n=>n.endsWith('.xml')&&n!=='sitemap.xml')) await emit(name,sitemap);
  await emit('ads.txt','# No advertising sellers are authorized for this preview.\n');
  await emit('app-ads.txt','# No app advertising sellers are authorized for this preview.\n');
  await emit('robots.txt','User-agent: *\nDisallow: /\n');
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
  await mkdir(path.dirname(output),{recursive:true});await rename(staging,output);
  console.log('Proof generated at '+output);
}catch(error){await rm(staging,{recursive:true,force:true});throw error;}
