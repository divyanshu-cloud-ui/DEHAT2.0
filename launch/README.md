# Handoff 157: limited launch proof

This branch implements the approved five-document proof, not the full launch.
The existing `DEHAT.dc.html` preview retains its normal behaviour unless the
launch adapter is explicitly present. Work is in the Downloads worktree.

## Checks

Run from the repository root with Node.js:

```
node --test launch/routes.test.mjs tools/*.test.mjs
node audit_all_28_languages.js
node tools/validate-launch-inputs.mjs
```

The browser diagnostic requires Playwright 1.62.1 and Chromium. Set
`PLAYWRIGHT_MODULE` to an installed Playwright module if it is not resolvable
locally, and optionally `CHROME_PATH` to a Chrome executable. It launches a
separate headless profile and a loopback-only server:

```
node tools/proof-browser.mjs
```

Evidence is written after each page/run in ignored `_internal/qa/157/proof`.
It covers Home, Arabic Impact, one story and Media; 390/1440 screenshots;
CSSOM-preserving snapshots; no-JavaScript and failed-adapter fallbacks;
legal/invalid HTTP status checks; and ten independent finance cold loads.
Diagnostic pages have no publication metadata and must never be deployed.

## Strict generation and packaging

```
node tools/generate-proof.mjs
node tools/package-launch.mjs
```

Generation first requires real SEO, translated metadata, schema, redirects and
both llms texts. Missing inputs are errors. It reruns browser checks, rejects
sources changed during rendering, and creates `generated/proof` with source and
output digests. Existing output is not silently replaced. Packaging verifies
digests again and writes Vercel Build Output to `.vercel/output`; it explicitly
copies only allowlisted assets and the seven payment handlers/helpers. The
webhook disables platform body helpers to retain the raw body. All proof output
is noindex. Packaging never deploys anything.

## Adapter contract and remaining gate work

`bootstrap.mjs` is the sole runtime adapter. It supplies route state and data,
turns known navigation actions into usable links through the template builder,
and keeps the readable server snapshot until the interactive tree is ready.
The original generated `support.js` is unchanged. Its one-time `x-dc.innerHTML`
read receives inert template markup, avoiding downloads from inactive branches.

The local routing suite covers all 3,752 app language/path combinations, but
only four app documents and one legal document may be generated at this gate.
The finite production output does not serve arbitrary paths as Home.

The proof inputs, generated pages and local package are now available. Run
`node tools/check-proof-output.mjs` to check packaged HTTP responses, metadata,
same-document navigation and read-only handler behaviour. The local preview
cannot prove payment-provider authentication or Vercel edge behaviour.

Handoff 165 assigns hosted preview deployment, payment-provider testing,
cutover, further payload optimisation, and navigation refinements to Claude.
The five-page proof remains a noindex review artifact.
