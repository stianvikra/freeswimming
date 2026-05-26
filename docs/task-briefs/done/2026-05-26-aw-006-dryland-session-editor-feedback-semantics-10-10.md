# Task Brief: AW-006 Dryland Session Editor Feedback Semantics (10/10)

## Metadata

- `id`: `2026-05-26-aw-006-dryland-session-editor-feedback-semantics-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-26`
- `updated`: `2026-05-26`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-dryland-session-editor-feedback-semantics`
- `execution_mode`: `implement through targeted validation and screenshot handoff; stop before pre-PR gate until owner approves screenshots`

## Brief Audit Record

- `last_audited`: `2026-05-26`
- `base`: `main@557f14a`
- `audit_status`: `ready`
- `decision`: Execute this as the current owner-approved PR-sized AW-006 UI slice through screenshot handoff.
- `reason`: PR `#857` and repo-managed closeout PR `#858` are merged, `main` is clean at `557f14a`, `npm run post-merge:preflight` was reported green with no pending closeout, and a fresh queue/design/code re-audit found `DrylandSessionEditor` still renders editor-local warning/status states outside the established dryland-local `DrylandFeedback` contract while adjacent Dryland/Micro Sessions surfaces already use it.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, dryland session editor markup, `DrylandFeedback`, dryland session or micro-plan APIs, local draft persistence, micro-session update rules, forward compatibility rules, screenshot handoff rules, or verification lanes change before execution.

## Goal

Make Dryland Session Editor warnings and save/update-current guidance use the established dryland-local feedback semantics while preserving dryland session, local draft, and micro-session behavior.

## Pre-Implementation Owner Explanation

Jeg skal rydde feedback i Dryland Session-editoren. Det betyr noe fordi brukeren der tar beslutninger om lagring, treningsokter og narvaerende micro session, men noen lokale varsler bruker fortsatt egen markup mens naboflatene har en etablert `DrylandFeedback`-standard. Utenfor scope er dryland-data, API-er, localStorage, save/delete/update-logikk, micro-session rebuilding, analytics, Help/Guide og supportflyt.

Fremoverkompatibilitet: nye dryland/micro-session-stater skal arve samme feedback-kontrakt via eksisterende komponent der det passer, mens nye workflow-tilstander, release modes eller target types fortsatt krever eksplisitt mapping og test for release.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Data placement and sync boundaries`
- `Reliability and failure handling`
- `Security and authz`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                             | Evidence                                     | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library/dryland/[sessionId]` keeps the same editor job while micro-session impact and save-before-update guidance become easier to scan.                                  | screenshot handoff + focused tests           | `5/5`                   |
| UX flow clarity                               | `target`     | The active-source warning, disabled update-current guidance, and simple-input validation must clearly tell the user what is blocked and what action comes next.                | Testing Library assertions + screenshots     | `5/5`                   |
| Visual design quality                         | `target`     | Changed editor feedback uses the current dryland feedback shell, stable spacing, no nested cards, and no text overflow on mobile/desktop.                                      | before/after screenshots + diff review       | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Save, reset, train-mode, update-current-micro-session, local draft writes, and PATCH payloads remain unchanged.                                                                | targeted unit/e2e tests + payload assertions | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes no admin editor, admin CRUD, publishing workflow, operator queue, or admin action surface.                                                      | explicit admin-editor scope rationale        | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Dynamic warnings/statuses use appropriate `role`, `aria-live`, `data-feedback-tone`, named actions, and do not make static empty content noisy.                                | Testing Library role/aria assertions         | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No dependency, media asset, fetch, polling, heavy client state, or route payload growth beyond existing component markup/classes.                                              | dependency diff + broad gate evidence later  | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical dryland sessions/micro-plans and browser local draft persistence stay unchanged; no new local/server state boundary is introduced.                            | data-boundary review + unchanged payloads    | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this slice changes no route cache mode, fetch cache, revalidation, invalidation trigger, CDN behavior, or stale-data policy.                                       | explicit cache scope rationale               | `N/A`                   |
| Reliability and failure handling              | `target`     | Recoverable validation/update guidance remains visible and does not hide the editor, remove retry paths, or create dead-end disabled actions.                                  | unit tests + visual review                   | `5/5`                   |
| Security and authz                            | `target`     | Existing member route/API auth boundaries remain untouched, and no UI copy exposes protected identifiers or provider diagnostics.                                              | changed-files review + route boundary review | `5/5`                   |
| Privacy and compliance                        | `target`     | Changed copy must not expose user IDs, session IDs beyond existing route context, raw API errors, provider diagnostics, health data beyond visible editor content, or secrets. | copy/error review                            | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this active brief, and notice/state inventory record the approved slice without stale active references.                                               | docs diff + brief lint                       | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow label, mutation, Help/Guide action, operator recovery behavior, or editability path.                                                | explicit admin-workflow scope rationale      | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is an authenticated member tool surface and changes no metadata, sitemap, robots, canonical URL, structured data, or public indexability contract.            | explicit SEO scope rationale                 | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity model, structured data, public semantic content, or AI-facing documentation contract.                                     | explicit AI-discoverability scope rationale  | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this changes no event taxonomy, analytics payload, dashboard, KPI threshold, or event persistence.                                                                 | explicit analytics scope rationale           | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no pricing, checkout, portal, entitlement, product access, subscription, invoice, refund, or revenue workflow.                                        | explicit commerce scope rationale            | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A with scope rationale: this changes no incident alert path, support workflow, operator diagnostic, runbook procedure, support escalation, or on-call flow.                  | explicit support-ops scope rationale         | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement write, or revenue data.        | explicit finance scope rationale             | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: touched English strings stay short, route-local, and layout-safe so future locale work can map dryland-specific copy deliberately.                            | copy/layout review                           | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing `DrylandFeedback`, `DrylandBuilderHub`, `DrylandSessionEditor`, React/TypeScript, and local dryland tests; add no dependency or app-wide primitive.             | changed-files/dependency diff                | `5/5`                   |
| Testing and QA automation                     | `target`     | Add/refresh focused unit coverage, run targeted dryland tests, run brief lint/quality gates, then stop at screenshot handoff before `verify:pre-pr`.                           | test output + screenshot artifacts           | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: shared dryland-local feedback rendering reduces future maintenance and adds no service call, storage, job, polling, or traffic-dependent cost.                | implementation review                        | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert restores prior markup/tests/docs; no migrations, env changes, dependency changes, workflows, provider settings, or feature flags are required.               | git diff + validation evidence               | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep the work inside the existing client-owned dryland member route surface.
  - Reuse `DrylandFeedback` from `components/my-library/dryland/DrylandFeedback.tsx`.
  - Preserve `DrylandBuilderHub` ownership of save/update callbacks and route refresh behavior.
  - No route handler, server action, cache, or revalidation behavior changes.
- TypeScript/domain contracts:
  - Preserve `DrylandSessionDraft`, `DrylandSessionRecord`, `DrylandMicroPlanRecord`, session IDs, exercise/set IDs, and micro-plan source-session references.
  - No parser, validation, target-type, release-mode, or error model changes.
- Supabase/data layer:
  - No migration, RLS/authz, generated type, storage, index, or Supabase query change.
- External services/tools:
  - No Stripe, Supabase provider config, email, analytics, webhook, secret, SDK, retry, or idempotency behavior changes.
- UI system:
  - Reference surface is the already-shipped Dryland/Micro Sessions feedback semantics slice and `DrylandFeedback`.
  - Keep feedback dryland-local; do not promote a shared app-wide member notice primitive in this slice.
  - Screenshot handoff type is `before/after` for `/my-library/dryland/[sessionId]` desktop and mobile editor states.
- Testing:
  - Extend `tests/unit/dryland-builder-hub.test.tsx` for editor-local role/aria/tone semantics and unchanged update-current payload.
  - Run targeted dryland unit tests and any relevant dryland e2e if the changed selectors affect the existing flow.

## Data Placement And Sync Contract

- Server-canonical data:
  - `dryland_sessions` remains canonical for saved dryland sessions.
  - `dryland_micro_plans` remains canonical for active/current micro-session source snapshots and queued-unit rebuilds.
- Local data:
  - Existing browser local draft persistence remains unchanged and best-effort only.
  - This slice introduces no new localStorage/sessionStorage key, cookie, or optimistic server state.
- Sync policy:
  - Existing `onDraftChange`, `onSave`, `onUpdateCurrentMicroPlan`, route refresh, and local draft write behavior remain unchanged.
  - The UI may clarify "save first, then update current micro session"; it must not change when queued units are rebuilt.
- Retention and sensitivity:
  - No new user data, secret, provider diagnostic, or health detail is stored or logged.
- Cache/invalidation:
  - No route/data cache or invalidation behavior changes.

## Identity And Rename Contract

No identity changes. Existing stable IDs for dryland sessions, micro plans, source sessions, exercises, sets, and blocks remain the canonical identifiers. Titles remain human-readable and renameable through existing flows only. This slice adds no slug, alias, redirect, analytics identity, import/export identity, or rename/repurpose rule.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Touched: dryland editor feedback presentation for active-source warnings, save-first guidance, and quick-session validation.
  - Not touched: route params, dryland/micro-plan APIs, storage contracts, release modes, target types, analytics, Help/Guide, or support runbooks.
- Source of truth:
  - Existing dryland session and micro-plan typed records remain the source of truth.
  - Feedback tone is derived from existing UI state (`hasUnsavedChanges`, `isSaving`, `isUpdatingCurrentMicroPlan`, validation issue lists), not hardcoded row IDs.
- Additive behavior:
  - New dryland sessions and current source-session warnings should automatically use the same feedback shell when they flow through `DrylandSessionEditor`.
  - Additional copy inside the same warning/action shape can reuse `DrylandFeedback` without adding a new primitive.
- Explicit mapping requirements:
  - New workflow states, release modes, target types, route actions, analytics events, support procedures, or Help/Guide claims require explicit code/test/docs updates before release.
- Unknown or deprecated values:
  - Unknown dryland/micro-plan values must keep existing safe generic copy, disabled actions, or route-owned warnings; this slice must not infer a success state from unknown payloads.
- Test/evidence:
  - Focused tests cover current warning/status semantics and unchanged update-current/save payload behavior.
  - Route/label/support sweep includes `DrylandFeedback`, `dryland-source-impact-warning`, `Update current micro session`, `Save the Dryland Session first`, and `/my-library/dryland`.

## Help / Guide Impact

N/A with rationale: this changes presentation only for existing dryland editor feedback. It does not rename routes, workflow actions, recovery behavior, Help/Guide content, support procedures, admin instructions, API behavior, or micro-session rebuild rules.

## Route / Label / Support Surface Sweep

Required because member workflow feedback and visible action guidance are touched.

- Identifiers searched:
  - `DrylandFeedback`
  - `dryland-source-impact-warning`
  - `dryland-update-current-micro-session`
  - `Save the Dryland Session first`
  - `Future micro sessions`
  - `Update current micro session`
  - `/my-library/dryland`
  - `Dryland Session Editor`
- Surfaces to check:
  - `components/my-library/dryland/`
  - `tests/unit/`
  - `tests/e2e/`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/design/`
  - `docs/runbooks/`
- Expected fallout:
  - `DrylandSessionEditor` presentation only,
  - focused dryland tests,
  - this active brief,
  - canonical AW-006 queue,
  - notice/state inventory.
  - no API contracts, Help/Guide, support runbook, analytics, storage, Supabase, route, or micro-plan behavior fallout unless implementation discovers a direct contradiction.

## Scope

- `components/my-library/dryland/DrylandFeedback.tsx`
- `components/my-library/dryland/DrylandSessionEditor.tsx`
- `tests/unit/dryland-builder-hub.test.tsx`
- canonical AW-006 queue and notice/state inventory updates
- before/after screenshot handoff artifacts

## Out Of Scope

- Dryland or micro-plan API changes.
- Supabase migrations, RLS, generated DB type, storage, or route handler changes.
- Local draft key, local draft sync behavior, save/delete/reset/update-current payload behavior.
- Micro-session release/completion/skip/undo/bubble/timer logic.
- Workout/program/session data models outside the touched dryland editor presentation.
- Analytics taxonomy, Help/Guide, support procedures, admin workflow, commerce, finance, auth, dependencies, configs, workflows, or broad app-wide feedback primitives.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves screenshots.

## Acceptance Criteria

1. `DrylandSessionEditor` active-source and save-first guidance use the dryland-local feedback contract with correct tone semantics.
2. Static or advisory editor feedback does not announce as an assertive error.
3. Existing `Save`, `Reset`, `Open Train mode`, and `Update current micro session` behavior remains unchanged.
4. Existing dryland session PATCH payload and micro-plan PATCH payload behavior remains unchanged.
5. No dryland API, localStorage, Supabase, analytics, Help/Guide, support, route, or dependency change is introduced.
6. Canonical AW-006 queue and notice/state inventory record this active slice without stale active references.
7. Targeted tests and screenshot handoff evidence are complete.
8. Work stops after screenshot handoff until owner approval.

## Validation

Targeted during implementation:

- `npm run lint:briefs`
- `./node_modules/.bin/vitest run tests/unit/dryland-builder-hub.test.tsx tests/unit/dryland-micro-plan-panel.test.tsx tests/unit/create-manual-dryland-session-button.test.tsx`
- targeted dryland e2e only if selector or flow behavior changes:
  - `npx playwright test tests/e2e/my-library-dryland-builder.spec.ts --project=desktop-chromium`
- `npm run typecheck`
- `npm run lint:quality-gates`
- `git diff --check`
- targeted route/label/support sweep for dryland editor feedback identifiers

Visual gate:

- Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
- Capture representative `before/after` screenshots against `http://127.0.0.1:3000`.
- Required representative screenshots:
  - `before-dryland-session-editor-desktop.png`
  - `after-dryland-session-editor-desktop.png`
  - `before-dryland-session-editor-mobile.png`
  - `after-dryland-session-editor-mobile.png`
- Owner screenshot approval stop: required before `npm run verify:pre-pr`, PR creation, and `npm run verify:pre-merge`.

Broad gates after screenshot approval:

- `npm run verify:pre-pr`
- PR creation/update and CI monitoring
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS/npm available through the repo's normal `nvm use --silent` path.
- For implementation, release-gate commands follow repo escalation-first defaults where applicable.

## Manual QA Environments

Required because this is visible member-route UI work.

- Local environment:
  - `http://127.0.0.1:3000/my-library/dryland/[sessionId]`
- Browser/device matrix:
  - desktop Chromium viewport,
  - mobile Chromium viewport.
- Required states:
  - saved session that feeds the active micro session,
  - unsaved changes that disable update-current guidance,
  - unchanged save/update-current behavior where local fixtures allow it.

## Communication And Execution Mode

- Current mode: active implementation on branch `aw-006-dryland-session-editor-feedback-semantics`.
- Use automation-first delivery within this brief's scope.
- Stop after screenshot handoff until the owner approves screenshots or requests corrections.

## Checkpoint Log

- `2026-05-26 | in-progress | started from clean main@557f14a after Guide Access Required State Parity #857 and closeout #858; owner approved Dryland Session Editor Feedback Semantics and explicitly said implementer stans ved screenshots | next: implement editor-local feedback parity, run targeted validation, capture screenshot handoff, and stop before npm run verify:pre-pr`
- `2026-05-26 | implemented + targeted validation | moved DrylandSessionEditor active-source/update-current and quick-session validation guidance onto DrylandFeedback; adjusted the dryland-local feedback action slot so long actions can wrap on mobile; preserved dryland APIs, save/update-current payloads, local draft behavior, analytics, Help/Guide, support, and route contracts | validation: targeted dryland Vitest PASS (3 files, 39 tests), npm run typecheck PASS, npm run lint:briefs:all PASS, npm run lint:quality-gates PASS, Prettier check PASS, git diff --check PASS | next: screenshot handoff and owner approval stop before npm run verify:pre-pr`
- `2026-05-26 | screenshot-ready | captured before/after desktop and mobile artifacts at output/dryland-session-editor-feedback-2026-05-26-104953; first capture exposed mobile action overflow, fixed by allowing DrylandFeedback actions to shrink/wrap on mobile, then regenerated artifacts again after render-file formatting; temporary /dev/aw006-dryland-session-editor visual fixture and before-worktree were removed after capture, and no scoped product-rendering files changed after the final capture | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-05-26 | pre-pr verified | owner approved screenshots and merge when tests are good; first npm run verify:pre-pr attempt failed on a stale generated .next/dev type file for the removed screenshot fixture, then that untracked cache file was removed and npm run verify:pre-pr passed full lane with artifacts/test-runs/20260526-121406/verify.log | next: commit, push, open PR, monitor CI, run npm run verify:pre-merge before merge`

## Completion Record

- `completed`: `2026-05-26`
- `merged_pr`: `#859`
- `squash_commit`: `d74679d`
- `result`: Closed AW-006 Dryland Session Editor Feedback Semantics by moving the active dryland editor micro-session guidance and quick-session validation warning onto the existing dryland feedback contract, preserving dryland save/update behavior while making warning/status semantics and mobile wrapping consistent.
- `validation`: targeted dryland Vitest PASS (3 files, 39 tests); screenshot handoff PASS at `output/dryland-session-editor-feedback-2026-05-26-104953`; `npm run verify:pre-pr` PASS after removing stale untracked `.next/dev` fixture cache; GitHub PR #859 checks PASS including `verify` 15m18s; `npm run verify:pre-merge` PASS with marker `artifacts/verify-pre-merge/20260526-104543.json`.
- `10/10 claim`: yes - all critical target categories reached `5/5`; UX flow clarity, visual design quality, accessibility, business logic correctness/data integrity, testing, and release readiness are all validated with scoped code reuse, screenshot evidence, targeted tests, full local gates, and green CI.

| Category                                      | Achieved Score | Evidence                                                                                                                                       | Gaps / Notes |
| --------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | Scope stayed on dryland editor feedback semantics and AW-006 queue references were closed out after PR #859.                                   | None.        |
| UX flow clarity                               | `5/5`          | Screenshot handoff and unit coverage verified save-first/update-current guidance stays clear without behavior changes.                         | None.        |
| Visual design quality                         | `5/5`          | Before/after desktop and mobile screenshots verified `DrylandFeedback` parity and mobile action wrapping.                                      | None.        |
| Business logic correctness and data integrity | `5/5`          | Tests preserved dryland session PATCH and active micro-plan PATCH payload behavior; no data/API/local draft changes were introduced.           | None.        |
| Accessibility (a11y)                          | `5/5`          | Unit tests verify `role="status"`, `aria-live="polite"`, and `data-feedback-tone="warning"` on changed warnings.                               | None.        |
| Performance (CWV + payloads)                  | `5/5`          | Presentation-only reuse of existing dryland feedback primitive; `npm run verify:pre-pr` and `npm run verify:pre-merge` performance gates PASS. | None.        |
| Data placement and sync boundaries            | `5/5`          | Brief and tests confirm no server-canonical, localStorage, Supabase, or sync boundary changes.                                                 | None.        |
| Reliability and failure handling              | `5/5`          | Warning and blocked-update states remain deterministic and covered by unit tests plus full verification gates.                                 | None.        |
| Security and authz                            | `5/5`          | No auth, API, Supabase, or protected route behavior changed; full gates and CI stayed green.                                                   | None.        |
| Privacy and compliance                        | `5/5`          | No user data, exports, analytics payloads, consent, or privacy behavior changed.                                                               | None.        |
| Content governance                            | `5/5`          | Notice inventory, canonical queue, and done brief lifecycle were updated for the shipped slice.                                                | None.        |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing `DrylandFeedback`; no new dependency or broad design-system abstraction was added.                                             | None.        |
| Testing and QA automation                     | `5/5`          | Targeted Vitest, `verify:pre-pr`, CI, and `verify:pre-merge` all passed.                                                                       | None.        |
| DevOps and rollback readiness                 | `5/5`          | Single scoped squash merge `d74679d`; rollback is isolated to dryland editor feedback presentation and tests.                                  | None.        |
