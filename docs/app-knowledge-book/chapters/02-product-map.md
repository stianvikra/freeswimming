# Product Map

## What This Is

This chapter is stable explanatory documentation for the FreeSwimming.org owner. It maps the main
product areas, audiences, route groups, code owners, canonical docs, and known unknowns.

It is not a generated route inventory. It intentionally stays shorter and more owner-readable than
`docs/app-knowledge-book/00-repo-audit.md`.

Evidence boundary:

- Confirmed repo facts cite exact paths.
- Provider dashboards, live data, deployed settings, production control-plane state, and active
  customer/member state are `Unknown / To Verify` unless repo evidence or owner-provided evidence
  proves them.
- This chapter does not include secret values, raw env values, cookies, tokens, request IPs, provider
  responses, personal data, or user free-text content.

Evidence date:

- Reviewed on `2026-05-15` against `main@ac64996`.
- External/control-plane facts remain `Unknown / To Verify` unless explicitly marked otherwise.

## How To Use This Map

Use this chapter when you need to answer:

- what a product area is for,
- which audience uses it,
- where it lives in the repo,
- which existing docs or runbooks are canonical,
- what should not be changed casually,
- what still needs owner/provider verification.

Use `docs/app-knowledge-book/chapters/01-owner-overview.md` first if you need the shortest
orientation. Use `docs/app-knowledge-book/00-repo-audit.md` when you need deeper route, API, schema,
testing, and risk evidence.

## Audience Map

| Audience            | Main job                                                                | Primary surfaces                                                                                                                                         | Canonical docs                                                                                           |
| ------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Public visitor      | Understand FreeSwimming.org, course/program value, method, and contact. | `app/page.tsx`, `app/course/page.tsx`, `app/programs/page.tsx`, `app/plans/page.tsx`, `app/analysis/page.tsx`, `app/our-method/page.tsx`, `app/contact/` | `docs/app-knowledge-book/00-repo-audit.md`, `docs/product-rules.md`                                      |
| Signed-in member    | Continue learning and manage personal training tools.                   | `app/my-library/**`, progress APIs, profile/training/workout/program/dryland/habit APIs                                                                  | `docs/architecture/data-access-authz-cache-contract-registry.md`, `docs/api-contracts.md`                |
| Admin/editor/viewer | Manage content, commerce, messages, notes, QR links, operations, help.  | `app/admin/`, `components/admin/`, `app/api/admin/**`, `lib/admin/`                                                                                      | `docs/architecture/admin-workspace-module-contracts.md`, `docs/runbooks/`                                |
| Owner/operator      | Review releases, verify safety, handle support and incidents.           | Task briefs, runbooks, PRs, CI, verification scripts                                                                                                     | `docs/testing-strategy.md`, `docs/checklists/release-pr-checklist.md`, `docs/runbooks/`                  |
| External providers  | Own provider-canonical state outside the repo.                          | Supabase, Stripe, email provider, Upstash, Vercel, GitHub                                                                                                | `docs/architecture/external-service-contract-matrix.md`, `docs/app-knowledge-book/unknowns-and-risks.md` |

## Public Entry And Marketing

What this area does:

- Presents FreeSwimming.org to public visitors.
- Explains the method, course/program direction, analysis offer, policies, and contact path.
- Feeds SEO/crawl posture through metadata, sitemap, and robots behavior.

Where it lives:

- `app/page.tsx`
- `app/course/page.tsx`
- `app/programs/page.tsx`
- `app/plans/page.tsx`
- `app/analysis/page.tsx`
- `app/our-method/page.tsx`
- `app/contact/page.tsx`
- `app/privacy/page.tsx`
- `app/cookies/page.tsx`
- `app/layout.tsx`
- `app/sitemap.ts`
- `app/robots.ts`

Related docs:

- `docs/app-knowledge-book/00-repo-audit.md`
- `docs/product-rules.md`
- `docs/api-contracts.md`
- `docs/runbooks/route-label-support-surface-impact-sweep.md`

What not to change casually:

- Public route names, redirects, primary labels, crawl/indexing posture, and contact promise copy.
- Any route/label/support change should use `docs/runbooks/route-label-support-surface-impact-sweep.md`.

Unknown / To Verify:

- Final public launch posture and when private/site-lock mode should be removed or changed.

## Course And Guides

What this area does:

- Provides core swim learning content and guide-style progress surfaces.
- Connects public learning surfaces with progress tracking for signed-in members.

Where it lives:

- `app/course/page.tsx`
- `app/guides/0-1000m/page.tsx`
- `app/guides/poolside/page.tsx`
- `app/api/course/content/route.ts`
- `app/api/progress/course/route.ts`
- `app/api/progress/guide/route.ts`
- `app/api/guides/0-1000m/pdf/route.ts`
- `app/api/guides/poolside/pdf/route.ts`
- `lib/course/`
- `lib/guides/`

Related docs and tests:

- `docs/app-knowledge-book/00-repo-audit.md`
- `docs/architecture/data-access-authz-cache-contract-registry.md`
- `tests/e2e/course-progress-sync.spec.ts`
- `tests/e2e/course-support-card-actions.spec.ts`

What not to change casually:

- Runtime IDs, progress identity, published content read paths, guide progress behavior, and PDF/export
  expectations.

Unknown / To Verify:

- Live production content shape, row counts, backup proof, and whether every migration has been
  applied to every expected environment.

## My Library And Member Training

What this area does:

- Gives signed-in members their training home.
- Hosts personal training tools, profile, goals, workout/program/dryland/habit workflows, and
  security/account surfaces.

Where it lives:

- `app/my-library/page.tsx`
- `app/my-library/item/[slug]/page.tsx`
- `app/my-library/training/page.tsx`
- `app/my-library/profile/page.tsx`
- `app/my-library/goals/page.tsx`
- `app/my-library/security/page.tsx`
- `app/api/my-library/**`
- `app/api/goals/**`
- `app/api/user/export/route.ts`
- `app/api/user/delete/route.ts`
- `lib/my-library/`
- `lib/athlete-profile/`
- `lib/training-context/`
- `lib/goals/`

Related docs:

- `docs/architecture/data-access-authz-cache-contract-registry.md`
- `docs/runbooks/gdpr-data-rights.md`
- `docs/runbooks/auth-account-support.md`

What not to change casually:

- Profile/training context identity, personal records, user export/delete behavior, and any route that
  changes member data ownership.

Unknown / To Verify:

- Final retention policy for personal training context, profile records, goals, notes, analytics
  records, and generated training artifacts.

## Workouts, Programs, Dryland, Habits, And Routines

What this area does:

- Supports authored and saved swim workouts, programs, dryland sessions, micro-plans, routines,
  habits, and execution/export handoffs.

Where it lives:

- `app/my-library/workouts/page.tsx`
- `app/my-library/workouts/[workoutId]/page.tsx`
- `app/my-library/workouts/poolside-preview/page.tsx`
- `app/my-library/programs/[programId]/page.tsx`
- `app/my-library/dryland/page.tsx`
- `app/my-library/dryland/[sessionId]/page.tsx`
- `app/my-library/routines/page.tsx`
- `app/my-library/habits/page.tsx`
- `app/my-library/generator/page.tsx`
- `app/api/my-library/workouts/**`
- `app/api/my-library/programs/**`
- `app/api/my-library/dryland/**`
- `app/api/my-library/habits/**`
- `app/api/my-library/generator-intake/route.ts`
- `app/api/my-library/generator/session-draft/route.ts`
- `lib/workouts/`
- `lib/programs/`
- `lib/dryland/`
- `lib/habits/`
- `lib/generator-intake/`
- `lib/session-generator-v1/`

Related docs and briefs:

- `docs/app-knowledge-book/00-repo-audit.md`
- `docs/architecture/data-access-authz-cache-contract-registry.md`
- Done task briefs under `docs/task-briefs/done/` for recent dryland, habits, routines, workout,
  program, poolside, and AI session work.

What not to change casually:

- Canonical workout/program IDs, route params, export payloads, poolside image/PDF behavior, generated
  draft boundaries, and habit/dryland completion semantics.

Unknown / To Verify:

- Long-term provider direction for Garmin API push and broader AI training planning.
- Live production usage volume and storage footprint for saved workouts, programs, dryland sessions,
  habits, and generated drafts.

## Admin Workspace

What this area does:

- Gives operators one workspace for content, commerce, messages, notes, QR links, operations,
  categories, email templates, and Help/Guide.

Where it lives:

- `app/admin/page.tsx`
- `app/admin/layout.tsx`
- `components/admin/AdminWorkspace.tsx`
- `components/admin/AdminContentManager.tsx`
- `components/admin/AdminCommerceManager.tsx`
- `components/admin/AdminMessagesManager.tsx`
- `components/admin/AdminNotesManager.tsx`
- `components/admin/AdminQrLinksManager.tsx`
- `components/admin/AdminOperationsManager.tsx`
- `components/admin/AdminEmailTemplatesManager.tsx`
- `components/admin/AdminHelpCenter.tsx`
- `app/api/admin/**`
- `lib/admin/`

Related docs and runbooks:

- `docs/architecture/admin-workspace-module-contracts.md`
- `docs/runbooks/admin-content-parity-triage.md`
- `docs/runbooks/admin-message-inbox.md`
- `docs/runbooks/admin-email-template-governance.md`
- `docs/runbooks/admin-notes-recovery.md`
- `docs/checklists/admin-full-audit-gate-checklist.md`

What not to change casually:

- Admin labels, workflow actions, Help/Guide text, destructive actions, status transitions, note
  recovery, QR behavior, and role-gated mutation paths.

Unknown / To Verify:

- Current live admin role assignments, live content row counts, current support workload, and
  provider-side alert delivery health.

## Commerce, Entitlements, And Finance

What this area does:

- Creates checkout sessions, handles Stripe webhooks, manages entitlements, supports portal access,
  and keeps finance reconciliation paths available.

Where it lives:

- `app/api/checkout/session/route.ts`
- `app/api/stripe/webhook/route.ts`
- `app/api/portal/route.ts`
- `app/api/download/resend/route.ts`
- `app/checkout/success/page.tsx`
- `app/claim/page.tsx`
- `lib/commerce/`
- `lib/stripe/`
- `components/admin/AdminCommerceManager.tsx`
- `scripts/reconcile-finance-entitlements.mjs`

Related docs and runbooks:

- `docs/architecture/external-service-contract-matrix.md`
- `docs/checklists/finance-reporting-baseline.md`
- `docs/runbooks/terms-privacy-compliance-lifecycle.md`

What not to change casually:

- Checkout creation, webhook verification, entitlement upsert rules, billing portal customer handling,
  refund/reporting assumptions, and finance reconciliation identifiers.

Unknown / To Verify:

- Current Stripe products, prices, webhook endpoints, portal configuration, refund workflow, invoice
  state, payout reporting, and live dashboard settings.

## Contact, Messages, Support, And Incident Paths

What this area does:

- Accepts public contact and analysis requests.
- Stores admin messages and delivery attempts.
- Gives operators support and incident response runbooks.

Where it lives:

- `app/contact/page.tsx`
- `app/api/contact/route.ts`
- `app/api/admin/messages/route.ts`
- `app/api/admin/messages/[id]/route.ts`
- `lib/admin/contact-intake.ts`
- `lib/admin/messages.ts`
- `lib/admin/message-delivery.ts`
- `components/admin/AdminMessagesManager.tsx`
- `lib/admin/incidents.ts`

Related docs:

- `docs/runbooks/admin-message-inbox.md`
- `docs/runbooks/core-flow-incident-response.md`
- `docs/runbooks/high-cost-debug-log.md`
- `docs/runbooks/ui-debug-hypothesis-and-handoff.md`

What not to change casually:

- Contact validation, origin/host allowlists, rate limits, delivery-attempt logging, support labels,
  incident-alert behavior, and message retention assumptions.

Unknown / To Verify:

- Current One.com/SMTP/Resend configuration, mailbox delivery health, incident alert delivery health,
  and long-term message retention policy.

## Auth, Private Gate, Preview Access, And Security-Sensitive Surfaces

What this area does:

- Handles sign-in, callback, admin access, private/site-lock access, preview unlock, dev auth bypass,
  account support, and data-rights routes.

Where it lives:

- `app/auth/sign-in/page.tsx`
- `app/auth/callback/route.ts`
- `app/preview-access/page.tsx`
- `app/preview-access/admin-unlock/route.ts`
- `app/preview-access/clear/route.ts`
- `app/api/dev-login/route.ts`
- `app/dev/login/route.ts`
- `app/my-library/security/page.tsx`
- `app/api/user/export/route.ts`
- `app/api/user/delete/route.ts`
- `lib/auth/`
- `lib/admin/access.ts`
- `lib/site-lock/`
- `lib/supabase/`

Related docs:

- `docs/architecture/data-access-authz-cache-contract-registry.md`
- `docs/runbooks/private-access-gate.md`
- `docs/runbooks/auth-account-support.md`
- `docs/checklists/admin-access-and-secret-rotation.md`
- `docs/architecture/secret-config-inventory.md`

What not to change casually:

- Role resolution, admin allowlists, dev bypass, site-lock cookies/password/bypass behavior, exact
  hostname/protocol validation, user export/delete semantics, and secret/env handling.

Unknown / To Verify:

- Current Supabase auth provider settings, live RLS policy state, production allowlist state, backup
  proof, and deployed private-gate configuration.

## SEO, Analytics, i18n, And Public Discoverability

What this area does:

- Controls public discoverability, route metadata, sitemap/robots behavior, analytics event intake,
  and future multilingual readiness.

Where it lives:

- `app/layout.tsx`
- `app/sitemap.ts`
- `app/robots.ts`
- `app/api/analytics/event/route.ts`
- `lib/analytics/`
- `docs/decisions/locale-routing-strategy.md`
- `docs/decisions/locale-content-fallback-matrix.md`
- `docs/checklists/i18n-operational-readiness.md`

Related docs and tests:

- `docs/app-knowledge-book/00-repo-audit.md`
- `docs/testing-strategy.md`
- `tests/unit/site-lock-metadata-routes.test.ts`
- `tests/e2e/sitemap.spec.ts`
- `tests/unit/analytics-events.test.ts`
- `tests/unit/analytics-event-route.test.ts`

What not to change casually:

- Canonical URLs, sitemap/robots behavior, private/public crawl posture, analytics payload shape,
  consent/privacy assumptions, and future locale route strategy.

Unknown / To Verify:

- Final public launch crawl posture, marketing attribution needs, and any external analytics or
  search-console configuration outside repo evidence.

## Release, Verification, And Operations

What this area does:

- Defines how changes move from branch to PR to CI to merge readiness and post-merge sync.
- Keeps docs-only and full-lane validation separate.

Where it lives:

- `package.json`
- `scripts/run-verify-pre-pr.sh`
- `scripts/run-verify-pre-merge.sh`
- `.github/workflows/`
- `docs/testing-strategy.md`
- `docs/checklists/release-pr-checklist.md`
- `docs/runbooks/post-merge-local-sync.md`
- `docs/runbooks/pr-flow-and-chat-handoff.md`
- `docs/runbooks/codex-sandbox-approval-cadence.md`

Related docs:

- `docs/branch-protection.md`
- `docs/runbooks/branch-protection.md`
- `docs/runbooks/ci-unblock.md`
- `docs/runbooks/local-verify-and-test-artifacts.md`
- `docs/runbooks/test-gate-efficiency-and-warning-triage.md`

What not to change casually:

- Verification scripts, CI workflows, branch protection assumptions, release gates, post-merge
  preflight, and performance-budget ratchets.

Unknown / To Verify:

- Current GitHub branch protection and required-check configuration beyond repo docs/workflows.
- Current Vercel project settings, aliases, preview/production environment scope, and deployment
  control-plane state.

## Cross-Area Data Boundaries

Server-canonical app state:

- Profiles, roles, entitlements, admin content, admin notes, audit history, publish states, progress,
  workouts, programs, dryland, habits, messages, and related durable app records.
- Route-level auth, service-role, cache, and failure contracts are tracked in
  `docs/architecture/data-access-authz-cache-contract-registry.md`.

Provider-canonical state:

- Supabase project settings, Stripe dashboard settings, Vercel environment settings, email provider
  settings, Upstash settings, and live logs.
- These stay `Unknown / To Verify` unless owner/provider evidence proves them.

Local-only or transient state:

- Unsaved form state, UI preferences, browser-only draft state, and test artifacts when explicitly
  allowed by the relevant data contract.

Generated documentation state:

- Stable App Knowledge Book chapters are manual and evidence-linked.
- Volatile inventories such as routes, API routes, env names, migrations, scripts, dependencies,
  workflows, and tests should later live under `docs/system-state/` only after explicit owner
  approval.

## Maintenance Trigger

Update this chapter when any of these change:

- a public/member/admin route group is added, removed, renamed, redirected, or materially
  repositioned,
- a product area, owner-facing label, Help/Guide section, support path, recovery action, or runbook
  changes,
- auth, private gate, admin access, commerce, payments, contact/messages, analytics, SEO, i18n,
  data, provider, or release boundaries change,
- generated `docs/system-state/*` inventories are approved or created,
- the App Knowledge Book structure changes.

Keep updates small. Link to canonical docs instead of copying large inventories.

## Known Future Refresh Points

Refresh this chapter when these planned or likely workstreams change repo-proven behavior:

- Admin user management, tester access, passkeys, or private-gate launch posture changes.
- Visual coaching, AI/program planning, workouts, dryland, habits, or training-domain epics ship
  new primary surfaces.
- Commerce, finance, contact/messages, analytics, SEO, or i18n provider boundaries change.
- Generated `docs/system-state/*` inventories are approved or created.

## Next Reading Paths

Owner learning:

- `docs/app-knowledge-book/chapters/01-owner-overview.md`
- `docs/app-knowledge-book/00-repo-audit.md`
- `docs/app-knowledge-book/quality-checklist.md`

Architecture and safety:

- `docs/architecture.md`
- `docs/architecture/data-access-authz-cache-contract-registry.md`
- `docs/architecture/external-service-contract-matrix.md`

Admin and support:

- `docs/architecture/admin-workspace-module-contracts.md`
- `docs/runbooks/admin-content-parity-triage.md`
- `docs/runbooks/admin-message-inbox.md`
- `docs/runbooks/core-flow-incident-response.md`

Release and operations:

- `docs/testing-strategy.md`
- `docs/checklists/release-pr-checklist.md`
- `docs/runbooks/post-merge-local-sync.md`
