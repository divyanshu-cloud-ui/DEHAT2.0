import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const source=await readFile(new URL('../DEHAT.dc.html',import.meta.url),'utf8');
const start=source.indexOf('  _clarityGate() {');
const end=source.indexOf('\n  // Only load Ads measurement',start);
assert.ok(start>=0 && end>start,'Clarity gate is present');
const plain=value=>JSON.parse(JSON.stringify(value));

function harness(){
  const calls=[];
  const insertions=[];
  const cookieWrites=[];
  const cookies=new Map();
  const window={location:{hostname:'dehatindia.org'}};
  const document={
    querySelectorAll:()=>[],
    createElement:tag=>({tagName:tag}),
    getElementsByTagName:()=>[{parentNode:{insertBefore:script=>{
      insertions.push(script.src);
      window.clarity=(...args)=>calls.push(args);
    }}}],
    get cookie(){return [...cookies].map(([key,value])=>`${key}=${value}`).join('; ');},
    set cookie(value){
      cookieWrites.push(value);
      const [pair]=value.split(';');
      const index=pair.indexOf('=');
      const name=pair.slice(0,index);
      if(/Max-Age=0|expires=Thu, 01 Jan 1970/i.test(value))cookies.delete(name);
      else cookies.set(name,pair.slice(index+1));
    },
  };
  const navigator={webdriver:false};
  const gate=vm.runInNewContext('({'+source.slice(start,end)+'})',{window,document,navigator})._clarityGate;
  const app={state:{ckDecided:false,ckPrefs:{performance:false},lang:'en',view:'home'}};
  const run=()=>gate.call(app);
  return {app,run,calls,insertions,cookieWrites,cookies,window};
}

test('Clarity withdrawal denies consent, stops recording and removes both site cookies',async()=>{
  const h=harness();
  h.run();
  assert.equal(h.insertions.length,0,'no tracking before consent');
  h.app.state.ckDecided=true;
  h.app.state.ckPrefs.performance=true;
  h.run();
  assert.equal(h.insertions.length,1);
  assert.deepEqual(plain(h.calls.at(-2)),['consentv2',{ad_Storage:'granted',analytics_Storage:'granted'}]);
  assert.deepEqual(h.calls.at(-1),['start']);
  h.cookies.set('_clck','visitor');h.cookies.set('_clsk','session');
  h.app.state.ckPrefs.performance=false;
  h.run();
  assert.deepEqual(plain(h.calls.at(-2)),['consentv2',{ad_Storage:'denied',analytics_Storage:'denied'}]);
  assert.deepEqual(h.calls.at(-1),['stop']);
  assert.equal(h.cookies.has('_clck'),false);
  assert.equal(h.cookies.has('_clsk'),false);
  for(const name of ['_clck','_clsk']){
    const writes=h.cookieWrites.filter(value=>value.startsWith(`${name}=`));
    assert.equal(writes.length,3,`${name} expires host-only and both domain forms`);
    assert.ok(writes.every(value=>value.includes('path=/')&&value.includes('Max-Age=0')));
  }
  const insertionsAfterWithdrawal=h.insertions.length;
  await new Promise(resolve=>setTimeout(resolve,5000));
  assert.equal(h.insertions.length,insertionsAfterWithdrawal,'zero new Clarity requests for five seconds');
});

test('a donation route stops an accepted session, clears only its session cookie, and resumes later',()=>{
  const h=harness();
  h.app.state.ckDecided=true;h.app.state.ckPrefs.performance=true;
  h.app.state.view='involved';h.run();
  assert.equal(h.insertions.length,0,'do not load Clarity on a donation route');
  h.app.state.view='home';h.run();
  h.cookies.set('_clck','visitor');h.cookies.set('_clsk','session');
  h.app.state.view='finance';h.run();
  assert.deepEqual(plain(h.calls.at(-2)),['consentv2',{ad_Storage:'denied',analytics_Storage:'denied'}]);
  assert.deepEqual(h.calls.at(-1),['stop']);
  assert.equal(h.cookies.has('_clck'),true,'the visitor cookie remains with Performance enabled');
  assert.equal(h.cookies.has('_clsk'),false,'the donation session cookie is cleared');
  h.app.state.view='home';h.run();
  assert.deepEqual(plain(h.calls.at(-2)),['consentv2',{ad_Storage:'granted',analytics_Storage:'granted'}]);
  assert.deepEqual(h.calls.at(-1),['start']);
});
