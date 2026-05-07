# Task Brief: Post-Merge Closeout Auto-Merge Governance (10/10)

## Metadata

- `id`: `2026-05-07-post-merge-closeout-auto-merge-governance-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-07`
- `updated`: `2026-05-07`

## Goal

Make repo-managed docs-only post-merge closeout PRs automatic when they are the single expected follow-up for a workstream that the owner already approved for merge.

## Why This Brief Exists

Recent workstreams repeatedly produced a small docs-only closeout PR after the main implementation PR merged. The closeout is not a new product decision; it is the repo-managed lifecycle step that moves/updates briefs and records final evidence.

This slice codifies the narrow rule so agents do not stop for a second merge approval when:

- the owner explicitly approved the main workstream merge,
- `npm run post-merge:preflight` immediately surfaces one repo-managed docs-only closeout for that same workstream,
- the closeout PR passes the normal local and CI gates.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in closeout:

- Product goals and IA
- Reliability and failure handling
- Content governance
- Incident response and support operations
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                 | Evidence                                   | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | The closeout auto-merge rule must be limited to repo-managed docs-only lifecycle follow-ups for the just-merged workstream.                                        | AGENTS/runbook wording review              | `5`                     |
| UX flow clarity                               | `supporting` | Supporting only: the owner workflow should avoid redundant approval prompts, but no product UX flow changes.                                                       | process wording review                     | `4`                     |
| Visual design quality                         | `N/A`        | N/A because this docs-only governance slice changes no UI, layout, screenshots, or visual assets.                                                                  | explicit docs-only rationale               | `N/A`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: the rule must not allow non-docs or ambiguous work to bypass explicit owner merge approval.                                                       | stop-condition wording review              | `4`                     |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor, admin dashboard, or operator mutation workflow is changed.                                                                            | explicit admin-surface rationale           | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: fewer repeated prompts improve process readability; no runtime accessibility surface changes.                                                     | scope rationale                            | `4`                     |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no runtime route, bundle, request, or payload behavior changes.                                                                                        | explicit runtime-scope rationale           | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this slice adds no stateful user data, storage, database writes, browser persistence, or sync behavior.                                                | explicit non-stateful rationale            | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no runtime read/write path or cache behavior changes.                                                                                                  | explicit cache-scope rationale             | `N/A`                   |
| Reliability and failure handling              | `target`     | The rule must state exact stop conditions for ambiguous closeouts, non-docs diffs, gate failures, conflicts, and product/scope decisions.                          | AGENTS/runbook wording review              | `5`                     |
| Security and authz                            | `supporting` | Supporting only: the rule must not weaken branch, CI, or protected-path gates; no authz code changes.                                                              | gate wording review                        | `4`                     |
| Privacy and compliance                        | `supporting` | Supporting only: no private data or secrets are introduced; closeout evidence remains docs-only.                                                                   | diff review                                | `4`                     |
| Content governance                            | `target`     | Canonical agent guidance and PR/chat handoff runbooks must agree on when the auto-merge exception applies.                                                         | AGENTS + runbook diff                      | `5`                     |
| Admin workflow and editability                | `N/A`        | N/A because no admin publishing, editing, triage, or support UI workflow changes.                                                                                  | explicit admin-workflow rationale          | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public routes, metadata, sitemap, robots, or crawlable content changes.                                                                             | explicit public-surface rationale          | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable content, structured data, or entity output changes.                                                                          | explicit AI-discoverability rationale      | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics events, KPI contracts, dashboards, or instrumentation change.                                                                             | explicit analytics-scope rationale         | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no Stripe, checkout, entitlement, pricing, billing, refund, payout, or revenue workflow changes.                                                       | explicit commerce-scope rationale          | `N/A`                   |
| Incident response and support operations      | `target`     | The post-merge runbook must keep recovery clear: sync main, rerun preflight, and stop on any gate or ambiguity.                                                    | runbook wording review                     | `5`                     |
| Finance and reporting operations              | `N/A`        | N/A because this docs-only governance change has no finance, reporting, ledger, payout, refund, reconciliation, or revenue recognition impact.                     | explicit finance-scope rationale           | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: the process wording must remain simple enough for Norwegian/English owner handoffs; no localization system changes.                               | wording review                             | `4`                     |
| Stack-fit and dependency discipline           | `target`     | Reuse existing AGENTS/runbook/post-merge guidance and add no dependency, script, workflow, or custom automation unless required.                                   | docs-only package/workflow diff review     | `5`                     |
| Testing and QA automation                     | `target`     | Changed governance docs and this brief must pass brief lint, docs-only pre-PR validation, CI, and pre-merge validation before merge.                               | `npm run lint:briefs:all`, verify commands | `5`                     |
| Scalability and cost efficiency               | `supporting` | Supporting only: the process should reduce repeated manual approvals without adding new service cost or expensive gates.                                           | process review                             | `4`                     |
| DevOps and rollback readiness                 | `target`     | The rule must preserve merge safety: explicit owner approval for the main workstream, green closeout gates, squash/delete branch, sync/prune, and rerun preflight. | AGENTS/runbook/post-merge runbook review   | `5`                     |

## Stack / Architecture Best-Practice Gate

- Documentation:
  - update the canonical agent guidance in `AGENTS.md`,
  - update the PR/chat handoff runbook where post-merge closeout is already defined,
  - update the post-merge local sync runbook so the operational path matches the agent rule.
- Tooling:
  - do not add new scripts, dependencies, workflows, or runtime automation for this slice,
  - rely on existing `post-merge:preflight`, `verify:pre-pr`, `verify:pre-merge`, PR, CI, and branch cleanup flow.
- Testing:
  - use docs-only validation and brief lint because no runtime code changes.

## Data Placement And Sync Contract

N/A because this docs-only governance slice adds no user-facing state, database records, cache behavior, browser storage, local persistence, or sync logic.

## Identity And Rename Contract

N/A because this slice creates no persisted product entity, route param, slug, operator-visible identifier, or renameable domain object.

## Scope

- `AGENTS.md` post-merge handoff and merge gate guidance.
- `docs/runbooks/pr-flow-and-chat-handoff.md` closeout auto-merge sequence and stop conditions.
- `docs/runbooks/post-merge-local-sync.md` operational closeout follow-up rule.
- This active task brief.

## Out Of Scope

- Runtime product code.
- GitHub Actions or branch protection changes.
- New scripts or dependencies.
- General auto-merge for feature, bugfix, non-docs, ambiguous, or owner-decision PRs.
- Skipping local or CI gates.

## Acceptance Criteria

1. The rule says the main workstream merge approval carries through to exactly one repo-managed docs-only closeout surfaced immediately by `npm run post-merge:preflight`.
2. The rule requires docs-only diff confirmation, green CI, and `npm run verify:pre-merge` before auto-merge.
3. The rule explicitly stops for ambiguous closeouts, unrelated workstreams, non-docs files, conflicts, failing gates, credentials, visual approval, or product/scope decisions.
4. The post-closeout sequence requires syncing `main`, pruning refs, rerunning `npm run post-merge:preflight`, and then making the chat-handoff assessment.
5. Changed docs and briefs pass docs-only validation.

## Validation

- `npm run lint:briefs:all`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Route/Label/Support-Surface Impact Sweep Evidence

- Runbook: `docs/runbooks/route-label-support-surface-impact-sweep.md`.
- Identifiers searched: `post-merge`, `closeout`, `merge approval`, `Do not merge`, `repo-managed`, `Chat:`.
- Surfaces checked: `AGENTS.md`, `docs/runbooks/`, and `docs/task-briefs/`.
- Fallout handled in this PR: canonical agent merge/handoff guidance, PR/chat handoff runbook, post-merge local sync runbook, and this active brief.
- Intentional leftovers: no product Help/Guide update because this changes internal repo operating procedure only, not admin/user workflow labels, actions, recovery behavior, or customer-facing support content.

## Local Tooling Prerequisite

- Node.js and npm from the repo runtime are available locally.
- This is a docs-only governance change; no browser or screenshot handoff is required.

## Checkpoint Log

- `2026-05-07 | in-progress | owner asked to systematize automatic post-merge cleanup PR handling after PR #630; created docs-only governance branch and codified the narrow auto-merge exception in AGENTS and runbooks | next: run brief lint and docs-only pre-PR validation`
- `2026-05-07 | validation | npm run lint:briefs:all PASS; npm run verify:pre-pr PASS docs-only with artifact log artifacts/test-runs/20260507-075156/verify.log | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge recommendation`
