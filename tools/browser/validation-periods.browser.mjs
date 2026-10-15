import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('validation cards name their historical periods accurately', async () => {
  if (!process.env.PLAYWRIGHT_MODULE) throw new Error('Set PLAYWRIGHT_MODULE');
  const spec = process.env.PLAYWRIGHT_MODULE;
  const {chromium} = await import(spec.startsWith('file:') ? spec : pathToFileURL(spec).href);
  const local = await proofServer(process.cwd());
  const browser = await chromium.launch({headless:true,...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
  try {
    for (const theme of ['light','dark']) for (const width of [375,1280]) {
      const page = await browser.newPage({viewport:{width,height:800},reducedMotion:'reduce'});
      await page.addInitScript(value => {
        localStorage.setItem('dehat.consent',JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}}));
        localStorage.setItem('dehat.theme',value);
      },theme);
      await page.goto(local.origin+'/finance');
      await page.waitForFunction(() => window.DEHAT_LAUNCH_DIAGNOSTICS?.phase === 'ready');
      const titles=['CAF India Validation Certificate','Tata Institute of Social Sciences Empanelment Certificate','BSE Sammaan Listing'];
      const cards=await Promise.all(titles.map(async title => {
        const text=await page.getByText(title,{exact:true}).evaluate(node => {
          let card=node;
          while(card && (!card.innerText?.includes('PDF') || !/(Validated|Empanelled|Registered|Listed organisation)/.test(card.innerText))) card=card.parentElement;
          return card?.innerText || node.parentElement?.innerText || '';
        });
        return {title,period:text.match(/Validated[^\n]*|Empanelled[^\n]*|Registered 2018|Listed organisation/)?.[0]||'',text};
      }));
      const section=page.getByText('CAF India Validation Certificate',{exact:true});
      await section.scrollIntoViewIfNeeded();
      await page.screenshot({path:`/private/tmp/dehat-186-0f-${process.env.CAPTURE_BEFORE?'before':'after'}-${theme}-${width}.png`});
      console.log(JSON.stringify({theme,width,cards:cards.map(({title,period})=>({title,period}))}));
      if (!process.env.CAPTURE_BEFORE) {
        assert.match(cards[0].text,/Validated 2021–2022/);
        assert.match(cards[1].text,/Empanelled 2015–2018/);
        assert.match(cards[2].text,/Registered 2018/);
        assert.match(cards[2].text,/Registered on the BSE Sammaan platform/);
        assert.ok(!cards[2].text.includes('Listed on the BSE Sammaan platform'));
      }
      await page.close();
    }
  } finally {
    await browser.close();
    await new Promise(resolve=>local.server.close(resolve));
  }
});
