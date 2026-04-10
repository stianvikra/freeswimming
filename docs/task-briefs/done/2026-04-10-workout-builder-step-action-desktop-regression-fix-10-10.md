# Task Brief: Workout Builder Step Action Desktop Regression Fix (10/10)

## Metadata

- `id`: `2026-04-10-workout-builder-step-action-desktop-regression-fix-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-10`
- `updated`: `2026-04-10`

## Goal

Fix the desktop and larger-screen workout-builder action-row regression introduced by the recent mobile-density slice, while preserving the new mobile progressive-disclosure behavior and all existing workout semantics.

## Why This Brief Exists

- The mobile density slice that shipped on `2026-04-10` improved phone layouts, but a follow-up visual check found a new desktop/tablet regression in the session-builder step header.
- On larger screens, the step summary text can now be squeezed under or behind the action row instead of keeping a stable readable block.
- The same responsive risk exists in repeat headers, where summary content and action controls still compete for the same horizontal space.
- This is a small responsive layout regression, not a workflow or data-model issue.

## Dependencies And Boundaries

- Parent slice already shipped on `main`:
  - `docs/task-briefs/done/2026-04-10-workout-builder-mobile-density-and-width-reclaim-10-10.md`
- Broader builder umbrella still in progress:
  - `docs/task-briefs/in-progress/2026-03-27-workout-builder-live-review-ux-and-actions-10-10.md`
- Primary implementation surface:
  - `components/my-library/workouts/WorkoutEditor.tsx`
- Primary regression protections:
  - `tests/unit/workout-builder-hub.test.tsx`
  - `tests/e2e/my-library-workout-builder.spec.ts`

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                     | Evidence                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Step and repeat headers on larger screens keep a stable readable summary area and a stable action area without overlapping or hiding key content.               | desktop/tablet review + code review      | `5/5`                   |
| UX flow clarity                               | `target`     | Builder steps remain easy to scan on desktop/tablet, with action controls available without crushing the step summary.                                           | manual QA + targeted tests               | `5/5`                   |
| Visual design quality                         | `target`     | The larger-screen action rows feel intentional and aligned, not crowded or broken by the mobile density work.                                                    | screenshot review + manual QA            | `5/5`                   |
| Business logic correctness and data integrity | `target`     | The fix changes layout only and preserves all step, repeat, save, export, and destructive-action semantics.                                                      | code review + targeted tests             | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes an owner-facing workout-builder surface, not an admin editorial workflow.                                                         | explicit scope rationale                 | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: buttons, labels, focus order, and disclosure affordances remain keyboard- and screen-reader-safe after the responsive fix.                     | targeted review + tests                  | `4/5`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because this slice only adjusts responsive layout classes and does not add new runtime work or payload.                                                      | explicit scope rationale                 | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this slice does not change state ownership, persistence, or sync boundaries.                                                                          | explicit scope rationale                 | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no fetch, cache, or invalidation behavior changes.                                                                                                    | explicit scope rationale                 | `N/A`                   |
| Reliability and failure handling              | `supporting` | Supporting only: destructive and secondary actions remain visible and reachable after the responsive layout change.                                               | targeted review + tests                  | `4/5`                   |
| Security and authz                            | `N/A`        | N/A because no auth, permission, or protected-route behavior changes.                                                                                             | explicit scope rationale                 | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no data collection, disclosure, or retention behavior changes.                                                                                        | explicit scope rationale                 | `N/A`                   |
| Content governance                            | `N/A`        | N/A because no workflow copy contract changes are introduced in this regression fix.                                                                              | explicit scope rationale                 | `N/A`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin/operator workflow changes in scope.                                                                                                          | explicit scope rationale                 | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is an authenticated My Library route with no public crawl contract.                                                                              | explicit scope rationale                 | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-facing metadata or public content changes.                                                                                               | explicit scope rationale                 | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no event model or instrumentation changes are required for this layout-only fix.                                                                      | explicit scope rationale                 | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, billing, checkout, or entitlement behavior changes.                                                                                       | explicit scope rationale                 | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this is a narrow responsive regression fix with no workflow/runbook change.                                                                           | explicit scope rationale                 | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance or reporting path changes.                                                                                                                 | explicit scope rationale                 | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no localization architecture or translation workflow changes are introduced.                                                                           | explicit scope rationale                 | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | The fix uses existing Tailwind/layout primitives in `WorkoutEditor` and adds no new dependency or parallel layout system.                                        | dependency diff + code review            | `5/5`                   |
| Testing and QA automation                     | `target`     | Tests protect larger-screen action-row readability and preserve mobile progressive disclosure before PR update.                                                   | targeted unit/e2e + `verify:pre-pr`      | `5/5`                   |
| Scalability and cost efficiency               | `N/A`        | N/A because this slice only changes local layout classes and does not affect infra or storage cost.                                                               | explicit scope rationale                 | `N/A`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the change remains a small UI-only diff that is easy to revert if the responsive behavior is not satisfactory.                                  | diff review + rollback note              | `4/5`                   |

## Data Placement And Sync Contract

- `N/A`
- Rationale: this slice only changes responsive layout and does not move or redefine any state boundary.

## Identity And Rename Contract

- `N/A`
- Rationale: this slice does not add or change persisted identifiers, slugs, route params, or canonical names.

## Scope

- Fix larger-screen step-card header layout so the summary block keeps a stable readable area next to action controls.
- Fix larger-screen repeat-header layout so summary copy and controls do not fight for the same horizontal space.
- Preserve the phone-width progressive-disclosure action model shipped in the mobile density slice.
- Preserve all existing action availability and button labels in this slice.
- Add or update targeted regression tests for the desktop/tablet layout contract.

## Out Of Scope

- Any workout logic, save, export, or repeat/rest semantic change.
- Mobile density redesign beyond preserving the already-shipped behavior.
- Metadata-panel, pool-size, or poolside-note work.
- New copy changes, action reordering policy changes, or new builder controls.

## Acceptance Criteria

1. Step-card headers on desktop and larger screens keep the summary text readable without being overlapped or visually crushed by action controls.
2. Repeat headers on desktop and larger screens keep the summary content readable alongside action controls.
3. Mobile step and repeat actions remain progressive and do not regress to the full always-visible action wall.
4. All existing step and repeat actions remain reachable after the layout fix.
5. No workout semantics, save behavior, or export behavior change in this slice.
6. Targeted tests and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- targeted `vitest`:
  - `tests/unit/workout-builder-hub.test.tsx`
- targeted `playwright`:
  - `tests/e2e/my-library-workout-builder.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Constraints

- Keep this slice layout-only.
- Do not reopen or weaken the shipped mobile action-disclosure behavior.
- Prefer stable flex/grid wrapping and minimum-width guards over adding new wrappers or new copy.
- Keep the diff small enough to ship safely as a regression follow-up.

## Checkpoint Log

- `2026-04-10 | in-progress | owner-reported screenshot review found a new larger-screen step-header regression after the shipped mobile density slice: step summary text can be squeezed behind the action row on desktop/tablet | next: fix the step/repeat action header layout in WorkoutEditor, add targeted desktop regression coverage, and run the normal local gates`
- `2026-04-10 | in-progress | layout fix and targeted regression coverage landed in WorkoutEditor, unit coverage passed, targeted desktop Playwright passed/skipped safely in local env, and full local verify:pre-pr completed green | next: clean test artifacts, commit, push, open PR, and run verify:pre-merge before merge recommendation`
- `2026-04-10 | done | merged to main as 02cb6c9 after green local verify:pre-pr, green local verify:pre-merge, and green PR 408 checks | next: none`
