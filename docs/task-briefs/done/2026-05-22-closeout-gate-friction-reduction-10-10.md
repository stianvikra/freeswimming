# Task Brief: Closeout Gate Friction Reduction (10/10)

## Metadata

- `id`: `2026-05-22-closeout-gate-friction-reduction-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-22`
- `updated`: `2026-05-22`
- `branch`: `tooling/closeout-gate-friction-reduction`
- `precedes`: next AW-006 UI implementation slice

## Brief Audit Record

- `last_audited`: `2026-05-22`
- `base`: `main@aaa891c`
- `audit_status`: `ready`
- `decision`: Execute a small tooling/governance slice before the next AW-006 UI slice.
- `reason`: `main` is clean after PR `#804` and repo-managed closeout `#805`; post-merge preflight is green. The fresh queue/design/code re-audit found no selected AW-006 UI slice, but repeated closeout work still requires manual queue/inventory fallout checks and manual Completion Record drafting before the first gate.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, task-brief scorecard rules, `lint:briefs`, `lint:briefs:all`, `post-merge:preflight`, docs-only verification, PR flow, or AW-006 queue lifecycle rules change before PR handoff.

## Goal

Reduce repeated docs-only closeout gate friction by making closeout fallout more visible and generating a deterministic Completion Record starter without changing product behavior.

## Pre-Implementation Owner Explanation

Vi strammer inn repo-verktøyene som brukes etter en PR er merget, slik at closeout-arbeidet blir mindre manuelt og lettere å gjøre riktig første gang. Dette betyr noe fordi AW-006-slicene har hatt mye repetisjon rundt brief-closeout, queue/inventory-oppdateringer og første verifiseringsgate. Utenfor scope er produkt-UI, admin workflows, API-er, database, Stripe, auth, historisk masseopprydding av gamle briefs og merge til `main` uten eksplisitt godkjenning.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                        | Evidence                                                   | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Closeout tooling must support the next AW-006 slice by surfacing required lifecycle/fallout work before the first broad gate.                                             | script output tests + active brief                         | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: operator flow becomes clearer, but no user-facing product UX changes.                                                                                    | post-merge summary review                                  | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this changes no rendered UI, layout, design token, asset, screenshot, print, or brand surface.                                                                | visual scope rationale                                     | `N/A`                   |
| Business logic correctness and data integrity | `target`     | `lint:briefs:all` must fail closed for invalid all-brief checks without requiring historical done-brief closeout migration, and preflight output must be deterministic.   | targeted unit tests + local lint commands                  | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor action, CRUD flow, workflow label, recovery behavior, or operator UI.                                                            | admin scope rationale                                      | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no markup, focus behavior, live region, keyboard path, label, contrast, or screen-reader semantics change.                                                    | a11y scope rationale                                       | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no runtime route, JavaScript bundle, CSS, media, cache mode, or Core Web Vitals budget changes.                                                               | performance scope rationale                                | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this introduces no local/browser data, server-canonical product data, storage, sync policy, conflict behavior, retention rule, or sensitive-data flow.        | data scope rationale                                       | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no fetch path, route cache, invalidation trigger, CDN behavior, revalidation, or stale-data contract changes.                                                 | cache scope rationale                                      | `N/A`                   |
| Reliability and failure handling              | `target`     | Post-merge preflight must show closeout actions, stale queue/inventory fallout, and a Completion Record starter before the first closeout gate.                           | post-merge preflight tests + smoke command                 | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because no protected route, authz check, credentials, cookies, token handling, secrets, input validation surface, or role behavior changes.                           | security scope rationale                                   | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data, logs, analytics payloads, legal copy, consent behavior, retention, or raw env values are touched.                                               | privacy scope rationale                                    | `N/A`                   |
| Content governance                            | `target`     | Closeout output must explicitly list queue/inventory fallout and provide a consistent Completion Record starter for repo-managed closeout PRs.                            | script diff + tests + runbook update                       | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow label, Help/Guide content, support action, editable field, audit trail, or recovery path changes.                                           | workflow scope rationale                                   | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public route, metadata, sitemap, robots, canonical URL, structured data, or crawl-facing content changes.                                                  | SEO scope rationale                                        | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                       | AI-discoverability scope rationale                         | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics taxonomy, KPI, event payload, dashboard, logging, or reporting behavior changes.                                                                 | analytics scope rationale                                  | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no Stripe, checkout, entitlement, price, invoice, refund, payout, reconciliation, or revenue path changes.                                                    | commerce scope rationale                                   | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes repo closeout tooling only, not incident alerting, support diagnostics, escalation, support runbook procedure, or recovery operations.                  | explicit support-ops scope rationale                       | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, invoice/refund path, payout, entitlement, reconciliation, finance report, or revenue recognition data.                        | explicit finance scope rationale                           | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A: this changes no user-facing product strings, locale routing, translation workflow, metadata localization, or grammar-coupled UI layout.                              | explicit i18n scope rationale                              | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Node/bash tooling and Vitest tests; add no dependency, workflow, package, or external service.                                                             | changed-files diff + package diff                          | `5/5`                   |
| Testing and QA automation                     | `target`     | Add targeted unit coverage for all-brief hard-fail behavior and post-merge closeout output; run targeted tests, lint, typecheck, full `verify:pre-pr`, CI, and pre-merge. | targeted tests + `verify:pre-pr` + CI + `verify:pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: clearer closeout automation reduces review/restart cost and adds no runtime infrastructure or recurring service cost.                                    | bounded script/test scope                                  | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible with normal git revert; no migrations, env config, secrets, workflows, packages, or production settings are allowed.                            | git diff review + full validation gates                    | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - N/A; no route, component, server/client boundary, action/API route, cache mode, or rendering behavior changes.
- TypeScript/domain contracts:
  - N/A for product domain; this changes repo tooling behavior only.
  - Deterministic tooling invariants:
    - `lint:briefs:all` remains all-brief coverage and must fail closed for malformed current/enforced briefs.
    - historical done briefs must not be forced through a mass closeout migration in this slice.
    - post-merge preflight must expose pending closeout actions, queue/inventory fallout, and a Completion Record starter from the same inspected ref.
- Supabase/data layer:
  - N/A; no migration, RLS/authz, generated type, index, storage, or data access behavior changes.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, SDK, webhook, secret, retry, idempotency, or observability integration changes.
- UI system:
  - N/A; screenshot handoff is not required because no UI/print/layout/brand/product-rendering file changes.
- Testing:
  - Extend existing Vitest coverage for task-brief lint and post-merge preflight.
  - Run full validation lane because scripts/tests change.

## Data Placement And Sync Contract

N/A with rationale: this is repository tooling work. It introduces no local-only product data, server-canonical data, browser storage, sync trigger, conflict policy, cache invalidation, retention rule, or sensitive-data handling.

## Identity And Rename Contract

N/A with rationale: this creates no persisted product entity, route param, slug, human-readable title identity, analytics identity, operator-visible product identifier, alias, redirect, migration, rename rule, or repurpose policy.

## Help / Guide Impact

N/A with rationale: this changes no user/admin workflow labels, Help/Guide content, support recovery behavior, operator action meaning, auth, payments, or support procedure. The PR-flow runbook may be updated because repo closeout procedure changes.

## Route / Label / Support Surface Sweep

Required as a tooling/governance sweep, not a product route sweep.

- Terms to sweep before broad gates:
  - `lint:briefs:all`
  - `Completion Record`
  - `post-merge:preflight`
  - `queue/inventory`
  - `closeout`
  - `docs-only`
- Surfaces to check:
  - `scripts/lint-task-brief-scorecard.mjs`
  - `scripts/post-merge-preflight.mjs`
  - `scripts/run-verify-docs-only.sh`
  - `tests/unit/`
  - `docs/runbooks/`
  - `docs/task-briefs/`
- Expected fallout:
  - active tooling brief,
  - targeted script/test updates,
  - runbook wording if operator procedure changes,
  - no product code, UI, Help/Guide runtime content, API, database, package, workflow, or screenshot artifacts.
- Sweep evidence:
  - `2026-05-22`: identifiers searched: `lint:briefs:all`, `Completion Record`, `post-merge:preflight`, `queue/inventory`, `closeout`, and `docs-only`.
  - `2026-05-22`: surfaces checked: `scripts/post-merge-preflight.mjs`, `scripts/lint-task-brief-scorecard.mjs`, `scripts/run-verify-docs-only.sh`, `tests/unit/`, `docs/runbooks/`, and this active task brief.
  - `2026-05-22`: fallout handled in this PR is limited to targeted script/test updates and `docs/runbooks/pr-flow-and-chat-handoff.md`; no product Help/Guide, UI, API, database, package, workflow, or screenshot fallout found.

## Scope

- Keep all changes inside repo tooling, unit tests, runbook/task-brief docs, and PR-flow guidance.
- Make all-brief lint semantics explicit and regression-tested.
- Make post-merge preflight print a deterministic Completion Record starter when a pending closeout exists.
- Make post-merge preflight surface queue/inventory fallout before the first closeout verification gate.
- Update this active brief checkpoint evidence.

## Out Of Scope

- Product UI, CSS, app routes, admin workflows, API behavior, Supabase, Stripe, auth, analytics, database, generated DB types, package dependencies, GitHub Actions/workflows, screenshots, visual QA, merge to `main`, or broad redesign.
- Mass editing historical done briefs to satisfy modern closeout rules.
- Changing the content of actual future closeout records beyond generating a starter template.
- Selecting or implementing the next AW-006 UI slice.

## Acceptance Criteria

1. `lint:briefs:all` behavior is explicitly tested as fail-closed for malformed all-brief inputs while preserving the existing legacy-safe historical closeout boundary.
2. `post-merge:preflight` prints a Completion Record starter when it detects pending in-progress brief closeout work.
3. `post-merge:preflight` lists queue/inventory fallout before the suggested verification/PR gate steps when stale references are detected.
4. Runbook/docs explain the new closeout helper output without changing product procedure.
5. Diff contains no product runtime/UI/API/database/package/workflow changes.
6. Targeted tests, route/label/support sweep, `git diff --check`, `npm run lint:briefs`, `npm run lint:briefs:all`, `npm run lint`, `npm run typecheck`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `./node_modules/.bin/vitest run tests/unit/task-brief-scorecard-lint.test.ts tests/unit/merge-preflight.test.ts tests/unit/verify-pre-merge-script.test.ts`
  - `npm run lint:briefs`
  - `npm run lint:briefs:all`
  - `npm run lint`
  - `npm run typecheck`
  - targeted route/label/support sweep listed above
  - `git diff --check`
- Broad gates:
  - `npm run verify:pre-pr`
  - required PR CI checks
  - `npm run verify:pre-merge`

Full lane is required because scripts/tests change.

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands should use escalation-first strategy per repo instructions.

## Checkpoint Log

- `2026-05-22 | in-progress | started from clean main@aaa891c after PR #804 and repo-managed closeout #805; post-merge preflight is green with no pending closeout; scoped this as a tooling/governance slice before the next AW-006 UI implementation | next: implement lint/preflight helper updates and targeted tests`
- `2026-05-22 | in-progress | implemented target-category extraction reuse, post-merge Completion Record starter output, pending closeout queue/inventory fallout detection, closeout gate order output, and runbook guidance; targeted Vitest passed for task-brief lint, merge/preflight, and pre-merge script tests; lint:briefs:all, lint, typecheck, targeted sweep, and git diff --check passed | next: commit, run verify:pre-pr, push, open PR, monitor CI, then run verify:pre-merge`
- `2026-05-22 | quality-gate-fix | first verify:pre-pr failed in lint:quality-gates because the active brief used "Terms to sweep" and "Surfaces to check" wording but not the exact required "identifiers searched" and "surfaces checked" evidence phrases; added explicit sweep evidence without changing runtime/tooling code | next: rerun targeted brief/quality gates, amend commit, then rerun verify:pre-pr`
- `2026-05-22 | pre-pr | targeted brief/quality gates passed after the evidence wording fix; amended commit 31ec83c; full npm run verify:pre-pr passed with lint, typecheck, unit, build, perf budgets, and Playwright (98 passed, 478 skipped) | next: amend this checkpoint into the commit, rerun verify:pre-pr on the final diff, push, open PR, monitor CI, then run verify:pre-merge`
- `2026-05-22 | merged | PR #806 merged to main as f38bf63; post-merge preflight surfaced this single repo-managed docs-only closeout; moved brief to done and completed the closeout record | next: run docs-only closeout gates and merge closeout PR if green`

## Completion Record

- `completed`: `2026-05-22`
- `merged_pr`: `#806`
- `squash_commit`: `f38bf63`
- `result`: Closed Closeout Gate Friction Reduction; post-merge tooling now prints the closeout gate order, a deterministic Completion Record starter, and queue/inventory fallout before the first closeout gate.
- `validation`: Targeted Vitest passed; `npm run lint:briefs`, `npm run lint:briefs:all`, `npm run lint`, `npm run typecheck`, targeted route/label/support sweep, `git diff --check`, `npm run verify:pre-pr`, PR CI for #806, and `npm run verify:pre-merge` passed.
- `10/10 claim`: yes - all critical target categories reached `5/5`; no remaining gaps.

| Category                                      | Achieved Score | Evidence                                                                                                                                  | Gaps / Notes |
| --------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | Post-merge preflight output now surfaces closeout gate order, Completion Record starter, and closeout fallout before first gate.          | None         |
| Business logic correctness and data integrity | `5/5`          | Unit coverage confirms all-brief lint fail-closed behavior and deterministic preflight closeout output.                                   | None         |
| Reliability and failure handling              | `5/5`          | Preflight closeout paths list required lifecycle actions and fallout before verification commands.                                        | None         |
| Content governance                            | `5/5`          | Runbook, active brief, and preflight output align on Completion Record and queue/inventory closeout handling.                             | None         |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing Node/Vitest tooling; no package, workflow, runtime, UI, API, database, or dependency changes.                             | None         |
| Testing and QA automation                     | `5/5`          | Targeted Vitest, lint gates, typecheck, full `verify:pre-pr`, PR CI, and `verify:pre-merge` passed.                                       | None         |
| DevOps and rollback readiness                 | `5/5`          | Scope is reversible with normal git revert and has no migrations, env changes, secrets, package changes, workflows, or production config. | None         |
