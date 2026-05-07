# Environment Config And Secret Parity Runbook

## Purpose

Keep `local`, `preview`, and `production` environment configuration deterministic so admin access and critical flows behave the same way.

Canonical secret/config families are registered in
`docs/architecture/secret-config-inventory.md`.

External service/provider behavior is registered in
`docs/architecture/external-service-contract-matrix.md`.

## Guardrails

- Never store secret values in git, screenshots, or PR comments.
- Treat `.env.local` as local-only.
- Use Vercel environment scopes intentionally:
  - `Preview` for PR/testing values,
  - `Production` for live values.

## Runtime Env Matrix

Legend:

- `required`: must be set for that environment.
- `optional`: set only if that feature is used in that environment.
- `conditional`: required only when the named provider/feature mode is enabled.
- `no`: should not be set in that environment.
- `recommended`: optional but strongly advised for hardening.
- `auto`: provided by platform.

| Variable                                  | Class                | Local         | Preview       | Production    | Notes                                                                                                                    |
| ----------------------------------------- | -------------------- | ------------- | ------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_APP_URL`                     | public runtime       | `required`    | `required`    | `required`    | Canonical app URL for callbacks/links.                                                                                   |
| `NEXT_PUBLIC_SUPABASE_URL`                | public runtime       | `required`    | `required`    | `required`    | Supabase project URL.                                                                                                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`           | public runtime       | `required`    | `required`    | `required`    | Public anon key.                                                                                                         |
| `SUPABASE_SERVICE_ROLE_KEY`               | server secret        | `required`    | `required`    | `required`    | Needed for privileged server writes/tasks.                                                                               |
| `FS_SUPABASE_ENV`                         | ops safety flag      | `required`    | `recommended` | `recommended` | Use `local`, `test`, `ci`, `preview`, or `production` to document the intended Supabase target.                          |
| `FS_ALLOW_PROD_SUPABASE`                  | ops safety flag      | `optional`    | `optional`    | `no`          | Set to `1` only for a single intentional local/CI production smoke or ops command.                                       |
| `FS_PRODUCTION_SUPABASE_URL`              | ops safety marker    | `recommended` | `recommended` | `recommended` | Production Supabase origin used by guardrails for exact-match blocking in local, CI, and preview contexts.               |
| `STRIPE_SECRET_KEY`                       | server secret        | `required`    | `required`    | `required`    | Checkout + portal server usage.                                                                                          |
| `STRIPE_WEBHOOK_SECRET`                   | server secret        | `required`    | `required`    | `required`    | Stripe webhook signature validation.                                                                                     |
| `STRIPE_PRICE_ID_0_1000M_GUIDE`           | server config        | `required`    | `required`    | `required`    | Stripe price ID mapping.                                                                                                 |
| `STRIPE_PRICE_ID_POOLSIDE_GUIDE`          | server config        | `required`    | `required`    | `required`    | Stripe price ID mapping.                                                                                                 |
| `STRIPE_PRICE_ID_ANALYSIS`                | server config        | `required`    | `required`    | `required`    | Stripe price ID mapping.                                                                                                 |
| `RESEND_API_KEY`                          | server secret        | `optional`    | `conditional` | `conditional` | Compatibility fallback for `MESSAGE_DELIVERY_PROVIDER=resend_api` when `MESSAGE_DELIVERY_RESEND_API_KEY` is omitted.     |
| `CONTACT_TO_EMAIL`                        | server config        | `optional`    | `required`    | `required`    | Contact notification destination mailbox; missing config records notification failure after intake storage.              |
| `CONTACT_FROM_EMAIL`                      | server config        | `optional`    | `optional`    | `optional`    | Temporary sender fallback for `MESSAGE_DELIVERY_FROM_EMAIL`; no longer creates a default dev sender.                     |
| `CONTACT_ALLOWED_ORIGINS`                 | server config        | `optional`    | `required`    | `required`    | CSRF/origin allowlist for contact route.                                                                                 |
| `CONTACT_INTAKE_STORAGE`                  | local/test config    | `optional`    | `no`          | `no`          | `local_verify` is allowed only for no-egress local/Playwright verification outside production; production uses Supabase. |
| `CONTACT_INTAKE_LOCAL_FILE`               | local/test config    | `optional`    | `no`          | `no`          | Optional local-only file path for `CONTACT_INTAKE_STORAGE=local_verify`; never deployed.                                 |
| `MESSAGE_DELIVERY_PROVIDER`               | server config        | `optional`    | `required`    | `required`    | Admin Messages v1 provider key: `disabled`, `resend_api`, `resend_smtp`, or `smtp_one_com_compatible`.                   |
| `MESSAGE_DELIVERY_TIMEOUT_MS`             | server config        | `optional`    | `optional`    | `optional`    | Provider timeout; defaults to `10000` and hard-caps at `15000`.                                                          |
| `MESSAGE_DELIVERY_FROM_EMAIL`             | server config        | `optional`    | `required`    | `required`    | Default sender for Admin Messages v1 notifications; dashboard replies are deferred and normal email remains reply inbox. |
| `MESSAGE_DELIVERY_REPLY_TO_EMAIL`         | server config        | `optional`    | `optional`    | `optional`    | Default reply-to mailbox when the payload does not provide a submitter/reply address.                                    |
| `MESSAGE_DELIVERY_RESEND_API_KEY`         | server secret        | `optional`    | `conditional` | `conditional` | Required only when `MESSAGE_DELIVERY_PROVIDER=resend_api`; falls back to `RESEND_API_KEY` if omitted.                    |
| `MESSAGE_DELIVERY_RESEND_API_URL`         | server config        | `optional`    | `optional`    | `optional`    | Optional Resend API endpoint override; default is the official Resend email API.                                         |
| `MESSAGE_DELIVERY_SMTP_HOST`              | server config        | `optional`    | `conditional` | `conditional` | Required when `MESSAGE_DELIVERY_PROVIDER` is `smtp_one_com_compatible` or `resend_smtp`.                                 |
| `MESSAGE_DELIVERY_SMTP_PORT`              | server config        | `optional`    | `conditional` | `conditional` | SMTP port; defaults to `465` for One.com-compatible SMTP and `587` for Resend SMTP.                                      |
| `MESSAGE_DELIVERY_SMTP_SECURE`            | server config        | `optional`    | `optional`    | `optional`    | Override TLS mode; defaults to secure when port is `465`.                                                                |
| `MESSAGE_DELIVERY_SMTP_USER`              | server secret        | `optional`    | `conditional` | `conditional` | Required for SMTP providers.                                                                                             |
| `MESSAGE_DELIVERY_SMTP_PASSWORD`          | server secret        | `optional`    | `conditional` | `conditional` | Required for SMTP providers.                                                                                             |
| `MESSAGE_DELIVERY_MESSAGE_ID_DOMAIN`      | server config        | `optional`    | `optional`    | `optional`    | Optional domain used in deterministic SMTP `Message-ID` headers; defaults to `freeswimming.app`.                         |
| `UPSTASH_REDIS_REST_URL`                  | server secret        | `optional`    | `optional`    | `optional`    | Enables production-grade rate limiting.                                                                                  |
| `UPSTASH_REDIS_REST_TOKEN`                | server secret        | `optional`    | `optional`    | `optional`    | Pair with Upstash URL.                                                                                                   |
| `ADMIN_EMAIL_ALLOWLIST`                   | server config        | `optional`    | `optional`    | `optional`    | Bootstrap fallback for admin visibility only.                                                                            |
| `QR_REDIRECT_ALLOWED_HOSTS`               | server config        | `optional`    | `recommended` | `recommended` | Strict host allowlist for QR destinations.                                                                               |
| `SITE_LOCK_ENABLED`                       | server config        | `optional`    | `optional`    | `optional`    | `1` only when private gate is intentionally enabled.                                                                     |
| `SITE_LOCK_MODE`                          | server config        | `optional`    | `optional`    | `optional`    | Current supported mode: `password`.                                                                                      |
| `SITE_LOCK_PASSWORD_HASH`                 | server secret        | `optional`    | `optional`    | `optional`    | Required if `SITE_LOCK_ENABLED=1`.                                                                                       |
| `SITE_LOCK_BYPASS_TOKEN`                  | server secret        | `optional`    | `optional`    | `optional`    | Required if `SITE_LOCK_ENABLED=1`.                                                                                       |
| `SITE_LOCK_COOKIE_NAME`                   | server config        | `optional`    | `optional`    | `optional`    | Override only if needed; default is stable.                                                                              |
| `SITE_LOCK_SESSION_MAX_AGE_SECONDS`       | server config        | `optional`    | `optional`    | `optional`    | Override only if needed; default is stable.                                                                              |
| `GUIDE_0_TO_1000M_PDF_ASSET_PATH`         | server config        | `optional`    | `optional`    | `optional`    | Safe repo-relative PDF path override.                                                                                    |
| `GUIDE_POOLSIDE_PDF_ASSET_PATH`           | server config        | `optional`    | `optional`    | `optional`    | Safe repo-relative PDF path override.                                                                                    |
| `NEXT_PUBLIC_FS_AUTOGEN_LESSONS`          | public local-debug   | `optional`    | `no`          | `no`          | Local visual/test helper only.                                                                                           |
| `NEXT_PUBLIC_FS_AUTOGEN_COUNT_M1`         | public local-debug   | `optional`    | `no`          | `no`          | Local visual/test helper only.                                                                                           |
| `NEXT_PUBLIC_FS_A2HS_AUTO_PROMPT_ENABLED` | public feature flag  | `optional`    | `optional`    | `optional`    | Prompt kill-switch for course flow.                                                                                      |
| `DEV_AUTH_BYPASS_ENABLED`                 | local-only auth      | `optional`    | `no`          | `no`          | Must remain local only.                                                                                                  |
| `DEV_AUTH_BYPASS_TOKEN`                   | local-only secret    | `optional`    | `no`          | `no`          | Must remain local only.                                                                                                  |
| `DEV_AUTH_BYPASS_EMAIL`                   | local-only account   | `optional`    | `no`          | `no`          | Must remain local only.                                                                                                  |
| `DEV_AUTH_BYPASS_PASSWORD`                | local-only secret    | `optional`    | `no`          | `no`          | Must remain local only.                                                                                                  |
| `PW_SITE_LOCK_PASSWORD`                   | local/CI test secret | `optional`    | `no`          | `no`          | Playwright private-gate helper only.                                                                                     |
| `PW_SITE_LOCK_BYPASS_TOKEN`               | local/CI test secret | `optional`    | `no`          | `no`          | Playwright private-gate helper only.                                                                                     |
| `PW_SITE_LOCK_USE_PASSWORD`               | local/CI test flag   | `optional`    | `no`          | `no`          | Playwright private-gate helper only.                                                                                     |
| `VERCEL_URL`                              | platform-provided    | `auto`        | `auto`        | `auto`        | Injected by Vercel; do not set manually.                                                                                 |

## CI/Automation Secrets (GitHub)

| Secret                         | Used By                                | Required                             |
| ------------------------------ | -------------------------------------- | ------------------------------------ |
| `VERCEL_TOKEN`                 | `.github/workflows/vercel-preview.yml` | required for preview deploy workflow |
| `VERCEL_ORG_ID`                | `.github/workflows/vercel-preview.yml` | required for preview deploy workflow |
| `VERCEL_PROJECT_ID`            | `.github/workflows/vercel-preview.yml` | required for preview deploy workflow |
| `CI_SUPABASE_URL`              | CI verify/admin workflows              | required                             |
| `CI_SUPABASE_ANON_KEY`         | CI verify/admin workflows              | required                             |
| `CI_SUPABASE_SERVICE_ROLE_KEY` | CI verify workflows                    | required                             |
| `CI_STRIPE_SECRET_KEY`         | CI verify workflows                    | required                             |
| `CI_STRIPE_WEBHOOK_SECRET`     | CI verify workflows                    | required                             |
| `CI_DEV_AUTH_BYPASS_TOKEN`     | CI verify workflows                    | required                             |
| `CI_DEV_AUTH_BYPASS_EMAIL`     | CI verify workflows                    | required                             |
| `CI_DEV_AUTH_BYPASS_PASSWORD`  | CI verify workflows                    | required                             |

## Admin Access Troubleshooting (Deterministic)

1. Confirm authentication works (`/auth/sign-in` can send code and complete sign-in).
2. Check runtime flag response while signed in:
   - open `/api/runtime/flags`,
   - verify `flags.dashboardVisible` is `true`.
3. If `dashboardVisible=false`:
   - verify profile role/app metadata role (`admin` or `editor`), or
   - verify `ADMIN_EMAIL_ALLOWLIST` includes the signed-in email for bootstrap fallback.
4. Open `/admin` and confirm:
   - no redirect loop to sign-in or preview access,
   - admin shell heading is visible.
5. If access still fails:
   - redeploy environment after env updates,
   - sign out/in once to refresh session context,
   - repeat step 2.

## Vercel Update Order (Preview/Production)

1. Update environment variables in target Vercel scope.
2. Redeploy target environment.
3. Run smoke checks:
   - `/auth/sign-in`,
   - `/api/runtime/flags`,
   - `/admin`,
   - `/api/checkout/session` (basic happy-path request from app),
   - `/api/contact` (allowed origin).
4. Record smoke evidence in:
   - `docs/checklists/admin-access-and-secret-rotation.md`
   - include `preview` and `production` rows with timestamp + operator.
5. If smoke fails, rollback by restoring previous env values and redeploy.

## Upstash Rate-Limit Drift

Upstash is the hosted Redis-backed shared rate-limit store used by public abuse controls. It is not message storage, email delivery, or admin workflow state.

Secret/config family: `rate_limit_store` in `docs/architecture/secret-config-inventory.md`.

Official baseline checked on `2026-05-07`:

- Upstash Redis REST uses the database HTTPS REST URL plus bearer token authentication.
- Upstash REST `401` means authentication failed because the token is missing or invalid.
- Vercel env changes apply only to new deployments, so a repaired URL/token pair is not runtime-active until redeploy.

If deployed logs show Upstash `401`:

1. Treat the configured `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` pair as unauthorized, expired, copied from the wrong Upstash database, or mismatched across environments.
2. Confirm the affected environment falls back to deterministic in-memory rate limiting.
3. For low-volume pre-live smoke, this can be accepted only when the target flow also proves durable app storage and the relevant provider/admin workflow.
4. Before broader public launch or higher-volume intake, repair the Upstash pair in the control plane, redeploy, and confirm logs no longer show `401`.
5. Record only presence/status and log outcome. Never paste URL/token values into repo docs, PRs, screenshots, or chat.

Repair evidence must be non-sensitive:

- allowed: affected environment, redeploy ID, route name, status class, and whether `401` disappeared;
- not allowed: Upstash URL, token, request IP, email, cookies, auth headers, or full provider response.

## Admin Messages V1 Provider Parity

Admin Messages v1 is e-mail-first:

- `/api/contact` stores app-canonical intake before provider notification.
- provider notification can be disabled, retryable, or failed without deleting the stored request.
- `/admin?tab=messages` is the triage and diagnostic safety net.
- the normal email inbox is the only daily reply workspace for v1.

Before test swimmer intake, verify Preview and Production have:

- `CONTACT_TO_EMAIL` and `CONTACT_ALLOWED_ORIGINS`,
- `MESSAGE_DELIVERY_PROVIDER`,
- `MESSAGE_DELIVERY_FROM_EMAIL`,
- exactly the provider-specific secret group required by the selected provider.

Use `docs/checklists/admin-message-v1-pre-live-smoke.md` for non-sensitive evidence. Do not record secret values, raw provider responses, or message free text.

## Rotation Policy

Use checklist:

- `docs/checklists/admin-access-and-secret-rotation.md`

Every rotation must also confirm the relevant family row in
`docs/architecture/secret-config-inventory.md` still has the right owner, storage boundary,
sensitivity class, cadence, and failure-mode contract.

## Brief Closeout Gate

Before moving the env-parity brief to `done`:

1. Manual smoke evidence table has `pass` for both `preview` and `production`.
2. Template `TBD`/`pending` rows are removed or replaced with real evidence rows.
3. Latest checkpoint log entry includes merge hash + explicit next step.
4. Any failed smoke attempt has rollback note and a follow-up verification row.
