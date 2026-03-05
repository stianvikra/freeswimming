# Task Brief: Admin Course Reorder/Delete Safety And Integrity (10/10)

## Metadata

- `id`: `2026-03-05-admin-course-reorder-delete-safety-and-integrity-10-10`
- `status`: `in-progress`
- `priority`: `P0`
- `owner`: `stianvikra`
- `created`: `2026-03-05`
- `updated`: `2026-03-05`

## Goal

Make course module/lesson reordering and delete workflows safe, fast, and deterministic so content production can continue without data integrity risk.

## Why This Brief Exists

- Current admin flow allows manual sort/parent edits, but not a safe dedicated reorder/delete workflow.
- Deleting a module can leave lessons unlinked, which is a production risk during active content work.
- This is now classified as `P0` from live editorial flow and must be fixed before continuing high-volume content structuring.

## Dependencies And Boundaries

- Parent workflows:
  - `docs/task-briefs/in-progress/2026-02-19-admin-content-source-of-truth-and-dashboard-10-10.md`
  - `docs/task-briefs/in-progress/2026-02-22-admin-full-content-edit-workflow-10-10.md`
  - `docs/task-briefs/in-progress/2026-02-25-content-production-v1-admin-editorial-run.md`
- Scope is limited to `course_module` and `course_lesson` operations in admin and related API guards/invariants.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - `admin_content_items.sort_order`,
  - `admin_content_items.parent_id`,
  - content type/status/body fields tied to module/lesson structure.
- Local-only:
  - transient drag/reorder UI state,
  - unsaved modal/form state for delete strategy selection.
- Sync policy:
  - reorder/delete mutations are committed explicitly (no silent autosave),
  - server response is authoritative and replaces optimistic local ordering,
  - on failure, UI reverts to last canonical state with actionable error.
- Retention/sensitivity:
  - no sensitive data in reorder/delete diagnostics; IDs/slugs only.
- Cache/invalidation:
  - after successful mutation, refresh admin list/workspace and preview-link targets from server-canonical rows.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                            | Evidence                                  |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Product goals and IA                          | `supporting` | N/A                                                                                                         | N/A                                       |
| UX flow clarity                               | `target`     | Reorder/delete flows expose one clear primary action with explicit consequences and no dead ends.           | e2e flow checks + manual QA               |
| Visual design quality                         | `supporting` | N/A                                                                                                         | N/A                                       |
| Business logic correctness and data integrity | `target`     | No duplicate/ambiguous order after move/delete; no silent unlinked lesson drift.                            | unit invariants + API negative-path tests |
| Admin editor ergonomics                       | `target`     | Editor can reorder/move lessons and modules in <= 3 focused actions per item.                               | admin e2e + timed manual QA               |
| Accessibility (a11y)                          | `target`     | Reorder/delete controls remain keyboard and screen-reader operable with clear labels/status.                | targeted a11y QA + e2e assertions         |
| Performance (CWV + payloads)                  | `supporting` | N/A                                                                                                         | N/A                                       |
| Data placement and sync boundaries            | `target`     | Reorder/delete state ownership is explicit; UI does not diverge from server-canonical order after save.     | code review + integration test            |
| Caching and invalidation strategy             | `target`     | Admin workspace/list reflects canonical ordering immediately after mutation success or rollback on failure. | e2e refresh/consistency checks            |
| Reliability and failure handling              | `target`     | Invalid parent/order/delete operations fail with deterministic, actionable non-500 feedback.                | negative-path unit/e2e tests              |
| Security and authz                            | `target`     | Destructive/reorder mutations remain role-gated and fail closed for unauthorized users.                     | API guard tests                           |
| Privacy and compliance                        | `supporting` | N/A                                                                                                         | N/A                                       |
| Content governance                            | `target`     | Module/lesson structural changes remain auditable and revision-safe.                                        | revision/audit assertions                 |
| Admin workflow and editability                | `target`     | Module delete includes explicit strategy (reassign vs archive/unlink) before mutation executes.             | e2e workflow coverage                     |
| SEO and crawlability                          | `supporting` | N/A                                                                                                         | N/A                                       |
| AI discoverability                            | `supporting` | N/A                                                                                                         | N/A                                       |
| Analytics and KPI observability               | `supporting` | N/A                                                                                                         | N/A                                       |
| Commerce and revenue ops                      | `supporting` | N/A                                                                                                         | N/A                                       |
| Incident response and support operations      | `supporting` | N/A                                                                                                         | N/A                                       |
| Finance and reporting operations              | `supporting` | N/A                                                                                                         | N/A                                       |
| i18n operational readiness                    | `supporting` | N/A                                                                                                         | N/A                                       |
| Stack-fit and dependency discipline           | `target`     | Implementation remains stack-native with no new dependency unless justified by measurable UX/a11y benefit.  | dependency diff                           |
| Testing and QA automation                     | `target`     | Reorder/delete happy-path + negative-path coverage exists for UI and API invariants.                        | unit + e2e evidence                       |
| Scalability and cost efficiency               | `supporting` | N/A                                                                                                         | N/A                                       |
| DevOps and rollback readiness                 | `target`     | Unsafe structural mutations can be recovered via revision/rollback path and documented operator steps.      | revision restore test + runbook note      |

## Scope

- Add first-class module/lesson reorder workflow for admin (not only manual sort-order typing).
- Add safe module-delete decision flow with explicit choice:
  - reassign lessons to selected module, or
  - intentionally archive/unlink lessons.
- Add deterministic sort normalization after move/delete mutations.
- Add integrity checks and surfaced alerts for:
  - unlinked lessons,
  - duplicate/conflicting sort orders,
  - invalid parent relationships.
- Add/update tests for critical paths and negative paths.

## Out Of Scope

- Full redesign of unrelated admin surfaces.
- Changes to learner-facing lesson pedagogy/copy not related to structure integrity.
- New external dependencies without explicit acceptance.

## Acceptance Criteria

1. Admin can reorder lessons within module and across modules with deterministic final order.
2. Admin can reorder modules with deterministic final order.
3. Deleting a module requires explicit handling strategy for child lessons and cannot proceed ambiguously.
4. No orphaned/unlinked lessons can remain unnoticed after destructive operations.
5. API rejects invalid reorder/delete payloads with clear 4xx errors (no ambiguous 500 behavior).
6. Required tests and validation gates pass before PR update/merge recommendation.

## Validation

- targeted unit tests for ordering/normalization/invariant checks
- targeted e2e tests for admin reorder/delete workflows
- `npm run lint:briefs`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/admin`
  - `http://127.0.0.1:3000/course`
- Preview:
  - PR Vercel URL for admin reorder/delete smoke + learner route sanity

## Constraints

- No direct destructive action without explicit confirmation and outcome summary.
- Keep current admin visual language; no broad UI redesign.
- Preserve backward compatibility for existing course module/lesson IDs and links.

## 10/10 Quality Bar

- Reorder/delete UX must be explicit, reversible when possible, and never surprising.
- Required states on changed surfaces: `loading`, `empty`, `error`, `retry`, `success`.
- Structural mutations must be deterministic and auditable.
- Invariant violations must be surfaced clearly to editor, not hidden.

## Security, Privacy, And Compliance

- Reorder/delete APIs remain role-gated (`editor`/`admin`) with fail-closed behavior.
- Validate all mutation payloads server-side (IDs, parent linkage, order range, strategy choice).
- Keep logs free of sensitive content payloads.

## Observability And KPI Contract

- Emit structured server logs for reorder/delete mutation outcomes (`ok`/`rejected` + reason class).
- Maintain actionable admin notices for failed mutation reasons.
- Success KPI for this slice: zero unresolved structural integrity warnings after content batch run.

## Session Continuity And Recovery

1. `git status -sb`
2. `git log --oneline -n 10`
3. reopen this brief and continue from latest checkpoint.

## Checkpoint Log

- `2026-03-05 | 754ef2d | PR opened | pushed branch and opened PR #130 in Safari after local npm run verify:pre-pr green; CI checks are running/pending | next: monitor required CI and run npm run verify:pre-merge before merge recommendation`
- `2026-03-05 | implementation + validation complete (local) | shipped admin course structure API (`move_module`, `move_lesson`, `move_lesson_to_module`, `delete_module`, `normalize`) with role gating (`editor`+`admin` for delete); added deterministic normalization + integrity computation helpers; wired admin UI move controls (module/lesson up/down + lesson-to-module reassignment), persistent integrity warning + normalize action, and explicit module delete strategy modal (reassign/archive/unlink); updated e2e guards and hardened flaky desktop e2e waits; npm run verify:pre-pr passed | next: commit, push, open PR in Safari, monitor required checks`
- `2026-03-05 | kickoff (P0) | brief opened directly in-progress from editorial run due structural admin reorder/delete integrity risk | next: implement safe reorder workflow + module-delete strategy flow + invariant checks`
