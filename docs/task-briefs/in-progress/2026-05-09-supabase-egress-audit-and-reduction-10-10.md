# Task Brief: Supabase Egress Audit And Reduction (10/10)

## Metadata

- `id`: `2026-05-09-supabase-egress-audit-and-reduction-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-09`
- `updated`: `2026-05-09`

## Goal

Reduce avoidable Supabase egress and make quota/restriction failures support-diagnosable before more feature work continues.

## Product Decision

Treat the current Supabase `402 exceed_egress_quota` incident as real production risk. The first slice should ship low-risk reduction and diagnostics now:

- cache public published content reads,
- keep admin preview/draft/session-bound reads uncached,
- classify Supabase quota/project restriction auth failures with a clear safe user message,
- update support/runbook guidance.

Do not build the larger admin incident/status-banner system in this slice; that belongs in a later brief.

Observed evidence before implementation:

- Supabase Usage screenshot shows `18.614 GB` egress on Free Plan for `2026-04-16` to `2026-05-16`.
- Vercel production logs showed `POST /auth/sign-in` failing with Supabase status `402` and `exceed_egress_quota`.
- Supabase docs state Free includes `5 GB` uncached egress, egress spans Database/Auth/Storage/API/etc., and Fair Use restrictions can respond with `402`.

References:

- https://supabase.com/docs/guides/platform/manage-your-usage/egress
- https://supabase.com/docs/guides/platform/billing-faq#fair-use-policy

## Relevance Assessment Before Scoring

Relevant target categories are reliability, caching, performance/cost, auth failure handling, privacy-safe diagnostics, support operations, and testing. Visual design is supporting only because this slice may change auth error copy but not layout. Admin editor CRUD, finance reporting, commerce checkout, SEO/AI content, and i18n are not primary targets.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Business logic correctness and data integrity
- Caching and invalidation strategy
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Incident response and support operations
- Stack-fit and dependency discipline
- Testing and QA automation
- Scalability and cost efficiency

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                          | Evidence                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The slice has one clear job: reduce avoidable Supabase egress while preserving public/admin/user route purpose.                                             | brief scope + route audit                          | `5/5`                   |
| UX flow clarity                               | `target`     | Auth users get a clearer safe message for service restriction failures without misleading countdowns.                                                       | unit tests + screenshot handoff if UI copy changes | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: auth error copy may change, but layout and visual system should remain unchanged.                                                          | screenshot handoff if rendered auth copy changes   | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Public cache changes do not cache user-specific, admin preview, draft, or session-bound data across users.                                                  | route/cache review + tests                         | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin preview/draft content remains uncached and current admin editing behavior remains unchanged.                                         | admin preview cache review                         | `4/5`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: existing auth status semantics and labels remain intact when error copy changes.                                                           | component review + existing auth tests             | `4/5`                   |
| Performance (CWV + payloads)                  | `target`     | Public content reads use cache/revalidation and avoid per-view Supabase egress; no new client dependency or payload growth.                                 | implementation review + build/test evidence        | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Published public content is cacheable server data; preview/admin/user data remains server-canonical and uncached where session-bound.                       | data-boundary section + code review                | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Public published content has explicit revalidation; preview/admin/draft/auth routes remain `no-store` or request-bound.                                     | route headers/cache helper tests                   | `5/5`                   |
| Reliability and failure handling              | `target`     | Supabase quota/project restriction during sign-in produces deterministic non-500 UX and support-visible logs.                                               | auth error classifier tests + runbook update       | `5/5`                   |
| Security and authz                            | `target`     | Cache is not applied to protected data; admin/service-role reads expose only intended public projections.                                                   | code review + negative-path tests where applicable | `5/5`                   |
| Privacy and compliance                        | `target`     | Logs and UI do not expose raw tokens, allowlists, provider internals, or unnecessary PII.                                                                   | log review + tests                                 | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: published content remains the source for public reads; cache freshness is explicitly bounded.                                              | cache contract review                              | `4/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: no admin editing UI changes; admin preview/draft still bypasses public cache.                                                              | admin preview route review                         | `4/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: public route cache changes must not loosen private site-lock, robots, sitemap, or preview noindex behavior.                                | private-gate/public route review                   | `4/5`                   |
| AI discoverability                            | `N/A`        | N/A because this slice does not add, remove, or restructure AI-discoverable public content semantics.                                                       | explicit scope rationale                           | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no product analytics taxonomy expansion; server diagnostics must identify quota/restriction category safely.                               | log category review                                | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: public catalog overrides may be cached, but checkout, entitlements, pricing contracts, refunds, and payouts are unchanged.                 | plans/catalog regression tests                     | `4/5`                   |
| Incident response and support operations      | `target`     | Runbook tells support/admin how to detect `402 exceed_egress_quota`, what dashboard to check, and what user-facing message means.                           | runbook diff + log evidence                        | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice does not change invoices, payouts, refunds, subscriptions, or revenue reporting.                                                     | explicit scope rationale                           | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: new auth copy remains concise and structurally localizable; no locale routing or content model change.                                     | copy review                                        | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use Next.js cache/revalidation primitives, existing Supabase helpers, typed projections, and no new dependency.                                             | architecture review + dependency diff              | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused tests for error classification and cache/user-boundary behavior; broad gates pass.                                                              | unit tests + `verify:pre-pr` + `verify:pre-merge`  | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Public traffic no longer causes one Supabase published-content read per page/API view; documented follow-up if further dashboard data shows another source. | audit notes + code review                          | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback is safe by reverting cache/auth classifier changes; no migration required; runbook documents operational fallback.                                 | rollback note + validation gates                   | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Use Next server-side cache/revalidation for public published content.
  - Keep admin preview/draft and auth/session-bound handlers dynamic/no-store.
  - Do not trust client cache for auth, admin, preview, or My Library data.
- TypeScript/domain contracts:
  - Add a typed Supabase auth error classifier with deterministic categories.
  - Keep public data projections explicit; do not use `select("*")`.
- Supabase/data layer:
  - No schema migration.
  - Public cache reads may use service-role only for narrow public-safe projections already rendered on public pages.
  - User-specific and protected reads remain RLS/session-bound and uncached across users.
- External services/tools:
  - Supabase and Vercel logs are diagnostic sources.
  - No secret values or raw provider payloads are exposed to users.
- UI system:
  - Reuse existing `AuthRequestStatus` and sign-in layout if copy changes.
  - Screenshot handoff is required only for rendered auth UI copy changes.
- Testing:
  - Unit tests for auth error classification.
  - Route/cache tests or focused unit coverage for public cache helpers.
  - Existing auth/sign-in and private-gate tests remain valid.

## Data Placement And Sync Contract

- Server-canonical:
  - Supabase Auth, user sessions, admin roles, content publish state, product catalog overrides.
- Cacheable public data:
  - published course modules/lessons and public catalog projections only.
- Local/browser:
  - no new local state.
- Sync policy:
  - public cache revalidates on a bounded TTL; admin preview/draft remains live/no-store.
- Retention and sensitivity:
  - no new retained user data.
  - auth diagnostic logs must avoid tokens, preview cookies, allowlists, and raw email lists.
- Cache/invalidation:
  - public published content has explicit revalidate TTL and public response cache headers.
  - admin preview/draft/session-bound routes keep `no-store`.

## Identity And Rename Contract

- Canonical stable ID:
  - existing Supabase row ids and runtime content ids remain unchanged.
- Human-readable identifiers:
  - existing slugs/titles remain unchanged.
- Mutability rules:
  - no rename behavior is changed.
- Compatibility contract:
  - existing content runtime alias/repair behavior remains unchanged.
- Observability and repair:
  - auth errors are classified into safe categories; unresolved content identity handling remains existing behavior.

## Scope

- Audit Supabase-heavy public/dynamic routes.
- Cache low-risk public published content/catalog reads.
- Preserve no-store behavior for admin preview/draft/user-specific data.
- Improve sign-in error classification for Supabase quota/project restriction.
- Update auth/support runbook.
- Add focused tests.

## Out Of Scope

- Supabase billing/plan changes.
- Admin incident dashboard/status-banner system.
- Admin incident alert email; follow-up brief:
  `docs/task-briefs/planned/2026-05-09-admin-incident-alerts-and-status-ops-10-10.md`.
- Schema migrations.
- Storage/CDN migration.
- Dryland builder changes.
- Habit/micro/statistics implementation.

## Acceptance Criteria

1. Public published course content no longer requires a Supabase DB read for every public course content request.
2. Public catalog override reads are cached or otherwise bounded.
3. Preview/admin/draft/user-specific reads remain request-bound and are not globally cached.
4. Supabase `402`, `exceed_egress_quota`, or project-restricted auth errors show a clear safe sign-in failure message without countdown.
5. Rate-limit auth errors still show cooldown countdown.
6. Runbook documents how to diagnose Supabase egress restriction and the expected UI/log behavior.
7. No new dependencies or secrets are added.

## Validation

- `npm run lint:briefs`
- focused unit tests for auth error classification/cache behavior
- targeted auth sign-in UI/e2e if rendered copy changes
- screenshot handoff if rendered auth UI copy changes
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Quality Gate Evidence

- API and server actions unexpected 500/failure-mode evidence:
  `classifySignInEmailError` converts Supabase `402`, `exceed_egress_quota`, project-restricted, provider delivery, and rate-limit failures into deterministic action-state messages instead of unexpected 500 behavior. Unknown failures still return the existing safe generic message.
- External services official integration pattern:
  The implementation uses existing Supabase server helpers and Next.js `unstable_cache`/response cache headers; no new SDK or dependency was added. Supabase egress and fair-use behavior is grounded in official docs linked in this brief.
- Route/label/support sweep identifiers and surfaces:
  Identifiers searched: `force-dynamic`, `no-store`, `/api/course/content`, `loadCourseModulesByStatus`, `signInWithOtp`, `Could not send sign-in email`, `exceed_egress_quota`, `products`, and `select("*")`.
  Directories/surfaces checked: `app/`, `lib/`, `tests/unit/`, `docs/runbooks/`, and active/planned task briefs. Fallout handled in auth support runbook and focused unit tests.
- Reference surface or shared UI contract:
  Rendered auth copy keeps the existing sign-in route, card structure, `AuthRequestStatus`, form controls, and layout. The change is message semantics only; no new visual component was introduced.
- Screenshot artifact handoff:
  Screenshot artifacts were captured in `output/supabase-egress-hotfix-20260509-084249` with `after-sign-in-service-limit-desktop.png`, `after-sign-in-service-limit-mobile.png`, and `reference-sign-in-default-desktop.png`.
- Screenshot comparison naming:
  The handoff used `after/reference` naming because it compared the changed service-limit auth state to the unchanged default sign-in surface.
- Owner screenshot approval stop:
  The screenshot handoff was presented before continuing into `verify:pre-pr`; owner approved continuation with `ok, gjør som anbefalt`.
- High-cost UI/export debug path:
  UI capture followed `docs/runbooks/ui-debug-hypothesis-and-handoff.md`; the actual consumed artifact files in `output/` were inspected by handoff before gates continued.

## Manual QA Environments

- Local auth/sign-in error-state rendering when feasible.
- Production Supabase Usage remains owner-verified from dashboard because Codex cannot access dashboard internals.

## Help / Guide Impact

Update `docs/runbooks/auth-account-support.md` with the Supabase `402 exceed_egress_quota` diagnostic path and user-facing guidance.

## Route / Label / Support Surface Sweep

Search targets before broad gates:

- `force-dynamic`
- `no-store`
- `/api/course/content`
- `loadCourseModulesByStatus`
- `signInWithOtp`
- `Could not send sign-in email`
- `exceed_egress_quota`
- `products`
- `select("*")`

## Rollback

Revert this PR to return to previous uncached public reads and generic auth error handling. No migration rollback is required.

## Checkpoint Log

- `2026-05-09` - Created after Supabase dashboard confirmed `18.614 GB` egress on Free Plan and production logs showed `402 exceed_egress_quota` blocking sign-in. Next: implement low-risk cache and auth error diagnostics.
- `2026-05-09` - Implemented public published-content/catalog caching, auth failure classification, runbook update, focused tests, and screenshot handoff. Next: rerun `npm run verify:pre-pr`.
