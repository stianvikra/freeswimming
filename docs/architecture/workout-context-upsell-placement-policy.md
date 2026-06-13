# Workout Context Upsell Placement Policy

Last updated: 2026-06-13

## Purpose

This contract defines when a commercial CTA may be considered in workout-builder or generator
context.

Current decision: no workout-context commercial CTA is active. The historical runtime V1 used a
non-blocking saved-workout post-success CTA for `placementId=workout_saved_post_success` and
`productId=guide_poolside`, but that save-success prompt is now removed/deferred. Existing
commercial surfaces remain `/plans` and My Library explore. Existing `upsell_presented`,
`upsell_accepted`, and `upsell_declined` events may continue to describe those current commerce
surfaces. Historical workout-context rows may be interpreted only under the measurement contract in
`docs/architecture/workout-context-cta-measurement-contract.md`; replacement placements,
`upsell_declined` meanings beyond the mapped checkout-cancel return, new products, checkout
attribution, entitlement-aware targeting, finance reporting, and dashboard mapping still require
later children.

## Product Principle

A workout-context CTA must never interrupt the user's primary training job. The primary job is to
create, generate, review, save, edit, export, or recover a workout. A CTA may be evaluated only
after that job has reached a stable, non-error state.

The first historical runtime candidate was a non-blocking post-success placement after the user had
saved a workout. It is no longer active. Any replacement placement must be selected by a future
child and must keep the completed workout action, recovery, edit, export, and review paths more
prominent than the commercial action.

## Placement Matrix

| Placement category                        | Eligibility   | Policy                                                                                                                                                                                                  |
| ----------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Saved-workout post-success state          | `eligible`    | May be considered after a successful canonical workout create/update, when the save confirmation and recovery options remain primary.                                                                   |
| Generated-draft accepted/review state     | `conditional` | May be considered only after the generated draft is visible and the next primary action remains review/save/edit. It must not appear during intake, generation, validation, loading, or failure states. |
| Template-applied draft review             | `conditional` | May be considered only after explicit template use has populated a draft. It must not imply template usage equals product interest, checkout intent, or revenue value.                                  |
| Saved workout library/detail review       | `conditional` | May be considered as a passive related option if it does not compete with edit, export, delete, poolside preview, or recovery actions.                                                                  |
| Active manual editing surface             | `forbidden`   | Do not place a commercial CTA inside step authoring, rearrange mode, inline validation, unsaved edits, delete/discard flows, or focus-critical controls.                                                |
| Generator intake and loading              | `forbidden`   | Do not place a commercial CTA in intake questions, block toggles, refresh, handoff preparation, loading, or provider-failure states.                                                                    |
| Error, auth, entitlement, and recovery    | `forbidden`   | Do not use a workout-context upsell to resolve errors, missing auth, missing entitlement, checkout recovery, download recovery, support escalation, or unavailable product states.                      |
| Checkout success, claim, billing, finance | `forbidden`   | Do not treat workout context as checkout recovery or finance evidence. These flows use their own checkout, entitlement, billing, and support contracts.                                                 |
| Admin Analytics and operator diagnostics  | `forbidden`   | Do not place user-facing commercial CTA behavior inside read-only admin analytics, support diagnostics, runbooks, or owner operations surfaces.                                                         |

## Signal Eligibility

Allowed as aggregate planning evidence only:

- `workout_builder_started` count and range trend,
- `workout_builder_saved` count and save/start rate,
- manual/generated source breakdown from safe `sourceKind` values,
- generated draft/save completion from `session_draft_generated` plus generated saves,
- template selection from explicit `workout_builder_template_selected`,
- safe route/product/catalog availability signals where already mapped.

Conditionally allowed in a future runtime child, or in historical runtime rows where explicitly
mapped:

- placement surface ID,
- stable product ID from the catalog,
- low-cardinality builder/source/template categories already approved by the analytics contract,
- entitlement/product availability state only when read from its canonical commerce source and
  used to fail closed.

Forbidden as placement input, analytics dimension, support evidence, or copy justification:

- raw workout title, notes, step text, generated prompt, raw workout JSON, or private workout row ID,
- email, user ID, visitor ID, IP address, User-Agent, fingerprint, raw URL, raw referrer, query
  string, cookie, localStorage attribution, or ad click ID,
- payment method, cart details, Stripe customer/session/payment/invoice IDs, refunds, payouts, or
  accounting exports,
- free-text profile, goal, habit, training context, message, contact, or support content,
- inferred user propensity, inferred purchasing intent, inferred revenue value, or inferred
  entitlement state from workout telemetry.

## Event And Dashboard Boundary

Workout-builder, generator, source, generated-completion, and template-usage metrics are product
telemetry. They may justify where a future CTA should be explored, but they do not mean a CTA was
shown, accepted, declined, or converted.

Before workout-context CTA performance can be measured, the measurement contract must define:

- the exact placement ID(s),
- the exact product ID(s),
- which current or new `upsell_*` events apply,
- safe payload dimensions,
- duplicate/retry behavior,
- Admin Analytics interpretation,
- Help/Guide copy,
- tests for allowed, forbidden, unknown, disabled, and failure states.

The first measurement contract is
`docs/architecture/workout-context-cta-measurement-contract.md`.

The Admin Analytics workout-context CTA module may count only the explicitly mapped historical
`workout_saved_post_success` / `guide_poolside` runtime CTA events as paused or future-placement
readiness telemetry. It must not infer active CTA performance from builder starts, saves, generated
drafts, template selection, checkout starts, checkout completions, or entitlement grants.

## Commerce And Finance Boundary

Telemetry layers stay separate:

- `upsell_presented`: product surface visibility, not checkout start.
- `upsell_accepted`: user clicked a commercial action, not checkout completion.
- `checkout_started`: Checkout Session creation path, not payment success.
- `checkout_completed`: Stripe/webhook-backed checkout completion signal, not full finance close.
- entitlement truth: server-canonical entitlement state, not analytics truth.
- finance truth: Stripe/accounting reconciliation, not dashboard product telemetry.

No workout-context signal may be used as revenue recognition, refund evidence, payout evidence,
invoice evidence, entitlement truth, or Stripe reconciliation.

## Identity And Rename Rules

Future placement identity must use stable machine IDs. Suggested category names in this document
are policy categories, not implemented event names.

Rules:

- placement IDs are write-once after use in analytics, support diagnostics, or documentation,
- product IDs come from the product catalog, not button text,
- labels, CTA copy, product titles, and localized display text are renameable when meaning is
  unchanged,
- moving a CTA to a materially different user moment is repurpose and needs a new child,
- counting a different action under an existing event is repurpose and needs a new child,
- unknown, deprecated, disabled, or unmapped placement/product values fail closed and show no CTA by
  default.

## Data Placement And Runtime Preconditions

This policy is docs-only. It does not choose runtime storage.

Any future runtime/config child must choose exactly one source for placement truth:

- static policy encoded in typed code,
- typed registry,
- runtime flag/config,
- server-canonical placement config.

That child must define cache mode, invalidation, stale-state behavior, rollback, kill switch, and
support diagnostics before release.

## Support And Help Boundary

Support may use this policy to answer why workout-context commercial UI is absent or deferred.

Support must not tell a user that:

- saving a workout, generating a draft, or using a template means they are eligible for a purchase,
- a CTA was shown unless an explicit future `upsell_presented` event or UI evidence exists,
- an accepted CTA means checkout completed,
- checkout completion means entitlement or finance reconciliation is complete,
- analytics counts prove individual behavior.

Future visible CTA work must update Help/Guide and relevant runbooks in the same PR, or include a
specific `N/A` rationale when no support interpretation changes.

## Forward Compatibility

Future additions inherit this policy automatically only when they fit an existing placement
category and use already-approved low-cardinality, privacy-safe signals.

Explicit owner mapping is required for:

- new product IDs or purchase models,
- new CTA placements,
- new `upsell_*` event meanings,
- checkout attribution,
- entitlement-aware targeting,
- finance reporting,
- raw drilldown or CSV export,
- third-party analytics/vendor forwarding,
- localized commercial copy with different claims,
- public landing or SEO/AI-discoverable content.

Unknown or deprecated values fail closed for CTA presentation and may only appear as safe aggregate
diagnostics after a later child maps them.

## Future Child Checklist

Before runtime workout-context CTA work starts, the child must prove:

- the selected placement is `eligible` or explicitly satisfies all `conditional` requirements,
- the primary workout action remains more prominent than the CTA,
- no CTA appears in active editing, intake, loading, validation, error, auth, entitlement, checkout,
  recovery, or finance contexts,
- placement/product identity is stable,
- unknown/disabled/unmapped values fail closed,
- analytics payloads exclude forbidden values,
- checkout, entitlement, and finance truth stay separate,
- screenshot handoff is approved before pre-PR verification,
- Help/Guide and route/label/support sweep evidence are complete.
