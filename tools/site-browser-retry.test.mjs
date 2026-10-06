import test from 'node:test';
import assert from 'node:assert/strict';
import {renderSite,retryPage} from './site-browser.mjs';

function fixture(failures){
  let attempts=0,contexts=0,closed=0;
  const emitted=[];
  const launchBrowser=async()=>({
    async newContext(){
      contexts++;
      return {
        async newPage(){
          let evaluations=0;
          return {
            on(){},off(){},
            async goto(){
              attempts++;
              if(attempts<=failures)throw new Error(`injected failure ${attempts}`);
              return {status:()=>200};
            },
            async waitForFunction(){},
            async evaluate(){return ++evaluations===1?{phase:'ready'}:'<html>unchanged snapshot</html>';},
          };
        },
        async close(){closed++;},
      };
    },
    async close(){},
  });
  const serve=async()=>({origin:'http://fixture.invalid',server:{close(done){done();}}});
  return {launchBrowser,serve,emitted,onPage:async(route,html)=>emitted.push({route:route.path,html}),counts:()=>({attempts,contexts,closed})};
}

test('page that is ready on its first attempt keeps its snapshot and has no retries',async()=>{
  const setup=fixture(0);
  const result=await renderSite('.', [{path:'/finance'}],{...setup,concurrency:1});
  assert.deepEqual(result.retries,[]);
  assert.deepEqual(setup.emitted,[{route:'/finance',html:'<html>unchanged snapshot</html>'}]);
  assert.equal(result.timings[0].bytes,Buffer.byteLength(setup.emitted[0].html));
  assert.deepEqual(setup.counts(),{attempts:1,contexts:1,closed:1});
});

test('first-attempt failure retries once in a fresh context and records success',async()=>{
  const setup=fixture(1);
  const result=await renderSite('.', [{path:'/finance'}],{...setup,concurrency:1});
  assert.deepEqual(result.retries,[{route:'/finance',firstError:'injected failure 1',outcome:'succeeded'}]);
  assert.deepEqual(setup.emitted,[{route:'/finance',html:'<html>unchanged snapshot</html>'}]);
  assert.deepEqual(setup.counts(),{attempts:2,contexts:2,closed:2});
});

test('second failure aborts after exactly one fresh-context retry',async()=>{
  const setup=fixture(2);
  await assert.rejects(renderSite('.', [{path:'/finance'}],{...setup,concurrency:1}),/\/finance: injected failure 2/);
  assert.deepEqual(setup.emitted,[]);
  assert.deepEqual(setup.counts(),{attempts:2,contexts:2,closed:2});
  const retries=[];
  await assert.rejects(retryPage({path:'/finance'},async()=>{throw new Error('still failed');},async()=>{},retries),/still failed/);
  assert.deepEqual(retries,[{route:'/finance',firstError:'still failed',outcome:'failed',secondError:'still failed'}]);
});
