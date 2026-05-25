# Task Brief: AW-006 Course Progress Sync Status Clarity (10/10)

## Metadata

- `id`: `2026-05-24-aw-006-course-progress-sync-status-clarity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-24`
- `updated`: `2026-05-24`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `preceded_by`: `docs/task-briefs/done/2026-05-24-aw-006-habits-feedback-semantics-10-10.md`
- `branch`: `aw-006-course-progress-sync-status-clarity`

## Brief Audit Record

- `last_audited`: `2026-05-24`
- `base`: `main@b08f726`
- `audit_status`: `ready`
- `decision`: Execute the next AW-006 UX/UI slice as a narrow `/course` progress-sync status clarity pass.
- `reason`: PR `#836` and repo-managed closeout PR `#837` are merged, `main` is clean at `b08f726`, `npm run post-merge:preflight` was reported green, and the owner approved `AW-006 Course Progress Sync Status Clarity` after a short queue/design/code re-audit found no active AW-006 implementation slice.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/course`, course progress sync, course content API, course lesson identity, guide sync reference surfaces, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Make signed-in `/course` progress sync status visible, accessible, and recoverable without changing course progress data ownership, API contracts, lesson identity, or sync behavior.

## Pre-Implementation Owner Explanation

Dette slicen gjør det tydeligere for en innlogget bruker om kursprogresjonen er lagret, synker, eller trenger et nytt forsøk. Det betyr mindre usikkerhet når brukeren markerer leksjoner eller ser video, fordi lagringsstatus ikke bare ligger gjemt i detaljvisningen. Utenfor scope er ny sync-logikk, API-endringer, Supabase, auth, localStorage-nøkler, kursinnhold, videoavspiller, leksjonsidentitet, analytics, Help/Guide og bred visuell redesign.

Fremoverkompatibilitet: statusvisningen skal følge eksisterende `courseSyncStatus`, kanoniske leksjonsdata og dagens progress-row-kontrakt automatisk når nye leksjoner legges til. Nye sync-statuser eller nye datakilder krever eksplisitt mapping, og ukjente verdier skal falle tilbake til trygg, ikke-blokkerende copy uten å endre lagring.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Reliability and failure handling`
- `Security and authz`
- `Accessibility (a11y)`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                        | Evidence                                                      | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/course` must expose signed-in progress-sync status near the progress context without changing route purpose, lesson navigation, or course IA.                                           | queue/design inventory diff + screenshots                     | `5/5`                   |
| UX flow clarity                               | `target`     | Users must distinguish synced, syncing, and recoverable error states in one scan, and retry must be visible only when useful.                                                             | targeted tests + screenshot handoff                           | `5/5`                   |
| Visual design quality                         | `target`     | Status treatment must fit the existing course/player visual language, avoid crowding mobile/desktop first viewport, and avoid broad redesign.                                             | before/after screenshots                                      | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Existing progress row normalization, dirty lesson tracking, hydrate/merge behavior, local progress writes, and POST payload shape must remain unchanged.                                  | targeted tests + code review                                  | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes no admin editor, content editing, notes, QR, publishing, moderation, or operator CRUD workflow.                                                            | explicit admin-editor scope rationale                         | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Dynamic sync status must use appropriate polite status semantics, retry remains keyboard reachable, and progress bar semantics remain valid.                                              | component/e2e assertions + screenshot/manual review           | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: the slice must add no dependency, route fetch, media, or measurable `/course` payload risk beyond a small route-local UI helper if needed.                               | package diff + build/perf budget gate                         | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Course progress remains local-first on device and server-canonical through `/api/progress/course`; no new storage key, entity, retention model, or conflict policy is added.              | data contract review + unchanged storage/API assertions       | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Existing course progress requests keep current `cache: "no-store"` behavior; no route cache, revalidation, or invalidation rule changes.                                                  | code review + targeted unchanged-request assertions           | `5/5`                   |
| Reliability and failure handling              | `target`     | Sync/hydrate failure must give a deterministic retry path without dead-end guidance or unexpected 500/user-visible crash.                                                                 | targeted failure/retry tests                                  | `5/5`                   |
| Security and authz                            | `target`     | Auth state and `/api/progress/course` authorization remain fail-closed; status copy must not imply auth, entitlement, or admin access changes.                                            | unchanged route/auth review + existing negative-path coverage | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: progress status copy must not expose raw server diagnostics, user email, tokens, cookies, or sensitive details.                                                          | copy review + no-secret/log review                            | `4/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this active brief, and notice/state inventory must identify this slice and its reference surfaces accurately.                                                     | docs diff + brief lint                                        | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin/user workflow label, Help/Guide action, operator recovery path, content status, or admin editability surface changes.                                                | explicit workflow scope rationale                             | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes a client-side course status treatment only and no public metadata, sitemap, robots, canonical URL, or structured data.                                           | explicit SEO scope rationale                                  | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract.                                                  | explicit AI-discoverability scope rationale                   | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice changes no event taxonomy, analytics payload, tracking trigger, dashboard, or KPI definition.                                                                      | analytics scope rationale                                     | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this touches free course progress status only and changes no Stripe identifier, price, checkout, entitlement, billing portal, invoice, refund, payout, or revenue data.       | explicit commerce/revenue scope rationale                     | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support recovery workflow, operator diagnostics, runbook procedure, or escalation behavior.                                                     | explicit support-ops scope rationale                          | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                                  | explicit finance scope rationale                              | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because new/changed status copy must remain short and locale-extensible, but this slice introduces no locale routing, translation workflow, or grammar-dependent layout model. | copy review + responsive screenshots                          | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing `/course` state, Next/React/Tailwind patterns, Press primitives, and guide-sync reference semantics; add no dependency or app-wide notice primitive.                       | component diff + package diff                                 | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused coverage for status rendering, retry visibility, and unchanged progress sync behavior; run screenshot handoff before broad gates.                                             | targeted Vitest/Playwright + screenshots + verify gates       | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because a small route-local UI helper reduces future state drift without adding infrastructure, recurring jobs, provider calls, or storage cost.                               | diff review                                                   | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | PR must be reversible through normal git revert; no migrations, config, package, workflow, deployment setting, or external service setup changes.                                         | git diff review + validation gates                            | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: `components/guides/GuideSyncStatus.tsx` for status semantics and retry clarity.
  - Primary changed surface: `app/course/page.tsx`; add a small `components/course/` helper only if it keeps JSX and semantics clearer.
  - Keep `/course` as a client route; do not move server/client boundaries, route ownership, or course content loading.
  - Route/API boundary: `/api/progress/course` remains unchanged.
  - Cache/revalidation: keep existing `cache: "no-store"` progress fetch behavior.
- TypeScript/domain contracts:
  - Preserve `CourseProgressRow`, local progress record shapes, dirty lesson id tracking, canonical lesson id resolution, and merge/hydrate invariants.
  - Deterministic invariant: status UI reflects existing `courseSyncStatus`; retry calls the existing safe `syncCourseProgressNow({ force: true })` path only when signed in and recoverable.
- Supabase/data layer:
  - N/A; no schema, RLS/authz policy, generated DB type, storage, index, or query shape change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, analytics vendor, email provider, webhook, SDK, secret, retry policy, or observability integration change.
- UI system:
  - Reuse current course visual language and Press primitives.
  - Screenshot handoff type: `before/after` for `/course` signed-in desktop and mobile progress status.
  - Avoid app-wide Notice/EmptyState primitives.
- Testing:
  - Add focused tests around visible status semantics and retry behavior.
  - Preserve existing e2e course progress sync behavior.

## Data Placement And Sync Contract

- Server-canonical data:
  - Signed-in course progress continues to sync through `/api/progress/course` using existing `CourseProgressRow` payloads.
- Local data:
  - Existing local course progress and preview storage keys remain unchanged through `getCourseProgressStorageKeys`.
  - No new localStorage key, cookie, session value, or client persistence is introduced.
- Sync policy:
  - Keep current local-first writes, dirty lesson tracking, hydrate/merge from server, interval sync, visibility/pagehide flush, and retry path.
  - The UI may expose retry for recoverable sync errors but must not introduce a new queue, backoff, conflict policy, or optimistic mutation model.
- Retention and sensitivity:
  - No retention change. Course progress status copy must not include raw server errors, user identity, tokens, cookies, or diagnostics beyond safe user guidance.
- Cache/invalidation:
  - Existing progress requests keep `cache: "no-store"`; no route cache, revalidation, CDN, or stale-data behavior changes.

## Identity And Rename Contract

- Canonical stable ID:
  - Course progress continues to use canonical lesson runtime IDs from the existing course identity helpers.
- Human-readable identifiers:
  - Lesson titles/module labels remain display-only and are not used as sync truth.
- Mutability rules:
  - No new identifier is introduced. Existing lesson alias/canonicalization behavior remains unchanged.
- Rename vs repurpose policy:
  - N/A for this slice; materially changing course lessons or identity policy is out of scope.
- Compatibility contract:
  - Existing legacy lesson ID read-through/canonicalization remains the compatibility path.
- Observability and repair:
  - Existing progress route diagnostics remain unchanged; this slice adds no new repair path.

## Forward Compatibility Contract

- Extensibility surfaces:
  - `/course` lesson set, course progress status values, route-local status copy, and signed-in/guest/preview states.
- Source of truth:
  - Future lessons must flow from existing `courseLessonsFlat`, `activeLesson`, and canonical lesson identity helpers; no status UI should hardcode today's lesson IDs or module count.
- Additive behavior:
  - Adding new lessons should automatically show the same sync status because the UI depends on progress state, not a fixed lesson list.
- Explicit mapping requirements:
  - New sync states beyond `idle`, `syncing`, `synced`, and `error` require an explicit status-copy/style mapping plus tests before release.
  - New storage/API sources for course progress require a separate data-boundary brief.
- Unknown or deprecated values:
  - Unknown status values must fall back to a neutral, non-blocking copy instead of claiming saved/error state.
  - Unsafe or unauthenticated progress API behavior remains fail-closed through the existing route contract.
- Test/evidence:
  - Targeted tests must prove unchanged progress payload behavior and status fallback/mapping for the active status set, plus a route/label/support sweep for course progress wording.

## Help / Guide Impact

N/A with rationale: this slice changes `/course` status presentation only. It does not change user/admin workflow labels, support recovery behavior, Help/Guide assertions, auth, payments, entitlements, operator actions, or runbook procedures.

## Route / Label / Support Surface Sweep

Required because this slice changes user-facing status/retry treatment on `/course`.

- Identifiers searched before broad gates:
  - `courseSyncStatus`
  - `Course progress`
  - `Sync paused`
  - `Syncing lesson progress`
  - `Retry now`
  - `progress_synced`
  - `COURSE_PROGRESS_SYNC_API_PATH`
  - `fs_course`
  - `GuideSyncStatus`
  - `Retry sync`
- Surfaces checked before broad gates:
  - `app/course/`
  - `components/course/`
  - `components/guides/GuideSyncStatus.tsx`
  - `tests/unit/`
  - `tests/e2e/course-progress-sync.spec.ts`
  - `tests/e2e/course-desktop-player-polish.spec.ts`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/task-briefs/done/`
- Expected fallout:
  - this active brief,
  - canonical AW-006 queue update,
  - notice/state inventory update,
  - route-local `/course` UI and focused tests during implementation,
  - no Help/Guide/runbook update unless implementation changes workflow labels or recovery behavior beyond scoped status copy.

## Scope

- Create this active child brief.
- Update the canonical AW-006 queue and notice/state inventory to mark this as the selected active slice.
- Improve signed-in `/course` progress sync status clarity only.
- Reuse current course progress state and retry path.
- Add a route-local helper under `components/course/` only if it keeps semantics and tests simpler.
- Add focused tests for visible status semantics, retry visibility, and unchanged sync behavior.
- Capture screenshot handoff artifacts before `npm run verify:pre-pr` because rendered `/course` UI changes.

## Out Of Scope

- Course progress API shape, Supabase schema/RLS/generated types/storage, auth provider behavior, localStorage key changes, course lesson identity/canonicalization, course content API, course content editing, video player behavior, YouTube integration, lesson data/copy, course drawer/navigation logic, preview content loading behavior, analytics taxonomy/payloads, commerce/entitlement behavior, guide trackers, broad app-wide notice primitive, public visual redesign, Help/Guide/runbook updates, package installs, CI workflow changes, or merge to `main`.

## Acceptance Criteria

1. Canonical AW-006 queue records Habits Feedback Semantics as shipped and this brief as the active approved slice.
2. Notice/state inventory records course progress sync status as the selected route-local candidate with guide sync as the mature reference.
3. Signed-in `/course` shows a clear progress sync status without requiring the user to expand overview details.
4. Syncing/synced/error states are visually and semantically distinct, with retry shown only for recoverable signed-in errors.
5. Retry uses the existing `syncCourseProgressNow({ force: true })` path and does not change API payloads, storage keys, or merge behavior.
6. Guest and preview states do not imply server sync or account backup.
7. Accessibility semantics are explicit and progress bar semantics remain valid.
8. Screenshot handoff includes representative before/after desktop and mobile `/course` surfaces before broad PR gates.
9. `npm run lint:briefs`, targeted tests, route/label/support sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `npm run lint:briefs`
  - targeted unit/component tests for any new course sync status helper
  - `npx playwright test tests/e2e/course-progress-sync.spec.ts --project=desktop-chromium`
  - targeted route/label/support sweep
  - `npm run lint`
  - `npm run typecheck`
  - `git diff --check`
- Visual gate:
  - Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
  - Capture `/course` before/after or after/reference screenshots for signed-in desktop and mobile status states.
  - Stop for owner screenshot approval before `npm run verify:pre-pr`, PR creation, and `npm run verify:pre-merge`.
- Broad gates:
  - `npm run verify:pre-pr`
  - PR required CI checks
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands and local dev server/Playwright commands should use escalation-first strategy per repo instructions.

## Checkpoint Log

- `2026-05-24 | in-progress | started from clean main@b08f726 after PR #836 and repo-managed closeout PR #837; post-merge preflight was reported green with no pending closeout; owner approved Course Progress Sync Status Clarity after queue/design/code re-audit | next: wait for explicit implementation instruction, then update route-local course sync status, add targeted tests, and capture screenshot handoff before broad gates`
- `2026-05-24 | screenshot-review | added route-local CourseProgressSyncStatus, surfaced signed-in sync status below the course progress bar, preserved existing syncCourseProgressNow({ force: true }) retry path, updated focused unit/e2e coverage, refreshed AW-006 queue/inventory docs, and captured before/after screenshots in output/aw-006-course-sync-status-2026-05-24-215707 at 2026-05-24 22:04; validation passed: npm run lint:briefs:all, ./node_modules/.bin/vitest run tests/unit/course-progress-sync-status.test.tsx, npm run lint, npm run typecheck, targeted route/label/support sweep, git diff --check, and npx playwright test tests/e2e/course-progress-sync.spec.ts --project=desktop-chromium with the deterministic signed-in status test passing and the legacy real-dev-auth API sync test skipped because local example Supabase cannot sign in through /dev/login | next: wait for owner screenshot approval before npm run verify:pre-pr, PR creation, and npm run verify:pre-merge`
- `2026-05-24 | pre-pr | owner approved the screenshot handoff; npm run verify:pre-pr passed full public lane after adding explicit route/label/support sweep evidence wording; perf budget passed with hold recommendation because worst margin was 14.3% against the 15.0% tighten threshold, so no budget tightening is taken in this slice | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
- `2026-05-24 | commit | committed scoped implementation with subject Improve course progress sync status clarity | next: push branch, open PR, monitor CI, then run npm run verify:pre-merge`
- `2026-05-25 | merged | PR #838 merged as squash commit 4fdb185; post-merge preflight found this repo-managed docs-only closeout, moved the brief to done, and updated stale queue/inventory active references | next: validate closeout docs-only PR`

## Completion Record

- `completed`: `2026-05-25`
- `merged_pr`: `#838`
- `squash_commit`: `4fdb185`
- `result`: Closed AW-006 Course Progress Sync Status Clarity by adding visible signed-in `/course` sync status and retry clarity while preserving existing progress sync behavior.
- `validation`: `npm run lint:briefs:all`; `./node_modules/.bin/vitest run tests/unit/course-progress-sync-status.test.tsx`; `npx playwright test tests/e2e/course-progress-sync.spec.ts --project=desktop-chromium`; `npm run lint`; `npm run typecheck`; targeted route/label/support sweep; `git diff --check`; screenshot handoff approved; `npm run verify:pre-pr`; required CI; `npm run verify:pre-merge`.
- `10/10 claim`: yes - all critical target categories reached `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                                                    | Gaps / Notes |
| --------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | PR `#838`, screenshots, and queue/inventory closeout prove the status is near `/course` progress without changing route IA. | None.        |
| UX flow clarity                               | `5/5`          | Status states and retry visibility covered by unit/e2e tests and screenshot handoff.                                        | None.        |
| Visual design quality                         | `5/5`          | Before/after desktop and mobile screenshots approved.                                                                       | None.        |
| Business logic correctness and data integrity | `5/5`          | Existing progress sync path and payload shape preserved; targeted tests and full gates passed.                              | None.        |
| Accessibility (a11y)                          | `5/5`          | Polite status semantics and keyboard-reachable retry covered by focused tests.                                              | None.        |
| Data placement and sync boundaries            | `5/5`          | No storage key, API, schema, or conflict-policy changes; code review and gates passed.                                      | None.        |
| Caching and invalidation strategy             | `5/5`          | Existing no-store course progress request behavior retained.                                                                | None.        |
| Reliability and failure handling              | `5/5`          | Error state exposes deterministic retry through the existing forced sync path.                                              | None.        |
| Security and authz                            | `5/5`          | Auth/API boundaries unchanged; existing negative-path coverage stayed green.                                                | None.        |
| Content governance                            | `5/5`          | Brief, queue, and inventory updated with closeout state.                                                                    | None.        |
| Stack-fit and dependency discipline           | `5/5`          | Route-local React/Tailwind component added with no new dependency.                                                          | None.        |
| Testing and QA automation                     | `5/5`          | Targeted unit/e2e tests, broad local gates, and CI passed.                                                                  | None.        |
| DevOps and rollback readiness                 | `5/5`          | No migrations/config/package/workflow changes; normal git revert is sufficient rollback.                                    | None.        |
