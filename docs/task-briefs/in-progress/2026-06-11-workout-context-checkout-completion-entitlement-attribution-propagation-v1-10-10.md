# Task Brief: Workout Context Checkout Completion + Entitlement Attribution Propagation V1 (10/10)

## Metadata

- `id`: `2026-06-11-workout-context-checkout-completion-entitlement-attribution-propagation-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-11`
- `updated`: `2026-06-11`
- `parent_brief`: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- `depends_on`:
  - `docs/task-briefs/done/2026-06-11-workout-context-checkout-completion-entitlement-attribution-contract-v1-10-10.md`
  - `docs/architecture/workout-context-checkout-completion-entitlement-attribution-contract.md`
  - `docs/task-briefs/done/2026-06-11-checkout-started-attribution-hardening-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-11-workout-context-plans-checkout-attribution-bridge-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-11-workout-context-checkout-started-admin-analytics-mapping-v1-10-10.md`
  - `docs/architecture/workout-checkout-attribution-finance-separation-contract.md`
  - `docs/architecture/external-service-contract-matrix.md`
  - `docs/architecture/data-access-authz-cache-contract-registry.md`
- `execution_mode`: `runtime-implementation-after-explicit-owner-execute`
- `branch`: `workout-context-checkout-attribution-propagation-v1`

## Brief Audit Record

- `last_audited`: `2026-06-11`
- `base`: clean synced `main@c37e4caf` after PR `#1090` closed the Codex local automation defaults follow-up. Re-audit read the parent, the checkout completion/entitlement attribution contract, checkout/session route, Stripe webhook route, analytics sanitizer/persistence, Admin Analytics aggregation/view-model, and relevant checkout/webhook/admin analytics tests. Execution started on branch `workout-context-checkout-attribution-propagation-v1`; official Stripe Checkout, Checkout Session create, event type, webhook signature, and idempotency docs were rechecked on 2026-06-11 before runtime changes.
- `audit_status`: `in-progress`
- `decision`: Owner explicitly requested implementation; proceed with the scoped runtime child on branch `workout-context-checkout-attribution-propagation-v1`.
- `reason`: Checkout-start workout-context attribution is implemented and mapped in Admin Analytics, but current Stripe Checkout Session metadata, webhook `checkout_completed`, and entitlement `entitlement_granted` signals remain generic. This child now implements the approved server-owned, allowlisted, low-cardinality propagation path before any later dedicated workout-context completion or entitlement KPI can exist.
- `must_refresh_before_execution_if`: Refresh before execution if AGENTS.md, task brief template, scorecard categories, Codex skill/stack readiness radar, local automation defaults, official Stripe Checkout/webhook/idempotency/API guidance, `stripe` SDK behavior, `app/api/checkout/session/route.ts`, `app/api/stripe/webhook/route.ts`, `lib/commerce/checkout.ts`, `lib/commerce/catalog.ts`, `lib/commerce/entitlements.ts`, `ANALYTICS_EVENT_NAMES`, analytics sanitization/persistence, `analytics_events` schema, `/api/admin/analytics/insights`, Admin Analytics UI, Help/Guide contracts, finance reconciliation scripts, external service matrix, data-access/authz/cache registry, route/label/support sweep rules, or checkout/entitlement/finance contracts change.

## Goal

Implement the server-owned propagation path that carries the approved workout-context checkout-start attribution into Stripe Checkout Session metadata and webhook-backed `checkout_completed` / `entitlement_granted` analytics without exposing provider identifiers, changing entitlement rules, or adding dashboard/finance interpretation.

## Pre-Implementation Owner Explanation

Vi lar den godkjente "kom fra lagret workout"-merkingen folge trygt fra checkout-start til Stripe-webhook og tilgangssignalet. Det gjor at vi senere kan skille denne checkout-flyten fra vanlig plans-trafikk uten a gjette fra klikk eller checkout-start. Utenfor scope er dashboardmodul, finance/revenue, nye produkter/priser, direkte checkout fra workout, nye entitlement-regler, raw drilldown/export, tredjeparts analytics og synlige UI-endringer.

Forward-compatibility-intent: nye produkter, CTA-plasseringer, checkout-kilder, webhook-eventer eller entitlement-stater skal feile lukket til generisk/unknown med mindre de har eksplisitt mapping, tester, support-kopi og rollback-/repair-regler.

## Current Baseline

- `/api/checkout/session` creates Stripe Checkout Sessions and emits `checkout_started` after a redirect URL exists.
- `checkout_started` payloads may carry `productId`, normalized `source`, and approved `placementId`.
- The approved workout-context mapping today is:
  - `source=workout_context`
  - `placementId=workout_saved_post_success`
  - `productId=guide_poolside`
- Current Checkout Session metadata carries product identity and optional server-owned user reference, but not approved workout-context `source` or `placementId`.
- Current webhook events emit generic `checkout_completed` and `entitlement_granted` product telemetry. They are not dedicated workout-context outcomes.
- Admin Analytics currently shows mapped workout-context checkout handoffs only. It must not count completion or entitlement outcomes for workout context until this propagation path exists and a later dashboard child maps it.

## Official Provider Baseline

Official Stripe docs were rechecked on 2026-06-11 for planning:

- Stripe Checkout: <https://docs.stripe.com/payments/checkout>
- Create a Checkout Session: <https://docs.stripe.com/api/checkout/sessions/create>
- Stripe event types: <https://docs.stripe.com/api/events/types>
- Stripe webhook signature verification: <https://docs.stripe.com/webhooks/signature>
- Stripe idempotent requests: <https://docs.stripe.com/api/idempotent_requests>

Implementation must re-check official Stripe docs at execution time before changing checkout or webhook code.

## Implementation Boundary

This child may implement:

- A typed, server-owned checkout attribution metadata helper in `lib/commerce/checkout.ts`.
- Allowlisted Stripe Checkout Session metadata and invoice metadata fields only for mapped workout-context attribution:
  - `fs_attribution_source=workout_context`
  - `fs_attribution_placement_id=workout_saved_post_success`
  - `fs_attribution_product_id=guide_poolside`
- `/api/checkout/session` wiring that derives those fields from validated server-side checkout attribution, not raw browser trust.
- Webhook extraction that validates attribution metadata against the catalog product before adding low-cardinality attribution fields to `checkout_completed` and `entitlement_granted` analytics payloads.
- Tests proving mapped, missing, unknown, malformed, generic plans, product-mismatch, invalid signature, non-paid defer, async success, ignored event, missing email, unresolved product, duplicate/replay-safe, and provider-failure behavior.
- API/architecture/runbook/help-support docs needed to explain that propagated product telemetry is not purchase, access, revenue, refund, payout, invoice, accounting, unique-user conversion, or finance truth.

This child must not add a dedicated Admin Analytics completion/entitlement module. It may only prepare safe server-side data for a later mapping child.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                                            | Evidence                                                                                     | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Implementation enables a future dedicated workout-context completion/entitlement view without adding dashboard, finance, direct checkout, pricing, or product-expansion scope.                                                | parent checkpoint + scoped PR summary + no UI/dashboard diff                                 | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: no visible checkout, success, or workout UI change; future UI/dashboard children must keep completion/access language explicit.                                                                              | no rendered UI changed-files review                                                          | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this slice should not change rendered UI, CSS, images, screenshots, print/export artifacts, or product-rendering files.                                                                                           | explicit visual scope rationale                                                              | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Metadata is emitted only for approved mapped source/placement/product and webhook analytics counts only validated provider completion plus matched attribution/product.                                                       | checkout helper/route/webhook unit tests for mapped, unknown, missing, malformed, mismatch   | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor, mutable config, placement publishing, or operator mutation workflow changes.                                                                                                                     | explicit admin-editor scope rationale                                                        | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no visible UI, focus behavior, headings, labels, keyboard flow, or screen-reader behavior changes.                                                                                                                | explicit a11y scope rationale                                                                | `N/A`                   |
| Performance (CWV + payloads)                  | `target`     | Checkout/webhook changes add only bounded metadata/payload fields, no new client bundle, chart dependency, dashboard query, migration, or external call beyond existing Stripe/Supabase flows.                                | build/perf gate + changed-files review + payload assertions                                  | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Checkout attribution metadata is provider/session support context, analytics rows are product telemetry, entitlements remain app access truth, and finance remains Stripe/accounting reconciliation truth.                    | data-boundary tests/docs + contract alignment                                                | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Checkout/session and webhook routes remain dynamic/no-store side-effect boundaries; no client cache, dashboard cache, rollup, or invalidation behavior changes.                                                               | route review + no-store/dynamic assertions where existing tests cover                        | `5/5`                   |
| Reliability and failure handling              | `target`     | Missing/unknown metadata stays generic, invalid signatures emit nothing, non-paid completion defers, ignored events stay ignored, fulfillment failures remain deterministic, and analytics failures fail soft where intended. | webhook negative-path tests + checkout failure tests                                         | `5/5`                   |
| Security and authz                            | `target`     | Webhook signature verification stays before provider truth, browser input is allowlisted server-side, provider IDs remain server-side/redacted, and protected routes fail closed.                                             | invalid-signature test + forbidden-field assertions + API security sweep                     | `5/5`                   |
| Privacy and compliance                        | `target`     | New payloads/metadata contain only low-cardinality mapped source/placement/product and no workout IDs/text, emails, user IDs, visitor IDs, raw URLs/referrers, IPs, User-Agent, checkout URLs, or payment details.            | payload sanitizer tests + analytics persistence tests + no raw provider IDs in Admin display | `5/5`                   |
| Content governance                            | `target`     | API contracts, architecture docs, route registry, parent/child checkpoint, and support language stay aligned with the new propagation semantics.                                                                              | docs updates + route/label/support sweep + brief lint                                        | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, editable placement, publish action, recovery action, or mutation state changes.                                                                                                                | explicit admin-workflow scope rationale                                                      | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public route, metadata, sitemap, robots, canonical URL, structured data, or crawlable content changes.                                                                                                         | explicit SEO scope rationale                                                                 | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic page, public docs page, structured data, or AI-facing crawl surface changes.                                                                                                                   | explicit AI-discoverability scope rationale                                                  | `N/A`                   |
| Analytics and KPI observability               | `target`     | Server events carry safe mapped attribution for future dedicated KPIs, while current Admin Analytics still does not infer unique-user conversion, purchase, access, revenue, or finance truth.                                | analytics event tests + admin insights non-counting tests + caveat docs                      | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Stripe Checkout Session metadata supports provider/webhook interpretation without changing pricing, catalog identity, checkout surface, entitlement rules, invoices, refunds, payouts, or accounting exports.                 | Stripe docs evidence + checkout/session payload tests + finance scope review                 | `5/5`                   |
| Incident response and support operations      | `target`     | Support can identify mapped provider/entitlement states through safe labels and documented missing/mismatch/lag/repair meanings without exposing raw provider/customer/user/payment IDs.                                      | support language/runbook/API docs + webhook negative-path tests                              | `5/5`                   |
| Finance and reporting operations              | `target`     | Implementation must explicitly preserve that completion/entitlement telemetry is not revenue, refund, payout, invoice, accounting, reconciliation, or finance truth.                                                          | finance-boundary docs + no finance scripts/exports changed                                   | `5/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: machine IDs are locale-independent and display/support copy remains renameable; localized purchase/access claims require a later owner-approved child.                                                       | identity contract + copy scope rationale                                                     | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next.js route handlers, Stripe SDK wrapper, catalog types, analytics helpers, Supabase admin boundary, and Vitest patterns; add no dependency or vendor.                                                       | changed-files review + package diff + targeted tests                                         | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted checkout/helper/webhook/analytics/admin tests pass, changed briefs pass lint, full `npm run verify:pre-pr` passes before PR, and `npm run verify:pre-merge` passes before merge readiness.                           | targeted Vitest + lint:briefs + verify gates + CI                                            | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Uses bounded low-cardinality metadata/payload fields only; no raw drilldown, export, warehouse, rollup, extra Stripe calls beyond existing fallback, or high-cardinality joins.                                               | payload shape review + no migration/export diff                                              | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback is revert of metadata propagation and analytics payload additions; no schema/provider config change required, and support/docs explain safe disable/ignore behavior.                                                 | rollback notes + PR summary + no migration/env changes                                       | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep existing route boundaries: `/api/checkout/session` creates Checkout Sessions; `/api/stripe/webhook` verifies provider events and fulfills entitlements.
  - No server/client component, public route, success page, checkout UI, or Admin Analytics UI change in this child.
  - Existing dynamic/no-store side-effect semantics remain unchanged.
- TypeScript/domain contracts:
  - Use `CatalogProductId` for product identity.
  - Add typed metadata parsing/building helpers rather than ad hoc string access in route handlers.
  - Unknown or mismatched values must fail closed to generic analytics attribution.
  - Do not add new analytics event names unless execution proves the existing `checkout_completed` and `entitlement_granted` semantics cannot safely carry the mapped low-cardinality dimensions.
- Supabase/data layer:
  - No migration, RLS change, generated DB type update, index, raw drilldown, rollup job, export, or entitlement schema change.
  - Existing entitlement writes remain the app access source-of-truth.
- External services/tools:
  - Use the existing Stripe Checkout Sessions integration and `createStripeClient` wrapper.
  - Re-check official Stripe docs at execution time.
  - Keep Stripe secrets server-only and webhook signature verification before reading provider truth.
  - Do not store raw Stripe session/customer/payment/invoice/refund/payout IDs in client analytics or Admin Analytics display.
  - Preserve idempotency/retry behavior; if duplicate provider events are not fully deduped by this slice, document the limitation and keep dedicated KPI counting deferred.
- UI system:
  - No UI/visual change; screenshot handoff is N/A unless execution scope changes to visible UI, in which case stop and refresh the brief.
- Testing:
  - Add or update unit tests for checkout metadata helper, checkout route payload/session metadata, webhook valid/invalid/missing/mismatch paths, analytics payload privacy, and Admin Analytics non-counting behavior.
  - Run targeted tests before broad gates.

## Data Placement And Sync Contract

- Server-canonical:
  - Catalog product identity from `lib/commerce/catalog.ts`.
  - Checkout attribution validation in server code.
  - Stripe Checkout Session metadata for provider/webhook support context.
  - Entitlement rows for app-recognized access.
- Provider-canonical:
  - Stripe Checkout Session, customer, payment, invoice, refund, payout, and provider event state.
- Analytics-canonical:
  - Sanitized `analytics_events` product telemetry only.
  - `checkout_completed` and `entitlement_granted` may carry safe mapped attribution after this child, but remain product telemetry/support diagnostics, not finance truth.
- Finance-canonical:
  - Stripe/accounting reconciliation artifacts and owner-approved finance exports/scripts only.
- Local/browser:
  - Browser may request checkout with low-cardinality source/placement values, but server allowlisting decides whether they propagate.
  - No browser-owned checkout completion, entitlement, visitor ID, persistent attribution ID, provider ID, or finance state.
- Sync behavior:
  - Checkout creation, provider webhook completion, entitlement fulfillment, analytics persistence, and finance reconciliation remain separate retry/idempotency domains.
  - Analytics persistence failure must not grant or block entitlement.
- Retention and sensitivity:
  - Existing analytics retention applies.
  - Forbidden from analytics payload/display: raw workout IDs/titles/notes/text, generated prompts, raw URLs/referrers/query strings, emails, user IDs, visitor IDs, IPs, User-Agent, Checkout Session IDs, customer IDs, payment IDs, invoice IDs, refund IDs, payout IDs, checkout URLs, portal URLs, payment method details, cart details, support free text, and finance export rows.
- Cache/invalidation:
  - Checkout/session and webhook routes remain `force-dynamic`.
  - No dashboard cache or invalidation change.

## Identity And Rename Contract

- Canonical stable IDs:
  - Product: `CatalogProductId`, currently mapped to `guide_poolside`.
  - Attribution source: allowlisted machine value, currently `workout_context`.
  - Placement: write-once machine value, currently `workout_saved_post_success`.
  - Stripe/provider IDs: provider identifiers, never product analytics identity.
  - Entitlement identity: server-canonical entitlement row/access relation.
- Human-readable identifiers:
  - Product titles, CTA copy, checkout button labels, Admin labels, Help/Guide text, and support language are display-only and renameable when meaning is unchanged.
- Mutability rules:
  - Shipped event names and attribution machine IDs are append-only for meaning.
  - Changing the meaning of a checkout completion, entitlement grant, placement, product, or finance interpretation requires a new child.
- Rename vs repurpose:
  - Label-only copy changes are renames.
  - Treating checkout-start as completion, generic completion as workout-context completion, entitlement as finance close, or Admin Analytics as revenue proof is repurpose and forbidden in this child.
- Compatibility contract:
  - Missing, unknown, malformed, deprecated, disabled, inactive, or mismatched metadata fails closed to generic analytics.
  - Dedicated completion/entitlement KPI modules remain deferred until a later child maps and tests them.
- Observability and repair:
  - Execution must document support-safe handling for missing metadata, product mismatch, invalid signature, ignored event, non-paid deferred event, async success, missing email, unresolved product, duplicate event, entitlement lag, and stale/capped analytics reads.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Product IDs, checkout attribution sources, placement IDs, Stripe Checkout Session metadata, invoice metadata, webhook event meanings, entitlement states, Admin Analytics modules, Help/Guide copy, support diagnostics, locales, exports, vendor analytics, and finance reporting.
- Source of truth:
  - Product IDs come from `lib/commerce/catalog.ts`.
  - Approved checkout attribution comes from typed server helpers in `lib/commerce/checkout.ts`.
  - Provider truth comes from signature-verified Stripe webhook events.
  - Entitlement truth comes from app entitlement fulfillment.
  - Finance truth comes from Stripe/accounting reconciliation, not analytics.
- Additive behavior:
  - New safe generic checkout/product telemetry can still appear in generic Admin Analytics lists.
  - New catalog products or placements stay generic/unmapped until a child adds explicit mapping.
- Explicit mapping requirements:
  - New products, purchase models, direct workout-context checkout, placements, checkout sources, webhook event meanings, entitlement states, support diagnostics, dedicated Admin Analytics completion/entitlement modules, exports, raw drilldown, finance reports, vendor forwarding, and localized purchase/access claims require owner-approved mapping, tests, docs, and rollback/repair notes.
- Unknown or deprecated values:
  - Fail closed for propagation and dedicated KPIs.
  - May appear only as safe generic/unknown diagnostics if no sensitive data is exposed.
- Test/evidence:
  - Include future/unknown/malformed fixtures for source, placement, product, metadata, webhook event, and entitlement paths.
  - Include assertions that sensitive provider/user/payment values do not enter Admin Analytics display or unredacted analytics payloads.

## Scope

- Keep this child in `in-progress` after explicit owner implementation approval.
- Implement typed server-owned workout-context attribution metadata helpers.
- Wire approved mapped attribution into Stripe Checkout Session metadata and invoice metadata.
- Extract/validate mapped attribution in webhook completion and entitlement analytics.
- Keep generic checkout and entitlement behavior working for plans/library traffic.
- Update API/architecture/support docs and parent checkpoint evidence.
- Add targeted tests and run required gates.

## Out Of Scope

- Dedicated Admin Analytics completion/entitlement module or dashboard UI.
- Finance-grade reporting, revenue attribution, refunds, payouts, invoices, accounting export, reconciliation scripts, or finance dashboards.
- Direct workout-context checkout route or new shop/product surface.
- New products, prices, product catalog mutation, purchase models, or Stripe price IDs.
- Entitlement rule/schema changes beyond preserving existing fulfillment.
- Raw drilldown, CSV/export, warehouse views, vendor analytics, third-party scripts, cookies, consent changes, migration, RLS, generated DB types, or rollup jobs.
- Visible UI, checkout/success page redesign, Help/Guide UI workflow changes, screenshot work, or builder/generator UX.
- Treating aggregate counts as unique-user conversion, purchase proof, app access guarantee, revenue, refund, payout, invoice, accounting, or finance truth.

## Help / Guide Impact

- Required docs/support updates:
  - `docs/api-contracts.md` if checkout/webhook analytics payload semantics change.
  - `docs/architecture/workout-context-checkout-completion-entitlement-attribution-contract.md` if implementation details refine the contract.
  - `docs/architecture/external-service-contract-matrix.md` for Stripe/analytics interpretation.
  - `docs/architecture/data-access-authz-cache-contract-registry.md` for route behavior and support-safe diagnostics.
- Help/Guide UI update is `N/A` unless execution changes visible admin/user workflow labels, support recovery behavior, or user-facing checkout/access copy. If that happens, stop and refresh this brief.

## Screenshot / Visual Impact

- Screenshot handoff is N/A because this child should not change rendered UI, layout, brand, print/export, or visual assets.
- If implementation discovers visible UI is required, stop and refresh scope before making UI changes.

## Route / Label / Support Surface Sweep

Required before the first broad gate because this child touches checkout, Stripe webhook, entitlement interpretation, analytics payloads, and support language.

Search at minimum:

- `checkout_started`
- `checkout_completed`
- `entitlement_granted`
- `discount_redeemed`
- `Checkout Session`
- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `Stripe`
- `webhook`
- `metadata`
- `entitlement`
- `finance`
- `reconciliation`
- `revenue`
- `refund`
- `payout`
- `invoice`
- `Admin Analytics`
- `/api/checkout/session`
- `/api/stripe/webhook`
- `/checkout/success`
- `guide_poolside`
- `workout_context`
- `workout_saved_post_success`
- `fs_attribution_source`
- `fs_attribution_placement_id`
- `fs_attribution_product_id`

Check at minimum:

- `app/`
- `components/`
- `lib/analytics/`
- `lib/commerce/`
- `lib/stripe/`
- `tests/`
- `docs/api-contracts.md`
- `docs/architecture/`
- `docs/runbooks/`
- Help/Guide sources and assertions
- active/planned/done task briefs for analytics, workout, checkout, entitlement, finance, and commerce.

Execution record on 2026-06-11:

- Identifiers searched: `checkout_started`, `checkout_completed`, `entitlement_granted`,
  `discount_redeemed`, `Checkout Session`, `checkout.session.completed`,
  `checkout.session.async_payment_succeeded`, `Stripe`, `webhook`, `metadata`, `entitlement`,
  `finance`, `reconciliation`, `revenue`, `refund`, `payout`, `invoice`, `Admin Analytics`,
  `/api/checkout/session`, `/api/stripe/webhook`, `/checkout/success`, `guide_poolside`,
  `workout_context`, `workout_saved_post_success`, `fs_attribution_source`,
  `fs_attribution_placement_id`, and `fs_attribution_product_id`.
- Surfaces checked: `app`, `components`, `lib`, `tests`, `docs`, `scripts`, `package.json`, API
  contracts, architecture docs, runbooks, active/planned/done task briefs, checkout route, Stripe
  webhook route, commerce helpers, analytics persistence/admin insight code, and Admin Analytics
  tests.
- Broad file-list sweep ran with `rg -l` across `app`, `components`, `lib`, `tests`, `docs`,
  `scripts`, and `package.json` for checkout/webhook/metadata/entitlement/finance/workout-context
  terms. The broad terms matched many historical docs and task briefs as expected.
- Runtime fallout reviewed and updated in `app/api/checkout/session/route.ts`,
  `app/api/stripe/webhook/route.ts`, `lib/commerce/checkout.ts`,
  `lib/stripe/webhook-discount.ts`, and targeted unit tests.
- Analytics/Admin fallout reviewed in `lib/analytics/admin-insights.ts` and
  `tests/unit/admin-analytics-insights.test.ts`; no dedicated completion/entitlement dashboard
  module was added.
- Support/docs fallout updated in `docs/api-contracts.md`,
  `docs/architecture/workout-context-checkout-completion-entitlement-attribution-contract.md`,
  `docs/architecture/external-service-contract-matrix.md`,
  `docs/architecture/data-access-authz-cache-contract-registry.md`, and
  `docs/runbooks/auth-account-support.md`.
- No rendered UI, route rename, Help/Guide UI workflow label, finance script, export, migration,
  RLS, vendor, product catalog, pricing, direct checkout, or builder/generator fallout was found in
  scope.
- Fallout handled: runtime checkout/webhook helpers, webhook discount payload privacy, targeted
  unit tests, API contract, completion/entitlement architecture contract, external-service matrix,
  route registry, auth/account support runbook, parent checkpoint, and this child checkpoint.

## Acceptance Criteria

1. Checkout Session metadata includes approved workout-context attribution only when source, placement, and product match the mapped contract.
2. Generic plans/library checkout does not carry workout-context metadata.
3. Unknown, malformed, missing, mismatched, inactive, or unrelated values fail closed to generic attribution.
4. Webhook completion emits `checkout_completed` with safe mapped attribution only after signature verification and supported paid/async-success event handling.
5. Entitlement analytics emits `entitlement_granted` with safe mapped attribution only after app entitlement fulfillment recognizes access.
6. Invalid signatures, ignored events, non-paid sessions, missing email, unresolved product, provider failure, and entitlement lag do not emit mapped success semantics.
7. No analytics payload or Admin Analytics display exposes raw Stripe session/customer/payment/invoice/refund/payout IDs, checkout URLs, portal URLs, emails, user IDs, raw URLs/referrers, workout text/IDs, IPs, User-Agent, payment details, or finance rows.
8. Existing generic funnel counts continue to work, and no dedicated workout-context completion/entitlement Admin Analytics module is added in this child.
9. API/architecture/support docs and parent checkpoint are updated.
10. Changed briefs pass `npm run lint:briefs`; runtime changes pass targeted tests and `npm run verify:pre-pr` before PR.

## Validation

Planned execution should run:

- route/label/support sweep recorded in this brief
- `npm exec vitest run tests/unit/checkout-session-payload.test.ts tests/unit/checkout-session-route.test.ts tests/unit/stripe-webhook-route.test.ts tests/unit/analytics-events.test.ts tests/unit/analytics-persistence.test.ts tests/unit/admin-analytics-insights.test.ts`
- `npm run lint:briefs`
- `git diff --check`
- `npm run verify:pre-pr`
- required PR CI checks
- `npm run verify:pre-merge` before merge readiness

If a new webhook route test file is created, use the actual filename in the validation record.

Validation record:

- `npm run typecheck` passed on 2026-06-11.
- `npm exec vitest run tests/unit/checkout-session-payload.test.ts tests/unit/checkout-session-route.test.ts tests/unit/stripe-webhook-analytics.test.ts tests/unit/stripe-webhook-route.test.ts tests/unit/admin-analytics-insights.test.ts tests/unit/analytics-events.test.ts tests/unit/analytics-persistence.test.ts` passed on 2026-06-11: 7 files, 50 tests.
- Failure-mode evidence: checkout route tests cover invalid content type, unknown product, inactive
  product, missing config, provider failure, missing redirect URL, and analytics fail-soft behavior;
  webhook route tests cover missing/invalid signature, ignored event, non-paid completed defer,
  async success, missing email, unresolved product, attribution product mismatch, provider fallback
  failure, and provider-ID privacy. These paths are deterministic and include no unexpected 500 for
  invalid/malformed workout-context attribution.
- `npm run lint:briefs:all` passed on 2026-06-11, including this in-progress child.
- `git diff --check` passed on 2026-06-11.
- `npm run verify:pre-pr` passed on 2026-06-11 using the full-public lane in
  `artifacts/test-runs/20260611-231040`: quality gates, admin audit, env parity, PR body lint,
  ESLint, typecheck, unit tests, build, perf budgets, and Playwright E2E passed.

## Rollback / Release Notes

- Rollback: revert the implementation PR; no migration or provider dashboard config should be required.
- Safe-disable behavior: omit attribution metadata or ignore unknown/missing metadata; generic checkout/webhook/entitlement behavior remains intact.
- Release note: this is backend telemetry/support foundation only, not a visible product feature, purchase claim, access guarantee, or finance report.

## Checkpoint Log

- `2026-06-11 | planned | created from clean main@c37e4caf after re-auditing the parent, checkout completion/entitlement attribution contract, checkout route, Stripe webhook, Admin Analytics aggregation/view-model, relevant tests, and system optimization return path. This child is planned only and must not start runtime implementation until owner explicitly says to execute/build/implement it | next: wait for owner implementation approval or scope edits`
- `2026-06-11 | child in progress | owner requested implementation; moved to in-progress on branch workout-context-checkout-attribution-propagation-v1, rechecked official Stripe Checkout, Checkout Session create, event type, webhook signature, and idempotency docs, and updated parent active-child pointers. Scope remains server-owned checkout/Stripe/webhook/entitlement analytics attribution propagation only, with no dedicated Admin Analytics module, finance, UI, product/pricing, direct checkout, export/raw drilldown, migration/RLS, vendor, or builder/generator scope | next: implement typed metadata helpers, checkout/webhook propagation, docs, targeted tests, and verify:pre-pr`
- `2026-06-11 | implementation validated before broad gate | implemented typed checkout attribution metadata helpers, checkout session/invoice metadata propagation, webhook metadata extraction/product validation, privacy-safe checkout_completed/entitlement_granted payload propagation, discount payload provider-ID removal, docs/support updates, route/label/support sweep record, and targeted tests. Local targeted validation passed; latest commit is pending pre-pr commit | next: run npm run verify:pre-pr, then commit, push, open PR, monitor CI, and run verify:pre-merge`
- `2026-06-11 | pre-pr gate passed | npm run verify:pre-pr passed on the full-public lane in artifacts/test-runs/20260611-231040 after the runtime and docs changes. Screenshot handoff is N/A because no rendered UI, layout, brand, print/export, or visual asset files changed | next: commit, push, open PR, monitor CI, and run npm run verify:pre-merge before merge readiness`
