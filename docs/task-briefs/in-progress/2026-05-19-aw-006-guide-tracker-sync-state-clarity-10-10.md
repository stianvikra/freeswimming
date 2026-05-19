# Task Brief: AW-006 Guide Tracker Sync State Clarity (10/10)

## Metadata

- `id`: `2026-05-19-aw-006-guide-tracker-sync-state-clarity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-19`
- `updated`: `2026-05-19`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `preceded_by`: `docs/task-briefs/done/2026-05-19-aw-006-auth-feedback-source-of-truth-cleanup-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-guide-tracker-sync-state`

## Brief Audit Record

- `last_audited`: `2026-05-19`
- `base`: `main@79c0d9d`
- `audit_status`: `ready`
- `decision`: Execute the next AW-006 UX/UI slice as a narrow guide tracker sync-state clarity pass.
- `reason`: `main` is clean after PR `#774` and repo-managed closeout PR `#775`; `npm run post-merge:preflight` reports no pending closeout. The canonical AW-006 queue still pointed at the now-done auth feedback cleanup, and the notice/empty-state inventory names guide progress trackers as the next sibling state model with repeated loading/offline/error/retry/saved treatment.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, guide tracker routes, guide progress API contracts, local progress storage keys, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Make the two guide tracker sync/offline/error states clearer and more consistent without changing guide progress ownership, API contracts, or persisted data.

## Pre-Implementation Owner Explanation

Dette slicen gjør lagrings-, offline- og feilmeldingen i de to guide-trackerne likere og tydeligere, slik at brukeren forstår om progresjonen er lagret, venter på nett, eller må prøves på nytt. Det betyr mindre forvirring i treningsguidene og bedre kvalitet på en faktisk brukerflate. Utenfor scope er ny sync-logikk, API-endringer, auth, database, localStorage-nøkler, PWA/offline-shell, dryland/micro-sessions og bred visuell redesign.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Reliability and failure handling`
- `Accessibility (a11y)`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                               | Evidence                                                        | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The AW-006 queue must mark auth feedback as done and identify guide tracker sync-state clarity as the current bounded UX/UI slice.                                               | canonical queue diff + active brief                             | `5/5`                   |
| UX flow clarity                               | `target`     | 0-1000m and Poolside tracker status must distinguish saved, syncing, offline, and recoverable error states in one scan, with retry shown only when useful.                       | component/unit tests + screenshot handoff                       | `5/5`                   |
| Visual design quality                         | `target`     | The status treatment must fit the existing guide card language, avoid layout crowding on mobile/desktop, and avoid a broad redesign.                                             | screenshot handoff                                              | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Existing guide progress row normalization, merge behavior, dirty-row syncing, local storage keys, and API payload contracts must remain unchanged.                               | targeted sync tests + code review                               | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor surface, CRUD action, confirmation, recovery action, or operator workflow.                                                              | admin scope rationale                                           | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Dynamic guide sync status must use polite status semantics, retry remains keyboard reachable, and static guide cards must not gain noisy live regions.                           | component tests + screenshot/manual review                      | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: the slice must add no dependency, route fetch, image, or measurable app payload risk beyond a tiny shared client component.                                     | package diff + build/pre-pr gate                                | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Progress remains local-first on the device and server-canonical through `/api/progress/guide`; no new storage key, entity, retention policy, or conflict model is introduced.    | code review + targeted sync tests                               | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because guide progress requests keep the current `cache: "no-store"` behavior and no route cache, revalidation, or invalidation rule changes.                                | cache scope rationale                                           | `N/A`                   |
| Reliability and failure handling              | `target`     | Hydration failure, offline state, successful sync, and retry recovery must have deterministic UI states without dead-end guidance.                                               | targeted tests for offline/error/retry                          | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: protected guide routes, auth redirects, cookies, entitlements, and API authorization remain untouched.                                                          | unchanged route/API/auth diff review                            | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: guide notes/progress are not exposed outside the existing local/API flow, and status copy must not reveal raw server diagnostics beyond existing safe messages. | copy/diff review                                                | `4/5`                   |
| Content governance                            | `target`     | The canonical queue and notice/empty-state inventory must reflect auth cleanup as done and guide tracker sync-state clarity as the current active slice.                         | docs diff + brief lint                                          | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow label, editable content state, approval flow, or operator action.                                                                     | admin workflow scope rationale                                  | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because protected guide tracker UI changes no public metadata, sitemap, robots, canonical URL, or crawl-facing page content.                                                 | SEO scope rationale                                             | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                              | AI-discoverability scope rationale                              | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this changes no analytics event taxonomy, payload, logging, dashboard, or KPI definition.                                                                            | analytics scope rationale                                       | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this touches guide progress status only and changes no Stripe identifier, pricing, entitlement, checkout, invoice, refund, payout, or revenue data.                  | commerce scope rationale                                        | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support recovery workflow, operator diagnostic, runbook procedure, or support escalation behavior.                                     | support-ops scope rationale                                     | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                         | finance scope rationale                                         | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because guide status contains user-facing English copy, but this slice introduces no locale routing, translation workflow, or grammar-dependent layout model.         | copy review + screenshot review                                 | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse the two existing guide tracker components and add at most one guide-local status helper; add no dependency, route rewrite, or app-wide notice primitive.                   | component diff + package diff                                   | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused component coverage for guide offline/error/retry/success status and run targeted tests plus screenshot handoff before broad gates.                                   | targeted Vitest + Playwright/screenshot evidence + verify gates | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because a small guide-local helper reduces duplicated state UI in sibling trackers without adding infrastructure or recurring cost.                                   | helper reuse across two tracker surfaces                        | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, deployment setting, or external service setup changes are allowed.                | git diff review + validation gates                              | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: the sibling guide trackers `Guide0To1000Tracker` and `PoolsideGuideTracker`.
  - Keep both as client components; do not move guide routes, server components, API routes, auth redirects, or entitlement gates.
  - Route/API boundary: `/api/progress/guide`, guide PDF routes, and protected guide page redirects remain unchanged.
  - Cache/revalidation: keep existing `cache: "no-store"` progress fetches and no route cache changes.
- TypeScript/domain contracts:
  - Preserve `GuideProgressRow`, `normalizeGuideProgressRows`, section IDs, dirty-row set behavior, and local progress record shapes.
  - Deterministic invariant: status UI reflects the existing sync state; retry after a recoverable load error must not become a dead-end.
- Supabase/data layer:
  - N/A; no schema, RLS, authz policy, generated DB type, storage, or query change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, analytics vendor, email provider, webhook, secret, retry policy, or observability integration change.
- UI system:
  - Add at most one guide-local sync-status helper under `components/guides/`.
  - Use existing Tailwind language and current guide card density; do not promote an app-wide notice primitive.
  - Screenshot handoff comparison type: `after/reference`, comparing the changed 0-1000m and Poolside guide tracker states to each other and the AW-006 state-pattern direction.
- Testing:
  - Extend the existing guide tracker unit tests for offline, hydrate error, retry, success, status semantics, and unchanged merge behavior.
  - Run targeted tests, route/support sweep, screenshot handoff, then stop for owner approval before `npm run verify:pre-pr`.

## Data Placement And Sync Contract

- Server-canonical data:
  - Guide progress continues to sync through `/api/progress/guide` using existing `GuideProgressRow` payloads.
- Local data:
  - Existing localStorage keys remain the only local guide progress/support keys:
    - `fs_guide_0_1000m_progress_v1`
    - `fs_guide_0_1000m_last_session_v1`
    - `fs_guide_0_1000m_completed_weeks_visibility_v1`
    - `fs_guide_poolside_progress_v1`
    - `fs_guide_poolside_last_drill_v1`
    - `fs_guide_poolside_show_completed_overview_v1`
- Sync policy:
  - Keep current local-first progress updates, background interval sync, visibility/pagehide flush, online/offline event handling, and merge behavior.
  - Retry may re-attempt the existing safe progress load/sync path but must not introduce a new queue, backoff, or conflict policy.
- Retention and sensitivity:
  - No retention change. Existing progress notes remain user-entered guide data and must not be copied into logs or docs.
- Cache/invalidation:
  - Existing `cache: "no-store"` progress requests remain unchanged.

## Identity And Rename Contract

N/A with rationale: this slice creates no new persisted product entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, redirect, or migration behavior. Existing guide slugs and section IDs remain unchanged.

## Help / Guide Impact

N/A with rationale: this slice changes guide tracker status presentation only. It does not change admin/user workflow labels, support recovery behavior, Help/Guide assertions, auth, payments, entitlements, or operator-facing procedures.

## Route / Label / Support Surface Sweep

Required as a targeted guide-state sweep because this slice changes user-facing status and retry treatment.

- Identifiers searched before broad gates:
  - `Guide0To1000Tracker`
  - `PoolsideGuideTracker`
  - `GuideSyncStatus`
  - `Saving guide progress`
  - `Saving drill progress`
  - `Offline mode`
  - `Could not sync guide progress`
  - `Could not sync drill progress`
  - `Retry sync`
  - `fs_guide_0_1000m_progress_v1`
  - `fs_guide_poolside_progress_v1`
- Surfaces checked:
  - `components/guides/`
  - `tests/unit/guide-0-1000m-tracker-sync.test.tsx`
  - `tests/unit/guide-poolside-tracker-sync.test.tsx`
  - `app/guides/0-1000m/page.tsx`
  - `app/guides/poolside/page.tsx`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/task-briefs/done/`
- Expected fallout:
  - guide-local status helper,
  - two tracker call-site updates,
  - focused component tests,
  - active brief checkpoint updates,
  - canonical AW-006 queue and design inventory refresh,
  - no Help/Guide/runtime API update.

## Scope

- Create this active child brief.
- Update the canonical AW-006 queue after PR `#774/#775`.
- Update the notice/empty-state inventory to mark auth feedback as done and guide tracker sync-state clarity as active.
- Add a guide-local sync-status UI helper if it keeps the two sibling trackers consistent.
- Apply the helper to:
  - `components/guides/Guide0To1000Tracker.tsx`
  - `components/guides/PoolsideGuideTracker.tsx`
- Preserve existing guide progress storage and API payload contracts.
- Add focused tests for guide tracker sync status states.
- Capture screenshot handoff artifacts for changed guide UI before broad PR gates.

## Out Of Scope

- Guide route auth/entitlement logic, Supabase auth provider behavior, `/api/progress/guide` schema/API shape, guide progress row normalization, localStorage key changes, server migrations, RLS, analytics, Stripe, checkout, payments, PWA service worker/offline shell, dryland/micro-session state flows, Poolside PDF/export behavior, guide content changes, admin workflows, Help/Guide updates, package installs, CI workflow changes, or merge to `main`.
- Broad design-system primitive rollout or replacing public/member/admin notices outside the two guide trackers.

## Acceptance Criteria

1. The canonical AW-006 queue records Auth Feedback Source Of Truth Cleanup as shipped through `#774/#775`.
2. The canonical queue points to this guide tracker sync-state clarity slice as the current bounded AW-006 implementation slice.
3. 0-1000m and Poolside guide trackers render a consistent sync status surface for idle/syncing/synced/offline/error states.
4. Offline and recoverable error states keep local progress understandable and expose a keyboard-reachable `Retry sync` action.
5. Retry after a recoverable load error re-attempts the existing progress load path instead of presenting dead-end guidance.
6. Existing guide progress merge/upsert tests continue to pass with unchanged payload contracts and local storage keys.
7. Accessibility semantics are explicit: dynamic sync status uses polite status semantics, retry is a button, and static tracker content does not become an unnecessary live region.
8. Screenshot handoff includes representative changed guide surfaces before `npm run verify:pre-pr`.
9. `npm run lint:briefs`, targeted tests, route/label/support sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `npm run lint:briefs`
  - `npx vitest run tests/unit/guide-0-1000m-tracker-sync.test.tsx tests/unit/guide-poolside-tracker-sync.test.tsx`
  - targeted route/label/support sweep
  - `npm run lint`
  - `npm run typecheck`
  - `git diff --check`
- Visual gate:
  - Capture representative `after/reference` screenshot artifacts for `/guides/0-1000m` and `/guides/poolside` because guide UI files are touched.
  - Stop for owner screenshot approval before `npm run verify:pre-pr`, PR creation, and `npm run verify:pre-merge`.
  - If screenshot evidence contradicts the claimed fix or a guide UI/export symptom survives two attempts, switch to `docs/runbooks/ui-debug-hypothesis-and-handoff.md`, validate the actual consumed artifact, and log reusable findings in `docs/runbooks/high-cost-debug-log.md`.
- Broad gates:
  - `npm run verify:pre-pr`
  - PR required CI checks
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands and local dev server/Playwright commands should use escalation-first strategy per repo instructions.

## Checkpoint Log

- `2026-05-19 | in-progress | started from clean main@79c0d9d after PR #774 and repo-managed closeout PR #775; post-merge preflight found no pending closeout; owner approved the guide tracker sync-state clarity slice after a short AW-006 queue re-audit | next: update canonical queue/design inventory, implement guide-local sync status, add targeted tests, and capture screenshot handoff before pre-pr`
- `2026-05-19 | screenshot-review | updated the canonical AW-006 queue and notice/state inventory, added a guide-local GuideSyncStatus treatment, wired both guide trackers to the same saved/syncing/offline/error/retry UI, and made recoverable hydrate errors retry the existing progress load path; targeted guide Vitest, npm run lint, npm run typecheck, npm run lint:briefs:all, npm run lint:quality-gates, route/label/support sweep, and git diff --check passed; captured after/reference screenshot artifacts in output/aw-006-guide-sync-state-2026-05-19-223553 at 2026-05-19 22:35 using a local CSS harness because protected guide routes were blocked by the local Supabase egress guard, while unit tests cover the actual tracker behavior | next: wait for owner screenshot approval before npm run verify:pre-pr, PR creation, and npm run verify:pre-merge`
- `2026-05-19 | pre-pr-ready | owner approved the screenshot handoff; npm run verify:pre-pr passed the full lane with lint, quality gates, unit tests, build, performance budgets, and Playwright e2e green; perf budget trend recommendation was hold at 6/2 green runs because worst margin was 14.7% against the 15.0% tighten threshold | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge-readiness summary`
