# Task Brief: AW-006 HabitsHub Inner Token/Input/Action Parity (10/10)

## Metadata

- `id`: `2026-06-03-aw-006-habits-hub-inner-token-input-action-parity-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-03`
- `updated`: `2026-06-03`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-habits-hub-inner-token-input-action-parity`
- `execution_mode`: `owner-approved end-to-end implementation; stop after screenshot handoff for owner approval before pre-PR gate`

## Brief Audit Record

- `last_audited`: `2026-06-03`
- `base`: `main@c25372b`
- `audit_status`: `ready`
- `decision`: Execute this as the current bounded AW-006 UI slice through screenshot handoff.
- `reason`: `main` is clean and synced after My Training Hub Inner Token/Input/Action Parity PR `#967` and repo-managed closeout PR `#968`; post-merge preflight was reported green with no pending closeout. A fresh queue/design/code review found no active AW-006 product/UI slice selected and found `HabitPerfectDayHub` inner add/edit forms, cadence controls, habit row actions, check-in/timer controls, chips, inputs, selects, and visible action presentation still using older route-local rounded/slate/blue/rose classes after `/my-library/habits` route shell and top Habits panels were tokenized in PR `#876`.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/my-library/habits`, `HabitPerfectDayHub`, habits API/storage/local timer contracts, cadence/check-in/timer behavior, screenshot handoff rules, forward compatibility rules, route/label/support sweep rules, or verification lanes change before screenshot handoff.

## Goal

Align the inner `HabitPerfectDayHub` add/edit habit forms, cadence controls, check-in/timer controls, row cards, chips, inputs, selects, and visible actions with the current My Library token/input/action direction without changing Habits behavior.

## Pre-Implementation Owner Explanation

Vi rydder innsiden av Habits-flaten, slik at skjemaer, valg, check-in/timer-felt og handlinger foles som samme produkt som resten av My Library. Det betyr bedre sammenheng, mindre visuell friksjon og faerre gamle lokale knapp- og feltvarianter.

Utenfor scope er habit-data, API-er, localStorage, cadence-regler, timer/check-in-logikk, analytics, Help/Guide, supportflyt, AI generator, nye Habits-funksjoner, app-wide designsystem-opprydding og merge uten eksplisitt godkjenning.

Fremoverkompatibilitet: eksisterende habit modes, habit types, cadence policies, check-in states og row actions skal fortsatt komme fra dagens typed contracts og label helpers. Nye habit-funksjoner, destructive actions, workflow-labels eller status-toner krever eksplisitt mapping, test og screenshot-evidence for release.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                      | Evidence                                        | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library/habits` remains the private Habits workspace, and inner add/edit/check-in/timer/history sections keep the same purpose, labels, order, anchors, and destinations.          | component diff + focused tests + screenshots    | `5/5`                   |
| UX flow clarity                               | `target`     | Add/edit habit forms, mode/cadence choices, check-in/timer controls, row actions, and expanded details are easier to scan without changing workflows.                                   | Testing Library assertions + screenshot handoff | `5/5`                   |
| Visual design quality                         | `target`     | Inner panels, cards, fields, chips, cadence controls, habit rows, and primary/secondary/destructive actions use current My Library token/input/action styling with no text overflow.    | before/after screenshots + class assertions     | `5/5`                   |
| Business logic correctness and data integrity | `target`     | No changes to habit loading, create/update/archive/check-in payloads, cadence policy, timer state, localStorage keys, evaluation, sort order, filters, or Home/My Routines entrypoints. | changed-files review + targeted tests           | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this private member workspace slice changes no admin editor, CRUD workflow, publish flow, operator queue, or admin action surface.                                          | explicit admin-editor scope rationale           | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Labels, field associations, aria-pressed controls, aria-expanded details, visible focus styles, keyboard reachability, disabled states, and live feedback semantics remain intact.      | Testing Library assertions + screenshot QA      | `5/5`                   |
| Accessibility                                 | `target`     | Lifecycle-lint alias for canonical `Accessibility (a11y)`; same labels, field associations, aria controls, focus, keyboard, disabled, and live feedback scope.                          | Testing Library assertions + screenshot QA      | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No dependency, media asset, new API call, polling loop, data model, or route payload growth beyond class/markup consolidation in the existing client component.                         | dependency diff + broad gate                    | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this visual/input/action hierarchy slice introduces no local storage, server-canonical data, sync trigger, conflict policy, retention rule, or sensitive-data flow.         | data-boundary rationale                         | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because existing `/my-library/habits` dynamic loading and habits mutation refresh behavior remain unchanged; no fetch/cache path changes.                                           | changed-files review                            | `N/A`                   |
| Reliability and failure handling              | `target`     | Existing schema warning, offline, load error, action error/success, empty, not-due, pending create/edit/archive/check-in, timer, and reset states still render deterministically.       | existing/updated focused tests                  | `5/5`                   |
| Security and authz                            | `target`     | Anonymous auth redirect, protected Habits data loading, and fail-closed API boundaries remain untouched; no protected data moves to a new route or client boundary.                     | route/component diff + existing route tests     | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data fields, telemetry payloads, legal copy, consent behavior, logs, secrets, provider data, or sensitive diagnostics change.                                       | privacy scope rationale                         | `N/A`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this brief, and design inventory record the selected Habits inner parity slice without stale active-slice references.                                           | docs diff + brief lint                          | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow label, editable admin field, status transition, review/publish path, recovery procedure, Help/Guide assertion, or support action.            | explicit admin-workflow scope rationale         | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/habits` is authenticated/private and this slice changes no public metadata, sitemap, robots, canonical URL, structured data, or indexability contract.         | private-route SEO rationale                     | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity model, structured data, public semantic content, or AI-facing documentation contract.                                              | AI-discoverability scope rationale              | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event taxonomy, payload, persistence, dashboard, KPI definition, or consent behavior changes.                                                                  | analytics scope rationale                       | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no Stripe, checkout, catalog, entitlement, portal, invoice, refund, payout, or reporting behavior.                                                       | commerce scope review                           | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A with scope rationale: this changes no incident path, alerting, runbook procedure, support diagnostics, recovery workflow, or support escalation behavior.                           | explicit support-ops scope rationale            | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this changes no billing provider data, invoice/refund path, payout, finance report, reconciliation surface, entitlement truth, or revenue operation.          | explicit finance scope rationale                | `N/A`                   |
| i18n operational readiness                    | `target`     | Form labels, action labels, mode/cadence controls, chips, counters, and row actions stay responsive and layout-safe so later localization is not blocked by tight fixed-width choices.  | screenshot text-fit review + class review       | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `HabitPerfectDayHub`, existing habits route, My Library token classes, `ui-field`, `fs-cta-*`, `fs-library-card`, Tailwind variables, and current tests; add no dependency.       | changed-files/dependency diff                   | `5/5`                   |
| Testing and QA automation                     | `target`     | Update focused HabitPerfectDayHub tests, run targeted Vitest, brief lint, route/label/support sweep, screenshot handoff, then stop before `verify:pre-pr` until owner approval.         | test commands + screenshots + later gates       | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: this reuses existing local UI classes and adds no service call, storage, background job, polling, provider, or traffic-dependent cost.                                 | implementation review                           | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert restores prior markup/tests/docs; no migration, dependency, config, workflow, provider setting, or feature flag rollback is needed.                                   | git diff + validation evidence                  | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep `/my-library/habits` as the authenticated server route with existing route loading and redirect behavior.
  - Reuse `HabitPerfectDayHub` as the existing client boundary; do not move habit data ownership, timer state, or action logic into a new hierarchy.
  - Preserve route redirects, server loaders, API routes, cache behavior, selected view/hash behavior, and action handlers.
- TypeScript/domain contracts:
  - Preserve `HabitSnapshot`, `HabitDefinitionView`, habit mode/type/cadence unions, check-in payload builders, timer metadata, evaluation helpers, local timer keys, and label helpers.
  - Do not change validation, create/update/archive/check-in/reset behavior, API payloads, or habits feedback semantics.
- Supabase/data layer:
  - N/A; no migration, RLS/authz rule, generated DB type, storage, index, or data access change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, analytics vendor, email provider, SDK, secret, webhook, retry, or idempotency behavior changes.
- UI system:
  - Mature reference surfaces: tokenized `/my-library/habits` route/top panels from PR `#876`, GoalsHub inner token/input/action parity from PR `#963`, My Swim Profile inner token/input/action parity from PR `#965`, My Training inner token/input/action parity from PR `#967`, `ui-field`, `fs-cta-*`, `fs-library-card`, `fs-cta-danger`, and `components/ui/actionLayout.ts`.
  - Keep the change component-local to the complete inner `HabitPerfectDayHub` visible surface; do not create an app-wide Button/Card/Field/Notice primitive in this slice.
  - Use scoped helper classes in `HabitPerfectDayHub` for field, choice, chip, row action, and mobile action intent so the parity change does not duplicate long class strings across every habit form.
  - Screenshot handoff type: `before/after` for `/my-library/habits` desktop and mobile, focusing on add/edit forms, cadence controls, habit row actions, timer/check-in controls, and details.
- Testing:
  - Update focused `HabitPerfectDayHub` tests for inner panel, field, choice, row card, detail action, timer/check-in, and destructive/secondary action class contracts.
  - Preserve existing route, feedback, create/update/archive/check-in, timer, cadence, Home entrypoint, and My Routines coverage.

## Data Placement And Sync Contract

N/A with rationale: this is a visual/input/action hierarchy parity slice. It introduces no new local-only data, server-canonical data, browser storage, sync trigger, conflict resolution, retry policy, retention rule, cache invalidation, or sensitive data handling. Existing habit snapshots, local timer keys, check-in inputs, cadence draft state, selected view behavior, and mutation refresh flows remain the source of truth.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible identifier, alias, redirect, or compatibility mapping. Existing habit IDs, titles, mode/type/cadence labels, category labels, route labels, and local timer keys remain stable.

## Forward Compatibility Contract

- Extensibility surfaces touched:
  - habit mode/type/cadence controls,
  - add/edit habit form fields,
  - row chips and details,
  - check-in/timer controls,
  - archive/reset/log-slip/save actions,
  - empty/offline/schema/action feedback presentation.
- Source of truth:
  - Habit content remains derived from `HabitSnapshot`, `HabitDefinitionView`, typed habit mode/type/cadence/category/unit unions, and existing label/evaluation helpers.
  - Due/completion state remains derived from the server-loaded snapshot plus existing local timer state.
- Additive behavior:
  - existing modes, types, units, cadence periods, and categories continue to render through the same helper classes.
  - new habit rows returned by existing contracts continue to render in the same card/form/action pattern.
- Explicit mapping requirements:
  - new habit modes, habit types, cadence policies, destructive actions, timer modes, route-level actions, workflow labels, or materially different check-in semantics require deliberate copy/class/test/screenshot updates before release.
  - Help/Guide or support updates are required if implementation changes labels, routes, recovery behavior, or workflow meaning; those changes are out of scope here.
- Unknown or deprecated values:
  - this slice adds no new unknown value path; existing typed habits helpers and feedback behavior continue to own unsupported data states.
  - unknown API payloads must not be interpreted as visual success states.
- Test/evidence:
  - focused tests verify token/input/action class reuse while preserving action semantics.
  - screenshot handoff checks desktop/mobile text fit.
  - route/label/support sweep checks Habits, HabitPerfectDayHub, Add habit, Create habit, Edit, Archive, Log slip, Finish, Reset, Save manual, Save, Cancel, cadence controls, `/my-library/habits`, Home routine entrypoints, and My Routines fallout.

## Help / Guide Impact

N/A with rationale: this slice changes presentation only. It does not rename routes, labels, workflow actions, Help/Guide content, support recovery behavior, habits storage behavior, or operator instructions.

## Route / Label / Support Surface Sweep

Required because `/my-library/habits`, visible habit actions, and Home/My Routines entrypoints are touched.

- Identifiers to search before broad gates:
  - `/my-library/habits`
  - `HabitPerfectDayHub`
  - `Add habit`
  - `Create habit`
  - `Edit`
  - `Archive`
  - `Log slip`
  - `Finish`
  - `Reset`
  - `Save manual`
  - `Save`
  - `Cancel`
  - `Cadence`
  - `Fixed weekdays`
  - `Home mobile habit entry`
  - `TodayTabsPanel`
- Surfaces to check:
  - `app/`
  - `components/`
  - `tests/`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/design/`
  - `docs/runbooks/`
- Expected fallout:
  - `components/my-library/habits/HabitPerfectDayHub.tsx`,
  - focused tests,
  - this active brief,
  - canonical AW-006 queue,
  - design inventory,
  - screenshot artifacts during implementation.

## Scope

- `components/my-library/habits/HabitPerfectDayHub.tsx` inner add/edit habit forms, mode/cadence/day controls, fields, chips, habit row cards, expanded details, timer/check-in controls, and visible action presentation.
- Focused unit assertions in `tests/unit/habit-perfect-day-hub.test.tsx`.
- Canonical AW-006 queue and design inventory updates.
- Before/after screenshot handoff artifacts during implementation.

## Out Of Scope

- `app/my-library/habits/page.tsx` route shell changes unless needed only for screenshot harness stability.
- Habit data model, API routes, Supabase queries, generated database types, migrations, auth, analytics taxonomy, route labels, localStorage keys, cadence/check-in/timer behavior, evaluation logic, Home/My Routines entrypoint behavior, Help/Guide updates, support workflow, broad member notice primitive, app-wide Button/Card/PageShell/Field/Notice primitive, new dependencies, commerce, packages, and merge without explicit owner approval.
- AI generator, other My Library workspaces, admin surfaces, public pages, brand media, onboarding/first-run flow, and broad desktop dashboard/admin layout work.
- Owner's later Habits product/UI findings; those should be triaged into a separate Habits UX Findings slice after this parity baseline.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves screenshots.

## Acceptance Criteria

1. `HabitPerfectDayHub` keeps the same snapshot, local timer, cadence, check-in, archive, edit, pending, feedback, and entrypoint semantics.
2. Inner add/edit forms, mode/cadence/day controls, habit cards, detail chips, timer/check-in controls, and row actions align with current My Library token/input/action direction.
3. Existing labels, destinations, disabled states, pending labels, error/success feedback, empty states, schema warnings, and offline states are preserved.
4. No Habits business logic, data persistence, API routes, analytics, Help/Guide, or support workflow changes are introduced.
5. Mobile stack actions are layout-safe and avoid orphan rows while compact row/header controls remain compact by intent.
6. Focused tests pass and screenshot handoff is captured before broad gates.
7. Canonical AW-006 queue and design inventory record this selected slice without stale active references.
8. Work stops after screenshot handoff until owner approval.

## Validation

Required before screenshot handoff:

- `npm exec vitest run tests/unit/habit-perfect-day-hub.test.tsx tests/unit/habits-page.test.tsx` - passed, 2 files / 27 tests.
- `npm run typecheck` - passed.
- `npm run lint:briefs:all` - passed, including this new active brief.
- `npm run lint:quality-gates` - passed.
- `npm run lint` - passed with one existing warning outside this slice in `output/capture-aw006-dryland-feedback.mjs`.
- targeted route/label/support sweep for Habits, HabitPerfectDayHub, habit actions, cadence controls, Home entrypoints, and My Routines references - completed; expected scoped fallout in `HabitPerfectDayHub`, focused tests, this active brief, canonical AW-006 queue, and design inventory.
- `git diff --check` - passed.

Visual gate:

- Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- --webpack -H 127.0.0.1 -p <port>` for the before and after worktrees.
- Capture `before/after` screenshots for the `HabitPerfectDayHub` inner surface through a temporary deterministic `/aw-006-habits-screenshot` harness in both `origin/main@c25372b` and the active branch.
- Stop for owner screenshot approval before `npm run verify:pre-pr`, PR creation, and `npm run verify:pre-merge`.

After owner screenshot approval:

- `npm run verify:pre-pr` - passed on retry after removing a stale generated `.next/dev/types/app/aw-006-habits-screenshot` file from the temporary screenshot harness; full lane, `verify-open` PASS, Playwright public matrix `106 passed` / `530 skipped`.
- commit and push - passed as `ad718a3`.
- open/update PR - passed, PR `#969`.
- required CI checks green - passed for PR `#969`.
- `npm run verify:pre-merge` - passed full lane; Playwright public matrix `106 passed` / `530 skipped`; private-gate regression skipped because `SITE_LOCK_ENABLED!=1`.

## Manual QA / Screenshot Handoff

Required because this changes visible UI/layout.

- Capture type: `before/after`.
- Captured: `2026-06-03 17:05` Europe/Oslo.
- Screenshot artifact folder: `/Users/stianvikra/freeswimming/output/aw-006-habits-hub-inner-token-input-action-parity-2026-06-03-170100`.
- Files:
  - `before-habits-hub-inner-desktop.png`
  - `after-habits-hub-inner-desktop.png`
  - `before-habits-hub-inner-mobile.png`
  - `after-habits-hub-inner-mobile.png`
- Capture focus:
  - desktop and mobile `Habits` inner add/edit habit forms, cadence controls, habit row cards, expanded details, timer/check-in controls, chips, fields, and visible actions.
- Visual review note:
  - owner approved screenshot handoff on `2026-06-03`.
  - desktop opens add habit plus first-row details/edit so add/edit fields and cadence controls are visible together.
  - mobile opens the visible first-row details/edit flow and leaves add habit closed because the production mobile layout intentionally hides the habit list while the add form is open.
  - the temporary screenshot harness reused production `HabitPerfectDayHub` and shared habits view builders, then was removed after capture.
  - no production rendering files, styles, or assets changed after screenshot capture.
  - performance-budget trend recommendation during pre-PR: hold current thresholds because the worst margin was `13.8%` against the `15.0%` tighten threshold.

## Checkpoint Log

- `2026-06-03 | in-progress | started from clean main@c25372b after My Training Hub Inner Token/Input/Action Parity #967 and repo-managed closeout #968; owner explicitly requested HabitsHub Inner Token/Input/Action Parity execution, with later Habits product/UI findings intentionally deferred to a separate slice | next: implement focused HabitPerfectDayHub presentation parity, update queue/inventory/tests, run targeted validation, then capture before/after screenshot handoff`
- `2026-06-03 | screenshot-handoff | implemented focused HabitPerfectDayHub token/input/action parity, updated focused tests plus AW-006 queue/design inventory, passed targeted validation, captured before/after desktop/mobile screenshots via deterministic harness, removed temp harness after capture | next: owner screenshot approval, then run npm run verify:pre-pr before PR prep`
- `2026-06-03 | pre-pr | owner approved screenshot handoff; first pre-PR attempt exposed stale generated .next/dev type output from the removed temporary screenshot route; cleaned generated output, typecheck passed, then npm run verify:pre-pr passed full lane | next: commit, push, open PR, monitor CI`
- `2026-06-03 | merged | PR #969 merged as squash commit 35ea67f after CI green and PASS npm run verify:pre-merge full lane; repo-managed closeout moved this brief to done and cleared active queue/inventory references | next: rerun post-merge preflight after closeout merge`

## Completion Record

- `completed`: `2026-06-03`
- `merged_pr`: `#969`
- `squash_commit`: `35ea67f`
- `result`: Closed AW-006 HabitsHub Inner Token/Input/Action Parity. `HabitPerfectDayHub` inner add/edit forms, cadence controls, habit rows, chips, timer/check-in controls, and visible actions now use the current My Library token/input/action direction without changing Habits behavior.
- `validation`: PASS `npm exec vitest run tests/unit/habit-perfect-day-hub.test.tsx tests/unit/habits-page.test.tsx`; PASS `npm run typecheck`; PASS `npm run lint:briefs:all`; PASS `npm run lint:quality-gates`; PASS `npm run lint` with one unrelated existing warning in `output/capture-aw006-dryland-feedback.mjs`; PASS targeted route/label/support sweep; PASS `git diff --check`; owner-approved before/after screenshot handoff in `output/aw-006-habits-hub-inner-token-input-action-parity-2026-06-03-170100/`; PASS `npm run verify:pre-pr` full lane; GitHub CI green; PASS `npm run verify:pre-merge` full lane with 106 Playwright passed / 530 skipped.
- `10/10 claim`: yes - all critical target categories reached `5/5` for the bounded slice.

| Category                                      | Achieved Score | Evidence                                                                                                       | Gaps / Notes           |
| --------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Product goals and IA                          | `5/5`          | PR `#969`, done brief scope, queue/inventory closeout.                                                         | None for scoped slice. |
| UX flow clarity                               | `5/5`          | Owner-approved before/after screenshots and focused Habits workflow tests.                                     | None for scoped slice. |
| Visual design quality                         | `5/5`          | Screenshot handoff plus shared My Library token/input/action class adoption.                                   | None for scoped slice. |
| Business logic correctness and data integrity | `5/5`          | Focused unit tests and unchanged Habits data/API/cadence/timer/check-in boundaries.                            | None for scoped slice. |
| Accessibility (a11y)                          | `5/5`          | Existing labels/semantics preserved; full `verify:pre-pr` and `verify:pre-merge` passed.                       | None for scoped slice. |
| Accessibility                                 | `5/5`          | Lifecycle-lint alias for canonical `Accessibility (a11y)`; same evidence as the canonical accessibility row.   | None for scoped slice. |
| Performance (CWV + payloads)                  | `5/5`          | Performance budgets passed in full gates.                                                                      | None for scoped slice. |
| Reliability and failure handling              | `5/5`          | Existing pending/error/success/offline/schema/timer states preserved and tested through full gates.            | None for scoped slice. |
| Security and authz                            | `5/5`          | No auth/API changes; full CI and pre-merge gates passed.                                                       | None for scoped slice. |
| Content governance                            | `5/5`          | Queue, design inventory, and brief lifecycle updated in closeout.                                              | None for scoped slice. |
| i18n operational readiness                    | `5/5`          | Screenshot text-fit review and responsive action/field classes keep labels layout-safe for later localization. | None for scoped slice. |
| Stack-fit and dependency discipline           | `5/5`          | Reused `HabitPerfectDayHub`, My Library token/action classes, and existing test surfaces; no new dependencies. | None for scoped slice. |
| Testing and QA automation                     | `5/5`          | Focused unit assertions, screenshot evidence, CI green, `verify:pre-pr`, and `verify:pre-merge`.               | None for scoped slice. |
| DevOps and rollback readiness                 | `5/5`          | Single bounded PR `#969`, clean merge commit `35ea67f`, docs-only closeout path.                               | None for scoped slice. |
