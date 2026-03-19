# Task Brief: Admin Lesson Edit Continuity And Common Mistakes Visibility (10/10)

## Metadata

- `id`: `2026-03-19-admin-lesson-edit-continuity-and-common-mistakes-visibility-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-03-19`
- `updated`: `2026-03-19`

## Goal

Admin lesson editing should preserve flow after save, and learner-facing `Common mistakes` guidance should be visible by default while still allowing per-lesson collapse that is remembered locally.

## Why This Brief Exists

- Real editorial dogfooding surfaced two repeated friction points during lesson editing:
  - saving a lesson exits edit mode, forcing extra clicks to fix small follow-up changes on the same lesson,
  - learner-facing `Common mistakes` is hidden by default even though it is core guidance and should be visible unless the user explicitly hides it.
- Both issues are low-scope but high-frequency and directly affect editorial throughput and learner clarity.
- This should be solved as one small UX slice because both issues live in the lesson-edit/course-lesson experience and have low product ambiguity.

## Dependencies And Boundaries

- Existing surfaces in scope:
  - `components/admin/AdminContentManager.tsx`
  - `app/course/page.tsx`
- Nearby tests likely affected:
  - `tests/e2e/admin-foundation.spec.ts`
  - learner-facing course tests if `Common mistakes` default contract changes
- This slice is not a general admin redesign.
- This slice must preserve current lesson-body schema and not introduce unnecessary persistence to server state for UI-only affordances.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Admin workflow and editability`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                              | Evidence                            |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Product goals and IA                          | `supporting` | Supporting only: changed behavior should reinforce the existing lesson-edit mental model without adding new concepts.                                                       | brief + code review                 |
| UX flow clarity                               | `target`     | Saving a lesson keeps the same lesson edit surface open with clear success feedback, and learner `Common mistakes` is visible by default with an obvious hide/show control. | manual QA + e2e                     |
| Visual design quality                         | `target`     | New behavior preserves current visual language and does not add noisy banners or redundant controls.                                                                        | screenshot review + manual QA       |
| Business logic correctness and data integrity | `target`     | Saving still persists the same server-canonical lesson data, while visibility-memory state remains local-only and never mutates lesson content silently.                    | unit/e2e + code review              |
| Admin editor ergonomics                       | `supporting` | Supporting only: no separate admin-editor system changes beyond lesson inline edit flow.                                                                                    | scope rationale                     |
| Accessibility (a11y)                          | `target`     | Save/success/focus behavior remains keyboard accessible, and `Common mistakes` toggle remains labeled with correct expanded state.                                          | e2e + manual QA                     |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no meaningful route payload/render regression on `/course` or admin content surfaces.                                                                      | build + perf budgets                |
| Data placement and sync boundaries            | `target`     | Lesson saves remain server-canonical; `Common mistakes` expanded/collapsed memory is local-only and keyed per lesson.                                                       | brief contract + code review        |
| Caching and invalidation strategy             | `target`     | After save, the open editor reflects the saved item deterministically without requiring reopen; learner toggle memory applies correctly on reopen for that lesson.          | e2e + manual QA                     |
| Reliability and failure handling              | `target`     | Failed save keeps the editor open with the current draft and deterministic error state; local visibility memory failure degrades safely to default visible.                 | e2e + negative-path review          |
| Security and authz                            | `supporting` | Supporting only: no auth-scope expansion; existing admin and learner boundaries must remain unchanged.                                                                      | existing route guards + code review |
| Privacy and compliance                        | `N/A`        | N/A for this slice because no new personal/sensitive data is introduced; only local UI preference memory and existing lesson content behavior change.                       | scope rationale                     |
| Content governance                            | `supporting` | Supporting only: `Common mistakes` remains part of authored lesson content and should not be hidden by default in a way that undermines guidance quality.                   | code review + QA                    |
| Admin workflow and editability                | `target`     | Editors can save and continue editing the same lesson without forced reopen, reducing repeat clicks in high-frequency content work.                                         | manual QA + e2e                     |
| SEO and crawlability                          | `N/A`        | N/A because this slice changes authenticated admin flow and client-side learner toggle defaults only.                                                                       | scope rationale                     |
| AI discoverability                            | `N/A`        | N/A because no public AI-facing metadata or content discoverability behavior changes.                                                                                       | scope rationale                     |
| Analytics and KPI observability               | `N/A`        | N/A for this small friction slice; no new KPI contract is required beyond existing analytics discipline.                                                                    | scope rationale                     |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, or billing behavior changes.                                                                                                           | scope rationale                     |
| Incident response and support operations      | `N/A`        | N/A for this slice because no new operator runbook or incident path is required beyond normal UI regression coverage.                                                       | scope rationale                     |
| Finance and reporting operations              | `N/A`        | N/A because no finance/reporting behavior changes.                                                                                                                          | scope rationale                     |
| i18n operational readiness                    | `N/A`        | N/A for this slice because no new taxonomy or localization-sensitive system labels are introduced beyond small English copy continuity.                                     | scope rationale                     |
| Stack-fit and dependency discipline           | `target`     | Changes use existing React/Next patterns and browser storage without new dependencies.                                                                                      | code review                         |
| Scalability and cost efficiency               | `N/A`        | N/A because this is local UI behavior and existing lesson edit flow, not a scale-sensitive backend expansion.                                                               | scope rationale                     |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the slice must be cleanly revertible and not require schema or migration changes.                                                                          | diff review + revertability         |

## Data Placement And Sync Contract

- Server-canonical:
  - lesson content edits and save results remain canonical in admin content storage,
  - no change to lesson body schema or authored content ownership.
- Local-only:
  - whether learner `Common mistakes` is expanded/collapsed for a specific lesson,
  - keyed by lesson runtime identity or lesson id in local browser storage,
  - may be discarded safely without data loss.
- Sync policy:
  - save continues to use explicit lesson PATCH,
  - successful save updates local editor state from the returned server item,
  - failed save leaves edit mode open with current unsaved draft intact.

## Identity And Rename Contract

- This slice does not change canonical lesson identity.
- `Common mistakes` visibility memory must key off stable lesson identity, not display title text.
- Renaming a lesson should not incorrectly apply another lesson's stored collapse state.

## Scope

- Keep inline lesson edit open after successful save.
- Preserve same-row edit context after save:
  - same lesson remains editing,
  - success feedback appears,
  - updated saved values become new baseline,
  - user can keep editing without reopening.
- Keep edit mode open on `No changes to save` as well; do not treat it as a reason to exit.
- Make learner-facing `Common mistakes` visible by default when authored content exists and the section is enabled.
- Allow users to hide/show `Common mistakes`.
- Remember hide/show state per lesson in local browser storage.
- On storage read failure or missing value, default to visible.

## Out Of Scope

- Reworking all lesson-section visibility defaults.
- Server-persisted learner preferences.
- New lesson content fields.
- Broader admin workflow redesign.
- New analytics events unless implementation proves they are necessary.

## Acceptance Criteria

1. Saving a lesson no longer collapses or exits the same lesson editor.
2. `No changes to save` does not close the editor.
3. Failed save keeps the lesson editor open and the draft intact.
4. After successful save, the edited lesson shows success feedback and remains editable in place.
5. Learner-facing `Common mistakes` is visible by default when the lesson has authored mistakes and the section is enabled.
6. Users can still hide and re-open `Common mistakes`.
7. The hide/show preference is remembered per lesson in the current browser.
8. If local preference lookup fails, `Common mistakes` falls back to visible.
9. No server schema/migration change is required for this slice.

## Validation

- targeted unit/e2e for lesson save continuity
- targeted learner-facing test for `Common mistakes` default visible + remembered collapse state
- `npm run lint:briefs`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Help/Guide Impact

- Required in same PR if user-facing or admin-help copy materially changes.
- If behavior is self-evident and current Help/Guide text remains accurate, explicit `N/A` rationale is acceptable in PR summary.

## Risks And Mitigations

- Risk: save-open behavior leaves stale baseline state.
  - Mitigation: replace edit baseline with saved server response after successful save.
- Risk: local toggle memory leaks between lessons.
  - Mitigation: key by stable lesson identity.
- Risk: visible-by-default `Common mistakes` feels too heavy.
  - Mitigation: keep easy collapse control and remember the user's choice per lesson.

## Checkpoint Log

- `2026-03-19 | in-progress | brief created for small admin/course friction slice after repeated editorial pain: lesson save exits edit mode and learner common mistakes hides by default; scoped as one low-risk UX slice with local-only visibility memory and no schema changes | next: implement save-stays-open behavior, add per-lesson common-mistakes memory, and cover with targeted tests`
- `2026-03-19 | in-progress | implementation landed in admin lesson save flow and learner course page: lesson save now stays open and re-baselines from saved response, common mistakes defaults to visible and remembers collapse per lesson locally, admin help contract updated, targeted Playwright coverage green (admin foundation, admin help, course common mistakes visibility) | next: commit slice state, run full verify:pre-pr, then open PR`
