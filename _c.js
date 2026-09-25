
class Component extends DCLogic {
  state = { booting: true, view: 'home', loop: 0, jSide: '', wQ: 0, wX: 'sol', wI: 0, wF: 'uncrc', progKey: 're', program: 0, node: 0, district: 0, story: 0, counts: {}, statOpen: {}, gridOpen: {}, blStop: 0, caseFork: '', sdgTab: 'g', awardTab: 'all', projects: [], filters: {}, expanded: null, theme: 'dark', lang: 'en', navOpen: false, finYear: 0, finLens: 'prog', finBasis: 'received', finCurr: 'INR', finFrom: '', finTo: '', finSeg: '', finPick: '', jStage: 0, jTier: 0, jPath: 0, jPair: null, jHor: 0,
    pTab: 'route', pStep: 0, pcSel: '', pWho: '', pIntents: [], pOpen: '', ivFacets: {}, pSop: '', pName: '', pOrg: '', pEmail: '', pPhone: '', pPlace: '', pBudget: '', pCopied: false,
    dRegime: 'inr', dAmount: '', dAmountOther: '', dFreq: 'once', dPurpose: 'unrestricted', dPan: '', dCountry: '', dIdRef: '', dAddr: '', d80g: true, dAnon: false, dStage: 0, ivStatus: 'current', ivProg: 'all',
    whoStem: 'nyay', whoMine: '', whoReveal: false, whoPerson: '', whoBoard: 'governing', whoGroup: 'all', whoBelief: '', whoBeliefAll: false, navMore: false, polOpen: '', homeFace: 't33',
    ckDecided: true, ckPrefsOpen: false, ckOpen: '', ckPrefs: { performance: false, functional: false, targeting: false } };

  componentDidMount() {
    this._applyTheme();
    // The mark fills while the page settles, then clears. Capped so a slow asset can
    // never hold the reader behind a splash: the site is readable either way.
    this._bootDone = () => {
      if (this._booted) return;
      this._booted = true;
      this.setState({ booting: false });
    };
    if (document.readyState === 'complete') requestAnimationFrame(this._bootDone);
    else window.addEventListener('load', this._bootDone, { once: true });
    this._bootCap = setTimeout(this._bootDone, 3500);
    try {
      const raw = window.localStorage.getItem('dehat.consent');
      if (raw) { const j = JSON.parse(raw); this.setState({ ckDecided: true, ckPrefs: Object.assign({ performance: false, functional: false, targeting: false }, j.prefs || {}) }); }
      else this.setState({ ckDecided: false });
    } catch (e) {}
    this._onKey = e => {
      if (this._deckKeys) this._deckKeys(e);
      try {
        if (this.state.view !== 'who') return;
        const t = e.target || {};
        const tag = (t.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
        if (e.key === 'ArrowRight') { e.preventDefault(); this._jStep(1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); this._jStep(-1); }
      } catch (err) {}
    };
    this._onDocDown = (e) => {
      try {
        if (!this.state.navMore) return;
        const n = e.target && e.target.closest ? e.target.closest('nav') : null;
        if (!n) this.setState({ navMore: false });
      } catch (err) {}
    };
    this._onEsc = (e) => { if (e.key === 'Escape' && this.state.navMore) this.setState({ navMore: false }); };
    try { document.addEventListener('pointerdown', this._onDocDown, true); window.addEventListener('keydown', this._onEsc); } catch (e) {}
    this._navMeasure = () => {
      try {
        const n = document.querySelector('main') ? document.querySelector('nav') : null;
        const nav = n || document.querySelector('nav');
        if (nav) document.documentElement.style.setProperty('--nav-h', Math.round(nav.getBoundingClientRect().height) + 'px');
      } catch (e) {}
    };
    this._navMeasure();
    try { window.addEventListener('resize', this._navMeasure); if (window.ResizeObserver) { const nv = document.querySelector('nav'); if (nv) { this._navRO = new ResizeObserver(this._navMeasure); this._navRO.observe(nv); } } } catch (e) {}
    this._jBound = () => {
      if (this._jRaf) return;
      this._jRaf = requestAnimationFrame(() => { this._jRaf = 0; this._jTick(false); });
    };
    try { window.addEventListener('scroll', this._jBound, { passive: true }); window.addEventListener('resize', this._jBound); } catch (e) {}
    try { window.addEventListener('keydown', this._onKey); } catch (e) {}
    // Hero-number widths are measured in the real font; remeasure once it lands.
    try {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => { this._numCache = {}; this.forceUpdate(); });
      }
    } catch (e) {}
    try {
      this._deckBound = () => {
        const se = document.scrollingElement || document.documentElement;
        const y = typeof window.scrollY === 'number' ? window.scrollY : (se ? se.scrollTop : 0);
        const dy = y - (this._deckLastY || 0);
        this._deckLastY = y;
        const now = !!this.state.deckBarHidden;
        let hidden = now;
        if (y <= 340 || dy < 0 || this.state.stFiltersOpen) hidden = false;
        else if (dy > 8) hidden = true;
        if (hidden !== now) this.setState({ deckBarHidden: hidden });
      };
      window.addEventListener('scroll', this._deckBound, { passive: true });
    } catch (e) {}
    this._ensure();
    this._loadProjects();
    this._loadFinance();
    if (!window.DEHAT_MEDIA) {
      this._mediaPoll = setInterval(() => {
        if (window.DEHAT_MEDIA) { clearInterval(this._mediaPoll); this.forceUpdate(); }
      }, 150);
      setTimeout(() => clearInterval(this._mediaPoll), 8000);
    }
    this._timer = setInterval(() => {
      if (this.state.view === 'home') this.setState(s => ({ story: (s.story + 1) % this._stories().length }));
    }, 7000);
    this._lastView = this.state.view;
    this._revealInit();
    this._spineScan();
  }
  getSnapshotBeforeUpdate(pp, ps) {
    try {
      if (ps.govMode === this.state.govMode) return null;
      if (!this._govRects) this._govSnap();
      return null;
    } catch (e) { return null; }
  }
  _govSnap() {
    try {
      const m = {};
      document.querySelectorAll('[data-gov-flip]').forEach(el => { m[el.getAttribute('data-gov-flip')] = el.getBoundingClientRect(); });
      this._govRects = m;
    } catch (e) {}
  }
  componentDidUpdate(pp, ps, snap) {
    try {
      if (this._govRects) { const r = this._govRects; this._govRects = null; this._govFlip(r); }
      if (this._lastView !== this.state.view) { this._lastView = this.state.view; this._revealInit(); }
      else this._revealScan();
      if (this.state.view === 'who') { this._jDragInit(); this._jTick(true); }
    } catch (e) {}
  }
  // Size a hero number so it fills ~86% of its column on one line, whatever glyphs it uses.
  _numSize(s) {
    if (!s) return 'min(140px, 20cqw)';
    this._numCache = this._numCache || {};
    if (this._numCache[s]) return this._numCache[s];
    var adv = 0;
    try {
      var c = this._numCanvas || (this._numCanvas = document.createElement('canvas'));
      var x = c.getContext('2d');
      x.font = '800 100px "Bricolage Grotesque", sans-serif';
      adv = x.measureText(s).width / 100;
    } catch (e) { adv = 0; }
    if (!adv || !isFinite(adv)) {
      var w = 0;
      for (var i = 0; i < s.length; i++) {
        w += /[ .,'\u2009]/.test(s[i]) ? 0.45 : (/[\u2192\u00d7\u2014%]/.test(s[i]) ? 1.55 : 1);
      }
      adv = Math.max(1, w) * 0.483;
    }
    var out = 'min(140px, ' + (86 / adv).toFixed(2) + 'cqw)';
    this._numCache[s] = out;
    return out;
  }
  _longReads(setView) {
    const T = { ...this._dict().en, ...(this._dict()[this.state.lang] || {}) };
    const A = './assets/story/';
    // Story illustrations ship in two web sizes; shared ink art still sits at the root.
    const NUMBERED = /^story-\d{3}$/;
    const artFull = a => 'url(' + A + (NUMBERED.test(a) ? 'web/' : '') + a + '.png)';
    const artThumb = a => 'url(' + A + (NUMBERED.test(a) ? 'thumb/' : '') + a + '.png)';
    const all = (typeof window !== 'undefined' && window.STORIES) ? window.STORIES : [];
    const open = slug => () => { this.setState({ storySlug: slug }); try { window.scrollTo(0, 0); } catch (e) {} };
    const ink = hex => this.state.theme === 'dark' ? this._lift(hex) : this._sink(hex);
    const card = s => ({
      slug: s.slug, title: this._tc('stories', s.slug, 'title', s.title), dek: this._tc('stories', s.slug, 'dek', s.dek), line: s.line, color: s.color,
      ink: ink(s.color),
      progLabel: s.progLabel, imgCss: artThumb(s.art), open: open(s.slug),
    });
    const F = this.state.stF || {};
    const DIMS = [
      { key: 'prog', label: 'Programme', get: s => [s.progLabel] },
      { key: 'year', label: 'Year', get: s => [String(s.year)] },
      { key: 'sdg', label: 'Development goal', get: s => s.sdg || [] },
      { key: 'uncrc', label: 'Rights of the child', get: s => s.uncrc || [] },
      { key: 'csr', label: 'Corporate social responsibility', get: s => s.csr || [] },
    ];
    const passes = (s, skip) => DIMS.every(d => {
      if (d.key === skip) return true;
      const v = F[d.key];
      return !v || d.get(s).indexOf(v) >= 0;
    });
    const shown = all.filter(s => passes(s, null));
    const pick = (k, v) => () => this.setState(st => {
      const n = Object.assign({}, st.stF || {});
      if (n[k] === v) delete n[k]; else n[k] = v;
      return { stF: n, stIdx: 0, stPage: 24 };
    });
    const stFacets = DIMS.map(d => {
      const pool = all.filter(s => passes(s, d.key));
      const seen = [];
      pool.forEach(s => d.get(s).forEach(v => { if (v && seen.indexOf(v) < 0) seen.push(v); }));
      if (d.key === 'year') seen.sort((a, b) => Number(b) - Number(a)); else seen.sort();
      return {
        key: d.key, label: d.label,
        opts: seen.map(v => {
          const on = F[d.key] === v;
          return {
            v, label: v, pick: pick(d.key, v),
            wt: on ? '800' : '600',
            fg: on ? 'var(--text)' : 'var(--faint)',
            ring: on ? 'var(--text)' : 'transparent',
          };
        }),
      };
    });
    const nF = Object.keys(F).length;
    const SHORT = { prog: 'Programme', year: 'Year', sdg: 'Goal', uncrc: 'Child rights', csr: 'CSR' };
    const dimKey = this.state.stDim || 'prog';
    const stDimTabs = DIMS.map(d => {
      const on = d.key === dimKey, sel = F[d.key] || '';
      return {
        key: d.key, label: SHORT[d.key] || d.label, sel, hasSel: !!sel,
        pickDim: () => this.setState({ stDim: d.key }),
        bg: on ? 'var(--text)' : 'transparent',
        fg: on ? 'var(--bg)' : (sel ? 'var(--text)' : 'var(--faint)'),
        ring: on ? 'var(--text)' : (sel ? 'var(--text)' : 'var(--border)'),
      };
    });
    const activeFacet = stFacets.filter(f => f.key === dimKey)[0] || stFacets[0] || { opts: [] };
    const stChips = DIMS.filter(d => F[d.key]).map(d => ({
      k: d.key, label: F[d.key], drop: pick(d.key, F[d.key]),
    }));
    const entered = !!this.state.stEntered && shown.length > 0;
    const idx = shown.length ? Math.min(this.state.stIdx || 0, shown.length - 1) : 0;
    const cur = entered ? (shown[idx] || null) : null;
    const enter = i => () => this.setState({ stEntered: true, stIdx: i, stFiltersOpen: false },
      () => { try { window.scrollTo({ top: 0 }); } catch (e) {} });
    const page = Math.max(24, this.state.stPage || 24);
    const faces = shown.slice(0, page).map((s, i) => ({
      slug: s.slug, person: this._tc('stories', s.slug, 'person', s.person || s.progLabel), role: this._tc('stories', s.slug, 'personRole', s.personRole || ''),
      dek: this._tc('stories', s.slug, 'dek', s.dek), color: s.color, ink: ink(s.color), year: String(s.year),
      imgCss: artThumb(s.art), open: enter(i),
    }));
    const step = d => () => this.setState(
      { stIdx: shown.length ? (idx + d + shown.length) % shown.length : 0 },
      () => { try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {} }
    );
    // Arrow keys page the deck, but only while a story is open and nothing is being typed into.
    this._deckKeys = e => {
      if (!this.state.stEntered || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target || {};
      const tag = (t.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || t.isContentEditable) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1)(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1)(); }
    };
    const nxt = shown.length > 1 ? shown[(idx + 1) % shown.length] : null;
    if (typeof window !== 'undefined' && nxt && nxt.art) {
      this._warm = this._warm || {};
      const u = artFull(nxt.art);
      if (!this._warm[u]) { this._warm[u] = 1; const im = new window.Image(); im.src = u.slice(4, -1); }
    }
    const EMPTY = {
      slug: '', title: '', dek: '', line: '', lead: '', pull: '', actTitle: '', act: '', actCta: '',
      color: '#D2305C', ink: '#F58EA6', onFill: '#ffffff', onFillSoft: 'rgba(255,255,255,.82)',
      imgCss: 'none', paras: [], tags: [], openBig: '', openSmall: '', askLine: '',
      bigSize: 'clamp(24px,3.4vw,40px)', bigFont: "'Newsreader'", bigStyle: 'normal', isNumber: false, notNumber: true,
      bodyFont: 'inherit', bodySize: '17px', bodyLead: '1.72', measure: '760px',
      thumbCss: 'none',
      isPlate: false, isMonument: false, isQuiet: false, isLedger: false, artTop: false, artEnd: false,
    };
    const out = {
      stFacets, stDimTabs, stChips, stHasChips: stChips.length > 0,
      stActiveOpts: activeFacet.opts, stActiveLabel: (SHORT[dimKey] || ''),
      stCount: shown.length === all.length
        ? T.roster_count_all.replace('{n}', String(all.length))
        : T.roster_count_filtered.replace('{shown}', String(shown.length)).replace('{all}', String(all.length)),
      stHasFilter: nF > 0,
      stEmpty: shown.length === 0,
      rosterEyebrow: T.stories_eyebrow, rosterH1: T.roster_h1, rosterSub: T.roster_sub,
      rosterBack: T.roster_back, rosterInvest: T.roster_invest,
      stClear: () => this.setState({ stF: {}, stIdx: 0, stPage: 24 }),
      faces,
      stHasMore: shown.length > page,
      stMoreLabel: T.roster_show_more.replace('{n}', String(Math.min(24, Math.max(0, shown.length - page)))),
      stMore: () => this.setState(st => ({ stPage: Math.max(24, st.stPage || 24) + 24 })),
      onRoster: !entered,
      leaveDeck: () => this.setState({ stEntered: false, stFiltersOpen: false },
        () => { try { window.scrollTo({ top: 0 }); } catch (e) {} }),
      barShift: this.state.deckBarHidden ? 'translateY(-130%)' : 'translateY(0)',
      filtersOpen: !!this.state.stFiltersOpen,
      filtTop: entered ? '160px' : '98px',
      toggleFilters: () => this.setState(s => ({ stFiltersOpen: !s.stFiltersOpen })),
      filtLabel: nF > 0 ? T.roster_filters_n.replace('{n}', String(nF)) : T.roster_filter,
      filtBg: nF > 0 ? 'var(--text)' : 'transparent',
      filtFg: nF > 0 ? 'var(--bg)' : 'var(--text)',
      filtRing: nF > 0 ? 'var(--text)' : 'var(--border)',
      deckPos: shown.length ? String(idx + 1) + ' / ' + shown.length : '0 / 0',
      deckProgress: shown.length ? (((idx + 1) / shown.length) * 100) + '%' : '0%',
      deckNext: step(1), deckPrev: step(-1),
      nextLabel: nxt ? T.roster_next_story : T.roster_start_again,
      hasStoryOpen: !!cur,
      noStoryOpen: !cur,
      goInvolved: setView('involved'),
      sd: EMPTY,
    };
    if (cur) {
      const o = cur.opener || {};
      const v = ((cur.opener && cur.opener.kind === 'number') || cur.variant === 'number') ? 'number' : 'plain';
      const L = 'plate';
      const serif = false;
      const stc = (field, fb) => this._tc('stories', cur.slug, field, fb);
      out.sd = Object.assign({}, EMPTY, {
        slug: cur.slug, title: stc('title', cur.title), dek: stc('dek', cur.dek), line: stc('line', cur.line), lead: stc('lead', cur.lead),
        pull: stc('pull', cur.pull), actTitle: stc('actTitle', cur.actTitle), act: stc('act', cur.act), actCta: stc('actCta', cur.actCta),
        color: cur.color, imgCss: artFull(cur.art), thumbCss: artThumb(cur.art),
        ink: ink(cur.color),
        onFill: this._ink(cur.color),
        onFillSoft: this._ink(cur.color),
        openBig: stc('openBig', o.big || ''), openSmall: stc('openSmall', o.small || ''),
        // Number openers sit on one line: step the size down as the string gets longer
        bigSize: v === 'number' ? this._numSize(String(o.big || '').trim()) : 'clamp(23px,3.2vw,38px)',
        isNumber: v === 'number', notNumber: v !== 'number',
        bigFont: v === 'number' ? "'Bricolage Grotesque'" : "'Newsreader'",
        bigStyle: v === 'speech' ? 'italic' : 'normal',
        bodyFont: serif ? "'Newsreader'" : 'inherit',
        bodySize: serif ? '19.5px' : '17px',
        bodyLead: serif ? '1.66' : '1.72',
        measure: L === 'monument' ? '660px' : (L === 'ledger' ? '780px' : '740px'),
        isPlate: L === 'plate', isMonument: L === 'monument',
        isQuiet: L === 'quiet', isLedger: L === 'ledger',
        artTop: L === 'monument' ? false : (L === 'quiet'),
        artEnd: L === 'monument',
        askLine: stc('actTitle', cur.actTitle) + ' \u2014 ' + this._tagMap('progLabel', cur.progLabel, cur.progLabel) + ', ' + cur.year,
        tags: [].concat(
          (cur.sdg || []).map(t => this._tagMap('sdg', t, t)),
          (cur.uncrc || []).map(t => T.right_to_tpl.replace('{x}', this._tagMap('uncrc_word', t, t))),
          (cur.csr || []).map(t => this._tagMap('csr', t, t))
        ).map((t, i) => ({ t, k: i })),
        paras: cur.body.map((t, i) => ({ t: stc('body_' + i, t), k: i })),
      });
    }
    return out;
  }

  _govFlip(snap) {
    if (typeof window === 'undefined') return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('[data-gov-flip]').forEach(el => {
      const o = snap[el.getAttribute('data-gov-flip')];
      if (!o || !el.animate) return;
      const n = el.getBoundingClientRect();
      const dx = o.left - n.left, dy = o.top - n.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      el.animate(
        [{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }],
        { duration: 620, easing: 'cubic-bezier(.22,.61,.36,1)' }
      );
    });
  }
  componentWillUnmount() { try { document.removeEventListener('pointerdown', this._onDocDown, true); window.removeEventListener('keydown', this._onEsc); } catch (e) {} try { if (this._navRO) this._navRO.disconnect(); if (this._navMeasure) window.removeEventListener('resize', this._navMeasure); } catch (e) {} try { if (this._jBound) { window.removeEventListener('scroll', this._jBound); window.removeEventListener('resize', this._jBound); } } catch (e) {} clearInterval(this._timer); clearInterval(this._revealTimer); if (this._deckBound) { window.removeEventListener('scroll', this._deckBound); } if (this._revealBound) { window.removeEventListener('scroll', this._revealBound); window.removeEventListener('resize', this._revealBound); } if (this._io) this._io.disconnect(); if (this._mo) this._mo.disconnect(); if (this._raf) cancelAnimationFrame(this._raf); }

  // ---------- scroll reveal + section anchoring ----------
  _revealAll() {
    try { document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('shown')); } catch (e) {}
  }
  _revealInit() {
    if (typeof window === 'undefined') return;
    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { this._revealAll(); return; }
      if (!this._revealTimer) this._revealTimer = setInterval(() => this._revealScan(), 300);
      if (!this._revealBound) {
        this._revealBound = () => {
          if (this._revealRaf) return;
          this._revealRaf = requestAnimationFrame(() => { this._revealRaf = 0; this._revealScan(); });
        };
        window.addEventListener('scroll', this._revealBound, { passive: true });
        window.addEventListener('resize', this._revealBound, { passive: true });
      }
      this._revealScan();
    } catch (e) { this._revealAll(); }
  }
  _revealScan() {
    try {
      const h = window.innerHeight - 30;
      document.querySelectorAll('[data-reveal]:not(.shown)').forEach(el => {
        if (el.getBoundingClientRect().top < h) el.classList.add('shown');
      });
    } catch (e) {}
    this._spineScan();
  }
  _spineScan() {
    if (typeof window === 'undefined') return;
    try {
      const els = Array.prototype.slice.call(document.querySelectorAll('main [data-spine]'));
      const root = document.documentElement;
      if (els.length < 3) {
        if (this._spine) { this._spine = null; this._spineSig = ''; root.removeAttribute('data-spine-on'); this.forceUpdate(); }
        return;
      }
      const denom = Math.max(1, root.scrollHeight - window.innerHeight);
      const y = window.pageYOffset || 0;
      const p = Math.max(0, Math.min(1, y / denom));
      const nodes = els.map(el => {
        const top = el.getBoundingClientRect().top + y;
        return { label: el.getAttribute('data-spine'), top: top, at: Math.max(0, Math.min(1, (top - 80) / denom)) };
      });
      root.style.setProperty('--spine-pos', (p * 100).toFixed(2) + '%');
      root.style.setProperty('--spine-rem', (100 - p * 100).toFixed(2) + '%');
      root.setAttribute('data-spine-on', '1');
      let active = 0;
      nodes.forEach((n, i) => { if (p >= n.at - 0.006) active = i; });
      const sig = nodes.map(n => n.label + ':' + n.at.toFixed(3)).join('|') + '#' + active;
      if (sig === this._spineSig) return;
      this._spineSig = sig;
      this._spine = { nodes: nodes, active: active };
      this.forceUpdate();
    } catch (e) {}
  }
  _spineVals() {
    const A = './assets/story/';
    const base = { spineOn: false, spineNodes: [], spineLabel: '', spineCount: '',
      spineWalkFilter: this.state.theme === 'dark' ? 'brightness(0) invert(1) opacity(.92)' : 'none',
      spineRoadCss: 'url(' + A + 'rail-road.png)', spineWalkCss: 'url(' + A + 'rail-walkers.png)' };
    const S = this._spine;
    if (!S) return base;
    const idx = S.active;
    return Object.assign(base, {
      spineOn: true,
      spineLabel: this._tagMap('spine', S.nodes[idx].label, S.nodes[idx].label),
      spineCount: (idx + 1) + ' ' + ({ ...this._dict().en, ...(this._dict()[this.state.lang] || {}) }).word_of_count + ' ' + S.nodes.length,
      spineNodes: S.nodes.map((n, i) => ({
        label: n.label,
        left: (n.at * 100).toFixed(2) + '%',
        size: i === idx ? '13px' : '8px',
        bg: i <= idx ? '#EAAE28' : 'var(--faint)',
        ring: i === idx ? '0 0 0 5px rgba(234,174,40,.22)' : 'none',
        go: () => { try { window.scrollTo({ top: Math.max(0, n.top - 76), behavior: 'smooth' }); } catch (e) {} },
      })),
    });
  }
  _go(view, anchor, extra) {
    return () => this.setState(Object.assign({ view: view, storySlug: null }, extra || {}), () => {
      if (typeof window === 'undefined') return;
      if (!anchor) { window.scrollTo({ top: 0 }); return; }
      window.scrollTo({ top: 0 });
      // The target may sit deep inside a long view whose images and iframes are still
      // laying out, so its offset keeps moving. Re-measure until it actually lands.
      const started = Date.now();
      const seek = () => {
        const el = document.querySelector('[data-anchor="' + anchor + '"]');
        const late = Date.now() - started > 2500;
        if (!el) { if (!late) requestAnimationFrame(seek); return; }
        const delta = el.getBoundingClientRect().top - 74;
        if (Math.abs(delta) > 2 && !late) {
          window.scrollTo({ top: Math.max(0, window.pageYOffset + delta) });
          requestAnimationFrame(seek);
          return;
        }
        this._revealScan();
      };
      requestAnimationFrame(seek);
    });
  }
  _awardArt(list) {
    const T = './assets/thumb/';
    const map = [
      [/integrity|corruption/i, T + 'right-protection.png'],
      [/Veerta|Bravery/i, T + 'issue-trafficking.png'],
      [/Girl Power|Swayam|Women Achievers/i, T + 'sdg-gender-equality.png'],
      [/Crop|Enterprise/i, T + 'sdg-no-hunger.png'],
      [/NGO/i, T + 'sdg-partnership.png'],
      [/CSR|Merit/i, T + 'sdg-reduced-inequalities.png'],
    ];
    return list.map((a, i) => {
      let img = T + 'right-participation.png';
      for (let j = 0; j < map.length; j++) { if (map[j][0].test(a.name)) { img = map[j][1]; break; } }
      return Object.assign({}, a, { img: img, k: 'aw' + i, delay: ((i % 5) * 70) + 'ms' });
    });
  }

  // ---------- theme + language ----------
  _applyTheme() {
    try {
      const root = document.documentElement;
      root.setAttribute('data-theme', this.state.theme);
      const L = this._langs().find(l => l.code === this.state.lang);
      root.setAttribute('dir', (L && L.rtl && L.ready) ? 'rtl' : 'ltr');
    } catch (e) {}
  }
  _toggleTheme() { this.setState(s => ({ theme: s.theme === 'dark' ? 'light' : 'dark' }), () => { this._applyTheme(); this._syncMapTheme(); }); }
  _syncMapTheme() { try { if (this._mapFrame && this._mapFrame.contentWindow) this._mapFrame.contentWindow.postMessage({ theme: this.state.theme }, '*'); } catch (e) {} }
  _setLang(code) { this.setState({ lang: code }, () => this._applyTheme()); }

  _langs() {
    return [
      { code:'en', label:'English', group:'global', ready:true }, { code:'ar', label:'العربية', group:'global', rtl:true, ready:true },
      { code:'zh', label:'中文', group:'global', ready:true }, { code:'fr', label:'Français', group:'global', ready:true },
      { code:'ru', label:'Русский', group:'global', ready:true }, { code:'es', label:'Español', group:'global', ready:true },
      { code:'hi', label:'हिन्दी', group:'indian', ready:true }, { code:'bn', label:'বাংলা', group:'indian', ready:true },
      { code:'mr', label:'मराठी', group:'indian', ready:true }, { code:'te', label:'తెలుగు', group:'indian', ready:true },
      { code:'ta', label:'தமிழ்', group:'indian', ready:true }, { code:'gu', label:'ગુજરાતી', group:'indian', ready:true },
      { code:'ur', label:'اردو', group:'indian', rtl:true, ready:true }, { code:'kn', label:'ಕನ್ನಡ', group:'indian', ready:true },
      { code:'or', label:'ଓଡ଼ିଆ', group:'indian', ready:true }, { code:'ml', label:'മലയാളം', group:'indian', ready:true },
      { code:'pa', label:'ਪੰਜਾਬੀ', group:'indian', ready:true }, { code:'as', label:'অসমীয়া', group:'indian', ready:true },
      { code:'mai', label:'मैथिली', group:'indian', ready:true }, { code:'sat', label:'ᱥᱟᱱᱛᱟᱲᱤ', group:'indian', ready:true },
      { code:'ks', label:'کٲشُر', group:'indian', rtl:true, ready:true }, { code:'ne', label:'नेपाली', group:'indian', ready:true },
      { code:'kok', label:'कोंकणी', group:'indian', ready:true }, { code:'sd', label:'سنڌي', group:'indian', rtl:true, ready:true },
      { code:'doi', label:'डोगरी', group:'indian', ready:true }, { code:'mni', label:'ꯃꯤꯇꯩꯂꯣꯟ', group:'indian', ready:true },
      { code:'brx', label:'बड़ो', group:'indian', ready:true }, { code:'sa', label:'संस्कृतम्', group:'indian', ready:true },
    ];
  }
  _jGo(id) {
    try {
      const el = document.querySelector('[data-jentry="' + id + '"]');
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - Math.max(140, window.innerHeight * 0.28);
      window.scrollTo({ top: top, behavior: 'smooth' });
    } catch (e) {}
  }
  _jStep(dir) {
    const ids = Object.keys(this._jMeta || {});
    if (!ids.length) return;
    const i = ids.indexOf(this._jActive);
    const n = Math.max(0, Math.min(ids.length - 1, (i < 0 ? 0 : i) + dir));
    this._jGo(ids[n]);
  }
  // The two walkers are the timeline's handle: drag them along the road and the page
  // moves to the nearest event. Dragging is bound once, on the document, so it keeps
  // working across re-renders and after the rail is re-laid out.
  _jDragInit() {
    if (this._jDragBound) return;
    this._jDragBound = true;
    const walkEl = () => document.querySelector('[data-jwalk]');
    const nearest = (clientX) => {
      const ticks = [].slice.call(document.querySelectorAll('[data-jtick]'));
      if (!ticks.length) return null;
      const rail = ticks[0].parentElement;
      if (!rail) return null;
      const r = rail.getBoundingClientRect();
      if (!r.width) return null;
      const frac = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
      let best = null, bestD = Infinity;
      ticks.forEach(t => {
        const p = parseFloat(t.style.left || '0') / 100;
        const d = Math.abs(p - frac);
        if (d < bestD) { bestD = d; best = t; }
      });
      return best ? { id: best.getAttribute('data-jtick'), pos: best.style.left } : null;
    };
    this._jDown = (e) => {
      const w = walkEl();
      if (!w || !e.target || !w.contains(e.target)) return;
      this._jDragging = true;
      w.style.cursor = 'grabbing';
      try { w.setPointerCapture(e.pointerId); } catch (err) {}
      e.preventDefault();
    };
    this._jMove = (e) => {
      if (!this._jDragging) return;
      e.preventDefault();
      if (this._jDragRaf) return;
      this._jDragRaf = requestAnimationFrame(() => {
        this._jDragRaf = 0;
        const hit = nearest(e.clientX);
        if (!hit || hit.id === this._jActive) return;
        const w = walkEl();
        if (w) w.style.left = hit.pos;
        this._jGo(hit.id);
      });
    };
    this._jUp = () => {
      if (!this._jDragging) return;
      this._jDragging = false;
      const w = walkEl();
      if (w) w.style.cursor = 'grab';
    };
    // Arrow keys are already bound globally for this view, so the walker needs no
    // key handler of its own — a second one would step twice per press.
    try {
      document.addEventListener('pointerdown', this._jDown);
      document.addEventListener('pointermove', this._jMove, { passive: false });
      document.addEventListener('pointerup', this._jUp);
      document.addEventListener('pointercancel', this._jUp);
    } catch (e) {}
  }
  _jTick(force) {
    let rows = null;
    try { rows = document.querySelectorAll('[data-jentry]'); } catch (e) { return; }
    if (!rows || !rows.length) return;
    const line = window.innerHeight * 0.4;
    let active = rows[0], best = Infinity;
    rows.forEach(r => {
      const b = r.getBoundingClientRect();
      const d = Math.abs(b.top + Math.min(b.height, 220) / 2 - line);
      if (d < best) { best = d; active = r; }
    });
    const id = active.getAttribute('data-jentry');
    if (id === this._jActive && !force) return;
    this._jActive = id;
    rows.forEach(r => r.setAttribute('data-on', r === active ? '1' : '0'));
    let pos = '0%';
    document.querySelectorAll('[data-jtick]').forEach(t => {
      const on = t.getAttribute('data-jtick') === id;
      t.setAttribute('data-on', on ? '1' : '0');
      if (on) pos = t.style.left || '0%';
    });
    const walk = document.querySelector('[data-jwalk]');
    if (walk) walk.style.left = pos;
    const meta = (this._jMeta || {})[id];
    // The walker is exposed as a slider, so it has to report where it is. Without
    // these a screen reader announces a slider with no position: the arrow keys work
    // but the reader cannot tell which year they have landed on.
    if (walk) {
      const ids = Object.keys(this._jMeta || {});
      const idx = ids.indexOf(id);
      walk.setAttribute('aria-valuemin', '1');
      walk.setAttribute('aria-valuemax', String(ids.length || 1));
      walk.setAttribute('aria-valuenow', String(idx < 0 ? 1 : idx + 1));
      if (meta) {
        const row = document.querySelector('[data-jentry="' + id + '"]');
        const t = row ? (row.querySelector('h3, h4, [data-jtitle]') || {}).textContent : '';
        walk.setAttribute('aria-valuetext', meta.year + (t ? ' \u2014 ' + t.trim() : ''));
      }
    }
    const y = document.querySelector('[data-jyear]');
    const er = document.querySelector('[data-jera]');
    if (meta && y) y.textContent = meta.year;
    if (meta && er) er.textContent = meta.era;
  }
  _hasPhoto(id) {
    if (!this._photoSet) {
      this._photoSet = {};
      'g1 g2 g3 g4 g5 g6 g7 a1 a2 a3 a4 a5 a6 a7 a8 a10 t01 t02 t03 t04 t05 t06 t07 t08 t09 t10 t11 t12 t13 t14 t15 t16 t17 t18 t19 t20 t21 t22 t23 t24 t25 t26 t27 t28 t29 t30 t31 t32 t33 t34'.split(' ').forEach(k => { this._photoSet[k] = 1; });
    }
    return !!this._photoSet[id];
  }
  // The eleven core values, in the six groupings the organisation uses internally.
  // Each is stated as the belief, then as an observable practice a village could check.
  // The written safeguards an international-standard organisation is expected to hold,
  // stated in DEHAT's own terms: what it commits us to, who can invoke it, what it looks like.
  // Home-page pointer into Who We Are: eight faces, one of them named. The reader chooses
  // whose line they read, which is the same premise as the page it leads to.
  _whoTeaser(setView, T) {
    const ids = ['t33', 't28', 't06', 't34', 't15', 't21', 't09', 't31'];
    const PROF = ((this._wp || {}).PROFILES) || {};
    const sel = this.state.homeFace || ids[0];
    const P = PROF[sel] || {};
    const dist = this._districtOf(P.role, P.place);
    return {
      head: T.who_teaser_head,
      body: T.who_teaser_body,
      name: P.name || '',
      role: this._tc('team', sel, 'role', P.role || ''),
      meta: [dist, P.joined ? T.since_tpl.replace('{y}', P.joined) : ''].filter(Boolean).join(' \u00b7 '),
      cta: T.who_teaser_cta,
      cta2: T.who_teaser_cta2,
      foot: T.who_teaser_foot,
      go: setView('who'),
      goStory: this._go('who', 'journey'),
      faces: ids.map(id => {
        const on = id === sel;
        return {
          k: id, label: (PROF[id] || {}).name || id,
          src: this._por(id),
          pressed: on ? 'true' : 'false',
          ring: on ? 'var(--ac-purple)' : 'var(--border)',
          op: on ? '1' : '.62',
          scale: on ? '1.04' : '1',
          filt: on ? 'none' : 'saturate(.72)',
          pick: () => this.setState({ homeFace: id }),
        };
      }),
    };
  }
  _policies() {
    const S = this.state;
    const GROUPS = [
      { label: 'People and Protection', ac: 'crimson', items: [
        { k: 'p1', name: 'Child Protection and Safeguarding Policy',
          holds: 'No adult working with us is alone and unaccountable with a child.',
          who: 'Any child, parent, teacher, panchayat member or colleague who sees or suspects harm by anyone connected to DEHAT.',
          practice: 'Background checks before field placement, a written code of conduct signed each year, a named safeguarding focal point in every district, referral to the Child Welfare Committee and the statutory system rather than internal handling, and no photograph or name of a child published without informed consent.',
          meta: 'Board approved \u00b7 Reviewed annually' },
        { k: 'p2', name: 'Prevention of Sexual Harassment at Work',
          holds: 'A complaint is heard by a committee, not by a manager.',
          who: 'Any employee, fellow, intern, volunteer or visitor, regardless of contract.',
          practice: 'An Internal Committee constituted under the 2013 Act with an external member, timelines stated in writing, protection from retaliation, and an annual report to the Board.',
          meta: 'Statutory \u00b7 Internal Committee named' },
        { k: 'p3', name: 'Protection from Sexual Exploitation and Abuse',
          holds: 'Aid is never conditional on anything a person gives in return.',
          who: 'Any community member, participant or member of the public.',
          practice: 'Applies to staff, partners, consultants and drivers alike; reporting routes that do not pass through the person complained about; and immediate suspension from field contact while a complaint is examined.',
          meta: 'Board approved \u00b7 Partner condition' },
        { k: 'p4', name: 'Code of Conduct and Human Resources Policy',
          holds: 'Recruitment, pay and discipline follow written rules, not preference.',
          who: 'Everyone employed or engaged, and anyone who applies.',
          practice: 'Published grades, no discrimination on caste, religion, gender, disability or origin, recruitment from the districts we work in, and a grievance route that ends at the Board rather than at a supervisor.',
          meta: 'Board approved \u00b7 Reviewed every two years' },
        { k: 'p5', name: 'Gender Equality, Diversity and Inclusion',
          holds: 'Who is in the room is treated as a measurable question.',
          who: 'Colleagues and community institutions we work with.',
          practice: 'Gender composition tracked at team and collective level, meetings timed and located so women can attend, and accessibility considered in every training venue.',
          meta: 'Board approved \u00b7 Reported annually' },
      ] },
      { label: 'Money and Integrity', ac: 'olive', items: [
        { k: 'p6', name: 'Financial Policy and Internal Controls',
          holds: 'Every rupee has a document, an approver and an audit trail.',
          who: 'Funders, auditors, regulators and any reader of the public register.',
          practice: 'Segregated project accounts, dual authorisation above a stated limit, statutory and internal audit, and figures never added across currencies or counted twice where a grant is shared.',
          meta: 'Audited annually \u00b7 Register published' },
        { k: 'p7', name: 'Anti-Fraud, Anti-Bribery and Anti-Corruption',
          holds: 'No facilitation payment, in either direction.',
          who: 'Any staff member, partner, vendor or community member.',
          practice: 'Declared gifts register, competitive procurement above a threshold, and a stated obligation to report rather than absorb a loss quietly.',
          meta: 'Board approved \u00b7 Zero tolerance' },
        { k: 'p8', name: 'Whistleblower Protection and Complaints',
          holds: 'The person who reports is protected before anything else happens.',
          who: 'Anyone, named or anonymous, inside the organisation or outside it.',
          practice: 'A route direct to the Governing Board, written acknowledgement within a stated period, no adverse action while a complaint is open, and a record of what was concluded.',
          meta: 'Board approved \u00b7 Anonymous route open' },
        { k: 'p9', name: 'Conflict of Interest and Related Party Rules',
          holds: 'A relationship is declared before it becomes a decision.',
          who: 'Board members, staff, consultants and vendors.',
          practice: 'Annual declarations, recusal from decisions involving family or personal interest, and related-party transactions disclosed in the accounts.',
          meta: 'Declared annually' },
        { k: 'p10', name: 'Counter-Terrorism, Sanctions and Anti-Money Laundering',
          holds: 'We know who our money comes from and where it goes.',
          who: 'Regulators, banks and institutional funders.',
          practice: 'Screening of partners and vendors, Foreign Contribution (Regulation) Act compliance, receipts only through designated accounts, and no cash beyond stated field limits.',
          meta: 'Statutory \u00b7 Screened at onboarding' },
        { k: 'p10b', name: 'Refund and Cancellation Policy',
          holds: 'A payment made in error should not need an argument to undo.',
          who: 'Anyone who transacts on this website, in India or abroad.',
          practice: 'Refunds for duplicate, mistaken or unauthorised transactions, a stated window to ask, refund to the originating account only, recurring investments cancellable at any time, and every refund recorded in the same audited ledger as the receipt. The full text sits below.',
          meta: 'Applies to all website transactions' },
      ] },
      { label: 'Data and Digital', ac: 'teal', items: [
        { k: 'p11', name: 'Data Protection and Privacy Policy',
          holds: 'A case record exists to help the person in it, and for no other purpose.',
          who: 'Anyone whose information we hold, or their parent or guardian.',
          practice: 'Purpose-limited collection, consent recorded in the language spoken, access restricted by role, retention periods stated, encryption of case files, and the right to ask what we hold and to have it corrected.',
          meta: 'Aligned to the Digital Personal Data Protection Act, 2023' },
        { k: 'p12', name: 'Cookie and Website Policy',
          holds: 'Nothing beyond the essential is set unless you choose it.',
          who: 'Every reader of this site.',
          practice: 'No advertising cookies, no reader profiling, a choice stored on your own device, and Cookie Settings available in the footer at any time. The full text sits below.',
          meta: 'Consent recorded on device' },
        { k: 'p13', name: 'Consent, Image and Story Use',
          holds: 'A story is told by the person it belongs to, or not at all.',
          who: 'Anyone photographed, filmed, quoted or written about.',
          practice: 'Written or recorded consent before publication, the right to withdraw later, no identification of a survivor or a child in a protection case, and every portrait on this site appearing with agreement.',
          meta: 'Consent held on file' },
        { k: 'p14', name: 'Information Security and Records Retention',
          holds: 'Records are kept as long as they are needed, and no longer.',
          who: 'Colleagues, auditors and anyone whose file we hold.',
          practice: 'Device and account controls, backup of programme records, a retention schedule by record type, and secure disposal at the end of it.',
          meta: 'Reviewed annually' },
      ] },
      { label: 'Programme and Partnership', ac: 'gold', items: [
        { k: 'p15', name: 'Community Feedback and Accountability',
          holds: 'The village sees the record before the funder does.',
          who: 'Any participant, collective or Gram Sabha we work with.',
          practice: 'Public reading of plans and spending in the settlement, a complaints route that does not run through the field worker concerned, and exit plans discussed with the community from the first year.',
          meta: 'Core Team owns \u00b7 Reviewed each cycle' },
        { k: 'p16', name: 'Partnership, Due Diligence and Sub-Grants',
          holds: 'A partner is held to the same standards we accept ourselves.',
          who: 'Funders, partner organisations and community institutions.',
          practice: 'Documented due diligence, safeguarding and financial clauses in every agreement, and monitoring visits recorded rather than assumed.',
          meta: 'Applies to every agreement' },
        { k: 'p17', name: 'Environmental and Climate Responsibility',
          holds: 'Programme practice does not contradict the programme.',
          who: 'Communities, funders and colleagues.',
          practice: 'Low-input ecological methods in field practice, travel and material choices weighed in planning, and no promotion of inputs the community cannot sustain locally.',
          meta: 'Board approved' },
        { k: 'p18', name: 'Advocacy, Non-Partisanship and Communications',
          holds: 'We argue for entitlements, never for a party.',
          who: 'The public, the press and every public institution we work with.',
          practice: 'No electoral affiliation or campaign support, positions stated as evidence and law rather than allegiance, and public institutions treated as accountable partners.',
          meta: 'Board approved \u00b7 Standing rule' },
      ] },
    ];
    return GROUPS.map((g, gi) => ({
      k: 'pg' + gi, num: '0' + (gi + 1), label: this._tagMap('policy_group', g.label, g.label),
      accent: 'var(--ac-' + g.ac + ')',
      rule: 'color-mix(in oklab, var(--ac-' + g.ac + ') 34%, var(--border))',
      items: g.items.map(p => {
        const open = (S.polOpen || '') === p.k;
        const ac = 'var(--ac-' + g.ac + ')';
        const pc = (field, fb) => this._tc('policies', p.k, field, fb);
        return Object.assign({}, p, {
          name: pc('name', p.name), holds: pc('holds', p.holds), who: pc('who', p.who),
          practice: pc('practice', p.practice), meta: pc('meta', p.meta),
          accent: ac,
          isOpen: open, isShut: !open, expanded: open ? 'true' : 'false',
          rule: 'color-mix(in oklab, ' + ac + ' 30%, var(--border))',
          ring: open ? 'color-mix(in oklab, ' + ac + ' 62%, var(--border))' : 'color-mix(in oklab, ' + ac + ' 18%, var(--border))',
          bg: 'color-mix(in oklab, ' + ac + ' ' + (open ? '12%' : '5%') + ', var(--surface2))',
          open: () => this.setState(st => ({ polOpen: st.polOpen === p.k ? '' : p.k })),
        });
      }),
    }));
  }
  _consent() {
    const T = { ...this._dict().en, ...(this._dict()[this.state.lang] || {}) };
    const S = this.state;
    const P = S.ckPrefs || { performance: false, functional: false, targeting: false };
    const set = (obj) => { try { window.localStorage.setItem('dehat.consent', JSON.stringify(obj)); } catch (e) {} };
    const decide = (v) => {
      const next = { performance: v, functional: v, targeting: v };
      set({ v: 1, at: new Date().toISOString(), prefs: next });
      this.setState({ ckPrefs: next, ckDecided: true, ckPrefsOpen: false });
    };
    const CATS = [
      { k: 'nec', label: T.ck_nec_label, locked: true, body: T.ck_nec_body },
      { k: 'performance', label: T.ck_perf_label, body: T.ck_perf_body },
      { k: 'functional', label: T.ck_func_label, body: T.ck_func_body },
      { k: 'targeting', label: T.ck_target_label, body: T.ck_target_body },
    ];
    return {
      showBanner: !S.ckDecided,
      showPrefs: !!S.ckPrefsOpen,
      openPrefs: () => this.setState({ ckPrefsOpen: true }),
      closePrefs: () => this.setState({ ckPrefsOpen: false }),
      acceptAll: () => decide(true),
      rejectAll: () => decide(false),
      confirm: () => { set({ v: 1, at: new Date().toISOString(), prefs: P }); this.setState({ ckDecided: true, ckPrefsOpen: false }); },
      bannerTitle: T.ck_banner_title, bannerBody: T.ck_banner_body,
      acceptAllLabel: T.ck_accept_all, rejectAllLabel: T.ck_reject_all, managePrefsLabel: T.ck_manage,
      prefsTitle: T.ck_prefs_title, prefsLead: T.ck_prefs_lead,
      allowAllLabel: T.ck_allow_all, essentialOnlyLabel: T.ck_essential_only,
      manageHeading: T.ck_manage_heading, alwaysActiveLabel: T.ck_always_active,
      storedNote: T.ck_stored_note, confirmLabel: T.ck_confirm,
      categories: CATS.map(c => {
        const on = !!P[c.k];
        const open = (S.ckOpen || '') === c.k;
        return {
          k: c.k, label: c.label, body: c.body,
          locked: !!c.locked, switchable: !c.locked,
          isOpen: open, expanded: open ? 'true' : 'false', sign: open ? '\u2212' : '+',
          checked: on ? 'true' : 'false',
          trackBg: on ? 'var(--ac-teal)' : 'var(--border)',
          knobBg: on ? 'var(--bg)' : 'var(--faint)',
          knobLeft: on ? '26px' : '2px',
          toggleOpen: () => this.setState(st => ({ ckOpen: (st.ckOpen === c.k) ? '' : c.k })),
          toggle: () => this.setState(st => {
            const cur = st.ckPrefs || { performance: false, functional: false, targeting: false };
            return { ckPrefs: Object.assign({}, cur, { [c.k]: !cur[c.k] }) };
          }),
        };
      }),
    };
  }
  _beliefs() {
    return [
      { label: 'Philosophical Foundations', ac: 'purple', items: [
        { k: 'v1', n: '01', name: 'The Personal is Never Only Private', belief: 'What happens inside one household shapes the whole village.',
          practice: 'The person who lived the situation leads the response to it. We prepare with them, then step back so the account given in a meeting is their own.' },
        { k: 'v2', n: '02', name: 'Empowerment is Enablement', belief: 'The seed already holds the power.',
          practice: 'We do not arrive with capability to install. We work on the conditions around it — information, organisation, follow-up — and assume the capacity is present before we get there.' },
      ] },
      { label: 'Power and Agency', ac: 'crimson', items: [
        { k: 'v3', n: '03', name: 'Primary Stakeholders, Not Beneficiaries', belief: 'Nobody here receives a service.',
          practice: 'Every household is a rights-holder, and a claim is filed in the claimant\u2019s name. Our name appears in the support, not on the application.' },
        { k: 'v4', n: '04', name: 'Praxis Kept Intact', belief: 'Action, reflection, then action again — at every level.',
          practice: 'The same cycle runs in a village meeting and in a management review. Field teams reflect on their own work rather than reporting it upward for someone else to interpret.' },
      ] },
      { label: 'Leadership and Structure', ac: 'teal', items: [
        { k: 'v5', n: '05', name: 'Anchor-Based Leadership', belief: 'Leadership sits where the lived reality is.',
          practice: 'Anchors are drawn from the same villages and blocks as the communities, and decisions closest to the ground are made there. Seniority is a form of support, not a chain of command.' },
        { k: 'v6', n: '06', name: 'Values, Then Culture, Then Systems', belief: 'A policy holds only where the culture already carries it.',
          practice: 'We change practice before we write the rule, so a manual describes what people already do. Where the two diverge, we treat the manual as the thing that is wrong.' },
      ] },
      { label: 'Strategic Approach', ac: 'olive', items: [
        { k: 'v7', n: '07', name: 'Depth is the Form Scale Takes', belief: 'Reach is a measure of quality, not of coverage.',
          practice: 'We would rather work with intensity in four districts than thinly across many. Growth follows the strength of community institutions, not the size of the next grant.' },
        { k: 'v8', n: '08', name: 'Baseline, Appraisal, Strength, Exit', belief: 'A plan is only complete when it says how we leave.',
          practice: 'Every engagement moves through baseline, participatory appraisal and strength mapping, and carries a written exit plan from the first year, so continuity does not depend on us staying.' },
      ] },
      { label: 'Operational Ethos', ac: 'red', items: [
        { k: 'v9', n: '09', name: 'Conflict is Growth', belief: 'Disruption is a sign of health, not of failure.',
          practice: 'Disagreement is recorded rather than smoothed over, including between staff and community bodies. Reviews name what did not work before they name what did.' },
        { k: 'v10', n: '10', name: 'Deep Intersectionality', belief: 'No household carries a single issue.',
          practice: 'School of Leadership, Rights & Entitlements, Human Protection and Climate Justice are carried by the same team in the same village, because a family rarely experiences them as four separate problems.' },
      ] },
      { label: 'Governance and Accountability', ac: 'gold', items: [
        { k: 'v11', n: '11', name: 'Chain of Accountability', belief: 'Accountability runs downward first.',
          practice: 'The Gram Sabha and the household see the record before the board or the funder does. What we publish about a village is what we have already read out in it.' },
      ] },
    ];
  }
  _districtOf(role, place) {
    const T = { ...this._dict().en, ...(this._dict()[this.state.lang] || {}) };
    // SLT, Core Team and Programme Anchors work across all districts and programmes.
    if (/Strategic Leadership Team|Core Team|Programme Anchor|Programme Director|Executive Director|Joint Reflection|Management Information System|Monitoring and Evaluation/i.test(role || '')) return T.across_districts;
    const p = (place || '').trim();
    if (!p) return '';
    const DIST = ['Bahraich', 'Shrawasti', 'Shravasti', 'Balrampur', 'Lakhimpur Kheri'];
    const found = DIST.filter(d => p.indexOf(d) > -1).map(d => d === 'Shravasti' ? 'Shrawasti' : d);
    const uniq = found.filter((d, i) => found.indexOf(d) === i);
    if (uniq.length > 2) return T.across_districts;
    if (uniq.length) return uniq.join(' ' + T.and_word + ' ');
    const bits = p.split(',');
    return bits[bits.length - 1].trim();
  }
  _por(id) {
    const R = (typeof window !== 'undefined' && window.__resources) || null;
    return (R && R['por_' + id]) || ('./assets/portraits/' + id + '.png');
  }
  _photoSrc(id) {
    return this._por(id);
  }
  _whoView(setView) {
    const T = { ...this._dict().en, ...(this._dict()[this.state.lang] || {}) };
    const W = this._wd || {};
    const S = this.state;
    const stems = W.stems || [];
    const team = W.team || [];
    const key = S.whoStem || 'nyay';
    const active = stems.filter(s => s.k === key)[0] || stems[0] || { text: '', en: '' };
    const purple = this._tok('#4F0E73');
    const teal = this._tok('#0E5565');
    const EN = this._we || {};
    const tx = (t) => (S.lang === 'hi') ? t : Object.assign({}, t, EN[t.id] || {});
    const answers = team.filter(t => t.stemKey === key).map(tx);
    const PROF = ((this._wp || {}).PROFILES) || {};
    const roleOf = (t) => ((PROF[t.id] || {}).role || t.role || '');
    const has = (re) => (t) => re.test(roleOf(t));
    // Filters follow the DEHAT Organisation Structure (v.3, 10 May 2022).
    const GROUPS = [
      { k: 'all', label: 'Everyone', test: () => true },
      { k: 'slt', label: 'Strategic Leadership Team', test: has(/Strategic Leadership Team/i) },
      { k: 'core', label: 'Core Team', test: has(/Core Team/i) },
      { k: 'prog', label: 'Programme Anchors', test: has(/Programme Anchor/i) },
      { k: 'proj', label: 'Project Anchors', test: has(/Project Anchor/i) },
      { k: 'grass', label: 'Grassroots Anchors', test: has(/Grassroots Anchor/i) },
      { k: 'learn', label: 'Joint Reflection, Learning and Change', test: has(/Joint Reflection|Management Information System|Monitoring and Evaluation/i) },
      { k: 'fin', label: 'Finance and Admin Team', test: has(/Finance|Accounts|Administration/i) },
    ].map(g => Object.assign({}, g, { label: this._tagMap('team_group', g.label, g.label) }));
    const gKey = S.whoGroup || 'all';
    const gTest = (GROUPS.filter(g => g.k === gKey)[0] || GROUPS[0]).test;
    const typed = (S.whoMine || '').trim().length > 2;
    const board = S.whoBoard === 'advisory' ? (W.advisory || []) : (W.board || []);
    const blocksOf = (p) => [
      { k: 'b1', label: 'Where they come from', text: p.from },
      { k: 'b2', label: 'What they do here', text: p.does },
      { k: 'b3', label: 'One thing that stayed with them', text: p.moment },
      { k: 'b4', label: 'What the community taught them', text: p.learnt },
      { k: 'b5', label: 'Away from work', text: p.off },
    ].filter(b => b.text);
    const openMo = S.whoMoment || '';
    const INK = './assets/ink/';
    const RG = this._rg || {};
    const laneMeta = {
      person: { label: T.lane_people, color: purple },
      dehat: { label: 'DEHAT', color: teal },
      community: { label: T.lane_community, color: this._tok('#556223') },
    };
    const laneKey = S.whoLane || 'all';
    const allEvents = (RG.REGISTER || []).slice().sort((a, b) => a.sort - b.sort);
    const events = laneKey === 'all' ? allEvents
      : laneKey === 'honours' ? allEvents.filter(ev => !!ev.award)
      : allEvents.filter(ev => ev.lane === laneKey);
    const jMeta = {};
    const jEras = (RG.ERAS || []).map(e => {
      const eraLabel = this._tc('register_era', e.k, 'label', e.label);
      return {
      k: e.k, label: eraLabel, span: e.span, note: this._tc('register_era', e.k, 'note', e.note),
      artCss: 'url(' + INK + e.art + ')',
      items: events.filter(ev => ev.era === e.k).map(ev => {
        const lm = laneMeta[ev.lane] || laneMeta.dehat;
        const isOpen = openMo === ev.id;
        const evWho = this._tc('register', ev.id, 'who', ev.who);
        jMeta[ev.id] = { year: ev.year, era: eraLabel };
        return {
          k: ev.id, id: ev.id, year: ev.year, who: evWho, place: this._tc('register', ev.id, 'place', ev.place || ''),
          title: this._tc('register', ev.id, 'title', ev.title), story: this._tc('register', ev.id, 'story', ev.story), color: lm.color, isAward: !!ev.award,
          links: (ev.links || []).map((l, i) => ({ k: 'lk' + i, label: l.label, href: l.href })),
          hasLinks: !!(ev.links && ev.links.length),
          hasProg: !!ev.prog && ev.prog !== 'All', prog: this._tagMap('progLabel', ev.prog, ev.prog) || '',
        };
      }),
    }; }).filter(e => e.items.length);
    this._jMeta = jMeta;
    const jTicks = events.map(ev => ({
      k: ev.id, id: ev.id, label: ev.year + ' \u2014 ' + this._tc('register', ev.id, 'title', ev.title),
      pos: (Math.max(0, Math.min(1, (ev.sort - 1968) / 58)) * 100).toFixed(2) + '%',
      color: (laneMeta[ev.lane] || laneMeta.dehat).color,
      go: () => this._jGo(ev.id),
    }));
    const laneTabs = [{ k: 'all', label: T.lane_everything, color: 'var(--faint)' }].concat(
      ['person', 'dehat', 'community'].map(k => ({ k: k, label: laneMeta[k].label, color: laneMeta[k].color })),
      [{ k: 'honours', label: T.lane_honours, color: this._tok('#EAAE28') }]
    ).map(t => ({
      k: t.k, label: t.label, dot: t.color,
      pick: () => this.setState({ whoLane: t.k, whoMoment: '' }, () => this._jTick(true)),
      pressed: laneKey === t.k ? 'true' : 'false',
      bg: laneKey === t.k ? 'var(--surface)' : 'transparent',
      fg: laneKey === t.k ? 'var(--text)' : 'var(--dim)',
      ring: laneKey === t.k ? t.color : 'var(--border)',
    }));
    return {
      facts: (W.place && W.place.facts ? W.place.facts : []).map((f, i) => ({ k: 'f' + i, n: f.n, l: this._tc('who_facts', 'f' + i, 'l', f.l) })),
      inkPair: 'url(' + INK + 't-pair-a.png)',
      inkPairB: 'url(' + INK + 'pair-b.png)',
      inkCrowd: 'url(' + INK + 't-crowd.png)',
      inkFour: 'url(' + INK + 't-four.png)',
      inkSprig: 'url(' + INK + 't-sprig.png)',
      ribbonA: 'url(' + INK + 't-ribbon-a.png)',
      ribbonCrowd: 'url(./assets/story/ribbon-crowd.png)',
      walkers: [
        { k: 'w1', art: 'url(' + INK + 't-pair-a.png)', w: 'clamp(42px,4.8vw,74px)', h: 'clamp(64px,7.4vw,112px)', bottom: 'clamp(19px,2.3vw,33px)', dur: '26s', delay: '0s', step: '0s', op: '1' },
        { k: 'w2', art: 'url(' + INK + 't-family.png)', w: 'clamp(60px,6.8vw,104px)', h: 'clamp(58px,6.6vw,98px)', bottom: 'clamp(19px,2.3vw,33px)', dur: '35s', delay: '-11s', step: '-.4s', op: '.95' },
        { k: 'w3', art: 'url(' + INK + 't-four.png)', w: 'clamp(70px,8vw,122px)', h: 'clamp(56px,6.4vw,92px)', bottom: 'clamp(19px,2.3vw,33px)', dur: '44s', delay: '-24s', step: '-.7s', op: '.9' },
      ],
      crowdFilter: this.state.theme === 'dark' ? 'invert(1) brightness(1.35) hue-rotate(180deg) saturate(1.2)' : 'none',
      ribbonB: 'url(' + INK + 'ribbon-b.png)',
      roadV: 'url(./assets/story/rail-road-v.png)',
      inkFilter: this.state.theme === 'dark' ? 'invert(1) brightness(1.6)' : 'none',
      jEras: jEras,
      ticks: jTicks,
      lanes: laneTabs,
      laneCount: (events.length === allEvents.length ? T.entries_count_all.replace('{n}', String(events.length)) : T.entries_count_filtered.replace('{n}', String(events.length)).replace('{total}', String(allEvents.length))),
      railYear0: (events[0] || {}).year || '1968',
      railEra0: (jEras[0] || {}).label || '',
      railRoad: 'url(./assets/story/rail-road.png)',
      railWalkArt: 'url(' + INK + 't-pair-a.png)',

      stems: stems.map(s => ({
        k: s.k, en: s.en, pick: () => this.setState({ whoStem: s.k, whoReveal: false }),
        bg: s.k === key ? 'var(--surface)' : 'transparent',
        fg: s.k === key ? 'var(--text)' : 'var(--dim)',
        ring: s.k === key ? teal : 'var(--border)',
        weight: s.k === key ? '700' : '600',
      })),
      stemHi: (S.lang === 'hi') ? active.text : active.en,
      stemEn: (S.lang === 'hi') ? active.en : ('Asked in Hindi as: ' + active.text),
      placeholder: 'Your answer, in a line or two',
      mine: S.whoMine || '',
      onMine: (e) => this.setState({ whoMine: e.target.value }),
      reveal: () => this.setState({ whoReveal: !S.whoReveal }),
      revealLabel: S.whoReveal ? 'Hide their answers' : 'Show what ' + answers.length + ' of them wrote',
      revealHint: S.whoReveal ? '' : (typed ? 'Now compare.' : 'You can skip ahead, but it reads differently if you answer first.'),
      revealed: !!S.whoReveal,
      answers: answers.map(t => ({ k: t.id, finish: t.finish, name: t.name, role: t.role, place: t.place })),
      beliefGroups: this._beliefs().map((cat, ci) => ({
        k: 'bc' + ci, num: '0' + (ci + 1), label: cat.label,
        accent: 'var(--ac-' + cat.ac + ')',
        rule: 'color-mix(in oklab, var(--ac-' + cat.ac + ') 34%, var(--border))',
        items: cat.items.map(v => {
          const open = !!S.whoBeliefAll || S.whoBelief === v.k;
          const ac = 'var(--ac-' + cat.ac + ')';
          return {
            k: v.k, n: v.n, name: v.name, belief: v.belief, practice: v.practice,
            isOpen: open, isShut: !open, hint: 'Open',
            expanded: open ? 'true' : 'false',
            accent: ac,
            ghost: 'color-mix(in oklab, ' + ac + ' ' + (open ? '34%' : '20%') + ', transparent)',
            rule: 'color-mix(in oklab, ' + ac + ' 30%, var(--border))',
            ring: open ? 'color-mix(in oklab, ' + ac + ' 62%, var(--border))' : 'color-mix(in oklab, ' + ac + ' 20%, var(--border))',
            bg: 'color-mix(in oklab, ' + ac + ' ' + (open ? '13%' : '6%') + ', var(--surface2))',
            open: () => this.setState(st => ({ whoBeliefAll: false, whoBelief: (!st.whoBeliefAll && st.whoBelief === v.k) ? '' : v.k })),
          };
        }),
      })),
      beliefCount: 'Eleven values · six parts of the organisation',
      beliefAllLabel: S.whoBeliefAll ? 'Close all eleven' : 'Open all eleven',
      beliefAllBg: S.whoBeliefAll ? 'var(--surface)' : 'transparent',
      beliefAllFg: S.whoBeliefAll ? 'var(--text)' : 'var(--dim)',
      beliefAll: () => this.setState(st => ({ whoBeliefAll: !st.whoBeliefAll, whoBelief: '' })),
      rosterHead: T.roster_head_who,
      rosterNote: T.roster_note_who,
      founder: (() => {
        const f = Object.assign({ name: '', role: '', quote: '', story: '', story2: '' }, ((this._wp || {}).FOUNDER) || {}, { src: this._por('founder') });
        return Object.assign({}, f, { role: this._tagMap('team_role', f.role, f.role) });
      })(),
      roleGroups: GROUPS.map(g => {
        const n = team.filter(t => g.test(t)).length;
        return {
          k: g.k, label: g.label + ' (' + n + ')',
          pick: () => this.setState({ whoGroup: g.k, whoPerson: '' }),
          bg: gKey === g.k ? 'var(--surface)' : 'transparent',
          fg: gKey === g.k ? 'var(--text)' : 'var(--dim)',
          ring: gKey === g.k ? teal : 'var(--border)',
          weight: gKey === g.k ? '700' : '600',
        };
      }),
      team: team.map(tx).filter(gTest).map((t, ti) => {
        const P = (((this._wp || {}).PROFILES) || {})[t.id] || {};
        const nm = P.name || t.name;
        const rawRole = P.role || t.role;
        return {
          k: t.id, name: nm, role: this._tagMap('team_role', rawRole, rawRole), photo: t.photo,
          hasPhoto: this._hasPhoto(t.id), noPhoto: !this._hasPhoto(t.id), src: this._photoSrc(t.id),
          hasRole: !!(P.role || t.role),
          delay: ((ti % 10) * 45) + 'ms',
          slotHint: 'Photo \u2014 ' + nm,
          meta: [this._districtOf(P.role || t.role, P.place || t.place), (P.joined || t.joined) ? T.since_tpl.replace('{y}', (P.joined || t.joined)) : ''].filter(Boolean).join(' \u00b7 '),
          hasMeta: !!((P.place || t.place) || (P.joined || t.joined)),
          ring: t.id === S.whoPerson ? teal : 'var(--border)',
          selected: t.id === S.whoPerson,
          expanded: t.id === S.whoPerson ? 'true' : 'false',
          metaLong: [(P.place || t.place), (P.prog || t.prog), (P.joined || t.joined) ? T.joined_tpl.replace('{y}', (P.joined || t.joined)) : ''].filter(Boolean).join(' \u00b7 '),
          quote: P.quote || t.finish || '',
          hasQuote: !!(P.quote || t.finish),
          story: P.story || '',
          story2: P.story2 || '',
          hasStory2: !!P.story2,
          blocks: blocksOf(t),
          open: () => this.setState({ whoPerson: t.id === S.whoPerson ? '' : t.id }),
        };
      }),
      boardTabs: [
        { k: 'governing', label: 'Governing Board (' + ((W.board || []).length) + ')' },
        { k: 'advisory', label: 'Advisory Board (' + ((W.advisory || []).length) + ')' },
      ].map(t => ({
        k: t.k, label: t.label, pick: () => this.setState({ whoBoard: t.k }),
        bg: S.whoBoard === t.k ? 'var(--surface)' : 'transparent',
        fg: S.whoBoard === t.k ? 'var(--text)' : 'var(--dim)',
        ring: S.whoBoard === t.k ? teal : 'var(--border)',
      })),
      boardList: board.map(m => {
        const WP = this._wp || {};
        const B = (S.whoBoard === 'advisory' ? (WP.ADVISERS || {}) : (WP.BOARD || {}))[m.id] || {};
        const nm = B.name || m.name;
        const boardSection = S.whoBoard === 'advisory' ? 'advisory' : 'board';
        return {
          k: m.id, name: nm, bio: this._tc(boardSection, m.id, 'bio', B.line || m.bio), photo: m.photo,
          hasPhoto: this._hasPhoto(m.id),
          noPhoto: !this._hasPhoto(m.id),
          src: this._photoSrc(m.id),
          role: this._tc(boardSection, m.id, 'role', B.role || m.role || 'Adviser'),
          roleColor: S.whoBoard === 'advisory' ? purple : teal,
          li: B.linkedin || '',
          hasLi: !!B.linkedin,
          hasMore: !!(B.more && B.more.href),
          moreHref: (B.more || {}).href || '',
          moreLabel: (B.more || {}).label || '',
          slotHint: 'Photo \u2014 ' + nm,
        };
      }),
      numbers: (W.numbers || []).map((n, i) => ({ k: 'n' + i, n: n.n, l: this._tc('who_numbers', 'n' + i, 'l', n.l) })),
      instFigures: [
        { k: 'i1', n: '1989', l: 'Vananchal, the first school, opened — eleven years before the organisation existed on paper', ac: 'purple' },
        { k: 'i2', n: '2000', l: 'Registered as a society, with the work already running in the villages', ac: 'teal' },
        { k: 'i3', n: '23', l: 'Districts in the footprint, from four of intensive presence outward', ac: 'olive' },
        { k: 'i4', n: '2', l: 'States in the footprint \u2014 Uttar Pradesh and Maharashtra', ac: 'gold' },
      ].map(f => ({ k: f.k, n: f.n, l: this._tc('who_inst_figures', f.k, 'l', f.l), ac: 'var(--ac-' + f.ac + ')', bg: 'color-mix(in oklab, var(--ac-' + f.ac + ') 7%, var(--surface))' })),
      goStories: setView('stories'),
      goWork: setView('work'),
      goFinance: setView('finance'),
    };
  }
  _dict() {
    const EN = {
      foot_policies:'Policies and Safeguards', foot_cookies:'Cookie Settings', foot_concern:'Report a Concern',
      raise_step1:'1 · What is this about', raise_step2:'2 · Documents you want with the reply', raise_step2_note:'Optional. Anything you tick is listed in the draft by name.', raise_step3:'3 · In your words',
      raise_who_placeholder:'Your name and how to reach you (optional)', raise_subject_label:'Draft subject:', raise_open_email:'Open the drafted email',
      raise_copy:'Copy the draft', raise_copied:'Draft copied', raise_docs_requested_label:'Documents requested:', raise_grateful_line:'I would be grateful for an acknowledgement and a named person handling this.', raise_doc_request_prefix:'Document request — ', raise_eyebrow:'Right of reply',
      nav_home:'Home', nav_who:'Who We Are', nav_work:'Our Work', nav_impact:'Impact', nav_stories:'Stories', nav_media:'Media', nav_involved:'Get Involved',
      donate:'Invest', since:'Since 1989', org_full:'Child Rights · Government · Community Partnership',
      language:'Language', lang_indian:'Indian languages', lang_global:'Global (UN)',
      hero_title_a:'A child-centred society where every child realises their ', hero_title_b:'rights', hero_title_c:' — safe, dignified, whole.',
      hero_sub:'We work with communities and public systems along the Indo-Nepal Terai so that children\u2019s rights are not just written down, but recognised, accessed, and upheld in everyday life.',
      hero_cta1:'Stand with communities', hero_cta2:'See how we work', hero_photo:'PHOTO — Child Parliament leaders, Lohra Village, Bahraich',
      hero_principle:'Working with communities and government systems, for every child.',
      stat_children:'Children & Adolescents Reached', stat_invested:'Invested in Community Systems since 2000', stat_resources:'Public Resources Accessed', stat_districts:'Districts across 2 States',
      stat_hint:'Four figures, withheld. Tap one to see it.', stat_reveal:'Tap to reveal', stat_hide:'Hide', stat_reveal_all:'Reveal all four', stat_hide_all:'Hide all', grid_reveal_all:'Reveal all twelve', grid_hint:'Twelve figures, withheld. Tap one to see it.', bl_drag:'Drag the survey forward', lens_year_eyebrow:'Year by year', lens_year_title:'Every audited year, and what it added.', lens_year_sub:'The full run of audited fiscal years, and the cumulative social investment received by the end of each one.', lens_year_note:'Source: the same audited fiscal-year ledger published in full on the Transparency page. Figures are receipts, not project-card commitments, so an ongoing project\u2019s full grant appears only as it is actually received.', lens_uncrc_eyebrow:'By UNCRC pillar', lens_uncrc_title:'Every project, grouped by the child right it serves.', lens_uncrc_sub:'A project can serve more than one right at once, so it can appear in more than one card below \u2014 that is tagging, not double counting money.', lens_csr_eyebrow:'By Schedule VII', lens_csr_title:'Every project, grouped by its Companies Act Schedule VII category.', lens_csr_sub:'The categories under which corporate social responsibility spending is permitted in India, and what falls under each here.', lens_sdg_eyebrow:'By SDG and MDG', lens_sdg_title:'Every project, grouped by the global goal it advances.', lens_sdg_sub:'Sustainable Development Goals from 2015 onward, and Millennium Development Goals for the years before that.', lens_sdg_tab_sdg:'SDGs', lens_sdg_tab_mdg:'MDGs', lens_projects_suffix:'projects', lens_awards_eyebrow:'Recognition', lens_awards_title:'Awards, and who received them.', lens_award_all:'All', lens_award_community:'To the community we work with', lens_award_founder:'To the founder', lens_award_org:'To the organisation',
      vision:'Vision', mission:'Mission', theory:'Theory of Change',
      vision_body:'A child-centred society where every child realises their rights and lives a safe, dignified, and fulfilling life.',
      mission_body:'To work with communities and systems to realise existing power, ensuring children\u2019s rights are recognised, accessed, and upheld in everyday life.',
      theory_body:'When communities act and systems respond in convergence, children\u2019s survival, development, protection, and participation are realised and sustained.',
      eyebrow_work:'What we do', work_head:'Four fronts, one converging response.',
      eyebrow_where:'Where we work', where_head:'23 districts. 2 states. One border.',
      where_sub:'We work across the eastern Indo-Nepal border in Uttar Pradesh and in Maharashtra — regions bound by a shared structural vulnerability. Tap a district to see the ground.',
      eyebrow_cycle:'The structural vulnerability cycle', cycle_head:'Risks don\u2019t occur in isolation.',
      cycle_sub:'They reinforce each other across generations — unless systems respond in time. There is no fixed order: for any child, the trap can begin at any point, and each risk pulls the next one closer.',
      cycle_pick:'Tap any moment to follow how one life is shaped.',
      cycle_note:'Each figure is the worst recorded value across seven districts of Uttar Pradesh’s Indo-Nepal Terai belt — Bahraich, Shravasti, Balrampur, Lakhimpur Kheri, Siddharthnagar, Maharajganj and Kushinagar. Sources: the National Family Health Survey 5 (2019–21) district fact-sheet dataset (Ministry of Health and Family Welfare / International Institute for Population Sciences) for health, nutrition and gender; Unified District Information System for Education Plus district fact sheets for schooling; the Sample Registration System for maternal mortality, which is state-level. Every health figure comes from a single survey round, so the districts are compared like with like. Spousal violence is collected in the National Family Health Survey state module only and is shown as the Uttar Pradesh figure. Four moments — child labour, the poorest wealth bracket, and infant and under-5 mortality — rest on records still awaiting re-verification, and say so. India publishes no official district series for infant or under-5 mortality. Every moment names its district and source.',
      eyebrow_process:'The process', process_head:'When communities act, systems respond.', eyebrow_stories:'Stories of change',
      cta_donate:'Invest', cta_donate_b:'Back community-led work with capital or material, online or offline.', cta_donate_a:'Invest now',
      cta_vol:'Volunteer', cta_vol_b:'Intern, work virtually, or become a DEHAT Fellow.', cta_vol_a:'Join us',
      cta_partner:'Partner', cta_partner_b:'Corporate, academic, or institutional partnerships.', cta_partner_a:'Collaborate',
      pillar_link_work:'See the four programmes', pillar_link_how:'See how we work', stories_all:'Read every story',
      work_title:'Rights, realised in everyday life.',
      chrono_title:'Every project, in chronological order',
      count_label:'projects on record',
      open_programme:'Open programme', open_programme_home:'Open the programme →', method_sub:'Four movements that feed each other. A system that responds changes what a community expects next, and the loop begins again — higher up. Tap a movement to follow it.', method_footnote:'Each turn of the loop leaves more capability behind than the last.', method_cta:'See it inside the programmes →', in_memory:'In memory', sdg_prefix:'Sustainable Development Goal',
      frame_uncrc_label:'United Nations Convention on the Rights of the Child', frame_uncrc_sub:'The four rights clusters',
      frame_sdg_label:'Sustainable Development Goals', frame_sdg_sub:'Global goals we report against',
      frame_csr_label:'Schedule VII', frame_csr_sub:'Where Corporate Social Responsibility funding fits',
      sdg_era_label:'Sustainable Development Goals Era',
      mdg_para:'DEHAT’s first two decades ran alongside the Millennium Development Goals — poverty and hunger, universal primary education, gender equality, child mortality and maternal health. Those five shaped the early programme: enrolment drives, immunisation tracking, antenatal registration. The Sustainable Development Goals widened the frame in 2015 to include climate, institutions and inequality, which is where the newer work sits. The through-line did not change. The unit of measurement did.',
      word_project:'project', word_projects:'projects',
      iv_current:'Currently Working With', iv_past:'Previously Worked With', iv_all:'All', iv_all_programmes:'All Programmes',
      narrow_register:'Narrow the register', partners_scroll_hint:'partners · scroll or drag',
      f_full_name:'Full Name', f_phone:'Phone', f_email:'Email', f_email_hint:'The receipt is sent here',
      f_city:'City', f_state:'State', f_postal_code:'Postal Code', f_country:'Country', f_india:'India',
      f_additional_note:'Additional Note', f_additional_note_hint:'Anything we should know about this investment',
      not_itemised:'Not Itemised', in_register:'In Register', add_another_attachment:'Add Another Attachment',
      programme_word:'Programme', prog_extra_inst:'Institutional Strengthening',
      fork_eyebrow:'Before you read on', fork_question:'Which of these is DEHAT’s approach?',
      fork_reply_own:'That is the one we do. What follows is what it means in practice.',
      fork_reply_aid:'That is the one we do not. What follows is why.',
      fork_aid_title:'A basket handed over, and handed over again next month.', fork_aid_caption:'Not charity. Not rescue. Not dependency.',
      fork_own_title:'A tree planted together, and still standing after we leave.', fork_own_caption:'An investment in a society we all share.',
      fork_choose:'Choose, then read on.', fork_you_chose:'You chose this', fork_choose_this:'Choose this one',
      case_eyebrow:'The Case For Investing', case_h1:'This Isn’t Charity. It’s an Investment in a Society We All Share.',
      case_p1:'Every society eventually pays the price of exclusion.',
      case_p2:'Whether through unemployment, poor health, food insecurity, environmental degradation, violence, migration, or lost economic potential, the costs of leaving people behind are never confined to those who experience them first. They ripple outward—affecting markets, institutions, businesses, governments, and communities alike.',
      case_p3:'At DEHAT, we therefore see social investment differently.',
      case_p4:'We do not believe that meaningful social change is driven by pity, charity, or the desire to “save” someone. Nor do we believe that communities are empty vessels waiting to be filled with external solutions.',
      case_p5:'People are not problems to be solved.',
      case_p6:'They are citizens, workers, farmers, entrepreneurs, parents, consumers, creators, and leaders whose potential is often constrained not by lack of ability, but by unequal access to opportunities, public systems, and justice.',
      case_p7:'Our work is about removing those barriers.',
      case_p8:'Every restored opportunity strengthens the social and economic fabric that all of us depend upon.',
      case_p9:'This is not a one-way transfer of generosity.', case_p10:'It is the strengthening of a shared ecosystem.',
      case_p11:'An economy is healthiest when more people can participate in it with dignity.',
      case_p12:'A village where families earn stable incomes buys more goods, demands better services, invests in education, improves housing, supports local enterprises, and creates opportunities for others. Businesses grow. Markets deepen. Public institutions and communities work more closely together. Communities become more resilient.',
      case_p13:'Prosperity circulates.', case_p14:'That is the economy we are helping to build.',
      case_p15:'This is why we rarely describe our supporters as donors.',
      case_p16:'They are partners in building stronger communities, stronger institutions, and a stronger future for everyone.',
      case_p17:'For over two decades, DEHAT has worked alongside communities—not above them—to ensure that children are protected, women exercise greater autonomy, farmers build resilient livelihoods, public systems and communities work in closer partnership, and communities themselves become the drivers of lasting change.',
      case_p18:'Our role is not to stand in front of communities.', case_p19:'Our role is to stand beside them until they no longer need us.',
      case_p20:'Because real development is measured not by how much assistance we provide, but by how much independence communities gain.',
      case_h3:'Why Invest Through DEHAT?', case_p21:'This is not about giving something away.', case_p22:'It is about building something together.',
      case_return_0:'When a woman secures her land rights, she invests in her family’s future.',
      case_return_1:'When a child remains in school instead of entering labour, the entire economy gains future productivity.',
      case_return_2:'When a farmer adopts resilient agricultural practices, local food systems become stronger.',
      case_return_3:'When a family accesses healthcare before a crisis, communities become healthier and public costs decline.',
      case_return_4:'When workers receive the wages and entitlements guaranteed to them, they participate more fully in local markets.',
      case_swap_0_not:'Your contribution does not purchase dependency.', case_swap_0_but:'It expands capability.',
      case_swap_1_not:'It does not replace people’s agency.', case_swap_1_but:'It strengthens it.',
      case_swap_2_not:'It does not create beneficiaries.', case_swap_2_but:'It enables citizens to claim opportunities, exercise rights, build livelihoods, and contribute meaningfully to society.',
      case_why_0:'Because your contribution helps strengthen systems rather than merely responding to symptoms.',
      case_why_1:'Because resilient communities reduce future social and economic costs.',
      case_why_2:'Because healthier local economies benefit everyone.',
      case_why_3:'Because justice and opportunity are not acts of charity—they are foundations of sustainable prosperity.',
      case_why_4:'And because a society where every person can participate with dignity is a society in which all of us are safer, stronger, and more prosperous.',
      case_not_0:'Not charity.', case_not_1:'Not rescue.', case_not_2:'Not dependency.',
      case_in_0:'An investment in people.', case_in_1:'An investment in institutions.',
      case_in_2:'An investment in a healthier circular economy.', case_in_3:'An investment in the future we all share.',
      mail_greeting:'Hello DEHAT team,', mail_intro:'I am writing through the Partnerships page on your website.',
      mail_who_am_i:'WHO I AM', mail_based_in:'Based in', mail_what_to_do:'WHAT I WOULD LIKE TO DO',
      mail_what_change:'WHAT I HOPE WILL CHANGE', mail_scale:'INDICATIVE SCALE', mail_how_reach:'HOW TO REACH ME',
      mail_thanks:'Thank you,', mail_subject_prefix:'Working with DEHAT', mail_subject_fallback:'enquiry',
      rt_cause_label:'Cause', rt_mail_greeting:'Hello DEHAT team,', rt_mail_intro:'I have already transferred a contribution. The details are below.',
      rt_mail_outro:'Please match this to your bank statement and send the receipt.',
      rt_mail_subject:'Transfer already made', rt_mail_investor_fallback:'investor',
      empanel_ref_body_tpl:'{n} examinations and validations, and {m} statutory registrations, are published in full with the documents behind them on the Transparency page. They are not restated here.',
      press_ref_body_tpl:'{n} pieces of independent coverage, with every link going to the publisher, live in the Media Archive alongside the films and photographs.',
      open_transparency_record:'Open the Transparency Record', open_media_archive:'Open the Media Archive',
      fin_explore_eyebrow:'Explore the accounts', fin_explore_title:'Slice twenty years of money any way you like.',
      fin_explore_sub:'Every line below is drawn from a signed, audited statement. Choose a basis, a span of years and a lens, then click a bar or a segment to see exactly what sits underneath it.',
      fin_received_in_years:'Received in the Selected Years', fin_utilised_in_years:'Utilised in the Selected Years',
      fin_years_in_view:'Financial Years in View', word_years:'years', fin_lines_classified:'Audited Lines Classified', fin_partners_in_view:'Investment Partners in View',
      fin_lens_programme:'Programme', fin_lens_admin:'Administration vs Programme', fin_lens_regime:'Foreign vs Domestic', fin_lens_source:'Investment Source',
      fin_lens_uncrc:'Child Rights · United Nations Convention on the Rights of the Child', fin_lens_era:'Development Era',
      fin_lens_csr:'Corporate Social Responsibility · Schedule VII', fin_lens_received:'Money Received', fin_lens_utilised:'Money Utilised',
      fin_all_twenty_years:'All Twenty Years', fin_last_five_years:'Last Five Years', fin_mdg_era:'Millennium Development Goals Era',
      fin_annual_turnover:'Annual turnover, year by year', fin_breakdown:'Breakdown',
      fin_lines_behind_it:'the audited lines behind it', fin_lines_in_view:'The audited lines in view',
      fin_foreign_contribution:'Foreign Contribution', fin_domestic:'Domestic', fin_apportioned:'Apportioned', fin_in_kind:'In Kind', fin_mapping_unconfirmed:'Mapping Under Confirmation',
      fin_desc_cross:'Institutional and cross-programme costs that support the organisation as a whole rather than one single programme.',
      fin_desc_prog_opened:'Programme opened in',
      fin_admin_label:'Administration & Governance', fin_admin_desc:'Core staff salaries, audit, rent, statutory filing and other running costs, exactly as itemised in the audited income and expenditure statement.',
      fin_prog_delivery_label:'Programme Delivery', fin_prog_delivery_desc:'Direct cost of work with children, families and public systems — the grant less its itemised administration line.',
      fin_not_itemised_label:'Not Separately Itemised', fin_not_itemised_desc:'Grants and years where the audited statement reports one combined figure without splitting administration from delivery.',
      fin_fcra_label:'Foreign Contribution · Foreign Contribution (Regulation) Act', fin_fcra_desc:'Held in the designated foreign contribution bank account and audited separately, as the Foreign Contribution (Regulation) Act, 2010 requires.',
      fin_domestic_inr_label:'Domestic (Indian Rupee)', fin_domestic_desc:'Indian sources — corporate social responsibility, Indian foundations, government schemes and individual gifts.',
      fin_desc_fy_falling_in:'Financial years falling in',
      fin_from_word:'From', fin_to_word:'to', fin_line_word:'line', fin_lines_word:'lines',
      fin_csr7_pre_law:'Section 135 and Schedule VII of the Companies Act, 2013 only came into force on 1 April 2014 (Ministry of Corporate Affairs notification S.O. 582(E), 27 February 2014). For years before FY2014-15, any Schedule VII clause shown here is DEHAT’s own retrospective thematic alignment, not a statutory CSR claim — corporate gifts in those years were voluntary donations under the Companies Act, 1956.',
      fin_basis_note_admin:'The administration split can only be read from expenditure, so this lens always shows money utilised.',
      fin_basis_note_received:'Grants and interest received into the accounts during each financial year.',
      fin_basis_note_utilised:'Expenditure applied during each financial year. Where the audited statement does not itemise spend by project, the audited total is apportioned across that year’s funders in proportion to what they gave, and marked as apportioned.',
      policies_eyebrow:'Policies and Safeguards', policies_h1:'What Anyone Can Hold Us To',
      policies_p1:'A policy is only real if the person it protects can find it, invoke it and get an answer. Each one below says what it commits us to, who can use it and where the written document sits. Any of them can be requested in full, in Hindi or English.',
      policies_p2:'Approved by the Governing Board and reviewed on the cycle stated on each card. Write to', policies_p2b:'for a copy or to raise a concern.',
      policy_who_invoke:'Who Can Invoke It', policy_in_practice:'In Practice', policy_open_word:'Open',
      refund_h2:'Refund and Cancellation Policy',
      refund_p1:'This policy covers every transaction made on this website, whether an investment, a membership payment or a fee. An investment is a voluntary contribution and is not ordinarily refundable once the receipt has been issued and the amount has entered the audited account. We make exceptions where the payment should not have happened at all: a duplicate charge, an amount entered in error, a transaction the account holder did not authorise, or a technical failure in which money left your account and no receipt was raised.',
      refund_p2a:'Write to', refund_p2b:'within fourteen days of the transaction, with the date, the amount and the payment reference. We acknowledge within three working days and complete an approved refund within fourteen working days. Money is returned only to the account and instrument it came from, never to a third party. Bank and gateway charges already deducted cannot be recovered, and are shown to you before the refund is processed.',
      refund_p3:'A recurring investment can be cancelled at any time, with no reason required and no further amount taken from the next cycle onward. Amounts already collected in earlier cycles are treated under the paragraphs above. Where an 80G receipt has already been issued and the amount reported in Form 10BD, a refund requires the receipt to be surrendered and the statement to be revised, and we will tell you what that means for a deduction already claimed.',
      refund_p4:'Foreign contributions are treated differently, and we will not promise what the law does not allow. A contribution received into the designated Foreign Contribution (Regulation) Act account cannot simply be sent back on request. Returning it is an outbound foreign remittance from a restricted account, governed by that Act, by the Foreign Exchange Management Act and by the bank that holds the account, and it may require the bank’s clearance or the concurrence of the Ministry of Home Affairs before anything can move.',
      refund_p5:'If you believe a foreign contribution was sent in error, was unauthorised, or should not have been accepted, write to us and we will examine it with our auditor and our bank. Where a return is permissible, it goes only to the originating foreign account, never to an Indian account and never to a third party, and it is reported in that year’s Foreign Contribution (Regulation) Act return. Where a return is not permissible, we will tell you so plainly, in writing, with the reason. Until the position is settled the amount is held unspent.',
      refund_p6:'Every refund is entered in the same audited ledger as the receipt it reverses, carries the same reference, and appears in the year’s statutory accounts. A refund is never quietly netted off against income.',
      refund_cta:'Request a Refund',
      cookie_h2:'Cookie Policy, in Our Context',
      cookie_p1:'This site is a record of public work, not a marketing funnel. We set no advertising cookies and we do not sell or share what the site records. Essential cookies remember your language, your light or dark setting, and the cookie choice you made, so we do not ask again on every visit. Performance cookies, if you allow them, count visits and pages so we can tell whether a story or a register entry is being read. Functional cookies let embedded maps, documents and video load from the services that host them. Nothing on this site profiles a reader.',
      cookie_p2:'Your choice is stored on your own device and can be changed or withdrawn at any time from Cookie Settings in the footer. Clearing your browser storage removes it entirely. Where a child or an adolescent may be the reader, we treat the same default as for everyone: nothing beyond the essential is set unless it has been chosen.',
      cookie_ask_cta:'Ask What We Hold About You',
      work_sub:'Four programmes, in the order they began. Each one opens into its own page — why the work exists, how it is built, and every project it has carried, in chronological order with the What, Where, How, When, Why and Investment behind each.',
      narrow_tpl:'Narrow these {n} projects', most_stop_here:'— most programmes stop here. DEHAT keeps going.',
      word_of_count:'of',
      wk_dim_become:'Who communities become', wk_dim_claim:'What they understand, claim and enable', wk_dim_visible:'How change becomes visible',
      idx_b1_head:'What goes into it', idx_b1_body:'Published district figures only — the National Family Health Survey, the Unified District Information System for Education Plus, and the factsheets behind them. Each value carries the sheet it came from.',
      idx_b2_head:'How it is built', idx_b2_body:'Every indicator is scored as a distance from the best-performing district in the set, then averaged into one figure from 0 to 100. The benchmark is a real district, so every point is a distance already closed somewhere.',
      idx_b3_head:'What it is for', idx_b3_body:'It decides where we go next, and it is the same number the work is reported back against. A district that improves should move down it.',
      why_h1:'of children under five are stunted — half a generation carrying a growth deficit that never fully closes.',
      why_h2:'of girls are married before eighteen, the highest child-marriage rate in the districts we track.',
      why_h3:'of women begin pregnancy anaemic — the deficit passed to the next child before it is born.',
      wk_q_eyebrow:'One community, four questions', wk_q_head:'Every journey begins with the same community and asks a different question of it.',
      wk_q_sub:'The four programme journeys are not four organisations. They are four ways of reading the same people, the same institutions and the same long process of change. Select one to see the question it carries.',
      wk_x_eyebrow:'Intersectionality', wk_x_head:'No programme survives on its own.',
      wk_x_sub:'Each programme hands something to the other three and depends on something from them. Pick one to see both sides of that exchange — what it gives, and what it cannot do without.',
      wk_pp_eyebrow:'Project and programme', wk_pp_head:'The money arrives as projects. The work accumulates as a programme.',
      wk_pp_proj_label:'The project', wk_pp_prog_label:'The programme',
      wk_pp_proj_body:'A grant arrives with a theme attached. Bridge classes, this time. For three years there is a centre in the village, a teacher on the register, children who had left school sitting in rows again. Then the funding period closes, the report is filed, the centre is dismantled. The report is accurate. It counts enrolments, attendance, transitions back into government schools. It has no line for the fourteen-year-old who worked out, in that room, that she was allowed to say no.',
      wk_pp_prog_body:'She stays. So does the village. Four years on, a different grant arrives with a different theme, and she is the one who convenes the meeting. The Child Parliament she chairs was nobody\u2019s deliverable. Nor was her mother, who can now name the entitlement she is owed and the office that owes it. Thirty-eight of our forty-nine projects have landed in the same district, one after another, for twenty-five years. What has accumulated there appears in none of their reports.',
      wk_pp_note:'Every closure report we have filed is true. None of them holds the part that lasted. So we record each intervention on three dimensions instead of one — who the community becomes, what it can now claim, and what visibly changed. Select an intervention to read all three.',
      wk_method_eyebrow:'The method', wk_method_sub:'Community-based · rights-based · convergent with public systems. The same four movements run underneath all four programmes, and they run as a loop — a system that responds changes what a community expects next.',
      wk_anchor_eyebrow:'Where this work is anchored', wk_anchor_head:'Three frameworks, one set of villages.',
      wk_anchor_sub:'The same work answers to three different registers — a rights convention, a set of global goals, and Indian company law. Each matters to a different reader. All three describe the same four programmes.',
      wk_carried_by:'Carried mainly by',
      wk_csr_note:'Schedule VII of the Companies Act, 2013 sets out the activities a company may count as CSR. DEHAT\u2019s four programmes sit across five of its clauses, which means a corporate partner can fund any of them without a bespoke structure.',
      wk_why_eyebrow:'Why here', wk_why_head:'Four programmes. One reason they all had to begin in the same place.',
      wk_why_sub:'The programmes describe what we do. They do not explain the geography. These three districts do.',
      wk_idx_head:'How those districts were chosen',
      wk_idx_body:'An index is not a verdict on a place or its people. It is a measure of how far a public system sits from what it already promises, written as one number so that districts can be compared honestly and priorities argued with rather than asserted.',
      wk_idx_note:'Twenty-three districts carry a version of this number. Every one of them is on the map, with every indicator and its named source behind it.', wk_atlas_cta:'Open the district atlas',
      wk_build_eyebrow:'What we are building', wk_build_head:'Not a portfolio of projects. A community that can carry on without us.',
      wk_build_sub:'Every intervention should leave behind stronger institutions than it found. Every generation should expand the capability of the next. Individual projects begin and end; the leadership, the rights literacy and the institutions they leave behind are what compound.',
      wk_build_cta1:'Invest in the architecture', wk_build_cta2:'Partner with us',
      portfolio_total:'Projects on public record', portfolio_investment:'Total social investment',
      portfolio_count:'projects across four programmes',
      filter_year:'Year', filter_state:'State', filter_district:'District', filter_sdg:'Development Goal', filter_csr:'Corporate Social Responsibility · Schedule VII', filter_uncrc:'Child Right', filter_investor:'Social Investor', filter_all:'All',
      open_details:'Open the full record', close_details:'Close the record', phases_label:'Phases',
      annual_label:'Year by Year',
      cross_from:'Also part of',
      shared_note:'Shared social investment envelope:',
      d_what:'The change we set out to make', d_why:'Why it mattered here', d_when:'When',
      d_how:'How communities and systems worked together', d_impact:'Impact numbers',
      d_investor:'Social investor', d_investors:'Social investors', d_investment:'Social investment',
      m_when:'When and status', m_location:'Where', m_sdg:'Development goals', m_csr:'Corporate social responsibility · Schedule VII', m_uncrc:'Rights of the child', m_law:'Indian law and policy anchor', m_law_none:'No single statutory anchor recorded for this project.',
      invest_note:'Published exactly as documented; not consolidated.',
      impact_eyebrow:'Impact', impact_title:'Since 2000, accompanying communities as they claim rights and work in partnership with public systems to deliver them.',
      impact_sub:'Started as a youth collective in 1989, registered in 2000. These figures show scale; what they stand for is communities, field workers and public institutions acting together.',
      reach_head:'Geographical Reach So Far', reach_states:'States', reach_districts:'Districts', reach_blocks:'Blocks', reach_villages:'Villages', reach_children:'Children & Adolescents', reach_farmers:'Women Farmers',
      stories_eyebrow:'Stories of change', stories_title:'Reality, then transformation.',
      stories_sub:'Every case story is organised around one of the four child rights — survival, development, protection, participation.',
      roster_h1:'Start with a person.', roster_sub:'Written from DEHAT’s own case records. Adults are named where the record names them; children carry changed names. Choose someone and read their life through.',
      roster_filter:'Filter', roster_filters_n:'Filters · {n}', roster_count_all:'{n} stories', roster_count_filtered:'{shown} of {all} stories',
      roster_show_more:'Show {n} more', roster_next_story:'Next story', roster_start_again:'Start again',
      roster_back:'← Faces', roster_invest:'Invest in this work', right_to_tpl:'Right to {x}',
      cyc_direct_count_tpl:'{n} of 16 stages addressed directly', cyc_addressed_directly:'Addressed directly', cyc_affected_indirectly:'Affected indirectly',
      cyc_indirect_note:'Not a direct entry point for this programme. This stage is reached through the stages marked as addressed directly.',
      sdg_goals_label:'Goals this programme reports against', prog_figs_label:'What this programme has done',
      cyc_meets_eyebrow:'Where this programme meets the cycle', cyc_meets_title:'The structural vulnerability cycle, read from this programme.',
      cyc_see_all_stages:'See all sixteen stages →',
      pcta_invest_title:'Invest', pcta_invest_body:'Fund a year of this programme, or a single line of it. Every rupee is reported against the project it paid for.', pcta_invest_action:'See where money goes',
      pcta_eyebrow:'Where you come in', pcta_head:'Everything above is on the record. Choose how you want to be part of what comes next.',
      pcta_time_title:'Give time', pcta_time_body:'Field visits, translation, data, legal aid, teaching. Tell us what you can do and where you are.', pcta_time_action:'Find your route',
      pcta_partner_title:'Partner', pcta_partner_body:'Government departments, funders and organisations already work alongside this programme. There is room for more.', pcta_partner_action:'See who we work with',
      support_note_tpl:'The register above lists {n} projects in this programme, each with the partner who funded it and what it did. Support of any kind is welcome on the same terms.',
      who_teaser_eyebrow:'Who is behind this',
      who_teaser_head:'Thirty-four people, a founder, two boards, and a story that starts in 1968',
      who_teaser_body:'This organisation is not a head office with field staff. Most colleagues were recruited in the districts they work in, and the ones who came from outside stayed. Choose a face to see whose account you are reading, or follow the register from a cowshed in Champaran to four districts of work.',
      who_teaser_cta:'Meet Everyone', who_teaser_cta2:'Read the Story Since 1968',
      who_teaser_foot:'The Who We Are page holds all thirty-four colleagues, the founder, the Governing Board, the advisers, the value system and the full register of turning points.',
      since_tpl:'Since {y}', joined_tpl:'Joined {y}', and_word:'and', across_districts:'Across districts',
      roster_head_who:'The People Who Carry This Work',
      roster_note_who:'Thirty-three colleagues, alongside community leaders, Krishi Mitras, Community Resource Persons and the collectives who lead the work. Everyone here agreed to appear.',
      who_kicker:'Bahraich district, Uttar Pradesh · the Indo–Nepal border',
      who_h1:'In 1973 a family dispute in Champaran put a boy in a cowshed.',
      who_p1:'He was not the only one, and that was the part he could not leave alone. The boy was Jitendra Chaturvedi. Sixteen years later, in Bahraich, a group of young people opened a school for Tharu tribal and forest-dwelling children. The two threads did not meet for another eleven years.',
      who_p2:'Bahraich sits on the Nepal border. The Planning Commission once counted it among the hundred most backward districts in India; NITI Aayog now calls it an Aspirational District. DEHAT works in four such districts, and everything below happened here.',
      register_kicker:'The register · 1968–2026', register_h2:'How did it get from there to here?',
      register_sub:'Fifty-eight years, told through the moments that changed what came next. Scroll, or move along the ribbon.',
      lane_people:'People', lane_community:'Community & Partners', lane_everything:'Everything', lane_honours:'Honours Received',
      entries_count_all:'{n} entries', entries_count_filtered:'{n} of {total} entries',
      news_eyebrow:'In the news', news_title:'DEHAT across the globe',
      press_all_items:'All {n} items →', press_media_archive:'Media archive →',
      press_all_sub:'Filter by publisher, year, language, goal, Corporate Social Responsibility head and child rights.',
      where_note:'These are not sites of need alone but of leadership. Three districts — Bahraich, Shravasti and Balrampur — hold our deepest, most intersectional investment; Lakhimpur Kheri joins them from 2026, beginning with child protection. The rest mark two decades of programme presence alongside their communities. Open the atlas for the numbers behind each, and their sources.',
      involved_eyebrow:'Get involved', involved_title:'Realise existing power — with us.',
      involved_sub:'Whether you give an hour, a skill, or a rupee, you become part of a system that responds.',
      involved_cta_title:'Invest alongside communities.',
      involved_cta_sub:'Capital or material, online or offline — every rupee goes into capability communities keep after we leave.',
      donate_now:'Start a partnership', email_us:'Email us', f_email:'Email', f_phone:'Phone', f_web:'Web', f_address:'Address',
      nav_finance:'Transparency', nav_answers:'Answers',
      fin_eyebrow:'Financial transparency', fin_title:'Every rupee, on the record.',
      fin_sub:'Independently audited accounts \u2014 what investment partners committed, what reached the work, and the statutory checks behind both. Every figure is drawn from a signed balance sheet.',
      fin_stat_received:'Committed Over 20 Years', fin_stat_fcra:'Foreign Contribution \u00b7 Foreign Contribution (Regulation) Act', fin_stat_inr:'Domestic Contribution \u00b7 Indian Rupees', fin_stat_funders:'Investment Partners on Record',
      fin_years_head:'Year by Year', fin_years_sub:'What came in, what was spent, and who signed the accounts. Select a year to see its social investors.',
      fin_received:'Committed', fin_utilised:'Deployed', fin_auditor:'Auditor', fin_bs:'Balance Sheet', fin_surplus:'Surplus', fin_deficit:'Deficit', fin_partial:'Partial Data', fin_compiled:'Compiled',
      fin_funders_head:'Who Invests in This Work', fin_funders_sub:'The institutions and individuals whose capital powers this work — partners in a shared outcome, not one-way donors. Foreign contributions are held and audited in a separate Foreign Contribution (Regulation) Act account, as the law requires; domestic funds run through the rupee books.',
      fin_regime_fcra:'Foreign Contribution (Regulation) Act \u00b7 Foreign', fin_regime_inr:'Indian Rupee \u00b7 Domestic',
      fin_funders_cta:'See Every Partner',
      fin_compliance_head:'Statutory Compliance', fin_compliance_sub:'DEHAT is a registered Society (Societies Registration Act, 1860). Below is the annual accountability cycle a reviewer expects to see \u2014 and that DEHAT files.',
      fin_reg_head:'Registrations', fin_cal_head:'Annual Filing Calendar', fin_rules_head:'What We Report Against',
      fin_auditor_trail:'Audited by a practising Chartered Accountant every year and signed with a Unique Document Identification Number. Five different firms have examined the books over the past decade \u2014 no single long-tenure relationship.',
      fin_due:'Due', fin_year_funders:'Investment Partners This Year',
      fin_docs_head:'Credentials & Documents', fin_docs_sub:'Every registration, approval and third-party validation \u2014 scanned from the original certificate. Open any to read the source document.',
      fin_docg_statutory:'Registration & Tax', fin_docg_fcra:'Foreign Contribution \u00b7 Foreign Contribution (Regulation) Act', fin_docg_validation:'Validations & Recognition',
      fin_doc_view:'View Document', fin_pending_label:'Audited scan on file — figures being digitised',
      ask_title:'Ask the Record', ask_lead:'This desk answers only from what DEHAT has already published. Ask a question in your own words. If the answer is not on this site, it will say so and give you a person to write to rather than guess.',
      ask_placeholder:'e.g. Can I donate from outside India?', ask_submit:'Ask', ask_clear:'Clear',
      ask_nohit_title:'This desk does not have that one.', ask_nohit_body:'Nothing published on this site answers that question closely enough to quote back to you, and this tool will not invent an answer. Write to us and a person will reply.', ask_nohit_cta:'Write to us',
      ask_suggest_label:'Or try one of these',
      ask_sg_0:'Is my donation tax deductible?', ask_sg_1:'Where are the balance sheets?', ask_sg_2:'Can I donate from outside India?', ask_sg_3:'Can I volunteer?', ask_sg_4:'How do I report a concern?',
      ask_cat_all:'All', faq_title:'Questions People Actually Ask', faq_sub:'Grouped by what they are about. Every answer points at the page that proves it.', faq_count_suffix:'published answers',
      ck_banner_title:'Our Privacy Statement and Cookie Policy', ck_banner_body:'This site uses cookies and similar technologies to keep pages working, to understand which pages are read, and to improve what we publish. Some are essential. You can accept all, keep only the essential ones, or choose category by category, and change your mind at any time from Cookie Settings in the footer.',
      ck_accept_all:'Accept All', ck_reject_all:'Reject All', ck_manage:'Manage Cookies',
      ck_prefs_title:'Privacy Preference Centre', ck_prefs_lead:'You can block or disable cookies in your browser at any time. Here you can choose which categories we may set. Essential cookies cannot be switched off, because the site does not work without them.',
      ck_allow_all:'Allow All', ck_essential_only:'Essential Only', ck_manage_heading:'Manage Consent Preferences', ck_always_active:'Always Active',
      ck_stored_note:'Your choice is stored on this device only, and is not linked to any personal record.', ck_confirm:'Confirm My Choices',
      ck_nec_label:'Strictly Necessary Cookies', ck_nec_body:'Needed for the site to work: remembering your language and theme, keeping a form you have started, and recording this cookie choice. They are set in response to what you do here and store no personal record. Blocking them in your browser will break parts of the site.',
      ck_perf_label:'Performance Cookies', ck_perf_body:'Let us count visits and see which pages are read and how people move through the site, so we can tell what is useful and what is not. Everything collected is aggregated and anonymous. Without them we cannot tell whether a page is reaching anyone.',
      ck_func_label:'Functional Cookies', ck_func_body:'Enable extra features such as embedded maps, documents and video from the register. They may be set by the services we embed. Without them, some of those pieces will not load.',
      ck_target_label:'Targeting Cookies', ck_target_body:'We do not sell advertising and we do not profile readers. This category stays here so the choice is visible: we set nothing under it, and if that ever changes it will be off until you turn it on.',
      foot_explore:'Explore', foot_reach:'Reach us', foot_follow:'Follow the work',
      foot_desc:'Developmental Association for Human Advancement — working with communities and systems so children\u2019s rights are recognised, accessed, and upheld.',
      foot_rights:'© 2026 DEHAT · Started as a youth collective 1989 · Registered 2000',
    };
    const HI = {
      foot_policies:'नीतियाँ और सुरक्षा उपाय', foot_cookies:'कुकी सेटिंग्स', foot_concern:'कोई चिंता दर्ज करें',
      raise_step1:'1 · यह किस बारे में है', raise_step2:'2 · जवाब के साथ चाहिए दस्तावेज़', raise_step2_note:'वैकल्पिक। आप जो भी चुनेंगे, वह ड्राफ़्ट में नाम के साथ सूचीबद्ध होगा।', raise_step3:'3 · अपने शब्दों में',
      raise_who_placeholder:'आपका नाम और आपसे संपर्क करने का तरीक़ा (वैकल्पिक)', raise_subject_label:'ड्राफ़्ट विषय:', raise_open_email:'तैयार ईमेल खोलें',
      raise_copy:'ड्राफ़्ट कॉपी करें', raise_copied:'ड्राफ़्ट कॉपी हो गया', raise_docs_requested_label:'अनुरोधित दस्तावेज़:', raise_grateful_line:'मैं इसकी पावती (एकनॉलेजमेंट) पाकर और यह जानकर आभारी रहूँगा/रहूँगी कि इसे कौन व्यक्ति संभाल रहा है।', raise_doc_request_prefix:'दस्तावेज़ अनुरोध — ', raise_eyebrow:'जवाब देने का अधिकार',
      nav_who:'हम कौन हैं', stat_hint:'आँकड़ा खोलिए', stat_reveal:'दिखाइए', stat_hide:'छिपाइए',
      stat_reveal_all:'सब दिखाइए', stat_hide_all:'सब छिपाइए', grid_reveal_all:'सब दिखाइए',
      grid_hint:'किसी भी खाने पर क्लिक कीजिए', bl_drag:'तुलना के लिए खींचिए', lens_year_eyebrow:'वर्ष दर वर्ष', lens_year_title:'हर लेखा-परीक्षित वर्ष, और उसने क्या जोड़ा।', lens_year_sub:'लेखा-परीक्षित वित्तीय वर्षों की पूरी शृंखला, और हर वर्ष के अंत तक प्राप्त संचयी सामाजिक निवेश।', lens_year_note:'स्रोत: पारदर्शिता पृष्ठ पर पूर्ण रूप से प्रकाशित वही लेखा-परीक्षित वित्तीय-वर्ष लेजर। आंकड़े प्राप्तियां हैं, प्रोजेक्ट-कार्ड की प्रतिबद्धताएं नहीं, इसलिए किसी चालू परियोजना का पूरा अनुदान तभी दिखता है जब वह वास्तव में प्राप्त हो चुका हो।', lens_uncrc_eyebrow:'UNCRC स्तंभ के अनुसार', lens_uncrc_title:'हर परियोजना, जिस बाल अधिकार की सेवा करती है उसके अनुसार समूहीकृत।', lens_uncrc_sub:'एक परियोजना एक साथ एक से अधिक अधिकारों की सेवा कर सकती है, इसलिए वह नीचे एक से अधिक कार्ड में दिख सकती है — यह टैगिंग है, धनराशि की दोहरी गिनती नहीं।', lens_csr_eyebrow:'अनुसूची VII के अनुसार', lens_csr_title:'हर परियोजना, उसकी कंपनी अधिनियम अनुसूची VII श्रेणी के अनुसार समूहीकृत।', lens_csr_sub:'वे श्रेणियां जिनके अंतर्गत भारत में कॉर्पोरेट सामाजिक उत्तरदायित्व व्यय की अनुमति है, और यहां हर श्रेणी के अंतर्गत क्या आता है।', lens_sdg_eyebrow:'SDG और MDG के अनुसार', lens_sdg_title:'हर परियोजना, जिस वैश्विक लक्ष्य को आगे बढ़ाती है उसके अनुसार समूहीकृत।', lens_sdg_sub:'2015 से आगे सतत विकास लक्ष्य, और उससे पहले के वर्षों के लिए सहस्राब्दी विकास लक्ष्य।', lens_sdg_tab_sdg:'SDG', lens_sdg_tab_mdg:'MDG', lens_projects_suffix:'परियोजनाएं', lens_awards_eyebrow:'मान्यता', lens_awards_title:'पुरस्कार, और उन्हें किसे मिला।', lens_award_all:'सभी', lens_award_community:'हमारे साथ काम करने वाले समुदाय को', lens_award_founder:'संस्थापक को', lens_award_org:'संगठन को', order:'क्रम', Sources:'स्रोत',
      pillar_link_work:'यह कार्य देखिए', pillar_link_how:'यह कैसे काम करता है', stories_all:'सभी कहानियाँ',
      chrono_title:'समयक्रम', count_label:'संख्या', open_programme:'कार्यक्रम खोलिए', open_programme_home:'कार्यक्रम खोलें →', method_sub:'चार गतिविधियाँ जो एक-दूसरे को पोषित करती हैं। जब तंत्र प्रतिक्रिया देता है तो समुदाय की अगली अपेक्षा बदल जाती है, और चक्र फिर से शुरू होता है — पहले से ऊँचे स्तर पर। किसी गतिविधि पर टैप करें उसे आगे देखने के लिए।', method_footnote:'चक्र का हर चक्कर पिछले से ज़्यादा क्षमता पीछे छोड़ जाता है।', method_cta:'इसे कार्यक्रमों के भीतर देखें →', in_memory:'स्मृति में', sdg_prefix:'सतत विकास लक्ष्य',
      frame_uncrc_label:'संयुक्त राष्ट्र बाल अधिकार अभिसमय', frame_uncrc_sub:'चार अधिकार समूह',
      frame_sdg_label:'सतत विकास लक्ष्य', frame_sdg_sub:'वैश्विक लक्ष्य जिनके विरुद्ध हम रिपोर्ट करते हैं',
      frame_csr_label:'अनुसूची VII', frame_csr_sub:'कॉर्पोरेट सामाजिक उत्तरदायित्व वित्तपोषण यहाँ किस तरह फिट होता है',
      sdg_era_label:'सतत विकास लक्ष्य युग',
      mdg_para:'DEHAT के शुरुआती दो दशक सहस्राब्दि विकास लक्ष्यों के साथ-साथ चले — ग़रीबी और भुखमरी, सार्वभौमिक प्राथमिक शिक्षा, लैंगिक समानता, बाल मृत्यु दर और मातृ स्वास्थ्य। इन्हीं पाँच ने शुरुआती कार्यक्रम को आकार दिया: नामांकन अभियान, टीकाकरण ट्रैकिंग, प्रसवपूर्व पंजीकरण। 2015 में सतत विकास लक्ष्यों ने इस दायरे को व्यापक बनाकर इसमें जलवायु, संस्थाएँ और असमानता को शामिल किया, जहाँ नया काम स्थित है। मूल दिशा नहीं बदली। मापने की इकाई बदल गई।',
      word_project:'परियोजना', word_projects:'परियोजनाएँ',
      iv_current:'वर्तमान में सहयोगी', iv_past:'पूर्व में सहयोगी', iv_all:'सभी', iv_all_programmes:'सभी कार्यक्रम',
      narrow_register:'पंजी को सीमित करें', partners_scroll_hint:'साझेदार · स्क्रॉल करें या खींचें',
      f_full_name:'पूरा नाम', f_phone:'फ़ोन', f_email:'ईमेल', f_email_hint:'रसीद यहीं भेजी जाएगी',
      f_city:'शहर', f_state:'राज्य', f_postal_code:'पिन कोड', f_country:'देश', f_india:'भारत',
      f_additional_note:'अतिरिक्त टिप्पणी', f_additional_note_hint:'इस निवेश के बारे में कुछ भी जो हमें पता होना चाहिए',
      not_itemised:'मद-वार दर्ज नहीं', in_register:'पंजी में दर्ज', add_another_attachment:'एक और अनुलग्नक जोड़ें',
      programme_word:'कार्यक्रम', prog_extra_inst:'संस्थागत सुदृढ़ीकरण',
      fork_eyebrow:'आगे पढ़ने से पहले', fork_question:'इनमें से DEHAT का तरीक़ा कौन सा है?',
      fork_reply_own:'यही वह तरीक़ा है जो हम अपनाते हैं। आगे बताया गया है कि व्यवहार में इसका क्या मतलब है।',
      fork_reply_aid:'यह वह तरीक़ा नहीं है जो हम अपनाते हैं। आगे बताया गया है क्यों।',
      fork_aid_title:'एक टोकरी दी गई, और अगले महीने फिर दी गई।', fork_aid_caption:'दान नहीं। बचाव नहीं। निर्भरता नहीं।',
      fork_own_title:'साथ मिलकर लगाया गया एक पेड़, जो हमारे जाने के बाद भी खड़ा है।', fork_own_caption:'एक ऐसे समाज में निवेश जिसे हम सब साझा करते हैं।',
      fork_choose:'चुनें, फिर आगे पढ़ें।', fork_you_chose:'आपने यह चुना', fork_choose_this:'इसे चुनें',
      case_eyebrow:'निवेश का तर्क', case_h1:'यह दान नहीं है। यह उस समाज में निवेश है जिसे हम सब साझा करते हैं।',
      case_p1:'हर समाज को अंततः बहिष्करण की क़ीमत चुकानी पड़ती है।',
      case_p2:'चाहे बेरोज़गारी हो, ख़राब स्वास्थ्य, खाद्य असुरक्षा, पर्यावरणीय क्षरण, हिंसा, पलायन, या खोई हुई आर्थिक क्षमता — लोगों को पीछे छोड़ने की क़ीमत कभी भी सिर्फ़ उन्हीं तक सीमित नहीं रहती जो इसे पहले झेलते हैं। यह आगे तक फैलती है — बाज़ारों, संस्थाओं, व्यवसायों, सरकारों और समुदायों को समान रूप से प्रभावित करते हुए।',
      case_p3:'इसलिए DEHAT में हम सामाजिक निवेश को अलग नज़रिए से देखते हैं।',
      case_p4:'हम यह नहीं मानते कि सार्थक सामाजिक बदलाव दया, दान, या किसी को "बचाने" की इच्छा से आता है। न ही हम यह मानते हैं कि समुदाय ख़ाली पात्र हैं जिन्हें बाहरी समाधानों से भरा जाना है।',
      case_p5:'लोग सुलझाई जाने वाली समस्याएँ नहीं हैं।',
      case_p6:'वे नागरिक हैं, कामगार हैं, किसान हैं, उद्यमी हैं, माता-पिता हैं, उपभोक्ता हैं, रचनाकार हैं, और नेता हैं — जिनकी क्षमता अक्सर योग्यता की कमी से नहीं, बल्कि अवसरों, सार्वजनिक तंत्रों और न्याय तक असमान पहुँच से सीमित होती है।',
      case_p7:'हमारा काम इन्हीं बाधाओं को हटाने के बारे में है।',
      case_p8:'हर बहाल किया गया अवसर उस सामाजिक और आर्थिक ताने-बाने को मज़बूत करता है जिस पर हम सब निर्भर हैं।',
      case_p9:'यह उदारता का एकतरफ़ा हस्तांतरण नहीं है।', case_p10:'यह एक साझा पारिस्थितिकी तंत्र को मज़बूत करना है।',
      case_p11:'एक अर्थव्यवस्था तब सबसे स्वस्थ होती है जब अधिक से अधिक लोग गरिमा के साथ इसमें भाग ले सकें।',
      case_p12:'जिस गाँव में परिवारों की आय स्थिर होती है, वह अधिक सामान ख़रीदता है, बेहतर सेवाओं की माँग करता है, शिक्षा में निवेश करता है, आवास सुधारता है, स्थानीय उद्यमों को सहारा देता है, और दूसरों के लिए अवसर बनाता है। व्यवसाय बढ़ते हैं। बाज़ार गहरे होते हैं। सार्वजनिक संस्थाएँ और समुदाय आपस में और क़रीब से काम करते हैं। समुदाय अधिक सक्षम बनते हैं।',
      case_p13:'समृद्धि का प्रवाह चलता रहता है।', case_p14:'यही वह अर्थव्यवस्था है जिसे बनाने में हम मदद कर रहे हैं।',
      case_p15:'यही कारण है कि हम अपने सहयोगियों को शायद ही कभी "दानदाता" कहते हैं।',
      case_p16:'वे मज़बूत समुदाय, मज़बूत संस्थाएँ, और सबके लिए एक मज़बूत भविष्य बनाने में साझेदार हैं।',
      case_p17:'दो दशकों से अधिक समय से, DEHAT समुदायों के साथ काम करता आया है — उनके ऊपर नहीं — यह सुनिश्चित करने के लिए कि बच्चे सुरक्षित रहें, महिलाएँ अधिक स्वायत्तता का प्रयोग करें, किसान सक्षम आजीविका बनाएँ, सार्वजनिक तंत्र और समुदाय और क़रीबी साझेदारी में काम करें, और समुदाय स्वयं स्थायी बदलाव के वाहक बनें।',
      case_p18:'हमारी भूमिका समुदायों के आगे खड़े होने की नहीं है।', case_p19:'हमारी भूमिका उनके साथ खड़े रहने की है, जब तक उन्हें हमारी ज़रूरत न रह जाए।',
      case_p20:'क्योंकि सच्चा विकास इस बात से नहीं मापा जाता कि हमने कितनी सहायता दी, बल्कि इस बात से मापा जाता है कि समुदायों को कितनी स्वतंत्रता मिली।',
      case_h3:'DEHAT के ज़रिए निवेश क्यों करें?', case_p21:'यह कुछ देकर चले जाने के बारे में नहीं है।', case_p22:'यह साथ मिलकर कुछ बनाने के बारे में है।',
      case_return_0:'जब एक महिला अपने भूमि अधिकार सुरक्षित करती है, तो वह अपने परिवार के भविष्य में निवेश करती है।',
      case_return_1:'जब एक बच्चा मज़दूरी में जाने की बजाय स्कूल में बना रहता है, तो पूरी अर्थव्यवस्था को भविष्य की उत्पादकता का लाभ मिलता है।',
      case_return_2:'जब एक किसान लचीली कृषि पद्धतियाँ अपनाता है, तो स्थानीय खाद्य तंत्र मज़बूत होते हैं।',
      case_return_3:'जब एक परिवार संकट आने से पहले स्वास्थ्य सेवा तक पहुँच पाता है, तो समुदाय स्वस्थ होते हैं और सार्वजनिक ख़र्च घटता है।',
      case_return_4:'जब कामगारों को उनकी गारंटीशुदा मज़दूरी और हक़दारियाँ मिलती हैं, तो वे स्थानीय बाज़ारों में अधिक पूरी तरह भाग लेते हैं।',
      case_swap_0_not:'आपका योगदान निर्भरता नहीं ख़रीदता।', case_swap_0_but:'यह क्षमता का विस्तार करता है।',
      case_swap_1_not:'यह लोगों की एजेंसी की जगह नहीं लेता।', case_swap_1_but:'यह उसे मज़बूत करता है।',
      case_swap_2_not:'यह लाभार्थी नहीं बनाता।', case_swap_2_but:'यह नागरिकों को अवसर पाने, अधिकारों का प्रयोग करने, आजीविका बनाने, और समाज में सार्थक योगदान देने में सक्षम बनाता है।',
      case_why_0:'क्योंकि आपका योगदान केवल लक्षणों पर प्रतिक्रिया देने की बजाय तंत्रों को मज़बूत करने में मदद करता है।',
      case_why_1:'क्योंकि सक्षम समुदाय भविष्य की सामाजिक और आर्थिक लागत को घटाते हैं।',
      case_why_2:'क्योंकि स्वस्थ स्थानीय अर्थव्यवस्थाओं से सभी को लाभ होता है।',
      case_why_3:'क्योंकि न्याय और अवसर दान के कार्य नहीं हैं — वे स्थायी समृद्धि की नींव हैं।',
      case_why_4:'और क्योंकि जिस समाज में हर व्यक्ति गरिमा के साथ भाग ले सकता है, वह समाज है जिसमें हम सब अधिक सुरक्षित, मज़बूत और समृद्ध हैं।',
      case_not_0:'दान नहीं।', case_not_1:'बचाव नहीं।', case_not_2:'निर्भरता नहीं।',
      case_in_0:'लोगों में निवेश।', case_in_1:'संस्थाओं में निवेश।',
      case_in_2:'एक स्वस्थ चक्रीय अर्थव्यवस्था में निवेश।', case_in_3:'उस भविष्य में निवेश जिसे हम सब साझा करते हैं।',
      mail_greeting:'नमस्ते DEHAT टीम,', mail_intro:'मैं आपकी वेबसाइट के साझेदारी पृष्ठ के ज़रिए लिख रहा/रही हूँ।',
      mail_who_am_i:'मैं कौन हूँ', mail_based_in:'स्थित हूँ', mail_what_to_do:'मैं क्या करना चाहूँगा/चाहूँगी',
      mail_what_change:'मैं क्या बदलाव देखना चाहूँगा/चाहूँगी', mail_scale:'अनुमानित परिमाण', mail_how_reach:'मुझसे संपर्क कैसे करें',
      mail_thanks:'धन्यवाद,', mail_subject_prefix:'DEHAT के साथ काम करना', mail_subject_fallback:'पूछताछ',
      rt_cause_label:'उद्देश्य', rt_mail_greeting:'नमस्ते DEHAT टीम,', rt_mail_intro:'मैं पहले ही एक अंशदान हस्तांतरित कर चुका/चुकी हूँ। विवरण नीचे है।',
      rt_mail_outro:'कृपया इसे अपने बैंक विवरण से मिलाएँ और रसीद भेजें।',
      rt_mail_subject:'हस्तांतरण पहले ही किया जा चुका है', rt_mail_investor_fallback:'निवेशक',
      empanel_ref_body_tpl:'{n} जाँच-पड़ताल और सत्यापन, तथा {m} वैधानिक पंजीकरण, पारदर्शिता पृष्ठ पर उनके दस्तावेज़ों सहित पूरी तरह प्रकाशित हैं। इन्हें यहाँ दोबारा नहीं दोहराया गया है।',
      press_ref_body_tpl:'{n} स्वतंत्र कवरेज, हर लिंक प्रकाशक तक जाता हुआ, फ़िल्मों और तस्वीरों के साथ मीडिया अभिलेखागार में मौजूद है।',
      open_transparency_record:'पारदर्शिता रिकॉर्ड खोलें', open_media_archive:'मीडिया अभिलेखागार खोलें',
      fin_explore_eyebrow:'खातों को देखें', fin_explore_title:'बीस वर्षों के धन को अपने अनुसार विभाजित करें।',
      fin_explore_sub:'नीचे दी गई हर पंक्ति एक हस्ताक्षरित, अंकेक्षित विवरण से ली गई है। एक आधार, वर्षों की एक अवधि और एक दृष्टिकोण चुनें, फिर किसी बार या खंड पर क्लिक करके देखें कि उसके पीछे वास्तव में क्या है।',
      fin_received_in_years:'चयनित वर्षों में प्राप्त', fin_utilised_in_years:'चयनित वर्षों में उपयोग किया गया',
      fin_years_in_view:'दृश्य में वित्तीय वर्ष', word_years:'वर्ष', fin_lines_classified:'वर्गीकृत अंकेक्षित पंक्तियाँ', fin_partners_in_view:'दृश्य में निवेश साझेदार',
      fin_lens_programme:'कार्यक्रम', fin_lens_admin:'प्रशासन बनाम कार्यक्रम', fin_lens_regime:'विदेशी बनाम घरेलू', fin_lens_source:'निवेश स्रोत',
      fin_lens_uncrc:'बाल अधिकार · संयुक्त राष्ट्र बाल अधिकार अभिसमय', fin_lens_era:'विकास युग',
      fin_lens_csr:'कॉर्पोरेट सामाजिक उत्तरदायित्व · अनुसूची VII', fin_lens_received:'धन प्राप्त', fin_lens_utilised:'धन उपयोग',
      fin_all_twenty_years:'सभी बीस वर्ष', fin_last_five_years:'पिछले पाँच वर्ष', fin_mdg_era:'सहस्राब्दि विकास लक्ष्य युग',
      fin_annual_turnover:'वार्षिक कारोबार, वर्ष दर वर्ष', fin_breakdown:'विभाजन',
      fin_lines_behind_it:'इसके पीछे की अंकेक्षित पंक्तियाँ', fin_lines_in_view:'दृश्य में अंकेक्षित पंक्तियाँ',
      fin_foreign_contribution:'विदेशी अंशदान', fin_domestic:'घरेलू', fin_apportioned:'आनुपातिक रूप से बाँटा गया', fin_in_kind:'वस्तु रूप में', fin_mapping_unconfirmed:'मैपिंग पुष्टि लंबित',
      fin_desc_cross:'संस्थागत और कार्यक्रम-पार लागतें जो किसी एक कार्यक्रम की बजाय पूरी संस्था को सहारा देती हैं।',
      fin_desc_prog_opened:'कार्यक्रम की शुरुआत',
      fin_admin_label:'प्रशासन एवं शासन', fin_admin_desc:'मुख्य स्टाफ़ वेतन, अंकेक्षण, किराया, वैधानिक दाख़िला और अन्य परिचालन लागतें, ठीक वैसे ही जैसे अंकेक्षित आय-व्यय विवरण में सूचीबद्ध हैं।',
      fin_prog_delivery_label:'कार्यक्रम क्रियान्वयन', fin_prog_delivery_desc:'बच्चों, परिवारों और सार्वजनिक तंत्रों के साथ काम की प्रत्यक्ष लागत — अनुदान में से उसकी सूचीबद्ध प्रशासन पंक्ति घटाकर।',
      fin_not_itemised_label:'अलग से सूचीबद्ध नहीं', fin_not_itemised_desc:'वे अनुदान और वर्ष जहाँ अंकेक्षित विवरण प्रशासन और क्रियान्वयन को अलग किए बिना एक संयुक्त आँकड़ा दर्शाता है।',
      fin_fcra_label:'विदेशी अंशदान · विदेशी अंशदान (विनियमन) अधिनियम', fin_fcra_desc:'निर्दिष्ट विदेशी अंशदान बैंक खाते में रखा और अलग से अंकेक्षित, जैसा विदेशी अंशदान (विनियमन) अधिनियम, 2010 अपेक्षा करता है।',
      fin_domestic_inr_label:'घरेलू (भारतीय रुपया)', fin_domestic_desc:'भारतीय स्रोत — कॉर्पोरेट सामाजिक उत्तरदायित्व, भारतीय फ़ाउंडेशन, सरकारी योजनाएँ और व्यक्तिगत उपहार।',
      fin_desc_fy_falling_in:'इस अवधि में आने वाले वित्तीय वर्ष:',
      fin_from_word:'से', fin_to_word:'तक', fin_line_word:'पंक्ति', fin_lines_word:'पंक्तियाँ',
      fin_csr7_pre_law:'कंपनी अधिनियम, 2013 की धारा 135 और अनुसूची VII 1 अप्रैल 2014 को ही लागू हुए (कॉर्पोरेट कार्य मंत्रालय अधिसूचना S.O. 582(E), 27 फ़रवरी 2014)। FY2014-15 से पहले के वर्षों के लिए, यहाँ दिखाई गई कोई भी अनुसूची VII मद DEHAT का अपना पूर्वव्यापी विषयगत संरेखण है, न कि कोई वैधानिक CSR दावा — उन वर्षों में कॉर्पोरेट उपहार कंपनी अधिनियम, 1956 के अंतर्गत स्वैच्छिक दान थे।',
      fin_basis_note_admin:'प्रशासन विभाजन केवल व्यय से ही पढ़ा जा सकता है, इसलिए यह दृष्टिकोण हमेशा उपयोग की गई राशि दिखाता है।',
      fin_basis_note_received:'प्रत्येक वित्तीय वर्ष के दौरान खातों में प्राप्त अनुदान और ब्याज।',
      fin_basis_note_utilised:'प्रत्येक वित्तीय वर्ष के दौरान लागू व्यय। जहाँ अंकेक्षित विवरण परियोजना-वार व्यय सूचीबद्ध नहीं करता, वहाँ अंकेक्षित कुल राशि को उस वर्ष के वित्तपोषकों के बीच उनके योगदान के अनुपात में बाँटा जाता है, और इसे आनुपातिक रूप से चिह्नित किया जाता है।',
      policies_eyebrow:'नीतियाँ और सुरक्षा उपाय', policies_h1:'जिनके लिए कोई भी हमें जवाबदेह ठहरा सकता है',
      policies_p1:'कोई नीति तभी वास्तविक है जब वह व्यक्ति जिसकी वह रक्षा करती है, उसे ढूँढ सके, उसका प्रयोग कर सके और जवाब पा सके। नीचे हर एक यह बताती है कि यह हमें किस बात के लिए प्रतिबद्ध करती है, इसका उपयोग कौन कर सकता है, और लिखित दस्तावेज़ कहाँ है। इनमें से किसी को भी पूरा, हिंदी या अंग्रेज़ी में माँगा जा सकता है।',
      policies_p2:'गवर्निंग बोर्ड द्वारा अनुमोदित और हर कार्ड पर बताए गए चक्र पर समीक्षित। किसी प्रति के लिए या कोई चिंता उठाने के लिए लिखें', policies_p2b:'पर।',
      policy_who_invoke:'कौन इसका उपयोग कर सकता है', policy_in_practice:'व्यवहार में', policy_open_word:'खोलें',
      refund_h2:'धन-वापसी एवं रद्दीकरण नीति',
      refund_p1:'यह नीति इस वेबसाइट पर किए गए हर लेन-देन को कवर करती है, चाहे वह निवेश हो, सदस्यता भुगतान हो या कोई शुल्क। निवेश एक स्वैच्छिक योगदान है और सामान्यतः रसीद जारी होने और राशि अंकेक्षित खाते में दर्ज होने के बाद वापस नहीं किया जाता। हम वहाँ अपवाद करते हैं जहाँ भुगतान होना ही नहीं चाहिए था: कोई डुप्लिकेट शुल्क, ग़लती से दर्ज की गई राशि, खाताधारक द्वारा अनधिकृत लेन-देन, या कोई तकनीकी विफलता जिसमें आपके खाते से राशि निकली पर कोई रसीद जारी नहीं हुई।',
      refund_p2a:'लेन-देन के चौदह दिनों के भीतर, तारीख़, राशि और भुगतान संदर्भ के साथ', refund_p2b:'पर लिखें। हम तीन कार्य-दिवसों के भीतर पावती देते हैं और स्वीकृत धन-वापसी को चौदह कार्य-दिवसों में पूरा करते हैं। धन केवल उसी खाते और माध्यम में वापस किया जाता है जहाँ से वह आया था, कभी किसी तीसरे पक्ष को नहीं। पहले से काटे गए बैंक व गेटवे शुल्क वापस नहीं किए जा सकते, और धन-वापसी संसाधित करने से पहले ये आपको दिखाए जाते हैं।',
      refund_p3:'नियमित निवेश किसी भी समय, बिना कारण बताए रद्द किया जा सकता है, और अगले चक्र से आगे कोई राशि नहीं ली जाती। पहले के चक्रों में एकत्रित राशियों पर ऊपर दी गई शर्तें लागू होती हैं। जहाँ 80G रसीद पहले ही जारी हो चुकी है और राशि फ़ॉर्म 10BD में दर्ज हो चुकी है, वहाँ धन-वापसी के लिए रसीद वापस करनी होगी और विवरणी संशोधित करनी होगी, और हम आपको बताएँगे कि पहले से दावा की गई छूट के लिए इसका क्या अर्थ है।',
      refund_p4:'विदेशी अंशदान को अलग तरह से माना जाता है, और हम वह वादा नहीं करेंगे जिसकी क़ानून अनुमति नहीं देता। निर्दिष्ट विदेशी अंशदान (विनियमन) अधिनियम खाते में प्राप्त अंशदान को माँगने पर सीधे वापस नहीं भेजा जा सकता। इसे लौटाना एक प्रतिबंधित खाते से बाहर जाने वाला विदेशी प्रेषण है, जो उस अधिनियम, विदेशी मुद्रा प्रबंधन अधिनियम, और खाता रखने वाले बैंक द्वारा शासित होता है, और इसके लिए बैंक की मंज़ूरी या गृह मंत्रालय की सहमति आवश्यक हो सकती है, इससे पहले कि कुछ भी आगे बढ़ सके।',
      refund_p5:'यदि आपको लगता है कि कोई विदेशी अंशदान ग़लती से भेजा गया था, अनधिकृत था, या स्वीकार नहीं किया जाना चाहिए था, तो हमें लिखें और हम इसकी जाँच अपने अंकेक्षक और बैंक के साथ करेंगे। जहाँ वापसी संभव हो, वह केवल मूल विदेशी खाते में जाती है, कभी किसी भारतीय खाते या तीसरे पक्ष को नहीं, और उस वर्ष की विदेशी अंशदान (विनियमन) अधिनियम विवरणी में दर्ज की जाती है। जहाँ वापसी संभव न हो, हम आपको स्पष्ट रूप से, लिखित में, कारण सहित बता देंगे। स्थिति तय होने तक राशि अव्ययित रखी जाती है।',
      refund_p6:'हर धन-वापसी उसी अंकेक्षित बहीखाते में दर्ज होती है जिसमें वह रसीद दर्ज थी जिसे वह उलटती है, वही संदर्भ रखती है, और उस वर्ष के वैधानिक खातों में दिखाई देती है। किसी धन-वापसी को कभी चुपचाप आय से घटाया नहीं जाता।',
      refund_cta:'धन-वापसी का अनुरोध करें',
      cookie_h2:'हमारे संदर्भ में कुकी नीति',
      cookie_p1:'यह साइट सार्वजनिक कार्य का एक अभिलेख है, कोई मार्केटिंग फ़नल नहीं। हम कोई विज्ञापन कुकी सेट नहीं करते और साइट जो दर्ज करती है उसे न बेचते हैं न साझा करते हैं। आवश्यक कुकीज़ आपकी भाषा, आपकी लाइट या डार्क सेटिंग, और आपके द्वारा की गई कुकी पसंद याद रखती हैं, ताकि हम हर बार पूछें नहीं। यदि आप अनुमति दें तो परफ़ॉर्मेंस कुकीज़ विज़िट और पेज गिनती हैं ताकि हम बता सकें कि कोई कहानी या पंजी प्रविष्टि पढ़ी जा रही है या नहीं। फ़ंक्शनल कुकीज़ एम्बेडेड मानचित्रों, दस्तावेज़ों और वीडियो को उनकी होस्ट सेवाओं से लोड होने देती हैं। इस साइट पर किसी पाठक की प्रोफ़ाइलिंग नहीं होती।',
      cookie_p2:'आपकी पसंद आपके अपने डिवाइस पर संग्रहीत होती है और इसे फ़ुटर में कुकी सेटिंग्स से किसी भी समय बदला या वापस लिया जा सकता है। अपने ब्राउज़र का संग्रहण साफ़ करने से यह पूरी तरह हट जाती है। जहाँ पाठक कोई बच्चा या किशोर हो सकता है, वहाँ हम सबके लिए वही डिफ़ॉल्ट अपनाते हैं: चुने जाने तक आवश्यक से आगे कुछ भी सेट नहीं होता।',
      cookie_ask_cta:'पूछें आपके बारे में हमारे पास क्या है',
      portfolio_count:'परियोजनाएँ',
      filter_state:'राज्य', filter_district:'ज़िला', filter_investor:'निवेशक',
      annual_label:'वार्षिक', cross_from:'से', shared_note:'साझा',
      envelope:'दायरा', d_impact:'प्रभाव संख्या', d_investor:'निवेशक', d_investors:'निवेशक',
      d_investment:'निवेश', m_when:'कब', m_law:'विधिक आधार', m_law_none:'कोई नहीं',
      nav_home:'मुख पृष्ठ', nav_work:'हमारा कार्य', nav_impact:'प्रभाव', nav_stories:'कहानियाँ', nav_media:'मीडिया', nav_involved:'साथ जुड़ें',
      donate:'निवेश करें', since:'1989 से', org_full:'बाल अधिकार · सरकार · समुदाय साझेदारी',
      language:'भाषा', lang_indian:'भारतीय भाषाएँ', lang_global:'वैश्विक (UN)',
      hero_title_a:'एक बाल-केंद्रित समाज जहाँ हर बच्चा अपने ', hero_title_b:'अधिकारों', hero_title_c:' को पाए — सुरक्षित, सम्मानित और सम्पूर्ण।',
      hero_sub:'हम भारत-नेपाल तराई क्षेत्र में समुदायों और सार्वजनिक तंत्रों के साथ कार्य करते हैं ताकि बच्चों के अधिकार केवल कागज़ पर न रहें, बल्कि रोज़मर्रा के जीवन में पहचाने, प्राप्त और सुनिश्चित किए जाएँ।',
      hero_cta1:'समुदायों के साथ खड़े हों', hero_cta2:'हमारा कार्य देखें', hero_photo:'फ़ोटो — बाल संसद नेता, लोहरा गाँव, बहराइच',
      hero_principle:'समुदायों और सरकारी तंत्रों के साथ मिलकर, हर बच्चे के लिए।',
      stat_children:'बच्चों व किशोरों तक पहुँच', stat_invested:'2000 से सामुदायिक तंत्रों में निवेश', stat_resources:'सार्वजनिक संसाधन प्राप्त', stat_districts:'2 राज्यों के ज़िले',
      vision:'दृष्टि', mission:'लक्ष्य', theory:'परिवर्तन का सिद्धांत',
      vision_body:'एक बाल-केंद्रित समाज जहाँ हर बच्चा अपने अधिकार पाए और सुरक्षित, सम्मानित तथा परिपूर्ण जीवन जिए।',
      mission_body:'समुदायों और तंत्रों के साथ मिलकर मौजूदा शक्ति को साकार करना, ताकि बच्चों के अधिकार रोज़मर्रा के जीवन में पहचाने, प्राप्त और सुनिश्चित हों।',
      theory_body:'जब समुदाय कार्य करते हैं और तंत्र मिलकर प्रतिक्रिया देते हैं, तब बच्चों का जीवन, विकास, संरक्षण और सहभागिता साकार और स्थायी होती है।',
      eyebrow_work:'हम क्या करते हैं', work_head:'चार मोर्चे, एक साझा प्रतिक्रिया।',
      eyebrow_where:'हम कहाँ कार्य करते हैं', where_head:'22 ज़िले। 2 राज्य। एक सीमा।',
      where_sub:'हम उत्तर प्रदेश की पूर्वी भारत-नेपाल सीमा और महाराष्ट्र में कार्य करते हैं — साझा संरचनात्मक असुरक्षा से बंधे क्षेत्र। ज़मीनी हकीकत देखने हेतु किसी ज़िले पर टैप करें।',
      eyebrow_cycle:'संरचनात्मक असुरक्षा का चक्र', cycle_head:'जोखिम अकेले नहीं आते।',
      cycle_sub:'ये पीढ़ी-दर-पीढ़ी एक-दूसरे को मज़बूत करते हैं — जब तक तंत्र समय पर प्रतिक्रिया न दे। कोई निश्चित क्रम नहीं है: किसी भी बच्चे के लिए यह जाल किसी भी बिंदु से शुरू हो सकता है, और हर जोखिम अगले को और पास खींच लाता है।',
      cycle_pick:'नीचे किसी भी पहलू पर कर्सर ले जाएँ या टैप करें — देखें कि एक जीवन कैसे गढ़ा जाता है। जहाँ चाहें वहाँ से शुरू करें।',
      cycle_note:'प्रत्येक पहलू उत्तर प्रदेश की भारत-नेपाल तराई पट्टी — बहराइच, श्रावस्ती, बलरामपुर, लखीमपुर खीरी, सिद्धार्थनगर, महराजगंज और कुशीनगर — में दर्ज सबसे गंभीर मान दर्शाता है, ज़िले व स्रोत सहित। स्वास्थ्य, पोषण व लैंगिक आँकड़े राष्ट्रीय परिवार स्वास्थ्य सर्वेक्षण 5 (2019–21) ज़िला फ़ैक्ट-शीट डेटासेट (स्वास्थ्य मंत्रालय / अंतर्राष्ट्रीय जनसंख्या विज्ञान संस्थान) से, शिक्षा एकीकृत ज़िला शिक्षा सूचना प्रणाली (यूडाइएसई+) ज़िला फ़ैक्ट शीट से, तथा मातृ मृत्यु दर नमूना पंजीकरण प्रणाली से ली गई है, जो राज्य स्तर पर ही उपलब्ध है। सभी स्वास्थ्य आँकड़े एक ही सर्वेक्षण दौर से लिए गए हैं, जिससे ज़िलों की तुलना समान आधार पर हो। घरेलू हिंसा केवल राज्य स्तर पर दर्ज होती है, अतः उत्तर प्रदेश का आँकड़ा दिया गया है। बाल श्रम, निर्धनतम वर्ग तथा शिशु व पाँच-वर्ष मृत्यु दर के आँकड़े प्रशासनिक अभिलेखों पर आधारित हैं और पुनः सत्यापन शेष है; भारत में शिशु व पाँच-वर्ष मृत्यु दर ज़िला स्तर पर आधिकारिक रूप से प्रकाशित नहीं होती।',
      eyebrow_process:'प्रक्रिया', process_head:'जब समुदाय कार्य करते हैं, तंत्र प्रतिक्रिया देते हैं।', eyebrow_stories:'परिवर्तन की कहानियाँ',
      cta_donate:'निवेश करें', cta_donate_b:'समुदाय-नेतृत्व वाले कार्य में ऑनलाइन या ऑफ़लाइन — धन या सामग्री से — योगदान दें।', cta_donate_a:'अभी दें',
      cta_vol:'स्वयंसेवा', cta_vol_b:'इंटर्नशिप करें, वर्चुअल कार्य करें या DEHAT फ़ेलो बनें।', cta_vol_a:'जुड़ें',
      cta_partner:'साझेदारी', cta_partner_b:'कॉर्पोरेट, शैक्षणिक या संस्थागत साझेदारी।', cta_partner_a:'सहयोग करें',
      work_title:'अधिकार, रोज़मर्रा के जीवन में साकार।',
      work_sub:'प्रत्येक DEHAT परियोजना को उसके कार्यक्रम के अंतर्गत देखें। वर्ष, स्थान, ढाँचा, कॉर्पोरेट सामाजिक उत्तरदायित्व व विदेशी अंशदान श्रेणी या बाल अधिकार संधि से छाँटें — और किसी भी परियोजना को खोलकर पूरा क्या, कहाँ, कैसे, कब, क्यों और निवेश देखें।',
      narrow_tpl:'इन {n} परियोजनाओं को छाँटें', most_stop_here:'— ज़्यादातर कार्यक्रम यहीं रुक जाते हैं। DEHAT आगे चलता रहता है।',
      word_of_count:'में से',
      wk_dim_become:'समुदाय क्या बनते हैं', wk_dim_claim:'वे क्या समझते, माँगते और संभव बनाते हैं', wk_dim_visible:'बदलाव कैसे दिखाई देता है',
      idx_b1_head:'इसमें क्या जाता है', idx_b1_body:'केवल प्रकाशित ज़िला आँकड़े — राष्ट्रीय परिवार स्वास्थ्य सर्वेक्षण, यूनिफ़ाइड डिस्ट्रिक्ट इन्फ़ॉर्मेशन सिस्टम फ़ॉर एजुकेशन प्लस, और उनके पीछे की फ़ैक्टशीट। हर मान अपने साथ वह शीट रखता है जिससे वह आया है।',
      idx_b2_head:'यह कैसे बनता है', idx_b2_body:'हर संकेतक को समूह के सर्वश्रेष्ठ प्रदर्शन वाले ज़िले से दूरी के रूप में अंक दिए जाते हैं, फिर 0 से 100 के बीच एक ही आँकड़े में औसत निकाला जाता है। मानक कोई वास्तविक ज़िला है, इसलिए हर अंक वह दूरी है जो कहीं न कहीं पहले ही तय की जा चुकी है।',
      idx_b3_head:'यह किसलिए है', idx_b3_body:'यह तय करता है कि हम आगे कहाँ जाएँ, और यही वह संख्या है जिसके सामने काम की रिपोर्ट दी जाती है। जो ज़िला बेहतर होता है, उसे इस पर नीचे आना चाहिए।',
      why_h1:'पाँच वर्ष से कम आयु के बच्चे नाटेपन (स्टंटिंग) के शिकार हैं — आधी पीढ़ी ऐसी वृद्धि-कमी लिए हुए जो कभी पूरी तरह नहीं भरती।',
      why_h2:'लड़कियों का विवाह अठारह वर्ष से पहले हो जाता है — हमारे कार्यक्षेत्र के ज़िलों में सबसे ऊँची बाल-विवाह दर।',
      why_h3:'महिलाएँ गर्भावस्था की शुरुआत रक्ताल्पता (एनीमिया) के साथ करती हैं — यह कमी अगले बच्चे को जन्म से पहले ही मिल जाती है।',
      wk_q_eyebrow:'एक समुदाय, चार सवाल', wk_q_head:'हर यात्रा उसी समुदाय से शुरू होती है और उससे एक अलग सवाल पूछती है।',
      wk_q_sub:'चारों कार्यक्रम-यात्राएँ चार अलग संगठन नहीं हैं। ये उन्हीं लोगों, उन्हीं संस्थाओं और परिवर्तन की उसी लंबी प्रक्रिया को पढ़ने के चार तरीक़े हैं। कोई एक चुनें और देखें कि वह कौन-सा सवाल लेकर चलती है।',
      wk_x_eyebrow:'अंतर्सम्बद्धता', wk_x_head:'कोई भी कार्यक्रम अकेले नहीं टिकता।',
      wk_x_sub:'हर कार्यक्रम बाक़ी तीन को कुछ देता है और उनसे कुछ लेता भी है। किसी एक को चुनें और उस आदान-प्रदान के दोनों पहलू देखें — वह क्या देता है, और किसके बिना उसका काम नहीं चलता।',
      wk_pp_eyebrow:'परियोजना और कार्यक्रम', wk_pp_head:'पैसा परियोजनाओं के रूप में आता है। काम कार्यक्रम के रूप में जमा होता है।',
      wk_pp_proj_label:'परियोजना', wk_pp_prog_label:'कार्यक्रम',
      wk_pp_proj_body:'अनुदान एक विषय के साथ आता है। इस बार, सेतु कक्षाएँ। तीन साल तक गाँव में एक केंद्र रहता है, रजिस्टर पर एक शिक्षक, और वे बच्चे जो स्कूल छोड़ चुके थे, फिर से पंक्तियों में बैठते हैं। फिर अनुदान अवधि समाप्त होती है, रिपोर्ट दाख़िल होती है, केंद्र समेट दिया जाता है। रिपोर्ट सही है। वह नामांकन, उपस्थिति और सरकारी स्कूलों में वापसी गिनती है। उसमें उस चौदह वर्ष की लड़की के लिए कोई पंक्ति नहीं है जिसने उसी कमरे में यह समझा कि वह मना भी कर सकती है।',
      wk_pp_prog_body:'वह वहीं रहती है। गाँव भी। चार साल बाद एक अलग विषय के साथ एक अलग अनुदान आता है, और बैठक बुलाने वाली वही होती है। जिस बाल संसद की वह अध्यक्षता करती है, वह किसी परियोजना का लक्ष्य नहीं थी। न ही उसकी माँ, जो अब बता सकती है कि उसे कौन-सा हक़ मिलना चाहिए और वह किस दफ़्तर की ज़िम्मेदारी है। हमारी उनचास में से अड़तीस परियोजनाएँ पच्चीस वर्षों में एक के बाद एक उसी ज़िले में उतरी हैं। वहाँ जो जमा हुआ है, वह उनमें से किसी रिपोर्ट में दर्ज नहीं है।',
      wk_pp_note:'हमने जितनी भी समापन रिपोर्टें दाख़िल की हैं, सब सच हैं। उनमें से कोई भी उस हिस्से को नहीं समेटती जो टिक गया। इसलिए हम हर हस्तक्षेप को एक के बजाय तीन आयामों पर दर्ज करते हैं — समुदाय क्या बनता है, वह अब क्या माँग सकता है, और दिखने में क्या बदला। तीनों पढ़ने के लिए कोई एक हस्तक्षेप चुनें।',
      wk_method_eyebrow:'पद्धति', wk_method_sub:'समुदाय-आधारित · अधिकार-आधारित · सार्वजनिक तंत्रों के साथ अभिसरण। चारों कार्यक्रमों के नीचे वही चार गतियाँ चलती हैं, और वे एक चक्र की तरह चलती हैं — जो तंत्र प्रतिक्रिया देता है, वह बदल देता है कि समुदाय आगे क्या अपेक्षा करेगा।',
      wk_anchor_eyebrow:'यह कार्य कहाँ टिका है', wk_anchor_head:'तीन ढाँचे, गाँवों का एक ही समूह।',
      wk_anchor_sub:'यही काम तीन अलग-अलग रजिस्टरों के प्रति जवाबदेह है — एक अधिकार संधि, वैश्विक लक्ष्यों का एक समूह, और भारतीय कंपनी क़ानून। हर एक किसी अलग पाठक के लिए मायने रखता है। तीनों उन्हीं चार कार्यक्रमों का वर्णन करते हैं।',
      wk_carried_by:'मुख्य रूप से इनके अंतर्गत',
      wk_csr_note:'कंपनी अधिनियम, 2013 की अनुसूची VII उन गतिविधियों को निर्धारित करती है जिन्हें कोई कंपनी CSR के रूप में गिन सकती है। DEHAT के चारों कार्यक्रम इसकी पाँच मदों में आते हैं, जिसका अर्थ है कि कोई कॉर्पोरेट साझेदार बिना किसी विशेष ढाँचे के इनमें से किसी को भी वित्तपोषित कर सकता है।',
      wk_why_eyebrow:'यहीं क्यों', wk_why_head:'चार कार्यक्रम। एक वजह जिसके चलते सभी को एक ही जगह से शुरू होना पड़ा।',
      wk_why_sub:'कार्यक्रम बताते हैं कि हम क्या करते हैं। वे भूगोल की व्याख्या नहीं करते। ये तीन ज़िले करते हैं।',
      wk_idx_head:'वे ज़िले कैसे चुने गए',
      wk_idx_body:'कोई सूचकांक किसी जगह या उसके लोगों पर फ़ैसला नहीं होता। यह इस बात का माप है कि कोई सार्वजनिक तंत्र अपने ही किए वादे से कितनी दूर खड़ा है — एक संख्या के रूप में लिखा गया, ताकि ज़िलों की ईमानदारी से तुलना की जा सके और प्राथमिकताओं पर बहस हो सके, उन्हें थोपा न जाए।',
      wk_idx_note:'तेईस ज़िले इस संख्या का कोई न कोई रूप रखते हैं। उनमें से हर एक नक़्शे पर है, हर संकेतक और उसके नामित स्रोत के साथ।', wk_atlas_cta:'ज़िला एटलस खोलें',
      wk_build_eyebrow:'हम क्या बना रहे हैं', wk_build_head:'परियोजनाओं का पोर्टफ़ोलियो नहीं। एक ऐसा समुदाय जो हमारे बिना भी आगे चल सके।',
      wk_build_sub:'हर हस्तक्षेप को अपने पीछे उन संस्थाओं से मज़बूत संस्थाएँ छोड़नी चाहिए जो उसने पाई थीं। हर पीढ़ी को अगली पीढ़ी की क्षमता बढ़ानी चाहिए। अलग-अलग परियोजनाएँ शुरू होती हैं और ख़त्म होती हैं; जो नेतृत्व, अधिकार-साक्षरता और संस्थाएँ वे पीछे छोड़ जाती हैं, वही चक्रवृद्धि होती हैं।',
      wk_build_cta1:'इस ढाँचे में निवेश करें', wk_build_cta2:'हमारे साथ साझेदारी करें',
      portfolio_total:'मदवार अनुदान पोर्टफ़ोलियो', portfolio_investment:'कुल सामाजिक निवेश',
      filter_year:'वर्ष', filter_location:'स्थान', filter_sdg:'सतत व सहस्राब्दि विकास लक्ष्य', filter_csr:'कॉर्पोरेट सामाजिक उत्तरदायित्व · अनुसूची VII', filter_fcra:'विदेशी अंशदान श्रेणी', filter_uncrc:'बाल अधिकार संधि', filter_funder:'वित्तपोषक', filter_all:'सभी',
      open_details:'विवरण खोलें', close_details:'विवरण बंद करें', phases_label:'चरण',
      d_what:'क्या', d_where:'कहाँ', d_how:'कैसे', d_why:'क्यों', d_when:'कब', d_invest:'कितना (निवेश)',
      m_location:'स्थान', m_sdg:'सतत व सहस्राब्दि विकास लक्ष्य', m_csr:'कॉर्पोरेट सामाजिक उत्तरदायित्व · अनुसूची VII', m_fcra:'विदेशी अंशदान श्रेणी', m_uncrc:'बाल अधिकार संधि', m_funder:'वित्तपोषक',
      invest_note:'₹ व USD में, परियोजना के अपने वर्ष की दर पर परिवर्तित।',
      impact_eyebrow:'प्रभाव', impact_title:'2000 से, समुदायों के साथ — जब वे अपने अधिकार माँगते और व्यवस्थाओं को जवाबदेह बनाते हैं।',
      impact_sub:'1989 में युवा समूह के रूप में शुरुआत, 2000 में पंजीकृत। ये आँकड़े पैमाना दिखाते हैं; इनके पीछे समुदाय, कार्यकर्ता और सार्वजनिक संस्थाएँ मिलकर काम करती हैं।',
      reach_head:'अब तक का भौगोलिक विस्तार', reach_states:'राज्य', reach_districts:'ज़िले', reach_blocks:'ब्लॉक', reach_villages:'गाँव', reach_children:'बच्चे व किशोर', reach_farmers:'महिला किसान',
      stories_eyebrow:'परिवर्तन की कहानियाँ', stories_title:'हकीकत, फिर बदलाव।',
      stories_sub:'हर कहानी चार बाल अधिकारों में से एक के इर्द-गिर्द है — जीवन, विकास, संरक्षण, सहभागिता।',
      roster_h1:'एक व्यक्ति से शुरुआत करें।', roster_sub:'DEHAT के अपने केस रिकॉर्ड से लिखी गई। जहाँ रिकॉर्ड में वयस्कों के नाम दर्ज हैं, वहाँ वही नाम दिए गए हैं; बच्चों के नाम बदल दिए गए हैं। किसी को चुनें और उसका जीवन पढ़ें।',
      roster_filter:'फ़िल्टर', roster_filters_n:'फ़िल्टर · {n}', roster_count_all:'{n} कहानियाँ', roster_count_filtered:'{all} में से {shown} कहानियाँ',
      roster_show_more:'{n} और दिखाएँ', roster_next_story:'अगली कहानी', roster_start_again:'फिर से शुरू करें',
      roster_back:'← चेहरे', roster_invest:'इस काम में निवेश करें', right_to_tpl:'{x} का अधिकार',
      cyc_direct_count_tpl:'16 में से {n} चरण सीधे संबोधित', cyc_addressed_directly:'सीधे संबोधित', cyc_affected_indirectly:'अप्रत्यक्ष रूप से प्रभावित',
      cyc_indirect_note:'यह इस कार्यक्रम के लिए सीधा प्रवेश-बिंदु नहीं है। इस चरण तक उन चरणों के ज़रिए पहुँचा जाता है जिन्हें सीधे संबोधित के रूप में चिह्नित किया गया है।',
      sdg_goals_label:'यह कार्यक्रम जिन लक्ष्यों के विरुद्ध रिपोर्ट करता है', prog_figs_label:'इस कार्यक्रम ने अब तक क्या किया है',
      cyc_meets_eyebrow:'यह कार्यक्रम चक्र से कहाँ जुड़ता है', cyc_meets_title:'संरचनात्मक असुरक्षा का चक्र, इस कार्यक्रम की दृष्टि से।',
      cyc_see_all_stages:'सभी सोलह चरण देखें →',
      pcta_invest_title:'निवेश करें', pcta_invest_body:'इस कार्यक्रम के एक पूरे वर्ष या उसके किसी एक हिस्से को वित्तपोषित करें। हर रुपया उस परियोजना के विरुद्ध दर्ज किया जाता है जिस पर वह ख़र्च हुआ।', pcta_invest_action:'देखें पैसा कहाँ जाता है',
      pcta_eyebrow:'आप कहाँ आते हैं', pcta_head:'ऊपर सब कुछ अभिलेख में है। अब चुनिए कि आगे जो होना है, उसमें आप किस तरह शामिल होना चाहेंगे।',
      pcta_time_title:'समय दें', pcta_time_body:'फ़ील्ड विज़िट, अनुवाद, डेटा, क़ानूनी सहायता, शिक्षण। हमें बताएँ आप क्या कर सकते हैं और कहाँ हैं।', pcta_time_action:'अपना रास्ता खोजें',
      pcta_partner_title:'साझेदारी करें', pcta_partner_body:'सरकारी विभाग, वित्तपोषक और संस्थाएँ पहले से इस कार्यक्रम के साथ काम कर रही हैं। और जुड़ने की गुंजाइश है।', pcta_partner_action:'देखें हम किनके साथ काम करते हैं',
      support_note_tpl:'ऊपर दिए रजिस्टर में इस कार्यक्रम की {n} परियोजनाएँ सूचीबद्ध हैं, हर एक के साथ उस साझेदार का नाम जिसने इसे वित्तपोषित किया और जो इसने किया। हर तरह का सहयोग उन्हीं शर्तों पर स्वागत योग्य है।',
      who_teaser_eyebrow:'इसके पीछे कौन है',
      who_teaser_head:'चौंतीस लोग, एक संस्थापक, दो बोर्ड, और एक कहानी जो 1968 से शुरू होती है',
      who_teaser_body:'यह संस्था फ़ील्ड स्टाफ़ वाला कोई मुख्यालय नहीं है। अधिकांश सहयोगी उन्हीं ज़िलों से भर्ती किए गए जहाँ वे काम करते हैं, और जो बाहर से आए वे यहीं रह गए। किसी चेहरे को चुनें यह देखने के लिए कि आप किसका विवरण पढ़ रहे हैं, या चंपारण की एक गौशाला से चार ज़िलों के काम तक का रजिस्टर देखें।',
      who_teaser_cta:'सभी से मिलें', who_teaser_cta2:'1968 से अब तक की कहानी पढ़ें',
      who_teaser_foot:'हू वी आर पेज में सभी चौंतीस सहयोगी, संस्थापक, गवर्निंग बोर्ड, सलाहकार, मूल्य-प्रणाली और मोड़ों का पूरा रजिस्टर मौजूद है।',
      since_tpl:'{y} से', joined_tpl:'{y} में शामिल हुए', and_word:'और', across_districts:'सभी ज़िलों में',
      roster_head_who:'वे लोग जो यह काम आगे बढ़ाते हैं',
      roster_note_who:'तैंतीस सहयोगी, साथ ही सामुदायिक नेता, कृषि मित्र, सामुदायिक संसाधन व्यक्ति और वे समूह जो यह काम आगे ले जाते हैं। यहाँ हर किसी ने सामने आने के लिए सहमति दी है।',
      who_kicker:'बहराइच ज़िला, उत्तर प्रदेश · भारत–नेपाल सीमा',
      who_h1:'1973 में चंपारण में एक पारिवारिक विवाद ने एक लड़के को गौशाला में पहुँचा दिया।',
      who_p1:'वह अकेला नहीं था, और यही वह हिस्सा था जिसे वह भुला नहीं पाया। वह लड़का जितेंद्र चतुर्वेदी था। सोलह साल बाद, बहराइच में, युवाओं के एक समूह ने थारू आदिवासी और वनवासी बच्चों के लिए एक स्कूल खोला। दोनों धागे अगले ग्यारह वर्षों तक आपस में नहीं मिले।',
      who_p2:'बहराइच नेपाल सीमा पर स्थित है। योजना आयोग ने कभी इसे भारत के सौ सबसे पिछड़े ज़िलों में गिना था; अब नीति आयोग इसे आकांक्षी ज़िला कहता है। DEHAT ऐसे ही चार ज़िलों में काम करता है, और आगे जो कुछ भी है वह यहीं घटित हुआ।',
      register_kicker:'रजिस्टर · 1968–2026', register_h2:'यह वहाँ से यहाँ तक कैसे पहुँचा?',
      register_sub:'अट्ठावन साल, उन पलों के ज़रिए बताए गए जिन्होंने आगे की दिशा बदल दी। स्क्रॉल करें, या रिबन पर आगे बढ़ें।',
      lane_people:'लोग', lane_community:'समुदाय व साझेदार', lane_everything:'सभी', lane_honours:'प्राप्त सम्मान',
      entries_count_all:'{n} प्रविष्टियाँ', entries_count_filtered:'{total} में से {n} प्रविष्टियाँ',
      news_eyebrow:'समाचारों में', news_title:'दुनिया भर में DEHAT',
      press_all_items:'सभी {n} आइटम देखें →', press_media_archive:'मीडिया अभिलेखागार →',
      press_all_sub:'प्रकाशक, वर्ष, भाषा, लक्ष्य, कॉर्पोरेट सामाजिक उत्तरदायित्व शीर्षक और बाल अधिकार के अनुसार फ़िल्टर करें।',
      where_note:'ये सिर्फ़ ज़रूरत के नहीं, बल्कि नेतृत्व के स्थान हैं। तीन ज़िले — बहराइच, श्रावस्ती और बलरामपुर — हमारा सबसे गहरा, सबसे बहु-आयामी निवेश समेटे हैं; लखीमपुर खीरी 2026 से बाल संरक्षण के साथ इनमें जुड़ेगा। बाक़ी ज़िले दो दशकों की कार्यक्रम-उपस्थिति दर्शाते हैं। हर एक के पीछे के आँकड़े और उनके स्रोत देखने के लिए एटलस खोलें।',
      involved_eyebrow:'साथ जुड़ें', involved_title:'मौजूदा शक्ति को साकार करें — हमारे साथ।',
      involved_sub:'चाहे आप एक घंटा दें, एक कौशल या एक रुपया — आप उस तंत्र का हिस्सा बनते हैं जो प्रतिक्रिया देता है।',
      involved_cta_title:'समुदायों के साथ निवेश करें।',
      involved_cta_sub:'ऑनलाइन या ऑफ़लाइन, धन या सामग्री — हर योगदान एक अधिकार-आधारित, समुदाय-समर्थित प्रतिक्रिया में जुड़ता है।',
      donate_now:'साझेदारी शुरू करें', email_us:'ईमेल करें', f_email:'ईमेल', f_phone:'फ़ोन', f_web:'वेब', f_address:'पता',
      nav_finance:'पारदर्शिता', nav_answers:'उत्तर',
      fin_eyebrow:'वित्तीय पारदर्शिता', fin_title:'हर रुपया, अभिलेख में।',
      fin_sub:'स्वतंत्र रूप से अंकेक्षित लेखे \u2014 प्राप्त अनुदान, उपयोग की गई राशि, और उनके पीछे की वैधानिक जाँच। हर आँकड़ा हस्ताक्षरित बैलेंस शीट से लिया गया है।',
      fin_stat_received:'दर्ज अनुदान (20 वर्ष)', fin_stat_fcra:'विदेशी अंशदान (विनियमन) अधिनियम अंशदान', fin_stat_inr:'घरेलू (INR) अंशदान', fin_stat_funders:'दर्ज वित्तपोषक',
      fin_years_head:'वर्ष-दर-वर्ष', fin_years_sub:'क्या आया, क्या खर्च हुआ, और लेखों पर किसने हस्ताक्षर किए। वित्तपोषक देखने हेतु वर्ष चुनें।',
      fin_received:'प्रतिबद्ध', fin_utilised:'नियोजित', fin_auditor:'अंकेक्षक', fin_bs:'बैलेंस शीट', fin_surplus:'अधिशेष', fin_deficit:'घाटा', fin_partial:'आंशिक', fin_compiled:'संकलित',
      fin_funders_head:'कार्य में कौन निवेश करता है', fin_funders_sub:'विदेशी अंशदान कानून के अनुसार अलग विदेशी अंशदान (विनियमन) अधिनियम खाते में रखा व अंकेक्षित होता है; घरेलू निधि INR लेखों से चलती है।',
      fin_regime_fcra:'विदेशी अंशदान (विनियमन) अधिनियम \u00b7 विदेशी', fin_regime_inr:'INR \u00b7 घरेलू',
      fin_funders_cta:'सभी साझेदार देखें',
      fin_compliance_head:'वैधानिक अनुपालन', fin_compliance_sub:'DEHAT एक पंजीकृत सोसायटी है (सोसायटी पंजीकरण अधिनियम, 1860)। नीचे वार्षिक जवाबदेही चक्र है जिसे DEHAT दाखिल करता है।',
      fin_reg_head:'पंजीकरण', fin_cal_head:'वार्षिक फाइलिंग कैलेंडर', fin_rules_head:'हम किसके विरुद्ध रिपोर्ट करते हैं',
      fin_auditor_trail:'प्रत्येक वर्ष एक कार्यरत सनदी लेखाकार द्वारा अंकेक्षित, Unique Document Identification Number सहित हस्ताक्षरित। पिछले दशक में पाँच अलग फर्मों ने लेखों की जाँच की \u2014 कोई एकल दीर्घकालिक संबंध नहीं।',
      fin_due:'देय', fin_year_funders:'इस वर्ष के वित्तपोषक',
      fin_docs_head:'प्रमाण-पत्र व दस्तावेज़', fin_docs_sub:'हर पंजीकरण, अनुमोदन और तृतीय-पक्ष मान्यता \u2014 मूल प्रमाण-पत्र से स्कैन। स्रोत दस्तावेज़ पढ़ने हेतु कोई भी खोलें।',
      fin_docg_statutory:'पंजीकरण व कर', fin_docg_fcra:'विदेशी अंशदान (विनियमन) अधिनियम', fin_docg_validation:'मान्यताएँ व सम्मान',
      fin_doc_view:'दस्तावेज़ देखें', fin_pending_label:'अंकेक्षित स्कैन उपलब्ध — आँकड़े डिजिटल किए जा रहे हैं',
      ask_title:'रिकॉर्ड से पूछें', ask_lead:'यह डेस्क केवल उन्हीं बातों के आधार पर जवाब देता है जो DEHAT पहले ही प्रकाशित कर चुका है। अपने शब्दों में एक सवाल पूछें। अगर जवाब इस वेबसाइट पर नहीं है, तो यह साफ़ बता देगा और अंदाज़ा लगाने के बजाय आपको किसी व्यक्ति से संपर्क करने का तरीक़ा देगा।',
      ask_placeholder:'जैसे: क्या मैं भारत के बाहर से दान कर सकता/सकती हूँ?', ask_submit:'पूछें', ask_clear:'हटाएं',
      ask_nohit_title:'यह डेस्क उस सवाल का जवाब नहीं रखता।', ask_nohit_body:'इस वेबसाइट पर प्रकाशित कोई भी सामग्री आपके इस सवाल का इतना सटीक जवाब नहीं देती कि उसे यहाँ दोहराया जा सके, और यह टूल कोई जवाब गढ़ेगा नहीं। हमें लिखें, एक व्यक्ति आपको जवाब देगा।', ask_nohit_cta:'हमें लिखें',
      ask_suggest_label:'या इनमें से कोई एक आज़माएं',
      ask_sg_0:'क्या मेरा दान कर-मुक्त (टैक्स डिडक्टिबल) है?', ask_sg_1:'बैलेंस शीट कहाँ मिलेंगी?', ask_sg_2:'क्या मैं भारत के बाहर से दान कर सकता/सकती हूँ?', ask_sg_3:'क्या मैं स्वयंसेवा कर सकता/सकती हूँ?', ask_sg_4:'मैं कोई चिंता/शिकायत कैसे दर्ज करूं?',
      ask_cat_all:'सभी', faq_title:'वे सवाल जो लोग सचमुच पूछते हैं', faq_sub:'विषय के अनुसार समूहित। हर जवाब उस पेज की ओर इशारा करता है जो उसे प्रमाणित करता है।', faq_count_suffix:'प्रकाशित उत्तर',
      ck_banner_title:'हमारा गोपनीयता वक्तव्य और कुकी नीति', ck_banner_body:'यह वेबसाइट पेजों को काम करते रहने, यह समझने कि कौन-से पेज पढ़े जा रहे हैं, और हम जो प्रकाशित करते हैं उसे बेहतर बनाने के लिए कुकीज़ और इसी तरह की तकनीकों का उपयोग करती है। इनमें से कुछ आवश्यक हैं। आप सभी को स्वीकार कर सकते हैं, केवल आवश्यक कुकीज़ रख सकते हैं, या श्रेणी के अनुसार चुन सकते हैं, और फ़ुटर में दिए गए "कुकी सेटिंग्स" से कभी भी अपना मन बदल सकते हैं।',
      ck_accept_all:'सभी स्वीकार करें', ck_reject_all:'सभी अस्वीकार करें', ck_manage:'कुकीज़ प्रबंधित करें',
      ck_prefs_title:'गोपनीयता वरीयता केंद्र', ck_prefs_lead:'आप अपने ब्राउज़र में कभी भी कुकीज़ को रोक या अक्षम कर सकते हैं। यहाँ आप चुन सकते हैं कि हम कौन-सी श्रेणियाँ सेट कर सकते हैं। आवश्यक कुकीज़ को बंद नहीं किया जा सकता, क्योंकि इनके बिना वेबसाइट काम नहीं करती।',
      ck_allow_all:'सभी की अनुमति दें', ck_essential_only:'केवल आवश्यक', ck_manage_heading:'सहमति वरीयताएं प्रबंधित करें', ck_always_active:'हमेशा सक्रिय',
      ck_stored_note:'आपकी पसंद केवल इसी डिवाइस पर संग्रहीत होती है, और किसी व्यक्तिगत रिकॉर्ड से जुड़ी नहीं है।', ck_confirm:'मेरी पसंद की पुष्टि करें',
      ck_nec_label:'अत्यंत आवश्यक कुकीज़', ck_nec_body:'वेबसाइट के काम करने के लिए ज़रूरी: आपकी भाषा और थीम याद रखना, आपके द्वारा शुरू किए गए फ़ॉर्म को सुरक्षित रखना, और यह कुकी-विकल्प दर्ज करना। ये आपकी यहाँ की गतिविधि के जवाब में सेट होती हैं और कोई व्यक्तिगत रिकॉर्ड संग्रहीत नहीं करतीं। इन्हें अपने ब्राउज़र में रोकने से वेबसाइट के कुछ हिस्से काम करना बंद कर देंगे।',
      ck_perf_label:'प्रदर्शन कुकीज़', ck_perf_body:'ये हमें विज़िट गिनने और यह देखने देती हैं कि कौन-से पेज पढ़े जाते हैं और लोग वेबसाइट पर कैसे आगे बढ़ते हैं, ताकि हम बता सकें कि क्या उपयोगी है और क्या नहीं। एकत्र की गई हर जानकारी समुच्चित (एग्रीगेटेड) और गुमनाम होती है। इनके बिना हम यह नहीं बता सकते कि कोई पेज किसी तक पहुँच भी रहा है या नहीं।',
      ck_func_label:'कार्यात्मक कुकीज़', ck_func_body:'ये रजिस्टर से जुड़े नक़्शे, दस्तावेज़ और वीडियो जैसी अतिरिक्त सुविधाओं को सक्षम करती हैं। इन्हें उन सेवाओं द्वारा सेट किया जा सकता है जिन्हें हम एम्बेड करते हैं। इनके बिना, उनमें से कुछ हिस्से लोड नहीं होंगे।',
      ck_target_label:'टार्गेटिंग कुकीज़', ck_target_body:'हम विज्ञापन नहीं बेचते और पाठकों की प्रोफ़ाइलिंग नहीं करते। यह श्रेणी यहाँ इसलिए बनी हुई है ताकि यह विकल्प दिखाई दे: हम इसके तहत कुछ भी सेट नहीं करते, और अगर यह कभी बदलता है, तो यह तब तक बंद रहेगा जब तक आप इसे स्वयं चालू नहीं करते।',
      foot_explore:'खोजें', foot_reach:'संपर्क करें', foot_follow:'कार्य से जुड़ें',
      foot_desc:'डेवलपमेंटल एसोसिएशन फॉर ह्यूमन एडवांसमेंट — समुदायों और तंत्रों के साथ कार्य ताकि बच्चों के अधिकार पहचाने, प्राप्त और सुनिश्चित हों।',
      foot_rights:'© 2026 DEHAT · 1989 में युवा समूह के रूप में शुरुआत · 2000 में पंजीकृत',
    };
    const ZH = {
foot_policies:'政策与保障措施', foot_cookies:'Cookie 设置',
      nav_home:'首页', nav_who:'关于我们', nav_work:'我们的工作', nav_impact:'影响力', nav_stories:'故事', nav_media:'媒体', nav_involved:'参与我们',
      donate:'投资', since:'始于1989年', org_full:'人类发展促进协会',
      language:'语言', lang_indian:'印度语言', lang_global:'全球语言（联合国）',
      hero_title_a:'一个以儿童为中心的社会，让每个孩子都能实现其', hero_title_b:'权利', hero_title_c:'——安全、有尊严、完整无缺。',
      hero_sub:'我们与印度—尼泊尔特莱地区的社区及公共系统携手合作，让儿童权利不再只是纸面文字，而是在日常生活中得到确认、获取和落实。',
      hero_cta1:'与社区同行', hero_cta2:'了解我们的工作方式', hero_photo:'照片——儿童议会代表，巴赖奇县洛拉村',
      hero_principle:'与社区和政府系统携手合作，为了每一个孩子。',
      stat_children:'触达的儿童与青少年人数', stat_invested:'自2000年起对社区系统的投入', stat_resources:'获取的公共资源', stat_districts:'横跨2个邦的县数',
      stat_hint:'四项数据，暂未显示。点击查看。', stat_reveal:'点击查看', stat_hide:'隐藏', stat_reveal_all:'显示全部四项', stat_hide_all:'全部隐藏', grid_reveal_all:'显示全部十四项', grid_hint:'十四项数据，暂未显示。点击查看。', bl_drag:'拖动查看历年调查',
      vision:'愿景', mission:'使命', theory:'变革理论',
      vision_body:'一个以儿童为中心的社会，让每个孩子都能实现自身权利，过上安全、有尊严、充实的生活。',
      mission_body:'与社区及各系统合作，释放既有的力量，确保儿童权利在日常生活中得到确认、获取和落实。',
      theory_body:'当社区行动起来、各系统协同响应时，儿童的生存、发展、保护与参与权利便得以实现并持续保障。',
      eyebrow_work:'我们的工作', work_head:'四条战线，一个共同应对之道。',
      eyebrow_where:'我们的工作地区', where_head:'23个县。2个邦。一条边境线。',
      where_sub:'我们的工作横跨北方邦与马哈拉施特拉邦沿印度—尼泊尔东段边境的地区——这些地区因共同的结构性脆弱性而联系在一起。点击某个县，了解当地实际情况。',
      eyebrow_cycle:'结构性脆弱性循环', cycle_head:'风险从不孤立发生。',
      cycle_sub:'这些风险会代代相互强化——除非各系统及时响应。这里没有固定顺序：对任何一个孩子而言，这一陷阱都可能从任意一点开始，而每一种风险都会把下一种拉得更近。',
      cycle_pick:'点击任意一个节点，了解一个人的一生是如何被塑造的。',
      cycle_note:'每项数据均为北方邦印度—尼泊尔特莱地区七个县中记录到的最严峻数值——巴赖奇（Bahraich）、什拉瓦斯蒂（Shravasti）、巴尔兰普尔（Balrampur）、拉基姆普尔凯里（Lakhimpur Kheri）、悉达多讷格尔（Siddharthnagar）、马哈拉杰甘杰（Maharajganj）与库希讷格尔（Kushinagar）。数据来源：健康、营养与性别相关数据来自第五轮全国家庭健康调查（NFHS-5，2019—2021年）县级情况说明数据集（卫生和家庭福利部／国际人口科学研究所）；入学情况数据来自教育统一区县信息系统Plus（UDISE+）县级情况说明；孕产妇死亡率数据来自抽样登记系统（SRS），该数据仅在邦一级公布。所有健康类数据均来自同一轮调查，因此各县之间具有可比性。配偶暴力数据仅在全国家庭健康调查的邦级模块中收集，故以北方邦整体数值呈现。其中四项数据——童工、最贫困财富阶层，以及婴儿死亡率与五岁以下儿童死亡率——基于尚待复核的行政记录，特此说明。印度并未发布婴儿死亡率或五岁以下儿童死亡率的官方县级数据系列。每项数据均标明所属县及数据来源。',
      eyebrow_process:'工作流程', process_head:'社区行动，系统响应。', eyebrow_stories:'变革故事',
      cta_donate:'投资', cta_donate_b:'以资金或物资，线上或线下，支持社区主导的工作。', cta_donate_a:'立即投资',
      cta_vol:'志愿服务', cta_vol_b:'实习、远程参与，或成为DEHAT 研究员（Fellow）。', cta_vol_a:'加入我们',
      cta_partner:'合作伙伴', cta_partner_b:'企业、学术或机构合作。', cta_partner_a:'开展合作',
      pillar_link_work:'查看四大项目', pillar_link_how:'了解我们的工作方式', stories_all:'阅读全部故事',
      work_title:'权利，在日常生活中得以实现。',
      chrono_title:'按时间顺序排列的每一个项目',
      count_label:'项已记录项目',
      open_programme:'打开项目页面',
      work_sub:'四大项目，按启动先后排列。每一项都设有独立页面——说明该项工作存在的意义、运作方式，以及它开展过的每一个具体项目，并按时间顺序列出各自的内容、地点、方式、时间、原因与投资情况。',
      portfolio_total:'已公开记录的项目数', portfolio_investment:'社会投资总额',
      portfolio_count:'项，分布于四大项目',
      filter_year:'年份', filter_state:'邦', filter_district:'县', filter_sdg:'可持续发展目标', filter_csr:'企业社会责任 · 附表七（Schedule VII）', filter_uncrc:'儿童权利', filter_investor:'社会投资方', filter_all:'全部',
      open_details:'查看完整记录', close_details:'收起记录', phases_label:'阶段',
      annual_label:'逐年数据',
      cross_from:'同时也属于',
      shared_note:'共享社会投资额：',
      d_what:'我们致力实现的改变', d_why:'为何此地尤为重要',
      d_how:'社区与系统如何协同合作', d_impact:'影响力数据',
      d_investor:'社会投资方', d_investors:'社会投资方', d_investment:'社会投资',
      m_when:'时间与状态', m_location:'地点', m_sdg:'可持续发展目标', m_csr:'企业社会责任 · 附表七（Schedule VII）', m_uncrc:'儿童权利', m_law:'印度相关法律与政策依据', m_law_none:'该项目未记录单一的法定依据。',
      invest_note:'完全按照原始记录发布，未经合并处理。',
      impact_eyebrow:'影响力', impact_title:'自2000年起，陪伴社区争取权利，并与公共系统合作落实这些权利。',
      impact_sub:'1989年发起于一个青年组织，2000年正式注册。这些数字展现的是规模；其背后代表的是社区、一线工作者与公共机构的携手行动。',
      reach_head:'迄今为止的覆盖范围', reach_states:'邦', reach_districts:'县', reach_blocks:'乡镇（Block）', reach_villages:'村庄', reach_children:'儿童与青少年', reach_farmers:'女性农户',
      stories_eyebrow:'变革故事', stories_title:'先是现实，而后是转变。',
      stories_sub:'每一则案例故事都围绕四项儿童权利之一展开——生存、发展、保护、参与。',
      involved_eyebrow:'参与我们', involved_title:'释放既有的力量——与我们同行。',
      involved_sub:'无论您付出一小时、一项技能，还是一卢比，您都将成为这一响应体系的一部分。',
      involved_cta_title:'与社区并肩投资。',
      involved_cta_sub:'资金或物资，线上或线下——每一卢比都将转化为社区在我们离开后仍能保有的能力。',
      donate_now:'开启合作', email_us:'给我们发邮件', f_email:'邮箱', f_phone:'电话', f_web:'网站', f_address:'地址',
      nav_finance:'财务透明', nav_answers:'常见问题',
      fin_eyebrow:'财务透明度', fin_title:'每一卢比，皆有据可查。',
      fin_sub:'独立审计账目——投资伙伴承诺的金额、实际用于工作的金额，以及背后的法定核查。每一项数字均来自已签署的资产负债表。',
      fin_stat_received:'20年累计承诺金额', fin_stat_fcra:'外国捐助 · 《外国捐助（管理）法》（FCRA）', fin_stat_inr:'国内捐助 · 印度卢比', fin_stat_funders:'已记录的投资伙伴数',
      fin_years_head:'逐年数据', fin_years_sub:'收入多少、支出多少，以及由谁签署账目。选择某一年份即可查看该年的社会投资方。',
      fin_received:'承诺金额', fin_utilised:'已投入使用', fin_auditor:'审计师', fin_bs:'资产负债表', fin_surplus:'结余', fin_deficit:'赤字', fin_partial:'数据不完整', fin_compiled:'汇总数据',
      fin_funders_head:'谁在为这项工作提供资金', fin_funders_sub:'这些机构与个人以资金支持这项工作——是共同成果的合作伙伴，而非单向的捐助者。根据法律要求，外国捐助须存入并审计于独立的《外国捐助（管理）法》（FCRA）账户；国内资金则通过卢比账目运作。',
      fin_regime_fcra:'《外国捐助（管理）法》（FCRA） · 境外', fin_regime_inr:'印度卢比 · 境内',
      fin_funders_cta:'查看全部合作伙伴',
      fin_compliance_head:'法定合规', fin_compliance_sub:'DEHAT 是一个注册社团（依据1860年《社团注册法》）。以下是审阅者通常期望看到、且 DEHAT 按期提交的年度问责周期。',
      fin_reg_head:'注册情况', fin_cal_head:'年度申报日历', fin_rules_head:'我们对照报告的依据',
      fin_auditor_trail:'每年均由执业注册会计师（Chartered Accountant）审计，并附唯一文件识别编号（UDIN）签署。过去十年间共有五家不同的事务所审阅账目——并无单一长期合作关系。',
      fin_due:'截止日期', fin_year_funders:'本年度投资伙伴',
      fin_docs_head:'证书与文件', fin_docs_sub:'每一项注册、批准与第三方认证——均由原始证书扫描而来。点击任意一项即可查看源文件。',
      fin_docg_statutory:'注册与税务', fin_docg_fcra:'外国捐助 · 《外国捐助（管理）法》（FCRA）', fin_docg_validation:'认证与荣誉',
      fin_doc_view:'查看文件', fin_pending_label:'已存档审计扫描件——数据正在数字化中',
      foot_explore:'浏览', foot_reach:'联系我们', foot_follow:'关注我们的工作',
      foot_desc:'人类发展促进协会——与社区及各系统合作，确保儿童权利得到确认、获取和落实。',
      foot_rights:'© 2026 DEHAT · 1989年发起于青年组织 · 2000年注册',
    };
    const FR = {
foot_policies:'Politiques et mesures de sauvegarde', foot_cookies:'Paramètres des cookies',
      nav_home:'Accueil', nav_who:'Qui sommes-nous', nav_work:'Notre action', nav_impact:'Impact', nav_stories:'Histoires', nav_media:'Médias', nav_involved:'S’engager',
      donate:'Investir', since:'Depuis 1989', org_full:'Association pour le développement et l’avancement humain',
      language:'Langue', lang_indian:'Langues indiennes', lang_global:'Mondiales (ONU)',
      hero_title_a:'Une société centrée sur l’enfant où chaque enfant fait valoir ses ', hero_title_b:'droits', hero_title_c:' — en sécurité, dans la dignité, en entier.',
      hero_sub:'Nous travaillons avec les communautés et les services publics le long du Teraï indo-népalais afin que les droits de l’enfant ne soient pas seulement écrits, mais reconnus, accessibles et respectés au quotidien.',
      hero_cta1:'Se tenir aux côtés des communautés', hero_cta2:'Découvrir notre méthode', hero_photo:'PHOTO — Responsables du Parlement des enfants, village de Lohra, Bahraich',
      hero_principle:'Aux côtés des communautés et des systèmes gouvernementaux, pour chaque enfant.',
      stat_children:'Enfants et adolescents touchés', stat_invested:'Investi dans les dispositifs communautaires depuis 2000', stat_resources:'Ressources publiques obtenues', stat_districts:'Districts répartis sur 2 États',
      stat_hint:'Quatre chiffres, masqués. Touchez-en un pour le révéler.', stat_reveal:'Toucher pour révéler', stat_hide:'Masquer', stat_reveal_all:'Révéler les quatre', stat_hide_all:'Tout masquer', grid_reveal_all:'Révéler les quatorze', grid_hint:'Quatorze chiffres, masqués. Touchez-en un pour le révéler.', bl_drag:'Faites glisser l’enquête',
      vision:'Vision', mission:'Mission', theory:'Théorie du changement',
      vision_body:'Une société centrée sur l’enfant où chaque enfant fait valoir ses droits et mène une vie sûre, digne et épanouie.',
      mission_body:'Travailler avec les communautés et les systèmes pour concrétiser un pouvoir déjà existant, afin que les droits de l’enfant soient reconnus, accessibles et respectés au quotidien.',
      theory_body:'Lorsque les communautés agissent et que les systèmes répondent de façon concertée, la survie, le développement, la protection et la participation des enfants sont assurés et pérennisés.',
      eyebrow_work:'Ce que nous faisons', work_head:'Quatre fronts, une seule réponse convergente.',
      eyebrow_where:'Où nous intervenons', where_head:'23 districts. 2 États. Une frontière.',
      where_sub:'Nous intervenons le long de la frontière orientale indo-népalaise, en Uttar Pradesh et au Maharashtra — des régions liées par une même vulnérabilité structurelle. Touchez un district pour voir la réalité du terrain.',
      eyebrow_cycle:'Le cycle de la vulnérabilité structurelle', cycle_head:'Les risques ne surviennent jamais isolément.',
      cycle_sub:'Ils se renforcent mutuellement de génération en génération — à moins que les systèmes ne réagissent à temps. Il n’existe pas d’ordre fixe : pour chaque enfant, le piège peut se refermer à partir de n’importe quel point, et chaque risque en rapproche un autre.',
      cycle_pick:'Touchez un moment quelconque pour suivre comment une vie en est façonnée.',
      cycle_note:'Chaque chiffre correspond à la valeur la plus défavorable enregistrée parmi sept districts de la ceinture du Teraï indo-népalais de l’Uttar Pradesh — Bahraich, Shravasti, Balrampur, Lakhimpur Kheri, Siddharthnagar, Maharajganj et Kushinagar. Sources : le jeu de données des fiches signalétiques de district de la National Family Health Survey 5 (2019–2021) (ministère de la Santé et du Bien-être familial / International Institute for Population Sciences) pour la santé, la nutrition et le genre ; les fiches signalétiques de district du Unified District Information System for Education Plus (UDISE+) pour la scolarisation ; le Sample Registration System pour la mortalité maternelle, disponible au seul niveau de l’État. Chaque chiffre de santé provient d’une même vague d’enquête, ce qui permet de comparer les districts sur une base identique. Les violences conjugales ne sont recueillies que dans le module d’État de la National Family Health Survey et sont donc présentées comme le chiffre de l’Uttar Pradesh. Quatre données — le travail des enfants, la tranche de richesse la plus pauvre, ainsi que la mortalité infantile et celle des moins de cinq ans — reposent sur des registres encore en attente de revérification, ce qui est précisé. L’Inde ne publie aucune série officielle par district pour la mortalité infantile ou celle des moins de cinq ans. Chaque donnée indique son district et sa source.',
      eyebrow_process:'Le processus', process_head:'Quand les communautés agissent, les systèmes répondent.', eyebrow_stories:'Histoires de changement',
      cta_donate:'Investir', cta_donate_b:'Soutenez une action menée par les communautés, en capital ou en matériel, en ligne ou hors ligne.', cta_donate_a:'Investir maintenant',
      cta_vol:'Bénévolat', cta_vol_b:'Faites un stage, travaillez à distance ou devenez DEHAT Fellow.', cta_vol_a:'Nous rejoindre',
      cta_partner:'Partenariat', cta_partner_b:'Partenariats d’entreprise, académiques ou institutionnels.', cta_partner_a:'Collaborer',
      pillar_link_work:'Voir les quatre programmes', pillar_link_how:'Voir notre méthode', stories_all:'Lire toutes les histoires',
      work_title:'Des droits, concrétisés au quotidien.',
      chrono_title:'Chaque projet, par ordre chronologique',
      count_label:'projets recensés',
      open_programme:'Ouvrir le programme',
      work_sub:'Quatre programmes, dans l’ordre où ils ont commencé. Chacun ouvre sur sa propre page — pourquoi cette action existe, comment elle est construite, et tous les projets qu’elle a menés, par ordre chronologique, avec le Quoi, le Où, le Comment, le Quand, le Pourquoi et l’Investissement pour chacun.',
      portfolio_total:'Projets rendus publics', portfolio_investment:'Investissement social total',
      portfolio_count:'projets répartis sur quatre programmes',
      filter_year:'Année', filter_state:'État', filter_district:'District', filter_sdg:'Objectif de développement', filter_csr:'Responsabilité sociale des entreprises · Annexe VII', filter_uncrc:'Droit de l’enfant', filter_investor:'Investisseur social', filter_all:'Tous',
      open_details:'Ouvrir la fiche complète', close_details:'Fermer la fiche', phases_label:'Phases',
      annual_label:'Année par année',
      cross_from:'Fait aussi partie de',
      shared_note:'Enveloppe d’investissement social partagée :',
      d_what:'Le changement visé', d_why:'Pourquoi c’était important ici',
      d_how:'Comment communautés et systèmes ont travaillé ensemble', d_impact:'Chiffres d’impact',
      d_investor:'Investisseur social', d_investors:'Investisseurs sociaux', d_investment:'Investissement social',
      m_when:'Quand et statut', m_location:'Où', m_sdg:'Objectifs de développement', m_csr:'Responsabilité sociale des entreprises · Annexe VII', m_uncrc:'Droits de l’enfant', m_law:'Ancrage juridique et politique indien', m_law_none:'Aucun ancrage légal unique n’a été recensé pour ce projet.',
      invest_note:'Publié tel que documenté ; sans consolidation.',
      impact_eyebrow:'Impact', impact_title:'Depuis 2000, aux côtés des communautés qui font valoir leurs droits et travaillent en partenariat avec les services publics pour les concrétiser.',
      impact_sub:'Fondé comme collectif de jeunes en 1989, enregistré en 2000. Ces chiffres montrent une échelle ; ce qu’ils représentent, ce sont des communautés, des agents de terrain et des institutions publiques agissant ensemble.',
      reach_head:'Portée géographique à ce jour', reach_states:'États', reach_districts:'Districts', reach_blocks:'Blocs', reach_villages:'Villages', reach_children:'Enfants et adolescents', reach_farmers:'Femmes agricultrices',
      stories_eyebrow:'Histoires de changement', stories_title:'La réalité, puis la transformation.',
      stories_sub:'Chaque récit s’organise autour de l’un des quatre droits de l’enfant — survie, développement, protection, participation.',
      involved_eyebrow:'S’engager', involved_title:'Concrétiser un pouvoir déjà existant — avec nous.',
      involved_sub:'Que vous donniez une heure, une compétence ou une roupie, vous devenez partie d’un système qui répond.',
      involved_cta_title:'Investir aux côtés des communautés.',
      involved_cta_sub:'Capital ou matériel, en ligne ou hors ligne — chaque roupie alimente une capacité que les communautés conservent après notre départ.',
      donate_now:'Démarrer un partenariat', email_us:'Nous écrire', f_email:'E-mail', f_phone:'Téléphone', f_web:'Site web', f_address:'Adresse',
      nav_finance:'Transparence', nav_answers:'Réponses',
      fin_eyebrow:'Transparence financière', fin_title:'Chaque roupie, consignée.',
      fin_sub:'Comptes audités de façon indépendante — ce que les partenaires d’investissement ont engagé, ce qui est parvenu au terrain, et les contrôles légaux qui encadrent les deux. Chaque chiffre provient d’un bilan signé.',
      fin_stat_received:'Engagé sur 20 ans', fin_stat_fcra:'Contribution étrangère · Foreign Contribution (Regulation) Act', fin_stat_inr:'Contribution nationale · roupies indiennes', fin_stat_funders:'Partenaires d’investissement recensés',
      fin_years_head:'Année par année', fin_years_sub:'Ce qui est entré, ce qui a été dépensé, et qui a signé les comptes. Sélectionnez une année pour voir ses investisseurs sociaux.',
      fin_received:'Engagé', fin_utilised:'Déployé', fin_auditor:'Commissaire aux comptes', fin_bs:'Bilan', fin_surplus:'Excédent', fin_deficit:'Déficit', fin_partial:'Données partielles', fin_compiled:'Compilé',
      fin_funders_head:'Qui investit dans cette action', fin_funders_sub:'Les institutions et particuliers dont le capital fait vivre cette action — des partenaires dans un objectif commun, non de simples donateurs. Les contributions étrangères sont détenues et auditées sur un compte distinct au titre du Foreign Contribution (Regulation) Act, comme l’exige la loi ; les fonds nationaux transitent par la comptabilité en roupies.',
      fin_regime_fcra:'Foreign Contribution (Regulation) Act · Étranger', fin_regime_inr:'Roupie indienne · National',
      fin_funders_cta:'Voir tous les partenaires',
      fin_compliance_head:'Conformité réglementaire', fin_compliance_sub:'DEHAT est une Society enregistrée (Societies Registration Act, 1860). Voici le cycle annuel de reddition de comptes qu’un examinateur attend de voir — et que DEHAT dépose.',
      fin_reg_head:'Enregistrements', fin_cal_head:'Calendrier annuel de dépôt', fin_rules_head:'Ce contre quoi nous rendons compte',
      fin_auditor_trail:'Audité chaque année par un expert-comptable en exercice et signé avec un identifiant unique de document (Unique Document Identification Number). Cinq cabinets différents ont examiné les comptes au cours de la dernière décennie — aucune relation unique de longue durée.',
      fin_due:'Échéance', fin_year_funders:'Partenaires d’investissement de l’année',
      fin_docs_head:'Attestations et documents', fin_docs_sub:'Chaque enregistrement, agrément et validation par un tiers — numérisé à partir du certificat original. Ouvrez n’importe lequel pour consulter le document source.',
      fin_docg_statutory:'Enregistrement et fiscalité', fin_docg_fcra:'Contribution étrangère · Foreign Contribution (Regulation) Act', fin_docg_validation:'Validations et reconnaissances',
      fin_doc_view:'Voir le document', fin_pending_label:'Numérisation auditée au dossier — chiffres en cours de numérisation',
      foot_explore:'Explorer', foot_reach:'Nous contacter', foot_follow:'Suivre l’action',
      foot_desc:'Association pour le développement et l’avancement humain — œuvrant avec les communautés et les systèmes pour que les droits de l’enfant soient reconnus, accessibles et respectés.',
      foot_rights:'© 2026 DEHAT · Fondé comme collectif de jeunes en 1989 · Enregistré en 2000',
    };
    const RU = {
foot_policies:'Политика и меры защиты', foot_cookies:'Настройки файлов cookie',
      nav_home:'Главная', nav_who:'Кто мы', nav_work:'Наша работа', nav_impact:'Результаты', nav_stories:'Истории', nav_media:'Медиа', nav_involved:'Присоединиться',
      donate:'Инвестировать', since:'С 1989 года', org_full:'Ассоциация развития для блага человека',
      language:'Язык', lang_indian:'Индийские языки', lang_global:'Международные (ООН)',
      hero_title_a:'Общество, ориентированное на ребёнка, где каждый ребёнок реализует свои ', hero_title_b:'права', hero_title_c:' — в безопасности, с достоинством, в полной мере.',
      hero_sub:'Мы работаем с сообществами и государственными системами вдоль индо-непальской полосы Тераи, чтобы права детей не просто фиксировались на бумаге, а признавались, были доступны и соблюдались в повседневной жизни.',
      hero_cta1:'Быть рядом с сообществами', hero_cta2:'Узнать, как мы работаем', hero_photo:'ФОТО — Лидеры Детского парламента, деревня Лохра, Бахрайч',
      hero_principle:'Вместе с сообществами и государственными системами — ради каждого ребёнка.',
      stat_children:'Охвачено детей и подростков', stat_invested:'Инвестировано в общественные системы с 2000 года', stat_resources:'Получен доступ к государственным ресурсам', stat_districts:'Округов в 2 штатах',
      stat_hint:'Четыре показателя скрыты. Нажмите, чтобы увидеть.', stat_reveal:'Нажмите, чтобы показать', stat_hide:'Скрыть', stat_reveal_all:'Показать все четыре', stat_hide_all:'Скрыть все', grid_reveal_all:'Показать все четырнадцать', grid_hint:'Четырнадцать показателей скрыты. Нажмите, чтобы увидеть.', bl_drag:'Двигайте опрос вперёд',
      vision:'Видение', mission:'Миссия', theory:'Теория изменений',
      vision_body:'Общество, ориентированное на ребёнка, где каждый ребёнок реализует свои права и живёт в безопасности, достоинстве и полноте.',
      mission_body:'Работать с сообществами и системами, чтобы реализовать уже существующие возможности, обеспечивая признание, доступность и соблюдение прав детей в повседневной жизни.',
      theory_body:'Когда сообщества действуют, а системы согласованно откликаются, выживание, развитие, защита и участие детей обеспечиваются и сохраняются.',
      eyebrow_work:'Чем мы занимаемся', work_head:'Четыре направления, единый согласованный ответ.',
      eyebrow_where:'Где мы работаем', where_head:'23 округа. 2 штата. Одна граница.',
      where_sub:'Мы работаем вдоль восточной индо-непальской границы в штате Уттар-Прадеш и в штате Махараштра — регионах, объединённых общей структурной уязвимостью. Нажмите на округ, чтобы увидеть ситуацию на месте.',
      eyebrow_cycle:'Цикл структурной уязвимости', cycle_head:'Риски не возникают по отдельности.',
      cycle_sub:'Они усиливают друг друга из поколения в поколение — если системы не реагируют вовремя. Строгого порядка не существует: для любого ребёнка ловушка может начаться в любой точке, и каждый риск приближает следующий.',
      cycle_pick:'Нажмите на любой момент, чтобы проследить, как складывается одна жизнь.',
      cycle_note:'Каждый показатель — наихудшее зафиксированное значение среди семи округов индо-непальской полосы Тераи в штате Уттар-Прадеш — Бахрайч, Шравасти, Балрампур, Лакхимпур-Кхери, Сиддхартхнагар, Махараджгандж и Кушинагар. Источники: массив данных district fact-sheet Национального обследования здоровья семьи 5 (NFHS-5, 2019–2021) (Министерство здравоохранения и благосостояния семьи / Международный институт демографических наук) — по здоровью, питанию и гендерным показателям; district fact-sheet Единой окружной информационной системы образования Плюс (UDISE+) — по охвату школьным обучением; Система выборочной регистрации (SRS) — по материнской смертности, доступной только на уровне штата. Все показатели здоровья взяты из одного раунда обследования, поэтому округа сравниваются на равных основаниях. Данные о насилии со стороны супруга собираются только в модуле штата Национального обследования здоровья семьи и приведены как показатель по штату Уттар-Прадеш. Четыре показателя — детский труд, беднейшая имущественная группа, а также младенческая смертность и смертность детей до 5 лет — основаны на административных данных, которые ещё ожидают перепроверки, что здесь и указано. Индия не публикует официальных окружных данных по младенческой смертности или смертности детей до 5 лет. Для каждого показателя указаны его округ и источник.',
      eyebrow_process:'Процесс', process_head:'Когда сообщества действуют, системы реагируют.', eyebrow_stories:'Истории перемен',
      cta_donate:'Инвестировать', cta_donate_b:'Поддержите работу под руководством сообществ капиталом или материалами, онлайн или офлайн.', cta_donate_a:'Инвестировать сейчас',
      cta_vol:'Волонтёрство', cta_vol_b:'Пройдите стажировку, работайте удалённо или станьте DEHAT Fellow.', cta_vol_a:'Присоединиться',
      cta_partner:'Партнёрство', cta_partner_b:'Корпоративное, академическое или институциональное партнёрство.', cta_partner_a:'Сотрудничать',
      pillar_link_work:'Посмотреть все четыре программы', pillar_link_how:'Узнать, как мы работаем', stories_all:'Читать все истории',
      work_title:'Права, реализуемые в повседневной жизни.',
      chrono_title:'Каждый проект в хронологическом порядке',
      count_label:'зарегистрированных проектов',
      open_programme:'Открыть программу',
      work_sub:'Четыре программы — в порядке их появления. Каждая открывается на отдельной странице: почему эта работа существует, как она устроена и какие проекты она вела, в хронологическом порядке, с разделами «Что», «Где», «Как», «Когда», «Почему» и «Инвестиции» для каждого.',
      portfolio_total:'Проектов в открытом доступе', portfolio_investment:'Общий объём социальных инвестиций',
      portfolio_count:'проектов в рамках четырёх программ',
      filter_year:'Год', filter_state:'Штат', filter_district:'Округ', filter_sdg:'Цель развития', filter_csr:'Корпоративная социальная ответственность · Приложение VII', filter_uncrc:'Право ребёнка', filter_investor:'Социальный инвестор', filter_all:'Все',
      open_details:'Открыть полную запись', close_details:'Закрыть запись', phases_label:'Этапы',
      annual_label:'По годам',
      cross_from:'Также часть',
      shared_note:'Общий объём социальных инвестиций:',
      d_what:'Изменение, к которому мы стремились', d_why:'Почему это было важно здесь',
      d_how:'Как сообщества и системы работали вместе', d_impact:'Показатели результата',
      d_investor:'Социальный инвестор', d_investors:'Социальные инвесторы', d_investment:'Социальные инвестиции',
      m_when:'Когда и статус', m_location:'Где', m_sdg:'Цели развития', m_csr:'Корпоративная социальная ответственность · Приложение VII', m_uncrc:'Права ребёнка', m_law:'Опора в индийском законодательстве и политике', m_law_none:'Для этого проекта не зафиксировано отдельного законодательного основания.',
      invest_note:'Публикуется в точности так, как задокументировано; без сведения воедино.',
      impact_eyebrow:'Результаты', impact_title:'С 2000 года — рядом с сообществами, которые заявляют о своих правах и работают в партнёрстве с государственными системами, чтобы их обеспечить.',
      impact_sub:'Основана как молодёжное объединение в 1989 году, зарегистрирована в 2000-м. Эти цифры показывают масштаб; за ними стоят сообщества, полевые сотрудники и государственные учреждения, действующие сообща.',
      reach_head:'Географический охват на сегодня', reach_states:'Штатов', reach_districts:'Округов', reach_blocks:'Блоков', reach_villages:'Деревень', reach_children:'Детей и подростков', reach_farmers:'Женщин-фермеров',
      stories_eyebrow:'Истории перемен', stories_title:'Реальность, а затем перемена.',
      stories_sub:'Каждая история строится вокруг одного из четырёх прав ребёнка — на выживание, развитие, защиту, участие.',
      involved_eyebrow:'Присоединиться', involved_title:'Реализовать уже существующие возможности — вместе с нами.',
      involved_sub:'Дадите ли вы час времени, навык или рупию — вы становитесь частью системы, которая реагирует.',
      involved_cta_title:'Инвестировать вместе с сообществами.',
      involved_cta_sub:'Капитал или материалы, онлайн или офлайн — каждая рупия идёт на потенциал, который остаётся у сообществ после нашего ухода.',
      donate_now:'Начать партнёрство', email_us:'Написать нам', f_email:'Эл. почта', f_phone:'Телефон', f_web:'Сайт', f_address:'Адрес',
      nav_finance:'Прозрачность', nav_answers:'Ответы',
      fin_eyebrow:'Финансовая прозрачность', fin_title:'Каждая рупия — в открытом доступе.',
      fin_sub:'Независимо проверенная отчётность — что обязались предоставить инвестиционные партнёры, что дошло до работы на местах, и какие законодательные проверки стоят за этим. Каждая цифра взята из подписанного баланса.',
      fin_stat_received:'Обязательства за 20 лет', fin_stat_fcra:'Иностранные взносы · Закон о регулировании иностранных взносов (FCRA)', fin_stat_inr:'Внутренние взносы · индийские рупии', fin_stat_funders:'Зарегистрированных инвестиционных партнёров',
      fin_years_head:'По годам', fin_years_sub:'Что поступило, что было потрачено и кто подписал отчётность. Выберите год, чтобы увидеть его социальных инвесторов.',
      fin_received:'Обязательства', fin_utilised:'Использовано', fin_auditor:'Аудитор', fin_bs:'Баланс', fin_surplus:'Профицит', fin_deficit:'Дефицит', fin_partial:'Неполные данные', fin_compiled:'Сведено',
      fin_funders_head:'Кто инвестирует в эту работу', fin_funders_sub:'Учреждения и частные лица, чей капитал обеспечивает эту работу, — партнёры в достижении общего результата, а не доноры в одностороннем порядке. Иностранные взносы хранятся и проверяются на отдельном счёте в рамках Закона о регулировании иностранных взносов (FCRA), как того требует закон; внутренние средства проходят через рупийную отчётность.',
      fin_regime_fcra:'Закон о регулировании иностранных взносов (FCRA) · Иностранные', fin_regime_inr:'Индийская рупия · Внутренние',
      fin_funders_cta:'Посмотреть всех партнёров',
      fin_compliance_head:'Соответствие законодательным требованиям', fin_compliance_sub:'DEHAT — зарегистрированное общество (Закон о регистрации обществ, 1860 год). Ниже — ежегодный цикл отчётности, который проверяющий ожидает увидеть, и который DEHAT подаёт.',
      fin_reg_head:'Регистрации', fin_cal_head:'Ежегодный календарь подачи отчётности', fin_rules_head:'Перед кем мы отчитываемся',
      fin_auditor_trail:'Ежегодно проверяется практикующим дипломированным бухгалтером (Chartered Accountant) и подписывается с уникальным идентификационным номером документа (UDIN). За последнее десятилетие отчётность проверяли пять разных фирм — без единых долгосрочных отношений.',
      fin_due:'Срок подачи', fin_year_funders:'Инвестиционные партнёры этого года',
      fin_docs_head:'Документы и подтверждения', fin_docs_sub:'Каждая регистрация, разрешение и подтверждение третьей стороной — отсканированы с оригинала сертификата. Откройте любой, чтобы прочитать исходный документ.',
      fin_docg_statutory:'Регистрация и налоги', fin_docg_fcra:'Иностранные взносы · Закон о регулировании иностранных взносов (FCRA)', fin_docg_validation:'Подтверждения и признание',
      fin_doc_view:'Просмотреть документ', fin_pending_label:'Проверенный скан имеется в деле — данные оцифровываются',
      foot_explore:'Разделы', foot_reach:'Связаться с нами', foot_follow:'Следить за работой',
      foot_desc:'Ассоциация развития для блага человека — работает с сообществами и системами, чтобы права детей признавались, были доступны и соблюдались.',
      foot_rights:'© 2026 DEHAT · Основана как молодёжное объединение в 1989 году · Зарегистрирована в 2000 году',
    };
    const ES = {
foot_policies:'Políticas y salvaguardas', foot_cookies:'Configuración de cookies',
      nav_home:'Inicio', nav_who:'Quiénes somos', nav_work:'Nuestro trabajo', nav_impact:'Impacto', nav_stories:'Historias', nav_media:'Medios', nav_involved:'Involúcrate',
      donate:'Invertir', since:'Desde 1989', org_full:'Asociación de Desarrollo para el Avance Humano',
      language:'Idioma', lang_indian:'Idiomas de la India', lang_global:'Global (ONU)',
      hero_title_a:'Una sociedad centrada en la infancia donde cada niño hace valer sus ', hero_title_b:'derechos', hero_title_c:' — con seguridad, dignidad y plenitud.',
      hero_sub:'Trabajamos con las comunidades y los sistemas públicos a lo largo del Terai indo-nepalí para que los derechos de la infancia no queden solo por escrito, sino que se reconozcan, se ejerzan y se respeten en la vida cotidiana.',
      hero_cta1:'Estar junto a las comunidades', hero_cta2:'Ver cómo trabajamos', hero_photo:'FOTO — Líderes del Parlamento Infantil, aldea de Lohra, Bahraich',
      hero_principle:'Junto a las comunidades y los sistemas de gobierno, por cada niño.',
      stat_children:'Niños, niñas y adolescentes alcanzados', stat_invested:'Invertido en sistemas comunitarios desde 2000', stat_resources:'Recursos públicos obtenidos', stat_districts:'Distritos en 2 estados',
      stat_hint:'Cuatro cifras, ocultas. Toca una para verla.', stat_reveal:'Toca para revelar', stat_hide:'Ocultar', stat_reveal_all:'Revelar las cuatro', stat_hide_all:'Ocultar todas', grid_reveal_all:'Revelar las catorce', grid_hint:'Catorce cifras, ocultas. Toca una para verla.', bl_drag:'Arrastra la encuesta',
      vision:'Visión', mission:'Misión', theory:'Teoría del cambio',
      vision_body:'Una sociedad centrada en la infancia donde cada niño hace valer sus derechos y lleva una vida segura, digna y plena.',
      mission_body:'Trabajar con las comunidades y los sistemas para hacer realidad un poder ya existente, garantizando que los derechos de la infancia se reconozcan, se ejerzan y se respeten en la vida cotidiana.',
      theory_body:'Cuando las comunidades actúan y los sistemas responden de forma convergente, la supervivencia, el desarrollo, la protección y la participación de la infancia se hacen realidad y se sostienen.',
      eyebrow_work:'Qué hacemos', work_head:'Cuatro frentes, una respuesta convergente.',
      eyebrow_where:'Dónde trabajamos', where_head:'23 distritos. 2 estados. Una frontera.',
      where_sub:'Trabajamos a lo largo de la frontera oriental indo-nepalí, en Uttar Pradesh y en Maharashtra — regiones unidas por una misma vulnerabilidad estructural. Toca un distrito para ver la realidad sobre el terreno.',
      eyebrow_cycle:'El ciclo de la vulnerabilidad estructural', cycle_head:'Los riesgos no se dan de forma aislada.',
      cycle_sub:'Se refuerzan entre sí de generación en generación — a menos que los sistemas respondan a tiempo. No hay un orden fijo: para cualquier niño, la trampa puede comenzar en cualquier punto, y cada riesgo acerca al siguiente.',
      cycle_pick:'Toca cualquier momento para seguir cómo se moldea una vida.',
      cycle_note:'Cada cifra es el peor valor registrado entre siete distritos de la franja del Terai indo-nepalí de Uttar Pradesh — Bahraich, Shravasti, Balrampur, Lakhimpur Kheri, Siddharthnagar, Maharajganj y Kushinagar. Fuentes: el conjunto de datos de fichas técnicas distritales de la Encuesta Nacional de Salud Familiar 5 (NFHS-5, 2019–2021) (Ministerio de Salud y Bienestar Familiar / International Institute for Population Sciences) para salud, nutrición y género; las fichas técnicas distritales del Sistema Unificado de Información Distrital para la Educación Plus (UDISE+) para escolarización; el Sistema de Registro por Muestreo (SRS) para la mortalidad materna, disponible solo a nivel estatal. Todas las cifras de salud provienen de una misma ronda de encuesta, de modo que los distritos se comparan en igualdad de condiciones. La violencia conyugal se recoge únicamente en el módulo estatal de la Encuesta Nacional de Salud Familiar y se muestra como la cifra de Uttar Pradesh. Cuatro datos — el trabajo infantil, el tramo de riqueza más pobre, y la mortalidad infantil y en menores de 5 años — se basan en registros administrativos aún pendientes de reverificación, y así se indica. India no publica una serie oficial por distrito para la mortalidad infantil ni para la de menores de 5 años. Cada dato indica su distrito y su fuente.',
      eyebrow_process:'El proceso', process_head:'Cuando las comunidades actúan, los sistemas responden.', eyebrow_stories:'Historias de cambio',
      cta_donate:'Invertir', cta_donate_b:'Respalda el trabajo liderado por las comunidades con capital o materiales, en línea o fuera de línea.', cta_donate_a:'Invertir ahora',
      cta_vol:'Voluntariado', cta_vol_b:'Haz una pasantía, trabaja de forma virtual o conviértete en DEHAT Fellow.', cta_vol_a:'Únete',
      cta_partner:'Alianza', cta_partner_b:'Alianzas corporativas, académicas o institucionales.', cta_partner_a:'Colaborar',
      pillar_link_work:'Ver los cuatro programas', pillar_link_how:'Ver cómo trabajamos', stories_all:'Leer todas las historias',
      work_title:'Derechos, hechos realidad en la vida cotidiana.',
      chrono_title:'Cada proyecto, en orden cronológico',
      count_label:'proyectos registrados',
      open_programme:'Abrir programa',
      work_sub:'Cuatro programas, en el orden en que comenzaron. Cada uno se despliega en su propia página — por qué existe el trabajo, cómo está construido, y cada proyecto que ha llevado adelante, en orden cronológico, con el Qué, el Dónde, el Cómo, el Cuándo, el Porqué y la Inversión detrás de cada uno.',
      portfolio_total:'Proyectos de registro público', portfolio_investment:'Inversión social total',
      portfolio_count:'proyectos en cuatro programas',
      filter_year:'Año', filter_state:'Estado', filter_district:'Distrito', filter_sdg:'Objetivo de Desarrollo', filter_csr:'Responsabilidad Social Corporativa · Anexo VII', filter_uncrc:'Derecho del niño', filter_investor:'Inversor social', filter_all:'Todos',
      open_details:'Abrir el registro completo', close_details:'Cerrar el registro', phases_label:'Fases',
      annual_label:'Año por año',
      cross_from:'También forma parte de',
      shared_note:'Monto compartido de inversión social:',
      d_what:'El cambio que nos propusimos lograr', d_why:'Por qué importaba aquí',
      d_how:'Cómo trabajaron juntos las comunidades y los sistemas', d_impact:'Cifras de impacto',
      d_investor:'Inversor social', d_investors:'Inversores sociales', d_investment:'Inversión social',
      m_when:'Cuándo y estado', m_location:'Dónde', m_sdg:'Objetivos de desarrollo', m_csr:'Responsabilidad social corporativa · Anexo VII', m_uncrc:'Derechos del niño', m_law:'Fundamento legal y normativo indio', m_law_none:'No se registra un fundamento legal único para este proyecto.',
      invest_note:'Publicado tal como fue documentado; sin consolidar.',
      impact_eyebrow:'Impacto', impact_title:'Desde 2000, acompañando a las comunidades mientras reclaman sus derechos y trabajan junto a los sistemas públicos para hacerlos realidad.',
      impact_sub:'Nació como colectivo juvenil en 1989 y se registró en 2000. Estas cifras muestran escala; lo que representan son comunidades, trabajadores de campo e instituciones públicas actuando en conjunto.',
      reach_head:'Alcance geográfico hasta la fecha', reach_states:'Estados', reach_districts:'Distritos', reach_blocks:'Bloques', reach_villages:'Aldeas', reach_children:'Niños, niñas y adolescentes', reach_farmers:'Mujeres agricultoras',
      stories_eyebrow:'Historias de cambio', stories_title:'La realidad, y luego la transformación.',
      stories_sub:'Cada historia se organiza en torno a uno de los cuatro derechos de la infancia — supervivencia, desarrollo, protección, participación.',
      involved_eyebrow:'Involúcrate', involved_title:'Hacer realidad un poder ya existente — con nosotros.',
      involved_sub:'Ya sea que dones una hora, una habilidad o una rupia, pasas a formar parte de un sistema que responde.',
      involved_cta_title:'Invertir junto a las comunidades.',
      involved_cta_sub:'Capital o materiales, en línea o fuera de línea — cada rupia se convierte en capacidad que las comunidades conservan después de que nos vamos.',
      donate_now:'Iniciar una alianza', email_us:'Escríbenos', f_email:'Correo electrónico', f_phone:'Teléfono', f_web:'Web', f_address:'Dirección',
      nav_finance:'Transparencia', nav_answers:'Respuestas',
      fin_eyebrow:'Transparencia financiera', fin_title:'Cada rupia, registrada.',
      fin_sub:'Cuentas auditadas de forma independiente — lo que comprometieron los socios inversores, lo que llegó al trabajo, y los controles legales detrás de ambos. Cada cifra proviene de un balance firmado.',
      fin_stat_received:'Comprometido en 20 años', fin_stat_fcra:'Contribución extranjera · Ley de Regulación de Contribuciones Extranjeras (FCRA)', fin_stat_inr:'Contribución nacional · rupias indias', fin_stat_funders:'Socios inversores registrados',
      fin_years_head:'Año por año', fin_years_sub:'Qué ingresó, qué se gastó, y quién firmó las cuentas. Selecciona un año para ver sus inversores sociales.',
      fin_received:'Comprometido', fin_utilised:'Desplegado', fin_auditor:'Auditor', fin_bs:'Balance', fin_surplus:'Superávit', fin_deficit:'Déficit', fin_partial:'Datos parciales', fin_compiled:'Compilado',
      fin_funders_head:'Quién invierte en este trabajo', fin_funders_sub:'Las instituciones y personas cuyo capital sostiene este trabajo — socios en un resultado compartido, no donantes de un solo sentido. Las contribuciones extranjeras se mantienen y auditan en una cuenta separada bajo la Ley de Regulación de Contribuciones Extranjeras (FCRA), como exige la ley; los fondos nacionales se gestionan en los libros en rupias.',
      fin_regime_fcra:'Ley de Regulación de Contribuciones Extranjeras (FCRA) · Extranjero', fin_regime_inr:'Rupia india · Nacional',
      fin_funders_cta:'Ver todos los socios',
      fin_compliance_head:'Cumplimiento normativo', fin_compliance_sub:'DEHAT es una Society registrada (Societies Registration Act, 1860). A continuación, el ciclo anual de rendición de cuentas que un revisor espera encontrar — y que DEHAT presenta.',
      fin_reg_head:'Registros', fin_cal_head:'Calendario anual de presentaciones', fin_rules_head:'Ante qué rendimos cuentas',
      fin_auditor_trail:'Auditado cada año por un contador público en ejercicio (Chartered Accountant) y firmado con un Número Único de Identificación de Documento (UDIN). Cinco firmas distintas han examinado las cuentas en la última década — sin una relación única de largo plazo.',
      fin_due:'Vencimiento', fin_year_funders:'Socios inversores de este año',
      fin_docs_head:'Credenciales y documentos', fin_docs_sub:'Cada registro, aprobación y validación de terceros — escaneado a partir del certificado original. Abre cualquiera para leer el documento fuente.',
      fin_docg_statutory:'Registro e impuestos', fin_docg_fcra:'Contribución extranjera · Ley de Regulación de Contribuciones Extranjeras (FCRA)', fin_docg_validation:'Validaciones y reconocimientos',
      fin_doc_view:'Ver documento', fin_pending_label:'Escaneo auditado en archivo — cifras en proceso de digitalización',
      foot_explore:'Explorar', foot_reach:'Contáctanos', foot_follow:'Seguir el trabajo',
      foot_desc:'Asociación de Desarrollo para el Avance Humano — trabajando con comunidades y sistemas para que los derechos de la infancia se reconozcan, se ejerzan y se respeten.',
      foot_rights:'© 2026 DEHAT · Nació como colectivo juvenil en 1989 · Registrado en 2000',
    };
    const AR = {
foot_policies:'السياسات وإجراءات الحماية', foot_cookies:'إعدادات ملفات تعريف الارتباط',
      nav_home:'الرئيسية', nav_who:'من نحن', nav_work:'عملنا', nav_impact:'الأثر', nav_stories:'القصص', nav_media:'الإعلام', nav_involved:'شارك معنا',
      donate:'استثمر', since:'منذ عام 1989', org_full:'الرابطة التنموية للنهوض بالإنسان',
      language:'اللغة', lang_indian:'اللغات الهندية', lang_global:'عالمية (الأمم المتحدة)',
      hero_title_a:'مجتمع محوره الطفل، يحقق فيه كل طفل ', hero_title_b:'حقوقه', hero_title_c:' — في أمان وكرامة واكتمال.',
      hero_sub:'نعمل مع المجتمعات المحلية والأنظمة العامة على امتداد أراضي التيراي الحدودية بين الهند ونيبال، حتى لا تبقى حقوق الأطفال حبرًا على ورق، بل تصبح معترفًا بها ومتاحة ومصانة في الحياة اليومية.',
      hero_cta1:'قف إلى جانب المجتمعات', hero_cta2:'شاهد كيف نعمل', hero_photo:'صورة — قادة برلمان الأطفال، قرية لوهرا، بهرايتش',
      hero_principle:'بالتعاون مع المجتمعات والأنظمة الحكومية، من أجل كل طفل.',
      stat_children:'الأطفال والمراهقون الذين تم الوصول إليهم', stat_invested:'المستثمَر في الأنظمة المجتمعية منذ عام 2000', stat_resources:'الموارد العامة التي تم الحصول عليها', stat_districts:'مقاطعات في ولايتين',
      stat_hint:'أربعة أرقام مخفية. انقر على أحدها لعرضه.', stat_reveal:'انقر للكشف', stat_hide:'إخفاء', stat_reveal_all:'كشف الأرقام الأربعة', stat_hide_all:'إخفاء الكل', grid_reveal_all:'كشف الأرقام الأربعة عشر', grid_hint:'أربعة عشر رقمًا مخفيًا. انقر على أحدها لعرضه.', bl_drag:'اسحب لعرض المسح',
      vision:'الرؤية', mission:'الرسالة', theory:'نظرية التغيير',
      vision_body:'مجتمع محوره الطفل، يحقق فيه كل طفل حقوقه ويعيش حياة آمنة وكريمة ومُرضية.',
      mission_body:'العمل مع المجتمعات المحلية والأنظمة لتفعيل القوة القائمة فعلًا، بما يضمن أن تكون حقوق الأطفال معترفًا بها ومتاحة ومصانة في الحياة اليومية.',
      theory_body:'حين تتحرك المجتمعات وتستجيب الأنظمة في تقارب فيما بينها، يتحقق بقاء الأطفال ونموهم وحمايتهم ومشاركتهم، ويستمر ذلك.',
      eyebrow_work:'ما نقوم به', work_head:'أربع جبهات، استجابة واحدة متقاربة.',
      eyebrow_where:'أين نعمل', where_head:'23 مقاطعة. ولايتان. حدود واحدة.',
      where_sub:'نعمل على امتداد الحدود الشرقية بين الهند ونيبال في ولاية أوتار برديش وفي ولاية ماهاراشترا — مناطق تجمعها هشاشة بنيوية مشتركة. انقر على مقاطعة لمشاهدة الواقع الميداني.',
      eyebrow_cycle:'دورة الهشاشة البنيوية', cycle_head:'المخاطر لا تحدث بمعزل عن بعضها.',
      cycle_sub:'إنها تعزز بعضها البعض عبر الأجيال — ما لم تستجب الأنظمة في الوقت المناسب. لا يوجد ترتيب ثابت: فبالنسبة لأي طفل، يمكن أن يبدأ الفخ عند أي نقطة، وكل خطر يقرّب الخطر التالي.',
      cycle_pick:'انقر على أي لحظة لتتبع كيف تتشكل حياة واحدة.',
      cycle_note:'كل رقم هو أسوأ قيمة مسجَّلة عبر سبع مقاطعات من نطاق أراضي التيراي الحدودية بين الهند ونيبال في ولاية أوتار برديش — بهرايتش، وشرافاستي، وبالرامبور، ولاكيمبور خيري، وسدهارتناغار، ومهاراج غانج، وكوشي ناغار. المصادر: مجموعة بيانات صحائف الحقائق على مستوى المقاطعات من المسح الوطني لصحة الأسرة رقم 5 (2019–2021) (وزارة الصحة ورعاية الأسرة / المعهد الدولي لعلوم السكان) لبيانات الصحة والتغذية والنوع الاجتماعي؛ وصحائف الحقائق على مستوى المقاطعات من النظام الموحد لمعلومات التعليم على مستوى المقاطعات لبيانات التعليم؛ ونظام التسجيل بالعينة لوفيات الأمهات، وهو معطى على مستوى الولاية. يُستمد كل رقم صحي من جولة مسح واحدة، بحيث تتم مقارنة المقاطعات على أساس واحد. تُجمع بيانات عنف الزوج فقط ضمن وحدة الولاية في المسح الوطني لصحة الأسرة، وتُعرض كرقم خاص بولاية أوتار برديش. أربع لحظات — عمالة الأطفال، والشريحة الأفقر من حيث الثروة، ووفيات الرضع ووفيات الأطفال دون الخامسة — تستند إلى سجلات لا تزال بانتظار إعادة التحقق، وهذا موضح صراحة. لا تنشر الهند سلسلة رسمية على مستوى المقاطعات لوفيات الرضع أو وفيات الأطفال دون الخامسة. تذكر كل لحظة مقاطعتها ومصدرها.',
      eyebrow_process:'العملية', process_head:'حين تتحرك المجتمعات، تستجيب الأنظمة.', eyebrow_stories:'قصص التغيير',
      cta_donate:'استثمر', cta_donate_b:'ادعم العمل الذي تقوده المجتمعات المحلية برأس مال أو بمواد عينية، عبر الإنترنت أو خارجه.', cta_donate_a:'استثمر الآن',
      cta_vol:'تطوّع', cta_vol_b:'تدرّب، أو اعمل عن بُعد، أو كن أحد زملاء DEHAT.', cta_vol_a:'انضم إلينا',
      cta_partner:'شارك', cta_partner_b:'شراكات مع الشركات، أو الأوساط الأكاديمية، أو المؤسسات.', cta_partner_a:'تعاون معنا',
      pillar_link_work:'اطّلع على البرامج الأربعة', pillar_link_how:'شاهد كيف نعمل', stories_all:'اقرأ كل القصص',
      work_title:'حقوق تتحقق في الحياة اليومية.',
      chrono_title:'كل مشروع، بالترتيب الزمني',
      count_label:'مشروعات في السجل',
      open_programme:'افتح البرنامج',
      work_sub:'أربعة برامج، بترتيب بدايتها. يفتح كل برنامج على صفحته الخاصة — لماذا وُجد هذا العمل، وكيف بُني، وكل مشروع حمله، بالترتيب الزمني، مع بيان الماذا والأين والكيف والمتى والسبب والاستثمار وراء كل مشروع.',
      portfolio_total:'مشروعات في السجل العام', portfolio_investment:'إجمالي الاستثمار الاجتماعي',
      portfolio_count:'مشروعات ضمن أربعة برامج',
      filter_year:'السنة', filter_state:'الولاية', filter_district:'المقاطعة', filter_sdg:'هدف التنمية', filter_csr:'المسؤولية الاجتماعية للشركات · الجدول السابع', filter_uncrc:'حق الطفل', filter_investor:'المستثمر الاجتماعي', filter_all:'الكل',
      open_details:'افتح السجل الكامل', close_details:'أغلق السجل', phases_label:'المراحل',
      annual_label:'عامًا بعد عام',
      cross_from:'جزء أيضًا من',
      shared_note:'مغلف الاستثمار الاجتماعي المشترك:',
      d_what:'التغيير الذي سعينا إلى تحقيقه', d_why:'لماذا كان هذا مهمًا هنا',
      d_how:'كيف عملت المجتمعات والأنظمة معًا', d_impact:'أرقام الأثر',
      d_investor:'المستثمر الاجتماعي', d_investors:'المستثمرون الاجتماعيون', d_investment:'الاستثمار الاجتماعي',
      m_when:'متى والحالة', m_location:'أين', m_sdg:'أهداف التنمية', m_csr:'المسؤولية الاجتماعية للشركات · الجدول السابع', m_uncrc:'حقوق الطفل', m_law:'السند القانوني والسياساتي الهندي', m_law_none:'لا يوجد سند قانوني واحد مسجَّل لهذا المشروع.',
      invest_note:'منشور تمامًا كما هو موثَّق؛ غير مجمَّع.',
      impact_eyebrow:'الأثر', impact_title:'منذ عام 2000، نرافق المجتمعات المحلية وهي تطالب بحقوقها وتعمل بالشراكة مع الأنظمة العامة لتحقيقها.',
      impact_sub:'بدأت كتجمّع شبابي عام 1989، وسُجّلت رسميًا عام 2000. تُظهر هذه الأرقام حجم العمل؛ وما تمثله فعليًا هو المجتمعات المحلية والعاملون الميدانيون والمؤسسات العامة وهم يعملون معًا.',
      reach_head:'الامتداد الجغرافي حتى الآن', reach_states:'الولايات', reach_districts:'المقاطعات', reach_blocks:'الوحدات الإدارية (البلوكات)', reach_villages:'القرى', reach_children:'الأطفال والمراهقون', reach_farmers:'المزارعات',
      stories_eyebrow:'قصص التغيير', stories_title:'الواقع، ثم التحوّل.',
      stories_sub:'تدور كل قصة حالة حول أحد حقوق الطفل الأربعة — البقاء، والنمو، والحماية، والمشاركة.',
      involved_eyebrow:'شارك معنا', involved_title:'فعّل القوة القائمة فعلًا — معنا.',
      involved_sub:'سواء منحت ساعة من وقتك، أو مهارة، أو روبية واحدة، فأنت تصبح جزءًا من نظام يستجيب.',
      involved_cta_title:'استثمر إلى جانب المجتمعات.',
      involved_cta_sub:'رأس مال أو مواد عينية، عبر الإنترنت أو خارجه — كل روبية تذهب إلى قدرات تحتفظ بها المجتمعات بعد رحيلنا.',
      donate_now:'ابدأ شراكة', email_us:'راسلنا عبر البريد الإلكتروني', f_email:'البريد الإلكتروني', f_phone:'الهاتف', f_web:'الموقع الإلكتروني', f_address:'العنوان',
      nav_finance:'الشفافية', nav_answers:'الأجوبة',
      fin_eyebrow:'الشفافية المالية', fin_title:'كل روبية، في السجل.',
      fin_sub:'حسابات مدققة بشكل مستقل — ما التزم به الشركاء المستثمرون، وما وصل فعليًا إلى العمل الميداني، والضوابط القانونية وراء كليهما. كل رقم مأخوذ من ميزانية عمومية موقّعة.',
      fin_stat_received:'الملتزم به على مدى 20 عامًا', fin_stat_fcra:'المساهمات الأجنبية · قانون تنظيم المساهمات الأجنبية', fin_stat_inr:'المساهمات المحلية · الروبية الهندية', fin_stat_funders:'الشركاء المستثمرون المسجّلون',
      fin_years_head:'عامًا بعد عام', fin_years_sub:'ما ورد من أموال، وما أُنفق، ومن وقّع الحسابات. اختر سنة لعرض مستثمريها الاجتماعيين.',
      fin_received:'ملتزم به', fin_utilised:'مُستخدَم', fin_auditor:'المدقق', fin_bs:'الميزانية العمومية', fin_surplus:'فائض', fin_deficit:'عجز', fin_partial:'بيانات جزئية', fin_compiled:'مجمَّعة',
      fin_funders_head:'من يستثمر في هذا العمل', fin_funders_sub:'المؤسسات والأفراد الذين تُموّل رؤوس أموالهم هذا العمل — شركاء في نتيجة مشتركة، لا مانحون في اتجاه واحد. تُحفظ المساهمات الأجنبية وتُدقَّق في حساب منفصل بموجب قانون تنظيم المساهمات الأجنبية، كما يقتضي القانون؛ بينما تمر الأموال المحلية عبر دفاتر الروبية.',
      fin_regime_fcra:'قانون تنظيم المساهمات الأجنبية · أجنبي', fin_regime_inr:'الروبية الهندية · محلي',
      fin_funders_cta:'اطّلع على كل شريك',
      fin_compliance_head:'الامتثال القانوني', fin_compliance_sub:'DEHAT جمعية مسجّلة (بموجب قانون تسجيل الجمعيات لعام 1860). وفيما يلي دورة المساءلة السنوية التي يتوقع أي مراجع رؤيتها — والتي تودعها DEHAT فعلًا.',
      fin_reg_head:'التسجيلات', fin_cal_head:'التقويم السنوي لتقديم الملفات', fin_rules_head:'الجهات والمعايير التي نُقدّم تقاريرنا إليها',
      fin_auditor_trail:'تُدقَّق الحسابات سنويًا من قبل محاسب قانوني ممارس، وتُوقَّع برقم تعريف وثيقة فريد. خمس شركات مختلفة راجعت الدفاتر خلال العقد الماضي — دون أي علاقة طويلة الأمد مع جهة واحدة.',
      fin_due:'مستحق', fin_year_funders:'الشركاء المستثمرون لهذا العام',
      fin_docs_head:'الاعتمادات والوثائق', fin_docs_sub:'كل تسجيل وموافقة وتصديق من جهة خارجية — ممسوح ضوئيًا من الشهادة الأصلية. افتح أيًا منها لقراءة الوثيقة المصدرية.',
      fin_docg_statutory:'التسجيل والضرائب', fin_docg_fcra:'المساهمات الأجنبية · قانون تنظيم المساهمات الأجنبية', fin_docg_validation:'التصديقات والاعتراف',
      fin_doc_view:'عرض الوثيقة', fin_pending_label:'نسخة مدققة ممسوحة ضوئيًا مودعة في الملف — يجري رقمنة الأرقام',
      foot_explore:'استكشف', foot_reach:'تواصل معنا', foot_follow:'تابع العمل',
      foot_desc:'الرابطة التنموية للنهوض بالإنسان — تعمل مع المجتمعات المحلية والأنظمة كي تكون حقوق الأطفال معترفًا بها ومتاحة ومصانة.',
      foot_rights:'© 2026 DEHAT · بدأت كتجمّع شبابي عام 1989 · سُجّلت عام 2000',
    };
    const UR = {
foot_policies:'پالیسیاں اور تحفظاتی اقدامات', foot_cookies:'کوکی ترتیبات',
      nav_home:'مرکزی صفحہ', nav_who:'ہم کون ہیں', nav_work:'ہمارا کام', nav_impact:'اثر', nav_stories:'کہانیاں', nav_media:'میڈیا', nav_involved:'ہمارے ساتھ جڑیں',
      donate:'سرمایہ کاری کریں', since:'سنہ 1989 سے', org_full:'بشری ترقی کے لیے ترقیاتی انجمن',
      language:'زبان', lang_indian:'ہندوستانی زبانیں', lang_global:'عالمی (اقوامِ متحدہ)',
      hero_title_a:'ایک بچہ مرکوز معاشرہ جہاں ہر بچہ اپنے ', hero_title_b:'حقوق', hero_title_c:' حاصل کرے — محفوظ، باوقار اور مکمل۔',
      hero_sub:'ہم بھارت-نیپال تراعی خطے میں برادریوں اور سرکاری نظاموں کے ساتھ کام کرتے ہیں تاکہ بچوں کے حقوق محض کاغذ پر درج نہ رہیں بلکہ روزمرہ زندگی میں تسلیم کیے جائیں، حاصل ہوں اور برقرار رکھے جائیں۔',
      hero_cta1:'برادریوں کے ساتھ کھڑے ہوں', hero_cta2:'دیکھیں ہم کیسے کام کرتے ہیں', hero_photo:'تصویر — چائلڈ پارلیمنٹ رہنما، لوہرا گاؤں، بہرائچ',
      hero_principle:'برادریوں اور حکومتی نظاموں کے ساتھ مل کر، ہر بچے کے لیے۔',
      stat_children:'پہنچائے گئے بچے اور نوعمر', stat_invested:'2000 سے کمیونٹی نظاموں میں سرمایہ کاری', stat_resources:'حاصل شدہ سرکاری وسائل', stat_districts:'2 ریاستوں کے اضلاع',
      stat_hint:'چار اعداد، پوشیدہ۔ دیکھنے کے لیے کسی ایک پر تھپتھپائیں۔', stat_reveal:'دیکھنے کے لیے تھپتھپائیں', stat_hide:'چھپائیں', stat_reveal_all:'چاروں دکھائیں', stat_hide_all:'سب چھپائیں', grid_reveal_all:'چودہوں دکھائیں', grid_hint:'چودہ اعداد، پوشیدہ۔ دیکھنے کے لیے کسی ایک پر تھپتھپائیں۔', bl_drag:'سروے کو آگے کھینچیں',
      vision:'وژن', mission:'مشن', theory:'تبدیلی کا نظریہ',
      vision_body:'ایک بچہ مرکوز معاشرہ جہاں ہر بچہ اپنے حقوق حاصل کرے اور محفوظ، باوقار اور بھرپور زندگی گزارے۔',
      mission_body:'برادریوں اور نظاموں کے ساتھ مل کر موجودہ قوت کو بروئے کار لانا، تاکہ بچوں کے حقوق روزمرہ زندگی میں تسلیم کیے جائیں، حاصل ہوں اور برقرار رکھے جائیں۔',
      theory_body:'جب برادریاں عمل کرتی ہیں اور نظام باہمی ہم آہنگی کے ساتھ جواب دیتے ہیں، تو بچوں کی بقا، نشوونما، تحفظ اور شرکت حاصل ہوتی اور برقرار رہتی ہے۔',
      eyebrow_work:'ہم کیا کرتے ہیں', work_head:'چار محاذ، ایک مشترکہ ردعمل۔',
      eyebrow_where:'ہم کہاں کام کرتے ہیں', where_head:'23 اضلاع۔ 2 ریاستیں۔ ایک سرحد۔',
      where_sub:'ہم اتر پردیش اور مہاراشٹر میں بھارت-نیپال کی مشرقی سرحد کے ساتھ کام کرتے ہیں — ایسے علاقے جو مشترکہ ساختیاتی کمزوری سے جڑے ہیں۔ زمینی حقیقت دیکھنے کے لیے کسی ضلع پر تھپتھپائیں۔',
      eyebrow_cycle:'ساختیاتی کمزوری کا چکر', cycle_head:'خطرات تنہا پیش نہیں آتے۔',
      cycle_sub:'یہ نسل در نسل ایک دوسرے کو تقویت دیتے ہیں — جب تک نظام بروقت جواب نہ دیں۔ کوئی مقررہ ترتیب نہیں: کسی بھی بچے کے لیے یہ جال کسی بھی نقطے سے شروع ہو سکتا ہے، اور ہر خطرہ اگلے خطرے کو مزید قریب کھینچ لاتا ہے۔',
      cycle_pick:'یہ دیکھنے کے لیے کہ ایک زندگی کیسے تشکیل پاتی ہے، کسی بھی لمحے پر تھپتھپائیں۔',
      cycle_note:'ہر عدد اتر پردیش کی بھارت-نیپال تراعی پٹی کے سات اضلاع — بہرائچ، شراوستی، بلرام پور، لکھیم پور کھیری، سدھارتھ نگر، مہاراج گنج اور کوشی نگر — میں درج بدترین ریکارڈ شدہ قدر ہے۔ ذرائع: صحت، غذائیت اور صنف کے لیے قومی خاندانی صحت سروے 5 (2019–21) کا ضلعی حقائق نامہ ڈیٹا سیٹ (وزارتِ صحت و بہبودِ خاندان / بین الاقوامی ادارہ برائے آبادیاتی علوم)؛ تعلیم کے لیے یکجا ضلعی تعلیمی معلوماتی نظام پلس کے ضلعی حقائق نامے؛ اور زچگی سے اموات کے لیے نمونہ رجسٹریشن نظام، جو ریاستی سطح کا ہے۔ ہر صحتی عدد ایک ہی سروے دور سے لیا گیا ہے، تاکہ اضلاع کا موازنہ یکساں بنیاد پر ہو۔ ازدواجی تشدد صرف قومی خاندانی صحت سروے کے ریاستی ماڈیول میں درج ہوتا ہے اور یہاں اتر پردیش کے عدد کے طور پر دکھایا گیا ہے۔ چار لمحے — بچہ مزدوری، غریب ترین طبقہ، اور شیرخوار و زیرِ 5 سال اموات — ایسے ریکارڈز پر مبنی ہیں جو ابھی دوبارہ تصدیق کے منتظر ہیں، اور یہ واضح طور پر بتایا گیا ہے۔ بھارت شیرخوار یا زیرِ 5 سال اموات کے لیے کوئی سرکاری ضلعی سلسلہ شائع نہیں کرتا۔ ہر لمحہ اپنا ضلع اور ماخذ بتاتا ہے۔',
      eyebrow_process:'عمل کا طریقہ کار', process_head:'جب برادریاں عمل کرتی ہیں، نظام جواب دیتے ہیں۔', eyebrow_stories:'تبدیلی کی کہانیاں',
      cta_donate:'سرمایہ کاری کریں', cta_donate_b:'برادری کی قیادت میں ہونے والے کام کی مالی یا جنسی مدد کریں، آن لائن یا آف لائن۔', cta_donate_a:'ابھی سرمایہ کاری کریں',
      cta_vol:'رضاکارانہ خدمت', cta_vol_b:'انٹرن شپ کریں، ورچوئل کام کریں، یا DEHAT فیلو بنیں۔', cta_vol_a:'ہمارے ساتھ جڑیں',
      cta_partner:'شراکت', cta_partner_b:'کارپوریٹ، تعلیمی یا اداراتی شراکتیں۔', cta_partner_a:'تعاون کریں',
      pillar_link_work:'چاروں پروگرام دیکھیں', pillar_link_how:'دیکھیں ہم کیسے کام کرتے ہیں', stories_all:'ہر کہانی پڑھیں',
      work_title:'حقوق، روزمرہ زندگی میں حاصل۔',
      chrono_title:'ہر منصوبہ، تاریخ وار ترتیب میں',
      count_label:'درج شدہ منصوبے',
      open_programme:'پروگرام کھولیں',
      work_sub:'چار پروگرام، اُس ترتیب میں جس میں وہ شروع ہوئے۔ ہر ایک اپنے صفحے پر کھلتا ہے — یہ کام کیوں موجود ہے، یہ کیسے تعمیر ہوا، اور اس نے کون کون سے منصوبے اٹھائے، تاریخ وار ترتیب میں، ہر ایک کے پیچھے کیا، کہاں، کیسے، کب، کیوں اور سرمایہ کاری کے ساتھ۔',
      portfolio_total:'عوامی ریکارڈ پر موجود منصوبے', portfolio_investment:'مجموعی سماجی سرمایہ کاری',
      portfolio_count:'چار پروگراموں کے تحت منصوبے',
      filter_year:'سال', filter_state:'ریاست', filter_district:'ضلع', filter_sdg:'ترقیاتی ہدف', filter_csr:'کارپوریٹ سماجی ذمہ داری · شیڈول VII', filter_uncrc:'بچے کا حق', filter_investor:'سماجی سرمایہ کار', filter_all:'تمام',
      open_details:'مکمل ریکارڈ کھولیں', close_details:'ریکارڈ بند کریں', phases_label:'مراحل',
      annual_label:'سال بہ سال',
      cross_from:'اس کا حصہ بھی',
      shared_note:'مشترکہ سماجی سرمایہ کاری کا دائرہ:',
      d_what:'وہ تبدیلی جو ہم نے کرنی چاہی', d_why:'یہاں یہ کیوں اہم تھا',
      d_how:'برادریوں اور نظاموں نے مل کر کیسے کام کیا', d_impact:'اثر کے اعداد',
      d_investor:'سماجی سرمایہ کار', d_investors:'سماجی سرمایہ کاران', d_investment:'سماجی سرمایہ کاری',
      m_when:'کب اور حیثیت', m_location:'کہاں', m_sdg:'ترقیاتی اہداف', m_csr:'کارپوریٹ سماجی ذمہ داری · شیڈول VII', m_uncrc:'بچے کے حقوق', m_law:'بھارتی قانون اور پالیسی کی بنیاد', m_law_none:'اس منصوبے کے لیے کوئی واحد قانونی بنیاد درج نہیں۔',
      invest_note:'بالکل ویسے ہی شائع کیا گیا ہے جیسے دستاویز میں درج ہے؛ یکجا نہیں کیا گیا۔',
      impact_eyebrow:'اثر', impact_title:'2000 سے، برادریوں کے ساتھ، جب وہ اپنے حقوق کا مطالبہ کرتی اور سرکاری نظاموں کے ساتھ شراکت میں انہیں حاصل کرنے کے لیے کام کرتی ہیں۔',
      impact_sub:'1989 میں ایک نوجوان گروہ کے طور پر شروعات، 2000 میں رجسٹریشن۔ یہ اعداد پیمانہ دکھاتے ہیں؛ ان کے پیچھے دراصل برادریاں، فیلڈ ورکرز اور سرکاری ادارے مل کر کام کر رہے ہوتے ہیں۔',
      reach_head:'اب تک جغرافیائی رسائی', reach_states:'ریاستیں', reach_districts:'اضلاع', reach_blocks:'بلاک', reach_villages:'گاؤں', reach_children:'بچے اور نوعمر', reach_farmers:'خواتین کسان',
      stories_eyebrow:'تبدیلی کی کہانیاں', stories_title:'حقیقت، پھر تبدیلی۔',
      stories_sub:'ہر کہانی چار بچوں کے حقوق میں سے ایک کے گرد ترتیب دی گئی ہے — بقا، نشوونما، تحفظ، شرکت۔',
      involved_eyebrow:'ہمارے ساتھ جڑیں', involved_title:'موجودہ قوت کو بروئے کار لائیں — ہمارے ساتھ۔',
      involved_sub:'چاہے آپ ایک گھنٹہ دیں، کوئی مہارت دیں، یا ایک روپیہ — آپ اس نظام کا حصہ بن جاتے ہیں جو جواب دیتا ہے۔',
      involved_cta_title:'برادریوں کے ساتھ سرمایہ کاری کریں۔',
      involved_cta_sub:'مالی یا جنسی امداد، آن لائن یا آف لائن — ہر روپیہ اس صلاحیت میں جاتا ہے جسے برادریاں ہمارے جانے کے بعد بھی برقرار رکھتی ہیں۔',
      donate_now:'شراکت شروع کریں', email_us:'ہمیں ای میل کریں', f_email:'ای میل', f_phone:'فون', f_web:'ویب', f_address:'پتہ',
      nav_finance:'شفافیت', nav_answers:'جوابات',
      fin_eyebrow:'مالی شفافیت', fin_title:'ہر روپیہ، ریکارڈ پر۔',
      fin_sub:'آزادانہ طور پر آڈٹ شدہ حسابات — سرمایہ کار شراکت داروں نے کیا وعدہ کیا، کام تک کیا پہنچا، اور دونوں کے پیچھے قانونی جانچ۔ ہر عدد دستخط شدہ بیلنس شیٹ سے لیا گیا ہے۔',
      fin_stat_received:'20 سالوں میں طے شدہ رقم', fin_stat_fcra:'غیر ملکی امداد · غیر ملکی امداد (ضابطہ) ایکٹ', fin_stat_inr:'ملکی امداد · بھارتی روپے', fin_stat_funders:'درج شدہ سرمایہ کار شراکت دار',
      fin_years_head:'سال بہ سال', fin_years_sub:'کیا آیا، کیا خرچ ہوا، اور حسابات پر کس نے دستخط کیے۔ سال منتخب کریں تاکہ اس کے سماجی سرمایہ کار دیکھے جا سکیں۔',
      fin_received:'طے شدہ', fin_utilised:'استعمال شدہ', fin_auditor:'آڈیٹر', fin_bs:'بیلنس شیٹ', fin_surplus:'فاضل رقم', fin_deficit:'خسارہ', fin_partial:'جزوی اعداد و شمار', fin_compiled:'مرتب شدہ',
      fin_funders_head:'اس کام میں کون سرمایہ کاری کرتا ہے', fin_funders_sub:'وہ ادارے اور افراد جن کا سرمایہ اس کام کو طاقت دیتا ہے — یک طرفہ عطیہ دہندگان نہیں بلکہ مشترکہ نتیجے میں شراکت دار۔ قانون کے تقاضے کے مطابق غیر ملکی امداد ایک الگ غیر ملکی امداد (ضابطہ) ایکٹ کھاتے میں رکھی اور آڈٹ کی جاتی ہے؛ ملکی رقوم روپے کے کھاتوں سے گزرتی ہیں۔',
      fin_regime_fcra:'غیر ملکی امداد (ضابطہ) ایکٹ · غیر ملکی', fin_regime_inr:'بھارتی روپیہ · ملکی',
      fin_funders_cta:'ہر شراکت دار دیکھیں',
      fin_compliance_head:'قانونی تعمیل', fin_compliance_sub:'DEHAT ایک رجسٹرڈ سوسائٹی ہے (سوسائٹیز رجسٹریشن ایکٹ، 1860)۔ ذیل میں وہ سالانہ جوابدہی سلسلہ ہے جسے کوئی جائزہ لینے والا دیکھنے کی توقع رکھتا ہے — اور جسے DEHAT جمع کراتا ہے۔',
      fin_reg_head:'رجسٹریشنز', fin_cal_head:'سالانہ فائلنگ کیلنڈر', fin_rules_head:'ہم کن معیارات کے تحت رپورٹ کرتے ہیں',
      fin_auditor_trail:'ہر سال ایک پریکٹسنگ چارٹرڈ اکاؤنٹنٹ کے ذریعے آڈٹ اور یونیک ڈاکومنٹ آئیڈنٹیفیکیشن نمبر کے ساتھ دستخط شدہ۔ پچھلی دہائی میں پانچ مختلف فرموں نے حسابات کی جانچ کی ہے — کسی ایک کے ساتھ طویل مدتی تعلق نہیں۔',
      fin_due:'واجب الادا', fin_year_funders:'اس سال کے سرمایہ کار شراکت دار',
      fin_docs_head:'اسناد اور دستاویزات', fin_docs_sub:'ہر رجسٹریشن، منظوری اور تیسرے فریق کی توثیق — اصل سرٹیفکیٹ سے اسکین کی گئی۔ ماخذ دستاویز پڑھنے کے لیے کوئی بھی کھولیں۔',
      fin_docg_statutory:'رجسٹریشن اور ٹیکس', fin_docg_fcra:'غیر ملکی امداد · غیر ملکی امداد (ضابطہ) ایکٹ', fin_docg_validation:'توثیقات اور پہچان',
      fin_doc_view:'دستاویز دیکھیں', fin_pending_label:'آڈٹ شدہ اسکین فائل میں موجود — اعداد ڈیجیٹائز کیے جا رہے ہیں',
      foot_explore:'دریافت کریں', foot_reach:'ہم سے رابطہ کریں', foot_follow:'کام کی پیروی کریں',
      foot_desc:'بشری ترقی کے لیے ترقیاتی انجمن — برادریوں اور نظاموں کے ساتھ کام تاکہ بچوں کے حقوق تسلیم کیے جائیں، حاصل ہوں اور برقرار رکھے جائیں۔',
      foot_rights:'© 2026 DEHAT · 1989 میں نوجوان گروہ کے طور پر شروعات · 2000 میں رجسٹریشن',
    };
    const KS = {
foot_policies:'پالیسیٕ تہٕ حفاظتی تدابیر', foot_cookies:'کوکیہٕ ترتیبات',
      nav_home:'گھر', nav_who:'اسہٕ کُس چھِ', nav_work:'اسہٕ ہٕند کام', nav_impact:'اثر', nav_stories:'کہانیہٕ', nav_media:'میڈیا', nav_involved:'اسہٕ سٟتؠ شامل گژھیو',
      donate:'سرمایہ کاری کریو', since:'1989 پؠٹھ', org_full:'انسانی ترقی خٲطرٕ ترقیاتی انجمن',
      language:'زبان', lang_indian:'ہندوستانی زبانہٕ', lang_global:'عالمی (اقوامِ متحدہ)',
      hero_title_a:'اکھ بچہ-مرکزی معاشرہ یتھ منز ہر بچہ حاصل کٔری پننِس ', hero_title_b:'حقوقن', hero_title_c:' — محفوظ، باوقار تہٕ مکمل۔',
      hero_sub:'اسہٕ کٔراں چھِ کام برادریو تہٕ سرکاری نظامن سٟتؠ ہِند-نیپال تراعی علاقس منز، تاکہ بچن ہٕند حق فقط کاغذس پؠٹھ نہٕ رٕژھن، بلکہ ہر رۆزنہٕ زندگیہٕ منز مانہٕ کرنہٕ آیہٕ، حاصل گژھن تہٕ برقرار رٕژھن۔',
      hero_cta1:'برادریو سٟتؠ بہ ٹھہرِو', hero_cta2:'وُچھِو اسہٕ کٔتھ کٔم کٔراں چھُ', hero_photo:'تصویر — چائلڈ پارلیمنٹ ہٕند رہنما، لوہرا گام، بہرائچ',
      hero_principle:'برادرین تہٕ حکومتی نظامن سٲتہٕ ملتھ، ہر بچہٕ خٲطرٕ۔',
      stat_children:'رَسان بچہٕ تہٕ نوجوان', stat_invested:'2000 پؠٹھ برادری نظامن منز سرمایہ کاری', stat_resources:'حاصل گژھِتھ سرکاری وسیلہٕ', stat_districts:'2 ریاستن ہٕند ضلعہٕ',
      stat_hint:'ژار عدد، پوشیدہ۔ اکھ وُچھنہٕ خٲطرٕ تھپتھپاو۔', stat_reveal:'وُچھنہٕ خٲطرٕ تھپتھپاو', stat_hide:'لکاو', stat_reveal_all:'ژارہٕ ونٕ دیکھاو', stat_hide_all:'سٟری لکاو', grid_reveal_all:'ژہ ترہٕ ونٕ دیکھاو', grid_hint:'ژہ ترہٕ عدد، پوشیدہ۔ اکھ وُچھنہٕ خٲطرٕ تھپتھپاو۔', bl_drag:'سروے تہٕ کٔڈیو',
      vision:'وژن', mission:'مشن', theory:'تبدیلی ہٕند نظریہ',
      vision_body:'اکھ بچہ-مرکزی معاشرہ یتھ منز ہر بچہ حاصل کٔری پننہٕ حق تہٕ گژھی محفوظ، باوقار تہٕ بھرپور زندگی۔',
      mission_body:'برادریو تہٕ نظامن سٟتؠ ملٕتھ موجودہ طاقت بروئے کار آنُن، تاکہ بچن ہٕند حق ہر رۆزنہٕ زندگیہٕ منز مانہٕ کرنہٕ آیہٕ، حاصل گژھن تہٕ برقرار رٕژھن۔',
      theory_body:'یِلہٕ برادریہٕ کٔرن کٔم تہٕ نظام دِیِن جواب ہم آہنگیہٕ سٟتؠ، تِلہٕ بچن ہٕند بقا، ترقی، حفاظت تہٕ شرکت گژھی حاصل تہٕ برقرار۔',
      eyebrow_work:'اسہٕ کٔتھ کٔراں چھِ', work_head:'ژار محاذ، اکھ گژھان جواب۔',
      eyebrow_where:'اسہٕ کٔتھ کٔم کٔراں چھِ', where_head:'23 ضلعہٕ۔ 2 ریاستہٕ۔ اکھ سرحد۔',
      where_sub:'اسہٕ کٔراں چھِ کام اتر پردیش تہٕ مہاراشٹرس منز، ہِند-نیپال ہٕنز مشرقی سرحد پؠٹھ — یہٕ علاقہٕ چھِ ملتھ ساختیاتی کمزوریہٕ سٟتؠ۔ زمینی حقیقت وُچھنہٕ خٲطرٕ اکھ ضلع پؠٹھ تھپتھپاو۔',
      eyebrow_cycle:'ساختیاتی کمزوریہٕ ہٕند چکر', cycle_head:'خطرہٕ نہٕ آسان اکہٕ اکہٕ۔',
      cycle_sub:'یِم چھِ نسل در نسل اکہٕ اکہٕ زور دیوان — تاں یتھ تام نظام دِیِن نہٕ وختہٕ پؠٹھ جواب۔ کانہہ مقررہ ترتیب چھُ نہٕ: ہر بچس خٲطرٕ ییہ جال ہیکہٕ شروع گژھِتھ کانہہ ہِتھ نقطس پؠٹھ، تہٕ ہر خطرہٕ کٔڈان چھُ بۆیہٕ خطرہٕ نزدیک۔',
      cycle_pick:'وُچھنہٕ خٲطرٕ زِ اکھ زندگی کٔتھ گژھان چھِ بننہٕ، تھپتھپاو کہین وختس پؠٹھ۔',
      cycle_note:'ہر عدد چھُ اتر پردیشہٕ ہِند-نیپال تراعی پٹیہٕ سٕتؠ ژارِ ضلعن — بہرائچ، شراوستی، بلرام پور، لکھیم پور کھیری، سدھارتھ نگر، مہاراج گنج تہٕ کوشی نگر — منز درج تریٖن خراب قدر۔ ماخذ: صحت، غذائیت تہٕ صنف خٲطرٕ قومی خاندانی صحت سروے 5 (2019–21) ہٕند ضلعی حقائق نامہ ڈیٹا سیٹ (وزارتِ صحت و بہبودِ خاندان / بین الاقوامی ادارہ برائے آبادیاتی علوم)؛ تعلیمہٕ خٲطرٕ یکجا ضلعی تعلیمی معلوماتی نظام پلس ہٕند ضلعی حقائق نامہٕ؛ تہٕ زچگی مرگہٕ خٲطرٕ نمونہ رجسٹریشن نظام، یُس چھُ ریاستی سطحہٕ پؠٹھ۔ ہر صحتی عدد چھُ اکہٕ ہی سروے دورس منز نیبرٕمت، تاکہ ضلعن ہٕند موازنہ گژھی یکساں بنیادس پؠٹھ۔ ازدواجی تشدد چھُ فقط قومی خاندانی صحت سروے ہٕند ریاستی ماڈیولس منز درج گژھان تہٕ ییتہٕ چھُ اتر پردیشہٕ ہٕند عدد بنٕوتھ دیکھاونہٕ آمت۔ ژار وختہٕ — بچہ مزدوری، تریٖن غریب طبقہ، تہٕ شیرخوار و زیرِ 5 سال مرگ — چھِ اسٲس بنٕتھ تِمن ریکارڈن پؠٹھ یم چھِ اژہٕ تام دوبارہ تصدیقس پننہٕ منتظر، تہٕ ییہ چھُ صاف بنٕتھ ونہٕ آمت۔ ہِندوستان چھُ نہٕ شایع کران کانہہ سرکاری ضلعی سلسلہ شیرخوار یا زیرِ 5 سال مرگ خٲطرٕ۔ ہر وخت چھُ پننٕس ضلع تہٕ ماخذ ونان۔',
      eyebrow_process:'عمل ہٕند طریقہ', process_head:'یِلہٕ برادریہٕ کٔرن کٔم، نظام دِیِن جواب۔', eyebrow_stories:'تبدیلیہٕ ہٕندِ کہانیہٕ',
      cta_donate:'سرمایہ کاری کریو', cta_donate_b:'برادری ہٕندِ قیادتہٕ منز کٔم ہٕنز مالی یا سامانی مدد کریو، آن لائن یا آف لائن۔', cta_donate_a:'اکنون سرمایہ کاری کریو',
      cta_vol:'رضاکارانہ خدمت', cta_vol_b:'انٹرن شپ کریو، ورچوئل کٔم کریو، یا DEHAT فیلو بنیو۔', cta_vol_a:'اسہٕ سٟتؠ شامل گژھیو',
      cta_partner:'شراکت', cta_partner_b:'کارپوریٹ، تعلیمی یا اداراتی شراکتہٕ۔', cta_partner_a:'تعاون کریو',
      pillar_link_work:'ژار پروگرام وُچھیو', pillar_link_how:'وُچھیو اسہٕ کٔتھ کٔم کٔراں چھُ', stories_all:'ہر کہانی پرِیو',
      work_title:'حقوق، ہر رۆزنہٕ زندگیہٕ منز حاصل۔',
      chrono_title:'ہر منصوبہ، تاریخ وار ترتیبس منز',
      count_label:'درج منصوبہٕ',
      open_programme:'پروگرام کھولیو',
      work_sub:'ژار پروگرام، تِم ترتیبس منز یتھ منز تِم شروع آسہٕ۔ ہر اکھ چھُ پننس صفحس پؠٹھ کھلان — ییہ کام کیازہ چھُ موجود، ییہ کٔتھ چھُ بنیومت، تہٕ اسٕس کُن کُن منصوبہٕ اٹھومت چھِ، تاریخ وار ترتیبس منز، ہر اکس پتہٕ کتھ، کتھ کن، کٔتھ، کہٕ، کیازہ تہٕ سرمایہ کاری سٟتؠ۔',
      portfolio_total:'عوامی ریکارڈس پؠٹھ موجود منصوبہٕ', portfolio_investment:'مجموعی سماجی سرمایہ کاری',
      portfolio_count:'ژار پروگرامن ہٕندِ تحتہٕ منصوبہٕ',
      filter_year:'سال', filter_state:'ریاست', filter_district:'ضلع', filter_sdg:'ترقیاتی ہدف', filter_csr:'کارپوریٹ سماجی ذمہ داری · شیڈول VII', filter_uncrc:'بچہٕ ہٕند حق', filter_investor:'سماجی سرمایہ کار', filter_all:'سٟری',
      open_details:'مکمل ریکارڈ کھولیو', close_details:'ریکارڈ بند کریو', phases_label:'مراحل',
      annual_label:'سال بہ سال',
      cross_from:'ییتھ ہٕند حصہ بہٕ',
      shared_note:'مشترکہ سماجی سرمایہ کاری ہٕند دائرہ:',
      d_what:'یہٕ تبدیلی یم اسہٕ کٔرنہٕ گژھان', d_why:'یہٕ کیازہٕ چھُ مہم یتہٕ',
      d_how:'برادریو تہٕ نظامن مِلتھ کٔتھ کٔرِ کٔم', d_impact:'اثر ہٕند عدد',
      d_investor:'سماجی سرمایہ کار', d_investors:'سماجی سرمایہ کارہٕ', d_investment:'سماجی سرمایہ کاری',
      m_when:'کہٕ تہٕ حیثیت', m_location:'کتھ کن', m_sdg:'ترقیاتی ہدف', m_csr:'کارپوریٹ سماجی ذمہ داری · شیڈول VII', m_uncrc:'بچہٕ ہٕند حقوق', m_law:'ہِندوستانی قانون تہٕ پالیسی ہٕند بنیاد', m_law_none:'یتھ منصوبس خٲطرٕ چھُ نہٕ کانہہ اکھ قانونی بنیاد درج۔',
      invest_note:'بلکل تِمی طرح شایع، یتھ طرح دستاویزس منز درج چھُ؛ اکہٕ جاے گژھِتھ نہٕ۔',
      impact_eyebrow:'اثر', impact_title:'2000 پؠٹھ، برادریو سٟتؠ، یِلہٕ تِم پننہٕ حق مطالبہ کٔرن تہٕ سرکاری نظامن سٟتؠ شراکتہٕ منز تِمن حاصل کٔرنہٕ خٲطرٕ کٔم کٔرن۔',
      impact_sub:'1989 منز اکھ نوجوان گروہ بنٕتھ شروعات، 2000 منز رجسٹریشن۔ یِم عدد چھِ پیمانہ دیکھاوان؛ تِمن پتہٕ چھِ برادریہٕ، فیلڈ ورکر تہٕ سرکاری ادارہٕ ملتھ کٔم کٔران۔',
      reach_head:'اکنون تام جغرافیائی رسائی', reach_states:'ریاستہٕ', reach_districts:'ضلعہٕ', reach_blocks:'بلاک', reach_villages:'گامہٕ', reach_children:'بچہٕ تہٕ نوجوان', reach_farmers:'زنانہٕ کاشتکار',
      stories_eyebrow:'تبدیلیہٕ ہٕندِ کہانیہٕ', stories_title:'حقیقت، بۆیہٕ تبدیلی۔',
      stories_sub:'ہر کہانی چھٕ ژار بچہٕ حقوقن ہٕندِ اکس گرد ترتیب دِتہٕ — بقا، ترقی، حفاظت، شرکت۔',
      involved_eyebrow:'اسہٕ سٟتؠ شامل گژھیو', involved_title:'موجودہ طاقت بروئے کار آنیو — اسہٕ سٟتؠ۔',
      involved_sub:'خٲہ توہیہٕ دِیو اکھ گٔنٹہٕ، کانہہ ہنر، یا اکھ روپیہ — توہیہٕ گژھیو ییتھ نظامس ہٕند حصہ یُس دِتہٕ چھُ جواب۔',
      involved_cta_title:'برادریو سٟتؠ سرمایہ کاری کریو۔',
      involved_cta_sub:'مالی یا سامانی مدد، آن لائن یا آف لائن — ہر روپیہ گژھی تِمی صلاحیتہٕ منز یُس برادریہٕ اسہٕ ژھٹنہٕ پتہٕ برقرار تھاون۔',
      donate_now:'شراکت شروع کریو', email_us:'اسہٕ ای میل کریو', f_email:'ای میل', f_phone:'فون', f_web:'ویب', f_address:'پتہ',
      nav_finance:'شفافیت', nav_answers:'جوابہٕ',
      fin_eyebrow:'مالی شفافیت', fin_title:'ہر روپیہ، ریکارڈس پؠٹھ۔',
      fin_sub:'آزادانہ آڈٹ گژھِتھ حسابہٕ — سرمایہ کار شراکت دارن کٔتھ وعدہ کٔرمت، کٔم چھُ کٔم تام پژھمت، تہٕ دۆشوے پتہٕ قانونی جانچ۔ ہر عدد چھُ دستخط گژھتھ بیلنس شیٹہٕ ژھٕ نیبرٕمت۔',
      fin_stat_received:'20 سالن منز طے شدہ رقم', fin_stat_fcra:'غیر ملکی امداد · غیر ملکی امداد (ضابطہ) ایکٹ', fin_stat_inr:'ملکی امداد · ہِندوستانی روپیہٕ', fin_stat_funders:'درج سرمایہ کار شراکت دارہٕ',
      fin_years_head:'سال بہ سال', fin_years_sub:'کٔتھ آو، کٔتھ خرچ گژھ، تہٕ حسابن پؠٹھ کِس کٔرِ دستخط۔ سال چُنیو تاکہ تِمی ہٕند سماجی سرمایہ کار وُچھنہٕ آسن۔',
      fin_received:'طے شدہ', fin_utilised:'استعمال گژھمت', fin_auditor:'آڈیٹر', fin_bs:'بیلنس شیٹ', fin_surplus:'فاضل رقم', fin_deficit:'خسارہ', fin_partial:'جزوی اعداد', fin_compiled:'مرتب گژھمت',
      fin_funders_head:'یتھ کٔمس منز کُس چھُ سرمایہ کاری کران', fin_funders_sub:'تِم ادارہٕ تہٕ افراد یِمن ہٕند سرمایہ چھُ یتھ کٔمس طاقت دِوان — یک طرفہ عطیہ دار نہٕ بلکہ مشترکہ نتیجس منز شراکت دار۔ قانونہٕ ہٕند تقاضہٕ مطابق چھِ غیر ملکی امداد اکس علاحدہ غیر ملکی امداد (ضابطہ) ایکٹ کھاتس منز تھاونہٕ آمتہٕ تہٕ آڈٹ گژھان؛ ملکی رقم چھِ روپیہ کھاتن ژھٕ گژھان۔',
      fin_regime_fcra:'غیر ملکی امداد (ضابطہ) ایکٹ · غیر ملکی', fin_regime_inr:'ہِندوستانی روپیہٕ · ملکی',
      fin_funders_cta:'ہر شراکت دار وُچھیو',
      fin_compliance_head:'قانونی تعمیل', fin_compliance_sub:'DEHAT چھُ اکھ رجسٹرڈ سوسائٹی (سوسائٹیز رجسٹریشن ایکٹ، 1860)۔ تلہٕ چھُ یِتھ سالانہ جوابدہی سلسلس یُس اکھ جائزہ گژھنٕ ہار وُچھنس امید کران — تہٕ یُس DEHAT جمع کٔراں چھُ۔',
      fin_reg_head:'رجسٹریشنہٕ', fin_cal_head:'سالانہ فائلنگ کیلنڈر', fin_rules_head:'اسہٕ کِن معیارن ہٕند تحتہٕ رپورٹ کٔراں چھِ',
      fin_auditor_trail:'ہر سال اکس پریکٹسنگ چارٹرڈ اکاؤنٹنٹس ہٕند ذریعس آڈٹ تہٕ اکس یونیک ڈاکومنٹ آئیڈنٹیفیکیشن نمبرس سٟتؠ دستخط گژھمت۔ پترٕ دہاکس منز پانٛژ علاحدہ فرمن جانچ کٔرمت چھِ حسابہٕ — کہین اکس سٟتؠ طویل مدتی تعلق نہٕ۔',
      fin_due:'واجب الادا', fin_year_funders:'یتھ سالہٕ ہٕند سرمایہ کار شراکت دارہٕ',
      fin_docs_head:'اسناد تہٕ دستاویزہٕ', fin_docs_sub:'ہر رجسٹریشن، منظوری تہٕ تیسرہٕ فریقہٕ ہٕند توثیق — اصل سرٹیفکیٹس ژھٕ اسکین گژھمت۔ ماخذ دستاویز پرنہٕ خٲطرٕ کانہہ ہ کھولیو۔',
      fin_docg_statutory:'رجسٹریشن تہٕ ٹیکس', fin_docg_fcra:'غیر ملکی امداد · غیر ملکی امداد (ضابطہ) ایکٹ', fin_docg_validation:'توثیقہٕ تہٕ پہچان',
      fin_doc_view:'دستاویز وُچھیو', fin_pending_label:'آڈٹ گژھمت اسکین فائلس منز موجود — عدد چھِ ڈیجیٹائز گژھان',
      foot_explore:'ژان دیو', foot_reach:'اسہٕ سٟتؠ رابطہ کریو', foot_follow:'کٔمس پتہٕ پتہٕ چلیو',
      foot_desc:'انسانی ترقی خٲطرٕ ترقیاتی انجمن — برادریو تہٕ نظامن سٟتؠ کٔم تاکہ بچن ہٕند حق مانہٕ کرنہٕ آیہٕ، حاصل گژھن تہٕ برقرار رٕژھن۔',
      foot_rights:'© 2026 DEHAT · 1989 منز نوجوان گروہ بنٕتھ شروعات · 2000 منز رجسٹریشن',
    };
    const BN = {
foot_policies:'নীতি ও সুরক্ষা ব্যবস্থা', foot_cookies:'কুকি সেটিংস',
  nav_home:'মূলপাতা', nav_who:'আমরা কারা', nav_work:'আমাদের কাজ', nav_impact:'প্রভাব', nav_stories:'গল্প', nav_media:'মিডিয়া', nav_involved:'সাথে যুক্ত হোন',
  donate:'বিনিয়োগ করুন', since:'1989 থেকে', org_full:'মানব অগ্রগতির জন্য উন্নয়ন সংস্থা',
  language:'ভাষা', lang_indian:'ভারতীয় ভাষা', lang_global:'বৈশ্বিক (UN)',
  hero_title_a:'একটি শিশু-কেন্দ্রিক সমাজ, যেখানে প্রতিটি শিশু তার ', hero_title_b:'অধিকার', hero_title_c:' উপলব্ধি করে — নিরাপদ, মর্যাদাপূর্ণ ও সম্পূর্ণ।',
  hero_sub:'আমরা ভারত-নেপাল তরাই অঞ্চল জুড়ে সম্প্রদায় ও সরকারি ব্যবস্থার সঙ্গে কাজ করি, যাতে শিশুদের অধিকার শুধু কাগজে-কলমে সীমাবদ্ধ না থেকে, দৈনন্দিন জীবনে স্বীকৃত, প্রাপ্ত ও সুনিশ্চিত হয়।',
  hero_cta1:'সম্প্রদায়ের পাশে দাঁড়ান', hero_cta2:'আমাদের কাজ দেখুন', hero_photo:'ছবি — শিশু সংসদ নেতৃবৃন্দ, লোহরা গ্রাম, Bahraich',
  hero_principle:'সম্প্রদায় ও সরকারি ব্যবস্থার সাথে একসাথে কাজ করা, প্রতিটি শিশুর জন্য।',
  stat_children:'শিশু ও কিশোর-কিশোরীদের কাছে পৌঁছানো', stat_invested:'2000 সাল থেকে সম্প্রদায়ভিত্তিক ব্যবস্থায় বিনিয়োগ', stat_resources:'সরকারি সম্পদের প্রাপ্তি', stat_districts:'2টি রাজ্যের জেলা',
  stat_hint:'চারটি পরিসংখ্যান লুকানো আছে। একটিতে চাপ দিয়ে দেখুন।', stat_reveal:'দেখাতে চাপ দিন', stat_hide:'লুকান', stat_reveal_all:'সব চারটি দেখান', stat_hide_all:'সব লুকান', grid_reveal_all:'সব চৌদ্দটি দেখান', grid_hint:'চৌদ্দটি পরিসংখ্যান লুকানো আছে। একটিতে চাপ দিয়ে দেখুন।', bl_drag:'সমীক্ষা এগিয়ে নিতে টেনে আনুন',
  vision:'রূপকল্প', mission:'লক্ষ্য', theory:'পরিবর্তনের তত্ত্ব',
  vision_body:'এমন এক শিশু-কেন্দ্রিক সমাজ, যেখানে প্রতিটি শিশু তার অধিকার লাভ করে এবং নিরাপদ, মর্যাদাপূর্ণ ও পরিপূর্ণ জীবন যাপন করে।',
  mission_body:'সম্প্রদায় ও ব্যবস্থার সঙ্গে মিলে বিদ্যমান শক্তিকে বাস্তবায়িত করা, যাতে শিশুদের অধিকার দৈনন্দিন জীবনে স্বীকৃত, প্রাপ্ত ও সুনিশ্চিত হয়।',
  theory_body:'যখন সম্প্রদায় কাজ করে এবং ব্যবস্থাসমূহ সমন্বিতভাবে সাড়া দেয়, তখন শিশুদের বেঁচে থাকা, বিকাশ, সুরক্ষা ও অংশগ্রহণ বাস্তবায়িত ও স্থায়ী হয়।',
  eyebrow_work:'আমরা কী করি', work_head:'চারটি ফ্রন্ট, একটি সম্মিলিত প্রতিক্রিয়া।',
  eyebrow_where:'আমরা কোথায় কাজ করি', where_head:'23টি জেলা। 2টি রাজ্য। একটি সীমান্ত।',
  where_sub:'আমরা কাজ করি Uttar Pradesh-এর পূর্ব ভারত-নেপাল সীমান্তজুড়ে এবং Maharashtra-তে — এমন অঞ্চলে যা একটি অভিন্ন কাঠামোগত দুর্বলতায় আবদ্ধ। মাটির বাস্তব অবস্থা দেখতে কোনো জেলায় চাপ দিন।',
  eyebrow_cycle:'কাঠামোগত দুর্বলতার চক্র', cycle_head:'ঝুঁকিগুলো একা আসে না।',
  cycle_sub:'প্রজন্মের পর প্রজন্ম ধরে এগুলো একে অপরকে আরও দৃঢ় করে তোলে — যতক্ষণ না ব্যবস্থাগুলো সময়মতো সাড়া দেয়। এর কোনো নির্দিষ্ট ক্রম নেই: যেকোনো শিশুর ক্ষেত্রে এই ফাঁদ যেকোনো বিন্দু থেকে শুরু হতে পারে, এবং প্রতিটি ঝুঁকি পরেরটিকে আরও কাছে টেনে আনে।',
  cycle_pick:'একটি জীবন কীভাবে গড়ে ওঠে তা দেখতে যেকোনো মুহূর্তে চাপ দিন।',
  cycle_note:'প্রতিটি পরিসংখ্যান হলো Uttar Pradesh-এর ভারত-নেপাল তরাই বলয়ের সাতটি জেলা — Bahraich, Shravasti, Balrampur, Lakhimpur Kheri, Siddharthnagar, Maharajganj ও Kushinagar — জুড়ে নথিভুক্ত সবচেয়ে খারাপ মান। স্বাস্থ্য, পুষ্টি ও লিঙ্গবিষয়ক পরিসংখ্যানের উৎস জাতীয় পরিবার স্বাস্থ্য সমীক্ষা 5 (2019–21)-এর জেলাভিত্তিক তথ্য-পত্র উপাত্ত (স্বাস্থ্য ও পরিবার কল্যাণ মন্ত্রণালয় / আন্তর্জাতিক জনসংখ্যা বিজ্ঞান ইনস্টিটিউট); বিদ্যালয়-সংক্রান্ত তথ্যের উৎস একীভূত জেলা শিক্ষা তথ্য ব্যবস্থা প্লাস (ইউডিআইএসই+)-এর জেলা তথ্য-পত্র; আর মাতৃমৃত্যু হারের উৎস নমুনা নিবন্ধন ব্যবস্থা, যা রাজ্য পর্যায়ের পরিসংখ্যান। প্রতিটি স্বাস্থ্য-সংক্রান্ত পরিসংখ্যান একই সমীক্ষা পর্ব থেকে নেওয়া, ফলে জেলাগুলোর মধ্যে তুলনা সমান ভিত্তিতে হয়। দাম্পত্য সহিংসতার তথ্য জাতীয় পরিবার স্বাস্থ্য সমীক্ষার কেবল রাজ্য-স্তরের অংশ থেকে সংগৃহীত হয়, তাই এটি Uttar Pradesh-এর পরিসংখ্যান হিসেবে দেখানো হয়েছে। চারটি মুহূর্ত — শিশুশ্রম, সবচেয়ে দরিদ্র সম্পদ-বিভাগ, এবং শিশুমৃত্যু ও 5 বছরের নিচে মৃত্যুহার — এমন তথ্যের উপর ভিত্তি করে তৈরি যা এখনও পুনঃযাচাইয়ের অপেক্ষায় আছে, এবং তা স্পষ্টভাবে উল্লেখ করা হয়েছে। India শিশুমৃত্যু বা 5 বছরের নিচে মৃত্যুহারের জন্য কোনো সরকারি জেলাভিত্তিক তথ্য-ধারা প্রকাশ করে না। প্রতিটি মুহূর্তের সঙ্গে তার জেলা ও উৎস উল্লেখ করা আছে।',
  eyebrow_process:'প্রক্রিয়া', process_head:'যখন সম্প্রদায় কাজ করে, ব্যবস্থা সাড়া দেয়।', eyebrow_stories:'পরিবর্তনের গল্প',
  cta_donate:'বিনিয়োগ করুন', cta_donate_b:'অনলাইনে বা অফলাইনে — অর্থ বা উপকরণের মাধ্যমে — সম্প্রদায়-নেতৃত্বাধীন কাজে সহায়তা করুন।', cta_donate_a:'এখনই বিনিয়োগ করুন',
  cta_vol:'স্বেচ্ছাসেবা', cta_vol_b:'ইন্টার্নশিপ করুন, ভার্চুয়ালি কাজ করুন, অথবা DEHAT ফেলো হোন।', cta_vol_a:'আমাদের সঙ্গে যুক্ত হোন',
  cta_partner:'অংশীদারত্ব', cta_partner_b:'কর্পোরেট, শিক্ষাগত বা প্রাতিষ্ঠানিক অংশীদারত্ব।', cta_partner_a:'সহযোগিতা করুন',
  pillar_link_work:'চারটি কর্মসূচি দেখুন', pillar_link_how:'আমরা কীভাবে কাজ করি তা দেখুন', stories_all:'সব গল্প পড়ুন',
  work_title:'অধিকার, দৈনন্দিন জীবনে বাস্তবায়িত।',
  chrono_title:'প্রতিটি প্রকল্প, কালানুক্রমিক ক্রমে',
  count_label:'নথিভুক্ত প্রকল্প',
  open_programme:'কর্মসূচি খুলুন',
  work_sub:'চারটি কর্মসূচি, যে ক্রমে শুরু হয়েছিল সেই ক্রমে। প্রতিটি নিজস্ব পাতায় খোলে — কেন এই কাজ প্রয়োজন, কীভাবে এটি গড়ে উঠেছে, এবং এটি যে প্রতিটি প্রকল্প বহন করেছে, তার প্রতিটির পেছনের কী, কোথায়, কীভাবে, কখন, কেন ও বিনিয়োগ-সহ কালানুক্রমিক বিবরণ।',
  portfolio_total:'জনসমক্ষে নথিভুক্ত প্রকল্প', portfolio_investment:'মোট সামাজিক বিনিয়োগ',
  portfolio_count:'চারটি কর্মসূচি জুড়ে প্রকল্প',
  filter_year:'বছর', filter_state:'রাজ্য', filter_district:'জেলা', filter_sdg:'উন্নয়ন লক্ষ্য', filter_csr:'কর্পোরেট সামাজিক দায়বদ্ধতা · তফসিল VII', filter_uncrc:'শিশু অধিকার', filter_investor:'সামাজিক বিনিয়োগকারী', filter_all:'সব',
  open_details:'সম্পূর্ণ নথি খুলুন', close_details:'নথি বন্ধ করুন', phases_label:'পর্যায়',
  annual_label:'বছর অনুযায়ী',
  cross_from:'এরও অংশ',
  shared_note:'ভাগ করা সামাজিক বিনিয়োগ খাত:',
  d_what:'যে পরিবর্তন আনতে আমরা কাজ শুরু করেছিলাম', d_why:'এখানে এটি কেন গুরুত্বপূর্ণ ছিল',
  d_how:'সম্প্রদায় ও ব্যবস্থা কীভাবে একসঙ্গে কাজ করেছে', d_impact:'প্রভাবের পরিসংখ্যান',
  d_investor:'সামাজিক বিনিয়োগকারী', d_investors:'সামাজিক বিনিয়োগকারীরা', d_investment:'সামাজিক বিনিয়োগ',
  m_when:'কখন ও অবস্থা', m_location:'কোথায়', m_sdg:'উন্নয়ন লক্ষ্য', m_csr:'কর্পোরেট সামাজিক দায়বদ্ধতা · তফসিল VII', m_uncrc:'শিশুর অধিকার', m_law:'ভারতীয় আইন ও নীতির ভিত্তি', m_law_none:'এই প্রকল্পের জন্য কোনো একক সংবিধিবদ্ধ ভিত্তি নথিভুক্ত নেই।',
  invest_note:'যেভাবে নথিভুক্ত হয়েছে ঠিক সেভাবেই প্রকাশিত; একত্রীকরণ করা হয়নি।',
  impact_eyebrow:'প্রভাব', impact_title:'2000 সাল থেকে, সম্প্রদায়ের পাশে থেকেছি যখন তারা অধিকার দাবি করেছে এবং তা বাস্তবায়নে সরকারি ব্যবস্থার সঙ্গে অংশীদারত্বে কাজ করেছে।',
  impact_sub:'1989 সালে একটি যুব সংগঠন হিসেবে যাত্রা শুরু, 2000 সালে নিবন্ধিত। এই পরিসংখ্যানগুলো পরিধি দেখায়; এগুলোর পেছনে রয়েছে সম্প্রদায়, মাঠকর্মী ও সরকারি প্রতিষ্ঠানের যৌথ প্রচেষ্টা।',
  reach_head:'এখন পর্যন্ত ভৌগোলিক বিস্তার', reach_states:'রাজ্য', reach_districts:'জেলা', reach_blocks:'ব্লক', reach_villages:'গ্রাম', reach_children:'শিশু ও কিশোর-কিশোরী', reach_farmers:'নারী কৃষক',
  stories_eyebrow:'পরিবর্তনের গল্প', stories_title:'বাস্তবতা, তারপর রূপান্তর।',
  stories_sub:'প্রতিটি ঘটনার গল্প চারটি শিশু অধিকারের একটির চারপাশে সাজানো — বেঁচে থাকা, বিকাশ, সুরক্ষা, অংশগ্রহণ।',
  involved_eyebrow:'সাথে যুক্ত হোন', involved_title:'বিদ্যমান শক্তিকে বাস্তবায়িত করুন — আমাদের সঙ্গে।',
  involved_sub:'আপনি এক ঘণ্টা সময়, একটি দক্ষতা, বা এক টাকা দিন না কেন, আপনি এমন একটি ব্যবস্থার অংশ হয়ে ওঠেন যা সাড়া দেয়।',
  involved_cta_title:'সম্প্রদায়ের পাশাপাশি বিনিয়োগ করুন।',
  involved_cta_sub:'অর্থ বা উপকরণ, অনলাইন বা অফলাইন — প্রতিটি টাকা এমন সক্ষমতা তৈরিতে ব্যয় হয় যা আমরা চলে যাওয়ার পরেও সম্প্রদায়ের কাছে থেকে যায়।',
  donate_now:'একটি অংশীদারত্ব শুরু করুন', email_us:'আমাদের ইমেল করুন', f_email:'ইমেল', f_phone:'ফোন', f_web:'ওয়েব', f_address:'ঠিকানা',
  nav_finance:'স্বচ্ছতা', nav_answers:'উত্তর',
  fin_eyebrow:'আর্থিক স্বচ্ছতা', fin_title:'প্রতিটি টাকা, নথিভুক্ত।',
  fin_sub:'স্বাধীনভাবে নিরীক্ষিত হিসাব — বিনিয়োগ অংশীদাররা কী প্রতিশ্রুতি দিয়েছেন, কাজে প্রকৃতপক্ষে কী পৌঁছেছে, এবং উভয়ের পেছনের সংবিধিবদ্ধ পরীক্ষা। প্রতিটি পরিসংখ্যান একটি স্বাক্ষরিত ব্যালান্স শিট থেকে নেওয়া।',
  fin_stat_received:'20 বছরে প্রতিশ্রুত', fin_stat_fcra:'বৈদেশিক অনুদান · বৈদেশিক অনুদান (নিয়ন্ত্রণ) আইন', fin_stat_inr:'দেশীয় অনুদান · ভারতীয় রুপি', fin_stat_funders:'নথিভুক্ত বিনিয়োগ অংশীদার',
  fin_years_head:'বছর অনুযায়ী', fin_years_sub:'কী এসেছে, কী ব্যয় হয়েছে, এবং কে হিসাব স্বাক্ষর করেছেন। কোনো বছরের সামাজিক বিনিয়োগকারীদের দেখতে সেটি নির্বাচন করুন।',
  fin_received:'প্রতিশ্রুত', fin_utilised:'ব্যয়িত', fin_auditor:'নিরীক্ষক', fin_bs:'ব্যালান্স শিট', fin_surplus:'উদ্বৃত্ত', fin_deficit:'ঘাটতি', fin_partial:'আংশিক তথ্য', fin_compiled:'সংকলিত',
  fin_funders_head:'এই কাজে কারা বিনিয়োগ করেন', fin_funders_sub:'যেসব প্রতিষ্ঠান ও ব্যক্তির অর্থ এই কাজকে সচল রাখে — তারা একটি অভিন্ন ফলাফলের অংশীদার, একমুখী দাতা নন। আইনের প্রয়োজন অনুযায়ী বৈদেশিক অনুদান একটি পৃথক বৈদেশিক অনুদান (নিয়ন্ত্রণ) আইন হিসাব হিসেবে রাখা ও নিরীক্ষা করা হয়; দেশীয় তহবিল রুপি হিসাবের মাধ্যমে পরিচালিত হয়।',
  fin_regime_fcra:'বৈদেশিক অনুদান (নিয়ন্ত্রণ) আইন · বৈদেশিক', fin_regime_inr:'ভারতীয় রুপি · দেশীয়',
  fin_funders_cta:'প্রতিটি অংশীদার দেখুন',
  fin_compliance_head:'সংবিধিবদ্ধ পরিপালন', fin_compliance_sub:'DEHAT একটি নিবন্ধিত সোসাইটি (সোসাইটি নিবন্ধন আইন, 1860)। নিচে বার্ষিক জবাবদিহিতার চক্র দেওয়া হলো, যা একজন পর্যালোচক দেখতে আশা করেন — এবং যা DEHAT দাখিল করে।',
  fin_reg_head:'নিবন্ধনসমূহ', fin_cal_head:'বার্ষিক দাখিল ক্যালেন্ডার', fin_rules_head:'আমরা যেসবের বিপরীতে প্রতিবেদন করি',
  fin_auditor_trail:'প্রতি বছর একজন কর্মরত চার্টার্ড অ্যাকাউন্ট্যান্ট দ্বারা নিরীক্ষিত এবং একটি Unique Document Identification Number দিয়ে স্বাক্ষরিত। গত এক দশকে পাঁচটি ভিন্ন প্রতিষ্ঠান হিসাব পরীক্ষা করেছে — কোনো একক দীর্ঘমেয়াদি সম্পর্ক নেই।',
  fin_due:'প্রদেয়', fin_year_funders:'এই বছরের বিনিয়োগ অংশীদার',
  fin_docs_head:'প্রমাণপত্র ও নথি', fin_docs_sub:'প্রতিটি নিবন্ধন, অনুমোদন এবং তৃতীয়-পক্ষের যাচাই — মূল সনদ থেকে স্ক্যান করা। মূল নথি পড়তে যেকোনোটি খুলুন।',
  fin_docg_statutory:'নিবন্ধন ও কর', fin_docg_fcra:'বৈদেশিক অনুদান · বৈদেশিক অনুদান (নিয়ন্ত্রণ) আইন', fin_docg_validation:'যাচাই ও স্বীকৃতি',
  fin_doc_view:'নথি দেখুন', fin_pending_label:'নিরীক্ষিত স্ক্যান নথিভুক্ত আছে — পরিসংখ্যান ডিজিটাইজ করা হচ্ছে',
  foot_explore:'অন্বেষণ করুন', foot_reach:'যোগাযোগ করুন', foot_follow:'কাজ অনুসরণ করুন',
  foot_desc:'মানব অগ্রগতির জন্য উন্নয়ন সংস্থা — সম্প্রদায় ও ব্যবস্থার সঙ্গে কাজ করে যাতে শিশুদের অধিকার স্বীকৃত, প্রাপ্ত ও সুনিশ্চিত হয়।',
  foot_rights:'© 2026 DEHAT · 1989 সালে যুব সংগঠন হিসেবে যাত্রা শুরু · 2000 সালে নিবন্ধিত',
    };
    const MR = {
foot_policies:'धोरणे व सुरक्षा उपाय', foot_cookies:'कुकी सेटिंग्ज',
      nav_home:'मुख्यपृष्ठ', nav_who:'आम्ही कोण आहोत', nav_work:'आमचे कार्य', nav_impact:'प्रभाव', nav_stories:'कथा', nav_media:'मीडिया', nav_involved:'सहभागी व्हा',
      donate:'गुंतवणूक करा', since:'1989 पासून', org_full:'मानवी उन्नतीसाठी विकास संघटना',
      language:'भाषा', lang_indian:'भारतीय भाषा', lang_global:'जागतिक (UN)',
      hero_title_a:'एक बालकेंद्रित समाज जिथे प्रत्येक मूल आपले ', hero_title_b:'हक्क', hero_title_c:' मिळवते — सुरक्षित, सन्मानपूर्ण आणि परिपूर्ण.',
      hero_sub:'भारत-नेपाळ तराई भागात आम्ही समुदाय आणि सार्वजनिक यंत्रणांसोबत काम करतो, जेणेकरून मुलांचे हक्क केवळ कागदावर न राहता रोजच्या आयुष्यात ओळखले जावेत, मिळावेत आणि टिकून राहावेत.',
      hero_cta1:'समुदायांसोबत उभे रहा', hero_cta2:'आम्ही कसे काम करतो ते पहा', hero_photo:'छायाचित्र — बाल संसद नेते, लोहरा गाव, Bahraich',
      hero_principle:'समुदाय आणि शासकीय यंत्रणांसोबत मिळून, प्रत्येक मुलासाठी.',
      stat_children:'मुले व किशोरवयीन यांच्यापर्यंत पोहोच', stat_invested:'2000 पासून सामुदायिक यंत्रणांमध्ये गुंतवणूक', stat_resources:'मिळालेली सार्वजनिक संसाधने', stat_districts:'2 राज्यांतील जिल्हे',
      stat_hint:'चार आकडे लपवलेले आहेत. एकावर टॅप करून पाहा.', stat_reveal:'दाखवण्यासाठी टॅप करा', stat_hide:'लपवा', stat_reveal_all:'सर्व चार दाखवा', stat_hide_all:'सर्व लपवा', grid_reveal_all:'सर्व चौदा दाखवा', grid_hint:'चौदा आकडे लपवलेले आहेत. एकावर टॅप करून पाहा.', bl_drag:'सर्वेक्षण पुढे ओढा',
      vision:'दृष्टी', mission:'ध्येय', theory:'बदलाचा सिद्धांत',
      vision_body:'एक बालकेंद्रित समाज जिथे प्रत्येक मूल आपले हक्क मिळवते आणि सुरक्षित, सन्मानपूर्ण व परिपूर्ण जीवन जगते.',
      mission_body:'समुदाय आणि यंत्रणांसोबत काम करून विद्यमान सामर्थ्य साकार करणे, जेणेकरून मुलांचे हक्क रोजच्या आयुष्यात ओळखले जातील, मिळतील आणि टिकून राहतील.',
      theory_body:'जेव्हा समुदाय कृती करतात आणि यंत्रणा एकत्रितपणे प्रतिसाद देतात, तेव्हा मुलांचे जगणे, विकास, संरक्षण आणि सहभाग साकार होतो व टिकून राहतो.',
      eyebrow_work:'आम्ही काय करतो', work_head:'चार आघाड्या, एक एकत्रित प्रतिसाद.',
      eyebrow_where:'आम्ही कुठे काम करतो', where_head:'23 जिल्हे. 2 राज्ये. एक सीमा.',
      where_sub:'आम्ही Uttar Pradesh मधील पूर्व भारत-नेपाळ सीमेवर आणि Maharashtra मध्ये काम करतो — सामायिक संरचनात्मक असुरक्षिततेने बांधलेले प्रदेश. जमिनीवरील परिस्थिती पाहण्यासाठी एखाद्या जिल्ह्यावर टॅप करा.',
      eyebrow_cycle:'संरचनात्मक असुरक्षिततेचे चक्र', cycle_head:'धोके एकाकी येत नाहीत.',
      cycle_sub:'ते पिढ्यानपिढ्या एकमेकांना बळकट करतात — जोपर्यंत यंत्रणा वेळेत प्रतिसाद देत नाहीत. यासाठी कोणताही निश्चित क्रम नाही: कोणत्याही मुलासाठी हा सापळा कोणत्याही टप्प्यावर सुरू होऊ शकतो, आणि प्रत्येक धोका पुढचा धोका अधिक जवळ खेचतो.',
      cycle_pick:'एक आयुष्य कसे घडते हे पाहण्यासाठी कोणत्याही क्षणावर टॅप करा.',
      cycle_note:'प्रत्येक आकडा Uttar Pradesh च्या भारत-नेपाळ तराई पट्ट्यातील सात जिल्ह्यांमध्ये — Bahraich, Shravasti, Balrampur, Lakhimpur Kheri, Siddharthnagar, Maharajganj आणि Kushinagar — नोंदवलेले सर्वाधिक गंभीर मूल्य दर्शवतो. स्रोत: आरोग्य, पोषण आणि लिंगभाव यांसाठी राष्ट्रीय कुटुंब आरोग्य सर्वेक्षण 5 (2019–21) चा जिल्हा तथ्य-पत्रक डेटासेट (आरोग्य आणि कुटुंब कल्याण मंत्रालय / आंतरराष्ट्रीय लोकसंख्या विज्ञान संस्था); शालेय शिक्षणासाठी शिक्षणाकरता एकीकृत जिल्हा माहिती प्रणाली प्लस (UDISE+) चे जिल्हा तथ्य-पत्रक; आणि माता मृत्यू दरासाठी नमुना नोंदणी प्रणाली, जी राज्यस्तरीय आहे. प्रत्येक आरोग्यविषयक आकडा एकाच सर्वेक्षण फेरीतून घेतलेला असल्याने, जिल्ह्यांची तुलना समान पातळीवर होते. वैवाहिक हिंसाचाराची नोंद केवळ राष्ट्रीय कुटुंब आरोग्य सर्वेक्षणाच्या राज्यस्तरीय विभागात होते, त्यामुळे तो आकडा Uttar Pradesh राज्याचा दाखवला आहे. बालमजुरी, सर्वात गरीब आर्थिक स्तर, अर्भक मृत्यू दर आणि पाच वर्षांखालील बालमृत्यू दर — हे चार क्षण अद्याप पुनर्पडताळणी प्रलंबित असलेल्या नोंदींवर आधारित आहेत, आणि तसे स्पष्टपणे नमूद केले आहे. भारतात अर्भक किंवा पाच वर्षांखालील मृत्यू दराची कोणतीही अधिकृत जिल्हास्तरीय मालिका प्रकाशित होत नाही. प्रत्येक क्षणासोबत त्याचा जिल्हा आणि स्रोत नमूद केला आहे.',
      eyebrow_process:'प्रक्रिया', process_head:'जेव्हा समुदाय कृती करतात, तेव्हा यंत्रणा प्रतिसाद देतात.', eyebrow_stories:'बदलाच्या कथा',
      cta_donate:'गुंतवणूक करा', cta_donate_b:'समुदाय-नेतृत्वाखालील कार्याला भांडवल किंवा साहित्याद्वारे, ऑनलाइन किंवा ऑफलाइन पाठबळ द्या.', cta_donate_a:'आता गुंतवणूक करा',
      cta_vol:'स्वयंसेवा', cta_vol_b:'इंटर्नशिप करा, व्हर्च्युअली काम करा, किंवा DEHAT फेलो बना.', cta_vol_a:'सामील व्हा',
      cta_partner:'भागीदार', cta_partner_b:'कॉर्पोरेट, शैक्षणिक किंवा संस्थात्मक भागीदारी.', cta_partner_a:'सहकार्य करा',
      pillar_link_work:'चार कार्यक्रम पहा', pillar_link_how:'आम्ही कसे काम करतो ते पहा', stories_all:'सर्व कथा वाचा',
      work_title:'हक्क, रोजच्या आयुष्यात साकार.',
      chrono_title:'प्रत्येक प्रकल्प, कालानुक्रमे',
      count_label:'नोंदवलेले प्रकल्प',
      open_programme:'कार्यक्रम उघडा',
      work_sub:'चार कार्यक्रम, ते सुरू झाले त्या क्रमाने. प्रत्येक कार्यक्रम स्वतःच्या पानावर उघडतो — हे काम का सुरू झाले, ते कसे उभारले गेले, आणि त्याने आजवर हाती घेतलेला प्रत्येक प्रकल्प, कालानुक्रमे, प्रत्येकामागचे काय, कुठे, कसे, कधी, का आणि गुंतवणूक यांसह.',
      portfolio_total:'सार्वजनिक नोंदीतील प्रकल्प', portfolio_investment:'एकूण सामाजिक गुंतवणूक',
      portfolio_count:'चार कार्यक्रमांमधील प्रकल्प',
      filter_year:'वर्ष', filter_state:'राज्य', filter_district:'जिल्हा', filter_sdg:'विकास उद्दिष्ट', filter_csr:'कॉर्पोरेट सामाजिक उत्तरदायित्व · अनुसूची VII', filter_uncrc:'बालहक्क', filter_investor:'सामाजिक गुंतवणूकदार', filter_all:'सर्व',
      open_details:'संपूर्ण नोंद उघडा', close_details:'नोंद बंद करा', phases_label:'टप्पे',
      annual_label:'वर्षनिहाय',
      cross_from:'याचाही भाग',
      shared_note:'सामायिक सामाजिक गुंतवणूक व्याप्ती:',
      d_what:'आम्ही घडवू इच्छिलेला बदल', d_why:'हे इथे का महत्त्वाचे होते',
      d_how:'समुदाय आणि यंत्रणांनी एकत्र कसे काम केले', d_impact:'प्रभावाचे आकडे',
      d_investor:'सामाजिक गुंतवणूकदार', d_investors:'सामाजिक गुंतवणूकदार', d_investment:'सामाजिक गुंतवणूक',
      m_when:'कधी आणि स्थिती', m_location:'कुठे', m_sdg:'विकास उद्दिष्टे', m_csr:'कॉर्पोरेट सामाजिक उत्तरदायित्व · अनुसूची VII', m_uncrc:'बालकांचे हक्क', m_law:'भारतीय कायदा व धोरण आधार', m_law_none:'या प्रकल्पासाठी कोणताही एकच वैधानिक आधार नोंदवलेला नाही.',
      invest_note:'जसे दस्तऐवजीकरण केले तसेच प्रकाशित; एकत्रित केलेले नाही.',
      impact_eyebrow:'प्रभाव', impact_title:'2000 पासून, समुदाय आपले हक्क मागत असताना आणि ते मिळवण्यासाठी सार्वजनिक यंत्रणांसोबत भागीदारीने काम करत असताना, त्यांच्या सोबतीने.',
      impact_sub:'1989 मध्ये युवकांच्या एका गटाच्या रूपात सुरुवात, 2000 मध्ये नोंदणी झाली. हे आकडे व्याप्ती दर्शवतात; त्यामागे समुदाय, क्षेत्रीय कार्यकर्ते आणि सार्वजनिक संस्था एकत्र येऊन काम करत असल्याचे वास्तव आहे.',
      reach_head:'आजवरचा भौगोलिक विस्तार', reach_states:'राज्ये', reach_districts:'जिल्हे', reach_blocks:'तालुके', reach_villages:'गावे', reach_children:'मुले व किशोरवयीन', reach_farmers:'महिला शेतकरी',
      stories_eyebrow:'बदलाच्या कथा', stories_title:'वास्तव, मग परिवर्तन.',
      stories_sub:'प्रत्येक प्रकरण-कथा चार बालहक्कांपैकी एकाभोवती रचलेली आहे — जगणे, विकास, संरक्षण, सहभाग.',
      involved_eyebrow:'सहभागी व्हा', involved_title:'विद्यमान सामर्थ्य साकार करा — आमच्यासोबत.',
      involved_sub:'तुम्ही एक तास द्या, एखादे कौशल्य द्या, किंवा एक रुपया द्या — तुम्ही प्रतिसाद देणाऱ्या यंत्रणेचा भाग बनता.',
      involved_cta_title:'समुदायांसोबत गुंतवणूक करा.',
      involved_cta_sub:'भांडवल असो वा साहित्य, ऑनलाइन असो वा ऑफलाइन — प्रत्येक रुपया अशा क्षमतेत जातो जी आम्ही निघून गेल्यावरही समुदायांकडे टिकून राहते.',
      donate_now:'भागीदारी सुरू करा', email_us:'आम्हाला ईमेल करा', f_email:'ईमेल', f_phone:'फोन', f_web:'वेब', f_address:'पत्ता',
      nav_finance:'पारदर्शकता', nav_answers:'उत्तरे',
      fin_eyebrow:'आर्थिक पारदर्शकता', fin_title:'प्रत्येक रुपया, नोंदीत.',
      fin_sub:'स्वतंत्रपणे लेखापरीक्षण झालेले हिशोब — गुंतवणूक भागीदारांनी काय वचनबद्ध केले, प्रत्यक्ष कामापर्यंत काय पोहोचले, आणि या दोन्हींमागील वैधानिक तपासण्या. प्रत्येक आकडा स्वाक्षरी केलेल्या ताळेबंदातून घेतलेला आहे.',
      fin_stat_received:'20 वर्षांत वचनबद्ध केलेली रक्कम', fin_stat_fcra:'परकीय अंशदान · परकीय अंशदान (विनियमन) अधिनियम', fin_stat_inr:'देशांतर्गत अंशदान · भारतीय रुपये', fin_stat_funders:'नोंदणीकृत गुंतवणूक भागीदार',
      fin_years_head:'वर्षनिहाय', fin_years_sub:'काय आले, काय खर्च झाले, आणि हिशोबांवर कोणी स्वाक्षरी केली. त्या वर्षीचे सामाजिक गुंतवणूकदार पाहण्यासाठी एक वर्ष निवडा.',
      fin_received:'वचनबद्ध', fin_utilised:'वापरलेले', fin_auditor:'लेखापरीक्षक', fin_bs:'ताळेबंद', fin_surplus:'अधिशेष', fin_deficit:'तूट', fin_partial:'आंशिक माहिती', fin_compiled:'संकलित',
      fin_funders_head:'या कार्यात कोण गुंतवणूक करते', fin_funders_sub:'ज्या संस्था आणि व्यक्तींचे भांडवल या कार्याला बळ देते — ते एकतर्फी देणगीदार नसून, सामायिक निष्पत्तीतील भागीदार आहेत. कायद्याने आवश्यक असल्याप्रमाणे, परकीय अंशदान स्वतंत्र परकीय अंशदान (विनियमन) अधिनियम खात्यात ठेवले व लेखापरीक्षित केले जाते; देशांतर्गत निधी रुपयांच्या हिशोबांतून चालतो.',
      fin_regime_fcra:'परकीय अंशदान (विनियमन) अधिनियम · परकीय', fin_regime_inr:'भारतीय रुपया · देशांतर्गत',
      fin_funders_cta:'सर्व भागीदार पहा',
      fin_compliance_head:'वैधानिक अनुपालन', fin_compliance_sub:'DEHAT ही एक नोंदणीकृत सोसायटी आहे (सोसायटी नोंदणी अधिनियम, 1860). खाली दिलेले वार्षिक उत्तरदायित्व चक्र हे कोणत्याही परीक्षकाला अपेक्षित असते — आणि जे DEHAT प्रत्यक्षात दाखल करते.',
      fin_reg_head:'नोंदणी', fin_cal_head:'वार्षिक दाखल वेळापत्रक', fin_rules_head:'आम्ही कशाच्या आधारे अहवाल देतो',
      fin_auditor_trail:'दरवर्षी एका कार्यरत सनदी लेखापालाकडून लेखापरीक्षण होते आणि Unique Document Identification Number सह स्वाक्षरी केली जाते. गेल्या दशकभरात पाच वेगवेगळ्या फर्म्सनी हिशोब तपासले आहेत — कोणतेही एकच दीर्घकालीन नाते नाही.',
      fin_due:'देय', fin_year_funders:'या वर्षीचे गुंतवणूक भागीदार',
      fin_docs_head:'प्रमाणपत्रे व कागदपत्रे', fin_docs_sub:'प्रत्येक नोंदणी, मान्यता आणि तृतीय-पक्ष पडताळणी — मूळ प्रमाणपत्रावरून स्कॅन केलेली. मूळ दस्तऐवज वाचण्यासाठी कोणतेही उघडा.',
      fin_docg_statutory:'नोंदणी व कर', fin_docg_fcra:'परकीय अंशदान · परकीय अंशदान (विनियमन) अधिनियम', fin_docg_validation:'पडताळणी व मान्यता',
      fin_doc_view:'दस्तऐवज पहा', fin_pending_label:'लेखापरीक्षित स्कॅन नोंदीत — आकडे डिजिटल केले जात आहेत',
      foot_explore:'शोधा', foot_reach:'आमच्याशी संपर्क साधा', foot_follow:'कार्याचा मागोवा घ्या',
      foot_desc:'मानवी उन्नतीसाठी विकास संघटना — समुदाय आणि यंत्रणांसोबत काम करत आहे, जेणेकरून मुलांचे हक्क ओळखले जावेत, मिळावेत आणि टिकून राहावेत.',
      foot_rights:'© 2026 DEHAT · 1989 मध्ये युवकांच्या गटाच्या रूपात सुरुवात · 2000 मध्ये नोंदणी',
    };
    const TE = {
foot_policies:'విధానాలు మరియు రక్షణ చర్యలు', foot_cookies:'కుకీ సెట్టింగ్‌లు',
  nav_home:'హోమ్', nav_who:'మేము ఎవరము', nav_work:'మా పని', nav_impact:'ప్రభావం', nav_stories:'కథనాలు', nav_media:'మీడియా', nav_involved:'మాతో చేరండి',
  donate:'పెట్టుబడి పెట్టండి', since:'1989 నుండి', org_full:'మానవ అభ్యున్నతి కోసం అభివృద్ధి సంఘం',
  language:'భాష', lang_indian:'భారతీయ భాషలు', lang_global:'ప్రపంచవ్యాప్త (UN)',
  hero_title_a:'బాలల కేంద్రంగా ఉన్న సమాజం, ఇందులో ప్రతి బిడ్డ తన ', hero_title_b:'హక్కులను', hero_title_c:' సాధించుకుంటాడు — సురక్షితంగా, గౌరవప్రదంగా, సంపూర్ణంగా.',
  hero_sub:'పిల్లల హక్కులు కేవలం కాగితాలపైనే ఉండిపోకుండా, రోజువారీ జీవితంలో గుర్తించబడేలా, అందుబాటులోకి వచ్చేలా మరియు నిలబెట్టబడేలా చేయడానికి మేము ఇండో-నేపాల్ తరాయి ప్రాంతం వెంబడి సమాజాలతో మరియు ప్రభుత్వ వ్యవస్థలతో కలిసి పనిచేస్తాము.',
  hero_cta1:'సమాజాలతో నిలబడండి', hero_cta2:'మేము ఎలా పనిచేస్తామో చూడండి', hero_photo:'ఫోటో — బాల పార్లమెంట్ నాయకులు, Lohra గ్రామం, Bahraich',
  hero_principle:'సమాజాలు మరియు ప్రభుత్వ వ్యవస్థలతో కలిసి పనిచేయడం, ప్రతి బిడ్డ కోసం.',
  stat_children:'చేరుకున్న పిల్లలు & కౌమారులు', stat_invested:'2000 నుండి సామాజిక వ్యవస్థల్లో పెట్టుబడి', stat_resources:'పొందిన ప్రభుత్వ వనరులు', stat_districts:'2 రాష్ట్రాల్లోని జిల్లాలు',
  stat_hint:'నాలుగు గణాంకాలు, దాచబడ్డాయి. చూడటానికి ఒకదానిపై నొక్కండి.', stat_reveal:'చూపించడానికి నొక్కండి', stat_hide:'దాచండి', stat_reveal_all:'నాలుగింటినీ చూపించండి', stat_hide_all:'అన్నీ దాచండి', grid_reveal_all:'పధ్నాలుగింటినీ చూపించండి', grid_hint:'పధ్నాలుగు గణాంకాలు, దాచబడ్డాయి. చూడటానికి ఒకదానిపై నొక్కండి.', bl_drag:'సర్వేను ముందుకు లాగండి',
  vision:'దృష్టి', mission:'లక్ష్యం', theory:'మార్పు సిద్ధాంతం',
  vision_body:'బాలల కేంద్రంగా ఉన్న సమాజం, అందులో ప్రతి బిడ్డ తన హక్కులను సాధించుకుని సురక్షితంగా, గౌరవప్రదంగా మరియు సంపూర్ణమైన జీవితాన్ని గడుపుతాడు.',
  mission_body:'ఇప్పటికే ఉన్న శక్తిని సాకారం చేసేందుకు సమాజాలతో మరియు వ్యవస్థలతో కలిసి పనిచేయడం, తద్వారా పిల్లల హక్కులు రోజువారీ జీవితంలో గుర్తించబడేలా, అందుబాటులోకి వచ్చేలా మరియు నిలబెట్టబడేలా చూడటం.',
  theory_body:'సమాజాలు చర్య తీసుకున్నప్పుడు మరియు వ్యవస్థలు సమన్వయంతో స్పందించినప్పుడు, పిల్లల మనుగడ, అభివృద్ధి, రక్షణ మరియు భాగస్వామ్యం సాకారమై, నిలకడగా కొనసాగుతాయి.',
  eyebrow_work:'మేము ఏం చేస్తాము', work_head:'నాలుగు రంగాలు, ఒకే సమన్వయ స్పందన.',
  eyebrow_where:'మేము ఎక్కడ పనిచేస్తాము', where_head:'23 జిల్లాలు. 2 రాష్ట్రాలు. ఒక సరిహద్దు.',
  where_sub:'మేము ఉత్తర ప్రదేశ్‌లోని తూర్పు ఇండో-నేపాల్ సరిహద్దు వెంబడి మరియు మహారాష్ట్రలో పనిచేస్తాము — ఇవి ఉమ్మడి నిర్మాణాత్మక దుర్బలత్వంతో ముడిపడిన ప్రాంతాలు. క్షేత్రస్థాయి పరిస్థితిని చూడటానికి ఒక జిల్లాపై నొక్కండి.',
  eyebrow_cycle:'నిర్మాణాత్మక దుర్బలత్వ చక్రం', cycle_head:'ప్రమాదాలు వేటికవే విడిగా రావు.',
  cycle_sub:'వ్యవస్థలు సకాలంలో స్పందించకపోతే, ఇవి తరతరాలుగా ఒకదానికొకటి బలం చేకూరుస్తాయి. దీనికి స్థిరమైన క్రమం ఏదీ లేదు: ఏ బిడ్డ విషయంలోనైనా ఈ ఉచ్చు ఏ దశలోనైనా మొదలుకావచ్చు, మరియు ప్రతి ప్రమాదం తర్వాతి దాన్ని మరింత దగ్గరకు లాగుతుంది.',
  cycle_pick:'ఒక జీవితం ఎలా రూపుదిద్దుకుంటుందో తెలుసుకోవడానికి ఏదైనా ఘట్టంపై నొక్కండి.',
  cycle_note:'ఏడు ఉత్తర ప్రదేశ్ ఇండో-నేపాల్ తరాయి పట్టీ జిల్లాలు — Bahraich, Shravasti, Balrampur, Lakhimpur Kheri, Siddharthnagar, Maharajganj మరియు Kushinagar — లో నమోదైన అత్యంత తీవ్రమైన విలువను ప్రతి గణాంకం సూచిస్తుంది. మూలాలు: ఆరోగ్యం, పోషణ మరియు లింగ సంబంధిత గణాంకాల కోసం జాతీయ కుటుంబ ఆరోగ్య సర్వే 5 (2019–21) జిల్లా ఫ్యాక్ట్-షీట్ డేటాసెట్ (ఆరోగ్య మరియు కుటుంబ సంక్షేమ మంత్రిత్వ శాఖ / అంతర్జాతీయ జనాభా శాస్త్ర సంస్థ); విద్య కోసం ఏకీకృత జిల్లా విద్యా సమాచార వ్యవస్థ ప్లస్ (UDISE+) జిల్లా ఫ్యాక్ట్ షీట్లు; మరియు మాతృ మరణాల రేటు కోసం నమూనా నమోదీకరణ వ్యవస్థ, ఇది రాష్ట్ర స్థాయి గణాంకం. ప్రతి ఆరోగ్య గణాంకం ఒకే సర్వే రౌండ్ నుండి తీసుకోబడింది, కాబట్టి జిల్లాలను సమాన ప్రాతిపదికన పోల్చవచ్చు. జీవిత భాగస్వామి హింస జాతీయ కుటుంబ ఆరోగ్య సర్వే రాష్ట్ర మాడ్యూల్‌లో మాత్రమే సేకరించబడుతుంది కాబట్టి దీన్ని ఉత్తర ప్రదేశ్ గణాంకంగా చూపించారు. నాలుగు ఘట్టాలు — బాల కార్మికం, అత్యంత పేద ఆర్థిక వర్గం, మరియు శిశు, ఐదేళ్లలోపు పిల్లల మరణాల రేటు — ఇంకా పునః ధృవీకరణ కోసం ఎదురుచూస్తున్న రికార్డులపై ఆధారపడి ఉన్నాయి, మరియు అదే స్పష్టంగా పేర్కొనబడింది. శిశు లేదా ఐదేళ్లలోపు మరణాల రేటుకు భారతదేశం అధికారిక జిల్లా స్థాయి గణాంకాలను ప్రచురించదు. ప్రతి ఘట్టం తన జిల్లాను మరియు మూలాన్ని పేర్కొంటుంది.',
  eyebrow_process:'ప్రక్రియ', process_head:'సమాజాలు చర్య తీసుకున్నప్పుడు, వ్యవస్థలు స్పందిస్తాయి.', eyebrow_stories:'మార్పు కథనాలు',
  cta_donate:'పెట్టుబడి పెట్టండి', cta_donate_b:'సమాజ-నేతృత్వంలోని పనికి ఆన్‌లైన్ లేదా ఆఫ్‌లైన్‌లో ధనం లేదా వస్తు రూపంలో మద్దతు ఇవ్వండి.', cta_donate_a:'ఇప్పుడే పెట్టుబడి పెట్టండి',
  cta_vol:'స్వచ్ఛంద సేవ', cta_vol_b:'ఇంటర్న్‌గా చేరండి, వర్చువల్‌గా పనిచేయండి, లేదా DEHAT ఫెలో అవ్వండి.', cta_vol_a:'మాతో చేరండి',
  cta_partner:'భాగస్వామి', cta_partner_b:'కార్పొరేట్, విద్యా సంబంధిత లేదా సంస్థాగత భాగస్వామ్యాలు.', cta_partner_a:'సహకరించండి',
  pillar_link_work:'నాలుగు కార్యక్రమాలను చూడండి', pillar_link_how:'మేము ఎలా పనిచేస్తామో చూడండి', stories_all:'ప్రతి కథనాన్ని చదవండి',
  work_title:'హక్కులు, రోజువారీ జీవితంలో సాకారం.',
  chrono_title:'ప్రతి ప్రాజెక్టు, కాలక్రమ క్రమంలో',
  count_label:'నమోదైన ప్రాజెక్టులు',
  open_programme:'కార్యక్రమాన్ని తెరవండి',
  work_sub:'నాలుగు కార్యక్రమాలు, అవి ప్రారంభమైన క్రమంలో. ప్రతి ఒక్కటి దాని స్వంత పేజీలోకి తెరుచుకుంటుంది — ఈ పని ఎందుకు ఉనికిలో ఉంది, అది ఎలా నిర్మించబడింది, మరియు అది చేపట్టిన ప్రతి ప్రాజెక్టు, కాలక్రమ క్రమంలో, ప్రతిదాని వెనుక ఉన్న ఏమిటి, ఎక్కడ, ఎలా, ఎప్పుడు, ఎందుకు మరియు పెట్టుబడితో సహా.',
  portfolio_total:'ప్రజా రికార్డులో ఉన్న ప్రాజెక్టులు', portfolio_investment:'మొత్తం సామాజిక పెట్టుబడి',
  portfolio_count:'నాలుగు కార్యక్రమాల్లో ప్రాజెక్టులు',
  filter_year:'సంవత్సరం', filter_state:'రాష్ట్రం', filter_district:'జిల్లా', filter_sdg:'అభివృద్ధి లక్ష్యం', filter_csr:'కార్పొరేట్ సామాజిక బాధ్యత · షెడ్యూల్ VII', filter_uncrc:'బాల హక్కు', filter_investor:'సామాజిక పెట్టుబడిదారు', filter_all:'అన్నీ',
  open_details:'పూర్తి రికార్డును తెరవండి', close_details:'రికార్డును మూసివేయండి', phases_label:'దశలు',
  annual_label:'సంవత్సరం వారీగా',
  cross_from:'దీనిలో కూడా భాగం',
  shared_note:'పంచుకున్న సామాజిక పెట్టుబడి పరిమితి:',
  d_what:'మేము తీసుకురావాలనుకున్న మార్పు', d_why:'ఇది ఇక్కడ ఎందుకు ముఖ్యమైంది',
  d_how:'సమాజాలు మరియు వ్యవస్థలు కలిసి ఎలా పనిచేశాయి', d_impact:'ప్రభావ గణాంకాలు',
  d_investor:'సామాజిక పెట్టుబడిదారు', d_investors:'సామాజిక పెట్టుబడిదారులు', d_investment:'సామాజిక పెట్టుబడి',
  m_when:'ఎప్పుడు మరియు స్థితి', m_location:'ఎక్కడ', m_sdg:'అభివృద్ధి లక్ష్యాలు', m_csr:'కార్పొరేట్ సామాజిక బాధ్యత · షెడ్యూల్ VII', m_uncrc:'బాలల హక్కులు', m_law:'భారతీయ చట్టం మరియు విధాన ఆధారం', m_law_none:'ఈ ప్రాజెక్టుకు ఒకే ఒక చట్టపరమైన ఆధారం నమోదు కాలేదు.',
  invest_note:'డాక్యుమెంట్ చేసిన విధంగానే ప్రచురించబడింది; ఏకీకృతం చేయలేదు.',
  impact_eyebrow:'ప్రభావం', impact_title:'2000 నుండి, సమాజాలు తమ హక్కులను కోరుతూ, వాటిని అందించడానికి ప్రభుత్వ వ్యవస్థలతో భాగస్వామ్యంతో పనిచేస్తున్నప్పుడు వారికి తోడుగా ఉంటూ.',
  impact_sub:'1989లో యువజన సముదాయంగా ప్రారంభమై, 2000లో నమోదైంది. ఈ గణాంకాలు స్థాయిని చూపిస్తాయి; వీటి వెనుక సమాజాలు, క్షేత్రస్థాయి కార్యకర్తలు మరియు ప్రభుత్వ సంస్థలు కలిసి పనిచేయడం ఉంది.',
  reach_head:'ఇప్పటివరకు భౌగోళిక విస్తరణ', reach_states:'రాష్ట్రాలు', reach_districts:'జిల్లాలు', reach_blocks:'బ్లాక్‌లు', reach_villages:'గ్రామాలు', reach_children:'పిల్లలు & కౌమారులు', reach_farmers:'మహిళా రైతులు',
  stories_eyebrow:'మార్పు కథనాలు', stories_title:'వాస్తవం, తర్వాత పరివర్తన.',
  stories_sub:'ప్రతి కేస్ కథనం నాలుగు బాలల హక్కుల్లో ఒకదాని చుట్టూ నిర్మించబడింది — మనుగడ, అభివృద్ధి, రక్షణ, భాగస్వామ్యం.',
  involved_eyebrow:'మాతో చేరండి', involved_title:'ఇప్పటికే ఉన్న శక్తిని సాకారం చేయండి — మాతో కలిసి.',
  involved_sub:'మీరు ఒక గంట, ఒక నైపుణ్యం లేదా ఒక రూపాయి ఇచ్చినా, మీరు స్పందించే ఒక వ్యవస్థలో భాగమవుతారు.',
  involved_cta_title:'సమాజాలతో కలిసి పెట్టుబడి పెట్టండి.',
  involved_cta_sub:'ధనం లేదా వస్తు రూపంలో, ఆన్‌లైన్ లేదా ఆఫ్‌లైన్‌లో — ప్రతి రూపాయి, మేము వెళ్లిపోయిన తర్వాత కూడా సమాజాలు నిలుపుకునే సామర్థ్యంలోకి వెళ్తుంది.',
  donate_now:'భాగస్వామ్యాన్ని ప్రారంభించండి', email_us:'మాకు ఈమెయిల్ చేయండి', f_email:'ఈమెయిల్', f_phone:'ఫోన్', f_web:'వెబ్', f_address:'చిరునామా',
  nav_finance:'పారదర్శకత', nav_answers:'సమాధానాలు',
  fin_eyebrow:'ఆర్థిక పారదర్శకత', fin_title:'ప్రతి రూపాయి, రికార్డులో ఉంది.',
  fin_sub:'స్వతంత్రంగా ఆడిట్ చేయబడిన ఖాతాలు — పెట్టుబడి భాగస్వాములు కట్టుబడినది, పనికి చేరినది, మరియు ఈ రెండింటి వెనుక ఉన్న చట్టపరమైన తనిఖీలు. ప్రతి గణాంకం సంతకం చేసిన బ్యాలెన్స్ షీట్ నుండి తీసుకోబడింది.',
  fin_stat_received:'20 సంవత్సరాలలో కట్టుబడినది', fin_stat_fcra:'విదేశీ విరాళం · విదేశీ విరాళం (నియంత్రణ) చట్టం', fin_stat_inr:'దేశీయ విరాళం · భారతీయ రూపాయలు', fin_stat_funders:'నమోదైన పెట్టుబడి భాగస్వాములు',
  fin_years_head:'సంవత్సరం వారీగా', fin_years_sub:'ఏమి వచ్చింది, ఏమి ఖర్చు చేయబడింది, మరియు ఖాతాలపై ఎవరు సంతకం చేశారు. ఆ సంవత్సరపు సామాజిక పెట్టుబడిదారులను చూడటానికి ఒక సంవత్సరాన్ని ఎంచుకోండి.',
  fin_received:'కట్టుబడినది', fin_utilised:'వినియోగించినది', fin_auditor:'ఆడిటర్', fin_bs:'బ్యాలెన్స్ షీట్', fin_surplus:'మిగులు', fin_deficit:'లోటు', fin_partial:'పాక్షిక డేటా', fin_compiled:'సంకలనం చేయబడింది',
  fin_funders_head:'ఈ పనిలో ఎవరు పెట్టుబడి పెడతారు', fin_funders_sub:'ఈ పనికి ధనం అందించే సంస్థలు మరియు వ్యక్తులు — ఏకపక్ష దాతలు కాదు, ఉమ్మడి ఫలితంలో భాగస్వాములు. చట్టం నిర్దేశించినట్లుగా, విదేశీ విరాళాలు ప్రత్యేక విదేశీ విరాళం (నియంత్రణ) చట్టం ఖాతాలో ఉంచబడి, ఆడిట్ చేయబడతాయి; దేశీయ నిధులు రూపాయి ఖాతాల ద్వారా నడుస్తాయి.',
  fin_regime_fcra:'విదేశీ విరాళం (నియంత్రణ) చట్టం · విదేశీ', fin_regime_inr:'భారతీయ రూపాయి · దేశీయ',
  fin_funders_cta:'ప్రతి భాగస్వామిని చూడండి',
  fin_compliance_head:'చట్టపరమైన అనుసరణ', fin_compliance_sub:'DEHAT ఒక నమోదైన సొసైటీ (సొసైటీస్ రిజిస్ట్రేషన్ చట్టం, 1860). ఒక సమీక్షకుడు చూడాలని ఆశించే వార్షిక జవాబుదారీ చక్రం ఇక్కడ ఉంది — మరియు DEHAT దీన్ని దాఖలు చేస్తుంది.',
  fin_reg_head:'నమోదులు', fin_cal_head:'వార్షిక దాఖలు క్యాలెండర్', fin_rules_head:'మేము ఏ ప్రమాణాలకు అనుగుణంగా నివేదిస్తాము',
  fin_auditor_trail:'ప్రతి సంవత్సరం ఒక ప్రాక్టీసింగ్ చార్టర్డ్ అకౌంటెంట్ చేత ఆడిట్ చేయబడి, యూనిక్ డాక్యుమెంట్ ఐడెంటిఫికేషన్ నంబర్‌తో సంతకం చేయబడుతుంది. గత దశాబ్దంలో ఐదు వేర్వేరు సంస్థలు ఖాతాలను పరిశీలించాయి — ఒకే దీర్ఘకాలిక సంబంధం లేదు.',
  fin_due:'గడువు', fin_year_funders:'ఈ సంవత్సరపు పెట్టుబడి భాగస్వాములు',
  fin_docs_head:'ధృవీకరణలు & పత్రాలు', fin_docs_sub:'ప్రతి నమోదు, ఆమోదం మరియు మూడవ పక్షం ధృవీకరణ — అసలు సర్టిఫికెట్ నుండి స్కాన్ చేయబడింది. మూల పత్రాన్ని చదవడానికి దేనినైనా తెరవండి.',
  fin_docg_statutory:'నమోదు & పన్ను', fin_docg_fcra:'విదేశీ విరాళం · విదేశీ విరాళం (నియంత్రణ) చట్టం', fin_docg_validation:'ధృవీకరణలు & గుర్తింపు',
  fin_doc_view:'పత్రాన్ని చూడండి', fin_pending_label:'ఆడిట్ చేసిన స్కాన్ ఫైల్‌లో ఉంది — గణాంకాలు డిజిటలైజ్ చేయబడుతున్నాయి',
  foot_explore:'అన్వేషించండి', foot_reach:'మమ్మల్ని సంప్రదించండి', foot_follow:'ఈ పనిని అనుసరించండి',
  foot_desc:'మానవ అభ్యున్నతి కోసం అభివృద్ధి సంఘం — పిల్లల హక్కులు గుర్తించబడేలా, అందుబాటులోకి వచ్చేలా మరియు నిలబెట్టబడేలా సమాజాలు మరియు వ్యవస్థలతో కలిసి పనిచేస్తోంది.',
  foot_rights:'© 2026 DEHAT · 1989లో యువజన సముదాయంగా ప్రారంభం · 2000లో నమోదు',
    };
    const TA = {
foot_policies:'கொள்கைகள் மற்றும் பாதுகாப்பு நடவடிக்கைகள்', foot_cookies:'குக்கீ அமைப்புகள்',
  nav_home:'முகப்பு', nav_who:'நாங்கள் யார்', nav_work:'எங்கள் பணி', nav_impact:'தாக்கம்', nav_stories:'கதைகள்', nav_media:'ஊடகம்', nav_involved:'இணைந்து செயல்படுங்கள்',
  donate:'முதலீடு செய்யுங்கள்', since:'1989 முதல்', org_full:'மனித முன்னேற்றத்திற்கான வளர்ச்சிச் சங்கம்',
  language:'மொழி', lang_indian:'இந்திய மொழிகள்', lang_global:'உலகளாவிய (ஐ.நா)',
  hero_title_a:'ஒவ்வொரு குழந்தையும் தனது ', hero_title_b:'உரிமைகளை', hero_title_c:' உணரும் ஒரு குழந்தை மையச் சமூகம் — பாதுகாப்பான, கண்ணியமான, முழுமையான வாழ்வு.',
  hero_sub:'இந்திய-நேபாள தராய் பகுதி முழுவதும் உள்ள சமூகங்கள் மற்றும் அரசு அமைப்புகளுடன் இணைந்து நாங்கள் பணியாற்றுகிறோம், இதனால் குழந்தைகளின் உரிமைகள் வெறும் ஆவணங்களில் மட்டும் நின்றுவிடாமல், அன்றாட வாழ்வில் அங்கீகரிக்கப்பட்டு, அடையப்பட்டு, நிலைநிறுத்தப்படும்.',
  hero_cta1:'சமூகங்களுடன் இணைந்து நில்லுங்கள்', hero_cta2:'நாங்கள் எப்படி பணியாற்றுகிறோம் எனப் பாருங்கள்', hero_photo:'படம் — குழந்தைகள் பாராளுமன்றத் தலைவர்கள், Lohra கிராமம், Bahraich',
  hero_principle:'சமூகங்கள் மற்றும் அரசு அமைப்புகளுடன் இணைந்து, ஒவ்வொரு குழந்தைக்காகவும்.',
  stat_children:'சென்றடைந்த குழந்தைகள் மற்றும் இளம் பருவத்தினர்', stat_invested:'2000 முதல் சமூக அமைப்புகளில் செய்யப்பட்ட முதலீடு', stat_resources:'அணுகப்பட்ட அரசு வளங்கள்', stat_districts:'2 மாநிலங்களில் பரவியுள்ள மாவட்டங்கள்',
  stat_hint:'நான்கு புள்ளிவிவரங்கள், மறைக்கப்பட்டுள்ளன. ஒன்றைத் தட்டிப் பாருங்கள்.', stat_reveal:'காண தட்டவும்', stat_hide:'மறை', stat_reveal_all:'நான்கையும் காட்டு', stat_hide_all:'அனைத்தையும் மறை', grid_reveal_all:'பதினான்கையும் காட்டு', grid_hint:'பதினான்கு புள்ளிவிவரங்கள், மறைக்கப்பட்டுள்ளன. ஒன்றைத் தட்டிப் பாருங்கள்.', bl_drag:'கணக்கெடுப்பை முன்னோக்கி இழுக்கவும்',
  vision:'தொலைநோக்கு', mission:'நோக்கம்', theory:'மாற்றத்தின் கோட்பாடு',
  vision_body:'ஒவ்வொரு குழந்தையும் தனது உரிமைகளை உணர்ந்து, பாதுகாப்பான, கண்ணியமான, நிறைவான வாழ்க்கை வாழும் ஒரு குழந்தை மையச் சமூகம்.',
  mission_body:'சமூகங்கள் மற்றும் அமைப்புகளுடன் இணைந்து, ஏற்கெனவே உள்ள ஆற்றலை நனவாக்கி, குழந்தைகளின் உரிமைகள் அன்றாட வாழ்வில் அங்கீகரிக்கப்பட்டு, அடையப்பட்டு, நிலைநிறுத்தப்படுவதை உறுதி செய்தல்.',
  theory_body:'சமூகங்கள் செயல்படும்போதும், அமைப்புகள் ஒருங்கிணைந்து பதிலளிக்கும்போதும், குழந்தைகளின் உயிர்வாழ்வு, வளர்ச்சி, பாதுகாப்பு மற்றும் பங்கேற்பு நனவாகி நிலைத்து நிற்கின்றன.',
  eyebrow_work:'நாங்கள் என்ன செய்கிறோம்', work_head:'நான்கு முனைகள், ஒரு ஒருங்கிணைந்த பதில்.',
  eyebrow_where:'நாங்கள் பணியாற்றும் இடங்கள்', where_head:'23 மாவட்டங்கள். 2 மாநிலங்கள். ஒரு எல்லை.',
  where_sub:'உத்தரப் பிரதேசத்தின் கிழக்கு இந்திய-நேபாள எல்லைப் பகுதியிலும், மகாராஷ்டிராவிலும் நாங்கள் பணியாற்றுகிறோம் — பொதுவான கட்டமைப்பு ரீதியான பாதிப்புநிலையால் இணைக்கப்பட்ட பகுதிகள். ஒரு மாவட்டத்தைத் தட்டி நிலைமையைக் காணுங்கள்.',
  eyebrow_cycle:'கட்டமைப்பு ரீதியான பாதிப்புநிலைச் சுழற்சி', cycle_head:'ஆபத்துகள் தனித்தனியாக நிகழ்வதில்லை.',
  cycle_sub:'அமைப்புகள் காலத்தில் பதிலளிக்காதவரை, இவை தலைமுறை தலைமுறையாக ஒன்றையொன்று வலுப்படுத்திக் கொள்கின்றன. இதற்கு நிலையான வரிசை என்று ஒன்று இல்லை: எந்தவொரு குழந்தைக்கும், இந்தச் சிக்கல் எந்தப் புள்ளியிலும் தொடங்கலாம், ஒவ்வொரு ஆபத்தும் அடுத்ததை மேலும் நெருக்கமாக இழுத்து வருகிறது.',
  cycle_pick:'ஒரு வாழ்க்கை எப்படி வடிவமைக்கப்படுகிறது என்பதைப் பின்தொடர, எந்த ஒரு தருணத்தையும் தட்டவும்.',
  cycle_note:'ஒவ்வொரு புள்ளிவிவரமும் உத்தரப் பிரதேசத்தின் இந்திய-நேபாள தராய் பட்டையின் ஏழு மாவட்டங்களில் — Bahraich, Shravasti, Balrampur, Lakhimpur Kheri, Siddharthnagar, Maharajganj மற்றும் Kushinagar — பதிவான மிக மோசமான மதிப்பைக் குறிக்கிறது. மூலங்கள்: சுகாதாரம், ஊட்டச்சத்து மற்றும் பாலினம் தொடர்பான அளவீடுகளுக்கு தேசிய குடும்ப நலவாழ்வு கணக்கெடுப்பு 5 (2019–21) மாவட்டத் தரவுத் தொகுப்பு (சுகாதாரம் மற்றும் குடும்ப நல அமைச்சகம் / சர்வதேச மக்கள்தொகை அறிவியல் நிறுவனம்); பள்ளிக் கல்விக்கு கல்விக்கான ஒருங்கிணைந்த மாவட்டத் தகவல் அமைப்பு பிளஸ் (UDISE+) மாவட்டத் தரவுத் தாள்கள்; மற்றும் தாய்வழி இறப்பு விகிதத்திற்கு மாதிரி பதிவு முறைமை, இது மாநில அளவில் மட்டுமே கிடைக்கிறது. ஒவ்வொரு சுகாதாரப் புள்ளிவிவரமும் ஒரே கணக்கெடுப்புச் சுற்றிலிருந்து பெறப்பட்டதால், மாவட்டங்கள் ஒரே அடிப்படையில் ஒப்பிடப்படுகின்றன. மனைவி-கணவர் வன்முறை தேசிய குடும்ப நலவாழ்வு கணக்கெடுப்பின் மாநிலப் பிரிவில் மட்டுமே சேகரிக்கப்படுவதால், அது உத்தரப் பிரதேசப் புள்ளிவிவரமாகவே காட்டப்படுகிறது. நான்கு தருணங்கள் — சிறுவர் தொழிலாளர், மிக வறிய செல்வ வகுப்பு, மற்றும் குழந்தை பிறப்பு இறப்பு மற்றும் ஐந்து வயதிற்குட்பட்ட இறப்பு விகிதங்கள் — இன்னும் மறு சரிபார்ப்புக்காகக் காத்திருக்கும் பதிவுகளை அடிப்படையாகக் கொண்டவை, இது தெளிவாகவே குறிப்பிடப்பட்டுள்ளது. இந்தியா குழந்தை பிறப்பு இறப்பு அல்லது ஐந்து வயதிற்குட்பட்ட இறப்பு விகிதத்திற்கான அதிகாரப்பூர்வ மாவட்ட வரிசைத் தரவை வெளியிடுவதில்லை. ஒவ்வொரு தருணமும் அதன் மாவட்டத்தையும் மூலத்தையும் குறிப்பிடுகிறது.',
  eyebrow_process:'செயல்முறை', process_head:'சமூகங்கள் செயல்படும்போது, அமைப்புகள் பதிலளிக்கின்றன.', eyebrow_stories:'மாற்றத்தின் கதைகள்',
  cta_donate:'முதலீடு செய்யுங்கள்', cta_donate_b:'ஆன்லைனிலோ அல்லது ஆஃப்லைனிலோ, மூலதனம் அல்லது பொருள் மூலம் சமூகம் வழிநடத்தும் பணிக்குத் துணை நில்லுங்கள்.', cta_donate_a:'இப்போதே முதலீடு செய்யுங்கள்',
  cta_vol:'தன்னார்வலராகுங்கள்', cta_vol_b:'பயிற்சியாளராகச் சேருங்கள், இணையவழியில் பணியாற்றுங்கள், அல்லது DEHAT ஃபெலோ ஆகுங்கள்.', cta_vol_a:'எங்களுடன் இணையுங்கள்',
  cta_partner:'கூட்டாளராகுங்கள்', cta_partner_b:'நிறுவனம், கல்வி அல்லது நிறுவனரீதியான கூட்டாண்மைகள்.', cta_partner_a:'ஒத்துழையுங்கள்',
  pillar_link_work:'நான்கு திட்டங்களையும் காணுங்கள்', pillar_link_how:'நாங்கள் எப்படி பணியாற்றுகிறோம் எனக் காணுங்கள்', stories_all:'ஒவ்வொரு கதையையும் படியுங்கள்',
  work_title:'உரிமைகள், அன்றாட வாழ்வில் நனவாகின்றன.',
  chrono_title:'ஒவ்வொரு திட்டமும், காலவரிசைப்படி',
  count_label:'பதிவில் உள்ள திட்டங்கள்',
  open_programme:'திட்டத்தைத் திற',
  work_sub:'நான்கு திட்டங்கள், அவை தொடங்கிய வரிசையில். ஒவ்வொன்றும் தனக்கேயுரிய பக்கத்தில் திறக்கும் — இந்தப் பணி ஏன் இருக்கிறது, அது எப்படிக் கட்டமைக்கப்பட்டுள்ளது, மற்றும் அது மேற்கொண்ட ஒவ்வொரு திட்டமும், காலவரிசைப்படி, ஒவ்வொன்றின் பின்னணியிலும் உள்ள என்ன, எங்கே, எப்படி, எப்போது, ஏன் மற்றும் முதலீடு ஆகியவற்றுடன்.',
  portfolio_total:'பொது பதிவில் உள்ள திட்டங்கள்', portfolio_investment:'மொத்த சமூக முதலீடு',
  portfolio_count:'நான்கு திட்டங்களில் பரவியுள்ள திட்டப்பணிகள்',
  filter_year:'ஆண்டு', filter_state:'மாநிலம்', filter_district:'மாவட்டம்', filter_sdg:'வளர்ச்சி இலக்கு', filter_csr:'பெருநிறுவன சமூகப் பொறுப்பு · அட்டவணை VII', filter_uncrc:'குழந்தை உரிமை', filter_investor:'சமூக முதலீட்டாளர்', filter_all:'அனைத்தும்',
  open_details:'முழுப் பதிவையும் திற', close_details:'பதிவை மூடு', phases_label:'கட்டங்கள்',
  annual_label:'ஆண்டுவாரியாக',
  cross_from:'இதிலும் ஒரு பகுதி',
  shared_note:'பகிரப்பட்ட சமூக முதலீட்டுத் தொகை:',
  d_what:'நாங்கள் ஏற்படுத்த நினைத்த மாற்றம்', d_why:'இது ஏன் இங்கு முக்கியமானது',
  d_how:'சமூகங்களும் அமைப்புகளும் எப்படி இணைந்து பணியாற்றின', d_impact:'தாக்கப் புள்ளிவிவரங்கள்',
  d_investor:'சமூக முதலீட்டாளர்', d_investors:'சமூக முதலீட்டாளர்கள்', d_investment:'சமூக முதலீடு',
  m_when:'எப்போது மற்றும் நிலை', m_location:'எங்கே', m_sdg:'வளர்ச்சி இலக்குகள்', m_csr:'பெருநிறுவன சமூகப் பொறுப்பு · அட்டவணை VII', m_uncrc:'குழந்தையின் உரிமைகள்', m_law:'இந்திய சட்டம் மற்றும் கொள்கை அடிப்படை', m_law_none:'இந்தத் திட்டத்திற்கு ஒரு குறிப்பிட்ட சட்டப்பூர்வ அடிப்படை எதுவும் பதிவு செய்யப்படவில்லை.',
  invest_note:'ஆவணப்படுத்தப்பட்டபடியே வெளியிடப்பட்டுள்ளது; ஒருங்கிணைக்கப்படவில்லை.',
  impact_eyebrow:'தாக்கம்', impact_title:'2000 முதல், சமூகங்கள் தங்கள் உரிமைகளைக் கோரி, அவற்றை நிறைவேற்ற அரசு அமைப்புகளுடன் இணைந்து பணியாற்றும்போது அவர்களுடன் உடன் நடந்து வருகிறோம்.',
  impact_sub:'1989-இல் ஓர் இளைஞர் கூட்டமைப்பாகத் தொடங்கி, 2000-இல் பதிவு செய்யப்பட்டது. இந்தப் புள்ளிவிவரங்கள் அளவைக் காட்டுகின்றன; இவற்றுக்குப் பின்னால் இருப்பது சமூகங்கள், களப்பணியாளர்கள் மற்றும் அரசு நிறுவனங்கள் இணைந்து செயல்படுவதுதான்.',
  reach_head:'இதுவரையிலான புவியியல் எல்லை', reach_states:'மாநிலங்கள்', reach_districts:'மாவட்டங்கள்', reach_blocks:'பிளாக்குகள்', reach_villages:'கிராமங்கள்', reach_children:'குழந்தைகள் மற்றும் இளம் பருவத்தினர்', reach_farmers:'பெண் விவசாயிகள்',
  stories_eyebrow:'மாற்றத்தின் கதைகள்', stories_title:'யதார்த்தம், பின்னர் மாற்றம்.',
  stories_sub:'ஒவ்வொரு நிகழ்வுக் கதையும் நான்கு குழந்தை உரிமைகளில் ஒன்றை மையமாகக் கொண்டு அமைக்கப்பட்டுள்ளது — உயிர்வாழ்வு, வளர்ச்சி, பாதுகாப்பு, பங்கேற்பு.',
  involved_eyebrow:'இணைந்து செயல்படுங்கள்', involved_title:'ஏற்கெனவே உள்ள ஆற்றலை நனவாக்குங்கள் — எங்களுடன்.',
  involved_sub:'நீங்கள் ஒரு மணி நேரத்தையோ, ஒரு திறமையையோ, அல்லது ஒரு ரூபாயையோ கொடுத்தாலும், பதிலளிக்கும் ஒரு அமைப்பின் ஒரு பகுதியாக நீங்கள் மாறுகிறீர்கள்.',
  involved_cta_title:'சமூகங்களுடன் இணைந்து முதலீடு செய்யுங்கள்.',
  involved_cta_sub:'மூலதனமோ பொருளோ, ஆன்லைனிலோ ஆஃப்லைனிலோ — ஒவ்வொரு ரூபாயும் நாங்கள் விலகிய பிறகும் சமூகங்கள் தக்கவைத்துக் கொள்ளும் திறனுக்குள் செல்கிறது.',
  donate_now:'ஒரு கூட்டாண்மையைத் தொடங்குங்கள்', email_us:'எங்களுக்கு மின்னஞ்சல் அனுப்புங்கள்', f_email:'மின்னஞ்சல்', f_phone:'தொலைபேசி', f_web:'இணையதளம்', f_address:'முகவரி',
  nav_finance:'வெளிப்படைத்தன்மை', nav_answers:'பதில்கள்',
  fin_eyebrow:'நிதி வெளிப்படைத்தன்மை', fin_title:'ஒவ்வொரு ரூபாயும், பதிவில்.',
  fin_sub:'சுயேச்சையாகத் தணிக்கை செய்யப்பட்ட கணக்குகள் — முதலீட்டுக் கூட்டாளர்கள் உறுதியளித்தது, பணிக்கு உண்மையில் சென்றடைந்தது, மற்றும் இரண்டிற்கும் பின்னால் உள்ள சட்டப்பூர்வ சரிபார்ப்புகள். ஒவ்வொரு புள்ளிவிவரமும் கையொப்பமிடப்பட்ட இருப்புநிலைக் குறிப்பிலிருந்து எடுக்கப்பட்டது.',
  fin_stat_received:'20 ஆண்டுகளில் உறுதியளிக்கப்பட்டது', fin_stat_fcra:'வெளிநாட்டு நன்கொடை · வெளிநாட்டு நன்கொடை (ஒழுங்குமுறை) சட்டம்', fin_stat_inr:'உள்நாட்டு நன்கொடை · இந்திய ரூபாய்', fin_stat_funders:'பதிவில் உள்ள முதலீட்டுக் கூட்டாளர்கள்',
  fin_years_head:'ஆண்டுவாரியாக', fin_years_sub:'என்ன வரவு ஆனது, என்ன செலவழிக்கப்பட்டது, மற்றும் கணக்குகளில் யார் கையொப்பமிட்டார்கள். அந்த ஆண்டின் சமூக முதலீட்டாளர்களைக் காண ஒரு ஆண்டைத் தேர்ந்தெடுங்கள்.',
  fin_received:'உறுதியளிக்கப்பட்டது', fin_utilised:'பயன்படுத்தப்பட்டது', fin_auditor:'தணிக்கையாளர்', fin_bs:'இருப்புநிலைக் குறிப்பு', fin_surplus:'உபரி', fin_deficit:'பற்றாக்குறை', fin_partial:'பகுதி தரவு', fin_compiled:'தொகுக்கப்பட்டது',
  fin_funders_head:'இந்தப் பணியில் யார் முதலீடு செய்கிறார்கள்', fin_funders_sub:'இந்தப் பணிக்கு மூலதனம் அளிக்கும் நிறுவனங்களும் தனிநபர்களும் — ஒருதலைப்பட்சமான நன்கொடையாளர்கள் அல்ல, ஒரு பகிரப்பட்ட விளைவில் கூட்டாளர்கள். சட்டம் கோருவதற்கேற்ப, வெளிநாட்டு நன்கொடைகள் தனியான வெளிநாட்டு நன்கொடை (ஒழுங்குமுறை) சட்டக் கணக்கில் வைக்கப்பட்டுத் தணிக்கை செய்யப்படுகின்றன; உள்நாட்டு நிதி ரூபாய்க் கணக்குகள் வழியாக இயங்குகிறது.',
  fin_regime_fcra:'வெளிநாட்டு நன்கொடை (ஒழுங்குமுறை) சட்டம் · வெளிநாட்டு', fin_regime_inr:'இந்திய ரூபாய் · உள்நாட்டு',
  fin_funders_cta:'அனைத்துக் கூட்டாளர்களையும் காணுங்கள்',
  fin_compliance_head:'சட்டப்பூர்வ இணக்கம்', fin_compliance_sub:'DEHAT ஒரு பதிவு செய்யப்பட்ட சங்கமாகும் (சங்கங்கள் பதிவுச் சட்டம், 1860). ஒரு மதிப்பாய்வாளர் காண எதிர்பார்க்கும், DEHAT தாக்கல் செய்யும் ஆண்டு பொறுப்புக்கூறல் சுழற்சி கீழே கொடுக்கப்பட்டுள்ளது.',
  fin_reg_head:'பதிவுகள்', fin_cal_head:'ஆண்டு தாக்கல் நாள்காட்டி', fin_rules_head:'நாங்கள் எதற்கு எதிராக அறிக்கை அளிக்கிறோம்',
  fin_auditor_trail:'ஒவ்வொரு ஆண்டும் பயிற்சி பெற்ற சார்டர்டு அக்கவுன்டன்ட் ஒருவரால் தணிக்கை செய்யப்பட்டு, தனித்துவ ஆவண அடையாள எண்ணுடன் கையொப்பமிடப்படுகிறது. கடந்த பத்தாண்டுகளில் ஐந்து வெவ்வேறு நிறுவனங்கள் கணக்குகளை ஆய்வு செய்துள்ளன — ஒரே நீண்டகால உறவு எதுவும் இல்லை.',
  fin_due:'கடைசி தேதி', fin_year_funders:'இந்த ஆண்டின் முதலீட்டுக் கூட்டாளர்கள்',
  fin_docs_head:'சான்றுகள் மற்றும் ஆவணங்கள்', fin_docs_sub:'ஒவ்வொரு பதிவு, ஒப்புதல் மற்றும் மூன்றாம் தரப்பு உறுதிப்படுத்தலும் — அசல் சான்றிதழிலிருந்து ஸ்கேன் செய்யப்பட்டது. மூல ஆவணத்தைப் படிக்க எதையேனும் திறக்கவும்.',
  fin_docg_statutory:'பதிவு மற்றும் வரி', fin_docg_fcra:'வெளிநாட்டு நன்கொடை · வெளிநாட்டு நன்கொடை (ஒழுங்குமுறை) சட்டம்', fin_docg_validation:'உறுதிப்படுத்தல்கள் மற்றும் அங்கீகாரம்',
  fin_doc_view:'ஆவணத்தைக் காண்க', fin_pending_label:'தணிக்கை செய்யப்பட்ட ஸ்கேன் கோப்பில் உள்ளது — புள்ளிவிவரங்கள் டிஜிட்டல் மயமாக்கப்பட்டு வருகின்றன',
  foot_explore:'ஆராயுங்கள்', foot_reach:'எங்களைத் தொடர்பு கொள்ளுங்கள்', foot_follow:'பணியைப் பின்தொடருங்கள்',
  foot_desc:'மனித முன்னேற்றத்திற்கான வளர்ச்சிச் சங்கம் — குழந்தைகளின் உரிமைகள் அங்கீகரிக்கப்பட்டு, அடையப்பட்டு, நிலைநிறுத்தப்படும் வகையில் சமூகங்கள் மற்றும் அமைப்புகளுடன் இணைந்து பணியாற்றுகிறோம்.',
  foot_rights:'© 2026 DEHAT · 1989-இல் இளைஞர் கூட்டமைப்பாகத் தொடங்கியது · 2000-இல் பதிவு செய்யப்பட்டது',
    };
    const GU = {
foot_policies:'નીતિઓ અને સુરક્ષા ઉપાયો', foot_cookies:'કૂકી સેટિંગ્સ',
  nav_home:'મુખપૃષ્ઠ', nav_who:'અમે કોણ છીએ', nav_work:'અમારું કાર્ય', nav_impact:'અસર', nav_stories:'વાર્તાઓ', nav_media:'મીડિયા', nav_involved:'સાથે જોડાઓ',
  donate:'રોકાણ કરો', since:'1989થી', org_full:'માનવ ઉન્નતિ માટે વિકાસ સંગઠન',
  language:'ભાષા', lang_indian:'ભારતીય ભાષાઓ', lang_global:'વૈશ્વિક (UN)',
  hero_title_a:'એક બાળ-કેન્દ્રિત સમાજ જ્યાં દરેક બાળક પોતાના ', hero_title_b:'અધિકારો', hero_title_c:' ને પ્રાપ્ત કરે — સુરક્ષિત, ગૌરવપૂર્ણ અને સંપૂર્ણ.',
  hero_sub:'અમે ભારત-નેપાળ તરાઈ ક્ષેત્રમાં સમુદાયો અને જાહેર તંત્રો સાથે કાર્ય કરીએ છીએ, જેથી બાળકોના અધિકારો ફક્ત કાગળ પર ન રહે, પરંતુ રોજિંદા જીવનમાં ઓળખાય, પ્રાપ્ત થાય અને સુનિશ્ચિત બને.',
  hero_cta1:'સમુદાયો સાથે ઊભા રહો', hero_cta2:'અમારું કાર્ય જુઓ', hero_photo:'ફોટો — બાળ સંસદ નેતાઓ, લોહરા ગામ, બહરાઈચ',
  hero_principle:'સમુદાયો અને સરકારી તંત્રો સાથે મળીને, દરેક બાળક માટે.',
  stat_children:'બાળકો અને કિશોરો સુધી પહોંચ', stat_invested:'2000થી સામુદાયિક તંત્રોમાં રોકાણ', stat_resources:'જાહેર સંસાધનો પ્રાપ્ત', stat_districts:'2 રાજ્યોના જિલ્લા',
  stat_hint:'ચાર આંકડા, છુપાયેલા છે. જોવા માટે એક પર ટેપ કરો.', stat_reveal:'બતાવવા માટે ટેપ કરો', stat_hide:'છુપાવો', stat_reveal_all:'ચારેય બતાવો', stat_hide_all:'બધું છુપાવો', grid_reveal_all:'ચૌદેય બતાવો', grid_hint:'ચૌદ આંકડા, છુપાયેલા છે. જોવા માટે એક પર ટેપ કરો.', bl_drag:'સર્વેને આગળ ખેંચો',
  vision:'દ્રષ્ટિ', mission:'ધ્યેય', theory:'પરિવર્તનનો સિદ્ધાંત',
  vision_body:'એક બાળ-કેન્દ્રિત સમાજ જ્યાં દરેક બાળક પોતાના અધિકારો પ્રાપ્ત કરે અને સુરક્ષિત, ગૌરવપૂર્ણ તથા સંપૂર્ણ જીવન જીવે.',
  mission_body:'સમુદાયો અને તંત્રો સાથે મળીને હાલની શક્તિને સાકાર કરવી, જેથી બાળકોના અધિકારો રોજિંદા જીવનમાં ઓળખાય, પ્રાપ્ત થાય અને સુનિશ્ચિત બને.',
  theory_body:'જ્યારે સમુદાયો કાર્ય કરે છે અને તંત્રો સંગઠિત રીતે પ્રતિભાવ આપે છે, ત્યારે બાળકોનું અસ્તિત્વ, વિકાસ, સંરક્ષણ અને સહભાગિતા સાકાર અને ટકાઉ બને છે.',
  eyebrow_work:'અમે શું કરીએ છીએ', work_head:'ચાર મોરચા, એક સંયુક્ત પ્રતિભાવ.',
  eyebrow_where:'અમે ક્યાં કાર્ય કરીએ છીએ', where_head:'23 જિલ્લા. 2 રાજ્યો. એક સીમા.',
  where_sub:'અમે ઉત્તર પ્રદેશની પૂર્વ ભારત-નેપાળ સીમા પર અને મહારાષ્ટ્રમાં કાર્ય કરીએ છીએ — એવા વિસ્તારો જે સહિયારી માળખાકીય નબળાઈથી બંધાયેલા છે. જમીની હકીકત જોવા માટે કોઈ જિલ્લા પર ટેપ કરો.',
  eyebrow_cycle:'માળખાકીય નબળાઈનું ચક્ર', cycle_head:'જોખમો એકલા નથી આવતા.',
  cycle_sub:'તેઓ પેઢી-દર-પેઢી એકબીજાને મજબૂત કરે છે — જ્યાં સુધી તંત્રો સમયસર પ્રતિભાવ ન આપે. કોઈ નિશ્ચિત ક્રમ નથી: કોઈ પણ બાળક માટે આ જાળ કોઈ પણ બિંદુથી શરૂ થઈ શકે છે, અને દરેક જોખમ પછીના જોખમને વધુ નજીક ખેંચી લાવે છે.',
  cycle_pick:'એક જીવન કેવી રીતે ઘડાય છે તે જોવા માટે કોઈ પણ ક્ષણ પર ટેપ કરો.',
  cycle_note:'દરેક આંકડો ઉત્તર પ્રદેશની ભારત-નેપાળ તરાઈ પટ્ટીના સાત જિલ્લા — બહરાઈચ, શ્રાવસ્તી, બલરામપુર, લખીમપુર ખીરી, સિદ્ધાર્થનગર, મહારાજગંજ અને કુશીનગર — માં નોંધાયેલ સૌથી ગંભીર (સૌથી ખરાબ) મૂલ્ય દર્શાવે છે. સ્રોતો: સ્વાસ્થ્ય, પોષણ અને લિંગ સંબંધિત આંકડા માટે રાષ્ટ્રીય પરિવાર સ્વાસ્થ્ય સર્વેક્ષણ 5 (2019–21)ના જિલ્લા ફેક્ટ-શીટ ડેટાસેટ (સ્વાસ્થ્ય અને પરિવાર કલ્યાણ મંત્રાલય / આંતરરાષ્ટ્રીય વસ્તી વિજ્ઞાન સંસ્થાન) પરથી; શિક્ષણ સંબંધિત આંકડા શિક્ષણ માટે એકીકૃત જિલ્લા માહિતી પ્રણાલી પ્લસ (UDISE+)ની જિલ્લા ફેક્ટ શીટ પરથી; અને માતૃ મૃત્યુ દર — જે રાજ્ય-સ્તરનો આંકડો છે — નમૂના નોંધણી પ્રણાલી પરથી. દરેક સ્વાસ્થ્ય આંકડો એક જ સર્વેક્ષણ રાઉન્ડમાંથી લેવાયો છે, જેથી જિલ્લાઓની સરખામણી સમાન ધોરણે થાય. દામ્પત્ય હિંસાનો આંકડો રાષ્ટ્રીય પરિવાર સ્વાસ્થ્ય સર્વેક્ષણના રાજ્ય મોડ્યુલમાં જ એકત્ર થાય છે, અને તેથી તે ઉત્તર પ્રદેશના આંકડા તરીકે દર્શાવવામાં આવ્યો છે. ચાર ક્ષણો — બાળ મજૂરી, સૌથી ગરીબ સંપત્તિ વર્ગ, અને શિશુ તથા પાંચ-વર્ષથી નીચેની મૃત્યુ દર — એવા દસ્તાવેજો પર આધારિત છે જે હજુ પુનઃચકાસણીની રાહ જુએ છે, અને એ વાત સ્પષ્ટપણે દર્શાવવામાં આવી છે. ભારત શિશુ કે પાંચ-વર્ષથી નીચેની મૃત્યુ દર માટે કોઈ સત્તાવાર જિલ્લા-સ્તરીય શ્રેણી પ્રકાશિત કરતું નથી. દરેક ક્ષણ પોતાનો જિલ્લો અને સ્રોત દર્શાવે છે.',
  eyebrow_process:'પ્રક્રિયા', process_head:'જ્યારે સમુદાયો કાર્ય કરે છે, ત્યારે તંત્રો પ્રતિભાવ આપે છે.', eyebrow_stories:'પરિવર્તનની વાર્તાઓ',
  cta_donate:'રોકાણ કરો', cta_donate_b:'સમુદાય-સંચાલિત કાર્યને મૂડી કે સામગ્રીથી, ઓનલાઇન કે ઓફલાઇન ટેકો આપો.', cta_donate_a:'હમણાં રોકાણ કરો',
  cta_vol:'સ્વયંસેવા', cta_vol_b:'ઇન્ટર્નશિપ કરો, વર્ચ્યુઅલ કાર્ય કરો, અથવા DEHAT ફેલો બનો.', cta_vol_a:'અમારી સાથે જોડાઓ',
  cta_partner:'ભાગીદારી', cta_partner_b:'કોર્પોરેટ, શૈક્ષણિક અથવા સંસ્થાકીય ભાગીદારી.', cta_partner_a:'સહયોગ કરો',
  pillar_link_work:'ચારેય કાર્યક્રમો જુઓ', pillar_link_how:'અમે કેવી રીતે કાર્ય કરીએ છીએ તે જુઓ', stories_all:'બધી વાર્તાઓ વાંચો',
  work_title:'અધિકારો, રોજિંદા જીવનમાં સાકાર.',
  chrono_title:'દરેક પ્રોજેક્ટ, કાલક્રમિક ક્રમમાં',
  count_label:'નોંધાયેલા પ્રોજેક્ટ',
  open_programme:'કાર્યક્રમ ખોલો',
  work_sub:'ચાર કાર્યક્રમો, તેઓ જે ક્રમમાં શરૂ થયા તે પ્રમાણે. દરેક પોતાના પાનામાં ખૂલે છે — આ કાર્ય શા માટે અસ્તિત્વમાં છે, તે કેવી રીતે ઘડાયું છે, અને તેણે હાથ ધરેલો દરેક પ્રોજેક્ટ, કાલક્રમિક ક્રમમાં, દરેકની પાછળના શું, ક્યાં, કેવી રીતે, ક્યારે, શા માટે અને રોકાણ સાથે.',
  portfolio_total:'જાહેર રેકોર્ડ પર પ્રોજેક્ટ', portfolio_investment:'કુલ સામાજિક રોકાણ',
  portfolio_count:'ચાર કાર્યક્રમોમાં પ્રોજેક્ટ',
  filter_year:'વર્ષ', filter_state:'રાજ્ય', filter_district:'જિલ્લો', filter_sdg:'વિકાસ લક્ષ્ય', filter_csr:'કોર્પોરેટ સામાજિક જવાબદારી · અનુસૂચિ VII', filter_uncrc:'બાળ અધિકાર', filter_investor:'સામાજિક રોકાણકાર', filter_all:'બધા',
  open_details:'સંપૂર્ણ રેકોર્ડ ખોલો', close_details:'રેકોર્ડ બંધ કરો', phases_label:'તબક્કા',
  annual_label:'વર્ષ-દર-વર્ષ',
  cross_from:'આનો પણ ભાગ',
  shared_note:'સહિયારું સામાજિક રોકાણ દાયરો:',
  d_what:'જે પરિવર્તન લાવવાનો અમારો ઉદ્દેશ હતો', d_why:'અહીં આ શા માટે મહત્વનું હતું',
  d_how:'સમુદાયો અને તંત્રોએ સાથે મળીને કેવી રીતે કાર્ય કર્યું', d_impact:'અસરના આંકડા',
  d_investor:'સામાજિક રોકાણકાર', d_investors:'સામાજિક રોકાણકારો', d_investment:'સામાજિક રોકાણ',
  m_when:'ક્યારે અને સ્થિતિ', m_location:'ક્યાં', m_sdg:'વિકાસ લક્ષ્યો', m_csr:'કોર્પોરેટ સામાજિક જવાબદારી · અનુસૂચિ VII', m_uncrc:'બાળકના અધિકારો', m_law:'ભારતીય કાયદો અને નીતિ આધાર', m_law_none:'આ પ્રોજેક્ટ માટે કોઈ એક જ કાયદાકીય આધાર નોંધાયેલ નથી.',
  invest_note:'જેમ દસ્તાવેજીકૃત છે તેમ જ પ્રકાશિત; એકત્રિત (કન્સોલિડેટ) નથી.',
  impact_eyebrow:'અસર', impact_title:'2000થી, સમુદાયો સાથે ચાલતા રહીને, જ્યારે તેઓ પોતાના અધિકારો માટે દાવો કરે છે અને તેમને પ્રાપ્ત કરવા જાહેર તંત્રો સાથે ભાગીદારીમાં કાર્ય કરે છે.',
  impact_sub:'1989માં યુવા સમૂહ તરીકે શરૂઆત થઈ, 2000માં નોંધણી થઈ. આ આંકડા વ્યાપ દર્શાવે છે; તેમની પાછળ સમુદાયો, ક્ષેત્રીય કાર્યકરો અને જાહેર સંસ્થાઓનું સંયુક્ત કાર્ય રહેલું છે.',
  reach_head:'અત્યાર સુધીની ભૌગોલિક પહોંચ', reach_states:'રાજ્યો', reach_districts:'જિલ્લા', reach_blocks:'બ્લોક', reach_villages:'ગામો', reach_children:'બાળકો અને કિશોરો', reach_farmers:'મહિલા ખેડૂતો',
  stories_eyebrow:'પરિવર્તનની વાર્તાઓ', stories_title:'વાસ્તવિકતા, પછી પરિવર્તન.',
  stories_sub:'દરેક કેસ સ્ટોરી ચાર બાળ અધિકારોમાંથી એકની આસપાસ ગોઠવાયેલી છે — જીવન, વિકાસ, સંરક્ષણ, સહભાગિતા.',
  involved_eyebrow:'સાથે જોડાઓ', involved_title:'હાલની શક્તિને સાકાર કરો — અમારી સાથે.',
  involved_sub:'ભલે તમે એક કલાક આપો, કોઈ કૌશલ્ય આપો, કે એક રૂપિયો — તમે એવા તંત્રનો ભાગ બનો છો જે પ્રતિભાવ આપે છે.',
  involved_cta_title:'સમુદાયોની સાથે રોકાણ કરો.',
  involved_cta_sub:'મૂડી હોય કે સામગ્રી, ઓનલાઇન હોય કે ઓફલાઇન — દરેક રૂપિયો એ ક્ષમતામાં જાય છે જે સમુદાયો અમારા ગયા પછી પણ જાળવી રાખે છે.',
  donate_now:'ભાગીદારી શરૂ કરો', email_us:'અમને ઈમેલ કરો', f_email:'ઈમેલ', f_phone:'ફોન', f_web:'વેબ', f_address:'સરનામું',
  nav_finance:'પારદર્શિતા', nav_answers:'જવાબો',
  fin_eyebrow:'નાણાકીય પારદર્શિતા', fin_title:'દરેક રૂપિયો, રેકોર્ડ પર.',
  fin_sub:'સ્વતંત્ર રીતે અંકેક્ષિત (ઓડિટ થયેલ) હિસાબો — રોકાણ ભાગીદારોએ શું પ્રતિબદ્ધ કર્યું, કાર્ય સુધી શું પહોંચ્યું, અને બંને પાછળની કાયદાકીય ચકાસણી. દરેક આંકડો હસ્તાક્ષરિત બેલેન્સ શીટ પરથી લેવાયો છે.',
  fin_stat_received:'20 વર્ષોમાં પ્રતિબદ્ધ', fin_stat_fcra:'વિદેશી અંશદાન · વિદેશી અંશદાન (નિયમન) અધિનિયમ', fin_stat_inr:'ઘરેલું અંશદાન · ભારતીય રૂપિયા', fin_stat_funders:'નોંધાયેલા રોકાણ ભાગીદારો',
  fin_years_head:'વર્ષ-દર-વર્ષ', fin_years_sub:'શું આવ્યું, શું ખર્ચાયું, અને હિસાબો પર કોણે હસ્તાક્ષર કર્યા. તે વર્ષના સામાજિક રોકાણકારો જોવા માટે વર્ષ પસંદ કરો.',
  fin_received:'પ્રતિબદ્ધ', fin_utilised:'વિનિયોજિત', fin_auditor:'અંકેક્ષક', fin_bs:'બેલેન્સ શીટ', fin_surplus:'પુરાંત', fin_deficit:'ખાધ', fin_partial:'આંશિક માહિતી', fin_compiled:'સંકલિત',
  fin_funders_head:'આ કાર્યમાં કોણ રોકાણ કરે છે', fin_funders_sub:'એ સંસ્થાઓ અને વ્યક્તિઓ જેમની મૂડી આ કાર્યને શક્તિ આપે છે — સહિયારા પરિણામમાં ભાગીદારો, એકતરફી દાતાઓ નહીં. કાયદાની જરૂરિયાત મુજબ, વિદેશી અંશદાન અલગ વિદેશી અંશદાન (નિયમન) અધિનિયમ ખાતામાં રાખવામાં અને અંકેક્ષિત કરવામાં આવે છે; ઘરેલું ભંડોળ રૂપિયાના ચોપડા દ્વારા ચાલે છે.',
  fin_regime_fcra:'વિદેશી અંશદાન (નિયમન) અધિનિયમ · વિદેશી', fin_regime_inr:'ભારતીય રૂપિયો · ઘરેલું',
  fin_funders_cta:'બધા ભાગીદારો જુઓ',
  fin_compliance_head:'કાયદાકીય પાલન', fin_compliance_sub:'DEHAT એક નોંધાયેલી સોસાયટી છે (સોસાયટી નોંધણી અધિનિયમ, 1860). નીચે વાર્ષિક જવાબદારી ચક્ર છે જે કોઈ સમીક્ષક જોવાની અપેક્ષા રાખે — અને જે DEHAT ફાઇલ કરે છે.',
  fin_reg_head:'નોંધણીઓ', fin_cal_head:'વાર્ષિક ફાઇલિંગ કેલેન્ડર', fin_rules_head:'અમે કયા ધોરણો સામે અહેવાલ આપીએ છીએ',
  fin_auditor_trail:'દર વર્ષે એક પ્રેક્ટિસ કરતા ચાર્ટર્ડ એકાઉન્ટન્ટ દ્વારા અંકેક્ષિત અને યુનિક ડોક્યુમેન્ટ આઇડેન્ટિફિકેશન નંબર સાથે હસ્તાક્ષરિત. છેલ્લા દાયકામાં પાંચ અલગ-અલગ પેઢીઓએ ચોપડાની ચકાસણી કરી છે — કોઈ એક લાંબા ગાળાનો સંબંધ નથી.',
  fin_due:'નિયત તારીખ', fin_year_funders:'આ વર્ષના રોકાણ ભાગીદારો',
  fin_docs_head:'પ્રમાણપત્રો અને દસ્તાવેજો', fin_docs_sub:'દરેક નોંધણી, મંજૂરી અને તૃતીય-પક્ષ માન્યતા — મૂળ પ્રમાણપત્રમાંથી સ્કેન કરેલ. મૂળ દસ્તાવેજ વાંચવા માટે કોઈ પણ ખોલો.',
  fin_docg_statutory:'નોંધણી અને કર', fin_docg_fcra:'વિદેશી અંશદાન · વિદેશી અંશદાન (નિયમન) અધિનિયમ', fin_docg_validation:'માન્યતાઓ અને સ્વીકૃતિ',
  fin_doc_view:'દસ્તાવેજ જુઓ', fin_pending_label:'અંકેક્ષિત સ્કેન ફાઇલમાં ઉપલબ્ધ — આંકડા ડિજિટલ કરવામાં આવી રહ્યા છે',
  foot_explore:'શોધો', foot_reach:'અમારો સંપર્ક કરો', foot_follow:'કાર્ય સાથે જોડાયેલા રહો',
  foot_desc:'માનવ ઉન્નતિ માટે વિકાસ સંગઠન — સમુદાયો અને તંત્રો સાથે કાર્ય જેથી બાળકોના અધિકારો ઓળખાય, પ્રાપ્ત થાય અને સુનિશ્ચિત બને.',
  foot_rights:'© 2026 DEHAT · 1989માં યુવા સમૂહ તરીકે શરૂઆત · 2000માં નોંધણી',
    };
    const KN = {
foot_policies:'ನೀತಿಗಳು ಮತ್ತು ಸುರಕ್ಷತಾ ಕ್ರಮಗಳು', foot_cookies:'ಕುಕೀ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
      nav_home:'ಮುಖಪುಟ', nav_who:'ನಾವು ಯಾರು', nav_work:'ನಮ್ಮ ಕಾರ್ಯ', nav_impact:'ಪ್ರಭಾವ', nav_stories:'ಕಥೆಗಳು', nav_media:'ಮಾಧ್ಯಮ', nav_involved:'ಜೊತೆಗೂಡಿ',
      donate:'ಹೂಡಿಕೆ ಮಾಡಿ', since:'1989 ರಿಂದ', org_full:'ಮಾನವ ಪ್ರಗತಿಗಾಗಿ ಅಭಿವೃದ್ಧಿ ಸಂಘ',
      language:'ಭಾಷೆ', lang_indian:'ಭಾರತೀಯ ಭಾಷೆಗಳು', lang_global:'ಜಾಗತಿಕ (ವಿಶ್ವಸಂಸ್ಥೆ)',
      hero_title_a:'ಮಕ್ಕಳ-ಕೇಂದ್ರಿತ ಸಮಾಜ, ಅಲ್ಲಿ ಪ್ರತಿ ಮಗುವೂ ತನ್ನ ', hero_title_b:'ಹಕ್ಕುಗಳನ್ನು', hero_title_c:' ಸಾಕಾರಗೊಳಿಸುತ್ತದೆ — ಸುರಕ್ಷಿತ, ಘನತೆಯುತ, ಪರಿಪೂರ್ಣ.',
      hero_sub:'ಭಾರತ-ನೇಪಾಳ ತೆರಾಯಿ ಪ್ರದೇಶದುದ್ದಕ್ಕೂ ಇರುವ ಸಮುದಾಯಗಳು ಮತ್ತು ಸಾರ್ವಜನಿಕ ವ್ಯವಸ್ಥೆಗಳೊಂದಿಗೆ ನಾವು ಕಾರ್ಯ ನಿರ್ವಹಿಸುತ್ತೇವೆ, ಇದರಿಂದ ಮಕ್ಕಳ ಹಕ್ಕುಗಳು ಕೇವಲ ಬರೆಯಲ್ಪಟ್ಟ ಪದಗಳಾಗಿ ಉಳಿಯದೆ, ದೈನಂದಿನ ಬದುಕಿನಲ್ಲಿ ಗುರುತಿಸಲ್ಪಟ್ಟು, ಲಭ್ಯವಾಗಿ ಮತ್ತು ಎತ್ತಿಹಿಡಿಯಲ್ಪಡುತ್ತವೆ.',
      hero_cta1:'ಸಮುದಾಯಗಳ ಜೊತೆ ನಿಲ್ಲಿ', hero_cta2:'ನಾವು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತೇವೆ ನೋಡಿ', hero_photo:'ಫೋಟೋ — ಬಾಲ ಸಂಸತ್ ಮುಖಂಡರು, ಲೋಹ್ರಾ ಗ್ರಾಮ, ಬಹರೈಚ್',
      hero_principle:'ಸಮುದಾಯಗಳು ಮತ್ತು ಸರ್ಕಾರಿ ವ್ಯವಸ್ಥೆಗಳೊಂದಿಗೆ ಸೇರಿ, ಪ್ರತಿ ಮಗುವಿಗಾಗಿ.',
      stat_children:'ತಲುಪಿದ ಮಕ್ಕಳು ಮತ್ತು ಹದಿಹರೆಯದವರು', stat_invested:'2000 ರಿಂದ ಸಮುದಾಯ ವ್ಯವಸ್ಥೆಗಳಲ್ಲಿ ಹೂಡಿಕೆ', stat_resources:'ಪಡೆದ ಸಾರ್ವಜನಿಕ ಸಂಪನ್ಮೂಲಗಳು', stat_districts:'2 ರಾಜ್ಯಗಳ ಜಿಲ್ಲೆಗಳು',
      stat_hint:'ನಾಲ್ಕು ಅಂಕಿಅಂಶಗಳು, ಮರೆಮಾಡಲಾಗಿದೆ. ನೋಡಲು ಒಂದನ್ನು ಒತ್ತಿ.', stat_reveal:'ತೋರಿಸಲು ಒತ್ತಿ', stat_hide:'ಮರೆಮಾಡಿ', stat_reveal_all:'ಎಲ್ಲಾ ನಾಲ್ಕನ್ನೂ ತೋರಿಸಿ', stat_hide_all:'ಎಲ್ಲವನ್ನೂ ಮರೆಮಾಡಿ', grid_reveal_all:'ಎಲ್ಲಾ ಹದಿನಾಲ್ಕನ್ನೂ ತೋರಿಸಿ', grid_hint:'ಹದಿನಾಲ್ಕು ಅಂಕಿಅಂಶಗಳು, ಮರೆಮಾಡಲಾಗಿದೆ. ನೋಡಲು ಒಂದನ್ನು ಒತ್ತಿ.', bl_drag:'ಸಮೀಕ್ಷೆಯನ್ನು ಮುಂದಕ್ಕೆ ಎಳೆಯಿರಿ',
      vision:'ದೃಷ್ಟಿಕೋನ', mission:'ಧ್ಯೇಯ', theory:'ಬದಲಾವಣೆಯ ಸಿದ್ಧಾಂತ',
      vision_body:'ಮಕ್ಕಳ-ಕೇಂದ್ರಿತ ಸಮಾಜ, ಅಲ್ಲಿ ಪ್ರತಿ ಮಗುವೂ ತನ್ನ ಹಕ್ಕುಗಳನ್ನು ಸಾಕಾರಗೊಳಿಸಿ ಸುರಕ್ಷಿತ, ಘನತೆಯುತ ಮತ್ತು ಸಾರ್ಥಕ ಜೀವನ ನಡೆಸುತ್ತದೆ.',
      mission_body:'ಸಮುದಾಯಗಳು ಮತ್ತು ವ್ಯವಸ್ಥೆಗಳ ಜೊತೆ ಸೇರಿ ಈಗಾಗಲೇ ಇರುವ ಶಕ್ತಿಯನ್ನು ಸಾಕಾರಗೊಳಿಸುವುದು, ಇದರಿಂದ ಮಕ್ಕಳ ಹಕ್ಕುಗಳು ದೈನಂದಿನ ಬದುಕಿನಲ್ಲಿ ಗುರುತಿಸಲ್ಪಟ್ಟು, ಲಭ್ಯವಾಗಿ ಮತ್ತು ಎತ್ತಿಹಿಡಿಯಲ್ಪಡುತ್ತವೆ.',
      theory_body:'ಸಮುದಾಯಗಳು ಕಾರ್ಯ ನಿರ್ವಹಿಸಿ ವ್ಯವಸ್ಥೆಗಳು ಒಗ್ಗೂಡಿ ಪ್ರತಿಕ್ರಿಯಿಸಿದಾಗ, ಮಕ್ಕಳ ಬದುಕುಳಿಯುವಿಕೆ, ಬೆಳವಣಿಗೆ, ರಕ್ಷಣೆ ಮತ್ತು ಭಾಗವಹಿಸುವಿಕೆ ಸಾಕಾರಗೊಂಡು ಸ್ಥಿರವಾಗಿ ಉಳಿಯುತ್ತವೆ.',
      eyebrow_work:'ನಾವು ಏನು ಮಾಡುತ್ತೇವೆ', work_head:'ನಾಲ್ಕು ರಂಗಗಳು, ಒಂದು ಒಗ್ಗೂಡುವ ಪ್ರತಿಕ್ರಿಯೆ.',
      eyebrow_where:'ನಾವು ಕಾರ್ಯ ನಿರ್ವಹಿಸುವ ಸ್ಥಳ', where_head:'23 ಜಿಲ್ಲೆಗಳು. 2 ರಾಜ್ಯಗಳು. ಒಂದು ಗಡಿ.',
      where_sub:'ನಾವು ಉತ್ತರ ಪ್ರದೇಶ ಮತ್ತು ಮಹಾರಾಷ್ಟ್ರದಲ್ಲಿ ಪೂರ್ವ ಭಾರತ-ನೇಪಾಳ ಗಡಿಯುದ್ದಕ್ಕೂ ಕಾರ್ಯ ನಿರ್ವಹಿಸುತ್ತೇವೆ — ಸಾಮಾನ್ಯ ರಚನಾತ್ಮಕ ದುರ್ಬಲತೆಯಿಂದ ಬಂಧಿತವಾದ ಪ್ರದೇಶಗಳು. ನೆಲದ ಸ್ಥಿತಿ ನೋಡಲು ಒಂದು ಜಿಲ್ಲೆಯನ್ನು ಒತ್ತಿ.',
      eyebrow_cycle:'ರಚನಾತ್ಮಕ ದುರ್ಬಲತೆಯ ಚಕ್ರ', cycle_head:'ಅಪಾಯಗಳು ಪ್ರತ್ಯೇಕವಾಗಿ ಸಂಭವಿಸುವುದಿಲ್ಲ.',
      cycle_sub:'ವ್ಯವಸ್ಥೆಗಳು ಸಕಾಲದಲ್ಲಿ ಪ್ರತಿಕ್ರಿಯಿಸದ ಹೊರತು, ಇವು ತಲೆಮಾರುಗಳ ಮೂಲಕ ಒಂದನ್ನೊಂದು ಬಲಪಡಿಸುತ್ತವೆ. ಇದಕ್ಕೆ ಸ್ಥಿರವಾದ ಕ್ರಮವಿಲ್ಲ: ಯಾವುದೇ ಮಗುವಿಗೆ ಈ ಬಲೆ ಯಾವುದೇ ಹಂತದಿಂದ ಆರಂಭವಾಗಬಹುದು, ಮತ್ತು ಪ್ರತಿ ಅಪಾಯವೂ ಮುಂದಿನದನ್ನು ಇನ್ನಷ್ಟು ಹತ್ತಿರಕ್ಕೆ ಎಳೆಯುತ್ತದೆ.',
      cycle_pick:'ಒಂದು ಬದುಕು ಹೇಗೆ ರೂಪುಗೊಳ್ಳುತ್ತದೆ ಎಂಬುದನ್ನು ಅನುಸರಿಸಲು ಯಾವುದೇ ಕ್ಷಣವನ್ನು ಒತ್ತಿ.',
      cycle_note:'ಪ್ರತಿ ಅಂಕಿ, ಉತ್ತರ ಪ್ರದೇಶದ ಭಾರತ-ನೇಪಾಳ ತೆರಾಯಿ ಪಟ್ಟಿಯ ಏಳು ಜಿಲ್ಲೆಗಳಲ್ಲಿ — ಬಹರೈಚ್, ಶ್ರಾವಸ್ತಿ, ಬಲರಾಂಪುರ, ಲಖಿಂಪುರ ಖೇರಿ, ಸಿದ್ಧಾರ್ಥನಗರ, ಮಹಾರಾಜಗಂಜ್ ಮತ್ತು ಕುಶಿನಗರ — ದಾಖಲಾದ ಅತ್ಯಂತ ಕೆಟ್ಟ ಮೌಲ್ಯವಾಗಿದೆ. ಮೂಲಗಳು: ಆರೋಗ್ಯ, ಪೋಷಣೆ ಮತ್ತು ಲಿಂಗ ಸಂಬಂಧಿ ಅಂಕಿಗಳಿಗೆ ರಾಷ್ಟ್ರೀಯ ಕುಟುಂಬ ಆರೋಗ್ಯ ಸಮೀಕ್ಷೆ 5 (2019–21)ರ ಜಿಲ್ಲಾ ಫ್ಯಾಕ್ಟ್-ಶೀಟ್ ದತ್ತಸಂಚಯ (ಆರೋಗ್ಯ ಮತ್ತು ಕುಟುಂಬ ಕಲ್ಯಾಣ ಸಚಿವಾಲಯ / ಅಂತರರಾಷ್ಟ್ರೀಯ ಜನಸಂಖ್ಯಾ ವಿಜ್ಞಾನ ಸಂಸ್ಥೆ); ಶಿಕ್ಷಣಕ್ಕಾಗಿ ಏಕೀಕೃತ ಜಿಲ್ಲಾ ಶಿಕ್ಷಣ ಮಾಹಿತಿ ವ್ಯವಸ್ಥೆ ಪ್ಲಸ್ (ಯುಡಿಐಎಸ್‌ಇ+) ಜಿಲ್ಲಾ ಫ್ಯಾಕ್ಟ್ ಶೀಟ್‌ಗಳು; ಮಾತೃ ಮರಣ ಪ್ರಮಾಣಕ್ಕೆ ಮಾದರಿ ನೋಂದಣಿ ವ್ಯವಸ್ಥೆ, ಇದು ರಾಜ್ಯ ಮಟ್ಟದ್ದಾಗಿದೆ. ಪ್ರತಿ ಆರೋಗ್ಯ ಅಂಕಿ ಒಂದೇ ಸಮೀಕ್ಷಾ ಸುತ್ತಿನಿಂದ ಬಂದಿರುವುದರಿಂದ, ಜಿಲ್ಲೆಗಳ ನಡುವಿನ ಹೋಲಿಕೆ ಸಮಾನ ಆಧಾರದ ಮೇಲಿದೆ. ದಾಂಪತ್ಯ ಹಿಂಸೆಯ ದತ್ತಾಂಶ ರಾಷ್ಟ್ರೀಯ ಕುಟುಂಬ ಆರೋಗ್ಯ ಸಮೀಕ್ಷೆಯ ರಾಜ್ಯ ಮಾಡ್ಯೂಲ್‌ನಲ್ಲಿ ಮಾತ್ರ ಸಂಗ್ರಹವಾಗಿದ್ದು, ಇಲ್ಲಿ ಉತ್ತರ ಪ್ರದೇಶದ ಅಂಕಿಯಾಗಿ ತೋರಿಸಲಾಗಿದೆ. ಬಾಲ ಕಾರ್ಮಿಕ, ಅತ್ಯಂತ ಬಡ ಸಂಪತ್ತಿನ ವರ್ಗ, ಹಾಗೂ ಶಿಶು ಮತ್ತು 5 ವರ್ಷದೊಳಗಿನ ಮರಣ ಪ್ರಮಾಣ — ಈ ನಾಲ್ಕು ಅಂಶಗಳು ಇನ್ನೂ ಮರುಪರಿಶೀಲನೆಗಾಗಿ ಕಾಯುತ್ತಿರುವ ದಾಖಲೆಗಳ ಮೇಲೆ ಆಧಾರಿತವಾಗಿದ್ದು, ಇದನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಸೂಚಿಸಲಾಗಿದೆ. ಶಿಶು ಅಥವಾ 5 ವರ್ಷದೊಳಗಿನ ಮರಣ ಪ್ರಮಾಣಕ್ಕೆ ಭಾರತ ಯಾವುದೇ ಅಧಿಕೃತ ಜಿಲ್ಲಾ ಸರಣಿಯನ್ನು ಪ್ರಕಟಿಸುವುದಿಲ್ಲ. ಪ್ರತಿ ಅಂಶವೂ ತನ್ನ ಜಿಲ್ಲೆ ಮತ್ತು ಮೂಲವನ್ನು ಹೆಸರಿಸುತ್ತದೆ.',
      eyebrow_process:'ಪ್ರಕ್ರಿಯೆ', process_head:'ಸಮುದಾಯಗಳು ಕಾರ್ಯ ನಿರ್ವಹಿಸಿದಾಗ, ವ್ಯವಸ್ಥೆಗಳು ಪ್ರತಿಕ್ರಿಯಿಸುತ್ತವೆ.', eyebrow_stories:'ಬದಲಾವಣೆಯ ಕಥೆಗಳು',
      cta_donate:'ಹೂಡಿಕೆ ಮಾಡಿ', cta_donate_b:'ಸಮುದಾಯ-ನೇತೃತ್ವದ ಕಾರ್ಯಕ್ಕೆ ಬಂಡವಾಳ ಅಥವಾ ಸಾಮಗ್ರಿಯ ಮೂಲಕ, ಆನ್‌ಲೈನ್ ಅಥವಾ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಬೆಂಬಲಿಸಿ.', cta_donate_a:'ಈಗಲೇ ಹೂಡಿಕೆ ಮಾಡಿ',
      cta_vol:'ಸ್ವಯಂಸೇವೆ', cta_vol_b:'ಇಂಟರ್ನ್ ಆಗಿ, ವರ್ಚುವಲ್ ಆಗಿ ಕೆಲಸ ಮಾಡಿ, ಅಥವಾ DEHAT ಫೆಲೋ ಆಗಿ.', cta_vol_a:'ನಮ್ಮೊಂದಿಗೆ ಸೇರಿ',
      cta_partner:'ಪಾಲುದಾರಿಕೆ', cta_partner_b:'ಕಾರ್ಪೊರೇಟ್, ಶೈಕ್ಷಣಿಕ ಅಥವಾ ಸಾಂಸ್ಥಿಕ ಪಾಲುದಾರಿಕೆಗಳು.', cta_partner_a:'ಸಹಯೋಗ ಮಾಡಿ',
      pillar_link_work:'ನಾಲ್ಕು ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ನೋಡಿ', pillar_link_how:'ನಾವು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತೇವೆ ನೋಡಿ', stories_all:'ಎಲ್ಲಾ ಕಥೆಗಳನ್ನು ಓದಿ',
      work_title:'ಹಕ್ಕುಗಳು, ದೈನಂದಿನ ಬದುಕಿನಲ್ಲಿ ಸಾಕಾರ.',
      chrono_title:'ಪ್ರತಿ ಯೋಜನೆ, ಕಾಲಾನುಕ್ರಮದಲ್ಲಿ',
      count_label:'ದಾಖಲಿತ ಯೋಜನೆಗಳು',
      open_programme:'ಕಾರ್ಯಕ್ರಮ ತೆರೆಯಿರಿ',
      work_sub:'ನಾಲ್ಕು ಕಾರ್ಯಕ್ರಮಗಳು, ಅವು ಆರಂಭವಾದ ಕ್ರಮದಲ್ಲಿ. ಪ್ರತಿಯೊಂದೂ ತನ್ನದೇ ಪುಟಕ್ಕೆ ತೆರೆದುಕೊಳ್ಳುತ್ತದೆ — ಈ ಕಾರ್ಯ ಏಕೆ ಅಸ್ತಿತ್ವದಲ್ಲಿದೆ, ಅದು ಹೇಗೆ ರೂಪುಗೊಂಡಿದೆ, ಮತ್ತು ಅದು ಕೈಗೊಂಡ ಪ್ರತಿ ಯೋಜನೆ, ಕಾಲಾನುಕ್ರಮದಲ್ಲಿ, ಪ್ರತಿಯೊಂದರ ಹಿಂದಿನ ಏನು, ಎಲ್ಲಿ, ಹೇಗೆ, ಯಾವಾಗ, ಏಕೆ ಮತ್ತು ಹೂಡಿಕೆಯೊಂದಿಗೆ.',
      portfolio_total:'ಸಾರ್ವಜನಿಕ ದಾಖಲೆಯಲ್ಲಿರುವ ಯೋಜನೆಗಳು', portfolio_investment:'ಒಟ್ಟು ಸಾಮಾಜಿಕ ಹೂಡಿಕೆ',
      portfolio_count:'ನಾಲ್ಕು ಕಾರ್ಯಕ್ರಮಗಳಾದ್ಯಂತ ಯೋಜನೆಗಳು',
      filter_year:'ವರ್ಷ', filter_state:'ರಾಜ್ಯ', filter_district:'ಜಿಲ್ಲೆ', filter_sdg:'ಅಭಿವೃದ್ಧಿ ಗುರಿ', filter_csr:'ಕಾರ್ಪೊರೇಟ್ ಸಾಮಾಜಿಕ ಹೊಣೆಗಾರಿಕೆ · ಅನುಸೂಚಿ VII', filter_uncrc:'ಮಕ್ಕಳ ಹಕ್ಕು', filter_investor:'ಸಾಮಾಜಿಕ ಹೂಡಿಕೆದಾರ', filter_all:'ಎಲ್ಲಾ',
      open_details:'ಪೂರ್ಣ ದಾಖಲೆ ತೆರೆಯಿರಿ', close_details:'ದಾಖಲೆ ಮುಚ್ಚಿ', phases_label:'ಹಂತಗಳು',
      annual_label:'ವರ್ಷದಿಂದ ವರ್ಷಕ್ಕೆ',
      cross_from:'ಇದರ ಭಾಗವೂ ಆಗಿದೆ',
      shared_note:'ಹಂಚಿಕೆಯ ಸಾಮಾಜಿಕ ಹೂಡಿಕೆ ವ್ಯಾಪ್ತಿ:',
      d_what:'ನಾವು ಸಾಧಿಸಲು ಉದ್ದೇಶಿಸಿದ ಬದಲಾವಣೆ', d_why:'ಇಲ್ಲಿ ಇದು ಏಕೆ ಮುಖ್ಯವಾಗಿತ್ತು',
      d_how:'ಸಮುದಾಯಗಳು ಮತ್ತು ವ್ಯವಸ್ಥೆಗಳು ಒಟ್ಟಾಗಿ ಹೇಗೆ ಕೆಲಸ ಮಾಡಿದವು', d_impact:'ಪ್ರಭಾವದ ಅಂಕಿಗಳು',
      d_investor:'ಸಾಮಾಜಿಕ ಹೂಡಿಕೆದಾರ', d_investors:'ಸಾಮಾಜಿಕ ಹೂಡಿಕೆದಾರರು', d_investment:'ಸಾಮಾಜಿಕ ಹೂಡಿಕೆ',
      m_when:'ಯಾವಾಗ ಮತ್ತು ಸ್ಥಿತಿ', m_location:'ಎಲ್ಲಿ', m_sdg:'ಅಭಿವೃದ್ಧಿ ಗುರಿಗಳು', m_csr:'ಕಾರ್ಪೊರೇಟ್ ಸಾಮಾಜಿಕ ಹೊಣೆಗಾರಿಕೆ · ಅನುಸೂಚಿ VII', m_uncrc:'ಮಕ್ಕಳ ಹಕ್ಕುಗಳು', m_law:'ಭಾರತೀಯ ಕಾನೂನು ಮತ್ತು ನೀತಿ ಆಧಾರ', m_law_none:'ಈ ಯೋಜನೆಗೆ ಯಾವುದೇ ಏಕೈಕ ಶಾಸನಬದ್ಧ ಆಧಾರ ದಾಖಲಾಗಿಲ್ಲ.',
      invest_note:'ದಾಖಲಿಸಿದಂತೆಯೇ ಪ್ರಕಟಿಸಲಾಗಿದೆ; ಸಂಯೋಜಿಸಲಾಗಿಲ್ಲ.',
      impact_eyebrow:'ಪ್ರಭಾವ', impact_title:'2000 ರಿಂದ, ಸಮುದಾಯಗಳು ತಮ್ಮ ಹಕ್ಕುಗಳನ್ನು ಪ್ರತಿಪಾದಿಸುತ್ತಾ ಸಾರ್ವಜನಿಕ ವ್ಯವಸ್ಥೆಗಳ ಜೊತೆ ಪಾಲುದಾರಿಕೆಯಲ್ಲಿ ಅವುಗಳನ್ನು ದೊರಕಿಸಿಕೊಳ್ಳುತ್ತಿರುವಾಗ ಅವರ ಜೊತೆಗಿದ್ದೇವೆ.',
      impact_sub:'1989 ರಲ್ಲಿ ಯುವ ಸಮೂಹವಾಗಿ ಆರಂಭ, 2000 ರಲ್ಲಿ ನೋಂದಣಿ. ಈ ಅಂಕಿಗಳು ವ್ಯಾಪ್ತಿಯನ್ನು ತೋರಿಸುತ್ತವೆ; ಇವುಗಳ ಹಿಂದೆ ಇರುವುದು ಸಮುದಾಯಗಳು, ಕ್ಷೇತ್ರ ಕಾರ್ಯಕರ್ತರು ಮತ್ತು ಸಾರ್ವಜನಿಕ ಸಂಸ್ಥೆಗಳು ಒಟ್ಟಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತಿರುವುದು.',
      reach_head:'ಇಲ್ಲಿಯವರೆಗಿನ ಭೌಗೋಳಿಕ ವ್ಯಾಪ್ತಿ', reach_states:'ರಾಜ್ಯಗಳು', reach_districts:'ಜಿಲ್ಲೆಗಳು', reach_blocks:'ಬ್ಲಾಕ್‌ಗಳು', reach_villages:'ಗ್ರಾಮಗಳು', reach_children:'ಮಕ್ಕಳು ಮತ್ತು ಹದಿಹರೆಯದವರು', reach_farmers:'ಮಹಿಳಾ ರೈತರು',
      stories_eyebrow:'ಬದಲಾವಣೆಯ ಕಥೆಗಳು', stories_title:'ವಾಸ್ತವ, ನಂತರ ಪರಿವರ್ತನೆ.',
      stories_sub:'ಪ್ರತಿ ಪ್ರಕರಣ ಕಥೆಯೂ ನಾಲ್ಕು ಮಕ್ಕಳ ಹಕ್ಕುಗಳಲ್ಲಿ ಒಂದರ ಸುತ್ತ ಸಂಘಟಿತವಾಗಿದೆ — ಬದುಕುಳಿಯುವಿಕೆ, ಬೆಳವಣಿಗೆ, ರಕ್ಷಣೆ, ಭಾಗವಹಿಸುವಿಕೆ.',
      involved_eyebrow:'ಜೊತೆಗೂಡಿ', involved_title:'ಈಗಾಗಲೇ ಇರುವ ಶಕ್ತಿಯನ್ನು ಸಾಕಾರಗೊಳಿಸಿ — ನಮ್ಮೊಂದಿಗೆ.',
      involved_sub:'ನೀವು ಒಂದು ಗಂಟೆ, ಒಂದು ಕೌಶಲ್ಯ, ಅಥವಾ ಒಂದು ರೂಪಾಯಿ ನೀಡಿದರೂ, ನೀವು ಪ್ರತಿಕ್ರಿಯಿಸುವ ಒಂದು ವ್ಯವಸ್ಥೆಯ ಭಾಗವಾಗುತ್ತೀರಿ.',
      involved_cta_title:'ಸಮುದಾಯಗಳ ಜೊತೆ ಹೂಡಿಕೆ ಮಾಡಿ.',
      involved_cta_sub:'ಬಂಡವಾಳ ಅಥವಾ ಸಾಮಗ್ರಿ, ಆನ್‌ಲೈನ್ ಅಥವಾ ಆಫ್‌ಲೈನ್ — ಪ್ರತಿ ರೂಪಾಯಿಯೂ ನಾವು ಹೊರಟ ನಂತರವೂ ಸಮುದಾಯಗಳು ಉಳಿಸಿಕೊಳ್ಳುವ ಸಾಮರ್ಥ್ಯಕ್ಕೆ ಸೇರುತ್ತದೆ.',
      donate_now:'ಪಾಲುದಾರಿಕೆ ಆರಂಭಿಸಿ', email_us:'ನಮಗೆ ಇಮೇಲ್ ಮಾಡಿ', f_email:'ಇಮೇಲ್', f_phone:'ಫೋನ್', f_web:'ವೆಬ್', f_address:'ವಿಳಾಸ',
      nav_finance:'ಪಾರದರ್ಶಕತೆ', nav_answers:'ಉತ್ತರಗಳು',
      fin_eyebrow:'ಆರ್ಥಿಕ ಪಾರದರ್ಶಕತೆ', fin_title:'ಪ್ರತಿ ರೂಪಾಯಿ, ದಾಖಲೆಯಲ್ಲಿ.',
      fin_sub:'ಸ್ವತಂತ್ರವಾಗಿ ಲೆಕ್ಕಪರಿಶೋಧಿಸಿದ ಖಾತೆಗಳು — ಹೂಡಿಕೆ ಪಾಲುದಾರರು ಬದ್ಧರಾದದ್ದು, ಕಾರ್ಯಕ್ಕೆ ತಲುಪಿದ್ದು, ಮತ್ತು ಇವೆರಡರ ಹಿಂದಿನ ಶಾಸನಬದ್ಧ ಪರಿಶೀಲನೆಗಳು. ಪ್ರತಿ ಅಂಕಿಯೂ ಸಹಿ ಮಾಡಿದ ಬ್ಯಾಲೆನ್ಸ್ ಶೀಟ್‌ನಿಂದ ತೆಗೆದುಕೊಳ್ಳಲಾಗಿದೆ.',
      fin_stat_received:'20 ವರ್ಷಗಳಲ್ಲಿ ಬದ್ಧವಾದದ್ದು', fin_stat_fcra:'ವಿದೇಶಿ ಅಂಶದಾನ · ವಿದೇಶಿ ಅಂಶದಾನ (ನಿಯಂತ್ರಣ) ಕಾಯ್ದೆ', fin_stat_inr:'ದೇಶೀಯ ಅಂಶದಾನ · ಭಾರತೀಯ ರೂಪಾಯಿ', fin_stat_funders:'ದಾಖಲಿತ ಹೂಡಿಕೆ ಪಾಲುದಾರರು',
      fin_years_head:'ವರ್ಷದಿಂದ ವರ್ಷಕ್ಕೆ', fin_years_sub:'ಏನು ಬಂತು, ಏನು ಖರ್ಚಾಯಿತು, ಮತ್ತು ಖಾತೆಗಳಿಗೆ ಯಾರು ಸಹಿ ಹಾಕಿದರು. ಅದರ ಸಾಮಾಜಿಕ ಹೂಡಿಕೆದಾರರನ್ನು ನೋಡಲು ಒಂದು ವರ್ಷವನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
      fin_received:'ಬದ್ಧವಾದದ್ದು', fin_utilised:'ವಿನಿಯೋಗಿಸಲಾಗಿದೆ', fin_auditor:'ಲೆಕ್ಕಪರಿಶೋಧಕ', fin_bs:'ಬ್ಯಾಲೆನ್ಸ್ ಶೀಟ್', fin_surplus:'ಹೆಚ್ಚುವರಿ', fin_deficit:'ಕೊರತೆ', fin_partial:'ಭಾಗಶಃ ದತ್ತಾಂಶ', fin_compiled:'ಸಂಕಲಿಸಲಾಗಿದೆ',
      fin_funders_head:'ಈ ಕಾರ್ಯದಲ್ಲಿ ಯಾರು ಹೂಡಿಕೆ ಮಾಡುತ್ತಾರೆ', fin_funders_sub:'ಈ ಕಾರ್ಯಕ್ಕೆ ಬಂಡವಾಳ ನೀಡುವ ಸಂಸ್ಥೆಗಳು ಮತ್ತು ವ್ಯಕ್ತಿಗಳು — ಒಂದು ಹಂಚಿಕೆಯ ಫಲಿತಾಂಶದಲ್ಲಿ ಪಾಲುದಾರರು, ಏಕಮುಖ ದಾನಿಗಳಲ್ಲ. ಕಾನೂನು ಬಯಸುವಂತೆ ವಿದೇಶಿ ಅಂಶದಾನಗಳನ್ನು ಪ್ರತ್ಯೇಕ ವಿದೇಶಿ ಅಂಶದಾನ (ನಿಯಂತ್ರಣ) ಕಾಯ್ದೆ ಖಾತೆಯಲ್ಲಿ ಇಡಲಾಗಿ ಲೆಕ್ಕಪರಿಶೋಧಿಸಲಾಗುತ್ತದೆ; ದೇಶೀಯ ನಿಧಿಗಳು ರೂಪಾಯಿ ಖಾತೆಗಳ ಮೂಲಕ ಸಾಗುತ್ತವೆ.',
      fin_regime_fcra:'ವಿದೇಶಿ ಅಂಶದಾನ (ನಿಯಂತ್ರಣ) ಕಾಯ್ದೆ · ವಿದೇಶಿ', fin_regime_inr:'ಭಾರತೀಯ ರೂಪಾಯಿ · ದೇಶೀಯ',
      fin_funders_cta:'ಎಲ್ಲಾ ಪಾಲುದಾರರನ್ನು ನೋಡಿ',
      fin_compliance_head:'ಶಾಸನಬದ್ಧ ಅನುಸರಣೆ', fin_compliance_sub:'DEHAT ಒಂದು ನೋಂದಾಯಿತ ಸೊಸೈಟಿ (ಸೊಸೈಟಿ ನೋಂದಣಿ ಕಾಯ್ದೆ, 1860). ಕೆಳಗೆ ಒಬ್ಬ ಪರಿಶೀಲಕ ನೋಡಲು ನಿರೀಕ್ಷಿಸುವ ವಾರ್ಷಿಕ ಹೊಣೆಗಾರಿಕೆ ಚಕ್ರವಿದೆ — ಮತ್ತು DEHAT ಅದನ್ನೇ ಸಲ್ಲಿಸುತ್ತದೆ.',
      fin_reg_head:'ನೋಂದಣಿಗಳು', fin_cal_head:'ವಾರ್ಷಿಕ ಸಲ್ಲಿಕೆ ಕ್ಯಾಲೆಂಡರ್', fin_rules_head:'ನಾವು ಯಾವುದರ ವಿರುದ್ಧ ವರದಿ ಮಾಡುತ್ತೇವೆ',
      fin_auditor_trail:'ಪ್ರತಿ ವರ್ಷ ಕಾರ್ಯನಿರತ ಚಾರ್ಟರ್ಡ್ ಅಕೌಂಟೆಂಟ್‌ರಿಂದ ಲೆಕ್ಕಪರಿಶೋಧಿಸಿ Unique Document Identification Number ಸಹಿತ ಸಹಿ ಮಾಡಲಾಗಿದೆ. ಕಳೆದ ದಶಕದಲ್ಲಿ ಐದು ಬೇರೆ ಬೇರೆ ಸಂಸ್ಥೆಗಳು ಖಾತೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿವೆ — ಯಾವುದೇ ಒಂದು ದೀರ್ಘಕಾಲಿಕ ಸಂಬಂಧವಿಲ್ಲ.',
      fin_due:'ಬಾಕಿ ದಿನಾಂಕ', fin_year_funders:'ಈ ವರ್ಷದ ಹೂಡಿಕೆ ಪಾಲುದಾರರು',
      fin_docs_head:'ಪ್ರಮಾಣಪತ್ರಗಳು ಮತ್ತು ದಾಖಲೆಗಳು', fin_docs_sub:'ಪ್ರತಿ ನೋಂದಣಿ, ಅನುಮೋದನೆ ಮತ್ತು ತೃತೀಯ-ಪಕ್ಷದ ಮೌಲ್ಯೀಕರಣ — ಮೂಲ ಪ್ರಮಾಣಪತ್ರದಿಂದ ಸ್ಕ್ಯಾನ್ ಮಾಡಲಾಗಿದೆ. ಮೂಲ ದಾಖಲೆಯನ್ನು ಓದಲು ಯಾವುದನ್ನಾದರೂ ತೆರೆಯಿರಿ.',
      fin_docg_statutory:'ನೋಂದಣಿ ಮತ್ತು ತೆರಿಗೆ', fin_docg_fcra:'ವಿದೇಶಿ ಅಂಶದಾನ · ವಿದೇಶಿ ಅಂಶದಾನ (ನಿಯಂತ್ರಣ) ಕಾಯ್ದೆ', fin_docg_validation:'ಮೌಲ್ಯೀಕರಣಗಳು ಮತ್ತು ಮಾನ್ಯತೆ',
      fin_doc_view:'ದಾಖಲೆ ವೀಕ್ಷಿಸಿ', fin_pending_label:'ಲೆಕ್ಕಪರಿಶೋಧಿತ ಸ್ಕ್ಯಾನ್ ಕಡತದಲ್ಲಿದೆ — ಅಂಕಿಗಳನ್ನು ಡಿಜಿಟಲೀಕರಿಸಲಾಗುತ್ತಿದೆ',
      foot_explore:'ಅನ್ವೇಷಿಸಿ', foot_reach:'ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ', foot_follow:'ಕಾರ್ಯವನ್ನು ಅನುಸರಿಸಿ',
      foot_desc:'ಮಾನವ ಪ್ರಗತಿಗಾಗಿ ಅಭಿವೃದ್ಧಿ ಸಂಘ — ಮಕ್ಕಳ ಹಕ್ಕುಗಳು ಗುರುತಿಸಲ್ಪಟ್ಟು, ಲಭ್ಯವಾಗಿ ಮತ್ತು ಎತ್ತಿಹಿಡಿಯಲ್ಪಡುವಂತೆ ಸಮುದಾಯಗಳು ಮತ್ತು ವ್ಯವಸ್ಥೆಗಳ ಜೊತೆ ಕಾರ್ಯ ನಿರ್ವಹಿಸುವುದು.',
      foot_rights:'© 2026 DEHAT · 1989 ರಲ್ಲಿ ಯುವ ಸಮೂಹವಾಗಿ ಆರಂಭ · 2000 ರಲ್ಲಿ ನೋಂದಣಿ',
    };
    const MAI = {
foot_policies:'नीति आ सुरक्षा उपाय', foot_cookies:'कुकी सेटिंग',
      nav_home:'मुख पृष्ठ', nav_who:'हम के छी', nav_work:'हमर कार्य', nav_impact:'प्रभाव', nav_stories:'कथा सभ', nav_media:'मीडिया', nav_involved:'संग जुड़ू',
      donate:'निवेश करू', since:'1989 सँ', org_full:'मानव उन्नयन क लेल विकास संघ',
      language:'भाषा', lang_indian:'भारतीय भाषा सभ', lang_global:'वैश्विक (UN)',
      hero_title_a:'एक बाल-केंद्रित समाज जतय हर बच्चा अपन ', hero_title_b:'अधिकार', hero_title_c:' पाबय — सुरक्षित, सम्मानित आ सम्पूर्ण।',
      hero_sub:'हम भारत-नेपाल तराई क्षेत्र मे समुदाय आ सार्वजनिक तंत्र सभक संग काज करैत छी ताकि बच्चा सभक अधिकार केवल कागज़ पर नहि रहय, बल्कि रोजमर्रा क जीवन मे पहचानल, प्राप्त आ सुनिश्चित कएल जाए।',
      hero_cta1:'समुदाय सभक संग ठाढ़ होउ', hero_cta2:'देखू हम कोना काज करैत छी', hero_photo:'फोटो — बाल संसद नेता, लोहरा गाँव, बहराइच',
      hero_principle:'समुदाय आ सरकारी तंत्र सँग मिलिकय, हर बच्चा लेल।',
      stat_children:'बच्चा आ किशोर सभ तक पहुँच', stat_invested:'2000 सँ सामुदायिक तंत्र मे निवेश', stat_resources:'सार्वजनिक संसाधन तक पहुँच', stat_districts:'2 राज्य क ज़िला',
      stat_hint:'चारि आँकड़ा, छिपल। देखबाक लेल एकटा पर टैप करू।', stat_reveal:'देखबाक लेल टैप करू', stat_hide:'छिपाउ', stat_reveal_all:'चारू देखाउ', stat_hide_all:'सभटा छिपाउ', grid_reveal_all:'चौद टा देखाउ', grid_hint:'चौद आँकड़ा, छिपल। देखबाक लेल एकटा पर टैप करू।', bl_drag:'सर्वेक्षण के आगू खींचू',
      vision:'दृष्टि', mission:'लक्ष्य', theory:'परिवर्तन क सिद्धांत',
      vision_body:'एक बाल-केंद्रित समाज जतय हर बच्चा अपन अधिकार पाबय आ सुरक्षित, सम्मानित तथा परिपूर्ण जीवन जीबय।',
      mission_body:'समुदाय आ तंत्र सभक संग मिलि क विद्यमान शक्ति के साकार करब, ताकि बच्चा सभक अधिकार रोजमर्रा क जीवन मे पहचानल, प्राप्त आ सुनिश्चित होइक।',
      theory_body:'जखन समुदाय काज करैत अछि आ तंत्र मिलि क प्रतिक्रिया दैत अछि, तखन बच्चा सभक अस्तित्व, विकास, संरक्षण आ सहभागिता साकार आ स्थायी होइत अछि।',
      eyebrow_work:'हम की करैत छी', work_head:'चारि मोर्चा, एक साझा प्रतिक्रिया।',
      eyebrow_where:'हम कतय काज करैत छी', where_head:'23 ज़िला। 2 राज्य। एक सीमा।',
      where_sub:'हम उत्तर प्रदेश क पूर्वी भारत-नेपाल सीमा आ महाराष्ट्र मे काज करैत छी — ई क्षेत्र साझा संरचनात्मक असुरक्षा सँ बान्हल अछि। ज़मीनी हकीकत देखबाक लेल केओ ज़िला पर टैप करू।',
      eyebrow_cycle:'संरचनात्मक असुरक्षा क चक्र', cycle_head:'जोखिम अकेल नहि आबैत अछि।',
      cycle_sub:'ई पीढ़ी-दर-पीढ़ी एक-दोसर के मजगूत करैत अछि — जाबत तंत्र समय पर प्रतिक्रिया नहि दैत अछि। कोनो निश्चित क्रम नहि अछि: कोनो बच्चा क लेल ई जाल कोनो सेहो बिंदु सँ शुरू भ सकैत अछि, आ हर जोखिम अगिला के आओर लग खींचि अनैत अछि।',
      cycle_pick:'देखबाक लेल जे केना एकटा जीवन गढ़ल जाइत अछि, कोनो क्षण पर टैप करू।',
      cycle_note:'हर आँकड़ा उत्तर प्रदेश क भारत-नेपाल तराई पट्टी क सात ज़िला — बहराइच, श्रावस्ती, बलरामपुर, लखीमपुर खीरी, सिद्धार्थनगर, महराजगंज आ कुशीनगर — मे दर्ज सभसँ खराब मान के देखबैत अछि। स्रोत: स्वास्थ्य, पोषण आ लैंगिक आँकड़ा राष्ट्रीय परिवार स्वास्थ्य सर्वेक्षण 5 (2019–21) क ज़िला फैक्ट-शीट डेटासेट (स्वास्थ्य आ परिवार कल्याण मंत्रालय / अंतर्राष्ट्रीय जनसंख्या विज्ञान संस्थान) सँ लेल गेल अछि; स्कूली शिक्षा क आँकड़ा एकीकृत ज़िला शिक्षा सूचना प्रणाली प्लस (यूडाइएसई+) क ज़िला फैक्ट शीट सँ; आ मातृ मृत्यु दर नमूना पंजीकरण प्रणाली सँ, जे राज्य-स्तरीय अछि। सभटा स्वास्थ्य आँकड़ा एक्के सर्वेक्षण दौर सँ लेल गेल अछि, तें ज़िला सभक तुलना समान आधार पर होइत अछि। दांपत्य हिंसा केवल राष्ट्रीय परिवार स्वास्थ्य सर्वेक्षण क राज्य-मॉड्यूल मे संग्रहित होइत अछि आ ओकरा उत्तर प्रदेश क आँकड़ा क रूप मे देखाओल गेल अछि। चारि पहलू — बाल श्रम, सभसँ गरीब आर्थिक वर्ग, आ शिशु आ पाँच-वर्ष सँ नीचा मृत्यु दर — प्रशासनिक अभिलेख पर आधारित अछि, जकर पुनः सत्यापन बाकी अछि, आ एहि बात के स्पष्ट कहल गेल अछि। भारत मे शिशु आ पाँच-वर्ष सँ नीचा मृत्यु दर क कोनो आधिकारिक ज़िला-स्तरीय शृंखला प्रकाशित नहि होइत अछि। हर पहलू अपन ज़िला आ स्रोत क नाम बताबैत अछि।',
      eyebrow_process:'प्रक्रिया', process_head:'जखन समुदाय काज करैत अछि, तंत्र प्रतिक्रिया दैत अछि।', eyebrow_stories:'परिवर्तन क कथा',
      cta_donate:'निवेश करू', cta_donate_b:'समुदाय-नेतृत्व वाला काज के पूंजी वा सामग्री सँ, ऑनलाइन वा ऑफलाइन समर्थन करू।', cta_donate_a:'अखनि निवेश करू',
      cta_vol:'स्वयंसेवा', cta_vol_b:'इंटर्नशिप करू, वर्चुअल काज करू, वा DEHAT फेलो बनू।', cta_vol_a:'हमरा संग जुड़ू',
      cta_partner:'साझेदारी', cta_partner_b:'कॉर्पोरेट, शैक्षणिक, वा संस्थागत साझेदारी।', cta_partner_a:'सहयोग करू',
      pillar_link_work:'चारू कार्यक्रम देखू', pillar_link_how:'देखू हम कोना काज करैत छी', stories_all:'सभटा कथा पढ़ू',
      work_title:'अधिकार, रोजमर्रा क जीवन मे साकार।',
      chrono_title:'हर परियोजना, कालक्रमिक क्रम मे',
      count_label:'दर्ज परियोजना',
      open_programme:'कार्यक्रम खोलू',
      work_sub:'चारि कार्यक्रम, जकर शुरुआत के क्रम मे। हर एक अपन अलग पन्ना पर खुजैत अछि — काज किएक अछि, ई कोना बनल अछि, आ एकर द्वारा कएल गेल हर परियोजना, कालक्रमिक क्रम मे, हर एक क पाछा क क्या, कहाँ, कोना, कखन, किएक आ निवेश संग।',
      portfolio_total:'सार्वजनिक रिकॉर्ड पर परियोजना', portfolio_investment:'कुल सामाजिक निवेश',
      portfolio_count:'चारि कार्यक्रम मे परियोजना',
      filter_year:'वर्ष', filter_state:'राज्य', filter_district:'ज़िला', filter_sdg:'विकास लक्ष्य', filter_csr:'कॉर्पोरेट सामाजिक उत्तरदायित्व · अनुसूची VII', filter_uncrc:'बाल अधिकार', filter_investor:'सामाजिक निवेशक', filter_all:'सभ',
      open_details:'पूरा रिकॉर्ड खोलू', close_details:'रिकॉर्ड बंद करू', phases_label:'चरण',
      annual_label:'वर्ष दर वर्ष',
      cross_from:'ई सेहो भाग अछि',
      shared_note:'साझा सामाजिक निवेश दायरा:',
      d_what:'ओ परिवर्तन जे हम करय चाहैत छलहुं', d_why:'एतय ई किएक महत्वपूर्ण छल',
      d_how:'समुदाय आ तंत्र सभ केना संगे काज कयलक', d_impact:'प्रभाव संख्या',
      d_investor:'सामाजिक निवेशक', d_investors:'सामाजिक निवेशक सभ', d_investment:'सामाजिक निवेश',
      m_when:'कखन आ स्थिति', m_location:'कतय', m_sdg:'विकास लक्ष्य सभ', m_csr:'कॉर्पोरेट सामाजिक उत्तरदायित्व · अनुसूची VII', m_uncrc:'बच्चा क अधिकार', m_law:'भारतीय कानून आ नीति आधार', m_law_none:'एहि परियोजना क लेल कोनो एकल विधिक आधार दर्ज नहि अछि।',
      invest_note:'जेना दस्तावेज़ीकृत अछि तहिना प्रकाशित; समेकित नहि।',
      impact_eyebrow:'प्रभाव', impact_title:'2000 सँ, समुदाय क संग जखन ओ अपन अधिकार क दावा करैत अछि आ सार्वजनिक तंत्र सभक संग साझेदारी मे ओकरा पूरा करय क लेल काज करैत अछि।',
      impact_sub:'1989 मे एकटा युवा समूह क रूप मे शुरुआत, 2000 मे पंजीकृत। ई आँकड़ा पैमाना देखबैत अछि; एकर पाछा समुदाय, क्षेत्र कार्यकर्ता आ सार्वजनिक संस्था सभ मिलि क काज करैत अछि।',
      reach_head:'अखन धरि भौगोलिक विस्तार', reach_states:'राज्य', reach_districts:'ज़िला', reach_blocks:'ब्लॉक', reach_villages:'गाँव', reach_children:'बच्चा आ किशोर', reach_farmers:'महिला किसान',
      stories_eyebrow:'परिवर्तन क कथा', stories_title:'यथार्थ, फेर परिवर्तन।',
      stories_sub:'हर मामला-कथा चारि बाल अधिकार सभ मे सँ एक — जीवन, विकास, संरक्षण, सहभागिता — क इर्द-गिर्द संगठित अछि।',
      involved_eyebrow:'संग जुड़ू', involved_title:'विद्यमान शक्ति के साकार करू — हमरा संग।',
      involved_sub:'अहां एक घंटा दिअ, एक कौशल वा एक रुपैआ — अहां ओहि तंत्र क हिस्सा बनैत छी जे प्रतिक्रिया दैत अछि।',
      involved_cta_title:'समुदाय सभक संगे निवेश करू।',
      involved_cta_sub:'पूंजी वा सामग्री, ऑनलाइन वा ऑफलाइन — हर रुपैआ ओहि क्षमता मे जाइत अछि जे समुदाय हमरा जाय क बाद सेहो राखैत अछि।',
      donate_now:'साझेदारी शुरू करू', email_us:'ईमेल करू', f_email:'ईमेल', f_phone:'फोन', f_web:'वेब', f_address:'पता',
      nav_finance:'पारदर्शिता', nav_answers:'उत्तर',
      fin_eyebrow:'वित्तीय पारदर्शिता', fin_title:'हर रुपैआ, रिकॉर्ड मे।',
      fin_sub:'स्वतंत्र रूप सँ अंकेक्षित लेखा — निवेश साझेदार सभ की प्रतिबद्ध कयलक, की काज तक पहुँचल, आ दुनू क पाछा क वैधानिक जाँच। हर आँकड़ा हस्ताक्षरित बैलेंस शीट सँ लेल गेल अछि।',
      fin_stat_received:'20 वर्ष मे प्रतिबद्ध', fin_stat_fcra:'विदेशी अंशदान · विदेशी अंशदान (विनियमन) अधिनियम', fin_stat_inr:'घरेलू अंशदान · भारतीय रुपैआ', fin_stat_funders:'रिकॉर्ड पर निवेश साझेदार',
      fin_years_head:'वर्ष दर वर्ष', fin_years_sub:'की आयल, की खर्च भेल, आ के लेखा पर हस्ताक्षर कयलक। ओकर सामाजिक निवेशक देखबाक लेल एकटा वर्ष चुनू।',
      fin_received:'प्रतिबद्ध', fin_utilised:'नियोजित', fin_auditor:'अंकेक्षक', fin_bs:'बैलेंस शीट', fin_surplus:'अधिशेष', fin_deficit:'घाटा', fin_partial:'आंशिक आँकड़ा', fin_compiled:'संकलित',
      fin_funders_head:'ई काज मे के निवेश करैत अछि', fin_funders_sub:'ओ संस्था आ व्यक्ति जकर पूंजी सँ ई काज चलैत अछि — साझा परिणाम क साझेदार, एकतरफा दानदाता नहि। कानून क अनुसार विदेशी अंशदान एकटा अलग विदेशी अंशदान (विनियमन) अधिनियम खाता मे राखल आ अंकेक्षित होइत अछि; घरेलू निधि रुपैआ बही सँ चलैत अछि।',
      fin_regime_fcra:'विदेशी अंशदान (विनियमन) अधिनियम · विदेशी', fin_regime_inr:'भारतीय रुपैआ · घरेलू',
      fin_funders_cta:'सभटा साझेदार देखू',
      fin_compliance_head:'वैधानिक अनुपालन', fin_compliance_sub:'DEHAT एकटा पंजीकृत सोसायटी अछि (सोसायटी पंजीकरण अधिनियम, 1860)। नीचा वार्षिक जवाबदेही चक्र अछि जकरा कोनो समीक्षक देखय क आशा करैत अछि — आ जे DEHAT दाखिल करैत अछि।',
      fin_reg_head:'पंजीकरण', fin_cal_head:'वार्षिक फाइलिंग कैलेंडर', fin_rules_head:'हम कोन-कोन क विरुद्ध रिपोर्ट करैत छी',
      fin_auditor_trail:'हर वर्ष एकटा कार्यरत सनदी लेखाकार द्वारा अंकेक्षित आ यूनीक डॉक्यूमेंट आइडेंटिफिकेशन नंबर सँ हस्ताक्षरित। पछिला दशक मे पाँच अलग फर्म सभ लेखा क जाँच कयलक — कोनो एकल दीर्घकालिक संबंध नहि।',
      fin_due:'देय', fin_year_funders:'ई वर्ष क निवेश साझेदार',
      fin_docs_head:'प्रमाण-पत्र आ दस्तावेज़', fin_docs_sub:'हर पंजीकरण, अनुमोदन आ तृतीय-पक्ष मान्यता — मूल प्रमाण-पत्र सँ स्कैन। स्रोत दस्तावेज़ पढ़बाक लेल केओ खोलू।',
      fin_docg_statutory:'पंजीकरण आ कर', fin_docg_fcra:'विदेशी अंशदान · विदेशी अंशदान (विनियमन) अधिनियम', fin_docg_validation:'मान्यता आ सम्मान',
      fin_doc_view:'दस्तावेज़ देखू', fin_pending_label:'अंकेक्षित स्कैन फ़ाइल मे — आँकड़ा डिजिटल कएल जा रहल अछि',
      foot_explore:'खोजू', foot_reach:'हमरा तक पहुँचू', foot_follow:'काज के फॉलो करू',
      foot_desc:'मानव उन्नयन क लेल विकास संघ — समुदाय आ तंत्र सभक संग काज ताकि बच्चा सभक अधिकार पहचानल, प्राप्त आ सुनिश्चित होइक।',
      foot_rights:'© 2026 DEHAT · 1989 मे युवा समूह क रूप मे शुरुआत · 2000 मे पंजीकृत',
    };
    const AS = {
foot_policies:'নীতি আৰু সুৰক্ষা ব্যৱস্থা',
      foot_cookies:'কুকী ছেটিংছ',
      nav_home:'গৃহপৃষ্ঠা',
      nav_who:'আমি কোন',
      nav_work:'আমাৰ কাম',
      nav_impact:'প্ৰভাৱ',
      nav_stories:'কাহিনী',
      nav_media:'মিডিয়া',
      nav_involved:'জড়িত হওক',
      donate:'বিনিয়োগ কৰক',
      since:'1989 চনৰ পৰা',
      org_full:'মানৱ উন্নয়নৰ বাবে বিকাশ সংস্থা',
      language:'ভাষা',
      lang_indian:'ভাৰতীয় ভাষাসমূহ',
      lang_global:'বিশ্বব্যাপী (UN)',
      hero_title_a:'এক শিশু-কেন্দ্ৰিক সমাজ যত প্ৰতিজন শিশুৱে তেওঁলোকৰ ',
      hero_title_b:'অধিকাৰ',
      hero_title_c:' উপভোগ কৰে — সুৰক্ষিত, মৰ্যাদাসম্পন্ন আৰু সম্পূৰ্ণ।',
      hero_sub:'আমি ভাৰত-নেপাল তৰাই অঞ্চলত সম্প্ৰদায় আৰু ৰাজহুৱা ব্যৱস্থাৰ সৈতে কাম কৰোঁ যাতে শিশুৰ অধিকাৰ কেৱল লিখিত ৰূপত নাথাকি, দৈনন্দিন জীৱনত স্বীকৃত, লভ্য আৰু সুনিশ্চিত হয়।',
      hero_cta1:'সম্প্ৰদায়ৰ সৈতে থিয় দিয়ক',
      hero_cta2:'আমি কেনেকৈ কাম কৰোঁ চাওক',
      hero_photo:'ফটো — শিশু সংসদৰ নেতা, লোহৰা গাঁও, বহৰাইচ',
      hero_principle:'সম্প্ৰদায় আৰু চৰকাৰী ব্যৱস্থাৰ সৈতে একেলগে কাম কৰি, প্ৰতিটো শিশুৰ বাবে।',
      stat_children:'পোৱা শিশু আৰু কিশোৰ-কিশোৰী',
      stat_invested:'2000 চনৰ পৰা সামুদায়িক ব্যৱস্থাত বিনিয়োগ',
      stat_resources:'লভ্য হোৱা ৰাজহুৱা সম্পদ',
      stat_districts:'2 খন ৰাজ্যৰ জিলা',
      stat_hint:'চাৰিটা পৰিসংখ্যা লুকুৱাই থোৱা হৈছে। চাবলৈ এটাত টিপক।',
      stat_reveal:'দেখুৱাবলৈ টিপক',
      stat_hide:'লুকুৱাওক',
      stat_reveal_all:'সকলো চাৰিটা দেখুৱাওক',
      stat_hide_all:'সকলো লুকুৱাওক',
      grid_reveal_all:'সকলো চৈধ্য দেখুৱাওক',
      grid_hint:'চৈধ্যটা পৰিসংখ্যা লুকুৱাই থোৱা হৈছে। চাবলৈ এটাত টিপক।',
      bl_drag:'সমীক্ষাখন সন্মুখলৈ টানি নিয়ক',
      vision:'দৃষ্টিভংগী',
      mission:'লক্ষ্য',
      theory:'পৰিৱৰ্তনৰ তত্ত্ব',
      vision_body:'এক শিশু-কেন্দ্ৰিক সমাজ যত প্ৰতিজন শিশুৱে নিজৰ অধিকাৰ উপভোগ কৰে আৰু সুৰক্ষিত, মৰ্যাদাসম্পন্ন তথা পূৰ্ণাংগ জীৱন যাপন কৰে।',
      mission_body:'সম্প্ৰদায় আৰু ব্যৱস্থাৰ সৈতে মিলি বৰ্তমান থকা শক্তি সাকাৰ কৰাটো, যাতে শিশুৰ অধিকাৰ দৈনন্দিন জীৱনত স্বীকৃত, লভ্য আৰু সুনিশ্চিত হয়।',
      theory_body:'যেতিয়া সম্প্ৰদায়ে কাম কৰে আৰু ব্যৱস্থাই একত্ৰিতভাৱে সঁহাৰি দিয়ে, তেতিয়া শিশুৰ জীৱন ৰক্ষা, বিকাশ, সুৰক্ষা আৰু অংশগ্ৰহণ সাকাৰ আৰু স্থায়ী হয়।',
      eyebrow_work:'আমি কি কৰোঁ',
      work_head:'চাৰিটা মৰ্চা, এক মিলিত সঁহাৰি।',
      eyebrow_where:'আমি ক’ত কাম কৰোঁ',
      where_head:'23 জিলা। 2 ৰাজ্য। এটা সীমা।',
      where_sub:'আমি উত্তৰ প্ৰদেশৰ পূব ভাৰত-নেপাল সীমান্ত আৰু মহাৰাষ্ট্ৰত কাম কৰোঁ — সাধাৰণ গাঁথনিগত দুৰ্বলতাৰে বন্ধা অঞ্চল। মাটিৰ পৰিস্থিতি চাবলৈ কোনো এখন জিলাত টিপক।',
      eyebrow_cycle:'গাঁথনিগত দুৰ্বলতাৰ চক্ৰ',
      cycle_head:'বিপদ অকলে নাহে।',
      cycle_sub:'সিহঁতে প্ৰজন্মৰ পাছত প্ৰজন্মলৈকে ইজনে সিজনক শক্তিশালী কৰে — যেতিয়ালৈকে ব্যৱস্থাই সময়মতে সঁহাৰি নিদিয়ে। কোনো নিৰ্দিষ্ট ক্ৰম নাই: যিকোনো শিশুৰ বাবে এই ফান্দ যিকোনো বিন্দুৰ পৰা আৰম্ভ হ’ব পাৰে, আৰু প্ৰতিটো বিপদে পৰৱৰ্তীটোক অধিক ওচৰ চপাই আনে।',
      cycle_pick:'এটা জীৱন কেনেকৈ গঠিত হয় চাবলৈ যিকোনো মুহূৰ্তত টিপক।',
      cycle_note:'প্ৰতিটো পৰিসংখ্যা উত্তৰ প্ৰদেশৰ ভাৰত-নেপাল তৰাই পটিৰ সাতখন জিলা — বহৰাইচ, শ্ৰাৱস্তী, বলৰামপুৰ, লখীমপুৰ খেৰী, সিদ্ধাৰ্থনগৰ, মহাৰাজগঞ্জ আৰু কুশীনগৰত পোৱা সৰ্বাধিক গুৰুতৰ মান। উৎস: স্বাস্থ্য, পুষ্টি আৰু লিংগ সংক্ৰান্ত তথ্যৰ বাবে ৰাষ্ট্ৰীয় পৰিয়াল স্বাস্থ্য সমীক্ষা 5 (2019–21)ৰ জিলা তথ্য-পত্ৰ ডাটাছেট (স্বাস্থ্য আৰু পৰিয়াল কল্যাণ মন্ত্ৰালয় / আন্তঃৰাষ্ট্ৰীয় জনসংখ্যা বিজ্ঞান প্ৰতিষ্ঠান); বিদ্যালয় শিক্ষাৰ বাবে সংহত জিলা শিক্ষা তথ্য ব্যৱস্থা প্লাছৰ জিলা তথ্য-পত্ৰ; আৰু মাতৃ মৃত্যুহাৰৰ বাবে নমুনা পঞ্জীয়ন ব্যৱস্থা, যিটো ৰাজ্যিক স্তৰৰ। প্ৰতিটো স্বাস্থ্য পৰিসংখ্যা এটাই সমীক্ষা পৰ্যায়ৰ পৰা লোৱা, সেয়ে জিলাসমূহৰ তুলনা সমান ভিত্তিত কৰা হৈছে। দম্পতীৰ মাজৰ হিংসাৰ তথ্য কেৱল ৰাষ্ট্ৰীয় পৰিয়াল স্বাস্থ্য সমীক্ষাৰ ৰাজ্যিক মডিউলত সংগ্ৰহ কৰা হয় আৰু উত্তৰ প্ৰদেশৰ পৰিসংখ্যা হিচাপে দেখুওৱা হৈছে। চাৰিটা মুহূৰ্ত — শিশু শ্ৰম, দৰিদ্ৰতম সম্পদ শ্ৰেণী, আৰু শিশু আৰু পাঁচ বছৰৰ তলৰ মৃত্যুহাৰ — এতিয়াও পুনৰ-সত্যাপনৰ অপেক্ষাত থকা তথ্যৰ ওপৰত ভিত্তি কৰি আছে, আৰু এই কথা স্পষ্টভাৱে উল্লেখ কৰা হৈছে। ভাৰতে শিশু বা পাঁচ বছৰৰ তলৰ মৃত্যুহাৰৰ কোনো চৰকাৰী জিলাভিত্তিক শৃংখলা প্ৰকাশ নকৰে। প্ৰতিটো মুহূৰ্তই নিজৰ জিলা আৰু উৎস উল্লেখ কৰে।',
      eyebrow_process:'প্ৰক্ৰিয়া',
      process_head:'যেতিয়া সম্প্ৰদায়ে কাম কৰে, ব্যৱস্থাই সঁহাৰি দিয়ে।',
      eyebrow_stories:'পৰিৱৰ্তনৰ কাহিনী',
      cta_donate:'বিনিয়োগ কৰক',
      cta_donate_b:'সম্প্ৰদায়-নেতৃত্বাধীন কামক পুঁজি বা সামগ্ৰীৰে, অনলাইন বা অফলাইনত সমৰ্থন কৰক।',
      cta_donate_a:'এতিয়াই বিনিয়োগ কৰক',
      cta_vol:'স্বেচ্ছাসেৱক হওক',
      cta_vol_b:'ইণ্টাৰ্ণশ্বিপ কৰক, ভাৰ্চুৱেলি কাম কৰক, বা DEHAT ফেল’ হওক।',
      cta_vol_a:'আমাৰ সৈতে যোগ দিয়ক',
      cta_partner:'অংশীদাৰ হওক',
      cta_partner_b:'কৰ্পৰেট, শৈক্ষিক, বা প্ৰাতিষ্ঠানিক অংশীদাৰিত্ব।',
      cta_partner_a:'সহযোগ কৰক',
      pillar_link_work:'চাৰিটা কাৰ্যসূচী চাওক',
      pillar_link_how:'আমি কেনেকৈ কাম কৰোঁ চাওক',
      stories_all:'সকলো কাহিনী পঢ়ক',
      work_title:'অধিকাৰ, দৈনন্দিন জীৱনত সাকাৰ।',
      chrono_title:'প্ৰতিটো প্ৰকল্প, কালানুক্ৰমিকভাৱে',
      count_label:'তথ্যত থকা প্ৰকল্প',
      open_programme:'কাৰ্যসূচী খোলক',
      work_sub:'চাৰিটা কাৰ্যসূচী, সিহঁত আৰম্ভ হোৱা ক্ৰমত। প্ৰতিটোৱে নিজৰ পৃষ্ঠা খোলে — কামটো কিয় আছে, ই কেনেকৈ গঠিত, আৰু ই বহন কৰা প্ৰতিটো প্ৰকল্প, কালানুক্ৰমিকভাৱে প্ৰতিটোৰ পিছত থকা কি, ক’ত, কেনেকৈ, কেতিয়া, কিয় আৰু বিনিয়োগৰ সৈতে।',
      portfolio_total:'ৰাজহুৱা তথ্যত থকা প্ৰকল্প',
      portfolio_investment:'মুঠ সামাজিক বিনিয়োগ',
      portfolio_count:'চাৰিটা কাৰ্যসূচীৰ প্ৰকল্প',
      filter_year:'বৰ্ষ',
      filter_state:'ৰাজ্য',
      filter_district:'জিলা',
      filter_sdg:'উন্নয়ন লক্ষ্য',
      filter_csr:'কৰ্পৰেট সামাজিক দায়বদ্ধতা · অনুসূচী VII',
      filter_uncrc:'শিশু অধিকাৰ',
      filter_investor:'সামাজিক বিনিয়োগকাৰী',
      filter_all:'সকলো',
      open_details:'সম্পূৰ্ণ তথ্য খোলক',
      close_details:'তথ্য বন্ধ কৰক',
      phases_label:'পৰ্যায়সমূহ',
      annual_label:'বছৰ অনুসৰি',
      cross_from:'ইয়াৰো অংশ',
      shared_note:'সাধাৰণ সামাজিক বিনিয়োগ পৰিসৰ:',
      d_what:'আমি আনিব বিচৰা পৰিৱৰ্তন',
      d_why:'ইয়াত ই কিয় গুৰুত্বপূৰ্ণ আছিল',
      d_how:'সম্প্ৰদায় আৰু ব্যৱস্থাই কেনেকৈ একেলগে কাম কৰিলে',
      d_impact:'প্ৰভাৱৰ পৰিসংখ্যা',
      d_investor:'সামাজিক বিনিয়োগকাৰী',
      d_investors:'সামাজিক বিনিয়োগকাৰীসকল',
      d_investment:'সামাজিক বিনিয়োগ',
      m_when:'কেতিয়া আৰু অৱস্থা',
      m_location:'ক’ত',
      m_sdg:'উন্নয়ন লক্ষ্যসমূহ',
      m_csr:'কৰ্পৰেট সামাজিক দায়বদ্ধতা · অনুসূচী VII',
      m_uncrc:'শিশুৰ অধিকাৰ',
      m_law:'ভাৰতীয় আইন আৰু নীতিগত ভিত্তি',
      m_law_none:'এই প্ৰকল্পৰ বাবে কোনো একক বিধিসন্মত ভিত্তি লিপিবদ্ধ কৰা হোৱা নাই।',
      invest_note:'ঠিক নথিভুক্ত কৰা ধৰণেই প্ৰকাশিত; একত্ৰিত কৰা হোৱা নাই।',
      impact_eyebrow:'প্ৰভাৱ',
      impact_title:'2000 চনৰ পৰা, সম্প্ৰদায়ে অধিকাৰ দাবী কৰাৰ লগে লগে আৰু সেয়া প্ৰদানৰ বাবে ৰাজহুৱা ব্যৱস্থাৰ সৈতে অংশীদাৰিত্বত কাম কৰোঁতে সঙ্গ দি।',
      impact_sub:'1989 চনত এটা যুৱ সংগঠন হিচাপে আৰম্ভ, 2000 চনত পঞ্জীয়ন। এই পৰিসংখ্যাই পৰিসৰ দেখুৱায়; ইয়াৰ পিছত থকা প্ৰকৃত অৰ্থ হ’ল সম্প্ৰদায়, মাটিৰ কৰ্মী আৰু ৰাজহুৱা প্ৰতিষ্ঠানে একেলগে কৰা কাম।',
      reach_head:'এতিয়ালৈকে ভৌগোলিক প্ৰসাৰ',
      reach_states:'ৰাজ্য',
      reach_districts:'জিলা',
      reach_blocks:'খণ্ড',
      reach_villages:'গাঁও',
      reach_children:'শিশু আৰু কিশোৰ-কিশোৰী',
      reach_farmers:'মহিলা কৃষক',
      stories_eyebrow:'পৰিৱৰ্তনৰ কাহিনী',
      stories_title:'বাস্তৱতা, তাৰ পিছত ৰূপান্তৰ।',
      stories_sub:'প্ৰতিটো ঘটনা কাহিনী চাৰিটা শিশু অধিকাৰৰ এটাৰ চাৰিওফালে সংগঠিত — জীৱন ৰক্ষা, বিকাশ, সুৰক্ষা, অংশগ্ৰহণ।',
      involved_eyebrow:'জড়িত হওক',
      involved_title:'বৰ্তমান থকা শক্তি সাকাৰ কৰক — আমাৰ সৈতে।',
      involved_sub:'আপুনি এঘণ্টা, এটা দক্ষতা, বা এটকা যিয়েই নিদিয়ক কিয়, আপুনি সঁহাৰি দিয়া এক ব্যৱস্থাৰ অংশ হৈ পৰে।',
      involved_cta_title:'সম্প্ৰদায়ৰ সৈতে বিনিয়োগ কৰক।',
      involved_cta_sub:'পুঁজি বা সামগ্ৰী, অনলাইন বা অফলাইন — প্ৰতিটো টকা আমি এৰি যোৱাৰ পাছতো সম্প্ৰদায়ে ৰাখি থোৱা সামৰ্থ্যত যায়।',
      donate_now:'অংশীদাৰিত্ব আৰম্ভ কৰক',
      email_us:'আমাক ইমেইল কৰক',
      f_email:'ইমেইল',
      f_phone:'ফ’ন',
      f_web:'ৱেব',
      f_address:'ঠিকনা',
      nav_finance:'স্বচ্ছতা',
      nav_answers:'উত্তৰ',
      fin_eyebrow:'বিত্তীয় স্বচ্ছতা',
      fin_title:'প্ৰতিটো টকা, তথ্যত।',
      fin_sub:'স্বতন্ত্ৰভাৱে অডিট কৰা একাউণ্ট — বিনিয়োগ অংশীদাৰসকলে কি প্ৰতিশ্ৰুতি দিছিল, কি কামলৈ পাইছিল, আৰু দুয়োটাৰ পিছত থকা বিধিসন্মত পৰীক্ষা। প্ৰতিটো পৰিসংখ্যা এখন স্বাক্ষৰিত বেলেঞ্চ শ্বীটৰ পৰা লোৱা।',
      fin_stat_received:'20 বছৰতকৈ অধিক সময়ত প্ৰতিশ্ৰুত',
      fin_stat_fcra:'বৈদেশিক অনুদান · বৈদেশিক অনুদান (নিয়ন্ত্ৰণ) আইন',
      fin_stat_inr:'অভ্যন্তৰীণ অনুদান · ভাৰতীয় টকা',
      fin_stat_funders:'তথ্যত থকা বিনিয়োগ অংশীদাৰ',
      fin_years_head:'বছৰ অনুসৰি',
      fin_years_sub:'কি সোমাল, কি খৰচ হ’ল, আৰু একাউণ্টত কোনে স্বাক্ষৰ কৰিলে। কোনো বছৰৰ সামাজিক বিনিয়োগকাৰী চাবলৈ সেই বছৰ বাছক।',
      fin_received:'প্ৰতিশ্ৰুত',
      fin_utilised:'ব্যৱহৃত',
      fin_auditor:'অডিটৰ',
      fin_bs:'বেলেঞ্চ শ্বীট',
      fin_surplus:'উদ্বৃত্ত',
      fin_deficit:'ঘাটতি',
      fin_partial:'আংশিক তথ্য',
      fin_compiled:'সংকলিত',
      fin_funders_head:'এই কামত কোনে বিনিয়োগ কৰে',
      fin_funders_sub:'এই কাম চলাই থকা পুঁজি থকা প্ৰতিষ্ঠান আৰু ব্যক্তিসকল — একমুখী দাতা নহয়, বৰং সাধাৰণ ফলাফলৰ অংশীদাৰ। আইনে দাবী কৰাৰ দৰে বৈদেশিক অনুদান পৃথক বৈদেশিক অনুদান (নিয়ন্ত্ৰণ) আইন একাউণ্টত ৰখা আৰু অডিট কৰা হয়; অভ্যন্তৰীণ ধন টকাৰ একাউণ্টৰ জৰিয়তে চলে।',
      fin_regime_fcra:'বৈদেশিক অনুদান (নিয়ন্ত্ৰণ) আইন · বৈদেশিক',
      fin_regime_inr:'ভাৰতীয় টকা · অভ্যন্তৰীণ',
      fin_funders_cta:'সকলো অংশীদাৰ চাওক',
      fin_compliance_head:'বিধিসন্মত অনুপালন',
      fin_compliance_sub:'DEHAT এক পঞ্জীয়নভুক্ত সোচাইটি (সোচাইটি পঞ্জীয়ন আইন, 1860)। তলত বাৰ্ষিক জবাবদিহিতাৰ চক্ৰ দিয়া হৈছে যিটো এজন পৰ্যালোচকে দেখিবলৈ আশা কৰে — আৰু যিটো DEHAT-এ দাখিল কৰে।',
      fin_reg_head:'পঞ্জীয়ন',
      fin_cal_head:'বাৰ্ষিক দাখিল পঞ্জিকা',
      fin_rules_head:'আমি কিহৰ ভিত্তিত প্ৰতিবেদন দিওঁ',
      fin_auditor_trail:'প্ৰতিবছৰে অনুশীলনৰত চাৰ্টাৰ্ড একাউণ্টেণ্ট দ্বাৰা অডিট কৰা আৰু বিশিষ্ট নথি চিনাক্তকৰণ নম্বৰেৰে স্বাক্ষৰিত। যোৱা দশকত পাঁচটা বেলেগ বেলেগ প্ৰতিষ্ঠানে একাউণ্ট পৰীক্ষা কৰিছে — কোনো একক দীৰ্ঘমেয়াদী সম্পৰ্ক নাই।',
      fin_due:'শেষ তাৰিখ',
      fin_year_funders:'এই বছৰৰ বিনিয়োগ অংশীদাৰ',
      fin_docs_head:'প্ৰমাণপত্ৰ আৰু নথি',
      fin_docs_sub:'প্ৰতিটো পঞ্জীয়ন, অনুমোদন আৰু তৃতীয়-পক্ষ প্ৰমাণীকৰণ — মূল প্ৰমাণপত্ৰৰ পৰা স্কেন কৰা। উৎস নথি পঢ়িবলৈ যিকোনো এটা খোলক।',
      fin_docg_statutory:'পঞ্জীয়ন আৰু কৰ',
      fin_docg_fcra:'বৈদেশিক অনুদান · বৈদেশিক অনুদান (নিয়ন্ত্ৰণ) আইন',
      fin_docg_validation:'প্ৰমাণীকৰণ আৰু স্বীকৃতি',
      fin_doc_view:'নথি চাওক',
      fin_pending_label:'অডিট কৰা স্কেন ফাইলত আছে — তথ্য ডিজিটেলাইজ কৰি থকা হৈছে',
      foot_explore:'অন্বেষণ কৰক',
      foot_reach:'আমাক সম্পৰ্ক কৰক',
      foot_follow:'কামটো অনুসৰণ কৰক',
      foot_desc:'মানৱ উন্নয়নৰ বাবে বিকাশ সংস্থা — সম্প্ৰদায় আৰু ব্যৱস্থাৰ সৈতে কাম কৰি যাতে শিশুৰ অধিকাৰ স্বীকৃত, লভ্য আৰু সুনিশ্চিত হয়।',
      foot_rights:'© 2026 DEHAT · 1989 চনত যুৱ সংগঠন হিচাপে আৰম্ভ · 2000 চনত পঞ্জীয়ন',
    };
    const NE = {
foot_policies:'नीतिहरू र सुरक्षा उपायहरू',
      foot_cookies:'कुकी सेटिङहरू',
      nav_home:'गृहपृष्ठ',
      nav_who:'हामी को हौं',
      nav_work:'हाम्रो काम',
      nav_impact:'प्रभाव',
      nav_stories:'कथाहरू',
      nav_media:'मिडिया',
      nav_involved:'सहभागी हुनुहोस्',
      donate:'लगानी गर्नुहोस्',
      since:'1989 देखि',
      org_full:'मानव उन्नयनका लागि विकास संगठन',
      language:'भाषा',
      lang_indian:'भारतीय भाषाहरू',
      lang_global:'विश्वव्यापी (UN)',
      hero_title_a:'एउटा बालकेन्द्रित समाज जहाँ हरेक बालबालिकाले आफ्ना ',
      hero_title_b:'अधिकार',
      hero_title_c:' पाउँछन् — सुरक्षित, मर्यादित र पूर्ण।',
      hero_sub:'हामी भारत-नेपाल तराई क्षेत्रमा समुदाय र सार्वजनिक प्रणालीहरूसँग मिलेर काम गर्छौं ताकि बालबालिकाका अधिकार केवल कागजमा मात्र सीमित नरही, दैनिक जीवनमा पहिचान, पहुँच र कायम राखिऊन्।',
      hero_cta1:'समुदायसँग उभिनुहोस्',
      hero_cta2:'हामी कसरी काम गर्छौं हेर्नुहोस्',
      hero_photo:'फोटो — बाल संसद अगुवाहरू, लोहरा गाउँ, बहराइच',
      hero_principle:'समुदाय र सरकारी प्रणालीहरूसँग मिलेर, हरेक बालबालिकाको लागि।',
      stat_children:'पुगेका बालबालिका र किशोरकिशोरी',
      stat_invested:'2000 देखि सामुदायिक प्रणालीमा लगानी',
      stat_resources:'पहुँच पुर्‍याइएको सार्वजनिक संसाधन',
      stat_districts:'2 राज्यका जिल्लाहरू',
      stat_hint:'चार तथ्याङ्क लुकाइएका छन्। हेर्न एउटामा थिच्नुहोस्।',
      stat_reveal:'देखाउन थिच्नुहोस्',
      stat_hide:'लुकाउनुहोस्',
      stat_reveal_all:'सबै चार देखाउनुहोस्',
      stat_hide_all:'सबै लुकाउनुहोस्',
      grid_reveal_all:'सबै चौध देखाउनुहोस्',
      grid_hint:'चौध तथ्याङ्क लुकाइएका छन्। हेर्न एउटामा थिच्नुहोस्।',
      bl_drag:'सर्वेक्षणलाई अगाडि तान्नुहोस्',
      vision:'दृष्टि',
      mission:'लक्ष्य',
      theory:'परिवर्तनको सिद्धान्त',
      vision_body:'एउटा बालकेन्द्रित समाज जहाँ हरेक बालबालिकाले आफ्ना अधिकार पाउँछन् र सुरक्षित, मर्यादित तथा पूर्ण जीवन बाँच्छन्।',
      mission_body:'समुदाय र प्रणालीहरूसँग मिलेर विद्यमान शक्तिलाई साकार पार्न काम गर्ने, ताकि बालबालिकाका अधिकार दैनिक जीवनमा पहिचान, पहुँच र कायम राखिऊन्।',
      theory_body:'जब समुदायले काम गर्छ र प्रणालीहरूले एकसाथ प्रतिक्रिया दिन्छन्, तब बालबालिकाको अस्तित्व, विकास, संरक्षण र सहभागिता साकार र दिगो हुन्छ।',
      eyebrow_work:'हामी के गर्छौं',
      work_head:'चार मोर्चा, एउटा साझा प्रतिक्रिया।',
      eyebrow_where:'हामी कहाँ काम गर्छौं',
      where_head:'23 जिल्ला। 2 राज्य। एउटा सीमा।',
      where_sub:'हामी उत्तर प्रदेशको पूर्वी भारत-नेपाल सीमा र महाराष्ट्रमा काम गर्छौं — साझा संरचनागत जोखिमले बाँधिएका क्षेत्रहरू। जमिनी स्थिति हेर्न कुनै जिल्लामा थिच्नुहोस्।',
      eyebrow_cycle:'संरचनागत जोखिमको चक्र',
      cycle_head:'जोखिमहरू एक्लै आउँदैनन्।',
      cycle_sub:'तिनीहरूले पुस्तौंपुस्ता एकअर्कालाई बलियो बनाउँछन् — जबसम्म प्रणालीले समयमै प्रतिक्रिया दिँदैन। कुनै निश्चित क्रम छैन: कुनै पनि बालबालिकाका लागि यो पासो जुनसुकै बिन्दुबाट सुरु हुन सक्छ, र हरेक जोखिमले अर्कोलाई नजिक तान्छ।',
      cycle_pick:'एउटा जीवन कसरी आकार लिन्छ भन्ने हेर्न कुनै पनि क्षणमा थिच्नुहोस्।',
      cycle_note:'हरेक तथ्याङ्क उत्तर प्रदेशको भारत-नेपाल तराई पेटीका सात जिल्ला — बहराइच, श्रावस्ती, बलरामपुर, लखीमपुर खीरी, सिद्धार्थनगर, महाराजगञ्ज र कुशीनगरमा दर्ता भएको सबैभन्दा खराब मान हो। स्रोतहरू: स्वास्थ्य, पोषण र लैंगिक तथ्याङ्कका लागि राष्ट्रिय परिवार स्वास्थ्य सर्वेक्षण 5 (2019–21) जिल्ला तथ्यपत्र डेटासेट (स्वास्थ्य तथा परिवार कल्याण मन्त्रालय / अन्तर्राष्ट्रिय जनसंख्या विज्ञान संस्थान); विद्यालय शिक्षाका लागि एकीकृत जिल्ला शिक्षा सूचना प्रणाली प्लस जिल्ला तथ्यपत्रहरू; र मातृ मृत्युदरका लागि नमूना दर्ता प्रणाली, जुन राज्यस्तरीय हो। प्रत्येक स्वास्थ्य तथ्याङ्क एउटै सर्वेक्षण चरणबाट लिइएको हो, त्यसैले जिल्लाहरूको तुलना समान आधारमा गरिएको छ। पतिपत्नीबीचको हिंसा राष्ट्रिय परिवार स्वास्थ्य सर्वेक्षणको राज्यस्तरीय मोड्युलमा मात्र संकलन गरिन्छ र उत्तर प्रदेशको तथ्याङ्कका रूपमा देखाइएको छ। चार क्षण — बाल श्रम, सबैभन्दा गरिब सम्पत्ति वर्ग, र शिशु तथा पाँच वर्षमुनिको मृत्युदर — पुनः-प्रमाणीकरणको प्रतीक्षामा रहेका अभिलेखहरूमा आधारित छन्, र यो कुरा स्पष्ट रूपमा उल्लेख गरिएको छ। भारतले शिशु वा पाँच वर्षमुनिको मृत्युदरको आधिकारिक जिल्लास्तरीय शृंखला प्रकाशित गर्दैन। हरेक क्षणले आफ्नो जिल्ला र स्रोत नामाकित गर्छ।',
      eyebrow_process:'प्रक्रिया',
      process_head:'जब समुदायले काम गर्छ, प्रणालीले प्रतिक्रिया दिन्छ।',
      eyebrow_stories:'परिवर्तनका कथाहरू',
      cta_donate:'लगानी गर्नुहोस्',
      cta_donate_b:'समुदाय-नेतृत्वको कामलाई पुँजी वा सामग्रीद्वारा, अनलाइन वा अफलाइन साथ दिनुहोस्।',
      cta_donate_a:'अहिले लगानी गर्नुहोस्',
      cta_vol:'स्वयंसेवक बन्नुहोस्',
      cta_vol_b:'इन्टर्न गर्नुहोस्, भर्चुअल रूपमा काम गर्नुहोस्, वा DEHAT फेलो बन्नुहोस्।',
      cta_vol_a:'हामीसँग जोडिनुहोस्',
      cta_partner:'साझेदार बन्नुहोस्',
      cta_partner_b:'कर्पोरेट, शैक्षिक, वा संस्थागत साझेदारी।',
      cta_partner_a:'सहकार्य गर्नुहोस्',
      pillar_link_work:'चारै कार्यक्रम हेर्नुहोस्',
      pillar_link_how:'हामी कसरी काम गर्छौं हेर्नुहोस्',
      stories_all:'सबै कथा पढ्नुहोस्',
      work_title:'अधिकार, दैनिक जीवनमा साकार।',
      chrono_title:'हरेक परियोजना, कालक्रमअनुसार',
      count_label:'दर्ता भएका परियोजनाहरू',
      open_programme:'कार्यक्रम खोल्नुहोस्',
      work_sub:'चार कार्यक्रम, तिनीहरू सुरु भएको क्रममा। प्रत्येकले आफ्नै पृष्ठ खोल्छ — काम किन अस्तित्वमा छ, यो कसरी निर्मित छ, र यसले बोकेको हरेक परियोजना, कालक्रमअनुसार प्रत्येकको पछाडिको के, कहाँ, कसरी, कहिले, किन र लगानीसहित।',
      portfolio_total:'सार्वजनिक अभिलेखमा रहेका परियोजनाहरू',
      portfolio_investment:'कुल सामाजिक लगानी',
      portfolio_count:'चार कार्यक्रमभरिका परियोजनाहरू',
      filter_year:'वर्ष',
      filter_state:'राज्य',
      filter_district:'जिल्ला',
      filter_sdg:'विकास लक्ष्य',
      filter_csr:'कर्पोरेट सामाजिक उत्तरदायित्व · अनुसूची VII',
      filter_uncrc:'बाल अधिकार',
      filter_investor:'सामाजिक लगानीकर्ता',
      filter_all:'सबै',
      open_details:'पूर्ण विवरण खोल्नुहोस्',
      close_details:'विवरण बन्द गर्नुहोस्',
      phases_label:'चरणहरू',
      annual_label:'वर्षअनुसार',
      cross_from:'यसको पनि हिस्सा',
      shared_note:'साझा सामाजिक लगानी दायरा:',
      d_what:'हामीले ल्याउन खोजेको परिवर्तन',
      d_why:'यहाँ यो किन महत्त्वपूर्ण थियो',
      d_how:'समुदाय र प्रणालीले कसरी सँगै काम गरे',
      d_impact:'प्रभाव तथ्याङ्क',
      d_investor:'सामाजिक लगानीकर्ता',
      d_investors:'सामाजिक लगानीकर्ताहरू',
      d_investment:'सामाजिक लगानी',
      m_when:'कहिले र स्थिति',
      m_location:'कहाँ',
      m_sdg:'विकास लक्ष्यहरू',
      m_csr:'कर्पोरेट सामाजिक उत्तरदायित्व · अनुसूची VII',
      m_uncrc:'बालअधिकार',
      m_law:'भारतीय कानुन र नीति आधार',
      m_law_none:'यस परियोजनाका लागि कुनै एकल वैधानिक आधार दर्ता गरिएको छैन।',
      invest_note:'ठीक जस्तो दस्तावेज गरिएको छ त्यसरी प्रकाशित; एकीकृत गरिएको छैन।',
      impact_eyebrow:'प्रभाव',
      impact_title:'2000 देखि, समुदायले अधिकार दाबी गर्दा र सार्वजनिक प्रणालीहरूसँग साझेदारीमा तिनलाई पूरा गर्न काम गर्दा साथ दिँदै।',
      impact_sub:'1989 मा युवा समूहका रूपमा सुरु, 2000 मा दर्ता। यी तथ्याङ्कले स्तर देखाउँछन्; तिनले जनाउने कुरा हो समुदाय, फिल्ड कार्यकर्ता र सार्वजनिक संस्थाहरूले सँगै गरेको काम।',
      reach_head:'अहिलेसम्मको भौगोलिक पहुँच',
      reach_states:'राज्यहरू',
      reach_districts:'जिल्लाहरू',
      reach_blocks:'ब्लकहरू',
      reach_villages:'गाउँहरू',
      reach_children:'बालबालिका र किशोरकिशोरी',
      reach_farmers:'महिला किसान',
      stories_eyebrow:'परिवर्तनका कथाहरू',
      stories_title:'यथार्थ, त्यसपछि रूपान्तरण।',
      stories_sub:'हरेक घटना कथा चार बालअधिकारमध्ये एउटाको वरिपरि संगठित छ — अस्तित्व, विकास, संरक्षण, सहभागिता।',
      involved_eyebrow:'सहभागी हुनुहोस्',
      involved_title:'विद्यमान शक्तिलाई साकार पार्नुहोस् — हामीसँगै।',
      involved_sub:'तपाईंले एक घण्टा, एउटा सीप, वा एक रुपैयाँ जे दिनुभए पनि, तपाईं प्रतिक्रिया दिने प्रणालीको हिस्सा बन्नुहुन्छ।',
      involved_cta_title:'समुदायसँगै लगानी गर्नुहोस्।',
      involved_cta_sub:'पुँजी वा सामग्री, अनलाइन वा अफलाइन — हरेक रुपैयाँ हामी गइसकेपछि पनि समुदायले राख्ने क्षमतामा जान्छ।',
      donate_now:'साझेदारी सुरु गर्नुहोस्',
      email_us:'हामीलाई इमेल गर्नुहोस्',
      f_email:'इमेल',
      f_phone:'फोन',
      f_web:'वेब',
      f_address:'ठेगाना',
      nav_finance:'पारदर्शिता',
      nav_answers:'उत्तरहरू',
      fin_eyebrow:'वित्तीय पारदर्शिता',
      fin_title:'हरेक रुपैयाँ, अभिलेखमा।',
      fin_sub:'स्वतन्त्र रूपमा लेखा-परीक्षण गरिएका खाताहरू — लगानी साझेदारहरूले प्रतिबद्ध गरेको, कामसम्म पुगेको, र दुवैका पछाडिको वैधानिक जाँचहरू। हरेक तथ्याङ्क हस्ताक्षरित ब्यालेन्स सिटबाट लिइएको हो।',
      fin_stat_received:'20 वर्षभन्दा बढीमा प्रतिबद्ध',
      fin_stat_fcra:'विदेशी योगदान · विदेशी योगदान (नियमन) ऐन',
      fin_stat_inr:'स्वदेशी योगदान · भारतीय रुपैयाँ',
      fin_stat_funders:'दर्ता भएका लगानी साझेदारहरू',
      fin_years_head:'वर्षअनुसार',
      fin_years_sub:'के आयो, के खर्च भयो, र खाताहरूमा कसले हस्ताक्षर गर्‍यो। कुनै वर्षका सामाजिक लगानीकर्ता हेर्न त्यो वर्ष चयन गर्नुहोस्।',
      fin_received:'प्रतिबद्ध',
      fin_utilised:'परिचालित',
      fin_auditor:'लेखा-परीक्षक',
      fin_bs:'ब्यालेन्स सिट',
      fin_surplus:'बचत',
      fin_deficit:'घाटा',
      fin_partial:'आंशिक तथ्याङ्क',
      fin_compiled:'संकलित',
      fin_funders_head:'यस काममा को लगानी गर्छ',
      fin_funders_sub:'यस काम सञ्चालन गर्ने पुँजी भएका संस्था र व्यक्तिहरू — एकतर्फा दाताहरू होइन, साझा नतिजाका साझेदारहरू। कानुनले माग गरेअनुसार विदेशी योगदानहरू छुट्टै विदेशी योगदान (नियमन) ऐन खातामा राखिन्छ र लेखा-परीक्षण गरिन्छ; स्वदेशी कोष रुपैयाँ खाताबाट चल्छ।',
      fin_regime_fcra:'विदेशी योगदान (नियमन) ऐन · विदेशी',
      fin_regime_inr:'भारतीय रुपैयाँ · स्वदेशी',
      fin_funders_cta:'सबै साझेदार हेर्नुहोस्',
      fin_compliance_head:'वैधानिक अनुपालन',
      fin_compliance_sub:'DEHAT एउटा दर्ता भएको सोसाइटी हो (सोसाइटी दर्ता ऐन, 1860)। तल वार्षिक जवाफदेहिता चक्र छ जुन समीक्षकले हेर्न अपेक्षा गर्छ — र जुन DEHAT ले दाखिला गर्छ।',
      fin_reg_head:'दर्ताहरू',
      fin_cal_head:'वार्षिक दाखिला पात्रो',
      fin_rules_head:'हामी केको आधारमा प्रतिवेदन गर्छौं',
      fin_auditor_trail:'हरेक वर्ष अभ्यासरत चार्टर्ड एकाउन्टेन्टद्वारा लेखा-परीक्षण गरिन्छ र विशिष्ट कागजात पहिचान नम्बरसहित हस्ताक्षरित। विगत दशकमा पाँच फरक-फरक फर्मले खाताहरू जाँचेका छन् — कुनै एकल दीर्घकालीन सम्बन्ध छैन।',
      fin_due:'म्याद',
      fin_year_funders:'यस वर्षका लगानी साझेदारहरू',
      fin_docs_head:'प्रमाणपत्र र कागजातहरू',
      fin_docs_sub:'हरेक दर्ता, स्वीकृति र तेस्रो-पक्ष प्रमाणीकरण — मूल प्रमाणपत्रबाट स्क्यान गरिएको। स्रोत कागजात पढ्न कुनै पनि खोल्नुहोस्।',
      fin_docg_statutory:'दर्ता र कर',
      fin_docg_fcra:'विदेशी योगदान · विदेशी योगदान (नियमन) ऐन',
      fin_docg_validation:'प्रमाणीकरण र मान्यता',
      fin_doc_view:'कागजात हेर्नुहोस्',
      fin_pending_label:'लेखा-परीक्षित स्क्यान फाइलमा — तथ्याङ्क डिजिटाइज गर्दै',
      foot_explore:'अन्वेषण गर्नुहोस्',
      foot_reach:'हामीलाई सम्पर्क गर्नुहोस्',
      foot_follow:'काम पछ्याउनुहोस्',
      foot_desc:'मानव उन्नयनका लागि विकास संघ — समुदाय र प्रणालीहरूसँग काम गर्दै ताकि बालबालिकाका अधिकार पहिचान, पहुँच र कायम राखिऊन्।',
      foot_rights:'© 2026 DEHAT · 1989 मा युवा समूहका रूपमा सुरु · 2000 मा दर्ता',
    };
    const KOK = {
foot_policies:'धोरणां आनी सुरक्षा उपाय',
      foot_cookies:'कुकी सेटिंग्ज',
      nav_home:'मुखपान',
      nav_who:'आमी कोण',
      nav_work:'आमचें काम',
      nav_impact:'परिणाम',
      nav_stories:'गोष्टी',
      nav_media:'माध्यम',
      nav_involved:'सामील जावचें',
      donate:'गुंतवणूक करचें',
      since:'1989 पासून',
      org_full:'मनीस उदरगती खातीर विकास संघटन',
      language:'भाशा',
      lang_indian:'भारतीय भाशा',
      lang_global:'जागतीक (UN)',
      hero_title_a:'एक भुरग्यां-केंद्रीत समाज जंय दरेक भुरगें आपले ',
      hero_title_b:'हक्क',
      hero_title_c:' मेळयता — सुरक्षीत, सन्मानान भरिल्लें आनी सम्पूर्ण.',
      hero_sub:'आमी भारत-नेपाळ तराई परिसरांत समाज आनी सरकारी येवजणां सोबत काम करतात, जेणेकरून भुरग्यांचे हक्क फकत कागदार उरचे न्हय, बगर रोजच्या जिणेंत वळखिल्ले, मेळिल्ले आनी सांबाळिल्ले उरतले.',
      hero_cta1:'समाजा सोबत उबे रावचे',
      hero_cta2:'आमी कशें काम करतात तें पळेयात',
      hero_photo:'फोटो — भुरग्यांच्या संसदेचे फुडारी, लोहरा गांव, बहराइच',
      hero_principle:'समुदाय आनी सरकारी यंत्रणा वांगडा मेळून, दर एका भुरग्या खातीर.',
      stat_children:'पावल्लीं भुरगीं आनी किशोरवयस्क',
      stat_invested:'2000 वर्सा सावन समाज येवजणांनी गुंतवणूक',
      stat_resources:'मेळिल्लीं सरकारी साधनां',
      stat_districts:'2 राज्यांतल्या जिल्ह्यांनी',
      stat_hint:'च्यार आंकडे लिपयल्यात. एक पळोवपाक क्लीक करात.',
      stat_reveal:'दाखोवपाक क्लीक करात',
      stat_hide:'लिपयात',
      stat_reveal_all:'च्यारूय दाखयात',
      stat_hide_all:'सगळें लिपयात',
      grid_reveal_all:'चवदाय दाखयात',
      grid_hint:'चवदा आंकडे लिपयल्यात. एक पळोवपाक क्लीक करात.',
      bl_drag:'सर्वेक्षण फुडें वडात',
      vision:'स्वप्न',
      mission:'ध्येय',
      theory:'बदलाची संकल्पना',
      vision_body:'एक भुरग्यां-केंद्रीत समाज जंय दरेक भुरगें आपले हक्क मेळयता आनी सुरक्षीत, सन्मानान भरिल्लें आनी परिपूर्ण जिणें जगता.',
      mission_body:'समाज आनी येवजणां सोबत मेळून आसा तें बळ प्रत्यक्षांत हाडचें, जेणेकरून भुरग्यांचे हक्क रोजच्या जिणेंत वळखिल्ले, मेळिल्ले आनी सांबाळिल्ले उरतले.',
      theory_body:'जेन्ना समाज काम करता आनी येवजणा एकठांय प्रतिसाद दितात, तेन्ना भुरग्यांचें जियेवप, वाड, राखण आनी वांटेकरपण प्रत्यक्षांत येता आनी तग धरता.',
      eyebrow_work:'आमी कितें करतात',
      work_head:'च्यार मोर्चे, एक एकठांय जावपी प्रतिसाद.',
      eyebrow_where:'आमी खंय काम करतात',
      where_head:'23 जिल्हे. 2 राज्यां. एक सीमा.',
      where_sub:'आमी उत्तर प्रदेशांतल्या पूर्वेकडच्या भारत-नेपाळ सीमेर आनी महाराष्ट्रांत काम करतात — एकाच प्रकारच्या रचनात्मक असुरक्षिततायेन बांदिल्ले वाठार. जमनीवयली परिस्थिती पळोवपाक एका जिल्ह्याचेर क्लीक करात.',
      eyebrow_cycle:'रचनात्मक असुरक्षिततायेचें चक्र',
      cycle_head:'धोके एकठाय येनात.',
      cycle_sub:'हे पिळग्यांमेरेन एकामेकाक बळकट करतात — जोपाशिंत येवजणां वेळार प्रतिसाद दिनात. थारावीक क्रम ना: कोणाच्याय भुरग्याखातीर हो सापळो खंयचेय बिंदूवेल्यान सुरू जावं येता, आनी दरेक धोको फुडलो लागीं वडता.',
      cycle_pick:'एक जिणें कशी घडता तें पळोवपाक खंयचेय क्षणाचेर क्लीक करात.',
      cycle_note:'दरेक आंकडो उत्तर प्रदेशांतल्या भारत-नेपाळ तराई पट्ट्यांतल्या सात जिल्ह्यांनी — बहराइच, श्रावस्ती, बलरामपूर, लखीमपूर खेरी, सिद्धार्थनगर, महाराजगंज आनी कुशीनगर — मेरेन नोंद जाल्लो सगळ्यांत वायट आंकडो. स्रोत: भलायकी, पोशण आनी लिंग विशयांक राष्ट्रीय कुटुंब भलायकी सर्वेक्षण 5 (2019–21) जिल्हा फॅक्ट-शीट डेटासेट (भलायकी आनी कुटुंब कल्याण मंत्रालय / आंतरराष्ट्रीय लोकसंख्या शास्त्र संस्थान); शिक्षणाखातीर एकठांय जिल्हा शिक्षण म्हायती येवजण प्लस जिल्हा फॅक्ट-शीट; आनी मातृ मरण दराखातीर नमुनो नोंदणी येवजण, जी राज्य-पातळेवयली आसा. दरेक भलायकी आंकडो एकाच सर्वेक्षण फेरयेतल्यान आयला, देकून जिल्ह्यांची तुलना एकाच पातळेर जाता. जोडप्यांमदलो हिंसाचार फकत राष्ट्रीय कुटुंब भलायकी सर्वेक्षणाच्या राज्य विभागांत जमो केल्लो आसा आनी उत्तर प्रदेशाचो आंकडो म्हूण दाखयला. च्यार क्षण — भुरग्यांची मजूरी, सगळ्यांत गरीब वर्ग, आनी शिशू आनी पांच वर्सां सकयलच्या भुरग्यांचो मरण दर — फुडें परत पडताळणी करपाची गरज आशिल्ल्या नोंदींचेर आदारिल्ले आसात, आनी हें स्पश्ट सांगला. भारतांत शिशू वा पांच वर्सां सकयलच्या भुरग्यांच्या मरण दराची अधिकृत जिल्हावार वळेरी प्रकाशीत जायना. दरेक क्षण आपलो जिल्हो आनी स्रोत सांगता.',
      eyebrow_process:'प्रक्रिया',
      process_head:'जेन्ना समाज काम करता, येवजणां प्रतिसाद दितात.',
      eyebrow_stories:'बदलाच्यो गोष्टी',
      cta_donate:'गुंतवणूक करचें',
      cta_donate_b:'समाज-फुडारी काम भांडवल वा वस्तूंनी, ऑनलायन वा ऑफलायन तेकीद दियात.',
      cta_donate_a:'आतां गुंतवणूक करात',
      cta_vol:'स्वयंसेवक जावचें',
      cta_vol_b:'इंटर्नशीप करात, आभासी रितीन काम करात, वा DEHAT फेलो जावचें.',
      cta_vol_a:'आमकां जोडात',
      cta_partner:'भागीदार जावचें',
      cta_partner_b:'कॉर्पोरेट, शैक्षणीक, वा संस्थात्मक भागीदारी.',
      cta_partner_a:'सहकार्य करात',
      pillar_link_work:'च्यारूय येवजणा पळेयात',
      pillar_link_how:'आमी कशें काम करतात तें पळेयात',
      stories_all:'सगळ्यो गोष्टी वाचात',
      work_title:'हक्क, रोजच्या जिणेंत प्रत्यक्ष.',
      chrono_title:'दरेक प्रकल्प, काळक्रमान',
      count_label:'नोंद केल्ले प्रकल्प',
      open_programme:'येवजण उगडात',
      work_sub:'च्यार येवजणा, त्यो सुरू जाल्ल्या क्रमान. दरेकी आपलें वेगळें पान उगडटा — काम कित्याक आसा, तें कशें बांदिल्लें, आनी ताणें व्हावयल्लो दरेक प्रकल्प, काळक्रमान, दरेकामागचें कितें, खंय, कशें, कधना, कित्याक आनी गुंतवणूक सयत.',
      portfolio_total:'सार्वजनीक नोंदींतले प्रकल्प',
      portfolio_investment:'एकूण सामाजीक गुंतवणूक',
      portfolio_count:'च्यार येवजणांतले प्रकल्प',
      filter_year:'वर्स',
      filter_state:'राज्य',
      filter_district:'जिल्हो',
      filter_sdg:'विकास ध्येय',
      filter_csr:'कॉर्पोरेट सामाजीक जबाबदारी · अनुसूची VII',
      filter_uncrc:'भुरग्यांचो हक्क',
      filter_investor:'सामाजीक गुंतवणूकदार',
      filter_all:'सगळें',
      open_details:'पूर्ण नोंद उगडात',
      close_details:'नोंद बंद करात',
      phases_label:'टप्पे',
      annual_label:'वर्सा-वार',
      cross_from:'हाचोय एक भाग',
      shared_note:'वांटिल्ली सामाजीक गुंतवणूक मर्यादा:',
      d_what:'आमी हाडपाक सोदल्लो बदल',
      d_why:'हांगा हें कित्याक म्हत्वाचें आशिल्लें',
      d_how:'समाज आनी येवजणां एकठांय कशीं वावुरलीं',
      d_impact:'परिणामाचे आंकडे',
      d_investor:'सामाजीक गुंतवणूकदार',
      d_investors:'सामाजीक गुंतवणूकदार',
      d_investment:'सामाजीक गुंतवणूक',
      m_when:'कधना आनी स्थिती',
      m_location:'खंय',
      m_sdg:'विकास ध्येयां',
      m_csr:'कॉर्पोरेट सामाजीक जबाबदारी · अनुसूची VII',
      m_uncrc:'भुरग्यांचे हक्क',
      m_law:'भारतीय कायदो आनी धोरण आदार',
      m_law_none:'ह्या प्रकल्पाखातीर एकूय वैधानीक आदार नोंद केल्लो ना.',
      invest_note:'बरोबर तशेंच प्रसिद्ध जावचें जशें दस्तएवजांत आसा; एकठांय केल्लें ना.',
      impact_eyebrow:'परिणाम',
      impact_title:'2000 वर्सा सावन, समाज आपले हक्क मागतकी आनी तें दिवपाखातीर सरकारी येवजणां सोबत भागीदारींत काम करतकी सांगात दितात.',
      impact_sub:'1989 वर्सा एक युवा गट म्हूण सुरवात, 2000 वर्सा नोंदणी. हे आंकडे व्याप्ती दाखयतात; ह्या फाटल्यान आसा समाज, फिल्ड कार्यकर्ते आनी सरकारी संस्था एकठांय काम करतात.',
      reach_head:'आतां मेरेन भौगोलीक व्याप्ती',
      reach_states:'राज्यां',
      reach_districts:'जिल्हे',
      reach_blocks:'ब्लॉक',
      reach_villages:'गांवां',
      reach_children:'भुरगीं आनी किशोरवयस्क',
      reach_farmers:'बायलां शेतकार',
      stories_eyebrow:'बदलाच्यो गोष्टी',
      stories_title:'वास्तव, उपरांत बदल.',
      stories_sub:'दरेक गोष्ट च्यार भुरग्यांच्या हक्कांतल्या एकाभोंवतणी बांदिल्ली आसा — जियेवप, वाड, राखण, वांटेकरपण.',
      involved_eyebrow:'सामील जावचें',
      involved_title:'आसा तें बळ प्रत्यक्षांत हाडात — आमचे सोबत.',
      involved_sub:'तुमी एक वर, एक कुशळता, वा एक रुपया दियात, तुमी प्रतिसाद दिवपी येवजणेचो एक भाग जातात.',
      involved_cta_title:'समाजा सोबत गुंतवणूक करात.',
      involved_cta_sub:'भांडवल वा वस्तू, ऑनलायन वा ऑफलायन — दरेक रुपया आमी गेल्या उपरांतय समाजान दवरिल्ल्या क्षमतायेंत वता.',
      donate_now:'भागीदारी सुरू करात',
      email_us:'आमकां ईमेल करात',
      f_email:'ईमेल',
      f_phone:'फोन',
      f_web:'वेब',
      f_address:'नामो',
      nav_finance:'पारदर्शकताय',
      nav_answers:'जाबाब',
      fin_eyebrow:'आर्थीक पारदर्शकताय',
      fin_title:'दरेक रुपया, नोंदींत.',
      fin_sub:'स्वतंत्रपणान तपासिल्ले हिशोब — गुंतवणूक भागीदारांनी कितें वचन दिलां, कामाक कितें पावलां, आनी दोनूय फाटल्यान आशिल्ली वैधानीक तपासणी. दरेक आंकडो सयी केल्ल्या ताळेबंदातल्यान आयला.',
      fin_stat_received:'20 वर्सांचेर वचन दिल्लें',
      fin_stat_fcra:'परदेशी देणगी · परदेशी देणगी (नियमन) कायदो',
      fin_stat_inr:'देशी देणगी · भारतीय रुपया',
      fin_stat_funders:'नोंद जाल्ले गुंतवणूक भागीदार',
      fin_years_head:'वर्सा-वार',
      fin_years_sub:'कितें आयलें, कितें खर्च जालें, आनी हिशोबाचेर कोणे सयी केली. एक वर्स निवडात ताच्या सामाजीक गुंतवणूकदारांक पळोवपाक.',
      fin_received:'वचन दिल्लें',
      fin_utilised:'वापरिल्लें',
      fin_auditor:'लेखा-परीक्षक',
      fin_bs:'ताळेबंद',
      fin_surplus:'शिल्लक',
      fin_deficit:'तूट',
      fin_partial:'अर्दे आंकडे',
      fin_compiled:'एकठांय केल्लें',
      fin_funders_head:'ह्या कामांत कोण गुंतवणूक करता',
      fin_funders_sub:'हें काम चलोवपी भांडवल आशिल्ल्यो संस्था आनी व्यक्ती — एकतर्फी दान करपी न्हय, बगर वांटिल्ल्या फळाचे भागीदार. कायद्याप्रमाण परदेशी देणग्यो वेगळ्या परदेशी देणगी (नियमन) कायदो खात्यांत दवरतात आनी तपासतात; देशी निधी रुपया हिशोबांतल्यान चलता.',
      fin_regime_fcra:'परदेशी देणगी (नियमन) कायदो · परदेशी',
      fin_regime_inr:'भारतीय रुपया · देशी',
      fin_funders_cta:'सगळे भागीदार पळेयात',
      fin_compliance_head:'वैधानीक पालन',
      fin_compliance_sub:'DEHAT एक नोंद जाल्ली सोसायटी (सोसायटी नोंदणी कायदो, 1860). सकयल आसा वार्सुक जबाबदारीचें चक्र जें एक परीक्षक पळोवपाक आशेता — आनी जें DEHAT भरता.',
      fin_reg_head:'नोंदणी',
      fin_cal_head:'वार्सुक भरपाचें कॅलेंडर',
      fin_rules_head:'आमी कशाचेर आदारून अहवाल दितात',
      fin_auditor_trail:'दरेक वर्सा वापरांत आशिल्ल्या चार्टर्ड अकाउंटंटान तपासिल्लें आनी विशिश्ट दस्तएवज वळख क्रमांकान सयी केल्लें. फाटल्या धा वर्सांनी पांच वेगवेगळ्या फर्मांनी हिशोब तपासल्यात — एकूय दीर्घकाळाचें नातें ना.',
      fin_due:'देय तारीक',
      fin_year_funders:'ह्या वर्साचे गुंतवणूक भागीदार',
      fin_docs_head:'प्रमाणपत्रां आनी दस्तएवज',
      fin_docs_sub:'दरेक नोंदणी, मंजुरी आनी तिसऱ्या पक्षाची तपासणी — मूळ प्रमाणपत्रांतल्यान स्कॅन केल्लें. स्रोत दस्तएवज वाचपाक खंयचेय एक उगडात.',
      fin_docg_statutory:'नोंदणी आनी कर',
      fin_docg_fcra:'परदेशी देणगी · परदेशी देणगी (नियमन) कायदो',
      fin_docg_validation:'तपासणी आनी वळख',
      fin_doc_view:'दस्तएवज पळेयात',
      fin_pending_label:'तपासिल्लो स्कॅन फायलींत आसा — आंकडे डिजिटल करपाचें काम चालू',
      foot_explore:'सोदून काडात',
      foot_reach:'आमकां संपर्क करात',
      foot_follow:'कामासंगें जोडून रावात',
      foot_desc:'मनीस उदरगती खातीर विकास संघटन — समाज आनी येवजणां सोबत काम करून भुरग्यांचे हक्क वळखिल्ले, मेळिल्ले आनी सांबाळिल्ले उरतले.',
      foot_rights:'© 2026 DEHAT · 1989 वर्सा युवा गट म्हूण सुरवात · 2000 वर्सा नोंदणी',
    };
    const SA = {
foot_policies:'नीतयः रक्षोपायाः च',
      foot_cookies:'कुकी विन्यासाः',
      nav_home:'गृहम्',
      nav_who:'वयं के स्मः',
      nav_work:'अस्माकं कार्यम्',
      nav_impact:'प्रभावः',
      nav_stories:'कथाः',
      nav_media:'माध्यमम्',
      nav_involved:'सहभागी भवत',
      donate:'निवेशं कुरुत',
      since:'1989 वर्षात् प्रभृति',
      org_full:'मानवोन्नयनार्थं विकाससंस्था',
      language:'भाषा',
      lang_indian:'भारतीयभाषाः',
      lang_global:'वैश्विकम् (UN)',
      hero_title_a:'बालककेन्द्रितः समाजः यत्र प्रत्येकः बालकः स्वकीयान् ',
      hero_title_b:'अधिकारान्',
      hero_title_c:' साक्षात्करोति — सुरक्षितः, सम्मानितः, सम्पूर्णः च।',
      hero_sub:'वयं भारत-नेपाल-तराई-क्षेत्रे समुदायैः सह सार्वजनिकतन्त्रैश्च सह कार्यं कुर्मः, यथा बालकानाम् अधिकाराः केवलं लिखिताः न भवेयुः, अपितु दैनन्दिनजीवने ज्ञाताः, प्राप्ताः, रक्षिताश्च भवेयुः।',
      hero_cta1:'समुदायैः सह तिष्ठत',
      hero_cta2:'अस्माकं कार्यपद्धतिं पश्यत',
      hero_photo:'चित्रम् — बालसंसदः नायकाः, लोहरा-ग्रामः, बहराइच',
      hero_principle:'समुदायैः सरकारी-तन्त्रैश्च सह मिलित्वा, प्रत्येकबालकार्थम्।',
      stat_children:'प्राप्ताः बालकाः किशोराश्च',
      stat_invested:'2000 तमात् वर्षात् समुदायतन्त्रेषु निवेशः',
      stat_resources:'प्राप्तानि सार्वजनिकसंसाधनानि',
      stat_districts:'2 राज्ययोः जनपदाः',
      stat_hint:'चत्वारि संख्यानि गोपितानि सन्ति। एकं द्रष्टुं स्पृशत।',
      stat_reveal:'प्रकटनाय स्पृशत',
      stat_hide:'गोपयत',
      stat_reveal_all:'सर्वाणि चत्वारि प्रकटयत',
      stat_hide_all:'सर्वाणि गोपयत',
      grid_reveal_all:'सर्वाणि चतुर्दश प्रकटयत',
      grid_hint:'चतुर्दश संख्यानि गोपितानि सन्ति। एकं द्रष्टुं स्पृशत।',
      bl_drag:'सर्वेक्षणं अग्रे कर्षत',
      vision:'दृष्टिः',
      mission:'ध्येयम्',
      theory:'परिवर्तनसिद्धान्तः',
      vision_body:'बालककेन्द्रितः समाजः यत्र प्रत्येकः बालकः स्वाधिकारान् साक्षात्करोति, सुरक्षितं सम्मानितं पूर्णं च जीवनं यापयति।',
      mission_body:'समुदायैः तन्त्रैश्च सह विद्यमानां शक्तिं साक्षात्कर्तुं कार्यं कर्तुम्, यथा बालकानाम् अधिकाराः दैनन्दिनजीवने ज्ञाताः प्राप्ताः रक्षिताश्च भवेयुः।',
      theory_body:'यदा समुदायाः कार्यं कुर्वन्ति तन्त्राणि च सङ्गत्य प्रतिक्रियां ददति, तदा बालकानां जीवनं विकासः रक्षणं सहभागिता च साक्षात्कृतानि स्थायीनि च भवन्ति।',
      eyebrow_work:'वयं किं कुर्मः',
      work_head:'चत्वारः मोर्चाः, एका सम्मिलिता प्रतिक्रिया।',
      eyebrow_where:'वयं कुत्र कार्यं कुर्मः',
      where_head:'23 जनपदाः। 2 राज्यानि। एका सीमा।',
      where_sub:'वयम् उत्तरप्रदेशस्य पूर्वस्यां भारत-नेपाल-सीमायां महाराष्ट्रे च कार्यं कुर्मः — साझसंरचनात्मकदुर्बलतया बद्धाः प्रदेशाः। भूमिस्थितिं द्रष्टुं जनपदम् एकं स्पृशत।',
      eyebrow_cycle:'संरचनात्मकदुर्बलतायाश्चक्रम्',
      cycle_head:'सङ्कटानि एकाकीनि न आगच्छन्ति।',
      cycle_sub:'तानि पीढी-पीढी परस्परं दृढीकुर्वन्ति — यावत् तन्त्राणि समये प्रतिक्रियां न ददति। न कोऽपि निश्चितः क्रमः अस्ति: कस्यचित् बालकस्य कृते इदं जालं कस्मादपि बिन्दोः आरभेत, प्रत्येकं च सङ्कटम् अग्रिमं सङ्कटं समीपं कर्षति।',
      cycle_pick:'एकं जीवनं कथं निर्मीयते इति द्रष्टुं कमपि क्षणं स्पृशत।',
      cycle_note:'प्रत्येकं संख्या उत्तरप्रदेशस्य भारत-नेपाल-तराई-पट्टिकायाः सप्तसु जनपदेषु — बहराइच, श्रावस्ती, बलरामपुर, लखीमपुर-खेरी, सिद्धार्थनगर, महाराजगञ्ज, कुशीनगर च — अभिलिखितं निकृष्टतमं मूल्यम् अस्ति। स्रोतांसि: स्वास्थ्यपोषणलिङ्गविषयाणां कृते राष्ट्रियकुटुम्बस्वास्थ्यसर्वेक्षणम् 5 (2019–21) जनपदतथ्यपत्रदत्तांशः (स्वास्थ्यकुटुम्बकल्याणमन्त्रालयः / अन्तर्राष्ट्रीयजनसंख्याविज्ञानसंस्थानम् च); शिक्षायाः कृते एकीकृतजनपदशिक्षासूचनाप्रणाली-प्लस् जनपदतथ्यपत्राणि; मातृमृत्युदरस्य कृते च प्रतिदर्शपञ्जीकरणप्रणाली, या राज्यस्तरीया अस्ति। प्रत्येकं स्वास्थ्यसंख्या एकस्मात् एव सर्वेक्षणचक्रात् आगता, अतः जनपदानां तुलना समानाधारेण भवति। दम्पत्योः हिंसा राष्ट्रियकुटुम्बस्वास्थ्यसर्वेक्षणस्य राज्यविभागे एव सङ्गृहीता भवति, अतः उत्तरप्रदेशस्य संख्या इति दर्शिता। चत्वारः क्षणाः — बालश्रमः, दरिद्रतमः धनवर्गः, शिशुमृत्युदरः पञ्चवर्षाधोमृत्युदरश्च — पुनः सत्यापनं प्रतीक्षमाणेषु अभिलेखेषु आधारिताः सन्ति, इति स्पष्टम् उक्तम्। भारतं शिशुमृत्युदरस्य पञ्चवर्षाधोमृत्युदरस्य वा कमपि आधिकारिकं जनपदस्तरीयं शृङ्खलां न प्रकाशयति। प्रत्येकः क्षणः स्वजनपदं स्रोतं च नामयति।',
      eyebrow_process:'प्रक्रिया',
      process_head:'यदा समुदायाः कार्यं कुर्वन्ति, तन्त्राणि प्रतिक्रियां ददति।',
      eyebrow_stories:'परिवर्तनस्य कथाः',
      cta_donate:'निवेशं कुरुत',
      cta_donate_b:'समुदायनेतृत्वयुक्तं कार्यं धनेन सामग्र्या वा, अन्तर्जालेन बहिः वा समर्थयत।',
      cta_donate_a:'अधुना निवेशं कुरुत',
      cta_vol:'स्वयंसेवकत्वम्',
      cta_vol_b:'प्रशिक्षणार्थी भवत, आभासीरूपेण कार्यं कुरुत, अथवा DEHAT-सहचारी (Fellow) भवत।',
      cta_vol_a:'अस्माभिः सह योजयत',
      cta_partner:'सहयोगः',
      cta_partner_b:'वाणिज्यिकाः, शैक्षणिकाः, सांस्थानिकाः वा सहयोगाः।',
      cta_partner_a:'सहकार्यं कुरुत',
      pillar_link_work:'चत्वारः कार्यक्रमाः पश्यत',
      pillar_link_how:'अस्माकं कार्यपद्धतिं पश्यत',
      stories_all:'सर्वाः कथाः पठत',
      work_title:'अधिकाराः, दैनन्दिनजीवने साक्षात्कृताः।',
      chrono_title:'प्रत्येकः प्रकल्पः कालक्रमेण',
      count_label:'अभिलिखिताः प्रकल्पाः',
      open_programme:'कार्यक्रमं उद्घाटयत',
      work_sub:'चत्वारः कार्यक्रमाः, तेषाम् आरम्भक्रमेण। प्रत्येकः स्वकीयं पृष्ठं उद्घाटयति — कार्यं कस्मात् कारणात् विद्यते, कथं निर्मितम्, तेन धृतः प्रत्येकः प्रकल्पः च, कालक्रमेण, प्रत्येकस्य पृष्ठतः किम्, कुत्र, कथम्, कदा, कस्मात् निवेशश्च सहितम्।',
      portfolio_total:'सार्वजनिकाभिलेखे प्रकल्पाः',
      portfolio_investment:'सम्पूर्णः सामाजिकनिवेशः',
      portfolio_count:'चतुर्षु कार्यक्रमेषु प्रकल्पाः',
      filter_year:'वर्षम्',
      filter_state:'राज्यम्',
      filter_district:'जनपदः',
      filter_sdg:'विकासलक्ष्यम्',
      filter_csr:'वाणिज्यिकसामाजिकदायित्वम् · अनुसूची VII',
      filter_uncrc:'बालाधिकारः',
      filter_investor:'सामाजिकनिवेशकः',
      filter_all:'सर्वे',
      open_details:'सम्पूर्णम् अभिलेखं उद्घाटयत',
      close_details:'अभिलेखं पिधत्त',
      phases_label:'चरणानि',
      annual_label:'वर्षानुसारम्',
      cross_from:'अस्यापि भागः',
      shared_note:'साझं सामाजिकनिवेशपरिमाणम्:',
      d_what:'यत् परिवर्तनं कर्तुम् उद्दिष्टम्',
      d_why:'अत्र किमर्थं महत्त्वपूर्णम् आसीत्',
      d_how:'कथं समुदायाः तन्त्राणि च सहकार्यम् अकुर्वन्',
      d_impact:'प्रभावसंख्याः',
      d_investor:'सामाजिकनिवेशकः',
      d_investors:'सामाजिकनिवेशकाः',
      d_investment:'सामाजिकनिवेशः',
      m_when:'कदा स्थितिश्च',
      m_location:'कुत्र',
      m_sdg:'विकासलक्ष्यानि',
      m_csr:'वाणिज्यिकसामाजिकदायित्वम् · अनुसूची VII',
      m_uncrc:'बालकस्य अधिकाराः',
      m_law:'भारतीयविधिनीतिः आधारः',
      m_law_none:'अस्य प्रकल्पस्य कृते एकः अपि विधिसम्मतः आधारः न अभिलिखितः।',
      invest_note:'यथा प्रलिखितं तथैव प्रकाशितम्; न सङ्कलितम्।',
      impact_eyebrow:'प्रभावः',
      impact_title:'2000 तमात् वर्षात्, समुदायान् साहचर्येण यदा ते अधिकारान् याचन्ते सार्वजनिकतन्त्रैः सह भागित्वेन तान् दातुं कार्यं कुर्वन्ति।',
      impact_sub:'1989 तमे वर्षे युवसङ्घरूपेण आरब्धः, 2000 तमे वर्षे पञ्जीकृतः। इमाः संख्याः विस्तारं दर्शयन्ति; तासां तात्पर्यं समुदायाः क्षेत्रकार्यकर्तारः सार्वजनिकसंस्थाश्च सम्मिलितरूपेण कार्यं कुर्वन्ति इति।',
      reach_head:'अद्यावधि भौगोलिकविस्तारः',
      reach_states:'राज्यानि',
      reach_districts:'जनपदाः',
      reach_blocks:'खण्डाः',
      reach_villages:'ग्रामाः',
      reach_children:'बालकाः किशोराश्च',
      reach_farmers:'महिलाकृषकाः',
      stories_eyebrow:'परिवर्तनस्य कथाः',
      stories_title:'यथार्थं, ततः रूपान्तरणम्।',
      stories_sub:'प्रत्येका घटनाकथा चतुर्षु बालाधिकारेषु एकस्य परितः रचिता — जीवनम्, विकासः, रक्षणम्, सहभागिता च।',
      involved_eyebrow:'सहभागी भवत',
      involved_title:'विद्यमानां शक्तिं साक्षात्कुरुत — अस्माभिः सह।',
      involved_sub:'यदि भवन्तः एकां होराम्, एकां कुशलताम्, एकं रूप्यकं वा ददति, तर्हि भवन्तः प्रतिक्रियाशीलस्य तन्त्रस्य भागाः भवन्ति।',
      involved_cta_title:'समुदायैः सह निवेशं कुरुत।',
      involved_cta_sub:'धनं सामग्री वा, अन्तर्जालेन बहिः वा — प्रत्येकं रूप्यकं तस्यां क्षमतायां गच्छति यां समुदायाः वयम् अपगमनात् परम् अपि रक्षन्ति।',
      donate_now:'सहयोगम् आरभत',
      email_us:'अस्मान् विपत्रं प्रेषयत',
      f_email:'विपत्रम्',
      f_phone:'दूरभाषः',
      f_web:'जालपृष्ठम्',
      f_address:'सङ्केतस्थानम्',
      nav_finance:'पारदर्शिता',
      nav_answers:'उत्तराणि',
      fin_eyebrow:'आर्थिकपारदर्शिता',
      fin_title:'प्रत्येकं रूप्यकम्, अभिलेखे।',
      fin_sub:'स्वतन्त्ररूपेण परीक्षिताः लेखाः — निवेशसहयोगिभिः यत् प्रतिज्ञातं, यत् कार्यं प्राप्तं, तयोः पृष्ठतः विधिसम्मताः परीक्षाश्च। प्रत्येका संख्या हस्ताक्षरितात् तुलापत्रात् आगता।',
      fin_stat_received:'20 वर्षेभ्यः अधिकं प्रतिज्ञातम्',
      fin_stat_fcra:'विदेशीयदानम् · विदेशीयदान(नियमन)अधिनियमः',
      fin_stat_inr:'देशीयदानम् · भारतीयरूप्यकम्',
      fin_stat_funders:'अभिलिखिताः निवेशसहयोगिनः',
      fin_years_head:'वर्षानुसारम्',
      fin_years_sub:'किम् आगतम्, किं व्ययितम्, लेखेषु च केन हस्ताक्षरं कृतम्। स्वनिवेशकान् द्रष्टुं वर्षम् एकं चिनुत।',
      fin_received:'प्रतिज्ञातम्',
      fin_utilised:'प्रयुक्तम्',
      fin_auditor:'लेखापरीक्षकः',
      fin_bs:'तुलापत्रम्',
      fin_surplus:'अतिरिक्तम्',
      fin_deficit:'न्यूनता',
      fin_partial:'आंशिकदत्तांशः',
      fin_compiled:'सङ्कलितम्',
      fin_funders_head:'अस्मिन् कार्ये कः निवेशं करोति',
      fin_funders_sub:'याः संस्थाः ये च व्यक्तयः स्वधनेन इदं कार्यं शक्नुवन्ति — साझफलस्य सहयोगिनः, न तु एकपक्षीयाः दातारः। विधिना यथा अपेक्षितं तथा विदेशीयदानानि पृथक् विदेशीयदान(नियमन)अधिनियम-खाते रक्षितानि परीक्षितानि च भवन्ति; देशीयधनं तु रूप्यकलेखैः चलति।',
      fin_regime_fcra:'विदेशीयदान(नियमन)अधिनियमः · विदेशीयम्',
      fin_regime_inr:'भारतीयरूप्यकम् · देशीयम्',
      fin_funders_cta:'सर्वान् सहयोगिनः पश्यत',
      fin_compliance_head:'विधिसम्मतपालनम्',
      fin_compliance_sub:'DEHAT इति पञ्जीकृता सोसायटी (समाजपञ्जीकरणाधिनियमः, 1860)। अधः वार्षिकं उत्तरदायित्वचक्रं दत्तम् अस्ति यत् परीक्षकः द्रष्टुम् अपेक्षते — तथा च यत् DEHAT प्रस्तौति।',
      fin_reg_head:'पञ्जीकरणानि',
      fin_cal_head:'वार्षिकप्रस्तुतिपञ्जिका',
      fin_rules_head:'वयं यस्य आधारेण प्रतिवेदयामः',
      fin_auditor_trail:'प्रतिवर्षं व्यवसायरतेन सनदीलेखापालेन (Chartered Accountant) परीक्षितम्, विशिष्टदस्तावेजपरिचयाङ्केन (Unique Document Identification Number) सहितं हस्ताक्षरितं च। गतदशके पञ्च भिन्नाः संस्थाः लेखान् परीक्षितवत्यः — न कापि एका दीर्घकालीना सम्बद्धता।',
      fin_due:'देयतिथिः',
      fin_year_funders:'अस्मिन् वर्षे निवेशसहयोगिनः',
      fin_docs_head:'प्रमाणपत्राणि दस्तावेजाश्च',
      fin_docs_sub:'प्रत्येकं पञ्जीकरणम्, अनुमोदनं, तृतीयपक्षसत्यापनं च — मूलप्रमाणपत्रात् प्रतिलिखितम् (scan)। स्रोतदस्तावेजं पठितुं कमपि उद्घाटयत।',
      fin_docg_statutory:'पञ्जीकरणं करश्च',
      fin_docg_fcra:'विदेशीयदानम् · विदेशीयदान(नियमन)अधिनियमः',
      fin_docg_validation:'सत्यापनानि मान्यताश्च',
      fin_doc_view:'दस्तावेजं पश्यत',
      fin_pending_label:'परीक्षितं प्रतिलिपिचित्रं सञ्चिकायाम् अस्ति — संख्याः अङ्कीकरणाधीनाः सन्ति',
      foot_explore:'अन्वेषयत',
      foot_reach:'अस्मान् सम्पर्कयत',
      foot_follow:'कार्यम् अनुसरत',
      foot_desc:'मानवोन्नयनार्थं विकाससंस्था — समुदायैः तन्त्रैः च सह कार्यं कुर्वती यथा बालकानाम् अधिकाराः ज्ञाताः प्राप्ताः रक्षिताश्च भवेयुः।',
      foot_rights:'© 2026 DEHAT · 1989 तमे वर्षे युवसङ्घरूपेण आरब्धः · 2000 तमे वर्षे पञ्जीकृतः',
    };
    const SD = {
foot_policies:'پاليسيون ۽ حفاظتي طريقا', foot_cookies:'ڪوڪي سيٽنگون',
  nav_home:'گھر', nav_who:'اسين ڪير آهيون', nav_work:'اسان جو ڪم', nav_impact:'اثر', nav_stories:'ڪهاڻيون', nav_media:'ميڊيا', nav_involved:'شامل ٿيو',
  donate:'سيڙپ ڪريو', since:'1989ع کان', org_full:'انساني ترقيءَ لاءِ ترقياتي ايسوسيئيشن',
  language:'ٻولي', lang_indian:'ڀارتي ٻوليون', lang_global:'عالمي (گڏيل قومون)',
  hero_title_a:'اهڙو ٻارن تي مرڪوز سماج جتي هر ٻار پنهنجا ', hero_title_b:'حق', hero_title_c:' حاصل ڪري — محفوظ، وقار سان ڀريل ۽ مڪمل.',
  hero_sub:'اسين هندستان-نيپال تراءِ سان گڏ ڪميونٽين ۽ سرڪاري نظامن سان گڏجي ڪم ڪريون ٿا، ته جيئن ٻارن جا حق فقط لکيل نه رهن، پر روزمرهه جي زندگيءَ ۾ سڃاتا وڃن، حاصل ٿين ۽ برقرار رکيا وڃن.',
  hero_cta1:'ڪميونٽين سان بيهو', hero_cta2:'ڏسو اسين ڪيئن ڪم ڪريون ٿا', hero_photo:'فوٽو — ٻارن جي پارليامينٽ جا اڳواڻ، لوهرا ڳوٺ، بهرائچ',
  hero_principle:'برادرين ۽ حڪومتي نظامن سان گڏ، هر ٻار لاءِ.',
  stat_children:'پهتل ٻار ۽ نوجوان', stat_invested:'2000ع کان ڪميونٽي نظامن ۾ سيڙپڪاري', stat_resources:'حاصل ٿيل سرڪاري وسيلا', stat_districts:'2 رياستن جا ضلعا',
  stat_hint:'چار انگ، لڪايل. هڪ کي ڏسڻ لاءِ ٽيپ ڪريو.', stat_reveal:'ڏسڻ لاءِ ٽيپ ڪريو', stat_hide:'لڪايو', stat_reveal_all:'سڀ چار ڏيکاريو', stat_hide_all:'سڀ لڪايو', grid_reveal_all:'سڀ چوڏهن ڏيکاريو', grid_hint:'چوڏهن انگ، لڪايل. هڪ کي ڏسڻ لاءِ ٽيپ ڪريو.', bl_drag:'سروي کي اڳتي ڇڪيو',
  vision:'بصيرت', mission:'مشن', theory:'تبديليءَ جو نظريو',
  vision_body:'اهڙو ٻارن تي مرڪوز سماج جتي هر ٻار پنهنجا حق حاصل ڪري ۽ هڪ محفوظ، وقار سان ڀريل ۽ مڪمل زندگي گذاري.',
  mission_body:'ڪميونٽين ۽ نظامن سان گڏجي موجود طاقت کي حقيقت ۾ آڻڻ، ته جيئن ٻارن جا حق روزمرهه جي زندگيءَ ۾ سڃاتا وڃن، حاصل ٿين ۽ برقرار رکيا وڃن.',
  theory_body:'جڏهن ڪميونٽيون عمل ڪن ٿيون ۽ نظام گڏيل طور جواب ڏين ٿا، تڏهن ٻارن جي بقا، واڌ ويجهه، تحفظ ۽ شموليت حاصل ٿئي ٿي ۽ برقرار رهي ٿي.',
  eyebrow_work:'اسين ڇا ڪريون ٿا', work_head:'چار محاذ، هڪ گڏيل جواب.',
  eyebrow_where:'اسين ڪٿي ڪم ڪريون ٿا', where_head:'23 ضلعا. 2 رياستون. هڪ سرحد.',
  where_sub:'اسين اتر پرديش ۽ مهاراشٽرا ۾، هندستان-نيپال جي اوڀر واري سرحد سان گڏ ڪم ڪريون ٿا — اهي علائقا جيڪي ساڳي ساختياتي ڪمزوري سان جڙيل آهن. ڪنهن ضلعي تي ٽيپ ڪري زمين جي حقيقت ڏسو.',
  eyebrow_cycle:'ساختياتي ڪمزوريءَ جو چڪر', cycle_head:'خطرا اڪيلي نه ٿا اچن.',
  cycle_sub:'اهي نسل در نسل هڪ ٻئي کي مضبوط ڪن ٿا — جيستائين نظام وقت تي جواب نه ڏين. ڪو مقرر ترتيب ناهي: ڪنهن به ٻار لاءِ، هي ڦاسي ڪنهن به نقطي کان شروع ٿي سگهي ٿي، ۽ هر خطرو ايندڙ کي وڌيڪ ويجهو ڇڪي ٿو.',
  cycle_pick:'ڏسو ته ڪيئن هڪ زندگي جو نقشو ٺهي ٿو — ڪنهن به لمحي تي ٽيپ ڪريو.',
  cycle_note:'هر انگ اتر پرديش جي هندستان-نيپال تراءِ پٽيءَ جي ست ضلعن — بهرائچ، شراوستي، بلرامپور، لکيم پور کيري، سدھارٿ نگر، مهاراج گنج ۽ ڪشي نگر — ۾ داخل ٿيل سڀ کان خراب رڪارڊ ٿيل قدر آهي. ذريعا: صحت، غذائيت ۽ صنف لاءِ نيشنل فيمِلي هيلٿ سروي 5 (2019–21) جو ضلعي حقيقت شيٽ ڊيٽا سيٽ (وزارتِ صحت ۽ خانداني ڀلائي / انٽرنيشنل انسٽيٽيوٽ آف پاپوليشن سائنسز)؛ تعليم لاءِ يونيفائيڊ ڊسٽرڪٽ انفارميشن سسٽم فار ايجوڪيشن پلس (يوڊائيس اي پلس) جون ضلعي حقيقت شيٽون؛ ۽ زچگي موت جي شرح لاءِ سيمپل رجسٽريشن سسٽم، جيڪو رياستي سطح تي آهي. هر صحت جو انگ هڪ ئي سروي دور مان ورتل آهي، تنهنڪري ضلعن جو مقابلو برابر بنياد تي آهي. شادي شده تشدد فقط نيشنل فيمِلي هيلٿ سروي جي رياستي ماڊيول ۾ گڏ ڪيو ويندو آهي ۽ اتر پرديش جي انگ طور ڏيکاريل آهي. چار لمحا — ٻارن جي مزدوري، سڀ کان غريب مالي درجو، ۽ ٻارڙن ۽ پنج سالن کان هيٺ موت جي شرح — اهڙن رڪارڊن تي بيٺل آهن جيڪي اڃا تصديق جي منتظر آهن، ۽ ائين ئي ظاهر ڪيا ويا آهن. هندستان ٻارڙن يا پنج سالن کان هيٺ موت جي شرح لاءِ ڪا به سرڪاري ضلعي سيريز شايع نه ٿو ڪري. هر لمحو پنهنجو ضلعو ۽ ذريعو ٻڌائي ٿو.',
  eyebrow_process:'عمل جو طريقو', process_head:'جڏهن ڪميونٽيون عمل ڪن ٿيون، نظام جواب ڏين ٿا.', eyebrow_stories:'تبديليءَ جون ڪهاڻيون',
  cta_donate:'سيڙپ ڪريو', cta_donate_b:'ڪميونٽيءَ جي اڳواڻيءَ ۾ ٿيندڙ ڪم کي پئسي يا سامان سان، آن لائين يا آف لائين مدد ڏيو.', cta_donate_a:'هاڻي سيڙپ ڪريو',
  cta_vol:'رضاڪار ٿيو', cta_vol_b:'انٽرن ٿيو، آن لائين ڪم ڪريو، يا DEHAT فيلو بڻجو.', cta_vol_a:'اسان سان شامل ٿيو',
  cta_partner:'ڀائيوار ٿيو', cta_partner_b:'ڪارپوريٽ، تعليمي، يا ادارتي ڀائيواري.', cta_partner_a:'تعاون ڪريو',
  pillar_link_work:'چاروئي پروگرام ڏسو', pillar_link_how:'ڏسو اسين ڪيئن ڪم ڪريون ٿا', stories_all:'سموريون ڪهاڻيون پڙهو',
  work_title:'حق، روزمرهه جي زندگيءَ ۾ حاصل ٿيل.',
  chrono_title:'هر منصوبو، تاريخي ترتيب ۾',
  count_label:'رڪارڊ تي موجود منصوبا',
  open_programme:'پروگرام کوليو',
  work_sub:'چار پروگرام، انهن جي شروعات جي ترتيب ۾. هر هڪ پنهنجي صفحي ۾ کلي ٿو — ڇو هي ڪم موجود آهي، اهو ڪيئن ٺهيل آهي، ۽ ان جا سمورا منصوبا، تاريخي ترتيب ۾، هر هڪ جي پويان ڪهڙو، ڪٿي، ڪيئن، ڪڏهن، ڇو ۽ سيڙپڪاري سميت.',
  portfolio_total:'عوامي رڪارڊ تي موجود منصوبا', portfolio_investment:'مجموعي سماجي سيڙپڪاري',
  portfolio_count:'چئن پروگرامن ۾ منصوبا',
  filter_year:'سال', filter_state:'رياست', filter_district:'ضلعو', filter_sdg:'ترقياتي مقصد', filter_csr:'ڪارپوريٽ سماجي ذميواري · شيڊول VII', filter_uncrc:'ٻارن جو حق', filter_investor:'سماجي سيڙپڪار', filter_all:'سڀ',
  open_details:'مڪمل رڪارڊ کوليو', close_details:'رڪارڊ بند ڪريو', phases_label:'مرحلا',
  annual_label:'سال بسال',
  cross_from:'هن جو به حصو',
  shared_note:'گڏيل سماجي سيڙپڪاري جو دائرو:',
  d_what:'اها تبديلي جيڪا اسان آڻڻ جو ارادو رکيو', d_why:'هتي اها ڇو اهم هئي',
  d_how:'ڪميونٽيون ۽ نظام گڏجي ڪيئن ڪم ڪيو', d_impact:'اثر جا انگ',
  d_investor:'سماجي سيڙپڪار', d_investors:'سماجي سيڙپڪار', d_investment:'سماجي سيڙپڪاري',
  m_when:'ڪڏهن ۽ حالت', m_location:'ڪٿي', m_sdg:'ترقياتي مقصد', m_csr:'ڪارپوريٽ سماجي ذميواري · شيڊول VII', m_uncrc:'ٻار جا حق', m_law:'ڀارتي قانون ۽ پاليسي بنياد', m_law_none:'هن منصوبي لاءِ ڪو به واحد قانوني بنياد رڪارڊ ٿيل ناهي.',
  invest_note:'بلڪل جيئن دستاويز ٿيل آهي، تيئن شايع ٿيل؛ گڏ ناهي ڪيل.',
  impact_eyebrow:'اثر', impact_title:'2000ع کان، ڪميونٽين سان گڏ رهي جيئن اهي پنهنجا حق گھرن ٿا ۽ عوامي نظامن سان ڀائيواري ۾ انهن کي پورا ڪرڻ لاءِ ڪم ڪن ٿا.',
  impact_sub:'1989ع ۾ نوجوانن جي هڪ گروهه طور شروعات ٿي، 2000ع ۾ رجسٽرڊ ٿي. هي انگ پيمانو ڏيکارين ٿا؛ انهن جي پويان ڪميونٽيون، فيلڊ ورڪر ۽ عوامي ادارا گڏجي ڪم ڪن ٿا.',
  reach_head:'هاڻوڪو جاگرافيائي پهچ', reach_states:'رياستون', reach_districts:'ضلعا', reach_blocks:'بلاڪ', reach_villages:'ڳوٺ', reach_children:'ٻار ۽ نوجوان', reach_farmers:'عورت هاري',
  stories_eyebrow:'تبديليءَ جون ڪهاڻيون', stories_title:'حقيقت، پوءِ تبديلي.',
  stories_sub:'هر ڪيس ڪهاڻي چئن ٻارن جي حقن — بقا، واڌ ويجهه، تحفظ، شموليت — مان هڪ جي چوڌاري ترتيب ڏنل آهي.',
  involved_eyebrow:'شامل ٿيو', involved_title:'موجود طاقت کي حاصل ڪريو — اسان سان گڏ.',
  involved_sub:'توهان هڪ ڪلاڪ ڏيو، هڪ هنر يا هڪ رپيو، توهان ان نظام جو حصو بڻجي ويندؤ جيڪو جواب ڏئي ٿو.',
  involved_cta_title:'ڪميونٽين سان گڏ سيڙپ ڪريو.',
  involved_cta_sub:'پئسو يا سامان، آن لائين يا آف لائين — هر رپيو ان صلاحيت ۾ وڃي ٿو جيڪا ڪميونٽيون اسان جي وڃڻ کان پوءِ به رکن ٿيون.',
  donate_now:'ڀائيواري شروع ڪريو', email_us:'اسان کي اي ميل ڪريو', f_email:'اي ميل', f_phone:'فون', f_web:'ويب', f_address:'پتو',
  nav_finance:'شفافيت', nav_answers:'جواب',
  fin_eyebrow:'مالي شفافيت', fin_title:'هر رپيو، رڪارڊ تي.',
  fin_sub:'آزاد طور آڊٽ ٿيل حساب — سيڙپڪار ڀائيوارن جيڪو واعدو ڪيو، جيڪو ڪم تائين پهتو، ۽ ٻنهي جي پويان قانوني جانچون. هر انگ هڪ صحي ٿيل بيلنس شيٽ مان ورتل آهي.',
  fin_stat_received:'20 سالن ۾ واعدو ٿيل', fin_stat_fcra:'پرڏيهي چندو · فارين ڪنٽريبيوشن (ريگيوليشن) ائڪٽ', fin_stat_inr:'گھريلو چندو · ڀارتي رپيا', fin_stat_funders:'رڪارڊ تي سيڙپڪار ڀائيوار',
  fin_years_head:'سال بسال', fin_years_sub:'ڇا آيو، ڇا خرچ ٿيو، ۽ حسابن تي ڪنهن صحي ڪئي. ڪنهن سال جا سيڙپڪار ڏسڻ لاءِ سال چونڊيو.',
  fin_received:'واعدو ٿيل', fin_utilised:'خرچ ٿيل', fin_auditor:'آڊيٽر', fin_bs:'بيلنس شيٽ', fin_surplus:'اضافو', fin_deficit:'گھٽتائي', fin_partial:'اڌوري معلومات', fin_compiled:'مرتب ٿيل',
  fin_funders_head:'هن ڪم ۾ ڪير سيڙپ ڪري ٿو', fin_funders_sub:'اهي ادارا ۽ ماڻهو جن جي پئسي هن ڪم کي طاقت ڏني آهي — گڏيل نتيجي ۾ ڀائيوار، نه ته هڪ طرفي ڏيندڙ. پرڏيهي چندو قانون جي گھرج مطابق هڪ الڳ فارين ڪنٽريبيوشن (ريگيوليشن) ائڪٽ کاتي ۾ رکيو ۽ آڊٽ ڪيو وڃي ٿو؛ گھريلو فنڊ رپيه حسابن مان هلن ٿا.',
  fin_regime_fcra:'فارين ڪنٽريبيوشن (ريگيوليشن) ائڪٽ · پرڏيهي', fin_regime_inr:'ڀارتي رپيو · گھريلو',
  fin_funders_cta:'سمورا ڀائيوار ڏسو',
  fin_compliance_head:'قانوني تعميل', fin_compliance_sub:'DEHAT هڪ رجسٽرڊ سوسائٽي آهي (سوسائٽيز رجسٽريشن ائڪٽ، 1860). هيٺ اهو سالياني جوابداري وارو چڪر آهي جيڪو هڪ جائزو وٺندڙ ڏسڻ جي اميد رکي ٿو — ۽ جيڪو DEHAT داخل ڪري ٿو.',
  fin_reg_head:'رجسٽريشنون', fin_cal_head:'سالياني فائلنگ ڪئلينڊر', fin_rules_head:'اسين ڪهڙن اصولن آڏو رپورٽ ڪريون ٿا',
  fin_auditor_trail:'هر سال هڪ پريڪٽسنگ چارٽرڊ اڪائونٽنٽ پاران آڊٽ ٿيل ۽ يونيڪ ڊاڪيومينٽ آئيڊينٽيفڪيشن نمبر سان صحي ٿيل. گذريل ڏهاڪي ۾ پنج مختلف فرمن حسابن جي جانچ ڪئي آهي — ڪو به هڪ ڊگهي مدي وارو تعلق ناهي.',
  fin_due:'مقرر تاريخ', fin_year_funders:'هن سال جا سيڙپڪار ڀائيوار',
  fin_docs_head:'سرٽيفڪيٽ ۽ دستاويز', fin_docs_sub:'هر رجسٽريشن، منظوري ۽ ٽئين پاسي جي تصديق — اصل سرٽيفڪيٽ مان اسڪين ٿيل. ذريعو دستاويز پڙهڻ لاءِ ڪو به کوليو.',
  fin_docg_statutory:'رجسٽريشن ۽ ٽيڪس', fin_docg_fcra:'پرڏيهي چندو · فارين ڪنٽريبيوشن (ريگيوليشن) ائڪٽ', fin_docg_validation:'تصديقون ۽ سڃاڻپون',
  fin_doc_view:'دستاويز ڏسو', fin_pending_label:'آڊٽ ٿيل اسڪين فائل تي موجود — انگ ڊجيٽل ٿي رهيا آهن',
  foot_explore:'ڳوليو', foot_reach:'اسان سان رابطو ڪريو', foot_follow:'ڪم سان جڙيل رهو',
  foot_desc:'انساني ترقيءَ لاءِ ترقياتي ايسوسيئيشن — ڪميونٽين ۽ نظامن سان گڏ ڪم ته جيئن ٻارن جا حق سڃاتا وڃن، حاصل ٿين ۽ برقرار رکيا وڃن.',
  foot_rights:'© 2026 DEHAT · 1989ع ۾ نوجوانن جي گروهه طور شروعات · 2000ع ۾ رجسٽرڊ',
    };
    const OR = {
foot_policies:'ନୀତି ଓ ସୁରକ୍ଷା ବ୍ୟବସ୍ଥା', foot_cookies:'କୁକି ସେଟିଂସ',
  nav_home:'ଘର', nav_who:'ଆମେ କିଏ', nav_work:'ଆମର କାର୍ଯ୍ୟ', nav_impact:'ପ୍ରଭାବ', nav_stories:'କାହାଣୀ', nav_media:'ମିଡିଆ', nav_involved:'ଯୋଡ଼ି ହୁଅନ୍ତୁ',
  donate:'ନିବେଶ କରନ୍ତୁ', since:'1989 ଠାରୁ', org_full:'ମାନବ ଉନ୍ନତି ପାଇଁ ବିକାଶମୂଳକ ସଂଘ',
  language:'ଭାଷା', lang_indian:'ଭାରତୀୟ ଭାଷାସମୂହ', lang_global:'ଅନ୍ତର୍ଜାତୀୟ (ଜାତିସଂଘ)',
  hero_title_a:'ଏକ ଶିଶୁ-କେନ୍ଦ୍ରିତ ସମାଜ ଯେଉଁଠାରେ ପ୍ରତ୍ୟେକ ଶିଶୁ ନିଜର ', hero_title_b:'ଅଧିକାର', hero_title_c:' ପାଆନ୍ତି — ସୁରକ୍ଷିତ, ଗୌରବାନ୍ୱିତ ଏବଂ ସମ୍ପୂର୍ଣ୍ଣ।',
  hero_sub:'ଆମେ ଭାରତ-ନେପାଳ ତରାଇ ଅଞ୍ଚଳରେ ସମ୍ପ୍ରଦାୟ ଓ ସରକାରୀ ବ୍ୟବସ୍ଥା ସହ କାର୍ଯ୍ୟ କରୁ, ଯେପରି ଶିଶୁମାନଙ୍କର ଅଧିକାର କେବଳ ଲେଖାରେ ସୀମିତ ନ ରହି, ପ୍ରତିଦିନର ଜୀବନରେ ସ୍ୱୀକୃତ, ପ୍ରାପ୍ତ ଏବଂ ସୁରକ୍ଷିତ ହୁଏ।',
  hero_cta1:'ସମ୍ପ୍ରଦାୟ ସହ ଠିଆ ହୁଅନ୍ତୁ', hero_cta2:'ଆମେ କିପରି କାର୍ଯ୍ୟ କରୁ ଦେଖନ୍ତୁ', hero_photo:'ଫଟୋ — ଶିଶୁ ସଂସଦ ନେତା, ଲୋହରା ଗ୍ରାମ, ବହରାଇଚ',
  hero_principle:'ସମ୍ପ୍ରଦାୟ ଏବଂ ସରକାରୀ ବ୍ୟବସ୍ଥା ସହିତ ମିଳିତ ହୋଇ, ପ୍ରତ୍ୟେକ ଶିଶୁ ପାଇଁ।',
  stat_children:'ପହଞ୍ଚିଥିବା ଶିଶୁ ଓ କିଶୋର', stat_invested:'2000 ଠାରୁ ସାମୁଦାୟିକ ବ୍ୟବସ୍ଥାରେ ନିବେଶ', stat_resources:'ପ୍ରାପ୍ତ ସରକାରୀ ସମ୍ବଳ', stat_districts:'2 ରାଜ୍ୟର ଜିଲ୍ଲା',
  stat_hint:'ଚାରି ସଂଖ୍ୟା, ଲୁକ୍କାୟିତ। ଦେଖିବାକୁ ଗୋଟିଏ ଉପରେ ଟାପ୍ କରନ୍ତୁ।', stat_reveal:'ଦେଖିବାକୁ ଟାପ୍ କରନ୍ତୁ', stat_hide:'ଲୁଚାନ୍ତୁ', stat_reveal_all:'ସବୁ ଚାରି ଦେଖାନ୍ତୁ', stat_hide_all:'ସବୁ ଲୁଚାନ୍ତୁ', grid_reveal_all:'ସବୁ ଚଉଦ ଦେଖାନ୍ତୁ', grid_hint:'ଚଉଦ ସଂଖ୍ୟା, ଲୁକ୍କାୟିତ। ଦେଖିବାକୁ ଗୋଟିଏ ଉପରେ ଟାପ୍ କରନ୍ତୁ।', bl_drag:'ସର୍ଭେକୁ ଆଗକୁ ଟାଣନ୍ତୁ',
  vision:'ଦୃଷ୍ଟିଭଙ୍ଗୀ', mission:'ଲକ୍ଷ୍ୟ', theory:'ପରିବର୍ତ୍ତନର ସିଦ୍ଧାନ୍ତ',
  vision_body:'ଏକ ଶିଶୁ-କେନ୍ଦ୍ରିତ ସମାଜ ଯେଉଁଠାରେ ପ୍ରତ୍ୟେକ ଶିଶୁ ନିଜର ଅଧିକାର ପାଆନ୍ତି ଏବଂ ଏକ ସୁରକ୍ଷିତ, ଗୌରବାନ୍ୱିତ ଓ ପୂର୍ଣ୍ଣ ଜୀବନ ଯାପନ କରନ୍ତି।',
  mission_body:'ସମ୍ପ୍ରଦାୟ ଓ ବ୍ୟବସ୍ଥା ସହ ମିଶି ମୌଜୁଦ ଶକ୍ତିକୁ ସାକାର କରିବା, ଯେପରି ଶିଶୁମାନଙ୍କର ଅଧିକାର ପ୍ରତିଦିନର ଜୀବନରେ ସ୍ୱୀକୃତ, ପ୍ରାପ୍ତ ଏବଂ ସୁରକ୍ଷିତ ହୁଏ।',
  theory_body:'ଯେତେବେଳେ ସମ୍ପ୍ରଦାୟ କାର୍ଯ୍ୟ କରନ୍ତି ଏବଂ ବ୍ୟବସ୍ଥା ମିଳିତ ଭାବେ ପ୍ରତିକ୍ରିୟା ଦିଅନ୍ତି, ସେତେବେଳେ ଶିଶୁମାନଙ୍କର ବଞ୍ଚିବା, ବିକାଶ, ସୁରକ୍ଷା ଏବଂ ସହଭାଗିତା ସାକାର ଓ ସ୍ଥାୟୀ ହୁଏ।',
  eyebrow_work:'ଆମେ କଣ କରୁ', work_head:'ଚାରି ମୋର୍ଚ୍ଚା, ଏକ ମିଳିତ ପ୍ରତିକ୍ରିୟା।',
  eyebrow_where:'ଆମେ କେଉଁଠି କାର୍ଯ୍ୟ କରୁ', where_head:'23 ଜିଲ୍ଲା। 2 ରାଜ୍ୟ। ଏକ ସୀମା।',
  where_sub:'ଆମେ ଉତ୍ତର ପ୍ରଦେଶ ଓ ମହାରାଷ୍ଟ୍ରର ପୂର୍ବ ଭାରତ-ନେପାଳ ସୀମା ଅଞ୍ଚଳରେ କାର୍ଯ୍ୟ କରୁ — ଏହି ଅଞ୍ଚଳଗୁଡ଼ିକ ଏକ ସମାନ ସାଂରଚନାତ୍ମକ ଅସୁରକ୍ଷା ଦ୍ୱାରା ବନ୍ଧା। ଜମିନ ପାହ୍ୟା ଦେଖିବାକୁ ଏକ ଜିଲ୍ଲା ଉପରେ ଟାପ୍ କରନ୍ତୁ।',
  eyebrow_cycle:'ସାଂରଚନାତ୍ମକ ଅସୁରକ୍ଷାର ଚକ୍ର', cycle_head:'ବିପଦ ଏକୁଟିଆ ଆସନ୍ତି ନାହିଁ।',
  cycle_sub:'ସେମାନେ ପିଢ଼ି ପରେ ପିଢ଼ି ପରସ୍ପରକୁ ଦୃଢ଼ କରନ୍ତି — ଯେ ପର୍ଯ୍ୟନ୍ତ ବ୍ୟବସ୍ଥା ସମୟରେ ପ୍ରତିକ୍ରିୟା ନ ଦିଏ। କୌଣସି ନିର୍ଦ୍ଦିଷ୍ଟ କ୍ରମ ନାହିଁ: ଯେକୌଣସି ଶିଶୁ ପାଇଁ, ଏହି ଫାନ୍ଦ ଯେକୌଣସି ବିନ୍ଦୁରୁ ଆରମ୍ଭ ହୋଇପାରେ, ଏବଂ ପ୍ରତ୍ୟେକ ବିପଦ ପରବର୍ତ୍ତୀକୁ ଅଧିକ ନିକଟତର ଟାଣିଥାଏ।',
  cycle_pick:'ଏକ ଜୀବନ କିପରି ଗଢ଼ାଯାଏ ତାହା ଦେଖିବାକୁ ଯେକୌଣସି କ୍ଷଣ ଉପରେ ଟାପ୍ କରନ୍ତୁ।',
  cycle_note:'ପ୍ରତ୍ୟେକ ସଂଖ୍ୟା ଉତ୍ତର ପ୍ରଦେଶର ଭାରତ-ନେପାଳ ତରାଇ ପଟି ଅନ୍ତର୍ଗତ ସାତ ଜିଲ୍ଲା — ବହରାଇଚ, ଶ୍ରାବସ୍ତୀ, ବଲରାମପୁର, ଲଖିମପୁର ଖେରୀ, ସିଦ୍ଧାର୍ଥନଗର, ମହାରାଜଗଞ୍ଜ ଏବଂ କୁଶୀନଗର — ମଧ୍ୟରେ ଦର୍ଜ ହୋଇଥିବା ସବୁଠାରୁ ଖରାପ ମୂଲ୍ୟ ଦର୍ଶାଏ। ଉତ୍ସ: ସ୍ୱାସ୍ଥ୍ୟ, ପୋଷଣ ଓ ଲିଙ୍ଗ ପାଇଁ ଜାତୀୟ ପରିବାର ସ୍ୱାସ୍ଥ୍ୟ ସର୍ବେକ୍ଷଣ 5 (2019–21) ଜିଲ୍ଲା ତଥ୍ୟ-ପତ୍ର ତଥ୍ୟସେଟ୍ (ସ୍ୱାସ୍ଥ୍ୟ ଓ ପରିବାର କଲ୍ୟାଣ ମନ୍ତ୍ରଣାଳୟ / ଅନ୍ତର୍ଜାତୀୟ ଜନସଂଖ୍ୟା ବିଜ୍ଞାନ ପ୍ରତିଷ୍ଠାନ); ଶିକ୍ଷା ପାଇଁ ୟୁନିଫାଏଡ୍ ଡିଷ୍ଟ୍ରିକ୍ଟ ଇନଫର୍ମେସନ ସିଷ୍ଟମ ଫର ଏଜୁକେସନ ପ୍ଲସ (ୟୁଡାଇସ୍ + ) ଜିଲ୍ଲା ତଥ୍ୟ-ପତ୍ର; ଏବଂ ମାତୃ ମୃତ୍ୟୁହାର ପାଇଁ ନମୁନା ପଞ୍ଜୀକରଣ ପ୍ରଣାଳୀ, ଯାହା ରାଜ୍ୟ ସ୍ତରୀୟ। ପ୍ରତ୍ୟେକ ସ୍ୱାସ୍ଥ୍ୟ ସଂଖ୍ୟା ଏକମାତ୍ର ସର୍ବେକ୍ଷଣ ପର୍ଯ୍ୟାୟରୁ ନିଆଯାଇଛି, ଯାହା ଫଳରେ ଜିଲ୍ଲାଗୁଡ଼ିକ ସମାନ ଆଧାରରେ ତୁଳନା ହୋଇପାରେ। ପତି-ପତ୍ନୀ ହିଂସା କେବଳ ଜାତୀୟ ପରିବାର ସ୍ୱାସ୍ଥ୍ୟ ସର୍ବେକ୍ଷଣର ରାଜ୍ୟ ମଡ୍ୟୁଲରେ ସଂଗୃହୀତ ହୁଏ ଏବଂ ଉତ୍ତର ପ୍ରଦେଶ ସଂଖ୍ୟା ଭାବେ ଦେଖାଯାଇଛି। ଚାରି ମୁହୂର୍ତ୍ତ — ଶିଶୁ ଶ୍ରମ, ସବୁଠାରୁ ଗରିବ ଧନ ବର୍ଗ, ଏବଂ ଶିଶୁ ଓ 5 ବର୍ଷରୁ କମ ମୃତ୍ୟୁହାର — ଏପର୍ଯ୍ୟନ୍ତ ପୁନଃ ସତ୍ୟାପନ ଅପେକ୍ଷାରେ ଥିବା ଅଭିଲେଖ ଉପରେ ଆଧାରିତ, ଏବଂ ଏହା ସ୍ପଷ୍ଟ ଭାବେ କୁହାଯାଇଛି। ଶିଶୁ କିମ୍ବା 5 ବର୍ଷରୁ କମ ମୃତ୍ୟୁହାର ପାଇଁ ଭାରତ କୌଣସି ସରକାରୀ ଜିଲ୍ଲା ଶୃଙ୍ଖଳା ପ୍ରକାଶ କରେ ନାହିଁ। ପ୍ରତ୍ୟେକ ମୁହୂର୍ତ୍ତ ନିଜର ଜିଲ୍ଲା ଓ ଉତ୍ସର ନାମ ଦିଏ।',
  eyebrow_process:'ପ୍ରକ୍ରିୟା', process_head:'ଯେତେବେଳେ ସମ୍ପ୍ରଦାୟ କାର୍ଯ୍ୟ କରନ୍ତି, ବ୍ୟବସ୍ଥା ପ୍ରତିକ୍ରିୟା ଦିଏ।', eyebrow_stories:'ପରିବର୍ତ୍ତନର କାହାଣୀ',
  cta_donate:'ନିବେଶ କରନ୍ତୁ', cta_donate_b:'ସମ୍ପ୍ରଦାୟ-ନେତୃତ୍ୱାଧୀନ କାର୍ଯ୍ୟକୁ ପୁଞ୍ଜି କିମ୍ବା ସାମଗ୍ରୀ ମାଧ୍ୟମରେ, ଅନଲାଇନ୍ କିମ୍ବା ଅଫଲାଇନ୍‌ରେ ସହଯୋଗ କରନ୍ତୁ।', cta_donate_a:'ବର୍ତ୍ତମାନ ନିବେଶ କରନ୍ତୁ',
  cta_vol:'ସ୍ୱେଚ୍ଛାସେବା', cta_vol_b:'ଇଣ୍ଟର୍ନ୍ ହୁଅନ୍ତୁ, ଭର୍ଚୁଆଲ୍ କାର୍ଯ୍ୟ କରନ୍ତୁ, କିମ୍ବା ଏକ DEHAT ଫେଲୋ ହୁଅନ୍ତୁ।', cta_vol_a:'ଆମ ସହ ଯୋଡ଼ି ହୁଅନ୍ତୁ',
  cta_partner:'ସହଭାଗୀ ହୁଅନ୍ତୁ', cta_partner_b:'କର୍ପୋରେଟ୍, ଶିକ୍ଷାନୁଷ୍ଠାନିକ, କିମ୍ବା ପ୍ରାତିଷ୍ଠାନିକ ସହଭାଗିତା।', cta_partner_a:'ସହଯୋଗ କରନ୍ତୁ',
  pillar_link_work:'ଚାରି କାର୍ଯ୍ୟକ୍ରମ ଦେଖନ୍ତୁ', pillar_link_how:'ଆମେ କିପରି କାର୍ଯ୍ୟ କରୁ ଦେଖନ୍ତୁ', stories_all:'ସବୁ କାହାଣୀ ପଢ଼ନ୍ତୁ',
  work_title:'ଅଧିକାର, ପ୍ରତିଦିନର ଜୀବନରେ ସାକାର।',
  chrono_title:'ପ୍ରତ୍ୟେକ ପ୍ରକଳ୍ପ, କାଳକ୍ରମିକ କ୍ରମରେ',
  count_label:'ଅଭିଲେଖରେ ଥିବା ପ୍ରକଳ୍ପ',
  open_programme:'କାର୍ଯ୍ୟକ୍ରମ ଖୋଲନ୍ତୁ',
  work_sub:'ଚାରି କାର୍ଯ୍ୟକ୍ରମ, ସେମାନେ ଆରମ୍ଭ ହୋଇଥିବା କ୍ରମରେ। ପ୍ରତ୍ୟେକଟି ନିଜ ପୃଷ୍ଠାରେ ଖୋଲେ — କାହିଁକି ଏହି କାର୍ଯ୍ୟ ଅଛି, ଏହା କିପରି ଗଢ଼ାଯାଇଛି, ଏବଂ ଏହା ବହନ କରିଥିବା ପ୍ରତ୍ୟେକ ପ୍ରକଳ୍ପ, କାଳକ୍ରମିକ କ୍ରମରେ, ପ୍ରତ୍ୟେକ ପଛରେ କଣ, କେଉଁଠି, କିପରି, କେବେ, କାହିଁକି ଏବଂ ନିବେଶ ସହିତ।',
  portfolio_total:'ସାର୍ବଜନୀନ ଅଭିଲେଖରେ ଥିବା ପ୍ରକଳ୍ପ', portfolio_investment:'ମୋଟ ସାମାଜିକ ନିବେଶ',
  portfolio_count:'ଚାରି କାର୍ଯ୍ୟକ୍ରମରେ ପ୍ରକଳ୍ପ',
  filter_year:'ବର୍ଷ', filter_state:'ରାଜ୍ୟ', filter_district:'ଜିଲ୍ଲା', filter_sdg:'ବିକାଶ ଲକ୍ଷ୍ୟ', filter_csr:'କର୍ପୋରେଟ୍ ସାମାଜିକ ଦାୟିତ୍ୱ · ଅନୁସୂଚୀ VII', filter_uncrc:'ଶିଶୁ ଅଧିକାର', filter_investor:'ସାମାଜିକ ନିବେଶକ', filter_all:'ସମସ୍ତ',
  open_details:'ପୂର୍ଣ୍ଣ ଅଭିଲେଖ ଖୋଲନ୍ତୁ', close_details:'ଅଭିଲେଖ ବନ୍ଦ କରନ୍ତୁ', phases_label:'ପର୍ଯ୍ୟାୟ',
  annual_label:'ବର୍ଷ ଅନୁସାରେ',
  cross_from:'ଏଥିରେ ମଧ୍ୟ ଅନ୍ତର୍ଭୁକ୍ତ',
  shared_note:'ସହଭାଗୀ ସାମାଜିକ ନିବେଶ ପରିସର:',
  d_what:'ଆମେ ଆଣିବାକୁ ଉଦ୍ଦେଶ୍ୟ କରିଥିବା ପରିବର୍ତ୍ତନ', d_why:'ଏଠାରେ ଏହା କାହିଁକି ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ଥିଲା',
  d_how:'ସମ୍ପ୍ରଦାୟ ଓ ବ୍ୟବସ୍ଥା ମିଶି କିପରି କାର୍ଯ୍ୟ କଲେ', d_impact:'ପ୍ରଭାବ ସଂଖ୍ୟା',
  d_investor:'ସାମାଜିକ ନିବେଶକ', d_investors:'ସାମାଜିକ ନିବେଶକମାନେ', d_investment:'ସାମାଜିକ ନିବେଶ',
  m_when:'କେବେ ଏବଂ ସ୍ଥିତି', m_location:'କେଉଁଠି', m_sdg:'ବିକାଶ ଲକ୍ଷ୍ୟ', m_csr:'କର୍ପୋରେଟ୍ ସାମାଜିକ ଦାୟିତ୍ୱ · ଅନୁସୂଚୀ VII', m_uncrc:'ଶିଶୁର ଅଧିକାର', m_law:'ଭାରତୀୟ ଆଇନ ଓ ନୀତି ଆଧାର', m_law_none:'ଏହି ପ୍ରକଳ୍ପ ପାଇଁ କୌଣସି ଏକକ ବିଧାନିକ ଆଧାର ଦର୍ଜ ହୋଇନାହିଁ।',
  invest_note:'ଠିକ୍ ଯେପରି ଦଲିଲିତ, ସେହିପରି ପ୍ରକାଶିତ; ଏକତ୍ରୀକୃତ ନୁହେଁ।',
  impact_eyebrow:'ପ୍ରଭାବ', impact_title:'2000 ଠାରୁ, ସମ୍ପ୍ରଦାୟଙ୍କ ସହ ଚାଲି ଯେତେବେଳେ ସେମାନେ ଅଧିକାର ଦାବି କରନ୍ତି ଏବଂ ସେଗୁଡ଼ିକ ପ୍ରଦାନ କରିବାକୁ ସରକାରୀ ବ୍ୟବସ୍ଥା ସହ ସହଭାଗିତାରେ କାର୍ଯ୍ୟ କରନ୍ତି।',
  impact_sub:'1989ରେ ଏକ ଯୁବ ସମୂହ ଭାବେ ଆରମ୍ଭ ହୋଇ, 2000ରେ ପଞ୍ଜୀକୃତ ହେଲା। ଏହି ସଂଖ୍ୟାଗୁଡ଼ିକ ପରିମାଣ ଦର୍ଶାନ୍ତି; ଏହା ପଛରେ ସମ୍ପ୍ରଦାୟ, କ୍ଷେତ୍ର କର୍ମୀ ଏବଂ ସରକାରୀ ଅନୁଷ୍ଠାନ ମିଳିତ ଭାବେ କାର୍ଯ୍ୟ କରନ୍ତି।',
  reach_head:'ବର୍ତ୍ତମାନ ପର୍ଯ୍ୟନ୍ତ ଭୌଗୋଳିକ ପରିସର', reach_states:'ରାଜ୍ୟ', reach_districts:'ଜିଲ୍ଲା', reach_blocks:'ବ୍ଲକ', reach_villages:'ଗ୍ରାମ', reach_children:'ଶିଶୁ ଓ କିଶୋର', reach_farmers:'ମହିଳା କୃଷକ',
  stories_eyebrow:'ପରିବର୍ତ୍ତନର କାହାଣୀ', stories_title:'ବାସ୍ତବତା, ତା ପରେ ପରିବର୍ତ୍ତନ।',
  stories_sub:'ପ୍ରତ୍ୟେକ ଘଟଣା କାହାଣୀ ଚାରି ଶିଶୁ ଅଧିକାର — ବଞ୍ଚିବା, ବିକାଶ, ସୁରକ୍ଷା, ସହଭାଗିତା — ମଧ୍ୟରୁ ଗୋଟିଏ ଚାରିପାଖରେ ସଜା ଯାଇଛି।',
  involved_eyebrow:'ଯୋଡ଼ି ହୁଅନ୍ତୁ', involved_title:'ମୌଜୁଦ ଶକ୍ତିକୁ ସାକାର କରନ୍ତୁ — ଆମ ସହ।',
  involved_sub:'ଆପଣ ଏକ ଘଣ୍ଟା, ଏକ କୌଶଳ, କିମ୍ବା ଏକ ଟଙ୍କା ଦିଅନ୍ତୁ, ଆପଣ ଏକ ଏପରି ବ୍ୟବସ୍ଥାର ଅଂଶ ହୁଅନ୍ତି ଯାହା ପ୍ରତିକ୍ରିୟା ଦିଏ।',
  involved_cta_title:'ସମ୍ପ୍ରଦାୟଙ୍କ ସହ ନିବେଶ କରନ୍ତୁ।',
  involved_cta_sub:'ପୁଞ୍ଜି କିମ୍ବା ସାମଗ୍ରୀ, ଅନଲାଇନ୍ କିମ୍ବା ଅଫଲାଇନ୍ — ପ୍ରତ୍ୟେକ ଟଙ୍କା ସେହି ସାମର୍ଥ୍ୟରେ ଯାଏ ଯାହା ସମ୍ପ୍ରଦାୟ ଆମେ ଚାଲିଗଲା ପରେ ମଧ୍ୟ ରଖନ୍ତି।',
  donate_now:'ଏକ ସହଭାଗିତା ଆରମ୍ଭ କରନ୍ତୁ', email_us:'ଆମକୁ ଇମେଲ କରନ୍ତୁ', f_email:'ଇମେଲ', f_phone:'ଫୋନ', f_web:'ୱେବ', f_address:'ଠିକଣା',
  nav_finance:'ସ୍ୱଚ୍ଛତା', nav_answers:'ଉତ୍ତର',
  fin_eyebrow:'ଆର୍ଥିକ ସ୍ୱଚ୍ଛତା', fin_title:'ପ୍ରତ୍ୟେକ ଟଙ୍କା, ଅଭିଲେଖରେ।',
  fin_sub:'ସ୍ୱାଧୀନ ଭାବେ ନିରୀକ୍ଷିତ ଆକାଉଣ୍ଟ — ନିବେଶ ସହଭାଗୀମାନେ କଣ ପ୍ରତିଶ୍ରୁତି ଦେଲେ, କାର୍ଯ୍ୟ ପର୍ଯ୍ୟନ୍ତ କଣ ପହଞ୍ଚିଲା, ଏବଂ ଉଭୟ ପଛରେ ଥିବା ବିଧାନିକ ଯାଞ୍ଚ। ପ୍ରତ୍ୟେକ ସଂଖ୍ୟା ଏକ ହସ୍ତାକ୍ଷରିତ ବାଲାନ୍ସ ସିଟ୍‌ରୁ ନିଆଯାଇଛି।',
  fin_stat_received:'20 ବର୍ଷରେ ପ୍ରତିଶ୍ରୁତ', fin_stat_fcra:'ବିଦେଶୀ ଅନୁଦାନ · ଫରେନ୍ କଣ୍ଟ୍ରିବ୍ୟୁସନ (ରେଗୁଲେସନ) ଆକ୍ଟ', fin_stat_inr:'ଦେଶୀ ଅନୁଦାନ · ଭାରତୀୟ ଟଙ୍କା', fin_stat_funders:'ଅଭିଲେଖରେ ଥିବା ନିବେଶ ସହଭାଗୀ',
  fin_years_head:'ବର୍ଷ ଅନୁସାରେ', fin_years_sub:'କଣ ଆସିଲା, କଣ ଖର୍ଚ୍ଚ ହେଲା, ଏବଂ ଆକାଉଣ୍ଟରେ କିଏ ହସ୍ତାକ୍ଷର କଲେ। ଏକ ବର୍ଷର ନିବେଶକ ଦେଖିବାକୁ ସେହି ବର୍ଷ ବାଛନ୍ତୁ।',
  fin_received:'ପ୍ରତିଶ୍ରୁତ', fin_utilised:'ବ୍ୟବହୃତ', fin_auditor:'ନିରୀକ୍ଷକ', fin_bs:'ବାଲାନ୍ସ ସିଟ୍', fin_surplus:'ଅଧିକ', fin_deficit:'ଅଭାବ', fin_partial:'ଆଂଶିକ ତଥ୍ୟ', fin_compiled:'ସଙ୍କଳିତ',
  fin_funders_head:'ଏହି କାର୍ଯ୍ୟରେ କିଏ ନିବେଶ କରେ', fin_funders_sub:'ଯେଉଁ ଅନୁଷ୍ଠାନ ଓ ବ୍ୟକ୍ତିଙ୍କ ପୁଞ୍ଜି ଏହି କାର୍ଯ୍ୟକୁ ଶକ୍ତି ଦିଏ — ଏକ ମିଳିତ ପରିଣାମରେ ସହଭାଗୀ, ଏକ-ପାର୍ଶ୍ୱ ଦାତା ନୁହଁନ୍ତି। ଆଇନ ଅନୁସାରେ ବିଦେଶୀ ଅନୁଦାନ ଏକ ପୃଥକ ଫରେନ୍ କଣ୍ଟ୍ରିବ୍ୟୁସନ (ରେଗୁଲେସନ) ଆକ୍ଟ ଖାତାରେ ରଖାଯାଏ ଏବଂ ନିରୀକ୍ଷିତ ହୁଏ; ଦେଶୀ ଅର୍ଥ ଟଙ୍କା ଆକାଉଣ୍ଟ ମାଧ୍ୟମରେ ଚାଲେ।',
  fin_regime_fcra:'ଫରେନ୍ କଣ୍ଟ୍ରିବ୍ୟୁସନ (ରେଗୁଲେସନ) ଆକ୍ଟ · ବିଦେଶୀ', fin_regime_inr:'ଭାରତୀୟ ଟଙ୍କା · ଦେଶୀ',
  fin_funders_cta:'ସମସ୍ତ ସହଭାଗୀ ଦେଖନ୍ତୁ',
  fin_compliance_head:'ବିଧାନିକ ଅନୁପାଳନ', fin_compliance_sub:'DEHAT ଏକ ପଞ୍ଜୀକୃତ ସୋସାଇଟି (ସୋସାଇଟିଜ୍ ରେଜିଷ୍ଟ୍ରେସନ ଆକ୍ଟ, 1860)। ତଳେ ସେହି ବାର୍ଷିକ ଉତ୍ତରଦାୟିତ୍ୱ ଚକ୍ର ଅଛି ଯାହା ଏକ ସମୀକ୍ଷକ ଦେଖିବାକୁ ଆଶା କରନ୍ତି — ଏବଂ ଯାହା DEHAT ଦାଖଲ କରେ।',
  fin_reg_head:'ପଞ୍ଜୀକରଣ', fin_cal_head:'ବାର୍ଷିକ ଫାଇଲିଂ କ୍ୟାଲେଣ୍ଡର', fin_rules_head:'ଆମେ କେଉଁ ନିୟମ ବିରୁଦ୍ଧରେ ରିପୋର୍ଟ କରୁ',
  fin_auditor_trail:'ପ୍ରତି ବର୍ଷ ଜଣେ ପ୍ରାକ୍ଟିସିଂ ଚାର୍ଟର୍ଡ ଆକାଉଣ୍ଟାଣ୍ଟଙ୍କ ଦ୍ୱାରା ନିରୀକ୍ଷିତ ଏବଂ ଏକ ୟୁନିକ୍ ଡକ୍ୟୁମେଣ୍ଟ ଆଇଡେଣ୍ଟିଫିକେସନ ନମ୍ବର ସହ ହସ୍ତାକ୍ଷରିତ। ବିତି ଯାଇଥିବା ଦଶନ୍ଧିରେ ପାଞ୍ଚଟି ଭିନ୍ନ ଫାର୍ମ ଆକାଉଣ୍ଟ ଯାଞ୍ଚ କରିଛନ୍ତି — କୌଣସି ଏକକ ଦୀର୍ଘକାଳୀନ ସମ୍ପର୍କ ନାହିଁ।',
  fin_due:'ଦେୟ ତାରିଖ', fin_year_funders:'ଏହି ବର୍ଷର ନିବେଶ ସହଭାଗୀ',
  fin_docs_head:'ପ୍ରମାଣପତ୍ର ଓ ଦଲିଲ', fin_docs_sub:'ପ୍ରତ୍ୟେକ ପଞ୍ଜୀକରଣ, ଅନୁମୋଦନ ଏବଂ ତୃତୀୟ-ପକ୍ଷ ବୈଧିକରଣ — ମୂଳ ପ୍ରମାଣପତ୍ରରୁ ସ୍କାନ୍ ହୋଇଛି। ମୂଳ ଦଲିଲ ପଢ଼ିବାକୁ ଯେକୌଣସିଟି ଖୋଲନ୍ତୁ।',
  fin_docg_statutory:'ପଞ୍ଜୀକରଣ ଓ ଟିକସ', fin_docg_fcra:'ବିଦେଶୀ ଅନୁଦାନ · ଫରେନ୍ କଣ୍ଟ୍ରିବ୍ୟୁସନ (ରେଗୁଲେସନ) ଆକ୍ଟ', fin_docg_validation:'ବୈଧିକରଣ ଓ ସ୍ୱୀକୃତି',
  fin_doc_view:'ଦଲିଲ ଦେଖନ୍ତୁ', fin_pending_label:'ନିରୀକ୍ଷିତ ସ୍କାନ୍ ଫାଇଲରେ ଅଛି — ସଂଖ୍ୟା ଡିଜିଟାଇଜ୍ ହେଉଛି',
  foot_explore:'ଅନ୍ୱେଷଣ କରନ୍ତୁ', foot_reach:'ଆମ ସହ ଯୋଗାଯୋଗ କରନ୍ତୁ', foot_follow:'କାର୍ଯ୍ୟ ସହ ଯୋଡ଼ି ରୁହନ୍ତୁ',
  foot_desc:'ମାନବ ଉନ୍ନତି ପାଇଁ ବିକାଶମୂଳକ ସଂଘ — ସମ୍ପ୍ରଦାୟ ଓ ବ୍ୟବସ୍ଥା ସହ କାର୍ଯ୍ୟ, ଯେପରି ଶିଶୁମାନଙ୍କର ଅଧିକାର ସ୍ୱୀକୃତ, ପ୍ରାପ୍ତ ଏବଂ ସୁରକ୍ଷିତ ହୁଏ।',
  foot_rights:'© 2026 DEHAT · 1989ରେ ଏକ ଯୁବ ସମୂହ ଭାବେ ଆରମ୍ଭ · 2000ରେ ପଞ୍ଜୀକୃତ',
    };
    const ML = {
foot_policies:'നയങ്ങളും സുരക്ഷാ നടപടികളും', foot_cookies:'കുക്കി സെറ്റിംഗ്സ്',
  nav_home:'ഹോം', nav_who:'ഞങ്ങൾ ആരാണ്', nav_work:'ഞങ്ങളുടെ പ്രവർത്തനം', nav_impact:'സ്വാധീനം', nav_stories:'കഥകൾ', nav_media:'മാധ്യമം', nav_involved:'പങ്കാളിയാകൂ',
  donate:'നിക്ഷേപിക്കുക', since:'1989 മുതൽ', org_full:'മനുഷ്യ പുരോഗതിക്കായുള്ള വികസന സംഘടന',
  language:'ഭാഷ', lang_indian:'ഇന്ത്യൻ ഭാഷകൾ', lang_global:'ആഗോളം (ഐക്യരാഷ്ട്രസഭ)',
  hero_title_a:'ഓരോ കുട്ടിയും തങ്ങളുടെ ', hero_title_b:'അവകാശങ്ങൾ', hero_title_c:' സാക്ഷാത്കരിക്കുന്ന, ശിശുകേന്ദ്രീകൃതമായ ഒരു സമൂഹം — സുരക്ഷിതം, അന്തസ്സുള്ളത്, സമ്പൂർണ്ണം.',
  hero_sub:'ഇന്ത്യ-നേപ്പാൾ തെരായ് മേഖലയിലുടനീളം സമൂഹങ്ങളോടും പൊതു സംവിധാനങ്ങളോടും ചേർന്ന് ഞങ്ങൾ പ്രവർത്തിക്കുന്നു, കുട്ടികളുടെ അവകാശങ്ങൾ വെറും കടലാസിൽ എഴുതി വയ്ക്കാതെ, നിത്യജീവിതത്തിൽ അംഗീകരിക്കപ്പെടാനും ലഭ്യമാകാനും സംരക്ഷിക്കപ്പെടാനും വേണ്ടി.',
  hero_cta1:'സമൂഹങ്ങൾക്കൊപ്പം നിൽക്കുക', hero_cta2:'ഞങ്ങൾ എങ്ങനെ പ്രവർത്തിക്കുന്നു എന്ന് കാണുക', hero_photo:'ഫോട്ടോ — ബാല പാർലമെന്റ് നേതാക്കൾ, ലോഹ്ര ഗ്രാമം, ബഹ്‌റൈച്',
  hero_principle:'സമൂഹങ്ങളും സർക്കാർ സംവിധാനങ്ങളും ചേർന്ന്, ഓരോ കുട്ടിക്കും വേണ്ടി.',
  stat_children:'എത്തിച്ചേർന്ന കുട്ടികളും കൗമാരക്കാരും', stat_invested:'2000 മുതൽ സാമൂഹിക സംവിധാനങ്ങളിൽ നിക്ഷേപിച്ചത്', stat_resources:'ലഭ്യമാക്കിയ പൊതു വിഭവങ്ങൾ', stat_districts:'2 സംസ്ഥാനങ്ങളിലെ ജില്ലകൾ',
  stat_hint:'നാല് കണക്കുകൾ, മറച്ചുവെച്ചിരിക്കുന്നു. കാണാൻ ഒന്നിൽ ടാപ്പ് ചെയ്യുക.', stat_reveal:'കാണാൻ ടാപ്പ് ചെയ്യുക', stat_hide:'മറയ്ക്കുക', stat_reveal_all:'നാലും കാണിക്കുക', stat_hide_all:'എല്ലാം മറയ്ക്കുക', grid_reveal_all:'പതിനാലും കാണിക്കുക', grid_hint:'പതിനാല് കണക്കുകൾ, മറച്ചുവെച്ചിരിക്കുന്നു. കാണാൻ ഒന്നിൽ ടാപ്പ് ചെയ്യുക.', bl_drag:'സർവേയെ മുന്നോട്ട് വലിക്കുക',
  vision:'കാഴ്ചപ്പാട്', mission:'ദൗത്യം', theory:'മാറ്റത്തിന്റെ സിദ്ധാന്തം',
  vision_body:'ഓരോ കുട്ടിയും തങ്ങളുടെ അവകാശങ്ങൾ സാക്ഷാത്കരിക്കുകയും സുരക്ഷിതവും അന്തസ്സുള്ളതും സംതൃപ്തവുമായ ജീവിതം നയിക്കുകയും ചെയ്യുന്ന, ശിശുകേന്ദ്രീകൃതമായ ഒരു സമൂഹം.',
  mission_body:'നിലവിലുള്ള ശക്തിയെ സാക്ഷാത്കരിക്കാൻ സമൂഹങ്ങളോടും സംവിധാനങ്ങളോടും ചേർന്ന് പ്രവർത്തിക്കുക, കുട്ടികളുടെ അവകാശങ്ങൾ നിത്യജീവിതത്തിൽ അംഗീകരിക്കപ്പെടുന്നുവെന്നും ലഭ്യമാകുന്നുവെന്നും സംരക്ഷിക്കപ്പെടുന്നുവെന്നും ഉറപ്പാക്കുന്നു.',
  theory_body:'സമൂഹങ്ങൾ പ്രവർത്തിക്കുകയും സംവിധാനങ്ങൾ ഒരുമിച്ചു പ്രതികരിക്കുകയും ചെയ്യുമ്പോൾ, കുട്ടികളുടെ അതിജീവനം, വളർച്ച, സംരക്ഷണം, പങ്കാളിത്തം എന്നിവ സാക്ഷാത്കരിക്കപ്പെടുകയും നിലനിർത്തപ്പെടുകയും ചെയ്യുന്നു.',
  eyebrow_work:'ഞങ്ങൾ എന്ത് ചെയ്യുന്നു', work_head:'നാല് മുന്നണികൾ, ഒരു സംയോജിത പ്രതികരണം.',
  eyebrow_where:'ഞങ്ങൾ എവിടെ പ്രവർത്തിക്കുന്നു', where_head:'23 ജില്ലകൾ. 2 സംസ്ഥാനങ്ങൾ. ഒരു അതിർത്തി.',
  where_sub:'ഉത്തർപ്രദേശിലും മഹാരാഷ്ട്രയിലും കിഴക്കൻ ഇന്ത്യ-നേപ്പാൾ അതിർത്തിയിലുടനീളം ഞങ്ങൾ പ്രവർത്തിക്കുന്നു — ഒരു പൊതു ഘടനാപരമായ ദുർബലതയാൽ ബന്ധിക്കപ്പെട്ട പ്രദേശങ്ങൾ. നിലം എങ്ങനെയെന്ന് കാണാൻ ഒരു ജില്ലയിൽ ടാപ്പ് ചെയ്യുക.',
  eyebrow_cycle:'ഘടനാപരമായ ദുർബലതയുടെ ചക്രം', cycle_head:'അപകടസാധ്യതകൾ ഒറ്റയ്ക്ക് സംഭവിക്കുന്നില്ല.',
  cycle_sub:'അവ തലമുറകളിലുടനീളം പരസ്പരം ശക്തിപ്പെടുത്തുന്നു — സംവിധാനങ്ങൾ സമയബന്ധിതമായി പ്രതികരിക്കാത്ത പക്ഷം. നിശ്ചിതമായ ഒരു ക്രമവുമില്ല: ഏതു കുട്ടിക്കും, ഈ കെണി ഏതു ഘട്ടത്തിലും ആരംഭിക്കാം, ഓരോ അപകടസാധ്യതയും അടുത്തതിനെ കൂടുതൽ അടുപ്പിക്കുന്നു.',
  cycle_pick:'ഒരു ജീവിതം എങ്ങനെ രൂപപ്പെടുന്നു എന്ന് പിന്തുടരാൻ ഏതെങ്കിലും നിമിഷത്തിൽ ടാപ്പ് ചെയ്യുക.',
  cycle_note:'ഉത്തർപ്രദേശിന്റെ ഇന്ത്യ-നേപ്പാൾ തെരായ് പട്ടയിലെ ഏഴ് ജില്ലകളിൽ — ബഹ്‌റൈച്, ശ്രാവസ്തി, ബൽരാംപൂർ, ലഖിംപൂർ ഖേരി, സിദ്ധാർത്ഥനഗർ, മഹാരാജ്ഗഞ്ജ്, കുശിനഗർ — രേഖപ്പെടുത്തിയിട്ടുള്ളതിൽ ഏറ്റവും മോശമായ മൂല്യമാണ് ഓരോ കണക്കും. സ്രോതസ്സുകൾ: ആരോഗ്യം, പോഷണം, ലിംഗപദവി എന്നിവയ്ക്ക് ദേശീയ കുടുംബാരോഗ്യ സർവേ 5 (2019–21) ജില്ലാ വസ്തുതാ-ഷീറ്റ് ഡാറ്റാസെറ്റ് (ആരോഗ്യ കുടുംബക്ഷേമ മന്ത്രാലയം / ഇന്റർനാഷണൽ ഇൻസ്റ്റിറ്റ്യൂട്ട് ഫോർ പോപ്പുലേഷൻ സയൻസസ്); വിദ്യാഭ്യാസത്തിന് യൂണിഫൈഡ് ഡിസ്ട്രിക്റ്റ് ഇൻഫർമേഷൻ സിസ്റ്റം ഫോർ എജ്യുക്കേഷൻ പ്ലസിന്റെ ജില്ലാ വസ്തുതാ-ഷീറ്റുകൾ; മാതൃമരണനിരക്കിന് സാമ്പിൾ രജിസ്ട്രേഷൻ സിസ്റ്റം, ഇത് സംസ്ഥാനതല കണക്കാണ്. എല്ലാ ആരോഗ്യ കണക്കുകളും ഒരൊറ്റ സർവേ റൗണ്ടിൽ നിന്നുള്ളതാണ്, അതിനാൽ ജില്ലകൾ തുല്യമായ അടിസ്ഥാനത്തിൽ താരതമ്യം ചെയ്യപ്പെടുന്നു. ദാമ്പത്യ പീഡനം ദേശീയ കുടുംബാരോഗ്യ സർവേയുടെ സംസ്ഥാന മൊഡ്യൂളിൽ മാത്രമേ ശേഖരിക്കപ്പെടുന്നുള്ളൂ, അതിനാൽ ഉത്തർപ്രദേശിന്റെ കണക്കായി ഇത് കാണിച്ചിരിക്കുന്നു. ബാലവേല, ഏറ്റവും ദരിദ്രമായ സാമ്പത്തിക വിഭാഗം, ശിശുമരണനിരക്ക്, അഞ്ചു വയസ്സിനു താഴെയുള്ള മരണനിരക്ക് എന്നീ നാല് നിമിഷങ്ങൾ ഇനിയും പുനഃസ്ഥിരീകരണം കാത്തിരിക്കുന്ന രേഖകളെ അടിസ്ഥാനമാക്കിയുള്ളതാണ്, അത് അങ്ങനെതന്നെ വ്യക്തമാക്കുന്നു. ശിശുമരണനിരക്കിനോ അഞ്ചു വയസ്സിനു താഴെയുള്ള മരണനിരക്കിനോ ഇന്ത്യ ഔദ്യോഗിക ജില്ലാതല പരമ്പര പ്രസിദ്ധീകരിക്കുന്നില്ല. ഓരോ നിമിഷവും അതിന്റെ ജില്ലയും സ്രോതസ്സും വ്യക്തമാക്കുന്നു.',
  eyebrow_process:'പ്രക്രിയ', process_head:'സമൂഹങ്ങൾ പ്രവർത്തിക്കുമ്പോൾ, സംവിധാനങ്ങൾ പ്രതികരിക്കുന്നു.', eyebrow_stories:'മാറ്റത്തിന്റെ കഥകൾ',
  cta_donate:'നിക്ഷേപിക്കുക', cta_donate_b:'സമൂഹ നേതൃത്വത്തിലുള്ള പ്രവർത്തനത്തെ മൂലധനത്തിലൂടെയോ വസ്തുക്കളിലൂടെയോ, ഓൺലൈനിലോ ഓഫ്‌ലൈനിലോ പിന്തുണയ്ക്കുക.', cta_donate_a:'ഇപ്പോൾ നിക്ഷേപിക്കുക',
  cta_vol:'സന്നദ്ധപ്രവർത്തകനാകൂ', cta_vol_b:'ഇന്റേൺ ആകുക, വെർച്വലായി പ്രവർത്തിക്കുക, അല്ലെങ്കിൽ ഒരു DEHAT ഫെലോ ആകുക.', cta_vol_a:'ഞങ്ങളോടൊപ്പം ചേരൂ',
  cta_partner:'പങ്കാളിയാകുക', cta_partner_b:'കോർപ്പറേറ്റ്, അക്കാദമിക്, അല്ലെങ്കിൽ സ്ഥാപനപരമായ പങ്കാളിത്തങ്ങൾ.', cta_partner_a:'സഹകരിക്കുക',
  pillar_link_work:'നാല് പദ്ധതികളും കാണുക', pillar_link_how:'ഞങ്ങൾ എങ്ങനെ പ്രവർത്തിക്കുന്നു എന്ന് കാണുക', stories_all:'എല്ലാ കഥകളും വായിക്കുക',
  work_title:'അവകാശങ്ങൾ, നിത്യജീവിതത്തിൽ സാക്ഷാത്കരിക്കപ്പെടുന്നു.',
  chrono_title:'ഓരോ പദ്ധതിയും, കാലക്രമത്തിൽ',
  count_label:'രേഖയിലുള്ള പദ്ധതികൾ',
  open_programme:'പദ്ധതി തുറക്കുക',
  work_sub:'നാല് പദ്ധതികൾ, അവ ആരംഭിച്ച ക്രമത്തിൽ. ഓരോന്നും അതിന്റേതായ പേജിലേക്ക് തുറക്കുന്നു — ഈ പ്രവർത്തനം എന്തുകൊണ്ട് നിലനിൽക്കുന്നു, അത് എങ്ങനെ കെട്ടിപ്പടുത്തതാണ്, അത് നടത്തിയ ഓരോ പദ്ധതിയും, കാലക്രമത്തിൽ, ഓരോന്നിന്റെയും പിന്നിലെ എന്ത്, എവിടെ, എങ്ങനെ, എപ്പോൾ, എന്തുകൊണ്ട്, നിക്ഷേപം എന്നിവയോടെ.',
  portfolio_total:'പൊതു രേഖയിലുള്ള പദ്ധതികൾ', portfolio_investment:'ആകെ സാമൂഹിക നിക്ഷേപം',
  portfolio_count:'നാല് പദ്ധതികളിലായുള്ള പദ്ധതികൾ',
  filter_year:'വർഷം', filter_state:'സംസ്ഥാനം', filter_district:'ജില്ല', filter_sdg:'വികസന ലക്ഷ്യം', filter_csr:'കോർപ്പറേറ്റ് സാമൂഹിക ഉത്തരവാദിത്തം · ഷെഡ്യൂൾ VII', filter_uncrc:'ബാലാവകാശം', filter_investor:'സാമൂഹിക നിക്ഷേപകൻ', filter_all:'എല്ലാം',
  open_details:'പൂർണ്ണ രേഖ തുറക്കുക', close_details:'രേഖ അടയ്ക്കുക', phases_label:'ഘട്ടങ്ങൾ',
  annual_label:'വർഷം തിരിച്ച്',
  cross_from:'ഇതിന്റെയും ഭാഗം',
  shared_note:'പങ്കിട്ട സാമൂഹിക നിക്ഷേപ പരിധി:',
  d_what:'ഞങ്ങൾ ലക്ഷ്യമിട്ട മാറ്റം', d_why:'ഇവിടെ ഇത് പ്രധാനമായത് എന്തുകൊണ്ട്',
  d_how:'സമൂഹങ്ങളും സംവിധാനങ്ങളും ഒരുമിച്ച് എങ്ങനെ പ്രവർത്തിച്ചു', d_impact:'സ്വാധീന കണക്കുകൾ',
  d_investor:'സാമൂഹിക നിക്ഷേപകൻ', d_investors:'സാമൂഹിക നിക്ഷേപകർ', d_investment:'സാമൂഹിക നിക്ഷേപം',
  m_when:'എപ്പോൾ, നിലവിലെ സ്ഥിതി', m_location:'എവിടെ', m_sdg:'വികസന ലക്ഷ്യങ്ങൾ', m_csr:'കോർപ്പറേറ്റ് സാമൂഹിക ഉത്തരവാദിത്തം · ഷെഡ്യൂൾ VII', m_uncrc:'കുട്ടിയുടെ അവകാശങ്ങൾ', m_law:'ഇന്ത്യൻ നിയമവും നയ അടിസ്ഥാനവും', m_law_none:'ഈ പദ്ധതിക്ക് ഒരൊറ്റ നിയമപരമായ അടിസ്ഥാനവും രേഖപ്പെടുത്തിയിട്ടില്ല.',
  invest_note:'രേഖപ്പെടുത്തിയിരിക്കുന്നത് പോലെ കൃത്യമായി പ്രസിദ്ധീകരിച്ചത്; ഏകീകരിച്ചതല്ല.',
  impact_eyebrow:'സ്വാധീനം', impact_title:'2000 മുതൽ, സമൂഹങ്ങൾ അവരുടെ അവകാശങ്ങൾ അവകാശപ്പെടുകയും അവ ലഭ്യമാക്കാൻ പൊതു സംവിധാനങ്ങളുമായി പങ്കാളിത്തത്തിൽ പ്രവർത്തിക്കുകയും ചെയ്യുമ്പോൾ അവരോടൊപ്പം നിൽക്കുന്നു.',
  impact_sub:'1989-ൽ ഒരു യുവജന കൂട്ടായ്മയായി ആരംഭിച്ച്, 2000-ൽ രജിസ്റ്റർ ചെയ്തു. ഈ കണക്കുകൾ വ്യാപ്തി കാണിക്കുന്നു; ഇവയ്ക്ക് പിന്നിൽ സമൂഹങ്ങളും ഫീൽഡ് പ്രവർത്തകരും പൊതു സ്ഥാപനങ്ങളും ഒരുമിച്ച് പ്രവർത്തിക്കുന്നു.',
  reach_head:'ഇതുവരെയുള്ള ഭൂമിശാസ്ത്രപരമായ വ്യാപ്തി', reach_states:'സംസ്ഥാനങ്ങൾ', reach_districts:'ജില്ലകൾ', reach_blocks:'ബ്ലോക്കുകൾ', reach_villages:'ഗ്രാമങ്ങൾ', reach_children:'കുട്ടികളും കൗമാരക്കാരും', reach_farmers:'വനിതാ കർഷകർ',
  stories_eyebrow:'മാറ്റത്തിന്റെ കഥകൾ', stories_title:'യാഥാർത്ഥ്യം, പിന്നെ പരിവർത്തനം.',
  stories_sub:'ഓരോ കേസ് കഥയും നാല് ബാലാവകാശങ്ങളിൽ ഒന്നിനെ ചുറ്റിപ്പറ്റിയാണ് ക്രമീകരിച്ചിരിക്കുന്നത് — അതിജീവനം, വളർച്ച, സംരക്ഷണം, പങ്കാളിത്തം.',
  involved_eyebrow:'പങ്കാളിയാകൂ', involved_title:'നിലവിലുള്ള ശക്തിയെ സാക്ഷാത്കരിക്കുക — ഞങ്ങളോടൊപ്പം.',
  involved_sub:'നിങ്ങൾ ഒരു മണിക്കൂറോ, ഒരു നൈപുണ്യമോ, ഒരു രൂപയോ നൽകിയാലും, പ്രതികരിക്കുന്ന ഒരു സംവിധാനത്തിന്റെ ഭാഗമായി നിങ്ങൾ മാറുന്നു.',
  involved_cta_title:'സമൂഹങ്ങൾക്കൊപ്പം നിക്ഷേപിക്കുക.',
  involved_cta_sub:'മൂലധനമോ വസ്തുക്കളോ, ഓൺലൈനിലോ ഓഫ്‌ലൈനിലോ — ഓരോ രൂപയും ഞങ്ങൾ പോയശേഷവും സമൂഹങ്ങൾ നിലനിർത്തുന്ന ശേഷിയിലേക്ക് പോകുന്നു.',
  donate_now:'ഒരു പങ്കാളിത്തം ആരംഭിക്കുക', email_us:'ഞങ്ങൾക്ക് ഇമെയിൽ ചെയ്യുക', f_email:'ഇമെയിൽ', f_phone:'ഫോൺ', f_web:'വെബ്', f_address:'വിലാസം',
  nav_finance:'സുതാര്യത', nav_answers:'ഉത്തരങ്ങൾ',
  fin_eyebrow:'സാമ്പത്തിക സുതാര്യത', fin_title:'ഓരോ രൂപയും, രേഖയിൽ.',
  fin_sub:'സ്വതന്ത്രമായി ഓഡിറ്റ് ചെയ്ത കണക്കുകൾ — നിക്ഷേപ പങ്കാളികൾ പ്രതിജ്ഞാബദ്ധരായത് എന്ത്, പ്രവർത്തനത്തിലേക്ക് എത്തിയത് എന്ത്, ഇവ രണ്ടിന്റെയും പിന്നിലെ നിയമപരമായ പരിശോധനകൾ. ഓരോ കണക്കും ഒപ്പിട്ട ബാലൻസ് ഷീറ്റിൽ നിന്നാണ്.',
  fin_stat_received:'20 വർഷത്തിനിടെ പ്രതിജ്ഞാബദ്ധമായത്', fin_stat_fcra:'വിദേശ സംഭാവന · ഫോറിൻ കോൺട്രിബ്യൂഷൻ (റെഗുലേഷൻ) ആക്ട്', fin_stat_inr:'ആഭ്യന്തര സംഭാവന · ഇന്ത്യൻ രൂപ', fin_stat_funders:'രേഖയിലുള്ള നിക്ഷേപ പങ്കാളികൾ',
  fin_years_head:'വർഷം തിരിച്ച്', fin_years_sub:'എന്ത് വന്നു, എന്ത് ചെലവഴിച്ചു, കണക്കുകളിൽ ആരാണ് ഒപ്പിട്ടത് എന്നും. ഒരു വർഷത്തിലെ നിക്ഷേപകരെ കാണാൻ ആ വർഷം തിരഞ്ഞെടുക്കുക.',
  fin_received:'പ്രതിജ്ഞാബദ്ധം', fin_utilised:'വിനിയോഗിച്ചത്', fin_auditor:'ഓഡിറ്റർ', fin_bs:'ബാലൻസ് ഷീറ്റ്', fin_surplus:'മിച്ചം', fin_deficit:'കമ്മി', fin_partial:'ഭാഗിക വിവരം', fin_compiled:'സമാഹരിച്ചത്',
  fin_funders_head:'ഈ പ്രവർത്തനത്തിൽ ആരാണ് നിക്ഷേപിക്കുന്നത്', fin_funders_sub:'ഈ പ്രവർത്തനത്തിന് ശക്തി പകരുന്ന മൂലധനമുള്ള സ്ഥാപനങ്ങളും വ്യക്തികളും — ഒരു പൊതു ഫലത്തിലെ പങ്കാളികൾ, ഏകപക്ഷീയ ദാതാക്കളല്ല. നിയമം അനുശാസിക്കുന്നതു പോലെ, വിദേശ സംഭാവനകൾ പ്രത്യേകമായ ഫോറിൻ കോൺട്രിബ്യൂഷൻ (റെഗുലേഷൻ) ആക്ട് അക്കൗണ്ടിൽ സൂക്ഷിക്കുകയും ഓഡിറ്റ് ചെയ്യുകയും ചെയ്യുന്നു; ആഭ്യന്തര ഫണ്ടുകൾ രൂപ കണക്കുകളിലൂടെയാണ് പ്രവർത്തിക്കുന്നത്.',
  fin_regime_fcra:'ഫോറിൻ കോൺട്രിബ്യൂഷൻ (റെഗുലേഷൻ) ആക്ട് · വിദേശം', fin_regime_inr:'ഇന്ത്യൻ രൂപ · ആഭ്യന്തരം',
  fin_funders_cta:'എല്ലാ പങ്കാളികളെയും കാണുക',
  fin_compliance_head:'നിയമപരമായ പാലനം', fin_compliance_sub:'DEHAT ഒരു രജിസ്റ്റർ ചെയ്ത സൊസൈറ്റിയാണ് (സൊസൈറ്റീസ് രജിസ്ട്രേഷൻ ആക്ട്, 1860). ഒരു അവലോകകൻ കാണുമെന്ന് പ്രതീക്ഷിക്കുന്ന, DEHAT സമർപ്പിക്കുന്ന വാർഷിക ഉത്തരവാദിത്ത ചക്രം താഴെ.',
  fin_reg_head:'രജിസ്ട്രേഷനുകൾ', fin_cal_head:'വാർഷിക ഫയലിംഗ് കലണ്ടർ', fin_rules_head:'ഞങ്ങൾ ഏതു ചട്ടങ്ങൾക്കെതിരെയാണ് റിപ്പോർട്ട് ചെയ്യുന്നത്',
  fin_auditor_trail:'എല്ലാ വർഷവും ഒരു പ്രാക്ടീസ് ചെയ്യുന്ന ചാർട്ടേഡ് അക്കൗണ്ടന്റ് ഓഡിറ്റ് ചെയ്യുകയും യുണീക് ഡോക്യുമെന്റ് ഐഡന്റിഫിക്കേഷൻ നമ്പറോടെ ഒപ്പിടുകയും ചെയ്യുന്നു. കഴിഞ്ഞ പതിറ്റാണ്ടിൽ അഞ്ച് വ്യത്യസ്ത സ്ഥാപനങ്ങൾ കണക്കുകൾ പരിശോധിച്ചിട്ടുണ്ട് — ഒരൊറ്റ ദീർഘകാല ബന്ധവുമില്ല.',
  fin_due:'അന്തിമ തീയതി', fin_year_funders:'ഈ വർഷത്തെ നിക്ഷേപ പങ്കാളികൾ',
  fin_docs_head:'സാക്ഷ്യപത്രങ്ങളും രേഖകളും', fin_docs_sub:'ഓരോ രജിസ്ട്രേഷനും, അംഗീകാരവും, മൂന്നാം കക്ഷി സാധൂകരണവും — യഥാർത്ഥ സർട്ടിഫിക്കറ്റിൽ നിന്ന് സ്കാൻ ചെയ്തത്. മൂല രേഖ വായിക്കാൻ ഏതെങ്കിലും തുറക്കുക.',
  fin_docg_statutory:'രജിസ്ട്രേഷനും നികുതിയും', fin_docg_fcra:'വിദേശ സംഭാവന · ഫോറിൻ കോൺട്രിബ്യൂഷൻ (റെഗുലേഷൻ) ആക്ട്', fin_docg_validation:'സാധൂകരണങ്ങളും അംഗീകാരങ്ങളും',
  fin_doc_view:'രേഖ കാണുക', fin_pending_label:'ഓഡിറ്റ് ചെയ്ത സ്കാൻ ഫയലിലുണ്ട് — കണക്കുകൾ ഡിജിറ്റൈസ് ചെയ്തുകൊണ്ടിരിക്കുന്നു',
  foot_explore:'പര്യവേക്ഷണം ചെയ്യുക', foot_reach:'ഞങ്ങളെ ബന്ധപ്പെടുക', foot_follow:'പ്രവർത്തനത്തെ പിന്തുടരുക',
  foot_desc:'മനുഷ്യ പുരോഗതിക്കായുള്ള വികസന സംഘടന — കുട്ടികളുടെ അവകാശങ്ങൾ അംഗീകരിക്കപ്പെടാനും ലഭ്യമാകാനും സംരക്ഷിക്കപ്പെടാനും വേണ്ടി സമൂഹങ്ങളോടും സംവിധാനങ്ങളോടും ചേർന്ന് പ്രവർത്തിക്കുന്നു.',
  foot_rights:'© 2026 DEHAT · 1989-ൽ ഒരു യുവജന കൂട്ടായ്മയായി ആരംഭിച്ചു · 2000-ൽ രജിസ്റ്റർ ചെയ്തു',
    };
    const PA = {
foot_policies:'ਨੀਤੀਆਂ ਅਤੇ ਸੁਰੱਖਿਆ ਉਪਾਅ', foot_cookies:'ਕੂਕੀ ਸੈਟਿੰਗਾਂ',
  nav_home:'ਘਰ', nav_who:'ਅਸੀਂ ਕੌਣ ਹਾਂ', nav_work:'ਸਾਡਾ ਕੰਮ', nav_impact:'ਪ੍ਰਭਾਵ', nav_stories:'ਕਹਾਣੀਆਂ', nav_media:'ਮੀਡੀਆ', nav_involved:'ਸ਼ਾਮਲ ਹੋਵੋ',
  donate:'ਨਿਵੇਸ਼ ਕਰੋ', since:'1989 ਤੋਂ', org_full:'ਮਨੁੱਖੀ ਉੱਨਤੀ ਲਈ ਵਿਕਾਸ ਸੰਗਠਨ',
  language:'ਭਾਸ਼ਾ', lang_indian:'ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ', lang_global:'ਵਿਸ਼ਵ ਪੱਧਰੀ (ਸੰਯੁਕਤ ਰਾਸ਼ਟਰ)',
  hero_title_a:'ਇੱਕ ਬਾਲ-ਕੇਂਦਰਿਤ ਸਮਾਜ ਜਿੱਥੇ ਹਰ ਬੱਚਾ ਆਪਣੇ ', hero_title_b:'ਅਧਿਕਾਰ', hero_title_c:' ਪ੍ਰਾਪਤ ਕਰੇ — ਸੁਰੱਖਿਅਤ, ਸਨਮਾਨਜਨਕ ਅਤੇ ਸੰਪੂਰਨ।',
  hero_sub:'ਅਸੀਂ ਭਾਰਤ-ਨੇਪਾਲ ਤਰਾਈ ਖੇਤਰ ਵਿੱਚ ਭਾਈਚਾਰਿਆਂ ਅਤੇ ਜਨਤਕ ਪ੍ਰਣਾਲੀਆਂ ਨਾਲ ਮਿਲ ਕੇ ਕੰਮ ਕਰਦੇ ਹਾਂ ਤਾਂ ਜੋ ਬੱਚਿਆਂ ਦੇ ਅਧਿਕਾਰ ਸਿਰਫ਼ ਕਾਗਜ਼ਾਂ ਤੱਕ ਸੀਮਤ ਨਾ ਰਹਿਣ, ਸਗੋਂ ਰੋਜ਼ਾਨਾ ਜੀਵਨ ਵਿੱਚ ਮਾਨਤਾ ਪ੍ਰਾਪਤ, ਹਾਸਲ ਅਤੇ ਕਾਇਮ ਰਹਿਣ।',
  hero_cta1:'ਭਾਈਚਾਰਿਆਂ ਨਾਲ ਖੜ੍ਹੇ ਹੋਵੋ', hero_cta2:'ਦੇਖੋ ਅਸੀਂ ਕਿਵੇਂ ਕੰਮ ਕਰਦੇ ਹਾਂ', hero_photo:'ਫੋਟੋ — ਬਾਲ ਸੰਸਦ ਆਗੂ, ਲੋਹਰਾ ਪਿੰਡ, ਬਹਿਰਾਇਚ',
  hero_principle:'ਭਾਈਚਾਰਿਆਂ ਅਤੇ ਸਰਕਾਰੀ ਪ੍ਰਬੰਧਾਂ ਨਾਲ ਮਿਲ ਕੇ, ਹਰ ਬੱਚੇ ਲਈ।',
  stat_children:'ਪਹੁੰਚੇ ਬੱਚੇ ਅਤੇ ਕਿਸ਼ੋਰ', stat_invested:'2000 ਤੋਂ ਭਾਈਚਾਰਕ ਪ੍ਰਣਾਲੀਆਂ ਵਿੱਚ ਨਿਵੇਸ਼', stat_resources:'ਹਾਸਲ ਕੀਤੇ ਜਨਤਕ ਸਾਧਨ', stat_districts:'2 ਰਾਜਾਂ ਦੇ ਜ਼ਿਲ੍ਹੇ',
  stat_hint:'ਚਾਰ ਅੰਕੜੇ, ਲੁਕਾਏ ਗਏ। ਦੇਖਣ ਲਈ ਕਿਸੇ ਇੱਕ ਉੱਤੇ ਟੈਪ ਕਰੋ।', stat_reveal:'ਦੇਖਣ ਲਈ ਟੈਪ ਕਰੋ', stat_hide:'ਲੁਕਾਓ', stat_reveal_all:'ਸਾਰੇ ਚਾਰ ਦਿਖਾਓ', stat_hide_all:'ਸਾਰੇ ਲੁਕਾਓ', grid_reveal_all:'ਸਾਰੇ ਚੌਦਾਂ ਦਿਖਾਓ', grid_hint:'ਚੌਦਾਂ ਅੰਕੜੇ, ਲੁਕਾਏ ਗਏ। ਦੇਖਣ ਲਈ ਕਿਸੇ ਇੱਕ ਉੱਤੇ ਟੈਪ ਕਰੋ।', bl_drag:'ਸਰਵੇਖਣ ਨੂੰ ਅੱਗੇ ਖਿੱਚੋ',
  vision:'ਦ੍ਰਿਸ਼ਟੀ', mission:'ਮਿਸ਼ਨ', theory:'ਤਬਦੀਲੀ ਦਾ ਸਿਧਾਂਤ',
  vision_body:'ਇੱਕ ਬਾਲ-ਕੇਂਦਰਿਤ ਸਮਾਜ ਜਿੱਥੇ ਹਰ ਬੱਚਾ ਆਪਣੇ ਅਧਿਕਾਰ ਪ੍ਰਾਪਤ ਕਰੇ ਅਤੇ ਇੱਕ ਸੁਰੱਖਿਅਤ, ਸਨਮਾਨਜਨਕ ਅਤੇ ਸੰਪੂਰਨ ਜ਼ਿੰਦਗੀ ਜੀਵੇ।',
  mission_body:'ਭਾਈਚਾਰਿਆਂ ਅਤੇ ਪ੍ਰਣਾਲੀਆਂ ਨਾਲ ਮਿਲ ਕੇ ਮੌਜੂਦਾ ਤਾਕਤ ਨੂੰ ਸਾਕਾਰ ਕਰਨਾ, ਤਾਂ ਜੋ ਬੱਚਿਆਂ ਦੇ ਅਧਿਕਾਰ ਰੋਜ਼ਾਨਾ ਜੀਵਨ ਵਿੱਚ ਮਾਨਤਾ ਪ੍ਰਾਪਤ, ਹਾਸਲ ਅਤੇ ਕਾਇਮ ਰਹਿਣ।',
  theory_body:'ਜਦੋਂ ਭਾਈਚਾਰੇ ਕਾਰਵਾਈ ਕਰਦੇ ਹਨ ਅਤੇ ਪ੍ਰਣਾਲੀਆਂ ਇਕੱਠੇ ਹੋ ਕੇ ਜਵਾਬ ਦਿੰਦੀਆਂ ਹਨ, ਤਾਂ ਬੱਚਿਆਂ ਦਾ ਬਚਾਅ, ਵਿਕਾਸ, ਸੁਰੱਖਿਆ ਅਤੇ ਭਾਗੀਦਾਰੀ ਸਾਕਾਰ ਹੁੰਦੀ ਹੈ ਅਤੇ ਕਾਇਮ ਰਹਿੰਦੀ ਹੈ।',
  eyebrow_work:'ਅਸੀਂ ਕੀ ਕਰਦੇ ਹਾਂ', work_head:'ਚਾਰ ਮੋਰਚੇ, ਇੱਕ ਸਾਂਝਾ ਜਵਾਬ।',
  eyebrow_where:'ਅਸੀਂ ਕਿੱਥੇ ਕੰਮ ਕਰਦੇ ਹਾਂ', where_head:'23 ਜ਼ਿਲ੍ਹੇ। 2 ਰਾਜ। ਇੱਕ ਸਰਹੱਦ।',
  where_sub:'ਅਸੀਂ ਉੱਤਰ ਪ੍ਰਦੇਸ਼ ਅਤੇ ਮਹਾਰਾਸ਼ਟਰ ਵਿੱਚ ਪੂਰਬੀ ਭਾਰਤ-ਨੇਪਾਲ ਸਰਹੱਦ ਦੇ ਨਾਲ-ਨਾਲ ਕੰਮ ਕਰਦੇ ਹਾਂ — ਅਜਿਹੇ ਖੇਤਰ ਜੋ ਸਾਂਝੀ ਸੰਰਚਨਾਤਮਕ ਕਮਜ਼ੋਰੀ ਨਾਲ ਬੱਝੇ ਹੋਏ ਹਨ। ਜ਼ਮੀਨੀ ਹਕੀਕਤ ਦੇਖਣ ਲਈ ਕਿਸੇ ਜ਼ਿਲ੍ਹੇ ਉੱਤੇ ਟੈਪ ਕਰੋ।',
  eyebrow_cycle:'ਸੰਰਚਨਾਤਮਕ ਕਮਜ਼ੋਰੀ ਦਾ ਚੱਕਰ', cycle_head:'ਖ਼ਤਰੇ ਇਕੱਲੇ ਨਹੀਂ ਆਉਂਦੇ।',
  cycle_sub:'ਇਹ ਪੀੜ੍ਹੀ ਦਰ ਪੀੜ੍ਹੀ ਇੱਕ-ਦੂਜੇ ਨੂੰ ਹੋਰ ਮਜ਼ਬੂਤ ਕਰਦੇ ਹਨ — ਜਦੋਂ ਤੱਕ ਪ੍ਰਣਾਲੀਆਂ ਸਮੇਂ ਸਿਰ ਜਵਾਬ ਨਾ ਦੇਣ। ਕੋਈ ਨਿਸ਼ਚਿਤ ਕ੍ਰਮ ਨਹੀਂ ਹੈ: ਕਿਸੇ ਵੀ ਬੱਚੇ ਲਈ, ਇਹ ਜਾਲ ਕਿਸੇ ਵੀ ਬਿੰਦੂ ਤੋਂ ਸ਼ੁਰੂ ਹੋ ਸਕਦਾ ਹੈ, ਅਤੇ ਹਰ ਖ਼ਤਰਾ ਅਗਲੇ ਨੂੰ ਹੋਰ ਨੇੜੇ ਖਿੱਚ ਲਿਆਉਂਦਾ ਹੈ।',
  cycle_pick:'ਇਹ ਦੇਖਣ ਲਈ ਕਿ ਇੱਕ ਜ਼ਿੰਦਗੀ ਕਿਵੇਂ ਘੜੀ ਜਾਂਦੀ ਹੈ, ਕਿਸੇ ਵੀ ਪਲ ਉੱਤੇ ਟੈਪ ਕਰੋ।',
  cycle_note:'ਹਰ ਅੰਕੜਾ ਉੱਤਰ ਪ੍ਰਦੇਸ਼ ਦੀ ਭਾਰਤ-ਨੇਪਾਲ ਤਰਾਈ ਪੱਟੀ ਦੇ ਸੱਤ ਜ਼ਿਲ੍ਹਿਆਂ — ਬਹਿਰਾਇਚ, ਸ਼੍ਰਾਵਸਤੀ, ਬਲਰਾਮਪੁਰ, ਲਖੀਮਪੁਰ ਖੀਰੀ, ਸਿੱਧਾਰਥਨਗਰ, ਮਹਾਰਾਜਗੰਜ ਅਤੇ ਕੁਸ਼ੀਨਗਰ — ਵਿੱਚ ਦਰਜ ਸਭ ਤੋਂ ਖ਼ਰਾਬ ਮੁੱਲ ਹੈ। ਸਰੋਤ: ਸਿਹਤ, ਪੋਸ਼ਣ ਅਤੇ ਲਿੰਗ ਲਈ ਰਾਸ਼ਟਰੀ ਪਰਿਵਾਰ ਸਿਹਤ ਸਰਵੇਖਣ 5 (2019–21) ਦਾ ਜ਼ਿਲ੍ਹਾ ਤੱਥ-ਸ਼ੀਟ ਡਾਟਾਸੈੱਟ (ਸਿਹਤ ਅਤੇ ਪਰਿਵਾਰ ਭਲਾਈ ਮੰਤਰਾਲਾ / ਇੰਟਰਨੈਸ਼ਨਲ ਇੰਸਟੀਚਿਊਟ ਫਾਰ ਪਾਪੂਲੇਸ਼ਨ ਸਾਇੰਸਿਜ਼); ਸਿੱਖਿਆ ਲਈ ਯੂਨੀਫਾਈਡ ਡਿਸਟ੍ਰਿਕਟ ਇਨਫਰਮੇਸ਼ਨ ਸਿਸਟਮ ਫਾਰ ਐਜੂਕੇਸ਼ਨ ਪਲੱਸ ਦੀਆਂ ਜ਼ਿਲ੍ਹਾ ਤੱਥ-ਸ਼ੀਟਾਂ; ਅਤੇ ਜਣੇਪਾ ਮੌਤ ਦਰ ਲਈ ਸੈਂਪਲ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਸਿਸਟਮ, ਜੋ ਰਾਜ-ਪੱਧਰੀ ਹੈ। ਹਰ ਸਿਹਤ ਅੰਕੜਾ ਇੱਕੋ ਸਰਵੇਖਣ ਗੇੜ ਤੋਂ ਲਿਆ ਗਿਆ ਹੈ, ਜਿਸ ਕਰਕੇ ਜ਼ਿਲ੍ਹਿਆਂ ਦੀ ਤੁਲਨਾ ਬਰਾਬਰ ਆਧਾਰ ਉੱਤੇ ਹੁੰਦੀ ਹੈ। ਪਤੀ-ਪਤਨੀ ਹਿੰਸਾ ਸਿਰਫ਼ ਰਾਸ਼ਟਰੀ ਪਰਿਵਾਰ ਸਿਹਤ ਸਰਵੇਖਣ ਦੇ ਰਾਜ ਮਾਡਿਊਲ ਵਿੱਚ ਹੀ ਇਕੱਠੀ ਕੀਤੀ ਜਾਂਦੀ ਹੈ ਅਤੇ ਉੱਤਰ ਪ੍ਰਦੇਸ਼ ਦੇ ਅੰਕੜੇ ਵਜੋਂ ਦਿਖਾਈ ਗਈ ਹੈ। ਚਾਰ ਪਲ — ਬਾਲ ਮਜ਼ਦੂਰੀ, ਸਭ ਤੋਂ ਗਰੀਬ ਧਨ ਵਰਗ, ਅਤੇ ਬਾਲ ਤੇ 5 ਸਾਲ ਤੋਂ ਘੱਟ ਉਮਰ ਦੀ ਮੌਤ ਦਰ — ਅਜਿਹੇ ਰਿਕਾਰਡਾਂ ਉੱਤੇ ਟਿਕੇ ਹਨ ਜੋ ਅਜੇ ਮੁੜ-ਪੁਸ਼ਟੀ ਦੀ ਉਡੀਕ ਵਿੱਚ ਹਨ, ਅਤੇ ਇਹ ਗੱਲ ਸਪਸ਼ਟ ਕੀਤੀ ਗਈ ਹੈ। ਭਾਰਤ ਬਾਲ ਜਾਂ 5 ਸਾਲ ਤੋਂ ਘੱਟ ਉਮਰ ਦੀ ਮੌਤ ਦਰ ਲਈ ਕੋਈ ਅਧਿਕਾਰਤ ਜ਼ਿਲ੍ਹਾ ਲੜੀ ਪ੍ਰਕਾਸ਼ਿਤ ਨਹੀਂ ਕਰਦਾ। ਹਰ ਪਲ ਆਪਣਾ ਜ਼ਿਲ੍ਹਾ ਅਤੇ ਸਰੋਤ ਦੱਸਦਾ ਹੈ।',
  eyebrow_process:'ਪ੍ਰਕਿਰਿਆ', process_head:'ਜਦੋਂ ਭਾਈਚਾਰੇ ਕਾਰਵਾਈ ਕਰਦੇ ਹਨ, ਪ੍ਰਣਾਲੀਆਂ ਜਵਾਬ ਦਿੰਦੀਆਂ ਹਨ।', eyebrow_stories:'ਤਬਦੀਲੀ ਦੀਆਂ ਕਹਾਣੀਆਂ',
  cta_donate:'ਨਿਵੇਸ਼ ਕਰੋ', cta_donate_b:'ਭਾਈਚਾਰਕ ਅਗਵਾਈ ਵਾਲੇ ਕੰਮ ਦੀ ਪੂੰਜੀ ਜਾਂ ਸਮੱਗਰੀ, ਆਨਲਾਈਨ ਜਾਂ ਆਫਲਾਈਨ ਰਾਹੀਂ ਮਦਦ ਕਰੋ।', cta_donate_a:'ਹੁਣੇ ਨਿਵੇਸ਼ ਕਰੋ',
  cta_vol:'ਸਵੈਸੇਵਕ ਬਣੋ', cta_vol_b:'ਇੰਟਰਨ ਬਣੋ, ਵਰਚੁਅਲ ਕੰਮ ਕਰੋ, ਜਾਂ DEHAT ਫੈਲੋ ਬਣੋ।', cta_vol_a:'ਸਾਡੇ ਨਾਲ ਜੁੜੋ',
  cta_partner:'ਭਾਈਵਾਲ ਬਣੋ', cta_partner_b:'ਕਾਰਪੋਰੇਟ, ਅਕਾਦਮਿਕ, ਜਾਂ ਸੰਸਥਾਗਤ ਭਾਈਵਾਲੀਆਂ।', cta_partner_a:'ਸਹਿਯੋਗ ਕਰੋ',
  pillar_link_work:'ਚਾਰੇ ਪ੍ਰੋਗਰਾਮ ਦੇਖੋ', pillar_link_how:'ਦੇਖੋ ਅਸੀਂ ਕਿਵੇਂ ਕੰਮ ਕਰਦੇ ਹਾਂ', stories_all:'ਸਾਰੀਆਂ ਕਹਾਣੀਆਂ ਪੜ੍ਹੋ',
  work_title:'ਅਧਿਕਾਰ, ਰੋਜ਼ਾਨਾ ਜੀਵਨ ਵਿੱਚ ਸਾਕਾਰ।',
  chrono_title:'ਹਰ ਪ੍ਰੋਜੈਕਟ, ਸਮੇਂ ਦੇ ਕ੍ਰਮ ਵਿੱਚ',
  count_label:'ਰਿਕਾਰਡ ਉੱਤੇ ਪ੍ਰੋਜੈਕਟ',
  open_programme:'ਪ੍ਰੋਗਰਾਮ ਖੋਲ੍ਹੋ',
  work_sub:'ਚਾਰ ਪ੍ਰੋਗਰਾਮ, ਉਨ੍ਹਾਂ ਦੇ ਸ਼ੁਰੂ ਹੋਣ ਦੇ ਕ੍ਰਮ ਵਿੱਚ। ਹਰ ਇੱਕ ਆਪਣੇ ਸਫ਼ੇ ਉੱਤੇ ਖੁੱਲ੍ਹਦਾ ਹੈ — ਇਹ ਕੰਮ ਕਿਉਂ ਮੌਜੂਦ ਹੈ, ਇਹ ਕਿਵੇਂ ਬਣਿਆ ਹੈ, ਅਤੇ ਇਸ ਨੇ ਨਿਭਾਏ ਹਰ ਪ੍ਰੋਜੈਕਟ ਦਾ ਵੇਰਵਾ, ਸਮੇਂ ਦੇ ਕ੍ਰਮ ਵਿੱਚ, ਹਰ ਇੱਕ ਪਿੱਛੇ ਕੀ, ਕਿੱਥੇ, ਕਿਵੇਂ, ਕਦੋਂ, ਕਿਉਂ ਅਤੇ ਨਿਵੇਸ਼ ਸਮੇਤ।',
  portfolio_total:'ਜਨਤਕ ਰਿਕਾਰਡ ਉੱਤੇ ਪ੍ਰੋਜੈਕਟ', portfolio_investment:'ਕੁੱਲ ਸਮਾਜਿਕ ਨਿਵੇਸ਼',
  portfolio_count:'ਚਾਰ ਪ੍ਰੋਗਰਾਮਾਂ ਵਿੱਚ ਪ੍ਰੋਜੈਕਟ',
  filter_year:'ਸਾਲ', filter_state:'ਰਾਜ', filter_district:'ਜ਼ਿਲ੍ਹਾ', filter_sdg:'ਵਿਕਾਸ ਟੀਚਾ', filter_csr:'ਕਾਰਪੋਰੇਟ ਸਮਾਜਿਕ ਜ਼ਿੰਮੇਵਾਰੀ · ਅਨੁਸੂਚੀ VII', filter_uncrc:'ਬਾਲ ਅਧਿਕਾਰ', filter_investor:'ਸਮਾਜਿਕ ਨਿਵੇਸ਼ਕ', filter_all:'ਸਾਰੇ',
  open_details:'ਪੂਰਾ ਰਿਕਾਰਡ ਖੋਲ੍ਹੋ', close_details:'ਰਿਕਾਰਡ ਬੰਦ ਕਰੋ', phases_label:'ਪੜਾਅ',
  annual_label:'ਸਾਲ ਦਰ ਸਾਲ',
  cross_from:'ਇਸ ਦਾ ਵੀ ਹਿੱਸਾ',
  shared_note:'ਸਾਂਝਾ ਸਮਾਜਿਕ ਨਿਵੇਸ਼ ਦਾਇਰਾ:',
  d_what:'ਉਹ ਤਬਦੀਲੀ ਜੋ ਅਸੀਂ ਲਿਆਉਣ ਦਾ ਟੀਚਾ ਰੱਖਿਆ', d_why:'ਇੱਥੇ ਇਹ ਕਿਉਂ ਮਹੱਤਵਪੂਰਨ ਸੀ',
  d_how:'ਭਾਈਚਾਰਿਆਂ ਅਤੇ ਪ੍ਰਣਾਲੀਆਂ ਨੇ ਮਿਲ ਕੇ ਕਿਵੇਂ ਕੰਮ ਕੀਤਾ', d_impact:'ਪ੍ਰਭਾਵ ਅੰਕੜੇ',
  d_investor:'ਸਮਾਜਿਕ ਨਿਵੇਸ਼ਕ', d_investors:'ਸਮਾਜਿਕ ਨਿਵੇਸ਼ਕ', d_investment:'ਸਮਾਜਿਕ ਨਿਵੇਸ਼',
  m_when:'ਕਦੋਂ ਅਤੇ ਸਥਿਤੀ', m_location:'ਕਿੱਥੇ', m_sdg:'ਵਿਕਾਸ ਟੀਚੇ', m_csr:'ਕਾਰਪੋਰੇਟ ਸਮਾਜਿਕ ਜ਼ਿੰਮੇਵਾਰੀ · ਅਨੁਸੂਚੀ VII', m_uncrc:'ਬੱਚੇ ਦੇ ਅਧਿਕਾਰ', m_law:'ਭਾਰਤੀ ਕਾਨੂੰਨ ਅਤੇ ਨੀਤੀ ਆਧਾਰ', m_law_none:'ਇਸ ਪ੍ਰੋਜੈਕਟ ਲਈ ਕੋਈ ਇਕਹਿਰਾ ਕਾਨੂੰਨੀ ਆਧਾਰ ਦਰਜ ਨਹੀਂ ਹੈ।',
  invest_note:'ਬਿਲਕੁਲ ਜਿਵੇਂ ਦਸਤਾਵੇਜ਼ੀ ਕੀਤਾ ਗਿਆ, ਉਸੇ ਤਰ੍ਹਾਂ ਪ੍ਰਕਾਸ਼ਿਤ; ਇਕੱਠਾ ਨਹੀਂ ਕੀਤਾ ਗਿਆ।',
  impact_eyebrow:'ਪ੍ਰਭਾਵ', impact_title:'2000 ਤੋਂ, ਭਾਈਚਾਰਿਆਂ ਦੇ ਨਾਲ ਖੜ੍ਹੇ ਹੋ ਕੇ ਜਿਵੇਂ ਉਹ ਆਪਣੇ ਅਧਿਕਾਰਾਂ ਦਾ ਦਾਅਵਾ ਕਰਦੇ ਹਨ ਅਤੇ ਉਨ੍ਹਾਂ ਨੂੰ ਪੂਰਾ ਕਰਨ ਲਈ ਜਨਤਕ ਪ੍ਰਣਾਲੀਆਂ ਨਾਲ ਭਾਈਵਾਲੀ ਵਿੱਚ ਕੰਮ ਕਰਦੇ ਹਨ।',
  impact_sub:'1989 ਵਿੱਚ ਇੱਕ ਨੌਜਵਾਨ ਸਮੂਹ ਵਜੋਂ ਸ਼ੁਰੂ ਹੋਇਆ, 2000 ਵਿੱਚ ਰਜਿਸਟਰਡ ਹੋਇਆ। ਇਹ ਅੰਕੜੇ ਪੈਮਾਨਾ ਦਿਖਾਉਂਦੇ ਹਨ; ਇਨ੍ਹਾਂ ਪਿੱਛੇ ਭਾਈਚਾਰੇ, ਫੀਲਡ ਵਰਕਰ ਅਤੇ ਜਨਤਕ ਸੰਸਥਾਵਾਂ ਮਿਲ ਕੇ ਕੰਮ ਕਰਦੀਆਂ ਹਨ।',
  reach_head:'ਹੁਣ ਤੱਕ ਦੀ ਭੂਗੋਲਿਕ ਪਹੁੰਚ', reach_states:'ਰਾਜ', reach_districts:'ਜ਼ਿਲ੍ਹੇ', reach_blocks:'ਬਲਾਕ', reach_villages:'ਪਿੰਡ', reach_children:'ਬੱਚੇ ਅਤੇ ਕਿਸ਼ੋਰ', reach_farmers:'ਮਹਿਲਾ ਕਿਸਾਨ',
  stories_eyebrow:'ਤਬਦੀਲੀ ਦੀਆਂ ਕਹਾਣੀਆਂ', stories_title:'ਹਕੀਕਤ, ਫਿਰ ਤਬਦੀਲੀ।',
  stories_sub:'ਹਰ ਕੇਸ ਕਹਾਣੀ ਚਾਰ ਬਾਲ ਅਧਿਕਾਰਾਂ — ਬਚਾਅ, ਵਿਕਾਸ, ਸੁਰੱਖਿਆ, ਭਾਗੀਦਾਰੀ — ਵਿੱਚੋਂ ਇੱਕ ਦੇ ਦੁਆਲੇ ਬਣਾਈ ਗਈ ਹੈ।',
  involved_eyebrow:'ਸ਼ਾਮਲ ਹੋਵੋ', involved_title:'ਮੌਜੂਦਾ ਤਾਕਤ ਨੂੰ ਸਾਕਾਰ ਕਰੋ — ਸਾਡੇ ਨਾਲ।',
  involved_sub:'ਭਾਵੇਂ ਤੁਸੀਂ ਇੱਕ ਘੰਟਾ ਦਿਓ, ਇੱਕ ਹੁਨਰ ਜਾਂ ਇੱਕ ਰੁਪਿਆ, ਤੁਸੀਂ ਉਸ ਪ੍ਰਣਾਲੀ ਦਾ ਹਿੱਸਾ ਬਣ ਜਾਂਦੇ ਹੋ ਜੋ ਜਵਾਬ ਦਿੰਦੀ ਹੈ।',
  involved_cta_title:'ਭਾਈਚਾਰਿਆਂ ਦੇ ਨਾਲ ਨਿਵੇਸ਼ ਕਰੋ।',
  involved_cta_sub:'ਪੂੰਜੀ ਜਾਂ ਸਮੱਗਰੀ, ਆਨਲਾਈਨ ਜਾਂ ਆਫਲਾਈਨ — ਹਰ ਰੁਪਿਆ ਉਸ ਸਮਰੱਥਾ ਵਿੱਚ ਜਾਂਦਾ ਹੈ ਜੋ ਭਾਈਚਾਰੇ ਸਾਡੇ ਜਾਣ ਤੋਂ ਬਾਅਦ ਵੀ ਕਾਇਮ ਰੱਖਦੇ ਹਨ।',
  donate_now:'ਭਾਈਵਾਲੀ ਸ਼ੁਰੂ ਕਰੋ', email_us:'ਸਾਨੂੰ ਈਮੇਲ ਕਰੋ', f_email:'ਈਮੇਲ', f_phone:'ਫੋਨ', f_web:'ਵੈੱਬ', f_address:'ਪਤਾ',
  nav_finance:'ਪਾਰਦਰਸ਼ਤਾ', nav_answers:'ਜਵਾਬ',
  fin_eyebrow:'ਵਿੱਤੀ ਪਾਰਦਰਸ਼ਤਾ', fin_title:'ਹਰ ਰੁਪਿਆ, ਰਿਕਾਰਡ ਉੱਤੇ।',
  fin_sub:'ਸੁਤੰਤਰ ਤੌਰ ਉੱਤੇ ਆਡਿਟ ਕੀਤੇ ਖਾਤੇ — ਨਿਵੇਸ਼ ਭਾਈਵਾਲਾਂ ਨੇ ਕੀ ਵਚਨਬੱਧ ਕੀਤਾ, ਕੰਮ ਤੱਕ ਕੀ ਪਹੁੰਚਿਆ, ਅਤੇ ਦੋਵਾਂ ਪਿੱਛੇ ਕਾਨੂੰਨੀ ਜਾਂਚਾਂ। ਹਰ ਅੰਕੜਾ ਇੱਕ ਦਸਤਖਤੀ ਬੈਲੰਸ ਸ਼ੀਟ ਤੋਂ ਲਿਆ ਗਿਆ ਹੈ।',
  fin_stat_received:'20 ਸਾਲਾਂ ਵਿੱਚ ਵਚਨਬੱਧ', fin_stat_fcra:'ਵਿਦੇਸ਼ੀ ਯੋਗਦਾਨ · ਫਾਰਨ ਕੰਟ੍ਰੀਬਿਊਸ਼ਨ (ਰੈਗੂਲੇਸ਼ਨ) ਐਕਟ', fin_stat_inr:'ਘਰੇਲੂ ਯੋਗਦਾਨ · ਭਾਰਤੀ ਰੁਪਏ', fin_stat_funders:'ਰਿਕਾਰਡ ਉੱਤੇ ਨਿਵੇਸ਼ ਭਾਈਵਾਲ',
  fin_years_head:'ਸਾਲ ਦਰ ਸਾਲ', fin_years_sub:'ਕੀ ਆਇਆ, ਕੀ ਖਰਚ ਹੋਇਆ, ਅਤੇ ਖਾਤਿਆਂ ਉੱਤੇ ਕਿਸ ਨੇ ਦਸਤਖਤ ਕੀਤੇ। ਕਿਸੇ ਸਾਲ ਦੇ ਨਿਵੇਸ਼ਕ ਦੇਖਣ ਲਈ ਉਹ ਸਾਲ ਚੁਣੋ।',
  fin_received:'ਵਚਨਬੱਧ', fin_utilised:'ਖਰਚੇ ਗਏ', fin_auditor:'ਆਡੀਟਰ', fin_bs:'ਬੈਲੰਸ ਸ਼ੀਟ', fin_surplus:'ਵਾਧੂ', fin_deficit:'ਘਾਟਾ', fin_partial:'ਅਧੂਰਾ ਡਾਟਾ', fin_compiled:'ਸੰਕਲਿਤ',
  fin_funders_head:'ਇਸ ਕੰਮ ਵਿੱਚ ਕੌਣ ਨਿਵੇਸ਼ ਕਰਦਾ ਹੈ', fin_funders_sub:'ਉਹ ਸੰਸਥਾਵਾਂ ਅਤੇ ਵਿਅਕਤੀ ਜਿਨ੍ਹਾਂ ਦੀ ਪੂੰਜੀ ਇਸ ਕੰਮ ਨੂੰ ਤਾਕਤ ਦਿੰਦੀ ਹੈ — ਇੱਕ ਸਾਂਝੇ ਨਤੀਜੇ ਵਿੱਚ ਭਾਈਵਾਲ, ਇੱਕ-ਪਾਸੜ ਦਾਨੀ ਨਹੀਂ। ਕਾਨੂੰਨ ਦੀ ਲੋੜ ਅਨੁਸਾਰ, ਵਿਦੇਸ਼ੀ ਯੋਗਦਾਨ ਇੱਕ ਵੱਖਰੇ ਫਾਰਨ ਕੰਟ੍ਰੀਬਿਊਸ਼ਨ (ਰੈਗੂਲੇਸ਼ਨ) ਐਕਟ ਖਾਤੇ ਵਿੱਚ ਰੱਖੇ ਅਤੇ ਆਡਿਟ ਕੀਤੇ ਜਾਂਦੇ ਹਨ; ਘਰੇਲੂ ਫੰਡ ਰੁਪਏ ਦੇ ਖਾਤਿਆਂ ਰਾਹੀਂ ਚੱਲਦੇ ਹਨ।',
  fin_regime_fcra:'ਫਾਰਨ ਕੰਟ੍ਰੀਬਿਊਸ਼ਨ (ਰੈਗੂਲੇਸ਼ਨ) ਐਕਟ · ਵਿਦੇਸ਼ੀ', fin_regime_inr:'ਭਾਰਤੀ ਰੁਪਿਆ · ਘਰੇਲੂ',
  fin_funders_cta:'ਸਾਰੇ ਭਾਈਵਾਲ ਦੇਖੋ',
  fin_compliance_head:'ਕਾਨੂੰਨੀ ਪਾਲਣਾ', fin_compliance_sub:'DEHAT ਇੱਕ ਰਜਿਸਟਰਡ ਸੋਸਾਇਟੀ ਹੈ (ਸੋਸਾਇਟੀਜ਼ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਐਕਟ, 1860)। ਹੇਠਾਂ ਉਹ ਸਾਲਾਨਾ ਜਵਾਬਦੇਹੀ ਚੱਕਰ ਹੈ ਜਿਸ ਦੀ ਇੱਕ ਸਮੀਖਿਅਕ ਉਮੀਦ ਰੱਖਦਾ ਹੈ — ਅਤੇ ਜੋ DEHAT ਦਾਖਲ ਕਰਦਾ ਹੈ।',
  fin_reg_head:'ਰਜਿਸਟ੍ਰੇਸ਼ਨਾਂ', fin_cal_head:'ਸਾਲਾਨਾ ਫਾਈਲਿੰਗ ਕੈਲੰਡਰ', fin_rules_head:'ਅਸੀਂ ਕਿਹੜੇ ਨਿਯਮਾਂ ਦੇ ਵਿਰੁੱਧ ਰਿਪੋਰਟ ਕਰਦੇ ਹਾਂ',
  fin_auditor_trail:'ਹਰ ਸਾਲ ਇੱਕ ਪ੍ਰੈਕਟਿਸਿੰਗ ਚਾਰਟਰਡ ਅਕਾਊਂਟੈਂਟ ਦੁਆਰਾ ਆਡਿਟ ਕੀਤਾ ਅਤੇ ਯੂਨੀਕ ਡਾਕੂਮੈਂਟ ਆਈਡੈਂਟੀਫਿਕੇਸ਼ਨ ਨੰਬਰ ਨਾਲ ਦਸਤਖਤੀ। ਪਿਛਲੇ ਦਹਾਕੇ ਵਿੱਚ ਪੰਜ ਵੱਖ-ਵੱਖ ਫਰਮਾਂ ਨੇ ਖਾਤਿਆਂ ਦੀ ਜਾਂਚ ਕੀਤੀ ਹੈ — ਕੋਈ ਇੱਕ ਲੰਬੇ-ਸਮੇਂ ਦਾ ਸੰਬੰਧ ਨਹੀਂ।',
  fin_due:'ਦੇਣ ਦੀ ਤਾਰੀਖ', fin_year_funders:'ਇਸ ਸਾਲ ਦੇ ਨਿਵੇਸ਼ ਭਾਈਵਾਲ',
  fin_docs_head:'ਪ੍ਰਮਾਣ ਪੱਤਰ ਅਤੇ ਦਸਤਾਵੇਜ਼', fin_docs_sub:'ਹਰ ਰਜਿਸਟ੍ਰੇਸ਼ਨ, ਮਨਜ਼ੂਰੀ ਅਤੇ ਤੀਜੀ-ਧਿਰ ਪ੍ਰਮਾਣਿਕਤਾ — ਅਸਲ ਸਰਟੀਫਿਕੇਟ ਤੋਂ ਸਕੈਨ ਕੀਤੀ ਗਈ। ਮੂਲ ਦਸਤਾਵੇਜ਼ ਪੜ੍ਹਨ ਲਈ ਕੋਈ ਵੀ ਖੋਲ੍ਹੋ।',
  fin_docg_statutory:'ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਅਤੇ ਟੈਕਸ', fin_docg_fcra:'ਵਿਦੇਸ਼ੀ ਯੋਗਦਾਨ · ਫਾਰਨ ਕੰਟ੍ਰੀਬਿਊਸ਼ਨ (ਰੈਗੂਲੇਸ਼ਨ) ਐਕਟ', fin_docg_validation:'ਪ੍ਰਮਾਣਿਕਤਾਵਾਂ ਅਤੇ ਮਾਨਤਾਵਾਂ',
  fin_doc_view:'ਦਸਤਾਵੇਜ਼ ਦੇਖੋ', fin_pending_label:'ਆਡਿਟ ਕੀਤਾ ਸਕੈਨ ਫਾਈਲ ਉੱਤੇ ਮੌਜੂਦ — ਅੰਕੜੇ ਡਿਜੀਟਲ ਕੀਤੇ ਜਾ ਰਹੇ ਹਨ',
  foot_explore:'ਖੋਜੋ', foot_reach:'ਸਾਡੇ ਤੱਕ ਪਹੁੰਚੋ', foot_follow:'ਕੰਮ ਨਾਲ ਜੁੜੇ ਰਹੋ',
  foot_desc:'ਮਨੁੱਖੀ ਉੱਨਤੀ ਲਈ ਵਿਕਾਸ ਸੰਗਠਨ — ਭਾਈਚਾਰਿਆਂ ਅਤੇ ਪ੍ਰਣਾਲੀਆਂ ਨਾਲ ਕੰਮ ਤਾਂ ਜੋ ਬੱਚਿਆਂ ਦੇ ਅਧਿਕਾਰ ਮਾਨਤਾ ਪ੍ਰਾਪਤ, ਹਾਸਲ ਅਤੇ ਕਾਇਮ ਰਹਿਣ।',
  foot_rights:'© 2026 DEHAT · 1989 ਵਿੱਚ ਇੱਕ ਨੌਜਵਾਨ ਸਮੂਹ ਵਜੋਂ ਸ਼ੁਰੂ ਹੋਇਆ · 2000 ਵਿੱਚ ਰਜਿਸਟਰਡ',
    };
    const DOI = {
foot_policies:'नीतियां ते सुरक्षा उपाय', foot_cookies:'कुकी सेटिंग्स',
      nav_home:'मुक्ख पन्ना', nav_who:'असां कुण आं', nav_work:'साढ़ा कम्म', nav_impact:'प्रभाव', nav_stories:'कहाणियां', nav_media:'मीडिया', nav_involved:'साथै जुड़ो',
      donate:'निवेश करो', since:'1989 थमां', org_full:'मानव उत्थान आस्तै विकास संगठन',
      language:'भाषा', lang_indian:'भारतीय भाषां', lang_global:'वैश्विक (यूएन)',
      hero_title_a:'इक बाल-केंद्रित समाज जित्थै हर बच्चा अपने ', hero_title_b:'हक्कां', hero_title_c:' गी हासल करदा ऐ — सुरक्खत, सम्मानित ते सम्पूर्ण।',
      hero_sub:'असां भारत-नेपाल तराई इलाके च समुदायें ते लोक तंत्रां सोगी कम्म करदे आं तां जे बच्चें दे हक्क सिर्फ कागज़ें उप्पर नेईं रौह्न, सगुआं रोज़मर्रा दी ज़िंदगी च पछाते, हासल ते कायम रक्खे जान।',
      hero_cta1:'समुदायें सोगी खड़े होओ', hero_cta2:'दिक्खो असां किस चाल्ली कम्म करदे आं', hero_photo:'फोटो — बाल पंचायत आगुआं, लोहरा गाँव, बहराइच',
      hero_principle:'भाईचारे कने सरकारी प्रबंधें कन्नै रलमिल्लियै, हर बच्चे आस्तै।',
      stat_children:'बच्चें ते किशोरें तिकर पुज्ज', stat_invested:'2000 थमां समुदायक तंत्रां च निवेश', stat_resources:'लोक संसाधन हासल', stat_districts:'2 राज्यें दे ज़िले',
      stat_hint:'चार आंकड़े लुके न। कुसै इक पर टैप करो।', stat_reveal:'दिक्खने आस्तै टैप करो', stat_hide:'लुकाओ', stat_reveal_all:'चारों दिक्खाओ', stat_hide_all:'सब लुकाओ', grid_reveal_all:'चौद्धें दिक्खाओ', grid_hint:'चौद्ध आंकड़े लुके न। कुसै इक पर टैप करो।', bl_drag:'सर्वेक्षण गी अग्गें खिच्चो',
      vision:'दृष्टि', mission:'लक्ष्य', theory:'बदलाव दा सिद्धांत',
      vision_body:'इक बाल-केंद्रित समाज जित्थै हर बच्चा अपने हक्क हासल करे ते सुरक्खत, सम्मानित ते सम्पूर्ण ज़िंदगी जिऐ।',
      mission_body:'समुदायें ते तंत्रां सोगी मिलियै मौजूदा शक्ति गी साकार करना, तां जे बच्चें दे हक्क रोज़मर्रा दी ज़िंदगी च पछाते, हासल ते कायम रौह्न।',
      theory_body:'जिसलै समुदाय कम्म करदे न ते तंत्र मिलियै जवाब दिंदे न, तां बच्चें दा जीण, विकास, सुरक्खा ते हिस्सेदारी साकार ते स्थायी होई जांदी ऐ।',
      eyebrow_work:'असां क्या करदे आं', work_head:'चार मोर्चे, इक साझा जवाब।',
      eyebrow_where:'असां कित्थै कम्म करदे आं', where_head:'23 ज़िले। 2 राज्य। इक सरहद्द।',
      where_sub:'असां उत्तर प्रदेश दी पूर्वी भारत-नेपाल सरहद्द ते महाराष्ट्र च कम्म करदे आं — इनें इलाकें गी इक साझी संरचनात्मक कमज़ोरी बंनी राक्खी ऐ। ज़मीनी हालात दिक्खने आस्तै कुसै ज़िले पर टैप करो।',
      eyebrow_cycle:'संरचनात्मक कमज़ोरी दा चक्कर', cycle_head:'खतरे कदी अकेल्ले नेईं औंदे।',
      cycle_sub:'एह् पीढ़ी-दर-पीढ़ी इक-दुए गी मज़बूत करदे न — जदूं तिकर तंत्र वक्त सिर जवाब नेईं दिंदे। कोई तय क्रम नेईं ऐ: कुसै बी बच्चे आस्तै एह् जाल कुसै बी बिंदु थमां शुरू होई सकदा ऐ, ते हर खतरा अगले गी होर नेड़े खिच्च लोंदा ऐ।',
      cycle_pick:'कोई बी पल टैप करियै दिक्खो जे इक ज़िंदगी किस चाल्ली घड़ी जांदी ऐ।',
      cycle_note:'हर आंकड़ा उत्तर प्रदेश दे भारत-नेपाल तराई पट्टी दे सत्त ज़िलें — बहराइच, श्रावस्ती, बलरामपुर, लखीमपुर खीरी, सिद्धार्थनगर, महराजगंज ते कुशीनगर — च दर्ज सबनें थमां माड़े आंकड़े गी दस्सदा ऐ। स्रोत: सेह्त, पोषण ते लिंग आस्तै राष्ट्रीय परिवार सेह्त सर्वेक्षण 5 (2019–21) दा ज़िला तथ्य-पत्र डेटासेट (सेह्त ते परिवार भलाई मंत्रालय / अंतर्राष्ट्रीय जनसंख्या विज्ञान संस्थान); पढ़ाई आस्तै एकीकृत ज़िला शिक्षा सूचना प्रणाली प्लस दे ज़िला तथ्य-पत्र; ते मातृ मृत्यु दर आस्तै नमूना पंजीकरण प्रणाली, जेह्ड़ी राज्य-स्तरी ऐ। सेह्त दा हर आंकड़ा इक्को सर्वेक्षण दौर थमां लैता गिया ऐ, इस करी ज़िलें दी तुलना बराबर आधार पर होंदी ऐ। पति-पत्नी हिंसा सिर्फ राष्ट्रीय परिवार सेह्त सर्वेक्षण दे राज्य-स्तरी हिस्से च दर्ज होंदी ऐ ते इत्थै उत्तर प्रदेश दे आंकड़े दे रूप च दस्सी गेई ऐ। चार पल — बाल श्रम, सबतूं गरीब आर्थिक वर्ग, ते शिशु ते पंज-ब’रे थमां घट्ट उमर दी मृत्यु दर — हाले मुड़ प्रमाणीकरण दी उडीक करा दे रिकार्डें उप्पर आधारत न, ते एह् गल्ल साफ दस्सी गेई ऐ। भारत शिशु या पंज-ब’रे थमां घट्ट उमर दी मृत्यु दर दी कोई सरकारी ज़िला-स्तरी लड़ी प्रकाशत नेईं करदा। हर पल अपणा ज़िला ते स्रोत दस्सदा ऐ।',
      eyebrow_process:'प्रक्रिया', process_head:'जिसलै समुदाय कम्म करदे न, तंत्र जवाब दिंदे न।', eyebrow_stories:'बदलाव दियां कहाणियां',
      cta_donate:'निवेश करो', cta_donate_b:'समुदाय दी अगुवाई आह्ले कम्म गी पूंजी जां सामान कन्नै, ऑनलाइन जां ऑफलाइन समर्थन देओ।', cta_donate_a:'हुण निवेश करो',
      cta_vol:'स्वैच्छिक सेवा', cta_vol_b:'इंटर्न बणो, वर्चुअल कम्म करो, जां DEHAT फैलो बणो।', cta_vol_a:'साढ़े सोगी जुड़ो',
      cta_partner:'भागीदार', cta_partner_b:'कॉर्पोरेट, अकादमिक जां संस्थागत भागीदारी।', cta_partner_a:'सहयोग करो',
      pillar_link_work:'चारों कार्यक्रम दिक्खो', pillar_link_how:'दिक्खो असां किस चाल्ली कम्म करदे आं', stories_all:'हर कहाणी पढ़ो',
      work_title:'हक्क, रोज़मर्रा दी ज़िंदगी च साकार।',
      chrono_title:'हर प्रोजैक्ट, कालक्रम अनुसार',
      count_label:'दर्जशुदा प्रोजैक्ट',
      open_programme:'कार्यक्रम खोह्लो',
      work_sub:'चार कार्यक्रम, जिस क्रम च ओह् शुरू होए। हर इक अपने अलग पन्ने पर खुह्लदा ऐ — काम की आस्तै ऐ, केह्ड़े ढंगै कन्नै बणेआ ऐ, ते इसने केह्ड़े-केह्ड़े प्रोजैक्ट चलाए न, कालक्रम अनुसार, हर इक दे पिच्छें दा क्या, कित्थै, किस चाल्ली, कदूं, कजो ते निवेश सोगी।',
      portfolio_total:'सार्वजनिक रिकार्ड पर प्रोजैक्ट', portfolio_investment:'कुल सामाजिक निवेश',
      portfolio_count:'चार कार्यक्रमें च प्रोजैक्ट',
      filter_year:'साल', filter_state:'राज्य', filter_district:'ज़िला', filter_sdg:'विकास लक्ष्य', filter_csr:'कॉर्पोरेट सामाजिक ज़िम्मेदारी · अनुसूची VII', filter_uncrc:'बाल अधिकार', filter_investor:'सामाजिक निवेशक', filter_all:'सब्भै',
      open_details:'पूरा रिकार्ड खोह्लो', close_details:'रिकार्ड बंद करो', phases_label:'चरण',
      annual_label:'साल-दर-साल',
      cross_from:'एह् बी हिस्सा ऐ',
      shared_note:'साझा सामाजिक निवेश दायरा:',
      d_what:'सांह् जेह्ड़ा बदलाव करना चाह्या', d_why:'इत्थै एह् गल्ल किंञा जरूरी ही',
      d_how:'समुदायें ते तंत्रां किस चाल्ली मिलियै कम्म कीता', d_impact:'प्रभाव आंकड़े',
      d_investor:'सामाजिक निवेशक', d_investors:'सामाजिक निवेशक', d_investment:'सामाजिक निवेश',
      m_when:'कदूं ते स्थिति', m_location:'कित्थै', m_sdg:'विकास लक्ष्य', m_csr:'कॉर्पोरेट सामाजिक ज़िम्मेदारी · अनुसूची VII', m_uncrc:'बाल दे अधिकार', m_law:'भारतीय कानून ते नीति आधार', m_law_none:'इस प्रोजैक्ट आस्तै कोई इक्कल्ला कानूनी आधार दर्ज नेईं ऐ।',
      invest_note:'जियां दर्ज ऐ तियां ई प्रकाशत; इक्कठे नेईं कीते गे।',
      impact_eyebrow:'प्रभाव', impact_title:'2000 थमां, समुदायें दे सोगी-सोगी, जिसलै ओह् अपणे हक्क मंगदे न ते लोक तंत्रां सोगी मिलियै उंदी पूर्ति आस्तै कम्म करदे न।',
      impact_sub:'1989 च नौजवानें दी इक टोली दे रूप च शुरूआत, 2000 च पंजीकृत। एह् आंकड़े पैमाना दस्सदे न; इंदे पिच्छें समुदाय, फील्ड कार्यकर्ता ते लोक संस्थां मिलियै कम्म करदियां न।',
      reach_head:'हुण तिकर भौगोलिक पुज्ज', reach_states:'राज्य', reach_districts:'ज़िले', reach_blocks:'ब्लॉक', reach_villages:'गांऽ', reach_children:'बच्चे ते किशोर', reach_farmers:'महिला किसान',
      stories_eyebrow:'बदलाव दियां कहाणियां', stories_title:'हकीकत, फिरी बदलाव।',
      stories_sub:'हर कहाणी चार बाल अधिकारें च शा इक दे इर्द-गिर्द ऐ — जीण, विकास, सुरक्खा, हिस्सेदारी।',
      involved_eyebrow:'साथै जुड़ो', involved_title:'मौजूदा शक्ति गी साकार करो — साढ़े सोगी।',
      involved_sub:'भांह् तुस इक घैंटा देओ, इक हुनर जां इक रुपया — तुस उस तंत्र दा हिस्सा बणी जांदे ओ जेह्ड़ा जवाब दिंदा ऐ।',
      involved_cta_title:'समुदायें दे सोगी निवेश करो।',
      involved_cta_sub:'पूंजी जां सामान, ऑनलाइन जां ऑफलाइन — हर रुपया उस समर्था च जुड़दा ऐ जेह्ड़ी समुदाय साढ़े जाने बाद बी रक्खी लैंदे न।',
      donate_now:'भागीदारी शुरू करो', email_us:'सांह् ई-मेल करो', f_email:'ई-मेल', f_phone:'फोन', f_web:'वेब', f_address:'पता',
      nav_finance:'पारदर्शिता', nav_answers:'जवाब',
      fin_eyebrow:'वित्तीय पारदर्शिता', fin_title:'हर रुपया, रिकार्ड उप्पर।',
      fin_sub:'स्वतंत्र रूप कन्नै अंकेक्षत लेखे — निवेश भागीदारें ने की प्रतिबद्ध कीता, कम्म तिकर की पुज्जेआ, ते दोनें दे पिच्छें दी कानूनी जांच। हर आंकड़ा इक हस्ताक्षरत बैलेंस शीट थमां लैता गिया ऐ।',
      fin_stat_received:'20 सालें च प्रतिबद्ध', fin_stat_fcra:'विदेशी अंशदान · विदेशी अंशदान (विनियमन) अधिनियम', fin_stat_inr:'घरेलू अंशदान · भारतीय रुपे', fin_stat_funders:'दर्जशुदा निवेश भागीदार',
      fin_years_head:'साल-दर-साल', fin_years_sub:'की आया, की खर्च होया, ते लेखें पर कुनें हस्ताक्षर कीते। साल चुनो ते उंदे सामाजिक निवेशक दिक्खो।',
      fin_received:'प्रतिबद्ध', fin_utilised:'लाया गिया', fin_auditor:'अंकेक्षक', fin_bs:'बैलेंस शीट', fin_surplus:'बचत', fin_deficit:'घाटा', fin_partial:'अधूरा आंकड़ा', fin_compiled:'संकलत',
      fin_funders_head:'इस कम्म च कुण निवेश करदा ऐ', fin_funders_sub:'ओह् संस्थां ते लोक जिंदी पूंजी इस कम्म गी ताकत दिंदी ऐ — इक साझे नतीजे दे भागीदार, नेईं जे इकतरफा दानी। कानून दी मंग मुताबक विदेशी अंशदान इक अलग विदेशी अंशदान (विनियमन) अधिनियम खाते च रक्खेआ ते अंकेक्षत कीता जांदा ऐ; घरेलू फंड रुपे आह्ले लेखें राहें चलदे न।',
      fin_regime_fcra:'विदेशी अंशदान (विनियमन) अधिनियम · विदेशी', fin_regime_inr:'भारतीय रुपया · घरेलू',
      fin_funders_cta:'हर भागीदार दिक्खो',
      fin_compliance_head:'कानूनी अनुपालन', fin_compliance_sub:'DEHAT इक पंजीकृत सोसाइटी ऐ (सोसाइटी पंजीकरण अधिनियम, 1860)। थल्लै साल्ली जवाबदेही दा चक्कर ऐ जेह्ड़ा इक समीक्षक दिक्खने दी उम्मीद रखदा ऐ — ते जेह्ड़ा DEHAT दाखल करदा ऐ।',
      fin_reg_head:'पंजीकरण', fin_cal_head:'साल्ली फाइलिंग कैलेंडर', fin_rules_head:'असां केह्दे खलाफ रिपोर्ट करदे आं',
      fin_auditor_trail:'हर साल इक कम्म करा दे चार्टर्ड अकाउंटेंट कोला अंकेक्षत, ते इक विशिष्ट दस्तावेज़ पछाण संख्या सोगी हस्ताक्षरत। पिछले दहाके च पंज बक्खरी-बक्खरी फर्में लेखें दी जांच कीती ऐ — कोई इक्कल्ला लम्मे वेल्लै दा रिश्ता नेईं।',
      fin_due:'देय', fin_year_funders:'इस साल दे निवेश भागीदार',
      fin_docs_head:'प्रमाण-पत्र ते दस्तावेज़', fin_docs_sub:'हर पंजीकरण, मंज़ूरी ते तीजी-धिर्रे दी पुष्टि — असली प्रमाण-पत्र थमां स्कैन कीती गेई। स्रोत दस्तावेज़ पढ़ने आस्तै कोई बी खोह्लो।',
      fin_docg_statutory:'पंजीकरण ते टैक्स', fin_docg_fcra:'विदेशी अंशदान · विदेशी अंशदान (विनियमन) अधिनियम', fin_docg_validation:'पुष्टि ते मान्यता',
      fin_doc_view:'दस्तावेज़ दिक्खो', fin_pending_label:'अंकेक्षत स्कैन दर्ज ऐ — आंकड़े डिजिटल कीते जा करदे न',
      foot_explore:'खोजो', foot_reach:'सांह् संपर्क करो', foot_follow:'कम्म कन्नै जुड़े रौह्ओ',
      foot_desc:'मानव उत्थान आस्तै विकास संगठन — समुदायें ते तंत्रां सोगी कम्म तां जे बच्चें दे हक्क पछाते, हासल ते कायम रौह्न।',
      foot_rights:'© 2026 DEHAT · 1989 च नौजवानें दी टोली दे रूप च शुरूआत · 2000 च पंजीकृत',
    };
    const BRX = {
foot_policies:'नीति आरो रैखा उपाय', foot_cookies:'कुकी सेटिंग',
      nav_home:'मुखि पेज', nav_who:'जोंग सोरनि', nav_work:'जोंगनि हाबा', nav_impact:'फिथाइ', nav_stories:'खाथिफोर', nav_media:'मिडिया', nav_involved:'सोदोब लाबो',
      donate:'निवेश खालाम', since:'1989 निफ्राय', org_full:'मानसिनि उन्नतिनि थाखाय विकास संघ',
      language:'रावनांथि', lang_indian:'भारतनि रावफोर', lang_global:'गुबुन दुनिया (यूएन)',
      hero_title_a:'गोदाननि गुदि थानाय समाज, बोसोर मोनसे गोदावा बेनि सिगांनि ', hero_title_b:'अधिकारखौ', hero_title_c:' मोनो — रैखा, सम्मान आरो गुदि।',
      hero_sub:'जोंग भारत-नेपाल तराई थांनायआव समाज आरो सरकारी तंत्रफोरनि सोदोब हाबा खालामो, बे थाखाय गोदावफोरनि अधिकारफोर बुखिआव मात्रा लिरनाय नङा, नित्थि जीवनआव मोनाय, थांनाय आरो रैखा जानाय गोसो।',
      hero_cta1:'समाजनि सोदोब सोलोंगो', hero_cta2:'जोंग मुं रोखोमआव हाबा खालामो सोलों', hero_photo:'फोटो — गोदान पार्लियामेंटनि आगजाफोर, लोहरा गामी, बहराइच',
      hero_principle:'समाज आरो सरकारि निथिनाय फोरमानि साथाय, गासैि गोदान गथ्थाय।',
      stat_children:'मोनाय गोदान आरो सानग्रा-सुबुंफोर', stat_invested:'2000 निफ्राय समाजनि तंत्रआव निवेश', stat_resources:'सरकारी सम्पत्ति मोनाय', stat_districts:'2 राज्यनि जिलाफोर',
      stat_hint:'सिरि आंखो, दुखु दंमोन। मोनसेखौ टेप खालामो सोलों।', stat_reveal:'सोलोंनोबो टेप खालाम', stat_hide:'दुखु', stat_reveal_all:'सिरियारि सोलोंगो', stat_hide_all:'बेफोरखौ दुखु', grid_reveal_all:'गोजोन-सिरियारि सोलोंगो', grid_hint:'गोजोन-सिरि आंखो, दुखु दंमोन। मोनसेखौ टेप खालामो सोलों।', bl_drag:'सर्भेखौ सिगांआव थां',
      vision:'लक्ष्य', mission:'मिसन', theory:'सोलायनायनि थियरी',
      vision_body:'गोदाननि गुदि थानाय समाज, बोसोर मोनसे गोदावा बेनि अधिकारखौ मोनो आरो रैखा, सम्मान आरो गुदि जीवन थानो।',
      mission_body:'समाज आरो तंत्रफोरनि सोदोब दंथि शक्तिखौ लांनाय, गोदावफोरनि अधिकारखौ नित्थि जीवनआव मोनाय, थांनाय आरो रैखा जानाय गोसो।',
      theory_body:'समाजफोरा हाबा खालामनाय आरो तंत्रफोरा सोदोब जबाब होनाय समनाव, गोदावफोरनि थानाय, बांनाय, रैखा आरो सोमोन्दोनि हाबाखौ मोनो आरो थायो।',
      eyebrow_work:'जोंग मुं खालामो', work_head:'सिरि हाबा, मोनसे सोदोब जबाब।',
      eyebrow_where:'जोंग बड़ोआव हाबा खालामो', where_head:'23 जिला। 2 राज्य। मोनसे सिमा।',
      where_sub:'जोंग उत्तर प्रदेशनि पूर्व भारत-नेपाल सिमा आरो महाराष्ट्रआव हाबा खालामो — बे बड़ोफोर मोनसे सोदोब संरचनात्मक गोसोखांथिआव फोतोर। बड़ोनि जमिनि हालत सोलोंनोबो जिला मोनसेखौ टेप खालाम।',
      eyebrow_cycle:'संरचनात्मक गोसोखांथिनि चक्र', cycle_head:'गोसोखांथिफोरा मोनसे-मोनसे जायो नङा।',
      cycle_sub:'बेफोरा उदांआव उदां सोमोन्दोनाव गोहोम गोहोम जायो — जदि तंत्रफोरा समयआव जबाब होया। मोनसे थिक क्रम गैया: जायनि गोदाव थाखायबो बे फांथाइआ जोबोद फारसेनिफ्राय जागोन, आरो मोनसे गोसोखांथिआ सिगां गोसोखांथिखौ गोदान लांगोन।',
      cycle_pick:'मोनसे समयखौ टेप खालाम आरो सोलोंगो जायनि जीवना बां जायो।',
      cycle_note:'सिगिरि आंखो उत्तर प्रदेशनि भारत-नेपाल तराई बेल्टनि सिनि जिलाफोर — बहराइच, श्रावस्ती, बलरामपुर, लखीमपुर खीरी, सिद्धार्थनगर, महराजगंज आरो कुशीनगरनि — सोमोन्दोनाव दर्ज जायोब्ला गोब्राब गोसोखांथिखौ सोलोंहाय। थां: फिथाइ, पुष्टि आरो लिंगनि थाखाय राष्ट्रीय गिबि फिथाइ सर्भे 5 (2019–21) जिलानि तथ्य-पत्र डाटासेट (फिथाइ आरो गिबि गोरोबथानि मंत्रालय / अंतर्राष्ट्रीय जनसंख्या विज्ञान संस्था); पड़ेनायनि थाखाय एकीकृत जिला शिक्षा सूचना प्रणाली प्लस जिलानि तथ्य-पत्र; आरो मां गोरोन्थिनि थाखाय नमूना पंजीकरण प्रणाली, जायखौ राज्य-लेबेलआव मोनो। जोबोद फिथाइनि आंखो मोनसे सर्भे राउंडनिफ्राय मोनो, बेनि थाखाय जिलाफोरखौ समान आधारआव तुलना खालामनाय जायो। सांथि गोर्बो-गोरोबथाइ खालि राष्ट्रीय गिबि फिथाइ सर्भेनि राज्य-लेबेल मोड्यूलआव दर्ज जायो आरो उत्तर प्रदेशनि आंख रोखोम सोलोंहायो। सिरि फांथाइ — गोदाव हाबा, जोबोद गोब्राब सोमाजिक बर्ग, आरो मां आरो 5-बोसोरनि गोर्बो-गोरोबथाइ — हाबियाव फिन-पुष्टि नांथि रेकर्डआव फोतोर, आरो बेखौ फोरमायो। भारता मां आबो 5-बोसोरनि गोर्बो-गोरोबथाइनि थाखाय जिला-लेबेलनि सरकारी सिरीज सोलोंआ। जोबोद फांथाइआ बेनि जिला आरो थां फोरमायो।',
      eyebrow_process:'सोदोब', process_head:'समाजफोरा हाबा खालामनाय समनाव, तंत्रफोरा जबाब होयो।', eyebrow_stories:'सोलायनायनि खाथिफोर',
      cta_donate:'निवेश खालाम', cta_donate_b:'समाज-लांनाय हाबाखौ रां एबा सामग्रीजों, ऑनलाइन एबा अफलाइनआव फुं।', cta_donate_a:'दानि निवेश खालाम',
      cta_vol:'सेवा', cta_vol_b:'इंटर्न जा, भर्चुयेलआव हाबा खालाम, एबा DEHAT फेलो जा।', cta_vol_a:'जोंगजों लाबो',
      cta_partner:'सोदोबसालि', cta_partner_b:'कर्पोरेट, शैक्षिक एबा संस्थानि सोदोबसालि।', cta_partner_a:'सोदोब हाबा खालाम',
      pillar_link_work:'सिरि हाबाफोरखौ सोलोंगो', pillar_link_how:'जोंग मुं रोखोमआव हाबा खालामो सोलों', stories_all:'जोबोद खाथिखौ पढ़',
      work_title:'अधिकार, नित्थि जीवनआव मोनजायो।',
      chrono_title:'जोबोद प्रजेक्ट, समयनि क्रमआव',
      count_label:'दर्ज प्रजेक्ट',
      open_programme:'प्रोग्राम खेव',
      work_sub:'सिरि प्रोग्राम, जायखौ जागायनाय क्रमआव। मोनसे-मोनसे बेनि गोबाव पेजआव खेवो — मुखांनायनि थाखाय हाबाखौ खालामनाय जायो, मुं रोखोमआव सोदोरनाय जायो, आरो जायोब्ला प्रजेक्टखौ लाबोनाय, समयनि क्रमआव, मुं, बड़ो, मुं रोखोमआव, समो, मुखांनाय आरो निवेशजों।',
      portfolio_total:'सरकारी रेकर्डआव प्रजेक्ट', portfolio_investment:'गुबुन सोमाजिक निवेश',
      portfolio_count:'सिरि प्रोग्रामआव प्रजेक्ट',
      filter_year:'बोसोर', filter_state:'राज्य', filter_district:'जिला', filter_sdg:'बांनायनि लक्ष्य', filter_csr:'कर्पोरेट सोमाजिक जिम्मा · अनुसूची VII', filter_uncrc:'गोदावनि अधिकार', filter_investor:'सोमाजिक निवेशक', filter_all:'जोबोद',
      open_details:'गुदि रेकर्डखौ खेव', close_details:'रेकर्डखौ बन्द खालाम', phases_label:'फेजफोर',
      annual_label:'बोसोर-बोसोरनि',
      cross_from:'बेयो होबो सोर',
      shared_note:'सोदोब सोमाजिक निवेशनि दायरा:',
      d_what:'जोंगा मुखांनो थाबनाय सोलायनाय', d_why:'नोंथाङाव बेयो गोनांथि जायो',
      d_how:'समाज आरो तंत्रफोरा मुं रोखोमआव सोदोब हाबा खालामो', d_impact:'फिथाइनि आं',
      d_investor:'सोमाजिक निवेशक', d_investors:'सोमाजिक निवेशकफोर', d_investment:'सोमाजिक निवेश',
      m_when:'समो आरो जायगा', m_location:'बड़ो', m_sdg:'बांनायनि लक्ष्यफोर', m_csr:'कर्पोरेट सोमाजिक जिम्मा · अनुसूची VII', m_uncrc:'गोदावनि अधिकारफोर', m_law:'भारतनि कानुन आरो नीतिनि आधार', m_law_none:'बे प्रजेक्टनि थाखाय मोनसे कानुनी आधार दर्ज जायाखै।',
      invest_note:'दर्जनायजों थिक रोखोमआव मुखांनाय; मोनसेआव मुखांनाय नङा।',
      impact_eyebrow:'फिथाइ', impact_title:'2000 निफ्राय, समाजफोरनि सोदोब, जायनि समाव बेफोरा अधिकार लांनाय आरो सरकारी तंत्रफोरजों सोदोब हाबा खालामो होनायनि थाखाय।',
      impact_sub:'1989आव सानग्रा-सुबुंनि दलनि रोखोमआव जागायनाय, 2000आव दर्ज जानाय। बे आंफोरा फोथार सोलोंहाय; बेनि उदांआव समाज, फिल्ड हाबाफोरा आरो सरकारी संस्थाफोरा सोदोब हाबा खालामो।',
      reach_head:'दानिनिफ्राय भौगोलिक थांनाय', reach_states:'राज्यफोर', reach_districts:'जिलाफोर', reach_blocks:'ब्लकफोर', reach_villages:'गामीफोर', reach_children:'गोदान आरो सानग्रा-सुबुंफोर', reach_farmers:'फोथाराव हाबा खालामनाय बिमाफोर',
      stories_eyebrow:'सोलायनायनि खाथिफोर', stories_title:'फोरमानथि, बादियो सोलायनाय।',
      stories_sub:'जोबोद खाथि सिरि गोदावनि अधिकारनि मोनसे बेसेखांथिआव सोरजिरि जायो — जीवन, बांनाय, रैखा, सोमोन्दोन।',
      involved_eyebrow:'सोदोब लाबो', involved_title:'दंथि शक्तिखौ मोनो — जोंगजों।',
      involved_sub:'नोंथाङा मोनसे घन्टा, मोनसे गुनथि एबा मोनसे रां होबाय, नोंथाङा जबाब होनाय तंत्रनि सोर जायो।',
      involved_cta_title:'समाजफोरनि सोदोब निवेश खालाम।',
      involved_cta_sub:'रां एबा सामग्री, ऑनलाइन एबा अफलाइन — जोबोद रां समाजफोरा जोंग थांनायनि उनाव फैनाय गुनथिआव फोतोर।',
      donate_now:'सोदोबसालि जागाय', email_us:'जोंगखौ ईमेल खालाम', f_email:'ईमेल', f_phone:'फोन', f_web:'वेब', f_address:'थं',
      nav_finance:'गोरोबथाइनि साफथि', nav_answers:'जबाबफोर',
      fin_eyebrow:'रांनि साफथि', fin_title:'जोबोद रां, रेकर्डआव।',
      fin_sub:'गैजियै अंकेक्षित हिसाब — निवेश सोदोबसालिफोरा मुखांनाय, हाबाआव मां फैनाय, आरो बेनि उनाव कानुनी सोलोंनाय। जोबोद आं मोनसे दस्तखत खालामनाय बेलेंस शीटनिफ्राय मोनो।',
      fin_stat_received:'20 बोसोरआव मुखांनाय', fin_stat_fcra:'गुबुन दुनिया रां · विदेशी अंशदान (नियमन) अधिनियम', fin_stat_inr:'सोरनि रां · भारतीय रुपी', fin_stat_funders:'दर्ज निवेश सोदोबसालिफोर',
      fin_years_head:'बोसोर-बोसोरनि', fin_years_sub:'मुं फैनाय, मुं फैखरनाय, आरो सोरे हिसाबआव दस्तखत खालामनाय। बोसोर मोनसे सायख आरो बेनि सोमाजिक निवेशकफोरखौ सोलोंगो।',
      fin_received:'मुखांनाय', fin_utilised:'लांनाय', fin_auditor:'अंकेक्षक', fin_bs:'बेलेंस शीट', fin_surplus:'फैयार', fin_deficit:'गोर्बो', fin_partial:'गैयोब्ला आं', fin_compiled:'सोरजिरि खालामनाय',
      fin_funders_head:'बे हाबाआव सोर निवेश खालामो', fin_funders_sub:'बे संस्था आरो सुबुंफोर जायनि रां बे हाबाखौ शक्ति होयो — सोदोब फिथाइनि सोदोबसालि, मोनसे-गेजेरनि दानीफोर नङा। कानुननि गोनांथिजों गुबुन दुनिया रां मोनसे अलग विदेशी अंशदान (नियमन) अधिनियम खाताआव थायो आरो अंकेक्षित जायो; सोरनि रांआ रुपीनि हिसाबजों बाहायो।',
      fin_regime_fcra:'विदेशी अंशदान (नियमन) अधिनियम · गुबुन दुनिया', fin_regime_inr:'भारतीय रुपी · सोरनि',
      fin_funders_cta:'जोबोद सोदोबसालिखौ सोलोंगो',
      fin_compliance_head:'कानुनी मानथि', fin_compliance_sub:'DEHAT मोनसे दर्ज सोसाइटी (सोसाइटी दर्जनि अधिनियम, 1860)। बुसुआव बोसोर-बोसोरनि जबाबदेहीनि चक्र दंमोन जायखौ मोनसे सायखग्रा सोलोंनो थाबो — आरो जायखौ DEHATआ फाइल खालामो।',
      fin_reg_head:'दर्जफोर', fin_cal_head:'बोसोरनि फाइलिंग कैलेंडर', fin_rules_head:'जोंग मुखांआव रिपर्ट खालामो',
      fin_auditor_trail:'जोबोद बोसोरआव मोनसे हाबा खालामनाय चार्टर्ड एकाउंटेंटजों अंकेक्षित आरो मोनसे बेसेखांथि दस्तावेज पछाणथि सोंख्याजों दस्तखत खालामनाय। सिगिरि दशकआव सिनि अलग फर्मफोरा हिसाबखौ सोलोंनाय — मोनसे गोबां-समोनि सोमोन्दोन गैया।',
      fin_due:'गोनां जायगा', fin_year_funders:'बे बोसोरनि निवेश सोदोबसालिफोर',
      fin_docs_head:'फोरमानथि आरो दस्तावेजफोर', fin_docs_sub:'जोबोद दर्ज, मानाय आरो गुबुन-गुबुन पुष्टि — गिबि सर्टिफिकेटनिफ्राय स्केन खालामनाय। थां दस्तावेज पढ़नोबो जायखौबो खेव।',
      fin_docg_statutory:'दर्ज आरो कर', fin_docg_fcra:'गुबुन दुनिया रां · विदेशी अंशदान (नियमन) अधिनियम', fin_docg_validation:'पुष्टि आरो मानथि',
      fin_doc_view:'दस्तावेज सोलोंगो', fin_pending_label:'अंकेक्षित स्केन दर्ज दं — आंफोर डिजिटल जानानै दं',
      foot_explore:'सोदोरगो', foot_reach:'जोंगखौ सोलोंगो', foot_follow:'हाबाखौ लाबो',
      foot_desc:'मानसिनि उन्नतिनि थाखाय विकास संघ — समाज आरो तंत्रफोरनि सोदोब हाबा खालामो गोदावफोरनि अधिकार नित्थि जीवनआव मोनाय, थांनाय आरो रैखा जानायनि थाखाय।',
      foot_rights:'© 2026 DEHAT · 1989आव सानग्रा-सुबुंनि दलनि रोखोमआव जागायनाय · 2000आव दर्ज जानाय',
    };
    const SAT = {
foot_policies:'ᱨᱤᱛᱤ ᱟᱨ ᱨᱟᱠᱷᱤ ᱩᱯᱟᱭ', foot_cookies:'ᱠᱩᱠᱤ ᱥᱮᱴᱤᱝᱥ',
      nav_home:'ᱚᱲᱟᱜ ᱥᱟᱦᱴᱟ', nav_who:'ᱟᱞᱮ ᱚᱠᱟ ᱠᱟᱱᱟ', nav_work:'ᱟᱞᱮᱭᱟᱜ ᱠᱟᱹᱢᱤ', nav_impact:'ᱯᱷᱚᱲᱟᱣ', nav_stories:'ᱠᱟᱦᱱᱤᱠᱚ', nav_media:'ᱢᱤᱰᱤᱭᱟ', nav_involved:'ᱦᱚᱴ ᱡᱩᱲᱟᱣᱟᱢ',
      donate:'ᱱᱤᱣᱮᱥ ᱢᱮ', since:'᱑᱙᱘᱙ ᱠᱷᱚᱱ', org_full:'ᱦᱚᱲ ᱥᱮᱨᱢᱟ ᱞᱟᱹᱜᱤᱫ ᱵᱟᱲᱟᱭ ᱥᱚᱢᱤᱛᱤ',
      language:'ᱯᱟᱹᱨᱥᱤ', lang_indian:'ᱦᱤᱱᱫ ᱯᱟᱹᱨᱥᱤᱠᱚ', lang_global:'ᱡᱟᱦᱟᱱ ᱫᱩᱱᱤᱭᱟᱭ (ᱭᱩᱮᱱ)',
      hero_title_a:'ᱢᱤᱫ ᱦᱚᱯᱚᱱ-ᱠᱮᱸᱫᱨᱤᱫ ᱥᱚᱢᱟᱡ ᱡᱟᱦᱟᱸ ᱡᱚᱛᱚ ᱦᱚᱯᱚᱱ ᱟᱨᱟᱜ ', hero_title_b:'ᱟᱫᱤᱠᱟᱨ', hero_title_c:' ᱦᱟᱥᱩᱞ ᱢᱮᱛᱟᱜᱟ — ᱨᱟᱠᱷᱤ, ᱤᱡᱡᱚᱛ ᱟᱨ ᱯᱩᱨᱟᱹᱣ.',
      hero_sub:'ᱟᱞᱮ ᱵᱷᱟᱨᱚᱛ-ᱱᱮᱯᱟᱞ ᱛᱟᱨᱟᱭ ᱡᱟᱭᱜᱟᱤᱨᱮ ᱥᱚᱢᱟᱡ ᱟᱨ ᱨᱟᱡ ᱛᱚᱱᱛᱨᱚᱠᱚ ᱥᱟᱶᱛᱮ ᱠᱟᱹᱢᱤ ᱢᱮᱛᱟᱜᱟᱯᱮ, ᱡᱟᱦᱟᱸ ᱞᱟᱹᱜᱤᱫ ᱦᱚᱯᱚᱱᱠᱚᱨᱮᱭᱟᱜ ᱟᱫᱤᱠᱟᱨ ᱛᱟᱦᱮᱸᱱ ᱠᱟᱜᱚᱡᱨᱮ ᱟᱡ ᱚᱞ ᱟᱜ ᱵᱟᱝ ᱠᱟᱱᱟ, ᱢᱮᱱᱠᱷᱟᱱ ᱡᱚᱛᱚ ᱢᱟᱦᱟᱸ ᱡᱤᱣᱚᱱᱨᱮ ᱵᱟᱰᱟᱭ, ᱦᱟᱥᱩᱞ ᱟᱨ ᱨᱟᱠᱷᱤ ᱢᱮᱛᱟᱜᱟ.',
      hero_cta1:'ᱥᱚᱢᱟᱡ ᱥᱟᱶᱛᱮ ᱛᱤᱝᱩ ᱛᱤᱝᱩ ᱢᱮ', hero_cta2:'ᱟᱞᱮ ᱚᱠᱛᱚ ᱠᱟᱹᱢᱤ ᱢᱮᱛᱟᱜᱟᱯᱮ ᱱᱚᱶᱟ ᱧᱮᱞ ᱢᱮ', hero_photo:'ᱪᱤᱛᱟᱨ — ᱦᱚᱯᱚᱱ ᱯᱟᱨᱞᱤᱭᱟᱢᱮᱸᱴ ᱟᱜᱩᱟᱹᱠᱚ, ᱞᱳᱦᱨᱟ ᱟᱛᱩ, ᱵᱚᱦᱨᱟᱭᱪ',
      hero_principle:'ᱦᱚᱰᱚᱢᱠᱚ ᱟᱨ ᱥᱚᱨᱠᱟᱨᱤ ᱵᱮᱵᱚᱥᱛᱟᱠᱚ ᱦᱟᱛᱮᱸ ᱨᱟᱠᱟᱵ ᱠᱟᱛᱮ, ᱡᱚᱛᱚ ᱦᱚᱸ ᱜᱤᱰᱨᱟ ᱞᱟᱹᱜᱤᱫ.',
      stat_children:'ᱴᱷᱮᱱ ᱦᱚᱯᱚᱱ ᱟᱨ ᱠᱤᱥᱳᱨᱠᱚ', stat_invested:'᱒᱐᱐᱐ ᱠᱷᱚᱱ ᱥᱚᱢᱟᱡ ᱛᱚᱱᱛᱨᱚᱨᱮ ᱱᱤᱣᱮᱥ', stat_resources:'ᱨᱟᱡ ᱥᱚᱢᱯᱚᱫ ᱛᱷᱮᱱ ᱟᱠᱟᱱ', stat_districts:'᱒ ᱨᱟᱡᱭᱚ ᱨᱮᱱ ᱡᱤᱞᱟᱠᱚ',
      stat_hint:'ᱯᱩᱱ ᱮᱱᱮᱡ, ᱫᱩᱠᱷᱩ ᱢᱮᱸᱦᱟᱸᱜᱟ. ᱢᱤᱫ ᱛᱮ ᱴᱮᱯ ᱢᱮ.', stat_reveal:'ᱧᱮᱞ ᱞᱟᱹᱜᱤᱫ ᱴᱮᱯ ᱢᱮ', stat_hide:'ᱫᱩᱠᱷᱩ ᱢᱮ', stat_reveal_all:'ᱯᱩᱱ ᱠᱚ ᱩᱫᱩᱜ ᱢᱮ', stat_hide_all:'ᱡᱚᱛᱚ ᱫᱩᱠᱷᱩ ᱢᱮ', grid_reveal_all:'ᱜᱮᱞ ᱴᱤᱱ ᱠᱚ ᱩᱫᱩᱜ ᱢᱮ', grid_hint:'ᱜᱮᱞ ᱴᱤᱱ ᱮᱱᱮᱡ, ᱫᱩᱠᱷᱩ ᱢᱮᱸᱦᱟᱸᱜᱟ. ᱢᱤᱫ ᱛᱮ ᱴᱮᱯ ᱢᱮ.', bl_drag:'ᱥᱚᱨᱵᱷᱮ ᱠᱚ ᱥᱮᱛᱮᱨ ᱛᱮ ᱴᱟᱱ ᱢᱮ',
      vision:'ᱧᱮᱞ', mission:'ᱩᱫᱮᱥ', theory:'ᱵᱚᱫᱚᱞ ᱨᱮᱱ ᱛᱳᱨᱤ',
      vision_body:'ᱢᱤᱫ ᱦᱚᱯᱚᱱ-ᱠᱮᱸᱫᱨᱤᱫ ᱥᱚᱢᱟᱡ ᱡᱟᱦᱟᱸ ᱡᱚᱛᱚ ᱦᱚᱯᱚᱱ ᱟᱨᱟᱜ ᱟᱫᱤᱠᱟᱨ ᱦᱟᱥᱩᱞ ᱢᱮᱛᱟᱜᱟ ᱟᱨ ᱨᱟᱠᱷᱤ, ᱤᱡᱡᱚᱛ ᱟᱨ ᱯᱩᱨᱟᱹᱣ ᱡᱤᱣᱚᱱ ᱡᱤᱭᱟ.',
      mission_body:'ᱥᱚᱢᱟᱡ ᱟᱨ ᱛᱚᱱᱛᱨᱚᱠᱚ ᱥᱟᱶᱛᱮ ᱢᱤᱫᱴᱟᱸ ᱠᱟᱹᱢᱤ ᱢᱮᱭᱟ ᱡᱟᱦᱟᱸ ᱴᱟᱠᱟᱛ ᱢᱮᱱᱟᱜᱼᱟ ᱚᱱᱟ ᱥᱟᱹᱨᱤ ᱦᱚᱲᱟᱣᱟ, ᱡᱟᱦᱟᱸ ᱦᱚᱯᱚᱱᱠᱚᱨᱮᱭᱟᱜ ᱟᱫᱤᱠᱟᱨ ᱛᱟᱦᱮᱸᱱ ᱡᱤᱣᱚᱱᱨᱮ ᱟᱡ ᱟᱨ, ᱦᱟᱥᱩᱞ ᱟᱨ ᱨᱟᱠᱷᱤ ᱛᱟᱦᱮᱸᱱᱟ.',
      theory_body:'ᱡᱟᱦᱟᱸ ᱚᱠᱛᱚ ᱥᱚᱢᱟᱡ ᱠᱟᱹᱢᱤ ᱢᱮᱛᱟᱜᱟ ᱟᱨ ᱛᱚᱱᱛᱨᱚᱠᱚ ᱢᱤᱫᱴᱟᱸ ᱡᱟᱣᱟᱵ ᱮᱢᱟ, ᱚᱱᱟ ᱡᱚᱛᱚ ᱦᱚᱯᱚᱱ ᱟᱜ ᱵᱟᱸᱪᱟᱣ, ᱵᱟᱲᱟᱭ, ᱨᱟᱠᱷᱤ ᱟᱨ ᱦᱚᱴ ᱡᱩᱲᱟᱣ ᱥᱟᱹᱨᱤ ᱠᱟᱱᱟ ᱟᱨ ᱛᱟᱦᱮᱸᱱ ᱴᱷᱤᱨ ᱛᱟᱦᱮᱸᱱᱟ.',
      eyebrow_work:'ᱟᱞᱮ ᱚᱠᱛᱚ ᱢᱮᱛᱟᱜᱟᱯᱮ', work_head:'ᱯᱩᱱ ᱴᱷᱟᱶᱠᱚ, ᱢᱤᱫᱴᱟᱸ ᱡᱟᱣᱟᱵ.',
      eyebrow_where:'ᱟᱞᱮ ᱚᱴᱮ ᱠᱟᱹᱢᱤ ᱢᱮᱛᱟᱜᱟᱯᱮ', where_head:'᱒᱓ ᱡᱤᱞᱟ. ᱒ ᱨᱟᱡᱭᱚ. ᱢᱤᱫ ᱥᱤᱢᱟ.',
      where_sub:'ᱟᱞᱮ ᱩᱛᱛᱚᱨ ᱯᱨᱚᱫᱮᱥ ᱟᱜ ᱯᱩᱨᱵ ᱵᱷᱟᱨᱚᱛ-ᱱᱮᱯᱟᱞ ᱥᱤᱢᱟᱨᱮ ᱟᱨ ᱢᱚᱦᱟᱨᱟᱥᱴᱨᱟᱨᱮ ᱠᱟᱹᱢᱤ ᱢᱮᱛᱟᱜᱟᱯᱮ — ᱚᱱᱟ ᱡᱟᱭᱜᱟᱠᱚ ᱢᱤᱫᱴᱟᱸ ᱥᱚᱢᱟᱡ ᱨᱮᱱ ᱟᱹᱰᱤ ᱠᱚᱢᱡᱳᱨ ᱛᱮ ᱡᱩᱲᱟᱹᱣ ᱠᱟᱱᱟ. ᱢᱤᱫ ᱡᱤᱞᱟ ᱛᱮ ᱴᱮᱯ ᱢᱮ ᱟᱨ ᱦᱟᱛᱟᱸᱨᱮᱱ ᱠᱩᱥᱤᱭᱟᱨᱤ ᱧᱮᱞ ᱢᱮ.',
      eyebrow_cycle:'ᱠᱚᱢᱡᱳᱨ ᱨᱮᱱ ᱪᱚᱠᱚᱨ', cycle_head:'ᱵᱤᱯᱚᱫ ᱠᱚ ᱢᱤᱫᱴᱟᱸ ᱛᱟᱨ ᱟᱠᱟ ᱵᱟᱲᱟᱭᱟ.',
      cycle_sub:'ᱚᱱᱟᱠᱚ ᱯᱮᱲᱦᱤ-ᱫᱚᱨ-ᱯᱮᱲᱦᱤ ᱢᱤᱫ ᱢᱤᱫ ᱠᱮᱭᱟᱜ ᱴᱟᱠᱟᱛ ᱦᱩᱭᱩᱜ ᱠᱟᱱᱟ — ᱡᱟᱦᱟᱸ ᱛᱚᱸᱛᱚᱨᱠᱚ ᱴᱟᱭᱚᱢ ᱨᱮ ᱡᱟᱣᱟᱵ ᱵᱟᱭ ᱮᱢᱟᱭ, ᱚᱱᱟ ᱦᱚᱸᱭ ᱠᱟᱱᱟ. ᱠᱟᱴᱮᱡ ᱛᱚᱸᱫᱟᱸ ᱵᱟᱝ ᱢᱮᱱᱟᱜᱼᱟ: ᱡᱟᱦᱟᱸ ᱦᱚᱯᱚᱱ ᱞᱟᱹᱜᱤᱫ ᱦᱚᱸ ᱚᱱᱟ ᱪᱮᱛᱟᱱ ᱚᱠᱛᱚ ᱛᱮ ᱦᱮᱡ ᱫᱟᱲᱮᱭᱟᱜᱼᱟ, ᱟᱨ ᱡᱟᱦᱟᱸ ᱵᱤᱯᱚᱫ ᱨᱟᱠᱟᱵ ᱚᱱᱟᱛᱮ ᱢᱟᱨᱟᱝ ᱛᱮᱟᱜᱼᱟ.',
      cycle_pick:'ᱡᱟᱦᱟᱸ ᱚᱠᱛᱚ ᱴᱮᱯ ᱢᱮ ᱟᱨ ᱧᱮᱞ ᱢᱮ ᱢᱤᱫ ᱡᱤᱣᱚᱱ ᱚᱠᱛᱚ ᱥᱟᱡᱟᱣ ᱦᱩᱭᱩᱜ ᱠᱟᱱᱟ.',
      cycle_note:'ᱡᱚᱛᱚ ᱮᱱᱮᱡ ᱩᱛᱛᱚᱨ ᱯᱨᱚᱫᱮᱥ ᱨᱮᱱ ᱵᱷᱟᱨᱚᱛ-ᱱᱮᱯᱟᱞ ᱛᱟᱨᱟᱭ ᱯᱴᱴᱤᱨᱮᱱ ᱮᱭᱟ ᱡᱤᱞᱟ ᱠᱚᱨᱮ — ᱵᱚᱦᱨᱟᱭᱪ, ᱥᱚᱨᱟᱵᱚᱥᱛᱤ, ᱵᱚᱞᱟᱨᱟᱢᱯᱩᱨ, ᱞᱚᱠᱷᱤᱢᱯᱩᱨ ᱠᱷᱤᱨᱤ, ᱥᱤᱫᱫᱷᱟᱨᱛᱷᱟᱱᱚᱜᱚᱨ, ᱢᱚᱦᱟᱨᱟᱡᱜᱚᱸᱡ ᱟᱨ ᱠᱩᱥᱤᱱᱚᱜᱚᱨ ᱨᱮ — ᱫᱚᱨᱡ ᱟᱠᱟᱱ ᱡᱚᱛᱚ ᱛᱮ ᱠᱚᱢᱡᱳᱨ ᱮᱱᱮᱡ ᱠᱚ ᱩᱫᱩᱜ ᱢᱮᱭᱟᱭ. ᱴᱷᱟᱶ: ᱦᱟᱥᱩᱞ, ᱡᱳᱞ ᱟᱨ ᱡᱚᱱᱚᱢ ᱞᱟᱹᱜᱤᱫ ᱨᱟᱥᱴᱨᱤᱭ ᱯᱚᱨᱤᱵᱟᱨ ᱦᱟᱥᱩᱞ ᱥᱚᱨᱵᱷᱮ ᱕ (᱒᱐᱑᱙–᱒᱑) ᱡᱤᱞᱟ ᱛᱚᱛᱷᱭᱚ-ᱯᱚᱛᱚᱨ ᱰᱟᱴᱟ (ᱦᱟᱥᱩᱞ ᱟᱨ ᱯᱚᱨᱤᱵᱟᱨ ᱠᱚᱨᱭᱟᱢ ᱢᱚᱸᱛᱨᱮᱥᱟᱞᱚᱭ / ᱟᱱᱛᱚᱨᱨᱟᱥᱴᱨᱤᱭ ᱡᱚᱱᱚᱥᱚᱸᱠᱷᱭᱟ ᱵᱤᱡᱸᱟᱱ ᱥᱚᱸᱥᱛᱷᱟ) ᱠᱷᱚᱱ; ᱚᱱᱚᱞ ᱞᱟᱹᱜᱤᱫ ᱮᱠᱤᱠᱨᱤᱛ ᱡᱤᱞᱟ ᱮᱰᱩᱠᱮᱥᱚᱱ ᱤᱱᱯᱷᱚᱨᱢᱮᱥᱚᱱ ᱥᱤᱥᱴᱚᱢ ᱯᱞᱟᱥ ᱡᱤᱞᱟ ᱛᱚᱛᱷᱭᱚ-ᱯᱚᱛᱚᱨ ᱠᱷᱚᱱ; ᱟᱨ ᱟᱭᱚ ᱚᱛᱟᱭ ᱦᱟᱨ ᱞᱟᱹᱜᱤᱫ ᱥᱟᱸᱯᱮᱞ ᱨᱮᱡᱤᱥᱴᱨᱮᱥᱚᱱ ᱥᱤᱥᱴᱚᱢ ᱠᱷᱚᱱ, ᱡᱟᱦᱟᱸ ᱨᱟᱡᱭᱚ ᱞᱮᱵᱮᱞ ᱛᱮ ᱢᱮᱱᱟᱜᱼᱟ. ᱡᱚᱛᱚ ᱦᱟᱥᱩᱞ ᱮᱱᱮᱡ ᱢᱤᱫ ᱴᱟᱶ ᱥᱚᱨᱵᱷᱮ ᱨᱟᱩᱸᱰ ᱠᱷᱚᱱ ᱚᱫᱚᱠᱟ ᱠᱟᱱᱟ, ᱟᱨ ᱚᱱᱟ ᱛᱮ ᱡᱤᱞᱟᱠᱚ ᱠᱚ ᱥᱚᱢᱟᱱ ᱛᱮ ᱛᱩᱞᱚᱱᱟ ᱠᱟᱱᱟ. ᱥᱟᱫᱤ-ᱴᱟᱸᱫᱟᱱ ᱦᱤᱸᱥᱟ ᱠᱷᱟᱹᱞᱤ ᱨᱟᱥᱴᱨᱤᱭ ᱯᱚᱨᱤᱵᱟᱨ ᱦᱟᱥᱩᱞ ᱥᱚᱨᱵᱷᱮ ᱨᱮᱱ ᱨᱟᱡᱭᱚ ᱢᱳᱰᱭᱩᱞᱨᱮ ᱫᱚᱨᱡ ᱟᱠᱟᱱᱟ ᱟᱨ ᱩᱛᱛᱚᱨ ᱯᱨᱚᱫᱮᱥ ᱨᱮᱱ ᱮᱱᱮᱡ ᱞᱮᱠᱷᱟ ᱩᱫᱩᱜ ᱟᱠᱟᱱᱟ. ᱯᱩᱱ ᱚᱠᱛᱚ — ᱦᱚᱯᱚᱱ ᱠᱟᱹᱢᱤ, ᱡᱚᱛᱚ ᱛᱮ ᱜᱚᱨᱤᱵ ᱴᱷᱟᱶ ᱟᱨ ᱟᱨᱦᱚᱸ ᱦᱚᱯᱚᱱ ᱟᱨ ᱢᱚᱸ ᱕ ᱥᱮᱨᱢᱟ ᱞᱟᱦᱟ ᱜᱚᱨᱚᱱᱛᱤ — ᱱᱤᱫ ᱛᱟᱢᱟᱜ ᱚᱴ ᱟᱨᱦᱚᱸ ᱥᱟᱴᱤ ᱧᱮᱞ ᱞᱟᱹᱜᱤᱫ ᱠᱟᱹᱢᱤ ᱨᱮᱡᱤᱥᱴᱚᱨ ᱨᱮ ᱛᱟᱦᱮᱸᱱᱟ, ᱟᱨ ᱚᱱᱟ ᱛᱮ ᱠᱩᱦᱤ ᱫᱚ ᱢᱮᱛᱟᱜᱟ. ᱵᱷᱟᱨᱚᱛ ᱨᱮ ᱢᱚᱸ ᱟᱨᱦᱚᱸ ᱕ ᱥᱮᱨᱢᱟ ᱞᱟᱦᱟ ᱜᱚᱨᱚᱱᱛᱤ ᱞᱟᱹᱜᱤᱫ ᱡᱤᱞᱟ ᱞᱮᱵᱮᱞ ᱨᱮᱱ ᱠᱟᱹᱨᱭᱟᱞᱭ ᱟᱠᱛᱟ ᱵᱟᱭ ᱩᱫᱩᱜ. ᱡᱚᱛᱚ ᱚᱠᱛᱚ ᱟᱹᱰᱤ ᱨᱮᱱ ᱡᱤᱞᱟ ᱟᱨ ᱠᱷᱚᱱ ᱠᱚ ᱚᱞ ᱟᱠᱟᱱᱟ.',
      eyebrow_process:'ᱯᱨᱚᱥᱮᱥ', process_head:'ᱡᱟᱦᱟᱸ ᱚᱠᱛᱚ ᱥᱚᱢᱟᱡ ᱠᱟᱹᱢᱤ ᱢᱮᱛᱟᱜᱟ, ᱛᱚᱱᱛᱨᱚᱠᱚ ᱡᱟᱣᱟᱵ ᱮᱢᱟᱭ.', eyebrow_stories:'ᱵᱚᱫᱚᱞ ᱨᱮᱱ ᱠᱟᱦᱱᱤᱠᱚ',
      cta_donate:'ᱱᱤᱣᱮᱥ ᱢᱮ', cta_donate_b:'ᱥᱚᱢᱟᱡ ᱚᱨᱠᱚ ᱠᱟᱹᱢᱤ ᱨᱮ ᱴᱟᱠᱟ ᱟᱨᱵᱟᱝ ᱡᱤᱱᱤᱥ ᱛᱮ, ᱚᱱᱞᱟᱭᱤᱱ ᱟᱨᱵᱟᱝ ᱚᱯᱷᱞᱟᱭᱤᱱ ᱛᱮ ᱥᱟᱦᱴᱟ ᱢᱮ.', cta_donate_a:'ᱱᱤᱛᱚᱜ ᱱᱤᱣᱮᱥ ᱢᱮ',
      cta_vol:'ᱥᱮᱵᱟ', cta_vol_b:'ᱤᱱᱴᱚᱨᱱ ᱦᱩᱭ ᱢᱮ, ᱵᱷᱟᱨᱪᱩᱭᱟᱞ ᱛᱮ ᱠᱟᱹᱢᱤ ᱢᱮ, ᱟᱨᱵᱟᱝ DEHAT ᱯᱮᱞᱳ ᱦᱩᱭ ᱢᱮ.', cta_vol_a:'ᱟᱞᱮ ᱥᱟᱶᱛᱮ ᱡᱩᱲᱟᱣ ᱢᱮ',
      cta_partner:'ᱦᱚᱴ ᱡᱩᱲᱟᱣᱟᱜ', cta_partner_b:'ᱠᱚᱨᱯᱳᱨᱮᱴ, ᱮᱠᱟᱰᱮᱢᱤᱠ ᱟᱨᱵᱟᱝ ᱥᱚᱸᱥᱛᱷᱟᱭ ᱦᱚᱴ ᱡᱩᱲᱟᱣ.', cta_partner_a:'ᱦᱚᱴ ᱠᱟᱹᱢᱤ ᱢᱮ',
      pillar_link_work:'ᱯᱩᱱ ᱠᱟᱹᱢᱤ ᱠᱚ ᱧᱮᱞ ᱢᱮ', pillar_link_how:'ᱟᱞᱮ ᱚᱠᱛᱚ ᱠᱟᱹᱢᱤ ᱢᱮᱛᱟᱜᱟᱯᱮ ᱱᱚᱶᱟ ᱧᱮᱞ ᱢᱮ', stories_all:'ᱡᱚᱛᱚ ᱠᱟᱦᱱᱤ ᱯᱟᱲᱦᱟᱣ ᱢᱮ',
      work_title:'ᱟᱫᱤᱠᱟᱨ, ᱱᱤᱫ ᱛᱟᱢᱟᱜ ᱡᱤᱣᱚᱱᱨᱮ ᱦᱟᱥᱩᱞ.',
      chrono_title:'ᱡᱚᱛᱚ ᱠᱟᱹᱢᱤ, ᱴᱟᱭᱚᱢ ᱠᱚᱨᱚᱢ ᱛᱮ',
      count_label:'ᱫᱚᱨᱡ ᱠᱟᱹᱢᱤ',
      open_programme:'ᱠᱟᱹᱢᱤ ᱠᱷᱩᱞᱟᱹᱭ ᱢᱮ',
      work_sub:'ᱯᱩᱱ ᱠᱟᱹᱢᱤ, ᱡᱟᱦᱟᱸ ᱛᱟᱭᱚᱢ ᱛᱮ ᱮᱛᱚᱦᱚᱵ ᱟᱠᱟᱱᱟ ᱚᱱᱟ ᱠᱚᱨᱚᱢ ᱛᱮ. ᱢᱤᱫ ᱢᱤᱫ ᱟᱞᱟᱜ ᱥᱟᱦᱴᱟ ᱨᱮ ᱠᱷᱩᱞᱟᱹᱭ ᱠᱟᱱᱟ — ᱠᱟᱹᱢᱤ ᱪᱮᱫ ᱞᱟᱹᱜᱤᱫ ᱢᱮᱱᱟᱜᱼᱟ, ᱚᱠᱛᱚ ᱛᱮ ᱵᱮᱱᱟᱣ ᱟᱠᱟᱱᱟ, ᱟᱨ ᱡᱚᱛᱚ ᱠᱟᱹᱢᱤ ᱡᱟᱦᱟᱸ ᱠᱟᱹᱢᱤ ᱠᱚ ᱦᱚᱛᱮ ᱟᱠᱟᱱᱟ, ᱴᱟᱭᱚᱢ ᱠᱚᱨᱚᱢ ᱛᱮ, ᱪᱮᱫ, ᱚᱴᱮ, ᱚᱠᱛᱚ, ᱚᱠᱚᱭᱚᱜ, ᱪᱮᱫ ᱞᱟᱹᱜᱤᱫ ᱟᱨ ᱱᱤᱣᱮᱥ ᱥᱟᱶᱛᱮ.',
      portfolio_total:'ᱨᱟᱡ ᱨᱮᱡᱤᱥᱴᱚᱨ ᱨᱮ ᱠᱟᱹᱢᱤ', portfolio_investment:'ᱡᱚᱛᱚ ᱥᱚᱢᱟᱡᱤᱠ ᱱᱤᱣᱮᱥ',
      portfolio_count:'ᱯᱩᱱ ᱠᱟᱹᱢᱤ ᱨᱮ ᱠᱟᱹᱢᱤ',
      filter_year:'ᱥᱮᱨᱢᱟ', filter_state:'ᱨᱟᱡᱭᱚ', filter_district:'ᱡᱤᱞᱟ', filter_sdg:'ᱵᱟᱲᱟᱭ ᱩᱫᱮᱥ', filter_csr:'ᱠᱚᱨᱯᱳᱨᱮᱴ ᱥᱚᱢᱟᱡᱤᱠ ᱡᱤᱢᱟ · ᱥᱤᱰᱤᱭᱩᱞ VII', filter_uncrc:'ᱦᱚᱯᱚᱱ ᱟᱫᱤᱠᱟᱨ', filter_investor:'ᱥᱚᱢᱟᱡᱤᱠ ᱱᱤᱣᱮᱥᱠᱚᱨ', filter_all:'ᱡᱚᱛᱚ',
      open_details:'ᱯᱩᱨᱟᱹᱣ ᱨᱮᱡᱤᱥᱴᱚᱨ ᱠᱷᱩᱞᱟᱹᱭ ᱢᱮ', close_details:'ᱨᱮᱡᱤᱥᱴᱚᱨ ᱵᱚᱸᱫ ᱢᱮ', phases_label:'ᱯᱷᱮᱡᱠᱚ',
      annual_label:'ᱥᱮᱨᱢᱟ ᱛᱟᱭᱚᱢ ᱛᱮ',
      cross_from:'ᱱᱚᱶᱟ ᱦᱚᱸ ᱟᱹᱰᱤ',
      shared_note:'ᱦᱚᱴ ᱥᱚᱢᱟᱡᱤᱠ ᱱᱤᱣᱮᱥ ᱟᱜ ᱴᱷᱟᱶ:',
      d_what:'ᱡᱟᱦᱟᱸ ᱵᱚᱫᱚᱞ ᱟᱞᱮ ᱮᱛᱚᱦᱚᱵ ᱠᱟᱛᱟ', d_why:'ᱱᱚᱶᱟ ᱚᱴᱮ ᱪᱮᱫ ᱞᱟᱹᱜᱤᱫ ᱟᱹᱰᱤ ᱡᱟᱨᱩᱨᱤ ᱛᱟᱦᱮᱸᱱ',
      d_how:'ᱥᱚᱢᱟᱡ ᱟᱨ ᱛᱚᱱᱛᱨᱚᱠᱚ ᱚᱠᱛᱚ ᱦᱚᱴ ᱠᱟᱹᱢᱤ ᱢᱮᱛᱟᱜᱟᱭ', d_impact:'ᱯᱷᱚᱲᱟᱣ ᱮᱱᱮᱡ',
      d_investor:'ᱥᱚᱢᱟᱡᱤᱠ ᱱᱤᱣᱮᱥᱠᱚᱨ', d_investors:'ᱥᱚᱢᱟᱡᱤᱠ ᱱᱤᱣᱮᱥᱠᱚᱨᱠᱚ', d_investment:'ᱥᱚᱢᱟᱡᱤᱠ ᱱᱤᱣᱮᱥ',
      m_when:'ᱚᱠᱚᱭᱚᱜ ᱟᱨ ᱥᱛᱷᱤᱛᱤ', m_location:'ᱚᱴᱮ', m_sdg:'ᱵᱟᱲᱟᱭ ᱩᱫᱮᱥᱠᱚ', m_csr:'ᱠᱚᱨᱯᱳᱨᱮᱴ ᱥᱚᱢᱟᱡᱤᱠ ᱡᱤᱢᱟ · ᱥᱤᱰᱤᱭᱩᱞ VII', m_uncrc:'ᱦᱚᱯᱚᱱ ᱟᱜ ᱟᱫᱤᱠᱟᱨᱠᱚ', m_law:'ᱦᱤᱸᱰ ᱟᱭᱤᱱ ᱟᱨ ᱱᱤᱛᱤ ᱴᱷᱟᱶ', m_law_none:'ᱱᱚᱶᱟ ᱠᱟᱹᱢᱤ ᱞᱟᱹᱜᱤᱫ ᱢᱤᱫ ᱦᱚᱸ ᱟᱭᱤᱱ ᱴᱷᱟᱶ ᱫᱚᱨᱡ ᱵᱟᱝ ᱠᱟᱱᱟ.',
      invest_note:'ᱡᱟᱹᱥᱛᱤ ᱫᱚᱨᱡ ᱟᱠᱟᱱ ᱞᱮᱠᱷᱟᱛᱮ ᱦᱚᱸ ᱟᱠᱟᱱᱟ; ᱢᱤᱫᱴᱟᱸ ᱵᱟᱝ ᱠᱟᱱᱟ.',
      impact_eyebrow:'ᱯᱷᱚᱲᱟᱣ', impact_title:'᱒᱐᱐᱐ ᱠᱷᱚᱱ, ᱥᱚᱢᱟᱡ ᱠᱚ ᱥᱟᱶᱛᱮ, ᱡᱟᱦᱟᱸ ᱚᱱᱟᱠᱚ ᱟᱫᱤᱠᱟᱨ ᱢᱟᱸᱜᱟ ᱟᱨ ᱨᱟᱡ ᱛᱚᱱᱛᱨᱚᱠᱚ ᱥᱟᱶᱛᱮ ᱦᱚᱴ ᱠᱟᱹᱢᱤ ᱢᱮᱛᱟᱜᱟᱭ.',
      impact_sub:'᱑᱙᱘᱙ ᱨᱮ ᱡᱟᱶᱟᱱ ᱜᱷᱚᱴᱚ ᱞᱮᱠᱷᱟᱛᱮ ᱮᱛᱚᱦᱚᱵ, ᱒᱐᱐᱐ ᱨᱮ ᱨᱮᱡᱤᱥᱴᱚᱨ. ᱱᱚᱶᱟ ᱮᱱᱮᱡ ᱠᱚ ᱢᱟᱯ ᱮ ᱩᱫᱩᱜ ᱠᱟᱱᱟ; ᱱᱚᱶᱟ ᱚᱨᱟᱜ ᱟᱲᱟᱝ ᱨᱮ ᱥᱚᱢᱟᱡ, ᱯᱷᱤᱞᱰ ᱠᱟᱹᱢᱤ ᱠᱚᱨᱭᱟ ᱟᱨ ᱨᱟᱡ ᱥᱚᱸᱥᱛᱷᱟ ᱠᱚ ᱚᱠᱛᱚ ᱦᱚᱴ ᱠᱟᱹᱢᱤ ᱢᱮᱛᱟᱜᱟᱠᱚ.',
      reach_head:'ᱱᱤᱛᱚᱜ ᱛᱟᱠᱮᱱ ᱵᱷᱳᱜᱳᱞᱤᱠ ᱟᱡ', reach_states:'ᱨᱟᱡᱭᱚᱠᱚ', reach_districts:'ᱡᱤᱞᱟᱠᱚ', reach_blocks:'ᱵᱞᱚᱠᱠᱚ', reach_villages:'ᱟᱛᱩᱠᱚ', reach_children:'ᱦᱚᱯᱚᱱ ᱟᱨ ᱠᱤᱥᱳᱨᱠᱚ', reach_farmers:'ᱠᱩᱲᱤ ᱪᱟᱥᱤᱠᱚ',
      stories_eyebrow:'ᱵᱚᱫᱚᱞ ᱨᱮᱱ ᱠᱟᱦᱱᱤᱠᱚ', stories_title:'ᱦᱮᱥᱟᱫᱚ, ᱟᱨ ᱚᱠᱚᱭᱮ ᱵᱚᱫᱚᱞ.',
      stories_sub:'ᱡᱚᱛᱚ ᱠᱟᱦᱱᱤ ᱯᱩᱱ ᱦᱚᱯᱚᱱ ᱟᱫᱤᱠᱟᱨ ᱠᱷᱚᱱ ᱢᱤᱫ ᱠᱷᱚᱸᱛᱚᱜ ᱠᱷᱚᱱ ᱵᱮᱱᱟᱣ ᱟᱠᱟᱱᱟ — ᱵᱟᱸᱪᱟᱣ, ᱵᱟᱲᱟᱭ, ᱨᱟᱠᱷᱤ, ᱦᱚᱴ ᱡᱩᱲᱟᱣ.',
      involved_eyebrow:'ᱦᱚᱴ ᱡᱩᱲᱟᱣᱟᱢ', involved_title:'ᱴᱟᱠᱟᱛ ᱦᱟᱥᱩᱞ ᱢᱮ — ᱟᱞᱮ ᱥᱟᱶᱛᱮ.',
      involved_sub:'ᱟᱢ ᱢᱤᱫ ᱴᱟᱲᱟᱝ, ᱢᱤᱫ ᱫᱚᱠᱷ ᱟᱨᱵᱟᱝ ᱢᱤᱫ ᱴᱟᱠᱟ ᱮᱢ ᱠᱷᱟᱱ, ᱟᱢ ᱚᱱᱟ ᱛᱚᱱᱛᱨᱚ ᱟᱜ ᱠᱷᱚᱸᱛᱚᱜ ᱦᱩᱭᱩᱜ ᱢᱮᱭᱟ ᱡᱟᱦᱟᱸ ᱡᱟᱣᱟᱵ ᱮᱢᱟᱭ.',
      involved_cta_title:'ᱥᱚᱢᱟᱡ ᱥᱟᱶᱛᱮ ᱱᱤᱣᱮᱥ ᱢᱮ.',
      involved_cta_sub:'ᱴᱟᱠᱟ ᱟᱨᱵᱟᱝ ᱡᱤᱱᱤᱥ, ᱚᱱᱞᱟᱭᱤᱱ ᱟᱨᱵᱟᱝ ᱚᱯᱷᱞᱟᱭᱤᱱ — ᱡᱚᱛᱚ ᱴᱟᱠᱟ ᱚᱱᱟ ᱦᱚᱲᱚ ᱨᱮ ᱡᱩᱲᱟᱣᱟ ᱡᱟᱦᱟᱸ ᱥᱚᱢᱟᱡᱠᱚ ᱟᱞᱮ ᱚᱲᱟᱜ ᱛᱟᱭᱚᱢ ᱠᱷᱚᱱ ᱦᱚᱸ ᱛᱚᱦᱚᱭ ᱛᱟᱦᱮᱸᱱᱟ.',
      donate_now:'ᱦᱚᱴ ᱡᱩᱲᱟᱣ ᱮᱛᱚᱦᱚᱵ ᱢᱮ', email_us:'ᱟᱞᱮ ᱛᱮ ᱤᱢᱮᱞ ᱢᱮ', f_email:'ᱤᱢᱮᱞ', f_phone:'ᱯᱷᱚᱱ', f_web:'ᱣᱮᱵ', f_address:'ᱴᱷᱮᱠᱟᱱ',
      nav_finance:'ᱥᱟᱯᱷᱟ', nav_answers:'ᱡᱟᱣᱟᱵᱠᱚ',
      fin_eyebrow:'ᱴᱟᱠᱟ ᱨᱮᱱ ᱥᱟᱯᱷᱟ', fin_title:'ᱡᱚᱛᱚ ᱴᱟᱠᱟ, ᱨᱮᱡᱤᱥᱴᱚᱨ ᱨᱮ.',
      fin_sub:'ᱟᱡ ᱛᱮ ᱚᱰᱤᱴ ᱟᱠᱟᱱ ᱦᱤᱥᱟᱹᱵ — ᱱᱤᱣᱮᱥ ᱦᱚᱴ ᱡᱩᱲᱟᱣᱠᱚ ᱪᱮᱫ ᱮᱛᱚᱦᱚᱵ ᱠᱮᱫᱟ, ᱠᱟᱹᱢᱤ ᱛᱟᱠᱮᱱ ᱪᱮᱫ ᱛᱷᱮᱱ ᱟᱠᱟᱱᱟ, ᱟᱨ ᱵᱟᱨᱮᱭᱟᱜ ᱚᱴᱮ ᱨᱮᱱ ᱟᱭᱤᱱ ᱡᱟᱸᱪ. ᱡᱚᱛᱚ ᱮᱱᱮᱡ ᱢᱤᱫ ᱥᱟᱦᱟ ᱮ ᱟᱠᱟᱱ ᱵᱮᱞᱮᱱᱥ ᱥᱤᱴ ᱠᱷᱚᱱ ᱩᱫᱩᱜ ᱠᱟᱱᱟ.',
      fin_stat_received:'᱒᱐ ᱥᱮᱨᱢᱟ ᱨᱮ ᱮᱛᱚᱦᱚᱵ', fin_stat_fcra:'ᱵᱟᱭ ᱨᱟᱡ ᱨᱮᱱ ᱴᱟᱠᱟ · FCRA ᱟᱭᱤᱱ', fin_stat_inr:'ᱚᱨᱟᱜ ᱨᱮᱱ ᱴᱟᱠᱟ · ᱦᱤᱸᱰ ᱨᱩᱯᱭᱟ', fin_stat_funders:'ᱫᱚᱨᱡ ᱱᱤᱣᱮᱥ ᱦᱚᱴ ᱡᱩᱲᱟᱣᱠᱚ',
      fin_years_head:'ᱥᱮᱨᱢᱟ ᱛᱟᱭᱚᱢ ᱛᱮ', fin_years_sub:'ᱪᱮᱫ ᱛᱷᱮᱱ ᱟᱠᱟᱱᱟ, ᱪᱮᱫ ᱚᱲᱟᱜ ᱠᱟᱱᱟ, ᱟᱨ ᱦᱤᱥᱟᱹᱵᱨᱮ ᱚᱠᱚᱭ ᱥᱟᱦᱟ ᱮᱭᱟᱭ. ᱢᱤᱫ ᱥᱮᱨᱢᱟ ᱵᱟᱪᱷᱟᱣ ᱢᱮ ᱟᱨ ᱩᱱᱠᱩᱲᱮᱱ ᱥᱚᱢᱟᱡᱤᱠ ᱱᱤᱣᱮᱥᱠᱚᱨ ᱠᱚ ᱧᱮᱞ ᱢᱮ.',
      fin_received:'ᱮᱛᱚᱦᱚᱵ', fin_utilised:'ᱵᱮᱵᱚᱦᱟᱨ ᱟᱠᱟᱱᱟ', fin_auditor:'ᱚᱰᱤᱴᱚᱨ', fin_bs:'ᱵᱮᱞᱮᱱᱥ ᱥᱤᱴ', fin_surplus:'ᱵᱟᱪᱷᱟᱣ', fin_deficit:'ᱜᱟᱴᱟ', fin_partial:'ᱟᱰᱷᱟ ᱮᱱᱮᱡ', fin_compiled:'ᱡᱚᱢᱟ ᱟᱠᱟᱱᱟ',
      fin_funders_head:'ᱚᱠᱟ ᱠᱚ ᱱᱚᱶᱟ ᱠᱟᱹᱢᱤ ᱨᱮ ᱱᱤᱣᱮᱥ ᱢᱮᱛᱟᱜᱟᱭ', fin_funders_sub:'ᱚᱱᱟ ᱥᱚᱸᱥᱛᱷᱟ ᱟᱨ ᱦᱚᱲ ᱠᱚ ᱡᱟᱦᱟᱸ ᱨᱮᱱ ᱴᱟᱠᱟ ᱱᱚᱶᱟ ᱠᱟᱹᱢᱤ ᱴᱟᱠᱟᱛ ᱮᱢᱟᱭ — ᱦᱚᱴ ᱯᱷᱚᱲᱟᱣ ᱨᱮᱱ ᱦᱚᱴ ᱡᱩᱲᱟᱣᱠᱚ, ᱢᱤᱫᱴᱟᱸ-ᱦᱟᱴᱤᱧ ᱫᱟᱱᱤ ᱵᱟᱝ ᱠᱟᱱᱟ. ᱟᱭᱤᱱ ᱦᱩᱱᱟᱹᱨ ᱛᱮ ᱵᱟᱭ ᱨᱟᱡ ᱨᱮᱱ ᱴᱟᱠᱟ ᱢᱤᱫ ᱠᱷᱚᱸᱛᱚᱜ FCRA ᱠᱷᱟᱛᱟ ᱨᱮ ᱫᱷᱟᱨᱟ ᱟᱨ ᱚᱰᱤᱴ ᱦᱩᱭᱩᱜᱼᱟ; ᱚᱨᱟᱜ ᱴᱟᱠᱟ ᱨᱩᱯᱭᱟ ᱦᱤᱥᱟᱹᱵ ᱠᱷᱚᱸᱛᱚᱜ ᱪᱟᱞᱟᱜᱼᱟ.',
      fin_regime_fcra:'FCRA ᱟᱭᱤᱱ · ᱵᱟᱭ ᱨᱟᱡ', fin_regime_inr:'ᱦᱤᱸᱰ ᱨᱩᱯᱭᱟ · ᱚᱨᱟᱜ',
      fin_funders_cta:'ᱡᱚᱛᱚ ᱦᱚᱴ ᱡᱩᱲᱟᱣᱠᱚ ᱧᱮᱞ ᱢᱮ',
      fin_compliance_head:'ᱟᱭᱤᱱ ᱴᱷᱟᱶ ᱢᱟᱱᱟᱣ', fin_compliance_sub:'DEHAT ᱢᱤᱫ ᱫᱚᱨᱡ ᱥᱚᱥᱟᱭᱤᱴᱤ ᱠᱟᱱᱟ (ᱥᱚᱥᱟᱭᱤᱴᱤ ᱨᱮᱡᱤᱥᱴᱨᱮᱥᱚᱱ ᱟᱭᱤᱱ, ᱑᱘᱖᱐). ᱞᱟᱛᱟᱨ ᱨᱮ ᱥᱮᱨᱢᱟ ᱛᱟᱭᱚᱢ ᱛᱮ ᱡᱟᱣᱟᱵᱫᱮᱦᱤ ᱪᱚᱠᱚᱨ ᱢᱮᱱᱟᱜᱼᱟ ᱡᱟᱦᱟᱸ ᱢᱤᱫ ᱥᱚᱢᱤᱠᱷᱭᱟᱠ ᱧᱮᱞ ᱞᱟᱹᱜᱤᱫ ᱟᱥᱟ ᱢᱮᱭᱟᱭ — ᱟᱨ ᱡᱟᱦᱟᱸ DEHAT ᱫᱟᱠᱷᱚᱞ ᱢᱮᱛᱟᱜᱟᱭ.',
      fin_reg_head:'ᱨᱮᱡᱤᱥᱴᱨᱮᱥᱚᱱ', fin_cal_head:'ᱥᱮᱨᱢᱟ ᱨᱮᱱ ᱯᱷᱟᱭᱤᱞᱤᱝ ᱠᱮᱞᱮᱱᱰᱟᱨ', fin_rules_head:'ᱟᱞᱮ ᱚᱠᱟ ᱠᱷᱚᱱ ᱨᱤᱯᱳᱴ ᱢᱮᱛᱟᱜᱟᱯᱮ',
      fin_auditor_trail:'ᱡᱚᱛᱚ ᱥᱮᱨᱢᱟ ᱨᱮ ᱢᱤᱫ ᱠᱟᱹᱢᱤ ᱮᱭᱟᱭ ᱪᱟᱨᱴᱚᱨᱰ ᱮᱠᱟᱩᱸᱴᱮᱸᱴ ᱛᱮ ᱚᱰᱤᱴ ᱟᱠᱟᱱᱟ, ᱟᱨ ᱢᱤᱫ ᱩᱫᱮᱥ ᱰᱚᱠᱩᱢᱮᱸᱴ ᱟᱭᱤᱰᱮᱸᱴᱤᱯᱤᱠᱮᱥᱚᱱ ᱱᱚᱢᱵᱚᱨ ᱛᱮ ᱥᱟᱦᱟ ᱟᱠᱟᱱᱟ. ᱟᱭᱩᱵ ᱫᱚᱥᱚᱠ ᱨᱮ ᱢᱚᱸ ᱠᱷᱚᱸᱛᱚᱜ ᱯᱷᱚᱨᱢ ᱠᱚ ᱦᱤᱥᱟᱹᱵ ᱧᱮᱞ ᱟᱠᱟᱫᱮᱭᱟ — ᱢᱤᱫ ᱦᱚᱸ ᱥᱟᱦᱟ ᱥᱟᱶᱛᱮ ᱟᱡ ᱟᱲᱟᱝ ᱨᱮᱱ ᱦᱚᱴ ᱵᱟᱝ ᱠᱟᱱᱟ.',
      fin_due:'ᱩᱫᱩᱜ ᱟᱠᱟᱱᱟ', fin_year_funders:'ᱱᱚᱶᱟ ᱥᱮᱨᱢᱟ ᱨᱮᱱ ᱱᱤᱣᱮᱥ ᱦᱚᱴ ᱡᱩᱲᱟᱣᱠᱚ',
      fin_docs_head:'ᱯᱩᱨᱟᱹᱣ ᱟᱨ ᱰᱚᱠᱩᱢᱮᱸᱴᱠᱚ', fin_docs_sub:'ᱡᱚᱛᱚ ᱨᱮᱡᱤᱥᱴᱨᱮᱥᱚᱱ, ᱢᱟᱱᱟᱣ ᱟᱨ ᱮᱴᱟᱜ ᱠᱷᱚᱱ ᱛᱩᱞᱚᱱ — ᱢᱩᱞ ᱥᱟᱦᱟ ᱯᱚᱛᱚᱨ ᱠᱷᱚᱱ ᱥᱠᱮᱱ ᱟᱠᱟᱱᱟ. ᱟᱭᱤᱱ ᱯᱚᱛᱚᱨ ᱯᱟᱲᱦᱟᱣ ᱞᱟᱹᱜᱤᱫ ᱚᱠᱟ ᱦᱚᱸ ᱠᱷᱩᱞᱟᱹᱭ ᱢᱮ.',
      fin_docg_statutory:'ᱨᱮᱡᱤᱥᱴᱨᱮᱥᱚᱱ ᱟᱨ ᱴᱮᱠᱥ', fin_docg_fcra:'ᱵᱟᱭ ᱨᱟᱡ ᱨᱮᱱ ᱴᱟᱠᱟ · FCRA ᱟᱭᱤᱱ', fin_docg_validation:'ᱛᱩᱞᱚᱱ ᱟᱨ ᱢᱟᱱᱟᱣ',
      fin_doc_view:'ᱯᱚᱛᱚᱨ ᱧᱮᱞ ᱢᱮ', fin_pending_label:'ᱚᱰᱤᱴ ᱟᱠᱟᱱ ᱥᱠᱮᱱ ᱢᱮᱱᱟᱜᱼᱟ — ᱮᱱᱮᱡ ᱠᱚ ᱰᱤᱡᱤᱴᱚᱞ ᱦᱩᱭᱩᱜ ᱠᱟᱱᱟ',
      foot_explore:'ᱥᱮᱸᱫᱽᱨᱟ ᱢᱮ', foot_reach:'ᱟᱞᱮ ᱛᱟᱦᱮᱸᱱ ᱢᱮ', foot_follow:'ᱠᱟᱹᱢᱤ ᱥᱟᱶᱛᱮ ᱡᱩᱲᱟᱣ ᱢᱮ',
      foot_desc:'ᱦᱚᱲ ᱥᱮᱨᱢᱟ ᱞᱟᱹᱜᱤᱫ ᱵᱟᱲᱟᱭ ᱥᱚᱢᱤᱛᱤ — ᱥᱚᱢᱟᱡ ᱟᱨ ᱛᱚᱱᱛᱨᱚᱠᱚ ᱥᱟᱶᱛᱮ ᱠᱟᱹᱢᱤ ᱡᱟᱦᱟᱸ ᱦᱚᱯᱚᱱ ᱟᱜ ᱟᱫᱤᱠᱟᱨ ᱛᱟᱦᱮᱸᱱ, ᱦᱟᱥᱩᱞ ᱟᱨ ᱨᱟᱠᱷᱤ ᱛᱟᱦᱮᱸᱱᱟ.',
      foot_rights:'© ᱒᱐᱒᱖ DEHAT · ᱑᱙᱘᱙ ᱨᱮ ᱡᱟᱶᱟᱱ ᱜᱷᱚᱴᱚ ᱞᱮᱠᱷᱟᱛᱮ ᱮᱛᱚᱦᱚᱵ · ᱒᱐᱐᱐ ᱨᱮ ᱨᱮᱡᱤᱥᱴᱚᱨ',
    };
    const MNI = {
foot_policies:'ꯅꯤꯇꯤ ꯑꯃꯁꯨꯡ ꯉꯥꯛꯊꯣꯛꯄꯤꯕ ꯑꯣꯏꯕꯁꯤꯡ', foot_cookies:'ꯀꯨꯀꯤ ꯁꯦꯇꯤꯡ',
      nav_home:'ꯑꯍꯥꯟꯕ ꯃꯐꯝ', nav_who:'ꯑꯩꯈꯣꯏ ꯀꯅꯥ ꯅꯤ', nav_work:'ꯑꯩꯈꯣꯏꯒꯤ ꯊꯕꯛ', nav_impact:'ꯑꯐꯕ ꯄꯣꯀ꯭ꯄ', nav_stories:'ꯋꯥꯔꯤꯁꯤꯡ', nav_media:'ꯃꯤꯗꯤꯌꯥ', nav_involved:'ꯄꯥꯡꯊꯣꯀ',
      donate:'ꯅꯤꯕꯦꯁ ꯇꯧ', since:'꯱꯹꯸꯹ ꯇꯒꯤ', org_full:'ꯃꯤꯑꯣꯏꯕꯒꯤ ꯄꯨꯅꯁꯤꯅꯕꯒꯤ ꯑꯐꯕꯗ ꯄꯨꯡꯅꯕ ꯁꯦꯡꯓꯦꯕ',
      language:'ꯂꯣꯟ', lang_indian:'ꯏꯟꯗꯤꯌꯥꯒꯤ ꯂꯣꯟꯁꯤꯡ', lang_global:'ꯃꯄꯨꯡ ꯄꯤꯕ ꯇꯥꯐ (ꯌꯨꯑꯦꯟ)',
      hero_title_a:'ꯃꯆꯥꯒꯤ ꯃꯄꯨꯡꯐꯪꯕ ꯁꯣꯁꯥꯏꯇꯤꯗ ꯃꯆꯥ ꯄꯨꯝꯅꯃꯛꯅ ꯃꯈꯣꯌꯒꯤ ', hero_title_b:'ꯑꯗꯤꯀꯥꯔ', hero_title_c:' ꯐꯪꯏ — ꯉꯥꯛꯊꯣꯛꯄ, ꯏꯖ্ꯖꯇ ꯑꯃꯁꯨꯡ ꯃꯄꯨꯡꯐꯥꯕ.',
      hero_sub:'ꯑꯩꯈꯣꯏ ꯏꯟꯗꯤꯌꯥ-ꯅꯦꯄꯥꯜ ꯇꯦꯔꯥꯏ ꯂꯝꯗ ꯁꯃꯥꯖ ꯑꯃꯁꯨꯡ ꯁꯔꯀꯥꯔꯒꯤ ꯇꯟꯇ꯭ꯔꯁꯤꯡꯒ ꯂꯣꯌꯅꯅ ꯊꯕꯛ ꯇꯧꯏ, ꯃꯆꯥꯁꯤꯡꯒꯤ ꯑꯗꯤꯀꯥꯔ ꯂꯥ걶ꯗ ꯍꯦꯟꯗꯣꯛꯄ ꯅꯇ্ꯇꯅ, ꯅꯤꯡꯊꯧ ꯄꯨꯟꯁꯤꯅꯕꯗ ꯈꯪꯅꯕ, ꯐꯪꯅꯕ ꯑꯃꯁꯨꯡ ꯏꯅꯥ ꯑꯣꯏꯅ ꯐꯪꯅꯕ ꯑꯣꯏꯍꯅꯕ.',
      hero_cta1:'ꯁꯃꯥꯖꯗ ꯂꯣꯏꯅ ꯂꯦꯄ', hero_cta2:'ꯑꯩꯈꯣꯏ ꯀꯔꯝꯅ ꯊꯕꯛ ꯇꯧꯏ ꯌꯦꯡꯕ', hero_photo:'ꯐꯣꯇꯣ — ꯃꯆꯥ ꯄꯥꯔꯂꯤꯌꯥꯃꯦꯟꯇꯒꯤ ꯃꯐꯝ ꯑꯃꯗꯤꯡ, ꯂꯣꯍꯔꯥ ꯈꯨꯜ, ꯕꯍ্ꯔꯥꯏꯆ',
      hero_principle:'কমিউনিটি অমসুং গৱর্নমেন্ত সিস্তেমশিং লোয়ননা থবক তৌবা, অঙাংশিং খুদিংমক গীদমক.',
      stat_children:'ꯐꯪꯈ্ꯔꯕ ꯃꯆꯥ ꯑꯃꯁꯨꯡ ꯅꯍꯥꯀꯄꯨꯁꯁꯤꯡ', stat_invested:'꯲꯰꯰꯰ ꯇꯒꯤ ꯁꯃꯥꯖꯒꯤ ꯇꯟꯇ꯭ꯔꯗ ꯅꯤꯕꯦꯁ ꯇꯧꯕ', stat_resources:'ꯐꯪꯈ্ꯔꯕ ꯁꯔꯀꯥꯔꯒꯤ ꯁꯦꯜꯒꯤ ꯑꯆꯤꯡꯕꯁꯤꯡ', stat_districts:'ꯔꯥꯖ꯭ꯌ ꯲ꯒꯤ ꯖꯤꯂꯥꯁꯤꯡ',
      stat_hint:'ꯃꯐꯝ ꯃꯔꯤ, ꯂꯣꯠꯄ ꯑꯣꯏ. ꯑꯃꯗ ꯇꯦꯞ ꯇꯧ ꯌꯦꯡꯅꯕ.', stat_reveal:'ꯌꯦꯡꯅꯕ ꯇꯦꯞ ꯇꯧ', stat_hide:'ꯂꯣꯠꯄ ꯇꯧ', stat_reveal_all:'ꯃꯔꯤ ꯄꯨꯝꯅꯃꯛ ꯉ걶ꯍꯟꯗꯣꯛ', stat_hide_all:'ꯄꯨꯝꯅꯃꯛ ꯂꯣꯠꯄ ꯇꯧ', grid_reveal_all:'ꯇꯔꯦꯠꯐꯨ ꯄꯨꯝꯅꯃꯛ ꯉ걶ꯍꯟꯗꯣꯛ', grid_hint:'ꯃꯐꯝ ꯇꯔꯦꯠꯐꯨ, ꯂꯣꯠꯄ ꯑꯣꯏ. ꯑꯃꯗ ꯇꯦꯞ ꯇꯧ ꯌꯦꯡꯅꯕ.', bl_drag:'ꯁꯔꯚꯦꯇ ꯃꯉꯥꯡꯗ ꯇꯦꯡꯕ',
      vision:'ꯅꯤꯡꯁꯤꯡ', mission:'ꯊꯧꯗꯝ', theory:'ꯍꯣꯡꯗꯣꯛꯄꯒꯤ ꯋꯥꯔꯦꯜ',
      vision_body:'ꯃꯆꯥꯒꯤ ꯃꯄꯨꯡꯐꯪꯕ ꯁꯣꯁꯥꯏꯇꯤꯗ ꯃꯆꯥ ꯄꯨꯝꯅꯃꯛꯅ ꯃꯈꯣꯌꯒꯤ ꯑꯗꯤꯀꯥꯔ ꯐꯪꯏ ꯑꯃꯁꯨꯡ ꯉꯥꯛꯊꯣꯛꯄ, ꯏꯖ্ꯖꯇ ꯑꯃꯁꯨꯡ ꯃꯄꯨꯡꯐꯥꯕ ꯄꯨꯟꯁꯤ ꯍꯤꯡꯒꯅꯤ.',
      mission_body:'ꯁꯃꯥꯖ ꯑꯃꯁꯨꯡ ꯇꯟꯇ꯭ꯔꯒ ꯂꯣꯌꯅꯅ ꯂꯩꯔꯤꯕ ꯄꯪꯒꯜ ꯑꯗꯨ ꯃꯄꯨꯡꯐꯥꯍꯅꯕ ꯊꯕꯛ ꯇꯧꯒꯅꯤ, ꯃꯆꯥꯁꯤꯡꯒꯤ ꯑꯗꯤꯀꯥꯔ ꯅꯤꯡꯊꯧ ꯄꯨꯟꯁꯤꯅꯕꯗ ꯈꯪꯅꯕ, ꯐꯪꯅꯕ ꯑꯃꯁꯨꯡ ꯏꯅꯥ ꯑꯣꯏꯅ ꯐꯪꯅꯕ ꯑꯣꯏꯍꯅꯕ.',
      theory_body:'ꯁꯃꯥꯖꯅ ꯊꯕꯛ ꯇꯧꯕ ꯑꯃꯁꯨꯡ ꯇꯟꯇ꯭ꯔꯅ ꯂꯣꯌꯅꯅ ꯄꯥ걶ꯒꯦꯜ ꯄꯤꯔꯕ ꯃꯇꯝꯗ, ꯃꯆꯥꯁꯤꯡꯒꯤ ꯍꯤꯡꯕ, ꯆꯥ걶ꯅꯕ, ꯉꯥꯛꯊꯣꯛꯄ ꯑꯃꯁꯨꯡ ꯄꯥꯡꯊꯣꯀꯄ ꯐꯪꯏ ꯑꯃꯁꯨꯡ ꯆꯠꯅꯔꯤ.',
      eyebrow_work:'ꯑꯩꯈꯣꯏꯅ ꯀꯔꯤ ꯇꯧꯏ', work_head:'ꯃꯐꯝ ꯃꯔꯤ, ꯑꯃꯇꯥ ꯑꯣꯏꯕ ꯄꯥ걶ꯒꯦꯜ.',
      eyebrow_where:'ꯑꯩꯈꯣꯏ ꯀꯗꯥꯏꯗ ꯊꯕꯛ ꯇꯧꯏ', where_head:'ꯖꯤꯂꯥ ꯲꯳. ꯔꯥꯖ꯭ꯌ ꯲. ꯑꯂꯣꯏ ꯑꯃꯇ.',
      where_sub:'ꯑꯩꯈꯣꯏ ꯎꯇ্ꯇꯔ ꯄ꯭ꯔꯗꯦꯁꯒꯤ ꯅꯣꯡꯄꯣꯛꯀꯤ ꯏꯟꯗꯤꯌꯥ-ꯅꯦꯄꯥꯜ ꯑꯂꯣꯏ ꯑꯃꯁꯨꯡ ꯃꯍꯥꯔꯥꯁ্ꯇ꯭ꯔꯗ ꯊꯕꯛ ꯇꯧꯏ — ꯃꯐꯝꯁꯤꯡꯗꯨ ꯑꯃꯇꯥ ꯑꯣꯏꯕ ꯑꯐꯕ ꯅꯠꯇꯕ ꯄꯥ걶ꯒꯦꯜ ꯑꯃꯒ ꯄꯨꯟꯁꯤꯅꯔꯤ. ꯃꯍꯥꯛꯀꯤ ꯋꯥꯔꯦꯞꯄ ꯌꯦꯡꯅꯕ ꯖꯤꯂꯥ ꯑꯃꯗ ꯇꯦꯞ ꯇꯧ.',
      eyebrow_cycle:'ꯄꯥ걶ꯒꯦꯜꯒꯤ ꯆꯀ্ꯔ', cycle_head:'ꯐꯠꯇꯅꯕꯁꯤꯡ ꯑꯃꯇ ꯑꯃꯇ ꯂꯥꯛꯇꯕ ꯅꯠꯇꯦ.',
      cycle_sub:'ꯃꯍꯥꯛꯀꯤ ꯏꯃꯨꯡ ꯃꯆꯥꯒꯤ ꯃꯆꯥꯗ ꯆꯪꯅ ꯆꯪꯅ ꯀꯪꯍꯟꯅꯤ — ꯇꯟꯇ꯭ꯔꯅ ꯃꯇꯝ ꯆꯥꯗ ꯄꯥ걶ꯒꯦꯜ ꯄꯤꯗ্ꯔꯕ ꯅꯠꯇ꯭ꯔꯒꯅꯤ. ꯄꯨꯛꯅꯤꯡ ꯆꯪꯅꯗꯕ ꯑꯃꯠꯇ ꯂꯩꯇ্ꯇꯦ: ꯃꯆꯥ ꯀꯉꯨꯗꯕ ꯑꯣꯏꯔꯒꯅ ꯐꯠꯇꯅꯕꯗꯨ ꯃꯇꯝ ꯀꯉꯨꯗꯕꯗꯒꯤꯅ ꯍꯧꯖꯤ걶ꯗꯣꯛꯄ ꯉꯝꯏ, ꯑꯃꯁꯨꯡ ꯐꯠꯇꯅꯕ ꯑꯃꯅ ꯃꯇꯝꯒꯤ ꯐꯠꯇꯅꯕꯕꯨ ꯅꯀꯄ ꯄꯨ걶ꯍꯟꯏ.',
      cycle_pick:'ꯃꯇꯝ ꯑꯃꯇ ꯇꯦꯞ ꯇꯧꯗꯨꯅ ꯃꯆꯥ ꯑꯃꯒꯤ ꯍꯤꯡꯄꯛ ꯀꯔꯝꯅ ꯁꯦꯃ্ꯒꯠꯂꯒ ꯑꯣꯏꯍꯅꯤ ꯌꯦꯡꯅꯕ.',
      cycle_note:'ꯃꯐꯝ ꯄꯨꯝꯅꯃꯛ ꯎꯇ্ꯇꯔ ꯄ꯭ꯔꯗꯦꯁꯀꯤ ꯏꯟꯗꯤꯌꯥ-ꯅꯦꯄꯥꯜ ꯇꯦꯔꯥꯏ ꯂꯝꯒꯤ ꯖꯤꯂꯥ ꯇꯔꯦꯠ — ꯕꯍ্ꯔꯥꯏꯆ, ꯁ্ꯔꯥꯕꯁ্ꯇꯤ, ꯕꯂꯔꯥꯝꯄꯨꯔ, ꯂꯈꯤꯃꯄꯨꯔ ꯀꯤꯔꯤ, ꯁꯤꯗ্ꯗꯥꯔ্ꯊꯅꯒꯔ, ꯃꯍꯔꯥꯖꯒꯪꯖ ꯑꯃꯁꯨꯡ ꯀꯨꯁꯤꯅꯒꯔ ꯑꯃꯗ ꯆꯦꯡꯅꯤꯡꯅ ꯃꯍꯥ걶ꯗ ꯍꯧꯖꯤ걶ꯗꯣꯛꯄ ꯐꯠꯇꯅꯕꯒꯤ ꯄꯥ걶ꯒꯦꯜ ꯑꯗꯨ ꯎꯠꯏ. ꯃꯄꯨꯡ ꯐꯥꯗꯨꯅꯥ: ꯍꯤꯡꯕ, ꯆꯥ걶ꯅꯕ ꯑꯃꯁꯨꯡ ꯄꯨꯔꯕꯒꯤ ꯄꯥ걶ꯒꯦꯜꯗ ꯅꯦꯁꯅꯦꯜ ꯐꯦꯃꯤꯂꯤ ꯍꯦꯜꯊ ꯁꯔꯚꯦ ꯫ (꯲꯰꯱꯹–꯲꯱)ꯀꯤ ꯖꯤꯂꯥ ꯐꯦꯛꯇ-ꯁꯤꯠ ꯗꯥꯇꯥꯁꯦꯠ (ꯍꯦꯜꯊ ꯑꯃꯁꯨꯡ ꯐꯦꯃꯤꯂꯤ ꯋꯦꯂꯐꯦꯌꯔꯒꯤ ꯃꯤꯅꯤꯁ্ꯇ꯭ꯔꯤ / ꯏꯟꯇꯔꯅꯦꯁꯅꯦꯜ ꯏꯅ্ꯁ্ꯇꯤꯇ্ꯌꯨꯠ ꯑꯐ ꯄꯣꯄꯨꯂꯦꯁꯟ ꯁꯥꯏꯟꯁ) ꯗꯒꯤ; ꯇꯃꯅꯕ ꯌꯦꯠꯅꯕ ꯐꯪꯅꯕ ꯏꯈ্ꯋꯥꯌꯗꯃꯗ ꯌꯨꯗꯥꯏꯁ ꯖꯤꯂꯥ ꯏꯗꯨꯀꯦꯁꯟ ꯏꯅ্ꯐꯣꯔꯃꯦꯁꯟ ꯁꯤꯁ্ꯇꯦꯝ ꯄ্ꯂꯁꯀꯤ ꯖꯤꯂꯥ ꯐꯦꯛꯇ-ꯁꯤꯠꯇꯒꯤ; ꯑꯃꯁꯨꯡ ꯃꯆꯥꯒꯤ ꯁꯤꯗꯕ ꯅꯨꯄꯤꯒꯤ ꯁꯤꯕꯒꯤꯅꯤ ꯁꯦꯝꯄꯜ ꯔꯦꯖꯤꯁ্ꯇ꯭ꯔꯦꯁꯟ ꯁꯤꯁ্ꯇꯦꯝꯇꯒꯤ, ꯃꯗꯨ ꯔꯥꯖ꯭ꯌ ꯃꯐꯝꯒꯤꯅꯤ. ꯍꯦꯜꯊꯀꯤ ꯃꯐꯝ ꯄꯨꯝꯅꯃꯛ ꯁꯔꯚꯦ ꯑꯃꯇ ꯗꯒꯤꯅꯤ ꯐꯪꯏ, ꯃꯗꯨꯅ ꯖꯤꯂꯥꯁꯤꯡ ꯆꯥ걶ꯅꯕ ꯇꯦꯡꯅꯕ ꯉꯝꯏ. ꯅꯨꯄꯤ ꯑꯃꯁꯨꯡ ꯃꯄꯨꯔꯣꯏꯕꯒꯤ ꯃꯔꯨꯑꯣꯏꯕ ꯍꯤꯡꯁꯤꯟꯅ ꯍꯦꯜꯊ ꯐꯦꯃꯤꯂꯤ ꯁꯔꯚꯦꯒꯤ ꯔꯥꯖ꯭ꯌ ꯃꯐꯝꯗ ꯍꯦꯟꯗꯣꯛꯏ, ꯑꯃꯁꯨꯡ ꯎꯇ্ꯇꯔ ꯄ꯭ꯔꯗꯦꯁꯀꯤ ꯃꯐꯝ ꯑꯣꯏꯅ ꯎꯠꯏ. ꯃꯐꯝ ꯃꯔꯤ — ꯃꯆꯥꯒꯤ ꯊꯕꯛ, ꯄꯨꯃ্ꯅꯃꯛꯇꯒꯤ ꯅꯦ걶ꯕ ꯆꯦ걶ꯒꯤ ꯈ걶ꯅꯅꯤꯡ ꯑꯃꯁꯨꯡ ꯄꯤꯇꯤ ꯑꯃꯁꯨꯡ ꯆꯍꯤ ꯃꯉꯥ ꯫ꯒꯤ ꯃꯅꯨꯡꯗ ꯑꯐꯕ ꯄꯤꯗ্ꯔꯕ ꯔꯦꯀꯣꯔꯗꯗ ꯂꯩꯔꯤ, ꯃꯁꯤꯗꯨ ꯐꯣꯡꯗꯣꯛꯏ. ꯏꯟꯗꯤꯌꯥꯅ ꯄꯤꯇꯤ ꯅꯇ্ꯇ꯭ꯔꯒ ꯆꯍꯤ ꯃꯉꯥ ꯫ꯒꯤ ꯈ걶ꯅꯅꯤꯡꯒꯤ ꯖꯤꯂꯥ ꯃꯐꯝꯒꯤ ꯁꯔꯀꯥꯔꯒꯤ ꯁꯦꯔꯤꯖ ꯄꯤꯗ্ꯔꯦ. ꯃꯐꯝ ꯄꯨꯝꯅꯃꯛꯅ ꯃꯁꯀꯤ ꯖꯤꯂꯥ ꯑꯃꯁꯨꯡ ꯍꯦꯜꯊ ꯐꯦꯃꯤꯂꯤ ꯂꯧꯔꯤ.',
      eyebrow_process:'ꯄ্ꯔꯣꯁꯦꯁ', process_head:'ꯁꯃꯥꯖꯅ ꯊꯕꯛ ꯇꯧꯕ ꯃꯇꯝꯗ, ꯇꯟꯇ꯭ꯔꯅ ꯄꯥ걶ꯒꯦꯜ ꯄꯤꯔꯤ.', eyebrow_stories:'ꯍꯣꯡꯗꯣꯛꯄꯒꯤ ꯋꯥꯔꯤꯁꯤꯡ',
      cta_donate:'ꯅꯤꯕꯦꯁ ꯇꯧ', cta_donate_b:'ꯁꯃꯥꯖꯅ ꯃꯄꯨ ꯑꯣꯏꯕ ꯊꯕꯛꯇ ꯁꯦꯜ ꯅꯇ্ꯔꯒ ꯄꯣꯠ, ꯑꯣꯟꯂꯥꯏꯟ ꯅꯇ্ꯔꯒ ꯑꯐ্ꯂꯥꯏꯟꯗ ꯃꯇꯦꯡ ꯄꯥꯡ.', cta_donate_a:'ꯍꯧꯖꯤꯛ ꯅꯤꯕꯦꯁ ꯇꯧ',
      cta_vol:'ꯅꯨꯡꯁꯤꯠ ꯁꯦꯚꯥ', cta_vol_b:'ꯏꯟꯇꯔꯅ ꯑꯣꯏꯕ, ꯚꯔ্ꯆꯨꯑꯦꯜꯗ ꯊꯕꯛ ꯇꯧꯕ, ꯅꯇ্ꯔꯒ DEHAT ꯐꯦꯂꯣ ꯑꯣꯏꯕ.', cta_vol_a:'ꯑꯩꯈꯣꯏꯒ ꯂꯣꯏꯅ ꯂꯦꯄ',
      cta_partner:'ꯄꯥꯔ্ꯇꯅꯔ', cta_partner_b:'ꯀꯔ্ꯄꯣꯔꯦꯠ, ꯑꯀꯥꯗꯦꯃꯤꯛ ꯅꯇ্ꯔꯒ ꯏꯟꯁ্ꯇꯤꯇ্ꯌꯨꯁꯅꯦꯜ ꯄꯥꯔ্ꯇꯅꯔꯁꯤꯞ.', cta_partner_a:'ꯂꯣꯏꯅ ꯊꯕꯛ ꯇꯧ',
      pillar_link_work:'ꯄ্ꯔꯣꯒ্ꯔꯥꯝ ꯃꯔꯤ ꯌꯦꯡꯅꯕ', pillar_link_how:'ꯑꯩꯈꯣꯏ ꯀꯔꯝꯅ ꯊꯕꯛ ꯇꯧꯏ ꯌꯦꯡꯅꯕ', stories_all:'ꯋꯥꯔꯤ ꯄꯨꯝꯅꯃꯛ ꯄꯥ',
      work_title:'ꯑꯗꯤꯀꯥꯔ, ꯅꯤꯡꯊꯧ ꯄꯨꯟꯁꯤꯗ ꯃꯄꯨꯡꯐꯥꯕ.',
      chrono_title:'ꯄ্ꯔꯣꯖꯦꯛꯇ ꯄꯨꯝꯅꯃꯛ, ꯃꯇꯝꯒꯤ ꯄꯨꯛꯆꯦꯟꯗ',
      count_label:'ꯔꯦꯀꯣꯔꯗꯗ ꯂꯩꯔꯤꯕ ꯄ্ꯔꯣꯖꯦꯛꯇ',
      open_programme:'ꯄ্ꯔꯣꯒ্ꯔꯥꯝ ꯍꯥꯡꯗꯣꯛ',
      work_sub:'ꯄ্ꯔꯣꯒ্ꯔꯥꯝ ꯃꯔꯤ, ꯍꯧꯔꯀꯄꯒꯤ ꯄꯨꯛꯆꯦꯟꯗ. ꯑꯃꯃꯃꯛ ꯃꯁꯒꯤ ꯄꯦꯖ ꯃꯐꯝꯗ ꯍꯥꯡꯗꯣꯛꯏ — ꯊꯕꯛ ꯀꯔꯤꯒꯤ ꯂꯩꯔꯤꯕꯒꯨ, ꯀꯔꯝꯅ ꯁꯦꯝꯈ্ꯔꯕꯒꯨ, ꯑꯃꯁꯨꯡ ꯄꯨꯀ্ꯆꯦꯟꯗ ꯄꯨ걶ꯍꯟꯈ্ꯔꯕ ꯄ্ꯔꯣꯖꯦꯛꯇ ꯄꯨꯝꯅꯃꯛꯄꯨ, ꯀꯔꯤ, ꯀꯗꯥꯏꯗ, ꯀꯔꯝꯅ, ꯀꯔꯤꯗꯥ, ꯀꯔꯤꯒꯤꯗꯃꯛ ꯑꯃꯁꯨꯡ ꯅꯤꯕꯦꯁꯀꯤ ꯃꯇꯦꯡꯗ.',
      portfolio_total:'ꯄꯥꯕ্ꯂꯤꯛ ꯔꯦꯀꯣꯔꯗꯗ ꯂꯩꯔꯤꯕ ꯄ্ꯔꯣꯖꯦꯛꯇ', portfolio_investment:'ꯄꯨꯟꯁꯤꯅꯕꯒꯤ ꯁꯣꯁꯤꯑꯦꯜ ꯅꯤꯕꯦꯁ',
      portfolio_count:'ꯄ্ꯔꯣꯒ্ꯔꯥꯝ ꯃꯔꯤꯗ ꯄ্ꯔꯣꯖꯦꯛꯇ',
      filter_year:'ꯆꯍꯤ', filter_state:'ꯔꯥꯖ꯭ꯌ', filter_district:'ꯖꯤꯂꯥ', filter_sdg:'ꯍꯧꯗꯣꯛꯄꯒꯤ ꯄꯥ걶ꯒꯦꯜ', filter_csr:'ꯀꯔ্ꯄꯣꯔꯦꯠ ꯁꯣꯁꯤꯑꯦꯜ ꯔꯦꯁ্ꯄꯣꯟꯁꯤꯕꯤꯂꯤꯇꯤ · ꯁꯦꯗꯨꯜ VII', filter_uncrc:'ꯃꯆꯥꯒꯤ ꯑꯗꯤꯀꯥꯔ', filter_investor:'ꯁꯣꯁꯤꯑꯦꯜ ꯅꯤꯕꯦꯁꯔ', filter_all:'ꯄꯨꯝꯅꯃꯛ',
      open_details:'ꯃꯄꯨꯡꯐꯥꯕ ꯔꯦꯀꯣꯔꯗ ꯍꯥꯡꯗꯣꯛ', close_details:'ꯔꯦꯀꯣꯔꯗ ꯅꯨꯃꯤꯠ ꯇꯧ', phases_label:'ꯐꯦꯖꯁꯤꯡ',
      annual_label:'ꯆꯍꯤ ꯀꯃꯗꯥ',
      cross_from:'ꯃꯁꯤꯁꯨ ꯃꯐꯝ ꯑꯃꯅꯤ',
      shared_note:'ꯂꯣꯏꯅꯅ ꯄꯥ걶ꯒꯦꯜ ꯁꯣꯁꯤꯑꯦꯜ ꯅꯤꯕꯦꯁꯀꯤ ꯃꯐꯝ:',
      d_what:'ꯑꯩꯈꯣꯏꯅ ꯄꯥ걶ꯒꯦꯜ ꯄꯤꯅꯕ ꯍꯧꯗꯣꯛꯈ্ꯔꯕ', d_why:'ꯃꯐꯝꯁꯤꯗ ꯃꯁꯤ ꯐꯖꯅꯕ ꯑꯣꯏꯔꯦ',
      d_how:'ꯁꯃꯥꯖ ꯑꯃꯁꯨꯡ ꯇꯟꯇ꯭ꯔꯅ ꯀꯔꯝꯅ ꯂꯣꯏꯅ ꯊꯕꯛ ꯇꯧꯈ্ꯔꯤꯕꯒꯤ', d_impact:'ꯄꯣꯀ্ꯄꯒꯤ ꯃꯐꯝ',
      d_investor:'ꯁꯣꯁꯤꯑꯦꯜ ꯅꯤꯕꯦꯁꯔ', d_investors:'ꯁꯣꯁꯤꯑꯦꯜ ꯅꯤꯕꯦꯁꯔꯁꯤꯡ', d_investment:'ꯁꯣꯁꯤꯑꯦꯜ ꯅꯤꯕꯦꯁ',
      m_when:'ꯀꯔꯤꯗꯥ ꯑꯃꯁꯨꯡ ꯃꯐꯝ ꯀꯔꯝꯕ', m_location:'ꯀꯗꯥꯏꯗ', m_sdg:'ꯍꯧꯗꯣꯛꯄꯒꯤ ꯄꯥ걶ꯒꯦꯜꯁꯤꯡ', m_csr:'ꯀꯔ্ꯄꯣꯔꯦꯠ ꯁꯣꯁꯤꯑꯦꯜ ꯔꯦꯁ্ꯄꯣꯟꯁꯤꯕꯤꯂꯤꯇꯤ · ꯁꯦꯗꯨꯜ VII', m_uncrc:'ꯃꯆꯥꯒꯤ ꯑꯗꯤꯀꯥꯔꯁꯤꯡ', m_law:'ꯏꯟꯗꯤꯌꯥꯒꯤ ꯋꯥꯌꯦꯜ ꯑꯃꯁꯨꯡ ꯄꯣꯂꯤꯁꯤꯒꯤ ꯃꯔꯨ', m_law_none:'ꯄ্ꯔꯣꯖꯦꯛꯇꯁꯤꯅꯃꯛꯀꯤꯗꯃꯛꯇ ꯑꯃꯠꯇ ꯑꯣꯏꯕ ꯋꯥꯌꯦꯜꯒꯤ ꯃꯔꯨ ꯔꯦꯀꯣꯔꯗ ꯇꯧꯗ্ꯔꯦ.',
      invest_note:'ꯔꯦꯀꯣꯔꯗ ꯇꯧꯔꯕ ꯃꯇꯨꯡꯗ ꯆꯨꯝꯅ ꯐꯣꯡꯗꯣꯛꯈ্ꯔꯤꯕꯅꯤ; ꯑꯃꯃꯃꯛꯇ ꯄꯨꯟꯁꯤꯗ্ꯔꯦ.',
      impact_eyebrow:'ꯄꯣꯀ্ꯄ', impact_title:'꯲꯰꯰꯰ ꯇꯒꯤ, ꯁꯃꯥꯖꯒ ꯂꯣꯏꯅ, ꯃꯍꯥꯛꯀꯤ ꯑꯗꯤꯀꯥꯔ ꯍꯧꯔꯀꯄ ꯑꯃꯁꯨꯡ ꯁꯔꯀꯥꯔꯒꯤ ꯇꯟꯇ꯭ꯔꯒ ꯂꯣꯏꯅ ꯊꯕꯛ ꯇꯧꯈ্ꯔꯕꯒꯤ.',
      impact_sub:'꯱꯹꯸꯹ꯗ ꯅꯍꯥꯀꯄꯨꯁꯀꯤ ꯀꯣꯂꯦꯛꯇꯤꯚ ꯑꯃꯒꯨꯝꯅ ꯍꯧꯔꯀꯈ্ꯔꯕ, ꯲꯰꯰꯰ꯗ ꯔꯦꯖꯤꯁ্ꯇ꯭ꯔꯦꯁꯟ ꯇꯧꯈ্ꯔꯤ. ꯃꯐꯝꯁꯤꯡꯁꯤꯅ ꯃꯆꯥꯛ ꯉꯝꯕꯗꯨ ꯎꯠꯏ; ꯃꯁꯤꯒꯤ ꯃꯅꯨꯡꯗ ꯁꯃꯥꯖ, ꯐꯤꯜꯗꯗ ꯊꯕꯛ ꯇꯧꯕꯁꯤꯡ ꯑꯃꯁꯨꯡ ꯁꯔꯀꯥꯔꯒꯤ ꯏꯟꯁ্ꯇꯤꯇ্ꯌꯨꯁꯅꯁꯤꯡꯅ ꯂꯣꯏꯅ ꯊꯕꯛ ꯇꯧꯏ.',
      reach_head:'ꯍꯧꯖꯤꯛ ꯐꯥꯑꯣꯕ ꯂꯃꯗꯥꯡꯒꯤ ꯐꯪꯅꯕ', reach_states:'ꯔꯥꯖ꯭ꯌꯁꯤꯡ', reach_districts:'ꯖꯤꯂꯥꯁꯤꯡ', reach_blocks:'ꯕ্ꯂꯛꯁꯤꯡ', reach_villages:'ꯈꯨꯜꯁꯤꯡ', reach_children:'ꯃꯆꯥ ꯑꯃꯁꯨꯡ ꯅꯍꯥꯀꯄꯨꯁꯁꯤꯡ', reach_farmers:'ꯅꯨꯄꯤ ꯂꯧꯃꯤꯁꯤꯡ',
      stories_eyebrow:'ꯍꯣꯡꯗꯣꯛꯄꯒꯤ ꯋꯥꯔꯤꯁꯤꯡ', stories_title:'ꯑꯆꯨꯝꯕ ꯄꯣꯛꯄ, ꯃꯇꯨꯡꯗ ꯍꯣꯡꯗꯣꯛꯄ.',
      stories_sub:'ꯋꯥꯔꯤ ꯈ্ꯖꯤꯅꯕ ꯄꯨꯝꯅꯃꯛ ꯃꯆꯥꯒꯤ ꯑꯗꯤꯀꯥꯔ ꯃꯔꯤꯒꯤ ꯃꯅꯨꯡꯗ ꯑꯃꯗ ꯍꯦꯟꯅ ꯁꯦꯝꯈ্ꯔꯤ — ꯍꯤꯡꯕ, ꯆꯥ걶ꯅꯕ, ꯉꯥꯛꯊꯣꯛꯄ, ꯄꯥꯡꯊꯣꯀꯄ.',
      involved_eyebrow:'ꯄꯥꯡꯊꯣꯀ', involved_title:'ꯂꯩꯔꯤꯕ ꯄꯪꯒꯜ ꯑꯗꯨ ꯍꯧꯗꯣꯛꯄ — ꯑꯩꯈꯣꯏꯒ ꯂꯣꯏꯅ.',
      involved_sub:'ꯅꯍꯥꯛꯅ ꯄꯨꯡ ꯑꯃ, ꯄꯥ걶ꯒꯦꯜ ꯑꯃ ꯅꯇ্ꯔꯒ ꯁꯦꯜ ꯑꯃ ꯄꯤꯗꯨꯅ, ꯅꯍꯥꯛ ꯄꯥ걶ꯒꯦꯜ ꯄꯤꯕ ꯇꯟꯇ꯭ꯔ ꯑꯃꯒꯤ ꯃꯐꯝ ꯑꯣꯏꯍꯅꯤ.',
      involved_cta_title:'ꯁꯃꯥꯖꯒ ꯂꯣꯏꯅ ꯅꯤꯕꯦꯁ ꯇꯧ.',
      involved_cta_sub:'ꯁꯦꯜ ꯅꯇ্ꯔꯒ ꯄꯣꯠ, ꯑꯣꯟꯂꯥꯏꯟ ꯅꯇ্ꯔꯒ ꯑꯐ্ꯂꯥꯏꯟ — ꯁꯦꯜ ꯄꯨꯝꯅꯃꯛ ꯁꯃꯥꯖꯅ ꯑꯩꯈꯣꯏ ꯆꯠꯈ্ꯔꯕꯒꯤ ꯃꯇꯨꯡꯗꯁꯨ ꯐꯡꯗꯣꯛꯄ ꯉꯝꯕ ꯄꯨ걶ꯍꯟꯕꯗ ꯆꯪꯏ.',
      donate_now:'ꯄꯥꯔ্ꯇꯅꯔꯁꯤꯞ ꯍꯧꯗꯣꯛ', email_us:'ꯑꯩꯈꯣꯏꯗ ꯏꯃꯦꯏꯜ ꯄꯤꯕꯤꯌꯨ', f_email:'ꯏꯃꯦꯏꯜ', f_phone:'ꯐꯣꯟ', f_web:'ꯋꯦꯕ', f_address:'ꯂꯃꯗꯝ',
      nav_finance:'ꯆꯤꯡꯅꯕ', nav_answers:'ꯄꯥ걶ꯅꯤꯡꯁꯤꯡ',
      fin_eyebrow:'ꯁꯦꯜꯒꯤ ꯆꯤꯡꯅꯕ', fin_title:'ꯁꯦꯜ ꯄꯨꯝꯅꯃꯛ ꯔꯦꯀꯣꯔꯗꯗ ꯂꯩꯔꯤ.',
      fin_sub:'ꯑꯀꯨꯞꯄ ꯑꯣꯏꯅ ꯑꯗꯤꯠ ꯇꯧꯕ ꯆꯣꯠꯄꯨꯁꯤꯡ — ꯅꯤꯕꯦꯁ ꯄꯥꯔ্ꯇꯅꯔꯁꯤꯡꯅ ꯀꯔꯤ ꯋꯥꯁꯦꯝꯈ্ꯔꯤꯕꯒꯨ, ꯊꯕꯛꯇ ꯀꯔꯤ ꯐꯪꯈ্ꯔꯤꯕꯒꯨ, ꯑꯃꯁꯨꯡ ꯃꯗꯨ ꯑꯅꯤꯃꯛꯀꯤ ꯃꯅꯨꯡꯗ ꯋꯥꯌꯦꯜꯒꯤ ꯌꯦꯡꯆꯤꯟꯕ. ꯃꯐꯝ ꯄꯨꯝꯅꯃꯛ ꯁꯥꯏꯟ ꯇꯧꯈ্ꯔꯕ ꯕꯦꯂꯦꯟꯁ ꯁꯤꯠꯇꯒꯤꯅꯤ ꯐꯪꯏ.',
      fin_stat_received:'ꯆꯍꯤ ꯲꯰ ꯀꯨꯃꯗ ꯋꯥꯁꯦꯝꯈ্ꯔꯕ', fin_stat_fcra:'ꯃꯄꯨꯡ ꯄꯤꯕ ꯁꯦꯜ · FCRA ꯑꯦꯛꯇ', fin_stat_inr:'ꯃꯐꯝꯒꯤ ꯁꯦꯜ · ꯏꯟꯗꯤꯌꯥꯒꯤ ꯔꯨꯄꯤ', fin_stat_funders:'ꯔꯦꯀꯣꯔꯗ ꯇꯧꯔꯕ ꯅꯤꯕꯦꯁ ꯄꯥꯔ্ꯇꯅꯔꯁꯤꯡ',
      fin_years_head:'ꯆꯍꯤ ꯀꯃꯗꯥ', fin_years_sub:'ꯀꯔꯤ ꯆꯠꯈ্ꯔꯤꯕꯒꯨ, ꯀꯔꯤ ꯁꯦꯜ ꯊꯥꯗꯣꯛꯈ্ꯔꯤꯕꯒꯨ, ꯑꯃꯁꯨꯡ ꯀꯅꯅ ꯋꯥꯌꯦꯜ ꯁꯥꯏꯟ ꯇꯧꯈ্ꯔꯤꯕꯒꯤ. ꯆꯍꯤ ꯑꯃ ꯈꯜꯗꯨꯅ ꯃꯍꯥꯛꯀꯤ ꯁꯣꯁꯤꯑꯦꯜ ꯅꯤꯕꯦꯁꯔꯁꯤꯡ ꯌꯦꯡꯕꯤꯌꯨ.',
      fin_received:'ꯋꯥꯁꯦꯝꯈ্ꯔꯕ', fin_utilised:'ꯁꯤꯖꯤꯟꯅꯈ্ꯔꯕ', fin_auditor:'ꯑꯗꯤꯠ ꯇꯧꯕ ꯃꯤ', fin_bs:'ꯕꯦꯂꯦꯟꯁ ꯁꯤꯠ', fin_surplus:'ꯍꯦꯟꯗꯣꯛꯄ', fin_deficit:'ꯋꯥꯏꯍꯜ', fin_partial:'ꯃꯄꯨꯡ ꯐꯥꯗꯕ ꯃꯐꯝ', fin_compiled:'ꯄꯨꯟꯁꯤꯅꯈ্ꯔꯕ',
      fin_funders_head:'ꯀꯅꯅ ꯊꯕꯛꯇꯁꯤꯗ ꯅꯤꯕꯦꯁ ꯇꯧꯏ', fin_funders_sub:'ꯃꯍꯥꯛꯀꯤ ꯁꯦꯜꯅ ꯊꯕꯛꯇꯁꯤ ꯄꯥ걶ꯒꯦꯜ ꯄꯤꯕ ꯏꯟꯁ্ꯇꯤꯇ্ꯌꯨꯁꯅ ꯑꯃꯁꯨꯡ ꯃꯤꯁꯤꯡ ꯑꯗꯨꯅꯤ — ꯂꯣꯏꯅ ꯐꯪꯅꯕ ꯃꯄꯨꯡ ꯐꯪꯅꯕꯒꯤ ꯄꯥꯔ্ꯇꯅꯔꯁꯤꯡ, ꯑꯃꯗꯥ ꯆꯪꯕ ꯄꯤꯕ ꯃꯤ ꯅꯠꯇꯦ. ꯋꯥꯌꯦꯜꯅ ꯇꯥꯗ্ꯔꯤꯕꯒꯨꯝꯅ ꯃꯄꯨꯡ ꯄꯤꯕ ꯁꯦꯜ FCRA ꯑꯦꯛꯇꯀꯤ ꯑꯇꯣꯞꯄ ꯑꯦꯀꯥꯎꯟꯇꯗ ꯊꯝꯏ ꯑꯃꯁꯨꯡ ꯑꯗꯤꯠ ꯇꯧꯏ; ꯃꯐꯝꯒꯤ ꯁꯦꯜꯅ ꯔꯨꯄꯤ ꯑꯦꯀꯥꯎꯟꯇꯅ ꯆꯠꯏ.',
      fin_regime_fcra:'FCRA ꯑꯦꯛꯇ · ꯃꯄꯨꯡ ꯄꯤꯕ', fin_regime_inr:'ꯏꯟꯗꯤꯌꯥꯒꯤ ꯔꯨꯄꯤ · ꯃꯐꯝꯒꯤ',
      fin_funders_cta:'ꯄꯥꯔ্ꯇꯅꯔ ꯄꯨꯝꯅꯃꯛ ꯌꯦꯡꯅꯕ',
      fin_compliance_head:'ꯋꯥꯌꯦꯜꯒꯤ ꯏꯉꯅꯕ', fin_compliance_sub:'DEHAT ꯑꯗꯨ ꯔꯦꯖꯤꯁ্ꯇ꯭ꯔꯦꯁꯟ ꯇꯧꯔꯕ ꯁꯣꯁꯥꯏꯇꯤ ꯑꯃꯅꯤ (ꯁꯣꯁꯥꯏꯇꯤ ꯔꯦꯖꯤꯁ্ꯇ꯭ꯔꯦꯁꯟ ꯑꯦꯛꯇ, ꯱꯸꯶꯰). ꯃꯈꯥꯗ ꯆꯍꯤ ꯈꯨꯗꯤꯡꯒꯤ ꯄꯥ걶ꯗꯅꯕꯒꯤ ꯆꯛ্ꯔ ꯑꯗꯨ ꯌꯦꯡꯅꯤ, ꯑꯃꯁꯨꯡ ꯃꯗꯨ DEHATꯅ ꯐꯥꯏꯜ ꯇꯧꯏ.',
      fin_reg_head:'ꯔꯦꯖꯤꯁ্ꯇ꯭ꯔꯦꯁꯟꯁꯤꯡ', fin_cal_head:'ꯆꯍꯤꯒꯤ ꯐꯥꯏꯜꯤꯡ ꯀꯦꯂꯦꯟꯗꯔ', fin_rules_head:'ꯑꯩꯈꯣꯏꯅ ꯀꯔꯤꯒꯤ ꯃꯃꯥꯡꯗ ꯔꯤꯄꯣꯔꯠ ꯇꯧꯏ',
      fin_auditor_trail:'ꯆꯍꯤ ꯈꯨꯗꯤꯡꯒꯤ ꯊꯕꯛ ꯇꯧꯔꯤꯕ ꯆꯥꯔ্ꯇꯔ ꯑꯦꯀꯥꯎꯟꯇꯦꯟꯇꯅ ꯑꯗꯤꯠ ꯇꯧꯏ ꯑꯃꯁꯨꯡ ꯑꯃꯠꯇ ꯑꯣꯏꯕ ꯗꯣꯀꯨꯃꯦꯟꯇ ꯑꯥꯏꯗꯦꯟꯇꯤꯐꯤꯀꯦꯁꯟ ꯅꯝꯕꯔꯒ ꯁꯥꯏꯟ ꯇꯧꯏ. ꯃꯃꯥꯡꯒꯤ ꯆꯍꯤ ꯆꯥꯃ ꯃꯅꯨꯡꯗ ꯐꯔ্ꯃ ꯃꯉꯥ ꯅꯤ ꯋꯥꯌꯦꯜꯗꯨ ꯌꯦꯡꯈ্ꯔꯤ — ꯍꯦꯟꯅ ꯑꯃꯇ ꯂꯣꯏꯅ ꯂꯦꯄ ꯂꯩꯇꯦ.',
      fin_due:'ꯄꯤꯕ ꯇꯥꯕ', fin_year_funders:'ꯆꯍꯤ ꯑꯁꯤꯒꯤ ꯅꯤꯕꯦꯁ ꯄꯥꯔ্ꯇꯅꯔꯁꯤꯡ',
      fin_docs_head:'ꯁꯦꯡꯐꯪꯕ ꯑꯃꯁꯨꯡ ꯗꯣꯀꯨꯃꯦꯟꯇꯁꯤꯡ', fin_docs_sub:'ꯔꯦꯖꯤꯁ্ꯇ꯭ꯔꯦꯁꯟ, ꯌꯥꯐꯕ ꯑꯃꯁꯨꯡ ꯑꯇꯦꯒꯤ ꯃꯤꯗꯒꯤ ꯌꯥꯐꯕ ꯄꯨꯝꯅꯃꯛ — ꯑꯍꯥꯟꯕ ꯁꯤꯔ্ꯇꯤꯐꯤꯀꯦꯠꯇꯒꯤ ꯁ্ꯀꯦꯅ ꯇꯧꯈ্ꯔꯤꯕꯅꯤ. ꯑꯗꯣꯝꯁꯤꯡ ꯗꯣꯀꯨꯃꯦꯟꯇ ꯄꯥꯅꯕ ꯑꯃꯠꯇ ꯍꯥꯡꯗꯣꯛ.',
      fin_docg_statutory:'ꯔꯦꯖꯤꯁ্ꯇ꯭ꯔꯦꯁꯟ ꯑꯃꯁꯨꯡ ꯇꯦꯛꯁ', fin_docg_fcra:'ꯃꯄꯨꯡ ꯄꯤꯕ ꯁꯦꯜ · FCRA ꯑꯦꯛꯇ', fin_docg_validation:'ꯌꯥꯐꯕ ꯑꯃꯁꯨꯡ ꯈꯦꯜꯆꯤꯟꯕ',
      fin_doc_view:'ꯗꯣꯀꯨꯃꯦꯟꯇ ꯌꯦꯡꯅꯕ', fin_pending_label:'ꯑꯗꯤꯠ ꯇꯧꯔꯕ ꯁ্ꯀꯦꯅ ꯐꯥꯏꯂꯗ ꯂꯩꯔꯤ — ꯃꯐꯝꯁꯤꯡ ꯗꯤꯖꯤꯇꯦꯜ ꯇꯧꯔꯤ',
      foot_explore:'ꯌꯦꯡꯁꯤꯟꯅꯕ', foot_reach:'ꯑꯩꯈꯣꯏꯗ ꯃꯄꯨꯡ ꯐꯥꯏꯍꯤꯟꯅꯕ', foot_follow:'ꯊꯕꯛꯀ ꯂꯣꯏꯅ ꯂꯦꯞꯄ',
      foot_desc:'ꯃꯤꯑꯣꯏꯕꯒꯤ ꯄꯨꯅꯁꯤꯅꯕꯒꯤ ꯑꯐꯕꯗ ꯄꯨꯡꯅꯕ ꯁꯦꯡꯓꯦꯕ — ꯁꯃꯥꯖ ꯑꯃꯁꯨꯡ ꯇꯟꯇ꯭ꯔꯒ ꯂꯣꯏꯅ ꯊꯕꯛ ꯇꯧꯏ ꯃꯆꯥꯁꯤꯡꯒꯤ ꯑꯗꯤꯀꯥꯔ ꯈ걶ꯅꯅꯕ, ꯐꯪꯅꯕ ꯑꯃꯁꯨꯡ ꯉꯥꯛꯊꯣꯛꯄ ꯑꯣꯏꯍꯅꯕ.',
      foot_rights:'© ꯲꯰꯲꯶ DEHAT · ꯱꯹꯸꯹ꯗ ꯅꯍꯥꯀꯄꯨꯁꯀꯤ ꯀꯣꯂꯦꯛꯇꯤꯚ ꯑꯃꯒꯨꯝꯅ ꯍꯧꯔꯀꯈ্ꯔꯕ · ꯲꯰꯰꯰ꯗ ꯔꯦꯖꯤꯁ্ꯇ꯭ꯔꯦꯁꯟ ꯇꯧꯈ্ꯔꯕ',
    };
    return { en: EN, hi: HI, zh: ZH, fr: FR, ru: RU, es: ES, ar: AR, ur: UR, ks: KS, bn: BN, mr: MR, te: TE, ta: TA, gu: GU, kn: KN, mai: MAI, as: AS, ne: NE, kok: KOK, sa: SA, sd: SD, or: OR, ml: ML, pa: PA, doi: DOI, brx: BRX, sat: SAT, mni: MNI };
  }

  _canonName(raw) {
    const DROP = ['Community-supported origins', 'Implemented in partnership', 'Implemented through', 'The Government child-protection system'];
    const MAP = {
      'ActionAid Association': 'ActionAid Association',
      'ActionAid International India': 'ActionAid Association',
      'ActionAid International India, Lucknow': 'ActionAid Association',
      'United Nations Children\u2019s Fund': 'United Nations Children\u2019s Fund',
      'United Nations Children\u2019s Fund, Lucknow': 'United Nations Children\u2019s Fund',
      'Programme supported by the United Nations Children\u2019s Fund': 'United Nations Children\u2019s Fund',
      'Programme association with the United Nations Children\u2019s Fund is recorded in DEHAT\u2019s health brief': 'United Nations Children\u2019s Fund',
      'Childline India Foundation, until August 2023': 'CHILDLINE India Foundation',
    };
    const s = String(raw || '').trim();
    if (!s) return null;
    if (DROP.some(d => s.indexOf(d) === 0)) return null;
    return MAP[s] || s;
  }
  _canonInvestors(list) {
    const DROP = [
      'Community-supported origins', 'Implemented in partnership', 'Implemented through',
      'The Government child-protection system',
    ];
    const MAP = {
      'ActionAid Association': 'ActionAid Association (formerly ActionAid International India)',
      'ActionAid International India': 'ActionAid Association (formerly ActionAid International India)',
      'ActionAid International India, Lucknow': 'ActionAid Association (formerly ActionAid International India)',
      'United Nations Children\u2019s Fund': 'United Nations Children\u2019s Fund (UNICEF)',
      'United Nations Children\u2019s Fund, Lucknow': 'United Nations Children\u2019s Fund (UNICEF)',
      'Programme supported by the United Nations Children\u2019s Fund': 'United Nations Children\u2019s Fund (UNICEF)',
      'Programme association with the United Nations Children\u2019s Fund is recorded in DEHAT\u2019s health brief': 'United Nations Children\u2019s Fund (UNICEF)',
      'Childline India Foundation, until August 2023': 'CHILDLINE India Foundation',
    };
    const out = new Set();
    (list || []).forEach(raw => { const c = this._canonName(raw); if (c) out.add(c); });
    return Array.from(out).sort((a, b) => a.localeCompare(b));
  }
  // Token-set equality against finance-data's canonical names and aliases. Equality only —
  // a looser match would attach one funder's rupees to another's card.
  _funderKey(s) {
    const STOP = { the: 1, of: 1, and: 1, a: 1, india: 1, indian: 1, ltd: 1, limited: 1, pvt: 1, inc: 1, csr: 1, e: 1, v: 1 };
    return String(s || '').toLowerCase().replace(/\(.*?\)/g, ' ').replace(/[^a-z0-9]+/g, ' ')
      .split(' ').filter(w => w && !STOP[w]).sort().join(' ');
  }
  _investorRegistry(allProjects, PROGS, dims) {
    const NAMED = ['World Neighbors', 'Just Rights for Children', 'Azim Premji Philanthropic Initiatives', 'Dasra'];
    const PAST = ['Kailash Satyarthi Children\u2019s Foundation (United States)', 'Scottish Catholic International Aid Fund', 'Caritas India', 'She\u2019s the First'];
    const REL = { 'Rebuild India Fund': 'A Dasra Initiative' };
    const SKIP = ['KABIR, New Delhi'];
    const isLive = (p) => /active|renewed|ongoing/i.test(String(p.status || '')) || (p.yearEnd && p.yearEnd >= 2026);
    const byName = {};
    (allProjects || []).forEach(p => {
      (p.investors || []).forEach(raw => {
        const n = this._canonName(raw);
        if (!n || SKIP.indexOf(n) >= 0) return;
        const r = byName[n] || (byName[n] = { name: n, progs: {}, count: 0, from: null, to: null, live: false, facets: {} });
        (dims || []).forEach(d => {
          const bag = r.facets[d.key] || (r.facets[d.key] = {});
          (d.get(p) || []).forEach(v => { v = String(v || '').trim(); if (v) bag[v] = 1; });
        });
        r.count += 1;
        if (isLive(p)) r.live = true;
        if (p.prog) r.progs[p.prog] = true;
        if (p.yearStart) r.from = r.from == null ? p.yearStart : Math.min(r.from, p.yearStart);
        const end = p.yearEnd || p.yearStart;
        if (end) r.to = r.to == null ? end : Math.max(r.to, end);
      });
    });
    const nameOf = (k) => ((PROGS || []).find(x => x.key === k) || {}).name || (this._progExtra()[k] || k);
    return Object.keys(byName).sort((a, b) => a.localeCompare(b)).map(k => {
      const r = byName[k];
      const named = NAMED.indexOf(r.name) >= 0;
      const past = PAST.indexOf(r.name) >= 0;
      return {
        name: r.name,
        rel: REL[r.name] || '',
        slug: r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        progKeys: Object.keys(r.progs),
        progNames: Object.keys(r.progs).map(nameOf),
        count: r.count,
        facets: r.facets,
        span: r.from ? (r.from === r.to ? String(r.from) : r.from + '\u2013' + r.to) : '\u2014',
        current: !past && (named || r.live),
        named, live: r.live,
      };
    });
  }
  _progExtra() {
    const T = { ...this._dict().en, ...(this._dict()[this.state.lang] || {}) };
    return { inst: T.prog_extra_inst };
  }
  _investmentCase(tok) {
    const T = { ...this._dict().en, ...(this._dict()[this.state.lang] || {}) };
    const kv = (arr, pre) => arr.map((t, i) => ({ k: pre + i, t, col: tok(['#EAAE28', '#0E5565', '#556223', '#D2305C', '#4F0E73', '#0E9CB8'][i % 6]) }));
    const retArt = ['sm-prog-rights-entitlements', 'sm-school-steps-gate', 'sm-prog-climate-justice', 'sm-aadhaar-mother', 'sm-market-stall'];
    return {
      caseReturns: kv([
        T.case_return_0, T.case_return_1, T.case_return_2, T.case_return_3, T.case_return_4,
      ], 'cr').map((r, i) => Object.assign(r, { imgCss: 'url(./assets/story/' + retArt[i % retArt.length] + '.png)', delay: (i * 90) + 'ms' })),
      caseSwaps: [
        { k: 'cs0', not: T.case_swap_0_not, but: T.case_swap_0_but, col: tok('#EAAE28') },
        { k: 'cs1', not: T.case_swap_1_not, but: T.case_swap_1_but, col: tok('#0E5565') },
        { k: 'cs2', not: T.case_swap_2_not, but: T.case_swap_2_but, col: tok('#556223') },
      ],
      caseWhy: kv([
        T.case_why_0, T.case_why_1, T.case_why_2, T.case_why_3, T.case_why_4,
      ], 'cw'),
      caseNots: kv([T.case_not_0, T.case_not_1, T.case_not_2], 'cn'),
      // Fixed dark panel in both themes, so these accents are pinned to the light set
      // rather than routed through tok() (which follows page, not panel, polarity).
      caseIn: [
        T.case_in_0, T.case_in_1, T.case_in_2, T.case_in_3,
      ].map((t, i) => ({ k: 'ci' + i, t, col: ['#EAAE28', '#7FD6E4', '#C2CE72', '#F0907C'][i] })),
    };
  }
  // Slugs for which a true vector file exists at assets/logos/<slug>.svg.
  // Rasters in assets/logos are normalised: transparent background, trimmed, and scaled
  // so every mark carries the same optical weight on a 1200x400 canvas.
  // SVG is preferred over PNG wherever present — drop an .svg in and add the slug here.
  _logoVector() { return []; }
  _logoSlugs() {
    return ['bill-and-melinda-gates-foundation','agricultural-finance-corporation-limited','acc-limited','acc-trust','actionaid-association','alliance-for-immunization-and-health','azim-premji-foundation','azim-premji-philanthropic-initiatives','baif-development-research-foundation','birlasoft-limited','caritas-india','centum-foundation','centum-workskills-india-limited','charity-science','child-rights-and-you','childline-india-foundation','dasra','deutscher-caritasverband-e-v-caritas-germany','directorate-of-education-government-of-uttar-pradesh','free-a-girl','german-federal-ministry-for-economic-cooperation-and-development','government-of-uttar-pradesh-forest-department','iimpact-gurgaon','japan-international-cooperation-agency','just-rights-for-children','kailash-satyarthi-children-s-foundation-united-states','milaan-foundation','ministry-of-women-and-child-development-government-of-india','national-bank-for-agriculture-and-rural-development','national-commission-for-protection-of-child-rights','national-stock-exchange-foundation','oxfam-india','path-international','poorest-areas-civil-society-programme','rebuild-india-fund','rotary-india-literacy-mission','sahyog-lucknow','scottish-catholic-international-aid-fund','she-s-the-first','tata-trusts','ipartner-india','lily-against-human-trafficking','indo-global-social-service-society','gram-niyojan-kendra','plan-india','united-nations-children-s-fund','united-nations-development-programme','world-neighbors'];
  }
  _partnerView(allProjects, FIN, PROGS) {
    const P = (this._pt || {})[this.state.lang] || (this._pt || {}).en;
    if (!P) return null;
    const S = this.state, tok = (h) => this._tok(h);
    const fcra = S.dRegime === 'fcra';
    const sel = (S.pIntents || []);
    // Localised copy decks may not carry the what/why/when/where/how detail yet. The route
    // page renders that detail as the whole body of a card, so fall back to the English
    // entry rather than shipping an empty card.
    const EN_INT = {};
    ((((this._pt || {}).en) || {}).intents || []).forEach(i => { EN_INT[i.k] = i; });
    const shown = P.intents.filter(i => !S.pWho || i.for.indexOf(S.pWho) >= 0)
      .map(i => (i.detail ? i : Object.assign({}, i, { detail: (EN_INT[i.k] || {}).detail })));
    const restCount = P.intents.length - shown.length;
    const canNext = [!!S.pWho, sel.length > 0, !!(S.pName && S.pEmail)][S.pStep];
    const T = { ...this._dict().en, ...(this._dict()[S.lang] || {}) };
    const subject = T.mail_subject_prefix + ' \u2014 ' + (S.pOrg || S.pName || T.mail_subject_fallback);
    const body = this._mailBody(P, T);
    const href = 'mailto:joinus@dehatindia.org?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    const ivDims = this._dims(T).filter(d => d.key !== 'investor');
    const reg = this._investorRegistry(allProjects, PROGS, ivDims);
    const ivF = S.ivFacets || {};
    const ivFiltered = reg.filter(r =>
      (S.ivStatus === 'all' || (S.ivStatus === 'current' ? r.current : !r.current))
      && (S.ivProg === 'all' || r.progKeys.indexOf(S.ivProg) >= 0)
      && ivDims.every(d => { const v = ivF[d.key]; return !v || v === 'all' || !!(r.facets[d.key] || {})[v]; }));
    const ivFilters = ivDims.map(d => {
      const vals = {};
      reg.forEach(r => Object.keys(r.facets[d.key] || {}).forEach(v => (vals[v] = 1)));
      return {
        k: d.key, label: d.label, value: ivF[d.key] || 'all',
        opts: [{ value: 'all', label: 'All' }].concat(Object.keys(vals).sort((a, b) =>
          d.key === 'year'
            ? String(b).localeCompare(String(a), undefined, { numeric: true })
            : a.localeCompare(b, undefined, { numeric: true }))
          .map(v => ({ value: v, label: v }))),
        onChange: (e) => { const v = e.target.value;
          // The status toggle follows the year: a year past the current one can only hold
          // live commitments, an earlier one only concluded work. The current year holds
          // both, so it leaves the toggle alone.
          let flip = null;
          if (d.key === 'year' && /^\d{4}/.test(v)) {
            const y = parseInt(v, 10), now = new Date().getFullYear();
            if (y > now) flip = 'current'; else if (y < now) flip = 'past';
          }
          this.setState(st => Object.assign(
            { ivFacets: { ...(st.ivFacets || {}), [d.key]: v } },
            (flip && st.ivStatus !== flip) ? { ivStatus: flip } : {})); },
      };
    });
    const ivAnyFacet = ivDims.some(d => ivF[d.key] && ivF[d.key] !== 'all');
    const ivClear = () => this.setState({ ivFacets: {} });
    const HASLOGO = this._logoSet || (this._logoSet = this._logoSlugs().reduce((a, s) => (a[s] = 1, a), {}));
    const VEC = this._vecSet || (this._vecSet = this._logoVector().reduce((a, s) => (a[s] = 1, a), {}));
    const investors = ivFiltered.map(r => ({
      k: 'iv-' + r.slug, slug: r.slug, name: r.name,
      hasLogo: !!HASLOGO[r.slug], noLogo: !HASLOGO[r.slug],
      // The URL is attached after mount via a ref. A {{ }} hole written into src would be
      // fetched verbatim by the HTML parser as the template streams, before values bind.
      logoList: HASLOGO[r.slug]
        ? [{ k: 'l', alt: r.name, setSrc: (el) => { if (el) el.src = './assets/logos/' + r.slug + (VEC[r.slug] ? '.svg' : '.png'); } }]
        : [],
      ...(function (f) {
        return f
          ? { amt: f.total, regime: f.regime, regimeCol: f.regimeColor, regimeFg: '#fff', regimeRing: 'transparent' }
          : { amt: T.not_itemised, regime: T.in_register, regimeCol: 'transparent', regimeFg: 'var(--faint-strong)', regimeRing: 'var(--border)' };
      })((this._funderFacts || {})[this._funderKey(r.name)]),
      logo: './assets/logos/' + r.slug + (VEC[r.slug] ? '.svg' : '.png'),
      span: r.span, countLabel: r.count + ' ' + (r.count === 1 ? T.word_project : T.word_projects),
      rel: r.rel, hasRel: !!r.rel,
      progs: r.progNames.map((n, i) => ({ k: 'pn' + i, v: n })),
      ring: r.current ? tok('#556223') + '55' : 'var(--border)',
    }));
    const ivStatusTabs = [
      { k: 'current', label: T.iv_current },
      { k: 'past', label: T.iv_past },
      { k: 'all', label: T.iv_all },
    ].map(t => ({ k: t.k, label: t.label,
      bg: S.ivStatus === t.k ? 'var(--text)' : 'transparent',
      fg: S.ivStatus === t.k ? 'var(--bg)' : 'var(--faint)',
      select: () => this.setState({ ivStatus: t.k }) }));
    const ivProgKeys = Array.from(new Set((allProjects || []).map(p => p.prog).filter(Boolean)));
    const ivProgOpts = [{ value: 'all', label: T.iv_all_programmes }].concat(ivProgKeys.map(k => {
      const rawName = ((PROGS || []).find(x => x.key === k) || {}).name || (this._progExtra()[k] || k);
      return { value: k, label: this._tc('programmes', k, 'name', rawName) };
    }));
    const empanel = (FIN && FIN.REVIEW ? FIN.REVIEW.items : []).map((r, i) => ({
      k: 'e' + i, title: r.title, by: r.by, when: r.when, note: r.note || '', hasNote: !!r.note, col: tok(r.color || '#0E5565'),
    }));
    const regs = (FIN && FIN.COMPLIANCE ? FIN.COMPLIANCE.registrations : []).map((r, i) => ({ k: 'g' + i, code: r.code, what: r.what }));

    const amounts = (fcra ? P.amountsFcra : P.amountsInr).map((a, i) => {
      const isOther = i === (fcra ? P.amountsFcra : P.amountsInr).length - 1;
      const key = isOther ? 'other' : a;
      const on = S.dAmount === key;
      return { k: 'a' + i, label: a, on, isOther,
        bg: on ? tok('#EAAE28') : 'var(--surface)', fg: on ? '#1f1710' : 'var(--text)',
        ring: on ? tok('#EAAE28') : 'var(--border)',
        select: () => this.setState({ dAmount: key }) };
    });
    const pay = this._payload(P);
    const payRows = [
      { k: 'p1', kk: 'Account', v: pay.account },
      { k: 'p2', kk: 'Razorpay account key', v: pay.razorpayAccount },
      { k: 'p3', kk: 'Amount', v: (pay.currency === 'USD' ? '$' : '\u20b9') + (pay.amount || 0) + ' \u00b7 ' + pay.frequency },
      { k: 'p4', kk: 'Purpose', v: pay.purpose },
      { k: 'p5', kk: 'Statutory trail', v: pay.statutory },
      { k: 'p6', kk: '80G receipt', v: pay.receipt80G ? 'Yes' : 'Not Applicable' },
    ];

    return {
      eyebrow: P.eyebrow, title: P.title, sub: P.sub,
      tabs: P.tabs.map(t => ({ k: t.k, label: t.label, on: S.pTab === t.k,
        bg: S.pTab === t.k ? 'var(--surface)' : 'transparent',
        fg: S.pTab === t.k ? 'var(--text)' : 'var(--faint)',
        ring: S.pTab === t.k ? tok('#0E5565') : 'var(--border)',
        select: () => this.setState({ pTab: t.k }) })),
      isRoute: S.pTab === 'route', isGive: S.pTab === 'give', isPeople: S.pTab === 'people', isAnswer: S.pTab === 'answer',

      stepLabel: P.step + ' ' + (S.pStep === 0 ? 1 : 2) + ' ' + P.of + ' 2',
      progress: (S.pStep === 0 ? 50 : 100) + '%',
      s0: S.pStep === 0, s1: S.pStep !== 0,
      whoTitle: P.whoTitle, whoSub: P.whoSub,
      routeLead: P.routeLead, routeProofLine: P.routeProofLine, routeProofLink: P.routeProofLink,
      goProof: this._go('finance', 'compliance'),
      // The invitation reads as one flat block otherwise. Split at the first sentence:
      // the claim becomes the display line, the qualification stays as body.
      inviteTitle: P.inviteTitle,
      ...(() => {
        const full = String(P.inviteBody || '');
        const cut = full.indexOf('. ');
        const lead = cut > 0 ? full.slice(0, cut + 1) : full;
        let rest = cut > 0 ? full.slice(cut + 2) : '';
        let pick = '';
        const pcut = rest.lastIndexOf('. ');
        if (pcut > 0) { pick = rest.slice(pcut + 2); rest = rest.slice(0, pcut + 1); }
        return { inviteLead: lead, inviteBody: rest, invitePick: pick };
      })(),
      inviteGroups: (P.inviteGroups || []).map((g, i) => {
        const to = (g && g.to) || 'community';
        return { k: 'ig' + i, v: (g && g.v) || g,
          title: (P.who.find(w => w.k === to) || {}).label || '',
          go: () => this.setState({ pWho: to, pIntents: [], pStep: 1 },
            () => { try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {} }) };
      }),
      legacyEyebrow: (P.legacy || {}).eyebrow, legacyTitle: (P.legacy || {}).title,
      legacyBody: (P.legacy || {}).body, legacyAction: (P.legacy || {}).action,
      legacyNote: (P.legacy || {}).note,
      goLegacy: () => this.setState({ pWho: 'individual', pIntents: ['legacy'], pStep: 1 },
        () => { try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {} }),
      processTitle: P.processTitle, processSub: P.processSub,
      processSteps: (P.processSteps || []).map((s, i) => ({ k: 'ps' + i, n: '0' + (i + 1), t: s.t, b: s.b })),
      routeBackLabel: P.routeBackLabel,
      routeName: (P.who.find(w => w.k === S.pWho) || {}).label || '',
      routeLeadLine: ((P.routeLeads || {})[S.pWho])
        || (((this._pt || {}).en || {}).routeLeads || {})[S.pWho] || '',
      composeTitle: P.composeTitle, composeSub: P.composeSub,
      who: P.who.map(w => ({ k: w.k, label: w.label, hint: w.hint,
        countLabel: P.intents.filter(i => i.for.indexOf(w.k) >= 0).length + ' ' + (P.routeOpenLabel || 'ways in'),
        select: () => this.setState({ pWho: w.k, pIntents: [], pStep: 1 },
          () => { try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {} }) })),
      whatTitle: P.whatTitle, whatSub: P.whatSub,
      intents: shown.map(i => {
        const on = sel.indexOf(i.k) >= 0;
        const d = i.detail || {};
        return { k: i.k, label: i.label, on,
          bg: on ? tok(i.col) + '18' : 'var(--surface)',
          ring: on ? tok(i.col) : 'var(--border)',
          accent: tok(i.col),
          btnLabel: on ? (P.selectedLabel || 'Added') + ' \u2713' : (P.selectLabel || 'Add this'),
          btnBg: on ? tok(i.col) : 'transparent',
          btnFg: on ? '#fff' : tok(i.col),
          hasDetail: !!d.what,
          urgency: d.u || '',
          rows: [
            { k: 'w1', kk: T.d_what, v: d.what }, { k: 'w2', kk: T.d_why, v: d.why },
            { k: 'w3', kk: T.d_when, v: d.when }, { k: 'w4', kk: T.m_location, v: d.where },
            { k: 'w5', kk: T.d_how, v: d.how },
          ].filter(r => !!r.v),
          toggle: () => this.setState(s => ({ pIntents: s.pIntents.indexOf(i.k) >= 0 ? s.pIntents.filter(x => x !== i.k) : s.pIntents.concat([i.k]) })) };
      }),
      hasRest: restCount > 0,
      restLabel: String(P.restLabel || (((this._pt || {}).en || {}).restLabel) || '{n}').replace('{n}', restCount),
      sopTitle: P.sopTitle, sopSub: P.sopSub, sopPlaceholder: P.sopPlaceholder,
      sopPrompts: P.sopPrompts.map((v, i) => ({ k: 'q' + i, v })),
      sopVal: S.pSop, onSop: this._pset('pSop'),
      fields: [
        { k: 'f1', label: P.fName, val: S.pName, on: this._pset('pName'), req: true, type: 'text' },
        { k: 'f2', label: P.fEmail, val: S.pEmail, on: this._pset('pEmail'), req: true, type: 'email' },
        { k: 'f3', label: P.fOrg, val: S.pOrg, on: this._pset('pOrg'), req: false, type: 'text' },
        { k: 'f4', label: P.fPhone, val: S.pPhone, on: this._pset('pPhone'), req: false, type: 'tel' },
        { k: 'f5', label: P.fPlace, val: S.pPlace, on: this._pset('pPlace'), req: false, type: 'text' },
      ],
      budgetLabel: P.fBudget, budgetVal: S.pBudget, onBudget: this._pset('pBudget'),
      budgets: P.budgets.map((b, i) => ({ k: 'b' + i, v: b })),
      reviewTitle: P.reviewTitle, reviewSub: P.reviewSub, preview: body,
      sendLabel: P.send, copyLabel: S.pCopied ? P.copied : P.copy, href,
      // mailto only works where a desktop mail client is registered. Webmail users get
      // a compose link that carries the same drafted text.
      gmailHref: 'https://mail.google.com/mail/?view=cm&fs=1&to=joinus@dehatindia.org'
        + '&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body),
      outlookHref: 'https://outlook.office.com/mail/deeplink/compose?to=joinus@dehatindia.org'
        + '&subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body),
      whatsappHref: 'https://wa.me/919415054079?text=' + encodeURIComponent(subject + '\n\n' + body),
      copy: () => {
        const done = () => this.setState({ pCopied: true });
        try {
          if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(body).then(done, () => this._copyFallback(body, done));
            return;
          }
        } catch (e) {}
        this._copyFallback(body, done);
      },
      backLabel: P.back, nextLabel: P.next, canNext,
      hint: sel.length === 0 ? (P.pickPrompt || P.pickOne) : (!(S.pName && S.pEmail) ? P.needName : ''),
      showHint: S.pStep !== 0 && !(sel.length > 0 && S.pName && S.pEmail),
      // The draft appears as soon as something is added, so adding has a visible result.
      // Name and email remain required before it can be sent.
      showPreview: S.pStep !== 0 && sel.length > 0,
      canSend: !!(S.pName && S.pEmail),
      needsDetails: !(S.pName && S.pEmail),
      needsDetailsNote: P.needName,
      goBack: () => this.setState({ pStep: 0, pWho: '', pIntents: [] },
        () => { try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {} }),
      goNext: () => {},

      giveTitle: P.giveTitle, giveSub: P.giveSub,
      regimes: P.regimes.map(r => ({ k: r.k, label: r.label, note: r.note, detail: r.detail, on: S.dRegime === r.k,
        bg: S.dRegime === r.k ? tok(r.col) + '1f' : 'var(--surface)',
        ring: S.dRegime === r.k ? tok(r.col) : 'var(--border)',
        fg: tok(r.col),
        select: () => this.setState({ dRegime: r.k, dAmount: '' }) })),
      amounts, isOther: S.dAmount === 'other', otherVal: S.dAmountOther, onOther: this._pset('dAmountOther'),
      freqTitle: P.freqTitle,
      freqs: P.freqs.map(f => ({ k: f.k, label: f.label, on: S.dFreq === f.k,
        bg: S.dFreq === f.k ? 'var(--text)' : 'transparent',
        fg: S.dFreq === f.k ? 'var(--bg)' : 'var(--faint)',
        select: () => this.setState({ dFreq: f.k }) })),
      purposeTitle: P.purposeTitle, purposeNote: P.purposeNote,
      purposes: P.purposes.map(p => ({ k: p.k, label: p.label, note: p.note || '', hasNote: !!p.note, on: S.dPurpose === p.k,
        bg: S.dPurpose === p.k ? 'var(--surface)' : 'transparent',
        ring: S.dPurpose === p.k ? tok('#556223') : 'var(--border)',
        fg: S.dPurpose === p.k ? 'var(--text)' : 'var(--dim)',
        select: () => this.setState({ dPurpose: p.k }) })),
      idTitle: P.idTitle, idNote: fcra ? P.idNoteFcra : P.idNoteInr, isFcra: fcra, isInr: !fcra,
      panLabel: P.fPan, panHint: P.fPanHint, panVal: S.dPan, onPan: this._pset('dPan'),
      countryLabel: P.fIdCountry, countryVal: S.dCountry, onCountry: this._pset('dCountry'),
      idRefLabel: P.fIdRef, idRefVal: S.dIdRef, onIdRef: this._pset('dIdRef'),
      idRefHint: P.fIdRefHint,
      // Know-your-investor requirements. Aadhaar is taken masked — only the last four
      // digits — because the full number is neither needed nor safe to hold.
      aadhaarLabel: P.fAadhaar, aadhaarHint: P.fAadhaarHint, aadhaarNote: P.fAadhaarNote,
      aadhaarVal: S.dAadhaar || '', onAadhaar: this._pset('dAadhaar'),
      inrDocLabel: P.fInrDocs, inrDocNote: P.fInrDocsNote,
      hasInrDocs: (S.dInrDocs || []).length > 0,
      inrDocs: this._fileChips('dInrDocs', 'var(--ac-gold)'),
      onInrDocs: this._fileAdd('dInrDocs'),
      addMoreLabel: T.add_another_attachment,
      passportLabel: P.fPassport, passportNote: P.fPassportNote,
      hasPassportFiles: (S.dPassportFiles || []).length > 0,
      passportFiles: this._fileChips('dPassportFiles', 'var(--ac-teal)'),
      onPassport: this._fileAdd('dPassportFiles'),
      // Identity and contact detail the receipt and the statutory return both need,
      // asked alongside the KYC documents rather than after the payment.
      donorFields: [
        { k: 'dFullName', label: T.f_full_name, span: '1 / -1' },
        { k: 'dPhone', label: T.f_phone, type: 'tel' },
        { k: 'dEmail', label: T.f_email, type: 'email', hint: T.f_email_hint },
        { k: 'dCity', label: T.f_city },
        { k: 'dState', label: T.f_state },
        { k: 'dPin', label: T.f_postal_code },
        { k: 'dAddrCountry', label: T.f_country, hint: fcra ? '' : T.f_india },
      ].map(f => ({ k: f.k, label: f.label, type: f.type || 'text', hint: f.hint || '',
        span: f.span || 'auto', val: S[f.k] || '', on: this._pset(f.k) })),
      noteLabel: T.f_additional_note, noteHint: T.f_additional_note_hint,
      noteVal: S.dNote || '', onNote: this._pset('dNote'),
      addrLabel: P.fAddress, addrVal: S.dAddr, onAddr: this._pset('dAddr'),
      g80Label: P.f80g, g80On: S.d80g, g80Mark: S.d80g ? '\u2713' : '', toggle80: this._ptog('d80g'),
      anonLabel: P.fAnon, anonOn: S.dAnon, anonMark: S.dAnon ? '\u2713' : '', toggleAnon: this._ptog('dAnon'),
      dpNote: P.dpNote, paySafe: P.paySafe, payMissing: P.payMissing,
      payLabel: P.payNow, canPay: this._amt() > 0,
      payAccount: fcra ? P.payForeign : P.payDomestic,
      pay: () => this._pay(P),
      showPay: S.dStage === 1, payRows,
      orEmail: P.orEmail,
      giveMail: 'mailto:joinus@dehatindia.org?subject=' + encodeURIComponent('Bank transfer or gift in kind')
        + '&body=' + encodeURIComponent('Hello DEHAT team,\n\nI would like to give by bank transfer or in kind rather than online. Please send me the account details and tell me what you need for the receipt.\n\nThank you,\n'),

      peopleTitle: P.peopleTitle, peopleSub: P.peopleSub,
      investorsTitle: P.investorsTitle, investorsSub: P.investorsSub, investorsFoot: P.investorsFoot,
      ...this._investmentCase(tok),
      investors, ivStatusTabs, ivProgOpts, ivProg: S.ivProg,
      ivFilters, ivAnyFacet, ivClear,
      ivToggle: () => this.setState(s => ({ ivFOpen: !s.ivFOpen })),
      ivFOpen: !!S.ivFOpen,
      ivCaret: S.ivFOpen ? '\u25B2' : '\u25BC',
      ivLabel: (() => { const n = ivDims.filter(x => ivF[x.key] && ivF[x.key] !== 'all').length; return n ? ' \u00b7 ' + n : ''; })(),
      ivRing: (S.ivFOpen || ivAnyFacet) ? 'var(--dim)' : 'var(--border)',
      ivBg: ivAnyFacet ? 'var(--surface2)' : 'transparent',
      ivRail: (el) => { this._ivRail = el; },
      ivPrev: () => { const el = this._ivRail; if (el) el.scrollBy({ left: -(el.clientWidth - 60), behavior: 'smooth' }); },
      ivNext: () => { const el = this._ivRail; if (el) el.scrollBy({ left: el.clientWidth - 60, behavior: 'smooth' }); },
      onIvProg: this._pset('ivProg'),
      investorCount: String(investors.length),
      ivEmpty: investors.length === 0,
      empanelTitle: P.empanelTitle, empanel, regs,
      empanelRefBody: T.empanel_ref_body_tpl.replace('{n}', String(empanel.length)).replace('{m}', String(regs.length)),
      empanelChips: empanel.slice(0, 4).map((e, i) => ({ k: 'ec' + i, label: e.by || e.title })),
      goCompliance: this._go('finance', 'compliance'),
      pressRefBody: T.press_ref_body_tpl.replace('{n}', String(P.mediaItems.length)),
      pressChips: P.mediaItems.slice(0, 5).map((m, i) => ({ k: 'pc' + i, label: m.pub })),
      goPress: () => this.setState({ view: 'media', storySlug: null }, () => { try { window.scrollTo({ top: 0 }); } catch (e) {} }),
      mediaTitle: P.mediaTitle, mediaSub: P.mediaSub,
      mediaItems: P.mediaItems.map((m, i) => ({ k: 'm' + i, pub: m.pub, title: m.title, href: m.href })),
      affilTitle: P.affilTitle, affils: P.affils.map((a, i) => ({ k: 'af' + i, kk: a.k, v: a.v })),
      sisterTitle: P.sisterTitle, sisters: P.sisters.map((a, i) => ({ k: 'si' + i, kk: a.k, v: a.v })),
      answerTitle: P.answerTitle, answerSub: P.answerSub, answerGo: P.answerGo,
      ...(() => {
        const EN = ((this._pt || {}).en || {}).tabCtas || {};
        const C = ((P.tabCtas || {})[S.pTab]) || (EN[S.pTab]) || {};
        return {
          ctaTitle: C.t || '', ctaSub: C.s || '', ctaAction: C.a || '',
          // The second button must not repeat the first. Each tab sends the reader
          // somewhere it does not already stand: invest, the audited record, the routes.
          ctaSecondLabel: C.b || '',
          ctaSecond: C.bView
            ? this._go(C.bView, 'compliance')
            : this._go('involved', null, { pTab: C.bTab || 'give', pStep: 0 }),
          ctaHref: 'mailto:joinus@dehatindia.org?subject=' + encodeURIComponent(C.subj || 'A question')
            + '&body=' + encodeURIComponent('Hello DEHAT team,\n\n'),
        };
      })(),
    };
  }
  _pset(k) {
    this._psets = this._psets || {};
    if (!this._psets[k]) this._psets[k] = (e) => this.setState({ [k]: e && e.target ? e.target.value : e });
    return this._psets[k];
  }
  _ptog(k) {
    this._ptogs = this._ptogs || {};
    if (!this._ptogs[k]) this._ptogs[k] = () => this.setState(s => ({ [k]: !s[k] }));
    return this._ptogs[k];
  }
  _amt() {
    const S = this.state;
    const raw = S.dAmount === 'other' ? S.dAmountOther : S.dAmount;
    const n = parseFloat(String(raw || '').replace(/[^0-9.]/g, ''));
    return isFinite(n) && n > 0 ? n : 0;
  }
  _payload(P) {
    const S = this.state, fcra = S.dRegime === 'fcra';
    const pur = (P.purposes.find(x => x.k === S.dPurpose) || {}).label || '';
    return {
      account: fcra ? 'FCRA / foreign' : 'Domestic / INR',
      razorpayAccount: fcra ? 'RZP_FCRA_ACCOUNT_ID' : 'RZP_DOMESTIC_ACCOUNT_ID',
      currency: fcra ? 'USD' : 'INR',
      amount: this._amt(),
      frequency: S.dFreq,
      purpose: pur,
      receipt80G: !fcra && S.d80g,
      pan: fcra ? '' : S.dPan,
      country: fcra ? S.dCountry : 'India',
      idRef: fcra ? S.dIdRef : '',
      address: S.dAddr,
      anonymous: !!S.dAnon,
      statutory: fcra ? 'FC-4 annual return; no 80G' : 'Form 10BD statement; 80G certificate 10BE',
    };
  }
  _pay(P) {
    const p = this._payload(P);
    if (typeof window !== 'undefined' && window.Razorpay && window.DEHAT_RZP_KEYS) {
      const key = window.DEHAT_RZP_KEYS[p.account === 'FCRA / foreign' ? 'fcra' : 'domestic'];
      try {
        new window.Razorpay({
          key, currency: p.currency, amount: Math.round(p.amount * 100),
          name: 'DEHAT', description: p.purpose, notes: p,
        }).open();
        return;
      } catch (e) { /* fall through to the summary */ }
    }
    this.setState({ dStage: 1 });
  }
  // Report-a-transfer: someone who has already moved money by NEFT/RTGS/IMPS or a
  // cheque tells us it happened, so the receipt can be matched to the credit.
  _reportTransfer(P) {
    const S = this.state;
    const hi = this.state.lang === 'hi';
    const L = hi ? {
      eyebrow: 'पहले ही भेज चुके हैं', title: 'पहले किए गए हस्तांतरण की जानकारी दीजिए।',
      sub: 'यदि आपने NEFT, RTGS, IMPS, चेक या सीधे जमा से राशि भेजी है, तो उसे यहाँ दर्ज कीजिए ताकि हम अपने खाते में आई राशि को आपकी रसीद से मिला सकें। इससे कोई राशि स्थानांतरित नहीं होती।',
      cause: 'हस्तांतरण किस उद्देश्य के लिए था', human: 'सिद्ध कीजिए कि आप रोबोट नहीं हैं',
      humanHint: 'तीन और चार कितने होते हैं?', submit: 'विवरण भेजिए',
      missing: 'भेजने से पहले संदर्भ संख्या, राशि, तिथि, नाम और ईमेल भरिए।',
      robot: 'अंकगणित का उत्तर दीजिए ताकि हम जान सकें कि आप रोबोट नहीं हैं।',
      ok: 'आपका विवरण ईमेल में तैयार है। अपने ईमेल ऐप में भेजिए; हम उसे बैंक विवरण से मिलाएँगे।',
      note: 'रसीद जारी करने से पहले DEHAT हर दर्ज हस्तांतरण को बैंक विवरण से मिलाता है। यहाँ कुछ भी आपके ब्राउज़र में संग्रहीत नहीं होता।',
      labels: ['बैंक या लेनदेन संदर्भ संख्या', 'भेजी गई राशि', 'हस्तांतरण की तिथि', 'पहला नाम', 'उपनाम', 'फ़ोन', 'ईमेल', 'पता', 'शहर', 'राज्य', 'पिन कोड', 'देश', 'कंपनी का नाम'],
      hints: ['लेनदेन पहचानने वाली कोई भी संख्या', 'जैसे 5,000', '', '', '', '', 'रसीद यहीं भेजी जाएगी', '', '', '', '', 'भारत', 'यदि राशि किसी संस्था से भेजी गई है'],
    } : null;
    const set = (k) => (e) => this.setState({ [k]: e.target.value });
    const v = (k) => S[k] || '';
    const F = [
      { k: 'rtRef', label: 'Bank or Transaction Reference Number', hint: 'Any number that identifies the transfer', span: '1 / -1' },
      { k: 'rtAmount', label: 'Amount Transferred', hint: 'e.g. 5,000', type: 'text' },
      { k: 'rtDate', label: 'Date of Transfer', type: 'date' },
      { k: 'rtFirst', label: 'First Name' },
      { k: 'rtLast', label: 'Last Name' },
      { k: 'rtPhone', label: 'Phone', type: 'tel' },
      { k: 'rtEmail', label: 'Email', hint: 'The receipt is sent here', type: 'email' },
      { k: 'rtStreet', label: 'Street Address', span: '1 / -1' },
      { k: 'rtCity', label: 'City' },
      { k: 'rtState', label: 'State or Province' },
      { k: 'rtPin', label: 'Postal Code' },
      { k: 'rtCountry', label: 'Country', hint: 'India' },
      { k: 'rtCompany', label: 'Company Name', hint: 'If the transfer came from a business', span: '1 / -1' },
    ];
    const unres = (P.purposes || []).find(p => p.k === 'unrestricted');
    const causes = [(unres && unres.label) || 'Wherever it is Needed Most']
      .concat((P.purposes || []).filter(p => p.k !== 'unrestricted').map(p => p.label));
    const required = ['rtRef', 'rtAmount', 'rtDate', 'rtFirst', 'rtEmail'];
    const missing = required.filter(k => !v(k));
    const human = (v('rtHuman') || '').trim().toLowerCase();
    const humanOk = human === 'seven' || human === '7';
    return {
      eyebrow: L ? L.eyebrow : 'Already Transferred',
      title: L ? L.title : 'Tell us about a transfer you have already made.',
      sub: L ? L.sub : 'If you have sent money by National Electronic Funds Transfer (NEFT), Real Time Gross Settlement (RTGS), Immediate Payment Service (IMPS), cheque or a direct deposit, record it here so we can match the credit in our account to your receipt. This does not move any money.',
      fields: F.map((f, i) => ({ k: f.k, label: L ? L.labels[i] : f.label,
        hint: L ? (L.hints[i] || '') : (f.hint || ''), type: f.type || 'text',
        span: f.span || 'auto', val: v(f.k), on: set(f.k) })),
      causeLabel: L ? L.cause : 'Cause the Transfer Was For',
      causes: causes.map((c, i) => ({ k: 'rc' + i, v: c })),
      causeVal: S.rtCause || causes[0],
      onCause: set('rtCause'),
      humanLabel: L ? L.human : 'Prove You Are Not a Robot',
      humanHint: L ? L.humanHint : 'What is three plus four?',
      humanVal: v('rtHuman'), onHuman: set('rtHuman'),
      submitLabel: L ? L.submit : 'Submit Transfer Details',
      btnBg: 'var(--ac-teal)', btnFg: 'var(--bg)',
      hasMsg: !!S.rtMsg, msg: S.rtMsg || '',
      msgCol: S.rtOk ? 'var(--ac-olive)' : 'var(--ac-red)',
      note: L ? L.note : 'DEHAT reconciles every reported transfer against the bank statement before a receipt is issued. Nothing here is stored in your browser.',
      submit: () => {
        if (missing.length) {
          this.setState({ rtOk: false, rtMsg: L ? L.missing : 'Add the reference number, amount, date, first name and email before submitting.' });
          return;
        }
        if (!humanOk) {
          this.setState({ rtOk: false, rtMsg: L ? L.robot : 'Answer the arithmetic question so we know you are not a robot.' });
          return;
        }
        const rtT = { ...this._dict().en, ...(this._dict()[this.state.lang] || {}) };
        const lines = F.map((f, i) => (L ? L.labels[i] : f.label) + ': ' + (v(f.k) || '—'))
          .concat([rtT.rt_cause_label + ': ' + (S.rtCause || causes[0])]);
        const body = rtT.rt_mail_greeting + '\n\n' + rtT.rt_mail_intro + '\n\n'
          + lines.join('\n') + '\n\n' + rtT.rt_mail_outro + '\n';
        const href = 'mailto:joinus@dehatindia.org?subject='
          + encodeURIComponent(rtT.rt_mail_subject + ' — ' + (v('rtFirst') || rtT.rt_mail_investor_fallback))
          + '&body=' + encodeURIComponent(body);
        try { window.location.href = href; } catch (e) {}
        this.setState({ rtOk: true, rtMsg: L ? L.ok : 'Your details are drafted into an email. Press send in your email app and we will reconcile it against the statement.' });
      },
    };
  }
  // Attachments accumulate across picks. A native file input replaces its selection
  // every time, so a second pick would silently drop the first document.
  _fileAdd(key) {
    return (e) => {
      const picked = [].slice.call((e.target && e.target.files) || []).map(f => f.name);
      if (!picked.length) return;
      const have = this.state[key] || [];
      const merged = have.concat(picked.filter(n => have.indexOf(n) < 0));
      this.setState({ [key]: merged });
      try { e.target.value = ''; } catch (err) {}
    };
  }
  _fileChips(key, col) {
    return (this.state[key] || []).map((name, i) => ({
      k: key + i, name, col,
      remove: () => this.setState(s => ({ [key]: (s[key] || []).filter((_, j) => j !== i) })),
    }));
  }
  // ---- Ask the Record ----
  // A retrieval desk, not a generative one. It scores the reader's question against the
  // published question bank and returns the entries that match. When nothing scores well
  // enough it says so and offers a person. It can therefore never state something DEHAT
  // has not already published — the only acceptable behaviour for a transparency page.
  // Grammar must not score. Every FAQ question contains "what", "the", "can", "how",
  // so matching against the question sentence let any English sentence clear the bar
  // and be answered with an unrelated entry. Only curated retrieval terms carry weight.
  _askScore(query, item) {
    const STOP = /^(what|the|is|are|was|were|how|can|could|does|do|did|you|your|yours|my|me|mine|about|have|has|had|tell|and|for|with|this|that|from|there|their|they|but|not|any|get|got|out|its|it's|who|whom|when|where|why|will|would|should|shall|may|might|much|many|more|most|some|such|than|then|them|these|those|been|being|into|over|under|just|like|know|want|need|please|hello|thanks)$/;
    const q = query.toLowerCase();
    // Short tokens are kept when they carry a digit or a hyphen partner ("fc-4", "80g"),
    // which is how the statutory forms are actually typed.
    const words = q.split(/[^a-z0-9\u0900-\u097F]+/)
      .filter(w => (w.length > 2 || /\d/.test(w)) && !STOP.test(w));
    if (!words.length) return 0;
    const keyHay = ' ' + (item.keys || []).join(' ').toLowerCase() + ' ';
    const softHay = ' ' + (item.q + ' ' + item.a).toLowerCase() + ' ';
    // Whole-word matching only. Substring matching made "cook" hit "cookies".
    // Suffix tolerance covers plurals only ("account" → "accounts"), never a stem
    // three letters short of a different word ("cook" → "cookies").
    const hits = (hay, w) => new RegExp('[^a-z0-9]' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(s|es)?[^a-z0-9]').test(hay);
    let score = 0;
    // "fc" + "4" from "FC-4" only counts as the form when both are present.
    const joined = words.join('');
    if (joined.length > 2 && keyHay.replace(/[^a-z0-9]/g, '').indexOf(joined) > -1) score += 4;
    words.forEach(w => {
      if (hits(keyHay, w)) score += 3;
      else if (hits(softHay, w)) score += 1;
    });
    // A phrase that appears intact beats a scatter of terms.
    if (q.length > 8 && (keyHay.indexOf(q) > -1 || item.q.toLowerCase().indexOf(q) > -1)) score += 6;
    return score / Math.sqrt(words.length);
  }
  _askVals(setView) {
    const T = { ...this._dict().en, ...(this._dict()[this.state.lang] || {}) };
    const F = this._faq || (typeof window !== 'undefined' ? window.FAQ : null);
    const cats = (F && F.CATS) || [];
    const items = (F && F.ITEMS) || [];
    const S = this.state;
    const query = S.askQ || '';
    const catOf = k => cats.find(c => c.k === k) || { label: '', col: 'var(--faint)' };
    const catLabel = c => this._tagMap('faq_cat', c.label, c.label);
    const shape = (it, i) => {
      const c = catOf(it.cat);
      return {
        k: 'fq' + i, q: this._tc('faq', i, 'q', it.q), a: this._tc('faq', i, 'a', it.a), cat: catLabel(c), col: this._tok(c.col),
        open: S.askOpen === 'fq' + i,
        toggle: () => this.setState(s => ({ askOpen: s.askOpen === 'fq' + i ? '' : 'fq' + i })),
        hasGo: !!it.go, goLabel: it.go ? this._tc('faq', i, 'goLabel', it.go.label) : '',
        go: it.go ? (it.go.anchor ? this._go(it.go.view, it.go.anchor, it.go.extra) : setView(it.go.view)) : () => {},
      };
    };
    const asked = (S.askAsked || '').trim();
    let hits = [];
    if (asked) {
      hits = items.map((it, i) => ({ it, i, s: this._askScore(asked, it) }))
        .filter(x => x.s >= 2).sort((a, b) => b.s - a.s).slice(0, 3)
        .map(x => shape(x.it, x.i));
    }
    const activeCat = S.askCat || '';
    const listed = activeCat ? items.filter(it => it.cat === activeCat) : items;
    return {
      askTitle: T.ask_title,
      askLead: T.ask_lead,
      askPlaceholder: T.ask_placeholder,
      askValue: query,
      onAsk: e => this.setState({ askQ: e.target.value }),
      askSubmit: () => this.setState(s => ({ askAsked: s.askQ, askOpen: '' })),
      askSubmitLabel: T.ask_submit,
      askClear: () => this.setState({ askQ: '', askAsked: '' }),
      askClearLabel: T.ask_clear,
      onAskKey: e => { if (e.key === 'Enter') this.setState(s => ({ askAsked: s.askQ, askOpen: '' })); },
      hasAsked: !!asked,
      askEcho: asked,
      hasHits: hits.length > 0,
      hits,
      noHit: hits.length === 0,
      noHitTitle: T.ask_nohit_title,
      noHitBody: T.ask_nohit_body,
      noHitHref: 'mailto:info@dehatindia.org?subject='
        + encodeURIComponent('Question from the website')
        + '&body=' + encodeURIComponent(asked),
      noHitCta: T.ask_nohit_cta,
      askSuggestLabel: T.ask_suggest_label,
      askSuggest: [T.ask_sg_0, T.ask_sg_1, T.ask_sg_2, T.ask_sg_3, T.ask_sg_4]
        .map((t, i) => ({ k: 'sg' + i, label: t,
          pick: () => this.setState({ askQ: t, askAsked: t, askOpen: '' }) })),
      faqTitle: T.faq_title,
      faqSub: T.faq_sub,
      askCats: [{ k: '', label: T.ask_cat_all }].concat(cats.map(c => ({ k: c.k, label: catLabel(c) })))
        .map(c => ({
          k: 'ct' + (c.k || 'all'), label: c.label,
          on: activeCat === c.k,
          bg: activeCat === c.k ? 'var(--text)' : 'transparent',
          fg: activeCat === c.k ? 'var(--bg)' : 'var(--dim)',
          pick: () => this.setState({ askCat: c.k, askOpen: '' }),
        })),
      faqItems: listed.map((it) => shape(it, items.indexOf(it))),
      faqCount: listed.length + ' ' + T.faq_count_suffix,
    };
  }
  _copyFallback(text, done) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (e) {}
    done();
  }
  _mailBody(P, T) {
    if (!T) T = { ...this._dict().en, ...(this._dict()[this.state.lang] || {}) };
    const S = this.state;
    const who = (P.who.find(w => w.k === S.pWho) || {}).label || '';
    const ints = P.intents.filter(i => (S.pIntents || []).indexOf(i.k) >= 0).map(i => '  \u2022 ' + i.label).join('\n');
    const L = [];
    L.push(T.mail_greeting);
    L.push('');
    L.push(T.mail_intro);
    L.push('');
    L.push(T.mail_who_am_i);
    L.push('  ' + who);
    if (S.pOrg) L.push('  ' + S.pOrg);
    if (S.pPlace) L.push('  ' + T.mail_based_in + ' ' + S.pPlace);
    L.push('');
    L.push(T.mail_what_to_do);
    L.push(ints || '  \u2014');
    L.push('');
    L.push(T.mail_what_change);
    L.push('  ' + (S.pSop || '\u2014'));
    if (S.pBudget && S.pBudget !== P.budgets[0]) { L.push(''); L.push(T.mail_scale); L.push('  ' + S.pBudget); }
    L.push('');
    L.push(T.mail_how_reach);
    L.push('  ' + (S.pName || '') + (S.pEmail ? ' \u00b7 ' + S.pEmail : '') + (S.pPhone ? ' \u00b7 ' + S.pPhone : ''));
    L.push('');
    L.push(T.mail_thanks);
    L.push(S.pName || '');
    return L.join('\n');
  }
  _support(name) {
    const to = 'joinus@dehatindia.org';
    const m = (s, b) => 'mailto:' + to + '?subject=' + encodeURIComponent(s + ' \u2014 ' + name)
      + '&body=' + encodeURIComponent('Hello DEHAT team,\n\n' + b + '\n\nI came to this from the ' + name + ' programme page on your website.\n\nMy name is:\nThe best way to reach me is:\n\nThank you,\n');
    return [
      { k: 'Give in rupees', v: 'Indian donations carry 80G deduction. Registration AAAAD3793QF20241, valid to AY 2027\u201328.', a: 'Write to us', href: m('Donation (INR)', 'I would like to make a donation in Indian rupees towards this programme, and I would like an 80G receipt. Please send me the account details and tell me what you need from me for the receipt.'), col: '#EAAE28' },
      { k: 'Give from outside India', v: 'DEHAT holds Foreign Contribution (Regulation) Act registration 136260010 and receives foreign contributions only into its designated State Bank of India account.', a: 'Write to us', href: m('Donation (foreign / FCRA)', 'I would like to make a contribution from outside India towards this programme. Please send me the FCRA account details and tell me what you need from me for your FC-4 return.'), col: '#0E5565' },
      { k: 'Partner as a company', v: 'Corporate Social Responsibility registration CSR00001181. Schedule VII alignment is stated on every project in the register above.', a: 'Start a conversation', href: m('CSR / institutional partnership', 'We are considering a CSR or institutional partnership on this programme. Please tell us which geographies currently have room, what a first year would look like, and what due diligence material you can share.'), col: '#D2305C' },
      { k: 'Work with us', v: 'Fellowships, internships and field roles, in Bahraich and remotely.', a: 'Send your interest', href: m('Fellowship / volunteering', 'I would like to work with DEHAT on this programme, as a fellow, an intern or in a field role. Please tell me what is currently open and what you would want from me.'), col: '#556223' },
      { k: 'Ask for the evidence', v: 'Audited accounts, evaluations and programme reports are available on request, including the documents cited in the register.', a: 'Request a report', href: m('Request for reports or data', 'Please send me the audited accounts, evaluations and programme reports for this programme. I am specifically interested in:'), col: '#4F0E73' },
      { k: 'Visit the field', v: 'Partners, researchers and prospective colleagues are welcome to see the work in the districts where it happens.', a: 'Arrange a visit', href: m('Field visit', 'I would like to visit the field and see this programme where it happens. My rough dates are:\nThe number of people travelling is:'), col: '#A92719' },
      { k: 'Share this work', v: 'The most useful thing many readers can do is put this page in front of someone who can act on it.', a: '', href: '', col: '#0E9CB8' },
    ];
  }
  _loadProjects() {
    if (this._projLoading || (this.state.projects && this.state.projects.length)) return;
    this._projLoading = true;
    import('./projects-data.js')
      .then(m => { this._pd = m; this.setState({ projects: m.PROJECTS || [] }); })
      .catch(() => { this._projLoading = false; });
    import('./programme-extras.js')
      .then(m => { this._px = m; this.forceUpdate(); })
      .catch(() => {});
    import('./impact-lenses.js')
      .then(m => { this._il = m; this.forceUpdate(); })
      .catch(() => {});
    import('./journey-data.js')
      .then(m => { this._jd = m.JOURNEY || null; this.forceUpdate(); })
      .catch(() => {});
    import('./partner-data.js')
      .then(m => { this._pt = m.PARTNER || null; this.forceUpdate(); })
      .catch(() => {});
    import('./register-data.js?v=4')
      .then(m => { this._rg = m || null; this.forceUpdate(); })
      .catch(() => {});
    import('./faq-data.js')
      .then(() => { this._faq = (typeof window !== 'undefined') ? window.FAQ : null; this.forceUpdate(); })
      .catch(() => {});
    import('./who-data.js?v=3')
      .then(m => { this._wd = m.WHO || null; this.forceUpdate(); })
      .catch(() => {});
    import('./who-profiles.js')
      .then(m => { this._wp = m || null; this.forceUpdate(); })
      .catch(() => {});
    import('./who-en.js')
      .then(m => { this._we = m.TEAM_EN || null; this.forceUpdate(); })
      .catch(() => {});
  }
  _loadFinance() {
    if (this._finLoaded) return;
    this._finLoaded = true;
    import('./finance-data.js').then(() => { this._fin = (typeof window !== 'undefined') ? window.FIN : null; this.forceUpdate(); }).catch(() => { this._finLoaded = false; });
  }
  _progMeta(T) {
    const P = (this._pd && this._pd.PROGRAMMES) ? this._pd.PROGRAMMES : [];
    const out = {};
    P.forEach(p => { out[p.key] = p; });
    out.inst = out.inst || { key: 'inst', name: 'Institutional and Cross-Cutting', color: '#4F0E73', tag: 'Enabling the whole', lede: 'Flexible institutional support that underpins every programme.' };
    return out;
  }
  _dims(T) {
    const SDG = (this._pd && this._pd.SDG) ? this._pd.SDG : {};
    const CSR = (this._pd && this._pd.CSR) ? this._pd.CSR : {};
    const short = (t) => String(t).split(' \u00b7 ')[0];
    return [
      // One format only: every project contributes each calendar year it ran in, so the
      // dropdown never mixes '2005-06' with 'From 2016' or 'September 2017 - March 2018'.
      { key: 'year', label: T.filter_year, get: p => {
        const a = p.yearStart, b = p.yearEnd || p.yearStart;
        if (!a) return [];
        const out = []; for (let y = a; y <= b && out.length < 40; y++) out.push(String(y));
        return out;
      } },
      { key: 'state', label: T.filter_state, get: p => (p.state || '').split(' and '), disp: v => this._tagMap('place_name', v, v) },
      { key: 'district', label: T.filter_district, get: p => p.districts || [], disp: v => this._tagMap('place_name', v, v) },
      { key: 'sdg', label: T.filter_sdg, get: p => (p.sdgs || []).map(k => short(SDG[k] || k)), full: k => SDG[k], disp: v => this._tagMap('goal_short', v, v) },
      { key: 'csr', label: T.filter_csr, get: p => (p.csr || []).map(k => short(CSR[k] || k)), disp: v => this._tagMap('csr_item_short', v, v) },
      { key: 'uncrc', label: T.filter_uncrc, get: p => p.uncrc || [], disp: v => this._tagMap('uncrc_word', v, v) },
      { key: 'investor', label: T.filter_investor, get: p => (p.investors || []).filter(x => x.length < 60) },
    ];
  }
  _setFilter(prog, dim, val) { this.setState(s => ({ filters: { ...s.filters, [prog + '|' + dim]: val }, expanded: null })); }
  _toggleProject(id) { this.setState(s => ({ expanded: s.expanded === id ? null : id })); }
  // Curated, hand-verified funder→project links for the Transparency page (never guessed —
  // each row was checked against the project's own narrative before being added here).
  _projectIdForFlow(f) {
    if (!f || f.est) return null;
    const k = f.funderKey || '';
    const p = (f.project || '').toLowerCase();
    // Unconditional: this funder only ever appears against one project card.
    if (k === 'caritas_germany') return 32;
    if (k === '__rilm') return 41;
    if (k === 'igsss') return 46;
    if (k === 'laher') return 49;
    if (k === 'geeta_karnal') return 7;
    if (k === 'centum') return 9;
    if (k === 'ksc_foundation') return 33;
    if (k === 'ipartner') return 31;
    if (k === 'dasra') return 35;
    if (k === 'erase_poverty') return 3;
    if (k === 'sanlaap') return 36;
    if (k === 'shes_the_first') return 12;
    if (k === 'sahyog') return 40;
    if (k === 'aih') return 20;
    // Text-conditional: this funder's spend recurs under more than one project name
    // across the years, so the project text on the line itself decides the target.
    if (k === 'edele_give' && /grow/.test(p)) return 48;
    if (k === 'iimpact' && /rgcep|rural girl child education/.test(p)) return 4;
    if (k === 'action_aid' && /making school functional/.test(p)) return 38;
    if (k === 'action_aid' && /school management committee/.test(p)) return 5;
    if (k === 'appi' && /dry ration|covid/.test(p)) return 23;
    if (k === 'appi' && /fasal/.test(p)) return 28;
    if (k === 'pani' && /fasal/.test(p)) return 24;
    if (k === 'baif' && /sure start/.test(p)) return 16;
    if (k === 'cry' && /child rights|cry project/.test(p)) return 2;
    if (k === 'jica' && /uppfmpap/.test(p)) return 37;
    if (k === 'dfid_pacs' && /pacs/.test(p)) return 13;
    if (k === 'nabard' && /shg|redp/.test(p)) return 43;
    if ((k === 'pani' || k === 'sdtt') && /sujalam sufalam/.test(p)) return 27;
    if (k === 'sdtt' && /erw|empowering rural women/.test(p)) return 15;
    if (k === 'unicef' && /chni/.test(p)) return 17;
    if (k === 'unicef' && /cpp/.test(p)) return 44;
    if (k === 'unicef' && /gpdp/.test(p)) return 18;
    return null;
  }
  _openProjectLink(id) {
    const all = this.state.projects || [];
    const p = all.find(x => x.id === id);
    if (!p) return;
    const progOrder = (this._pd && this._pd.PROGRAMMES && this._pd.PROGRAMMES.length) ? this._pd.PROGRAMMES.map(x => x.key) : ['sol', 're', 'cj', 'hp'];
    const progKey = progOrder.indexOf(p.prog) !== -1 ? p.prog : ((p.cross || []).find(c => progOrder.indexOf(c) !== -1) || progOrder[0]);
    this.setState(s => {
      const filters = { ...s.filters };
      Object.keys(filters).forEach(fk => { if (fk.indexOf(progKey + '|') === 0) delete filters[fk]; });
      return { view: 'prog', progKey, expanded: id, filters, jStage: 0, jTier: 0, jPath: 0, jPair: null, jHor: 0 };
    }, () => {
      try { window.scrollTo({ top: 0 }); } catch (e) {}
      setTimeout(() => {
        try {
          const el = document.querySelector('[data-anchor="projects"]');
          if (el) window.scrollTo({ top: window.pageYOffset + el.getBoundingClientRect().top - 76, behavior: 'smooth' });
        } catch (e) {}
      }, 60);
    });
  }
  _money(inr, year) {
    if (!this._pd || inr == null) return null;
    return this._pd.fmtINR(inr) + ' · ' + this._pd.fmtUSD(this._pd.usd(inr, year));
  }

  _ensure() {
    if (this._ready) return;
    this._ready = true;
    this._loadProjects();
    try { if (this._io) this._io.disconnect(); } catch (e) {}
    try { if (this._mo) this._mo.disconnect(); } catch (e) {}
    this._active = new Map(); this._obs = new WeakSet(); this._started = new Set();
    this._io = new IntersectionObserver((es) => {
      es.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target, id = el.dataset.countId;
        this._io.unobserve(el);
        if (this._started.has(id) || this.state.counts[id] != null) return;
        this._started.add(id);
        this._active.set(id, {
          to: parseFloat(el.dataset.countTo) || 0,
          dec: parseInt(el.dataset.countDec || '0', 10),
          comma: el.dataset.countComma === 'true',
          prefix: el.dataset.countPrefix && el.dataset.countPrefix !== 'undefined' ? el.dataset.countPrefix : '',
          suffix: el.dataset.countSuffix && el.dataset.countSuffix !== 'undefined' ? el.dataset.countSuffix : '',
          t0: performance.now(),
        });
        this._loop();
      });
    }, { threshold: 0.25 });
    const boot = () => { this._scan(); try { this._mo = new MutationObserver(() => this._scan()); this._mo.observe(document.body, { childList: true, subtree: true }); } catch (e) {} };
    if (document.body) boot(); else setTimeout(boot, 0);
  }
  _scan() {
    if (!this._io) return;
    document.querySelectorAll('[data-count-id]').forEach(el => {
      const id = el.dataset.countId;
      if (this._started.has(id) || this.state.counts[id] != null || this._obs.has(el)) return;
      this._obs.add(el); this._io.observe(el);
    });
  }
  _fmt(v, c) {
    let n = v.toFixed(c.dec);
    if (c.comma) { const p = n.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); n = p.join('.'); }
    return c.prefix + n + c.suffix;
  }
  _loop() {
    if (this._raf) return;
    const step = () => {
      const now = performance.now(); const upd = {}; let more = false;
      this._active.forEach((c, id) => {
        const p = Math.min(1, (now - c.t0) / 1500); const e = 1 - Math.pow(1 - p, 3);
        upd[id] = this._fmt(c.to * e, c);
        if (p < 1) more = true; else this._active.delete(id);
      });
      this.setState(s => ({ counts: { ...s.counts, ...upd } }));
      this._raf = more ? requestAnimationFrame(step) : null;
    };
    this._raf = requestAnimationFrame(step);
  }

  _stories() {
    // The home carousel is drawn from the same records as the Stories deck: two per
    // programme, picked for the tightest pull-quote so the line fits at display size.
    const all = (typeof window !== 'undefined' && window.STORIES) ? window.STORIES : [];
    const out = [];
    ['hp', 'sol', 're', 'cj'].forEach(p => {
      all.filter(s => s.prog === p && s.pull && s.pull.length < 130)
        .sort((a, b) => a.pull.length - b.pull.length)
        .slice(0, 2)
        .forEach(s => out.push({
          quote: this._tc('stories', s.slug, 'pull', s.pull), name: this._tc('stories', s.slug, 'person', s.person), role: this._tc('stories', s.slug, 'personRole', s.personRole),
          program: this._tagMap('progLabel', s.progLabel, s.progLabel), art: s.art, slug: s.slug,
        }));
    });
    return out.length ? out : [{ quote: '', name: '', role: '', program: '', art: 'sm-mother-daughter', slug: '' }];
  }
  _arch() {
    const T = { ...this._dict().en, ...(this._dict()[this.state.lang] || {}) };
    const A = './assets/art/';
    const P = {
      sol: { name: 'School of Leadership', color: '#EAAE28', art: A + 'prog-sol.png' },
      re: { name: 'Rights & Entitlements', color: '#0E5565', art: A + 'prog-re.png' },
      hp: { name: 'Human Protection', color: '#D2305C', art: A + 'prog-hp.png' },
      cj: { name: 'Climate Justice', color: '#556223', art: A + 'prog-cj.png' },
    };
    const RAW = {
      P,
      questions: [
        { key: 'sol', q: 'How are leaders developed across the life course?',
          u: 'Leadership development, participation, institution building and community ownership.',
          line: 'It asks who communities become.' },
        { key: 're', q: 'What are communities progressively able to understand, claim and realise?',
          u: 'The continuous realisation of rights, access to public systems, justice and accountability at every stage of life.',
          line: 'It asks what that capability is for.' },
        { key: 'hp', q: 'How does leadership create safer communities?',
          u: 'Community-led prevention, protection systems, access to justice and collective responsibility.',
          line: 'It asks what has to hold when things go wrong.' },
        { key: 'cj', q: 'How does leadership strengthen community resilience?',
          u: 'Ecological stewardship, natural resource governance, climate resilience and sustainable livelihoods.',
          line: 'It asks what the household stands on.' },
      ],
      weave: {
        sol: {
          gives: [
            { k: 're', t: 'People who know what they are owed, and how to ask for it in a room full of officials.' },
            { k: 'hp', t: 'Village committees whose members will actually convene them, not just appear on a register.' },
            { k: 'cj', t: 'Young people who will steward the seed systems and water bodies after the project closes.' },
          ],
          needs: [
            { k: 're', t: 'Rights content — leadership with nothing to claim is a workshop, not a movement.' },
            { k: 'hp', t: 'Safety. A girl cannot lead in public if speaking up puts her at risk at home.' },
            { k: 'cj', t: 'Households stable enough to spare a child’s afternoon.' },
          ],
        },
        re: {
          gives: [
            { k: 'sol', t: 'Purpose. Entitlements give a new leader a first, winnable thing to organise around.' },
            { k: 'hp', t: 'Pensions, ration and scholarships that remove the economic pressure behind early marriage.' },
            { k: 'cj', t: 'MGNREGA, crop insurance and social protection that absorb a failed season.' },
          ],
          needs: [
            { k: 'sol', t: 'Leaders willing to carry a claim past the third refusal.' },
            { k: 'hp', t: 'Case work that surfaces the households no survey reaches.' },
            { k: 'cj', t: 'Farmer collectives that become the point of contact for a whole hamlet at once.' },
          ],
        },
        hp: {
          gives: [
            { k: 'sol', t: 'The conditions under which girls can hold public roles without paying for it.' },
            { k: 're', t: 'Identification of the most excluded households, found through cases rather than lists.' },
            { k: 'cj', t: 'Migration registers that show exactly where local livelihoods have failed.' },
          ],
          needs: [
            { k: 'sol', t: 'Child Parliaments and youth groups that notice risk months before a crisis.' },
            { k: 're', t: 'Entitlements that remove the reason a family considers sending a child away.' },
            { k: 'cj', t: 'Local work that shrinks distress migration, the single largest driver of trafficking risk.' },
          ],
        },
        cj: {
          gives: [
            { k: 'sol', t: 'Households not in crisis — the precondition for a child staying in school and in the group.' },
            { k: 're', t: 'Aajeevika Adhikar Sangathans as a standing platform for scheme access.' },
            { k: 'hp', t: 'Fewer departures. Every family that does not migrate is a protection case that never opens.' },
          ],
          needs: [
            { k: 'sol', t: 'The leadership that runs a sangathan once the facilitator stops coming.' },
            { k: 're', t: 'Convergence with line departments so a demonstration plot becomes a scheme.' },
            { k: 'hp', t: 'Protection systems that track families who still have to move.' },
          ],
        },
      },
      dims: [
        { k: 'cp', label: 'Child Parliament', art: A + 'behaviour-change.png', prog: 'sol',
          become: 'Participation, confidence, democratic leadership',
          claim: 'Child rights, participation and accountability',
          visible: 'Stronger schools, child protection and local governance' },
        { k: 'pan', label: 'PANCHI', full: 'PANCHI — Promoting Autonomy for Nurturing Choice in Health and Intimacy', art: A + 'demand-generation.png', prog: 'sol',
          become: 'Agency, peer leadership, critical thinking and decision-making',
          claim: 'Sexual and reproductive health and rights, education, gender equality and health rights',
          visible: 'Healthier adolescents, informed choices and greater community participation' },
        { k: 'hpx', label: 'Human Protection', art: A + 'prog-hp.png', prog: 'hp',
          become: 'Community leadership, collective responsibility and local institutions',
          claim: 'Protection rights, access to justice and public services',
          visible: 'Safer communities with stronger protection systems' },
        { k: 'cjx', label: 'Climate Justice', art: A + 'prog-cj.png', prog: 'cj',
          become: 'Collective leadership, stewardship and local decision-making',
          claim: 'Environmental rights, natural resource governance and livelihood security',
          visible: 'Climate-resilient communities and sustainable resource management' },
        { k: 'fel', label: 'Fellowship & Community Resource Persons', art: A + 'volunteer.png', prog: 'sol',
          become: 'Mentorship, facilitation and institution building',
          claim: 'Citizenship, governance and public entitlements',
          visible: 'Stronger community institutions capable of sustaining change' },
      ],
      uncrc: [
        { k: 'sur', label: 'Survival', arts: 'Articles 6, 24, 27', art: A + 'uncrc-survival.png',
          body: 'Life, health, nutrition and an adequate standard of living — the floor everything else stands on.',
          lead: 're', also: ['cj'] },
        { k: 'dev', label: 'Development', arts: 'Articles 13, 17, 28, 29, 31', art: A + 'uncrc-development.png',
          body: 'Education, information, play and the freedom to form a view of the world.',
          lead: 'sol', also: ['re'] },
        { k: 'pro', label: 'Protection', arts: 'Articles 19, 32, 34, 35', art: A + 'uncrc-protection.png',
          body: 'Freedom from exploitation, abuse, trafficking, neglect and harmful work.',
          lead: 'hp', also: ['sol'] },
        { k: 'par', label: 'Participation', arts: 'Articles 12, 13, 15', art: A + 'uncrc-participation.png',
          body: 'The right to express a view and to be heard in decisions that shape your own life.',
          lead: 'sol', also: ['re', 'hp', 'cj'] },
      ],
      csr: [
        { n: '(i)', t: 'Hunger, poverty, malnutrition, health care, sanitation and safe drinking water', progs: ['re', 'cj'] },
        { n: '(ii)', t: 'Education, special education, vocational skills for children and women, and livelihood enhancement', progs: ['sol', 're'] },
        { n: '(iii)', t: 'Gender equality, women’s empowerment, and reducing inequalities faced by socially and economically backward groups', progs: ['sol', 'hp'] },
        { n: '(iv)', t: 'Environmental sustainability, ecological balance, agroforestry, conservation of natural resources, soil, air and water', progs: ['cj'] },
        { n: '(x)', t: 'Rural development projects', progs: ['sol', 're', 'hp', 'cj'] },
      ],
      mdg: T.mdg_para,
    };
    const tc = (id, f, fb) => this._tc('arch', id, f, fb);
    return {
      P: Object.fromEntries(Object.entries(RAW.P).map(([k, v]) => [k, { ...v, name: this._tc('programmes', k, 'name', v.name) }])),
      questions: RAW.questions.map(x => ({ ...x,
        q: tc('q_' + x.key, 'q', x.q), u: tc('q_' + x.key, 'u', x.u), line: tc('q_' + x.key, 'line', x.line) })),
      weave: Object.fromEntries(Object.entries(RAW.weave).map(([pk, v]) => [pk, {
        gives: v.gives.map(g => ({ ...g, t: tc('weave_' + pk + '_g_' + g.k, 't', g.t) })),
        needs: v.needs.map(g => ({ ...g, t: tc('weave_' + pk + '_n_' + g.k, 't', g.t) })),
      }])),
      dims: RAW.dims.map(d => ({ ...d,
        label: tc('dim_' + d.k, 'label', d.label),
        full: d.full ? tc('dim_' + d.k, 'full', d.full) : d.full,
        become: tc('dim_' + d.k, 'become', d.become),
        claim: tc('dim_' + d.k, 'claim', d.claim),
        visible: tc('dim_' + d.k, 'visible', d.visible) })),
      uncrc: RAW.uncrc.map(u => ({ ...u,
        label: this._tagMap('uncrc_word', u.label, u.label),
        body: tc('uncrc_' + u.k, 'body', u.body) })),
      csr: RAW.csr.map((c, i) => ({ ...c, t: tc('csr_' + i, 't', c.t) })),
      mdg: RAW.mdg,
    };
  }
  _programs() {
    return [
      { name: 'School of Leadership', key: 'sol', art: 'prog-sol', tag: 'Co-Create · Co-Facilitate · Lead', color: '#EAAE28',
        detail: 'From Child Parliaments to adolescent and youth groups, children evolve as leaders — participating, claiming rights, and driving community and public systems as citizens of today.',
        stats: [{ num: '14,628+', label: 'Children and Adolescents Reached through Capacity Building' }, { num: '877', label: 'Community-Based Organisations Capacity-Built with Them' }] },
      { name: 'Rights & Entitlements', key: 're', art: 'prog-re', tag: 'Know · Organise · Converge', color: '#0E5565',
        detail: 'Bridging communities and public systems to ensure access to entitlements — so that rights are not just available, but accessed, realised, and sustained in everyday life.',
        stats: [{ num: '₹8.88 Cr', label: 'Government Resources Drawn into the Community’s Own Villages' }, { num: '4,051+', label: 'Families Securing Entitlements and Land Rights' }] },
      { name: 'Climate Justice', key: 'cj', art: 'prog-cj', tag: 'Soil · Seed · Water · Voice', color: '#556223',
        detail: 'Strengthening sustainable farming, nutrition, and livelihoods to reduce distress migration and economic vulnerability — ensuring stability for families and safety for children.',
        stats: [{ num: '2,460+', label: 'Farmers in Diversified and Natural Farming' }, { num: '725+', label: 'Women Farmers Organised into Their Own Collectives' }] },
      { name: 'Human Protection', key: 'hp', art: 'prog-hp', tag: 'Prevention · Protection · Prosecution · Partnership', color: '#D2305C',
        detail: 'Addressing child marriage, trafficking, abuse, and migration through prevention, protection, prosecution, and partnership — ensuring a timely, coordinated system response.',
        stats: [{ num: '6,160+', label: 'Child Protection Cases Responded To' }, { num: '250', label: 'Village Child Protection Committees Anchoring the Work' }] },
    ].map(p => Object.assign({}, p, {
      name: this._tc('programmes', p.key, 'name', p.name),
      tag: this._tc('programmes', p.key, 'tag', p.tag),
      detail: this._tc('home_programs', p.key, 'detail', p.detail),
      stats: p.stats.map((s, i) => ({ num: s.num, label: this._tc('home_programs', p.key + '_' + i, 'label', s.label) })),
    }));
  }
  _cycle() {
    // Every stage of the Structural Vulnerability Cycle. Figures = worst recorded value
    // across UP's Indo-Nepal Terai belt (Bahraich, Shravasti, Balrampur, Lakhimpur Kheri,
    // Siddharthnagar, Maharajganj, Kushinagar), read from the NFHS-5 (2019-21) district
    // fact-sheet dataset unless another source is named on the card.
    const STAGES = [
      { img: './assets/svc/underage-mother.png', chapter: 'Maternal health', short: 'Underage Mother', stat: '56%', title: 'A Malnourished, Underage Mother',
        story: 'The girl in this picture is carrying a child before her own body is ready. In Lakhimpur Kheri, 56% of pregnant women are anaemic, already weakened before pregnancy even begins.',
        src: 'National Family Health Survey 5 · Lakhimpur Kheri (56.1% of pregnant women) — highest in the belt', leads: 'Her own life is at risk' },
      { img: './assets/svc/maternal-death.png', chapter: 'Maternal health', short: 'Maternal Deaths', stat: '167', title: 'Mothers Lost to Childbirth',
        story: 'This mother did not survive childbirth. In Uttar Pradesh, 167 mothers die for every 100,000 births — among the worst rates in India — when a frail body meets a health system too far away.',
        src: 'Sample Registration System 2018–20 · Uttar Pradesh (state-level)', leads: 'And her baby starts life behind' },
      { img: './assets/svc/undernourished.png', chapter: 'Infancy', short: 'Undernourished at Birth', stat: '87%', title: 'An Undernourished Infant at Birth',
        story: 'This newborn is never put to the breast in time. In Maharajganj, 87% of babies miss feeding in the first hour — losing the earliest, most protective nourishment of their lives.',
        src: 'National Family Health Survey 5 · Maharajganj (86.6%) — highest in the belt', leads: 'Some do not survive the first year' },
      { img: './assets/svc/infant-death.png', chapter: 'Infancy', short: 'High Infant Mortality', stat: '48', title: 'High Infant Mortality',
        story: 'This baby does not live to see its first birthday. In Bahraich, 48 of every 1,000 infants die in their first year — most from causes that timely care could have prevented.',
        src: 'DEHAT Vulnerability Index workbook · Bahraich (48.2 per 1,000) — no official district series; unverified', leads: 'Because care rarely arrives' },
      { img: './assets/svc/natal-care.png', chapter: 'Infancy', short: 'No Ante- or Post-Natal Care', stat: '66%', title: 'No Ante- or Post-Natal Care',
        story: 'No health worker ever checks on this mother or her baby. In Bahraich, 66% of mothers get no full antenatal care and 48% receive no check-up in the two days after delivery — passing through the most dangerous months unseen.',
        src: 'National Family Health Survey 5 · Bahraich (65.7% no 4+ ANC; 47.6% no post-natal care within 2 days)', leads: 'So vaccines are missed too' },
      { img: './assets/svc/immunisation.png', chapter: 'Early childhood', short: 'Irregular Immunisation', stat: '48%', title: 'Irregular Immunisation of Under-5s',
        story: 'This child never completes its vaccinations. In Bahraich, 48% of children aged 12–23 months are not fully immunised — left open to diseases the rest of the country has all but defeated.',
        src: 'National Family Health Survey 5 · Bahraich (48.2% not fully vaccinated) — highest in the belt', leads: 'Preventable illness takes its toll' },
      { img: './assets/svc/under5-death.png', chapter: 'Early childhood', short: 'Under-5 Deaths', stat: '59', title: 'High Under-5 Mortality',
        story: 'This child does not reach the age of five. In Bahraich, 59 of every 1,000 children die before their fifth birthday — to diarrhoea, pneumonia and measles, all treatable where care can reach.',
        src: 'DEHAT Vulnerability Index workbook · Bahraich (58.5 per 1,000) — no official district series; unverified', leads: 'The survivors carry the damage' },
      { img: './assets/svc/malnutrition.png', chapter: 'Early childhood', short: 'Malnourished Child', stat: '1 in 2', title: 'A Child Who Cannot Catch Up',
        story: 'This child is small and weak for its age. In Bahraich, 1 in 2 children under five is stunted — hunger written permanently into the body, and rarely recovered later in life.',
        src: 'National Family Health Survey 5 · Bahraich (52.1%)', leads: 'School becomes a harder climb' },
      { img: './assets/svc/menstrual.png', chapter: 'Adolescence', short: 'Menstrual Dignity', stat: '53%', title: 'Adolescence Without Dignity',
        story: 'This girl has no safe, private way to manage her period. In Shravasti, 53% of women aged 15–24 use no hygienic method of protection — and school slowly becomes impossible.',
        src: 'National Family Health Survey 5 · Shravasti (52.6%) — highest in the belt', leads: 'So girls start disappearing from class' },
      { img: './assets/svc/dropout.png', chapter: 'Adolescence', short: 'School Dropout', stat: '1 in 4', title: 'Pushed Out of School',
        story: 'This girl\u2019s desk sits empty. In Shravasti, close to 1 in 4 girls drops out of primary and upper-primary school — each departure closing a door on literacy, choice and a different future.',
        src: 'Unified District Information System for Education Plus · Shravasti (23.5%)', leads: 'An out-of-school child is exposed' },
      { img: './assets/svc/child-labour.png', chapter: 'Exploitation & rights', short: 'Child & Bonded Labour', stat: '1 in 9', title: 'A Childhood Traded for Wages',
        story: 'This child works instead of learning. In Shravasti, around 1 in 9 children labours in fields, kilns, hotels and homes — once out of school, a child the market can put a price on.',
        src: 'Census / administrative records · Shravasti (11.2%)', leads: 'Or is married off instead' },
      { img: './assets/svc/child-marriage.png', chapter: 'Exploitation & rights', short: 'Child Marriage', stat: '52%', title: 'Married as a Child',
        story: 'This girl is married while still a child. In Shravasti, 52% of women aged 20–24 were wed before eighteen — illegal, yet ordinary, and the quickest way a struggling family sheds a mouth to feed.',
        src: 'National Family Health Survey 5 · Shravasti (51.9%) — highest in the belt', leads: 'Some marriages are a disguise' },
      { img: './assets/svc/trafficking.png', chapter: 'Exploitation & rights', short: 'Human Trafficking', stat: '382', title: 'Trafficking Dressed as Marriage',
        story: 'For this girl, "marriage" is a trafficker\u2019s cover. Across the open Indo-Nepal border, DEHAT and its community networks have intercepted 382 children from trafficking risk disguised this way.',
        src: 'DEHAT field data · Indo-Nepal border districts', leads: 'Meanwhile, boys leave school to earn' },
      { img: './assets/svc/bread-earner.png', chapter: 'Exploitation & rights', short: 'Boys as Bread-Earners', stat: '41%', title: 'Boys Pushed Into Earning',
        story: 'This boy leaves home to earn instead of study. In Shravasti, 41% of families are in India\u2019s poorest wealth bracket, sending sons into unsafe work in hotels, eateries and construction far from home.',
        src: 'National Family Health Survey wealth index · Shravasti (40.5%) — awaiting re-verification', leads: 'Daughters carry a different burden' },
      { img: './assets/svc/violence.png', chapter: 'Exploitation & rights', short: 'Discrimination and Violence', stat: '33%', title: 'A Girl Facing Discrimination and Violence',
        story: 'This young woman lives with abuse inside her own home. Across Uttar Pradesh, 33% of ever-married women report violence from a husband — the walls of the home a girl was married into far too young.',
        src: 'National Family Health Survey 5 · Uttar Pradesh (33.1%) — collected in the state module only, not published by district', leads: 'And then she becomes a mother' },
      { img: './assets/svc/next-mother.png', chapter: 'The next generation', short: 'The Next Mother', stat: '1 in 12', title: 'A Girl Becomes the Next Mother',
        story: 'This girl is already a mother herself. In Bahraich, 1 in 12 girls aged 15–19 has given birth — anaemic, out of school, unsupported — and her child is born into the same trap, unless the cycle is broken.',
        src: 'National Family Health Survey 5 · Bahraich (8.4%)', leads: 'And the cycle begins again \u21ba' },
    ];
    return STAGES.map(s => ({
      ...s,
      chapter: this._tc('cycle', s.short, 'chapter', s.chapter),
      title: this._tc('cycle', s.short, 'title', s.title),
      story: this._tc('cycle', s.short, 'story', s.story),
      src: this._tc('cycle', s.short, 'src', s.src),
      leads: this._tc('cycle', s.short, 'leads', s.leads),
      shortLabel: this._tc('cycle', s.short, 'shortLabel', s.short),
    }));
  }
  _districts() {
    return [
      { name: 'Bahraich', state: 'Uttar Pradesh', x: '46%', y: '20%', note: 'Our home district on the Indo-Nepal border — an Aspirational District and the heart of our Child Parliament model.', stats: [{ num: '903', label: 'Gram Panchayats Surveyed across the Footprint' }, { num: '68', label: 'Blocks Worked In' }] },
      { name: 'Shravasti', state: 'Uttar Pradesh', x: '56%', y: '15%', note: 'A high-vulnerability Terai district where anti-trafficking and early-marriage prevention converge.', stats: [] },
      { name: 'Balrampur', state: 'Uttar Pradesh', x: '66%', y: '18%', note: 'Border district with acute distress migration; our system-strengthening work anchors here.', stats: [] },
      { name: 'Siddharthnagar', state: 'Uttar Pradesh', x: '77%', y: '22%', note: 'Terai district with deep intergenerational nutrition gaps addressed through natural farming.', stats: [] },
      { name: 'Maharajganj', state: 'Uttar Pradesh', x: '86%', y: '28%', note: 'Eastern-most UP border stretch; livelihoods and citizenship rights work.', stats: [] },
      { name: 'Kushinagar', state: 'Uttar Pradesh', x: '84%', y: '38%', note: 'Migration-corridor district where bridge schools rehabilitate child labourers.', stats: [] },
      { name: 'Sonbhadra', state: 'Uttar Pradesh', x: '72%', y: '52%', note: 'Southern UP; forest-rights and entitlement access for marginalised communities.', stats: [{ num: '26', label: 'Joint Forest Management Committees Constituted' }] },
      { name: 'Amethi', state: 'Uttar Pradesh', x: '52%', y: '40%', note: 'Central UP; rights & entitlements convergence work.', stats: [{ num: '3,551', label: 'Children Reached through the Integrated Programme' }] },
      { name: 'Noida', state: 'Uttar Pradesh', x: '30%', y: '38%', note: 'Destination city for distress migration; survivor-centric coordination with law enforcement.', stats: [] },
      { name: 'Washim', state: 'Maharashtra', x: '26%', y: '74%', note: 'Maharashtra footprint; women-farmer collectives and nutrition security.', stats: [] },
      { name: 'Osmanabad', state: 'Maharashtra', x: '20%', y: '84%', note: 'Drought-prone district; climate-resilient livelihoods reduce distress migration.', stats: [] },
      { name: 'Nandurbar', state: 'Maharashtra', x: '12%', y: '70%', note: 'Tribal-majority district; rights, nutrition, and child-protection systems.', stats: [] },
      { name: 'Gadchiroli', state: 'Maharashtra', x: '40%', y: '88%', note: 'Remote forested district; forest rights and community-based protection.', stats: [] },
    ];
  }

  // Content-body translation lookup (narrative prose in projects-data.js, journey-data.js,
  // etc. — separate from the UI-chrome dictionary in _dict()). Every content file keeps its
  // English text as the single source of truth; a per-language overlay in CONTENT_I18N maps
  // section -> id -> field -> translated string. Falls back to the English fallback whenever
  // the current language has no override yet, so partially-translated content never breaks.
  _tc(section, id, field, fallback) {
    const lang = this.state.lang;
    if (!lang || lang === 'en') return fallback;
    const dict = (typeof window !== 'undefined' && window.CONTENT_I18N) || null;
    const langDict = dict && dict[lang];
    const entry = langDict && langDict[section] && langDict[section][id];
    const v = entry && entry[field];
    return (v != null && v !== '') ? v : fallback;
  }
  _tagMap(kind, key, fallback) {
    const lang = this.state.lang;
    if (!lang || lang === 'en') return fallback;
    const dict = (typeof window !== 'undefined' && window.CONTENT_I18N) || null;
    const m = dict && dict[lang] && dict[lang].tagMaps && dict[lang].tagMaps[kind];
    const v = m && m[key];
    return (v != null && v !== '') ? v : fallback;
  }
  // Recursively translates every string leaf of a nested data object (arrays/objects of any
  // depth) by looking it up in window.CONTENT_I18N[lang].journey[prog] under a dot/index path
  // matching the object's own shape (e.g. "cascade.steps.2.label"). Falls back to the original
  // English value wherever no translation entry exists, so partial coverage never breaks render.
  _deepTr(obj, prog, path) {
    const lang = this.state.lang;
    if (!lang || lang === 'en' || obj == null) return obj;
    if (Array.isArray(obj)) return obj.map((v, i) => this._deepTr(v, prog, path + '.' + i));
    if (typeof obj === 'object') {
      const out = {};
      for (const k in obj) out[k] = this._deepTr(obj[k], prog, path ? path + '.' + k : k);
      return out;
    }
    if (typeof obj === 'string') {
      const dict = (typeof window !== 'undefined' && window.CONTENT_I18N) || null;
      const entry = dict && dict[lang] && dict[lang].journey && dict[lang].journey[prog];
      const v = entry && entry[path];
      return (v != null && v !== '') ? v : obj;
    }
    return obj;
  }
  _tok(hex) { return ({ '#0E5565':'var(--ac-teal)', '#556223':'var(--ac-olive)', '#D2305C':'var(--ac-crimson)', '#A92719':'var(--ac-red)', '#4F0E73':'var(--ac-purple)', '#0E9CB8':'var(--ac-cyan)', '#EAAE28':'var(--ac-gold)' })[hex] || hex; }
  _lift(hex) { return ({ '#0E5565':'#79C3D3', '#556223':'#C2CE72', '#D2305C':'#F58EA6', '#A92719':'#F0907C', '#4F0E73':'#C79BE4', '#0E9CB8':'#7FD6E4', '#7A3E8C':'#CFA3E0', '#1F7A5A':'#7FD9B6', '#B4571A':'#F2A868', '#2E5E9E':'#92BDEA', '#8C1F45':'#F090AE', '#4A6B12':'#B8D163', '#0F7C86':'#79D3DB', '#6E2B12':'#E39A7E' })[hex] || hex; }
  // Mirror of _lift: darkened brand colours for small text on a LIGHT surface.
  _sink(hex) { return ({ '#EAAE28':'#7A5806', '#0E9CB8':'#0A6070', '#7FD6E4':'#0A6070', '#C2CE72':'#4A5520', '#7A3E8C':'#5E2A6E', '#1F7A5A':'#14563E', '#B4571A':'#7A3A0F', '#2E5E9E':'#1E3F6B', '#8C1F45':'#6B1735', '#4A6B12':'#354D0C', '#0F7C86':'#0A555C', '#6E2B12':'#4E1E0C' })[hex] || hex; }
  // Theme-aware ink for small brand-coloured text sitting on a theme surface.
  _inkOn(hex) { return this.state.theme === 'dark' ? this._lift(hex) : this._sink(hex); }
  _inkRows(rows) { return rows.map(r => Object.assign({}, r, { ink: this._inkOn(r.color) })); }
  // Readable ink for text sitting ON a solid brand fill (white fails on gold).
  _ink(hex) {
    const h = String(hex).replace('#', '');
    const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const ratio = (a, b2) => (Math.max(a, b2) + 0.05) / (Math.min(a, b2) + 0.05);
    // Pick whichever ink actually contrasts more with this fill, not a luminance guess.
    return ratio(L, 1) >= ratio(L, 0.01096) ? '#ffffff' : '#1f1710';
  }
  _inkA(hex, a) { return this._ink(hex) === '#ffffff' ? 'rgba(255,255,255,' + a + ')' : 'rgba(31,23,16,' + a + ')'; }
  _ledger() {
    const T = { ...this._dict().en, ...(this._dict()[this.state.lang] || {}) };
    const FIN = (typeof window !== 'undefined' && window.FIN) ? window.FIN : null;
    const S = this.state;
    const sortKey = S.ledSort || 'recent';
    const filt = S.ledFilter || 'all';
    const pins = S.ledPins || [];
    const base = {
      ledRows: [], ledSummary: [], ledSortTabs: [], ledFilterTabs: [], ledPinned: [], ledCurrTabs: [],
      ledHasPins: false, ledClearPins: () => this.setState({ ledPins: [] }),
      ledCount: '', ledEmpty: false,
    };
    if (!FIN || !FIN.YEARS) return base;
    const finCurrSel = S.finCurr === 'USD' ? 'USD' : 'INR';
    // Same convention as the Explore-the-Accounts dashboard: convert each year's own figure at
    // that year's own rate, once, here \u2014 so a 20-year total in USD sums each year's rate rather
    // than applying one rate to everything (which would misstate older years significantly).
    const toDisp = (inr, year) => (finCurrSel === 'USD' && this._pd) ? this._pd.usd(inr, parseInt(year, 10)) : inr;
    const rs = (n) => {
      if (n == null) return '\u2014';
      const a = Math.abs(n), sg = n < 0 ? '\u2212' : '';
      if (finCurrSel === 'USD') { if (!this._pd) return '\u2014'; return sg + this._pd.fmtUSD(a); }
      if (a >= 1e7) return sg + '\u20b9' + (a / 1e7).toFixed(2) + ' Cr';
      if (a >= 1e5) return sg + '\u20b9' + (a / 1e5).toFixed(1) + ' L';
      return sg + '\u20b9' + Math.round(a).toLocaleString('en-IN');
    };
    const exact = (n) => {
      if (n == null) return '\u2014';
      if (finCurrSel === 'USD') { if (!this._pd) return '\u2014'; const sg = n < 0 ? '\u2212' : ''; return sg + this._pd.fmtUSD(Math.abs(n)); }
      return '\u20b9' + Math.round(n).toLocaleString('en-IN');
    };
    const amt = (r) => (r.grant || 0) + (r.interest || 0);
    const recs = FIN.YEARS.map(y => {
      const named = (y.received || []).reduce((t, r) => t + amt(r), 0);
      const sched = (y.spend || []).reduce((t, r) => t + (r.total || 0), 0);
      const inv = y.receivedTotal != null ? y.receivedTotal : named;
      const dep = y.utilisedTotal != null ? y.utilisedTotal : sched;
      const fcra = (y.received || []).filter(r => r.regime === 'FCRA').reduce((t, r) => t + amt(r), 0);
      return {
        y, fy: y.fy, start: parseInt(y.fy, 10),
        inv: toDisp(inv, y.fy), dep: toDisp(dep, y.fy), fcra: toDisp(fcra, y.fy), inr: toDisp(Math.max(0, inv - fcra), y.fy),
        named, diff: Math.round(inv - named),
        surplus: y.surplus != null ? toDisp(y.surplus, y.fy) : null, bs: y.balanceSheetTotal != null ? toDisp(y.balanceSheetTotal, y.fy) : null,
        attested: !!y.signed, udin: y.udin || '', summaryOnly: !!y.partial, doc: y.doc || '',
        firm: (y.auditor || '\u2014').split('(')[0].trim(),
        firmFull: y.auditor || '\u2014',
      };
    });
    const max = Math.max(1, ...recs.map(r => Math.max(r.inv, r.dep)));
    const totInv = recs.reduce((t, r) => t + r.inv, 0);
    const totDep = recs.reduce((t, r) => t + r.dep, 0);
    const firms = new Set(recs.map(r => r.firm.toLowerCase()));
    base.ledSummary = [
      { k: 'a', value: '20', label: 'Financial years on the record, unbroken from 2005\u201306 to 2024\u201325', color: this._tok('#EAAE28') },
      { k: 'b', value: rs(totInv), label: 'Committed by investment partners across the twenty years', color: this._tok('#0E5565') },
      { k: 'c', value: rs(totDep), label: 'Deployed into programmes over the same period, reserves included', color: this._tok('#556223') },
      { k: 'd', value: String(firms.size), label: 'Independent audit firms have examined these books', color: this._tok('#D2305C') },
    ];
    const FILTERS = [
      { k: 'all', label: 'All Twenty Years', test: () => true },
      { k: 'signed', label: 'Signed by the auditor', test: r => r.attested },
      { k: 'foreign', label: 'Carried foreign contribution', test: r => r.fcra > 0 },
      { k: 'reserves', label: 'Drew on reserves', test: r => r.surplus != null && r.surplus < 0 },
      { k: 'itemised', label: 'Itemised partner by partner', test: r => !r.summaryOnly },
    ];
    const SORTS = [
      { k: 'recent', label: 'Most recent first', cmp: (a, b) => b.start - a.start },
      { k: 'oldest', label: 'Earliest first', cmp: (a, b) => a.start - b.start },
      { k: 'inv', label: 'Largest commitment', cmp: (a, b) => b.inv - a.inv },
      { k: 'dep', label: 'Largest deployment', cmp: (a, b) => b.dep - a.dep },
    ];
    base.ledCurrTabs = [
      { key: 'INR', label: '₹ INR' }, { key: 'USD', label: '$ USD' },
    ].map(t => ({ ...t, k: 'lc-' + t.key + (finCurrSel === t.key ? '-on' : '-off'), bg: finCurrSel === t.key ? '#EAAE28' : 'transparent', fg: finCurrSel === t.key ? '#1f1710' : 'var(--dim)', select: () => this.setState({ finCurr: t.key }) }));
    base.ledSortTabs = SORTS.map(s => ({
      k: s.k + (sortKey === s.k ? '-on' : ''), label: s.label,
      bg: sortKey === s.k ? '#EAAE28' : 'transparent',
      fg: sortKey === s.k ? '#1a130b' : 'var(--dim)',
      ring: sortKey === s.k ? '#EAAE28' : 'var(--border)',
      select: () => this.setState({ ledSort: s.k }),
    }));
    const active = FILTERS.find(f => f.k === filt) || FILTERS[0];
    base.ledFilterTabs = FILTERS.map(f => ({
      k: f.k + (filt === f.k ? '-on' : ''), label: f.label + ' \u00b7 ' + recs.filter(f.test).length,
      bg: filt === f.k ? 'var(--surface)' : 'transparent',
      fg: filt === f.k ? 'var(--text)' : 'var(--faint)',
      ring: filt === f.k ? this._tok('#0E5565') : 'var(--border)',
      select: () => this.setState({ ledFilter: f.k }),
    }));
    const shown = recs.filter(active.test).slice().sort((SORTS.find(s => s.k === sortKey) || SORTS[0]).cmp);
    base.ledCount = shown.length === 20 ? 'Twenty financial years, oldest signed 18 November 2006.' : 'Showing ' + shown.length + ' of 20 financial years.';
    base.ledEmpty = shown.length === 0;
    const detail = (r) => {
      const pinned = pins.indexOf(r.fy) >= 0;
      const drew = r.surplus != null && r.surplus < 0;
      return {
        k: r.fy + (S.ledOpen === r.fy ? '-o' : '') + (pinned ? '-p' : ''),
        fy: r.fy, period: r.y.period || '',
        inv: rs(r.inv), dep: rs(r.dep), invExact: exact(r.inv), depExact: exact(r.dep),
        invW: (r.inv / max * 100).toFixed(1) + '%', depW: (r.dep / max * 100).toFixed(1) + '%',
        resultLabel: r.surplus == null ? 'Not Stated' : (drew ? 'From Reserves' : 'To Reserves'),
        resultVal: r.surplus == null ? '\u2014' : rs(Math.abs(r.surplus)),
        resultColor: r.surplus == null ? 'var(--faint)' : (drew ? this._tok('#A92719') : this._tok('#556223')),
        attestLabel: (r.attested ? 'Signed' : 'Compiled') + (r.summaryOnly ? ' · Summary' : ''),
        attestColor: r.attested ? this._tok('#556223') : this._tok('#EAAE28'),
        attestDot: r.attested ? '#556223' : '#EAAE28',
        attestBody: r.summaryOnly
          ? (r.attested ? 'Examined and signed by ' + r.firmFull + '. ' : 'Prepared and certified by ' + r.firmFull + '. ')
            + 'The statement for this year certifies summary figures and does not itemise receipts by partner, so the totals above are audited while the roster below is partial.'
          : (r.attested
            ? 'Examined and signed by ' + r.firmFull + '.'
            : 'Prepared and certified by ' + r.firmFull + ' as a consolidated statement.'),
        summaryOnly: r.summaryOnly,
        partnerHead: r.summaryOnly ? 'Investment Partners Recorded This Year' : 'Investment Partners This Year',
        partnerCaveat: 'Summary year: these are the partners the certified statement names. It does not itemise the year\u2019s receipts in full, so this roster is not the complete list.',
        firm: r.firm, firmFull: r.firmFull,
        udin: r.udin, hasUdin: !!r.udin, doc: r.doc, hasDoc: !!r.doc,
        // The annual foreign-contribution return is published only where a real file
        // has been placed in the data. Never derive the path or the form name: which
        // form a year was filed on is DEHAT's statutory history, not something to infer.
        hasFcReturn: !!r.y.fcReturn,
        fcReturnStatus: r.y.fcReturnStatus || '',
        hasFcReturnStatus: !!r.y.fcReturnStatus,
        fcReturnLabel: r.y.fcReturnForm || 'FC-4',
        fcReturnDoc: r.y.fcReturn || '',
        fcReturnTitle: 'Open the ' + (r.y.fcReturnForm || 'FC-4')
          + ' foreign contribution return filed for ' + r.fy,
        fcReturnFull: 'Open the ' + (r.y.fcReturnForm || 'FC-4')
          + ' foreign contribution return for this year',
        // A foreign-contribution year with no published return says so, and gives the
        // reader a way to ask for it, rather than a link to a file that is not there.
        fcAskable: r.fcra > 0 && !r.y.fcReturn,
        fcAskLabel: 'Return on Request',
        fcAskTitle: 'Ask us for the foreign contribution return filed for ' + r.fy,
        fcAskHref: 'mailto:info@dehatindia.org?subject='
          + encodeURIComponent('Foreign contribution return for FY' + r.fy)
          + '&body=' + encodeURIComponent('Please send the annual return filed under the '
            + 'Foreign Contribution (Regulation) Act for the financial year ' + r.fy
            + ', together with the form it was filed on and the date of filing.'),
        bs: r.bs != null ? exact(r.bs) : '\u2014', hasBs: r.bs != null,
        fcra: rs(r.fcra), inr: rs(r.inr),
        fcraW: (r.fcra / Math.max(1, r.inv) * 100).toFixed(1) + '%',
        fcraPct: Math.round(r.fcra / Math.max(1, r.inv) * 100) + '%',
        inrPct: Math.round(r.inr / Math.max(1, r.inv) * 100) + '%',
        open: S.ledOpen === r.fy,
        rowBg: S.ledOpen === r.fy ? 'var(--surface)' : 'transparent',
        fyColor: S.ledOpen === r.fy ? this._tok('#EAAE28') : 'var(--text)',
        toggle: () => this.setState(s => ({ ledOpen: s.ledOpen === r.fy ? '' : r.fy })),
        pinned, pinLabel: pinned ? '\u2715' : '+',
        pinRing: pinned ? this._tok('#EAAE28') : 'var(--border)',
        pinFg: pinned ? this._tok('#EAAE28') : 'var(--faint)',
        pinTitle: pinned ? 'Remove ' + r.fy + ' from the comparison' : 'Compare ' + r.fy,
        pin: () => this.setState(s => {
          const cur = s.ledPins || [];
          if (cur.indexOf(r.fy) >= 0) return { ledPins: cur.filter(x => x !== r.fy) };
          return { ledPins: cur.length >= 3 ? cur.slice(1).concat(r.fy) : cur.concat(r.fy) };
        }),
        hasGap: Math.abs(r.diff) > 100,
        gap: r.diff > 0
          ? exact(toDisp(r.diff, r.fy)) + ' of the year\u2019s receipts is carried in the audited total without a named partner line.'
          : 'The partner lines below sum to ' + exact(toDisp(r.named, r.fy)) + ' against an audited receipts total of ' + exact(r.inv) + '. The grant schedule records each partner\u2019s sanctioned amount, while the receipts statement is net of sums already received in an earlier year or returned unspent \u2014 a difference of ' + exact(Math.abs(toDisp(r.diff, r.fy))) + '. The audited total is the figure shown above.',
        partners: (r.y.received || []).map(p => {
          const v = toDisp(amt(p), r.fy);
          const nm = FIN.displayName ? FIN.displayName(p.funder) : (p.funder || '\u2014');
          let lab = FIN.publicLabel ? FIN.publicLabel(p) : '';
          if (lab && lab.toLowerCase() === nm.toLowerCase()) lab = '';
          return {
            k: (p.funder || '') + v,
            name: nm,
            what: lab || '', hasWhat: !!lab,
            amount: rs(v), _v: v,
            w: (v / Math.max(1, r.inv) * 100).toFixed(1) + '%',
            regime: p.regime === 'FCRA' ? T.fin_foreign_contribution : T.fin_domestic,
            color: p.regime === 'FCRA' ? '#0E5565' : '#556223',
            tone: p.regime === 'FCRA' ? this._tok('#0E5565') : this._tok('#556223'),
          };
        }).filter(p => p._v > 0).sort((a, b) => b._v - a._v),
      };
    };
    base.ledRows = shown.map(detail);
    const pinRecs = pins.map(fy => recs.find(r => r.fy === fy)).filter(Boolean);
    base.ledHasPins = pinRecs.length > 0;
    base.ledPinned = pinRecs.map(r => {
      const d = detail(r);
      return { k: 'p' + r.fy, fy: r.fy, inv: d.inv, dep: d.dep, firm: r.firm,
        resultLabel: d.resultLabel, resultVal: d.resultVal, resultColor: d.resultColor,
        fcraPct: d.fcraPct, drop: d.pin };
    });
    return base;
  }

  _raiseComposer() {
    const T = { ...this._dict().en, ...(this._dict()[this.state.lang] || {}) };
    const EMAIL = 'joinus@dehatindia.org';
    const KINDS_EN = [
      { k: 'safeguard', label: 'Safeguarding or a child at risk',
        subject: 'Safeguarding concern',
        opener: 'I am writing to raise a safeguarding concern connected to DEHAT\u2019s work.',
        route: 'Safeguarding concerns go to the named safeguarding focal point and are placed before the Governing Board. Where a child may be at immediate risk, please also call 1098 or the number above.',
        ph: 'What happened, where, and when \u2014 as much or as little as you are able to write.' },
      { k: 'conduct', label: 'Conduct of someone connected to DEHAT',
        subject: 'Concern about conduct',
        opener: 'I would like to raise a concern about the conduct of someone connected to DEHAT.',
        route: 'Concerns about the conduct of staff, fellows or volunteers are handled outside the line of the person concerned and reported to the Governing Board.',
        ph: 'What you saw or experienced, the district or programme it relates to, and when.' },
      { k: 'money', label: 'A figure or the use of funds',
        subject: 'Query on a published figure',
        opener: 'I have a question about a figure or a use of funds published on DEHAT\u2019s transparency page.',
        route: 'Queries on figures are answered against the signed audited statement for the year in question, and the statement itself is sent with the reply.',
        ph: 'Which figure, which year, and what you would like reconciled.' },
      { k: 'docs', label: 'I need documents',
        subject: 'Document request',
        opener: 'I would like to request the following documents from DEHAT.',
        route: 'Document requests are answered from the same files published on this page. Anything not published is sent on request unless it names a child or a complainant.',
        ph: 'Any detail that helps us send the right version \u2014 the year, the programme, the language you need.' },
      { k: 'other', label: 'Something else',
        subject: 'Message through the transparency page',
        opener: 'I am writing through DEHAT\u2019s transparency page.',
        route: 'Anything sent here is read by the core team and acknowledged. If it belongs with the Board, it is put to the Board.',
        ph: 'Tell us what you need.' },
    ];
    const KINDS = KINDS_EN.map(x => ({
      ...x,
      label: this._tc('raise_kinds', x.k, 'label', x.label),
      subject: this._tc('raise_kinds', x.k, 'subject', x.subject),
      opener: this._tc('raise_kinds', x.k, 'opener', x.opener),
      route: this._tc('raise_kinds', x.k, 'route', x.route),
      ph: this._tc('raise_kinds', x.k, 'ph', x.ph),
    }));
    const DOCS_EN = [
      'The audited statement for a financial year',
      'Registration and tax certificates',
      'Foreign Contribution (Regulation) Act certificate',
      'A named policy, in full',
      'A programme or evaluation report',
      'Memorandum of Association and by-laws',
      '80G and 12A approval orders',
    ];
    const DOCS = DOCS_EN.map(d => this._tagMap('raise_doc', d, d));
    const kk = this.state.rzKind || 'safeguard';
    const cur = KINDS.filter(x => x.k === kk)[0] || KINDS[0];
    const picked = this.state.rzDocs || [];
    const detail = (this.state.rzDetail || '').trim();
    const who = (this.state.rzWho || '').trim();

    const subject = subjectLine();
    function subjectLine() {
      if (kk === 'docs' && picked.length === 1) return T.raise_doc_request_prefix + picked[0].toLowerCase();
      return cur.subject;
    }
    const lines = [cur.opener, ''];
    if (picked.length) {
      lines.push(T.raise_docs_requested_label);
      picked.forEach(function (d) { lines.push('  \u2014 ' + d); });
      lines.push('');
    }
    if (detail) { lines.push(detail, ''); }
    else { lines.push('[' + cur.ph + ']', ''); }
    lines.push(T.raise_grateful_line, '');
    lines.push(who ? who : '[' + T.raise_who_placeholder + ']');
    const body = lines.join('\n');
    const mailto = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

    const on = (a) => ({ bg: a ? '#EAAE28' : 'rgba(0,0,0,.22)', fg: a ? '#2a1206' : 'rgba(255,255,255,.85)', ring: a ? '#EAAE28' : 'rgba(255,255,255,.22)' });
    return {
      raiseStep1: T.raise_step1, raiseStep2: T.raise_step2, raiseStep2Note: T.raise_step2_note, raiseStep3: T.raise_step3,
      raiseWhoPlaceholder: T.raise_who_placeholder, raiseSubjectLabel: T.raise_subject_label,
      raiseOpenEmail: T.raise_open_email,
      rzKinds: KINDS.map(x => ({ k: x.k + (kk === x.k ? '-on' : '-off'), label: x.label, on: kk === x.k,
        ...on(kk === x.k), pick: () => this.setState({ rzKind: x.k, rzCopied: false }) })),
      rzDocOpts: DOCS.map((d, i) => {
        const sel = picked.indexOf(d) > -1;
        return { k: 'rd' + i, label: d, on: sel, ...on(sel),
          toggle: () => this.setState(s => {
            const cs = (s.rzDocs || []).slice(), at = cs.indexOf(d);
            if (at > -1) cs.splice(at, 1); else cs.push(d);
            return { rzDocs: cs, rzCopied: false };
          }) };
      }),
      rzPlaceholder: cur.ph,
      rzRouteNote: cur.route,
      rzSubject: subject,
      rzMailto: mailto,
      rzSetDetail: (e) => this.setState({ rzDetail: e.target.value, rzCopied: false }),
      rzSetWho: (e) => this.setState({ rzWho: e.target.value, rzCopied: false }),
      rzCopyLabel: this.state.rzCopied ? T.raise_copied : T.raise_copy,
      rzCopy: () => {
        const txt = 'To: ' + EMAIL + '\nSubject: ' + subject + '\n\n' + body;
        const done = () => this.setState({ rzCopied: true });
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, done);
        else done();
      },
    };
  }

  _govView() {
    const G = (typeof FIN !== 'undefined' && FIN && FIN.GOVERNANCE) ? FIN.GOVERNANCE : null;
    const mode = this.state.govMode === 'up' ? 'up' : 'down';
    const base = {
      govMode: mode,
      flowAnim: 'govDown 2s linear infinite',
      govFlipDir: mode === 'up' ? 'column-reverse' : 'column',
      govSetDown: () => { this._govSnap(); this.setState({ govMode: 'down' }); },
      govSetUp: () => { this._govSnap(); this.setState({ govMode: 'up' }); },
      govClear: () => this.setState({ govSel: null }),
      govDownBg: mode === 'down' ? '#EAAE28' : 'transparent',
      govDownFg: mode === 'down' ? '#1a130b' : 'rgba(251,247,239,.7)',
      govUpBg: mode === 'up' ? '#7FD6E4' : 'transparent',
      govUpFg: mode === 'up' ? '#12232a' : 'rgba(251,247,239,.7)',
      govDownPanelBg: mode === 'down' ? 'rgba(234,174,40,.14)' : 'rgba(251,247,239,.03)',
      govUpPanelBg: mode === 'up' ? 'rgba(14,156,184,.16)' : 'rgba(251,247,239,.03)',
      govModeHint: mode === 'down'
        ? 'Reading downward: what each post may decide, and who it hands work to.'
        : 'Reading upward: the chart turns over. Community Leaders sit at the top, the General Body at the base, and every card names what it must answer for.',
      govRailTop: mode === 'down'
        ? 'What the Strategic Leadership Team approves enters the programmes here.'
        : 'What the programmes report leaves for the Strategic Leadership Team here.',
      govRailBottom: mode === 'down'
        ? 'and reaches the household through the Project Anchors, the Grassroots Anchors and the Community Resource Persons.'
        : 'and begins with what a village says to the Community Resource Persons. Each of these links is drawn as a two-headed arrow: the anchors answer the community as much as the community answers them.',
      govDirect: mode === 'down'
        ? 'One line skips every level in between: the Strategic Leadership Team is joined directly to the community bodies at the base of the chart.'
        : 'The same line carries the community\u2019s account straight back to the Strategic Leadership Team, without passing through the programme structure.',
      govSpine: [], govWings: [], govHasSel: false, govNoSel: true,
      govCommTitle: '', govCommCount: '', govCommBody: '',
      govSelRole: '', govSelTitle: '', govSelCount: '', govSelDown: '', govSelUp: '',
      govSelEdge: '#EAAE28', govSelParent: [], govSelKids: [], govSelHasKids: false,
    };
    if (!G) return base;
    const byId = {};
    G.nodes.forEach(n => { byId[n.id] = n; });
    const sel = this.state.govSel && byId[this.state.govSel] ? this.state.govSel : null;
    const kids = id => G.nodes.filter(n => n.parent === id);
    const chain = {};
    if (sel) {
      let c = byId[sel];
      while (c) { chain[c.id] = true; c = c.parent ? byId[c.parent] : null; }
      kids(sel).forEach(n => { chain[n.id] = true; });
    }
    const deco = n => {
      const edge = this._lift(n.color);
      return {
        id: n.id, title: n.title, count: n.count || '', role: n.role || '', edge,
        line: mode === 'down' ? n.gives : n.owes,
        op: !sel || chain[n.id] ? '1' : '.32',
        glow: sel === n.id ? '0 0 0 2px ' + edge + ', 0 16px 38px rgba(0,0,0,.45)' : 'none',
        wingBg: sel === n.id ? 'rgba(251,247,239,.1)' : 'rgba(251,247,239,.07)',
        members: (n.members || []).map(t => ({ t })),
        hasMembers: !!(n.members && n.members.length),
        pick: () => this.setState(s => ({ govSel: s.govSel === n.id ? null : n.id })),
      };
    };
    const sideOf = { slt: 'adv' };
    base.govSpine = ['gb', 'gov', 'slt', 'core'].filter(id => byId[id]).map((id, i) => ({
      ...deco(byId[id]), notFirst: i > 0,
      side: sideOf[id] && byId[sideOf[id]] ? [deco(byId[sideOf[id]])] : [],
    }));
    const pick = ids => ids.filter(id => byId[id]).map(id => deco(byId[id]));
    const layout = {
      prog_team: { chain: [], leaves: ['a_sol', 'a_re', 'a_cj', 'a_hp', 'fin_team'], tail: ['proj', 'grass'] },
      fin_team: { chain: [], leaves: [], tail: [] },
    };
    base.govWings = G.nodes.filter(n => n.kind === 'wing' && n.parent === 'core').map(w => {
      const L = layout[w.id] || { chain: kids(w.id).map(k => k.id), leaves: [], tail: [] };
      return {
        ...deco(w), chain: pick(L.chain), leaves: pick(L.leaves),
        tail: pick(L.tail), hasLeaves: L.leaves.length > 0,
      };
    });
    if (G.community) {
      base.govCommTitle = G.community.title;
      base.govCommCount = G.community.count;
      base.govCommBody = mode === 'down' ? G.community.down : G.community.up;
    }
    if (sel) {
      const n = byId[sel];
      base.govHasSel = true; base.govNoSel = false;
      base.govSelRole = n.role || ''; base.govSelTitle = n.title;
      base.govSelCount = n.count || ''; base.govSelDown = n.down; base.govSelUp = n.up;
      base.govSelEdge = this._lift(n.color);
      base.govSelParent = n.parent && byId[n.parent] ? [deco(byId[n.parent])] : [];
      base.govSelKids = kids(sel).map(deco);
      base.govSelHasKids = base.govSelKids.length > 0;
    }
    return base;
  }

  // Curated press rail for the home page; full archive lives on the Media page.
  _pressRail(setView) {
    const T = { ...this._dict().en, ...(this._dict()[this.state.lang] || {}) };
    const ALL = window.DEHAT_MEDIA || [];
    const picks = [
      'harpers.org', '101reporters.com', 'risingnepaldaily.com', 'theprint.in',
      'downtoearth.org.in', 'thebetterindia.com', 'plan-international.org',
      'gaonconnection.com/badalta-india/dr-jitendra'
    ];
    const pal = [['rgba(14,85,101,.15)', 'var(--ac-teal,#0E5565)'], ['rgba(210,48,92,.14)', 'var(--ac-crimson,#D2305C)'],
      ['rgba(85,98,35,.16)', 'var(--ac-olive,#556223)'], ['rgba(234,174,40,.20)', 'var(--ac-gold,#9a6f0a)'],
      ['rgba(79,14,115,.13)', 'var(--ac-purple,#4F0E73)'], ['rgba(14,156,184,.15)', 'var(--ac-cyan,#0E9CB8)']];
    const rail = [];
    picks.forEach((p, n) => {
      const it = ALL.find(i => i.u.indexOf(p) > -1);
      if (!it) return;
      const [tint, ink] = pal[n % pal.length];
      rail.push({ k: 'pr' + n, href: it.u, pub: it.pub, y: it.y, title: it.t, meta: it.d + '  ·  ' + this._tagMap('news_scope', it.scope, it.scope), tint, ink });
    });
    return {
      pressRail: rail,
      pressAllLabel: ALL.length ? T.press_all_items.replace('{n}', String(ALL.length)) : T.press_media_archive,
      pressAllSub: T.press_all_sub,
      goMedia: this._go('media', 'archive')
    };
  }

  // Wraps the real renderVals so every {img} carries a ready CSS url() string;
  // keeps url(...) literals out of the template so the bundler can resolve assets.
  renderVals() {
    const seen = new Set();
    // Ink-only artwork (black line, no skin tones) disappears on a dark surface; flip it
    // while preserving its spot colour.
    const INK_ONLY = /sdg-clean-water/;
    const inkFlip = this.state.theme === 'dark' ? 'invert(1) hue-rotate(180deg)' : 'none';
    const walk = (v) => {
      if (!v || typeof v !== 'object' || seen.has(v)) return v;
      seen.add(v);
      if (Array.isArray(v)) { v.forEach(walk); return v; }
      if (typeof v.img === 'string' && !v.imgCss) v.imgCss = 'url(' + v.img + ')';
      if (typeof v.img === 'string' && v.invFilt === undefined) v.invFilt = INK_ONLY.test(v.img) ? inkFlip : 'none';
      Object.keys(v).forEach(k => { const c = v[k]; if (c && typeof c === 'object') walk(c); });
      return v;
    };
    return walk(Object.assign(this._renderValsBase(), this._spineVals(), {
      ck: this._consent(),
      booting: !!this.state.booting,
      bootMark: 'url(./dehat-mark.png)',
    }));
  }

  _renderValsBase() {
    this._ensure();
    const V = this.state.view;
    const D = this._dict();
    const T = { ...D.en, ...(D[this.state.lang] || {}) };
    const dark = this.state.theme === 'dark';
    const cnt = this.state.counts;
    const cv = (id, p, sfx) => cnt[id] != null ? cnt[id] : ((p || '') + '0' + (sfx || ''));
    const allStatsOpen = ['h0', 'h1', 'h2', 'h3'].every(k => !!this.state.statOpen[k]);
    const fork = this.state.caseFork;
    const gridArt = ['sm-ink-crowd', 'sm-ink-pair-ledger', 'sm-ink-family', 'sm-ink-four-walking', 'sm-ink-pair'];
    const gridAllOpen = {}; for (let i = 0; i < 14; i++) gridAllOpen['g' + i] = true;
    const allGridOpen = Object.keys(gridAllOpen).every(k => !!this.state.gridOpen[k]);
    const blCol = (i) => {
      const on = i === this.state.blStop;
      return {
        lab: on ? 'var(--ac-olive)' : 'var(--faint)',
        fg: on ? 'var(--ac-olive)' : 'var(--faint)',
        wt: on ? '800' : '700',
        op: on ? '1' : '.42',
      };
    };
    const setView = (v) => () => this.setState({ view: v, storySlug: null, navOpen: false }, () => { window.scrollTo({ top: 0 }); });
    const toggleNav = () => this.setState({ navOpen: !this.state.navOpen });
    const nav = [
      { key: 'home', label: T.nav_home }, { key: 'who', label: T.nav_who }, { key: 'work', label: T.nav_work },
      { key: 'impact', label: T.nav_impact }, { key: 'stories', label: T.nav_stories },
      { key: 'finance', label: T.nav_finance }, { key: 'media', label: T.nav_media },
      { key: 'answers', label: T.nav_answers }, { key: 'involved', label: T.nav_involved },
    ];
    const navDeco = (key) => {
      const on = (V === key || (key === 'work' && V === 'prog'));
      return { active: on ? 1 : 0, color: on ? 'var(--text)' : 'var(--faint)' };
    };
    const navItems = nav.map(n => Object.assign({ k: n.key, label: n.label, go: setView(n.key) }, navDeco(n.key)));
    const primaryKeys = ['who', 'work', 'impact', 'stories'];
    const moreKeys = ['finance', 'media', 'answers', 'involved'];
    const navPrimary = navItems.filter(n => n.k !== 'home');
    const moreItems = nav.filter(n => moreKeys.indexOf(n.key) > -1).map(n => Object.assign({
      k: n.key, label: n.label,
      go: () => { this.setState({ view: n.key, storySlug: null, navMore: false, navOpen: false }, () => window.scrollTo({ top: 0 })); },
    }, navDeco(n.key)));
    const moreOn = moreKeys.indexOf(V) > -1;

    const programs = this._programs();
    const openProg = (k) => () => this.setState({ view: 'prog', progKey: k, expanded: null, jStage: 0, jTier: 0, jPath: 0, jPair: null, jHor: 0 }, () => { window.scrollTo({ top: 0 }); });
    const artUrl = (a) => 'url(./assets/art/' + a + '.png)';
    const activeProgram = Object.assign({}, programs[this.state.program], {
      artCss: artUrl(programs[this.state.program].art),
      open: openProg(programs[this.state.program].key),
    });
    const programsView = programs.map((p, i) => ({
      ...p, select: () => this.setState({ program: i }),
      bg: this.state.program === i ? 'var(--surface)' : 'rgba(251,247,239,.06)',
      border: this.state.program === i ? 'transparent' : 'rgba(251,247,239,.14)',
      textColor: this.state.program === i ? 'var(--text)' : '#fbf7ef',
      tok: this._tok(p.color),
      tagColor: this.state.program === i ? this._tok(p.color) : 'rgba(251,247,239,.42)',
      railScale: this.state.program === i ? 1 : 0,
      tileScale: this.state.program === i ? 1.08 : 1,
      arrowOp: this.state.program === i ? 1 : 0,
      artCss: artUrl(p.art),
      artOp: this.state.program === i ? 1 : 0.55,
    }));

    const loopSteps = [
      { step: '01', name: 'Behaviour Change', color: '#EAAE28', art: 'behaviour-change',
        body: 'Action begins when individuals and peer groups \u2014 Child Parliaments, Youth Groups \u2014 recognise risks and their own rights. This shift in mindset is the catalyst for collective action.',
        handoff: 'A community that knows its rights starts asking for them \u2192 Demand Generation' },
      { step: '02', name: 'Demand Generation', color: '#D2305C', art: 'demand-generation',
        body: 'Informed communities articulate their needs and engage local governance and public systems, creating the bottom-up pressure necessary for systems to act.',
        handoff: 'Sustained demand gives officials a reason and a mandate to move \u2192 System Strengthening' },
      { step: '03', name: 'System Strengthening', color: '#0E5565', art: 'system-strengthening',
        body: 'DEHAT works alongside public systems to make them accessible and coordinated, so the institutional response becomes proactive rather than reactive.',
        handoff: 'A coordinated system can finally deliver what it was designed to \u2192 Service Delivery' },
      { step: '04', name: 'Service Delivery', color: '#556223', art: 'service-delivery',
        body: 'DEHAT acts as a bridge, providing interim services until demands are met \u2014 ultimately public systems deliver the entitlements that break the cycle.',
        handoff: 'Every entitlement received proves the effort was worth it \u2192 Behaviour Change' },
    ].map((p) => Object.assign({}, p, {
      name: this._tc('method', p.step, 'name', p.name),
      body: this._tc('method', p.step, 'body', p.body),
      handoff: this._tc('method', p.step, 'handoff', p.handoff),
      imgCss: 'url(./assets/art/' + p.art + '.png)', tok: this._tok(p.color), lift: this._lift(p.color),
    }));
    const li = this.state.loop % 4;
    const activeStep = loopSteps[li];
    const stationAt = (idx, gc, gr) => {
      const on = li === idx, s = loopSteps[idx];
      return {
        k: 'st' + idx, isStation: true, isArrow: false, isCentre: false, cls: 'loop-station',
        gc: String(gc), gr: String(gr), step: s.step, name: s.name, color: s.color, tok: s.tok, imgCss: s.imgCss,
        select: () => this.setState({ loop: idx }),
        bg: on ? 'var(--surface)' : 'transparent',
        ring: on ? s.color : 'var(--border)',
        shadow: on ? '0 18px 34px -26px ' + s.color : 'none',
        artOp: on ? 1 : 0.5,
      };
    };
    const arrowAt = (k, gc, gr, glyph, color, delay) => ({
      k, isArrow: true, isStation: false, isCentre: false, cls: 'loop-arrow',
      gc: String(gc), gr: String(gr), glyph, color, delay: delay + 'ms',
    });
    const loopCells = [
      stationAt(0, 1, 1),
      arrowAt('a0', 2, 1, '\u2192', loopSteps[0].tok, 0),
      stationAt(1, 3, 1),
      arrowAt('a1', 3, 2, '\u2193', loopSteps[1].tok, 800),
      { k: 'centre', isCentre: true, isStation: false, isArrow: false, cls: 'loop-centre', gc: '2', gr: '2' },
      stationAt(2, 3, 3),
      arrowAt('a2', 2, 3, '\u2190', loopSteps[2].color, 1600),
      stationAt(3, 1, 3),
      arrowAt('a3', 1, 2, '\u2191', loopSteps[3].tok, 2400),
    ];

    // ---- Our Work: the architecture behind the four programmes ----
    const AR = this._arch();
    const chip = (k) => ({ k, name: AR.P[k].name, color: AR.P[k].color, tok: this._tok(AR.P[k].color), ink: this._ink(AR.P[k].color) });
    const wQi = Math.max(0, Math.min(this.state.wQ, AR.questions.length - 1));
    const wIi = Math.max(0, Math.min(this.state.wI, AR.dims.length - 1));
    const wXk = AR.weave[this.state.wX] ? this.state.wX : 'sol';
    const F = this.state.wF;
    const sdgSrc = (this._px || {}).PROG_SDG || {};
    const wk = {
      questions: AR.questions.map((q, i) => ({
        k: q.key, name: AR.P[q.key].name, color: this._tok(AR.P[q.key].color), artCss: 'url(' + AR.P[q.key].art + ')',
        on: i === wQi, artOp: i === wQi ? 1 : 0.5,
        bg: i === wQi ? 'var(--surface)' : 'transparent',
        ring: i === wQi ? AR.P[q.key].color : 'var(--border)',
        select: () => this.setState({ wQ: i }),
      })),
      qKey: 'q' + wQi,
      qName: AR.P[AR.questions[wQi].key].name,
      qColor: this._tok(AR.P[AR.questions[wQi].key].color),
      qArt: 'url(' + AR.P[AR.questions[wQi].key].art + ')',
      qText: AR.questions[wQi].q,
      qUnder: AR.questions[wQi].u,
      qLine: AR.questions[wQi].line,

      weaveTabs: ['sol', 're', 'hp', 'cj'].map((k) => ({
        k, name: AR.P[k].name, on: k === wXk,
        bg: k === wXk ? AR.P[k].color : 'transparent',
        fg: k === wXk ? this._ink(AR.P[k].color) : 'var(--dim)',
        ring: k === wXk ? AR.P[k].color : 'var(--border)',
        select: () => this.setState({ wX: k }),
      })),
      wxKey: 'wx' + wXk,
      wxName: AR.P[wXk].name,
      wxColor: this._tok(AR.P[wXk].color),
      wxArt: 'url(' + AR.P[wXk].art + ')',
      wxGives: AR.weave[wXk].gives.map((g, i) => Object.assign({ k: 'g' + i, t: g.t }, chip(g.k))),
      wxNeeds: AR.weave[wXk].needs.map((g, i) => Object.assign({ k: 'n' + i, t: g.t }, chip(g.k))),

      dims: AR.dims.map((d, i) => ({
        k: d.k, label: d.label, on: i === wIi,
        color: AR.P[d.prog].color,
        bg: i === wIi ? AR.P[d.prog].color : 'transparent',
        fg: i === wIi ? this._ink(AR.P[d.prog].color) : 'var(--dim)',
        ring: i === wIi ? AR.P[d.prog].color : 'var(--border)',
        select: () => this.setState({ wI: i }),
      })),
      dimKey: 'd' + wIi,
      dimLabel: AR.dims[wIi].full || AR.dims[wIi].label,
      dimColor: this._tok(AR.P[AR.dims[wIi].prog].color),
      dimArt: 'url(' + AR.dims[wIi].art + ')',
      dimCols: [
        { k: 'c1', head: T.wk_dim_become, v: AR.dims[wIi].become },
        { k: 'c2', head: T.wk_dim_claim, v: AR.dims[wIi].claim },
        { k: 'c3', head: T.wk_dim_visible, v: AR.dims[wIi].visible },
      ],

      frameTabs: [
        { k: 'uncrc', label: T.frame_uncrc_label, sub: T.frame_uncrc_sub },
        { k: 'sdg', label: T.frame_sdg_label, sub: T.frame_sdg_sub },
        { k: 'csr', label: T.frame_csr_label, sub: T.frame_csr_sub },
      ].map((t) => ({
        k: t.k, label: t.label, sub: t.sub, on: F === t.k,
        bg: F === t.k ? 'var(--surface)' : 'transparent',
        ring: F === t.k ? 'var(--ac-cyan)' : 'var(--border)',
        fg: F === t.k ? 'var(--text)' : 'var(--dim)',
        select: () => this.setState({ wF: t.k }),
      })),
      isUncrc: F === 'uncrc', isSdg: F === 'sdg', isCsr: F === 'csr',
      uncrc: AR.uncrc.map((u) => ({
        k: u.k, label: u.label, arts: u.arts, body: u.body, artCss: 'url(' + u.art + ')',
        leadName: AR.P[u.lead].name, leadColor: AR.P[u.lead].color, leadInk: this._ink(AR.P[u.lead].color),
        also: u.also.map((a, i) => Object.assign({ k: 'a' + i }, chip(a))),
      })),
      sdgRows: ['sol', 're', 'hp', 'cj'].map((k) => ({
        k, name: AR.P[k].name, color: this._tok(AR.P[k].color),
        goals: ((sdgSrc[k] || {}).goals || []).map((g, i) => ({ k: 'g' + i, n: g.n, name: g.name, img: g.img ? 'url(./' + g.img + ')' : 'none', wash: AR.P[k].color + '1f',
          filt: (g.inv && this.state.theme === 'dark') ? 'invert(1) hue-rotate(180deg)' : 'none' })),
      })),
      csr: AR.csr.map((c, i) => ({
        k: 'c' + i, n: c.n, t: c.t,
        progs: c.progs.map((p, j) => Object.assign({ k: 'p' + j }, chip(p))),
      })),
    };

    const cyc = this._cycle();
    const N = cyc.length;
    const cur = this.state.node;
    const cycleNodes = cyc.map((n, i) => {
      const active = cur === i;
      const a = (-90 + i * 360 / N) * Math.PI / 180, R = 47;
      return {
        ...n, num: i + 1,
        select: () => this.setState({ node: i, paused: true }),
        posX: (50 + R * Math.cos(a)).toFixed(2) + '%',
        posY: (50 + R * Math.sin(a)).toFixed(2) + '%',
        thumbBg: active ? '#ffffff' : 'rgba(251,247,239,.92)',
        ring: active ? '0 0 0 3px #EAAE28, 0 10px 22px rgba(0,0,0,.45)' : '0 2px 8px rgba(0,0,0,.22)',
        scale: active ? 'scale(1.16)' : 'scale(1)',
        opacity: active ? '1' : '.82',
      };
    });
    const activeNode = { ...cyc[cur], num: cur + 1, total: N };
    const ringPlay = this.state.paused ? 'paused' : 'running';
    const wheelLeave = () => this.setState({ paused: false });
    const nextNode = () => this.setState(s => ({ node: (s.node + 1) % N }));
    const prevNode = () => this.setState(s => ({ node: (s.node - 1 + N) % N }));

    const dis = this._districts();
    const districts = dis.map((d, i) => {
      const active = this.state.district === i;
      return {
        ...d, select: () => this.setState({ district: i }),
        dot: active ? '#EAAE28' : (d.state === 'Maharashtra' ? '#8ca03a' : '#f2789d'),
        size: active ? '20px' : '13px',
        anim: active ? 'pulseDot 1.6s infinite' : 'none',
        z: active ? 5 : 1,
      };
    });
    const activeDistrict = dis[this.state.district];

    const stories = this._stories();
    const homeStory = stories[this.state.story % stories.length] || stories[0];
    const activeStory = Object.assign({}, homeStory, {
      title: this._tc('stories', homeStory.slug, 'title', homeStory.title),
      dek: this._tc('stories', homeStory.slug, 'dek', homeStory.dek),
      imgCss: 'url(./assets/story/' + (/^story-\d{3}$/.test(homeStory.art) ? 'web/' : '') + homeStory.art + '.png)',
      open: () => {
        // The deck reads stIdx against the unfiltered list, so clear filters before jumping.
        const all = (typeof window !== 'undefined' && window.STORIES) ? window.STORIES : [];
        let at = 0;
        for (let i = 0; i < all.length; i++) { if (all[i].slug === homeStory.slug) { at = i; break; } }
        this.setState({ view: 'stories', stF: {}, stEntered: true, stIdx: at, stFiltersOpen: false });
        try { window.scrollTo(0, 0); } catch (e) {}
      },
    });
    const storyDots = stories.map((s, i) => ({
      go: () => this.setState({ story: i }),
      w: this.state.story === i ? '30px' : '10px',
      bg: this.state.story === i ? '#fff' : 'rgba(255,255,255,.4)',
    }));

    // ---- Projects explorer ----
    const META = this._progMeta(T);
    const DIMS = this._dims(T);
    const allProjects = this.state.projects || [];
    const uniq = (arr) => Array.from(new Set(arr));
    const portfolioTotal = String(allProjects.length) + ' ' + T.portfolio_count;
    // Sum of FIN.flows('received') across every audited year (FY2005-06 -> FY2024-25),
    // the same reconciliation the Transparency page itself uses. Recompute and update this
    // literal when a new audited year is added to finance-data.js.
    const socialInvestmentTotal = '₹19,75,21,104';
    const projectCount = allProjects.length;

    const PD = this._pd || {};
    const PROGS = PD.PROGRAMMES || [];
    const SDGL = PD.SDG || {}, CSRL = PD.CSR || {}, SDGI = PD.SDG_ICON || {}, RI = PD.RIGHT_ICON || {};
    const progOrder = PROGS.length ? PROGS.map(p => p.key) : ['sol', 're', 'cj', 'hp'];
    const openId = this.state.expanded;
    const programmeBlocks = progOrder.map((prog, pi) => {
      const nar = PROGS.find(p => p.key === prog) || {};
      const color = nar.color || '#0E5565';
      const base = allProjects
        .filter(p => p.prog === prog || (p.cross || []).indexOf(prog) !== -1)
        .slice().sort((a, b) => (a.yearStart || 0) - (b.yearStart || 0) || a.id - b.id);
      const fkey = (d) => this.state.filters[prog + '|' + d] || 'all';
      const filtersUI = DIMS.map(d => {
        const opts = uniq([].concat(...base.map(d.get))).filter(v => v != null && v !== '').sort();
        return {
          key: d.key, label: d.label, value: fkey(d.key),
          onChange: (e) => this._setFilter(prog, d.key, e.target.value),
          options: [{ value: 'all', label: T.filter_all }].concat(opts.map(v => ({ value: v, label: d.disp ? d.disp(v) : v }))),
        };
      });
      const filtered = base.filter(p => DIMS.every(d => {
        const v = fkey(d.key);
        return v === 'all' || d.get(p).indexOf(v) !== -1;
      }));
      const projects = filtered.map(p => {
        const tc = (field, fb) => this._tc('projects', p.id, field, fb);
        const pName = tc('name', p.name), pWhat = tc('what', p.what), pWhy = tc('why', p.why), pHow = tc('how', p.how);
        const pWhere = tc('where', p.where), pSdgNote = tc('sdgNote', p.sdgNote), pCsrNote = tc('csrNote', p.csrNote);
        const pShared = p.shared ? tc('shared', p.shared) : p.shared;
        const pStatus = tc('status', p.status);
        const isCross = p.prog !== prog;
        const homeName = isCross ? this._tagMap('progLabel', (PROGS.find(x => x.key === p.prog) || {}).name || '', (PROGS.find(x => x.key === p.prog) || {}).name || '') : '';
        const chips = []
          .concat((p.sdgs || []).map(k => { const full = this._tagMap('sdg_by_key', k, SDGL[k] || k); return { label: full.split(' \u00b7 ')[1] || full, img: SDGI[k] || '', bg: color + '1f', fg: 'var(--text)' }; }))
          .concat((p.uncrc || []).map(u => ({ label: this._tagMap('uncrc_word', u, u), img: RI[u] || '', bg: 'var(--surface2)', fg: 'var(--dim)' })));
        const invUSD = (() => {
          const raw = p.investmentFigure || '';
          const m2 = raw.match(/[\u20b9\uFFE0]?\s*([\d,]+)\s*$/);
          if (!m2 || !this._pd) return raw || '\u2014';
          const inr = parseInt(m2[1].replace(/,/g, ''), 10);
          if (!inr) return raw;
          const y = p.yearEnd || p.yearStart || 2026;
          const usdVal = this._pd.usd(inr, y);
          return raw + ' \u00b7 ' + this._pd.fmtUSD(usdVal) + ' (' + y + ' rate)';
        })();
        const open = openId === p.id ? {
          color,
          investorLabel: (p.investors || []).length > 1 ? T.d_investors : T.d_investor,
          investors: (p.investors || []).map(v => ({ v })),
          investment: invUSD,
          details: [
            { k: T.d_what, v: pWhat }, { k: T.d_why, v: pWhy },
            { k: T.d_how, v: pHow },
          ],
          hasImpact: !!(p.impact && p.impact.length),
          impactLabel: T.d_impact,
          impact: (p.impact || []).map((x, i) => ({ k: 'im' + i, n: x.n, l: tc('impact_' + i, x.l), src: x.src || '' })),
          hasAnnual: !!(p.annual && p.annual.length),
          annualLabel: T.annual_label,
          annual: (p.annual || []).map((y, i, arr) => ({ label: y.label, notLast: i < arr.length - 1 })),
          tags: [
            { k: T.m_when, v: p.yearLabel + ' \u00b7 ' + pStatus },
            { k: T.m_location, v: pWhere },
            { k: T.m_sdg, v: (p.sdgs || []).map(k => this._tagMap('sdg_by_key', k, SDGL[k] || k)).join('; ') + (pSdgNote ? ' \u2014 ' + pSdgNote : '') || (pSdgNote || '\u2014') },
            { k: T.m_uncrc, v: (p.uncrc || []).map(u => this._tagMap('uncrc_word', u, u)).join(' \u00b7 ') + (p.uncrcArticles ? ' \u2014 ' + p.uncrcArticles : '') },
            { k: T.m_csr, v: (p.csr || []).length ? ((p.csr || []).map(k => this._tagMap('csr_by_key', k, CSRL[k] || k)).join(' ') + (pCsrNote ? ' ' + pCsrNote : '')) : (pCsrNote || '\u2014') },
            { k: T.m_law, v: (p.laws || []).length ? (p.laws || []).join('; ') : T.m_law_none },
          ],
          hasShared: !!p.shared,
          sharedNote: p.shared ? (T.shared_note + ' ' + pShared) : '',
        } : null;
        return {
          id: p.id, name: pName, yearLabel: p.yearLabel, status: pStatus, what: pWhat,
          isCross, crossLabel: isCross ? (T.cross_from + ' ' + homeName) : '',
          actionLabel: openId === p.id ? (T.close_details + ' \u2191') : (T.open_details + ' \u2193'),
          toggle: () => this._toggleProject(p.id),
          ring: openId === p.id ? color : 'var(--border)',
          chips, open,
        };
      });
      const yrs = base.map(p => p.yearStart).filter(Boolean);

      // ---- Programme journey (Human Protection, Climate Justice) ----
      const J = this._deepTr((this._jd || {})[prog] || null, prog, '');
      const S = this.state;
      const fgc = this._tok(color);
      const soft = color + '1c', mid = color + '38';
      let journey = null;
      if (J) {
        const ci = Math.max(0, Math.min(S.jStage, J.cascade.steps.length - 1));
        const ti = Math.max(0, Math.min(S.jTier, J.tiers.rows.length - 1));
        const pi2 = Math.max(0, Math.min(S.jPath, J.toc.paths.length - 1));
        const hi = Math.max(0, Math.min(S.jHor, J.horizons.rows.length - 1));
        const cs = J.cascade.steps[ci], tp = J.toc.paths[pi2], hz = J.horizons.rows[hi];
        journey = {
          eyebrow: J.eyebrow, title: J.title, body: J.body, pull: J.pull,
          chipsLabel: J.chipsLabel, chips: J.chips.map((c, i) => ({ v: c, k: 'c' + i })),
          cascade: {
            num: J.cascade.num, title: J.cascade.title, body: J.cascade.body,
            colA: J.cascade.colA, colB: J.cascade.colB,
            steps: J.cascade.steps.map((s, i) => ({
              k: 's' + i, label: s.label, img: s.img, n: '0' + (i + 1),
              bar: Math.round(18 + (i / (J.cascade.steps.length - 1)) * 82) + '%',
              bg: i === ci ? soft : 'var(--surface)',
              ring: i === ci ? color : 'var(--border)',
              fg: i === ci ? fgc : 'var(--faint)',
              select: () => this.setState({ jStage: i }),
            })),
            curKey: 'cs' + ci, curLabel: cs.label, curDetail: cs.detail, curA: cs.a, curB: cs.b,
          },
          tiers: {
            num: J.tiers.num, title: J.tiers.title, body: J.tiers.body, note: J.tiers.note,
            rows: J.tiers.rows.map((r, i) => ({
              k: 't' + i, label: r.label, w: r.w, note: r.note, on: i === ti,
              hasArt: !!r.art, artCss: r.art ? 'url(./' + r.art + ')' : 'none',
              artOp: i === ti ? 1 : 0.45,
              isLast: i === J.tiers.rows.length - 1 ? 0 : 1,
              bg: i === ti ? soft : 'var(--surface)',
              ring: i === ti ? color : 'var(--border)',
              fg: i === ti ? fgc : 'var(--text)',
              items: r.items.map((v, j) => ({ k: 'i' + j, v, bg: i === ti ? 'var(--bg)' : 'var(--surface2)' })),
              select: () => this.setState({ jTier: i }),
            })),
          },
          toc: {
            num: J.toc.num, title: J.toc.title, body: J.toc.body,
            paths: J.toc.paths.map((p2, i) => ({
              k: 'p' + i, label: p2.label, n: String(i + 1).padStart(2, '0'),
              bg: i === pi2 ? soft : 'transparent',
              ring: i === pi2 ? color : 'var(--border)',
              fg: i === pi2 ? fgc : 'var(--text)',
              select: () => this.setState({ jPath: i }),
            })),
            curKey: 'tp' + pi2, curLabel: tp.label, curDetail: tp.detail,
            cur: J.toc.fields.map((f, i) => ({ k: 'f' + i, kk: f, v: tp.v[i] })),
          },
          pairs: {
            num: J.pairs.num, title: J.pairs.title, body: J.pairs.body,
            colA: J.pairs.colA, colB: J.pairs.colB, colC: J.pairs.colC,
            hasSplit: !!(J.pairs.artA && J.pairs.artB),
            capA: J.pairs.capA || '', capB: J.pairs.capB || '',
            artACss: J.pairs.artA ? 'url(./' + J.pairs.artA + ')' : 'none',
            artBCss: J.pairs.artB ? 'url(./' + J.pairs.artB + ')' : 'none',
            sideAOn: S.jSide !== 'b', sideBOn: S.jSide !== 'a',
            sideABg: S.jSide === 'a' ? soft : 'var(--surface)',
            sideBBg: S.jSide === 'b' ? soft : 'var(--surface)',
            sideARing: S.jSide === 'a' ? color : 'var(--border)',
            sideBRing: S.jSide === 'b' ? color : 'var(--border)',
            sideAOp: S.jSide === 'b' ? 0.3 : 1,
            sideBOp: S.jSide === 'a' ? 0.3 : 1,
            pickA: () => this.setState({ jSide: S.jSide === 'a' ? '' : 'a' }),
            pickB: () => this.setState({ jSide: S.jSide === 'b' ? '' : 'b' }),
            rows: J.pairs.rows.map((r, i) => {
              const open = S.jPair === (prog + i);
              return {
                k: 'r' + i, a: r.a, b: r.b, c: r.c || '', hasC: !!(r.c && open),
                n: String(i + 1).padStart(2, '0'),
                clickable: !!r.c,
                aOp: S.jSide === 'b' ? 0.28 : 1,
                bOp: S.jSide === 'a' ? 0.28 : 1,
                bg: open ? soft : 'var(--surface)',
                ring: open ? color : 'var(--border)',
                toggle: () => this.setState({ jPair: open ? null : (prog + i) }),
              };
            }),
          },
          horizons: {
            num: J.horizons.num, title: J.horizons.title, body: J.horizons.body,
            metaLabel: J.horizons.metaLabel, objLabel: J.horizons.objLabel, itemsLabel: J.horizons.itemsLabel,
            hasCta: !!J.horizons.ctaLabel, ctaLabel: J.horizons.ctaLabel || '', ctaNote: J.horizons.ctaNote || '',
            ctaGo: this._go('involved', null, { pTab: 'give' }),
            railPct: ((hi + 1) / J.horizons.rows.length * 100) + '%',
            tabs: J.horizons.rows.map((r, i) => ({
              k: 'h' + i, label: r.label, n: String(i + 1).padStart(2, '0'),
              done: i <= hi,
              dotBg: i <= hi ? color : 'var(--border)',
              bg: i === hi ? color : 'var(--surface)',
              ring: i === hi ? color : 'var(--border)',
              fg: i === hi ? this._ink(color) : 'var(--dim)',
              select: () => this.setState({ jHor: i }),
            })),
            curKey: 'hz' + hi, curMeta: hz.meta, curObj: hz.obj,
            curItems: hz.items.map((v, j) => ({ k: 'hi' + j, v })),
          },
          close: {
            num: J.close.num, title: J.close.title, body: J.close.body,
            hasArt: !!J.close.art, artCss: J.close.art ? 'url(./' + J.close.art + ')' : 'none',
            chainLabel: J.close.chainLabel || '', hasChain: !!J.close.chainLabel,
            arrows: J.close.arrows.map((a, i) => {
              const stop = J.close.chainStop;
              const beyond = stop == null ? false : i >= stop;
              return {
                k: 'a' + i, from: a.from, to: a.to, n: String(i + 1).padStart(2, '0'),
                isStop: i === stop - 1 && !!J.close.chainLabel,
                bg: beyond ? soft : 'var(--surface)',
                ring: beyond ? color : 'var(--border)',
                numFg: beyond ? fgc : 'var(--faint)',
                connector: i === J.close.arrows.length - 1 ? 0 : 1,
              };
            }),
          },
        };
      }

      // ---- SDG highlights + this programme's segment of the vulnerability cycle ----
      const PX = this._px || {};
      const SG = (PX.PROG_SDG || {})[prog] || null;
      const CX = (PX.PROG_CYCLE || {})[prog] || null;
      const PFIG = (PX.PROG_FIGURES || {})[prog] || null;
      const sdgs = SG ? SG.goals.map((g, i) => ({
        k: 'g' + i, n: g.n, name: this._tagMap('sdg_name', g.name, g.name), how: this._tc('prog_sdg', prog + '_' + i, 'how', g.how), img: g.img || '',
        hasImg: !!g.img, noImg: !g.img, delay: (i * 70) + 'ms',
        filt: (g.inv && this.state.theme === 'dark') ? 'invert(1) hue-rotate(180deg)' : 'none',
      })) : [];
      let pcyc = null;
      if (CX) {
        const seq = this._cycle().filter(n => CX.direct[n.short] || (CX.indirect || []).indexOf(n.short) >= 0);
        const nn = seq.length;
        let si;
        if (typeof S.pcSel === 'string' && S.pcSel.indexOf(prog + ':') === 0) si = parseInt(S.pcSel.slice(prog.length + 1), 10) || 0;
        else { const fi = seq.findIndex(n => CX.direct[n.short]); si = fi < 0 ? 0 : fi; }
        si = Math.max(0, Math.min(si, nn - 1));
        const cn0 = seq[si], isD0 = !!CX.direct[cn0.short];
        pcyc = {
          lede: this._tc('prog_cycle', prog, 'lede', CX.lede),
          directCount: T.cyc_direct_count_tpl.replace('{n}', String(seq.filter(n => CX.direct[n.short]).length)),
          nodes: seq.map((n, i) => {
            const on = i === si, d = !!CX.direct[n.short];
            return {
              k: 'pn' + i, short: n.short, shortLabel: n.shortLabel, img: n.img,
              dy: Math.round(-Math.sin(((i + 1) / (nn + 1)) * Math.PI) * 26) + 'px',
              delay: (i * 60) + 'ms',
              filt: d ? 'none' : 'grayscale(1) opacity(.5)',
              bg: on ? color : (d ? 'var(--surface)' : 'transparent'),
              ring: on ? color : (d ? color + '77' : 'var(--border)'),
              fg: on ? fgc : (d ? 'var(--text)' : 'var(--faint)'),
              select: () => this.setState({ pcSel: prog + ':' + i }),
            };
          }),
          curKey: 'pk' + si, chapter: cn0.chapter, stat: cn0.stat, title: cn0.title,
          story: cn0.story, src: cn0.src, img: cn0.img,
          roleLabel: isD0 ? T.cyc_addressed_directly : T.cyc_affected_indirectly,
          roleColor: isD0 ? fgc : 'var(--faint)',
          act: isD0 ? this._tc('prog_cycle', prog + '_direct_' + cn0.short, 'text', CX.direct[cn0.short]) : T.cyc_indirect_note,
        };
      }

      return {
        hasSdg: sdgs.length > 0, sdgs, sdgLabel: SG ? T.sdg_goals_label : '',
        hasFigs: !!(PFIG && PFIG.items && PFIG.items.length),
        figsLabel: PFIG ? T.prog_figs_label : '', figsNote: PFIG ? this._tc('prog_figures', prog, 'note', PFIG.note) : '',
        figs: PFIG ? PFIG.items.map((f, i) => ({ k: 'pf' + i, n: f.n, l: this._tc('prog_figures', prog + '_' + i, 'l', f.l), src: f.src })) : [],
        hasCyc: !!pcyc, cyc: pcyc || {},
        hasJourney: !!journey, j: journey || {}, soft, mid, fgc,
        support: this._support(nar.name || 'DEHAT').map((s, i) => ({ ...s, k2: 'sp' + i, hasA: !!s.a, fg: this._tok(s.col) })),
        ctas: [
          { title: T.pcta_invest_title, body: T.pcta_invest_body, action: T.pcta_invest_action, bg: '#D2305C', fg: '#fff', art: 'invest', go: this._go('involved', null, { pTab: 'give' }) },
          { title: T.pcta_time_title, body: T.pcta_time_body, action: T.pcta_time_action, bg: '#EAAE28', fg: '#1f1710', art: 'volunteer', go: this._go('involved', null, { pTab: 'route' }) },
          { title: T.pcta_partner_title, body: T.pcta_partner_body, action: T.pcta_partner_action, bg: '#0E5565', fg: '#fff', art: 'partner', go: this._go('involved', null, { pTab: 'people' }) },
        ].map((c, i) => Object.assign({}, c, { k: 'pc' + i, imgCss: 'url(./assets/art/' + c.art + '.png)', delay: (i * 110) + 'ms' })),
        supportNote: base.length
          ? T.support_note_tpl.replace('{n}', String(base.length))
          : '',
        key: prog, name: nar.name, nameLabel: this._tc('programmes', prog, 'name', nar.name), color, tok: fgc, ink: this._ink(color),
        tag: this._tc('programmes', prog, 'tag', nar.tag),
        ink9: this._inkA(color, .9), ink75: this._inkA(color, .75), ink6: this._inkA(color, .6), ink55: this._inkA(color, .55),
        inkFill: this._inkA(color, .14), inkRing: this._inkA(color, .3), inkFillHi: this._inkA(color, .24),
        artCss: 'url(./assets/art/' + (function (nm) {
          const s = String(nm || '').toLowerCase();
          if (/leadership|movement/.test(s)) return 'prog-sol';
          if (/climate|farm|agri|soil/.test(s)) return 'prog-cj';
          if (/protection|traffick|safety/.test(s)) return 'prog-hp';
          if (/right|entitle/.test(s)) return 'prog-re';
          return 'prog-sol';
        })(nar.name) + '.png)',
        era: this._tc('programmes', prog, 'era', nar.era || ''), lede: this._tc('programmes', prog, 'lede', nar.lede || ''), headline: this._tc('programmes', prog, 'headline', nar.headline || ''),
        stance: this._tc('programmes', prog, 'purpose', nar.purpose || ''),
        problemTitle: this._tc('programmes', prog, 'whyTitle', nar.whyTitle || ''), problemBody: this._tc('programmes', prog, 'why', nar.why || ''),
        problemPoints: (nar.whyPoints || []).map((x, i) => ({ img: x.img, label: this._tc('programmes', prog, 'whyPoint_' + i, x.label) })),
        approachTitle: this._tc('programmes', prog, 'howTitle', nar.howTitle || ''), approachBody: this._tc('programmes', prog, 'how', nar.how || ''),
        layers: (nar.layers || []).map((x, i) => ({ k: this._tc('programmes', prog, 'layer_' + i + '_k', x.k), v: this._tc('programmes', prog, 'layer_' + i + '_v', x.v) })),
        belief: this._tc('programmes', prog, 'promise', nar.promise || ''), ahead: nar.headline || '',
        chronoTitle: T.chrono_title, countLabel: T.count_label, openLabel: T.open_programme,
        span: yrs.length ? (Math.min.apply(null, yrs) + ' \u2013 ' + Math.max.apply(null, yrs)) : '\u2014',
        count: filtered.length, total: base.length,
        filters: filtersUI, projects,
        fOpen: !!this.state.wFOpen,
        fH: this.state.wFOpen ? '900px' : '0px',
        fOp: this.state.wFOpen ? 1 : 0,
        fPad: this.state.wFOpen ? '20px 0 26px' : '0px',
        fCaret: this.state.wFOpen ? '\u25B2' : '\u25BC',
        fCount: DIMS.filter(x => fkey(x.key) !== 'all').length,
        fLabel: (() => { const n = DIMS.filter(x => fkey(x.key) !== 'all').length; return n ? ' \u00b7 ' + n : ''; })(),
        fBtnLabel: (() => { const n = DIMS.filter(x => fkey(x.key) !== 'all').length;
          return T.narrow_tpl.replace('{n}', base.length) + (n ? ' \u00b7 ' + n : ''); })(),
        fAny: DIMS.some(x => fkey(x.key) !== 'all'),
        fToggle: () => this.setState(s => ({ wFOpen: !s.wFOpen })),
        fClear: () => this.setState(s => { const f = { ...s.filters }; DIMS.forEach(x => delete f[prog + '|' + x.key]); return { filters: f, expanded: null }; }),
        fRing: (this.state.wFOpen || DIMS.some(x => fkey(x.key) !== 'all')) ? color : 'var(--border)',
        fBg: DIMS.some(x => fkey(x.key) !== 'all') ? this._inkA(color, .14) : 'transparent',
        go: () => this.setState({ view: 'prog', progKey: prog, expanded: null, jStage: 0, jTier: 0, jPath: 0, jPair: null, jHor: 0 }, () => { window.scrollTo({ top: 0 }); }),
        back: setView('work'),
      };
    });
    const programmeIndex = programmeBlocks;
    const pp = programmeBlocks.find(b => b.key === this.state.progKey) || programmeBlocks[0] || null;

    // ---- Finance / transparency ----
    const FIN = (typeof window !== 'undefined' && window.FIN) ? window.FIN : null;
    const finCurrSel = this.state.finCurr === 'USD' ? 'USD' : 'INR';
    // Converts a raw INR amount to the selected display currency using THAT amount's own
    // fiscal year's rate \u2014 done once, here, at the point each raw figure is first read out of
    // FIN. Every downstream sum/format call sees an already-correctly-converted number, so a
    // 20-year total in USD is a sum of each year's own rate, not one year's rate applied to all.
    const toDisp = (inr, year) => (finCurrSel === 'USD' && this._pd) ? this._pd.usd(inr, parseInt(year, 10)) : inr;
    const fmtRs = (n) => {
      if (n == null) return '\u2014';
      const a = Math.abs(n); const sg = n < 0 ? '\u2212' : '';
      if (finCurrSel === 'USD') {
        if (!this._pd) return '\u2014';
        return sg + this._pd.fmtUSD(a);
      }
      if (a >= 1e7) return sg + '\u20b9' + (a / 1e7).toFixed(2) + ' Cr'; if (a >= 1e5) return sg + '\u20b9' + (a / 1e5).toFixed(1) + ' L'; return sg + '\u20b9' + Math.round(a).toLocaleString('en-IN');
    };
    const TYPE_LABEL = { un:'UN / multilateral', govt:'Government', csr:'Corporate Social Responsibility', philanthropy:'Philanthropy', foreign_org:'Foreign org', indian_inst:'Indian institution', individual:'Individuals' };
    const finRaw = FIN ? FIN.YEARS.map(y => {
      const recSum = (y.received || []).reduce((t, r) => t + (r.grant || 0) + (r.interest || 0), 0);
      const utilSum = (y.spend || []).reduce((t, r) => t + (r.total || 0), 0);
      const rec = (y.receivedTotal != null) ? y.receivedTotal : recSum;
      const util = (y.utilisedTotal != null) ? y.utilisedTotal : utilSum;
      const fcra = (y.received || []).filter(r => r.regime === 'FCRA').reduce((t, r) => t + (r.grant || 0) + (r.interest || 0), 0);
      const pending = rec === 0 && util === 0;
      return { y, rec: toDisp(rec, y.fy), util: toDisp(util, y.fy), fcra: toDisp(fcra, y.fy), inr: toDisp(Math.max(0, rec - fcra), y.fy), pending };
    }) : [];
    const finMaxRec = Math.max(1, ...finRaw.map(f => f.rec));
    const finMaxFlow = Math.max(1, ...finRaw.map(f => Math.max(f.rec, f.util)));
    const flowsCurr = (basis) => (FIN ? FIN.flows(basis) : []).map(f => ({ ...f, amt: toDisp(f.amt, f.fy) }));
    const finReceivedFlows = flowsCurr('received');
    const finTotalRec = finReceivedFlows.reduce((t, f) => t + f.amt, 0);
    const finTotalFcra = finReceivedFlows.filter(f => f.regime === 'FCRA').reduce((t, f) => t + f.amt, 0);
    const finFy = Math.min(this.state.finYear, Math.max(0, finRaw.length - 1));
    const fnName = (id) => (FIN && FIN.displayName) ? FIN.displayName(id) : (id || '\u2014');
    const finYearRows = finRaw.map((f, i) => ({
      fy: 'FY' + f.y.fy, k: f.y.fy + (i === finFy ? '-on' : '-off'), auditor: (f.y.auditor || '\u2014').split('(')[0].trim(),
      received: fmtRs(f.rec), utilised: fmtRs(f.util),
      recW: (f.rec / finMaxFlow * 100).toFixed(1) + '%', utilW: (f.util / finMaxFlow * 100).toFixed(1) + '%',
      pending: f.pending, showBars: !f.pending,
      badge: f.y.compiled ? T.fin_compiled : (f.y.partial ? T.fin_partial : ''),
      select: () => this.setState({ finYear: i }),
      bg: i === finFy ? 'var(--surface)' : 'var(--surface2)',
      ring: i === finFy ? '#EAAE28' : 'var(--border)',
      fyColor: i === finFy ? '#EAAE28' : 'var(--text)',
    }));
    const aF = finRaw[finFy] || null;
    const activeFinYear = aF ? {
      fy: 'FY' + aF.y.fy, period: aF.y.period || '', auditor: aF.y.auditor || '\u2014',
      received: fmtRs(aF.rec), utilised: fmtRs(aF.util), fcra: fmtRs(aF.fcra), inr: fmtRs(aF.inr),
      bs: aF.y.balanceSheetTotal != null ? fmtRs(toDisp(aF.y.balanceSheetTotal, aF.y.fy)) : '\u2014',
      hasSurplus: aF.y.surplus != null,
      surplusLabel: aF.y.surplus != null ? (aF.y.surplus >= 0 ? T.fin_surplus : T.fin_deficit) : '',
      surplusVal: aF.y.surplus != null ? fmtRs(toDisp(Math.abs(aF.y.surplus), aF.y.fy)) : '',
      surplusColor: (aF.y.surplus != null && aF.y.surplus < 0) ? 'var(--ac-red)' : 'var(--ac-olive)',
      note: aF.y.note || '',
      funders: (aF.y.received || []).map(r => {
        const amt = toDisp((r.grant || 0) + (r.interest || 0), aF.y.fy);
        return {
          name: fnName(r.funder) + ((FIN && FIN.publicLabel(r)) ? (' \u00b7 ' + FIN.publicLabel(r)) : ''),
          amount: fmtRs(amt), _v: amt,
          regime: r.regime === 'FCRA' ? T.fin_regime_fcra : (r.regime === 'INR' ? T.fin_regime_inr : (r.regime || '')),
          regimeColor: r.regime === 'FCRA' ? 'var(--ac-teal)' : 'var(--ac-olive)',
          w: (amt / Math.max(1, aF.rec) * 100).toFixed(1) + '%',
          note: r.note || '',
        };
      }).filter(x => x._v > 0).sort((a, b) => b._v - a._v),
    } : null;
    const funderTotals = {};
    finRaw.forEach(f => (f.y.received || []).forEach(r => { if (!r.funder || String(r.funder).indexOf('__') === 0) return; funderTotals[r.funder] = (funderTotals[r.funder] || 0) + toDisp((r.grant || 0) + (r.interest || 0), f.y.fy); }));
    const finFunderList = Object.keys(funderTotals).filter(k => funderTotals[k] > 0 && FIN && FIN.FUNDERS[k]).map(k => ({ name: FIN.FUNDERS[k].name, type: TYPE_LABEL[FIN.FUNDERS[k].type] || FIN.FUNDERS[k].type, regime: FIN.FUNDERS[k].regime, regimeColor: FIN.FUNDERS[k].regime === 'FCRA' ? '#0E5565' : '#556223', total: fmtRs(funderTotals[k]), _v: funderTotals[k] })).sort((a, b) => b._v - a._v).slice(0, 15);

    // Per-funder recorded totals, surfaced on the partner cards under Get Involved →
    // Who we work with (the single home for funder identity; Transparency keeps the ledger).
    this._funderFacts = {};
    const claimed = {};
    Object.keys(funderTotals).forEach(k => {
      const F = FIN && FIN.FUNDERS[k]; if (!F || !(funderTotals[k] > 0)) return;
      const facts = { total: fmtRs(funderTotals[k]), regime: F.regime,
        regimeColor: F.regime === 'FCRA' ? '#0E5565' : '#556223' };
      [F.name].concat(F.aliases || []).forEach(n => {
        const key = this._funderKey(n); if (!key) return;
        if (claimed[key] && claimed[key] !== k) { delete this._funderFacts[key]; return; }
        claimed[key] = k; this._funderFacts[key] = facts;
      });
    });

    const clip = (s, n) => { s = String(s || ''); if (s.length <= n) return s; const cut = s.slice(0, n); const sp = cut.lastIndexOf(' '); return (sp > n * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,;:\u2014-]+$/, '') + '\u2026'; };
    // ---- Transparency explorer -------------------------------------------------
    const lens = this.state.finLens || 'prog';
    const basisSel = this.state.finBasis || 'received';
    const effBasis = lens === 'admin' ? 'utilised' : basisSel;
    const fyAll = FIN ? FIN.YEARS.map(y => y.fy).slice().sort() : [];
    const fyFrom = (this.state.finFrom && fyAll.indexOf(this.state.finFrom) >= 0) ? this.state.finFrom : (fyAll[0] || '');
    const fyTo0 = (this.state.finTo && fyAll.indexOf(this.state.finTo) >= 0) ? this.state.finTo : (fyAll[fyAll.length - 1] || '');
    const fyTo = fyTo0 < fyFrom ? fyFrom : fyTo0;
    let rangeFlows = flowsCurr(effBasis).filter(f => f.fy >= fyFrom && f.fy <= fyTo);
    if (lens === 'admin') {
      const ex = [];
      rangeFlows.forEach(f => {
        if (f.admin != null && f.admin > 0 && f.amt >= f.admin) { ex.push({ ...f, amt: f.admin, _seg: 'admin' }); if (f.amt > f.admin) ex.push({ ...f, amt: f.amt - f.admin, _seg: 'prog' }); }
        else if (f.admin === 0 && f.adminChecked) { ex.push({ ...f, _seg: 'prog' }); }
        else ex.push({ ...f, _seg: 'mixed' });
      });
      rangeFlows = ex;
    }
    const segKeyOf = (f) => lens === 'prog' ? f.prog : lens === 'admin' ? f._seg : lens === 'regime' ? f.regime : lens === 'source' ? f.source : lens === 'uncrc' ? f.uncrc : lens === 'era' ? f.era : f.csr;
    const segMeta = (k) => {
      if (!FIN) return { label: k, color: '#8a8378', desc: '' };
      if (lens === 'prog') { const p = FIN.PROGRAMMES[k] || {}; return { label: this._tagMap('progLabel', p.label || k, p.label || k), color: p.color || '#8a8378', desc: k === 'cross' ? T.fin_desc_cross : (T.fin_desc_prog_opened + ' ' + (p.since || '')) }; }
      if (lens === 'admin') { const M = { admin: { label: T.fin_admin_label, color: '#D2305C', desc: T.fin_admin_desc }, prog: { label: T.fin_prog_delivery_label, color: '#556223', desc: T.fin_prog_delivery_desc }, mixed: { label: T.fin_not_itemised_label, color: '#8a8378', desc: T.fin_not_itemised_desc } }; return M[k] || { label: k, color: '#8a8378', desc: '' }; }
      if (lens === 'regime') return k === 'FCRA' ? { label: T.fin_fcra_label, color: '#0E5565', desc: T.fin_fcra_desc, ref: 'Foreign Contribution (Regulation) Act, 2010' } : { label: T.fin_domestic_inr_label, color: '#556223', desc: T.fin_domestic_desc };
      if (lens === 'source') { const s = FIN.SOURCES[k] || {}; return { label: this._tagMap('fin_source_label', k, s.label || k), color: s.color || '#8a8378', desc: this._tagMap('fin_source_note', k, s.note || '') }; }
      if (lens === 'uncrc') { const u = FIN.UNCRC[k] || {}; return { label: this._tagMap('uncrc_word', k, u.label || k), color: u.color || '#8a8378', desc: this._tagMap('fin_uncrc_note', k, u.note || ''), ref: 'United Nations Convention on the Rights of the Child, 1989' }; }
      if (lens === 'era') { const e = FIN.ERAS[k] || {}; return { label: this._tagMap('fin_era_label', k, e.label || k), color: e.color || '#8a8378', desc: T.fin_desc_fy_falling_in + ' ' + (e.span || '') + '.' }; }
      const c = FIN.CSR7[k] || {}; return { label: this._tagMap('fin_csr7_short', k, c.short || k), color: c.color || '#8a8378', desc: this._tagMap('fin_csr7_text', k, c.text || ''), ref: c.ref ? (c.ref + ' to the Companies Act, 2013') : '' };
    };
    const segAgg = {};
    rangeFlows.forEach(f => { const k = segKeyOf(f) || 'none'; (segAgg[k] = segAgg[k] || { k, amt: 0, n: 0 }); segAgg[k].amt += f.amt; segAgg[k].n += 1; });
    const segOrder = Object.keys(segAgg).sort((a, b) => (a === 'cross') - (b === 'cross') || segAgg[b].amt - segAgg[a].amt);
    const rangeTotal = rangeFlows.reduce((t, f) => t + f.amt, 0) || 1;
    const pick = this.state.finPick || '';
    const viewFlows = pick ? rangeFlows.filter(f => f.fy === pick) : rangeFlows;
    const viewTotal = viewFlows.reduce((t, f) => t + f.amt, 0) || 1;
    const segView = {};
    const segViewCount = {};
    viewFlows.forEach(f => { const k = segKeyOf(f) || 'none'; (segView[k] = segView[k] || 0); segView[k] += f.amt; segViewCount[k] = (segViewCount[k] || 0) + 1; });
    const activeSegKey = (this.state.finSeg && segOrder.indexOf(this.state.finSeg) >= 0) ? this.state.finSeg : '';
    const finBreakdown = segOrder.map(k => {
      const m = segMeta(k); const amt = segView[k] || 0; const n = segViewCount[k] || 0;
      return { key: k, k: k + (activeSegKey === k ? '-on' : '-off'), label: m.label, color: m.color, amount: fmtRs(amt), pct: (amt / viewTotal * 100).toFixed(1) + '%', w: Math.max(0, amt / viewTotal * 100).toFixed(1) + '%', lines: n + ' ' + (n === 1 ? T.fin_line_word : T.fin_lines_word),
        bg: activeSegKey === k ? 'var(--surface)' : 'transparent', ring: activeSegKey === k ? m.color : 'var(--border)',
        select: () => this.setState(s => ({ finSeg: s.finSeg === k ? '' : k })) };
    }).filter(r => parseFloat(r.pct) > 0 || !pick);
    const aSeg = activeSegKey ? segMeta(activeSegKey) : null;
    const detailFlows = (activeSegKey ? viewFlows.filter(f => (segKeyOf(f) || 'none') === activeSegKey) : viewFlows).slice().sort((a, b) => b.amt - a.amt);
    const finSegDetail = aSeg ? {
      label: aSeg.label, color: this._tok(aSeg.color), desc: aSeg.desc, ref: aSeg.ref || '',
      hasRef: !!aSeg.ref,
      amount: fmtRs(segView[activeSegKey] || 0),
      share: ((segView[activeSegKey] || 0) / viewTotal * 100).toFixed(1) + '%',
      clear: () => this.setState({ finSeg: '' }),
    } : null;
    // A chip only reads as an exception marker while it is exceptional. "Mapping under confirmation"
    // now covers only funders without a settled classification — the five named in the disclosure
    // register (re-reading their signed agreements) plus any genuinely unmapped funder — so it stays
    // rare by construction. So weight each chip by how prevalent it is in the lines actually in view
    // — prevalent disclosures stay quiet, rare ones are drawn to be noticed. No disclosure is
    // dropped either way; only its weight changes.
    const shownFlows = detailFlows.slice(0, 40);
    const flagOf = (f) => f.est ? 'est' : (f.inKind ? 'inKind' : (!f.confirm ? 'confirm' : ''));
    const flagTally = {};
    shownFlows.forEach(f => { const k = flagOf(f); if (k) flagTally[k] = (flagTally[k] || 0) + 1; });
    const chipped = Object.values(flagTally).reduce((x, y) => x + y, 0);
    // Needs a floor as well as a share: one flagged line in view is 100% of the chips but is the
    // most exceptional case there is, not the least.
    const prevalent = (k) => chipped >= 4 && (flagTally[k] || 0) / chipped >= 0.5;
    const CHIP = { est: 'var(--ac-gold)', inKind: 'var(--ac-olive)' };
    const finLines = shownFlows.map((f, i) => {
      const fk = flagOf(f);
      const loud = !!CHIP[fk] && !prevalent(fk);
      const linkPid = this._projectIdForFlow(f);
      return {
      id: f.fy + '-' + i, fy: 'FY' + f.fy, funder: f.funder, project: clip(f.project, 90),
      amount: fmtRs(f.amt), regime: f.regime === 'FCRA' ? T.fin_foreign_contribution : T.fin_domestic,
      regimeColor: f.regime === 'FCRA' ? 'var(--ac-teal)' : 'var(--ac-olive)',
      flag: f.est ? T.fin_apportioned : (f.inKind ? T.fin_in_kind : (!f.confirm ? T.fin_mapping_unconfirmed : '')),
      hasFlag: !!fk,
      flagBg: loud ? 'transparent' : 'var(--surface2)',
      flagRing: loud ? CHIP[fk] : 'transparent',
      flagFg: loud ? CHIP[fk] : 'var(--faint)',
      dot: segMeta(segKeyOf(f) || 'none').color,
      hasLink: linkPid != null,
      noLink: linkPid == null,
      goToProject: linkPid != null ? () => this._openProjectLink(linkPid) : null,
      };
    });
    const finLinesMore = detailFlows.length > 40 ? (detailFlows.length - 40) + ' further lines not shown' : '';
    const chartMax = Math.max(1, ...fyAll.filter(fy => fy >= fyFrom && fy <= fyTo).map(fy => rangeFlows.filter(f => f.fy === fy).reduce((t, f) => t + f.amt, 0)));
    const finChart = fyAll.filter(fy => fy >= fyFrom && fy <= fyTo).map(fy => {
      const ff = rangeFlows.filter(f => f.fy === fy);
      const tot = ff.reduce((t, f) => t + f.amt, 0);
      const on = !pick || pick === fy;
      return {
        fy, k: fy + (pick === fy ? '-on' : '-off') + (activeSegKey || ''), lab: "'" + fy.slice(2, 4), tip: 'FY' + fy + ' \u2014 ' + fmtRs(tot),
        h: (Math.max(0, tot) / chartMax * 100).toFixed(1) + '%', op: on ? '1' : '.3',
        labColor: pick === fy ? '#EAAE28' : 'var(--faint)',
        segs: segOrder.map(k => { const v = Math.max(0, ff.filter(f => (segKeyOf(f) || 'none') === k).reduce((t, f) => t + f.amt, 0)); return { h: tot > 0 ? (v / tot * 100).toFixed(2) + '%' : '0%', color: segMeta(k).color, dim: (activeSegKey && activeSegKey !== k) ? '.25' : '1' }; }).filter(s => s.h !== '0%' && s.h !== '0.00%'),
        select: () => this.setState(s => ({ finPick: s.finPick === fy ? '' : fy })),
      };
    });
    const estShare = rangeFlows.filter(f => f.est).reduce((t, f) => t + Math.abs(f.amt), 0) / rangeTotal * 100;
    const finExplorerStats = [
      { label: effBasis === 'received' ? T.fin_received_in_years : T.fin_utilised_in_years, value: fmtRs(pick ? viewTotal : rangeTotal) },
      { label: T.fin_years_in_view, value: pick ? ('FY' + pick) : (fyAll.filter(fy => fy >= fyFrom && fy <= fyTo).length + ' ' + T.word_years) },
      { label: T.fin_lines_classified, value: String(viewFlows.length) },
      // Placeholder/"not itemised" flows aren't real investment partners — excluded so this
      // count reflects actual named funders, not synthetic reconciliation placeholders.
      { label: T.fin_partners_in_view, value: String(new Set(viewFlows.filter(f2 => !f2.unmapped).map(f2 => f2.funder)).size) },
    ];
    const finLensTabs = [
      { key: 'prog', label: T.fin_lens_programme }, { key: 'admin', label: T.fin_lens_admin },
      { key: 'regime', label: T.fin_lens_regime }, { key: 'source', label: T.fin_lens_source },
      { key: 'uncrc', label: T.fin_lens_uncrc }, { key: 'era', label: T.fin_lens_era },
      { key: 'csr', label: T.fin_lens_csr },
    ].map(t => ({ ...t, k: t.key + (lens === t.key ? '-on' : '-off'), bg: lens === t.key ? '#0E5565' : 'var(--surface2)', fg: lens === t.key ? '#fff' : 'var(--dim)', ring: lens === t.key ? '#0E5565' : 'var(--border)', select: () => this.setState({ finLens: t.key, finSeg: '' }) }));
    const finBasisTabs = [
      { key: 'received', label: T.fin_lens_received }, { key: 'utilised', label: T.fin_lens_utilised },
    ].map(t => ({ ...t, k: t.key + (effBasis === t.key ? '-on' : '-off'), bg: effBasis === t.key ? '#EAAE28' : 'transparent', fg: effBasis === t.key ? '#1f1710' : 'var(--dim)', select: () => this.setState({ finBasis: t.key, finLens: (t.key === 'received' && lens === 'admin') ? 'prog' : lens }) }));
    const finCurrTabs = [
      { key: 'INR', label: '₹ INR' }, { key: 'USD', label: '$ USD' },
    ].map(t => ({ ...t, k: 'fc-' + t.key + (finCurrSel === t.key ? '-on' : '-off'), bg: finCurrSel === t.key ? '#EAAE28' : 'transparent', fg: finCurrSel === t.key ? '#1f1710' : 'var(--dim)', select: () => this.setState({ finCurr: t.key }) }));
    const setRange = (a, b) => () => this.setState({ finFrom: a, finTo: b, finPick: '' });
    const lastFive = fyAll.slice(-5)[0] || fyAll[0];
    const finRangePresets = [
      { label: T.fin_all_twenty_years, a: fyAll[0], b: fyAll[fyAll.length - 1] },
      { label: T.fin_last_five_years, a: lastFive, b: fyAll[fyAll.length - 1] },
      { label: T.fin_mdg_era, a: fyAll[0], b: '2015-16' },
      { label: T.sdg_era_label, a: '2016-17', b: fyAll[fyAll.length - 1] },
    ].map(p => ({ label: p.label, k: p.label + ((fyFrom === p.a && fyTo === p.b) ? '-on' : '-off'), on: fyFrom === p.a && fyTo === p.b, bg: (fyFrom === p.a && fyTo === p.b) ? 'var(--surface)' : 'transparent', ring: (fyFrom === p.a && fyTo === p.b) ? '#EAAE28' : 'var(--border)', select: setRange(p.a, p.b) }));
    const finYearOpts = fyAll.map(fy => ({ v: fy, label: 'FY' + fy }));
    const csr7PreLaw = lens === 'csr' && fyFrom < '2014-15'
      ? (' ' + T.fin_csr7_pre_law)
      : '';
    const finBasisNote = (lens === 'admin'
      ? T.fin_basis_note_admin
      : (effBasis === 'received' ? T.fin_basis_note_received : T.fin_basis_note_utilised)
    ) + csr7PreLaw;

    const langs = this._langs();
    const awardsAll = this._awardArt([
      { year: '2009', to: 'Organisation', aud: 'org', color: '#4F0E73', name: 'Manjunath Shanmugam National Integrity Award', body: 'Given for integrity, commitment and work against corruption, in memory of the Indian Oil officer killed while acting against fuel adulteration.' },
      { year: '2010', to: 'Organisation', aud: 'org', color: '#A92719', name: 'India NGO Award — NGO of the Year', body: 'One of four organisations in the country recognised by The Resource Alliance for standards of resource mobilisation, accountability and transparency.' },
      { year: '2011', to: 'Organisation', aud: 'org', color: '#0E5565', name: 'Global NGO Awards — international shortlist', body: 'Shortlisted among five organisations worldwide, drawn from the national winners of the Resource Alliance (UK) NGO Awards.' },
      { year: '2012', to: 'Founder', aud: 'founder', color: '#D2305C', name: 'SONY CID Social Bravery Award', body: 'Awarded to Dr Jitendra Chaturvedi for work with communities who held no effective access to their constitutional rights before the intervention.' },
      { year: '2014', to: 'Organisation', aud: 'org', color: '#EAAE28', name: 'Dasra Girl Power Award — finalist', body: 'Recognised for the girl child education initiative working across health, education and life skills.' },
      { year: '2015', to: 'Organisation', aud: 'org', color: '#556223', name: 'Social Enterprise of the Year, Manch Summit', body: 'For a replicable System of Crop Intensification model among smallholder and women farmers.' },
      { year: '2015', to: 'Community leaders', aud: 'community', color: '#EAAE28', name: 'Swayam Awards for Empowering Women', body: 'Twelve adolescents from across Uttar Pradesh honoured on 2 December 2015 by the Chief Minister, for work in girl child education, child rights forums and Mahila Adhikar Manch.' },
      { year: '2016', to: 'Community leader', aud: 'community', color: '#D2305C', name: 'Rani Lakshmi Bai Veerta Puraskar', body: 'Uttar Pradesh’s gallantry award for women, conferred on 8 March 2016 on Rekha, then Prime Minister of DEHAT’s Child Parliament, by the Chief Minister.' },
      { year: '2016', to: 'Community leader', aud: 'community', color: '#556223', name: '#100 Women Achievers of India', body: 'Bhanumati honoured on 22 January 2016 by the President of India for leading the forest rights movement that won revenue-village status for eight forest villages after 147 years.' },
      { year: '2016', to: 'Organisation', aud: 'org', color: '#4F0E73', name: 'Certificate of Merit, World CSR Congress', body: 'Conferred on 18 February 2016 in the Social Cause category at a congress with participants from 123 countries.' },
    ]);
    return {
      finLensTabs, finBasisTabs, finCurrTabs, finBasisNote, finRangePresets, finYearOpts, finChart, finBreakdown, finSegDetail, finLines, finLinesMore, finExplorerStats,
      finFromVal: fyFrom, finToVal: fyTo,
      onFinFrom: (e) => this.setState({ finFrom: e.target.value, finPick: '' }),
      onFinTo: (e) => this.setState({ finTo: e.target.value, finPick: '' }),
      finPickLabel: pick ? ('FY' + pick) : '',
      finHasPick: !!pick,
      clearFinPick: () => this.setState({ finPick: '' }),
      finHasSeg: !!finSegDetail,
      finLinesHead: activeSegKey ? (segMeta(activeSegKey).label + ' \u2014 ' + T.fin_lines_behind_it) : T.fin_lines_in_view,
      isHome: V === 'home', isWork: V === 'work', isImpact: V === 'impact',
      isWho: V === 'who', who: this._whoView(setView),
      isProg: V === 'prog' && !!pp, pp, programmeIndex,
      isStories: V === 'stories', isInvolved: V === 'involved', isFinance: V === 'finance', isMedia: V === 'media',
      isPolicies: V === 'policies', policyGroups: this._policies(), goPolicies: setView('policies'),
      goRaiseConcern: this._go('finance', 'raise', { rzKind: 'safeguard' }),
      whoTeaser: this._whoTeaser(setView, T),
      pv: this._partnerView(allProjects, FIN, PROGS) || {},
      rt: this._reportTransfer(((this._pt || {})[this.state.lang] || (this._pt || {}).en) || {}),
      hasPv: !!this._pt,
      goFinance: this._go('finance', 'allocation'),
      finStats: [
        { to: finTotalRec / 1e7, dec: 2, comma: false, prefix: '\u20b9', suffix: ' Cr', label: T.fin_stat_received },
        { to: finTotalFcra / 1e7, dec: 2, comma: false, prefix: '\u20b9', suffix: ' Cr', label: T.fin_stat_fcra },
        { to: (finTotalRec - finTotalFcra) / 1e7, dec: 2, comma: false, prefix: '\u20b9', suffix: ' Cr', label: T.fin_stat_inr },
        { to: FIN ? Object.keys(FIN.FUNDERS).length : 0, dec: 0, comma: false, prefix: '', suffix: '', label: T.fin_stat_funders },
      ].map((s, i) => ({ ...s, id: 'f' + i, value: cv('f' + i, s.prefix, s.suffix) })),
      ...this._ledger(), finFunderList,
      finDocGroups: FIN && FIN.DOCUMENTS ? (() => {
        const G = [
          { key: 'statutory', label: T.fin_docg_statutory, color: '#556223' },
          { key: 'fcra', label: T.fin_docg_fcra, color: '#0E5565' },
          { key: 'validation', label: T.fin_docg_validation, color: '#D2305C' },
        ];
        return G.map(g => ({
          label: g.label, color: g.color, dot: g.color,
          docs: FIN.DOCUMENTS.filter(d => d.group === g.key).map(d => ({ title: d.title, issuer: d.issuer, period: d.period, desc: d.desc, file: d.file, color: this._tok(g.color) })),
        })).filter(g => g.docs.length);
      })() : [],
      idIntro: FIN && FIN.IDENTITY ? FIN.IDENTITY.intro : '',
      idRows: FIN && FIN.IDENTITY ? FIN.IDENTITY.rows.map(r => ({ k: r.k, v: r.v, note: r.note })) : [],
      acIntro: FIN && FIN.ACCOUNTS ? FIN.ACCOUNTS.intro : '',
      accounts: FIN && FIN.ACCOUNTS ? FIN.ACCOUNTS.list.map(ac => ({
        key: ac.key, kind: ac.kind, bank: ac.bank, note: ac.note,
        accent: ac.tone === 'teal' ? 'var(--ac-teal)' : 'var(--ac-olive)',
        rows: ac.rows.map((r, i) => ({
          k2: ac.key + '-' + i, k: r.k, v: r.v,
          font: r.mono ? "'Bricolage Grotesque'" : 'inherit',
          size: r.mono ? '16px' : '14px',
          weight: r.mono ? '800' : '600',
          track: r.mono ? '.04em' : 'normal',
        })),
      })) : [],
      govIntro: FIN && FIN.GOVERNANCE ? FIN.GOVERNANCE.intro : '',
      govNote: FIN && FIN.GOVERNANCE ? FIN.GOVERNANCE.note : '',
      govSource: FIN && FIN.GOVERNANCE ? FIN.GOVERNANCE.source : '',
      ...this._govView(),
      accIntro: FIN && FIN.ACCOUNTABILITY ? this._tc('accountability', 'main', 'intro', FIN.ACCOUNTABILITY.intro) : '',
      accParties: FIN && FIN.ACCOUNTABILITY ? FIN.ACCOUNTABILITY.parties.map((p, i) => ({
        ...p,
        title: this._tc('accountability', String(i), 'title', p.title),
        body: this._tc('accountability', String(i), 'body', p.body),
        how: this._tc('accountability', String(i), 'how', p.how),
        edge: p.color, color: this._tok(p.color),
      })) : [],
      raiseTitle: FIN && FIN.ACCOUNTABILITY ? this._tc('accountability', 'raise', 'title', FIN.ACCOUNTABILITY.raise.title) : '',
      raiseBody: FIN && FIN.ACCOUNTABILITY ? this._tc('accountability', 'raise', 'body', FIN.ACCOUNTABILITY.raise.body) : '',
      raiseEmail: FIN && FIN.ACCOUNTABILITY ? FIN.ACCOUNTABILITY.raise.email : '',
      raisePhone: FIN && FIN.ACCOUNTABILITY ? FIN.ACCOUNTABILITY.raise.phone : '',
      raiseAddress: FIN && FIN.ACCOUNTABILITY ? FIN.ACCOUNTABILITY.raise.address : '',
      ...this._raiseComposer(),
      finReg: FIN ? FIN.COMPLIANCE.registrations.map(r => ({ code: r.code, what: r.what })) : [],
      finCal: FIN ? FIN.COMPLIANCE.calendar.map(c => ({ by: c.by, form: c.form, body: c.body, what: c.what })) : [],
      finRules: FIN ? FIN.COMPLIANCE.rules.map(r => ({ key: r.key, detail: r.detail })) : [],
      ...this._pressRail(setView),
      ask: this._askVals(setView),
      isAnswers: V === 'answers',
      T, navItems: navPrimary, footItems: navItems, moreItems, portfolioTotal, socialInvestmentTotal,
      navOpen: this.state.navOpen, toggleNav, navBurgerLabel: this.state.navOpen ? '✕' : '☰',
      isMoreOpen: !!this.state.navMore,
      moreOpen: this.state.navMore ? 'true' : 'false',
      moreArrow: this.state.navMore ? '180deg' : '0deg',
      moreActive: moreOn ? 1 : 0,
      moreColor: (moreOn || this.state.navMore) ? 'var(--text)' : 'var(--faint)',
      toggleMore: () => this.setState(s => ({ navMore: !s.navMore })),
      theme: this.state.theme,
      mapFrame: (el) => { this._mapFrame = el; },
      goHome: setView('home'), goWork: setView('work'),
      goDonate: this._go('involved', null, { pTab: 'give' }),
      goCycle: this._go('home', 'cycle'),
      goPartners: this._go('involved', null, { pTab: 'people' }),
      currentLang: this.state.lang,
      langsGlobal: langs.filter(l => l.group === 'global').map(l => ({ ...l, label: l.ready ? l.label : l.label + ' \u00b7 soon' })),
      langsIndian: langs.filter(l => l.group === 'indian').map(l => ({ ...l, label: l.ready ? l.label : l.label + ' \u00b7 soon' })),
      onLang: (e) => this._setLang(e.target.value),
      toggleTheme: () => this._toggleTheme(),
      themeGlyph: dark ? '☀' : '☾',
      socials: [
        { k: 'yt', name: 'DEHAT on YouTube', mark: '▶', href: 'https://www.youtube.com/@DehatIndiaOrg', tint: '#D2305C' },
        { k: 'ig', name: 'DEHAT on Instagram', mark: 'IG', href: 'https://www.instagram.com/dehat_india/', tint: '#EAAE28' },
        { k: 'fb', name: 'DEHAT on Facebook', mark: 'f', href: 'https://www.facebook.com/dehatorgindia/', tint: '#0E5565' },
        { k: 'li', name: 'DEHAT on LinkedIn', mark: 'in', href: 'https://www.linkedin.com/company/dehat-india/', tint: '#79C3D3' },
        { k: 'x', name: 'DEHAT on X', mark: '✕', href: 'https://x.com/dehatindia', tint: '#C2CE72' },
      ],

      heroStats: [
        { to: 22020, dec: 0, comma: true, suffix: '+', prefix: '', label: T.stat_children, art: 'sm-ink-crowd' },
        { to: 19.75, dec: 2, comma: false, suffix: ' Cr', prefix: '\u20b9', label: T.stat_invested, art: 'sm-ink-pair-ledger' },
        { to: 8.88, dec: 2, comma: false, suffix: ' Cr', prefix: '\u20b9', label: T.stat_resources, art: 'sm-ink-family' },
        { to: 23, dec: 0, comma: false, suffix: '', prefix: '', label: T.stat_districts, art: 'sm-ink-four-walking' },
      ].map((s, i) => {
        const id = 'h' + i;
        const on = !!this.state.statOpen[id];
        const n = s.comma ? Number(s.to).toLocaleString('en-US') : s.to.toFixed(s.dec);
        return Object.assign({}, s, {
          id: id,
          img: './assets/story/' + s.art + '.png',
          value: on ? (s.prefix || '') + n + (s.suffix || '') : '\u2014',
          open: on ? 1 : 0,
          numColor: on ? '#EAAE28' : 'rgba(251,247,239,.3)',
          filt: on ? 'brightness(0) invert(1) opacity(.95)' : 'brightness(0) invert(1) opacity(.26)',
          bg: on ? 'rgba(234,174,40,.12)' : 'rgba(251,247,239,.05)',
          ring: on ? 'rgba(234,174,40,.6)' : 'rgba(251,247,239,.16)',
          cue: on ? T.stat_hide : T.stat_reveal,
          cueColor: on ? 'rgba(251,247,239,.5)' : '#EAAE28',
          toggle: () => this.setState(st => ({ statOpen: Object.assign({}, st.statOpen, { [id]: !st.statOpen[id] }) })),
        });
      }),
      heroArtCss: 'url(./assets/story/sm-school-steps.png)',
      statHint: T.stat_hint,
      statRevealLabel: allStatsOpen ? T.stat_hide_all : T.stat_reveal_all,
      statRevealAll: () => this.setState({ statOpen: allStatsOpen ? {} : { h0: true, h1: true, h2: true, h3: true } }),
      pillars: [
        { glyph: 'V', color: '#0E5565', title: T.vision, body: T.vision_body, art: 'vision' },
        { glyph: 'M', color: '#D2305C', title: T.mission, body: T.mission_body, art: 'mission', link: 'work', linkLabel: T.pillar_link_work },
        { glyph: 'T', color: '#556223', title: T.theory, body: T.theory_body, art: 'theory-of-change', link: 'work', linkLabel: T.pillar_link_how },
      ].map((p, i) => Object.assign({}, p, {
        imgCss: 'url(./assets/art/' + p.art + '.png)',
        delay: (i * 110) + 'ms', driftDelay: (i * 1.4) + 's',
        hasLink: p.link ? 1 : 0, go: p.link ? setView(p.link) : null,
      })),
      programs: programsView, activeProgram,
      districts, activeDistrict,
      cycleNodes, activeNode, nextNode, prevNode, ringPlay, wheelLeave,
      loopCells, activeStep, goWorkFromLoop: setView('work'), wk,
      methodSteps: loopSteps,
      goInvestFromWork: this._go('involved', null, { pTab: 'give' }),
      goPartnerFromWork: this._go('involved', null, { pTab: 'people' }),
      activeStory, storyDots,
      goStories: setView('stories'),
      storiesAllLabel: T.stories_all, nextStory: () => this.setState(s => ({ story: (s.story + 1) % stories.length })), prevStory: () => this.setState(s => ({ story: (s.story - 1 + stories.length) % stories.length })),
      indexName: this._tagMap('index_name', this.props.indexName || 'Child Opportunity Gap Index', this.props.indexName || 'Child Opportunity Gap Index'),
      indexBeats: [
        { k: 'ib1', head: T.idx_b1_head, body: T.idx_b1_body },
        { k: 'ib2', head: T.idx_b2_head, body: T.idx_b2_body },
        { k: 'ib3', head: T.idx_b3_head, body: T.idx_b3_body },
      ],
      goWhereFromWork: this._go('home', 'where'),
      whyHere: [
        { k: 'wh1', num: '52.1%', place: this._tagMap('district_name', 'Bahraich', 'Bahraich'), body: T.why_h1 },
        { k: 'wh2', num: '51.9%', place: this._tagMap('district_name', 'Shravasti', 'Shravasti'), body: T.why_h2 },
        { k: 'wh3', num: '75.4%', place: this._tagMap('district_name', 'Balrampur', 'Balrampur'), body: T.why_h3 },
      ],
      ctas: [
        { title: T.cta_donate, body: T.cta_donate_b, action: T.cta_donate_a, bg: '#D2305C', fg: '#fff', art: 'invest', go: this._go('involved', null, { pTab: 'give' }) },
        { title: T.cta_vol, body: T.cta_vol_b, action: T.cta_vol_a, bg: '#EAAE28', fg: '#1f1710', art: 'volunteer', go: this._go('involved', null, { pTab: 'route' }) },
        { title: T.cta_partner, body: T.cta_partner_b, action: T.cta_partner_a, bg: '#0E5565', fg: '#fff', art: 'partner', go: this._go('involved', null, { pTab: 'people' }) },
      ].map((c, i) => Object.assign({}, c, {
        imgCss: 'url(./assets/art/' + c.art + '.png)',
        delay: (i * 110) + 'ms',
        filt: 'none',
      })),
      impactGrid: [
        { to: 22020, dec: 0, comma: true, suffix: '+', prefix: '', color: '#0E5565', label: 'Children and Adolescents Reached through Capacity Building' },
        { to: 6160, dec: 0, comma: true, suffix: '+', prefix: '', color: '#A92719', label: 'Child Protection Cases Responded To' },
        { to: 5629, dec: 0, comma: true, suffix: '+', prefix: '', color: '#556223', label: 'Families Securing Entitlements, Land Rights and Relief' },
        { to: 5225, dec: 0, comma: true, suffix: '+', prefix: '', color: '#D2305C', label: 'Women Reached and Organised into Their Own Collectives' },
        { to: 8.88, dec: 2, comma: false, suffix: ' Cr', prefix: '\u20b9', color: '#556223', label: 'Government Resources the Community Drew into Its Own Villages' },
        { to: 2460, dec: 0, comma: true, suffix: '+', prefix: '', color: '#556223', label: 'Farmers in Diversified and Natural Farming' },
        { to: 1886, dec: 0, comma: true, suffix: '', prefix: '', color: '#EAAE28', label: 'Rural Youth Trained and Placed in Work' },
        { to: 877, dec: 0, comma: false, suffix: '', prefix: '', color: '#0E5565', label: 'Community-Based Organisations Capacity-Built' },
        { to: 19.75, dec: 2, comma: false, suffix: ' Cr', prefix: '\u20b9', color: '#4F0E73', label: 'Social Investment Received across Twenty Audited Years' },
        { to: 48, dec: 0, comma: false, suffix: '', prefix: '', color: '#4F0E73', label: 'Social Investors on the Public Record' },
        { to: 48, dec: 0, comma: false, suffix: '', prefix: '', color: '#0E5565', label: 'Projects in the Public Register' },
        { to: 20, dec: 0, comma: false, suffix: '', prefix: '', color: '#4F0E73', label: 'Years of Audited Accounts Published in Full' },
      ].map((s, i) => {
        const id = 'g' + i;
        const on = !!this.state.gridOpen[id];
        const n = s.comma ? Number(s.to).toLocaleString('en-US') : s.to.toFixed(s.dec);
        return Object.assign({}, s, {
          id: id, edge: s.color, color: this._tok(s.color),
          img: './assets/story/' + gridArt[i % gridArt.length] + '.png',
          value: on ? (s.prefix || '') + n + (s.suffix || '') : '\u2014',
          numColor: on ? this._tok(s.color) : 'var(--faint)',
          cardBg: on ? 'var(--surface)' : 'var(--surface2)',
          filt: dark
            ? (on ? 'brightness(0) invert(1) opacity(.8)' : 'brightness(0) invert(1) opacity(.2)')
            : (on ? 'none' : 'grayscale(1) opacity(.25)'),
          cue: on ? T.stat_hide : T.stat_reveal,
          cueColor: on ? 'var(--faint)' : this._tok(s.color),
          toggle: () => this.setState(st => ({ gridOpen: Object.assign({}, st.gridOpen, { [id]: !st.gridOpen[id] }) })),
        });
      }),
      gridRevealLabel: allGridOpen ? T.stat_hide_all : T.grid_reveal_all,
      gridHint: T.grid_hint,
      gridRevealAll: () => this.setState({ gridOpen: allGridOpen ? {} : gridAllOpen }),
      blStop: this.state.blStop,
      blSet: (e) => { const v = parseInt(e.target.value, 10) || 0; this.setState({ blStop: v }); },
      blDragLabel: T.bl_drag,
      blStops: ['May 2003', 'March 2006', 'March 2007'].map((l, i) => ({
        label: l, col: i === this.state.blStop ? 'var(--ac-olive)' : 'var(--faint)',
      })),
      blCrowdCss: 'url(./assets/story/sm-crowd-wide.png)',
      blCrowdFilt: dark
        ? 'brightness(0) invert(1) opacity(' + [0.22, 0.5, 0.85][this.state.blStop] + ')'
        : 'grayscale(' + [1, 0.5, 0][this.state.blStop] + ') opacity(' + [0.3, 0.6, 1][this.state.blStop] + ')',
      blA: blCol(0), blB: blCol(1), blC: blCol(2),
      forkEyebrow: T.fork_eyebrow,
      roadVCss: 'url(./assets/story/rail-road-v.png)',
      awardsTail: 'The road continues',
      ecoArtCss: 'url(./assets/story/sm-hand-earth.png)',
      dignityArtCss: 'url(./assets/story/sm-four-holding-hands.png)',
      forkQ: T.fork_question,
      forkAnswered: fork ? 1 : 0,
      forkReply: fork === 'own'
        ? T.fork_reply_own
        : T.fork_reply_aid,
      forkOptions: [
        { id: 'aid', img: './assets/story/fork-relief-basket.png', title: T.fork_aid_title,
          caption: fork ? T.fork_aid_caption : T.fork_choose },
        { id: 'own', img: './assets/story/fork-planting-together.png', title: T.fork_own_title,
          caption: fork ? T.fork_own_caption : T.fork_choose },
      ].map(o => {
        const chosen = fork === o.id;
        const right = o.id === 'own';
        return Object.assign({}, o, {
          pick: () => this.setState({ caseFork: chosen ? '' : o.id }),
          filt: !fork ? 'none' : (right ? 'none' : 'grayscale(1) opacity(.5)'),
          bg: chosen ? (right ? 'rgba(85,98,35,.12)' : 'rgba(169,39,25,.08)') : 'var(--surface)',
          ring: chosen ? (right ? 'var(--ac-olive)' : 'var(--ac-red)') : 'var(--border)',
          capColor: fork && !right ? 'var(--faint)' : 'var(--text)',
          capCls: fork && !right ? 'strike-run' : '',
          cue: chosen ? T.fork_you_chose : (fork ? '' : T.fork_choose_this),
          cueColor: chosen ? (right ? 'var(--ac-olive)' : 'var(--ac-red)') : 'var(--faint)',
          artScale: chosen ? 1.06 : 1,
        });
      }),
      reach: [
        { to: 2, comma: false, suffix: '', label: T.reach_states },
        { to: 23, comma: false, suffix: '', label: T.reach_districts },
        { to: 68, comma: false, suffix: '', label: T.reach_blocks },
        { to: 903, comma: true, suffix: '', label: T.reach_villages },
        { to: 22020, comma: true, suffix: '+', label: T.reach_children },
        { to: 2460, comma: true, suffix: '+', label: T.reach_farmers },
      ].map((r, i) => ({ ...r, id: 'r' + i, value: cv('r' + i, '', r.suffix) })),
      ...this._longReads(setView),
      storyCards: [
        { right: 'Right to Participation', color: '#EAAE28', lite: '#EAAE28', img: './assets/story-participation.png', title: 'Benaras, because of a Child Parliament', body: 'No girl from Lohra village in Bichhiya had continued into higher studies. Reena Kumari\u2019s work in the Child Parliament changed what her parents believed a daughter could do \u2014 and she left to study at Rajkiya Balika Inter College, Benaras.', quote: 'If this Child Parliament did not exist, I would not have been able to study in Benaras.' },
        { right: 'Right to Protection', color: '#D2305C', lite: '#F58EA6', img: './assets/story-protection.png', title: 'Sixteen girls against a trafficker\u2019s truck', body: 'Cycling home from school in Nai Basti, sixteen girls \u2014 none older than fifteen \u2014 recognised a trafficking attempt, blocked the truck with their bicycles and called 1098. The driver abandoned the child and was arrested at Motipur.', quote: 'Is he your child? Where are you taking him to?' },
        { right: 'Right to Survival', color: '#556223', lite: '#C2CE72', img: './assets/story-survival.png', title: 'Twins who weighed 1.8 kg', body: 'Shahjahan of Bhagwanpur Mafi had lost two infants before and was feeding her 45-day-old twins goat milk. After five home visits, she began breastfeeding on 27 June 2011; both babies gained over half a kilo in the first month.', quote: 'She credits her children\u2019s survival to the feeding she took up.' },
        { right: 'Right to Development', color: '#0E5565', lite: '#79C3D3', img: './assets/story-development.png', title: 'Back to the classroom, by name', body: 'Swadhyaya bridge centres carry child labourers and school dropouts until they can rejoin a government school. In 2016\u201317, 2,080 children were back in learning across 67 co-ed centres, and 117 completed Class 5.', quote: '12 villages in the project area are now child-marriage free.' },
      ],
      reachNote: 'Footprint as recorded in the 2016\u201317 Impact Report: 773 villages across 23 blocks of seven districts \u2014 Bahraich, Shrawasti, Balrampur, Sonbhadra, Amethi, Kushinagar, Maharajganj \u2014 with an Indo-Nepal child protection network across the border districts. The wider figures above are cumulative since registration in 2000 and are drawn from successive annual reports.',
      awardsIntro: 'Every entry below names the year, the conferring body and who received it. Four of these went to community leaders rather than to the organisation. DEHAT\u2019s work was reported approximately 300 times in print in 2016\u201317 and 386 times in 2019\u201320.',
      awards: awardsAll,
      awardsFiltered: awardsAll.filter(a => this.state.awardTab === 'all' || a.aud === this.state.awardTab),
      ...(() => {
        const IL = this._il || {};
        const money = (n) => '\u20b9' + Math.round(n).toLocaleString('en-IN');
        const catLabel = (k) => (IL.CATEGORY_LABELS || {})[k] || k;
        const fmtCatRow = (k, v) => ({
          label: catLabel(k),
          value: k === 'convergence_inr' ? money(v) : Number(v).toLocaleString('en-IN'),
        });
        const maxCum = (IL.YEARLY || []).reduce((m, y) => Math.max(m, y.cumulative), 1);
        return {
          yearRows: (IL.YEARLY || []).map((y) => ({
            fy: y.fy,
            barPct: Math.max(3, Math.round((y.cumulative / maxCum) * 100)) + '%',
            receivedLabel: '+' + money(y.received),
            cumulativeLabel: money(y.cumulative),
          })),
          uncrcLens: Object.entries(IL.UNCRC_LENS || {}).map(([key, v]) => ({
            key,
            label: this._tagMap('uncrc_word', key, key),
            color: ({ Survival: '#556223', Development: '#0E5565', Protection: '#A92719', Participation: '#EAAE28' })[key] || 'var(--ac-olive)',
            countLabel: v.count + ' ' + T.lens_projects_suffix,
            rows: Object.entries(v.totals || {}).map(([k, val]) => fmtCatRow(k, val)),
          })),
          csrLens: Object.entries(IL.CSR_LENS || {}).map(([key, v]) => ({
            key,
            label: this._tagMap('csr_word', key, ((this._pd||{}).CSR || {})[key] || key),
            countLabel: v.count + ' ' + T.lens_projects_suffix,
            rows: Object.entries(v.totals || {}).map(([k, val]) => fmtCatRow(k, val)),
          })),
          sdgTabs: [
            { key: 'g', label: T.lens_sdg_tab_sdg }, { key: 'm', label: T.lens_sdg_tab_mdg },
          ].map((t) => ({
            ...t,
            pick: () => this.setState({ sdgTab: t.key }),
            bg: this.state.sdgTab === t.key ? 'var(--ac-teal)' : 'var(--surface)',
            fg: this.state.sdgTab === t.key ? '#fff' : 'var(--dim)',
            ring: this.state.sdgTab === t.key ? 'var(--ac-teal)' : 'var(--border)',
          })),
          sdgLensFiltered: Object.entries(IL.SDG_LENS || {})
            .filter(([key]) => key.startsWith(this.state.sdgTab))
            .map(([key, v]) => ({
              key,
              label: this._tagMap('sdg_by_key', key, ((this._pd||{}).SDG || {})[key] || key).split(' \u00b7 ').slice(1).join(' \u00b7 ') || key,
              imgCss: 'url(./' + (((this._pd||{}).SDG_ICON || {})[key] || '') + ')',
              filt: dark ? 'brightness(0) invert(1) opacity(.85)' : 'none',
              countLabel: v.count + ' ' + T.lens_projects_suffix,
              rows: Object.entries(v.totals || {}).map(([k, val]) => fmtCatRow(k, val)),
            })),
        };
      })(),
      awardTabs: [
        { key: 'all', label: T.lens_award_all },
        { key: 'community', label: T.lens_award_community },
        { key: 'founder', label: T.lens_award_founder },
        { key: 'org', label: T.lens_award_org },
      ].map((t) => ({
        ...t,
        pick: () => this.setState({ awardTab: t.key }),
        bg: this.state.awardTab === t.key ? 'var(--ac-purple)' : 'var(--surface)',
        fg: this.state.awardTab === t.key ? '#fff' : 'var(--dim)',
        ring: this.state.awardTab === t.key ? 'var(--ac-purple)' : 'var(--border)',
      })),
      involve: [
        { glyph: 'V', color: '#EAAE28', title: 'Volunteer / Intern', body: 'Work on the ground or virtually. Become a General Body Member or a DEHAT Fellow.' },
        { glyph: 'C', color: '#0E5565', title: 'Consult us', body: 'Adopt our rights-based models or engage our Community Resource Persons.' },
        { glyph: 'P', color: '#D2305C', title: 'Corporate partner', body: 'Pledge to end child labour and abuse in your workplace and allied spaces.' },
        { glyph: 'S', color: '#556223', title: 'Schools & academia', body: 'Engage students in support work, or become an academic research partner.' },
        { glyph: 'F', color: '#4F0E73', title: 'Sondhi Maati Farmer Producer Company', body: 'Bulk-buy from our Farmer Producer Company and shop from Sondhi Maati.' },
        { glyph: 'A', color: '#A92719', title: 'Amplify', body: 'Share our published work, host an event, or celebrate your special day with us.' },
      ],
    };
  }
}
