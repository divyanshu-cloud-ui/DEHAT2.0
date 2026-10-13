// Browser regression: donor typing must stay local until blur, then validate from the committed value.
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from './proof-server.mjs';

const modulePath = process.env.PLAYWRIGHT_MODULE;
if (!modulePath) throw new Error('Set PLAYWRIGHT_MODULE to the installed Playwright entry point');
const {chromium} = await import(modulePath.startsWith('file:') ? modulePath : pathToFileURL(modulePath).href);
const {server,origin} = await proofServer(process.cwd());
const browser = await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});
try {
  const page = await browser.newPage();
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin+'/get-involved/give');
  await page.waitForFunction(()=>window.DEHAT_LAUNCH_DIAGNOSTICS?.phase==='ready',null,{timeout:60000});
  await page.waitForTimeout(1200);
  const name=page.locator('#df-fullName');
  await name.focus();
  await page.waitForTimeout(500);
  const before=await page.evaluate(()=>window.DEHAT_LAUNCH_DIAGNOSTICS.fullRenders);
  await name.type('A donor with twenty chars', {delay:10});
  assert.equal(await name.inputValue(),'A donor with twenty chars');
  const during=await page.evaluate(()=>window.DEHAT_LAUNCH_DIAGNOSTICS.fullRenders);
  assert.equal(during,before,'typing donor name must not render the whole page');
  await name.blur();
  await page.waitForFunction(before=>window.DEHAT_LAUNCH_DIAGNOSTICS.fullRenders>before,during);
  assert.equal(await name.inputValue(),'A donor with twenty chars');
  const afterBlur=await page.evaluate(()=>window.DEHAT_LAUNCH_DIAGNOSTICS.fullRenders);
  await name.fill('');
  await name.blur();
  assert.ok(await page.locator('#df-fullName').locator('xpath=..').locator('[role="alert"]').count(),'required name validation must remain visible after blur');
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({route:'/get-involved/give',characters:25,rendersDuringTyping:during-before,rendersOnBlur:afterBlur-during,requiredValidation:true,errors:errors.length}));
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
