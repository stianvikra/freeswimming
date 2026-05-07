# Admin Access And Secret Rotation Checklist

## Purpose

Provide a short, repeatable procedure for rotating sensitive config and confirming admin access still works.

Canonical family inventory: `docs/architecture/secret-config-inventory.md`.

## Before Rotation

- Confirm change window and owner.
- Confirm rollback owner and previous values are available in secure secret manager.
- Identify impacted environments: `local`, `preview`, `production`.
- Identify the impacted family ID from `docs/architecture/secret-config-inventory.md`.

## Rotation Steps

1. Rotate one secret group at a time (do not rotate everything at once).
2. Update target environment variables.
3. Redeploy target environment.
4. Run smoke checks (below) before moving to next secret group.

## Required Smoke Checks Per Environment

1. `/auth/sign-in` can complete a normal sign-in flow.
2. `/api/runtime/flags` returns `ok: true`.
3. Signed-in admin gets `flags.dashboardVisible=true` from `/api/runtime/flags`.
4. `/admin` opens without redirect loop.
5. `/admin?tab=messages` opens for admin/editor and can show message diagnostics when rows exist.
6. Contact form/API still accepts allowed origin requests.
7. Checkout flow still reaches Stripe session creation from app flow.

## Manual Smoke Evidence (Required Before Brief Closeout)

Record one row per environment after smoke checks. Keep values non-sensitive.

| Date (UTC)       | Environment  | Operator   | `/auth/sign-in` | `/api/runtime/flags` (`ok: true`) | `dashboardVisible=true` (signed-in admin) | `/admin` | `/admin?tab=messages` | `/api/contact` (allowed origin) | `/api/checkout/session` (app flow) | Result | Notes                                       |
| ---------------- | ------------ | ---------- | --------------- | --------------------------------- | ----------------------------------------- | -------- | --------------------- | ------------------------------- | ---------------------------------- | ------ | ------------------------------------------- |
| 2026-03-13 11:02 | `preview`    | stianvikra | pass            | pass                              | pass                                      | pass     | N/A before v1         | pass                            | pass                               | pass   | manual smoke via PR #207 preview deployment |
| 2026-03-13 11:11 | `production` | stianvikra | pass            | pass                              | pass                                      | pass     | N/A before v1         | pass                            | pass                               | pass   | manual smoke via production deployment      |

Closeout rule:

- Keep brief `in-progress` until both `preview` and `production` rows are `pass`.
- Template TBD rows must be replaced or removed before brief closeout.
- If a row fails, run rollback first, then append a new verification row after redeploy.

## Secret Groups (Recommended Order)

1. Contact + rate-limit (`contact_public_intake`, `message_delivery`, `rate_limit_store`):
   - `RESEND_API_KEY`
   - `CONTACT_TO_EMAIL`
   - `CONTACT_FROM_EMAIL`
   - `CONTACT_ALLOWED_ORIGINS`
   - `CONTACT_INTAKE_STORAGE`
   - `CONTACT_INTAKE_LOCAL_FILE`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
2. Admin Messages delivery (only when Admin Messages v1 is enabled, `message_delivery`):
   - `MESSAGE_DELIVERY_PROVIDER`
   - `MESSAGE_DELIVERY_FROM_EMAIL`
   - `MESSAGE_DELIVERY_REPLY_TO_EMAIL`
   - `MESSAGE_DELIVERY_RESEND_API_KEY`
   - `MESSAGE_DELIVERY_SMTP_HOST`
   - `MESSAGE_DELIVERY_SMTP_PORT`
   - `MESSAGE_DELIVERY_SMTP_SECURE`
   - `MESSAGE_DELIVERY_SMTP_USER`
   - `MESSAGE_DELIVERY_SMTP_PASSWORD`
   - `MESSAGE_DELIVERY_MESSAGE_ID_DOMAIN`
3. Supabase (`supabase_app_access`, `supabase_egress_guard`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `FS_SUPABASE_ENV`
   - `FS_ALLOW_PROD_SUPABASE`
   - `FS_PRODUCTION_SUPABASE_URL`
4. Stripe (`stripe_commerce`):
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - price IDs
5. Private gate (only if used, `site_lock_private_gate`):
   - `SITE_LOCK_PASSWORD_HASH`
   - `SITE_LOCK_BYPASS_TOKEN`

## Upstash Repair Evidence

When repairing `rate_limit_store`, record only non-sensitive evidence:

- impacted environment,
- redeploy ID,
- route checked,
- whether Upstash `401` disappeared,
- whether the route avoided app `500`,
- rollback status if the pair had to be unset.

Never record `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, request IP, email, cookies,
auth headers, or full provider response.

## Rollback (If Smoke Fails)

1. Restore last known-good env values in affected environment.
2. Redeploy immediately.
3. Re-run smoke checks.
4. Log incident note with:
   - environment,
   - rotated key group,
   - failure symptom,
   - rollback confirmation time.
