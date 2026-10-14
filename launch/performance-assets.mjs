// Content-addressed local copies of the exact UMD versions expected by support.js.
export const REACT_URL = 'https://unpkg.com/react@18.3.1/umd/react.production.min.js';
export const REACT_DOM_URL = 'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js';
export const REACT_ASSET = '/assets/vendor/react-18.3.1-d949f1c3687aedad.js';
export const REACT_DOM_ASSET = '/assets/vendor/react-dom-18.3.1-35f4f974f4b2bcd4.js';

export function resourceHints(lang) {
  const links = [
    ['modulepreload', '/launch/bootstrap.mjs'],
    ['modulepreload', '/launch/routes.mjs'],
    ['modulepreload', '/launch/artwork.mjs'],
    ['modulepreload', '/launch/performance-assets.mjs'],
    ['modulepreload', '/launch/partner-tabs.mjs'],
    ['preload', '/launch/runtime-template.html', 'fetch'],
    ['preload', '/support.js', 'script'],
    ['preload', REACT_ASSET, 'script'],
    ['preload', REACT_DOM_ASSET, 'script'],
    ['preload', '/assets/fonts/web/font-11-c1b6da516e0062e9.woff2', 'font'],
    ['preload', '/assets/fonts/web/font-02-85f55a58a31e61a2.woff2', 'font'],
  ];
  if (lang && lang !== 'en') {
    links.push(['preload', `/content-i18n/${lang}.js`, 'script']);
    links.push(['preload', `/launch/dict/${lang}.js`, 'script']);
  }
  return links.map(([rel, href, as]) => `<link rel="${rel}" href="${href}"${as ? ` as="${as}"` : ''}${as === 'fetch' || as === 'font' ? ' crossorigin' : ''}${as === 'font' ? ' type="font/woff2"' : ''}>`).join('');
}
