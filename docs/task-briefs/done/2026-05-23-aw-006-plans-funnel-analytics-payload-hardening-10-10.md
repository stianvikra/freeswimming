# Task Brief: AW-006 Plans Funnel Analytics Payload Hardening (10/10)

## Metadata

- `id`: `2026-05-23-aw-006-plans-funnel-analytics-payload-hardening-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-23`
- `updated`: `2026-05-23`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `branch`: `aw-006-plans-funnel-analytics-payload`

## Brief Audit Record

- `last_audited`: `2026-05-23`
- `base`: `main@ce74758`
- `audit_status`: `ready`
- `decision`: Execute the next AW-006 slice as a bounded `/plans` funnel analytics payload hardening pass.
- `reason`: `main` is clean after Poolside Save Image Feedback PR `#812` and repo-managed closeout PR `#813`; `npm run post-merge:preflight` was reported green with no closeout remaining. A fresh queue/design/code re-audit found no selected AW-006 slice and identified `/plans` as already emitting safe funnel events, but without product-level context about which offers were shown and available.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/plans`, analytics event contracts, analytics payload sanitization, commerce catalog IDs, checkout/Stripe behavior, API contracts, verification lanes, or screenshot rules change before PR handoff.

## Goal

Make `/plans` funnel analytics more useful by adding safe product-availability context to existing analytics events without changing event taxonomy, payment behavior, rendered UI, prices, or user data handling.

## Pre-Implementation Owner Explanation

Vi gjor maalingene paa `/plans` mer presise ved aa fortelle analytics hvilke tilbud som faktisk ble vist og hvilke som kunne kjoepes. Det betyr noe fordi salgstrakten kan vurderes uten gjetting. Utenfor scope er design, priser, Stripe/checkout-logikk, e-post, entitlements og persondata.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Business logic correctness and data integrity`
- `Privacy and compliance`
- `Analytics and KPI observability`
- `Commerce and revenue ops`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                 | Evidence                                   | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | `/plans` remains the paid-offers hub and emits clearer product-availability context for the same funnel surface.                                                                   | route diff + unit tests                    | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: no rendered flow, labels, layout, checkout action, or recovery copy changes.                                                                                      | changed-files review                       | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this slice changes no rendered markup, styles, visual layout, assets, screenshots, or brand treatment.                                                                 | no visible UI diff                         | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Product counts and product-id lists must derive from the existing `CatalogProductAvailability` data and must not change product availability, checkout request, or cancel logic.   | unit tests + diff review                   | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes no admin editor, product CRUD, catalog publishing, contextual notes, QR, or operator workflow.                                                      | explicit admin scope rationale             | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because this slice changes no rendered UI, focus behavior, semantics, labels, live regions, or contrast.                                                                       | changed-files review                       | `N/A`                   |
| Accessibility                                 | `N/A`        | N/A because this slice changes no rendered UI, focus behavior, semantics, labels, live regions, or contrast.                                                                       | changed-files review                       | `N/A`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: payload additions are tiny scalar strings/counts; no dependency, media, route data fetch, or heavy client runtime is introduced.                                  | diff review + broad gates                  | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this introduces no persisted local data, server-canonical domain data, browser storage, sync, conflict handling, or cache mutation.                                    | data contract section                      | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, catalog cache, fetch cache, revalidation, mutation response, or invalidation behavior changes.                                                    | cache scope rationale                      | `N/A`                   |
| Reliability and failure handling              | `supporting` | Supporting only: analytics remains best effort through the existing client event sender; route rendering and checkout recovery are unchanged.                                      | component diff + existing tests            | `4/5`                   |
| Security and authz                            | `target`     | Analytics payloads must include only non-sensitive product IDs/counts and must not alter auth, protected routes, checkout authorization, cookies, or secrets.                      | payload review + unit tests                | `5/5`                   |
| Privacy and compliance                        | `target`     | Payload additions must not include email, user ID, Stripe session ID, raw price IDs, secrets, entitlement state, or free-text user content.                                        | payload review + sanitizer contract review | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue and API contract docs record the bounded analytics payload change.                                                                                          | docs diff                                  | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin labels, Help/Guide operator procedure, support recovery action, edit workflow, or support procedure.                                             | Help/Guide rationale                       | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public route metadata, sitemap, robots, canonical URL, structured data, or crawlable content changes.                                                               | changed-files review                       | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity model, structured data, crawl-safe docs page, or AI-facing metadata changes.                                                                 | changed-files review                       | `N/A`                   |
| Analytics and KPI observability               | `target`     | Existing `plans_viewed` and `upsell_presented` events include safe product-count and availability identifiers so product-level exposure can be analyzed without new taxonomy.      | unit tests + API contract docs             | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Funnel measurement becomes clearer while Stripe Checkout, product availability truth, price IDs, invoice/receipt behavior, entitlements, refunds, and finance data stay unchanged. | diff review + checkout tests               | `5/5`                   |
| Incident response and support operations      | `N/A`        | N/A because this slice changes no incident alert path, support workflow, operator diagnostic path, escalation path, runbook, or support recovery procedure.                        | explicit support-ops scope rationale       | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.              | explicit finance scope rationale           | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this slice changes no user-facing product strings, locale routing, translation workflow, metadata localization, or grammar-coupled UI copy.                            | explicit i18n scope rationale              | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing `/plans`, `TrackEventOnMount`, analytics payload sanitizer, catalog availability model, and focused tests; add no dependency or new analytics framework.            | changed-files/dependency diff              | `5/5`                   |
| Testing and QA automation                     | `target`     | Add/update focused unit coverage for available/unavailable product payloads, run targeted validation, then run `npm run verify:pre-pr` and `npm run verify:pre-merge`.             | test commands + gate results               | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: payload size remains bounded by the fixed catalog product IDs and adds no backend call, job, storage, or vendor integration.                                      | diff review                                | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert rollback; no migrations, env changes, packages, workflows, generated assets, or provider configuration changes.                                                  | git diff + validation evidence             | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: existing `app/plans/page.tsx` and `TrackEventOnMount`.
  - Server/client boundary: keep catalog availability calculation in the server route and pass scalar analytics payloads to the existing client tracker.
  - Route/action/API boundary: no checkout API, analytics API, Stripe, auth, or cache boundary changes.
  - Cache/revalidation: no route cache or catalog cache behavior changes.
- TypeScript/domain contracts:
  - Reuse `CatalogProductAvailability` and existing analytics payload scalar sanitizer.
  - Deterministic invariants: shown product IDs come from rendered catalog products, available IDs come only from `product.available`, unavailable IDs come only from `!product.available`, and empty ID sets serialize as `null`.
- Supabase/data layer:
  - N/A; no schema, migration, RLS/authz, generated type, storage, or Supabase data access changes.
- External services/tools:
  - Stripe remains untouched; checkout session creation, price IDs, webhooks, entitlements, invoice/receipt behavior, and provider configuration are out of scope.
  - Analytics keeps the same event route and event names; only safe scalar payload context is added.
- UI system:
  - N/A for visible UI; no screenshot handoff required unless implementation unexpectedly changes rendered markup, copy, style, or layout.
- Testing:
  - Focused unit coverage for `/plans` analytics payloads when products are available and unavailable.
  - Existing checkout-button tests must still pass to prove checkout request/cancel tracking remains unchanged.

## Data Placement And Sync Contract

N/A with rationale: this slice introduces no persisted local-only data, server-canonical domain data, browser storage, sync trigger, conflict policy, cache invalidation, retention rule, or sensitive-data handling. Analytics remains best-effort event logging through the existing client/server event path.

## Identity And Rename Contract

Product IDs in analytics payloads are existing stable catalog identifiers (`CatalogProductId`) and are used only as measurement labels in this slice. This slice creates no new persisted entity, route param, slug, title identity, alias, redirect, migration, rename rule, or repurpose policy.

## Help / Guide Impact

N/A with rationale: this slice changes only invisible analytics payload context. It does not change Help/Guide content, workflow labels, recovery procedures, entitlement rules, support/operator instructions, or admin procedures.

## Route / Label / Support Surface Sweep

Required as a targeted analytics/commerce sweep because `/plans` and funnel payload semantics change.

- Identifiers to search before broad gates:
  - `plans_viewed`
  - `upsell_presented`
  - `productIds`
  - `availableProductIds`
  - `unavailableProductIds`
  - `availableCount`
  - `TrackEventOnMount`
  - `CatalogProductAvailability`
- Surfaces to check:
  - `app/plans/page.tsx`
  - `components/analytics/TrackEventOnMount.tsx`
  - `lib/analytics/events.ts`
  - `docs/api-contracts.md`
  - `tests/unit/plans-page.test.tsx`
  - `tests/unit/checkout-button.test.tsx`
  - canonical AW-006 queue
- Expected fallout:
  - `/plans` route payloads, focused tests, API contract docs, and AW-006 docs only.
  - no checkout API, Stripe payload, event-name taxonomy, database, user-facing copy, Help/Guide, support-procedure, or visual fallout.

## Scope

- Add safe product-count and product-id-list context to existing `/plans` `plans_viewed` and `upsell_presented` analytics payloads.
- Keep payload values scalar and bounded by catalog product IDs.
- Update focused unit tests in `tests/unit/plans-page.test.tsx`.
- Update `docs/api-contracts.md` analytics example.
- Update the canonical AW-006 queue.

## Out Of Scope

- New analytics event names or taxonomy.
- Analytics route behavior, sanitizer behavior, storage backend, dashboard/reporting UI, consent/cookie policy, or vendor integration changes.
- Stripe Checkout Sessions, price IDs, checkout API payloads, entitlements, webhooks, invoice/receipt behavior, refunds, payouts, finance reports, Supabase, auth, email, database, migrations, env vars, workflows, packages, or secrets.
- `/plans` rendered UI, copy, visual layout, metadata, screenshots, product cards, pricing display, support links, checkout buttons, cancel tracking, or recovery flows.
- Broad app-wide analytics redesign.

## Acceptance Criteria

1. `/plans` `plans_viewed` payload includes product count, available count, active count, all shown product IDs, available product IDs, and unavailable product IDs.
2. `/plans` `upsell_presented` payload includes the same safe product context for available-offer exposure without introducing a new event name.
3. Empty available/unavailable ID sets serialize as `null`, not arrays or free text.
4. Payloads include no email, user ID, Stripe session ID, raw price ID, entitlement details, secrets, or user-generated text.
5. Existing checkout button behavior, cancel path tagging, and checkout analytics remain unchanged.
6. API contract docs and canonical AW-006 queue reflect the scoped change.
7. Targeted tests and `npm run verify:pre-pr` pass before PR handoff.

## Validation

Targeted before broad gates:

- `./node_modules/.bin/vitest run tests/unit/plans-page.test.tsx tests/unit/checkout-button.test.tsx`
- `npm run lint:briefs`
- `npm run typecheck`
- targeted route/label/support sweep
- `git diff --check`

Broad gates:

- `npm run verify:pre-pr`
- required PR CI checks green
- before merge recommendation:
  - `npm run verify:pre-merge`

## Manual QA / Screenshot Plan

No screenshot handoff is required because this slice must not change rendered markup, copy, styles, layout, visual assets, print/export output, or brand treatment. If implementation touches visible UI unexpectedly, stop and capture a screenshot handoff before `npm run verify:pre-pr`.

Quality-gate evidence:

- Route/label/support sweep identifiers searched: `plans_viewed`, `upsell_presented`, `productIds`, `availableProductIds`, `unavailableProductIds`, `availableCount`, `TrackEventOnMount`, and `CatalogProductAvailability`.
- Route/label/support sweep surfaces checked: `app/plans/page.tsx`, `components/analytics/TrackEventOnMount.tsx`, `lib/analytics/events.ts`, `docs/api-contracts.md`, `tests/unit/plans-page.test.tsx`, `tests/unit/checkout-button.test.tsx`, this active brief, and the canonical AW-006 queue.
- Route/label/support fallout handled: `/plans` route payloads, focused tests, API contract docs, and AW-006 docs only; no checkout API, Stripe payload, event-name taxonomy, database, user-facing copy, Help/Guide, support-procedure, or visual fallout.
- Screenshot artifact handoff: N/A with rationale because rendered UI is unchanged; no `output/` artifact folder is generated for this invisible analytics payload slice.
- Owner screenshot approval stop: N/A with rationale because there is no visual/rendering delta for the owner to approve.
- Screenshot comparison naming: N/A with rationale because no `before/after` or `after/reference` screenshots are generated for this invisible analytics payload slice.

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands should use escalation-first strategy per repo instructions.

## Checkpoint Log

- `2026-05-23 | in-progress | started from clean main@ce74758 after PR #812 and repo-managed closeout PR #813; post-merge preflight was reported green with no closeout remaining; fresh queue/design/code re-audit selected Plans Funnel Analytics Payload Hardening as the bounded AW-006 analytics slice | next: add safe /plans payload context, update tests/docs, and run targeted QA`
- `2026-05-23 | in-progress | added safe scalar product availability context to /plans plans_viewed and upsell_presented payloads, updated focused unit coverage, API contract docs, and the canonical AW-006 queue; targeted checks passed: ./node_modules/.bin/vitest run tests/unit/plans-page.test.tsx tests/unit/checkout-button.test.tsx, npm run lint:briefs:all, npm run typecheck, targeted route/label/support sweep, and git diff --check; no screenshot handoff is required because rendered UI did not change | next: run npm run verify:pre-pr before commit/push/PR handoff`
- `2026-05-23 | in-progress | first npm run verify:pre-pr stopped in quality-gate evidence because app/plans/page.tsx is conservatively classified as a UI surface; added explicit route/label/support sweep evidence plus N/A screenshot artifact handoff, owner screenshot approval stop, and screenshot comparison naming rationale because this slice has no rendered UI delta | next: rerun npm run verify:pre-pr`
- `2026-05-23 | in-progress | npm run verify:pre-pr passed full lane, committed badc4aad3e7f3a4e7f1f022c43d71889cb1bd27f, pushed branch aw-006-plans-funnel-analytics-payload, opened PR #814, required CI checks passed, and npm run verify:pre-merge passed with marker artifacts/verify-pre-merge/20260523-043051.json; no screenshot artifacts were generated because this is an invisible analytics payload slice | next: owner review and explicit merge approval for PR #814`
- `2026-05-23 | closeout | PR #814 merged as a55b524; moved brief to done and removed stale active queue pointer | next: run docs-only closeout gates and merge closeout PR`

## Completion Record

- `completed`: `2026-05-23`
- `merged_pr`: `#814`
- `squash_commit`: `a55b524`
- `result`: Closed AW-006 Plans Funnel Analytics Payload Hardening by adding safe product-availability context to existing `/plans` funnel events, while leaving rendered UI, Stripe, checkout, prices, entitlements, auth, email, and user data unchanged.
- `validation`: Targeted unit coverage passed; `npm run verify:pre-pr` passed full lane; PR #814 CI passed; `npm run verify:pre-merge` passed on HEAD `fd74628` with marker `artifacts/verify-pre-merge/20260523-050026.json`; screenshot handoff N/A because there was no rendered UI delta.
- `10/10 claim`: yes - all critical target categories reached `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                 | Gaps / Notes |
| --------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | `/plans` remained the paid-offers hub and emitted clearer product-availability context.  | None         |
| Business logic correctness and data integrity | `5/5`          | Payload counts and ID lists derive from `CatalogProductAvailability`; unit tests passed. | None         |
| Security and authz                            | `5/5`          | Payload review confirmed no auth, checkout authorization, cookies, or secrets changed.   | None         |
| Privacy and compliance                        | `5/5`          | Payload excludes email, user ID, Stripe session ID, price IDs, secrets, and free text.   | None         |
| Content governance                            | `5/5`          | API contract docs, AW-006 queue, and this completion record were updated.                | None         |
| Analytics and KPI observability               | `5/5`          | Existing `plans_viewed` and `upsell_presented` events now include bounded safe context.  | None         |
| Commerce and revenue ops                      | `5/5`          | Stripe, checkout, entitlements, refunds, invoices, payouts, and finance data unchanged.  | None         |
| Stack-fit and dependency discipline           | `5/5`          | Reused `/plans`, `TrackEventOnMount`, existing sanitizer path, and catalog model.        | None         |
| Testing and QA automation                     | `5/5`          | Targeted tests, full pre-PR, CI, and pre-merge gates passed.                             | None         |
| DevOps and rollback readiness                 | `5/5`          | Normal git revert rollback; no migrations, env, package, workflow, or provider changes.  | None         |
