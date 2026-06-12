# Workout Context Checkout Completion + Entitlement Attribution Contract

Last updated: 2026-06-11

## Purpose

This contract defines how the mapped workout-context checkout-start handoff can be connected to
checkout completion and entitlement grant interpretation.

The current runtime implementation carries only the approved server-owned attribution fields from
checkout-start into Stripe Checkout Session metadata, webhook-backed `checkout_completed`, and
app-recognized `entitlement_granted` product telemetry. Admin Analytics may now expose a read-only
dedicated workout-context completion/access aggregate only for rows that carry the same approved
source, placement, and product values. It still does not add finance scripts, exports, raw
drilldown, migrations, RLS, pricing, product catalog rows, direct checkout, or provider UI.

## Official Provider Baseline

Official Stripe docs were checked on 2026-06-11 for this contract and rechecked before the runtime
propagation implementation:

- Stripe Checkout: <https://docs.stripe.com/payments/checkout>
- Create a Checkout Session: <https://docs.stripe.com/api/checkout/sessions/create>
- Checkout Session object: <https://docs.stripe.com/api/checkout/sessions/object>
- Stripe event types: <https://docs.stripe.com/api/events/types>
- Stripe webhook signature verification: <https://docs.stripe.com/webhooks/signature>
- Stripe idempotent requests: <https://docs.stripe.com/api/idempotent_requests>

Provider baseline for this repo remains:

- Use Stripe-hosted Checkout Sessions for one-time web checkout unless a later child justifies
  another official Stripe integration surface.
- Verify Stripe webhook signatures with the raw request body, `Stripe-Signature` header, and
  endpoint secret before fulfillment.
- Use non-sensitive idempotency keys for retryable provider writes where duplicate provider objects
  would be harmful.
- Treat `checkout.session.completed` and `checkout.session.async_payment_succeeded` as provider
  completion inputs only after signature verification and route-level validation.
- Keep Stripe secrets, Checkout Session IDs, customer IDs, payment IDs, invoice IDs, checkout URLs,
  portal URLs, payment method details, emails, and user identifiers out of browser analytics payloads
  and raw Admin Analytics display.

Future provider behavior changes must re-check official Stripe docs at execution time and update the
external service matrix, route registry, tests, support diagnostics, and rollback notes.

## Current Repo Baseline

Checkout start:

- `/api/checkout/session` creates a Stripe Checkout Session for a catalog product.
- `checkout_started` emits only after a Checkout Session redirect URL exists.
- The checkout-start analytics payload may contain only low-cardinality `productId`, normalized
  `source`, and approved `placementId`.
- The mapped workout-context bridge currently means only:
  - `source=workout_context`,
  - `placementId=workout_saved_post_success`,
  - `productId=guide_poolside`.
- That mapping is product telemetry for checkout handoff only. It is not checkout completion,
  entitlement, revenue, unique-user conversion, Stripe reconciliation, or finance truth.

Stripe session and webhook:

- The current Checkout Session metadata carries product identity and, when available, a server-owned
  user reference for provider/fulfillment purposes.
- The current Checkout Session metadata and invoice metadata carry approved workout-context
  attribution only when source, placement, and product match the server-owned mapping:
  - `fs_attribution_source=workout_context`,
  - `fs_attribution_placement_id=workout_saved_post_success`,
  - `fs_attribution_product_id=guide_poolside`.
- Generic plans/library traffic, unknown values, malformed values, future values, and product
  mismatches omit those attribution fields.
- The webhook route supports `checkout.session.completed` and
  `checkout.session.async_payment_succeeded`.
- `checkout.session.completed` with a non-`paid` payment status is deferred for async payment
  confirmation.
- The webhook emits server-side `checkout_completed` after provider completion validation and
  catalog product resolution. It adds safe `source`, `placementId`, and `productId` only when the
  Stripe metadata matches the resolved catalog product.
- The webhook then attempts entitlement fulfillment and emits generic server-side
  `entitlement_granted` after the app recognizes access. It adds the same safe attribution only
  after entitlement fulfillment succeeds.
- Analytics payloads do not include Checkout Session IDs, customer IDs, payment IDs, invoice IDs,
  checkout URLs, portal URLs, emails, user IDs, or raw provider responses.

Analytics sanitizer:

- Sensitive analytics payload keys such as `session`, `customer`, and `payment` are redacted before
  persistence.
- Redaction is a privacy guard, not a join contract. Redacted provider identifiers must not be used
  to connect product telemetry to provider, entitlement, or finance truth.

## Contract Decision

Workout-context checkout completion and entitlement attribution propagation is implemented only as a
backend telemetry/support foundation.

The existing generic `checkout_completed` and `entitlement_granted` events may carry approved
workout-context attribution fields. They may be counted as dedicated workout-context completion or
entitlement outcomes only by the read-only Admin Analytics mapping that explicitly checks the
approved source, placement, and product values and preserves the privacy/support boundaries end to
end.

Allowed today:

- Show generic checkout completion and entitlement grant counts with caveats.
- Show mapped workout-context checkout-start handoff counts with caveats.
- Persist approved workout-context attribution on webhook-backed `checkout_completed` and
  `entitlement_granted` rows as low-cardinality product telemetry.
- Say that the mapped workout-context path reached checkout handoff for `guide_poolside` when the
  mapped `checkout_started` row exists.

Forbidden today:

- Joining mapped workout-context `checkout_started` rows to unmapped/generic `checkout_completed`
  rows.
- Joining mapped workout-context CTA clicks or checkout starts to unmapped/generic
  `entitlement_granted` rows.
- Showing dedicated workout-context completion or entitlement modules for rows that do not match the
  approved source, placement, and product mapping.
- Inferring purchase, access, revenue, refund, payout, invoice, accounting, or finance truth from
  `upsell_*` or `checkout_started` rows.
- Claiming unique-user conversion from aggregate event counts.
- Displaying raw provider identifiers, raw payload JSON, emails, user IDs, checkout URLs, or payment
  details in Admin Analytics.

## Runtime Propagation Contract

Workout-context attribution may enter provider/webhook handling only through a server-owned,
allowlisted, low-cardinality contract.

Approved propagation shape:

| Field                         | Allowed value today                    | Source of truth                                   | Notes                                                                       |
| ----------------------------- | -------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------- |
| `fs_product_id`               | `guide_poolside` or another catalog ID | `CatalogProductId` from `lib/commerce/catalog.ts` | Already used for product fulfillment.                                       |
| `fs_attribution_source`       | `workout_context`                      | normalized server checkout attribution helper     | Must be omitted for generic plans/library traffic unless explicitly mapped. |
| `fs_attribution_placement_id` | `workout_saved_post_success`           | approved placement mapping                        | Must be omitted when source is not the mapped workout-context source.       |
| `fs_attribution_product_id`   | `guide_poolside`                       | validated request product after catalog lookup    | Must match the actual catalog product being checked out.                    |

Allowed storage targets for those fields:

- Stripe Checkout Session metadata.
- Invoice metadata only when the same low-cardinality values are needed for support or
  reconciliation and no sensitive fields are added.
- A future server-owned checkout attribution table or log only if a separate child defines schema,
  RLS, retention, repair, and query limits.

Forbidden propagation values:

- workout IDs, workout titles, workout notes, generated prompts, raw workout JSON,
- raw route URLs, raw referrers, query strings, ad click IDs, visitor IDs, localStorage IDs,
- emails, user IDs, IP addresses, User-Agent, fingerprints,
- Stripe Checkout Session IDs, customer IDs, payment IDs, invoice IDs, refund IDs, payout IDs,
- checkout URLs, portal URLs, payment method details, cart details, support free text, finance export
  rows.

## Admin Analytics KPI Contract

Dedicated workout-context completion or entitlement KPI modules require explicit mapping. The
current read-only Admin Analytics module may use the aggregate shape below for the approved
saved-workout guide path only.

Minimum future aggregate shape:

| Aggregate                                   | Required source rows                                                                                                   | Must exclude                                                                                  |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `workoutContextCheckoutCompleted.completed` | `checkout_completed` rows backed by signature-verified provider events and approved workout-context attribution fields | generic checkout completion rows, unknown attribution, mismatched products, unpaid sessions   |
| `workoutContextEntitlementGranted.granted`  | `entitlement_granted` rows backed by app entitlement fulfillment and approved workout-context attribution fields       | generic entitlement rows, provider-only completion, entitlement lag, repair-only unknown rows |

Required caveats:

- Completion means provider-backed Checkout Session completion for a mapped product and placement.
- Entitlement grant means the app recognized access after fulfillment.
- Review-needed diagnostics may separate only bounded safe buckets such as source not mapped,
  placement not mapped, product not mapped, incomplete attribution, and other review-needed.
- Completion without access and access without completion are selected-range support diagnostics,
  not user/session joins, provider failure proof, entitlement failure proof, or finance evidence.
- Neither value is unique-user conversion, revenue, refund, payout, invoice, accounting, or finance
  truth.
- Completion without entitlement is a support state, not a finance state.
- Entitlement without finance reconciliation is app access truth, not accounting close.

## Failure And Support States

Runtime and future dashboard children must preserve these meanings:

| State                                        | Required interpretation                                                                                     |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Missing attribution metadata                 | Generic checkout/provider/entitlement signal; excluded from dedicated workout-context KPI modules.          |
| Unknown attribution source or placement      | Fail closed for dedicated workout-context completion/entitlement KPIs.                                      |
| Product mismatch between attribution/product | Support review state; do not count as mapped completion or entitlement until repaired or explicitly mapped. |
| `checkout.session.completed` not `paid`      | Deferred async payment state; not completion for product KPI or entitlement.                                |
| `checkout.session.async_payment_succeeded`   | Provider completion input after signature verification; still requires fulfillment for entitlement truth.   |
| Invalid webhook signature                    | Security rejection; must not emit completion, grant entitlement, or count KPI.                              |
| Ignored webhook event                        | Provider event intentionally out of scope; must not imply failure or success.                               |
| Duplicate provider event                     | Idempotent fulfillment/replay concern; must not double-count dedicated KPI without a dedupe contract.       |
| Missing purchaser email                      | Fulfillment support state; not app entitlement success.                                                     |
| Product unresolved from session/line item    | Fulfillment support state; not mapped completion or entitlement.                                            |
| Entitlement lag                              | App access pending/repair state; not revenue, refund, payout, invoice, or finance truth.                    |
| Reconciliation mismatch                      | Finance/support exception requiring provider/accounting evidence, not Admin Analytics correction.           |
| Stale or capped analytics read               | Reporting quality state only; must not alter checkout, entitlement, provider, or finance truth.             |

## Security And Privacy

Future implementation must:

- fail closed for invalid products, inactive products, unsupported sources, invalid signatures, and
  unsupported webhook events,
- verify Stripe webhook signatures before reading provider events as truth,
- use catalog product IDs instead of browser-provided price IDs,
- keep provider IDs server-side or in support/reconciliation surfaces only,
- avoid raw provider responses and raw analytics payload JSON in Admin Analytics,
- avoid PII and free text in analytics payloads, metadata, dashboards, logs, and support summaries
  unless a separate support/reconciliation child explicitly approves redacted handling.

Admin Analytics may display:

- bounded counts,
- safe source/placement/product labels,
- safe unknown/unmapped diagnostic counts,
- selected-range completion/access gap counts,
- stale/capped/read-failure trust states.

Admin Analytics must not display:

- Checkout Session ID,
- Stripe customer, payment, invoice, refund, or payout IDs,
- checkout or portal URL,
- raw email or user ID,
- raw payload JSON,
- payment method, billing, shipping, or cart details,
- finance export rows or accounting identifiers.

## Support Language

Support may say:

- A mapped workout-context checkout start means the approved saved-workout CTA path reached checkout
  handoff for `guide_poolside`.
- A generic checkout completion means Stripe reported a supported Checkout Session completion event
  and the webhook accepted it.
- An entitlement grant means the app recognized access after fulfillment.
- Provider completion and app entitlement can be delayed, retried, or require repair.
- Finance reporting comes from reconciliation/export evidence, not Admin Analytics counts.

Support must not say:

- A workout-context CTA click proves checkout started.
- A checkout start proves purchase.
- A generic checkout completion proves it came from workout context.
- Stripe completion alone proves app access in every edge case.
- Entitlement access proves revenue, refund, payout, invoice, or accounting state.
- Admin Analytics proves individual behavior, unique-user conversion, or finance truth.

## Required Evidence

Before any runtime or dashboard child may ship or reinterpret workout-context completion or
entitlement attribution, it must include:

- current official Stripe docs evidence,
- typed metadata or server-owned attribution helper,
- checkout route tests for mapped, unknown, malformed, missing, and mismatched attribution,
- webhook tests for valid completion, async success, non-paid defer, invalid signature, ignored event,
  missing metadata, product mismatch, duplicate/retry, and provider failure,
- entitlement tests for grant, missing email, unresolved product, existing entitlement/replay,
  entitlement lag or repair, and forbidden sensitive payload fields,
- Admin Analytics tests for mapped counts, unknown exclusions, zero denominators, stale/capped states,
  and no raw payload/provider identifier display,
- Help/Guide or runbook updates explaining completion, entitlement, support states, and finance
  boundaries,
- rollback notes for disabling metadata propagation, dashboard mapping, and support diagnostics.

## Forward Compatibility

Future additions inherit this contract automatically only when they:

- use catalog-backed product IDs,
- use typed append-only analytics event names,
- keep checkout/provider/entitlement/finance truth layers separate,
- use low-cardinality privacy-safe dimensions,
- render unknown values as safe diagnostics or fail closed until mapped.

Explicit owner mapping is required for:

- new product purchase models,
- new workout-context placements,
- direct workout-context checkout,
- new checkout steps or events,
- new Stripe webhook meanings,
- new entitlement states,
- refunds, payouts, invoices, or revenue attribution,
- raw drilldown, CSV/export, warehouse views, or third-party analytics forwarding,
- localized purchase or access claims,
- public SEO/AI-discoverable commerce content.

Unknown or deprecated values:

- fail closed for dedicated KPIs and runtime commerce behavior,
- must not imply purchase, access, revenue, refund, payout, invoice, or finance state,
- may appear only as support-safe aggregate diagnostics after a child maps labels, privacy, and
  repair behavior.
