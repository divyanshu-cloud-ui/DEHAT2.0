import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('the first visit makes no third-party request or sets a server cookie',async()=>{
  if(!process.env.PLAYWRIGHT_MODULE)throw new Error('Set PLAYWRIGHT_MODULE');
  const modulePath=process.env.PLAYWRIGHT_MODULE;
  const {chromium}=await import(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href);
  const local=await proofServer(process.cwd());
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try{
    const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    const page=await context.newPage();
    const outside=[];
    page.on('request',request=>{
      const url=new URL(request.url());
      if((url.protocol==='http:'||url.protocol==='https:')&&url.origin!==local.origin)outside.push(url.href);
    });
    for(const route of ['/','/get-involved/give']){
      const response=await page.goto(local.origin+route);
      assert.equal(response.headers()['set-cookie'],undefined,`${route} has no Set-Cookie header`);
      await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
      assert.equal(await page.evaluate(()=>localStorage.getItem('dehat.consent')),null);
      assert.equal((await context.cookies()).length,0);
    }
    await page.waitForTimeout(5000);
    assert.deepEqual(outside,[],'no outside host contacted before a choice');
    console.log(JSON.stringify({routes:['/','/get-involved/give'],outsideRequests:outside.length,cookies:0,serverSetCookie:false}));
    await context.close();
  }finally{await browser.close();await new Promise(resolve=>local.server.close(resolve));}
});
