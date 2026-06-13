# Task Brief: Workout Context Paused Future-Ready Admin Analytics Copy V1 (10/10)

## Metadata

- `id`: `2026-06-13-workout-context-paused-future-ready-admin-analytics-copy-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-13`
- `updated`: `2026-06-13`
- `parent_brief`: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- `depends_on`:
  - `docs/task-briefs/done/2026-06-12-workout-context-save-success-poolside-cta-removal-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-12-workout-context-stage-summary-decline-denominator-rate-v1-10-10.md`
  - `docs/architecture/workout-context-cta-measurement-contract.md`
  - `docs/architecture/workout-checkout-attribution-finance-separation-contract.md`
- `execution_mode`: `end-to-end-after-explicit-execute`
- `branch`: `workout-context-historical-funnel-admin-copy-v1`

## Brief Audit Record

- `last_audited`: `2026-06-13`
- `base`: clean synced `main@33073499` after PR `#1107` removed the saved-workout Poolside guide success prompt, closeout PR `#1108` moved that child to done, and post-merge preflight was reported clean.
- `audit_status`: `ready`
- `decision`: Execute this bounded child now.
- `reason`: The saved-workout Poolside guide prompt is removed/deferred and has only test/readiness data for now, but Admin Analytics still needs to keep the measurement path future-ready without presenting it as active production funnel insight.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, task brief template, scorecard categories, Admin Analytics dashboard/view-model, Admin Help/Guide contracts, workout-context CTA contracts, or screenshot handoff rules change before this child closes.

## Goal

Make Admin Analytics describe the Poolside guide workout-context funnel as paused/future-ready measurement for a removed saved-workout prompt without changing analytics counts, checkout, entitlement, finance, product, or runtime prompt behavior.

## Pre-Implementation Owner Explanation

For ikke-programmerere: Vi beholder maleoppsettet i Admin Analytics, men teksten skal si at Poolside guide-flyten er pauset og future-ready. Det betyr at eier/support ikke skal tolke testdata eller tomme tall som aktiv produksjonsstatistikk.

Dette er viktig fordi knappen kan fa en bedre plassering senere, men dagens Admin-tall ikke skal leses som ekte aktiv salgsfunnel.

Utenfor scope er ny Poolside-prompt, dismiss tracking, direct checkout, priser, Stripe, entitlement-regler, finance, export/raw drilldown, vendor analytics, nye events og builder/generator-endringer.

Forward-compatibility-intent: Future Poolside prompts, products, placements, checkout paths, export formats, vendors, or finance signals must get explicit mapping/copy/tests before they are treated as active Admin Analytics KPI modules; unknown future values stay out of these paused readiness counts.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the 10/10 claim gate:

- Product goals and IA
- UX flow clarity
- Business logic correctness and data integrity
- Accessibility (a11y)
- Reliability and failure handling
- Privacy and compliance
- Analytics and KPI observability
- Commerce and revenue ops
- Incident response and support operations
- Finance and reporting operations
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                        | Evidence                                                     | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | Admin Analytics names and descriptions distinguish paused/future-ready Poolside measurement from active production funnel insight.                                        | view-model/UI tests + screenshot handoff                     | `5/5`                   |
| UX flow clarity                               | `target`     | Admin readers can tell the save-success prompt is no longer active and empty/test counts are expected until a new placement launches.                                     | copy assertions + screenshot review                          | `5/5`                   |
| Visual design quality                         | `target`     | Copy changes fit existing Admin Analytics panel structure without layout overlap or new visual language.                                                                  | component tests + desktop/mobile screenshots                 | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Counts, denominators, unknown buckets, and API response shape remain unchanged; only interpretation copy changes.                                                         | view-model tests + changed-files review                      | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this child adds no admin editor, CRUD, publish, placement config, or mutation workflow.                                                                       | explicit scope rationale                                     | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Headings and support text remain semantic, readable, and button-free; no new interactive control is added.                                                                | Testing Library role/query assertions + screenshot review    | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no new dependency, data fetch, route, image, font, vendor script, or chart is added.                                                                     | package/changeds-files review + pre-pr gate                  | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Existing server-canonical analytics aggregates remain read-only; no local state, cookie, visitor ID, or persisted preference is introduced.                               | data-boundary review                                         | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: Admin Analytics no-store read path is unchanged; copy changes do not add cache or invalidation behavior.                                                 | route/cache review                                           | `4/5`                   |
| Reliability and failure handling              | `target`     | Existing schema-missing/zero/unknown states remain deterministic and copy does not imply missing current runtime data is a failure.                                       | view-model zero/schema-missing tests                         | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no protected route/authz boundary changes; Admin Analytics remains viewer-gated by existing route.                                                       | changed-files review                                         | `4/5`                   |
| Privacy and compliance                        | `target`     | Copy continues to avoid raw payloads, user-level drilldown, unique people, revenue, provider IDs, or sensitive finance interpretation.                                    | tests/docs copy review                                       | `5/5`                   |
| Content governance                            | `target`     | Parent/child/docs/Help copy agree that the prompt is removed/deferred and future prompts need explicit mapping.                                                           | brief + Help/API/architecture sweep                          | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin action workflow, editable state, recovery action, role flow, or mutation is changed.                                                                 | explicit scope rationale                                     | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes protected admin copy only and no public route, metadata, sitemap, robots, canonical, or crawlable content.                                       | explicit SEO scope rationale                                 | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes protected admin copy only and no public semantic page, structured data, or crawl-safe public docs.                                               | explicit AI scope rationale                                  | `N/A`                   |
| Analytics and KPI observability               | `target`     | Dedicated Poolside workout-context metrics keep the same mapped counts while caveats clearly identify paused/future-ready meaning.                                        | view-model/component tests + Help copy                       | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Copy preserves separation from checkout completion, entitlement truth, revenue, Stripe reconciliation, refunds, payouts, invoices, and accounting evidence.               | copy assertions + commerce boundary review                   | `5/5`                   |
| Incident response and support operations      | `target`     | Help/support interpretation remains clear enough for operators to explain why the current save-success prompt is absent while paused readiness telemetry remains visible. | Help/Guide copy + support-surface sweep                      | `5/5`                   |
| Finance and reporting operations              | `target`     | Finance caveats stay explicit: paused prompt/funnel readiness analytics are not revenue, accounting, payouts, invoices, refunds, exports, or reconciliation truth.        | finance caveat copy + no finance/export changed-files review | `5/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: changed copy remains short and structurally localizable; no locale workflow is added.                                                                    | copy review                                                  | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Admin Analytics view-model, component, tests, and Help surface; add no dependency or new dashboard abstraction.                                            | changed-files/package diff                                   | `5/5`                   |
| Testing and QA automation                     | `target`     | Update targeted view-model/component/Help tests, run route/label/support sweep, capture screenshots, then run required broad gates after owner approval.                  | targeted Vitest + screenshot artifacts + later verify gates  | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no new query, rollup, warehouse, export, vendor forwarding, or row-level drilldown cost is introduced.                                                   | changed-files review                                         | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Copy-only/runtime-safe UI change is revertable without migration, config, dependency, provider, or schema rollback.                                                       | PR rollback notes + no migration/env/dependency evidence     | `5/5`                   |

## Stack / Architecture Best-Practice Gate

Skill/capability audit:

- Available now: repo task-brief patterns, scorecard, Admin Analytics view-model/component tests, Playwright screenshot tooling.
- Stripe plugin: not used because this child does not change Stripe, checkout sessions, webhooks, billing, refunds, payouts, invoices, or finance reconciliation.
- Install/config changes: none.

Systemic findings:

| Surface                         | Finding                                                                                                   | Severity | Recommended Type             | Owner Decision Needed | Follow-Up Brief Path |
| ------------------------------- | --------------------------------------------------------------------------------------------------------- | -------- | ---------------------------- | --------------------- | -------------------- |
| Admin Analytics copy            | Runtime removal landed, but dashboard copy should read as paused/future-ready, not active funnel insight. | medium   | bounded implementation child | no                    | this brief           |
| Future Poolside guide promotion | A replacement placement still needs product context and explicit mapping before runtime work starts.      | medium   | deferred product decision    | yes                   | TBD                  |
| Export/raw/vendor analytics     | Still valuable later, but too broad for this copy-alignment slice.                                        | low      | deferred architecture child  | yes                   | TBD                  |

React/Next.js:

- Reuse `components/admin/AdminAnalyticsDashboard.tsx` and `lib/analytics/admin-dashboard.ts`.
- Keep the existing Admin Analytics panel hierarchy, no new route/tab/chart/dependency.
- No server/client boundary or API shape change.

TypeScript/domain contracts:

- Keep `AnalyticsDashboardViewModel` shape unchanged.
- Keep event names, placement/product IDs, unknown buckets, and ratio denominators unchanged.
- Change only labels/details/caveats and matching tests.

Supabase/data layer:

- No migration, RLS change, generated type update, index, rollup, raw payload read, or export path.
- Existing `/api/admin/analytics/insights` read remains bounded and no-store.

External services/tools:

- No Stripe, provider, email, finance, vendor analytics, secret, or env-var change.

UI system:

- Reuse existing Admin Analytics cards, typography, and trust-state language.
- Screenshot handoff required because this changes visible Admin Analytics copy.
- Comparison type: `after/reference` against the existing Admin Analytics workout-context panels.

Testing:

- Update `tests/unit/admin-analytics-dashboard-view-model.test.ts`.
- Update `tests/unit/admin-analytics-dashboard.test.tsx`.
- Update `tests/unit/admin-help-center.test.tsx` if Help labels change.
- Run targeted Vitest before screenshot handoff.

## Data Placement And Sync Contract

- Server-canonical: persisted `analytics_events` rows and Admin Analytics aggregates remain the source of truth.
- Local/browser: no local analytics state, cookie, visitor ID, admin preference, prompt state, or dismissal state is added.
- Sync policy: no sync behavior changes; dashboard range changes keep existing bounded refetch behavior.
- Retention and sensitivity: existing analytics retention applies; no raw payload JSON, provider IDs, emails, IPs, user agents, checkout session IDs, finance records, or unique-user drilldown are exposed.
- Cache/invalidation: Admin Analytics remains `no-store`; no new invalidation behavior.

## Identity And Rename Contract

- Canonical stable IDs remain unchanged:
  - `upsell_presented`
  - `upsell_accepted`
  - `upsell_declined`
  - `checkout_started`
  - `checkout_completed`
  - `entitlement_granted`
  - `source=workout_context`
  - `placementId=workout_saved_post_success`
  - `productId=guide_poolside`
- Human-readable identifiers changed in scope:
  - Admin Analytics labels/details/caveats may be renamed to clarify paused/future-ready interpretation.
- Mutability rules:
  - Event/product/placement IDs remain append-only and are not reinterpreted.
- Rename vs repurpose:
  - Clarifying Admin copy is a rename.
  - Counting a new prompt, new placement, direct checkout, dismiss state, or finance value as active funnel insight under the existing paused module is repurpose and requires a new child.
- Compatibility contract:
  - Mapped rows continue to render in existing dedicated modules as paused readiness telemetry.
  - Unknown future products/placements/sources remain excluded from dedicated KPI counts until explicitly mapped.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Admin Analytics copy, workout-context CTA placements, product IDs, checkout paths, cancellation reasons, Help/Guide content, locales, export formats, vendors, and finance/reporting surfaces.
- Source of truth:
  - Dedicated counts come from `/api/admin/analytics/insights` mapped aggregates.
  - Current prompt availability comes from product/runtime callsites, not paused analytics copy.
- Additive behavior:
  - Existing mapped metrics keep rendering as paused readiness telemetry when rows exist.
  - Generic Admin Analytics lists may still show safe future events/dimensions where already supported.
- Explicit mapping requirements:
  - Future Poolside prompts, new products, placements, surfaces, reason keys, direct checkout, dismiss/decline KPIs, finance reporting, CSV/export, raw drilldown, vendor analytics, or localized commercial claims require explicit owner-approved mapping, tests, docs, and screenshot handoff.
- Unknown or deprecated values:
  - Unknown/unmapped workout-context values remain out of dedicated KPI counts and appear only in bounded review-needed states when already supported.
  - Missing prompt views produce "not counted" rates, not a claim that the current prompt should exist.
- Test/evidence:
  - Tests must assert paused/future-ready copy for nonzero, zero, and rendered Admin Analytics states.
  - Route/label/support sweep must cover Admin Analytics, Help/Guide, docs, tests, finance/revenue, and workout-context identifiers.

## Scope

- Update Admin Analytics workout-context stage summary, prompt, checkout handoff, checkout outcome, and checkout cancel copy where it implies current saved-workout prompt behavior.
- Update Admin Help/Guide labels only where needed to match dashboard naming.
- Update targeted tests.
- Update parent brief checkpoint/status for this active child.
- Capture screenshot handoff and stop for owner approval before `npm run verify:pre-pr`.

## Out Of Scope

- New runtime prompt, replacement placement, direct checkout, checkout/Stripe/webhook change, entitlement-rule change, product/pricing/catalog mutation, finance/revenue/reporting, export/raw drilldown, vendor analytics, migration, RLS, route creation, persistent opt-out, `cta_dismissed`, new event taxonomy, and builder/generator UX.
- Changing Admin Analytics counts, API response shape, denominators, aggregation queries, raw payload filtering, or support diagnostics.
- Merging without explicit owner approval.

## Acceptance Criteria

1. Admin Analytics copy identifies the Poolside workout-context prompt/stage data as paused/future-ready after the save-success prompt removal.
2. Zero-denominator copy says empty counts are expected while the save-success placement is paused.
3. Checkout handoff/completion/access/cancel copy remains bounded to mapped paused or future-ready saved-workout guide paths.
4. No API shape, event, payload, aggregation, checkout, entitlement, finance, export, vendor, migration, or product behavior changes.
5. Help/Guide labels and assertions stay aligned with dashboard copy.
6. Targeted tests pass.
7. Screenshot handoff is captured and owner-approved before `npm run verify:pre-pr`.

## Validation

Targeted before screenshot:

- `./node_modules/.bin/vitest run tests/unit/admin-analytics-dashboard-view-model.test.ts tests/unit/admin-analytics-dashboard.test.tsx tests/unit/admin-help-center.test.tsx`
- `npm run typecheck`
- `npm run lint:briefs:all`
- `npm run lint:quality-gates`
- route/label/support sweep
- `git diff --check`

After owner screenshot approval:

- `npm run verify:pre-pr`
- commit, push, open/update PR
- required CI checks green
- `npm run verify:pre-merge`

## Route / Label / Support Surface Sweep

Required before broad gates because this child changes Admin Analytics labels/caveats and support interpretation.

Search at minimum:

- `Poolside guide prompt`
- `Poolside guide stage summary`
- `saved-workout guide path`
- `prompt has been shown`
- `this prompt`
- `Saved workout`
- `workout_saved_post_success`
- `guide_poolside`
- `workoutContextCta`
- `workoutContextStageSummary`
- `checkout handoff`
- `checkout cancelled`
- `Admin Analytics`
- `Help/Guide`
- `finance`
- `revenue`
- `Stripe reconciliation`
- `export`
- `vendor analytics`

Check at minimum:

- `components/admin/`
- `lib/analytics/`
- `tests/unit/admin-*`
- `docs/api-contracts.md`
- `docs/architecture/`
- `docs/runbooks/`
- active/planned/done task briefs

Initial sweep result:

- Completed on 2026-06-13, then refreshed after the owner clarified the intended paused/future-ready interpretation.
- Command: `rg -n "Poolside guide prompt|Poolside guide stage summary|Poolside guide paused funnel|Poolside guide prompt readiness|Poolside guide checkout readiness|Poolside guide checkout cancel readiness|Poolside guide access readiness|Paused path|future-ready|readiness|paused|workout_saved_post_success|guide_poolside|workoutContextCta|workoutContextStageSummary|checkout handoff|checkout cancelled|Admin Analytics|Help/Guide|finance|revenue|Stripe reconciliation|export|vendor analytics|historical|Historical" components/admin lib/analytics tests/unit docs/api-contracts.md docs/architecture docs/runbooks docs/task-briefs/planned docs/task-briefs/in-progress docs/task-briefs/done`
- Identifiers searched: `Poolside guide prompt`, `Poolside guide stage summary`, `Poolside guide paused funnel`, `Poolside guide prompt readiness`, `Poolside guide checkout readiness`, `Poolside guide checkout cancel readiness`, `Poolside guide access readiness`, `Paused path`, `future-ready`, `readiness`, `paused`, `workout_saved_post_success`, `guide_poolside`, `workoutContextCta`, `workoutContextStageSummary`, `checkout handoff`, `checkout cancelled`, `Admin Analytics`, `Help/Guide`, `finance`, `revenue`, `Stripe reconciliation`, `export`, `vendor analytics`, `historical`, and `Historical`.
- Surfaces checked: `components/admin/`, `lib/analytics/`, `tests/unit/`, `docs/api-contracts.md`, `docs/architecture/`, `docs/runbooks/`, `docs/task-briefs/planned/`, `docs/task-briefs/in-progress/`, and `docs/task-briefs/done/`.
- Fallout handled: Admin Analytics panel labels/details/caveats, Admin Help/Guide labels, targeted assertions, and parent/child brief status were updated to paused/future-ready readiness language. Existing API/architecture contract references still describe the durable aggregate shape and finance/checkout boundaries, so no API response, event taxonomy, checkout, entitlement, export, vendor, finance, or raw-drilldown changes were needed. Remaining `historical` references are in old parent checkpoint context, API contract history/boundary wording, or unrelated Help history controls.

## Help / Guide Impact

- Required if panel labels change.
- Help/Guide must continue to say the current workout save success surface no longer shows the prompt and these paused readiness values are not active production conversion, purchases, access grants, revenue, accounting records, Stripe reconciliation, finance reporting, or unique people.

## Screenshot Handoff Plan

- Required because this is visible Admin Analytics UI copy.
- Comparison type: `after/reference`.
- Required representative screenshots:
  - Admin Analytics workout-context panels desktop after copy change.
  - Admin Analytics workout-context panels mobile after copy change.
  - Reference surrounding Admin Analytics Help/Guide or existing commercial panel where practical.
- Stop after screenshot handoff for owner approval before `npm run verify:pre-pr`.

Captured screenshot evidence:

- Captured: `2026-06-13 08:53`
- Screenshot artifacts: `output/playwright/workout-context-paused-future-ready-admin-copy-2026-06-13-085319`
- Files:
  - `after-workout-context-admin-analytics-desktop.png`
  - `after-workout-context-admin-analytics-mobile.png`
  - `reference-admin-help-analytics-desktop.png`
  - `reference-admin-help-buttons-desktop.png`
- Comparison type: `after/reference`.
- Visual caveat: local `/admin?tab=analytics` redirects to sign-in, so capture used a temporary local visual harness that rendered the real Admin Analytics and Help/Guide components with deterministic zero/readiness mocked analytics API data. The temporary harness route and capture script were removed after screenshots were captured.

## Checkpoint Log

- `2026-06-13 | in-progress | created and started this child from clean main@33073499 after PR #1107 and closeout PR #1108; scope is Admin Analytics historical/deferred copy only, with no count/API/event/checkout/Stripe/entitlement/finance/export/vendor/product/builder changes | next: implement copy/tests/docs, run targeted validation, capture screenshot handoff, and stop before verify:pre-pr`
- `2026-06-13 | targeted validation passed | updated Admin Analytics view-model/panel copy, Admin Help/Guide labels, tests, parent status, and route/label/support sweep evidence; targeted Vitest, npm run typecheck, npm run lint:briefs:all, npm run lint:quality-gates, and git diff --check passed. No count/API/event/checkout/Stripe/entitlement/finance/export/vendor/product/builder behavior changed | next: capture screenshot handoff and stop for owner approval before verify:pre-pr`
- `2026-06-13 | screenshot handoff ready | captured after/reference screenshots in output/playwright/workout-context-historical-admin-copy-2026-06-13-083514 at 08:35 via temporary local visual harness; verified desktop, mobile, and Help/Guide reference images, then removed the temporary harness route and capture script. Re-ran targeted Vitest, npm run typecheck, npm run lint:briefs:all, npm run lint:quality-gates, and git diff --check successfully | next: owner screenshot approval, then run npm run verify:pre-pr`
- `2026-06-13 | owner scope clarification pivot | owner confirmed the measurement setup should remain available for a possible future Poolside placement, but current Admin copy must not present it as active statistics because current rows are only test/readiness data. Pivoted labels/details/caveats/tests/brief from historical/deferred to paused/future-ready readiness language, with no count/API/event/checkout/Stripe/entitlement/finance/export/vendor/product/builder behavior changed | next: recapture screenshots and stop for owner approval before verify:pre-pr`
- `2026-06-13 | paused screenshot handoff ready | captured after/reference screenshots in output/playwright/workout-context-paused-future-ready-admin-copy-2026-06-13-085319 at 08:53 via temporary local visual harness with zero/readiness mock data; verified desktop, mobile, and Help/Guide reference images, then removed the temporary harness route and capture script. Targeted Vitest, npm run typecheck, npm run lint:briefs:all, npm run lint:quality-gates, and git diff --check passed before capture | next: owner screenshot approval, then run npm run verify:pre-pr`
- `2026-06-13 | pre-pr passed | owner approved screenshots and merge on good tests; renamed the local branch to workout-context-paused-future-ready-admin-copy-v1 and passed npm run verify:pre-pr full lane with branch-current, lint, quality gates, typecheck, unit, build, performance budgets, and Playwright E2E. No scoped product-rendering source changed after the final approved screenshot capture, and no count/API/event/checkout/Stripe/entitlement/finance/export/vendor/product/builder behavior changed | next: commit, push, open/update PR, monitor CI, run verify:pre-merge, and merge if green`
