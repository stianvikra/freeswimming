# Task Brief: Admin Course Status Overview And Workspace Consolidation (10/10)

## Metadata

- `id`: `2026-03-05-admin-course-status-overview-and-workspace-consolidation-10-10`
- `status`: `in-progress`
- `priority`: `P1`
- `owner`: `stianvikra`
- `created`: `2026-03-05`
- `updated`: `2026-03-05`

## Goal

Make admin course editing provide a fast, trustworthy status overview for modules/lessons while reducing split-context friction between workspace and content list, without removing any existing functions.

## Why This Brief Exists

- Current admin has both a lesson workspace and full content list, but status awareness is spread out and can feel duplicated.
- Editorial work needs a "single source of focus" for course structures (modules + lessons + status) before row-level actions.
- We want a 10/10 UX step-up while preserving all existing capabilities and safety flows.

## Dependencies And Boundaries

- Parent workflows:
  - `docs/task-briefs/in-progress/2026-02-19-admin-content-source-of-truth-and-dashboard-10-10.md`
  - `docs/task-briefs/in-progress/2026-02-22-admin-full-content-edit-workflow-10-10.md`
  - `docs/task-briefs/in-progress/2026-02-25-content-production-v1-admin-editorial-run.md`
  - `docs/task-briefs/in-progress/2026-03-05-admin-course-reorder-delete-safety-and-integrity-10-10.md`
- Scope is limited to admin UI/logic for `course_module` and `course_lesson` overview/workspace orchestration.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - `admin_content_items` module/lesson rows,
  - status (`draft/review/published/archived`), parent links, order.
- Local-only:
  - workspace focus mode toggles,
  - module scope selection,
  - list visibility preferences for course rows.
- Sync policy:
  - status and structure remain server-authoritative,
  - workspace/list views derive from latest loaded canonical rows,
  - existing mutation handlers stay unchanged and continue to refresh local state from server responses.
- Retention/sensitivity:
  - no additional sensitive data persisted.
- Cache/invalidation:
  - unchanged: existing no-store admin fetch and post-mutation refresh behavior remains source of truth.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                           | Evidence                            |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Product goals and IA                          | `target`     | Course editing IA exposes one clear "course workspace" entrypoint for module/lesson operations.            | manual QA flow + e2e                |
| UX flow clarity                               | `target`     | Editor can identify status and next action for any module/lesson in <=10 seconds without opening row edit. | e2e assertions + timed manual QA    |
| Visual design quality                         | `target`     | New workspace/status panels stay consistent with current admin visual language and hierarchy.              | visual QA + screenshot review       |
| Business logic correctness and data integrity | `target`     | Workspace status summaries are deterministic and match underlying row states.                              | unitized derivation checks + e2e    |
| Admin editor ergonomics                       | `target`     | Course editing keeps all existing actions while reducing context switching between panels.                 | manual QA + e2e workspace flows     |
| Accessibility (a11y)                          | `target`     | New toggles/summary rows are keyboard operable with labels and visible focus states.                       | Playwright interaction checks       |
| Performance (CWV + payloads)                  | `supporting` | N/A                                                                                                        | N/A                                 |
| Data placement and sync boundaries            | `target`     | UI state boundaries remain explicit; no hidden write path introduced by workspace changes.                 | code review + behavior verification |
| Caching and invalidation strategy             | `supporting` | N/A                                                                                                        | N/A                                 |
| Reliability and failure handling              | `target`     | Loading/empty/error/retry behavior stays clear on changed admin sections.                                  | e2e + manual QA                     |
| Security and authz                            | `supporting` | N/A (no auth boundary changes)                                                                             | API route unchanged review          |
| Privacy and compliance                        | `supporting` | N/A                                                                                                        | N/A                                 |
| Content governance                            | `supporting` | N/A                                                                                                        | N/A                                 |
| Admin workflow and editability                | `target`     | Workspace/list integration remains predictable with no hidden row-actions regressions.                     | e2e assertions + regression pass    |
| SEO and crawlability                          | `N/A`        | N/A                                                                                                        | N/A                                 |
| AI discoverability                            | `N/A`        | N/A                                                                                                        | N/A                                 |
| Analytics and KPI observability               | `supporting` | N/A                                                                                                        | N/A                                 |
| Commerce and revenue ops                      | `N/A`        | N/A                                                                                                        | N/A                                 |
| Incident response and support operations      | `supporting` | N/A                                                                                                        | help-center copy update             |
| Finance and reporting operations              | `N/A`        | N/A                                                                                                        | N/A                                 |
| i18n operational readiness                    | `supporting` | New labels and status text remain i18n-safe (single-source constants, no logic coupling to raw copy).      | code review                         |
| Stack-fit and dependency discipline           | `target`     | No new dependency added; implementation remains Next/React/Tailwind native.                                | dependency diff                     |
| Testing and QA automation                     | `target`     | Existing admin workspace e2e tests updated and passing with new status/visibility behavior.                | `npm run verify:pre-pr` evidence    |
| Scalability and cost efficiency               | `supporting` | Derived summaries computed in-memory from already loaded rows only.                                        | code review                         |
| DevOps and rollback readiness                 | `supporting` | UI-only rollback remains single-PR revert path with no migration impact.                                   | PR diff + no migration confirmation |

## Scope

- Add course-focused status overview surface for module/lesson records:
  - per-module lesson counts by status,
  - highlighted warning for unlinked lessons/integrity drift,
  - explicit "open module scope" action.
- Consolidate course editing context by improving workspace/list orchestration:
  - keep all existing functions,
  - reduce duplicate cognitive load by making course rows optional in full content list view.
- Preserve all existing row actions (`Edit`, `Move up/down`, `Move to module`, `Open preview`, `Open lesson`, `Revisions`, status transitions, `Archive`, `Delete`).
- Update help/guide copy where changed labels or workflow terms need alignment.
- Update E2E coverage for changed workspace/status UX.

## Out Of Scope

- Any API/schema contract changes.
- Removal of existing admin actions or destructive-flow safeguards.
- Public learner-route redesign.

## Acceptance Criteria

1. Admin Content tab shows a clear course status overview section with module/lesson status visibility.
2. Workspace remains fully actionable for all existing lesson operations.
3. Course rows can be de-duplicated from the generic list view without losing access to actions.
4. Status transitions (`draft/review/published/archived`) remain visible and understandable in the course workspace.
5. No existing admin workflow tests regress; updated workspace tests pass.
6. `npm run verify:pre-pr` passes before PR update.

## Validation

- targeted e2e:
  - `tests/e2e/admin-foundation.spec.ts`
  - `tests/e2e/admin-preview-mode.spec.ts`
  - `tests/e2e/admin-help-center.spec.ts`
- `npm run lint:briefs`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/admin`
- Preview:
  - Vercel preview URL from PR checks

## Constraints

- Do not remove existing functions.
- Keep current visual language and spacing system.
- Preserve current destructive-action confirmation patterns.

## 10/10 Quality Bar

- Editor can answer these in one glance:
  - "Which modules are draft/review/published/archived?"
  - "Where do I continue editing next?"
  - "Are any lessons unlinked or structurally risky?"
- Required states remain explicit on changed surfaces: `loading`, `empty`, `error`, `retry`, `success`.
- No regressions in keyboard and focus usability for changed controls.

## Security, Privacy, And Compliance

- No change to authz boundaries.
- No new sensitive data processing or storage.
- Existing fail-closed admin route behavior remains unchanged.

## Observability And KPI Contract

- KPI (qualitative): reduced edit-context switching and faster module-level status audits.
- Operational signal: integrity warning remains visible and actionable from consolidated workspace.

## Session Continuity And Recovery

1. `git status -sb`
2. `git log --oneline -n 10`
3. reopen this brief and continue from latest checkpoint.

## Checkpoint Log

- `2026-03-05 | implementation + local validation complete | shipped consolidated course workspace status board (module/lesson lifecycle counts + per-module status summaries), added workspace status chips, introduced full-list course visibility toggle to reduce duplicate cognitive load, and preserved all existing module/lesson actions; updated help-center labels and admin e2e coverage; npm run verify:pre-pr passed | next: commit, push, open PR in Safari, monitor required checks`
- `2026-03-05 | kickoff | opened 10/10 in-progress brief for admin course status-overview + workspace consolidation while preserving all existing functions | next: implement consolidated course workspace/status UI and update e2e coverage`
