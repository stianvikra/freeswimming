# Task Brief: Content Production V1 Admin Editorial Run

## Metadata

- `id`: `2026-02-25-content-production-v1-admin-editorial-run`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-02-25`
- `updated`: `2026-03-08`

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
6. For any slice that changes workflow labels/actions/recovery behavior:
   - update Help/Guide and relevant runbook in the same PR,
   - or log explicit `N/A` rationale in checkpoint + PR summary.

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

## Core-Flow Gap Scan (2026-03-04)

- Timebox: ~55 minutes
- Routes scanned: `/`, `/course`, `/my-library`, `/admin`
- Evidence baseline:
  - current green verify baseline from latest merged slices (`npm run verify:pre-pr` / `npm run verify:pre-merge`),
  - existing route-relevant e2e/unit coverage:
    - home/site lock/a11y: `tests/e2e/a11y-home.spec.ts`, `tests/e2e/private-access-gate.spec.ts`
    - course flow/progress/support: `tests/e2e/course-progress-sync.spec.ts`, `tests/e2e/course-support-card-actions.spec.ts`
    - my-library notice/actions: `tests/e2e/my-library-new-content-notice.spec.ts`
    - admin auth/content/preview: `tests/e2e/admin-content-api-guards.spec.ts`, `tests/e2e/admin-preview-mode.spec.ts`, `tests/e2e/admin-foundation.spec.ts`

### Must Fix Before Further Content Entry

- None found (`target` categories below are all `>=4/5` for current editorial-production need).

| Gate Category                                 | Score (0-5) | Decision     | Notes                                                                          |
| --------------------------------------------- | ----------- | ------------ | ------------------------------------------------------------------------------ |
| Business logic correctness and data integrity | `4/5`       | continue now | no known corruption/silent overwrite path in current content/admin flows       |
| Security and authz                            | `4/5`       | continue now | admin and protected-route negative paths covered; fail-closed posture retained |
| Reliability and failure handling              | `4/5`       | continue now | loading/error/retry/success states covered on touched core surfaces            |
| Admin workflow and editability                | `4/5`       | continue now | real edit/save smoke validated; preview/edit flow available for active work    |

### Plan Next (Not Blocking Current Content Entry)

| Category Track                                            | Score (0-5) | Decision                            | Brief Link                                                                                     |
| --------------------------------------------------------- | ----------- | ----------------------------------- | ---------------------------------------------------------------------------------------------- |
| SEO and AI discoverability                                | `3/5`       | planned follow-up                   | `docs/task-briefs/planned/2026-02-18-seo-ai-discoverability-and-admin-seo-controls.md`         |
| QR redirect and campaign operations                       | `4/5`       | delivered follow-up                 | `docs/task-briefs/done/2026-02-28-qr-video-redirect-links-and-admin-controls-10-10.md`         |
| Performance stretch + security hardening depth            | `3/5`       | delivered baseline; stretch pending | `docs/task-briefs/done/2026-02-19-performance-budgets-and-security-negative-path-hardening.md` |
| Incident/support + finance/reporting + i18n ops readiness | `5/5`       | delivered follow-up                 | `docs/task-briefs/done/2026-03-04-operations-finance-i18n-readiness-baseline-10-10.md`         |

- Brief creation policy applied: new brief created only for categories with `target-score <4` that were not already covered by an active planned brief.

## Session Continuity And Recovery

1. `git status -sb`
2. `git log --oneline -n 10`
3. reopen this brief and continue from latest checkpoint entry.

## Checkpoint Log

- `2026-03-08 | working tree | validated new short-session harness (`npm run test:e2e:admin:short`) after loading .env.local and forcing open-mode default (`SITE_LOCK_ENABLED=0`): unauthenticated guard checks run green (3 passed), authenticated admin write-path checks remain skipped (2 skipped) in current local session | next: keep using the short-session command as baseline before revision-1 runs; when dev bypass account is writable+allowlisted in environment, confirm the 2 authenticated checks execute without skip`
- `2026-03-08 | working tree | delivered P2 automation-friction harness for short revision-1 admin sessions: added npm run test:e2e:admin:short (wrapper sets local defaults for DEV_AUTH_BYPASS_ENABLED/PW_PORT/NEXT_DIST_DIR/SITE_LOCK and auto-wires ADMIN_EMAIL_ALLOWLIST from DEV_AUTH_BYPASS_EMAIL when missing) | next: run npm run test:e2e:admin:short and confirm authenticated write-path checks no longer skip when local dev bypass credentials are present`
- `2026-03-08 | working tree | short revision-1 admin session executed (desktop Playwright: admin-content-api-guards + admin-foundation); friction batch logged: P0 none, P1 none, P2 automation-only: authenticated write-path checks were skipped in this local session because dev bypass/allowlisted admin was not available (`allowlisted dev account can complete core content workflow` + authenticated malformed-payload guard test skipped) | next: owner continues real content entry and logs next live editorial friction batch; if P0/P1 appears, open targeted fix slice with verify:pre-pr -> PR -> gate:pre-merge`
- `2026-03-08 | working tree | non-content friction-reduction slice completed before tonight's content session: resolved P2 editorial friction where Admin Content view reset to default after refresh by persisting `Course Workspace`/`All Content`preference; Help/Guide update`N/A` (no workflow labels/actions/recovery text changed); no new live P0/P1 friction captured because owner paused content production tonight | next: resume revision-1 content-production run and log the next real friction batch (P0/P1/P2)`
- `2026-03-08 | working tree | no revision-1 content production session executed today by owner decision; no new live P0/P1/P2 editorial friction batch captured in this session | next: resume content-production run and log the next real friction batch (P0/P1/P2) in this brief`
- `2026-03-07 | 8a44068 (main) | perf/security hardening closeout synced | PR #150 merged and performance+security hardening brief moved to done (`docs/task-briefs/done/2026-02-19-performance-budgets-and-security-negative-path-hardening.md`) with baseline gates shipped and stretch ratchet tracked as deferred policy | next: continue revision-1 content production and log next real editorial friction batch (P0/P1/P2)`
- `2026-03-07 | 141e58f (main) | resumed after PR #145 governance merge | synced local main + removed merged branch; no new P0 blockers introduced by PR-governance automation | next: continue revision-1 content production run and log first new live friction batch (P0/P1/P2), while tracking locale-routing + finance-process blockers in ops readiness brief`
- `2026-03-06 | working tree | moved operations/finance/i18n readiness brief from planned to in-progress and delivered slice-1 baseline docs (incident runbook + finance checklist + i18n checklist) | next: continue content production track while logging blockers from checklist/runbook execution`
- `2026-03-06 | working tree | QR Slice 1 local delivery complete under in-progress QR brief: canonical redirect model migration + secure `/go/v/[slug]` route + fallback page + policy guards + unit tests; npm run verify:pre-pr PASS | next: commit/push QR Slice 1 and open/update PR in Safari before continuing QR admin-registry slice`
- `2026-03-06 | working tree | approved QR redirect/admin-controls brief refresh and moved docs/task-briefs/planned/2026-02-28-qr-video-redirect-links-and-admin-controls-10-10.md -> docs/task-briefs/in-progress/2026-02-28-qr-video-redirect-links-and-admin-controls-10-10.md | next: execute Slice 1 redirect foundation (`/go/v/[slug]` + fallback + security guards) with tests`
- `2026-03-05 | 5a4d0b0 (main) | PR #132 merged and closed | shipped admin Content mode split (`Course Workspace`vs`All Content`) with local npm run verify:pre-merge PASS and required CI checks green; normalized required-check mapping to check-run contexts to clear stale Expected state | next: continue revision-1 content production on feat/content-production-v1-batch-2 and log first new friction batch`
- `2026-03-05 | 754ef2d | PR #130 opened for P0 structure safety slice | pushed branch and opened PR in Safari; local npm run verify:pre-pr green on final diff; CI checks pending | next: monitor required checks, run npm run verify:pre-merge before merge, then continue content-production batch with safe reorder/delete workflow`
- `2026-03-05 | P0 reorder/delete safety slice delivered (local) | implemented admin module/lesson structure actions with deterministic normalization + integrity guards, explicit module delete strategy modal, and updated unit/e2e coverage; hardened flaky desktop course-progress/new-content notice waits; npm run verify:pre-pr passed | next: push branch, open PR in Safari, monitor required checks; then continue content production with structure-safe workflow`
- `2026-03-05 | P0 classification from live content run | identified critical admin structure risk: reorder/delete safety + data integrity gaps (module/lesson moves, delete handling, sort normalization, integrity checks) | opened dedicated in-progress P0 brief docs/task-briefs/in-progress/2026-03-05-admin-course-reorder-delete-safety-and-integrity-10-10.md for immediate implementation | next: execute P0 brief before further high-volume course structure edits`
- `2026-03-04 | working tree | core-flow gap scan completed for /, /course, /my-library, /admin using current verify evidence (unit/e2e/build green) | no P0 blockers found for continued content entry; planning follow-up captured in docs/task-briefs/planned/2026-03-04-operations-finance-i18n-readiness-baseline-10-10.md for non-blocking readiness categories (incident/finance/i18n) | next: continue revision-1 content production and log first real friction batch (P0/P1/P2)`
- `2026-03-03 | b3847e1 (main) | ready-for-tomorrow checkpoint | synced local main after sticky-list-links merge and confirmed manual admin lesson edit/save smoke works; no blocking issues observed | next: continue revision-1 content entry and log first friction batch`
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
