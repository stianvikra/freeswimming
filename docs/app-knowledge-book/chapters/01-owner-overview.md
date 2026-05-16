# Owner Overview

## What This Is

This chapter is stable explanatory documentation for the FreeSwimming.org owner. It explains what
the app is, where the main surfaces live, what is safe or risky to change, and where to verify common
questions.

Evidence boundary:

- Confirmed repo facts cite exact paths.
- Provider dashboards, live data, deployed settings, and production control-plane state are
  `Unknown / To Verify` unless the repo or owner-provided evidence proves them.
- This chapter does not include secret values, raw env values, cookies, tokens, request IPs, provider
  responses, personal data, or user free-text content.

Evidence date:

- Reviewed on `2026-05-15` against `main@fdacbb0`.
- External/control-plane facts remain `Unknown / To Verify` unless explicitly marked otherwise.

## What FreeSwimming.org Is

FreeSwimming.org is a Next.js App Router application for swim learning, training support, admin
operations, content management, payments, contact intake, and owner-run release operations.

Main evidence:

- The high-level architecture is in `docs/architecture.md`.
- The stack and repo audit are in `docs/app-knowledge-book/00-repo-audit.md`.
- Runtime pages and API routes live under `app/`.
- Shared UI lives under `components/`.
- Domain and service logic lives under `lib/`.
- Supabase migrations live under `supabase/migrations/`.
- Generated database types live in `types/database.ts`.
- Release and verification behavior is described in `docs/testing-strategy.md`,
  `docs/checklists/release-pr-checklist.md`, and `package.json`.

## Who Uses It

Owner/operator:

- Uses docs, runbooks, task briefs, PRs, and admin surfaces to manage the app safely.
- Starts with `docs/app-knowledge-book/README.md`, this chapter, and `docs/runbooks/`.

Public visitor:

- Reads public pages such as `/`, `/course`, `/programs`, `/analysis`, `/our-method`, `/contact`,
  `/privacy`, and `/cookies`.
- Main route evidence is under `app/` and summarized in
  `docs/app-knowledge-book/00-repo-audit.md`.

Signed-in member:

- Uses `/my-library` and its training areas for workouts, dryland, habits, programs, profile,
  training context, goals, and security.
- Main route evidence is under `app/my-library/`.

Admin/editor/viewer:

- Uses `/admin`, guarded by `app/admin/layout.tsx`.
- Admin tabs are defined in `lib/admin/admin-workspace.ts` and rendered by
  `components/admin/AdminWorkspace.tsx`.
- Admin help is rendered by `components/admin/AdminHelpCenter.tsx`.

External providers:

- Supabase owns auth and database state through helpers in `lib/supabase/`.
- Stripe owns payment provider state through `lib/stripe/` and commerce helpers in
  `lib/commerce/`.
- Email/contact delivery and rate limiting are handled through app code under `lib/admin/`,
  `app/api/contact/route.ts`, and provider-specific env configuration.
- Exact live provider settings are `Unknown / To Verify` unless checked in the provider control
  plane.

## Main Surfaces

Public and marketing:

- Page routes live under `app/**/page.tsx`.
- Core public pages include `app/page.tsx`, `app/course/page.tsx`, `app/programs/page.tsx`,
  `app/analysis/page.tsx`, `app/our-method/page.tsx`, and `app/contact/page.tsx`.
- Metadata, manifest, sitemap, and robots behavior live in `app/layout.tsx`, `app/manifest.ts`,
  `app/sitemap.ts`, and `app/robots.ts`.

Auth and private access:

- Sign-in lives under `app/auth/sign-in/`.
- Auth helpers live under `lib/auth/` and `lib/supabase/`.
- Site lock and preview access logic lives under `lib/site-lock/` and `app/preview-access/`.
- Operational support is in `docs/runbooks/private-access-gate.md` and
  `docs/runbooks/auth-account-support.md`.

Member area:

- The member landing route is `app/my-library/page.tsx`.
- Related member areas live under `app/my-library/**`.
- Progress, profile, training, goals, workouts, programs, dryland, and habits API routes live under
  `app/api/my-library/**`, `app/api/progress/**`, and `app/api/goals/**`.

Admin:

- Admin shell: `app/admin/page.tsx`, `app/admin/layout.tsx`,
  `components/admin/AdminWorkspace.tsx`.
- Admin content, notes, QR links, commerce, operations, email templates, messages, categories, and
  help are documented in `docs/app-knowledge-book/00-repo-audit.md`.
- Support runbooks include `docs/runbooks/admin-content-parity-triage.md`,
  `docs/runbooks/admin-message-inbox.md`, `docs/runbooks/admin-email-template-governance.md`, and
  `docs/runbooks/admin-notes-recovery.md`.

Commerce and finance:

- Checkout route: `app/api/checkout/session/route.ts`.
- Stripe webhook: `app/api/stripe/webhook/route.ts`.
- Commerce helpers: `lib/commerce/` and `lib/stripe/`.
- Finance reconciliation: `scripts/reconcile-finance-entitlements.mjs` and
  `docs/checklists/finance-reporting-baseline.md`.
- Current Stripe dashboard products, prices, portal configuration, refunds, and payout reporting are
  `Unknown / To Verify` from repo evidence alone.

Operations and release:

- Verification commands are in `package.json`.
- Pre-PR and pre-merge gates are implemented by `scripts/run-verify-pre-pr.sh` and
  `scripts/run-verify-pre-merge.sh`.
- Post-merge local sync is documented in `docs/runbooks/post-merge-local-sync.md`.
- Branch protection and CI behavior are documented in `docs/branch-protection.md`,
  `docs/runbooks/branch-protection.md`, and `.github/workflows/`.

## Where Things Live

Use this map before changing anything:

| Area                             | Primary paths                                                            |
| -------------------------------- | ------------------------------------------------------------------------ |
| Pages and route layouts          | `app/`                                                                   |
| API routes                       | `app/api/**/route.ts`                                                    |
| Admin UI                         | `components/admin/`, `lib/admin/`, `app/admin/`                          |
| Shared UI                        | `components/`, `components/ui/`                                          |
| Domain/service logic             | `lib/`                                                                   |
| Supabase schema history          | `supabase/migrations/`                                                   |
| Generated DB types               | `types/database.ts`                                                      |
| Browser and unit tests           | `tests/e2e/`, `tests/unit/`                                              |
| Release and verification scripts | `scripts/`, `package.json`                                               |
| Architecture contracts           | `docs/architecture.md`, `docs/architecture/`                             |
| Operational runbooks             | `docs/runbooks/`                                                         |
| Quality gates                    | `docs/quality/platform-10-10-scorecard.md`, `docs/task-briefs/README.md` |
| App Knowledge Book               | `docs/app-knowledge-book/`                                               |

## Data Boundaries

Server-canonical app state:

- User profiles, roles, entitlements, admin content, admin notes, audit history, publish states,
  progress, workouts, programs, dryland, habits, messages, and related durable app records are
  treated as backend-owned state.
- Route-level auth, service-role, cache, and failure contracts are tracked in
  `docs/architecture/data-access-authz-cache-contract-registry.md`.

Provider-canonical state:

- Supabase project settings, Stripe dashboard settings, Vercel environment settings, email provider
  settings, Upstash settings, and live logs are provider/control-plane facts.
- Unless owner-verified, they stay `Unknown / To Verify`.

Local-only or transient state:

- UI preferences, unsaved form state, browser-only draft state, and test artifacts can be local-only
  when a brief or implementation says so.
- Do not treat local state as business truth unless a data contract explicitly allows it.

Generated documentation state:

- Stable App Knowledge Book chapters are manual and evidence-linked.
- Volatile inventories such as routes, env names, migrations, scripts, dependencies, and workflows
  should later live under `docs/system-state/` only after explicit owner approval.
- This chapter does not create generated inventories.

## What Not To Change Casually

Do not casually change these areas without a scoped task brief, tests, and rollback thinking:

- `.env*` files, env variable names, provider secrets, and provider dashboard settings.
- Supabase migrations, RLS policies, service-role usage, and `types/database.ts`.
- Auth, admin role resolution, private gate, site lock, and dev auth bypass behavior.
- Stripe checkout, webhook, entitlements, billing portal, catalog, and finance reconciliation logic.
- Public routes, route redirects, labels, admin actions, support surfaces, Help/Guide, and runbooks.
- Verification scripts, CI workflows, branch protection, and release gates.
- Sitemap, robots, metadata, and private/public crawl posture.
- Generated inventory tooling or broad documentation generation.
- Any doc or screenshot that could contain secret values, personal data, raw provider responses, or
  user free-text content.

Use `docs/runbooks/route-label-support-surface-impact-sweep.md` when routes, labels, workflow
actions, recovery behavior, Help/Guide, runbooks, or support paths change.

## How To Verify Common Questions

Use repo evidence before provider assumptions.

| Question                                        | Start here                                                                                    |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------- |
| What is the app structure?                      | `docs/architecture.md`, `docs/app-knowledge-book/00-repo-audit.md`                            |
| What changed in a release?                      | `git log --oneline`, PR links, active/done task brief                                         |
| Is a docs-only PR safe to review?               | `npm run lint:briefs`, `npm run lint:briefs:all`, `npm run verify:pre-pr`                     |
| Is a pre-merge branch ready?                    | `npm run verify:pre-merge`, CI checks, `docs/checklists/release-pr-checklist.md`              |
| How does an API route handle auth/cache?        | `docs/architecture/data-access-authz-cache-contract-registry.md`                              |
| How do providers connect?                       | `docs/architecture/external-service-contract-matrix.md`                                       |
| How do I debug admin access?                    | `docs/runbooks/auth-account-support.md`, `docs/runbooks/private-access-gate.md`               |
| How do I debug admin content parity?            | `docs/runbooks/admin-content-parity-triage.md`                                                |
| How do I debug contact/messages?                | `docs/runbooks/admin-message-inbox.md`, `app/api/contact/route.ts`                            |
| How do I debug Supabase egress or schema drift? | `docs/runbooks/supabase-egress-response.md`, `docs/runbooks/supabase-migration-discipline.md` |
| How do I check payments/entitlements?           | `docs/checklists/finance-reporting-baseline.md`, `scripts/reconcile-finance-entitlements.mjs` |
| How do I handle an incident?                    | `docs/runbooks/core-flow-incident-response.md`                                                |
| How do I handle privacy/data rights?            | `docs/runbooks/gdpr-data-rights.md`                                                           |
| How do I check performance gates?               | `docs/testing-strategy.md`, `scripts/run-perf-budget-check.mjs`                               |
| How do I debug visual/export issues?            | `docs/runbooks/ui-debug-hypothesis-and-handoff.md`, `docs/runbooks/high-cost-debug-log.md`    |

## Current Unknowns

Keep these as `Unknown / To Verify` until a scoped owner or provider check proves them:

- Current Vercel project settings, environment scope, aliases, and deployment control-plane state.
- Current Supabase project settings, live RLS policy state, backups, row counts, and storage usage.
- Current Stripe products, prices, webhook endpoints, portal configuration, refunds, invoices, and
  payout/reporting setup.
- Current email provider, One.com/SMTP/Resend configuration, mailbox delivery health, and incident
  alert delivery health.
- Current Upstash database isolation, token health, and production traffic limits.
- Current branch protection and required GitHub check configuration beyond repo docs/workflows.
- Whether the `/about` to `/how-we-teach` redirect in `next.config.ts` is intentional, stale, or
  missing a route.
- Final public launch posture and when private/site-lock mode should be removed or changed.

The full Phase 1 list lives in `docs/app-knowledge-book/unknowns-and-risks.md`.

## Maintenance Trigger

Update this chapter when any of these change:

- a route group, public/member/admin surface, or owner workflow is added, removed, renamed, or
  materially repositioned,
- admin labels, Help/Guide, support paths, recovery behavior, or runbooks change,
- auth, private gate, admin access, commerce, payments, messages, analytics, SEO, i18n, data, or
  provider boundaries change,
- verification gates, CI, release flow, branch protection, rollback flow, or scorecard rules change,
- Phase 2 creates new stable chapters or approved generated `docs/system-state/*` inventories.

Keep updates small. Link to canonical docs instead of copying large tables that will drift.

## Known Future Refresh Points

Refresh this chapter when these planned or likely workstreams change repo-proven behavior:

- Auth/access changes such as passkeys, admin user management, tester access, or private-gate
  launch posture changes.
- New primary product areas, route groups, or owner workflows move from planned to shipped.
- Generated `docs/system-state/*` inventories are approved or created.
- Provider/control-plane facts are owner-verified and should replace `Unknown / To Verify` markers.

## Next Reading Paths

Owner learning:

- `docs/app-knowledge-book/README.md`
- `docs/app-knowledge-book/proposed-structure.md`
- `docs/app-knowledge-book/quality-checklist.md`

Product and route understanding:

- `docs/app-knowledge-book/00-repo-audit.md`
- `docs/product-rules.md`
- `docs/api-contracts.md`

Operations:

- `docs/testing-strategy.md`
- `docs/checklists/release-pr-checklist.md`
- `docs/runbooks/core-flow-incident-response.md`
- `docs/runbooks/post-merge-local-sync.md`

Safe change process:

- `docs/task-brief-template.md`
- `docs/task-briefs/README.md`
- `docs/runbooks/task-brief-audit-gate.md`
- `docs/quality/platform-10-10-scorecard.md`
