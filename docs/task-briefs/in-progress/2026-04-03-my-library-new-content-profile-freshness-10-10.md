# Task Brief: My Library New Content Profile Freshness (10/10)

## Metadata

- `id`: `2026-04-03-my-library-new-content-profile-freshness-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-03`
- `updated`: `2026-04-03`

## Goal

Make `NEW CONTENT` truthful by only surfacing lessons that became available after the learner joined or created their profile, instead of treating the whole published course as new on first load.

## Why This Brief Exists

- The umbrella still includes one remaining Package C note:
  - `3b7783ba-6a98-46f9-9259-909a1a90ac9e` `NEW CONTENT NOTIFICATION`
- The calmer disclosure slice in PR `#346` improved presentation only.
- The underlying signal still uses the full published lesson set on first load, which means an established learner can see old lessons as `new`.
- This slice finishes the truth contract by binding the signal to canonical content publish time and canonical learner join/profile creation time.

## Dependencies And Boundaries

- Parent umbrella:
  - `docs/task-briefs/in-progress/2026-04-01-production-admin-notes-remaining-work-umbrella-10-10.md`
- Main surfaces in scope:
  - `app/api/my-library/new-content-signal/route.ts`
  - `lib/my-library/new-content-notice.ts`
  - `lib/admin/content-course.ts`
  - `app/course/courseData.ts`
  - `tests/unit/my-library-new-content-notice.test.ts`
  - `tests/unit/my-library-new-content-signal-route.test.ts`
- This slice owns:
  - canonical viewer-since threshold selection,
  - canonical lesson publish-time filtering for the new-content signal,
  - regression coverage for first-load truthfulness.
- This slice does not own:
  - calmer notice layout,
  - unrelated My Library IA,
  - course pass-criteria work,
  - any builder-field removals.

## Triage Disposition

- `3b7783ba-6a98-46f9-9259-909a1a90ac9e` `NEW CONTENT NOTIFICATION`
  - disposition: owned by this brief.
  - reason: the remaining gap is the truthfulness of the freshness baseline, not the banner layout.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                       | Evidence                                    |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Product goals and IA                          | `target`     | `NEW CONTENT` only describes lessons that are genuinely newer than the learner baseline instead of re-announcing legacy course inventory.            | brief contract + unit tests                 |
| UX flow clarity                               | `target`     | First-load My Library notice content remains truthful for established learners, with no cosmetic-only `new` state on old lessons.                   | route tests + manual review                 |
| Visual design quality                         | `supporting` | Supporting only: the existing calmer notice UI remains unchanged and visually coherent while the truth logic changes underneath it.                  | no visual diff beyond existing notice       |
| Business logic correctness and data integrity | `target`     | Signal generation uses canonical `published_at` plus canonical learner/profile creation timestamps, with deterministic fallback rules.               | helper tests + route tests + code review    |
| Admin editor ergonomics                       | `N/A`        | N/A because the slice changes learner-scoped My Library freshness logic, not an admin editing workflow.                                             | explicit scope rationale                    |
| Accessibility (a11y)                          | `supporting` | Supporting only: no new controls or semantics are introduced beyond the already-covered notice UI.                                                  | existing notice coverage                    |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: the slice only adds one lightweight profile-created-at lookup and no new client payload surface.                                   | diff review + `verify:pre-pr`               |
| Data placement and sync boundaries            | `target`     | Canonical publish/profile timestamps stay server-owned; local storage still only tracks seen signatures and never invents freshness timestamps.      | brief contract + code review                |
| Caching and invalidation strategy             | `supporting` | Supporting only: the existing no-store route remains the single freshness read path.                                                                 | route review                                |
| Reliability and failure handling              | `target`     | Missing athlete profile data falls back to auth-user creation without breaking the notice; invalid timestamps never produce false-positive freshness. | route tests + helper tests                  |
| Security and authz                            | `target`     | Signal lookup stays user-scoped and authenticated, and no cross-user freshness state is introduced.                                                 | existing auth contract + scope review       |
| Privacy and compliance                        | `supporting` | Supporting only: profile creation time and lesson publish time remain inside existing authenticated surfaces only.                                   | code review                                 |
| Content governance                            | `target`     | `published_at` becomes the canonical freshness source for course-content availability instead of an implicit “all published lessons are new” rule.   | code review + brief contract                |
| Admin workflow and editability                | `N/A`        | N/A because there is no operator queue or admin workflow change in this slice.                                                                       | explicit scope rationale                    |
| SEO and crawlability                          | `N/A`        | N/A because My Library is authenticated and the slice changes no public crawlable surface.                                                           | explicit scope rationale                    |
| AI discoverability                            | `N/A`        | N/A because no public metadata or crawl-facing content changes.                                                                                      | explicit scope rationale                    |
| Analytics and KPI observability               | `supporting` | Supporting only: existing new-content events remain valid because the signal becomes more truthful, not less observable.                             | analytics contract review                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no product, price, entitlement, or checkout logic changes.                                                                               | explicit scope rationale                    |
| Incident response and support operations      | `N/A`        | N/A because the slice only tightens a private freshness rule and adds no separate operator recovery path.                                            | explicit scope rationale                    |
| Finance and reporting operations              | `N/A`        | N/A because there is no finance or reconciliation impact.                                                                                            | explicit scope rationale                    |
| i18n operational readiness                    | `N/A`        | N/A because the slice changes timestamp/filtering truth rules only and introduces no locale contract.                                                | explicit scope rationale                    |
| Stack-fit and dependency discipline           | `target`     | Reuse existing course-content, athlete-profile, and new-content signal helpers without adding dependencies or a second freshness service.            | dependency diff + code review               |
| Testing and QA automation                     | `target`     | Helper + route tests cover the baseline-selection and publish-time filtering contract, and `npm run verify:pre-pr` passes.                           | unit tests + gate output                    |
| Scalability and cost efficiency               | `supporting` | Supporting only: one extra lightweight profile query is acceptable and avoids larger content-duplication workarounds.                               | architecture review                         |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the slice is a rollback-safe signal-rule change with no migration or content repair step.                                           | PR summary + rollback note                  |

## Data Placement And Sync Contract

- Server-canonical:
  - course lesson/module `published_at`,
  - authenticated user `created_at`,
  - athlete profile `created_at` when present,
  - `/api/my-library/new-content-signal` response.
- Local-only:
  - seen-signature state in localStorage,
  - notice disclosure/dismiss UI state already owned by the existing banner.
- Sync policy:
  - the server route computes the viewer baseline on every no-store request,
  - the client only persists which canonical signal signature has already been seen,
  - no client-authored freshness timestamps are introduced.
- Retention and sensitivity:
  - learner/profile creation timestamps stay in private authenticated reads only,
  - no new exported or public fields are introduced.
- Cache/invalidation:
  - freshness still reads through the existing no-store endpoint and reflects newly published lessons on the next request.

## Identity And Rename Contract

- Canonical stable ID:
  - `lessonId` remains the route identity for course lesson deep-links.
- Human-readable identifiers:
  - lesson/module titles remain display-only and do not drive freshness logic.
- Mutability rules:
  - publish-time timestamps may change only through canonical content workflows; learner/profile creation timestamps are immutable historical facts.
- Compatibility contract:
  - existing local seen-signature payloads remain valid because they still key off lesson tokens/signatures.
- Observability and repair:
  - helper and route tests must catch regressions where old lessons reappear as `new` for established learners.

## Scope

- Use canonical course publish time when building the My Library new-content signal.
- Resolve a deterministic viewer baseline from athlete-profile creation time, falling back to auth-user creation time.
- Filter the signal so first-load notice content only includes genuinely fresh lessons.
- Add targeted regression coverage for helper + route behavior.

## Out Of Scope

- Reworking the new-content banner layout.
- New analytics events or help-center content.
- Course pass-criteria, brand rollout, or builder-workflow changes.

## Acceptance Criteria

1. First-load `NEW CONTENT` does not surface lessons published before the learner baseline.
2. Athlete-profile creation time is used when present; auth-user creation time is the fallback.
3. Missing/invalid profile timestamps do not cause false-positive `new content`.
4. Existing seen-signature and banner UI behavior remain compatible.
5. `npm run lint:briefs`, targeted tests, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted `vitest`:
  - `tests/unit/my-library-new-content-notice.test.ts`
  - `tests/unit/my-library-new-content-signal-route.test.ts`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library`
- Preview:
  - PR Vercel preview URL after branch push
- Recommended matrix:
  - desktop Chromium
  - desktop Safari/WebKit

## Constraints

- Keep the slice logic-focused; do not reopen the calmer notice layout work.
- Use canonical `published_at` rather than derived local heuristics for lesson freshness.
- Do not introduce any builder/input-field changes.

## 10/10 Quality Bar

- `NEW CONTENT` must be truthful, not merely attention-grabbing.
- Established learners should never see the whole legacy course catalog announced as newly published.
- Required states remain correct:
  - `no fresh lessons`
  - `fresh lessons available`
  - `missing athlete profile`
  - `stale seen signature`
  - `route failure`

## Help/Guide And Operator Training Contract

- `N/A` for this slice because it tightens an internal learner freshness rule only, adds no new visible workflow step, and does not create a separate support recovery flow.

## Security, Privacy, and Compliance

- Authentication and user scoping remain unchanged.
- Profile-created-at lookup stays private to the signed-in learner request.
- No new public metadata or cross-user cache surface is introduced.

## Observability And KPI Contract

- Existing notice analytics remain the contract:
  - `library_new_content_notice_shown`
  - `library_new_content_notice_opened`
  - `library_new_content_notice_seen`
- This slice improves signal truthfulness without adding new event names.

## Session Continuity And Recovery

- Canonical source of truth:
  - git branch
  - this brief path
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint note

## Git Rhythm Defaults

- Commit + push after one coherent validated freshness-rule slice.
- Open/update PR after `npm run verify:pre-pr` is green.

## PR Browser Rule

- Default PR create/review/merge links open in Safari.

## Checkpoint Log

- `2026-04-03 | working tree | canonical new-content freshness now filters published lessons by learner/profile baseline using course `published_at`, athlete-profile `created_at`, and auth-user fallback; npm run lint:briefs:all, targeted vitest, npm run typecheck, and full npm run verify:pre-pr are green (95 passed / 319 skipped) | next: commit, push, open the PR, and take the slice through CI + pre-merge`
- `2026-04-03 | working tree | started the remaining Package C freshness-truth child slice for note 3b7783ba; scope is canonical lesson publish time plus learner/profile creation baseline so old lessons stop appearing as new on first load | next: implement the server-threshold rule, add helper/route coverage, and run targeted validation`
