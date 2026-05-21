# Task Brief: AW-006 Post-Closeout Queue Design Inventory Repair (10/10)

## Metadata

- `id`: `2026-05-20-aw-006-post-closeout-queue-design-inventory-repair-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-20`
- `updated`: `2026-05-20`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `preceded_by`: `docs/task-briefs/done/2026-05-20-aw-006-admin-context-notes-panel-state-primitive-parity-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `docs/aw-006-post-closeout-queue-repair`

## Brief Audit Record

- `last_audited`: `2026-05-20`
- `base`: `main@f45ac94`
- `audit_status`: `ready`
- `decision`: Execute a docs-only lifecycle repair before selecting the next AW-006 UI implementation slice.
- `reason`: `main` is clean after Admin Context Notes Panel State Primitive Parity PR `#786` and repo-managed closeout PR `#787`; `npm run post-merge:preflight` reports no pending closeout. A short queue/design-inventory audit found stale lifecycle text: the canonical AW-006 queue still lists the completed Context Notes slice as `active`, the notice/empty-state inventory still calls Context Notes the current slice and links to its old `in-progress` path, and the moved done brief still has `status: in-progress` metadata.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, task-brief lifecycle rules, canonical queue format, notice/empty-state inventory, post-merge preflight, `lint:briefs`, or verification lanes change before PR handoff.

## Goal

Repair the AW-006 queue, design inventory, and completed Context Notes brief metadata so the repo no longer presents a finished slice as active before the next UI slice is chosen.

## Pre-Implementation Owner Explanation

Dette er en liten ryddejobb i arbeidslisten. Vi retter dokumentasjonen slik at den ikke sier at en ferdig jobb fortsatt er aktiv. Det betyr noe fordi neste UX/UI-slice ellers kan startes fra feil premiss. Utenfor scope er UI, kode, screenshots, API, database, auth, Stripe, analytics og valg av neste produkt-slice.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `Reliability and failure handling`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                         | Evidence                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | AW-006 queue must mark Context Notes done, remove the stale active UI row, and state that no next UI slice is selected until a fresh re-audit.                             | queue diff + active repair brief         | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: contributor flow becomes clearer; no user-facing product flow changes.                                                                                    | queue checkpoint review                  | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this changes no rendered UI, visual design, layout, style, asset, screenshot, or product surface.                                                              | visual scope rationale                   | `N/A`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because this docs-only repair changes no runtime state, persisted data, mutation, validation, domain invariant, checkout, entitlement, or business truth.              | docs-only diff review                    | `N/A`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor surface, CRUD action, recovery action, role behavior, or operator workflow.                                                       | admin scope rationale                    | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no markup, focus behavior, keyboard path, labels, contrast, live region, or screen-reader semantics change.                                                    | a11y scope rationale                     | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no route, JavaScript payload, CSS, media asset, build output, cache behavior, or Core Web Vitals budget changes.                                               | performance scope rationale              | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this introduces no local-only data, server-canonical data, browser storage, sync, conflict policy, retention rule, or sensitive data flow.                     | data scope rationale                     | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, fetch cache, revalidation trigger, mutation response, CDN behavior, or stale-data contract changes.                                       | cache scope rationale                    | `N/A`                   |
| Reliability and failure handling              | `target`     | The repo-backed queue and inventory must no longer route future work to a completed active Context Notes slice.                                                            | targeted sweeps + brief lint             | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because no protected route, authz check, auth provider behavior, token handling, cookie, secret, or request input changes.                                             | security scope rationale                 | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data, credentials, logs, analytics payload, legal copy, consent behavior, retention rule, or raw env value handling changes.                           | privacy scope rationale                  | `N/A`                   |
| Content governance                            | `target`     | Canonical queue, notice/empty-state inventory, and completed Context Notes brief metadata must agree on the same lifecycle state.                                          | changed docs + route/label/support sweep | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow label, editable field, status transition, audit trail, Help/Guide action, or support procedure changes.                                      | workflow scope rationale                 | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no metadata, sitemap, robots, canonical URL, route content, structured public page content, or crawl-facing route changes.                                     | SEO scope rationale                      | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                        | AI-discoverability scope rationale       | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no event taxonomy, analytics call, KPI persistence, dashboard, payload, consent, or reporting behavior changes.                                                | analytics scope rationale                | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no Stripe, checkout, price, entitlement, invoice, refund, payout, or revenue reporting behavior changes.                                                       | commerce scope rationale                 | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support workflow, recovery behavior, operator diagnostics, runbook procedure, or support escalation behavior.                    | explicit support-ops scope rationale     | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                   | explicit finance scope rationale         | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A: this changes no user-facing product strings, locale routing, translation workflow, metadata localization, or grammar-coupled UI layout.                               | explicit i18n scope rationale            | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Keep the repair in Markdown lifecycle docs only; add no dependency, script, workflow, runtime component, provider integration, or architecture refactor.                   | changed-files diff                       | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed briefs pass strict brief lint, all-brief lint, targeted lifecycle sweeps, diff whitespace checks, docs-only `verify:pre-pr`, CI, and docs-only `verify:pre-merge`. | validation commands + CI evidence        | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: keeping the queue accurate reduces review and restart cost; runtime cost is unchanged.                                                                    | PR-sized lifecycle repair scope          | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Diff remains docs-only with normal git revert rollback and no migration, secret, environment, package, workflow, or production setting changes.                            | git diff review + validation gates       | `5/5`                   |

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

N/A with rationale: this is a docs-only lifecycle repair. It introduces no local-only state, server-canonical state, browser storage, sync trigger, conflict policy, cache invalidation, retention rule, or sensitive data handling.

## Identity And Rename Contract

N/A with rationale: this PR creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename/repurpose policy, alias, redirect, or compatibility mapping. Brief filenames remain repository lifecycle identifiers only.

## Help / Guide Impact

N/A with rationale: this PR changes no user/admin workflow labels, Help/Guide content, support recovery behavior, operator instructions, or runbook procedure. Future AW-006 implementation slices must update Help/Guide or runbooks when they change labels, workflows, recovery behavior, auth, payments, or support paths.

## Route / Label / Support Surface Sweep

Required as a task-brief lifecycle and AW-006 queue/design-inventory sweep.

- Identifiers to sweep before broad gates:
  - `Admin Context Notes Panel state parity`
  - `Admin Context Notes Panel state primitive parity`
  - `docs/task-briefs/in-progress/2026-05-20-aw-006-admin-context-notes-panel-state-primitive-parity-10-10.md`
  - `Current Admin Context Notes Panel State Parity Slice`
  - `Status: \`active\``
  - `active`
  - `in-progress`
  - `Remaining PR-Sized UX/UI Slices`
  - `notice-empty-state-pattern-inventory`
- Surfaces to check:
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/task-briefs/done/`
  - `docs/design/`
- Expected fallout:
  - this active repair brief,
  - canonical AW-006 queue update,
  - notice/empty-state inventory update,
  - completed Context Notes brief metadata/closeout update,
  - no product code, Help/Guide, runbook, support workflow, route label, or rendered UI changes.
- Sweep evidence:
  - `2026-05-20`: targeted stale-reference sweep found no active Context Notes table row, no old Context Notes in-progress active path, no stale "Current Admin Context Notes Panel State Parity Slice" heading, and no `status: in-progress` metadata in the moved done brief.
  - `2026-05-20`: targeted positive sweep confirmed the queue says no active AW-006 UI implementation slice is selected, the inventory says no current state-primitive candidate is selected, and the Context Notes done brief has `status: done` plus `## Completion Record`.

## Scope

- Create this in-progress docs-only repair brief.
- Update the canonical AW-006 queue so Context Notes is done through `#786/#787`, stale `active` Context Notes rows are removed, and the next UI slice remains unselected pending re-audit.
- Update the notice/empty-state inventory so Context Notes is completed and no current state-primitive implementation candidate is selected.
- Update the completed Context Notes brief metadata and closeout evidence so it no longer describes itself as `in-progress`.
- Run targeted lifecycle sweeps and docs-only validation.

## Out Of Scope

- Runtime app code, UI, styles, layout, tests, scripts, configs, workflows, migrations, generated files, assets, screenshots, or product behavior.
- Choosing or implementing the next AW-006 UI/product slice.
- Admin Content Manager recovery states.
- Broad app-wide Notice/EmptyState primitives.
- Supabase, Stripe, auth, analytics, database, commerce, finance, i18n, Help/Guide, support procedures, or merge to `main`.

## Acceptance Criteria

1. Context Notes is recorded as done through `#786/#787` in the canonical AW-006 queue.
2. No queue or inventory text marks the completed Context Notes slice as current/active or points to its old `in-progress` path as the active implementation brief.
3. The Context Notes done brief metadata says `status: done` and includes closeout evidence for PR `#786/#787`.
4. The queue says no next AW-006 UI slice is selected until a fresh re-audit.
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

- `2026-05-20 | in-progress | started from clean main@f45ac94 after PR #786 and repo-managed closeout PR #787; post-merge preflight found no pending closeout; short re-audit found stale active/current Context Notes lifecycle references in the canonical queue and notice/empty-state inventory plus stale done-brief metadata | next: repair docs-only lifecycle state, run targeted sweeps and docs-only validation, then open PR without selecting the next UI slice`
- `2026-05-20 | in-progress | repaired the canonical queue, notice/empty-state inventory, and Context Notes done-brief metadata/closeout record; validation passed for npm run lint:briefs:all, targeted stale-reference and positive sweeps, git diff --check, staged git diff --check, and npm run lint:briefs reported no changed tracked brief set to lint before commit | next: run npm run verify:pre-pr, commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
- `2026-05-20 | pre-pr-gate | npm run verify:pre-pr passed the docs-only lane for the four Markdown files, then passed again after checkpoint evidence was added; evidence logs include artifacts/test-runs/20260520-230845/verify.log and artifacts/test-runs/20260520-230905/verify.log | next: commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
