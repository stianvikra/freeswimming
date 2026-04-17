# Task Brief: My Swim Sessions Quick View And Builder View Clarity (10/10)

## Metadata

- `id`: `2026-04-16-my-swim-sessions-quick-view-and-builder-view-clarity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-16`
- `updated`: `2026-04-16`

## Goal

Make `My Swim Sessions` faster to scan and use, and make the builder's `View` mode read like a clean grouped session overview instead of a stack of mixed edit-era cards.

## Why This Brief Exists

- The owner-approved direction is now explicit:
  - saved-session inline preview should read as `Quick View`, not a vague `View`,
  - `Poolside Note` in `My Swim Sessions` should open its own inline control surface instead of forcing the owner into the edit workflow for a print-focused task,
  - quick preview should be wider, calmer, and easier to scan, with better line handling for `Set rest`,
  - selection-mode checkboxes should sit beside the session title instead of floating above it,
  - delete confirmations should visually mark the exact step/block/rest that is about to be removed,
  - `Session details` should show total length beside or under the title depending on available width,
  - builder `View` should group manual pool sessions by top-level step families (`Warmup`, `Main`, `Cooldown`) instead of rendering one card per internal piece,
  - `Edit` and `Rearrange` should use subtle category rails so the owner can scan where warmup ends and main/cooldown begin.
- This is a workflow-quality slice, not a new data model:
  - saved sessions remain the same canonical workouts,
  - Garmin/export behavior must remain untouched,
  - the brief is about readability, truthfulness, and safer session handling.

## Dependencies And Boundaries

- Parent builder lineage:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md)
- Immediate upstream builder/library briefs:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-16-builder-rearrange-mode-repeat-view-clarity-and-last-repeat-rest-copy-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-16-builder-rearrange-mode-repeat-view-clarity-and-last-repeat-rest-copy-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-12-swim-session-builder-scan-delete-and-poolside-brand-polish-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-12-swim-session-builder-scan-delete-and-poolside-brand-polish-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-02-workout-builder-saved-session-density-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-02-workout-builder-saved-session-density-10-10.md)
- Primary implementation surfaces:
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/PoolsideNotePanel.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/PoolsideNotePanel.tsx)
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/SavedWorkoutsPanel.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/SavedWorkoutsPanel.tsx)
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutBuilderHub.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutBuilderHub.tsx)
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx)
  - [/Users/stianvikra/freeswimming/lib/workouts/shared.ts](/Users/stianvikra/freeswimming/lib/workouts/shared.ts)
  - [/Users/stianvikra/freeswimming/lib/workouts/server.ts](/Users/stianvikra/freeswimming/lib/workouts/server.ts)
  - [/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx](/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx)
  - [/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts)
  - [/Users/stianvikra/freeswimming/docs/runbooks/core-flow-incident-response.md](/Users/stianvikra/freeswimming/docs/runbooks/core-flow-incident-response.md)
- Locked boundaries:
  - no schema or API contract break,
  - no Garmin/export payload changes,
  - no poolside print layout redesign,
  - no drag-and-drop ordering,
  - no change to canonical workout ownership, save/discard, or workout identity.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Visual design quality`
- `Accessibility (a11y)`
- `Business logic correctness and data integrity`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                   | Evidence                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `My Swim Sessions` must stay list-first while exposing clearer row actions (`Quick View`, `Edit`, `View PDF`, inline `Poolside Note`) and a calmer `View` mode.      | brief review + local QA                   | `5/5`                   |
| UX flow clarity                               | `target`     | Saved-session browse, quick preview, poolside note access, selection mode, and builder `View` must each read as one clear job with no mixed-purpose friction.        | unit/e2e + local QA                       | `5/5`                   |
| Visual design quality                         | `target`     | Quick preview, poolside inline panel, delete targeting, grouped builder view, and category rails must all feel intentional, aligned, and easy to scan.               | screenshot review + local QA              | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Preview/poolside actions must stay card-scoped, delete targeting must highlight the correct block only, and no canonical workout data or Garmin semantics may drift. | code review + targeted tests              | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this brief changes the private athlete workout builder and saved-session library, not admin publishing/editor tooling.                                   | explicit scope rationale                  | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Grouped view lines, inline poolside controls, selection checkboxes, and delete targeting must remain keyboard-usable with truthful labels and visible focus.         | code review + targeted QA                 | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no new dependency or heavyweight client rendering should be introduced; inline browse surfaces must stay responsive.                                | `npm run build` via verify lanes          | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Quick-view state, poolside focus/print options, and view grouping must stay local presentation state over the same saved canonical workout records.                  | brief contract + implementation diff      | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no new server cache or invalidation behavior beyond the current owner-scoped workout library fetch contract.                                        | code review                               | `4/5`                   |
| Reliability and failure handling              | `target`     | Quick-view toggles, poolside toggles, and delete confirmation states must behave deterministically and never affect the wrong row or step.                           | unit/e2e + manual QA                      | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: poolside preview links must remain owner-scoped through the existing protected PDF route; no new auth surface is introduced.                        | code review + existing route tests        | `4/5`                   |
| Privacy and compliance                        | `target`     | Inline poolside note controls must include only explicit focus selections and the same owner-scoped session data already available in the current flow.              | code review + unit/e2e + route contract   | `5/5`                   |
| Content governance                            | `target`     | Row-action copy, quick-preview labels, grouped view labels, and delete-state copy must stay consistent and use one English terminology system.                       | copy review + targeted tests              | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow changes.                                                                                                                               | explicit scope rationale                  | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because the changed surfaces are authenticated private library/builder routes.                                                                                   | explicit scope rationale                  | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this brief changes no public crawlable or semantic AI-discovery surface.                                                                                 | explicit scope rationale                  | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no event/analytics contract changes are required for this private workflow cleanup slice.                                                                | explicit scope rationale                  | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no billing, entitlement, or revenue workflow is touched.                                                                                                 | explicit scope rationale                  | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting because saved-workout row actions and builder-view behavior are covered by the incident runbook and must stay truthful after label/action changes.        | runbook update + targeted QA              | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance or reporting flows are touched in this scope.                                                                                                 | explicit scope rationale                  | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this brief standardizes private English copy only and does not alter localization architecture or locale routing.                                        | explicit scope rationale                  | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing builder/library patterns and protected PDF route behavior; add no packages.                                                                           | dependency diff + code review             | `5/5`                   |
| Testing and QA automation                     | `target`     | Coverage must protect quick-view rendering, poolside inline controls, grouped builder view, selection-mode layout, and targeted delete states.                       | updated tests + verify lanes              | `5/5`                   |
| Scalability and cost efficiency               | `N/A`        | N/A because the slice adds no new background jobs, storage, or repeated network amplification.                                                                       | explicit scope rationale                  | `N/A`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: rollback stays straightforward because the work is limited to private UI, local state, and test/runbook updates.                                    | diff review + `verify:pre-merge` evidence | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical data:
  - saved `workout.id`,
  - canonical workout draft,
  - saved workout summary metadata,
  - owner-scoped poolside PDF export route,
  - owner-scoped open training focuses already loaded for the current user.
- Local-only data:
  - which saved-workout quick preview is expanded,
  - which saved-workout poolside panel is expanded,
  - local poolside focus selections before opening print preview,
  - local poolside print style/layout selections,
  - local builder `View` grouping and category-rail presentation state,
  - local pending delete visualization.
- Sync policy:
  - quick preview and poolside controls never write automatically,
  - grouped builder `View` is presentation-only,
  - inline poolside controls build the same protected poolside export URL with explicit query params,
  - save/discard boundaries remain unchanged.
- Retention and sensitivity:
  - no new local storage,
  - no new persisted personal data,
  - selected poolside focus/layout/style values are session-local UI state only.
- Cache/invalidation:
  - unchanged workout-library fetch contract,
  - existing `router.refresh()` after deletes remains the invalidation boundary.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id`, `step.id`, and `repeatGroupId` remain the source-of-truth identifiers.
- Human-readable identifiers:
  - `Quick View`, `Poolside Note`, grouped `Warmup/Main/Cooldown` labels, and delete copy are presentation-only.
- Mutability rules:
  - UI labels may change in place,
  - canonical workout ids, step ids, and repeat-group ids must not change.
- Rename vs repurpose policy:
  - improve action labels and grouped view presentation in place,
  - do not repurpose canonical workout data, poolside route semantics, or Garmin export meaning.
- Compatibility contract:
  - protected PDF export continues to accept `variant`, `focusId`, `printStyle`, and `printLayout` query params,
  - existing saved-workout routes and builder routes remain valid.
- Observability and repair:
  - targeted tests must catch row-action drift, wrong-row toggles, grouped-view regressions, and delete-target mismatch.

## Scope

- `My Swim Sessions` row actions:
  - rename saved-row `View` to `Quick View`,
  - keep `View PDF` and `Poolside Note` as separate actions,
  - keep actions card-scoped.
- `Quick View` inline preview:
  - widen and calm the preview presentation,
  - render preview lines as a readable structured summary rather than a dense monospace block,
  - place `Set rest` on its own line when it improves readability,
  - add visible spacing between steps/interval rows.
- `Poolside Note` from `My Swim Sessions`:
  - open an inline poolside control panel from the row instead of requiring the edit workflow,
  - allow focus selection plus print style/layout in the inline panel,
  - open the owner-scoped poolside print preview from that panel.
- Selection mode:
  - move row checkbox inline with the session title,
  - keep row action text clean with no `Select session` row copy.
- Session details:
  - show total session length beside or under the title depending on available width.
- Builder `View` mode:
  - group manual pool sessions into top-level section containers such as `Warmup`, `Main`, and `Cooldown`,
  - render each original piece as its own line within the section,
  - keep targeted edit entry by line where appropriate,
  - remove misleading mixed neutral/blue treatment that makes the first card look semantically different for no reason.
- Builder `Edit` and `Rearrange`:
  - add subtle left-side category rails for top-level step/repeat cards,
  - use category colors that improve scanning without reading as warnings.
- Delete targeting:
  - when a delete confirmation is open, visually mark the exact step/block/rest that is about to be removed,
  - include repeat post-set-rest replacement confirmations in that behavior.
- Documentation:
  - update the saved-workout row-action/runbook wording to match the shipped labels and inline behavior.

## Out Of Scope

- Any schema or API shape break.
- Drag-and-drop ordering.
- Poolside print artifact redesign.
- Workout PDF parity work.
- Garmin/export payload changes.
- Public-site or SEO behavior.

## Acceptance Criteria

1. Saved-workout row action reads `Quick View`, not `View`.
2. Quick preview opens inline and renders structured, readable rows instead of one dense `pre` block.
3. Quick preview gives `Set rest` room to fall onto its own line when that improves scanability.
4. `Poolside Note` on `/my-library/workouts` opens an inline control panel with focus, style, layout, and `Print Preview`.
5. Inline poolside print preview opens the same owner-scoped poolside export route with explicit print/focus query params.
6. Selection-mode checkbox sits inline with the session title, and row-level `Select session` copy is absent.
7. `Session details` shows total session length beside or below the title depending on width.
8. Builder `View` groups manual pool sessions by top-level step family and no longer reads as one card per internal piece.
9. Builder `View` still supports targeted edit entry from the grouped view rows.
10. `Edit` and `Rearrange` use subtle category rails on top-level cards for warmup/main/cooldown scanning.
11. Pending delete UI visually marks the exact step/block/rest that will be removed.
12. Saved-workout row actions remain card-scoped and never act on the wrong workout.
13. Garmin/export behavior remains unchanged.
14. Relevant tests plus `verify:pre-pr` and `verify:pre-merge` pass.

## Validation

- `npm run lint:briefs`
- targeted `eslint`:
  - `npx eslint components/my-library/workouts/SavedWorkoutsPanel.tsx components/my-library/workouts/WorkoutBuilderHub.tsx components/my-library/workouts/WorkoutEditor.tsx lib/workouts/shared.ts lib/workouts/server.ts tests/unit/workout-builder-hub.test.tsx tests/e2e/my-library-workout-builder.spec.ts docs/runbooks/core-flow-incident-response.md`
- targeted `vitest`:
  - `npx vitest run tests/unit/workout-builder-hub.test.tsx tests/unit/workouts-routes.test.ts`
- targeted `playwright`:
  - `npx playwright test tests/e2e/my-library-workout-builder.spec.ts`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm installed locally.
- Validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/workouts`
  - `http://127.0.0.1:3000/my-library/workouts/<workoutId>`
- Preview:
  - Vercel preview URL from PR checks.
- Recommended matrix:
  - iPhone Safari
  - Desktop Safari
  - Desktop Chrome
  - Desktop Firefox

## Constraints

- UI copy stays English.
- Keep the work scoped to saved-session browsing, builder readability, and delete targeting.
- Do not introduce new dependencies.
- Do not weaken the current protected PDF route behavior.
- Do not weaken test coverage.

## 10/10 Quality Bar

- `My Swim Sessions` must feel like a fast operational browse surface, not a half-editor.
- `Quick View` must read faster than opening edit mode.
- `Poolside Note` must feel reachable from the browse list without confusing edit intent.
- Builder `View` must look like grouped reading, not disabled edit cards.
- Delete targeting must feel safe and explicit.
- All touched surfaces must remain keyboard-usable, focus-visible, and test-covered.

## Checkpoint Log

- `2026-04-16 | planning | created the implementation brief for saved-session quick-view/poolside browse improvements, grouped builder view, category rails, and targeted delete marking after scope was fully agreed in chat | next: implement the shared UI changes, update tests/runbook, run targeted validation, then complete pre-pr and pre-merge gates`
- `2026-04-16 | implementation + pre-pr gate | shipped inline row-level Poolside Note controls, structured Quick View rows, session-total surfacing in Session details, grouped builder View sections, category rails, and exact pending-delete targeting; updated route/test/runbook coverage; targeted vitest and targeted playwright passed; full \`npm run verify:pre-pr\` passed | next: stage scoped files, run \`npm run lint:briefs\`, commit, push, open/update PR, monitor CI, then run \`npm run verify:pre-merge\` before merge recommendation`
