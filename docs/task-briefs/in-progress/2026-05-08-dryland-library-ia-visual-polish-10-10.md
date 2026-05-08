# Task Brief: Dryland Library IA And Visual Polish (10/10)

## Metadata

- `id`: `2026-05-08-dryland-library-ia-visual-polish-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-08`
- `updated`: `2026-05-08`

## Goal

Make Dryland Sessions and Micro Sessions ready for real owner use by cleaning up My Library scanability, simplifying the dryland quick-session builder, fixing numeric editing, and aligning visual controls with the app's Apple HIG-inspired control standard.

## Findings To Fix

- My Library is hard to scan because `Swim Sessions` and `Dryland Sessions` expose creation/build actions directly while neighboring sections use one `Open` action.
- The My Library label should be `Swim Sessions`, not `My Swim Sessions`, on the top-level library card.
- Dryland builder uses black action/accent states for `Train this`, selected `Train/Build`, the player surface, and exercise number badges; this is heavier than the rest of the app.
- Numeric quick-session inputs append/retain values during normal edit, for example replacing `2` with `6` can become `20`.
- Quick-session input controls are wider than the expected content; numeric controls should be compact and consistent.
- `Manual exercises`, `Advanced: add from exercise bank`, and `Advanced exercise details` make the page look like two or three competing builders.
- The simple builder does not need `Advanced: add from exercise bank`.
- Build mode shows train-only execution progress and makes the header heavier than necessary.
- Placeholder content such as `Coach cue placeholder`, `Swim relevance placeholder`, `Common mistake`, and media placeholders leaks unfinished product seams.
- The dryland focused route should not let the default mobile nav overlap the builder/player.
- `Focus cue` is swim/training-context language and does not belong in the Dryland quick builder.
- Quick Session is still too much like an exercise-content editor when it exposes `Detail title`, `Summary`, `How-to`, `Guidance`, and `Target areas`.
- The per-set editor needs a clearer disclosure contract, especially on mobile: quick row means all sets are equal, while individual set editing is only for exceptions.
- Saved status is duplicated when the button already says `Saved`.
- The Dryland builder top intro is too long for scanning.
- The focused Dryland builder route duplicates the `Dryland Sessions` navigation action between the route header and builder toolbar.
- Micro Sessions must stay in scope for visual consistency and QA readiness, but its domain model is not being redesigned in this slice.

## Product Decision

- Top-level `/my-library` stays browse-first: each major section should expose one primary `Open` action.
- Session creation actions move to the dedicated hub pages:
  - `/my-library/workouts`: `Build pool session`, `Build open water session`, `AI session generator`.
  - `/my-library/dryland`: `Create strength session`, `Create stretching session`.
- Dryland build mode becomes one quick-session builder:
  - quick fields are `Exercise`, `Sets`, `Reps/Hold`, `Rest`, `Load`, and `Notes`,
  - optional expansion is labeled `Edit sets individually` and is only for per-set target editing when sets differ,
  - the individual editor has a `Make sets equal` action to copy the first set target back across the series,
  - it must not expose exercise-library/content-authoring fields such as `Detail title`, `Summary`, `How-to`, `Guidance`, or `Target areas`.
- Exercise-bank selection and user proposals for library exercises are out of scope for this slice. If needed later, they should be separate flows such as `Build from library` or an explicit exercise-submission form.
- Session-level dryland planning is out of scope for this slice. Later planning should be explicit and reusable across swim/dryland sessions, for example `Schedule session` for calendar placement and `Add to micro plan` for weekly block planning.
- Apple HIG-inspired standard for this slice:
  - input width should match expected content,
  - related inputs should use consistent widths and spacing,
  - numeric fields should allow normal replace/edit typing and validate deterministically,
  - actions should use blue for primary, green for completion, red for destructive, and neutral slate for passive structure,
  - black should not be used as a dryland action/accent color unless explicitly justified.
- App-wide design audit is a follow-up, not part of this PR, to avoid broad regression risk while dryland is being readied for use.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
- Reliability and failure handling
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                        | Evidence                                                                                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library` has one clear `Open` action per changed section, and dryland build mode has one clear quick-session job.                                    | route review, route-label-support-surface-impact-sweep, screenshots, owner QA                  | `5/5`                   |
| UX flow clarity                               | `target`     | Owner can create/edit/train a dryland quick session without seeing competing advanced builders or unfinished placeholders.                                | unit/component tests, targeted Playwright, screenshot artifact handoff                         | `5/5`                   |
| Visual design quality                         | `target`     | Dryland actions, badges, player, fields, and selected states use consistent app tokens; no black dryland action/accent states remain in changed surfaces. | before/after screenshot artifacts in `output/`, owner screenshot approval stop                 | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Numeric inputs allow normal empty/intermediate typing and normalize to canonical deterministic dryland set values before save/train.                      | focused unit tests and dryland e2e save response assertions                                    | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes user-facing My Library and dryland surfaces, not admin editors or admin CRUD.                                              | explicit scope rationale                                                                       | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Changed buttons/inputs preserve labels, keyboard order, focus states, semantic progress, and responsive 44px-ish hit targets.                             | Testing Library assertions, Playwright locator checks, screenshot review                       | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency, media payload, per-keystroke persistence, or expensive client work; changed routes keep existing payload shape.                        | dependency diff, build gate, code review                                                       | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical dryland sessions remain separate from local unsaved builder state; failed save must not destroy typed work.                              | data contract review and targeted tests                                                        | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no route cache strategy change; existing dynamic My Library/dryland mutation refresh behavior should remain intact.                      | route review                                                                                   | `4/5`                   |
| Reliability and failure handling              | `target`     | Invalid/intermediate numeric inputs stay recoverable, save state stays truthful, and no expected user edit path creates an unexpected 500.                | unit tests, route/domain validation review                                                     | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: protected routes/API ownership are reused unchanged; no authz boundary or secret handling changes.                                       | diff review, no secrets                                                                        | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: user-authored exercise names/notes/loads remain private owner-scoped data and are not copied into logs or public copy.                   | privacy/sensitive data review                                                                  | `4/5`                   |
| Content governance                            | `target`     | Quick-session custom exercises do not mutate the code-owned exercise bank; placeholder content is removed or replaced with real empty-state copy.         | tests and code review                                                                          | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin-managed exercise bank, moderation queue, or operator workflow is changed.                                                            | explicit scope rationale                                                                       | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because changed routes are authenticated My Library surfaces and no public metadata, sitemap, robots, or crawlable page behavior changes.             | explicit scope rationale                                                                       | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this slice creates no public AI-discoverable pages or AI-generated dryland content.                                                           | explicit scope rationale                                                                       | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics/event taxonomy change; changed actions remain named and testable for future event instrumentation.                          | code review                                                                                    | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no pricing, entitlement, checkout, refund, or revenue workflow.                                                            | explicit scope rationale                                                                       | `N/A`                   |
| Incident response and support operations      | `target`     | Changed user labels/actions are swept across runbooks/docs/tests so support guidance does not reference removed top-level actions.                        | `docs/runbooks/route-label-support-surface-impact-sweep.md`, identifiers searched, docs review | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice has no finance, reconciliation, payout, subscription, entitlement, or reporting data impact.                                       | explicit scope rationale                                                                       | `N/A`                   |
| i18n operational readiness                    | `target`     | New/changed copy remains short, label-like, and structurally localizable; no locale-system blocker is introduced.                                         | copy review and route-label sweep                                                              | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse current React/Next, TypeScript, Tailwind, dryland helpers, and existing tests; add no new dependency.                                               | dependency diff and architecture review                                                        | `5/5`                   |
| Testing and QA automation                     | `target`     | Relevant unit/e2e contracts cover landing entrypoints, quick numeric edits, no-bank builder, save/reopen/train, and Micro Sessions smoke readiness.       | targeted Vitest, targeted Playwright, pre-PR/pre-merge gates                                   | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no extra polling, media processing, storage migration, or per-keystroke persistence.                                                     | code review                                                                                    | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | UI-only runtime changes should be reversible by PR revert; no migration expected; screenshot approval stop happens before PR gates.                       | no-migration review, rollback/reversible note, verify gates                                    | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reference surface: existing My Library cards for `Open` action density and existing swim workout builder hub for moving creation actions into the dedicated route,
  - reference surface: current dryland `DrylandBuilderHub`, `DrylandSessionEditor`, and Micro Sessions panel; reuse these shared components instead of creating a parallel builder,
  - server components keep auth/data loading; client components keep local form/training state,
  - dryland detail route should use focused workspace chrome with hidden mobile nav like the swim workout detail route.
- TypeScript/domain contracts:
  - preserve canonical dryland draft/session types,
  - keep custom quick exercises as `source: "custom"` and `bankExerciseId: null`,
  - numeric input UI may hold temporary strings, but save/train state must normalize deterministically into canonical set values,
  - validation must prevent invalid persisted set counts, reps/holds, rest, and load.
- Supabase/data layer:
  - no schema migration expected,
  - existing `focus_text`/`focusText` payload support remains for backward compatibility in this slice, but dryland UI no longer exposes or sets a new Focus cue,
  - existing owner-scoped dryland persistence and API validation remain unchanged unless tests reveal a required guard.
- External services/tools:
  - no new external service.
- UI system:
  - apply the app action-color/control-size standard systemically within changed Dryland Sessions, Micro Sessions, My Library entrypoints, and dryland focused builder surfaces,
  - screenshot comparison type: `before/after`, with filenames using `before-...` and `after-...`,
  - UI screenshot/debug protocol: use `docs/runbooks/ui-debug-hypothesis-and-handoff.md`; actual consumed artifact review is the generated `output/dryland-library-ia-visual-polish-*` screenshot set,
  - session-step reference contract review: `docs/design/session-step-surface-contract.md` was checked as a sibling workout-domain contract; this slice does not change the swim session-step shared renderer and keeps dryland train/build UI separate,
  - owner screenshot approval stop is required before `npm run verify:pre-pr`, PR creation, or `npm run verify:pre-merge`.
- Testing:
  - update unit/component tests for the collapsed builder and numeric editing,
  - update Playwright contracts for landing entrypoints and dryland builder,
  - include mobile/focused-route screenshot evidence for the prior nav-overlap risk.

## Data Placement And Sync Contract

- Server-canonical:
  - saved dryland session records and canonical draft payloads.
- Local-only:
  - unsaved form edits, intermediate numeric input strings, open per-set target expansion state, validation messages, and selected mode.
- Sync policy:
  - save remains explicit, no per-keystroke persistence,
  - failed save preserves local user input and reports recoverable error,
  - successful save refreshes canonical list/detail state.
- Retention and sensitivity:
  - user-entered exercise names, notes, loads, timing, and completion remain private owner-scoped training data.
- Cache/invalidation:
  - no change to dynamic route behavior or mutation refresh strategy.

## Identity And Rename Contract

- Canonical stable ID:
  - `dryland_sessions.id` and workout IDs remain the only route/persistence identities.
- Human-readable identifiers:
  - `Swim Sessions`, `Dryland Sessions`, exercise titles, and action labels are mutable display labels, not stable IDs.
- Mutability rules:
  - session/exercise titles remain renameable; changing action labels does not require redirects.
- Compatibility contract:
  - no route path changes; docs/tests labels must be swept.

## Scope

- `/my-library` landing sections for Swim Sessions and Dryland Sessions.
- `/my-library/workouts` and `/my-library/dryland` hub action placement/copy when impacted by the landing simplification.
- `/my-library/dryland/[sessionId]` focused builder chrome.
- `DrylandSessionEditor` quick builder, train/build mode header, player, input sizing, numeric edit behavior, and placeholder cleanup.
- Dryland and Micro Sessions visual consistency where shared surfaces are touched.
- Relevant tests and support docs for changed labels/actions.

## Out Of Scope

- App-wide visual audit beyond changed My Library/dryland surfaces.
- New exercise-bank builder flow, exercise library proposal form, or admin moderation.
- Dryland recommendation/progression logic, AI dryland sessions, media CMS, notifications, or Home reminders.
- Supabase schema changes.
- Merge; owner approval is required after PR readiness and again before merge.

## Follow-Up

- Planned follow-up: app-wide control sizing and action-color audit using the same Apple HIG-inspired standard across all relevant app surfaces.
- Planned follow-up: reusable `My Library` workspace shell for the blue-to-light page background, header action row, spacing, and standard card rhythm across My Library, Swim Sessions, Dryland Sessions, Goals, My Training, My Swim Profile, and Program builder. Keep admin, auth, checkout, print/export, and public marketing/course surfaces on their own visual systems unless explicitly redesigned.
- Planned follow-up: session planning model shared by Swim Sessions and Dryland Sessions: whole-session calendar scheduling and micro-plan/week planning.

## Acceptance Criteria

1. `/my-library` shows `Swim Sessions` and `Dryland Sessions` as simple cards with a single `Open` action when schemas are ready.
2. Swim creation/generator actions remain available inside `/my-library/workouts`; dryland create actions remain available inside `/my-library/dryland`.
3. Dryland build mode does not show execution progress or a duplicate advanced builder section.
4. Quick-session builder has compact, consistent numeric fields and supports normal replace typing for sets, reps/hold, rest, and load.
5. `Advanced: add from exercise bank` is removed from the simple builder.
6. Black dryland action/accent states are replaced with blue/neutral states; green remains for completion, red for destructive actions.
7. Placeholder copy is removed or replaced with useful empty-state copy.
8. Focused dryland detail route avoids mobile nav overlap.
9. Micro Sessions remains visible on `/my-library/dryland` and visually consistent with the updated action standard.
10. Dryland build/header copy is scan-first: no `Focus cue`, no duplicated saved-status copy, no build-mode explanatory paragraph, no long top intro, and no duplicate `Dryland Sessions` action on the focused builder route.
11. Per-set editing is a clear disclosure on desktop and mobile: `Edit sets individually`, compact mobile rows, and `Make sets equal` for returning to all-sets-equal targets.
12. Route-label-support sweep updates tests/docs/runbooks or records intentional leftovers.

## Validation

- `npm run lint:briefs`
- Targeted Vitest for dryland/My Library components and routes.
- Targeted Playwright for My Library landing and dryland builder.
- Screenshot artifact handoff in an `output/<scope>-YYYY-MM-DD-HHMMSS` folder with explicit `after-...` and `reference-...` screenshots.
- High-cost UI/export debug path: screenshot work follows `docs/runbooks/ui-debug-hypothesis-and-handoff.md`, and the actual consumed artifact is the full-resolution `output/dryland-library-ia-visual-polish-*` folder linked in handoff.
- Owner screenshot approval stop before `npm run verify:pre-pr`, PR creation, and `npm run verify:pre-merge`.
- `npm run verify:pre-pr` after screenshot approval.
- `npm run verify:pre-merge` before merge recommendation.

## Route / Label / Support Sweep

- Required runbook: `docs/runbooks/route-label-support-surface-impact-sweep.md`
- Identifiers searched:
  - `My Swim Sessions`
  - `Swim Sessions`
  - `Dryland Sessions`
  - `Build pool session`
  - `Build open water session`
  - `AI session generator`
  - `Create strength session`
  - `Create stretching session`
  - `Advanced: add from exercise bank`
  - `Advanced exercise details`
  - `Manual exercises`
  - `Train this`
  - `Workout player`
  - `Focus cue`
  - `Detail title`
  - `How-to`
  - `Guidance`
  - `Target areas`
  - `All dryland changes are saved`
  - `Build mode edits the session plan`
  - `Coach cue placeholder`
  - `Swim relevance placeholder`
  - `Common mistake`
- Directories/surfaces checked:
  - `app/`
  - `components/`
  - `tests/`
  - `docs/`
  - `docs/runbooks/`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/task-briefs/done/`
  - Help/Guide assertions where relevant
- Fallout handled:
  - `/my-library` landing label/actions updated to `Swim Sessions` + single `Open`.
  - dryland simple-builder labels/test locators updated from `Manual exercises` and advanced bank/details copy to `Quick session` with per-exercise `Edit sets individually`.
  - workout/dryland create-action e2e locators moved from top-level My Library to `/my-library/workouts` and `/my-library/dryland`.
  - `docs/user-flow-map.md` now records the scan-first My Library card rule.
  - `docs/task-briefs/planned/2026-05-07-home-personalization-and-training-reminders-10-10.md` now uses the current top-level `Swim Sessions` label and points prerequisite dryland briefs at `done/`.
  - Intentional leftovers: `My Swim Sessions` remains the saved-session browse label inside `/my-library/workouts`, generator copy, support runbooks, and historical done briefs; this slice only renames the top-level My Library card.

## Checkpoint Log

- `2026-05-08` — Branch `fix/dryland-library-ia-visual-polish-2026-05-08` started from `main`; owner fault-finding findings consolidated into this in-progress brief. Next: implement scoped UI/IA and tests.
- `2026-05-08` — Implemented My Library scan-first cards, dryland quick-builder simplification, compact numeric input handling, blue/neutral action polish, placeholder cleanup, Micro Sessions badge polish, and mobile-nav detail containment. Validation: `npm run typecheck` pass; targeted dryland Vitest pass (`6` files, `26` tests); `npm run lint:briefs:all` pass (`262` briefs); targeted Playwright desktop run exited cleanly but skipped the `2` authenticated flows because `/dev/login` received an HTML Supabase response where JSON was expected. Screenshot artifacts captured at `output/dryland-library-ia-visual-polish-2026-05-08-181453` using local Next + mock Supabase. Next: owner screenshot review before `npm run verify:pre-pr`.
- `2026-05-08` — Owner added follow-up findings before PR gate: Quick Session must remain a fast punch-in surface, `Focus cue` and exercise-content authoring fields must leave dryland build mode, duplicated saved/build copy and duplicate focused-route `Dryland Sessions` navigation should be removed, focused route intro should be shorter, and broader My Library blue workspace shell + planning actions should be follow-ups. Next: implement added scope, refresh tests, and regenerate screenshot handoff.
- `2026-05-08` — Implemented added scope: removed dryland `Focus cue` UI, removed build/details authoring fields, changed per-exercise expansion to `Sets`, removed duplicated saved/build copy, removed focused editor `More`/current-delete affordance so destructive delete stays in the Dryland Sessions list, and regenerated screenshots at `output/dryland-library-ia-visual-polish-2026-05-08-185310`. Validation: `npm run typecheck` pass; targeted dryland Vitest pass (`6` files, `26` tests); `npm run lint:briefs:all` pass; targeted Playwright exited `0` with the same `2` auth-dependent skips from `/dev/login` Supabase HTML response. Next: owner screenshot review before `npm run verify:pre-pr`.
- `2026-05-08` — Owner added correction after screenshot review: per-set editor needs clearer text and less mobile clutter. Next: implement `Edit sets individually`, `Make sets equal`, compact mobile rows, rerun targeted validation, and regenerate screenshot handoff.
- `2026-05-08` — Implemented set-editor correction: disclosure button now says `Edit sets individually`, open state says `Close set edits`, individual editor uses `Individual sets` + `Only when one set differs.`, `Make sets equal` copies the first set across the series, and mobile set rows are compact two-column rows. Validation: `npm run typecheck` pass; targeted dryland Vitest pass (`6` files, `26` tests); `npm run lint:briefs:all` pass; targeted Playwright exited `0` with the same `2` auth-dependent skips from `/dev/login` Supabase HTML response. Screenshot artifacts regenerated at `output/dryland-library-ia-visual-polish-2026-05-08-191303`. Next: owner screenshot review before `npm run verify:pre-pr`.
- `2026-05-08` — Added explicit collapsed-state screenshot evidence for `Edit sets individually` closed on desktop and mobile, both showing the 6-set quick-row state. Screenshot artifacts regenerated at `output/dryland-library-ia-visual-polish-2026-05-08-192940`. Next: owner screenshot review before `npm run verify:pre-pr`.
- `2026-05-08` — Owner approved collapsed-state screenshot handoff. Next: run `npm run verify:pre-pr`, then commit/push/open PR if green.
- `2026-05-08` — `npm run verify:pre-pr` passed after one lint/brief-evidence cleanup: lint, typecheck, unit (`182` files, `978` tests), build, perf budgets, and e2e (`82` passed, `374` skipped by local auth/support gating). Perf trend recommended tightening after `4` weekly green runs; decision for this UI slice is `hold` and record a dedicated performance-budget tightening follow-up instead of broadening this PR. Next: commit, push, open PR, then run `npm run verify:pre-merge` before merge recommendation.
