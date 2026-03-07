# Task Brief: SEO AI Discoverability And Admin SEO Controls

## Metadata

- `id`: `2026-02-18-seo-ai-discoverability-and-admin-seo-controls`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-18`
- `updated`: `2026-02-21`

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
- Add automated SEO assertions:
  - route-level tests for canonical/title/description consistency on indexable routes,
  - robots/sitemap consistency assertions for public vs gated/admin routes,
  - metadata regressions caught in CI before merge.
- Add measurement and runbook:
  - Search Console + Bing Webmaster verification setup checklist,
  - event logging for SEO admin mutations,
  - monthly SEO health checklist in docs.

## Ownership Split (No Overlap)

- This brief owns:
  - public SEO/AI behavior and assertions:
    - route metadata output,
    - crawl/indexing behavior,
    - sitemap/robots consistency,
    - structured-data output and discoverability assets.
  - final SEO admin experience around publishing/preview/governance behaviors.
- Related work owned elsewhere:
  - admin/content SEO data foundation (schema + role-gated CRUD primitives):
    - `docs/task-briefs/in-progress/2026-02-19-admin-content-source-of-truth-and-dashboard-10-10.md`
  - visual snapshot baselines and cross-device UI diff checks:
    - `docs/task-briefs/planned/2026-02-18-cross-platform-ux-design-hardening.md`
  - performance budgets and security negative-path hardening:
    - `docs/task-briefs/planned/2026-02-19-performance-budgets-and-security-negative-path-hardening.md`

## Dependency Boundary (From Admin Content Brief)

This brief assumes admin/content foundation provides these primitives first:

- persisted SEO fields per content item:
  - `seo_title`, `seo_description`, `canonical_path`, `robots_index`, `og_image_url`, `schema_type`,
- RBAC + audit + validation for SEO field writes,
- admin edit controls for those fields.

This brief then owns route-level use of those fields in rendered metadata/indexing behavior.

## Out Of Scope

- Backlink outreach campaigns.
- Paid ads strategy.
- Full content rewrite of all lessons/pages in this phase.

## Acceptance Criteria

- All indexable public pages have unique, valid metadata and canonical URL.
- Sitemap includes all indexable public URLs and excludes gated/private/admin URLs.
- Structured data validates with no critical errors on changed templates.
- Admin SEO metadata edits (from foundation model) are reflected in public rendering after publish/revalidate.
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

## 10/10 Cross-Cut Categories (Apply When Relevant)

State scope or `N/A` for each category during implementation and closeout:

- Content governance and source-of-truth: canonical model, required fields, owner assignment, revision/rollback policy.
- Taxonomy and category management: naming rules, sorting, and active/archive lifecycle.
- Workflow and publishing safety: status model (`draft/review/published/archived`), publish safeguards, destructive confirmation.
- Business logic correctness and data integrity: deterministic state transitions, invariant validation, idempotent critical mutations, and no silent data corruption paths.
- RBAC and auditability: role boundaries per endpoint/UI action and audit trail for sensitive mutations.
- UX/UI quality contract: clear primary action and required states (`loading`, `empty`, `error`, `retry`).
- Performance contract: latency/render/payload guardrails for changed surfaces.
- Testing contract: unit + e2e coverage for critical and negative paths; avoid duplicate tests.
- Observability and KPI tracking: required events/logs and measurable thresholds.
- Migration and rollback readiness: rollout plan, compatibility window, rollback path.
- Definition-of-done quant targets: explicit measurable pass criteria.

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

## Platform 10/10 Scorecard Linkage

- Canonical reference: `docs/quality/platform-10-10-scorecard.md`.
- This brief must mark scorecard categories as `target`/`supporting`/`N/A` and define measurable thresholds for each `target`.
- Closeout must record achieved score (`0-5`) for each target category.

## Automation Execution Contract

- Mode: `automation-first`.
- Assistant executes implementation, validation, commit/push, PR open/update, and check follow-up by default.
- Required gates:
  - before PR update/push: `npm run verify:pre-pr`
  - before merge recommendation: `npm run verify:pre-merge` and required CI green.
- Manual owner steps only when blocked by credentials, UI-only actions, or sandbox/escalation limits.
