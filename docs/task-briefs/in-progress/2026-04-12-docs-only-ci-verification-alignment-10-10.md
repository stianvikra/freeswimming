# Task Brief: Docs-only CI Verification Alignment (10/10)

## Metadata

- `id`: `2026-04-12-docs-only-ci-verification-alignment-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-12`
- `updated`: `2026-04-12`

## Goal

Make GitHub PR CI use the same conservative docs-only verification lane that local `verify:pre-pr` and `verify:pre-merge` already use for pure docs/governance diffs, while preserving the existing required check names and the full runtime lane for every code-touching PR.

## Why This Brief Exists

- Local docs-only verification is already implemented and passing.
- PR [#419](https://github.com/stianvikra/freeswimming/pull/419) exposed a gap: GitHub CI still runs full `verify:public` for a pure docs/governance diff.
- That keeps expensive runtime gates active on a scope the repo has already classified as docs-only, and it can block merge readiness for the wrong reason.
- The fix should align CI with the existing lane contract, not invent a parallel policy.

## Dependencies And Boundaries

- Existing local lane contract:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-11-docs-only-verification-lane-10-10.md`
- CI/workflow surfaces:
  - `/Users/stianvikra/freeswimming/.github/workflows/ci.yml`
- Existing scope detection + docs-only runner:
  - `/Users/stianvikra/freeswimming/scripts/verification-scope.mjs`
  - `/Users/stianvikra/freeswimming/scripts/run-verify-docs-only.sh`
- Existing tests:
  - `/Users/stianvikra/freeswimming/tests/unit/verification-scope.test.ts`
  - `/Users/stianvikra/freeswimming/tests/unit/pr-body-verification-lane.test.ts`
- Out of scope:
  - renaming required GitHub checks,
  - weakening CI for code-touching PRs,
  - broad workflow redesign outside docs-only-vs-full lane alignment,
  - product/runtime behavior.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                   | Evidence                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Pure docs/governance PRs finish CI under the docs-only lane contract instead of full runtime verification, without requiring operators to learn new check names. | workflow diff + PR check behavior review  | `5/5`                   |
| UX flow clarity                               | `target`     | CI logs clearly state whether the PR is using `docs-only` or `full`, and skipped runtime jobs explain why.                                                       | workflow log review + unit test coverage  | `5/5`                   |
| Visual design quality                         | `N/A`        | N/A because this slice changes CI/workflow behavior only, not a user-facing visual surface.                                                                      | explicit scope rationale                  | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Docs-only CI selection only happens for PR diffs where every changed path stays inside the explicit docs/governance allowlist; any code-touching PR stays full.  | unit tests + workflow behavior review     | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editing UI changes.                                                                                                                         | explicit scope rationale                  | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no changed interactive product surface exists beyond CI logs.                                                                                        | explicit scope rationale                  | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no route payload/runtime performance behavior changes.                                                                                               | explicit scope rationale                  | `N/A`                   |
| Data placement and sync boundaries            | `target`     | CI lane choice is derived from the actual PR diff at runtime and stays aligned with the existing local lane classifier.                                          | helper/script review + workflow outputs   | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because the slice introduces no runtime cache or invalidation behavior.                                                                                      | explicit scope rationale                  | `N/A`                   |
| Reliability and failure handling              | `target`     | Docs-only PRs fail closed to the full lane when scope is uncertain, and runtime jobs skip only when the CI plan explicitly says `docs-only`.                     | unit tests + CI log review                | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because auth/permission behavior is unchanged.                                                                                                               | explicit scope rationale                  | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user-data handling changes.                                                                                                                       | explicit scope rationale                  | `N/A`                   |
| Content governance                            | `supporting` | Supporting only: the CI lane stays consistent with the repo’s already-documented docs-only verification policy.                                                  | brief linkage + workflow alignment review | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin/operator product workflow changes.                                                                                                          | explicit scope rationale                  | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public indexing/metadata behavior changes.                                                                                                        | explicit scope rationale                  | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic/canonical content changes.                                                                                                        | explicit scope rationale                  | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: CI logs/artifacts remain inspectable enough to see which lane ran and why runtime checks were skipped or executed.                              | CI logs + artifact upload review          | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no billing/catalog/checkout behavior changes.                                                                                                        | explicit scope rationale                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because the slice changes repo CI only; it does not alter live support or on-call production workflows.                                                      | explicit scope rationale                  | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance or reporting workflow changes.                                                                                                            | explicit scope rationale                  | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale or translation workflow changes.                                                                                                           | explicit scope rationale                  | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | The fix reuses existing repo-native shell/Node classification and introduces no new dependency.                                                                  | dependency diff + code review             | `5/5`                   |
| Testing and QA automation                     | `target`     | Automated coverage protects CI lane planning and prevents docs-only PRs from silently drifting back to the full lane.                                            | unit tests + local verify passes          | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Pure docs/governance PRs avoid unnecessary browser/build/runtime CI cost while code PRs still pay the full gate.                                                 | workflow behavior review + CI timings     | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | The alignment is reversible by a narrow workflow/helper rollback, and required check names remain unchanged.                                                     | workflow diff + rollback simplicity check | `5/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - GitHub PR checks remain canonical for merge readiness.
- Local-only:
  - local pre-PR/pre-merge artifacts continue to record the lane actually run.
- CI-derived:
  - the GitHub Actions lane is derived from the actual PR diff at runtime,
  - for pull requests only,
  - using the same conservative path allowlist as the local docs-only lane.
- Fail-closed rule:
  - if CI cannot confidently classify the PR as docs-only, it must run the full lane.

## Identity And Rename Contract

- `N/A`
- Rationale: this slice changes CI/workflow behavior only, not persisted entity identities.

## Scope

- Add a small repo-native CI verification-plan helper that resolves `docs-only` vs `full` for PRs.
- Wire GitHub CI to compute that lane before smoke/verify jobs run.
- Keep the existing job names (`e2e-smoke`, `site-lock-smoke`, `verify`) stable.
- Make docs-only PRs fast-pass smoke/runtime jobs with explicit skip messaging.
- Make the `verify` job run `npm run verify:docs-only` and skip webpack/build/runtime verification when the plan says `docs-only`.
- Preserve the existing full CI path for any non-docs PR.
- Add targeted unit coverage for CI lane planning.

## Out Of Scope

- Changing local `verify:pre-pr` or `verify:pre-merge` command names.
- Renaming branch-protection checks.
- Applying docs-only CI selection to non-PR events.
- Product/admin feature work.

## Acceptance Criteria

1. A pure docs/governance pull request is classified as `docs-only` in GitHub CI using the same conservative allowlist as the local lane classifier.
2. For a docs-only PR, `e2e-smoke` and `site-lock-smoke` keep their job names but skip runtime work with explicit log output.
3. For a docs-only PR, the `verify` job runs `npm run verify:docs-only` and skips full `verify:public` and webpack build checks.
4. Any code-touching PR still runs the existing full CI path.
5. The change fails closed: uncertain scope or non-PR events use the full lane.
6. Relevant tests pass, plus local `npm run verify:pre-pr` and `npm run verify:pre-merge` pass on this slice.

## Validation

- targeted unit tests for CI verification-plan behavior
- `npm run test:unit -- --run tests/unit/verification-scope.test.ts tests/unit/pr-body-verification-lane.test.ts`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Constraints

- Keep the fix narrow and conservative.
- Reuse the existing docs-only classifier; do not fork a second allowlist policy.
- Preserve required check names and current full-lane behavior for code PRs.

## Help/Guide Impact

- `N/A` for product/admin Help/Guide.
- Repo operator behavior remains the same; CI now matches the existing docs-only lane contract.

## Checkpoint Log

- `2026-04-12 | in-progress | opened as a child follow-up after PR #419 showed that local docs-only verification is aligned but GitHub CI still runs full runtime verification on a pure docs/governance diff; direction locked: keep current required check names, add conservative CI lane planning for PRs only, and fail closed to full verification everywhere else | next: implement the CI plan helper/workflow wiring, add unit coverage, rerun repo gates, and update PR #419`
- `2026-04-12 | in-progress | implemented a repo-native CI lane resolver, wired \`.github/workflows/ci.yml\` to use the same conservative docs-only-vs-full plan for PR jobs, added unit coverage for the new planner, and confirmed local \`npx vitest run tests/unit/ci-verification-plan.test.ts tests/unit/verification-scope.test.ts tests/unit/pr-body-verification-lane.test.ts\`, \`npm run lint:briefs\`, and \`npm run verify:pre-pr\` all pass on the child slice; current branch still correctly selects the full lane because the diff includes workflow/script/test files | next: run \`npm run verify:pre-merge\`, commit, push, update PR #419, and watch required GitHub checks`
- `2026-04-12 | in-progress | local validation is now complete for the child slice: \`npm run verify:pre-pr\` and \`npm run verify:pre-merge\` both passed on the workflow/script/test diff, with pre-merge explicitly recording PASS and skipping the private-gate regression only because \`SITE_LOCK_ENABLED!=1\`; scope is ready for commit/push and GitHub check observation on PR #419 | next: commit, push, update PR metadata if needed, and confirm required CI checks stay green with the aligned lane behavior`
