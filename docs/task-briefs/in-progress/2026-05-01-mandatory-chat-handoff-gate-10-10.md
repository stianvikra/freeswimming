# Task Brief: Mandatory Chat Handoff Gate (10/10)

## Metadata

- `id`: `2026-05-01-mandatory-chat-handoff-gate-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-01`
- `updated`: `2026-05-01`

## Goal

Make chat-handoff assessment mandatory after merge and before new implementation work, so workstream pivots start with clean context when that is the safer operating mode.

## Why This Brief Exists

- The repo already recommends new chat when it preserves momentum and reduces risk.
- The recent transition from roadmap docs to AI Swim Session UI implementation showed that recommendation was not hard enough.
- This docs-only governance slice converts the recommendation into a required gate with an explicit `Chat: continue here` or `Chat: start new chat` decision.
- No runtime behavior, product UI, tests, workflows, dependencies, or CI configuration changes are in scope.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Product goals and IA`
- `Reliability and failure handling`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                      | Evidence                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | AGENTS and runbook define exactly when the assistant must stop, continue, or hand off to a new chat.                                | AGENTS + runbook review                 | `5/5`                   |
| UX flow clarity                               | `N/A`        | N/A because this docs-only governance slice changes no user/admin route, action, empty state, error state, or navigation journey.   | explicit UX scope rationale             | `N/A`                   |
| Visual design quality                         | `N/A`        | N/A because no UI, layout, print, brand, screenshot, or visual asset changes.                                                       | explicit visual scope rationale         | `N/A`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because no runtime logic, database entity, mutation, sync rule, cache state, or product data contract changes.                  | explicit data scope rationale           | `N/A`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because admin editor workflows, CRUD forms, publishing states, and operator actions are untouched.                              | explicit admin editor scope rationale   | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no rendered semantics, focus order, interactive controls, labels, or contrast behavior changes.                         | explicit a11y scope rationale           | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because this docs-only slice changes no route payload, runtime code, build output, or performance budget.                       | explicit performance scope rationale    | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because no product data, local storage, server-canonical state, generated types, or sync behavior changes.                      | explicit data-boundary scope rationale  | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no cache mode, CDN behavior, route freshness, or invalidation trigger changes.                                          | explicit cache scope rationale          | `N/A`                   |
| Reliability and failure handling              | `target`     | Post-merge and pre-implementation handoff now requires an explicit continue/new-chat decision and stop rule when new chat is safer. | AGENTS + runbook review                 | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because no auth, authorization, protected route, secret handling, or input validation behavior changes.                         | explicit security scope rationale       | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because no personal data, third-party processor, logging, retention, consent, or policy surface changes.                        | explicit privacy scope rationale        | `N/A`                   |
| Content governance                            | `target`     | The handoff rule is recorded in durable repo governance docs and this brief captures the reason and scope.                          | AGENTS + runbook + brief                | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow status, editability surface, audit trail, or recovery behavior changes.                               | explicit admin workflow scope rationale | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public metadata, sitemap, robots, canonical URL, or crawlable content changes.                                       | explicit SEO scope rationale            | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured data, AI-visible docs surface, or content model changes.                         | explicit AI discovery scope rationale   | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics events, dashboards, KPI thresholds, or observability payloads change.                                      | explicit analytics scope rationale      | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, entitlement, billing, pricing, revenue, or commerce-reporting behavior changes.                            | explicit commerce scope rationale       | `N/A`                   |
| Incident response and support operations      | `target`     | Operators can recover from context-heavy or risky workstream pivots by following the runbook's carry-forward prompt requirement.    | runbook review                          | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance, reconciliation, reporting, refund, payout, or entitlement ledger surface changes.                           | explicit finance scope rationale        | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale routing, translations, language metadata, content model, or i18n workflow changes.                            | explicit i18n scope rationale           | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Governance uses existing repo docs/runbook patterns and adds no dependencies, tools, scripts, or workflow complexity.               | docs diff review                        | `5/5`                   |
| Testing and QA automation                     | `target`     | Docs-only gates pass and changed brief linting validates the scorecard mapping.                                                     | `npm run verify:pre-pr`                 | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: clearer chat handoffs reduce wasted implementation time and context-recovery cost without adding runtime cost.     | process rationale                       | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | PR is revertable as docs-only with no migration, dependency, CI, runtime, or secret rollback required.                              | rollback plan                           | `5/5`                   |

## Data Placement And Sync Contract

- N/A for this docs-only governance slice because no product data, database schema, local storage, generated types, cache ownership, or sync behavior changes.

## Identity And Rename Contract

- N/A because this slice introduces no persisted product entity, route param, slug, public identifier, or operator-visible domain identifier.

## Scope

- Update `AGENTS.md` with a mandatory chat-handoff gate after merge and before new implementation.
- Update `docs/runbooks/pr-flow-and-chat-handoff.md` with the matching operational checklist.
- Keep this docs-only and narrowly focused on chat-handoff governance.

## Out Of Scope

- Runtime code, UI, workflow, dependency, CI, test, package, or configuration changes.
- Starting or modifying the AI Swim Session V1 implementation slice.
- Closing unrelated in-progress briefs.

## Acceptance Criteria

1. `AGENTS.md` requires an explicit `Chat: continue here` or `Chat: start new chat` decision after merge and before new implementation.
2. The runbook defines the post-merge/pre-implementation assessment steps and default new-chat triggers.
3. The stop rule is explicit when a new chat is recommended.
4. Docs-only validation passes before PR handoff.

## Validation Plan

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Validation Evidence

- `npm run lint:briefs:all`: PASS for all `218` brief files.
- `npm run verify:pre-pr`: PASS on docs-only lane, artifact `artifacts/test-runs/20260501-143831/verify.log`.

## Help/Guide And Operator Training Impact

- Help/Guide content: `N/A` because no user/admin workflow labels, actions, recovery behavior, or in-app support content changes.
- Operator impact is handled through `AGENTS.md` and `docs/runbooks/pr-flow-and-chat-handoff.md`.

## Rollback Plan

- Revert this docs-only PR to restore the previous handoff guidance.
- No runtime rollback, migration, dependency downgrade, data repair, secret rotation, or customer communication is required.

## Checkpoint Log

- `2026-05-01 | in-progress | started docs-only mandatory chat-handoff gate from clean main after owner flagged that the prior recommendation was not enforced before a new implementation pivot | next: update AGENTS/runbook, run docs-only gates, open PR, monitor CI, and run verify:pre-merge before merge recommendation`
- `2026-05-01 | in-progress | added mandatory post-merge/pre-implementation chat-handoff gate to AGENTS and PR handoff runbook; all brief scorecard lint passed | next: run verify:pre-pr, commit, push, open PR, monitor CI, then run verify:pre-merge before merge recommendation`
- `2026-05-01 | in-progress | verify:pre-pr passed on the docs-only lane with artifact artifacts/test-runs/20260501-143831/verify.log | next: refresh docs-only gate after evidence update, commit, push, open PR, monitor CI, then run verify:pre-merge before merge recommendation`
