# Task Brief: Admin Preview Mode And Open Lesson Preview 10/10

## Metadata

- `id`: `2026-03-03-admin-preview-mode-and-open-lesson-preview-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-03-03`
- `updated`: `2026-03-03`

## Goal

Admin can preview lesson/module content directly from admin rows in a new browser window, including non-published statuses (`draft`, `review`, `published`) with explicit preview mode UX and strict public safety defaults.

## Why This Brief Exists

- Current course flow serves published content only.
- Admin needs fast editorial QA without manual URL hacking.
- Preview must be explicit, safe, and non-indexable.

## Scope

- Add explicit admin-only preview mode model for course content reads:
  - default learner mode: `published` only,
  - preview modes available to admin: `published`, `review`, `draft`, `all`.
- Add `Open preview` action in admin content rows for module/lesson.
  - open in new window/tab (`_blank`) from admin UI,
  - include selected entity context in URL.
- Add clear preview banner on course page:
  - `Preview mode — not visible to learners`.
- Keep public safety defaults:
  - non-admin never receives draft/review content,
  - no silent mode switching.
- Separate preview progress from learner progress:
  - dedicated localStorage keys for preview mode.
- Ensure preview responses/pages are non-indexable:
  - `noindex, nofollow`,
  - excluded from sitemap behavior.
- Add tests for admin and non-admin negative paths.

## Out Of Scope

- Content-edit UI redesign (covered by AW-013 edit workflow brief).
- Notification UX in My Library (covered by separate brief).
- Publication workflow redesign.

## Dependencies And Boundaries

- Depends on role/auth checks already used in admin APIs.
- Depends on canonical content status model (`draft/review/published/archived`).
- Related briefs:
  - `docs/task-briefs/in-progress/2026-02-22-admin-full-content-edit-workflow-10-10.md`
  - `docs/task-briefs/planned/2026-03-03-my-library-new-content-notice-10-10.md`

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - content rows and status visibility rules,
  - mode-filtered API responses.
- Local-only:
  - preview session UI state,
  - preview progress keys separate from normal course progress.
- Sync policy:
  - preview always reads live mode-filtered content;
  - preview does not mutate canonical learner progress.
- Conflict/invalidation:
  - refresh/reopen preview fetches current status snapshot.
- Retention and sensitivity:
  - preview URL parameters avoid sensitive data;
  - no secret tokens in URL.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                             | Evidence                 |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------- | ------------------------ |
| Product goals and IA                          | `target`     | Admin can open correct module/lesson preview from row action in <=2 clicks.                  | e2e + manual QA          |
| UX flow clarity                               | `target`     | Preview mode state is always explicit with visible banner and clear status context.          | e2e + visual QA          |
| Visual design quality                         | `target`     | Preview indicators and actions align with current admin/course design language.              | visual checklist         |
| Business logic correctness and data integrity | `target`     | Public users only see `published`; admin preview sees selected mode deterministically.       | unit + integration tests |
| Admin workflow and editability                | `target`     | Editor can verify draft/review/published behavior without leaving admin flow.                | e2e scenario             |
| Security and authz                            | `target`     | Non-admin cannot access non-published modes (`401/403` fail-closed).                         | negative-path API/e2e    |
| Privacy and compliance                        | `target`     | Preview pages and responses are non-indexable and do not expose sensitive data.              | header/meta tests        |
| Data placement and sync boundaries            | `target`     | Preview state is isolated from learner progress state.                                       | unit + e2e assertions    |
| Caching and invalidation strategy             | `target`     | Mode-aware responses avoid stale cross-mode leakage.                                         | integration tests        |
| Reliability and failure handling              | `target`     | Invalid mode/auth errors are explicit and recoverable; no unexpected `500`.                  | negative-path tests      |
| Performance (CWV + payloads)                  | `supporting` | Preview mode adds no material route regression for `/course`.                                | verify + route checks    |
| SEO and crawlability                          | `target`     | Preview route rendering is noindex/nofollow and excluded from sitemap indexing expectations. | metadata/sitemap tests   |
| Testing and QA automation                     | `target`     | Dedicated tests cover admin preview open, mode filtering, and non-admin deny paths.          | CI evidence              |
| DevOps and rollback readiness                 | `supporting` | Feature can be toggled/rolled back cleanly with no learner-data corruption.                  | rollout note + tests     |

## Acceptance Criteria

1. Admin row actions include `Open preview` for lesson/module and open in new tab/window.
2. Admin can preview selected content in `published`, `review`, `draft`, and `all` mode.
3. Public/unauthorized users cannot retrieve non-published preview data.
4. Course preview displays clear banner that preview is not learner-visible.
5. Preview progress state is isolated from normal learner progress state.
6. Preview pages/responses are non-indexable and excluded from crawl intent.
7. Unit + e2e negative-path tests pass.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npx playwright test tests/e2e/admin-preview-mode.spec.ts --project=desktop-chromium`
- `npx playwright test tests/e2e/admin-foundation.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## 10/10 Quality Bar

- Preview behavior is explicit, never implicit.
- No learner confusion: default flow remains published-only.
- Required states on changed surfaces:
  - `loading`, `empty`, `error`, `retry`, `success`.
- Accessibility:
  - preview controls keyboard operable,
  - visible focus,
  - clear labels and mode descriptions.

## Risks And Mitigations

- Risk: accidental exposure of draft/review to public.
  - Mitigation: strict server authz checks + deny-by-default tests.
- Risk: preview mode pollutes learner progress.
  - Mitigation: dedicated preview storage namespace.
- Risk: stale mixed-mode responses.
  - Mitigation: mode-aware caching keys and explicit invalidation path.

## Session Continuity And Recovery

1. `git status -sb`
2. `git log --oneline -n 10`
3. reopen this brief and continue from latest checkpoint.

## Checkpoint Log

- `2026-03-03 | 6c4cca1 (main) | merged and closed in PR #123 | admin preview mode slice is live on main; branch feat/admin-preview-mode-open-lesson-preview marked safe to delete | next: execute my-library new-content notice slice`
- `2026-03-03 | c87c5b4 | implementation complete for slice scope | moved brief from planned->in-progress; implemented preview-mode core on admin links + /api/course/content gate + /course banner/state + preview-local progress isolation + noindex headers + new unit/e2e coverage; verification gate npm run verify:pre-pr passed | next: push branch and open/update PR in Safari`
