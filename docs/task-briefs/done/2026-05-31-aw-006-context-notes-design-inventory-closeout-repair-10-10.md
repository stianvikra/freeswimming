# Task Brief: AW-006 Context Notes Design Inventory Closeout Repair (10/10)

## Metadata

- `id`: `2026-05-31-aw-006-context-notes-design-inventory-closeout-repair-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-31`
- `updated`: `2026-05-31`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `docs/aw-006-context-notes-inventory-closeout-repair`

## Brief Audit Record

- `last_audited`: `2026-05-31`
- `base`: `main@f7225e5`
- `audit_status`: `ready`
- `decision`: Execute a bounded docs-only lifecycle repair before selecting the next AW-006 product/UI slice.
- `reason`: `main` is clean and synced after Admin Context Notes Panel Token/Action Parity PR `#914` and repo-managed closeout PR `#915`; `npm run post-merge:preflight` passed with no closeout remaining. A fresh queue/design/code re-audit found the canonical AW-006 queue says no active slice is selected, but the notice/empty-state inventory still points to the moved Context Notes token/action brief as `Active:` under its old `in-progress` path.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, canonical queue format, design inventory format, task-brief lifecycle rules, route/label/support sweep rules, or verification lanes change before PR handoff.

## Goal

Repair the stale AW-006 design-inventory active reference so the queue and inventory agree that Admin Context Notes Panel Token/Action Parity is done and no next AW-006 slice is selected.

## Pre-Implementation Owner Explanation

Jeg rydder én gammel peker i design-inventaret som fortsatt sier at Context Notes-jobben er aktiv, selv om den er merget og lukket. Det betyr at neste AW-006-jobb starter fra riktig køstatus. Utenfor scope er app-kode, UI, screenshots, API-er, data, auth, betaling, Help/Guide, supportprosedyrer og valg av ny produkt-slice.

Fremoverkompatibilitet: framtidige AW-006-slices skal fortsatt kreve fersk re-audit; denne reparasjonen sørger bare for at dagens kilde ikke peker på en ferdig `in-progress`-brief.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `Reliability and failure handling`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                       | Evidence                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | AW-006 canonical queue and design inventory must agree that no active implementation slice is selected after `#914/#915`.                                | queue/inventory diff + targeted stale sweep        | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: lifecycle status becomes clearer for contributors, but no user/admin product flow changes.                                              | docs diff review                                   | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this changes no rendered UI, CSS, visual tokens, screenshots, layout, print, or brand assets.                                                | visual scope rationale                             | `N/A`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because this Markdown-only repair changes no runtime state, persisted data, mutation, validation, checkout, entitlement, or domain invariant.        | docs-only scope rationale                          | `N/A`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor surface, CRUD action, role behavior, workflow label, Help/Guide action, or operator procedure.                  | admin scope rationale                              | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no markup, focus behavior, keyboard path, label, contrast, live region, or screen-reader semantic changes.                                   | a11y scope rationale                               | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no route, JavaScript payload, CSS, media asset, build output, cache behavior, or Core Web Vitals budget changes.                             | performance scope rationale                        | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this introduces no local-only data, server-canonical data, browser storage, sync policy, conflict rule, cache invalidation, or retention.    | data scope rationale                               | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no fetch path, route cache mode, revalidation trigger, CDN behavior, or stale-data contract changes.                                         | cache scope rationale                              | `N/A`                   |
| Reliability and failure handling              | `target`     | Future AW-006 work must not be routed by the design inventory to a completed Context Notes active slice or missing `in-progress` brief path.             | targeted stale-reference sweep + brief lint        | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because no protected route, authz check, auth provider behavior, token, cookie, secret, or request input changes.                                    | security scope rationale                           | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data, logs, analytics payload, legal copy, consent behavior, retention rule, or raw environment value changes.                       | privacy scope rationale                            | `N/A`                   |
| Content governance                            | `target`     | The design inventory must name the completed Context Notes token/action parity brief as done, matching the canonical queue and done brief.               | docs diff + route/label/support sweep              | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow label, editable field, status transition, audit trail, recovery path, Help/Guide assertion, or support procedure changes.  | workflow scope rationale                           | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no metadata, sitemap, robots, canonical URL, public route content, structured data, or crawl-facing behavior changes.                        | SEO scope rationale                                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                      | AI-discoverability scope rationale                 | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no event taxonomy, persistence, dashboard metric, logging payload, or KPI threshold changes.                                                 | analytics scope rationale                          | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no Stripe, checkout, entitlement, catalog, pricing, invoice, refund, payout, or revenue data changes.                                        | commerce scope rationale                           | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support workflow, recovery behavior, operator diagnostics, runbook procedure, or escalation behavior.          | explicit support-ops scope rationale               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data. | explicit finance scope rationale                   | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A: this changes no user-facing product strings, locale routing, translation workflow, metadata localization, or grammar-coupled UI layout.             | explicit i18n scope rationale                      | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Keep the repair in Markdown lifecycle docs only; add no dependency, script, workflow, runtime component, provider integration, or architecture refactor. | changed-files diff                                 | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed briefs pass strict brief lint, all-brief lint, targeted stale-reference sweep, diff whitespace check, docs-only pre-PR, CI, and pre-merge.       | local validation + CI evidence                     | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: accurate lifecycle docs reduce future audit cost; runtime cost and infrastructure remain unchanged.                                     | PR-sized docs-only scope                           | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Diff remains docs-only with normal git revert rollback and no migration, secret, environment, package, workflow, or production setting changes.          | git diff review + verification gates + PR evidence | `5/5`                   |

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
  - Docs-only validation through strict brief lint, all-brief lint, targeted stale-reference sweep, `git diff --check`, docs-only `verify:pre-pr`, required CI, and docs-only `verify:pre-merge`.

## Data Placement And Sync Contract

N/A with rationale: this is a docs-only lifecycle repair. It introduces no local-only state, server-canonical state, browser storage, sync trigger, conflict policy, cache invalidation, retention rule, or sensitive data handling.

## Identity And Rename Contract

N/A with rationale: this PR creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename/repurpose policy, alias, redirect, or compatibility mapping. Brief filenames remain repository lifecycle identifiers only.

## Forward Compatibility Contract

- Extensibility surfaces:
  - AW-006 child briefs, canonical queue rows, design-inventory rows, and closeout evidence.
- Source of truth:
  - The canonical AW-006 queue and linked done briefs remain the source of truth for shipped follow-up status.
- Additive behavior:
  - Future AW-006 follow-ups should update both the queue and design inventory when they close an inventory row.
- Explicit mapping requirements:
  - New product/UI slices still require a fresh queue/design/code re-audit before being selected.
  - New broad phase-plan categories require an owner decision before they are active implementation scope.
- Unknown or deprecated values:
  - Stale, ambiguous, missing, or duplicate active references should be treated as planning risk and reconciled before implementation starts.
- Test/evidence:
  - Targeted stale-reference sweep plus `npm run lint:briefs`, `npm run lint:briefs:all`, docs-only `verify:pre-pr`, CI, and docs-only `verify:pre-merge`.

## Help / Guide Impact

N/A with rationale: this PR changes lifecycle docs only. It changes no user/admin workflow label, Help/Guide content, support recovery behavior, operator instruction, or runbook procedure.

## Route / Label / Support Surface Sweep

Required as a task-brief lifecycle and AW-006 queue/design-inventory sweep.

- Identifiers to sweep before broad gates:
  - `Admin Context Notes Panel Token/Action Parity`
  - `docs/task-briefs/in-progress/2026-05-31-aw-006-admin-context-notes-panel-token-action-parity-10-10.md`
  - `Active:`
  - `AW-006 implementation queue state`
  - `notice-empty-state-pattern-inventory`
- Surfaces to check:
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/task-briefs/done/`
  - `docs/design/`
- Expected fallout:
  - this active repair brief,
  - canonical AW-006 queue audit record,
  - notice/empty-state inventory update,
  - no product code, Help/Guide, runbook, support workflow, route label, or rendered UI changes.

## Scope

- Create this in-progress docs-only repair brief.
- Update the canonical AW-006 queue audit record to current `main@f7225e5` closeout truth.
- Update the notice/empty-state inventory so Context Notes Token/Action Parity is done through PR `#914/#915` and no longer points to the old `in-progress` brief as active.
- Run targeted lifecycle sweeps and docs-only validation.

## Out Of Scope

- Runtime app code, UI, styles, layout, tests, scripts, configs, workflows, migrations, generated files, assets, screenshots, or product behavior.
- Choosing or implementing the next AW-006 product/UI slice.
- Broad app-wide Notice/EmptyState primitives.
- Supabase, Stripe, auth, analytics, database, commerce, finance, i18n, Help/Guide, support procedures, or merge to `main`.

## Acceptance Criteria

1. The design inventory records Admin Context Notes Panel Token/Action Parity as done through PR `#914/#915`.
2. No queue or inventory text marks the completed Context Notes token/action slice as current/active or points to its old `in-progress` path as the active implementation brief.
3. The canonical queue audit record reflects `main@f7225e5` after closeout PR `#915`.
4. Diff remains docs-only and does not touch runtime code, UI, tests, scripts, configs, workflows, generated files, provider behavior, screenshots, or assets.
5. `npm run lint:briefs`, `npm run lint:briefs:all`, targeted sweeps, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `npm run lint:briefs:all` -> PASS, 395 brief files.
  - targeted route/label/support sweep listed above -> PASS for queue/inventory surfaces; no stale `Active:` or old `in-progress` Context Notes token/action path remains in the canonical queue or design inventory.
  - `git diff --check` and `git diff --cached --check` -> PASS.
  - `npm run post-merge:preflight` on the feature branch -> expected branch warning only; no pending closeout detected from the current commit snapshot.
  - `npm run lint:briefs` before the first commit skipped because the script compares `origin/main...HEAD`; rerun after the first commit before PR handoff.
- Broad gates:
  - `npm run verify:pre-pr` -> PASS after final evidence commit, docs-only lane, artifact log `artifacts/test-runs/20260531-093653/verify.log`, exit code `0`.
  - required PR `#916` CI checks -> PASS.
  - `npm run verify:pre-merge` -> PASS, docs-only lane, marker `artifacts/verify-pre-merge/20260531-073943.json`, exit code `0`.

Docs-only lane is expected while the diff stays limited to Markdown docs.

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands should use escalation-first strategy per repo instructions.

## Screenshot Handoff

N/A with rationale: this PR changes no UI, print, layout, brand, asset, product-rendering file, or browser-visible behavior. No screenshot handoff is required.

## Checkpoint Log

- `2026-05-31 | in-progress | started from clean main@f7225e5 after PR #914 and closeout PR #915; post-merge preflight passed with no pending closeout; owner approved a docs-only AW-006 Context Notes design-inventory closeout repair after fresh queue/design/code re-audit found a stale Active reference to the moved Context Notes token/action brief | next: update queue/inventory docs, run docs-only validation, then commit/push/PR`
- `2026-05-31 | targeted validation | updated the canonical AW-006 queue audit base and design inventory Context Notes row, created this active docs-only repair brief, and passed all-brief lint, queue/inventory stale-reference sweep, diff whitespace checks, and feature-branch post-merge-preflight smoke | next: commit, run npm run lint:briefs and npm run verify:pre-pr against the committed docs-only diff, then push/open PR`
- `2026-05-31 | pre-PR validation | committed the docs-only repair as f9f12a5; npm run lint:briefs passed on the committed changed briefs; npm run verify:pre-pr passed the docs-only lane with artifact log artifacts/test-runs/20260531-093542/verify.log; no screenshot handoff required because no UI, print, layout, brand, asset, or product-rendering files changed | next: commit validation evidence, push, open PR, monitor CI, then run npm run verify:pre-merge before merge-readiness summary`
- `2026-05-31 | merge-ready | final branch commit 0734ff5; reran npm run verify:pre-pr after the evidence commit and passed docs-only lane with artifact log artifacts/test-runs/20260531-093653/verify.log; PR #916 CI passed; npm run verify:pre-merge passed with marker artifacts/verify-pre-merge/20260531-073943.json; owner approved merge and PR #916 merged to main as squash commit 32b74e2 | next: complete repo-managed docs-only closeout`

## Completion Record

- `completed`: `2026-05-31`
- `merged_pr`: `#916`
- `squash_commit`: `32b74e2`
- `result`: Closed AW-006 Context Notes Design Inventory Closeout Repair. The AW-006 queue and notice/empty-state inventory now agree that Context Notes token/action parity is done and no active implementation slice is selected.
- `validation`: `npm run verify:pre-pr` PASS on docs-only lane (`artifacts/test-runs/20260531-093653/verify.log`); PR `#916` CI PASS; `npm run verify:pre-merge` PASS (`artifacts/verify-pre-merge/20260531-073943.json`).
- `10/10 claim`: yes - all critical target categories reached `5/5`.

| Category                            | Achieved Score | Evidence                                                                                                                                                   | Gaps / Notes |
| ----------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                | `5/5`          | Queue/design-inventory diff plus PR `#916` merge evidence.                                                                                                 | No gaps.     |
| Reliability and failure handling    | `5/5`          | Targeted stale-reference sweep, docs-only `verify:pre-pr`, PR CI, and `verify:pre-merge`.                                                                  | No gaps.     |
| Content governance                  | `5/5`          | Done brief path, completion record, and corrected design inventory status for PR `#914/#915`.                                                              | No gaps.     |
| Stack-fit and dependency discipline | `5/5`          | Diff stayed in Markdown docs only; no runtime, scripts, config, workflow, dependency, or provider changes.                                                 | No gaps.     |
| Testing and QA automation           | `5/5`          | `npm run lint:briefs`, `npm run lint:briefs:all`, targeted sweeps, `git diff --check`, docs-only `verify:pre-pr`, PR CI, and docs-only `verify:pre-merge`. | No gaps.     |
| DevOps and rollback readiness       | `5/5`          | PR `#916` merged as squash commit `32b74e2`; rollback is a normal docs-only revert.                                                                        | No gaps.     |
