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
- `eventName` must match the allowed analytics event contract list (see My Library task brief section `Analytics and KPI Contract (V1)`).
- Payload is sanitized. Free text, raw URLs/referrers, raw User-Agent, raw IP, email, payment,
  shipping, cart notes, and nested objects are stripped or redacted.
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
- Data source: sanitized `analytics_events` rows only.
- Cache: `no-store`.

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
  "funnel": {
    "publicPageViewed": 4,
    "plansViewed": 4,
    "productViewed": 1,
    "checkoutStarted": 2,
    "checkoutCompleted": 1,
    "entitlementGranted": 1,
    "checkoutCompletionRate": 0.5,
    "entitlementGrantRate": 1
  }
}
```

When the migration is not applied yet, the route returns `200` with `schemaReady: false` and setup
guidance instead of throwing. Unauthenticated or non-admin callers receive `401`/`403`.

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
