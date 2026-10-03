// A launch-only adapter for the unmodified generated DC runtime. The editable
// component has opt-in hooks; ordinary DEHAT.dc.html previews keep their behaviour.
import { createRouter, LANGUAGES, PROGRAMMES } from './routes.mjs';

const frame = () => new Promise(resolve => requestAnimationFrame(resolve));
const script = src => new Promise((resolve, reject) => {
  const element = document.createElement('script');
  element.src = src; element.onload = resolve;
  element.onerror = () => reject(new Error(`Required script failed: ${src}`));
  document.head.append(element);
});
const modules = {
  _pd: ['/projects-data.js'], _px: ['/programme-extras.js'], _il: ['/impact-lenses.js'],
  _jd: ['/journey-data.js', 'JOURNEY'], _pt: ['/partner-data.js', 'PARTNER'],
  _rg: ['/register-data.js?v=4'], _wd: ['/who-data.js?v=3', 'WHO'],
  _wp: ['/who-profiles.js'], _we: ['/who-en.js', 'TEAM_EN'],
};
const routePatch = (route, stories) => ({
  view: route.view, lang: route.lang, booting: false, navOpen: false, navGroup: '',
  progKey: route.progKey || 're', pTab: route.pTab || 'route', storySlug: null,
  stEntered: !!route.storySlug, stIdx: route.storySlug ? stories.findIndex(s => s.slug === route.storySlug) : 0,
  stF: {}, stFiltersOpen: false, expanded: route.projectId || null,
});

async function start() {
  const diagnostics = { phase: 'loading', errors: [], started: performance.now(), shifts: 0 };
  window.DEHAT_LAUNCH_DIAGNOSTICS = diagnostics;
  try {
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) diagnostics.shifts += entry.value;
    }).observe({ type: 'layout-shift', buffered: true });
  } catch { /* LayoutShift is not exposed by every browser. */ }
  let settle, fail;
  const ready = new Promise((resolve, reject) => { settle = resolve; fail = reject; });
  ready.catch(() => {});
  window.DEHAT_LAUNCH_READY = ready;
  try {
    await Promise.all([script('/stories-data.js'), script('/media-data.js')]);
    const records = window.STORIES;
    if (!Array.isArray(records) || !records.length) throw new Error('Story data is absent');
    const loaded = Object.fromEntries(await Promise.all(Object.entries(modules).map(async ([key, [url, field]]) => {
      const value = await import(url); return [key, field ? value[field] : value];
    })));
    await Promise.all([import('/finance-data.js'), import('/faq-data.js')]);
    loaded._fin = window.FIN; loaded._faq = window.FAQ;
    if (Object.values(loaded).some(value => !value)) throw new Error('Required route data is absent');
    const router = createRouter(records, { projects: loaded._pd.PROJECTS });
    const current = () => location.pathname + location.search + location.hash;
    let stored; try { stored = localStorage.getItem('dehat.lang'); } catch {}
    const legacy = router.migrateLegacy(current(), { storedLanguage: stored });
    let route = legacy || router.parseUrl(current());
    if (legacy?.replaceTo) history.replaceState(null, '', legacy.replaceTo);
    if (route.status === 301) { history.replaceState(null, '', route.redirectTo); route = router.parseUrl(current()); }
    if (route.status !== 200 || route.kind !== 'app') throw new Error('No matching app route');
    if (route.lang !== 'en') {
      await script(`/content-i18n/${route.lang}.js`);
      if (!window.CONTENT_I18N?.[route.lang]) throw new Error('Required translation is absent');
    }
    document.documentElement.lang = route.lang;
    document.documentElement.dir = route.dir;
    // A truthy resource table disables the DC runtime's redundant source-page fetch.
    // Missing keys retain the runtime's normal URL fallback for child components.
    window.__resources = {};
    let component, applying = false, liveReady = false;
    const baseHref = (view, lang) => router.pathFor(view === 'involved' ? 'involved/case' : view, lang);
    const enrich = values => {
      const lang = component.state.lang;
      values.launchPaths = Object.fromEntries(['home','who','work','impact','stories','finance','media','answers','policies'].map(view => [view, baseHref(view, lang)]));
      values.launchPaths.give = router.pathFor('involved/give', lang);
      values.launchPaths.case = router.pathFor('involved/case', lang);
      for (const item of values.footItems || []) item.href = baseHref(item.k, lang);
      for (const item of values.navGroups || []) {
        item.href = baseHref(item.k, lang);
        for (const child of item.children || []) child.href = PROGRAMMES[child.k]
          ? router.pathFor(`prog/${child.k}`, lang)
          : ['route','people'].includes(child.k) ? router.pathFor(`involved/${child.k}`, lang)
          : child.k === 'answer' ? router.pathFor('finance', lang, {anchor:'governance'}) : baseHref(child.k, lang);
      }
      for (const face of values.faces || []) face.href = router.pathFor(`story/${face.slug}`, lang);
      return values;
    };
    const apply = instance => {
      const next = router.parseUrl(current());
      if (next.status !== 200 || next.kind !== 'app') { location.assign(current()); return; }
      if (next.lang !== instance.state.lang) { location.assign(current()); return; }
      route = next; window.DEHAT_LAUNCH.route = route; applying = true;
      instance.setState(routePatch(route, records), () => {
        applying = false;
        if (route.anchor) document.getElementById(route.anchor)?.scrollIntoView();
      });
    };
    window.DEHAT_LAUNCH = {
      route, initialState: {...routePatch(route, records), projects: loaded._pd.PROJECTS},
      attach(instance) {
        component = instance; Object.assign(instance, loaded);
        instance._loadProjects = () => {}; instance._loadFinance = () => {};
        const render = instance.renderVals.bind(instance);
        instance.renderVals = () => enrich(render());
        // Avoid combining snapshot and live sections in the global scroll observer.
        const scan = instance._spineScan.bind(instance);
        instance._spineScan = () => { if (liveReady) scan(); };
        instance._heroTouched = true;
        instance.forceUpdate();
      },
      apply,
      sync(instance) {
        if (applying || !liveReady) return;
        const vals = instance._longReads(() => {});
        const state = {...instance.state, storySlug: instance.state.view === 'stories' && instance.state.stEntered ? vals.sd.slug : null};
        const destination = router.pathFor(state, instance.state.lang);
        if (destination !== location.pathname) {
          // Language changes get the matching server body/head, without a mixed-language flash.
          if (instance.state.lang !== route.lang) { location.assign(destination); return; }
          history.pushState(null, '', destination); route = router.parseUrl(destination);
          window.DEHAT_LAUNCH.route = route;
          // POC route changes use their prerendered document for canonical/SEO consistency.
          location.replace(destination);
        }
      },
    };
    const response = await fetch('/launch/runtime-template.html');
    if (!response.ok) throw new Error('Launch template failed to load');
    const parsed = new DOMParser().parseFromString(await response.text(), 'text/html');
    const template = parsed.querySelector('x-dc'), logic = parsed.querySelector('script[data-dc-script]');
    if (!template || !logic) throw new Error('Launch template has no component');
    const host = document.getElementById('launch-live');
    // The runtime reads x-dc.innerHTML once, then replaces the element. Keep its
    // uncompiled branches inert: inserting them would download images for every
    // page before the renderer has evaluated conditional sections.
    const inertComponent = document.createElement('x-dc');
    const sourceMarkup = template.innerHTML;
    Object.defineProperty(inertComponent, 'innerHTML', {get: () => sourceMarkup});
    host.append(inertComponent, document.importNode(logic, true));
    await script('/support.js');
    const deadline = performance.now() + 20000;
    while (!component || !host.querySelector('main') || component.state.booting || (route.view === 'media' && !host.querySelector('.m-card'))) {
      if (performance.now() > deadline) throw new Error('Live page did not become ready');
      await frame();
    }
    await document.fonts.ready;
    for (const node of host.querySelectorAll('[data-anchor]')) node.id ||= node.getAttribute('data-anchor');
    await frame(); await frame();
    const fallback = document.getElementById('launch-snapshot');
    fallback?.remove(); host.removeAttribute('inert'); host.removeAttribute('aria-hidden');
    host.classList.add('launch-active'); liveReady = true;
    component._navMeasure?.(); component._spineScan(); component._revealAll();
    await frame(); await frame();
    diagnostics.phase = 'ready'; diagnostics.readyAt = performance.now();
    diagnostics.route = route.canonicalPath; diagnostics.lang = route.lang;
    settle(diagnostics);
    // State-driven back/forward works for same-document entries; anchors stay native.
    addEventListener('hashchange', () => { if (router.migrateLegacy(current())) apply(component); });
  } catch (error) {
    diagnostics.phase = 'failed'; diagnostics.errors.push(error.message);
    document.getElementById('launch-live')?.remove();
    fail(error); console.error('[launch]', error.message);
  }
}

// Export the exact approved pre-paint picker rule for the generator's inline head script.
export const pickerRedirectSource = `try{if(location.pathname==='/'&&!location.search&&!location.hash){var l=localStorage.getItem('dehat.lang');if(${JSON.stringify(LANGUAGES)}.includes(l)&&l!=='en')location.replace('/'+l)}}catch(e){}`;
if (typeof window !== 'undefined' && document.getElementById('launch-live')) start();
