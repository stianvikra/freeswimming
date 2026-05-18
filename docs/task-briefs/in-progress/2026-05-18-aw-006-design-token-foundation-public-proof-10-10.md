# Task Brief: AW-006 Design Token Foundation Public Proof (10/10)

## Metadata

- `id`: `2026-05-18-aw-006-design-token-foundation-public-proof-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-18`
- `updated`: `2026-05-18`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-05-18`
- `base`: `main@7d0d1ab`
- `audit_status`: `ready`
- `decision`: Execute the next small AW-006 slice by establishing a reusable token foundation and proving it on one public route.
- `reason`: Public IA cleanup is shipped through `#740/#741`; the canonical UX/UI queue lists Design token foundation as the next ordinary follow-up.
- `must_refresh_before_execution_if`: Refresh if `app/globals.css`, `/our-method`, Tailwind config, screenshot handoff rules, AW-006 scope, or scorecard categories change before PR handoff.

## Goal

Create a small, reviewable design-token foundation for color, type, spacing, radius, and shadow, then migrate `/our-method` as the first route-local proof without changing route IA or product behavior. The token direction must be informed by the app's most mature product surfaces, not by `/our-method` alone.

## Mature Reference Surfaces

Use these as the quality reference for token direction and later rollout:

- Swim session builder.
- Micro sessions.
- Dryland training.
- Habits.
- Poolside Guide.
- Poolside/PDF print surface.

This PR should not migrate those larger surfaces. They define the maturity bar; `/our-method` is only the low-risk public proof that the token foundation can be applied without disturbing high-value workflows.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Visual design quality`
- `Accessibility (a11y)`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                 | Evidence                                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/our-method` remains the canonical method page with unchanged public route purpose, heading, and course/contact CTAs.                                                             | public IA e2e + screenshot review                        | `5/5`                   |
| UX flow clarity                               | `target`     | Primary and secondary CTAs stay visible and understandable on desktop and mobile; no dead-end state or navigation change is introduced.                                            | public IA e2e + before/after screenshots                 | `5/5`                   |
| Visual design quality                         | `target`     | Global tokens cover color, type, spacing, radius, and shadow; `/our-method` cards and CTAs consume tokenized classes with stable 8px card/control radius and no visible overlap.   | token unit test + computed-style e2e + screenshot review | `5/5`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because this slice changes no mutations, validation, persisted data, state transition, entitlement, or business truth.                                                         | diff review confirms UI/CSS/test/docs-only runtime scope | `N/A`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor surface, admin CRUD flow, or operator workflow is touched.                                                                                             | scope review                                             | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Existing semantic structure is preserved: one visible `h1`, ordered method steps, accessible CTA links, and no serious visual text collision in screenshot review.                 | public IA e2e + screenshot review                        | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | `/our-method` adds no dependency, no new image/media asset, no API call, and no broad client bundle expansion; route remains static with CSS-only visual changes.                  | package diff review + build/pre-pr gate                  | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because no local-only data, server-canonical data, browser storage, sync, conflict handling, or cache mutation is introduced.                                                  | data contract review                                     | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no fetch path, route cache mode, revalidation trigger, or invalidation behavior changes.                                                                               | cache scope review                                       | `N/A`                   |
| Reliability and failure handling              | `supporting` | Supporting only: route remains static and rollback is simple; no new loading, error, retry, or failure mode is created.                                                            | diff review + broad gates                                | `4/5`                   |
| Security and authz                            | `N/A`        | N/A because no protected route, auth boundary, cookie/token handling, input surface, or API route is changed.                                                                      | security scope review                                    | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data, analytics payload, consent/legal text, PII, logs, or raw env values are touched.                                                                         | privacy scope review                                     | `N/A`                   |
| Content governance                            | `supporting` | Supporting only: the canonical UX/UI queue is referenced and this child brief records the selected next slice; no public content source-of-truth model changes.                    | this brief + canonical queue reference                   | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, publish state, editability model, or role-gated mutation changes.                                                                                   | scope review                                             | `N/A`                   |
| SEO and crawlability                          | `supporting` | Supporting only: `/our-method` canonical route, metadata, sitemap behavior, and `/about` redirect must remain unchanged.                                                           | public IA e2e + diff review                              | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: public semantic structure for `/our-method` remains stable; no structured data or crawl-facing entity contract changes.                                           | public IA e2e + markup review                            | `4/5`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no event taxonomy, tracking payload, dashboard, funnel, or logging behavior changes.                                                                                   | analytics scope review                                   | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, entitlement, invoice, receipt, refund, payout, or revenue reporting behavior changes.                                                            | commerce scope review                                    | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this public visual-token slice changes no alert path, support workflow, recovery behavior, support diagnostics, or incident runbook.                                          | explicit support-ops scope rationale                     | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this slice changes no billing, reconciliation, finance report, payout, refund, invoice, entitlement, or provider financial data.                                              | explicit finance scope rationale                         | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A: this slice changes no user-facing product strings, locale routing, translation workflow, metadata text, or grammar-coupled copy contract.                                     | explicit i18n scope rationale                            | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Use Next/React route-local markup, existing `SiteChrome`/`PressLink`/`cx`, CSS custom properties, and Tailwind classes; add no dependency or parallel design library.              | diff review + package diff review                        | `5/5`                   |
| Testing and QA automation                     | `target`     | Add targeted token/unit coverage, public route e2e coverage, screenshot handoff before broad gates, then pass `npm run verify:pre-pr` and `npm run verify:pre-merge` before merge. | targeted tests + screenshot handoff + gate logs          | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: tokens reduce future repeated hard-coded styling; no runtime cost model or storage/resource usage changes.                                                        | CSS/token review                                         | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Change is reversible by reverting `app/globals.css`, `/our-method`, tests, and this brief; no migration, dependency, or release flag rollback is needed.                           | git diff review + pre-pr/pre-merge gates                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: the current `/our-method` public method page shipped by Public IA cleanup.
  - Reuse existing `SiteChrome`, `PressLink`, and route-local static markup.
  - Keep `/about` redirect, `/our-method` metadata, sitemap, auth, APIs, actions, and cache behavior unchanged.
- TypeScript/domain contracts:
  - No domain type, parser, mutation, validation, or error model changes.
  - Route-local data arrays may be introduced only for static display consistency.
- Supabase/data layer:
  - N/A; no schema, migration, RLS, authz, generated type, or storage path changes.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email, analytics, webhook, SDK, secret, or deployment setting changes.
- UI system:
  - Establish CSS custom properties in `app/globals.css` for brand colors, text scale, spacing, radius, and shadows.
  - Use the mature reference surfaces above as the design-quality bar for token choices.
  - Add a small set of reusable token-backed CSS utility classes.
  - Migrate only `/our-method` as proof; broader design-system rollout, including swim session builder, micro sessions, dryland training, habits, Poolside Guide, and PDF/print, stays out of scope.
  - Screenshot handoff type: `before/after` for `/our-method` desktop and mobile.
- Testing:
  - Unit test: token and utility contract in `app/globals.css`.
  - E2E test: public IA remains intact and proof-surface token radius is applied.
  - Screenshot handoff before `npm run verify:pre-pr`.

## Data Placement And Sync Contract

N/A with rationale: this slice introduces no local-only data, server-canonical data, browser storage, sync behavior, conflict policy, retention rule, sensitive data handling, cache invalidation, or route data fetch.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, or redirect behavior.

## Help / Guide Impact

N/A with rationale: this slice changes no admin/user workflow label, support recovery behavior, Help/Guide assertion, runbook instruction, auth flow, payment flow, or operator-facing support surface.

## Route / Label / Support Surface Sweep

Required because `/our-method` is a public route surface and this slice follows Public IA cleanup.

- Identifiers searched before PR handoff:
  - `/our-method`
  - `/about`
  - `Design token`
  - `fs-card`
  - `fs-cta-primary`
- Surfaces checked:
  - `app/`
  - `components/`
  - `tests/`
  - `docs/task-briefs/`
  - `docs/app-knowledge-book/`
  - `docs/runbooks/`
- Expected fallout:
  - no metadata/sitemap/docs route target change,
  - no Help/Guide update.

## Scope

- Create this in-progress child brief.
- Add CSS custom properties and small token-backed utility classes in `app/globals.css`.
- Migrate only `app/our-method/OurMethodClient.tsx` to token-backed cards/CTAs as proof.
- Add/update targeted tests for token contract and public IA proof.
- Capture `before/after` desktop and mobile screenshots for `/our-method`.

## Out Of Scope

- Full design-system migration.
- Migration of swim session builder, micro sessions, dryland training, habits, Poolside Guide, or PDF/print surfaces.
- PageTemplate, PageIntro, ContactForm, Plans, Course, auth, admin, member, checkout, or Help/Guide redesign.
- Route, redirect, sitemap, metadata, analytics, Supabase, Stripe, API, script, package, config, workflow, migration, or dependency changes.
- New visual assets.
- Merge to `main`.

## Acceptance Criteria

1. `app/globals.css` defines named design tokens for color, type, spacing, radius, and shadow.
2. Token-backed utilities are used by `/our-method` cards and CTAs.
3. `/about` still redirects to `/our-method`, and `/our-method` still exposes the same heading and public CTAs.
4. Desktop and mobile `/our-method` screenshots show stable layout with no overlapping text or clipped controls.
5. Targeted unit/e2e tests pass before screenshot handoff.
6. `npm run verify:pre-pr`, PR/CI, and `npm run verify:pre-merge` run only after owner screenshot approval.

## Validation

- Targeted:
  - `npx vitest run tests/unit/design-token-contract.test.ts`
  - `npx playwright test tests/e2e/public-ia.spec.ts --project=desktop-chromium`
  - `npm run lint:briefs`
  - `git diff --check`
- Screenshot:
  - `before/after` `/our-method` desktop and mobile screenshots in `output/design-token-foundation-YYYY-MM-DD-HHMMSS/`.
- Broad gates after screenshot approval:
  - `npm run verify:pre-pr`
  - PR required CI checks
  - `npm run verify:pre-merge`

## Checkpoint Log

- `2026-05-18 | branch aw-006-design-token-foundation-public-proof | post-merge preflight passed on clean main@7d0d1ab; selected Design token foundation from the canonical AW-006 UX/UI queue; captured before screenshots for /our-method | next: implement token foundation, targeted tests, after screenshots, then stop for owner screenshot approval before broad gates`
- `2026-05-18 | screenshot-review | implemented global fs design tokens and token-backed proof utilities, migrated only /our-method cards/CTAs to the token classes, kept mature swim session builder, micro sessions, dryland training, habits, Poolside Guide, and PDF/print surfaces as reference surfaces only, and added targeted token/public IA coverage; targeted validation passed with npx vitest run tests/unit/design-token-contract.test.ts, npx playwright test tests/e2e/public-ia.spec.ts --project=desktop-chromium after clearing stale .next-playwright CSS cache, npm run lint:briefs:all, and git diff --check; route-label/support sweep searched /our-method, /about, Design token, fs-card, and fs-cta-primary across app, components, tests, docs/task-briefs, docs/app-knowledge-book, and docs/runbooks with no route/support fallout; before/after screenshots captured in output/design-token-foundation-2026-05-18-080750 | next: owner screenshot approval before npm run verify:pre-pr, PR, CI, and npm run verify:pre-merge`
- `2026-05-18 | pre-pr | owner approved screenshot handoff; npm run verify:pre-pr passed full lane on branch aw-006-design-token-foundation-public-proof with branch-current check, quality gate, lint/typecheck/unit/build/perf/e2e gates green | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge recommendation`
