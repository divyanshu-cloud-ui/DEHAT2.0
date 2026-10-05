import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildNotFound} from '../launch/notfound.mjs';
import {buildHead} from '../launch/head.mjs';
import {createRouter,LANGUAGES} from '../launch/routes.mjs';

const copy=JSON.parse(readFileSync(new URL('../launch/notfound-copy.json',import.meta.url)));
const router=createRouter([]);
const labels={nav_home:'Home',nav_work:'Our Work',nav_stories:'Stories',nav_finance:'Transparency',nav_answers:'Answers'};
const origin='https://dehatindia.org';
const render=(lang,custom={})=>{
  const text=(custom.copy||copy).copy[lang]||(custom.copy||copy).copy.en;
  const route=router.parseUrl(lang==='en'?'/missing':`/${lang}/missing`);
  const head=buildHead({route,seo:{title:text.title||copy.copy.en.title,description:text.body?.trim()?text.body:copy.copy.en.body,ogImage:'/dehat-og.png'},origin,languages:LANGUAGES,pathFor:router.pathFor});
  return buildNotFound({lang,copy,labels,pathFor:router.pathFor,head,dir:lang==='ar'?'rtl':'ltr',...custom});
};

test('source copy is unchanged and rendering is pure',()=>{
  const source=new URL('../_internal/launch-inputs/notfound-copy.json',import.meta.url);
  if(existsSync(source)){
    const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
    assert.equal(hash(readFileSync(new URL('../launch/notfound-copy.json',import.meta.url))),hash(readFileSync(source)));
  }else console.log('SKIP: optional _internal/launch-inputs/notfound-copy.json is absent');
  const frozen=structuredClone(copy);
  Object.freeze(frozen);Object.freeze(frozen.copy);Object.freeze(frozen.copy.en);Object.freeze(frozen.links);
  const first=render('en',{copy:frozen});
  assert.equal(render('en',{copy:frozen}),first);
  assert.equal(JSON.stringify(frozen),JSON.stringify(copy));
});

test('all 28 language entries have complete copy without em dashes',()=>{
  assert.equal(Object.keys(copy.copy).length,LANGUAGES.length);
  for(const lang of LANGUAGES)for(const field of ['eyebrow','title','body','ask']){
    const value=copy.copy[lang]?.[field];
    assert.equal(typeof value,'string',`${lang} ${field} type`);
    assert.ok(value.trim(),`${lang} ${field} empty`);
    assert.ok(!value.includes('\u2014'),`${lang} ${field} contains U+2014`);
  }
});

test('French non-breaking spaces survive HTML escaping',()=>{
  const html=render('fr');
  assert.ok(html.includes(copy.copy.fr.ask));
  assert.ok(html.includes('\u00a0?'));
  assert.ok(html.includes('\u00a0:'));
});

test('English and Hindi render exactly the supplied copy and five localized links',()=>{
  for(const lang of ['en','hi']){
    const values=lang==='hi'?{nav_home:'मुख पृष्ठ',nav_work:'हमारा कार्य',nav_stories:'कहानियाँ',nav_finance:'पारदर्शिता',nav_answers:'उत्तर'}:labels;
    const html=render(lang,{labels:values});
    for(const field of ['eyebrow','title','body','ask'])assert.ok(html.includes(copy.copy[lang][field]),`${lang} ${field}`);
    assert.equal((html.match(/<li><a href=/g)||[]).length,5);
    for(const {route_id,label_key} of copy.links)assert.ok(html.includes(`<a href="${router.pathFor(route_id,lang)}">${values[label_key]}</a>`));
    assert.ok(html.includes(`<html lang="${lang}"`));
    assert.ok(html.includes('name="robots" content="noindex"'));
    for(const forbidden of ['rel="canonical"','hreflang=','property="og:url"','<script'])assert.ok(!html.includes(forbidden),forbidden);
  }
});

test('missing translation uses marked English copy while retaining localized links and RTL',()=>{
  const without=structuredClone(copy);delete without.copy.ar;
  const html=render('ar',{copy:without});
  assert.ok(html.includes('<html lang="ar" dir="rtl"'));
  assert.ok(html.includes('<div class="copy" lang="en">'));
  assert.ok(html.includes('<p class="ask" lang="en">'));
  assert.ok(html.includes(copy.copy.en.title));
  assert.ok(html.includes('href="/ar/work"'));
});

test('missing translation fields fall back individually and mark only English elements',()=>{
  const partial=structuredClone(copy);
  delete partial.copy.hi.title;
  partial.copy.hi.body='  ';
  delete partial.copy.hi.ask;
  const html=render('hi',{copy:partial});
  assert.ok(html.includes(`<p class="eyebrow">404 · ${copy.copy.hi.eyebrow}</p>`));
  assert.ok(html.includes(`<h1 lang="en">${copy.copy.en.title}</h1>`));
  assert.ok(html.includes(`<p class="body" lang="en">${copy.copy.en.body}</p>`));
  assert.ok(html.includes(`<p class="ask" lang="en">${copy.copy.en.ask}`));
  assert.ok(!html.includes('undefined'));
});

test('all inserted values are escaped',()=>{
  const altered=structuredClone(copy);
  altered.copy.en={eyebrow:'& < > "',title:'& < > "',body:'& < > "',ask:'& < > "'};
  altered.email='a&"<@example.org';
  const customLabels=Object.fromEntries(Object.keys(labels).map(key=>[key,'& < > "']));
  const html=render('en',{copy:altered,labels:customLabels,pathFor:()=>'/&<">'});
  assert.ok((html.match(/&amp; &lt; &gt; &quot;/g)||[]).length>=9);
  assert.ok(html.includes('href="/&amp;&lt;&quot;&gt;"'));
  assert.ok(html.includes('mailto:a&amp;&quot;&lt;@example.org'));
  assert.ok(!html.includes('<script'));
});

test('invalid language, English copy, labels and paths throw',()=>{
  assert.throws(()=>render('xx'),TypeError);
  for(const field of ['eyebrow','title','body','ask']){
    const bad=structuredClone(copy);delete bad.copy.en[field];
    assert.throws(()=>render('en',{copy:bad}),TypeError);
  }
  for(const email of [undefined,'','  ']){
    const bad=structuredClone(copy);bad.email=email;
    assert.throws(()=>render('en',{copy:bad}),TypeError);
  }
  for(const key of Object.keys(labels)){
    const bad={...labels,[key]:''};assert.throws(()=>render('en',{labels:bad}),TypeError);
  }
  assert.throws(()=>render('en',{pathFor:()=> 'wrong'}),TypeError);
});
