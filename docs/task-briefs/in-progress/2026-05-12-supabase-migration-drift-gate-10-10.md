# Task Brief: Supabase Migration Drift Gate (10/10)

## Metadata

- `id`: `2026-05-12-supabase-migration-drift-gate-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-12`
- `updated`: `2026-05-12`
- `execution mode`: `end-to-end implementation after owner approved the recommended systemic guardrail`

## Goal

Prevent future PRs from being treated as ready when they add or change Supabase migrations that have not been applied to the linked remote project required by the deployed app.

## Background

After PR `#686`, `/my-library/habits` had code depending on V2 Supabase fields while the linked `freeswimming-org-prod` project still lacked migration `20260512103000_habits_v2_build_quit_timed_tracking.sql`. The immediate fix applied the migration manually, but the release gate must catch this class of drift before another schema-dependent PR is handed off as ready.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- DevOps and rollback readiness
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                        | Evidence                                              | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `supporting` | Supporting only: no user route or navigation changes; the product outcome is safer release readiness for schema-backed features.                          | brief + runbook review                                | `4/5`                   |
| UX flow clarity                               | `N/A`        | N/A because no end-user flow, empty state, or retry UI changes in this tooling slice.                                                                     | explicit scope rationale                              | `N/A`                   |
| Visual design quality                         | `N/A`        | N/A because no UI, layout, print, or brand surface changes.                                                                                               | explicit scope rationale                              | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Migration-touching PRs fail before handoff when linked remote schema is still pending, preventing app code from reading/writing absent columns or tables. | unit tests + scripted gate behavior + `verify:pre-pr` | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor, publish, or operator CRUD surface changes.                                                                                   | explicit scope rationale                              | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no rendered accessibility surface changes.                                                                                                    | explicit scope rationale                              | `N/A`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: the drift check must skip without contacting Supabase when no migration file changed, avoiding routine gate latency.                     | unit tests + script review                            | `4/5`                   |
| Data placement and sync boundaries            | `target`     | The gate must explicitly bind app release readiness to the linked Supabase migration state when `supabase/migrations/*.sql` changes.                      | dry-run contract + runbook update                     | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this changes local verification tooling only, not runtime data cache behavior.                                                                | explicit scope rationale                              | `N/A`                   |
| Reliability and failure handling              | `target`     | Missing Supabase credentials, unlinked projects, pending migrations, or ambiguous dry-run output fail closed with actionable output.                      | unit tests + command output review                    | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: the gate must not print secrets and must rely on existing Supabase CLI credentials without storing them in repo files.                   | script review                                         | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: dry-run output must avoid user rows and the script must not log env secrets or raw data.                                                 | script review                                         | `4/5`                   |
| Content governance                            | `N/A`        | N/A because no content model, publishing state, or revision workflow changes.                                                                             | explicit scope rationale                              | `N/A`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, role-gated CRUD, or audit flow changes.                                                                                    | explicit scope rationale                              | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public route metadata, sitemap, robots, canonical, or crawlable page changes.                                                              | explicit scope rationale                              | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable content, structured data, or crawl-safe entity page changes.                                                        | explicit scope rationale                              | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no runtime analytics event taxonomy or KPI path changes.                                                                                      | explicit scope rationale                              | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, entitlement, pricing, subscription, refund, payout, or revenue path changes.                                                     | explicit scope rationale                              | `N/A`                   |
| Incident response and support operations      | `target`     | The Supabase runbook must document how the automated drift gate behaves and what to do when it blocks a release.                                          | runbook update + validation evidence                  | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this tooling change has no finance, payout, invoice, entitlement, reconciliation, or revenue-reporting impact.                                | explicit scope rationale                              | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this verification script changes no user-facing localized copy, routing model, content schema, or locale workflow.                            | explicit scope rationale                              | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Node/bash verification scripts and Supabase CLI dry-run; add no dependency and keep behavior integrated with current pre-PR/pre-merge gates. | dependency diff + script review                       | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit tests cover skip, pass, pending-fail, explicit override, and dry-run failure paths; `verify:pre-pr` runs the new gate.                               | targeted Vitest + `verify:pre-pr`                     | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: branch-diff detection keeps routine verification cheap and avoids Supabase network calls for non-migration PRs.                          | unit tests + script review                            | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The gate is reversible as one scripts/docs/test PR and makes migration deployment readiness explicit before app PR handoff or merge readiness.            | PR diff + `verify:pre-pr` + `verify:pre-merge`        | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - No runtime route, component, server action, API route, cache, or revalidation behavior changes.
- TypeScript/domain contracts:
  - Add deterministic Node script helpers for changed-file classification and Supabase dry-run parsing.
  - Fail closed on ambiguous or failed dry-run output when migration files changed.
- Supabase/data layer:
  - No new schema.
  - The gate uses `npx supabase db push --dry-run --linked` as the canonical drift signal.
  - Do not store Supabase passwords, service-role keys, or connection strings in repo files.
- External services/tools:
  - Supabase CLI remains the authoritative tool.
  - No new package dependency.
- UI system:
  - N/A; no UI changes, no screenshot handoff required.
- Testing:
  - Unit tests cover parser and decision behavior.
  - Script integration is asserted in pre-PR/pre-merge script tests.

## Data Placement And Sync Contract

- Server-canonical data:
  - Linked Supabase migration history is the source of truth for whether schema has been applied.
- Local data:
  - Branch diff and local migration files only decide whether the gate should inspect remote state.
- Sync policy:
  - If `supabase/migrations/*.sql` changed, local verification must prove the linked remote is up to date before normal release handoff.
  - `SUPABASE_MIGRATION_DRIFT_ALLOW_PENDING=1` may be used only for an intentional schema-after-app rollout and must be documented in the active brief/PR.
- Retention and sensitivity:
  - The gate logs migration filenames and dry-run status only; no secrets or data rows.
- Cache/invalidation:
  - N/A because the script has no runtime cache.

## Failure And Negative-Path Evidence

- Fail-closed paths:
  - pending dry-run migrations fail the gate unless `SUPABASE_MIGRATION_DRIFT_ALLOW_PENDING=1` is set,
  - failed Supabase dry-run inspection fails the gate for migration-touching branches,
  - ambiguous dry-run output fails the gate for migration-touching branches.
- Negative-path tests:
  - pending migrations without override,
  - failed remote inspection,
  - no changed migration file skip,
  - explicit pending override.
- Unauthorized/forbidden/RLS impact:
  - N/A for runtime authz because this slice does not add an app route or Supabase policy; credential failure is handled as a fail-closed local release blocker.

## Identity And Rename Contract

N/A because this slice introduces no persisted user/admin entity, route param, slug, operator-visible identifier, alias, or renameable domain object.

## Route, Label, And Support-Surface Impact Sweep

- Identifiers searched:
  - `supabase db push`,
  - `migration list`,
  - `verify:pre-pr`,
  - `verify:pre-merge`,
  - `docs-only`,
  - `changed`.
- Surfaces checked:
  - `scripts/run-verify-pre-pr.sh`,
  - `scripts/run-verify-pre-merge.sh`,
  - `scripts/verification-scope.mjs`,
  - `docs/runbooks/supabase-migration-discipline.md`,
  - `tests/unit/`.
- Fallout handled:
  - pre-PR and pre-merge now call the same drift gate before lane selection,
  - Supabase runbook documents operator behavior and the one explicit override,
  - unit tests assert the gate is wired before lane selection.

## Scope

- Add a verification script that detects changed `supabase/migrations/*.sql` files and checks linked remote drift with Supabase dry-run.
- Run that script inside `npm run verify:pre-pr` and `npm run verify:pre-merge`.
- Add unit tests for skip/pass/fail/override behavior.
- Update Supabase migration runbook with the automated drift gate.

## Out Of Scope

- Applying any new Supabase migration.
- Changing production schema beyond the already completed manual habits V2 apply.
- Changing runtime app behavior, API routes, UI, analytics, or auth.
- Adding a new dependency or dashboard-only Supabase workflow.
- Enforcing drift checks for historical untouched branches outside changed `supabase/migrations/*.sql` scope.

## Acceptance Criteria

1. Branches with no changed `supabase/migrations/*.sql` files skip the drift check before contacting Supabase.
2. Branches with changed Supabase migration SQL run `npx supabase db push --dry-run --linked`.
3. Pending dry-run migrations fail `verify:pre-pr` and `verify:pre-merge` with the pending filenames.
4. Failed or ambiguous dry-run output fails closed for migration-touching branches.
5. `SUPABASE_MIGRATION_DRIFT_ALLOW_PENDING=1` allows a deliberate exception and prints that the exception must be documented.
6. Unit tests cover all gate decisions.
7. Supabase runbook documents the new gate and exception policy.

## Validation

- `npm run lint:briefs`
- `npx vitest run tests/unit/supabase-migration-drift-gate.test.ts tests/unit/verify-pre-merge-script.test.ts`
- `node ./scripts/assert-supabase-migration-drift.mjs`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Manual QA Environments

N/A because this is a local verification tooling and runbook slice with no UI, browser, deployment surface, or screenshot requirement.

## Help / Guide Impact

N/A because no user-facing Help/Guide content changes. The operational runbook `docs/runbooks/supabase-migration-discipline.md` is updated because this changes release workflow behavior.

## Checkpoint Log

- `2026-05-12 | in-progress | created the systemic Supabase migration drift gate brief after habits V2 remote schema drift was found post-merge | next: implement the verification script, tests, runbook update, and pre-PR/pre-merge integration`
- `2026-05-12 | working tree | implemented the drift gate, pre-PR/pre-merge integration, unit tests, and runbook update; targeted validation passed with lint:quality-gates, lint:briefs:all, drift-gate smoke, and targeted Vitest | next: commit, run verify:pre-pr, push, and open PR`
