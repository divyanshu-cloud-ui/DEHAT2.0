import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {PROFILES} from '../who-profiles.js';

test('eight home identity snapshots match the public Who roster',()=>{
  const source=readFileSync(new URL('../DEHAT.dc.html',import.meta.url),'utf8');
  const body=source.match(/this\._homeProfiles\s*=\s*\{([\s\S]*?)\}\);/)?.[1];
  assert.ok(body,'Home identity snapshot exists');
  const home=vm.runInNewContext('({' + body + '})');
  assert.equal(Object.keys(home).length,8);
  for(const [id,identity] of Object.entries(home)) for(const field of ['name','role','place','joined'])
    assert.equal(identity[field],PROFILES[id]?.[field],`${id}.${field} matches who-profiles.js`);
});
