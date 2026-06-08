# Task Brief: AW-006 Micro Sessions Recurring Habit Runtime (10/10)

## Metadata

- `id`: `2026-06-08-aw-006-micro-sessions-recurring-habit-runtime-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-08`
- `updated`: `2026-06-08`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `decision_brief`: `docs/task-briefs/done/2026-06-07-aw-006-micro-sessions-recurring-habit-linkage-decision-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `execution_mode`: `end-to-end runtime implementation`
- `target_findings`: `H-046` runtime Micro Sessions recurring Habit linkage, H-028 no-midnight-auto-write guardrail, and owner-confirmed weekly rollover / paused final-completion / shared sound / copy-layout hardening for the runtime slice.
- `direct_follow_up`: `docs/task-briefs/planned/2026-06-08-aw-006-habits-timer-completion-copy-polish-10-10.md` after this runtime PR and any repo-managed closeout merge.

## Brief Audit Record

- `last_audited`: `2026-06-08`
- `base`: clean synced `main@0e9fe35f`
- `audit_status`: `ready`
- `decision`: Execute a bounded first runtime slice that lets an active Micro Session opt in to one recurring build Habit with explicit linkage state and idempotent check-in credit.
- `reason`: Main is clean after PR `#1016`; the decision brief records explicit opt-in, no backfill, stable Micro Session identity, and fail-closed unknown states. Fresh audit found existing Micro Sessions and Habits are separate, with no linkage/provenance fields in `dryland_micro_plans`, `habit_definitions`, or `habit_check_ins`.
- `must_refresh_before_execution_if`: Refresh if Micro Sessions schema/routes/components, Habits schema/routes/components, Calendar comparison, Help/Guide/support surfaces, scorecard categories, route/label sweep rules, screenshot handoff rules, or validation lanes change before PR handoff.

## Goal

Ship the first safe runtime path for turning a weekly Micro Session program into an explicitly linked recurring Habit, including safe week rollover, paused-counting edge cases, and clear UI copy, without silent habit creation, backfill, hidden Perfect Day linkage, or history rewrites.

## Pre-Implementation Owner Explanation

Vi gjor en Micro Session mulig aa koble til en Habit bare naar brukeren velger det selv.

Hvorfor det betyr noe: Micro Sessions er sma okter du kan gjore naa, mens Habits er langsiktig motivasjon og historikk. Koblingen maa derfor vaere tydelig, pauserbar og sporbar, ellers kan streaks, Perfect Day og kalenderen foeles upaalitelige.

Utenfor scope er reminders, notifications, nye export-flater eller export-redesign, store grafer, hard delete, automatisk bakutfylling av gamle microokter, automatisk Perfect Day-kobling, persistent timer-telemetri og et nytt globalt routine-system.

Fremoverkompatibilitet: nye Micro Session-kilder kan bruke samme server-canonical linkage naar de har en trygg weekly-program completion-source mapping; nye habit modes, count policies eller linkage-stater maa eksplisitt mappes foer de kan telle.

## Product Decisions For This Slice

- `Make recurring habit` is explicit opt-in from the active Micro Session surface.
- This first runtime version links the current active `dryland_micro_plans.id` to one new build/binary Habit.
- The user chooses habit name and start date. Count policy is fixed by this slice as one weekly-program completion target.
- A linked active Habit auto-completes for the week only when every non-archived unit in the weekly Micro Session is `completed`.
- Multiple completed Micro Session units on the same day are allowed; the Habit credit is one weekly check-in for the complete program.
- `skipped` units do not count as completed for the linked Habit.
- If the user undoes a completed unit while the current weekly program is no longer complete, only the auto-generated Micro Session Habit credit for that plan/week is removed.
- Pausing the Habit linkage means `Pause counting`, not pausing the Micro Session itself and not globally archiving the Habit. Existing Micro Session bubbles remain usable as ordinary Micro Session work.
- If the final unit is completed while Habit tracking is paused, the UI must ask whether to `Resume tracking + complete Habit`, `Complete Micro Session only`, or cancel. Silent auto-resume is not allowed.
- If all units were completed while counting was paused and the user resumes later in the same week, the app must not retro-count that paused work. It may count only if the user explicitly chose the final-completion resume action, or if the user undoes a unit and completes it again after resume.
- Resuming the Habit linkage restarts future counting. If the current open plan is stale from a previous week, resume creates this week's Micro Session from the same source sessions without backfilling missed paused weeks.
- Weekly rollover is server-canonical:
  - active linked Habit counting closes the stale prior-week Micro Session and creates the current week's Micro Session from the same source sessions when the user returns after week boundary;
  - paused linkage does not create new weekly bubbles until resume;
  - unlinked stale Micro Sessions are closed/archived automatically at week rollover, do not auto-create a new plan, and do not block a clean current-week start.
- Manual/unlinked next-week UX:
  - do not add `Repeat next week` in this slice;
  - if the week is complete before week boundary, keep `Week complete` with concise copy such as `This week's Micro Session is saved.`;
  - when the next week starts, show a clean start state with `Repeat this week` and `Choose sessions`;
  - `Repeat this week` creates a new current-week Micro Session from the previous week's source sessions, without rewriting old history.
- Habit credit eligibility must be bound to the Micro Session plan week and selected Habit week, not to untrusted client-only `selectedDate` values.
- Clear closes the current Micro Session surface only and preserves Habit/check-in history. Stopping the recurring commitment uses `Pause counting` here or Habit archive/end in Habits, not silent deletion.
- Micro Sessions and Habits use the same calm completion sound profile; this slice must not keep a separate old Micro Sessions tap/timer sound.
- Ending/archive of the Habit removes it from active Habit surfaces but keeps Micro Session history and existing check-in evidence.
- Source edits and `Update current micro session` preserve completed/skipped block history and existing historical Habit credit.
- Unknown, stale, cross-owner, unavailable, archived, or unsupported linkage states fail closed and do not improve Habit, Perfect Day, streak, consistency, or Calendar comparison metrics.
- Copy decisions:
  - creation form title is `New Weekly Habit`;
  - default Habit name is `Weekly Micro Sessions`;
  - remove duplicate explanatory cadence text when the info box already says the Habit completes when every unit is done;
  - linked active panel should read as linked/counting state, not a large green explanation block;
  - paused copy should be short, for example `Micro Sessions still work. Habit tracking is paused.`;
  - status actions should use `Pause counting` / `Resume counting` where practical.
- UI layout decisions:
  - peer buttons in one action row should use stable equal-feeling widths when there is room, while icon-only sound controls keep the same height as peer buttons;
  - Ordered mode must keep reps/kg visible and may consolidate repeated set buttons into one clear `Complete next: <target>` action plus remaining-set status if that improves scanability.
- Direct follow-up decision: after this Micro/Habit runtime slice merges and closeout is clean, go directly to `AW-006 Habits Timer Completion Copy Polish` for timed Habit target auto-pause/save, Finish placement, undo, completion message, and streak-copy cleanup.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Data placement and sync boundaries`
- `Reliability and failure handling`
- `Security and authz`
- `Privacy and compliance`
- `Incident response and support operations`
- `i18n operational readiness`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                                            | Evidence                                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Micro Sessions remain runnable one-off work by default; recurring Habit linkage is explicit and visible on the Micro Sessions surface.                                                                                        | component/API behavior + screenshot handoff             | `5/5`                   |
| UX flow clarity                               | `target`     | User can create, pause/resume counting, complete the final unit while paused with an explicit choice, understand weekly-program Habit completion, and recover from stale weeks without dead ends.                             | component tests + e2e/screenshot handoff                | `5/5`                   |
| Visual design quality                         | `target`     | New controls reuse existing Micro Sessions/Habits action styling, avoid nested cards, fit mobile/desktop, and screenshot handoff shows no overlap.                                                                            | screenshot artifacts desktop/mobile                     | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Linkage writes are owner-scoped, idempotent, no backfill, no duplicate weekly check-ins, no title-based linkage, plan-week credit is not driven by untrusted client dates, and source edits do not rewrite historical credit. | unit/API tests + migration constraints                  | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor CRUD, publishing, operator content editing, or admin recovery workflow.                                                                                                              | admin-editor scope rationale                            | `N/A`                   |
| Accessibility (a11y)                          | `target`     | New buttons/forms have labels, disabled states, focus path, and status/error announcements consistent with existing surfaces.                                                                                                 | component tests + screenshot/manual check               | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: changed private routes must not add new dependency or heavy client payload; `/my-library/dryland` should stay within existing private route budget.                                                          | package diff + build/pre-PR gate                        | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Linkage, Habit credit, pause/resume counting, final paused-completion choice, weekly rollover, and renewal are server-canonical; only dialog state remains local. Failed writes preserve existing metrics.                    | migration + API tests + brief contract                  | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Existing no-store API responses remain; successful mutations refresh the Micro Sessions/Habits server snapshot through returned plan and route refresh where needed.                                                          | route code + component tests                            | `4/5`                   |
| Reliability and failure handling              | `target`     | Schema-missing, stale plan, archived habit, missing source, stale rollover failure, duplicate credit, paused final-completion, and invalid status paths return expected `4xx/503` without metric mutation.                    | negative-path route tests                               | `5/5`                   |
| Security and authz                            | `target`     | All changed protected writes require authenticated owner access and reject cross-owner IDs before counting Habit credit.                                                                                                      | route tests for unauthorized/cross-owner behavior       | `5/5`                   |
| Privacy and compliance                        | `target`     | Analytics/logs avoid private titles/notes and use redacted IDs/statuses only; no secrets or raw env values added.                                                                                                             | code review + analytics payload assertions              | `5/5`                   |
| Content governance                            | `target`     | Active brief, parent, queue, design inventory, Help/Guide impact, and PR body agree on shipped behavior and out-of-scope items.                                                                                               | docs diff + brief lint                                  | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow label, admin action, role-gated CRUD, audit trail, or operator editability surface.                                                                                                | admin-workflow scope rationale                          | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this affects authenticated My Library surfaces only and changes no public route metadata, sitemap, robots, canonical URL, or structured data.                                                                     | SEO scope rationale                                     | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity, structured data, public docs surface, or public semantic content.                                                                                                       | AI-discoverability scope rationale                      | `N/A`                   |
| Analytics and KPI observability               | `supporting` | New linkage analytics, if added, must be first-party, title-free, and use typed status/cadence/source values with unknown fallback.                                                                                           | analytics code/tests or explicit no-new-event rationale | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no Stripe, checkout, entitlement, catalog, billing portal, refund, invoice, payout, or revenue flow.                                                                                                 | commerce scope rationale                                | `N/A`                   |
| Incident response and support operations      | `target`     | Support can diagnose why a linked weekly Micro Session program counted or did not count using redacted plan ID, habit ID, linkage status, week/date, and error class.                                                         | error/log copy + route tests                            | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: no finance provider data, billing records, invoices, refunds, payouts, entitlements, revenue reports, or reconciliation surfaces change.                                                            | finance scope rationale                                 | `N/A`                   |
| i18n operational readiness                    | `target`     | Labels and controls avoid fixed-width English assumptions for `Make recurring habit`, `Weekly program`, pause/resume copy, and completion feedback.                                                                           | responsive screenshot handoff + component markup review | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Next API routes, Supabase migrations/RLS, typed domain helpers, and existing UI tokens; add no dependency.                                                                                                       | code diff + package diff                                | `5/5`                   |
| Testing and QA automation                     | `target`     | Add/update domain, API, component, and screenshot evidence for linked/unlinked/pause/resume, weekly rollover, paused final-completion choice, shared sound, and responsive button/copy behavior.                              | targeted tests + `verify:pre-pr` + screenshot artifacts | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Store one linkage per open Micro Session/Habit pair and one check-in per completed weekly program; do not generate future rows for every planned bubble.                                                                      | migration/index review + tests                          | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Migration is additive with RLS/constraints/indexes; rollback is disabling the UI/API path plus preserving harmless extra columns/rows.                                                                                        | migration review + pre-pr/pre-merge gates               | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: `components/my-library/dryland/DrylandMicroPlanPanel.tsx` for Micro Session controls and `components/my-library/habits/HabitPerfectDayHub.tsx` for Habit cadence/action styling.
  - Keep runtime writes in API routes under `/api/my-library/dryland/micro-plans`.
  - Return updated plan state from Micro Session routes; use route refresh only when the Habit snapshot needs reload.
  - Preserve App Router server/client split and no-store mutation responses.
- TypeScript/domain contracts:
  - Add typed linkage states and request/response contracts in `lib/dryland/micro-plans.ts`.
  - Add Habit check-in provenance fields to typed Habit view models.
  - Unknown linkage/provenance values fail closed and do not count.
- Supabase/data layer:
  - Add explicit migration for `dryland_micro_plans` linkage fields and `habit_check_ins` source/provenance fields.
  - Keep RLS owner-scoped through existing table policies.
  - Add indexes/constraints for lookup and idempotency.
  - Update `types/database.ts` in the same branch.
- External services/tools:
  - No new external services, SDKs, webhooks, notification APIs, or secrets.
- UI system:
  - Reuse existing CTA classes/icons and status feedback.
  - Screenshot handoff is `after/reference` if practical, otherwise `after` desktop/mobile because this is a new control state.
- Testing:
  - Unit/domain tests for linkage helpers.
  - API route tests for create/pause/resume/count/fail-closed.
  - Component tests for visible linkage state and controls.
  - E2E or screenshot QA for Micro Sessions panel on desktop/mobile; `tests/unit/session-generator-panel.test.tsx` helper hardening is test-only and does not alter the `docs/design/session-step-surface-contract.md` renderer contract.

## Data Placement And Sync Contract

- Server-canonical data:
  - `dryland_micro_plans.id` as the active Micro Session routine identity for this first runtime slice.
  - linked `habit_id`, linkage status, linked start date, weekly-program count policy, and source session IDs/snapshots.
  - `habit_check_ins` provenance for Micro Session-generated credit.
- Local data:
  - open dialogs, pending form fields, transient success/error messages, sound preference, and bubble timer UI state only.
  - no local-only Habit credit or linkage truth.
- Sync policy:
  - create/pause/resume-counting/linkage writes use server response as source of truth.
  - failed linkage/check-in writes leave previous Micro Session blocks and Habit metrics unchanged.
  - stale active linked plans roll over to the current-week plan from existing source sessions only after ownership and linkage checks pass.
  - stale paused linked plans create the current-week plan only after explicit resume.
  - unlinked stale plans cannot block creation of a current-week plan.
  - final-unit completion while counting is paused is a server-visible choice: count after explicit resume-and-complete, or complete Micro Session only without Habit credit.
  - duplicate weekly-program completion in one Habit week updates/keeps one check-in, not multiple credits.
- Retention and sensitivity:
  - Linkage/provenance remains private member data.
  - Existing check-ins and Micro Session history are preserved when source sessions change, Habit is paused, Habit is archived, or Micro Session is cleared.
- Cache/invalidation:
  - Mutating API responses remain `Cache-Control: no-store`.
  - Client applies returned Micro Session plan and refreshes affected private route state after Habit linkage writes where needed.

## Identity And Rename Contract

- Canonical stable ID:
  - `dryland_micro_plans.id` is the Micro Session routine identity for this slice.
  - `habit_definitions.id` is the Habit identity.
  - Check-in provenance stores typed Micro Session source references, not titles.
- Human-readable identifiers:
  - Micro Session title, Habit title, source session titles, and button labels are editable/display-only and never linkage keys.
- Mutability rules:
  - Renaming Micro Session or Habit preserves linkage.
  - Editing source sessions updates future queued content only and preserves completed/skipped history and historical credit.
  - Pause/resume changes future counting state only.
- Rename vs repurpose:
  - Rename is allowed when the real-world routine is still the same.
  - Materially repurposing a linked Micro Session is out of scope for automatic handling; future work needs explicit warning/unlink/relink.
- Compatibility contract:
  - Existing Micro Sessions and Habits remain unlinked by default.
  - Unknown linkage/provenance values render generic unsupported/recovery copy and do not count.
- Observability and repair:
  - Server errors should identify redacted plan ID, habit ID, linkage state, date, and error class where logged.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Micro Session source kinds, block target types, release modes, plan statuses, linkage statuses, Habit modes, count policies, check-in provenance sources, Calendar comparison meanings, analytics values, support labels, and locale strings.
- Source of truth:
  - Linkage/count eligibility derives from typed server data, not UI text, title, localStorage, or transient current-plan rebuild state.
- Additive behavior:
  - New source sessions inside the same plan can remain linked when the same Micro Session plan identity is preserved.
  - New unlinked Micro Sessions continue to work as ordinary Micro Sessions.
- Explicit mapping requirements:
  - New Habit modes, count policies beyond weekly binary build habits, new linkage states, Perfect Day automatic rules, exports, analytics dashboards, and reminder/notification flows require explicit mapping and tests.
- Unknown or deprecated values:
  - Unknown plan status, linkage status, Habit mode, count policy, source kind, or provenance source fails closed for positive Habit metrics and shows retry/recovery copy where user-visible.
- Test/evidence:
  - Include fixtures for unlinked one-off, make-recurring, incomplete program, complete weekly program, duplicate completion, undo after completion, pause, paused final-completion choice, completed-while-paused then same-week resume, resume-current-week, stale active week rollover, stale paused week resume renewal, archived Habit, cross-owner denial, missing source, stale client date denial, and unknown linkage/provenance value.

## Scope

- Add additive Supabase migration and generated TypeScript database types.
- Add typed Micro Session/Habit linkage helpers and route contracts.
- Update Micro Session create/patch/load paths to expose linkage state.
- Add explicit `Make recurring habit`, pause/resume linkage, and weekly-program completion status UI to Micro Sessions panel.
- Add safe weekly rollover/renewal for active linked plans, stale paused resume renewal, and unlinked stale-plan non-blocking behavior.
- Add unlinked/manual week rollover cleanup so stale weeks close automatically and the new week starts from a clean `Repeat this week` / `Choose sessions` surface.
- Add paused final-completion prompt/choice so users can resume counting and complete the Habit at the moment the last unit is completed.
- Align Micro Sessions completion sound to the same calm Habits sound profile.
- Polish visible Micro Sessions/Habit link copy, button widths/heights, and Ordered-mode repeated-set actions inside the existing panel.
- Add server-side Habit definition creation and idempotent check-in provenance for completed weekly Micro Session programs.
- Add the minimal existing account-export provenance fields needed so exported Habit check-ins can identify Micro Session-generated credit without adding a new export surface.
- Update tests for domain, API, component, calendar/source semantics where affected.
- Update Help/Guide/support docs if product labels or recovery behavior are discoverable there.
- Update parent/queue/design inventory only if they need runtime-state alignment after implementation.

## Out Of Scope

- Automatic Habit creation without user opt-in.
- Automatic backfill of old Micro Sessions or paused weeks.
- Automatic midnight positive/negative check-in writes.
- Automatic Perfect Day linkage beyond existing Habit check-in semantics.
- Reminders, notifications, new export surfaces, broad export redesign, broad graphs/dashboard changes, hard delete, persistent Micro Sessions timer telemetry, global/server sound preferences, user-selected/uploaded sounds, or new external services.
- Habits timed target auto-pause/save, timed `Finish` placement, timed completion undo, global Habits completion message cleanup, and all-Habits streak-copy cleanup are deferred to the direct follow-up brief.
- Manual `Repeat next week` / future-week scheduling is out of scope for this slice; it needs a separate future-state contract if selected later.
- Building a new reusable routine/entity system beyond existing `dryland_micro_plans` identity.
- Merge to `main` without explicit owner approval.

## Acceptance Criteria

1. An unlinked Micro Session remains fully runnable and does not affect Habits.
2. User can explicitly create a linked weekly build Habit from an active Micro Session with title and start date.
3. Linked Micro Session UI clearly shows whether it counts toward the Habit, is paused, or needs recovery.
4. Completing every non-archived unit in the linked weekly Micro Session creates at most one Habit check-in for the eligible week.
5. Paused linkage keeps existing Micro Session bubbles executable but prevents new Habit credit and new habit-driven weekly renewal unless the user explicitly chooses resume-and-complete on the final unit.
6. Resuming linkage restarts future counting and creates/uses the current-week Micro Session when the prior linked plan is stale, without backfilling paused weeks or work completed while paused.
7. Active linked weekly rollover closes stale prior-week Micro Sessions and creates the current week's Micro Session from the same source sessions without backfilling missed weeks.
8. Unlinked stale Micro Sessions close/archive automatically at week rollover, do not auto-create new work, and expose a clean `Repeat this week` / `Choose sessions` start state.
9. Habit credit uses plan/week eligibility and cannot be shifted into the wrong week by a stale client date.
10. Archived/ended Habit does not move Micro Session history and does not keep counting future Micro Session completions.
11. Source edits/update-current preserve completed/skipped Micro Session history and historical Habit credit.
12. Cross-owner, unauthenticated, stale, schema-missing, unsupported mode/status, missing source, and duplicate-count paths fail closed with deterministic errors.
13. Calendar comparison remains explainable: Habits count check-ins; Micro Sessions count micro blocks, with provenance preventing hidden duplicate meaning.
14. Changed UI passes screenshot handoff before `verify:pre-pr`.
15. `npm run lint:briefs`, targeted tests, `npm run verify:pre-pr`, CI, and `npm run verify:pre-merge` pass before merge readiness.

## Help / Guide Impact

Required if product Help/Guide surfaces mention Habit tracking, Micro Sessions, `Make recurring habit`, pause/resume, or recovery behavior. If no such Help/Guide surface exists, record the route/label/support sweep evidence and explicit N/A rationale in closeout.

Sweep result for this implementation: no separate product Help/Guide surface was found for Micro Sessions recurring Habit linkage. Support-facing behavior is documented in `docs/api-contracts.md`, `docs/user-flow-map.md`, `docs/design/notice-empty-state-pattern-inventory.md`, the Habits parent, and the canonical AW-006 queue. A future in-app Help/Guide article becomes required if this feature gets a visible help center entry, support workflow, or operator recovery action.

## Route / Label / Support Surface Sweep

Required before broad gates because this adds user-facing labels/actions and recovery copy.

- Identifiers searched:
  - The labels/actions/status text below were searched after final copy changes, including the owner-approved `Create Habit` and `Resume tracking + complete Habit` wording.
- Search identifiers:
  - `Micro Sessions`
  - `Make recurring habit`
  - `recurring habit`
  - `Counts toward`
  - `Pause habit`
  - `Resume habit`
  - `Pause counting`
  - `Resume counting`
  - `Complete Micro Session only`
  - `Resume tracking + complete Habit`
  - `New Weekly Habit`
  - `Weekly Micro Sessions`
  - `Repeat this week`
  - `Choose sessions`
  - `Week complete`
  - `Micro session paused`
  - `Habit ended`
- Surfaces checked:
  - `app/`, `components/`, `tests/`, `docs/`, `docs/runbooks/`, task briefs, scripts/config when relevant.
- Directories/surfaces checked:
  - Runtime API/routes, shared domain helpers, component copy, unit/component/API tests, API contracts, user-flow docs, design inventory, parent briefs, follow-up brief, and migration/type surfaces.
- Evidence:
  - Record changed files, intentional leftovers, and targeted tests in the checkpoint log and PR handoff.
- Fallout handled:
  - No separate Help/Guide article exists for this behavior; fallout is handled in API docs, user-flow docs, design inventory, parent/queue briefs, component tests, and route tests. Future Help/Guide article requires an explicit mapping/update.

## Validation

- Failure-mode evidence:
  - No unexpected 500 paths are expected in scope. API/server failure-mode coverage asserts fail-closed responses for unauthenticated, cross-owner, missing source, archived/ended Habit, stale client date, duplicate credit, schema-missing, stale plan update, and unsupported linkage/status paths.
- Screenshot/debug evidence:
  - Screenshot handoff followed `docs/runbooks/ui-debug-hypothesis-and-handoff.md`; the owner reviewed the actual consumed artifacts in `output/micro-sessions-recurring-habit-runtime-2026-06-08-110942` before broad gates. No repeated high-cost UI/export debug issue remained after the final owner-approved handoff.
- `npm run lint:briefs`
- Targeted unit/domain/API/component tests:
  - `./node_modules/.bin/vitest run tests/unit/dryland-micro-plans.test.ts tests/unit/dryland-micro-plan-routes.test.ts tests/unit/dryland-micro-plan-panel.test.tsx tests/unit/habits.test.ts tests/unit/habits-routes.test.ts tests/unit/habits-server.test.ts tests/unit/habit-perfect-day-hub.test.tsx tests/unit/my-library-calendar-comparison.test.ts tests/unit/user-export-payload.test.ts`
- Relevant Playwright/screenshot QA for `/my-library/dryland` responsive states.
- `npm run verify:pre-pr`
- CI required checks green.
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-06-08`: Brief created from clean synced `main@0e9fe35f` after fresh scope audit. Next: implement additive schema/types and linkage helpers.
- `2026-06-08`: Implemented additive Supabase migration/types for `micro_session_habit_links` and Habit check-in provenance; added typed linkage/domain helpers; updated Micro Session API create/patch/load paths, panel controls, Calendar comparison copy, API docs, user-flow docs, parent/queue/design inventory, and existing account-export provenance fields. Next: screenshot handoff before broad PR gates.
- `2026-06-08`: Targeted validation passed: `npm run typecheck`; `./node_modules/.bin/vitest run tests/unit/dryland-micro-plans.test.ts tests/unit/dryland-micro-plan-routes.test.ts tests/unit/dryland-micro-plan-panel.test.tsx tests/unit/habits.test.ts tests/unit/habits-routes.test.ts tests/unit/habits-server.test.ts tests/unit/habit-perfect-day-hub.test.tsx tests/unit/my-library-calendar-comparison.test.ts tests/unit/user-export-payload.test.ts` (`9` files, `177` tests). Next: route/label/support sweep, brief lint, responsive screenshot handoff.
- `2026-06-08`: Route/label/support sweep completed for `Make recurring habit`, `Counts toward`, `Pause habit`, `Resume habit`, `Habit paused`, `Linked Habit`, `Micro Session habit linkage`, `micro_session_habit_links`, `source_dryland_micro_plan_id`, and `source_micro_block_id` across `app`, `components`, `tests`, `docs`, `lib`, `types`, and `supabase`. Findings were expected runtime/test/schema/docs hits; no standalone Help/Guide article exists for this behavior, so Help/Guide is N/A beyond updated API/user-flow/design/parent/queue docs. Next: `npm run lint:briefs`, screenshot handoff.
- `2026-06-08`: Brief lint passed with `npm run lint:briefs:all` after diff-mode `npm run lint:briefs` reported no changed tracked briefs because the new active brief is still untracked before commit. Next: screenshot handoff.
- `2026-06-08`: Owner corrected the counting rule before PR gates: linked Habit should represent the whole weekly Micro Session program, not daily/weekly cadence frequency. Updated runtime scope so the linked weekly build Habit auto-completes only when every non-archived unit is `completed`, `skipped` units do not count, and undo removes only the auto-generated Micro Session Habit credit for that plan/week. Targeted validation passed: `npm run typecheck`; `./node_modules/.bin/vitest run tests/unit/dryland-micro-plans.test.ts tests/unit/dryland-micro-plan-routes.test.ts tests/unit/dryland-micro-plan-panel.test.tsx tests/unit/habits.test.ts tests/unit/habits-routes.test.ts tests/unit/habits-server.test.ts tests/unit/habit-perfect-day-hub.test.tsx tests/unit/my-library-calendar-comparison.test.ts tests/unit/user-export-payload.test.ts` (`9` files, `179` tests); `npm run lint:briefs:all`. Next: refreshed screenshot handoff before broad PR gates.
- `2026-06-08`: Responsive screenshot handoff refreshed in `output/micro-sessions-recurring-habit-runtime-2026-06-08-084531` for unlinked desktop, weekly-program create form mobile, linked desktop, and paused mobile. Visual states were rendered through a temporary typed fixture route using the real `DrylandMicroPlanPanel` because the configured Supabase environment does not yet contain the new migration; the route was removed before handoff. Runtime behavior remains covered by migration, typecheck, and targeted unit/API/component tests. Next: owner screenshot approval before `npm run verify:pre-pr`.
- `2026-06-08`: Owner flagged button hierarchy and mobile width/padding in the screenshot handoff. Updated Micro Session UI to keep primary CTA styling for true primary actions only, use a lighter selected-state for `Ordered`/`Bubbles`, use green outline actions for linked Habit status-card pause/resume, and reduce mobile nested padding on the Micro Session cards. Validation passed: `npm run typecheck`; `./node_modules/.bin/vitest run tests/unit/dryland-micro-plan-panel.test.tsx`; targeted package `./node_modules/.bin/vitest run tests/unit/dryland-micro-plans.test.ts tests/unit/dryland-micro-plan-routes.test.ts tests/unit/dryland-micro-plan-panel.test.tsx tests/unit/habits.test.ts tests/unit/habits-routes.test.ts tests/unit/habits-server.test.ts tests/unit/habit-perfect-day-hub.test.tsx tests/unit/my-library-calendar-comparison.test.ts tests/unit/user-export-payload.test.ts` (`9` files, `179` tests). Refreshed screenshot artifacts in `output/micro-sessions-recurring-habit-runtime-2026-06-08-085528`; temporary fixture route removed before handoff. Next: owner screenshot approval before `npm run verify:pre-pr`.
- `2026-06-08`: Owner added product decisions before implementation closeout: weekly Micro Sessions should roll over automatically for active linked Habit counting, paused linked plans should not create new weeks until resume, unlinked stale plans should not block a new week, final completion while counting is paused needs an explicit resume-and-complete choice, same-week resume must not retro-count work completed while paused, Micro Sessions and Habits should share the same calm completion sound, and several Micro Sessions copy/layout issues remain in scope. Captured direct follow-up brief for Habits timer/copy cleanup at `docs/task-briefs/planned/2026-06-08-aw-006-habits-timer-completion-copy-polish-10-10.md`. Next: implement the refreshed Micro/Habit runtime scope after owner says `kjor`.
- `2026-06-08`: Owner accepted the recommended manual-week UX: no `Repeat next week` future scheduling in this slice; completed weeks stay as `Week complete` until week boundary; unlinked stale weeks close automatically and the new week starts clean with `Repeat this week` / `Choose sessions`; active linked Habits auto-create the new week and paused linked Habits wait for `Resume counting`. Next: implement after owner says `kjor`.
- `2026-06-08`: Implemented refreshed runtime/UI scope: API now rejects stale unit updates, guards Habit credit to the Micro plan week, renews stale active/paused linked plans on `Resume counting`/return, archives stale manual weeks before new manual create, and supports explicit final-unit `Resume counting & complete Habit` vs `Complete Micro Session only`. Micro UI now uses `New Weekly Habit`, default `Weekly Micro Sessions`, shorter linked/paused copy, equal mobile button rows, one ordered `Complete next` action with reps/kg, clean stale manual `Repeat this week` / `Choose sessions`, and the same calm `softSuccessChime` profile as Habits. Validation passed: `npm run typecheck`; `npm run lint:briefs:all`; `./node_modules/.bin/vitest run tests/unit/dryland-micro-plans.test.ts tests/unit/dryland-micro-plan-routes.test.ts tests/unit/dryland-micro-plan-panel.test.tsx tests/unit/client-sound.test.ts tests/unit/habits.test.ts tests/unit/habits-routes.test.ts tests/unit/habits-server.test.ts tests/unit/habit-perfect-day-hub.test.tsx tests/unit/my-library-calendar-comparison.test.ts tests/unit/user-export-payload.test.ts` (`10` files, `187` tests). Next: refreshed screenshot handoff before `npm run verify:pre-pr`.
- `2026-06-08`: Owner flagged desktop exercise completion button width. Updated ordered-mode action column so `Complete next` buttons have equal width per desktop row context while remaining full-width on mobile. Validation passed: `npm run typecheck`; `./node_modules/.bin/vitest run tests/unit/dryland-micro-plan-panel.test.tsx tests/unit/client-sound.test.ts` (`2` files, `32` tests). Refreshed screenshot artifacts in `output/micro-sessions-recurring-habit-runtime-2026-06-08-103208`; temporary fixture route removed and local dev server stopped. Next: owner screenshot approval before `npm run verify:pre-pr`.
- `2026-06-08`: Owner flagged `Complete next` readability. Updated only the ordered-mode unit completion buttons so detailed task text is left-aligned while ordinary CTA buttons remain centered; added component-test coverage for the `text-left` class and DOM-checked `flex-start`/left text offset on mobile. Validation passed: `npm run typecheck`; `./node_modules/.bin/vitest run tests/unit/dryland-micro-plan-panel.test.tsx tests/unit/client-sound.test.ts` (`2` files, `32` tests). Refreshed screenshot artifacts in `output/micro-sessions-recurring-habit-runtime-2026-06-08-104814`; temporary fixture route removed and local dev server stopped. Next: owner screenshot approval before `npm run verify:pre-pr`.
- `2026-06-08`: Owner refined mobile `Complete next` readability. Updated detailed ordered-mode completion labels so mobile renders `Complete next:` on its own first line with `Set / reps / kg` below, while desktop keeps the single-line label. Validation passed: `npm run typecheck`; `./node_modules/.bin/vitest run tests/unit/dryland-micro-plan-panel.test.tsx tests/unit/client-sound.test.ts` (`2` files, `32` tests). Refreshed screenshot artifacts in `output/micro-sessions-recurring-habit-runtime-2026-06-08-105303`; temporary fixture route removed and local dev server stopped. Next: owner screenshot approval before `npm run verify:pre-pr`.
- `2026-06-08`: Owner approved copy refinement for Habit create and paused-final prompt. Updated the New Weekly Habit submit action from `Link Habit` to `Create Habit`; changed the paused-final prompt to `This completes this week's Micro Session. Habit tracking is paused. Resume tracking to complete the Habit too.` and the primary action to `Resume tracking + complete Habit`. Validation passed: `npm run typecheck`; `./node_modules/.bin/vitest run tests/unit/dryland-micro-plan-panel.test.tsx tests/unit/client-sound.test.ts` (`2` files, `32` tests). Refreshed screenshot artifacts in `output/micro-sessions-recurring-habit-runtime-2026-06-08-110942`; temporary fixture route removed and local dev server stopped. Next: owner screenshot approval before `npm run verify:pre-pr`.
- `2026-06-08`: Owner approved screenshot handoff and merge on good tests. First `npm run verify:pre-pr` stopped on expected Supabase migration drift: linked project `freeswimming-org-prod` had not yet received `20260608103000_micro_sessions_recurring_habit_links.sql`. Applied exactly that migration with `npx supabase db push --linked`; post-apply dry-run reported `Remote database is up to date`; sequential `npx supabase migration list --linked` showed local/remote parity. Ran linked typegen, then scoped `types/database.ts` back to only the migration-owned additions (`habit_check_ins` provenance fields and `micro_session_habit_links`) to avoid unrelated remote schema/order churn. Next: rerun `npm run verify:pre-pr`.
- `2026-06-08`: `npm run verify:pre-pr` passed after the Supabase migration apply and brief evidence updates. Full lane covered branch-current, linked Supabase dry-run, quality gates, lint, typecheck, `230` unit-test files (`1429` tests), build, perf budgets (`PASS`, tighten recommendation `hold`), and Playwright (`106 passed`, `530 skipped` in public/dev-login-unavailable paths). Next: commit, push, open/update PR, monitor CI, then run `npm run verify:pre-merge`.

## Completion Record

- `completed`: `2026-06-08`
- `merged_pr`: `#1017`
- `squash_commit`: `619039c9`
- `result`: Shipped explicit Micro Sessions to weekly Habit linkage. Users can keep Micro Sessions as one-off work, opt into a weekly Habit, pause/resume Habit counting, complete the final unit with a paused-Habit choice, and get current-week renewal without backfilling paused or stale history.
- `validation`: `npm run verify:pre-pr` PASS on commit `00f46726` (`230` unit files, `1429` tests, build, perf PASS, Playwright `106 passed`/`530 skipped`); CI green for PR `#1017` including `verify` PASS (`5m43s`), `size-check`, `deploy-preview`, `e2e-smoke`, `site-lock-smoke`, CodeQL, Analyze, and Vercel; `npm run verify:pre-merge` PASS before merge.
- `screenshot_artifacts`: `output/micro-sessions-recurring-habit-runtime-2026-06-08-110942`
- `10/10 claim`: yes - all critical target categories reached `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                              | Gaps / Notes |
| --------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | explicit opt-in UI, weekly-program Habit rule, component/API tests, PR `#1017`                        | none         |
| UX flow clarity                               | `5/5`          | pause/resume, stale-week, final paused-completion choice tests and screenshot handoff                 | none         |
| Visual design quality                         | `5/5`          | owner-approved screenshot artifacts `output/micro-sessions-recurring-habit-runtime-2026-06-08-110942` | none         |
| Business logic correctness and data integrity | `5/5`          | migration constraints, idempotent provenance, stale/date/duplicate/cross-owner tests                  | none         |
| Accessibility (a11y)                          | `5/5`          | labeled controls, focus/status behavior covered by component tests and screenshot review              | none         |
| Data placement and sync boundaries            | `5/5`          | server-canonical linkage/check-in writes, local-only dialogs/sound, no-store route responses          | none         |
| Reliability and failure handling              | `5/5`          | negative-path API tests for schema, stale, archived, missing source, unsupported states               | none         |
| Security and authz                            | `5/5`          | owner-scoped route tests for unauthenticated/cross-owner writes                                       | none         |
| Privacy and compliance                        | `5/5`          | title-free analytics/provenance, no secrets, export provenance scoped to existing export              | none         |
| Content governance                            | `5/5`          | API/user-flow/design docs plus follow-up brief updated; brief lint and quality gates passed           | none         |
| Incident response and support operations      | `5/5`          | redacted plan/habit/week/error diagnostics in brief/API failure coverage                              | none         |
| i18n operational readiness                    | `5/5`          | responsive copy/button tests and screenshots avoid fixed-width assumptions                            | none         |
| Stack-fit and dependency discipline           | `5/5`          | existing Next routes, Supabase migration/RLS, typed helpers, UI tokens; no dependency added           | none         |
| Testing and QA automation                     | `5/5`          | targeted tests, full `verify:pre-pr`, CI `verify`, and `verify:pre-merge` passed                      | none         |
| DevOps and rollback readiness                 | `5/5`          | additive migration, remote dry-run parity, rollback by disabling UI/API path                          | none         |
