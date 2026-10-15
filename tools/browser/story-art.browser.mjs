import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';
import {renderSite} from '../site-browser.mjs';

const stories = [
  ['sixteen-girls-and-a-truck','story-001'],
  ['the-right-to-play','story-002'],
  ['a-friend-who-noticed','story-003'],
  ['the-boy-who-could-not-speak','story-004'],
  ['the-classroom-came-to-her','story-005'],
  ['the-first-girl-to-varanasi','story-006'],
];

test('six story illustrations load at desktop and phone widths and survive pre-rendering', async () => {
  if (!process.env.PLAYWRIGHT_MODULE) throw new Error('Set PLAYWRIGHT_MODULE');
  const modulePath=process.env.PLAYWRIGHT_MODULE;
  const {chromium}=await import(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href);
  const local=await proofServer(process.cwd());
  const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
  try {
    for(const width of [1280,390]){
      const page=await browser.newPage({viewport:{width,height:width===390?844:800},reducedMotion:'reduce'});
      await page.addInitScript(()=>localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}})));
      for(const [slug,art] of stories){
        const response=await page.goto(local.origin+'/stories/'+slug);
        assert.equal(response.status(),200);
        await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready');
        const result=await page.locator('.story-art-plate img').evaluate(async image=>{
          await image.decode();
          return {src:image.currentSrc,naturalWidth:image.naturalWidth,status:(await fetch(image.currentSrc)).status};
        });
        assert.match(result.src,new RegExp(art),`${slug} ${width} has the wrong art`);
        assert.equal(result.status,200,`${slug} ${width} asset status`);
        assert.ok(result.naturalWidth>0,`${slug} ${width} asset did not decode`);
        console.log(JSON.stringify({slug,width,status:result.status,naturalWidth:result.naturalWidth}));
      }
      await page.close();
    }
    const routes=stories.map(([slug])=>({path:'/stories/'+slug}));
    await renderSite(process.cwd(),routes,{concurrency:2,serve:async()=>local,launchBrowser:async()=>{
      await browser.close();
      return chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
    },onPage:async(route,snapshot)=>{
      local.snapshots.set(route.path,snapshot);
      const html=await (await fetch(local.origin+route.path)).text();
      const art=stories.find(([slug])=>route.path.endsWith(slug))[1];
      assert.match(html,/story-art-plate/,`${route.path} missing art element`);
      assert.match(html,new RegExp(`assets/story/[^"<>]*${art}-480.avif`),`${route.path} raw HTML omits responsive art`);
      console.log(JSON.stringify({prebuilt:route.path,imageUrlInHtml:true,bytes:Buffer.byteLength(html)}));
    }});
  } finally {
    if(browser.isConnected())await browser.close();
    if(local.server.listening)await new Promise(resolve=>local.server.close(resolve));
  }
});
