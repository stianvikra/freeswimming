# Task Brief: Lucide React v1 Dependency Maintenance (10/10)

## Metadata

- `id`: `2026-04-27-lucide-react-v1-dependency-maintenance-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-27`
- `updated`: `2026-04-27`

## Goal

Bring the icon dependency `lucide-react` from `^0.563.0` to `^1.11.0` through PR `#362`, with a narrow dependency-maintenance scope, visual screenshot handoff, and green local/CI gates before any merge recommendation.

## Why This Brief Exists

- PR `#362` is the next narrow single-package candidate after the GitHub Actions and `jsdom` maintenance slices.
- PR `#365` (`@types/node` 20 -> 25) was reviewed first but is not the best next merge candidate because the repo runtime and CI policy still target Node `20`; Node 25 type definitions would widen the compile-time API surface beyond the supported runtime.
- `lucide-react` is a direct production dependency, but the repo imports it in only three component files: contact form icons and My Library workout action icons.
- Because this can affect rendered icons, this slice requires screenshot handoff before the full pre-PR gate and PR merge-readiness handoff.
- The previous PR `verify` failure was PR-body governance only: missing required PR sections and brief link.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `UX flow clarity`
- `Visual design quality`
- `Accessibility (a11y)`
- `Reliability and failure handling`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                               | Evidence                                          | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Continue dependency maintenance one low-risk PR at a time and explicitly defer Node-type/runtime mismatches.                                 | PR queue review + brief rationale                 | `5/5`                   |
| UX flow clarity                               | `target`     | Contact and workout action affordances remain recognizable and no icon-only control loses discoverability or expected action placement.      | screenshot handoff + targeted component checks    | `5/5`                   |
| Visual design quality                         | `target`     | Rendered Lucide icons keep stable sizing, stroke rhythm, alignment, and no visible layout shift on representative changed surfaces.          | before/after or after/reference screenshots       | `5/5`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because this slice changes no product business logic, persistence, schema, entitlement, export, or user data behavior.                   | explicit scope rationale                          | `N/A`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor workflow, label, CRUD path, or operator content action changes.                                                  | explicit scope rationale                          | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Icon upgrade preserves accessible names, button semantics, focus behavior, and non-text controls on contact/workout surfaces.                | targeted component tests + screenshot/a11y review | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: build/perf gates must not show a new app bundle or route-level budget regression from the icon package upgrade.             | build + perf budget lane                          | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because no product data storage, sync, cache ownership, conflict handling, or invalidation boundary changes.                             | explicit scope rationale                          | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no runtime reads, cache tags, revalidation, CDN policy, or artifact cache strategy changes.                                      | explicit scope rationale                          | `N/A`                   |
| Reliability and failure handling              | `target`     | Typecheck, build, targeted component coverage, screenshot QA, local full gate, and CI remain green after the icon package upgrade.           | local gates + GitHub checks                       | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: the dependency upgrade must not add runtime permissions, auth paths, tokens, or protected API behavior.                     | package diff + dependency classification          | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no new tracking, external processor, analytics payload, or user-data handling path is introduced.                           | package diff + runtime scope review               | `4/5`                   |
| Content governance                            | `supporting` | Supporting only: PR-body governance must be refreshed so required sections and this brief link are present before merge.                     | generated PR body + CI verify                     | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin CRUD, status workflow, publishing workflow, or editability surface changes.                                             | explicit scope rationale                          | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no public metadata, sitemap, robots, canonicals, or crawl behavior changes.                                                      | explicit scope rationale                          | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic content, structured data, or AI-discoverable surface changes.                                                 | explicit scope rationale                          | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no product analytics events, KPI payloads, dashboards, or tracking contracts change.                                             | explicit scope rationale                          | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, pricing, entitlement, invoice, refund, portal, or revenue workflow changes.                                         | explicit commerce scope rationale                 | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: existing verify/CI artifacts remain the diagnostic source; no support runbook or incident workflow changes.                 | gate artifacts                                    | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice does not affect reconciliation, payouts, invoices, refunds, reports, exports, or finance data.                        | explicit finance scope rationale                  | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because no locale routing, translation content, metadata, or future i18n data model changes.                                             | explicit i18n scope rationale                     | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Only `lucide-react` and lockfile metadata change, with no bundled TypeScript, Tailwind, Stripe, ESLint, grouped npm, or Node-type upgrade.   | package diff + open PR queue review               | `5/5`                   |
| Testing and QA automation                     | `target`     | Rebased branch passes targeted checks, screenshot approval, local `verify:pre-pr`, local `verify:pre-merge`, and required GitHub checks.     | local logs + screenshot handoff + GitHub checks   | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no new package family, CI job, duplicate icon bundle, or runtime cost path is introduced beyond the package version change. | package diff + build/perf observation             | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback is a one-commit revert from `^1.11.0` to `^0.563.0`; no migration, secret rotation, or rollout flag required.                       | PR diff + rollback note                           | `5/5`                   |

## Data Placement And Sync Contract

- `N/A` for product data because this slice does not create, move, persist, cache, sync, or delete application data.
- `lucide-react` remains a client/server render dependency for SVG icon components imported by existing React components.
- No server-canonical data, local storage schema, cache invalidation, or conflict behavior changes.

## Identity And Rename Contract

- `N/A` because no persisted app entities, route params, slugs, labels, or operator-visible product identifiers are introduced or renamed.
- Package identity is limited to the existing `lucide-react` dependency entry in `package.json` and `package-lock.json`.

## Scope

- Rebase PR `#362` onto current `main`.
- Update `lucide-react` from `^0.563.0` to `^1.11.0` in:
  - `package.json`,
  - `package-lock.json`.
- Add this in-progress task brief with scorecard mapping and validation evidence.
- Refresh PR body so required governance sections and brief links are present.
- Capture screenshot handoff for representative icon surfaces before full pre-PR gate.
- Run local release gates and monitor GitHub checks after visual approval.

## Out Of Scope

- Merging without explicit owner approval.
- Updating `@types/node`, TypeScript, ESLint, Tailwind, Stripe SDK, grouped npm dependencies, or any other runtime/development dependency.
- Changing icon choices, labels, layouts, visual design system rules, workflows, routes, UI copy, DB schema, secrets, policy text, Help/Guide, billing, analytics, or content.
- Suppressing or skipping tests to make the dependency update pass.

## Compatibility Review

- `lucide-react@1.11.0` peer dependency supports React `^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0`; repo uses React `19.2.3`.
- Current repo imports from `lucide-react` are limited to:
  - `components/ContactForm.tsx`,
  - `components/my-library/workouts/WorkoutEditor.tsx`,
  - `components/my-library/workouts/SavedWorkoutsPanel.tsx`.
- Dependabot release notes mention v1/RSC and ESM changes; validation must include typecheck, build, targeted rendering checks, and visual screenshot handoff.
- `@types/node` PR `#365` is intentionally deferred because Node 25 types do not match the repo Node 20 runtime policy.

## Acceptance Criteria

1. PR `#362` is no longer stale/behind current `main`.
2. The diff is limited to `package.json`, `package-lock.json`, and this governance brief.
3. `lucide-react` remains the only package dependency changed.
4. React peer compatibility is documented.
5. Targeted checks for contact/workout icon surfaces pass.
6. Screenshot handoff is captured and approved before full `verify:pre-pr`.
7. Local `npm run verify:pre-pr` passes on the updated branch.
8. Local `npm run verify:pre-merge` passes before merge recommendation.
9. GitHub checks for PR `#362`, including verify, smoke, site-lock, PR Size, CodeQL, and Vercel Preview, are green before merge recommendation.

## Validation Plan

- `npm run lint:briefs`
- `npm ls lucide-react --depth=0`
- Targeted component/unit coverage for contact/workout surfaces
- `npm run build`
- Screenshot handoff for representative icon surfaces
- `npm run verify:pre-pr` after visual approval
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

- Open PR queue review after Dependabot force-updates found PR `#365` (`@types/node` 20 -> 25) is type-only but not stack-fit for the repo's Node 20 runtime policy; PR `#362` is the next narrow single-package candidate.
- PR `#362` previous GitHub `verify` failure was PR-body governance only: missing required sections and brief link.
- Local install refreshed `node_modules` to `lucide-react@1.11.0` after branch checkout.
- `npm run lint:briefs:all` passed for all changed/all brief files.
- `npm ls lucide-react --depth=0` passed and reported `lucide-react@1.11.0`.
- Targeted unit/component coverage passed: `npx vitest run tests/unit/contact-form.test.tsx tests/unit/workout-builder-hub.test.tsx tests/unit/session-generator-panel.test.tsx` (`69` tests).
- `npm run typecheck` passed.
- `npm run build` passed.
- Screenshot handoff captured in `output/playwright/lucide-react-v1-handoff-2026-04-27`:
  - `before-contact-success-desktop.png`
  - `after-contact-success-desktop.png`
  - `before-goals-coaching-success-desktop.png`
  - `after-goals-coaching-success-desktop.png`
- Screenshot capture verified `2` `svg.lucide` elements on each before/after public success surface.
- My Library workout icons are covered by targeted component checks and build in this slice; local dev-login returned `403` in the screenshot browser context, so the visual handoff uses public lucide surfaces.
- Pending: owner screenshot approval, full local gates, PR body refresh, GitHub checks, and pre-merge gate.

## Manual QA / Screenshot Handoff

- Required because this slice can change rendered SVG icon components.
- Handoff includes before/after public contact and goals-coaching success surfaces before full `verify:pre-pr`.
- Known visual caveat: authenticated My Library workout icon surfaces were not screenshot-captured because local dev-login returned `403`; they remain covered by targeted component tests and `npm run build`.
- Owner approval is required before continuing to full pre-PR gate and PR update.

## Help/Guide And Operator Training Impact

- `N/A` because this slice does not change admin/user workflow labels, actions, recovery behavior, or Help/Guide content.

## Checkpoint Log

- `2026-04-27 | in-progress | selected PR #362 after reviewing the refreshed Dependabot queue; deferred #365 because Node 25 type definitions do not match the repo Node 20 runtime policy; rebased lucide branch onto main and refreshed local install to lucide-react 1.11.0 | next: run targeted checks, capture screenshot handoff, and wait for visual approval before full pre-pr gate`
- `2026-04-27 | in-progress | targeted checks, typecheck, build, and public before/after screenshot handoff completed; dev-login returned 403 for authenticated My Library screenshot capture, so workout icon coverage remains test/build-based in this slice | next: wait for visual approval before full pre-pr gate and PR update`
