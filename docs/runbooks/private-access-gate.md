# Private Access Gate Runbook

## Purpose

Temporarily keep freeswimming.org private while work is in progress, with controlled owner/tester access.

## Required Environment Variables

- `SITE_LOCK_ENABLED=1`
- `SITE_LOCK_MODE=password`
- `SITE_LOCK_PASSWORD_HASH=sha256:<64-hex>`
- `SITE_LOCK_BYPASS_TOKEN=<long-random-secret>`

Optional:

- `SITE_LOCK_COOKIE_NAME` (default: `fs_preview_access`)
- `SITE_LOCK_SESSION_MAX_AGE_SECONDS` (default: `43200`)

## Generate Password Hash

```bash
printf '%s' 'YOUR_PREVIEW_PASSWORD' | shasum -a 256
```

Use output as:

```text
SITE_LOCK_PASSWORD_HASH=sha256:<OUTPUT>
```

## Enable Lock

1. Set env vars in local/preview/production.
2. Redeploy target environment.
3. Verify:
   - public route redirects to `/preview-access`,
   - preview password unlocks and sets access cookie,
   - signed-in admins are issued preview access through `/preview-access/admin-unlock`,
   - `/api/stripe/webhook` remains reachable.

Preview cookie clear URL:

```text
/preview-access/clear?next=/
```

Ops alternative:

- For hosted preview/production, prefer the one-click workflow runbook:
  - `docs/runbooks/site-lock-operations.md`

## Disable Lock

1. Set `SITE_LOCK_ENABLED=0`.
2. Redeploy.
3. Verify public routes and sitemap/robots normal behavior.

## QA Checklist

- Public visitor redirected from `/` to `/preview-access`.
- Invalid password keeps user on preview page with clear error.
- Valid password redirects to requested `next` path.
- Authenticated admin redirects through `/preview-access/admin-unlock` and reaches the requested `next` path without entering the shared preview password.
- `/preview-access` keeps the shared preview password as the primary unlock action and any notify-interest CTA as a clearly secondary path.
- `/contact?source=preview_access_notify` stays reachable while private mode is enabled so visitors can request preview updates.
- API endpoints (except explicit bypasses) return locked response while private mode is enabled.
- `robots.txt` disallows all and `sitemap.xml` is empty while lock is enabled.

## Automated Test Inputs

For Playwright private-gate verification (`npm run test:e2e:private-gate`):

- automation default: `PW_SITE_LOCK_BYPASS_TOKEN=<same value as SITE_LOCK_BYPASS_TOKEN>`
- force password flow coverage: `PW_SITE_LOCK_USE_PASSWORD=1 PW_SITE_LOCK_PASSWORD=<plain-preview-password>`

Password-backed runs are required when validating unlock UX copy/behavior.

## Security Notes

- Do not store plain password in repository files.
- Rotate `SITE_LOCK_BYPASS_TOKEN` if leaked.
- Keep bypass token separate from password.
