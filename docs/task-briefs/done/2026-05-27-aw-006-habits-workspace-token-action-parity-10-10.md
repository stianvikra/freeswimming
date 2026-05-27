# Task Brief: AW-006 Habits Workspace Token And Action Hierarchy Parity (10/10)

## Metadata

- `id`: `2026-05-27-aw-006-habits-workspace-token-action-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-27`
- `updated`: `2026-05-27`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-habits-workspace-token-parity`
- `execution_mode`: `owner-approved implementation through screenshot handoff; stop before broad PR gates until screenshot approval`

## Brief Audit Record

- `last_audited`: `2026-05-27`
- `base`: `main@de85422`
- `audit_status`: `ready`
- `decision`: Execute this as the current owner-approved PR-sized AW-006 UI slice through screenshot handoff.
- `reason`: PR `#874` and repo-managed closeout PR `#875` are merged, `main` is clean at `de85422`, `npm run post-merge:preflight` was reported green with no pending closeout, and a fresh queue/design/code re-audit found `/my-library/habits` route shell/header/back action plus the top Habits panels still using older local rounded-card/action styling while Goals, My Training, My Swim Profile, My Routines, owned item detail, saved sessions, and My Library hub now use the newer AW-006 token/action hierarchy.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/my-library/habits`, `HabitPerfectDayHub`, habit API/storage contracts, Home/My Routines habit entry contracts, screenshot handoff rules, forward compatibility rules, or verification lanes change before screenshot handoff.

## Goal

Make the `/my-library/habits` workspace shell, header, route action, and top Habits control panels visually align with the current My Library token/action hierarchy while preserving habit data, API behavior, cadence, timers, check-ins, local UI state, analytics, Help/Guide, and support behavior.

## Pre-Implementation Owner Explanation

For ikke-programmerer: Vi rydder Habits-siden slik at den ser ut og oppforer seg mer likt resten av My Library. Knappene, overskriften og kortene skal fa samme rolige visuelle sprak som Goals, My Training, Profile og Routines.

Hvorfor det betyr noe: Habits er en daglig brukerflate. Nar den ser eldre og annerledes ut enn nabosidene, foles produktet mindre helhetlig og mindre ferdig.

Utenfor scope: Vi endrer ikke hvordan vaner lagres, timere fungerer, check-ins registreres, API-er, analytics, Help/Guide eller supportflyt.

Fremoverkompatibilitet: Nye habit-typer og cadence-varianter skal fortsatt bruke samme struktur automatisk. Bare helt nye visuelle tilstander eller nye domenetekster skal kreve egen mapping og test.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Reliability and failure handling`
- `Security and authz`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                          | Evidence                                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library/habits` remains the private Habits workspace reached from My Library/Home/My Routines, with the same purpose, title, and back destination.                     | route/action review + focused tests            | `5/5`                   |
| UX flow clarity                               | `target`     | The Habits header, `Back to My Library`, Perfect Day summary, add-habit action, and daily habit actions are easier to scan without changing habit workflows.                | screenshot handoff + focused tests             | `5/5`                   |
| Visual design quality                         | `target`     | Route shell/header/actions and top Habits panels use My Library token/card/action language with stable spacing and no text overflow on mobile/desktop.                      | before/after screenshots + diff review         | `5/5`                   |
| Business logic correctness and data integrity | `target`     | No changes to habit loading, create/edit/archive/check-in/reset/lapse payloads, cadence logic, timer persistence, snapshot replacement, or Home/My Routines entry behavior. | changed-files review + targeted tests          | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this private member workspace slice changes no admin editor, CRUD, publish workflow, operator queue, or admin action surface.                                   | explicit admin-editor scope rationale          | `N/A`                   |
| Accessibility (a11y)                          | `target`     | One visible `Habits` H1 remains when appropriate; route and habit actions stay keyboard reachable with accessible names and layout-safe touch targets.                      | Testing Library/e2e assertions + screenshot QA | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency, media asset, API call, polling loop, client state model, or route payload growth beyond markup/class changes.                                            | dependency diff + pre-PR gate                  | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical habit definitions/check-ins and local-only UI/timer state boundaries remain unchanged; this slice only changes presentation.                               | data contract + code review                    | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because existing `dynamic = "force-dynamic"` behavior and habit server loading remain unchanged; no fetch/cache path changes.                                           | changed-files review                           | `N/A`                   |
| Reliability and failure handling              | `target`     | Existing schema warning, action success/error, first-run empty, not-due, timer, and syncing states continue to render without shell interference.                           | focused regression tests + diff review         | `5/5`                   |
| Security and authz                            | `target`     | Anonymous `/my-library/habits` still redirects to `/auth/sign-in?next=%2Fmy-library%2Fhabits`; no protected data moves to a new client boundary.                            | route/auth review + focused tests              | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data fields, telemetry payloads, legal copy, consent behavior, logs, secrets, or sensitive diagnostics change.                                          | privacy scope review                           | `N/A`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this active brief, and design inventory record the selected slice without stale active-slice references.                                            | docs diff + brief lint                         | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this slice changes no admin workflow label, Help/Guide action, support recovery procedure, operator edit path, or admin mutation.                               | explicit admin-workflow scope rationale        | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/habits` is authenticated/private and this slice changes no public metadata, sitemap, robots, canonical URL, or indexability contract.              | private-route SEO rationale                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity model, structured data, public semantic content, or AI-facing documentation contract.                                  | AI-discoverability scope rationale             | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event taxonomy, payload, persistence, dashboard, KPI definition, or consent behavior changes.                                                      | analytics scope rationale                      | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no Stripe, checkout, catalog, entitlement, portal, invoice, refund, payout, or reporting behavior.                                           | commerce scope review                          | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A with scope rationale: this changes no incident path, alerting, runbook procedure, support diagnostics, recovery workflow, or support escalation behavior.               | explicit support-ops scope rationale           | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this changes no billing, reconciliation, finance report, payout, refund, invoice, entitlement, provider financial data, or revenue operation.     | explicit finance scope rationale               | `N/A`                   |
| i18n operational readiness                    | `target`     | Route-action, summary, add-habit, and habit action labels stay concise and layout-safe so later localization is not blocked by tight fixed-width assumptions.               | screenshot text-fit review + focused tests     | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `SiteChrome`, existing `/my-library/habits` server route, `HabitPerfectDayHub`, My Library token/action references, Tailwind, and current tests; add no dependency.   | changed-files/dependency diff                  | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused assertions for Habits route shell/action classes and top panel token classes; preserve existing habit feedback/action coverage.                                 | test output + screenshot handoff               | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: token/action parity adds no service call, storage, job, polling, or traffic-dependent cost.                                                                | implementation review                          | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert restores prior markup/tests/docs; no migration, dependency, config, workflow, provider setting, or feature flag rollback is needed.                       | git diff + validation evidence                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep `/my-library/habits` as the authenticated server route with `dynamic = "force-dynamic"`.
  - Reuse `SiteChrome` and `HabitPerfectDayHub`; do not move habit data ownership into a new client boundary.
  - Reuse `/my-library/goals`, `/my-library/training`, `/my-library/profile`, My Library hub, and My Routines token/action direction instead of inventing a new route-specific visual system.
  - Do not change route redirects, server loaders, API routes, cache behavior, Home/My Routines links, or habit feedback semantics.
- TypeScript/domain contracts:
  - Preserve `HabitSnapshot`, `HabitDefinitionView`, `HabitDayItem`, cadence/timer/check-in contracts, payload builders, action handlers, and localStorage key behavior.
  - Do not change validation, API payloads, create/edit/archive/check-in/reset/lapse behavior, or timer persistence.
- Supabase/data layer:
  - N/A; no migration, RLS/authz rule, generated DB type, storage, index, or data access change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, analytics vendor, email provider, SDK, secret, webhook, retry, or idempotency behavior changes.
- UI system:
  - Mature reference surfaces: `/my-library/goals`, `/my-library/training`, `/my-library/profile`, `MyLibraryHub`, and `TodayTabsPanel`.
  - Keep the change route/top-panel scoped; do not create a broad app-wide page shell/button/card primitive in this slice.
  - Screenshot handoff type: `before/after` for `/my-library/habits` desktop and mobile.
- Testing:
  - Add or update focused tests for route shell/action classes and top `HabitPerfectDayHub` panel classes.
  - Preserve existing habit feedback, create, check-in, timer, cadence, and archive coverage.

## Data Placement And Sync Contract

- Server-canonical data:
  - Habit definitions, check-ins, cadence fields, and habit snapshots remain owned by the existing authenticated API/Supabase path.
- Local data:
  - Existing UI state such as expanded rows, recently-created row highlight, add/edit forms, seen row ids, and same-day local timer state stays local-only.
- Sync policy:
  - Mutations continue to replace the local snapshot from the API response; this slice only changes route/control-panel presentation.
- Retention and sensitivity:
  - No new persisted data, storage key, log, event, or sensitive value is introduced.
- Cache/invalidation:
  - No cache mode or invalidation behavior changes.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible identifier, alias, redirect, or compatibility mapping. Existing habit IDs, titles, cadence labels, route labels, and local UI identifiers remain stable.

## Forward Compatibility Contract

- Extensibility surfaces touched:
  - route-local `/my-library/habits` shell/header/back action,
  - `HabitPerfectDayHub` top Perfect Day/Habits panels,
  - habit action visual hierarchy.
- Source of truth:
  - Habit content remains derived from `loadHabitSnapshot`, `HabitSnapshot`, `HabitDefinitionView`, and `HabitDayItem`.
  - Cadence, timer, due/not-due, and completion labels remain derived from existing helpers.
- Additive behavior:
  - new habits returned by existing `HabitSnapshot` fields should continue to render in the existing list without route-shell changes.
  - future habit cadence values that are mapped in the domain helpers should inherit the same panel/action visual treatment.
- Explicit mapping requirements:
  - new habit modes, top-level feedback categories, action labels, route-level actions, workspace labels, or materially different habit states require deliberate copy/class/test/screenshot updates before release.
  - future Help/Guide or support changes are required only if labels, routes, recovery behavior, or workflow meaning change.
- Unknown or deprecated values:
  - this slice adds no new unknown value path; existing typed habit helpers and feedback behavior continue to own unsupported data states.
  - unknown API payloads must not be interpreted as route-shell success states.
- Test/evidence:
  - focused tests verify route actions, top panel token classes, and existing feedback/action contracts remain stable.
  - screenshot handoff checks desktop/mobile text fit.
  - route/label/support sweep checks Habits, My Perfect Day, Add habit, Back to My Library, `/my-library/habits`, Home/My Routines entry fallout, and Help/Guide/support docs.

## Help / Guide Impact

N/A with rationale: this slice changes presentation only. It does not rename routes, labels, workflow actions, Help/Guide content, support recovery behavior, habit storage behavior, or operator instructions.

## Route / Label / Support Surface Sweep

Required because `/my-library/habits`, visible route actions, and top Habits labels are touched.

- Identifiers searched:
  - `/my-library/habits`
  - `Habits`
  - `HabitPerfectDayHub`
  - `My Perfect Day`
  - `Add habit`
  - `Back to My Library`
  - `habits-action-success`
  - `habits-action-error`
  - `today-habits`
- Surfaces checked:
  - `app/`
  - `components/`
  - `tests/`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/design/`
  - `docs/runbooks/`
  - `docs/user-flow-map.md`
- Expected fallout:
  - `app/my-library/habits/page.tsx`,
  - `components/my-library/habits/HabitPerfectDayHub.tsx`,
  - focused tests,
  - this active brief,
  - canonical AW-006 queue,
  - design inventory,
  - screenshot artifacts during implementation.

## Scope

- `app/my-library/habits/page.tsx` route shell/header/back action styling.
- `components/my-library/habits/HabitPerfectDayHub.tsx` top Perfect Day/Habits panel/add action/daily action styling only.
- Focused route/component/e2e/unit assertions where route shell or top panel class contracts change.
- Canonical AW-006 queue and design inventory updates.
- Before/after screenshot handoff artifacts during implementation.

## Out Of Scope

- Habit data model, API routes, Supabase queries, generated database types, migrations, auth, analytics taxonomy, route labels, cadence/timer/check-in business logic, localStorage keys, Home/My Routines navigation behavior, create/edit/archive/check-in/reset/lapse behavior, Help/Guide updates, support workflow, broad member notice primitive, app-wide design-system primitive, new dependencies, commerce, packages, and merge without explicit owner approval.
- `GeneratorIntakeHub`, `WorkoutBuilderHub`, `DrylandBuilderHub`, Program Builder, and other member shell parity work.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves screenshots.

## Acceptance Criteria

1. `/my-library/habits` keeps the same auth redirect and server data-loading behavior.
2. `HabitPerfectDayHub` keeps the same habit data, cadence, timer, create/edit/archive/check-in/reset/lapse actions, localStorage keys, and feedback semantics.
3. The page shell/header/back action visually align with My Library token/action hierarchy.
4. The top Perfect Day and Habits panels use the current token/card/action direction while preserving counts, add-habit toggle, and daily action behavior.
5. No habit business logic, data persistence, API routes, analytics, Help/Guide, or support workflow changes are introduced.
6. Focused tests pass and screenshot handoff is captured before broad gates.
7. Canonical AW-006 queue and design inventory record this selected slice without stale active references.
8. Work stops after screenshot handoff until owner approval.

## Validation

Targeted during implementation:

- `./node_modules/.bin/vitest run tests/unit/habits-page.test.tsx tests/unit/habit-perfect-day-hub.test.tsx` - PASS, 2 files / 26 tests.
- `npm run typecheck` - PASS.
- `npm run lint:briefs -- --all` - PASS.
- `npm run lint:quality-gates` - PASS.
- `git diff --check` - PASS.
- `npx playwright test tests/e2e/my-library-habits.spec.ts --project=desktop-chromium` - completed with 2 skipped because local dev auth could not sign in against the configured Supabase endpoint (`Unexpected token '<'` HTML response); no Playwright failures.
- Route/label/support sweep:
  - `rg -n "/my-library/habits|Habits|HabitPerfectDayHub|My Perfect Day|Add habit|Back to My Library|habits-action-success|habits-action-error|today-habits" app components tests docs/task-briefs/planned docs/task-briefs/in-progress docs/design docs/runbooks docs/user-flow-map.md`
  - Help/Guide/support references were checked across `docs`, `app`, `components`, `tests`, and `lib`.
  - Result: expected references in the Habits route/component, Home/My Routines entry contracts, focused tests, user-flow map, active/planned AW-006 docs, and design inventory only; no Help/Guide, support runbook, route, label, or analytics fallout requires copy/contract changes in this slice.

Visual gate:

- Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
- Capture `before/after` desktop and mobile screenshots for `/my-library/habits`.
- If auth-backed local capture is blocked by local Supabase/dev-login egress, use a temporary local harness that renders the same production route/component with deterministic habit data; remove temporary harness files before validation.
- Record whether any product-rendering file changes after final capture.
- Screenshot artifacts: `output/aw006-habits-workspace-token-parity-2026-05-27-144536`.
- Capture method: real `/my-library/habits` route, temporary `main@de85422` worktree for before, local Supabase mock with deterministic habit rows/check-ins, and temporary capture script removed after capture.
- No product-rendering files, styles, or assets changed after final screenshot capture.

After owner screenshot approval:

- `npm run verify:pre-pr` - PASS full lane (`artifacts/test-runs/20260527-145435/verify.log`; 101 passed / 487 expected environment skips in Playwright).
- commit, push, open/update PR
- required CI checks green
- `npm run verify:pre-merge`

## Manual QA / Screenshot Handoff

Required because this changes visible UI/layout.

- Capture type: `before/after`.
- Required viewports:
  - desktop `/my-library/habits`,
  - mobile `/my-library/habits`.
- Artifact folder pattern:
  - `output/aw006-habits-workspace-token-parity-YYYY-MM-DD-HHMMSS/`
- Expected filenames:
  - `before-habits-workspace-desktop.png`
  - `after-habits-workspace-desktop.png`
  - `before-habits-workspace-mobile.png`
  - `after-habits-workspace-mobile.png`

## Checkpoint Log

- `2026-05-27 | in-progress | created active Habits workspace token/action parity brief from clean main@de85422 after owner approved execution; screenshot approval remains the required visual stop before broad PR gates | next: update queue/inventory, implement route/top-panel token parity, and run focused tests`
- `2026-05-27 | screenshot-handoff | aligned /my-library/habits route shell/header/back action and top HabitPerfectDayHub panels/actions with the current My Library token/action hierarchy while preserving habit data, APIs, cadence, timers, check-ins, localStorage, analytics, Help/Guide, and support behavior; targeted Vitest/typecheck/brief lint/quality-gate/diff-check passed; focused Playwright Habits flow completed with 2 expected local dev-auth skips; route/label/support sweep found no fallout; before/after screenshot artifacts captured at output/aw006-habits-workspace-token-parity-2026-05-27-144536 using the real route plus local Supabase mock; temporary capture script/worktree/build output were removed and no product-rendering files changed after final capture | next: wait for owner screenshot approval before npm run verify:pre-pr, PR creation, and pre-merge gates`
- `2026-05-27 | pre-pr-green | owner approved screenshot handoff; npm run verify:pre-pr passed full lane with 101 passed and 487 expected Playwright environment skips, artifact artifacts/test-runs/20260527-145435/verify.log; perf budget recommendation was hold because worst margin was 14.0% against the 15.0% tighten criterion | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge readiness`
- `2026-05-27 | merged | PR #876 merged as squash commit 5d0c524 after CI and npm run verify:pre-merge passed; repo-managed post-merge preflight surfaced this docs-only closeout | next: move brief to done, complete closeout metadata, update AW-006 queue, and run docs-only closeout gates`

## Completion Record

- `completed`: `2026-05-27`
- `merged_pr`: `#876`
- `squash_commit`: `5d0c5240db67a61ee79b4f92e2ce9c73ca21af41`
- `result`: Closed AW-006 Habits Workspace Token And Action Hierarchy Parity. Habits now visually matches the current My Library workspace hierarchy while keeping habit storage, cadence, timers, check-ins, APIs, auth redirects, Help/Guide, and support behavior unchanged.
- `validation`: Targeted Vitest passed, typecheck passed, brief/quality gates passed, screenshot handoff approved, `npm run verify:pre-pr` passed full lane, PR #876 CI passed, and `npm run verify:pre-merge` passed full lane.
- `10/10 claim`: yes - all critical target categories reached `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                           | Gaps / Notes |
| --------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | PR #876, route/auth review, focused tests                                                          | None         |
| UX flow clarity                               | `5/5`          | Approved screenshot handoff, focused tests                                                         | None         |
| Visual design quality                         | `5/5`          | `output/aw006-habits-workspace-token-parity-2026-05-27-144536`, no rendering changes after capture | None         |
| Business logic correctness and data integrity | `5/5`          | Changed-files review, focused tests, full verify gates                                             | None         |
| Accessibility (a11y)                          | `5/5`          | Testing Library assertions, screenshot QA, full E2E lane                                           | None         |
| Performance (CWV + payloads)                  | `5/5`          | No dependency/media/API additions; perf budgets passed with hold recommendation                    | None         |
| Data placement and sync boundaries            | `5/5`          | Server/local boundary review; no habit persistence changes                                         | None         |
| Reliability and failure handling              | `5/5`          | Existing habit feedback/action tests plus full verify gates                                        | None         |
| Security and authz                            | `5/5`          | Anonymous redirect preserved and tested; no protected data boundary moved                          | None         |
| Content governance                            | `5/5`          | Brief lint, queue/inventory closeout updates                                                       | None         |
| i18n operational readiness                    | `5/5`          | Screenshot text-fit review and concise unchanged labels                                            | None         |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing route/component/token patterns; no new dependency                                  | None         |
| Testing and QA automation                     | `5/5`          | Targeted Vitest, `npm run verify:pre-pr`, CI, `npm run verify:pre-merge`                           | None         |
| DevOps and rollback readiness                 | `5/5`          | Squash commit 5d0c524; normal revert path, no migration/config/provider change                     | None         |
