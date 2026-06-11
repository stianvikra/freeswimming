# Task Brief: Workout Context CTA Admin Analytics Mapping V1 (10/10)

## Metadata

- `id`: `2026-06-11-workout-context-cta-admin-analytics-mapping-v1-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-11`
- `updated`: `2026-06-11`
- `parent_brief`: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- `depends_on`:
  - `docs/task-briefs/done/2026-06-11-workout-context-cta-measurement-contract-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-11-workout-context-cta-runtime-event-callsites-v1-10-10.md`
  - `docs/architecture/workout-context-cta-measurement-contract.md`
- `execution_mode`: `end-to-end-after-explicit-implement`
- `branch`: `workout-context-cta-admin-analytics-mapping-v1`

## Brief Audit Record

- `last_audited`: `2026-06-11`
- `base`: clean synced `main@e31d2d19` after PR `#1073` closed the Workout Context CTA Runtime + Event Callsites V1 brief and `npm run post-merge:preflight` was reported clean.
- `audit_status`: `ready`
- `decision`: Execute this child as the next bounded slice under the workout commercial analytics parent.
- `reason`: Runtime CTA presentation/click callsites now exist for `placementId=workout_saved_post_success`, `productId=guide_poolside`, and `source=workout_context`; Admin Analytics still needs a separate read-only mapping so those events are not mixed with existing `/plans` and My Library upsell baseline metrics.
- `must_refresh_before_execution_if`: Refresh before continuing if AGENTS.md, task brief lint rules, scorecard categories, `ANALYTICS_EVENT_NAMES`, `analytics_events` schema, `lib/analytics/workout-builder.ts`, `lib/analytics/admin-insights.ts`, `lib/analytics/admin-dashboard.ts`, `components/admin/AdminAnalyticsDashboard.tsx`, Admin Help/Guide copy, `docs/api-contracts.md`, the workout-context CTA measurement contract, or screenshot handoff rules change.

## Goal

Add read-only Admin Analytics visibility for the shipped workout-context CTA so admins can see shown count, click count, and click rate for the mapped saved-workout CTA without implying checkout, access, revenue, Stripe, or finance truth, using visible copy that non-technical admins can understand without machine IDs.

## Pre-Implementation Owner Explanation

Vi tar CTA-en som allerede vises etter at en workout er lagret, og gjor tallene synlige i Admin Analytics. Det betyr at admin kan se hvor ofte CTA-en ble vist, hvor ofte den ble klikket, og klikkraten for akkurat `workout_saved_post_success` / `guide_poolside`. Dette matters fordi vi trenger trygg interesse-maling for vi vurderer mer kommersiell jobb. Utenfor scope er ny CTA, `upsell_declined`, checkout, Stripe, entitlement, revenue, finance, export/CSV, raw drilldown, nye ruter, migrasjoner/RLS, produktkatalog-endringer og nye CTA-plasseringer.

Forward-compatibility-intent: nye placements, produkter eller `upsell_*`-betydninger skal ikke telles i denne dedikerte modulen for de er eksplisitt mappet med tester, Help/Guide-kopi og supporttolkning; ukjente verdier skal holdes separat som trygge diagnoser eller utenfor KPI-er.

Admin-readable copy requirement: visible Admin Analytics and Help/Guide copy must explain what an admin can do with the number in plain language. Technical terms and machine identifiers such as `placementId`, `productId`, `source`, `mapping`, `KPI`, `workout_saved_post_success`, `guide_poolside`, and `workout_context` may remain in API contracts, architecture docs, tests, and secondary diagnostics, but they must not be the primary visible explanation in the admin UI.

## Product Decision

- Dashboard module: `Workout-context CTA` inside the existing read-only Admin Analytics dashboard.
- Counted placement: `workout_saved_post_success` only.
- Counted product: `guide_poolside` only.
- Counted source: `workout_context` only.
- Counted events:
  - `upsell_presented`: CTA rendered in the mapped saved-workout post-success state.
  - `upsell_accepted`: user clicked the mapped CTA.
- Not counted:
  - `upsell_declined` because workout-context decline semantics are not defined.
  - Existing `/plans` and My Library commercial surfaces, which remain in `existingUpsellBaseline`.
  - Checkout, entitlement, Stripe, revenue, refunds, invoices, finance reporting, exports, and user-level attribution.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the 10/10 claim gate:

- Product goals and IA
- Visual design quality
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Analytics and KPI observability
- Commerce and revenue ops
- Incident response and support operations
- Finance and reporting operations
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                         | Evidence                                                        | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Admin Analytics separates workout-context CTA metrics from existing `/plans` and My Library upsell baseline so product decisions use the right context.                                                    | Admin view-model/UI tests + screenshot handoff                  | `5/5`                   |
| UX flow clarity                               | `target`     | Admin-facing labels and explanations must be readable by non-technical admins, use plain meanings like shown/clicked/needs review, and avoid machine IDs as primary UI copy.                               | Admin dashboard copy tests + Help/Guide assertion + screenshots | `5/5`                   |
| Visual design quality                         | `target`     | Reuse the existing Admin Analytics panel/card language, avoid new chart dependencies, and keep desktop/mobile layout stable.                                                                               | component tests + screenshot artifacts                          | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Count only mapped `upsell_presented`/`upsell_accepted` rows with safe `placementId=workout_saved_post_success`, `productId=guide_poolside`, and `source=workout_context`; zero denominator is not counted. | `admin-insights` and dashboard view-model tests                 | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice adds no admin editor, placement config, CRUD flow, publish workflow, or editable CTA setting.                                                                                       | explicit scope rationale                                        | `N/A`                   |
| Accessibility (a11y)                          | `target`     | New dashboard panel keeps semantic section heading, readable metric labels, no keyboard trap, and no hidden interactive controls.                                                                          | Testing Library role/text assertions + screenshot/manual review | `5/5`                   |
| Accessibility                                 | `target`     | Closeout validation alias for the same accessibility gate above; the dashboard module remains read-only and semantically labeled.                                                                          | Testing Library role/text assertions + screenshot/manual review | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency, chart library, route, migration, or vendor script; aggregate response remains bounded by existing row cap.                                                                              | package diff + pre-PR gate                                      | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Reads remain server-canonical aggregate analytics rows through `/api/admin/analytics/insights`; no local/admin state or commerce truth is created.                                                         | data contract review + route tests                              | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: Admin Analytics remains `no-store`; no cache or revalidation behavior changes.                                                                                                            | route/cache review                                              | `4/5`                   |
| Reliability and failure handling              | `target`     | Empty ranges, unknown/unmapped values, capped reads, schema-missing state, and fetch failure produce deterministic trust/caveat states without raw payload exposure.                                       | negative-path tests + schema-missing UI coverage                | `5/5`                   |
| Security and authz                            | `target`     | Existing admin insight route remains viewer-gated and fail-closed; this child does not widen data access.                                                                                                  | existing authz route tests + changed-files review               | `5/5`                   |
| Privacy and compliance                        | `target`     | Dashboard returns and renders only bounded counts/labels; no raw payload JSON, workout IDs/text, emails, IPs, URLs, user agents, Stripe IDs, or payment data.                                              | payload filtering tests + rendered-label tests                  | `5/5`                   |
| Content governance                            | `target`     | Help/Guide, API contract, architecture/support caveats, parent checkpoint, and child brief align on what CTA metrics mean and do not mean, with primary admin copy written for non-technical operators.    | docs updates + route/label/support sweep + copy tests           | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin mutation, editable placement workflow, role-gated action, or publish path changes.                                                                                                    | explicit scope rationale                                        | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this protected Admin Analytics change adds no public route, metadata, sitemap, canonical URL, structured data, or crawlable content.                                                           | explicit SEO scope rationale                                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this protected admin-only dashboard change adds no public semantic page, public docs page, structured data, or AI-facing crawl surface.                                                        | explicit AI-discoverability scope rationale                     | `N/A`                   |
| Analytics and KPI observability               | `target`     | Expose presentation count, accepted/click count, accepted rate, and unknown/unmapped diagnostics for the mapped workout-context CTA only.                                                                  | admin-insights/view-model/component tests                       | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Copy and caveats explicitly separate CTA visibility/clicks from checkout start/completion, entitlement, Stripe reconciliation, revenue, refunds, payouts, invoices, and finance truth.                     | Help/Guide/API copy + tests                                     | `5/5`                   |
| Incident response and support operations      | `target`     | Support can explain empty, unknown, capped, stale, schema-missing, failed-read, duplicate, and non-finance states for the CTA module.                                                                      | Help/Guide/runbook copy + route/label/support sweep             | `5/5`                   |
| Finance and reporting operations              | `target`     | CTA metrics remain product telemetry only and cannot be used as revenue, refund, payout, invoice, accounting export, entitlement, Stripe reconciliation, or finance reporting.                             | finance caveat copy + docs tests                                | `5/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: machine IDs remain locale-independent and labels are short; full localization workflow remains future scope.                                                                              | copy review + explicit future mapping rule                      | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `lib/analytics/admin-insights.ts`, `lib/analytics/admin-dashboard.ts`, `components/admin/AdminAnalyticsDashboard.tsx`, and existing tests; add no dependency.                                        | changed-files/package diff + tests                              | `5/5`                   |
| Testing and QA automation                     | `target`     | Add targeted unit/component coverage, run `npm run lint:briefs`, targeted Vitest, screenshot handoff, then `npm run verify:pre-pr` after owner screenshot approval.                                        | test output + screenshot artifacts + verify gates               | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: mapping reuses bounded row-cap aggregate reads and low-cardinality dimensions; no rollup/export/warehouse path changes.                                                                   | query review + no dependency/migration evidence                 | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: additive dashboard mapping is revertable without migration/provider/env changes; rollback is removing the module and mapping.                                                             | PR rollback notes + no migration/dependency evidence            | `4/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse `components/admin/AdminAnalyticsDashboard.tsx` and the existing read-only Admin Analytics card/list pattern.
  - Keep the client boundary unchanged; no new route, tab, action, server component, chart dependency, or navigation flow is added.
  - `/api/admin/analytics/insights` remains the only data source and keeps `no-store`.
- TypeScript/domain contracts:
  - Use existing typed event names `upsell_presented` and `upsell_accepted`.
  - Reuse workout-context constants from `lib/analytics/workout-builder.ts` for source, placement, and product identity.
  - Derive ratios deterministically with `null` for zero denominator.
  - Keep unknown/unmapped CTA rows separate from dedicated KPI counts.
- Supabase/data layer:
  - No migration, RLS change, generated type update, rollup job, index, raw drilldown, or export path.
  - Aggregation reads existing `analytics_events` rows and never returns raw payload JSON to Admin UI.
- External services/tools:
  - No Stripe API, Checkout Session, webhook, billing portal, entitlement, finance, vendor analytics, SDK, secret, or env-var change.
- UI system:
  - Reuse existing Admin Analytics metric panel language and trust/caveat states.
  - Primary visible labels must use plain admin language. Technical IDs may be kept in API/docs/tests and secondary support diagnostics only.
  - Provide screenshot handoff for desktop and mobile Admin Analytics after targeted QA, then stop for owner approval before `npm run verify:pre-pr`.
- Testing:
  - Add unit tests for mapped, unknown, zero-denominator, and privacy paths in `admin-insights`.
  - Add component/view-model tests for rendered Admin Analytics panel, schema-missing state, unsafe labels, and caveats.
  - Update Help/Guide assertions and docs contract tests where relevant.

## Data Placement And Sync Contract

- Server-canonical:
  - Persisted `analytics_events` rows and bounded aggregate response from `/api/admin/analytics/insights`.
- Local/browser:
  - No new local analytics identity, admin preference, localStorage, cookie, or user-to-public attribution bridge.
- Sync policy:
  - Admin dashboard range changes refetch the same bounded endpoint.
  - Client CTA events remain best-effort and may duplicate; dashboard copy must say counts are product telemetry, not unique users.
- Retention and sensitivity:
  - Existing analytics retention/rollup lifecycle applies.
  - Dashboard must not return or render raw workout text, workout IDs, emails, user IDs, visitor IDs, IPs, user agents, raw URLs/referrers, payment data, Stripe IDs, support messages, free text, or raw payload JSON.
- Cache/invalidation:
  - `/api/admin/analytics/insights` remains `no-store`.
  - No new cache invalidation or revalidation behavior.

## Identity And Rename Contract

- Canonical stable IDs:
  - `placementId`: `workout_saved_post_success`.
  - `productId`: `guide_poolside`.
  - `source`: `workout_context`.
  - `event_name`: `upsell_presented` and `upsell_accepted`.
- Human-readable identifiers:
  - Dashboard labels, Help/Guide copy, product title, and route labels are display-only and renameable when meaning is unchanged.
- Mutability rules:
  - The mapped placement/product/source identity is write-once for this dashboard module.
  - Event meanings are append-only and must not redefine existing `/plans` or My Library baseline meanings.
- Rename vs repurpose:
  - Copy-only clarity is a rename.
  - Counting a new placement/product/source, adding decline semantics, or treating clicks as checkout/finance truth is repurpose and requires a new child.
- Compatibility contract:
  - Unknown, deprecated, inactive, unavailable, or unmapped placement/product/source values do not affect the dedicated CTA KPI counts.
  - Unknown values may appear only as safe aggregate diagnostics.
- Observability and repair:
  - Unknown/unmapped rows remain visible through a bounded count/caveat, not raw payload drilldown.
  - Support copy explains that unknown rows need explicit review before they become main dashboard numbers.

## Forward Compatibility Contract

- Extensibility surfaces:
  - CTA placements, product IDs, product availability, event payload dimensions, route labels, Admin Analytics modules, Help/Guide copy, locales, export formats, vendor forwarding, checkout attribution, entitlement states, and finance/reporting surfaces.
- Source of truth:
  - Event names come from `ANALYTICS_EVENT_NAMES`.
  - Placement/product/source identity comes from `lib/analytics/workout-builder.ts` and the measurement contract.
  - Admin counts come from `/api/admin/analytics/insights`.
- Additive behavior:
  - Generic top-event/product lists continue to show safe future events/products.
  - Existing `/plans` and My Library upsell baseline remains separate and keeps working.
- Explicit mapping requirements:
  - New CTA placements, new products, `upsell_declined`, checkout attribution, entitlement-aware targeting, finance reporting, CSV/export, raw drilldown, vendor analytics, localized commercial claims, or public landing/SEO copy require a new child.
- Unknown or deprecated values:
  - Unknown/unmapped workout-context values are excluded from the dedicated KPI counts and shown only as safe diagnostics.
  - Unknown values must not imply conversion, checkout completion, entitlement, revenue, or finance truth.
- Test/evidence:
  - Tests must cover mapped rows, unknown placement/product/source rows, zero denominator, schema-missing state, unsafe payload exclusion, and route/label/support sweep evidence.

## Scope

- Add a `workoutContextCta` aggregate to Admin Analytics insights for the mapped workout-context CTA.
- Add a dashboard view-model and read-only Admin Analytics panel for shown count, clicked count, click rate, and unknown/unmapped diagnostics.
- Keep existing `existingUpsellBaseline` scoped to `/plans` and My Library current surfaces.
- Polish touched Admin Analytics and Help/Guide labels so non-technical admins can understand the main dashboard without reading machine IDs.
- Update Help/Guide, API/architecture docs, parent brief checkpoint, and this child checkpoint.
- Add/update targeted unit/component tests.
- Capture screenshot handoff and stop for owner approval before `npm run verify:pre-pr`.

## Out Of Scope

- Runtime CTA changes or new CTA placements.
- `upsell_declined` semantics or dismiss/cancel tracking for workout context.
- Checkout, Stripe, webhook, billing portal, entitlement, claim, finance, accounting, refund, payout, invoice, reconciliation, vendor analytics, export, CSV, raw drilldown, migration, RLS, route creation, product catalog mutation, new pricing, or builder/generator algorithm changes.
- Treating CTA presentation/click as checkout completion, entitlement, revenue, unique-user conversion, or finance truth.
- Merging without explicit owner approval.

## Acceptance Criteria

1. `/api/admin/analytics/insights` returns a bounded `workoutContextCta` aggregate.
2. The aggregate counts only mapped rows with `source=workout_context`, `placementId=workout_saved_post_success`, and `productId=guide_poolside`.
3. `upsell_presented` increments presentations, `upsell_accepted` increments accepted/clicked intent, and accepted rate is `accepted / presented` or not counted when presentations are zero.
4. Unknown/unmapped workout-context rows are excluded from dedicated KPI counts and surfaced only as safe aggregate diagnostics.
5. Existing `/plans` and My Library upsell baseline metrics remain unchanged and do not count workout-context rows.
6. Admin dashboard renders a read-only workout-context CTA panel with clear non-finance caveats.
7. Visible Admin Analytics and Help/Guide copy uses non-technical admin language for touched funnel modules; technical IDs are kept out of primary UI explanations.
8. Help/Guide and API/support docs explain what the metrics mean and do not mean.
9. Tests cover mapped, unknown, zero-denominator, schema-missing, unsafe-label, and Help/Guide paths.
10. Screenshot handoff is captured with desktop/mobile artifacts and owner approval is received before `npm run verify:pre-pr`.

## Validation

Targeted during implementation:

- `npm run lint:briefs`
- Relevant Vitest tests for `admin-insights`, `admin-dashboard`, `AdminAnalyticsDashboard`, and Admin Help/Guide
- Route/label/support sweep for workout-context CTA labels and finance/checkout caveats
- `git diff --check`
- Screenshot handoff for Admin Analytics desktop/mobile

After owner screenshot approval:

- `npm run verify:pre-pr`
- push branch and open/update PR
- required CI checks green
- `npm run verify:pre-merge`

## Route / Label / Support Surface Sweep

Run before broad gates because this child adds visible Admin Analytics copy and support interpretation.

Identifiers searched:

- `workoutContextCta`
- `Workout-context CTA`
- `workout_saved_post_success`
- `guide_poolside`
- `workout_context`
- `upsell_presented`
- `upsell_accepted`
- `upsell_declined`
- `checkout_started`
- `checkout_completed`
- `entitlement_granted`
- `Admin Analytics`
- `Help/Guide`
- `Stripe`
- `finance`
- `revenue`
- `raw drilldown`
- `export`

Surfaces checked:

- `app/`
- `components/admin/`
- `lib/analytics/`
- `tests/unit/`
- `docs/api-contracts.md`
- `docs/architecture/`
- `docs/runbooks/`
- active/planned/done task briefs

## Screenshot / Visual Impact

Required because this slice changes visible Admin Analytics UI.

- Comparison type: `after/reference`, comparing the new panel to existing Admin Analytics panel language.
- Required screenshots: desktop and mobile after-state for Admin Analytics with the new module visible; include a schema-missing or empty-state artifact when practical.
- Artifact folder: `output/workout-context-cta-admin-analytics-YYYY-MM-DD-HHMMSS`.
- Stop point: owner screenshot approval is required before `npm run verify:pre-pr`, PR creation, or merge-readiness gates.

## Checkpoint Log

- `2026-06-11`: Branch `workout-context-cta-admin-analytics-mapping-v1` created from clean `main@e31d2d19`; child brief opened in `in-progress`.
- `2026-06-11`: Implemented bounded `workoutContextCta` Admin Analytics aggregate, dashboard view-model/panel, Help/Guide/API/architecture docs, parent checkpoint, and targeted tests. Validation passed: `npm run lint:briefs:all`, `git diff --check`, `npm run typecheck`, and `./node_modules/.bin/vitest run tests/unit/admin-analytics-insights.test.ts tests/unit/admin-analytics-dashboard-view-model.test.ts tests/unit/admin-analytics-dashboard.test.tsx tests/unit/admin-help-center.test.tsx`. Route/label/support sweep ran across `app/`, `components/`, `lib/analytics/`, `tests/unit/`, `docs/api-contracts.md`, `docs/architecture/`, `docs/runbooks/`, and active/planned/done task briefs for workout-context CTA identifiers plus checkout/entitlement/Stripe/finance/revenue/export/raw-drilldown caveats. Expected fallout is limited to Admin Analytics aggregate/view-model/UI, Help/Guide/API/architecture docs, parent/child briefs, and tests; no checkout, Stripe, entitlement, finance, export, raw drilldown, migration, RLS, route, product catalog, runtime CTA, or builder/generator algorithm scope was added. Next: capture screenshot handoff and wait for owner visual approval before `npm run verify:pre-pr`.
- `2026-06-11`: Owner flagged that visible Admin Analytics copy was too technical for non-programmer admins. Added explicit admin-readable copy requirement to this child before pre-PR, and expanded active scope to polish touched Admin Analytics/Help Guide wording while keeping API/docs/tests technical contracts intact. Next: update visible copy, tests, and regenerate screenshots.
- `2026-06-11`: Polished touched Admin Analytics and Help/Guide copy to use admin-readable labels such as Shown, Clicked, Click rate, Needs review, Current sales prompts, Poolside guide prompt, Manual vs generated workouts, Generated sessions, and Template starts. Technical IDs remain in API/contracts/tests and secondary diagnostics only. Targeted validation passed: `./node_modules/.bin/vitest run tests/unit/admin-analytics-insights.test.ts tests/unit/admin-analytics-dashboard-view-model.test.ts tests/unit/admin-analytics-dashboard.test.tsx tests/unit/admin-help-center.test.tsx`. Next: rerun typecheck/brief lint/diff check, regenerate screenshot handoff, and wait for owner visual approval before `npm run verify:pre-pr`.
- `2026-06-11`: Validation before screenshot stop passed: `npm run typecheck`, `npm run lint:briefs:all`, and `git diff --check`. Regenerated after/reference screenshot artifacts at `output/workout-context-cta-admin-analytics-2026-06-11-141620`; temporary screenshot harness/script were removed after capture, and no scoped product-rendering files changed after final capture. Next: owner visual approval or copy corrections before `npm run verify:pre-pr`.
- `2026-06-11`: Owner reviewed `after-workout-context-cta-desktop`, asked what the Needs review caveat means, and requested removal of the Shown/Clicked/Click rate metric detail lines. Removed `Guide prompt shown after saving`, `Clicked guide prompt`, and `Clicked / shown` from the Poolside guide prompt panel while keeping the Needs review label and caveat unchanged. Regenerated after/reference screenshots at `output/workout-context-cta-admin-analytics-2026-06-11-142708`; temporary capture harness/script were removed after capture, and no scoped product-rendering files changed after final capture. Next: final targeted QA and owner visual approval before `npm run verify:pre-pr`.
- `2026-06-11`: Owner approved the regenerated screenshot handoff, and `npm run verify:pre-pr` passed the full lane with quality gates, typecheck, unit tests, build, performance budgets, and Playwright. No scoped product-rendering files changed after the final approved screenshot capture. Next: commit, push, open/update PR, monitor CI, and run `npm run verify:pre-merge`.

## Completion Record

- `completed`: `2026-06-11`
- `merged_pr`: `#1074`
- `squash_commit`: `f7af4d9d`
- `result`: Closed Workout Context CTA Admin Analytics Mapping V1. Admin Analytics now shows a separate, admin-readable Poolside guide prompt panel for the saved-workout CTA, counts only the approved shown/clicked/click-rate signals, keeps review-needed rows out of the main numbers, and preserves the separation from checkout, access, Stripe, revenue, and finance truth.
- `validation`: Targeted Vitest for admin insights/dashboard/help, `npm run typecheck`, `npm run lint:briefs:all`, `git diff --check`, owner-approved screenshot handoff at `output/workout-context-cta-admin-analytics-2026-06-11-142708`, `npm run verify:pre-pr`, green PR CI for #1074, and `npm run verify:pre-merge` full lane.
- `10/10 claim`: yes - all critical target categories reached `5/5`; no target category is below `4/5`.

| Category                                      | Achieved Score | Evidence                                                                                                                                       | Gaps / Notes                                                                                       |
| --------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | Separate `workoutContextCta` aggregate/panel; PR #1074 CI and local pre-merge passed.                                                          | None.                                                                                              |
| UX flow clarity                               | `5/5`          | Admin-readable copy polish, Help/Guide assertion, owner-approved screenshots.                                                                  | None.                                                                                              |
| Visual design quality                         | `5/5`          | Existing Admin Analytics panel language reused; desktop/mobile screenshot handoff approved.                                                    | None.                                                                                              |
| Business logic correctness and data integrity | `5/5`          | Unit tests cover mapped rows, unknown placement/product/source, zero denominator, and baseline separation.                                     | None.                                                                                              |
| Accessibility (a11y)                          | `5/5`          | Component role/text assertions and full verification lane passed.                                                                              | None.                                                                                              |
| Accessibility                                 | `5/5`          | Same accessibility evidence as the canonical a11y row; read-only semantic dashboard section preserved.                                         | None.                                                                                              |
| Performance (CWV + payloads)                  | `5/5`          | No new dependency or route; perf budgets passed in `verify:pre-pr` and `verify:pre-merge`.                                                     | None.                                                                                              |
| Data placement and sync boundaries            | `5/5`          | Server-canonical admin insight aggregate only; no local/admin state or commerce truth added.                                                   | None.                                                                                              |
| Reliability and failure handling              | `5/5`          | Tests cover schema-missing, unknown/unmapped rows, empty/zero states, and deterministic caveats.                                               | None.                                                                                              |
| Security and authz                            | `5/5`          | Existing gated admin insight route retained; route/security tests and quality gate passed.                                                     | None.                                                                                              |
| Privacy and compliance                        | `5/5`          | Tests and view model exclude raw payload/user/workout/payment data from rendered admin output.                                                 | None.                                                                                              |
| Content governance                            | `5/5`          | Help/Guide, API contract, architecture docs, parent checkpoint, route/label/support sweep, and child brief updated.                            | None.                                                                                              |
| Analytics and KPI observability               | `5/5`          | Dedicated shown/clicked/click-rate/read-review aggregate and dashboard tests passed.                                                           | None.                                                                                              |
| Commerce and revenue ops                      | `5/5`          | UI/docs copy keeps CTA telemetry separate from checkout, entitlement, Stripe, revenue, refunds, payouts, invoices, and finance reporting.      | None.                                                                                              |
| Incident response and support operations      | `5/5`          | Help/Guide and docs explain unknown/review-needed, capped, stale, schema-missing, failed-read, duplicate, and non-finance states.              | None.                                                                                              |
| Finance and reporting operations              | `5/5`          | Finance caveats in dashboard docs and Help/Guide; no finance/export/reconciliation path touched.                                               | None.                                                                                              |
| Stack-fit and dependency discipline           | `5/5`          | Reused `admin-insights`, `admin-dashboard`, `AdminAnalyticsDashboard`, and existing test patterns; no dependency added.                        | None.                                                                                              |
| Testing and QA automation                     | `5/5`          | Targeted Vitest, typecheck, brief lint, diff check, screenshot handoff, `verify:pre-pr`, green PR CI, and `verify:pre-merge` full lane passed. | Private-gate regression skipped because `SITE_LOCK_ENABLED!=1`; this slice did not change gate UX. |
