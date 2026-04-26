# Task Brief: Maintenance Baseline Pre-Live (10/10)

## Metadata

- `id`: `2026-04-18-maintenance-baseline-pre-live-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-18`
- `updated`: `2026-04-26`

## Goal

Bring the repo and runtime maintenance baseline to a pre-live 10/10 level: no known high/critical production dependency findings, explicit runtime pinning, and a durable maintenance cadence that prevents drift from quietly returning.

## Sequencing Lock

- Do not start this brief until the current pre-maintenance findings wave is either `done` or explicitly `deferred`.
- Findings-wave briefs completed before this baseline:
  - [2026-04-20-swim-session-builder-library-default-entry-action-density-and-workspace-nav-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-20-swim-session-builder-library-default-entry-action-density-and-workspace-nav-10-10.md)
  - [2026-04-20-poolside-note-mobile-preview-and-save-image-reliability-followup-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-20-poolside-note-mobile-preview-and-save-image-reliability-followup-10-10.md)
  - [2026-04-21-poolside-note-session-and-step-notes-display-options-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-21-poolside-note-session-and-step-notes-display-options-10-10.md)
  - [2026-04-21-poolside-note-save-image-crop-boundary-followup-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-21-poolside-note-save-image-crop-boundary-followup-10-10.md)
  - [2026-04-21-my-swim-profile-page-ia-and-copy-cleanup-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-21-my-swim-profile-page-ia-and-copy-cleanup-10-10.md)
  - [2026-04-21-account-security-simplification-and-auth-surface-audit-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-21-account-security-simplification-and-auth-surface-audit-10-10.md)
  - [2026-04-21-course-dashboard-new-content-and-continue-card-cleanup-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-21-course-dashboard-new-content-and-continue-card-cleanup-10-10.md)
  - [2026-04-21-my-library-my-training-ia-and-builder-entrypoint-reconcile-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-21-my-library-my-training-ia-and-builder-entrypoint-reconcile-10-10.md)
  - [2026-04-21-stripe-sandbox-invoice-history-and-billing-portal-verification-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-21-stripe-sandbox-invoice-history-and-billing-portal-verification-10-10.md)
- Remaining findings-wave briefs that currently take precedence:
  - none; maintenance baseline is complete after this docs-only closeout merges.

## Why This Brief Exists

- The repo already has strong validation gates, weekly Dependabot, CodeQL, and nightly browser coverage, but the maintenance baseline is not yet fully locked.
- A live dependency check on `2026-04-18` showed a current `next` high-severity audit finding that should be handled before launch work continues.
- The repo does not yet declare one explicit local runtime contract through `.nvmrc`, `package.json` `engines`, and `packageManager`.
- Maintenance cadence exists informally through CI and owner habit, but not yet as one canonical, reviewable repo contract.
- This should be fixed before launch pressure rises; it is much cheaper now than after production traffic exists.

## Current State Snapshot

- Already in place:
  - weekly Dependabot updates for `npm` and GitHub Actions,
  - CodeQL on PR/push plus weekly schedule,
  - `verify:pre-pr` and `verify:pre-merge`,
  - nightly E2E and performance jobs.
- Current maintenance gaps observed on `2026-04-18`:
  - `npm audit --omit=dev --audit-level=high` reports one high-severity `next` advisory window affecting the current pinned version,
  - runtime pinning is implicit in CI (`node-version: 20`) but not explicit in repo-root developer tooling files,
  - there is no canonical monthly maintenance issue/runbook flow that turns “remember to do hygiene” into a stable operating rhythm.
- Carry-forward perf-budget decisions from product PRs:
  - PR #496 first recorded the recommendation that `npm run test:perf:budgets` should tighten one stretch target after two consecutive weekly green runs,
  - PR #507 reconfirmed that recommendation on `2026-04-24` with `35.6%` worst margin (`artifacts/test-runs/20260424-094822/verify.log`),
  - PR #509 carried the same recommendation forward while keeping the `My Swim Profile` IA/copy slice narrow,
  - PR #512 reconfirmed that recommendation on `2026-04-25` with `35.6%` worst margin (`artifacts/test-runs/20260425-152253/verify.log`),
  - PR #517 reconfirmed that recommendation on `2026-04-26` with `35.6%` worst margin (`artifacts/test-runs/20260426-090528/verify.log`),
  - PR #521 reconfirmed that recommendation on `2026-04-26` with `32.2%` worst margin after the runtime pinning slice,
  - these product slices intentionally deferred the ratchet decision out of feature work,
  - this maintenance cadence slice resolves the ratchet with `tighten`: default JS transfer budget moves from `450kb` to `425kb`.
- Carry-forward Stripe sandbox verification:
  - PR #517 fixed invoice creation for future one-time Checkout purchases,
  - older sandbox payment-mode purchases do not retroactively gain invoices,
  - a fresh sandbox purchase after `bd3a9e5` remains a billing-confidence follow-up before live billing is claimed, not a blocker for this maintenance cadence PR.

## Recommended Execution Order

This brief should be implemented as small safe PRs, in this order:

1. `Security baseline dependency refresh`
   - remediate the current `next` high-severity finding,
   - align paired stack versions such as `eslint-config-next`,
   - rerun full validation.
2. `Runtime pinning baseline`
   - add `.nvmrc`,
   - add `engines.node`,
   - add `packageManager`,
   - align docs/scripts with that single contract.
3. `Maintenance cadence automation`
   - add one canonical maintenance runbook/checklist,
   - add a lightweight monthly recurring GitHub maintenance issue or equivalent repo-native reminder path,
   - define how patch/minor vs major dependency work is triaged.

Do not batch all three into one PR unless validation shows the diff is still easy to reason about.

## Completed Slice: Security Baseline Dependency Refresh

- Scope:
  - remediate current `next` high/critical production audit findings,
  - align paired framework packages such as `eslint-config-next`,
  - keep runtime pinning, cadence automation, Stripe sandbox re-test, and perf-budget ratchet decision as later slices unless needed to complete this security refresh safely.
- Validation target:
  - `npm audit --omit=dev --audit-level=high` returns zero high/critical production findings,
  - targeted dependency/build gates pass before full pre-PR verification.
- Implementation notes:
  - `npm audit --omit=dev --audit-level=high` on `2026-04-26` confirmed the production blocker was `next@16.1.6` with one high-severity advisory group.
  - Updated `next` and `eslint-config-next` from `16.1.6` to `16.2.4`, the current npm `latest` for both packages at execution time.
  - Left `react` and `react-dom` at `19.2.3`; their `19.2.5` patch is visible in `npm outdated` but not required to clear the production audit blocker.
  - `npm audit --omit=dev --audit-level=high` now exits cleanly for high/critical production findings; npm still reports a moderate transitive `postcss` advisory under Next, which is outside this slice's high/critical gate.
  - Next `16.2.4` surfaced a Turbopack NFT warning for dynamic guide PDF asset reads; the PDF routes now mark the existing `process.cwd()` join with `turbopackIgnore` so build tracing remains scoped without changing runtime behavior.
  - `verify:pre-pr` exposed local perf-budget TBT flakes after the framework refresh; the perf-budget runner now uses a fresh Playwright page per route sample so renderer long tasks from one route/sample cannot leak into the next route's median.
  - PR `#519` merged as `e5a64dd` on `2026-04-26`; local `main` was clean after post-merge sync.

## Completed Slice: Runtime Pinning Baseline

- Scope:
  - declare the local Node runtime through repo-root `.nvmrc`,
  - declare the package manager and Node engine in `package.json`,
  - update GitHub Actions setup-node jobs to read the same `.nvmrc` file instead of duplicating hardcoded runtime values,
  - keep maintenance cadence automation, perf-budget ratchet decision, and additional dependency hygiene as later slices.
- Runtime contract:
  - `.nvmrc`: `20`
  - `package.json` `engines.node`: `>=20.17.0 <21`
  - `package.json` `packageManager`: `npm@10.8.2`
- Validation target:
  - changed workflow YAML resolves Node through `node-version-file: .nvmrc`,
  - package metadata and lockfile stay aligned,
  - full PR validation remains green after the CI/runtime contract moves from implicit workflow literals to repo-owned files.
- Implementation notes:
  - Local shell initially resolved Node `v24.13.0`; `nvm install 20` resolved the pinned line to Node `v20.20.2` with npm `10.8.2`, so `packageManager` records that bundled npm version.
  - No runtime app code, route behavior, dependency versions, secrets, or UI surfaces are changed in this slice.
  - PR `#521` merged as `7a9746a` on `2026-04-26`; local `main` was clean after post-merge sync and branch cleanup.

## Completed Slice: Maintenance Cadence Automation

- Scope:
  - add one canonical maintenance cadence runbook,
  - add one monthly maintenance checklist,
  - add a repo-native monthly GitHub issue reminder workflow,
  - add a manual issue template fallback for the same monthly pass,
  - resolve the carried-forward perf-budget recommendation by tightening one threshold step,
  - keep major dependency migrations and fresh Stripe sandbox purchase verification as separate follow-up work.
- Cadence contract:
  - weekly: review Dependabot PRs, security alerts, CodeQL, and nightly/admin E2E health,
  - monthly: complete the auto-created maintenance issue using the repo checklist,
  - quarterly: review deferred major upgrades and decide whether to open fresh planned briefs.
- Perf ratchet decision:
  - decision: `tighten`,
  - metric: JS transfer default budget,
  - change: `450kb` -> `425kb`,
  - rationale: multiple consecutive green weekly runs with the latest worst margin still above the tighten threshold; recent measured JS transfer remained about `305kb`.
- Validation target:
  - runbook/checklist/template/workflow are internally linked,
  - workflow creates at most one open monthly issue per `YYYY-MM`,
  - perf budget remains green after the JS transfer threshold ratchet,
  - full PR validation remains green because this slice touches workflow and runtime script files.
- Implementation notes:
  - Added `docs/runbooks/maintenance-cadence.md` as the canonical weekly/monthly/quarterly maintenance runbook.
  - Added `docs/checklists/monthly-maintenance-pass.md` and `.github/ISSUE_TEMPLATE/monthly-maintenance-pass.yml` for the manual monthly fallback.
  - Added `.github/workflows/monthly-maintenance-reminder.yml` to create one open `Monthly maintenance pass - YYYY-MM` issue per month.
  - Tightened the default JS transfer budget from `450kb` to `425kb`; `npm run test:perf:budgets` stayed green with latest route medians around `305kb` and worst margin `28.2%`.
  - PR `#522` merged as `a7ec25d` on `2026-04-26`; local `main` was clean after post-merge sync and branch cleanup.

## Must Now

- Remove all known `high` or `critical` production dependency findings on current `main`.
- Lock the runtime contract explicitly in repo files, not only in CI workflow YAML.
- Define the maintenance cadence that should happen weekly, monthly, and quarterly.
- Resolve the carried-forward perf-budget stretch-target recommendation from PRs #496, #507, #509, #512, #517, and #521 with a documented `tighten` / `hold` / `revert` decision.
- Keep major migrations explicitly deferred into separate planned briefs or backlog items.

## Before Live

- Complete at least one post-baseline patch/minor dependency hygiene pass on top of the new runtime contract.
- Confirm the maintenance cadence artifacts are actually used once, not just written down.
- Verify that the updated baseline does not regress core routes, private gate behavior, admin smoke paths, or release gates.

## Ongoing Cadence

- Weekly:
  - review Dependabot PRs and security alerts,
  - merge low-risk patch/minor updates when gates are green.
- Monthly:
  - run one maintenance pass issue/checklist and record outcomes.
- Quarterly:
  - review deferred major upgrades,
  - decide tighten/hold/revert against the platform ratchet policy.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this brief:

- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Security and authz`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                   | Evidence                                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | One canonical maintenance baseline exists with ordered PR slices, owner rhythm, and a clear “must now / before live / ongoing” split.                            | brief review + merged child briefs + maintenance doc    | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: maintainer workflow should be easy to follow without guesswork or ad hoc sequencing.                                                            | runbook + PR sequence review                            | `4/5`                   |
| Visual design quality                         | `supporting` | Supporting only: dependency updates must not introduce visible regressions on `/`, `/course`, `/my-library`, or gate/contact flows.                              | manual QA + screenshot review in child PRs              | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Covered core routes and protected flows keep the same contract after maintenance updates, with no unexpected `500` or invariant drift.                           | unit/e2e coverage + diff review + runtime checks        | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin-critical surfaces continue to pass smoke paths after dependency and runtime pinning changes.                                              | admin smoke validation + targeted QA                    | `4/5`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: no new serious/critical accessibility regressions are introduced by framework/tooling refreshes.                                                | existing a11y checks + targeted Playwright/axe coverage | `4/5`                   |
| Performance (CWV + payloads)                  | `target`     | `npm run test:perf:budgets` stays green and core routes do not regress beyond current route-level budgets on `/`, `/course`, `/my-library`.                      | perf budget report + build output + route QA            | `5/5`                   |
| Data placement and sync boundaries            | `supporting` | Supporting only: maintenance work must not silently change local-vs-server ownership or persistence behavior.                                                    | scope review + child brief notes                        | `4/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: maintenance work must not alter cache mode/invalidation without explicit note in the child PR scope.                                            | route diff review + QA                                  | `4/5`                   |
| Reliability and failure handling              | `target`     | `npm audit --omit=dev --audit-level=high` returns zero `high`/`critical` production findings and full verify gates remain green after each slice.                | audit output + `verify:pre-pr` + `verify:pre-merge`     | `5/5`                   |
| Security and authz                            | `target`     | Production dependency posture contains zero open `high`/`critical` advisories on `main`, and no security-negative-path coverage is weakened.                     | audit output + security test subset + CI                | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because this brief does not add new data collection, retention, consent, or disclosure behavior; it is runtime/tooling hygiene only.                         | explicit scope rationale                                | `N/A`                   |
| Content governance                            | `target`     | One canonical maintenance runbook/checklist exists, and all recurring maintenance actions point back to it instead of ad hoc memory.                             | runbook + recurring issue/workflow + brief review       | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: maintenance updates must preserve current admin CRUD/status workflows and feedback states.                                                      | admin smoke QA + regression review                      | `4/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: framework/dependency updates must not break sitemap, metadata, canonicals, or robots behavior.                                                  | existing sitemap/SEO tests + route QA                   | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: public route semantic structure and canonical route behavior must remain stable after framework maintenance.                                    | route QA + metadata review                              | `4/5`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this brief does not change product analytics/event taxonomy; maintenance cadence is operational, not user-event instrumentation.                     | explicit scope rationale                                | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this brief does not change pricing, checkout, entitlements, or revenue operations; commerce migrations remain separate work.                         | explicit scope rationale                                | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because full incident/runbook ownership is handled in the separate pre-live ops readiness brief; this brief only restores maintenance baseline hygiene.      | explicit scope rationale tied to brief split            | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no reconciliation, reporting, payouts, or finance-affecting logic is changed by this maintenance baseline brief.                                     | explicit scope rationale tied to maintenance-only scope | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this brief does not alter locale routing, content model translation needs, or metadata structures for future i18n.                                   | explicit scope rationale tied to current scope          | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Repo declares one explicit runtime/tooling contract (`.nvmrc`, `engines.node`, `packageManager`) and avoids any unnecessary new dependency in the baseline pass. | repo diff + config review + validation docs             | `5/5`                   |
| Testing and QA automation                     | `target`     | Every child PR passes relevant local validation plus `verify:pre-pr`; final merge-ready tree passes `verify:pre-merge`.                                          | command logs + CI green                                 | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: maintenance cadence should reduce future firefighting without creating noisy over-batched PRs or wasteful CI churn.                             | cadence design review + PR slicing                      | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Each maintenance slice has a one-PR rollback path, and the recurring cadence is documented so future regressions can be isolated and reverted cleanly.           | PR plan + runbook + release notes                       | `5/5`                   |

## Data Placement And Sync Contract

- `N/A` for new feature design because this brief does not introduce stateful product entities.
- Guardrail for execution:
  - maintenance changes must not silently move server-canonical data into local-only storage,
  - maintenance changes must not change sync or persistence behavior unless a child slice documents that explicitly.

## Identity And Rename Contract

- `N/A` because this brief does not create or rename persisted product entities, slugs, route params, or operator-visible canonical identifiers.
- Guardrail for execution:
  - if a dependency/framework refresh reveals route identifier behavior changes, that must become explicit child-slice scope rather than sneaking through as maintenance noise.

## Scope

- Production dependency maintenance needed to remove currently observed high-severity audit findings.
- Runtime/tooling pinning:
  - `.nvmrc`
  - `engines.node`
  - `packageManager`
- Maintenance cadence artifacts:
  - one canonical runbook/checklist,
  - one lightweight recurring maintenance reminder mechanism.
- Clear separation between:
  - safe patch/minor hygiene,
  - deferred major migrations.

## Out Of Scope

- Tailwind `3 -> 4`
- TypeScript `5 -> 6`
- ESLint `9 -> 10`
- Stripe major upgrade
- Broad UI redesign
- Secrets inventory/rotation policy
- PR-body/governance automation hardening
- Backup/restore, alerting, or release operations

## Acceptance Criteria

1. `main` has zero open `high`/`critical` production dependency findings from `npm audit --omit=dev --audit-level=high`.
2. Repo runtime contract is explicit and aligned across local and CI.
3. One canonical maintenance runbook/checklist exists and defines weekly, monthly, and quarterly cadence.
4. Major dependency migrations remain explicitly deferred into separate planned work, not silently bundled into the baseline pass.
5. All baseline child PRs are narrow enough that root cause remains debuggable.
6. The carried-forward perf-budget stretch-target recommendation from PRs `#496`, `#507`, `#509`, `#512`, `#517`, and `#521` is reviewed against current trend evidence, and the baseline PR records `tighten`, `hold`, or `revert` with rationale.
7. A fresh post-`bd3a9e5` Stripe sandbox purchase confirms invoice visibility, or the baseline records why that verification is deferred before live billing confidence is claimed.

## Validation

- For the brief-only planning diff:
  - `npm run lint:briefs`
  - `npm run lint:briefs:all`
- For child implementation PRs created from this brief:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test:unit`
  - `npm run build`
  - `npm run test:perf:budgets`
  - relevant `npm run test:e2e*` subsets for touched surfaces
  - `npm audit --omit=dev --audit-level=high`
  - `npm run verify:pre-pr`
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine running validation.
- The repo should declare that contract explicitly as part of this brief.
- Before implementation PR handoff:
  - install dependencies with the pinned package manager/runtime,
  - run the required verify gates on the same pinned runtime.

## Manual QA Environments

- Child maintenance PRs that touch runtime/framework behavior should include manual QA on:
  - local dev/build output,
  - Vercel preview,
  - at least mobile + desktop for touched routes.
- The planning brief itself has no runtime QA requirement.

## Closeout Summary

- Shipped as three narrow maintenance child PRs:
  - PR #519 `maintenance: refresh next security baseline`, merged as `e5a64dd`,
  - PR #521 `maintenance: pin node runtime baseline`, merged as `7a9746a`,
  - PR #522 `maintenance: automate cadence baseline`, merged as `a7ec25d`.
- Scope completed:
  - production `high`/`critical` audit blocker from the previous Next baseline was remediated,
  - runtime ownership is explicit through `.nvmrc`, `package.json` `engines.node`, `packageManager`, and GitHub Actions `node-version-file: .nvmrc`,
  - recurring maintenance is documented through one runbook, one monthly checklist, one issue template, and one monthly reminder workflow,
  - the carried-forward perf-budget recommendation was resolved with `tighten`: JS transfer default `450kb` -> `425kb`,
  - major dependency migrations remain explicitly deferred to planned/backlog work instead of being bundled into baseline maintenance.
- Known carry-forward: a fresh Stripe sandbox purchase after `bd3a9e5` must still confirm invoice visibility before live billing confidence is claimed.
- No screenshot handoff was required for this closeout because it only moves and updates the task brief lifecycle document.

## Closeout Validation

- Current closeout audit: `npm audit --omit=dev --audit-level=high` exits cleanly for high/critical production findings; npm still reports the known moderate transitive `postcss` advisory under Next.
- PR #519: merged after security baseline validation cleared the production high/critical audit blocker and required release gates.
- PR #521: merged after runtime pinning validation on Node `v20.20.2` / npm `10.8.2`, local `verify:pre-pr`, local `verify:pre-merge`, and green CI.
- PR #522: `npm run verify:pre-pr` PASS on full lane (`artifacts/test-runs/20260426-180608`, 112 E2E passed / 344 skipped, perf budgets PASS with JS transfer `425kb`).
- PR #522: GitHub CI PASS for `verify`, `e2e-smoke`, `site-lock-smoke`, CodeQL, PR Size, Vercel Preview, and Vercel.
- PR #522: `npm run verify:pre-merge` PASS for `f3a9a7f` with marker `artifacts/verify-pre-merge/20260426-163408.json`.
- Merge: PR #522 squashed into `a7ec25d` on `2026-04-26`; local `main` synced cleanly after merge.

## Constraints

- Keep maintenance slices narrow.
- Do not hide major migrations inside “small maintenance” wording.
- Do not weaken current test/security gates to make dependency updates pass.
- Prefer repo-native tooling and existing scripts before adding new automation dependencies.

## 10/10 Quality Bar

- Security posture must be boring:
  - zero known high/critical production findings on `main`.
- Runtime contract must be explicit:
  - local and CI should agree on the same Node/package-manager baseline.
- Maintenance must become a system:
  - not memory,
  - not stale PR archaeology,
  - not owner-only tribal knowledge.
- Each PR must stay explainable:
  - a failed baseline update should be easy to revert without collateral cleanup.

## 10/10 Cross-Cut Categories

- Content governance and source-of-truth
  - one canonical maintenance runbook/checklist owns the cadence.
- Identity and rename safety
  - `N/A`; this brief must not change canonical product identifiers.
- Taxonomy and category management
  - deferred majors vs safe baseline work must remain clearly separated.
- Workflow and publishing safety
  - maintenance updates must preserve current release gates and rollback clarity.
- Business logic correctness and data integrity
  - framework/dependency changes must not silently alter product behavior.
- RBAC and auditability
  - no auth or operator role weakening is allowed under “maintenance” cover.
- UX/UI quality contract
  - no visible regressions on touched routes.
- Admin editor ergonomics
  - admin-critical paths keep their current speed and clarity.
- Performance contract
  - route budgets remain green after baseline updates.
- Data placement and sync boundaries
  - no local/server boundary changes without explicit child-slice scope.
- Caching and invalidation strategy
  - no cache behavior changes without explicit note and validation.
- Testing contract
  - full verify discipline remains intact.
- Observability and KPI tracking
  - `N/A` for product events; operational cadence evidence is tracked through maintenance artifacts instead.
- Incident response and support operations
  - handled in the dedicated ops brief; this brief should not sprawl into incident design.
- Finance and reporting operations
  - `N/A`; no revenue/reporting logic changes.
- i18n operational readiness
  - `N/A`; no locale model changes.
- Stack-fit and dependency discipline
  - stay on stack-native patterns, minimal dependency growth, explicit deferrals for majors.
- Scalability and cost efficiency
  - maintenance automation should reduce toil without increasing CI noise.
- Migration and rollback readiness
  - one slice, one rollback path.
- Definition of done quant targets
  - zero production `high`/`critical` audit findings, pinned runtime contract present, cadence documented.
- Help/Guide and operator training documentation
  - update maintenance/operator runbooks if execution changes local validation or release rhythm.

## Checkpoint Log

- `2026-04-26 | in-progress | started maintenance baseline after pre-maintenance wave closed through PR #518; opened security baseline dependency refresh slice from main 24dd1fd | next: clear Next high/critical production audit finding and run framework validation`
- `2026-04-26 | in-progress | updated next and eslint-config-next to 16.2.4, confirmed npm audit --omit=dev --audit-level=high exits cleanly, removed stale .next* artifacts after version switch, and fixed a new Turbopack PDF-route trace warning with static ignore comments | next: run full verify:pre-pr, commit, push, and open PR`
- `2026-04-26 | in-progress | isolated perf-budget sampling after local TBT flakes in full verify; targeted reruns confirmed the route budget remains green when samples do not share one long-lived page | next: rerun full verify:pre-pr and open PR when green`
- `2026-04-26 | in-progress | PR #519 merged as e5a64dd; started runtime pinning baseline from clean main and moved CI setup-node jobs toward .nvmrc-owned Node 20 contract | next: validate package metadata, run targeted gates, then full verify:pre-pr`
- `2026-04-26 | in-progress | runtime pinning slice validated on Node v20.20.2/npm 10.8.2; npm ci, lint/typecheck, production audit high/critical gate, and verify:pre-pr passed after rerunning one network-flaked workout-builder E2E in isolation | next: commit, push, open PR, monitor CI, then run verify:pre-merge`
- `2026-04-26 | in-progress | PR #521 merged as 7a9746a; started maintenance cadence automation from clean main, with runtime pinning now completed and branch cleanup done | next: add cadence runbook/checklist/reminder, resolve perf-budget ratchet, and validate full lane`
- `2026-04-26 | in-progress | cadence automation implementation added maintenance runbook, monthly checklist, issue template, scheduled reminder workflow, and tightened JS transfer budget from 450kb to 425kb while leaving fresh Stripe sandbox invoice verification deferred before live billing confidence | next: run targeted lint/tests and full verify:pre-pr`
- `2026-04-26 | in-progress | targeted cadence validation passed: lint, typecheck, YAML parse, perf trend, and perf budgets with JS transfer 425kb (worst margin 28.2%) | next: commit cadence slice, run verify:pre-pr on committed HEAD, push, and open PR`
- `2026-04-26 | done | PR #522 merged as a7ec25d after green CI and local verify:pre-merge; maintenance baseline moved to done in docs-only closeout | next: run closeout PR validation and keep Stripe fresh-purchase verification as before-live billing carry-forward`
