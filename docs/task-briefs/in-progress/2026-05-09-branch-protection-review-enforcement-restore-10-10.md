# Task Brief: Branch Protection Review Enforcement Restore (10/10)

## Metadata

- `id`: `2026-05-09-branch-protection-review-enforcement-restore-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-09`
- `updated`: `2026-05-09`

## Goal

Restore live `main` branch protection so pull requests require at least one approving review, then document the verified enforcement state before the next platform PR.

## Task Understanding

This is a governance and repository-operations slice. It applies the smallest live GitHub settings change needed to restore the documented review gate, then records evidence in repo docs. It does not change runtime app behavior, workflows, tests, scripts, Supabase schema, generated database types, auth, payments, UI, or production app configuration.

## Existing Pattern Check

- Canonical scorecard: `docs/quality/platform-10-10-scorecard.md`
- Brief lifecycle rules: `docs/task-brief-template.md` and `docs/task-briefs/README.md`
- Branch protection source docs: `docs/branch-protection.md` and `docs/runbooks/branch-protection.md`
- Existing apply script: `scripts/apply-branch-protection.sh`
- Live audit command: `gh api repos/stianvikra/freeswimming/branches/main/protection`

## Protected Area Check

The live GitHub branch-protection setting is an operational control, not product runtime state. The implementation must use the narrow pull-request-review protection endpoint so existing required status checks, strict mode, linear history, admin enforcement, force-push/deletion restrictions, and conversation-resolution settings are preserved.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Security and authz
- Reliability and failure handling
- Content governance
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                               | Evidence Source                            | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------- |
| Product goals and IA                          | `supporting` | Supporting only: no product IA changes; repo operators should have a clear next governance state.                                                                | docs review                                | `4/5`                   |
| UX flow clarity                               | `N/A`        | N/A because no user/admin product flow, loading, empty, error, retry, or UI path changes.                                                                        | explicit scope rationale                   | `N/A`                   |
| Visual design quality                         | `N/A`        | N/A because no rendered product UI, print, layout, or brand asset changes.                                                                                       | explicit scope rationale                   | `N/A`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because no runtime domain logic, persisted product entity, mutation invariant, or data model changes.                                                        | explicit scope rationale                   | `N/A`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin content editor, workflow label, or Help/Guide surface changes.                                                                              | explicit scope rationale                   | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no rendered UI or semantic markup changes.                                                                                                           | explicit scope rationale                   | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no runtime route, bundle, CSS, image, query, or cache behavior changes.                                                                              | explicit scope rationale                   | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because no local/server product data, sync state, cache ownership, retention, or sensitivity boundary changes.                                               | explicit scope rationale                   | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no Next.js cache, response header, revalidation, CDN, or Supabase read behavior changes.                                                             | explicit scope rationale                   | `N/A`                   |
| Reliability and failure handling              | `target`     | Live `main` protection preserves existing required checks while restoring the review count from `0` to `1`.                                                      | before/after `gh api` evidence             | `5/5`                   |
| Security and authz                            | `target`     | `main` must require one approving review, code-owner review, stale review dismissal, and fail closed on direct PR bypass attempts where GitHub supports it.      | live branch-protection audit               | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data, logs, analytics payloads, secrets, or compliance copy changes.                                                                         | explicit scope rationale                   | `N/A`                   |
| Content governance                            | `target`     | Branch-protection docs must no longer claim an unresolved review-count drift after the live setting is restored.                                                 | docs diff + brief review                   | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, recovery action, mutation UI, audit trail, or Help/Guide content changes.                                                         | explicit scope rationale                   | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public metadata, sitemap, robots, redirects, canonical URLs, or indexable content changes.                                                        | explicit scope rationale                   | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured data, AI-visible page, or AI workflow changes.                                                                | explicit scope rationale                   | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event taxonomy, KPI persistence, dashboard, or telemetry behavior changes.                                                              | explicit scope rationale                   | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, entitlement, invoice, refund, payout, subscription, or revenue reporting behavior changes.                                              | explicit scope rationale                   | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: branch-protection runbook records the verified recovery state for future governance audits.                                                     | runbook review                             | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this governance slice does not touch revenue, refunds, entitlements, payouts, or reporting workflows.                                                | explicit finance scope rationale           | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this governance slice does not change locale routing, locale content, or translation models.                                                         | explicit i18n scope rationale              | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing GitHub CLI/API, branch-protection docs, and task-brief system; add no dependency or custom framework.                                               | command evidence + dependency diff         | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed docs/brief pass brief lint and pre-PR verification; live state audit confirms the operational control.                                                   | `lint:briefs` + `verify:pre-pr` + `gh api` | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: restored review enforcement prevents costly unreviewed merges without runtime cost changes.                                                     | scope review                               | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Restore is reversible through the same GitHub protection endpoint, but rollback would require explicit owner intent because weaker review enforcement is unsafe. | live audit + runbook evidence              | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js: N/A; no product code, route, server/client component, action, API, cache, or revalidation changes.
- TypeScript/domain contracts: N/A; no contracts, validation, runtime invariants, or generated types changes.
- Supabase/data layer: N/A; no schema, RLS, storage, generated DB types, indexes, migrations, or Supabase runtime behavior changes.
- External services/tools: GitHub branch-protection is changed through the official GitHub REST API via authenticated `gh api`; no token values are stored or printed.
- UI system: N/A; no visual or screenshot handoff required.
- Testing: use live `gh api` audit plus docs-only repo gates.

## Data Placement And Sync Contract

N/A because this task changes GitHub repository governance settings and documentation only. No local or server-canonical product data, browser state, sync policy, retention rule, cache mode, or sensitive product payload changes.

## Identity And Rename Contract

N/A because no persisted or linkable product/domain entities are created, renamed, deleted, aliased, redirected, imported, exported, or repurposed.

## Scope

- Verify live `main` branch-protection state before the change.
- Restore `required_approving_review_count` from `0` to `1` while preserving existing review options.
- Verify live `main` branch-protection state after the change.
- Update branch-protection docs/runbook with the restored evidence.
- Record this work in the in-progress task brief.

## Out Of Scope

- Merging the PR without explicit owner approval.
- Runtime app code, scripts, tests, workflows, package/config changes, Supabase migrations, generated Supabase types, UI, auth, payments, or production app config.
- Changing required status check names or the branch-protection apply script defaults.
- Fixing Supabase generated type drift; that remains a separate next PR after this branch-protection slice.

## Acceptance Criteria

1. Live `main` branch protection reports `required_pull_request_reviews: 1`.
2. Live `main` branch protection still reports required status checks `verify`, `Analyze (javascript-typescript)`, and `size-check` with strict mode enabled.
3. Live `main` branch protection still reports `dismiss_stale_reviews: true`, `require_code_owner_reviews: true`, `required_conversation_resolution: true`, `enforce_admins: true`, `required_linear_history: true`, `allow_force_pushes: false`, and `allow_deletions: false`.
4. Docs/runbook no longer describe the review-count drift as unresolved.
5. Diff remains docs/governance-only.
6. `npm run lint:briefs` and `npm run verify:pre-pr` pass before PR handoff.

## Validation

- `gh api repos/stianvikra/freeswimming/branches/main/protection --jq '{...}'` before restore - PASS, showed `required_pull_request_reviews: 0`.
- `gh api repos/stianvikra/freeswimming/branches/main/protection/required_pull_request_reviews --method PATCH ... required_approving_review_count=1` - PASS.
- `gh api repos/stianvikra/freeswimming/branches/main/protection --jq '{...}'` after restore - PASS, showed `required_pull_request_reviews: 1` and unchanged required checks/settings.
- `npm run lint:briefs`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge` before merge recommendation, after owner approval path reaches merge readiness.

## Manual QA Environments

N/A because this task does not change UI, browser runtime behavior, install flows, deployment behavior, or public product surfaces.

## Rollback Plan

Do not roll back unless the owner explicitly requests weaker review enforcement. If rollback is required, use the same GitHub PR-review protection endpoint to set `required_approving_review_count` back to the requested value, then immediately document the weaker gate and reason in this brief/runbook.

## PR / Merge Rule

Open or update a PR for the docs/governance evidence. Do not merge without explicit owner approval.

## Checkpoint Log

- `2026-05-09` - Started from clean, synced `main` at `8ef6518` after post-merge preflight reported no pending closeout. Next step: restore live branch-protection review enforcement and document evidence.
- `2026-05-09` - Live pre-restore audit showed `required_pull_request_reviews: 0` with status checks and other protection settings already aligned. Applied the narrow PR-review protection PATCH through `gh api`; after audit showed `required_pull_request_reviews: 1`, `dismiss_stale_reviews: true`, `require_code_owner_reviews: true`, and unchanged checks/settings. Next step: run docs/brief validation, commit, push, and open PR without merge.
