import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {buildRoutes} from '../launch/edge.mjs';
import {serveSiteOutput} from './serve-site-output.mjs';

test('local Build Output probe serves documents, redirects and localized 404 bodies',async()=>{
  const root=await mkdtemp(path.join(os.tmpdir(),'dehat-site-probe-'));
  const output=path.join(root,'.vercel/output');
  const files=['index.html','or/404.html','404.html'];
  const routes=[{path:'/',file:'index.html'}];
  const redirects=[{source:'/old',destination:'/',status:301},{source:'/gone',destination:'',status:410}];
  const config={version:3,routes:buildRoutes({mode:'production',origin:'https://dehatindia.org',redirects,routes,publishedPaths:new Set(['/']),files,apis:[]})};
  let local;
  try{
    for(const name of files){await mkdir(path.dirname(path.join(output,'static',name)),{recursive:true});await writeFile(path.join(output,'static',name),`<html lang="${name.startsWith('or/')?'or':'en'}"><meta name="robots" content="noindex"></html>`);}
    await writeFile(path.join(output,'config.json'),JSON.stringify(config));
    local=await serveSiteOutput(output);
    for(const [pathname,status,lang] of [['/',200,'en'],['/or/stories/test',404,'or'],['/gone',410,null],['/old',301,null]]){
      const response=await fetch(local.origin+pathname,{redirect:'manual'});
      assert.equal(response.status,status,pathname);
      assert.equal(response.headers.get('x-content-type-options'),'nosniff');
      if(lang)assert.match(await response.text(),new RegExp(`<html lang="${lang}"`));
      if(status===301)assert.equal(response.headers.get('location'),'/');
      if(status===404)assert.equal(response.headers.get('x-robots-tag'),'noindex');
    }
  }finally{if(local)await new Promise(resolve=>local.server.close(resolve));await rm(root,{recursive:true,force:true});}
});
