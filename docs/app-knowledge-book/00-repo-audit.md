# App Knowledge Book Phase 1 Repo Audit

## Phase 1 Boundary

This is a repository-evidence audit for the future FreeSwimming.org App Knowledge Book. It is not
the full book, and it does not claim production control-plane behavior unless the repository proves
it.

Audit rule:

- Confirmed facts cite repo paths where practical.
- Anything not proven by repo evidence is marked `Unknown / To Verify`.
- No raw env values, tokens, cookies, request IPs, provider responses, personal data, or local secret
  file contents are included.

## Executive Snapshot

FreeSwimming.org is a Next.js App Router application with TypeScript, React, Tailwind, Supabase,
Stripe, Playwright, Vitest, and a mature docs/runbook culture. The repo already has strong
operational contracts for route auth/cache behavior, external services, admin workspace boundaries,
quality gates, release checks, and scorecard-driven task briefs.

Main evidence:

- Stack baseline: `docs/architecture.md`, `package.json`, `.nvmrc`, `next.config.ts`.
- Runtime routes: `app/`, especially `app/api/**/route.ts`.
- Shared domain logic: `lib/`.
- Admin UI and operations: `components/admin/`, `lib/admin/`, `docs/runbooks/`.
- Database schema history: `supabase/migrations/`, `types/database.ts`.
- Test and release gates: `tests/`, `playwright.config.ts`, `vitest.config.ts`, `scripts/run-verify-pre-pr.sh`,
  `scripts/run-verify-pre-merge.sh`, `.github/workflows/`.
- Platform quality contract: `docs/quality/platform-10-10-scorecard.md`.

## Stack And Runtime

Confirmed from `package.json` and `docs/architecture.md`:

- Framework: Next.js `16.2.4`, App Router under `app/`.
- React: `19.2.5`.
- TypeScript: `^6`, strict compile expected through `npm run typecheck`.
- Styling: Tailwind CSS `^4.2.4`, PostCSS via `@tailwindcss/postcss`, global styles in `app/globals.css`.
- Testing: Vitest, Testing Library, Playwright, Axe for browser a11y checks.
- Node/npm: Node `24.x`, npm `11.11.0`.
- External packages with product impact include `@supabase/ssr`, `@supabase/supabase-js`, `stripe`,
  `nodemailer`, `qrcode`, `html-to-image`, and `lucide-react`.

Runtime boundaries:

- Pages and layouts live under `app/**/page.tsx` and `app/**/layout.tsx`.
- API route handlers live under `app/api/**/route.ts`.
- Shared UI lives under `components/`, with reusable primitives under `components/ui/`.
- Domain/service logic lives under `lib/`.
- Generated Supabase type snapshot lives in `types/database.ts`.

`Unknown / To Verify`:

- Production deployment settings, Vercel project settings, provider dashboards, and Supabase project
  settings are not fully knowable from the repo alone.

## Route And IA Inventory

Public and marketing routes visible in `app/` include:

- `/`: `app/page.tsx`.
- `/course`: `app/course/page.tsx`, course data in `app/course/courseData.ts`.
- `/programs`: `app/programs/page.tsx`.
- `/analysis`: `app/analysis/page.tsx`.
- `/our-method`: `app/our-method/page.tsx`.
- `/contact`: `app/contact/page.tsx`.
- `/privacy`: `app/privacy/page.tsx`.
- `/cookies`: `app/cookies/page.tsx`.
- `/preview-access`: `app/preview-access/page.tsx`.

Signed-in user/product areas include:

- `/my-library`: `app/my-library/page.tsx`.
- `/my-library/workouts`: workout builder and saved swim sessions.
- `/my-library/dryland`: dryland sessions and micro plans.
- `/my-library/habits`: habit tracking.
- `/my-library/programs`: program builder/export flows.
- `/my-library/profile`, `/my-library/training`, `/my-library/goals`, `/my-library/security`.

Admin route:

- `/admin`: `app/admin/page.tsx`, layout guard in `app/admin/layout.tsx`.
- Admin tabs are defined in `lib/admin/admin-workspace.ts` and rendered in
  `components/admin/AdminWorkspace.tsx`.
- Active admin tabs are `content`, `qr-links`, `commerce`, `operations`, `email-templates`,
  `messages`, `notes`, `categories`, and `help`.

Route redirect evidence:

- `next.config.ts` redirects legacy `/about` to canonical `/our-method`.
- `/our-method` is the maintained method page in `app/our-method/page.tsx`; `/about` is not a
  separate page surface.

## API Surface Inventory

The route registry says there are `69` route handlers under `app/**/route.ts` in
`docs/architecture/data-access-authz-cache-contract-registry.md`.

Core public and optional-identity API routes include:

- `app/api/contact/route.ts`: contact, analysis, goals coaching, preview access notify intake.
- `app/api/analytics/event/route.ts`: typed analytics event intake.
- `app/api/checkout/session/route.ts`: Stripe Checkout session creation.
- `app/api/download/resend/route.ts`: download/access link resend.
- `app/api/runtime/flags/route.ts`: runtime flag visibility.
- `app/go/v/[slug]/route.ts`: QR redirect lookup.

Protected user routes include:

- Course/guide progress: `app/api/progress/course/route.ts`, `app/api/progress/guide/route.ts`.
- Profile/training/goals: `app/api/my-library/profile/**`, `app/api/my-library/training-context/**`,
  `app/api/goals/**`.
- Workouts, programs, dryland, habits: `app/api/my-library/workouts/**`,
  `app/api/my-library/programs/**`, `app/api/my-library/dryland/**`,
  `app/api/my-library/habits/**`.
- Data rights: `app/api/user/export/route.ts`, `app/api/user/delete/route.ts`.

Admin routes include:

- Content: `app/api/admin/content/**`.
- Notes and attachments: `app/api/admin/notes/**`.
- QR links: `app/api/admin/qr-links/**`.
- Products/commerce: `app/api/admin/products/**`.
- Email templates: `app/api/admin/email-templates/**`.
- Messages: `app/api/admin/messages/**`.
- Operations flags: `app/api/admin/operations/flags/**`.
- Categories: `app/api/admin/categories/**`.

## Data, Supabase, And Storage

Evidence:

- Supabase environment helpers: `lib/supabase/env.ts`, `lib/supabase/browser-env.ts`.
- Server/client helpers: `lib/supabase/server.ts`, `lib/supabase/route-handler.ts`,
  `lib/supabase/admin.ts`, `lib/supabase/browser.ts`.
- Egress safety guard: `lib/supabase/egress-guard.ts`, `scripts/assert-supabase-egress-safe.mjs`,
  `scripts/lib/supabase-egress-guard.mjs`.
- Migrations: `supabase/migrations/*.sql`.
- Generated DB types: `types/database.ts`.
- Migration drift gate: `scripts/assert-supabase-migration-drift.mjs`.

Database families visible from migrations and architecture docs include:

- Identity/profile and roles: `profiles`, admin role migration in
  `supabase/migrations/20260218230000_admin_profiles_role.sql`.
- Commerce: `products`, `entitlements`, `download_links`.
- Course and guide progress: `course_progress`, `guide_progress`, `guide_session_progress`.
- Admin content, revisions, categories, notes, note attachments/links.
- QR redirect links.
- Email templates and revisions.
- Training context, athlete profile, personal records, training metrics/preferences.
- Workouts, programs, dryland sessions, dryland micro plans, habits.
- Admin messages and delivery attempts.

Data-boundary contracts:

- `docs/architecture/data-access-authz-cache-contract-registry.md` is the canonical route-level
  contract for auth helper choice, service-role usage, cache behavior, and expected failure states.
- `docs/architecture/external-service-contract-matrix.md` is the canonical provider/service contract.

`Unknown / To Verify`:

- Current production row counts, RLS policy state in the live Supabase project, backups, and
  provider-side settings are not verified by this Phase 1 repo audit.

## Auth, Access Control, And Private Gate

Auth evidence:

- Supabase auth helpers: `lib/supabase/server.ts`, `lib/supabase/route-handler.ts`,
  `lib/supabase/auth-cookie.ts`.
- Admin role resolution: `lib/admin/access.ts`.
- Admin layout gate: `app/admin/layout.tsx`.
- Auth sign-in: `app/auth/sign-in/page.tsx`, `app/auth/sign-in/actions.ts`,
  `lib/auth/email-otp.ts`, `lib/auth/sign-in-request.ts`, `lib/auth/magic-link-cooldown.ts`,
  `lib/auth/sign-in-ui-state.ts`.
- Dev auth bypass: `lib/auth/dev-auth-bypass.ts`, `app/api/dev-login/route.ts`,
  `app/dev/login/route.ts`.
- Preview/site lock: `lib/site-lock/config.ts`, `lib/site-lock/password.ts`,
  `lib/site-lock/session.ts`, `app/preview-access/**`.

Access-control model:

- Admin role values are `admin`, `editor`, and `viewer` in `lib/admin/access.ts`.
- Admin role resolution reads profile role, app metadata, and `ADMIN_EMAIL_ALLOWLIST` fallback.
- Route classes and negative-path expectations are documented in
  `docs/architecture/data-access-authz-cache-contract-registry.md`.
- Private gate config includes `SITE_LOCK_ENABLED`, `SITE_LOCK_MODE`, password hash, bypass token,
  cookie name, and session age in `lib/site-lock/config.ts`.

Security notes:

- Host/origin validation for contact intake parses origins in `app/api/contact/route.ts`.
- QR redirect destination validation is governed by route code and
  `docs/runbooks/qr-redirect-operations.md`.
- The route registry explicitly expects `401`/`403` fail-closed behavior on protected/admin paths.

`Unknown / To Verify`:

- Current production allowlist membership, passkey provider state, and actual site-lock setting are
  control-plane facts and are not asserted here.

## Commerce, Entitlement, Finance, And Reporting

Commerce evidence:

- Catalog: `lib/commerce/catalog.ts`, `lib/commerce/catalog-server.ts`,
  `lib/commerce/catalog-overrides.ts`.
- Checkout: `app/api/checkout/session/route.ts`, `lib/commerce/checkout.ts`.
- Entitlements: `lib/commerce/entitlements.ts`.
- Billing portal: `app/api/portal/route.ts`, `lib/commerce/portal.ts`.
- Stripe server helpers: `lib/stripe/server.ts`, `lib/stripe/webhook-discount.ts`.
- Webhook: `app/api/stripe/webhook/route.ts`.
- Download/access recovery: `app/api/download/resend/route.ts`, `lib/commerce/download-resend.ts`.
- Reconciliation: `scripts/reconcile-finance-entitlements.mjs`,
  `tests/unit/finance-reconciliation.test.ts`.
- Admin commerce UI: `components/admin/AdminCommerceManager.tsx`.
- Finance baseline: `docs/checklists/finance-reporting-baseline.md`.

Finance-relevant invariants visible in code/docs:

- Checkout metadata includes product and user identifiers in `lib/commerce/checkout.ts`.
- Stripe entitlements are upserted by checkout session ID in `lib/commerce/entitlements.ts`.
- Billing portal routes must not accept browser-supplied customer IDs; this is documented in the
  external service matrix.
- Finance/reporting readiness is treated as an operational category in the platform scorecard.

`Unknown / To Verify`:

- Current Stripe products/prices, portal configuration, live invoice state, refund workflow, and
  payout reporting are provider/control-plane facts.

## Contact, Messages, Email, And Incident Delivery

Contact and message evidence:

- Public contact route: `app/api/contact/route.ts`.
- Contact storage helpers: `lib/admin/contact-intake.ts`.
- Admin message domain: `lib/admin/messages.ts`.
- Message delivery adapter: `lib/admin/message-delivery.ts`.
- Admin message UI: `components/admin/AdminMessagesManager.tsx`.
- Admin message runbook: `docs/runbooks/admin-message-inbox.md`.
- Email template governance: `components/admin/AdminEmailTemplatesManager.tsx`,
  `lib/admin/email-templates.ts`, `docs/runbooks/admin-email-template-governance.md`.
- Incident alerts: `lib/admin/incidents.ts`, `docs/runbooks/core-flow-incident-response.md`.

Confirmed behavior from repo:

- `POST /api/contact` uses origin/content/rate/spam validation, stores inbound message state, and
  records delivery diagnostics.
- Upstash Redis REST is an optional rate-limit backing store with in-memory fallback in public
  abuse-control routes.
- Message delivery provider keys and statuses are typed in `lib/admin/message-delivery.ts`.
- Sensitive provider errors are redacted by adapter rules.

`Unknown / To Verify`:

- Actual provider selection, mailbox settings, live delivery health, and control-plane secret
  sensitivity labels are not asserted here.

## Analytics And KPI Observability

Evidence:

- Event taxonomy: `lib/analytics/events.ts`.
- Client tracker components: `components/analytics/TrackEventOnMount.tsx`,
  `components/analytics/TrackedLink.tsx`, `components/analytics/TrackCheckoutCancel.tsx`.
- API intake route: `app/api/analytics/event/route.ts`.
- Unit tests: `tests/unit/analytics-events.test.ts`, `tests/unit/analytics-event-route.test.ts`.

Confirmed from code:

- Event names are typed in `ANALYTICS_EVENT_NAMES`.
- Payload sanitizer redacts keys matching email, token, secret, password, cookie, or authorization.
- Complex values are dropped; strings are bounded.
- The current implementation logs a structured console record; no third-party analytics provider is
  selected in repo evidence.

`Unknown / To Verify`:

- Production dashboarding, log retention, and KPI review cadence are not verified from repo evidence.

## SEO, Crawlability, And AI Discoverability

SEO/crawl evidence:

- Metadata base, manifest, title template, description, icons, Open Graph, Twitter card:
  `app/layout.tsx`.
- Sitemap: `app/sitemap.ts`.
- Robots: `app/robots.ts`.
- Manifest: `app/manifest.ts`.
- Private gate affects sitemap/robots through `isSiteLockEnabled()`.
- Route metadata tests: `tests/unit/site-lock-metadata-routes.test.ts`, `tests/e2e/sitemap.spec.ts`.

Confirmed from repo:

- When site lock is enabled, sitemap returns an empty list and robots disallows `/`.
- When site lock is disabled, sitemap includes public core routes.
- Public route metadata is centralized at root layout level, with some route-specific pages adding
  their own visible content.

AI discoverability:

- There is no dedicated structured-data system visible in the repo audit.
- Future App Knowledge Book docs can improve repo-internal human/AI readability if they preserve
  exact path references, stable headings, and `Unknown / To Verify` boundaries.

`Unknown / To Verify`:

- Search Console, crawler behavior, public indexing state, and structured-data needs are external to
  this repo audit.

## i18n Operational Readiness

Evidence:

- Root HTML language is `en` in `app/layout.tsx`.
- i18n decision docs exist at `docs/decisions/locale-routing-strategy.md`,
  `docs/decisions/locale-content-fallback-matrix.md`, and
  `docs/checklists/i18n-operational-readiness.md`.
- Incident overlay exists in `docs/runbooks/core-flow-incident-response.md`.

Confirmed:

- No locale route tree is visible under `app/[locale]` or equivalent in this audit.
- i18n is treated as operational readiness and future scale concern rather than implemented routing.

`Unknown / To Verify`:

- Full hard-coded copy inventory, future translation workflow, localized metadata model, and
  editorial owner process require a later dedicated audit or implementation slice.

## Performance, Caching, And Build Gates

Performance evidence:

- Budget script: `scripts/run-perf-budget-check.mjs`.
- Trend script: `scripts/perf-budget-trend-status.mjs`.
- Testing strategy: `docs/testing-strategy.md`.
- CI/nightly references: `.github/workflows/ci.yml`, `.github/workflows/nightly-e2e.yml`.
- Current route baseline in `docs/testing-strategy.md`: core performance routes include `/`,
  `/plans`, `/course`, and `/my-library`.
- Current ratchet note in `docs/testing-strategy.md`: CSS transfer default budget was tightened to
  `150kb` on `2026-06-25`.

Caching evidence:

- Route registry cache contract: `docs/architecture/data-access-authz-cache-contract-registry.md`.
- Public/contact route uses `export const dynamic = "force-dynamic"` and JSON `no-store` helpers in
  `app/api/contact/route.ts`.
- Playwright readiness uses `/manifest.webmanifest` in `playwright.config.ts`.
- Next output directory can be isolated through `NEXT_DIST_DIR` in `next.config.ts`.

`Unknown / To Verify`:

- Actual production CWV field data and CDN/cache-control behavior at Vercel edge are not confirmed by
  this repo-only audit.

## Testing, CI, And Verification

Testing evidence:

- Unit/component tests: `tests/unit/**/*.test.ts` and `tests/unit/**/*.test.tsx`.
- Browser tests: `tests/e2e/**/*.spec.ts`.
- Playwright matrix: `playwright.config.ts`.
- Vitest config: `vitest.config.ts`.
- CI workflows: `.github/workflows/ci.yml`, `.github/workflows/nightly-e2e.yml`,
  `.github/workflows/admin-e2e.yml`, `.github/workflows/codeql.yml`,
  `.github/workflows/pr-size.yml`.
- Verification scripts: `scripts/run-verify-open.sh`, `scripts/run-verify-docs-only.sh`,
  `scripts/run-verify-pre-pr.sh`, `scripts/run-verify-pre-merge.sh`.

Package scripts:

- `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build`,
  `npm run test:perf:budgets`, `npm run test:e2e`.
- Docs and governance: `npm run lint:briefs`, `npm run lint:briefs:all`,
  `npm run lint:quality-gates`, `npm run verify:docs-only`.
- Release gates: `npm run verify:pre-pr`, `npm run verify:pre-merge`.

Docs-only rule:

- `docs/testing-strategy.md` states that `verify:pre-pr` and `verify:pre-merge` may auto-select a
  docs-only lane for pure docs/governance diffs.

## Admin Workflow And Support Surfaces

Admin evidence:

- UI shell: `components/admin/AdminWorkspace.tsx`.
- Tab contracts: `lib/admin/admin-workspace.ts`.
- Help/Guide: `components/admin/AdminHelpCenter.tsx`.
- Operations: `components/admin/AdminOperationsManager.tsx`.
- Notes/recovery: `components/admin/AdminNotesManager.tsx`,
  `docs/runbooks/admin-notes-recovery.md`.
- Content parity and triage: `docs/runbooks/admin-content-parity-triage.md`.
- Message inbox: `docs/runbooks/admin-message-inbox.md`.

Support/runbook evidence includes:

- Auth/account support: `docs/runbooks/auth-account-support.md`.
- GDPR data rights: `docs/runbooks/gdpr-data-rights.md`.
- Private access gate: `docs/runbooks/private-access-gate.md`.
- Core flow incident response: `docs/runbooks/core-flow-incident-response.md`.
- Supabase egress response: `docs/runbooks/supabase-egress-response.md`.
- Environment/secret parity: `docs/runbooks/environment-config-and-secret-parity.md`.
- Route/label/support sweep: `docs/runbooks/route-label-support-surface-impact-sweep.md`.
- UI debugging and high-cost bug log: `docs/runbooks/ui-debug-hypothesis-and-handoff.md`,
  `docs/runbooks/high-cost-debug-log.md`.

## Environment Variable Names Observed

This inventory lists names visible in code/docs. It does not include values.

Core app and Supabase:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FS_SUPABASE_ENV`
- `FS_ALLOW_PROD_SUPABASE`
- `FS_PRODUCTION_SUPABASE_URL`
- `VERCEL_URL`
- `VERCEL_ENV`

Admin, auth, and site lock:

- `ADMIN_EMAIL_ALLOWLIST`
- `DEV_AUTH_BYPASS_EMAIL`
- `DEV_AUTH_BYPASS_PASSWORD`
- `DEV_AUTH_BYPASS_TOKEN`
- `SITE_LOCK_ENABLED`
- `SITE_LOCK_MODE`
- `SITE_LOCK_PASSWORD_HASH`
- `SITE_LOCK_BYPASS_TOKEN`
- `SITE_LOCK_COOKIE_NAME`
- `SITE_LOCK_SESSION_MAX_AGE_SECONDS`

Contact, delivery, incident alerts, and rate limit:

- `CONTACT_ALLOWED_ORIGINS`
- `CONTACT_TO_EMAIL`
- `CONTACT_FROM_EMAIL`
- `CONTACT_INTAKE_STORAGE`
- `CONTACT_INTAKE_LOCAL_FILE`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `MESSAGE_DELIVERY_PROVIDER`
- `MESSAGE_DELIVERY_TIMEOUT_MS`
- `MESSAGE_DELIVERY_RESEND_API_KEY`
- `MESSAGE_DELIVERY_RESEND_API_URL`
- `MESSAGE_DELIVERY_SMTP_HOST`
- `MESSAGE_DELIVERY_SMTP_PORT`
- `MESSAGE_DELIVERY_SMTP_SECURE`
- `MESSAGE_DELIVERY_SMTP_USER`
- `MESSAGE_DELIVERY_SMTP_PASSWORD`
- `MESSAGE_DELIVERY_MESSAGE_ID_DOMAIN`
- `MESSAGE_DELIVERY_FROM_EMAIL`
- `MESSAGE_DELIVERY_REPLY_TO_EMAIL`
- `RESEND_API_KEY`
- `INCIDENT_ALERTS_ENABLED`
- `INCIDENT_ALERT_TO_EMAIL`
- `INCIDENT_ALERT_DEDUPE_WINDOW_SECONDS`

Commerce and QR:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `QR_REDIRECT_ALLOWED_HOSTS`

Testing, verification, and CI:

- `CI`
- `NEXT_DIST_DIR`
- `PW_PORT`
- `PW_WORKERS`
- `PW_OUTPUT_DIR`
- `PW_REUSE_EXISTING_SERVER`
- `PW_NEXT_DEV_BUNDLER`
- `PW_NEXT_DEV_MAX_OLD_SPACE_SIZE_MB`
- `PW_SITE_LOCK_PASSWORD`
- `PW_SITE_LOCK_BYPASS_TOKEN`
- `PW_SITE_LOCK_USE_PASSWORD`
- `SCREENSHOT_DIR`
- `VERIFY_FORCE_FULL`
- `VERIFICATION_BASE_REF`
- `BRIEF_LINT_BASE_REF`
- `GITHUB_BASE_REF`
- `GITHUB_EVENT_NAME`
- `GITHUB_EVENT_PATH`
- `PR_BODY_BASE_REF`
- `PERF_BUDGET_*`

Vercel/GitHub workflow:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `PREVIEW_URL`

`Unknown / To Verify`:

- Whether every variable above is configured in every deployed environment.
- Whether provider dashboard settings match repo expectations.

## Main Risks And Technical Debt

Repo-evidenced risks:

- The app is broad: admin, commerce, workouts, dryland, habits, programs, messages, QR, auth,
  private gate, performance, and operations all have active contracts.
- Full App Knowledge Book generation could become stale quickly unless split into stable manual docs
  and generated system-state inventories.
- Route/label/support changes have high fallout risk; the repo already has a dedicated sweep
  runbook for this.
- Control-plane facts are easy to overstate; docs must preserve `Unknown / To Verify`.
- Legacy `/about` redirects to `/our-method`, so public method IA has one maintained page surface.

Phase 1 recommendation:

- Keep the current slice to the seven planned Markdown files.
- Do not add scripts or generated inventories before owner review.
- Use this audit to decide Phase 2 structure, not to write the full book now.
