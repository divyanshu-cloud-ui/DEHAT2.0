# DEHAT Website Validation & Ad Grants Readiness — Master Handoff to Claude

**Date**: 22 October 2026  
**From**: Antigravity  
**To**: Claude  
**Subject**: Comprehensive validation of website changes, measurement integration, routing, and editorial integrity for Google Ad Grants deployment  
**Governing Work Order**: [`DEHAT_AD_GRANTS_ANTIGRAVITY_MASTER_HANDOFF_2026-10-22.md`](file:///Users/divyanshuchaturvedi/Desktop/DEHAT_AD_GRANTS_ANTIGRAVITY_MASTER_HANDOFF_2026-10-22.md)  
**Release Candidate Worktree**: [`/Users/divyanshuchaturvedi/Downloads/DEHAT 2.0/DEHAT_release_wt`](file:///Users/divyanshuchaturvedi/Downloads/DEHAT%202.0/DEHAT_release_wt) on branch `prep/media-archive`  
**Google Ads Customer**: `863-075-5869` (`DEHAT AdWords Express`) — Legal entity: *Developmental Association for Human Advancement*  
**Canonical Public Host**: `https://dehatindia.org` (non-`www`)

---

## 1. Objective of this Handoff

Antigravity has audited the account baseline (Gate 0), staged and tested the Google Ads measurement and consent code in [DEHAT_release_wt](file:///Users/divyanshuchaturvedi/Downloads/DEHAT%202.0/DEHAT_release_wt) (Gate 1), restored editorial integrity across all 28 languages, and structured the search campaign architecture (Gate 2).

Before any production deployment to Vercel or campaign activation in Google Ads, **Claude is requested to conduct a rigorous, independent validation** of:
1. **Editorial & Philosophical Integrity**: Verification that the core messaging is uncompromised and fully compliant.
2. **Measurement, Tagging & Privacy Architecture**: Verification of the consent gate, server-verified Razorpay event, deduplication token, CSP allowlist, and zero-PII guarantees.
3. **Routing, Destinations & Canonical Edge Configuration**: Verification of live routes, mobile UX, and resolution of the `www` vs non-`www` Cloudflare issue.
4. **Build & Release Pipeline Integrity**: Verification of test suites, multi-language parity, and compatibility with in-flight branches (`codex-mobile-perf-boot-errors` in `DEHAT2.0_FRESH_CLONE`).

---

## 2. Non-Negotiable Editorial Baseline (Strict Directive)

The live giving page ([`https://dehatindia.org/get-involved/give`](https://dehatindia.org/get-involved/give)) leads with:
> **“This Is an Investment, Not a Donation.”**  
> *“Every investment is receipted and tracked in the same ledger you can already audit.”*

### Editorial Rules for Claude:
- **Do NOT alter, dilute, or replace this headline.** It represents DEHAT's intentional philosophy: an investment in children's rights and structural social change, **not a promise of financial return**.
- Earlier local drafts attempted to rewrite Hindi lines 8158–8159 to *"बच्चों के अधिकारों में आपका दान एक सामाजिक निवेश है।"*. **Antigravity has reverted this edit** back to the canonical `pv_head_pay_title: 'यह निवेश है, दान नहीं।'`. Claude must confirm that all 28 languages preserve this exact philosophical stance.
- **Charitable Status Disclosures**: Compliance with Google Ad Grants and Indian statutory rules (80G, 10BD, FCRA) is handled entirely via explicit, truthful supporting context and ad copy:
  - Approval number: **AAAAD3793Q25LK02**, valid for AY 2027–28 to 2031–32.
  - Foreign contributions: Clarified as SBI FCRA bank transfers only (no online checkout, no domestic 80G receipt).
  - General advisory banners in Google Ads (e.g. Missing-GSTIN, conditional financial services) are **not** policy violations and do not warrant compromising the site's philosophical identity.

---

## 3. Website Code Changes Staged in `DEHAT_release_wt`

Claude, please inspect and validate the following specific changes in `/Users/divyanshuchaturvedi/Downloads/DEHAT 2.0/DEHAT_release_wt`:

### A. Template & Measurement Gate: `DEHAT.dc.html`
- **Method `_adsGate()`** (around line 36200):
  ```javascript
  _adsGate() {
    try {
      const s = this.state || {};
      const record = JSON.parse(window.localStorage.getItem('dehat.consent') || 'null');
      const allowed = !!(s.ckDecided && s.ckPrefs?.targeting && record?.v === 2 && record.prefs?.targeting
        && ['en', 'hi'].includes(s.lang) && window.location.hostname === 'dehatindia.org'
        && this._pmode === 'live');
      if (allowed && !window.__dehatAdsTag) {
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
        window.gtag('consent', 'default', { ad_storage: 'granted', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });
        window.gtag('js', new Date());
        window.gtag('config', 'AW-940501892', { send_page_view: false, allow_ad_personalization_signals: false });
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=AW-940501892';
        script.dataset.dehatAds = 'true';
        document.head.appendChild(script);
        window.__dehatAdsTag = true;
      } else if (window.__dehatAdsTag && window.__dehatAdsAllowed !== allowed) {
        window.gtag('consent', 'update', { ad_storage: allowed ? 'granted' : 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });
        if (!allowed) document.cookie.split(';').forEach(part => {
          const name = part.trim().split('=')[0];
          if (!/^_gcl_|^_gac_/.test(name)) return;
          const expired = name + '=; Max-Age=0; path=/; SameSite=Lax';
          document.cookie = expired;
          document.cookie = expired + '; domain=dehatindia.org';
          document.cookie = expired + '; domain=.dehatindia.org';
        });
      }
      window.__dehatAdsAllowed = allowed;
      return allowed;
    } catch (e) { return false; }
  }
  ```
  *Validation check*: Confirm tag stays dormant in test mode, before consent, on non-canonical hosts, and cleans up cookies on withdrawal.

- **Method `_recordAdsDonation(proof)`**:
  - Emits Google Ads conversion `AW-940501892/5FYmCJiNhKUdEITXu8AD`.
  - Triggered only after server `/api/donations/verify` confirms the payment.
  - Takes `proof.amount` (in paise, divided by 100 for INR).
  - Derives `transaction_id` by hashing `proof.paymentId` with SHA-256 (`dehat-<hash>`).
  - *Validation check*: Confirm NO PII (name, email, phone, PAN, address) or raw Razorpay IDs are passed to Google Ads.

- **Checkout UX Safety**:
  - In `_payNow()`, removed the buggy fallback `this.setState({ dStage: 1 })` when opening Razorpay modal fails. A payment failure or cancellation never enters the success/verification stage.

### B. Backend Verification: `backend/donations/verify.js`
- Updated response payload:
  ```javascript
  json(res, 200, { verified: true, paymentId, amount: Number(payment.amount), currency: payment.currency });
  ```
  *Validation check*: Confirms the frontend uses the processor-verified amount from Razorpay, never a client-manipulated amount.

### C. Content Security Policy (CSP): `launch/edge.mjs`
- Added Google Ads endpoints to `CSP_SOURCES`:
  - `script-src`: `'https://www.googletagmanager.com'`, `'https://www.googleadservices.com'`, `'https://www.google.com'`
  - `img-src` & `connect-src`: `'https://www.googletagmanager.com'`, `'https://www.googleadservices.com'`, `'https://googleads.g.doubleclick.net'`, `'https://pagead2.googlesyndication.com'`, `'https://www.google.com'`, `'https://www.google.co.in'`, `'https://ad.doubleclick.net'`
  - `frame-src`: `'https://www.googletagmanager.com'`
  *Validation check*: Confirm that CSP report-only headers prevent script execution blocking while adhering to least privilege.

### D. Early Consent Snapshot: `launch/early-consent.mjs`
- Requires `r.v === 2` for English and Hindi before marking consent as `decided` to ensure visitors view the updated measurement disclosure.

---

## 4. Current Test & Audit Baseline

Claude, verify these local test results before touching any files:

1. **Core Unit & Integration Tests**:
   ```bash
   cd "/Users/divyanshuchaturvedi/Downloads/DEHAT 2.0/DEHAT_release_wt"
   node --test tools/*.test.mjs launch/*.test.mjs
   ```
   *Current Result*: **186 passed, 0 failed, 2 skipped** (browser checks needing Playwright executable).

2. **Google Ads & Payment Safety Tests**:
   ```bash
   node --test tools/early-consent-ads.test.mjs tools/google-ads-gate.test.mjs tools/payment-ui-safety.test.mjs
   ```
   *Current Result*: **6 passed, 0 failed**.

3. **28-Language Parity Audit**:
   ```bash
   node audit_all_28_languages.js
   ```
   *Current Result*: **100% PASS across all 28 languages** (zero empty strings, zero stubs, exact field alignment).

4. **Launch Inputs Validation**:
   ```bash
   node tools/validate-launch-inputs.mjs
   ```
   *Current Result*: **PASS**.

---

## 5. Specific Validation Tasks for Claude

Claude, please systematically work through and report back on the following items:

### Task 1: Audit of Destination URLs & Sitelinks
Verify that the proposed Google Ads landing destinations are completely functional, responsive, and render correctly without console errors:
- Primary Donation Destination: `https://dehatindia.org/get-involved/give`
- Sitelink / Credibility Destination: `https://dehatindia.org/finance` (confirm PDF links to 12AB, 80G, FCRA certificates)
- Programmes Destination: `https://dehatindia.org/work`
- Institutional & Volunteer Destination: `https://dehatindia.org/get-involved/people`

### Task 2: Canonical Domain & Cloudflare Edge Routing
- Live probe shows `https://dehatindia.org` routes to Vercel via Cloudflare.
- However, `https://www.dehatindia.org` serves an obsolete static website directly from Cloudflare.
- **Action for Claude**: Validate the edge redirection rule needed (Cloudflare Page Rule / Redirect Rule: `301 Permanent Redirect` from `www.dehatindia.org/*` to `https://dehatindia.org/$1`) so that users landing on `www` URLs are canonicalized to the modern application.

### Task 3: Branch Reconciliation & Conflict Prevention
- Check workspace [`/Users/divyanshuchaturvedi/Desktop/DEHAT 2.0/DEHAT2.0_FRESH_CLONE`](file:///Users/divyanshuchaturvedi/Desktop/DEHAT%202.0/DEHAT2.0_FRESH_CLONE) on branch `codex-mobile-perf-boot-errors`.
- Identify uncommitted files in `DEHAT2.0_FRESH_CLONE` (`content-i18n/brx.js`, `content-i18n/ks.js`, `assets/press/`, `tools/`).
- Ensure no conflicting changes between `prep/media-archive` (in `DEHAT_release_wt`) and `codex-mobile-perf-boot-errors` occur before production deployment.

### Task 4: Google Ads Inactive Goal & Diagnostic Gate
- In Google Ads, the primary conversion action is `DEHAT confirmed donation` (`AW-940501892/5FYmCJiNhKUdEITXu8AD`).
- It is currently marked **Inactive / Misconfigured** on Google Ads because the tag has not yet been deployed to `dehatindia.org`.
- **Validation**: Validate that upon Vercel deployment of `DEHAT_release_wt`, performing one provider-approved test transaction or tag diagnostic will flip this status to active without fabricating fake production conversion records.

---

## 6. Output Deliverable Expected from Claude

Please produce a structured report containing:
1. **Validation Summary**: Confirmed status of the 4 validation tasks above.
2. **Any Code Anomalies or Gaps**: Explicit callout of any edge case or missing security header.
3. **Green Light for Production Build**: Confirmation whether `DEHAT_release_wt` is ready for `node tools/rebuild-site.mjs` and deployment to Vercel.
4. **Cloudflare & DNS Recommendation**: Exact instructions for resolving the `www` redirect.
