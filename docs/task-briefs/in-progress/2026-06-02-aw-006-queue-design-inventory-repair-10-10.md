# Task Brief: AW-006 Queue Design Inventory Repair (10/10)

## Metadata

- `id`: `2026-06-02-aw-006-queue-design-inventory-repair-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-02`
- `updated`: `2026-06-02`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `preceded_by`: `docs/task-briefs/done/2026-06-02-aw-006-course-open-on-phone-token-action-parity-10-10.md`
- `branch`: `aw-006-queue-design-inventory-repair`

## Brief Audit Record

- `last_audited`: `2026-06-02`
- `base`: `main@18ff2c3`
- `audit_status`: `ready`
- `decision`: Execute a docs-only AW-006 lifecycle repair before selecting the next product/UI implementation slice.
- `reason`: `main` is clean and synced at `18ff2c3` after Course Open On Phone Token/Action Parity PR `#949` and repo-managed closeout PR `#950`; the canonical queue says no active implementation slice is selected, but the design inventory still marks the already completed Mobile Action Layout And Button Semantics Audit as `Active` and links to its old `in-progress` path.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, task-brief lifecycle rules, canonical queue format, notice/empty-state inventory format, `lint:briefs`, post-merge preflight behavior, or verification lanes change before PR handoff.

## Goal

Repair AW-006 queue and design-inventory lifecycle text so completed mobile-action work is not presented as active and no new UI slice is selected from stale references.

## Pre-Implementation Owner Explanation

Vi rydder i arbeidslisten, ikke i produktet. Jeg retter dokumentasjonen slik at en ferdig AW-006-jobb ikke lenger staar som aktiv, og slik at neste UX/UI-slice kan velges fra riktig koestatus. Utenfor scope er UI, kode, screenshots, API, database, auth, Stripe, analytics, Help/Guide og valg av neste produkt-slice.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `Reliability and failure handling`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                      | Evidence                                   | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | Canonical AW-006 queue and design inventory must clearly state that this is a docs-only lifecycle repair and that no product/UI implementation slice is selected.       | queue diff + inventory diff + active brief | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: contributor planning flow becomes clearer; no user-facing product flow, empty state, loading state, error state, retry path, or route journey changes. | docs diff                                  | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this changes no rendered UI, CSS, visual token, asset, layout, print output, screenshot, or product surface.                                                | visual scope rationale                     | `N/A`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because this docs-only repair changes no runtime state, persisted data, mutation, validation, domain invariant, checkout, entitlement, or business truth.           | docs-only diff review                      | `N/A`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor surface, CRUD action, role behavior, recovery action, or operator workflow.                                                    | admin scope rationale                      | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no markup, focus behavior, keyboard path, labels, contrast, live region, or screen-reader semantics change.                                                 | a11y scope rationale                       | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no route, JavaScript payload, CSS, media asset, build output, cache behavior, or Core Web Vitals budget changes.                                            | performance scope rationale                | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this introduces no local-only data, server-canonical data, browser storage, sync, conflict policy, retention rule, or sensitive data flow.                  | data scope rationale                       | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, fetch cache, revalidation trigger, mutation response, CDN behavior, or stale-data contract changes.                                    | cache scope rationale                      | `N/A`                   |
| Reliability and failure handling              | `target`     | Targeted sweeps must show no stale `Active`/old `in-progress` mobile-action audit reference remains in canonical AW-006 queue or design inventory.                      | targeted sweeps + brief lint               | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because no protected route, authz check, auth provider behavior, token handling, cookie, secret, or request input changes.                                          | security scope rationale                   | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data, credentials, logs, analytics payload, legal copy, consent behavior, retention rule, or raw env value handling changes.                        | privacy scope rationale                    | `N/A`                   |
| Content governance                            | `target`     | The active repair brief, canonical queue, and design inventory must agree on Mobile Action Layout audit completion and current no-UI-slice state.                       | changed docs + route/label/support sweep   | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow label, editable field, status transition, audit trail, Help/Guide action, or support procedure changes.                                   | workflow scope rationale                   | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no metadata, sitemap, robots, canonical URL, route content, structured public page content, or crawl-facing route changes.                                  | SEO scope rationale                        | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                     | AI-discoverability scope rationale         | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no event taxonomy, analytics call, KPI persistence, dashboard, payload, consent, or reporting behavior changes.                                             | analytics scope rationale                  | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no Stripe, checkout, price, entitlement, invoice, refund, payout, or revenue reporting behavior changes.                                                    | commerce scope rationale                   | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support workflow, recovery behavior, operator diagnostics, runbook procedure, or support escalation behavior.                 | explicit support-ops scope rationale       | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                | explicit finance scope rationale           | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A: this changes no user-facing product strings, locale routing, translation workflow, metadata localization, or grammar-coupled UI layout.                            | explicit i18n scope rationale              | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Keep the repair in Markdown lifecycle docs only; add no dependency, script, workflow, runtime component, provider integration, or architecture refactor.                | changed-files diff                         | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed briefs pass strict brief lint, all-brief lint, targeted stale-reference sweeps, diff whitespace checks, docs-only `verify:pre-pr`, CI, and `verify:pre-merge`.  | validation commands + CI evidence          | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: keeping the queue accurate reduces review/restart cost; runtime cost, service calls, storage, jobs, polling, and traffic-dependent cost are unchanged. | docs-only lifecycle scope                  | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Diff remains docs-only with normal git revert rollback and no migration, secret, environment, package, workflow, or production setting changes.                         | git diff review + validation gates         | `5/5`                   |

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

## Forward Compatibility Contract

- Extensibility surfaces:
  - AW-006 lifecycle docs, canonical queue entries, design-inventory rows, and future child-brief lifecycle references.
- Source of truth:
  - Completed AW-006 child briefs must be linked from their `done` path and must not remain marked `Active` or point to old `in-progress` paths in canonical queue or design inventory.
- Additive behavior:
  - Future AW-006 slices can be selected from queue/inventory without inheriting stale active references from completed child briefs.
- Explicit mapping requirements:
  - Any future AW-006 slice still requires an explicit owner-approved brief, protected-area scope, scorecard mapping, and screenshot handoff when visual files change.
- Unknown or deprecated values:
  - Unknown future AW-006 references fail safe as planning-only until a fresh queue/design/code re-audit selects the next slice.
- Test/evidence:
  - Targeted stale-reference sweeps and brief lint prove this repair is not hardcoded to the previous completed slice only.

## Help / Guide Impact

N/A with rationale: this PR changes no user/admin workflow labels, Help/Guide content, support recovery behavior, operator instructions, or runbook procedure. Future AW-006 implementation slices must update Help/Guide or runbooks when they change labels, workflows, recovery behavior, auth, payments, or support paths.

## Route / Label / Support Surface Sweep

Required as a task-brief lifecycle and AW-006 queue/design-inventory sweep.

- Identifiers to sweep before broad gates:
  - `Mobile Action Layout And Button Semantics Audit`
  - `Mobile action layout audit`
  - `docs/task-briefs/in-progress/2026-06-02-aw-006-mobile-action-layout-button-semantics-audit-10-10.md`
  - `Active:`
  - `Course Open On Phone Token/Action Parity`
  - `AW-006 implementation queue state`
- Surfaces to check:
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/task-briefs/done/`
  - `docs/design/`
- Expected fallout:
  - this active repair brief,
  - canonical AW-006 queue update,
  - notice/empty-state inventory update,
  - no product code, Help/Guide, runbook, support workflow, route label, or rendered UI changes.

## Scope

- Create this in-progress docs-only repair brief.
- Update the canonical AW-006 queue to record this current docs-only lifecycle repair while keeping the next product/UI implementation slice unselected.
- Update the notice/empty-state inventory so Mobile Action Layout And Button Semantics Audit is completed through `#947/#948`, with no old `in-progress` active path.
- Run targeted lifecycle sweeps and docs-only validation.

## Out Of Scope

- Runtime app code, UI, styles, layout, tests, scripts, configs, workflows, migrations, generated files, assets, screenshots, or product behavior.
- Choosing or implementing the next AW-006 UI/product slice.
- Broad app-wide design-system primitives.
- Supabase, Stripe, auth, analytics, database, commerce, finance, i18n, Help/Guide, support procedures, or merge to `main`.

## Acceptance Criteria

1. The canonical AW-006 queue records this docs-only repair as the current bounded lifecycle slice.
2. The canonical AW-006 queue still states that no product/UI implementation slice is selected after Course Open On Phone closeout.
3. The notice/empty-state inventory records Mobile Action Layout And Button Semantics Audit as done through `#947/#948` and links to its `done` brief.
4. No AW-006 queue or design-inventory text marks the completed mobile-action audit as `Active` or points to its old `in-progress` path as an active implementation brief.
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

- `2026-06-02 | in-progress | started from clean synced main@18ff2c3 after PR #949 and repo-managed closeout #950; short queue/design-inventory audit found stale Mobile Action Layout audit active text and old in-progress path in the design inventory while the canonical queue correctly left no active UI slice selected | next: repair docs-only lifecycle state, run targeted sweeps and docs-only validation, then open PR without selecting the next product/UI slice`
- `2026-06-02 | targeted validation | repaired the design inventory and canonical AW-006 queue, staged the three Markdown files, and passed npm run lint:briefs:all, git diff --cached --check, and targeted stale-reference sweeps; npm run lint:briefs ran but reported no changed tracked brief set before all-brief lint covered the new in-progress brief | next: run npm run verify:pre-pr before commit/push/PR handoff`
- `2026-06-02 | pre-pr gate | npm run verify:pre-pr passed the docs-only lane with artifact log artifacts/test-runs/20260602-201423/verify.log; the gate confirmed the branch contains origin/main@18ff2c3 and only the three Markdown docs/governance files changed | next: rerun verify:pre-pr after this checkpoint update, then commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
