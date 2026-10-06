// Print the raw production 404 response from the local Build Output server.
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {serveSiteOutput} from './serve-site-output.mjs';

const run=promisify(execFile);
const context={window:{}};
vm.runInNewContext(await readFile('stories-data.js','utf8'),context);
const slug=context.window.STORIES[0]?.slug;
if(!slug)throw new Error('No published story slug for 404 probe');
const local=await serveSiteOutput(path.resolve('.vercel/output'));
try{
  const url=`${local.origin}/or/stories/${slug}`;
  const {stdout}=await run('curl',['-i','--silent','--show-error','--max-time','10',url]);
  console.log(`$ curl -i ${url}`);
  console.log(stdout);
  if(!/^HTTP\/1\.1 404\b/m.test(stdout)||!/^x-robots-tag: noindex\s*$/im.test(stdout)||!/<html lang="or"/.test(stdout))throw new Error('Localized 404 response is incomplete');
}finally{await new Promise(resolve=>local.server.close(resolve));}
