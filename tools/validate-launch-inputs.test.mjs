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
    for(const [key,value,match] of [['seo','export default {en:{}}',/SEO missing/],['schema','{}',/organization/],['redirects','source,destination,status\n/a,/a,301',/loop/],['llms','',/empty file/]]){
      await restore();await writeFile(path.join(root,inputPaths[key]),value);await assert.rejects(validateLaunchInputs(options),match);
    }
  }finally{await rm(root,{recursive:true,force:true});}
});
