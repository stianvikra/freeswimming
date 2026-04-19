# Task Brief: Poolside Note Content-Aware Print Sizing And Header Balance (10/10)

## Metadata

- `id`: `2026-04-18-poolside-note-content-aware-print-sizing-and-header-balance-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-18`
- `updated`: `2026-04-19`

## Goal

Make the poolside PDF/note size to content instead of a roomy fixed canvas, with width driven by the rendered session content and header balance that feels compact, polished, and print-first in portrait and landscape.

## Why This Brief Exists

- The current poolside output is already much closer, but it still leaves avoidable whitespace and can stay wider/taller than the actual content needs.
- The owner set a clearer print contract:
  - notation decision first,
  - width driven by title, chips, and the longest rendered session line,
  - note/focus text wraps inside that chosen width instead of widening the whole artifact.
- This is a print-layout/composition pass, not a copy rewrite and not the responsive editor-panel problem.

## Dependencies And Boundaries

- Current active poolside lineage:
  - [2026-04-15-poolside-note-composition-final-polish-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-15-poolside-note-composition-final-polish-10-10.md)
  - [2026-04-15-poolside-note-popup-stability-and-print-delivery-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-15-poolside-note-popup-stability-and-print-delivery-10-10.md)
- Locked product decisions for this brief:
  - the poolside note should size to content,
  - portrait width should be as narrow as possible while staying readable,
  - landscape should use content-aware asymmetry instead of a rigid balanced split,
  - focus/note text may increase height but should not become the primary width driver,
  - use canonical app branding and improve optical balance between left and right header lockups.

## Must Now

- Make portrait and landscape width content-aware rather than roomy by default.
- Reduce unnecessary whitespace from width, row height, and oversized padding.
- Tighten header/branding balance, including left lockup and right `Learn. Drill. Swim.` mark.
- Keep readability high while shrinking the printable footprint.

## Before Live

- Verify very short, medium, and long session compositions.
- Verify long focus text wraps inside the chosen width instead of inflating the full artifact.
- Verify portrait and landscape remain visually related, not like two unrelated print systems.

## Ongoing Cadence

- Future poolside notation or header changes should preserve content-aware sizing.
- New output copy should wrap vertically before widening the artifact unless a rebrief explicitly changes the width driver.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Visual design quality`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                               | Evidence                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Poolside output reads as a compact lane-side artifact where title, chips, and step list define the printable footprint clearly and intentionally.            | screenshot review + print-preview QA    | `5/5`                   |
| UX flow clarity                               | `target`     | Width/height decisions make the printed note easier to scan, with no dead right-side space or oversized vertical slack distracting from the workout content. | screenshot review + print-preview QA    | `5/5`                   |
| Visual design quality                         | `target`     | Portrait and landscape both feel compact, balanced, and polished, with improved brand/header alignment and no mechanically roomy canvas.                     | screenshot review + browser print QA    | `5/5`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: sizing decisions must preserve the actual rendered workout semantics and notation choices.                                                  | code review + output review             | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this brief targets the print artifact itself, not the authoring/editor control surface.                                                          | explicit scope rationale                | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: tighter sizing must remain legible and not collapse contrast or text hierarchy.                                                             | screenshot QA + readability review      | `4/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: stay in the existing renderer with no new dependency or heavy runtime cost.                                                                 | diff review + verify evidence           | `4/5`                   |
| Data placement and sync boundaries            | `target`     | All changes remain presentation-only; no new persisted print preferences or server data writes are introduced.                                               | brief contract + code review            | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: output continues to rebuild deterministically from the current draft plus current print options.                                            | builder/preview QA                      | `4/5`                   |
| Reliability and failure handling              | `supporting` | Supporting only: long names, long lines, long focus text, and multiple row lengths must degrade gracefully without clipping or awkward emptiness.            | visual QA + targeted tests              | `4/5`                   |
| Security and authz                            | `N/A`        | N/A because this slice changes presentation only and no auth contract.                                                                                       | explicit scope rationale                | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no data exposure or compliance contract changes in this print-layout slice.                                                                      | explicit scope rationale                | `N/A`                   |
| Content governance                            | `supporting` | Supporting only: branding, lockups, and swimmer-facing labels must stay aligned with canonical app assets and notation rules.                                | brand review + output review            | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow changes here.                                                                                                                  | explicit scope rationale                | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is an owner-only print surface.                                                                                                             | explicit scope rationale                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public route or semantic contract changes.                                                                                                    | explicit scope rationale                | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this brief adds no analytics contract.                                                                                                           | explicit scope rationale                | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, billing, or entitlement path changes.                                                                                                | explicit scope rationale                | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this slice changes print composition only and no support/escalation workflow.                                                                    | explicit scope rationale                | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance/reporting path changes here.                                                                                                          | explicit scope rationale                | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this slice keeps the current English-only poolside output contract and does not add locale architecture work.                                    | explicit scope rationale                | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Stay inside the current poolside HTML/CSS renderer and test stack with zero new dependency.                                                                  | dependency diff + architecture review   | `5/5`                   |
| Testing and QA automation                     | `target`     | Tests and visual QA lock content-aware sizing behavior, portrait/landscape balance, and header alignment expectations.                                       | targeted tests + screenshot QA + verify | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: more content-aware output should reduce print bloat rather than add special-case complexity.                                                | code review + output review             | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: this remains a reversible code-only print contract change.                                                                                  | PR rollback review                      | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - unchanged saved workout/session content.
- Local-only:
  - current print style/layout/options used to render the preview/output.
- Sync policy:
  - no new persistence of print-width decisions,
  - no output-layout choice may write back into canonical workout/session rows.
- Retention and sensitivity:
  - unchanged from current owner-scoped poolside preview contract.
- Cache/invalidation:
  - output rebuilds from current draft plus current options on each open/render.

## Identity And Rename Contract

- `N/A`
- Rationale:
  - no new entity, slug, route parameter, or persistent identifier changes in this slice.

## Scope

- Content-aware portrait width tightening.
- Content-aware landscape column rebalance and gutter reduction.
- Width driven by title, chips, and longest rendered swim-session line.
- Focus/note text wraps within chosen width and can increase height if needed.
- Header/branding optical balance polish using canonical app logo lockup.
- Swimmer chip proportion/alignment cleanup relative to total chip.

## Out Of Scope

- Print-options/session-focus editor panel layout.
- Abbreviations disclosure interaction.
- Workout/session schema changes.
- Popup/print delivery mechanics.

## Acceptance Criteria

1. Portrait note width tightens to the smallest clean readable footprint for the rendered content.
2. Landscape removes large dead gutter space and uses a more content-aware column balance.
3. Long focus/note text wraps vertically inside the chosen width instead of making the full note wider.
4. Header branding reads more optically balanced on both sides.
5. The output feels compact, intentional, and polished without awkward wraps or crowding.

## Validation

- `npm run lint:briefs`
- targeted poolside unit coverage
- portrait and landscape screenshot QA
- targeted print-preview/browser QA
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm installed locally.

## Manual QA Environments

- Local poolside preview in portrait and landscape.
- PR preview after implementation.

## Constraints

- This is a print-layout/composition pass, not a copy rewrite.
- Prefer optical balance over rigid fixed widths.
- Keep the smallest clean printable footprint without awkward wraps or crowding.
- Do not let note/focus text become the primary width driver.

## 10/10 Quality Bar

- No unnecessary whitespace.
- No wider or taller note than needed.
- Readability and brand quality stay high.
- The printed note feels compact, intentional, and polished.

## Checkpoint Log

- `2026-04-19 | implementation start | moved the brief from planned to in-progress on branch \`feat/poolside-note-content-aware-print-sizing\` and scoped the work to the poolside PDF renderer in \`lib/workouts/shared.ts\`, its route/test contracts, and portrait/landscape visual QA so the print artifact can size to rendered content instead of a roomy fixed canvas | next: implement content-aware portrait/landscape sizing, tighten header balance, add targeted coverage, then run visual + verify gates before PR handoff`
- `2026-04-19 | implementation + targeted QA | shipped content-aware poolside sizing tiers in \`lib/workouts/shared.ts\`, tightened portrait/landscape paddings and header balance, replaced the invalid landscape grid expression with explicit asymmetric columns, and updated \`tests/unit/workouts-shared.test.ts\` to lock width profile, content driver, long-focus wrapping, and long-line expansion; targeted unit coverage passed, and local Playwright popup QA captured portrait/landscape screenshots with the real app flow at 124mm portrait and 188mm landscape for the current local draft (this local env exposed no focus options, so focus-width behavior remains covered by the targeted unit assertions) | next: clean temporary QA artifacts, run \`npm run verify:pre-pr\`, then prepare commit/push/PR handoff`
