import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

test('one dictionary build is shared and merged copy is cached per language', async () => {
  const source = await readFile('DEHAT.dc.html','utf8');
  const start = source.indexOf('  _mergedDict(');
  const end = source.indexOf('\n  _canonName(',start);
  assert.ok(start > 0 && end > start);
  const diagnostics = {};
  const fixture = vm.runInNewContext('({' + source.slice(start,end).replace('\n  _dict() {', ',\n  _dict() {') + '})',{window:{DEHAT_LAUNCH_DIAGNOSTICS:diagnostics}});
  fixture.state = {lang:'en'};
  const english = fixture._mergedDict();
  assert.equal(fixture._mergedDict(),english);
  assert.equal(english.nav_home,'Home');
  fixture.state.lang = 'hi';
  const hindi = fixture._mergedDict();
  assert.equal(fixture._mergedDict(),hindi);
  assert.notEqual(hindi,english);
  assert.equal(hindi.nav_home,fixture._dict().hi.nav_home);
  assert.equal(diagnostics.dictBuilds,1);
  assert.equal(diagnostics.mergedDictBuilds,2);
});
