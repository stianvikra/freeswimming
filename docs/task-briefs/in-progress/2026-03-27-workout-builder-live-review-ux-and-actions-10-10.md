# Task Brief: Workout Builder Live-Review UX And Actions (10/10)

## Metadata

- `id`: `2026-03-27-workout-builder-live-review-ux-and-actions-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-03-27`
- `updated`: `2026-03-29`

## Goal

Turn the current live-review wave of workout-builder and My Library friction into one focused UX/actions slice so manual workout authoring, cleanup, printing, and builder navigation feel trustworthy before program-builder work starts.

## Why This Brief Exists

- Real use in `freeswimming.org` surfaced builder friction that is now more valuable than speculative program-builder work.
- The builder currently lets the owner create multiple canonical workouts, but basic cleanup and action ergonomics are still incomplete.
- Several notes are tightly related enough that splitting them now would create artificial seams:
  - workout delete/edit/print actions,
  - collapsible default states,
  - clearer edit-form language,
  - calmer builder-only notices,
  - poolside/PDF truthfulness,
  - My Library IA confusion around `Program shell` and extra mode buttons.
- This brief is intended to own the current UX/action batch without reopening the broader workout-builder parent brief for every small live-review note.

## Dependencies And Boundaries

- Parent builder/runtime foundation:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md`
- Epic-level orchestration:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-02-28-workout-builder-garmin-familiar-epic-10-10.md`
- Export lineage that must stay truthful:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-02-28-workout-export-adapters-garmin-ready-pdf-10-10.md`
- Program foundation/My Library lineage:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-25-canonical-program-foundation-and-library-shell-10-10.md`
- Locked boundary decisions unless owner explicitly reprioritizes:
  - no weekly program calendar/planner implementation in this slice,
  - no AI session/program generation changes,
  - no Garmin Training API push,
  - no training-history reconciliation changes,
  - do not introduce a parallel workout model; canonical workout remains authoritative.

## Admin Notes Triage Disposition

Production admin notes reviewed against this brief on `2026-03-27`:

- `fed5e8b6-71a5-4b35-8549-2155a2cccdfe` `How do I delete workouts?`
  - disposition: owned by this brief.
  - reason: missing destructive cleanup is a core workout-builder ergonomics gap.
- `f09ade9f-8301-49c3-980f-366675bdb46d` `Delete, edit, print  buttons for the workouts`
  - disposition: owned by this brief.
  - reason: same saved-workout action surface as the delete gap above.
- `fd9d4210-be56-4a02-855f-a347fcbfadeb` `Remove print, ref screenshot`
  - disposition: owned by this brief.
  - reason: print/poolside affordances need one coherent builder/export IA decision.
- `af6ab360-04d1-454c-8824-090260f088e8` `Make collapsable and keep collapsable by default`
  - disposition: owned by this brief.
  - reason: builder read surfaces and diagnostics need calmer default density during repeated authoring.
- `3396b47c-4b78-4a72-bc55-b6806e0fc620` `Edit form`
  - disposition: owned by this brief.
  - reason: edit-form terminology and stroke taxonomy are part of the same live-review authoring polish wave.
- `5b15cd93-813f-415b-a555-6f0bf6729bf7` `Information messages`
  - disposition: owned by this brief.
  - reason: builder notices should match the same calmer UX language and placement strategy.
- `db185e47-0794-4e84-b881-5507d526f911` `Poolside PDF`
  - disposition: owned by this brief.
  - reason: poolside print/PDF shape is part of the same truthful execution/export surface review.
- `a73a376b-1912-457f-9df6-474ffaf48b4c` `What is this?`
  - disposition: owned by this brief.
  - reason: `Program shell` confusion is a My Library IA issue adjacent to builder progress and should be decided before planner work restarts.
- `7e075645-84e8-4fcb-a23e-518862ad03d5` `Ehy i smh library button here`
  - disposition: owned by this brief.
  - reason: My Library mode/button clarity belongs in the same IA clean-up wave as `Program shell`.
- `f21f4a8d-7afa-4eeb-a572-53f1d5c85996` `Create manual workout`
  - disposition: owned by this brief.
  - reason: manual session entrypoint naming and whether the editor should dominate the page are part of the same builder IA/entry flow review.
- `c54e1d72-3efb-47a7-ab7e-ef4f32d05d33` `Rename Workout builder`
  - disposition: owned by this brief.
  - reason: builder naming should stay coherent if workout/session/strength/stretch variants expand later.
- `a1d2db16-2f21-4d38-add1-62a462cfa015` `PDF`
  - disposition: owned by this brief.
  - reason: PDF naming, compact poolside variant expectations, and focus-line content all belong to the same export-truthfulness wave.
- `ac6ab21e-063c-4a60-a2e3-1d4878856eb0` `Delete current workout location UI and UX`
  - disposition: owned by this brief.
  - reason: current-workout delete placement and builder-entry visibility are still part of the same live-review action/IA cleanup.

Triage update on `2026-03-28`:

- closed as effectively shipped:
  - `fed5e8b6-71a5-4b35-8549-2155a2cccdfe` `How do I delete workouts?`
  - `f09ade9f-8301-49c3-980f-366675bdb46d` `Delete, edit, print buttons for the workouts`
- split residual follow-up notes for partially shipped originals:
  - `d76825bd-4b5c-4e7e-aa22-49e6c25350ba` `Saved workouts list density follow-up` from `af6ab360-04d1-454c-8824-090260f088e8`
  - `9245eaba-e5fd-4bc2-83c1-2f53c7df100e` `Workout builder drill and kick taxonomy follow-up` from `3396b47c-4b78-4a72-bc55-b6806e0fc620`
  - `854d3f39-9275-4d80-a624-a687e47db320` `Workout builder notice placement and audience follow-up` from `5b15cd93-813f-415b-a555-6f0bf6729bf7`

Triage update on `2026-03-29`:

- closed as fully shipped:
  - `c54e1d72-3efb-47a7-ab7e-ef4f32d05d33` `Rename Workout builder`
- kept open for the current UX/IA cleanup slice:
  - `f21f4a8d-7afa-4eeb-a572-53f1d5c85996` `Create manual workout`
  - `ac6ab21e-063c-4a60-a2e3-1d4878856eb0` `Delete current workout location UI and UX`
  - `fd9d4210-be56-4a02-855f-a347fcbfadeb` `Remove print, ref screenshot`
  - `a73a376b-1912-457f-9df6-474ffaf48b4c` `What is this?`
  - `7e075645-84e8-4fcb-a23e-518862ad03d5` `Ehy i smh library button here`

Triage update on `2026-03-29` for the current builder-entry follow-up:

- `d487ac23-a1e0-4be9-938a-7407a3c35fe0` `Swim Session Builder`
  - disposition: owned by this brief.
  - reason: the production note is a direct continuation of the active builder-entry IA work and asks for a focused `View sessions` / `Create session` model, a truthful continue-vs-start-new choice, and a more form-first builder route.
  - implementation constraint: there is still no separate cross-page unsaved local draft entity, so `continue draft` must be expressed truthfully as continuing the latest saved/current canonical session rather than implying a hidden draft store.

Triage update on `2026-03-29` for session-browse and poolside-export follow-up:

- `a1d2db16-2f21-4d38-add1-62a462cfa015` `PDF`
  - disposition: still owned by this brief.
  - reason: the live note explicitly asks for a clearer split between the normal session PDF and the smaller operational lane-side output.
- `db185e47-0794-4e84-b881-5507d526f911` `Poolside PDF`
  - disposition: still owned by this brief.
  - reason: the live note asks for quarter-A4 readability and stricter "only what is needed on deck" execution formatting.
- no separate new production note was found for the just-discussed `View sessions` browse-mode request during the `2026-03-29` re-check of current open `/my-library` and `/my-library/workouts/*` notes.
  - disposition: keep this UX change owned by the active brief because it is the direct next step of the same live-review builder IA wave and was requested during the same production review session.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Admin workflow and editability`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                | Evidence                                |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Product goals and IA                          | `target`     | Builder and My Library surfaces make it obvious how to create, reopen, edit, delete, print, and understand workout/program placeholders.      | IA review + manual QA + e2e             |
| UX flow clarity                               | `target`     | A user can identify the right action on saved workouts without guessing, hidden steps, or conflicting duplicate controls.                     | timed manual QA + e2e                   |
| Visual design quality                         | `target`     | Builder actions, notices, collapsible panels, and print affordances feel calmer and more intentional than the current crowded state.          | screenshot review + manual QA           |
| Business logic correctness and data integrity | `target`     | Delete/edit/print actions operate on canonical workout IDs only, with explicit confirmation and no ambiguous partial-delete state.            | unit tests + API tests + runtime guards |
| Admin editor ergonomics                       | `target`     | Manual builder work remains fast enough for repeated real-world testing, including cleanup of extra workouts and calmer read surfaces.        | timed manual QA + e2e                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: added actions, collapsible sections, and PDF/print affordances must remain keyboard/touch accessible.                        | code review + targeted e2e              |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: action-density and collapse defaults must not materially regress builder route responsiveness or payload size.               | verify evidence + scope rationale       |
| Data placement and sync boundaries            | `target`     | Brief defines which builder/workout values are server-canonical vs local-only UI state, and destructive actions invalidate deterministically. | brief contract + tests                  |
| Caching and invalidation strategy             | `supporting` | Supporting only: saved-workout lists and detail views refresh deterministically after delete/edit/print-state mutations.                      | code review + targeted tests            |
| Reliability and failure handling              | `target`     | Delete, print, and collapse flows show explicit failure/retry guidance instead of silent no-ops or stuck UI.                                  | negative-path tests + manual QA         |
| Security and authz                            | `supporting` | Supporting only: workout actions stay owner-scoped/authenticated and do not widen access beyond existing My Library boundaries.               | existing auth tests + code review       |
| Privacy and compliance                        | `N/A`        | N/A because this slice changes builder ergonomics and owner-scoped workout actions, not personal-data policy or public data disclosure.       | scope rationale                         |
| Content governance                            | `supporting` | Supporting only: copy and label cleanup must stay aligned with the canonical workout model and existing export semantics.                     | copy review + parent-brief alignment    |
| Admin workflow and editability                | `target`     | Saved workouts can be cleaned up, reopened, printed, and reviewed without forcing detours into unrelated surfaces.                            | e2e + timed manual QA                   |
| SEO and crawlability                          | `N/A`        | N/A because My Library and workout-builder actions are authenticated/private and do not add public crawl-index surfaces.                      | scope rationale                         |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public AI-discoverable route or metadata contract.                                                          | scope rationale                         |
| Analytics and KPI observability               | `supporting` | Supporting only: action usage such as delete/print/open should remain measurable enough to evaluate builder friction later.                   | event review + code review              |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, billing, entitlement, or commercial reporting logic changes in this builder UX slice.                                 | scope rationale                         |
| Incident response and support operations      | `supporting` | Supporting only: Help/Guide and runbook updates should explain any new destructive-action recovery or print/PDF guidance if shipped.          | help/runbook review                     |
| Finance and reporting operations              | `N/A`        | N/A because no finance reconciliation, payout, or reporting surface is changed by saved-workout UX cleanup.                                   | scope rationale                         |
| i18n operational readiness                    | `N/A`        | N/A for this slice because the work is label/IA cleanup inside owner-only builder flows and should not block later localization models.       | scope rationale                         |
| Stack-fit and dependency discipline           | `target`     | Reuse existing builder, list, and export primitives; do not introduce new state or PDF libraries without clear necessity.                     | dependency diff + architecture review   |
| Testing and QA automation                     | `target`     | Coverage protects delete, edit/open actions, collapse defaults, truthful print affordances, and My Library IA decisions.                      | unit/e2e coverage + `verify:pre-pr`     |
| Scalability and cost efficiency               | `supporting` | Supporting only: action cleanup should reduce operator churn without adding wasteful repeated fetch/render or export cost patterns.           | code review + manual QA                 |
| DevOps and rollback readiness                 | `target`     | Action-surface changes remain reversible without schema drift, and any destructive API addition includes a clear rollback path.               | migration review + PR rollback notes    |

## Data Placement And Sync Contract

- Server-canonical:
  - saved workout rows, workout steps, workout owner scope, export/handoff eligibility state, any persisted print/PDF metadata.
- Local-only:
  - collapse/expand state,
  - transient notices,
  - unsaved form edits,
  - local confirmation dialogs,
  - transient print-preview selections.
- Sync policy:
  - canonical workout save/delete/edit actions become authoritative only after server confirmation,
  - destructive actions must target canonical workout IDs, not visible card order,
  - list surfaces must refresh deterministically after delete or rename.
- Retention and sensitivity:
  - delete is explicit owner cleanup of owner-scoped training content and should remove the canonical workout row according to existing retention policy,
  - no extra hidden shadow copies should remain after successful delete beyond standard audit-safe storage that already exists in the platform.
- Cache/invalidation:
  - saved workout list, workout editor route, recent accepted workouts, and any linked print/handoff surfaces must invalidate on delete/update.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the only canonical workout identity across builder, My Library, export, and later program planning.
- Human-readable identifiers:
  - workout title, description, list subtitle, and PDF labels are editable display metadata and must not be used as canonical identifiers.
- Mutability rules:
  - title/description/session metadata are editable in place,
  - delete removes the workout entity instead of repurposing it,
  - print/export affordances must reflect the current canonical workout state only.
- Rename vs repurpose policy:
  - editing a workout title or description is an in-place rename,
  - materially different sessions should be created as a new workout, not silently overwrite an unrelated saved workout.
- Compatibility contract:
  - existing saved workouts remain valid even if new builder actions or collapsed defaults are added,
  - `Program shell` and My Library mode changes must not break existing links/routes.
- Observability and repair:
  - unresolved workout IDs, failed delete attempts, and stale list rows should surface explicit refresh/retry guidance rather than silent disappearance or stale cards.

## Scope

- Add missing saved-workout actions where they are operationally needed:
  - delete workout,
  - consistent open/edit affordances,
  - truthful print/PDF affordances.
- Make builder entry and resume choices easier to understand:
  - `View sessions` for existing saved sessions,
  - `Create session` for a new manual session,
  - if a saved/current session already exists, offer a small continue-vs-start-new decision instead of silently creating another scaffold.
- Rationalize builder/export entrypoints so redundant or misleading print controls are removed or merged into one clearer flow.
- Make noisy builder support panels calmer by default:
  - Garmin JSON,
  - workout handoff,
  - recent accepted workouts,
  - similar read-heavy panels discovered in implementation.
- Clean up workout edit-form language and authoring inputs:
  - remove misleading `Draft` prefixes where they do not represent workflow state,
  - remove low-value title suggestions if they add clutter,
  - support clearer stroke taxonomy for `drills` and `kicks` where the current form is too narrow.
- Move builder-only informational messages into calmer, truthful placement and keep them owner/admin-only where appropriate.
- Clarify My Library IA around:
  - `Program shell`,
  - extra mode buttons such as `Explore mode` / redundant `My Library` controls,
  - whether those surfaces should be hidden, renamed, or explained.
- Tune poolside/PDF output toward the observed real-world print use case without promising a broader document system than we actually support.
- Add a dedicated saved-session browse mode that keeps `View sessions` list-first:
  - existing saved sessions should be browsed in a dedicated list-first surface,
  - that surface should still expose a direct `Create session` action,
  - the editor route should stay focused on one session at a time.
- Strip browse-mode chrome down to what the owner actually needs:
  - `My sessions` should be the only page-level browse heading,
  - duplicate instructional copy inside the browse surface should be removed,
  - saved-session count should stay secondary and right-aligned instead of acting like explanatory copy.
- Add a quick inline preview path in the saved-session list:
  - a lightweight `View` disclosure should expand/collapse a plain-text preview for one session at a time without opening the editor.
- Rename the compact lane-side output from `Poolside PDF` to `Poolside Note` wherever that improves truthfulness for real use.
- Tighten `Poolside Note` content so it carries only operational essentials:
  - one line per interval when possible,
  - explicit pause lines using `P:` formatting when the workout model exposes a rest step,
  - total distance,
  - focus list,
  - no extra diagnostic or coaching chrome beyond what is genuinely useful on deck.
- Keep the builder route form-first:
  - when a session is being edited, the session form should remain the dominant surface,
  - saved-session browsing should stay secondary behind an explicit action instead of always sharing equal visual weight.
- Keep My Library entry cards calm and action-first:
  - `Swim session builder` and `Dryland builder` should show titles and actions, not front-card preview metadata from the latest saved session.

## Out Of Scope

- Weekly program-builder calendar/planner implementation.
- AI workout or program generation changes.
- Garmin Training API push or provider integrations.
- Training-history completion/reconciliation work.
- Replacing the canonical workout model or adding a second persisted workout representation.
- Broad notes-system changes beyond builder-facing notices or guidance touched by this UX work.

## Acceptance Criteria

1. Saved-workout lists expose a clear delete path with confirmation and deterministic post-delete refresh.
2. Saved-workout surfaces expose coherent open/edit/print behavior without duplicate or contradictory calls to action.
3. Read-heavy builder support panels can be collapsed and default to a calmer state where that materially improves repeated authoring.
4. Workout edit-form labels no longer imply incorrect workflow state, and low-value suggestion clutter is removed when it adds more noise than help.
5. Stroke/taxonomy affordances for drills and kicks are handled explicitly enough that authors do not need to misuse unrelated stroke fields.
6. Builder notices appear in calmer placement and remain truthful about audience and persistence.
7. My Library no longer shows unexplained `Program shell` or confusing mode buttons without an explicit IA decision.
8. Poolside/PDF affordances are truthful to the actual supported output, and the preferred print flow is clearer than the current state.
9. Relevant production admin notes listed above remain explicitly owned by this brief until shipped or intentionally split again.
10. Builder entry uses explicit `View sessions` and `Create session` actions, and creating a new manual session from an environment with existing saved work offers a truthful continue-vs-start-new choice.
11. Starting a new manual session opens a clean scratch session shell rather than a multi-block starter set, while still preserving canonical save guarantees and clear session identity.
12. `View sessions` becomes a dedicated browse-first surface with the saved-session list as the main content and a direct `Create session` action available there.
13. Saved-session rows expose a lightweight `View` disclosure that expands one plain-text session preview at a time without forcing the owner into edit mode.
14. The compact lane-side output is labeled `Poolside Note` in product surfaces and is materially more operational than the full session PDF.
15. `Poolside Note` formatting includes total distance, focus points, and explicit `P:` pause lines wherever the canonical workout model exposes rest/recovery entries that can be rendered truthfully.
16. `My sessions` is the only browse-page heading, duplicate explanatory copy is removed, and saved-session count stays secondary instead of explaining the page twice.
17. My Library session-entry cards keep only builder titles and relevant actions, without misplaced latest-session preview text on the card face.
18. `npm run lint:briefs`, targeted validation, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted unit tests for:
  - workout delete action/state transitions,
  - builder list/action availability,
  - print/PDF affordance gating,
  - collapse default state logic
- targeted e2e for:
  - My Library workout list actions,
  - manual workout builder cleanup flow,
  - print/PDF entry flow,
  - My Library IA visibility/regression checks
- `npm run verify:pre-pr`
- before merge recommendation: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.

## Checkpoint Log

- `2026-03-29` — slice 6 expanded on branch `fix/swim-sessions-and-generator-ia-cleanup-2026-03-29`; live review tightened the builder-owned IA again by removing latest-session preview text from the My Library swim/dryland cards, renaming the browse route to `My sessions`, and stripping duplicate browse-mode explainer copy so the saved-session list can do the work. Next step: finish the paired generator cleanup in the child generator brief, run targeted validation, and then `npm run verify:pre-pr`.
- `2026-03-29` — slice 5 implemented on branch `fix/workout-builder-ux-ia-cleanup-2026-03-29`; simplified My Library IA by removing the extra owned/explore jump controls, reframed the early program surface as an optional `Program builder preview`, made manual session entry language more direct, tightened current-session delete copy, and moved builder-route PDF access into the save/action bar instead of a separate support panel. Targeted `typecheck`, builder unit tests, `my-library-workout-builder` desktop Chromium, and `my-library-program-export` desktop Chromium (schema-gated skip after updated readiness detection) are green. Next step: run `npm run lint:briefs` and `npm run verify:pre-pr`, then open/update a PR if green.
- `2026-03-29` — added production note `d487ac23-a1e0-4be9-938a-7407a3c35fe0` `Swim Session Builder` to this brief. The next slice will make entry actions explicit (`View sessions` / `Create session`), use a truthful continue-vs-start-new chooser when saved work already exists, switch manual create to a clean scratch session shell, and keep saved-session browsing secondary behind an explicit action so the builder route stays form-first.
- `2026-03-28` — slice 4 implemented on branch `fix/workout-builder-focused-entry-2026-03-28`; renamed the workout-builder surface to `Swim session builder`, made the current saved session/editor the primary route focus, kept other saved sessions secondary instead of duplicating the active one, and simplified row-level PDF language from `Poolside PDF` to `PDF`. Targeted `vitest`, `typecheck`, and desktop-chromium generator/workout-builder e2e are green. Next step: run `npm run lint:briefs` and `npm run verify:pre-pr`, then open a PR if green.
- `2026-03-27` — moved to `in-progress` on branch `fix/workout-builder-live-review-actions-2026-03-27`; first implementation slice adds owner-scoped workout delete API/UI, calmer collapsed support panels, builder label cleanup, and My Library wording cleanup. Next step: finish targeted validation and run `npm run verify:pre-pr`.
- `2026-03-28` — slice 3 implemented on branch `fix/workout-builder-current-actions-2026-03-28`; added current-workout action strip, clearer PDF state copy, bluer poolside PDF styling, and targeted generator-intake auth-redirect hardening after a confirmed `verify:pre-merge` auth/Supabase flake. Next step: rerun targeted generator-intake coverage, rerun `npm run verify:pre-merge`, then merge if green.
- `2026-03-28` — local `verify:pre-merge` also exposed a macOS-specific `.next/.DS_Store` build flake (`ENOTEMPTY` while Next tried to remove `.next/server`). Added a pre-build sanitizer so local gates stop failing on Finder metadata rather than product code. Next step: rerun `npm run build`, then rerun `npm run verify:pre-merge` on the hardened build path.
- `2026-03-28` — post-merge prod triage added four newer builder/admin notes to this brief (`Create manual workout`, `Rename Workout builder`, `PDF`, and `Delete current workout location UI and UX`) and prepared residual follow-up splits for the parts of older notes that are no longer the primary ask after shipped slices. Next step: keep this brief open for the next workout-builder UX pass while generator-intake clarity is handled in its own child brief first.
- Local validation runs from repo root.

## Manual QA Environments

- Production review:
  - `https://freeswimming.org/my-library/workouts`
- Local iteration:
  - `http://127.0.0.1:3000/my-library/workouts`
- Preview:
  - PR Vercel preview URL for the implementation branch

## Constraints

- Keep visual language aligned with existing builder/My Library patterns unless the note explicitly calls for removal or simplification.
- Do not hide unfinished surfaces in a misleading way; if `Program shell` remains visible, it must be explained truthfully.
- Do not add destructive shortcuts without confirmation/recovery guidance.
- Keep poolside/PDF claims narrower than the currently supported export contract.

## 10/10 Quality Bar

- The builder should feel safe to use repeatedly for real workouts, not like a prototype that accumulates test clutter.
- Destructive actions must feel deliberate, reversible where possible, and never ambiguous.
- Required UI states for changed surfaces:
  - `loading`
  - `empty`
  - `error`
  - `retry`
  - `success`
  - delete pending/confirm
  - print unavailable/truthful fallback
- Information density should go down, not up.
- Any change to workout actions or My Library IA must leave the canonical workout contract clearer than before.

## Help/Guide And Operator Training Contract

- Required if this slice changes workout-builder labels, delete recovery language, print guidance, or My Library explanation copy:
  - update the relevant Help/Guide surface and any builder runbook/help copy in the same PR,
  - update at least one automated assertion if help contract text changes.
- This slice still has no dedicated in-product My Library/workout-builder Help surface, so the contract is satisfied by:
  - updating `docs/runbooks/core-flow-incident-response.md` for the new saved-workout and canonical PDF verification path,
  - keeping automated regression coverage in `tests/e2e/my-library-workout-builder.spec.ts`,
  - treating `AdminHelpCenter` as `N/A` for this owner-only builder slice because no admin workflow/help copy changed.

## Security, Privacy, and Compliance

- All delete/edit/print actions must remain owner-scoped and authenticated.
- No secrets or raw export tokens may appear in builder UI.
- Destructive actions must fail closed on unauthorized access and return `401`/`403` instead of `500`.

## Observability and KPI Contract

- Required events/logs if analytics hooks already exist:
  - workout delete initiated/completed/failed,
  - print/PDF opened,
  - saved-workout action usage (`open`, `edit`, `delete`),
  - collapse usage for heavy builder panels when helpful.
- Success KPI for this slice:
  - owner can create, reopen, delete, and print a workout without guessing or leaving cleanup debt behind.

## Session Continuity and Recovery

- Canonical source of truth: git branch + this brief path.
- Checkpoint cadence:
  - commit at each validated implementation milestone,
  - update the checkpoint log before any pause or PR handoff.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint note

## Git Rhythm Defaults

- Commit + push after each validated builder UX slice.
- Open/update PR after one coherent vertical slice or after `2-4` validated checkpoint commits, whichever comes first.

## Automation Mode

- `automation-first`
  - assistant handles implementation, tests, git checkpoints, push, PR open/update, and CI monitoring unless blocked by credentials, UI-only approval, or an explicit owner decision.

## Branch Hygiene Defaults

- Post-merge cleanup:
  - `git checkout main`
  - `git pull --ff-only origin main`
  - `git branch -d <merged-branch>`
  - `git push origin --delete <merged-branch>` when appropriate

## PR Browser Rule

- Default PR create/review/merge links open in Safari.

## Manual QA URL Rule

- Default UI QA links should be opened in Safari before requesting owner confirmation.

## Checkpoint Log

- `2026-03-29 | implementation | slice 9 on branch fix/swim-sessions-and-generator-ia-cleanup-2026-03-29 removes misleading current-session preview lines from the My Library swim and dryland entry cards, simplifies the dedicated swim browse route to a calmer `My sessions`surface with session count + create action only, and aligns reused canonical session-list language inside the focused builder to`My sessions`instead of`Recent accepted workouts`; targeted workout/generator vitest and desktop-chromium my-library workout-builder + generator-intake + dryland e2e are green | next: run npm run lint:briefs and npm run verify:pre-pr, then commit/push/open PR if the full gate stays green`
- `2026-03-29 | implementation | slice 8 on branch fix/workouts-view-sessions-and-poolside-note-2026-03-29 splits saved-session browsing into a dedicated View sessions route, adds inline plain-text preview per saved session, renames the compact lane-side export from Poolside PDF to Poolside Note, and tightens the lane-side output to operational lines with explicit P: pauses, Tot total distance, and focus carry-through; targeted typecheck, workout-builder vitest, workouts shared/routes vitest, desktop-chromium my-library workout-builder e2e, and brief lint for the changed brief are green (full --all lint still only fails on older historical briefs outside this slice) | next: run npm run verify:pre-pr, then commit/push/open PR if the full gate stays green`
- `2026-03-29 | implementation | slice 7 on branch fix/workout-builder-draft-first-entry-2026-03-29 makes builder entry explicit with `View sessions`and`Create session`, adds a truthful continue-vs-start-scratch chooser whenever saved work already exists, opens the builder route with saved sessions hidden unless explicitly requested, and switches manual create to a cleaner scratch session shell that still respects current workout persistence constraints; targeted unit + desktop-chromium builder e2e + desktop-chromium program-export e2e and full npm run verify:pre-pr are green | next: commit, push, open/update PR, then wait for CI before npm run verify:pre-merge`
- `2026-03-29 | implementation | slice 6 on branch fix/workout-builder-pdf-poolside-v2-2026-03-29 splits the builder export into a richer full-session PDF and a real compact Poolside PDF, threads open training focuses into the poolside variant, makes one-line-per-interval poolside layout explicit, and surfaces both PDF actions consistently in the editor and saved-session list; targeted typecheck, workout PDF/shared vitest, workout route vitest, builder hub vitest, and desktop-chromium my-library workout-builder e2e are green | next: run npm run verify:pre-pr, then open/update a PR if the full gate stays green`
- `2026-03-27 | planning | created a dedicated workout-builder live-review UX/actions brief to own the current production-note batch around delete/edit/print actions, calmer panel defaults, form copy cleanup, poolside PDF truthfulness, and My Library IA confusion before program-builder work resumes | next: review manual workout-builder usage against this brief, then pick the first narrow implementation slice`
- `2026-03-28 | implementation | slice 2 on branch fix/workout-builder-pdf-notices-2026-03-28 adds row-level canonical Poolside PDF links for saved workouts, auto-dismisses transient builder success notices, and clarifies kick/drill authoring guidance without changing the canonical workout model; targeted typecheck, vitest, and desktop-chromium workout-builder e2e are green | next: update runbook coverage, then run npm run lint:briefs and npm run verify:pre-pr`
- `2026-03-28 | implementation | slice 3 on branch fix/workout-builder-current-actions-2026-03-28 makes the current saved workout deletable without opening the saved-workouts list, clarifies whether the editor PDF opens the saved workout or current draft, adds whole-workout description guidance, and updates the poolside PDF palette to match the site's blue direction more closely; targeted vitest, typecheck, and desktop-chromium workout-builder e2e are green | next: run npm run lint:briefs and npm run verify:pre-pr, then open/update PR if the full gate stays green`
