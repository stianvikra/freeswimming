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
    "schemaVersion": "2026-05-11-dryland-legacy-focus-export",
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
    "workouts": []
  }
}
```

- `drylandSessions[].legacyFocusText` is read-only legacy export data. Dryland authoring no longer exposes or writes Focus cue, but authenticated exports preserve historical values when present.

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
  `docs/architecture/workout-checkout-attribution-finance-separation-contract.md`.
- Existing upsell caveat: `existingUpsellBaseline` is current-surface commercial telemetry derived
  from `upsell_presented`, `upsell_accepted`, and `upsell_declined`. `upsell_presented` is surface
  visibility, not checkout start. `upsell_accepted` is clicked intent, not checkout completion.
  `upsell_declined` is the current checkout-cancel return signal, not all users who ignored,
  dismissed, or failed to convert. The current-surface totals count only approved existing sources
  such as `plans` and `library_explore`; unknown sources remain separate, and workout-context CTA
  rows are counted only in the dedicated `workoutContextCta` aggregate when explicitly mapped.
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
  mapped saved-workout CTA rendered; accepted means clicked intent. Unknown or unmapped
  workout-context rows stay out of KPI counts. These values are not checkout conversion,
  entitlement truth, Stripe reconciliation, revenue attribution, finance reporting, or unique-user
  conversion.
- Checkout-start attribution caveat: the mapped saved-workout CTA may preserve
  `source=workout_context`, `placementId=workout_saved_post_success`, and
  `productId=guide_poolside` through `/plans` into `checkout_started`. This remains checkout
  handoff/session creation only, not CTA conversion, checkout completion, entitlement, Stripe
  reconciliation, revenue attribution, finance reporting, or unique-user conversion. Future shop
  products, placements, routes, or checkout sources require explicit mapping before they enter
  dedicated workout-context checkout KPIs.
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
  "workoutContextCta": {
    "placementId": "workout_saved_post_success",
    "productId": "guide_poolside",
    "source": "workout_context",
    "presented": 4,
    "accepted": 2,
    "acceptedRate": 0.5,
    "unknownEvents": 1
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
