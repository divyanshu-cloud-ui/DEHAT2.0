// One production identity for canonical URLs, sitemap and metadata.
export const PRODUCTION_ORIGIN = 'https://dehatindia.org';
import {LANGUAGES} from './routes.mjs';
export const PUBLISHED = Object.freeze({languages:Object.freeze([...LANGUAGES]),storyLanguages:Object.freeze(['en','hi','or'])});
export const INDEXED_LANGUAGES = Object.freeze(['en','hi']);
function uniqueSupported(codes,label){
  if(!Array.isArray(codes)||!codes.length||new Set(codes).size!==codes.length||codes.some(code=>!LANGUAGES.includes(code)))throw new TypeError(`Invalid ${label}`);
}
export function validatePublication(){
  uniqueSupported(PUBLISHED.languages,'published languages');
  uniqueSupported(PUBLISHED.storyLanguages,'story languages');
  uniqueSupported(INDEXED_LANGUAGES,'indexed languages');
  if(!PUBLISHED.languages.includes('en')||!PUBLISHED.storyLanguages.includes('en')||!INDEXED_LANGUAGES.includes('en'))throw new TypeError('English must be published and indexed');
  if(PUBLISHED.storyLanguages.some(code=>!PUBLISHED.languages.includes(code))||INDEXED_LANGUAGES.some(code=>!PUBLISHED.languages.includes(code)))throw new TypeError('Publication language subset mismatch');
}
export const ANALYTICS_ENABLED = false;
export const NODE_RUNTIME = 'nodejs22.x';
export const LAUNCH_INPUTS = Object.freeze({
  seo: 'seo-data.js',
  schema: 'launch/schema-fields.json',
  llms: 'llms.txt',
  llmsFull: 'llms-full.txt',
  redirects: 'launch/redirects.csv',
});
// Public Vercel Blob store that holds the published statutory PDFs (store_od8fzyXAvAci3BF9, bom1).
export const DOCS_ORIGIN = 'https://od8fzyxavaci3bf9.public.blob.vercel-storage.com';
export const LEGAL_PATHS = Object.freeze([
  '/privacy-policy/', '/refund-policy/', '/terms-and-conditions/',
]);
export const API_ENDPOINTS = Object.freeze([
  { path: '/api/donations/create-order', source: 'backend/donations/create-order.js', handler: 'api/donations/create-order.js', helper: 'backend/_razorpay.js', method: 'POST', bundle: true },
  { path: '/api/donations/create-subscription', source: 'backend/donations/create-subscription.js', handler: 'api/donations/create-subscription.js', helper: 'backend/_razorpay.js', method: 'POST', bundle: true },
  { path: '/api/donations/verify', source: 'backend/donations/verify.js', handler: 'api/donations/verify.js', helper: 'backend/_razorpay.js', method: 'POST', bundle: true },
  { path: '/api/donations/webhook', source: 'backend/donations/webhook.js', handler: 'api/donations/webhook.js', helper: 'backend/_razorpay.js', method: 'POST', rawBody: true, bundle: true },
  { path: '/api/donations/status', source: 'backend/donations/status.js', handler: 'api/donations/status.js', helper: 'backend/_razorpay.js', method: 'GET', bundle: true },
  { path: '/api/donations/upi-intent', source: 'backend/donations/upi-intent.js', handler: 'api/donations/upi-intent.js', helper: 'backend/_razorpay.js', method: 'POST', bundle: true },
  { path: '/api/donations/upi-reconcile', source: 'backend/donations/upi-reconcile.js', handler: 'api/donations/upi-reconcile.js', helper: 'backend/_razorpay.js', method: 'POST', bundle: true },
].map(Object.freeze));

// Explicit discovery files for the limited preview. No guessed .well-known payloads.
export const DISCOVERY_FILES = Object.freeze(['robots.txt','ads.txt','app-ads.txt','sitemap.xml','sitemap_index.xml']);
