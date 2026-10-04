import {LANGUAGES} from './routes.mjs';
import {LEGAL_PATHS} from './config.mjs';

// Each remote origin below occurs in DEHAT.dc.html, support.js or the local
// proof resource log. This policy is report-only while the runtime is measured.
export const CSP_SOURCES = Object.freeze(Object.fromEntries(Object.entries({
  'default-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'frame-ancestors': ["'self'"],
  'script-src': ["'self'","'unsafe-inline'","'unsafe-eval'",'https://unpkg.com','https://checkout.razorpay.com','https://www.paypal.com'],
  'style-src': ["'self'","'unsafe-inline'",'https://fonts.googleapis.com'],
  'font-src': ["'self'",'https://fonts.gstatic.com'],
  'img-src': ["'self'",'data:','blob:'],
  'connect-src': ["'self'",'https://api.razorpay.com','https://www.paypal.com'],
  'frame-src': ["'self'",'https://checkout.razorpay.com','https://www.paypal.com'],
}).map(([directive,sources])=>[directive,Object.freeze(sources)])));

const escapePattern = value => value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const location = destination => ({Location:destination});
const exact = value => '^'+escapePattern(value)+'$';
const cache = (src,value,other={}) => ({src,headers:{'Cache-Control':value,...other},continue:true});
const revalidate='public, max-age=0, must-revalidate';
const media='public, max-age=86400, stale-while-revalidate=604800';
const reportPolicy=Object.entries(CSP_SOURCES).map(([directive,sources])=>`${directive} ${sources.join(' ')}`).join('; ');

export function omittedRedirects({mode,redirects,publishedPaths}) {
  if(mode==='production')return [];
  if(mode!=='preview')throw new TypeError('Unknown edge mode');
  return redirects.filter(row=>row.status===301&&!row.destination.startsWith('https://')&&!publishedPaths.has(new URL(row.destination,'https://dehatindia.org').pathname));
}

export function buildRoutes({mode,origin,redirects,routes,publishedPaths,files,apis}) {
  if(!['preview','production'].includes(mode))throw new TypeError('Unknown edge mode');
  if(mode==='production'&&!redirects.length)throw new TypeError('Production redirects are required');
  if(mode==='production')for(const row of redirects){
    if(row.status===301&&!row.destination.startsWith('https://')&&!publishedPaths.has(new URL(row.destination,origin).pathname))throw new TypeError(`Unpublished redirect destination: ${row.destination}`);
  }
  const output=[];
  if(mode==='production')output.push({src:'^(.*)$',has:[{type:'host',value:'^www\\.dehatindia\\.org$'}],status:301,headers:location(origin+'$1')});
  if(mode==='preview')output.push({src:'.*',headers:{'X-Robots-Tag':'noindex, nofollow'},continue:true});
  output.push({src:'.*',headers:{
    'Strict-Transport-Security':'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options':'nosniff',
    'Referrer-Policy':'strict-origin-when-cross-origin',
    'X-Frame-Options':'SAMEORIGIN',
    'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy-Report-Only':reportPolicy,
  },continue:true});
  output.push({src:'^/(?:MediaArchive\\.dc\\.html|district-map\\.html)$',headers:{'X-Robots-Tag':'noindex'},continue:true});
  output.push(cache('^/assets/.*$',media));
  output.push(cache('^/dehat-[^/]*\\.png$',media));
  output.push(cache('^/(?:$|[^.]*|.*\\.html)$',revalidate));
  output.push(cache('^/[^/]*-data\\.js$',revalidate));
  output.push(cache('^/content-i18n/.*$',revalidate));
  output.push(cache('^/launch/.*$',revalidate));
  output.push(cache('^/sitemap\\.xml$',revalidate,{'Content-Type':'application/xml; charset=utf-8'}));
  output.push(cache('^/robots\\.txt$',revalidate));
  output.push(cache('^/llms(?:-full)?\\.txt$','public, max-age=3600',{'Content-Type':'text/plain; charset=utf-8'}));
  output.push(cache('^/api/.*$','no-store'));
  const omitted=new Set(omittedRedirects({mode,redirects,publishedPaths}));
  for(const row of redirects)if(!omitted.has(row))output.push({src:exact(row.source),status:row.status,...(row.status===301?{headers:location(row.destination)}:{})});
  output.push({src:exact('/DEHAT.dc.html'),status:301,headers:location('/')});
  output.push({src:exact('/get-involved'),status:301,headers:location('/get-involved/case')});
  output.push({src:exact('/programmes'),status:301,headers:location('/work')});
  const prefixes=LANGUAGES.filter(code=>code!=='en').join('|');
  output.push({src:`^/(${prefixes})/get-involved$`,status:301,headers:location('/$1/get-involved/case')});
  output.push({src:`^/(${prefixes})/programmes$`,status:301,headers:location('/$1/work')});
  output.push({src:'^/en(?:/(.*))?$',status:301,headers:location('/$1')});
  for(const legal of LEGAL_PATHS)output.push({src:exact(legal.slice(0,-1)),status:301,headers:location(legal)});
  const legalNames=LEGAL_PATHS.map(path=>escapePattern(path.slice(1))).join('|');
  output.push({src:`^/(?!${legalNames})(.+)/$`,status:301,headers:location('/$1')});
  for(const route of routes)output.push({src:exact(route.path),dest:'/'+route.file});
  output.push({handle:'filesystem'});
  output.push(files.includes('404.html')?{src:'.*',dest:'/404.html',status:404}:{src:'.*',status:404});
  return output;
}
