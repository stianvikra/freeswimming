# Task Brief: Tool Integration Adoption Gate (10/10)

## Metadata

- `id`: `2026-04-30-tool-integration-adoption-gate-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-30`
- `updated`: `2026-04-30`

## Goal

Make every new tool, SDK, CLI, workflow action, SaaS/API integration, environment variable, secret family, or recommended editor extension enter the maintenance system when it is introduced, so the repo keeps choosing the best stable, supported, compatible, and launch-safe tools over time.

## Why This Brief Exists

- The stack/tooling audit cadence now checks known core tools such as Next, React, Node, npm, TypeScript, Tailwind, Supabase, Stripe, Playwright, GitHub Actions, Vercel, and CI.
- That is not enough for future additions that may not be npm dependencies or GitHub Actions, such as pinned CLIs, external SaaS/API integrations, dashboard configuration, new secret families, or recommended editor extensions.
- This slice adds an adoption gate and monthly backstop so new tools are registered in the right maintenance surface immediately, not only after they become outdated.
- This is docs-only governance. No runtime behavior, dependency, workflow, UI, or performance budget changes are in scope.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Product goals and IA`
- `Reliability and failure handling`
- `Security and authz`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                       | Evidence                                      | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Maintenance docs clearly state when new tools/integrations must be registered and how monthly review catches missed registrations.                   | maintenance runbook + monthly checklist       | `5/5`                   |
| UX flow clarity                               | `N/A`        | N/A because this docs-only governance slice changes no user/admin flow, route, action label, empty/error state, or navigation journey.               | explicit UX scope rationale                   | `N/A`                   |
| Visual design quality                         | `N/A`        | N/A because no UI, layout, print, brand, screenshot, or visual asset changes.                                                                        | explicit visual scope rationale               | `N/A`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: future tool adoption must document data-boundary impact when a tool affects persistence, cache, generated types, or sync.           | adoption gate requirements                    | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because admin editor workflows, CRUD forms, publishing states, and operator actions are untouched.                                               | explicit admin editor scope rationale         | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no rendered semantics, focus order, interactive controls, labels, or contrast behavior changes.                                          | explicit a11y scope rationale                 | `N/A`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: future tool adoption must document performance impact if a tool can affect route payloads, build size, CI time, or runtime.         | adoption gate requirements                    | `4/5`                   |
| Data placement and sync boundaries            | `supporting` | Supporting only: new tools that touch data must state local/server ownership, retention, sync, and rollback boundaries in their own PR/brief.        | adoption gate requirements                    | `4/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this slice changes no cache mode, CDN behavior, route freshness, or invalidation trigger.                                                | explicit cache scope rationale                | `N/A`                   |
| Reliability and failure handling              | `target`     | New tools must have owner, registration location, update strategy, review cadence, and rollback/replace plan before adoption is considered complete. | maintenance runbook + monthly checklist       | `5/5`                   |
| Security and authz                            | `target`     | New tools/integrations must document security/privacy/policy impact and route secrets/env vars to the correct governance surface.                    | adoption gate requirements                    | `5/5`                   |
| Privacy and compliance                        | `target`     | New third-party processors, data paths, and editor/cloud tools must record policy-impact and privacy/compliance handling before adoption.            | adoption gate requirements                    | `5/5`                   |
| Content governance                            | `target`     | The gate is documented in durable repo docs and future decisions use `upgrade now`, `hold`, `watch`, or `replace later`.                             | maintenance cadence docs                      | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow status, editability surface, audit trail, or recovery behavior changes.                                                | explicit admin workflow scope rationale       | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public metadata, sitemap, robots, canonical URL, or crawlable content changes.                                                        | explicit SEO scope rationale                  | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured data, AI-visible docs surface, or content model changes.                                          | explicit AI discovery scope rationale         | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: new analytics/observability tools must enter the adoption gate and policy-impact flow if introduced later.                          | adoption gate requirements                    | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: new billing/finance tools must enter the adoption gate and finance/reporting validation if introduced later.                        | adoption gate requirements                    | `4/5`                   |
| Incident response and support operations      | `target`     | New operational tools must identify owner, failure mode, rollback/replace plan, and support/runbook home before adoption is complete.                | adoption gate requirements                    | `5/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: no finance workflow changes now; future finance tools must define reconciliation and reporting impact.                              | adoption gate requirements                    | `4/5`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale routing, translations, language metadata, or i18n storage model changes.                                                       | explicit i18n scope rationale                 | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Docs require every new dependency/CLI/SaaS/SDK/env-var/extension/action to enter the correct maintenance surface and review cadence.                 | runbook + checklist + architecture correction | `5/5`                   |
| Testing and QA automation                     | `target`     | Docs-only gates pass, and future non-docs tool adoption remains subject to the normal full release lane unless scope is pure governance.             | local docs-only gates + CI                    | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the gate prevents tool sprawl by requiring ownership, update path, and replace/hold rationale before adoption.                      | adoption gate requirements                    | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | This PR is revertable as docs-only; future tools must document rollback/replace plan and whether they affect CI/deploy/runtime.                      | rollback plan + adoption gate                 | `5/5`                   |

## Data Placement And Sync Contract

- N/A for this docs-only governance slice because no product data, database schema, local storage, generated types, cache ownership, or sync behavior changes.
- Future tool/integration adoption must document data placement and sync impact when the tool touches persistence, external processors, generated database contracts, cache behavior, or runtime state.

## Identity And Rename Contract

- N/A because this slice introduces no persisted product entity, route param, slug, public identifier, or operator-visible domain identifier.
- Tool/integration names are operational references only and may be renamed in docs if the underlying tool changes.

## Scope

- Correct `docs/architecture.md` so the documented npm version matches `package.json`.
- Add a new tool/integration adoption gate to `docs/runbooks/maintenance-cadence.md`.
- Add monthly checklist coverage for new tools/integrations since the previous pass.
- Keep this as docs-only governance with no runtime, dependency, workflow, test, or UI change.

## Out Of Scope

- Adding, removing, or upgrading dependencies.
- Changing `.github/dependabot.yml`, CI workflows, Vercel config, secrets, runtime code, tests, performance budgets, or branch protection.
- Selecting new tools or replacing existing tools in this PR.

## Acceptance Criteria

1. `docs/architecture.md` documents npm `11.11.0`.
2. Maintenance cadence defines a PR-time adoption gate for new dependency, CLI, SaaS/API, SDK, env-var, secret family, extension, or workflow-action additions.
3. Monthly maintenance checklist includes a backstop check for newly added tools/integrations since the previous pass.
4. The gate requires owner, registration location, update strategy, review cadence, security/privacy/policy impact, and rollback/replace plan.
5. `npm run verify:pre-pr` and `npm run verify:pre-merge` pass on the docs-only lane before merge recommendation.

## Validation Plan

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Validation Evidence

- `npm run lint:briefs:all`: PASS for all `214` brief files.
- `npm run verify:pre-pr`: PASS on docs-only lane, artifact `artifacts/test-runs/20260430-063640/verify.log`.

## Help/Guide And Operator Training Impact

- Help/Guide content: `N/A` because no user/admin workflow labels, actions, recovery behavior, or in-app support content changes.
- Operator impact is handled through maintenance runbook and monthly checklist updates.

## Rollback Plan

- Revert the docs-only PR to restore the prior maintenance docs.
- No runtime rollback, migration, dependency downgrade, data repair, secret rotation, or customer communication is required.

## Checkpoint Log

- `2026-04-30 | in-progress | started docs-only adoption gate slice from clean main after stack/tooling micro-refresh closeout; scope is architecture npm version drift plus maintenance cadence/checklist guardrails for future tools and integrations | next: update docs, run docs-only gates, open PR, monitor CI, and run verify:pre-merge before merge recommendation`
- `2026-04-30 | in-progress | added the adoption gate, monthly checklist backstop, and npm 11.11.0 architecture correction; final docs-only verify:pre-pr passed on artifact artifacts/test-runs/20260430-063640/verify.log | next: push branch, open PR, monitor CI, then run verify:pre-merge before merge recommendation`
