# Task Brief: Tooling Friction Hardening Pre-Live (10/10)

## Metadata

- `id`: `2026-04-18-tooling-friction-hardening-pre-live-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-18`
- `updated`: `2026-04-18`

## Goal

Remove avoidable repo-tooling friction and false stops from the engineering flow without weakening any governance, validation, or merge-quality gates.

## Why This Brief Exists

- The repo already has strong governance around PR body structure, verify gates, and merge readiness.
- A recent real-world example showed repeated stops caused by tooling brittleness rather than product issues:
  - PR-body lint matched explanatory text instead of the actual evidence line,
  - reruns were needed even though the code diff itself was already green,
  - path/bootstrap inconsistencies around `gh`/`npm` created needless manual intervention.
- Before live, the engineering path should be boring:
  - create/update PR,
  - refresh generated body,
  - run verify,
  - watch checks,
  - merge when green.
- This brief is not about reducing quality. It is about making the quality gates deterministic.

## Current State Snapshot

- Already in place:
  - generated PR-body tooling,
  - PR-body linting,
  - `verify:pre-pr` and `verify:pre-merge`,
  - merge preflight scripts,
  - `gh` CLI resolver logic in repo scripts.
- Current friction observed:
  - PR-body lint can false-match explanatory lines that mention `verify:pre-merge`,
  - the canonical generated-body flow is not yet guaranteed as the default path everywhere,
  - common command paths can still diverge around `gh` resolution or local Node bootstrap if the wrong entrypoint is used,
  - error messages can be narrower and more actionable,
  - long workstreams do not yet have one canonical “start a new chat now” rule plus a ready-made carry-forward prompt, which creates avoidable continuity friction.

## Recommended Execution Order

Implement this brief in narrow PRs:

1. `PR-body governance parser hardening`
   - exact-match evidence parsing,
   - clear failure output,
   - tests for the false-positive case already seen.
2. `Generated-body default flow`
   - ensure create/update/refresh paths converge on the canonical generator.
3. `CLI/bootstrap consistency`
   - standardize `gh` resolution and local Node/bootstrap paths through existing repo-native wrappers.
4. `Session continuity and handoff protocol`
   - define when a new chat should be recommended,
   - provide one ready-to-paste carry-forward prompt template,
   - keep the mechanism narrow and practical rather than turning `AGENTS.md` into a giant catch-all.
5. `Operator docs and regression tests`
   - document the one true path,
   - add regression coverage for future governance-rule edits.

## Must Now

- Fix the known PR-body false-positive class.
- Ensure canonical PR-body generation is the default path for create/update/refresh.
- Ensure standard repo workflows resolve `gh` and local Node/npm consistently without guesswork.
- Improve tooling error messages so the next failure points to the exact missing line or wrong format.
- Define one canonical new-chat/handoff rule for long workstreams, including a ready-to-paste resume prompt.

## Before Live

- Add regression tests that lock the known failure cases.
- Document the standard operator flow in one short runbook path.
- Ensure merge-preflight/governance scripts stay aligned when future rules change.
- Capture the continuity/handoff rule in repo guidance so it does not depend on memory.

## Ongoing Cadence

- Whenever PR-body rules change:
  - update generator and linter in the same PR,
  - update tests in the same PR.
- Whenever a recurring repo-tooling stop appears twice:
  - either automate it,
  - or document one canonical deterministic path.
- Whenever a workstream hits a natural checkpoint:
  - merge-ready checkpoint,
  - major scope pivot,
  - or unusually long mixed-scope chat,
  - prefer a documented new-chat handoff with the canonical carry-forward prompt instead of letting context drift grow.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this brief:

- `UX flow clarity`
- `Reliability and failure handling`
- `Content governance`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                                                              | Evidence                                            | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | One canonical PR/update/merge/handoff tooling path is documented, and standard repo commands route through deterministic entrypoints.                                                                       | runbook + script review + implementation PRs        | `5/5`                   |
| UX flow clarity                               | `target`     | Normal PR body / verify / merge flow should complete without manual PR-body patching or tool-path guesswork when standard scripts are used, and long workstreams should have a clear new-chat handoff rule. | runbook + dry-run evidence + user acceptance        | `5/5`                   |
| Visual design quality                         | `N/A`        | N/A because this brief targets repo tooling/governance flow, not user-facing visuals.                                                                                                                       | explicit scope rationale                            | `N/A`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: tooling parsers/generators must interpret evidence deterministically and not misread unrelated text.                                                                                       | parser tests + code review                          | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this brief does not change admin product editing flows; it improves repo/operator tooling flow.                                                                                                 | explicit scope rationale                            | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no runtime UI semantics or accessibility contracts are changed.                                                                                                                                 | explicit scope rationale                            | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because this brief does not change runtime bundle or route performance behavior.                                                                                                                        | explicit scope rationale                            | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this brief does not introduce stateful runtime data or client/server sync behavior.                                                                                                             | explicit scope rationale                            | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no runtime caching strategy changes are introduced.                                                                                                                                             | explicit scope rationale                            | `N/A`                   |
| Reliability and failure handling              | `target`     | Known false-stop classes are eliminated, and common tooling failures report the exact missing requirement instead of requiring guesswork reruns.                                                            | tests + runbook + dry-run evidence                  | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: tooling hardening must preserve current governance/security gates and must not weaken required checks.                                                                                     | diff review + unchanged required checks             | `4/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because this brief does not add new data collection or privacy-sensitive product behavior.                                                                                                              | explicit scope rationale                            | `N/A`                   |
| Content governance                            | `target`     | PR-body rules and generated evidence come from one canonical source of truth, with no contradictory manual variants.                                                                                        | generator/linter alignment + docs                   | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD/status workflow is changed by this tooling brief.                                                                                                                                 | explicit scope rationale                            | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this brief does not change route metadata, sitemap, robots, or public crawl behavior.                                                                                                           | explicit scope rationale                            | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because public semantic structure and discoverability are unaffected by repo-tooling changes.                                                                                                           | explicit scope rationale                            | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this brief does not create product event instrumentation; success is measured through deterministic operator flow and test coverage.                                                            | explicit scope rationale                            | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this brief does not alter pricing, checkout, entitlements, or revenue operations.                                                                                                               | explicit scope rationale                            | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: tooling errors should be actionable enough that maintainers can unblock themselves quickly during release work.                                                                            | error-message review + operator docs                | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance/reporting workflow is changed by PR/governance tooling hardening.                                                                                                                    | explicit scope rationale tied to tooling-only scope | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this brief does not affect locale routing, translated content, or metadata models.                                                                                                              | explicit scope rationale tied to current scope      | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | The solution uses existing repo-native scripts/resolvers/wrappers first and does not add unnecessary external tooling.                                                                                      | implementation diff + dependency review             | `5/5`                   |
| Testing and QA automation                     | `target`     | PR-body parsing/generation and wrapper behavior gain regression coverage for the known failure modes and future rule changes.                                                                               | unit/script tests + verify evidence                 | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: deterministic tooling should reduce unnecessary reruns and wasted CI/operator time.                                                                                                        | workflow review + before/after examples             | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Tooling hardening changes remain isolated and easily reversible without weakening branch protection or merge gates.                                                                                         | PR slicing plan + rollback notes                    | `5/5`                   |

## Data Placement And Sync Contract

- `N/A` because this brief does not introduce application state, persistence, or client/server sync boundaries.
- Execution guardrail:
  - repo-tooling markers, generated bodies, and local verify evidence should be treated as operational artifacts, not as canonical business data.

## Identity And Rename Contract

- `N/A` for product entities because this brief does not alter persisted user/admin IDs, slugs, or routes.
- Operational identifier guardrail:
  - PR-body command labels and verify evidence names should have one canonical format,
  - if renamed, generator, linter, docs, and tests must change together in one slice.

## Scope

- PR-body linting robustness:
  - exact evidence-line parsing for `npm run verify:pre-pr` and `npm run verify:pre-merge`,
  - no false-matching of explanatory text that merely mentions those commands.
- Generated PR-body default flow for create/update/refresh:
  - including docs-only PRs,
  - including correct HEAD-SHA evidence for pre-merge.
- `gh` CLI resolution consistency through repo-native wrappers:
  - including `/opt/homebrew/bin/gh` fallback behavior when `gh` is not in PATH.
- Local Node/npm bootstrap consistency for standard repo scripts where needed.
- Better error messages and regression tests for governance/tooling failures.
- Session continuity / new-chat handoff protocol:
  - recommend a new chat at natural checkpoints,
  - produce one ready-to-paste carry-forward prompt,
  - prefer a narrow runbook/template or similar repo guidance over broad accidental policy sprawl,
  - use `AGENTS.md` changes only if a narrow repo-wide default is clearly the best mechanism.

## Out Of Scope

- Weakening any required checks or governance rules.
- General product dependency hygiene.
- Secrets/config governance.
- Backup/restore and operational alerting design.
- User-facing runtime feature work.

## Acceptance Criteria

1. The known PR-body false-positive class is covered by tests and no longer reproduces.
2. Standard PR create/update/refresh path uses the canonical generated-body flow.
3. Standard repo workflows resolve `gh` and local Node/bootstrap consistently through repo-native entrypoints.
4. Tooling failures point to exact missing evidence/format instead of generic guesswork.
5. Quality gates remain unchanged or stronger after the hardening.
6. The repo has one canonical new-chat/handoff rule with a ready-to-paste carry-forward prompt template for long workstreams.

## Validation

- For the brief-only planning diff:
  - `npm run lint:briefs`
  - `npm run lint:briefs:all`
- For child implementation PRs created from this brief:
  - targeted unit/script tests for parsers/generators/wrappers
  - relevant `npm run lint`
  - `npm run typecheck`
  - `npm run verify:pre-pr`
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm installed locally.
- `gh` CLI available through PATH or the repo resolver path.
- Operator guidance should assume repo-native entrypoints first, not raw ad hoc commands.

## Manual QA Environments

- Child slices should include a dry-run of the standard PR flow:
  - create/update PR body,
  - watch checks,
  - verify merge readiness.
- Child slices for the handoff part should also dry-run:
  - recommended chat-break moment,
  - produced carry-forward prompt,
  - resume from that prompt without losing active brief/path/next-step context.
- The planning brief itself has no runtime browser QA requirement.

## Constraints

- Do not reduce governance strictness.
- Do not add broad new tooling unless existing repo-native scripts cannot solve the problem.
- Keep fixes surgical and test-backed.
- Prefer deterministic parsing/generation over looser heuristics.

## 10/10 Quality Bar

- The standard path should feel obvious.
- The failure path should feel precise.
- The repo should stop blocking on preventable wording/path mismatches.
- Tooling changes should reduce friction without creating hidden side channels around quality gates.
- Long work should have a clean baton-pass point instead of “stay in the same chat until context gets messy.”

## 10/10 Cross-Cut Categories

- Content governance and source-of-truth
  - one canonical generator/linter pair owns PR-body truth.
- Identity and rename safety
  - operational command/evidence labels stay canonical and change in one place.
- Taxonomy and category management
  - failure classes should be categorized precisely: missing evidence, wrong SHA, wrong format, wrong command.
- Workflow and publishing safety
  - merge governance remains strict and explicit.
- Business logic correctness and data integrity
  - parser behavior must be deterministic and test-backed.
- RBAC and auditability
  - no bypass of branch protection or review evidence.
- UX/UI quality contract
  - internal operator UX should minimize guesswork and dead ends.
- Admin editor ergonomics
  - `N/A`; no admin surface redesign in scope.
- Performance contract
  - `N/A`; no runtime performance work in scope.
- Data placement and sync boundaries
  - `N/A`; no app-state changes in scope.
- Caching and invalidation strategy
  - `N/A`; no runtime cache changes in scope.
- Testing contract
  - parser/generator/wrapper regressions must be locked with tests.
- Observability and KPI tracking
  - operational success is evidenced by deterministic dry-runs and fewer false stops, not product analytics events.
- Incident response and support operations
  - better errors speed local unblock during release work.
- Finance and reporting operations
  - `N/A`; no finance scope.
- i18n operational readiness
  - `N/A`; no locale scope.
- Stack-fit and dependency discipline
  - use existing repo-native tooling before adding new layers.
- Scalability and cost efficiency
  - fewer redundant reruns and less manual patching.
- Migration and rollback readiness
  - each tooling change remains isolated and reversible.
- Definition of done quant targets
  - known false-positive path removed, canonical PR flow documented, targeted regression tests added, and canonical new-chat handoff prompt documented.
- Help/Guide and operator training documentation
  - update runbooks if standard PR/governance flow changes.

## Help/Guide Impact

- Update required:
  - `README.md`
  - `docs/runbooks/local-verify-and-test-artifacts.md`
  - `docs/runbooks/pr-flow-and-chat-handoff.md`
- Rationale:
  - this slice changes the canonical operator path for PR body sync, merge handoff, and long-workstream continuity.

## Session Continuity And Recovery

- Canonical recovery order:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint
- For long workstreams, use `docs/runbooks/pr-flow-and-chat-handoff.md` as the canonical new-chat rule and carry-forward prompt source.

## Checkpoint Log

- `2026-04-18 | implementation start | moved the brief from planned to in-progress on branch \`feat/tooling-friction-hardening-2026-04-18\` and started a narrow hardening pass across PR-body parsing, PR-create defaults, Node/bootstrap consistency, and operator handoff guidance | next: land the script/docs/test changes, run targeted validation, then complete full verify gates before PR handoff`
- `2026-04-18 | ci portability follow-up | fixed the remaining Linux portability stop in \`scripts/pr-create-safari.sh\` by switching the generated PR-body temp file to a GNU/BSD-compatible \`mktemp\` template after PR #460 failed in \`tests/unit/gh-cli-resolution.test.ts\`; reran targeted CI-mode unit coverage and a full local \`npm run verify:pre-pr\` successfully on the working tree | next: commit the follow-up, rerun \`npm run verify:pre-merge\` on the new HEAD, then refresh PR #460 and re-check CI`
- `2026-04-18 | pr-body refresh-race follow-up | after commit \`6087035\`, CI \`verify\` failed on PR-body SHA evidence even though the live PR body already validated locally; confirmed the failure was a push-versus-PR-edit timing race, then added a narrow retry path in \`scripts/lint-pr-body-sections.mjs\` plus regression coverage for retryable vs non-retryable validation errors | next: commit this hardening slice, rerun \`npm run verify:pre-pr\`, push PR #460, then rerun local \`npm run verify:pre-merge\` before final readiness summary`
- `2026-04-18 | gh-cli harness follow-up | after commit \`155148e\`, CI moved past PR-body lint but failed Linux unit coverage in \`tests/unit/gh-cli-resolution.test.ts\`; narrowed the remaining stop to two script assumptions: \`pr-create-safari.sh\` generated PR-body files even for existing PRs with \`--no-refresh-body\`, and \`require_node_runtime\` still treated missing \`npm\` as a reason to mutate PATH via \`nvm\`, which masked test-harness behavior locally | next: commit this CI-hardening follow-up, rerun \`npm run verify:pre-pr\`, push PR #460, then re-check required CI before closeout`
