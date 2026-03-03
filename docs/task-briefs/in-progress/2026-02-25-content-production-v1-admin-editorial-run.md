# Task Brief: Content Production V1 Admin Editorial Run

## Metadata

- `id`: `2026-02-25-content-production-v1-admin-editorial-run`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-02-25`
- `updated`: `2026-03-03`

## Goal

Finish revision-1 production content in admin (course, guides, products, and page content) while running a tight fix loop for real admin UX/logic friction discovered during entry.

## Why This Brief Exists

- Platform editing foundations are now in place.
- The fastest path to a true 10/10 platform is to run real content production and fix only proven bottlenecks.
- This prevents overbuilding speculative features and keeps UX/data decisions grounded in actual use.

## Dependencies And Boundaries

- Admin schema migrations must be applied in each environment where content is entered.
- Existing source-of-truth and full-edit workflows remain parent workstreams:
  - `docs/task-briefs/in-progress/2026-02-19-admin-content-source-of-truth-and-dashboard-10-10.md`
  - `docs/task-briefs/in-progress/2026-02-22-admin-full-content-edit-workflow-10-10.md`
- This brief is editorial-production focused; structural platform rewrites stay in dedicated engineering slices.

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - all course/guides/products/page content records,
  - status (`draft/review/published/archived`), ownership, ordering,
  - revisions, notes, category links, and audit events.
- Local-only:
  - transient unsaved editor state,
  - viewport/UI preferences that do not change business truth.
- Sync policy:
  - save on explicit admin action,
  - treat server response as source of truth,
  - refresh list/detail view after save/publish/archive,
  - log and retry failed writes with deterministic error copy.
- Conflict handling:
  - if stale/invalid write occurs, reload canonical row and require explicit re-edit.
- Cache/invalidation:
  - admin list/detail refresh after mutation,
  - public content route revalidation for published changes.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold (for `target`)                                               | Evidence                          |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------- | --------------------------------- |
| Product goals and IA                          | `target`     | Admin can locate and edit intended content in <=2 navigation steps.           | timed manual QA + e2e spot checks |
| UX flow clarity                               | `target`     | No dead ends in create/edit/review/publish flow while producing real content. | production-session checklist      |
| Visual design quality                         | `supporting` | N/A                                                                           | manual QA                         |
| Business logic correctness and data integrity | `target`     | No silent overwrites/corruption; invalid writes blocked with explicit errors. | unit + negative-path API tests    |
| Admin editor ergonomics                       | `target`     | High-frequency content edits complete with low friction and clear feedback.   | session notes + UX issue log      |
| Accessibility (a11y)                          | `supporting` | N/A                                                                           | existing e2e/a11y suite           |
| Performance (CWV + payloads)                  | `supporting` | N/A                                                                           | verify checks                     |
| Data placement and sync boundaries            | `target`     | Local/server ownership remains deterministic for all edited content.          | code review + observed behavior   |
| Caching and invalidation strategy             | `target`     | Saved changes appear predictably in admin and published reads.                | manual QA + regression checks     |
| Reliability and failure handling              | `target`     | Expected failures return actionable non-500 UX.                               | API + e2e negative-path checks    |
| Security and authz                            | `target`     | Only authorized admin/editor mutations are accepted.                          | guard tests + e2e auth checks     |
| Privacy and compliance                        | `supporting` | N/A                                                                           | log/event review                  |
| Content governance                            | `target`     | Every produced item has owner/status/revision safety.                         | admin row validation              |
| Admin workflow and editability                | `target`     | Full-content editing is practical for real production volume.                 | production run notes              |
| SEO and crawlability                          | `supporting` | N/A (primary in SEO brief)                                                    | SEO brief boundary check          |
| AI discoverability                            | `supporting` | N/A (primary in SEO brief)                                                    | SEO brief boundary check          |
| Analytics and KPI observability               | `supporting` | N/A                                                                           | existing telemetry checks         |
| Commerce and revenue ops                      | `target`     | Product content edits do not break entitlement/checkout metadata.             | unit + manual checks              |
| Incident response and support operations      | `supporting` | N/A                                                                           | help/ops docs                     |
| Finance and reporting operations              | `supporting` | N/A                                                                           | commerce validation notes         |
| i18n operational readiness                    | `supporting` | N/A                                                                           | schema review                     |
| Stack-fit and dependency discipline           | `target`     | No unnecessary dependency/tooling growth during production fixes.             | dependency diff                   |
| Testing and QA automation                     | `target`     | Every production-triggered fix ships with relevant test coverage.             | PR test evidence                  |
| Scalability and cost efficiency               | `supporting` | N/A                                                                           | query/path review                 |
| DevOps and rollback readiness                 | `supporting` | N/A                                                                           | revisions/restore behavior        |

## Scope

- Produce revision-1 content directly in admin for:
  - course modules and lessons,
  - guide sessions and drills,
  - products/page content where applicable.
- Capture friction in real time and classify:
  - `P0`: blocks content production,
  - `P1`: high-friction UX/data risk,
  - `P2`: improvement after v1 completion.
- Ship P0/P1 fixes as small implementation slices with tests and PRs.

## Out Of Scope

- Full redesign of public pages not required for content production.
- New platform capabilities without proven production need.
- SEO strategy rollout beyond existing SEO brief scope.

## Acceptance Criteria

1. Revision-1 core content is entered through admin workflow without hard blockers.
2. All production-discovered P0 issues are fixed and verified before continuing content entry.
3. P1 issues are either fixed in-sprint or explicitly deferred with owner/date.
4. Every content mutation path used in production has deterministic validation + recoverable error UX.
5. Brief checkpoint log is updated per slice with hash, completed scope, and next step.

## Validation

- Per fix slice before PR update: `npm run verify:pre-pr`
- Before merge recommendation: `npm run verify:pre-merge`
- Targeted tests for touched scope (unit/e2e negative paths where relevant)

## Manual QA Environments

- Local admin: `http://127.0.0.1:3000/admin`
- Preview admin: PR Vercel URL for each fix slice
- Production smoke after deploy: `https://freeswimming.org/admin`

## 10/10 Quality Bar

- Editing should feel predictable: find -> edit -> validate -> save -> verify.
- Required state coverage on production-used surfaces:
  - `loading`, `empty`, `error`, `retry`, `success`.
- No ambiguous destructive actions.
- No contradictory UI states (for example success + blocking error simultaneously).
- Any new friction fix must preserve readability and low-click navigation.

## Implementation Slices

1. **Slice 1 (now):** start content-production run and log first production friction batch.
2. Slice 2+: address highest-priority blockers from live production usage in small PRs.

## Risks And Mitigations

- Risk: frequent content changes create schema/UX churn.
  - Mitigation: only ship proven friction fixes with concise scope and tests.
- Risk: production flow pauses due unknown edge cases.
  - Mitigation: classify P0 quickly and prioritize unblock PRs immediately.

## Session Continuity And Recovery

1. `git status -sb`
2. `git log --oneline -n 10`
3. reopen this brief and continue from latest checkpoint entry.

## Checkpoint Log

- `2026-03-03 | 96f91e5 | implementation complete | delivered follow-up sticky-dismiss + linked-new-lessons behavior for my-library notice with updated signal model, UI behavior, and tests; npm run verify:pre-pr passed | next: push branch and open PR in Safari`
- `2026-03-03 | kickoff | opened follow-up slice for my-library new-content notice sticky-dismiss + linked-new-lessons list (explicit X close only); created in-progress brief docs/task-briefs/in-progress/2026-03-03-my-library-new-content-notice-sticky-list-links-10-10.md | next: implement behavior and run verify:pre-pr before PR update`
- `2026-03-03 | d5d688c (main) | my-library new-content notice merged | PR #124 merged and closed; brief moved from in-progress to done after local npm run verify:pre-merge and green required CI checks | next: monitor production deploy on main and continue next editorial-production slice`
- `2026-03-03 | 80c8921 | my-library new-content notice slice delivered | implemented published-content signal route + per-user local seen signature flow + library banner UX (open/dismiss/retry) + analytics events + unit/e2e coverage; npm run verify:pre-pr passed | next: open/update PR in Safari and monitor required checks`
- `2026-03-03 | 6c4cca1 (main) | admin preview mode merged | PR #123 merged and closed; admin preview mode slice completed and brief moved to done | next: start my-library new-content notice slice from main`
- `2026-03-03 | c87c5b4 | admin preview mode slice delivered | shipped admin preview links for module/lesson rows, server-gated preview mode content reads, explicit /course preview banner + loading/error/empty states, preview-local progress key isolation, and non-index headers; added unit + e2e coverage and passed npm run verify:pre-pr | next: open/update PR in Safari; after merge continue with my-library new-content notice slice`
- `2026-03-03 | planning gate for library notice + admin preview mode | verified branch/main parity and no half-finished local diff for these features; created dedicated planned briefs: docs/task-briefs/planned/2026-03-03-my-library-new-content-notice-10-10.md and docs/task-briefs/planned/2026-03-03-admin-preview-mode-and-open-lesson-preview-10-10.md | next: execute preview-mode brief first, then library notice brief`
- `2026-02-25 | kickoff | content production v1 track opened after AW-013 phase8 merge; no hard blockers found in active briefs for starting editorial production | next: run Slice 1 production session and capture first friction batch`
- `2026-02-25 | desktop visual calibration slice | tuned large-screen readability/contrast and widened PageTemplate (wide layout) for course/admin surfaces to reduce washed-out look on large monitors; npm run verify:pre-pr passed (second run after one transient Playwright goto timeout) | next: verify on 49" monitor and capture any residual contrast/layout friction`
- `2026-02-27 | intro-video production pack | added complete 60s course intro video production package (timing, script, shot types, Camtasia specs, subtitles, YouTube metadata) in docs/video-production/intro-course-60s/production-pack.md + docs/video-production/intro-course-60s/subtitles.en.srt | next: produce first export cut in Camtasia and review against acceptance checklist`
