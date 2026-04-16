# Task Brief: Builder Rest Labels, Custom Distance, And Desktop Click Targets (10/10)

## Metadata

- `id`: `2026-04-16-builder-rest-labels-custom-distance-and-desktop-click-targets-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-16`
- `updated`: `2026-04-16`

## Goal

Make the manual swim-session builder read more cleanly by simplifying rest labels inside repeat editors, hiding redundant distance text, and letting desktop users open step cards by clicking the card itself without weakening mobile UX or canonical workout behavior.

## Why This Brief Exists

- The latest builder slice fixed rest grouping and overview truthfulness, but a few UI seams still remain:
  - nested repeat rest cards still show parent-prefixed labels such as `MAIN INTERVAL REST`,
  - fixed distance presets still render redundant passive text such as `400m` beside the dropdown,
  - `Custom distance` input visibility is better kept conditional, but the current layout still needs the agreed autofocus and hide/show behavior,
  - desktop edit mode still makes users aim for the small `Edit` button even though the whole card reads like one interaction target.
- The owner-approved direction is locked:
  - repeat child rest labels should drop redundant parent prefixes and read as generic rest types inside the repeat context,
  - the repeat overview summary should remain explicit and scan-friendly,
  - `Custom distance` should only appear when selected and should autofocus when revealed,
  - fixed preset selections should not show duplicate passive meter/yard text,
  - desktop/fine-pointer users may click the whole card to edit, while mobile/coarse-pointer users keep the explicit button-only interaction model,
  - open/collapse behavior for step editors and repeat containers is not part of this brief.

## Dependencies And Boundaries

- Parent builder lineage:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md)
- Immediate upstream builder briefs:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-15-swim-session-builder-attached-rest-grouping-and-final-interval-guardrails-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-15-swim-session-builder-attached-rest-grouping-and-final-interval-guardrails-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-13-swim-session-builder-repeat-container-targeted-edit-and-session-actions-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-13-swim-session-builder-repeat-container-targeted-edit-and-session-actions-10-10.md)
- Primary implementation surfaces:
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx)
  - [/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx](/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx)
  - [/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts)
- Locked boundaries:
  - no PDF visual parity work in this brief,
  - no poolside note layout work in this brief,
  - no schema or API changes,
  - no Garmin/export payload changes,
  - no change to the current one-open-editor interaction model.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Visual design quality`
- `Accessibility (a11y)`
- `Business logic correctness and data integrity`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                              | Evidence                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Builder overview and edit cards must scan more clearly without adding a second interaction model or new structural clutter.                                     | brief review + targeted QA                | `5/5`                   |
| UX flow clarity                               | `target`     | Rest names, distance controls, and desktop edit affordances must remove avoidable friction while keeping the same mental model for saved workouts.              | unit/e2e + local QA                       | `5/5`                   |
| Visual design quality                         | `target`     | Repeat rest labels and distance controls must look calmer and less redundant, and desktop click states must feel intentional rather than accidental.            | screenshot review + local QA              | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Label cleanup and distance-field visibility must not alter canonical step ordering, saved distances, repeat metadata, or Garmin/export behavior.                | code review + targeted tests              | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this is the authenticated swim-session builder, not an admin publishing surface.                                                                    | explicit scope rationale                  | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Desktop full-card edit affordances must preserve keyboard reachability, focus visibility, and non-conflicting semantics with the explicit `Edit` button.        | code review + targeted QA                 | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no new dependency or heavy client behavior should be introduced for this builder-only refinement.                                              | `npm run build` via verify lanes          | `4/5`                   |
| Data placement and sync boundaries            | `target`     | All changes remain local-draft presentation and interaction refinements over the same saved workout model and save/discard boundaries.                          | brief contract + implementation diff      | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no new fetch, cache, or invalidation behavior is introduced.                                                                                   | code review                               | `4/5`                   |
| Reliability and failure handling              | `target`     | Desktop click targets and distance-field toggling must behave deterministically and never open the wrong editor or leak stale custom-distance UI state.         | unit/e2e + manual QA                      | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no auth or authorization surface changes.                                                                                                      | code review                               | `4/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no personal-data collection or exposure changes here.                                                                                               | explicit scope rationale                  | `N/A`                   |
| Content governance                            | `target`     | Builder copy must use the agreed rest labels consistently and remove stale or duplicate explanatory text in the touched controls.                               | copy review + targeted tests              | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow is changed.                                                                                                                       | explicit scope rationale                  | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is a private builder surface.                                                                                                                  | explicit scope rationale                  | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public semantic surface.                                                                                                      | explicit scope rationale                  | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics contract changes are required for this builder-only refinement.                                                                        | explicit scope rationale                  | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no billing, plan, or revenue flows are touched.                                                                                                     | explicit scope rationale                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this slice changes no incident tooling or support workflow.                                                                                         | explicit scope rationale                  | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance/reporting surfaces are touched.                                                                                                          | explicit scope rationale                  | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this brief only standardizes private English builder copy and does not change localization architecture.                                            | explicit scope rationale                  | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing React/Tailwind/editor patterns and avoid new packages.                                                                                           | dependency diff + code review             | `5/5`                   |
| Testing and QA automation                     | `target`     | Coverage must protect rest-label rendering, custom-distance visibility/autofocus, and desktop card click-target behavior without weakening existing rest tests. | updated tests + verify lanes              | `5/5`                   |
| Scalability and cost efficiency               | `N/A`        | N/A because the slice adds no server load or storage.                                                                                                           | explicit scope rationale                  | `N/A`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: rollback remains straightforward because the change is isolated to builder UI logic and tests.                                                 | diff review + `verify:pre-merge` evidence | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical data:
  - saved workout identity,
  - canonical ordered `draft.steps`,
  - repeat metadata and rest-mode fields,
  - saved distance values and authored units already represented in the draft.
- Local-only data:
  - open/closed editor state,
  - desktop vs mobile edit affordance behavior,
  - conditional visibility and autofocus state for custom-distance inputs.
- Sync policy:
  - switching between preset distance and custom distance only updates the existing local draft step fields,
  - clicking a desktop card only changes local edit state,
  - save/discard boundaries remain unchanged.
- Retention and sensitivity:
  - no new local storage,
  - no new sensitive data handling,
  - existing save/discard behavior remains the retention boundary.
- Cache/invalidation:
  - unchanged from current builder behavior.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id`, `step.id`, and `repeatGroupId` remain unchanged and continue to drive persistence and relationships.
- Human-readable identifiers:
  - labels such as `REST BETWEEN REPEATS` and `REST AFTER SET` are presentation-only copy.
- Mutability rules:
  - UI labels may change in place,
  - canonical IDs and persisted relationships must not change.
- Rename vs repurpose policy:
  - improve presentation in place,
  - do not repurpose canonical step identity or repeat metadata.
- Compatibility contract:
  - downstream Garmin/export/poolside generation continues to derive from canonical steps exactly as before.
- Observability and repair:
  - targeted tests must catch summary, click-target, and custom-distance regressions before merge.

## Scope

- Rename nested repeat child rest cards in the open repeat editor to generic contextual labels:
  - `REST BETWEEN REPEATS`
  - `REST AFTER SET`
- Keep repeat overview summaries explicit and scan-friendly, using neutral rest phrasing such as:
  - `4 x 100m · Freestyle · Interval rest 0:30 · Set rest 0:30`
- Keep single top-level step summaries truthful with inline `Rest 0:30` wording.
- Show `Custom distance (m|yd)` only when `Custom distance` is selected.
- Autofocus the custom-distance input when it appears.
- Hide the custom-distance input again when the user returns to a preset distance.
- Remove redundant passive duplicate preset text beside the distance dropdown when a fixed preset is selected.
- On desktop/fine-pointer contexts, allow the full top-level step card, repeat summary card, and nested repeat child cards to open edit, while preserving explicit action buttons and preventing click conflicts with nested controls.
- Keep mobile/coarse-pointer behavior button-driven to avoid scroll/tap conflicts.

## Out Of Scope

- Expand/collapse-all controls.
- Changing the one-open-editor model.
- Opening all repeat child cards automatically.
- PDF visual parity or poolside-note layout work.
- Any new analytics or backend behavior.

## Acceptance Criteria

1. Open repeat editors no longer show parent-prefixed child rest labels such as `MAIN INTERVAL REST` or `MAIN SET REST`.
2. Repeat child rest labels read `REST BETWEEN REPEATS` and `REST AFTER SET`.
3. Repeat overview summaries still show explicit rest semantics and durations.
4. The builder only renders the custom-distance input when `Custom distance` is selected.
5. The custom-distance input autofocuses when it is revealed.
6. Selecting a preset distance hides the custom-distance input again.
7. Fixed preset selections no longer show redundant passive duplicate text such as `400m` beside the dropdown.
8. Desktop/fine-pointer users can click the full card body to open the relevant step/repeat editor.
9. Mobile/coarse-pointer users do not get the full-card click behavior.
10. Clicking nested action buttons or controls does not also trigger the parent card open handler.
11. Keyboard and focus behavior remain valid and visible for the touched interactions.
12. Canonical saved workout behavior, repeat metadata, and Garmin/export compatibility remain unchanged.
13. Relevant tests plus `verify:pre-pr` and `verify:pre-merge` pass.

## Validation

- `npm run lint:briefs`
- targeted `eslint`:
  - `npx eslint components/my-library/workouts/WorkoutEditor.tsx tests/unit/workout-builder-hub.test.tsx tests/e2e/my-library-workout-builder.spec.ts`
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
- Do not weaken existing rest grouping, rest truthfulness, or Garmin readiness behavior.
- Do not add a second mobile interaction model.
- Keep the visual language aligned with the current calm builder.
- Keep the change scoped to the agreed builder slice only.

## 10/10 Quality Bar

- Rest wording must be instantly understandable without internal-model jargon.
- Distance editing must show only the controls the user currently needs.
- Desktop edit affordances must feel easier without becoming ambiguous.
- Mobile usability must not regress from broader click targets.
- Builder state changes must stay deterministic, keyboard-usable, and test-covered.

## Checkpoint Log

- `2026-04-16 | planning | created the brief for the agreed builder cleanup slice: generic nested rest labels, conditional custom-distance input with autofocus, removal of redundant preset text, and desktop-only full-card edit affordances | next: implement the UI changes, update tests, and run targeted validation before full repo gates`
- `2026-04-16 | validation | implemented the agreed builder cleanup slice: nested repeat rests now use generic contextual labels, fixed distance presets no longer show duplicate passive text, custom-distance input is conditional with autofocus, and fine-pointer desktop cards open edit from the full card body while coarse-pointer/mobile stays button-driven | validation: npm run lint:briefs:all; npx vitest run tests/unit/workout-builder-hub.test.tsx tests/unit/workouts-shared.test.ts; env NEXT_DIST_DIR=.next-playwright-builder-rest-labels npx playwright test tests/e2e/my-library-workout-builder.spec.ts; npm run verify:pre-pr | next: commit, push, open PR, monitor CI, and merge once pre-merge gate + required checks are green`
