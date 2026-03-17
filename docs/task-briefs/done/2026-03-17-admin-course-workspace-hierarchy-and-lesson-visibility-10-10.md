# Task Brief: Admin Course Workspace Hierarchy And Lesson Visibility (10/10)

## Metadata

- `id`: `2026-03-17-admin-course-workspace-hierarchy-and-lesson-visibility-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-03-17`
- `updated`: `2026-03-17`

## Goal

Make module -> lesson relationships explicit and low-friction in Admin Course Workspace so editors can see, navigate, and sort the right lessons inside the right module without relying on hidden focus/filter mental models.

## Why This Brief Exists

- Real editorial use still has friction after the workspace/status/ordering slices:
  - current workspace shows module status cards and a separate lesson list,
  - module scope exists,
  - but the parent/child relationship is still too implicit during live content work.
- Editors should be able to answer at a glance:
  - which lessons belong to this module,
  - what order they are in,
  - which one to edit next,
  - and how to get back to the module context after editing one lesson.
- Existing code already gives us the raw building blocks:
  - course workspace module status list,
  - module-scoped lesson list,
  - contextual lesson create in module,
  - safe move/reorder/delete flows.
- This should be a focused UX/admin slice, not a schema rewrite.

## Dependencies And Boundaries

- Parent workflows:
  - `docs/task-briefs/in-progress/2026-02-22-admin-full-content-edit-workflow-10-10.md`
  - `docs/task-briefs/in-progress/2026-02-25-content-production-v1-admin-editorial-run.md`
- Builds on shipped course-workspace slices:
  - `docs/task-briefs/done/2026-03-05-admin-content-course-workspace-vs-all-content-tabs-10-10.md`
  - `docs/task-briefs/done/2026-03-05-admin-course-status-overview-and-workspace-consolidation-10-10.md`
  - `docs/task-briefs/done/2026-03-05-admin-course-reorder-delete-safety-and-integrity-10-10.md`
  - `docs/task-briefs/done/2026-03-17-aw-013-context-aware-admin-create-notes-and-qr-10-10.md`
- Scope is limited to admin workspace UX/orchestration, help copy, and regression coverage for `course_module` + `course_lesson`.
- Prefer deriving hierarchy from already loaded canonical rows; avoid schema changes unless a minimal API response addition is needed for deterministic display.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - `admin_content_items` rows for `course_module` and `course_lesson`,
  - canonical `parent_id`, `sort_order`, `status`, `slug`, and runtime IDs.
- Local-only:
  - expanded/collapsed module state,
  - selected module focus,
  - temporary workspace navigation state such as "return to module" context.
- Sync policy:
  - hierarchy view always derives from latest loaded canonical rows,
  - no hidden writes from expand/collapse/filter/navigation actions,
  - reorder/move/edit actions continue to write through existing explicit mutation paths.
- Conflict handling:
  - if canonical rows refresh mid-edit, the visible hierarchy re-renders from server truth after mutation response,
  - inline hierarchy must never present stale order as authoritative after a successful server mutation.
- Cache/invalidation:
  - unchanged admin `no-store` fetch remains source of truth,
  - post-mutation refresh must preserve visible module context when safe.

## Identity And Rename Contract (Required)

- Canonical stable IDs:
  - module row `id` and lesson row `id` remain canonical relational identities inside admin,
  - runtime `moduleId` / `lessonId` stay canonical for course routing/progress.
- Human-readable identifiers:
  - `slug` and `title` remain operator-visible and may be edited under the existing rename-safe contract,
  - hierarchy rendering must not infer parentage from slug/title text.
- Mutability rules:
  - this brief does not change runtime-ID immutability or slug rules,
  - hierarchy grouping must use canonical parent linkage and canonical ordering.
- Rename vs repurpose policy:
  - unchanged from course runtime-ID governance:
    - rename in place only when the learning object is still the same,
    - create a new module/lesson when content is materially repurposed.
- Compatibility contract:
  - no route or data migration is introduced here,
  - existing lesson/module alias compatibility remains unchanged.
- Observability and repair:
  - if a lesson is unlinked or points to a missing module, the workspace must surface that clearly instead of hiding it in an ambiguous list.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Business logic correctness and data integrity`
- `Admin editor ergonomics`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                 | Evidence                                  |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Product goals and IA                          | `target`     | Editors can open a module and understand its ordered child lessons in <=1 workspace step.      | e2e + timed manual QA                     |
| UX flow clarity                               | `target`     | Module -> lesson relationship is explicit; no dead-end navigation after opening lesson edit.   | e2e + editorial walkthrough               |
| Visual design quality                         | `target`     | Nested hierarchy, counts, and actions fit current admin visual language without clutter.       | visual QA + screenshot review             |
| Business logic correctness and data integrity | `target`     | Displayed child lessons, counts, and order always match canonical `parent_id` + `sort_order`.  | unit derivation coverage + e2e            |
| Admin editor ergonomics                       | `target`     | Editors can locate/edit the right lesson in the right module with materially less context hop. | live editorial QA + e2e                   |
| Accessibility (a11y)                          | `target`     | Expand/collapse, nested actions, and return-to-module flow are keyboard operable and labeled.  | Playwright interactions + manual QA       |
| Performance (CWV + payloads)                  | `supporting` | No material `/admin` regression; derive hierarchy from existing payload where possible.        | verify checks + code review               |
| Data placement and sync boundaries            | `target`     | Expanded hierarchy state stays local-only; canonical parent/order data stays server-owned.     | code review + behavior verification       |
| Caching and invalidation strategy             | `supporting` | Existing admin refresh/invalidation remains deterministic after mutations.                     | regression checks                         |
| Reliability and failure handling              | `target`     | Empty, unlinked, loading, and error states remain explicit and non-contradictory.              | e2e + manual QA                           |
| Security and authz                            | `supporting` | No auth boundary expansion; existing role-gated mutations remain unchanged and fail closed.    | unchanged route review + regression suite |
| Privacy and compliance                        | `N/A`        | N/A for admin hierarchy UX slice; no new sensitive data, retention, or consent surface.        | scope review only                         |
| Content governance                            | `supporting` | Owner/status/revision and runtime-ID governance remain visible and unchanged.                  | help copy + workflow review               |
| Admin workflow and editability                | `target`     | Module-level and lesson-level edit/reorder/move actions remain available inside clearer IA.    | e2e regression + editorial QA             |
| SEO and crawlability                          | `N/A`        | N/A for admin-only workspace slice; no public route metadata/indexing changes.                 | scope boundary review                     |
| AI discoverability                            | `N/A`        | N/A for admin-only workspace slice; no public semantic/canonical change.                       | scope boundary review                     |
| Analytics and KPI observability               | `supporting` | Existing admin signals remain unchanged unless a minimal workspace event is explicitly added.  | event review                              |
| Commerce and revenue ops                      | `N/A`        | N/A for course-workspace-only slice; no product/entitlement/checkout behavior changes.         | scope boundary review                     |
| Incident response and support operations      | `supporting` | Help/Guide must explain the new hierarchy and how to recover when lessons are unlinked.        | Help/Guide update + admin QA              |
| Finance and reporting operations              | `N/A`        | N/A for admin course UX slice; no finance/reconciliation identifiers or exports are touched.   | scope boundary review                     |
| i18n operational readiness                    | `supporting` | New labels remain constant-based and easy to localize later.                                   | copy review                               |
| Stack-fit and dependency discipline           | `target`     | Uses existing React/Next/Tailwind/admin patterns; no new dependency added.                     | dependency diff                           |
| Testing and QA automation                     | `target`     | Critical hierarchy flows ship with unit + e2e regression coverage and pass `verify:pre-pr`.    | test evidence + gate result               |
| Scalability and cost efficiency               | `supporting` | Hierarchy display derives from already loaded rows and avoids new high-cost query patterns.    | code review                               |
| DevOps and rollback readiness                 | `supporting` | UI-only rollback remains single-PR revert with no schema migration.                            | diff review                               |

## Scope

- Make module -> lesson hierarchy explicit inside Course Workspace:
  - visible ordered child lessons under each module, or an explicit expand/focus pattern that keeps parent and children together,
  - clear lesson count + status summary at module level,
  - explicit empty state when a module has no lessons.
- Preserve and improve module context while editing:
  - open lesson edit from module context,
  - clear "back to module" or equivalent return path,
  - preserve selected module scope when practical after save/cancel.
- Keep structural actions discoverable within the hierarchy:
  - `Edit`,
  - `Move up/down`,
  - `Move to module`,
  - contextual `Add lesson`,
  - preview/open actions that belong in the hierarchy flow.
- Surface unlinked lessons as a first-class exception state, not hidden drift.
- Update Help/Guide language to explain the hierarchy and preferred editorial workflow.
- Update unit/e2e coverage for changed workspace behavior.

## Out Of Scope

- Course runtime-ID/slugs migration logic.
- Learner-side course UI changes.
- QR/link behavior changes.
- New schema or revision model changes.
- Guide session/drill hierarchy redesign.

## Acceptance Criteria

1. Editors can see a module and its linked lessons together without relying on a separate hidden mental model.
2. Ordered lesson display matches canonical module parentage and current `sort_order`.
3. Opening a lesson from module context preserves a clear route back to that module context.
4. Unlinked lessons are clearly visible and actionable as an exception state.
5. Existing move/reorder/edit safety flows remain intact and understandable.
6. Help/Guide is updated in the same PR to match the changed workflow.
7. `npm run lint:briefs`, `npm run verify:pre-pr`, and required targeted tests pass before PR update.

## Validation

- `npm run lint:briefs`
- targeted unit coverage for hierarchy derivation/state
- targeted e2e:
  - `tests/e2e/admin-foundation.spec.ts`
  - `tests/e2e/admin-help-center.spec.ts`
  - `tests/e2e/admin-preview-mode.spec.ts`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/admin`
- Preview:
  - Vercel preview URL from PR checks
- Recommended browser/device matrix:
  - desktop Chromium
  - desktop Safari/WebKit
  - desktop Firefox
  - iPad/tablet viewport

## Constraints

- Preserve current admin visual language.
- Do not reintroduce duplicate cognitive load between workspace and full list.
- Do not weaken existing move/delete/reorder safety semantics.
- Keep unlinked lessons visible as exceptions, not silently auto-hidden.

## 10/10 Quality Bar

- Editor should understand "which lessons belong to this module?" instantly.
- Hierarchy should reduce context switching, not add a second competing navigation model.
- Required states on changed surfaces:
  - `loading`
  - `empty`
  - `error`
  - `retry`
  - `success`
- No ambiguous hierarchy where counts say one thing and visible rows say another.

## Help/Guide And Operator Training Contract

- Required in same PR:
  - update Admin Help/Guide course-workspace explanation,
  - explain how to open one module, see its lessons, add a lesson in context, and handle unlinked lessons.

## Risks And Mitigations

- Risk: hierarchy UI becomes visually heavy or duplicates existing list concepts.
  - Mitigation: preserve one primary course-workspace path and keep full-catalog mode secondary.
- Risk: visible child ordering drifts from canonical order after mutations.
  - Mitigation: derive child lists only from canonical refreshed rows and add regression coverage.
- Risk: lesson edit flow loses module context.
  - Mitigation: make module return path and current module context explicit in edit mode.

## Session Continuity And Recovery

1. `git status -sb`
2. `git log --oneline -n 10`
3. reopen this brief and continue from the latest checkpoint.

## Checkpoint Log

- `2026-03-17 | kickoff | moved brief from planned to in-progress on branch feat/admin-workspace-hierarchy-and-safari-pr-hardening; implementation started for explicit module -> lesson visibility, return-to-module context, Help/Guide alignment, and unit/e2e regression coverage | next: finish targeted tests, run `npm run verify:pre-pr`, then open/update PR`
- `2026-03-17 | checkpoint | rebased feature branch onto main, confirmed #229 is the surviving PR, and hardened done-gate Playwright waits after one confirmed install/course-progress flake; local `npm run verify:pre-pr` passed on updated branch state | next: commit the CI hardening, push PR update, then rerun/monitor required GitHub checks`
- `2026-03-17 | 1b99034 (main) | merged via PR #229 after local `npm run verify:pre-pr`, local `npm run verify:pre-merge`, and green required GitHub checks; Course Workspace now makes module -> lesson hierarchy explicit in shipped admin UX and the brief is lifecycle-closed in done | next: resume real admin/content production and log only the next actual friction batch`
