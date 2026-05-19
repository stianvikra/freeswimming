# Task Brief: AW-006 Shared Notice And Empty-State Pattern Inventory (10/10)

## Metadata

- `id`: `2026-05-19-aw-006-shared-notice-empty-state-pattern-inventory-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-19`
- `updated`: `2026-05-19`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `branch`: `aw-006-notice-empty-state-inventory`

## Brief Audit Record

- `last_audited`: `2026-05-19`
- `base`: `main@5f6f27e`
- `audit_status`: `ready`
- `decision`: Execute the next canonical AW-006 inventory slice after My Library surface polish shipped.
- `reason`: PR `#758` and repo-managed closeout `#759` left `main` clean; the canonical AW-006 queue lists `Shared notice and empty-state pattern inventory` as the next small PR-sized UX/UI slice after My Library.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, admin manager surfaces, auth feedback components, My Library notice components, guide trackers, design tokens, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Inventory repeated notice, empty, loading, and error-state treatments across representative public, member, guide, and admin surfaces, then choose one narrow primitive-consolidation slice without changing runtime UI or product behavior.

## Pre-Implementation Owner Explanation

Dette slicen kartlegger hvor appen viser tomme lister, feilmeldinger, ventetilstander og sma info-notiser, og velger ett trygt omrade for neste lille konsolidering. Det betyr noe fordi brukere og admin skal mote mer like og forutsigbare meldinger pa tvers av appen. Utenfor scope er stor designsystem-ombygging, runtime UI-endringer, nye flyter, auth, betaling, data, Supabase, Stripe og analytics.

## Mature Reference Surfaces

- `components/my-library/MyLibraryNewContentNotice.tsx` for token-backed member notice behavior after My Library polish.
- `components/ContactForm.tsx` for public conversion form feedback and success state.
- `components/admin/AdminCommerceManager.tsx`, `components/admin/AdminOperationsManager.tsx`, `components/admin/AdminQrLinksManager.tsx`, and `components/admin/AdminEmailTemplatesManager.tsx` for repeated admin management loading/error/retry/empty patterns.
- `components/guides/Guide0To1000Tracker.tsx` and `components/guides/PoolsideGuideTracker.tsx` for domain-specific sync/offline state boundaries.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Reliability and failure handling`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                          | Evidence                                                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The inventory must classify representative state surfaces and identify exactly one next PR-sized primitive-consolidation slice.                                             | design inventory + canonical queue update                              | `5/5`                   |
| UX flow clarity                               | `target`     | Loading, empty, error, retry, warning, and success states must be separated by user job and not collapsed into a vague generic component plan.                              | pattern taxonomy + chosen/deferred surface rationale                   | `5/5`                   |
| Visual design quality                         | `target`     | The chosen next slice must reference the AW-006 token direction and avoid broad visual redesign; no rendered UI changes occur in this inventory PR.                         | design inventory + diff review                                         | `5/5`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because this docs-only inventory changes no runtime state transitions, mutations, validation, persisted data, entitlement, catalog, or business truth.                  | explicit docs-only scope review                                        | `N/A`                   |
| Admin editor ergonomics                       | `supporting` | Supporting because admin manager surfaces are inventoried and the recommended next primitive pilot is admin-local; no admin editor workflow changes in this PR.             | admin manager inventory                                                | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Inventory must record semantic/live-region expectations for future notices and distinguish static empty states from dynamic action feedback.                                | reuse rules in design inventory                                        | `5/5`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no runtime bundle, media, route rendering, dependency, or fetch path changes are introduced.                                                                    | package/runtime diff review                                            | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this inventory introduces no local-only data, server-canonical data, browser storage, sync behavior, cache mutation, or conflict handling.                      | data contract section                                                  | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no read path, cache mode, revalidation trigger, invalidation rule, or stale-data behavior changes.                                                              | cache scope rationale                                                  | `N/A`                   |
| Reliability and failure handling              | `target`     | Recoverable error/retry, no-results, loading, warning, partial-recovery, and static empty states must be inventoried with defer rationale for complex workflows.            | inventory table + future reuse rules                                   | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because no protected route, authz check, token/cookie behavior, secret handling, input surface, or API route changes.                                                   | security scope review                                                  | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data, PII display, logs, analytics payloads, consent/legal copy, retention behavior, or raw env values are touched.                                     | privacy scope review                                                   | `N/A`                   |
| Content governance                            | `target`     | The AW-006 queue and design inventory must become the durable source for this pattern decision and next slice selection.                                                    | updated canonical queue + new design doc + active brief                | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting because future admin-local consolidation is selected, but this PR changes no admin CRUD, status workflow, publish state, or operator action.                     | explicit out-of-scope + admin inventory                                | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this docs-only inventory changes no public route metadata, sitemap, robots, canonical URL, crawl-facing content, or structured data.                            | SEO scope rationale                                                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this inventory changes no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract.                          | AI-discoverability scope rationale                                     | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting because future notice migration must preserve existing analytics events, but this PR changes no event taxonomy or payload.                                       | selected-slice guardrails                                              | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this PR changes no pricing, checkout, entitlement, portal, invoice, refund, payout, revenue report, or commerce data.                                           | commerce scope rationale                                               | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this inventory changes no incident alert path, support recovery workflow, operator diagnostics, runbook procedure, or support escalation behavior.                     | explicit support-ops scope rationale                                   | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this inventory changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, or revenue recognition data.                       | explicit finance scope rationale                                       | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A: this inventory changes no user-facing product strings, locale routing, translation workflow, metadata text, dynamic grammar contract, or locale operations.            | explicit i18n scope rationale                                          | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | The selected next slice must use existing Next/React/Tailwind/admin component boundaries and add no dependency or broad design-system framework.                            | stack gate + design inventory                                          | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed briefs and docs must pass brief lint, docs-only verification, pre-pr, CI, and pre-merge; no screenshot handoff is required unless rendered UI changes later.        | `lint:briefs:all`, `verify:pre-pr`, PR CI, `verify:pre-merge` evidence | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because the inventory reduces future refactor cost by choosing one bounded primitive pilot; no runtime resource/cost model changes.                              | PR-sized next-slice decision                                           | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The docs-only change must be revertible by reverting the active brief, design inventory, and queue update; no migration, config, dependency, or runtime rollback is needed. | git diff review + docs-only verification gates                         | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - No route, layout, component render path, server/client boundary, action, API route, cache, or revalidation behavior changes in this inventory PR.
  - Future implementation should start admin-local before any app-wide primitive.
- TypeScript/domain contracts:
  - No type, parser, validation, invariant, or error model changes.
  - Future primitive should preserve existing message strings, retry callbacks, and action semantics first.
- Supabase/data layer:
  - N/A; no schema, migration, RLS, authz, generated type, index, storage, or query shape change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, webhook, SDK, secret, or deployment setting change.
- UI system:
  - Inventory references AW-006 token direction and names a bounded admin-local primitive pilot as the next implementation candidate.
  - No screenshot handoff is required for this PR because no rendered UI, print, layout, or brand file changes.
- Testing:
  - Docs/brief lint and docs-only verification are sufficient for this inventory PR.
  - Future rendered UI migration must add focused component tests and screenshot handoff.

## Data Placement And Sync Contract

N/A with rationale: this docs-only inventory introduces no local-only data, server-canonical data, browser storage, sync behavior, conflict policy, retention rule, sensitive data handling, cache invalidation, or route data fetch.

## Identity And Rename Contract

N/A with rationale: this inventory creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, redirect, or migration behavior.

## Help / Guide Impact

N/A with rationale: this PR changes no admin/user workflow label, recovery behavior, Help/Guide assertion, auth flow, payment flow, runbook instruction, or operator-facing support action. Future admin primitive migration must update Help/Guide only if it changes labels, workflow actions, recovery copy, or support procedure.

## Route / Label / Support Surface Sweep

Required as a documentation and surface-impact sweep because the slice classifies admin/user-facing state labels but does not change rendered labels.

- Identifiers searched before PR handoff:
  - `Loading`
  - `Could not load`
  - `Retry`
  - `No .* yet`
  - `No .* match`
  - `actionNotice`
  - `actionError`
  - `aria-live`
  - `role="status"`
  - `role="alert"`
  - `fs-library-card`
  - `fs-surface-card`
- Surfaces checked:
  - `app/`
  - `components/`
  - `tests/`
  - `docs/design/`
  - `docs/task-briefs/`
  - `docs/runbooks/`
- Expected fallout:
  - new design inventory document,
  - active task brief,
  - canonical AW-006 queue update,
  - no Help/Guide runtime update,
  - no screenshot artifact.

## Scope

- Create this in-progress child brief.
- Add `docs/design/notice-empty-state-pattern-inventory.md`.
- Inventory representative public, member, guide, and admin state treatments.
- Choose one narrow primitive-consolidation slice for later implementation.
- Update the canonical AW-006 queue so My Library is no longer shown as the current next slice.

## Out Of Scope

- Runtime code, UI rendering, tests, scripts, configs, workflows, migrations, package files, generated files, screenshots, new dependencies, Supabase, Stripe, auth, analytics, Help/Guide runtime content, admin behavior, commerce behavior, route labels, sitemap/metadata, or merge to `main`.
- Building the primitive in this PR.

## Acceptance Criteria

1. Inventory covers representative notice/empty/loading/error surfaces across public, member, guide, and admin areas.
2. Inventory records which surfaces are safe candidates and which are deferred because of auth, recovery, commerce, export, or sync complexity.
3. Exactly one next PR-sized primitive-consolidation slice is recommended with likely files, risks, and protected areas.
4. Canonical AW-006 queue reflects My Library as shipped and this inventory slice as current/active.
5. No rendered UI or runtime behavior changes; screenshot handoff is explicitly N/A.
6. `npm run lint:briefs:all`, `npm run verify:pre-pr`, and later `npm run verify:pre-merge` pass through the docs-only lane.

## Validation

- Targeted:
  - `npm run lint:briefs:all`
  - `git diff --check`
- Broad gates:
  - `npm run verify:pre-pr`
  - PR required CI checks
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- This is docs-only; `verify:pre-pr` and `verify:pre-merge` should auto-select the docs-only lane.

## Checkpoint Log

- `2026-05-19 | in-progress | started from clean main@5f6f27e after PR #758 and repo-managed closeout #759; selected Shared notice and empty-state pattern inventory as the next AW-006 queue item because My Library surface polish is already done | next: inventory repeated state patterns, update canonical queue, run docs-only validation, then commit/push/open PR`
- `2026-05-19 | in-progress | inventoried representative public, member, guide, and admin notice/empty/loading/error states; chose Admin management feedback and list-state primitive pilot as the next bounded implementation candidate; updated the canonical AW-006 queue; npm run lint:briefs:all and git diff --check passed | next: run npm run verify:pre-pr`
- `2026-05-19 | in-progress | npm run verify:pre-pr passed through the docs-only lane for the three docs/governance files, including branch-current, docs-only verification, brief lint, quality gate, admin audit lint, env parity lint, and generated PR body lint | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge-readiness summary`
