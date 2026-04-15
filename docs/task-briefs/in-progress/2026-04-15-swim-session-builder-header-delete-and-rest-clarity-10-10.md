# Task Brief: Swim Session Builder Header, Delete, And Rest Clarity (10/10)

## Metadata

- `id`: `2026-04-15-swim-session-builder-header-delete-and-rest-clarity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-15`
- `updated`: `2026-04-15`

## Goal

Make the saved-session builder calmer and more truthful by removing visible header narration, restoring compact delete placement with confirmation, making manual-pool rest cards read clearly without duplicate rest information, and stripping seeded scaffold note copy from fresh pool drafts.

## Why This Brief Exists

- The saved-session details header still shows low-value system narration:
  - `All changes are saved to this session.`
  - `Saved session PDF`
- `Delete session` is currently over-exposed as a full danger block instead of a compact secondary destructive action with confirmation.
- Manual pool step cards currently create a readability failure:
  - work steps can show `Rest: 0:30`
  - while the next card also renders as a separate rest step
  - and generic labels like `REST 1 OF 2` are not swimmer-friendly.
- Fresh untitled manual-pool drafts still seed scaffold note copy inside note fields, which reads like placeholder/editor guidance instead of authored swimmer content.
- The owner-approved direction is locked:
  - remove visible header narration,
  - move `Delete session` back to the action row,
  - keep a confirm step before actual deletion,
  - name rest cards in relation to their parent step,
  - remove seeded scaffold note text from fresh pool drafts,
  - keep all of this presentation-only so Garmin/export behavior stays unchanged.

## Dependencies And Boundaries

- Parent builder lineage:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md)
- Relevant delivered child briefs this slice extends:
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-14-swim-session-builder-action-clarity-and-safe-discard-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-14-swim-session-builder-action-clarity-and-safe-discard-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-11-swim-session-builder-repeat-summary-and-poolside-note-copy-cleanup-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-11-swim-session-builder-repeat-summary-and-poolside-note-copy-cleanup-10-10.md)
  - [/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-12-swim-session-builder-scan-delete-and-poolside-brand-polish-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-12-swim-session-builder-scan-delete-and-poolside-brand-polish-10-10.md)
- Primary implementation surfaces:
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx)
  - [/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutBuilderHub.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutBuilderHub.tsx)
  - [/Users/stianvikra/freeswimming/lib/workouts/manual.ts](/Users/stianvikra/freeswimming/lib/workouts/manual.ts)
  - [/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx](/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx)
  - [/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts)
- Locked boundaries:
  - no canonical workout schema change,
  - no Garmin/export payload change,
  - no save/delete API redesign,
  - no poolside note HTML/layout changes in this brief,
  - no new persistent draft entity.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Content governance`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                 | Evidence                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The saved-session builder header and step cards read as one clear owner workflow: review, edit, discard, delete, and save without duplicate or misleading wording. | brief review + unit/e2e                   | `5/5`                   |
| UX flow clarity                               | `target`     | No always-visible danger block, no duplicate rest display on the same builder level, and no generic rest labels that hide what the pause belongs to.               | targeted unit/e2e + screenshot review     | `5/5`                   |
| Visual design quality                         | `target`     | The details header becomes quieter, action hierarchy becomes tighter, and manual-pool cards scan faster with less filler text and clearer rest labels.             | screenshot review + local QA              | `5/5`                   |
| Business logic correctness and data integrity | `target`     | All changes remain presentation-only: save/delete/discard semantics and Garmin/export structure stay unchanged while labels and summaries are improved.            | code review + targeted tests              | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes the authenticated owner workout builder, not an admin publishing/editor workflow.                                                   | explicit scope rationale                  | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Delete remains reachable and confirmed, action-row focus order stays logical, and rest labels remain understandable to screen readers.                             | code review + targeted QA                 | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: summary/copy changes must not add client weight or materially slow builder interaction.                                                           | `npm run build` + interaction QA          | `4/5`                   |
| Data placement and sync boundaries            | `target`     | The brief explicitly preserves server-canonical workout data and treats all header/step label changes as local presentation only.                                  | brief contract + implementation diff      | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no new invalidation triggers or cache contracts are introduced because the slice does not change persisted state semantics.                       | code review                               | `4/5`                   |
| Reliability and failure handling              | `target`     | Delete confirmation, discard recovery, and manual-pool editing remain deterministic after the UI cleanup.                                                          | unit/e2e + manual QA                      | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: existing authenticated owner-only delete/save routes remain the same.                                                                             | route review                              | `4/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no personal-data collection, retention, or exposure behavior changes in this private builder slice.                                                    | explicit scope rationale                  | `N/A`                   |
| Content governance                            | `target`     | Builder wording must use one canonical swimmer-facing rest vocabulary: `Rest`, `Interval rest`, and `Set rest`, with no leftover system-helper filler.             | copy review + targeted tests              | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin/operator workflow, moderation flow, or publishing model changes here.                                                                         | explicit scope rationale                  | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is an authenticated My Library surface, not a public crawl target.                                                                                | explicit scope rationale                  | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this private builder cleanup changes no public content or public semantic surface.                                                                     | explicit scope rationale                  | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no new analytics contract is required for this copy/layout cleanup slice.                                                                              | explicit scope rationale                  | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, checkout, or billing behavior changes here.                                                                                   | explicit scope rationale                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this slice changes local owner UX only and does not alter support tooling, escalation paths, or incident runbooks.                                     | explicit scope rationale                  | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance, payout, reconciliation, or reporting path is touched.                                                                                      | explicit scope rationale                  | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this slice standardizes private English builder copy only and does not alter localization architecture.                                                | explicit scope rationale                  | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing builder/delete-confirm/step-summary primitives and add no new dependencies.                                                                     | dependency diff + code review             | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted unit/e2e coverage must protect action-row delete placement, hidden header narration, repeat summary wording, and parent-linked rest naming.               | updated tests + `verify:pre-pr` evidence  | `5/5`                   |
| Scalability and cost efficiency               | `N/A`        | N/A because this slice adds no new background jobs, server cost, or persistent storage.                                                                            | explicit scope rationale                  | `N/A`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: rollback remains straightforward because the slice is UI-only with no migration or API contract change.                                           | diff review + `verify:pre-merge` evidence | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical data:
  - `workout.id`,
  - persisted draft step structure,
  - repeat-group relationships,
  - delete/save semantics,
  - Garmin/export-ready canonical step data.
- Local-only data:
  - action-row presentation,
  - visible header narration state,
  - step-card labels and summaries,
  - pending delete confirmation UI,
  - local edit/view open-state.
- Sync policy:
  - save/delete continue to use current server paths,
  - this brief must not add new writes or invalidate additional routes,
  - rest/card labels must derive from the current local draft without mutating canonical structure.
- Retention and sensitivity:
  - no new sensitive data,
  - no new local persistence,
  - existing discard/delete recovery behavior remains unchanged.
- Cache/invalidation:
  - unchanged from the current builder save/delete flow.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the canonical saved-session identity.
- Human-readable identifiers:
  - visible step labels, repeat summaries, and action labels are presentation-only and may change without affecting canonical identities.
- Mutability rules:
  - UI labels are renameable in place,
  - canonical step IDs and repeat-group IDs are unchanged.
- Rename vs repurpose policy:
  - improve label clarity in place,
  - do not reinterpret or repurpose canonical rest steps into a different persistence model.
- Compatibility contract:
  - Garmin/export logic must continue to read the same draft structure and relations after the UI cleanup.
- Observability and repair:
  - targeted tests must catch regressions where wording changes accidentally change structure or delete semantics.

## Scope

- Hide the visible saved-state and saved-PDF narration in the calm saved-session details header while keeping any required semantic state hooks intact.
- Remove the always-visible `Danger zone` block from the builder details surface.
- Place `Delete session` back in the top action row as a low-emphasis destructive button for saved sessions only.
- Keep the existing confirmation step before actual delete.
- Preserve `Discard changes` as a dirty-only action and keep it distinct from delete.
- Remove duplicate manual-pool rest presentation in builder step cards:
  - do not show the same rest both inline on the work step and as a separate rest card.
- Rename manual-pool rest cards so they inherit their parent context where applicable:
  - `Warmup Rest`
  - `Cooldown Rest`
  - `Main 1 of 2 - Rest`
  - `Main 1 of 2 - Interval Rest`
  - `Main 1 of 2 - Set Rest`
- Remove low-value manual-pool helper copy in the targeted summaries/cards:
  - `400m repeated distance`
  - `Adjust or remove when you refine the workout.`
  - `Separate canonical rest after the set, outside the repeat block itself.`
- Reformat repeat summaries into swimmer-facing scan copy such as:
  - `4 x 100m · Interval rest 0:30 · Set rest 0:45`
- Remove seeded scaffold note text from fresh untitled manual-pool drafts so note fields start empty unless the owner authors content.
- Keep the implementation presentation-only so Garmin/export parity remains unchanged.

## Out Of Scope

- Poolside note portrait/landscape composition changes.
- Poolside preview favicon/head changes.
- Standard full-session PDF redesign.
- Canonical step schema, migrations, or API contracts.
- New undo/history models beyond current shipped behavior.

## Acceptance Criteria

1. The calm saved-session details header no longer shows visible `All changes are saved to this session.` or `Saved session PDF`.
2. `Delete session` appears in the top action row for saved sessions and the always-visible danger block is gone.
3. Clicking `Delete session` still requires confirmation before the actual delete call.
4. `Discard changes` remains visible only when there are unsaved edits.
5. Top-level manual-pool work-step cards no longer show a linked rest inline when that rest is also rendered as its own card.
6. Parent-linked rest names replace generic labels like `REST 1 OF 2`.
7. Repeat summaries no longer show `400m repeated distance` and instead use the compact swimmer-facing rest format.
8. The removed helper copy strings no longer appear in the targeted builder surface.
9. Fresh untitled manual-pool drafts no longer seed scaffold note text into workout step notes.
10. Garmin/export semantics and persisted draft structure remain unchanged.
11. Relevant tests and `verify:pre-pr` / `verify:pre-merge` pass.

## Validation

- `npm run lint:briefs`
- targeted `vitest`:
  - `tests/unit/workout-builder-hub.test.tsx`
- targeted `playwright`:
  - `tests/e2e/my-library-workout-builder.spec.ts`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm installed locally.
- Validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/workouts/<id>`
- Preview:
  - Vercel preview URL from the PR checks.
- Recommended matrix:
  - iPhone Safari
  - Desktop Safari
  - Desktop Chrome

## Constraints

- Keep visible builder copy in English.
- Treat this as a presentation/clarity cleanup, not a model rewrite.
- Do not degrade Garmin readiness, export semantics, or save/delete truthfulness.
- Keep the destructive action compact but explicit.

## 10/10 Quality Bar

- The details header must read calm and action-oriented, not explanatory.
- The action row must have one obvious primary action (`Save changes`) and one clearly secondary destructive action (`Delete session`).
- Manual-pool step cards must be scannable without making the user mentally reconcile duplicated pauses.
- Rest naming must match the swimmer’s mental model rather than internal implementation order.
- Required states remain clear:
  - loading: unchanged,
  - empty: unchanged,
  - error: existing save/delete failure handling remains explicit,
  - retry: current delete-confirm/discard-recovery behavior remains intact,
  - offline: unchanged.

## Checkpoint Log

- `2026-04-15 | planning | created combined builder cleanup brief from owner-approved follow-up scope: remove visible details narration, remove the always-visible danger zone, restore compact delete placement with confirm, clean up manual-pool rest naming/summaries, and remove scaffold note filler from fresh pool drafts without touching Garmin structure | next: implement the UI cleanup and verify with targeted unit/e2e plus full gates`
- `2026-04-15 | implementation | completed builder-header cleanup, compact delete action placement, parent-linked rest naming/summary cleanup, and removal of seeded scaffold note copy from fresh manual pool drafts; targeted unit/e2e plus full verify:pre-pr passed locally | next: commit, push, open/update PR, then run verify:pre-merge and monitor CI`
