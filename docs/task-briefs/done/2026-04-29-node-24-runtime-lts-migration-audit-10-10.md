# Task Brief: Node 24 Runtime LTS Migration Audit (10/10)

## Metadata

- `id`: `2026-04-29-node-24-runtime-lts-migration-audit-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-29`
- `updated`: `2026-04-29`

## Goal

Audit the repo's Node runtime baseline after the April dependency wave and either migrate the app/tooling contract from Node 20 to the best supported LTS line, or explicitly record `hold` / `watch` with the next review point.

## Why This Brief Exists

- The repo currently declares Node 20 in `.nvmrc`, `package.json` engines, and docs.
- Node 20 reaches end-of-life on `2026-04-30`, so keeping it as the active baseline creates support and security posture risk.
- Node runtime changes affect local development, GitHub Actions, Vercel, `@types/node`, npm, Playwright gates, and release confidence. They should not be mixed into feature work.
- The maintenance cadence now explicitly requires stack/tooling ecosystem-fit decisions instead of relying on chat memory.

## Current Decision

- Decision vocabulary: `upgrade now` / `hold` / `watch`.
- Audit decision: `upgrade now` to Node 24.
- Fallback decision: use Node 22 only if Node 24 fails on repo tooling or hosted runtime compatibility while Node 22 passes.
- Hold condition: keep Node 20 only if both Node 24 and Node 22 are blocked by deterministic compatibility failures.

## Audit Evidence

- Node release schedule: Node 20 is Maintenance LTS with EOL on `2026-04-30`; Node 22 is Maintenance LTS with EOL on `2027-04-30`; Node 24 is Active LTS with EOL on `2028-04-30`.
- Node release policy: production applications should use Active LTS or Maintenance LTS releases; EOL lines stop receiving security fixes.
- Next.js 16 requires Node `20.9.0+`, so Node 24 is inside the supported runtime range.
- Vercel supports Node `24.x`, `22.x`, and `20.x`; Node `24.x` is the default for new projects and is available for builds and functions.
- Repo CI workflows already resolve Node through `node-version-file: .nvmrc`, so the runtime switch stays centralized.
- Local migration result: Node `v24.13.0`, npm `11.6.2`, `@types/node@24.12.2`, and current stack packages install and validate under Node 24.

Decision rationale: choose Node 24 over Node 22 because it is the current Active LTS line with the longest support window, Vercel supports it directly, Next.js 16 supports it, and local gates passed through install, lint/typecheck, unit, build, and perf-budget validation.

## Scope

- Review official runtime support posture for:
  - Node 20, Node 22, Node 24,
  - Next.js 16,
  - Vercel Node runtime support,
  - repo CI/local runtime alignment.
- If the audit supports upgrade:
  - update `.nvmrc`,
  - update `package.json` `engines.node`,
  - update `package.json` `packageManager`,
  - align `@types/node` with the chosen runtime major,
  - refresh `package-lock.json`,
  - update current architecture/maintenance docs that state the active runtime baseline.
- Keep existing GitHub Actions `node-version-file: .nvmrc` wiring unless evidence shows it is unsafe.

## Out Of Scope

- App feature work, UI redesign, route changes, database schema changes, billing changes, or Supabase/Stripe contract changes.
- Broad dependency modernization beyond the runtime-aligned `@types/node` update.
- Removing historical done-brief evidence that accurately described the old Node 20 baseline at the time.
- Changing branch protection or required checks.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                                                   | Evidence                                                   | Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----- |
| Product goals and IA                          | `supporting` | Supporting only: runtime migration must not change product IA or user jobs.                                                        | diff review                                                | `4/5` |
| UX flow clarity                               | `supporting` | Supporting only: no user workflow changes; any runtime failure must be caught by existing gates.                                   | full validation lane                                       | `4/5` |
| Visual design quality                         | `N/A`        | N/A because no UI, layout, print, or branding surface changes.                                                                     | explicit scope rationale                                   | `N/A` |
| Business logic correctness and data integrity | `target`     | Runtime upgrade does not alter persisted data contracts, migrations, or owner-scoped API semantics.                                | diff review + full gates                                   | `5/5` |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin surfaces must keep passing existing checks without new workflow changes.                                    | full gates                                                 | `4/5` |
| Accessibility (a11y)                          | `N/A`        | N/A because no rendered UI or interaction semantics change.                                                                        | explicit scope rationale                                   | `N/A` |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: build/perf gates must remain green after runtime migration.                                                       | build + perf budget gate                                   | `4/5` |
| Data placement and sync boundaries            | `N/A`        | N/A because no local/server ownership, sync, cache key, or persistence contract changes.                                           | explicit data-boundary rationale                           | `N/A` |
| Caching and invalidation strategy             | `N/A`        | N/A because no runtime cache policy, route freshness, CDN behavior, or invalidation trigger changes.                               | explicit cache rationale                                   | `N/A` |
| Reliability and failure handling              | `target`     | Node/npm/runtime alignment is deterministic across local, CI, and hosted runtime; full gate passes on the selected runtime.        | `.nvmrc` + engines + CI + verify evidence                  | `5/5` |
| Security and authz                            | `target`     | Moving off near-EOL Node reduces runtime support risk and does not weaken fail-closed auth/security behavior.                      | official support review + negative-path coverage in gates  | `5/5` |
| Privacy and compliance                        | `N/A`        | N/A because no prompts, analytics payloads, user data exports, retention, or policy text changes.                                  | explicit privacy scope rationale                           | `N/A` |
| Content governance                            | `N/A`        | N/A because no content model, publish workflow, revisions, or editorial ownership changes.                                         | explicit content scope rationale                           | `N/A` |
| Admin workflow and editability                | `supporting` | Supporting only: admin editability must remain covered by existing gates with no new admin UX.                                     | full validation lane                                       | `4/5` |
| SEO and crawlability                          | `N/A`        | N/A because no metadata, sitemap, robots, canonical URL, or public route behavior changes.                                         | explicit SEO scope rationale                               | `N/A` |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable content, structured data, or crawl surface changes.                                          | explicit AI scope rationale                                | `N/A` |
| Analytics and KPI observability               | `N/A`        | N/A because no event taxonomy, analytics persistence, or dashboard behavior changes.                                               | explicit analytics scope rationale                         | `N/A` |
| Commerce and revenue ops                      | `N/A`        | N/A because checkout, entitlements, invoices, billing portal, and finance reconciliation are unchanged.                            | explicit commerce scope rationale                          | `N/A` |
| Incident response and support operations      | `supporting` | Supporting only: maintenance docs must make future runtime checks repeatable for the next operator.                                | runbook/docs update                                        | `4/5` |
| Finance and reporting operations              | `N/A`        | N/A because this slice introduces no finance/reporting mutation or ledger-affecting behavior.                                      | explicit finance scope rationale                           | `N/A` |
| i18n operational readiness                    | `N/A`        | N/A because locale routing, copy localization, metadata, and content fallback behavior are unchanged.                              | explicit i18n scope rationale                              | `N/A` |
| Stack-fit and dependency discipline           | `target`     | Selected Node/npm/types baseline is a supported stable LTS fit for Next 16, Vercel, CI, local gates, and current dependencies.     | official docs + install/typecheck/build/full gate evidence | `5/5` |
| Testing and QA automation                     | `target`     | `npm run verify:pre-pr`, GitHub CI, and `npm run verify:pre-merge` pass after the runtime change.                                  | local + CI gate evidence                                   | `5/5` |
| Scalability and cost efficiency               | `supporting` | Supporting only: runtime migration adds no service, background job, dependency bloat, or recurring cost pattern.                   | package/runtime diff review                                | `4/5` |
| DevOps and rollback readiness                 | `target`     | Runtime change is revertable as one PR; CI continues to resolve Node from `.nvmrc`; rollback requires no data repair or migration. | rollback note + workflow review                            | `5/5` |

Critical target categories for 10/10 claim:

- Reliability and failure handling
- Security and authz
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

## Acceptance Criteria

1. Official-source audit records Node 20 EOL and the support posture for Node 22/24, Next.js 16, and Vercel.
2. Decision is explicitly recorded as `upgrade now`, `hold`, or `watch`.
3. If `upgrade now`, `.nvmrc`, `engines.node`, `packageManager`, `@types/node`, and docs agree on the same runtime baseline.
4. GitHub Actions continue to use `node-version-file: .nvmrc`.
5. No app runtime, UI, schema, billing, or auth behavior changes outside the runtime/tooling contract.
6. `npm run verify:pre-pr`, required GitHub checks, and `npm run verify:pre-merge` pass before merge recommendation.
7. Rollback is a normal PR revert with no database, secret, or customer-data repair.

## Validation

- `node -v` -> `v24.13.0`
- `npm -v` -> `11.6.2`
- `npm install` -> PASS, refreshed `package-lock.json`
- `npm install --package-lock-only` -> PASS, restored npm 11 bundled optional lock entries required by clean CI installs
- `npm ci` -> PASS after lockfile repair
- `npm audit --omit=dev --audit-level=high` -> PASS for high/critical production threshold; reports two moderate `next`/transitive `postcss` advisories where `npm audit fix --force` would downgrade to `next@9.3.3`, so no force-fix in this runtime slice
- `npm ls @types/node --depth=0` -> `@types/node@24.12.2`
- `npm run lint:briefs:all` -> PASS
- `npm run lint` -> PASS
- `npm run typecheck` -> PASS
- `npm run test:unit` -> PASS, `163` files / `840` tests
- `npm run build` -> PASS, Next.js `16.2.4` production build under Node 24
- `npm run test:perf:budgets` -> PASS after production build; script still recommends one perf-budget tighten after three green weeks, carried forward to perf-baseline rather than this runtime PR
- `npm run test:e2e` -> PASS via latest `npm run verify:pre-pr`, `112` passed / `344` skipped across configured matrix
- `npm run verify:pre-pr` -> PASS, full lane selected because `.nvmrc`, `package.json`, and `package-lock.json` changed
- required GitHub checks -> PASS on PR `#552`
- `npm run verify:pre-merge` -> PASS on PR head `a05196d`; full public lane with `112` passed / `344` skipped, private-gate step skipped because `SITE_LOCK_ENABLED!=1`
- PR `#552` -> merged as `94c934a`

## Checkpoint Log

- `2026-04-29 | in-progress | started Node runtime LTS migration audit from clean main after lifecycle triage; current repo contract is Node 20/npm 10 while official Node 20 EOL is 2026-04-30, local default resolves Node 24/npm 11, and monthly maintenance cadence already requires runtime alignment decisions | next: test Node 24 migration path, update runtime docs/contracts if gates support it, otherwise record hold/watch with fallback rationale`
- `2026-04-29 | in-progress | selected upgrade now to Node 24 after official support audit and local validation; updated .nvmrc, package engines, packageManager, @types/node, architecture docs, and maintenance cadence/checklist; lint, typecheck, unit, build, and perf-budget passed under Node 24 | next: run full verify:pre-pr, open PR, monitor CI, then run verify:pre-merge before merge recommendation`
- `2026-04-29 | in-progress | npm run verify:pre-pr passed full lane under Node 24, including E2E 112 passed / 344 skipped; known hydration and NO_COLOR warnings remained non-blocking and are not introduced by this runtime contract change | next: commit, push, open PR, monitor CI, run verify:pre-merge`
- `2026-04-29 | in-progress | PR #552 CI install failed because npm 11 lockfile was missing bundled optional @emnapi entries required by npm ci; regenerated package-lock with npm install --package-lock-only and verified npm ci locally | next: push lockfile repair, rerun verify:pre-pr/CI, then verify:pre-merge`
- `2026-04-29 | in-progress | npm run verify:pre-pr rerun passed full lane after npm ci lockfile repair, including E2E 111 passed / 345 skipped; perf-budget again passed and carried forward the tighten recommendation | next: push PR update, monitor CI, rerun verify:pre-merge`
- `2026-04-29 | in-progress | GitHub Linux npm ci still required root optional @emnapi/core and @emnapi/runtime lock entries referenced by @rolldown/binding-wasm32-wasi; restored those npm lock entries without changing package.json scope | next: rerun npm ci and full verify:pre-pr, push, monitor CI, then verify:pre-merge`
- `2026-04-29 | in-progress | npm ci, lint:briefs:all, and full npm run verify:pre-pr passed after root optional @emnapi lock entries were restored; latest E2E result was 112 passed / 344 skipped | next: push PR update, monitor CI, then run verify:pre-merge before merge recommendation`
- `2026-04-29 | done | PR #552 merged as 94c934a after required GitHub checks and npm run verify:pre-merge passed on a05196d; moved brief to done as AGENTS lifecycle closeout | next: continue from clean main with the next planned maintenance/audit slice`
