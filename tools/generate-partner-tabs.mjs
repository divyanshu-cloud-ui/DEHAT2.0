// Keep the small site-wide navigation labels separate from the 2.6 MB partner dataset.
import {writeFile} from 'node:fs/promises';
import {PARTNER} from '../partner-data.js';

const labels=Object.fromEntries(Object.entries(PARTNER).map(([lang,data])=>[
  lang,{tabs:(data.tabs||[]).map(({k,label})=>({k,label}))},
]));
await writeFile('launch/partner-tabs.mjs',`export const PARTNER_TABS = ${JSON.stringify(labels)};\n`);
