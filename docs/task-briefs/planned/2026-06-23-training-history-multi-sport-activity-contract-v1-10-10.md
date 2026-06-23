# Task Brief: Training History Multi-Sport Activity Contract V1 (10/10)

## Metadata

- `id`: `2026-06-23-training-history-multi-sport-activity-contract-v1-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-23`
- `updated`: `2026-06-23`
- `mode`: `plan only / docs-only architecture and interface audit`
- `parent_brief`: `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- `related_blocked_briefs`:
  - `docs/task-briefs/blocked/2026-02-28-garmin-training-api-partner-integration-10-10.md`
  - `docs/task-briefs/blocked/2026-06-21-garmin-activity-reconciliation-and-review-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-23`
- `base`: `main@db7da479`
- `audit_status`: `ready`
- `decision`: Use this brief as the prerequisite contract before the generic activity data/model foundation, retrospective evaluation, Stats activity mapping, provider reconciliation, or broad history UI work so training history is not locked to swimming-only assumptions.
- `reason`: Local audit found provider evidence already accepts generic activity metadata, while manual actual history, Calendar completion, Review Actual, and Stats copy are still swim-plan-oriented. Garmin Activity API is explicitly multi-activity, including running, cycling, swimming, yoga, and strength training, and FIT activity files are forward-compatible across sport/fitness data.
- `must_refresh_before_execution_if`: Refresh if `completed_activity_events`, provider-evidence schema/helpers, Calendar Plan/Stats routes, Review Actual editor, workout/program identity, dryland/micro-session history, Garmin official docs, scorecard categories, or verification lanes change before execution.

## Goal

Define the 10/10 multi-sport training-history contract that future implementation must satisfy before FreeSwimming stores, reviews, compares, reconciles, exports, or evaluates activity history beyond swim-only planned sessions.

## Pre-Implementation Owner Explanation

Codex skal lage en plan, ikke runtime-kode, for hvordan treningshistorikk skal fungere for flere aktiviteter enn svomming. Det betyr noe fordi Garmin og senere helse-/aktivitetskilder kan gi lop, sykkel, gange, styrke, yoga og svomming, og appen ma kunne lese dette uten dobbeltelling eller stille overskriving. Utenfor scope na er migrasjoner, UI-endringer, Garmin OAuth/import, provider matching, AI-retrospektiv og Stats-telling.

## Product Decision

Recommendation: do not build retrospective evaluation or provider reconciliation on top of the current swim-only actual-history surface.

Preferred sequence:

1. This docs-only contract brief.
2. A future data/model foundation child that introduces a generic activity-history contract before broad UI.
3. A future mapping child that adapts existing swim `completed_activity_events` into the generic history view-model without breaking Calendar.
4. A future Stats/Calendar activity-source child that maps swim, run, ride, walk, dryland/strength, and unsupported values explicitly.
5. Provider reconciliation and AI-retrospective children only after the generic activity contract exists.

The future data child should choose between:

- additive evolution of `completed_activity_events` only if planned/workout/program references can become optional safely and compatibility tests prove no Calendar regression; or
- a new canonical `training_activity_events` table plus a compatibility adapter from `completed_activity_events`, if a cleaner boundary is needed for unplanned/provider activities.

The implementation decision must be made in that future child after a migration/RLS/type audit. This brief records the contract and interface requirements only.

## Swimming-First Product Boundary

FreeSwimming remains a swimming-first app in the active product direction.

Do now:

- keep planned swim sessions, manual swim actuals, Review Actual, and swim-oriented Calendar behavior as the only trusted completion workflows;
- allow the future data contract to receive, preserve, or safely display non-swim provider evidence as `needs_review`, `unmapped`, or `unsupported`;
- keep walking, running, cycling, strength, yoga, mobility, health metrics, and multi-sport activities out of swim completion totals until an explicit mapping child supports them.

Do not do now:

- add manual user workflows for logging walking, running, cycling, strength, yoga, or multi-sport activities;
- turn steps, sleep, heart-rate summaries, stress, or other all-day health metrics into completed workout rows;
- build Garmin-style sport dashboards, triathlon segment views, or non-swim Stats filters;
- infer that a non-swim provider activity completes a swim plan item.

Future Garmin/health runtime gate:

- Before implementing Garmin Activity API, Health API, FIT/GPX/TCX parsing, multi-sport segment handling, or any health-context feature, create a separate bounded Garmin/health online-audit brief.
- That brief must decide Activity API vs Health API vs Training API scope, OAuth/partner readiness, attribution, privacy/export/delete/retention, source mapping, health-vs-activity separation, and which non-swim activities are shown, ignored, or held for review.

## Official Garmin Source Baseline

Checked on `2026-06-23`:

- Garmin Activity API: https://developer.garmin.com/gc-developer-program/activity-api/
- Garmin Training API: https://developer.garmin.com/gc-developer-program/training-api/
- Garmin Connect Developer Program FAQ: https://developer.garmin.com/gc-developer-program/program-faq/
- Garmin API Brand Guidelines: https://developer.garmin.com/brand-guidelines/api-brand-guidelines/
- Garmin FIT SDK overview: https://developer.garmin.com/fit/overview/
- Garmin FIT file types: https://developer.garmin.com/fit/file-types/
- Garmin FIT cookbook: https://developer.garmin.com/fit/cookbook/
- Garmin Health API: https://developer.garmin.com/gc-developer-program/health-api/

Current interpretation:

- Activity API is not swim-only. It advertises access for running, cycling, swimming, yoga, strength training, and activity details.
- Activity API data becomes available after end-user consent and Garmin Connect device sync.
- Activity API may expose FIT, GPX, and TCX files for full activity details.
- Training API is a send-to-Garmin surface for workouts and training plans; it is not completion truth.
- Developer Program APIs require business/partner approval and use OAuth 2.0.
- FIT is compact, interoperable, extensible, and forward-compatible for sport, fitness, and health-device data.
- Health API all-day metrics such as steps, heart rate, sleep, stress, and body metrics are adjacent but not the same object as discrete workout/activity history. They require a separate health-metric contract before any later use.
- Provider timestamps, local dates, time zones, raw activity labels, and units must be treated as input data that needs an explicit normalization contract before Stats, Calendar, or retrospective evaluation counts anything.
- Garmin attribution applies to Garmin-sourced and Garmin-derived displays, exports, and secondary screens.
- This baseline is sufficient for the current docs-only fallback contract. It is not sufficient to implement Garmin runtime, health context, FIT parsing, or multi-sport segment support without a fresh bounded official-doc audit.

## Current Local Interface Audit

| Surface                               | Current evidence                                                                                                                                                                                              | Multi-sport implication                                                                                                                          | Required adaptation before runtime                                                                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `completed_activity_events` migration | `supabase/migrations/20260621123000_completed_activity_events_manual_swim_completion.sql` creates required planned/workout/program refs and comments it as completed swim activity events.                    | Blocks unplanned run/ride/walk/provider activities unless refs become optional or a generic table is introduced.                                 | Future data child must define generic activity identity and migration/backfill/compatibility path.                                                    |
| Actual corrections migration          | `supabase/migrations/20260621143000_completed_activity_events_actual_corrections.sql` adds distance/duration and swim context fields `actual_environment`, pool length, and pool unit.                        | Common fields exist, but context is swim-specific. Running/cycling/walking/strength need sport-specific detail slots or typed extensions.        | Split common measured fields from sport-specific details; unknown details stay redacted/review-only.                                                  |
| Actual session snapshot               | `supabase/migrations/20260622103000_completed_activity_events_actual_session_snapshot.sql` stores corrected swim session draft.                                                                               | Swim step/repeat snapshot is valuable but not suitable for run/ride/walk/strength structures by itself.                                          | Define generic activity detail snapshot envelope with per-sport schemas and read-only fallback.                                                       |
| Completed activity helper             | `lib/my-library/completed-activity-events.ts` supports only `source_kind = manual`.                                                                                                                           | Provider/manual/system-reconciled source kinds cannot become done truth yet.                                                                     | Future child must add source-kind registry and fail-closed unknown-value tests.                                                                       |
| Calendar Plan model                   | `lib/my-library/calendar-plan.ts` groups events by `planned_workout_instance_id` and renders manual actuals only.                                                                                             | Planned swim Calendar can remain plan-linked, but multi-sport history needs unplanned/private activity rows too.                                 | Keep Calendar plan actions swim-plan scoped; add generic history read model separately before merging into Calendar/Stats.                            |
| Calendar completion API               | `app/api/my-library/calendar/planned-instances/[instanceId]/completion/route.ts` writes manual planned swim actuals and initializes from workout drafts.                                                      | Good reference for owner scope, idempotency, stale guards, and no plan mutation; too narrow for unplanned/provider activities.                   | Reuse authz/idempotency/stale patterns, not swim draft assumptions.                                                                                   |
| Review Actual editor                  | `app/my-library/calendar/actuals/[instanceId]/page.tsx`, `lib/my-library/review-actual.ts`, and `components/my-library/ReviewActualEditor.tsx` compare planned swim steps to editable actual swim session.    | This is the mature reference surface for planned swim actual correction only. It must not become the generic run/ride/walk editor by copy-paste. | Future UI must either adapt activity data into a shared read-only comparison contract or create sport-specific detail editors behind a generic shell. |
| Calendar Plan UI                      | `components/my-library/CalendarPlanWeekHub.tsx` names planned swim sessions, completed swim history, pool/open-water context, and plan totals.                                                                | UI labels are intentionally swim-specific today.                                                                                                 | Multi-sport labels require route-label/support sweep and screenshot handoff in any UI child.                                                          |
| Calendar Stats source filters         | `lib/my-library/calendar.ts` and `lib/my-library/calendar-comparison.ts` include `swimming` but show it unmapped until completed swim events are mapped.                                                      | Stats already has a source-filter pattern but not a generic sport taxonomy.                                                                      | Future Stats child should introduce `activity_history` or explicit sport filters with safe unknown states, not hardcode only today's sports.          |
| Provider evidence schema              | `supabase/migrations/20260622170000_provider_evidence_schema_foundation.sql` has `activity_type`, `sport_type`, `sub_sport_type`, provider key, evidence status, file kinds, duration, distance, pool fields. | This is the best current multi-sport-facing schema, but it is evidence only, not completion truth.                                               | Use it as provider evidence input, then map to canonical history only through reconciliation/review.                                                  |
| Provider fixture parser               | `lib/my-library/provider-evidence.ts` route supports provider keys broadly but manual fixture activity type constants are swim-only.                                                                          | The fixture proof is intentionally narrow; it should not be mistaken for Garmin multi-sport readiness.                                           | Future fixture/test child must add run/ride/walk/strength samples or keep them unsupported with explicit warnings.                                    |
| API contracts                         | `docs/api-contracts.md` states fixture import never writes completion truth and Review Actual edits swim-session drafts.                                                                                      | Existing docs protect data boundaries but need a multi-sport history contract before new APIs.                                                   | Update contracts only in the future implementation child that changes APIs.                                                                           |
| Support runbook                       | `docs/runbooks/auth-account-support.md` documents Calendar Plan, Review Actual, and Stats Swimming as not mapped.                                                                                             | Support knows swim history is current scope; multi-sport needs new diagnostics before launch.                                                    | Future child must update support diagnostics for activity source/sport/source-kind/fallback states.                                                   |
| Export/delete                         | `/api/user/export` already includes redacted provider evidence arrays.                                                                                                                                        | Privacy/export boundary exists for evidence, not generic completed history beyond current app data.                                              | Future history table/adapter must be included in export/delete contracts with redaction and retention rules.                                          |

## Activity Domain Contract

User's mental object:

- "A workout/activity I actually did" across swim, run, ride, walk, dryland/strength, yoga/mobility, or future provider activities.

Canonical levels:

| Level                       | Meaning                                                                                                                                                      | Future operation support                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Activity summary            | One actual activity on a date/time with source, sport, status, duration/distance where known.                                                                | `view`, `create` for manual future scope, `support-only` in this docs slice.            |
| Planned link                | Optional link to `planned_workout_instances`, workout, and program when the activity came from a plan.                                                       | `view`, `reconcile`; optional for provider/unplanned activities.                        |
| Provider evidence           | Raw/summary external activity evidence in `provider_activity_evidence`.                                                                                      | `view`, `reconcile`; never auto-counts without mapping.                                 |
| Sport detail                | Sport-specific child data, for example swim pool/laps/steps, run pace/elevation, cycling power/cadence, strength sets/reps/load, yoga duration/session type. | `view` through generic fallback first; `edit` only when a sport-specific editor exists. |
| Review/reconciliation state | How manual, planned, sent, received, and corrected records agree or conflict.                                                                                | `reconcile`; blocked for provider runtime until prerequisites exist.                    |
| Notes/attachments/raw files | Private context, files, FIT/GPX/TCX references, or comments.                                                                                                 | `support-only` or future `view`; storage/retention must be explicit.                    |

Mature reference surfaces:

- Planned swim correction: `/my-library/calendar/actuals/[instanceId]`, `ReviewActualEditor`, `lib/my-library/review-actual.ts`.
- Calendar read model: `lib/my-library/calendar-plan.ts`, `CalendarPlanWeekHub`.
- Provider evidence intake boundary: `provider_connections`, `provider_import_runs`, `provider_activity_evidence`, `lib/my-library/provider-evidence.ts`.
- Stats source pattern: `lib/my-library/calendar-comparison.ts`, `CalendarPeriodComparisonHub`.

10/10 granularity rule:

- A future generic activity UI cannot claim 10/10 if it only shows summary rows while the trusted sport object needs child details to be reviewed. If child details are unavailable, the UI must say `details unavailable` or `needs review` and exclude the row from sport-specific counts.

## Canonical Sport, Time, And Unit Contract

Raw provider values must be preserved separately from canonical app values:

- Provider raw labels: `provider_activity_type`, `provider_sport_type`, `provider_sub_sport_type`, and provider-specific strings remain evidence/raw mapping inputs.
- Canonical app taxonomy: future runtime must map raw values into typed canonical fields before counting, filtering, or display decisions.
- Display labels: user-facing sport/source labels are derived from canonical values and must not become database identity.

Minimum canonical taxonomy required before runtime:

| Canonical level   | Required behavior                                                                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Activity category | Distinguish discrete workout/activity history from health metrics, habits, plan rows, dryland templates, and provider evidence.                                                               |
| Sport             | Include at least `swimming`, `running`, `cycling`, `walking`, `strength_training`, `yoga`, `mobility`, `dryland`, and `unknown`.                                                              |
| Sub-sport         | Support explicit mapped values such as pool swim, open-water swim, treadmill run, outdoor run, indoor bike, road bike, walk, hike, strength, yoga, and unknown.                               |
| Provider alias    | Preserve provider-specific aliases such as `run`, `running`, `trail_running`, `bike`, `cycling`, `lap_swimming`, or future Garmin values until an owned mapping decides the canonical result. |
| Mapping status    | Every row must carry a mapping/review state so unmapped values cannot silently count as successful completion.                                                                                |

Unknown or ambiguous mappings:

- Unknown provider activity/sport/sub-sport values map to `unknown` plus `needs_review` or `unmapped`.
- Similar labels must not be collapsed silently. For example, hike vs walk, indoor vs outdoor, pool vs open-water, and dryland vs strength require explicit mapping or a visible unknown state.
- Future sports can render a safe summary row when common fields exist, but Stats, Calendar totals, AI evaluation, and sport-specific UI require an explicit mapping update.

Timezone and local-date policy:

- Store provider start/end timestamps as absolute instants, preferably UTC, and never use date-only provider strings as the sole identity.
- Store `activity_local_date` separately for user-facing day/week grouping.
- Derive `activity_local_date` from the provider/device timezone when trustworthy; otherwise use the user's active profile timezone at import and mark the row as lower confidence.
- Cross-midnight activities, travel-timezone activities, daylight-saving transitions, and missing timezone data must be covered by future tests before any Calendar/Stats counting.
- User timezone changes after import must not rewrite historical activity local dates without an explicit migration/recalculation decision.

Unit normalization policy:

- Persist normalized common measurements in canonical units: duration seconds, distance meters, elevation meters, power watts, cadence provider-normalized with unit label, heart rate bpm, energy kcal when available, load/reps/sets with explicit units.
- Display units, pace, speed, weekly totals, and formatted labels are derived at the edge from normalized values and user preferences.
- Provider raw unit/value pairs should remain available in redacted evidence when needed for audit, but calculations must use canonical normalized values.
- Rows with missing or inconsistent unit data stay viewable as evidence/review rows and stay out of trusted totals until resolved.

Health vs activity boundary:

- Steps, sleep, resting heart rate, stress, body battery, body weight, wellness summaries, and similar all-day metrics are not training-history activities.
- They may become future context for AI or wellness views only through a separate health-metric contract with its own privacy, retention, export/delete, and support rules.
- A health metric must not create or complete a workout/activity row unless a later brief defines an explicit, reviewable conversion rule.

## Data Placement And Sync Contract

Server-canonical future data:

- stable activity/history ID,
- owner/user ID,
- source kind (`manual`, `provider_evidence`, `system_reconciled`, future mapped values),
- sport/activity taxonomy values,
- actual start/end timestamps, `activity_local_date`, timezone provenance, duration, distance, normalized units, and common load fields where known,
- optional planned/workout/program references,
- provider evidence references and aliases where applicable,
- mapping confidence and review/reconciliation status,
- redacted sport-specific detail envelope,
- created/updated/audit timestamps.

Local-only future data:

- filters, draft edits before save, local sort/group preferences, transient review UI state.

Sync and conflict policy:

- Planned rows stay planning truth.
- Provider evidence stays evidence until review/reconciliation maps it.
- Manual actual rows remain user-edited truth unless explicitly superseded or linked.
- Unplanned provider or manual activities are valid history candidates without `planned_workout_instance_id`, `workout_id`, or `program_id`; they must not auto-create planned rows or mutate a plan.
- Unknown provider values, duplicate provider activities, missing planned links, or source disagreements fail closed to `needs_review` or `unmapped`.
- A provider re-sync must not delete manual notes, rebind planned links, or overwrite actual truth without explicit review rules.

Review-confidence statuses:

- `exact_match`: trusted link between plan/manual/provider evidence with deterministic identity or reviewed confirmation.
- `likely_match`: high-confidence candidate that still needs review before changing trusted completion totals.
- `ambiguous_match`: multiple possible plans/evidence rows or conflicting timestamps/distance/sport values.
- `unmatched`: valid activity evidence exists but has no planned/manual counterpart.
- `conflict`: two or more sources disagree on identity, sport, date, distance, duration, or completion status.
- `ignored_duplicate`: evidence is preserved for audit but excluded from trusted history and KPI totals.
- `unmapped`: provider/source/sport/sub-sport value is unknown or unsupported.

Only `exact_match` or future explicitly reviewed states may feed completion truth. All other statuses stay out of trusted Stats/KPI/AI outputs unless a later brief defines a narrower exception with tests.

Retention and sensitivity:

- Activity history is private health/fitness-adjacent data.
- Raw FIT/GPX/TCX files, OAuth tokens, provider raw payloads, and biometric detail require separate storage/secret/retention decisions before runtime.
- Export/delete must include any future canonical activity-history rows and redacted evidence references.

Cache/invalidation:

- Protected activity-history routes must be `force-dynamic`/`no-store`.
- Mutations must invalidate Calendar Plan, Stats, history detail, export, provider reconciliation, and future AI-retrospective inputs.

## Identity And Rename Contract

- Canonical stable ID: future generic activity/history ID, immutable after create.
- Provider IDs: foreign aliases only; never primary app identity.
- Planned IDs: optional references to intended plan rows, not required for provider/unplanned activities.
- Human-readable labels: titles, sport labels, and source names are presentation only and may change.
- Rename vs repurpose: renaming a workout/program keeps old history linked; materially repurposed planned/workout objects require new canonical entities before future history attaches.
- Compatibility: existing `completed_activity_events` swim rows must either be backfilled/read through a generic adapter or kept as a compatibility source until migration is complete.
- Repair: orphan activities, duplicate provider aliases, unknown taxonomy values, and stale planned references must be measurable and supportable.

Existing swim-history compatibility:

- Current `completed_activity_events` rows are planned swim actuals and must stay readable by Calendar Plan and Review Actual.
- Future generic history must either read these rows through a compatibility adapter or backfill them into a new canonical history table with a reversible migration path.
- Backfill/read-through must preserve existing IDs or expose stable aliases so support, export/delete, audit logs, and any saved links can still locate the original event.
- The mapping from swim-specific fields such as pool/open-water context, pool length/unit, and corrected swim-session snapshot into generic activity detail must be explicit and tested.
- No future migration may require every historical activity to have planned/workout/program refs, because Garmin run/ride/walk and other provider activities may be unplanned.

## Forward Compatibility Contract

Future values expected:

- sports/activity types: `swimming`, `running`, `cycling`, `walking`, `strength_training`, `yoga`, `mobility`, `dryland`, and provider-specific aliases;
- composite values: `multi_sport`, `composite_activity`, triathlon/duathlon/swimrun/brick-like provider aliases, and unknown segment structures;
- sub-sports: pool/open-water swim, indoor/outdoor run, road/indoor bike, treadmill, hike/walk, strength variants, unknown future provider values;
- providers: Garmin Activity API, Strava, Apple Health, Android Health Connect, manual fixture, future manual import;
- file formats: FIT, GPX, TCX, future redacted provider summaries;
- source/review states: manual, provider evidence, system reconciled, exact match, likely match, ambiguous match, unmatched, conflict, ignored duplicate, unmapped, needs review.

Automatic behavior:

- Generic activity rows with known common fields can render summary/date/source/status safely.
- Unknown provider/sport values can render as `Unmapped activity` or `Needs review` without counting.
- Provider evidence export/delete remains redacted and owner-scoped.

Explicit mapping required:

- sport-specific labels and metrics,
- Stats counting,
- Calendar layers,
- Review/edit affordances,
- AI-retrospective interpretation,
- Help/Guide copy,
- provider attribution/branding,
- analytics/KPI dashboards,
- raw file storage/parsing,
- finance/commercial reporting use if ever introduced.

Safe fallback:

- Unknown/deprecated/unmapped values stay out of completion totals and KPI counts.
- Unsupported sport-specific detail is preserved only as redacted evidence where allowed, not trusted actual truth.
- Multi-sport/composite activity evidence stays `needs_review` or `unsupported` until a future Garmin/FIT segment audit defines whether one summary row, child legs, transitions, or sport-specific splits can be trusted.
- Missing details show review/support copy rather than inferred success.
- Missing timezone or inconsistent units keep the row reviewable but out of trusted day/week totals until a deterministic fallback is applied.

Proof required in future implementation:

- future-value fixtures for at least run, ride, walk, swim, strength/yoga, and unknown provider values;
- tests for unknown source/sport/outcome fail-closed behavior;
- tests for timezone/local-date grouping, cross-midnight activities, daylight-saving boundaries, and unit normalization;
- tests proving current planned swim rows can be read through or backfilled without breaking Calendar Plan and Review Actual;
- route/label/support sweep for all user-facing labels;
- export/delete tests for new private activity rows.

## Codex Skill / Stack Readiness Radar

Skill/capability audit:

- Available now: local shell tools, `rg`, repo task-brief linting, current `playwright` skill for future UI/screenshot work, official Garmin docs via web browsing.
- Evaluate later: no Codex plugin install needed. Future UI child should use the existing `playwright` skill and screenshot handoff. Future provider or security-sensitive runtime child may need a fresh official-doc/security audit.
- Install/config changes: none.

Systemic findings:

| Surface                     | Finding                                                                                                                                                         | Severity | Recommended Type               | Owner Decision Needed                             | Follow-Up Brief Path                                                                                          |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Training-history data model | Current manual actual table requires planned/workout/program refs and swim-specific context, while future provider activities may be unplanned and multi-sport. | `high`   | `bounded implementation child` | yes, table evolution vs new canonical table       | `docs/task-briefs/in-progress/2026-06-23-training-history-generic-activity-data-model-foundation-v1-10-10.md` |
| Provider evidence taxonomy  | Schema has generic `activity_type`/`sport_type`/`sub_sport_type`, but fixture parser is swim-only and evidence is intentionally not completion truth.           | `high`   | `bounded implementation child` | yes, first supported sport set and mapping policy | Future provider fixture/mapping child                                                                         |
| Calendar/Review Actual UI   | Mature surface is excellent for planned swim correction, but direct reuse would hardcode swim assumptions into run/ride/walk history.                           | `medium` | `bounded implementation child` | yes, generic shell vs sport-specific editors      | Future multi-sport history UI child                                                                           |

Return path:

- Parent: `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- Last merged workstream: PR `#1218`, `main@db7da479`.
- Next step after this docs-only contract: use `docs/task-briefs/in-progress/2026-06-23-training-history-generic-activity-data-model-foundation-v1-10-10.md`, now explicitly approved for execution by owner.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Strict 10/10 mode: all `target` categories must close at `5/5`; all `supporting`/`N/A` categories must include explicit rationale and must not hide runtime work.

Critical target categories for a 10/10 claim: Product goals and IA, Business logic correctness and data integrity, Data placement and sync boundaries, Reliability and failure handling, Security and authz, Privacy and compliance, Stack-fit and dependency discipline, Testing and QA automation, DevOps and rollback readiness.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                       | Evidence                                             | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Brief defines the multi-sport user object, planned/provider/manual boundaries, and why retrospective/provider runtime must wait.                                                         | interface audit + domain contract                    | `5/5`                   |
| UX flow clarity                               | `target`     | Future flow states for known, unknown, unsupported, planned-linked, unplanned, provider evidence, exact/likely/ambiguous/unmatched/conflict, and review-needed activities are specified. | fallback contract + interface audit                  | `5/5`                   |
| Visual design quality                         | `supporting` | No UI changes in this docs-only slice; future UI child must use screenshot handoff and reference surfaces.                                                                               | scope rationale + future UI gate                     | `5/5`                   |
| Business logic correctness and data integrity | `target`     | No plan, manual actual, provider evidence, or Stats truth can overwrite another layer silently; taxonomy, timezone, units, and future unknowns fail closed.                              | data contract + acceptance criteria                  | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | No admin editor is changed; support/admin diagnostics are considered through runbook and provider evidence boundaries.                                                                   | scope rationale                                      | `5/5`                   |
| Accessibility (a11y)                          | `supporting` | No rendered UI changes; future UI child must preserve accessible labels/states for review surfaces.                                                                                      | scope rationale + future validation                  | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | No runtime payload changes; future UI/API child must set route-level payload/perf targets before implementation.                                                                         | scope rationale                                      | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical, local-only, sync/conflict, retention, cache, and invalidation boundaries are explicit.                                                                                 | data placement section                               | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Protected activity-history routes must be dynamic/no-store and mutations must list invalidated surfaces.                                                                                 | cache contract                                       | `5/5`                   |
| Reliability and failure handling              | `target`     | Duplicate, orphan, unknown, unsupported, provider disagreement, stale planned ref, and schema drift states fail closed.                                                                  | forward compatibility + acceptance criteria          | `5/5`                   |
| Security and authz                            | `target`     | Future activity routes must be owner-scoped, fail closed, and never trust provider/browser IDs for user ownership.                                                                       | stack gate + future validation contract              | `5/5`                   |
| Privacy and compliance                        | `target`     | Private activity, provider evidence, raw files, biometric data, retention, export, delete, and redaction boundaries are explicit.                                                        | privacy contract + external-service matrix alignment | `5/5`                   |
| Content governance                            | `target`     | This brief becomes the canonical planning contract before implementation and prevents stale swim-only assumptions.                                                                       | parent link + checkpoint                             | `5/5`                   |
| Admin workflow and editability                | `supporting` | No admin workflow changes; future support/admin diagnostics must be updated when runtime changes.                                                                                        | explicit scope rationale                             | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because private training history creates no public crawlable route or metadata change in this docs-only slice.                                                                       | private-data rationale                               | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because private training history and planning docs do not create public AI-discoverable content.                                                                                     | private-data rationale                               | `N/A`                   |
| Analytics and KPI observability               | `target`     | Future sport/source/provider/timezone/unit values require explicit mapping before KPI/Stats counting; unknowns stay out of metrics.                                                      | forward compatibility + Stats interface audit        | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | No checkout/entitlement flow changes; future paid/coached activity reporting cannot use this as finance truth without a separate finance contract.                                       | scope rationale                                      | `5/5`                   |
| Incident response and support operations      | `target`     | Future runtime child must update support runbook diagnostics for source/sport/provider/review states.                                                                                    | support impact section                               | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A for this docs-only private training-history contract because no revenue, invoices, refunds, payouts, or entitlement reporting changes.                                               | explicit finance scope rationale                     | `N/A`                   |
| i18n operational readiness                    | `target`     | New sport/source labels must be typed/mapped and unknown-safe so future locale expansion is not blocked by hardcoded English-only states.                                                | forward compatibility + label mapping rule           | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Uses existing Next/TypeScript/Supabase/provider-evidence/Calendar patterns; no dependency or provider runtime is added.                                                                  | stack gate + changed-files review                    | `5/5`                   |
| Testing and QA automation                     | `target`     | Future implementation validation matrix is specified for unit, integration, negative-path, e2e, export/delete, and screenshot gates.                                                     | validation section                                   | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Contract avoids raw-file/blob/provider runtime storage until a separate retention/cost decision exists.                                                                                  | privacy/cost boundary                                | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Docs-only change is revertable; future migrations must define rollback/backfill/read-through strategy before runtime.                                                                    | validation + migration decision gate                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse Calendar Plan, Review Actual, and Calendar Stats as reference surfaces, but do not copy swim-specific assumptions into generic history.
  - Future private routes must stay dynamic/no-store and owner-scoped.
- TypeScript/domain:
  - Introduce typed source/sport/activity/outcome registries before broad runtime work.
  - Unknown values must normalize to `unmapped` or `needs_review`, not success.
- Supabase/data:
  - Future child must decide additive evolution vs new canonical table with explicit migration, RLS, indexes, generated types, export/delete, and backfill/read-through.
  - Planned/workout/program references must become optional only through a tested contract, never by ad hoc nulls.
- External services:
  - Garmin runtime remains blocked. Official docs must be refreshed before any OAuth/API/FIT parsing/import child.
  - Raw files, OAuth tokens, provider payloads, and webhook secrets are out of scope until a provider runtime brief defines storage/secrets/retry/idempotency/observability.
- UI:
  - Planned swim correction reference is `ReviewActualEditor`.
  - Generic activity history UI must use a shared shell and sport-specific detail renderers or a deliberate read-only fallback.
  - Any UI child requires screenshot handoff before PR gates.
- Testing:
  - Future data child requires schema/type/helper tests, unknown-value tests, export/delete tests, authz negative paths, and Calendar regression tests.
  - Future UI child requires component/e2e/screenshot evidence for known and unknown sport states.

## Help/Guide And Support Impact

Docs-only slice:

- No Help/Guide runtime copy changes are required in this PR.

Future runtime child:

- Update `docs/runbooks/auth-account-support.md` when activity history, Stats, Calendar, Review Actual, provider evidence, or support diagnostics change.
- Update `docs/api-contracts.md` and `docs/architecture/data-access-authz-cache-contract-registry.md` for any changed API route.
- Update `docs/architecture/external-service-contract-matrix.md` before adding provider runtime, raw file storage, OAuth tokens, or webhook flows.

## Route / Label / Support Surface Sweep

Required before any future runtime or UI child changes:

- `rg -n "completed swim|Completed swim|planned swim|Swimming will be included|Review actual|actual history|activity_type|sport_type|sub_sport_type|completed_activity_events" app components lib tests docs`
- Check at minimum `app/`, `components/`, `lib/`, `tests/`, `types/`, `supabase/migrations/`, `docs/api-contracts.md`, `docs/runbooks/auth-account-support.md`, `docs/architecture/data-access-authz-cache-contract-registry.md`, active/planned/blocked/done task briefs, and Help/Guide assertions when relevant.

## Scope

- Create the multi-sport activity-history contract.
- Audit local app interfaces that currently own swim actuals, provider evidence, Calendar Plan, Review Actual, and Stats.
- Audit current official Garmin docs relevant to multi-activity history and provider boundaries.
- Define data, identity, domain granularity, forward compatibility, support, stack, and validation requirements for future implementation.
- Update the parent training-history brief checkpoint/sequence to point at this child.

## Out Of Scope

- Runtime code changes.
- Supabase migrations.
- Generated DB type updates.
- UI, layout, screenshot capture, or Playwright runs.
- Garmin OAuth, Activity API calls, Training API calls, webhooks, FIT parsing, GPX/TCX parsing, raw file storage, or provider secrets.
- Garmin Health API runtime, all-day health metrics, wellness context, or health-to-activity conversion.
- Manual user workflows for walking, running, cycling, strength, yoga, mobility, or multi-sport activity logging.
- Multi-sport segment/leg/transition modeling beyond safe unsupported/needs-review fallback.
- Stats counting for swimming/running/cycling/walking.
- AI retrospective evaluation.
- Changing existing Calendar Plan, Review Actual, Habits, Micro Sessions, Dryland, Perfect Day, or admin workflows.
- Touching `Ja.docx`.

## Acceptance Criteria

1. Brief records official Garmin source baseline from current primary sources.
2. Brief audits local DB, helper, route, UI, Stats, provider evidence, API contract, support, export/delete, and test interfaces that affect training history.
3. Brief states that retrospective evaluation and provider reconciliation must wait for a generic multi-sport activity contract.
4. Brief defines swimming-first product scope, common activity fields, canonical sport taxonomy, timezone/local-date handling, normalized units, sport-specific detail handling, optional planned links, unplanned activity policy, provider evidence boundaries, health-vs-activity boundary, multi-sport unsupported fallback, review-confidence states, unknown-value fallback, and export/delete/privacy implications.
5. Brief includes full scorecard mapping with strict 10/10 target interpretation.
6. Parent training-history brief points to this child as the next planning step.
7. Changed brief(s) pass task-brief lint.

## Validation

Docs-only validation required:

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `git diff --check`

Future implementation validation, not required for this docs-only slice:

- migration/type tests for any new or changed activity-history schema,
- unit tests for activity/source/sport/outcome normalization,
- negative-path tests for authz, cross-owner reads/writes, malformed provider values, stale writes, duplicate aliases, and unknown source/sport values,
- export/delete tests for new private activity rows,
- Calendar Plan and Review Actual regression tests,
- Calendar Stats source mapping tests,
- e2e and screenshot handoff for UI changes,
- `npm run verify:pre-pr`, PR CI, and `npm run verify:pre-merge`.

## Checkpoint Log

- `2026-06-23 | planned | created from clean synced main@9637237b after owner asked to audit app and Garmin online before any runtime; local audit found provider evidence generic but manual actual history and Review Actual swim-plan-specific; official Garmin Activity API confirms multi-activity scope; this docs-only child defines the 10/10 multi-sport activity contract before retrospective evaluation or provider reconciliation | next: run brief lint/docs validation, then wait for owner decision on whether to create a future data/model implementation child`
- `2026-06-23 | planned | owner confirmed the next planning step after PR #1218; prepared docs/task-briefs/planned/2026-06-23-training-history-generic-activity-data-model-foundation-v1-10-10.md as the future data/model foundation child; no runtime implementation had started | next at the time: use that child only after explicit owner execution approval`
- `2026-06-23 | planned | owner explicitly approved executing the generic activity data-model foundation child; child moved to docs/task-briefs/in-progress/2026-06-23-training-history-generic-activity-data-model-foundation-v1-10-10.md | next: keep this multi-sport contract as prerequisite reference while the bounded data foundation runs`
