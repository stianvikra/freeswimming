# Task Brief: Training History Generic Activity Data Model Foundation V1 (10/10)

## Metadata

- `id`: `2026-06-23-training-history-generic-activity-data-model-foundation-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-23`
- `updated`: `2026-06-23`
- `mode`: `end-to-end implementation after explicit owner execution approval`
- `parent_brief`: `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- `prerequisite_contract`: `docs/task-briefs/planned/2026-06-23-training-history-multi-sport-activity-contract-v1-10-10.md`
- `related_blocked_briefs`:
  - `docs/task-briefs/blocked/2026-02-28-garmin-training-api-partner-integration-10-10.md`
  - `docs/task-briefs/blocked/2026-06-21-garmin-activity-reconciliation-and-review-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-23`
- `base`: `main@db7da479`
- `audit_status`: `ready`
- `decision`: Implement a new canonical `training_activity_events` foundation with a compatibility/read-through adapter for existing `completed_activity_events`; keep Garmin/provider runtime, UI, Stats counting, and AI-retrospective work out of scope.
- `reason`: The multi-sport contract showed that current manual actual history is plan-linked and swim-specific, while provider evidence already stores generic activity metadata as evidence only. A safe runtime foundation needs a deliberate table-evolution vs new-table decision before Stats, Calendar, provider reconciliation, or AI-retrospective work.
- `must_refresh_before_execution_if`: Refresh if `completed_activity_events`, provider-evidence migrations/helpers, generated Supabase types, export/delete routes, Calendar Plan, Review Actual, Calendar Stats, support runbooks, scorecard categories, or verification lanes change before execution.

## Goal

Implement the minimal generic activity-history data foundation that can represent planned swim actuals and future unplanned/provider activity candidates without corrupting Calendar, Review Actual, Stats, or provider evidence boundaries.

## Pre-Implementation Owner Explanation

Codex skal bygge en trygg datagrunnmur for faktisk aktivitetshistorikk, ikke ny brukerflate eller provider-runtime. Det betyr noe fordi appen senere ma kunne skille svommeokter fra lop, sykkel, gange, styrke/yoga og ukjente provider-aktiviteter uten dobbeltelling eller stille overskriving. Utenfor scope er Garmin OAuth/import/FIT, UI, Stats-telling, helsemetrikker, AI-retrospektiv og endringer i eksisterende Calendar/Review Actual-flyt.

## Product Decision

Implementation decision: use a new canonical `training_activity_events` foundation with a compatibility/read-through adapter for existing `completed_activity_events`.

Why this recommendation:

- Current `completed_activity_events` rows are planned swim actuals and require planned/workout/program references.
- Future provider or manual non-swim activities may be unplanned and must not weaken existing swim completion constraints by adding ad hoc nullable fields.
- Provider evidence is intentionally not completion truth; a generic history layer must map evidence only through explicit review/mapping rules.
- A read-through adapter can keep current Calendar Plan and Review Actual stable while the generic model grows behind a clear boundary.

Execution decision gate result:

1. Audited current migrations, helpers, API routes, export/delete coverage, generated DB types, Calendar Plan, Review Actual, and tests.
2. Chose `new_training_activity_events` because unplanned/provider activities would otherwise require weakening swim-specific `completed_activity_events` invariants.
3. Kept `completed_activity_events` unchanged and added compatibility aliases instead of backfilling or rewriting existing actual history.

## Scope

Implementation scope after explicit owner approval:

- Decided and documented the data model path.
- Added the minimal Supabase schema and generated types for `training_activity_events`.
- Added typed domain contracts for activity source, sport, sub-sport, mapping status, review state, timestamps, local date, units, and normalized measurements.
- Added a compatibility adapter so existing planned swim actuals remain readable by generic history without changing Calendar Plan or Review Actual behavior.
- Added fail-closed handling for unknown, unmapped, unsupported, duplicate, orphan, and schema-drift states.
- Added export/delete coverage for new private activity-history rows through `/api/user/export` and `auth.users` cascade.
- Added targeted tests for schema invariants, adapters, export, cascade coverage, owner-scope RLS, unknown values, timezone/local-date, unit normalization, and Calendar/Review Actual regression boundaries.

Out of scope for this brief:

- Garmin OAuth, Activity API runtime, Training API runtime, webhooks, provider jobs, raw FIT/GPX/TCX parsing, or provider secrets.
- Garmin Health API, all-day health metrics, wellness summaries, or health-to-activity conversion.
- User-facing activity-history UI, Calendar UI, Review Actual UI changes, route labels, screenshots, or Playwright handoff.
- Stats counting for swimming, running, cycling, walking, strength, dryland, or any other activity source.
- Manual non-swim activity logging workflows.
- Provider reconciliation, match thresholds, sent-vs-received review actions, and attribution/branding UI.
- AI retrospective evaluation or adaptive replanning.
- Finance/reporting, commerce, admin dashboards, public SEO/AI-discoverable pages, or `Ja.docx`.

## Current Interface Constraints

| Surface                     | Constraint                                                                                   | Data-model implication                                                                                             |
| --------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `completed_activity_events` | Existing table is planned swim actual history with required plan/workout/program references. | Generic history must not weaken current swim invariants silently.                                                  |
| Actual correction fields    | Current fields include distance/duration and swim-specific pool/open-water context.          | Split common measurements from sport-specific detail envelopes.                                                    |
| Actual session snapshot     | Current snapshot stores corrected swim session draft structure.                              | Generic model needs an envelope that can hold swim detail and safely mark other sports as unavailable/review-only. |
| Calendar Plan               | Groups manual actuals by planned instance and keeps plan mutations separate.                 | Existing Calendar must keep reading current swim actuals without adopting generic unplanned rows.                  |
| Review Actual               | Mature planned-swim correction editor.                                                       | Reuse its invariants for planned swim only; do not copy it as a generic sport editor.                              |
| Provider evidence           | Stores provider activity metadata and files as evidence only.                                | Generic history may link to evidence only through explicit mapping/review, never by import side effect.            |
| Calendar Stats              | Swimming remains unmapped in comparison totals until explicit mapping.                       | This brief must not make any new Stats source count.                                                               |
| Export/delete               | Provider evidence already has redacted export/delete coverage.                               | Any new canonical history rows require the same privacy boundary.                                                  |

## Domain Granularity Contract

User's mental object:

- "An activity I actually did", including planned swim actuals now and future unplanned/provider activities later.

Canonical objects:

- Existing: `completed_activity_events` for planned swim actuals.
- Existing evidence: `provider_activity_evidence` and related provider connection/import-run rows.
- New foundation: `training_activity_events` for generic activity-history rows and future review candidates.

Child object levels:

| Level                  | Meaning                                                                                   | Future operation support in this data-model slice                                                               |
| ---------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Activity summary       | One actual activity with date/time, source, sport, status, duration/distance where known. | `view` through adapters; `create` only for explicit migrated/imported foundation rows if execution approves it. |
| Planned link           | Optional plan/workout/program link for planned swim actuals.                              | `view`; required for existing planned swim rows, optional for future unplanned/provider candidates.             |
| Provider evidence link | Reference to received external evidence.                                                  | `view`/`support-only`; no completion truth unless a later reconciliation child maps it.                         |
| Common measurements    | Duration, distance, elevation, energy, heart rate, load where normalized.                 | `view`; validation and unit normalization required before trusted totals.                                       |
| Sport-specific detail  | Swim session steps/repeats, pool/open-water context, future run/ride/strength details.    | `view` for existing swim detail; `support-only` or `needs_review` for unsupported details.                      |
| Review/mapping state   | Whether a row is trusted, unmapped, unsupported, duplicate, orphan, or needs review.      | `view` and deterministic fail-closed classification.                                                            |

Mature reference surfaces:

- Planned swim actual correction: `ReviewActualEditor`, `lib/my-library/review-actual.ts`, `/my-library/calendar/actuals/[instanceId]`.
- Calendar planned swim read model: `lib/my-library/calendar-plan.ts`, `CalendarPlanWeekHub`.
- Provider evidence boundary: `provider_connections`, `provider_import_runs`, `provider_activity_evidence`, `lib/my-library/provider-evidence.ts`.

10/10 granularity gate:

- This data slice cannot claim generic activity UI quality because it has no UI.
- Future UI children cannot claim 10/10 by showing only summary rows when the trusted sport object requires child-level review. Missing child detail must render as unavailable/review-needed and stay out of trusted totals.

## Data Placement And Sync Contract

Server-canonical data:

- immutable activity/history ID,
- owner/user ID,
- source kind (`manual`, `provider_evidence`, `system_reconciled`, `unknown`/future mapped values),
- canonical sport/sub-sport/activity category,
- mapping/review state,
- actual start/end timestamps, `activity_local_date`, timezone provenance,
- normalized measurements in canonical units,
- optional planned/workout/program references,
- optional provider evidence references,
- redacted sport-specific detail envelope,
- audit timestamps and repair diagnostics.

Local-only data:

- filter state, sort/group preferences, transient review state, and unsaved drafts only.

Sync/conflict policy:

- Planned rows remain planning truth.
- Existing swim actual rows remain actual-history truth for planned swims.
- Provider evidence remains evidence until mapped by a later reconciliation/review child.
- Unplanned future activities may exist without planned/workout/program references only if the chosen schema explicitly supports that invariant.
- Unknown provider/sport/source/unit/timezone values fail closed to `needs_review`, `unmapped`, or `unsupported`.
- No import, adapter, or backfill may auto-complete a swim plan item or mutate planned rows.

Retention and sensitivity:

- Activity history is private health/fitness-adjacent data.
- Raw files, biometric detail, provider payloads, and OAuth tokens remain out of scope until a provider runtime brief defines retention and redaction.
- Export/delete must include future canonical rows and redacted linked evidence references.

Cache/invalidation:

- Any future protected activity-history reads must be dynamic/no-store.
- Mutations must invalidate Calendar Plan, Review Actual, history summaries, export/delete surfaces, provider reconciliation candidates, and future AI-retrospective inputs.

## Identity And Rename Contract

- Canonical stable ID: `training_activity_events.id`, immutable after create.
- Existing compatibility ID: `completed_activity_events.id` remains resolvable for planned swim actuals.
- Provider IDs: aliases only, never app primary identity.
- Planned IDs: optional references to intended plan rows, not required for provider/unplanned activities.
- Human-readable labels: sport/source/workout labels are display-only and may be renamed.
- Rename vs repurpose: renaming a workout/program preserves history linkage; materially repurposed planned/workout objects require a new canonical entity before future history attaches.
- Compatibility: existing swim actuals must either be read through a generic adapter or backfilled with stable aliases and a reversible migration plan.
- Observability and repair: orphan rows, duplicate provider aliases, stale planned references, unknown taxonomy values, and unsupported sport details must be measurable and supportable.

## Forward Compatibility Contract

Data-driven automatically:

- existing planned swim actuals can appear through the compatibility adapter once the generic read model is introduced;
- common activity summary fields can display for mapped rows without sport-specific totals;
- new canonical source/sport/status values can be stored only when typed and mapped.

Explicit mapping required:

- new sports, sub-sports, provider labels, source kinds, unit dimensions, review states, detail envelopes, Stats filters, Calendar totals, Help/Guide labels, analytics events, export formats, and locale strings.

Safe fallback:

- unknown, deprecated, ambiguous, duplicate, unsupported, or unmapped values stay out of swim Stats, Calendar completion truth, KPI totals, and AI evaluation;
- unsupported sport detail is preserved only as redacted evidence/detail where allowed;
- missing timezone/unit detail keeps the row reviewable and excluded from trusted day/week totals until resolved.

Implementation evidence required:

- fixtures for swim, run, ride, walk, strength/yoga, and unknown values through typed schema/domain contracts;
- timezone/local-date and timezone-source tests for stored foundation rows;
- unit-normalization tests through canonical measurement constraints;
- Calendar Plan and Review Actual regression tests;
- export/delete and owner-scope tests;
- unknown/future-value fail-closed tests.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Strict 10/10 mode: all `target` categories must close at `5/5`; all `supporting`/`N/A` rows must include explicit scope rationale.

Critical target categories for a future 10/10 claim: Product goals and IA, Business logic correctness and data integrity, Data placement and sync boundaries, Reliability and failure handling, Security and authz, Privacy and compliance, Stack-fit and dependency discipline, Testing and QA automation, DevOps and rollback readiness.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                              | Evidence                                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Generic activity data model keeps planned swim actuals, unplanned activities, and provider evidence distinct.                                   | schema/adapters + parent contract review                 | `5/5`                   |
| UX flow clarity                               | `target`     | Data states expose clear future labels for trusted, needs-review, unmapped, unsupported, duplicate, orphan, and provider-evidence-only rows.    | state registry tests + support copy contract             | `5/5`                   |
| Visual design quality                         | `N/A`        | N/A because this brief creates no UI, layout, screenshot, print, or brand rendering change.                                                     | explicit non-visual scope rationale                      | `N/A`                   |
| Business logic correctness and data integrity | `target`     | No provider/import/backfill/adapter path may silently complete, overwrite, or rebind planned swim actual truth.                                 | invariants + adapter/negative-path tests                 | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor, CRUD surface, publish flow, or operator editing task changes.                                                      | explicit admin-editor scope rationale                    | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because no rendered UI or accessibility semantics change in this data-model slice.                                                          | explicit non-UI scope rationale                          | `N/A`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: schema/helpers must avoid broad raw-file payload reads; route-level budgets belong to later UI/API children.                   | query/design review + existing perf gate                 | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical, local-only, sync/conflict, retention, export/delete, and invalidation boundaries are explicit.                                | data contract + tests                                    | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Future private activity-history reads are dynamic/no-store and mutations list affected read surfaces.                                           | route/API contract + invalidation tests if routes change | `5/5`                   |
| Reliability and failure handling              | `target`     | Unknown, duplicate, orphan, stale, unmapped, unsupported, and schema-drift states fail closed without `500` on expected failure paths.          | negative-path tests                                      | `5/5`                   |
| Security and authz                            | `target`     | Any new read/write/export/delete path is owner-scoped, fail-closed, and rejects cross-user/provider alias abuse.                                | authz/security tests                                     | `5/5`                   |
| Privacy and compliance                        | `target`     | Activity rows, linked evidence, raw/provider details, logs, export, and delete behavior are minimized and redacted.                             | export/delete tests + privacy review                     | `5/5`                   |
| Content governance                            | `target`     | This brief names the canonical data-model decision and prevents future children from inventing parallel activity truth.                         | parent/multi-sport checkpoint + diff review              | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: no admin workflow changes now, but support/admin diagnostics must be updated for future runtime rows.                          | support impact section                                   | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because activity history is private authenticated data and creates no public crawl surface or metadata change.                              | private-data rationale                                   | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because private activity history and this planning brief do not create public AI-discoverable content.                                      | private-data rationale                                   | `N/A`                   |
| Analytics and KPI observability               | `target`     | No new source/sport/status may enter Stats/KPI totals without explicit typed mapping and unknown-value tests.                                   | mapping tests + Stats regression tests                   | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: activity data is not entitlement, checkout, revenue, Stripe, invoice, refund, payout, or catalog truth.                        | explicit commerce scope rationale                        | `5/5`                   |
| Incident response and support operations      | `target`     | Support can diagnose missing schema, unmapped source/sport, orphan link, duplicate provider alias, and export/delete inclusion.                 | runbook/API contract updates + tests                     | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this brief does not change revenue, refunds, payouts, invoices, entitlements, accounting, or finance reporting.                     | explicit finance scope rationale                         | `N/A`                   |
| i18n operational readiness                    | `target`     | Sport/source/review labels derive from typed mappings and unknown-safe fallbacks, not database identity strings.                                | label registry tests + copy contract                     | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Next/TypeScript/Supabase/RLS/export/delete/test patterns; no new dependency or provider SDK is introduced.                         | architecture review + package diff                       | `5/5`                   |
| Testing and QA automation                     | `target`     | Implementation includes schema/type/helper, adapter, unknown-value, authz, export/delete, Calendar/Review Actual regression, and release gates. | test outputs + `verify:pre-pr`/CI/`verify:pre-merge`     | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Foundation avoids loading raw files or high-cardinality provider payloads in core reads and uses indexed owner/date/source access.              | migration/index review + query tests                     | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Any migration/backfill is reversible or read-through safe, with rollback notes and no destructive history rewrite.                              | migration rollback plan + gate evidence                  | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - No UI changes in this implementation brief.
  - Future private history/API routes must be owner-scoped, dynamic/no-store, and must not overload Calendar month cells.
- TypeScript/domain:
  - Use typed registries for activity category, source kind, sport, sub-sport, mapping status, review state, units, and detail-envelope kind.
  - Unknown values normalize to `unmapped`, `needs_review`, or `unsupported`.
- Supabase/data:
  - Use explicit migrations, RLS, indexes, generated type updates, export/delete updates, and negative-path tests.
  - Do not make planned/workout/program references optional for existing swim rows without preserving current invariants through constraints or a new canonical table.
- External services:
  - No provider runtime in this brief.
  - Garmin/Health/FIT work still requires a fresh bounded online-audit brief and provider samples before implementation.
- UI system:
  - N/A for active slice; future UI child must reuse Calendar Plan, Review Actual, or a shared generic shell with screenshot handoff.
- Testing:
  - Implementation requires targeted unit/integration tests before broad gates, plus `npm run verify:pre-pr`, CI, and `npm run verify:pre-merge`.

## Codex Skill / Stack Readiness Radar

Skill/capability audit:

- Available now: local shell tools, `rg`, repo task-brief linting, current session `playwright` skill for future UI/screenshot work.
- Evaluate later: future provider runtime needs a fresh official-doc/provider-sample audit; no local Codex skill/plugin install is needed for this data-model brief.
- Install/config changes: none.

Systemic findings:

| Surface                    | Finding                                                                                        | Severity | Recommended Type                 | Owner Decision Needed                               | Follow-Up Brief Path           |
| -------------------------- | ---------------------------------------------------------------------------------------------- | -------- | -------------------------------- | --------------------------------------------------- | ------------------------------ |
| Activity data foundation   | Existing planned swim actuals need a generic read path without weakening swim-plan invariants. | `high`   | `bounded implementation child`   | resolved: new `training_activity_events` foundation | this brief                     |
| Provider evidence boundary | Provider evidence is generic but not completion truth.                                         | `high`   | `do not do` for runtime now      | no, keep blocked until provider facts exist         | blocked Garmin/provider briefs |
| UI/history surface         | Generic activity UI would be premature until data/model invariants exist.                      | `medium` | `deferred architecture decision` | yes, later shell vs sport-specific detail editors   | future UI child                |

Return path:

- Parent: `docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
- Prerequisite contract: `docs/task-briefs/planned/2026-06-23-training-history-multi-sport-activity-contract-v1-10-10.md`
- Current step: execute this brief on branch `training-history-generic-activity-data-model-v1`.

## Help/Guide And Support Impact

Current implementation slice:

- No Help/Guide runtime copy changes are required because no user/admin workflow changes now.
- API contracts, GDPR data-rights docs, support diagnostics, and route/authz registry are updated for the new private foundation rows.

Implementation support/docs updates:

- Updated `docs/api-contracts.md` for the `/api/user/export` schema and account-delete cascade boundary.
- Updated `docs/runbooks/auth-account-support.md` with support diagnostics for schema missing, unmapped source/sport, duplicate provider alias, orphan activity, unsupported detail, and export/delete repair.
- Updated `docs/architecture/data-access-authz-cache-contract-registry.md` for the export/delete authz/cache boundary.
- Updated `docs/runbooks/gdpr-data-rights.md` for export/delete handling.

## Route / Label / Support Surface Sweep

Completed before broad gate:

- `rg -n "completed_activity_events|completed swim|planned swim|Review actual|actual history|activity_type|sport_type|sub_sport_type|provider_activity_evidence|Swimming will be included|Stats" app components lib tests docs supabase`
- Check at minimum `app/`, `components/`, `lib/`, `tests/`, `types/`, `supabase/migrations/`, `docs/api-contracts.md`, `docs/runbooks/auth-account-support.md`, `docs/architecture/data-access-authz-cache-contract-registry.md`, active/planned/blocked/done task briefs, and Help/Guide assertions when relevant.
- Identifiers searched: `completed_activity_events`, `completed swim`, `planned swim`, `Review actual`, `actual history`, `activity_type`, `sport_type`, `sub_sport_type`, `provider_activity_evidence`, `Swimming will be included`, `Stats`, and `training_activity_events`.
- Directories/surfaces checked: `app/`, `components/`, `lib/`, `tests/`, `types/`, `supabase/migrations/`, `docs/api-contracts.md`, `docs/runbooks/auth-account-support.md`, `docs/runbooks/gdpr-data-rights.md`, `docs/user-flow-map.md`, `docs/architecture/data-access-authz-cache-contract-registry.md`, `docs/architecture/external-service-contract-matrix.md`, active/planned task briefs, Calendar Plan, Review Actual, user export, account delete, and provider evidence docs.
- Fallout handled: export/schema docs, support runbook, GDPR runbook, user-flow map, provider/service matrix, parent brief, and prerequisite multi-sport contract were updated. Runtime Calendar/Stats UI labels were intentionally unchanged because this slice does not make generic activity rows visible or countable.

## Quality-Gate Evidence Contract

Triggered classes for this implementation:

- `data_integrity`: schema/adapters/backfill/read-through must preserve planned swim truth and fail closed for unknowns.
- `security_privacy`: private activity rows, provider aliases, export/delete, and logs must be owner-scoped and redacted.
- `external_service`: `N/A` unless runtime provider work is added; adding it requires a separate brief refresh.
- `route_label_support`: required if any route, label, Help/Guide, runbook, or support diagnostic changes.
- `performance_cost`: required if routes or broad queries are added.
- `api_server`: no unexpected 500 on expected schema-drift paths; missing `training_activity_events` schema degrades `/api/user/export` to an empty `trainingActivityEvents` array, while unrelated read failures still use the existing failure-mode path.
- `print_export_screenshot`: actual consumed artifact is the authenticated JSON export payload, validated by `tests/unit/user-export-payload.test.ts` and `tests/unit/user-export-route.test.ts`. `ui-debug-hypothesis-and-handoff` and owner screenshot approval / visual review stop are N/A because no UI, screenshot, print layout, brand, PDF, or rendered artifact changed.

## Acceptance Criteria

1. Brief defines the data/model decision gate and records that execution started only after explicit owner approval.
2. Brief records the selected new canonical `training_activity_events` foundation plus compatibility adapter and why additive evolution was rejected.
3. Brief preserves current Calendar Plan and Review Actual behavior for planned swim actuals.
4. Brief keeps provider evidence separate from completion truth.
5. Brief defines domain granularity, data placement, identity, forward compatibility, support, stack, and validation contracts.
6. Brief includes all platform scorecard categories with measurable target thresholds or explicit scope rationales.
7. Parent and prerequisite briefs point to this child as the active data/model decision point.
8. Changed briefs pass task-brief lint and diff checks.

## Validation

Planning validation already completed before execution:

- `npm run lint:briefs`
- `git diff --check`

Implementation validation:

- targeted schema/helper/adapter tests,
- unknown-value and unsupported-value fail-closed tests,
- timezone/local-date and unit-normalization tests,
- owner-scope/authz negative-path tests,
- export/delete tests,
- Calendar Plan and Review Actual regression tests,
- generated Supabase type update validation,
- `npm run verify:pre-pr`,
- required CI,
- `npm run verify:pre-merge`.

## Checkpoint Log

- `2026-06-23 | planned | created from clean synced main@db7da479 after owner confirmed the next planning step; this brief prepares the generic activity data/model foundation and records the execution-time decision between additive completed_activity_events evolution and a new training_activity_events foundation with compatibility adapter | next at the time: keep planned until owner explicitly says to execute this brief`
- `2026-06-23 | in-progress | owner said "execute generic activity data-model foundation brief"; branch training-history-generic-activity-data-model-v1 created and brief moved to in-progress | next: audit existing migrations/helpers/export-delete/Calendar/Review Actual before choosing the implementation path`
- `2026-06-23 | in-progress | audited existing planned-swim actuals, provider evidence, export/delete, generated DB types, Calendar Plan, and Review Actual boundaries; chose a separate owner-scoped training_activity_events foundation because additive completed_activity_events evolution would weaken swim-plan invariants; implemented migration, generated types, typed helper/adapters, export payload/query support, support/privacy docs, and targeted tests | next: run lint/typecheck/targeted tests and broad pre-PR gate`
- `2026-06-23 | in-progress | targeted Vitest, typecheck, lint:briefs:all, lint:quality-gates, and git diff --check passed; first verify:pre-pr correctly stopped on pending linked Supabase migration, then npx supabase db push --linked applied 20260623140000_training_activity_events_foundation.sql to the linked remote | next: rerun verify:pre-pr after migration drift is clean`
- `2026-06-23 | in-progress | npm run verify:pre-pr passed full lane after migration drift was clean: lint/quality/typecheck/unit/build/perf/e2e green, with Playwright reporting 111 passed and 567 skipped in the configured matrix; performance trend recommended tightening after 11 green runs, but this data-model slice records hold/defer because budget ratcheting belongs in docs/task-briefs/planned/2026-06-19-next-performance-budget-ratchet-maintenance-10-10.md, not this schema/export PR | next: commit, push, open PR, and monitor CI`
