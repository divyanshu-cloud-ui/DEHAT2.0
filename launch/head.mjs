import {LANGUAGES} from './routes.mjs';

export const HREFLANG = Object.freeze(Object.fromEntries(LANGUAGES.map(code=>[code,code])));

const attribute = value => String(value).replace(/[&"<>]/g, char=>({'&':'&amp;','"':'&quot;','<':'&lt;','>':'&gt;'}[char]));
const titleText = value => String(value).replace(/[&<>]/g, char=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[char]));

export function buildHead({route,seo,origin,languages,pathFor}) {
  if (!seo || ['title','description','ogImage'].some(field=>typeof seo[field]!=='string'||!seo[field].trim())) throw new TypeError('Complete SEO title, description and ogImage are required');
  if (!Array.isArray(languages)||!languages.includes(route?.lang)) throw new TypeError('Route language must be in languages');
  const canonical=origin+route.canonicalPath;
  const image=new URL(seo.ogImage,origin).href;
  const tags=[
    `<title>${titleText(seo.title)}</title>`,
    `<meta name="description" content="${attribute(seo.description)}">`,
  ];
  if (route.status===404) tags.push('<meta name="robots" content="noindex">');
  else {
    tags.push(`<link rel="canonical" href="${attribute(canonical)}">`);
    if (route.kind==='app' && route.status===200) {
      for (const code of languages) {
        const path=pathFor(route.routeId,code);
        if (typeof path!=='string'||!path.startsWith('/')) throw new TypeError('Alternate path must start with /');
        tags.push(`<link rel="alternate" hreflang="${attribute(HREFLANG[code])}" href="${attribute(origin+path)}">`);
      }
      const english=pathFor(route.routeId,'en');
      if (typeof english!=='string'||!english.startsWith('/')) throw new TypeError('English alternate path must start with /');
      tags.push(`<link rel="alternate" hreflang="x-default" href="${attribute(origin+english)}">`);
    }
  }
  tags.push(
    `<meta property="og:type" content="${route.storySlug?'article':'website'}">`,
    '<meta property="og:site_name" content="DEHAT">',
    `<meta property="og:title" content="${attribute(seo.title)}">`,
    `<meta property="og:description" content="${attribute(seo.description)}">`,
    `<meta property="og:url" content="${attribute(canonical)}">`,
    `<meta property="og:image" content="${attribute(image)}">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:site" content="@dehatindia">',
    `<meta name="twitter:title" content="${attribute(seo.title)}">`,
    `<meta name="twitter:description" content="${attribute(seo.description)}">`,
    `<meta name="twitter:image" content="${attribute(image)}">`,
  );
  return tags.join('\n');
}
