# Task Brief: AW-006 Program Builder Inner Planner And Export Panel Token/Input/Action Parity (10/10)

## Metadata

- `id`: `2026-06-03-aw-006-program-builder-inner-planner-export-token-input-action-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-03`
- `updated`: `2026-06-03`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-program-builder-inner-planner-export-token-parity`
- `execution_mode`: `owner-approved implementation; stop after screenshot handoff for owner approval before pre-PR gate`

## Brief Audit Record

- `last_audited`: `2026-06-03`
- `base`: `main@6f7e301`
- `audit_status`: `ready`
- `decision`: Execute this as the current bounded AW-006 UI slice through screenshot handoff.
- `reason`: `main` is clean and synced after AI Session Generator Inner Token/Input/Action Parity PR `#971` and repo-managed closeout PR `#972`; post-merge preflight was reported green with no active AW-006 product/UI slice. A fresh queue/design/code re-audit found `ProgramBuilderHub` route/top-shell work completed in PR `#884`, while inner planner cards, title input, weekday selects, add/move/remove actions, and Garmin/PDF export panels still use older local rounded/slate/blue classes inside an otherwise token-backed My Library workspace.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/my-library/programs/[programId]`, `ProgramBuilderHub`, program API/storage/export contracts, mobile action layout rules, screenshot handoff rules, forward compatibility rules, route/label/support sweep rules, or verification lanes change before screenshot handoff.

## Goal

Align the inner Program Builder title field, week/day planner cards, scheduled workout rows, move/add/remove controls, and Garmin/PDF export panels with the current My Library token/input/action direction without changing program behavior.

## Pre-Implementation Owner Explanation

Vi rydder innsiden av Program Builder: programtittel, uke- og dagkort, valgfelter, `Add workout`, flytt/fjern-knapper og export/PDF-paneler skal se ut som resten av My Library. Det betyr noe fordi rammen rundt Program Builder allerede er modernisert, men selve planleggeren fortsatt virker eldre.

Utenfor scope er programdata, lagring, uke/dag-logikk, API-er, PDF/JSON-innhold, filenames, auth, analytics, Help/Guide, supportflyt, commerce, Habits product/UI findings, route shell og bred app-wide design-system-utrulling.

Fremoverkompatibilitet: nye uker, dager og planlagte okter som bruker dagens program contracts skal automatisk arve samme kort/felt/knapp/select-standard. Nye planner modes, export-formater, destruktive handlinger, app-wide select-migrering eller nye workflow-stater krever eksplisitt mapping, tester og screenshot-evidence senere.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                           | Evidence                                     | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library/programs/[programId]` remains the focused saved-program builder route; this slice only touches inner planner/export presentation.                               | component diff + focused tests + screenshots | `5/5`                   |
| UX flow clarity                               | `target`     | Program title, save/reset, week/day planning, add/move/remove controls, export details, and PDF handoff are easier to scan without changing workflow meaning.                | Testing Library assertions + screenshots     | `5/5`                   |
| Visual design quality                         | `target`     | Inner cards, fields, selects, badges, scheduled workout rows, and visible actions use current My Library token/input/action styling with no mobile/desktop text overflow.    | before/after screenshots + class assertions  | `5/5`                   |
| Business logic correctness and data integrity | `target`     | No changes to selected-program loading, draft state, week/day assignments, save/reset payloads, export payloads, generated filenames, or planner data ownership.             | changed-files review + targeted tests        | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this private member workspace slice changes no admin editor, CRUD workflow, publish flow, operator queue, or admin action surface.                               | explicit admin-editor scope rationale        | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Labels, selects, buttons, disabled states, focus styles, aria-describedby export feedback, status/alert feedback, and keyboard reachability stay intact.                     | Testing Library assertions + screenshot QA   | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No dependency, media asset, new API call, polling loop, client state model, or route payload growth beyond class/markup consolidation in an existing client component.       | dependency diff + broad gate                 | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical saved programs and local-only draft/export feedback boundaries remain unchanged; this slice only changes presentation.                                      | data-boundary review + targeted tests        | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because existing dynamic route loading, save/export API calls, and route refresh behavior remain unchanged; no cache path changes.                                       | changed-files review                         | `N/A`                   |
| Reliability and failure handling              | `target`     | Existing schema warning, load error, missing-workout warning, empty state, action error/success, export preview, export error, and PDF popup feedback still render.          | existing/updated focused tests               | `5/5`                   |
| Security and authz                            | `target`     | Anonymous auth redirect, protected program data loading, and fail-closed program/export API boundaries remain untouched; no protected data moves to a public route.          | route/component diff + existing route tests  | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data fields, telemetry payloads, legal copy, consent behavior, logs, secrets, provider data, or sensitive diagnostics change.                            | privacy scope rationale                      | `N/A`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this brief, and design inventory record the selected Program Builder inner parity slice without stale active-slice references.                       | docs diff + brief lint                       | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow label, editable admin field, status transition, review/publish path, recovery procedure, Help/Guide assertion, or support action. | explicit admin-workflow scope rationale      | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/programs/[programId]` is authenticated/private and this slice changes no public metadata, sitemap, robots, canonical URL, or indexability.          | private-route SEO rationale                  | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity model, structured data, public semantic content, or AI-facing documentation contract.                                   | AI-discoverability scope rationale           | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event taxonomy, payload, persistence, dashboard, KPI definition, or consent behavior changes.                                                       | analytics scope rationale                    | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no Stripe, checkout, catalog, entitlement, portal, invoice, refund, payout, or reporting behavior.                                            | commerce scope review                        | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A with scope rationale: this changes no incident path, alerting, runbook procedure, support diagnostics, recovery workflow, or support escalation behavior.                | explicit support-ops scope rationale         | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this changes no billing provider data, invoice/refund path, payout, finance report, reconciliation surface, entitlement truth, or revenue op.      | explicit finance scope rationale             | `N/A`                   |
| i18n operational readiness                    | `target`     | Title labels, weekday selectors, action labels, export labels, and scheduled workout cards stay responsive and layout-safe for later localization.                           | screenshot text-fit review + class review    | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `ProgramBuilderHub`, My Library token classes, `ui-field`, `fs-cta-*`, `fs-library-card`, Tailwind variables, and current tests; add no dependency.                    | changed-files/dependency diff                | `5/5`                   |
| Testing and QA automation                     | `target`     | Update focused Program Builder tests, run targeted Vitest, brief lint, route/label/support sweep, screenshot handoff, then stop before `verify:pre-pr` until approval.       | test commands + screenshots + later gates    | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: this reuses existing local UI classes and adds no service call, storage, background job, polling, provider, or traffic-dependent cost.                      | implementation review                        | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert restores prior markup/tests/docs; no migration, dependency, config, workflow, provider setting, or feature flag rollback is needed.                        | git diff + validation evidence               | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep `/my-library/programs/[programId]` as the authenticated server route with existing dynamic loading and redirect behavior.
  - Reuse `ProgramBuilderHub` as the existing client boundary; do not move program data ownership, draft state, selected-program state, export preview state, or save/export handlers into a new hierarchy.
  - Preserve route redirects, server loaders, API routes, cache behavior, create/save/export paths, and action handlers.
- TypeScript/domain contracts:
  - Preserve `ProgramLibrarySnapshot`, `ProgramEditorRecord`, `ProgramAssignment`, `ProgramSummary`, assignment reindexing, save payloads, export preview, and filename helpers.
  - Do not change validation, API payloads, local state transitions, generated artifacts, filenames, planner assignment behavior, or save transitions.
  - Session-step reference contract: `docs/design/session-step-surface-contract.md` remains authoritative for scheduled workout step previews; this slice does not alter step preview mapping.
- Supabase/data layer:
  - N/A; no migration, RLS/authz rule, generated DB type, storage, index, or data access change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, analytics vendor, email provider, SDK, secret, webhook, retry, or idempotency behavior changes.
- UI system:
  - Mature reference surfaces: Program Builder route/top-shell token work from PR `#884`, Workout Editor inner/support token passes from PR `#943/#945`, GoalsHub inner parity from PR `#963`, My Swim Profile inner parity from PR `#965`, My Training inner parity from PR `#967`, HabitsHub inner parity from PR `#969`, AI Session Generator inner parity from PR `#971`, `ui-field`, `fs-cta-*`, `fs-library-card`, and `components/ui/actionLayout.ts`.
  - Keep the change component-local to inner `ProgramBuilderHub` planner/export controls; do not create an app-wide Button/Card/Field/Notice/Select primitive in this slice.
  - Use scoped helper classes for program fields, native select presentation with a controlled chevron, nested cards, export panels, compact actions, danger actions, and mobile action layout so parity does not duplicate long local strings across every control.
  - Screenshot handoff type: `before/after` for `/my-library/programs/[programId]` desktop and mobile, focusing on title input, weekday selectors, add/move/remove controls, scheduled workout rows, Garmin export, and Program PDF panels.
- Testing:
  - Update focused `ProgramBuilderHub` tests for inner panel, field, select, card, and action class contracts.
  - Preserve existing program route, feedback, save, assignment, export, PDF, and retry coverage.

## Data Placement And Sync Contract

- Server-canonical data:
  - Saved programs, program IDs, titles, weeks, assignments, recent-program summaries, available workouts, and export payloads remain owned by the existing authenticated server/API/Supabase paths.
- Local data:
  - Existing unsaved title/week edits, picker selections, transient action feedback, export preview state, and browser download/open state remain client-local/transient.
- Sync policy:
  - Mutations continue through the same create/save/export API paths and explicit user actions; this slice only changes presentation.
- Retention and sensitivity:
  - No new persisted data, storage key, log, event, or sensitive value is introduced.
- Cache/invalidation:
  - No cache mode or invalidation behavior changes.

## Identity And Rename Contract

No identity changes. Existing program IDs remain stable internal identifiers, program titles remain editable display labels, and route params continue to use existing program IDs. This slice adds no alias, redirect, analytics identity, import/export identity, or rename/repurpose rule.

## Forward Compatibility Contract

- Extensibility surfaces touched:
  - program title field and save/reset action row,
  - week and day planner cards,
  - workout picker/add controls,
  - scheduled workout rows, step previews, day move selects, up/down/remove actions,
  - Garmin-ready JSON export panel and Program PDF panel.
- Source of truth:
  - saved program data remains derived from `ProgramLibrarySnapshot` and `ProgramEditorRecord`.
  - weekday groups remain derived from `PROGRAM_WEEKDAY_LABELS` and `buildProgramWeekdayGroups`.
  - export routes and filenames remain derived from existing program export helpers.
- Additive behavior:
  - new weeks, weekdays, saved programs, and available workouts returned by existing typed snapshot fields should inherit the same field/card/action/select pattern automatically.
  - new Program Builder dropdowns should use the scoped select helper so native mobile behavior stays intact while visible chevron, spacing, radius, and focus treatment remain consistent.
  - new non-destructive planner controls using existing helper classes should fit the same mobile action layout.
- Explicit mapping requirements:
  - new planner modes, route-level actions, destructive workflows, export formats, or materially different program workflow states require deliberate copy/class/test/screenshot updates before release.
  - Help/Guide or support updates are required if labels, routes, recovery behavior, or workflow meaning change; those changes are out of scope here.
- Unknown or deprecated values:
  - this slice adds no new unknown value path; existing typed program helpers and feedback behavior continue to own unsupported data states.
  - missing workout references must keep rendering as missing references, not visual success.
- Test/evidence:
  - focused tests verify token/input/action class reuse while preserving action semantics.
  - screenshot handoff checks desktop/mobile text fit.
  - route/label/support sweep checks `Program Builder`, `ProgramBuilderHub`, `Program title`, `Choose workout`, `Add workout`, `Move to day`, `Move up`, `Move down`, `Remove`, `Garmin-ready JSON`, `Program PDF`, `Show export details`, `Hide export details`, `/my-library/programs`, and `/my-library/programs/[programId]`.

## Help / Guide Impact

N/A with rationale: this slice changes presentation only. It does not rename routes, labels, workflow actions, Help/Guide content, support recovery behavior, program storage behavior, export behavior, or operator instructions.

## Route / Label / Support Surface Sweep

Required because `/my-library/programs/[programId]`, visible Program Builder actions, and planner/export labels are touched.

- Identifiers to search before broad gates:
  - `/my-library/programs`
  - `/my-library/programs/[programId]`
  - `Program Builder`
  - `ProgramBuilderHub`
  - `Program title`
  - `Choose workout`
  - `Add workout`
  - `Move to day`
  - `Move up`
  - `Move down`
  - `Remove`
  - `Garmin-ready JSON`
  - `Program PDF`
  - `Show export details`
  - `Hide export details`
  - `program-builder-hub`
  - `program-editor-garmin-export`
  - `program-editor-pdf`
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
  - `components/my-library/programs/ProgramBuilderHub.tsx`,
  - `tests/unit/program-builder-hub.test.tsx`,
  - this active brief,
  - canonical AW-006 queue,
  - design inventory,
  - screenshot artifacts during implementation.

## Scope

- `components/my-library/programs/ProgramBuilderHub.tsx` inner saved-program editor panel, program title input, week/day cards, workout picker/add controls, scheduled workout cards, day move selects, up/down/remove actions, Garmin export panel, export preview container, and Program PDF panel.
- Focused unit assertions in `tests/unit/program-builder-hub.test.tsx`.
- Canonical AW-006 queue and design inventory updates.
- Before/after screenshot handoff artifacts during implementation.

## Out Of Scope

- `app/my-library/programs/[programId]/page.tsx` route shell/header/back action styling unless needed only for screenshot harness stability.
- Program data model, API routes, Supabase queries, generated database types, migrations, auth, analytics taxonomy, route URLs, week/day assignment business logic, create/save/reset behavior, export artifact payloads, generated filenames, PDF/Garmin-ready/handoff behavior, Help/Guide updates, support workflow, broad member notice primitive, app-wide Button/Card/PageShell/Field/Notice/Select primitive, new dependencies, commerce, packages, and merge without explicit owner approval.
- Workout Editor, AI Session Generator, Habits product/UI findings, My Library dashboard, CheckoutButton/PortalButton, admin surfaces, public pages, brand media, onboarding/first-run flow, and broad desktop dashboard/admin layout work.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves screenshots.

## Acceptance Criteria

1. `ProgramBuilderHub` keeps the same program library snapshot, selected-program, recent-program, missing-workout, save/reset, assignment, export preview, export download, and PDF open behavior.
2. Program title, weekday pickers, day-move selects, add/move/remove controls, scheduled workout rows, Garmin-ready JSON panel, and Program PDF panel align with current My Library token/input/action direction, including a controlled chevron instead of the browser-default select arrow.
3. Existing labels, destinations, disabled states, pending labels, error/success feedback, missing-workout states, empty states, and export/PDF feedback are preserved.
4. Mobile action groups are layout-safe and avoid orphan rows while compact row controls remain compact by intent.
5. No program business logic, data persistence, API routes, analytics, Help/Guide, or support workflow changes are introduced.
6. Focused tests pass and screenshot handoff is captured before broad gates.
7. Canonical AW-006 queue and design inventory record this selected slice without stale active references.
8. Work stops after screenshot handoff until owner approval.

## Validation

Required before screenshot handoff:

- `npm exec vitest run tests/unit/program-builder-hub.test.tsx`
- `npm run typecheck`
- `npm run lint:briefs`
- targeted route/label/support sweep for Program Builder routes, labels, actions, export panels, Help/Guide/support docs, and feedback IDs
- `git diff --check`

Visual gate:

- Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- --webpack -H 127.0.0.1 -p <port>` for the before and after worktrees.
- Capture `before/after` screenshots for the inner Program Builder surface through the existing authenticated route fixture or a temporary deterministic harness if authenticated route fixtures are not enough.
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
- Required artifact folder: `output/aw-006-program-builder-inner-planner-export-token-parity-YYYY-MM-DD-HHMMSS`.
- Required files:
  - `before-program-builder-inner-desktop.png`
  - `after-program-builder-inner-desktop.png`
  - `before-program-builder-inner-mobile.png`
  - `after-program-builder-inner-mobile.png`
- Capture focus:
  - desktop and mobile program title input, save/reset actions, week/day cards, workout picker/add controls, scheduled workout cards, move/remove actions, Garmin export panel, export details toggle, and Program PDF panel.

## Checkpoint Log

- `2026-06-03 | in-progress | created after owner approved the recommended Program Builder Inner Planner And Export Panel Token/Input/Action Parity slice from clean main@6f7e301 on branch aw-006-program-builder-inner-planner-export-token-parity | next: update queue/design inventory, implement scoped ProgramBuilderHub inner parity, run focused validation, then capture screenshot handoff before broad gates`
- `2026-06-03 | validation | ProgramBuilderHub inner parity implementation completed; focused Vitest, typecheck, brief lint with --all, route/label/support sweep, and git diff whitespace check passed before visual capture | next: capture before/after screenshot handoff and stop for owner approval before npm run verify:pre-pr`
- `2026-06-03 | visual correction | owner flagged the native select arrow as visually weak; scoped ProgramBuilderSelect now preserves native select behavior while replacing the browser-default arrow with a controlled chevron for the Program Builder workout picker and day-move select; focused Vitest, typecheck, brief lint with --all, route/label/support sweep, git diff whitespace check, and after-screenshot refresh passed | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-06-03 | visual correction | owner requested the select indicator feel less web-like and explicitly waived another screenshot refresh; ProgramBuilderSelect now uses a smaller fixed-field up/down chevron while preserving native select behavior | next: rerun focused validation, then npm run verify:pre-pr`
- `2026-06-03 | merged | PR #973 shipped as squash commit 1a79fe5 after focused validation, full verify:pre-pr, green required CI, and verify:pre-merge passed | next: repo-managed docs-only closeout moves this brief to done and clears active AW-006 queue/design inventory references`

## Completion Record

- `completed`: `2026-06-03`
- `merged_pr`: `#973`
- `squash_commit`: `1a79fe5`
- `result`: Closed AW-006 Program Builder Inner Planner And Export Panel Token/Input/Action Parity by aligning the saved-program title field, planner cards, workout picker/add controls, move/remove controls, Garmin-ready JSON panel, and Program PDF panel with the current My Library token/input/action direction while preserving program data, APIs, draft/save/reset behavior, exports, filenames, auth, analytics, Help/Guide, support behavior, and commerce.
- `validation`: focused `npm exec vitest run tests/unit/program-builder-hub.test.tsx` passed 8/8; `npm run typecheck` passed; `npm run lint:briefs -- --all` passed 423/423; route/label/support sweep returned expected scoped hits; `git diff --check` passed; before/after screenshot handoff captured in `output/aw-006-program-builder-inner-planner-export-token-parity-2026-06-03-203600`; owner explicitly waived a new screenshot after the final up/down chevron tweak; `npm run verify:pre-pr` passed the full lane; required PR #973 CI passed; `npm run verify:pre-merge` passed.
- `10/10 claim`: yes - all critical target categories reached `5/5`; the broad app-wide select primitive remains intentionally out of scope and does not reduce the scoped target score.

| Category                                      | Achieved Score | Evidence                                                                                            | Gaps / Notes                                                   |
| --------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | PR #973, route/label/support sweep, full verify gates.                                              | No gap for this scoped Program Builder inner parity slice.     |
| UX flow clarity                               | `5/5`          | Screenshot handoff plus owner-directed select indicator correction.                                 | App-wide select migration is out of scope.                     |
| Visual design quality                         | `5/5`          | Token/input/action class reuse, controlled select indicator, screenshot handoff.                    | Final chevron tweak was owner-waived without a new screenshot. |
| Business logic correctness and data integrity | `5/5`          | Focused unit tests and full verify gates preserved planner/export behavior.                         | No data model, API, persistence, or export payload changes.    |
| Accessibility (a11y)                          | `5/5`          | Native select semantics preserved; full Playwright/a11y lane passed.                                | No gap.                                                        |
| Performance (CWV + payloads)                  | `5/5`          | verify:pre-pr and verify:pre-merge performance budgets passed.                                      | No route payload or runtime dependency change.                 |
| Data placement and sync boundaries            | `5/5`          | Brief boundary plus unchanged local/server program contracts.                                       | No sync behavior changed.                                      |
| Reliability and failure handling              | `5/5`          | Existing disabled, missing-workout, pending, success, and error states preserved under tests/gates. | No gap.                                                        |
| Security and authz                            | `5/5`          | No auth/API changes; protected route behavior covered by full verify.                               | No gap.                                                        |
| Content governance                            | `5/5`          | Queue/design inventory and task brief updated in the implementation PR and this closeout.           | No Help/Guide change required.                                 |
| i18n operational readiness                    | `5/5`          | No user-facing label semantics or locale routing changed; existing labels preserved.                | N/A beyond scoped visual parity.                               |
| Stack-fit and dependency discipline           | `5/5`          | Reused local React/Tailwind patterns and lucide icon already in dependency set.                     | No new dependency.                                             |
| Testing and QA automation                     | `5/5`          | Focused Vitest, typecheck, brief lint, route sweep, pre-pr, CI, and pre-merge passed.               | No gap.                                                        |
| DevOps and rollback readiness                 | `5/5`          | Squash commit #973, green CI, verify:pre-merge pass, docs-only closeout path.                       | Rollback remains normal PR revert.                             |
