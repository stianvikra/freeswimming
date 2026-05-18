# Task Brief: Owner-Readable Slice Start Governance (10/10)

## Metadata

- `id`: `2026-05-18-owner-readable-slice-start-governance-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-18`
- `updated`: `2026-05-18`

## Goal

Make every new brief or implementation slice start with a short Norwegian explanation that a non-programmer can understand before Codex begins implementation.

## Pre-Implementation Owner Explanation

Vi legger inn en fast arbeidsregel for Codex: for hver ny brief eller slice skal Codex først forklare kort på norsk hva som skal gjøres, hvorfor det betyr noe, og hva som ikke skal røres. Dette gjør det lettere for eier å forstå retningen før teknisk arbeid starter, uten å endre produktet eller app-opplevelsen.

## Brief Audit Record

- `last_audited`: `2026-05-18`
- `base`: `main@cfeae0e`
- `audit_status`: `ready`
- `decision`: Execute as a small docs-only governance slice.
- `reason`: Owner explicitly asked to systematize the pre-implementation explanation rule after confirming `main` was clean and post-merge preflight had no pending closeout.
- `must_refresh_before_execution_if`: AGENTS.md, task-brief lifecycle rules, brief-audit runbook, scorecard categories, or verification lane rules change before PR handoff.

## Why This Brief Exists

Codex already has strong handoff rules after work is complete, but the start of a new brief or slice can still become too technical too quickly.

This slice adds a simple start gate: before implementation begins, Codex must explain in Norwegian what will be done and why it matters, in language suitable for a non-programmer. That gives the owner a clear checkpoint before code or docs change.

## Scope

- Add the pre-implementation owner explanation rule to `AGENTS.md`.
- Add the same requirement to `docs/task-brief-template.md`.
- Add lifecycle guidance to `docs/task-briefs/README.md`.
- Add the pre-use check to `docs/runbooks/task-brief-audit-gate.md`.
- Keep the change Markdown-only and governance-only.

## Out Of Scope

- Runtime app code, UI, styling, tests, scripts, package/config, workflows, migrations, and provider settings.
- Any product copy, admin workflow, Help/Guide content, route labels, or user-facing screen behavior.
- Enforcing the rule with a parser or CI script in this slice.
- Rewriting historical `done` briefs or existing planned/in-progress brief bodies beyond this active brief.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this docs-only governance slice:

- Product goals and IA
- UX flow clarity
- Content governance
- Reliability and failure handling
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                        | Evidence                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | New briefs/slices must start with a clear owner-readable statement of what will be done, why it matters, and what stays out of scope.                     | AGENTS.md + brief template + lifecycle docs review | `5/5`                   |
| UX flow clarity                               | `target`     | The owner can understand the next workstream before implementation starts without reading technical details first.                                        | governance wording review                          | `5/5`                   |
| Visual design quality                         | `N/A`        | N/A because this Markdown-only governance slice changes no rendered UI, layout, typography, print, screenshot, or brand surface.                          | docs-only diff review                              | `N/A`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: the rule reduces scope mistakes before implementation; no runtime state, mutation, or domain invariant changes.                          | scope review                                       | `4/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: future admin slices should start with clearer owner context; no admin editor UI or workflow changes now.                                 | AGENTS.md wording                                  | `4/5`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: plain owner language improves process accessibility; no interactive a11y surface changes.                                                | docs wording review                                | `4/5`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no runtime route, JavaScript payload, build output, Core Web Vitals budget, or browser behavior changes.                                      | docs-only diff review                              | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this slice creates no app state, database writes, browser storage, sync behavior, or cache boundary.                                          | explicit non-stateful scope rationale              | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no read path, cache mode, revalidation trigger, CDN behavior, or server/client data freshness contract changes.                               | explicit cache scope rationale                     | `N/A`                   |
| Reliability and failure handling              | `target`     | The start gate must fail safe by pausing implementation until the owner-readable explanation is given, unless the owner already provided it clearly.      | AGENTS.md + runbook/template wording               | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no authz surface changes; the start explanation can surface auth/security scope before future risky work starts.                         | governance wording review                          | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no personal data or privacy behavior changes; the explanation should avoid secrets/raw env values like other handoff docs.               | docs review                                        | `4/5`                   |
| Content governance                            | `target`     | Canonical collaboration docs and task-brief docs must carry the same pre-implementation explanation rule.                                                 | changed docs diff                                  | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: future workflow slices should explain owner/admin impact before implementation; no workflow labels/actions/recovery behavior change now. | scope review                                       | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public route, metadata, sitemap, robots, canonical, or crawlable content changes are in scope.                                             | explicit public-surface scope rationale            | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured data, crawl-safe docs page, or AI-discoverable product surface changes.                                | explicit AI-discoverability scope rationale        | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no product analytics change; future KPI-sensitive slices should explain measurement impact before implementation.                        | governance wording review                          | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no Stripe, pricing, entitlement, checkout, billing, refund, payout, invoice, or revenue operation changes.                                    | explicit commerce scope rationale                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this slice changes collaboration governance only, not incident tooling, alerting, escalation, support diagnostics, or recovery runbooks.      | explicit support-ops scope rationale               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice changes no finance/reporting behavior, reconciliation data, payouts, invoices, refunds, or entitlement reporting.                  | explicit finance scope rationale                   | `N/A`                   |
| i18n operational readiness                    | `target`     | The start explanation rule must explicitly use Norwegian for owner communication while avoiding changes to app localization architecture.                 | AGENTS.md + template wording                       | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Keep the implementation in existing Markdown governance docs; add no dependency, script, workflow, or parser unless a later slice proves it is needed.    | changed-files diff                                 | `5/5`                   |
| Testing and QA automation                     | `target`     | Docs-only brief lint and pre-PR/pre-merge verification pass; no skipped validation is used to hide failures.                                              | `npm run lint:briefs:all`, `verify` gates          | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the rule is short and reusable so frequent new slices do not require heavy process overhead.                                             | docs review                                        | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Diff remains docs-only with normal git revert rollback; branch follows docs-only pre-PR and pre-merge gates.                                              | git diff + local verification + PR checks          | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - no app route, component, server/client boundary, cache, or revalidation behavior changes.
- TypeScript/domain contracts:
  - no TypeScript, runtime validation, or domain contract changes.
- Supabase/data layer:
  - no migrations, RLS, indexes, generated DB types, or data access behavior changes.
- External services/tools:
  - no provider access, SDK/config changes, secrets, webhook behavior, or observability integration changes.
- UI system:
  - no rendered UI, layout, brand, print, or screenshot surface changes.
- Testing:
  - docs-only validation through brief lint and verify gates.

## Data Placement And Sync Contract

N/A for runtime state because this slice updates Markdown governance docs only.

Documentation state boundaries:

- The active brief and governance docs are git-tracked source-of-truth for this process rule.
- No app data, browser storage, database row, provider state, cache, or sync boundary changes.
- Future implementation slices must still define their own data placement when stateful work is in scope.

## Identity And Rename Contract

N/A for persisted product entities because this slice does not create or mutate users, routes, slugs, database rows, notes, workouts, programs, commerce entities, or operator-visible product identifiers.

Process identity:

- The stable process term is `pre-implementation owner explanation`.
- If renamed later, update `AGENTS.md`, the task-brief template, task-brief README, and brief-audit runbook together.

## Help / Guide Impact

N/A because this slice changes repo collaboration governance, not admin/user workflow labels, Help/Guide content, support recovery steps, or product behavior.

## Route / Label / Support Surface Impact Sweep

Run a targeted sweep before PR handoff for:

- `plain-language`
- `owner-readable`
- `non-programmer`
- `new brief`
- `slice`
- `Brief Audit Record`
- `task brief`

Expected fallout is limited to governance docs and this active brief. Runtime routes, Help/Guide, UI labels, and support workflows are out of scope.

Sweep evidence:

- `2026-05-18`: ran `rg -n "plain-language|owner-readable|non-programmer|new brief|slice|Brief Audit Record|task brief" AGENTS.md docs/task-brief-template.md docs/task-briefs/README.md docs/runbooks docs/task-briefs/in-progress/2026-05-18-owner-readable-slice-start-governance-10-10.md`.
- Fallout handled in this PR: `AGENTS.md`, `docs/task-brief-template.md`, `docs/task-briefs/README.md`, `docs/runbooks/task-brief-audit-gate.md`, and this active brief.
- Intentional leftovers: existing product/runbook uses of `slice`, `task brief`, and handoff language remain unchanged because they do not define the new pre-implementation owner explanation rule.

## Acceptance Criteria

1. `AGENTS.md` requires Codex to provide the Norwegian non-programmer explanation before starting a new brief or slice.
2. `docs/task-brief-template.md` asks every new brief to include that owner-readable start explanation.
3. `docs/task-briefs/README.md` documents the rule in the lifecycle guidance.
4. `docs/runbooks/task-brief-audit-gate.md` includes the explanation check before a brief is marked ready.
5. Diff remains Markdown-only.
6. `npm run lint:briefs:all`, `git diff --check`, `npm run verify:pre-pr`, and `npm run verify:pre-merge` pass before merge readiness.

## Validation

- `npm run lint:briefs:all`
- `git diff --check`
- `npm run verify:pre-pr`
- before merge recommendation: `npm run verify:pre-merge`

Docs-only lane is expected while the diff remains Markdown documentation under `AGENTS.md` and `docs/`.

## Manual QA

N/A because this slice does not change rendered UI, browser behavior, print/export output, routes, or screenshots.

Owner review should focus on whether the new start explanation rule is easy to understand and lightweight enough for every future brief/slice.

## Implementation Checkpoint Log

- `2026-05-18 | working tree | started branch codex/governance-owner-brief-explanation from main@cfeae0e after clean git status and post-merge preflight found no pending closeout; created active docs-only governance brief and scoped the start-explanation rule to AGENTS.md, task-brief template, task-brief README, and brief-audit runbook | next: patch canonical docs, run docs-only validation, commit, push, open PR, monitor CI, and run verify:pre-merge`
- `2026-05-18 | working tree | implemented the docs-only start-explanation rule, recorded route/label/support-surface sweep evidence, and passed npm run lint:briefs:all, git diff --check, and npm run verify:pre-pr using the docs-only lane with log artifacts/test-runs/20260518-211149/verify.log | next: rerun pre-PR after checkpoint-log update, commit, push, open PR, monitor CI, and run verify:pre-merge`
