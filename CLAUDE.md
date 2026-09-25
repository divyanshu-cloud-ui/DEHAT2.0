---
tags: [moc, agent-routing]
title: Agent Routing
updated: 2026-08-18
---
# DEHAT 2.0

This folder is two things at once:

1. **The live DEHAT website** — everything at this root level (`*.dc.html`,
   `district-map.html`, `support.js`, `*-data.js`, `assets/`, logos,
   `WEBSITE.md`, `github.md`, `vercel.json`) is the deployed site, tracked
   by git and pushed to
   [divyanshu-cloud-ui/DEHAT2.0](https://github.com/divyanshu-cloud-ui/DEHAT2.0).
   `DEHAT.dc.html` is the homepage (served at `/` via `vercel.json`).
   Don't move these files — deployment and internal links assume this layout.

2. **An Obsidian vault** — `.obsidian/` config lives here too. Vault
   attachments (pasted note images) live in `attachments/`.

## Where things live

| Looking for... | Go to |
|---|---|
| Site source / assets | repo root, `assets/` |
| Backend Architecture & Roadmap | [BACKEND_ARCHITECTURE_ROADMAP.md](BACKEND_ARCHITECTURE_ROADMAP.md) |
| SEO Audit & Technical Plan | [SEO_AUDIT_AND_ACTION_PLAN.md](SEO_AUDIT_AND_ACTION_PLAN.md) |
| Master Archive (proposals, budgets, audits, M&E, contracts) | [MASTER_ARCHIVE_MOC.md](MASTER_ARCHIVE_MOC.md) |
| Raw/working content (scans, uploads, drafts, screenshots) | [content-pipeline/CONTEXT.md](content-pipeline/CONTEXT.md) |
| Obsidian note attachments | `attachments/` |
| Compliance/legal docs (PAN, FCRA, bank account, registration) | `assets/docs/` — gitignored, never push these |

Everything under `content-pipeline/` and `attachments/` is gitignored: it's
private working material (personal photos of beneficiaries/staff, scanned
legal/financial documents, drafts), not the site itself.

`.thumbnail`, `.image-slots.state.json`, `tmp-summary.json`, `tmp-team.json`
are left at root deliberately (gitignored) — unclear what local tool expects
them at this path, so they weren't relocated.
