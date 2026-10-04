import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {parseRedirectCSV,seoRecordFor,validateLaunchInputs} from './validate-launch-inputs.mjs';

test('redirect gate rejects loops, external targets, duplicates and malformed CSV',()=>{
  const prefix='source,destination,status\n';
  for(const body of ['/a,/a,301','/a,/b,301\n/b,/a,301','/a,https://example.com,301','/a,//example.com,301','/a,/b,302','/a,/b,301\n/a,/c,301','"/a,/b,301'])assert.throws(()=>parseRedirectCSV(prefix+body),body);
  assert.deepEqual(parseRedirectCSV(prefix+'"/old","/impact",301'),[{source:'/old',destination:'/impact',status:301}]);
});
test('SEO resolves router inventory identities and never falls back to another language',()=>{
  const seo={en:{home:{title:'Home'},'a-story':{title:'Story'}}};
  assert.equal(seoRecordFor(seo,{id:'home',path:'/'}).title,'Home');
  assert.equal(seoRecordFor(seo,{storySlug:'a-story',path:'/stories/a-story'}).title,'Story');
  assert.equal(seoRecordFor(seo,{id:'home',lang:'ar',path:'/ar'}),undefined);
});
test('required input, metadata, schema and redirect gates reject negative fixtures',async()=>{
  const root=await mkdtemp(path.join(tmpdir(),'dehat-input-test-'));
  const inputPaths={seo:'seo.mjs',schema:'schema.json',llms:'llms.txt',llmsFull:'llms-full.txt',redirects:'redirects.csv'};
  const valid={seo:'export default {en:{home:{title:"Home",description:"Description",ogImage:"/logo.png"}}}',schema:JSON.stringify({organization:{name:'Fixture',url:'https://dehatindia.org',sameAs:['https://example.org/fixture']},website:{name:'Fixture',url:'https://dehatindia.org'},storyType:'Article'}),llms:'Fixture documentation',llmsFull:'Fixture full documentation',redirects:'source,destination,status\n/old,/impact,301'};
  const options={root,inputPaths,routes:[{id:'home',path:'/',lang:'en'}]};
  try{
    await assert.rejects(validateLaunchInputs(options),/missing required input/);
    const restore=async()=>{for(const [key,value] of Object.entries(valid))await writeFile(path.join(root,inputPaths[key]),value);};
    await restore();await validateLaunchInputs(options);
    const founderSchema={...JSON.parse(valid.schema),founder:{name:'Fixture Person',birthDate:'1968-12-19',deathDate:'2021-05'}};
    await writeFile(path.join(root,inputPaths.schema),JSON.stringify(founderSchema));await validateLaunchInputs(options);
    for(const field of ['taxID','vatID','bankAccount']){
      await writeFile(path.join(root,inputPaths.schema),JSON.stringify({...founderSchema,[field]:'fixture'}));
      await assert.rejects(validateLaunchInputs(options),/forbidden/);
    }

    for(const [key,value,match] of [['seo','export default {en:{}}',/SEO missing/],['schema','{}',/organization/],['redirects','source,destination,status\n/a,/a,301',/loop/],['llms','',/empty file/]]){
      await restore();await writeFile(path.join(root,inputPaths[key]),value);await assert.rejects(validateLaunchInputs(options),match);
    }
  }finally{await rm(root,{recursive:true,force:true});}
});

test('410 has no destination and optional evidence columns remain intact',()=>{
  assert.deepEqual(parseRedirectCSV('source,destination,status,evidence,wayback_timestamp\n/gone,,410,"Reviewed, obsolete",')[0],{source:'/gone',destination:'',status:410,evidence:'Reviewed, obsolete',wayback_timestamp:''});
  assert.throws(()=>parseRedirectCSV('source,destination,status\n/gone,/,410'),/empty/);
  assert.throws(()=>parseRedirectCSV('source,destination,status\n/old,,301'),/Invalid/);
});
test('external redirects require HTTPS and an exact approved social host',()=>{
  for(const target of ['https://www.facebook.com/dehatorgindia/','https://x.com/dehatindia'])assert.equal(parseRedirectCSV('source,destination,status\n/social,'+target+',301')[0].destination,target);
  for(const target of ['http://x.com/dehatindia','https://x.com.evil.test/a','https://user:pass@x.com/a','https://x.com:444/a','//x.com/a','https://example.com/a'])assert.throws(()=>parseRedirectCSV('source,destination,status\n/social,'+target+',301'),/allowlisted/);
});
test('redirect chains and reserved discovery paths cannot enter output',()=>{
  assert.throws(()=>parseRedirectCSV('source,destination,status\n/a,/b,301\n/b,/c,301'),/chain/);
  for(const source of ['/robots.txt','/sitemap.xml','/ads.txt','/app-ads.txt'])assert.throws(()=>parseRedirectCSV('source,destination,status\n'+source+',/,301'),/must be served/);
});

test('legacy sitemaps can be gone or redirected while served discovery files are reserved',()=>{
  for(const row of ['/cause-sitemap.xml,,410','/page-sitemap.xml,/sitemap.xml,301','/.well-known/obsolete.json,,410'])assert.equal(parseRedirectCSV('source,destination,status\n'+row).length,1);
  for(const file of ['/sitemap.xml','/sitemap_index.xml','/llms.txt','/llms-full.txt'])assert.throws(()=>parseRedirectCSV('source,destination,status\n'+file+',,410'),/must be served/);
});
