// Local six-route Lighthouse fixture. It renders each route once, then serves the
// same readable snapshot plus the live runtime for subsequent mobile measurements.
import {pathToFileURL} from 'node:url';
import {proofServer} from './proof-server.mjs';

const modulePath=process.env.PLAYWRIGHT_MODULE;
if(!modulePath)throw new Error('Set PLAYWRIGHT_MODULE');
const {chromium}=await import(modulePath.startsWith('file:')?modulePath:pathToFileURL(modulePath).href);
const local=await proofServer(process.cwd());
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});
try {
  for(const route of ['/','/hi','/impact','/stories','/finance','/get-involved/give']){
    const page=await browser.newPage({viewport:{width:390,height:844}});
    await page.goto(local.origin+route);
    await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready',null,{timeout:60000});
    const snapshot=await page.evaluate(()=>{
      const head=document.head.cloneNode(true);
      head.querySelectorAll('script,style').forEach(node=>node.remove());
      const css=Array.from(document.styleSheets,sheet=>{try{return Array.from(sheet.cssRules,rule=>rule.cssText).join('\n')}catch{return ''}}).join('\n');
      const body=document.getElementById('launch-live').cloneNode(true);
      body.id='launch-snapshot';body.removeAttribute('inert');body.removeAttribute('aria-hidden');body.className='';
      body.querySelectorAll('[data-reveal]').forEach(node=>{node.style.opacity='1';node.style.transform='none'});
      body.querySelectorAll('[id]').forEach(node=>node.id='snapshot-'+node.id);
      body.querySelectorAll('script').forEach(node=>node.remove());
      return '<!doctype html><html lang="'+document.documentElement.lang+'" dir="'+document.documentElement.dir+'"><head>'+head.innerHTML+'<style>'+css.replace(/<\/style/gi,'<\\/style')+'</style></head><body><div id="launch-live" inert aria-hidden="true"></div>'+body.outerHTML+'<script type="module" src="/launch/bootstrap.mjs"></script></body></html>';
    });
    local.snapshots.set(route,snapshot);
    console.log(JSON.stringify({route,snapshotBytes:Buffer.byteLength(snapshot)}));
    await page.close();
  }
}finally{await browser.close()}
console.log(JSON.stringify({origin:local.origin,ready:true}));
