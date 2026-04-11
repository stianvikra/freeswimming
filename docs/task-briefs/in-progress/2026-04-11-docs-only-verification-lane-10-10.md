# Task Brief: Docs-only Verification Lane (10/10)

## Metadata

- `id`: `2026-04-11-docs-only-verification-lane-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-11`
- `updated`: `2026-04-11`

## Goal

Make `npm run verify:pre-pr` and `npm run verify:pre-merge` automatically use a lightweight docs-only gate for pure docs/governance diffs, while preserving the full runtime release gate for all code-touching changes.

## Why This Brief Exists

- Current repo policy treats a brief closeout PR the same as a runtime/product PR.
- That forces full lint/typecheck/build/perf/e2e on diffs that only move/update docs and governance files.
- The safety value of that full gate is low for true docs-only closeouts, while the time cost and workflow friction are high.
- The repo should keep strict release gates for code changes, but use a narrower lane when the diff is truly documentation/governance-only.

## Dependencies And Boundaries

- Current release-gate scripts and package commands:
  - `/Users/stianvikra/freeswimming/package.json`
  - `/Users/stianvikra/freeswimming/scripts/run-verify-open.sh`
  - `/Users/stianvikra/freeswimming/scripts/run-verify-pre-merge.sh`
  - `/Users/stianvikra/freeswimming/scripts/generate-pr-body.mjs`
- Current repo-policy/docs surfaces:
  - `/Users/stianvikra/freeswimming/AGENTS.md`
  - `/Users/stianvikra/freeswimming/docs/testing-strategy.md`
  - `/Users/stianvikra/freeswimming/docs/runbooks/local-verify-and-test-artifacts.md`
  - `/Users/stianvikra/freeswimming/docs/task-brief-template.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/README.md`
  - `/Users/stianvikra/freeswimming/.github/pull_request_template.md`
- Relevant tests in scope:
  - `/Users/stianvikra/freeswimming/tests/unit/`
- Out of scope:
  - product/admin runtime behavior,
  - CI required-check names,
  - weakening release gates for code, runtime config, scripts, workflows, or tests.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                               | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Repo operators can use the same pre-PR/pre-merge commands as before, but docs-only diffs no longer pay the full runtime-gate cost.                           | script behavior + docs review               | `5/5`                   |
| UX flow clarity                               | `target`     | Gate output clearly says whether the current diff is running `docs-only` or full verification and why.                                                       | command output review + unit tests          | `5/5`                   |
| Visual design quality                         | `N/A`        | N/A because this slice changes repo tooling/docs, not user-facing visual surfaces.                                                                           | explicit scope rationale                    | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Docs-only auto-selection only happens when every changed file stays inside the allowed docs/governance set; any code-touching diff still runs the full gate. | unit tests + manual diff review             | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editing UI or publish workflow changes.                                                                                                 | explicit scope rationale                    | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no changed interactive product surface exists beyond terminal/log output.                                                                        | explicit scope rationale                    | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because the slice changes local verification policy, not route payloads or runtime performance.                                                          | explicit scope rationale                    | `N/A`                   |
| Data placement and sync boundaries            | `target`     | Verification artifacts and pre-merge markers explicitly record whether the latest run used `docs-only` or `full`, so PR evidence stays truthful.             | script diff + artifact review               | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because the slice introduces no runtime cache or invalidation behavior.                                                                                  | explicit scope rationale                    | `N/A`                   |
| Reliability and failure handling              | `target`     | Docs-only lane is deterministic, fails closed on non-docs scope, and keeps the existing full-gate path unchanged for all non-docs diffs.                     | unit tests + manual shell QA                | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because no auth, permission, secret, or protected endpoint behavior changes.                                                                             | explicit scope rationale                    | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because the slice changes no user-data handling, consent, retention, or disclosure behavior.                                                             | explicit scope rationale                    | `N/A`                   |
| Content governance                            | `target`     | Repo docs and PR guidance explicitly define when docs-only verification is allowed and when full release gates remain mandatory.                             | docs review + updated template/runbook      | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin/operator product workflow changes.                                                                                                      | explicit scope rationale                    | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public route metadata/indexing behavior changes.                                                                                              | explicit scope rationale                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic/canonical content behavior changes.                                                                                           | explicit scope rationale                    | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: verification artifacts and PR-body evidence remain inspectable enough to diagnose whether docs-only or full gate actually ran.              | artifact review + PR-body output            | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no billing, catalog, entitlement, or checkout path changes.                                                                                      | explicit scope rationale                    | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this slice changes repo verification workflow only; it does not alter production support or on-call runbooks for live user/admin incidents.      | explicit scope rationale                    | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance or reporting workflow changes.                                                                                                        | explicit scope rationale                    | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale model, translation workflow, or multilingual route behavior changes.                                                                   | explicit scope rationale                    | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | The lane uses existing shell/Node/npm patterns and adds no new dependency; scope detection stays repo-native and conservative.                               | dependency diff + code review               | `5/5`                   |
| Testing and QA automation                     | `target`     | Automated coverage protects docs-only scope detection and keeps PR evidence truthful for both `docs-only` and full-gate paths.                               | unit tests + local verification             | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Pure docs-closeout diffs avoid unnecessary build/perf/e2e cost while code PRs still pay the full release gate.                                               | command timing review + behavior review     | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | The new lane is reversible by a narrow script/package/docs rollback, and merge-gate evidence still records the correct lane on current HEAD.                 | script/docs diff + local pre-merge evidence | `5/5`                   |

## Data Placement And Sync Contract

- Server-canonical:
  - GitHub PR state and required CI checks remain canonical for merge readiness.
- Local-only:
  - current branch diff classification,
  - local verify logs/artifacts,
  - latest pre-merge marker metadata.
- Sync policy:
  - docs-only lane is selected from the actual local diff scope at run time,
  - if the diff stops being docs-only, the same commands must fall back to full verification automatically,
  - PR evidence must reflect the lane that actually ran on current HEAD.
- Cache/invalidation:
  - none beyond replacing the latest local artifact symlink/marker with the newest run.

## Identity And Rename Contract

- `N/A`
- Rationale: this slice changes verification workflow and docs contracts, not persisted entity IDs/slugs.

## Scope

- Add a conservative docs-only scope detector for current branch/worktree changes.
- Add a docs-only verification command/lane that validates docs/governance integrity without running build/perf/e2e/runtime gates.
- Make `npm run verify:pre-pr` and `npm run verify:pre-merge` auto-select the docs-only lane when the diff is eligible.
- Keep full verification unchanged for any diff that touches runtime code, scripts, tests, configs, workflows, or non-docs files.
- Record the chosen lane in local artifacts and PR evidence so closeout PRs remain truthful.
- Update repo rules, runbooks, template docs, and PR template/generator guidance accordingly.
- Add targeted tests for docs-only lane classification and evidence behavior.

## Out Of Scope

- Changing app/runtime code paths or public/admin UX behavior.
- Weakening required CI checks for non-docs PRs.
- Broad CI workflow redesign.
- Secret handling, auth, or DB/schema changes.

## Acceptance Criteria

1. `npm run verify:pre-pr` automatically uses a docs-only lane when the current diff contains only allowed docs/governance files.
2. `npm run verify:pre-pr` still runs the existing full public verify path for any code-touching diff.
3. `npm run verify:pre-merge` automatically uses a docs-only lane for eligible diffs and keeps the current full/public + optional private-gate flow for all other diffs.
4. Docs-only verification fails closed if the diff contains any disallowed path.
5. Local verify artifacts and pre-merge markers clearly record whether the lane was `docs-only` or `full`.
6. PR body/test-evidence guidance stays truthful for docs-only runs.
7. Repo docs/rules explicitly state when docs-only verification is allowed and when full gates remain required.
8. Relevant tests plus local `npm run verify:pre-pr` and `npm run verify:pre-merge` pass on this slice.

## Validation

- targeted unit tests for docs-only scope classification/evidence helpers
- `npm run lint:briefs:all`
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local verification runs from repo root.

## Manual QA Environments

- Local terminal only
- QA cases:
  - pure docs/brief closeout diff,
  - mixed docs + code diff,
  - PR body generation after docs-only verify,
  - pre-merge marker content after docs-only verify

## Constraints

- Fail closed: if classification is uncertain, run the full gate.
- Keep the allowed docs-only path set explicit and small.
- Do not remove the ability to force full verification when needed.
- Preserve current required commands so operator muscle memory stays intact.

## 10/10 Quality Bar

- Repo operators should not need a new merge ritual just to close a brief.
- Docs-only auto-selection must be obvious in command output and artifacts.
- False positives are unacceptable:
  - a code-touching diff must never sneak through docs-only verification.
- False negatives are acceptable only as the safer fallback:
  - if classification is uncertain, run full verification.

## Help/Guide Impact

- `N/A` for product/admin Help/Guide because this slice changes repo workflow only.
- Repo operator docs and templates are in scope and must be updated in the same PR.

## Checkpoint Log

- `2026-04-11 | in-progress | opened a dedicated tooling/governance slice after repeated docs-closeout PRs showed that full pre-PR/pre-merge verification is disproportionate for pure docs diffs; direction locked: keep existing command names, auto-select a conservative docs-only lane only for explicit docs/governance file scope, and preserve full gates for everything else | next: finish lane detection/scripts/docs updates, add targeted tests, and validate with full repo gates on this code-touching slice`
- `2026-04-11 | in-progress | full docs-only lane/tooling implementation is in place; added conservative artifact ignoring so local perf/verify outputs do not force false full-lane classification, and hardened two flaky Playwright gates (`admin-contextual-notes`request probe + dryland delete redirect wait) after transient`ECONNRESET`/App Router timing failures during validation | latest evidence: full \`npm run verify:pre-pr\` passed on current worktree | next: commit, run \`npm run verify:pre-merge\`, push, and open/update PR`
