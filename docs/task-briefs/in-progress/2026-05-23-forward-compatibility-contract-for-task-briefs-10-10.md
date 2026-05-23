# Task Brief: Forward Compatibility Contract For Task Briefs (10/10)

## Metadata

- `id`: `2026-05-23-forward-compatibility-contract-for-task-briefs-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-23`
- `updated`: `2026-05-23`
- `parent_context`: AW-006 governance follow-up before the next product implementation slice
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `branch`: `docs/forward-compatibility-contract`

## Brief Audit Record

- `last_audited`: `2026-05-23`
- `base`: `main@96c28b7`
- `audit_status`: `ready`
- `decision`: Execute a small docs/governance slice before the next AW-006 product implementation slice.
- `reason`: `main` is clean after PR `#814` and repo-managed closeout PR `#815`; `npm run post-merge:preflight` was reported green with no closeout remaining. A short queue/design/code re-audit found that next-slice recommendations and new briefs require clearer non-programmer explanation and forward compatibility rules so future products, labels, workflows, analytics values, and identifiers are not handled only by memory.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, task-brief template structure, task-brief audit gate, scorecard categories, brief lint behavior, AW-006 queue state, or verification lanes change before PR handoff.

## Goal

Make forward compatibility an explicit task-brief contract for future implementation work, and record which existing planned/in-progress/done briefs need refresh or correction behavior before reuse.

## Pre-Implementation Owner Explanation

Vi strammer inn arbeidsoppskriften slik at nye produkter, labels, workflows og datafelt maa beskrives for fremtidige endringer foer vi bygger. Det betyr noe fordi plattformen skal vokse uten at gamle skjermer, analyser eller supportregler blir hardkodet til dagens valg. Utenfor scope er produkt-UI, runtime-kode, Stripe/Supabase/API-endringer, tester som endrer appoppfoersel, og masseomskriving av ferdige historiske brief.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `Reliability and failure handling`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                        | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Future briefs and next-slice recommendations must explain what changes, why it matters, what is out of scope, and how future additions should behave.                                     | AGENTS/template/runbook diff + active brief | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: clearer brief requirements improve future UX execution, but this PR changes no user flow or rendered product surface.                                                    | docs-only scope review                      | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this changes no rendered UI, visual layout, CSS, assets, brand treatment, screenshot, print, export, or product surface.                                                      | visual scope rationale                      | `N/A`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: future implementation briefs must define future-value behavior, but this docs-only slice changes no runtime logic or persisted data.                                     | forward compatibility contract              | `4/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: future admin workflow briefs must document new labels/actions/states and Help/Guide fallout; no admin editor behavior changes now.                                       | AGENTS/template/runbook diff                | `4/5`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: future UI briefs must continue to define accessible fallback/state behavior; this PR changes no markup, focus path, labels, or live regions.                             | template/audit-gate diff                    | `4/5`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because this changes no route, bundle, runtime code, media, payload, cache mode, or performance budget.                                                                               | performance scope rationale                 | `N/A`                   |
| Data placement and sync boundaries            | `supporting` | Supporting only: future stateful briefs must keep source-of-truth and additive future behavior explicit; this PR introduces no state boundary.                                            | template forward compatibility section      | `4/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no fetch, cache, revalidation, invalidation, CDN, or stale-data behavior changes.                                                                                             | cache scope rationale                       | `N/A`                   |
| Reliability and failure handling              | `target`     | Planned/in-progress briefs must not be treated as ready after governance/template changes unless refreshed; done briefs are corrected only when operationally necessary.                  | re-audit summary + audit-gate update        | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: future auth/admin/payment briefs must define fail-closed behavior for unknown values; no auth, roles, tokens, secrets, cookies, or protected APIs change.                | forward compatibility runbook               | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: future analytics/data briefs must define safe future payloads and unknown-value handling; no personal data, consent, retention, or logs change now.                      | runbook examples + scope review             | `4/5`                   |
| Content governance                            | `target`     | AGENTS, task-brief template, audit gate, and a reusable runbook must agree on the new contract and the AW-006 queue must record this governance slice.                                    | changed docs + queue update                 | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: future admin/user workflow briefs must update Help/Guide or state explicit N/A when labels/actions/recovery change; no workflow changes now.                             | AGENTS/template contract                    | `4/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: future public-route briefs must define route/metadata/slug compatibility when touched; no metadata, sitemap, robots, canonical, or public copy changes now.              | forward compatibility runbook               | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: future public semantic/metadata briefs must preserve AI-facing compatibility; no AI-facing content model changes now.                                                    | template contract                           | `4/5`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: future analytics briefs must define additive payload behavior from canonical data where possible; no analytics event taxonomy or runtime payload changes now.            | runbook product/catalog analytics guidance  | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: future commerce/product briefs must specify catalog, entitlement, checkout, and finance compatibility; no Stripe, checkout, price, invoice, or entitlement changes.      | forward compatibility contract              | `4/5`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support workflow, operator diagnostic path, escalation path, runbook procedure for live incidents, or support recovery behavior.                | explicit support-ops scope rationale        | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                                  | explicit finance scope rationale            | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because future briefs must state locale/copy/layout compatibility, but this PR changes no user-facing strings, locale routing, metadata localization, or translation workflow. | runbook i18n guidance                       | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Keep this slice in Markdown governance docs only; add no dependency, runtime abstraction, script, config, workflow, provider SDK, or lint rule that would mass-break old briefs.          | changed-files review                        | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed briefs/docs must pass brief lint, all-brief lint, docs-only verification, targeted sweeps, diff whitespace checks, CI, and pre-merge verification.                                | validation commands + CI                    | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: documenting the contract reduces future rework and review cost without adding runtime, storage, vendor, or CI cost.                                                      | docs-only governance scope                  | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Diff remains docs-only and normally revertable; no migrations, packages, workflows, env vars, generated assets, or production settings change.                                            | git diff + validation gates                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - N/A for runtime behavior; no component, route, server/client boundary, action/API route, cache mode, or rendering behavior changes.
  - Future implementation briefs must identify whether future values derive from canonical data, a typed union, a route param, or an explicit mapping.
- TypeScript/domain contracts:
  - N/A for code changes; no type, parser, validation layer, invariant, or error model changes in this PR.
  - Future briefs must define unknown/additive value behavior before changing domain contracts.
- Supabase/data layer:
  - N/A; no migration, RLS/authz, generated DB type, index, storage, or Supabase query changes.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, webhook, SDK, secret, retry, or idempotency behavior changes.
- UI system:
  - N/A for rendered UI; no screenshot handoff is required because this PR changes no UI, print, layout, brand, asset, or product-rendering file.
- Testing:
  - Docs-only validation through strict brief lint, all-brief lint, targeted lifecycle/contract sweeps, `git diff --check`, `verify:pre-pr`, CI, and `verify:pre-merge`.

## Data Placement And Sync Contract

N/A with rationale: this governance slice introduces no local-only state, server-canonical data, browser storage, sync trigger, conflict policy, cache invalidation, retention rule, or sensitive data handling. It defines process requirements for future briefs that do touch those surfaces.

## Identity And Rename Contract

N/A with rationale: this PR creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible identifier, alias, redirect, migration, rename rule, or repurpose policy. It requires future briefs that touch those identifiers to define the contract explicitly.

## Forward Compatibility Contract

This slice makes forward compatibility a durable process rule:

- Future next-slice recommendations must include a non-programmer explanation plus one sentence saying what should keep working when new products, labels, workflows, or data values are added, or what will require an explicit mapping update.
- Future new or refreshed implementation briefs must include `## Forward Compatibility Contract`.
- Future briefs must define:
  - additive values that are data-driven from canonical sources,
  - additive values that require explicit mapping/copy/test/doc updates,
  - safe fallback or fail-closed behavior for unknown/deprecated values,
  - test/evidence or an explicit `N/A` rationale.
- Existing planned and long-running in-progress briefs are not automatically ready after this governance change; they must be refreshed before execution.
- Historical `done/` briefs are not rewritten just to add the new section. They are corrected only when used as active references and the recorded contract is stale or operationally harmful.

## Planned And In-Progress Re-Audit

Audit command evidence:

- `rg --files docs/task-briefs/planned | wc -l` -> `28`
- `rg --files docs/task-briefs/in-progress | wc -l` -> `5`
- targeted `audit_status` sweep across `docs/task-briefs/planned` and `docs/task-briefs/in-progress`

Findings:

- `31` of `33` planned/in-progress briefs already have `audit_status: revise-before-use`.
- `1` planned brief is `blocked`: `docs/task-briefs/planned/2026-05-17-ios-native-shell-universal-links-auth-10-10.md`.
- `1` planned brief was `ready` for queue capture before this PR: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`.
- This PR updates the AW-006 queue to record the active governance slice; before any later AW-006 product implementation starts, the chosen implementation brief must be refreshed with the new forward compatibility contract.
- No planned or long-running in-progress implementation brief should be executed from its pre-existing text without a fresh audit after this AGENTS/template change.

## Done Brief Correction List

Immediate corrections required in historical `done/` briefs: none identified.

Reference-only rechecks required when reused:

- `docs/task-briefs/done/2026-05-23-aw-006-plans-funnel-analytics-payload-hardening-10-10.md`
  - Keep as the reference for catalog-driven analytics payloads, but future related analytics briefs must add their own forward compatibility contract.
- `docs/task-briefs/done/2026-05-19-aw-006-my-library-surface-token-action-hierarchy-polish-10-10.md`
  - Keep as the visual/reference surface for `/my-library`, but future My Library analytics/commerce work must define product/entitlement extensibility explicitly.
- AW-006 admin state-primitive done briefs
  - Keep as reference surfaces, but future admin workflow/state additions must define unknown/new state fallback and Help/Guide impact in the active brief.

## Help / Guide Impact

N/A with rationale: this PR changes repository governance docs only. It changes no user/admin workflow labels, product Help/Guide content, support recovery action, operator procedure, auth behavior, payment behavior, or support escalation path.

## Route / Label / Support Surface Sweep

Required as a governance/support-surface sweep because task-brief process rules and AW-006 queue state change.

- Identifiers to search before broad gates:
  - `Forward Compatibility Contract`
  - `forward compatibility`
  - `Pre-Implementation Owner Explanation`
  - `next slice`
  - `must_refresh_before_execution_if`
  - `revise-before-use`
  - `No AW-006 implementation slice is selected`
  - `Plans Funnel Analytics Payload Hardening`
  - `My Library`
- Surfaces to check:
  - `AGENTS.md`
  - `docs/task-brief-template.md`
  - `docs/runbooks/task-brief-audit-gate.md`
  - `docs/runbooks/task-brief-forward-compatibility-contract.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - selected `docs/task-briefs/done/` references listed above
- Expected fallout:
  - AGENTS and template gain durable forward compatibility rules,
  - audit gate points at the new checklist,
  - AW-006 queue records this governance slice before any next product implementation,
  - active brief records planned/in-progress and done-brief audit findings,
  - no runtime code, Help/Guide, app UI, tests, scripts, configs, workflows, provider behavior, screenshots, or assets change.

## Scope

- Update `AGENTS.md` with:
  - next-slice non-programmer explanation requirement,
  - forward compatibility requirement for new/refreshed implementation briefs,
  - Definition of Done guardrail for future additions.
- Update `docs/task-brief-template.md` with:
  - prompt quality gate entry,
  - required `Forward Compatibility Contract` section,
  - cross-cut category guidance.
- Update `docs/runbooks/task-brief-audit-gate.md`.
- Add `docs/runbooks/task-brief-forward-compatibility-contract.md`.
- Create this active governance brief with planned/in-progress re-audit and done-brief correction list.
- Update the canonical AW-006 queue to record this governance slice before the next product slice.

## Out Of Scope

- Runtime code, app UI, styles, tests, scripts, package/config/workflow changes, migrations, generated assets, screenshots, or product behavior.
- New lint enforcement that would require mass edits to old briefs.
- Rewriting all historical `done/` briefs.
- Implementing the previously recommended My Library analytics payload slice.
- Stripe, Supabase, auth, analytics route behavior, checkout, entitlements, products, prices, finance reports, Help/Guide, support procedures, or merge to `main`.

## Acceptance Criteria

1. AGENTS requires non-programmer explanation for next-slice recommendations and forward compatibility intent before implementation.
2. Task-brief template includes a required `Forward Compatibility Contract` section with source-of-truth, additive behavior, explicit mapping, unknown-value fallback, and evidence requirements.
3. Task-brief audit gate includes forward compatibility in the pre-use checklist and update triggers.
4. A reusable runbook exists for future brief authors.
5. Planned/in-progress re-audit findings are recorded without mass-editing stale briefs.
6. The historical done-brief correction list states whether immediate done-brief corrections are required.
7. AW-006 queue records this active governance slice before the next product implementation slice.
8. Diff remains docs-only.
9. `npm run lint:briefs`, `npm run lint:briefs:all`, targeted sweeps, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass.

## Validation

Targeted during implementation:

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- targeted route/label/support sweep listed above
- `git diff --check`

Broad gates:

- `npm run verify:pre-pr`
- required PR CI checks
- `npm run verify:pre-merge`

Docs-only lane is expected while the diff stays limited to Markdown docs.

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands should use escalation-first strategy per repo instructions.

## Manual QA / Screenshot Plan

No screenshot handoff is required because this governance slice changes no rendered UI, print, layout, brand, visual assets, export artifact, or product-rendering file.

## Checkpoint Log

- `2026-05-23 | in-progress | started from clean main@96c28b7 after PR #814 and repo-managed closeout PR #815; created branch docs/forward-compatibility-contract; short audit found 28 planned briefs, 5 in-progress briefs, no immediate historical done-brief correction requirement, and missing durable forward compatibility rules in AGENTS/template/audit gate | next: finish docs updates, run docs-only validation, commit, push, open PR, monitor CI, and run verify:pre-merge`
- `2026-05-23 | in-progress | updated AGENTS, task-brief template, task-brief audit gate, added a forward compatibility runbook, created this active brief, and linked the governance slice in the AW-006 queue; npm run lint:briefs skipped before commit because no changed brief exists in HEAD yet, npm run lint:briefs:all passed after queue wording repair, targeted route/label/support sweep completed, and git diff --check passed for tracked changes | next: stage docs, run staged diff check and npm run verify:pre-pr`
- `2026-05-23 | in-progress | staged docs diff passed git diff --cached --check and npm run verify:pre-pr passed the docs-only lane with log artifacts/test-runs/20260523-093544/verify.log | next: commit, rerun verify:pre-pr on the committed branch state, push, open PR, monitor CI, and run verify:pre-merge`
- `2026-05-23 | in-progress | committed docs: add forward compatibility brief contract and reran npm run verify:pre-pr successfully on the committed docs-only branch state with log artifacts/test-runs/20260523-093711/verify.log | next: push branch, open PR, monitor CI, and run verify:pre-merge`
