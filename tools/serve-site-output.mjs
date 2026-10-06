// Loopback approximation of the Build Output route table for local probes.
// Hosted Vercel behaviour must still be checked before launch.
import http from 'node:http';
import path from 'node:path';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8','.pdf':'application/pdf'};

export async function serveSiteOutput(output,port=0){
  const config=JSON.parse(await readFile(path.join(output,'config.json'),'utf8'));
  if(config.version!==3||!Array.isArray(config.routes))throw new Error('Invalid Build Output config');
  const staticRoot=path.join(output,'static');
  async function staticFile(pathname){
    let name;
    try{name=decodeURIComponent(pathname).replace(/^\//,'');}catch{return null;}
    if(!name||name.includes('\\')||name.split('/').some(part=>!part||part==='.'||part==='..'))return null;
    try{return {name,data:await readFile(path.join(staticRoot,name))};}
    catch(error){if(['ENOENT','EISDIR'].includes(error.code))return null;throw error;}
  }
  const server=http.createServer(async(req,res)=>{
    try{
      const requestPath=new URL(req.url,'http://local.invalid').pathname;
      let destination=requestPath;
      let status=200;
      for(const rule of config.routes){
        if(rule.handle==='filesystem'){
          if(await staticFile(destination))break;
          continue;
        }
        if(!rule.src||!new RegExp(rule.src).test(requestPath)||rule.has?.some(condition=>condition.type==='host'&&!new RegExp(condition.value).test(req.headers.host||'')))continue;
        for(const [key,value] of Object.entries(rule.headers||{}))res.setHeader(key,value);
        if(rule.continue)continue;
        if(rule.dest)destination=requestPath.replace(new RegExp(rule.src),rule.dest);
        status=rule.status||200;
        if(status===301||status===302||status===308||status===410){res.writeHead(status);return res.end();}
        break;
      }
      const result=await staticFile(destination);
      if(!result){res.writeHead(404);return res.end('Not found');}
      res.setHeader('Content-Type',mime[path.extname(result.name)]||'application/octet-stream');
      res.writeHead(status);res.end(result.data);
    }catch(error){res.writeHead(500);res.end(error.message);}
  });
  await new Promise((resolve,reject)=>server.once('error',reject).listen(port,'127.0.0.1',resolve));
  return {server,origin:`http://127.0.0.1:${server.address().port}`};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const local=await serveSiteOutput(path.resolve('.vercel/output'),Number(process.env.SITE_PORT)||8898);
  console.log(`Local Build Output: ${local.origin}`);
}
