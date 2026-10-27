import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const source=await readFile(new URL('../DEHAT.dc.html',import.meta.url),'utf8');
const start=source.indexOf('  _ga4Gate() {');
const end=source.indexOf("\n  // Vercel Web Analytics:",start);
assert.ok(start>=0 && end>start,'GA4 gate is present');
const ID='G-V1L3E98G1N';

function harness({hostname='dehatindia.org',webdriver=false,lang='en',pathname='/'}={}){
  const scripts=[];const timers=[];
  const window={location:{hostname,pathname,origin:'https://'+hostname}};
  const document={title:'DEHAT',cookie:'',createElement:tag=>({tagName:tag,dataset:{}}),head:{appendChild:el=>scripts.push(el)}};
  const gate=vm.runInNewContext('({'+source.slice(start,end)+'})',{window,document,navigator:{webdriver},setTimeout:fn=>timers.push(fn)})._ga4Gate;
  const app={state:{ckDecided:false,ckPrefs:{performance:false},lang,view:'home'}};
  return {app,window,scripts,timers,run:()=>gate.call(app)};
}
const consent=h=>{h.app.state.ckDecided=true;h.app.state.ckPrefs.performance=true;};
const events=h=>(h.window.dataLayer||[]).map(a=>Array.from(a));

test('no tag before performance consent',()=>{
  const h=harness();h.run();
  assert.equal(h.scripts.length,0);
  h.app.state.ckDecided=true;h.run();
  assert.equal(h.scripts.length,0);
  assert.equal(h.window['ga-disable-'+ID],true);
});

test('with consent the tag loads once, with signals and personalisation off and no automatic page view',()=>{
  const h=harness();consent(h);
  h.run();h.run();h.run();
  assert.equal(h.scripts.length,1);
  assert.equal(h.scripts[0].src,'https://www.googletagmanager.com/gtag/js?id='+ID);
  const cfg=events(h).find(e=>e[0]==='config');
  assert.equal(cfg[1],ID);
  assert.deepEqual({...cfg[2]},{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false});
  assert.equal(h.window['ga-disable-'+ID],false);
  const def=events(h).find(e=>e[0]==='consent'&&e[1]==='default');
  assert.equal(def[2].ad_storage,'denied');
  assert.equal(def[2].analytics_storage,'denied');
});

test('stays off outside en and hi, off the live domain, and for automation',()=>{
  for(const o of [{lang:'fr'},{lang:'ta'},{hostname:'127.0.0.1'},{hostname:'dehat-preview.vercel.app'},{webdriver:true}]){
    const h=harness(o);consent(h);h.run();
    assert.equal(h.scripts.length,0,JSON.stringify(o));
  }
  const www=harness({hostname:'www.dehatindia.org',lang:'hi'});consent(www);www.run();
  assert.equal(www.scripts.length,1);
});

test('one page view per path, sent after the page settles, never on donation or finance views',()=>{
  const h=harness({pathname:'/impact'});consent(h);
  h.run();h.run();
  assert.equal(h.timers.length,1);
  h.timers[0]();
  const pv=events(h).filter(e=>e[0]==='event'&&e[1]==='page_view');
  assert.equal(pv.length,1);
  assert.equal(pv[0][2].page_path,'/impact');
  h.window.location.pathname='/work';h.run();h.timers[1]();
  assert.equal(events(h).filter(e=>e[1]==='page_view').length,2);
  h.app.state.view='involved';h.window.location.pathname='/get-involved/give';h.run();
  assert.equal(h.window['ga-disable-'+ID],true);
  assert.equal(h.timers.length,2,'no page view is queued on the donation view');
  assert.equal(events(h).filter(e=>e[0]==='consent').at(-1)[2].analytics_storage,'denied');
});

test('withdrawing consent disables collection and clears the Google cookies',()=>{
  const h=harness();consent(h);h.run();
  h.app.state.ckPrefs.performance=false;h.run();
  assert.equal(h.window['ga-disable-'+ID],true);
  assert.equal(events(h).filter(e=>e[0]==='consent').at(-1)[2].analytics_storage,'denied');
});

test('the cookie wording in English and Hindi names Google Analytics',()=>{
  const n=(source.match(/Google Analytics also counts page views/g)||[]).length;
  assert.equal(n,2);
  assert.equal((source.match(/Google Analytics भी पेज व्यू गिनता है/g)||[]).length,2);
});
