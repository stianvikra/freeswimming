# Task Brief: Upload Artifact v7 Dependency Maintenance (10/10)

## Metadata

- `id`: `2026-04-27-upload-artifact-v7-dependency-maintenance-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-27`
- `updated`: `2026-04-27`

## Goal

Bring `actions/upload-artifact` workflow references from `@v6` to `@v7` on current `main`, with a narrow dependency-maintenance scope and green local/CI gates before any merge recommendation.

## Why This Brief Exists

- PR `#216` is the next narrow GitHub Actions dependency PR after the CodeQL v4 and GitHub Script v9 slices.
- It touches only CI/artifact upload workflow steps and no application runtime code.
- The update is a major action upgrade, so the branch must be rebased onto current `main`, the v7 behavior surface must be checked, and the PR body must satisfy repo governance before merge.
- The previous PR `verify` failure was PR-body governance only: missing required PR sections and brief link. The old CI log also confirmed `actions/upload-artifact@v7` loaded and reached the artifact upload step.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Reliability and failure handling`
- `Security and authz`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                        | Evidence                                     | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Continue dependency maintenance one low-risk GitHub Actions PR at a time, without bundling npm/runtime migrations.                    | PR scope + maintenance cadence               | `5/5`                   |
| UX flow clarity                               | `N/A`        | N/A because this slice changes no user-facing flows, route hierarchy, labels, states, or copy.                                        | explicit scope rationale                     | `N/A`                   |
| Visual design quality                         | `N/A`        | N/A because this slice changes no UI, layout, brand, print, screenshot, or visual assets.                                             | explicit scope rationale                     | `N/A`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because no application business logic, persistence, schema, entitlement, export, or user data behavior changes.                   | explicit scope rationale                     | `N/A`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor workflow, label, CRUD path, or operator content action changes.                                           | explicit scope rationale                     | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no rendered UI semantics, focus behavior, or interaction surface changes.                                                 | explicit scope rationale                     | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no app route, server runtime, bundle payload, or CWV budget path changes.                                                 | explicit scope rationale                     | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because no product data storage, sync, cache ownership, conflict handling, or invalidation boundary changes.                      | explicit scope rationale                     | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no runtime reads, cache tags, revalidation, CDN policy, or artifact cache strategy changes.                               | explicit scope rationale                     | `N/A`                   |
| Reliability and failure handling              | `target`     | CI, admin E2E, nightly E2E, and site-lock operation artifact upload steps remain runnable after the action upgrade.                   | workflow diff + GitHub CI + script review    | `5/5`                   |
| Security and authz                            | `target`     | Workflow permissions remain unchanged and no new token, secret, cross-repo permission, or artifact visibility change is introduced.   | workflow permission diff review              | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: the update must not add new artifact paths, hidden-file collection, private data collection, or external processors. | diff review                                  | `4/5`                   |
| Content governance                            | `supporting` | Supporting only: PR-body governance must be refreshed so required sections and brief links are present before merge.                  | generated PR body + CI verify                | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD, status workflow, publishing workflow, or editability surface changes.                                      | explicit scope rationale                     | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public metadata, sitemap, robots, canonicals, or crawl behavior changes.                                               | explicit scope rationale                     | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured data, or AI-discoverable surface changes.                                          | explicit scope rationale                     | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no product analytics events, KPI payloads, dashboards, or tracking contracts change.                                      | explicit scope rationale                     | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, pricing, entitlement, invoice, refund, portal, or revenue workflow changes.                                  | explicit commerce scope rationale            | `N/A`                   |
| Incident response and support operations      | `target`     | Failure artifacts remain available for CI verify, smoke, site-lock, admin E2E, and nightly operations after the action upgrade.       | artifact step review + GitHub Actions checks | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice does not affect reconciliation, payouts, invoices, refunds, reports, exports, or finance data.                 | explicit finance scope rationale             | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale routing, translation content, metadata, or future i18n data model changes.                                      | explicit i18n scope rationale                | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Only `actions/upload-artifact` references move from `v6` to `v7`; no workflow redesign, package dependency, or app runtime drift.     | dependency diff                              | `5/5`                   |
| Testing and QA automation                     | `target`     | Rebased branch passes local `verify:pre-pr`, local `verify:pre-merge`, and GitHub checks including artifact-producing jobs.           | local logs + GitHub checks                   | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the update preserves existing artifact paths, retention, compression, and workflow count without extra CI jobs.      | workflow diff                                | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback is a one-commit revert from `@v7` to `@v6`; no migration, secret rotation, or production rollout required.                   | PR diff + rollback note                      | `5/5`                   |

## Data Placement And Sync Contract

- `N/A` for product data because this slice does not create, move, persist, cache, sync, or delete application data.
- GitHub Actions artifacts remain GitHub-hosted operational artifacts under the existing workflow contracts.
- Existing artifact paths, names, retention days, and `if-no-files-found` behavior remain unchanged.

## Identity And Rename Contract

- `N/A` because no persisted app entities, route params, slugs, labels, or operator-visible product identifiers are introduced or renamed.
- Workflow names, job names, artifact names, and artifact path intent remain stable.

## Scope

- Rebase PR `#216` onto current `main`.
- Update `actions/upload-artifact` references from `@v6` to `@v7` in:
  - `.github/workflows/admin-e2e.yml`,
  - `.github/workflows/ci.yml`,
  - `.github/workflows/nightly-e2e.yml`,
  - `.github/workflows/site-lock-operations.yml`.
- Add this in-progress task brief with scorecard mapping and validation evidence.
- Refresh PR body so required governance sections and brief links are present.
- Run local release gates and monitor GitHub checks.

## Out Of Scope

- Merging without explicit owner approval.
- Updating other GitHub Actions, npm packages, TypeScript, ESLint, Tailwind, Stripe SDK, or grouped dependencies.
- Changing artifact paths, artifact names, retention, compression level, hidden-file inclusion, overwrite behavior, runner labels, workflow triggers, schedules, or job permissions.
- Product UI, runtime API, data model, secrets, policy text, Help/Guide, billing, analytics, or content changes.

## Compatibility Review

- `actions/upload-artifact@v7` adds direct single-file uploads through `archive: false`; this repo does not set `archive: false`, so existing zipped artifact behavior remains the default.
- v7 moves the action internals to ESM; this repo only consumes the action through workflow `uses:` references and does not import the action package.
- Repo sweep found no explicit `archive:` inputs in `.github/workflows`, and all changed upload steps keep existing `name`, `path`, `if-no-files-found`, and `retention-days` inputs.
- The previous PR #216 GitHub log confirmed the `@v7` action downloaded and executed the upload step; failure occurred earlier in PR-body governance, not in artifact upload compatibility.

## Acceptance Criteria

1. PR `#216` is no longer stale/behind current `main`.
2. The workflow diff is limited to `actions/upload-artifact@v6 -> @v7` plus this governance brief.
3. Workflow permissions, triggers, runner labels, artifact paths, artifact names, retention, and missing-file behavior remain unchanged.
4. Compatibility sweep confirms no `archive: false` direct-upload usage and no artifact behavior broadening.
5. Local `npm run verify:pre-pr` passes on the updated branch.
6. Local `npm run verify:pre-merge` passes before merge recommendation.
7. GitHub checks for PR `#216`, including verify, smoke, site-lock, PR Size, and Vercel Preview, are green before merge recommendation.

## Validation Plan

- `npm run lint:briefs`
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

- Pending on the rebased branch.
- Previous GitHub `verify` failure on PR #216 was PR-body governance only: missing required sections and brief link.

## Manual QA / Screenshot Handoff

- `N/A` because this slice does not change product UI, print, layout, branding, or browser runtime behavior.

## Help/Guide And Operator Training Impact

- `N/A` because this slice does not change admin/user workflow labels, actions, recovery behavior, or Help/Guide content.

## Checkpoint Log

- `2026-04-27 | in-progress | selected PR #216 as the next narrow GitHub Actions dependency slice after CodeQL v4 and GitHub Script v9; confirmed diff is limited to four upload-artifact workflow references and old verify failure was PR-body governance only | next: add brief, run local gates, push rebased branch, refresh PR body, and monitor CI`
