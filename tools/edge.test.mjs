import test from 'node:test';import assert from 'node:assert/strict';
import {buildRoutes,omittedRedirects,CSP_SOURCES} from '../launch/edge.mjs';
const origin='https://dehatindia.org';const redirects=[
 {source:'/old',destination:'/impact',status:301},
 {source:'/gone.php',destination:'',status:410},
 {source:'/facebook',destination:'https://www.facebook.com/dehatorgindia/',status:301},
 {source:'/outside',destination:'/work',status:301},
];
const documents=[{path:'/',file:'index.html'},{path:'/impact',file:'impact/index.html'},{path:'/privacy-policy/',file:'privacy-policy/index.html'}];
const publishedPaths=new Set(['/', '/impact','/privacy-policy/','/robots.txt','/sitemap.xml','/dehat-og.png']);
const inputs={origin,redirects,routes:documents,publishedPaths,files:['index.html'],apis:[{path:'/api/paypal/config'}]};
const matching=(rules,path,host='dehatindia.org')=>rules.filter(r=>r.src&&new RegExp(r.src).test(path)&&(!r.has||r.has.every(h=>h.type!=='host'||new RegExp(h.value).test(host))));
test('preview has noindex, security and appropriate status rules',()=>{
 const before=JSON.stringify(inputs);const rules=buildRoutes({...inputs,mode:'preview'});
 assert.equal(rules[0].headers['X-Robots-Tag'],'noindex, nofollow');
 assert.ok(rules.some(r=>r.status===410&&new RegExp(r.src).test('/gone.php')));
 assert.ok(!rules.some(r=>r.status===301&&new RegExp(r.src).test('/outside')));
 assert.ok(rules.some(r=>r.status===301&&r.headers.Location.startsWith('https://www.facebook.com')));
 assert.ok(rules.some(r=>r.dest==='/impact/index.html'&&new RegExp(r.src).test('/impact')));
 assert.deepEqual(rules.at(-2),{handle:'filesystem'});assert.deepEqual(rules.at(-1),{src:'.*',status:404});
 assert.equal(omittedRedirects({...inputs,mode:'preview'}).length,1);
 assert.equal(JSON.stringify(inputs),before);assert.deepEqual(buildRoutes({...inputs,mode:'preview'}),rules);
});
test('normalisation covers explicit aliases, locale prefixes and legal slash',()=>{
 const rules=buildRoutes({...inputs,mode:'preview'});
 const redirect=path=>matching(rules,path).find(r=>r.status===301);
 assert.equal(redirect('/DEHAT.dc.html').headers.Location,'/');
 assert.equal(redirect('/get-involved').headers.Location,'/get-involved/case');
 assert.equal(redirect('/programmes').headers.Location,'/work');
 assert.equal(redirect('/ar/get-involved').headers.Location,'/$1/get-involved/case');
 assert.equal(redirect('/brx/programmes').headers.Location,'/$1/work');
 assert.equal(redirect('/en/impact').headers.Location,'/$1');
 assert.equal(redirect('/impact/').headers.Location,'/$1');
 assert.equal(redirect('/privacy-policy').headers.Location,'/privacy-policy/');
 assert.ok(!matching(rules,'/privacy-policy/').some(r=>r.status===301));
});
test('production enforces published destinations and canonical www; preview cache and headers',()=>{
 assert.throws(()=>buildRoutes({...inputs,mode:'production'}),/Unpublished/);
 const full=new Set([...publishedPaths,'/work']);const rules=buildRoutes({...inputs,publishedPaths:full,mode:'production',files:['404.html']});
 assert.equal(rules[0].has[0].type,'host');assert.equal(rules[0].headers.Location,origin+'$1');
 assert.equal(rules.at(-1).dest,'/404.html');
 assert.ok(!rules.some(r=>r.headers?.['X-Robots-Tag']==='noindex, nofollow'));
 assert.ok(rules.some(r=>r.src==='^/api/.*$'&&r.headers['Cache-Control']==='no-store'));
 assert.ok(rules.some(r=>r.src==='^/sitemap\\.xml$'&&r.headers['Content-Type']==='application/xml; charset=utf-8'));
 assert.ok(rules.some(r=>r.src==='^/llms(?:-full)?\\.txt$'&&r.headers['Cache-Control']==='public, max-age=3600'));
 assert.throws(()=>buildRoutes({...inputs,mode:'production',redirects:[]}),/required/);
 assert.throws(()=>buildRoutes({...inputs,mode:'test'}),/mode/);
});
test('report-only CSP carries only measured or source referenced origins',()=>{
 const policy=buildRoutes({...inputs,mode:'preview'})[1].headers['Content-Security-Policy-Report-Only'];
 for(const host of ['https://unpkg.com','https://fonts.googleapis.com','https://fonts.gstatic.com','https://checkout.razorpay.com','https://www.paypal.com'])assert.ok(policy.includes(host),host);
 assert.ok(policy.includes("'unsafe-eval'"));assert.ok(Object.isFrozen(CSP_SOURCES));
});
