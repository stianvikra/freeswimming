# Task Brief: Branch Protection Solo-Owner Merge Policy (10/10)

## Metadata

- `id`: `2026-05-09-branch-protection-solo-owner-merge-policy-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-09`
- `updated`: `2026-05-09`

## Goal

Align live `main` branch protection with solo-owner operations: require PRs, required checks, conversation resolution, explicit owner approval in Codex chat, and `0` required GitHub approving reviews.

## Task Understanding

This is a governance, repository-operations, and tooling slice. It applies the smallest live GitHub settings change needed to make solo-owner merges practical, then aligns the restore script and branch-protection docs with that policy. It does not change runtime app behavior, workflows, Supabase schema, generated database types, auth, payments, UI, or production app configuration.

## Existing Pattern Check

- Canonical scorecard: `docs/quality/platform-10-10-scorecard.md`
- Brief lifecycle rules: `docs/task-brief-template.md` and `docs/task-briefs/README.md`
- Branch protection source docs: `docs/branch-protection.md` and `docs/runbooks/branch-protection.md`
- Existing apply script: `scripts/apply-branch-protection.sh`
- Live audit command: `gh api repos/stianvikra/freeswimming/branches/main/protection`

## Protected Area Check

The live GitHub branch-protection setting is an operational control, not product runtime state. The implementation must use the narrow pull-request-review protection endpoint for the live review-policy correction so existing required status checks, strict mode, linear history, admin enforcement, force-push/deletion restrictions, and conversation-resolution settings are preserved. The repo restore script must then encode the same solo-owner policy so future full re-apply operations do not reintroduce an impossible non-solo review requirement.

## Route, Label, And Support-Surface Impact Sweep

- Identifiers searched: `branch protection`, `required_pull_request_reviews`, `required_approving_review_count`, `require_code_owner_reviews`, `dismiss_stale_reviews`, `apply-branch-protection`, `approving review`, `code-owner review`, `stale review dismissal`, `CI / verify`, `Analyze (javascript-typescript)`, `size-check`.
- Directories/surfaces checked: `docs/branch-protection.md`, `docs/runbooks/branch-protection.md`, `docs/runbooks/ci-unblock.md`, `scripts/apply-branch-protection.sh`, `package.json`, active task brief, and broader `docs/`, `scripts/`, `tests/`, `.github/` search results.
- Fallout handled in scope: branch-protection docs, CI-unblock runbook, apply script defaults, live GitHub protection state, and this active brief.
- Fallout intentionally out of scope: historical done-brief text remains as historical evidence and Supabase generated type drift remains the next separate PR.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Security and authz
- Reliability and failure handling
- Content governance
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                            | Evidence Source                            | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------- |
| Product goals and IA                          | `supporting` | Supporting only: no product IA changes; repo operators should have a clear solo-owner governance state.                                                       | docs review                                | `4/5`                   |
| UX flow clarity                               | `N/A`        | N/A because no user/admin product flow, loading, empty, error, retry, or UI path changes.                                                                     | explicit scope rationale                   | `N/A`                   |
| Visual design quality                         | `N/A`        | N/A because no rendered product UI, print, layout, or brand asset changes.                                                                                    | explicit scope rationale                   | `N/A`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because no runtime domain logic, persisted product entity, mutation invariant, or data model changes.                                                     | explicit scope rationale                   | `N/A`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin content editor, workflow label, or Help/Guide surface changes.                                                                           | explicit scope rationale                   | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no rendered UI or semantic markup changes.                                                                                                        | explicit scope rationale                   | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no runtime route, bundle, CSS, image, query, or cache behavior changes.                                                                           | explicit scope rationale                   | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because no local/server product data, sync state, cache ownership, retention, or sensitivity boundary changes.                                            | explicit scope rationale                   | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no Next.js cache, response header, revalidation, CDN, or Supabase read behavior changes.                                                          | explicit scope rationale                   | `N/A`                   |
| Reliability and failure handling              | `target`     | Live `main` protection preserves required checks and PR workflow while removing the solo-owner review deadlock.                                               | before/after `gh api` evidence             | `5/5`                   |
| Security and authz                            | `target`     | `main` must require PRs, required checks, conversation resolution, linear history, admin enforcement, and explicit owner approval in Codex chat before merge. | live branch-protection audit + PR workflow | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data, logs, analytics payloads, secrets, or compliance copy changes.                                                                      | explicit scope rationale                   | `N/A`                   |
| Content governance                            | `target`     | Branch-protection docs and the active brief must describe the solo-owner review policy without conflicting `1`-review requirements.                           | docs diff + brief review                   | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, recovery action, mutation UI, audit trail, or Help/Guide content changes.                                                      | explicit scope rationale                   | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public metadata, sitemap, robots, redirects, canonical URLs, or indexable content changes.                                                     | explicit scope rationale                   | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured data, AI-visible page, or AI workflow changes.                                                             | explicit scope rationale                   | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event taxonomy, KPI persistence, dashboard, or telemetry behavior changes.                                                           | explicit scope rationale                   | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, entitlement, invoice, refund, payout, subscription, or revenue reporting behavior changes.                                           | explicit scope rationale                   | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: branch-protection runbook records the solo-owner recovery state for future governance audits.                                                | runbook review                             | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this governance slice does not touch revenue, refunds, entitlements, payouts, or reporting workflows.                                             | explicit finance scope rationale           | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this governance slice does not change locale routing, locale content, or translation models.                                                      | explicit i18n scope rationale              | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing GitHub CLI/API, branch-protection script, docs, and task-brief system; add no dependency or custom framework.                                    | command evidence + dependency diff         | `5/5`                   |
| Testing and QA automation                     | `target`     | Script/docs/brief changes pass the full verification lane before PR handoff; live state audit confirms the operational control.                               | full verification + `gh api`               | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: solo-owner policy avoids blocked maintenance PRs without runtime cost changes.                                                               | scope review                               | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Restore is repeatable through the same script/API, and a future multi-operator rollback to required reviews has an explicit path.                             | live audit + runbook evidence              | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js: N/A; no product code, route, server/client component, action, API, cache, or revalidation changes.
- TypeScript/domain contracts: N/A; no contracts, validation, runtime invariants, or generated types changes.
- Supabase/data layer: N/A; no schema, RLS, storage, generated DB types, indexes, migrations, or Supabase runtime behavior changes.
- External services/tools: GitHub branch-protection is changed through the official GitHub REST API via authenticated `gh api`; no token values are stored or printed. `scripts/apply-branch-protection.sh` remains the repo restore path and must encode the same live solo-owner policy.
- UI system: N/A; no visual or screenshot handoff required.
- Testing: use live `gh api` audit plus full repo verification because the branch-protection restore script changes.

## Data Placement And Sync Contract

N/A because this task changes GitHub repository governance settings, a local restore script, and documentation only. No local or server-canonical product data, browser state, sync policy, retention rule, cache mode, or sensitive product payload changes.

## Identity And Rename Contract

N/A because no persisted or linkable product/domain entities are created, renamed, deleted, aliased, redirected, imported, exported, or repurposed.

## Scope

- Verify live `main` branch-protection state before and after the policy correction.
- Set `required_approving_review_count` to `0`, `require_code_owner_reviews` to `false`, and `dismiss_stale_reviews` to `false` for solo-owner operations.
- Preserve required status checks, strict mode, conversation resolution, linear history, admin enforcement, force-push protection, and deletion protection.
- Update `scripts/apply-branch-protection.sh` so future full re-apply operations keep the solo-owner policy and current required check names.
- Update branch-protection docs/runbooks with the restored solo-owner evidence.
- Record this work in the in-progress task brief.

## Out Of Scope

- Merging the PR without explicit owner approval.
- Runtime app code, tests, workflows, package/config changes, Supabase migrations, generated Supabase types, UI, auth, payments, or production app config.
- Changing required status check behavior beyond aligning the script defaults with the current live names.
- Fixing Supabase generated type drift; that remains a separate next PR after this branch-protection slice.

## Acceptance Criteria

1. Live `main` branch protection reports `required_pull_request_reviews: 0`.
2. Live `main` branch protection still reports required status checks `verify`, `Analyze (javascript-typescript)`, and `size-check` with strict mode enabled.
3. Live `main` branch protection reports `dismiss_stale_reviews: false`, `require_code_owner_reviews: false`, `required_conversation_resolution: true`, `enforce_admins: true`, `required_linear_history: true`, `allow_force_pushes: false`, and `allow_deletions: false`.
4. Branch-protection script defaults encode the same solo-owner review policy and current required check names.
5. Docs/runbooks no longer describe a one-review requirement for solo-owner operations.
6. `npm run verify:pre-pr` and `npm run verify:pre-merge` pass before merge readiness.

## Validation

- `gh api repos/stianvikra/freeswimming/branches/main/protection --jq '{...}'` before solo-owner restore - PASS, showed blocking `required_pull_request_reviews: 1`.
- `gh api repos/stianvikra/freeswimming/branches/main/protection/required_pull_request_reviews --method PATCH ... required_approving_review_count=0` - PASS.
- `gh api repos/stianvikra/freeswimming/branches/main/protection --jq '{...}'` after solo-owner restore - PASS, showed `required_pull_request_reviews: 0`, `dismiss_stale_reviews: false`, `require_code_owner_reviews: false`, and unchanged required checks/settings.
- `bash -n scripts/apply-branch-protection.sh`
- `npm run lint:briefs:all`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge` before merge recommendation.

## Manual QA Environments

N/A because this task does not change UI, browser runtime behavior, install flows, deployment behavior, or public product surfaces.

## Rollback Plan

If a second company operator is added later, re-evaluate this policy and consider requiring `1` approving GitHub review again. Rollback to stricter GitHub reviews is done through the same PR-review protection endpoint and `scripts/apply-branch-protection.sh`, then documented in this brief/runbook.

## PR / Merge Rule

Open or update a PR for the governance/script evidence. Do not merge without explicit owner approval in Codex chat.

## Checkpoint Log

- `2026-05-09` - Started from clean, synced `main` at `8ef6518` after post-merge preflight reported no pending closeout. Initial branch-protection review restore changed live `required_pull_request_reviews` from `0` to `1`.
- `2026-05-09` - PR #661 exposed that required GitHub reviews deadlock solo-owner operations because `stianvikra` is the only company operator. Owner confirmed Codex-chat merge approval is sufficient and requested `implementer solo-owner merge policy`.
- `2026-05-09` - Applied narrow PR-review protection PATCH through `gh api`; after audit showed `required_pull_request_reviews: 0`, `dismiss_stale_reviews: false`, `require_code_owner_reviews: false`, and unchanged required checks/settings. Next step: align script/docs/brief, run full validation, push PR update, and stop before merge until explicit owner approval.
