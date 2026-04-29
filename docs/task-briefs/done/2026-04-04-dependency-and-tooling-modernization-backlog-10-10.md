# Task Brief: Dependency And Tooling Modernization Backlog (10/10)

## Metadata

- `id`: `2026-04-04-dependency-and-tooling-modernization-backlog-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-04`
- `updated`: `2026-04-29`

## Goal

Replace stale open dependency PRs with one explicit modernization backlog brief that defines what should be revisited later, in what order, and under what trigger conditions.

## Why This Brief Exists

- Old Dependabot PRs should not stay open as a pseudo-backlog.
- The owner wants these items tracked in the repo in a durable, prioritized way instead:
  - `#311` grouped non-major dependency refresh
  - `#5` `@types/node` `20 -> 25`
  - `#6` `eslint` `9 -> 10`
  - `#7` `tailwindcss` `3 -> 4`
- These PRs were intentionally closed on `2026-04-04` because they were stale and no longer trustworthy as execution artifacts:
  - they were opened against older `main`,
  - they failed local or CI verification,
  - some of them represent migration work that should be re-evaluated against current product code, not revived from old branches.
- This brief exists so the work is still visible and prioritized without letting stale PRs accumulate operational debt.

## 2026-04-29 Closeout / Supersession

- Status: `done`.
- The original backlog purpose has been fulfilled: stale dependency PRs were not revived, and the work was handled through fresh, controlled maintenance slices from current `main`.
- Superseding evidence:
  - GitHub Actions majors were handled through narrow dependency-maintenance PRs for CodeQL, `actions/github-script`, and `actions/upload-artifact`.
  - npm/runtime packages were handled through dedicated slices for `jsdom`, `lucide-react`, ESLint 10, Stripe 22, grouped npm non-major updates, TypeScript 6, and Tailwind 4.
  - Node ambient types are now runtime-aligned through the Node 24 LTS migration audit, with `.nvmrc`, `package.json`, npm, CI, and docs aligned to Node 24 / npm 11 / `@types/node` 24.
  - The open PR queue was empty during the post-Node-24 preflight on `2026-04-29`.
- Remaining carry-forward items now live in the maintenance system, not this stale modernization backlog:
  - perf-budget ratchet decision remains `hold` until two new weekly green cycles after the `2026-04-26` tighten,
  - recurring hydration warnings remain a diagnostics/hardening carry-forward,
  - future stack/tooling ecosystem-fit checks run through `docs/runbooks/maintenance-cadence.md` and the monthly maintenance checklist.
- Do not reopen or reuse the old PR branches referenced below. Future dependency work should start from the current monthly or quarterly maintenance cadence.

## Original 2026-04-04 State Snapshot

- Current repo dependency posture on `main`:
  - `@types/node`: `^20`
  - `eslint`: `^9`
  - `tailwindcss`: `^3.4.17`
- Current workflow versions on `main` are tracked separately and are not the primary scope of this brief:
  - `github/codeql-action@v3`
  - `actions/github-script@v7`
  - `actions/upload-artifact@v6`
- Closed stale PRs now tracked by this brief:
  - `#311` `chore: bump the npm-non-major group across 1 directory with 12 updates`
  - `#5` `chore: bump @types/node from 20.19.30 to 25.2.3`
  - `#6` `chore: bump eslint from 9.39.2 to 10.0.0`
  - `#7` `chore: bump tailwindcss from 3.4.17 to 4.1.18`

## Proposed Backlog And Priority

### Slice A: Fresh Non-Major Dependency Refresh

- Replaces old PR `#311`.
- Priority: `low`
- Recommended timing:
  - after current product delivery pressure is calm,
  - before the next broader tooling migration wave.
- Why:
  - non-major refreshes are the easiest way to pay down drift gradually,
  - but the old batch PR should not be trusted as-is.
- Execution rule:
  - generate a fresh dependency branch from current `main`,
  - review changes in smaller batches if the new grouped diff is noisy,
  - do not merge a grouped batch if root cause of any failing package is unclear.

### Slice B: Evaluate `@types/node` 25 Adoption

- Replaces old PR `#5`.
- Priority: `low`
- Recommended timing:
  - only after the repo is stable on current Node/LTS setup,
  - preferably bundled with other TypeScript/tooling cleanup if that reduces churn.
- Why:
  - this is mostly a type-surface change, not a user-facing feature,
  - it may still expose latent type assumptions and should be treated as intentional tech work.
- Execution rule:
  - take this as a dedicated narrow slice,
  - validate for type-only fallout and ambient Node API assumptions,
  - avoid combining it with Tailwind or ESLint major migrations.

### Slice C: ESLint `9 -> 10` Migration

- Replaces old PR `#6`.
- Priority: `medium`
- Recommended timing:
  - before the next larger frontend/tooling cleanup,
  - but not in the middle of a high-churn product rollout.
- Why:
  - lint major bumps affect local workflow, CI, autofix behavior, and rule compatibility,
  - this is maintenance with real engineering impact, not just a version bump.
- Execution rule:
  - create a dedicated migration brief and PR,
  - document rule changes and config changes explicitly,
  - only merge when local verify and CI are green on current `main`.

### Slice D: Tailwind `3 -> 4` Migration

- Replaces old PR `#7`.
- Priority: `medium` effort / `low` urgency
- Recommended timing:
  - only when the team actively wants to modernize styling infrastructure,
  - not as a “quick dependency update.”
- Why:
  - this is a real migration project, not routine maintenance,
  - old PR evidence already showed smoke and preview instability.
- Execution rule:
  - treat as a dedicated migration program,
  - require explicit UI regression review,
  - split discovery, migration, and cleanup if needed instead of one giant PR.

## Trigger Rules

This backlog should be revisited when one or more of these become true:

1. Product delivery pressure is lower and there is room for maintenance work.
2. Two consecutive green baseline cycles have been achieved on current mainline quality gates.
3. A dependency/security signal or developer-friction issue makes one item materially more urgent.
4. A broader frontend/tooling modernization initiative is already underway and can absorb one of these items cleanly.

This backlog should not be executed:

- in the middle of a large UI rollout,
- during auth/access-control stabilization,
- while core Playwright baseline is red or flaky without root cause,
- by reviving the old PR branches directly.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim in this planning brief:

- `Product goals and IA`
- `Content governance`
- `Stack-fit and dependency discipline`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                    | Evidence                                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The repo contains one clear modernization backlog with named slices, priorities, and trigger rules for all four closed stale PRs.                                 | brief review + linted brief                    | `5/5`                   |
| UX flow clarity                               | `N/A`        | N/A because this planning brief does not change any user-facing flows or route behavior.                                                                          | explicit scope rationale                       | `N/A`                   |
| Visual design quality                         | `N/A`        | N/A because this planning brief does not change any UI or visual system implementation.                                                                           | explicit scope rationale                       | `N/A`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: future execution slices must be separated so dependency changes do not blur root-cause analysis when regressions occur.                          | brief scope rules + future child briefs        | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this planning brief does not alter admin editing workflows.                                                                                           | explicit scope rationale                       | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because this planning brief does not ship runtime UI changes.                                                                                                 | explicit scope rationale                       | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because this planning brief does not change runtime bundles or route performance.                                                                             | explicit scope rationale                       | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this backlog is repo planning only and does not define a new stateful runtime boundary.                                                               | explicit scope rationale                       | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no runtime cache behavior changes are introduced by this planning brief.                                                                              | explicit scope rationale                       | `N/A`                   |
| Reliability and failure handling              | `target`     | Each backlog item records when it is safe to execute and explicitly forbids reviving stale PR branches as a release path.                                         | brief review + closed stale PRs                | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: future dependency/tooling slices must continue current fail-closed security defaults and negative-path verification where relevant.              | future execution brief requirements            | `4/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because the planning brief does not add data collection, retention, or disclosure changes.                                                                    | explicit scope rationale                       | `N/A`                   |
| Content governance                            | `target`     | Closed stale PRs are replaced by one canonical repo-tracked brief rather than scattered GitHub reminders.                                                         | brief file + closed PR history                 | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because the planning brief does not change admin CRUD/status workflows.                                                                                       | explicit scope rationale                       | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because the planning brief does not affect public route metadata, canonicals, or crawl behavior.                                                              | explicit scope rationale                       | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because the planning brief does not affect public semantic output or content structure.                                                                       | explicit scope rationale                       | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this planning brief does not add or modify analytics events.                                                                                          | explicit scope rationale                       | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because the tracked work items are dependency/tooling maintenance only and do not directly alter commerce flows.                                              | explicit scope rationale                       | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this planning brief does not change production incident procedures directly; it only records when modernization work should or should not be started. | explicit scope rationale tied to planning-only | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because this planning brief does not affect reconciliation, pricing, entitlements, or financial reporting.                                                    | explicit scope rationale tied to planning-only | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this planning brief does not change content models, locale routing, or metadata needed for future internationalization.                               | explicit scope rationale tied to planning-only | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Each deferred modernization item is framed as a fresh slice from current `main`, with no expectation that stale Dependabot branches be reused.                    | brief review + closed PR comments              | `5/5`                   |
| Testing and QA automation                     | `target`     | The backlog explicitly requires future execution slices to pass current local verify gates and CI on fresh branches from current `main`.                          | brief review + validation section              | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: grouped upgrades should be split when needed so CI/runtime/debug cost does not spike due to over-batched changes.                                | slice guidance in brief                        | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Every future modernization slice must define rollback as “revert that one fresh slice,” not untangle a stale bundled branch.                                      | brief review + future child-brief requirement  | `5/5`                   |

## Data Placement And Sync Contract

- `N/A` because this planning brief does not introduce or modify stateful runtime entities.
- Future child slices must document any data-boundary impact if a dependency/tooling change alters runtime persistence, caching, or sync semantics.

## Identity And Rename Contract

- `N/A` because this planning brief does not introduce or change persisted entity IDs, slugs, or route-linked identifiers.
- Future child slices must document identifier impact if a migration changes canonical names, generated artifacts, or operator-visible identifiers.

## Scope

- Close stale reminder-style PRs for:
  - `#311`
  - `#5`
  - `#6`
  - `#7`
- Create one planned modernization backlog brief in the repo.
- Record:
  - replacement slice names,
  - priority,
  - timing guidance,
  - trigger conditions,
  - execution guardrails.

## Out Of Scope

- Performing any of the dependency/tooling migrations now.
- Updating current dependencies in this slice.
- Reopening or reviving the old stale PR branches.
- Deciding exact execution dates for the child slices.
- Tracking unrelated GitHub Actions upgrade PRs in this brief.

## Acceptance Criteria

1. Old PRs `#311`, `#5`, `#6`, and `#7` are closed with an explanation that fresh slices will replace them.
2. The repo contains one planned brief covering those four items.
3. The brief defines a clear priority and trigger rule for each item.
4. The brief explicitly states that stale PRs must not be reused as execution artifacts.
5. The brief passes `npm run lint:briefs`.

## Validation

- For this planning slice:
  - `npm run lint:briefs`
  - `npm run lint:briefs:all`
- For future execution slices created from this brief:
  - `npm run typecheck`
  - `npm run test:unit`
  - `npm run test:e2e`
  - `npm run build`
  - `npm run verify:pre-pr`
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for validation.
- This planning slice should only need brief linting locally.
- Any child implementation slice created from this brief must run the full local verify gates before PR/merge.

## Manual QA Environments

- `N/A` for this planning slice because no runtime UI or deployment behavior changes are being shipped.

## Constraints

- Do not use old open PRs as backlog reminders.
- Do not revive stale branches for execution.
- Prefer one fresh modernization slice per meaningful risk area.
- Keep migration work separated enough that failures remain debuggable.

## 10/10 Quality Bar

- The backlog must be easy to trust:
  - every item has a purpose, priority, and timing rule.
- The backlog must be actionable:
  - future-you should know what to do next without reopening stale PR archaeology.
- The backlog must reduce operational noise:
  - old PRs are closed,
  - current repo state remains clean,
  - future work starts from current `main`.
- The backlog must preserve engineering discipline:
  - no vague “we should probably do this sometime” language without a trigger or rationale.

## 10/10 Cross-Cut Categories

- Content governance and source-of-truth
  - this brief becomes the canonical backlog record for the four closed stale dependency PRs.
- Identity and rename safety
  - `N/A` because no persisted identifiers are changed.
- Taxonomy and category management
  - tracked items are categorized as separate modernization slices instead of one ambiguous maintenance bucket.
- Workflow and publishing safety
  - stale PRs are closed so they cannot be mistaken for merge-ready work.
- Business logic correctness and data integrity
  - future work must isolate risky upgrades so regressions are attributable.
- RBAC and auditability
  - `N/A` for this planning slice; future execution slices must preserve current role boundaries where relevant.
- UX/UI quality contract
  - `N/A` for this planning slice; Tailwind migration later must carry explicit UI regression QA.
- Admin editor ergonomics
  - `N/A` for this planning slice.
- Performance contract
  - `N/A` for this planning slice; Tailwind and dependency refresh slices must define route/perf expectations if runtime output changes.
- Data placement and sync boundaries
  - `N/A` for this planning slice.
- Caching and invalidation strategy
  - `N/A` for this planning slice.
- Testing contract
  - fresh execution slices must run current local verify gates and required CI, not rely on old stale PR checks.
- Observability and KPI tracking
  - `N/A` for this planning slice.
- Incident response and support operations
  - no new incident workflow is introduced; this brief only reduces stale operational noise.
- Finance and reporting operations
  - `N/A` because modernization scope here does not alter finance flows.
- i18n operational readiness
  - `N/A` because planning scope here does not alter locale or content-model architecture.
- Stack-fit and dependency discipline
  - upgrades should remain stack-native and separated by real migration risk.
- Scalability and cost efficiency
  - avoid giant dependency bundles that create noisy CI/debug cost.
- Migration and rollback readiness
  - every future slice must remain independently revertable.
- Definition of done quant targets
  - this planning slice is done only when the four target PRs are closed and the brief is lint-clean.
- Help/Guide and operator training documentation
  - `N/A` because no operator workflow copy or recovery behavior is changed in product surfaces.

## Help/Guide And Operator Training Contract

- `N/A` because this planning slice does not change admin/user workflows, labels, or recovery behavior in the running product.

## Child Brief Expectations

Any future child brief created from this backlog must include:

1. exact package/version scope,
2. explicit local validation plan,
3. rollback path,
4. whether the slice is safe to batch or must remain isolated,
5. any design/runtime/manual QA impact,
6. whether the slice should update Help/Guide or operator runbooks.

## Checkpoint Log

- `2026-04-29 | done | post-Node-24 preflight found the GitHub PR queue empty, active runtime/tooling docs aligned to Node 24 / npm 11 / TypeScript 6 / Tailwind 4 / ESLint 10, and this planned backlog fully superseded by the controlled dependency-maintenance wave | next: resume the session-builder priority unless the next monthly maintenance pass promotes a specific narrow audit`
