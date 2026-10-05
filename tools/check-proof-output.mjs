import path from 'node:path';
import assert from 'node:assert/strict';
import {writeFile,readFile,mkdir} from 'node:fs/promises';
import {serveProofOutput} from './serve-proof-output.mjs';
import {DISCOVERY_FILES,API_ENDPOINTS} from '../launch/config.mjs';
import {LANGUAGES} from '../launch/routes.mjs';
const root=process.cwd();const local=await serveProofOutput(path.resolve('.vercel/output'));
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
const report={http:[],pages:[],navigation:{},api:[]};
try{
  for(const [route,status] of [['/',200],['/ar/impact',200],['/stories/a-friend-who-noticed',200],['/media',200],['/privacy-policy/',200],['/wp-login.php',410],['/facebook',301],['/twitter',301],['/does-not-exist',404],['/.well-known/not-specified.json',404],...DISCOVERY_FILES.map(f=>['/'+f,200])]){
    const response=await fetch(local.origin+route,{redirect:'manual'});assert.equal(response.status,status,route);
    assert.equal(response.headers.get('x-robots-tag'),'noindex, nofollow',route);if(status===410)assert.equal(response.headers.get('location'),null);
    report.http.push({route,status:response.status,location:response.headers.get('location')});
  }
  const manifest=JSON.parse(await readFile('generated/proof/manifest.json','utf8'));
  const edge=JSON.parse(await readFile('.vercel/output/config.json','utf8'));
  for(const lang of LANGUAGES){
    const file=lang==='en'?'404.html':`${lang}/404.html`;
    assert.ok(manifest.files.some(entry=>entry.path===file),file);
    const html=await readFile(path.join('.vercel/output/static',file),'utf8');
    assert.ok(html.includes(`<html lang="${lang}"`),file);
    assert.ok(html.includes('name="robots" content="noindex"'),file);
  }
  for(const [route,lang,file] of [['/does-not-exist','en','404.html'],['/hi/nope','hi','hi/404.html'],['/ar/x/y','ar','ar/404.html']]){
    const response=await fetch(local.origin+route,{redirect:'manual'});
    assert.equal(response.status,404,route);
    const fallback=edge.routes.slice(edge.routes.findIndex(rule=>rule.handle==='filesystem')+1).find(rule=>rule.src&&new RegExp(rule.src).test(route));
    assert.equal(fallback.dest,'/'+file,route);
    report.http.push({route,status:response.status,document:file,lang});
  }
  await mkdir('_internal/qa/166',{recursive:true});
  for(const [file,lang] of [['404.html','en'],['hi/404.html','hi']])for(const viewport of [{width:390,height:844},{width:1440,height:900}]){
    const proof=await browser.newPage({viewport});
    await proof.goto(local.origin+'/'+file);
    assert.equal(await proof.locator('html').getAttribute('lang'),lang);
    assert.equal(await proof.locator('h1').count(),1);
    assert.equal(await proof.locator('nav a').count(),5);
    assert.equal(await proof.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    await proof.screenshot({path:`_internal/qa/166/${lang}-${viewport.width}x${viewport.height}.png`});
    await proof.close();
  }
  for(const file of ['404.html','hi/404.html']){
    const narrow=await browser.newPage({viewport:{width:320,height:700}});
    await narrow.goto(local.origin+'/'+file);
    assert.equal(await narrow.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,file);
    await narrow.close();
  }
  for(const route of manifest.routes.filter(r=>!r.legal)){
    const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text()+' '+m.location().url)});
    await page.goto(local.origin+route.path);await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready',{},{timeout:60000});
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://dehatindia.org'+route.path);
    assert.ok((await page.title()).length>0);assert.equal(await page.locator('html').getAttribute('lang'),route.lang);
    report.pages.push({path:route.path,title:await page.title(),errors});assert.deepEqual(errors,[],route.path);
    await page.close();
  }
  const page=await browser.newPage();await page.goto(local.origin+'/');await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
  await page.evaluate(()=>window.__proofDocumentIdentity='unchanged');
  await page.locator('a[href="/media"]').last().evaluate(el=>el.click());
  await page.waitForFunction(()=>window.DEHAT_LAUNCH.route.canonicalPath==='/media'&&!!document.querySelector('.m-card'));
  assert.equal(await page.evaluate(()=>window.__proofDocumentIdentity),'unchanged');
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://dehatindia.org/media');
  await page.goBack();await page.waitForFunction(()=>window.DEHAT_LAUNCH.route.canonicalPath==='/');
  assert.equal(await page.evaluate(()=>window.__proofDocumentIdentity),'unchanged');
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://dehatindia.org/');
  report.navigation={sameDocument:true,back:true,canonicalUpdated:true};await page.close();
  for(const endpoint of API_ENDPOINTS){const response=await fetch(local.origin+endpoint.path,{method:'DELETE'});assert.equal(response.status,405);report.api.push({path:endpoint.path,method:'DELETE',status:response.status});}
  const config=await fetch(local.origin+'/api/paypal/config');report.api.push({path:'/api/paypal/config',method:'GET',status:config.status,note:'No provider credentials supplied; a configuration error is expected locally.'});
  assert.equal(config.status,500);
  report.result='PASS';
}catch(error){report.result='FAIL';report.failure=error.stack;process.exitCode=1;console.error(error.message);}
finally{await writeFile(path.join(root,'_internal/qa/157/proof/packaged-output-results.json'),JSON.stringify(report,null,2));await browser.close();await new Promise(resolve=>local.server.close(resolve));}
console.log(JSON.stringify({result:report.result,http:report.http.length,pages:report.pages.length,navigation:report.navigation,api:report.api.length}));
