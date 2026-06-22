# API Contracts

## `POST /api/contact`

### Request

- Headers:
  - `Content-Type: application/json`
  - `Origin` should match allowed origins
- Body:

```json
{
  "variant": "contact",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "I want help with breathing and balance.",
  "company": "",
  "startedAt": 1730000000000
}
```

- Supported `variant` values:
  - `contact`
  - `analysis`
  - `goals_coaching`
  - `preview_access_notify`
- `preview_access_notify` may send an empty `message` when the visitor only wants notification.

### Response

- Success:

```json
{
  "ok": true
}
```

- Failure:

```json
{
  "ok": false,
  "error": "Please enter a valid email."
}
```

### Status Codes

- `200`: accepted/sent (including anti-spam silent accept)
- `400`: invalid JSON or validation failure
- `403`: invalid origin
- `415`: unsupported content type
- `429`: rate limited
- `500`: email delivery failure

### Rate-Limit Headers

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
- `Retry-After` (on `429`)

## `POST /api/download/resend`

### Request

- Headers:
  - `Content-Type: application/json`
- Body:

```json
{
  "email": "buyer@example.com",
  "nextPath": "/my-library",
  "source": "checkout_success"
}
```

- Allowed `source` values:
  - `checkout_success`
  - `library_recovery`
  - `claim_entry`
  - unknown values normalize to `unknown`

### Response

- Success (non-enumerating):

```json
{
  "ok": true,
  "message": "If this email exists, we sent a secure access link."
}
```

- Failure:

```json
{
  "ok": false,
  "error": "Too many requests. Please try again shortly."
}
```

### Status Codes

- `200`: accepted (`ok: true` with non-enumerating message)
- `400`: invalid JSON or invalid email input
- `415`: unsupported content type
- `429`: rate limited

### Rate-Limit Headers

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
- `Retry-After` (on `429`)

## `POST /api/checkout/session`

### Request

- Headers:
  - `Content-Type: application/json`
- Body:

```json
{
  "productId": "guide_poolside",
  "cancelPath": "/plans",
  "source": "plans",
  "placementId": "workout_saved_post_success"
}
```

- `productId` must be a catalog product ID. The route uses server catalog/price config and never
  trusts browser-provided Stripe price IDs.
- Allowed checkout-start attribution `source` values:
  - `plans`
  - `library_explore`
  - `workout_context`
  - unknown, missing, malformed, or future values normalize to `unknown`.
- `placementId` is optional and counted only for explicitly mapped source/placement pairs. Current
  workout-context placement support is limited to `workout_saved_post_success`.
- The current `/plans` workout-context attribution bridge may send `source=workout_context` and
  `placementId=workout_saved_post_success` only when the incoming plans query and the clicked
  checkout button both map to `productId=guide_poolside`. Other products, missing values,
  malformed values, or future shop/source/placement values fall back to generic `plans` or
  `unknown` attribution and must not count as mapped workout-context checkout starts.
- Plans-surface client telemetry stays separate from server checkout-start attribution: a plans
  checkout button may still emit client `upsell_accepted` with `source=plans` while its
  `/api/checkout/session` request carries the approved workout-context checkout attribution.
- Checkout-cancel client telemetry remains current-surface telemetry for generic `/plans` and My
  Library returns. The mapped workout-context `/plans` return may carry `source=workout_context`,
  `placementId=workout_saved_post_success`, `productId=guide_poolside`,
  `surface=plans_checkout_return`, and `reason=checkout_cancelled` only for the approved
  historical or externally linked saved-workout CTA -> Poolside guide checkout path. Checkout cancel
  is not payment failure, provider failure, entitlement failure, non-buyer proof, or finance truth.
- `cancelPath` must be a local path. Absolute URLs and protocol-relative URLs fall back to the
  server default.

### Response

- Success:

```json
{
  "ok": true,
  "url": "https://checkout.stripe.com/c/pay/..."
}
```

- Failure:

```json
{
  "ok": false,
  "error": "Could not create checkout session."
}
```

### Status Codes

- `200`: Stripe Checkout Session created and a redirect URL is available
- `400`: invalid JSON or unknown product
- `409`: product is inactive/unavailable
- `415`: unsupported content type
- `500`: product config, product availability, Stripe provider, or missing redirect URL failure

### Analytics And Privacy Boundary

- Emits `checkout_started` only after the server creates a Checkout Session with a redirect URL.
- `checkout_started` means checkout handoff/session creation only. It is not payment success,
  entitlement, Stripe reconciliation, revenue, refund, payout, invoice, accounting export, or
  finance truth.
- Mapped workout-context checkout-start attribution may carry into Stripe Checkout Session metadata,
  invoice metadata, webhook `checkout_completed`, and `entitlement_granted` payloads only when
  `source=workout_context`, `placementId=workout_saved_post_success`, and
  `productId=guide_poolside` match the server-resolved catalog product. Generic, unknown, missing,
  malformed, future, or mismatched values stay generic.
- The propagated completion/entitlement fields are backend telemetry/support context only. They do
  not create a dedicated Admin Analytics module and are not payment success, app access guarantee,
  Stripe reconciliation, revenue, refund, payout, invoice, accounting export, or finance truth.
  The durable completion/entitlement contract is
  `docs/architecture/workout-context-checkout-completion-entitlement-attribution-contract.md`.
- The persisted analytics payload contains only low-cardinality attribution such as `productId`,
  normalized `source`, and approved `placementId`.
- The response and analytics payload must not expose Checkout Session ID, Stripe customer ID,
  payment ID, invoice ID, email, user ID, raw URL/referrer, IP, User-Agent, payment details, or raw
  provider responses.

## `GET /api/user/export`

### Request

- Auth: signed-in user session required
- no body

### Response

- Success:

```json
{
  "ok": true,
  "export": {
    "generatedAt": "2026-02-17T14:00:00.000Z",
    "schemaVersion": "2026-06-22-provider-evidence-export",
    "user": {
      "id": "user-id",
      "email": "swimmer@example.com"
    },
    "profile": {
      "id": "user-id",
      "email": "swimmer@example.com",
      "createdAt": "2026-02-10T10:00:00.000Z",
      "updatedAt": "2026-02-17T10:00:00.000Z"
    },
    "athleteProfile": {
      "id": "athlete-profile-id",
      "displayName": "Stian",
      "firstName": "Stian",
      "lastName": "Vikra",
      "ageBand": "35_44",
      "createdAt": "2026-03-19T10:00:00.000Z",
      "updatedAt": "2026-03-19T10:05:00.000Z"
    },
    "entitlements": [],
    "courseProgress": [],
    "guideProgress": [],
    "guideSessionProgress": [],
    "goals": [],
    "downloadLinks": [],
    "drylandSessions": [
      {
        "id": "dryland-session-id",
        "sourceKind": "manual",
        "status": "draft",
        "sessionKind": "strength",
        "title": "Core strength",
        "description": "Short dryland session.",
        "legacyFocusText": "Brace the trunk first.",
        "exercises": [],
        "startedAt": null,
        "completedAt": null,
        "actualDurationSeconds": null,
        "createdAt": "2026-05-08T08:00:00.000Z",
        "updatedAt": "2026-05-08T08:10:00.000Z"
      }
    ],
    "workouts": [],
    "providerConnections": [],
    "providerActivityEvidence": [],
    "providerImportRuns": []
  }
}
```

- `drylandSessions[].legacyFocusText` is read-only legacy export data. Dryland authoring no longer exposes or writes Focus cue, but authenticated exports preserve historical values when present.
- `providerConnections`, `providerActivityEvidence`, and `providerImportRuns` contain private provider evidence summaries only. They never include OAuth tokens, provider secrets, raw provider payloads, raw FIT/GPX/TCX files, cookies, IP addresses, User-Agent strings, or full provider response bodies.
- Provider activity evidence is received evidence only. It is not Calendar completion truth, Stats Swimming truth, Perfect Day truth, analytics KPI truth, or automated replanning truth until a later reconciliation slice explicitly maps it.

- Failure:

```json
{
  "ok": false,
  "error": "Unauthorized."
}
```

### Status Codes

- `200`: export payload returned
- `401`: unauthorized
- `500`: failed to build export payload

## `POST /api/my-library/provider-evidence/fixture-import`

### Request

- Auth: signed-in user session required
- Config: `PROVIDER_EVIDENCE_FIXTURE_IMPORT_ENABLED=1`
- Headers:
  - `Content-Type: application/json`
- Body:

```json
{
  "providerKey": "manual_fixture",
  "activities": [
    {
      "providerActivityId": "fixture-activity-1",
      "title": "Morning fixture swim",
      "activityStartedAt": "2026-06-22T06:30:00.000Z",
      "activityType": "lap_swimming",
      "sportType": "swimming",
      "subSportType": "pool_swimming",
      "durationSeconds": 1800,
      "distanceM": 1200,
      "poolLengthM": 25,
      "poolLengthUnit": "m",
      "fileState": "available_from_provider",
      "availableFileKinds": ["fit"]
    }
  ]
}
```

- Only `manual_fixture` is accepted.
- The route ignores caller-supplied `user_id` or `userId` and writes rows for the authenticated
  user only.
- `activities` is bounded to 1-10 rows.
- Unknown provider/status/file/sport values fail closed to deterministic `400` errors or warning
  counts; unsupported fixture activity rows may be stored only as `unsupported_activity`.
- Stored summaries are redacted fixture summaries only. The route must not store, log, return, or
  export OAuth tokens, provider secrets, raw provider payloads, cookies, IP addresses, User-Agent
  strings, raw FIT/GPX/TCX files, or raw response bodies.

### Response

- Success:

```json
{
  "ok": true,
  "status": "completed_with_warnings",
  "providerKey": "manual_fixture",
  "providerConnectionId": "provider-connection-id",
  "importRunId": "provider-import-run-id",
  "evidenceIds": ["provider-activity-evidence-id"],
  "counts": {
    "totalActivityCount": 2,
    "importedCount": 1,
    "duplicateCount": 1,
    "malformedCount": 0,
    "unsupportedCount": 0
  },
  "warnings": ["duplicate_provider_activity_id"]
}
```

- Failure:

```json
{
  "ok": false,
  "code": "fixture_import_disabled",
  "error": "Provider evidence fixture import is disabled."
}
```

### Status Codes

- `200`: fixture import run recorded
- `400`: invalid payload, unsupported provider, empty/oversized activities, or wholly invalid
  request
- `401`: unauthenticated
- `403`: fixture import disabled
- `415`: unsupported content type
- `503`: provider evidence schema not ready
- `500`: unexpected provider evidence write failure

### Completion Boundary

- The route writes only `provider_connections`, `provider_import_runs`, and
  `provider_activity_evidence`.
- It never writes `completed_activity_events`, planned rows, Calendar, Review Actual, Stats,
  streaks, Perfect Day, analytics KPIs, Garmin state, OAuth tokens, webhooks, or raw provider files.

## `POST /api/user/delete`

### Request

- Auth: signed-in user session required
- Headers:
  - `Content-Type: application/json`
- Body:

```json
{
  "confirm": "DELETE"
}
```

### Response

- Success:

```json
{
  "ok": true,
  "message": "Your account and app data have been deleted."
}
```

- Failure:

```json
{
  "ok": false,
  "error": "Confirmation required. Send confirm=\"DELETE\"."
}
```

### Status Codes

- `200`: account delete completed
- `400`: invalid JSON or missing/invalid confirmation value
- `401`: unauthorized
- `415`: unsupported content type
- `500`: failed to delete user data

### Provider Evidence Deletion Boundary

- Provider evidence foundation rows are user-owned and reference `auth.users(id)` with `on delete cascade`.
- Account deletion removes provider connections, provider activity evidence summaries, and provider import-run diagnostics with the user account.
- V1 stores no raw provider files and no OAuth tokens, so there is no provider file bucket or token vault deletion path in this contract.

## `POST /api/analytics/event`

### Request

- Headers:
  - `Content-Type: application/json`
- Auth: optional (event is accepted for signed-in and signed-out users).
- Public client events stay public aggregate: route-template/product events such as
  `public_page_viewed`, `plans_viewed`, and `product_viewed` are recorded without attaching the
  signed-in `user_id`, even when an auth cookie exists.
- `eventName` must match the allowed analytics event contract list (see `ANALYTICS_EVENT_NAMES`
  in `lib/analytics/events.ts`). Workout-builder funnel V1 adds
  `workout_builder_started`, `workout_builder_template_selected`, and `workout_builder_saved` as
  signed-in product events.
- Payload is sanitized. Free text, raw URLs/referrers, raw User-Agent, raw IP, email, payment,
  shipping, cart notes, and nested objects are stripped or redacted.
- Workout-builder funnel payloads may include only low-cardinality workflow dimensions such as
  `source`, `surface`, `builderMode`, `builderEntry`, `templateKey`, `templateSource`,
  `sourceKind`, `saveKind`, `environment`, `sessionType`, `sizeMode`, `stepCount`,
  `totalDistanceM`, and `estimatedDurationMin`. They must not include template title, workout
  title, notes, raw route URL, email, IP, user agent, payment/cart data, or raw workout text. V1
  intentionally does not copy the private workout row ID into analytics payloads.
- Accepted events are persisted best-effort to `analytics_events` after sanitization. Persistence
  failures log server diagnostics but must not block the client event response.
- Body:

```json
{
  "eventName": "plans_viewed",
  "payload": {
    "source": "plans",
    "routeTemplate": "/plans",
    "routeCategory": "pricing",
    "routeStatus": "active",
    "routeCountable": true,
    "productCount": 3,
    "availableCount": 3,
    "activeCount": 3,
    "productIds": "guide_0_1000m,guide_poolside,analysis_video",
    "productTypes": "course_addon,analysis",
    "availableProductIds": "guide_0_1000m,guide_poolside,analysis_video",
    "unavailableProductIds": null
  }
}
```

### Response

- Success:

```json
{
  "ok": true
}
```

- Failure:

```json
{
  "ok": false,
  "error": "Invalid event name."
}
```

### Status Codes

- `200`: event accepted
- `400`: invalid JSON or invalid event name
- `415`: unsupported content type

## `GET /api/admin/analytics/insights`

### Request

- Auth: admin viewer, editor, or admin session required.
- Query:
  - `rangeDays`: optional integer. Defaults to `30`; max is `90`.
- Data source:
  - metric counts come from bounded sanitized `analytics_events` rows,
  - lifecycle readiness metadata comes from `analytics_event_daily_rollups` when the rollup
    migration is applied.
- Cache: `no-store`.
- Admin UI: the read-only Analytics tab in `/admin?tab=analytics` renders this response. The
  `/admin/analytics` route is an alias into the same admin workspace tab.
- Caveat: checkout and entitlement counts are product/revenue-proxy signals only. They are not
  Stripe reconciliation, accounting, refunds, payouts, invoices, or revenue recognition.
  The durable separation contract is
  `docs/architecture/workout-checkout-attribution-finance-separation-contract.md`. The
  workout-context completion/entitlement attribution contract is
  `docs/architecture/workout-context-checkout-completion-entitlement-attribution-contract.md`.
- Existing upsell caveat: `existingUpsellBaseline` is current-surface commercial telemetry derived
  from `upsell_presented`, `upsell_accepted`, and `upsell_declined`. `upsell_presented` is surface
  visibility, not checkout start. `upsell_accepted` is clicked intent, not checkout completion.
  `upsell_declined` is the current checkout-cancel return signal, not all users who ignored,
  dismissed, or failed to convert. The current-surface totals count only approved existing sources
  such as `plans` and `library_explore`; unknown sources remain separate, and workout-context CTA
  rows are counted only in the dedicated `workoutContextCta` aggregate when explicitly mapped.
  Workout-context checkout-cancel is mapped only for the approved saved-workout Poolside checkout
  return with `source=workout_context`, `placementId=workout_saved_post_success`,
  `productId=guide_poolside`, `surface=plans_checkout_return`, and
  `reason=checkout_cancelled`; the dedicated Admin Analytics checkout-cancel module counts only
  that exact return and bounded review-needed buckets. The Poolside guide stage summary may use
  this mapped cancel count with `cancelled / shown` as its denominator. Explicit dismiss remains
  unmapped until a future child defines it under
  `docs/architecture/workout-context-checkout-cancel-decline-measurement-contract.md`. The current
  workout save success surface no longer renders the saved-workout Poolside guide prompt, so it
  does not emit new prompt shown/clicked/declined events from that surface.
- Course lesson KPI caveat: `courseLessonKpi` is public aggregate product telemetry derived only
  from mapped Course lesson events: `course_lesson_viewed`, `course_lesson_completed`,
  `course_lesson_continued`, and `course_lesson_support_clicked` for route template `/course`,
  source `course`, or surface `course_lesson`. Lesson/module/action identifiers must be safe
  dimension values before they enter dedicated totals. Unknown, malformed, deprecated, or unmapped
  lesson/module/action values stay out of rates and are exposed only as a bounded
  `unknownEvents` count. `completed` means the learner used the pass-criteria marked-done action,
  not proven technique mastery. `supportInterest` is a post-value click signal only, not checkout,
  entitlement, access, revenue, Stripe reconciliation, finance reporting, or a unique person.
- Workout builder caveat: `workoutBuilderFunnel` is product telemetry derived from
  `workout_builder_started` and `workout_builder_saved`. Save rate is saved/start count for the
  selected range, not unique-user conversion, checkout performance, Stripe reconciliation, export,
  or finance reporting.
- Workout builder source caveat: `workoutBuilderSourceBreakdown` is product telemetry derived from
  `workout_builder_started`, `session_draft_generated`, and `workout_builder_saved` safe
  `sourceKind` values. Manual/generated source rates are not unique-user conversion, checkout
  conversion, export success, revenue attribution, entitlement truth, Stripe reconciliation, or
  finance reporting. Missing, malformed, deprecated, or unmapped save sources must be counted as
  unknown/unmapped and excluded from manual/generated source-specific rates until explicitly mapped.
- Workout builder generated-completion caveat:
  `workoutBuilderTemplateGeneratedCompletion` is product telemetry derived from
  `session_draft_generated` and `workout_builder_saved` with `sourceKind = ai_session_v1`.
  Template usage is counted only from `workout_builder_template_selected`; the dashboard must not
  infer template usage from session type, generator block toggles, draft creation, saved source
  kind, visible labels, or adjacent activity. The identity/selection precondition is defined in
  `docs/architecture/workout-builder-template-identity-selection-contract.md`.
- Workout builder template usage caveat: `workoutBuilderTemplateUsage` is product telemetry derived
  only from explicit `workout_builder_template_selected` rows with safe `templateKey` and
  `templateSource` payload values. Known template labels come from the workout-template registry,
  not raw analytics payload labels. Missing, malformed, deprecated, unknown, or unmapped keys and
  sources remain separate from known templates until explicitly mapped.
- Workout-context CTA caveat: `workoutContextCta` is product telemetry derived only from mapped
  `upsell_presented` and `upsell_accepted` rows with `source=workout_context`,
  `placementId=workout_saved_post_success`, and `productId=guide_poolside`. Presented means the
  historical mapped saved-workout CTA rendered; accepted means clicked intent. The current workout
  save success surface no longer renders that prompt. Unknown or unmapped workout-context rows stay
  out of KPI counts. These values are not checkout conversion, entitlement truth, Stripe
  reconciliation, revenue attribution, finance reporting, or unique-user conversion.
- Checkout-start attribution caveat: historical or externally linked mapped saved-workout CTA paths
  may preserve
  `source=workout_context`, `placementId=workout_saved_post_success`, and
  `productId=guide_poolside` through `/plans` into `checkout_started`. This remains checkout
  handoff/session creation only, not CTA conversion, checkout completion, entitlement, Stripe
  reconciliation, revenue attribution, finance reporting, or unique-user conversion. Future shop
  products, placements, routes, or checkout sources require explicit mapping before they enter
  dedicated workout-context checkout KPIs.
- Workout-context checkout-start dashboard caveat: `workoutContextCheckoutStarted` is derived only
  from mapped `checkout_started` rows with `source=workout_context`,
  `placementId=workout_saved_post_success`, and `productId=guide_poolside`. It is separate from
  `workoutContextCta` shown/clicked intent and from the generic funnel `checkoutStarted` count.
  Unknown or unmapped checkout-start rows stay out of the dedicated count and may appear only as a
  bounded review-needed aggregate. These values are not purchase, access, revenue, accounting,
  Stripe reconciliation, finance reporting, or unique-user conversion.
- Workout-context commercial stage-summary caveat: the Admin Analytics UI may derive a read-only
  stage summary from existing mapped `workoutContextCta`, `workoutContextCheckoutStarted`, and
  `workoutContextCheckoutOutcome` aggregate fields plus the existing mapped
  `workoutContextCheckoutCancel.cancelled` count. The summary lines up shown, clicked, checkout
  handoff, checkout cancelled, completed checkout, and access granted for the approved
  saved-workout Poolside guide path. Cancel rate is `cancelled / shown` for the mapped
  return-from-checkout signal only; if shown is zero the rate is not counted. Stage rates are
  selected-range event-count ratios only, not unique-user conversion, deduped sessions, revenue,
  provider failure, entitlement failure, Stripe reconciliation, accounting, or finance reporting.
  Unknown or unmapped future products, placements, sources, surfaces, reasons, or checkout paths
  require explicit mapping before entering this dedicated summary.
- Workout-context checkout-cancel dashboard caveat: `workoutContextCheckoutCancel` is derived only
  from mapped `upsell_declined` rows with `source=workout_context`,
  `placementId=workout_saved_post_success`, `productId=guide_poolside`,
  `surface=plans_checkout_return`, and `reason=checkout_cancelled`. Checkout cancel means the
  approved return-from-checkout path only. Unknown or unmapped cancel-like rows stay out of the
  dedicated count and may appear only as bounded review-needed diagnostics. These values are not
  ignored CTA, failed payment, provider failure, entitlement failure, revenue, refund, payout,
  invoice, accounting export, Stripe reconciliation, finance reporting, or unique-user conversion.
- Workout-context checkout completion and entitlement dashboard caveat:
  `workoutContextCheckoutOutcome` is derived only from mapped `checkout_completed` and
  `entitlement_granted` rows with `source=workout_context`,
  `placementId=workout_saved_post_success`, and `productId=guide_poolside`. Completion means a
  supported Stripe checkout completion event was accepted by the webhook. Entitlement grant means
  the app recognized access after fulfillment. Unknown or unmapped completion/access rows stay out
  of the dedicated count and may appear only as bounded review-needed diagnostics. Diagnostic keys
  are limited to safe buckets such as `source_not_mapped`, `placement_not_mapped`,
  `product_not_mapped`, `incomplete_attribution`, and `other_review_needed`; raw source, placement,
  product, payload, provider, or user values must not be returned. `completionWithoutAccess` and
  `accessWithoutCompletion` are selected-range support signals only, not user/session joins,
  provider failure, entitlement failure, revenue, refunds, payouts, invoices, accounting, Stripe
  reconciliation, finance reporting, or unique-user conversion.
- Privacy boundary: public aggregate events are not linked to user profiles and the dashboard must
  not display raw payload JSON, raw URLs, emails, IPs, user agents, visitor IDs, notes, cart details,
  shipping, or payment data.

### Response

```json
{
  "ok": true,
  "schemaReady": true,
  "generatedAt": "2026-06-09T18:30:00.000Z",
  "rangeDays": 30,
  "rowCap": 5000,
  "capped": false,
  "totalEvents": 12,
  "lastEventAt": "2026-06-09T18:20:00.000Z",
  "uniqueKnownUsers": 2,
  "publicAggregateEvents": 6,
  "clientEvents": 7,
  "serverEvents": 5,
  "eventCounts": [{ "key": "plans_viewed", "count": 4 }],
  "routeCounts": [{ "key": "/plans", "category": "pricing", "count": 4 }],
  "productCounts": [{ "key": "guide_poolside", "productType": "course_addon", "count": 3 }],
  "lifecycle": {
    "rawRetentionDays": 180,
    "rollupWindowDays": 400,
    "rawPruneBefore": "2025-12-11T18:30:00.000Z",
    "rollup": {
      "status": "ready",
      "schemaReady": true,
      "queryOk": true,
      "latestDay": "2026-06-09",
      "oldestDay": "2026-06-01",
      "latestRefreshAt": "2026-06-09T18:25:00.000Z",
      "daysWithRollups": 9,
      "totalRolledUpEvents": 120,
      "staleAfterDays": 2,
      "message": "Analytics daily rollups are ready for the reported window."
    }
  },
  "funnel": {
    "publicPageViewed": 4,
    "plansViewed": 4,
    "productViewed": 1,
    "checkoutStarted": 2,
    "checkoutCompleted": 1,
    "entitlementGranted": 1,
    "checkoutCompletionRate": 0.5,
    "entitlementGrantRate": 1
  },
  "existingUpsellBaseline": {
    "presented": 4,
    "accepted": 2,
    "declined": 1,
    "acceptedRate": 0.5,
    "declineRate": 0.25,
    "unknownSourceEvents": 1,
    "sourceCounts": [
      {
        "key": "plans",
        "presented": 3,
        "accepted": 1,
        "declined": 1,
        "total": 5,
        "acceptedRate": 0.333,
        "declineRate": 0.333
      },
      {
        "key": "library_explore",
        "presented": 1,
        "accepted": 1,
        "declined": 0,
        "total": 2,
        "acceptedRate": 1,
        "declineRate": 0
      },
      {
        "key": "unknown",
        "presented": 0,
        "accepted": 1,
        "declined": 0,
        "total": 1,
        "acceptedRate": null,
        "declineRate": null
      }
    ]
  },
  "courseLessonKpi": {
    "viewed": 4,
    "completed": 2,
    "continued": 1,
    "supportInterest": 1,
    "completionRate": 0.5,
    "continuationRate": 0.25,
    "supportInterestRate": 0.25,
    "unknownEvents": 1,
    "lessonCounts": [
      {
        "key": "body-position-front",
        "moduleId": "body-position",
        "viewed": 3,
        "completed": 2,
        "continued": 1,
        "supportInterest": 1,
        "total": 7,
        "completionRate": 0.667
      }
    ]
  },
  "workoutContextCta": {
    "placementId": "workout_saved_post_success",
    "productId": "guide_poolside",
    "source": "workout_context",
    "presented": 4,
    "accepted": 2,
    "acceptedRate": 0.5,
    "unknownEvents": 1
  },
  "workoutContextCheckoutStarted": {
    "placementId": "workout_saved_post_success",
    "productId": "guide_poolside",
    "source": "workout_context",
    "started": 2,
    "unknownEvents": 1
  },
  "workoutContextCheckoutOutcome": {
    "placementId": "workout_saved_post_success",
    "productId": "guide_poolside",
    "source": "workout_context",
    "completed": 1,
    "entitlementGranted": 1,
    "entitlementGrantRate": 1,
    "unknownEvents": 1,
    "completionWithoutAccess": 0,
    "accessWithoutCompletion": 0,
    "reviewDiagnostics": [
      { "key": "source_not_mapped", "count": 0 },
      { "key": "placement_not_mapped", "count": 0 },
      { "key": "product_not_mapped", "count": 1 },
      { "key": "incomplete_attribution", "count": 0 },
      { "key": "other_review_needed", "count": 0 }
    ]
  },
  "workoutContextCheckoutCancel": {
    "placementId": "workout_saved_post_success",
    "productId": "guide_poolside",
    "source": "workout_context",
    "surface": "plans_checkout_return",
    "reason": "checkout_cancelled",
    "cancelled": 1,
    "unknownEvents": 1,
    "reviewDiagnostics": [
      { "key": "source_not_mapped", "count": 0 },
      { "key": "placement_not_mapped", "count": 0 },
      { "key": "product_not_mapped", "count": 0 },
      { "key": "surface_not_mapped", "count": 1 },
      { "key": "reason_not_mapped", "count": 0 },
      { "key": "incomplete_attribution", "count": 0 },
      { "key": "other_review_needed", "count": 0 }
    ]
  },
  "workoutBuilderFunnel": {
    "started": 5,
    "saved": 3,
    "saveRate": 0.6
  },
  "workoutBuilderSourceBreakdown": {
    "manualStarts": 5,
    "generatedDrafts": 4,
    "manualSaves": 2,
    "generatedSaves": 1,
    "unknownSaves": 0,
    "manualSaveRate": 0.4,
    "generatedSaveRate": 0.25
  },
  "workoutBuilderTemplateGeneratedCompletion": {
    "generatedDrafts": 4,
    "generatedSaves": 1,
    "generatedCompletionRate": 0.25,
    "templateUsageCount": 3,
    "templateUsageStatus": "mapped"
  },
  "workoutBuilderTemplateUsage": {
    "templateSelections": 3,
    "knownTemplateSelections": 2,
    "unknownTemplateSelections": 1,
    "templatesSelected": 2,
    "templateCounts": [
      {
        "key": "pool_endurance_base_1000",
        "label": "Aerobic base 1000",
        "status": "active",
        "count": 2
      },
      {
        "key": "pool_technique_reset_900",
        "label": "Technique reset 900",
        "status": "active",
        "count": 1
      }
    ]
  }
}
```

When the raw analytics migration is not applied yet, the route returns `200` with `schemaReady:
false` and setup guidance instead of throwing. When the rollup migration is not applied yet, the
route keeps returning raw bounded insights and sets `lifecycle.rollup.status` to `schema-missing`.
Unexpected rollup status query failures are fail-soft and surface as
`lifecycle.rollup.status = "query-failed"` without raw payload or SQL details.

Lifecycle caveat: `rawRetentionDays` is the target raw-event retention window and
`rawPruneBefore` is the computed cutoff. No automatic deletion job ships in V1. Raw pruning must
only be run through the service-role `prune_analytics_events` function after the relevant UTC days
have daily rollup coverage. Unauthenticated or non-admin callers receive `401`/`403`.

### Status Codes

- `200`: insights loaded or schema setup guidance returned
- `401`: unauthenticated
- `403`: forbidden
- `500`: analytics insights could not be loaded

## `GET /api/admin/users/overview`

### Request

- Auth: admin viewer, editor, or admin session required.
- Query:
  - `q`: optional email, display-name, or Auth ID search string; trimmed and bounded to 80
    characters.
  - `role`: optional `admin`, `editor`, `viewer`, or `all`; defaults to `all`.
  - `sort`: optional `updated_desc`, `created_desc`, or `email_asc`; defaults to `updated_desc`.
  - `page`: optional positive integer; defaults to `1`.
  - `pageSize`: optional positive integer; max is `50`, default is `25`.
- Data source:
  - Supabase Auth Admin API provides canonical user IDs, email/auth status, created timestamp, and
    last sign-in metadata.
  - `profiles` provides role/profile mirror state and may be missing for a visible Auth user.
  - `athlete_profiles` may provide display-name support identity only.
  - `entitlements` and `products` provide minimized product/access summaries.
  - `analytics_events` may provide only non-public `user_id` + `occurred_at` timestamps for the
    listed users.
- Cache: `no-store`.
- Admin UI: the `Users` tab in `/admin?tab=users` renders this response.
- Privacy boundary: the response must not expose private habit/training/note/workout content, raw
  analytics payloads, IPs, User-Agent strings, payment provider IDs, invoices, refunds, payouts, or
  anonymous public aggregate activity joined to profiles.
- Commerce caveat: product/access summaries are support signals only. They are not Stripe
  reconciliation, revenue recognition, invoices, refunds, payouts, or finance reporting.

### Response

```json
{
  "ok": true,
  "generatedAt": "2026-06-15T12:00:00.000Z",
  "query": {
    "search": "",
    "role": "all",
    "sort": "updated_desc",
    "page": 1,
    "pageSize": 25
  },
  "summary": {
    "totalUsers": 1,
    "visibleUsers": 1,
    "usersWithAccess": 1,
    "usersWithoutAccess": 0,
    "adminUsers": 0,
    "editorUsers": 0,
    "viewerUsers": 1,
    "unknownRoleUsers": 0,
    "missingProfileUsers": 0,
    "unconfirmedUsers": 0,
    "testerUsers": 0,
    "partialSummary": false
  },
  "pageInfo": {
    "page": 1,
    "pageSize": 25,
    "totalCount": 1,
    "hasPreviousPage": false,
    "hasNextPage": false
  },
  "items": [
    {
      "id": "user-id",
      "email": "swimmer@example.com",
      "displayName": "Fast Freestyler",
      "displayNameSource": "athlete_profile",
      "role": "viewer",
      "roleSource": "profile",
      "profileStatus": "complete",
      "authStatus": "confirmed",
      "testerStatus": "not_configured",
      "createdAt": "2026-06-01T08:00:00.000Z",
      "updatedAt": "2026-06-10T08:00:00.000Z",
      "profileUpdatedAt": "2026-06-10T08:00:00.000Z",
      "emailConfirmedAt": "2026-06-01T08:05:00.000Z",
      "lastSignInAt": "2026-06-12T09:30:00.000Z",
      "accessStatus": "active",
      "entitlementCount": 1,
      "products": [
        {
          "id": "guide_poolside",
          "title": "Poolside Guide",
          "kind": "guide",
          "active": true,
          "known": true
        }
      ],
      "latestGrantedAt": "2026-06-11T09:00:00.000Z",
      "lastActivityAt": "2026-06-12T10:00:00.000Z",
      "lastActivitySource": "product_activity",
      "supportCodes": []
    }
  ],
  "warnings": []
}
```

If the overview can load Auth users but cannot load optional profile/athlete-profile/entitlement/
product/activity summaries, the route returns `200` with safe `warnings`,
`summary.partialSummary = true`, and bounded support codes. Auth users without profile rows remain
visible with `profileStatus = "missing_profile"` and `supportCodes` including `missing_profile`.
Allowlisted admins include `supportCodes` with `allowlist_override` so support can distinguish an
environment allowlist role from a profile-backed role.

### Status Codes

- `200`: overview loaded, partial overview loaded, or schema setup guidance returned
- `401`: unauthenticated
- `403`: forbidden
- `500`: overview could not be loaded because required server configuration or an unexpected read
  failed

## `PATCH /api/admin/users/{userId}/role`

### Request

- Auth: admin role required.
- Path:
  - `userId`: Supabase Auth user ID.
- Body:

```json
{
  "role": "editor",
  "expectedRole": "viewer",
  "reason": "owner_request"
}
```

- `role`: required `admin`, `editor`, or `viewer`.
- `expectedRole`: required current role from the loaded panel, or `unknown`/`null` for repair flow.
- `reason`: required `support_access`, `operator_change`, `owner_request`, or `repair`.
- Behavior:
  - verifies the target Auth user server-side;
  - checks expected current role before mutation;
  - writes through service-role-only `admin_set_user_role`, which updates `profiles` and inserts
    `admin_audit_logs` in one transaction;
  - blocks last-admin demotion through the database function;
  - returns no private user content or raw provider data.
- Cache: `no-store`.

### Response

```json
{
  "ok": true,
  "userId": "user-id",
  "role": "editor",
  "auditLogged": true
}
```

### Status Codes

- `200`: role updated and audit logged
- `400`: invalid JSON, invalid user ID, or invalid role payload
- `401`: unauthenticated
- `403`: forbidden / not admin
- `404`: target Auth user not found
- `409`: expected-role conflict, no email for profile-backed role, or last-admin guard
- `415`: unsupported content type
- `500`: service-role/RPC/audit/update failure
- `503`: users schema not live in the environment

## `POST /api/my-library/calendar/planned-instances/[instanceId]/completion`

### Request

- Auth: signed-in My Library user.
- Headers:
  - `Content-Type: application/json`
- Body:

```json
{
  "expectedUpdatedAt": "2026-06-20T09:10:00.000Z"
}
```

### Response

```json
{
  "ok": true,
  "status": "completed",
  "event": {
    "id": "44444444-4444-4444-8444-444444444444",
    "plannedWorkoutInstanceId": "11111111-1111-4111-8111-111111111111",
    "workoutId": "33333333-3333-4333-8333-333333333333",
    "programId": "22222222-2222-4222-8222-222222222222",
    "outcome": "completed_as_planned",
    "sourceKind": "manual",
    "completedOn": "2026-06-22",
    "actualStartedAt": null,
    "actualDurationSeconds": 2280,
    "actualDistanceM": 1800,
    "actualEnvironment": "pool",
    "actualPoolLengthM": 25,
    "actualPoolLengthUnit": "m",
    "actualSessionDraft": null,
    "correctionNote": null,
    "createdAt": "2026-06-22T17:30:00.000Z",
    "updatedAt": "2026-06-22T17:30:00.000Z"
  }
}
```

- `status`: `completed` for a new event, or `already_completed` when the same owner/planned instance already has a manual completion event.
- Manual completion writes one owner-scoped `completed_activity_events` row and does not mutate `planned_workout_instances`, `workouts`, or `programs`.
- The stored `planned_snapshot.workout` includes read-only planned workout summary, `previewSections`, and the source workout draft when it can be summarized, so Review Actual can show the planned step/repeat structure without mutating the source workout.
- The manual event may also store `actual_session_snapshot`, initialized from the planned/source workout. This is the corrected performed-session truth and is separate from the planned snapshot.
- `completed_activity_events.source_kind = manual` is the only source kind in this contract. Garmin send/import/reconciliation must not write through this route.
- Legacy `outcome = completed` rows are read as `completed_as_planned`. New writes use the expanded outcome contract.
- Unknown future completion source/outcome values fail closed to review and must not count as completed until explicitly mapped.

### Status Codes

- `200`: completed or already completed
- `400`: invalid JSON or missing `expectedUpdatedAt`
- `401`: unauthenticated
- `404`: planned instance not found for this owner
- `409`: stale `updated_at`, skipped/cancelled/review status, missing workout/program reference, or unmapped existing completion state
- `500`: bounded load/write failure
- `503`: planned-instance, workout/program, or completed-activity schema still syncing

## Private route `/my-library/calendar/actuals/[instanceId]`

### Contract

- Auth: signed-in My Library user.
- Loads one owner-scoped planned workout instance and its linked manual `completed_activity_events` row.
- Preserves Calendar return context through `date` and `programId` query params.
- Shows planned truth and actual truth side by side, with source badge, actual-history ID, planned-instance ID, last-updated timestamp, planned workout step/repeat structure read-only when available, and an editable actual session builder for the performed session.
- Editable in v1 only when the linked actual row is `source_kind = manual` and has a mapped outcome.
- Edits actual session steps/repeats through the same swim-session builder semantics used for manual pool sessions. Planned steps stay read-only.
- Does not expose provider evidence reconciliation in v1.
- Saves through `PATCH /api/my-library/calendar/planned-instances/[instanceId]/completion` with `expectedActualUpdatedAt` stale-write protection.
- Missing actuals, duplicate rows, missing planned references, schema drift, provider/future source rows, and unknown outcomes fail closed to review/support states instead of editing.

## `PATCH /api/my-library/calendar/planned-instances/[instanceId]/completion`

### Request

- Auth: signed-in My Library user.
- Headers:
  - `Content-Type: application/json`
- Body:

```json
{
  "outcome": "partial",
  "completedOn": "2026-06-23",
  "actualStartedAt": "2026-06-23T16:00:00.000Z",
  "actualDurationSeconds": 1800,
  "actualDistanceM": 1200,
  "actualEnvironment": "pool",
  "actualPoolLengthM": 25,
  "actualPoolLengthUnit": "m",
  "correctionNote": "Stopped early.",
  "expectedActualUpdatedAt": "2026-06-22T17:30:00.000Z"
}
```

### Contract

- This correction contract is used by the private `Review actual` editor at `/my-library/calendar/actuals/[instanceId]`; Calendar itself remains a read-only overview once a manual actual exists.
- Corrects the existing owner-scoped manual actual row linked to the planned instance.
- When `actualSessionDraft` is provided, the route validates it with the canonical swim-session draft persistence rules, stores it in `completed_activity_events.actual_session_snapshot`, and derives actual distance, duration, environment, pool length, and pool unit from that draft.
- Summary measured fields remain accepted for backward-compatible correction calls, but Review Actual V1 should send the actual session draft so the performed workout can be corrected at step/repeat granularity.
- The `actualSessionDraft` payload is the full canonical `SessionDraft` shape used by the swim-session builder; abbreviated drafts with missing required fields or empty `steps` are rejected.
- Does not mutate the planned instance, source workout, source program, future provider evidence, or Stats mapping.
- Supported outcomes are `completed_as_planned`, `completed_different`, `partial`, `completed_on_another_day`, `cancelled_as_actual`, and `needs_review`.
- `completedOn` is the actual date and remains the compatibility date field for Calendar reads.
- Stale writes are guarded by `expectedActualUpdatedAt`.
- Unknown outcomes, provider source kinds, duplicate rows, missing schema, cross-owner rows, and missing manual actuals fail closed.

### Status Codes

- `200`: corrected
- `400`: invalid JSON, unsupported outcome, invalid date, invalid measured value, or missing `expectedActualUpdatedAt`
- `401`: unauthenticated
- `404`: planned instance not found for this owner
- `409`: no manual actual yet, stale actual row, or existing completion state needs review
- `500`: bounded load/write failure
- `503`: planned-instance or completed-activity schema still syncing

## `POST /api/my-library/dryland/micro-plans`

### Request

- Auth: signed-in user session required
- Headers:
  - `Content-Type: application/json`
- Body:

```json
{
  "sourceDrylandSessionId": "11111111-1111-4111-8111-111111111111",
  "timezone": "Europe/Oslo"
}
```

### Response

```json
{
  "ok": true,
  "plan": {
    "id": "22222222-2222-4222-8222-222222222222",
    "sourceDrylandSessionId": "11111111-1111-4111-8111-111111111111",
    "status": "active",
    "progress": {
      "totalBlockCount": 2,
      "completedBlockCount": 0,
      "skippedBlockCount": 0,
      "remainingBlockCount": 2,
      "progressPercent": 0
    }
  }
}
```

### Status Codes

- `200`: plan created, or existing active/paused plan returned with `reusedExisting`
- `400`: invalid JSON or source dryland session id
- `401`: unauthenticated
- `404`: source dryland session not found for this user
- `503`: micro-plan schema not live in the environment

## `PATCH /api/my-library/dryland/micro-plans/[planId]`

### Request

- Auth: signed-in user session required
- Headers:
  - `Content-Type: application/json`
- Body for block completion:

```json
{
  "blockId": "block-1-exercise-1",
  "blockStatus": "completed",
  "selectedDate": "2026-06-08",
  "timezone": "Europe/Oslo"
}
```

- `blockStatus`: `queued`, `completed`, or `skipped`
- `selectedDate` + `timezone`: optional for legacy Micro Session updates, required by the current client when a linked Habit may receive credit.
- Body for plan pause/resume:

```json
{
  "planStatus": "paused"
}
```

- Body for explicitly linking the current Micro Session to a new recurring build Habit:

```json
{
  "createRecurringHabit": true,
  "habitTitle": "Evening mobility",
  "habitStartDate": "2026-06-08",
  "selectedDate": "2026-06-08",
  "timezone": "Europe/Oslo"
}
```

- The server creates one active weekly build/binary Habit with `isPerfectDayItem: false`, then creates one owner-scoped Micro Session/Habit link.
- The linked Habit receives one weekly credit automatically when every non-archived unit in the current Micro Session is completed. `skipped` units do not count as completed.
- If the user undoes a completed unit while the active weekly program is no longer complete, the server removes only the auto-generated Micro Session Habit credit for that plan/week. Manual Habit check-ins are not removed.
- Body for pausing/resuming Habit counting without pausing the Micro Session:

```json
{
  "habitLinkStatus": "paused",
  "selectedDate": "2026-06-08",
  "timezone": "Europe/Oslo"
}
```

- `habitLinkStatus`: `active` or `paused`
- Resuming a paused linked Habit after the Micro Session week is stale may replace the old open plan with a current-week Micro Session from the same source sessions. Old completed/skipped blocks stay in the completed plan history; paused weeks are not backfilled.

- Body for clearing the active weekly surface without deleting saved Dryland Sessions:

```json
{
  "clearPlan": true
}
```

- Body for rebuilding the current Micro Session from saved source sessions after a source-session edit:

```json
{
  "sourceDrylandSessionIds": ["11111111-1111-4111-8111-111111111111"],
  "releaseMode": "available_now",
  "releaseTime": "06:00"
}
```

- Source rebuilds preserve completed/skipped block history and regenerate queued blocks only through the owner-scoped plan update path.

### Response

```json
{
  "ok": true,
  "plan": {
    "id": "22222222-2222-4222-8222-222222222222",
    "status": "active",
    "progress": {
      "completedBlockCount": 1,
      "totalBlockCount": 2,
      "progressPercent": 50
    },
    "habitLink": {
      "status": "active",
      "habitId": "55555555-5555-4555-8555-555555555555",
      "habitTitle": "Evening mobility",
      "canCount": true
    }
  },
  "habitCredit": {
    "status": "counted",
    "message": "Habit completed for this week: Evening mobility"
  }
}
```

### Status Codes

- `200`: plan updated, active weekly surface cleared, linked Habit created, or Habit linkage paused/resumed
- `400`: invalid JSON, plan id, block id, block status, plan status, Habit linkage status, recurring Habit input, or source dryland session id
- `401`: unauthenticated
- `404`: micro plan, linked Habit, or linked source session not found for this user
- `503`: micro-plan, linkage, or Habit schema not live in the environment

## Habits Tracking And Recovery

### Check-In Request

`POST /api/my-library/habits/check-ins`

- Auth: signed-in user session required.
- Body:

```json
{
  "habitId": "11111111-1111-4111-8111-111111111111",
  "checkInDate": "2026-06-10",
  "selectedDate": "2026-06-14",
  "timezone": "Europe/Oslo",
  "valueBoolean": true,
  "actionSource": "catch_up"
}
```

- `checkInDate` is the habit history date being written.
- `selectedDate` is optional and controls which snapshot the route returns after the write; historical corrections can write a past `checkInDate` while returning the caller's selected snapshot.
- `actionSource` is optional and still accepts legacy/diagnostic values such as `catch_up`; the current absence review UI does not use it because `Done with this day` / `Close review` write no habit history. Unknown values are treated as normal Habits writes.
- `status: "skipped"` stores an intentional `Rest day`; it is not counted as done or missed.
- Quit slips are explicit `valueBoolean: false` writes for `habit_mode = quit`; no slip or miss row is written automatically at day change.
- Timed source updates use `timerSeconds` and/or `manualMinutes` and cannot be mixed with legacy `valueNumeric`.

### Reset Stats Request

`POST /api/my-library/habits/[habitId]/reset-stats`

```json
{
  "effectiveDate": "2026-06-14",
  "selectedDate": "2026-06-14",
  "actionSource": "catch_up"
}
```

- Reset stats creates a server-canonical `habit_motivation_resets` boundary for one active habit and never deletes `habit_check_ins`.
- Catch-up all-habit recovery calls this route once per active habit so Motivation can restart from Today while complete history remains available in Calendar Comparison.
- Source-backed Micro Session Habits still receive Habit credit only from the Micro Session owner-scoped source path; Habits does not expose manual `Mark done` for those linked rows.
- Catch-up client analytics use `habit_catch_up_assistant_shown`, `habit_catch_up_day_reviewed`, `habit_catch_up_day_left_missed`, `habit_catch_up_reset_started`, and `habit_catch_up_reset_cancelled`; the prompt summary includes habit/day counts, each habit card shows a compact next-day cleanup flow, and only one missed day is actionable at a time. Saved done/rest/slip/reset writes continue through the existing server events with `actionSource: "catch_up"` when recovery initiated them.

## `GET|POST /api/progress/guide`

### Request

- Auth: signed-in user session required

`GET`:

- no body

`POST`:

- Headers:
  - `Content-Type: application/json`
- Body:

```json
{
  "rows": [
    {
      "guideSlug": "0-1000m",
      "sectionId": "S01",
      "completed": true,
      "notes": "Felt better rhythm today",
      "updatedAt": "2026-02-17T10:00:00.000Z"
    }
  ]
}
```

### Response

`GET` success:

```json
{
  "ok": true,
  "rows": [
    {
      "guideSlug": "0-1000m",
      "sectionId": "S01",
      "completed": true,
      "notes": "Felt better rhythm today",
      "updatedAt": "2026-02-17T10:00:00.000Z"
    }
  ]
}
```

`POST` success:

```json
{
  "ok": true,
  "upserted": 1
}
```

Known live guides canonicalize section IDs before merge/upsert:

- `0-1000m` uses `S01`, `S02`, ...
- `poolside` uses `D01`, `D02`, ...

Failure:

```json
{
  "ok": false,
  "error": "Unauthorized."
}
```

### Status Codes

- `200`: success
- `400`: invalid JSON or invalid payload (`rows` missing/not array)
- `401`: unauthorized
- `413`: too many rows in one request
- `415`: unsupported content type
- `500`: database failure

## `GET /api/guides/0-1000m/pdf`

### Request

- Auth: signed-in user session required
- Access: user must own `guide_0_1000m` entitlement

### Response

- Success:
  - `200` with `application/pdf`
  - `Content-Disposition: attachment; filename="freeswimming-0-1000m-guide.pdf"`

- Failure:

```json
{
  "ok": false,
  "error": "Guide access required."
}
```

### Status Codes

- `200`: pdf download stream
- `401`: unauthorized
- `403`: user does not own guide entitlement
- `500`: entitlement verification failure
- `503`: PDF asset temporarily unavailable

## `GET /api/guides/poolside/pdf`

### Request

- Auth: signed-in user session required
- Access: user must own `guide_poolside` entitlement

### Response

- Success:
  - `200` with `application/pdf`
  - `Content-Disposition: attachment; filename="freeswimming-poolside-guide.pdf"`

- Failure:

```json
{
  "ok": false,
  "error": "Guide access required."
}
```

### Status Codes

- `200`: pdf download stream
- `401`: unauthorized
- `403`: user does not own guide entitlement
- `500`: entitlement verification failure
- `503`: PDF asset temporarily unavailable
