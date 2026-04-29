# Task Brief: Maintenance Baseline Audit After Dependency Wave (10/10)

## Metadata

- `id`: `2026-04-29-maintenance-baseline-audit-post-dependency-wave-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-29`
- `updated`: `2026-04-29`

## Goal

Capture the post-dependency-wave maintenance baseline in durable docs so stack/runtime facts, performance-budget decisions, Playwright gate guidance, and recurring E2E diagnostics are handled systematically instead of relying on chat memory.

## Why This Brief Exists

- The controlled dependency wave has shipped through Tailwind 4 and its lifecycle closeout.
- The maintenance system already exists, but the dependency wave revealed several concrete calibration items:
  - stack docs are too generic after Next 16, React 19, TypeScript 6, and Tailwind 4,
  - local Playwright-heavy gates now rely on an 8192 MB managed Next devserver heap default,
  - `npm run test:perf:trend` still recommends `tighten`, while the latest budget ratchet happened on `2026-04-26`,
  - workout-builder hydration warnings continue to appear in full E2E logs and should be tracked as diagnostics, not mixed into unrelated dependency closeouts.
- This slice documents the audit and creates the next maintenance baseline handoff without changing runtime behavior.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Product goals and IA`
- `Performance (CWV + payloads)`
- `Reliability and failure handling`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                 | Evidence                                             | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Maintenance baseline has one clear next-step path after the dependency wave and records which findings are immediate, deferred, or N/A.                        | brief + maintenance docs review                      | `5/5`                   |
| UX flow clarity                               | `N/A`        | N/A because this docs-only audit changes no user/admin flows, labels, empty states, actions, or route journeys.                                                | explicit UX scope rationale                          | `N/A`                   |
| Visual design quality                         | `N/A`        | N/A because no UI, layout, print, brand, or visual rendering behavior changes.                                                                                 | explicit visual scope rationale                      | `N/A`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: audit decisions must not alter checkout, progress, entitlement, content, or persistence semantics.                                            | docs-only diff + verification lane                   | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because admin editing, publishing, notes, and operator CRUD surfaces are untouched.                                                                        | explicit admin editor scope rationale                | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no rendered semantics, focus order, labels, or visual surfaces change.                                                                             | explicit a11y scope rationale                        | `N/A`                   |
| Performance (CWV + payloads)                  | `target`     | Current perf trend recommendation is recorded with a clear `tighten` / `hold` / `revert` decision; no thresholds change without a dedicated perf slice.        | `npm run test:perf:trend` + docs update              | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because no local/server data ownership, sync, retention, or conflict behavior changes.                                                                     | explicit data-boundary scope rationale               | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, artifact cache, CDN policy, or invalidation trigger changes.                                                                  | explicit cache scope rationale                       | `N/A`                   |
| Reliability and failure handling              | `target`     | Maintenance docs identify recurring E2E warnings and local gate resource guidance so future gates are diagnosable and repeatable.                              | testing/maintenance docs + docs-only verify          | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: audit checks open PR/security posture and does not change protected paths or authz behavior.                                                  | PR queue + `npm audit --omit=dev --audit-level=high` | `4/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no analytics, consent, retention, policy, processor, or sensitive-data behavior changes.                                                           | explicit privacy scope rationale                     | `N/A`                   |
| Content governance                            | `target`     | The audit itself is traceable through a named brief with findings, decisions, and closeout evidence.                                                           | task brief + PR body                                 | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because admin workflow states, editability, audit trails, and recovery paths are untouched.                                                                | explicit admin workflow scope rationale              | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no route metadata, sitemap, robots, canonical, or public crawl surface changes.                                                                    | explicit SEO scope rationale                         | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured data, route copy, or AI-discoverable content model changes.                                                 | explicit AI discovery scope rationale                | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: perf trend and maintenance decisions remain observable through existing artifacts and docs.                                                   | trend output + maintenance docs                      | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: audit confirms no commerce code changes and keeps Stripe invoice follow-up separate from routine maintenance unless billing contracts change. | maintenance-cadence review                           | `4/5`                   |
| Incident response and support operations      | `supporting` | Supporting only: recurring gate warnings and resource guidance are documented for operator triage, but no incident response workflow changes are introduced.   | runbook/checklist updates                            | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no invoices, payouts, refunds, reconciliation, finance exports, or reporting data contracts change.                                                | explicit finance scope rationale                     | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale routing, translation content, language metadata, or future i18n storage model changes.                                                   | explicit i18n scope rationale                        | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Architecture/runtime docs reflect current major stack and dependency-maintenance carry-forward decisions without adding new packages.                          | `package.json` review + docs update                  | `5/5`                   |
| Testing and QA automation                     | `target`     | Docs-only gates pass, and testing docs record the Playwright heap default and recurring-warning triage policy.                                                 | `verify:pre-pr` + `verify:pre-merge`                 | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: audit keeps resource guidance explicit and avoids changing runtime cost or adding services.                                                   | docs-only diff review                                | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | All changes are docs-only, revertable as one PR, and the next maintenance-baseline steps are explicit.                                                         | PR diff + rollback note                              | `5/5`                   |

## Data Placement And Sync Contract

- N/A because this audit changes no stateful product data, local storage, sync behavior, database schema, retention policy, or cache ownership.
- Existing server-canonical and local-only boundaries remain unchanged.

## Identity And Rename Contract

- N/A because this audit introduces no persisted entity, route param, slug, public identifier, or operator-visible domain ID.
- The only named artifact is this task brief, which follows existing date-based brief naming.

## Scope

- Create this audit brief.
- Review open PR/dependency queue state.
- Run or review perf trend and security audit posture.
- Update `docs/architecture.md` to reflect current major stack/runtime facts.
- Update `docs/testing-strategy.md` with the Playwright managed devserver heap default and recurring hydration-warning triage policy.
- Update maintenance/perf docs with the current `hold` decision after the `2026-04-26` JS transfer budget tighten.
- Keep changes docs-only.

## Out Of Scope

- Changing runtime code, package versions, lockfiles, Playwright config, CI workflows, branch protection, or performance thresholds.
- Fixing workout-builder hydration warnings in this slice.
- Running a fresh full perf-budget gate unless the audit finds a deterministic need; this slice only records the trend decision.
- Merging without explicit owner approval.

## Acceptance Criteria

1. Current stack/runtime docs mention Next 16, React 19, TypeScript 6, Tailwind 4, Node 20, npm 10.8.2, and the Tailwind 4 PostCSS integration.
2. Testing docs mention Playwright's managed Next devserver 8192 MB heap default and the `PW_NEXT_DEV_MAX_OLD_SPACE_SIZE_MB` override.
3. Perf trend output and the audit decision are recorded: recommendation `tighten`, decision `hold` until two new weekly green cycles after the `2026-04-26` ratchet.
4. Recurring workout-builder hydration warnings are documented as a carry-forward diagnostic with a threshold for promoting to a separate hardening brief.
5. Open PR queue and high/critical production audit posture are recorded.
6. `npm run verify:pre-pr` passes on the docs-only lane.
7. Required GitHub checks pass.
8. `npm run verify:pre-merge` passes before merge recommendation.

## Validation Plan

- `npm run test:perf:trend`
- `gh pr list --state open --limit 50`
- `npm audit --omit=dev --audit-level=high`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Validation Evidence

- `npm run test:perf:trend`: PASS, output on `2026-04-29` reported latest public PASS at `1a45926f1c3b`, `weekly-green-runs=3`, worst margin `25.2%`, recommendation `tighten`.
- Audit decision: `hold`. Rationale: the latest ratchet already tightened JS transfer default from `450kb` to `425kb` on `2026-04-26`, and the maintenance policy says not to take another stretch-target step until at least two weekly green cycles accumulate after that threshold change.
- `gh pr list --state open --limit 50`: no open PRs returned.
- `npm audit --omit=dev --audit-level=high`: high/critical gate passed; npm reported only moderate transitive PostCSS findings under Next's dependency tree and suggested a forced breaking downgrade path, so no dependency change is taken in this docs-only audit.
- `npm run verify:pre-pr`: PASS on the docs-only lane before commit; artifact `artifacts/test-runs/20260429-075458/verify.log`.

## Help/Guide And Operator Training Impact

- Help/Guide content: `N/A` because no user/admin workflow labels, actions, or recovery UX changed.
- Operator training impact is handled in maintenance/testing docs, not Help/Guide.

## Rollback Plan

- Revert the docs-only PR to restore the prior maintenance, testing, architecture, and brief state.
- No runtime rollback, data repair, dependency downgrade, secret rotation, or customer communication is required.

## Checkpoint Log

- `2026-04-29 | in-progress | started post-dependency-wave maintenance baseline audit from clean main after Tailwind closeout; perf trend still recommends tighten, open PR queue is empty, and high/critical audit gate has no high/critical findings | next: update stack/runtime/testing/perf maintenance docs, run docs-only gates, and open PR`
- `2026-04-29 | in-progress | updated architecture, testing, maintenance cadence, pagespeed governance, monthly checklist, and testing scorecard docs with the post-dependency audit findings; docs-only verify:pre-pr passed before commit | next: commit, rerun verify:pre-pr on the final head, push, open PR, monitor CI, then run verify:pre-merge before merge recommendation`
- `2026-04-29 | done | PR #545 merged as 56a46bf after docs-only verify:pre-pr, green GitHub checks, and docs-only verify:pre-merge; maintenance baseline now records stack/runtime alignment, Playwright heap guidance, perf-budget hold decision after the 2026-04-26 ratchet, empty PR queue, and hydration-warning carry-forward policy | next: use the normal monthly maintenance cadence for future dependency/perf checks`
