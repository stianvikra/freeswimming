# Task Brief: Workout Builder And Poolside Operational Polish (10/10)

## Metadata

- `id`: `2026-04-17-workout-builder-poolside-operational-polish-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-17`
- `updated`: `2026-04-17`

## Goal

Make the manual workout builder, saved-session library, quick view, and poolside note feel more operational and scan-friendly by stabilizing active-editor completion, enriching repeat summaries, simplifying saved-session rows, grouping quick view by ordered section, promoting total distance in the builder, and adding width-aware poolside notation controls.

## Why This Brief Exists

- The current step editor requires too much vertical travel to reach `Done`, because the active editor has bottom actions but no matching bottom completion action:
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx)
- Repeat block summaries still under-report what the work actually is, especially when kick/drill/equipment/effort meaningfully define the set:
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx)
- The builder already computes total distance, but the current display is too visually minor for a key operational metric:
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx)
- Saved workouts still show secondary metadata that the owner does not want in the collapsed library rows, where scan speed should come from title-first density:
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/SavedWorkoutsPanel.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/SavedWorkoutsPanel.tsx)
- Quick View currently uses a generic heading and one-card-per-line-item presentation instead of ordered section grouping, which makes workout structure harder to scan:
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/SavedWorkoutsPanel.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/SavedWorkoutsPanel.tsx)
- The poolside note already has print options and a line-item model with `secondaryText`, but it still lacks explicit notation and rest-layout controls for width-sensitive output:
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/PoolsideNotePanel.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/PoolsideNotePanel.tsx)
  - [/Users/stianvikra/freeswimming/lib/workouts/shared.ts](/Users/stianvikra/freeswimming/lib/workouts/shared.ts)
- The owner direction for this slice is clear:
  - use stable, non-smart `Done` placement instead of cursor/viewport-relative logic,
  - make repeat summaries reflect stroke + drill + equipment + effort + rests,
  - show builder total distance like a real metric,
  - keep saved-session rows to title only,
  - group Quick View by ordered sections without merging repeated labels across the whole workout,
  - remove the `Quick preview` heading,
  - default poolside notation/rest layout to `Auto`, with manual override,
  - give poolside note output a width-aware notation/rest fallback system rather than leaving line-width management to the user.

## Dependencies And Boundaries

- Parent builder/runtime brief:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md)
- Relevant poolside lineage:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-15-poolside-note-composition-final-polish-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-15-poolside-note-composition-final-polish-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-15-poolside-note-popup-stability-and-print-delivery-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-15-poolside-note-popup-stability-and-print-delivery-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-15-poolside-note-layout-and-preview-favicon-polish-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-15-poolside-note-layout-and-preview-favicon-polish-10-10.md)
- Primary implementation surfaces:
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx)
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/SavedWorkoutsPanel.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/SavedWorkoutsPanel.tsx)
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/PoolsideNotePanel.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/PoolsideNotePanel.tsx)
  - [/Users/stianvikra/freeswimming/lib/workouts/shared.ts](/Users/stianvikra/freeswimming/lib/workouts/shared.ts)
  - [/Users/stianvikra/freeswimming/lib/workouts/server.ts](/Users/stianvikra/freeswimming/lib/workouts/server.ts)
  - [/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx](/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx)
  - [/Users/stianvikra/freeswimming/tests/unit/workouts-shared.test.ts](/Users/stianvikra/freeswimming/tests/unit/workouts-shared.test.ts)
  - [/Users/stianvikra/freeswimming/tests/unit/workouts-routes.test.ts](/Users/stianvikra/freeswimming/tests/unit/workouts-routes.test.ts)
  - [/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts)
- This slice owns:
  - active editor completion ergonomics,
  - repeat summary truthfulness,
  - builder total-distance presentation,
  - saved-session row density,
  - quick-view grouping and copy simplification,
  - poolside notation/rest-layout options,
  - abbreviations legend and width-aware poolside fallback policy.
- This slice does not own:
  - workout schema/storage changes,
  - Garmin export semantics,
  - new PDF variant,
  - preview-access/home/contact public-surface polish,
  - saving notation/rest-layout preferences to the server.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Testing and QA automation`

Strict `10/10` mode for this brief:

- every declared `target` category must close at `5/5`

| Category                                      | Mapping      | Threshold For This Brief                                                                                                                                            | Evidence                         | Expected Closeout |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ----------------- |
| Product goals and IA                          | `target`     | The builder must surface its operational priorities clearly: title, total, active edit action, quick-view structure, and poolside formatting choices should all read in one scan. | code review + browser QA         | `5/5`             |
| UX flow clarity                               | `target`     | Active step editing must no longer depend on long scroll-back to find `Done`, saved-session rows must scan title-first, and poolside controls must express notation/rest policy in plain operator language. | browser QA + targeted assertions | `5/5`             |
| Visual design quality                         | `target`     | Total distance, bottom `Done`, simplified session rows, grouped Quick View, and poolside controls must feel integrated with the existing builder system, not bolted-on or over-explained. | screenshot QA + code review      | `5/5`             |
| Business logic correctness and data integrity | `target`     | Repeat summaries, Quick View grouping, and poolside output must remain truthful to the underlying workout semantics, with correct drill/equipment/effort/rest meaning, preserved order, and no duplication. | unit coverage + code review      | `5/5`             |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes the authenticated workout builder for the owner, not an admin/editor publishing workflow.                                            | explicit scope rationale         | `N/A`             |
| Accessibility (a11y)                          | `target`     | Added controls and bottom actions must remain keyboard-reachable, labeled, and visually clear, with no hidden-only completion path.                                 | targeted tests + browser QA      | `5/5`             |
| Performance (CWV + payloads)                  | `supporting` | The slice must stay within existing builder/poolside architecture, add no dependency, and avoid heavy client/runtime expansion.                                     | diff review + verify gates       | `4/5`             |
| Data placement and sync boundaries            | `target`     | New poolside notation/rest-layout settings must stay local preview inputs only unless a future brief explicitly persists them.                                      | brief contract + code review     | `5/5`             |
| Caching and invalidation strategy             | `supporting` | Builder and poolside preview must continue to reflect current draft state immediately after local edits and option changes.                                         | browser QA + targeted tests      | `4/5`             |
| Reliability and failure handling              | `target`     | Long lines, long titles, long swimmer names, and narrow/landscape layouts must degrade gracefully without unreadable poolside output or trapped edit flows.         | targeted tests + visual QA       | `5/5`             |
| Security and authz                            | `supporting` | The slice must not broaden route access or introduce new export/share paths beyond the existing authenticated builder flow.                                         | code review                      | `4/5`             |
| Privacy and compliance                        | `supporting` | The slice must not add new stored personal data or expose more than the current swimmer-name poolside contract already allows.                                      | code review                      | `4/5`             |
| Content governance                            | `target`     | Abbreviation labels and rest terminology must stay canonical and swimmer-facing, with one clear legend source rather than scattered inconsistent short forms.       | code review + tests              | `5/5`             |
| Admin workflow and editability                | `N/A`        | N/A because this slice touches no admin workflow, CMS, or operator-edit governance surface.                                                                         | explicit scope rationale         | `N/A`             |
| SEO and crawlability                          | `N/A`        | N/A because the authenticated workout builder and poolside print surface are not public crawl targets.                                                              | explicit scope rationale         | `N/A`             |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public metadata or retrieval-facing content model.                                                                                | explicit scope rationale         | `N/A`             |
| Analytics and KPI observability               | `supporting` | Existing builder interactions remain the observable contract; no new analytics event requirement is introduced in this slice.                                       | unchanged interaction review     | `4/5`             |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice affects no pricing, billing, checkout, or entitlement logic.                                                                                 | explicit scope rationale         | `N/A`             |
| Incident response and support operations      | `N/A`        | N/A because this slice changes builder/poolside ergonomics only and adds no new support runbook, escalation, or incident-response surface.                          | explicit scope rationale         | `N/A`             |
| Finance and reporting operations              | `N/A`        | N/A because no finance, revenue reporting, or reconciliation path changes here.                                                                                     | explicit scope rationale         | `N/A`             |
| i18n operational readiness                    | `N/A`        | N/A because the slice adjusts English-only builder/poolside labels without changing the localization architecture or content model.                                 | explicit scope rationale         | `N/A`             |
| Stack-fit and dependency discipline           | `target`     | Stay inside the current builder, poolside panel, and shared render pipeline with zero new dependencies or duplicate rendering systems.                              | dependency diff + code review    | `5/5`             |
| Testing and QA automation                     | `target`     | Unit and e2e coverage must lock the new edit-flow, repeat-summary, total-pill, and poolside notation/rest-layout contracts before merge recommendation.             | updated tests + verify gates     | `5/5`             |
| Scalability and cost efficiency               | `supporting` | Width-aware fallback logic must reduce future manual print cleanup, not add uncontrolled branches or runtime cost.                                                  | code review                      | `4/5`             |
| DevOps and rollback readiness                 | `supporting` | The slice must remain code-only and reversible by PR revert with no data migration or schema rollback.                                                              | PR diff review                   | `4/5`             |

## Data Placement And Sync Contract

- Server-canonical:
  - saved workout draft content and summary fields after explicit save,
  - current authenticated route access rules.
- Local-only:
  - open editor state,
  - bottom `Done` visibility for the currently active editor,
  - collapsed Quick View open/closed state,
  - poolside print style/layout,
  - notation mode and rest-layout mode,
  - abbreviations legend open/closed state.
- Sync policy:
  - builder content continues to save only through existing explicit save actions,
  - notation/rest-layout choices remain local preview inputs unless a future brief explicitly persists them,
  - poolside preview rebuilds immediately from current draft + local print options.
- Retention and sensitivity:
  - no new PII fields,
  - no new durable storage for formatting preferences in this slice,
  - swimmer name handling stays unchanged from the current poolside contract.
- Cache/invalidation:
  - unchanged; builder/poolside reflect current in-memory draft state and local option state immediately.

## Identity And Rename Contract

- `N/A`
- Rationale:
  - this slice introduces no new persisted entity, route param, slug, or renameable identifier.

## Scope

- Add a stable bottom `Done` action for the active workout step editor on top of the existing header action, avoiding cursor- or viewport-relative logic.
- Apply the same stable-completion principle to repeat-block editing where relevant.
- Expand repeat summaries so they can reflect stroke, drill type, equipment, effort, interval rest, and set rest with sane deduplication.
- Promote total distance in the builder metadata area as a compact, first-class total pill/stat.
- Reduce collapsed saved-session rows to session title only, with no secondary metadata or badges.
- Replace flat Quick View cards with ordered section grouping that preserves workout order and does not merge repeated labels across the entire workout.
- Remove the generic `Quick preview` heading from the expanded preview surface.
- Extend Poolside Note print options with:
  - `Notation`: `Auto` / `Full` / `Abbreviated`
  - `Rest layout`: `Auto` / `Inline` / `Below step`
- Add a collapsible abbreviations legend in the poolside note builder UI.
- Implement width-aware poolside fallback policy:
  - prefer truthful full wording,
  - abbreviate when needed,
  - move rest below the step when still too wide,
  - avoid leaving width management as a manual user burden.

## Out Of Scope

- Workout schema/database changes.
- Persisting notation/rest-layout preferences to the backend.
- New print/export variant or new route.
- Garmin-ready export semantics.
- Public home/contact/preview surfaces.

## Acceptance Criteria

1. An active step editor has a stable bottom `Done` action in addition to the existing top action, with no cursor-proximity or viewport-smart behavior.
2. The active editing flow feels faster because users can finish an edit from the bottom of the open editor without scrolling back to the header.
3. Repeat summaries accurately reflect the set identity, including drill/equipment/effort/rest details when they materially define the work.
4. Repeat summaries do not show noisy duplicate labels such as repeated `Kick` semantics.
5. The builder metadata area surfaces total distance as a clear compact metric instead of minor gray helper text.
6. Saved-session rows show only the session title in the collapsed list state.
7. Quick View removes the generic heading and groups steps by ordered section labels while preserving repeated later sections as new blocks when they recur.
8. Poolside note print options include notation and rest-layout controls, both defaulting to `Auto`, plus a collapsible abbreviations legend.
9. Poolside output uses width-aware fallback instead of relying on the user to manually tune line width.
10. New controls and summaries remain truthful to the underlying draft and do not mutate saved workout data unless the user explicitly saves workout content as before.

## Validation

- `npm run lint:briefs`
- `npx vitest run tests/unit/workout-builder-hub.test.tsx tests/unit/workouts-shared.test.ts tests/unit/workouts-routes.test.ts`
- `npx playwright test tests/e2e/my-library-workout-builder.spec.ts`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local:
  - authenticated builder route with manual pool workout editing
  - poolside note portrait preview
  - poolside note landscape preview
- Preview:
  - Vercel preview URL from the eventual PR checks
- Recommended matrix:
  - desktop Chromium
  - desktop Safari/WebKit-equivalent where feasible
  - iPhone-width responsive viewport for builder edit ergonomics

## Constraints

- Do not add dependencies.
- Keep the current builder visual language and action hierarchy.
- Do not create a second poolside render path; reuse the current shared render pipeline.
- Keep abbreviations canonical and limited to clear swimmer/operator shorthand.
- Avoid over-explaining the poolside controls in the main UI.
- Preserve workout order in Quick View; do not globally merge non-contiguous `Warmup`, `Main`, or `Cooldown` sections.

## 10/10 Quality Bar

- The builder should feel faster to operate without feeling busier.
- Completion actions must be stable and predictable.
- Repeat summaries must help scanning rather than forcing users to re-open blocks to understand the set.
- Poolside output must remain truthful and operational first, premium second.
- Required states remain clear:
  - closed editor,
  - open editor,
  - repeat edit,
  - poolside full notation,
  - poolside abbreviated notation,
  - inline rest,
  - rest below step.
- Accessibility expectations:
  - keyboard reachability,
  - labeled controls,
  - no hidden-only critical action,
  - no information conveyed only by color.
- Business-logic expectations:
  - no summary drift from underlying workout semantics,
  - no accidental persistence of local-only formatting options,
  - no ambiguous meaning between step-level and repeat-level actions.

## Help/Guide Impact

- `N/A`
- Rationale:
  - this slice changes private builder/poolside ergonomics only and does not alter Help/Guide workflow labels or operator recovery procedures.

## Security, Privacy, And Compliance

- No new secrets or env requirements.
- No new share path or public exposure.
- No new stored personal data beyond the current swimmer-name contract.

## Observability And KPI Contract

- No new analytics instrumentation is required by default.
- Existing builder save behavior, preview generation, and print-preview open flow remain the observable contract.

## Checkpoint Log

- `2026-04-17 | planning | split the next builder/poolside follow-up into a dedicated brief covering active-editor ergonomics, repeat-summary truthfulness, builder total prominence, and width-aware poolside notation controls so this work can ship without mixing in public/mobile page polish | next: if approved for execution, move this brief to in-progress, implement the builder/poolside slice, and validate with targeted builder tests plus full verify gates`
- `2026-04-17 | in-progress | moved brief to in-progress and locked the latest owner decisions: saved-session rows are title-only, Quick View stays grouped in workout order without cross-workout merging, and poolside notation/rest layout default to Auto with manual override | next: implement SavedWorkoutsPanel + shared summary/poolside changes, then validate with targeted builder tests and full verify gates`
