# Task Brief: AW-006 Dryland Workspace Token And Action Hierarchy Parity (10/10)

## Metadata

- `id`: `2026-05-27-aw-006-dryland-workspace-token-action-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-27`
- `updated`: `2026-05-27`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-dryland-workspace-token-parity`
- `execution_mode`: `owner-approved implementation through screenshot handoff; stop before broad PR gates until screenshot approval`

## Brief Audit Record

- `last_audited`: `2026-05-27`
- `base`: `main@e16c594`
- `audit_status`: `ready`
- `decision`: Execute this as the current owner-approved PR-sized AW-006 UI slice through screenshot handoff.
- `reason`: PR `#878` and repo-managed closeout PR `#879` are merged, `main` is clean at `e16c594`, `npm run post-merge:preflight` was reported green with no pending closeout, and a fresh queue/design/code re-audit found `/my-library/dryland`, `/my-library/dryland/[sessionId]`, and the top `DrylandBuilderHub` browse/list actions still using older route-local rounded blue/slate/rose styling while adjacent My Library workspaces now use the newer AW-006 token/action hierarchy. The same re-audit found one stale design-inventory reference that still called Habits active after PR `#876/#877`.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/my-library/dryland`, `DrylandBuilderHub`, `DrylandSessionEditor`, `DrylandMicroPlanPanel`, dryland/micro-session API or storage contracts, screenshot handoff rules, forward compatibility rules, or verification lanes change before screenshot handoff.

## Goal

Make the Dryland workspace shell, route actions, create panel, saved-session list/actions, and delete confirmation visually align with the current My Library token/action hierarchy while preserving dryland data, Micro Sessions, API behavior, local drafts, timers, analytics, Help/Guide, and support behavior.

## Pre-Implementation Owner Explanation

For ikke-programmerer: Vi rydder Dryland-skjermene slik at de ser og oppforer seg mer likt resten av My Library. Kort, knapper og handlingsrekkefolge skal bli roligere og enklere a skanne.

Hvorfor det betyr noe: Dryland er en treningsflate brukeren kommer tilbake til. Nar den fortsatt ser eldre ut enn nabosidene, foles produktet mindre helhetlig og mindre ferdig.

Utenfor scope: Vi endrer ikke dryland-data, Micro Sessions, API-er, lagring, lokale drafts, timere, analytics, Help/Guide, supportflyt eller treningslogikk.

Fremoverkompatibilitet: Nye Dryland Sessions skal arve samme kort- og handlingshierarki automatisk. Nye session-kinds, nye workflow-stater eller nye destruktive handlinger krever eksplisitt mapping, test og screenshot-evidence.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                      | Evidence                                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library/dryland` remains the Dryland Sessions browse/create surface, `/my-library/dryland/[sessionId]` remains the editor route, and Micro Sessions focus behavior remains intact. | route/action review + focused tests            | `5/5`                   |
| UX flow clarity                               | `target`     | Create strength/stretching, saved-session Open/Edit/Delete, delete confirmation, and route back actions are easier to scan without changing workflow meaning.                           | screenshot handoff + focused tests             | `5/5`                   |
| Visual design quality                         | `target`     | Dryland route shells and top browse/list panels use My Library token/card/action language with stable spacing and no text overflow on mobile/desktop.                                   | before/after screenshots + diff review         | `5/5`                   |
| Business logic correctness and data integrity | `target`     | No changes to dryland loading, create/save/delete/update-current-micro-session payloads, local drafts, timers, active micro-plan state, or selected-session behavior.                   | changed-files review + targeted tests          | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this private member workspace slice changes no admin editor, CRUD, publish workflow, operator queue, or admin action surface.                                               | explicit admin-editor scope rationale          | `N/A`                   |
| Accessibility (a11y)                          | `target`     | One visible or sr-only page H1 remains per route state; route and dryland actions stay keyboard reachable with accessible names and layout-safe touch targets.                          | Testing Library/e2e assertions + screenshot QA | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency, media asset, API call, polling loop, client state model, or route payload growth beyond markup/class changes.                                                        | dependency diff + pre-PR gate                  | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical dryland sessions/micro plans and local-only draft/timer/UI state boundaries remain unchanged; this slice only changes presentation.                                    | data contract + code review                    | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because existing `dynamic = "force-dynamic"` behavior, server snapshot loading, route refreshes, and mutation invalidation remain unchanged.                                        | changed-files review                           | `N/A`                   |
| Reliability and failure handling              | `target`     | Existing schema/load/action/create/delete/missing-session feedback continues to render deterministically and keeps retry/delete cancellation behavior wired.                            | focused regression tests + diff review         | `5/5`                   |
| Security and authz                            | `target`     | Anonymous Dryland routes still redirect to sign-in with the same `next` target; no protected data moves to a public route or new client boundary.                                       | route/auth review + focused tests              | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data fields, telemetry payloads, legal copy, consent behavior, logs, secrets, or sensitive diagnostics change.                                                      | privacy scope review                           | `N/A`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this active brief, and design inventory record the selected Dryland slice and repair the stale Habits active reference.                                         | docs diff + brief lint                         | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this slice changes no admin workflow label, Help/Guide action, support recovery procedure, operator edit path, or admin mutation.                                           | explicit admin-workflow scope rationale        | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because Dryland routes are authenticated/private and this slice changes no public metadata, sitemap, robots, canonical URL, or indexability contract.                               | private-route SEO rationale                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity model, structured data, public semantic content, or AI-facing documentation contract.                                              | AI-discoverability scope rationale             | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event taxonomy, payload, persistence, dashboard, KPI definition, or consent behavior changes.                                                                  | analytics scope rationale                      | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no Stripe, checkout, catalog, entitlement, portal, invoice, refund, payout, or reporting behavior.                                                       | commerce scope review                          | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A with scope rationale: this changes no incident path, alerting, runbook procedure, support diagnostics, recovery workflow, or support escalation behavior.                           | explicit support-ops scope rationale           | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this changes no billing, reconciliation, finance report, payout, refund, invoice, entitlement, provider financial data, or revenue operation.                 | explicit finance scope rationale               | `N/A`                   |
| i18n operational readiness                    | `target`     | Route-action, create-session, saved-session, and delete-confirmation labels stay concise and layout-safe so later localization is not blocked by tight fixed-width assumptions.         | screenshot text-fit review + focused tests     | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `SiteChrome`, existing Dryland server routes, `DrylandBuilderHub`, `DrylandFeedback`, My Library token/action references, Tailwind, and current tests; add no dependency.         | changed-files/dependency diff                  | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused assertions for Dryland route shell/action classes and top create/list token classes; preserve existing dryland behavior coverage.                                           | test output + screenshot handoff               | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: token/action parity adds no service call, storage, job, polling, or traffic-dependent cost.                                                                            | implementation review                          | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert restores prior markup/tests/docs; no migration, dependency, config, workflow, provider setting, or feature flag rollback is needed.                                   | git diff + validation evidence                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep `/my-library/dryland` and `/my-library/dryland/[sessionId]` as authenticated server routes with `dynamic = "force-dynamic"`.
  - Reuse `SiteChrome` and `DrylandBuilderHub`; do not move dryland data ownership into a new client boundary.
  - Reuse `/my-library/habits`, `/my-library/generator`, `/my-library/training`, `/my-library/profile`, `MyLibraryHub`, and `TodayTabsPanel` token/action direction instead of inventing a new dryland-only visual system.
  - Do not change route redirects, server loaders, API routes, cache behavior, Home/My Routines links, or dryland feedback semantics.
- TypeScript/domain contracts:
  - Preserve dryland library snapshots, session summaries, create/update/delete handlers, local draft helpers, timer behavior, and micro-plan update contracts.
  - Do not change validation, API payloads, session-kind behavior, selected-session behavior, or Micro Sessions state transitions.
- Supabase/data layer:
  - N/A; no migration, RLS/authz rule, generated DB type, storage, index, or data access change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, analytics vendor, email provider, SDK, secret, webhook, retry, or idempotency behavior changes.
- UI system:
  - Mature reference surfaces: `/my-library/habits`, `/my-library/generator`, `/my-library/training`, `/my-library/profile`, `MyLibraryHub`, `TodayTabsPanel`, and `SavedWorkoutsPanel`.
  - Keep the change route/top-panel/list scoped; do not create a broad app-wide page shell/button/card primitive in this slice.
  - Screenshot handoff type: `before/after` for `/my-library/dryland` desktop and mobile, plus editor route if the route shell materially changes.
- Testing:
  - Add or update focused tests for route shell/action classes and top `DrylandBuilderHub` create/list/delete token classes.
  - Preserve existing dryland create/save/delete/micro-session coverage.

## Data Placement And Sync Contract

- Server-canonical data:
  - Dryland sessions, session exercises, micro-plan rows, and active micro-plan state remain owned by the existing authenticated API/Supabase path.
- Local data:
  - Existing local draft, train/build mode UI, timer state, pending delete id, source-selection state, and temporary feedback state remain client-local/transient.
- Sync policy:
  - Mutations continue to use the same create/save/delete/update-current-micro-plan API paths and route refresh behavior; this slice only changes route/list presentation.
- Retention and sensitivity:
  - No new persisted data, storage key, log, event, or sensitive value is introduced.
- Cache/invalidation:
  - No cache mode or invalidation behavior changes.

## Identity And Rename Contract

No identity changes. Existing dryland session IDs remain stable internal identifiers, session titles remain editable display labels, and route params continue to use existing session IDs. This slice adds no alias, redirect, analytics identity, import/export identity, or rename/repurpose rule.

## Forward Compatibility Contract

- Extensibility surfaces touched:
  - Dryland route-local shell/header/back actions,
  - create strength/stretching actions,
  - saved dryland session cards and row actions,
  - delete confirmation styling.
- Source of truth:
  - session rows still derive from the existing dryland library snapshot and `recentSessions`.
  - action visibility still derives from existing route mode, schema readiness, selected session, pending delete, and micro-source selection state.
- Additive behavior:
  - new saved Dryland Sessions returned by existing snapshot fields should continue to inherit the same card/action hierarchy automatically.
  - existing action kinds can reuse the same primary/secondary/destructive visual helpers.
- Explicit mapping requirements:
  - new session kinds, new row action kinds, new destructive workflows, new route-level actions, or materially different micro-session workflow states require deliberate copy/class/test/screenshot updates before release.
  - future Help/Guide or support changes are required only if labels, routes, recovery behavior, or workflow meaning change.
- Unknown or deprecated values:
  - this slice adds no new unknown value path; existing typed dryland helpers and feedback behavior continue to own unsupported data states.
  - unknown API payloads must not be interpreted as route-shell success states.
- Test/evidence:
  - focused tests verify route actions, top create/list token classes, delete confirmation behavior, and existing feedback/action contracts remain stable.
  - screenshot handoff checks desktop/mobile text fit.
  - route/label/support sweep checks Dryland Sessions, Dryland builder, Micro Sessions, Create strength session, Create stretching session, Edit, Open, Delete, Delete session, Back to My Library, `/my-library/dryland`, and `/my-library/dryland/[sessionId]`.

## Help / Guide Impact

N/A with rationale: this slice changes presentation only. It does not rename routes, labels, workflow actions, Help/Guide content, support recovery behavior, dryland storage behavior, micro-session meaning, or operator instructions.

## Route / Label / Support Surface Sweep

Required because `/my-library/dryland`, `/my-library/dryland/[sessionId]`, visible route actions, and top Dryland labels are touched.

- Identifiers searched:
  - `/my-library/dryland`
  - `Dryland Sessions`
  - `Dryland builder`
  - `DrylandBuilderHub`
  - `Micro Sessions`
  - `Create strength session`
  - `Create stretching session`
  - `Back to My Library`
  - `Dryland Sessions`
  - `Delete session`
  - `dryland-builder-hub`
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
  - `app/my-library/dryland/page.tsx`,
  - `app/my-library/dryland/[sessionId]/page.tsx`,
  - `components/my-library/dryland/DrylandBuilderHub.tsx`,
  - focused tests,
  - this active brief,
  - canonical AW-006 queue,
  - design inventory,
  - screenshot artifacts during implementation.

## Scope

- `app/my-library/dryland/page.tsx` route shell/header/back action styling.
- `app/my-library/dryland/[sessionId]/page.tsx` route shell/header/actions styling.
- `components/my-library/dryland/DrylandBuilderHub.tsx` top create panel, saved-session list/actions, and delete confirmation styling only.
- Focused route/component/e2e/unit assertions where route shell or top panel/list class contracts change.
- Canonical AW-006 queue and design inventory updates, including stale Habits active-reference repair.
- Before/after screenshot handoff artifacts during implementation.

## Out Of Scope

- Dryland data model, API routes, Supabase queries, generated database types, migrations, auth, analytics taxonomy, route labels, session-kind business logic, localStorage keys, Micro Sessions behavior, timer behavior, local draft sync behavior, create/save/delete/update-current-micro-session behavior, Help/Guide updates, support workflow, broad member notice primitive, app-wide design-system primitive, new dependencies, commerce, packages, and merge without explicit owner approval.
- `DrylandSessionEditor` internals beyond route-shell/action container impact.
- `DrylandMicroPlanPanel` internals beyond ensuring existing focused mode remains visually coherent.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves screenshots.

## Acceptance Criteria

1. `/my-library/dryland` and `/my-library/dryland/[sessionId]` keep the same auth redirects and server data-loading behavior.
2. `DrylandBuilderHub` keeps the same dryland data, session creation, save/delete, micro-session, local draft, timer, route refresh, and feedback semantics.
3. The Dryland route shell/header/actions visually align with My Library token/action hierarchy.
4. The create panel, saved-session list/actions, and delete confirmation use the current token/card/action direction while preserving labels and behavior.
5. No dryland business logic, data persistence, API routes, analytics, Help/Guide, or support workflow changes are introduced.
6. Focused tests pass and screenshot handoff is captured before broad gates.
7. Canonical AW-006 queue and design inventory record this selected slice without stale active references.
8. Work stops after screenshot handoff until owner approval.

## Validation

Targeted during implementation:

- `./node_modules/.bin/vitest run tests/unit/dryland-builder-hub.test.tsx tests/unit/dryland-pages.test.tsx tests/unit/dryland-routes.test.ts tests/unit/dryland-micro-plan-routes.test.ts` - PASS, 4 files / 35 tests.
- `npm run typecheck` - PASS.
- `npm run lint:briefs:all` - PASS, all 377 checked brief files.
- `npm run lint:quality-gates` - PASS; evidence present for route/label/support sweep, screenshot handoff, owner approval stop, comparison naming, accessibility/responsive evidence, and UI reference surface.
- `git diff --check` - PASS.
- `npx playwright test tests/e2e/my-library-dryland-builder.spec.ts --project=desktop-chromium` - not run before screenshot stop because local auth-backed `/dev/login?next=%2Fmy-library%2Fdryland` returned `500` from the Supabase egress guard; focused route/component/API tests and deterministic screenshot harness cover this slice before owner visual approval.
- Route/label/support sweep:
  - `rg -n "/my-library/dryland|Dryland Sessions|Dryland builder|DrylandBuilderHub|Micro Sessions|Create strength session|Create stretching session|Back to My Library|Delete session|dryland-builder-hub" app components tests docs/task-briefs/planned docs/task-briefs/in-progress docs/design docs/runbooks docs/user-flow-map.md`
  - PASS, expected scoped matches only across dryland routes/components/tests/docs plus known neighboring My Library references.

Visual gate:

- Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
- Capture `before/after` desktop and mobile screenshots for `/my-library/dryland`.
- Capture `/my-library/dryland/[sessionId]` if the editor route shell is materially changed and local deterministic data is available.
- If auth-backed local capture is blocked by local Supabase/dev-login egress, use a temporary local harness that renders the same production route/component with deterministic dryland data; remove temporary harness files before validation.
- Record whether any product-rendering file changes after final capture.
- PASS via deterministic temporary harness because local `/dev/login` hit the Supabase egress guard. Capture route was `/aw006-dryland-harness` in the current branch and a detached `main@e16c594` before-worktree, both using the same Dryland route/component structure with fixed dryland data.
- Screenshot artifacts: `/Users/stianvikra/freeswimming/output/aw006-dryland-workspace-token-parity-2026-05-27-183724/`.
- Temporary harness files were removed after capture and are absent from `git status`; no final product-rendering files changed after the final capture.

After owner screenshot approval:

- `npm run verify:pre-pr`
- commit, push, open/update PR
- required CI checks green
- `npm run verify:pre-merge`

## Manual QA / Screenshot Handoff

Required because this changes visible UI/layout.

- Capture type: `before/after`.
- Required viewports:
  - desktop `/my-library/dryland`,
  - mobile `/my-library/dryland`.
- Artifact folder pattern:
  - `output/aw006-dryland-workspace-token-parity-YYYY-MM-DD-HHMMSS/`
- Expected filenames:
  - `before-dryland-workspace-desktop.png`
  - `after-dryland-workspace-desktop.png`
  - `before-dryland-workspace-mobile.png`
  - `after-dryland-workspace-mobile.png`
- Captured: `2026-05-27 18:37`.
- Artifact folder: `/Users/stianvikra/freeswimming/output/aw006-dryland-workspace-token-parity-2026-05-27-183724/`.
- Known screenshot caveat: mobile full-page captures show the fixed bottom navigation at the viewport position inside the long screenshot artifact; this is a capture artifact of full-page screenshots, not a committed layout change in this slice.

## Checkpoint Log

- `2026-05-27 | in-progress | created active Dryland workspace token/action parity brief from clean main@e16c594 after owner approved execution; screenshot approval remains the required visual stop before broad PR gates | next: update queue/inventory, implement route/top-panel token parity, run focused tests, and capture screenshot handoff`
- `2026-05-27 | screenshot stop | implemented route/top-panel/list/delete token parity, repaired queue/inventory references, captured before/after desktop/mobile screenshot artifacts, removed temporary harness, and reran focused validation green | next: owner reviews screenshot handoff before npm run verify:pre-pr, commit, push, and PR creation`
