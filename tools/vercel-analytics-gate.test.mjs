import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const source=await readFile(new URL('../DEHAT.dc.html',import.meta.url),'utf8');
const start=source.indexOf('  _vercelAnalyticsGate() {');
const end=source.indexOf("\n  // Microsoft Clarity: only with",start);
assert.ok(start>=0 && end>start,'Vercel Web Analytics gate is present');

function harness({hostname='dehatindia.org',webdriver=false,lang='en'}={}){
  const scripts=[];
  const window={location:{hostname}};
  const document={createElement:tag=>({tagName:tag}),head:{appendChild:el=>scripts.push(el)}};
  const gate=vm.runInNewContext('({'+source.slice(start,end)+'})',{window,document,navigator:{webdriver}})._vercelAnalyticsGate;
  const app={state:{ckDecided:false,ckPrefs:{performance:false},lang,view:'home'}};
  return {app,window,scripts,run:()=>gate.call(app)};
}
const consent=h=>{h.app.state.ckDecided=true;h.app.state.ckPrefs.performance=true;};
const send=(h,event={url:'https://dehatindia.org/'})=>{
  const queued=h.window.vaq.find(args=>args[0]==='beforeSend');
  return queued[1](event);
};

test('no script before the visitor gives performance consent',()=>{
  const h=harness();
  h.run();
  assert.equal(h.scripts.length,0);
  h.app.state.ckDecided=true;
  h.run();
  assert.equal(h.scripts.length,0,'a decision without performance consent is not enough');
});

test('with consent the script loads once from the site itself and sets no cookie',()=>{
  const h=harness();
  consent(h);
  h.run();h.run();h.run();
  assert.equal(h.scripts.length,1);
  assert.equal(h.scripts[0].src,'/_vercel/insights/script.js');
  assert.equal(h.scripts[0].defer,true);
  assert.deepEqual(send(h),{url:'https://dehatindia.org/'});
});

test('it stays off outside en and hi, off the live domain, and for automation',()=>{
  for(const options of [{lang:'fr'},{lang:'ta'},{hostname:'127.0.0.1'},{hostname:'dehat-preview.vercel.app'},{webdriver:true}]){
    const h=harness(options);
    consent(h);
    h.run();
    assert.equal(h.scripts.length,0,JSON.stringify(options));
  }
  const www=harness({hostname:'www.dehatindia.org',lang:'hi'});
  consent(www);www.run();
  assert.equal(www.scripts.length,1,'hindi on the www host is allowed');
});

test('events are dropped on the donation and finance views and after consent is withdrawn',()=>{
  const h=harness();
  consent(h);
  h.run();
  for(const view of ['involved','finance']){
    h.app.state.view=view;h.run();
    assert.equal(send(h),null,view);
  }
  h.app.state.view='home';h.run();
  assert.notEqual(send(h),null);
  h.app.state.ckPrefs.performance=false;h.run();
  assert.equal(send(h),null,'withdrawn consent sends nothing');
  assert.equal(h.scripts.length,1,'the script is not injected a second time');
});
