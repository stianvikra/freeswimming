# Task Brief: AW-006 My Routines Workspace Token And Action Hierarchy Parity (10/10)

## Metadata

- `id`: `2026-05-25-aw-006-my-routines-workspace-token-action-parity-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-25`
- `updated`: `2026-05-26`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `branch`: `aw-006-my-routines-workspace-token-parity`
- `execution mode`: `shipped implementation slice; repo-managed docs-only closeout`

## Brief Audit Record

- `last_audited`: `2026-05-26`
- `base`: `main@5a70205`
- `audit_status`: `done`
- `decision`: Close the shipped AW-006 My Routines workspace token and action hierarchy parity slice.
- `reason`: PR `#855` shipped the owner-approved My Routines workspace parity slice after screenshot approval, local full-lane verification, CI, and pre-merge gates passed.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/my-library/routines`, `TodayTabsPanel`, `MyLibraryHub`, `lib/my-library/today`, habits/dryland route contracts, screenshot handoff rules, forward compatibility rules, or verification lanes change before screenshot handoff.

## Goal

Make the dedicated `/my-library/routines` workspace feel visually aligned with the newer My Library token/action hierarchy while preserving the existing Micro Sessions and Habits behavior.

## Pre-Implementation Owner Explanation

Vi gjør `My Routines`-siden roligere og mer lik resten av nye My Library-opplevelsen, slik at Micro Sessions og Habits fremstår som én ryddig arbeidsflate. Det betyr bedre kort, knapper, spacing og tab-styling, ikke ny rutinefunksjonalitet. Utenfor scope er endringer i dryland/habits-data, API-er, lagring, synk, tab-logikk, lenkemål, varsler, Help/Guide og supportflyt.

Forward compatibility: `TodayTabsPanel` skal fortsatt drives av eksisterende `TODAY_SURFACE_TABS` og `TodaySurfaceState`, slik at nye rutinevalg eller tilstander enten flyter gjennom samme kontrakt eller får en eksplisitt mapping/fallback i en senere brief.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Accessibility (a11y)`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Security and authz`
- `Testing and QA automation`
- `Stack-fit and dependency discipline`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                       | Evidence                                     | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library/routines` remains the focused My Routines workspace reached from My Library/Home, with the same Micro Sessions and Habits destinations.                                     | unit/e2e tests + route/link review           | `5/5`                   |
| UX flow clarity                               | `target`     | The active tab, routine summary, `Edit`, `Open`, and back action remain obvious and keyboard reachable on mobile and desktop.                                                            | component tests + screenshot handoff         | `5/5`                   |
| Visual design quality                         | `target`     | The page and `TodayTabsPanel` use the current My Library/token language without nested card sprawl, awkward spacing, or unrelated redesign.                                              | before/after screenshots + diff review       | `5/5`                   |
| Business logic correctness and data integrity | `target`     | No changes to habits/dryland state builders, API routes, localStorage keys, plan status logic, cadence, timers, or persisted data.                                                       | changed-files review + targeted tests        | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this private member workspace slice changes no admin editor, admin CRUD, publish workflow, or operator action.                                                               | scope review                                 | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Existing heading, tablist, tabpanel, selected-tab, and link semantics remain valid; visual changes do not introduce hidden or unlabeled controls.                                        | Testing Library assertions + screenshot QA   | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency, media asset, API call, client state model, or route payload growth beyond markup/class changes.                                                                       | dependency diff + pre-PR gate                | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this slice changes no local-only data, server-canonical data, sync trigger, conflict policy, retention, or cache invalidation.                                               | explicit state-boundary review               | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because existing `dynamic = "force-dynamic"` and server snapshot loading remain unchanged; no fetch/cache path or invalidation behavior changes.                                     | changed-files review                         | `N/A`                   |
| Reliability and failure handling              | `target`     | Existing syncing/error/setup/ready routine states continue to render through `TodaySurfaceState` without changing fallback behavior.                                                     | targeted state tests                         | `5/5`                   |
| Security and authz                            | `target`     | Anonymous `/my-library/routines` still redirects to `/auth/sign-in?next=%2Fmy-library%2Froutines`; no protected data moves client-side.                                                  | existing e2e + route review                  | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data fields, telemetry payloads, legal copy, consent behavior, logs, secrets, or sensitive diagnostics change.                                                       | privacy scope review                         | `N/A`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this brief, and design inventory record the selected slice without stale active-slice references.                                                                | docs diff + brief lint                       | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this slice changes no admin workflow labels, Help/Guide content, support recovery procedure, or operator edit path.                                                          | support-surface sweep                        | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/routines` is authenticated/private and this slice changes no public metadata, sitemap, robots, canonical URL, or crawlable route.                               | private-route SEO rationale                  | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured data, entity model, crawl-safe page, or AI-facing documentation contract changes.                                                     | AI-discoverability scope review              | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event taxonomy, payload, persistence, dashboard, or KPI definition changes.                                                                                     | analytics scope review                       | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no Stripe, checkout, catalog, entitlement, portal, invoice, refund, payout, or reporting behavior.                                                        | commerce scope review                        | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this slice changes no incident path, alerting, runbook procedure, support diagnostics, or recovery workflow; existing support docs remain accurate.                          | support scope rationale                      | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice changes no billing, reconciliation, finance report, payout, refund, invoice, entitlement, provider financial data, or revenue operation.                          | finance scope rationale                      | `N/A`                   |
| i18n operational readiness                    | `target`     | Avoid text-in-layout assumptions that make future localization harder; keep labels concise and existing route-owned English copy stable.                                                 | screenshot text-fit review + component tests | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing `TodayTabsPanel`, `MyLibraryHub` visual references, Tailwind tokens/classes, and current tests; add no dependency or broad primitive.                                     | changed-files/dependency diff                | `5/5`                   |
| Testing and QA automation                     | `target`     | Update focused component/e2e assertions where class/structure changes matter; pass targeted tests, brief lint, diff check, screenshot handoff, and required gates after visual approval. | test output + verify artifacts               | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: class/markup polish should not add runtime cost and should keep the panel data-driven for future routine tabs/states.                                                   | changed-files review                         | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Diff is reversible by reverting this branch; no migration, dependency, config, workflow, provider, or feature-flag rollback is needed.                                                   | git diff + PR/CI/pre-merge evidence          | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep `/my-library/routines` as the authenticated server route with `dynamic = "force-dynamic"`.
  - Reuse `TodayTabsPanel` as the mature routines view contract.
  - Reuse My Library hub/token direction instead of inventing a new route-specific visual system.
  - Do not change route redirects, server loaders, or cache behavior.
- TypeScript/domain contracts:
  - Preserve `TodaySurfaceState`, `TodaySurfaceTabId`, `TODAY_SURFACE_TABS`, and the dryland/habit snapshot inputs.
  - Do not change validation, state transitions, or fallback state builders.
- Supabase/data layer:
  - N/A; no migration, RLS/authz rule, generated DB type, storage, or query behavior changes.
- External services/tools:
  - N/A; no Stripe, Supabase provider config, analytics vendor, email provider, SDK, webhook, secret, retry, or idempotency behavior changes.
- UI system:
  - Reference surfaces: `MyLibraryHub` token-backed shell/actions and existing `TodayTabsPanel` tab semantics.
  - Avoid nested page-card composition; route sections should read as one workspace rather than card inside card.
  - Screenshot handoff type: `before/after` for `/my-library/routines` desktop and mobile.
- Testing:
  - Update focused `TodayTabsPanel`/My Library routines assertions.
  - Preserve e2e coverage for signed-in route rendering and anonymous redirect.

## Data Placement And Sync Contract

N/A with rationale: this is a visual/action hierarchy parity slice. It introduces no new local-only state, server-canonical state, browser storage, sync trigger, conflict resolution, retry policy, retention rule, cache invalidation, or sensitive data handling. Existing dryland and habit snapshots remain the source of truth.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible identifier, alias, redirect, or compatibility mapping. Existing route and labels remain stable.

## Forward Compatibility Contract

- Extensibility surfaces touched:
  - routine tab labels/actions in `TODAY_SURFACE_TABS`,
  - routine panel states in `TodaySurfaceState`,
  - route-local `/my-library/routines` presentation.
- Source of truth:
  - tabs and panel state remain derived from `lib/my-library/today.ts`.
  - dryland/habits data remains derived from existing server snapshots.
- Additive behavior:
  - current styling should apply to any existing tab rendered from `TODAY_SURFACE_TABS`.
  - existing `ready`, `complete`, `setup`, `paused`, `syncing`, and `error` states continue to use the same panel contract.
- Explicit mapping requirements:
  - a new routine family, new action label, or materially different state requires a deliberate update to `TodaySurfaceState` copy/tests and screenshot evidence.
  - future Help/Guide or support changes are required only if labels, routes, recovery behavior, or workflow meaning change.
- Unknown or deprecated values:
  - no new unknown value path is introduced; existing typed unions continue to fail at compile/test time when unsupported tabs/states are added without mapping.
- Test/evidence:
  - focused component tests keep the tab/panel contract data-driven.
  - route/label/support sweep checks My Routines, Micro Sessions, Habits, Edit/Open, and `/my-library/routines` fallout.

## Help / Guide Impact

N/A with rationale: this slice changes presentation only. It does not rename routes, labels, workflow actions, Help/Guide content, support recovery behavior, or operator instructions. Existing `docs/user-flow-map.md` and `docs/runbooks/auth-account-support.md` should remain accurate.

## Route / Label / Support Surface Sweep

Required because `/my-library/routines` and visible My Routines surfaces are touched.

- Search identifiers:
  - `My Routines`
  - `Micro Sessions`
  - `Habits`
  - `TodayTabsPanel`
  - `/my-library/routines`
  - `my-library-today-tabs`
  - `Edit`
  - `Open`
- Surfaces:
  - `app/`
  - `components/`
  - `tests/`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/design/`
  - `docs/runbooks/`
  - `docs/user-flow-map.md`
- Expected fallout:
  - `app/my-library/routines/page.tsx`,
  - `components/my-library/MyLibraryRoutinesWorkspace.tsx`,
  - `components/my-library/TodayTabsPanel.tsx`,
  - focused tests,
  - this active brief,
  - canonical AW-006 queue,
  - notice/design inventory where relevant.

Actual sweep evidence on `2026-05-25`:

- `rg -n "/my-library/routines|My Routines|my-library-today-tabs|Back to My Library" app components tests docs docs/runbooks`
- `rg -n "TODAY_SURFACE_TABS|TodaySurfaceState|buildTodayMicroSessionsState|buildTodayHabitsState|micro-sessions|Habits" lib components tests docs docs/runbooks`
- `rg -n "Help|Guide|help center|support|runbook|admin note|page-note|context" docs app components tests lib | rg -i "my-library/routines|My Routines|today-tabs|routine"`

Fallout handled in this slice: extracted the route presentation into `MyLibraryRoutinesWorkspace`, aligned `TodayTabsPanel` classes/actions with My Library tokens, updated focused unit/e2e assertions, and recorded the active queue/inventory state. Help/Guide and support docs remain accurate because labels, routes, recovery behavior, and workflow meaning did not change.

## Scope

- `app/my-library/routines/page.tsx`
- `components/my-library/MyLibraryRoutinesWorkspace.tsx`
- `components/my-library/TodayTabsPanel.tsx`
- focused unit/e2e tests for My Routines route/panel
- canonical AW-006 queue and design inventory updates
- before/after screenshot handoff artifacts

## Out Of Scope

- Habits data model, API routes, timers, cadence, check-in logic, localStorage keys, or analytics taxonomy.
- Dryland/Micro Sessions data model, API routes, release logic, status transitions, source-session behavior, or localStorage keys.
- My Routines navigation contract, route redirects, auth behavior, Help/Guide/support docs, or labels beyond incidental styling context.
- Home routine quick actions, My Library hub row behavior, Course, Plans, Contact, Admin, Stripe, Supabase, analytics, email, or commerce behavior.
- Broad shared Button/Card/PageShell/Tabs primitive rollout.
- Package/dependency/config/workflow changes.
- Merge to `main`.

## Acceptance Criteria

1. `/my-library/routines` keeps the same auth redirect and server data-loading behavior.
2. `TodayTabsPanel` keeps the same tab labels, `Edit`/`Open` destinations, selected-tab semantics, and panel state source.
3. The page and panel visually align with My Library token/action hierarchy and avoid nested card sprawl.
4. No habits/dryland business logic, data persistence, API routes, analytics, or support workflow changes are introduced.
5. Focused tests pass and screenshot handoff is captured before broad gates.
6. Canonical AW-006 queue and design inventory record this active slice without stale references.

## Validation

Targeted during implementation:

- `npx vitest run tests/unit/today-tabs-panel.test.tsx` PASS: 1 file / 3 tests.
- `npm run typecheck` PASS.
- `npm run lint:briefs -- --all` PASS: all 365 brief files.
- `git diff --check` PASS.
- `npx playwright test tests/e2e/my-library-landing-entrypoints.spec.ts --project=desktop-chromium` PASS with expected local auth skips: 1 passed, 2 skipped because dev-login could not sign in against the local test Supabase placeholder/egress guard.
- Screenshot artifact probe PASS: `file output/aw-006-my-routines-token-parity-2026-05-25-224120/*.png` confirmed 4 PNGs.

After owner screenshot approval:

- `npm run verify:pre-pr` PASS on `2026-05-26`: full lane, branch current with `origin/main@5e7969f`, lint/typecheck/unit/build/perf/e2e passed. Playwright E2E summary: 101 passed, 487 expected local skips from the supported environment/auth matrix.
- Performance budget decision: hold stretch tightening for this slice. The gate reported `runs 7/2` but recommendation `hold` because observed margin was `14.0%` and below the `15.0%` tighten threshold.
- GitHub required checks after PR `#855` PASS: Analyze, CodeQL, Vercel, Vercel Preview Comments, deploy-preview, e2e-smoke, site-lock-smoke, size-check, and verify.
- `npm run verify:pre-merge` PASS on `2026-05-26` against branch head `9b4454d`; marker `artifacts/verify-pre-merge/20260526-034250.json`.

## Manual QA / Screenshot Handoff

Required because this changes visible UI/layout.

- Capture type: `before/after`.
- Required viewports:
  - desktop `/my-library/routines`,
  - mobile `/my-library/routines`.
- Artifact folder pattern:
  - `output/aw-006-my-routines-token-parity-YYYY-MM-DD-HHMMSS/`
- Stop after screenshot handoff for owner approval before `npm run verify:pre-pr`.

Captured evidence:

- `output/aw-006-my-routines-token-parity-2026-05-25-224120/`
- Files:
  - `before-my-routines-desktop.png`
  - `after-my-routines-desktop.png`
  - `before-my-routines-mobile.png`
  - `after-my-routines-mobile.png`
- Caveat: auth-backed local capture is blocked by the existing dev-login/Supabase egress guard in this environment, so screenshots were captured through a temporary local fixture route that rendered the same production `MyLibraryRoutinesWorkspace`/`TodayTabsPanel` with deterministic snapshots. The temporary route was removed before validation and handoff.

## Implementation Checkpoint Log

- `2026-05-25 | in-progress | started from clean main@5e7969f after PR #853 and repo-managed closeout #854; owner approved and explicitly requested execute/implement for AW-006 My Routines Workspace Token And Action Hierarchy Parity; created branch aw-006-my-routines-workspace-token-parity and active brief | next: update queue/inventory, implement route/panel token-action parity, run targeted validation, capture before/after screenshot handoff, then wait for owner visual approval before broad gates`
- `2026-05-25 | implementation + screenshot stop | extracted My Routines route presentation, aligned workspace shell and TodayTabsPanel with My Library token/action hierarchy, kept Today state/data contracts and route auth/server loaders unchanged, updated focused unit/e2e assertions, completed route/label/support sweep, passed targeted validation, and captured before/after screenshots at output/aw-006-my-routines-token-parity-2026-05-25-224120 | next: owner screenshot approval before npm run verify:pre-pr, commit, push, PR, CI, and verify:pre-merge`
- `2026-05-26 | screenshot approved | owner approved the before/after screenshot handoff; no product-rendering files changed after capture | next: run npm run verify:pre-pr before commit, push, and PR automation`
- `2026-05-26 | pre-pr gate passed | npm run verify:pre-pr passed the full lane after screenshot approval; no product-rendering files changed after screenshot capture; performance budget recommendation recorded as hold because margin is below the tighten threshold | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
- `2026-05-26 | done | My Routines Workspace Token And Action Hierarchy Parity shipped in PR #855 as squash commit 5a70205 after screenshot approval, local pre-PR, CI, and local pre-merge gates passed; repo-managed docs-only closeout moves the brief to done and clears active queue references | next: run docs-only closeout gates, merge the closeout PR, rerun post-merge preflight, then make the mandatory chat-handoff assessment`

## Completion Record

- `completed`: `2026-05-26`
- `merged_pr`: `#855`
- `squash_commit`: `5a70205e0531b49678cf948977c6423104f0d156`
- `result`: Closed AW-006 My Routines Workspace Token And Action Hierarchy Parity by aligning `/my-library/routines` and `TodayTabsPanel` with the My Library token/action hierarchy while preserving routine data, auth, routes, links, and workflow behavior.
- `validation`: `npx vitest run tests/unit/today-tabs-panel.test.tsx` PASS: 1 file / 3 tests; `npm run typecheck` PASS; `npm run lint:briefs -- --all` PASS: all 365 brief files; `git diff --check` PASS; `npx playwright test tests/e2e/my-library-landing-entrypoints.spec.ts --project=desktop-chromium` PASS with 1 passed and 2 expected local auth skips; screenshot handoff captured and owner-approved; `npm run verify:pre-pr` PASS full lane; PR `#855` GitHub CI PASS; `npm run verify:pre-merge` PASS on `9b4454d`.
- `screenshot_artifacts`: `output/aw-006-my-routines-token-parity-2026-05-25-224120/`, captured `2026-05-25 22:41`, owner approved `2026-05-26`; no product-rendering files changed after screenshot capture.
- `performance_budget_decision`: hold stretch tightening for this slice; gate reported `runs 7/2` and margin `14.0%`, below the `15.0%` tighten threshold.
- `10/10 claim`: yes - all critical target categories reached `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                                           | Gaps / Notes |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------ | ------------ |
| Product goals and IA                          | `5/5`          | PR `#855`, route/link review, focused My Routines route assertions                                                 | No gaps.     |
| UX flow clarity                               | `5/5`          | `TodayTabsPanel` tests, before/after screenshot handoff, unchanged `Edit`/`Open` destinations                      | No gaps.     |
| Visual design quality                         | `5/5`          | `output/aw-006-my-routines-token-parity-2026-05-25-224120/`                                                        | No gaps.     |
| Business logic correctness and data integrity | `5/5`          | changed-files review, unchanged dryland/habits state builders, targeted unit/e2e coverage                          | No gaps.     |
| Accessibility (a11y)                          | `5/5`          | Testing Library tab semantics and screenshot QA preserved selected-tab/panel behavior                              | No gaps.     |
| Performance (CWV + payloads)                  | `5/5`          | no dependency/media/API/client-state growth; full `verify:pre-pr` and `verify:pre-merge` passed                    | No gaps.     |
| Reliability and failure handling              | `5/5`          | existing ready/setup/syncing/error states still render through `TodaySurfaceState` and targeted tests              | No gaps.     |
| Security and authz                            | `5/5`          | private route/auth redirect unchanged; no protected data moved client-side                                         | No gaps.     |
| Content governance                            | `5/5`          | active brief moved to done; canonical queue closeout updates; brief lint passed                                    | No gaps.     |
| i18n operational readiness                    | `5/5`          | screenshot text-fit review and concise existing English labels                                                     | No gaps.     |
| Stack-fit and dependency discipline           | `5/5`          | reused `TodayTabsPanel`, `MyLibraryRoutinesWorkspace`, My Library token classes, and existing tests; no dependency | No gaps.     |
| Testing and QA automation                     | `5/5`          | targeted Vitest/Playwright, typecheck, brief lint, diff check, screenshot handoff, full gates, and CI passed       | No gaps.     |
| DevOps and rollback readiness                 | `5/5`          | normal git revert rollback; no migrations, config, workflow, package, env, or provider changes                     | No gaps.     |
