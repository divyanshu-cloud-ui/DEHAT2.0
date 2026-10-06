import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {proofServer} from './proof-server.mjs';

test('renderer serves public partner artwork and rejects private documents',async()=>{
  const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
  const local=await proofServer(root);
  try{
    for(const pathname of ['/assets/logos/actionaid-association.png','/assets/partners/directorate-of-education-government-of-uttar-pradesh.png','/assets/cj/community-planning-board.png','/assets/portraits/t01.webp','/assets/story-development.png']){
      const response=await fetch(local.origin+pathname);
      assert.equal(response.status,200,pathname);
      assert.ok(Number(response.headers.get('content-length'))>0||Number((await response.arrayBuffer()).byteLength)>0,pathname);
    }
    assert.equal((await fetch(local.origin+'/assets/docs/private.pdf')).status,404);
    assert.equal((await fetch(local.origin+'/_internal/secret')).status,404);
  }finally{await new Promise(resolve=>local.server.close(resolve));}
});
