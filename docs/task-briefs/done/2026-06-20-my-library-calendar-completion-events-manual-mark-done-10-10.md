# Task Brief: My Library Calendar Completion Events And Manual Mark Done (10/10)

## Metadata

- `id`: `2026-06-20-my-library-calendar-completion-events-manual-mark-done-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-20`
- `updated`: `2026-06-21`
- `mode`: `planned implementation child`
- `parent`: `docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`
- `training_history_parent`: `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- `garmin_provider_boundary`: `docs/task-briefs/blocked/2026-02-28-garmin-training-api-partner-integration-10-10.md`
- `garmin_reconciliation_follow_up`: `docs/task-briefs/blocked/2026-06-21-garmin-activity-reconciliation-and-review-10-10.md`
- `child`: `D`

## Brief Audit Record

- `last_audited`: `2026-06-21`
- `base`: `main@cae82cf5`
- `audit_status`: `ready`
- `decision`: Implement this as the active bounded Calendar/My Library child after owner confirmed scope with `start`.
- `reason`: Child `A` shipped stable `planned_workout_instances`, Child `B` shipped the month/day-detail placement, Child `C` shipped planned-only edit/status actions, and the training-history/Garmin boundary is now explicit enough for a manual completion slice.
- `must_refresh_before_execution_if`: Refresh if `planned_workout_instances`, workout/session export contracts, training-history scope, Garmin official API docs, Garmin partner status, support diagnostics, scorecard categories, route labels, screenshot rules, or verification lanes change before implementation starts.

## Goal

Add canonical manual completion events for planned swim sessions so Calendar can show a planned workout as actually completed without overwriting planned-instance identity or pretending Garmin sync has happened.

## Pre-Implementation Owner Explanation

Codex skal gjøre det mulig å markere en planlagt svømmeøkt som gjennomført manuelt. Det betyr noe fordi faktisk trening må lagres som egen historikk, ikke som en omskriving av planen. Utenfor scope er Garmin-kobling, Garmin-import, sammenligning av sendt og mottatt Garmin-aktivitet, habits/micro/Perfect Day-lag, partial/cancelled historikk, avansert analyse, økonomi/adminrapportering, performance-ratchet og `Ja.docx`.

## Current Repo State

- `planned_workout_instances` exists and is owner-scoped with stable IDs, program/workout references, `planned_on`, reversible planned-only statuses, and manual date override support.
- `/my-library/calendar` has `Plan` and `Stats` modes, a desktop month view, selected-day detail, and planned-only actions: `Reschedule`, `Skip`, `Cancel`, and `Recover`.
- Calendar support docs already state that planned actions are not completion history.
- Workout and program Garmin-ready JSON exports exist, but they are export/handoff artifacts only and do not send anything to Garmin.
- No canonical completed swim history table exists yet for saved swim sessions.

## Scope

- Add canonical completed activity storage owned by the training-history contract, scoped to manual swim completion from Calendar.
- Let a signed-in user mark an eligible planned swim as completed from selected-day detail.
- Link each completed event to:
  - `completed_activity_event.id` or equivalent immutable history ID,
  - `planned_workout_instances.id`,
  - `workout.id` where present,
  - `program.id`/program assignment context where available,
  - user ownership.
- Store enough planned snapshot metadata to support future plan-vs-actual and Garmin reconciliation without using labels as identity.
- Keep `planned_workout_instances.id` stable; completion creates actual outcome truth and does not replace planned rows.
- Render planned vs completed state deterministically in Calendar day/month/detail surfaces.
- Make completion idempotent for repeat submissions of the same planned instance.
- Block completion for skipped/cancelled/review-status/stale/cross-user/missing-reference rows with bounded recovery copy.
- Add tests for schema/contract behavior, mutation invariants, idempotency, authz, stale conflict, unknown future status, and UI state rendering.
- Update Help/Guide/support runbooks if user recovery behavior labels change.

## Out Of Scope

- Garmin OAuth, credentials, Training API send jobs, Activity API ingestion, provider webhooks, or provider backfill.
- Comparing Garmin sent workout payloads against received Garmin activity history.
- Editing/reconciling Garmin-provider matches or conflicts.
- Partial completion, completed-on-another-day, manual comments, cancelled-as-history, or broader training-history timeline unless explicitly added to a later child.
- Habit, micro session, or Perfect Day aggregation.
- AI retrospective review, adaptive replanning, finance/admin dashboards, or public SEO surfaces.
- Touching `Ja.docx`.

## Garmin Boundary For This Child

Official Garmin source baseline checked on `2026-06-21`:

- Garmin Connect Developer Program overview: https://developer.garmin.com/gc-developer-program/overview/
- Garmin Training API: https://developer.garmin.com/gc-developer-program/training-api/
- Garmin Activity API: https://developer.garmin.com/gc-developer-program/activity-api/
- Garmin Program FAQ: https://developer.garmin.com/gc-developer-program/program-faq/
- Garmin API Brand Guidelines: https://developer.garmin.com/brand-guidelines/api-brand-guidelines/

Contract:

- Garmin Training API is the future send/publish path for workouts and training plans.
- Garmin Activity API is the future receive path for actual completed activities.
- A `sent`, `queued`, or `synced-to-Garmin` provider state must never count as `completed`.
- Manual completion in this child uses `source_kind = manual` or equivalent and no Garmin provider identifiers.
- Future Garmin Activity API ingestion must reconcile into the canonical completed-history layer, not mutate planned rows directly.
- Future Garmin attribution/branding requirements must be handled when Garmin-sourced or Garmin-derived data is displayed; this child should not introduce Garmin-derived data.
- Unknown provider states, future source kinds, or imported activity states must fail closed and stay out of completion counts until explicitly mapped.

## Data Placement And Sync Contract

- Server-canonical:
  - planned instance identity,
  - completed activity/history identity,
  - manual source kind,
  - completion outcome (`completed`) and completion date,
  - planned snapshot needed for future comparison,
  - user ownership,
  - timestamps.
- Local-only:
  - confirmation dialog state,
  - pending form state,
  - transient optimistic UI while the mutation is in flight.
- Sync and conflict policy:
  - completion writes are idempotent by planned instance and user,
  - stale `updated_at`/status mismatches fail closed and ask for refresh,
  - skipped/cancelled/review-status planned rows cannot be silently marked complete,
  - duplicate attempts return the existing completed event or a deterministic already-completed state,
  - unexpected provider fields are ignored or blocked because provider sync is not active.
- Cache/invalidation:
  - Calendar month/week/day plan summaries refresh after completion mutation,
  - later training-history lists and plan-vs-actual summaries must also invalidate from the same canonical event.
- Retention and sensitivity:
  - completion data is private user-owned training history,
  - payloads and logs must not include raw provider files, prompt data, private notes, or unrelated profile data.

## Identity And Forward Compatibility Contract

- `planned_workout_instances.id` identifies the intended planned occurrence.
- Completed event/history ID identifies actual outcome truth.
- Workout/program titles are presentation only and may change without breaking history.
- Manual completion can later coexist with provider activity aliases, but provider IDs remain foreign aliases only.
- Future Garmin send jobs need a send snapshot/fingerprint that can be compared against later Garmin Activity API data; this child must not prevent that by collapsing plan and completion identity.
- Future source kinds expected by the platform include `manual`, `garmin_activity_api`, and `system_reconciled`; new source kinds require typed mapping, support copy, and tests.
- Unknown or deprecated outcomes/source kinds render as review/unmapped states and never count as completed.

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `/my-library/calendar` selected-day detail as the action placement;
  - month cells remain scan-first and do not become mutation surfaces;
  - keep protected-route behavior aligned with current My Library auth redirects.
- TypeScript/domain contracts:
  - introduce typed completion outcome/source/status unions;
  - normalize action input through allowlists;
  - model unknown future statuses as review states, not truthy completion.
- Supabase/data layer:
  - use an explicit additive migration for completed activity/history storage;
  - use owner-scoped RLS and negative-path tests;
  - add uniqueness/idempotency constraints for manual planned-instance completion;
  - update generated DB types in the same implementation PR.
- External services:
  - Garmin is a future provider boundary only in this child;
  - do not add Garmin credentials, provider SDKs, webhook routes, or network calls.
- UI system:
  - reuse current My Library button/action density and Calendar status styling;
  - screenshot handoff is required before `verify:pre-pr` because this changes UI state/action labels.
- Testing:
  - include route/action, data invariant, authz, duplicate/idempotency, stale-row, unknown-status, component, and screenshot evidence.

## Codex Skill / Stack Readiness Radar

Skill/capability audit:

- Available now: local shell tools, repo lint/verify scripts, `playwright` skill for screenshot handoff, official web sources for Garmin provider facts.
- Evaluate later: no new Codex skills/plugins are needed for manual completion; Garmin provider work may need fresh official-doc review and possibly integration stubs after partner approval.
- Install/config changes: none; do not install or configure local Codex capabilities for this slice.

Systemic findings:

| Surface                   | Finding                                                                                                                       | Severity | Recommended Type               | Owner Decision Needed | Follow-Up Brief Path                                                                     |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------ | --------------------- | ---------------------------------------------------------------------------------------- |
| Training-history boundary | Manual completion needs its own canonical history identity before Calendar can safely show completed swim sessions.           | `high`   | `bounded implementation child` | `no`                  | this brief                                                                               |
| Garmin provider boundary  | Garmin send and Garmin received activity are separate official API directions and must not share a completion flag.           | `high`   | `bounded implementation child` | `no`                  | `docs/task-briefs/blocked/2026-06-21-garmin-activity-reconciliation-and-review-10-10.md` |
| Support/recovery states   | Duplicate, stale, skipped/cancelled, unknown status, and missing-reference completion failures affect user recovery behavior. | `medium` | `bounded implementation child` | `no`                  | this brief                                                                               |

Return path:

- Parent: `docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`
- Last merged workstream: PR `#1191` and closeout PR `#1192`, with clean `main@de761db3`.
- Next product step after this docs-only audit: owner may explicitly execute this Child D implementation.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                        | Evidence                                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Users can manually mark an eligible planned swim completed and see planned vs actual truth clearly.                                   | route/component tests + screenshot handoff     | `5/5`                   |
| UX flow clarity                               | `target`     | Completion, already-completed, blocked, stale, and recovery states are understandable without docs.                                   | copy review + component tests                  | `5/5`                   |
| Visual design quality                         | `target`     | Completion actions fit selected-day detail and do not crowd month cells or mobile cards.                                              | responsive screenshots                         | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Completed events are canonical, idempotent, owner-scoped, linked to planned instances, and separate from Garmin send state.           | migration/route/invariant tests                | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this is an end-user Calendar completion flow and no admin editor changes.                                                 | explicit admin non-scope rationale             | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Completion actions/dialogs are keyboard reachable and announce success/error/review states.                                           | a11y + keyboard tests                          | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Completion flow keeps Calendar reads window-bounded and avoids material client bundle growth.                                         | query/bundle review + perf gate                | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Planned rows, manual completion history, and future Garmin provider aliases remain separate.                                          | data contract + tests                          | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Calendar summaries refresh after completion and do not show stale planned-only state.                                                 | invalidation tests                             | `5/5`                   |
| Reliability and failure handling              | `target`     | Duplicate, stale, missing-ref, skipped/cancelled, unknown-status, schema-missing, and unexpected failure paths have bounded recovery. | negative-path tests                            | `5/5`                   |
| Security and authz                            | `target`     | Anonymous and cross-user completion attempts fail closed with `401`/`403` and no data leakage.                                        | authz tests                                    | `5/5`                   |
| Privacy and compliance                        | `target`     | Completion payloads minimize private training data and exclude raw provider files, prompt data, and unrelated notes.                  | payload/log review + tests                     | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: workout/program source content remains owned upstream and history stores references/snapshots only.                  | scope review                                   | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow labels, operator actions, or role-gated CRUD change.                                                    | explicit admin workflow non-scope rationale    | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because completion history is private user data and no public metadata/crawl surfaces change.                                     | private-route rationale                        | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because completed activity events are private user data and not public AI-discoverable content.                                   | private-data rationale                         | `N/A`                   |
| Analytics and KPI observability               | `target`     | Completion events use stable outcome/source taxonomy and avoid duplicate counting.                                                    | event tests or explicit no-new-event rationale | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: completion has no checkout, billing, or entitlement mutation.                                                        | scope review                                   | `4/5`                   |
| Incident response and support operations      | `target`     | Support can distinguish duplicate, forbidden, stale, skipped/cancelled, unknown-status, schema, and missing-reference failures.       | support-copy/runbook review                    | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this child does not touch revenue, invoices, refunds, payouts, entitlement reporting, or accounting data.                 | explicit finance non-scope rationale           | `N/A`                   |
| i18n operational readiness                    | `target`     | Completion, already-completed, blocked, source, and review labels avoid identity coupling and tolerate copy expansion.                | copy review + responsive tests                 | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing App Router, Supabase/RLS, TypeScript validation, Calendar components, and UI primitives; add no unnecessary deps.      | package diff + architecture review             | `5/5`                   |
| Testing and QA automation                     | `target`     | Include migration/type, mutation, authz, duplicate, stale, component, screenshot, `verify:pre-pr`, CI, and `verify:pre-merge`.        | validation outputs                             | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Completion writes are idempotent/bounded and summary reads avoid N+1 across Calendar windows.                                         | query tests/review                             | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Completion storage/action rollout can be reverted or disabled without corrupting planned instances or future Garmin state.            | rollback notes + PR validation                 | `5/5`                   |

## Help/Guide And Support-Surface Impact

- This implementation changes user recovery behavior and must run the route/label/support sweep before broad gates.
- Update `docs/user-flow-map.md`, `docs/runbooks/auth-account-support.md`, and any Help/Guide-facing assertion if completion labels, recovery copy, or support diagnostics change.
- If no runtime Help/Guide surface exists for the changed action, record the explicit `N/A` rationale in the active checkpoint.

## Screenshot Contract

- This is UI work when implemented.
- Capture `after/reference` screenshots comparing:
  - Calendar selected-day detail with completion action,
  - completed state after mutation,
  - blocked/already-completed state where practical,
  - current planned action reference surface.
- Pause for owner visual approval before `npm run verify:pre-pr`, PR creation/update, and `npm run verify:pre-merge`.

## Acceptance Criteria

- A planned swim can be manually marked completed from Calendar selected-day detail.
- Duplicate completion attempts do not create duplicate actual truth.
- Planned and actual identity remain separate.
- Calendar renders planned vs completed state after mutation.
- Future Garmin send/import/reconcile remains possible without schema or identity rewrite.
- Unknown future completion/provider states fail closed and do not count as completed.

## Validation Plan

- `npm run lint:briefs`
- Schema/migration/generated-type validation.
- Route/mutation/authz/idempotency/stale-conflict tests.
- Component/page tests and screenshot handoff.
- Route-label/support-surface impact sweep.
- `npm run verify:pre-pr`
- GitHub CI required checks.
- `npm run verify:pre-merge`

## Quality Gate Evidence Notes

- API failure-mode evidence: route tests and runtime guards cover invalid UUID,
  unauthenticated, cross-user/missing row, stale update, skipped/cancelled,
  unknown planned status, missing workout/program references, duplicate insert
  race, and schema-missing cases; no unexpected 500 is expected for known
  failure modes.
- Route-label/support sweep evidence: identifiers searched included
  `completed_activity_events`, `Mark done`, `already_completed`,
  `Completion review`, planned-instance action labels, old
  completion-not-connected copy, and Swimming completed-on copy; surfaces checked
  included `app/`, `components/`, `lib/`, `tests/`, `docs/`,
  `docs/runbooks/`, active/planned task briefs, scripts, and `package.json`.
- UI evidence: screenshot approval stop completed on 2026-06-21 after owner
  screenshot approval for the linked `after/reference` artifacts; no
  product-rendering files changed after capture except removal of the temporary
  local visual harness route.

## Checkpoint Log

- `2026-06-20 | planned | created as Child D after owner asked whether workouts can be marked as performed | next: refresh training-history boundary before execution`
- `2026-06-21 | audit-refresh | refreshed on clean main@de761db3 after Calendar children A/B/C and closeout PR #1192 merged; tightened manual completion around canonical history identity, idempotency, selected-day action placement, and explicit Garmin Training API vs Activity API boundary | next: owner may explicitly execute runtime implementation after this docs-only audit PR is merged`
- `2026-06-21 | implementation-start | moved to in-progress on branch child-d-calendar-manual-completion from clean main@cae82cf5 after PR #1193 merged and no post-merge closeout remained; owner confirmed scope with start | next: implement canonical manual completion storage/action/UI, then screenshot handoff before PR gates`
- 2026-06-21 | implementation-checkpoint | added completed_activity_events storage/types, manual completion API, Calendar completion state loader, selected-day Mark done, completed/review/schema-missing UI states, API contract, user-flow docs, and support runbook updates; Stats Swimming copy now says completed activity events still need an explicit comparison mapping | validation: targeted Vitest calendar/completion pack PASS 7 files/38 tests, npm run typecheck PASS, git diff --check PASS; route-label/support sweep searched old completion-not-connected strings, completed_activity_events, Mark done, already_completed, Completion review, planned-instance action labels, and Swimming completed-on copy across app/components/lib/tests/docs/scripts/package.json; stale active/runtime/planned references fixed, historical done/ brief references intentionally left as PR history | next: capture screenshot handoff and stop for owner visual approval before npm run verify:pre-pr
- 2026-06-21 | screenshot-handoff | captured after/reference screenshot artifacts in output/calendar-manual-completion-2026-06-21-130344 using a temporary local visual harness, then removed the harness route from the repo diff and stopped the dev server | validation: manual image review confirmed Mark done, completed state, mobile completion-review state, and planned recover reference render without visible overlap; no product-rendering files changed after capture except removal of the temporary harness route | next: owner visual approval or requested corrections before npm run verify:pre-pr
- 2026-06-21 | remote-schema-applied | first npm run verify:pre-pr failed because 20260621123000_completed_activity_events_manual_swim_completion.sql was pending on linked remote; Supabase projects list confirmed linked project freeswimming-org-prod/sazgjhgxvmxcyowovond, migration list showed exactly that local-only migration, dry-run showed exactly that file, npx supabase db push --linked --yes applied it, post-apply dry-run reported Remote database is up to date, and linked typegen confirmed the completed_activity_events block matches the scoped types/database.ts update; one post-apply migration-list rerun hit the known temporary Supabase pooler auth circuit breaker, so subsequent Supabase checks should run sequentially | next: rerun npm run verify:pre-pr
- 2026-06-21 | pre-pr-first-pass | npm run verify:pre-pr passed full lane after Supabase drift was resolved: lint/quality gates/typecheck/unit/build/perf/E2E were green with 111 passed and 567 skipped E2E tests; perf budget recommended tightening after 10 consecutive weekly green runs, but performance-ratchet remains hold because owner instruction requires at least two new green weekly cycles after 2026-06-19 before tightening; after the pass, removed a new unused mock-parameter warning in tests/unit/calendar-completion-route.test.ts and revalidated that file with npx eslint plus vitest 9/9 PASS | next: rerun npm run verify:pre-pr before commit
- 2026-06-21 | merged | PR #1194 merged to main as dc019732 after green local gates, green GitHub CI, owner screenshot approval, and npm run verify:pre-merge PASS | next: post-merge closeout

## Completion Record

- `completed`: `2026-06-21`
- `merged_pr`: `#1194`
- `squash_commit`: `dc0197322e724d3c71deb80ee4426f839090b05a`
- `result`: Closed My Library Calendar manual completion by adding an owner-scoped completed activity event layer, a fail-closed Calendar completion API, Calendar UI states for manual completion/review/schema gaps, and support/docs coverage without treating Garmin send state as completed history.
- `validation`: targeted Vitest calendar/completion pack PASS (`7` files / `38` tests), `npm run typecheck` PASS, `git diff --check` PASS, `npx eslint tests/unit/calendar-completion-route.test.ts` PASS, `npm run verify:pre-pr` PASS full lane on `ab873779` (`253` unit files / `1673` unit tests, build PASS, perf budgets PASS, Playwright `111` passed / `567` skipped), GitHub CI PASS for PR `#1194`, linked Supabase migration dry-run PASS, and `npm run verify:pre-merge` PASS for `ab873779`.
- `screenshot_evidence`: `output/calendar-manual-completion-2026-06-21-130344`, owner approved on `2026-06-21`; no product-rendering files changed after capture except removal of the temporary local visual harness route.
- `10/10 claim`: yes - all critical target categories reached `5/5`; Garmin import/reconciliation, Training History comparison, completion editing, and Swimming stats comparison remain explicitly out of scope.
- `performance_ratchet`: hold - perf tooling recommended tightening, but owner instruction keeps ratchet waiting for at least two new green weekly cycles after `2026-06-19`.

| Category                                      | Achieved Score | Evidence                                                                                                                                  | Gaps / Notes                                                                               |
| --------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Product goals and IA                          | `5/5`          | PR `#1194`, Calendar completion action/state tests, screenshot handoff, and owner approval.                                               | No gap for Child D scope.                                                                  |
| UX flow clarity                               | `5/5`          | Completed, duplicate, review, schema-missing, skipped/cancelled, and stale recovery copy covered by tests and screenshot evidence.        | No gap for Child D scope.                                                                  |
| Visual design quality                         | `5/5`          | `output/calendar-manual-completion-2026-06-21-130344` after/reference artifacts approved by owner.                                        | No gap; no rendering files changed after capture except harness removal.                   |
| Business logic correctness and data integrity | `5/5`          | Migration, route guards, idempotency, stale/conflict, missing-reference, and unknown-status tests.                                        | Garmin reconciliation remains a separate blocked/future brief.                             |
| Accessibility (a11y)                          | `5/5`          | Existing button semantics preserved; component tests and full verify/CI covered changed UI states.                                        | No gap for Child D scope.                                                                  |
| Performance (CWV + payloads)                  | `5/5`          | `npm run verify:pre-pr` perf budgets PASS and Calendar completion reads remain window-bounded.                                            | Ratchet tightening intentionally deferred per owner instruction.                           |
| Data placement and sync boundaries            | `5/5`          | Completion events are separate from planned rows and keep manual source/outcome identity server-canonical.                                | No gap for Child D scope.                                                                  |
| Caching and invalidation strategy             | `5/5`          | Completion mutation refreshes Calendar state through existing route refresh path; stale rows fail closed.                                 | No gap for Child D scope.                                                                  |
| Reliability and failure handling              | `5/5`          | Negative-path API tests cover auth, stale, skipped/cancelled, schema-missing, duplicate race, missing refs, and unknown statuses.         | No gap for Child D scope.                                                                  |
| Security and authz                            | `5/5`          | Owner-scoped RLS, authenticated route guard, and cross-user/missing-row tests.                                                            | No gap for Child D scope.                                                                  |
| Privacy and compliance                        | `5/5`          | User-owned completion payload minimized; no raw provider files, prompt data, private notes, or unrelated profile data added.              | Policy text unchanged; Supabase processor use remains existing.                            |
| Analytics and KPI observability               | `5/5`          | Stable source/outcome taxonomy added and duplicate completion attempts are not double-counted.                                            | Swimming stats comparison mapping remains explicit future scope.                           |
| Incident response and support operations      | `5/5`          | `docs/runbooks/auth-account-support.md`, API contract, and route-label/support sweep document recovery and diagnostic cases.              | No gap for Child D scope.                                                                  |
| i18n operational readiness                    | `5/5`          | Completion/review labels avoid identity coupling and tolerate future source/outcome mapping without treating unknown values as completed. | No gap for Child D scope.                                                                  |
| Stack-fit and dependency discipline           | `5/5`          | Reused App Router, Supabase/RLS, TypeScript contracts, Calendar components, and existing UI primitives; no new dependencies.              | No gap for Child D scope.                                                                  |
| Testing and QA automation                     | `5/5`          | Targeted tests, `verify:pre-pr`, GitHub CI, screenshot approval, and `verify:pre-merge` all PASS.                                         | No gap for Child D scope.                                                                  |
| Scalability and cost efficiency               | `5/5`          | Idempotent unique completion writes and batched Calendar completion lookups avoid unbounded duplicate events/N+1 reads.                   | No gap for Child D scope.                                                                  |
| DevOps and rollback readiness                 | `5/5`          | Additive migration, PR rollback note, Supabase dry-run PASS, CI PASS, and `verify:pre-merge` PASS.                                        | Table can remain unused on revert or be dropped later with explicit migration if required. |
