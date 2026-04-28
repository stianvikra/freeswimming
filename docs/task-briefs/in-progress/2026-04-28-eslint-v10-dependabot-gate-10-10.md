# Task Brief: ESLint v10 Dependabot Gate (10/10)

## Metadata

- `id`: `2026-04-28-eslint-v10-dependabot-gate-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-28`
- `updated`: `2026-04-28`

## Goal

Prevent automatic ESLint semver-major PRs until the repo's Next/React lint stack supports ESLint 10, and supersede PR `#364` instead of merging a dependency update that breaks `npm run lint`.

## Why This Brief Exists

- After the previous controlled dependency slices, the remaining open npm Dependabot queue included PR `#364` (`eslint` 9 -> 10), PR `#367` (TypeScript 6), PR `#366` (Tailwind 4), PR `#363` (Stripe 22), and PR `#536` (large npm non-major group).
- PR `#364` looked like the narrowest remaining candidate because it only changes `eslint` plus lockfile metadata.
- Local evaluation of PR `#364` after rebasing onto current `main` showed that installing `eslint@10.2.1` triggers peer dependency warnings from the Next lint stack and `npm run lint` fails at runtime.
- The failure comes from `eslint-config-next@16.2.4` loading `eslint-plugin-react@7.37.5`, where the rule `react/display-name` calls an ESLint API that is not compatible with ESLint 10.
- The latest published `eslint-plugin-react` metadata checked during this slice still advertises ESLint peer support only through ESLint 9, so this is a stack-fit blocker rather than a stale lockfile issue.
- This is a non-UI dependency-governance change; screenshot handoff is `N/A`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Product goals and IA`
- `Reliability and failure handling`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                            | Evidence                                          | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Dependency maintenance continues one narrow slice at a time and rejects PRs that break the current toolchain contract.                    | PR queue review + local PR #364 evaluation        | `5/5`                   |
| UX flow clarity                               | `N/A`        | N/A because this slice changes no user-facing flow, route, label, state, or copy.                                                         | explicit scope rationale                          | `N/A`                   |
| Visual design quality                         | `N/A`        | N/A because this slice changes no UI, layout, brand, print, screenshot, or visual assets.                                                 | explicit scope rationale                          | `N/A`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because this slice changes no product business logic, persistence, schema, entitlement, export, or user data behavior.                | explicit scope rationale                          | `N/A`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor workflow, label, CRUD path, or operator content action changes.                                               | explicit scope rationale                          | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no rendered controls, semantics, focus behavior, or browser interaction changes.                                              | explicit scope rationale                          | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no app route, runtime dependency, bundle payload, or CWV budget path changes.                                                 | explicit scope rationale                          | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because no product data storage, sync, cache ownership, conflict handling, or invalidation boundary changes.                          | explicit scope rationale                          | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no runtime reads, cache tags, revalidation, CDN policy, or artifact cache strategy changes.                                   | explicit scope rationale                          | `N/A`                   |
| Reliability and failure handling              | `target`     | `npm run lint` must remain runnable; Dependabot should not reopen ESLint major PRs until the Next/React lint stack supports them.         | PR #364 lint failure + Dependabot ignore rule     | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no runtime package, token, permission, auth path, or protected API behavior changes.                                     | diff review                                       | `4/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no tracking, external processor, analytics payload, user data path, or privacy surface changes.                               | explicit scope rationale                          | `N/A`                   |
| Content governance                            | `target`     | The decision to supersede PR `#364` is documented with a brief and PR evidence rather than being tribal process memory.                   | brief + PR body/comment evidence                  | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD, status workflow, publishing workflow, or editability surface changes.                                          | explicit scope rationale                          | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public metadata, sitemap, robots, canonicals, or crawl behavior changes.                                                   | explicit scope rationale                          | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured data, or AI-discoverable surface changes.                                              | explicit scope rationale                          | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no product analytics events, KPI payloads, dashboards, or tracking contracts change.                                          | explicit scope rationale                          | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, pricing, entitlement, invoice, refund, portal, or revenue workflow changes.                                      | explicit commerce scope rationale                 | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: existing verify/CI artifacts remain the diagnostic source; no support runbook or incident workflow changes.              | gate artifacts                                    | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice does not affect reconciliation, payouts, invoices, refunds, reports, exports, or finance data.                     | explicit finance scope rationale                  | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale routing, translation content, metadata, or future i18n data model changes.                                          | explicit i18n scope rationale                     | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | ESLint major updates remain blocked while `eslint-config-next` / bundled React ESLint plugins are not ESLint 10-compatible.               | `npm run lint` failure + npm peer metadata review | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed brief lint, local `verify:pre-pr`, local `verify:pre-merge`, and required GitHub checks pass for the supersede guard PR.          | local logs + GitHub checks                        | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: reducing unsupported automated PR churn lowers maintenance noise without adding CI jobs or runtime cost.                 | open PR queue review                              | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback is a one-commit revert of the Dependabot ignore rule and this brief; no migration, secret rotation, or rollout flag is required. | PR diff + rollback note                           | `5/5`                   |

## Data Placement And Sync Contract

- `N/A` for product data because this slice does not create, move, persist, cache, sync, or delete application data.
- The only durable state change is Dependabot configuration for npm dependency update generation.
- No server-canonical data, local storage schema, cache invalidation, or conflict behavior changes.

## Identity And Rename Contract

- `N/A` because no persisted app entities, route params, slugs, labels, or operator-visible product identifiers are introduced or renamed.
- Package identity remains the existing `eslint` devDependency on `main`; this slice does not change the package version.

## Scope

- Add a Dependabot npm ignore rule for `eslint` semver-major updates.
- Document why PR `#364` is superseded instead of merged.
- Keep `eslint` pinned to the existing ESLint 9-compatible line on `main`.
- Refresh PR body with required governance sections and this brief link.
- Run local release gates and monitor GitHub checks.

## Out Of Scope

- Merging PR `#364`.
- Updating ESLint, `eslint-config-next`, Next.js, React ESLint plugins, TypeScript, Tailwind, Stripe SDK, grouped npm dependencies, runtime dependencies, or package locks.
- Changing lint rules, `eslint.config.mjs`, package manager behavior, workflows, scripts, application code, routes, UI, DB schema, secrets, Help/Guide, billing, analytics, or content.
- Suppressing or skipping lint/tests to make ESLint 10 pass.

## Compatibility Review

- Current `main` uses `eslint@9.39.2` and `eslint-config-next@16.2.4`.
- PR `#364` proposes `eslint@10.2.1`.
- Local evaluation on PR `#364` after rebase confirmed:
  - `npm install` installs `eslint@10.2.1` but emits peer override warnings for `eslint-plugin-import`, `eslint-plugin-jsx-a11y`, and `eslint-plugin-react` under `eslint-config-next`.
  - `npm run typecheck` passes.
  - `npm run lint` fails before completing because `react/display-name` from `eslint-plugin-react@7.37.5` calls `contextOrFilename.getFilename`, which is not available under ESLint 10.
- `npm view eslint-plugin-react version peerDependencies --json` on `2026-04-28` reported latest `eslint-plugin-react@7.37.5` with peer dependency `eslint: ^3 || ^4 || ^5 || ^6 || ^7 || ^8 || ^9.7`.
- `npm view eslint-config-next@16.2.4 dependencies peerDependencies --json` on `2026-04-28` reported dependency `eslint-plugin-react: ^7.37.0` and peer `eslint >=9.0.0`, so the top-level peer range is broader than the nested plugin compatibility in practice.
- Dependabot should continue to update ESLint 9 patch/minor versions while ESLint semver-major waits for an explicit lint-stack modernization brief.

## Acceptance Criteria

1. The diff does not change `package.json` or `package-lock.json`.
2. Dependabot npm config ignores only `eslint` semver-major updates in addition to the existing `@types/node` major guard.
3. The existing npm non-major group remains intact.
4. PR `#364` is documented as superseded/not merge-ready because ESLint 10 breaks `npm run lint` with the current Next/React lint stack.
5. Local `npm run lint:briefs:all` passes.
6. Local `npm run verify:pre-pr` passes.
7. Local `npm run verify:pre-merge` passes before merge recommendation.
8. Required GitHub checks pass before merge recommendation.

## Validation Plan

- `npm run lint:briefs:all`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`
- GitHub PR checks:
  - `verify`
  - `size-check`
  - `deploy-preview`
  - `e2e-smoke`
  - `site-lock-smoke`
  - `CodeQL`
  - `Analyze (javascript-typescript)`
  - Vercel

## Validation Evidence

- Open PR queue review on `2026-04-28` found five remaining npm Dependabot PRs: grouped non-major `#536`, TypeScript 6 `#367`, Tailwind 4 `#366`, ESLint 10 `#364`, and Stripe 22 `#363`.
- PR `#364` was selected for evaluation because it is a narrow single-package dev-tool diff.
- PR `#364` was rebased locally onto current `main` without conflicts.
- Local install on PR `#364` updated `node_modules` to `eslint@10.2.1` and emitted peer override warnings for `eslint-plugin-import`, `eslint-plugin-jsx-a11y`, and `eslint-plugin-react` under `eslint-config-next@16.2.4`.
- `npm run typecheck` on PR `#364`: PASS.
- `npm run lint` on PR `#364`: FAIL with ESLint `10.2.1`, `TypeError: Error while loading rule 'react/display-name': contextOrFilename.getFilename is not a function`, while linting `app/about/AboutClient.tsx`.
- Package metadata check on `2026-04-28`: latest `eslint-plugin-react@7.37.5` still advertises peer support only through ESLint 9.7, so there is no narrow same-plugin update path that makes PR `#364` stack-fit.
- Stack-fit decision: do not merge PR `#364` while the repo's Next/React lint stack is not ESLint 10-compatible; supersede with a Dependabot semver-major ignore instead.
- Local dependency install on `main` restored `eslint@9.39.2` before creating this supersede branch.
- `npm run lint:briefs:all`: PASS for all 204 task brief files.
- `npm run verify:pre-pr`: PASS in full lane, artifact `artifacts/test-runs/20260428-072626/verify.log`; full lane passed brief/admin/env/PR-body lint, ESLint, typecheck, unit tests, production build, perf budgets, and E2E `113 passed / 343 skipped`.
- Perf-budget trend again recommended tightening one stretch target after consecutive green runs; decision for this dependency-governance slice is `hold/carry-forward` to the maintenance baseline/performance-budget workstream rather than changing perf budgets here.

## Manual QA / Screenshot Handoff

- `N/A` because this slice does not change product UI, print, layout, branding, browser runtime behavior, or visible user-facing output.

## Help/Guide And Operator Training Impact

- `N/A` because this slice does not change admin/user workflow labels, actions, recovery behavior, or Help/Guide content.

## Checkpoint Log

- `2026-04-28 | in-progress | reviewed refreshed Dependabot queue, selected PR #364 as the narrowest remaining dev-tool candidate, rebased it onto main, and confirmed ESLint 10 breaks npm run lint through eslint-plugin-react under eslint-config-next | next: add Dependabot semver-major ignore, run gates, open supersede PR, and close/comment PR #364 after handoff is stable`
- `2026-04-28 | in-progress | added Dependabot semver-major ignore for eslint, restored local install to eslint 9.39.2, and full local verify:pre-pr passed on artifact artifacts/test-runs/20260428-072626/verify.log | next: commit, push, open supersede PR, close/comment PR #364, and run pre-merge/CI gates`
