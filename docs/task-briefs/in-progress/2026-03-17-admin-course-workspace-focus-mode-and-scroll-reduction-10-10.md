# Task Brief: Admin Course Workspace Focus Mode And Scroll Reduction (10/10)

## Metadata

- `id`: `2026-03-17-admin-course-workspace-focus-mode-and-scroll-reduction-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-03-17`
- `updated`: `2026-03-17`

## Goal

Make Course Workspace feel like one clear editorial flow by keeping overview and module focus as two coordinated states, not two fully expanded lesson surfaces competing on the same screen.

## Why This Brief Exists

- The previous hierarchy slice made module -> lesson relationships explicit and shipped safely.
- Real editorial review still shows one clear friction:
  - Course Workspace overview already shows module cards plus lesson detail,
  - Module Workspace lower on the page shows the same selected module lessons again,
  - editors must scroll through duplicated information before reaching the real working area.
- The result is understandable but not `10/10`:
  - too much vertical space,
  - too much duplicated lesson detail,
  - unclear distinction between "overview mode" and "focus mode".
- The right follow-up is not another schema or content-action slice. This is a UI/orchestration refinement of the shipped hierarchy work.

## Dependencies And Boundaries

- Parent workflows:
  - `docs/task-briefs/in-progress/2026-02-22-admin-full-content-edit-workflow-10-10.md`
  - `docs/task-briefs/in-progress/2026-02-25-content-production-v1-admin-editorial-run.md`
- Builds directly on:
  - `docs/task-briefs/done/2026-03-17-admin-course-workspace-hierarchy-and-lesson-visibility-10-10.md`
  - `docs/task-briefs/done/2026-03-17-aw-013-context-aware-admin-create-notes-and-qr-10-10.md`
- Scope stays inside admin course workspace UX, Help/Guide copy, and regression coverage.
- Do not reopen runtime-ID, QR, or schema work.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - `admin_content_items` rows for course modules and lessons,
  - canonical `parent_id`, `sort_order`, `status`, `slug`, runtime IDs, and revision data.
- Local-only:
  - current workspace scope,
  - whether overview is compact or expanded,
  - scroll/focus state used to keep the user in the selected module flow.
- Sync policy:
  - overview/focus mode must derive from already loaded canonical rows,
  - UI state must not mutate canonical data by itself,
  - after successful mutations, refreshed rows remain source of truth while selected module focus is preserved when safe.
- Cache/invalidation:
  - unchanged admin fetch/mutation model,
  - no extra server round-trip just to toggle focus vs overview detail.

## Identity And Rename Contract (Required)

- Canonical stable IDs:
  - module row `id` and lesson row `id` remain canonical relational IDs in admin,
  - runtime `moduleId` / `lessonId` remain canonical learner-facing identities.
- Human-readable identifiers:
  - `title` and `slug` remain operator-visible,
  - grouping and focus mode must not infer parentage from titles/slugs.
- Mutability rules:
  - unchanged from current course identity contract,
  - this brief affects layout and workflow only.
- Rename vs repurpose policy:
  - unchanged:
    - rename in place only for the same learning object,
    - create a new module/lesson for materially different content.
- Compatibility contract:
  - no migration or alias behavior changes,
  - existing runtime-ID compatibility remains untouched.
- Observability and repair:
  - unlinked lessons must remain explicitly visible and recoverable, not hidden by the new focus-mode behavior.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Admin editor ergonomics`
- `Business logic correctness and data integrity`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                    | Evidence                            |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Product goals and IA                          | `target`     | Editors can distinguish overview vs focused module flow without rereading page copy or scanning duplicate lesson lists.           | e2e + editorial walkthrough         |
| UX flow clarity                               | `target`     | When a module scope is active, one primary lesson list is visible and overview remains available without full duplicate detail.   | visual QA + e2e                     |
| Visual design quality                         | `target`     | Focus-mode compaction fits existing admin styling and reduces visible clutter/scroll depth.                                       | screenshot review + manual QA       |
| Business logic correctness and data integrity | `target`     | Compact/expanded overview still reports the same canonical lesson counts and never hides unlinked exception content.              | unit coverage + e2e                 |
| Admin editor ergonomics                       | `target`     | Editors can reach the selected module lesson list with fewer repeated rows and less scroll than the current dual-expanded layout. | manual QA + e2e                     |
| Accessibility (a11y)                          | `target`     | Scope toggles, mode labels, and return actions stay labeled and keyboard reachable.                                               | Playwright interactions + manual QA |
| Performance (CWV + payloads)                  | `supporting` | No material `/admin` payload or render regression; reuse loaded data only.                                                        | verify gates + code review          |
| Data placement and sync boundaries            | `target`     | Focus-mode state remains local-only while counts/order still derive from server-canonical rows.                                   | code review + regression checks     |
| Caching and invalidation strategy             | `supporting` | Existing admin refresh behavior stays deterministic after edit/create/reorder actions.                                            | regression checks                   |
| Reliability and failure handling              | `target`     | Empty module, unlinked lessons, and loading/error states stay explicit in both overview and focus mode.                           | manual QA + e2e                     |
| Security and authz                            | `supporting` | No auth boundary expansion; existing admin-only actions and API semantics stay unchanged.                                         | route/code review                   |
| Privacy and compliance                        | `N/A`        | N/A for admin-only layout refinement; no new personal/sensitive data is introduced or exposed.                                    | scope review only                   |
| Content governance                            | `supporting` | Existing status/runtime-ID/revision guidance remains visible and accurate after copy changes.                                     | Help/Guide review                   |
| Admin workflow and editability                | `target`     | Module-level actions remain available while focused lesson editing becomes the clearly preferred primary path.                    | e2e + editorial walkthrough         |
| SEO and crawlability                          | `N/A`        | N/A for admin-only workspace slice; no public metadata/indexing/crawl surface changes.                                            | scope boundary review               |
| AI discoverability                            | `N/A`        | N/A for admin-only workspace slice; no public semantic changes.                                                                   | scope boundary review               |
| Analytics and KPI observability               | `supporting` | No KPI schema change required; existing admin behavior remains traceable through deterministic UI states.                         | code review                         |
| Commerce and revenue ops                      | `N/A`        | N/A for course-workspace-only refinement; no commerce/entitlement/refund path changes.                                            | scope boundary review               |
| Incident response and support operations      | `supporting` | Help/Guide must explain overview vs module focus and how to return to all modules quickly.                                        | Help/Guide update                   |
| Finance and reporting operations              | `N/A`        | N/A for admin course UX refinement; no finance/export/reconciliation behavior changes.                                            | scope boundary review               |
| i18n operational readiness                    | `supporting` | New labels remain concise and string-based so future localization stays straightforward.                                          | copy review                         |
| Stack-fit and dependency discipline           | `target`     | Use existing React/Next/Tailwind/admin patterns with no new dependency.                                                           | dependency diff                     |
| Testing and QA automation                     | `target`     | Targeted unit/e2e coverage protects focus-mode compaction and passes `verify:pre-pr`.                                             | tests + gate result                 |
| Scalability and cost efficiency               | `supporting` | New UI derives from existing in-memory grouping and adds no new costly query pattern.                                             | code review                         |
| DevOps and rollback readiness                 | `supporting` | UI-only refinement remains trivially revertible in one PR with no migration.                                                      | diff review                         |

## Scope

- Clarify the distinction between:
  - overview mode (`all modules`),
  - focus mode (`selected module` or `unlinked lessons`).
- Reduce duplicate lesson detail when a module scope is active:
  - keep overview visible enough for orientation,
  - make the focused module lesson list the single primary working list.
- Improve wording/layout so editors understand:
  - what the overview is for,
  - what the module workspace is for,
  - how to return between them.
- Preserve:
  - module edit/add lesson actions,
  - preview/open actions,
  - lesson move/reorder actions,
  - unlinked lesson handling.
- Update Help/Guide to describe the intended workflow.
- Add/update regression coverage for the new focus-mode behavior.

## Out Of Scope

- New schema or API fields.
- Runtime-ID or slug contract changes.
- QR workflow changes.
- Guide/product/admin-wide IA redesign.
- Moving Course Workspace into a separate route/tab.

## Acceptance Criteria

1. When no module scope is active, Course Workspace acts as a compact overview of all modules.
2. When a module scope is active, the selected module lesson list becomes the one primary detailed lesson surface.
3. Non-focused module cards no longer dump full lesson detail that duplicates the active lesson list.
4. Editors can still switch back to all modules in one action.
5. Unlinked lessons remain explicit and actionable.
6. Help/Guide reflects the overview-vs-focus workflow in the same PR.
7. `npm run lint:briefs`, targeted tests, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- targeted tests:
  - `tests/e2e/admin-foundation.spec.ts`
  - `tests/e2e/admin-help-center.spec.ts`
- targeted unit coverage for any new workspace presentation helper
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
- Do not remove the ability to see lessons belonging to a module; reduce duplication instead.
- Do not hide exceptions like unlinked lessons.
- Keep the change small and editorially focused.

## 10/10 Quality Bar

- Editors should instantly understand whether they are in overview or focused module mode.
- Focus mode should feel calmer and shorter than overview mode, not just “the same page plus a banner”.
- Required states on changed surfaces:
  - `loading`
  - `empty`
  - `error`
  - `retry`
  - `success`
- No contradictory state where overview and module focus both claim to be the primary place to work.

## Help/Guide And Operator Training Contract

- Required in same PR:
  - explain overview vs focus mode in Course Workspace,
  - explain that `Open module scope` reduces the page to the selected module as the primary editing flow,
  - explain `Show all modules` as the return path to overview.

## Risks And Mitigations

- Risk: compacting the overview hides too much information.
  - Mitigation: keep lesson counts/status and quick actions visible, and preserve explicit entry to focus mode.
- Risk: focus mode still feels redundant because the active module card remains too detailed.
  - Mitigation: in focus mode, render compact overview cards and reserve full lesson detail for the focused module workspace list.
- Risk: unlinked lesson handling becomes less discoverable.
  - Mitigation: preserve explicit unlinked option and exception-state copy in the lower workspace list.

## Session Continuity And Recovery

1. `git status -sb`
2. `git log --oneline -n 10`
3. reopen this brief and continue from the latest checkpoint.

## Checkpoint Log

- `2026-03-17 | kickoff | opened follow-up slice after live editorial review confirmed that current Course Workspace still duplicates lesson detail between overview and module focus; new scope is to make overview compact and focus mode primary without changing schema or content contracts | next: implement focused compaction in admin UI, update Help/Guide, add targeted regression coverage, then run verify gates`
- `2026-03-17 | working tree | implemented overview-vs-focus compaction in Course Workspace: overview now shows compact module lesson previews, focused module scope collapses duplicate lesson detail above, and the lower Module Workspace becomes the single primary detailed lesson surface; targeted Vitest PASS, targeted admin Playwright PASS (`5 passed`, `2 skipped`), targeted eslint PASS, typecheck PASS, and full \`npm run verify:pre-pr\` PASS on dirty tree (`95` unit files / `415` tests, Playwright `80 passed`, `208 skipped`) | perf trend recommendation: tighten; decision for this non-perf UX slice: hold and keep perf budgets unchanged here | next: commit, push, open PR, then watch required checks and run \`npm run verify:pre-merge\` before merge`
