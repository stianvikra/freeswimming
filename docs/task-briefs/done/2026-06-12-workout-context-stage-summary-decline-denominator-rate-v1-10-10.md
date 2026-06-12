# Task Brief: Workout Context Stage Summary Decline Denominator Rate V1 (10/10)

## Metadata

- `id`: `2026-06-12-workout-context-stage-summary-decline-denominator-rate-v1-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-12`
- `updated`: `2026-06-12`
- `parent_brief`: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- `depends_on`:
  - `docs/task-briefs/done/2026-06-12-workout-context-checkout-cancel-decline-measurement-contract-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-12-workout-context-checkout-cancel-runtime-attribution-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-12-workout-context-checkout-cancel-admin-analytics-mapping-v1-10-10.md`
  - `docs/architecture/workout-context-checkout-cancel-decline-measurement-contract.md`
  - `docs/architecture/workout-context-cta-measurement-contract.md`
  - `docs/architecture/workout-checkout-attribution-finance-separation-contract.md`
- `execution_mode`: `end-to-end-after-explicit-implement-with-screenshot-approval-stop`
- `branch`: `workout-context-stage-decline-rate-v1`

## Brief Audit Record

- `last_audited`: `2026-06-12`
- `base`: clean synced `main@d9e8fde3` after PR `#1103` implemented workout-context checkout-cancel Admin Analytics mapping, repo-managed closeout PR `#1104` moved the child to done, and post-merge preflight was reported clean.
- `audit_status`: `ready`
- `decision`: Execute this bounded child now after owner approval.
- `reason`: The mapped workout-context checkout-cancel aggregate exists and the contract now allows a separately approved child to define the Poolside guide stage-summary cancel stage, denominator, zero behavior, Help/Guide copy, and screenshot evidence. No runtime, checkout, Stripe, entitlement, finance, export, vendor, product, or builder/generator scope is approved.
- `must_refresh_before_execution_if`: Refresh before execution if AGENTS.md, task brief lint rules, scorecard categories, Codex skill/stack readiness radar, `ANALYTICS_EVENT_NAMES`, `analytics_events` schema, `lib/commerce/checkout.ts`, `lib/analytics/admin-insights.ts`, `lib/analytics/admin-dashboard.ts`, `components/admin/AdminAnalyticsDashboard.tsx`, Admin Help/Guide copy, `docs/api-contracts.md`, checkout/entitlement/finance contracts, product catalog IDs, checkout-cancel mapping constants, or screenshot handoff rules change.

## Goal

Add the already mapped workout-context checkout-cancel count and a defined cancel-rate denominator to the Poolside guide stage summary so admins can read the saved-workout guide path from prompt view through checkout outcomes without inferring unique-user conversion, checkout failure, revenue, Stripe reconciliation, or finance truth.

## Pre-Implementation Owner Explanation

Vi oppdaterer Admin Analytics slik at stage summary ogsaa viser den allerede godkjente checkout-cancel-returen og en cancel-rate basert paa cancelled / shown. Det betyr at admin kan se et mer komplett bilde av saved-workout -> Poolside guide-funnelen uten aa late som tallet er tapt salg eller unike personer. Utenfor scope er ny dismiss-knapp, ny runtime, direkte checkout, Stripe/webhook, entitlement-regler, finance/revenue, export/raw drilldown, tredjeparts analytics, nye produkter/priser og builder/generator UX.

Forward-compatibility-intent: bare dagens godkjente `source/placementId/productId/surface/reason` skal telle i stage summary. Nye produkter, plasseringer, cancel surfaces eller decline reasons skal falle trygt ut som review/unknown til en egen mapping-child godkjenner dem med tester, Help/Guide-kopi og support-regler.

## Product Decision

- Stage summary adds one checkout outcome stage: `Checkout cancelled`.
- Count source: `workoutContextCheckoutCancel.cancelled`, which already counts only mapped `upsell_declined` rows with:
  - `source=workout_context`,
  - `placementId=workout_saved_post_success`,
  - `productId=guide_poolside`,
  - `surface=plans_checkout_return`,
  - `reason=checkout_cancelled`.
- Denominator: `Cancel rate = cancelled / shown`.
- Zero behavior:
  - If shown is `0`, cancel rate is `Not counted`.
  - If shown is greater than `0` and cancel is `0`, cancel rate is `0%`.
- Meaning:
  - `Checkout cancelled` means mapped return-from-checkout telemetry only for the approved saved-workout Poolside guide path.
- Not meaning:
  - ignored CTA, all non-buyers, unique-user decline, checkout creation failure, payment failure, provider failure, webhook delay, entitlement failure, refund, payout, invoice, accounting export, Stripe reconciliation, revenue, or finance truth.
- This child may update the existing stage-summary view-model, Admin Analytics rendering via existing dynamic stage/metric arrays, Help/Guide copy, docs, parent checkpoint, targeted tests, and screenshots.
- This child must not add a new runtime analytics callsite, explicit dismiss UI, direct checkout, raw drilldown, export, finance module, vendor forwarding, product catalog mutation, or Stripe/webhook behavior.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the 10/10 claim gate:

- Product goals and IA
- UX flow clarity
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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                          | Evidence                                                        | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Poolside guide stage summary includes mapped checkout cancel as a bounded outcome while preserving existing Admin Analytics IA and detailed panels.                                         | view-model/UI tests + screenshot handoff                        | `5/5`                   |
| UX flow clarity                               | `target`     | Labels and caveats explain `Checkout cancelled`, `Cancel rate`, and `Cancelled / shown` without implying ignored CTA, failed payment, revenue, finance, or unique-user conversion.          | dashboard copy tests + Help/Guide assertions + screenshots      | `5/5`                   |
| Visual design quality                         | `target`     | Reuse existing stage-summary list/metric layout, responsive spacing, typography, and trust states with no new chart or heavy UI dependency.                                                 | component tests + desktop/mobile screenshot artifacts           | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Stage summary uses only the existing mapped cancel aggregate; unknown/future/malformed rows stay out through the dedicated cancel aggregate and do not affect rate math.                    | admin-insights/view-model tests with mapped/unknown fixtures    | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice adds no admin editor, placement config, CRUD flow, publish workflow, or editable checkout setting.                                                                   | explicit admin-editor scope rationale                           | `N/A`                   |
| Accessibility (a11y)                          | `target`     | The updated read-only dashboard panel keeps semantic section heading, list/metric text, no keyboard trap, and no hidden interactive controls.                                               | Testing Library role/text assertions + screenshot/manual review | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency, chart library, route, migration, vendor script, or unbounded query; dashboard payload reuses existing bounded aggregate fields.                                          | package diff + pre-PR gate                                      | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Reads remain server-canonical aggregate analytics rows through `/api/admin/analytics/insights`; no local/admin state, checkout mutation, entitlement mutation, or finance truth is created. | data contract review + admin insight/view-model tests           | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: Admin Analytics remains `no-store`; no cache, revalidation, or invalidation behavior changes.                                                                              | route/cache review                                              | `4/5`                   |
| Reliability and failure handling              | `target`     | Empty ranges, zero counts, schema-missing state, stale/capped reads, and fetch failure produce deterministic trust/caveat states without raw payload exposure.                              | negative-path tests + schema-missing UI coverage                | `5/5`                   |
| Security and authz                            | `target`     | Existing admin insight route remains viewer-gated and fail-closed; this child does not widen data access or add a public route.                                                             | existing authz coverage + changed-files review                  | `5/5`                   |
| Privacy and compliance                        | `target`     | Dashboard returns/renders only bounded counts/labels; no raw payload JSON, raw URLs/query strings, workout IDs/text, emails, IPs, user agents, visitor IDs, Stripe IDs, or payment data.    | payload filtering tests + rendered-label tests                  | `5/5`                   |
| Content governance                            | `target`     | Help/Guide, architecture/API caveats when touched, parent checkpoint, and child brief align on cancel-rate denominator and non-finance limitations.                                         | docs updates + route/label/support sweep + copy tests           | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin mutation, role-gated action, editable placement workflow, publish path, or recovery action changes.                                                                    | explicit admin-workflow scope rationale                         | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this protected admin-only dashboard change adds no public route, metadata, sitemap, canonical URL, structured data, or crawlable content.                                       | explicit SEO scope rationale                                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this protected admin-only dashboard change adds no public semantic page, public docs page, structured data, or AI-facing crawl surface.                                         | explicit AI-discoverability scope rationale                     | `N/A`                   |
| Analytics and KPI observability               | `target`     | Stage summary exposes mapped checkout-cancel counts and `cancelled / shown` while preserving review-needed diagnostics in the detailed cancel panel.                                        | admin-insights/view-model/component tests                       | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Copy and caveats explicitly separate checkout-cancel telemetry from checkout success proof, Stripe reconciliation, revenue, refunds, payouts, invoices, and finance truth.                  | Help/Guide/API copy + tests                                     | `5/5`                   |
| Incident response and support operations      | `target`     | Support can explain mapped cancel, denominator, zero state, duplicate-count caveat, capped/stale/schema-missing reads, and review-needed rows without raw identifiers.                      | Help/Guide/runbook copy + route/label/support sweep             | `5/5`                   |
| Finance and reporting operations              | `target`     | Cancel counts/rates remain product/support telemetry only and cannot be used as revenue, refund, payout, invoice, accounting export, Stripe reconciliation, or finance reporting.           | finance caveat copy + no finance/export changed-files evidence  | `5/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: machine IDs remain locale-independent and visible labels stay short; full localization workflow remains future scope.                                                      | copy review + explicit future mapping rule                      | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `lib/analytics/admin-insights.ts`, `lib/analytics/admin-dashboard.ts`, `components/admin/AdminAnalyticsDashboard.tsx`, and existing test patterns; add no dependency.                 | changed-files/package diff + tests                              | `5/5`                   |
| Testing and QA automation                     | `target`     | Add targeted unit/component/help coverage, run brief lint, targeted Vitest, screenshot handoff, then `npm run verify:pre-pr` after owner screenshot approval.                               | test output + screenshot artifacts + verify gates               | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: mapping reuses bounded row-cap aggregate reads and low-cardinality view-model math; no rollup/export/warehouse path changes.                                               | query review + no dependency/migration evidence                 | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: additive dashboard mapping is revertable without migration/provider/env changes; rollback is removing the stage/metric/docs copy.                                          | PR rollback notes + no migration/dependency evidence            | `4/5`                   |

## Stack / Architecture Best-Practice Gate

Skill/capability audit:

- Available now: `playwright` skill for screenshot handoff, repo Vitest/Testing Library coverage, existing Admin Analytics view-model/components.
- Evaluate later: Stripe skill is not needed because this child does not change provider integration; use it only if a future scope touches Stripe Session, webhook, refunds, payouts, invoices, billing, or finance reconciliation.
- Install/config changes: none.

Systemic findings:

| Surface                   | Finding                                                                                                | Severity | Recommended Type               | Owner Decision Needed | Follow-Up Brief Path |
| ------------------------- | ------------------------------------------------------------------------------------------------------ | -------- | ------------------------------ | --------------------- | -------------------- |
| Analytics/KPI             | Cancel aggregate is mapped and ready to be included in the stage summary with an explicit denominator. | medium   | bounded implementation child   | no                    | this brief           |
| Finance/reporting         | Cancel rate could be misread as lost revenue without explicit stage-summary caveats.                   | high     | bounded implementation child   | no                    | this brief           |
| Explicit dismiss behavior | True CTA dismiss still has no runtime signal and cannot be inferred from cancel telemetry.             | medium   | deferred architecture decision | yes                   | TBD                  |

Return path:

- Parent: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- Status: active child is this brief.
- Last merged workstream: PR `#1103` (`41e9d58a`) and closeout PR `#1104` (`d9e8fde3`).
- Next planning step after this child: re-audit the parent before selecting explicit dismiss, export/raw drilldown, finance, direct checkout, vendor analytics, product expansion, or any other future child.

- React/Next.js:
  - Reuse `components/admin/AdminAnalyticsDashboard.tsx` and the existing read-only stage-summary panel.
  - Keep the client boundary unchanged; no new route, tab, action, server component, chart dependency, or navigation flow is added.
  - `/api/admin/analytics/insights` remains the only data source and keeps `no-store`.
- TypeScript/domain contracts:
  - Use existing `workoutContextCheckoutCancel` aggregate.
  - Keep cancel-rate math deterministic through the existing `rate`/`formatAnalyticsPercent` helpers.
  - Keep unknown/unmapped checkout-cancel rows separate from stage-summary counts via the existing cancel aggregate.
- Supabase/data layer:
  - No migration, RLS change, generated type update, rollup job, index, raw drilldown, or export path.
  - Aggregation reads existing `analytics_events` rows and never returns raw payload JSON to Admin UI.
- External services/tools:
  - No Stripe API, Checkout Session creation, webhooks, billing portal, entitlement, finance, vendor analytics, SDK, secret, or env-var change.
  - Provider/payment truth remains outside this slice.
- UI system:
  - Reuse existing Admin Analytics metric/stage language and trust/caveat states.
  - Primary visible labels must use plain admin language: `Checkout cancelled`, `Cancel rate`, `Cancelled / shown`.
  - Provide screenshot handoff for desktop and mobile Admin Analytics after targeted QA, then stop for owner approval before `npm run verify:pre-pr`.
- Testing:
  - Add/update unit tests for mapped cancel stage/rate, zero denominator, zero cancel, schema-missing state, and privacy/caveat copy.
  - Update Help/Guide assertions where stage-summary copy changes.

## Data Placement And Sync Contract

- Server-canonical:
  - Persisted `analytics_events` rows and bounded aggregate response from `/api/admin/analytics/insights`.
- Local/browser:
  - No new local analytics identity, admin preference, localStorage, cookie, checkout state, or user-to-public attribution bridge.
- Sync policy:
  - Admin dashboard range changes refetch the same bounded endpoint.
  - Cancel analytics may duplicate on browser retry or repeated return; dashboard copy must say counts are selected-range telemetry events, not unique users.
- Retention and sensitivity:
  - Existing analytics retention/rollup lifecycle applies.
  - Dashboard must not return or render raw workout text, workout IDs, emails, user IDs, visitor IDs, IPs, user agents, raw URLs/referrers/query strings, payment data, Stripe IDs, support messages, free text, or raw payload JSON.
- Cache/invalidation:
  - `/api/admin/analytics/insights` remains `no-store`.
  - No new cache invalidation or revalidation behavior.

## Identity And Rename Contract

- Canonical stable IDs:
  - Stage IDs remain `poolside-stage-*`.
  - Cancel stage ID: `poolside-stage-checkout-cancelled`.
  - Cancel rate metric ID: `poolside-stage-cancel-rate`.
  - Decline event identity: `upsell_declined`.
  - Attribution source identity: `workout_context`.
  - Placement identity: `workout_saved_post_success`.
  - Product identity: `guide_poolside`.
  - Surface identity: `plans_checkout_return`.
  - Reason identity: `checkout_cancelled`.
- Human-readable identifiers:
  - Dashboard labels, Help/Guide copy, product title, and route labels are display-only and renameable when meaning is unchanged.
- Mutability rules:
  - Event names, source keys, placement IDs, product IDs, surface keys, and reason keys are append-only after shipping.
  - Stage/metric IDs are stable for tests, support, screenshots, and future dashboard mapping.
- Rename vs repurpose:
  - Copy-only clarity is a rename.
  - Counting ignored users, all non-buyers, generic plans cancel, My Library cancel, future checkout surfaces, provider failures, entitlement lag, refunds, payouts, invoices, or finance states as stage-summary cancel is repurpose and requires a new child.
- Compatibility contract:
  - Unknown, deprecated, inactive, unavailable, or unmapped placement/product/source/surface/reason values do not affect the stage-summary checkout-cancel count or cancel rate.
  - Generic Admin Analytics event/product lists may still show safe future values through existing formatting.
- Observability and repair:
  - Unknown/unmapped rows remain visible through the dedicated checkout-cancel review-needed panel when practical, not through stage-summary rate math or raw payload drilldown.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Checkout attribution sources, CTA placements, product IDs, product availability, event payload dimensions, cancel surfaces, decline reason keys, route labels, Admin Analytics modules, Help/Guide copy, locales, export formats, vendor forwarding, entitlement states, and finance/reporting surfaces.
- Source of truth:
  - Event names come from `ANALYTICS_EVENT_NAMES`.
  - Checkout-cancel attribution identity comes from `lib/commerce/checkout.ts` and the checkout-cancel / decline measurement contract.
  - Product IDs come from the catalog.
  - Admin counts come from `/api/admin/analytics/insights`.
- Additive behavior:
  - Generic top-event/product lists continue to show safe future events/products.
  - Existing generic upsell baseline continues to count current-surface sources such as `plans` and `library_explore`.
  - Existing workout-context CTA, checkout-start, completion/access, checkout-cancel, and review diagnostics keep their current meanings.
- Explicit mapping requirements:
  - New CTA placements, new products, direct checkout, new checkout sources in dedicated KPIs, explicit dismiss controls, new cancel surfaces, new decline reasons, finance reporting, CSV/export, raw drilldown, vendor analytics, localized commercial claims, or public landing/SEO copy require a new child.
- Unknown or deprecated values:
  - Unknown/unmapped workout-context cancel values are excluded from stage-summary counts/rates and shown only as safe diagnostics when practical.
  - Unknown values must not imply revenue, refund, payout, invoice, accounting close, provider failure, entitlement failure, or finance truth.
- Test/evidence:
  - Tests must cover mapped rows, zero denominator, zero cancel, unknown source/placement/product/surface/reason rows through the existing aggregate, schema-missing state, unsafe payload exclusion, Help/Guide copy, and route/label/support sweep evidence.

## Scope

- Add mapped checkout-cancel to `workoutContextStageSummary` as a read-only stage.
- Add `Cancel rate = cancelled / shown` to `workoutContextStageSummary.metrics`.
- Preserve existing detailed checkout-cancel panel and review-needed diagnostics.
- Preserve generic upsell baseline counts for current-surface `plans` and `library_explore` cancel telemetry.
- Preserve existing `workoutContextCta`, `workoutContextCheckoutStarted`, `workoutContextCheckoutOutcome`, and API response shape.
- Update Help/Guide, architecture/API docs as needed, parent brief checkpoint, and this child checkpoint.
- Add/update targeted unit/component tests.
- Capture screenshot handoff and stop for owner approval before `npm run verify:pre-pr`.

## Out Of Scope

- Runtime CTA changes, explicit dismiss/not-now UI, direct checkout from workout context, new CTA placements, new checkout routes, or visible product redesign outside Admin Analytics.
- Changing `/api/checkout/session`, Stripe Checkout Session creation, webhooks, billing portal, provider event meanings, subscriptions, Payment Element, PaymentIntents, entitlement mutation, claims, finance reconciliation, accounting export, refunds, payouts, invoices, revenue recognition, vendor analytics, raw drilldown, CSV/export, migration, RLS, generated DB types, product catalog mutation, new pricing, or builder/generator algorithm changes.
- Adding new analytics event callsites.
- Exposing raw analytics payloads, raw URLs, checkout URLs, Stripe IDs, user IDs, emails, IPs, user agents, visitor IDs, workout IDs/text, payment data, support free text, or user-level drilldown.

## Acceptance Criteria

1. `workoutContextStageSummary.stages` includes `Checkout cancelled` with the existing mapped cancel aggregate count.
2. `workoutContextStageSummary.metrics` includes `Cancel rate` with detail `Cancelled / shown`.
3. Cancel rate is `Not counted` when shown is `0`, `0%` when shown is positive and cancel count is `0`, and a percent when both numerator and denominator are positive.
4. Unknown/future/malformed cancel rows remain excluded from the stage summary through the existing dedicated cancel aggregate behavior.
5. Admin Analytics renders the updated stage summary using existing visual language, with no new interactive controls or route.
6. Help/Guide and docs state that checkout cancel is mapped return-from-checkout telemetry only, and cancel rate is not unique-user conversion, payment failure, entitlement failure, revenue, Stripe reconciliation, or finance truth.
7. Targeted tests cover mapped cancel stage/rate, zero denominator, zero cancel, schema-missing UI, Help/Guide assertions, and stage-summary caveats.
8. Screenshot handoff is captured for representative desktop/mobile Admin Analytics after targeted QA and before `npm run verify:pre-pr`.

## Validation

- `npm run lint:briefs`
- Targeted Vitest for Admin Analytics insights, view-model, component, and Help/Guide tests.
- Route/label/support sweep before broad gates:
  - `rg -n "upsell_declined|checkout_cancelled|plans_checkout_return|workoutContextCheckoutCancel|poolside-stage-checkout-cancelled|poolside-stage-cancel-rate|Poolside guide stage summary|Cancel rate|Cancelled / shown|finance|revenue|Stripe reconciliation|Help|Guide" app components lib tests docs`
- Screenshot handoff for `/admin?tab=analytics` using the repo local screenshot defaults.
- After owner screenshot approval: `npm run verify:pre-pr`
- PR CI required checks
- Before merge recommendation: `npm run verify:pre-merge`

## Route / Label / Support Sweep Evidence

- `2026-06-12`: identifiers searched: `upsell_declined`, `checkout_cancelled`,
  `plans_checkout_return`, `workoutContextCheckoutCancel`, `poolside-stage-checkout-cancelled`,
  `poolside-stage-cancel-rate`, `Poolside guide stage summary`, `Cancel rate`, `Cancelled / shown`,
  `finance`, `revenue`, `Stripe reconciliation`, `Help`, and `Guide`.
- Directories/surfaces checked: `app/`, `components/`, `lib/`, `tests/`, `docs/`, API contracts,
  architecture contracts, active/planned/done task briefs, Admin Analytics UI/view-model, Admin
  Help/Guide, and unit/component tests.
- Fallout handled in this PR: updated Admin Help/Guide copy/assertions, Admin Analytics
  view-model/component expectations, API/architecture contracts, parent checkpoint, and this active
  child brief.
- Intentional leftovers: historical done-brief references to deferred stage-summary
  denominator/rate remain archival; future explicit dismiss UI, export/raw drilldown, finance,
  vendor analytics, direct checkout, product/pricing, and builder/generator UX remain separate
  owner-approved children.

## Manual QA Environments

- Local screenshot handoff required after targeted validation:
  - URL: `http://127.0.0.1:3000/admin?tab=analytics`
  - Screenshot comparison type: `after/reference`
  - Required artifacts:
    - `after-admin-analytics-stage-summary-desktop.png`
    - `after-admin-analytics-stage-summary-mobile.png`
    - reference screenshots for the adjacent checkout-cancel/detail panel when practical
- Vercel preview: required after PR CI if production-like visual confirmation is needed before merge.

## Constraints

- Keep the existing Admin Analytics visual language.
- Keep copy short enough for mobile.
- Keep event-count semantics explicit; do not present rates as unique people.
- Add no dependencies.
- Add no migration, public route, provider integration, env var, export, raw drilldown, or finance workflow.

## Debugging And Handoff Contract

- Follow `docs/runbooks/ui-debug-hypothesis-and-handoff.md` for screenshot capture and artifact handoff.
- Follow `docs/runbooks/route-label-support-surface-impact-sweep.md` because Admin Analytics labels and Help/Guide copy change.
- If screenshot/browser capture is blocked by auth or local egress, use the temporary local visual harness fallback from `docs/runbooks/codex-local-automation-friction-defaults.md`, remove temporary files before validation, and state the caveat.
- If product-rendering files change after screenshot capture, regenerate screenshots before continuing.

## Help/Guide And Operator Training Contract

- Update Admin Help/Guide stage-summary copy to include:
  - `Checkout cancelled` means mapped return-from-checkout only.
  - `Cancel rate` means `cancelled / shown`.
  - Counts and rates are selected-range telemetry events, not unique people or finance truth.
- Update automated Help/Guide assertions in the same PR.

## Security, Privacy, and Compliance

- Existing admin authz boundaries remain unchanged.
- No public route, API auth widening, raw payload exposure, user drilldown, or secret/env changes.
- No PII, raw checkout URLs, Stripe IDs, emails, IPs, user agents, visitor IDs, workout IDs/text, payment data, or support free text may be rendered or returned by the changed dashboard view.

## Observability and KPI Contract

- No new analytics events.
- KPI exposed:
  - stage-summary checkout-cancel count over existing mapped aggregate,
  - cancel rate as `cancelled / shown`.
- Acceptable thresholds:
  - mapped rows count deterministically,
  - unknown rows stay out of stage-summary math,
  - zero denominator returns `Not counted`,
  - no raw payload data appears in response/view-model/rendered labels.

## Session Continuity and Recovery

- Canonical source of truth: branch `workout-context-stage-decline-rate-v1` and this in-progress brief.
- Checkpoint cadence:
  - update this brief at meaningful milestones,
  - commit after targeted validation and screenshot approval/pre-PR gate.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint.

## Git Rhythm Defaults

- Automation-first after owner approval:
  - implement scoped changes,
  - run targeted tests,
  - capture screenshot handoff and stop for owner approval,
  - after approval run `npm run verify:pre-pr`,
  - commit, push, open PR, monitor CI,
  - run `npm run verify:pre-merge`,
  - summarize merge readiness.
- Do not merge without explicit owner approval.

## Branch Hygiene Defaults

- Post-merge cleanup in the same working session after explicit merge approval:
  - sync `main`,
  - delete merged local/remote branch when safe,
  - prune refs,
  - run post-merge preflight,
  - complete repo-managed closeout if surfaced and eligible,
  - perform chat-handoff assessment.

## PR Browser Rule

- Prefer repo Safari PR scripts for create/review/merge handoff.
- Reuse an existing Safari PR tab when practical; do not replace the owner active tab unless it already belongs to this PR.

## Manual QA URL Rule

- For screenshot-only review, provide the clickable local artifact folder and describe exactly what to inspect.
- Give one manual UI/GitHub step at a time.

## Checkpoint Log

- `2026-06-12 | active child created | branch workout-context-stage-decline-rate-v1 created from clean main@d9e8fde3; scope is read-only Admin Analytics stage-summary checkout-cancel stage and cancel-rate denominator only, with screenshot approval required before verify:pre-pr | next: implement view-model/UI/docs/tests and run targeted validation`
- `2026-06-12 | implementation before screenshot | added mapped checkout-cancel stage, cancel rate = cancelled / shown, Help/Guide/API/architecture copy, targeted tests, and route/label/support sweep evidence. Targeted Vitest, lint, typecheck, lint:briefs:all, and git diff check pass; lint has only pre-existing output/ warnings. Scope remains read-only Admin Analytics with no API response shape, event callsite, checkout/Stripe/webhook/entitlement-rule/finance/export/vendor/migration/product/builder change | next: run quality-gate lint, capture screenshot handoff, and stop for owner approval before verify:pre-pr`
- `2026-06-12 | screenshot stop | captured after/reference screenshot artifacts at output/workout-context-stage-summary-decline-rate-2026-06-12-202712 for desktop stage summary, mobile stage summary, Admin Help/Guide analytics copy, and checkout-cancel reference panel. Temporary /visual-admin-analytics route was removed after capture, dev server was stopped, no scoped product-rendering source changed after final capture, and owner visual approval is pending before verify:pre-pr | next: wait for owner screenshot approval or visual corrections`
- `2026-06-12 | screenshots approved | owner approved screenshot artifacts at output/workout-context-stage-summary-decline-rate-2026-06-12-202712, and no scoped product-rendering source changed after final capture | next: child verify:pre-pr`
- `2026-06-12 | pre-pr passed | active child passed npm run verify:pre-pr full lane after owner-approved screenshots, including branch-current, lint, quality gates, typecheck, unit, build, performance budgets, and Playwright E2E. No scoped product-rendering source changed after final capture, and no runtime/checkout/Stripe/entitlement-rule/finance/export/vendor/product/builder scope was added | next: commit, push, open PR, monitor CI, and run child verify:pre-merge`
- `2026-06-12 | merged | PR #1105 merged at squash commit c75aae55 after owner-approved screenshots, green local pre-pr, green PR CI, and verify:pre-merge. This closeout moves the child to done; no runtime/checkout/Stripe/entitlement-rule/finance/export/vendor/product/builder scope was added | next: finish repo-managed docs-only closeout PR and rerun post-merge preflight`

## Completion Record

- `completed`: `2026-06-12`
- `merged_pr`: `#1105`
- `squash_commit`: `c75aae55`
- `result`: Closed Workout Context Stage Summary Decline Denominator Rate V1; Admin Analytics now includes the mapped checkout-cancel stage and `cancelled / shown` cancel rate in the Poolside guide stage summary while keeping finance, Stripe, unique-user, and revenue caveats explicit.
- `validation`: Targeted Vitest for Admin Analytics view-model/component/help copy passed; `npm run lint`, `npm run typecheck`, `npm run lint:briefs:all`, `npm run lint:quality-gates`, and `git diff --check` passed before screenshot handoff; owner approved after/reference screenshots at `output/workout-context-stage-summary-decline-rate-2026-06-12-202712`; final `npm run verify:pre-pr` full lane passed on commit `22599e73`; PR #1105 CI passed (`verify`, `e2e-smoke`, `site-lock-smoke`, CodeQL, Vercel, size-check); `npm run verify:pre-merge` passed before merge.
- `10/10 claim`: yes - all critical target categories reached `5/5` and no release-blocking gaps remain for this child.

| Category                                      | Achieved Score | Evidence                                                                                                       | Gaps / Notes |
| --------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | Stage summary includes mapped checkout-cancel count and rate; PR #1105 merged after green gates.               | None         |
| UX flow clarity                               | `5/5`          | Labels, caveats, Help/Guide copy, tests, and screenshots explain `Checkout cancelled` and `Cancelled / shown`. | None         |
| Visual design quality                         | `5/5`          | Reused existing Admin Analytics stage-summary layout; owner approved desktop/mobile screenshot handoff.        | None         |
| Business logic correctness and data integrity | `5/5`          | View-model tests cover mapped, zero-denominator, duplicate-count, and schema-missing states.                   | None         |
| Accessibility (a11y)                          | `5/5`          | Read-only text/section semantics preserved; component tests and screenshots passed.                            | None         |
| Performance (CWV + payloads)                  | `5/5`          | No dependency, route, migration, or unbounded query added; performance budgets passed in full pre-pr lane.     | None         |
| Data placement and sync boundaries            | `5/5`          | Server-canonical Admin Analytics aggregate remains the only source; no local/admin mutation added.             | None         |
| Reliability and failure handling              | `5/5`          | Empty/zero/schema-missing states produce deterministic `Not counted` and caveat output.                        | None         |
| Security and authz                            | `5/5`          | Existing admin-only insight route remained unchanged; no public route or auth widening added.                  | None         |
| Privacy and compliance                        | `5/5`          | Dashboard renders only bounded counts/labels; no raw payload, IDs, payment data, or PII exposed.               | None         |
| Content governance                            | `5/5`          | API, architecture, Help/Guide, parent, and child brief copy align on denominator and non-finance limits.       | None         |
| Analytics and KPI observability               | `5/5`          | Mapped cancel count and `cancelled / shown` rate are visible with detailed cancel panel still separate.        | None         |
| Commerce and revenue ops                      | `5/5`          | Copy separates checkout-cancel telemetry from purchase, revenue, Stripe, accounting, and finance truth.        | None         |
| Incident response and support operations      | `5/5`          | Help/Guide and caveats explain denominator, duplicates, zero state, stale/capped/schema-missing reads.         | None         |
| Finance and reporting operations              | `5/5`          | Finance caveats explicitly block revenue/refund/payout/invoice/accounting interpretation.                      | None         |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing Admin Analytics helpers/components/tests; no dependency added.                                 | None         |
| Testing and QA automation                     | `5/5`          | Targeted tests, brief lint, quality gates, full pre-pr, PR CI, and pre-merge gate all passed.                  | None         |
