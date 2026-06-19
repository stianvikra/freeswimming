# Task Brief: Next Performance Budget Ratchet Maintenance (10/10)

## Metadata

- `id`: `2026-06-19-next-performance-budget-ratchet-maintenance-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-19`
- `updated`: `2026-06-19`
- `mode`: `plan only maintenance`

## Brief Audit Record

- `last_audited`: `2026-06-19`
- `base`: `main@e3a15142`
- `audit_status`: `ready`
- `decision`: Use this brief only after fresh post-`2026-06-19` performance evidence exists; keep it as planned until then.
- `reason`: PR `#1169` tightened JS transfer from `390kb` to `380kb`, docs-only closeout `#1170` completed that workstream, and the latest merged docs-only closeout is `main@e3a15142`; the next ratchet must wait for new weekly green cycles after the `2026-06-19` threshold change.
- `must_refresh_before_execution_if`: `scripts/run-perf-budget-check.mjs`, performance budget defaults, core route matrix, `docs/runbooks/pagespeed-lighthouse-gated-governance.md`, `docs/runbooks/maintenance-cadence.md`, or `docs/testing-strategy.md` change before this brief is picked up.

## Goal

Define the decision contract for the next performance-budget ratchet so the owner knows exactly when to tighten, hold, or revert after new green weekly cycles, without changing runtime budgets yet.

## Pre-Implementation Owner Explanation

Owner request summary:

- Lag en liten planned maintenance-brief for neste performance-budget-ratchet etter nye gronne ukesykluser.
- Dette betyr at vi bare bestemmer reglene for nar vi strammer, nar vi holder igjen, og hvordan beslutningen dokumenteres.
- Runtime-endringer, faktiske budsjettverdier, scripts, UI og `Ja.docx` er uttrykkelig utenfor scope na.

## Why This Brief Exists

- The latest shipped ratchet is `2026-06-19`: JS transfer default `390kb` -> `380kb`.
- Current governance says not to take another stretch-target step until at least two weekly green runs have accumulated after the latest threshold change.
- This brief keeps the next ratchet decision narrow and evidence-based instead of bundling it into unrelated feature work.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this brief:

- `Performance (CWV + payloads)`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                                    | Evidence                                                                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | One clear maintenance outcome exists: the next performance-budget ratchet has explicit `tighten`, `hold`, and `revert` decision rules with no product IA change.                  | this brief + diff review                                                                | `5/5`                   |
| UX flow clarity                               | `N/A`        | N/A because this planned maintenance brief does not change user workflows, states, labels, navigation, or recovery UX.                                                            | explicit non-UI scope rationale                                                         | `N/A`                   |
| Visual design quality                         | `N/A`        | N/A because this planned maintenance brief does not change UI, layout, print, export, screenshots, or brand rendering.                                                            | explicit non-visual scope rationale                                                     | `N/A`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: future implementation must keep the existing performance-budget runner semantics and change only the approved threshold step if tightening is selected.          | future diff review + targeted perf run                                                  | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editing surfaces, CRUD flows, publish controls, or operator task flows change.                                                                               | explicit admin scope rationale                                                          | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no rendered UI or accessibility semantics change.                                                                                                                     | explicit non-UI scope rationale                                                         | `N/A`                   |
| Performance (CWV + payloads)                  | `target`     | Before any future tighten, at least two new weekly green runs after `2026-06-19` must exist and latest evidence must preserve at least `15%` practical headroom after the step.   | `npm run test:perf:trend`, `npm run test:perf:budgets`, and current SHA-bound artifacts | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because no product state, persistence, sync, retention, cache ownership, or local/server data boundary changes.                                                               | explicit stateless governance-slice rationale                                           | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, revalidation trigger, data freshness behavior, CDN behavior, or browser cache policy changes.                                                    | explicit cache scope rationale                                                          | `N/A`                   |
| Reliability and failure handling              | `target`     | The next decision must fail safe: `hold` on insufficient/noisy evidence, and `revert` or triage if fresh budget runs fail or show repeated regression after a recent ratchet.     | decision log + targeted perf evidence                                                   | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because no auth, RBAC, protected route, input validation, site-lock, or secret-handling behavior changes.                                                                     | explicit security scope rationale                                                       | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no personal data, consent, retention, compliance copy, event payload, or log content changes.                                                                         | explicit privacy scope rationale                                                        | `N/A`                   |
| Content governance                            | `target`     | The future `tighten`, `hold`, or `revert` decision must be documented in the active brief checkpoint/PR summary; budget changes also update canonical performance docs.           | this brief + future PR/brief checkpoint + docs diff                                     | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow labels, actions, editability, publishing, recovery behavior, or Help/Guide surfaces change.                                                         | explicit admin workflow scope rationale                                                 | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no route metadata, sitemap, robots, canonical URL, structured content, or public crawl behavior changes.                                                              | explicit SEO scope rationale                                                            | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content model, structured data, crawl-safe docs, or AI-readable route content changes.                                                             | explicit AI-discoverability scope rationale                                             | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no product analytics event taxonomy, KPI persistence, dashboard, attribution, or payload behavior changes.                                                            | explicit analytics scope rationale                                                      | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, entitlement, billing, refund, invoice, payout, or revenue operation behavior changes.                                                           | explicit commerce scope rationale                                                       | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this planned performance-governance brief does not change support recovery paths, alerts, incident ownership, or customer-facing diagnostics.                         | explicit support/incident scope rationale                                               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance, reconciliation, payout, invoice, entitlement-reporting, revenue recognition, or accounting data behavior changes.                                         | explicit finance scope rationale                                                        | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale routing, translation model, metadata localization, or user-facing copy contract changes.                                                                    | explicit i18n scope rationale                                                           | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Future execution must reuse the existing Next/Playwright performance-budget scripts and repo docs; no dependency or parallel measurement system is allowed for this ratchet.      | this brief + future script/package diff review                                          | `5/5`                   |
| Testing and QA automation                     | `target`     | This planned brief passes `npm run lint:briefs`; future execution must pass targeted perf checks, `npm run verify:pre-pr`, CI, and `npm run verify:pre-merge` before merge-ready. | `npm run lint:briefs` now; future targeted perf and release-gate evidence               | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Future tightening must catch bundle growth earlier while preserving at least `15%` practical headroom on the latest public-profile core-route measurements.                       | trend margin + perf budget report                                                       | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Future tighten/revert must be one reversible threshold step plus docs updates, with no migration, deployment choreography, or cleanup burden.                                     | reversible diff + rollback note + future verify evidence                                | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - no component, route, metadata, server/client boundary, cache, or revalidation behavior changes in this planned brief.
- TypeScript/domain contracts:
  - no domain model changes now; future execution must keep the existing performance-budget runner as the reference implementation.
- Supabase/data layer:
  - `N/A`; no schema, RLS, generated type, auth, storage, or data access changes.
- External services/tools:
  - no new service, SDK, CLI, or provider docs dependency; use the existing Playwright/Next production-start perf scripts.
- UI system:
  - `N/A`; no UI primitives, accessibility states, responsive behavior, or screenshot handoff required.
- Testing:
  - this docs-only planning slice requires `npm run lint:briefs`; future execution requires `npm run test:perf:trend`, `npm run test:perf:budgets`, `npm run verify:pre-pr`, CI, and `npm run verify:pre-merge`.

## Codex Skill / Stack Readiness Radar

Skill/capability audit:

- Available now: local shell tools, repo task-brief linting, existing performance-budget scripts, current session `playwright` skill for browser automation if future visual/perf debugging needs it.
- Evaluate later: no new Codex skill, plugin, MCP server, or external provider capability is needed for this docs-only planned brief.
- Install/config changes: none; do not install or configure local Codex capabilities for this slice.

Systemic findings:

| Surface                  | Finding                                                                                                                                    | Severity | Recommended Type           | Owner Decision Needed | Follow-Up Brief Path |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | -------- | -------------------------- | --------------------- | -------------------- |
| Performance governance   | Existing runbooks already define two-weekly-green and `15%` margin rules; this brief packages the next decision as a bounded future slice. | `info`   | `safe process/docs update` | `no`                  | this brief           |
| Runtime budget scripts   | No runtime/script change is justified until fresh post-`2026-06-19` evidence exists.                                                       | `info`   | `do not do`                | `no`                  | `N/A`                |
| Local Codex capabilities | Current session has enough tooling for docs-only planning; no plugin/skill install is warranted.                                           | `info`   | `do not do`                | `no`                  | `N/A`                |

Return path:

- Last merged workstream: PR `#1171` and docs-only closeout PR `#1172`, with `main@e3a15142` clean and synced.
- Current planned child: this brief stays in `docs/task-briefs/planned/` until fresh weekly green evidence exists.
- Exact next planning step after this brief: wait for at least two new weekly green cycles after `2026-06-19`, then run `npm run test:perf:trend` and choose `tighten`, `hold`, or `revert` from the rules below.

## Data Placement And Sync Contract

`N/A` because this planned maintenance brief is stateless governance work. It does not create or modify server-canonical entities, local browser storage, sync triggers, conflict handling, retention rules, cache invalidation, or sensitive data handling.

## Identity And Rename Contract

`N/A` because this planned maintenance brief does not create, rename, repurpose, or route any persisted product entity, slug, title, route param, import/export identifier, analytics identifier, or operator-visible identifier.

## Forward Compatibility Contract

- Extensibility surfaces:
  - future performance metrics, route matrix entries, perf profiles, and threshold values.
- Source of truth:
  - current defaults live in the existing performance-budget script and canonical performance runbooks.
- Additive behavior:
  - future weekly green cycles should be evaluated by `npm run test:perf:trend` without hardcoding today's run count into the decision.
- Explicit mapping requirements:
  - adding measured routes, metrics, profiles, compression/CDN checks, or non-JS ratchets requires an explicit brief refresh and docs/script mapping update.
- Unknown or deprecated values:
  - unknown profiles or missing trend evidence fail safe to `hold`; fresh failures or repeated regression require `revert` triage before unrelated merges.
- Test/evidence:
  - this docs-only planning slice is proven by `npm run lint:briefs`; future execution must include current SHA-bound trend and budget evidence.

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
  - `performance_cost`: performance budget and payload evidence must be explicit before future execution.
  - `devops_tooling`: release gates, rollback path, and reversible threshold-step evidence must be explicit.
  - `docs_governance`: decision rules and canonical docs must remain aligned.
  - `route_label_support`: `N/A`; this slice does not remove, rename, consolidate, or materially reposition routes, labels, Help/Guide surfaces, runbooks, recovery paths, or operator support surfaces.
- Required evidence language:
  - current SHA-bound performance budget/trend evidence,
  - `tighten` / `hold` / `revert` rationale,
  - docs updated or intentionally unchanged based on decision,
  - rollback/readiness evidence.

## Scope

- Create a planned maintenance brief for the next performance-budget ratchet.
- Define explicit `tighten`, `hold`, and `revert` decision rules.
- Define how each decision must be documented.
- Keep this brief in `docs/task-briefs/planned/` until fresh post-`2026-06-19` evidence exists.

## Out Of Scope

- Runtime budget changes.
- Script changes.
- Test implementation changes.
- UI, route, Help/Guide, support workflow, analytics, commerce, auth, data, SEO, AI discoverability, or i18n changes.
- New dependencies, tools, plugins, MCP servers, browser automation changes, or provider integrations.
- Touching `Ja.docx`.
- Opening a runtime implementation PR before fresh weekly green evidence exists and owner approves execution.

## Acceptance Criteria

1. A planned brief exists under `docs/task-briefs/planned/`.
2. The brief states that the next ratchet waits for at least two new weekly green runs after `2026-06-19`.
3. The brief defines measurable `tighten`, `hold`, and `revert` rules.
4. The brief states exactly where future decisions are documented.
5. The brief explicitly keeps runtime budgets, scripts, UI, and `Ja.docx` out of scope.
6. `npm run lint:briefs` passes for the changed planned brief.

## Validation

- `npm run lint:briefs`
- Optional for PR packaging: `git diff --check`
- Optional for docs-only PR packaging: `npm run verify:docs-only`

## Local Tooling Prerequisite

- Use repo-pinned Node/npm from `.nvmrc` and `packageManager`.
- Before reporting `npm`/`node` missing, bootstrap through `nvm use --silent`.

## Manual QA Environments

- `N/A`; no UI, browser workflow, deployment behavior, install flow, print/export rendering, or visible route behavior changes.
- No screenshot handoff required because this is a docs-only planned maintenance brief.

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

- This slice is plan-only and docs-only.
- Future execution requires a fresh branch from current `main`, targeted perf validation, `npm run verify:pre-pr`, commit, push, PR, CI monitoring, and `npm run verify:pre-merge`.
- No merge without explicit owner approval.

## 10/10 Quality Bar

- The next decision must be evidence-bound, reversible, and clearly documented.
- `tighten` must preserve practical headroom instead of chasing the lowest possible number.
- `hold` must be treated as a valid quality decision when evidence is too fresh, noisy, stale, or below margin.
- `revert` must restore the previous known-good threshold quickly when repeated regression or user-visible slowdown appears.

## Checkpoint Log

- `2026-06-19 | planned` - created from clean `main@e3a15142` after PR `#1171` and docs-only closeout `#1172` were merged; no runtime budget/script/UI changes; next: wait for at least two new weekly green runs after `2026-06-19`, then run `npm run test:perf:trend` and choose `tighten`, `hold`, or `revert`.
