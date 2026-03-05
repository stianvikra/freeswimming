# Task Brief: Admin Content Course Workspace Vs All Content Tabs (10/10)

## Metadata

- `id`: `2026-03-05-admin-content-course-workspace-vs-all-content-tabs-10-10`
- `status`: `in-progress`
- `priority`: `P1`
- `owner`: `stianvikra`
- `created`: `2026-03-05`
- `updated`: `2026-03-05`

## Goal

Introduce a clear top-level split inside Admin Content between `Course Workspace` and `All Content` so editors get faster course-status overview and lower context-switching friction without losing any existing function.

## Why This Brief Exists

- Current Content view mixes course-structure workspace and full catalog in one long surface.
- Editorial usage benefits from a course-first operating mode, while still needing full-catalog control for pages/guides/products.
- We want a 10/10 IA step-up while preserving current actions, safety flows, and API behavior.

## Dependencies And Boundaries

- Parent workstreams:
  - `docs/task-briefs/in-progress/2026-02-19-admin-content-source-of-truth-and-dashboard-10-10.md`
  - `docs/task-briefs/in-progress/2026-02-22-admin-full-content-edit-workflow-10-10.md`
  - `docs/task-briefs/in-progress/2026-02-25-content-production-v1-admin-editorial-run.md`
  - `docs/task-briefs/in-progress/2026-03-05-admin-course-status-overview-and-workspace-consolidation-10-10.md`
- Scope limited to admin UI orchestration + related tests/docs. No schema/API contract change.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - `admin_content_items` rows and status/order/parent links.
- Local-only:
  - selected content view tab (`course_workspace` or `all_content`),
  - existing list/workspace focus/filter state.
- Sync policy:
  - all mutations remain explicit and server-driven,
  - tab switching never changes canonical data, only presentation.
- Cache/invalidation:
  - unchanged existing admin no-store fetch and mutation refresh paths.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                 | Evidence                         |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------ | -------------------------------- |
| Product goals and IA                          | `target`     | Content tab has explicit, understandable split: `Course Workspace` and `All Content`.            | e2e assertions + manual QA       |
| UX flow clarity                               | `target`     | Editors can pick correct work mode in one click with no ambiguity about where actions live.      | e2e + manual walkthrough         |
| Visual design quality                         | `target`     | New tabs and section grouping match current admin visual language and hierarchy.                 | visual QA                        |
| Business logic correctness and data integrity | `supporting` | N/A (no mutation logic change)                                                                   | unchanged API + regression tests |
| Admin editor ergonomics                       | `target`     | Course editing starts in workspace-first context while full-catalog workflows remain accessible. | workflow QA + e2e                |
| Accessibility (a11y)                          | `target`     | Tab controls are keyboard-operable with clear labels and focus states.                           | Playwright interactions          |
| Performance (CWV + payloads)                  | `supporting` | N/A                                                                                              | N/A                              |
| Data placement and sync boundaries            | `target`     | Tab state remains local-only and never causes hidden writes.                                     | code review                      |
| Caching and invalidation strategy             | `supporting` | N/A                                                                                              | N/A                              |
| Reliability and failure handling              | `target`     | Loading/empty/error/retry states remain visible and coherent in active tab context.              | e2e + manual QA                  |
| Security and authz                            | `supporting` | N/A                                                                                              | route behavior unchanged         |
| Privacy and compliance                        | `N/A`        | N/A                                                                                              | N/A                              |
| Content governance                            | `supporting` | N/A                                                                                              | N/A                              |
| Admin workflow and editability                | `target`     | No existing row action removed; workspace-to-edit transitions remain deterministic.              | e2e regression                   |
| SEO and crawlability                          | `N/A`        | N/A                                                                                              | N/A                              |
| AI discoverability                            | `N/A`        | N/A                                                                                              | N/A                              |
| Analytics and KPI observability               | `supporting` | N/A                                                                                              | N/A                              |
| Commerce and revenue ops                      | `N/A`        | N/A                                                                                              | N/A                              |
| Incident response and support operations      | `supporting` | Help text remains aligned with actual UI controls after tab split.                               | help center e2e                  |
| Finance and reporting operations              | `N/A`        | N/A                                                                                              | N/A                              |
| i18n operational readiness                    | `supporting` | New labels use stable constants/text without coupling logic to free-form strings.                | code review                      |
| Stack-fit and dependency discipline           | `target`     | No new dependency introduced.                                                                    | dependency diff                  |
| Testing and QA automation                     | `target`     | Admin content e2e suite updated for tab flow and passes in pre-pr gate.                          | `npm run verify:pre-pr` evidence |
| Scalability and cost efficiency               | `supporting` | N/A                                                                                              | N/A                              |
| DevOps and rollback readiness                 | `supporting` | UI-only rollback path remains one PR revert.                                                     | PR diff review                   |

## Scope

- Add top-level mode tabs inside Admin Content:
  - `Course Workspace`
  - `All Content`
- Keep all current features/actions available (no removals).
- Route course-centric UI blocks to `Course Workspace`.
- Route full-catalog filter/list/create surfaces to `All Content`.
- Ensure workspace actions that require row edit can jump user to `All Content` view deterministically.
- Update help-center guidance and relevant e2e coverage.

## Out Of Scope

- API/schema/data-model changes.
- Non-admin UX redesign.
- New analytics/instrumentation contracts.

## Acceptance Criteria

1. Content tab exposes visible tabs for `Course Workspace` and `All Content`.
2. Course workspace + status board remain fully usable from `Course Workspace`.
3. Full content list/filter/create flows remain fully usable from `All Content`.
4. No existing course/module/lesson actions are removed.
5. Existing core admin content e2e tests are updated and green.
6. `npm run verify:pre-pr` passes before PR update.

## Validation

- targeted e2e:
  - `tests/e2e/admin-foundation.spec.ts`
  - `tests/e2e/admin-content-parity.spec.ts`
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

- Do not remove any existing function/action.
- Preserve existing safety dialogs and role-gated behavior.
- Keep visual language aligned with current admin styling.

## 10/10 Quality Bar

- Editor should understand "where to work now" instantly.
- Workspace-first editing should feel focused and low-friction.
- All-content mode should remain complete for cross-type management.
- Changed surfaces keep explicit `loading`, `empty`, `error`, and `retry` states.

## Security, Privacy, And Compliance

- No auth boundary changes.
- No sensitive-data expansion.
- Existing protected-route behavior unchanged.

## Observability And KPI Contract

- Qualitative KPI:
  - reduced "where do I edit this?" friction during editorial sessions.
- Operational signal:
  - no increase in admin workflow regressions in e2e checks after tab split.

## Session Continuity And Recovery

1. `git status -sb`
2. `git log --oneline -n 10`
3. reopen this brief and continue from latest checkpoint.

## Checkpoint Log

- `2026-03-05 | a1191ca | committed admin content tab split + test stabilization and opened PR #132 (https://github.com/stianvikra/freeswimming/pull/132) in Safari | local verify:pre-pr green; CI required checks pending`
- `2026-03-05 | working tree | implemented admin Content top-level split (Course Workspace vs All Content), updated help center copy, refreshed admin e2e contracts, and hardened two existing flaky e2e specs (`install-entry`, `install-prompt`, `my-library notice`) encountered during gate execution | verify:pre-pr passed (73 passed / 179 skipped) | next: commit, push, open PR in Safari`
- `2026-03-05 | kickoff | opened in-progress brief for top-level Content tab split (Course Workspace vs All Content) after merge of workspace-status overview slice | next: implement tabs + regression coverage and run verify:pre-pr`
