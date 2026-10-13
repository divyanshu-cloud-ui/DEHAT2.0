import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

test('counter frames update visible text without rendering the whole page', async () => {
  const source = await readFile('DEHAT.dc.html','utf8');
  const start = source.indexOf('  _fmt(v, c) {');
  const end = source.indexOf('\n  _stories()',start);
  assert.ok(start > 0 && end > start);
  let now = 100, next;
  const methods = source.slice(start,end).replace('\n  _loop() {',',\n  _loop() {');
  const counter = vm.runInNewContext('({' + methods + '})',{
    performance:{now:()=>now},requestAnimationFrame:callback=>{next=callback;return 1;}
  });
  const label = {textContent:'0'};
  const el = {isConnected:true,querySelector:()=>label};
  counter._active = new Map([['r0',{to:100,dec:0,comma:false,prefix:'',suffix:'+',t0:100,el}]]);
  counter._countValues = {};
  counter.setState = () => {throw new Error('Counter must not trigger a full render');};
  counter._loop();
  now = 850;next();
  assert.notEqual(label.textContent,'0');
  now = 1600;next();
  assert.equal(label.textContent,'100+');
  assert.equal(counter._countValues.r0,'100+');
  assert.equal(counter._active.size,0);
});
