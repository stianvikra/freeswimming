# Task Brief: TypeScript v6 Dependency Maintenance (10/10)

## Metadata

- `id`: `2026-04-28-typescript-v6-dependency-maintenance-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-28`
- `updated`: `2026-04-28`

## Goal

Evaluate and ship Dependabot PR `#367` (`typescript` `5.9.3` -> `6.0.3`) only if the current Next.js 16, React 19, Tailwind 3, Vitest, Playwright, and strict TypeScript contracts remain compatible without weakening compiler or test gates.

## Why This Brief Exists

- After the controlled CodeQL, GitHub Actions, dev/test, ESLint, Stripe, and npm non-major dependency slices, the remaining dependency queue is dominated by larger toolchain migrations.
- PR `#367` is a major compiler update, but it is narrower than Tailwind 4 because it touches only `typescript` plus the lockfile.
- PR `#366` Tailwind 4 currently shows real smoke/site-lock/Vercel regressions and visual/CSS build risk, so it needs a separate UI/build-risk workstream with screenshot handoff if it changes visible output.
- PR `#367` currently appears blocked by PR governance/body evidence rather than a known deterministic local compatibility failure.
- This slice is non-UI dependency maintenance; screenshot handoff is `N/A` unless TypeScript compatibility fixes require visible app/UI changes.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Product goals and IA`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                             | Evidence                              | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Continue dependency maintenance one controlled PR at a time without changing route hierarchy, IA, entry points, or user jobs.              | PR queue review + package diff review | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: existing user/admin flows must keep current observable behavior because no UI or route flow changes are in scope.         | full verify + CI smoke gates          | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this slice changes no authored UI, layout, brand, print template, screenshot, or visual asset.                                 | explicit visual scope rationale       | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Strict typecheck, build, unit, and E2E gates must pass without weakening domain invariants or introducing runtime compatibility shims.     | typecheck + unit/build/E2E gates      | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor workflow, label, CRUD path, publishing flow, or operator action changes.                                       | explicit admin editor scope rationale | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: browser smoke and accessibility-related tests must remain green, but no rendered semantics are intentionally changed.     | Playwright/verify gates               | `4/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: compiler-only update must not regress build or existing perf budget gates.                                                | build + perf budget gate              | `4/5`                   |
| Data placement and sync boundaries            | `target`     | No server-canonical auth, entitlement, progress, content, cache, or local-first sync boundary changes are introduced.                      | source diff review + full gates       | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no runtime cache, revalidation, CDN policy, route handler cache mode, or artifact cache strategy changes.                      | explicit cache scope rationale        | `N/A`                   |
| Reliability and failure handling              | `target`     | Install, lint, typecheck, build, unit, E2E, pre-PR, pre-merge, and required CI checks must pass without skips or suppressions.             | local gates + GitHub checks           | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: protected routes and negative-path tests must keep current fail-closed behavior; no authz logic changes are allowed.      | security-sensitive test coverage      | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no new processor, payload, logging, retention, consent, or policy behavior is introduced by a compiler-only update.       | package diff + policy impact review   | `4/5`                   |
| Content governance                            | `supporting` | Supporting only: the dependency decision, queue rationale, and validation evidence are documented in this brief and PR body.               | brief + PR handoff                    | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD, status workflow, editability surface, or audit workflow changes.                                                | explicit admin workflow rationale     | `N/A`                   |
| SEO and crawlability                          | `supporting` | Supporting only: sitemap, metadata, and crawlability smoke coverage must remain green after compiler update.                               | E2E/smoke/full verify                 | `4/5`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured data, or AI-discoverable route content changes.                                         | explicit AI discovery scope rationale | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: analytics event payload contracts must remain unchanged if covered tests compile and pass.                                | typecheck + analytics unit coverage   | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: checkout, entitlement, portal, and invoice code must compile and pass existing commerce coverage with TypeScript 6.       | commerce unit/full verify             | `4/5`                   |
| Incident response and support operations      | `supporting` | Supporting only: existing gate logs, CI artifacts, and rollback notes remain the diagnostic path; no support workflow changes.             | gate artifacts + rollback note        | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this compiler-only slice does not change invoices, payouts, refunds, reconciliation logic, exports, or finance data contracts. | explicit finance scope rationale      | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale routing, translation content, metadata, or future i18n data model changes.                                           | explicit i18n scope rationale         | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | TypeScript 6 must install cleanly under repo Node 20/npm 10 and work with Next 16, React 19, Tailwind 3, Vitest, Playwright, and ESLint.   | install + metadata + full gates       | `5/5`                   |
| Testing and QA automation                     | `target`     | Local targeted checks, `verify:pre-pr`, `verify:pre-merge`, and required GitHub checks pass on the rebased branch.                         | local logs + CI checks                | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: compiler update must not add runtime packages, migrations, or deploy/runtime cost.                                        | package-lock diff + build gate        | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback is a single PR revert of the TypeScript dependency bump and this brief; no migration, secret rotation, or config change required. | PR diff + rollback note               | `5/5`                   |

## Data Placement And Sync Contract

- No database schema, RLS, entitlement, progress, content, finance, analytics, or local storage ownership changes.
- No server-canonical vs local-only boundary changes.
- No cache invalidation, sync, conflict, or offline behavior changes.
- If TypeScript 6 exposes an actual data-boundary typing issue, the branch must fix the narrow type contract or hold the PR rather than silently changing behavior.

## Identity And Rename Contract

- `N/A` for app entities because no persisted product, route, slug, content, customer, entitlement, or operator-visible identifier is introduced or renamed.
- Package identity is limited to the existing `typescript` dev dependency version range in `package.json` / `package-lock.json`.

## Scope

- Rebase/sync PR `#367` onto current `main`.
- Keep the TypeScript major bump if it validates cleanly.
- Add this task brief and required PR governance evidence.
- Validate TypeScript compiler, lint, build, unit/component, E2E, and CI compatibility.

## Out Of Scope

- Merging without explicit owner approval.
- Tailwind 4 (`#366`), future TypeScript config redesign, Next.js upgrades, ESLint rule redesign, broad dependency updates, or package-manager changes.
- UI/layout/brand changes, screenshot changes, Help/Guide changes, workflow-label changes, migrations, runtime config changes, or security policy changes.
- Suppressing, weakening, or skipping compiler/test gates to make TypeScript 6 pass.

## Compatibility Review

- PR `#367` updates `typescript` from `5.9.3` to `6.0.3`.
- Direct manifest change is limited to `devDependencies.typescript` from `^5` to `^6`.
- The lockfile update is compiler/tooling-only; it does not intentionally add app runtime dependencies.
- The repo runtime remains Node `20.20.2` / npm `10.8.2`.
- TypeScript 6 is a major compiler update, so strict typecheck and production build are release-blocking gates for this slice.
- Tailwind 4 remains deferred because the queue review showed actual smoke/site-lock/Vercel regressions, which require a separate visual/build migration lane.

## Acceptance Criteria

1. PR `#367` is rebased/synced onto current `main`.
2. Diff remains limited to `package.json`, `package-lock.json`, and this task brief unless TypeScript 6 exposes a narrow required compatibility fix.
3. `npm install` under repo Node/npm succeeds without lockfile churn.
4. `npm ls typescript --depth=0` resolves the expected TypeScript 6 version.
5. `npm run lint:briefs:all` passes.
6. `npm run lint` passes.
7. `npm run typecheck` passes under TypeScript 6 without weakening strictness.
8. `npm run build` passes.
9. Local `npm run verify:pre-pr` passes.
10. Local `npm run verify:pre-merge` passes before merge recommendation.
11. Required GitHub checks pass before merge recommendation.

## Validation Plan

- `npm install` under Node `20.20.2` / npm `10.8.2`
- `npm ls typescript --depth=0`
- `npm run lint:briefs:all`
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run build`
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

- PR queue review on `2026-04-28` found remaining dependency PRs: `#367` TypeScript 6 and `#366` Tailwind 4.
- PR `#367` selected first because it is a narrower compiler-only dependency update, while PR `#366` Tailwind 4 showed real smoke/site-lock/Vercel regressions and visual/build migration risk.
- PR `#367` was rebased onto current `main` without conflicts.
- Initial PR `#367` CI failure reviewed as PR-body governance/evidence failure, not yet a deterministic local compiler compatibility failure.
- `npm install` under Node `20.20.2` / npm `10.8.2`: PASS, no lockfile churn after rebase.
- `npm ls typescript --depth=0`: PASS; resolved `typescript@6.0.3`.
- `npm run lint:briefs:all`: PASS for all 207 changed brief files.
- `npm run lint`: PASS.
- First `npm run typecheck`: FAIL only on TypeScript 6 diagnostic `TS2871` in `components/my-library/training/TrainingContextHub.tsx`, where the compiler flagged the existing `overviewGoal` nullish fallback chain as always nullish.
- Compatibility fix: replaced the chained `??` fallback expression with an explicit ordered goal-candidate list and existing `Map` lookup helper, preserving the same overview goal priority without weakening types.
- Retried `npm run typecheck`: PASS.
- `npx vitest run tests/unit/training-context-hub.test.tsx`: PASS, 1 file / 12 tests.
- Retried `npm run lint`: PASS.
- `npm run test:unit`: PASS, 163 files / 840 tests.
- `npm run build`: PASS under Next.js 16.2.4 / Turbopack with TypeScript 6.
- `npm run verify:pre-pr`: PASS, full lane, artifact `artifacts/test-runs/20260428-142405/verify.log`, E2E `113 passed / 343 skipped`.
- GitHub checks on PR `#367`: PASS for `verify`, `size-check`, `deploy-preview`, `e2e-smoke`, `site-lock-smoke`, `CodeQL`, `Analyze (javascript-typescript)`, Vercel, and Vercel Preview Comments.
- `npm run verify:pre-merge`: PASS on PR head `5ef4726`; reused public full-lane PASS artifact and recorded `artifacts/verify-pre-merge/20260428-131337.json`.
- PR `#367` merged on `2026-04-28` as `d3e43ef`.
- Docs-only lifecycle closeout moved this brief from `in-progress/` to `done/` after merge.

## Closeout Score Outcome

- `Product goals and IA`: `5/5` - dependency queue ordering stayed explicit; TypeScript 6 shipped before Tailwind 4 because it was the narrower compiler-only candidate.
- `Business logic correctness and data integrity`: `5/5` - TypeScript 6 surfaced one deterministic `TS2871` issue and the equivalent goal fallback priority was preserved with targeted unit, typecheck, build, and full E2E validation.
- `Data placement and sync boundaries`: `5/5` - no data ownership, cache, schema, local storage, sync, or identity boundary changed.
- `Reliability and failure handling`: `5/5` - local full lane, pre-merge gate, and all required GitHub checks passed before merge.
- `Stack-fit and dependency discipline`: `5/5` - TypeScript 6 installed under Node `20.20.2` / npm `10.8.2` with no runtime package growth.
- `Testing and QA automation`: `5/5` - targeted unit, full unit, build, `verify:pre-pr`, CI, and `verify:pre-merge` passed.
- `DevOps and rollback readiness`: `5/5` - rollback remains a single revert of PR `#367`; no migration, secret, config, or runtime rollout change.
- Remaining gaps: none for this TypeScript slice.
- Deferred/carry-forward: Tailwind 4 (`#366`) remains a separate UI/build-risk migration; perf stretch-target tightening remains carry-forward to the maintenance/perf baseline.

## Manual QA / Screenshot Handoff

- `N/A` before merge recommendation because this slice changes no authored UI, layout, print, brand, screenshot, or visual surface.
- If TypeScript 6 compatibility work introduces visible UI/source changes, screenshot handoff becomes required before PR update and merge recommendation.

## Help/Guide And Operator Training Impact

- `N/A` because this slice does not change admin/user workflow labels, actions, recovery behavior, Help/Guide content, or runbook steps.

## Checkpoint Log

- `2026-04-28 | in-progress | selected PR #367 as next dependency-maintenance candidate after queue review; deferred Tailwind 4 because it has real smoke/site-lock/Vercel regressions and likely needs a dedicated UI/build migration lane; rebased #367 onto current main without conflicts | next: run install, targeted compiler/build gates, full verify:pre-pr, push the rebased PR branch, refresh PR handoff, monitor CI, then run verify:pre-merge before merge recommendation`
- `2026-04-28 | in-progress | install resolved TypeScript 6.0.3 without lockfile churn; lint and brief lint passed; TypeScript 6 surfaced one TS2871 nullish-chain diagnostic in TrainingContextHub; applied a narrow equivalent fallback-list compatibility fix; typecheck, targeted training-context unit, full unit, and build are green | next: run full verify:pre-pr, push the rebased PR branch, refresh PR handoff, monitor CI, then run verify:pre-merge before merge recommendation`
- `2026-04-28 | done | PR #367 merged as d3e43ef after local verify:pre-pr PASS, GitHub checks PASS, and local verify:pre-merge PASS; docs-only lifecycle closeout moved this brief to done | next: merge this closeout PR, then reassess the remaining dependency queue before Tailwind 4`
