# Task Brief: AW-006 My Swim Sessions Workspace Token And Action Hierarchy Parity (10/10)

## Metadata

- `id`: `2026-05-28-aw-006-my-swim-sessions-workspace-token-action-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-28`
- `updated`: `2026-05-28`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-my-swim-sessions-workspace-token-parity`
- `execution_mode`: `owner-approved implementation through screenshot handoff; stop before broad PR gates until screenshot approval`

## Brief Audit Record

- `last_audited`: `2026-05-28`
- `base`: `main@24d19af`
- `audit_status`: `ready`
- `decision`: Execute this as the current owner-approved PR-sized AW-006 UI slice through screenshot handoff.
- `reason`: PR `#880` and repo-managed closeout PR `#881` are merged, `main` is clean at `24d19af`, `npm run post-merge:preflight` was reported green with no pending closeout, a fresh queue/design/code re-audit found `/my-library/workouts` and `/my-library/workouts/[workoutId]` still using older route-local rounded blue-card shell/back-action styling while adjacent My Library workspaces now use the newer AW-006 token/action hierarchy, and the owner explicitly said `execute`.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/my-library/workouts`, `/my-library/workouts/[workoutId]`, `WorkoutBuilderHub`, `SavedWorkoutsPanel`, `WorkoutEditor`, workout API/storage/export contracts, screenshot handoff rules, forward compatibility rules, or verification lanes change before implementation.

## Goal

Make the My Swim Sessions route shell, headers, and route back actions visually align with the current My Library token/action hierarchy while preserving workout data, builder/editor behavior, local drafts, exports, Poolside preview, analytics, Help/Guide, and support behavior.

## Pre-Implementation Owner Explanation

For ikke-programmerer: Vi rydder rammen rundt My Swim Sessions-sidene slik at de matcher resten av My Library. Overskrift, avstand, sidecontainer og tilbakehandling skal bli roligere og lettere a skanne.

Hvorfor det betyr noe: My Swim Sessions er en kjerneflate brukeren kommer ofte tilbake til. Nar rammen fortsatt ser eldre ut enn Training, Profile, Goals, Habits, Generator og Dryland, foles produktet mindre helhetlig.

Utenfor scope: Vi endrer ikke swim-session data, builder/editor-logikk, lokale drafts, save/delete/discard, PDF/Poolside/Garmin-export, API-er, analytics, Help/Guide, supportflyt eller treningsinnhold.

Fremoverkompatibilitet: Nye swim sessions og eksisterende builder modes skal arve samme route-shell automatisk. Nye route-actions, builder modes, workflow-stater eller export-handlinger krever eksplisitt mapping, test og screenshot-evidence.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                  | Evidence                                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library/workouts` remains the My Swim Sessions browse/create surface and `/my-library/workouts/[workoutId]` remains the focused session builder route.                         | route/action review + focused tests            | `5/5`                   |
| UX flow clarity                               | `target`     | Browse mode, manual draft modes, focused builder route, and back actions are easier to scan without changing workflow meaning or destinations.                                      | screenshot handoff + focused tests             | `5/5`                   |
| Visual design quality                         | `target`     | Route shells/header/actions use My Library token/action language with stable spacing, no nested page-card sprawl, and no text overflow on mobile/desktop.                           | before/after screenshots + diff review         | `5/5`                   |
| Business logic correctness and data integrity | `target`     | No changes to workout loading, create/save/delete/discard payloads, local draft keys, selected-workout behavior, export payloads, generated filenames, or Poolside preview storage. | changed-files review + targeted tests          | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this private member workspace slice changes no admin editor, CRUD, publish workflow, operator queue, or admin action surface.                                           | explicit admin-editor scope rationale          | `N/A`                   |
| Accessibility (a11y)                          | `target`     | One visible H1 remains per route state; route actions stay keyboard reachable with accessible names and layout-safe touch targets.                                                  | Testing Library/e2e assertions + screenshot QA | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency, media asset, API call, polling loop, client state model, or route payload growth beyond markup/class changes.                                                    | dependency diff + pre-PR gate                  | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical saved workouts and local-only draft/UI/export handoff boundaries remain unchanged; this slice only changes route-shell presentation.                               | data contract + code review                    | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because existing `dynamic = "force-dynamic"` behavior, server snapshot loading, route refreshes, and mutation invalidation remain unchanged.                                    | changed-files review                           | `N/A`                   |
| Reliability and failure handling              | `target`     | Existing schema/load/action/local-draft/empty/missing-session feedback continues to render deterministically through the already-shipped feedback semantics.                        | focused regression tests + diff review         | `5/5`                   |
| Security and authz                            | `target`     | Anonymous workout routes still redirect to sign-in with the same `next` targets; no protected data moves to a public route or new client boundary.                                  | route/auth review + focused tests              | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data fields, telemetry payloads, legal copy, consent behavior, logs, secrets, or sensitive diagnostics change.                                                  | privacy scope review                           | `N/A`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this planned brief, and design inventory record the selected My Swim Sessions slice without stale active references.                                        | docs diff + brief lint                         | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this slice changes no admin workflow label, Help/Guide action, support recovery procedure, operator edit path, or admin mutation.                                       | explicit admin-workflow scope rationale        | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because My Swim Sessions routes are authenticated/private and this slice changes no public metadata, sitemap, robots, canonical URL, or indexability contract.                  | private-route SEO rationale                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity model, structured data, public semantic content, or AI-facing documentation contract.                                          | AI-discoverability scope rationale             | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event taxonomy, payload, persistence, dashboard, KPI definition, or consent behavior changes.                                                              | analytics scope rationale                      | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no Stripe, checkout, catalog, entitlement, portal, invoice, refund, payout, or reporting behavior.                                                   | commerce scope review                          | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A with scope rationale: this changes no incident path, alerting, runbook procedure, support diagnostics, recovery workflow, or support escalation behavior.                       | explicit support-ops scope rationale           | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this changes no billing, reconciliation, finance report, payout, refund, invoice, entitlement, provider financial data, or revenue operation.             | explicit finance scope rationale               | `N/A`                   |
| i18n operational readiness                    | `target`     | Route-action labels stay concise and layout-safe so later localization is not blocked by tight fixed-width assumptions.                                                             | screenshot text-fit review + focused tests     | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `SiteChrome`, existing workout server routes, `WorkoutBuilderHub`, `WorkoutEditor`, `SavedWorkoutsPanel`, My Library token/action references, Tailwind, and current tests.    | changed-files/dependency diff                  | `5/5`                   |
| Testing and QA automation                     | `target`     | Add or update focused assertions for route shell/action classes while preserving existing workout behavior/export coverage; run screenshot handoff before broad gates.              | test output + screenshot handoff               | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: token/action parity adds no service call, storage, job, polling, or traffic-dependent cost.                                                                        | implementation review                          | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert restores prior markup/tests/docs; no migration, dependency, provider setting, feature flag, or config rollback is needed.                                         | git diff + validation evidence                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep `/my-library/workouts` and `/my-library/workouts/[workoutId]` as authenticated server routes with `dynamic = "force-dynamic"`.
  - Reuse `SiteChrome`, `WorkoutBuilderHub`, `WorkoutEditor`, and `SavedWorkoutsPanel`; do not move workout data ownership into a new client boundary.
  - Reuse `/my-library/training`, `/my-library/profile`, `/my-library/goals`, `/my-library/habits`, `/my-library/generator`, `/my-library/dryland`, `MyLibraryHub`, and `TodayTabsPanel` token/action direction instead of inventing a new swim-session-only visual system.
  - Do not change route redirects, server loaders, API routes, cache behavior, export routes, or workout feedback semantics.
- TypeScript/domain contracts:
  - Preserve workout library snapshots, selected workout handling, manual draft modes, local draft helpers, training-focus options, CSS pace prefill, export handoff state, and Poolside preview contracts.
  - Do not change validation, API payloads, generated artifacts, filenames, session-step behavior, or save/delete/discard transitions.
- Supabase/data layer:
  - N/A; no migration, RLS/authz rule, generated DB type, storage, index, or data access change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, analytics vendor, email provider, SDK, secret, webhook, retry, or idempotency behavior changes.
- UI system:
  - Mature reference surfaces: `/my-library/training`, `/my-library/profile`, `/my-library/goals`, `/my-library/habits`, `/my-library/generator`, `/my-library/dryland`, `MyLibraryHub`, `TodayTabsPanel`, and `SavedWorkoutsPanel`.
  - Keep the change route-shell scoped; do not create a broad app-wide page shell/button/card primitive in this slice.
  - Screenshot handoff type: `before/after` for `/my-library/workouts` desktop and mobile, plus `/my-library/workouts/[workoutId]` if the focused builder route materially changes.
- Testing:
  - Add or update focused tests for route shell/action classes and protected redirects.
  - Preserve existing workout builder, saved-list, editor, export, Poolside preview, route, and server coverage.

## Data Placement And Sync Contract

- Server-canonical data:
  - Saved workouts, workout drafts once saved, workout IDs, training context snapshots, and profile-derived CSS data remain owned by the existing authenticated API/Supabase path.
- Local data:
  - Existing unsaved manual drafts, builder UI state, local editor state, export handoff state, Poolside preview draft handoff, and temporary feedback state remain client-local/transient.
- Sync policy:
  - Mutations continue to use the same create/save/delete/discard/export API paths, route refresh behavior, and local draft recovery rules; this slice only changes route-shell presentation.
- Retention and sensitivity:
  - No new persisted data, storage key, log, event, or sensitive value is introduced.
- Cache/invalidation:
  - No cache mode or invalidation behavior changes.

## Identity And Rename Contract

No identity changes. Existing workout IDs remain stable internal identifiers, workout/session titles remain editable display labels, and route params continue to use existing workout IDs. This slice adds no alias, redirect, analytics identity, import/export identity, or rename/repurpose rule.

## Forward Compatibility Contract

- Extensibility surfaces touched:
  - `/my-library/workouts` route-local shell/header/back action,
  - `/my-library/workouts/[workoutId]` focused builder shell/header/back action,
  - visual containment around `WorkoutBuilderHub`.
- Source of truth:
  - saved session rows still derive from the existing workout library snapshot and `recentWorkouts`.
  - route heading still derives from existing selected workout environment, entry mode, and manual draft mode.
  - action visibility still derives from existing route mode and builder state.
- Additive behavior:
  - new saved swim sessions returned by existing snapshot fields should continue to inherit the same route shell and saved-list hierarchy automatically.
  - existing builder modes can reuse the same route-action visual helper.
- Explicit mapping requirements:
  - new builder modes, route-level actions, destructive workflows, export handoff states, or materially different session workflow states require deliberate copy/class/test/screenshot updates before release.
  - future Help/Guide or support changes are required only if labels, routes, recovery behavior, or workflow meaning change.
- Unknown or deprecated values:
  - this slice adds no new unknown value path; existing typed workout helpers and feedback behavior continue to own unsupported data states.
  - unknown API payloads must not be interpreted as route-shell success states.
- Test/evidence:
  - focused tests verify route actions, route shell classes, auth redirects, and existing builder/export contracts remain stable.
  - screenshot handoff checks desktop/mobile text fit.
  - route/label/support sweep checks My Swim Sessions, Pool session builder, Open-water session builder, Swim session builder, Back to My Library, Back to My Swim Sessions, `/my-library/workouts`, and `/my-library/workouts/[workoutId]`.

## Help / Guide Impact

N/A with rationale: this slice changes presentation only. It does not rename routes, labels, workflow actions, Help/Guide content, support recovery behavior, workout storage behavior, export behavior, or operator instructions.

## Route / Label / Support Surface Sweep

Required because `/my-library/workouts`, `/my-library/workouts/[workoutId]`, visible route actions, and top My Swim Sessions labels are touched.

- Identifiers to search:
  - `/my-library/workouts`
  - `My Swim Sessions`
  - `Pool session builder`
  - `Open-water session builder`
  - `Swim session builder`
  - `WorkoutBuilderHub`
  - `WorkoutEditor`
  - `SavedWorkoutsPanel`
  - `Back to My Library`
  - `Back to My Swim Sessions`
  - `workout-builder-route-shell`
  - `workout-builder-page-card`
- Surfaces to check:
  - `app/`
  - `components/`
  - `tests/`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/design/`
  - `docs/runbooks/`
  - `docs/user-flow-map.md`
- Expected fallout:
  - `app/my-library/workouts/page.tsx`,
  - `app/my-library/workouts/[workoutId]/page.tsx`,
  - focused tests,
  - this planned brief,
  - canonical AW-006 queue,
  - design inventory,
  - screenshot artifacts during implementation.

## Scope

- `app/my-library/workouts/page.tsx` route shell/header/back action styling.
- `app/my-library/workouts/[workoutId]/page.tsx` route shell/header/back action styling.
- Focused route/unit assertions where route shell or action class contracts change.
- Canonical AW-006 queue and design inventory updates.
- Before/after screenshot handoff artifacts during implementation.

## Out Of Scope

- Workout data model, API routes, Supabase queries, generated database types, migrations, auth, analytics taxonomy, route labels, session-step business logic, localStorage keys, local draft sync behavior, create/save/delete/discard behavior, Workout Editor internals, PDF/Poolside/Garmin/handoff behavior, generated filenames, Help/Guide updates, support workflow, broad member notice primitive, app-wide design-system primitive, new dependencies, commerce, packages, and merge without explicit owner approval.
- `WorkoutBuilderHub`, `WorkoutEditor`, and `SavedWorkoutsPanel` internals beyond ensuring existing top-level route-shell fit remains visually coherent.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until implementation is explicitly requested and owner approves screenshots.

## Acceptance Criteria

1. `/my-library/workouts` and `/my-library/workouts/[workoutId]` keep the same auth redirects and server data-loading behavior.
2. `WorkoutBuilderHub` keeps the same workout data, creation, save/delete/discard, local draft, export, Poolside preview, route refresh, and feedback semantics.
3. The My Swim Sessions route shell/header/actions visually align with My Library token/action hierarchy.
4. Browse, manual draft, and focused builder modes keep their current headings and back destinations.
5. No workout business logic, data persistence, API routes, analytics, Help/Guide, export behavior, or support workflow changes are introduced.
6. Focused tests pass and screenshot handoff is captured before broad gates.
7. Canonical AW-006 queue and design inventory record this selected slice without stale active references.
8. Work stops after screenshot handoff until owner approval.

## Validation

Targeted during implementation:

- PASS: `./node_modules/.bin/vitest run tests/unit/workout-pages.test.tsx tests/unit/workout-builder-hub.test.tsx tests/unit/workouts-routes.test.ts tests/unit/workouts-server.test.ts tests/unit/workouts-shared.test.ts` (`5` files, `144` tests).
- PASS: `npm run typecheck`.
- PASS: `npm run lint:briefs` (`No changed task briefs found. Skipping.` after the move because the in-progress brief is untracked in this working tree).
- PASS: `npm run lint:briefs:all` (`378` brief files).
- PASS: `git diff --check`.
- PASS: Route/label/support sweep with the identifiers listed above; findings were expected route, component, test, queue, design-inventory, app-knowledge, and runbook references only. No Help/Guide or support-procedure fallout was required because labels, routes, workflow meaning, and recovery behavior were preserved.
- Quality-gate evidence:
  - identifiers searched: `/my-library/workouts`, `My Swim Sessions`, `Pool session builder`, `Open-water session builder`, `Swim session builder`, `WorkoutBuilderHub`, `WorkoutEditor`, `SavedWorkoutsPanel`, `Back to My Library`, `Back to My Swim Sessions`, `workout-builder-route-shell`, and `workout-builder-page-card`.
  - surfaces checked: `app/`, `components/`, `tests/`, `docs/task-briefs/planned/`, `docs/task-briefs/in-progress/`, `docs/design/`, `docs/runbooks/`, and `docs/user-flow-map.md`.
  - fallout handled: no Help/Guide, support-runbook, route, workflow-label, or recovery-procedure update was needed because the slice preserved workflow meaning and destinations.

Visual gate:

- PASS: Started local after-server with `env SITE_LOCK_ENABLED=0 FS_ALLOW_PROD_SUPABASE=1 npm exec next dev -- -H 127.0.0.1 -p 3000`.
- PASS: Started clean `main@24d19af` before-server in a temporary worktree with `env SITE_LOCK_ENABLED=0 FS_ALLOW_PROD_SUPABASE=1 npm exec next dev -- -H 127.0.0.1 -p 3001`.
- PASS: Captured replacement `before/after` desktop and mobile viewport screenshots for `/my-library/workouts`.
- PASS: Captured replacement `before/after` desktop and mobile viewport screenshots for `/my-library/workouts/00000000-0000-4000-8000-000000000001?entry=manual-pool` as a non-mutating focused builder route state.
- PASS: Screenshot metrics showed no horizontal overflow and no route-action text overflow at `1280px` desktop or `412px` mobile CSS viewport widths.
- Artifact folder: `output/aw-006-my-swim-sessions-workspace-2026-05-28-090314`.
- Superseded artifact folder: `output/aw-006-my-swim-sessions-workspace-2026-05-28-083208` because the browse fullpage captures were too tall for reliable owner review in common image viewers.
- Caveat: local screenshot login intentionally used `FS_ALLOW_PROD_SUPABASE=1` with the configured dev-bypass account, and local dev artifacts include the Next dev indicator/admin note affordances where that account can see them.
- PASS: Owner approved the refreshed screenshot handoff before `npm run verify:pre-pr`, PR creation, and `npm run verify:pre-merge`.

After owner screenshot approval:

- PASS: `npm run verify:pre-pr` (full lane: branch-current, quality gates, admin audit, env parity, generated PR body lint, ESLint with one existing ignored-output warning, typecheck, unit tests, build, perf budgets, and Playwright E2E).
- open/update PR
- required CI checks green
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-05-28 | planned | created selected owner-approved AW-006 My Swim Sessions Workspace Token And Action Hierarchy Parity brief from clean main@24d19af after #880/#881; no runtime implementation started | next: wait for explicit execute/build/implement instruction before moving this brief to in-progress`
- `2026-05-28 | in-progress | owner explicitly said execute; moved brief to in-progress on branch aw-006-my-swim-sessions-workspace-token-parity | next: implement screenshot-reviewed /my-library/workouts route-shell visual parity before npm run verify:pre-pr`
- `2026-05-28 | screenshot handoff ready | implemented route-shell/header/action token parity for /my-library/workouts and /my-library/workouts/[workoutId], added focused route tests, ran targeted validation, and captured before/after screenshot artifacts in output/aw-006-my-swim-sessions-workspace-2026-05-28-083208 | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-05-28 | screenshot handoff refreshed | owner reported some original fullpage screenshots could not be opened; regenerated handoff with viewport-only before/after PNGs in output/aw-006-my-swim-sessions-workspace-2026-05-28-090314 and verified dimensions/readability | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-05-28 | screenshot approved | owner approved the refreshed screenshot handoff in output/aw-006-my-swim-sessions-workspace-2026-05-28-090314 | next: run npm run verify:pre-pr before commit/push/PR`
- `2026-05-28 | pre-pr gate passed | npm run verify:pre-pr passed full lane after screenshot approval | next: commit, push, and open PR`
- `2026-05-28 | done | PR #882 merged as 3c5a340 after GitHub CI and npm run verify:pre-merge passed; post-merge preflight surfaced this repo-managed docs-only closeout | next: close out the done brief and canonical AW-006 queue reference`

## Completion Record

- `completed`: `2026-05-28`
- `merged_pr`: `#882`
- `squash_commit`: `3c5a340`
- `result`: Closed AW-006 My Swim Sessions Workspace Token And Action Hierarchy Parity. My Swim Sessions now uses the same My Library token/action hierarchy for route shell, header, and back actions on browse and focused builder routes while preserving workout data, APIs, auth, local drafts, exports, analytics, Help/Guide, and support behavior.
- `validation`: Targeted Vitest PASS; owner-approved refreshed screenshot handoff captured at `2026-05-28 09:03`; `npm run verify:pre-pr` PASS on `ab90caba`; GitHub CI PASS on `ab90caba`; `npm run verify:pre-merge` PASS; post-merge preflight identified only this docs-only closeout.
- `10/10 claim`: yes - all critical target categories reached `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                                                        | Gaps / Notes |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | PR #882 diff and route tests preserved My Swim Sessions browse/create and focused builder route roles.                          | None.        |
| UX flow clarity                               | `5/5`          | Owner-approved before/after screenshot handoff and focused route tests covered browse, manual draft, and focused builder modes. | None.        |
| Visual design quality                         | `5/5`          | Screenshot artifacts captured `2026-05-28 09:03`; no product-rendering source edits after final capture.                        | None.        |
| Business logic correctness and data integrity | `5/5`          | Changed-files review and targeted Vitest confirmed presentation-only behavior for workout data workflows.                       | None.        |
| Accessibility (a11y)                          | `5/5`          | Route/page tests and screenshot review preserved H1s, accessible action names, keyboard focus, and layout-safe controls.        | None.        |
| Performance (CWV + payloads)                  | `5/5`          | No dependency, media, API, polling, or data-loading change; `npm run verify:pre-pr` passed full-public lane.                    | None.        |
| Data placement and sync boundaries            | `5/5`          | Server-canonical saved workouts and local draft/UI/export boundaries remained unchanged by the diff.                            | None.        |
| Reliability and failure handling              | `5/5`          | Focused tests preserved auth redirect, missing-session, manual draft, and focused builder feedback behavior.                    | None.        |
| Security and authz                            | `5/5`          | Route/auth review and tests preserved anonymous redirect behavior and protected data boundaries.                                | None.        |
| Content governance                            | `5/5`          | AW-006 queue, design inventory, and this brief were updated; closeout moves the brief to `done`.                                | None.        |
| i18n operational readiness                    | `5/5`          | Screenshot text-fit review and tests kept route/action labels concise without fixed-width assumptions.                          | None.        |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing routes, `SiteChrome`, `WorkoutBuilderHub`, Tailwind tokens, and current tests; no dependency.                   | None.        |
| Testing and QA automation                     | `5/5`          | Targeted Vitest, `npm run verify:pre-pr`, GitHub CI, and `npm run verify:pre-merge` passed on current HEAD.                     | None.        |
| DevOps and rollback readiness                 | `5/5`          | PR #882 is a normal squash merge with no migration/provider changes; revert restores prior markup/tests/docs/CI.                | None.        |
