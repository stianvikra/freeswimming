# Task Brief: Builder Rearrange Mode, Repeat View Clarity, And Last Repeat Rest Copy (10/10)

## Metadata

- `id`: `2026-04-16-builder-rearrange-mode-repeat-view-clarity-and-last-repeat-rest-copy-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-16`
- `updated`: `2026-04-16`

## Goal

Make manual swim-session ordering easier and safer by adding a dedicated `Rearrange` mode, removing repeat edit leakage from `View`, and renaming the final-repeat-rest controls so they read truthfully and instantly.

## Why This Brief Exists

- The builder now has cleaner rest wording and calmer distance controls, but ordering and repeat readability still have avoidable friction:
  - moving steps still depends on `Move up` and `Move down` controls inside edit surfaces instead of a dedicated ordering mode,
  - `View` mode still leaks repeat editing through a visible `Edit repeat` affordance and a half-width repeat card,
  - the repeat rest selector still uses internal phrasing such as `Final interval rest`, `Skip final interval rest`, and `Include final interval rest`,
  - related conflict prompts still describe the same decision with older terminology.
- The owner-approved direction is locked:
  - `Rearrange` must be a separate mode,
  - in `Rearrange`, card click must not open edit,
  - in `Rearrange`, only move controls should be shown for top-level ordering,
  - top-level move controls inside edit surfaces can be removed once `Rearrange` exists,
  - `View` must not show `Edit repeat`,
  - repeat cards in `View` must use full width like the other cards,
  - repeat ending-rest copy should read:
    - label: `Rest after last repeat`
    - options: `Use separate rest step` and `Use repeat rest time`

## Dependencies And Boundaries

- Parent builder lineage:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md)
- Immediate upstream briefs:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-16-builder-rest-labels-custom-distance-and-desktop-click-targets-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-16-builder-rest-labels-custom-distance-and-desktop-click-targets-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-15-swim-session-builder-attached-rest-grouping-and-final-interval-guardrails-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-15-swim-session-builder-attached-rest-grouping-and-final-interval-guardrails-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-13-swim-session-builder-repeat-container-targeted-edit-and-session-actions-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-13-swim-session-builder-repeat-container-targeted-edit-and-session-actions-10-10.md)
- Primary implementation surfaces:
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx)
  - [/Users/stianvikra/freeswimming/lib/session-generator-v1/shared.ts](/Users/stianvikra/freeswimming/lib/session-generator-v1/shared.ts)
  - [/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx](/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx)
  - [/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts)
- Locked boundaries:
  - no schema or API changes,
  - no Garmin/export payload changes,
  - no PDF parity work,
  - no drag-and-drop in this slice,
  - no change to canonical step identities or save/discard boundaries.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Visual design quality`
- `Accessibility (a11y)`
- `Business logic correctness and data integrity`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                             | Evidence                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Builder mode switch must clearly separate editing, ordering, and read-only scanning without duplicating the same controls in multiple places.                  | brief review + local QA                   | `5/5`                   |
| UX flow clarity                               | `target`     | Ordering must move to a dedicated `Rearrange` mode, `View` must stop leaking repeat edit affordances, and repeat-rest copy must read instantly without jargon. | unit/e2e + local QA                       | `5/5`                   |
| Visual design quality                         | `target`     | Repeat view cards must align to full width, controls must feel intentional by mode, and no half-width or mixed-purpose UI should remain.                       | screenshot review + local QA              | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Reordering must move only top-level blocks, preserve linked rests and repeat groups correctly, and never alter canonical repeat/rest semantics.                | code review + targeted tests              | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this is the private swim-session builder, not an admin publishing workspace.                                                                       | explicit scope rationale                  | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Mode switching, move controls, and view-mode repeat cards must remain keyboard-usable with visible focus and truthful semantics.                               | code review + targeted QA                 | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no new dependencies or heavy interaction layers should be added.                                                                              | `npm run build` via verify lanes          | `4/5`                   |
| Data placement and sync boundaries            | `target`     | All changes stay local-draft UI behavior over the same saved workout model and save/discard contract.                                                          | brief contract + implementation diff      | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no new fetch or invalidation behavior is introduced.                                                                                          | code review                               | `4/5`                   |
| Reliability and failure handling              | `target`     | Reorder controls must behave deterministically at list boundaries and not open edit accidentally while rearranging.                                            | unit/e2e + manual QA                      | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no auth or authorization surface changes.                                                                                                     | code review                               | `4/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no personal-data collection or exposure changes here.                                                                                              | explicit scope rationale                  | `N/A`                   |
| Content governance                            | `target`     | Repeat-rest terminology and conflict prompts must use one clear copy system across the touched repeat surface.                                                 | copy review + targeted tests              | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow changes.                                                                                                                         | explicit scope rationale                  | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is a private builder surface.                                                                                                                 | explicit scope rationale                  | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public semantic surface.                                                                                                     | explicit scope rationale                  | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics contract changes are required for this builder-only refinement.                                                                       | explicit scope rationale                  | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no billing, plan, or revenue flows are touched.                                                                                                    | explicit scope rationale                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this slice changes no incident tooling or support workflow.                                                                                        | explicit scope rationale                  | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance/reporting surfaces are touched.                                                                                                         | explicit scope rationale                  | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this brief standardizes private English builder copy only and does not change localization architecture.                                           | explicit scope rationale                  | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing builder mode and card architecture; add no packages.                                                                                        | dependency diff + code review             | `5/5`                   |
| Testing and QA automation                     | `target`     | Coverage must protect mode behavior, repeat view rendering, reordering controls, and last-repeat-rest copy without weakening existing builder coverage.        | updated tests + verify lanes              | `5/5`                   |
| Scalability and cost efficiency               | `N/A`        | N/A because the slice adds no server load or storage.                                                                                                          | explicit scope rationale                  | `N/A`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: rollback remains straightforward because the change stays inside builder UI logic, copy, and tests.                                           | diff review + `verify:pre-merge` evidence | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical data:
  - saved workout identity,
  - canonical ordered `draft.steps`,
  - repeat metadata and ending-rest mode fields,
  - linked rest relationships already represented in the draft.
- Local-only data:
  - current builder mode (`edit`, `rearrange`, `view`),
  - open/closed editor state,
  - local move intent before save.
- Sync policy:
  - `Rearrange` only changes the same local draft ordering already saved by the normal save action,
  - switching modes never writes automatically,
  - repeat rest copy changes are presentation-only and do not change enum values or persistence shape.
- Retention and sensitivity:
  - no new local storage,
  - no new sensitive data handling,
  - save/discard remains the retention boundary.
- Cache/invalidation:
  - unchanged from current builder behavior.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id`, `step.id`, and `repeatGroupId` remain the source-of-truth identifiers.
- Human-readable identifiers:
  - builder mode labels and repeat-rest copy are presentation-only.
- Mutability rules:
  - UI labels may change in place,
  - canonical IDs and saved relationships must not change.
- Rename vs repurpose policy:
  - improve presentation in place,
  - do not repurpose saved step identity, repeat grouping, or Garmin-facing semantics.
- Compatibility contract:
  - Garmin/export/poolside generation continues to consume the same canonical draft fields.
- Observability and repair:
  - targeted tests must catch mode leakage, top-level move regressions, and repeat-rest copy drift.

## Scope

- Add `Rearrange` as a dedicated builder mode beside `Edit` and `View`.
- Entering `Rearrange` must:
  - close open step editors,
  - close open repeat editors,
  - close metadata details,
  - disable card-click edit entry.
- In `Rearrange`, show only top-level move controls on session cards:
  - top-level single manual-pool blocks move as one unit with their attached rest,
  - repeat groups move as one unit,
  - no add, duplicate, delete, or edit controls are shown inside the session-step list.
- Remove top-level `Move up` and `Move down` controls from normal edit-mode action rows once `Rearrange` owns ordering.
- Keep repeat child cards and linked rests out of top-level move mode.
- Fix manual-pool `View` repeat cards so they:
  - no longer show visible `Edit repeat` copy,
  - render full width like the other view cards.
- Rename repeat ending-rest copy to:
  - label: `Rest after last repeat`
  - option: `Use separate rest step`
  - option: `Use repeat rest time`
- Align related repeat-rest conflict prompts and confirmation copy to the same terminology.

## Out Of Scope

- Drag-and-drop ordering.
- Expand-all or collapse-all behavior changes.
- PDF visual parity work.
- Poolside note layout or preview changes.
- Any new analytics, schema, API, or export behavior.

## Acceptance Criteria

1. Builder mode switch now exposes `Edit`, `Rearrange`, and `View`.
2. Entering `Rearrange` closes open editors and metadata details.
3. In `Rearrange`, card clicks do not open edit.
4. In `Rearrange`, top-level step and repeat cards show only move controls for ordering.
5. In normal edit mode, top-level move controls are no longer shown inside edit action rows.
6. Reordering still moves top-level single blocks with their attached rest together.
7. Reordering still moves repeat groups as one unit.
8. Manual-pool repeat cards in `View` no longer show `Edit repeat`.
9. Manual-pool repeat cards in `View` render full width like the surrounding cards.
10. Repeat ending-rest copy reads:
    - `Rest after last repeat`
    - `Use separate rest step`
    - `Use repeat rest time`
11. Conflict prompts and confirmations use the same terminology as the selector.
12. Canonical saved workout behavior, repeat metadata, and Garmin/export compatibility remain unchanged.
13. Relevant tests plus `verify:pre-pr` and `verify:pre-merge` pass.

## Validation

- `npm run lint:briefs`
- targeted `eslint`:
  - `npx eslint components/my-library/workouts/WorkoutEditor.tsx lib/session-generator-v1/shared.ts tests/unit/workout-builder-hub.test.tsx tests/e2e/my-library-workout-builder.spec.ts`
- targeted `vitest`:
  - `npx vitest run tests/unit/workout-builder-hub.test.tsx tests/unit/workouts-shared.test.ts`
- targeted `playwright`:
  - `npx playwright test tests/e2e/my-library-workout-builder.spec.ts`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm installed locally.
- Validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/workouts/<id>`
- Preview:
  - Vercel preview URL from PR checks.
- Recommended matrix:
  - iPhone Safari
  - Desktop Safari
  - Desktop Chrome

## Constraints

- UI copy stays English.
- Keep the change scoped to builder mode behavior, repeat readability, and repeat-rest wording only.
- Do not weaken save/discard clarity or current linked-rest truthfulness.
- Do not introduce drag-and-drop or a second overlapping ordering model.

## 10/10 Quality Bar

- `Rearrange` must feel like one clear purpose-built mode, not a slight variant of `Edit`.
- `View` must read like view, without visible edit leakage.
- Repeat-rest wording must be understandable without internal builder jargon.
- Ordering controls must be obvious, deterministic, and low-risk at list boundaries.
- All touched states must remain keyboard-usable, focus-visible, and test-covered.

## Checkpoint Log

- `2026-04-16 | planning | created the agreed follow-up brief for builder ordering and repeat readability: dedicated rearrange mode, no visible repeat edit leakage in view, full-width repeat cards in view, and clearer last-repeat-rest copy | next: implement the mode split, update copy, add tests, and run targeted validation before full repo gates`
- `2026-04-16 | implementation + validation | added the dedicated Rearrange mode, removed top-level move controls from edit surfaces, fixed repeat view-card leakage/width, renamed last-repeat-rest copy and conflict prompts, and updated unit + e2e coverage; targeted eslint/vitest/playwright plus full verify:pre-pr passed locally | next: commit, push, open PR, watch CI, then run verify:pre-merge before merge`
