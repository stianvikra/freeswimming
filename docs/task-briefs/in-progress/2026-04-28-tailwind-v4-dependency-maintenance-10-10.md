# Task Brief: Tailwind v4 Dependency Maintenance (10/10)

## Metadata

- `id`: `2026-04-28-tailwind-v4-dependency-maintenance-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-28`
- `updated`: `2026-04-28`

## Goal

Evaluate and ship Dependabot PR `#366` (`tailwindcss` `3.4.17` -> `4.2.4`) only if the Next.js 16 CSS pipeline, private gate, sitemap, smoke tests, visual baseline, and deployment checks are stable without weakening release gates.

## Why This Brief Exists

- The controlled dependency-maintenance queue has already shipped the narrow GitHub Actions, dev/test, SDK, grouped npm, TypeScript, and closeout slices.
- PR `#366` is the remaining large dependency candidate.
- Tailwind 4 is a major CSS/build-toolchain migration, not a simple lockfile bump.
- The Dependabot-only PR previously failed `e2e-smoke`, `site-lock-smoke`, and Vercel, including `/sitemap.xml` `500`, private access gate, mobile nav, soft-launch banner, and missing header/auth/brand element failures.
- This slice must prove stack compatibility, browser route behavior, and visual output before merge recommendation.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Reliability and failure handling`
- `Security and authz`
- `SEO and crawlability`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                | Evidence                                     | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Dependency maintenance continues one isolated PR and does not change route hierarchy, page purpose, IA, or primary user jobs.                 | PR queue review + source diff review         | `5/5`                   |
| UX flow clarity                               | `target`     | Mobile nav, soft-launch banner, private gate unlock, and core smoke flows remain usable and pass their existing Playwright assertions.        | targeted smoke/site-lock tests + screenshots | `5/5`                   |
| Visual design quality                         | `target`     | Tailwind 4 output preserves the existing visual language for representative public, locked, and navigation surfaces across mobile/desktop.    | screenshot handoff + owner approval          | `5/5`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: no checkout, entitlement, progress, content, or persistence semantics change; existing logic must compile and test green.    | full verify + diff review                    | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice does not change admin editor workflows, labels, CRUD, publishing, or operator content actions.                         | explicit admin editor scope rationale        | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: no rendered semantics are intentionally changed; changed CSS output must not break tested navigation/focus behavior.         | Playwright smoke + visual review             | `4/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: CSS build changes must not fail existing perf budget gates or materially bloat runtime output.                               | build + perf budget gate                     | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because no server-canonical data, local storage, sync, conflict, retention, or invalidation boundary changes.                             | explicit data-boundary scope rationale       | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no cache mode, revalidation tag, CDN policy, route handler cache contract, or artifact cache behavior is changed.                 | explicit cache scope rationale               | `N/A`                   |
| Reliability and failure handling              | `target`     | Production build, sitemap route, smoke tests, site-lock tests, Vercel preview, local pre-PR, and pre-merge gates pass without skips.          | local gates + CI checks                      | `5/5`                   |
| Security and authz                            | `target`     | Private site-lock behavior remains fail-closed and tested in locked mode; no protected-route bypass or unexpected `500` on deny paths.        | `test:e2e:site-lock` + full verify           | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no new tracking, processor, logging payload, consent behavior, or sensitive data exposure is introduced.                     | package/source diff review                   | `4/5`                   |
| Content governance                            | `supporting` | Supporting only: dependency rationale, known failure modes, validation evidence, and rollback notes are documented in this brief and PR body. | brief + PR handoff                           | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD, status workflow, editability surface, audit flow, or support action changes.                                       | explicit admin workflow scope rationale      | `N/A`                   |
| SEO and crawlability                          | `target`     | `/sitemap.xml`, metadata, and public crawl smoke behavior must stay green after Tailwind 4 CSS pipeline changes.                              | sitemap E2E + full verify                    | `5/5`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured data, route copy, or AI-discoverable content model changes.                                | explicit AI discovery scope rationale        | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: analytics/KPI contracts remain unchanged and compile through the full verification lane.                                     | typecheck + full verify                      | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: checkout, billing portal, entitlements, and invoice code remain unchanged and covered by existing compile/test gates.        | full verify + package diff review            | `4/5`                   |
| Incident response and support operations      | `supporting` | Supporting only: CI/local logs and rollback notes remain the diagnostic path; no support workflow changes are introduced.                     | gate artifacts + rollback note               | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice does not affect invoices, payouts, refunds, reconciliation, finance exports, or reporting data contracts.              | explicit finance scope rationale             | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale routing, translations, metadata language alternates, or future i18n data model changes.                                 | explicit i18n scope rationale                | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Tailwind 4 uses the current supported PostCSS integration for Next.js 16, avoids stale Tailwind 3 plugin config, and keeps deps minimal.      | install/build/package diff                   | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted build/smoke/site-lock checks, screenshot handoff, `verify:pre-pr`, `verify:pre-merge`, and required GitHub checks pass.              | local logs + CI checks                       | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: Tailwind 4 does not add runtime services, migrations, server cost, or unnecessary runtime packages.                          | package-lock diff + build/perf gates         | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback is a single PR revert of Tailwind/PostCSS package and config changes; no DB migration, secret rotation, or feature flag required.    | PR diff + rollback note                      | `5/5`                   |

## Data Placement And Sync Contract

- No database schema, RLS, entitlement, progress, content, finance, analytics, or local storage ownership changes.
- No server-canonical vs local-only boundary changes.
- No sync, conflict, retention, retry, cache invalidation, or offline behavior changes.
- If Tailwind 4 exposes a route/runtime failure, fix the narrow build/CSS integration issue or hold the PR rather than changing product data behavior.

## Identity And Rename Contract

- `N/A` for app entities because no persisted product, route, slug, content, customer, entitlement, or operator-visible identifier is introduced or renamed.
- Package identity is limited to the existing `tailwindcss` dev dependency and required Tailwind 4 PostCSS integration package.

## Scope

- Rebase/sync PR `#366` onto current `main`.
- Keep the Tailwind major bump only if it validates cleanly.
- Update Tailwind 4 PostCSS/CSS integration required by Next.js 16.
- Remove stale direct Tailwind 3 PostCSS wiring.
- Stabilize the Playwright-only Next devserver memory ceiling if full E2E proves Tailwind 4 triggers Next's proactive dev restart threshold.
- Add this task brief and required PR governance evidence.
- Validate production build, smoke, private gate, sitemap, visual baseline, full pre-PR/pre-merge gates, and CI.

## Out Of Scope

- Merging without explicit owner approval.
- Broad redesign, visual refresh, route changes, copy changes, Help/Guide changes, admin workflow changes, DB migrations, runtime secrets, or unrelated dependency upgrades.
- Suppressing, weakening, or skipping smoke/site-lock/build/test gates to make Tailwind 4 pass.
- Tailwind-driven class canonicalization refactors unless required by deterministic build/test failures.

## Compatibility Review

- PR `#366` updates `tailwindcss` from `3.4.17` to `4.2.4`.
- Initial Dependabot-only branch changed only `package.json` and `package-lock.json`.
- First local build after rebase failed because Tailwind 4 no longer supports using `tailwindcss` directly as the PostCSS plugin.
- Tailwind 4 requires the separate `@tailwindcss/postcss` integration package when using PostCSS with Next.js.
- Existing `app/globals.css` used Tailwind v3 `@tailwind base/components/utilities` directives and must be migrated to the v4 CSS import while preserving the existing JS config through `@config`.
- Existing direct `autoprefixer` PostCSS wiring is stale for this Tailwind 4 integration and should be removed unless a later build/test gate proves it is still required.

## Acceptance Criteria

1. PR `#366` is rebased/synced onto current `main`.
2. Tailwind 4 installs under repo Node 20/npm 10 without lockfile churn after the final install.
3. `postcss.config.js` uses the Tailwind 4 PostCSS package instead of `tailwindcss` directly.
4. `app/globals.css` uses the Tailwind 4 CSS import while preserving the existing config contract.
5. `npm run build` passes locally.
6. Targeted smoke coverage for sitemap, soft-launch banner, mobile nav, course nav context, and contact API security passes locally.
7. Locked private-gate smoke coverage passes locally.
8. Screenshot handoff is provided for representative changed surfaces before `verify:pre-pr`.
9. Owner approves screenshots or requested corrections are applied before PR update.
10. Local `npm run verify:pre-pr` passes.
11. Required GitHub checks pass.
12. Local `npm run verify:pre-merge` passes before merge recommendation.

## Validation Plan

- `npm install`
- `npm ls tailwindcss @tailwindcss/postcss --depth=0`
- `npm run lint:briefs:all`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run test:e2e:smoke`
- `npm run test:e2e:site-lock`
- screenshot handoff for representative public/locked/navigation surfaces
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

- Open PR queue review on `2026-04-28` found `#366` Tailwind 4 as the remaining dependency candidate.
- PR `#366` was selected only after narrower dependency slices were completed and closed out.
- PR `#366` was rebased onto current `main` without conflicts.
- Initial PR check review showed failing `e2e-smoke`, `site-lock-smoke`, and Vercel on the Dependabot-only branch.
- First local `npm run build` after rebase: FAIL. Build error confirmed Tailwind 4 no longer allows `tailwindcss` directly as the PostCSS plugin and requires `@tailwindcss/postcss`.
- Tailwind 4 integration patch:
  - added `@tailwindcss/postcss`,
  - removed stale direct `tailwindcss` and `autoprefixer` PostCSS plugin wiring,
  - migrated `app/globals.css` from v3 `@tailwind base/components/utilities` directives to v4 `@import "tailwindcss"`,
  - preserved existing config with `@config "../tailwind.config.js"`.
- First screenshot pass after the PostCSS fix exposed a visual regression: Tailwind utilities were not generated, leaving the home surface in raw link/default HTML styling.
- Final CSS source fix added explicit Tailwind 4 `@source "../app"` and `@source "../components"` directives so app/component utility classes are scanned.
- `npm ls tailwindcss @tailwindcss/postcss --depth=0`: PASS; resolved `tailwindcss@4.2.4` and `@tailwindcss/postcss@4.2.4`.
- `npm run lint:briefs:all`: PASS for all 208 task brief files.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS after PostCSS/source migration; `/sitemap.xml` is generated in the production route manifest.
- `npm run test:e2e:smoke`: PASS after final source fix, `10 passed / 4 skipped`.
- Initial `npm run test:e2e:site-lock`: SKIPPED because the shell lacked `PW_SITE_LOCK_PASSWORD` or `PW_SITE_LOCK_BYPASS_TOKEN`.
- Retried `npm run test:e2e:site-lock` with local `.env.local` auto-wiring to `PW_SITE_LOCK_BYPASS_TOKEN`: PASS after final source fix, `6 passed`.
- Screenshot handoff created at `output/playwright/tailwind-v4-handoff-2026-04-28/` with true `before-*` screenshots from `origin/main` Tailwind 3 and `after-*` screenshots from the Tailwind 4 branch.
- Owner approved screenshot handoff on `2026-04-28`.
- First full `npm run verify:pre-pr`: FAIL after Next devserver logged `Server is approaching the used memory threshold, restarting...`; failures were network/context closures in `my-library-workout-builder` and `sitemap`, not Tailwind visual/assertion mismatches. Artifact: `artifacts/test-runs/20260428-200228/verify.log`.
- Targeted rerun of the failed desktop tests: PASS, `2 passed`, confirming the immediate failures were devserver restart fallout rather than deterministic route regressions.
- Second full `npm run verify:pre-pr`: FAIL after the same Next devserver memory-threshold restart, this time surfacing in `my-library-program-export`, while the previously failed tests passed. Artifact: `artifacts/test-runs/20260428-203905/verify.log`.
- Targeted heavy desktop rerun after the first stabilization patch: PASS for `my-library-program-export`, `my-library-workout-builder:345`, and `sitemap`, `3 passed`.
- Third full `npm run verify:pre-pr`: FAIL after `NODE_OPTIONS="--max-old-space-size=4096"` delayed but did not prevent the same Next devserver memory-threshold restart; the failure moved later to `my-library-workout-builder:226`.
- Final E2E gate stabilization patch: Playwright's managed Next devserver now sets `NODE_OPTIONS="--max-old-space-size=8192"` by default, with `PW_NEXT_DEV_MAX_OLD_SPACE_SIZE_MB` override, so full local E2E can validate Tailwind 4 without Next's proactive dev restart creating false network failures.
- Targeted heavy desktop rerun after the final heap patch: PASS for `my-library-program-export`, `my-library-workout-builder:226`, `my-library-workout-builder:345`, and `sitemap`, `4 passed`.
- Final `npm run verify:pre-pr`: PASS. Full public lane passed lint, typecheck, unit, build, perf budgets, and E2E (`112 passed / 344 skipped`) with no Next devserver memory-threshold restart. Artifact: `artifacts/test-runs/20260428-212829/verify.log`.

## Manual QA / Screenshot Handoff

- Required because this slice changes the global Tailwind CSS build pipeline and may affect all visible UI.
- Handoff type: true before/after.
- Artifact folder: `output/playwright/tailwind-v4-handoff-2026-04-28/`.
- Required representative coverage:
  - public home/header surface on mobile and desktop,
  - private access gate on mobile and desktop,
  - mobile navigation state or route smoke surface,
  - any surface changed to fix deterministic visual regressions.
- Owner screenshot approval is required before `verify:pre-pr`, PR update, and `verify:pre-merge`.

## Help/Guide And Operator Training Impact

- `N/A` because this slice does not change admin/user workflow labels, actions, recovery behavior, Help/Guide content, or operator runbook steps.

## Rollback Plan

- Revert the Tailwind 4 PR to restore Tailwind 3 package versions, PostCSS plugin config, and v3 CSS entry directives.
- No database migration, data repair, feature flag, secret rotation, or customer communication is required for rollback.

## Checkpoint Log

- `2026-04-28 | in-progress | selected PR #366 as the remaining dependency-maintenance candidate; rebased it onto current main; confirmed initial local build failure is the Tailwind 4 PostCSS plugin migration requirement | next: finish Tailwind 4 integration patch, run targeted build/smoke/site-lock checks, capture screenshot handoff, then continue to pre-PR only after owner screenshot approval`
- `2026-04-28 | in-progress | added Tailwind 4 PostCSS integration and v4 CSS import; build passed, but screenshot QA found missing utility generation; added explicit @source app/components directives; final build, smoke, and site-lock targeted gates are green; screenshot handoff is ready | next: owner screenshot approval, then verify:pre-pr, commit, push, PR handoff, CI, and verify:pre-merge`
- `2026-04-28 | in-progress | owner approved screenshot handoff; two full pre-PR attempts showed non-deterministic failures only after Next devserver memory-threshold restarts; added a Playwright-only Next devserver heap ceiling override to keep the full E2E gate stable under Tailwind 4 | next: run targeted heavy E2E, then rerun verify:pre-pr`
- `2026-04-28 | in-progress | targeted heavy E2E passed after the first heap patch; full pre-PR still hit the same Next restart later in desktop my-library, so the Playwright-only heap ceiling was raised to 8192 MB | next: rerun targeted heavy E2E, then full verify:pre-pr`
- `2026-04-28 | in-progress | targeted heavy E2E passed with the final 8192 MB Playwright devserver heap ceiling | next: rerun full verify:pre-pr`
- `2026-04-28 | in-progress | final verify:pre-pr passed after the 8192 MB Playwright devserver heap ceiling; full E2E passed without Next memory-threshold restart | next: commit, push, update PR #366 handoff, monitor CI, then run verify:pre-merge`
