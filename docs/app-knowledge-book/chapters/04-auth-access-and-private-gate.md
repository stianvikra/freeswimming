# Auth, Access, And Private Gate

## What This Is

This chapter is stable explanatory documentation for the FreeSwimming.org owner. It explains how
sign-in, sessions, admin access, private preview access, site lock, and dev/test bypasses fit
together today.

Evidence boundary:

- Confirmed repo facts cite exact paths.
- Provider dashboards, live auth settings, deployed env settings, and production control-plane state
  are `Unknown / To Verify` unless repo or owner-provided evidence proves them.
- This chapter does not include secret values, raw env values, cookies, tokens, one-time codes,
  request IPs, provider responses, personal data, or user free-text content.

Evidence date:

- Reviewed on `2026-05-17` against `main@eae8817`.
- External/control-plane facts remain `Unknown / To Verify` unless explicitly marked otherwise.

## Why It Matters

Auth and access control decide who can see private member data, who can operate admin workflows, and
whether public visitors can reach the site while it is still private.

For the owner, the important split is:

- Supabase session: proves a person is signed in.
- App authorization: decides what that signed-in person can do.
- Site lock: temporarily keeps the whole site private during preview/launch windows.
- Dev bypass: local/test convenience only, not real user access.

## Current Access Model

Public visitor:

- Uses public routes under `app/`.
- When site lock is enabled, `proxy.ts` redirects non-bypassed non-API requests to
  `/preview-access` and returns locked JSON for protected API requests.
- Public metadata posture changes while locked: `app/robots.ts` disallows `/`, and
  `app/sitemap.ts` returns an empty sitemap.

Signed-in member:

- Signs in through `app/auth/sign-in/page.tsx`.
- Auth actions live in `app/auth/sign-in/actions.ts`.
- Supabase session helpers live under `lib/supabase/`.
- Member routes and APIs must still enforce owner-scoped access through route handlers, RLS, or
  explicit `user.id` checks. The route-level contract is tracked in
  `docs/architecture/data-access-authz-cache-contract-registry.md`.

Admin/editor/viewer:

- `/admin` is guarded by `app/admin/layout.tsx`.
- Role values are `admin`, `editor`, and `viewer` in `lib/admin/access.ts`.
- Server-side admin checks use `requireAdminRoleFromSupabase()` in `lib/admin/server.ts`.
- Admin role resolution can use a profile role, Supabase app metadata, or the admin email allowlist.
- The allowlist can bootstrap an admin profile, but email alone is still not a public route
  identifier or broad authorization model.

Private preview visitor:

- `/preview-access` is the shared preview unlock surface.
- Password validation lives in `app/preview-access/actions.ts` and `lib/site-lock/password.ts`.
- A valid preview password creates a signed site-lock session cookie using
  `lib/site-lock/session.ts`.
- `/preview-access/clear` clears the preview cookie through `app/preview-access/clear/route.ts`.
- Signed-in admins can be redirected through `app/preview-access/admin-unlock/route.ts`; its JSON
  path requires stronger session claims before issuing a preview cookie.

Dev/test automation:

- Dev login helpers live in `app/dev/login/route.ts`, `app/api/dev-login/route.ts`, and
  `lib/auth/dev-auth-bypass.ts`.
- Dev auth bypass requires development mode, local/private request checks, and configured bypass
  credentials.
- Treat dev bypass as test infrastructure only. It is not a production account feature.

## Sign-In And Sessions

The user-facing sign-in page is `app/auth/sign-in/page.tsx`.

Current behavior:

- Users enter an email address and receive a secure sign-in email.
- The primary path is the secure email link; the same email also includes a one-time code fallback.
- iPhone Home Screen app users may see the email link open in Safari instead of the installed app;
  the robust recovery path is to return to the Home Screen app and enter the one-time code there.
- The Supabase Magic Link email template must include `{{ .ConfirmationURL }}` for the primary
  sign-in link and `{{ .Token }}` for the fallback code; the recommended brand image is the hosted
  PNG lockup at `/logos/brand/lockup-domain-blue.png`.
- `/auth/callback` uses the route-handler Supabase client so successful link callbacks apply
  session cookies to the redirect response before sending the user to the safe `next` path.
- The fallback code form verifies through `verifySignInCode()` in `app/auth/sign-in/actions.ts`.
- Safe redirect targets are normalized through `lib/auth/next-path.ts`.
- Request cooldown and resend behavior are handled by helpers in `lib/auth/`.
- Email send errors are classified so support can distinguish cooldowns, provider limits, delivery
  failures, and unknown errors.
- Auth request rate limiting can use Upstash when configured, with an in-memory fallback path in the
  sign-in action code.

Important boundary:

- Signing in proves identity. It does not automatically grant admin access, billing access,
  entitlement access, or access to another user's data.
- Protected route handlers must still enforce their own route class from
  `docs/architecture/data-access-authz-cache-contract-registry.md`.

Support starts with:

- `docs/runbooks/auth-account-support.md`
- `app/auth/sign-in/actions.ts`
- `lib/auth/sign-in-email-error.ts`
- `docs/architecture/external-service-contract-matrix.md`

## Admin Access

Admin access is app authorization layered on top of Supabase identity.

Current role contract:

| Role     | Meaning at owner-readable depth                                                |
| -------- | ------------------------------------------------------------------------------ |
| `viewer` | Can read admin state where a route allows viewer access.                       |
| `editor` | Can perform edit-level admin workflows where the route requires editor access. |
| `admin`  | Can perform highest-risk admin workflows where the route requires admin.       |

Role resolution is implemented in `lib/admin/access.ts`:

- profile role first when present,
- Supabase app metadata role when present,
- configured admin email allowlist as fallback.

Server routes should use `requireAdminRoleFromSupabase()` from `lib/admin/server.ts` and return
deterministic `401`, `403`, or `500` responses instead of leaking sensitive internals.

Important boundary:

- Admin role is not inferred from a route URL.
- Admin email is not a durable identifier for user-owned data.
- Admin/test access policy changes need a scoped task brief, negative-path tests, and support-doc
  updates.

## Private Gate And Site Lock

The private gate is a launch/preview control, not the normal member-auth model.

Repo-visible control points:

- `proxy.ts`: route-wide site-lock enforcement.
- `lib/site-lock/config.ts`: site-lock config names, enabled state, cookie name, and session age.
- `lib/site-lock/session.ts`: bypassed paths, signed session-token creation, session-token
  validation, and bypass-token validation.
- `lib/site-lock/password.ts`: preview-password hash validation.
- `app/preview-access/page.tsx`: visitor-facing unlock page.
- `app/preview-access/actions.ts`: password-backed unlock action.
- `app/preview-access/admin-unlock/route.ts`: admin preview-cookie issuing route.
- `app/robots.ts` and `app/sitemap.ts`: private-mode crawl posture.

When enabled:

- `proxy.ts` checks the site-lock config.
- Bypassed paths remain reachable, including preview access, auth, contact, Stripe webhook, dev
  login in development, service worker/offline assets, robots, sitemap, and manifest paths.
- A valid `x-site-lock-bypass-token` header can bypass the lock for automation.
- A valid signed site-lock cookie can bypass the lock for preview users.
- Locked API requests return `423`.
- Locked page requests redirect to `/preview-access?next=...`.
- Misconfiguration returns a deterministic `503` path.

Required secret/config names are documented in `docs/runbooks/private-access-gate.md` and
`docs/runbooks/site-lock-operations.md`. Record names only, never values.

Operational rules:

- Use `docs/runbooks/site-lock-operations.md` for hosted lock/unlock operations.
- Use `docs/runbooks/private-access-gate.md` for manual/private-gate verification.
- Password-backed Playwright coverage is required when unlock UX/password behavior changes.
- Rotate the bypass token if it is leaked.

## Dev Auth Bypass

Dev auth bypass exists to make local and CI-style testing possible.

It is constrained by:

- `NODE_ENV === "development"`,
- `DEV_AUTH_BYPASS_ENABLED`,
- local/private host and IP checks in `lib/auth/dev-auth-bypass.ts`,
- token verification for the JSON API route,
- no-store responses in `app/dev/login/route.ts` and `app/api/dev-login/route.ts`.

Do not present dev bypass as a user feature. Do not document raw bypass token values.

## Route And API Classes

Use the route registry before changing any auth-sensitive route:

- `docs/architecture/data-access-authz-cache-contract-registry.md`

Owner-readable classes include:

| Class                      | Meaning                                                                    |
| -------------------------- | -------------------------------------------------------------------------- |
| `public`                   | No user identity required.                                                 |
| `public-optional-identity` | Works anonymously but can attach identity when a valid auth cookie exists. |
| `auth-session`             | Exchanges, clears, or redirects auth/session state.                        |
| `protected-user`           | Requires a signed-in user and owner-scoped data access.                    |
| `entitlement-protected`    | Requires signed-in user plus entitlement/billing relationship.             |
| `admin-viewer`             | Requires admin viewer or stronger role.                                    |
| `admin-editor`             | Requires editor or stronger role.                                          |
| `admin`                    | Requires admin role.                                                       |
| `service-role`             | Uses privileged server-side access and must never expose secrets.          |
| `dev-only`                 | Must fail closed outside local/dev-safe contexts.                          |

Changing a route class is a security-sensitive change. It needs explicit brief scope, negative-path
tests, and support-surface review.

## What Not To Change Casually

Do not casually change:

- `proxy.ts`
- `app/auth/**`
- `app/preview-access/**`
- `app/admin/layout.tsx`
- `app/api/dev-login/route.ts`
- `app/dev/login/route.ts`
- `lib/auth/**`
- `lib/admin/access.ts`
- `lib/admin/server.ts`
- `lib/site-lock/**`
- `lib/supabase/**`
- `docs/architecture/data-access-authz-cache-contract-registry.md`
- private-gate, site-lock, dev-auth, Supabase, or admin allowlist env names
- tests that assert fail-closed auth/admin/private-gate behavior

Changes in these areas need a scoped task brief, negative-path tests, and explicit rollback/support
notes.

## How To Verify Common Questions

| Question                                       | Start here                                                                                          |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| How does sign-in work?                         | `app/auth/sign-in/page.tsx`, `app/auth/sign-in/actions.ts`, `docs/runbooks/auth-account-support.md` |
| How is admin access resolved?                  | `lib/admin/access.ts`, `lib/admin/server.ts`                                                        |
| Which routes require auth/admin/entitlement?   | `docs/architecture/data-access-authz-cache-contract-registry.md`                                    |
| How does site lock decide what is reachable?   | `proxy.ts`, `lib/site-lock/session.ts`                                                              |
| How do preview users unlock a private site?    | `app/preview-access/page.tsx`, `app/preview-access/actions.ts`                                      |
| How do admins get preview access while locked? | `app/preview-access/admin-unlock/route.ts`                                                          |
| How is robots/sitemap affected by site lock?   | `app/robots.ts`, `app/sitemap.ts`, `tests/unit/site-lock-metadata-routes.test.ts`                   |
| How do I test private-gate behavior?           | `tests/e2e/private-access-gate.spec.ts`, `docs/testing-strategy.md`                                 |
| How do I run lock/unlock operations?           | `docs/runbooks/site-lock-operations.md`                                                             |
| How do I debug sign-in delivery failures?      | `docs/runbooks/auth-account-support.md`, `docs/architecture/external-service-contract-matrix.md`    |
| How do I check dev-login safety?               | `lib/auth/dev-auth-bypass.ts`, `app/api/dev-login/route.ts`, `app/dev/login/route.ts`               |

## Current Unknowns

Keep these as `Unknown / To Verify` until a scoped owner or provider check proves them:

- Current Supabase dashboard auth provider settings.
- Current Supabase live RLS policy state, project settings, backups, row counts, and production
  storage usage.
- Current Vercel environment values and scope for auth/site-lock/private-gate config.
- Current live admin allowlist values and whether they match intended operator access.
- Current production site-lock launch posture and when private mode should be changed or removed.
- Current provider-side email delivery limits, mailbox health, and incident-alert delivery health.
- Current GitHub/Vercel deployment aliases and protection settings beyond repo docs/workflows.

## Maintenance Trigger

Update this chapter when any of these change:

- sign-in route behavior, email-code flow, cooldowns, rate limits, or support copy,
- Supabase session helpers, auth-cookie handling, or route-handler auth helpers,
- admin role values, role resolution order, allowlist policy, or `profiles.role` behavior,
- private-gate/site-lock config, `proxy.ts`, bypassed paths, preview cookie behavior, robots/sitemap
  private posture, or lock/unlock runbooks,
- dev auth bypass routes, token rules, local-request checks, or CI auth setup,
- route auth/cache registry classes or any protected/admin/entitlement/service-role route contract,
- passkeys, broad user management, test-user access, or launch/private-mode policy ships,
- Help/Guide, support runbooks, incident alerts, or recovery actions for auth/access change,
- generated `docs/system-state/*` inventories are approved or created,
- the App Knowledge Book structure changes.

Keep updates small. Link to canonical files and runbooks instead of copying volatile inventories.

## Known Future Refresh Points

Refresh this chapter when these planned or likely workstreams change repo-proven behavior:

- Admin user management foundation.
- Admin test-user access controls.
- Real passkeys, Clerk/passkey migration, or account recovery model changes.
- Site-lock/private-gate removal or final launch posture change.
- Owner-verified Supabase auth provider setting changes.
- Admin role source changes or allowlist-to-profile policy changes.
- Route auth/cache registry expansion for new protected, entitlement, admin, service-role, or
  dev-only APIs.
- Auth support copy, sign-in recovery behavior, incident alerts, or Help/Guide access guidance
  changes.

Do not update this chapter from provider assumptions alone. Use repo evidence or owner-provided
control-plane evidence.

## Next Reading Paths

Owner orientation:

- `docs/app-knowledge-book/chapters/01-owner-overview.md`
- `docs/app-knowledge-book/chapters/02-product-map.md`
- `docs/app-knowledge-book/chapters/03-stack-and-runtime.md`

Architecture and access:

- `docs/architecture/data-access-authz-cache-contract-registry.md`
- `docs/architecture/external-service-contract-matrix.md`
- `docs/architecture/secret-config-inventory.md`

Support and operations:

- `docs/runbooks/auth-account-support.md`
- `docs/runbooks/private-access-gate.md`
- `docs/runbooks/site-lock-operations.md`
- `docs/testing-strategy.md`
