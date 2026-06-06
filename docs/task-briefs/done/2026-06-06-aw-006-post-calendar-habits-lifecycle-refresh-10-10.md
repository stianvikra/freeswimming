# Task Brief: AW-006 Post-Calendar Habits Lifecycle Refresh (10/10)

## Metadata

- `id`: `2026-06-06-aw-006-post-calendar-habits-lifecycle-refresh-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-06`
- `updated`: `2026-06-06`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `planned_child`: `docs/task-briefs/planned/2026-06-05-aw-006-habits-advanced-motivation-history-depth-10-10.md`
- `preceded_by`: `docs/task-briefs/done/2026-06-05-aw-006-calendar-compare-findings-polish-10-10.md`
- `branch`: `aw-006-post-calendar-habits-lifecycle-refresh`

## Brief Audit Record

- `last_audited`: `2026-06-06`
- `base`: `main@bba59bfe`
- `audit_status`: `ready`
- `decision`: Execute a docs-only lifecycle refresh before any Habits Advanced Motivation implementation slice starts.
- `reason`: `main` is clean and synced after Calendar Compare Findings Polish PR `#999` and repo-managed closeout PR `#1000`; post-merge preflight is green. Fresh re-audit found the planned Habits advanced brief, AW-006 queue, and design inventory still carried stale Calendar-active or pre-Calendar-closeout wording.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, canonical queue format, design inventory format, Habits parent return contract, task-brief lifecycle rules, `lint:briefs`, post-merge preflight behavior, or verification lanes change before PR handoff.

## Goal

Make the AW-006 queue, Habits advanced planned brief, and design inventory agree that Calendar Compare Findings Polish is done, no product/UI implementation slice is active, and Habits Advanced Motivation remains planned until explicit owner execution.

## Pre-Implementation Owner Explanation

Vi rydder veikartet etter Calendar-jobben. Jeg oppdaterer dokumentasjonen slik at Calendar Compare staar som ferdig, og Habits Advanced Motivation staar som neste planlagte Habits-retning uten aa starte bygging.

Hvorfor det betyr noe: neste Habits-jobb maa starte fra riktig kart, ellers kan vi blande ferdig Calendar-polish inn i et nytt Habits-scope.

Utenfor scope er app-kode, UI, database, screenshots, produkt-tester, Calendar-endringer, Habits-implementering, PR-merge, og valg av eksakt Habits-layout.

Fremoverkompatibilitet: fremtidige Calendar- eller Habits-slices maa enten velges eksplisitt fra oppdatert ko/parent etter fresh re-audit, eller bli igjen som planlagt/deferred med trygg tekst som ikke later som de er aktive.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `Reliability and failure handling`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                        | Evidence                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Queue, design inventory, and planned Habits child must agree that Calendar Compare is done, no product/UI implementation is active, and Habits advanced remains planned.  | docs diff + targeted lifecycle sweep     | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: contributor planning flow becomes clearer; no user-facing Habits or Calendar flow, navigation, copy, empty state, loading state, or error state changes. | docs-only diff review                    | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this changes no rendered UI, CSS, layout, print output, brand asset, screenshot artifact, or browser-visible product surface.                                 | visual scope rationale                   | `N/A`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because this Markdown-only refresh changes no runtime state, persisted data, mutation, validation, domain invariant, checkout, entitlement, or Habits truth.          | docs-only diff review                    | `N/A`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor, CRUD action, role behavior, recovery action, or operator workflow.                                                              | admin-editor scope rationale             | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no markup, focus behavior, keyboard path, labels, contrast, live region, or screen-reader semantics change.                                                   | a11y scope rationale                     | `N/A`                   |
| Accessibility                                 | `N/A`        | N/A lifecycle-lint alias for `Accessibility (a11y)`; no rendered accessibility surface changes.                                                                           | a11y alias scope rationale               | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no route, JavaScript payload, CSS, media asset, build output, cache behavior, or Core Web Vitals budget changes.                                              | performance scope rationale              | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this introduces no local-only data, server-canonical data, browser storage, sync policy, conflict policy, retention rule, or sensitive data flow.             | data scope rationale                     | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, fetch cache, revalidation trigger, mutation response, CDN behavior, or stale-data contract changes.                                      | cache scope rationale                    | `N/A`                   |
| Reliability and failure handling              | `target`     | Targeted sweeps must show no current top-level Calendar Compare lifecycle text still describes PR `#999/#1000` as active, in-progress, or a future unresolved brief.      | targeted sweeps + brief lint             | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because no protected route, authz check, auth provider behavior, token handling, cookie, secret, or request input changes.                                            | security scope rationale                 | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data, credentials, logs, analytics payload, legal copy, consent behavior, retention rule, or raw env value handling changes.                          | privacy scope rationale                  | `N/A`                   |
| Content governance                            | `target`     | The active refresh brief, planned Habits brief, AW-006 queue, and design inventory must agree on lifecycle state and next owner decision point.                           | changed docs + route/label/support sweep | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow label, editable field, status transition, audit trail, Help/Guide action, or support procedure changes.                                     | workflow scope rationale                 | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no metadata, sitemap, robots, canonical URL, public route content, structured data, or crawl-facing behavior changes.                                         | SEO scope rationale                      | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                       | AI-discoverability scope rationale       | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no event taxonomy, analytics call, KPI persistence, dashboard, payload, consent, or reporting behavior changes.                                               | analytics scope rationale                | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no Stripe, checkout, price, entitlement, invoice, refund, payout, or revenue reporting behavior changes.                                                      | commerce scope rationale                 | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support workflow, recovery behavior, operator diagnostics, runbook procedure, or support escalation behavior.                   | explicit support-ops scope rationale     | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, invoice/refund path, payout, finance report, entitlement truth, reconciliation surface, or revenue operation.                 | explicit finance scope rationale         | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A: this changes no user-facing product strings, locale routing, translation workflow, metadata localization, or grammar-coupled UI layout.                              | explicit i18n scope rationale            | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Keep the refresh in Markdown lifecycle docs only; add no dependency, script, workflow, runtime component, provider integration, or architecture refactor.                 | changed-files diff                       | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed briefs pass strict brief lint, all-brief lint, targeted stale-lifecycle sweeps, diff whitespace check, docs-only `verify:pre-pr`, CI, and `verify:pre-merge`.     | validation commands + CI evidence        | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: accurate lifecycle state reduces future audit/restart cost; runtime cost, service calls, storage, jobs, polling, and traffic cost are unchanged.         | docs-only lifecycle scope                | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Diff remains docs-only with normal git revert rollback and no migration, secret, environment, package, workflow, or production setting changes.                           | git diff review + validation gates       | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - N/A; no route, component, server/client boundary, action/API route, cache mode, or rendering behavior changes.
- TypeScript/domain contracts:
  - N/A; no TypeScript type, parser, validation layer, error model, or deterministic product invariant changes.
- Supabase/data layer:
  - N/A; no migration, RLS/authz rule, generated DB type, index, storage, or data access behavior changes.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, SDK, webhook, secret, retry, or idempotency change.
- UI system:
  - N/A for rendered UI; screenshot handoff is not required because this PR changes no UI, print, layout, brand, asset, or product-rendering file.
- Testing:
  - Docs-only validation through strict brief lint, all-brief lint, targeted lifecycle sweeps, `git diff --check`, `verify:pre-pr`, CI, and `verify:pre-merge`.

## Data Placement And Sync Contract

N/A with rationale: this is a docs-only lifecycle refresh. It introduces no local-only state, server-canonical state, browser storage, sync trigger, conflict policy, cache invalidation, retention rule, or sensitive data handling.

## Identity And Rename Contract

N/A with rationale: this PR creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename/repurpose policy, alias, redirect, or compatibility mapping. Brief filenames remain repository lifecycle identifiers only.

## Forward Compatibility Contract

- Extensibility surfaces:
  - AW-006 lifecycle docs, design inventory row, planned Habits child brief, and future child-brief lifecycle references.
- Source of truth:
  - Completed Calendar Compare work must be linked from its `done` path and must not keep top-level status text that says it is active, in progress, or still awaiting a future polish brief.
- Additive behavior:
  - Future Habits/AW-006 slices can be selected from parent/queue without inheriting stale active Calendar references from completed PR `#999/#1000`.
- Explicit mapping requirements:
  - Any future Calendar, Habits, or broader AW-006 product/UI slice still requires owner selection, fresh re-audit, a scoped brief, scorecard mapping, Help/Guide impact decision, and screenshot handoff when visual files change.
- Unknown or deprecated values:
  - Unknown future lifecycle references fail safe as planning-only until a fresh queue/design/code re-audit selects the next slice.
- Test/evidence:
  - Targeted stale-lifecycle sweeps and brief lint prove this refresh is not hardcoded to a stale implementation state.

## Help / Guide Impact

N/A with rationale: this PR changes lifecycle docs only. It changes no user/admin workflow label, Help/Guide content, support recovery behavior, operator instruction, runbook procedure, auth, payments, or support path.

## Route / Label / Support Surface Sweep

Required as a task-brief lifecycle and AW-006 queue/design-inventory sweep.

- Identifiers to sweep before broad gates:
  - `Calendar Compare Findings Polish`
  - `2026-06-05-aw-006-calendar-compare-findings-polish-10-10`
  - `Active Calendar Compare polish`
  - `AW-006 active product/UI implementation`
  - `in-progress/2026-06-05-aw-006-calendar-compare-findings-polish`
  - `Calendar findings and numeric formatting remain a separate future brief`
  - `create a separate Calendar Findings Polish brief`
  - `main@69bddfc7`
  - `#999`
  - `#1000`
- Surfaces to check:
  - `docs/task-briefs/planned/2026-06-05-aw-006-habits-advanced-motivation-history-depth-10-10.md`
  - `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/done/2026-06-05-aw-006-calendar-compare-findings-polish-10-10.md`
- Expected fallout:
  - this active refresh brief,
  - planned Habits advanced brief audit wording,
  - canonical AW-006 queue audit/current-state wording,
  - design inventory Habits/Calendar intake row,
  - no product code, Help/Guide, support workflow, route label, rendered UI, screenshot, provider, test, script, config, or API changes.

## Scope

- Create this in-progress docs-only refresh brief.
- Update the planned Habits Advanced Motivation brief to reflect `main@bba59bfe` and completed Calendar Compare PR `#999/#1000`.
- Update the AW-006 canonical queue so Calendar Compare is `done`, no product/UI implementation slice is active, and Habits Advanced Motivation remains planned.
- Update the notice/empty-state design inventory so the Habits/Calendar intake row no longer says Calendar Compare is active.
- Keep the next product/UI implementation slice unselected.

## Out Of Scope

- Runtime app code, UI, CSS, product rendering, screenshots, routes, APIs, tests, scripts, configs, workflows, migrations, generated files, assets, external services, package changes, environment settings, or feature behavior.
- Choosing or implementing the Habits Advanced Motivation product/UI slice.
- Reopening Calendar Comparison Report copy, metric formatting, source-card layout, or screenshot decisions closed by PR `#999/#1000`.
- Supabase, Stripe, auth, analytics, database, commerce, finance, i18n, Help/Guide, support procedures, or merge to `main`.

## Acceptance Criteria

1. The planned Habits advanced brief audit record points to clean synced `main@bba59bfe` and marks Calendar Compare polish as separately done in `#999/#1000`.
2. The AW-006 queue states no product/UI implementation slice is active and lists Calendar Compare Findings Polish as `done`.
3. The design inventory no longer says `Active Calendar Compare polish`.
4. The active refresh brief is the only new in-progress lifecycle item in this docs-only diff.
5. Diff remains docs-only and does not touch runtime code, UI, tests, scripts, configs, workflows, generated files, provider behavior, screenshots, or assets.
6. `npm run lint:briefs`, `npm run lint:briefs:all`, targeted sweeps, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `npm run lint:briefs`
  - `npm run lint:briefs:all`
  - targeted route/label/support sweep listed above
  - `git diff --check`
- Broad gates:
  - `npm run verify:pre-pr`
  - required PR CI checks
  - `npm run verify:pre-merge`

Docs-only lane is expected while the diff stays limited to Markdown docs.

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands should use escalation-first strategy per repo instructions.

## Screenshot Handoff

N/A with rationale: this PR changes no UI, print, layout, brand, asset, product-rendering file, or browser-visible behavior. No screenshot handoff is required.

## Checkpoint Log

- `2026-06-06 | in-progress | started from clean synced main@bba59bfe after Calendar Compare Findings Polish PR #999 and repo-managed closeout PR #1000; post-merge preflight was green; fresh re-audit found stale Calendar-active/pre-closeout wording in the planned Habits advanced brief, AW-006 queue, and design inventory while no product/UI implementation slice is selected | next: repair docs-only lifecycle state, run targeted sweeps and docs-only validation, then open PR without selecting the Habits implementation slice`
- `2026-06-06 | in-progress | local docs refresh repaired the lifecycle state across the planned Habits brief, AW-006 queue, design inventory, and this active refresh brief; targeted validation passed: npm run lint:briefs, npm run lint:briefs:all, git diff --check, staged whitespace check, and stale Calendar-active sweep; npm run verify:pre-pr passed in docs-only lane with artifact artifacts/test-runs/20260606-092228/verify.log | next: rerun npm run verify:pre-pr on the final docs-only commit, push, open PR, monitor CI, and run npm run verify:pre-merge before merge-readiness summary`
- `2026-06-06 | done | merged PR #1001 as cb699087cef360361d3a7e312a31c3a4b8f6297e; post-merge preflight requested this repo-managed docs-only closeout | next: move brief to done, run closeout gates, open/merge the closeout PR, sync main, and rerun post-merge preflight`

## Completion Record

- `completed`: `2026-06-06`
- `merged_pr`: `#1001`
- `squash_commit`: `cb699087cef360361d3a7e312a31c3a4b8f6297e`
- `result`: Closed AW-006 Post-Calendar Habits Lifecycle Refresh. The AW-006 queue, planned Habits advanced brief, and design inventory now agree that Calendar Compare is done, no product/UI implementation slice is active, and Habits Advanced Motivation remains planned until explicitly selected.
- `validation`: `npm run lint:briefs`; `npm run lint:briefs:all`; targeted stale Calendar-active sweep; `git diff --check`; `npm run verify:pre-pr` PASS docs-only with `artifacts/test-runs/20260606-092342/verify.log`; PR #1001 CI PASS; `npm run verify:pre-merge` PASS docs-only with `artifacts/verify-pre-merge/20260606-072636.json`.
- `10/10 claim`: yes - all critical target categories reached `5/5`.

| Category                            | Achieved Score | Evidence                                                                                   | Gaps / Notes |
| ----------------------------------- | -------------- | ------------------------------------------------------------------------------------------ | ------------ |
| Product goals and IA                | `5/5`          | PR #1001 docs diff aligned AW-006 queue, design inventory, and planned Habits brief state. | None.        |
| Reliability and failure handling    | `5/5`          | Targeted stale Calendar-active sweep and docs-only gates passed.                           | None.        |
| Content governance                  | `5/5`          | Changed brief lint, all-brief lint, and PR #1001 review-ready docs lifecycle diff passed.  | None.        |
| Stack-fit and dependency discipline | `5/5`          | Diff stayed Markdown-only with no runtime, script, config, workflow, or dependency change. | None.        |
| Testing and QA automation           | `5/5`          | `verify:pre-pr`, PR CI, and `verify:pre-merge` passed in docs-only lane.                   | None.        |
| DevOps and rollback readiness       | `5/5`          | Branch was current with `origin/main`; rollback is a normal docs-only git revert.          | None.        |
