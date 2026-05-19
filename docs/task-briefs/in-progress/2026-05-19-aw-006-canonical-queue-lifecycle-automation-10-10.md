# Task Brief: AW-006 Canonical Queue Lifecycle Automation (10/10)

## Metadata

- `id`: `2026-05-19-aw-006-canonical-queue-lifecycle-automation-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-19`
- `updated`: `2026-05-19`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `preceded_by`: `docs/task-briefs/done/2026-05-19-aw-006-stable-visual-baseline-snapshot-pilot-10-10.md`
- `branch`: `aw-006-queue-lifecycle-automation`

## Brief Audit Record

- `last_audited`: `2026-05-19`
- `base`: `main@efdb262`
- `audit_status`: `ready`
- `decision`: Execute a small queue-lifecycle automation slice before the next visual/product AW-006 implementation slice.
- `reason`: `main` is clean after PR `#764` and repo-managed closeout PR `#765`; `npm run post-merge:preflight` reports no pending closeout, but the canonical AW-006 queue still points at the already-done visual baseline pilot as active.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, task-brief lifecycle folders, `post-merge:preflight`, `lint:briefs`, AW-006 queue scope, or verification lanes change before PR handoff.

## Goal

Keep the AW-006 canonical queue accurate after completed active slices and add automated lint/preflight coverage so future stale active-brief references are caught in the same closeout flow instead of becoming separate cleanup work.

## Pre-Implementation Owner Explanation

Dette slicen rydder AW-006-køen etter visual-baseline-arbeidet og legger inn en automatisk kontroll som varsler eller feiler hvis en ferdig child-brief fortsatt står som aktiv i canonical queue. Det betyr noe fordi neste arbeid kan starte fra riktig oppgave, og fordi fremtidige closeout-PR-er må ta køoppdateringen med en gang. Utenfor scope er nye app-sider, UI-endringer, produktlogikk, auth, checkout, database, screenshots og valg av en stor ny design-system-retning.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `Reliability and failure handling`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                        | Evidence                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | AW-006 queue must no longer list the done visual baseline pilot as active, and must identify this lifecycle automation slice as the current bounded work.                                 | canonical AW-006 queue diff               | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: this improves contributor flow after merge; no user-facing product flow changes.                                                                                         | post-merge preflight output               | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this changes no rendered UI, style, layout, asset, visual artifact, or design token.                                                                                          | visual scope rationale                    | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Stale active queue detection must be deterministic for done briefs that declare `canonical_queue` and queues that still contain `Active brief: docs/task-briefs/in-progress/<same-file>`. | unit tests for lint and preflight helpers | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor surface, CRUD action, confirmation, recovery action, or operator workflow.                                                                       | admin scope rationale                     | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no user-facing markup, focus behavior, keyboard path, labels, contrast, or screen-reader semantics change.                                                                    | a11y scope rationale                      | `N/A`                   |
| Performance (CWV + payloads)                  | `target`     | Automation must add no runtime dependency, route payload, browser work, or default app performance cost.                                                                                  | package/script diff review                | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this introduces no product data, local state, server-canonical state, cache mutation, sync rule, storage, retention, or conflict behavior.                                    | data scope rationale                      | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache, fetch cache, revalidation, stale-data, API cache header, or invalidation behavior changes.                                                                    | cache scope rationale                     | `N/A`                   |
| Reliability and failure handling              | `target`     | `post-merge:preflight` must surface stale canonical queue references after closeout, and `lint:briefs` must fail changed done briefs with stale active queue links.                       | targeted unit tests + command evidence    | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because no auth, authorization, protected route, secret, token, input boundary, or permission model changes.                                                                          | security scope rationale                  | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no personal data, logs, analytics payloads, consent/legal copy, credentials, or raw env values are introduced or stored.                                                      | privacy scope rationale                   | `N/A`                   |
| Content governance                            | `target`     | Canonical queue lifecycle must be enforceable from the existing brief lint/post-merge path, with current AW-006 status corrected in the same PR.                                          | queue update + lint/preflight tests       | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow labels, role-gated CRUD, audit trail, editability, or support operation changes.                                                                            | admin workflow scope rationale            | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no metadata, sitemap, robots, canonical URL, route content, or crawl-facing page changes.                                                                                     | SEO scope rationale                       | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no structured data, public entity content, AI-facing page contract, or crawl-safe content changes.                                                                            | AI discovery scope rationale              | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no event taxonomy, analytics call, KPI persistence, dashboard, payload, or consent behavior changes.                                                                          | analytics scope rationale                 | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no Stripe, checkout, pricing, entitlement, refund, invoice, payout, or revenue reporting behavior changes.                                                                    | commerce scope rationale                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no live incident alert path, support workflow, recovery behavior, operator diagnostic, escalation procedure, or support runbook.                                        | support-ops scope rationale               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, payout, refund, entitlement, invoice, reconciliation, or finance source-of-truth.                                                             | finance scope rationale                   | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A: this changes no user-facing strings, locale routing, translation workflow, metadata copy, grammar-coupled UI, or locale content model.                                               | i18n scope rationale                      | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing `post-merge:preflight`, `lint:briefs`, and Vitest coverage; add no dependency and no separate lifecycle platform.                                                          | scripts/tests diff                        | `5/5`                   |
| Testing and QA automation                     | `target`     | Add targeted unit coverage for stale canonical queue detection and run targeted tests plus repo gates before PR handoff.                                                                  | targeted Vitest + lint/verify evidence    | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the automation is a tiny local/CI text check that avoids repeated manual cleanup work without adding runtime cost.                                                       | script scope review                       | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Change must be reversible by normal git revert and must not alter deployment settings, migrations, secrets, packages, or CI workflow files.                                               | git diff review + validation gates        | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - N/A; no route, component, server/client boundary, action, API route, cache, or rendering behavior changes.
- TypeScript/domain contracts:
  - N/A for app domain; repository lifecycle invariant is the changed contract.
  - Deterministic invariant: a done brief declaring `canonical_queue` must not leave that queue with an `Active brief:` pointer to the same filename under `docs/task-briefs/in-progress/`.
- Tooling:
  - Reuse `scripts/lint-task-brief-scorecard.mjs` for enforceable CI/local lint.
  - Reuse `scripts/post-merge-preflight.mjs` for operator-readable closeout hints.
  - Add focused Vitest coverage next to existing brief/preflight tests.
- Supabase/data layer:
  - N/A; no migration, RLS/authz, generated type, query, storage, or schema work.
- External services:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics provider, webhook, SDK, secret, retry policy, or observability integration change.
- UI system:
  - N/A for rendered UI; screenshot handoff is not required because this PR changes no UI/print/layout/brand/product-rendering files.

## Data Placement And Sync Contract

N/A with rationale: this tooling introduces no local-only product data, server-canonical data, browser storage, sync behavior, conflict policy, retention rule, sensitive-data handling, cache invalidation, or persisted runtime metadata.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible product identifier, rename rule, alias, redirect, or migration behavior. Brief filenames are existing repository lifecycle identifiers only.

## Help / Guide Impact

N/A with rationale: this slice changes no user/admin workflow labels, support recovery behavior, Help/Guide assertions, auth, payments, or operator-facing product procedure. The affected surface is developer/repo lifecycle tooling only.

## Route / Label / Support Surface Sweep

Required as a task-brief lifecycle and AW-006 queue sweep.

- Identifiers searched before broad gates:
  - `canonical_queue`
  - `Active brief:`
  - `Stable visual baseline`
  - `post-merge:preflight`
  - `lint:briefs`
  - `task-brief:move`
  - `AW-006`
- Directories/surfaces checked:
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/task-briefs/done/`
  - `scripts/`
  - `tests/unit/`
  - `package.json`
- Expected fallout:
  - one active brief,
  - canonical AW-006 queue update,
  - lint/preflight automation,
  - targeted unit tests,
  - no product Help/Guide runtime update.

## Scope

- Create this in-progress child brief.
- Update the canonical AW-006 queue after PR `#764/#765` so the visual baseline pilot is recorded as done.
- Promote this queue-lifecycle automation as the current active AW-006 slice.
- Add automated stale active-brief detection to `lint:briefs` for done briefs that declare a canonical queue.
- Add post-merge preflight reporting for the same stale canonical queue condition.
- Add targeted unit tests.

## Out Of Scope

- Runtime UI, copy, styles, layout, assets, app routes, API routes, product data, auth, checkout, analytics, Supabase, migrations, workflows, package installs, generated screenshots, CI workflow changes, or merge to `main`.
- Choosing or implementing the next visual/product AW-006 design-system slice.
- Automatically choosing product priority; the automation only detects stale queue lifecycle state and forces it into the same closeout path.

## Acceptance Criteria

1. The canonical AW-006 queue records Stable Visual Baseline Snapshot Pilot as shipped through `#764/#765`.
2. The canonical queue points to this active lifecycle automation slice instead of the already-done visual baseline brief.
3. `lint:briefs` fails a changed done brief that declares `canonical_queue` while that queue still contains `Active brief: docs/task-briefs/in-progress/<same-file>`.
4. `post-merge:preflight` reports the stale canonical queue condition with an actionable next command/note.
5. Targeted unit tests cover passing and failing stale queue detection.
6. `npm run lint:briefs`, targeted Vitest, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge readiness.

## Validation

- Targeted during implementation:
  - `npm run lint:briefs`
  - `npx vitest run tests/unit/task-brief-scorecard-lint.test.ts tests/unit/merge-preflight.test.ts`
  - `git diff --check`
  - targeted route/label/support sweep listed above
- Broad gates:
  - `npm run verify:pre-pr`
  - PR required CI checks
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- Because scripts/tests change, this is not docs-only; full validation lane is required.

## Checkpoint Log

- `2026-05-19 | in-progress | started from clean main@efdb262 after PR #764 and repo-managed closeout PR #765; post-merge preflight found no pending closeout, but the canonical AW-006 queue still pointed at the done visual baseline pilot as active | next: update queue, add lint/preflight stale queue detection, and run targeted validation`
- `2026-05-19 | in-progress | updated the canonical AW-006 queue, added stale active canonical queue detection to brief lint and post-merge preflight, and added targeted Vitest coverage; npm run lint:briefs:all, targeted Vitest, git diff --check, npm run lint, npm run typecheck, npm run lint:quality-gates, and targeted lifecycle sweep passed | next: run npm run verify:pre-pr before commit/push/PR handoff`
- `2026-05-19 | in-progress | npm run verify:pre-pr passed the full lane at 15:14: branch-current, migration drift skip, quality gates, admin/env/pr-body lints, eslint, typecheck, 1120 unit tests, build, performance budgets, and Playwright 98 passed / 478 skipped | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge after CI is green`
