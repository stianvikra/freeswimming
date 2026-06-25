# Task Brief: Next Performance Budget Ratchet Maintenance (10/10)

## Metadata

- `id`: `2026-06-19-next-performance-budget-ratchet-maintenance-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-19`
- `updated`: `2026-06-25`
- `mode`: `implementation maintenance`

## Brief Audit Record

- `last_audited`: `2026-06-25`
- `base`: `main@06388db8`
- `audit_status`: `completed`
- `decision`: `tighten`; implement one conservative CSS-transfer ratchet from `160kb` to `150kb`.
- `reason`: Fresh post-`2026-06-19` evidence exists: `npm run test:perf:trend` reports `11` consecutive weekly green public runs, latest PASS at `623a896a798a`, and `15.4%` worst margin. JS transfer is the tightest metric, so another `10kb` JS step would not preserve the `15%` practical headroom rule; CSS transfer has enough margin for one `10kb` step.
- `must_refresh_before_execution_if`: `scripts/run-perf-budget-check.mjs`, performance budget defaults, core route matrix, `docs/runbooks/pagespeed-lighthouse-gated-governance.md`, `docs/runbooks/maintenance-cadence.md`, or `docs/testing-strategy.md` change before this brief is picked up.

## Goal

Execute one evidence-bound performance-budget ratchet so the current public core-route budget gate catches CSS payload growth earlier without changing product behavior.

## Pre-Implementation Owner Explanation

Owner request summary:

- Stram ett eksisterende ytelsesbudsjett etter stabile gronne weekly-malinger.
- Dette betyr at appen far et litt strengere tak for CSS-payload, slik at nye endringer som gjor sidene tyngre blir fanget tidligere.
- Runtime-produktendringer, UI, nye malinger, flere budsjettsteg og `Ja.docx` er utenfor scope.

## Why This Brief Exists

- The latest shipped ratchet before this slice was `2026-06-19`: JS transfer default `390kb` -> `380kb`.
- Current evidence now satisfies the wait rule: `11` consecutive weekly green public runs after the latest threshold change.
- This slice keeps the ratchet narrow and evidence-based instead of bundling it into unrelated feature work.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this brief:

- `Performance (CWV + payloads)`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                                     | Evidence                                                                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | One clear maintenance outcome exists: CSS transfer default moves from `160kb` to `150kb` with no product IA change.                                                                | this brief + diff review                                                                | `5/5`                   |
| UX flow clarity                               | `N/A`        | N/A because this maintenance slice does not change user workflows, states, labels, navigation, or recovery UX.                                                                     | explicit non-UI scope rationale                                                         | `N/A`                   |
| Visual design quality                         | `N/A`        | N/A because this maintenance slice does not change UI, layout, print, export, screenshots, or brand rendering.                                                                     | explicit non-visual scope rationale                                                     | `N/A`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: the existing performance-budget runner semantics stay unchanged; only the approved CSS threshold default changes.                                                 | diff review + targeted perf run                                                         | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editing surfaces, CRUD flows, publish controls, or operator task flows change.                                                                                | explicit admin scope rationale                                                          | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no rendered UI or accessibility semantics change.                                                                                                                      | explicit non-UI scope rationale                                                         | `N/A`                   |
| Performance (CWV + payloads)                  | `target`     | `npm run test:perf:trend` reports at least two post-`2026-06-19` weekly green runs, CSS transfer tightens one `10kb` step, and `npm run test:perf:budgets` passes on current HEAD. | `npm run test:perf:trend`, `npm run test:perf:budgets`, and current SHA-bound artifacts | `5/5`                   |
| Performance                                   | `target`     | Alias for the canonical `Performance (CWV + payloads)` target so closeout lint can bind the critical-category shorthand to the same evidence.                                      | same as `Performance (CWV + payloads)`                                                  | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because no product state, persistence, sync, retention, cache ownership, or local/server data boundary changes.                                                                | explicit stateless governance-slice rationale                                           | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, revalidation trigger, data freshness behavior, CDN behavior, or browser cache policy changes.                                                     | explicit cache scope rationale                                                          | `N/A`                   |
| Reliability and failure handling              | `target`     | The decision fails safe: hold JS at `380kb`, tighten only CSS, and revert CSS to `160kb` if fresh budget runs fail twice or CI shows repeated CSS budget regression.               | decision log + targeted perf evidence                                                   | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because no auth, RBAC, protected route, input validation, site-lock, or secret-handling behavior changes.                                                                      | explicit security scope rationale                                                       | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no personal data, consent, retention, compliance copy, event payload, or log content changes.                                                                          | explicit privacy scope rationale                                                        | `N/A`                   |
| Content governance                            | `target`     | The `tighten` decision is documented in this active brief checkpoint/PR summary, and canonical performance docs name the new CSS default and latest decision.                      | this brief + PR/brief checkpoint + docs diff                                            | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow labels, actions, editability, publishing, recovery behavior, or Help/Guide surfaces change.                                                          | explicit admin workflow scope rationale                                                 | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no route metadata, sitemap, robots, canonical URL, structured content, or public crawl behavior changes.                                                               | explicit SEO scope rationale                                                            | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content model, structured data, crawl-safe docs, or AI-readable route content changes.                                                              | explicit AI-discoverability scope rationale                                             | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no product analytics event taxonomy, KPI persistence, dashboard, attribution, or payload behavior changes.                                                             | explicit analytics scope rationale                                                      | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, entitlement, billing, refund, invoice, payout, or revenue operation behavior changes.                                                            | explicit commerce scope rationale                                                       | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this planned performance-governance brief does not change support recovery paths, alerts, incident ownership, or customer-facing diagnostics.                          | explicit support/incident scope rationale                                               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance, reconciliation, payout, invoice, entitlement-reporting, revenue recognition, or accounting data behavior changes.                                          | explicit finance scope rationale                                                        | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale routing, translation model, metadata localization, or user-facing copy contract changes.                                                                     | explicit i18n scope rationale                                                           | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing Next/Playwright performance-budget scripts and repo docs; no dependency or parallel measurement system is allowed for this ratchet.                             | this brief + script/package diff review                                                 | `5/5`                   |
| Testing and QA automation                     | `target`     | This in-progress brief passes `npm run lint:briefs`; execution must pass targeted perf checks, `npm run verify:pre-pr`, CI, and `npm run verify:pre-merge` before merge-ready.     | `npm run lint:briefs`; targeted perf and release-gate evidence                          | `5/5`                   |
| Scalability and cost efficiency               | `target`     | CSS tightening catches stylesheet growth earlier while preserving more than `15%` practical headroom on latest public-profile core-route CSS measurements.                         | trend margin + perf budget report                                                       | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Tighten/revert remains one reversible threshold step plus docs updates, with no migration, deployment choreography, or cleanup burden.                                             | reversible diff + rollback note + verify evidence                                       | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - no component, route, metadata, server/client boundary, cache, or revalidation behavior changes in this planned brief.
- TypeScript/domain contracts:
  - no domain model changes; this execution keeps the existing performance-budget runner as the reference implementation.
- Supabase/data layer:
  - `N/A`; no schema, RLS, generated type, auth, storage, or data access changes.
- External services/tools:
  - no new service, SDK, CLI, or provider docs dependency; use the existing Playwright/Next production-start perf scripts.
- UI system:
  - `N/A`; no UI primitives, accessibility states, responsive behavior, or screenshot handoff required.
- Testing:
  - this implementation slice requires `npm run test:perf:trend`, `npm run test:perf:budgets`, `npm run lint:briefs`, `npm run verify:pre-pr`, CI, and `npm run verify:pre-merge`.

## Codex Skill / Stack Readiness Radar

Skill/capability audit:

- Available now: local shell tools, repo task-brief linting, existing performance-budget scripts, current session `playwright` skill for browser automation if future visual/perf debugging needs it.
- Evaluate later: no new Codex skill, plugin, MCP server, or external provider capability is needed for this docs-only planned brief.
- Install/config changes: none; do not install or configure local Codex capabilities for this slice.

Systemic findings:

| Surface                  | Finding                                                                                                                                              | Severity | Recommended Type               | Owner Decision Needed | Follow-Up Brief Path |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------ | --------------------- | -------------------- |
| Performance governance   | Existing runbooks already define two-weekly-green and `15%` margin rules; this brief packages the next decision as a bounded future slice.           | `info`   | `safe process/docs update`     | `no`                  | this brief           |
| Runtime budget scripts   | Fresh post-`2026-06-19` evidence exists, so one CSS default threshold change is justified; no runner semantics or new measurement system are needed. | `info`   | `bounded implementation child` | `no`                  | this brief           |
| Local Codex capabilities | Current session has enough tooling for this maintenance implementation; no plugin/skill install is warranted.                                        | `info`   | `do not do`                    | `no`                  | `N/A`                |

Return path:

- Last merged workstream: Habits PR `#1237` and docs-only closeout PR `#1238`, with `main@06388db8` clean and synced.
- Current active child: this brief is in `docs/task-briefs/in-progress/` for the CSS transfer `160kb` -> `150kb` ratchet.
- Exact next planning step after this brief: after merge, wait for at least two new weekly green cycles after `2026-06-25`, then run `npm run test:perf:trend` and choose `tighten`, `hold`, or `revert` from the rules below.

## Data Placement And Sync Contract

`N/A` because this maintenance slice is stateless governance/runtime-threshold work. It does not create or modify server-canonical entities, local browser storage, sync triggers, conflict handling, retention rules, cache invalidation, or sensitive data handling.

## Identity And Rename Contract

`N/A` because this maintenance slice does not create, rename, repurpose, or route any persisted product entity, slug, title, route param, import/export identifier, analytics identifier, or operator-visible identifier.

## Forward Compatibility Contract

- Extensibility surfaces:
  - future performance metrics, route matrix entries, perf profiles, and threshold values.
- Source of truth:
  - current defaults live in the existing performance-budget script and canonical performance runbooks.
- Additive behavior:
  - future weekly green cycles should be evaluated by `npm run test:perf:trend` without hardcoding today's run count or CSS threshold into the decision.
- Explicit mapping requirements:
  - adding measured routes, metrics, profiles, compression/CDN checks, or non-JS ratchets requires an explicit brief refresh and docs/script mapping update.
- Unknown or deprecated values:
  - unknown profiles or missing trend evidence fail safe to `hold`; fresh failures or repeated regression require `revert` triage before unrelated merges.
- Test/evidence:
  - this maintenance slice is proven by current SHA-bound trend and budget evidence plus the normal release gates.

## Decision Rules

### Tighten

Choose `tighten` only when all conditions are true:

- At least two new weekly green runs have accumulated after the `2026-06-19` JS transfer `380kb` ratchet.
- `npm run test:perf:trend` recommends `tighten` for the active profile on current evidence.
- Latest public-profile `npm run test:perf:budgets` passes on the current branch/HEAD.
- The proposed step preserves at least `15%` practical headroom on the worst core-route JS transfer measurement.
- The step is conservative: one metric, one threshold step, preferably `10kb` for JS transfer unless fresh evidence and owner review justify a different step.
- The implementation PR updates the threshold and every canonical doc that names the current default or latest decision.

Documentation required for `tighten`:

- active in-progress brief checkpoint log,
- PR summary,
- `docs/runbooks/pagespeed-lighthouse-gated-governance.md`,
- `docs/runbooks/maintenance-cadence.md`,
- `docs/testing-strategy.md`,
- `docs/testing-coverage-scorecard.md` if the tracked current ratchet changes.

### Hold

Choose `hold` when any condition is true:

- Fewer than two new weekly green runs have accumulated after `2026-06-19`.
- Trend output recommends `tighten`, but the recommendation is based on carry-forward history rather than new post-ratchet weekly cycles.
- Latest margin is below `15%` after the proposed next step.
- Evidence is noisy, missing, stale, profile-mismatched, or not tied to the current HEAD.
- A single regression appears without repeated failure or clear user-visible slowdown.

Documentation required for `hold`:

- record date, current SHA, profile, trend recommendation, observed weekly green count, margin, and reason for holding in the active brief checkpoint or maintenance issue/PR summary.
- do not change runtime budgets, scripts, or canonical current-default docs.

### Revert

Choose `revert` or regression triage when any condition is true:

- Latest budget run fails on a core route and a rerun confirms the failure.
- Repeated regression appears after the latest ratchet.
- A recent ratchet creates clear user-visible route slowdown or release-gate instability.
- The only safe path to unblock release is restoring the previous known-good threshold.

Documentation required for `revert`:

- active in-progress brief checkpoint with failing route/metric evidence,
- PR summary with rollback rationale,
- canonical performance docs updated to show the restored default and `revert` decision,
- follow-up owner/brief if the regression needs product or architecture work after rollback.

## Quality-Gate Evidence Contract

- Triggered classes expected:
  - `performance_cost`: performance budget and payload evidence must be explicit before PR handoff and merge recommendation.
  - `devops_tooling`: release gates, rollback path, and reversible threshold-step evidence must be explicit.
  - `docs_governance`: decision rules and canonical docs must remain aligned.
  - `route_label_support`: `N/A`; this slice does not remove, rename, consolidate, or materially reposition routes, labels, Help/Guide surfaces, runbooks, recovery paths, or operator support surfaces.
- Required evidence language:
  - current SHA-bound performance budget/trend evidence,
  - `tighten` / `hold` / `revert` rationale,
  - docs updated or intentionally unchanged based on decision,
  - rollback/readiness evidence.

## Route, Label, And Support-Surface Impact Sweep

- Decision: no product route, user/admin label, Help/Guide, recovery path, or support workflow changes.
- Identifiers searched: `CSS transfer`, `JS transfer`, `160kb`, `150kb`, `380kb`, `Current ratchet`, `Latest ratchet`, `performance ratchet`, `performance-budget`, `2026-06-19-next-performance-budget-ratchet`.
- Surfaces checked: `scripts/run-perf-budget-check.mjs`, `docs/runbooks/pagespeed-lighthouse-gated-governance.md`, `docs/runbooks/maintenance-cadence.md`, `docs/testing-strategy.md`, `docs/testing-coverage-scorecard.md`, `docs/app-knowledge-book/00-repo-audit.md`, and this active brief.
- Fallout handled: canonical performance docs now name the CSS `150kb` default and `2026-06-25` latest ratchet; no Help/Guide or user-facing support copy update is required because no workflow/action/route label changed.

## Scope

- Move the existing performance-ratchet maintenance brief to `in-progress`.
- Tighten CSS transfer default from `160kb` to `150kb`.
- Keep existing `tighten`, `hold`, and `revert` decision rules documented.
- Update canonical performance docs with the `2026-06-25` decision.

## Out Of Scope

- Additional runtime budget changes beyond CSS transfer `160kb` -> `150kb`.
- Script changes beyond the CSS default threshold.
- Test implementation changes.
- UI, route, Help/Guide, support workflow, analytics, commerce, auth, data, SEO, AI discoverability, or i18n changes.
- New dependencies, tools, plugins, MCP servers, browser automation changes, or provider integrations.
- Touching `Ja.docx`.
- Opening unrelated runtime implementation PRs from this workstream.

## Acceptance Criteria

1. The active brief is under `docs/task-briefs/in-progress/`.
2. `npm run test:perf:trend` records `tighten` evidence with `11` weekly green public runs after `2026-06-19`.
3. CSS transfer default threshold is `150kb`.
4. Canonical performance docs record the `2026-06-25` `tighten` decision and current CSS default.
5. The brief explicitly keeps UI, product behavior, additional runtime budgets, new scripts, and `Ja.docx` out of scope.
6. `npm run lint:briefs`, `npm run test:perf:budgets`, `npm run verify:pre-pr`, CI, and `npm run verify:pre-merge` pass before merge-ready.

## Validation

- `npm run test:perf:trend`
- `npm run test:perf:budgets`
- `npm run lint:briefs`
- `git diff --check`
- `npm run verify:pre-pr`
- GitHub CI checks
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Use repo-pinned Node/npm from `.nvmrc` and `packageManager`.
- Before reporting `npm`/`node` missing, bootstrap through `nvm use --silent`.

## Manual QA Environments

- `N/A`; no UI, browser workflow, deployment behavior, install flow, print/export rendering, or visible route behavior changes.
- No screenshot handoff required because this slice changes no UI, browser workflow, print/export rendering, or visible route behavior.

## Constraints

- Do not weaken or bypass performance gates.
- Do not change trend history artifacts by hand.
- Do not change runtime thresholds until fresh evidence and owner approval exist.
- Keep the next future ratchet to one metric and one conservative step unless the brief is refreshed with explicit owner approval.
- Do not touch `Ja.docx`.

## Help/Guide And Operator Training Contract

`N/A` because no admin/user workflow labels, actions, recovery behavior, Help/Guide content, or support-surface behavior changes. The only operator-facing contract is maintenance/performance governance, captured in this planned brief and existing runbooks.

## Security, Privacy, And Compliance

- No secrets, tokens, credentials, auth paths, data retention, privacy copy, compliance behavior, or site-lock behavior changes.
- Future performance artifacts must not include bypass tokens.

## Observability And KPI Contract

- Existing perf-budget trend logs remain the operational evidence trail.
- No product analytics, KPI event taxonomy, dashboard, or persistence behavior changes.

## Session Continuity And Recovery

- Canonical source of truth: this planned brief until a future owner-approved implementation slice moves it to `in-progress`.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint.

## Git Rhythm Defaults

- This slice changes one runtime performance threshold plus docs.
- Execution requires a fresh branch from current `main`, targeted perf validation, `npm run verify:pre-pr`, commit, push, PR, CI monitoring, and `npm run verify:pre-merge`.
- No merge without explicit owner approval.

## 10/10 Quality Bar

- The next decision must be evidence-bound, reversible, and clearly documented.
- `tighten` must preserve practical headroom instead of chasing the lowest possible number.
- `hold` must be treated as a valid quality decision when evidence is too fresh, noisy, stale, or below margin.
- `revert` must restore the previous known-good threshold quickly when repeated regression or user-visible slowdown appears.

## Checkpoint Log

- `2026-06-19 | planned` - created from clean `main@e3a15142` after PR `#1171` and docs-only closeout `#1172` were merged; no runtime budget/script/UI changes; next: wait for at least two new weekly green runs after `2026-06-19`, then run `npm run test:perf:trend` and choose `tighten`, `hold`, or `revert`.
- `2026-06-25 | in-progress` - owner approved execution after `11` green weekly runs; branch `chore/performance-budget-ratchet-2026-06-25` created from clean `main@06388db8`; `npm run test:perf:trend` reported latest public PASS at `623a896a798a`, `weekly-green-runs=11`, worst margin `15.4%`, recommendation `tighten`; decision: tighten CSS transfer default `160kb` -> `150kb` because JS is too tight for another `10kb` step while preserving the `15%` headroom rule | next: run targeted perf budget, brief lint, full pre-PR gate, then PR flow.
- `2026-06-25 | targeted validation` - `npm run test:perf:budgets` PASS with CSS transfer default `150kb`; route medians: `/` `113.7kb`, `/plans` `106.8kb`, `/course` `115.6kb`, `/my-library` `106.8kb`; post-step worst CSS margin is `/course` at `22.9%`, while total worst margin remains JS at `15.4%`; `npm run lint:briefs:all` PASS and `git diff --check` PASS | next: run `npm run verify:pre-pr`.
- `2026-06-25 | pre-pr gate` - first `npm run verify:pre-pr` attempt failed early because quality-gate evidence needed explicit route/label/support sweep identifiers; added the sweep, then `npm run lint:quality-gates` PASS and reran `npm run verify:pre-pr` full public lane PASS (`artifacts/test-runs/20260625-122546/verify.log`): lint/quality/admin/env/PR-body checks PASS, ESLint had existing `output/` warnings only, typecheck PASS, Vitest `260` files / `1735` tests PASS, build PASS, perf budgets PASS with CSS `150kb`, Playwright `111 passed / 567 skipped` | next: commit, push, open PR, monitor CI, then run `npm run verify:pre-merge`.
- `2026-06-25 | merged` - PR `#1239` merged as squash commit `6b4ea8dd`; CI PASS, merge state `CLEAN`, and local `npm run verify:pre-merge` PASS with full lane reuse for current HEAD | next: docs-only closeout.

## Completion Record

- `completed`: `2026-06-25`
- `merged_pr`: `#1239`
- `squash_commit`: `6b4ea8dd`
- `result`: Closed Next Performance Budget Ratchet Maintenance by tightening the default CSS transfer budget from `160kb` to `150kb` after `11` consecutive weekly green public runs, while leaving JS at `380kb` because its latest margin was already the tightest.
- `validation`: `npm run test:perf:trend` reported `weekly-green-runs=11` and recommendation `tighten`; `npm run test:perf:budgets` PASS with CSS `150kb`; `npm run verify:pre-pr` PASS full public lane; PR `#1239` CI PASS; `npm run verify:pre-merge` PASS.
- `10/10 claim`: yes - all critical target categories reached `5/5`.

| Category                            | Achieved Score | Evidence                                                                                                                                                         | Gaps / Notes |
| ----------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                | `5/5`          | One maintenance outcome shipped in PR `#1239`: CSS transfer default `160kb` -> `150kb`, with no product IA change.                                               | None.        |
| Performance (CWV + payloads)        | `5/5`          | `npm run test:perf:trend` showed `11` weekly green runs; `npm run test:perf:budgets` PASS with CSS `150kb`; post-step worst CSS margin was `/course` at `22.9%`. | None.        |
| Performance                         | `5/5`          | Alias row for the critical-category parser; same evidence as `Performance (CWV + payloads)`.                                                                     | None.        |
| Reliability and failure handling    | `5/5`          | Decision held JS at `380kb`, tightened only CSS, and kept the documented one-step rollback path to `160kb` if repeated CSS budget regressions appear.            | None.        |
| Content governance                  | `5/5`          | Active brief checkpoint, PR summary, and canonical performance docs record the `2026-06-25` `tighten` decision and new CSS default.                              | None.        |
| Stack-fit and dependency discipline | `5/5`          | Reused existing Next/Playwright performance-budget script and runbooks; no new dependency, provider, or measurement system.                                      | None.        |
| Testing and QA automation           | `5/5`          | `npm run lint:briefs:all`, `npm run verify:pre-pr`, PR `#1239` CI, and `npm run verify:pre-merge` all passed.                                                    | None.        |
| Scalability and cost efficiency     | `5/5`          | The stricter CSS threshold catches payload growth earlier while preserving more than `15%` practical CSS headroom on current public core-route measurements.     | None.        |
| DevOps and rollback readiness       | `5/5`          | The shipped diff is a single reversible threshold step plus docs, with no migration, deployment choreography, or cleanup burden.                                 | None.        |
