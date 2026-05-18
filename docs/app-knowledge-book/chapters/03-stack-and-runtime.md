# Stack And Runtime

## What This Is

This chapter is stable explanatory documentation for the FreeSwimming.org owner. It explains the
technical foundation that the app is built on, where runtime and release rules live, and what should
be checked before changing stack, tooling, config, or verification behavior.

It is not a generated dependency inventory. It intentionally links to canonical files instead of
copying every package, script, route, or environment variable.

Evidence boundary:

- Confirmed repo facts cite exact paths.
- Provider dashboards, live deployment settings, environment values, live data, and production
  control-plane state are `Unknown / To Verify` unless repo evidence or owner-provided evidence
  proves them.
- This chapter does not include secret values, raw env values, cookies, tokens, request IPs, provider
  responses, personal data, or user free-text content.

Evidence date:

- Reviewed on `2026-05-16` against `main@e8ad290`.
- External/control-plane facts remain `Unknown / To Verify` unless explicitly marked otherwise.

## Why The Stack Matters

The stack is the set of tools and runtime rules that make every product feature possible. For the
owner, the important question is not only "what technology is used?" but also:

- which files define the runtime contract,
- which changes require full product verification,
- which settings are safe to document by name only,
- which facts live outside the repo and must be checked in provider dashboards,
- which commands prove a branch is ready for PR or merge.

Use this chapter before changing dependencies, Node/npm versions, Next.js config, CI workflows,
verification scripts, environment variables, private-gate behavior, or provider integration
boundaries.

## Stack Snapshot

Current repo-proven baseline:

| Area                | Current repo evidence                                                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework           | Next.js `16.2.4`, App Router under `app/`; see `package.json` and `docs/architecture.md`.                                                     |
| React               | React `19.2.5` and React DOM `19.2.5`; see `package.json`.                                                                                    |
| TypeScript          | TypeScript `^6`, strict compile via `npm run typecheck`; see `package.json` and `tsconfig.json`.                                              |
| Styling             | Tailwind CSS `^4.2.4`, PostCSS via `@tailwindcss/postcss`; see `package.json`, `postcss.config.js`, and `tailwind.config.js`.                 |
| Unit/component test | Vitest and Testing Library; see `package.json`, `tests/unit/`, and `docs/testing-strategy.md`.                                                |
| Browser test        | Playwright with mobile, tablet, desktop Chromium, WebKit, and Firefox projects; see `playwright.config.ts`.                                   |
| Accessibility test  | Axe is available through `@axe-core/playwright`; see `package.json` and `docs/testing-strategy.md`.                                           |
| Data/auth           | Supabase client/server helpers and migrations; see `lib/supabase/`, `supabase/migrations/`, and `types/database.ts`.                          |
| Payments            | Stripe server, checkout, portal, webhook, and entitlement helpers; see `lib/stripe/`, `lib/commerce/`, and `app/api/stripe/webhook/route.ts`. |
| Email/contact       | Contact intake, admin messages, and delivery adapters; see `app/api/contact/route.ts` and `lib/admin/message-delivery.ts`.                    |
| Package manager     | npm `11.11.0`; see `package.json`.                                                                                                            |
| Node runtime        | Node `24`; see `.nvmrc` and `package.json` `engines.node`.                                                                                    |

This snapshot is intentionally short. Use `package.json` for exact package versions and
`docs/app-knowledge-book/00-repo-audit.md` for a broader audit.

## Runtime Contract

The repo owns the local and CI runtime contract through:

- `.nvmrc`: Node major version.
- `package.json`: npm package-manager version, Node engine, dependencies, scripts, and validation
  commands.
- `next.config.ts`: Next.js runtime/build config, optional `NEXT_DIST_DIR`, Turbopack root, and the
  legacy `/about` to `/our-method` redirect.
- `tsconfig.json`: TypeScript strictness, module resolution, JSX mode, alias imports, and generated
  Next type paths.
- `eslint.config.mjs`: Next core-web-vitals and TypeScript lint rules plus ignored generated output
  directories.
- `playwright.config.ts`: browser matrix, isolated local port, isolated Next output directory,
  site-lock test defaults, dummy Supabase defaults for local verification, and artifact location.
- `.github/workflows/`: CI, preview deploy, size check, CodeQL, site-lock operations, admin E2E,
  nightly E2E, and monthly maintenance workflows.

Owner meaning:

- A change to these files can affect every feature, even if no visible UI changes.
- Stack/tooling changes should usually be their own brief, with full-lane verification unless the
  diff is pure documentation.
- Runtime config changes in Vercel or provider dashboards are not proven by the repo alone.

## App Router And Code Ownership

High-level ownership:

- Pages and layouts live under `app/**/page.tsx` and `app/**/layout.tsx`.
- API route handlers live under `app/api/**/route.ts`.
- Shared UI lives under `components/`.
- Reusable primitives live under `components/ui/`.
- Domain and service logic lives under `lib/`.
- Supabase schema history lives under `supabase/migrations/`.
- Generated database type snapshot lives in `types/database.ts`.
- Unit tests live under `tests/unit/`.
- Browser tests live under `tests/e2e/`.

Architecture rules:

- `docs/architecture.md` is the owner-readable starting point for stack architecture.
- `docs/architecture/data-access-authz-cache-contract-registry.md` is the route-level contract for
  auth helper choice, service-role usage, cache mode, and expected failure states.
- `docs/architecture/external-service-contract-matrix.md` is the provider/service contract for
  Supabase, Stripe, email, rate limiting, incident alerts, finance, and rollback behavior.
- `docs/architecture/admin-workspace-module-contracts.md` owns admin module boundary rules.

When adding a feature, the active brief should identify the impacted stack surfaces before code
changes begin: React/Next, TypeScript contracts, Supabase/data, external services, UI primitives,
tests, and release/rollback behavior.

## Configuration And Environment Rules

Environment variable names and families are documented in:

- `docs/architecture/secret-config-inventory.md`
- `docs/runbooks/environment-config-and-secret-parity.md`
- `docs/architecture/external-service-contract-matrix.md`

Owner-safe rules:

- Repo docs may name environment variables, but must not include values.
- `.env.local` is local-only and must not be quoted into docs, PRs, screenshots, or chat.
- Vercel Preview and Production environment values are control-plane facts, not repo facts.
- GitHub Actions secrets are CI-canonical and must not be mirrored elsewhere unless the relevant
  family explicitly says so.
- Public runtime variables can still affect app behavior, so they should be changed through a brief
  when product behavior or security posture changes.

Important config families:

- App URL and callback identity: `NEXT_PUBLIC_APP_URL`, `VERCEL_URL`.
- Supabase app access and egress safety: `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `FS_SUPABASE_ENV`,
  `FS_ALLOW_PROD_SUPABASE`, `FS_PRODUCTION_SUPABASE_URL`.
- Stripe commerce: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and server-side price IDs.
- Contact, message delivery, incident alerts, and rate limits: see
  `docs/architecture/secret-config-inventory.md`.
- Private gate and preview access: `SITE_LOCK_*` variables.
- Local/CI Playwright helpers: `PW_*`, `NEXT_DIST_DIR`, and local test Supabase defaults.

Unknown / To Verify:

- Current Vercel variable values, environment scopes, deployment aliases, and provider dashboard
  settings are not knowable from repo evidence alone.

## Build, Verification, And CI

Primary local gates:

- `npm run verify:pre-pr`: branch-current check, migration drift check, scope detection, then
  docs-only or full public verification.
- `npm run verify:pre-merge`: branch-current check, migration drift check, docs-only reuse/fresh
  verification or full public verification, plus private-gate handling when `SITE_LOCK_ENABLED=1`.
- `npm run verify:docs-only`: docs-only scope assertion plus docs/governance lint checks.
- `npm run verify:public`: full public-mode verification.
- `npm run build`: production Next build with Supabase egress guard and build-artifact sanitation.
- `npm run test:e2e:*`: Playwright flows for smoke, private gate, admin, security, mobile, and
  extended matrix.

CI evidence:

- `.github/workflows/ci.yml` uses `.nvmrc` through `actions/setup-node`.
- CI resolves whether the PR is docs-only or full-lane using `scripts/ci-verification-plan.mjs`.
- Docs-only PRs skip runtime smoke/browser work where appropriate but still run docs-only
  verification.
- Non-docs PRs install dependencies, install Playwright browsers, run smoke gates, run verification,
  and run a webpack production build check.
- `.github/workflows/vercel-preview.yml` owns preview deployment workflow.
- `.github/workflows/pr-size.yml`, `.github/workflows/codeql.yml`, and other workflows provide
  adjacent release safety.

Owner meaning:

- For pure docs/governance diffs, `verify:pre-pr` and `verify:pre-merge` may use the docs-only lane.
- Any diff touching runtime code, scripts, tests, configs, workflows, package files, or generated
  types should be treated as full-lane unless the active brief explicitly proves otherwise.
- A green gate is evidence, not a substitute for scope review.

## Performance, Cache, And Private Gate Boundaries

Performance:

- Current performance targets and ratchet policy live in `docs/testing-strategy.md` and
  `docs/quality/platform-10-10-scorecard.md`.
- Budget checks are run through `npm run test:perf:budgets` and are included in full verification.
- Public route budgets currently focus on core routes such as `/`, `/course`, `/my-library`, and
  `/plans`.

Cache and freshness:

- Route-level cache/auth/service-role contracts are tracked in
  `docs/architecture/data-access-authz-cache-contract-registry.md`.
- Do not infer cache behavior from route names alone. Check the registry and the route handler.

Private gate:

- Private/site-lock behavior is documented in `docs/runbooks/private-access-gate.md`.
- Runtime config lives under `lib/site-lock/` and `app/preview-access/`.
- Private-gate tests can run in bypass-token or password form-unlock mode; see
  `docs/testing-strategy.md` and `scripts/run-verify-pre-merge.sh`.

Unknown / To Verify:

- Current live private-gate enablement, Vercel environment scope, and production control-plane
  settings require owner/provider verification.

## External Service Boundary

Repo-proven integration surfaces:

- Supabase: `lib/supabase/`, `supabase/migrations/`, `types/database.ts`,
  `scripts/assert-supabase-egress-safe.mjs`.
- Stripe: `lib/stripe/`, `lib/commerce/`, `app/api/checkout/session/route.ts`,
  `app/api/stripe/webhook/route.ts`, `scripts/reconcile-finance-entitlements.mjs`.
- Email/contact/support: `app/api/contact/route.ts`, `lib/admin/contact-intake.ts`,
  `lib/admin/messages.ts`, `lib/admin/message-delivery.ts`.
- Upstash/rate limiting: documented in `docs/architecture/secret-config-inventory.md` and
  `docs/runbooks/environment-config-and-secret-parity.md`.
- Vercel/GitHub CI: `.github/workflows/`, `docs/runbooks/vercel-preview.md`,
  `docs/runbooks/branch-protection.md`.

Provider-canonical facts stay outside the repo:

- current Supabase project settings, RLS state, backups, auth provider settings, row counts, and
  storage usage,
- current Stripe products, prices, webhook endpoints, portal settings, refunds, payouts, and invoice
  state,
- current Vercel project settings, environment scopes, aliases, deployments, and preview/production
  differences,
- current email provider health and mailbox delivery state,
- current Upstash database isolation, token health, and usage limits,
- current GitHub branch protection beyond repo docs/workflows.

Use `Unknown / To Verify` until those facts are checked in the relevant control plane or explicitly
provided by the owner.

## Dependency And Tooling Changes

Do not treat dependency changes as casual maintenance.

Before changing package versions, package manager, Node version, Next config, Playwright config,
ESLint config, TypeScript config, GitHub Actions, or verification scripts:

- create or refresh a scoped brief,
- identify affected stack surfaces,
- check current maintenance/runbook guidance,
- decide whether the diff is docs-only or full-lane,
- run the appropriate verification gates,
- record rollback or revert path.

Useful maintenance references:

- `docs/runbooks/maintenance-cadence.md`
- `docs/runbooks/test-gate-efficiency-and-warning-triage.md`
- `docs/runbooks/codex-sandbox-approval-cadence.md`
- `docs/checklists/release-pr-checklist.md`
- `docs/branch-protection.md`
- `docs/runbooks/branch-protection.md`

## What Not To Change Casually

Do not casually change:

- `.nvmrc`, `package.json` `engines`, `packageManager`, dependency versions, or lockfile.
- `next.config.ts`, especially redirects, build output behavior, or dist directory behavior.
- `tsconfig.json`, path aliases, strictness, or generated type includes.
- `eslint.config.mjs`, `playwright.config.ts`, or test matrix defaults.
- `.github/workflows/`, branch protection assumptions, verification scripts, or PR automation.
- Supabase migrations, RLS, service-role usage, generated database types, or egress guardrails.
- Stripe checkout/webhook/entitlement code or finance reconciliation scripts.
- Site-lock/private-gate env behavior, cookies, bypass tokens, or password flow.
- Environment variable names, secret/config families, or provider dashboard settings.
- Generated inventory tooling or `docs/system-state/*` outputs before owner approval.

## How To Verify Common Questions

| Question                                            | Start here                                                                                                     |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| What stack versions does the repo declare?          | `package.json`, `.nvmrc`, `docs/architecture.md`                                                               |
| What runtime files are safe to inspect first?       | `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `playwright.config.ts`                                 |
| Which command should run before PR?                 | `npm run verify:pre-pr`, `scripts/run-verify-pre-pr.sh`                                                        |
| Which command should run before merge readiness?    | `npm run verify:pre-merge`, `scripts/run-verify-pre-merge.sh`                                                  |
| Why did a docs-only PR skip browser tests?          | `scripts/ci-verification-plan.mjs`, `scripts/verification-scope.mjs`, `docs/testing-strategy.md`               |
| How are route auth/cache rules tracked?             | `docs/architecture/data-access-authz-cache-contract-registry.md`                                               |
| How are provider rules tracked?                     | `docs/architecture/external-service-contract-matrix.md`                                                        |
| Which env variables exist and where do they belong? | `docs/architecture/secret-config-inventory.md`, `docs/runbooks/environment-config-and-secret-parity.md`        |
| How do I debug local Playwright behavior?           | `playwright.config.ts`, `docs/testing-strategy.md`, `docs/runbooks/test-gate-efficiency-and-warning-triage.md` |
| How do I handle private-gate issues?                | `docs/runbooks/private-access-gate.md`, `docs/runbooks/auth-account-support.md`                                |
| How do I handle release or CI failure?              | `docs/runbooks/ci-unblock.md`, `docs/checklists/release-pr-checklist.md`                                       |
| How do I handle post-merge sync?                    | `docs/runbooks/post-merge-local-sync.md`, `docs/runbooks/pr-flow-and-chat-handoff.md`                          |

## Current Unknowns

Unknown / To Verify:

- Current Vercel project settings, aliases, env scopes, preview/production differences, and live
  deployment configuration.
- Current Supabase project settings, RLS state, backups, auth provider settings, row counts, storage
  usage, and production migration state.
- Current Stripe dashboard products, prices, webhook endpoints, portal settings, refund workflow,
  invoice state, payout reporting, and reconciliation status.
- Current One.com/SMTP/Resend configuration and mailbox delivery health.
- Current Upstash database isolation, token health, and production traffic limits.
- Current GitHub branch protection and required-check configuration beyond repo docs/workflows.

## Maintenance Trigger

Update this chapter when any of these change:

- Node, npm, package manager, dependency versions, or lockfile policy.
- Next.js, React, TypeScript, Tailwind, ESLint, Playwright, Vitest, or Testing Library setup.
- `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `playwright.config.ts`, or workflow files.
- Verification gates, docs-only/full-lane selection, CI, branch protection, PR automation, release
  flow, or rollback flow.
- Supabase, Stripe, email, Upstash, Vercel, or GitHub provider boundaries.
- Secret/config families, environment placement rules, or private-gate behavior.
- Generated `docs/system-state/*` inventories are approved or created.
- The App Knowledge Book structure changes.

Keep updates small. Link to canonical files and runbooks instead of copying generated inventories.

## Known Future Refresh Points

Refresh this chapter when these planned or likely workstreams change repo-proven behavior:

- Node, Next.js, React, TypeScript, Tailwind, ESLint, Playwright, Vitest, or dependency policy
  changes.
- Verification lanes, branch protection, CI checks, PR automation, or post-merge closeout behavior
  changes.
- Supabase, Stripe, email, Upstash, Vercel, private-gate, or secret/config boundaries change.
- Generated `docs/system-state/*` inventories are approved or created.

## Next Reading Paths

Owner orientation:

- `docs/app-knowledge-book/chapters/01-owner-overview.md`
- `docs/app-knowledge-book/chapters/02-product-map.md`
- `docs/app-knowledge-book/00-repo-audit.md`

Architecture and runtime:

- `docs/architecture.md`
- `docs/architecture/data-access-authz-cache-contract-registry.md`
- `docs/architecture/external-service-contract-matrix.md`
- `docs/architecture/secret-config-inventory.md`

Testing and release:

- `docs/testing-strategy.md`
- `docs/checklists/release-pr-checklist.md`
- `docs/runbooks/post-merge-local-sync.md`
- `scripts/run-verify-pre-pr.sh`
- `scripts/run-verify-pre-merge.sh`

Config and provider safety:

- `docs/runbooks/environment-config-and-secret-parity.md`
- `docs/runbooks/supabase-egress-response.md`
- `docs/runbooks/private-access-gate.md`
- `docs/runbooks/vercel-preview.md`
