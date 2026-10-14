import {mkdir, writeFile} from 'node:fs/promises';
import {PARTNER} from '../partner-data.js';

await mkdir(new URL('../launch/partner/', import.meta.url), {recursive:true});
for (const [lang, value] of Object.entries(PARTNER)) {
  if (!/^[a-z]{2,3}$/.test(lang)) throw new Error(`Invalid partner language: ${lang}`);
  await writeFile(new URL(`../launch/partner/${lang}.mjs`, import.meta.url),
    'export const DATA = ' + JSON.stringify(value).replaceAll('<', '\\u003c') + ';\n');
}
