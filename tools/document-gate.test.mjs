import test from 'node:test';
import assert from 'node:assert/strict';
import {documentGate} from './document-gate.mjs';

const docs=Array.from({length:32},(_,index)=>`/assets/docs/document-${index+1}.pdf`);
const press=Array.from({length:13},(_,index)=>`/assets/press/report-${index+1}.pdf`);
const documentLinks=docs.flatMap(target=>[{target,page:'/finance'},{target,page:'/hi/finance'}]);

test('require-documents names each of 32 missing Finance and 13 missing press PDFs once',()=>{
  const result=documentGate({documentLinks,redirectDestinations:press,available:()=>false,requireDocuments:true});
  assert.equal(result.errors.length,45);
  assert.deepEqual(new Set(result.errors.map(issue=>issue.detail)),new Set([...docs,...press]));
  assert.deepEqual(result.warnings,[]);
});

test('without the flag the same missing uploads remain two warnings',()=>{
  const result=documentGate({documentLinks,redirectDestinations:press,available:()=>false});
  assert.deepEqual(result.errors,[]);
  assert.deepEqual(result.warnings.map(issue=>issue.kind),['pending-document-uploads','pending-uploads']);
});

test('a fixture with all 45 PDFs present passes the required-documents gate',()=>{
  const present=new Set([...docs,...press]);
  const result=documentGate({documentLinks,redirectDestinations:press,available:target=>present.has(target),requireDocuments:true});
  assert.deepEqual(result.errors,[]);
  assert.deepEqual(result.warnings,[]);
  assert.deepEqual(result.missingDocuments,[]);
  assert.deepEqual(result.missingRedirects,[]);
});
