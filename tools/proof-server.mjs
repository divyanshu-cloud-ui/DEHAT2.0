// Local diagnostic server only. This module is never a deployment entrypoint.
import http from 'node:http';
import path from 'node:path';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {createRouter} from '../launch/routes.mjs';
import {resourceHints} from '../launch/performance-assets.mjs';

export function splitRuntimeDictionaries(source) {
  const start = source.indexOf('  _dict() {');
  const end = source.indexOf('\n  _canonName(', start);
  if (start < 0 || end < 0) throw new Error('Site dictionary could not be located');
  const method = source.slice(start, end);
  const enStart = method.indexOf('const EN =');
  const hiStart = method.indexOf('const HI =');
  if (enStart < 0 || hiStart <= enStart) throw new Error('English dictionary declaration missing');
  const english = method.slice(enStart, hiStart);
  const all = vm.runInNewContext('({' + method + '})')._dict();
  const dictionaries = Object.fromEntries(Object.entries(all).filter(([lang]) => lang !== 'en').map(([lang, values]) =>
    [lang, 'window.__LAUNCH_DICTIONARY = {"' + lang + '":' + JSON.stringify(values).replaceAll('<', '\\u003c') + '};\n']));
  const slim = `  _dict() {\n    const diagnostics = typeof window === 'undefined' ? null : window.DEHAT_LAUNCH_DIAGNOSTICS;\n    if (diagnostics) diagnostics.dictCalls = (diagnostics.dictCalls || 0) + 1;\n    if (this._dict?._cache) return this._dict._cache;\n    if (diagnostics) diagnostics.dictBuilds = (diagnostics.dictBuilds || 0) + 1;\n    ${english}\n    const lang = this.state?.lang;\n    return (this._dict._cache = lang && lang !== 'en' ? {en: EN, [lang]: window.__LAUNCH_DICTIONARY?.[lang] || {}} : {en: EN});\n  }\n`;
  return {source: source.slice(0, start) + slim + source.slice(end), dictionaries};
}

export function runtimeTemplate(source) {
  const links = {goHome:'launchPaths.home',goWork:'launchPaths.work',goWorkFromLoop:'launchPaths.work',goStories:'launchPaths.stories',goMedia:'launchPaths.media',goFinance:'launchPaths.finance',goPolicies:'launchPaths.policies',goDonate:'launchPaths.give',goInvolved:'launchPaths.case','item.go':'item.href','kid.go':'kid.href','f.open':'f.href'};
  // The source uses non-nested buttons. Only explicitly mapped navigation actions
  // become links; disclosure, payment and filter controls retain button semantics.
  const end=source.indexOf('</x-dc>');
  const template=source.slice(0,end).replace(/<([a-z][\w-]*)\b([^>]*?)style="([^"]*)"([^>]*)>/g,(whole,tag,before,style,after)=>{
    if (/class="[^"]*(?:hr-|spine-)/.test(before+after)) return whole;
    const image=style.match(/background-image:([^;]+)/);
    if(!image || !image[1].includes('{{'))return whole;
    return `<${tag}${before}data-launch-background="${image[1]}" style="${style.replace(image[0],'')}"${after}>`;
  });
  source=template+source.slice(end);
  // The launch adapter fetches these itself (and only where the route uses them).
  // Leave the tags in DEHAT.dc.html for the standalone editor preview.
  source=source.replace(/<script src="\.\/(?:image-slot|media-data|stories-data)\.js"><\/script>/g,'');
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
  const split=splitRuntimeDictionaries(await readFile(path.join(root,'DEHAT.dc.html'),'utf8'));
  const template=runtimeTemplate(split.source);
  const snapshots=new Map();
  const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.woff2':'font/woff2'};
  const server=http.createServer(async(req,res)=>{
    try {
      const url=new URL(req.url,'http://localhost');
      const pathname=decodeURIComponent(url.pathname);
      res.setHeader('X-Robots-Tag','noindex');
      res.setHeader('Cache-Control','no-store');
      if(pathname==='/launch/runtime-template.html') {res.setHeader('Content-Type','text/html');return res.end(template);}
      const dictionaryCode=pathname.match(/^\/launch\/dict\/([a-z]{2,3})\.js$/)?.[1];
      if(dictionaryCode && split.dictionaries[dictionaryCode]) {res.setHeader('Content-Type','text/javascript');return res.end(split.dictionaries[dictionaryCode]);}
      const route=router.parseUrl(url.pathname);
      if(route.status===301){res.writeHead(301,{Location:route.redirectTo});return res.end();}
      if(route.status===200 && route.kind==='app') {
        res.setHeader('Content-Type','text/html');
        return res.end(snapshots.get(pathname)||`<!doctype html><html lang="${route.lang}" dir="${route.dir}"><head>${resourceHints(route.lang)}<link rel="icon" href="data:,"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="/"><style>a{text-decoration:none}#launch-live:not(.launch-active){position:absolute;inset:0;visibility:hidden;pointer-events:none;content-visibility:hidden}</style></head><body><div id="launch-live" inert aria-hidden="true"></div><main id="launch-snapshot">Local engineering diagnostic: generating readable snapshot.</main><script type="module" src="/launch/bootstrap.mjs"></script></body></html>`);
      }
      // No dotfiles, private directories, APIs or arbitrary document exposure.
      if(pathname.includes('..')||pathname.split('/').some(p=>p.startsWith('.')||p.startsWith('_'))||pathname.startsWith('/api/')||pathname.startsWith('/assets/docs/')){res.writeHead(404);return res.end('Not found');}
      const permitted=/^\/[\w-]+\.(?:js|png|svg|webp|jpg)$/.test(pathname)||/^\/assets\/(?:ink|story|portraits|svc|art|thumb|logos|partners|cj|illus)\/[\w/.-]+\.(?:png|svg|webp|jpg|avif)$/.test(pathname)||/^\/assets\/[\w.-]+\.(?:png|svg|webp|jpg)$/.test(pathname)||/^\/launch\/(?:bootstrap|routes|artwork|performance-assets|partner-tabs)\.mjs$/.test(pathname)||/^\/launch\/partner\/[a-z]{2,3}\.mjs$/.test(pathname)||/^\/assets\/vendor\/(?:react|react-dom)-18\.3\.1-[a-f0-9]{16}\.js$/.test(pathname)||/^\/assets\/fonts\/web\/font-\d{2}-[a-f0-9]{16}\.woff2$/.test(pathname)||/^\/content-i18n\/[a-z]+\.js$/.test(pathname)||/^\/media-i18n\/[a-z]{2,3}\.js$/.test(pathname)||/^\/district-i18n\/[a-z]{2,3}\.js$/.test(pathname)||['/MediaArchive.dc.html','/district-map.html'].includes(pathname)||route.kind==='legal'||/^\/assets\/geo\/[\w.-]+\.(?:json|mjs)$/.test(pathname);
      if(!permitted){res.writeHead(404);return res.end('Not found');}
      const relative=route.kind==='legal'?route.source:pathname.slice(1);
      const contents=await readFile(path.join(root,relative));
      res.setHeader('Content-Type',mime[path.extname(relative)]||'application/octet-stream');res.end(contents);
    }catch(error){res.writeHead(error.code==='ENOENT'?404:500);res.end('Local diagnostic request failed');}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  return {server,snapshots,router,origin:`http://127.0.0.1:${server.address().port}`};
}
