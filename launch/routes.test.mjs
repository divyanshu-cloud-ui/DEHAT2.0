import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import {
  LANGUAGES, RTL_LANGUAGES, PROGRAMMES, FIXED_ROUTES, LEGAL_ROUTES, API_ROUTES,
  createRouter, routeInventory, parseUrl, pathFor, migrateLegacy, preferredHomeRedirect,
} from './routes.mjs';

// Read actual public data rather than maintaining a second story-slug list.
const sandbox = { window: {} };
vm.runInNewContext(await readFile(new URL('../stories-data.js', import.meta.url), 'utf8'), sandbox);
const stories = Array.from(sandbox.window.STORIES, story => ({ ...story }));
const projectSource = await readFile(new URL('../projects-data.js', import.meta.url), 'utf8');
const { PROJECTS: projects } = await import(`data:text/javascript;base64,${Buffer.from(projectSource).toString('base64')}`);
const router = createRouter(stories, { projects });

test('inventory matches all current source languages, programmes and 117 unique stories', async () => {
  const html = await readFile(new URL('../DEHAT.dc.html', import.meta.url), 'utf8');
  const langsSource = html.slice(html.indexOf('  _langs() {'), html.indexOf('\n  _jGo('));
  const sourceLanguages = [...langsSource.matchAll(/code:\s*'([^']+)'/g)].map(match => match[1]);
  assert.deepEqual([...LANGUAGES].sort(), sourceLanguages.sort());
  assert.equal(LANGUAGES.length, 28);
  assert.equal(new Set(LANGUAGES).size, 28);
  assert.deepEqual([...RTL_LANGUAGES].sort(), ['ar', 'ks', 'sd', 'ur']);
  assert.deepEqual(Object.keys(PROGRAMMES).sort(), ['cj', 'hp', 're', 'sol']);
  assert.equal(FIXED_ROUTES.length, 17);
  assert.equal(stories.length, 117);
  assert.equal(new Set(stories.map(story => story.slug)).size, 117);
  assert.equal(router.inventory().length, 134);
  assert.equal(router.inventory({ localized: true }).length, 3752);
  assert.equal(new Set(router.inventory({ localized: true }).map(route => route.path)).size, 3752);
});

test('every route/language round-trips with a durable story identity', () => {
  for (const route of router.inventory()) {
    for (const lang of LANGUAGES) {
      const path = router.pathFor(route.id, lang);
      const result = router.parseUrl(path);
      assert.equal(result.status, 200, path);
      assert.equal(result.kind, 'app', path);
      assert.equal(result.routeId, route.id, path);
      assert.equal(result.view, route.view, path);
      assert.equal(result.lang, lang, path);
      assert.equal(result.dir, RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr', path);
      assert.equal(result.canonicalPath, path, path);
      assert.equal(result.redirectTo, null, path);
      assert.equal(result.storySlug, route.storySlug || null, path);
      assert.equal(result.progKey, route.progKey || null, path);
      assert.equal(result.pTab, route.pTab || null, path);
      assert.equal(router.pathFor(result, result.lang), path, path);
      if (path !== '/') assert.ok(!path.endsWith('/'), path);
    }
  }
});

test('explicit finite aliases normalize once and preserve query/fragment', () => {
  const cases = [
    ['/DEHAT.dc.html', '/'], ['/DEHAT.dc.html?cv=123#impact', '/?cv=123#impact'],
    ['/get-involved', '/get-involved/case'], ['/programmes', '/work'],
    ['/hi/get-involved', '/hi/get-involved/case'], ['/ar/programmes', '/ar/work'],
    ['/hi/', '/hi'], ['/impact/', '/impact'], ['/en/impact', '/impact'],
    ['/en', '/'], ['/en/', '/'], ['/en/programmes', '/work'],
    ['/hi/finance/?utm_source=archive#governance', '/hi/finance?utm_source=archive#governance'],
    ['/%69mpact', '/impact'], ['/%68i/impact', '/hi/impact'],
  ];
  for (const [from, to] of cases) {
    const parsed = router.parseUrl(from);
    assert.equal(parsed.status, 301, from);
    assert.equal(parsed.redirectTo, to, from);
    assert.equal(router.parseUrl(to).status, 200, to);
    assert.equal(router.parseUrl(to).redirectTo, null, to);
  }
});

test('unknown routes/locales/slugs do not produce homepage or first-story fallbacks', () => {
  for (const url of [
    '/unknown', '/hi/unknown', '/de/impact', '/HI/impact', '/hi-IN/impact',
    '/programmes/inst', '/programmes/nope', '/prog/sol', '/impact/more',
    '/stories/missing', '/stories/a-friend-who-noticed/more', '/get-involved/answer',
    '/get-involved/nope', '/hi/DEHAT.dc.html', '/assets/docs/private.pdf',
    '/_internal/qa/ROUTING_DESIGN_157.md', '/api/donations/create-order',
  ]) {
    const result = router.parseUrl(url);
    assert.equal(result.status, 404, url);
    assert.equal(result.kind, 'not-found', url);
    assert.equal(result.canonicalPath, null, url);
    assert.equal(result.redirectTo, null, url);
  }
  assert.equal(router.parseUrl('/ar/unknown').dir, 'rtl');
});

test('malformed encodings and path separators cannot change route meaning', () => {
  for (const url of [
    '', 'impact', '//dehatindia.org/impact', 'javascript:alert(1)', '/hi//impact',
    '/hi/%2fimpact', '/hi%2fimpact', '/hi/%5cimpact', '/hi/%252fimpact',
    '/%ZZ', '/hi/%E0%A4%A', '/hi/../impact', '/hi/%2e%2e/impact',
    '/hi/./impact', '/hi/%00impact', '/impact ', ' /impact', '/hi\\impact',
  ]) assert.equal(router.parseUrl(url).status, 404, url);
  assert.equal(router.parseUrl('https://dehatindia.org/ar/impact').lang, 'ar');
  assert.equal(router.parseUrl(new URL('http://127.0.0.1:8897/finance')).view, 'finance');
});

test('canonical locale is determined only by the path', () => {
  assert.equal(router.parseUrl('/impact').lang, 'en');
  assert.equal(router.parseUrl('/hi/impact').lang, 'hi');
  assert.equal(router.parseUrl('/ar/impact').dir, 'rtl');
  for (const lang of LANGUAGES) {
    assert.equal(router.pathFor({ view: 'stories', storySlug: 'a-friend-who-noticed' }, lang),
      `${lang === 'en' ? '' : `/${lang}`}/stories/a-friend-who-noticed`);
  }
  assert.throws(() => router.pathFor('impact', 'de'), /Unsupported language/);
  assert.throws(() => router.pathFor('impact', 'HI'), /Unsupported language/);
});

test('only an explicit stored picker choice on the exact root produces a home redirect', () => {
  for (const lang of LANGUAGES) {
    assert.equal(router.preferredHomeRedirect('/', lang), lang === 'en' ? null : `/${lang}`);
  }
  for (const stored of [undefined, null, '', 'de', 'hi-IN', '/evil', 'HI']) {
    assert.equal(router.preferredHomeRedirect('/', stored), null);
  }
  for (const url of ['/impact', '/hi', '/en', '/DEHAT.dc.html', '/#impact', '/?utm_source=email']) {
    assert.equal(router.preferredHomeRedirect(url, 'ar'), null, url);
  }
  assert.equal(router.preferredHomeRedirect('https://dehatindia.org/', 'hi'), '/hi');
});

test('all approved legacy views migrate without a hash router or HTTP redirect claim', () => {
  const cases = [
    ['home', '/'], ['who', '/who'], ['work', '/work'], ['impact', '/impact'],
    ['stories', '/stories'], ['finance', '/finance'], ['media', '/media'],
    ['answers', '/answers'], ['policies', '/policies'],
    ['prog', '/programmes/rights-and-entitlements'],
    ['prog/sol', '/programmes/school-of-leadership'],
    ['prog/re', '/programmes/rights-and-entitlements'],
    ['prog/cj', '/programmes/climate-justice'],
    ['prog/hp', '/programmes/human-protection'],
    ['involved', '/get-involved/route'], ['involved/case', '/get-involved/case'],
    ['involved/route', '/get-involved/route'], ['involved/give', '/get-involved/give'],
    ['involved/people', '/get-involved/people'], ['involved/answer', '/finance#governance'],
  ];
  for (const [hash, expected] of cases) {
    for (const landing of ['/', '/DEHAT.dc.html']) {
      const result = router.migrateLegacy(`${landing}#${hash}`);
      assert.equal(result.status, 200, hash);
      assert.equal(result.replaceTo, expected, hash);
      assert.equal(result.redirectTo, null, hash);
      assert.equal(router.parseUrl(result.replaceTo).status, 200, hash);
    }
    const result = router.migrateLegacy(`/#${hash}`, { storedLanguage: 'hi' });
    assert.equal(result.replaceTo, `/hi${expected === '/' ? '' : expected}`, hash);
  }
  assert.equal(router.migrateLegacy('/?utm_source=email#impact').replaceTo, '/impact?utm_source=email');
  assert.equal(router.migrateLegacy('/ar#impact', { storedLanguage: 'hi' }).replaceTo, '/ar/impact');
  assert.equal(router.migrateLegacy('/en#impact', { storedLanguage: 'hi' }).replaceTo, '/impact');
  assert.equal(router.migrateLegacy('/#impact', { storedLanguage: 'de' }).replaceTo, '/impact');
  assert.equal(router.migrateLegacy('/#involved/answer').anchor, 'governance');
});

test('ordinary anchors are not legacy routes and invalid legacy subroutes are explicit 404s', () => {
  for (const url of ['/finance#governance', '/hi/finance#governance', '/#cycle', '/#where', '/#unknown', '/who#impact', '/#%ZZ']) {
    assert.equal(router.migrateLegacy(url), null, url);
  }
  for (const url of ['/#prog/inst', '/#involved/nope', '/#who/extra', '/#prog/sol/extra', '/#prog/']) {
    assert.equal(router.migrateLegacy(url).status, 404, url);
  }
  assert.equal(router.parseUrl('/finance#governance').anchor, 'governance');
  assert.equal(router.parseUrl('/finance#missing').anchor, null);
  assert.equal(router.parseUrl('/finance#%ZZ').status, 200);
  assert.equal(router.pathFor('finance', 'ar', { anchor: 'governance' }), '/ar/finance#governance');
  assert.throws(() => router.pathFor('finance', 'en', { anchor: 'made-up' }), /Unknown route anchor/);
});

test('project links validate actual programme membership and keep programme canonical', () => {
  assert.equal(projects.length, 48);
  for (const project of projects) {
    for (const progKey of Object.keys(PROGRAMMES)) {
      const belongs = project.prog === progKey || project.cross.includes(progKey);
      if (!belongs) {
        assert.throws(() => router.pathFor(`prog/${progKey}`, 'hi', { projectId: project.id }), /Project/);
        continue;
      }
      const link = router.pathFor(`prog/${progKey}`, 'hi', { projectId: project.id });
      const result = router.parseUrl(link);
      assert.equal(result.projectId, project.id);
      assert.equal(result.anchor, 'projects');
      assert.equal(result.canonicalPath, `/hi/programmes/${PROGRAMMES[progKey]}`);
      assert.equal(result.status, 200);
    }
  }
  const programme = '/programmes/school-of-leadership';
  for (const query of ['project=999', 'project=01', 'project=-1', 'project=x', 'project=1&project=2']) {
    const result = router.parseUrl(`${programme}?${query}#projects`);
    assert.equal(result.status, 200);
    assert.equal(result.projectId, null);
    assert.equal(result.canonicalPath, programme);
  }
  assert.equal(router.parseUrl('/who?project=1').projectId, null);
  assert.equal(createRouter(stories).parseUrl(`${programme}?project=1`).projectId, null);
});

test('legal URLs remain English-only and are outside app alternates', () => {
  assert.equal(LEGAL_ROUTES.length, 3);
  for (const legal of LEGAL_ROUTES) {
    const canonical = router.parseUrl(legal.path);
    assert.equal(canonical.kind, 'legal');
    assert.equal(canonical.status, 200);
    assert.equal(canonical.lang, 'en');
    assert.equal(canonical.source, legal.source);
    assert.equal(router.parseUrl(legal.path.slice(0, -1)).redirectTo, legal.path);
    assert.ok(!router.inventory({ localized: true }).some(route => route.path === legal.path));
    for (const lang of LANGUAGES) assert.equal(router.parseUrl(`/${lang}${legal.path}`).status, 404);
  }
});

test('API identities are explicit and never localized or added to document inventory', () => {
  assert.equal(API_ROUTES.length, 7);
  assert.equal(new Set(API_ROUTES.map(route => route.path)).size, 7);
  assert.equal(API_ROUTES.filter(route => route.method === 'GET').length, 1);
  assert.equal(API_ROUTES.find(route => route.method === 'GET').path, '/api/paypal/config');
  for (const endpoint of API_ROUTES) {
    assert.equal(router.parseUrl(endpoint.path).status, 404);
    assert.ok(!router.inventory().some(route => route.path === endpoint.path));
  }
});

test('invalid manifest data fails rather than creating ambiguous output paths', () => {
  for (const slug of ['', undefined, '../finance', 'a/b', 'UPPER', '-story', 'a--b', 'hi%2ffoo']) {
    assert.throws(() => createRouter([{ slug }]), /Invalid story slug/);
  }
  assert.throws(() => createRouter(['same-story', 'same-story']), /Duplicate story/);
  assert.throws(() => createRouter(null), /arrays/);
  assert.throws(() => createRouter([], { projects: [{ id: 1 }, { id: 1 }] }), /duplicate project/);
  assert.throws(() => createRouter([], { projects: [{ id: -1 }] }), /project ID/);
  assert.throws(() => router.pathFor({ view: 'prog', progKey: 'inst' }), /Unknown app route/);
  assert.throws(() => router.pathFor({ view: 'stories', storySlug: 'missing' }), /Unknown app route/);
});

test('convenience exports have the same behaviour as an instantiated router', () => {
  const context = { stories, projects };
  assert.equal(routeInventory(stories).length, 134);
  assert.equal(parseUrl('/stories/a-friend-who-noticed', context).storySlug, 'a-friend-who-noticed');
  assert.equal(pathFor('story/a-friend-who-noticed', 'hi', {}, context), '/hi/stories/a-friend-who-noticed');
  assert.equal(migrateLegacy('/#policies', {}, context).replaceTo, '/policies');
  assert.equal(preferredHomeRedirect('/', 'ar'), '/ar');
  assert.ok(Object.isFrozen(FIXED_ROUTES));
  assert.ok(Object.isFrozen(FIXED_ROUTES[0]));
  assert.ok(Object.isFrozen(router.routes));
});
