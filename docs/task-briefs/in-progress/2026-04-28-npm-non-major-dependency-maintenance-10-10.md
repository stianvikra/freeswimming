# Task Brief: npm Non-Major Dependency Maintenance (10/10)

## Metadata

- `id`: `2026-04-28-npm-non-major-dependency-maintenance-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-28`
- `updated`: `2026-04-28`

## Goal

Evaluate and ship Dependabot PR `#539` only if the grouped npm non-major updates remain compatible with the current Next.js 16, React 19, Supabase auth/runtime, Playwright, Vitest, jsdom, lint, formatting, and build gates.

## Why This Brief Exists

- The remaining dependency queue after Stripe v22 is `#539` grouped npm non-major, `#367` TypeScript 6, and `#366` Tailwind 4.
- TypeScript 6 and Tailwind 4 are larger major toolchain migrations, so the next best candidate is the non-major group, but it must not be merged blindly.
- PR `#539` touches only `package.json` and `package-lock.json`, but it is broad:
  - runtime/auth packages: `@supabase/ssr`, transitive `@supabase/supabase-js`, React, React DOM,
  - browser/export package: `html-to-image`,
  - test/browser tooling: Playwright, axe, Vitest coverage, jsdom,
  - CSS/build/format tooling: autoprefixer, ESLint patch, lint-staged, Prettier, Prettier Tailwind plugin,
  - lockfile transitives including Vite 8 / Rolldown, Supabase subpackages, PostCSS, ws, and browser data packages.
- This slice is non-UI from a source-code perspective, but dependency changes can affect auth, rendering, image export, tests, and build output, so it requires the full lane.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Security and authz`
- `Privacy and compliance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                            | Evidence                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Continue dependency maintenance without changing route hierarchy, IA, entry points, or user jobs.                                         | package diff + route diff review        | `5/5`                   |
| UX flow clarity                               | `supporting` | Supporting only: auth/session, checkout, library, export, and builder flows must keep existing observable behavior.                       | targeted + full E2E gates               | `4/5`                   |
| Visual design quality                         | `N/A`        | N/A because this slice changes no authored UI, layout, brand, print template, screenshot, or visual asset.                                | explicit visual scope rationale         | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Supabase auth/runtime, React rendering, purchase/session state, export helpers, and unit/component tests remain deterministic.            | typecheck + unit + E2E + build          | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor workflow, label, CRUD path, publishing flow, or operator action changes.                                      | explicit admin editor scope rationale   | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: Playwright/axe updates must not break existing accessibility checks or browser smoke coverage.                           | E2E smoke + full verify                 | `4/5`                   |
| Performance (CWV + payloads)                  | `target`     | Build and perf budget gates remain green after React, Vite/Vitest, PostCSS/autoprefixer, and browser-data package changes.                | production build + perf budgets         | `5/5`                   |
| Data placement and sync boundaries            | `target`     | No server-canonical auth, entitlement, progress, content, or local-first sync boundary changes are introduced.                            | runtime diff review + auth/data tests   | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: Supabase SSR cache-header behavior and Next build output must not require app cache/revalidation changes.                | diff review + build/E2E                 | `4/5`                   |
| Reliability and failure handling              | `target`     | Install, lint, typecheck, unit, build, perf, E2E, CI, and pre-merge remain stable without skips or suppressions.                          | local gates + GitHub checks             | `5/5`                   |
| Security and authz                            | `target`     | Supabase auth/session behavior, private gate, protected APIs, and security-sensitive negative paths remain fail-closed.                   | auth/site-lock/private-gate coverage    | `5/5`                   |
| Privacy and compliance                        | `target`     | No new processor, tracked payload, consent boundary, or policy text change; Supabase remains the existing processor with unchanged scope. | policy-impact review + package diff     | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: dependency decision and grouped-risk rationale are documented in brief and PR body.                                      | brief + generated PR handoff            | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD, status workflow, editability surface, or audit workflow changes.                                               | explicit admin workflow scope rationale | `N/A`                   |
| SEO and crawlability                          | `supporting` | Supporting only: Next/React/build dependency updates must not break existing sitemap/metadata E2E assertions.                             | sitemap/private metadata E2E            | `4/5`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured data, or AI-discoverable route content changes.                                        | explicit AI discovery scope rationale   | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics payloads change; checkout/session tests must keep existing event-shape assumptions intact.                  | unit/full verify                        | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: React/Supabase updates must not regress checkout, entitlement, or billing portal entry paths.                            | commerce unit coverage + E2E gates      | `4/5`                   |
| Incident response and support operations      | `target`     | Verification artifacts and CI logs remain sufficient for rollback/root-cause if the grouped update regresses.                             | gate artifacts + PR checks              | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice does not change reconciliation logic, invoices, payouts, refunds, exports, or finance data contracts.              | explicit finance scope rationale        | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale routing, translation content, metadata, or future i18n data model changes.                                          | explicit i18n scope rationale           | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | All grouped updates remain compatible with repo Node 20/npm 10, Next 16, React 19, Tailwind 3, TypeScript 5, and current test tooling.    | install + package metadata + full gates | `5/5`                   |
| Testing and QA automation                     | `target`     | Local targeted tests, `verify:pre-pr`, `verify:pre-merge`, and required GitHub checks pass on the rebased branch.                         | local logs + CI checks                  | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: dependency churn must not add app runtime cost or CI cost beyond the current full-lane validation.                       | lockfile review + perf/build gates      | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback is a single PR revert of the grouped dependency update and this brief; no migration, secret rotation, or config change required. | PR diff + rollback note                 | `5/5`                   |

## Data Placement And Sync Contract

- No database schema, RLS, entitlement, progress, content, finance, or analytics persistence changes.
- Supabase remains server/client canonical exactly where existing helpers use it today.
- No local storage, cache ownership, conflict handling, or invalidation behavior is intentionally changed.
- If Supabase SSR/client behavior changes surface through tests, the PR must be fixed or held rather than accepted as a silent behavior change.

## Identity And Rename Contract

- `N/A` for app entities because no persisted product, route, slug, content, customer, entitlement, or operator-visible identifier is introduced or renamed.
- Package identity is limited to existing dependency names and semver ranges in `package.json` / `package-lock.json`.

## Scope

- Rebase/sync PR `#539` onto current `main`.
- Keep the grouped Dependabot non-major package update if it validates cleanly.
- Add this task brief and required PR governance evidence.
- Validate runtime/auth, React rendering, test environment, browser E2E, build, and formatting/lint tooling compatibility.

## Out Of Scope

- Merging without explicit owner approval.
- TypeScript 6 (`#367`), Tailwind 4 (`#366`), or any additional major/toolchain migration outside PR `#539`.
- Auth redesign, Supabase schema changes, checkout behavior changes, image export UX changes, UI/layout changes, policy text changes, Help/Guide changes, workflow changes, scripts, or CI workflow edits.
- Suppressing, weakening, or skipping tests to make the grouped update pass.
- Running `npm audit fix` or broad unreviewed dependency repair inside this slice.

## Compatibility Review

- PR `#539` was `BEHIND`; it rebased onto current `main` without conflicts.
- Direct manifest changes:
  - `@supabase/ssr` `^0.8.0` -> `^0.10.2`
  - `html-to-image` `^1.11.11` -> `^1.11.13`
  - `react` / `react-dom` `19.2.3` -> `19.2.5`
  - `@axe-core/playwright` `^4.11.1` -> `^4.11.2`
  - `@playwright/test` `^1.58.2` -> `^1.59.1`
  - `@vitest/coverage-v8` `^4.0.18` -> `^4.1.5`
  - `autoprefixer` `^10.4.24` -> `^10.5.0`
  - `jsdom` `^29.0.2` -> `^29.1.0`
  - `lint-staged` `^16.2.7` -> `^16.4.0`
  - `prettier` `^3.8.1` -> `^3.8.3`
  - `prettier-plugin-tailwindcss` `^0.7.2` -> `^0.8.0`
- Lockfile-resolved changes also include `@supabase/supabase-js` and subpackages `2.95.3` -> `2.105.0`, `vitest` `4.0.18` -> `4.1.5`, `vite` `7.3.1` -> `8.0.10`, and related transitive packages.
- `npm install` must be run under repo Node `20.20.2` / npm `10.8.2` with no lockfile churn after rebase.
- Because Vite 8 appears transitively through the test toolchain, full local/CI gates are required before merge recommendation.

## Acceptance Criteria

1. PR `#539` is rebased/synced onto current `main`.
2. Diff remains limited to `package.json`, `package-lock.json`, and this task brief.
3. `npm install` under repo Node/npm succeeds without lockfile churn.
4. Production audit impact is documented; known Next/PostCSS advisory remains a carry-forward if unchanged by this slice.
5. Runtime/auth and protected-route behavior remain compatible with Supabase/React updates.
6. Unit/component tests remain compatible with React, jsdom, Vitest, and Prettier/lint changes.
7. E2E and site-lock/private-gate coverage remain green with Playwright 1.59.
8. Build and perf-budget gates remain green with updated CSS/build/browser-data packages.
9. Local `npm run verify:pre-pr` passes.
10. Local `npm run verify:pre-merge` passes before merge recommendation.
11. Required GitHub checks pass before merge recommendation.

## Validation Plan

- `npm install` under Node `20.20.2` / npm `10.8.2`
- `npm ls @supabase/ssr @supabase/supabase-js react react-dom @playwright/test vitest @vitest/coverage-v8 jsdom prettier prettier-plugin-tailwindcss --depth=0`
- `npm audit --omit=dev --json`
- `npm audit --json`
- Targeted auth/Supabase/private-gate/commerce/runtime unit tests after brief commit
- Targeted browser/export/component tests if full gate identifies risk
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

- PR queue review on `2026-04-28` found remaining open dependency PRs: `#539` grouped npm non-major, `#367` TypeScript 6, and `#366` Tailwind 4.
- PR `#539` selected before TypeScript 6/Tailwind 4 because it avoids the two largest explicit major toolchain migrations, but it is still treated as broad-risk due Supabase/React/test-tooling transitives.
- PR `#539` rebased onto current `main` without conflicts.
- First sandboxed `npm install` hung without output and left npm temp directories under `node_modules`; cleaned only hidden generated `node_modules/.*-*` temp directories, then reran install outside sandbox.
- `npm install` under Node `20.20.2` / npm `10.8.2`: PASS, no lockfile churn after cleanup.
- `npm ls @supabase/ssr @supabase/supabase-js react react-dom @playwright/test vitest @vitest/coverage-v8 jsdom prettier prettier-plugin-tailwindcss --depth=0`: PASS; resolved `@supabase/ssr@0.10.2`, `@supabase/supabase-js@2.105.0`, `react@19.2.5`, `react-dom@19.2.5`, `@playwright/test@1.59.1`, `vitest@4.1.5`, `@vitest/coverage-v8@4.1.5`, `jsdom@29.1.0`, `prettier@3.8.3`, and `prettier-plugin-tailwindcss@0.8.0`.
- `npm audit --omit=dev --json`: exit `1`; production advisories remain `next` / bundled `postcss` moderate only, unchanged carry-forward class from earlier dependency slices.
- `npm audit --json`: exit `1`; total audit shows 7 advisories (4 moderate, 3 high), mostly dev/tooling/transitive. Several are pre-existing from current dependency graph; this slice must not claim audit clean.
- Targeted runtime/tooling unit slice: `npx vitest run tests/unit/supabase-env.test.ts tests/unit/site-lock-config.test.ts tests/unit/site-lock-session.test.ts tests/unit/site-lock-password.test.ts tests/unit/site-lock-metadata-routes.test.ts tests/unit/dev-auth-bypass.test.ts tests/unit/checkout-session-payload.test.ts tests/unit/portal-route.test.ts tests/unit/portal-utils.test.ts tests/unit/checkout-button.test.tsx tests/unit/portal-button.test.tsx tests/unit/poolside-image-export-client.test.ts tests/unit/workout-builder-hub.test.tsx tests/unit/poolside-preview-page-client.test.tsx` PASS, 14 files / 101 tests.
- `npm run lint:briefs:all`: PASS for all 206 changed brief files.
- `npm run lint`: PASS.
- `npm run typecheck`: PASS.
- First `npm run verify:pre-pr` attempt wrote `artifacts/test-runs/20260428-110740/verify.log` and failed at `test:perf:budgets` because Playwright 1.59 browser binaries were not installed in the local cache after the dependency update.
- `npx playwright install`: PASS; installed the Playwright 1.59 browser set required by the updated `@playwright/test`.
- Second `npm run verify:pre-pr` attempt wrote `artifacts/test-runs/20260428-113407/verify.log`; lint, typecheck, unit, build, and perf budgets passed, but full E2E failed with 7 timeouts/navigation aborts across My Library workout/program/training flows and the soft-launch banner smoke.
- Targeted rerun of the exact failing E2E line set across desktop Chromium/WebKit/Firefox: PASS, 10 passed / 8 skipped. The failing desktop Chromium My Library cases passed in isolation.
- Final `npm run verify:pre-pr`: PASS, full lane, `artifacts/test-runs/20260428-121757/verify.log`, 112 E2E passed / 344 skipped after lint, typecheck, unit, build, and perf budgets passed.
- Perf budget trend recorded PASS at `30b22ec463a2` with worst margin `26.5%` and recommended tightening one stretch target after 3 consecutive weekly green runs. Decision for this slice: carry forward to maintenance/perf baseline; do not change perf thresholds inside the grouped dependency PR.
- React hydration mismatch warnings still appear in existing workout-builder / poolside E2E output, but the final full gate passed. Treat as carry-forward diagnostics, not a blocker for this dependency-only slice.

## Manual QA / Screenshot Handoff

- `N/A` before merge recommendation because this slice changes no authored UI, layout, print, brand, or screenshot surface.
- If validation reveals a visible regression in app runtime or image export behavior, screenshot handoff becomes required before merge recommendation.

## Help/Guide And Operator Training Impact

- `N/A` because this slice does not change admin/user workflow labels, actions, recovery behavior, Help/Guide content, or runbook steps.

## Checkpoint Log

- `2026-04-28 | in-progress | selected PR #539 as next dependency-maintenance candidate after Stripe v22 closeout; found branch BEHIND and rebased onto main without conflicts; install under Node 20.20.2/npm 10.8.2 is clean after clearing npm temp directories from an interrupted sandboxed install | next: commit brief, run targeted checks and full verify:pre-pr, push rebased PR branch, monitor CI, then run verify:pre-merge before merge recommendation`
- `2026-04-28 | in-progress | targeted Supabase/site-lock/commerce/image-export/React component unit slice passed, all brief lint passed, ESLint passed, and typecheck passed on the rebased grouped update | next: commit evidence, run full verify:pre-pr, push the rebased PR branch, refresh PR body, monitor CI, and run verify:pre-merge before merge recommendation`
- `2026-04-28 | in-progress | initial full gate exposed missing Playwright 1.59 browser cache and one transient full-suite E2E failure cluster; installed browsers, reran the exact failing E2E subset green, then reran full verify:pre-pr green with artifact 20260428-121757 | next: commit evidence, force-push rebased PR branch with lease, update PR handoff, monitor CI, then run verify:pre-merge before merge recommendation`
