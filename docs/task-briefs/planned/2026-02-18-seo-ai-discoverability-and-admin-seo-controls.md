# Task Brief: SEO AI Discoverability And Admin SEO Controls

## Metadata

- `id`: `2026-02-18-seo-ai-discoverability-and-admin-seo-controls`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-18`
- `updated`: `2026-02-18`

## Goal

freeswimming.org should have production-grade technical/content SEO and operator-friendly admin controls so pages are discoverable in classic search and AI answer engines.

## Scope

- Build a full SEO foundation across public routes:
  - route-level metadata quality (`title`, `description`, canonical),
  - Open Graph/Twitter cards,
  - robots directives,
  - XML sitemap coverage.
- Add structured data strategy:
  - organization/site schema,
  - course/lesson/product/article schema where relevant,
  - breadcrumb schema on hierarchical routes.
- Add AI discoverability hardening:
  - consistent brand/entity naming across pages,
  - machine-readable summaries on key pages,
  - optional `llms.txt` + `llms-full.txt` strategy (non-sensitive content only),
  - clean internal linking and crawlable navigation.
- Add admin SEO controls in `/admin`:
  - per-page SEO fields (title, description, canonical, OG image),
  - index/noindex toggle,
  - schema type + key fields,
  - redirect management (301/302 with validation),
  - SEO preview (SERP + social card preview).
- Add validation and guardrails:
  - max lengths, duplicate canonical checks, slug collision checks,
  - broken internal link checks,
  - noindex safety rules for production-critical routes.
- Add measurement and runbook:
  - Search Console + Bing Webmaster verification setup checklist,
  - event logging for SEO admin mutations,
  - monthly SEO health checklist in docs.

## Out Of Scope

- Backlink outreach campaigns.
- Paid ads strategy.
- Full content rewrite of all lessons/pages in this phase.

## Acceptance Criteria

- All indexable public pages have unique, valid metadata and canonical URL.
- Sitemap includes all indexable public URLs and excludes gated/private/admin URLs.
- Structured data validates with no critical errors on changed templates.
- Admin can update SEO metadata without deploy and changes are reflected after publish/revalidate.
- Redirect rules are validated server-side and prevent loops/open redirects.
- AI-discoverability assets (`llms.txt` if enabled, entity-consistent copy, schema coverage) are documented and shipped.
- No SEO changes regress current UX, performance, or auth/privacy boundaries.

## Validation

- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run build`
- `npm run verify`

## Local Tooling Prerequisite (Required)

- Node.js LTS and npm installed on the machine that runs validation.
- Run `npm ci` and `npm run verify` before PR handoff.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/`
  - `http://127.0.0.1:3000/plans`
  - `http://127.0.0.1:3000/my-library`
  - `http://127.0.0.1:3000/admin`
  - `http://127.0.0.1:3000/sitemap.xml`
  - `http://127.0.0.1:3000/robots.txt`
- Vercel preview:
  - verify metadata/OG/schema output on rendered HTML.
- Browser/device matrix:
  - iOS Safari, Android Chromium, iPad viewport, Desktop Chrome/Safari/Firefox.

## Constraints

- Do not expose private/admin/gated URLs in sitemap/indexing.
- Preserve existing brand style and conversion-critical UX.
- Keep SEO controls safe-by-default (no accidental site-wide deindexing).

## 10/10 Quality Bar (Required For User-Facing Work)

- Metadata and snippets are clear, conversion-aware, and non-duplicative.
- Admin SEO workflows include `loading`, `empty`, `error`, `offline`, `retry`.
- SEO controls use plain language and inline validation guidance.
- Social preview and search preview are accurate before publish.
- Accessibility and keyboard support for all admin SEO form controls.

## Security, Privacy, And Compliance (Required For Auth/Data/Payments)

- Role-gated admin SEO mutations (`viewer` read, `editor/admin` write).
- Redirect editor enforces same-site destination policy unless explicitly allowlisted.
- No sensitive/internal URLs or query params leaked via sitemap/llms assets.
- Audit log entries for SEO mutations and redirect changes.

## Observability And KPI Contract

- Track:
  - `seo_metadata_updated`,
  - `seo_redirect_created`,
  - `seo_redirect_updated`,
  - `seo_schema_updated`,
  - `seo_publish_completed`.
- Operational metrics:
  - index coverage trend,
  - crawl errors,
  - broken-link count,
  - rich-result valid item count.
- Product KPIs:
  - growth in impressions/clicks for priority pages,
  - CTR uplift on plans/library entry routes.

## Session Continuity And Recovery (Required)

- Canonical source: git branch + this brief.
- Checkpoint cadence: every validated slice or every 60-90 min.
- Recovery:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from next step.

## Git Rhythm Defaults (Required)

- Commit + push per slice:
  - metadata foundation,
  - sitemap/robots/schema,
  - admin SEO CRUD,
  - redirects + validation,
  - tests/docs.
- Ask before PR create/refresh and merge handoff.

## Branch Hygiene Defaults (Required)

- Post-merge:
  - `git checkout main`
  - `git pull --ff-only origin main`
  - `git branch -d <merged-branch>`
  - `git fetch --prune origin`

## PR Browser Rule (Required)

- Open PR links in Safari by default.

## Manual QA URL Rule (Required)

- Assistant opens each QA URL in Safari before asking for `done`.

## Final Closeout Gate (Required Before Move To `done`)

- Verify each acceptance criterion complete or explicitly deferred.
- Run final SEO + UX + security/perf regression sweep.
- Confirm evidence for local + preview + indexing outputs.

## Completion Record (fill when done)

- `PR`: link
- `merge`: source -> target
- `result`: short summary
