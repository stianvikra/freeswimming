# Task Brief: Workout Context Commercial Funnel Stage Summary V1 (10/10)

## Metadata

- `id`: `2026-06-12-workout-context-commercial-funnel-stage-summary-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-12`
- `updated`: `2026-06-12`
- `parent_brief`: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- `depends_on`:
  - `docs/task-briefs/done/2026-06-11-workout-context-cta-admin-analytics-mapping-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-11-workout-context-checkout-started-admin-analytics-mapping-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-11-workout-context-checkout-completion-entitlement-admin-analytics-mapping-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-12-workout-context-checkout-outcome-support-diagnostics-v1-10-10.md`
  - `docs/architecture/workout-checkout-attribution-finance-separation-contract.md`
  - `docs/architecture/workout-context-checkout-completion-entitlement-attribution-contract.md`
- `execution_mode`: `end-to-end-after-explicit-implement-with-screenshot-approval-stop`
- `branch`: `workout-context-commercial-funnel-stage-summary-v1`

## Brief Audit Record

- `last_audited`: `2026-06-12`
- `base`: clean synced `main@7361488f` after PR `#1095` added workout-context checkout outcome support diagnostics and repo-managed closeout PR `#1096` moved the child to done; post-merge preflight was reported clean.
- `audit_status`: `ready`
- `decision`: Execute this bounded child on branch `workout-context-commercial-funnel-stage-summary-v1`.
- `reason`: The owner explicitly requested implementation after selecting this child. The mapped workout-context CTA, checkout handoff, checkout completion, access-grant, and support-diagnostic modules are complete. Admin Analytics still shows those stages as separate panels, so this safe slice is a read-only stage summary that reuses existing first-party aggregate counts and caveats without adding events, checkout, Stripe, entitlement-rule, finance, export, vendor, product, or builder scope.
- `must_refresh_before_execution_if`: Refresh before execution if AGENTS.md, task brief lint rules, scorecard categories, Codex skill/stack readiness radar, `ANALYTICS_EVENT_NAMES`, `analytics_events` schema, `lib/analytics/admin-insights.ts`, `lib/analytics/admin-dashboard.ts`, `components/admin/AdminAnalyticsDashboard.tsx`, Admin Help/Guide copy, `docs/api-contracts.md`, checkout/entitlement/finance contracts, product catalog IDs, workout-context attribution constants, or screenshot handoff rules change.

## Goal

Add a read-only Admin Analytics stage summary for the saved-workout Poolside guide path so admins can see CTA shown, CTA clicked, checkout handoff, completed checkout, and access granted together without implying revenue, Stripe reconciliation, accounting, refunds, payouts, invoices, unique-user conversion, or finance truth.

## Pre-Implementation Owner Explanation

Vi samler eksisterende Admin Analytics-tall for saved-workout -> Poolside guide i en enkel stage-oppsummering. Da blir det lettere aa se hvor flyten faller fra CTA vist til tilgang gitt, uten aa late som tallene er penger, regnskap eller unike personer. Utenfor scope er nye events, CTA/UI-endringer utenfor Admin Analytics, direct checkout, Stripe/webhook, entitlement-regler, finance, export/raw drilldown, tredjeparts analytics, nye produkter/priser og builder-UX.

Forward-compatibility-intent: nye produkter, plasseringer, kilder eller checkout-steg skal ikke automatisk telle i denne dedikerte oppsummeringen; de skal falle til trygg review/unknown-adferd eller kreve egen mapping-child med tester, Help/Guide-kopi og support-regler.

## Product Decision

- Add one read-only Admin Analytics summary for the approved saved-workout Poolside guide path.
- Reuse existing mapped aggregate counts:
  - CTA shown: `workoutContextCta.presented`.
  - CTA clicked: `workoutContextCta.accepted`.
  - Checkout handoff: `workoutContextCheckoutStarted.started`.
  - Completed checkout: `workoutContextCheckoutOutcome.completed`.
  - Access granted: `workoutContextCheckoutOutcome.entitlementGranted`.
- Show bounded stage rates only when the denominator exists:
  - click rate: clicked / shown,
  - checkout handoff rate: handoff / clicked,
  - checkout completion rate: completed / handoff,
  - access rate: access / completed.
- Copy must say these are event counts for the selected range, not unique users, deduped sessions, revenue, provider reconciliation, accounting, or finance reporting.
- Prefer deriving the summary in `lib/analytics/admin-dashboard.ts` from existing `/api/admin/analytics/insights` response fields. Do not extend the API response unless the implementation audit proves a typed reusable aggregate is needed.
- Keep review-needed diagnostics in the existing Poolside guide access panel; the new summary may link the meaning through copy but must not duplicate raw drilldown or expose raw payload values.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the 10/10 claim gate:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                           | Evidence                                                        | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Admin Analytics presents the approved saved-workout Poolside guide commercial path as one readable stage summary while preserving the existing detailed panels.                              | view-model/UI tests + screenshot handoff                        | `5/5`                   |
| UX flow clarity                               | `target`     | Labels and caveats must make stage meaning obvious in plain admin language and avoid unique-person, revenue, or finance claims.                                                              | dashboard copy tests + Help/Guide assertion + screenshots       | `5/5`                   |
| Visual design quality                         | `target`     | Reuse existing Admin Analytics panel/card/list language, responsive spacing, typography, and trust states; add no chart or heavy UI dependency.                                              | component tests + desktop/mobile screenshot artifacts           | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Stage counts must derive only from existing mapped workout-context aggregates, define zero-denominator behavior, and preserve current CTA/checkout/access counts unchanged.                  | view-model fixtures + admin insight regression tests as needed  | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice adds no admin editor, placement config, CRUD flow, publish workflow, or editable checkout setting.                                                                    | explicit scope rationale                                        | `N/A`                   |
| Accessibility (a11y)                          | `target`     | The added summary keeps semantic section/list text, readable metric labels, no keyboard trap, and no hidden interactive controls.                                                            | Testing Library role/text assertions + screenshot/manual review | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency, chart library, route, migration, vendor script, or unbounded query; dashboard payload is reused or remains bounded by existing row cap.                                   | package diff + pre-PR gate                                      | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Reads remain server-canonical aggregate analytics rows through `/api/admin/analytics/insights`; no local/admin state, checkout mutation, entitlement mutation, or finance truth is created.  | data contract review + tests                                    | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: Admin Analytics remains `no-store`; no cache, revalidation, or invalidation behavior changes.                                                                               | route/cache review                                              | `4/5`                   |
| Reliability and failure handling              | `target`     | Empty, zero, unknown, capped, schema-missing, stale, and failed-read states produce deterministic copy without raw payload exposure.                                                         | negative-path tests + schema-missing UI coverage                | `5/5`                   |
| Security and authz                            | `target`     | Existing admin insight route remains viewer-gated and fail-closed; this child does not widen data access or add a public route.                                                              | existing authz coverage + changed-files review                  | `5/5`                   |
| Privacy and compliance                        | `target`     | Dashboard returns and renders only bounded counts/labels; no raw payload JSON, raw URLs/query strings, workout IDs/text, emails, IPs, user agents, visitor IDs, Stripe IDs, or payment data. | rendered-label tests + payload filtering review                 | `5/5`                   |
| Content governance                            | `target`     | Help/Guide, API/architecture caveats when touched, parent checkpoint, and child brief align on stage meanings and non-finance limitations.                                                   | docs updates + route/label/support sweep + copy tests           | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin mutation, role-gated action, editable placement workflow, publish path, or recovery action changes.                                                                     | explicit scope rationale                                        | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this protected admin-only dashboard change adds no public route, metadata, sitemap, canonical URL, structured data, or crawlable content.                                        | explicit SEO scope rationale                                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this protected admin-only dashboard change adds no public semantic page, public docs page, structured data, or AI-facing crawl surface.                                          | explicit AI-discoverability scope rationale                     | `N/A`                   |
| Analytics and KPI observability               | `target`     | The approved workout-context path is readable as a stage funnel from CTA shown through access granted, with explicit non-unique-user and non-finance caveats.                                | view-model/component tests + Help/Guide assertions              | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Copy and caveats explicitly separate stage telemetry from checkout success proof, Stripe reconciliation, revenue, refunds, payouts, invoices, and finance truth.                             | Help/Guide/API copy + tests                                     | `5/5`                   |
| Incident response and support operations      | `target`     | Support can interpret stage drop-offs, empty ranges, capped/stale/schema-missing reads, duplicate-count caveats, and review-needed handoff to the existing diagnostics panel.                | Help/Guide/runbook copy + route/label/support sweep             | `5/5`                   |
| Finance and reporting operations              | `target`     | Stage summary remains product/support telemetry only and cannot be used as revenue, refund, payout, invoice, accounting export, Stripe reconciliation, or finance reporting.                 | finance caveat copy + no finance/export changed-files evidence  | `5/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: stage machine IDs remain locale-independent and visible labels stay short; full localization workflow remains future scope.                                                 | copy review + explicit future mapping rule                      | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `lib/analytics/admin-dashboard.ts`, `components/admin/AdminAnalyticsDashboard.tsx`, existing Admin Analytics state primitives, and existing test patterns; add no dependency.          | changed-files/package diff + tests                              | `5/5`                   |
| Testing and QA automation                     | `target`     | Add targeted unit/component coverage, run brief lint, targeted Vitest, screenshot handoff, then `npm run verify:pre-pr` after owner screenshot approval.                                     | test output + screenshot artifacts + verify gates               | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: summary reuses bounded aggregate reads and low-cardinality stage keys; no rollup/export/warehouse path changes.                                                             | query review + no dependency/migration evidence                 | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: additive dashboard summary is revertable without migration/provider/env changes; rollback is removing the summary view-model/UI copy.                                       | PR rollback notes + no migration/dependency evidence            | `4/5`                   |

## Stack / Architecture Best-Practice Gate

Skill/capability audit:

- Available now: `playwright` skill for screenshot handoff, repo Vitest/Testing Library coverage, existing Admin Analytics view-model/components.
- Evaluate later: Stripe skill only if a future child changes provider integration; not needed here.
- Install/config changes: none.

Systemic findings:

| Surface                     | Finding                                                                                      | Severity | Recommended Type               | Owner Decision Needed | Follow-Up Brief Path |
| --------------------------- | -------------------------------------------------------------------------------------------- | -------- | ------------------------------ | --------------------- | -------------------- |
| Analytics/KPI               | The approved workout-context path now has all safe stages needed for a bounded summary.      | medium   | bounded implementation child   | no                    | this brief           |
| Finance/reporting           | Stage rates could be misread as revenue or unique-user conversion without explicit caveats.  | high     | bounded implementation child   | no                    | this brief           |
| Export/vendor/raw drilldown | Row-level or vendor analysis would need new privacy, authz, support, and finance boundaries. | low      | deferred architecture decision | yes                   | TBD                  |

Return path:

- Parent: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- Status: this child is active on branch `workout-context-commercial-funnel-stage-summary-v1`.
- Last merged workstream: PR `#1095` (`da21b5a7`) and closeout PR `#1096` (`7361488f`).
- Next planning step: implement the bounded Admin Analytics summary and stop at screenshot approval before `npm run verify:pre-pr`.

- React/Next.js:
  - Reuse `components/admin/AdminAnalyticsDashboard.tsx` and existing Admin Analytics panel/list primitives.
  - Keep the client boundary unchanged; no new route, tab, action, server component, chart dependency, or navigation flow is added.
  - `/api/admin/analytics/insights` remains the only data source and keeps `no-store`.
- TypeScript/domain contracts:
  - Prefer a typed view-model summary derived from existing `workoutContextCta`, `workoutContextCheckoutStarted`, and `workoutContextCheckoutOutcome` response fields.
  - Use deterministic rate helpers with `null` / `Not counted` for zero denominators.
  - Keep stage IDs append-only once shipped.
- Supabase/data layer:
  - No migration, RLS change, generated type update, rollup job, index, raw drilldown, or export path.
  - Aggregation reads existing `analytics_events` rows and never returns raw payload JSON to Admin UI.
- External services/tools:
  - No Stripe API, Checkout Session creation, webhooks, billing portal, entitlement, finance, vendor analytics, SDK, secret, or env-var change.
  - Provider/payment truth remains outside this slice.
- UI system:
  - Reuse current Admin Analytics metric/list language and `AdminManagerState` trust states.
  - Primary visible labels should be plain admin language: shown, clicked, checkout handoff, completed checkout, access granted.
  - Provide screenshot handoff for desktop and mobile Admin Analytics after targeted QA, then stop for owner approval before `npm run verify:pre-pr`.
- Testing:
  - Add view-model tests for stage counts, zero denominators, duplicate-count caveats, schema-missing state, unsafe label exclusion, and future/unknown aggregate behavior.
  - Add component tests for rendered stage labels, rates, caveats, empty/setup-missing states, and Help/Guide assertions.
  - Add `admin-insights` tests only if execution changes the API response shape.

## Data Placement And Sync Contract

- Server-canonical:
  - Persisted `analytics_events` rows and bounded aggregate response from `/api/admin/analytics/insights`.
- Local/browser:
  - No new local analytics identity, admin preference, localStorage, cookie, checkout state, or user-to-public attribution bridge.
- Sync policy:
  - Admin dashboard range changes refetch the same bounded endpoint.
  - Stage analytics may duplicate on client retry, checkout retry, or webhook retry; copy must say counts are product/support telemetry, not unique users.
- Retention and sensitivity:
  - Existing analytics retention/rollup lifecycle applies.
  - Dashboard must not return or render raw workout text, workout IDs, emails, user IDs, visitor IDs, IPs, user agents, raw URLs/referrers/query strings, payment data, Stripe IDs, support messages, free text, or raw payload JSON.
- Cache/invalidation:
  - `/api/admin/analytics/insights` remains `no-store`.
  - No new cache invalidation or revalidation behavior.

## Identity And Rename Contract

- Canonical stable IDs:
  - CTA shown event identity: `upsell_presented`.
  - CTA clicked event identity: `upsell_accepted`.
  - Checkout handoff event identity: `checkout_started`.
  - Completion event identity: `checkout_completed`.
  - Entitlement event identity: `entitlement_granted`.
  - Attribution source identity: `workout_context`.
  - Placement identity: `workout_saved_post_success`.
  - Product identity: `guide_poolside`.
- Human-readable identifiers:
  - Dashboard labels, Help/Guide copy, product title, and route labels are display-only and renameable when meaning is unchanged.
- Mutability rules:
  - Event meanings are append-only.
  - The mapped placement/product/source identity is write-once for this summary.
  - Stage keys must not be repurposed; add a new key for a materially different stage.
- Rename vs repurpose:
  - Copy-only clarity is a rename.
  - Counting a new placement/product/source, using direct checkout, treating stage rate as unique-user conversion, or adding finance meaning is repurpose and requires a new child.
- Compatibility contract:
  - Unknown, deprecated, inactive, unavailable, or unmapped placement/product/source values do not affect the dedicated stage summary.
  - Existing detailed review-needed diagnostics remain the safe place for unmapped completion/access rows.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Checkout attribution sources, CTA placements, product IDs, product availability, event payload dimensions, stage keys, Admin Analytics modules, Help/Guide copy, locales, export formats, vendor forwarding, entitlement states, and finance/reporting surfaces.
- Source of truth:
  - Event names come from `ANALYTICS_EVENT_NAMES`.
  - Checkout attribution identity comes from `lib/commerce/checkout.ts` and the checkout attribution/finance separation contract.
  - Product IDs come from the catalog.
  - Admin counts come from `/api/admin/analytics/insights`.
  - Stage labels come from the typed view-model mapping, not raw payload values.
- Additive behavior:
  - Generic top-event/product lists continue to show safe future events/products.
  - Existing detailed Admin Analytics modules keep their current meanings.
  - This summary keeps working for the approved `workout_context` / `workout_saved_post_success` / `guide_poolside` path while those identities remain valid.
- Explicit mapping requirements:
  - New CTA placements, new products, direct checkout, new checkout sources in dedicated KPIs, new entitlement states, finance reporting, CSV/export, raw drilldown, vendor analytics, localized commercial claims, or public landing/SEO copy require a new child.
- Unknown or deprecated values:
  - Unknown/unmapped workout-context values stay out of the summary and remain review-needed or generic-list data until mapped.
  - Unknown values must not imply revenue, refund, payout, invoice, accounting close, provider failure, entitlement failure, or finance truth.
- Test/evidence:
  - Tests must cover mapped stage rows, zero denominators, empty/setup-missing states, unknown/future values, duplicate-count caveats, unsafe label exclusion, and route/label/support sweep evidence.

## Scope

- Add one read-only Admin Analytics stage summary for the mapped saved-workout Poolside guide path.
- Derive stage counts from existing Admin Analytics aggregate fields where practical.
- Add view-model and Admin Analytics UI copy for stage labels/rates/caveats.
- Preserve existing detailed CTA, checkout handoff, checkout outcome, and support diagnostic modules unchanged unless minor copy alignment is required.
- Update Admin Help/Guide, API/architecture caveats if touched, parent checkpoint, and this child checkpoint.
- Add/update targeted unit/component tests.
- Capture screenshot handoff and stop for owner approval before `npm run verify:pre-pr`.

## Out Of Scope

- Runtime CTA changes, direct checkout from workout context, new CTA placements, new checkout routes, visible product redesign outside Admin Analytics, or builder/generator UX.
- Changing `/api/checkout/session`, Stripe Checkout Session creation, webhooks, billing portal, provider event meanings, subscriptions, Payment Element, PaymentIntents, entitlement mutation, claims, finance reconciliation, accounting export, refunds, payouts, invoices, revenue recognition, vendor analytics, raw drilldown, CSV/export, migration, RLS, generated DB types, product catalog mutation, or new pricing.
- Adding new analytics event callsites.
- Adding per-user/session/provider join keys or claiming unique-user conversion.
- Treating stage rates as payment proof, entitlement failure proof, revenue, refund, payout, invoice, accounting close, Stripe reconciliation, or finance truth.

## Help / Guide Impact

Implementation must update Admin Help/Guide or linked runbook copy with:

- what each stage means,
- why stage counts are selected-range event counts rather than unique-user conversion,
- how duplicate, empty, unknown, capped, stale, schema-missing, failed-read, and review-needed states should be interpreted,
- how the summary differs from the detailed CTA, checkout handoff, completion/access, and diagnostics panels,
- explicit caveat that the summary is not revenue, refund, payout, invoice, accounting export, Stripe reconciliation, provider failure proof, entitlement failure proof, or finance truth.

## Screenshot / Visual Impact

Required because this slice changes visible Admin Analytics UI.

- Comparison type: `after/reference`, comparing the new stage summary to the existing Poolside guide prompt, checkout, and access panels.
- Required screenshots: desktop and mobile after-state for Admin Analytics with the summary visible; include a schema-missing or empty-state artifact when practical.
- Artifact folder: `output/workout-context-commercial-funnel-stage-summary-YYYY-MM-DD-HHMMSS`.
- Stop point: owner screenshot approval is required before `npm run verify:pre-pr`, PR creation, or merge-readiness gates.

## Route / Label / Support Surface Sweep

Run before broad gates because this child adds visible Admin Analytics copy and support interpretation.

Identifiers to search:

- `workoutContextCta`
- `workoutContextCheckoutStarted`
- `workoutContextCheckoutOutcome`
- `upsell_presented`
- `upsell_accepted`
- `checkout_started`
- `checkout_completed`
- `entitlement_granted`
- `Poolside guide`
- `Admin Analytics`
- `analytics dashboard`
- `unique-user conversion`
- `finance`
- `revenue`
- `refund`
- `payout`
- `invoice`
- `Stripe reconciliation`
- `workout_context`
- `workout_saved_post_success`
- `guide_poolside`

Check at minimum:

- `app/`
- `components/`
- `lib/analytics/`
- `lib/commerce/`
- `tests/`
- `docs/api-contracts.md`
- `docs/architecture/`
- `docs/runbooks/`
- Help/Guide sources and assertions
- active/planned/deferred/done analytics, workout, commerce, and AW-006/AW-022 briefs.

Sweep evidence:

- `2026-06-12`: identifiers searched: `workoutContextStageSummary`, `workoutContextCta`, `workoutContextCheckoutStarted`, `workoutContextCheckoutOutcome`, `upsell_presented`, `upsell_accepted`, `checkout_started`, `checkout_completed`, `entitlement_granted`, `Poolside guide stage summary`, `Poolside guide`, `Admin Analytics`, `analytics dashboard`, `unique-user conversion`, `finance`, `revenue`, `refund`, `payout`, `invoice`, `Stripe reconciliation`, `workout_context`, `workout_saved_post_success`, and `guide_poolside`.
- Surfaces checked / directories checked: `app/`, `components/`, `lib/analytics/`, `lib/commerce/`, `tests/`, `docs/api-contracts.md`, `docs/architecture/`, `docs/runbooks/`, `docs/task-briefs/planned`, `docs/task-briefs/in-progress`, and `docs/task-briefs/done`.
- Fallout handled: updated Admin Analytics view-model/UI, Admin Help/Guide copy and assertions, API caveat docs, data-access/authz/cache registry wording, this active child brief, and the parent checkpoint. No route, checkout, Stripe/webhook, entitlement mutation, finance/export, vendor analytics, raw drilldown, pricing, product catalog, migration, RLS, or public SEO surface was added.

## Acceptance Criteria

1. Admin Analytics shows one bounded stage summary for the approved saved-workout Poolside guide path.
2. Stage counts derive only from existing mapped workout-context CTA, checkout handoff, completion, and access aggregates.
3. Stage rates define zero-denominator behavior and do not imply unique users, deduped sessions, revenue, provider reconciliation, or finance truth.
4. Existing detailed Admin Analytics modules keep their current counts, caveats, and review-needed diagnostics.
5. Unknown/missing/future/mismatched source, placement, or product rows remain out of the dedicated summary.
6. Schema-missing, empty, capped, stale, failed-read, zero-denominator, duplicate-count, and review-needed states have deterministic copy.
7. Help/Guide/API/architecture docs when touched and parent/child checkpoints are aligned.
8. Targeted tests pass; screenshot handoff is captured and approved before `npm run verify:pre-pr`.

## Validation

Targeted during implementation:

- `npm run lint:briefs:all`
- `npx vitest run tests/unit/admin-analytics-dashboard-view-model.test.ts tests/unit/admin-analytics-dashboard.test.tsx tests/unit/admin-help-center.test.tsx`
- `npx vitest run tests/unit/admin-analytics-insights.test.ts` only if the API response shape changes
- `npm run typecheck`
- `git diff --check`
- route/label/support-surface sweep
- screenshot handoff with owner approval stop

Completed implementation evidence so far:

- Added `workoutContextStageSummary` view-model derived from existing `workoutContextCta`, `workoutContextCheckoutStarted`, and `workoutContextCheckoutOutcome` aggregate fields.
- Added Admin Analytics `Poolside guide stage summary` UI with stage counts and bounded event-count rates.
- Updated Admin Help/Guide, API contract caveat, data-access/authz/cache registry wording, parent checkpoint, and targeted tests.
- Passed `npx vitest run tests/unit/admin-analytics-dashboard-view-model.test.ts tests/unit/admin-analytics-dashboard.test.tsx tests/unit/admin-help-center.test.tsx`.
- Passed `npm run lint:briefs:all`.
- Passed `npm run typecheck`.
- Passed `npm run lint:quality-gates` after recording explicit sweep identifiers/surfaces evidence.
- Passed `git diff --check`.
- Route/label/support sweep is recorded above and found only expected scoped fallout; no API response shape, analytics event, checkout, Stripe/webhook, entitlement-rule, finance/export, vendor, migration/RLS, product, or builder scope was added.
- Captured after/reference screenshot artifacts at `output/workout-context-commercial-funnel-stage-summary-2026-06-12-122049`; temporary visual capture route/script were removed after generation, and no scoped product-rendering source changed after final capture.
- Owner approved the screenshot handoff in chat on `2026-06-12`.
- Passed `npm run verify:pre-pr` full lane after screenshot approval: branch-current, lint, quality gates, typecheck, unit, build, performance budgets, and Playwright E2E (`106 passed`, `536 skipped` in local scope).

Before merge:

- required PR CI checks
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-06-12 | planned child created | owner approved the recommended next bounded analytics child after PR #1095 and repo-managed closeout PR #1096; created this planned brief from clean synced main@7361488f. Scope is one read-only Admin Analytics stage summary over existing mapped workout-context CTA, checkout handoff, completion, and access aggregates, with no new events, checkout/Stripe/webhook/entitlement-rule/finance/export/vendor/migration/product/builder scope | next: wait for explicit owner execute/build/implement instruction or scope edits`
- `2026-06-12 | child in progress | owner requested implementation on branch workout-context-commercial-funnel-stage-summary-v1; moved this child to in-progress. Scope remains one read-only Admin Analytics stage summary over existing mapped workout-context aggregates, with screenshot approval required before verify:pre-pr and no new events, checkout/Stripe/webhook/entitlement-rule/finance/export/vendor/migration/product/builder scope | next: implement view-model/UI/docs/tests and stop at screenshot handoff before pre-pr`
- `2026-06-12 | stage summary implemented before screenshot | added Admin Analytics stage summary view-model/UI, Help/Guide/API/architecture copy, targeted tests, and route/label/support sweep evidence. Targeted Vitest, typecheck, lint:briefs:all, lint:quality-gates, and git diff check pass. Scope remains read-only Admin Analytics with no API response, event, checkout/Stripe/webhook/entitlement-rule/finance/export/vendor/migration/product/builder change | next: capture screenshot handoff and stop for owner approval before verify:pre-pr`
- `2026-06-12 | stage summary screenshot stop | captured after/reference screenshot artifacts at output/workout-context-commercial-funnel-stage-summary-2026-06-12-122049 for desktop, mobile, schema-missing, and existing access-panel reference states. Temporary capture route/script were removed after generation, no scoped product-rendering source changed after final capture, and owner visual approval is pending before verify:pre-pr | next: wait for owner screenshot approval or visual corrections`
- `2026-06-12 | stage summary pre-pr passed | owner approved screenshots, and the child passed npm run verify:pre-pr full lane with branch-current, lint, quality gates, typecheck, unit, build, performance budgets, and Playwright E2E. No scoped product-rendering source changed after final approved screenshot capture, and no API response shape, event, checkout/Stripe/webhook/entitlement-rule/finance/export/vendor/migration/product/builder scope was added | next: commit, push, open PR, monitor CI, and run child verify:pre-merge`
- `2026-06-12 | stage summary merged | PR #1097 merged at squash commit 38a0d9b3 after green local pre-pr, PR CI, and pre-merge gates. Repo-managed closeout moved this brief to done and keeps future drilldowns, direct checkout, finance reporting, export/raw drilldown, vendor analytics, visible redesign, migrations/RLS, product/pricing, and builder/generator UX deferred | next: complete docs-only closeout validation and rerun post-merge-preflight`

## Completion Record

- `completed`: `2026-06-12`
- `merged_pr`: `#1097`
- `squash_commit`: `38a0d9b3`
- `result`: Closed the read-only Admin Analytics stage summary for saved-workout to Poolside guide by showing CTA, checkout handoff, completion, and access stages from existing bounded aggregates only.
- `validation`: Targeted Vitest, typecheck, brief lint, quality-gate lint, diff check, owner-approved screenshot handoff, `npm run verify:pre-pr` full lane, PR CI, and `npm run verify:pre-merge` full lane all passed.
- `10/10 claim`: yes - all critical target categories reached `5/5`; no remaining target gaps.

| Category                                      | Achieved Score | Evidence                                                                                                                               | Gaps / Notes |
| --------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | Admin Analytics stage summary shipped in PR `#1097`; screenshots approved.                                                             | None.        |
| UX flow clarity                               | `5/5`          | Copy/tests cover stage labels, selected-range event-count caveat, and non-finance interpretation.                                      | None.        |
| Visual design quality                         | `5/5`          | Reused existing Admin Analytics panel language; desktop/mobile/schema-missing screenshots approved.                                    | None.        |
| Business logic correctness and data integrity | `5/5`          | View-model tests prove counts/rates derive only from existing mapped aggregates and zero-denominator behavior.                         | None.        |
| Accessibility (a11y)                          | `5/5`          | Component tests and screenshot review confirm semantic text/list presentation with no new interactive trap.                            | None.        |
| Performance (CWV + payloads)                  | `5/5`          | No dependency, query, route, vendor, or chart added; full pre-pr/pre-merge perf budgets passed.                                        | None.        |
| Data placement and sync boundaries            | `5/5`          | Reads remain server-canonical Admin Analytics aggregates through existing route; no local state or mutation added.                     | None.        |
| Reliability and failure handling              | `5/5`          | Empty, capped, stale, schema-missing, failed-read, and review-needed copy covered by tests/screenshots/docs.                           | None.        |
| Security and authz                            | `5/5`          | Existing admin viewer gate preserved; no public route or data-access widening.                                                         | None.        |
| Privacy and compliance                        | `5/5`          | Rendered values remain bounded counts/labels only; no raw payloads, user IDs, Stripe IDs, or payment data.                             | None.        |
| Content governance                            | `5/5`          | Help/Guide, API caveat, architecture registry, parent checkpoint, and child brief updated.                                             | None.        |
| Analytics and KPI observability               | `5/5`          | Approved workout-context path is readable from CTA shown through access granted with explicit caveats.                                 | None.        |
| Commerce and revenue ops                      | `5/5`          | Copy separates telemetry from checkout proof, Stripe reconciliation, revenue, refunds, payouts, invoices, and finance truth.           | None.        |
| Incident response and support operations      | `5/5`          | Help/Guide and diagnostics caveats explain drop-offs, duplicate counts, stale/capped/schema-missing states, and review-needed handoff. | None.        |
| Finance and reporting operations              | `5/5`          | No finance/export files changed; docs state the summary is not finance reporting or accounting evidence.                               | None.        |
| Stack-fit and dependency discipline           | `5/5`          | Reused `lib/analytics/admin-dashboard.ts`, Admin Analytics UI primitives, and existing test patterns; no dependency added.             | None.        |
| Testing and QA automation                     | `5/5`          | Targeted Vitest, full local gates, PR CI, and pre-merge gate passed.                                                                   | None.        |
