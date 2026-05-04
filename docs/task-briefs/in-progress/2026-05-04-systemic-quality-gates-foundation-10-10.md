# Task Brief: Systemic Quality Gates Foundation (10/10)

## Metadata

- `id`: `2026-05-04-systemic-quality-gates-foundation-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-04`
- `updated`: `2026-05-04`
- `mode`: `end-to-end implementation`

## Goal

Build the first systemic quality-gate foundation so every future app change is classified, mapped to the right 10/10 quality categories, and blocked when required evidence is missing.

## Why This Brief Exists

- The app now has mature shared surfaces for workouts, programs, AI-generated sessions, saved previews, PDF/export, poolside notes, admin workflows, commerce, auth, and operations.
- Quality cannot rely on memory or hidden manual judgment. The repo needs more automated gates that answer:
  - what changed,
  - which quality rules apply,
  - which evidence is required before PR and merge,
  - which decisions still require explicit human judgment.
- This brief does not claim that product/design/architecture judgment can be eliminated. It systematizes the objective parts so human review is narrower, visible, and better informed.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Strict 10/10 mode applies to this brief: every canonical category is a `target`, and closeout may only claim `10/10` if every target category scores `5/5`.

Critical target categories for `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Admin editor ergonomics
- Accessibility (a11y)
- Performance (CWV + payloads)
- Data placement and sync boundaries
- Caching and invalidation strategy
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Content governance
- Admin workflow and editability
- SEO and crawlability
- AI discoverability
- Analytics and KPI observability
- Commerce and revenue ops
- Incident response and support operations
- Finance and reporting operations
- i18n operational readiness
- Stack-fit and dependency discipline
- Testing and QA automation
- Scalability and cost efficiency
- DevOps and rollback readiness

| Category                                      | Mapping  | Target Threshold / Scope Rationale                                                                                                                                        | Evidence                                                  | Expected Closeout Score |
| --------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target` | Gate matrix classifies changed product surfaces and requires explicit route purpose, reference surface, and user job evidence for feature or workflow changes.            | classifier tests + docs/brief lint evidence               | `5/5`                   |
| UX flow clarity                               | `target` | Gate matrix requires loading, empty, error, retry, and no-dead-end evidence for changed user flows, or a documented N/A rationale for non-runtime changes.                | policy matrix + changed-brief assertions                  | `5/5`                   |
| Visual design quality                         | `target` | UI, print, layout, and brand changes require screenshot evidence, reference-surface declaration, and artifact naming/timestamp compliance before PR gates.                | screenshot gate tests + runbook alignment                 | `5/5`                   |
| Business logic correctness and data integrity | `target` | Domain/API/data changes require invariants, canonical type or validator ownership, negative/failure paths, and deterministic mutation or read behavior evidence.          | brief-lint rules + targeted script tests                  | `5/5`                   |
| Admin editor ergonomics                       | `target` | Admin/content workflow changes require admin task-flow impact, destructive-action safety, recovery feedback, and Help/Guide or runbook evidence.                          | policy matrix + route/label/support sweep evidence        | `5/5`                   |
| Accessibility (a11y)                          | `target` | UI changes require keyboard/focus/label/semantic/contrast evidence and no serious/critical regression note before broad verification.                                     | brief/evidence checks + Playwright coverage mapping       | `5/5`                   |
| Performance (CWV + payloads)                  | `target` | Performance-sensitive route or bundle changes require route-level budget statement, payload risk notes, and perf-test evidence or explicit non-runtime rationale.         | classifier risk mapping + perf gate evidence              | `5/5`                   |
| Data placement and sync boundaries            | `target` | Stateful work requires server-canonical, local-only, sync/conflict, retention, sensitivity, and invalidation decisions in the active brief.                               | strengthened brief-lint coverage                          | `5/5`                   |
| Caching and invalidation strategy             | `target` | Changed read/write paths require cache mode, freshness boundary, invalidation trigger, and stale/failure behavior evidence.                                               | policy matrix + brief-lint checks                         | `5/5`                   |
| Reliability and failure handling              | `target` | API, UI, export, AI, commerce, and admin changes require expected failure states and no unexpected 500 or blank-surface path for covered denials/failures.                | risk-specific evidence requirements + tests               | `5/5`                   |
| Security and authz                            | `target` | Protected routes, admin actions, auth, RLS, payments, and sensitive APIs require fail-closed behavior, exact allowlist parsing where relevant, and negative-path tests.   | security gate matrix + lint/test fixtures                 | `5/5`                   |
| Privacy and compliance                        | `target` | Changes that touch personal data, AI prompts, logs, analytics, exports, billing, or support diagnostics require data minimization and no-sensitive-leak evidence.         | policy matrix + evidence summary                          | `5/5`                   |
| Content governance                            | `target` | Content, labels, help surfaces, workouts, programs, guides, and admin content changes require source-of-truth, owner, revision, and rollback or rationale evidence.       | route/label/support sweep + brief-lint rules              | `5/5`                   |
| Admin workflow and editability                | `target` | Admin/user workflow actions, statuses, labels, recovery paths, and support surfaces require same-slice docs/tests or explicit follow-up brief with rationale.             | impact-sweep gate evidence                                | `5/5`                   |
| SEO and crawlability                          | `target` | Public route, metadata, sitemap, robots, canonical, and indexability changes require SEO impact classification and tests or explicit private-surface rationale.           | classifier + policy matrix tests                          | `5/5`                   |
| AI discoverability                            | `target` | Public content/AI-discoverable entity changes require semantic structure, canonical identity, and crawl-safe evidence; private AI work requires explicit non-public note. | policy matrix + brief-lint evidence                       | `5/5`                   |
| Analytics and KPI observability               | `target` | Changed measured flows require event taxonomy, safe payload, success/failure threshold, and no-PII evidence; non-measured changes require explicit rationale.             | analytics evidence contract + tests                       | `5/5`                   |
| Commerce and revenue ops                      | `target` | Stripe, entitlement, checkout, billing, refunds, and access changes require official SDK pattern, idempotency, reconciliation, and negative-path evidence.                | commerce risk matrix + route test requirements            | `5/5`                   |
| Incident response and support operations      | `target` | Critical workflow, export, auth, payment, admin, AI, or ops changes require support diagnostics, runbook impact, and recovery-path evidence.                              | support gate matrix + runbook evidence                    | `5/5`                   |
| Finance and reporting operations              | `target` | Revenue, entitlement, refund, invoice, ledger, and reporting-relevant changes require reconciliation notes and finance-impact evidence.                                   | finance gate matrix + evidence summary                    | `5/5`                   |
| i18n operational readiness                    | `target` | Route, metadata, label, content, error, email, export, and help-copy changes require locale-readiness notes and no hard blocker for later localization.                   | i18n gate matrix + brief-lint evidence                    | `5/5`                   |
| Stack-fit and dependency discipline           | `target` | Every non-docs change requires impacted stack surfaces, reference-surface reuse or exception, dependency rationale, and official SDK/docs baseline where relevant.        | strengthened brief-lint + policy matrix tests             | `5/5`                   |
| Testing and QA automation                     | `target` | Gate output maps changed files to required targeted tests, broad gates, screenshot handoff, CI, and merge evidence; missing required evidence fails predictably.          | script tests + `npm run lint:briefs:all` + targeted tests | `5/5`                   |
| Scalability and cost efficiency               | `target` | DB, API, AI, export, browser, CI, media, and dependency changes require cost/payload/scale risk notes and mitigation or explicit non-impact rationale.                    | classifier risk output + evidence requirements            | `5/5`                   |
| DevOps and rollback readiness                 | `target` | Scripts, CI, workflows, migrations, feature flags, release gates, and risky runtime changes require rollback path, deployment impact, and branch/PR hygiene evidence.     | DevOps gate matrix + rollback evidence checks             | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - no product UI rewrite is in scope for V1,
  - UI-related enforcement must classify changed `app/` and `components/` files, require reference-surface reuse or exception, and preserve the existing server/client component boundary,
  - route changes must classify metadata, sitemap, redirects, route params, and cache behavior.
- TypeScript/domain contracts:
  - quality-gate logic should be deterministic Node/TypeScript-compatible scripts with no new runtime dependency unless explicitly justified,
  - rules should use structured policy objects where practical rather than fragile one-off string checks,
  - output should be human-readable and machine-readable enough to support PR handoff.
- Supabase/data layer:
  - V1 does not change schema, migrations, RLS, storage, or generated DB types,
  - the gate must require future Supabase slices to document migration path, RLS/authz, indexes/performance, generated type updates, and negative-path tests.
- External services/tools:
  - V1 does not add or modify Stripe, Resend, Garmin, OpenAI, analytics, or other external-service integration behavior,
  - the gate must require future external-service changes to state official docs/SDK baseline, secret handling, idempotency, retries, webhook/event verification, observability, and support diagnostics.
- UI system:
  - V1 does not change runtime visuals,
  - screenshot evidence rules must align with `docs/runbooks/ui-debug-hypothesis-and-handoff.md`,
  - session-step surfaces must continue to reference `docs/design/session-step-surface-contract.md`.
- Testing:
  - add focused unit tests for classifier/policy behavior if scripts change,
  - keep broad verification through `verify:pre-pr` and `verify:pre-merge`,
  - docs-only changes may use the docs-only lane, but script/config/workflow changes must run the full lane.

## Quality Gate Building Blocks

V1 must plan and, when executed, implement or document these system blocks:

1. Change classification:
   - docs/governance,
   - UI/layout/brand,
   - print/PDF/export/screenshot,
   - session-step/workout/program domain surfaces,
   - route/label/support/help/runbook surfaces,
   - API/server actions,
   - auth/RBAC/RLS/security,
   - Supabase/schema/data migration,
   - external services/payments/email/AI/Garmin,
   - analytics/KPI,
   - performance-sensitive route or bundle work,
   - i18n/copy/content governance,
   - DevOps/build/CI/scripts/workflows,
   - finance/commerce/entitlement,
   - incident/support operations.
2. Quality policy matrix:
   - map each change class to required scorecard categories,
   - map each category to required evidence,
   - make explicit what remains human judgment.
3. Brief lint strengthening:
   - require stack surfaces,
   - require reference surface or documented exception,
   - require data-boundary and identity contracts when relevant,
   - require Help/Guide impact or explicit rationale,
   - require target-category evidence for all changed brief scopes.
4. Evidence registry:
   - define required evidence names for tests, screenshots, route sweeps, negative-path tests, perf budgets, support runbooks, and rollback notes,
   - expose missing evidence clearly before PR/merge.
5. Screenshot evidence gate:
   - UI/print/layout/brand changes must have timestamped artifact folder, explicit `before/after` or `after/reference` naming, and owner approval stop before `verify:pre-pr`.
6. Route/label/support sweep gate:
   - route, label, workflow action, Help/Guide, runbook, and recovery-path changes must record the identifiers searched, surfaces checked, and fallout handled.
7. Risk-specific gate plan:
   - auth/security,
   - admin/support,
   - payments/commerce/finance,
   - AI output/schema,
   - export/PDF/image,
   - data integrity/migrations,
   - analytics/KPI,
   - performance/cost,
   - i18n.
8. Drift-audit trigger:
   - after several PRs change the same domain surface, require a small contract truth audit or explicit hold decision.

## Data Placement And Sync Contract

N/A for runtime product data because this foundation should not add user-facing persistence, browser storage, database tables, or sync behavior.

The gate implementation itself may create local/generated artifacts only under existing repo artifact conventions, such as `artifacts/` or stdout summaries. Those artifacts must not contain secrets, raw environment values, personal data, AI prompt private context, payment data, or customer support free text.

Future stateful feature briefs must remain subject to explicit server-canonical, local-only, sync/conflict, retention, sensitivity, cache, and invalidation decisions.

## Identity And Rename Contract

No persisted product entity identity changes are in scope.

Gate and policy identifiers must be stable and explicit:

- canonical category names come from `docs/quality/platform-10-10-scorecard.md`,
- change-class identifiers are stable machine-readable strings,
- script names and package scripts are stable operator-facing identifiers,
- route/label/support sweep identifiers are searched by exact old/new names rather than inferred from titles alone.

Rename policy:

- renaming a gate, script, or category key requires same-slice updates to docs, tests, package scripts, runbooks, and PR/brief references,
- compatibility aliases may exist only with an explicit deprecation note and follow-up removal trigger.

## Scope

- In-progress brief:
  - `docs/task-briefs/in-progress/2026-05-04-systemic-quality-gates-foundation-10-10.md`
- Implementation surfaces:
  - `scripts/quality-gate-evidence.mjs`
  - `scripts/run-verify-docs-only.sh`
  - `package.json`
  - `tests/unit/quality-gate-evidence.test.ts`
  - `docs/quality/platform-10-10-scorecard.md`
  - `docs/architecture.md`
  - `docs/runbooks/local-verify-and-test-artifacts.md`
  - `docs/testing-strategy.md`

## Out Of Scope

- Rewriting the whole app architecture.
- Replacing current design system or test stack.
- Changing runtime product behavior.
- Changing Supabase schema, RLS, migrations, auth, payment, or AI provider behavior.
- Making all quality judgment fully automatic.
- Blocking every possible subjective concern in code.
- Merging or closing unrelated existing briefs.
- Starting poolside execution, AI program generation, training history, or large product features.

## Acceptance Criteria

1. A clear quality-gate plan exists that covers every canonical scorecard category as a target for this systemic foundation.
2. Change classes are defined for UI, print/PDF/export, session-step/domain surfaces, route/label/support, API, auth/security, data/schema, external services, analytics, commerce/finance, i18n, performance, DevOps, and docs/governance.
3. Each change class maps to required evidence and to the scorecard categories it can affect.
4. Brief-lint strengthening requirements are explicit and include stack surfaces, reference-surface reuse, data-boundary, identity, Help/Guide, and evidence requirements.
5. Screenshot evidence, route/label/support sweep, negative-path testing, rollback, performance, observability, support, finance, privacy, i18n, and AI-output gates are all represented.
6. The plan states what still requires human judgment and makes that judgment explicit rather than hidden.
7. Changed in-progress brief passes `npm run lint:briefs:all` and the implementation passes the systemic quality-gate classifier.

## Validation

For this execution slice:

- `npm run lint:briefs:all`
- `npm run lint:briefs`
- `npm run lint:quality-gates`
- `npm run lint`
- `npm run typecheck`
- targeted unit tests for new or changed gate scripts
- `npm run test:unit`
- `npm run build`
- `npm run verify:pre-pr`
- CI
- `npm run verify:pre-merge`

If a future quality-governance slice remains pure docs/governance-only:

- `npm run lint:briefs:all`
- `npm run verify:docs-only`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Help/Guide And Operator Training Impact

Target scope because this brief changes how work is governed, not user-facing product help.

Execution must update operator-facing guidance when gate behavior changes:

- task brief template,
- scorecard docs,
- relevant runbooks,
- PR or verification checklist docs,
- any Help/Guide assertion only if a user/admin workflow label, action, or recovery behavior changes as part of a future implementation.

## Security, Privacy, And Compliance

This foundation must improve security discipline without adding sensitive data exposure.

Required controls:

- no secrets, tokens, API keys, raw `.env` values, payment records, or personal user data in generated evidence,
- security/auth/API/payment/data changes must require fail-closed negative-path evidence,
- host/origin allowlist changes must require exact URL parsing and tests, not substring checks,
- analytics and AI evidence must explicitly avoid PII or sensitive free-text leakage,
- generated logs and artifacts must be safe to attach to PRs.

## Observability And KPI Contract

The gate system should produce useful operational evidence without becoming noisy.

Required outputs:

- changed-file classification summary,
- required evidence checklist,
- missing evidence list,
- human-judgment-required list,
- risk categories triggered,
- exact command/test evidence expected before PR and merge.

Success threshold:

- gate output is deterministic for the same diff,
- false positives are documented with an exception path,
- missing high-risk evidence fails before merge recommendation,
- low-risk docs-only changes keep a fast path.

## Manual QA Environments

N/A for this implementation slice because it changes docs, scripts, package verification wiring, and unit tests only.

- UI/product screenshots are required only if runtime UI, print, layout, brand, or screenshot behavior changes.
- If only scripts/docs change, no screenshot handoff is required.

## Constraints

- Keep the first implementation slice boring and reversible.
- Prefer deterministic repo-local scripts over new dependencies.
- Do not overfit rules to one recent session-step workstream.
- Do not block low-risk docs-only work with heavy UI/API gates.
- Any exception path must be explicit and searchable in the active brief or PR body.
- Manual judgment must be named and scoped, not hidden behind a passing gate.

## Debugging And Handoff Contract

- For visual/screenshot/export gate work, follow `docs/runbooks/ui-debug-hypothesis-and-handoff.md`.
- For route, label, workflow action, Help/Guide, runbook, recovery-path, or support-surface gate work, follow `docs/runbooks/route-label-support-surface-impact-sweep.md`.
- If a gate produces repeated false positives or misses, log the root cause and fix pattern in the active brief and create a follow-up brief when it cannot be fixed safely in the current slice.
- If context becomes heavy after the plan or implementation PR, use `docs/runbooks/pr-flow-and-chat-handoff.md` for carry-forward.

## Session Continuity And Recovery

- Canonical source of truth: this task brief plus the implementation branch when execution starts.
- Checkpoint cadence: update the checkpoint log at each meaningful milestone.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint.

## Git Rhythm Defaults

When this planned brief is later executed:

- create a feature branch from current `main`,
- commit and push after the planned brief is moved to `in-progress` and after each validated implementation checkpoint,
- keep implementation commits scoped to gate/tooling/docs changes,
- open/update PR after `npm run verify:pre-pr`,
- run `npm run verify:pre-merge` before merge readiness,
- do not merge without explicit owner approval.

## Automation Mode

Planning creation mode:

- plan-only documentation update.

Future implementation mode:

- automation-first once owner explicitly asks to execute this brief,
- pause only for sandbox approvals, missing credentials, screenshot approval if visual behavior changes, or real product/quality-gate decisions.

## Branch Hygiene Defaults

When execution starts:

- work from a feature branch based on updated `main`,
- after merge and local sync, run post-merge preflight,
- clean merged branches only after owner-approved merge,
- preserve unrelated owner changes.

## PR Browser Rule

When execution starts and a PR is opened or updated, use the repo Safari PR workflow by default and avoid replacing the owner active tab unless it already belongs to the target PR.

## Manual QA URL Rule

N/A for this planning-only brief.

If future implementation includes browser QA, assistant opens exact local or preview URLs in Safari by default and gives one concrete owner action at a time.

## Implementation Checkpoint Log

- `2026-05-04 | planned | created systemic quality-gates foundation brief after owner requested planning for all app quality, security, operations, and 10/10 building-block categories | next: owner review, then execute as a scoped tooling/governance slice when approved`
- `2026-05-04 | working tree | owner approved end-to-end implementation; brief moved to in-progress, V1 quality-gate evidence classifier added, verify/docs-only lanes wired to lint:quality-gates, and operator docs updated | next: run targeted script/unit/brief validation`
- `2026-05-04 | working tree | targeted validation passed: npm run lint:quality-gates PASS, npx vitest run tests/unit/quality-gate-evidence.test.ts PASS, npm run lint PASS, npm run typecheck PASS, npm run lint:briefs:all PASS | next: run npm run verify:pre-pr full lane`
- `2026-05-04 | working tree | npm run verify:pre-pr PASS on full lane: branch-current, lint:quality-gates, lint/admin/env/pr-body, lint, typecheck, unit, build, perf budgets, and Playwright all green; Playwright result 108 passed / 348 skipped | next: commit scoped implementation and rerun verify:pre-pr on final commit`
