# Task Brief: Swim Session Builder Scan, Delete, And Poolside Brand Polish (10/10)

## Metadata

- `id`: `2026-04-12-swim-session-builder-scan-delete-and-poolside-brand-polish-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-12`
- `updated`: `2026-04-12`

## Goal

FreeSwimming's pool workout surfaces should behave like a polished production builder: truthful saved-session deletion, compact high-scan read mode, clearer edit/view controls, safer inline destructive actions, faster time entry, and premium poolside-note outputs that are strong enough to function as branded lane-side artifacts.

## Why This Brief Exists

- The recent pool-builder parity wave fixed the structural Garmin semantics, but several high-value UX seams remain visible in the live builder.
- The remaining issues are no longer isolated wording tweaks; they now span:
  - saved-session list truthfulness,
  - destructive-flow trust,
  - builder read-mode scanability,
  - edit/view control clarity,
  - rest-step differentiation,
  - time-input ergonomics,
  - and poolside-note brand/design quality.
- The owner explicitly wants these surfaces treated as `10/10` quality work across:
  - UX flow clarity,
  - visual design quality,
  - data integrity,
  - admin/workflow ergonomics,
  - testing and QA,
  - and indirect brand/marketing quality for the printable poolside surfaces.

## Dependencies And Boundaries

- Parent builder direction:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-07-pool-swim-builder-step-authoring-parity-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-10-swim-session-builder-metadata-panel-clarity-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-09-platform-containment-and-border-hierarchy-audit-10-10.md`
- Primary implementation surfaces:
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutBuilderHub.tsx`
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/SavedWorkoutsPanel.tsx`
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx`
  - `/Users/stianvikra/freeswimming/lib/workouts/server.ts`
  - `/Users/stianvikra/freeswimming/lib/workouts/shared.ts`
  - `/Users/stianvikra/freeswimming/app/my-library/workouts/[workoutId]/page.tsx`
  - `/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx`
  - `/Users/stianvikra/freeswimming/tests/unit/workouts-shared.test.ts`
  - `/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts`
- Live admin-note context already reconciled before this slice:
  - shipped/stale notes were closed,
  - remaining builder-facing note still relevant here: `a175f6bc-6814-4010-9f4a-e6620fb9f5dc` (`My Swim Sessions`, bulk delete need).

## Product Direction Locked By This Brief

1. `View` mode in the pool builder is a read mode, not a disabled edit form.
2. Read mode should optimize for scanability and session comprehension first, not one-card-per-step symmetry.
3. Builder destructive actions should say `Delete`, not `Remove`, when they delete a step, repeat block, or saved session.
4. Delete confirmation inside the builder must appear locally near the affected item, not in a detached global banner above the list.
5. `My Swim Sessions` must be truthful:
   - deleting one session must not appear to instantly resurrect the same session because of list truncation,
   - and identical untitled rows must be easier to distinguish.
6. Manual pool time entry should use one `MM:SS` field pattern consistently across swim/rest/send-off cases.
7. Poolside note builder options should stay simpler and lower-noise.
8. Printed/previewed poolside notes are brand surfaces:
   - both portrait and landscape must look intentional, premium, and highly scannable,
   - internal implementation labels such as draft source or print-mode chips must not leak into the artifact.
9. Existing Garmin-compatible canonical repeat/rest semantics stay intact.
10. Existing canonical save/update/delete APIs stay authoritative unless this brief explicitly extends them.

## Locked Decisions

### 1. Session-Builder Read Mode

- Rename inner section heading from `Session builder` to `Session steps`.
- Keep page-level route heading dynamic:
  - `Pool session builder` for manual `pool`,
  - `Open-water session builder` for manual `open_water`,
  - fallback `Swim session builder` only where environment-specific naming is not available.
- In `View` mode:
  - remove per-card `Edit step` buttons,
  - remove expanded edit controls,
  - render a compact grouped read surface with higher scan value.
- For non-repeat top-level steps:
  - group consecutive steps by visible section label (`Warmup`, `Main`, `Cooldown`, `Rest`, etc.),
  - if there is one step in a section, show one clean line,
  - if there are multiple steps in the same section, render numbered lines:
    - `Main`
    - `1. 100m · Freestyle · Moderate · Rest: 1:00`
    - `2. 100m · Freestyle · Hard · Rest: 0:10`
- For repeat blocks:
  - keep repeat semantics visible as a single compact summary:
    - `Main`
    - `4 x 100m · Freestyle · Moderate · Rest: 0:30`
    - `Post-set rest: 1:00`
- Do not collapse distinct non-repeat steps into fake `2 x` summaries.

### 2. Edit/View Control Clarity

- Keep `Edit` and `View` as a segmented control.
- Active state must be substantially clearer than the current grey/white treatment.
- Selected mode should use FreeSwimming blue emphasis, but still read as a mode toggle, not as a primary CTA.
- Separate mode controls from action buttons (`Add step`, `Add repeat`) so the two groups do not visually compete.

### 3. Rest-Step Treatment

- Separate canonical rest steps should read visually as rest steps, not as regular swim cards with swim-style weight.
- In edit mode, rest cards should have a lighter, clearly distinct rest presentation.
- In view mode, rest content should read as compact rest rows/lines.
- If a swim step already shows linked inline rest for scanability, do not duplicate the same rest information as if it were another full swim summary.

### 4. Builder Action Placement And Delete Confirmation

- Use `Delete`, not `Remove`, for destructive builder actions.
- Delete confirmation must render inline near the affected step or repeat block.
- Confirmation copy should name the affected target clearly and stay inside the user’s viewport context.
- Keep local undo after delete.
- Maintain predictable keyboard/focus behavior.

### 5. Saved Session Truthfulness And Bulk Cleanup

- `My Swim Sessions` must stop using a misleading visible count that only reflects a limited subset.
- The saved-session list must no longer backfill a visually identical untitled row immediately after deletion in a way that looks like deletion failed.
- The list should expose distinguishing metadata for otherwise identical rows.
- Add practical multi-select/bulk-delete support on `My Swim Sessions` so the owner can clear many test sessions efficiently.

### 6. Time Input

- Use a single field for manual pool time entry across:
  - swim time,
  - rest time,
  - send-off time.
- Entry model:
  - `MM:SS`
  - colon appears automatically while typing digits where practical,
  - normalization should make `10` seconds easy to enter without split minute/second fields.
- The same behavior should apply to rest-step timing and swim-time timing in manual pool mode.

### 7. Poolside Note Builder Panel

- Keep `Swimmer: <name>` sourced from athlete profile.
- Keep `Print Preview` button label.
- Replace the right-side headings with a lower-noise structure:
  - top heading: `Print options`
  - subgroups: `Style` and `Layout`
- Remove helper descriptions under portrait/landscape options:
  - `Compact lane-side note in one tall column.`
  - `Wider split layout for longer programs and more focus notes.`
- Keep `Color mode`, `Ink saver`, `Portrait`, and `Landscape` as builder options only.

### 8. Poolside Note Output

- Portrait and landscape outputs must both be treated as `10/10` brand surfaces.
- Remove output text/chips that expose internal implementation state:
  - `Pool session execution`
  - `Source: Local draft`
  - `Source: Canonical workout`
  - `Color mode`
  - `Ink saver`
  - `Portrait`
  - `Landscape`
- Replace `Tot:` with `Total`.
- Header should be more compact, premium, and balanced:
  - logo/brand lockup cleaned up,
  - `Poolside Note` as primary title,
  - session title,
  - swimmer name,
  - session meta row such as `200m · ~4 min · Moderate`.
- Landscape should use width intentionally:
  - metadata/focus in left column,
  - workout program in the wider right column,
  - less dead stacking in the header.
- Portrait should also get the same premium header cleanup and improved vertical rhythm.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                           | Evidence                                     |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| Product goals and IA                          | `target`     | Private workout routes clearly separate page purpose (`builder`) from section purpose (`session steps`) and expose a read mode that matches swimmer/operator scan needs. | route review + unit/e2e assertions           |
| UX flow clarity                               | `target`     | Edit/view mode, delete flows, bulk cleanup, and time entry are all understandable without hidden/offscreen steps or misleading resurrection behavior.                    | unit/e2e + manual QA                         |
| Visual design quality                         | `target`     | Builder read mode and poolside portrait/landscape outputs look intentionally composed, balanced, and brand-fit with no obvious unfinished seams.                         | manual QA + screenshot review + e2e coverage |
| Business logic correctness and data integrity | `target`     | Saved-session delete, list counts, repeat/rest summaries, and time normalization remain deterministic with no silent corruption or mismatched canonical semantics.       | unit coverage + code review + regression QA  |
| Admin editor ergonomics                       | `target`     | High-frequency builder tasks require fewer confusing steps: easier scanning, local delete confirm, faster time entry, bulk cleanup, and clearer edit/view state.         | manual QA + targeted tests                   |
| Accessibility (a11y)                          | `target`     | Mode toggles, inline confirms, radio groups, and grouped read-mode summaries keep keyboard/focus/label semantics intact on changed surfaces.                             | test review + manual keyboard QA             |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: changes stay within existing private routes and should not materially regress builder responsiveness or print-preview startup.                          | build/verify + diff review                   |
| Data placement and sync boundaries            | `target`     | Canonical workout rows remain server truth; view mode, pending delete UI, bulk selection, and poolside option state stay local-only and predictable.                     | brief contract + code review                 |
| Caching and invalidation strategy             | `target`     | Saved-session reads and deletes define explicit refresh/update behavior so list state stays truthful after mutations.                                                    | code review + deletion flow tests            |
| Reliability and failure handling              | `target`     | Delete/save/print flows fail predictably, confirmations stay visible, and list state cannot falsely imply a failed delete because of stale truncation.                   | unit/e2e + manual QA                         |
| Security and authz                            | `supporting` | Supporting only: reuse existing authenticated workout APIs and owner scoping; no new privilege boundary is introduced.                                                   | route review + existing API constraints      |
| Privacy and compliance                        | `supporting` | Supporting only: swimmer name is sourced from athlete profile and only rendered in the authenticated builder/print surface already intended for that user.               | scope review                                 |
| Content governance                            | `supporting` | Supporting only: section labels and poolside print labels become more intentional, with no duplicate competing copy for the same concept.                                | code review                                  |
| Admin workflow and editability                | `target`     | Manual pool editing, saved-session cleanup, and read-mode review are all faster and less error-prone for repeated admin/owner workflows.                                 | manual QA + targeted tests                   |
| SEO and crawlability                          | `N/A`        | N/A because changed routes are private authenticated My Library surfaces and print previews are not public crawl targets.                                                | explicit scope rationale                     |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public crawlable entity surface, metadata contract, or structured public documentation.                                                | explicit scope rationale                     |
| Analytics and KPI observability               | `supporting` | Supporting only: this slice does not add new event taxonomy, but success/error notices and truthful deletion behavior improve operator trust.                            | scope review                                 |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, checkout, or billing workflow changes.                                                                                              | explicit scope rationale                     |
| Incident response and support operations      | `N/A`        | N/A because this slice changes private builder UX and print composition only; it does not alter on-call/runbook mechanics for production incidents.                      | explicit scope rationale                     |
| Finance and reporting operations              | `N/A`        | N/A because no revenue, refund, payout, or finance reconciliation path changes.                                                                                          | explicit scope rationale                     |
| i18n operational readiness                    | `N/A`        | N/A because this slice refines centralized English private-surface copy only and introduces no new locale blocker beyond current baseline.                               | explicit scope rationale                     |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next.js, React, Tailwind, and workout-shared utilities with no new dependency unless strictly necessary.                                                  | dependency diff + code review                |
| Testing and QA automation                     | `target`     | Targeted unit/e2e coverage protects delete truthfulness, inline confirmation, view-mode summaries, poolside output, and time entry; `verify:pre-pr` must pass.           | updated tests + `verify:pre-pr`              |
| Scalability and cost efficiency               | `supporting` | Supporting only: list handling should remain reasonable without introducing obviously wasteful repeated fetch/delete patterns for normal library sizes.                  | code review                                  |
| DevOps and rollback readiness                 | `supporting` | Supporting only: no schema migration is required unless this slice explicitly extends mutation APIs; rollback remains normal code rollback.                              | diff review + validation                     |

## Data Placement And Sync Contract

- Server-canonical data:
  - saved workout rows in `workouts`
  - workout draft payloads
  - workout stable IDs
  - saved-session updated timestamps and canonical summaries
  - delete mutations against workout rows
- Local-only data:
  - builder `edit` vs `view` mode
  - expanded/collapsed card state
  - pending inline delete-confirm target
  - last-removed undo buffer
  - multi-select UI state for bulk delete
  - selected poolside focus ids
  - selected print style/layout
  - in-progress time-input formatting state
- Sync policy:
  - canonical library data is loaded server-side into `WorkoutLibrarySnapshot`
  - local optimistic updates may adjust the visible list immediately after delete,
  - then route refresh/revalidation must converge the client back onto canonical server truth,
  - delete failures must leave the item visible and surface an error,
  - no client-side shadow copy may continue to claim a delete succeeded if the canonical row still exists.
- Retention and sensitivity:
  - swimmer name comes from athlete profile and is shown only on the private builder/print surface.
  - deleted workouts follow existing canonical deletion rules; no new retention layer is introduced here.
- Cache/invalidation:
  - delete and save flows must invalidate/refresh the saved-session list immediately after success,
  - builder read mode and poolside options remain local UI state and do not require server invalidation.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the only canonical stable identity for saved sessions.
- Human-readable identifiers:
  - `title` is editable and not stable identity.
  - section labels such as `Main`, `Warmup`, `Rest`, and `Session steps` are UI labels only.
- Mutability rules:
  - workout titles are renameable in place.
  - changing builder labels or print labels must not repurpose canonical workout rows.
- Rename vs repurpose policy:
  - UI label cleanup is an in-place presentation change.
  - deleting a saved workout destroys the canonical row; it is not a rename or archive in this slice.
- Compatibility contract:
  - older saved workouts must continue to load into the same canonical schema.
  - view-mode grouping must derive from existing canonical steps rather than requiring a migration.
- Observability and repair:
  - if a selected workout row is missing/invalid, existing missing/invalid workout handling remains authoritative.

## Scope

- Make `My Swim Sessions` truthful after delete and more useful for cleanup.
- Add bulk-delete support on saved sessions.
- Improve saved-session differentiators for otherwise identical rows.
- Rename inner builder section to `Session steps`.
- Make page-level builder heading environment-specific where available.
- Rework builder `View` mode into a compact grouped read mode.
- Strengthen edit/view active-state clarity and visual grouping.
- Move destructive builder confirmation inline/local to the affected item.
- Rename destructive builder actions from `Remove` to `Delete`.
- Improve rest-step visual separation and edit ergonomics.
- Standardize manual pool time entry to one `MM:SS` field pattern with auto-formatting.
- Simplify poolside note builder option copy and layout.
- Redesign poolside portrait and landscape output headers/composition for stronger scanability and brand quality.
- Remove implementation-state labels from poolside output.
- Update tests and validation for all changed behavior.

## Out Of Scope

- Open-water session-builder redesign beyond route heading truthfulness
- Garmin export schema changes unless strictly required by this UI slice
- Payment, subscription, or public-site flows
- Generic sitewide border/containment audit beyond the directly touched builder/list/poolside surfaces
- Rewriting canonical repeat semantics already locked in prior parity work

## Acceptance Criteria

1. The page-level manual builder heading is environment-specific where the environment is known.
2. The inner builder section heading reads `Session steps`.
3. `View` mode renders compact grouped summaries instead of full edit-style step cards.
4. `View` mode contains no per-step `Edit step` buttons.
5. Active `Edit` / `View` state is clearly visible and visually distinct from CTA buttons.
6. Builder destructive actions use `Delete` wording.
7. Step/repeat delete confirmations render inline near the affected target, not as a detached top-of-list confirmation.
8. Undo after builder delete still works.
9. Manual pool time entry uses a single `MM:SS` pattern across relevant timing fields and makes second-level entry practical.
10. `My Swim Sessions` count reflects real loaded library truth rather than an arbitrary six-item subset.
11. Deleting one saved session does not create the impression that the same row immediately reappeared.
12. Saved-session rows expose enough metadata to distinguish otherwise identical untitled sessions.
13. Bulk delete is available from `My Swim Sessions`.
14. Poolside note builder uses a lower-noise `Print options` presentation and removes the portrait/landscape helper copy.
15. Poolside portrait and landscape outputs no longer display internal source/print mode/layout labels.
16. Poolside portrait and landscape headers feel intentionally designed, compact, and premium.
17. Poolside output uses `Total`, not `Tot:`.
18. Relevant unit/e2e coverage is updated and local validation passes.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- targeted `vitest`
  - `tests/unit/workout-builder-hub.test.tsx`
  - `tests/unit/workouts-shared.test.ts`
- targeted Playwright
  - `tests/e2e/my-library-workout-builder.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be available on the machine that runs validation.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3100/my-library/workouts`
  - desktop Chromium
  - Safari/WebKit for print preview checks
- Vercel preview:
  - PR preview URL from checks
- Recommended matrix for this slice:
  - iPhone Safari
  - desktop Chrome
  - desktop Safari/WebKit

## Constraints

- Preserve Garmin-compatible canonical repeat/rest behavior.
- Prefer stack-native changes; do not add dependencies unless there is no simpler route.
- Keep destructive flows explicit and reversible where possible.
- Poolside output must favor scanability and brand quality over exposing internal system state.

## Help/Guide And Operator Training Contract

- `N/A` for this slice because it changes private builder/list/poolside surfaces only and does not currently alter a public Help/Guide contract.
- If implementation touches any documented operator workflow wording, update that surface in the same PR.

## 10/10 Quality Bar

- UX clarity:
  - users immediately understand whether they are editing or reviewing,
  - delete flows are local, visible, and confidence-inspiring,
  - library cleanup feels truthful and efficient.
- Required states:
  - loading: existing route loading remains safe
  - empty: empty session/read mode still gives a clear next step
  - error: delete/save failures keep truthful UI state and clear messaging
  - retry: failed save/delete can be retried without stale phantom state
  - offline/partial failure: no silent disappearance or silent data corruption
- Accessibility:
  - segmented control exposes active state clearly,
  - inline confirms remain keyboard reachable,
  - grouped read summaries remain semantic and readable,
  - radio/checkbox alignment remains visually and semantically clean.
- Performance:
  - no obvious interaction lag added to builder editing, read mode, or print preview launch.
- Visual consistency:
  - builder/list surfaces stay within FreeSwimming’s visual system,
  - poolside note should feel like a refined premium extension of the brand, not a debug printout.
- Business logic:
  - delete/list state remains deterministic,
  - view summaries reflect canonical structure truthfully,
  - time inputs normalize consistently and save the intended value,
  - poolside output must reflect the current draft/canonical workout content without leaking internal diagnostic labels.

## Checkpoint Log

- `2026-04-12 | in progress | brief created after consolidating all owner-reported builder findings into one execution slice: session-step read mode, mode-toggle clarity, truthful saved-session deletion and bulk cleanup, local inline builder delete confirm, MM:SS time entry, rest differentiation, and premium poolside-note builder/output polish | next: implement list truthfulness + bulk delete + builder interaction changes, then patch poolside output and run validation`
- `2026-04-12 | in progress | implementation completed across builder list, builder read/edit UX, delete flows, time entry, and poolside portrait/landscape output; targeted unit/e2e runs passed and full \`npm run verify:pre-pr\` passed (97 passed, 323 skipped) | next: stage, commit, push, update PR, run \`npm run verify:pre-merge\`, and confirm merge readiness`
