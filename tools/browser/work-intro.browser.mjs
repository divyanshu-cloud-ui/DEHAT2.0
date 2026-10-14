import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';
import {renderSite} from '../site-browser.mjs';

test('Our Work opens with heading and statistics without the redundant paragraph',async()=>{
  if(!process.env.PLAYWRIGHT_MODULE)throw new Error('Set PLAYWRIGHT_MODULE');
  const modulePath=process.env.PLAYWRIGHT_MODULE;
  const {chromium}=await import(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href);
  let snapshot='';
  await renderSite(process.cwd(),[{path:'/work'}],{concurrency:1,onPage:async(_route,html)=>{snapshot=html;}});
  assert.ok(snapshot.includes('Rights, Realised in Everyday Life.'));
  assert.ok(!snapshot.includes('Four programmes, in the order they began.'));
  const local=await proofServer(process.cwd());
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try{
    for(const theme of ['light','dark'])for(const width of [375,1280]){
      const page=await browser.newPage({viewport:{width,height:width<600?812:800},reducedMotion:'reduce'});
      await page.addInitScript(value=>{localStorage.setItem('dehat.theme',value);localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}}));},theme);
      await page.goto(local.origin+'/work');
      await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
      const result=await page.evaluate(()=>{
        const heading=[...document.querySelectorAll('#launch-live h1')].find(node=>node.textContent.includes('Rights, Realised'));
        const stats=heading?.nextElementSibling;
        return {heading:heading?.textContent,paragraph:stats?.tagName==='P',gap:stats?.getBoundingClientRect().top-heading?.getBoundingClientRect().bottom};
      });
      assert.ok(result.heading);
      assert.equal(result.paragraph,false);
      assert.ok(result.gap>=20&&result.gap<=40,`heading to stats gap ${result.gap}`);
      await page.screenshot({path:`/private/tmp/dehat-186-E2-after-${theme}-${width}.png`});
      console.log(JSON.stringify({theme,width,gapPx:result.gap,paragraph:false}));
      await page.close();
    }
  }finally{await browser.close();await new Promise(resolve=>local.server.close(resolve));}
});
