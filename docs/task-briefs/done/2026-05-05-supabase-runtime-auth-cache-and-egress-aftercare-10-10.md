# Task Brief: Supabase Runtime Auth Cache And Egress Aftercare (10/10)

## Metadata

- `id`: `2026-05-05-supabase-runtime-auth-cache-and-egress-aftercare-10-10`
- `status`: `in-progress`
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

## Runtime Supabase Inventory And Decisions

| Surface                                                                       | Classification                                 | Before                                                                                                                                     | Decision                                                                                                                                     |
| ----------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `proxy.ts` -> `updateSupabaseSession`                                         | cross-route auth refresh                       | Called Supabase `auth.getUser()` for every non-static request, including anonymous public traffic.                                         | Skip Supabase entirely unless a non-empty `sb-*-auth-token` cookie is present; signed-in sessions still refresh through middleware.          |
| `components/SiteChrome.tsx`                                                   | client chrome auth/admin affordance            | Called browser `auth.getUser()` on every page and fetched `/api/runtime/flags` for anonymous sessions.                                     | Use client session state for display-only auth affordance; fetch runtime flags only when a browser session exists.                           |
| `app/course/page.tsx`                                                         | public course with optional user progress sync | Called browser `auth.getUser()` before deciding whether to hydrate/sync progress, and fetched runtime flags for anonymous course visitors. | Use client session state for sync eligibility and runtime flag fetches; `/api/progress/course` remains server-authoritative and `no-store`.  |
| Public auth-aware pages (`/`, `/auth/sign-in`, `/claim`, `/checkout/success`) | public, optional identity                      | Called server `auth.getUser()` even when no Supabase auth cookie existed.                                                                  | Use `getServerSupabaseUserIfAuthCookiePresent()` so anonymous public visits avoid Supabase.                                                  |
| Guide pages and guide PDF APIs                                                | protected entitlement                          | Called server `auth.getUser()` before redirect/`401`, including no-cookie traffic.                                                         | No-cookie requests redirect or return `401` without Supabase; cookie-bearing requests still validate user and entitlement server-side.       |
| My Library pages                                                              | protected user-specific                        | Called server `auth.getUser()` for no-cookie visits before redirect.                                                                       | No-cookie requests redirect without Supabase; cookie-bearing requests still validate user then load user data via RLS-bound Supabase client. |
| `/api/runtime/flags`                                                          | private admin affordance                       | Called route-handler `auth.getUser()` for anonymous visitors to decide dashboard visibility.                                               | Return `dashboardVisible: false` without Supabase when no auth cookie exists; signed-in users still resolve admin role server-side.          |
| `/api/analytics/event`                                                        | public analytics with optional identity        | Called server `auth.getUser()` for every client event.                                                                                     | Anonymous events log with `userId: null` without Supabase; signed-in events may attach validated user ID.                                    |
| `/api/checkout/session`                                                       | public checkout with optional identity         | Called server `auth.getUser()` before Stripe session creation.                                                                             | Anonymous checkout skips Supabase auth; signed-in checkout keeps optional user association.                                                  |
| `/api/portal`                                                                 | protected billing portal                       | Called server `auth.getUser()` for no-cookie requests.                                                                                     | No-cookie requests return `401` without Supabase; cookie-bearing requests still validate user and entitlement/customer mapping.              |

## Changed Read Path Cache Matrix

| Path                                     | Cache / freshness                                                                           | Invalidation / correctness                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Public anonymous auth detection          | No shared cache of identity; request-local cookie presence only.                            | Session state changes are represented by Supabase auth cookies and browser `onAuthStateChange`.      |
| Middleware session refresh               | Request-bound; skips only when no auth token cookie exists.                                 | Existing signed-in cookie refresh remains unchanged.                                                 |
| Runtime flags                            | `Cache-Control: no-store`; anonymous fallback is deterministic.                             | Admin visibility re-evaluates per signed-in request/session.                                         |
| My Library/admin/guide entitlement reads | `force-dynamic`/private route behavior retained.                                            | No private data is cached across users; server Supabase checks remain required once a cookie exists. |
| Course progress sync                     | Client session state gates optional sync; API remains `no-store` and server-authoritative.  | Server `/api/progress/course` validates current user before hydrate/write.                           |
| Analytics events                         | `Cache-Control: no-store`; anonymous events use `userId: null`.                             | Payload redaction remains in `trackAnalyticsEvent`; no cookies/tokens are persisted.                 |
| Checkout and portal APIs                 | Dynamic route behavior retained; identity is optional for checkout and required for portal. | Stripe/entitlement validation remains server-side; portal returns `401` without a validated user.    |

## Gate Evidence Notes

- Failure-mode / no unexpected 500 evidence:
  - No changed anonymous/no-cookie path now requires Supabase before returning a deterministic
    fallback, redirect, or `401`.
  - `/api/runtime/flags` keeps `ok: true` fallback on missing auth cookie and unexpected lookup
    failures.
  - `/api/portal` returns `401` when no validated user exists.
  - Guide PDF APIs return `401` without a user and keep existing `403` entitlement-deny behavior.
- Official integration pattern:
  - Supabase usage stays on the existing `@supabase/ssr` server/browser helpers and
    `@supabase/supabase-js` admin SDK.
  - Stripe checkout/portal behavior stays on the existing official Stripe SDK helpers; this slice
    only changes optional user lookup before SDK calls.
  - No webhook, retry, idempotency, credential, or dependency pattern changes are introduced.
- Reference surface / shared UI contract:
  - `SiteChrome` remains the shared chrome reference surface; this patch changes only its
    session-derived runtime flag fetch gate and keeps markup/labels/classes unchanged.
  - `app/course/page.tsx` keeps the existing custom course menu renderer and only mirrors the same
    session gate for its dashboard menu state.
- Screenshot artifacts / owner screenshot approval stop:
  - `N/A`: no rendered UI, layout, print, PDF bytes, visual asset, or brand styling changed.
  - No screenshot artifacts were generated because the changed UI files only alter whether
    anonymous sessions request runtime flags; the owner visual approval stop is not triggered.
  - If any product-rendering, export HTML, PDF output, style, or asset file changes later, use
    `docs/runbooks/ui-debug-hypothesis-and-handoff.md` and run a screenshot artifact handoff before
    PR update.
- Print/PDF/export high-cost debug path:
  - `N/A`: guide PDF routes keep the same consumed PDF artifact path, response headers, and
    entitlement checks after a validated user exists.
  - The `ui-debug-hypothesis-and-handoff` and high-cost debug log paths remain unchanged and are
    required only if a visual/export artifact regression appears.
- Route/label/support sweep:
  - Identifiers searched: `runtime/flags`, `dashboardVisible`, `SiteChrome`, `auth.getUser`,
    `getSession(`, `sb-*-auth-token`, `Supabase egress`, `auth cookie`, `auth-cookie`, and
    `Cache-Control.*no-store`.
  - Directories/surfaces checked: `app/`, `components/`, `lib/`, `tests/`, `docs/runbooks/`,
    `docs/checklists/`, and `docs/task-briefs/`.
  - Fallout handled: course page runtime-flag fetch now shares the same signed-session gate as
    `SiteChrome`; runbook and active brief were updated in this PR.

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

## Post-Deploy After-Metrics Follow-Up

Source: Supabase Management API `logs.all` with redacted aggregate queries only. No raw rows,
headers, IPs, user identifiers, emails, cookies, tokens, or raw env values were stored.

PR `#600` production deployment completed at `2026-05-05T10:47:00Z`; PR `#601` docs-only
production deployment completed at `2026-05-05T10:56:13Z`.

| Metric window                                                       | `/auth/v1/user` requests | Top PostgREST paths                              | Source classes                         | Decision                                                                                             |
| ------------------------------------------------------------------- | ------------------------ | ------------------------------------------------ | -------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| After #600 deploy, `2026-05-05T10:47:00Z` to `2026-05-05T11:16:37Z` | `0`                      | none observed; total `/rest/v1/...` requests `0` | none observed; total edge requests `0` | hold, but evidence is not final because the latest available edge/auth logs still predate deployment |

Refresh evidence captured in the same session:

- `edge_logs`: `0` rows in the after window; latest available edge log in the broader
  24-hour query was `2026-05-05T05:47:15Z`, before the production deploy.
- `auth_logs`: `0` rows in the after window; latest available auth log in the broader
  24-hour query was `2026-05-05T01:18:19Z`, before the production deploy.
- `postgres_logs`: `0` rows in the after window; latest broader-window postgres log was
  `2026-05-05T10:45:45Z`, just before the runtime deployment completed.
- Browser anonymous traffic: no post-deploy auth calls were observed, but the evidence is
  inconclusive until `edge_logs` refresh past the deploy timestamp or a controlled anonymous
  smoke visit is approved and visible in logs.
- Local/CI `node` traffic: absent in the observed post-deploy window, but this is also
  inconclusive because no post-deploy edge rows were available.
- Finance decision: hold. No temporary Pro upgrade or rollback is indicated from these
  after-window counts alone. Rerun after `edge_logs` latest timestamp is later than
  `2026-05-05T10:47:00Z` and the window has real production traffic or approved controlled smoke.

## Checkpoint Log

- `2026-05-05 | planned | created after PR #598 closeout to own runtime auth/cache optimization and Supabase after-metric evidence | next: execute only after owner explicitly starts this follow-up brief`
- `2026-05-05 | in-progress | started from main e39b7f5 on branch supabase-runtime-auth-cache-aftercare-2026-05-05 | next: inventory runtime Supabase auth/PostgREST call sites and identify safe cache/auth reductions`
- `2026-05-05 | in-progress | implemented auth-cookie-gated Supabase user lookup reductions across middleware, public auth-aware pages, SiteChrome, course sync, My Library pages, guide entitlement surfaces, analytics, checkout, portal, and runtime flags | next: run targeted tests and capture remaining after-metrics evidence after Supabase log refresh`
- `2026-05-05 | in-progress | first verify:pre-pr attempt stopped at quality-gate evidence wording; added explicit failure-mode, official SDK, reference surface, screenshot N/A, print/export N/A, and route/support sweep evidence | next: rerun verify:pre-pr`
- `2026-05-05 | done | PR #600 merged at 166a719 after local verify:pre-pr, local verify:pre-merge, and CI passed; remaining Supabase after-metrics are recorded as post-deploy/log-refresh follow-up evidence | next: post-merge closeout PR moves this brief to done`
- `2026-05-05 | post-deploy evidence | queried Supabase aggregate logs for the #600 production deploy window; after window returned 0 edge/auth/postgres rows, but latest available edge/auth logs still predate deployment, so evidence is recorded as hold plus rerun-needed rather than final success proof | next: rerun after edge_logs refresh past 2026-05-05T10:47:00Z with real traffic or owner-approved anonymous smoke`
