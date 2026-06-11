# Task Brief: Workout Context Upsell Placement Policy V1 (10/10)

## Metadata

- `id`: `2026-06-10-workout-context-upsell-placement-policy-v1-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-10`
- `updated`: `2026-06-11`
- `parent_brief`: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- `related_briefs`:
  - `docs/task-briefs/done/2026-06-09-workout-builder-funnel-instrumentation-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-10-workout-builder-funnel-dashboard-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-10-workout-builder-source-breakdown-dashboard-v1-10-10.md`
  - `docs/task-briefs/done/2026-06-10-workout-builder-template-usage-admin-analytics-mapping-v1-10-10.md`
- `execution_mode`: `docs-only-policy-after-explicit-implement`
- `branch`: `workout-context-upsell-placement-policy-v1`

## Brief Audit Record

- `last_audited`: `2026-06-10`
- `base`: clean synced `main@451ba841` after PR `#1065` clarified the workout commercial funnel next-child guardrails.
- `audit_status`: `done`
- `decision`: Implement this as the bounded docs-only policy child before any workout-context CTA instrumentation, dashboard, checkout, entitlement, finance, or runtime CTA implementation.
- `reason`: Owner explicitly requested `execute Workout Context Upsell Placement Policy V1`; builder, generator, source, and template usage telemetry now exists as first-party evidence, but the parent still forbids commercial UI until placement rules and interpretation boundaries are decided in this separate child.
- `must_refresh_before_execution_if`: Refresh before execution if AGENTS.md, the task brief template, scorecard categories, Admin Analytics interpretation, analytics event taxonomy, Help/Guide contracts, checkout/Stripe contracts, product catalog, workout builder/generator routes, template registry, route/label/support sweep rules, or finance/reporting contracts change.

## Goal

Define the policy for where workout-context upsell CTAs may appear, which existing first-party signals may inform placement, and which commercial, finance, privacy, and support boundaries must remain closed before runtime CTA work begins.

## Pre-Implementation Owner Explanation

Vi lager forst en regelbok for eventuell treningskontekst-CTA: hvor den kan vises, hvilke malinger den kan lene seg pa, og hva den ikke far antyde. Dette er viktig fordi salgsknapper i builder/generator kan pavirke tillit og arbeidsflyt hvis de plasseres for tidlig eller tolkes som checkout-/revenue-sannhet. Utenfor scope er CTA-kode, ny UI, analytics-event, dashboard, checkout, Stripe, entitlement, priser, finance, export, tredjeparts analytics og endringer i builder/generator-opplevelsen.

Forward-compatibility-intent: nye produkter, CTA-flater, workout-kilder, templates, labels og workflow-states skal enten folge policyen automatisk gjennom stabile kategorier, eller kreve eksplisitt mapping/eierbeslutning for de kan brukes kommersielt.

## Product Questions

This child answers only the policy questions below:

1. Which workout-context surfaces are eligible, conditionally eligible, or forbidden for a future upsell CTA?
2. Which existing first-party signals may be used as evidence for placement without implying revenue, unique-user conversion, entitlement, checkout readiness, or finance truth?
3. Which claims, copy patterns, recovery paths, and support interpretations are forbidden until later CTA instrumentation, checkout attribution, or finance children exist?
4. Which future additions should inherit the policy automatically, and which require explicit owner mapping before release?

## Implemented Policy Decision

Contract source: `docs/architecture/workout-context-upsell-placement-policy.md`

This child answers the policy gate as follows:

1. Current decision:
   - No workout-context upsell CTA is implemented or approved.
   - Existing commercial surfaces remain `/plans` and My Library explore.
   - Existing `upsell_presented`, `upsell_accepted`, and `upsell_declined` events continue to describe current commerce surfaces only; workout-context use requires a later child.
2. Recommended first runtime candidate if later approved:
   - A non-blocking post-success or workout-review placement after a successful save or accepted draft review.
   - This is safer than edit-time or intake-time CTA because the primary workout job is already stable.
3. Eligible/conditional/forbidden placement categories:
   - Eligible: saved-workout post-success state.
   - Conditional: generated-draft accepted/review state, template-applied draft review, saved workout library/detail review.
   - Forbidden: active manual editing, generator intake/loading, validation/error/recovery, auth/entitlement recovery, checkout success/claim/billing/finance, Admin Analytics, and operator diagnostics.
4. Signal eligibility:
   - Existing builder/generator/template metrics may be used as aggregate placement evidence only.
   - They must not be treated as CTA presentation, CTA acceptance, checkout conversion, entitlement truth, revenue attribution, Stripe reconciliation, export success, or finance reporting.
5. Fail-closed policy:
   - Unknown, deprecated, disabled, or unmapped placement/product/signal values show no CTA by default.
   - Future runtime config must include cache, invalidation, stale-state, kill-switch, rollback, and support diagnostics before release.
6. Privacy and support boundary:
   - Raw workout content, personal identifiers, raw URLs, visitor IDs, payment identifiers, Stripe IDs, free text, and raw payload JSON are forbidden as placement input, analytics dimension, support evidence, or copy justification.
   - Future visible CTA work must update Help/Guide and relevant runbooks in the same PR or include explicit `N/A` rationale.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the 10/10 claim gate:

- Product goals and IA
- UX flow clarity
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Analytics and KPI observability
- Commerce and revenue ops
- Finance and reporting operations
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                      | Evidence                                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Policy classifies eligible, conditional, and forbidden workout-context CTA placements without changing runtime navigation or primary workout tasks.                                     | policy contract + parent checkpoint            | `5/5`                   |
| UX flow clarity                               | `target`     | Future CTA placement must preserve the primary builder/generator job and define forbidden interruption points before UI work starts.                                                    | placement matrix + forbidden-surface examples  | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: no visual change ships here; future CTA UI must reuse mature product/action surfaces and provide screenshot handoff.                                                   | scope rationale + future screenshot rule       | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Policy separates signal eligibility from commercial action and forbids inferred conversion, revenue, entitlement, checkout, or finance truth from builder/generator/template telemetry. | signal-boundary table + negative examples      | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this docs-only policy creates no admin editor, placement config UI, CRUD workflow, publish flow, or editable CTA setting.                                                   | explicit admin-editor scope rationale          | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: no rendered UI ships here; future CTA UI must define accessible name, focus order, keyboard path, and non-blocking dismissal behavior.                                 | future UI acceptance notes                     | `4/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: policy must forbid new vendor scripts, chart libraries, or route payload bloat in this slice.                                                                          | package/changelog scope review                 | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Policy states that placement rules are docs-only until a later child chooses server-canonical config, static registry, or runtime flag behavior.                                        | data placement contract                        | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no runtime read path changes here; any future placement config child must define cache mode and invalidation before implementation.                                    | cache scope rationale                          | `4/5`                   |
| Reliability and failure handling              | `target`     | Policy requires future unknown, missing, disabled, or unmapped placement values to fail closed and not show a CTA by default.                                                           | fail-closed rules + fallback examples          | `5/5`                   |
| Security and authz                            | `target`     | Policy forbids widening user/admin data access and requires protected future CTA/config endpoints to fail closed with negative-path tests.                                              | security boundary notes                        | `5/5`                   |
| Privacy and compliance                        | `target`     | Policy forbids using raw workout text, notes, emails, user IDs, visitor IDs, IPs, user agents, raw URLs, payment data, Stripe IDs, or raw payload JSON for placement decisions.         | privacy exclusion list + route/support sweep   | `5/5`                   |
| Content governance                            | `target`     | Policy defines owner-controlled CTA placement categories, label/copy interpretation, rename vs repurpose rules, and Help/Guide/runbook update requirements.                             | governance section + checkpoint log            | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: no admin placement editor ships here; if editable placement config is desired later, it needs a separate child with role-gated workflow tests.                         | admin workflow scope rationale                 | `4/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: no public route, metadata, sitemap, robots, or structured-data change ships here; public CTA/landing changes require explicit SEO impact mapping later.                | SEO scope rationale                            | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: no public AI-facing content or structured data changes here; future public commercial copy needs crawl-safe semantic mapping.                                          | AI-discoverability scope rationale             | `4/5`                   |
| Analytics and KPI observability               | `target`     | Policy names which existing first-party metrics may inform placement and confirms CTA events/dashboard are a later child after placement policy exists.                                 | signal eligibility matrix + follow-up boundary | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Policy separates product telemetry, CTA presentation, CTA intent, checkout conversion, entitlement truth, Stripe reconciliation, and revenue reporting before commerce work starts.     | commerce boundary section                      | `5/5`                   |
| Incident response and support operations      | `target`     | Policy defines support interpretation for future CTA visibility issues and requires runbook/Help updates when any visible CTA or recovery path ships later.                             | support-surface sweep + runbook impact note    | `5/5`                   |
| Finance and reporting operations              | `target`     | Policy states that no builder/generator/template telemetry can be treated as finance-grade revenue, refund, payout, invoice, or reconciliation evidence.                                | finance boundary section                       | `5/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: policy categories and future CTA labels must remain locale-independent at the identity layer and localizable at the display layer.                                     | i18n scope rule                                | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Docs-only policy uses existing brief/runbook/architecture patterns and introduces no dependency, SDK, vendor, migration, route, or runtime service.                                     | changed-files/package diff                     | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed briefs pass brief lint and docs-only validation; future CTA implementation must add tests for allowed, forbidden, unknown, disabled, and failure states.                        | `npm run lint:briefs` + future test matrix     | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: future placement logic must stay low-cardinality and avoid per-user/per-workout decision dimensions unless a later child proves cost and privacy safety.               | cardinality/cost guardrails                    | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Docs-only policy is revertable; future runtime CTA/config children must define kill switch, rollback, and support diagnostics before release.                                           | rollback/release readiness section             | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - No runtime UI change is in this planned policy slice.
  - Future CTA UI must identify and reuse the most mature existing action/product surface before new markup is introduced.
  - No route, modal, banner, dashboard module, or checkout entry point may be added by this policy child.
- TypeScript/domain contracts:
  - No event name, payload helper, placement type, or runtime registry is added by this child unless the owner later executes a docs-only contract artifact that remains non-runtime.
  - Future runtime placement must use typed placement IDs, typed product IDs, and explicit unknown/disabled fallbacks.
- Supabase/data layer:
  - No migration, RLS change, generated type update, rollup job, raw payload read, or new persisted CTA/config table is in scope.
  - Future server-canonical placement config needs a separate child with migration, RLS/authz, cache, and negative-path tests.
- External services/tools:
  - No Stripe, checkout, finance, vendor analytics, SDK, webhook, consent banner, secret, cookie, visitor ID, or tag-manager change.
  - Any later Stripe or vendor scope must use official docs, idempotency/retry guidance, secret handling, and support diagnostics.
- UI system:
  - No screenshot handoff is required for this planned docs-only policy brief.
  - Future visible CTA UI requires screenshot handoff and owner approval before `npm run verify:pre-pr`.
- Testing:
  - This planned brief requires brief lint and diff-check after creation.
  - Executing the docs-only policy child should run docs-only verification.
  - Future runtime CTA children must add unit/component/e2e coverage for allowed, forbidden, unknown, disabled, duplicate, and failure states.

## Data Placement And Sync Contract

- Server-canonical:
  - Existing `analytics_events`, product catalog/checkout records, entitlement truth, and finance records remain separate sources of truth.
  - CTA placement truth is not server-canonical in this child; a later child must choose static policy, typed registry, runtime flag, or server config before implementation.
- Local/browser:
  - No browser analytics identity, cookie, visitor ID, localStorage attribution, local CTA config, or user-to-public attribution bridge is added.
  - Existing builder/generator transient state remains unchanged.
- Sync behavior:
  - No sync path changes in this child.
  - Future runtime placement must fail closed when placement config, product mapping, entitlement state, or signal mapping is unknown/unavailable.
- Retention and sensitivity:
  - Existing analytics retention applies.
  - Placement policy must not authorize sensitive payloads, raw workout content, personal identifiers, payment identifiers, raw URLs, or raw payload JSON.
- Cache/invalidation:
  - N/A for this docs-only policy until a later child selects runtime config.
  - Future config must define cache mode, invalidation, deploy/rollback behavior, and stale-state handling before release.

## Identity And Rename Contract

- Canonical stable IDs:
  - Future CTA placement IDs must be stable machine identifiers separate from labels, button copy, route titles, product names, and localized text.
  - Future product identity must come from the product catalog, not button text or route copy.
- Human-readable identifiers:
  - CTA copy, placement labels, product display names, Help/Guide text, and runbook phrasing are display-only and renameable when business meaning is unchanged.
- Mutability rules:
  - Placement IDs and product IDs are write-once once used in analytics or support interpretation.
  - CTA labels may be renamed only when they do not change the user promise or measured action.
- Rename vs repurpose:
  - Copy-only clarity changes are renames.
  - Moving a CTA to a materially different user moment, counting a different action under an existing event, changing product promise, or treating telemetry as finance truth is repurpose and requires a new child.
- Compatibility contract:
  - Unknown, deprecated, disabled, or unmapped placement/product IDs must not show a CTA by default.
  - Deprecated IDs require explicit alias, migration, or block behavior before analytics or dashboard mapping.
- Observability and repair:
  - Future runtime children must expose safe diagnostics for disabled/unmapped placement rules without leaking raw user or payment data.

## Forward Compatibility Contract

- Extensibility surfaces:
  - CTA placement IDs, product IDs, catalog availability, entitlement states, builder source kinds, generator stages, templates, workflow labels/actions, route templates, locales, analytics payloads, export formats, vendor forwarding, support copy, and finance/reporting surfaces.
- Source of truth:
  - Existing analytics signal names come from `ANALYTICS_EVENT_NAMES`.
  - Existing template identity comes from the workout template registry/contract.
  - Future product identity must come from the catalog, and future finance truth must come from Stripe/accounting reconciliation contracts, not product telemetry.
- Additive behavior:
  - New builder/generator/template analytics can be considered evidence only when already mapped as safe first-party metrics.
  - New CTA surfaces can inherit policy categories only if their user moment is equivalent and documented.
- Explicit mapping requirements:
  - New products, checkout steps, entitlement rules, pricing models, CTA events, placement IDs, finance reports, vendor analytics, exports, localized commercial copy, or public landing surfaces require explicit owner mapping, docs, and tests.
- Unknown or deprecated values:
  - Unknown or deprecated placement, product, source, template, or event values fail closed for CTA presentation.
  - Unknown values may be logged or surfaced only as safe aggregate diagnostics in a later child.
- Test/evidence:
  - This planned brief should pass brief lint.
  - Executing the policy should include route/label/support sweep evidence.
  - Future runtime children need fixtures for new allowed placement, forbidden placement, unknown placement, disabled product, missing entitlement, stale analytics signal, and unsupported finance interpretation.

## Help / Guide Impact

- Planned brief creation: no visible Help/Guide change.
- Executed policy child: created durable architecture artifact `docs/architecture/workout-context-upsell-placement-policy.md` and updated API/privacy docs so support interpretation is available without changing visible Help/Guide UI.
- Any future visible CTA, checkout, entitlement, pricing, recovery, or support workflow change must update Help/Guide and relevant runbooks in the same PR.

## Screenshot / Visual Impact

No screenshot handoff is required for this planned docs-only brief because it changes no rendered UI, print, layout, brand, CSS, button/card text, or user workflow.

- Screenshot artifacts: N/A.
- Screenshot comparison naming: N/A.
- Owner screenshot approval stop: required only for future visible UI changes.

## Route / Label / Support Surface Sweep

Required before executing the policy child because it changes commercial/support interpretation for future CTA placement.

Search at minimum:

- `upsell`
- `CTA`
- `checkout`
- `Stripe`
- `finance reporting`
- `entitlement`
- `workout_builder_started`
- `workout_builder_saved`
- `session_draft_generated`
- `workout_builder_template_selected`
- `Template usage`
- `sourceKind`
- `builderMode`
- `saveKind`
- `Admin Analytics`
- `Help/Guide`

Check at minimum:

- `app/`
- `components/`
- `components/admin/`
- `components/my-library/workouts/`
- `components/my-library/generator/`
- `lib/analytics/`
- `lib/workouts/`
- `lib/session-generator-v1/`
- `lib/products/` or current product catalog path
- `tests/`
- `docs/api-contracts.md`
- `docs/architecture/`
- `docs/runbooks/`
- active/planned/done workout, analytics, commerce, AW-006, checkout, and finance-related task briefs.

Sweep evidence on `2026-06-10`:

- Identifiers searched: `upsell`, `CTA`, `checkout`, `Stripe`, `finance reporting`, `entitlement`, `workout_builder_started`, `workout_builder_saved`, `session_draft_generated`, `workout_builder_template_selected`, `Template usage`, `sourceKind`, `builderMode`, `saveKind`, `Admin Analytics`, and `Help/Guide`.
- Directories/surfaces checked: `app/`, `components/`, `components/admin/`, `components/my-library/workouts/`, `components/my-library/generator/`, `lib/analytics/`, `lib/workouts/`, `lib/session-generator-v1/`, commerce/product catalog helpers, `tests/`, `docs/api-contracts.md`, `docs/architecture/`, `docs/runbooks/`, and active/planned/done workout, analytics, commerce, AW-006, checkout, and finance-related briefs.
- Findings:
  - Existing `upsell_presented`, `upsell_accepted`, and `upsell_declined` instrumentation currently belongs to `/plans` and My Library explore/checkout-cancel surfaces, not workout-context surfaces.
  - Existing Admin Analytics and Help/Guide copy already warns that workout-builder, source, generated-completion, and template-usage metrics are product telemetry, not unique-user conversion, checkout conversion, Stripe reconciliation, entitlement truth, or finance reporting.
  - `docs/api-contracts.md` needed an explicit workout-context upsell caveat so future dashboard/API interpretation cannot infer CTA performance from builder/generator/template metrics.
  - `docs/runbooks/public-analytics-privacy-assessment.md` needed an explicit privacy boundary for workout-context upsell placement policy and future CTA releases.
  - No runtime route, component, event taxonomy, product catalog, checkout, Stripe, entitlement, finance, migration, export, vendor, or Help/Guide UI change was required in this slice.

## Scope

- Create a bounded policy child for workout-context upsell placement.
- Decide allowed, conditional, and forbidden CTA placement categories.
- Decide which existing first-party builder/generator/template metrics may inform placement.
- Define support, privacy, finance, commerce, identity, and forward-compatibility boundaries.
- Define validation and future runtime implementation requirements.
- Move this brief to `in-progress` after owner execution approval.
- Keep runtime CTA implementation deferred until a future owner-approved child.

## Out Of Scope

- Runtime CTA implementation.
- New CTA UI, layout, copy in product surfaces, screenshots, or browser QA.
- New analytics events such as `upsell_presented`, `upsell_accepted`, or `upsell_declined`.
- Admin Analytics dashboard modules for CTA performance.
- Checkout, Stripe, pricing, entitlement, product catalog mutation, finance reporting, reconciliation, refunds, payouts, invoices, subscriptions, or accounting export.
- Third-party analytics, GA4/vendor forwarding, consent changes, cookies, visitor IDs, raw drilldown, CSV/export, migrations, RLS, generated DB types, or route changes.
- Builder/generator UX behavior changes, template registry changes, or workout save/generator instrumentation changes.

## Acceptance Criteria

1. Brief remains a bounded docs-only policy child and does not execute the parent directly.
2. Placement policy scope is limited to workout-context CTA eligibility and interpretation boundaries.
3. Existing first-party metrics are listed only as placement evidence, not conversion, checkout, entitlement, revenue, or finance truth.
4. Unknown, deprecated, disabled, or unmapped placement/product/signal values fail closed for future CTA presentation.
5. Privacy exclusions forbid sensitive identifiers, raw workout content, payment data, raw URLs, and raw payload JSON.
6. Help/Guide and runbook impact is explicit before any future visible CTA or support workflow change.
7. Route/label/support sweep requirements are documented before execution.
8. Changed briefs pass `npm run lint:briefs`.

## Validation

Planned brief creation:

- `npm run lint:briefs`
- `git diff --check`

Docs-only policy execution:

- `npm run verify:docs-only`
- `npm run verify:pre-pr`
- required PR CI checks
- `npm run verify:pre-merge`

Local validation evidence on `2026-06-10`:

- `git diff --check` PASS.
- `npm run lint:briefs -- --all` PASS, including this in-progress child.
- `npm run verify:docs-only` PASS; lane selected docs-only because all changed files are docs/governance.
- `npm run verify:pre-pr` PASS; branch is current with `origin/main@451ba841` and docs-only lane passed.
- required PR CI checks PASS on PR `#1066`.
- `npm run verify:pre-merge` PASS on `2026-06-11`; branch was current with `origin/main@451ba841` and docs-only lane reused the current-HEAD docs-only verification PASS marker.

Future runtime CTA child:

- targeted unit/component/e2e tests named in that child brief
- route/label/support-surface sweep evidence
- screenshot handoff before `npm run verify:pre-pr`
- `npm run typecheck`
- `npm run lint:quality-gates`
- `npm run lint:briefs`
- `git diff --check`
- `npm run verify:pre-pr`
- required PR CI checks
- `npm run verify:pre-merge`

## Session Continuity And Recovery

- Parent brief: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- Canonical child path: `docs/task-briefs/done/2026-06-10-workout-context-upsell-placement-policy-v1-10-10.md`
- Contract path: `docs/architecture/workout-context-upsell-placement-policy.md`
- Latest completed analytics child: `docs/task-briefs/done/2026-06-10-workout-builder-template-usage-admin-analytics-mapping-v1-10-10.md`
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. Reopen the parent and this planned child, then continue from the latest checkpoint.

## Checkpoint Log

- `2026-06-10 | planned child created | created planned child brief from clean synced main@451ba841 after PR #1065; scope is docs-only workout-context upsell placement policy, with no runtime CTA, analytics event, dashboard, checkout, Stripe, entitlement, finance, vendor, export, migration, or builder/generator UX implementation approved | next: wait for owner implementation approval or scope edits`
- `2026-06-10 | child moved to in-progress | owner requested execution, branch workout-context-upsell-placement-policy-v1 was created, and the child moved to docs/task-briefs/in-progress/2026-06-10-workout-context-upsell-placement-policy-v1-10-10.md; parent remains plan-only and runtime CTA, analytics event, dashboard, checkout, Stripe, entitlement, finance, vendor, export, migration, and builder/generator UX remain out of scope | next: complete docs-only policy contract and validation`
- `2026-06-10 | policy contract implemented | added docs/architecture/workout-context-upsell-placement-policy.md, updated API/privacy interpretation docs, and recorded route/label/support sweep evidence; no runtime code, visible UI, checkout, Stripe, entitlement, finance, vendor, export, migration, or builder/generator UX changes were made | next: run docs-only validation and pre-pr gate`
- `2026-06-10 | local pre-pr passed | docs-only validation passed with git diff --check, lint:briefs -- --all, verify:docs-only, and verify:pre-pr on current origin/main@451ba841; scope remains docs/governance only with no runtime CTA, analytics event, dashboard, checkout, Stripe, entitlement, finance, vendor, export, migration, or builder/generator UX changes | next: commit, push, open PR, and monitor CI`
- `2026-06-10 | PR ready | committed docs-only policy work at 58fb83fc, opened PR #1066, and required CI passed; scope remained docs/governance only with no runtime CTA, analytics event, dashboard, checkout, Stripe, entitlement, finance, vendor, export, migration, or builder/generator UX changes | next: run pre-merge gate after owner merge approval`
- `2026-06-11 | merged | PR #1066 merged at squash commit 56701757 after green local pre-pr, CI, and pre-merge gates; this repo-managed closeout moved the brief to done and records final evidence | next: validate and merge docs-only closeout PR`

## Completion Record

- `completed`: `2026-06-11`
- `merged_pr`: `#1066`
- `squash_commit`: `56701757`
- `result`: Closed Workout Context Upsell Placement Policy V1. The policy now defines where a future workout-context CTA may appear, which first-party workout signals may inform placement, and which commerce, finance, privacy, support, and fail-closed boundaries must remain in place before any runtime CTA work begins.
- `validation`: `git diff --check` passed, `npm run lint:briefs -- --all` passed, `npm run verify:docs-only` passed, `npm run verify:pre-pr` passed docs-only lane on `2026-06-10`, PR `#1066` CI passed, and `npm run verify:pre-merge` passed docs-only lane on `2026-06-11`.
- `10/10 claim`: yes - all critical target categories reached `5/5`; no runtime/UI/checkout/finance surface was added.

| Category                                      | Achieved Score | Evidence                                                                                                   | Gaps / Notes   |
| --------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------- | -------------- |
| Product goals and IA                          | `5/5`          | Policy contract and parent checkpoint define allowed, conditional, and forbidden placement categories.     | No target gap. |
| UX flow clarity                               | `5/5`          | Policy forbids active editing, intake/loading, validation, recovery, and operator surfaces for CTA use.    | No target gap. |
| Business logic correctness and data integrity | `5/5`          | Existing workout telemetry is documented as placement evidence only, not conversion or finance truth.      | No target gap. |
| Data placement and sync boundaries            | `5/5`          | Future runtime config remains deferred and must choose canonical source, cache, invalidation, and sync.    | No target gap. |
| Reliability and failure handling              | `5/5`          | Unknown, deprecated, disabled, or unmapped placement/product/signal values must fail closed.               | No target gap. |
| Security and authz                            | `5/5`          | Policy forbids widened data access and requires fail-closed protected future endpoints.                    | No target gap. |
| Privacy and compliance                        | `5/5`          | Raw workout content, personal identifiers, raw URLs, visitor IDs, payment IDs, and raw payloads excluded.  | No target gap. |
| Content governance                            | `5/5`          | API/privacy docs, policy artifact, parent, and child brief align on future CTA interpretation.             | No target gap. |
| Analytics and KPI observability               | `5/5`          | Signal eligibility matrix separates product telemetry from CTA presentation, acceptance, and checkout.     | No target gap. |
| Commerce and revenue ops                      | `5/5`          | Existing `/plans` and My Library explore remain the only approved commerce surfaces.                       | No target gap. |
| Incident response and support operations      | `5/5`          | Support interpretation and Help/Guide/runbook requirements are documented for any later visible CTA.       | No target gap. |
| Finance and reporting operations              | `5/5`          | Workout telemetry is explicitly barred from finance-grade revenue, refund, payout, invoice, or reconcile.  | No target gap. |
| Stack-fit and dependency discipline           | `5/5`          | Docs-only slice reused existing brief/runbook/architecture patterns and added no dependency or runtime.    | No target gap. |
| Testing and QA automation                     | `5/5`          | Brief lint, docs-only verify, pre-pr, PR CI, and pre-merge gates passed.                                   | No target gap. |
| DevOps and rollback readiness                 | `5/5`          | Change is docs-only and revertable; future runtime CTA must define kill switch, rollback, and diagnostics. | No target gap. |
