# Task Brief: AW-006 Remaining Queue Re-Audit (10/10)

## Metadata

- `id`: `2026-05-19-aw-006-remaining-queue-reaudit-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-19`
- `updated`: `2026-05-19`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `branch`: `docs/aw-006-queue-reaudit`

## Goal

Refresh the canonical AW-006 UX/UI queue after Sample Deliverable Proof shipped, so the next implementation slice starts from current repo truth instead of stale chat or queue memory.

## Pre-Implementation Owner Explanation

Vi rydder arbeidslisten før vi bygger mer. Det betyr å oppdatere AW-006-planen slik at ferdig arbeid ikke ser åpent ut, og velge neste lille UX/UI-forbedring basert på faktisk status. Dette hindrer at vi starter gammel jobb på nytt. Utenfor scope er UI-kode, designendringer, tester, screenshots, Stripe, Supabase og brukerflyt-endringer.

## Brief Audit Record

- `last_audited`: `2026-05-19`
- `base`: `main@61d7f8a`
- `audit_status`: `ready`
- `decision`: Execute as a small docs-only AW-006 queue refresh before starting another rendered UX/UI slice.
- `reason`: Sample Deliverable Proof shipped through PR `#754` and lifecycle closeout `#755`, but the canonical AW-006 queue still marked that slice as `current` and listed re-audit as remaining. The queue now needs to mark completed work accurately and promote one next PR-sized implementation slice.
- `must_refresh_before_execution_if`: Refresh if AW-006 scope, the canonical queue, task-brief scorecard rules, verification lanes, screenshot handoff rules, `/my-library`, design tokens, component primitives, commerce/entitlement surfaces, Help/Guide rules, or parent backlog status changes before PR handoff.

## Scope

- Create this active docs-only re-audit brief.
- Update the canonical AW-006 queue to mark Sample Deliverable Proof as shipped through `#754/#755`.
- Remove stale `current` language for the already-shipped sample-proof slice.
- Promote one recommended next small PR-sized AW-006 implementation slice with likely files, risks, protected areas, and screenshot requirement.
- Add queue-refresh checkpoint evidence so future chats can resume from the updated source of truth.

## Out Of Scope

- Runtime app code, UI implementation, CSS, tests, scripts, configs, workflows, migrations, generated files, or assets.
- Screenshot capture or visual approval.
- Stripe Checkout, product catalog, prices, invoices, entitlements, refunds, payouts, or reporting.
- Supabase schema/RLS/data access, auth behavior, analytics events, Help/Guide content, route labels, support workflows, or user-facing product copy.
- Native iOS shell, Universal Links, performance-budget ratcheting, broad design-system rollout, or merge to `main`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this docs-only re-audit slice:

- `Product goals and IA`
- `UX flow clarity`
- `Reliability and failure handling`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                        | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | AW-006 queue reflects shipped work and names exactly one recommended next small implementation slice.                                                                     | canonical queue diff + active brief         | `5/5`                   |
| UX flow clarity                               | `target`     | The next slice is described with objective, likely files, risks, protected areas, and screenshot gate so the owner can approve the next start point without chat memory.  | remaining queue table                       | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: the chosen next slice is visual/UI work and must preserve AW-006 screenshot handoff rules, but this PR changes no rendered UI.                           | queue wording                               | `4/5`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because this Markdown-only queue refresh changes no runtime state, persisted data, mutations, validation, domain invariant, checkout, entitlement, or business truth. | docs-only diff review                       | `N/A`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: the review still captures admin/member consistency as later AW-006 work; no admin editor UI or workflow changes here.                                    | refreshed queue notes                       | `4/5`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: the next UI slice must preserve semantic/a11y checks, but this PR changes no labels, focus behavior, semantics, contrast, or browser interaction.        | queue protected-area wording                | `4/5`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because this PR changes no route, JavaScript payload, CSS, media asset, build output, cache behavior, or Core Web Vitals budget.                                      | docs-only diff review                       | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this PR introduces no local data, server-canonical data, browser storage, sync policy, cache mutation, retention rule, or sensitive data flow.                | explicit stateless scope rationale          | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no fetch path, route cache mode, revalidation trigger, mutation response, CDN behavior, or stale-data contract changes.                                       | explicit cache scope rationale              | `N/A`                   |
| Reliability and failure handling              | `target`     | The queue must no longer point future work at a completed `current` slice, reducing the risk of restarting stale scope.                                                   | canonical queue diff + checkpoint log       | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because this PR changes no protected route, authz check, auth provider behavior, token handling, cookies, secrets, or request input.                                  | explicit security scope rationale           | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because this PR stores no user data, secrets, env values, analytics payloads, legal copy, consent behavior, or privacy-sensitive output.                              | explicit privacy scope rationale            | `N/A`                   |
| Content governance                            | `target`     | The canonical queue records current lifecycle truth for `#754/#755` and the next recommendation in one repo-backed source of truth.                                       | canonical queue + done brief references     | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: future workflow slices must still update Help/Guide/runbooks when labels or recovery paths change; this PR changes no workflow.                          | Help/Guide impact rationale                 | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this PR changes no public route, metadata, sitemap, robots, canonical URL, structured data, or crawlable product page.                                        | explicit SEO scope rationale                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this PR changes no public semantic content model, structured entity surface, crawl-safe page content, or AI-facing documentation contract.                    | explicit AI-discoverability scope rationale | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: later AW-006 slices may add conversion or funnel instrumentation; this PR changes no event taxonomy, payload, logging, dashboard, or KPI definition.     | refreshed phase plan                        | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: commerce-protected areas remain called out for future UI slices; this PR changes no Stripe, pricing, entitlement, invoice, payout, or reporting path.    | remaining queue risk notes                  | `4/5`                   |
| Incident response and support operations      | `N/A`        | N/A because this PR changes no incident tooling, alert path, escalation path, support diagnostics, runbook, recovery workflow, or operator action.                        | explicit support-ops scope rationale        | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because this PR changes no billing, reconciliation, finance report, payout, refund, invoice, entitlement, provider financial data, or revenue operation.              | explicit finance scope rationale            | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this PR changes no user-facing product strings, locale routing, translation workflow, metadata localization, or grammar-coupled UI layout.                    | explicit i18n scope rationale               | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Keep the change in Markdown task briefs only; add no dependency, script, workflow, parser, runtime component, provider integration, or architecture refactor.             | changed-files diff                          | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed briefs pass brief lint, diff whitespace checks, docs-only `verify:pre-pr`, GitHub checks, and docs-only `verify:pre-merge` before merge readiness.                | local validation + CI evidence              | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the queue keeps AW-006 decomposed into small PR-sized slices to reduce review and regression cost; runtime cost is unchanged.                            | PR-sized queue table                        | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Diff is docs-only with normal git revert rollback; PR follows pre-PR, CI, and pre-merge gates before merge recommendation.                                                | git diff + validation evidence + PR checks  | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - N/A; no route, component, server/client boundary, action/API route, cache mode, or revalidation behavior changes.
  - The promoted future UI slice must identify its reference surfaces before implementation.
- TypeScript/domain contracts:
  - N/A; no TypeScript types, validation layer, error model, or deterministic domain invariant changes.
- Supabase/data layer:
  - N/A; no migration, RLS/authz rule, generated DB type, index, storage, or data access behavior changes.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, SDK, webhook, secret, retry, or idempotency change.
- UI system:
  - This PR updates queue planning only.
  - Any next UI/print/layout/brand implementation requires screenshot handoff before `npm run verify:pre-pr`.
- Testing:
  - Docs-only validation through `lint:briefs`, `git diff --check`, `verify:pre-pr`, CI, and `verify:pre-merge`.

## Data Placement And Sync Contract

N/A with rationale: this is a docs-only queue refresh. It introduces no local-only state, server-canonical state, browser storage, sync trigger, conflict policy, cache invalidation, retention rule, or sensitive data handling.

## Identity And Rename Contract

N/A with rationale: this PR creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename/repurpose policy, alias, redirect, or compatibility mapping.

## Help / Guide Impact

N/A with rationale: this PR changes no user/admin workflow labels, Help/Guide content, support recovery behavior, operator instructions, or runbook procedure. Future AW-006 implementation slices must update Help/Guide or runbooks when they change labels, workflows, recovery behavior, auth, payments, or support paths.

## Route / Label / Support Surface Sweep

Required as a docs/task-brief accuracy sweep only.

- Identifiers to search before PR handoff:
  - `AW-006`
  - `Sample deliverable`
  - `#754`
  - `#755`
  - `current`
  - `Remaining PR-Sized UX/UI Slices`
  - `My Library`
  - `design token`
- Surfaces to check:
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/task-briefs/done/`
  - `docs/design/`
  - `docs/runbooks/`
- Expected fallout:
  - this active brief and canonical AW-006 queue only,
  - no product code, Help/Guide, runbook, support workflow, route label, or rendered UI changes.
- Sweep evidence:
  - `2026-05-19`: ran `rg -n 'Sample deliverable proof|Re-audit remaining AW-006 queue after sample proof|Sample deliverable proof.*current|Status: \`current\`|Current follow-up execution|My Library surface token|#754|#755|Remaining PR-Sized UX/UI Slices' docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md docs/task-briefs/in-progress/2026-05-19-aw-006-remaining-queue-reaudit-10-10.md docs/task-briefs/done/2026-05-18-aw-006-sample-deliverable-proof-10-10.md docs/design docs/runbooks`.
  - Expected fallout was limited to the canonical AW-006 queue, this active brief, and the done Sample Deliverable Proof brief evidence. The only remaining `Status: \`current\`` line is this re-audit slice, not the already-shipped sample-proof slice.

## Acceptance Criteria

1. Canonical AW-006 queue marks Sample Deliverable Proof as done with `#754/#755` evidence.
2. No remaining queue item describes the already-shipped sample-proof slice as `current`.
3. The queue recommends one next small implementation slice with objective, likely files, risks, protected areas, and screenshot handoff requirement.
4. Diff remains docs-only and does not touch runtime code, UI, tests, scripts, configs, workflows, generated files, provider behavior, or assets.
5. `npm run lint:briefs:all`, `git diff --check`, `npm run verify:pre-pr`, GitHub checks, and `npm run verify:pre-merge` pass before merge readiness.

## Validation

- `npm run lint:briefs:all`
- `git diff --check`
- `npm run verify:pre-pr`
- GitHub required checks green for the PR
- before merge recommendation:
  - `npm run verify:pre-merge`

Docs-only lane is expected while the diff stays limited to Markdown task briefs.

## Manual QA

N/A because this PR changes no rendered UI, browser behavior, print/export output, route, layout, or asset.

Owner review should focus on whether the chosen next AW-006 slice is the right next small implementation target.

## Session Continuity And Recovery

- Canonical source of truth:
  - branch `docs/aw-006-queue-reaudit`,
  - this active brief,
  - canonical AW-006 queue brief.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint.

## Implementation Checkpoint Log

- `2026-05-19 | working tree | started from clean main@61d7f8a after PR #754 and closeout #755; post-merge preflight found no pending repo-managed closeout; created branch docs/aw-006-queue-reaudit and scoped this as docs-only queue accuracy work | next: update canonical AW-006 queue, run docs-only validation, commit, push, open PR, monitor CI, and run verify:pre-merge`
- `2026-05-19 | working tree | updated the canonical queue to mark Sample Deliverable Proof done, promoted My Library surface token and action hierarchy polish as the next small implementation slice, recorded route/label/support sweep evidence, and passed npm run lint:briefs:all plus git diff --check | next: run npm run verify:pre-pr, commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
- `2026-05-19 | working tree | npm run verify:pre-pr passed the docs-only lane twice, first with log artifacts/test-runs/20260519-055711/verify.log and again after checkpoint evidence with log artifacts/test-runs/20260519-055725/verify.log; branch-current, brief lint, quality-gate summary, admin-audit lint, env-parity lint, and generated PR-body lint passed | next: commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
