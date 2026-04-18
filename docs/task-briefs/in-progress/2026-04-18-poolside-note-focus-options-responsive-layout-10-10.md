# Task Brief: Poolside Note Focus Options Responsive Layout (10/10)

## Metadata

- `id`: `2026-04-18-poolside-note-focus-options-responsive-layout-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-18`
- `updated`: `2026-04-18`

## Goal

Rework the `Session Focus` + `Print options` area so it feels 10/10 across mobile, tablet, and desktop, with natural page scroll, responsive stacking/splitting, and a clearer abbreviations disclosure control.

## Why This Brief Exists

- The current panel can preserve too much empty space, feel overly desktop-split on the wrong widths, and risks long focus lists fighting the options panel for space.
- The owner locked several interaction rules:
  - do not use tabs,
  - do not rely on nested scrolling inside the focus list,
  - prefer one natural page scroll,
  - let `Print options` flow below the focus list when focus content is long,
  - use side-by-side only when both sections still feel balanced.
- The `Abbreviations` control also needs to more clearly look interactive and use space better.

## Dependencies And Boundaries

- Current poolside lineage:
  - [2026-04-15-poolside-note-composition-final-polish-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-15-poolside-note-composition-final-polish-10-10.md)
- Locked product decisions for this brief:
  - no tabs,
  - no nested focus-list scroll,
  - mobile should stack calmly,
  - tablet should adapt rather than forcing a desktop split too early,
  - desktop may use side-by-side only when it improves readability,
  - the whole `Abbreviations` row should be clickable with a calm rotating chevron/caret,
  - legend layout should respond from 1 -> 2 -> 3 columns only when readability stays clean,
  - add `Mod = Moderate`.

## Must Now

- Remove layout dependence on nested scroll inside the focus list.
- Make the focus/options relationship responsive and content-aware.
- Make `Abbreviations` clearly expandable/clickable.
- Preserve accessibility and calm visual hierarchy.

## Before Live

- Verify short, medium, and long focus lists across mobile/tablet/desktop.
- Verify long focus descriptions do not trap layout into dead gutters or cramped controls.
- Verify the abbreviations disclosure remains discoverable and accessible across widths.

## Ongoing Cadence

- Future poolside panel additions should respect natural page scroll first.
- New print-option groups should not force tabs or rigid splits unless explicitly rebriefed.
- New abbreviations should stay aligned with the notation system used in actual output.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Visual design quality`
- `Accessibility (a11y)`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                              | Evidence                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Session focus and print options have one clear responsive relationship across mobile/tablet/desktop without hidden tabs or accidental dead-space structure. | responsive QA + layout review           | `5/5`                   |
| UX flow clarity                               | `target`     | All options remain easy to discover, no hidden settings sit behind tabs, and long focus lists do not make later items easy to miss.                         | responsive QA + user-flow review        | `5/5`                   |
| Visual design quality                         | `target`     | Layout feels calm, readable, and balanced across breakpoints, with no rigid split preserved at the cost of whitespace or cramping.                          | screenshot QA + breakpoint review       | `5/5`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: panel layout changes must preserve the actual option state and print-preview behavior.                                                     | code review + state behavior review     | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this is an owner-facing builder/support surface, not an admin-editor workflow.                                                                  | explicit scope rationale                | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Expand/collapse semantics, labels, groups, and keyboard flow remain clear, with no overflow traps caused by the new responsive behavior.                    | a11y review + targeted tests            | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: the responsive improvement must stay inside the current component/model with no heavy new dependency or obvious runtime cost.              | diff review + verify evidence           | `4/5`                   |
| Data placement and sync boundaries            | `supporting` | Supporting only: all changed state remains local preview/editor state with no new persistence path.                                                         | brief contract + state review           | `4/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this brief changes responsive layout and disclosure behavior only, not route cache policy.                                                      | explicit scope rationale                | `N/A`                   |
| Reliability and failure handling              | `supporting` | Supporting only: long lists, long descriptions, and narrow widths should degrade gracefully without layout traps or unreadable controls.                    | responsive QA + targeted tests          | `4/5`                   |
| Security and authz                            | `N/A`        | N/A because this slice changes no auth boundary or protected write behavior.                                                                                | explicit scope rationale                | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no data collection or disclosure contract changes.                                                                                              | explicit scope rationale                | `N/A`                   |
| Content governance                            | `supporting` | Supporting only: abbreviations content should stay aligned with the real notation system used by poolside output.                                           | legend review + output review           | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD/status flow changes in this brief.                                                                                                | explicit scope rationale                | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is an owner-only builder panel.                                                                                                            | explicit scope rationale                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public route or semantic contract changes.                                                                                                   | explicit scope rationale                | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this brief does not add event instrumentation.                                                                                                  | explicit scope rationale                | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, or entitlement path changes.                                                                                              | explicit scope rationale                | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this is a local preview/options surface and no support/escalation workflow is changed.                                                          | explicit scope rationale                | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance/reporting workflow changes in this brief.                                                                                            | explicit scope rationale                | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this slice changes English owner-facing panel layout only and does not alter locale architecture.                                               | explicit scope rationale                | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the current poolside panel/component patterns with zero new dependency and narrow layout/interactivity changes.                                       | architecture review + dependency diff   | `5/5`                   |
| Testing and QA automation                     | `target`     | Responsive layout and abbreviations disclosure behavior are covered by targeted tests and visual QA where contracts change.                                 | targeted tests + screenshot QA + verify | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the panel should handle longer focus lists without pushing the product toward more brittle complexity or unnecessary UI chrome.            | layout review + content-scaling QA      | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: this remains a reversible UI/layout change with no schema or migration impact.                                                             | PR rollback review                      | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - unchanged saved session/workout content.
- Local-only:
  - session focus selection,
  - print options state,
  - abbreviations panel open/closed state.
- Sync policy:
  - no new persistence added,
  - responsive behavior and disclosure state remain local preview/editor concerns only.
- Retention and sensitivity:
  - unchanged from current owner-scoped builder preview model.
- Cache/invalidation:
  - no route cache change; preview updates remain immediate from local state.

## Identity And Rename Contract

- `N/A`
- Rationale:
  - no persisted entities, IDs, slugs, or route params change in this brief.

## Scope

- Responsive relationship between `Session Focus` and `Print options`.
- Natural page-scroll-first layout behavior.
- Content-aware stacking vs side-by-side behavior across breakpoints.
- `Abbreviations` disclosure affordance and responsive legend layout.
- Add `Mod = Moderate`.

## Out Of Scope

- Print/PDF output width/composition logic.
- New tab navigation model.
- Workout/session schema changes.
- Broader builder mode/color consistency outside this panel.

## Acceptance Criteria

1. Mobile stacks calmly with no cramped controls or wasted space.
2. Tablet adapts naturally instead of forcing a desktop split too early.
3. Desktop uses side-by-side only when it genuinely improves readability.
4. Long focus lists use natural page scroll and do not trap content behind nested scroll.
5. The `Abbreviations` row is clearly interactive, fully clickable, and uses an accessible rotating chevron/caret.
6. The legend layout responds cleanly across 1, 2, and only-if-clean 3 columns.
7. `Mod = Moderate` is included and legend content stays aligned with actual notation.

## Validation

- `npm run lint:briefs`
- targeted responsive tests for changed panel behavior
- targeted screenshot QA across mobile/tablet/desktop
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm installed locally.

## Manual QA Environments

- Local poolside builder/panel on mobile, tablet, and desktop widths.
- PR preview after implementation.

## Constraints

- Do not use tabs.
- Do not rely on nested scroll in the focus list.
- Prefer optical balance over rigid mechanical split.
- Preserve the existing visual language.

## 10/10 Quality Bar

- Mobile: stacked, calm, readable.
- Tablet: adaptive, not forced into desktop too early.
- Desktop: side-by-side only when helpful.
- No dead gutters or overflow traps.
- Abbreviations control clearly looks expandable and stays calm.

## Checkpoint Log

- `2026-04-18 | implementation start | moved the brief from planned to in-progress on branch \`feat/poolside-note-focus-options-responsive-layout\` and scoped the work to \`PoolsideNotePanel\`, the poolside notation legend, and targeted panel tests so the focus/options area can switch between stacked and split layouts without nested scrolling | next: implement the responsive layout/disclosure changes, add targeted coverage, and run visual + verify gates before PR handoff`
- `2026-04-18 | responsive layout + legend update implemented | updated \`PoolsideNotePanel\` to use content-aware stacked vs split containment, removed nested focus-list scrolling, made the abbreviations row a full-width disclosure, added \`Mod = Moderate\` to the shared poolside legend, and confirmed the empty-focus state now stays stacked instead of forcing a dead desktop split | next: run brief lint + full verify gates, then prepare commit/PR handoff`
- `2026-04-18 | validation gates green before PR handoff | passed targeted poolside/workout vitest coverage, responsive screenshot QA across mobile/tablet/desktop, \`npm run lint:briefs -- --all\`, and full \`npm run verify:pre-pr\`; removed temporary QA artifacts before staging the branch | next: commit the scoped diff, push the branch, open/update the PR, run \`npm run verify:pre-merge\`, and watch CI to merge readiness`
