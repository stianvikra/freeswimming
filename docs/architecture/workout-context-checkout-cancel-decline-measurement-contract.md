# Workout Context Checkout-Cancel / Decline Measurement Contract

Last updated: 2026-06-12

## Purpose

This contract defines how FreeSwimming may later measure workout-context checkout cancel or decline
behavior. It is intentionally a contract only. It does not add runtime event callsites, checkout
behavior, Stripe behavior, entitlement logic, Admin Analytics UI, finance reporting, exports, raw
drilldown, vendor analytics, product catalog changes, pricing, migrations, or RLS changes.

Related contracts:

- `docs/architecture/workout-context-cta-measurement-contract.md`
- `docs/architecture/workout-checkout-attribution-finance-separation-contract.md`
- `docs/architecture/workout-context-checkout-completion-entitlement-attribution-contract.md`

## Current Decision

Workout-context `upsell_declined` remains unmapped until a later runtime child implements one exact
signal approved by this contract.

The current plans and My Library checkout-cancel tracker may continue to emit `upsell_declined` for
existing commercial surfaces. That existing signal means a user returned from checkout with the
current `checkout=cancelled` flag for those surfaces. It does not mean all ignored users, all
non-buyers, failed checkout creation, provider failure, entitlement failure, refund state, revenue,
or finance truth.

Workout-context decline may become measurable only through a future owner-approved child that
chooses one of these explicit signals:

- checkout-cancel return from a mapped workout-context checkout path,
- explicit CTA dismiss from a mapped workout-context CTA surface,
- another named user action with a bounded reason key.

Absence of a future event is unknown, not decline.

## Eligible Signals

### Mapped Checkout-Cancel Return

A checkout-cancel return may be eligible for workout-context counting only when all of these are
true:

- `source=workout_context`,
- `placementId=workout_saved_post_success`,
- `productId=guide_poolside`,
- the cancel return came from the same mapped saved-workout CTA -> `/plans` -> Poolside guide
  checkout path,
- a future runtime child intentionally preserves those dimensions through the cancel path,
- tests prove generic plans traffic, other products, malformed values, and future placements stay
  out of dedicated workout-context decline counts.

If any required dimension is missing, malformed, mismatched, deprecated, or unmapped, the row must
remain generic/current-surface telemetry or safe review data. It must not enter a dedicated
workout-context decline KPI.

### Explicit CTA Dismiss

An explicit CTA dismiss may be eligible only after a future UI child defines:

- a visible dismiss or "not now" control,
- accessibility behavior, focus order, and screen-reader label,
- local suppression or no-suppression behavior,
- whether the action hides only the current prompt or changes future eligibility,
- payload fields and bounded reason key,
- screenshot handoff and Help/Guide copy.

No hidden timeout, scroll-away, route change, closed tab, or non-click may be counted as explicit
dismiss.

## Ineligible Signals

These must not count as workout-context decline:

| Signal or state                              | Required interpretation                                                                 |
| -------------------------------------------- | --------------------------------------------------------------------------------------- |
| CTA not clicked                              | Unknown. It is not decline and not non-buyer evidence.                                  |
| CTA not shown                                | No eligible exposure. It is not decline.                                                |
| User closed the checkout tab                 | Unknown unless Stripe/app return provides an approved mapped signal.                    |
| Checkout Session creation failed             | Checkout availability/config/provider issue, not user decline.                          |
| Stripe provider create failure               | Provider availability issue, not user decline or finance state.                         |
| Webhook delay or missing webhook             | Provider/fulfillment state, not user decline.                                           |
| Entitlement lag or entitlement repair        | App access/support state, not decline or finance truth.                                 |
| Refund, payout, invoice, or accounting state | Finance/provider state, never product decline telemetry.                                |
| Product inactive, missing, or unmapped       | Fail closed for dedicated workout-context decline counts until mapped.                  |
| Unknown placement/source/reason              | Safe unknown/review state only; exclude from dedicated workout-context decline metrics. |

## Event Semantics

`upsell_declined` may mean workout-context decline only after a future child defines the exact
runtime signal and maps it here.

Allowed future reason keys must be bounded machine values such as:

- `checkout_cancelled` for an approved mapped checkout-cancel return,
- `cta_dismissed` for an approved explicit CTA dismiss.

Reason keys are append-only after they appear in analytics, support docs, or tests. Changing
meaning requires a new child and either a new key or an explicit alias/migration plan.

Do not use `upsell_declined` to mean:

- all users who ignored the CTA,
- all users who did not buy,
- all users who started checkout but did not complete,
- checkout failure,
- payment failure,
- provider failure,
- refund,
- entitlement failure,
- revenue loss,
- finance truth.

Duplicate client-side cancel/dismiss events remain repeated telemetry events unless a future child
adds a deterministic dedupe contract. Dashboard copy must not describe them as unique users.

## Allowed Payload Dimensions

Future workout-context decline telemetry may include only low-cardinality, sanitized dimensions:

- `source`: `workout_context`,
- `placementId`: `workout_saved_post_success`,
- `productId`: `guide_poolside`,
- `surface`: a mapped surface value such as `plans_checkout_return` or `saved_workout_post_success`,
- `reason`: a bounded key approved by this contract,
- `sourceKind`, `builderMode`, or `saveKind` only when already canonical and explicitly mapped.

Forbidden values:

- raw checkout URL, billing portal URL, Stripe Checkout Session ID, Stripe customer ID, payment ID,
  price ID, invoice ID, refund ID, payout ID, payment method, cart details, provider response, or
  accounting export row,
- email, user ID, visitor ID, IP address, User-Agent, fingerprint, cookie, localStorage attribution,
  ad click ID, raw URL, raw referrer, or query string,
- raw workout title, notes, step text, generated prompt, raw workout JSON, private workout row ID,
  free-text support/contact/profile/goal/training context,
- inferred propensity, inferred purchase intent, inferred revenue value, inferred entitlement state,
  or inferred finance state.

## Dashboard Interpretation

A future Admin Analytics workout-context decline module may exist only after a dedicated mapping
child ships:

- typed event and payload helper behavior,
- exact source/placement/product/reason mapping,
- tests for eligible and ineligible rows,
- unknown/unmapped diagnostics,
- duplicate, zero, stale, capped, schema-missing, and failed-read behavior,
- Help/Guide or runbook copy,
- screenshot handoff approval.

When it exists, it must say:

- decline/cancel counts are selected-range event counts,
- checkout-cancel means return-from-checkout only for the mapped path,
- explicit dismiss means the mapped dismiss control was activated,
- decline rate may use `declined / presented` only when the event meaning and denominator are
  mapped,
- counts are not unique-user conversion, purchase failure, provider failure, entitlement failure,
  revenue, refund, payout, invoice, accounting export, Stripe reconciliation, or finance reporting.

The existing Poolside guide stage summary must not add a decline stage until a future child maps the
stage, denominator, zero behavior, Help/Guide copy, and screenshot evidence.

## Data Placement And Cache Contract

Server-canonical:

- persisted `analytics_events` rows for future decline telemetry,
- product identity from the catalog,
- checkout/session and Stripe webhook contracts for provider truth,
- entitlement storage for app access truth,
- Stripe/accounting reconciliation for finance truth.

Local/browser:

- best-effort cancel/dismiss analytics emission only,
- optional session-level duplicate suppression only after a future implementation child defines it,
- no analytics cookie, visitor ID, persistent attribution ID, localStorage analytics identity, ad
  click ID, or user-to-public bridge.

Cache and invalidation:

- This contract changes no runtime cache.
- Future Admin Analytics reads remain bounded `no-store` aggregate reads.
- Future runtime cancel-path propagation must define exact URL/query behavior and safe fallback for
  stale, missing, malformed, or future values.

## Security And Privacy

This contract does not widen access to any public, user, admin, checkout, Stripe, entitlement,
service-role, export, vendor, or finance route.

Future protected changes must:

- fail closed for unauthenticated or unauthorized access,
- validate exact source/placement/product/reason values,
- keep Stripe/provider/finance/user identifiers server-side,
- avoid raw payload JSON in Admin UI,
- add negative-path tests for malformed values and forbidden protected access when those surfaces
  change.

## Commerce And Finance Boundary

Workout-context decline/cancel telemetry is product/support telemetry only.

It may help answer whether a mapped prompt or checkout return action happened. It must not answer:

- whether payment succeeded or failed,
- whether Stripe created or failed a provider object,
- whether the app granted or failed entitlement,
- whether a refund, payout, invoice, or accounting export exists,
- whether revenue was recognized,
- whether a user is a non-buyer,
- whether finance reconciliation is complete.

Finance reporting must use Stripe/accounting reconciliation artifacts and owner-approved finance
scripts, not Admin Analytics decline/cancel counts.

## Identity And Rename Rules

Canonical stable IDs:

- event name: `upsell_declined`,
- source: `workout_context`,
- placement ID: `workout_saved_post_success`,
- product ID: `guide_poolside`,
- reason key: future bounded key such as `checkout_cancelled` or `cta_dismissed`.

Renameable display fields:

- CTA copy,
- checkout button text,
- product title,
- dashboard labels,
- Help/Guide text,
- localized display text.

Repurpose requiring a new child:

- counting ignored users as decline,
- changing plans-owned cancel telemetry into workout-context telemetry without mapped dimensions,
- using checkout failure as decline,
- using provider/entitlement/finance states as decline,
- adding a decline stage to a funnel summary without explicit denominator and caveat rules.

## Support And Help Boundary

Support may say:

- current plans/My Library checkout-cancel telemetry means a checkout return flag was observed for
  those existing surfaces,
- workout-context decline/cancel is not currently mapped as a dedicated KPI,
- a future mapped checkout-cancel signal would mean a user returned from checkout on the approved
  saved-workout Poolside path, not that payment failed,
- a future explicit dismiss signal would mean a mapped dismiss control was activated.

Support must not say:

- every user who did not buy declined,
- every checkout start without completion is a decline,
- checkout cancel proves payment failure,
- decline/cancel proves provider failure, entitlement failure, refund, payout, invoice, revenue, or
  finance state,
- Admin Analytics proves individual behavior.

Future runtime/dashboard children that change visible operator copy must update Help/Guide or linked
runbooks and include automated assertions.

## Forward Compatibility

Future additions inherit this contract automatically only when they:

- use mapped stable source/placement/product/reason IDs,
- use low-cardinality privacy-safe payload values,
- keep checkout/provider/entitlement/finance truth separate,
- fail closed for unknown, deprecated, inactive, malformed, or unmapped values.

Explicit owner mapping is required for:

- new workout-context placements,
- new products,
- direct checkout,
- new checkout return params,
- new decline reason keys,
- explicit dismiss controls,
- dedicated decline dashboard modules,
- export/raw drilldown,
- vendor analytics forwarding,
- finance reporting,
- localized commercial claims,
- public SEO/AI-discoverable commerce content.

Unknown or deprecated values:

- stay out of dedicated workout-context decline counts,
- may appear only as bounded review/support diagnostics after a future child maps labels and privacy,
- must not imply conversion loss, provider failure, entitlement failure, revenue, refund, payout,
  invoice, accounting close, or finance truth.

## Future Child Checklist

Before workout-context decline/cancel implementation starts, the child must prove:

- whether the signal is checkout-cancel, explicit dismiss, or another named action,
- exact source/placement/product/reason mapping,
- current-surface `/plans` and My Library cancel telemetry remains separate,
- malformed/future/unknown values fail closed,
- sensitive checkout/provider/user/workout/finance fields are excluded,
- duplicate and absent-event behavior is clear,
- Admin Analytics denominator and zero behavior are defined if dashboard scope is included,
- Help/Guide/runbook impact is handled,
- route/label/support sweep evidence is recorded,
- UI changes, if any, have screenshot handoff approval before `npm run verify:pre-pr`.
