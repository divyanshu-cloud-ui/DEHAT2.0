import {performance} from 'node:perf_hooks';
import {proofServer} from './proof-server.mjs';

// One server and browser, with a bounded pool of independent pages.
export async function renderSite(root,routes,{concurrency=4,onPage}={}){
  const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
  const local=await proofServer(root);
  let browser;
  const timings=[];
  let cursor=0;
  let failed=false;
  try{
    browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
    async function worker(){
      const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1});
      const page=await context.newPage();
      try{
        while(!failed&&cursor<routes.length){
          const route=routes[cursor++];
          const start=performance.now();
          const errors=[];
          const badResponses=new Set();
          const pageError=error=>errors.push(error.message);
          const consoleError=message=>{if(message.type()==='error'&&!message.text().startsWith('Failed to load resource:'))errors.push(`${message.text()} ${message.location().url}`);};
          const requestFailed=request=>errors.push(`${request.failure()?.errorText} ${request.url()}`);
          const responseError=response=>{if(response.status()>=400)badResponses.add(`HTTP ${response.status()} ${response.url()}`);};
          page.on('pageerror',pageError);
          page.on('console',consoleError);
          page.on('requestfailed',requestFailed);
          page.on('response',responseError);
          try{
            const response=await page.goto(local.origin+route.path,{waitUntil:'domcontentloaded',timeout:90000});
            if(response?.status()!==200)throw new Error(`HTTP ${response?.status()}`);
            await page.waitForFunction(()=>['ready','failed'].includes(window.DEHAT_LAUNCH_DIAGNOSTICS?.phase),{},{timeout:90000});
            const diagnostics=await page.evaluate(()=>window.DEHAT_LAUNCH_DIAGNOSTICS);
            if(diagnostics.phase!=='ready')throw new Error(`Adapter ${diagnostics.phase}: ${JSON.stringify(diagnostics)}`);
            const failures=[...errors,...badResponses];
            if(failures.length)throw new Error(`Page errors (${failures.length} distinct): ${failures.slice(0,20).join('; ')}`);
            const snapshot=await page.evaluate(()=>{
              const head=document.head.cloneNode(true);
              head.querySelectorAll('script,style').forEach(node=>node.remove());
              const css=Array.from(document.styleSheets,sheet=>{try{return Array.from(sheet.cssRules,rule=>rule.cssText).join('\n')}catch{return ''}}).join('\n');
              const body=document.getElementById('launch-live').cloneNode(true);
              body.id='launch-snapshot';body.removeAttribute('inert');body.removeAttribute('aria-hidden');body.className='';
              const art=[];
              body.querySelectorAll('[data-launch-background]').forEach((node,index)=>{
                node.style.removeProperty('background-image');node.setAttribute('data-proof-art',String(index));
                art.push('[data-proof-art="'+index+'"]{background-image:'+node.getAttribute('data-launch-background')+'!important}');
              });
              const noscript=document.createElement('noscript');
              noscript.innerHTML='<style>'+art.join('\n').replace(/<\/style/gi,'<\\/style')+'</style>';
              body.append(noscript);
              body.querySelectorAll('script').forEach(node=>node.remove());
              body.querySelectorAll('[data-reveal]').forEach(node=>{node.style.opacity='1';node.style.transform='none'});
              body.querySelectorAll('[id]').forEach(node=>node.id='snapshot-'+node.id);
              return '<!doctype html><html lang="'+document.documentElement.lang+'" dir="'+document.documentElement.dir+'"><head>'+head.innerHTML+'<style>'+css.replace(/<\/style/gi,'<\\/style')+'</style></head><body><div id="launch-live" inert aria-hidden="true"></div>'+body.outerHTML+'<script type="module" src="/launch/bootstrap.mjs"></script></body></html>';
            });
            await onPage(route,snapshot);
            timings.push({path:route.path,ms:Math.round(performance.now()-start),bytes:Buffer.byteLength(snapshot)});
            if(timings.length%25===0)console.log(`Rendered ${timings.length}/${routes.length}`);
          }catch(error){failed=true;throw new Error(`${route.path}: ${error.message}`);}
          finally{page.off('pageerror',pageError);page.off('console',consoleError);page.off('requestfailed',requestFailed);page.off('response',responseError);}
        }
      }finally{await context.close();}
    }
    const outcomes=await Promise.allSettled(Array.from({length:Math.min(concurrency,routes.length)},worker));
    const rejected=outcomes.find(outcome=>outcome.status==='rejected');
    if(rejected)throw rejected.reason;
    return timings;
  }finally{if(browser)await browser.close();await new Promise(resolve=>local.server.close(resolve));}
}
