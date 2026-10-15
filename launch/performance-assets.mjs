// Content-addressed local copies of the exact UMD versions expected by support.js.
export const REACT_URL = 'https://unpkg.com/react@18.3.1/umd/react.production.min.js';
export const REACT_DOM_URL = 'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js';
export const REACT_ASSET = '/assets/vendor/react-18.3.1-d949f1c3687aedad.js';
export const REACT_DOM_ASSET = '/assets/vendor/react-dom-18.3.1-35f4f974f4b2bcd4.js';

export function resourceHints(lang) {
  // Only what the first screen paints with is preloaded. The runtime template, support.js and
  // React are fetched by bootstrap.mjs as soon as it runs; preloading them at top priority made
  // them compete with the fonts for the first paint on slow phones (Lighthouse mobile, home:
  // performance 72 to 78, total blocking time 375 to 236 ms, median of 3).
  const links = [
    ['modulepreload', '/launch/bootstrap.mjs'],
    ['modulepreload', '/launch/routes.mjs'],
    ['modulepreload', '/launch/artwork.mjs'],
    ['modulepreload', '/launch/performance-assets.mjs'],
    ['modulepreload', '/launch/partner-tabs.mjs'],
    ['preload', '/assets/fonts/web/font-11-c1b6da516e0062e9.woff2', 'font'],
    ['preload', '/assets/fonts/web/font-02-85f55a58a31e61a2.woff2', 'font'],
  ];
  if (lang && lang !== 'en') {
    links.push(['preload', `/content-i18n/${lang}.js`, 'script']);
    links.push(['preload', `/launch/dict/${lang}.js`, 'script']);
  }
  return links.map(([rel, href, as]) => `<link rel="${rel}" href="${href}"${as ? ` as="${as}"` : ''}${as === 'fetch' || as === 'font' ? ' crossorigin' : ''}${as === 'font' ? ' type="font/woff2"' : ''}>`).join('');
}
