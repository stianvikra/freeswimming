# Task Brief: jsdom v29 Dependency Maintenance (10/10)

## Metadata

- `id`: `2026-04-27-jsdom-v29-dependency-maintenance-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-27`
- `updated`: `2026-04-27`

## Goal

Bring the test DOM dependency `jsdom` from `^28.0.0` to `^29.0.2` through PR `#361`, with a narrow dependency-maintenance scope and green local/CI gates before any merge recommendation.

## Why This Brief Exists

- All narrow GitHub Actions dependency PRs have been handled first: CodeQL v4, GitHub Script v9, and Upload Artifact v7.
- PR `#361` is the next lowest-risk dependency candidate because `jsdom` is a devDependency used by Vitest's `jsdom` environment, not an application runtime dependency.
- The update is still a major package upgrade, so it must be rebased onto current `main`, checked against repo Node constraints, and validated through the full gate.
- The previous PR `verify` failure was PR-body governance only: missing required PR sections and brief link.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Reliability and failure handling`
- `Security and authz`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                  | Evidence                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Continue dependency maintenance one low-risk PR at a time, starting with dev/test-only packages before runtime packages.        | PR scope + open PR queue review         | `5/5`                   |
| UX flow clarity                               | `N/A`        | N/A because this slice changes no user-facing flows, route hierarchy, labels, states, or copy.                                  | explicit scope rationale                | `N/A`                   |
| Visual design quality                         | `N/A`        | N/A because this slice changes no UI, layout, brand, print, screenshot, or visual assets.                                       | explicit scope rationale                | `N/A`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because no application business logic, persistence, schema, entitlement, export, or user data behavior changes.             | explicit scope rationale                | `N/A`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor workflow, label, CRUD path, or operator content action changes.                                     | explicit scope rationale                | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: jsdom CSSOM/accessibility-adjacent behavior changes must not break component tests or accessibility checks.    | unit/component tests + E2E checks       | `4/5`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no app route, server runtime, bundle payload, or CWV budget path changes.                                           | explicit scope rationale                | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because no product data storage, sync, cache ownership, conflict handling, or invalidation boundary changes.                | explicit scope rationale                | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no runtime reads, cache tags, revalidation, CDN policy, or artifact cache strategy changes.                         | explicit scope rationale                | `N/A`                   |
| Reliability and failure handling              | `target`     | Vitest/unit/component suites, build, E2E smoke/full lane, and CI remain runnable after the jsdom upgrade.                       | local gates + GitHub checks             | `5/5`                   |
| Security and authz                            | `target`     | No runtime dependency, token, permission, auth path, protected API behavior, or production package surface is introduced.       | dependency classification + diff review | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: the update must not add runtime collection, external processors, analytics, or user data paths.                | package diff + runtime scope review     | `4/5`                   |
| Content governance                            | `supporting` | Supporting only: PR-body governance must be refreshed so required sections and brief links are present before merge.            | generated PR body + CI verify           | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD, status workflow, publishing workflow, or editability surface changes.                                | explicit scope rationale                | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public metadata, sitemap, robots, canonicals, or crawl behavior changes.                                         | explicit scope rationale                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured data, or AI-discoverable surface changes.                                    | explicit scope rationale                | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no product analytics events, KPI payloads, dashboards, or tracking contracts change.                                | explicit scope rationale                | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, pricing, entitlement, invoice, refund, portal, or revenue workflow changes.                            | explicit commerce scope rationale       | `N/A`                   |
| Incident response and support operations      | `target`     | Failure diagnostics remain available through existing verify/CI artifacts, and no artifact or support runbook behavior changes. | gate artifacts + PR checks              | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice does not affect reconciliation, payouts, invoices, refunds, reports, exports, or finance data.           | explicit finance scope rationale        | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale routing, translation content, metadata, or future i18n data model changes.                                | explicit i18n scope rationale           | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Only `jsdom` and lockfile-transitive test dependencies change; no runtime package, framework, or tooling migration is bundled.  | package diff                            | `5/5`                   |
| Testing and QA automation                     | `target`     | Rebased branch passes targeted unit coverage, local `verify:pre-pr`, local `verify:pre-merge`, and required GitHub checks.      | local logs + GitHub checks              | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the update should not add CI jobs, production bundle weight, or app runtime cost.                              | package scope review                    | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback is a one-commit revert from `^29.0.2` to `^28.0.0`; no migration, secret rotation, or production rollout required.     | PR diff + rollback note                 | `5/5`                   |

## Data Placement And Sync Contract

- `N/A` for product data because this slice does not create, move, persist, cache, sync, or delete application data.
- `jsdom` remains a local/CI test environment dependency used by Vitest through `vitest.config.ts`.
- No server-canonical data, local storage schema, cache invalidation, or conflict behavior changes.

## Identity And Rename Contract

- `N/A` because no persisted app entities, route params, slugs, labels, or operator-visible product identifiers are introduced or renamed.
- Package identity is limited to the existing `jsdom` devDependency entry in `package.json` and `package-lock.json`.

## Scope

- Rebase PR `#361` onto current `main`.
- Update `jsdom` from `^28.0.0` to `^29.0.2` in:
  - `package.json`,
  - `package-lock.json`.
- Add this in-progress task brief with scorecard mapping and validation evidence.
- Refresh PR body so required governance sections and brief links are present.
- Run local release gates and monitor GitHub checks.

## Out Of Scope

- Merging without explicit owner approval.
- Updating TypeScript, ESLint, Tailwind, Stripe SDK, Lucide, grouped npm dependencies, or runtime dependencies.
- Changing Vitest config, test semantics, production code, workflows, scripts, routes, UI, DB schema, secrets, policy text, Help/Guide, billing, analytics, or content.
- Suppressing or skipping tests to make the dependency update pass.

## Compatibility Review

- `jsdom@29.0.2` supports Node `^20.19.0 || ^22.13.0 || >=24.0.0`; repo CI uses `.nvmrc` Node `20`, and the previous CI log resolved Node `20.20.2`, which satisfies the new package engine.
- Repo `package.json` engine remains `>=20.17.0 <21`; this slice does not change the repo-wide Node policy.
- `vitest.config.ts` uses `environment: "jsdom"`, so the primary behavior surface is unit/component tests.
- Release notes call out CSSOM/getComputedStyle changes and bad-port blocking. Validation must include unit/component tests plus the full pre-PR gate because jsdom affects test rendering semantics.
- Dependabot noted a `prepare` script metadata change. Registry metadata for `jsdom@29.0.2` shows no `install` or `postinstall` script; the `prepare` script is package-development metadata and is not a production runtime hook for this repo's published registry install.
- Package-lock changes are dev/test scoped and do not add production dependencies.

## Acceptance Criteria

1. PR `#361` is no longer stale/behind current `main`.
2. The diff is limited to `package.json`, `package-lock.json`, and this governance brief.
3. `jsdom` remains a devDependency and no runtime dependency is changed.
4. Node compatibility is documented against repo CI Node.
5. Local targeted unit/component coverage passes.
6. Local `npm run verify:pre-pr` passes on the updated branch.
7. Local `npm run verify:pre-merge` passes before merge recommendation.
8. GitHub checks for PR `#361`, including verify, smoke, site-lock, PR Size, CodeQL, and Vercel Preview, are green before merge recommendation.

## Validation Plan

- `npm run lint:briefs`
- Targeted unit/component tests that exercise jsdom-backed rendering
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

- Dependency install checked with repo Node/npm lane: Node `20.20.2`, npm `10.8.2`, `npm ls jsdom --depth=0` reports `jsdom@29.0.2`.
- `npm run lint:briefs:all`: PASS for all 200 task brief files.
- Targeted jsdom-backed component/unit coverage: `npx vitest run tests/unit/session-generator-panel.test.tsx tests/unit/workout-builder-hub.test.tsx tests/unit/poolside-preview-page-client.test.tsx tests/unit/program-builder-hub.test.tsx` PASS, 4 files / 74 tests.
- Full local release gates pending on the rebased branch.
- Previous GitHub `verify` failure on PR #361 was PR-body governance only: missing required sections and brief link.

## Manual QA / Screenshot Handoff

- `N/A` because this slice does not change product UI, print, layout, branding, or browser runtime behavior.

## Help/Guide And Operator Training Impact

- `N/A` because this slice does not change admin/user workflow labels, actions, recovery behavior, or Help/Guide content.

## Checkpoint Log

- `2026-04-27 | in-progress | selected PR #361 as the next dependency slice after all narrow GitHub Actions PRs were merged; confirmed old CI failure was PR-body governance only and jsdom 29.0.2 supports CI Node 20.20.2 | next: run targeted tests, full local gates, push rebased branch, refresh PR body, and monitor CI`
- `2026-04-27 | in-progress | rebased PR #361 onto main, confirmed diff is package.json/package-lock plus this brief, installed with Node 20.20.2/npm 10.8.2, and targeted jsdom-backed unit/component tests passed | next: commit brief, run verify:pre-pr, push, refresh PR body, and monitor CI`
