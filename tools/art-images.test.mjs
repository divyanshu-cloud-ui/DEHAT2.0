// The heavy illustrations are served as sized AVIF/WebP (DEHAT.dc.html ART_SIZES, tools/optimise-art-images.mjs).
// Keeps the page's size table, the generator's table and the files on disk in step.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile, access} from 'node:fs/promises';
import {ART_SIZES, variantBase} from './optimise-art-images.mjs';

test('page and generator agree, and every variant file exists', async () => {
  const source = await readFile('DEHAT.dc.html', 'utf8');
  const page = vm.runInNewContext('(' + source.match(/const ART_SIZES = (\{[\s\S]*?\n\});/)[1] + ')');
  assert.deepEqual(JSON.parse(JSON.stringify(page)), ART_SIZES);
  for (const [key, widths] of Object.entries(ART_SIZES)) {
    await access(`assets/${key}.png`);
    for (const width of widths) for (const ext of ['avif', 'webp']) await access(`assets/${variantBase(key)}-${width}.${ext}`);
  }
});

test('the PNG masters are at least as large as the largest variant (sips -Z sizes the longest side)', async () => {
  const {execFileSync} = await import('node:child_process');
  for (const [key, widths] of Object.entries(ART_SIZES)) {
    const out = execFileSync('/usr/bin/sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', `assets/${key}.png`]).toString();
    const longest = Math.max(Number(out.match(/pixelWidth: (\d+)/)[1]), Number(out.match(/pixelHeight: (\d+)/)[1]));
    assert.ok(longest >= Math.max(...widths), key + ' would be upscaled');
  }
});
