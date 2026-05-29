# Task Brief: AW-006 Phase Plan And Queue Reconcile (10/10)

## Metadata

- `id`: `2026-05-29-aw-006-phase-plan-and-queue-reconcile-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-29`
- `updated`: `2026-05-29`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `branch`: `docs/aw-006-phase-plan-queue-reconcile`

## Brief Audit Record

- `last_audited`: `2026-05-29`
- `base`: `main@dd06384`
- `audit_status`: `ready`
- `decision`: Execute a bounded docs-only reconciliation before selecting another AW-006 product/UI slice.
- `reason`: `main` is clean and synced after Course Install Prompt Token And Action Hierarchy Parity PR `#894` and repo-managed closeout PR `#895`; `npm run post-merge:preflight` is green. A fresh queue/design/code re-audit found that the canonical AW-006 review brief records Course desktop, Plans baseline, Public IA/About cleanup, Contextual sign-in, Contact/Analysis trust copy, and related follow-ups as shipped, but its phase plan still lists several of those same items as open.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, canonical queue format, task-brief lifecycle rules, phase-plan wording, closeout rules, forward-compatibility rules, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Make the AW-006 canonical queue and phase plan internally consistent so future AW-006 slices start from current repo truth instead of stale review bullets.

## Pre-Implementation Owner Explanation

Jeg rydder AW-006-planen slik at ferdig arbeid ikke står som åpent, og slik at neste produktjobb velges fra en oppdatert kø. Det betyr mindre risiko for dobbeltarbeid og feil prioritering. Utenfor scope er visuelle endringer, runtime-kode, betaling, auth, API-er og ny produktprioritering.

Fremoverkompatibilitet: framtidige AW-006-tillegg skal enten falle naturlig inn i én oppdatert kø, eller kreve eksplisitt re-audit før de blir valgt.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Reliability and failure handling`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                   | Evidence                                              | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The canonical AW-006 queue must identify this docs-only reconcile as the active slice and remove stale open-status implications for already shipped work.            | queue diff + active brief                             | `5/5`                   |
| UX flow clarity                               | `target`     | The phase plan must distinguish shipped baseline work from still-future product slices so the next owner decision is based on current scope, not stale review text.  | phase-plan diff + route/label/support sweep           | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: this reconciles visual-review planning status but changes no rendered UI, CSS, screenshots, layout, print output, or brand asset.                   | docs-only diff review                                 | `4/5`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because this Markdown-only reconcile changes no runtime state, persisted data, mutation, validation, business invariant, checkout, entitlement, or domain truth. | docs-only diff review                                 | `N/A`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor surface, CRUD action, role behavior, workflow label, Help/Guide action, or operator procedure.                              | admin scope rationale                                 | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no markup, focus behavior, keyboard path, label, contrast, live region, or screen-reader semantic changes.                                               | a11y scope rationale                                  | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no route, JavaScript payload, CSS, media asset, build output, cache behavior, or Core Web Vitals budget changes.                                         | performance scope rationale                           | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this introduces no local-only data, server-canonical data, browser storage, sync policy, cache mutation, retention rule, or sensitive data flow.         | data scope rationale                                  | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no fetch path, route cache mode, revalidation trigger, mutation response, CDN behavior, or stale-data contract changes.                                  | cache scope rationale                                 | `N/A`                   |
| Reliability and failure handling              | `target`     | Future AW-006 work must no longer be routed toward completed Course, Plans, Public IA, auth, or contact cleanup bullets that were already shipped.                   | targeted stale-open sweep + canonical queue diff      | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because this changes no protected route, authz check, auth provider behavior, token handling, cookie, secret, or request input.                                  | security scope rationale                              | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because this stores no user data, credentials, logs, analytics payload, legal copy, consent behavior, retention rule, or raw environment value.                  | privacy scope rationale                               | `N/A`                   |
| Content governance                            | `target`     | The AW-006 review brief, active brief, shipped-slice table, and phase plan must agree on lifecycle state for completed follow-ups through PR `#895`.                 | docs diff + brief lint                                | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow label, editable field, status transition, audit trail, recovery path, Help/Guide assertion, or support procedure changes.              | workflow scope rationale                              | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no metadata, sitemap, robots, canonical URL, public route content, structured data, or crawl-facing behavior changes.                                    | SEO scope rationale                                   | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                  | AI-discoverability scope rationale                    | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: the phase plan records analytics follow-ups already shipped, but this PR changes no event taxonomy, payload, logging, dashboard, or KPI.            | phase-plan diff                                       | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: Plans and checkout-expectation work is reconciled as shipped baseline work; no Stripe, pricing, entitlement, invoice, payout, or report changes.    | queue/phase-plan wording                              | `4/5`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support workflow, recovery behavior, operator diagnostics, runbook procedure, or support escalation behavior.              | explicit support-ops scope rationale                  | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.             | explicit finance scope rationale                      | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A: this changes no user-facing product strings, locale routing, translation workflow, metadata localization, or grammar-coupled UI layout.                         | explicit i18n scope rationale                         | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Keep the reconcile in Markdown task-brief docs only; add no dependency, script, workflow, runtime component, provider integration, or architecture refactor.         | changed-files diff                                    | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed briefs pass strict brief lint, all-brief lint, targeted stale-status sweep, diff whitespace check, docs-only pre-PR, required CI, and docs-only pre-merge.   | local validation + CI evidence                        | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: an accurate phase plan reduces future audit/restart cost; runtime cost and infrastructure remain unchanged.                                         | PR-sized docs-only scope                              | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Diff remains docs-only with normal git revert rollback and no migration, secret, environment, package, workflow, production setting, or runtime deploy change.       | git diff review + verification gates + PR CI evidence | `5/5`                   |

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
  - Future UI slices must still identify their reference surface and pause for screenshot approval before `npm run verify:pre-pr`.
- Testing:
  - Docs-only validation through strict brief lint, all-brief lint, targeted stale-status sweep, `git diff --check`, `verify:pre-pr`, CI, and `verify:pre-merge`.

## Data Placement And Sync Contract

N/A with rationale: this is a docs-only queue and phase-plan reconcile. It introduces no local-only state, server-canonical state, browser storage, sync trigger, conflict policy, cache invalidation, retention rule, or sensitive data handling.

## Identity And Rename Contract

N/A with rationale: this PR creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename/repurpose policy, alias, redirect, or compatibility mapping. Brief filenames remain repository lifecycle identifiers only.

## Forward Compatibility Contract

- Extensibility surfaces:
  - AW-006 child briefs, canonical queue rows, shipped-slice evidence, phase-plan bullets, and future review-capture docs.
- Source of truth:
  - The canonical AW-006 queue and linked done briefs remain the source of truth for shipped follow-up status.
- Additive behavior:
  - Future AW-006 follow-ups should update both the shipped/remaining table and any matching phase-plan bullet when they close the corresponding review item.
- Explicit mapping requirements:
  - New product/UI slices still require a fresh queue/design/code re-audit before being selected.
  - New broad phase-plan categories require an owner decision before they are treated as active implementation scope.
- Unknown or deprecated values:
  - Stale, ambiguous, or duplicate phase-plan bullets should be treated as planning risk and reconciled before implementation starts.
- Test/evidence:
  - Targeted AW-006 stale-status sweep plus `npm run lint:briefs:all`, docs-only `verify:pre-pr`, CI, and docs-only `verify:pre-merge`.

## Help / Guide Impact

N/A with rationale: this PR changes lifecycle docs only. It changes no user/admin workflow label, Help/Guide content, support recovery behavior, operator instruction, or runbook procedure.

## Route / Label / Support Surface Sweep

Required as a task-brief lifecycle and AW-006 queue/phase-plan sweep.

- Identifiers to sweep before broad gates:
  - `AW-006`
  - `Phase Plan`
  - `Improve course desktop first viewport`
  - `Improve plans price/value/trust/expectation copy`
  - `Clarify /about`
  - `Contextual sign-in`
  - `Contact and analysis trust copy`
  - `Active AW-006 implementation slice`
  - `Course Install Prompt Token And Action Hierarchy Parity`
  - `#894`
  - `#895`
- Surfaces to check:
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/task-briefs/done/`
  - `docs/design/`
  - `docs/runbooks/`
- Expected fallout:
  - this active brief,
  - canonical AW-006 review/queue brief,
  - no product code, Help/Guide, support workflow, route label, rendered UI, screenshot, provider, or API changes.
- Sweep evidence:
  - `2026-05-29`: targeted AW-006 route/label/support sweep confirmed the active row now points only at this docs-only reconcile, shipped rows still retain their done evidence, and the reconciled phase-plan bullets for course desktop, plans copy, and `/about` now include `Status: done`.
  - Historical checkpoint-log references to the previous Course Install Prompt slice and done-brief references are expected evidence, not active product scope.

## Scope

- Create this in-progress docs-only reconcile brief.
- Update the canonical AW-006 review/queue brief audit record to current base.
- Mark the current docs-only reconcile as the active AW-006 slice.
- Reconcile the phase plan so already shipped Course desktop, Plans baseline, Public IA/About cleanup, Contextual sign-in, Contact/Analysis trust copy, post-purchase recovery, analytics, and sample/proof work no longer read as open.
- Keep future product/UI decisions unselected until the next fresh re-audit.

## Out Of Scope

- Runtime app code, UI, CSS, product rendering, screenshots, routes, APIs, migrations, generated files, assets, external services, package changes, workflows, environment settings, or feature behavior.
- Choosing or implementing the next AW-006 product/UI slice after this docs-only reconcile.
- Stripe Checkout, prices, subscriptions/packages, entitlements, invoices, refunds, payouts, or reporting.
- Supabase, auth, analytics taxonomy, database, commerce, finance, i18n, Help/Guide, support procedures, or merge to `main`.

## Acceptance Criteria

1. The canonical AW-006 queue records this docs-only reconcile as the active slice.
2. The phase plan no longer presents already shipped Course desktop, Plans baseline/comparison/expectation, Public IA/About cleanup, Contextual sign-in, Contact/Analysis trust copy, post-purchase recovery, analytics, and sample/proof work as unqualified open items.
3. Any still-future AW-006 items remain clearly future-slice material and do not become active implementation scope.
4. Diff remains docs-only and does not touch runtime code, UI, tests, scripts, configs, workflows, generated files, provider behavior, screenshots, or assets.
5. `npm run lint:briefs`, `npm run lint:briefs:all`, targeted sweeps, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

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

- `2026-05-29 | in-progress | started from clean main@dd06384 after PR #894 and repo-managed closeout #895; post-merge preflight was green; owner approved AW-006 Phase Plan And Queue Reconcile after a fresh queue/design/code re-audit found stale phase-plan bullets for already shipped work | next: update canonical queue/phase-plan, run docs-only validation, then commit/push/PR`
- `2026-05-29 | in-progress | created this active docs-only brief, updated the canonical AW-006 queue/phase-plan, fixed an over-specific active-row note that npm run lint:briefs:all correctly flagged as a stale active reference to completed briefs, then passed npm run lint:briefs:all, targeted route/label/support sweep, and git diff --check | next: stage the docs-only diff, run changed-brief lint plus npm run verify:pre-pr, then commit/push/PR`
- `2026-05-29 | pre-pr-gate | npm run verify:pre-pr passed the docs-only lane on the staged docs-only diff, then passed again after adding checkpoint evidence; evidence logs: artifacts/test-runs/20260529-140903/verify.log and artifacts/test-runs/20260529-140922/verify.log | next: commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
