# Task Brief: Poolside Note Rest Formatting And Filter Contract Consistency (10/10)

## Metadata

- `id`: `2026-04-20-poolside-note-rest-formatting-and-filter-contract-consistency-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-20`
- `updated`: `2026-04-20`

## Goal

Make poolside note rest styling and placement deterministic across notation, layout, and rest-placement filters so every preview/export state reads consistently and truthfully before `Save image` work starts.

## Sequencing Lock

- Run this brief before [/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-04-20-poolside-note-save-as-image-export-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-04-20-poolside-note-save-as-image-export-10-10.md).
- Run this brief before `maintenance-baseline-pre-live`.
- Keep this as a focused rendering-contract follow-up, not a mixed poolside umbrella.

## Why This Brief Exists

- Current preview states show rest-formatting drift across filters:
  - some rest tokens are blue while others are black,
  - `Separate line` does not consistently move the final rest to its own line,
  - explicit inline vs adaptive auto semantics are currently too easy to confuse,
  - `Complete words`, `Abbreviated`, and `Auto` notation do not yet read like one coherent contract.
- The owner explicitly wants:
  - all rests to follow the same visual language,
  - predictable placement behavior,
  - all filters/options to do what they say,
  - evaluation of the current function before improvement, not just blind patching.
- This brief should lock the rendering contract before image export captures the wrong behavior into a second workflow.

## Current Behavior Evaluation And Improvement Contract

- Implementation must first characterize current behavior across the active matrix:
  - `Portrait` and `Landscape`
  - `Complete words`, `Abbreviated`, and `Auto`
  - `All inline`, `All separate line`, and `Auto`
- That current-state evaluation must identify:
  - which combinations already behave acceptably,
  - which combinations drift in color, placement, or wrapping semantics,
  - whether current `Auto` behavior is per-row mixed instead of note-wide deterministic.
- The improvement pass must then replace ambiguous behavior with one documented contract:
  - styling stays consistent,
  - placement rules stay consistent,
  - filter labels stay truthful,
  - the same workout content does not produce silent semantic drift; only `Auto` may adapt row by row when width/readability requires it.

## Dependencies And Boundaries

- Depends on current poolside preview-owned settings baseline:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-19-poolside-note-preview-owned-print-settings-and-builder-simplification-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-19-poolside-note-preview-owned-print-settings-and-builder-simplification-10-10.md)
- Supporting poolside note lineage:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-19-poolside-note-width-reclaim-flow-notation-and-brand-lockup-followup-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-19-poolside-note-width-reclaim-flow-notation-and-brand-lockup-followup-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-18-poolside-note-content-aware-print-sizing-and-header-balance-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-18-poolside-note-content-aware-print-sizing-and-header-balance-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-18-poolside-note-focus-options-responsive-layout-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-18-poolside-note-focus-options-responsive-layout-10-10.md)
- Likely implementation surfaces:
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/PoolsideNotePanel.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/PoolsideNotePanel.tsx)
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/PoolsidePreviewPageClient.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/PoolsidePreviewPageClient.tsx)
  - [/Users/stianvikra/freeswimming/lib/workouts/poolside-preview.ts](/Users/stianvikra/freeswimming/lib/workouts/poolside-preview.ts)
  - [/Users/stianvikra/freeswimming/app/my-library/workouts/poolside-preview/page.tsx](/Users/stianvikra/freeswimming/app/my-library/workouts/poolside-preview/page.tsx)
  - [/Users/stianvikra/freeswimming/app/api/my-library/workouts/[workoutId]/export/pdf/route.ts](/Users/stianvikra/freeswimming/app/api/my-library/workouts/[workoutId]/export/pdf/route.ts)
  - [/Users/stianvikra/freeswimming/tests/unit/poolside-note-panel.test.tsx](/Users/stianvikra/freeswimming/tests/unit/poolside-note-panel.test.tsx)
  - [/Users/stianvikra/freeswimming/tests/unit/workout-poolside-preview.test.ts](/Users/stianvikra/freeswimming/tests/unit/workout-poolside-preview.test.ts)
- Locked product decisions for this brief:
  - all rest tokens keep one accent treatment across all modes:
    - `Rest`
    - `Interval rest`
    - `Set rest`
    - `R`
    - `IR`
    - `SR`
  - rest placement controls placement only, not whether rests are accent-colored,
  - `All inline` means rests stay inline everywhere and only wrap naturally when line length forces it,
  - `All separate line` means every rest token moves to its own rest line everywhere with no last-row exception,
  - `Auto` is adaptive per row: keep rests inline when the row still reads cleanly and move only the rows that need extra width onto a second rest line,
  - notation mode may shorten wording, but it must not silently change rest-placement semantics,
  - this brief does not add new filters or new persistence.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Testing and QA automation`

Strict `10/10` mode for this brief:

- all `target` categories must close at `5/5`, not only the critical subset.

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                                      | Evidence                                            | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Rest controls must read truthfully: notation changes wording, rest placement changes placement, and preview state must not imply hidden per-row exceptions.                         | screenshot review + workflow QA                     | `5/5`                   |
| UX flow clarity                               | `target`     | Users must be able to switch between `All inline`, `All separate line`, and `Auto` and immediately understand the result without mixed or contradictory note formatting.            | manual QA + targeted e2e                            | `5/5`                   |
| Visual design quality                         | `target`     | All rest tokens must share one accent language and one placement grammar per mode, with no visually random black/blue split and no broken last-row formatting.                      | before/after screenshots + browser QA               | `5/5`                   |
| Business logic correctness and data integrity | `target`     | For every filter combination, the rendered note must follow one deterministic contract with no silent drift between wording mode, placement mode, and actual rendered output.       | unit coverage + matrix review + manual QA           | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes owner-facing preview rendering, not an admin editor workflow.                                                                                        | explicit scope rationale                            | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Rest formatting must remain readable and semantically clear across modes, with filter controls still keyboard-usable, labeled, and focus-visible.                                   | semantic review + targeted QA                       | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: rendering-contract fixes must not materially increase preview latency or add heavyweight client logic.                                                             | diff review + interaction QA                        | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Filter state remains preview-local; rendering fixes must not write back to canonical workout data or create new durable preference storage.                                         | brief contract + code review                        | `5/5`                   |
| Caching and invalidation strategy             | `target`     | The same content and filter state must render the same rest output every time; changing a filter or source workout field must naturally invalidate and recompute the rendered note. | route/render QA + matrix checks                     | `5/5`                   |
| Reliability and failure handling              | `target`     | No filter combination may produce partial rest-contract application, hidden row exceptions, or unstable row-to-row formatting within the same note state.                           | negative-path QA + targeted tests                   | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: the work stays inside the existing owner-facing preview/auth boundary and does not introduce a new public rendering surface.                                       | route review                                        | `4/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because this slice changes note rendering semantics only and does not add collection, sharing, retention, or compliance-sensitive processing.                                   | explicit scope rationale                            | `N/A`                   |
| Content governance                            | `target`     | The rendered wording contract for rests must have one source of truth so `Complete words`, `Abbreviated`, and `Auto` do not drift into undocumented copy variants.                  | code review + regression matrix                     | `5/5`                   |
| Admin workflow and editability                | `target`     | Both saved-workout preview and local-draft preview must follow the same rest-formatting contract so the owner does not debug different semantics on different entry paths.          | workflow QA across both entry paths                 | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this work stays inside the authenticated owner-facing preview flow and does not change crawlable public content or metadata.                                            | explicit scope rationale                            | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public semantic surface or indexable AI-facing content.                                                                                           | explicit scope rationale                            | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this brief does not require new instrumentation; correctness is verified through the render matrix, screenshots, and regression coverage.                               | explicit scope rationale                            | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no billing, entitlements, pricing, or checkout behavior changes in this slice.                                                                                          | explicit scope rationale                            | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this is a narrow private rendering-contract fix and does not create a new operational support surface or incident playbook requirement.                                 | explicit scope rationale tied to preview-only scope | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because this brief does not affect reconciliation, reporting, payouts, or finance-adjacent logic.                                                                               | explicit scope rationale tied to preview-only scope | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this brief stabilizes the current English owner preview wording contract only and does not alter locale architecture or translation operations.                         | explicit scope rationale tied to preview-only scope | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | The fix must stay inside the existing poolside preview renderer and avoid new rendering systems or unnecessary dependencies.                                                        | architecture review + dependency diff               | `5/5`                   |
| Testing and QA automation                     | `target`     | Tests and screenshot handoff must cover the full filter matrix and lock both current-function evaluation and corrected behavior before merge.                                       | targeted tests + screenshot QA + verify             | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: a single deterministic rendering contract should reduce future poolside maintenance cost rather than create more one-off exceptions.                               | architecture review                                 | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: this remains a narrow reversible rendering diff with no migration, schema, or new service dependency.                                                              | PR diff + rollback review                           | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - saved workout/session content,
  - swimmer name,
  - focus content already resolved into the preview,
  - workout-derived step/rest data.
- Local-only:
  - current preview filter state:
    - color mode
    - layout
    - notation mode
    - rest placement
  - transient rendering/debug state needed for local matrix validation.
- Sync policy:
  - preview renders from the current source workout plus current local preview filters,
  - switching filters never mutates the saved workout,
  - local draft preview and saved-workout preview must use the same rendering contract.
- Retention and sensitivity:
  - no new persistent storage,
  - no saved rest-format overrides,
  - no analytics or export history added in this slice.
- Cache/invalidation:
  - preview stays derived from current route state/input state,
  - the same source + same filters must render the same output,
  - any change in source content or filters invalidates the rendered note naturally.

## Identity And Rename Contract

- `N/A`
- Rationale:
  - this brief introduces no new persisted entity, slug, route identifier, or renameable object.

## Scope

- Evaluate and document current rest rendering behavior across the active filter matrix.
- Make rest token color/styling consistent across notation modes.
- Make rest placement behavior consistent across `All inline`, `All separate line`, and `Auto`.
- Remove last-row exceptions where `All separate line` still leaves a rest inline.
- Ensure `Auto` stays adaptive per row while explicit rest-placement modes stay global and truthful.
- Preserve current width-reclaim, brand lockup, and focus layout improvements unless a rest-contract fix directly requires a controlled adjustment.
- Cover both saved-workout and local-draft preview flows.
- Provide screenshot handoff that clearly distinguishes current-state/reference and corrected after-state.

## Out Of Scope

- `Save image` export capability.
- New preview filters or builder settings.
- General poolside redesign unrelated to rest wording/placement consistency.
- Public `guides/poolside` route redesign unless the same renderer contract must be aligned in a later dedicated follow-up.
- Admin-managed abbreviations or taxonomy editing.

## Acceptance Criteria

1. `Rest`, `Interval rest`, `Set rest`, `R`, `IR`, and `SR` use the same accent styling across all notation and layout modes.
2. `All inline` keeps rests inline everywhere, with only natural line wrapping when width forces it.
3. `All separate line` moves all rests to their own line everywhere, including the final row.
4. `Auto` stays adaptive per row: short rows can remain inline, long rows can move rests onto a second line, and both outcomes keep the same accent styling.
5. `Complete words`, `Abbreviated`, and `Auto` notation change wording only; they do not silently change placement semantics.
6. `Portrait` and `Landscape` both obey the same rest-formatting contract.
7. Saved-workout preview and local-draft preview render the same rest contract for the same source content and filter state.
8. No existing width-reclaim, brand lockup, or focus-region improvements regress while fixing rest formatting.
9. Before merge, screenshots clearly show:
   - representative current problematic states,
   - corrected after states,
   - whether each image set is `before/after` or `after/reference`.
10. The implementation includes explicit matrix validation of current behavior and corrected behavior, not just single happy-path coverage.

## Validation

- `npm run lint:briefs`
- targeted unit coverage for rest-token formatting and placement contract
- targeted matrix validation for:
  - `Portrait` / `Landscape`
  - `Complete words` / `Abbreviated` / `Auto`
  - `All inline` / `All separate line` / `Auto`
- targeted Playwright/screenshot coverage for representative filter combinations on both desktop and mobile-sized preview surfaces
- screenshot handoff with short explanation before `verify:pre-pr`
- owner screenshot approval or correction pass before `verify:pre-pr`, PR creation, and `verify:pre-merge`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm installed locally.

## Manual QA Environments

- Local:
  - saved-workout preview on desktop
  - saved-workout preview on mobile-width viewport
  - local-draft preview on desktop
  - local-draft preview on mobile-width viewport
- Preview:
  - Vercel preview URL from the eventual PR checks
- Required screenshot sets:
  - `before-poolside-rest-contract-desktop.png`
  - `after-poolside-rest-contract-desktop.png`
  - `before-poolside-rest-contract-mobile.png`
  - `after-poolside-rest-contract-mobile.png`
  - additional `reference-*` files when comparing to a separate stable surface instead of a true before-state

## Constraints

- Keep this brief tightly scoped to rest-formatting/filter-contract consistency.
- Do not add a second renderer or new persistence.
- Do not let placement logic drift separately between preview and export/render consumers.
- Preserve the current preview-owned settings model.
- Prefer one simple documented contract: explicit modes are global, while `Auto` is the only adaptive mode and behaves predictably.

## 10/10 Quality Bar

- Every filter should do exactly what its label implies.
- The note should read as one intentional system, not a mix of legacy formatting rules.
- Required states remain strong:
  - default preview,
  - narrow-width preview,
  - wide preview,
  - saved workout,
  - local draft,
  - `All inline`,
  - `All separate line`,
  - `Auto`.
- Accessibility expectations:
  - filter controls remain keyboard reachable,
  - focus remains visible,
  - rest emphasis is not the only cue for meaning,
  - line breaks do not create ambiguous reading order.
- Business-logic expectations:
  - no row-specific surprise exceptions,
  - no filter combination that quietly breaks the rest contract,
  - no drift between source wording mode and rendered placement semantics.

## Help/Guide Impact

- `N/A`
- Rationale:
  - this slice changes a private owner-facing preview rendering contract and does not change public Help/Guide workflow copy.

## Checkpoint Log

- `2026-04-20 | verify-pre-pr-pass | \`npm run verify:pre-pr\` passed after clearing generated local \`.next-\*\` artifacts from the working tree; validation covered lint, typecheck, 818 unit tests, production build, perf budgets, and the shared Playwright matrix (103 passed / 335 skipped) | perf-trend follow-up: hold tightening in this brief and carry the recommendation in PR summary because this slice is a rendering-contract fix, not a performance-budget retune`
- `2026-04-20 | screenshot-ready | updated the renderer contract to match the owner-approved UX: \`Auto\` is adaptive per row, explicit modes are labeled \`All inline\` and \`All separate line\`, and rest accents stay blue across all modes; refreshed before/after screenshots, plus explicit inline/separate-line desktop captures, under \`output/playwright/2026-04-20-poolside-rest-contract/\` | validation: targeted vitest pass, typecheck pass, brief-lint pass | next: owner screenshot approval before \`verify:pre-pr\``
- `2026-04-20 | implementation-adjustment | owner corrected the final UX contract after screenshot review: explicit labels should read \`All inline\` and \`All separate line\`, while \`Auto\` must stay adaptive per row instead of resolving note-wide; next step is to update renderer logic, tests, and after-screenshots before any PR gate`
- `2026-04-20 | implementation-progress | implemented deterministic rest-formatting for poolside preview rendering in \`lib/workouts/shared.ts\`; explicit \`inline\` now keeps rest tokens accent-colored without merging them into the black primary text, explicit \`below_step\` forces all rests onto the rest line, and \`auto\` initially resolved one note-wide rest placement; added matrix-focused unit coverage in \`tests/unit/workouts-shared.test.ts\` and generated before/after screenshot pairs plus an extra inline pair under \`output/playwright/2026-04-20-poolside-rest-contract/\` | validation so far: targeted vitest pass + typecheck pass | next: adjust \`Auto\` to the owner-approved per-row behavior and refresh after-screenshots before \`verify:pre-pr\``
- `2026-04-20 | implementation-start | moved the brief into in-progress and started implementation on branch \`poolside-rest-format-contract\`; next step is to map the current render matrix in code/tests before locking the new deterministic contract`
- `2026-04-20 | planning | created the dedicated poolside rest-formatting and filter-contract follow-up after owner review found color drift, last-row separate-line failure, and unclear auto/notation semantics across the preview matrix; locked this as a sequencing blocker before save-as-image export and before maintenance baseline | next: if approved for execution, move this brief to in-progress and implement the matrix evaluation plus deterministic rest-rendering contract end to end`
