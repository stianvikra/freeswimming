# Task Brief: AW-006 GoalsHub Inner Goal Form And Row Action Token/Input Parity (10/10)

## Metadata

- `id`: `2026-06-03-aw-006-goalshub-inner-form-row-token-input-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-03`
- `updated`: `2026-06-03`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-goals-hub-inner-token-parity`
- `execution_mode`: `owner-approved implementation through screenshot handoff; stop before broad PR gates until screenshot approval`

## Brief Audit Record

- `last_audited`: `2026-06-03`
- `base`: `main@8a875bf`
- `audit_status`: `ready`
- `decision`: Execute this as the current bounded AW-006 UI slice.
- `reason`: `main` is clean and synced after Admin Console Accessibility Audit PR `#961` and repo-managed closeout PR `#962`; post-merge preflight was reported green with no pending closeout. A fresh queue/design/code review found no active AW-006 slice selected and found `GoalsHub` inner add-goal, custom input, template, row action, detail action, and coaching CTA presentation still using older route-local rounded/slate/blue classes after the `/my-library/goals` route shell and top `Your goals` panel were already tokenized in PR `#874`.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `GoalsHub`, `/my-library/goals`, goals API/storage contracts, goal templates/status/action contracts, My Training bridge links, screenshot handoff rules, forward compatibility rules, route/label/support sweep rules, or verification lanes change before screenshot handoff.

## Goal

Align the inner `GoalsHub` add-goal form, template cards, goal row cards, result inputs, details panel, and visible row/coaching actions with the current My Library token/input/action direction without changing goal behavior.

## Pre-Implementation Owner Explanation

Vi rydder opp inne i Goals-flaten, spesielt skjemaet for nye maal og knappene/feltene pa hver maalrad. Det betyr at Goals foles like gjennomfort som resten av My Library, og brukeren slipper en blanding av gammel og ny visuell stil.

Utenfor scope er maal-data, API-er, filtrering, active-limit, templates, My Training-lenker, create/log/archive/restore/reset-oppforsel, analytics, Help/Guide, supportflyt, delt komponentbibliotek og bredere My Library-opprydding.

Vi tar ikke med mer bare for a fa mer igjen for `npm run verify:pre-pr` og `npm run verify:pre-merge`. De brede gate-runene koster uansett tid, men bredere scope vil gi mer screenshot-review, storre regresjonsflate og vanskeligere feilsoking. Denne slicen er derfor begrenset til den komplette indre `GoalsHub`-presentasjonen.

Fremoverkompatibilitet: nye goal templates og eksisterende goal actions skal automatisk arve samme felt-/knappehierarki nar de bruker dagens `GoalView`/template/action-kontrakter. Nye action-typer, status-toner, workflow-labels eller route-handlinger krever eksplisitt mapping, test og screenshot-evidence for release.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                   | Evidence                                        | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library/goals` remains the private Goals workspace, and inner add/log/details/coaching actions keep the same purpose, labels, order, and destinations.                          | component diff + focused tests + screenshots    | `5/5`                   |
| UX flow clarity                               | `target`     | Add-goal mode choice, template use, custom goal fields, log-result input/action, details actions, and coaching CTA are easier to scan without changing workflows.                    | Testing Library assertions + screenshot handoff | `5/5`                   |
| Visual design quality                         | `target`     | Inner panels, cards, fields, status chips, progress rows, and actions use current My Library token/input/action styling with no mobile/desktop text overflow.                        | before/after screenshots + class assertions     | `5/5`                   |
| Business logic correctness and data integrity | `target`     | No changes to goal loading, create/log/archive/restore/reset payloads, filters, active-limit logic, templates, result parsing, status derivation, or My Training bridge links.       | changed-files review + targeted tests           | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this private member workspace slice changes no admin editor, CRUD workflow, publish flow, operator queue, or admin action surface.                                       | explicit admin-editor scope rationale           | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Labels, aria-pressed controls, aria-expanded details, visible focus styles, keyboard reachability, disabled states, and live feedback semantics remain intact after token changes.   | Testing Library assertions + screenshot QA      | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No dependency, media asset, new API call, polling loop, data model, or route payload growth beyond class/markup consolidation in the existing client component.                      | dependency diff + broad gate                    | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this visual/action hierarchy slice introduces no local storage, server-canonical data, sync trigger, conflict policy, retention rule, or sensitive-data flow.            | data-boundary rationale                         | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because existing `/my-library/goals` dynamic loading and goals mutation refresh behavior remain unchanged; no fetch/cache path changes.                                          | changed-files review                            | `N/A`                   |
| Reliability and failure handling              | `target`     | Existing offline, action-error, action-success, first-run empty, filtered no-results, pending create/log, and retry states continue to render deterministically.                     | existing/updated focused tests                  | `5/5`                   |
| Security and authz                            | `target`     | Anonymous auth redirect, protected goals data loading, and fail-closed API boundaries remain untouched; no protected data moves to a new route or client boundary.                   | route/component diff + focused route test       | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data fields, telemetry payloads, legal copy, consent behavior, logs, secrets, provider data, or sensitive diagnostics change.                                    | privacy scope rationale                         | `N/A`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this active brief, and design inventory record the selected GoalsHub inner parity slice without stale active-slice references.                               | docs diff + brief lint                          | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow label, editable admin field, status transition, review/publish path, recovery procedure, Help/Guide assertion, or support action.         | explicit admin-workflow scope rationale         | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/goals` is authenticated/private and this slice changes no public metadata, sitemap, robots, canonical URL, structured data, or indexability contract.       | private-route SEO rationale                     | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity model, structured data, public semantic content, or AI-facing documentation contract.                                           | AI-discoverability scope rationale              | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event taxonomy, payload, persistence, dashboard, KPI definition, or consent behavior changes.                                                               | analytics scope rationale                       | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no Stripe, checkout, catalog, entitlement, portal, invoice, refund, payout, or reporting behavior.                                                    | commerce scope review                           | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A with scope rationale: this changes no incident path, alerting, runbook procedure, support diagnostics, recovery workflow, or support escalation behavior.                        | explicit support-ops scope rationale            | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this changes no billing provider data, invoice/refund path, payout, finance report, reconciliation surface, entitlement truth, or revenue operation.       | explicit finance scope rationale                | `N/A`                   |
| i18n operational readiness                    | `target`     | Form labels, action labels, status chips, and row actions stay responsive and layout-safe so later localization is not blocked by tight fixed-width assumptions.                     | screenshot text-fit review + class review       | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `GoalsHub`, existing goals route, My Library token classes, `ui-field`, `fs-cta-*`, `components/ui/actionLayout.ts`, Tailwind variables, and current tests; add no dependency. | changed-files/dependency diff                   | `5/5`                   |
| Testing and QA automation                     | `target`     | Update focused GoalsHub tests, run targeted Vitest, brief lint, route/label/support sweep, screenshot handoff, `verify:pre-pr`, CI, and `verify:pre-merge`.                          | test commands + screenshots + verify gates      | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: this reuses existing local UI classes and adds no service call, storage, background job, polling, provider, or traffic-dependent cost.                              | implementation review                           | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert restores prior markup/tests/docs; no migration, dependency, config, workflow, provider setting, or feature flag rollback is needed.                                | git diff + validation evidence                  | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep `/my-library/goals` as the authenticated server route with `dynamic = "force-dynamic"`.
  - Reuse `GoalsHub` as the existing client boundary; do not move goal data ownership or action logic into a new component hierarchy.
  - Preserve route redirects, server loaders, API routes, cache behavior, templates, filters, and action handlers.
- TypeScript/domain contracts:
  - Preserve `GoalView`, `GoalPrimaryAction`, `GOAL_TEMPLATES`, `GOALS_ACTIVE_LIMIT`, status/filter unions, result parsing, payload builders, and My Training bridge URLs.
  - Do not change validation, create/log/archive/restore/reset behavior, API payloads, or goals feedback semantics.
- Supabase/data layer:
  - N/A; no migration, RLS/authz rule, generated DB type, storage, index, or data access change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, analytics vendor, email provider, SDK, secret, webhook, retry, or idempotency behavior changes.
- UI system:
  - Mature reference surfaces: tokenized `/my-library/goals` route/top panel from PR `#874`, `MyLibraryHub`, `TodayTabsPanel`, `WorkoutBuilderHub` inner token/action work, `ui-field`, `fs-cta-*`, and `components/ui/actionLayout.ts`.
  - Keep the change component-local to the complete inner `GoalsHub` visible surface; do not create an app-wide Button/Card/Field primitive in this slice.
  - Screenshot handoff type: `before/after` for `/my-library/goals` desktop and mobile, focusing on add-goal form and goal row/details surfaces.
- Testing:
  - Update focused GoalsHub tests for inner panel, field, row card, details action, result input, and coaching CTA class contracts.
  - Preserve existing goals route, feedback, filter, action error/success, and My Training bridge coverage.

## Data Placement And Sync Contract

N/A with rationale: this is a visual/input/action hierarchy parity slice. It introduces no new local-only data, server-canonical data, browser storage, sync trigger, conflict resolution, retry policy, retention rule, cache invalidation, or sensitive data handling. Existing goal rows, templates, active-limit logic, and local component UI state remain the source of truth.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible identifier, alias, redirect, or compatibility mapping. Existing goal IDs, titles, status labels, template IDs, and route labels remain stable.

## Forward Compatibility Contract

- Extensibility surfaces touched:
  - `GoalsHub` template cards,
  - custom goal form fields,
  - `GoalPrimaryAction` row actions,
  - goal status chips,
  - details panel actions,
  - My Training bridge links,
  - coaching CTA.
- Source of truth:
  - Goal content remains derived from `loadGoalViews`, `GoalView`, `GoalPrimaryAction`, `GOAL_TEMPLATES`, and `GOALS_ACTIVE_LIMIT`.
  - Filter counts remain derived from the rendered goals array.
- Additive behavior:
  - new goals returned by existing `GoalView` fields continue to render in the same row/card pattern.
  - future templates in `GOAL_TEMPLATES` inherit the same template card and `Use template` action presentation.
  - existing `GoalPrimaryAction` variants inherit the same primary/secondary token direction.
- Explicit mapping requirements:
  - new goal types, status tones, filters, route-level actions, workflow labels, or materially different goal modes require deliberate copy/class/test/screenshot updates before release.
  - Help/Guide or support updates are required if implementation changes labels, routes, recovery behavior, or workflow meaning; those changes are out of scope here.
- Unknown or deprecated values:
  - this slice adds no new unknown value path; existing typed goals helpers and feedback behavior continue to own unsupported data states.
  - unknown API payloads must not be interpreted as visual success states.
- Test/evidence:
  - focused tests verify token/input/action class reuse while preserving action semantics.
  - screenshot handoff checks desktop/mobile text fit.
  - route/label/support sweep checks Goals, GoalsHub, Add goal, Use template, Create custom goal, Log result, Details, Use as focus, Add note, Archive, Restore, Request coaching schedule, `/my-library/goals`, and My Training bridge fallout.

## Help / Guide Impact

N/A with rationale: this slice changes presentation only. It does not rename routes, labels, workflow actions, Help/Guide content, support recovery behavior, goals storage behavior, or operator instructions.

## Route / Label / Support Surface Sweep

Required because `/my-library/goals`, visible goal actions, and My Training bridge actions are touched.

- Identifiers to search before broad gates:
  - `/my-library/goals`
  - `GoalsHub`
  - `Add goal`
  - `Use template`
  - `Create custom goal`
  - `Log result`
  - `Details`
  - `Use as focus`
  - `Add note`
  - `Archive`
  - `Restore`
  - `Request coaching schedule`
  - `goal-use-focus`
  - `goal-use-note`
- Surfaces to check:
  - `app/`
  - `components/`
  - `tests/`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/design/`
  - `docs/runbooks/`
- Expected fallout:
  - `components/my-library/goals/GoalsHub.tsx`,
  - focused tests,
  - this active brief,
  - canonical AW-006 queue,
  - design inventory,
  - screenshot artifacts during implementation.

## Scope

- `components/my-library/goals/GoalsHub.tsx` inner add-goal panel, template cards, custom goal fields, result input/action area, goal row cards, details panel, row actions, and coaching CTA presentation.
- Focused unit assertions in `tests/unit/goals-hub.test.tsx`.
- Canonical AW-006 queue and design inventory updates.
- Before/after screenshot handoff artifacts during implementation.

## Out Of Scope

- `app/my-library/goals/page.tsx` route shell changes unless needed only for screenshot harness stability.
- Goal data model, API routes, Supabase queries, generated database types, migrations, auth, analytics taxonomy, route labels, goal filters, active-limit logic, templates, My Training bridge behavior, create/log/archive/restore/reset behavior, Help/Guide updates, support workflow, broad member notice primitive, app-wide Button/Card/PageShell/Field/Notice primitive, new dependencies, commerce, packages, and merge without explicit owner approval.
- Other My Library workspaces, admin surfaces, public pages, brand media, onboarding/first-run flow, and broad desktop dashboard/admin layout work.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves screenshots.

## Acceptance Criteria

1. `GoalsHub` keeps the same goals, templates, filters, active-limit logic, My Training bridge links, action handlers, result parsing, and feedback semantics.
2. Inner add-goal panel, template cards, custom form fields, goal cards, progress/status visuals, details panel, and row/coaching actions align with current My Library token/input/action direction.
3. Existing labels, destinations, disabled states, pending labels, error/success feedback, and static empty states are preserved.
4. No goals business logic, data persistence, API routes, analytics, Help/Guide, or support workflow changes are introduced.
5. Focused tests pass and screenshot handoff is captured before broad gates.
6. Canonical AW-006 queue and design inventory record this selected slice without stale active references.
7. Work stops after screenshot handoff until owner approval.

## Validation

Completed before screenshot handoff:

- `npm exec vitest run tests/unit/goals-hub.test.tsx` - PASS, 1 file / 10 tests.
- `npm exec vitest run tests/unit/goals-page.test.tsx tests/unit/goals-hub.test.tsx` - PASS, 2 files / 12 tests.
- `npm run typecheck` - PASS.
- `npm run lint:briefs:all` - PASS, 418 brief files.
- `npm run lint:quality-gates` - PASS, changed files classified as docs governance, testing/QA, and UI/layout/brand with required evidence present.
- targeted route/label/support sweep for GoalsHub route, labels, row actions, coaching CTA, and My Training bridge references - PASS; fallout was expected Goals/My Training/docs/test usage plus unrelated generic `Archive`/`Details` labels outside scope.
- `git diff --check` - PASS.

Visual gate:

- `before` screenshots captured from a temporary `origin/main@8a875bf` worktree on `http://127.0.0.1:3000`.
- `after` screenshots captured from `aw-006-goals-hub-inner-token-parity` on `http://127.0.0.1:3000`.
- Screenshot artifact folder: `output/aw-006-goalshub-inner-token-parity-2026-06-03-123549/`.
- Files:
  - `before-goalshub-inner-template-desktop.png`
  - `after-goalshub-inner-template-desktop.png`
  - `before-goalshub-inner-custom-mobile.png`
  - `after-goalshub-inner-custom-mobile.png`
- Capture route caveat: used a temporary local screenshot route with deterministic `GoalsHub` data because the authenticated product route depends on local auth/Supabase browser env. The temporary route rendered the same route shell and `GoalsHub` surface, omitted `SiteChrome`, and was removed after capture.
- Stop for owner screenshot approval before `npm run verify:pre-pr`.

Broad gates after screenshot approval:

- `npm run verify:pre-pr`
- required PR CI checks
- `npm run verify:pre-merge`

## Manual QA / Screenshot Handoff

Required because this changes visible UI/layout.

- Capture type: `before/after`.
- Captured: `2026-06-03 12:41` Europe/Oslo.
- Required viewports:
  - desktop `/my-library/goals`,
  - mobile `/my-library/goals`.
- Artifact folder pattern:
  - `output/aw-006-goalshub-inner-token-parity-YYYY-MM-DD-HHMMSS/`
- Required focus:
  - add-goal open state,
  - custom goal form state,
  - at least one goal row with details open,
  - row/coaching actions.
- Actual artifact folder:
  - `output/aw-006-goalshub-inner-token-parity-2026-06-03-123549/`
- Visual review note:
  - desktop `template` before/after covers add-goal template cards, goal row, result input/action, details panel actions, and coaching CTA.
  - mobile `custom` before/after covers custom goal fields, mobile action stacking, result input/action, details panel actions, and coaching CTA.
  - No visible text overlap or layout break was found in the captured desktop/mobile artifacts.

## Checkpoint Log

- `2026-06-03 | in-progress | started from clean main@8a875bf after PR #961 and repo-managed closeout #962; owner approved and explicitly executed GoalsHub Inner Goal Form And Row Action Token/Input Parity after asking whether to broaden scope for gate time; scope stays narrow to avoid unnecessary screenshot/regression risk | next: implement scoped GoalsHub presentation, focused tests, queue/inventory updates, targeted QA, then screenshot handoff before verify:pre-pr`
- `2026-06-03 | targeted-validation | implemented component-local GoalsHub token/input/action presentation, focused tests, AW-006 queue, and design inventory updates; targeted Vitest, typecheck, brief lint, quality-gate lint, route/label/support sweep, and diff-check are green | next: capture before/after screenshot handoff and stop for owner approval before verify:pre-pr`
- `2026-06-03 | screenshot-handoff-ready | captured before/after desktop/mobile screenshots in output/aw-006-goalshub-inner-token-parity-2026-06-03-123549/ using a temporary deterministic GoalsHub route; removed the temporary route, stopped dev servers, and removed the before worktree | next: wait for owner screenshot approval before npm run verify:pre-pr`
- `2026-06-03 | screenshot-approved | owner approved the screenshot handoff in chat; no product-rendering files changed after capture except this brief checkpoint note | next: run npm run verify:pre-pr, then commit, push, and open/update PR`
