// A launch-only adapter for the unmodified generated DC runtime. The editable
// component has opt-in hooks; ordinary DEHAT.dc.html previews keep their behaviour.
import {observeArtwork} from './artwork.mjs';
import { createRouter, LANGUAGES, PROGRAMMES } from './routes.mjs';
import {REACT_URL, REACT_DOM_URL, REACT_ASSET, REACT_DOM_ASSET} from './performance-assets.mjs';
import {PARTNER_TABS} from './partner-tabs.mjs';

const frame = () => new Promise(resolve => requestAnimationFrame(resolve));
// The pre-rendered snapshot is the page a reader sees first. Start the heavy runtime downloads
// only once its first screen has painted, including a late hero image (story art paints a moment
// after the text), so they do not compete with that screen for the network: wait for the first
// contentful paint, then for the largest paint to stay unchanged for a short quiet window.
// Capped so a slow image, a background tab or a browser without paint timing still boots promptly.
const afterFirstPaint = () => new Promise(resolve => {
  let done = false, quiet = 0, painted = false;
  const go = () => { if (!done) { done = true; clearTimeout(quiet); setTimeout(resolve, 0); } };
  // A web font arriving repaints the text in it, which is a new largest paint: wait for the
  // fonts the first screen uses too.
  const fontsReady = () => (document.fonts?.ready || Promise.resolve()).then(go, go);
  const settle = () => { clearTimeout(quiet); quiet = setTimeout(fontsReady, 250); };
  try {
    new PerformanceObserver(list => { if (painted && list.getEntries().length) settle(); }).observe({type: 'largest-contentful-paint', buffered: true});
  } catch { /* Largest paint timing is not exposed by every browser. */ }
  try {
    const first = () => { painted = true; settle(); };
    if (performance.getEntriesByName('first-contentful-paint').length) first();
    else new PerformanceObserver((list, observer) => {
      if (!list.getEntriesByName('first-contentful-paint').length) return;
      observer.disconnect(); first();
    }).observe({type: 'paint', buffered: true});
  } catch { addEventListener('load', go, {once: true}); }
  setTimeout(go, 1500);
});
const script = src => new Promise((resolve, reject) => {
  const element = document.createElement('script');
  element.src = src; element.onload = resolve;
  element.onerror = () => reject(new Error(`Required script failed: ${src}`));
  document.head.append(element);
});
const coreModules = {
  _pd: ['/projects-data.js'], _px: ['/programme-extras.js'],
};
const routeModules = {
  impact: {_il: ['/impact-lenses.js']},
  work: {_jd: ['/journey-data.js', 'JOURNEY']},
  prog: {_jd: ['/journey-data.js', 'JOURNEY']},
  who: {_rg: ['/register-data.js?v=4'], _wd: ['/who-data.js?v=3', 'WHO'], _wp: ['/who-profiles.js'], _we: ['/who-en.js', 'TEAM_EN']},
  answers: {_faq: ['/faq-data.js', 'FAQ']},
};
const loadModules = async entries => Object.fromEntries(await Promise.all(Object.entries(entries).map(async ([key,[url,field]]) => {
  const module=await import(url);
  return [key,field==='FAQ'?window.FAQ:(field?module[field]:module)];
})));
const loadPartner = async lang => {
  const [english, translated] = await Promise.all([
    import('/launch/partner/en.mjs'),
    lang === 'en' ? Promise.resolve(null) : import(`/launch/partner/${lang}.mjs`),
  ]);
  return translated ? {en:english.DATA, [lang]:translated.DATA} : {en:english.DATA};
};
const routePatch = (route, stories) => ({
  view: route.view, lang: route.lang, booting: false, navOpen: false, navGroup: '',
  progKey: route.progKey || 're', pTab: route.pTab || 'route', storySlug: null,
  stEntered: !!route.storySlug, stIdx: route.storySlug ? stories.findIndex(s => s.slug === route.storySlug) : 0,
  stF: {}, stFiltersOpen: false, expanded: route.projectId || null,
});

function installAnimationBudget(root) {
  if (!('IntersectionObserver' in window) || !root.getAnimations) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const targets = new Set();
  const pausedHere = new WeakSet();
  const visible = element => {
    const box = element.getBoundingClientRect();
    return box.bottom > 0 && box.top < innerHeight && box.right > 0 && box.left < innerWidth;
  };
  const update = (element, inView) => {
    if (!element.isConnected) {targets.delete(element); observer.unobserve(element); return;}
    // A group (data-anim-group) pauses and resumes every endless animation inside it together.
    for (const animation of element.matches('[data-anim-group]') ? element.getAnimations({subtree:true}) : element.getAnimations()) {
      if (animation.effect?.getTiming().iterations !== Infinity) continue;
      if (reduced.matches) {animation.cancel(); continue;}
      if (inView && !document.hidden) {
        if (pausedHere.has(animation)) {animation.play(); pausedHere.delete(animation);}
      } else if (animation.playState === 'running') {
        animation.pause(); pausedHere.add(animation);
      }
    }
  };
  const observer = new IntersectionObserver(entries => entries.forEach(entry => update(entry.target, entry.isIntersecting)));
  const register = element => {
    if (!(element instanceof Element)) return;
    // Animations that only stay correct together, such as the Cycle ring turning one way while each
    // thumbnail turns back the other way to stay upright, are budgeted as one group: pausing them
    // separately as they scrolled in and out of view left the thumbnails tilted.
    element = element.closest('[data-anim-group]') || element;
    if (!targets.has(element)) {targets.add(element); observer.observe(element);}
    update(element, visible(element));
  };
  const scan = () => root.getAnimations({subtree:true}).forEach(animation => {
    if (animation.effect?.getTiming().iterations === Infinity) register(animation.effect.target);
  });
  root.addEventListener('animationstart', event => queueMicrotask(() => register(event.target)), true);
  document.addEventListener('visibilitychange', () => targets.forEach(element => update(element, visible(element))));
  scan();
  return {scan, counts: () => ({running:document.getAnimations().filter(animation => animation.playState === 'running').length,
    infiniteRunning:document.getAnimations().filter(animation => animation.playState === 'running' && animation.effect?.getTiming().iterations === Infinity).length})};
}

// The pre-rendered snapshot shows the section menu at once, but its buttons only act once the live
// page takes over, which on a slow phone can be more than ten seconds. Until then a tap jumps to the
// matching snapshot section: the menu's buttons and the [data-spine] sections share one order in
// every language, so the index maps button to section without reading any label.
export function snapshotSectionMenu(snapshot) {
  if (!snapshot) return;
  snapshot.addEventListener('click', event => {
    const button = event.target.closest?.('.subnav-link');
    if (!button || !snapshot.contains(button)) return;
    const buttons = [...snapshot.querySelectorAll('.subnav-link')];
    const target = [...snapshot.querySelectorAll('[data-spine]')][buttons.indexOf(button)];
    if (!target) return;
    event.preventDefault();
    for (const item of buttons) item.setAttribute('aria-current', item === button ? 'true' : 'false');
    // Land below the sticky header and menu bar, as the live page does.
    const bar = button.closest('[data-subnav]') || button.parentElement;
    const top = target.getBoundingClientRect().top + scrollY - Math.max(0, bar.getBoundingClientRect().bottom);
    scrollTo({top, behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  });
}

async function start() {
  snapshotSectionMenu(document.getElementById('launch-snapshot'));
  observeArtwork();
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) document.documentElement.classList.add('dehat-low-effects');
  window.DEHAT_NAV = PARTNER_TABS;
  // support.js resolves these exact upstream URLs to same-origin verified copies.
  window.__resources = {...window.__resources, [REACT_URL]: REACT_ASSET, [REACT_DOM_URL]: REACT_DOM_ASSET};
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
    await afterFirstPaint();
    // Begin independent network work together. The snapshot stays visible until
    // the live component has rendered, so a slow data file cannot delay these
    // downloads or make the page flash.
    const templateRequest = fetch('/launch/runtime-template.html');
    const storiesData = script('/stories-data.js');
    const path = location.pathname;
    const mediaNeeded = path === '/' || path === '/media' || /^\/[a-z]{2,3}(?:\/media)?$/.test(path);
    const mediaData = mediaNeeded ? script('/media-data.js') : Promise.resolve();
    const moduleData = loadModules(coreModules);
    const financeData = import('/finance-data.js');
    await storiesData;
    const records = window.STORIES;
    if (!Array.isArray(records) || !records.length) throw new Error('Story data is absent');
    const loaded = await moduleData;
    await financeData;
    loaded._fin = window.FIN;
    if (Object.values(loaded).some(value => !value)) throw new Error('Required core data is absent');
    const router = createRouter(records, { projects: loaded._pd.PROJECTS });
    const current = () => location.pathname + location.search + location.hash;
    let stored; try { stored = localStorage.getItem('dehat.lang'); } catch {}
    const legacy = router.migrateLegacy(current(), { storedLanguage: stored });
    let route = legacy || router.parseUrl(current());
    if (legacy?.replaceTo) history.replaceState(null, '', legacy.replaceTo);
    if (route.status === 301) { history.replaceState(null, '', route.redirectTo); route = router.parseUrl(current()); }
    if (route.status !== 200 || route.kind !== 'app') throw new Error('No matching app route');
    window.__dehatHeroDone = route.view !== 'home';
    const [routeData, partnerData] = await Promise.all([
      loadModules(routeModules[route.view] || {}),
      route.view === 'involved' ? loadPartner(route.lang) : Promise.resolve(null),
      mediaData,
      ['who', 'involved'].includes(route.view) ? script('/image-slot.js') : Promise.resolve(),
    ]);
    Object.assign(loaded,routeData);
    if (partnerData) loaded._pt = partnerData;
    if (Object.values(loaded).some(value => !value)) throw new Error('Required route data is absent');
    const hasDataFor = candidate => (candidate.view !== 'involved' || !!loaded._pt)
      && (!['home','media'].includes(candidate.view) || !!window.DEHAT_MEDIA)
      && Object.keys(routeModules[candidate.view] || {}).every(key => !!loaded[key]);
    if (route.lang !== 'en') {
      await Promise.all([script(`/content-i18n/${route.lang}.js`), script(`/launch/dict/${route.lang}.js`)]);
      if (!window.__LAUNCH_DICTIONARY?.[route.lang]) throw new Error('Required launch dictionary is absent');
      if (!window.CONTENT_I18N?.[route.lang]) throw new Error('Required translation is absent');
    }
    document.documentElement.lang = route.lang;
    document.documentElement.dir = route.dir;
    // Keep the resource table set before support.js runs.
    let component, applying = false, liveReady = false, navigationVersion = 0;
    const pendingData = new Map();
    const ensureDataFor = candidate => {
      const key = candidate.lang + ':' + candidate.view;
      if (hasDataFor(candidate) && (!['who','involved'].includes(candidate.view) || customElements.get('image-slot'))) return Promise.resolve();
      if (pendingData.has(key)) return pendingData.get(key);
      const request = Promise.all([
        loadModules(routeModules[candidate.view] || {}),
        candidate.view === 'involved' && !loaded._pt ? loadPartner(candidate.lang) : Promise.resolve(null),
        ['home','media'].includes(candidate.view) && !window.DEHAT_MEDIA ? script('/media-data.js') : Promise.resolve(),
        ['who','involved'].includes(candidate.view) && !customElements.get('image-slot') ? script('/image-slot.js') : Promise.resolve(),
      ]).then(([data,partner]) => {
        Object.assign(loaded,data);
        if (partner) loaded._pt = partner;
        if (component) Object.assign(component,data,partner ? {_pt:partner} : {});
        if (!hasDataFor(candidate)) throw new Error(`Required route data is absent: ${candidate.view}`);
      }).finally(() => pendingData.delete(key));
      pendingData.set(key,request);
      return request;
    };
    const prepareView = view => ensureDataFor({view,lang:component?.state.lang || route.lang});
    const metadataSelector = 'title,meta[name="description"],meta[property^="og:"],link[rel="canonical"],link[rel="alternate"],script[type="application/ld+json"]';
    const updateHead = async destination => {
      const version = ++navigationVersion;
      const response = await fetch(destination, {headers:{Accept:'text/html'}});
      if (!response.ok) throw new Error('Destination is outside this proof');
      const next = new DOMParser().parseFromString(await response.text(), 'text/html');
      if (version !== navigationVersion) return false;
      document.head.querySelectorAll(metadataSelector).forEach(node=>node.remove());
      next.head.querySelectorAll(metadataSelector).forEach(node=>document.head.append(document.importNode(node,true)));
      return true;
    };
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
    const apply = async instance => {
      const destination = current();
      const next = router.parseUrl(destination);
      if (next.status !== 200 || next.kind !== 'app') { location.assign(destination); return; }
      if (next.lang !== instance.state.lang) { location.assign(destination); return; }
      try { await ensureDataFor(next); }
      catch { location.assign(destination); return; }
      if (current() !== destination) return;
      applying = true;
      if (liveReady) {
        try { if (!await updateHead(destination)) { applying = false; return; } }
        catch { location.assign(destination); return; }
      }
      if (current() !== destination) { applying = false; return; }
      if (next.view !== 'home') window.__dehatHeroDone = true;
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
      prepare: prepareView,
      fallback(view, patch = {}) { location.assign(router.pathFor({...component.state,...patch,view},component.state.lang)); },
      async sync(instance) {
        if (applying || !liveReady) return;
        const vals = instance.state.view === 'stories' ? instance._longReads(() => {}) : null;
        const state = {...instance.state, storySlug: instance.state.view === 'stories' && instance.state.stEntered ? vals.sd.slug : null};
        const destination = router.pathFor(state, instance.state.lang);
        if (destination !== location.pathname) {
          // Language changes get the matching server body/head, without a mixed-language flash.
          if (instance.state.lang !== route.lang) { location.assign(destination); return; }
          applying = true;
          try {
            const next = router.parseUrl(destination);
            const hadData = hasDataFor(next);
            await ensureDataFor(next);
            if (!hadData) instance.forceUpdate();
            if (!await updateHead(destination)) return;
          } catch { location.assign(destination); return; }
          finally { applying = false; }
          history.pushState(null, '', destination); route = router.parseUrl(destination);
          if (route.view !== 'home') window.__dehatHeroDone = true;
          window.DEHAT_LAUNCH.route = route;
          component._navMeasure?.(); component._spineScan(); component._revealAll();
        }
      },
    };
    const response = await templateRequest;
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
    fallback?.remove(); delete document.documentElement.dataset.earlyLoading;
    host.removeAttribute('inert'); host.removeAttribute('aria-hidden');
    host.classList.add('launch-active'); liveReady = true;
    // The section tab strip renders from _spineScan's result, which only schedules a render for
    // the next frame: the first live frame painted without the strip and the page then dropped by
    // its height (a 0.05 layout shift). Render it now, before the browser paints the live page.
    component._spineScan();
    if (component._updateFrame) { cancelAnimationFrame(component._updateFrame); component._updateFrame = 0; }
    if (window.ReactDOM?.flushSync) window.ReactDOM.flushSync(() => component.forceUpdate());
    component._navMeasure?.(); component._spineScan(); component._revealAll();
    await frame(); await frame();
    diagnostics.animationsBeforeBudget = document.getAnimations().filter(animation => animation.playState === 'running').length;
    const animationBudget = installAnimationBudget(host);
    await frame();
    diagnostics.animationsAfterBudget = animationBudget?.counts();
    diagnostics.phase = 'ready'; diagnostics.readyAt = performance.now();
    diagnostics.route = route.canonicalPath; diagnostics.lang = route.lang;
    settle(diagnostics);
    // Defer speculative work until the first view is interactive. Hover or keyboard
    // focus starts the exact route earlier; intentional low-bandwidth mode skips idle work.
    const prefetch = target => {
      const hint = target.closest?.('[data-prefetch]')?.getAttribute('data-prefetch');
      const view = PROGRAMMES[hint] ? 'prog' : ['route','people','give','case'].includes(hint) ? 'involved' : hint === 'answer' ? 'finance' : hint;
      const link = target.closest?.('a[href]');
      const url = link ? new URL(link.href,location.href) : null;
      const next = view ? {view,lang:route.lang} : url?.origin === location.origin ? router.parseUrl(url) : null;
      if (next?.status === 200 || view) ensureDataFor(next).catch(() => {});
    };
    document.addEventListener('pointerover', event => prefetch(event.target), {passive:true});
    document.addEventListener('focusin', event => prefetch(event.target));
    if (!navigator.connection?.saveData) {
      setTimeout(() => {
        const idle = window.requestIdleCallback || (callback => setTimeout(callback,0));
        idle(() => ['involved','work','impact'].forEach(view => ensureDataFor({view,lang:route.lang}).catch(() => {})));
      },4000);
    }
    // Preserve native new-tab/download behaviour; same-language app links use history.
    document.addEventListener('click', async event => {
      const link = event.target.closest?.('a[href]');
      if (!link || event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      const next = router.parseUrl(url);
      if (next.status !== 200 || next.kind !== 'app' || next.lang !== component.state.lang) return;
      event.preventDefault();
      history.pushState(null, '', url.pathname + url.search + url.hash);
      await apply(component); window.scrollTo(0,0);
    });
    addEventListener('hashchange', () => {
      const migrated = router.migrateLegacy(current());
      if (migrated?.replaceTo) {history.replaceState(null,'',migrated.replaceTo);apply(component);}
    });
  } catch (error) {
    diagnostics.phase = 'failed'; diagnostics.errors.push(error.message);
    document.getElementById('launch-live')?.remove();
    fail(error); console.error('[launch]', error.message);
  }
}

// Export the exact approved pre-paint picker rule for the generator's inline head script.
export const pickerRedirectSource = `try{if(location.pathname==='/'&&!location.search&&!location.hash){var l=localStorage.getItem('dehat.lang');if(${JSON.stringify(LANGUAGES)}.includes(l)&&l!=='en')location.replace('/'+l)}}catch(e){}`;
if (typeof window !== 'undefined' && document.getElementById('launch-live')) start();
