import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { buildGraph } from '../launch/schema.mjs';
import { LANGUAGES, createRouter } from '../launch/routes.mjs';

const sandbox = { window: {} };
const storiesSource = await readFile('stories-data.js', 'utf8');
vm.runInNewContext(storiesSource, sandbox);
const stories = Array.from(sandbox.window.STORIES);
const router = createRouter(stories);

const fields = JSON.parse(await readFile('launch/schema-fields.json', 'utf8'));

test('homepage produces 3 nodes: NGO, WebSite, WebPage without breadcrumb or article', () => {
  const route = router.parseUrl('/');
  const seo = {
    title: 'DEHAT | Child Rights at the Indo-Nepal Border',
    description: 'A youth collective since 1989',
    ogImage: 'https://dehatindia.org/dehat-og.png',
  };
  const seoFor = (id, lang) => ({
    home: { title: 'DEHAT | Child Rights at the Indo-Nepal Border' },
    stories: { title: 'Stories of Change | DEHAT' },
    work: { title: 'Our Work | Four Programmes | DEHAT' },
  }[id]);

  const graph = buildGraph({
    route,
    seo,
    seoFor,
    fields,
    stories,
    assetExists: () => true,
    origin: 'https://dehatindia.org',
  });

  assert.equal(graph['@context'], 'https://schema.org');
  assert.equal(graph['@graph'].length, 3);

  const [org, website, webpage] = graph['@graph'];

  assert.equal(org['@type'], 'NGO');
  assert.equal(org['@id'], 'https://dehatindia.org/#organization');
  assert.equal(org.name, 'DEHAT');
  assert.equal(org.legalName, 'Developmental Association for Human Advancement');
  assert.deepEqual(org.alternateName, ['DEHAT India']);
  assert.equal(org.url, 'https://dehatindia.org');
  assert.deepEqual(org.logo, { '@type': 'ImageObject', url: 'https://dehatindia.org/dehat-logo.png' });
  assert.equal(org.foundingDate, '1989');
  assert.equal(org.email, 'joinus@dehatindia.org');
  assert.equal(org.address['@type'], 'PostalAddress');
  assert.equal(org.address.postalCode, '271801');
  assert.equal(org.sameAs.length, 7);
  assert.equal(org.sameAs[0], 'https://www.wikidata.org/wiki/Q111469552');
  assert.equal(org.founder['@type'], 'Person');
  assert.equal(org.founder.name, 'Dr. Jitendra Chaturvedi');
  assert.equal(org.founder.birthDate, '1968-12-19');
  assert.equal(org.founder.deathDate, '2021-05');
  assert.equal(Object.hasOwn(org, 'registrationDate'), false);

  assert.equal(website['@type'], 'WebSite');
  assert.equal(website['@id'], 'https://dehatindia.org/#website');
  assert.equal(website.name, 'DEHAT');
  assert.equal(website.url, 'https://dehatindia.org');
  assert.deepEqual(website.publisher, { '@id': 'https://dehatindia.org/#organization' });
  assert.deepEqual(website.inLanguage, LANGUAGES);

  assert.equal(webpage['@type'], 'WebPage');
  assert.equal(webpage['@id'], 'https://dehatindia.org/#webpage');
  assert.equal(webpage.url, 'https://dehatindia.org/');
  assert.equal(webpage.name, seo.title);
  assert.equal(webpage.description, seo.description);
  assert.equal(webpage.inLanguage, 'en');
  assert.deepEqual(webpage.isPartOf, { '@id': 'https://dehatindia.org/#website' });
  assert.deepEqual(webpage.about, { '@id': 'https://dehatindia.org/#organization' });
  assert.equal(Object.hasOwn(webpage, 'breadcrumb'), false);
});

test('non-English homepage sets inLanguage and canonical without breadcrumb', () => {
  const route = router.parseUrl('/hi');
  const seo = {
    title: 'DEHAT | भारत-नेपाल सीमा पर बाल अधिकार',
    description: '1989 से एक युवा संगठन',
    ogImage: 'https://dehatindia.org/dehat-og.png',
  };
  const graph = buildGraph({
    route,
    seo,
    seoFor: () => null,
    fields,
    stories,
    assetExists: () => true,
  });

  assert.equal(graph['@graph'].length, 3);
  const webpage = graph['@graph'][2];
  assert.equal(webpage['@id'], 'https://dehatindia.org/hi#webpage');
  assert.equal(webpage.url, 'https://dehatindia.org/hi');
  assert.equal(webpage.inLanguage, 'hi');
  assert.equal(Object.hasOwn(webpage, 'breadcrumb'), false);
});

test('non-home page produces 4 nodes with BreadcrumbList', () => {
  const route = router.parseUrl('/impact');
  const seo = {
    title: 'Impact | Figures and Evidence | DEHAT',
    description: 'Evidence and verified numbers',
    ogImage: 'https://dehatindia.org/dehat-og.png',
  };
  const seoFor = (id, lang) => ({
    home: { title: 'DEHAT | Child Rights at the Indo-Nepal Border' },
  }[id]);

  const graph = buildGraph({
    route,
    seo,
    seoFor,
    fields,
    stories,
    assetExists: () => true,
  });

  assert.equal(graph['@graph'].length, 4);
  const webpage = graph['@graph'][2];
  const breadcrumb = graph['@graph'][3];

  assert.deepEqual(webpage.breadcrumb, { '@id': 'https://dehatindia.org/impact#breadcrumb' });
  assert.equal(breadcrumb['@type'], 'BreadcrumbList');
  assert.equal(breadcrumb['@id'], 'https://dehatindia.org/impact#breadcrumb');
  assert.deepEqual(breadcrumb.itemListElement, [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'DEHAT',
      item: 'https://dehatindia.org',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Impact',
      item: 'https://dehatindia.org/impact',
    },
  ]);
});

test('programme route produces 3-item breadcrumb trail: Home > Our Work > Programme', () => {
  const route = router.parseUrl('/programmes/school-of-leadership');
  const seo = {
    title: 'School of Leadership | DEHAT Programme',
    description: 'Leadership programme details',
    ogImage: 'https://dehatindia.org/dehat-og.png',
  };
  const seoFor = (id, lang) => ({
    home: { title: 'DEHAT | Child Rights at the Indo-Nepal Border' },
    work: { title: 'Our Work | Four Programmes | DEHAT' },
  }[id]);

  const graph = buildGraph({
    route,
    seo,
    seoFor,
    fields,
    stories,
    assetExists: () => true,
  });

  assert.equal(graph['@graph'].length, 4);
  const breadcrumb = graph['@graph'][3];
  assert.deepEqual(breadcrumb.itemListElement, [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'DEHAT',
      item: 'https://dehatindia.org',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Our Work',
      item: 'https://dehatindia.org/work',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'School of Leadership',
      item: 'https://dehatindia.org/programmes/school-of-leadership',
    },
  ]);
});

test('stories index route produces 2-item breadcrumb trail: Home > Stories', () => {
  const route = router.parseUrl('/ar/stories');
  const seo = {
    title: 'Stories of Change | DEHAT',
    description: 'Stories index',
    ogImage: 'https://dehatindia.org/dehat-og.png',
  };
  const seoFor = (id, lang) => ({
    home: { title: 'DEHAT | حقوق الطفل' },
  }[id]);

  const graph = buildGraph({
    route,
    seo,
    seoFor,
    fields,
    stories,
    assetExists: () => true,
  });

  assert.equal(graph['@graph'].length, 4);
  const breadcrumb = graph['@graph'][3];
  assert.deepEqual(breadcrumb.itemListElement, [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'DEHAT',
      item: 'https://dehatindia.org/ar',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Stories of Change',
      item: 'https://dehatindia.org/ar/stories',
    },
  ]);
});

test('story route produces 5 nodes including Article with image and temporalCoverage', () => {
  const route = router.parseUrl('/stories/sixteen-girls-and-a-truck');
  const seo = {
    title: 'Sixteen Girls, Sixteen Bicycles, and a Truck That Could Not Leave',
    description: 'A story of sixteen girls cycling home',
    ogImage: 'https://dehatindia.org/dehat-og.png',
  };
  const seoFor = (id, lang) => ({
    home: { title: 'DEHAT | Child Rights at the Indo-Nepal Border' },
    stories: { title: 'Stories of Change | DEHAT' },
  }[id]);

  const graph = buildGraph({
    route,
    seo,
    seoFor,
    fields,
    stories,
    assetExists: path => path === 'assets/story/story-001.png',
  });

  assert.equal(graph['@graph'].length, 5);

  const breadcrumb = graph['@graph'][3];
  assert.deepEqual(breadcrumb.itemListElement, [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'DEHAT',
      item: 'https://dehatindia.org',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Stories of Change',
      item: 'https://dehatindia.org/stories',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Sixteen Girls, Sixteen Bicycles, and a Truck That Could Not Leave',
      item: 'https://dehatindia.org/stories/sixteen-girls-and-a-truck',
    },
  ]);

  const article = graph['@graph'][4];
  assert.equal(article['@type'], 'Article');
  assert.equal(article['@id'], 'https://dehatindia.org/stories/sixteen-girls-and-a-truck#article');
  assert.equal(article.headline, 'Sixteen Girls, Sixteen Bicycles, and a Truck That Could Not Leave');
  assert.equal(article.description, seo.description);
  assert.equal(article.inLanguage, 'en');
  assert.equal(article.url, 'https://dehatindia.org/stories/sixteen-girls-and-a-truck');
  assert.deepEqual(article.mainEntityOfPage, { '@id': 'https://dehatindia.org/stories/sixteen-girls-and-a-truck#webpage' });
  assert.deepEqual(article.author, { '@id': 'https://dehatindia.org/#organization' });
  assert.deepEqual(article.publisher, { '@id': 'https://dehatindia.org/#organization' });
  assert.deepEqual(article.image, ['https://dehatindia.org/assets/story/story-001.png']);
  assert.equal(article.temporalCoverage, '2013');
  assert.equal(Object.hasOwn(article, 'datePublished'), false);
  assert.equal(Object.hasOwn(article, 'dateModified'), false);
});

test('story route falls back to dehat-og.png when image asset is missing', () => {
  const route = router.parseUrl('/stories/sixteen-girls-and-a-truck');
  const seo = {
    title: 'Sixteen Girls | DEHAT',
    description: 'Story dek',
  };
  const graph = buildGraph({
    route,
    seo,
    seoFor: () => null,
    fields,
    stories,
    assetExists: () => false,
  });

  const article = graph['@graph'][4];
  assert.deepEqual(article.image, ['https://dehatindia.org/dehat-og.png']);
  assert.equal(article.headline, 'Sixteen Girls');
});

test('story title strips trailing " | DEHAT" but preserves interior pipes', () => {
  const route = router.parseUrl('/stories/sixteen-girls-and-a-truck');
  const seo = {
    title: 'Part 1 | Part 2 | DEHAT',
    description: 'Multi-part story',
  };
  const graph = buildGraph({
    route,
    seo,
    seoFor: () => null,
    fields,
    stories,
    assetExists: () => false,
  });

  const breadcrumb = graph['@graph'][3];
  assert.equal(breadcrumb.itemListElement[2].name, 'Part 1 | Part 2');

  const article = graph['@graph'][4];
  assert.equal(article.headline, 'Part 1 | Part 2');
});

test('buildGraph is pure and does not mutate its inputs', () => {
  const route = Object.freeze(router.parseUrl('/stories/sixteen-girls-and-a-truck'));
  const seo = Object.freeze({
    title: 'Sixteen Girls | DEHAT',
    description: 'Frozen test SEO',
    ogImage: 'https://dehatindia.org/dehat-og.png',
  });
  const frozenFields = Object.freeze(JSON.parse(JSON.stringify(fields)));
  Object.freeze(frozenFields.organization);
  Object.freeze(frozenFields.organization.sameAs);
  Object.freeze(frozenFields.website);

  const frozenStories = Object.freeze([...stories.map(s => Object.freeze({ ...s }))]);

  const run1 = buildGraph({
    route,
    seo,
    seoFor: () => ({ title: 'Parent | DEHAT' }),
    fields: frozenFields,
    stories: frozenStories,
    assetExists: () => true,
  });

  const run2 = buildGraph({
    route,
    seo,
    seoFor: () => ({ title: 'Parent | DEHAT' }),
    fields: frozenFields,
    stories: frozenStories,
    assetExists: () => true,
  });

  assert.deepEqual(run1, run2);
});

test('custom origin parameter is respected across all node IDs and URLs', () => {
  const route = router.parseUrl('/programmes/school-of-leadership');
  const seo = { title: 'Leadership | DEHAT' };
  const origin = 'https://preview.dehatindia.org';

  const graph = buildGraph({
    route,
    seo,
    seoFor: () => ({ title: 'Parent | DEHAT' }),
    fields,
    stories,
    assetExists: () => true,
    origin,
  });

  assert.equal(graph['@graph'][0]['@id'], 'https://preview.dehatindia.org/#organization');
  assert.equal(graph['@graph'][0].url, 'https://preview.dehatindia.org');
  assert.equal(graph['@graph'][0].logo.url, 'https://preview.dehatindia.org/dehat-logo.png');
  assert.equal(graph['@graph'][1]['@id'], 'https://preview.dehatindia.org/#website');
  assert.equal(graph['@graph'][1].url, 'https://preview.dehatindia.org');
  assert.equal(graph['@graph'][2]['@id'], 'https://preview.dehatindia.org/programmes/school-of-leadership#webpage');
  assert.equal(graph['@graph'][3]['@id'], 'https://preview.dehatindia.org/programmes/school-of-leadership#breadcrumb');
  assert.equal(graph['@graph'][3].itemListElement[0].item, 'https://preview.dehatindia.org');
});
