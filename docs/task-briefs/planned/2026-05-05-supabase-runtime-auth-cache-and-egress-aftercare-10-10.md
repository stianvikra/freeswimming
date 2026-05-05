# Task Brief: Supabase Runtime Auth Cache And Egress Aftercare (10/10)

## Metadata

- `id`: `2026-05-05-supabase-runtime-auth-cache-and-egress-aftercare-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-05-05`
- `updated`: `2026-05-05`
- `mode`: `automation-first after explicit execution approval`

## Goal

Reduce legitimate production Supabase auth/PostgREST chatter after the Child A containment PR while preserving protected route, admin, entitlement, and My Library correctness.

## Why This Brief Exists

PR `#598` contained accidental local/test/CI production Supabase egress by default. The remaining work is to review runtime auth and cache behavior in production-like routes and to capture after-metrics once Supabase logs refresh.

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the `10/10` claim gate:

- Business logic correctness and data integrity
- Data placement and sync boundaries
- Caching and invalidation strategy
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Analytics and KPI observability
- Incident response and support operations
- Finance and reporting operations
- Stack-fit and dependency discipline
- Testing and QA automation
- Scalability and cost efficiency
- DevOps and rollback readiness

## Platform 10/10 Scorecard Mapping

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                     | Evidence Source                                                   | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `supporting` | No IA redesign; public, auth, admin, entitlement, and My Library route jobs remain unchanged.                                                                                          | route inventory and smoke evidence                                | `4/5`                   |
| UX flow clarity                               | `supporting` | Operator-facing guard/diagnostic messages stay clear; no end-user copy change is intended.                                                                                             | diff review and targeted tests if errors change                   | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this slice should not change rendered UI, print, PDF, layout, or brand surfaces.                                                                                           | screenshot handoff required only if UI changes                    | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Auth, admin role checks, entitlements, My Library, and protected routes remain equivalent; no cache change may expose or stale-write user data.                                        | route/API negative tests, unit tests, diff review, verify gates   | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Admin workflows remain role-gated and operational; any touched admin route keeps deny/recovery behavior clear.                                                                         | admin route negative tests if touched                             | `4/5`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no UI semantics, focus behavior, labels, or interactions are planned.                                                                                                      | explicit scope review; required if UI changes                     | `N/A`                   |
| Performance (CWV + payloads)                  | `target`     | Public/core routes must not increase JS/payload or blocking requests; repeated runtime Supabase reads should decrease where identity is unnecessary.                                   | build output, perf budgets, request inventory, Supabase logs      | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Production data remains server-canonical; local/test/CI remain isolated by Child A guardrails; private data is never cached across users.                                              | data-boundary review, guard tests, route cache matrix             | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Every changed read path has an explicit cache mode, freshness rule, and invalidation trigger; public reads may cache, private/session data stays no-store/session-bound.               | cache matrix, unit/route tests, code review                       | `5/5`                   |
| Reliability and failure handling              | `target`     | Expected auth denies return `401`/`403`, runtime flag failures degrade deterministically, and cache misses/revalidations do not produce accidental `500`s.                             | negative-path tests and build/verify gates                        | `5/5`                   |
| Security and authz                            | `target`     | No auth/session/admin/entitlement check is removed unless the route is proven public; service-role and production opt-in rules remain fail-closed.                                     | security negative tests, route inventory, secret-redaction review | `5/5`                   |
| Privacy and compliance                        | `target`     | No tokens, cookies, raw IPs, user IDs, emails, request headers, or raw env values are committed or emitted in diagnostics.                                                             | diff review, runbook redaction checklist                          | `5/5`                   |
| Content governance                            | `supporting` | Course/content source of truth remains unchanged; public cache decisions must preserve publish-state behavior.                                                                         | content route tests if touched                                    | `4/5`                   |
| Admin workflow and editability                | `supporting` | Admin edit/publish flows remain editable and role-protected; Help/Guide update is required only if workflow labels or recovery behavior change.                                        | route/support sweep and Help/Guide impact note                    | `4/5`                   |
| SEO and crawlability                          | `supporting` | Public metadata, sitemap, robots, and site-lock behavior remain consistent; public routes must not gain unnecessary auth reads.                                                        | metadata/sitemap tests if route boundaries change                 | `4/5`                   |
| AI discoverability                            | `supporting` | Public semantic content remains stable; no AI-discoverable page structure change is intended.                                                                                          | diff review                                                       | `4/5`                   |
| Analytics and KPI observability               | `target`     | Record Supabase before/after counts for `/auth/v1/user`, top PostgREST paths, user-agent/source class, and any remaining production runtime sources.                                   | Supabase Logs Explorer evidence and PR summary                    | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Entitlement, checkout, portal, and download access remain correct; pricing/catalog source of truth is not changed.                                                                     | commerce/entitlement smoke if touched                             | `4/5`                   |
| Incident response and support operations      | `target`     | Runbook aftercare steps are exercised and updated with any new runtime source findings, thresholds, or rollback decision points.                                                       | updated runbook/checkpoint evidence                               | `5/5`                   |
| Finance and reporting operations              | `target`     | Egress budget review records after-metric outcome and decision: hold, optimize further, temporary Pro, or rollback.                                                                    | finance checklist update or PR closeout note                      | `5/5`                   |
| i18n operational readiness                    | `N/A`        | N/A because this slice does not change locale routing, translated content, metadata language policy, or future i18n storage paths.                                                     | explicit i18n scope rationale                                     | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Next.js App Router, TypeScript, Supabase helpers, cache APIs, Vitest, and Playwright; add no dependency unless owner-approved.                                            | dependency diff, typed contracts, verify gates                    | `5/5`                   |
| Testing and QA automation                     | `target`     | Touched auth/cache routes have unit and negative-path coverage; `npm run verify:pre-pr`, CI, and `npm run verify:pre-merge` pass.                                                      | targeted tests, full verify lane, CI                              | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Local/CI production traffic remains blocked; legitimate production Supabase calls are reduced or justified by route; after-metrics show material drop or a documented next mitigation. | request inventory and Supabase after-metrics                      | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Runtime/cache changes are easy to revert independently from Child A guardrails; production smoke/rollback path is documented before merge.                                             | PR rollback note, pre-merge gate, CI                              | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Inventory server/client auth reads before changing behavior.
  - Keep protected route checks server-side and fail-closed.
  - Public routes may avoid auth reads when user identity is not needed.
  - Use explicit App Router cache/revalidation decisions per changed read path.
- TypeScript/domain contracts:
  - Prefer existing typed Supabase/env helpers and deterministic guard errors.
  - Model route/cache decisions in small local helpers or tables only if that removes real duplication.
- Supabase/data layer:
  - No schema, migration, RLS, storage, or generated type changes are expected.
  - Preserve RLS/authz assumptions and add negative-path coverage for any touched protected data access.
- External services/tools:
  - Supabase diagnostics stay read-only and redacted.
  - Do not add a new observability vendor.
- UI system:
  - No visual work is planned.
  - Screenshot handoff becomes required if rendered UI, print, layout, PDF, or brand files change.
- Testing:
  - Unit tests for changed helpers.
  - Route/API negative tests for protected behavior touched by the slice.
  - Playwright smoke only where browser-visible runtime behavior changes.

## Data Placement And Sync Contract

- Server-canonical data:
  - Supabase remains canonical for auth users, profiles, entitlements, admin content, training data, workouts, programs, guide/course progress, and admin notes.
- Local data:
  - Local/test/CI use the Child A isolated/default Supabase contract unless explicit production opt-in is approved.
- Sync policy:
  - No product sync semantics may change without a route-specific invariant and test.
  - Removing redundant reads must not change write ordering, conflict behavior, or entitlement visibility.
- Retention and sensitivity:
  - Do not persist raw Supabase logs, tokens, cookies, user identifiers, emails, or IPs in repo docs.
- Cache/invalidation:
  - Public/safe reads can define revalidation.
  - Private/user-specific reads stay no-store or use a session-bound key with explicit invalidation.

## Identity And Rename Contract

No persisted product entity identity changes are planned. Route params, slugs, titles, and operator-visible identifiers must remain unchanged unless a new brief explicitly scopes identity migration.

## Scope

- Inventory and narrow unnecessary runtime `auth.getUser()` or equivalent Supabase reads.
- Review `lib/supabase/*`, `proxy.ts`, `components/SiteChrome.tsx`, runtime flag loading, public/course content routes, and My Library/protected routes where relevant.
- Add route/cache decision notes for every changed read path.
- Capture Supabase after-metrics and update runbook/checklist evidence.
- Update tests for any touched auth/cache behavior.

## Out Of Scope

- Disabling production Supabase for deployed production.
- Weakening auth, admin checks, RLS, entitlements, checkout/download gates, or My Library access.
- Supabase schema migrations.
- UI redesign, route IA redesign, label changes, or Help/Guide changes unless runtime behavior makes them necessary.
- Committing secrets, raw logs, raw `.env` values, cookies, user identifiers, emails, or IP addresses.

## Acceptance Criteria

1. Runtime Supabase reads are inventoried and classified as public, protected, admin, entitlement, or user-specific.
2. Unnecessary public-route auth/user reads are removed or narrowed, with a documented reason for any retained read.
3. Every changed read path has an explicit cache/freshness/invalidation decision.
4. Protected routes still deny unauthenticated/unauthorized users with `401`/`403`.
5. Supabase after-metrics are recorded after log refresh, including `/auth/v1/user`, top PostgREST paths, user-agent/source class, and remaining hotspot owner.
6. Child A guardrails remain green and continue to block local/test/CI production Supabase usage by default.
7. `npm run verify:pre-pr`, CI, and `npm run verify:pre-merge` pass before merge readiness.

## Validation

- `npm run lint:briefs`
- targeted unit tests for changed helpers/routes
- protected route negative-path tests for any touched auth/admin/entitlement/My Library routes
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run build`
- `npm run test:perf:budgets`
- targeted Playwright smoke if browser-visible runtime behavior changes
- `npm run verify:pre-pr`
- CI
- `npm run verify:pre-merge`

## Manual QA Environments

No visual QA is planned.

If runtime browser behavior changes, smoke locally and on preview:

- `/`
- `/course`
- `/my-library`
- `/auth/sign-in`
- one admin route

Screenshot handoff is required only if rendered UI, print, layout, PDF, or brand output changes.

## Route/Label/Support Surface Impact Sweep

Required before broad gates if any route boundary, runtime flag, admin label/action, Help/Guide surface, runbook, or support path changes.

Minimum sweep targets:

- `app/`
- `components/`
- `lib/supabase/`
- `tests/`
- `.github/workflows/`
- `docs/runbooks/`
- `docs/checklists/`
- active/planned/done task briefs that mention Supabase, auth, cache, egress, Playwright, site lock, or verification.

## Rollback Plan

- Revert this runtime/cache PR independently if protected route, entitlement, or My Library behavior regresses.
- Keep PR `#598` Child A guardrails in place unless they are proven to be the root cause.
- If production egress restriction risk returns before optimization is validated, prefer temporary Pro upgrade over disabling production functionality.

## Checkpoint Log

- `2026-05-05 | planned | created after PR #598 closeout to own runtime auth/cache optimization and Supabase after-metric evidence | next: execute only after owner explicitly starts this follow-up brief`
