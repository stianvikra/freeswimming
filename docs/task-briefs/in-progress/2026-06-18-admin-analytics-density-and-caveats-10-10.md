# Task Brief: Admin Analytics Density And Caveats 10/10

## Metadata

- `id`: `2026-06-18-admin-analytics-density-and-caveats-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-18`
- `updated`: `2026-06-18`
- `parent_brief`: `docs/task-briefs/planned/2026-06-18-admin-readability-design-audit-10-10.md`
- `execution_mode`: `end-to-end after owner approval; visual screenshot approval stop before verify:pre-pr`

## Brief Audit Record

- `last_audited`: `2026-06-18`
- `base`: `main@a7056f2a`
- `audit_status`: `ready`
- `decision`: Execute this bounded child now after the post-merge admin re-audit selected Analytics density and caveat grouping as the best next implementation slice.
- `reason`: Post-merge screenshots show Admin Analytics is still a major whole-dashboard 10/10 blocker: desktop height is about `6466px`, caveats and paused-path interpretation copy dominate scan cost, while the route is otherwise read-only and safe to improve without API or data changes.
- `must_refresh_before_execution_if`: Refresh if `AdminAnalyticsDashboard`, `lib/analytics/admin-dashboard.ts`, `/api/admin/analytics/insights`, Admin Help/Guide Analytics copy, scorecard categories, screenshot handoff rules, route/label/support sweep rules, or analytics KPI interpretation contracts change before this PR lands.

## Goal

Make the Admin Analytics dashboard materially easier to scan by grouping related panels and moving detailed interpretation caveats into accessible progressive disclosure, while preserving all existing metrics, API contracts, privacy boundaries, and KPI meanings.

## Pre-Implementation Owner Explanation

Vi gjor Analytics-siden enklere aa lese. Tallene og forklaringene beholdes, men panelene grupperes etter jobb, og lange caveats legges bak tydelige detaljer som admin kan aapne ved behov.

Hvorfor det betyr noe: Analytics brukes til aa forstaa produkt- og supportsignaler. Naar siden er for lang og caveats dominerer, blir det vanskelig aa finne de viktige tallene raskt uten aa misforstaa dem.

Utenfor scope: ingen nye KPI-er, ingen API-endring, ingen database- eller event-taxonomi, ingen checkout/Stripe/finance-endring, ingen mobilnav-redesign og ingen raw analytics drilldown.

Forward compatibility: nye Analytics-paneler eller caveats skal arve samme synlige lese-regler og progressive disclosure-moenster, eller kreve eksplisitt mapping/test foer de kan bli egne KPI-moduler.

## Codex Skill And Stack Readiness Radar

Skill/capability audit:

- Available now: `playwright` for screenshot/browser evidence; standard repo Vitest/Playwright gates.
- Evaluate later: Stripe plugin only if future Analytics work changes checkout, billing, finance, products, entitlements, or revenue interpretation.
- Install/config changes: none.

Systemic findings:

| Surface                 | Finding                                                                                 | Severity | Recommended Type                 | Owner Decision Needed                    | Follow-Up Brief Path       |
| ----------------------- | --------------------------------------------------------------------------------------- | -------- | -------------------------------- | ---------------------------------------- | -------------------------- |
| Admin Analytics UI      | Analytics is privacy-safe but too tall and caveat-heavy for routine admin scanning.     | `high`   | `bounded implementation child`   | `no`; this brief owns it.                | this brief                 |
| Mobile admin navigation | Flat 11-tab admin navigation still hides most tabs on mobile.                           | `medium` | `deferred architecture decision` | `yes`; grouping changes admin IA.        | TBD after this child       |
| Performance budgets     | Trend still recommends tightening, but this UI slice should not change perf thresholds. | `low`    | `safe process/docs update`       | `no`, but separate perf slice preferred. | TBD perf-maintenance slice |

Return path:

- Parent: `docs/task-briefs/planned/2026-06-18-admin-readability-design-audit-10-10.md`
- Last merged workstream: PR `#1155` and docs-only closeout PR `#1156`.
- Current branch: `admin-analytics-density-caveats`.
- Next step after this child: screenshot approval, then verify/PR/CI/pre-merge; do not merge without explicit owner approval.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for this scoped 10/10 claim: Product goals and IA, UX flow clarity, Visual design quality, Accessibility (a11y), Business logic correctness and data integrity, Reliability and failure handling, Security and authz, Privacy and compliance, Analytics and KPI observability, Incident response and support operations, Stack-fit and dependency discipline, Testing and QA automation, DevOps and rollback readiness.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                     | Evidence                              | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Analytics sections are grouped by admin job, with a visible top-level reading contract before detailed panels.                                                         | screenshot review + component tests   | `5/5`                   |
| UX flow clarity                               | `target`     | Admin can see data health, core metrics, funnel, and reading rules before lower-frequency diagnostics; no dead-end loading/error/retry states regress.                 | unit/component tests + screenshots    | `5/5`                   |
| Visual design quality                         | `target`     | Desktop Analytics height is materially reduced from `6466px` baseline, mobile has no clipped text/overlap, and detailed caveats do not dominate default scan.          | after/reference screenshots + metrics | `5/5`                   |
| Business logic correctness and data integrity | `target`     | No metric values, rate formulas, API path, range behavior, list truncation, or unknown-value handling changes.                                                         | diff review + targeted tests          | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: Analytics is read-only, but admin scan cost and support handoff improve.                                                                              | screenshot review                     | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Progressive disclosure uses native accessible controls; keyboard/focus semantics remain valid and range/retry controls keep labels.                                    | component tests + screenshot QA       | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | No dependency, image, API, or route payload expansion; only existing JSX/Tailwind structure changes.                                                                   | package diff + build/verify gates     | `4/5`                   |
| Data placement and sync boundaries            | `supporting` | Server-canonical analytics data and local range/loading state remain unchanged.                                                                                        | diff review                           | `4/5`                   |
| Caching and invalidation strategy             | `supporting` | `/api/admin/analytics/insights` remains `GET`, `same-origin`, and `no-store`; refresh/range refetch behavior unchanged.                                                | component tests + diff review         | `4/5`                   |
| Reliability and failure handling              | `target`     | Loading, error, retry, schema-missing, no-data, quiet, and capped states remain deterministic after layout changes.                                                    | targeted component/view-model tests   | `5/5`                   |
| Security and authz                            | `target`     | No route/authz/service-role/API mutation changes; dashboard remains read-only admin surface.                                                                           | changed-files review + tests          | `5/5`                   |
| Privacy and compliance                        | `target`     | No raw payloads, emails, provider IDs, user drilldowns, finance truth, or row-level exports appear in UI/screenshots/tests.                                            | component tests + screenshot review   | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: no content publish/revision model changes; Analytics caveat copy remains source-controlled and tested.                                                | diff review                           | `4/5`                   |
| Admin workflow and editability                | `target`     | Read-only Analytics workflow keeps Refresh/range controls clear, with support diagnostics separated from routine metrics.                                              | screenshot review + component tests   | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A with scope rationale: authenticated admin-only UI; no public metadata, sitemap, robots, canonical, or crawlable page changes.                                      | private-admin scope review            | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A with scope rationale: no public AI-facing content, structured data, entity page, or crawl-safe semantic contract changes.                                          | private-admin scope review            | `N/A`                   |
| Analytics and KPI observability               | `target`     | KPI meanings and caveats stay explicit while detailed interpretation moves behind accessible disclosure; no new event taxonomy or KPI math.                            | tests + Help/Guide impact review      | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: copy must continue to separate product telemetry from purchase, Stripe, revenue, payout, invoice, reconciliation, and finance truth.                  | tests + screenshot review             | `4/5`                   |
| Incident response and support operations      | `target`     | Support can still find review-needed diagnostics, schema/freshness warnings, and finance/non-revenue caveats without reading a wall of prose by default.               | component tests + screenshot review   | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: no billing provider data, finance report, payout, refund, invoice, accounting export, entitlement grant, or reconciliation behavior changes. | finance no-change diff review         | `N/A`                   |
| i18n operational readiness                    | `target`     | Group labels and disclosure summaries use short copy that can expand without clipping on desktop/mobile screenshots.                                                   | screenshot review                     | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `AdminAnalyticsDashboard`, existing view-model, Tailwind tokens, native details, and existing tests; no new dependency.                                          | changed-files/package diff            | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted Vitest covers scan order, disclosure access, schema-missing, unsafe values, and no table regression; visual handoff captured before verify.                   | test output + screenshots             | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: grouping pattern should scale to future Analytics panels without route/API/query cost.                                                                | code review                           | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Small reversible UI/test/docs diff; rollback is normal git revert with no migration, config, package, or workflow changes.                                             | git diff + gates + PR evidence        | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse `components/admin/AdminAnalyticsDashboard.tsx`; do not introduce a new route or shell.
  - Preserve client component boundary and URL-driven admin tab behavior through `AdminWorkspace`.
  - Keep fetch path, range state, retry state, and `no-store` behavior unchanged.
- TypeScript/domain contracts:
  - Reuse `AnalyticsDashboardViewModel` from `lib/analytics/admin-dashboard.ts`.
  - No payload, event, KPI, or metric type change is expected.
  - Unknown/future values must keep existing safe labels and exclusion behavior.
- Supabase/data layer:
  - N/A for this child; no schema, RLS, migrations, generated types, storage, or service-role code.
- External services:
  - No Stripe, email, analytics vendor, webhook, finance, or provider SDK change.
- UI system:
  - Reuse current `fs-library-card`, `AdminManagerState`, labels, status chips, and existing typography tokens.
  - Use native `details` for caveat disclosure to avoid custom state and keep keyboard semantics.
  - Screenshot handoff is `after/reference`: changed Analytics desktop/mobile plus prior post-merge audit reference where useful.
- Testing:
  - Update component tests for grouping/disclosure and existing state guarantees.
  - Run targeted Vitest before screenshot capture, then wait for owner screenshot approval before `verify:pre-pr`.

## Data Placement And Sync Contract

- Server-canonical data: unchanged analytics insights from `/api/admin/analytics/insights`.
- Local data: unchanged selected range and loading/error state in `AdminAnalyticsDashboard`.
- Sync policy: unchanged; range changes and Refresh refetch the same `no-store` endpoint.
- Retention and sensitivity: unchanged; no raw event payloads, PII, provider IDs, or row-level export.
- Cache/invalidation: unchanged request uses `cache: "no-store"`.

## Identity And Rename Contract

- Canonical stable ID: analytics event names, product IDs, route keys, and view-model metric IDs remain unchanged.
- Human-readable identifiers: visible panel/group labels may be reorganized but must not redefine KPI meanings.
- Mutability rules: no machine ID or event meaning is renamed or repurposed.
- Rename vs repurpose policy: any future material KPI meaning change requires a new child and tests.
- Compatibility contract: existing `/admin?tab=analytics` links and API response contracts remain unchanged.
- Observability and repair: review-needed diagnostics remain visible and counted from existing view-model fields.

## Forward Compatibility Contract

- Extensibility surfaces: Analytics panels, caveats, event labels, product labels, route labels, range options, diagnostic buckets, locales.
- Source of truth: metrics and caveats still derive from `buildAnalyticsDashboardViewModel`; UI only groups and discloses existing fields.
- Additive behavior: future panels can join the same grouped sections and reuse the caveat disclosure pattern.
- Explicit mapping requirements: new dedicated KPI modules, products, checkout states, finance meanings, provider diagnostics, raw drilldowns, or exports need explicit brief/test/Help mapping.
- Unknown or deprecated values: keep existing safe fallback labels, exclude unsafe values from dedicated KPIs, and expose bounded `Needs review` diagnostics.
- Test/evidence: component tests must assert grouped scan order, disclosure access, unsafe-value redaction, and no API behavior change.

## Scope

- `components/admin/AdminAnalyticsDashboard.tsx`
- targeted `tests/unit/admin-analytics-dashboard.test.tsx`
- this child brief and parent checkpoint
- Help/Guide only if Analytics labels, support meaning, or workflow guidance changes materially

## Out Of Scope

- New KPI math, event taxonomy, vendor analytics, raw analytics drilldown, row export, finance reporting, checkout/Stripe behavior, entitlement logic, API response shape, database schema, Supabase policies, mobile admin IA redesign, broad dashboard redesign, and performance-budget threshold changes.

## Acceptance Criteria

1. Analytics desktop screenshot height is materially lower than post-merge audit baseline `6466px`, with no visible clipping or overlap.
2. Critical reading rules are visible near the top: selected-range event counts, not unique people, not purchases/revenue/finance, unknowns excluded.
3. Detailed panel caveats remain accessible with keyboard-friendly disclosure controls and are not lost from tests.
4. Existing metric values, range fetches, retry behavior, unsafe identifier redaction, schema-missing setup state, and top lists remain covered.
5. Route/label/support sweep confirms no stale Admin Analytics, caveat, finance, or Help/Guide fallout is introduced.
6. Screenshot handoff happens before `npm run verify:pre-pr`.

## Validation

- `npm run lint:briefs`
- `npx vitest run tests/unit/admin-analytics-dashboard.test.tsx tests/unit/admin-analytics-dashboard-view-model.test.ts`
- targeted route/label/support sweep for Analytics/caveat/finance wording
- screenshot handoff for Analytics desktop/mobile
- after owner screenshot approval: `npm run verify:pre-pr`
- PR CI
- before merge recommendation: `npm run verify:pre-merge`

## Help / Guide Impact

Expected `N/A` for Help/Guide runtime copy because this child should not change Analytics KPI meanings, recovery behavior, admin actions, or support procedures. If implementation changes visible Analytics labels or support interpretation beyond grouping/disclosure, update `AdminHelpCenter` and relevant tests in the same PR.

## Route / Label / Support Surface Sweep

Run before broad gates:

- `AdminAnalyticsDashboard`
- `analytics dashboard`
- `Caveats`
- `How to read`
- `not purchase`
- `revenue`
- `finance`
- `Stripe reconciliation`
- `unique people`
- `Needs review`
- `Help/Guide`
- `/admin?tab=analytics`

Check at minimum `app/`, `components/`, `lib/`, `tests/`, `docs/`, `docs/runbooks/`, `docs/checklists/`, planned/in-progress/done task briefs, and Admin Help/Guide assertions.

## Screenshot Handoff Plan

- Use `docs/runbooks/ui-debug-hypothesis-and-handoff.md`.
- Capture against local `http://127.0.0.1:3000` with `SITE_LOCK_ENABLED=0`.
- If `/dev/login` remains blocked by local Supabase egress guard, use the documented temporary local visual-harness fallback and remove it before handoff.
- Artifact folder: `output/admin-analytics-density-caveats-YYYY-MM-DD-HHMMSS`.
- Required screenshots:
  - `after-admin-analytics-desktop.png`
  - `after-admin-analytics-mobile.png`
  - `reference-admin-analytics-post-merge-desktop.png` if practical from the prior audit artifact

## Checkpoint Log

- `2026-06-18 | pre-pr gate passed | owner approved screenshot handoff; npm run verify:pre-pr passed full lane (lint, typecheck, 1619 unit tests, build, perf budgets, Playwright 110 passed / 568 skipped in local credential-limited profile); perf-budget trend again recommended tighten after 10 green runs, held out of this UI PR per scope and parent perf-maintenance note | next: commit, push, open PR, monitor CI, then run verify:pre-merge before merge`
- `2026-06-18 | screenshot approval stop | implemented grouped Admin Analytics scan order, visible reading rules, native caveat disclosures, and mobile two-column metric grids without changing API/view-model/KPI semantics; targeted Vitest, targeted ESLint, and lint:briefs:all passed; after/reference screenshots captured in output/admin-analytics-density-caveats-2026-06-18-154449 with desktop height 6466px -> 4714px and mobile height 9776px after density refinement; temporary local visual harness/script removed before handoff | next: wait for owner screenshot approval or visual corrections before verify:pre-pr`
- `2026-06-18 | child in progress | owner approved "ok kjor pa" after post-merge admin re-audit selected Admin Analytics density and caveat grouping as the next bounded child; branch admin-analytics-density-caveats created from main@a7056f2a; screenshot approval stop remains required before verify:pre-pr | next: implement grouped Analytics layout, targeted tests, and screenshot handoff`
