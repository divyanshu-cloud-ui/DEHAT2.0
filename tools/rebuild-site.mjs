// One-command clean production rebuild and local acceptance run.
import path from 'node:path';
import {homedir} from 'node:os';
import {existsSync} from 'node:fs';
import {spawn} from 'node:child_process';

const candidates=[
  process.env.PLAYWRIGHT_MODULE,
  path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'),
].filter(Boolean);
const playwright=candidates.find(existsSync);
const chrome=process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if(!playwright||!existsSync(chrome))throw new Error('Playwright or Chrome is unavailable. Set PLAYWRIGHT_MODULE and CHROME_PATH to installed paths.');
const env={...process.env,PLAYWRIGHT_MODULE:playwright,CHROME_PATH:chrome};
async function step(args){
  console.log(`$ ${process.execPath} ${args.join(' ')}`);
  const child=spawn(process.execPath,args,{cwd:process.cwd(),env,stdio:'inherit'});
  const status=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',(code,signal)=>resolve({code,signal}));});
  console.log(`[exit ${status.code??status.signal}]`);
  return status.code===0;
}
if(!await step(['--test','tools/site-links.test.mjs']))process.exit(1);
if(!await step(['tools/probe-site-route.mjs','/finance']))process.exit(1);
if(!await step(['tools/generate-site.mjs']))process.exit(1);
const verified=await step(['tools/verify-site.mjs']);
const probed=await step(['tools/probe-site-http.mjs']);
if(!verified||!probed)process.exitCode=1;
