# Admin Access And Secret Rotation Checklist

## Purpose

Provide a short, repeatable procedure for rotating sensitive config and confirming admin access still works.

## Before Rotation

- Confirm change window and owner.
- Confirm rollback owner and previous values are available in secure secret manager.
- Identify impacted environments: `local`, `preview`, `production`.

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
5. Contact form/API still accepts allowed origin requests.
6. Checkout flow still reaches Stripe session creation from app flow.

## Manual Smoke Evidence (Required Before Brief Closeout)

Record one row per environment after smoke checks. Keep values non-sensitive.

| Date (UTC)       | Environment  | Operator   | `/auth/sign-in` | `/api/runtime/flags` (`ok: true`) | `dashboardVisible=true` (signed-in admin) | `/admin` | `/api/contact` (allowed origin) | `/api/checkout/session` (app flow) | Result | Notes                                       |
| ---------------- | ------------ | ---------- | --------------- | --------------------------------- | ----------------------------------------- | -------- | ------------------------------- | ---------------------------------- | ------ | ------------------------------------------- |
| 2026-03-13 11:02 | `preview`    | stianvikra | pass            | pass                              | pass                                      | pass     | pass                            | pass                               | pass   | manual smoke via PR #207 preview deployment |
| 2026-03-13 11:11 | `production` | stianvikra | pass            | pass                              | pass                                      | pass     | pass                            | pass                               | pass   | manual smoke via production deployment      |

Closeout rule:

- Keep brief `in-progress` until both `preview` and `production` rows are `pass`.
- Template TBD rows must be replaced or removed before brief closeout.
- If a row fails, run rollback first, then append a new verification row after redeploy.

## Secret Groups (Recommended Order)

1. Contact + rate-limit:
   - `RESEND_API_KEY`
   - `CONTACT_TO_EMAIL`
   - `CONTACT_FROM_EMAIL`
   - `CONTACT_ALLOWED_ORIGINS`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
2. Supabase:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Stripe:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - price IDs
4. Private gate (only if used):
   - `SITE_LOCK_PASSWORD_HASH`
   - `SITE_LOCK_BYPASS_TOKEN`

## Rollback (If Smoke Fails)

1. Restore last known-good env values in affected environment.
2. Redeploy immediately.
3. Re-run smoke checks.
4. Log incident note with:
   - environment,
   - rotated key group,
   - failure symptom,
   - rollback confirmation time.
