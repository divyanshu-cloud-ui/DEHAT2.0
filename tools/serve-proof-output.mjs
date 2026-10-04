// Loopback-only verifier for our finite Build Output routes. This does not replace
// a Vercel preview test: it exercises the packaged bytes and handler exports locally.
import http from 'node:http';
import path from 'node:path';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {API_ENDPOINTS} from '../launch/config.mjs';
export async function serveProofOutput(output,port=0){
  const config=JSON.parse(await readFile(path.join(output,'config.json'),'utf8'));
  const require=createRequire(import.meta.url);
  const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.webp':'image/webp','.xml':'application/xml','.txt':'text/plain; charset=utf-8','.pdf':'application/pdf'};
  const server=http.createServer(async(req,res)=>{
    try{
      let pathname=new URL(req.url,'http://localhost').pathname;
      const endpoint=API_ENDPOINTS.find(e=>e.path===pathname);
      res.setHeader('X-Robots-Tag','noindex');
      if(endpoint){
        if(!['GET','DELETE'].includes(req.method)){res.writeHead(405);return res.end('Local preview only permits read-only API checks');}
        return await require(path.join(output,'functions',pathname.slice(1)+'.func',endpoint.source))(req,res);
      }
      for(const rule of config.routes){
        if(rule.handle==='filesystem')break;
        if(!rule.src||!new RegExp(rule.src).test(pathname))continue;
        for(const [key,value] of Object.entries(rule.headers||{}))res.setHeader(key,value);
        if(rule.continue)continue;
        if(rule.status){res.writeHead(rule.status);return res.end();}
        if(rule.dest){pathname=rule.dest;break;}
      }
      const relative=decodeURIComponent(pathname).replace(/^\//,'');
      if(!relative||relative.split('/').some(p=>!p||p==='..'||p==='.')||relative.includes('\\')){res.writeHead(404);return res.end('Not found');}
      const file=path.join(output,'static',relative);
      const data=await readFile(file);res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(data);
    }catch(error){res.writeHead(error.code==='ENOENT'||error.code==='EISDIR'?404:500);res.end('Not found');}
  });
  await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));
  return {server,origin:`http://127.0.0.1:${server.address().port}`};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const local=await serveProofOutput(path.resolve('.vercel/output'),Number(process.env.PROOF_PORT)||8898);console.log('Local packaged proof: '+local.origin);
}
