import test from 'node:test';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {proofServer} from '../proof-server.mjs';

test('news, awards and stories keep distinct, readable accent hues in both themes', async () => {
  if (!process.env.PLAYWRIGHT_MODULE) throw new Error('Set PLAYWRIGHT_MODULE');
  const path = process.env.PLAYWRIGHT_MODULE;
  const {chromium} = await import(path.startsWith('file:') ? path : pathToFileURL(path).href);
  const local = await proofServer(process.cwd());
  const browser = await chromium.launch({headless:true, ...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {})});
  try {
    for (const theme of ['dark','light']) {
      const page = await browser.newPage({viewport:{width:1280,height:800},reducedMotion:'reduce'});
      await page.addInitScript(value => {
        localStorage.setItem('dehat.consent', JSON.stringify({v:1,prefs:{performance:false,functional:false,targeting:false}}));
        localStorage.setItem('dehat.theme', value);
      }, theme);
      for (const route of ['/','/impact','/stories']) {
        await page.goto(local.origin + route);
        await page.waitForFunction(() => window.DEHAT_LAUNCH_DIAGNOSTICS?.phase === 'ready');
        const data = await page.evaluate(route => {
          const rgb = s => {
            if (String(s).startsWith('#')) return [1,3,5].map(i => parseInt(s.slice(i,i+2),16));
            const m = String(s).match(/^(?:rgba?\(|color\(srgb\s+)([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
            if (!m) throw new Error(`Unparseable colour ${s}`);
            const scale = s.startsWith('color(') ? 255 : 1;
            return [Number(m[1])*scale,Number(m[2])*scale,Number(m[3])*scale];
          };
          const hex = h => [1,3,5].map(i => parseInt(h.slice(i,i+2),16));
          const hue = c => {
            const [r,g,b] = c.map(v => v/255), mx=Math.max(r,g,b), mn=Math.min(r,g,b), d=mx-mn;
            if (!d) return 0;
            return (60*(mx===r?((g-b)/d)%6:mx===g?(b-r)/d+2:(r-g)/d+4)+360)%360;
          };
          const lum = c => c.map(v => v/255).map(v => v<=.04045?v/12.92:((v+.055)/1.055)**2.4)
            .reduce((sum,v,i) => sum+v*[.2126,.7152,.0722][i],0);
          const ratio = (a,b) => (Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
          const surface = rgb(getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() || getComputedStyle(document.querySelector('.face-card, [data-spine="Recognition"]')).backgroundColor);
          const items=[];
          const add=(el,source,label,bg=surface,min=4.5) => {
            const c=rgb(getComputedStyle(el).color), h=hue(c), expected=hue(hex(source));
            const distance=Math.min(Math.abs(h-expected),360-Math.abs(h-expected));
            items.push({label,color:getComputedStyle(el).color,distance:+distance.toFixed(2),contrast:+ratio(c,bg).toFixed(2),min});
          };
          if(route==='/'){
            const palette=['#0E5565','#D2305C','#556223','#EAAE28','#4F0E73','#0E5565'];
            const cards=[...document.querySelectorAll('[data-spine="In the News"] a[style*="scroll-snap-align"][target="_blank"]')];
            cards.forEach((card,i)=>{
              const banner=card.firstElementChild;
              const tint=getComputedStyle(banner).backgroundColor;
              const values=[...tint.matchAll(/[\d.]+/g)].map(m=>Number(m[0]));
              const bg=values.length===4?values.slice(0,3).map((v,j)=>v*values[3]+surface[j]*(1-values[3])):rgb(tint);
              const spans=banner.querySelectorAll('span');
              if (!spans[1]) throw new Error(banner.outerHTML.slice(0,1000));
              add(spans[0],palette[i%palette.length],`news ${i} publisher`,bg);
              add(spans[1],palette[i%palette.length],`news ${i} year`,bg,3);
            });
          }else if(route==='/impact'){
            const palette=['#4F0E73','#A92719','#0E5565','#D2305C','#EAAE28','#556223','#EAAE28','#D2305C','#556223','#4F0E73'];
            const years=[...document.querySelectorAll('[data-spine="Recognition"] span')].filter(e=>/^20\d\d$/.test(e.textContent.trim()) && e.style.fontSize==='16px' && !!e.style.color).slice(0,10);
            years.forEach((el,i)=>add(el,palette[i],`award ${i}`));
          }else{
            const cards=[...document.querySelectorAll('.face-card')];
            cards.forEach((card,i)=>add(card.querySelector('.face-card-person + span'),window.STORIES[i].color,`story ${i}`));
          }
          return items;
        },route);
        const expected = route==='/' ? 16 : route==='/impact' ? 10 : 24;
        assert.equal(data.length,expected,`${theme} ${route} item count`);
        for(const item of data){
          assert.ok(item.distance<=15,`${theme} ${route} ${item.label} hue shifted ${item.distance}°: ${item.color}`);
          assert.ok(item.contrast>=item.min,`${theme} ${route} ${item.label} contrast ${item.contrast}: ${item.color}`);
        }
        if(route==='/') assert.ok(new Set(data.filter(d=>d.label.includes('publisher')).map(d=>d.color)).size>=4,'press publishers lost their palette');
        console.log(JSON.stringify({theme,route,accentItems:data.length,minContrast:Math.min(...data.map(i=>i.contrast)),maxHueShift:Math.max(...data.map(i=>i.distance))}));
      }
      await page.close();
    }
  } finally {
    await browser.close();
    await new Promise(resolve=>local.server.close(resolve));
  }
});
