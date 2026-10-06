import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,readFile,mkdir,cp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {safeRelative,publicAsset,digest,verifyManifest,packageLaunch} from './package-launch.mjs';
import {API_ENDPOINTS} from '../launch/config.mjs';
import {createRequire} from 'node:module';
test('deployment allowlist excludes private documents and traversal',()=>{
  for(const name of ['../secret','/private','a/../b','a\\b','a//b'])assert.throws(()=>safeRelative(name));
  for(const name of ['.image-slots.state.json','_internal/proof.html','assets/docs/report.pdf','EVIDENCE_VAULT/file.png','PUBLIC_DOCUMENTS/file.pdf','api/_paypal.js'])assert.equal(publicAsset(name),false,name);
  for(const name of ['support.js','content-i18n/ar.js','assets/story/web/story-002.png','assets/logos/actionaid-association.png','assets/partners/directorate-of-education-government-of-uttar-pradesh.png','assets/cj/community-planning-board.png','assets/story-development.png','launch/bootstrap.mjs'])assert.equal(publicAsset(name),true,name);
});
test('proof bundle preserves seven handlers and webhook raw body configuration',async()=>{
  const root=await mkdtemp(path.join(tmpdir(),'dehat-package-test-'));
  try{
    for(const dir of ['launch','_internal/qa','generated/proof'])await mkdir(path.join(root,dir),{recursive:true});
    await writeFile(path.join(root,'seo-data.js'),'module.exports={en:{home:{title:"Fixture",description:"Fixture description",ogImage:"/logo.png"}}};');
    await writeFile(path.join(root,'launch/schema-fields.json'),JSON.stringify({organization:{name:'Fixture',url:'https://dehatindia.org',sameAs:['https://example.org/fixture']},website:{name:'Fixture',url:'https://dehatindia.org'},storyType:'Article'}));
    for(const name of ['llms.txt','llms-full.txt'])await writeFile(path.join(root,name),'Fixture documentation');
    await writeFile(path.join(root,'_internal/qa/REDIRECTS_156.csv'),'source,destination,status\n/old,/impact,301');
    await cp(new URL('../api/',import.meta.url),path.join(root,'api'),{recursive:true});
    await writeFile(path.join(root,'source.js'),'fixture');
    const html='<main>Fixture</main>';await writeFile(path.join(root,'generated/proof/index.html'),html);
    const sourceFiles=[{path:'source.js',sha256:digest('fixture')}];
    await writeFile(path.join(root,'generated/proof/manifest.json'),JSON.stringify({version:1,generation:{mode:'proof'},sourceFiles,sourceDigest:digest(JSON.stringify(sourceFiles)),files:[{path:'index.html',sha256:digest(html)}],routes:[{path:'/',routeId:'home',file:'index.html',lang:'en'}]}));
    await packageLaunch({root});
    for(const endpoint of API_ENDPOINTS){
      const dir=path.join(root,'.vercel/output/functions',endpoint.path.slice(1)+'.func');
      const config=JSON.parse(await readFile(path.join(dir,'.vc-config.json')));
      assert.equal(config.shouldAddHelpers,!endpoint.rawBody);
      assert.equal(await readFile(path.join(dir,endpoint.source),'utf8'),await readFile(path.join(root,endpoint.source),'utf8'));
      const handler=createRequire(import.meta.url)(path.join(dir,endpoint.source));
      const res={setHeader(){},end(body){this.body=body;}};
      await handler({method:'DELETE'},res);assert.equal(res.statusCode,405,endpoint.path);
    }
  }finally{await rm(root,{recursive:true,force:true});}
});
test('digest gate rejects stale source, stale snapshot and diagnostic manifests',async()=>{
  const root=await mkdtemp(path.join(tmpdir(),'dehat-digest-test-'));
  try{
    await writeFile(path.join(root,'source.js'),'original');await writeFile(path.join(root,'index.html'),'<main>Fixture</main>');
    const sourceFiles=[{path:'source.js',sha256:digest('original')}];
    const manifest={version:1,generation:{mode:'proof'},sourceFiles,sourceDigest:digest(JSON.stringify(sourceFiles)),files:[{path:'index.html',sha256:digest('<main>Fixture</main>')}],routes:[{path:'/',file:'index.html'}]};
    await verifyManifest(root,root,manifest);
    await assert.rejects(verifyManifest(root,root,{...manifest,generation:{mode:'diagnostic'}}),/proof/);
    await writeFile(path.join(root,'source.js'),'changed');await assert.rejects(verifyManifest(root,root,manifest),/Stale/);
    await writeFile(path.join(root,'source.js'),'original');await writeFile(path.join(root,'index.html'),'changed');await assert.rejects(verifyManifest(root,root,manifest),/Stale/);
  }finally{await rm(root,{recursive:true,force:true});}
});
