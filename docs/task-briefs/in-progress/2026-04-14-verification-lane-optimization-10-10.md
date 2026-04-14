# Task Brief: Verification Lane Optimization (10/10)

## Metadata

- `id`: `2026-04-14-verification-lane-optimization-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-14`
- `updated`: `2026-04-14`

## Goal

Reduce duplicate pre-merge verification work by reusing a fresh same-HEAD local verify artifact when it already proves the public lane passed, without weakening any required coverage or private-gate behavior.

## Why This Brief Exists

- The repo intentionally runs `verify:pre-pr` before PR updates and `verify:pre-merge` before merge recommendation.
- On unchanged HEADs, `verify:pre-merge` currently reruns the full public lane even when the same commit already passed `verify:pre-pr` minutes earlier.
- That duplication increases process friction and closeout latency without improving accuracy when the head SHA and lane are identical.
- The optimization should be conservative: reuse only when the latest local artifact is a PASS for the current HEAD and expected lane; otherwise rerun exactly as today.

## Dependencies And Boundaries

- Current verify scripts and artifact conventions:
  - `/Users/stianvikra/freeswimming/scripts/run-verify-open.sh`
  - `/Users/stianvikra/freeswimming/scripts/run-verify-docs-only.sh`
  - `/Users/stianvikra/freeswimming/scripts/run-verify-pre-merge.sh`
  - `/Users/stianvikra/freeswimming/docs/runbooks/local-verify-and-test-artifacts.md`
- Existing docs-only/full lane classification:
  - `/Users/stianvikra/freeswimming/scripts/verification-scope.mjs`
- Relevant tests:
  - `/Users/stianvikra/freeswimming/tests/unit/`
- Out of scope:
  - PR merge discipline and post-merge closeout flow,
  - CI lane changes,
  - product/runtime behavior,
  - skipping required private-gate coverage when site lock is enabled.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Testing and QA automation`
- `Scalability and cost efficiency`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                       | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Operators keep the same commands, but pre-merge no longer duplicates the full public lane when the same HEAD already passed locally.     | script behavior review + runbook updates    | `5/5`                   |
| UX flow clarity                               | `target`     | `verify:pre-merge` clearly says whether it reused or reran the public lane and why.                                                      | terminal output + unit tests                | `5/5`                   |
| Visual design quality                         | `N/A`        | N/A because this slice changes repo tooling only, not visual/runtime UI.                                                                 | explicit scope rationale                    | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Reuse happens only when latest local verify metadata is PASS for the current HEAD and expected lane; any mismatch fails closed to rerun. | unit tests + local gate runs                | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editing/runtime UI changes.                                                                                         | explicit scope rationale                    | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no interactive runtime surface changes.                                                                                      | explicit scope rationale                    | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because the slice changes verification workflow, not route/runtime performance behavior.                                             | explicit scope rationale                    | `N/A`                   |
| Data placement and sync boundaries            | `target`     | Local verify artifacts record enough metadata to prove what HEAD/lane/status can be reused during pre-merge.                             | artifact metadata review + unit tests       | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no runtime cache changes; local artifact reuse is based on explicit HEAD/lane metadata only.                                 | explicit scope rationale                    | `N/A`                   |
| Reliability and failure handling              | `target`     | Missing or stale metadata always falls back to a fresh full run, and private-gate step behavior remains unchanged.                       | unit tests + local pre-merge run            | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because no auth/permission behavior changes.                                                                                         | explicit scope rationale                    | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user-data handling changes.                                                                                               | explicit scope rationale                    | `N/A`                   |
| Content governance                            | `supporting` | Supporting only: runbooks/docs accurately describe when local verify reuse is allowed and when a rerun still happens.                    | docs review                                 | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin/operator product workflow changes.                                                                                  | explicit scope rationale                    | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public route/indexing behavior changes.                                                                                   | explicit scope rationale                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic/canonical content changes.                                                                                | explicit scope rationale                    | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: artifact metadata and logs make reuse-vs-rerun decisions inspectable for local debugging.                               | artifact/log review                         | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no billing/commercial workflow changes.                                                                                      | explicit scope rationale                    | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because the slice changes local repo delivery workflow only, not production support/on-call procedures.                              | explicit scope rationale                    | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance/reporting workflow changes.                                                                                       | explicit scope rationale                    | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale/translation workflow changes.                                                                                      | explicit scope rationale                    | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | The optimization reuses repo-native shell/Node tooling and adds no dependency.                                                           | dependency diff + code review               | `5/5`                   |
| Testing and QA automation                     | `target`     | Automated coverage protects metadata parsing and reuse/fallback rules, while full repo gates remain green on the optimized flow.         | new unit tests + local verify               | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Same-HEAD pre-merge avoids redundant public verification work, reducing operator latency without removing any lane entirely.             | before/after behavior review + local output | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | The change is narrow, reversible, and preserves current command names and fallback semantics.                                            | diff review + local gate evidence           | `5/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - GitHub CI/checks remain canonical for shared merge readiness.
- Local-only:
  - latest local verify artifact directory,
  - per-run metadata (HEAD SHA, lane, status, timestamp),
  - pre-merge marker JSON.
- Sync policy:
  - `verify:pre-pr` writes metadata for the exact HEAD/lane it validated,
  - `verify:pre-merge` may reuse that artifact only when HEAD/lane/status match,
  - any mismatch reruns the public lane before continuing.
- Cache/invalidation:
  - the latest run symlink/metadata is replaced on every local verify execution,
  - reuse never spans across a different HEAD or lane.

## Identity And Rename Contract

- `N/A`
- Rationale: this slice changes verification workflow only, not persisted entity identifiers.

## Scope

- Add structured metadata to local verify run artifacts.
- Add a repo-native helper that decides whether `verify:pre-merge` can reuse the latest local verify result for the current HEAD/lane.
- Make `verify:pre-merge` reuse that artifact when safe and rerun when not.
- Preserve the existing private-gate step and fail-closed behavior.
- Update local verify docs to describe the reuse rule.
- Add targeted unit coverage for metadata parsing and reuse decisions.

## Out Of Scope

- Changing merge preflight or post-merge closeout workflow.
- Changing GitHub CI behavior.
- Weakening test coverage or skipping private-gate runs when they are required.
- Product/runtime/admin feature work.

## Acceptance Criteria

1. `verify:pre-merge` reuses the latest local public/docs-only verify result only when it is a PASS for the current HEAD and expected lane.
2. When metadata is missing, stale, failing, or lane-mismatched, `verify:pre-merge` reruns the public/docs-only verification step exactly as before.
3. The private-gate step in `verify:pre-merge` still runs or skips exactly as today based on site-lock inputs.
4. Local verify artifacts record enough metadata to explain the reuse decision.
5. New unit tests cover reuse and fallback rules.
6. `npm run verify:pre-pr` and `npm run verify:pre-merge` pass on this slice.

## Validation

- `npx vitest run tests/unit/verify-run-metadata.test.ts`
- `npm run lint:briefs`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Constraints

- Do not reduce effective coverage.
- Reuse only exact same-HEAD local PASS evidence.
- Keep command names and fallback behavior stable.

## Help/Guide Impact

- `N/A` for product/admin Help/Guide.
- Repo operator docs/runbooks are in scope and must reflect the reuse rule.

## Checkpoint Log

- `2026-04-14 | in-progress | opened a follow-up tooling slice after brief 1 to remove redundant same-HEAD public verify work from pre-merge, with strict fail-closed fallback and no change to private-gate coverage | next: add verify-run metadata + reuse helper, validate with full pre-pr/pre-merge gates, and open a separate PR`
- `2026-04-14 | in-progress | implemented local verify metadata + pre-merge reuse decision helper, updated runbooks, added targeted unit coverage, and confirmed \`npm run lint:briefs:all\` passes | next: rerun \`npm run verify:pre-pr\`, then push/open PR and validate \`npm run gate:pre-merge\` on the final HEAD`
- `2026-04-14 | in-progress | perf-budget trend recommended tighten after two weekly green runs; decision for this tooling-only slice is \`hold\` because it does not own route-budget thresholds and should not change AW-010 targets opportunistically | next: carry stretch-target tightening in the next perf-owned brief or PR summary`
