# Task Brief: Calendar Roadmap Reconcile After Provider Fixture (10/10)

## Metadata

- `id`: `2026-06-22-calendar-roadmap-reconcile-after-provider-fixture-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-22`
- `updated`: `2026-06-22`
- `mode`: `docs-only roadmap reconcile`
- `parent`: `docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`
- `training_history_parent`: `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- `branch`: `docs-calendar-roadmap-reconcile`

## Brief Audit Record

- `last_audited`: `2026-06-22`
- `base`: `main@77bf42d5`
- `audit_status`: `ready`
- `decision`: Execute a docs-only roadmap reconcile before selecting any new Calendar, provider, performance, or Perfect Day implementation slice.
- `reason`: `main` is clean and synced after Provider Evidence Fixture Import V1 and the provider roadmap refresh, but the Calendar parent still names Review Actual Editor V1 as the current next/in-progress child even though that child is merged and closed.
- `must_refresh_before_execution_if`: Refresh if Calendar parent scope, training-history parent scope, provider evidence briefs, Garmin blocked briefs, performance ratchet policy, Perfect Day product decision, scorecard categories, or verification lanes change before PR handoff.

## Goal

Make the Calendar and training-history roadmap truthful after Review Actual Editor V1 and Provider Evidence Fixture Import V1 shipped, while leaving the next product/runtime slice unselected.

## Pre-Implementation Owner Explanation

Vi rydder i veikartet, ikke i produktet. Det betyr at Calendar-briefen ikke lenger skal peke paa `Review actual` som aktivt neste steg naar den jobben allerede er ferdig, og at provider/Garmin-notater skal si tydelig hva som fortsatt er blokkert. Utenfor scope er runtime-kode, UI, screenshots, Garmin, provider-import, performance-ratchet, Perfect Day og `Ja.docx`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- Reliability and failure handling
- Content governance
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                 | Evidence                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Calendar parent must state that Review Actual Editor V1 and provider fixture import are done, no active child is selected, and the next slice requires owner decision.             | parent diff + active brief               | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: contributor planning flow becomes clearer; no user-facing product flow, loading, empty, error, retry, or route journey changes.                                   | docs diff                                | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this changes no rendered UI, CSS, visual token, asset, layout, print output, screenshot, or product surface.                                                           | explicit visual non-scope rationale      | `N/A`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because this docs-only reconcile changes no runtime state, persisted data, mutation, validation, domain invariant, checkout, entitlement, or business truth.                   | docs-only diff review                    | `N/A`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor surface, CRUD action, role behavior, recovery action, or operator workflow.                                                               | explicit admin non-scope rationale       | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no markup, focus behavior, keyboard path, labels, contrast, live region, or screen-reader semantics change.                                                            | explicit a11y non-scope rationale        | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no route, JavaScript payload, CSS, media asset, build output, cache behavior, or Core Web Vitals budget changes.                                                       | explicit performance non-scope rationale | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this introduces no local-only data, server-canonical data, browser storage, sync trigger, conflict policy, retention rule, or sensitive data flow.                     | explicit data non-scope rationale        | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, fetch cache, revalidation trigger, mutation response, CDN behavior, or stale-data contract changes.                                               | explicit cache non-scope rationale       | `N/A`                   |
| Reliability and failure handling              | `target`     | Targeted sweeps must show no stale active/in-progress Review Actual next-child reference remains in Calendar parent, and provider fixture blocker text must reflect shipped state. | targeted sweeps + brief lint             | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because no protected route, authz check, auth provider behavior, token handling, cookie, secret, or request input changes.                                                     | explicit security non-scope rationale    | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data, credentials, logs, analytics payload, legal copy, consent behavior, retention rule, or raw env value handling changes.                                   | explicit privacy non-scope rationale     | `N/A`                   |
| Content governance                            | `target`     | Active brief, Calendar parent, training-history parent, and Garmin blocked reference must agree on done child state and no selected runtime child.                                 | changed docs + route/label/support sweep | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow label, editable field, status transition, audit trail, Help/Guide action, or support procedure changes.                                              | explicit workflow non-scope rationale    | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no metadata, sitemap, robots, canonical URL, route content, structured public page content, or crawl-facing route changes.                                             | explicit SEO non-scope rationale         | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                                | explicit AI non-scope rationale          | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no event taxonomy, analytics call, KPI persistence, dashboard, payload, consent, or reporting behavior changes.                                                        | explicit analytics non-scope rationale   | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no Stripe, checkout, price, entitlement, invoice, refund, payout, or revenue reporting behavior changes.                                                               | explicit commerce non-scope rationale    | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support workflow, recovery behavior, operator diagnostics, runbook procedure, or support escalation behavior.                            | explicit support-ops scope rationale     | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                           | explicit finance scope rationale         | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A: this changes no user-facing product strings, locale routing, translation workflow, metadata localization, or grammar-coupled UI layout.                                       | explicit i18n scope rationale            | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Keep the reconcile in Markdown lifecycle docs only; add no dependency, script, workflow, runtime component, provider integration, or architecture refactor.                        | changed-files diff                       | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed briefs pass strict brief lint, all-brief lint, targeted stale-reference sweeps, diff whitespace checks, docs-only `verify:pre-pr`, CI, and `verify:pre-merge`.             | validation commands + CI evidence        | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: keeping the roadmap accurate reduces review/restart cost; runtime cost, service calls, storage, jobs, polling, and traffic-dependent cost are unchanged.          | docs-only lifecycle scope                | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Diff remains docs-only with normal git revert rollback and no migration, secret, environment, package, workflow, or production setting changes.                                    | git diff review + validation gates       | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - N/A; no route, component, server/client boundary, action/API route, cache mode, or rendering behavior changes.
- TypeScript/domain contracts:
  - N/A; no TypeScript type, parser, validation layer, error model, or deterministic product invariant changes.
- Supabase/data layer:
  - N/A; no migration, RLS/authz rule, generated DB type, index, storage, or data access behavior changes.
- External services/tools:
  - N/A; no Garmin/Strava/Apple/Health Connect runtime, OAuth, SDK, webhook, secret, retry, or idempotency change.
- UI system:
  - N/A for rendered UI; screenshot handoff is not required because this PR changes no UI, print, layout, brand, asset, or product-rendering file.
- Testing:
  - Docs-only validation through strict brief lint, all-brief lint, targeted lifecycle sweeps, `git diff --check`, `verify:pre-pr`, CI, and `verify:pre-merge`.

## Codex Skill / Stack Readiness Radar

Skill/capability audit:

- Available now: local shell tools, repo brief linting, docs-only verification lane, current session `playwright` skill if a future UI slice needs screenshots.
- Evaluate later: no new Codex skills/plugins are needed for this docs-only roadmap reconcile; future Garmin/provider work may require official-provider doc refresh after prerequisites exist.
- Install/config changes: none.

Systemic findings:

| Surface                | Finding                                                                                                | Severity | Recommended Type                 | Owner Decision Needed                 | Follow-Up Brief Path                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------ | -------- | -------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------ |
| Calendar roadmap       | Calendar parent still named a completed Review Actual child as the current next/in-progress step.      | `medium` | `safe process/docs update`       | `no`                                  | this brief                                                                                 |
| Provider runtime       | Real Garmin/provider reconciliation remains blocked despite schema and fixture proofs being done.      | `high`   | `deferred architecture decision` | `yes`; provider facts/prereqs missing | `docs/task-briefs/blocked/2026-06-21-garmin-activity-reconciliation-and-review-10-10.md`   |
| Performance governance | Next ratchet remains intentionally held until at least two new weekly green cycles after `2026-06-19`. | `info`   | `do not do`                      | `no`                                  | `docs/task-briefs/planned/2026-06-19-next-performance-budget-ratchet-maintenance-10-10.md` |

Return path:

- Parent: `docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`
- Training-history parent: `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- Last merged workstream: Provider Evidence Fixture Import V1 PR `#1209`, closeout PR `#1210`, roadmap refresh PR `#1211`.
- Current status after this slice: no active Calendar/provider/runtime child selected; owner must choose the next bounded product slice from clean `main`.

## Data Placement And Sync Contract

N/A with rationale: this is a docs-only roadmap reconcile. It introduces no local-only state, server-canonical state, browser storage, sync trigger, conflict policy, cache invalidation, retention rule, or sensitive data handling.

## Identity And Rename Contract

N/A with rationale: this PR creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename/repurpose policy, alias, redirect, or compatibility mapping. Brief filenames remain repository lifecycle identifiers only.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Calendar child roadmap, training-history child sequencing, provider blocked briefs, performance-ratchet planning, and future owner-selected product slices.
- Source of truth:
  - Completed child work should point to `done` briefs and merged PRs; active work should point to exactly one `in-progress` brief; blocked provider work should stay in `blocked`.
- Additive behavior:
  - Future Calendar, provider, Perfect Day, or performance slices can be selected without inheriting stale active-child references.
- Explicit mapping requirements:
  - Any future Calendar UI/runtime, provider runtime, Garmin/OAuth, Perfect Day, or performance-ratchet slice still requires its own owner-approved brief, scorecard mapping, and validation evidence.
- Unknown or deprecated values:
  - Unknown future roadmap references fail safe as planning-only until a fresh brief audit selects one bounded child.
- Test/evidence:
  - Targeted stale-reference sweeps and brief lint prove this repair is not hardcoded to the previous completed child only.

## Help / Guide Impact

N/A with rationale: this PR changes no user/admin workflow labels, Help/Guide content, support recovery behavior, operator instructions, or runbook procedure. Future implementation slices must update Help/Guide or runbooks when they change labels, workflows, recovery behavior, auth, payments, or support paths.

## Route / Label / Support Surface Sweep

Required as a task-brief lifecycle and roadmap sweep.

- Identifiers to sweep before broad gates:
  - `Review actual editor v1`
  - `docs/task-briefs/in-progress/2026-06-21-review-actual-editor-v1-10-10.md`
  - `Current Recommended Next Child`
  - `Next local actual editor child`
  - `manual_fixture write proof remains planned`
  - `Provider Evidence Fixture Import V1`
  - `Perfect Day`
  - `performance-ratchet`
- Surfaces to check:
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/task-briefs/done/`
  - `docs/task-briefs/blocked/`
- Expected fallout:
  - this active repair brief,
  - Calendar parent roadmap update,
  - Garmin blocked brief blocker/checkpoint correction,
  - no product code, Help/Guide, runbook, support workflow, route label, or rendered UI changes.

## Scope

- Create this in-progress docs-only roadmap reconcile brief.
- Update Calendar parent audit, current-roadmap status, child roadmap/dependencies, acceptance criteria, and checkpoint log.
- Correct stale provider blocker wording that still describes the provider fixture import proof as planned.
- Run targeted lifecycle sweeps and docs-only validation.

## Out Of Scope

- Runtime app code, UI, styles, layout, tests, scripts, configs, workflows, migrations, generated files, assets, screenshots, or product behavior.
- Choosing or implementing the next Calendar, provider, Perfect Day, performance, Garmin, or AI retrospective slice.
- Supabase, Stripe, auth, analytics, database, commerce, finance, i18n, Help/Guide, support procedures, or merge to `main`.
- Touching `Ja.docx`.

## Acceptance Criteria

1. Calendar parent no longer names Review Actual Editor V1 as the current next/in-progress child.
2. Calendar parent states that Review Actual Editor V1, Provider Evidence Schema Foundation V1, and Provider Evidence Fixture Import V1 are shipped.
3. Calendar parent states that no active Calendar/provider/runtime child is selected.
4. Garmin/provider blocked text reflects that provider fixture import proof is done while real Garmin/provider runtime remains blocked.
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

## Checkpoint Log

- `2026-06-22 | in-progress | started from clean synced main@77bf42d5 after Provider Evidence Fixture Import V1 PR #1209, closeout PR #1210, and roadmap refresh PR #1211; owner confirmed the docs-only roadmap reconcile after Codex identified stale Calendar parent references to Review Actual Editor V1 as current/in-progress | next: repair roadmap docs, run targeted sweeps and docs-only validation, then open PR without selecting the next product/runtime slice`
- `2026-06-22 | targeted validation | repaired Calendar parent roadmap status, provider blocked wording, and active docs-only reconcile brief; validation passed: npm run lint:briefs:all, git diff --check, git diff --cached --check, and targeted stale-reference sweeps for the old Review Actual in-progress path, Current Recommended Next Child, Next local actual editor child, and manual_fixture planned-proof wording; npm run lint:briefs ran but reported no changed task briefs in this lane, while all-brief lint covered the new in-progress brief | next: rerun final staged checks, run npm run verify:pre-pr, then commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
- `2026-06-22 | pre-pr gate | npm run verify:pre-pr passed the docs-only lane; branch-current confirmed docs-calendar-roadmap-reconcile contains origin/main@77bf42d5, changed files are the four Markdown docs/governance files, docs-only verify passed, quality-gate evidence passed with human sufficiency review notes for docs/provider keywords, and artifact log is artifacts/test-runs/20260622-164940/verify.log | next: rerun verify:pre-pr after this checkpoint update, then commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
