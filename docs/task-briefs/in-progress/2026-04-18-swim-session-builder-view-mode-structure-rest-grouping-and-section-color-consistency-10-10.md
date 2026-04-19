# Task Brief: Swim Session Builder View Mode Structure, Rest Grouping, And Section Color Consistency (10/10)

## Metadata

- `id`: `2026-04-18-swim-session-builder-view-mode-structure-rest-grouping-and-section-color-consistency-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-18`
- `updated`: `2026-04-19`

## Goal

Keep `View` mode structurally consistent with `Edit` and `Rearrange` so mode switching preserves real workout order, parent-linked rest behavior, and section scanning, while also restoring the section accent mapping in a calmer visual variant.

## Why This Brief Exists

- `View` currently preserves too little of the builder's structural semantics:
  - repeated `Warmup`, `Main`, and `Cooldown` content is grouped too generically,
  - row labels such as `1 of 4` compensate for the grouping model instead of improving scanability,
  - some rest content can surface as a standalone `REST` container even when swimmers read it as part of the preceding work or repeat block.
- `Edit` and `Rearrange` already communicate more of the real structure through ordered blocks and section accents.
- The owner wants `View` to stay calm, but not at the cost of truthful structure:
  - preserve workout order,
  - keep parent-linked rest with the block it belongs to,
  - remove `1 of N` helper labels when block order already does the job,
  - keep the same warmup/main/cooldown section identity across modes.

## Dependencies And Boundaries

- Builder lineage:
  - [2026-02-28-workout-builder-and-poolside-execution-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md)
  - [2026-03-27-workout-builder-live-review-ux-and-actions-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-27-workout-builder-live-review-ux-and-actions-10-10.md)
  - [2026-04-15-swim-session-builder-attached-rest-grouping-and-final-interval-guardrails-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-15-swim-session-builder-attached-rest-grouping-and-final-interval-guardrails-10-10.md)
  - [2026-04-17-workout-builder-poolside-operational-polish-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-17-workout-builder-poolside-operational-polish-10-10.md)
- Primary implementation surfaces:
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx)
  - [/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx](/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx)
  - [/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts)
- Locked product decision for this brief:
  - `View` should preserve the same section color rules as the other modes,
  - it may use a calmer/lower-intensity variant,
  - but should not become fully neutral if that removes useful structure,
  - `View` should preserve workout order as contiguous blocks rather than globally merging all blocks with the same section title,
  - parent-linked rest should stay inside the block it belongs to when that relationship is semantically clear,
  - standalone `REST` sections should appear only when the rest is truly standalone,
  - row-level ordinal helper copy such as `1 of 4` should be removed when the block structure itself already provides the needed scanability.

## Must Now

- Preserve warmup/main/cooldown section accent mapping in `View`.
- Render `View` in workout order as contiguous section blocks rather than globally merging all blocks with the same section title.
- Keep parent-linked rest inside the parent work or repeat block when the relationship is semantically clear.
- Remove ordinal helper labels such as `1 of N` in `View`.
- Keep mode switching visually coherent.
- Stay within the current clean builder aesthetic.

## Before Live

- Verify `View` remains readable and calm on real session examples.
- Verify structural grouping helps scanability instead of forcing users to relearn the workout in `View`.
- Verify color consistency helps rather than overwhelms the quiet mode.

## Ongoing Cadence

- New mode-specific builder variants should preserve section identity and ordered block semantics unless explicitly rebriefed.
- Future visual polish should treat section accents as structural semantics, not decorative mode-specific garnish.
- Future builder cleanup should not reintroduce helper labels that only compensate for over-merged grouping.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Testing and QA automation`

Strict `10/10` mode for this brief:

- every declared `target` category must close at `5/5`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                           | Evidence                             | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | `View` must preserve the same ordered session-block model as the other modes so users do not need to reinterpret the workout structure after switching mode.             | builder review + screenshot QA       | `5/5`                   |
| UX flow clarity                               | `target`     | Switching between `Edit`, `Rearrange`, and `View` preserves fast structural scanning without extra cognitive reset, redundant ordinal labels, or misleading rest blocks. | screenshot QA + mode-switch review   | `5/5`                   |
| Visual design quality                         | `target`     | `View` keeps useful section accents in a calmer way while the block structure, rest placement, and section rhythm still feel clean and intentional.                      | screenshot QA + code review          | `5/5`                   |
| Business logic correctness and data integrity | `target`     | `View` remains truthful to canonical workout semantics: workout order is preserved, repeated later sections stay distinct, and parent-linked rest is not misrepresented. | code review + targeted builder tests | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this is owner-facing builder mode polish, not admin/editor workflow.                                                                                         | explicit scope rationale             | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: preserved section identity and rest grouping should improve scanability without relying on color alone or weakening existing labels/button semantics.   | accessibility review + code review   | `4/5`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because this is a tiny builder-view polish slice with no meaningful route-level performance contract change.                                                         | explicit scope rationale             | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this brief changes presentational grouping only and does not alter local/server ownership or persistence rules.                                              | explicit scope rationale             | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no cache behavior changes in this view-mode slice.                                                                                                           | explicit scope rationale             | `N/A`                   |
| Reliability and failure handling              | `N/A`        | N/A because no failure-path, save-flow, or mutation contract changes in this slice.                                                                                      | explicit scope rationale             | `N/A`                   |
| Security and authz                            | `N/A`        | N/A because no auth/security behavior changes in this slice.                                                                                                             | explicit scope rationale             | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no data/privacy contract changes.                                                                                                                            | explicit scope rationale             | `N/A`                   |
| Content governance                            | `supporting` | Supporting only: section labels, rest wording, and section accents must continue to reflect the real underlying workout structure truthfully.                            | code review + UI review              | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow changes here.                                                                                                                              | explicit scope rationale             | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is an authenticated builder surface.                                                                                                                    | explicit scope rationale             | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public discoverability contract changes.                                                                                                                  | explicit scope rationale             | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no event instrumentation changes in this private builder polish slice.                                                                                       | explicit scope rationale             | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, billing, or entitlement flow changes.                                                                                                            | explicit scope rationale             | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because no ops/support workflow changes in this slice.                                                                                                               | explicit scope rationale             | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance/reporting changes.                                                                                                                                | explicit scope rationale             | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this slice changes no locale architecture and only preserves current builder structure semantics.                                                            | explicit scope rationale             | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the current builder styling system, grouping model, and section accent patterns with zero new dependency or alternate rendering system.                            | dependency diff + style review       | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted tests or screenshot QA lock the ordered-block, parent-rest, and color-consistency contracts so later mode polish does not regress them.                         | targeted QA + verify evidence        | `5/5`                   |
| Scalability and cost efficiency               | `N/A`        | N/A because this is a tiny view-mode consistency fix with no meaningful cost/scaling impact.                                                                             | explicit scope rationale             | `N/A`                   |
| DevOps and rollback readiness                 | `N/A`        | N/A because this is a narrowly reversible builder-view polish slice with no migration or operational impact.                                                             | explicit scope rationale             | `N/A`                   |

## Data Placement And Sync Contract

- `N/A`
- Rationale:
  - this brief changes only presentational structure, rest grouping, and section accent behavior across existing builder modes.

## Identity And Rename Contract

- `N/A`
- Rationale:
  - no persisted entity, route param, or canonical identifier changes in this slice.

## Scope

- Preserve section accent/color mapping in `View`.
- Render `View` in workout order as contiguous section blocks rather than globally merging all blocks with the same section title.
- Keep rest attached to the parent work/repeat block when that relationship is semantically clear.
- Render a standalone `REST` section only when the rest is truly standalone and cannot truthfully be attached to a parent block.
- Remove row-level ordinal helper copy such as `1 of N` when block order already provides the needed structure.
- Allow a calmer visual intensity if needed.
- Keep the implementation presentation-only: no canonical step schema, save-flow, or Garmin/export contract changes.

## Out Of Scope

- Builder data/model changes.
- Poolside panel or PDF changes.
- Broader builder IA or mode redesign beyond `View` structure polish.

## Acceptance Criteria

1. `Warmup`, `Main`, and `Cooldown` retain useful visual section identity in `View`.
2. `View` preserves the real workout order and does not globally merge non-contiguous `Warmup`, `Main`, `Cooldown`, or `Rest` blocks.
3. Rest that belongs to a preceding work step or repeat block renders inside that parent block instead of as a separate `REST` container.
4. Standalone `REST` sections appear only when the rest is intentionally standalone.
5. Row labels like `1 of N` are removed when they only compensate for the old merged-section model.
6. Mode changes between `Edit`, `Rearrange`, and `View` feel more consistent and easier to scan.
7. `View` remains calm and clean rather than loud or decorative.

## Validation

- `npm run lint:briefs`
- `npx vitest run tests/unit/workout-builder-hub.test.tsx`
- targeted builder screenshot or component QA for mode switching and real-session scanability
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm installed locally.

## Manual QA Environments

- Local builder route with real session examples across all three modes.
- PR preview after implementation.

## Constraints

- Keep the existing clean builder aesthetic.
- Do not make `View` fully neutral if it removes useful structural scanning.
- Do not reintroduce helper labels that only compensate for over-merged grouping.
- Prefer tiny, low-risk changes.

## 10/10 Quality Bar

- Same structural sections should feel like the same sections in every mode.
- View should be calmer, not emptier.
- The user should not have to re-learn the session structure every time they switch mode.
- Rest should live where swimmers expect to read it.
- Ordered blocks should do the scanability work that `1 of N` helper labels currently try to compensate for.

## Checkpoint Log

- `2026-04-19 | implementation start | moved the brief to in-progress on branch feat/builder-view-mode-structure-rest-color after confirming the current view-mode renderer still globally merges sections by title, emits ordinal helper labels, and leaves view-mode section treatment more neutral than the brief allows | next: switch view grouping to contiguous ordered blocks, keep parent-linked rest inside its block, restore calm section accents, and update targeted tests/screenshots before approval`
- `2026-04-19 | implementation + targeted validation | view mode now groups contiguous sections in workout order instead of globally merging by title, removes the old 1-of-N helper labels, keeps parent-linked rest inside the parent line, and restores calm warmup/main/cooldown section accents in the view renderer; targeted unit coverage and scoped eslint both passed, and screenshot artifacts were captured from a real saved workout route for owner review before repo gates | validation: npx vitest run tests/unit/workout-builder-hub.test.tsx; npx eslint components/my-library/workouts/WorkoutEditor.tsx tests/unit/workout-builder-hub.test.tsx; output/playwright/2026-04-19-builder-view-mode-structure/{reference-builder-edit-mode-desktop.png,reference-builder-rearrange-mode-desktop.png,after-builder-view-mode-desktop.png,after-builder-view-mode-mobile.png} | next: owner screenshot approval, then npm run verify:pre-pr, PR, and npm run verify:pre-merge`
- `2026-04-19 | owner approval + pre-pr gate green | owner approved the screenshot review, the first full pre-pr attempt was blocked by an unrelated admin-preview data-timeout flake, and the second full run passed end-to-end with verify-open PASS (103 passed / 335 skipped in Playwright); builder view-mode scope remains isolated to WorkoutEditor + targeted builder tests + this brief | validation: npm run verify:pre-pr | next: commit, push, open/update PR, then run npm run verify:pre-merge and monitor CI`
