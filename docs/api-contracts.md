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
      "sectionId": "s01",
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
      "sectionId": "s01",
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
