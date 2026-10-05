import {LANGUAGES} from './routes.mjs';

const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;',
})[char]);

const styles = `:root{color-scheme:dark;--bg:#151009;--surface:#241b11;--text:#f5eede;--dim:#c6b8a3;--gold:#EAAE28}
*{box-sizing:border-box}html{min-height:100%}body{margin:0;min-height:100svh;background:var(--bg);color:var(--text);font-family:'Public Sans',system-ui,sans-serif}
main{width:min(100% - 48px,640px);margin:0 auto;padding:clamp(32px,7vh,72px) 0 48px}
.logo{display:inline-flex;align-items:center;min-height:48px}.logo img{display:block;width:210px;max-width:100%;height:auto;filter:brightness(0) invert(1)}
.eyebrow{margin:clamp(46px,9vh,90px) 0 18px;color:var(--gold);font-size:13px;font-weight:700;line-height:1.5}
h1{margin:0 0 20px;font:800 clamp(32px,6vw,56px)/1.08 'Bricolage Grotesque',system-ui,sans-serif;letter-spacing:-.035em}
.body,.ask{font-size:clamp(16px,2vw,18px);line-height:1.65;color:var(--dim)}.body{margin:0 0 24px}.ask{margin:28px 0 0}
nav{border-top:1px solid var(--dim);padding-top:14px}ul{list-style:none;display:flex;flex-wrap:wrap;gap:3px 20px;padding:0;margin:0}li{margin:0}a{color:var(--gold);text-underline-offset:4px}nav a{display:inline-flex;min-height:44px;align-items:center;font-size:15px;font-weight:700}.ask a{overflow-wrap:anywhere}a:focus-visible{outline:3px solid var(--gold);outline-offset:4px}
html[lang]:not([lang=en]) h1{letter-spacing:0}html[lang]:not([lang=en]) .eyebrow{letter-spacing:0}
@media(prefers-color-scheme:light){:root{color-scheme:light;--bg:#fbf7ef;--surface:#f0e8d9;--text:#1f1710;--dim:#5a4f43;--gold:#8a5f00}.logo img{filter:none}}`;

export function buildNotFound({lang,copy,labels,pathFor,head,dir}) {
  if(!LANGUAGES.includes(lang))throw new TypeError('Unsupported language');
  const english=copy?.copy?.en;
  const fields=['eyebrow','title','body','ask'];
  if(!english||fields.some(field=>typeof english[field]!=='string'||!english[field].trim()))throw new TypeError('English not-found copy is incomplete');
  const localized=copy.copy[lang];
  const content=localized||english;
  const copyLang=localized?'':' lang="en"';
  const home=pathFor('home',lang);
  if(typeof home!=='string'||!home.startsWith('/'))throw new TypeError('Invalid home path');
  const links=copy.links.map(({route_id,label_key})=>{
    const label=labels?.[label_key];
    if(typeof label!=='string'||!label.trim())throw new TypeError('Missing navigation label');
    const href=pathFor(route_id,lang);
    if(typeof href!=='string'||!href.startsWith('/'))throw new TypeError('Invalid navigation path');
    return `<li><a href="${escapeHtml(href)}">${escapeHtml(label)}</a></li>`;
  });
  return `<!doctype html><html lang="${escapeHtml(lang)}" dir="${escapeHtml(dir)}" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">${head}<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""><link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&amp;family=Public+Sans:ital,wght@0,400..700;1,400..600&amp;display=swap" rel="stylesheet"><style>${styles}</style></head><body><main><a class="logo" href="${escapeHtml(home)}"><img src="/dehat-logo-horizontal.png" alt="DEHAT" width="1050" height="225"></a><div class="copy"${copyLang}><p class="eyebrow">404 · ${escapeHtml(content.eyebrow)}</p><h1>${escapeHtml(content.title)}</h1><p class="body">${escapeHtml(content.body)}</p></div><nav><ul>${links.join('')}</ul></nav><p class="ask"${copyLang}>${escapeHtml(content.ask)} <a href="mailto:${escapeHtml(copy.email)}">${escapeHtml(copy.email)}</a></p></main></body></html>`;
}
