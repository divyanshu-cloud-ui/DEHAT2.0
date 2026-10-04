import test from 'node:test';
import assert from 'node:assert/strict';
import {runtimeTemplate} from './proof-server.mjs';
test('proof defers below-fold artwork but preserves hero and script content',()=>{
  const source='<x-dc><div class="hr-art" style="background-image:{{ hero.cur.imgCss }}"></div><div class="art" style="height:20px;background-image:{{ p.imgCss }},var(--plate);background-size:contain"></div><button onClick="{{ goMedia }}">Media</button><button onClick="{{ filter }}">Filter</button></x-dc><script>const a="background-image:{{ untouched }}";</script>';
  const result=runtimeTemplate(source);
  assert.ok(result.includes('class="hr-art" style="background-image:{{ hero.cur.imgCss }}"'));
  assert.ok(result.includes('data-launch-background="{{ p.imgCss }},var(--plate)"'));
  assert.ok(result.includes('href="{{ launchPaths.media }}"'));
  assert.ok(result.includes('<button onClick="{{ filter }}">'));
  assert.ok(result.endsWith('<script>const a="background-image:{{ untouched }}";</script>'));
});
