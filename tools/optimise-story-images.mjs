import {readdir, mkdir, mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {promisify} from 'node:util';
import {execFile} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const run = promisify(execFile);
const input = new URL('../assets/story/web/', import.meta.url);
const output = new URL('../assets/story/optimized/', import.meta.url);
await mkdir(output, {recursive:true});
const files = (await readdir(input)).filter(name => /^story-\d{3}\.png$/.test(name));
const widths = [480,800,1100]; // 1100 is the source maximum; do not upscale it to 1280.
const jobs = files.flatMap(file => widths.map(width => ({file,width})));
const temporary = await mkdtemp(join(tmpdir(), 'dehat-story-'));
let cursor = 0;
async function worker() {
  while (cursor < jobs.length) {
    const {file,width} = jobs[cursor++];
    const stem = file.slice(0,-4) + '-' + width;
    const resized = join(temporary,stem+'.png');
    const source = fileURLToPath(new URL(file,input));
    await run('/usr/bin/sips',['-Z',String(width),source,'--out',resized]);
    await Promise.all([
      run('/opt/homebrew/bin/cwebp',['-quiet','-q','78',resized,'-o',fileURLToPath(new URL(stem+'.webp',output))]),
      run('/opt/homebrew/bin/avifenc',['-s','8','-q','60','--qalpha','75',resized,fileURLToPath(new URL(stem+'.avif',output))]),
    ]);
  }
}
try {
  await Promise.all(Array.from({length:4},worker));
  console.log(JSON.stringify({sources:files.length,variants:jobs.length*2,widths}));
} finally {
  await rm(temporary,{recursive:true,force:true});
}
