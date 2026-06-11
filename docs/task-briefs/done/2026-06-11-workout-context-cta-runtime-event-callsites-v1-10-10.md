# Task Brief: Workout Context CTA Runtime + Event Callsites V1 (10/10)

## Metadata

- `id`: `2026-06-11-workout-context-cta-runtime-event-callsites-v1-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-11`
- `updated`: `2026-06-11`
- `parent_brief`: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- `depends_on`:
  - `docs/task-briefs/done/2026-06-11-workout-context-cta-measurement-contract-v1-10-10.md`
  - `docs/architecture/workout-context-cta-measurement-contract.md`
  - `docs/architecture/workout-context-upsell-placement-policy.md`
- `execution_mode`: `end-to-end-after-explicit-execute`
- `branch`: `workout-context-cta-runtime-v1`

## Brief Audit Record

- `last_audited`: `2026-06-11`
- `base`: clean synced `main@d2e60435` after PR `#1071` closed the Workout Context CTA Measurement Contract V1 closeout and `npm run post-merge:preflight` was reported clean.
- `audit_status`: `closed`
- `decision`: Closed by PR `#1072` / squash commit `36b11d16`.
- `reason`: This child shipped the first non-blocking saved-workout post-success workout-context CTA, privacy-safe `upsell_presented` / `upsell_accepted` callsites, catalog availability fail-closed behavior, Help/Guide/API/architecture support updates, and targeted tests. It did not add Admin Analytics runtime modules, `upsell_declined`, checkout, Stripe, entitlement, finance, vendor analytics, export, raw drilldown, migrations, RLS, route changes, product catalog mutation, new pricing, or builder/generator algorithm changes.
- `must_refresh_before_execution_if`: Refresh before continuing if AGENTS.md, scorecard categories, task brief lint rules, `docs/architecture/workout-context-cta-measurement-contract.md`, `ANALYTICS_EVENT_NAMES`, analytics payload sanitizers, product catalog IDs, checkout/session route contracts, entitlement behavior, workout save surfaces, Help/Guide contracts, or screenshot handoff rules change.

## Goal

Ship the first non-blocking workout-context CTA after a successful saved-workout state, with typed privacy-safe presentation/click telemetry, without changing checkout, entitlement, finance, product catalog, Admin Analytics aggregation, or builder/generator core workflow.

## Pre-Implementation Owner Explanation

Vi legger inn en liten kommersiell CTA etter at en workout faktisk er lagret, og maler bare om CTA-en ble vist og om brukeren klikket. Dette betyr at den vanlige lagre-/redigere-/eksport-flyten fortsatt er viktigst, mens vi far forste runtime-signal for om en poolside guide er relevant i konteksten. Utenfor scope er dashboardmodul, checkout/Stripe-endringer, entitlement, finance, export, tredjeparts analytics, raw drilldown, migrasjoner, nye ruter og ny builder/generator-logikk.

Forward-compatibility-intent: nye CTA-plasseringer, produkter eller event-betydninger skal feile lukket til de er eksplisitt mappet med tester, Help/Guide-kopi og supporttolkning.

## Product Decision

- Placement ID: `workout_saved_post_success`.
- Product ID: `guide_poolside`.
- CTA surface: saved-workout post-success/review state only.
- Presented event: `upsell_presented` emitted only when the mapped CTA is actually rendered.
- Accepted event: `upsell_accepted` emitted only when the user explicitly activates the mapped CTA.
- Declined event: out of scope; no dismiss/cancel metric is defined in this child.
- Destination: existing catalog/commerce route only; no new checkout, product, or entitlement route is added.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the 10/10 claim gate:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility
- Data placement and sync boundaries
- Reliability and failure handling
- Privacy and compliance
- Analytics and KPI observability
- Commerce and revenue ops
- Incident response and support operations
- Finance and reporting operations
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                        | Evidence                                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | One CTA appears only after successful workout save/review and remains secondary to workout continuation, edit, recovery, and export actions.                                              | component/e2e evidence + screenshots                        | `5/5`                   |
| UX flow clarity                               | `target`     | CTA copy must not imply purchase is required to finish, recover, export, edit, or use the saved workout.                                                                                  | screenshot handoff + text assertions                        | `5/5`                   |
| Visual design quality                         | `target`     | Reuse existing card/action language with no oversized marketing layout, no nested-card clutter, and stable mobile/desktop layout.                                                         | screenshot artifacts desktop/mobile                         | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Emit `upsell_presented` only on actual render and `upsell_accepted` only on explicit CTA activation, with exact mapped `placementId` and `productId`; do not emit in forbidden states.    | unit/component tests for render/click/hidden states         | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice adds no admin editor, placement config, CRUD workflow, publish flow, or editable CTA setting.                                                                      | explicit scope rationale                                    | `N/A`                   |
| Accessibility (a11y)                          | `target`     | CTA has clear accessible name, keyboard activation path, semantic link/button behavior, and does not trap focus or hide primary actions.                                                  | Testing Library role assertions + screenshot/manual check   | `5/5`                   |
| Accessibility                                 | `target`     | Closeout validation alias for the same accessibility gate above; the CTA keeps the same accessible-name, keyboard, and semantic-link requirements.                                        | Testing Library role assertions + screenshot/manual check   | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency or vendor script; changed route keeps current payload class and uses existing analytics helper only.                                                                    | package diff + build/pre-pr gate                            | `5/5`                   |
| Data placement and sync boundaries            | `target`     | CTA state is render-only/client-local, analytics rows remain server-canonical through existing analytics ingestion, and product/checkout/entitlement/finance truth stays separate.        | data contract review + analytics tests                      | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no new server config/cache source; product availability must use existing catalog behavior and fail closed if unavailable.                                               | code review + tests                                         | `4/5`                   |
| Reliability and failure handling              | `target`     | Missing/inactive/unavailable product hides the CTA; analytics failures do not block saved-workout UX.                                                                                     | unit/component tests + code path review                     | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no protected route or access boundary changes; checkout and entitlement routes are not widened.                                                                          | changed-files review                                        | `4/5`                   |
| Privacy and compliance                        | `target`     | Payload contains only low-cardinality `placementId`, `productId`, source/surface, and optional approved source dimensions; no workout text, IDs, user identifiers, URLs, or payment data. | analytics payload assertions                                | `5/5`                   |
| Content governance                            | `target`     | Help/Guide/support wording and parent checkpoint align with the new visible CTA and its non-finance interpretation.                                                                       | Help/Guide/runbook/docs updates + route/label/support sweep | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin mutation, role-gated workflow, editable config, or operator workflow changes are added.                                                                              | explicit scope rationale                                    | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this slice adds no public route, metadata, sitemap, robots, canonical URL, structured data, or crawlable landing copy.                                                        | explicit SEO scope rationale                                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this slice adds no public semantic page, structured data, public docs page, or AI-facing crawl surface.                                                                       | explicit AI-discoverability scope rationale                 | `N/A`                   |
| Analytics and KPI observability               | `target`     | Runtime CTA emits first-party events with exact mapped semantics and remains separate from Admin Analytics dashboard aggregation until a later child maps it.                             | event tests + docs caveats                                  | `5/5`                   |
| Commerce and revenue ops                      | `target`     | CTA click remains clicked intent only; checkout start/completion, entitlement, Stripe reconciliation, revenue, refunds, payouts, invoices, and finance reporting remain separate.         | copy review + support docs                                  | `5/5`                   |
| Incident response and support operations      | `target`     | Support can explain when the CTA should appear, why it may be absent, what the events mean, and what they do not mean.                                                                    | Help/Guide or runbook update + sweep evidence               | `5/5`                   |
| Finance and reporting operations              | `target`     | CTA telemetry is explicitly not revenue, refund, payout, invoice, accounting export, entitlement, Stripe reconciliation, or finance truth.                                                | Help/Guide/runbook copy + PR summary                        | `5/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: machine IDs remain locale-independent and visible copy is short/localizable, but full locale workflow is out of scope.                                                   | copy review + explicit future mapping rule                  | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next.js, React, TypeScript, catalog, checkout-link, and analytics helpers; add no dependency or vendor script.                                                             | changed-files/package diff + tests                          | `5/5`                   |
| Testing and QA automation                     | `target`     | Add targeted tests for render, hidden/fail-closed, click, and payload; run targeted tests and screenshot handoff before owner-approved pre-PR gate.                                       | targeted tests + screenshot handoff + later verify gates    | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: event dimensions stay low-cardinality and no rollup/export/warehouse query is added.                                                                                     | payload review                                              | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Feature is revertable without migration/provider/env changes; rollback is removing the CTA and callsites while existing commerce surfaces continue.                                       | PR rollback notes + no migration/dependency evidence        | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Identify and reuse the mature saved-workout post-save/review surface instead of creating a new route.
  - CTA must stay secondary to existing saved-workout actions.
  - Route/action/API boundary must remain unchanged; no new checkout/session route is added.
  - No server cache or revalidation behavior is changed.
- TypeScript/domain contracts:
  - Use existing `ANALYTICS_EVENT_NAMES` events: `upsell_presented` and `upsell_accepted`.
  - Use stable constants for `placementId`, `productId`, `source`, and `surface`.
  - Keep payload dimensions low-cardinality and sanitized through existing client analytics helper.
  - Do not define `upsell_declined` semantics.
- Supabase/data layer:
  - No migration, RLS change, generated type update, raw payload read, rollup job, or index change.
  - Future persisted rows flow through existing analytics ingestion.
- External services/tools:
  - No Stripe API, Checkout Session payload, webhook, portal, finance script, vendor analytics, cookie, tag manager, SDK, secret, or env-var change.
  - Existing `/plans` or checkout surfaces continue to own purchase behavior.
- UI system:
  - Use existing typography, spacing, card/action language, and responsive constraints from the surrounding workout surface.
  - Provide before/after or after/reference screenshot artifacts for desktop and mobile, plus any relevant hidden/fail-closed state evidence.
- Testing:
  - Add unit/component coverage for visible CTA, hidden CTA when product unavailable/forbidden, presentation event, click event, and payload contents.
  - Add e2e/screenshot coverage only as needed for the changed surface.

## Data Placement And Sync Contract

- Server-canonical:
  - Future analytics rows in `analytics_events`.
  - Product identity and availability from the existing catalog/product source.
  - Checkout truth, entitlement truth, Stripe truth, and finance truth remain in their existing separate systems.
- Local/browser:
  - Transient rendered CTA visibility and click state only.
  - Best-effort analytics emission may duplicate on retry; no dedupe contract is added here.
  - No analytics cookie, visitor ID, localStorage attribution, ad click ID, user-to-public bridge, or admin preference.
- Sync policy:
  - CTA presentation/click events are telemetry only and must not mutate product catalog, checkout, entitlement, finance, or workout state.
  - Analytics failure must fail soft and keep workout save/review usable.
- Retention and sensitivity:
  - Existing analytics retention applies.
  - Payload must exclude raw workout title, notes, step text, generated prompt, raw workout JSON, private workout row ID, email, user ID, visitor ID, IP, User-Agent, raw URL/referrer/query, payment data, Stripe IDs, support content, and free text.
- Cache/invalidation:
  - No new runtime config cache is added.
  - If catalog/product availability is unavailable, CTA fails closed.

## Identity And Rename Contract

- Canonical stable IDs:
  - `placementId`: `workout_saved_post_success`.
  - `productId`: `guide_poolside`.
  - `event_name`: `upsell_presented` and `upsell_accepted`.
- Human-readable identifiers:
  - CTA copy, product title, route label, and Help/Guide text are display-only and renameable when meaning is unchanged.
- Mutability rules:
  - Placement and product mapping are write-once for this child once shipped.
  - Event meanings are append-only and must not redefine existing `/plans` or My Library baseline meanings.
- Rename vs repurpose:
  - Copy-only clarity is a rename.
  - Moving the CTA to a different user moment, changing product promise, adding decline semantics, or treating clicks as checkout/finance truth is repurpose and requires a new child.
- Compatibility contract:
  - Unknown, inactive, unavailable, deprecated, or unmapped products hide the CTA.
  - Future placement IDs/products require explicit mapping before presentation.
- Observability and repair:
  - Support interpretation lives in Help/Guide/runbook copy and event payload tests.
  - Unknown values may be handled by later dashboard diagnostics only.

## Forward Compatibility Contract

- Extensibility surfaces:
  - CTA placement IDs, product IDs, catalog availability, checkout links, analytics payload dimensions, route labels, Help/Guide copy, locales, Admin Analytics modules, export formats, vendor forwarding, and finance/reporting surfaces.
- Source of truth:
  - Event names come from `ANALYTICS_EVENT_NAMES`.
  - Product identity comes from the catalog product ID.
  - CTA placement identity comes from this child's typed mapping.
  - Checkout, entitlement, Stripe, and finance truth stay in their existing canonical systems.
- Additive behavior:
  - Existing `/plans` and My Library upsell events continue to work.
  - The workout-context CTA can later be counted by a dedicated dashboard mapping child because payload IDs are stable and low-cardinality.
- Explicit mapping requirements:
  - New CTA placements, new products, `upsell_declined`, checkout attribution, entitlement-aware targeting, finance reporting, CSV/export, raw drilldown, vendor analytics, localized commercial claims, or public landing/SEO copy require a new child.
- Unknown or deprecated values:
  - Unknown/inactive/unavailable products and unmapped placements fail closed and show no CTA.
  - Unknown values must not imply conversion, entitlement, revenue, or finance truth.
- Test/evidence:
  - Tests must cover visible mapped CTA, hidden fail-closed product state, event payload shape, and no forbidden identifiers.
  - Route/label/support sweep must run before broad gates.

## Scope

- Add the first workout-context CTA to the existing saved-workout post-success/review surface.
- Use `placementId=workout_saved_post_success` and `productId=guide_poolside`.
- Emit privacy-safe `upsell_presented` and `upsell_accepted` events using existing analytics helpers.
- Add or update targeted tests for CTA rendering, fail-closed behavior, and event payloads.
- Update Help/Guide/runbook or support docs for what this CTA and events mean.
- Update parent brief checkpoint and this child checkpoint log.
- Capture screenshot handoff and stop for owner approval before `npm run verify:pre-pr`.

## Out Of Scope

- Admin Analytics runtime module or dashboard aggregation for workout-context CTA.
- `upsell_declined` semantics or dismiss/cancel tracking.
- Checkout, Stripe, webhook, billing portal, entitlement, claim, finance, accounting, refund, payout, invoice, reconciliation, vendor analytics, export, CSV, raw drilldown, migration, RLS, route creation, product catalog mutation, new pricing, or builder/generator algorithm changes.
- Treating CTA click as checkout completion, entitlement, revenue, unique-user conversion, or finance truth.
- Merging without explicit owner approval.

## Acceptance Criteria

1. The CTA appears only in the mapped saved-workout post-success/review context and stays visually secondary to core workout actions.
2. The CTA is hidden when the mapped product is unavailable, inactive, unknown, or cannot be resolved safely.
3. Rendering the CTA emits `upsell_presented` with only approved low-cardinality payload dimensions.
4. Activating the CTA emits `upsell_accepted` with the same mapped placement/product dimensions and then follows the existing product/commerce destination.
5. No payload includes raw workout IDs, titles, notes, workout JSON, user identifiers, URLs, referrers, IPs, user agents, payment data, Stripe IDs, or free text.
6. Help/Guide or runbook copy explains the CTA and event semantics without implying checkout completion, entitlement, revenue, or finance truth.
7. Targeted tests pass.
8. Screenshot handoff is captured with desktop/mobile artifacts and owner approval is received before `npm run verify:pre-pr`.

## Validation

Targeted during implementation:

- `npm run lint:briefs`
- Relevant Vitest tests for the changed workout CTA/component and analytics payloads
- Relevant component/e2e screenshot capture for the changed surface
- `git diff --check`

After owner screenshot approval:

- `npm run verify:pre-pr`
- push branch and open/update PR
- required CI checks green
- `npm run verify:pre-merge`

## Route / Label / Support Surface Sweep

Run before broad gates because this child adds visible CTA copy, event callsites, and support interpretation.

Search at minimum:

- `workout_saved_post_success`
- `guide_poolside`
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
- `CTA`
- `workout-context`

Check at minimum:

- `app/`
- `components/`
- `lib/analytics/`
- `lib/commerce/`
- `tests/`
- `docs/api-contracts.md`
- `docs/architecture/`
- `docs/runbooks/`
- active/planned/done task briefs

## Screenshot / Visual Impact

Required because this slice changes visible UI.

- Comparison type: `before/after` if a stable before-state is practical; otherwise `after/reference` against the mature saved-workout surface.
- Required screenshots: mobile and desktop after-state for the changed saved-workout context, plus one relevant fail-closed/hidden or reference state when practical.
- Artifact folder: `output/workout-context-cta-runtime-YYYY-MM-DD-HHMMSS`.
- Stop point: owner screenshot approval is required before `npm run verify:pre-pr`, PR creation, or merge-readiness gates.

## Quality Gate Evidence

- API and server actions failure-mode evidence: this slice adds no new API route or server action; the only new server helper is `loadWorkoutContextCtaProductAvailable`, which catches catalog override lookup failure and falls back to the existing env catalog. Product unavailable/inactive states fail closed by hiding the CTA, so there is no unexpected 500 path for the workout save/review surface.
- Route/label/support sweep identifiers searched: `workout_saved_post_success`, `guide_poolside`, `workout_context`, `saved_workout_post_success`, `upsell_presented`, `upsell_accepted`, `upsell_declined`, `checkout_started`, `checkout_completed`, `entitlement_granted`, `Admin Analytics`, `Help/Guide`, `Stripe`, `finance`, `revenue`, `CTA`, and `workout-context`.
- Route/label/support surfaces checked: `app/`, `components/`, `lib/analytics/`, `lib/commerce/`, `tests/`, `docs/api-contracts.md`, `docs/architecture/`, `docs/runbooks/`, `docs/task-briefs/planned/`, `docs/task-briefs/in-progress/`, and relevant `docs/task-briefs/done/` history. Fallout handled in this slice is limited to the new WorkoutBuilderHub callsites, analytics/catalog helpers, admin-insights baseline isolation, targeted tests, Help/Guide/API/architecture docs, parent brief, and child brief.
- UI reference surface / shared component evidence: the changed CTA reuses the existing saved-workout post-success `WorkoutBuilderFeedback` surface inside `WorkoutBuilderHub`, plus existing `TrackEventOnMount` and `TrackedLink` analytics components. It does not create a new route, modal, marketing card, checkout surface, or separate CTA renderer.
- Session-step reference contract: `docs/design/session-step-surface-contract.md` and the existing `SessionStepSurfaceRenderer` / `WorkoutEditor` session-step display model remain unchanged; the CTA sits above the mature session-step editor in the saved-workout success notice and does not change `Edit`, `Rearrange`, or `View` session-step behavior.

## Checkpoint Log

- `2026-06-11 | in-progress | created active child on branch workout-context-cta-runtime-v1 from clean synced main@d2e60435 after owner explicitly executed the runtime CTA child | next: inspect saved-workout surface and implement scoped CTA/callsites`
- `2026-06-11 | implementation + targeted validation | added the saved-workout post-success CTA, typed workout-context payload builder, catalog availability guard, server availability loader, page prop wiring, Admin Analytics baseline isolation, Help/Guide/support docs, and targeted Vitest coverage for visible/hidden CTA states, render/click events, payload privacy, catalog availability, and existing upsell baseline isolation. Validation passed: npm exec vitest run tests/unit/workout-builder-hub.test.tsx tests/unit/workout-builder-analytics.test.ts tests/unit/commerce-catalog.test.ts tests/unit/admin-analytics-insights.test.ts tests/unit/admin-help-center.test.tsx; git diff --check. The Vitest run logged the expected jsdom navigation warning after clicking the tracked link, but all 91 assertions passed. npm run lint:briefs ran before the new brief was tracked and reported no changed briefs, so brief lint still needs to run again before pre-PR | next: capture screenshot handoff and wait for owner visual approval`
- `2026-06-11 | screenshot handoff captured | captured after/reference screenshot artifacts at output/workout-context-cta-runtime-2026-06-11-105229, Captured: 2026-06-11 10:52. Local /dev/login was blocked by the repo Supabase egress guard because the local env points at a cloud Supabase project, so capture used a temporary local screenshot harness rendering the real SiteChrome route shell and WorkoutBuilderHub with deterministic data plus Playwright-mocked save/analytics responses. The temporary harness and capture script were removed after capture. Artifact evidence includes desktop post-save CTA, mobile post-save CTA, and desktop fresh-load reference with CTA hidden; metrics recorded no horizontal overflow, no console warnings/errors, and no page errors. No scoped product-rendering source files changed after the final capture; only this brief checkpoint was updated | next: wait for owner screenshot approval before route/label/support sweep, npm run lint:briefs:all, npm run verify:pre-pr, PR creation, or merge-readiness gates`
- `2026-06-11 | screenshots approved and sweep complete | owner approved the screenshot handoff in chat. Route/label/support sweep ran with rg across app, components, lib, tests, docs/api-contracts.md, docs/architecture, docs/runbooks, and docs/task-briefs for workout_saved_post_success, guide_poolside, workout_context, saved_workout_post_success, upsell_presented, upsell_accepted, upsell_declined, checkout_started, checkout_completed, entitlement_granted, Admin Analytics, Help/Guide, Stripe, finance, revenue, CTA, and workout-context. Expected fallout was limited to the new WorkoutBuilderHub callsites, analytics/catalog helpers, admin-insights baseline isolation, targeted tests, Help/Guide/API/architecture/brief updates, and existing checkout/Stripe/entitlement references that remain separate. No extra route, product catalog mutation, checkout, Stripe, entitlement, finance, vendor, export, raw drilldown, migration, RLS, or Admin Analytics runtime module scope was found | next: run brief lint, targeted tests, git diff check, and npm run verify:pre-pr`
- `2026-06-11 | pre-pr gate passed | validation passed after screenshot approval: npm run lint:briefs:all, git diff --check, npm exec vitest run tests/unit/workout-builder-hub.test.tsx tests/unit/workout-builder-analytics.test.ts tests/unit/commerce-catalog.test.ts tests/unit/admin-analytics-insights.test.ts tests/unit/admin-help-center.test.tsx, npm run lint:quality-gates, and npm run verify:pre-pr. The pre-pr gate used the full lane because runtime/test files changed, confirmed the branch contains origin/main@d2e60435, and passed lint, typecheck, unit tests, build, performance budgets, and Playwright e2e. Performance budget trend recommendation remained hold after 9/2 green runs because the margin was 13.4% of the 15.0% tightening threshold. No scoped product-rendering source files changed after the final screenshot capture; only brief evidence was updated | next: commit, push, open PR, monitor CI, and run npm run verify:pre-merge before merge readiness`
- `2026-06-11 | runtime CTA child merged | PR #1072 merged at squash commit 36b11d16 after green local pre-pr, PR CI, and pre-merge gates; this closeout moved the child to done and confirms Admin Analytics runtime modules, upsell_declined, checkout, Stripe, entitlement, finance, vendor analytics, export, raw drilldown, migrations, RLS, route changes, product catalog mutation, new pricing, and builder/generator algorithm changes remain deferred to future owner-approved children | next: rerun post-merge preflight after closeout PR merges`

## Completion Record

- `completed`: `2026-06-11`
- `merged_pr`: `#1072`
- `squash_commit`: `36b11d16`
- `result`: Shipped the first saved-workout post-success workout-context CTA and safe event callsites so the product can measure whether the Poolside guide CTA is shown and clicked after a workout is saved, without treating that signal as checkout, entitlement, revenue, or finance truth.
- `validation`: `npm run lint:briefs:all`, `git diff --check`, targeted Vitest for workout CTA rendering/events, payload privacy, catalog availability, Admin Analytics baseline isolation, and Help/Guide copy, `npm run lint:quality-gates`, `npm run verify:pre-pr` full lane, PR `#1072` CI, and `npm run verify:pre-merge` all passed. Screenshot artifacts were captured at `output/workout-context-cta-runtime-2026-06-11-105229` and owner-approved before pre-PR; no scoped product-rendering source files changed after final capture.
- `10/10 claim`: yes - all critical target categories reached `5/5` for this bounded runtime CTA and event-callsites scope.

| Category                                      | Achieved Score | Evidence                                                                                                                                                              | Gaps / Notes                                      |
| --------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Product goals and IA                          | `5/5`          | CTA appears only in the saved-workout post-success context and stays secondary to workout continuation/edit/recovery/export actions.                                  | None for this child.                              |
| UX flow clarity                               | `5/5`          | Screenshot handoff and component tests confirm the CTA is a secondary action and does not imply purchase is required to finish, recover, export, edit, or save.       | None.                                             |
| Visual design quality                         | `5/5`          | After/reference desktop/mobile screenshots reuse the existing `WorkoutBuilderFeedback` action language with no layout overflow or console/page errors.                | None.                                             |
| Business logic correctness and data integrity | `5/5`          | Unit/component tests cover visible/hidden CTA states, exact `placementId=workout_saved_post_success`, `productId=guide_poolside`, and render/click event semantics.   | Dedicated dashboard deferred.                     |
| Accessibility (a11y)                          | `5/5`          | Testing Library accessible-name assertion and semantic `TrackedLink` reuse preserve keyboard/link behavior and status-region semantics.                               | None.                                             |
| Accessibility                                 | `5/5`          | Same accessibility closeout gate as the canonical `Accessibility (a11y)` row; the explicit alias satisfies current done-brief 10/10 validation.                       | None.                                             |
| Performance (CWV + payloads)                  | `5/5`          | No dependency or vendor script was added; `npm run verify:pre-pr` passed build and performance budgets with hold recommendation.                                      | None.                                             |
| Data placement and sync boundaries            | `5/5`          | CTA state remains render-only/client-local; analytics ingestion, product availability, checkout, entitlement, Stripe, and finance truth remain in existing systems.   | None.                                             |
| Reliability and failure handling              | `5/5`          | Catalog helper and tests hide the CTA when `guide_poolside` is missing, inactive, or unavailable; analytics remains best-effort and non-blocking.                     | None.                                             |
| Privacy and compliance                        | `5/5`          | Payload tests assert only low-cardinality source/surface/placement/product/sourceKind/builderMode fields and no workout IDs, titles, notes, users, URLs, or payments. | None.                                             |
| Content governance                            | `5/5`          | Help/Guide, API contract, measurement contract, placement policy, parent brief, child brief, and route/label/support sweep evidence were updated.                     | None.                                             |
| Analytics and KPI observability               | `5/5`          | `upsell_presented` and `upsell_accepted` are emitted through existing helpers and Admin Analytics baseline isolation keeps current `/plans`/library totals unchanged. | Workout-context dashboard mapping remains future. |
| Commerce and revenue ops                      | `5/5`          | Docs and support copy keep CTA click separate from checkout start/completion, entitlement, Stripe reconciliation, revenue, refunds, payouts, invoices, and finance.   | Commerce implementation deferred.                 |
| Incident response and support operations      | `5/5`          | Help/Guide explains when the CTA appears, why it may be absent, and what presentation/click events mean and do not mean.                                              | None.                                             |
| Finance and reporting operations              | `5/5`          | API/support docs state workout-context CTA telemetry is not revenue, refund, payout, invoice, accounting export, entitlement, Stripe, or finance truth.               | None.                                             |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing Next.js route surfaces, `WorkoutBuilderHub`, `TrackEventOnMount`, `TrackedLink`, catalog helpers, and analytics helpers; no dependency added.         | None.                                             |
| Testing and QA automation                     | `5/5`          | Targeted Vitest, `npm run verify:pre-pr`, PR `#1072` CI, and `npm run verify:pre-merge` all passed.                                                                   | None.                                             |
| DevOps and rollback readiness                 | `5/5`          | Change is revertable without migrations, env/provider changes, route creation, product catalog mutation, or external service rollout.                                 | None.                                             |
