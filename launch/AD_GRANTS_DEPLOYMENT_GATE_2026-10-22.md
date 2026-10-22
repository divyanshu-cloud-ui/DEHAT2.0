# DEHAT Ad Grants deployment gate — 22 October 2026

This note belongs to the current release source (`DEHAT_release_wt`, branch
`prep/media-archive`), not the older `DEHAT_codex157_wt` preview. Nothing in
this note constitutes a production deployment or a verified live payment.

## Evidence and destination

- Canonical public site: `https://dehatindia.org` (without `www`).
- The live `/finance` page exposes direct public links to 12AB, 80G, FCRA and
  signed annual accounts. The 80G link serves a PDF. Use this page as a
  credibility sitelink, not as the conversion destination.
- The two active legacy Smart campaigns observed in Google Ads pointed to
  `https://dehatindia.org/get-involved/give`. Their landing-page URLs were
  correct, but the campaign/account overhaul has not been completed.

## Local changes ready for a release candidate

- The site's established philosophical headline—“This Is an Investment, Not a
  Donation”—is preserved across English, Hindi and all 28 localized editions
  per the user's master handoff direction. Factual clarity on charitable status
  and the absence of financial return is maintained in surrounding context,
  statutory disclosures, and ad copy rather than diluting the headline.
- A fresh English/Hindi cookie choice is required before optional Google Ads
  measurement. The Google tag stays absent on test/preview hosts and before
  consent; withdrawal revokes consent and clears the site's Google click
  cookies.
- The existing `DEHAT confirmed donation` conversion ID is emitted once,
  using the Razorpay-verified INR amount and a hashed payment reference, only
  after server confirmation. Foreign transfer forms and unverified payments
  do not count as donations. This browser event covers the initial domestic
  checkout only; later subscription charges and reconciled foreign credits
  require a separately designed, consent-aware server/offline conversion path.
- The production route CSP report-only allowlist now includes Google's
  documented Ads conversion origins. The runtime template removes editor-only
  HTML comments to preserve the existing size budget.

## Verified locally

- `node --test tools/*.test.mjs launch/*.test.mjs`: 186 passed, 0 failed,
  2 browser checks skipped without browser path. Both skipped checks then
  passed with the bundled Playwright module and installed Chrome.
- `node audit_all_28_languages.js`: pass.
- `node tools/validate-launch-inputs.mjs`: pass.
- Read-only local Chromium route probe for `/get-involved/give`: pass.

## Still required before publication or new ad spend

1. Generate a new full Build Output from this exact source, verify its digests
   and all routes, and test on a hosted preview. Existing `.vercel/output` and
   `generated/site` are older local artifacts and were not replaced here.
2. Test a real (or provider-approved test-mode) Razorpay payment end-to-end,
   including verified amount, 80G receipt behavior, consent withdrawal,
   and a Google Ads conversion diagnostic. Do not count a form submission as
   a donation.
3. Confirm the Google Ads account's conversion action, account-default goal,
   campaigns, search terms, locations, assets, and verification tasks in a
   working dashboard. The in-app Ads tab displayed a Google error and an
   ad-blocker warning during this review; no account edits were made.
4. Ensure search ad copy and landing context strictly adhere to truthful
   charitable disclosures without altering the site's philosophical framing.
5. Do not enter a fabricated GSTIN or assert a tax status to Google. The
   organisation's actual payment-profile treatment requires a documented
   determination; genuine donations and Google Ads billing are separate
   questions.
6. Build the recurring-charge and reconciled-foreign-credit conversion path
   before claiming that all donations, domestic and foreign, are measured.

Production Ads conversion status remains unverified until the new site build
is deployed and at least one consented, verified payment is observed in the
Google Ads diagnostics.
