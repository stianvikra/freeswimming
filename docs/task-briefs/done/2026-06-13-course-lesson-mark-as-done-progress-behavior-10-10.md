# Task Brief: Course Lesson Mark-as-done Progress Behavior (10/10)

## Metadata

- `id`: `2026-06-13-course-lesson-mark-as-done-progress-behavior-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-13`
- `updated`: `2026-06-13`
- `parent`: [Course Lesson Experience 10/10 Parent](/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-06-13-course-lesson-experience-10-10-parent.md)
- `related_done_briefs`:
  - [Lesson Experience V1 Pedagogical Layout And Fallback Data](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-06-13-course-lesson-experience-v1-pedagogical-layout-fallback-data-10-10.md)
  - [Course Lesson Experience Admin Editor](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-06-13-course-lesson-experience-admin-editor-10-10.md)
  - [Course Lesson Public Visual Quality And Clarity](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-06-13-course-lesson-public-visual-quality-and-clarity-10-10.md)

## Brief Audit Record

- `last_audited`: `2026-06-13`
- `base`: `main@63cdf5e0`
- `audit_status`: `ready`
- `decision`: Execute this as the next bounded Course Lesson Experience child after owner approval.
- `reason`: PR `#1118` and closeout PR `#1119` are merged, `main` is clean and synced, and the public visual-quality done brief explicitly deferred production note `49043378... / Lesson Page - Mark as done` to a stateful progress behavior child.
- `must_refresh_before_execution_if`: Refresh if `/course`, `app/course/page.tsx`, `app/api/progress/course/route.ts`, `lib/course/progress.ts`, `lib/course/progress-status.ts`, course progress e2e tests, install prompt behavior, auth/dev-login helpers, analytics event contracts, Help/Guide/user-flow docs, screenshot handoff rules, or verification lanes change before implementation starts.

## Goal

Make the course lesson `Mark as done` flow deterministic, understandable, sync-safe, and regression-tested across guest, preview, and signed-in progress states without changing the course content model, PRO, SEO, or analytics dashboards.

## Pre-Implementation Owner Explanation

Vi rydder hvordan en bruker markerer en kursleksjon som ferdig. Brukeren skal forstå hvorfor knappen er låst, hva som må sjekkes først, hva som skjer når leksjonen blir `Done`, og hvordan det lagres lokalt eller synkes til konto. Utenfor scope er PRO/checkout, nye leksjonsfelt, SEO-ruter, analytics-dashboard, migrasjoner, og redesign av hele kursopplevelsen.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for this scoped 10/10 claim gate:

- Product goals and IA
- UX flow clarity
- Business logic correctness and data integrity
- Accessibility (a11y)
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                        | Evidence                                                          | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Lesson completion remains a learning checkpoint after free lesson value, not a PRO/commercial gate, and the current lesson status is obvious in the lesson header and pass-criteria card. | course e2e + screenshot handoff                                   | `5/5`                   |
| UX flow clarity                               | `target`     | User can identify locked, in-progress, done, and undo states; blocked completion names the unmet pass-criteria action with no dead ends.                                                  | e2e for disabled/enabled/done/undo states + screenshot review     | `5/5`                   |
| Visual design quality                         | `target`     | Any changed button, feedback, or checklist presentation stays consistent with the current premium `/course` visual language and does not crowd mobile.                                    | screenshot handoff if visible UI changes                          | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Completion state, pass-criteria checks, `doneConfirmedAt`, canonical lesson IDs, undo behavior, and known dirty lesson IDs remain deterministic.                                          | unit tests for helpers + route tests + e2e                        | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | Scope rationale: no admin editor fields, save/publish workflow, revision UI, or admin content editing behavior changes.                                                                   | changed-files review                                              | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Buttons, disabled states, `aria-pressed`, checklist inputs, feedback text, status chip, and keyboard completion flow stay accessible.                                                     | Playwright assertions + semantic review                           | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no new dependency or heavy asset; `/course` should stay within existing route budgets.                                                                                   | dependency diff + `npm run verify:pre-pr` perf lane               | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Local-only guest/preview progress and signed-in server-canonical `course_progress` rows have explicit ownership, merge, retry, and failure behavior.                                      | data contract + progress tests                                    | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: progress API remains `no-store`; public course content cache and admin preview behavior must not change.                                                                 | route review + existing cache behavior unchanged                  | `4/5`                   |
| Reliability and failure handling              | `target`     | Loading content, offline/local storage failures, sync errors, unauthorized progress API responses, and stale/legacy lesson IDs render recoverable states without unexpected `500`s.       | negative-path route tests + e2e sync-status checks                | `5/5`                   |
| Security and authz                            | `target`     | Signed-in progress writes remain user-scoped and fail closed; unauthenticated API access remains `401`; no protected action is exposed publicly.                                          | existing and added route negative-path tests                      | `5/5`                   |
| Privacy and compliance                        | `target`     | Completion state contains no sensitive data, no raw free text, no extra PII, and no analytics payload expansion beyond existing safe sync events unless explicitly mapped.                | payload diff review + route tests                                 | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: completion uses authored pass criteria and display checkpoint flags, but does not edit course content.                                                                   | fixture/e2e coverage                                              | `4/5`                   |
| Admin workflow and editability                | `N/A`        | Scope rationale: no admin workflow labels, admin mutations, Help/Guide admin procedures, or content editing controls change.                                                              | changed-files review                                              | `N/A`                   |
| SEO and crawlability                          | `N/A`        | Scope rationale: no metadata, canonical URL, sitemap, robots, structured data, or indexability behavior changes.                                                                          | changed-files review                                              | `N/A`                   |
| AI discoverability                            | `N/A`        | Scope rationale: no public semantic lesson schema, structured data, or crawl-facing content model change.                                                                                 | changed-files review                                              | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: existing `progress_synced` / `sync_failed` events may be preserved or tightened, but no dashboard or new KPI taxonomy is added.                                          | analytics payload review + tests if touched                       | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | Scope rationale: no PRO, checkout, pricing, entitlement, invoice, refund, payout, support CTA destination, or commerce data changes.                                                      | changed-files review                                              | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting because sync failure/retry copy and user-flow docs may need clarification, but no operator incident workflow changes unless implementation changes recovery behavior.          | route/label/support sweep + docs update or explicit N/A           | `4/5`                   |
| Finance and reporting operations              | `N/A`        | Scope rationale: no finance, reporting, payout, refund, invoice, entitlement, checkout, product catalog, or revenue reconciliation truth changes.                                         | explicit non-commerce scope review                                | `N/A`                   |
| i18n operational readiness                    | `target`     | Completion labels and feedback must tolerate longer future localized strings without hardcoded current-only widths or duplicate text assumptions.                                         | screenshot review + text wrapping/assertion review                | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing `/course` route state, progress helpers, progress API, `CourseProgressSyncStatus`, and Playwright tests; add no dependency.                                                | diff review                                                       | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted unit/API/e2e tests cover state transitions, sync, undo, hidden checkpoints, legacy IDs, and changed visible copy; full pre-PR gate passes after screenshot approval when needed. | targeted tests + `npm run verify:pre-pr`                          | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: progress rows stay bounded by `MAX_COURSE_PROGRESS_ROWS`; no new storage table, cron, vendor, or client bundle split.                                                    | helper/API tests + diff review                                    | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Slice is revertible without migration rollback, dependency removal, or data backfill; bad code can be reverted while existing progress rows remain readable.                              | PR diff + rollback note + `npm run verify:pre-merge` before merge | `5/5`                   |

## Skill / Capability Audit

- Available now: `playwright` skill for browser screenshots/UI debugging; existing Playwright coverage for course progress, pass criteria, install prompt, and sync.
- Evaluate later: `openai-docs` only if OpenAI behavior is unexpectedly touched; Stripe plugin skills only if a future PRO/checkout child changes commerce.
- Install/config changes: none.

Systemic findings:

| Surface                | Finding                                                                                                                           | Severity | Recommended Type                 | Owner Decision Needed   | Follow-Up Brief Path |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------- | ----------------------- | -------------------- |
| Course progress state  | `Mark as done` already spans header action, pass-criteria checklist, local storage, signed-in sync, and undo behavior.            | `high`   | `bounded implementation child`   | `no`                    | this brief           |
| Sync/data boundaries   | Existing progress helpers canonicalize legacy lesson IDs and sync known reset rows; this slice should harden, not replace, them.  | `high`   | `bounded implementation child`   | `no`                    | this brief           |
| Analytics/SEO/commerce | Analytics interpretation, canonical routes, and PRO systemization remain parent-owned future children after completion is stable. | `medium` | `deferred architecture decision` | `yes, before expansion` | parent future child  |

Return path:

- Parent: `docs/task-briefs/planned/2026-06-13-course-lesson-experience-10-10-parent.md`
- Current child status: in progress on branch `feat/course-lesson-mark-done-progress-2026-06-13`.
- Last merged workstream: PR `#1118` (`a8935b6d`) and closeout PR `#1119` (`63cdf5e0`).
- Exact next planning step after this child: choose proof/trust, analytics/KPI, SEO/canonical routes, PRO systemization, distribution, or media pilot from the parent based on the shipped completion behavior.

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse `app/course/page.tsx` and the existing `/course` client route state.
  - Keep the current route boundary and query-param lesson routing.
  - Do not add a new route, server action, or client store for completion state.
- TypeScript/domain contracts:
  - Reuse `lib/course/progress.ts` for normalized local/server progress rows.
  - Reuse `lib/course/progress-status.ts` for pass-criteria/default checkpoint rules.
  - Preserve deterministic invariants for `done`, `doneConfirmedAt`, `videoSeconds`, `updatedAt`, dirty lesson IDs, and canonical lesson IDs.
- Supabase/data layer:
  - Reuse existing `course_progress` rows.
  - No migration, RLS change, generated type update, storage, or index change is planned.
  - Existing API fallback for missing `done_confirmed_at` must remain readable until schema parity is guaranteed.
- UI system:
  - Mature reference surface: current public `/course` lesson header, status chip, pass criteria card, and `CourseProgressSyncStatus`.
  - If any visible UI/copy changes ship, screenshot handoff is required before `npm run verify:pre-pr`.
- Analytics:
  - Preserve existing safe `progress_synced` and `sync_failed` event boundaries unless a test-backed payload tightening is needed.
  - Do not add lesson-completion KPI taxonomy or dashboard interpretation here.
- Testing:
  - Unit: `tests/unit/course-progress.test.ts`, `tests/unit/course-progress-status.test.ts`, and `tests/unit/course-progress-route.test.ts`.
  - E2E: `tests/e2e/course-pass-criteria-visibility.spec.ts`, `tests/e2e/course-progress-sync.spec.ts`, and install-prompt coverage if completion still arms the contextual install prompt.

## Data Placement And Sync Contract

- Server-canonical:
  - Signed-in progress rows in `course_progress`: canonical `lesson_id`, `done`, `done_confirmed_at`, `video_seconds`, and `updated_at`.
  - Published course lessons and pass criteria from canonical course content.
- Local-only:
  - Guest progress in existing course localStorage keys for done lessons, done confirmations, and video progress.
  - Preview progress in preview-scoped storage keys.
  - Pass-criteria checkbox state is UI state for the active session and must not become server truth by itself.
- Sync policy:
  - Guests stay local-only and may be prompted to sign in for backup after the existing threshold.
  - Signed-in users hydrate from `/api/progress/course`, merge local and remote rows through existing progress helpers, mark dirty lesson IDs, and retry through existing interval/pagehide/visibility behavior.
  - `done=true` may carry `doneConfirmedAt`; `done=false` must clear `doneConfirmedAt`.
  - Undoing `Done` should preserve or clear pass-criteria checks according to one documented implementation decision before coding; recommended default is preserve checked criteria as `In progress` while clearing the done confirmation timestamp.
- Retention and sensitivity:
  - Completion state is low-sensitivity learning progress and contains no raw user-authored free text.
  - Do not log raw cookies, tokens, email, request IP, user-agent, or unexpected payload bodies.
- Cache/invalidation:
  - Progress API remains `no-store`.
  - Course content cache, admin preview, and published content invalidation are unchanged.

## Identity And Rename Contract

- Canonical stable ID:
  - Course lesson runtime ID remains the source of truth for local progress, server progress, admin notes, QR links, future analytics, and route query params.
- Human-readable identifiers:
  - Lesson title, module title, `Mark as done`, `Done`, `Pass criteria`, and status labels are presentation text and may be clarified without changing identity.
- Mutability rules:
  - Runtime IDs are immutable and must not be repurposed.
  - Pass-criteria text can be edited as content, but stored progress must still be read safely through canonical lesson ID and existing fallback rules.
- Rename vs repurpose:
  - Copy changes are allowed in place.
  - A materially different lesson must be created as a new lesson identity, not silently reused under a completed lesson ID.
- Compatibility:
  - Legacy lesson IDs must continue to canonicalize on local load, API GET, API POST, and repair paths.
  - Unknown or malformed lesson IDs are ignored by normalization rather than persisted.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Lesson IDs/aliases, lesson types, pass criteria, `display.checkpoint`, status labels, local storage keys, API progress rows, sync event payloads, future locales, and future analytics interpretation.
- Source of truth:
  - Completion state derives from canonical course progress helpers and course lesson content, not hardcoded lesson IDs.
  - Supported lesson IDs derive from loaded course modules and runtime identity mapping.
- Additive behavior:
  - New lessons inherit the same locked/in-progress/done/undo behavior.
  - New pass criteria render in the checklist and gate completion automatically.
  - Lessons with `display.checkpoint=false` must not deadlock completion behind hidden criteria.
  - Legacy aliases should canonicalize to stable IDs automatically.
- Explicit mapping requirements:
  - New protected progress actions, new completion statuses beyond `not_started` / `in_progress` / `done`, new analytics event names, new route families, new PRO destinations, or locale workflow changes require explicit code/copy/test/doc updates.
- Unknown or deprecated values:
  - Unknown lesson IDs are ignored by progress normalization.
  - Unknown progress payload fields are ignored.
  - Unauthorized progress writes return `401`.
  - Sync failures show recoverable status and retry affordance without corrupting local progress.
- Test/evidence:
  - Add or keep tests for canonical/legacy IDs, hidden checkpoint behavior, done/undo timestamp handling, disabled-to-enabled gating, signed-in sync, and future-value lesson fixtures where practical.

## Scope

- Existing public `/course` completion behavior:
  - header `Mark as done` / `Done` action,
  - pass-criteria card action,
  - pass-criteria checklist gate,
  - status chip and lesson menu status,
  - blocked/enabled/done/undo copy and semantics,
  - local guest progress,
  - preview-isolated progress,
  - signed-in progress API hydrate/sync/retry behavior,
  - completion-triggered backup/install prompt interactions where already designed.
- Tests and docs for the changed progress behavior.
- Parent brief child-table and checkpoint updates.

## Out Of Scope

- PRO save flows, checkout, Stripe, entitlements, pricing, invoices, refunds, payouts, or finance reporting.
- New analytics dashboard, lesson KPI taxonomy, distribution funnel, or paid-conversion interpretation.
- Canonical lesson routes, metadata, sitemap, robots, structured data, or SEO migration.
- New course content fields, admin editor fields, content publishing workflow, bulk import, or media upload.
- Supabase schema migration, RLS changes, generated DB type updates, or new tables.
- New dependencies, external services, or analytics vendors.
- Full public course redesign beyond the smallest completion-flow UI/copy changes needed for clarity.

## Help / Guide Impact

- Update `docs/user-flow-map.md` if action semantics, labels, route flow, or recovery behavior changes.
- Admin Help/Guide is N/A unless implementation changes admin-visible workflow labels or support procedures.
- If sync failure/retry or account-backup behavior changes, update the relevant support/help surface or record an explicit deferred rationale before `verify:pre-pr`.

## Route / Label / Support-Surface Impact Sweep

Run before `verify:pre-pr` because this slice may change visible action labels, workflow states, and recovery copy.

Search at minimum:

- `Mark as done`
- `Done`
- `Pass criteria`
- `In progress`
- `Ready to start`
- `course-mark-done-button`
- `course-pass-criteria-mark-done-button`
- `course-done-gate-checklist`
- `doneConfirmedAt`
- `done_confirmed_at`
- `progress_synced`
- `sync_failed`
- `course_progress`
- `49043378`

Check at minimum:

- `app/`
- `components/`
- `lib/`
- `tests/`
- `docs/`
- `docs/runbooks/`
- active/planned/done task briefs touching `/course`, progress, analytics, or Help/Guide surfaces

Implementation evidence:

- `2026-06-13`: route/label/support sweep completed.
- Identifiers searched: `Mark as done`, `Done again`, `course-mark-done-button`, `course-pass-criteria-help`, `course-done-gate-feedback`, and `Progress`.
- Surfaces checked: `app/`, `components/`, `tests/`, `docs/`, active task briefs, planned task briefs, and done task briefs.
- Runtime fallout is limited to `/course` completion copy/semantics and stable test hooks; support/user-flow fallout is captured in `docs/user-flow-map.md`.
- Admin, PRO/checkout, SEO, analytics-dashboard, migration, and runbook surfaces are unchanged.

## Production Admin Notes Audit

- Included in this planned child:
  - `49043378...` / `Lesson Page - Mark as done`
- Already closed by prior child:
  - `8593d718...` / `Lesson info under video`
  - `042757a0...` / `Before Water pill / Sorte tall`
  - `488f7290...` / `Pille Foucs med tall og bokstaver bak`
- Rationale: `Mark as done` is stateful progress behavior and must be handled with sync, undo, and failure-mode tests instead of public visual polish only.

## Screenshot Handoff Requirement

This is user-facing workflow/UI work if any visible button, checklist, status, disabled, done, sync, or recovery state changes.

Required after targeted QA and before `npm run verify:pre-pr` when visible UI changes:

- `before-course-mark-done-desktop.png`
- `after-course-mark-done-desktop.png`
- `before-course-mark-done-mobile.png`
- `after-course-mark-done-mobile.png`
- Optional focused crops for locked checklist, enabled completion, done state, and sync status if full-page screenshots are too noisy.

If the implementation only changes tests or non-visible progress logic, record explicit screenshot N/A rationale in the checkpoint log.

## Acceptance Criteria

1. A new in-progress brief scopes the mark-as-done progress behavior child and maps all scorecard categories.
2. Parent course lesson brief links this child as planned/in-progress.
3. User can understand why `Mark as done` is unavailable before pass criteria are checked.
4. Header and pass-criteria `Mark as done` controls are consistent in label, enabled state, `aria-pressed`, and outcome.
5. Checking every visible pass criterion enables completion without requiring hidden or duplicated criteria.
6. Marking done updates status chip, menu status, local progress, and signed-in sync payload deterministically.
7. Undoing `Done` has one documented behavior and clears `doneConfirmedAt` when the lesson is no longer done.
8. Lessons with hidden checkpoints or future lesson types do not deadlock completion.
9. Guest, preview, and signed-in states remain isolated according to the data/sync contract.
10. Unauthorized progress API access remains `401`; malformed or oversized payloads fail predictably.
11. Existing progress analytics events are preserved or tightened with privacy-safe payloads only.
12. No PRO, checkout, SEO, admin editor, migration, new dependency, or new analytics dashboard behavior is added.
13. Help/Guide/user-flow impact is updated or explicitly ruled N/A.
14. Screenshot handoff is approved before broad pre-PR automation if visible UI changes.
15. `npm run verify:pre-pr` passes before PR handoff.

## Validation

Before screenshot handoff or screenshot N/A checkpoint:

- `npm run lint:briefs`
- `npm run typecheck`
- Targeted unit tests:
  - `tests/unit/course-progress.test.ts`
  - `tests/unit/course-progress-status.test.ts`
  - `tests/unit/course-progress-route.test.ts`
- Targeted e2e where relevant:
  - `tests/e2e/course-pass-criteria-visibility.spec.ts`
  - `tests/e2e/course-progress-sync.spec.ts`
  - `tests/e2e/install-prompt.spec.ts` only if completion/install prompt interaction changes.
- Route/label/support sweep.
- `git diff --check`

After owner screenshot approval when visible UI changed:

- `npm run verify:pre-pr`
- Commit, push, PR handoff, CI checks.
- `npm run verify:pre-merge` before merge recommendation.

## Checkpoint Log

- `2026-06-13 | planned | created this planned child from clean synced main@63cdf5e0 after PR #1118 and closeout PR #1119; scope is existing /course Mark as done state machine, pass-criteria gate, local/signed-in progress sync, undo, failure states, tests, docs, and screenshot handoff if visible UI changes; PRO, checkout, SEO/canonical routes, analytics dashboards, admin editor, migrations, and new dependencies remain out of scope | next: wait for owner implementation approval or scope edits`
- `2026-06-13 | in-progress | owner approved implementation; moved brief to in-progress on branch feat/course-lesson-mark-done-progress-2026-06-13; scope remains existing /course completion behavior, progress sync, tests, docs, and screenshot handoff if visible UI changes | next: audit current progress flow and implement the smallest safe hardening`
- `2026-06-13 | in-progress | implemented completion-flow clarity without changing the progress data model: header/pass-criteria actions now share deterministic described-by feedback, the done state explains the undo path, all-criteria-checked state explains completion readiness, undo keeps checked criteria while returning the lesson to In progress, user-flow docs describe the Done toggle, and helper/API tests cover latest done confirmation plus unauthenticated/malformed/oversized progress payloads | validation passed: ./node_modules/.bin/vitest run tests/unit/course-progress.test.ts tests/unit/course-progress-status.test.ts tests/unit/course-progress-route.test.ts; npm run typecheck; npx playwright test tests/e2e/course-pass-criteria-visibility.spec.ts --project=desktop-chromium; npx playwright test tests/e2e/course-progress-sync.spec.ts --project=desktop-chromium (1 passed, signed-in API sync skipped because dev-login/Supabase egress is not enabled locally); npx playwright test tests/e2e/install-prompt.spec.ts --project=mobile-chromium --grep "first successful mark-as-done"; route/label/support sweep completed | next: capture screenshot handoff and wait for owner visual approval before npm run verify:pre-pr`
- `2026-06-13 | owner-review | screenshot handoff captured in output/course-mark-done-progress-2026-06-13-234113 at 2026-06-13 23:47 local time as after/reference artifacts: reference locked desktop, after ready desktop, after done desktop, and after done mobile; capture used SITE_LOCK_ENABLED=0 against 127.0.0.1:3000, hid only Next dev overlay, and set the mobile swipe-NUX local key in the capture context so the hint did not cover the changed done copy | next: wait for owner visual approval before npm run verify:pre-pr, commit, push, or PR creation`
- `2026-06-13 | owner-review | owner requested clearer action affordance after all pass criteria are checked; updated the pass-criteria card button so disabled state stays muted, ready state becomes a blue primary action, and Done remains a quiet undo toggle; validation passed: npm run typecheck; npx playwright test tests/e2e/course-pass-criteria-visibility.spec.ts --project=desktop-chromium; refreshed screenshot handoff captured in output/course-mark-done-progress-2026-06-13-235302 at 2026-06-13 23:55 local time with reference disabled desktop, after ready desktop, after ready mobile, and after done desktop | next: wait for owner visual approval before npm run verify:pre-pr, commit, push, or PR creation`
- `2026-06-14 | owner-review | owner questioned pass-criteria header alignment; adjusted the pass-criteria header row from top-aligned to center-aligned and removed the completion button top margin so disabled, ready, and Done states share one optical header line; validation passed: npm run typecheck; npx playwright test tests/e2e/course-pass-criteria-visibility.spec.ts --project=desktop-chromium; refreshed alignment screenshots captured in output/course-mark-done-progress-2026-06-14-002043 at 2026-06-14 00:23 local time with after ready desktop, after done desktop, and after ready mobile | next: wait for owner visual approval before npm run verify:pre-pr, commit, push, or PR creation`
- `2026-06-14 | owner-approved | owner approved the refreshed screenshot handoff and explicitly approved continuing to tests plus merge when tests are good; active screenshot artifacts are output/course-mark-done-progress-2026-06-14-002043 | next: run npm run verify:pre-pr`
- `2026-06-14 | pre-pr-gate | npm run verify:pre-pr passed after the brief sweep evidence was made explicit; covered branch currency, quality gates, lint, typecheck, unit tests, build, performance budgets, and full local Playwright matrix with expected dev-login-dependent skips | next: commit, push, open PR, monitor CI, and run npm run verify:pre-merge before the approved merge`

## Completion Record

- `completed`: `2026-06-14`
- `merged_pr`: `#1120`
- `squash_commit`: `485132ed`
- `result`: Closed Course Lesson Mark-as-done Progress Behavior. The `/course` lesson completion flow now clearly explains the pass-criteria gate, makes the ready-to-complete action visually actionable, keeps the Done toggle aligned with the card header, and documents that undo returns the lesson to In progress while preserving checked criteria.
- `validation`: Targeted unit/component coverage passed for `tests/unit/course-progress.test.ts`, `tests/unit/course-progress-status.test.ts`, and `tests/unit/course-progress-route.test.ts`; targeted Playwright passed for `tests/e2e/course-pass-criteria-visibility.spec.ts`, `tests/e2e/course-progress-sync.spec.ts` with the signed-in API case skipped locally because dev-login/Supabase egress was unavailable, and `tests/e2e/install-prompt.spec.ts --grep "first successful mark-as-done"`; `npm run verify:pre-pr` passed on commit `6dbd4d2a` with full lane, build, perf budgets, and Playwright matrix (`109 passed`, `551 skipped`); PR #1120 CI was green; `npm run verify:pre-merge` passed and recorded the current-head marker before merge.
- `screenshot_artifacts`: `output/course-mark-done-progress-2026-06-14-002043`
- `10/10 claim`: yes - all critical target categories for this bounded slice reached `5/5`; no PRO, checkout, SEO, admin editor, migration, new dependency, or analytics-dashboard scope was added.

| Category                                      | Achieved Score | Evidence                                                                                                                                                                                                          | Gaps / Notes                                                     |
| --------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | Completion action now matches the learner's visible pass-criteria path and preserves the free-course completion contract; verified by targeted Playwright and owner screenshot approval.                          | No remaining slice gap.                                          |
| UX flow clarity                               | `5/5`          | Disabled, ready, done, and undo states have explicit helper copy and deterministic action behavior; owner-requested blue ready state and header alignment corrections were applied.                               | No remaining slice gap.                                          |
| Visual design quality                         | `5/5`          | Screenshot handoff `output/course-mark-done-progress-2026-06-14-002043` covers ready desktop, done desktop, and ready mobile; owner approved after alignment correction.                                          | No visual files changed after the approved capture before merge. |
| Business logic correctness and data integrity | `5/5`          | Unit tests cover latest done confirmation merge behavior; e2e covers pass criteria enabling completion and undo preserving checked criteria.                                                                      | No data model or migration changes.                              |
| Accessibility (a11y)                          | `5/5`          | Header and card actions use deterministic `aria-describedby` feedback and consistent pressed/disabled state coverage in e2e.                                                                                      | No remaining a11y gap in scoped controls.                        |
| Data placement and sync boundaries            | `5/5`          | Existing local-only guest progress, preview isolation, and signed-in API boundary were preserved; `course-progress-sync` status coverage remained green and signed-in API sync skip was environment-only locally. | No new server-canonical surface.                                 |
| Reliability and failure handling              | `5/5`          | Progress API negative-path tests now cover unauthenticated, malformed, and oversized payloads without analytics/upsert side effects.                                                                              | No new retry surface.                                            |
| Security and authz                            | `5/5`          | Unauthorized progress API GET/POST remains `401`; malformed/oversized payloads fail closed as `400`/`413`.                                                                                                        | No authz expansion.                                              |
| Privacy and compliance                        | `5/5`          | No new personal data, vendors, analytics payload categories, or persistence tables were introduced; existing privacy-safe progress payloads were preserved.                                                       | N/A beyond unchanged progress payload scope.                     |
| i18n operational readiness                    | `5/5`          | English copy changed only inside the existing English-only public course route; future locales remain an explicit mapping/update requirement in the forward compatibility contract.                               | No locale files exist in this slice.                             |
| Stack-fit and dependency discipline           | `5/5`          | Reused the existing Next.js route, progress state model, Tailwind patterns, and Playwright/Vitest coverage; no dependency added.                                                                                  | No architecture follow-up required for this slice.               |
| Testing and QA automation                     | `5/5`          | Targeted unit/e2e, `git diff --check`, `npm run lint:briefs:all`, `npm run verify:pre-pr`, PR CI, and `npm run verify:pre-merge` passed.                                                                          | Full local e2e had expected dev-login-dependent skips only.      |
| DevOps and rollback readiness                 | `5/5`          | Single squash commit `485132ed` on PR #1120 with green CI and pre-merge marker; rollback is the PR revert. Perf-budget tool recommended hold, not tightening.                                                     | No deployment caveat.                                            |
