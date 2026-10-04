import test from 'node:test';
import assert from 'node:assert/strict';
import {buildHead,HREFLANG} from '../launch/head.mjs';
import {LANGUAGES,createRouter} from '../launch/routes.mjs';
const router=createRouter([{slug:'one-story'}]);
const seo={title:'DEHAT & Children <All>',description:'Safe "rights" & care',ogImage:'/dehat-og.png'};
const args=route=>({route,seo,origin:'https://dehatindia.org',languages:LANGUAGES,pathFor:router.pathFor});
test('head order, escaping, 28 alternates and large image tags',()=>{
  const result=buildHead(args(router.parseUrl('/ar/impact')));const lines=result.split('\n');
  assert.equal(lines[0],'<title>DEHAT &amp; Children &lt;All&gt;</title>');
  assert.equal(lines[1],'<meta name="description" content="Safe &quot;rights&quot; &amp; care">');
  assert.equal(lines[2],'<link rel="canonical" href="https://dehatindia.org/ar/impact">');
  assert.equal(lines.filter(x=>x.includes('hreflang=')).length,29);
  assert.equal(lines[3],'<link rel="alternate" hreflang="en" href="https://dehatindia.org/impact">');
  assert.equal(lines.at(-1),'<meta name="twitter:image" content="https://dehatindia.org/dehat-og.png">');
  assert.ok(lines.includes('<meta property="og:image:width" content="1200">'));
  assert.equal(buildHead(args(router.parseUrl('/ar/impact'))),result);
  assert.ok(Object.isFrozen(HREFLANG));assert.equal(HREFLANG.brx,'brx');
});
test('story uses article and legal has no alternates',()=>{
  assert.ok(buildHead(args(router.parseUrl('/stories/one-story'))).includes('property="og:type" content="article"'));
  const legal=buildHead(args(router.parseUrl('/privacy-policy/')));
  assert.ok(!legal.includes('hreflang='));assert.ok(legal.includes('property="og:type" content="website"'));
});
test('404 omits canonical and alternates and invalid inputs fail',()=>{
  const missing={...router.parseUrl('/missing'),canonicalPath:'/missing'};
  const tags=buildHead(args(missing));assert.ok(tags.includes('<meta name="robots" content="noindex">'));
  assert.ok(!tags.includes('rel="canonical"'));assert.ok(!tags.includes('hreflang='));
  for(const field of ['title','description','ogImage'])assert.throws(()=>buildHead({...args(router.parseUrl('/')),seo:{...seo,[field]:''}}),TypeError);
  assert.throws(()=>buildHead({...args(router.parseUrl('/')),pathFor:()=> 'bad'}),TypeError);
  assert.throws(()=>buildHead({...args(router.parseUrl('/')),route:{...router.parseUrl('/'),lang:'de'}}),TypeError);
});
