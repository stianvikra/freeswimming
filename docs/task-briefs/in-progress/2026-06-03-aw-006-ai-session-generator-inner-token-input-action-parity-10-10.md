# Task Brief: AW-006 AI Session Generator Inner Token/Input/Action Parity (10/10)

## Metadata

- `id`: `2026-06-03-aw-006-ai-session-generator-inner-token-input-action-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-03`
- `updated`: `2026-06-03`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-generator-inner-token-input-action-parity`
- `execution_mode`: `owner-approved end-to-end implementation; stop after screenshot handoff for owner approval before pre-PR gate`

## Brief Audit Record

- `last_audited`: `2026-06-03`
- `base`: `main@e39cd39`
- `audit_status`: `ready`
- `decision`: Execute this as the current bounded AW-006 UI slice through screenshot handoff.
- `reason`: `main` is clean and synced after HabitsHub Inner Token/Input/Action Parity PR `#969` and repo-managed closeout PR `#970`; post-merge preflight was reported green with no pending closeout. A fresh queue/design/code review found no active AW-006 product/UI slice selected and found the inner `GeneratorIntakeHub` source controls plus `SessionGeneratorPanel` skill-limit cards, setup/rules fields, quick choices, inputs, and visible actions still using older route-local rounded/slate/blue classes after the `/my-library/generator` route shell and top panels were tokenized in PR `#878`.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/my-library/generator`, `GeneratorIntakeHub`, `SessionGeneratorPanel`, generator-intake contracts, session-draft/workout-save contracts, mobile action layout rules, screenshot handoff rules, forward compatibility rules, route/label/support sweep rules, or verification lanes change before screenshot handoff.

## Goal

Align the inner AI Session Generator source choices, badges, fields, skill-limit cards, setup/rules controls, quick choices, inputs, and visible actions with the current My Library token/input/action direction without changing generator behavior.

## Pre-Implementation Owner Explanation

Vi rydder innsiden av AI-generatoren, slik at kildevalg, badges, felt, valgknapper, skill-limit-kort og generatorhandlinger ser ut som resten av My Library. Det gjør generatoren roligere, mer helhetlig og enklere å skanne.

Utenfor scope er AI-logikk, generatoralgoritme, API-er, lagring, localStorage, workout-save, selected-workout-flyt, analytics, Help/Guide, supportflyt, Habits UX findings, My Library new-content notice, og den genererte WorkoutEditor/session-step-flaten som allerede har egen referanse.

Fremoverkompatibilitet: nye generatorfelt eller kildekilder som bruker dagens typed contracts skal arve samme felt/action/chip-mønster. Nye generator-modes, workflow actions, destructive semantics eller nye statusverdier krever eksplisitt mapping, test og screenshot-evidence.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                        | Evidence                                        | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library/generator` remains the private AI session generator, and inner source/setup/rules sections keep the same purpose, labels, order, and destinations.                           | component diff + focused tests + screenshots    | `5/5`                   |
| UX flow clarity                               | `target`     | Source selection, skill limits, session setup, session rules, pool-size choices, generate/regenerate/reset actions, and feedback remain easier to scan without changing workflow.         | Testing Library assertions + screenshot handoff | `5/5`                   |
| Visual design quality                         | `target`     | Inner cards, fieldsets, fields, chips, badges, quick choices, and primary/secondary actions use current My Library token/input/action styling with no text overflow.                      | before/after screenshots + class assertions     | `5/5`                   |
| Business logic correctness and data integrity | `target`     | No changes to generator snapshot loading, source selection, overrides, validation, session-draft API payloads, generated draft editing, workout save payloads, or selected workout state. | changed-files review + targeted tests           | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this private member workspace slice changes no admin editor, CRUD workflow, publish flow, operator queue, or admin action surface.                                            | explicit admin-editor scope rationale           | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Labels, field associations, radio/checkbox semantics, aria-pressed controls, aria-expanded controls, focus styles, keyboard reachability, disabled states, and live feedback stay intact. | Testing Library assertions + screenshot QA      | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No dependency, media asset, new API call, polling loop, client state model, or route payload growth beyond class/markup consolidation in existing client components.                      | dependency diff + broad gate                    | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical generator/workout data and local-only generator settings/draft UI boundaries remain unchanged; this slice only changes presentation.                                     | data-boundary review + targeted tests           | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because existing `/my-library/generator` dynamic loading, generator fetches, and explicit save/generate invalidation behavior remain unchanged; no cache path changes.                | changed-files review                            | `N/A`                   |
| Reliability and failure handling              | `target`     | Existing recovered-draft, stale-source, load-error, save-unavailable, selected-workout-missing, validation-error, action-error, action-success, and pending states still render.          | existing/updated focused tests                  | `5/5`                   |
| Security and authz                            | `target`     | Anonymous auth redirect, protected generator data loading, and fail-closed API boundaries remain untouched; no protected data moves to a new route or client boundary.                    | route/component diff + existing route tests     | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data fields, telemetry payloads, legal copy, consent behavior, logs, secrets, provider data, or sensitive diagnostics change.                                         | privacy scope rationale                         | `N/A`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this brief, and design inventory record the selected generator inner parity slice without stale active-slice references.                                          | docs diff + brief lint                          | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow label, editable admin field, status transition, review/publish path, recovery procedure, Help/Guide assertion, or support action.              | explicit admin-workflow scope rationale         | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/generator` is authenticated/private and this slice changes no public metadata, sitemap, robots, canonical URL, structured data, or indexability contract.        | private-route SEO rationale                     | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity model, structured data, public semantic content, or AI-facing documentation contract.                                                | AI-discoverability scope rationale              | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event taxonomy, payload, persistence, dashboard, KPI definition, or consent behavior changes.                                                                    | analytics scope rationale                       | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no Stripe, checkout, catalog, entitlement, portal, invoice, refund, payout, or reporting behavior.                                                         | commerce scope review                           | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A with scope rationale: this changes no incident path, alerting, runbook procedure, support diagnostics, recovery workflow, or support escalation behavior.                             | explicit support-ops scope rationale            | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this changes no billing provider data, invoice/refund path, payout, finance report, reconciliation surface, entitlement truth, or revenue operation.            | explicit finance scope rationale                | `N/A`                   |
| i18n operational readiness                    | `target`     | Source labels, badges, setup/rules labels, quick choices, and action labels stay responsive and layout-safe so later localization is not blocked by tight fixed-width assumptions.        | screenshot text-fit review + class review       | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `GeneratorIntakeHub`, `SessionGeneratorPanel`, My Library token classes, `ui-field`, `fs-cta-*`, `fs-library-card`, Tailwind variables, and current tests; add no dependency.       | changed-files/dependency diff                   | `5/5`                   |
| Testing and QA automation                     | `target`     | Update focused generator tests, run targeted Vitest, brief lint, route/label/support sweep, screenshot handoff, then stop before `verify:pre-pr` until owner approval.                    | test commands + screenshots + later gates       | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: this reuses existing local UI classes and adds no service call, storage, background job, polling, provider, or traffic-dependent cost.                                   | implementation review                           | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert restores prior markup/tests/docs; no migration, dependency, config, workflow, provider setting, or feature flag rollback is needed.                                     | git diff + validation evidence                  | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep `/my-library/generator` as the authenticated server route with existing dynamic loading and redirect behavior.
  - Reuse `GeneratorIntakeHub` and `SessionGeneratorPanel` as the existing client boundaries; do not move generator data ownership, form state, selected-workout state, or draft editing into a new hierarchy.
  - Preserve route redirects, server loaders, API routes, cache behavior, My Swim Sessions links, and action handlers.
- TypeScript/domain contracts:
  - Preserve `GeneratorIntakeSnapshot`, `GeneratorIntakeSelection`, `GeneratorIntakeOverrides`, `GeneratorIntakeHandoffPayload`, `SessionGeneratorFormState`, session-draft payloads, workout-library snapshots, generated workout drafts, and save/update handlers.
  - Do not change validation, API payloads, localStorage keys, generated draft editing, workout save behavior, or selected-workout handling.
  - Session-step reference contract: `docs/design/session-step-surface-contract.md` remains authoritative. Generated session-step rendering stays delegated to `WorkoutEditor` and is not restyled here.
- Supabase/data layer:
  - N/A; no migration, RLS/authz rule, generated DB type, storage, index, or data access change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, analytics vendor, email provider, SDK, secret, webhook, retry, or idempotency behavior changes.
- UI system:
  - Mature reference surfaces: AI generator route/top-panel token work from PR `#878`, GoalsHub inner token/input/action parity from PR `#963`, My Swim Profile inner token/input/action parity from PR `#965`, My Training inner token/input/action parity from PR `#967`, HabitsHub inner token/input/action parity from PR `#969`, `ui-field`, `fs-cta-*`, `fs-library-card`, and `components/ui/actionLayout.ts`.
  - Keep the change component-local to inner `GeneratorIntakeHub` source controls and `SessionGeneratorPanel` settings/rules controls; do not create an app-wide Button/Card/Field/Notice primitive in this slice.
  - Use scoped helper classes in the generator components for field, fieldset, badge, choice, checkbox/radio label, supporting note, and mobile action intent so the parity change does not duplicate long class strings across every generator control.
  - Screenshot handoff type: `before/after` for `/my-library/generator` desktop and mobile, focusing on source choices, badges, skill limits, setup/rules fields, pool choices, and generator actions.
- Testing:
  - Update focused `GeneratorIntakeHub` and `SessionGeneratorPanel` tests for inner panel, field, choice, badge/chip, quick-choice, and action class contracts.
  - Preserve existing generator feedback, selection, override, generate, save, selected-workout, and WorkoutEditor integration coverage.

## Data Placement And Sync Contract

- Server-canonical data:
  - Generator intake snapshot data and saved workouts remain owned by the existing authenticated server/API/Supabase paths.
- Local data:
  - Existing local generator settings, restored draft settings, and generated unsaved draft UI state stay local-only where they already are.
- Sync policy:
  - Generator settings continue to build the handoff payload; session generation and workout save continue through existing API calls and explicit user actions.
- Retention and sensitivity:
  - No new persisted data, storage key, log, event, or sensitive value is introduced.
- Cache/invalidation:
  - No cache mode or invalidation behavior changes.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible identifier, alias, redirect, or compatibility mapping. Existing workout IDs, generator labels, route labels, form control names, local UI identifiers, and localStorage keys remain stable.

## Forward Compatibility Contract

- Extensibility surfaces touched:
  - generator source rows, status badges, collapsed summary chips, include toggles, and Add/Edit links,
  - skill-limit mode/status cards and limit fields,
  - session setup and session rules fields,
  - pool-size unit/quick-choice controls,
  - drill/kick/rest explicit fields and supporting notes,
  - generate/regenerate/reset/clear/done actions.
- Source of truth:
  - Generator source rows remain derived from `buildGeneratorHandoffPayload`, `GeneratorIntakeSnapshot`, and existing `buildSwimProfileDataRows` behavior.
  - Session settings, draft status, workout save readiness, and selected-workout states remain derived from existing generator/workout contracts.
- Additive behavior:
  - new generator source rows flowing through existing snapshot/payload contracts should continue to render in the same source-row/card/action pattern.
  - new form controls using existing session-generator value unions should reuse the same field/choice/action helpers.
- Explicit mapping requirements:
  - new AI generation modes, source-status categories, route-level actions, destructive actions, workflow labels, or materially different generator states require deliberate copy/class/test/screenshot updates before release.
  - Help/Guide or support updates are required if implementation changes labels, routes, recovery behavior, or workflow meaning; those changes are out of scope here.
- Unknown or deprecated values:
  - this slice adds no new unknown value path; existing typed generator helpers and feedback behavior continue to own unsupported data states.
  - unknown API payloads must not be interpreted as visual success states.
- Test/evidence:
  - focused tests verify token/input/action class reuse while preserving action semantics.
  - screenshot handoff checks desktop/mobile text fit.
  - route/label/support sweep checks `AI swim session generator`, `GeneratorIntakeHub`, `SessionGeneratorPanel`, `Use Swim Profile data`, `Generate session`, `Regenerate`, `Reset`, `Reset to Swim Profile`, `Clear`, `Done`, `/my-library/generator`, My Swim Sessions entrypoints, Help/Guide/support docs, and generator feedback IDs.

## Help / Guide Impact

N/A with rationale: this slice changes presentation only. It does not rename routes, labels, workflow actions, Help/Guide content, support recovery behavior, generator storage behavior, or operator instructions.

## Route / Label / Support Surface Sweep

Required because `/my-library/generator`, visible generator actions, and source/setup/rules labels are touched.

- Identifiers to search before broad gates:
  - `/my-library/generator`
  - `AI swim session generator`
  - `GeneratorIntakeHub`
  - `SessionGeneratorPanel`
  - `Use Swim Profile data`
  - `Generate session`
  - `Regenerate`
  - `Reset`
  - `Reset to Swim Profile`
  - `Clear`
  - `Done`
  - `Session setup`
  - `Session Rules`
  - `Stroke and skill limits`
  - `generator-intake-draft-recovered`
  - `session-generator-action-error`
  - `session-generator-action-success`
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
  - `components/my-library/generator/GeneratorIntakeHub.tsx`,
  - `components/my-library/generator/SessionGeneratorPanel.tsx`,
  - focused tests,
  - this active brief,
  - canonical AW-006 queue,
  - design inventory,
  - screenshot artifacts during implementation.

## Scope

- `components/my-library/generator/GeneratorIntakeHub.tsx` inner source rows, badges, summary chips, include checkboxes, reset action, and Add/Edit links.
- `components/my-library/generator/SessionGeneratorPanel.tsx` inner skill-limit cards, status badges, setup/rules fields, select/textarea/input styling, pool unit/quick choices, drill/kick/rest explicit controls, supporting notes, and visible actions.
- Focused unit assertions in `tests/unit/generator-intake-hub.test.tsx` and `tests/unit/session-generator-panel.test.tsx`.
- Canonical AW-006 queue and design inventory updates.
- Before/after screenshot handoff artifacts during implementation.

## Out Of Scope

- `app/my-library/generator/page.tsx` route shell changes unless needed only for screenshot harness stability.
- Generator data model, generator-intake API, session-draft API, workout save/update APIs, Supabase queries, generated database types, migrations, auth, analytics taxonomy, route labels, generation algorithm, generated draft editor behavior, selected workout handling, localStorage keys, My Swim Sessions navigation behavior, Help/Guide updates, support workflow, broad member notice primitive, app-wide Button/Card/PageShell/Field/Notice primitive, new dependencies, commerce, packages, and merge without explicit owner approval.
- `WorkoutEditor`, `SessionStepSurfaceRenderer`, generated session-step rendering, WorkoutBuilderHub, DrylandBuilderHub, Program Builder, Habits UX findings, My Library new-content notice, admin surfaces, public pages, brand media, onboarding/first-run flow, and broad desktop dashboard/admin layout work.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves screenshots.

## Acceptance Criteria

1. `GeneratorIntakeHub` keeps the same snapshot, source selection, override, local draft restore, stale-source warning, and localStorage behavior.
2. `SessionGeneratorPanel` keeps the same form validation, generation, save, selected-workout, regenerate, and generated draft editor behavior.
3. Source rows, badges, chips, fields, fieldsets, quick choices, supporting notes, and visible actions align with current My Library token/input/action direction.
4. Existing labels, destinations, disabled states, pending labels, error/success feedback, missing-workout states, and save-unavailable states are preserved.
5. Mobile stack actions are layout-safe and avoid orphan rows while compact row/header controls remain compact by intent.
6. No generator business logic, data persistence, API routes, analytics, Help/Guide, or support workflow changes are introduced.
7. Focused tests pass and screenshot handoff is captured before broad gates.
8. Canonical AW-006 queue and design inventory record this selected slice without stale active references.
9. Work stops after screenshot handoff until owner approval.

## Validation

Completed before screenshot handoff:

- `npm exec vitest run tests/unit/generator-intake-hub.test.tsx tests/unit/session-generator-panel.test.tsx` - pass, `2` files / `14` tests.
- `npm run typecheck` - pass.
- `npm run lint:briefs:all` - pass.
- `npm run lint:quality-gates` - pass; human-judgment categories were listed as expected.
- `npm run lint` - pass with one existing unrelated warning in `output/capture-aw006-dryland-feedback.mjs`.
- targeted route/label/support sweep for generator routes, labels, actions, My Swim Sessions entrypoints, Help/Guide/support docs, and generator feedback IDs - completed; broad matches for generic `Done`/`Clear` were expected and no out-of-scope fallout was found.
- `git diff --check` - pass.
- Post-screenshot correction: `npm exec vitest run tests/unit/session-generator-panel.test.tsx` - pass, `1` file / `10` tests. This covers the mobile stack regression for the `Reset to Swim Profile` / `Done` action group.
- Second post-screenshot correction: `npm exec vitest run tests/unit/generator-intake-hub.test.tsx tests/unit/session-generator-panel.test.tsx` - pass, `2` files / `14` tests. This covers right-aligned mobile source-row actions for `Edit`.

Visual gate:

- Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- --webpack -H 127.0.0.1 -p <port>` for the before and after worktrees.
- Capture `before/after` screenshots for the inner AI generator surface through a temporary deterministic `/aw-006-generator-screenshot` harness if authenticated route fixtures are not enough.
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
- Required artifact folder: `output/aw-006-generator-inner-token-input-action-parity-YYYY-MM-DD-HHMMSS`.
- Required files:
  - `before-generator-inner-desktop.png`
  - `after-generator-inner-desktop.png`
  - `before-generator-inner-mobile.png`
  - `after-generator-inner-mobile.png`
- Capture focus:
  - desktop and mobile source controls, badges, included/excluded/missing rows, skill-limit cards, setup/rules fields, pool choices, drill/kick/rest controls, and generate/regenerate/reset actions.
- Captured: `2026-06-03 18:32`
- Artifact folder: `output/aw-006-generator-inner-token-input-action-parity-2026-06-03-183100`
- Files:
  - `before-generator-inner-desktop.png`
  - `after-generator-inner-desktop.png`
  - `before-generator-inner-mobile.png`
  - `after-generator-inner-mobile.png`
- Capture note: local dev auth bypass could not open the authenticated route because the local Supabase browser/server env was intentionally guarded. Screenshots therefore used a temporary deterministic `/aw-006-generator-screenshot` harness that rendered the production generator components with fixture data in the before and after worktrees; the harness was removed after capture.
- Visual correction note: refreshed screenshots verify `Reset to Swim Profile` no longer wraps to two lines on mobile; the edit actions now stack as full-width mobile rows and return to a compact flex row on desktop.
- Second visual correction note: refreshed screenshots verify source-row `Edit` actions are right-aligned on mobile and the screenshot harness route links use the same route action class as the production `/my-library/generator` page.
- Stop after screenshot handoff until owner approval.

## Checkpoint Log

- `2026-06-03 | in-progress | started from clean main@e39cd39 after HabitsHub Inner Token/Input/Action Parity #969 and repo-managed closeout #970; owner approved recommended AW-006 AI Session Generator Inner Token/Input/Action Parity with source choices, badges, fields, skill-limit cards, setup/rules controls, quick choices, and generator actions in scope | next: implement focused generator inner token/input/action parity, update tests/docs, run targeted validation, then capture before/after screenshot handoff`
- `2026-06-03 | in-progress | implemented scoped generator inner token/input/action parity in GeneratorIntakeHub and SessionGeneratorPanel, updated focused tests/docs, completed targeted validation, captured before/after desktop/mobile screenshot handoff artifacts through a temporary deterministic harness, removed harness, and stopped local dev servers | next: owner screenshot approval before verify:pre-pr, PR creation, and pre-merge gates`
- `2026-06-03 | in-progress | corrected screenshot feedback where Reset to Swim Profile wrapped to two lines on mobile by stacking that action group on mobile, added a focused test assertion, regenerated before/after desktop/mobile screenshots in a new artifact folder, removed harness, and stopped local dev servers | next: owner screenshot approval before verify:pre-pr, PR creation, and pre-merge gates`
- `2026-06-03 | in-progress | corrected second screenshot feedback by right-aligning mobile source-row Edit actions and matching screenshot-harness route links to the production route action class, reran focused generator tests, regenerated before/after desktop/mobile screenshots in a new artifact folder, removed harness, and stopped local dev servers | next: owner screenshot approval before verify:pre-pr, PR creation, and pre-merge gates`
- `2026-06-03 | in-progress | owner approved screenshot handoff for output/aw-006-generator-inner-token-input-action-parity-2026-06-03-183100 | next: run verify:pre-pr, commit, push, open PR, monitor CI, then run verify:pre-merge when PR is ready`
- `2026-06-03 | in-progress | owner approved merge on good tests; first verify:pre-pr attempt reached typecheck and failed on stale generated .next/dev/types/app/aw-006-generator-screenshot from the removed temporary screenshot harness | next: remove stale generated .next artifact, rerun verify:pre-pr, then continue PR and merge flow if gates stay green`
