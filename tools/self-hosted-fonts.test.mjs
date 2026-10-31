import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync,readFileSync} from 'node:fs';
import {FONT_FACES} from '../launch/self-hosted-fonts.mjs';
import {publicAsset} from './package-launch.mjs';

const THIRD_PARTY_ASSET_HOSTS=/fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net|unpkg\.com/;
const atlas=readFileSync('district-map.html','utf8');

test('FONT_FACES matches the @font-face rules in DEHAT.dc.html',()=>{
 const html=readFileSync('DEHAT.dc.html','utf8');
 const style=html.slice(html.indexOf('<style>'),html.indexOf('</style>'));
 const declared=[...style.matchAll(/@font-face \{([^}]*)\}/g)].map(([,body])=>({
  family:body.match(/font-family: '([^']+)'/)[1],style:body.match(/font-style: (\w+)/)[1],
  file:body.match(/url\(\.\/([^)]+)\)/)[1],range:body.match(/unicode-range: ([^;]+);/)[1]}));
 assert.deepEqual(FONT_FACES.map(({family,style,file,range})=>({family,style,file,range})),declared);
 for(const face of FONT_FACES){assert.ok(existsSync(face.file),face.file);assert.ok(publicAsset(face.file),face.file);}
});

test('the district atlas loads fonts, libraries and map data only from this site',()=>{
 assert.doesNotMatch(atlas,THIRD_PARTY_ASSET_HOSTS);
 const fonts=[...atlas.matchAll(/url\(\/(assets\/fonts\/web\/[^)]+)\)/g)].map(m=>m[1]);
 assert.equal(fonts.length,6);
 for(const file of fonts)assert.ok(FONT_FACES.some(face=>face.file===file),file);
 const vendor=[...atlas.matchAll(/["'](\/assets\/vendor\/[^"']+)["']/g)].map(m=>m[1].slice(1));
 assert.deepEqual(vendor.map(f=>f.replace(/-[a-f0-9]{16}\./,'.')).sort(),
  ['assets/vendor/d3-7.9.0.js','assets/vendor/topojson-client-3.1.0.js','assets/vendor/world-atlas-2.0.2-countries-110m.json']);
 for(const file of vendor){
  const bytes=readFileSync(file);
  assert.ok(publicAsset(file),file);
  assert.equal(file.match(/-([a-f0-9]{16})\.\w+$/)[1],createHash('sha256').update(bytes).digest('hex').slice(0,16),file);
 }
 // The two scripts keep their original subresource-integrity hashes, which must still match the files.
 const scripts=[...atlas.matchAll(/<script src="\/(assets\/vendor\/[^"]+)" integrity="([^"]+)"><\/script>/g)];
 assert.equal(scripts.length,2);
 for(const [,file,integrity] of scripts)
  assert.equal(integrity,'sha384-'+createHash('sha384').update(readFileSync(file)).digest('base64'),file);
});
