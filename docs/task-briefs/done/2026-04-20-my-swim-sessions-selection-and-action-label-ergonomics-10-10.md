# Task Brief: My Swim Sessions Selection And Action Label Ergonomics (10/10)

## Metadata

- `id`: `2026-04-20-my-swim-sessions-selection-and-action-label-ergonomics-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-20`
- `updated`: `2026-04-20`

## Goal

Make the saved swim sessions list faster and clearer to operate by replacing `Edit` with `Open`, enlarging the selection hit area in selection mode, and removing over-explanatory selection helper copy.

## Why This Brief Exists

- The current saved sessions list still has a few action-label and selection ergonomics issues:
  - `Edit` is less truthful than `Open` because the destination surface itself already uses `Edit`, `Rearrange`, and `View`,
  - selection mode currently depends too heavily on the small checkbox hit target,
  - the helper sentence under `Library cleanup` explains too much instead of letting the interface read for itself.
- Owner direction is explicit:
  - `Open` is the better row action label,
  - the row/name area should be selectable in selection mode,
  - the selection helper sentence should be removed rather than preserved as visible UI noise.
- This should be handled as one small saved-sessions ergonomics brief:
  - no poolside export work,
  - no builder redesign,
  - no general library information-architecture rewrite.

## Dependencies And Boundaries

- Relevant shipped builder/library lineage:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-17-workout-builder-poolside-operational-polish-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-17-workout-builder-poolside-operational-polish-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-05-swim-session-builder-create-vs-edit-clarity-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-05-swim-session-builder-create-vs-edit-clarity-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-14-swim-session-builder-action-clarity-and-safe-discard-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-14-swim-session-builder-action-clarity-and-safe-discard-10-10.md)
- Likely implementation surfaces:
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/SavedWorkoutsPanel.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/SavedWorkoutsPanel.tsx)
  - [/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx](/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx)
  - [/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts)
- Locked product decisions for this brief:
  - saved session row action label becomes `Open`, not `Edit`,
  - selection mode must allow the row/name hit area to toggle selection,
  - right-side action buttons must stay isolated and must not accidentally toggle selection,
  - the default `Library cleanup` helper sentence should be removed rather than rewritten longer,
  - in selection mode, concise selected-count feedback may stay if needed.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Accessibility (a11y)`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                      | Evidence                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Saved session row actions must read truthfully: `Open` opens the session surface, selection mode is clearly separate, and destructive cleanup remains explicit.   | screenshot review + workflow QA           | `5/5`                   |
| UX flow clarity                               | `target`     | Users must be able to enter selection mode, select rows from the row/name area, and understand `Open` instantly without explanatory helper text.                  | manual QA + targeted e2e                  | `5/5`                   |
| Visual design quality                         | `target`     | The row should feel calmer and more scannable after the label and helper-text cleanup, with a visibly clear selected state on the full row.                       | screenshot review + browser QA            | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Row selection must toggle only the intended workout IDs, must not leak into action-button clicks, and must keep bulk delete semantics unchanged.                  | unit coverage + e2e + code review         | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes the authenticated owner-facing saved sessions list, not an admin editor workflow.                                                   | explicit scope rationale                  | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Checkbox semantics, row click target, focus behavior, and action-button separation must remain keyboard-usable and screen-reader clear.                           | semantic review + targeted QA             | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: selection ergonomics improvements should stay lightweight and avoid adding extra render churn or state complexity.                                | diff review + interaction QA              | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Selection mode state must remain local-only UI state; row hit-area changes must not alter canonical workout data or persistence behavior.                          | brief contract + code review              | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: selection/open label changes must not affect saved-workout fetch, invalidation, or preview toggles outside current local UI state.               | workflow review                           | `4/5`                   |
| Reliability and failure handling              | `target`     | Selection mode must remain deterministic under repeated toggles, select-all, deselect, pending delete, and action-button use without accidental destructive drift. | targeted tests + manual QA                | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no auth boundary changes; bulk delete and open flows stay inside the existing owner-only session workflow.                                        | route review                              | `4/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because this brief changes no personal-data collection, retention, sharing, or compliance-sensitive path.                                                      | explicit scope rationale                  | `N/A`                   |
| Content governance                            | `supporting` | Supporting only: user-facing action labels become more truthful and less noisy, but no content governance workflow changes.                                        | copy review                               | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin/operator workflow, publish state, or admin mutation model changes in this slice.                                                              | explicit scope rationale                  | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is an authenticated My Library surface with no public indexing contract.                                                                           | explicit scope rationale                  | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public content surface, metadata, or AI-discoverable route.                                                                      | explicit scope rationale                  | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice does not require new instrumentation; workflow QA and regression coverage are sufficient.                                                    | explicit scope rationale                  | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, billing, or entitlement behavior changes here.                                                                                   | explicit scope rationale                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this is a local owner-facing ergonomics pass and does not add a new support or incident workflow.                                                      | explicit scope rationale tied to UI scope | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance, reconciliation, payout, or reporting path changes are involved.                                                                             | explicit scope rationale tied to UI scope | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this slice standardizes private English row/action wording only and does not alter localization architecture.                                           | explicit scope rationale tied to UI scope | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | The solution must stay inside the existing saved sessions panel and current selection state model with zero new dependency.                                         | dependency diff + architecture review     | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted unit/e2e coverage plus visual review must lock row hit-area selection, `Open` labeling, and helper-text cleanup before merge.                            | targeted tests + screenshot QA + verify   | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the selection improvement should simplify future maintenance rather than adding a second interaction model for the same row.                       | diff review                               | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: this remains a narrow reversible UI diff with no schema, migration, or service dependency.                                                        | PR diff + rollback review                 | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - saved workout row identity,
  - saved workout title and metadata,
  - existing delete/open routes and semantics.
- Local-only:
  - selection mode on/off state,
  - selected workout ID list,
  - pending bulk-delete confirmation state,
  - row hover/focus/selected presentation state.
- Sync policy:
  - clicking the row/name hit area in selection mode toggles only local selection state,
  - clicking right-side action buttons still performs the action directly and must not change selection implicitly,
  - no local selection state persists beyond the current page/session unless already defined elsewhere.
- Retention and sensitivity:
  - selection state is ephemeral UI state only,
  - no new personal data or durable local storage is introduced.
- Cache/invalidation:
  - no new cache or invalidation behavior is introduced,
  - existing saved-workout refresh semantics stay unchanged.

## Identity And Rename Contract

- `N/A`
- Rationale:
  - this brief renames only user-facing action text from `Edit` to `Open`; it introduces no new persisted entity, slug, or route identifier.

## Scope

- Replace saved-session row action label `Edit` with `Open`.
- Enlarge selection behavior in selection mode so the row/name hit area toggles selection.
- Keep right-side action buttons isolated from row selection toggling.
- Remove the default explanatory helper sentence under `Library cleanup`.
- Keep concise selection-mode feedback such as `N selected` if needed.
- Ensure the selected state reads clearly across the row, not only through the checkbox itself.
- Cover both pointer and keyboard interaction contracts.

## Out Of Scope

- Poolside export/image work.
- PDF/poolside button redesign.
- Bulk delete flow rewrite beyond hit area/copy clarity.
- General saved sessions layout redesign.
- Changes to builder internals after opening a session.

## Acceptance Criteria

1. Saved session rows use `Open` instead of `Edit`.
2. In selection mode, clicking the row/name area toggles selection for that session.
3. Action buttons (`Quick View`, `Open`, `View PDF`, `Poolside Note`, `Delete`) do not accidentally toggle row selection.
4. The default `Library cleanup` helper sentence is removed.
5. Selection mode still shows concise state feedback when sessions are selected.
6. Selected rows have a clear full-row visual state in addition to the checkbox state.
7. Bulk delete behavior, select-all behavior, and single-row delete behavior remain truthful and unchanged in meaning.
8. Keyboard users can still reach and operate checkbox/row selection and row actions correctly.

## Validation

- `npm run lint:briefs`
- targeted unit coverage for saved sessions selection/action label contract
- targeted Playwright coverage for saved sessions selection mode and row actions
- screenshot handoff with short explanation before `verify:pre-pr`
- owner screenshot approval or correction pass before `verify:pre-pr`, PR creation, and `verify:pre-merge`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm installed locally.

## Manual QA Environments

- Local:
  - saved sessions list on desktop
  - saved sessions list on touch-width/mobile viewport
  - selection mode with multiple selected rows
- Preview:
  - Vercel preview URL from the eventual PR checks
- Recommended matrix:
  - desktop Chromium
  - desktop Safari/WebKit-equivalent
  - iPhone-width responsive viewport

## Constraints

- Keep `Open` aligned with the destination surface language (`Edit`, `Rearrange`, `View` inside the builder).
- Do not reintroduce explanatory UI text unless validation proves a minimal replacement is truly necessary.
- Keep selection mode simple and safe:
  - larger hit area,
  - isolated action buttons,
  - no accidental delete-risk increase.
- No new dependency.

## 10/10 Quality Bar

- The row should read faster without needing helper copy.
- `Open` should feel immediately more truthful than `Edit`.
- Selection mode should feel easy on both mouse and touch, not checkbox-only.
- Required states remain clear:
  - normal list state,
  - selection mode idle,
  - selected rows,
  - pending bulk delete,
  - deleting state.
- Accessibility expectations:
  - keyboard reachability,
  - clear focus,
  - understandable labels,
  - no information conveyed only by color.
- Business-logic expectations:
  - selection toggles the intended row only,
  - action buttons remain isolated,
  - bulk delete semantics stay unchanged and explicit.

## Checkpoint Log

- `2026-04-20 | closeout on main | PR #488 was merged to main as \`bdf5d2b8d6ad6c60fd9e885eee73cc21e56b4db6\`; this closeout sweep moved the brief to \`done\` and cleaned the main-worktree-generated artifacts used during merge/review work | next: none`
- `2026-04-20 | verify:pre-pr passed | full public verification lane passed after syncing the local dependency/runtime environment for this clean worktree; screenshot review was approved before gates, and the branch is ready for commit/push/PR handoff | next: commit, push, open/update PR, then run \`verify:pre-merge\` and monitor CI`
- `2026-04-20 | implementation checkpoint | shipped the saved-sessions ergonomics diff on the feature branch: row action text now reads \`Open\`, selection mode uses a larger left-side hit area with full-row selected state, default cleanup helper copy is removed, and targeted unit + Playwright coverage passed; after screenshots are ready for owner review before \`verify:pre-pr\` | next: owner screenshot approval or correction pass, then run \`npm run verify:pre-pr\``
- `2026-04-20 | implementation start | added the brief directly on the feature branch because it was not yet present on \`main\`, and started the narrow saved-sessions ergonomics slice scoped to label truthfulness, larger selection hit area, and helper-copy cleanup | next: implement the panel contract, update targeted unit/e2e coverage, and generate after screenshots for owner approval before \`verify:pre-pr\``
- `2026-04-20 | planning | created the dedicated saved-sessions ergonomics follow-up after owner feedback locked three concrete improvements on the same surface: replace row action label \`Edit\` with \`Open\`, remove the over-explanatory library cleanup helper sentence, and let the row/name area toggle selection in selection mode without action-button bleed | next: if approved for execution, move this brief to in-progress and implement the saved sessions interaction cleanup end to end`
