# Task Brief: Workout Context Plans Checkout Attribution Bridge V1 (10/10)

## Metadata

- `id`: `2026-06-11-workout-context-plans-checkout-attribution-bridge-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-11`
- `updated`: `2026-06-11`
- `parent_brief`: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- `depends_on`:
  - `docs/task-briefs/done/2026-06-11-workout-context-cta-runtime-event-callsites-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-11-workout-context-cta-admin-analytics-mapping-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-11-workout-checkout-attribution-finance-separation-contract-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-11-checkout-started-attribution-hardening-v1-10-10.md`
  - `docs/architecture/workout-context-cta-measurement-contract.md`
  - `docs/architecture/workout-checkout-attribution-finance-separation-contract.md`
  - `docs/architecture/data-access-authz-cache-contract-registry.md`
- `execution_mode`: `end-to-end-after-explicit-execute`
- `branch`: `workout-context-plans-checkout-attribution-bridge-v1`

## Brief Audit Record

- `last_audited`: `2026-06-11`
- `base`: clean synced `main@6a858185` after PR `#1078` and closeout PR `#1079`; `npm run post-merge:preflight` was reported clean.
- `audit_status`: `ready`
- `decision`: Execute this bounded child on branch `workout-context-plans-checkout-attribution-bridge-v1`.
- `reason`: The owner explicitly requested implementation. The saved-workout CTA and its Admin Analytics mapping are complete, and `/api/checkout/session` now supports privacy-safe `checkout_started` attribution. The current CTA still routes through `/plans`, where checkout-start attribution would otherwise remain generic `plans`; this bridge should preserve the mapped workout-context source for checkout-start only, without direct checkout or finance interpretation.
- `must_refresh_before_execution_if`: Refresh before execution if AGENTS.md, the task brief template, scorecard categories, `components/my-library/workouts/WorkoutBuilderHub.tsx`, `app/plans/page.tsx`, `components/my-library/CheckoutButton.tsx`, `lib/commerce/checkout.ts`, `app/api/checkout/session/route.ts`, `ANALYTICS_EVENT_NAMES`, Admin Analytics insight contracts, product catalog rules, checkout/Stripe contracts, Help/Guide contracts, route/label/support sweep rules, or the parent funnel brief change.

## Goal

Preserve safe workout-context attribution from the saved-workout CTA through `/plans` into the existing checkout-start request, so `checkout_started` can later be reported for the mapped workout-context path without treating CTA clicks, plan-page clicks, payment, entitlement, revenue, or finance as the same truth.

## Pre-Implementation Owner Explanation

Vi lager en trygg bro mellom workout-CTA-en og plans-siden. Det betyr at nar en bruker klikker "See Poolside guide" etter a ha lagret en workout, kan plans-checkout senere sende med en lavrisiko kilde/plassering til checkout-start-malingen. Dette er viktig fordi vi kan male veien fra workout-interesse til checkout-handoff uten a hoppe direkte til Stripe eller late som noen har kjopt. Utenfor scope er ny shop, nye produkter, direkte workout-checkout, dashboardmodul, Stripe-webhooks, checkout completion, entitlement, finance, revenue, `upsell_declined`, export/CSV, raw drilldown, pricing og produktkatalog-endringer.

Forward-compatibility-intent: nye shop-produkter, CTA-plasseringer eller checkout-kilder skal ikke automatisk blandes inn i dagens Poolside/workout-context KPI-er; de kan flyte generisk der det er trygt, men dedikerte KPI-er krever eksplisitt mapping med tester, Help/Guide-kopi og support-rationale.

## Product Questions

This child answers only these questions:

1. How should the current saved-workout CTA carry a mapped checkout attribution hint to `/plans`?
2. How should `/plans` decide whether a checkout request is still generic plans traffic or the approved workout-context path?
3. How do we keep client `upsell_accepted` telemetry separate from server-side `checkout_started` attribution?
4. Which query/request values must be allowlisted, ignored, or normalized to avoid future shop/product leakage?
5. Which tests prove unknown, malformed, future, or unrelated products do not count as workout-context checkout attribution?

## Planned Implementation Boundary

The implementation should add only a checkout-attribution bridge for the already shipped path:

- Keep the saved-workout CTA destination as `/plans`, not direct Stripe Checkout.
- Add only low-cardinality attribution hints to the CTA destination, for example:
  - `source=workout_context`
  - `placementId=workout_saved_post_success`
  - `productId=guide_poolside`
- Parse those hints on `/plans` through a typed helper; never trust raw query strings directly.
- Apply workout-context checkout attribution only when all mapped values match:
  - `source=workout_context`
  - `placementId=workout_saved_post_success`
  - `productId=guide_poolside`
  - the checkout button target product is also `guide_poolside`
- Split client upsell telemetry from server checkout attribution:
  - existing plans checkout button client `upsell_accepted` telemetry should remain plans-surface telemetry unless a later child explicitly changes that meaning,
  - the server `/api/checkout/session` request may carry the mapped checkout attribution separately.
- Include the approved `placementId` in the checkout-start request body only for the mapped pair.
- Preserve existing checkout redirect behavior, pending/error feedback, safe cancel path, product availability checks, and checkout-start route validation.
- Do not create a new event name, dashboard module, route, Stripe integration surface, entitlement write, finance report, vendor export, raw drilldown, migration, RLS change, pricing change, product catalog mutation, or visible CTA copy/layout change.

Implementation should avoid:

- using browser storage, cookies, referrers, ad click IDs, visitor IDs, user IDs, emails, or raw URLs for attribution,
- treating all `/plans` traffic after a workout CTA as workout-context traffic,
- treating all `guide_poolside` checkout starts as workout-context traffic,
- counting future shop products, future placement IDs, or malformed query values in the mapped workout-context checkout path.

## Implementation Checkpoint

Implemented runtime boundary:

- `lib/commerce/checkout.ts` now owns the explicit mapped bridge identity:
  - `source=workout_context`
  - `placementId=workout_saved_post_success`
  - `productId=guide_poolside`
- `buildWorkoutContextPlansHref()` builds the saved-workout CTA destination with only low-cardinality mapped values and no private workout data.
- `resolvePlansCheckoutAttributionForProduct()` applies workout-context checkout attribution only when the incoming `/plans` query and the clicked checkout product both match the mapped bridge.
- `components/my-library/workouts/WorkoutBuilderHub.tsx` keeps the existing visible CTA but sends users to the mapped `/plans` URL.
- `app/plans/page.tsx` reads `searchParams` server-side and passes mapped checkout attribution only to the approved Poolside checkout button.
- `components/my-library/CheckoutButton.tsx` now separates:
  - client `upsell_accepted` telemetry and checkout-cancel source, which remain the visible surface source such as `plans`,
  - server checkout-start attribution, which may be `workout_context` only for the mapped bridge.

No direct workout-context checkout, new shop route, new product, dashboard module, Stripe Session creation option, Stripe webhook, entitlement mutation, finance reporting, export, raw drilldown, vendor analytics, pricing, product catalog mutation, migration, RLS change, visible copy/layout/style change, or builder/generator algorithm change was added.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the 10/10 claim gate:

- Product goals and IA
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
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                    | Evidence                                                                   | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The bridge preserves the existing workout CTA -> `/plans` flow while making checkout-start attribution more truthful for the mapped path only.                                                        | CTA/plans/checkout contract tests + route/label/support sweep              | `5/5`                   |
| UX flow clarity                               | `target`     | User-visible navigation, button labels, pending state, error state, and cancel behavior remain unchanged; no new dead-end is introduced.                                                              | component tests + manual route review                                      | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: no visual/copy/layout/style change is planned; if implementation changes rendered UI, screenshot handoff becomes required before `verify:pre-pr`.                                    | no visual diff evidence or screenshot artifacts if triggered               | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Workout-context checkout attribution is applied only for the exact mapped source/placement/product/button pair; unknown/future/malformed values are excluded or normalized safely.                    | typed helper tests + CheckoutButton/plans tests                            | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor, mutable config, publishing, or content management workflow.                                                                                                 | explicit admin-editor scope rationale                                      | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: existing CTA/button semantics, focus, labels, and screen-reader behavior must remain unchanged if touched.                                                                           | component assertions + no visible UI change review                         | `4/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no dependency, chart, bundle-heavy client state, storage, or extra network request; route-level performance gates remain green.                                                      | package diff + build/pre-pr gate                                           | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Attribution hints are transient URL/request values; checkout-start truth remains server-canonical at `/api/checkout/session`; no browser-owned commerce truth is introduced.                          | data contract + request-body tests                                         | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no new cache, revalidation, or admin insight cache behavior; `/plans` and checkout route cache behavior must remain deterministic.                                                   | route/cache review                                                         | `4/5`                   |
| Reliability and failure handling              | `target`     | Missing, malformed, unknown, deprecated, or future attribution hints fall back safely without breaking plans checkout or emitting mapped workout-context checkout attribution.                        | negative-path tests                                                        | `5/5`                   |
| Security and authz                            | `target`     | Browser-provided attribution is never trusted as product/price/provider truth; checkout still fails closed for invalid products and uses catalog-backed IDs.                                          | security-focused component/helper/route tests + no authz widening evidence | `5/5`                   |
| Privacy and compliance                        | `target`     | Attribution includes only allowlisted low-cardinality machine IDs and excludes raw URLs/referrers, Stripe IDs, user IDs, emails, visitor IDs, IPs, user agents, and payment details.                  | payload/request assertions + docs review                                   | `5/5`                   |
| Content governance                            | `target`     | API/support docs, Help/Guide interpretation, and parent/child checkpoints align on what the bridge means and what it cannot prove.                                                                    | docs updates + route/label/support sweep + lint:briefs                     | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this adds no admin workflow, operator mutation, role-gated edit action, or recovery action.                                                                                               | explicit admin-workflow scope rationale                                    | `N/A`                   |
| SEO and crawlability                          | `supporting` | Supporting only: `/plans` query parameters must not create new canonical public pages, sitemap entries, metadata variants, or crawlable product claims.                                               | route/metadata review                                                      | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: no new public semantic content is planned; query attribution must not create AI-facing commerce claims.                                                                              | public-content scope review                                                | `4/5`                   |
| Analytics and KPI observability               | `target`     | Checkout-start attribution can distinguish the mapped workout-context handoff from generic plans traffic without implying checkout completion, entitlement, revenue, or unique users.                 | analytics payload tests + docs caveats                                     | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Existing checkout remains Stripe-hosted and catalog-backed; this child does not change pricing, fulfillment, checkout completion, entitlement, revenue, refunds, payouts, invoices, or finance truth. | checkout unchanged evidence + commerce contract review                     | `5/5`                   |
| Incident response and support operations      | `target`     | Support can distinguish generic plans checkout starts, mapped workout-context checkout starts, unknown attribution, checkout unavailable, and provider failure without raw identifiers.               | Help/Guide/API notes + failure-state tests                                 | `5/5`                   |
| Finance and reporting operations              | `target`     | Finance truth remains outside this slice; mapped workout-context checkout-start counts cannot be used as revenue, refund, payout, invoice, accounting export, or reconciliation evidence.             | finance caveat docs + no finance/export changed-files evidence             | `5/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: machine IDs remain locale-independent; no new localized purchase claims or copy are planned.                                                                                         | copy/scope review                                                          | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next.js route/page boundaries, CheckoutButton, commerce checkout helper, catalog IDs, and test stack; add no dependency or vendor.                                                     | changed-files review + package diff                                        | `5/5`                   |
| Testing and QA automation                     | `target`     | Add targeted helper/component/page tests plus broad gates before PR/merge; changed briefs must pass `npm run lint:briefs`.                                                                            | targeted Vitest + typecheck + quality gates + verify gates                 | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Attribution dimensions stay low-cardinality and bounded; no raw drilldown, warehouse, export, rollup, vendor forwarding, or per-user tracking is added.                                               | payload review + no storage/vendor/dependency evidence                     | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Change is revertable without migration, provider config, env var, dependency, or schema changes; rollback restores generic plans attribution.                                                         | PR rollback notes + no migration/env/dependency evidence                   | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface/shared component: reuse the existing saved-workout CTA surface in
    `WorkoutBuilderHub`, existing `/plans` product card surface, and shared `CheckoutButton`
    instead of creating a shop route, new checkout widget, or route-local checkout markup.
  - Reuse `components/my-library/workouts/WorkoutBuilderHub.tsx` for the existing saved-workout CTA.
  - Reuse `app/plans/page.tsx` as the existing plans route; do not create a shop route or new landing route in this child.
  - Reuse `components/my-library/CheckoutButton.tsx` for checkout buttons.
  - Keep server/client boundaries explicit: parse and normalize search params with a typed helper, pass only safe props to client checkout buttons, and preserve the existing checkout POST route.
  - Do not change route cache behavior unless execution audit proves current behavior is unsafe.
- TypeScript/domain contracts:
  - Reuse catalog-backed `CatalogProductId`.
  - Reuse checkout attribution source/placement allowlists in `lib/commerce/checkout.ts` or a nearby typed helper.
  - If `CheckoutButton` needs a new prop, separate server checkout attribution from client upsell telemetry so existing plans upsell counts are not repurposed.
  - Define deterministic behavior for missing, malformed, unknown, deprecated, and future source/product/placement values.
- Supabase/data layer:
  - No migration, RLS change, generated DB type update, rollup job, raw payload read, export path, or entitlement mutation.
  - Persisted `analytics_events` rows remain owned by existing checkout-start persistence.
  - Raw query strings or payload JSON must not be exposed to Admin UI.
- External services/tools:
  - Keep Stripe-hosted Checkout Sessions and the existing `/api/checkout/session` route behavior.
  - Do not change Stripe SDK options, webhook handling, billing portal, provider event meanings, pricing, subscriptions, or product catalog config.
  - Re-check official Stripe docs at execution time only if the implementation touches Stripe Session creation options, idempotency, webhook behavior, or provider metadata.
- UI system:
  - No visible copy/layout/style change is expected.
  - Screenshot handoff is N/A for a href/request-attribution-only implementation.
  - Owner screenshot approval stop is N/A because implementation changes href/request attribution
    only and no rendered copy, layout, CSS, visual state, print/export artifact, or brand surface.
  - If execution changes rendered UI, copy, layout, or visual state, stop for screenshot handoff and owner screenshot approval before `npm run verify:pre-pr`.
- Session-step/workout domain:
  - Session-step reference contract is N/A because this child does not render or change session
    steps, step actions, workout step ordering, exports, or the shared session-step renderer.
  - Workout domain touch is limited to the already shipped saved-workout post-success CTA link.
- Testing:
  - Add helper tests for mapped/unknown/future/malformed attribution.
  - Add component tests proving the workout CTA emits the approved plans URL and no private workout data.
  - Add plans/checkout button tests proving server checkout attribution is mapped only for `guide_poolside` with the approved placement and client upsell telemetry remains separate.
  - Add route/body tests only if `/api/checkout/session` behavior or request contract changes beyond already hardened handling.

## Data Placement And Sync Contract

- Server-canonical:
  - Catalog product identity and checkout-start route behavior.
  - Persisted `checkout_started` analytics rows emitted by `/api/checkout/session`.
- Analytics-canonical:
  - Sanitized low-cardinality `source`, `placementId`, and `productId` dimensions for checkout-start rows.
- Provider-canonical:
  - Stripe Checkout Session, payment, customer, invoice, refund, payout, and provider state remain Stripe truth.
- Finance-canonical:
  - Stripe/accounting reconciliation artifacts, finance exports, and owner-approved finance scripts.
- Local/browser:
  - The browser may carry transient URL/request hints only.
  - No browser storage, cookies, visitor IDs, local attribution IDs, raw referrers, or user-to-public attribution bridge.
- Sync behavior:
  - There is no new sync model.
  - A missing or invalid attribution hint falls back to generic plans/unknown behavior and must not block checkout.
  - Duplicate checkout calls remain duplicate telemetry unless a later child adds durable dedupe.
- Retention and sensitivity:
  - Existing analytics retention applies.
  - The bridge must not store or display raw URLs, query strings, referrers, workout titles, workout IDs, emails, user IDs, visitor IDs, IPs, user agents, Stripe IDs, checkout URLs beyond redirect response, payment details, support text, or finance rows.
- Cache/invalidation:
  - No new cache or invalidation mechanism.
  - Future dashboard/shop children must define stale/capped/read-failure behavior separately.

## Identity And Rename Contract

- Canonical stable IDs:
  - Product identity is `CatalogProductId`, currently mapped only to `guide_poolside` for this bridge.
  - Checkout-start event identity is `checkout_started`.
  - Workout-context CTA placement identity is `workout_saved_post_success`.
  - Attribution source identity is `workout_context` for the mapped bridge and `plans`/`unknown` otherwise.
- Human-readable identifiers:
  - CTA copy, plan labels, product titles, route labels, dashboard labels, Help/Guide text, and support phrasing are display-only and renameable when meaning is unchanged.
- Mutability rules:
  - Event names and placement IDs are append-only once shipped.
  - Product labels may be renamed only when catalog identity and analytics identity remain stable.
  - Future products or placements require explicit mapping before they enter the mapped workout-context checkout path.
- Rename vs repurpose:
  - Copy-only changes are renames when route behavior and event meaning stay unchanged.
  - Treating plans button clicks as workout-context CTA clicks, treating checkout start as payment success, or treating checkout start as revenue is repurpose and requires a new child.
- Compatibility contract:
  - Existing plans and My Library checkout flows keep working.
  - Unknown/future values fall back to generic plans/unknown attribution or are excluded from dedicated KPI modules.
  - Future direct workout-context checkout requires a separate approved child.
- Observability and repair:
  - Future support diagnostics may show safe aggregate unknown-source counts after a dashboard child maps labels and privacy boundaries.
  - No raw provider/session IDs or raw payload JSON may be used for repair in Admin Analytics.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Products/catalog items, CTA placement IDs, checkout attribution sources, plans route query parameters, checkout request body shape, Admin Analytics checkout modules, Help/Guide copy, locales, future shop routes, providers, exports, and finance/reporting surfaces.
- Source of truth:
  - Product IDs come from `lib/commerce/catalog.ts`.
  - Checkout-start event name comes from `ANALYTICS_EVENT_NAMES`.
  - Checkout attribution allowlists come from typed commerce/checkout helpers.
  - Runtime checkout handoff truth comes from `/api/checkout/session`.
  - Payment/provider truth comes from Stripe provider records.
  - Entitlement truth comes from server-canonical entitlement storage.
  - Finance truth comes from reconciliation/export evidence.
- Additive behavior:
  - Existing generic Admin Analytics event/product lists may include future products/events through safe dimensions.
  - Existing plans checkout behavior keeps working when no mapped workout-context query is present.
  - Future shop routes can reuse the same attribution helper pattern after their own child maps source/product/placement behavior.
- Explicit mapping requirements:
  - New shop products, new workout-context products, new CTA placements, direct workout-context checkout, checkout-completion modules, entitlement-aware targeting, finance reporting, refunds, payouts, invoices, raw drilldown, CSV/export, warehouse views, vendor analytics, localized purchase claims, or public SEO/AI commerce pages require an owner-approved child with tests and docs.
- Unknown or deprecated values:
  - Unknown/malformed/deprecated `source`, `placementId`, `productId`, or route params fall back to generic plans/unknown behavior or are excluded from dedicated workout-context checkout KPIs.
  - Unknown product IDs must still fail closed at checkout.
  - Unknown values must not imply purchase, access, revenue, refund, payout, invoice, or finance state.
- Test/evidence:
  - Include future-value and unknown-value fixtures for source, placement, and product.
  - Prove unrelated products do not inherit workout-context attribution.
  - Run a route/label/support sweep because this changes checkout attribution semantics and support interpretation.

## Scope

- Create and execute a bounded runtime child only after explicit owner execution approval.
- Potential implementation files:
  - `components/my-library/workouts/WorkoutBuilderHub.tsx`
  - `app/plans/page.tsx`
  - `components/my-library/CheckoutButton.tsx`
  - `lib/commerce/checkout.ts` or a nearby typed commerce helper
  - targeted tests under `tests/unit/`
  - `docs/api-contracts.md`, relevant Help/Guide/runbook docs, this child brief, and parent checkpoint
- Preserve the current user journey: saved workout -> `/plans` -> existing Stripe-hosted checkout button.

## Out Of Scope

- Direct checkout from the workout-context CTA.
- New shop route, new products, pricing, product catalog mutation, subscription model, or purchase model.
- New event names or changed meanings for existing event names.
- `upsell_declined`, checkout cancel semantics, checkout completion, Stripe webhook changes, entitlement mutation, finance reconciliation, revenue reporting, refunds, payouts, invoices, accounting exports, vendor analytics, raw drilldown, CSV/export, warehouse views, migrations, RLS, route creation, visible CTA copy/layout/style, dashboard modules, or builder/generator algorithm changes.

## Help / Guide Impact

- This child changes checkout attribution interpretation, so implementation must update Help/Guide, API contracts, or relevant runbook copy with:
  - mapped workout-context checkout-start meaning,
  - generic plans checkout-start meaning,
  - unknown/future attribution behavior,
  - explicit caveat that checkout start is not payment, entitlement, revenue, unique-user conversion, or finance truth.
- If execution confirms no user/admin/support copy is touched beyond API docs, the brief closeout must include the explicit `N/A` rationale for product Help copy.

## Screenshot / Visual Impact

- Planned visual impact: N/A because the intended implementation changes href/request attribution only, not rendered copy, layout, CSS, assets, print/export output, or brand treatment.
- If implementation changes visible UI, copy, layout, style, focus behavior, or screenshots, follow the repo screenshot handoff rule before `npm run verify:pre-pr`.

## Route / Label / Support Surface Sweep

Run the targeted sweep before broad gates because this child changes attribution semantics.

Search at minimum:

- `workout_saved_post_success`
- `workout_context`
- `guide_poolside`
- `checkout_started`
- `upsell_accepted`
- `/plans`
- `/api/checkout/session`
- `analyticsSource`
- `placementId`
- `source=plans`
- `source=workout_context`

Check at minimum:

- `app/`
- `components/`
- `lib/analytics/`
- `lib/commerce/`
- `tests/`
- `docs/api-contracts.md`
- `docs/architecture/`
- `docs/runbooks/`
- active/planned/done workout, analytics, checkout, commerce, and support briefs.

Sweep evidence recorded during implementation:

- Command:
  `rg -n "workout_saved_post_success|workout_context|guide_poolside|checkout_started|upsell_accepted|/plans|/api/checkout/session|analyticsSource|placementId|source=plans|source=workout_context" app components lib tests docs/api-contracts.md docs/architecture docs/runbooks docs/task-briefs/planned docs/task-briefs/in-progress docs/task-briefs/done`
- Identifiers searched:
  `workout_saved_post_success`, `workout_context`, `guide_poolside`, `checkout_started`,
  `upsell_accepted`, `/plans`, `/api/checkout/session`, `analyticsSource`, `placementId`,
  `source=plans`, and `source=workout_context`.
- Surfaces checked:
  `app/`, `components/`, `lib/analytics/`, `lib/commerce/`, `tests/`, `docs/api-contracts.md`,
  `docs/architecture/`, `docs/runbooks/`, and active/planned/done workout, analytics, checkout,
  commerce, and support briefs.
- Result:
  expected scoped fallout in `components/my-library/workouts/WorkoutBuilderHub.tsx`, `app/plans/page.tsx`, `components/my-library/CheckoutButton.tsx`, `lib/commerce/checkout.ts`, targeted unit tests, `docs/api-contracts.md`, `docs/architecture/workout-checkout-attribution-finance-separation-contract.md`, parent/child briefs, and existing historical/support references.
- Intentional non-changes:
  Admin Analytics modules, Help UI components, Stripe webhook/provider code, entitlement code, finance scripts, catalog products, pricing, routes beyond `/plans`, and raw drilldown/export surfaces remain unchanged.

## Acceptance Criteria

1. The saved-workout CTA can carry only the approved low-cardinality workout-context attribution to `/plans`.
2. `/plans` applies mapped workout-context checkout attribution only for `source=workout_context`, `placementId=workout_saved_post_success`, `productId=guide_poolside`, and the `guide_poolside` checkout button.
3. Client `upsell_accepted` telemetry remains separate from server `checkout_started` attribution; no double-count or repurpose is introduced.
4. Missing, malformed, unknown, future, or unrelated product/placement/source values fall back safely and do not count as mapped workout-context checkout attribution.
5. Existing plans and My Library checkout flows still work.
6. No sensitive identifiers, raw URLs, raw query strings, Stripe/session IDs, user IDs, emails, IPs, user agents, visitor IDs, payment details, or private workout content are persisted or displayed.
7. Help/Guide/API/support interpretation is updated or explicitly marked N/A with rationale.
8. Changed briefs pass `npm run lint:briefs`.

## Validation

Planned docs-only creation:

- `npm run lint:briefs`
- `git diff --check`

Implementation evidence:

- `npm exec prettier -- --write ...` on touched files: pass.
- `npm exec vitest run tests/unit/checkout-session-payload.test.ts tests/unit/checkout-button.test.tsx tests/unit/plans-page.test.tsx tests/unit/workout-builder-hub.test.tsx`: pass, 4 files / 87 tests.
- `npm run typecheck`: pass.
- `npm run lint:quality-gates`: pass.
- `npm run lint:briefs:all`: pass, 474 brief files.
- `git diff --check`: pass.
- `npm exec vitest run tests/unit/habit-perfect-day-hub.test.tsx -t "keeps the slip logged success message inside the habit card"`: pass, 72 tests in the file; used to verify the first `verify:pre-pr` unit failure was not reproducible in isolation.
- `npm run verify:pre-pr`: pass on rerun, full public lane; unit suite 240 files / 1525 tests, build pass, perf budgets pass, e2e 106 passed / 536 skipped. Log: `artifacts/test-runs/20260611-174726/verify.log`.

Remaining:

- required PR CI checks
- `npm run verify:pre-merge`

## Session Continuity And Recovery

- Canonical child path: `docs/task-briefs/in-progress/2026-06-11-workout-context-plans-checkout-attribution-bridge-v1-10-10.md`
- Parent path: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- Planned branch if executed: `workout-context-plans-checkout-attribution-bridge-v1`
- Current status: in-progress after explicit owner execute/build/implement instruction.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this child brief and the parent brief, then continue from the latest checkpoint.

## Checkpoint Log

- `2026-06-11 | planned child created | created this planned child from clean synced main@6a858185 after PR #1078 and closeout PR #1079; implementation is not approved yet and scope is limited to a future attribution bridge from saved-workout CTA -> /plans -> existing checkout-start request, with no direct checkout, dashboard module, Stripe webhook, entitlement, finance, shop/product catalog mutation, pricing, export, raw drilldown, visible UI redesign, or builder/generator algorithm changes | next: wait for owner implementation approval or scope edits`
- `2026-06-11 | child moved to in-progress | owner requested implementation on branch workout-context-plans-checkout-attribution-bridge-v1; child moved to in-progress and remains scoped to the saved-workout CTA -> /plans -> existing checkout-start attribution bridge, with no direct checkout, dashboard module, Stripe webhook, entitlement, finance, shop/product catalog mutation, pricing, export, raw drilldown, visible UI redesign, or builder/generator algorithm changes | next: audit current CTA/plans/checkout code and implement the bounded bridge`
- `2026-06-11 | bridge implemented with targeted validation | implemented the mapped saved-workout CTA -> /plans -> checkout-start attribution bridge, separated client plans telemetry from server checkout-start attribution, updated API/architecture contracts, recorded route/label/support sweep evidence, and passed targeted Vitest for checkout payloads, CheckoutButton, PlansPage, and WorkoutBuilderHub; no visible copy/layout/style, direct checkout, dashboard, Stripe webhook, entitlement, finance, shop/product catalog mutation, export, raw drilldown, or builder/generator algorithm scope was added | next: run typecheck, quality gates, brief lint, diff check, verify:pre-pr, then commit/push/PR`
- `2026-06-11 | pre-pr gate green | first broad pre-pr run hit a non-reproducible HabitPerfectDayHub unit failure; the habit test file passed in isolation and the rerun passed full public pre-pr verification including lint, typecheck, unit suite, build, perf budgets, and e2e; no visual rendering files changed after the screenshot N/A decision | next: commit, push, open PR, monitor CI, then run verify:pre-merge before merge-readiness summary`
