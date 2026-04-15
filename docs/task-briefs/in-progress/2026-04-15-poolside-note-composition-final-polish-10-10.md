# Task Brief: Poolside Note Composition Final Polish (10/10)

## Metadata

- `id`: `2026-04-15-poolside-note-composition-final-polish-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-15`
- `updated`: `2026-04-15`

## Goal

Make the poolside note genuinely 10/10 in portrait and landscape by tightening density, calming the hero, improving type scale, and rendering rest semantics inside the same workout block instead of as misaligned separate rows.

## Why This Brief Exists

- Owner review after the header-clarity slice surfaced four remaining quality gaps:
  - too much free vertical space for a lane-side working sheet,
  - landscape still feels more designed than operational,
  - the type scale is uneven, with some hero elements oversized and some metadata too small,
  - and rest semantics still read as separate blocks instead of belonging to the interval they support.
- Current implementation confirms those concerns:
  - large hero/title spacing and `30px` title weight in [shared.ts](/Users/stianvikra/freeswimming/lib/workouts/shared.ts#L1735),
  - wide landscape right-side tagline block in [shared.ts](/Users/stianvikra/freeswimming/lib/workouts/shared.ts#L1789),
  - tall line padding in [shared.ts](/Users/stianvikra/freeswimming/lib/workouts/shared.ts#L1978),
  - and recovery rendered either inline as one long string or as its own recovery row in [shared.ts](/Users/stianvikra/freeswimming/lib/workouts/shared.ts#L3204).
- The final contract needs to reflect the owner’s explicit rule:
  - rest stays in the same block as the work interval,
  - same line if it fits,
  - otherwise wrapped onto a second internal line inside the same block,
  - not as a separate blue row unless it is a truly standalone recovery phase.

## Dependencies And Boundaries

- Parent builder/runtime brief:
  - [2026-02-28-workout-builder-and-poolside-execution-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md)
- Direct predecessor:
  - [2026-04-15-poolside-note-header-clarity-and-landscape-parity-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-15-poolside-note-header-clarity-and-landscape-parity-10-10.md)
- Required sibling closeout before claiming 10/10:
  - [2026-04-15-poolside-note-popup-stability-and-print-delivery-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-15-poolside-note-popup-stability-and-print-delivery-10-10.md)
- Primary implementation surfaces:
  - [shared.ts](/Users/stianvikra/freeswimming/lib/workouts/shared.ts)
  - [workouts-shared.test.ts](/Users/stianvikra/freeswimming/tests/unit/workouts-shared.test.ts)
  - [workout-builder-hub.test.tsx](/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx)
  - [my-library-workout-builder.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts)
- Locked boundaries:
  - no workout-schema changes,
  - no new print variant,
  - no brand-system redesign outside the poolside print artifact,
  - no copy change outside the poolside note surface.

## Product Direction Locked By This Brief

1. The poolside note is a lane-side operational artifact first.
2. Portrait and landscape must both feel intentional, but neither should read like a poster.
3. Vertical density must be tighter so longer sessions do not become excessively tall.
4. Rest belongs to the work block it modifies.
5. If rest fits inline, it may stay on the same line.
6. If the line becomes too long, rest should wrap to a second internal line inside the same block.
7. `Interval rest` should describe between-rep rest.
8. `Set rest` should describe post-set rest.
9. `Rest` should be used for a standalone single recovery phase.
10. Separate highlighted recovery rows should remain only for truly standalone recovery phases, not for interval/set rest that belongs to the work line.
11. Heading sizes and support pills must be readable but not oversized.
12. Landscape tagline treatment must be quieter than the workout title and total.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this slice:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Testing and QA automation`

Strict `10/10` mode for this brief:

- every declared `target` category must close at `5/5`

| Category                                      | Mapping      | Threshold For This Brief                                                                                                                                              | Evidence                                  | Expected Closeout |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------- |
| Product goals and IA                          | `target`     | Portrait and landscape must both read as fast lane-side workout sheets where title, total, swimmer identity, focus, and step list are immediately understandable.     | screenshot review + code review           | `5/5`             |
| UX flow clarity                               | `target`     | Interval rest and set rest must stay semantically attached to the relevant work block, with wrap-inside-block behavior instead of a visually detached rest row.       | screenshot review + targeted unit/e2e     | `5/5`             |
| Visual design quality                         | `target`     | Hero hierarchy, type scale, spacing, and rhythm must look premium but operational in both portrait and landscape, with no oversized poster treatment.                 | screenshot review + print-preview QA      | `5/5`             |
| Business logic correctness and data integrity | `target`     | Updated rest wording and line layout must preserve the true underlying workout semantics, including interval-rest vs post-set-rest distinction.                       | unit coverage + code review               | `5/5`             |
| Admin editor ergonomics                       | `supporting` | Builder controls and preview actions must remain understandable after the denser poolside output changes.                                                             | builder QA + targeted e2e                 | `4/5`             |
| Accessibility (a11y)                          | `supporting` | Text sizes, contrast, and wrapped second-line recovery text must remain legible and semantically grouped.                                                             | screenshot review + targeted browser QA   | `4/5`             |
| Performance (CWV + payloads)                  | `supporting` | The polish must stay within the existing print renderer and add no new dependency or heavy runtime logic.                                                             | diff review + verify evidence             | `4/5`             |
| Data placement and sync boundaries            | `target`     | All polish stays presentation-only; no new persisted print preferences or data writes are introduced.                                                                 | brief contract + code review              | `5/5`             |
| Caching and invalidation strategy             | `supporting` | Updated layout must continue to reflect current local draft state and print options immediately on each open.                                                         | builder QA + targeted e2e                 | `4/5`             |
| Reliability and failure handling              | `supporting` | Long titles, long swimmer names, long rest labels, and many-set sessions must degrade gracefully without collisions or unreadable blocks.                             | screenshot review + targeted tests        | `4/5`             |
| Security and authz                            | `N/A`        | N/A because this slice changes presentation only and no authorization contract.                                                                                       | explicit scope rationale                  | `N/A`             |
| Privacy and compliance                        | `N/A`        | N/A because the slice changes no data exposure or compliance behavior.                                                                                                | explicit scope rationale                  | `N/A`             |
| Content governance                            | `target`     | Rest wording, title hierarchy, and support labels must stay in clear swimmer-facing English with no internal implementation phrasing.                                 | code review + screenshot review           | `5/5`             |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow or mutable admin surface changes here.                                                                                                  | explicit scope rationale                  | `N/A`             |
| SEO and crawlability                          | `N/A`        | N/A because this slice changes only an owner-only print surface.                                                                                                      | explicit scope rationale                  | `N/A`             |
| AI discoverability                            | `N/A`        | N/A because no public metadata or retrieval contract changes here.                                                                                                    | explicit scope rationale                  | `N/A`             |
| Analytics and KPI observability               | `N/A`        | N/A because the slice adds no analytics contract.                                                                                                                     | explicit scope rationale                  | `N/A`             |
| Commerce and revenue ops                      | `N/A`        | N/A because the scope has no pricing, billing, or entitlement effect.                                                                                                 | explicit scope rationale                  | `N/A`             |
| Incident response and support operations      | `N/A`        | N/A because this slice changes no runbook or escalation process; it only polishes the poolside print artifact.                                                        | explicit scope rationale                  | `N/A`             |
| Finance and reporting operations              | `N/A`        | N/A because the scope has no reporting or finance impact.                                                                                                             | explicit scope rationale                  | `N/A`             |
| i18n operational readiness                    | `N/A`        | N/A because the slice keeps the current English-only poolside output contract and adds no locale architecture.                                                        | explicit scope rationale                  | `N/A`             |
| Stack-fit and dependency discipline           | `target`     | The polish must stay in the existing poolside HTML/CSS renderer and test stack, with no new dependency.                                                               | diff review + validation evidence         | `5/5`             |
| Testing and QA automation                     | `target`     | Unit and e2e coverage must lock the updated rest contract, the denser layout behavior, and the portrait/landscape hierarchy expectations before merge recommendation. | updated tests + browser QA + verify gates | `5/5`             |
| Scalability and cost efficiency               | `supporting` | The resulting layout should reduce future vertical bloat and print drift rather than adding more ad hoc exceptions.                                                   | code review                               | `4/5`             |
| DevOps and rollback readiness                 | `supporting` | The slice must remain a reversible code-only visual contract change.                                                                                                  | PR diff + rollback simplicity             | `4/5`             |

## Data Placement And Sync Contract

- Server-canonical data:
  - unchanged; saved workout content remains canonical.
- Local data:
  - current print style, print layout, and currently selected focus points remain local preview inputs only.
- Sync policy:
  - no new persistence of poolside layout choices is added,
  - no presentation choice may write back into workout rows.
- Retention and sensitivity:
  - unchanged from current owner-scoped preview contract.
- Cache/invalidation:
  - the preview must rebuild from current draft + current print options on each open.

## Identity And Rename Contract

- `N/A`
- Rationale:
  - no entity, slug, route parameter, or persistent identifier changes in this slice.

## Scope

- Tighten poolside vertical density in portrait and landscape.
- Rebalance type scale so title/support text/readability are calmer and more operational.
- Further tone down landscape tagline treatment.
- Keep total and swimmer metadata readable without oversized hero treatment.
- Render interval/set rest inside the same work block:
  - same line if space allows,
  - second internal line inside the same block if wrapping is needed.
- Use swimmer-facing rest wording:
  - `Interval rest`
  - `Set rest`
  - `Rest`
- Preserve a separate recovery row only for truly standalone recovery phases.
- Update tests to lock the new line contract and hierarchy.
- Run portrait/landscape visual QA.

## Out Of Scope

- Popup/print delivery stability mechanics.
- Builder action row redesign.
- Saved-session metadata panel cleanup.
- Workout-schema changes.

## Acceptance Criteria

1. Portrait and landscape both feel compact enough for long sessions without looking cramped.
2. Heading sizes and hero spacing are calmer and no longer feel overbuilt for a poolside sheet.
3. Interval/set rest stays inside the relevant work block rather than appearing as a detached highlighted row.
4. When rest text is too long, it wraps to a second internal line in the same block instead of creating a separate rest row.
5. Standalone recovery phases still render clearly as their own recovery item only when semantically separate.
6. Landscape reads title-first and no longer lets the tagline compete with the workout.
7. Relevant unit/e2e coverage and full repo gates pass.

## Validation

- targeted unit:
  - `npx vitest run tests/unit/workouts-shared.test.ts tests/unit/workout-builder-hub.test.tsx tests/unit/workouts-routes.test.ts`
- targeted e2e:
  - `npx playwright test tests/e2e/my-library-workout-builder.spec.ts`
- browser QA:
  - local portrait preview screenshot
  - local landscape preview screenshot
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local environment:
  - builder route with poolside portrait and landscape previews
  - desktop Chromium
  - desktop Safari/WebKit-equivalent where feasible
- Preview environment:
  - PR Vercel preview after push

## Constraints

- Keep copy in English.
- Do not let the visual polish weaken scan speed.
- Do not reintroduce separate decorative rest rows for interval/set rest.
- Do not add a new dependency or new print variant.

## 10/10 Quality Bar

- A swimmer should be able to stand on deck and scan title, total, focus, and first sets immediately.
- Long workouts must remain compact enough to print cleanly.
- Recovery wording must feel human and operational, not system-like.
- Rest should behave like part of the set, not a detached card.
- Portrait and landscape should feel like the same system, each tuned for its own page shape.

## Help/Guide Impact

- `N/A`
- Rationale:
  - this slice changes poolside print composition only and no owner-facing help contract.

## Checkpoint Log

- `2026-04-15 | implementation start | created a dedicated final-polish brief after owner review confirmed that spacing is still too tall, rest still feels mispositioned, and the current type scale is not yet calm enough for a lane-side artifact | next: tighten density, restructure rest rendering inside work blocks, and re-evaluate portrait and landscape with visual QA`
- `2026-04-15 | implementation complete | tightened hero/body density, reduced oversized typography, moved interval/set rest into the same workout block with wrap-inside-block behavior, and locked the new semantics in unit/e2e coverage | next: include this slice in poolside final-polish PR closeout and pre-merge validation`
