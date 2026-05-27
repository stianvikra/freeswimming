# Task Brief: AW-006 My Training Workspace Token And Action Hierarchy Parity (10/10)

## Metadata

- `id`: `2026-05-26-aw-006-my-training-workspace-token-action-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-26`
- `updated`: `2026-05-26`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `branch`: `aw-006-my-training-workspace-token-parity`
- `execution mode`: `end-to-end implementation after owner explicitly said execute`

## Brief Audit Record

- `last_audited`: `2026-05-26`
- `base`: `main@9b61a56`
- `audit_status`: `ready`
- `decision`: Execute this as the current owner-approved PR-sized AW-006 UI slice through screenshot handoff.
- `reason`: PR `#868` and repo-managed closeout PR `#869` are merged, `main` is clean at `9b61a56`, post-merge preflight was reported green with no pending closeout, a fresh queue/design/code re-audit found `/my-library/training` route shell/header/actions still use older rounded blue-card styling while the My Library hub, My Routines, owned item detail, saved list, and guide tracker surfaces now use the newer AW-006 token/action hierarchy, and the owner explicitly said `execute`.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/my-library/training`, `TrainingContextHub`, training-context API/storage contracts, Goals bridge links, My Library token references, screenshot handoff rules, forward compatibility rules, or verification lanes change before implementation.

## Goal

Make the `/my-library/training` workspace shell, header, and route actions visually align with the current My Library token/action hierarchy while preserving Training Context data, API behavior, local drafts, Goals bridge links, feedback semantics, analytics, Help/Guide, and support behavior.

## Pre-Implementation Owner Explanation

Vi rydder den visuelle rammen rundt `My Training`-siden. Det betyr samme kort-, knapp- og avstandsuttrykk som resten av nye `My Library`, slik at brukeren lettere ser hovedinnholdet og støttehandlingene. Utenfor scope er treningsdata, Focus/Notes, Goals-koblinger, lagring, API-er, innlogging, analytics, Help/Guide og supportflyt.

Forward compatibility: selve My Training-innholdet skal fortsatt komme fra eksisterende Training Context-data og `TrainingContextHub`. Nye focus-/note-/goal-verdier skal derfor flyte gjennom eksisterende hub-kontrakt; nye route-actions eller nye workspace-labels krever eksplisitt mapping/test i en senere brief.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                      | Evidence                                     | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library/training` remains the canonical private My Training workspace, reached from Goals/My Library with the same page purpose and destinations.                                  | route/link review + focused tests            | `5/5`                   |
| UX flow clarity                               | `target`     | `Open goals` and `Back to My Library` remain visible, lower-weight route actions while Training Context stays the primary workspace content.                                            | screenshot handoff + e2e assertions          | `5/5`                   |
| Visual design quality                         | `target`     | Route shell/header/actions use My Library token/card/action language with stable spacing, no nested card sprawl, and no text overflow on mobile/desktop.                                | before/after screenshots + diff review       | `5/5`                   |
| Business logic correctness and data integrity | `target`     | No changes to Training Context data loading, focus/note create/update/status payloads, local draft keys, filters, selected-goal prefill, or Goals bridge behavior.                      | changed-files review + targeted tests        | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this private member workspace slice changes no admin editor, CRUD, publish workflow, operator queue, or admin action surface.                                               | explicit admin-editor scope rationale        | `N/A`                   |
| Accessibility (a11y)                          | `target`     | One visible `My Training` H1 remains; route actions stay keyboard reachable with accessible names and touch targets; visual shell changes do not hide existing Training Context states. | e2e/component assertions + screenshot QA     | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency, media asset, API call, polling loop, or client state model; changes stay limited to markup/classes and route-local presentation.                                     | dependency diff + pre-PR gate                | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this visual shell slice introduces no local-only data, server-canonical data, sync trigger, conflict policy, retention rule, or sensitive-data flow.                        | explicit state-boundary review               | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because existing `dynamic = "force-dynamic"` and server snapshot loading remain unchanged; no fetch/cache path or invalidation behavior changes.                                    | changed-files review                         | `N/A`                   |
| Reliability and failure handling              | `target`     | Existing Training Context schema/offline/load/action/empty feedback continues to render through the already-shipped feedback semantics without route-shell interference.                | focused regression tests + diff review       | `5/5`                   |
| Security and authz                            | `target`     | Anonymous `/my-library/training` still redirects to `/auth/sign-in?next=%2Fmy-library%2Ftraining`; no protected data moves to a new client boundary.                                    | existing e2e + route-boundary review         | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data fields, telemetry payloads, legal copy, consent behavior, logs, secrets, or sensitive diagnostics change.                                                      | privacy scope review                         | `N/A`                   |
| Content governance                            | `target`     | Canonical AW-006 queue and this brief record the selected planned slice without stale active-slice references.                                                                          | docs diff + brief lint                       | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this slice changes no admin workflow labels, Help/Guide content, support recovery procedure, or operator edit path.                                                         | support-surface sweep                        | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/training` is authenticated/private and this slice changes no public metadata, sitemap, robots, canonical URL, or crawlable route.                              | private-route SEO rationale                  | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured data, entity model, crawl-safe page, or AI-facing documentation contract changes.                                                    | AI-discoverability scope review              | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event taxonomy, payload, persistence, dashboard, KPI definition, or consent behavior changes.                                                                  | analytics scope rationale                    | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no Stripe, checkout, catalog, entitlement, portal, invoice, refund, payout, or reporting behavior.                                                       | commerce scope review                        | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this slice changes no incident path, alerting, runbook procedure, support diagnostics, recovery workflow, or support escalation behavior.                                   | explicit support-ops scope rationale         | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice changes no billing, reconciliation, finance report, payout, refund, invoice, entitlement, provider financial data, or revenue operation.                         | explicit finance scope rationale             | `N/A`                   |
| i18n operational readiness                    | `target`     | Keep visible route-action labels concise and layout-safe so later localization is not blocked by tight fixed-width assumptions.                                                         | screenshot text-fit review + focused tests   | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `SiteChrome`, existing `/my-library/training` server route, `TrainingContextHub`, My Library token/action references, Tailwind, and current tests; add no dependency.             | changed-files/dependency diff                | `5/5`                   |
| Testing and QA automation                     | `target`     | Update focused e2e/unit assertions where route shell classes/structure matter; pass targeted tests, brief lint, screenshot handoff, pre-PR gate, CI, and pre-merge gate.                | test output + screenshot handoff + gate logs | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: class/markup polish should not add runtime cost and keeps the Training Context content data-driven for future focus/note/goal rows.                                    | changed-files review                         | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Diff is reversible by reverting this branch; no migration, dependency, config, workflow, provider, or feature-flag rollback is needed.                                                  | git diff + PR/CI/pre-merge evidence          | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep `/my-library/training` as the authenticated server route with `dynamic = "force-dynamic"`.
  - Reuse `SiteChrome` and `TrainingContextHub`; do not move Training Context data ownership into a new client boundary.
  - Reuse My Library hub, My Routines, and saved-list token/action direction instead of inventing a new route-specific visual system.
  - Do not change route redirects, server loaders, or cache behavior.
- TypeScript/domain contracts:
  - Preserve `TrainingContextSnapshot`, `TrainingGoalPrefill`, focus/note draft keys, note filters, status labels, and Goals prefill parsing.
  - Do not change validation, API payloads, state transitions, or fallback state builders.
- Supabase/data layer:
  - N/A; no migration, RLS/authz rule, generated DB type, storage, index, or data access change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, analytics vendor, email provider, SDK, secret, webhook, retry, or idempotency behavior changes.
- UI system:
  - Mature reference surfaces: `MyLibraryHub`, `TodayTabsPanel`, `/my-library/item/[slug]`, and `SavedWorkoutsPanel` token/action work.
  - Keep the change route-shell scoped; do not create a broad app-wide page shell/button/card primitive in this slice.
  - Screenshot handoff type: `before/after` for `/my-library/training` desktop and mobile.
- Testing:
  - Update focused tests for route shell/action classes and protected redirect if structure changes.
  - Preserve existing My Training/Goals bridge e2e coverage.

## Data Placement And Sync Contract

N/A with rationale: this is a visual/action hierarchy parity slice. It introduces no new local-only state, server-canonical state, browser storage, sync trigger, conflict resolution, retry policy, retention rule, cache invalidation, or sensitive data handling. Existing Training Context snapshots and local draft keys remain the source of truth.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible identifier, alias, redirect, or compatibility mapping. Existing route and labels remain stable.

## Forward Compatibility Contract

- Extensibility surfaces touched:
  - route-local `/my-library/training` shell/header/actions,
  - explicit route actions `Open goals` and `Back to My Library`,
  - visual containment around `TrainingContextHub`.
- Source of truth:
  - Training Context focus/note/goal content remains derived from `TrainingContextSnapshot` and existing `TrainingContextHub` logic.
  - Goals bridge context remains derived from query parsing and typed `TrainingGoalPrefill`.
- Additive behavior:
  - new focus, note, goal option, or status rows should continue to render inside `TrainingContextHub` without route-shell changes.
  - the shell should remain stable if the hub grows vertically or renders existing feedback states.
- Explicit mapping requirements:
  - new route-level actions, workspace labels, navigation destinations, or materially different Training Context modes require deliberate copy/class/test/screenshot updates before release.
  - future Help/Guide or support changes are required only if labels, routes, recovery behavior, or workflow meaning change.
- Unknown or deprecated values:
  - this slice adds no new unknown value path; existing typed unions and Training Context fallback/error behavior continue to own unsupported data states.
  - unknown API payloads must not be interpreted as route-shell success states.
- Test/evidence:
  - focused tests/e2e assertions verify route actions and auth redirect remain stable.
  - screenshot handoff checks desktop/mobile text fit.
  - route/label/support sweep checks My Training, Open goals, Back to My Library, Goals bridge, and `/my-library/training` fallout.

## Help / Guide Impact

N/A with rationale: this slice changes presentation only. It does not rename routes, labels, workflow actions, Help/Guide content, support recovery behavior, or operator instructions. Existing `docs/runbooks/auth-account-support.md` should remain accurate.

## Route / Label / Support Surface Sweep

Required because `/my-library/training` and visible route actions are touched.

- Identifiers to search:
  - `/my-library/training`
  - `My Training`
  - `TrainingContextHub`
  - `Open goals`
  - `Back to My Library`
  - `training_context_viewed`
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
  - `app/my-library/training/page.tsx`,
  - focused tests if route shell assertions change,
  - this planned brief,
  - canonical AW-006 queue,
  - screenshot artifacts during implementation.

## Scope

- `app/my-library/training/page.tsx` route shell/header/action styling.
- Focused route/e2e/unit assertions where route shell class or protected navigation contracts are changed.
- Canonical AW-006 queue update.
- Before/after screenshot handoff artifacts during implementation.

## Out Of Scope

- `TrainingContextHub` behavior changes unless a tiny class-only wrapper adjustment is required for shell fit.
- Training Context data model, API routes, Supabase, generated database types, migrations, auth, analytics taxonomy, route labels, Goals bridge behavior, note filters/ordering, focus/note status/action taxonomy, Help/Guide updates, broad member notice primitive, app-wide design-system primitive, new dependencies, commerce, packages, and merge without explicit owner approval.

## Acceptance Criteria

1. `/my-library/training` keeps the same auth redirect and server data-loading behavior.
2. `TrainingContextHub` keeps the same snapshot, local draft, filter, selected-goal, focus/note, and feedback semantics.
3. The page shell/header/actions visually align with My Library token/action hierarchy and avoid nested card sprawl.
4. `Open goals` and `Back to My Library` remain accessible links with the same destinations.
5. No Training Context business logic, data persistence, API routes, analytics, Help/Guide, or support workflow changes are introduced.
6. Focused tests pass and screenshot handoff is captured before broad gates.
7. Canonical AW-006 queue records this selected planned slice without stale active references.

## Validation

Targeted during implementation:

- `./node_modules/.bin/vitest run tests/unit/my-training-page.test.tsx tests/unit/training-context-hub.test.tsx` - PASS
- `npm run typecheck` - PASS
- `npm run lint:briefs -- --all` - PASS
- `git diff --check` - PASS
- `env PW_PORT=3100 NEXT_DIST_DIR=.next-playwright SITE_LOCK_ENABLED=0 npx playwright test tests/e2e/my-library-training-context.spec.ts --project=desktop-chromium` - completed with 4 skipped because local dev auth bypass could not sign in against the configured Supabase endpoint (`Unexpected token '<'` HTML response); route shell assertions remain added for CI/dev environments with working dev auth.
- Route/label/support sweep:
  - `rg -n "/my-library/training|My Training|Open goals|Back to My Library|training_context_viewed|training-context-hub|my-training-route-actions|my-training-workspace" app components tests docs`
  - Identifiers searched: `/my-library/training`, `My Training`, `Open goals`, `Back to My Library`, `training_context_viewed`, `training-context-hub`, `my-training-route-actions`, and `my-training-workspace`.
  - Surfaces checked: `app/`, `components/`, `tests/`, `docs/`, active/planned/done task briefs, support runbooks, and Help/Guide-adjacent documentation references surfaced by the targeted search.
  - Result: expected references in `/my-library/training`, Goals bridge links, existing support/docs route-retention notes, focused tests, and active AW-006 docs only; no Help/Guide, support, route, or analytics fallout requiring copy/contract changes in this slice.

Visual gate:

- Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
- Capture `before/after` screenshots for `/my-library/training` desktop and mobile against `http://127.0.0.1:3000`.
- Stop for owner screenshot approval before `npm run verify:pre-pr`, PR creation, and `npm run verify:pre-merge`.

After owner screenshot approval:

- `npm run verify:pre-pr`
- open/update PR
- required CI checks green
- `npm run verify:pre-merge`

## Manual QA / Screenshot Handoff

Required because this changes visible UI/layout.

- Capture type: `before/after`.
- Required viewports:
  - desktop `/my-library/training`,
  - mobile `/my-library/training`.
- Artifact folder pattern:
  - `test-results/aw006-my-training-token-parity-YYYY-MM-DD-HHMMSS/`
- Stop after screenshot handoff for owner approval before `npm run verify:pre-pr`.

## Checkpoint Log

- `2026-05-26 | planned | created after owner approved My Training Workspace Token And Action Hierarchy Parity from clean main@9b61a56 after Guide Tracker Action Shell Token Parity #868 and repo-managed closeout #869; scope is limited to /my-library/training route shell/header/action visual parity, focused tests, queue docs, and screenshot-reviewed UI parity; no runtime code has been changed yet | next: wait for explicit execute/build/implement instruction before moving this brief to in-progress`
- `2026-05-26 | in-progress | owner explicitly said execute; moved work to branch aw-006-my-training-workspace-token-parity and moved this brief to in-progress | next: implement route-shell token/action parity, run targeted validation, and capture screenshot handoff before broad gates`
- `2026-05-26 | implemented + targeted validation | aligned /my-library/training route shell/header/actions with My Library token/action hierarchy, added route-shell unit coverage and e2e assertions, preserved TrainingContextHub/data/API/local draft/Goals bridge/analytics behavior, updated canonical AW-006 queue, and passed targeted Vitest, typecheck, lint:briefs -- --all, git diff --check, and route/label/support sweep; targeted Playwright completed with all 4 tests skipped because local dev auth bypass could not sign in against the configured Supabase endpoint | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-05-26 | screenshot handoff ready | captured before/after desktop and mobile screenshots in test-results/aw006-my-training-token-parity-2026-05-26-214718 using the real /my-library/training route, a temporary main@9b61a56 worktree for before, and local Supabase mock responses to avoid real user data; temporary capture script, worktree, and build output were removed after capture; no product-rendering files changed after capture | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-05-26 | screenshot approved | owner approved the before/after screenshot handoff for /my-library/training token/action hierarchy parity | next: run npm run verify:pre-pr before PR creation`
- `2026-05-26 | pre-pr verified | npm run verify:pre-pr passed on full lane after route/label/support evidence wording was tightened; full unit suite, build, perf budgets, and Playwright completed with 101 passed and 487 environment skips caused by unavailable local dev auth/Supabase-backed flows | next: commit, push, open PR, and monitor CI`
