# Task Brief: AW-006 AI Session Generator Workspace Token And Action Hierarchy Parity (10/10)

## Metadata

- `id`: `2026-05-27-aw-006-ai-session-generator-workspace-token-action-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-27`
- `updated`: `2026-05-27`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-generator-workspace-token-parity`
- `execution_mode`: `owner-approved implementation through PR automation after screenshot approval; merge requires explicit owner approval`

## Brief Audit Record

- `last_audited`: `2026-05-27`
- `base`: `main@6b6ccde`
- `audit_status`: `ready`
- `decision`: Execute this as the current owner-approved PR-sized AW-006 UI slice through screenshot handoff.
- `reason`: PR `#876` and repo-managed closeout PR `#877` are merged, `main` is clean at `6b6ccde`, `npm run post-merge:preflight` was reported green with no pending closeout, and a fresh queue/design/code re-audit found `/my-library/generator` route shell/header/actions still using older local rounded blue card/action styling while My Library, My Routines, owned item detail, saved sessions, My Training, My Swim Profile, Goals, and Habits now use the newer AW-006 token/action hierarchy.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/my-library/generator`, `GeneratorIntakeHub`, `SessionGeneratorPanel`, generator-intake contracts, session-draft/workout-save contracts, My Swim Sessions route contracts, screenshot handoff rules, forward compatibility rules, or verification lanes change before screenshot handoff.

## Goal

Make the `/my-library/generator` workspace shell, header, route actions, and top generator control panels visually align with the current My Library token/action hierarchy while preserving generator data, API behavior, local draft behavior, workout save behavior, analytics, Help/Guide, and support behavior.

## Pre-Implementation Owner Explanation

For ikke-programmerer: Vi rydder AI-generator-siden i My Library slik at den ser ut og oppforer seg mer likt de andre ferdigpolerte arbeidsflatene. Knappene, overskriften og de viktigste kortene skal fa samme rolige visuelle sprak som Habits, Goals, My Training, Profile og Routines.

Hvorfor det betyr noe: AI-generatoren er en viktig startflate for nye svommeokter. Nar den ser eldre og mer lokal ut enn nabosidene, foles produktet mindre helhetlig og mindre ferdig.

Utenfor scope: Vi endrer ikke AI-logikk, generator-data, API-er, lagring, localStorage, workout-save-flyt, redirects, analytics, Help/Guide eller supportflyt.

Fremoverkompatibilitet: Nye generator-kilder og handlinger som bruker eksisterende generator-kontrakter skal arve samme shell/action-retning automatisk. Nye AI-flyter, nye statusverdier eller nye generator-moduser krever egen mapping, copy og test.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                              | Evidence                                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library/generator` remains the private AI session generator reached from My Library/My Swim Sessions, with the same purpose, title, and route destinations.                | route/action review + focused tests            | `5/5`                   |
| UX flow clarity                               | `target`     | The generator header, `My Swim Sessions`, `Back to My Library`, Swim Profile data panel, generator settings, and generate actions are easier to scan without changing workflow. | screenshot handoff + focused tests             | `5/5`                   |
| Visual design quality                         | `target`     | Route shell/header/actions and top generator panels use My Library token/card/action language with stable spacing and no text overflow on mobile/desktop.                       | before/after screenshots + diff review         | `5/5`                   |
| Business logic correctness and data integrity | `target`     | No changes to generator snapshot loading, selection/override payloads, session-draft API calls, generated draft editing, workout save payloads, or selected workout handling.   | changed-files review + targeted tests          | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this private member workspace slice changes no admin editor, CRUD, publish workflow, operator queue, or admin action surface.                                       | explicit admin-editor scope rationale          | `N/A`                   |
| Accessibility (a11y)                          | `target`     | One visible `AI swim session generator` H1 remains; route, panel, and generator actions stay keyboard reachable with accessible names and layout-safe touch targets.            | Testing Library/e2e assertions + screenshot QA | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency, media asset, API call, polling loop, client state model, or route payload growth beyond markup/class changes.                                                | dependency diff + pre-PR gate                  | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical generator/workout data and local-only generator draft/settings boundaries remain unchanged; this slice only changes presentation.                              | data contract + code review                    | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because existing `dynamic = "force-dynamic"` behavior, generator server loading, and client save/refresh behavior remain unchanged; no fetch/cache path changes.            | changed-files review                           | `N/A`                   |
| Reliability and failure handling              | `target`     | Existing recovered-draft, stale-source, load-error, save-unavailable, action-error, and success states continue to render without shell interference.                           | focused regression tests + diff review         | `5/5`                   |
| Security and authz                            | `target`     | Anonymous `/my-library/generator` still redirects to `/auth/sign-in?next=%2Fmy-library%2Fgenerator`; no protected data moves to a new client boundary.                          | route/auth review + focused tests              | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data fields, telemetry payloads, legal copy, consent behavior, logs, secrets, or sensitive diagnostics change.                                              | privacy scope review                           | `N/A`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this active brief, and design inventory record the selected slice without stale active-slice references.                                                | docs diff + brief lint                         | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this slice changes no admin workflow label, Help/Guide action, support recovery procedure, operator edit path, or admin mutation.                                   | explicit admin-workflow scope rationale        | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/generator` is authenticated/private and this slice changes no public metadata, sitemap, robots, canonical URL, or indexability contract.               | private-route SEO rationale                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity model, structured data, public semantic content, or AI-facing documentation contract.                                      | AI-discoverability scope rationale             | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event taxonomy, payload, persistence, dashboard, KPI definition, or consent behavior changes.                                                          | analytics scope rationale                      | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no Stripe, checkout, catalog, entitlement, portal, invoice, refund, payout, or reporting behavior.                                               | commerce scope review                          | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A with scope rationale: this changes no incident path, alerting, runbook procedure, support diagnostics, recovery workflow, or support escalation behavior.                   | explicit support-ops scope rationale           | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this changes no billing, reconciliation, finance report, payout, refund, invoice, entitlement, provider financial data, or revenue operation.         | explicit finance scope rationale               | `N/A`                   |
| i18n operational readiness                    | `target`     | Route-action, panel, and generator action labels stay concise and layout-safe so later localization is not blocked by tight fixed-width assumptions.                            | screenshot text-fit review + focused tests     | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `SiteChrome`, existing `/my-library/generator` server route, `GeneratorIntakeHub`, `SessionGeneratorPanel`, My Library token/action references, Tailwind, and tests.      | changed-files/dependency diff                  | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused assertions for generator route shell/action classes and top panel token classes; preserve existing generator feedback/action coverage.                              | test output + screenshot handoff               | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: token/action parity adds no service call, storage, job, polling, or traffic-dependent cost.                                                                    | implementation review                          | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert restores prior markup/tests/docs; no migration, dependency, config, workflow, provider setting, or feature flag rollback is needed.                           | git diff + validation evidence                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep `/my-library/generator` as the authenticated server route with `dynamic = "force-dynamic"`.
  - Reuse `SiteChrome`, `GeneratorIntakeHub`, and `SessionGeneratorPanel`; do not move generator data ownership into a new client boundary.
  - Reuse `/my-library/habits`, `/my-library/goals`, `/my-library/training`, `/my-library/profile`, My Library hub, and My Routines token/action direction instead of inventing a new route-specific visual system.
  - Do not change route redirects, server loaders, API routes, cache behavior, My Swim Sessions links, or generator feedback semantics.
- TypeScript/domain contracts:
  - Preserve `GeneratorIntakeSnapshot`, `GeneratorIntakeSelection`, `GeneratorIntakeOverrides`, session-draft payloads, workout-library snapshots, generated workout drafts, and save/update handlers.
  - Do not change validation, API payloads, localStorage keys, generated draft editing, workout save behavior, or selected-workout handling.
  - Session-step reference contract: `docs/design/session-step-surface-contract.md` remains authoritative. This slice touches `SessionGeneratorPanel` outer generator settings/action chrome only; generated session-step rendering stays delegated to the existing `WorkoutEditor`/shared session-step renderer path and is not restyled here.
- Supabase/data layer:
  - N/A; no migration, RLS/authz rule, generated DB type, storage, index, or data access change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, analytics vendor, email provider, SDK, secret, webhook, retry, or idempotency behavior changes.
- UI system:
  - Mature reference surfaces: `/my-library/habits`, `/my-library/goals`, `/my-library/training`, `/my-library/profile`, `MyLibraryHub`, `TodayTabsPanel`, and `SavedWorkoutsPanel`.
  - Keep the change route/top-panel scoped; do not create a broad app-wide page shell/button/card primitive in this slice.
  - Screenshot handoff type: `before/after` for `/my-library/generator` desktop and mobile.
- Testing:
  - Add or update focused tests for route shell/action classes and top generator panel classes.
  - Preserve existing generator feedback, selection, override, generation, save, and selected-workout coverage.
  - Keep session-step shared renderer coverage unchanged; no generated step display contract changes are expected in this slice.

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

N/A with rationale: this slice creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible identifier, alias, redirect, or compatibility mapping. Existing workout IDs, generator labels, route labels, local UI identifiers, and localStorage keys remain stable.

## Forward Compatibility Contract

- Extensibility surfaces touched:
  - route-local `/my-library/generator` shell/header/actions,
  - `GeneratorIntakeHub` top Swim Profile data panel,
  - `SessionGeneratorPanel` top generator settings/action hierarchy.
- Source of truth:
  - Generator source rows remain derived from `buildGeneratorHandoffPayload`, `GeneratorIntakeSnapshot`, and existing `buildSwimProfileDataRows` behavior.
  - Session settings, draft status, workout save readiness, and selected-workout states remain derived from existing generator/workout contracts.
- Additive behavior:
  - new generator source rows that flow through existing snapshot/payload contracts should continue to render in the existing panel structure without route-shell changes.
  - future existing-contract actions should inherit the same token/action visual treatment when added to the same panels.
- Explicit mapping requirements:
  - new AI generation modes, route-level actions, panel-level status categories, action labels, workflow labels, or materially different generator states require deliberate copy/class/test/screenshot updates before release.
  - future Help/Guide or support changes are required only if labels, routes, recovery behavior, or workflow meaning change.
- Unknown or deprecated values:
  - this slice adds no new unknown value path; existing typed generator helpers and feedback behavior continue to own unsupported data states.
  - unknown API payloads must not be interpreted as route-shell success states.
- Test/evidence:
  - focused tests verify route actions, top panel token classes, and existing feedback/action contracts remain stable.
  - screenshot handoff checks desktop/mobile text fit.
  - route/label/support sweep checks `AI swim session generator`, `GeneratorIntakeHub`, `SessionGeneratorPanel`, `My Swim Sessions`, `Back to My Library`, `/my-library/generator`, generator feedback IDs, Help/Guide/support docs, and My Swim Sessions entry fallout.

## Help / Guide Impact

N/A with rationale: this slice changes presentation only. It does not rename routes, labels, workflow actions, Help/Guide content, support recovery behavior, generator storage behavior, or operator instructions.

## Route / Label / Support Surface Sweep

Required because `/my-library/generator`, visible route actions, and top generator labels are touched.

- Identifiers searched:
  - `/my-library/generator`
  - `AI swim session generator`
  - `GeneratorIntakeHub`
  - `SessionGeneratorPanel`
  - `Use Swim Profile data`
  - `Generate session`
  - `My Swim Sessions`
  - `Back to My Library`
  - `generator-intake-draft-recovered`
  - `session-generator-action-error`
  - `session-generator-action-success`
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
  - `app/my-library/generator/page.tsx`,
  - `components/my-library/generator/GeneratorIntakeHub.tsx`,
  - `components/my-library/generator/SessionGeneratorPanel.tsx`,
  - focused tests,
  - this active brief,
  - canonical AW-006 queue,
  - design inventory,
  - screenshot artifacts during implementation.

## Scope

- `app/my-library/generator/page.tsx` route shell/header/action styling.
- `components/my-library/generator/GeneratorIntakeHub.tsx` top Swim Profile data panel/action/chip styling only.
- `components/my-library/generator/SessionGeneratorPanel.tsx` top generator settings/action styling only.
- Focused route/component/e2e/unit assertions where route shell or top panel class contracts change.
- Canonical AW-006 queue and design inventory updates.
- Before/after screenshot handoff artifacts during implementation.

## Out Of Scope

- Generator data model, generator-intake API, session-draft API, workout save/update APIs, Supabase queries, generated database types, migrations, auth, analytics taxonomy, route labels, generation algorithm, generated draft editor behavior, selected workout handling, localStorage keys, My Swim Sessions navigation behavior, Help/Guide updates, support workflow, broad member notice primitive, app-wide design-system primitive, new dependencies, commerce, packages, and merge without explicit owner approval.
- `WorkoutBuilderHub`, `DrylandBuilderHub`, Program Builder, Habits, Goals, My Training, My Swim Profile, and other member shell parity work.
- Merge without explicit owner approval.

## Acceptance Criteria

1. `/my-library/generator` keeps the same auth redirect and server data-loading behavior.
2. `GeneratorIntakeHub` keeps the same snapshot, source selection, override, local draft restore, stale-source warning, and localStorage behavior.
3. `SessionGeneratorPanel` keeps the same generation, save, selected-workout, and generated draft editor behavior.
4. The page shell/header/route actions visually align with My Library token/action hierarchy.
5. The top Swim Profile data and generator settings panels use the current token/card/action direction while preserving labels, controls, and feedback semantics.
6. No generator business logic, data persistence, API routes, analytics, Help/Guide, or support workflow changes are introduced.
7. Focused tests pass and screenshot handoff is captured before broad gates.
8. Canonical AW-006 queue and design inventory record this selected slice without stale active references.
9. Broad PR gates and PR automation start only after owner screenshot approval.

## Validation

Targeted during implementation:

- `./node_modules/.bin/vitest run tests/unit/generator-intake-hub.test.tsx tests/unit/session-generator-panel.test.tsx`
- `npm run typecheck`
- `npm run lint:briefs -- --all`
- `npm run lint:quality-gates`
- `git diff --check`
- `npx playwright test tests/e2e/my-library-generator-intake.spec.ts --project=desktop-chromium`
- Route/label/support sweep:
  - `rg -n "/my-library/generator|AI swim session generator|GeneratorIntakeHub|SessionGeneratorPanel|Use Swim Profile data|Generate session|My Swim Sessions|Back to My Library|generator-intake-draft-recovered|session-generator-action-error|session-generator-action-success" app components tests docs/task-briefs/planned docs/task-briefs/in-progress docs/design docs/runbooks docs/user-flow-map.md`

Visual gate:

- Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
- Capture `before/after` desktop and mobile screenshots for `/my-library/generator`.
- If auth-backed local capture is blocked by local Supabase/dev-login egress, use a temporary local harness that renders the same production route/components with deterministic generator data; remove temporary harness files before validation.
- Record whether any product-rendering file changes after final capture.

After owner screenshot approval:

- `npm run verify:pre-pr` (passed on `2026-05-27 17:06 CEST`; log: `artifacts/test-runs/20260527-165907/verify.log`)
- commit, push, open/update PR
- required CI checks green
- `npm run verify:pre-merge`

## Manual QA / Screenshot Handoff

Required because this changes visible UI/layout.

- Capture type: `before/after`.
- Required viewports:
  - desktop `/my-library/generator`,
  - mobile `/my-library/generator`.
- Artifact folder pattern:
  - `output/aw-006-generator-workspace-token-parity-YYYY-MM-DD-HHMMSS/`
- Expected filenames:
  - `before-generator-workspace-desktop.png`
  - `before-generator-source-open-desktop.png`
  - `after-generator-workspace-desktop.png`
  - `after-generator-source-open-desktop.png`
  - `before-generator-workspace-mobile.png`
  - `after-generator-workspace-mobile.png`

## Checkpoint Log

- `2026-05-27 | in-progress | created active AI Session Generator workspace token/action parity brief from clean main@6b6ccde after owner approved continuing in the same chat; screenshot approval remains the required visual stop before broad PR gates | next: update queue/inventory, implement route/top-panel token parity, and run focused tests`
- `2026-05-27 | in-progress | implemented route/top-panel token parity, added focused route/component tests, captured before/after screenshot artifacts, and confirmed session-step rendering remains on the existing shared renderer contract without active step-display changes | next: get owner screenshot approval before npm run verify:pre-pr`
- `2026-05-27 | validation | focused unit tests, typecheck, brief lint, quality-gate lint, route/label/support sweep, and git diff whitespace check passed; targeted Playwright generator-intake run skipped both tests because local dev-login bypass could not authenticate against the safe local test Supabase placeholder | next: wait for owner screenshot approval, then run npm run verify:pre-pr`
- `2026-05-27 | owner screenshot approval | owner approved screenshot handoff in chat after reviewing `output/aw-006-generator-workspace-token-parity-2026-05-27-160721`; no product-rendering files changed after final capture | next: run npm run verify:pre-pr before PR`
- `2026-05-27 | validation | npm run verify:pre-pr passed full lane after screenshot approval; full Playwright ended 101 passed and 487 skipped due safe local auth/test matrix skips; verification log: artifacts/test-runs/20260527-165907/verify.log | next: commit, push, open PR, and monitor CI`
