import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,cp,readFile,writeFile,rm} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const source=await readFile(path.join(root,'DEHAT.dc.html'),'utf8');
const fixtures=[
  ['renderer-dictionary',s=>s.replace('<x-dc>','<x-dc>{{ T.fixture_missing }}')],
  ['renderer-partner',s=>s.replace('_partnerView(allProjects, FIN, PROGS) {','_partnerView(allProjects, FIN, PROGS) { /* P.fixture_missing */')],
  ['dictionary-stubs',s=>s.replace('return { en: EN, hi: HI',"EN.fixture_stub='{{ T.hero_cta2 }}'; return { en: EN, hi: HI")],
  ['ledger-span',s=>s.replace('return { en: EN, hi: HI',"EN.fin_twenty_years='twenty'; return { en: EN, hi: HI")],
  ['english-canonical',s=>s.replace('return { en: EN, hi: HI',"EN.fixture_empty=''; return { en: EN, hi: HI")],
  ['template-attributes',s=>s.replace('<x-dc>','<x-dc><span title="Untranslated fixture"></span>')],
  ['roster-csr',s=>s.replaceAll("this._tc('team', sel, 'name'","this._tc('team', sel, 'fixture' ")],
  ['dictionary-parity:hi',s=>s.replace('return { en: EN, hi: HI',"delete HI.hero_cta2; return { en: EN, hi: HI")],
  ['content-parity:ar',s=>s,'content'],
  ['partner-parity:hi',s=>s,'partner'],
];
for(const [gate,mutate,extra] of fixtures)test(`language audit rejects ${gate}`,async()=>{
  const temporary=await mkdtemp(path.join(tmpdir(),'dehat-language-test-'));
  try {
    await cp(path.join(root,'content-i18n'),path.join(temporary,'content-i18n'),{recursive:true});
    await cp(path.join(root,'partner-data.js'),path.join(temporary,'partner-data.js'));
    const altered=mutate(source);if(!extra)assert.notEqual(altered,source,'fixture must mutate the intended source');
    await writeFile(path.join(temporary,'DEHAT.dc.html'),altered);
    if(extra==='content'){
      // Remove a canonical leaf in a translated language, retaining Hindi baseline.
      const target=path.join(temporary,'content-i18n/ar.js');
      await writeFile(target,(await readFile(target,'utf8'))+'\ndelete window.CONTENT_I18N.ar.team.t01.name;');
    }
    if(extra==='partner'){
      const target=path.join(temporary,'partner-data.js');
      await writeFile(target,(await readFile(target,'utf8'))+'\ndelete PARTNER.hi[Object.keys(PARTNER.en)[0]];');
    }
    const run=spawnSync(process.execPath,[path.join(root,'audit_all_28_languages.js'),'--root',temporary],{encoding:'utf8',maxBuffer:4*1024*1024});
    assert.equal(run.status,1,run.stdout+run.stderr);
    assert.ok((run.stdout+run.stderr).includes(gate),run.stdout+run.stderr);
  }finally{await rm(temporary,{recursive:true,force:true});}
});
