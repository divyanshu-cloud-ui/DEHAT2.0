// Fast browser check for one route before a full static generation run.
import {createRouter} from '../launch/routes.mjs';
import {renderSite} from './site-browser.mjs';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const pathname=process.argv[2];
if(!pathname?.startsWith('/'))throw new Error('Usage: node tools/probe-site-route.mjs /get-involved/people');
const sandbox={window:{}};
vm.runInNewContext(await readFile('stories-data.js','utf8'),sandbox);
const router=createRouter(Array.from(sandbox.window.STORIES));
const route=router.parseUrl(pathname);
if(route.status!==200||route.kind!=='app')throw new Error(`Not an app document: ${pathname}`);
const result=await renderSite(process.cwd(),[{...route,path:pathname}],{concurrency:1,onPage:async(_,html)=>{
  if(!html.includes('id="launch-snapshot"'))throw new Error('Readable static snapshot missing');
}});
console.log(JSON.stringify({route:pathname,...result[0]},null,2));
