# Task Brief: Swim Session Builder Helper Copy And Delete Copy Cleanup (10/10)

## Metadata

- `id`: `2026-04-10-swim-session-builder-helper-copy-and-delete-copy-cleanup-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-10`
- `updated`: `2026-04-10`

## Goal

Remove the remaining low-value helper copy from the swim-session builder without changing metadata, workflow, or canonical workout semantics.

## Why This Brief Exists

- A live admin-notes re-check on `freeswimming.org` on `2026-04-10` showed that the metadata-panel slice is already shipped on `main`, but a few lower-level builder copy issues are still open:
  - step summaries still use `Target <Effort>` wording where `Effort <Effort>` is clearer,
  - the lap-button duration helper text still explains the obvious,
  - repeat blocks still include extra teaching copy that is no longer needed after the newer repeat/rest work,
  - the saved-sessions delete confirmation still uses over-explanatory canonical/local-edit wording.
- These are small truthfulness and density fixes, not model or workflow changes.

## Dependencies And Boundaries

- Parent swim-session builder brief:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-03-27-workout-builder-live-review-ux-and-actions-10-10.md`
- Already shipped metadata-panel slice that must remain intact:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-05-swim-session-builder-metadata-panel-clarity-10-10.md`
- Already shipped create-vs-edit behavior that must remain intact:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-05-swim-session-builder-create-vs-edit-clarity-10-10.md`
- Relevant implementation files:
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx`
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/SavedWorkoutsPanel.tsx`
  - `/Users/stianvikra/freeswimming/lib/session-generator-v1/shared.ts`
  - `/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx`
  - `/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts`

## Admin Notes Triage Disposition

Production admin notes were re-checked against live `freeswimming.org` on `2026-04-10`.

- `68e1e612-c9e8-4ac3-b3bb-ca284b6ed3db` `Swim session builder`
  - disposition: owned by this brief.
  - reason: asks for clearer automatic effort wording and removal of low-value step/repeat helper text.

- `7a506574-6245-468c-8aea-17e1444c672a` `Swim session builder`
  - disposition: owned by this brief.
  - reason: asks to remove the over-explanatory delete-helper sentence on the saved-sessions surface.

- `e86b5ede-65d7-477e-a641-decc7755116c` `SWIM SESSION BUILDER`
  - disposition: partially not owned by this brief.
  - reason: its pool-size copy asks appear stale against newer shipped work, and its residual single-step/rest request is a separate workflow decision.

- `814ced4c-77e9-4b62-afaf-7ca8424d9ae0` `Swim session builder`
  - disposition: not owned by this brief.
  - reason: belongs to pool-size note reconciliation because it references the older `Unspecified` flow.

- `a175f6bc-6814-4010-9f4a-e6620fb9f5dc` `My Swim Sessions`
  - disposition: not owned by this brief.
  - reason: bulk delete remains out of scope.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                      | Evidence                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Remaining builder helper copy only appears where it adds real meaning; obvious or redundant explanation is removed.                                               | copy review + manual QA                  | `5/5`                   |
| UX flow clarity                               | `target`     | Step, repeat, and delete surfaces read faster with less filler text while still staying truthful about the action/state.                                          | manual QA + targeted unit                | `5/5`                   |
| Visual design quality                         | `target`     | The builder feels calmer after the low-value helper text is reduced, without adding new visual clutter.                                                            | screenshot review + manual QA            | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Copy changes do not alter metadata, repeat/rest semantics, deletion behavior, or save/export contracts.                                                            | code review + targeted tests             | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes the authenticated workout-builder user surface, not an admin editing workflow.                                                      | explicit scope rationale                 | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: any removed helper copy must not remove labels, state announcements, or actionable context needed by assistive tech users.                       | code review + targeted tests             | `4/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: copy cleanup must not regress `/my-library/workouts/[workoutId]` responsiveness or add new runtime work.                                         | targeted review                          | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this slice only changes display copy and does not change canonical/local state ownership or sync behavior.                                             | explicit scope rationale                 | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no cache boundary, fetch path, or invalidation contract changes in this copy-only slice.                                                               | explicit scope rationale                 | `N/A`                   |
| Reliability and failure handling              | `target`     | Delete confirmation and repeat/rest copy remain truthful enough that users do not misunderstand what the action or structure does.                                 | targeted unit + manual QA                | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because no auth, role, or protected-route behavior changes in this slice.                                                                                      | explicit scope rationale                 | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no data collection, disclosure, retention, or sensitive-data behavior changes in this slice.                                                           | explicit scope rationale                 | `N/A`                   |
| Content governance                            | `target`     | Builder wording stays aligned with the actual workout model and the already-shipped metadata/repeat/save contracts.                                                | copy review + code review                | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin/operator workflow or publishing surface changes.                                                                                               | explicit scope rationale                 | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is an authenticated My Library route with no public crawl contract.                                                                                | explicit scope rationale                 | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public route metadata or public AI-facing content.                                                                                | explicit scope rationale                 | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no event model or route instrumentation changes are required for this copy-only slice.                                                                  | explicit scope rationale                 | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, billing, or subscription behavior changes.                                                                                     | explicit scope rationale                 | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because workflow/runbook semantics do not change; this slice only removes or tightens low-value builder copy.                                                  | explicit scope rationale                 | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance, payout, reconciliation, or reporting path changes.                                                                                          | explicit scope rationale                 | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this slice changes internal English builder wording only and does not alter localization architecture.                                                  | explicit scope rationale                 | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | The slice reuses existing builder components and helpers, and adds no dependency or parallel copy system.                                                           | dependency diff + code review            | `5/5`                   |
| Testing and QA automation                     | `target`     | Coverage protects the tightened copy contract for step summary wording, helper-text removal, and delete confirmation truthfulness.                                  | targeted unit + `verify:pre-pr` evidence | `5/5`                   |
| Scalability and cost efficiency               | `N/A`        | N/A because this slice only changes local UI copy and does not affect storage, jobs, or infra cost.                                                                | explicit scope rationale                 | `N/A`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the slice remains fully reversible through a normal UI rollback with no schema or migration dependency.                                            | diff review + rollback note              | `4/5`                   |

## Data Placement And Sync Contract

- `N/A`
- Rationale: this slice only changes presentation copy inside existing builder surfaces and does not introduce or move state ownership.

## Identity And Rename Contract

- `N/A`
- Rationale: this slice does not add or mutate persisted identifiers, slugs, route params, or canonical entity names.

## Scope

- Change effort-mode structured step labels from `Target <Effort>` to `Effort <Effort>` where the builder derives that copy automatically.
- Remove the low-value lap-button helper sentence from the step editor.
- Remove the low-value explanatory repeat sentence that restates the already-visible repeat structure.
- Tighten saved-session delete confirmation copy so it stays truthful without canonical/local-draft jargon.
- Keep the already-shipped metadata-panel, create-vs-edit, repeat/rest behavior, and pool-size contracts intact.
- Update targeted tests for the new copy contract.

## Out Of Scope

- Any metadata-panel field removal or metadata-schema change.
- Pool-size preset/input redesign or note reconciliation.
- Single-step auto-rest workflow changes.
- Bulk delete on `My Swim Sessions`.
- Repeat/rest logic changes, canonical save changes, or export model changes.
- Reworking support-tool, PDF, Poolside Note, or Garmin export disclosures.

## Acceptance Criteria

1. Effort-mode automatic step summaries use `Effort <Effort>` instead of `Target <Effort>`.
2. The lap-button helper sentence is removed from the builder.
3. The extra repeat explanatory sentence is removed from the repeat-set header.
4. Saved-sessions delete confirmation copy no longer uses `saved canonical session` / `unsaved local edits` jargon.
5. Delete confirmation behavior, repeat/rest semantics, metadata behavior, and export/save contracts remain unchanged.
6. Targeted tests and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted `vitest`:
  - `tests/unit/workout-builder-hub.test.tsx`
- targeted `playwright`:
  - `tests/e2e/my-library-workout-builder.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/workouts/<id>`
  - `http://127.0.0.1:3000/my-library/workouts`
- Preview:
  - PR preview URL after branch push

## Constraints

- Keep the slice copy-only.
- Do not reopen metadata-panel scope already shipped on `main`.
- Do not alter repeat/rest logic or save/export semantics while tightening wording.
- Prefer removing or shortening text over replacing it with new filler copy.

## 10/10 Quality Bar

- The builder should feel more direct and less over-explained after this slice.
- Copy must stay truthful to the actual builder state and action consequences.
- Removing helper text must not remove the only cue users need to understand a state or action.
- Required states stay clear:
  - loading: unchanged,
  - empty: unchanged,
  - error: unchanged,
  - retry: unchanged.

## Checkpoint Log

- `2026-04-10 | planning | live `freeswimming.org` admin-note re-check showed that the metadata-panel slice is already shipped on main, while the remaining open builder notes now cluster around low-value helper text and delete-copy truthfulness | next: implement a narrow follow-up slice for `68e1e612` + `7a506574`, keep stale pool-size notes out of scope, and validate with targeted tests plus verify:pre-pr`
- `2026-04-10 | implementation | changed automatic effort wording from `Target <Effort>` to `Effort <Effort>`, removed the lap-button helper sentence and the extra manual-pool repeat explainer, and tightened saved-session delete copy without changing builder semantics | validation: `npx vitest run tests/unit/workout-builder-hub.test.tsx`, `npm run typecheck`, targeted Playwright builder smoke with local env, and `npm run verify:pre-pr` all passed | next: commit, push, open PR, monitor CI, then run `npm run verify:pre-merge` before merge recommendation`
