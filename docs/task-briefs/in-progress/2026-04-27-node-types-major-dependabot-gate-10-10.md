# Task Brief: Node Types Major Dependabot Gate (10/10)

## Metadata

- `id`: `2026-04-27-node-types-major-dependabot-gate-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-27`
- `updated`: `2026-04-27`

## Goal

Prevent automatic `@types/node` major-version PRs until the repo intentionally changes its Node runtime policy, and supersede PR `#365` instead of merging Node 25 types into a Node 20 runtime baseline.

## Why This Brief Exists

- The refreshed dependency queue left six open npm Dependabot PRs after the GitHub Actions, `jsdom`, and `lucide-react` slices.
- PR `#365` is a narrow devDependency diff, but it upgrades `@types/node` from `^20` to `^25` while `package.json` still declares `node >=20.17.0 <21` and CI resolves Node `20.20.2`.
- A local smoke check on the PR branch showed `@types/node@25.6.0` installs and `npm run typecheck` / `npm run build` pass, but that does not remove the stack-fit issue: Node 25 ambient types can allow compile-time use of Node APIs that are not available in the supported Node 20 runtime.
- The best maintenance move is to stop Dependabot from reopening this major line automatically and keep the actual Node type/runtime migration as an explicit modernization slice.
- This is a non-UI governance/tooling change; screenshot handoff is `N/A`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Product goals and IA`
- `Reliability and failure handling`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                         | Evidence                                              | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Dependency maintenance continues one narrow slice at a time and rejects PRs that do not match the current runtime policy.              | PR queue review + this brief                          | `5/5`                   |
| UX flow clarity                               | `N/A`        | N/A because this slice changes no user-facing flow, route, label, state, or copy.                                                      | explicit scope rationale                              | `N/A`                   |
| Visual design quality                         | `N/A`        | N/A because this slice changes no UI, layout, brand, print, screenshot, or visual assets.                                              | explicit scope rationale                              | `N/A`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because this slice changes no product business logic, persistence, schema, entitlement, export, or user data behavior.             | explicit scope rationale                              | `N/A`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor workflow, label, CRUD path, or operator content action changes.                                            | explicit scope rationale                              | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no rendered controls, semantics, focus behavior, or browser interaction changes.                                           | explicit scope rationale                              | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no app route, runtime dependency, bundle payload, or CWV budget path changes.                                              | explicit scope rationale                              | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because no product data storage, sync, cache ownership, conflict handling, or invalidation boundary changes.                       | explicit scope rationale                              | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no runtime reads, cache tags, revalidation, CDN policy, or artifact cache strategy changes.                                | explicit scope rationale                              | `N/A`                   |
| Reliability and failure handling              | `target`     | Dependabot should no longer create unsupported `@types/node` major PRs, and local/CI gates must remain green after the config change.  | Dependabot config diff + local gates + GitHub checks  | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no runtime package, token, permission, auth path, or protected API behavior changes.                                  | diff review                                           | `4/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no tracking, external processor, analytics payload, user data path, or privacy surface changes.                            | explicit scope rationale                              | `N/A`                   |
| Content governance                            | `target`     | The decision to supersede PR `#365` is documented with a brief and PR body evidence instead of being tribal process memory.            | brief + PR body                                       | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD, status workflow, publishing workflow, or editability surface changes.                                       | explicit scope rationale                              | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public metadata, sitemap, robots, canonicals, or crawl behavior changes.                                                | explicit scope rationale                              | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured data, or AI-discoverable surface changes.                                           | explicit scope rationale                              | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no product analytics events, KPI payloads, dashboards, or tracking contracts change.                                       | explicit scope rationale                              | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, pricing, entitlement, invoice, refund, portal, or revenue workflow changes.                                   | explicit commerce scope rationale                     | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: existing verify/CI artifacts remain the diagnostic source; no support runbook or incident workflow changes.           | gate artifacts                                        | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice does not affect reconciliation, payouts, invoices, refunds, reports, exports, or finance data.                  | explicit finance scope rationale                      | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale routing, translation content, metadata, or future i18n data model changes.                                       | explicit i18n scope rationale                         | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | `@types/node` major updates remain blocked while repo runtime is Node 20; future Node type adoption requires an explicit runtime plan. | `package.json` engine review + Dependabot ignore rule | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed brief lint, local `verify:pre-pr`, local `verify:pre-merge`, and required GitHub checks pass.                                  | local logs + GitHub checks                            | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: reducing unsupported automated PR churn lowers maintenance noise without adding CI jobs or runtime cost.              | open PR queue review                                  | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback is a one-commit revert of the Dependabot ignore rule and this brief; no migration, secret rotation, or rollout flag needed.   | PR diff + rollback note                               | `5/5`                   |

## Data Placement And Sync Contract

- `N/A` for product data because this slice does not create, move, persist, cache, sync, or delete application data.
- The only durable state change is Dependabot configuration for npm dependency update generation.
- No server-canonical data, local storage schema, cache invalidation, or conflict behavior changes.

## Identity And Rename Contract

- `N/A` because no persisted app entities, route params, slugs, labels, or operator-visible product identifiers are introduced or renamed.
- Package identity remains the existing `@types/node` devDependency on `main`; this slice does not change the package version.

## Scope

- Add a Dependabot npm ignore rule for `@types/node` semver-major updates.
- Document why PR `#365` is superseded instead of merged.
- Keep `@types/node` pinned to the existing Node 20-compatible line on `main`.
- Refresh PR body with required governance sections and this brief link.
- Run local release gates and monitor GitHub checks.

## Out Of Scope

- Merging PR `#365`.
- Updating `@types/node`, TypeScript, ESLint, Tailwind, Stripe SDK, grouped npm dependencies, runtime dependencies, or package locks.
- Changing Node runtime policy, `.nvmrc`, `package.json` engines, CI Node version, workflows, scripts, application code, routes, UI, DB schema, secrets, Help/Guide, billing, analytics, or content.
- Suppressing or skipping tests to make the dependency decision pass.

## Compatibility Review

- Current `package.json` engine is `node >=20.17.0 <21`; CI resolves Node `20.20.2`.
- PR `#365` proposes `@types/node@25.6.0` and `undici-types@7.19.2`.
- Local evaluation on PR `#365` confirmed `@types/node@25.6.0` installs and `npm run typecheck` / `npm run build` pass, but the ambient type surface would still be ahead of the supported runtime.
- Dependabot should continue to group npm minor/patch updates, including Node 20-compatible `@types/node` patch/minor updates, while semver-major `@types/node` updates wait for an explicit runtime/tooling modernization brief.

## Acceptance Criteria

1. The diff does not change `package.json` or `package-lock.json`.
2. Dependabot npm config ignores only `@types/node` semver-major updates.
3. The existing npm non-major group remains intact.
4. PR `#365` is documented as superseded/not merge-ready because Node 25 types do not match the current Node 20 runtime policy.
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

- Open PR queue review on `2026-04-27` found six remaining npm Dependabot PRs: grouped non-major `#533`, TypeScript 6 `#367`, Tailwind 4 `#366`, `@types/node` 25 `#365`, ESLint 10 `#364`, and Stripe 22 `#363`.
- PR `#365` was selected for evaluation because it is the narrowest remaining devDependency diff.
- GitHub CI failure on PR `#365` was PR-body governance only: missing required Summary, Scope, Risk, Test Evidence, Checklist, and brief link sections.
- PR `#365` branch was rebased locally onto `main`.
- Local smoke on PR `#365` installed `@types/node@25.6.0` and passed:
  - `npm ls @types/node --depth=0`
  - `npm run typecheck`
  - `npm run build`
- Stack-fit decision: do not merge PR `#365` while repo runtime remains Node `>=20.17.0 <21`; supersede with a Dependabot semver-major ignore instead.
- Local dependency install on this supersede branch restored `@types/node@20.19.30` to match `main`.
- `npm run lint:briefs:all`: PASS for all 203 task brief files.
- `npm run verify:pre-pr`: PASS in full lane, artifact `artifacts/test-runs/20260427-212635/verify.log`; full lane passed brief/admin/env/PR-body lint, ESLint, typecheck, unit tests, production build, perf budgets, and E2E `112 passed / 344 skipped`.
- Perf-budget trend again recommended tightening one stretch target after consecutive green runs; decision for this dependency-governance slice is `hold/carry-forward` to the maintenance baseline/performance-budget workstream rather than changing perf budgets here.

## Manual QA / Screenshot Handoff

- `N/A` because this slice does not change product UI, print, layout, branding, browser runtime behavior, or visible user-facing output.

## Help/Guide And Operator Training Impact

- `N/A` because this slice does not change admin/user workflow labels, actions, recovery behavior, or Help/Guide content.

## Checkpoint Log

- `2026-04-27 | in-progress | reviewed refreshed Dependabot queue and evaluated PR #365; local install/typecheck/build passed, but Node 25 ambient types do not match the repo Node 20 runtime policy | next: add Dependabot semver-major ignore, run gates, open supersede PR, and close/comment PR #365 after handoff is stable`
- `2026-04-27 | in-progress | added Dependabot semver-major ignore for @types/node, restored local node_modules to @types/node 20.19.30, and full local verify:pre-pr passed on artifact artifacts/test-runs/20260427-212635/verify.log | next: commit, push, open supersede PR, refresh PR #365 disposition, and run pre-merge/CI gates`
