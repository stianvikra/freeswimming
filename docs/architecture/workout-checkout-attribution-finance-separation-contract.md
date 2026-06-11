# Workout Checkout Attribution + Finance Separation Contract

Last updated: 2026-06-11

## Purpose

This contract defines how FreeSwimming separates workout-context commercial telemetry from checkout,
entitlement, Stripe reconciliation, and finance reporting.

It is intentionally a contract only. It does not add or change runtime CTA rendering, checkout
routes, Stripe API calls, webhook handling, entitlement writes, finance scripts, Admin Analytics UI,
pricing, product catalog rows, exports, raw drilldown, migrations, or RLS.

## Official Provider Baseline

Official Stripe docs were checked on 2026-06-11 for this contract:

- Stripe Checkout: <https://docs.stripe.com/payments/checkout>
- Stripe webhook signature verification: <https://docs.stripe.com/webhooks/signature>
- Stripe idempotent requests: <https://docs.stripe.com/api/idempotent_requests>

Current repo baseline remains:

- Use Stripe-hosted Checkout Sessions for one-time web checkout unless a later child justifies
  another official Stripe integration surface.
- Verify Stripe webhook signatures before fulfillment.
- Use idempotency for retryable provider writes where duplicate provider objects would be harmful.
- Keep Stripe secrets, customer IDs, session IDs, payment IDs, invoice IDs, and portal URLs out of
  browser analytics payloads and raw Admin Analytics display.

Future provider behavior changes must re-check official Stripe docs at execution time and update the
external service matrix, route registry, tests, support diagnostics, and rollback notes.

## Truth Layers

The commercial funnel has five separate truth layers. A later child may join them for bounded
support diagnostics only after it defines the join key, privacy boundary, failure state, and tests.

| Layer                  | Source of truth                                                                                                  | Allowed meaning                                                                                                      | Not allowed to mean                                                                                                          |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| CTA/product telemetry  | typed first-party `analytics_events` with sanitized low-cardinality dimensions                                   | A mapped surface rendered, a mapped CTA was clicked, or another explicitly mapped product telemetry action happened. | Checkout started, payment succeeded, entitlement was granted, revenue exists, refund/payout/invoice state, or finance truth. |
| Checkout attribution   | checkout route/session creation contract, currently `/api/checkout/session` and Stripe Checkout Session creation | A checkout handoff/session was requested or created for a mapped catalog product.                                    | Payment success, entitlement grant, invoice reconciliation, revenue recognition, or finance close.                           |
| Payment/provider truth | Stripe Checkout/webhook/provider records after signature-verified provider events                                | Provider-reported checkout/payment state for a session/customer/product.                                             | App entitlement correctness by itself, accounting close, or Admin Analytics conversion truth.                                |
| Entitlement truth      | server-canonical entitlement storage plus repair/reconciliation flows                                            | Which user/email/product access the app recognizes.                                                                  | Finance truth, refund state, payout state, raw analytics truth, or provider state without app reconciliation.                |
| Finance reporting      | Stripe/accounting reconciliation artifacts, finance exports, and owner-approved reporting scripts                | Reconciled payment, invoice, refund, payout, and reporting evidence.                                                 | CTA performance, unique-user conversion, product UX success, or entitlement correctness by itself.                           |

## Event And Signal Semantics

Product telemetry:

- `upsell_presented` means a mapped surface or CTA rendered.
- `upsell_accepted` means clicked or activated intent.
- `upsell_declined` means only an explicitly mapped dismiss/cancel/return action. Current
  checkout-cancel semantics must not be reused as all ignored users.
- Product telemetry rows may be duplicate best-effort events and must not be described as unique
  users unless a later child adds a deterministic unique-user contract.

Checkout attribution:

- `checkout_started` may mean checkout handoff/session creation only when emitted by a mapped
  checkout boundary.
- Checkout start is not payment success, not entitlement, not revenue, and not finance truth.
- Missing or failed checkout config should be treated as a checkout availability/support signal, not
  as user disinterest.
- The saved-workout CTA may preserve mapped workout-context attribution through `/plans` only for
  `source=workout_context`, `placementId=workout_saved_post_success`, and
  `productId=guide_poolside` when the clicked checkout button targets the same catalog product.
  Other products, future shop routes, future placements, malformed values, or generic plans traffic
  must remain generic checkout attribution until a later child maps them explicitly.
- Admin Analytics may show a dedicated workout-context checkout-start aggregate only for those
  mapped `checkout_started` rows. That aggregate is still checkout handoff only and must remain
  separate from CTA views/clicks, checkout completion, entitlement, revenue, Stripe reconciliation,
  unique-user conversion, and finance reporting.

Payment/provider:

- `checkout_completed` may only be backed by the existing checkout/webhook/provider contract.
- A provider completion signal is not full finance close until reconciliation confirms the relevant
  payment, invoice, refund, payout, and accounting/export state required by the finance process.
- Webhook delay, provider retry, ignored event types, missing user mapping, and deferred fulfillment
  must be support-visible states, not silently collapsed into success.

Entitlement:

- `entitlement_granted` means the server-canonical entitlement system recognized access.
- Entitlement grant is not finance truth and must not be derived from CTA/product analytics.
- Entitlement repair may use provider or reconciliation evidence, but browser analytics cannot grant
  access.

Finance:

- Revenue, refunds, payouts, invoices, accounting exports, and reporting state come from
  Stripe/accounting reconciliation artifacts and owner-approved finance scripts.
- Admin Analytics product, checkout, and entitlement counts are operational signals only.
- Finance reports must not use CTA clicks, checkout-start counts, or entitlement rows as sole proof
  of revenue, refund, payout, invoice, or accounting state.

## Allowed And Forbidden Joins

Allowed without a new child:

- Show product telemetry counts in Admin Analytics with caveats that they are not checkout,
  entitlement, Stripe, revenue, or finance truth.
- Keep generic safe product/event lists populated from sanitized analytics dimensions.
- Use support-safe aggregate diagnostics such as "unknown product", "provider failure", or
  "entitlement lag" after a child maps the labels and privacy boundary.

Requires a new child:

- Joining CTA telemetry to checkout sessions.
- Joining checkout sessions to Stripe provider records in an admin surface.
- Joining Stripe provider records to entitlement rows outside existing support/reconciliation flows.
- Joining entitlement rows to finance exports or reports.
- Showing raw event drilldown, CSV/export, warehouse/reporting views, or third-party analytics
  forwarding.
- Introducing unique-user conversion, attributed revenue, refund-rate, payout, invoice, or
  accounting KPIs.

Forbidden:

- Browser-provided Stripe IDs, customer IDs, session IDs, price IDs, checkout URLs, or portal URLs as
  trusted join keys.
- Free-text, emails, user IDs, visitor IDs, IPs, User-Agent, raw URLs/referrers, cart details,
  payment method details, support messages, or finance export rows in product analytics payloads.
- Inferring purchase, access, refund, payout, invoice, or revenue state from CTA/product telemetry.

## Data Placement

Server-canonical:

- catalog product identity from `lib/commerce/catalog.ts`,
- checkout route behavior and server-created Checkout Session payloads,
- entitlement rows and app-recognized access state,
- support diagnostics and route/auth/cache contracts.

Provider-canonical:

- Stripe Checkout Session, customer, payment, invoice, refund, payout, and provider event state.

Finance-canonical:

- finance reconciliation reports, Stripe/accounting exports, and owner-approved finance scripts.

Analytics-canonical:

- sanitized `analytics_events` rows and bounded aggregate Admin Analytics views.

Local/browser:

- best-effort CTA/product telemetry emissions only.
- no commerce truth, entitlement truth, provider truth, finance truth, persistent attribution ID, or
  browser-owned reconciliation status.

## Reliability And Failure States

Future checkout, entitlement, dashboard, or finance children must preserve these failure meanings:

| State                                           | Required interpretation                                                                             |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Unknown, inactive, missing, or unmapped product | Fail closed for dedicated checkout/CTA KPIs and future runtime presentation until mapped.           |
| Missing Stripe price/config                     | Checkout unavailable/config issue, not user disinterest and not product performance.                |
| Checkout route validation failure               | Expected request failure with deterministic status, not payment failure.                            |
| Stripe provider create failure                  | Provider availability/config issue, not payment failure or finance state.                           |
| Invalid webhook signature                       | Security rejection. Must not fulfill entitlement or count completion.                               |
| Ignored webhook event                           | Provider event intentionally out of scope. Must not imply checkout failure.                         |
| Webhook delay or retry                          | Pending provider/fulfillment state. Must not be collapsed into success or failure without evidence. |
| Entitlement lag or repair                       | App access state needs reconciliation. Must not be treated as revenue or refund state.              |
| Reconciliation mismatch                         | Finance/support exception requiring finance evidence, not Admin Analytics correction.               |
| Stale/capped analytics read                     | Reporting quality state only. Must not alter checkout, entitlement, provider, or finance truth.     |

## Security And Privacy

Future protected commerce changes must:

- fail closed for unauthenticated, unauthorized, invalid, or unsupported inputs,
- verify Stripe webhook signatures before fulfillment,
- keep Stripe secrets and provider IDs server-side except where existing provider contracts already
  require redacted support evidence,
- use exact product IDs from the catalog rather than browser-selected price IDs,
- avoid raw provider responses, raw payload JSON, raw URLs, payment details, and finance exports in
  Admin Analytics,
- add negative-path tests for invalid product, inactive product, unsupported body, provider failure,
  invalid webhook signature, missing entitlement, and forbidden access when those surfaces change.

Forbidden in client analytics and raw Admin Analytics display:

- raw checkout URL, billing portal URL, Stripe customer ID, Checkout Session ID, payment ID, price
  ID, invoice ID, refund ID, payout ID, accounting export row, cart/payment details,
- email, user ID, visitor ID, IP address, User-Agent, fingerprint, raw URL, raw referrer, query
  string, cookie/localStorage attribution, ad click ID,
- raw workout title, notes, step text, generated prompt, raw workout JSON, private workout row ID,
  free-text support/contact/profile/goal/training context.

## Identity And Rename Rules

Canonical stable IDs:

- `CatalogProductId` is product identity.
- `event_name` is append-only product telemetry identity.
- Stripe provider IDs are provider/reconciliation identities and stay server-side/support-redacted.
- Entitlement row identity is app access identity.
- Finance export/reconciliation identifiers are finance identities.

Renameable display fields:

- CTA copy, checkout button text, product title, product slug, dashboard labels, Help/Guide text,
  localized copy, and support phrasing.

Repurpose requiring a new child:

- treating CTA clicks as checkout,
- treating checkout start as payment success,
- treating provider completion as app entitlement without fulfillment evidence,
- treating entitlement rows as finance close,
- treating finance reports as product funnel telemetry without explicit aggregation and privacy
  boundaries.

## Support And Help Boundary

Support may say:

- CTA/product telemetry shows product-interest signals only.
- Checkout start means handoff/session creation, not payment success.
- A mapped workout-context checkout start means the approved saved-workout CTA path reached checkout
  handoff for `guide_poolside`; it is still not purchase, access, revenue, or finance proof.
- Stripe provider state and webhook fulfillment can lag or retry.
- Entitlement state tells whether the app recognizes access.
- Finance reporting comes from reconciliation/export evidence, not Admin Analytics counts.

Support must not say:

- a CTA click proves checkout started or purchase happened,
- checkout start proves payment success,
- Stripe completion alone proves app access in every edge case,
- entitlement access proves revenue, refund, payout, invoice, or accounting state,
- Admin Analytics proves individual behavior or finance truth.

Future CTA, checkout, billing, entitlement, support recovery, finance, dashboard, export, or vendor
children must update Help/Guide and relevant runbooks in the same PR, or include an explicit
scope-specific `N/A` rationale.

## Forward Compatibility

Future additions inherit this contract automatically only when they:

- keep product IDs catalog-backed,
- keep event names typed and append-only,
- keep checkout/provider/entitlement/finance truth layers separate,
- use low-cardinality privacy-safe dimensions,
- render unknown values as safe diagnostics or fail closed until mapped.

Explicit owner mapping is required for:

- new product purchase models,
- new workout-context placements,
- new checkout steps or events,
- new Stripe webhook meanings,
- new entitlement states,
- new finance reports or accounting exports,
- refunds, payouts, invoices, or revenue attribution,
- raw drilldown, CSV/export, warehouse views, or third-party analytics forwarding,
- localized purchase claims,
- public SEO/AI-discoverable commerce content.

Unknown or deprecated values:

- fail closed for dedicated KPIs and runtime commerce behavior,
- must not imply purchase, access, revenue, refund, payout, invoice, or finance state,
- may appear only as support-safe aggregate diagnostics after a child maps labels, privacy, and
  repair behavior.

## Future Child Checklist

Before workout-context checkout attribution or finance-adjacent implementation starts, the child
must prove:

- the product and placement are explicitly mapped,
- the route/API boundary and cache mode are named,
- Checkout Sessions or another official Stripe integration surface has been re-checked against
  current official docs,
- webhook signature verification and idempotency/retry behavior are preserved where touched,
- entitlement truth and finance truth stay separate from analytics,
- sensitive provider/payment/user fields stay out of client analytics and raw Admin Analytics,
- zero, duplicate, unknown, stale, capped, provider-failed, webhook-delayed, entitlement-lagged, and
  reconciliation-mismatch states have deterministic copy/tests,
- route/label/support sweep evidence is recorded,
- Help/Guide/runbook impact is handled,
- rollback/disable/repair behavior is documented,
- UI changes, if any, have screenshot handoff approval before `npm run verify:pre-pr`.
