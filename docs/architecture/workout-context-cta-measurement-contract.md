# Workout Context CTA Measurement Contract

Last updated: 2026-06-12

## Purpose

This contract defines how FreeSwimming may measure the first workout-context commercial CTA.
It is intentionally a measurement contract for historical rows and any future owner-approved
placement. The saved-workout save-success runtime prompt has been removed/deferred because the
separate paid Poolside guide was not clear enough in that success-message context.

The current product decision is conservative:

- First historical placement candidate: saved-workout post-success state.
- Stable placement ID for that candidate: `workout_saved_post_success`.
- Historical mapped product: `guide_poolside`.
- Product identity source: `CatalogProductId` from `lib/commerce/catalog.ts`.
- Event family: historical runtime rows may use `upsell_presented` and `upsell_accepted` for the
  mapped workout-context callsites with the semantics below. The current workout save success
  surface no longer emits those prompt events. `upsell_declined` remains unmapped for workout
  context until
  `docs/architecture/workout-context-checkout-cancel-decline-measurement-contract.md` approves a
  concrete checkout-cancel, explicit dismiss, or equivalent bounded signal.
- Dashboard truth: the dedicated workout-context CTA Admin Analytics module may count only the
  explicitly mapped runtime callsites and must keep checkout, entitlement, Stripe, revenue, and
  finance truth separate.

## Placement Decision

The first historical runtime candidate was a non-blocking CTA after a successful canonical workout
create or update. It is now removed/deferred from the save success surface.

Rules:

- The save must have completed successfully before the CTA can be eligible.
- The user must be in a stable post-success or review state.
- Save confirmation, edit, recovery, export, and review actions must remain more prominent than the
  commercial action.
- A future runtime prompt must explain that Poolside guide is a separate paid guide product, not a
  Poolside Note export or part of the saved workout.
- The CTA must not imply purchase is required to finish, recover, export, edit, or use the workout.
- The placement ID is write-once after it appears in analytics, support diagnostics, docs, or tests.

`workout_saved_post_success` means only this saved-workout post-success candidate. It must not be
reused for generated-draft review, template-applied review, saved-library detail, poolside preview,
checkout recovery, entitlement recovery, or support workflows.

## Forbidden States

No workout-context CTA may appear in these states:

| State                                                                                                           | Reason                                                              |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Active manual editing, step authoring, rearrange mode, inline validation, unsaved edits, delete, or discard     | The primary workout job is not complete.                            |
| Generator intake, block toggles, refresh, loading, handoff preparation, provider failure, or validation failure | The user is still creating or recovering the workout.               |
| Auth, entitlement, checkout, claim, billing, download recovery, support escalation, or finance contexts         | Those flows have separate access, recovery, and finance contracts.  |
| Admin Analytics, runbooks, owner operations, or support diagnostics                                             | Operator surfaces must not contain user-facing commercial behavior. |

If a future child needs another placement category, it must define a new stable `placementId`, tests,
support copy, and screenshot handoff. It must not expand `workout_saved_post_success`.

## Product Mapping

Current catalog product IDs are:

- `guide_0_1000m`
- `guide_poolside`
- `analysis_video`

Product identity must come from the catalog product ID. It must not come from:

- CTA text,
- product title,
- product slug,
- route label,
- Stripe price ID,
- checkout URL,
- entitlement row,
- analytics payload copy.

Historical runtime mapping selected `guide_poolside`. Future products require explicit mapping
before presentation.

Fail-closed behavior:

| Product state                         | Runtime CTA behavior                         | Measurement behavior                                                   |
| ------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------- |
| Known, active, mapped catalog product | Eligible only when placement rules also pass | Countable after mapped event callsites exist.                          |
| Missing catalog product               | Do not render CTA                            | No trusted CTA event.                                                  |
| Inactive catalog product              | Do not render CTA                            | No trusted CTA event.                                                  |
| Unknown product ID                    | Do not render CTA                            | May appear only as safe aggregate diagnostics after dashboard mapping. |
| Deprecated or unmapped product        | Do not render CTA                            | Exclude from dedicated CTA rates until explicitly mapped.              |

## Event Semantics

Workout-context use of `upsell_*` events must not change the existing `/plans` and My Library
baseline meanings.

| Event              | Workout-context meaning                                                                                                                                    | Does not mean                                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `upsell_presented` | The mapped historical CTA was actually rendered in the mapped `placementId` for a mapped catalog product.                                                  | Checkout started, checkout completed, entitlement granted, revenue, or that the user saw every pixel.             |
| `upsell_accepted`  | The user explicitly activated the mapped historical CTA.                                                                                                   | Checkout completion, payment success, entitlement, revenue, finance reconciliation, or unique-user conversion.    |
| `upsell_declined`  | Only the mapped checkout-cancel return, or a later mapped dismiss/skip signal, may count for workout context under the checkout-cancel / decline contract. | All ignored users, all non-buyers, generic checkout-cancel returns, failed checkout, refund, or finance evidence. |

Duplicate client events count as repeated telemetry events unless a later child adds a deterministic
dedupe contract. Dashboard copy must not call them unique users.

Zero denominator behavior:

- accepted rate is `accepted / presented` when `presented > 0`; otherwise `null` or "not enough data",
- declined rate is `declined / presented` only for the mapped checkout-cancel return after the
  stage-summary denominator child; future dismiss/skip signals still need their own mapping,
  denominator, zero behavior, copy, Help/Guide impact, and tests,
- checkout and entitlement rates must not be derived from workout-context `upsell_*` rows.

## Allowed Payload Dimensions

Future runtime analytics may include only low-cardinality, sanitized values:

- `placementId`: `workout_saved_post_success` or another explicitly mapped future ID,
- `productId`: catalog product ID,
- `source`: `workout_context` or another mapped low-cardinality source value,
- `surface`: a mapped surface value such as `saved_workout_post_success`,
- `sourceKind`: existing approved low-cardinality workout source kind when already available,
- `templateKey`: only when an explicit template was used and the value comes from the template
  registry contract,
- `saveKind` or `builderMode`: only if already canonical and explicitly mapped by the runtime child.

Forbidden values:

- raw workout title, notes, step text, generated prompt, raw workout JSON, or private workout row ID,
- email, user ID, visitor ID, IP address, User-Agent, fingerprint, raw URL, raw referrer, query
  string, cookie, localStorage attribution, or ad click ID,
- payment method, cart details, Stripe customer/session/payment/invoice IDs, refunds, payouts, or
  accounting exports,
- free-text profile, goal, habit, training context, message, contact, or support content,
- inferred propensity, inferred purchase intent, inferred revenue value, or inferred entitlement
  state from workout telemetry.

## Dashboard Interpretation

The Admin Analytics workout-context CTA module may exist only when all of this is true:

- mapped runtime CTA callsites,
- exact `placementId`,
- exact product ID mapping,
- typed event/payload helpers,
- tests for allowed and forbidden states,
- duplicate/zero/unknown/stale/capped/schema-missing behavior,
- Help/Guide copy,
- screenshot handoff approval.

When it exists, the module must describe:

- presented as CTA visibility only,
- accepted as clicked intent only,
- declined only as the exact mapped decline signal if a later child defines one under the
  checkout-cancel / decline contract,
- all rates as event-rate telemetry, not unique-user conversion,
- checkout, entitlement, Stripe, revenue, and finance truth as separate systems.

Unknown, deprecated, disabled, or unmapped placement/product values must not disappear silently. They
may be shown only as safe aggregate diagnostics and must be excluded from known-placement/product
rates until explicitly mapped.

## Data Placement And Cache Contract

Server-canonical:

- `analytics_events` rows for future CTA telemetry,
- product identity and availability from the catalog,
- checkout truth from checkout/session and Stripe webhook contracts,
- entitlement truth from server-canonical entitlement records,
- finance truth from Stripe/accounting reconciliation.

Local/browser:

- historical transient CTA visibility/click state only,
- best-effort analytics emission that may duplicate on retry,
- no analytics cookie, visitor ID, localStorage attribution, ad click ID, user-to-public bridge, or
  admin preference.

Cache and invalidation:

- This document changes no runtime cache.
- A future runtime child must define one placement/product source of truth, cache mode, invalidation,
  stale-state behavior, rollback path, and kill switch.
- Admin insights reads must remain bounded aggregate reads and must not expose raw payload JSON.

## Reliability And Failure Handling

Future runtime behavior must fail closed:

| Condition                                               | Required behavior                                                           |
| ------------------------------------------------------- | --------------------------------------------------------------------------- |
| Placement disabled or unmapped                          | Do not render CTA and emit no trusted CTA event.                            |
| Product missing, inactive, deprecated, or unmapped      | Do not render CTA and emit no trusted CTA event.                            |
| Catalog or entitlement check unavailable where required | Do not render CTA; keep workout save/review usable.                         |
| Analytics emission failure                              | Do not block workout save/review; no user-facing error.                     |
| Admin insight stale/capped/schema-missing/failed read   | Show deterministic trust state and do not infer success.                    |
| Unknown payload value                                   | Keep separate as unknown diagnostics only after explicit dashboard mapping. |

## Security And Privacy

This contract does not widen access to any public, user, admin, entitlement, service-role, checkout,
Stripe, or finance route.

Future protected changes must:

- fail closed for unauthenticated or unauthorized access,
- keep checkout/entitlement/finance IDs out of client analytics payloads,
- avoid raw payload JSON in Admin UI,
- add negative-path tests for protected routes and forbidden states,
- keep secrets and Stripe IDs server-side except where existing provider contracts already require
  redacted support evidence.

## Commerce And Finance Boundary

Telemetry layers stay separate:

- `upsell_presented`: CTA rendered in mapped placement, not checkout start.
- `upsell_accepted`: clicked CTA intent, not checkout completion.
- `checkout_started`: Checkout Session creation path, not payment success.
- `checkout_completed`: Stripe/webhook-backed completion signal, not full finance close.
- entitlement truth: server-canonical entitlement state, not analytics truth.
- finance truth: Stripe/accounting reconciliation, not Admin Analytics product telemetry.

No workout-context CTA signal may be used as revenue recognition, refund evidence, payout evidence,
invoice evidence, accounting export evidence, entitlement truth, Stripe reconciliation, or finance
reporting.

## Identity And Rename Rules

Canonical stable IDs:

- `placementId`: write-once machine ID such as `workout_saved_post_success`,
- `event_name`: append-only event identity,
- `productId`: catalog product ID.

Renameable display fields:

- CTA copy,
- product title,
- product slug,
- dashboard label,
- Help/Guide text,
- localized display text.

Repurpose requiring a new child:

- moving the CTA to a materially different moment,
- counting a different action under an existing event,
- changing `declined` from a mapped action into an inferred non-conversion bucket,
- using CTA telemetry as checkout, entitlement, revenue, or finance truth.

## Support And Help Boundary

Support may say:

- workout-context CTA V1 may appear only after a successful saved-workout post-success state,
- `workout_saved_post_success` is the first approved runtime placement,
- a presented event means the CTA rendered in that mapped placement,
- an accepted event means clicked intent only,
- product telemetry is not checkout, entitlement, Stripe, revenue, or finance evidence.

Support must not say:

- saving a workout means the user is eligible for or interested in a purchase,
- a CTA was shown without an explicit mapped `upsell_presented` event or UI evidence,
- accepted CTA means checkout completed,
- checkout completion means entitlement or finance reconciliation is complete,
- analytics counts prove individual behavior.

Future dashboard, decline, checkout, entitlement, finance, or additional CTA-placement work must
update Help/Guide and relevant runbooks in the same PR.

## Forward Compatibility

Future additions inherit this contract automatically only when they:

- use a mapped stable placement ID,
- use catalog product IDs,
- fit an approved placement category,
- use low-cardinality privacy-safe dimensions,
- keep CTA telemetry separate from checkout, entitlement, Stripe, revenue, and finance truth.

Explicit owner mapping is required for:

- new workout-context placements,
- new product purchase models,
- new `upsell_*` meanings,
- workout-context checkout-cancel or explicit dismiss meanings,
- checkout attribution,
- entitlement-aware targeting,
- finance reporting,
- raw drilldown or CSV export,
- third-party analytics/vendor forwarding,
- localized commercial claims,
- public landing or SEO/AI-discoverable content.

Unknown or deprecated values fail closed for CTA presentation and may only appear as safe aggregate
diagnostics after a later child maps them.

## Future Child Checklist

Before runtime workout-context CTA work starts, the child must prove:

- selected placement is `workout_saved_post_success` or another explicitly mapped eligible ID,
- primary workout action remains more prominent than the CTA,
- no CTA appears in forbidden states,
- product identity comes from the catalog,
- missing/inactive/unknown/unmapped products fail closed,
- analytics payloads exclude forbidden values,
- event helpers are typed and privacy-safe,
- checkout, entitlement, Stripe, and finance truth stay separate,
- Help/Guide and route/label/support sweep evidence are complete,
- screenshot handoff is approved before pre-PR verification.
