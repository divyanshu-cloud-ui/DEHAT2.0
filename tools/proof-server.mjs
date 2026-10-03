// Local diagnostic server only. This module is never a deployment entrypoint.
import http from 'node:http';
import path from 'node:path';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {createRouter} from '../launch/routes.mjs';

export function runtimeTemplate(source) {
  const links = {goHome:'launchPaths.home',goWork:'launchPaths.work',goWorkFromLoop:'launchPaths.work',goStories:'launchPaths.stories',goMedia:'launchPaths.media',goFinance:'launchPaths.finance',goPolicies:'launchPaths.policies',goDonate:'launchPaths.give',goInvolved:'launchPaths.case','item.go':'item.href','kid.go':'kid.href','f.open':'f.href'};
  // The source uses non-nested buttons. Only explicitly mapped navigation actions
  // become links; disclosure, payment and filter controls retain button semantics.
  return source.replace(/<button\b([^>]*?)>([\s\S]*?)<\/button>/g, (whole, attrs, body) => {
    const action = attrs.match(/onClick="\{\{\s*([^}]+?)\s*\}\}"/);
    const href = action && links[action[1].trim()];
    return href ? `<a${attrs.replace(action[0], `href="{{ ${href} }}"`)}>${body}</a>` : whole;
  });
}

export async function proofServer(root) {
  const sandbox={window:{}};
  vm.runInNewContext(await readFile(path.join(root,'stories-data.js'),'utf8'),sandbox);
  const router=createRouter(Array.from(sandbox.window.STORIES));
  const template=runtimeTemplate(await readFile(path.join(root,'DEHAT.dc.html'),'utf8'));
  const snapshots=new Map();
  const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2'};
  const server=http.createServer(async(req,res)=>{
    try {
      const url=new URL(req.url,'http://localhost');
      const pathname=decodeURIComponent(url.pathname);
      res.setHeader('X-Robots-Tag','noindex');
      res.setHeader('Cache-Control','no-store');
      if(pathname==='/launch/runtime-template.html') {res.setHeader('Content-Type','text/html');return res.end(template);}
      const route=router.parseUrl(url.pathname);
      if(route.status===301){res.writeHead(301,{Location:route.redirectTo});return res.end();}
      if(route.status===200 && route.kind==='app') {
        res.setHeader('Content-Type','text/html');
        return res.end(snapshots.get(pathname)||`<!doctype html><html lang="${route.lang}" dir="${route.dir}"><head><link rel="icon" href="data:,"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="/"><style>a{text-decoration:none}#launch-live:not(.launch-active){position:absolute;inset:0;visibility:hidden;pointer-events:none}</style></head><body><div id="launch-live" inert aria-hidden="true"></div><main id="launch-snapshot">Local engineering diagnostic: generating readable snapshot.</main><script type="module" src="/launch/bootstrap.mjs"></script></body></html>`);
      }
      // No dotfiles, private directories, APIs or arbitrary document exposure.
      if(pathname.includes('..')||pathname.split('/').some(p=>p.startsWith('.')||p.startsWith('_'))||pathname.startsWith('/api/')||pathname.startsWith('/assets/docs/')){res.writeHead(404);return res.end('Not found');}
      const permitted=/^\/[\w-]+\.(?:js|png|svg|webp|jpg)$/.test(pathname)||/^\/assets\/(?:ink|story|portraits|svc|art|thumb)\/[\w/.-]+\.(?:png|svg|webp|jpg)$/.test(pathname)||/^\/launch\/(?:bootstrap|routes)\.mjs$/.test(pathname)||/^\/content-i18n\/[a-z]+\.js$/.test(pathname)||['/MediaArchive.dc.html','/district-map.html'].includes(pathname)||route.kind==='legal';
      if(!permitted){res.writeHead(404);return res.end('Not found');}
      const relative=route.kind==='legal'?route.source:pathname.slice(1);
      const contents=await readFile(path.join(root,relative));
      res.setHeader('Content-Type',mime[path.extname(relative)]||'application/octet-stream');res.end(contents);
    }catch(error){res.writeHead(error.code==='ENOENT'?404:500);res.end('Local diagnostic request failed');}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  return {server,snapshots,router,origin:`http://127.0.0.1:${server.address().port}`};
}
