# Task Brief: Poolside Note Preview-Owned Print Settings And Builder Simplification (10/10)

## Metadata

- `id`: `2026-04-19-poolside-note-preview-owned-print-settings-and-builder-simplification-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-04-19`
- `updated`: `2026-04-19`

## Goal

Make the poolside print preview the single owner of print settings while keeping `Session Focus` in the builder as the content-selection step.

## Why This Brief Exists

- The current poolside builder panels mix two different jobs:
  - selecting note content (`Session Focus`),
  - configuring output presentation (`Style`, `Layout`, `Notation`, `Rest layout`).
- Those print settings are currently duplicated before preview in both the saved-workouts flow and the live workout editor:
  - `components/my-library/workouts/SavedWorkoutsPanel.tsx`
  - `components/my-library/workouts/WorkoutEditor.tsx`
  - `components/my-library/workouts/PoolsideNotePanel.tsx`
- The owner explicitly asked whether the builder should drop duplicated print settings and let the preview window own them instead.
- Product recommendation is now locked:
  - keep `Session Focus` in the builder because it changes what content goes into the note,
  - move print presentation settings to the owner-facing preview surface,
  - remove duplicate builder-side print settings only after preview-side parity exists.

## Dependencies And Boundaries

- Upstream shipped poolside lineage:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-19-poolside-note-width-reclaim-flow-notation-and-brand-lockup-followup-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-19-poolside-note-width-reclaim-flow-notation-and-brand-lockup-followup-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-18-poolside-note-content-aware-print-sizing-and-header-balance-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-18-poolside-note-content-aware-print-sizing-and-header-balance-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-18-poolside-note-focus-options-responsive-layout-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-18-poolside-note-focus-options-responsive-layout-10-10.md)
- Current implementation surfaces likely touched when execution starts:
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/PoolsideNotePanel.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/PoolsideNotePanel.tsx)
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/SavedWorkoutsPanel.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/SavedWorkoutsPanel.tsx)
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx)
  - [/Users/stianvikra/freeswimming/app/api/my-library/workouts/[workoutId]/export/pdf/route.ts](/Users/stianvikra/freeswimming/app/api/my-library/workouts/[workoutId]/export/pdf/route.ts)
  - [/Users/stianvikra/freeswimming/lib/workouts/shared.ts](/Users/stianvikra/freeswimming/lib/workouts/shared.ts)
- Locked product decisions for this brief:
  - `Session Focus` stays in builder/library surfaces,
  - `Style`, `Layout`, `Notation`, and `Rest layout` become preview-owned controls,
  - preview state must be reflectable in the URL so refresh/reopen preserves the current view,
  - no new saved preference or database field is added in this slice,
  - prefer extending the current owner-facing preview/export surface first; only add a thin wrapper route if the existing export route cannot host the controls cleanly without harming print delivery.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Admin editor ergonomics`
- `Data placement and sync boundaries`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                                      | Evidence                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The builder must clearly own content selection while the preview clearly owns print presentation, with no duplicate settings that blur the job of each surface.                     | builder + preview screenshot review      | `5/5`                   |
| UX flow clarity                               | `target`     | Users must be able to open preview, change print settings there, and see the note update without going back to the builder or losing the current note state.                        | manual QA + targeted e2e                 | `5/5`                   |
| Visual design quality                         | `target`     | The preview controls must feel like a calm control surface around the note, and the builder panel must become visibly simpler after the duplicate settings are removed.             | screenshot review + browser QA           | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Focus selection, print settings, and rendered note output must stay truthful and deterministic, with no drift between builder intent, URL state, and preview output.                | unit coverage + route review             | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Builder/library surfaces must keep the content-selection step lightweight by showing `Session Focus` plus preview entry only, while preview hosts the presentation controls.        | builder workflow QA + screenshot review  | `5/5`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: preview-side print controls must remain keyboard reachable, labeled, and readable without reducing print-preview clarity.                                          | semantic review + targeted QA            | `4/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: keep the new preview-control ownership lightweight and avoid turning the print-preview flow into a heavy app shell.                                                | diff review + verify evidence            | `4/5`                   |
| Data placement and sync boundaries            | `target`     | The brief must explicitly preserve server-canonical workout data while making preview print settings local-only, URL-reflected, and non-persistent unless a later brief changes it. | brief contract + code review             | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Preview changes must deterministically rebuild from current URL state and current workout data, with refresh producing the same output for the same option set.                     | route QA + cache review                  | `5/5`                   |
| Reliability and failure handling              | `supporting` | Supporting only: blocked preview loads, refreshes, and option changes must fail cleanly without trapping users in mismatched builder/preview state.                                 | route QA + negative-path review          | `4/5`                   |
| Security and authz                            | `supporting` | Supporting only: the owner-only preview/export route must keep the same auth boundary and no new public route may weaken access control.                                            | route guard review + existing auth tests | `4/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because this slice changes ownership of local preview controls only and adds no new personal data field, sharing rule, or retention path.                                       | explicit scope rationale                 | `N/A`                   |
| Content governance                            | `supporting` | Supporting only: focus text stays sourced from the current training-context/workout contract, and preview controls must not invent new content variants.                            | code review + workflow QA                | `4/5`                   |
| Admin workflow and editability                | `target`     | The saved-workouts and live-editor poolside flows must share the same mental model: builder selects content, preview configures presentation, and neither duplicates the other.     | workflow QA across both surfaces         | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because the owner-facing workout preview/export surface remains non-indexed and authenticated.                                                                                  | explicit scope rationale                 | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this work changes no public semantic content surface or retrieval metadata.                                                                                             | explicit scope rationale                 | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice does not add instrumentation; success is verified through workflow QA, screenshots, and regression coverage.                                                 | explicit scope rationale                 | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no billing, entitlement, or commerce flow changes in this slice.                                                                                                        | explicit scope rationale                 | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this slice remains a private preview/workflow ergonomics pass and adds no new support or incident playbook requirement.                                                 | explicit scope rationale                 | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance/reporting path changes in this slice.                                                                                                                        | explicit scope rationale                 | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this brief reorganizes the current English owner workflow only and does not add locale architecture or translation workflow.                                            | explicit scope rationale                 | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Stay inside the current workout builder, preview/export route, and shared poolside renderer with zero new dependency and no second print engine.                                    | dependency diff + architecture review    | `5/5`                   |
| Testing and QA automation                     | `target`     | Tests and screenshot handoff must lock the new builder/preview ownership contract across saved-workouts, workout-editor, and preview/export flows before merge.                     | targeted tests + screenshot QA + verify  | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the ownership cleanup should reduce duplicated UI and state handling instead of adding a heavier long-term maintenance burden.                                     | code review + workflow review            | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the change must remain reversible through a narrow UI/state diff with no migration, schema change, or external dependency rollout.                                 | PR diff + rollback review                | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - saved workout/session content,
  - swimmer name,
  - open training focuses,
  - the existing owner-only preview/export auth boundary.
- Local-only:
  - selected builder-side focus IDs before preview open,
  - preview-side print settings (`printStyle`, `printLayout`, `notationMode`, `restLayout`) for the currently open note.
- Sync policy:
  - builder opens preview with current focus selection and initial print-setting defaults in the URL,
  - preview controls become the active owner of print-setting changes after open,
  - preview setting changes must update URL state and rerender the note without writing back into workout rows or builder state,
  - no persistence to DB or local storage in this slice.
- Retention and sensitivity:
  - print-setting state is ephemeral and URL-scoped to the current preview,
  - no new secret, token, or sensitive personal data storage is introduced.
- Cache/invalidation:
  - preview remains `no-store`,
  - the same URL + same workout data must produce the same preview output on refresh.

## Identity And Rename Contract

- `N/A`
- Rationale:
  - this slice introduces no new entity, slug, route parameter, or persistent identifier beyond the existing workout ID.

## Scope

- Keep `Session Focus` in the builder/library poolside panels.
- Add preview-owned controls for:
  - `Style`
  - `Layout`
  - `Notation`
  - `Rest layout`
- Remove duplicated builder-side print settings after preview-side parity exists.
- Make preview changes visible immediately after a control change, whether that is implemented as an in-place rerender or a controlled preview refresh inside the preview window.
- Keep preview state shareable/reloadable through the URL for the current open note.
- Cover both builder entry surfaces:
  - saved workouts,
  - live workout editor.
- Provide screenshot handoff before merge if/when this brief is executed.

## Out Of Scope

- New saved preferences for print settings.
- A full redesign of the poolside note visual language.
- Admin-managed abbreviation editing.
- Workout schema changes.
- New public routes or a second independent print renderer.
- Broader builder information-architecture redesign outside the poolside note slice.

## Acceptance Criteria

1. Builder/library poolside panels keep `Session Focus` but no longer expose duplicate print settings once preview-side parity ships.
2. The owner-facing preview surface exposes `Style`, `Layout`, `Notation`, and `Rest layout` controls.
3. Changing preview controls updates the currently open poolside note without requiring a return trip to the builder.
4. Refreshing the preview preserves the current print-setting combination through URL state.
5. Both saved-workouts and live-editor entry points open the preview with truthful initial state.
6. No preview setting change writes back into canonical workout data or creates a new saved preference by accident.
7. Existing auth behavior for the preview/export route remains fail-closed.
8. Screenshot handoff covers the simplified builder surface and the preview-owned control surface before merge.

## Validation

- `npm run lint:briefs`
- targeted workout-builder/unit coverage
- targeted preview/export route coverage
- targeted builder + preview Playwright coverage
- screenshot handoff with short explanation before merge
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm installed locally.

## Manual QA Environments

- Local:
  - saved-workouts poolside entry
  - live workout-editor poolside entry
  - owner-facing preview/export surface with control changes and refresh
- Preview:
  - Vercel preview URL from the eventual PR checks
- Recommended matrix:
  - desktop Chromium
  - desktop Safari/WebKit-equivalent
  - iPhone-width responsive viewport for builder entry surfaces
  - tablet/desktop viewport for the preview control surface

## Constraints

- This is an ownership cleanup and ergonomics slice, not a new print system.
- Keep the builder lighter, not emptier; `Session Focus` remains a first-class builder choice.
- Do not leave the same print setting available in both builder and preview once the slice ships.
- Prefer URL state and the current preview/export contract over new persistence layers.
- Keep the final implementation narrow enough that rollback is trivial.

## 10/10 Quality Bar

- The builder should read more clearly because it only asks the user to choose note content there.
- The preview should feel like the single truthful place to tune output presentation.
- No dead-end state where a user changes preview settings but cannot tell whether the note updated.
- Required states remain strong:
  - default preview open,
  - no custom focus override,
  - changed print settings,
  - refresh/reopen with preserved state,
  - unauthorized/expired preview access,
  - preview load failure/retry.
- Accessibility expectations:
  - labeled controls,
  - keyboard reachability,
  - visible focus,
  - no information conveyed only by color.
- Business-logic expectations:
  - no drift between URL state and rendered note,
  - no drift between builder-selected focus content and preview output,
  - no accidental write-back of preview-only state into canonical workout data.

## Checkpoint Log

- `2026-04-19 | planning | created the dedicated follow-up brief after PR #473 closeout to lock the next poolside ownership change: keep Session Focus in builder, move print settings to the preview surface, and remove duplicate builder-side print controls only after preview parity exists | next: if approved, move this brief to in-progress and implement the builder/preview ownership cleanup end to end`
