# Task Brief: Supabase Egress Containment And Runtime Hardening (10/10)

## Metadata

- `id`: `2026-05-05-supabase-egress-containment-and-runtime-hardening-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-05`
- `updated`: `2026-05-05`
- `mode`: `automation-first after explicit execution approval`

## Goal

Prevent local development, tests, CI, and automation from accidentally consuming production Supabase egress while preserving production auth, admin, entitlement, and My Library behavior.

## Why This Brief Exists

Supabase issued a Free Plan egress warning for organization `OfficeDesk As` and project `freeswimming-org-prod`.

Read-only diagnostics on `2026-05-05` showed:

- Supabase usage dashboard: about `18.6 GB / 5 GB` uncached egress in the billing period, with `0 GB` cached egress, about `4 MB` Storage, about `66 MB` Database size, and `2` MAU.
- Logs Explorer, last 24 hours: `/auth/v1/user` had about `21.6k` calls, followed by thousands of PostgREST calls to `profiles`, `goals`, `training_focuses`, `workouts`, and related My Library tables.
- Dominant source: one local Norway client using user-agent `node` and `x-client-info = supabase-ssr/0.10.2 createServerClient`.
- Database inspect showed very high auth/session-related query counts since stats reset, including more than `1.2M` session/MFA/identity/user lookups.

Interpretation: this is not normal user growth and not Storage-driven. The likely root cause is local Next.js/Node/dev/test automation hitting production Supabase, amplified by broad server-side auth and no-store data reads.

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the `10/10` claim gate:

- Business logic correctness and data integrity
- Data placement and sync boundaries
- Caching and invalidation strategy
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Incident response and support operations
- Finance and reporting operations
- Stack-fit and dependency discipline
- Testing and QA automation
- Scalability and cost efficiency
- DevOps and rollback readiness

## Child Scope Plan

### Child A - Supabase Egress Containment

Must ship first.

Goal: local dev, tests, CI, Playwright, and verification commands must fail closed when production Supabase is configured without an explicit opt-in.

Required outcomes:

- Define environment contract for `production`, `preview`, `local`, `test`, and `ci`.
- Add deterministic guardrail that blocks production Supabase usage in local/test/CI unless a clearly named opt-in flag is set.
- Ensure service-role usage cannot accidentally point at production in tests or local automation.
- Update test and verification defaults so normal validation does not hit production Supabase.
- Add negative-path coverage proving the guardrail blocks production Supabase in unsafe contexts.

### Child B - Runtime Auth And Cache Hardening

Can ship in the same PR only if the diff remains small and validation is clear; otherwise create a follow-up child brief before implementation.

Goal: reduce legitimate production Supabase chatter without weakening auth, admin, entitlement, or My Library behavior.

Required outcomes:

- Remove or narrow public-route server/client `auth.getUser()` calls where user identity is not needed.
- Review `SiteChrome`, runtime flag loading, proxy/session refresh behavior, and course content reads.
- Keep protected routes fail-closed.
- Define cache modes for public/safe reads and keep private/user-specific data no-store or session-bound as needed.
- Add or update negative-path tests for protected route behavior touched by the slice.

### Child C - Supabase Ops Observability Baseline

Can ship as docs plus script/query in Child A if small; otherwise create a follow-up child brief before implementation.

Goal: make egress spikes diagnosable before Supabase sends a restriction warning.

Required outcomes:

- Document Supabase Logs Explorer queries for top paths, user-agent, country, and source classification.
- Document dashboard thresholds and what actions to take at warning, grace-period, and 402-risk levels.
- Define a finance/ops budget and escalation owner for egress.
- Record before/after evidence for `/auth/v1/user` and top PostgREST paths after containment.

## Platform 10/10 Scorecard Mapping

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                    | Evidence Source                                                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `supporting` | No product IA redesign; protected product routes must remain reachable and understandable after environment guardrails.                                               | route smoke evidence + unchanged UI diff review                                | `4/5`                   |
| UX flow clarity                               | `supporting` | Local/dev/test failures must show clear operator messages and exact opt-in/remediation guidance; no end-user UX changes intended.                                     | guardrail error-copy tests + docs review                                       | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this parent brief does not intentionally change rendered UI, print, PDF, layout, or brand surfaces.                                                       | diff review; screenshot handoff not required unless Child B changes UI         | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Production behavior for auth, admin role checks, entitlements, My Library snapshots, and protected routes remains equivalent; no test/dev run can write prod data.    | targeted unit tests + protected-route negative tests + diff review             | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Admin routes keep role-gated access and editor workflow behavior; any changed admin recovery/error copy is documented.                                                | admin negative-path tests + route/support sweep if admin labels change         | `4/5`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no UI semantics, focus behavior, labels, contrast, or interaction surfaces are planned.                                                                   | diff review; required if implementation touches UI                             | `N/A`                   |
| Performance (CWV + payloads)                  | `supporting` | Runtime changes must not increase route payload or blocking requests for `/`, `/course`, or `/my-library`; public reads should reduce repeated network work.          | build/perf budget gate if runtime code changes + route smoke                   | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Environment ownership is explicit: prod data is production-only by default; local/test/CI use mock/example/local/isolated data unless explicit prod opt-in is set.    | env contract docs + guardrail tests + CI config review                         | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Public/safe reads define cache/freshness behavior; private/user-specific data remains no-store or session-bound; any exception is documented.                         | cache-mode diff review + tests for affected route behavior                     | `5/5`                   |
| Reliability and failure handling              | `target`     | Unsafe prod-Supabase contexts fail early with deterministic messages; production routes continue to fail closed with `401`/`403` rather than accidental `500`s.       | guardrail tests + route/API negative-path tests + `verify:pre-pr`              | `5/5`                   |
| Security and authz                            | `target`     | No weakening of auth/session/admin/entitlement checks; production service role is blocked in local/test/CI unless explicitly allowed and never logged.                | security negative tests + secret-redaction review + env lint                   | `5/5`                   |
| Privacy and compliance                        | `target`     | Diagnostics and docs do not commit tokens, raw env values, IP addresses, personal data, or sensitive free text; logs are summarized with redaction.                   | secret scan/diff review + runbook redaction rules                              | `5/5`                   |
| Content governance                            | `supporting` | Runbook and environment contract become source-of-truth docs for Supabase egress response; no product content model changes.                                          | docs review + route/support impact sweep if labels/runbooks move               | `4/5`                   |
| Admin workflow and editability                | `supporting` | Admin editability is unchanged; if admin runtime flags or role visibility change, Help/Guide and runbooks are updated in same PR.                                     | admin workflow smoke + Help/Guide impact note                                  | `4/5`                   |
| SEO and crawlability                          | `supporting` | Public metadata, robots, sitemap, and site-lock behavior remain consistent; no public route should start requiring Supabase auth unnecessarily.                       | sitemap/metadata tests if route boundaries change                              | `4/5`                   |
| AI discoverability                            | `N/A`        | N/A because this slice changes private ops/runtime boundaries, not public AI-discoverable content or structured semantic pages.                                       | explicit scope rationale                                                       | `N/A`                   |
| Analytics and KPI observability               | `target`     | Egress diagnostics include top path/user-agent/source classification and before/after counts; app analytics payloads remain PII-safe.                                 | Supabase Logs Explorer query output + optional local script/test               | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Entitlement, checkout, portal, and download access behavior remains correct; no pricing/catalog/source-of-truth change.                                               | commerce route smoke or targeted tests if touched                              | `4/5`                   |
| Incident response and support operations      | `target`     | Runbook covers Supabase warning, grace-period reduction, 402 symptoms, dashboard checks, Logs Explorer queries, containment, and temporary Pro-upgrade decision.      | new/updated runbook + dry-run of read-only diagnostic commands                 | `5/5`                   |
| Finance and reporting operations              | `target`     | Egress budget, review cadence, alert thresholds, and owner escalation are documented; costs are tied to evidence from Supabase dashboard/logs.                        | finance/ops checklist or runbook section + before/after metric capture         | `5/5`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale routing, translated content, metadata language model, or future i18n storage path changes are planned.                                          | explicit i18n scope rationale                                                  | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Use Next.js/TypeScript/Supabase repo-native env validation, scripts, and existing test stack; add no dependency unless a clear owner-approved diagnostic need exists. | diff review + dependency diff + targeted tests                                 | `5/5`                   |
| Testing and QA automation                     | `target`     | Guardrail, env contract, and touched protected routes have unit/negative-path coverage; `npm run lint:briefs` and `npm run verify:pre-pr` pass before PR handoff.     | targeted unit tests + `verify:pre-pr` + CI                                     | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Read-only logs show local `node` production Supabase calls stop or drop by at least 90% after containment; runtime changes reduce repeated auth/PostgREST chatter.    | before/after Supabase Logs Explorer evidence for `/auth/v1/user` and top paths | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Guardrail is reversible, opt-in is explicit, rollback impact is documented, and production deploy path is not blocked by local/test safety checks.                    | rollback note + env matrix + pre-merge gate                                    | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Child A should prefer process/env validation and test harness configuration over route-level UI changes.
  - Child B must review server/client boundaries before removing auth calls: server protected routes use server-side auth; public client chrome should not force auth reads unless user identity is required.
  - Cache behavior must be explicit per changed route: public/safe content can use stable cache/revalidation, private/session data stays dynamic/no-store.
- TypeScript/domain contracts:
  - Add typed env/runtime classification helpers rather than scattered string checks.
  - Guardrail errors must be deterministic, redacted, and testable.
  - Unsafe context detection should be conservative and fail closed.
- Supabase/data layer:
  - No schema, migration, RLS, storage, or generated type changes are expected for Child A.
  - If Child B changes protected data access, preserve RLS/authz expectations and add negative-path tests.
  - Do not log service role, anon keys, access tokens, raw cookies, or user identifiers.
- External services/tools:
  - Supabase Management API and Logs Explorer diagnostics are read-only.
  - Any diagnostic script must use existing environment credentials, redact secrets, and document required scopes.
  - No new paid service or analytics vendor is in scope.
- UI system:
  - No visual work is planned. Screenshot handoff becomes required only if implementation changes rendered UI, print, layout, PDF, or brand surfaces.
- Testing:
  - Unit tests for env guardrails and unsafe prod-detection.
  - Targeted route/API negative tests for any touched auth/admin/entitlement routes.
  - Existing Playwright/Vitest defaults must not hit production Supabase unless explicitly opted in.

## Data Placement And Sync Contract

- Server-canonical data:
  - Production Supabase remains canonical only for deployed production runtime and explicitly approved production smoke checks.
  - Auth users, profiles, entitlements, admin content, training data, workouts, programs, dryland sessions, guide/course progress, and admin notes remain server-canonical in Supabase.
- Local/test data:
  - Local dev, unit tests, Playwright, CI, and verification use mock/example/local/isolated Supabase configuration by default.
  - Local browser storage remains local-only for existing draft/progress UX buffers unless an existing sync path explicitly writes to the non-production backend.
- Sync policy:
  - No product sync behavior should change in Child A.
  - Child B may reduce redundant sync/auth reads only when protected data ownership and conflict behavior remains unchanged.
- Retention and sensitivity:
  - Do not persist Supabase diagnostic raw logs containing IP addresses, tokens, cookies, user ids, emails, or request headers in repo docs.
  - Summaries may include redacted counts, route names, user-agent classes, and time windows.
- Cache/invalidation:
  - Public/safe reads must state freshness and invalidation policy.
  - Private/user-specific data must remain no-store/session-bound unless a secure cache key and invalidation policy is documented and tested.

## Identity And Rename Contract

No persisted product entity identity changes are planned.

Environment identifiers are operational:

- `production`: deployed production runtime using production Supabase.
- `preview`: deployed preview/staging runtime, preferably with non-production Supabase or explicit production opt-in.
- `local`: developer machine runtime.
- `test`: Vitest/Playwright/local verification runtime.
- `ci`: GitHub Actions or equivalent automation.

The production Supabase project reference is sensitive operational configuration. Briefs and runbooks may name the project role (`production Supabase`) but must not commit raw secret values.

## Scope

Parent scope:

- Create implementation plan and evidence contract for Supabase egress containment, runtime auth/cache hardening, and ops observability.

Likely implementation files for Child A:

- environment validation helpers under `lib/` or `scripts/`,
- test setup/config files,
- `package.json` scripts if needed,
- CI workflow env/defaults if needed,
- relevant unit tests,
- runbook/checklist docs.

Likely implementation files for Child B:

- `lib/supabase/*`,
- `proxy.ts`,
- `components/SiteChrome.tsx`,
- `app/api/runtime/flags/route.ts`,
- public/course content route or related server pages,
- route/API tests for protected behavior.

Likely implementation files for Child C:

- `docs/runbooks/`,
- `docs/checklists/`,
- optional redacted read-only diagnostic script under `scripts/` or `.tmp` guidance if repo-owned.

## Out Of Scope

- Deleting production data.
- Disabling production Supabase for the deployed app.
- Weakening auth, admin role checks, RLS expectations, entitlement checks, or payment/download gates.
- Committing secrets, tokens, raw `.env` values, cookies, user IDs, emails, or raw IP addresses.
- UI redesign, route IA redesign, or visual polish unless a later child brief explicitly scopes it.
- Supabase schema migrations unless a later investigation proves they are necessary.
- Merging without explicit owner approval.

## Acceptance Criteria

1. Parent brief defines Child A, Child B, and Child C with clear boundaries and ship order.
2. Child A implementation blocks accidental production Supabase usage in local/test/CI/verify by default, with explicit opt-in for approved production smoke checks.
3. Test and verification defaults no longer create high-volume `node` traffic against production Supabase.
4. Production runtime still uses production Supabase and preserves protected auth/admin/entitlement/My Library behavior.
5. If Child B is implemented, every removed/narrowed auth/data read has a documented route boundary and cache/freshness decision.
6. Runbook documents Supabase egress response, Logs Explorer queries, threshold actions, 402-risk handling, and temporary Pro-upgrade decision criteria.
7. Before/after evidence shows at least a 90% reduction in local `node` calls to `/auth/v1/user` and top PostgREST paths, or records a concrete blocker and next mitigation.
8. Relevant unit/negative-path tests pass, plus `npm run lint:briefs` and `npm run verify:pre-pr` before PR update.

## Validation

For this parent brief only:

- `npm run lint:briefs`

For Child A implementation:

- `npm run lint:briefs`
- targeted unit tests for env guardrails and unsafe production detection
- targeted tests for affected test/CI defaults
- `npm run verify:pre-pr`
- CI

For Child B implementation if runtime/auth/cache code changes:

- targeted unit tests for changed helpers/routes
- protected route negative-path tests
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run build`
- `npm run verify:pre-pr`
- CI
- `npm run verify:pre-merge` before merge readiness

For Child C observability/runbook:

- dry-run read-only Supabase diagnostic query against a safe time window
- docs/runbook review for secret/PII redaction
- `npm run lint:briefs`
- docs-only or full verify lane depending on whether scripts/configs changed

## Manual QA Environments

No visual QA is planned for this parent brief.

If Child B changes runtime browser behavior:

- local app smoke for `/`, `/course`, `/my-library`, `/auth/sign-in`, and one admin route,
- production-like preview smoke with the intended Supabase environment,
- screenshot handoff only if rendered UI, print, layout, PDF, or brand output changes.

## Route/Label/Support Surface Impact Sweep

Required if implementation changes:

- route protection behavior,
- runtime flags,
- admin labels/actions,
- Help/Guide surfaces,
- runbooks or support recovery paths,
- environment setup instructions used by agents or owner.

Minimum sweep targets:

- `app/`
- `components/`
- `lib/supabase/`
- `tests/`
- `.github/workflows/`
- `docs/runbooks/`
- `docs/checklists/`
- active/planned/done task briefs that mention Supabase, environment config, egress, site lock, Playwright, or verification.

Identifiers searched:

- Supabase environment and opt-in identifiers: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `FS_SUPABASE_ENV`, `FS_ALLOW_PROD_SUPABASE`, `FS_PRODUCTION_SUPABASE_URL`.
- Egress/runtime identifiers: `egress`, `Supabase`, `auth.getUser`, `createServerClient`, `verify:pre-pr`, `Playwright`, `site lock`, `runtime flags`.

Surfaces checked:

- Runtime configuration: `lib/supabase/`, `package.json`, `playwright.config.ts`, `.github/workflows/`, `scripts/`.
- Support and operator documentation: `docs/runbooks/`, `docs/checklists/`, `.env.example`, environment setup docs, active task briefs.
- Tests: unit coverage for runtime env helpers and script-level guardrails.

Fallout handled:

- No route names, user-facing labels, admin workflow actions, or Help/Guide product surfaces are intentionally changed in Child A.
- Support fallout is handled through the Supabase egress runbook and environment/finance checklist updates in this PR.
- If Child B later changes route protection, runtime flags, or rendered behavior, that child must rerun this sweep against `app/`, `components/`, `tests/`, Help/Guide, runbooks, and task briefs before PR handoff.

## Incident / Support Runbook Requirements

The implementation must create or update a runbook that includes:

- Dashboard path for Usage/Egress review.
- Logs Explorer query for top paths by requests.
- Logs Explorer query for grouping by user-agent/country/source class.
- How to distinguish Storage egress from Auth/PostgREST/API egress.
- Immediate containment actions for accidental local/CI production traffic.
- Temporary Pro-upgrade recommendation when production availability is at risk.
- 402 symptom checklist and rollback/escalation path.
- Redaction rules for sharing evidence in briefs/PRs.

## Finance / Reporting Requirements

The implementation must document:

- egress budget owner,
- warning threshold,
- hard action threshold,
- expected review cadence,
- where before/after metrics are recorded,
- how to decide between optimization, temporary Pro upgrade, and rollback.

## Rollback Plan

- Guardrail changes should be reversible by reverting the PR.
- Production deploy must not depend on local-only opt-in flags.
- Any emergency bypass must be explicit, named, redacted in logs, and documented with owner approval.
- If runtime auth/cache hardening causes protected route regressions, revert Child B while keeping Child A containment if possible.

## Completion Record

- `completed_pr`: `#598`
- `merge_commit`: `2657062b47d825f8247cc8ee10d972d082abd6a2`
- `completed_scope`: Child A Supabase egress containment plus Child C runbook and finance checklist baseline.
- `10/10 claim`: yes - PR `#598` Child A containment scope only; runtime auth/cache optimization remains owned by `docs/task-briefs/planned/2026-05-05-supabase-runtime-auth-cache-and-egress-aftercare-10-10.md`.

| Category                                      | Achieved Score | Evidence                                                                                                                                                                                                                                                 |
| --------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Business logic correctness and data integrity | `5/5`          | Product auth/admin/entitlement/My Library runtime behavior was not weakened; guardrails prevent local/test/CI production writes by default; `npm run verify:pre-pr`, CI, and `npm run verify:pre-merge` passed.                                          |
| Data placement and sync boundaries            | `5/5`          | Environment contract defines production, preview, local, test, and ci ownership; local/Playwright/verify defaults use safe example Supabase unless explicit production opt-in is set.                                                                    |
| Caching and invalidation strategy             | `5/5`          | Child A changed environment and automation boundaries without changing runtime read/cache semantics; private/session-bound data remains unchanged; runtime cache optimization is isolated to the follow-up brief.                                        |
| Reliability and failure handling              | `5/5`          | Unsafe production Supabase contexts fail early through deterministic script/runtime guard messages; production deploy path remains available; pre-pr, pre-merge, and CI gates passed.                                                                    |
| Security and authz                            | `5/5`          | Production service-role/live Supabase usage is blocked in unsafe local/test/CI contexts unless explicitly allowed; diagnostics and guard errors avoid logging secrets; protected auth behavior stayed unchanged.                                         |
| Privacy and compliance                        | `5/5`          | Evidence is summarized with redacted counts and source classes only; no raw tokens, cookies, env values, emails, user IDs, or IP addresses were committed.                                                                                               |
| Analytics and KPI observability               | `5/5`          | Supabase egress runbook now includes dashboard path, Logs Explorer queries, source classification, and before/after recording slots; baseline showed about 21.6k `/auth/v1/user` calls in 24h from local `node`.                                         |
| Incident response and support operations      | `5/5`          | `docs/runbooks/supabase-egress-response.md` covers warning response, grace-period/402 symptoms, containment steps, rollback, evidence redaction, and temporary Pro-upgrade criteria.                                                                     |
| Finance and reporting operations              | `5/5`          | `docs/checklists/finance-reporting-baseline.md` records egress budget ownership, review cadence, warning thresholds, hard-action thresholds, and upgrade/rollback decision rules.                                                                        |
| Stack-fit and dependency discipline           | `5/5`          | Implementation used repo-native TypeScript helpers, Node scripts, Vitest, Playwright defaults, existing CI env policy, and added no dependencies.                                                                                                        |
| Testing and QA automation                     | `5/5`          | Targeted Supabase guard tests passed `15/15`; `npm run verify:pre-pr` passed on artifact `artifacts/test-runs/20260505-084557`; `npm run verify:pre-merge` passed on artifact `artifacts/verify-pre-merge/20260505-070141.json`; PR `#598` CI was green. |
| Scalability and cost efficiency               | `5/5`          | Local/dev/test/CI production Supabase traffic is blocked by default, removing the identified high-volume `node` source; post-deploy metric confirmation is tracked in the follow-up aftercare brief.                                                     |
| DevOps and rollback readiness                 | `5/5`          | PR `#598` is revertable, opt-in is explicit through `FS_ALLOW_PROD_SUPABASE`, production deployment is not blocked by local/test guardrails, and merge/preflight gates passed before merge.                                                              |

Remaining follow-ups:

- Configure `FS_PRODUCTION_SUPABASE_URL` in local/CI/preview secret/config surfaces for strongest exact-production detection.
- Capture Supabase after-metrics after dashboard/log refresh and record whether local `node` calls dropped by at least 90%.
- Execute runtime auth/cache hardening only through the planned follow-up brief, with protected-route negative tests.
- Handle the performance-budget tighten recommendation in a separate performance-governance slice.

## Checkpoint Log

- `2026-05-05 | planned | created parent brief after Supabase egress investigation; Child A containment is the first recommended implementation slice | next: owner explicitly executes this brief or Child A before implementation begins`
- `2026-05-05 | in-progress | started Child A on branch chore/supabase-egress-containment; moved parent brief to in-progress, added runtime/script Supabase egress guardrails, defaulted local verify/Playwright to example Supabase, and began runbook/env docs updates | next: run targeted guardrail tests, fix lint/type issues, then run pre-PR gate`
- `2026-05-05 | in-progress | Child A validation passed: targeted Supabase guard tests 15/15, lint/typecheck green, guard CLI allows example/test env and blocks known production-origin CI config, npm run verify:pre-pr full lane passed with safe example Supabase defaults (895 unit tests, build, perf budgets, 456 Playwright cases with 82 passed/374 expected skip) | next: commit, push, open PR, monitor CI, then run verify:pre-merge before merge readiness`
- `2026-05-05 | in-progress | perf-budget trend gate recommended tightening after 4 consecutive weekly green runs with 20.3% worst-margin; decision for this PR: hold budget changes because the active scope is Supabase egress containment, record the recommendation in PR summary, and schedule/handle tightening in the next performance-governance slice | next: do not mix performance-budget threshold edits into this ops/security PR`
- `2026-05-05 | done | PR #598 merged as 2657062 and main synced; post-merge preflight requested docs-only task-brief closeout, moved this brief to done, and recorded Child A completion evidence plus follow-up ownership for runtime auth/cache aftercare | next: open docs-only closeout PR and wait for explicit owner approval before merging it`
