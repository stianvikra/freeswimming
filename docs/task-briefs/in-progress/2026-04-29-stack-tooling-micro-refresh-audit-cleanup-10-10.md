# Task Brief: Stack/Tooling Micro-Refresh And Audit Cleanup (10/10)

## Metadata

- `id`: `2026-04-29-stack-tooling-micro-refresh-audit-cleanup-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-29`
- `updated`: `2026-04-29`

## Goal

Ship the narrow post-Node-24 stack/tooling micro-refresh that keeps the app on supported stable package lines while preserving release gates, audit discipline, and deterministic maintenance cadence.

## Why This Brief Exists

- The April dependency wave and Node 24 migration left the major stack in a good state, but the post-merge audit found a few small safe candidates:
  - `@supabase/supabase-js` patch from the resolved `2.105.0` line to `2.105.1`,
  - `lucide-react` patch/minor from `1.11.0` to `1.14.0`,
  - transitive dev audit cleanup for `flatted`, `picomatch`, `yaml`, and `brace-expansion`,
  - an explicit decision on npm package-manager pinning and Vercel CLI workflow pinning.
- This should be handled as one narrow maintenance slice before returning to feature work, not mixed into session-builder implementation.
- This is non-UI source work. Screenshot handoff is `N/A` unless validation reveals a visible regression.

## Current Audit Decision

- `upgrade now`:
  - `@supabase/supabase-js` patch,
  - `lucide-react` patch/minor,
  - lockfile-level dev/transitive audit repairs that do not force downgrades or broaden package scope,
  - npm `packageManager` pin from `11.6.2` to `11.11.0`, because GitHub's Node 24.14.1 runner resolves npm `11.11.0` and rejected the older lockfile metadata during `npm ci`.
- `hold`:
  - `@types/node` latest `25.x`, because runtime is Node 24 and ambient Node types should match the runtime major.
  - ESLint 10, because `eslint-plugin-react@7.37.5` still advertises ESLint support only through `^9.7` and earlier local evaluation showed ESLint 10 breaks `npm run lint`.
  - Next/PostCSS moderate audit entry, because the current npm audit fix path proposes an unsafe downgrade to Next 9 rather than a valid Next 16 patch.
- `evaluate in this PR`:
  - Vercel CLI workflow pinning away from `vercel@latest`.

## Implementation Decisions

- Direct package refresh:
  - `@supabase/supabase-js` is updated to `^2.105.1`.
  - `lucide-react` is updated to `^1.14.0`.
- Transitive audit cleanup:
  - `brace-expansion` resolved to `1.1.14`,
  - `flatted` resolved to `3.4.2`,
  - `picomatch` resolved to `2.3.2` / `4.0.4` where required by existing dependents,
  - `yaml` resolved to `2.8.3`.
- Vercel CLI workflow decision: `upgrade now` from floating `vercel@latest` to pinned `vercel@52.0.0` because the registry audit found `52.0.0` as the stable latest and pinning removes unreviewed CI/runtime drift from preview and site-lock operations.
- npm package-manager decision: `upgrade now` to `npm@11.11.0` in `package.json` and regenerate `package-lock.json` with npm 11.11.0. Initial GitHub checks failed before tests because CI's Node 24.14.1 runner uses npm 11.11.0 and required `@emnapi/core@1.10.0` / `@emnapi/runtime@1.10.0` lockfile entries that npm 11.6.2 did not emit locally.
- Next/PostCSS audit decision: `watch`. The remaining moderate advisory is inside `next@16.2.4`'s vendored `postcss@8.4.31`; `npm audit fix --force` proposes `next@9.3.3`, so no unsafe force-fix is allowed in this slice.
- E2E stability decision: first full `verify:pre-pr` surfaced two existing timing-sensitive desktop Chromium tests after the dependency refresh. The fix is test-harness hardening only:
  - admin notes quick-capture cleanup now waits for the existing DELETE API response before asserting the note disappears,
  - AI generator intake prewarms `/my-library/generator` before link navigation and uses the same `240_000ms` timeout already used by the heavier generator acceptance test.
- Final commit pre-PR rerun exposed three additional long-run desktop Chromium flakes after 30+ minutes. The follow-up hardening remains test-harness only:
  - admin notes edit flow now waits for the existing PATCH response before asserting the updated note row,
  - admin notes/categories negative-path coverage gets the same wider timeout envelope used by other long admin API groups,
  - drawer focus-trap coverage gets a 60s test timeout so the final focus-restore poll is not cut off by the default 30s project timeout during long-run load.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Reliability and failure handling`
- `Security and authz`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                        | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `supporting` | Supporting only: dependency cleanup must not change product IA, navigation, entry points, or user jobs.                               | diff review + route untouched check         | `4/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: Supabase runtime and lucide icon updates must not change existing observable workflows.                              | full gates + smoke coverage                 | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this slice changes no authored UI, layout, brand, print template, screenshot, or visual asset.                            | explicit visual scope rationale             | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Supabase client patch and lockfile repairs do not change persisted data contracts, auth/session ownership, or business invariants.    | typecheck + unit + E2E + diff review        | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor workflow, label, CRUD path, publishing flow, or operator action changes.                                  | explicit admin editor scope rationale       | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: icon package update must not remove labels or semantics because no authored UI/icon usage is changed in this slice.  | source diff + full gates                    | `4/5`                   |
| Performance (CWV + payloads)                  | `target`     | Build and perf budget gates remain green after package and lockfile updates.                                                          | production build + perf budgets             | `5/5`                   |
| Data placement and sync boundaries            | `target`     | No server-canonical, local-only, sync, cache, entitlement, progress, finance, or analytics boundary changes are introduced.           | package diff + runtime tests                | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no Next cache policy, revalidation, CDN behavior, route freshness, or cache invalidation trigger changes.                 | explicit cache scope rationale              | `N/A`                   |
| Reliability and failure handling              | `target`     | Install, lint, typecheck, unit, build, perf, E2E, CI, and pre-merge remain stable without skips or suppressions.                      | local gates + GitHub checks                 | `5/5`                   |
| Security and authz                            | `target`     | Production high/critical audit threshold remains clean; dev/transitive high/moderate audit findings are repaired or explicitly held.  | `npm audit` evidence + auth/site-lock gates | `5/5`                   |
| Privacy and compliance                        | `target`     | No new processor, tracked payload, data retention, consent boundary, or public policy text change is introduced.                      | package diff + policy impact review         | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: dependency decisions are recorded in this brief and PR body instead of chat memory.                                  | brief + PR handoff                          | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD, status workflow, editability surface, or audit workflow changes.                                           | explicit admin workflow scope rationale     | `N/A`                   |
| SEO and crawlability                          | `supporting` | Supporting only: Next build and existing sitemap/private metadata assertions must remain green.                                       | build + E2E smoke                           | `4/5`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured data, or AI-discoverable route content changes.                                    | explicit AI discovery scope rationale       | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event, KPI payload, dashboard, or tracking contract changes.                                                 | explicit analytics scope rationale          | `N/A`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: Supabase/runtime cleanup must not regress checkout, entitlement, portal, or finance reconciliation entry paths.      | unit/full gates                             | `4/5`                   |
| Incident response and support operations      | `target`     | Audit and release-gate evidence remains sufficient for rollback/root-cause if a package refresh regresses.                            | gate artifacts + PR checks                  | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice does not change reconciliation, payouts, invoices, refunds, reports, exports, or finance data contracts.       | explicit finance scope rationale            | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale routing, translation content, metadata, or future i18n data model changes.                                      | explicit i18n scope rationale               | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Updated packages remain on stable supported lines compatible with Node 24, Next 16, React 19, Tailwind 4, TypeScript 6, and CI gates. | npm metadata + install + full gates         | `5/5`                   |
| Testing and QA automation                     | `target`     | Local targeted checks, `verify:pre-pr`, `verify:pre-merge`, and required GitHub checks pass on the PR head.                           | local logs + CI checks                      | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: package refresh must not add runtime services, heavy dependencies, or new CI jobs beyond current verification.       | lockfile review + perf/build gates          | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback is one PR revert; no migration, secret rotation, data repair, or production operation is required.                           | PR diff + rollback note                     | `5/5`                   |

## Data Placement And Sync Contract

- No database schema, RLS, entitlement, progress, content, finance, or analytics persistence changes.
- Supabase remains server/client canonical exactly where existing helpers use it today.
- No local storage, cache ownership, conflict handling, retry behavior, or invalidation behavior is intentionally changed.
- If Supabase runtime behavior changes surface through tests, the PR must be fixed or held rather than accepted as a silent behavior change.

## Identity And Rename Contract

- `N/A` for app entities because no persisted product, route, slug, content, customer, entitlement, or operator-visible identifier is introduced or renamed.
- Package identity is limited to existing dependency names and semver ranges in `package.json` / `package-lock.json`.

## Scope

- Update `@supabase/supabase-js` to the latest compatible stable `2.x` patch found by audit.
- Update `lucide-react` to the latest compatible stable `1.x` patch/minor found by audit.
- Refresh lockfile to repair fixable transitive dev audit findings without force-downgrade or unsupported major adoption.
- Evaluate and document npm package-manager pinning and Vercel CLI workflow pinning.
- Update this task brief and PR handoff evidence.

## Out Of Scope

- Merging without explicit owner approval.
- ESLint 10, `@types/node` 25, Next canary/beta, React canary/experimental, TypeScript next, Tailwind insiders, or any broad major migration.
- Auth redesign, Supabase schema changes, checkout behavior changes, image export UX changes, UI/layout changes, policy text changes, Help/Guide changes, or product workflow changes.
- Suppressing, weakening, or skipping tests to make the refresh pass.
- Running `npm audit fix --force`.

## Acceptance Criteria

1. Direct dependency diff is limited to the named package refreshes and any explicitly justified workflow/tooling pin.
2. Fixable transitive dev audit findings are removed without unsafe force fixes.
3. Production high/critical audit threshold remains clean.
4. Next/PostCSS audit advisory is either resolved by a safe Next patch or documented as `watch` if no valid Next 16 fix path exists.
5. npm and Vercel CLI pinning decisions are explicitly recorded.
6. Local `npm run verify:pre-pr` passes.
7. Local `npm run verify:pre-merge` passes before merge recommendation.
8. Required GitHub checks pass before merge recommendation.

## Validation Plan

- `npm install`
- `npm ls @supabase/supabase-js lucide-react @types/node eslint next react react-dom tailwindcss typescript @playwright/test vitest @vitest/coverage-v8 jsdom --depth=0`
- `npm audit --omit=dev --audit-level=high`
- `npm audit --audit-level=moderate`
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

- `npm ci` => pass.
- `npm ls @supabase/supabase-js lucide-react @types/node eslint next react react-dom tailwindcss typescript @playwright/test vitest @vitest/coverage-v8 jsdom --depth=0` => pass:
  - `@supabase/supabase-js@2.105.1`,
  - `lucide-react@1.14.0`,
  - `@types/node@24.12.2`,
  - `next@16.2.4`,
  - `react@19.2.5` / `react-dom@19.2.5`,
  - `tailwindcss@4.2.4`,
  - `typescript@6.0.3`,
  - `@playwright/test@1.59.1`,
  - `vitest@4.1.5`.
- `npm audit --omit=dev --audit-level=high` => pass, with the remaining Next/PostCSS advisory still moderate-only.
- `npm audit --audit-level=moderate --json` => expected non-zero because `next@16.2.4` vendors `postcss@8.4.31`; npm's only proposed fix is unsafe `next@9.3.3`, so this remains `watch`.
- `npm run lint:briefs:all` => pass for all 213 task brief files.
- `npm run typecheck` => pass after E2E harness hardening.
- `npm run test:e2e -- tests/e2e/admin-notes-workflow.spec.ts tests/e2e/my-library-generator-intake.spec.ts --project=desktop-chromium` => pass, `4 passed`, `1 expected skip`.
- `npm run test:e2e -- tests/e2e/admin-notes-workflow.spec.ts tests/e2e/api-security-negative-paths.spec.ts tests/e2e/drawer-focus-trap.spec.ts --project=desktop-chromium` => pass after final harness hardening, `9 passed`, `1 expected skip`.
- `npm run verify:pre-pr` => pass, full lane, artifact `artifacts/test-runs/20260429-214118/verify.log`, `112 passed`, `344 skipped`.
- Perf budget result during `verify:pre-pr` => pass. Trend still recommends `tighten`, but this PR records `hold/carry-forward` because the latest ratchet landed `2026-04-26`; the next tighten/hold/revert decision belongs in the next perf/maintenance cadence after two new weekly green cycles.
- Known non-blocking warnings observed during E2E:
  - existing workout-builder/poolside hydration warnings,
  - intermittent Next devserver `ECONNRESET aborted` noise after passed tests,
  - `NO_COLOR` ignored due `FORCE_COLOR`.

## Manual QA / Screenshot Handoff

- `N/A` before merge recommendation because this slice changes no authored UI, layout, print, brand, or screenshot surface.
- If validation reveals a visible regression in app runtime or icon rendering behavior, screenshot handoff becomes required before merge recommendation.

## Help/Guide And Operator Training Impact

- `N/A` because this slice does not change admin/user workflow labels, actions, recovery behavior, Help/Guide content, or runbook steps.

## Checkpoint Log

- `2026-04-29 | in-progress | started from clean main after PR #554 merged as be4800b; post-Node-24 audit selected a narrow micro-refresh for Supabase, lucide, fixable dev/transitive audit findings, and npm/Vercel CLI pinning decisions | next: implement package/lockfile/tooling changes, run targeted audits and full gates, then open PR`
- `2026-04-29 | in-progress | updated Supabase JS to 2.105.1, lucide-react to 1.14.0, repaired fixable transitive dev audit findings without audit-force, verified npm ci, pinned Vercel CLI workflows to 52.0.0, and held npm packageManager at 11.6.2 with rationale | next: run local gates, commit, push, open PR, monitor CI, and run verify:pre-merge`
- `2026-04-29 | in-progress | first full verify:pre-pr failed after E2E on two timing-sensitive desktop Chromium cases: admin notes quick-capture cleanup asserted before DELETE completion, and generator intake hit transient navigation timeout under long-run load; targeted hardening was added without changing product behavior | next: rerun targeted E2E and then full verify:pre-pr`
- `2026-04-29 | in-progress | targeted rerun passed: npm run test:e2e -- tests/e2e/admin-notes-workflow.spec.ts tests/e2e/my-library-generator-intake.spec.ts --project=desktop-chromium => 4 passed, 1 expected skip | next: rerun full verify:pre-pr`
- `2026-04-29 | in-progress | full verify:pre-pr passed after test-harness hardening: artifact artifacts/test-runs/20260429-203356/verify.log, 112 passed / 344 skipped; high/critical audit remains clean and moderate Next/PostCSS watch was documented | next: commit, push, open PR, monitor CI, then run verify:pre-merge before merge recommendation`
- `2026-04-29 | in-progress | final commit verify:pre-pr rerun later failed after 34.5m on three additional long-run flakes: admin notes edit row visibility, admin notes/categories negative-path timeout, and drawer focus restore global timeout; added response waits/timeouts and verified targeted rerun passed with 9 passed / 1 expected skip | next: amend commit and rerun full verify:pre-pr on the final commit`
- `2026-04-29 | in-progress | full verify:pre-pr rerun passed after final harness hardening: artifact artifacts/test-runs/20260429-214118/verify.log, 112 passed / 344 skipped; known hydration/NO_COLOR warnings remain documented carry-forward and no UI screenshot handoff is required for this non-visual tooling slice | next: push branch, open PR, monitor CI, then run verify:pre-merge before merge recommendation`
- `2026-04-29 | in-progress | initial GitHub deploy/e2e/site-lock checks failed at npm ci before tests because CI npm 11.11.0 rejected missing @emnapi/core/runtime 1.10.0 lockfile entries; updated packageManager to npm@11.11.0 and regenerated package-lock metadata with npm 11.11.0 | next: rerun npm ci, full verify:pre-pr, push, and re-monitor CI`
