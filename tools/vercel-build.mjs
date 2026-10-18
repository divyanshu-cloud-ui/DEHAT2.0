// Vercel build entry for the production site: node tools/vercel-build.mjs
//
// Vercel's build machines are Amazon Linux 2023 and have no Chrome. @sparticuz/chromium ships a Chromium that runs
// there. The site tools launch Chrome with only an executable path (no extra flags) and the build user is root, so a
// small wrapper script adds the flags root needs. The wrapper is the CHROME_PATH the tools see; no tool code changes.
//
// It then runs the normal rebuild (tests, route probe, generate, verify, HTTP probe). Any failure fails the build, so a
// broken site never replaces the live one. The result is Build Output API v3 in .vercel/output, which Vercel deploys.
import {chmodSync,writeFileSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

if(process.platform!=='linux'){
  console.error('tools/vercel-build.mjs is for Vercel\'s Linux build machines. On a Mac or CI runner use: node tools/rebuild-site.mjs');
  process.exit(2);
}

const {default:chromium}=await import('@sparticuz/chromium');
const executable=await chromium.executablePath();
const inherited=['LD_LIBRARY_PATH','FONTCONFIG_PATH','HOME'].filter(name=>process.env[name]).map(name=>`export ${name}="${process.env[name]}"`);
const wrapper='/tmp/dehat-chrome.sh';
writeFileSync(wrapper,['#!/bin/sh',...inherited,`exec "${executable}" --no-sandbox --disable-setuid-sandbox --disable-gpu --disable-dev-shm-usage "$@"`,''].join('\n'));
chmodSync(wrapper,0o755);

const env={
  ...process.env,
  CHROME_PATH:wrapper,
  PLAYWRIGHT_MODULE:fileURLToPath(import.meta.resolve('playwright-core')),
};
console.log(`vercel-build: Chrome wrapper ${wrapper} -> ${executable}`);
console.log(`vercel-build: Playwright ${env.PLAYWRIGHT_MODULE}`);

const child=spawn(process.execPath,['tools/rebuild-site.mjs'],{env,stdio:'inherit'});
child.on('exit',(code,signal)=>process.exit(code??(signal?1:0)));
