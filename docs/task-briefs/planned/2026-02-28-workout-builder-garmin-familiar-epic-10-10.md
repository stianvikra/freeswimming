# Task Brief: Workout Builder Garmin-Familiar Epic (10/10)

## Metadata

- `id`: `2026-02-28-workout-builder-garmin-familiar-epic-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-02-28`
- `updated`: `2026-03-22`

## Goal

Deliver a Garmin-familiar workout creation, generation, planning, history, and export ecosystem in FreeSwimming that is easy to use for swimmers, commercially useful, and technically compatible with future Garmin Training API delivery and later activity-history reconciliation.

## Product Positioning And UX Direction

- Use **Garmin-familiar interaction patterns** (steps, repeats, distance/rest, pool size, notes, `open`/lap-button steps, and swim-stroke targeting), while keeping observed Garmin Connect UI labels separate from confirmed public developer semantics.
- Do **not** clone Garmin branding/look 1:1. Keep FreeSwimming visual identity.
- Keep four product tracks explicit:
  - `manual session builder`: user-authored workouts that can later be exported or sent to Garmin,
  - `automatic generator`: goal-based session/program creation that starts with an explicit planning-horizon choice and produces drafts for review/editing,
  - `manual program builder`: weekly scheduling and calendar planning for saved workouts,
  - `training history`: completed/cancelled outcomes, comments, and later retrospective review.
- Optimize for:
  - quick workout creation,
  - generator intake before AI/session creation when My Library context exists,
  - explicit planning-horizon choice from one session to fixed-duration, custom date-range, and competition-date programs,
  - explicit peak/taper intent when a competition-date horizon is chosen,
  - poolside execution,
  - threshold-based swim-zone targeting from supported threshold tests,
  - clear separation between planned schedule state and historical outcome state,
  - future export compatibility,
  - upsell paths (coaching/products) without harming lesson UX.

## Scope Orchestration

This epic is split into dedicated briefs for delivery quality and rollback safety:

1. `2026-02-28-workout-data-contract-and-step-engine-10-10.md`
2. `2026-02-28-drill-library-templates-and-favorites-10-10.md`
3. `2026-02-28-workout-builder-and-poolside-execution-10-10.md`
4. `2026-02-28-program-builder-calendar-completion-10-10.md`
5. `2026-03-19-my-library-generator-intake-and-prefill-foundation-10-10.md`
6. `2026-02-28-ai-plan-generator-json-guardrails-10-10.md`
7. `2026-03-20-ai-session-generator-v1-garmin-minimum-draft-review-10-10.md`
8. `2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
9. `2026-02-28-workout-export-adapters-garmin-ready-pdf-10-10.md`
10. `2026-02-28-workout-commercial-analytics-funnel-10-10.md`
11. `2026-02-28-garmin-training-api-partner-integration-10-10.md` (`blocked` until partner/API readiness)

## Out Of Scope (Current)

- Full Strava integration (explicitly deferred for now).
- Garmin Health detailed biometrics ingestion.
- Multi-tenant coach/club architecture.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold                                                                                                  | Evidence                              |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Product goals and IA                          | `target`     | Epic-level IA keeps builder, planner, AI, export, and admin governance aligned to one coherent workout model.     | epic architecture + child briefs      |
| UX flow clarity                               | `target`     | Create runnable workout in <= 2 minutes median across the completed epic flow.                                    | e2e + timed manual QA                 |
| Visual design quality                         | `target`     | Garmin-familiar interaction with FreeSwimming brand consistency across mobile/desktop.                            | design QA matrix                      |
| Business logic correctness and data integrity | `target`     | Deterministic step math, stable entity identity, and validated write paths across all slices.                     | unit + integration tests              |
| Admin editor ergonomics                       | `supporting` | Supporting only: high-frequency admin ergonomics are owned by drill/template/admin child slices.                  | child-brief scope rationale           |
| Accessibility (a11y)                          | `supporting` | Supporting only: accessibility is enforced per child UI slice and must not be skipped in epic completion.         | child-brief requirements              |
| Performance (CWV + payloads)                  | `target`     | No material regressions on `/course`, builder routes, and admin workflows across merged slices.                   | verify + budget checks                |
| Data placement and sync boundaries            | `target`     | All child slices use one explicit local-vs-server ownership model for workout/program state.                      | epic contract + child brief review    |
| Caching and invalidation strategy             | `supporting` | Supporting only: deterministic invalidation is required in child slices that ship stateful reads/writes.          | child-brief requirements              |
| Reliability and failure handling              | `target`     | Builder/planner/AI/export flows provide retry/recovery paths and avoid ambiguous partial state.                   | child-slice e2e + failure coverage    |
| Security and authz                            | `target`     | All write paths are role-gated/authenticated where needed and fail closed.                                        | negative-path API tests               |
| Privacy and compliance                        | `supporting` | Supporting only: no child slice may leak sensitive prompt, progress, or telemetry payloads.                       | child-brief requirements              |
| Content governance                            | `target`     | Canonical workout/drill/template/program ownership and rename-safe identity rules are defined before buildout.    | linked identity contracts             |
| Admin workflow and editability                | `target`     | Admin can manage drill/template data without code edits and with safe lifecycle/governance.                       | admin e2e                             |
| SEO and crawlability                          | `supporting` | Supporting only: public metadata/crawlability is enforced only on slices that add public workout pages.           | scope rationale + child briefs        |
| AI discoverability                            | `supporting` | Supporting only: AI discoverability depends on later public surfaces, not the epic orchestration itself.          | scope rationale                       |
| Analytics and KPI observability               | `target`     | Funnel and completion metrics emit deterministically with stable taxonomy across slices.                          | event tests + dashboard checks        |
| Commerce and revenue ops                      | `supporting` | Supporting only: upsell/support actions must remain configurable and trackable without breaking entitlement flow. | QA + analytics review                 |
| Incident response and support operations      | `supporting` | Supporting only: support/runbook expectations must exist for critical builder/planner/AI failures.                | child-brief runbook requirements      |
| Finance and reporting operations              | `supporting` | Supporting only: no direct finance reconciliation change unless a child slice touches commerce flows.             | scope rationale                       |
| i18n operational readiness                    | `supporting` | Supporting only: child slices must avoid hard-coding models/copy that block later localization.                   | child-brief requirements              |
| Stack-fit and dependency discipline           | `target`     | Epic delivery uses stack-native patterns first and avoids unnecessary dependency growth across slices.            | package diff + architecture review    |
| Testing and QA automation                     | `target`     | Each slice ships with unit + targeted e2e coverage and green required gates.                                      | CI                                    |
| Scalability and cost efficiency               | `supporting` | Supporting only: child slices must avoid runaway save, generation, export, or analytics cost patterns.            | architecture review + child briefs    |
| DevOps and rollback readiness                 | `target`     | Each slice documents migration/rollback path so epic rollout remains reversible.                                  | child release notes + rollback checks |

## Data Placement And Sync Contract (Required)

- Server-canonical:
  - drills, templates, workouts, plans, training-history/completion records, export job state.
- Local-only:
  - transient editor state, temporary unsaved drafts.
- Sync policy:
  - explicit save/autosave with server acknowledgement,
  - deterministic refresh after mutation,
  - conflict handling: server wins + explicit re-edit flow.

## Identity And Rename Contract (Epic-Level Guardrail)

- Every child brief that introduces persisted or linkable entities must define:
  - canonical stable ID vs human-readable slug/title/label,
  - immutable/write-once vs renameable fields,
  - `rename` vs `repurpose` operator policy,
  - legacy alias/redirect/read-through behavior where old identifiers may still be read.
- Workout/program-builder entities must not use display order, week/day position, or editable labels as canonical identity.
- Reordering a workout/program/calendar item must change ordering fields only, not canonical IDs.
- AI/import/export flows may generate or transform content, but must not silently rewrite canonical IDs for existing persisted entities.

## Acceptance Criteria

- All implementation slice briefs that persist workout/program entities include an explicit identity-and-rename contract before implementation starts.

## Milestones

1. Data contract + drill/template foundation.
2. Manual workout/session builder + poolside experience.
3. Manual program builder/calendar/completion.
4. Generator intake/prefill bridge from My Library context.
5. AI session/program generation across explicit horizons:
   - `session` first, with explicit pool/open-water choice, supported pool lengths, session intent, effort preset, and time/distance targeting,
   - `week`,
   - `month`,
   - `three_months`,
   - `six_months`,
   - `twelve_months`,
   - `date_range`,
   - `to_competition_date` with explicit peak/taper intent.
6. Training history/completion foundation with manual done/cancel/comments and later Garmin Activity API reconciliation hooks.
7. Export adapters (Garmin-ready format + PDF).
8. Commercial analytics and conversion hooks.
9. Garmin partner integration when unblocked.

## Success KPIs

- median time to first complete workout <= 2 minutes.
- template/favorite reuse >= 70% of active builder users after stabilization.
- measurable conversion lift on support/coaching CTA placement.

## Validation Gate

- per implementation slice: `npm run verify:pre-pr`
- before merge recommendation: `npm run verify:pre-merge`

## Checkpoint Log

- `2026-03-19 | planning | clarified epic product split into manual builder/program track, generator-intake bridge, and AI generator track so future 10/10 briefs and implementation slices do not blur authoring, generation, export, and Garmin responsibilities | next: request owner detail later on exact AI session/program generator scope before turning planned briefs into implementation sequence`
- `2026-03-20 | planning | expanded the epic into four explicit product tracks (manual session builder, automatic generator, manual program builder, and training history), aligned the contract to threshold-based swim zones, and separated Garmin Training API send from later Garmin Activity API history reconciliation | next: update child briefs and use the new training-history brief as the parent track for done/cancel/comments and retrospective evaluation`
- `2026-03-20 | planning | expanded the automatic-generator direction so users can explicitly choose `session`, `week`, `month`, `three_months`, `six_months`, `twelve_months`, `date_range`, or `to_competition_date`, and made competition-date planning carry explicit peak/taper intent rather than hidden logic | next: keep the AI generator, data contract, builder handoff, and history briefs aligned to the same plan-intent metadata before implementation starts`
- `2026-03-20 | planning | tightened the first generator milestone around one editable AI session draft with explicit pool/open-water, pool-length, duration, session-intent, and effort choices so the epic proves the canonical workout model before expanding into larger program horizons | next: add and use a dedicated AI session generator v1 brief before broader program-generation implementation starts`
- `2026-03-22 | planning | tightened the epic-level Garmin-familiar contract after reviewing manual Garmin swim-builder patterns so downstream briefs now need explicit support for confirmed public Garmin semantics like `WorkoutIntensity`, `open`, `swim_stroke`, and swim sub-sport plus explicit mapping of Connect-UI labels like `Main`, lap-button, `Choice`, and `RIMO` before the planner track becomes the next major implementation focus | next: continue the manual workout-builder track before the weekly calendar/program-builder track`

## Completion Criteria For Epic

- All planned slice briefs merged (or explicitly deferred with owner/date).
- Blocked Garmin brief either unblocked and started or recorded with concrete unblock prerequisites.
