import path from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {proofServer} from './proof-server.mjs';

const root=path.resolve(process.argv[2]||'.');
const output=path.join(root,'_internal/qa/157/proof');
await mkdir(output,{recursive:true});
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const local=await proofServer(root);
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
const results=[];
try {
  for(const route of ['/', '/ar/impact','/stories/a-friend-who-noticed','/media']) {
    const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
    let failingAdapter=false;
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error'&&!(failingAdapter&&m.location().url.endsWith('/launch/bootstrap.mjs')))errors.push(m.text()+' '+m.location().url);});
    page.on('requestfailed',r=>{if(!(failingAdapter&&r.url().endsWith('/launch/bootstrap.mjs')))errors.push(r.failure()?.errorText+' '+r.url());});
    const record={route,errors};results.push(record);
    try {
      const response=await page.goto(local.origin+route,{waitUntil:'domcontentloaded'});
      record.status=response.status();
      await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready'||window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='failed',{},{timeout:60000});
      record.diagnostics=await page.evaluate(()=>window.DEHAT_LAUNCH_DIAGNOSTICS);
      if(record.diagnostics.phase!=='ready')throw new Error('Adapter failed');
      record.layout=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,lang:document.documentElement.lang,text:document.querySelector('main')?.innerText.length,links:document.querySelectorAll('a[href]').length,resources:performance.getEntriesByType('resource').map(r=>({name:r.name,bytes:r.encodedBodySize}))}));
      const snapshot=await page.evaluate(()=>{
        const head=document.head.cloneNode(true);
        head.querySelectorAll('script,style').forEach(n=>n.remove());
        const css=Array.from(document.styleSheets,s=>{try{return Array.from(s.cssRules,r=>r.cssText).join('\n')}catch{return ''}}).join('\n');
        const body=document.getElementById('launch-live').cloneNode(true);
        body.id='launch-snapshot';body.removeAttribute('inert');body.removeAttribute('aria-hidden');body.className='';
        body.querySelectorAll('script').forEach(n=>n.remove());
        body.querySelectorAll('[data-reveal]').forEach(n=>{n.style.opacity='1';n.style.transform='none'});
        // Scope generated IDs to the fallback while both DOM trees coexist.
        body.querySelectorAll('[id]').forEach(n=>n.id='snapshot-'+n.id);
        return '<!doctype html><html lang="'+document.documentElement.lang+'" dir="'+document.documentElement.dir+'"><head>'+head.innerHTML+'<style>'+css.replace(/<\/style/gi,'<\\/style')+'</style></head><body><div id="launch-live" inert aria-hidden="true"></div>'+body.outerHTML+'<script type="module" src="/launch/bootstrap.mjs"></script></body></html>';
      });
      local.snapshots.set(route,snapshot);
      const stem=route.replace(/\W+/g,'-')||'home';
      await writeFile(path.join(output,stem+'.html'),snapshot);
      record.snapshotBytes=Buffer.byteLength(snapshot);
      await page.reload({waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready',{},{timeout:60000});
      record.handover=await page.evaluate(()=>window.DEHAT_LAUNCH_DIAGNOSTICS);
      const staticContext=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
      const staticPage=await staticContext.newPage();await staticPage.goto(local.origin+route);
      record.noJS={text:(await staticPage.locator('#launch-snapshot').innerText()).length,links:await staticPage.locator('#launch-snapshot a[href]').count()};
      await staticContext.close();
      await page.screenshot({path:path.join(output,stem+'-390.png')});
      await page.setViewportSize({width:1440,height:900});await page.screenshot({path:path.join(output,stem+'-1440.png')});
      // Deliberately fail the adapter: the server-rendered body must remain usable.
      failingAdapter=true;await page.route('**/launch/bootstrap.mjs',r=>r.abort());
      await page.reload({waitUntil:'domcontentloaded'});
      record.failedRuntime={snapshotVisible:await page.locator('#launch-snapshot').isVisible(),text:(await page.locator('#launch-snapshot').innerText()).length};
      await page.unroute('**/launch/bootstrap.mjs');
    } catch(error){record.failure=error.message;record.diagnostics=await page.evaluate(()=>window.DEHAT_LAUNCH_DIAGNOSTICS).catch(()=>null);}
    await writeFile(path.join(output,'browser-results.json'),JSON.stringify(results,null,2));
    console.log(JSON.stringify({route:record.route,status:record.status,failure:record.failure,errors:record.errors.length,handover:record.handover,noJS:record.noJS}));
    await page.close();
  }
  const statuses=[];
  for(const route of ['/privacy-policy/','/unknown','/ar/unknown','/stories/missing','/programmes/nope','/_internal/qa/secret','/.image-slots.state.json']){
    const response=await fetch(local.origin+route);statuses.push({route,status:response.status});
    if(response.status!==(route==='/privacy-policy/'?200:404))process.exitCode=1;
  }
  await writeFile(path.join(output,'status-results.json'),JSON.stringify(statuses,null,2));
  const cold=[];
  for(let i=0;i<10;i++){
    const context=await browser.newContext({viewport:{width:390,height:844}});const page=await context.newPage();const errors=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
    await page.goto(local.origin+'/finance');await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready',{},{timeout:60000});
    cold.push({run:i+1,errors,diagnostics:await page.evaluate(()=>window.DEHAT_LAUNCH_DIAGNOSTICS)});
    await writeFile(path.join(output,'finance-cold-loads.json'),JSON.stringify(cold,null,2));await context.close();
  }
  if(cold.some(r=>r.errors.length))process.exitCode=1;
} finally {await browser.close();await new Promise(resolve=>local.server.close(resolve));}
if(results.some(r=>r.failure||r.errors.length))process.exitCode=1;
