# Task Brief: AW-006 My Training Hub Inner Token/Input/Action Parity (10/10)

## Metadata

- `id`: `2026-06-03-aw-006-my-training-hub-inner-token-input-action-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-03`
- `updated`: `2026-06-03`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-my-training-hub-inner-token-input-parity`
- `execution_mode`: `owner-approved end-to-end implementation; stop after screenshot handoff for owner approval before pre-PR gate`

## Brief Audit Record

- `last_audited`: `2026-06-03`
- `base`: `main@f597c06`
- `audit_status`: `ready`
- `decision`: Execute this as the current bounded AW-006 UI slice through screenshot handoff.
- `reason`: `main` is clean and synced after My Swim Profile Inner Token/Input Parity PR `#965` and repo-managed closeout PR `#966`; post-merge preflight was reported green with no pending closeout. A fresh queue/design/code review found no active AW-006 product/UI slice selected and found `TrainingContextHub` inner overview, goal-start, focus, note composer, note filter, note row, and edit action presentation still using older route-local rounded/slate/blue/emerald classes after the `/my-library/training` route shell was tokenized in PR `#870` and adjacent Goals/Profile inner surfaces were tokenized in PRs `#963` and `#965`.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/my-library/training`, `TrainingContextHub`, training-context API/storage/local draft contracts, Goals bridge links, note filter/status/action contracts, screenshot handoff rules, forward compatibility rules, route/label/support sweep rules, or verification lanes change before screenshot handoff.

## Goal

Align the inner `TrainingContextHub` overview, start-from-goal, focus, notes, filters, row cards, edit forms, inputs, and visible actions with the current My Library token/input/action direction without changing Training Context behavior.

## Pre-Implementation Owner Explanation

Vi rydder innsiden av `My Training`, slik at kort, skjema, filtre og handlinger foles som samme produkt som Goals og My Swim Profile. Det betyr bedre sammenheng og mindre visuell friksjon for brukeren nar de jobber med focus og notes.

Utenfor scope er treningsdata, Focus/Notes-logikk, API-er, Goals-koblinger, lokale utkast, filtre, auth, analytics, Help/Guide, supportflyt, andre My Library-workspaces, bred komponentbibliotek-opprydding og merge uten eksplisitt godkjenning.

Fremoverkompatibilitet: nye focus-, note-, goal- og statusrader skal fortsatt komme fra `TrainingContextSnapshot` og dagens typed contracts. Nye handlinger, status-toner, workflow-labels eller route-actions krever eksplisitt mapping, test og screenshot-evidence for release.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                           | Evidence                                        | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library/training` remains the private My Training workspace, and inner overview/goals/focus/notes sections keep the same purpose, labels, order, anchors, and destinations.             | component diff + focused tests + screenshots    | `5/5`                   |
| UX flow clarity                               | `target`     | Overview cards, start-from-goal actions, focus composer/edit actions, note composer/filter actions, and note row actions are easier to scan without changing workflows.                      | Testing Library assertions + screenshot handoff | `5/5`                   |
| Visual design quality                         | `target`     | Inner panels, cards, fields, chips, filters, note/focus rows, and primary/secondary/status actions use current My Library token/input/action styling with no mobile/desktop text overflow.   | before/after screenshots + class assertions     | `5/5`                   |
| Business logic correctness and data integrity | `target`     | No changes to snapshot loading, focus/note create/update/status payloads, local draft keys, filters, selected-goal prefill, sort/date filtering, or Goals bridge behavior.                   | changed-files review + targeted tests           | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this private member workspace slice changes no admin editor, CRUD workflow, publish flow, operator queue, or admin action surface.                                               | explicit admin-editor scope rationale           | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Labels, field associations, aria-expanded toggles, visible focus styles, keyboard reachability, disabled states, and live feedback semantics remain intact after token changes.              | Testing Library assertions + screenshot QA      | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No dependency, media asset, new API call, polling loop, data model, or route payload growth beyond class/markup consolidation in the existing client component.                              | dependency diff + broad gate                    | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this visual/input/action hierarchy slice introduces no local storage, server-canonical data, sync trigger, conflict policy, retention rule, or sensitive-data flow.              | data-boundary rationale                         | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because existing `/my-library/training` dynamic loading and Training Context mutation refresh behavior remain unchanged; no fetch/cache path changes.                                    | changed-files review                            | `N/A`                   |
| Reliability and failure handling              | `target`     | Existing schema, offline, load error, context message, action error/success, first-run empty, primary-focus warning, filtered no-results, and pending states still render deterministically. | existing/updated focused tests                  | `5/5`                   |
| Security and authz                            | `target`     | Anonymous auth redirect, protected Training Context data loading, and fail-closed API boundaries remain untouched; no protected data moves to a new route or client boundary.                | route/component diff + existing route tests     | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data fields, telemetry payloads, legal copy, consent behavior, logs, secrets, provider data, or sensitive diagnostics change.                                            | privacy scope rationale                         | `N/A`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this brief, and design inventory record the selected My Training inner parity slice without stale active-slice references.                                           | docs diff + brief lint                          | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow label, editable admin field, status transition, review/publish path, recovery procedure, Help/Guide assertion, or support action.                 | explicit admin-workflow scope rationale         | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/training` is authenticated/private and this slice changes no public metadata, sitemap, robots, canonical URL, structured data, or indexability contract.            | private-route SEO rationale                     | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity model, structured data, public semantic content, or AI-facing documentation contract.                                                   | AI-discoverability scope rationale              | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event taxonomy, payload, persistence, dashboard, KPI definition, or consent behavior changes.                                                                       | analytics scope rationale                       | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no Stripe, checkout, catalog, entitlement, portal, invoice, refund, payout, or reporting behavior.                                                            | commerce scope review                           | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A with scope rationale: this changes no incident path, alerting, runbook procedure, support diagnostics, recovery workflow, or support escalation behavior.                                | explicit support-ops scope rationale            | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this changes no billing provider data, invoice/refund path, payout, finance report, reconciliation surface, entitlement truth, or revenue operation.               | explicit finance scope rationale                | `N/A`                   |
| i18n operational readiness                    | `target`     | Form labels, action labels, status chips, counters, filters, and row actions stay responsive and layout-safe so later localization is not blocked by tight fixed-width assumptions.          | screenshot text-fit review + class review       | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `TrainingContextHub`, `/my-library/training`, My Library token classes, `ui-field`, `fs-cta-*`, `fs-library-card`, Tailwind variables, and current tests; add no dependency.           | changed-files/dependency diff                   | `5/5`                   |
| Testing and QA automation                     | `target`     | Update focused TrainingContextHub tests, run targeted Vitest, brief lint, route/label/support sweep, screenshot handoff, then stop before `verify:pre-pr` until owner approval.              | test commands + screenshots + later gates       | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: this reuses existing local UI classes and adds no service call, storage, background job, polling, provider, or traffic-dependent cost.                                      | implementation review                           | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert restores prior markup/tests/docs; no migration, dependency, config, workflow, provider setting, or feature flag rollback is needed.                                        | git diff + validation evidence                  | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep `/my-library/training` as the authenticated server route with `dynamic = "force-dynamic"`.
  - Reuse `TrainingContextHub` as the existing client boundary; do not move Training Context data ownership or action logic into a new component hierarchy.
  - Preserve route redirects, server loaders, API routes, cache behavior, selected-goal query parsing, and action handlers.
- TypeScript/domain contracts:
  - Preserve `TrainingContextSnapshot`, `TrainingGoalPrefill`, `TrainingFocusView`, `TrainingNoteView`, draft keys, note filters, status labels, and Goals prefill parsing.
  - Do not change validation, create/update/status behavior, API payloads, note sort/filter semantics, or feedback semantics.
- Supabase/data layer:
  - N/A; no migration, RLS/authz rule, generated DB type, storage, index, or data access change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, analytics vendor, email provider, SDK, secret, webhook, retry, or idempotency behavior changes.
- UI system:
  - Mature reference surfaces: tokenized `/my-library/training` route shell from PR `#870`, GoalsHub inner token/input/action parity from PR `#963`, My Swim Profile inner token/input/action parity from PR `#965`, `ui-field`, `fs-cta-*`, `fs-library-card`, and `components/ui/actionLayout.ts`.
  - Keep the change component-local to the complete inner `TrainingContextHub` visible surface; do not create an app-wide Button/Card/Field/Notice primitive in this slice.
  - Use named local mobile action classes for actions that sit in vertical mobile stacks; keep header controls such as `Collapse` compact through the base action classes so mobile width is an explicit intent, not an accidental omission.
  - Screenshot handoff type: `before/after` for `/my-library/training` desktop and mobile, focusing on overview/start-from-goal/focus/notes/filter surfaces.
- Testing:
  - Update focused `TrainingContextHub` tests for inner panel, field, filter, row card, edit action, and action class contracts.
  - Preserve existing route, feedback, draft recovery, selected-goal, focus/note, filter, and Goals bridge coverage.

## Data Placement And Sync Contract

N/A with rationale: this is a visual/input/action hierarchy parity slice. It introduces no new local-only data, server-canonical data, browser storage, sync trigger, conflict resolution, retry policy, retention rule, cache invalidation, or sensitive data handling. Existing Training Context snapshots, local draft keys, filters, selected-goal state, and focus/note mutation flows remain the source of truth.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible identifier, alias, redirect, or compatibility mapping. Existing focus IDs, note IDs, goal IDs, status labels, and route labels remain stable.

## Forward Compatibility Contract

- Extensibility surfaces touched:
  - overview jump cards,
  - start-from-goal cards/actions,
  - focus cards, composer, edit forms, and status actions,
  - note composer, filters, note cards, edit forms, and status actions,
  - local input/select/textarea styling,
  - visible primary/secondary/destructive-adjacent action semantics.
- Source of truth:
  - Training content remains derived from `loadTrainingContextSnapshot`, `TrainingContextSnapshot`, `TrainingFocusView`, `TrainingNoteView`, `TRAINING_NOTE_STATUS_VALUES`, and typed status-label helpers.
  - Goals bridge behavior remains derived from `TrainingGoalPrefill` query parsing and existing goal option data.
- Additive behavior:
  - new focuses, notes, and goal options returned by existing contracts continue to render in the same card/form/action pattern.
  - existing note status options continue to inherit the same select/filter/input styling.
- Explicit mapping requirements:
  - new focus/note action types, note types, status tones, route-level actions, workflow labels, or materially different Training Context modes require deliberate copy/class/test/screenshot updates before release.
  - Help/Guide or support updates are required if implementation changes labels, routes, recovery behavior, or workflow meaning; those changes are out of scope here.
- Unknown or deprecated values:
  - this slice adds no new unknown value path; existing typed Training Context helpers and feedback behavior continue to own unsupported data states.
  - unknown API payloads must not be interpreted as visual success states.
- Test/evidence:
  - focused tests verify token/input/action class reuse while preserving action semantics.
  - screenshot handoff checks desktop/mobile text fit.
  - route/label/support sweep checks My Training, TrainingContextHub, Today at a glance, Start from a goal, Focus, Notes, Add focus, Save open focus, Add note, Save note, Clear filters, Edit note, Edit focus, `/my-library/training`, and Goals bridge fallout.

## Help / Guide Impact

N/A with rationale: this slice changes presentation only. It does not rename routes, labels, workflow actions, Help/Guide content, support recovery behavior, Training Context storage behavior, or operator instructions.

## Route / Label / Support Surface Sweep

Required because `/my-library/training`, visible Training Context actions, and Goals bridge surfaces are touched.

- Identifiers to search before broad gates:
  - `/my-library/training`
  - `My Training`
  - `TrainingContextHub`
  - `Today at a glance`
  - `Start from a goal`
  - `Focus`
  - `Notes`
  - `Add focus`
  - `Save open focus`
  - `Add note`
  - `Save note`
  - `Clear filters`
  - `Edit note`
  - `Edit focus`
  - `goalId`
  - `intent=focus`
  - `intent=note`
- Surfaces to check:
  - `app/`
  - `components/`
  - `tests/`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/design/`
  - `docs/runbooks/`
- Expected fallout:
  - `components/my-library/training/TrainingContextHub.tsx`,
  - focused tests,
  - this active brief,
  - canonical AW-006 queue,
  - design inventory,
  - screenshot artifacts during implementation.

## Scope

- `components/my-library/training/TrainingContextHub.tsx` inner overview, start-from-goal, focus, notes, filter, row, edit form, input/select/textarea, and visible action presentation.
- Focused unit assertions in `tests/unit/training-context-hub.test.tsx`.
- Canonical AW-006 queue and design inventory updates.
- Before/after screenshot handoff artifacts during implementation.

## Out Of Scope

- `app/my-library/training/page.tsx` route shell changes unless needed only for screenshot harness stability.
- Training Context data model, API routes, Supabase queries, generated database types, migrations, auth, analytics taxonomy, route labels, localStorage keys, note filter/sort behavior, selected-goal prefill behavior, focus/note create/update/status behavior, Help/Guide updates, support workflow, broad member notice primitive, app-wide Button/Card/PageShell/Field/Notice primitive, new dependencies, commerce, packages, and merge without explicit owner approval.
- Other My Library workspaces, admin surfaces, public pages, brand media, onboarding/first-run flow, and broad desktop dashboard/admin layout work.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves screenshots.

## Acceptance Criteria

1. `TrainingContextHub` keeps the same snapshot, local draft, selected-goal, focus/note, filter, status, and feedback semantics.
2. Inner overview, start-from-goal, focus cards/forms, notes cards/forms, filters, inputs/selects/textareas, and visible actions align with current My Library token/input/action direction.
3. Existing labels, anchors, destinations, disabled states, pending labels, error/success feedback, empty states, and schema warnings are preserved.
4. No Training Context business logic, data persistence, API routes, analytics, Help/Guide, or support workflow changes are introduced.
5. Mobile stack actions such as `Save open focus`, `Save note`, and `Clear filters` are full-width on mobile, while compact header controls such as `Collapse` remain compact.
6. Focused tests pass and screenshot handoff is captured before broad gates.
7. Canonical AW-006 queue and design inventory record this selected slice without stale active references.
8. Work stops after screenshot handoff until owner approval.

## Validation

Required before screenshot handoff:

- `npm exec vitest run tests/unit/training-context-hub.test.tsx`
- `npm run typecheck`
- `npm run lint:briefs:all`
- targeted route/label/support sweep for My Training, TrainingContextHub, focus/note actions, filters, and Goals bridge references
- `git diff --check`

Visual gate:

- Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
- Capture `before/after` screenshots for `/my-library/training` desktop and mobile against `http://127.0.0.1:3000`.
- Stop for owner screenshot approval before `npm run verify:pre-pr`, PR creation, and `npm run verify:pre-merge`.

After owner screenshot approval:

- `npm run verify:pre-pr`
- commit and push
- open/update PR
- required CI checks green
- `npm run verify:pre-merge`

## Manual QA / Screenshot Handoff

Required because this changes visible UI/layout.

- Capture type: `before/after`.
- Captured: `2026-06-03 15:53` Europe/Oslo.
- Screenshot artifact folder: `output/aw-006-my-training-hub-inner-token-input-parity-2026-06-03-154537/`.
- Files:
  - `before-my-training-hub-inner-desktop.png`
  - `after-my-training-hub-inner-desktop.png`
  - `before-my-training-hub-inner-mobile.png`
  - `after-my-training-hub-inner-mobile.png`
- Capture focus:
  - desktop and mobile `My Training` inner overview, start-from-goal, selected goal, focus summary/composer/cards/actions/history, note composer, filters, note cards, fields, chips, and visible actions.
- Capture route caveat:
  - used a temporary local screenshot route with deterministic `TrainingContextHub` data because the authenticated product route depends on local auth/Supabase browser env.
  - the temporary route rendered the same route shell and real `TrainingContextHub` surface, omitted `SiteChrome`, and was removed from the working branch after capture.
  - before images were reused from the unchanged `main@f597c06` baseline capture because the deterministic harness and base branch did not change; after images were regenerated after the owner mobile action-width correction.
  - no scoped product-rendering files, styles, assets, or export HTML that ship in the diff changed after the latest after-capture; only the temporary route removal and this brief checkpoint were updated.
- Visual review note:
  - desktop before/after shows the inner cards, focus composer, primary/secondary focus actions, note composer, filters, and note rows moving from local rounded/slate/blue styling to shared My Library token/input/action classes.
  - mobile before/after shows route actions, goal quick actions, focus edit/status actions, note fields, filters, and note row actions fitting within the viewport without visible text overlap.
  - owner screenshot correction: mobile stack actions now use named `trainingMobile*ActionClass` variants so `Save open focus`, `Save note`, and `Clear filters` are full-width on mobile, while compact header controls such as `Collapse` remain compact.
  - no known visual caveat beyond the temporary deterministic harness route.

## Checkpoint Log

- `2026-06-03 | in-progress | started from clean main@f597c06 after My Swim Profile Inner Token/Input Parity #965 and repo-managed closeout #966; owner explicitly requested end-to-end implementation of a broadened My Training hub inner token/input/action parity slice and to stop at screenshot approval | next: implement focused TrainingContextHub presentation parity, update queue/inventory/tests, run targeted validation, then capture before/after screenshot handoff`
- `2026-06-03 | implementation | aligned TrainingContextHub inner overview, goal-context cards/actions, focus summary/composer/cards/edit/history, notes counters/composer/filters/cards/edit, fields, chips, and visible actions with My Library token/input/action classes; added focused token/input/action class assertions and updated AW-006 queue/design inventory active state | next: run targeted validation before screenshot capture`
- `2026-06-03 | validation | PASS npm exec vitest run tests/unit/training-context-hub.test.tsx; PASS npm run typecheck; PASS npm run lint:briefs:all; PASS targeted route/label/support sweep with expected Training/Goals/docs/test references only; PASS git diff --check; PASS targeted Prettier check; PASS npm run lint with one unrelated existing warning in output/capture-aw006-dryland-feedback.mjs | next: capture before/after desktop/mobile screenshots and stop for owner approval before npm run verify:pre-pr`
- `2026-06-03 | screenshot-handoff-ready | captured before/after desktop/mobile screenshots in output/aw-006-my-training-hub-inner-token-input-parity-2026-06-03-153025/ using a temporary deterministic TrainingContextHub route; removed the temporary route, stopped dev servers, removed the before worktree, and inspected artifacts for text-fit/action overflow | next: wait for owner screenshot approval before npm run verify:pre-pr`
- `2026-06-03 | owner-screenshot-correction | owner flagged that standalone mobile stack actions should be full-width and asked why the issue was not caught systemically; root cause was that the focused test asserted token classes but not mobile action-width intent; introduced named mobile action classes, updated focused tests to assert full-width stack actions and compact Collapse, reran targeted validation, regenerated after-screenshots in output/aw-006-my-training-hub-inner-token-input-parity-2026-06-03-154537/, removed the temporary route, and stopped the dev server | next: wait for owner screenshot approval before npm run verify:pre-pr`
- `2026-06-03 | pre-pr-gate | owner approved screenshots; PASS npm run verify:pre-pr full lane (branch-current, quality gates, lint, typecheck, unit tests, build, performance budgets, Playwright 106 passed / 530 skipped); no product-rendering files, styles, assets, or export HTML changed after the latest screenshot capture, only temporary route removal and brief evidence updates | next: commit, push, and open/update PR`
