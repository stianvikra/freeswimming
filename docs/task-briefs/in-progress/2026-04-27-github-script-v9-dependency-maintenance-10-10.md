# Task Brief: GitHub Script v9 Dependency Maintenance (10/10)

## Metadata

- `id`: `2026-04-27-github-script-v9-dependency-maintenance-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-27`
- `updated`: `2026-04-27`

## Goal

Bring `actions/github-script` workflow references from `@v7` to `@v9` on current `main`, with a narrow dependency-maintenance scope and green local/CI gates before any merge recommendation.

## Why This Brief Exists

- PR `#421` is the next narrow GitHub Actions dependency PR after the CodeQL v4 slice.
- It touches only CI/maintenance workflow scripts and no application runtime code.
- The update is a major action upgrade, so the branch must be rebased onto current `main`, the v9 breaking-change surface must be checked, and the PR body must satisfy repo governance before merge.
- The previous PR `verify` failure was PR-body governance only: missing required PR sections and brief link, not a workflow runtime failure.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Reliability and failure handling`
- `Security and authz`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                     | Evidence                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Continue the dependency-maintenance sequence one low-risk GitHub Actions PR at a time, without bundling npm/runtime migrations.    | PR scope + maintenance cadence            | `5/5`                   |
| UX flow clarity                               | `N/A`        | N/A because this slice changes no user-facing flows, route hierarchy, labels, states, or copy.                                     | explicit scope rationale                  | `N/A`                   |
| Visual design quality                         | `N/A`        | N/A because this slice changes no UI, layout, brand, print, screenshot, or visual assets.                                          | explicit scope rationale                  | `N/A`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because no application business logic, persistence, schema, entitlement, export, or user data behavior changes.                | explicit scope rationale                  | `N/A`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor workflow, label, CRUD path, or operator content action changes.                                        | explicit scope rationale                  | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no rendered UI semantics, focus behavior, or interaction surface changes.                                              | explicit scope rationale                  | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no app route, server runtime, bundle payload, or CWV budget path changes.                                              | explicit scope rationale                  | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because no product data storage, sync, cache ownership, conflict handling, or invalidation boundary changes.                   | explicit scope rationale                  | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no runtime reads, cache tags, revalidation, CDN policy, or artifact cache strategy changes.                            | explicit scope rationale                  | `N/A`                   |
| Reliability and failure handling              | `target`     | PR size, Vercel preview comment, and monthly maintenance issue scripts remain runnable with `actions/github-script@v9`.            | workflow diff + GitHub CI + script review | `5/5`                   |
| Security and authz                            | `target`     | Workflow permissions remain least-privilege and no new token, secret, or cross-repo permission is introduced.                      | workflow permission diff review           | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no new external processor, log payload, or private data collection is added beyond existing GitHub Actions usage. | diff review                               | `4/5`                   |
| Content governance                            | `supporting` | Supporting only: PR-body governance must be refreshed so required sections and brief links are present before merge.               | generated PR body + CI verify             | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD, status workflow, publishing workflow, or editability surface changes.                                   | explicit scope rationale                  | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public metadata, sitemap, robots, canonicals, or crawl behavior changes.                                            | explicit scope rationale                  | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured data, or AI-discoverable surface changes.                                       | explicit scope rationale                  | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no product analytics events, KPI payloads, dashboards, or tracking contracts change.                                   | explicit scope rationale                  | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, pricing, entitlement, invoice, refund, portal, or revenue workflow changes.                               | explicit commerce scope rationale         | `N/A`                   |
| Incident response and support operations      | `target`     | Monthly maintenance issue automation remains intact so recurring maintenance reminders continue after the action upgrade.          | script review + GitHub Actions validation | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice does not affect reconciliation, payouts, invoices, refunds, reports, exports, or finance data.              | explicit finance scope rationale          | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale routing, translation content, metadata, or future i18n data model changes.                                   | explicit i18n scope rationale             | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Only `actions/github-script` references move from `v7` to `v9`; no workflow redesign, package dependency, or app runtime drift.    | dependency diff                           | `5/5`                   |
| Testing and QA automation                     | `target`     | Rebased branch passes local `verify:pre-pr`, local `verify:pre-merge`, and GitHub checks including PR size and Vercel preview.     | local logs + GitHub checks                | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the update preserves existing workflow count and does not add duplicate jobs, broad retries, or extra CI cost.    | workflow diff                             | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback is a one-commit revert from `@v9` to `@v7`; no migration, secret rotation, or production rollout required.                | PR diff + rollback note                   | `5/5`                   |

## Data Placement And Sync Contract

- `N/A` because this slice does not create, move, persist, cache, sync, or delete product data.
- GitHub issues, PR comments, and workflow summaries remain GitHub-hosted operational artifacts under the existing workflow contracts.

## Identity And Rename Contract

- `N/A` because no persisted app entities, route params, slugs, labels, or operator-visible product identifiers are introduced or renamed.
- Workflow names and job intent remain stable: `Monthly Maintenance Reminder`, `PR Size`, and `Vercel Preview`.

## Scope

- Rebase PR `#421` onto current `main`.
- Update `actions/github-script` references from `@v7` to `@v9` in:
  - `.github/workflows/monthly-maintenance-reminder.yml`,
  - `.github/workflows/pr-size.yml`,
  - `.github/workflows/vercel-preview.yml`.
- Add this in-progress task brief with scorecard mapping and validation evidence.
- Refresh PR body so required governance sections and brief links are present.
- Run local release gates and monitor GitHub checks.

## Out Of Scope

- Merging without explicit owner approval.
- Updating other GitHub Actions, npm packages, TypeScript, ESLint, Tailwind, Stripe SDK, or grouped dependencies.
- Changing workflow permissions, schedules, runner labels, triggers, PR-size threshold, Vercel deployment behavior, or monthly issue content.
- Product UI, runtime API, data model, secrets, policy text, Help/Guide, billing, analytics, or content changes.

## Compatibility Review

- `actions/github-script@v8` moved to Node 24 and requires GitHub Actions runner `v2.327.1+`; this repo uses GitHub-hosted `ubuntu-latest` runners.
- `actions/github-script@v9` breaks scripts that use `require('@actions/github')` or redeclare `getOctokit`.
- Repo sweep found no `require('@actions/github')` and no `getOctokit` redeclaration in `.github/workflows`.
- The changed scripts use the injected `github`, `context`, and `core` helpers, which are still the intended `github-script` script context.

## Acceptance Criteria

1. PR `#421` is no longer stale/behind current `main`.
2. The workflow diff is limited to `actions/github-script@v7 -> @v9` plus this governance brief.
3. Workflow permissions remain unchanged and least-privilege.
4. v9 breaking-change sweep confirms no incompatible `require('@actions/github')` or `getOctokit` redeclaration in changed workflows.
5. Local `npm run verify:pre-pr` passes on the updated branch.
6. Local `npm run verify:pre-merge` passes before merge recommendation.
7. GitHub checks for PR `#421`, including PR Size and Vercel Preview, are green before merge recommendation.

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
- Previous GitHub `verify` failure on PR #421 was PR-body governance only: missing required sections and brief link.

## Manual QA / Screenshot Handoff

- `N/A` because this slice does not change product UI, print, layout, branding, or browser runtime behavior.

## Help/Guide And Operator Training Impact

- `N/A` because this slice does not change admin/user workflow labels, actions, recovery behavior, or Help/Guide content.

## Checkpoint Log

- `2026-04-27 | in-progress | selected PR #421 as the next narrow GitHub Actions dependency slice after CodeQL v4; confirmed diff is limited to three actions/github-script references and old verify failure was PR-body governance only | next: add brief, run local gates, push rebased branch, refresh PR body, and monitor CI`
