// One production identity for canonical URLs, sitemap and metadata.
export const PRODUCTION_ORIGIN = 'https://dehatindia.org';
export const ANALYTICS_ENABLED = false;
export const NODE_RUNTIME = 'nodejs22.x';
export const LAUNCH_INPUTS = Object.freeze({
  seo: 'seo-data.js',
  schema: 'launch/schema-fields.json',
  llms: 'llms.txt',
  llmsFull: 'llms-full.txt',
  redirects: '_internal/qa/REDIRECTS_156.csv',
});
export const LEGAL_PATHS = Object.freeze([
  '/privacy-policy/', '/refund-policy/', '/terms-and-conditions/',
]);
export const API_ENDPOINTS = Object.freeze([
  { path: '/api/donations/create-order', source: 'api/donations/create-order.js', helper: 'api/_razorpay.js', method: 'POST' },
  { path: '/api/donations/create-subscription', source: 'api/donations/create-subscription.js', helper: 'api/_razorpay.js', method: 'POST' },
  { path: '/api/donations/verify', source: 'api/donations/verify.js', helper: 'api/_razorpay.js', method: 'POST' },
  { path: '/api/donations/webhook', source: 'api/donations/webhook.js', helper: 'api/_razorpay.js', method: 'POST', rawBody: true },
  { path: '/api/paypal/config', source: 'api/paypal/config.js', helper: 'api/_paypal.js', method: 'GET' },
  { path: '/api/paypal/create-order', source: 'api/paypal/create-order.js', helper: 'api/_paypal.js', method: 'POST' },
  { path: '/api/paypal/capture-order', source: 'api/paypal/capture-order.js', helper: 'api/_paypal.js', method: 'POST' },
].map(Object.freeze));
