# Task Brief: Swim Session Builder Repeat Summary And Poolside Note Copy Cleanup (10/10)

## Metadata

- `id`: `2026-04-11-swim-session-builder-repeat-summary-and-poolside-note-copy-cleanup-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-11`
- `updated`: `2026-04-11`

## Goal

Remove the remaining low-value repeat-summary helper copy and make Poolside Note focus cues meaningful by carrying focus descriptions through the builder and poolside output.

## Why This Brief Exists

- A fresh live admin-note check on `freeswimming.org` on `2026-04-11` shows that the earlier helper-copy cleanup slice already shipped part of note `68e1e612`, but some note items are still live:
  - repeat headers still auto-render explanatory rest text that now feels noisy after the Garmin-parity repeat work,
  - repeat headers still append `Final rest skipped` even though the rest-mode control already expresses that state,
  - Poolside Note focus cues only carry titles, not the underlying focus descriptions/details,
  - print-style helper copy is still longer than needed.
- The same live check also confirms that other open notes on this route are either stale against newer shipped work or belong to separate slices:
  - `814ced4c-77e9-4b62-afaf-7ca8424d9ae0` references the old `Unspecified` pool-size flow and is stale,
  - `7a506574-6245-468c-8aea-17e1444c672a` references delete-helper text that is no longer present and is stale,
  - `e86b5ede-65d7-477e-a641-decc7755116c` mixes stale pool-size copy asks with a separate single-step auto-rest workflow decision,
  - `a175f6bc-6814-4010-9f4a-e6620fb9f5dc` bulk delete remains out of scope.

## Dependencies And Boundaries

- Parent saved swim-session builder brief:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-03-27-workout-builder-live-review-ux-and-actions-10-10.md`
- Related shipped builder cleanup that must remain intact:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-10-swim-session-builder-helper-copy-and-delete-copy-cleanup-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-09-pool-swim-builder-repeat-rest-and-pool-size-clarity-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-08-swim-session-builder-support-tools-pool-size-and-poolside-focus-polish-10-10.md`
- Related poolside print brief that stays broader than this slice:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-01-workout-builder-poolside-note-print-and-surface-clarity-10-10.md`
- Core implementation files in scope:
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx`
  - `/Users/stianvikra/freeswimming/lib/workouts/shared.ts`
  - `/Users/stianvikra/freeswimming/app/my-library/workouts/page.tsx`
  - `/Users/stianvikra/freeswimming/app/my-library/workouts/[workoutId]/page.tsx`
  - `/Users/stianvikra/freeswimming/app/api/my-library/workouts/[workoutId]/export/pdf/route.ts`
  - `/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx`
  - `/Users/stianvikra/freeswimming/tests/unit/workouts-shared.test.ts`
  - `/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts`

## Admin Notes Triage Disposition

Production admin notes were re-checked against live `freeswimming.org` on `2026-04-11`.

- `68e1e612-c9e8-4ac3-b3bb-ca284b6ed3db` `Swim session builder`
  - disposition: partially owned by this brief.
  - reason:
    - already shipped before this brief: `Effort <Level>` wording and lap-button helper removal,
    - owned now: remove the remaining repeat-header helper text, remove `Final rest skipped` from the builder repeat summary, add focus descriptions to Poolside Note, and shorten the print-style helper copy.

- `e86b5ede-65d7-477e-a641-decc7755116c` `SWIM SESSION BUILDER`
  - disposition: not owned by this brief.
  - reason: its stale pool-size copy asks conflict with newer shipped pool-size work, and its single-step auto-rest request is a separate workflow decision.

- `814ced4c-77e9-4b62-afaf-7ca8424d9ae0` `Swim session builder`
  - disposition: not owned by this brief.
  - reason: it references the removed `Unspecified` pool-size state and is stale.

- `7a506574-6245-468c-8aea-17e1444c672a` `Swim session builder`
  - disposition: not owned by this brief.
  - reason: the exact delete-helper sentence is already gone from the current builder.

- `a175f6bc-6814-4010-9f4a-e6620fb9f5dc` `My Swim Sessions`
  - disposition: not owned by this brief.
  - reason: bulk delete is a separate workflow slice.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                     | Evidence                            | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Repeat headers and Poolside Note controls expose only the copy that still helps the user act correctly.                                                            | copy review + manual QA             | `5/5`                   |
| UX flow clarity                               | `target`     | The repeat header reads faster without redundant rest teaching copy, and Poolside Note focus cues remain understandable because titles can carry their details.    | manual QA + targeted unit/e2e       | `5/5`                   |
| Visual design quality                         | `target`     | The builder and Poolside Note selector feel calmer and cleaner after the low-value helper text is removed or shortened.                                            | screenshot review + manual QA       | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Builder repeat/rest behavior, canonical save semantics, and export structure remain unchanged apart from richer focus text in the poolside output.                 | code review + targeted tests        | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes the authenticated swim-session builder rather than an admin editing tool.                                                           | explicit scope rationale            | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: trimmed copy must not remove labels or state context needed for keyboard and assistive-tech use.                                                  | code review + targeted tests        | `4/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no material route/runtime cost increase on `/my-library/workouts` from carrying focus details through existing local render paths.                | typecheck + targeted review         | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Existing server-canonical workout data stays untouched; focus descriptions are reused from existing training-context data and never saved into the workout draft.  | brief contract + code review        | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this slice changes no fetch cadence, cache policy, or invalidation trigger.                                                                            | explicit scope rationale            | `N/A`                   |
| Reliability and failure handling              | `target`     | Repeat summaries and poolside output stay deterministic when focus details are present or absent, with graceful fallback to title-only rendering.                  | targeted unit tests                 | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because no auth, role, or protected mutation behavior changes.                                                                                                 | explicit scope rationale            | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because the slice reuses existing owner-scoped training focus details and does not widen data exposure beyond the existing authenticated poolside flow.        | explicit scope rationale            | `N/A`                   |
| Content governance                            | `target`     | Copy remains truthful to the shipped repeat/rest model, and Poolside Note focus text comes from the existing training-context source of truth instead of new copy. | code review + output review         | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow or publishing flow is changed in this slice.                                                                                         | explicit scope rationale            | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is an authenticated My Library route with no public crawl contract.                                                                               | explicit scope rationale            | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public route, public metadata, or public AI-facing content.                                                                      | explicit scope rationale            | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because the slice changes no analytics event contract or KPI instrumentation.                                                                                  | explicit scope rationale            | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, billing, or subscription flow changes.                                                                                        | explicit scope rationale            | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because no runbook branch, alert path, or support diagnostic workflow changes; this is a presentation-only cleanup on existing authenticated flows.            | explicit scope rationale            | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance, payout, reconciliation, or reporting path changes.                                                                                         | explicit scope rationale            | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this slice only adjusts internal English builder/output wording and does not change localization architecture or data shape.                           | explicit scope rationale            | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | The slice reuses existing builder, training-context, and poolside-output helpers with no new dependency or duplicated rendering system.                            | dependency diff + code review       | `5/5`                   |
| Testing and QA automation                     | `target`     | Coverage proves the repeat-summary cleanup, print-style copy tightening, and focus-description carry-through in builder and poolside output.                       | targeted unit/e2e + `verify:pre-pr` | `5/5`                   |
| Scalability and cost efficiency               | `N/A`        | N/A because the slice adds no background jobs, storage growth, or extra network round trips.                                                                       | explicit scope rationale            | `N/A`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the slice stays rollback-safe because it changes no schema and only adjusts presentation/output composition.                                      | diff review + rollback note         | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - workout drafts and their repeat/rest semantics,
  - existing training-context open-focus rows and their `title` / `details`,
  - canonical workout export routes.
- Local-only:
  - selected Poolside Note focus IDs,
  - repeat disclosure/open state and other builder presentation state.
- Sync policy:
  - this slice must not persist any new field on the workout draft,
  - focus descriptions are read from the existing training-context snapshot and only affect display/output composition,
  - selecting focus items for Poolside Note remains local until the user opens the poolside output.
- Retention and sensitivity:
  - no new sensitive data is introduced,
  - focus descriptions already belong to the authenticated owner and remain owner-scoped.
- Cache/invalidation:
  - existing builder and export routes remain authoritative,
  - no extra cache invalidation or revalidation behavior is introduced.

## Identity And Rename Contract

- `N/A`
- Rationale: this slice does not add or mutate persisted IDs, slugs, or renameable route identifiers.

## Scope

- Remove the remaining repeat-header helper text that explains between-round recovery and external post-set rest.
- Remove `Final rest skipped` from the builder repeat summary line only.
- Carry focus descriptions/details into the Poolside Note selector and poolside output when available, with deterministic title-only fallback when not available.
- Shorten Poolside Note print-style helper copy.
- Update targeted tests for the new builder/poolside copy contract.

## Out Of Scope

- Pool-size semantics, presets, labels, or validation rules.
- Any reintroduction of `Unspecified`.
- Single-step auto-rest creation.
- Bulk delete on `My Swim Sessions`.
- Repeat/rest business logic, canonical repeat/export semantics, or Garmin mapping changes.
- Broader Poolside Note print layout redesign.

## Acceptance Criteria

1. Builder repeat headers no longer show the `Final rest skipped` suffix.
2. Builder repeat headers no longer show the auto-generated between-round/post-set explanatory paragraphs called out by note `68e1e612`.
3. Poolside Note focus choices show each focus description when one exists, and still work cleanly when only a title exists.
4. Poolside Note output carries the selected focus descriptions/details when available instead of title-only bullets.
5. Print-style helper copy is shortened to the note-approved wording.
6. Canonical save/export semantics, repeat/rest behavior, and pool-size behavior remain unchanged.
7. Targeted tests and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted `vitest`:
  - `tests/unit/workout-builder-hub.test.tsx`
  - `tests/unit/workouts-shared.test.ts`
- targeted `playwright`:
  - `tests/e2e/my-library-workout-builder.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/workouts`
  - `http://127.0.0.1:3000/my-library/workouts/<id>`
- Preview:
  - PR preview URL after branch push

## Constraints

- Keep the slice narrow and note-driven.
- Do not reopen the shipped pool-size parity work.
- Do not touch canonical repeat/export semantics beyond the builder-only summary text requested by the note.
- Prefer existing training-context fields over inventing new copy sources for Poolside Note details.

## 10/10 Quality Bar

- The builder repeat header should feel lighter immediately after this slice.
- Poolside Note focus cues should be interpretable without forcing the user to remember what a short title means.
- Missing focus details must degrade gracefully to title-only rendering.
- Keyboard, screen-reader, and touch behavior must remain intact.
- No existing builder action, export action, or save path may change meaning.

## Help/Guide Impact

- `N/A` for this slice because it changes only authenticated builder/poolside presentation details and does not change the documented workflow contract.

## Checkpoint Log

- `2026-04-11 | planning + implementation start | re-checked live admin notes on freeswimming.org and confirmed that note 68e1e612 is only partially shipped: effort wording and lap-button cleanup are already done, while repeat-header helper text, `Final rest skipped` in the builder summary, poolside focus descriptions, and short print-style copy still remain | next: implement the remaining note-owned copy/output cleanup, update targeted tests, and run verification before PR handoff`
- `2026-04-11 | implementation + validation complete on branch | removed the remaining repeat-header helper copy from the builder summary, kept handoff/export repeat semantics intact, threaded training-focus descriptions into Poolside Note selection/output, shortened print-style helper copy, and validated with `npm run lint:briefs:all`, `npm run typecheck`, targeted `vitest`, targeted `playwright`, and full `npm run verify:pre-pr`; perf-budget trend recommendation remains `hold`because the weekly tighten gate is not met yet | next: commit, push, open PR, monitor CI, and run`npm run verify:pre-merge` before merge recommendation`
- `2026-04-11 | closeout | PR #411 merged to main as `61097e1`; local `npm run verify:pre-merge`passed before merge recommendation, all required PR checks were green, and the brief was moved from`in-progress`to`done` in post-merge closeout | next: none`
