// Sized AVIF/WebP variants for the heaviest illustrations (see ART_SIZES in DEHAT.dc.html, _artCss).
// The PNG masters stay where they are and remain the fallback. Output sits in an "optimized" folder
// beside each master; the four root-level story-*.png cards write to assets/story/optimized/.
// Usage: node tools/optimise-art-images.mjs   (needs macOS sips, cwebp and avifenc, as the other optimisers do)
import {mkdir, mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {promisify} from 'node:util';
import {execFile} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const run = promisify(execFile);
export const ART_SIZES = {
  // 2048 px square masters, displayed at 500 px or less: 1x = 520, 2x = 1040
  'art/prog-sol': [520,1040], 'art/prog-re': [520,1040], 'art/prog-hp': [520,1040], 'art/prog-cj': [520,1040],
  'art/behaviour-change': [520,1040], 'art/demand-generation': [520,1040],
  'art/system-strengthening': [520,1040], 'art/service-delivery': [520,1040],
  'story/fork-planting-together': [520,1040], 'story/fork-relief-basket': [520,1040],
  'story-participation': [520,1040], 'story-development': [520,1040], 'story-protection': [520,1040], 'story-survival': [520,1040],
  // wide banner and page-width illustrations
  'story/ribbon-crowd': [1000,2000],
  'story/sm-school-steps': [450,900],
  'ink/story-1973-cowshed': [620,1240],
};
export const variantBase = key => (key.includes('/') ? key.replace(/\/([^/]+)$/, '/optimized/$1') : 'story/optimized/' + key);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = new URL('../assets/', import.meta.url);
  const temporary = await mkdtemp(join(tmpdir(), 'dehat-art-'));
  const jobs = Object.entries(ART_SIZES).flatMap(([key, widths]) => widths.map(width => ({key, width})));
  let cursor = 0, written = 0;
  const worker = async () => {
    while (cursor < jobs.length) {
      const {key, width} = jobs[cursor++];
      const source = fileURLToPath(new URL(key + '.png', root));
      const base = variantBase(key);
      await mkdir(fileURLToPath(new URL(base.replace(/\/[^/]+$/, '/'), root)), {recursive: true});
      const resized = join(temporary, key.replace(/\//g, '_') + '-' + width + '.png');
      await run('/usr/bin/sips', ['-Z', String(width), source, '--out', resized]);
      await Promise.all([
        run('/opt/homebrew/bin/cwebp', ['-quiet', '-q', '88', '-alpha_q', '95', resized, '-o', fileURLToPath(new URL(base + '-' + width + '.webp', root))]),
        run('/opt/homebrew/bin/avifenc', ['-s', '6', '-q', '68', '--qalpha', '85', resized, fileURLToPath(new URL(base + '-' + width + '.avif', root))]),
      ]);
      written += 2;
    }
  };
  try {
    await Promise.all(Array.from({length: 4}, worker));
    console.log(JSON.stringify({sources: Object.keys(ART_SIZES).length, variants: written}));
  } finally {
    await rm(temporary, {recursive: true, force: true});
  }
}
