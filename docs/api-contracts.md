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
    "schemaVersion": "2026-03-19-athlete-profile",
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
    "downloadLinks": []
  }
}
```

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
- Auth: optional (event is accepted for signed-in and signed-out users)
- `eventName` must match the allowed analytics event contract list (see My Library task brief section `Analytics and KPI Contract (V1)`).
- Body:

```json
{
  "eventName": "plans_viewed",
  "payload": {
    "productCount": 3,
    "availableCount": 3
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
