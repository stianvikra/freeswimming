# Task Brief: AW-006 Goals Workspace Token And Action Hierarchy Parity (10/10)

## Metadata

- `id`: `2026-05-27-aw-006-goals-workspace-token-action-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-27`
- `updated`: `2026-05-27`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-goals-workspace-token-parity`
- `execution_mode`: `owner-approved implementation through screenshot handoff; stop before broad PR gates until screenshot approval`

## Brief Audit Record

- `last_audited`: `2026-05-27`
- `base`: `main@40e2e20`
- `audit_status`: `ready`
- `decision`: Execute this as the current owner-approved PR-sized AW-006 UI slice through screenshot handoff.
- `reason`: PR `#872` and repo-managed closeout PR `#873` are merged, `main` is clean at `40e2e20`, `npm run post-merge:preflight` was reported green with no pending closeout, and a fresh queue/design/code re-audit found `/my-library/goals` route shell/header/back action plus the `GoalsHub` top `Your goals` panel still using older local rounded-card/action/filter styling while `/my-library/training`, `/my-library/profile`, My Library hub, My Routines, owned item detail, and saved sessions now use the newer AW-006 token/action hierarchy.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/my-library/goals`, `GoalsHub`, goals API/storage contracts, goal templates/status contracts, My Training bridge links, screenshot handoff rules, forward compatibility rules, or verification lanes change before screenshot handoff.

## Goal

Make the `/my-library/goals` workspace shell, header, route action, and top goals control panel visually align with the current My Library token/action hierarchy while preserving goal data, API behavior, filters, active-limit logic, templates, My Training bridge links, analytics, Help/Guide, and support behavior.

## Pre-Implementation Owner Explanation

Vi rydder `Goals`-siden slik at toppen av siden, tilbake-knappen og det overste `Your goals`-omradet ser ut som de nyere My Library-sidene. Det betyr noe fordi Goals er en viktig medlemsside, og den skal oppleves som en del av samme produkt som My Training og My Swim Profile.

Utenfor scope er maal-data, API-er, lagring, filtrering, grensen for aktive maal, templates, create/log/archive/restore-handlinger, koblinger til My Training, analytics, Help/Guide, supportflyt og bred design-system-refaktor.

Fremoverkompatibilitet: siden skal fortsatt bruke eksisterende `GoalView`, `GOAL_TEMPLATES` og `GOALS_ACTIVE_LIMIT`. Nye goal-typer, statuser eller route-actions krever eksplisitt mapping, copy, test og screenshot-evidence for de skal fa ny spesialvisning.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                        | Evidence                                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library/goals` remains the private Goals workspace reached from My Library, with the same purpose, title, and back destination.                                      | route/action review + focused tests            | `5/5`                   |
| UX flow clarity                               | `target`     | The Goals header, `Back to My Library`, `Your goals` summary, add-goal action, and filters are easier to scan without changing goal workflows.                            | screenshot handoff + focused tests             | `5/5`                   |
| Visual design quality                         | `target`     | Route shell/header/actions and top goals panel use My Library token/card/action language with stable spacing and no text overflow on mobile/desktop.                      | before/after screenshots + diff review         | `5/5`                   |
| Business logic correctness and data integrity | `target`     | No changes to goal loading, create/log/archive/restore/reset payloads, filters, active-limit logic, templates, bridge links, or status/count derivation.                  | changed-files review + targeted tests          | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this private member workspace slice changes no admin editor, CRUD, publish workflow, operator queue, or admin action surface.                                 | explicit admin-editor scope rationale          | `N/A`                   |
| Accessibility (a11y)                          | `target`     | One visible `Goals` H1 remains; route and goals actions stay keyboard reachable with accessible names, aria-pressed filters, and layout-safe touch targets.               | Testing Library/e2e assertions + screenshot QA | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency, media asset, API call, polling loop, client state model, or route payload growth beyond markup/class changes.                                          | dependency diff + pre-PR gate                  | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this visual shell/control-panel slice introduces no local-only data, server-canonical data, sync trigger, conflict policy, retention, or sensitive-data flow. | explicit state-boundary review                 | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because existing `dynamic = "force-dynamic"` behavior and goals server loading remain unchanged; no fetch/cache path changes.                                         | changed-files review                           | `N/A`                   |
| Reliability and failure handling              | `target`     | Existing goals offline, action-error, action-success, first-run empty, and filtered no-results states continue to render without shell interference.                      | focused regression tests + diff review         | `5/5`                   |
| Security and authz                            | `target`     | Anonymous `/my-library/goals` still redirects to `/auth/sign-in?next=%2Fmy-library%2Fgoals`; no protected data moves to a new client boundary.                            | focused route test + review                    | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data fields, telemetry payloads, legal copy, consent behavior, logs, secrets, or sensitive diagnostics change.                                        | privacy scope review                           | `N/A`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this active brief, and design inventory record the selected slice without stale active-slice references.                                          | docs diff + brief lint                         | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this slice changes no admin workflow label, Help/Guide action, support recovery procedure, operator edit path, or admin mutation.                             | explicit admin-workflow scope rationale        | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/goals` is authenticated/private and this slice changes no public metadata, sitemap, robots, canonical URL, or indexability contract.             | private-route SEO rationale                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity model, structured data, public semantic content, or AI-facing documentation contract.                                | AI-discoverability scope rationale             | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event taxonomy, payload, persistence, dashboard, KPI definition, or consent behavior changes.                                                    | analytics scope rationale                      | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no Stripe, checkout, catalog, entitlement, portal, invoice, refund, payout, or reporting behavior.                                         | commerce scope review                          | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A with scope rationale: this changes no incident path, alerting, runbook procedure, support diagnostics, recovery workflow, or support escalation behavior.             | explicit support-ops scope rationale           | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this changes no billing, reconciliation, finance report, payout, refund, invoice, entitlement, provider financial data, or revenue operation.   | explicit finance scope rationale               | `N/A`                   |
| i18n operational readiness                    | `target`     | Route-action, summary, add-goal, and filter labels stay concise and layout-safe so later localization is not blocked by tight fixed-width assumptions.                    | screenshot text-fit review + focused tests     | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `SiteChrome`, existing `/my-library/goals` server route, `GoalsHub`, My Library token/action references, Tailwind, and current tests; add no dependency.            | changed-files/dependency diff                  | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused assertions for Goals route shell/action classes and top panel token classes; preserve existing goals feedback/action coverage.                                | test output + screenshot handoff               | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: token/action parity adds no service call, storage, job, polling, or traffic-dependent cost.                                                              | implementation review                          | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert restores prior markup/tests/docs; no migration, dependency, config, workflow, provider setting, or feature flag rollback is needed.                     | git diff + validation evidence                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep `/my-library/goals` as the authenticated server route with `dynamic = "force-dynamic"`.
  - Reuse `SiteChrome` and `GoalsHub`; do not move goals data ownership into a new client boundary.
  - Reuse `/my-library/training`, `/my-library/profile`, My Library hub, owned item detail, saved-list, and My Routines token/action direction instead of inventing a new route-specific visual system.
  - Do not change route redirects, server loaders, API routes, cache behavior, templates, or filter behavior.
- TypeScript/domain contracts:
  - Preserve `GoalView`, `GOAL_TEMPLATES`, `GOALS_ACTIVE_LIMIT`, status/filter unions, payload builders, action handlers, and My Training bridge links.
  - Do not change validation, API payloads, create/log/archive/restore/reset behavior, or goals feedback semantics.
- Supabase/data layer:
  - N/A; no migration, RLS/authz rule, generated DB type, storage, index, or data access change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, analytics vendor, email provider, SDK, secret, webhook, retry, or idempotency behavior changes.
- UI system:
  - Mature reference surfaces: `/my-library/training`, `/my-library/profile`, `MyLibraryHub`, `TodayTabsPanel`, owned item detail, and saved-list token/action work.
  - Keep the change route/top-panel scoped; do not create a broad app-wide page shell/button/card primitive in this slice.
  - Screenshot handoff type: `before/after` for `/my-library/goals` desktop and mobile.
- Testing:
  - Add or update focused tests for route shell/action classes and top `GoalsHub` panel classes.
  - Preserve existing goals feedback, filter, create, and My Training bridge coverage.

## Data Placement And Sync Contract

N/A with rationale: this is a visual/action hierarchy parity slice. It introduces no new local-only data, server-canonical data, browser storage, sync trigger, conflict resolution, retry policy, retention rule, cache invalidation, or sensitive data handling. Existing goal rows, templates, active-limit logic, and local component state remain the source of truth.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible identifier, alias, redirect, or compatibility mapping. Existing goal IDs, titles, status labels, template IDs, and route labels remain stable.

## Forward Compatibility Contract

- Extensibility surfaces touched:
  - route-local `/my-library/goals` shell/header/back action,
  - `GoalsHub` top `Your goals` panel,
  - goals action/filter visual hierarchy.
- Source of truth:
  - Goal content remains derived from `loadGoalViews`, `GoalView`, `GOAL_TEMPLATES`, and `GOALS_ACTIVE_LIMIT`.
  - Filter counts remain derived from the rendered goals array.
- Additive behavior:
  - new goals returned by existing `GoalView` fields should continue to render in the existing list and counts without route-shell changes.
  - future goal templates should continue to flow through the existing template array.
- Explicit mapping requirements:
  - new goal types, status tones, filters, route-level actions, workspace labels, or materially different goal modes require deliberate copy/class/test/screenshot updates before release.
  - future Help/Guide or support changes are required only if labels, routes, recovery behavior, or workflow meaning change.
- Unknown or deprecated values:
  - this slice adds no new unknown value path; existing typed goals helpers and feedback behavior continue to own unsupported data states.
  - unknown API payloads must not be interpreted as route-shell success states.
- Test/evidence:
  - focused tests verify route actions, auth redirect, top panel token classes, and existing feedback/filter contracts remain stable.
  - screenshot handoff checks desktop/mobile text fit.
  - route/label/support sweep checks Goals, Your goals, Add goal, Back to My Library, `/my-library/goals`, and My Training bridge fallout.

## Help / Guide Impact

N/A with rationale: this slice changes presentation only. It does not rename routes, labels, workflow actions, Help/Guide content, support recovery behavior, goals storage behavior, or operator instructions.

## Route / Label / Support Surface Sweep

Required because `/my-library/goals`, visible route actions, and top goals labels are touched.

- Identifiers searched:
  - `/my-library/goals`
  - `Goals`
  - `GoalsHub`
  - `Your goals`
  - `Add goal`
  - `Back to My Library`
  - `goal-use-focus`
  - `goal-use-note`
- Surfaces checked:
  - `app/`
  - `components/`
  - `tests/`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/design/`
  - `docs/runbooks/`
- Expected fallout:
  - `app/my-library/goals/page.tsx`,
  - `components/my-library/goals/GoalsHub.tsx`,
  - focused tests,
  - this active brief,
  - canonical AW-006 queue,
  - design inventory,
  - screenshot artifacts during implementation.

## Scope

- `app/my-library/goals/page.tsx` route shell/header/back action styling.
- `components/my-library/goals/GoalsHub.tsx` top `Your goals` panel/add action/filter styling only.
- Focused route/component/e2e/unit assertions where route shell or top panel class contracts change.
- Canonical AW-006 queue and design inventory updates.
- Before/after screenshot handoff artifacts during implementation.

## Out Of Scope

- Goal data model, API routes, Supabase queries, generated database types, migrations, auth, analytics taxonomy, route labels, goal filters, active-limit logic, templates, My Training bridge behavior, create/log/archive/restore/reset behavior, Help/Guide updates, support workflow, broad member notice primitive, app-wide design-system primitive, new dependencies, commerce, packages, and merge without explicit owner approval.
- `HabitPerfectDayHub`, `GeneratorIntakeHub`, `WorkoutBuilderHub`, `DrylandBuilderHub`, Program Builder, and other member shell parity work.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves screenshots.

## Acceptance Criteria

1. `/my-library/goals` keeps the same auth redirect and server data-loading behavior.
2. `GoalsHub` keeps the same goals, templates, filters, active-limit logic, My Training bridge links, action handlers, and feedback semantics.
3. The page shell/header/back action visually align with My Library token/action hierarchy.
4. The top `Your goals` panel uses the current token/card/action direction while preserving counts, add-goal toggle, and filter behavior.
5. No goals business logic, data persistence, API routes, analytics, Help/Guide, or support workflow changes are introduced.
6. Focused tests pass and screenshot handoff is captured before broad gates.
7. Canonical AW-006 queue and design inventory record this selected slice without stale active references.
8. Work stops after screenshot handoff until owner approval.

## Validation

Targeted during implementation:

- `./node_modules/.bin/vitest run tests/unit/goals-page.test.tsx tests/unit/goals-hub.test.tsx` - PASS, 2 files / 11 tests.
- `env PW_PORT=3100 NEXT_DIST_DIR=.next-playwright SITE_LOCK_ENABLED=0 npx playwright test tests/e2e/my-library-training-context.spec.ts --project=desktop-chromium` - completed with 4 expected environment skips because local dev auth bypass could not sign in against the configured Supabase endpoint; no deterministic product failure was observed.
- `npm run typecheck` - PASS.
- `npm run lint:quality-gates` - PASS.
- `npm run lint:briefs -- --all` - PASS.
- `git diff --check` - PASS.
- Route/label/support sweep for the identifiers listed above - PASS; expected references only in Goals route/component/tests, My Training bridge tests/code, this active brief, canonical AW-006 queue, design inventory, and existing support runbooks. No Help/Guide, support, API, or analytics fallout found.
- `npm run verify:pre-pr` - PASS full lane on `aw-006-goals-workspace-token-parity` containing `origin/main@40e2e20`; lint/typecheck/unit/build/perf budgets passed, Playwright completed with 101 passed / 487 skipped due local auth/dev-login environment skips.

Visual gate:

- Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
- Captured `before/after` desktop and mobile screenshots using a temporary local harness with deterministic Goals data because local auth-backed capture was blocked by Supabase/dev-login egress.
- Temporary capture route/script and before-worktree were removed after capture; no committed product-rendering file changed after final capture.
- Screenshot metadata recorded 0 px horizontal overflow on desktop and mobile.
- Owner approved the screenshot handoff in chat on `2026-05-27`, allowing `npm run verify:pre-pr`, PR creation, and `npm run verify:pre-merge` to proceed.

## Manual QA / Screenshot Handoff

Required because this changes visible UI/layout.

- Capture type: `before/after`.
- Required viewports:
  - desktop `/my-library/goals`,
  - mobile `/my-library/goals`.
- Artifact folder pattern:
  - `output/aw006-goals-workspace-token-parity-YYYY-MM-DD-HHMMSS/`
- Captured artifact folder:
  - `output/aw006-goals-workspace-token-parity-2026-05-27-103655/`
- Captured:
  - `2026-05-27 10:39` Europe/Oslo.
- Screenshot filenames:
  - `before-goals-desktop.png`
  - `after-goals-desktop.png`
  - `before-goals-mobile.png`
  - `after-goals-mobile.png`

## Checkpoint Log

- `2026-05-27 | in-progress | created active Goals workspace token/action parity brief from clean main@40e2e20 after owner approved end-to-end execution; screenshot approval remains the required visual stop before broad PR gates | next: implement route/top-panel token parity and focused tests`
- `2026-05-27 | screenshot handoff ready | route/top-panel token parity implementation and targeted validation are complete; before/after desktop and mobile screenshots are captured with 0 px horizontal overflow | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-05-27 | screenshot approved | owner approved the screenshot handoff in chat; no committed product-rendering files changed after capture | next: run npm run verify:pre-pr`
- `2026-05-27 | pre-pr verified | npm run verify:pre-pr passed the full lane on branch current with origin/main@40e2e20 | next: commit, push, and open PR`
