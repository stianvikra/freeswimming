# Task Brief: Browser Supabase Egress Guard Production Crash Hotfix (10/10)

## Metadata

- `id`: `2026-05-05-browser-supabase-egress-guard-prod-crash-hotfix-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-05`
- `updated`: `2026-05-05`
- `mode`: `automation-first hotfix after production crash diagnosis`

## Goal

Production preview-access and app chrome must load without the local/test Supabase egress guard throwing in the browser, while server, script, local, test, and CI guardrails remain fail-closed.

## Why This Brief Exists

Production `https://freeswimming.org/preview-access?next=%2Fmy-library` returned `200` HTML, but the hydrated browser page showed `This page couldn't load`. Headless Chrome captured this page error:

`Unsafe Supabase configuration: NEXT_PUBLIC_SUPABASE_URL points to a Supabase cloud project in a local/test context...`

The failure came from `components/SiteChrome.tsx` importing `lib/supabase/browser.ts`, which imported server env helpers and bundled `lib/supabase/egress-guard.ts` into client runtime.

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the `10/10` claim gate:

- UX flow clarity
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

## Platform 10/10 Scorecard Mapping

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                          | Evidence Source                                                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `supporting` | Route purpose and navigation stay unchanged; preview-access must show the existing unlock flow instead of an app error.                                                     | production/local smoke and screenshot artifacts                       | `4/5`                   |
| UX flow clarity                               | `target`     | `/preview-access?next=/my-library` hydrates to the existing unlock UI, with no dead-end Next app error.                                                                     | before/after screenshot artifact handoff and browser console probe    | `5/5`                   |
| Visual design quality                         | `supporting` | No visual redesign; rendered UI should match the existing preview-access route.                                                                                             | screenshot artifacts; owner screenshot approval stop before PR update | `4/5`                   |
| Business logic correctness and data integrity | `supporting` | Supabase client construction changes only public browser env reading; no data mutation, sync, or persistence behavior changes.                                              | targeted unit tests and diff review                                   | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this hotfix does not change admin editor labels, actions, fields, or publish workflows.                                                                         | explicit scope review                                                 | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Existing preview-access semantics/focus behavior are unchanged; the app error no longer replaces the unlock UI.                                                             | screenshot/manual smoke; no markup changes                            | `4/5`                   |
| Performance (CWV + payloads)                  | `target`     | Browser bundle must not run or require the server egress guard path; no new dependency or extra network request is introduced.                                              | diff review, build, route-level payload budget gate                   | `5/5`                   |
| Data placement and sync boundaries            | `supporting` | Public anon key and URL remain public browser config; service-role and production safety decisions remain server/script-only.                                               | data placement review and tests                                       | `4/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this hotfix does not change route cache mode, data freshness, revalidation, or persisted reads.                                                                 | explicit cache scope rationale                                        | `N/A`                   |
| Reliability and failure handling              | `target`     | Browser hydration must not throw the local/test Supabase guard in production; server guard still blocks unsafe local/test production Supabase config.                       | targeted unit tests, browser smoke, verify gates                      | `5/5`                   |
| Security and authz                            | `target`     | Fail-closed server/script egress guard behavior remains intact; browser helper exposes only `NEXT_PUBLIC_*` values and never service-role secrets.                          | negative-path tests and privacy/secrets boundary review               | `5/5`                   |
| Privacy and compliance                        | `target`     | No secrets, raw env values, cookies, user identifiers, or tokens are committed or logged; screenshot artifacts contain only public unlock UI/error state.                   | diff review and screenshot review                                     | `5/5`                   |
| Content governance                            | `N/A`        | N/A because no course/content source, Help/Guide content, or publish status model changes.                                                                                  | explicit content scope rationale                                      | `N/A`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD, editorial workflow, or operator label changes.                                                                                                   | explicit admin workflow scope rationale                               | `N/A`                   |
| SEO and crawlability                          | `supporting` | Preview-access metadata and server-rendered HTML remain unchanged; hydration no longer replaces the UI with an error.                                                       | production/local smoke and build                                      | `4/5`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured data, or crawl policy changes.                                                                                           | explicit AI/crawl scope rationale                                     | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supabase after-metrics work remains separate; this hotfix only removes the client crash that blocks route smoke.                                                            | PR summary and existing runbook context                               | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because checkout, portal, entitlements, pricing, refunds, and reconciliation paths are untouched.                                                                       | explicit commerce scope rationale                                     | `N/A`                   |
| Incident response and support operations      | `target`     | Hotfix records symptom, root cause, validation, rollback path, and screenshot evidence so support can distinguish app crash from Supabase quota/payment issues.             | this brief, PR summary, screenshot artifacts                          | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this does not change revenue, refunds, payouts, invoices, entitlement accounting, or reporting data; no Pro-upgrade decision is required by this symptom.       | explicit finance scope rationale                                      | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this does not change locale routing, translation storage, metadata language policy, or user-visible copy strings.                                               | explicit i18n scope rationale                                         | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Next.js client/server boundary and Supabase helper pattern; split browser public env reading from server guard instead of adding dependencies.                 | diff review, typecheck, build                                         | `5/5`                   |
| Testing and QA automation                     | `target`     | Add targeted unit coverage for browser public env helper and server guard negative path; run targeted tests, screenshot smoke, `verify:pre-pr`, CI, and `verify:pre-merge`. | targeted tests and gates                                              | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | No new Supabase calls or repeated requests are introduced; server-side egress protections still prevent accidental local/test production traffic.                           | diff review and existing egress guard tests                           | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Patch is reversible by switching `lib/supabase/browser.ts` back to previous env helper import; no migration, flag, or dependency rollback required.                         | PR rollback note, build, pre-merge gate                               | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: `components/SiteChrome.tsx` remains the shared chrome surface; markup, labels, and classes are unchanged.
  - Server/client boundary: `lib/supabase/browser.ts` is client-only and must consume browser-safe `NEXT_PUBLIC_*` env helpers without importing server egress guard code.
  - Route/action/API boundary: no route handler, server action, middleware, or protected API behavior changes.
  - Cache/invalidation: no cache mode, revalidation, or freshness behavior changes.
- TypeScript/domain contracts:
  - Keep deterministic required-env errors for missing public browser config.
  - Preserve server env helper validation/invariant contract for unsafe Supabase cloud config in local/test contexts.
- Supabase/data layer:
  - No schema, migration, RLS, storage, generated type, or data sync changes.
  - Server/admin/middleware helpers still use `getSupabaseUrl()` and service-role guardrails.
- External services/tools:
  - Supabase SDK usage stays on existing `@supabase/ssr`; no new SDK, webhook, idempotency, or retry path.
  - Support diagnostics classify this as a client bundle guard crash, not quota/payment or Pro-upgrade evidence.
- UI system:
  - Screenshot artifact handoff is required because the user-facing symptom is a rendered app error.
  - Comparison type: `before/after` with `before-preview-access-desktop.*` from current production and `after-preview-access-desktop.*` from fixed local/preview smoke.
  - Owner screenshot approval stop applies before `verify:pre-pr`, PR creation, and `verify:pre-merge`.
- Testing:
  - Targeted Vitest coverage for browser public env helper and server guard fail-closed behavior.
  - Browser smoke verifies preview-access hydrates without the original page error.

## Data Placement And Sync Contract

- Server-canonical data: unchanged; Supabase remains canonical for auth users, entitlements, profiles, admin content, progress, workouts, programs, and course/library state.
- Local data: browser helper reads only public `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; no local persistence is added.
- Sync policy: no sync triggers, conflict resolution, retry/backoff, or failure UX for persisted domain data changes.
- Retention and sensitivity: no raw env values, cookies, tokens, IPs, emails, or user IDs are stored in docs, tests, or screenshots.
- Cache/invalidation: no route/data cache mode changes.

## Identity And Rename Contract

N/A with rationale: no persisted entities, slugs, route params, titles, analytics identifiers, imports/exports, or operator-visible identifiers are added, removed, renamed, or repurposed.

## Unknown Surface Classification Rationale

`lib/supabase/browser-env.ts` and `lib/supabase/env.ts` are runtime helper surfaces that may be classified by the quality gate as an unknown surface. They are intentionally scoped to Supabase client configuration boundaries and are covered by stack-fit, security, reliability, testing, and rollback evidence in this brief.

## Route/Label/Support Surface Impact Sweep

- Impact sweep runbook: `docs/runbooks/route-label-support-surface-impact-sweep.md` is considered because a support-visible failure page appeared, but no route, label, Help/Guide surface, or workflow action is renamed.
- Identifiers searched: `createBrowserSupabaseClient`, `getSupabaseUrl(`, `NEXT_PUBLIC_SUPABASE_URL`, `egress-guard`, `preview-access`, and `This page couldn't load`.
- Directories/surfaces checked: `app/`, `components/`, `lib/supabase/`, `tests/unit/`, `docs/runbooks/`, and `docs/task-briefs/`.
- Fallout handled: browser env reading is split from server env guard; no Help/Guide copy or support label update is needed.

## Scope

- Add a browser-safe Supabase public env helper.
- Update `lib/supabase/browser.ts` to avoid importing server egress guard helpers.
- Add targeted unit regression coverage.
- Capture before/after screenshot artifacts for the production error and fixed unlock UI.
- Update this brief with checkpoint and closeout evidence.

## Out Of Scope

- Supabase schema, RLS, migrations, generated database types, or storage policy changes.
- Weakening server, script, middleware, admin, service-role, auth, entitlement, or RLS guardrails.
- Supabase billing, Pro upgrade, quota plan changes, or egress threshold changes.
- UI redesign, copy edits, route changes, Help/Guide changes, or SEO metadata changes.
- Committing secrets, tokens, cookies, raw env values, or raw private logs.

## Acceptance Criteria

1. Production-like browser hydration no longer throws the local/test Supabase egress guard error.
2. `lib/supabase/browser.ts` imports only browser-safe public env helpers.
3. Server `getSupabaseUrl()` still rejects unsafe Supabase cloud URLs in local/test contexts unless explicitly allowed.
4. Missing browser public Supabase env values still throw deterministic required-env errors.
5. Before/after screenshot artifacts show the current production error and fixed preview-access unlock UI.
6. No dependency, migration, or route behavior change is introduced.
7. `npm run verify:pre-pr`, CI, and `npm run verify:pre-merge` pass before merge readiness.

## Validation

- `npx vitest run tests/unit/supabase-env.test.ts`
- Browser smoke for `https://freeswimming.org/preview-access?next=%2Fmy-library` before fix and local fixed preview-access after fix.
- Screenshot artifacts with `before-preview-access-desktop.*` and `after-preview-access-desktop.*`.
- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run build`
- `npm run test:perf:budgets`
- `npm run test:e2e`
- `npm run verify:pre-pr`
- CI
- `npm run verify:pre-merge`

## Rollback Plan

- Revert the helper split commit if it causes unexpected browser/server behavior.
- No database, dependency, env, cache, or migration rollback is required.
- If production still shows the same app error after deploy, re-run the headless browser console/pageerror probe and inspect whether a different client exception is now surfacing behind the first guard crash.

## Help/Guide Impact

N/A with rationale: this hotfix restores the existing preview-access route and app chrome. It does not change admin/user workflow labels, recovery instructions, Help/Guide content, or operator actions.

## Screenshot Artifact Handoff Plan

- Artifact folder: `output/browser-supabase-egress-guard-prod-crash-hotfix-YYYY-MM-DD-HHMMSS`.
- Captured: record local timestamp in handoff and closeout.
- Comparison type: `before/after`.
- Required files:
  - `before-preview-access-desktop.png`
  - `after-preview-access-desktop.png`
- Owner screenshot approval stop: pause after handoff before `verify:pre-pr`, PR creation, and `verify:pre-merge`, unless owner explicitly waives the stop.

## Checkpoint Log

- `2026-05-05 | diagnosis | production HTML returned 200 but browser hydration crashed with Supabase egress guard pageerror; root cause is server guard imported into browser helper through SiteChrome | next: split browser public env helper, test, and capture screenshot evidence`
- `2026-05-05 | implementation | added browser-only public Supabase env helper and updated browser client import; targeted validation passed: ./node_modules/.bin/vitest run tests/unit/supabase-env.test.ts, 1 file / 12 tests | next: capture before/after screenshot evidence`
- `2026-05-05 | screenshot evidence | captured before/after artifacts in output/browser-supabase-egress-guard-prod-crash-hotfix-2026-05-05-145750 at 2026-05-05 14:57 local; before production shows app error plus Supabase guard pageerror, after local hotfix shows preview-access unlock UI with zero pageErrors | next: owner screenshot approval stop before verify:pre-pr`
- `2026-05-05 | pre-pr gate | owner approved screenshot handoff; npm run verify:pre-pr PASS on full lane for commit 1616a34: branch-current, lint:briefs, quality-gates, admin/env/pr-body lint, eslint, typecheck, 172 unit files / 905 tests, build, perf budgets, and Playwright 82 passed / 374 skipped | perf ratchet: budget trend recommended tighten after 4 weekly green runs; decision hold for this production-crash hotfix and carry the tighten prompt into the next performance-budget slice/PR summary | next: push branch and open PR`
