# Task Brief: AW-006 Micro Sessions Mobile Linked-Habit Polish (10/10)

## Metadata

- `id`: `2026-06-08-aw-006-micro-sessions-mobile-linked-habit-polish-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-08`
- `updated`: `2026-06-08`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `execution_mode`: `end-to-end implementation until screenshot approval stop`
- `branch`: `aw-006-micro-sessions-mobile-polish`
- `resolved_findings`: `H-048`, `H-049`, `H-050`, `H-051`, `H-052`
- `deferred_findings`: `H-053`, `H-054`, `H-055` later resolved by `docs/task-briefs/done/2026-06-08-aw-006-habits-status-sound-and-fixed-motivation-10-10.md`
- `return_checkpoint`: update the parent before this child is closeout-ready.
- `next_return_target`: return to the Habits parent, then execute fixed-period Motivation stats only after Child P is merged/closed.

## Brief Audit Record

- `last_audited`: `2026-06-08`
- `base`: clean synced `main@235c753d`
- `audit_status`: `ready`
- `decision`: Execute a bounded visual/UX polish slice for Micro Sessions mobile and linked-Habit surfaces before changing Motivation stats logic.
- `reason`: Owner supplied linked-Habit, bubble ordering, Admin notes/completed spacing, and old-button-style findings after PR `#1019/#1020`; code audit found these are mostly in `DrylandMicroPlanPanel`, `DrylandBuilderHub`, and `HabitPerfectDayHub`, while Motivation stats live in separate Habits domain helpers.
- `must_refresh_before_execution_if`: Refresh if `/my-library/dryland`, `/my-library/habits`, `DrylandMicroPlanPanel`, `DrylandBuilderHub`, `HabitPerfectDayHub`, Micro Sessions linkage fields, Habits check-in provenance, SiteChrome/Admin notes spacing, screenshot handoff rules, scorecard categories, route/label/support sweep rules, or verification lanes change before PR handoff.

## Goal

Make the mobile Micro Sessions and linked-Habit loop scan-first, with Micro Sessions as the completion source and Habits as derived progress/status.

## Pre-Implementation Owner Explanation

Vi rydder Micro Sessions/Habit-flyten på mobil. Micro Sessions skal være stedet brukeren trykker bubbles og fullfører øvelser, mens den tilknyttede Habiten bare viser status/progress og peker tilbake til Micro Sessions.

Hvorfor det betyr noe: brukeren skal ikke lure på om samme ting må fullføres to steder. På mobil skal bubbles være først og lettest å bruke.

Utenfor scope er nye datafelter, stats-perioder, slips-logikk, reminders, grafer, eksport, varsler og større redesign.

Fremoverkompatibilitet: nye Micro Session-kilder og habit-linkage-stater skal bruke typed provenance/linkage-data; ukjente stater skal ikke vise manuell habit-completion eller telle positivt uten eksplisitt mapping.

## Product Decisions

- Micro-session-backed Habits are progress reflections, not separate manual tasks.
- The Habits card must not expose `Mark done` / `Undo complete` for a Habit whose selected-date completion source is Micro Sessions.
- The card may show a progress/status module and a `Go to Micro Sessions` CTA to `/my-library/dryland?micro=active&view=auto`.
- Micro Sessions bubbles should remain the first mobile interaction when a plan is active.
- Linked Habit status belongs below the bubbles/active units and above completed/skipped history.
- `Build a micro session` actions should use the same current token/action system as adjacent Dryland/Habits surfaces.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim: Product goals and IA, UX flow clarity, Visual design quality, Accessibility (a11y), Data placement and sync boundaries, Stack-fit and dependency discipline, Testing and QA automation.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                             | Evidence                                         | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | Micro Sessions are the primary completion surface and linked Habits read as derived progress/status.                                                                           | component behavior + screenshots                 | `5/5`                   |
| UX flow clarity                               | `target`     | Pass when mobile users see bubbles before linked-Habit context, Habits links to Micro Sessions, and no duplicate manual completion appears for micro-backed Habits.            | component tests + screenshot handoff             | `5/5`                   |
| Visual design quality                         | `target`     | Pass when changed buttons/cards match current `fs-*` action/card rhythm, spacing matches Habits mobile, and screenshots show no overlap or outdated gradient hierarchy.        | responsive screenshot handoff                    | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Pass when no persistence or completion math changes; source-kind/provenance only gates UI affordances.                                                                         | diff review + tests                              | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor, publish workflow, operator content editing, or admin CRUD surface.                                                                   | admin-editor scope rationale                     | `N/A`                   |
| Accessibility (a11y)                          | `target`     | CTA/buttons keep accessible names, focus states, progressbar semantics, and keyboard usability.                                                                                | component tests + markup review                  | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no new dependency or heavy client payload; changed private routes must stay within existing route budget.                                                     | package diff + build/pre-PR gate                 | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical plan/Habit/check-in data remains unchanged; UI derives micro-backed state from typed source/provenance/linkage values; local state remains presentation only. | data contract + diff review                      | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Existing route refresh/no-store behavior remains unchanged.                                                                                                                    | unchanged route/API diff review                  | `4/5`                   |
| Reliability and failure handling              | `target`     | Unknown source/linkage state fails closed by not hiding normal controls unless Micro Session provenance is known.                                                              | tests + fallback review                          | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no protected API or auth boundary changes; all existing owner-scoped writes stay untouched.                                                                   | API diff review                                  | `4/5`                   |
| Privacy and compliance                        | `target`     | No private habit/session titles enter new logs or analytics; no secrets or external assets are added.                                                                          | code review                                      | `5/5`                   |
| Content governance                            | `target`     | Parent, child, queue, design inventory, and support docs agree on shipped UI behavior and deferred stats work.                                                                 | docs diff + brief lint                           | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting because contextual Admin notes spacing may be affected, but no admin workflow label/action changes.                                                                 | route/spacing sweep                              | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this affects authenticated My Library surfaces only and changes no public metadata, sitemap, robots, canonical URL, or structured data.                            | SEO scope rationale                              | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity, structured data, public docs surface, or public semantic content.                                                        | AI scope rationale                               | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Existing analytics, if any, stay title-free and unchanged; no new event taxonomy in this slice.                                                                                | analytics diff or no-new-event rationale         | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no Stripe, checkout, entitlement, billing portal, refund, invoice, payout, or revenue flow.                                                           | commerce scope rationale                         | `N/A`                   |
| Incident response and support operations      | `target`     | Support docs/flow map explain that micro-backed Habits auto-complete from Micro Sessions and route users to bubbles.                                                           | support/user-flow docs or explicit N/A sweep     | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: no finance provider data, billing records, reports, payouts, entitlements, or reconciliation surfaces change.                                        | finance scope rationale                          | `N/A`                   |
| i18n operational readiness                    | `target`     | New labels avoid fixed-width assumptions and fit mobile for longer localized strings.                                                                                          | responsive screenshots + component tests         | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Dryland/Micro/Habits components, typed helpers, route boundaries, UI tokens, and tests; add no dependency.                                                      | code/package diff                                | `5/5`                   |
| Testing and QA automation                     | `target`     | Component/unit tests cover reordered linked-Habit UI, micro-backed Habit CTA/no manual completion, and action styling contract; screenshot handoff is captured.                | targeted tests + screenshot artifacts            | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | No new storage/events; UI reads existing source/linkage values.                                                                                                                | diff review                                      | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Runtime/UI-only rollback is normal git revert; no migration or external service rollback needed.                                                                               | pre-PR/pre-merge gates after screenshot approval | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces: `DrylandMicroPlanPanel` for bubbles/progress, `DrylandBuilderHub` for Dryland route actions, and `HabitPerfectDayHub` for Habits card actions.
  - Preserve App Router route boundaries and private route redirects.
  - Do not add new API routes or change cache behavior.
- TypeScript/domain contracts:
  - Use `HabitCheckInView.sourceKind === "micro_session"` and Micro Session linkage fields as typed signals.
  - Unknown source/linkage values fail closed and do not remove normal Habit controls unless explicitly recognized.
- Supabase/data layer:
  - N/A: no schema, RLS, migration, generated DB type, or storage changes.
- External services/tools:
  - No new SDKs, notifications, analytics vendors, sound assets, or secrets.
- UI system:
  - Reuse `fs-library-card`, `fs-cta-*`, existing progressbar semantics, and lucide icons.
  - Screenshot handoff type: `after/reference` where practical against Habits/Dryland mobile rhythm, otherwise `after` changed-surface screenshots.
- Testing:
  - Update `tests/unit/dryland-micro-plan-panel.test.tsx` and `tests/unit/habit-perfect-day-hub.test.tsx` for changed UI contracts.

## Data Placement And Sync Contract

- Server-canonical data:
  - Micro Session plan/linkage status/progress and Habit check-ins remain server-canonical.
  - Habit completion source/provenance remains the existing check-in source fields.
- Local data:
  - Expanded panels, transient notices, bubble timers, and local sound preference remain local-only.
- Sync policy:
  - No changed mutation semantics.
  - UI updates after existing Micro Session/Habit writes still use existing returned snapshots/route refresh.
- Retention and sensitivity:
  - No retention changes; private titles stay private and are not added to logs.
- Cache/invalidation:
  - No cache/invalidation changes.

## Identity And Rename Contract

- Canonical stable IDs:
  - `dryland_micro_plans.id`, `habit_definitions.id`, and existing check-in provenance IDs remain identity.
- Human-readable identifiers:
  - Micro Session and Habit titles remain editable display text and are not used as linkage keys.
- Mutability:
  - Renaming a Micro Session/Habit must not change whether the UI detects Micro Session provenance.
- Compatibility:
  - Legacy/manual Habit check-ins keep normal Habits controls.
  - Unknown source kinds do not count as micro-backed UI state.
- Observability:
  - No new logging; support diagnosis relies on existing plan ID, habit ID, source kind, and visible route state.

## Forward Compatibility Contract

- Additive behavior:
  - Future Micro Session-backed Habits that write `sourceKind: "micro_session"` inherit the no-manual-completion UI.
  - Future visual states should reuse the same derived micro-backed helper instead of route-local string checks.
- Explicit mapping requirements:
  - New check-in source kinds, linkage states, Habit modes, or non-weekly Micro Session count policies require explicit tests and fallback copy.
- Unknown/deprecated values:
  - Unknown source/linkage values fail closed: normal Habit controls remain, and no positive derived completion is shown without known provenance.
- Evidence:
  - Component tests include a Micro Session provenance fixture and a normal manual Habit fixture.

## Scope

- Update linked Micro Session status placement on the Micro Sessions panel.
- Replace large linked-Habit explanation with compact status/progress context below bubbles and before completed/skipped history.
- Tighten Micro Sessions mobile spacing around active/bubble, linked-Habit, upcoming, completed/skipped, and contextual Admin notes rhythm where relevant.
- Refresh `Build a micro session` route action styling for create/session-card controls to current token/action hierarchy.
- On Habits, identify micro-backed Habit rows from existing check-in provenance and remove manual completion actions for those rows.
- Add a `Go to Micro Sessions` CTA and concise auto-completion copy/progress for micro-backed Habits.
- Update tests and support/user-flow docs if route/label sweep proves impact.

## Out Of Scope

- Motivation stats period calculations, labels, or slips math.
- Supabase migrations, generated database types, API route mutations, RLS, authz, cache changes, or new persistence.
- New Micro Sessions linkage model, Perfect Day rules, automatic backfill, reminders, notifications, exports, graph/dashboard work, hard delete, persistent Micro Sessions timer telemetry, or public pages.
- Merge to `main` without explicit owner approval.

## Acceptance Criteria

1. Micro-backed Habits do not show `Mark done` / `Undo complete` as a manual completion path.
2. Micro-backed Habits show clear auto-completion copy and a `Go to Micro Sessions` CTA.
3. Micro Sessions mobile bubbles remain above the linked-Habit status panel.
4. Linked Habit status appears above completed/skipped history when present.
5. Micro Sessions spacing near completed history/Admin notes matches the tighter Habits mobile rhythm where the shared route layout allows it.
6. `Build a micro session` create and session-card actions use current token/action styling and fit mobile.
7. Normal non-micro Habits retain existing manual completion behavior.
8. Relevant component tests pass.
9. Screenshot handoff is captured and owner-approved before `npm run verify:pre-pr`.

## Validation

- `./node_modules/.bin/vitest run tests/unit/habits-server.test.ts tests/unit/habit-perfect-day-hub.test.tsx tests/unit/dryland-micro-plan-panel.test.tsx tests/unit/dryland-builder-hub.test.tsx tests/unit/create-manual-dryland-session-button.test.tsx tests/unit/my-library-calendar-comparison.test.ts tests/unit/my-library-today.test.ts` - PASS (`7` files, `132` tests).
- API/server negative-path evidence: `tests/unit/habits-server.test.ts` covers linked Micro Session progress load failure; the Habits snapshot still returns the Habit and link with `progress: null`, so the UI fails open without an unexpected 500.
- API/server failure-mode evidence: `loadHabitMicroSessionLinksByHabitId` treats missing Dryland linkage/progress schema as a non-blocking read and logs unexpected progress read failures while preserving the base Habit snapshot; no protected writes or authz boundary changed.
- `npm run typecheck` - PASS.
- `./node_modules/.bin/eslint components/my-library/dryland/CreateManualDrylandSessionButton.tsx components/my-library/dryland/DrylandBuilderHub.tsx components/my-library/dryland/DrylandMicroPlanPanel.tsx components/my-library/habits/HabitPerfectDayHub.tsx lib/habits/server.ts lib/habits/shared.ts tests/unit/dryland-builder-hub.test.tsx tests/unit/dryland-micro-plan-panel.test.tsx tests/unit/habit-perfect-day-hub.test.tsx tests/unit/habits-server.test.ts tests/unit/my-library-calendar-comparison.test.ts tests/unit/my-library-today.test.ts` - PASS.
- `npm run lint:briefs:all` - PASS.
- `git diff --check` - PASS.
- First screenshot handoff at `output/micro-sessions-mobile-polish-2026-06-08-152045` was rejected during visual review because the build-surface capture was too isolated, the mobile actions still read too heavy/old-form-like, the bottom nav was shown in the wrong capture position, and the harness added non-representative top spacing. Revised screenshot handoff captured at `output/micro-sessions-mobile-polish-correction-2026-06-08-153722`; owner approval is required before `npm run verify:pre-pr`.
- Revised screenshot handoff at `output/micro-sessions-mobile-polish-correction-2026-06-08-153722` was owner-approved in chat on `2026-06-08`.
- `npm run verify:pre-pr` - PASS full lane on branch `aw-006-micro-sessions-mobile-polish`.
- PR `#1021` CI - PASS: `verify`, `e2e-smoke`, `site-lock-smoke`, `size-check`, `deploy-preview`, `Vercel`, `CodeQL`, and `Analyze (javascript-typescript)`.
- `npm run verify:pre-merge` - first run hit an unrelated Poolside Preview unit-test teardown flake (`window is not defined` after teardown). Targeted `./node_modules/.bin/vitest run tests/unit/poolside-preview-page-client.test.tsx` and full `npm run test:unit` reruns passed, then `npm run verify:pre-merge` rerun passed.

## Route / Label / Support Sweep

Identifiers searched: `Mark done`, `Undo complete`, `Go to Micro Sessions`, `Linked Habit`, `Auto-completes`, `Create micro session`, `Create strength session`, `Create stretching session`, `Completed and skipped`, `/my-library/dryland?micro=active`, and `/my-library/habits`.

Directories/surfaces checked: `app/`, `components/`, `lib/`, `tests/`, `docs/`, `docs/runbooks/`, active/planned/done task briefs, `docs/user-flow-map.md`, and the AW-006 design inventory. Fallout handled in the same diff: support docs now state that micro-backed Habits auto-complete from Micro Sessions and route users back to bubbles; Motivation stats/slips fallout is intentionally deferred to Child Q.

Before broad gates, sweep at minimum:

- `Mark done`
- `Undo complete`
- `Go to Micro Sessions`
- `Linked Habit`
- `Auto-completes`
- `Create micro session`
- `Create strength session`
- `Create stretching session`
- `Completed and skipped`
- `/my-library/dryland?micro=active`
- `/my-library/habits`

Surfaces: `app/`, `components/`, `lib/`, `tests/`, `docs/`, `docs/runbooks/`, active/planned/done task briefs, and Help/Guide/support docs when user-facing workflow copy changes.

## Checkpoint Log

- `2026-06-08 | in-progress | created active child from owner findings H-048 through H-052 after recovery on clean main@235c753d; branch aw-006-micro-sessions-mobile-polish; stats fixed-period work is split to planned Child Q | next: implement UI polish, targeted tests, then screenshot handoff before verify:pre-pr`
- `2026-06-08 | screenshot-review | implemented Child P UI/view-model/docs/tests; targeted Vitest/typecheck/eslint/brief-lint/diff-check pass; screenshot handoff captured at output/micro-sessions-mobile-polish-2026-06-08-152045 using production components with a temporary local screenshot route that was removed after capture | next: owner visual approval, then npm run verify:pre-pr`
- `2026-06-08 | visual-correction | owner rejected build-surface screenshot quality; tightened micro-focused create panel, removed empty-state card-in-card, made saved-session actions compact, preserved accessible create labels, corrected screenshot harness bottom-nav/top-spacing issues, and recaptured full mobile shell plus saved-card evidence at output/micro-sessions-mobile-polish-correction-2026-06-08-153722 | next: owner visual approval, then npm run verify:pre-pr`
- `2026-06-08 | done | owner approved corrected screenshot handoff, npm run verify:pre-pr passed full lane, PR #1021 CI passed, npm run verify:pre-merge rerun passed after one unrelated Poolside Preview unit-test teardown flake was confirmed clean by targeted/full unit reruns, and PR #1021 merged as squash commit 6bd154a2 | next: complete repo-managed docs-only closeout and return to Child Q when selected`

## Completion Record

- `completed`: `2026-06-08`
- `merged_pr`: `#1021`
- `squash_commit`: `6bd154a2`
- `result`: Closed AW-006 Micro Sessions Mobile Linked-Habit Polish. Micro Session-backed Habits now read as derived progress, Micro Sessions bubbles stay primary on mobile, linked-Habit context sits below bubbles and above completed history, and the build/create actions use the current token/action rhythm.
- `validation`: targeted Vitest/eslint/typecheck/brief-lint/diff-check, corrected owner-approved screenshot handoff, `npm run verify:pre-pr` full lane, PR `#1021` CI, and `npm run verify:pre-merge` rerun all passed.
- `10/10 claim`: yes - listed below and each reached `5/5`.

Critical target categories confirmed `5/5`:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Reliability and failure handling`
- `Privacy and compliance`
- `Content governance`
- `Incident response and support operations`
- `i18n operational readiness`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Achieved Score | Evidence                                                                                                              | Gaps / Notes |
| --------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | Micro Sessions are the completion surface; Habits shows derived progress/CTA; screenshots and tests covered the loop. | None.        |
| UX flow clarity                               | `5/5`          | Bubbles render before linked-Habit context; manual Habit completion is hidden for micro-backed Habits.                | None.        |
| Visual design quality                         | `5/5`          | Corrected screenshot handoff was owner-approved; build/create actions use current token/action styling.               | None.        |
| Business logic correctness and data integrity | `5/5`          | No write semantics changed; source/linkage provenance gates UI only; server negative-path test covers fail-open view. | None.        |
| Accessibility (a11y)                          | `5/5`          | Buttons keep accessible names; progress semantics and component tests cover changed controls.                         | None.        |
| Data placement and sync boundaries            | `5/5`          | Server-canonical Micro Session/Habit data remains unchanged; local state remains presentation only.                   | None.        |
| Reliability and failure handling              | `5/5`          | Missing linked Micro Session progress preserves Habit snapshot with `progress: null`.                                 | None.        |
| Privacy and compliance                        | `5/5`          | No new analytics, logs, secrets, or external assets.                                                                  | None.        |
| Content governance                            | `5/5`          | Parent, queue, design inventory, user-flow map, and support runbook were updated.                                     | None.        |
| Incident response and support operations      | `5/5`          | Support/user-flow docs explain Micro-backed Habits auto-complete from Micro Sessions and route users to bubbles.      | None.        |
| i18n operational readiness                    | `5/5`          | Mobile controls use responsive widths and accessible labels rather than narrow fixed text assumptions.                | None.        |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing Dryland/Habits components, typed helpers, route boundaries, and UI tokens; no dependencies added.     | None.        |
| Testing and QA automation                     | `5/5`          | Targeted unit tests, full pre-PR, PR CI, and pre-merge gates passed.                                                  | None.        |
| DevOps and rollback readiness                 | `5/5`          | UI/runtime-only rollback is a normal revert; no migration or external service rollback needed.                        | None.        |
