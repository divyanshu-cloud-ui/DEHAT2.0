import {readFile,writeFile,mkdir,copyFile,rename,rm} from 'node:fs/promises';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {validateLaunchInputs} from './validate-launch-inputs.mjs';
import {API_ENDPOINTS,NODE_RUNTIME,DISCOVERY_FILES,PRODUCTION_ORIGIN} from '../launch/config.mjs';
import {buildRoutes,omittedRedirects} from '../launch/edge.mjs';

export const digest = bytes => createHash('sha256').update(bytes).digest('hex');
export function safeRelative(value) {
  if(typeof value!=='string'||!value||value.includes('\\')||value.startsWith('/')||value.split('/').some(p=>!p||p==='.'||p==='..'))throw new Error(`Unsafe output path: ${value}`);
  return value;
}
export function publicAsset(value) {
  safeRelative(value);
  return /^(?:support|image-slot|stories-data|media-data|projects-data|programme-extras|impact-lenses|journey-data|partner-data|register-data|who-data|who-profiles|who-en|finance-data|faq-data|district-data)\.js$/.test(value)||
    /^(?:MediaArchive\.dc|district-map)\.html$/.test(value)||
    /^launch\/(?:bootstrap\.mjs|routes\.mjs|artwork\.mjs|runtime-template\.html)$/.test(value)||
    /^content-i18n\/[a-z]{2,3}\.js$/.test(value)||
    /^dehat-[\w-]+\.png$/.test(value)||
    /^assets\/(?:ink|story|portraits|svc|art|thumb)\/[\w/.-]+\.(?:png|svg|webp|jpg)$/.test(value);
}
export async function verifyManifest(root,generated,manifest) {
  if(manifest.version!==1||manifest.generation?.mode!=='proof')throw new Error('Only reviewed proof manifests can be packaged');
  if(!manifest.sourceFiles?.length||!manifest.files?.length||!manifest.routes?.length)throw new Error('Incomplete manifest');
  const sources=[...manifest.sourceFiles].sort((a,b)=>a.path.localeCompare(b.path));
  if(digest(JSON.stringify(sources))!==manifest.sourceDigest)throw new Error('Source manifest digest mismatch');
  for(const [base,records] of [[root,sources],[generated,manifest.files]])for(const entry of records){
    const bytes=await readFile(path.join(base,safeRelative(entry.path)));
    if(digest(bytes)!==entry.sha256)throw new Error(`Stale or modified input: ${entry.path}`);
  }
  const names=new Set(manifest.files.map(f=>f.path));
  if(names.size!==manifest.files.length)throw new Error('Duplicate generated file');
  for(const route of manifest.routes){
    if(!/^\/(?!\/)/.test(route.path)||!names.has(route.file)||!route.file.endsWith('.html'))throw new Error('Route missing generated document');
  }
  const documents=new Set(manifest.routes.map(r=>r.file));
  for(const name of names)if(!documents.has(name)&&![...DISCOVERY_FILES,'launch/runtime-template.html'].includes(name)&&!name.match(/^(?:[a-z]{2,3}\/)?404\.html$/))throw new Error(`Unreferenced generated file: ${name}`);
}
export async function packageLaunch({root=process.cwd(),generated=path.join(root,'generated/proof'),output=path.join(root,'.vercel/output')}={}) {
  const manifest=JSON.parse(await readFile(path.join(generated,'manifest.json'),'utf8'));
  await verifyManifest(root,generated,manifest);
  const inputs=await validateLaunchInputs({root,routes:manifest.routes});
  const staging=output+'.staging-'+randomUUID();
  const copy=async(source,destination)=>{await mkdir(path.dirname(destination),{recursive:true});await copyFile(source,destination);};
  try {
    for(const file of manifest.files){
      if(!file.path.endsWith('.html')&&!DISCOVERY_FILES.includes(file.path))throw new Error(`Unexpected generated file: ${file.path}`);
      await copy(path.join(generated,file.path),path.join(staging,'static',file.path));
    }
    for(const asset of manifest.publicFiles||[]){
      if(!publicAsset(asset.destination)||asset.source!==asset.destination)throw new Error(`Asset outside public allowlist: ${asset.destination}`);
      const data=await readFile(path.join(root,safeRelative(asset.source)));
      if(digest(data)!==asset.sha256)throw new Error(`Stale public asset: ${asset.source}`);
      await copy(path.join(root,asset.source),path.join(staging,'static',asset.destination));
    }
    for(const [name,text] of [['llms.txt',inputs.llms],['llms-full.txt',inputs.llmsFull]])await writeFile(path.join(staging,'static',name),text);
    for(const endpoint of API_ENDPOINTS){
      const functionRoot=path.join(staging,'functions',endpoint.path.slice(1)+'.func');
      for(const source of [endpoint.source,endpoint.helper])await copy(path.join(root,source),path.join(functionRoot,source));
      await writeFile(path.join(functionRoot,'.vc-config.json'),JSON.stringify({runtime:NODE_RUNTIME,handler:endpoint.source,launcherType:'Nodejs',shouldAddHelpers:!endpoint.rawBody},null,2));
    }
    const published=new Set([...manifest.routes.map(r=>r.path),...manifest.files.map(f=>'/'+f.path),...(manifest.publicFiles||[]).map(f=>'/'+f.destination),'/llms.txt','/llms-full.txt',...API_ENDPOINTS.map(e=>e.path)]);
    const omitted=omittedRedirects({mode:'preview',redirects:inputs.redirects,publishedPaths:published});
    await writeFile(path.join(staging,'proof-report.json'),JSON.stringify({scope:'five-document proof',redirects:inputs.redirects.length-omitted.length,omittedRedirects:omitted,reason:'Destination outside the limited proof output; full rollout must include it.'},null,2));
    const routes=buildRoutes({mode:'preview',origin:PRODUCTION_ORIGIN,redirects:inputs.redirects,routes:manifest.routes,publishedPaths:published,files:manifest.files.map(file=>file.path),apis:API_ENDPOINTS});
    await writeFile(path.join(staging,'config.json'),JSON.stringify({version:3,routes},null,2));
    // Never replace an existing successful bundle without an explicit clean step.
    await mkdir(path.dirname(output),{recursive:true});await rename(staging,output);
  }catch(error){await rm(staging,{recursive:true,force:true});throw error;}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)packageLaunch().catch(e=>{console.error(e.message);process.exitCode=1;});
