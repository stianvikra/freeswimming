# Task Brief: Poolside Note Header Clarity And Landscape Parity (10/10)

## Metadata

- `id`: `2026-04-15-poolside-note-header-clarity-and-landscape-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-15`
- `updated`: `2026-04-15`

## Goal

Make the poolside note header and poolside line contract more truthful and more premium by removing ambiguous estimated-time hero copy, promoting total distance into the header, toning down the brand tagline, eliminating duplicated effort labels, compressing rest presentation, and giving landscape its own 10/10 composition instead of a stretched portrait header.

## Why This Brief Exists

- The shipped poolside brand-surface rewrite improved hierarchy and brand presence, but the next owner review surfaced one real contract problem and one real design problem:
  - the header still inherits session-summary copy that can include an estimated duration such as `~21 min`, even though that estimate is not strong enough to present as lane-side truth,
  - and the next visual direction for brand/tagline needs different placement in landscape rather than a portrait-style copy widened across the page.
- The next review also surfaced two line-output contract problems:
  - work lines can repeat the same effort twice, such as `Easy · Easy`, because the current poolside output combines both step intensity and an effort-target label even when they resolve to the same visible word,
  - and rest rows currently consume too much vertical space when they are rendered as large separate blocks between many intervals.
- The current estimated-duration value is a computed planning estimate, not a guaranteed swimmer-facing execution truth:
  - distance steps are converted using pace assumptions in [shared.ts](/Users/stianvikra/freeswimming/lib/session-generator-v1/shared.ts#L643),
  - and those pace assumptions come from target pace, CSS offset, or base pace plus intensity multiplier in [shared.ts](/Users/stianvikra/freeswimming/lib/session-generator-v1/shared.ts#L892).
- For the poolside note specifically, owner feedback is correct:
  - title and total matter more than a global estimated duration,
  - per-step prescription matters more than session-level effort shorthand in the hero,
  - and the lane-side print should read as an operational artifact first, not a poster with mixed metadata confidence.

## Dependencies And Boundaries

- Parent builder/runtime brief:
  - [2026-02-28-workout-builder-and-poolside-execution-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md)
- Direct predecessor for the currently shipped poolside print contract:
  - [2026-04-15-poolside-note-brand-surface-reframe-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-15-poolside-note-brand-surface-reframe-10-10.md)
- Primary implementation surfaces expected in scope:
  - [shared.ts](/Users/stianvikra/freeswimming/lib/workouts/shared.ts)
  - [workouts-shared.test.ts](/Users/stianvikra/freeswimming/tests/unit/workouts-shared.test.ts)
  - [my-library-workout-builder.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts)
- Locked boundaries:
  - no workout-schema changes,
  - no changes to workout-step semantics,
  - no changes to exported canonical data fields,
  - no rewrite of step-level poolside semantics beyond the compact display contract defined here,
  - no change to the standard full-session PDF hero,
  - no public marketing-poster route.

## Product Direction Locked By This Brief

1. The poolside note hero must prefer truthful lane-side information over mixed-confidence planning metadata.
2. Estimated total time must not appear in the poolside hero.
3. Session-level effort must not be required in the poolside hero.
4. Total distance belongs in the hero/header composition rather than a separate oversized body card.
5. `Learn. Drill. Swim.` may remain as a secondary brand signal, but it must be toned down below title-first hierarchy.
6. Landscape must get its own header placement logic and spacing rhythm, not a widened portrait copy.
7. Portrait and landscape should share one visual system, but not one identical geometry.
8. Poolside work lines must never show the same effort twice, such as `Easy · Easy` or `Moderate · Moderate`.
9. Poolside work lines should show exactly one effort/target slot:
   - pace/CSS target when present,
   - otherwise effort target,
   - otherwise step intensity.
10. Interval rest that belongs directly to a work interval should be compressed onto the same line as that work interval.
11. Standalone rest should remain available as its own line only when it represents a separate recovery phase rather than interval rest.
12. `Final rest skipped` must not appear in the poolside output.
13. The preferred rest wording is:

- `Interval rest 0:30`
- `Rest 0:40`

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this slice:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Content governance`
- `Testing and QA automation`

Strict `10/10` mode for this brief:

- every declared `target` category must close at `5/5`

| Category                                      | Mapping      | Threshold For This Brief                                                                                                                                                                                                      | Evidence                                             | Expected Closeout |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------- |
| Product goals and IA                          | `target`     | The poolside hero must read in this order: brand, title, total, swimmer, then first actionable content, with no ambiguous estimated-duration hero copy.                                                                       | screenshot review + code review                      | `5/5`             |
| UX flow clarity                               | `target`     | A swimmer should identify title, total distance, swimmer identity, and work/rest structure immediately in both portrait and landscape without parsing duplicate effort labels or oversized rest blocks.                       | screenshot review + manual QA + targeted e2e         | `5/5`             |
| Visual design quality                         | `target`     | Portrait and landscape headers must each feel intentionally composed, premium, and balanced, with toned-down tagline treatment, no stretched geometry, and compact line rhythm that avoids unnecessary vertical growth.       | screenshot review + print-preview QA                 | `5/5`             |
| Business logic correctness and data integrity | `supporting` | Presentation changes must not alter stored totals, step semantics, focus content, or export truthfulness; inline interval rest must stay semantically correct.                                                                | targeted unit/e2e + code review                      | `4/5`             |
| Admin editor ergonomics                       | `supporting` | Builder preview/open flow must stay coherent with the updated print artifact and not introduce confusion about what the owner is opening.                                                                                     | builder QA + targeted e2e                            | `4/5`             |
| Accessibility (a11y)                          | `supporting` | Heading order, readable contrast, and swimmer/title identification must remain clear in the print preview.                                                                                                                    | code review + targeted coverage                      | `4/5`             |
| Performance (CWV + payloads)                  | `supporting` | The redesign must stay code-only within the existing print renderer and not add new dependencies or heavy runtime cost.                                                                                                       | build/verify evidence + diff review                  | `4/5`             |
| Data placement and sync boundaries            | `target`     | The slice must remain presentation-only: no new persisted data, no change to canonical totals, and no writeback from print layout decisions.                                                                                  | brief contract + code review                         | `5/5`             |
| Caching and invalidation strategy             | `supporting` | Updated print output must still reflect the current local draft and print options immediately when the preview is opened.                                                                                                     | existing preview flow + targeted e2e                 | `4/5`             |
| Reliability and failure handling              | `supporting` | Long titles, long swimmer names, no-focus layouts, and landscape mode must degrade gracefully without overlapping or unreadable header content.                                                                               | screenshot review + targeted unit assertions         | `4/5`             |
| Security and authz                            | `N/A`        | N/A because this slice changes no auth, ownership, or protected-route behavior; it only refines authenticated print presentation.                                                                                             | explicit scope rationale                             | `N/A`             |
| Privacy and compliance                        | `supporting` | The header must continue to expose only intentionally chosen swimmer identity and workout summary fields already allowed in the owner flow.                                                                                   | code review + output QA                              | `4/5`             |
| Content governance                            | `target`     | The poolside output must no longer present low-confidence time estimates as equal to truthful workout facts, must not duplicate effort wording, and must use one clear rest vocabulary contract without `Final rest skipped`. | brief contract + updated assertions + QA review      | `5/5`             |
| Admin workflow and editability                | `N/A`        | N/A because this slice changes print composition, not an admin CRUD or publish workflow.                                                                                                                                      | explicit scope rationale                             | `N/A`             |
| SEO and crawlability                          | `N/A`        | N/A because the poolside print surface is private/authenticated and not a crawl target.                                                                                                                                       | explicit scope rationale                             | `N/A`             |
| AI discoverability                            | `N/A`        | N/A because no public metadata, public content semantics, or retrieval surface changes in this print-only slice.                                                                                                              | explicit scope rationale                             | `N/A`             |
| Analytics and KPI observability               | `N/A`        | N/A because success is evaluated through visual QA and test evidence, not new analytics instrumentation.                                                                                                                      | explicit scope rationale                             | `N/A`             |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, or checkout scope changes here.                                                                                                                                                          | explicit scope rationale                             | `N/A`             |
| Incident response and support operations      | `N/A`        | N/A because the slice changes no support workflow, runbook, alerting, or escalation contract; it refines private print composition only.                                                                                      | explicit scope rationale                             | `N/A`             |
| Finance and reporting operations              | `N/A`        | N/A because the scope has no reporting, payout, billing, or reconciliation impact.                                                                                                                                            | explicit scope rationale                             | `N/A`             |
| i18n operational readiness                    | `N/A`        | N/A because this slice keeps the existing English-only private print artifact contract and adds no locale architecture.                                                                                                       | explicit scope rationale                             | `N/A`             |
| Stack-fit and dependency discipline           | `target`     | The change must stay within the existing poolside HTML/CSS renderer and repo-native test stack, with no new dependency.                                                                                                       | dependency diff + code review                        | `5/5`             |
| Testing and QA automation                     | `target`     | Unit and e2e coverage must lock the new header contract for portrait and landscape, and full repo gates must pass before merge recommendation.                                                                                | updated tests + `verify:pre-pr` + `verify:pre-merge` | `5/5`             |
| Scalability and cost efficiency               | `supporting` | The new layout should reduce future design drift by creating explicit portrait/landscape header rules rather than ad hoc conditional hacks.                                                                                   | code review + diff review                            | `4/5`             |
| DevOps and rollback readiness                 | `supporting` | The slice must remain a reversible code-only change with no data migration or deployment coordination burden.                                                                                                                 | PR diff + rollback note                              | `4/5`             |

## Data Placement And Sync Contract

- Server-canonical data:
  - saved workout title, swimmer identity source fields, focus selections, workout totals, and step content remain the only persisted source of truth.
- Local-only data:
  - print style, print layout, popup state, and local draft state remain local to the builder/preview flow.
- Sync policy:
  - this slice must not persist any new header preference,
  - opening the poolside preview must continue to reflect the current local draft plus current local print settings,
  - no presentation-only header decision may write back to the workout row.
- Retention and sensitivity:
  - unchanged from the current owner-scoped workout and poolside preview contract.
- Cache/invalidation:
  - unchanged from the current poolside preview/export contract; preview must rebuild from current state on each open.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the only canonical identity for the poolside artifact.
- Human-readable identifiers:
  - session title and swimmer label remain presentation-layer text sourced from existing canonical data.
- Mutability rules:
  - header labels, tagline weight, and layout placement are renameable/repositionable presentation choices only.
- Rename vs repurpose policy:
  - this slice may change visible hero composition in place,
  - it must not create a second poolside artifact type or alternate route.
- Compatibility contract:
  - existing poolside preview/export actions remain unchanged,
  - landscape and portrait continue to use the same route and variant contract.
- Observability and repair:
  - missing title, long swimmer names, and missing focus states must still fall back gracefully within the updated header layout.

## Scope

- Remove poolside hero reliance on `sessionSummary` as the primary visible summary chip.
- Promote total distance into the poolside hero/header.
- Tone down the `Learn. Drill. Swim.` brand treatment from the heavier concept direction.
- Create a distinct portrait poolside header composition.
- Create a distinct landscape poolside header composition that uses horizontal space deliberately.
- Replace the current poolside work-line assembly so effort/target output never duplicates the same visible label.
- Compress interval rest into the preceding work line when it is semantically attached to that interval set.
- Keep standalone recovery as a separate line only when it represents a distinct recovery phase.
- Remove `Final rest skipped` from poolside output.
- Update tests to lock the new poolside-header contract.
- Update tests to lock the new poolside line contract.
- Run visual QA on both portrait and landscape poolside previews.

## Out Of Scope

- Rewriting `buildSessionTargetSummary` for the entire product.
- Removing estimated duration from generator flows or other non-poolside surfaces.
- Rewriting workout-step authoring semantics or canonical stored target/rest fields.
- Rewriting body-card content outside the header-driven layout changes needed for parity.
- New brand assets or a broader home-page brand-system redesign.

## Acceptance Criteria

1. Poolside portrait header no longer displays estimated-duration hero copy such as `~21 min`.
2. Poolside portrait header no longer requires a session-summary pill to communicate the workout.
3. Total distance appears in the hero/header as a first-class truthful element.
4. The toned-down `Learn. Drill. Swim.` treatment stays visually secondary to the title in both portrait and landscape.
5. Landscape header uses its own placement/composition rather than a portrait layout simply stretched wider.
6. Long title and swimmer-name cases remain readable without collisions or clipped blocks.
7. Poolside work lines never show duplicated effort labels such as `Easy · Easy` or `Moderate · Moderate`.
8. Interval rest is rendered inline with the relevant work line using the agreed wording contract such as `Interval rest 0:30`.
9. Separate standalone recovery lines use the agreed wording contract such as `Rest 0:40`.
10. `Final rest skipped` no longer appears in poolside output.
11. Existing poolside focus inclusion and owner preview behavior remain truthful and intact.
12. Relevant unit/e2e coverage and repo verification gates pass.

## Validation

- `npm run lint:briefs`
- targeted unit:
  - `npx vitest run tests/unit/workouts-shared.test.ts tests/unit/workouts-routes.test.ts tests/unit/workout-builder-hub.test.tsx`
- targeted e2e:
  - `npx playwright test tests/e2e/my-library-workout-builder.spec.ts`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local poolside preview in both:
  - portrait print layout,
  - landscape print layout.
- Browsers/viewports:
  - Desktop Chromium for screenshot and popup verification,
  - Desktop Safari/WebKit-equivalent validation through the existing test/preview flow where feasible.
- Stress cases:
  - long title,
  - long swimmer name,
  - no-focus landscape,
  - focus-present portrait.

## Constraints

- Keep copy in English.
- Do not reintroduce flyer-like marketing hierarchy.
- Keep the visual system aligned with the newly shipped poolside brand-surface baseline.
- Prefer small, explicit layout rules over generalized abstractions.
- Keep the poolside line contract compact enough that long workouts do not become vertically bloated from separate rest blocks.

## 10/10 Quality Bar

- Title-first hierarchy must remain unquestionable.
- Total distance must feel like operational truth, not decorative metadata.
- Tagline presence must strengthen brand without competing with the workout.
- Landscape must feel intentionally art-directed for a wider print canvas.
- The header must look professional enough to print and leave visible on deck.
- Work/rest lines must scan quickly at poolside and avoid redundant wording.
- Interval rest and standalone rest must be visually and semantically distinct without adding unnecessary height.

## Help/Guide Impact

- `N/A`
- Rationale:
  - this slice changes print composition only and does not change owner-facing workflow labels, recovery behavior, or operational guidance.

## Checkpoint Log

- `2026-04-15 | implementation start | created a scoped follow-up brief after owner review rejected ambiguous estimated-time hero copy for the poolside note and requested portrait/landscape-specific header composition with a toned-down tagline | next: implement the updated poolside header contract, run visual QA, and take the slice through full verification`
- `2026-04-15 | scope update | locked the poolside line contract to remove duplicated effort labels, inline interval rest where semantically attached, keep standalone recovery as its own compact line, and drop \`Final rest skipped\` from the output | next: implement the updated header + line contract together so portrait and landscape can be reviewed as one coherent print slice`
- `2026-04-15 | local validation complete | updated the poolside renderer to move total into the header, remove estimated-duration hero copy, give landscape its own composition, compress recovery wording, and harden descriptor deduplication; visual QA screenshots and full \`verify:pre-pr\` passed locally | next: commit, push, open the PR, monitor CI, and run \`verify:pre-merge\` before merge recommendation`
