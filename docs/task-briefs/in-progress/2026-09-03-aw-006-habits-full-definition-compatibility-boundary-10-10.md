# Task Brief: AW-006 Habits Full-Definition Compatibility Boundary (10/10)

## Metadata

- `id`: `2026-09-03-aw-006-habits-full-definition-compatibility-boundary-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-09-03`
- `updated`: `2026-09-03`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `parent_child`: `Child AC`
- `target_findings`: `H-081`
- `execution_mode`: `active implementation; stop at owner screenshot approval before pre-PR gates`
- `intended_branch`: `codex/aw-006-habits-full-definition-compatibility-boundary`
- `strict_10_10_mode`: `yes; visible review-state behavior requires screenshot approval before pre-PR gates`

## Brief Audit Record

- `last_audited`: `2026-09-03`
- `base`: clean synced `main@5651b9a1` plus the validated parent/child planning diff carried onto `codex/aw-006-habits-full-definition-compatibility-boundary`
- `audit_status`: `ready`
- `decision`: The owner explicitly authorized Child AC. It is the only active/selected Habits child and owns exactly H-081; H-071 and H-074 remain separate.
- `reason`: Current pre-view normalization can turn unknown or malformed category, target, timer, cadence, and schedule data into known semantics, let consumers disagree, or overwrite raw values during ordinary edits. One shared pre-normalization boundary can close this without a migration, new product semantic, or history rewrite.
- `must_refresh_before_execution_if`: Refresh if `origin/main`, `AGENTS.md`, the parent H-081 disposition, `lib/habits/{shared,server}.ts`, Habit definition migrations/generated types, create/update/check-in/reset routes, Today/Home/My Routines, Calendar Plan/Trends, Motivation, linked Micro Session credit, H-080/H-082 contracts, private export, analytics, support/Help, scorecard categories, screenshot rules, or validation lanes change after `main@5651b9a1`.
- `scope_stop`: Stop and revise before implementation expands into a database migration or constraint change, production-data repair, a new Habit value or semantic, definition-history versioning, an admin repair surface, H-071, H-074, or a broad redesign. If the boundary cannot be centralized atomically inside the named surfaces and PR-size gate, return to the parent for a new architecture decision.

## Goal

Create one shared pre-normalization Habit-definition boundary that distinguishes canonical definitions, one narrow legacy-cadence compatibility form, and unsupported definitions, so unknown or malformed H-081 data receives no invented meaning while stable identity, history, known behavior, and private raw export remain intact.

## Pre-Implementation Owner Explanation

Vi skal utvide den eksisterende `Needs review`-grensen til den delen av Habit-oppsettet som bestemmer kategori, mål, timerform og frekvens.

Hvorfor det betyr noe: i dag kan en ny eller ødelagt verdi stille bli tolket som `other`, `at_least`, minutes/times eller daily/weekly. Da kan appen vise eller telle feil, eller overskrive rådata når brukeren bare redigerer noe annet.

Utenfor scope er nye Habit-valg eller regler, automatisk reparasjon, databasemigrasjon, historikkversjonering, H-071-historikk, H-074-ytelse og bred UI-redesign.

Fremoverkompatibilitet: allerede støttede verdier og label-endringer følger delte kontrakter. En reelt ny maskinverdi må få eksplisitt database-, type-, domene-, consumer-, write-, test- og supportmapping før den kan telle. Ukjente verdier blir skrivebeskyttet `Needs review`, mens råverdien og historikken forblir privat og urørt.

## Parent Finding Owned

| Finding | Child AC disposition                                                                                                                                                                                                                                                                                                                                                    |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `H-081` | Own exactly the shared full-definition compatibility boundary for persisted and explicitly supplied category, target/operator/unit/value/time/timer shape, cadence period/day policy/count, and schedule values, composed with Child AA's H-080 type/mode/status boundary across reads, writes, linked Micro credit, analytics, private export, UI, tests, and support. |

Explicitly not owned:

- `H-071` history breadth, `H-072/H-073` navigation/browser breadth, `H-074` compact reads/performance, `H-075` catch-up taxonomy, and any new H-082 semantics beyond regression preservation.
- New Habit semantics, schema/repair/admin/export/analytics/reminder/delete/provider work, or broad redesign.

## Pre-Implementation Audit Evidence

- The old classifier checked only H-080 type/mode/status. Category, target/unit/operator, timer, cadence, and schedule helpers could coerce unknown/null/malformed values to `other`, `at_least`, a default unit, all days, or a clamped cadence before semantic use.
- The editor has type-specific units but no operator control; its full payload could overwrite hidden `at_most`/`after`, legacy cadence, seconds, or higher precision during an unrelated edit. Cadence PATCH also normalized a supplied subset before merging the stored row.
- Database constraints admit some shapes the UI cannot safely represent: cross-type units, contradictory timer fields, duplicate schedules, fixed count mismatches, and partial any-day schedules. Timed display/completion can disagree when seconds and numeric/unit differ.
- Direct write guards covered only H-080, check-in/reset selected too few columns, and Calendar/Micro had separate partial decisions. Export correctly preserved raw rows and must remain owner-private truth.
- Cadence was later backfilled `NOT NULL`; all-null cadence is a narrow application/rollback fixture. Constraint gaps still require a privacy-safe persisted exposure measurement and fail-closed handling, never deduction or repair.
- Existing tests covered all-null cadence and one Calendar unknown-period case, not per-field/mixed future values, write preservation, all consumers, or the full negative matrix.

## Canonical H-081 Classification Contract

One discriminated TypeScript boundary runs on the raw owner-scoped row before any normalization, `HabitDefinitionView` construction, success-bearing consumer, write guard, or analytics mapping:

| Result           | Required shape and behavior                                                                                                                                                                                                                                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `supported`      | H-080 type/mode/status plus every Child AC semantic field is canonical and structurally consistent. The result carries a strict resolved semantic model and is usable.                                                                                                                                                                                            |
| `legacy_cadence` | H-080 and every other Child AC field first pass the same canonical validation as `supported`; only all three cadence fields may be simultaneously nullish/absent, with `schedule_days` containing 1–7 unique known weekdays. The result carries a separately derived typed cadence plus the untouched raw row and may preserve existing compatible reads/actions. |
| `unsupported`    | Carries stable Habit ID, owner-private title, and deterministic bounded reason keys. It never carries raw unknown values into normal copy, analytics, logs, or generic support telemetry and never receives a known fallback semantic.                                                                                                                            |

`supported` and `legacy_cadence` are the two usable branches. Only those usable branches may enter normal cards, active/archived collections, summaries, actions, success analytics, or Habit credit. No downstream consumer may treat `legacy_cadence` as unsupported merely because it is a distinct compatibility result.

Bounded reason keys name fields or shapes, never raw values:

- existing H-080 keys: `unknown_habit_type`, `unknown_habit_mode`, `unknown_definition_status`;
- H-081 keys: `unknown_category`, `unknown_target_operator`, `unknown_target_unit`, `invalid_target_shape`, `invalid_timer_shape`, `unknown_cadence_period`, `unknown_cadence_day_policy`, `invalid_cadence_target_count`, `invalid_schedule_days`, and `invalid_cadence_shape`.

Reason order is deterministic, duplicates are removed, and one unsupported descriptor contains at most the 13 named H-080/H-081 keys. UI may group reasons under `Category`, `Target setup`, `Cadence`, `Schedule`, or generic `Habit setup`, but never prints the raw value.

Category is not completion-bearing today. Treating an unknown category as whole-definition unsupported is an intentional conservative integrity rule: it prevents raw semantic/analytics data from being relabelled or overwritten and keeps one atomic definition contract across every consumer.

## Persisted Semantic Shape Matrix

### Category and schedule

- Category must be a non-null `HABIT_CATEGORY_VALUES` member. Schedule must be an array of 1–7 unique `HABIT_WEEKDAY_VALUES`; unknown, empty, duplicate, non-array, or oversized schedules are unsupported without filtering, deduplication, or all-days fallback.

### Canonical cadence

| Cadence         | Required stored shape                                                                      |
| --------------- | ------------------------------------------------------------------------------------------ |
| Daily           | `daily` + `fixed` + count `1` + all seven unique weekdays                                  |
| Weekly fixed    | `weekly` + `fixed` + integer count `1..7` equal to the number of unique scheduled weekdays |
| Weekly any-day  | `weekly` + `any` + integer count `1..7` + canonical all-seven schedule                     |
| Monthly any-day | `monthly` + `any` + integer count `1..31` + canonical all-seven schedule                   |

All-seven validation is set-based and order-independent; a valid existing permutation is not rewritten merely to reorder weekdays.

Monthly/fixed, partial-null cadence tuples, unknown values, wrong types, fractions, out-of-range counts, count/schedule mismatch, and other contradictory shapes are unsupported.

### Exact legacy cadence

- All three cadence fields must be nullish/absent together, while H-080, category, target/timer, and 1–7 unique known schedule days pass canonical validation; this is no escape hatch for another malformed field.
- Seven days derive `daily/fixed/1`; one to six derive `weekly/fixed/<schedule length>`, without read-time writeback.
- Reads/check-ins/resets/archive/title-only edits retain the null tuple; only an explicit valid cadence change may write one complete canonical tuple, never automatic repair/backfill.

### Target, mode, and timer shape

The classifier validates current database/domain semantics and adds no new operator/unit combination:

| Definition form | Required target/timer shape                                                                                                                                                                                            |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Binary          | `at_least`; numeric/unit/time are null; timer is off                                                                                                                                                                   |
| Count           | `at_least` or `at_most`; finite numeric `0..10000`; unit is `times`, `steps`, `pages`, `glasses`, `litres`, or `custom`; time null                                                                                     |
| Duration        | `at_least` or `at_most`; finite numeric `0..10000`; unit is `minutes` or `seconds`; time null                                                                                                                          |
| Time of day     | `before` or `after`; numeric/unit null; valid real time                                                                                                                                                                |
| Avoidance       | `at_most`; finite numeric `0..10000`; unit is `times`, `glasses`, `litres`, or `custom`; time null                                                                                                                     |
| Quit mode       | Existing avoidance/`at_most`/`0`/`times`/null-time shape; timer off and target seconds null                                                                                                                            |
| Timed mode      | Existing duration/`at_least` shape; target greater than zero; `minutes` or `seconds`; time null; timer on; integer target seconds `1..86400` exactly equal to the deterministic rounded numeric/unit target in seconds |

Every non-timed mode requires `timer_enabled = false` and `timer_target_seconds = null`; `build + duration + timer_enabled = true`, a non-timed target-seconds value, a timed numeric/unit-versus-seconds mismatch, and every other type/mode/target/timer contradiction are unsupported. The equality rule is `round(target_value_numeric)` for seconds and `round(target_value_numeric * 60)` for minutes, after the existing numeric precision/range rules.

The evaluator already understands the database-valid `at_most` operator for count/duration and `after` for time-of-day, so these remain supported. `targetOperator` is not added as a public request field: POST and an actual type/mode transition derive today's canonical operator, while PATCH with unchanged resolved type and mode preserves the validated stored operator even when the full editor target group is submitted. No ordinary edit may silently change `at_most` to `at_least` or `after` to `before`.

Known units outside the type-specific sets above are unsupported even if the broad database constraint admits them, because the current editor cannot represent them safely. Before release, the exposure gate below must prove that this stricter application contract does not silently make an existing account read-only.

Malformed real times, non-finite/fractional/out-of-range values where integers are required, or shapes the app cannot evaluate deterministically are unsupported.

Existing title/notes/start-date/local-day/sort-order/Perfect-Day boolean guards, H-082 day status, and child check-in/source/reset enums remain separate contracts and are not redefined here.

## Input And Mutation Contract

Input validation must use property presence: omitted is not the same as explicit `null` or an unknown value.

`targetOperator` remains outside the public request contract. If raw JSON supplies that property at all, reject it with `400 / UNSUPPORTED_HABIT_DEFINITION_VALUE` rather than ignoring or accepting it; the server owns create/type-mode-transition derivation and same-type/mode preservation.

Input and persisted shapes use a four-step compatibility pipeline:

1. Validate every supplied Child AC enum and scalar syntactically, even when that field will be irrelevant to the resolved type/mode. Unknown enums, malformed scalars, or out-of-range values fail with the typed `400` and are never silently ignored.
2. Resolve the supported type/mode and operator policy.
3. Project only fields that are semantically relevant to that resolved shape. Known, syntactically valid target/time/timer draft carry-over from the pre-Child-AC full editor payload may be discarded as compatibility noise and is never persisted as meaning.
4. Validate the complete projected persisted candidate against the canonical/legacy matrix before any write or success event.

The implementation updates the client serializer to omit irrelevant target/time/timer properties, but the server must keep the exact seven pre-Child-AC binary, count, build-duration, build-avoidance, time-of-day, quit, and timed full-editor payload fixtures behavior-identical. This compatibility applies only to known, syntactically valid irrelevant values; it never turns an unknown value into a default.

| Case                                                                                                                                                                                                                                      | Required result                                                                                                                                                                                                                                                                                                            | Write/event guarantee                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| POST with documented omissions or current-client compatibility noise                                                                                                                                                                      | Preserve title-only/default binary behavior, omitted category -> `other`, omitted target unit where today's known type has a documented default, fully omitted cadence -> daily/fixed/1/all days, valid old-client schedule-only input, and the exact known pre-Child-AC full-editor payload shapes -> a canonical insert. | Irrelevant known fields are discarded before persistence; existing successful write/event semantics remain.                                    |
| POST/PATCH with an explicit unknown enum, explicit null for a non-null enum, malformed supplied scalar, a null that contradicts the projected resolved shape, invalid schedule/count/target/timer shape, or any `targetOperator` property | `400 / UNSUPPORTED_HABIT_DEFINITION_VALUE` with generic copy. POST/actual type-mode transitions derive the operator, while unchanged type/mode preserves the stored supported operator.                                                                                                                                    | Zero definition/check-in/reset/credit write and zero success event; never echo raw input.                                                      |
| PATCH against a canonical or legacy-compatible row                                                                                                                                                                                        | Merge omitted semantic fields from the validated stored candidate, preserve the stored supported operator when resolved type/mode is unchanged, then validate the complete affected target/cadence group.                                                                                                                  | A title-only edit writes zero Child AC semantic columns. A status-only edit writes only `status` and preserves every Child AC semantic column. |
| Explicit cadence edit on a legacy row                                                                                                                                                                                                     | Accept only a complete valid resolved group and write one canonical tuple.                                                                                                                                                                                                                                                 | No unrelated raw field or history rewrite.                                                                                                     |
| Any PATCH/archive/restore/check-in/clear/timer/reset against an unsupported stored row                                                                                                                                                    | `409 / UNSUPPORTED_HABIT_DEFINITION`.                                                                                                                                                                                                                                                                                      | Zero insert/update/delete/upsert and zero success event.                                                                                       |
| Missing or cross-owner Habit                                                                                                                                                                                                              | Preserve current non-disclosing `401/404` behavior.                                                                                                                                                                                                                                                                        | Zero writes.                                                                                                                                   |

The 12-active-Habit integrity cap continues to count every raw `status = active` row, including unsupported rows, so a later mapping cannot materialize an over-cap account.

Check-in/clear/timer and reset routes must select the complete classification projection in their existing owner-scoped definition pre-read. More selected columns are allowed; an extra query, N+1 lookup, or fail-open short row is not.

## Consumer And Recovery Matrix

| Surface                                      | Canonical/legacy-compatible rows                     | Unsupported rows                                                                                                                                                                                                                                                                                                                                        |
| -------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Snapshot, Habits, Motivation, absence review | Preserve current behavior and H-082 contracts.       | Exclude definition plus child check-ins/resets from active/archived, due/done, Perfect Day, cadence, streak/consistency, Motivation, and absence-review eligibility. Raw recorded check-in dates still count only as evidence that prevents a false whole-day `not_tracked` claim; they contribute zero success.                                        |
| `/my-library/habits`                         | Preserve current cards/actions.                      | Reuse Child AA's accessible read-only `Needs review` card exactly once per row with stable owner-private title, generic history-preserved copy, and no completion/edit/archive/restore/reset/source-credit action.                                                                                                                                      |
| Today, signed-in Home, My Routines           | Preserve known progress.                             | Use the same usable IDs and bounded review count. Unsupported-only/mixed accounts never show false setup, `Done today`, `Week complete`, `100%`, or ordinary no-data tone; known progress may remain visible without a complete tone.                                                                                                                   |
| Calendar Plan/daily layers and Trends        | Preserve known cadence and metrics.                  | Replace the Calendar-local cadence partition with the shared classifier, filter child rows by usable IDs, and expose the same bounded review state/count instead of fallback or ordinary no-data.                                                                                                                                                       |
| Direct Habit writes                          | Preserve known and documented legacy behavior.       | Apply the `400/409` contract before database mutation and success analytics. Ordinary editing cannot overwrite raw semantic fields.                                                                                                                                                                                                                     |
| Linked Micro Session                         | Preserve primary Micro truth and known Habit credit. | Valid primary save/undo remains `200`. New Habit credit is nested `blocked` with the shared code, zero Habit insert/event. Undo may delete only the exact owner/plan/week/source-scoped prior `micro_session` credit and never claims removal on no-match. Pause/resume/renew against an unsupported link returns `409` before plan/link writes/events. |
| `habits_viewed` and Habit success events     | Preserve current event names and known payloads.     | Unsupported rows contribute zero to `activeHabitCount` and success metrics/events. Payloads contain no title, notes, raw unknown value, or raw-value/reason pair.                                                                                                                                                                                       |
| Private export and support                   | Preserve authenticated export shape.                 | Stable ID and every raw H-081 field remain 1:1 in owner export. Normal support uses stable ID plus bounded field reason/code; raw values are read only from owner-authorized private evidence.                                                                                                                                                          |

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a strict `10/10` claim:

- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Security and authz`
- `Privacy and compliance`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                                                                                                                                                                                                                                                      | Evidence                                                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Exactly H-081 is closed through one mental Habit object and one shared definition contract across every named consumer; H-071/H-074 and other findings remain separate.                                                                                                                                                                                                                                                                 | callsite sweep, parent/child return audit, tests                                   | `5/5`                   |
| UX flow clarity                               | `target`     | Unsupported rows have one existing review/recovery state and zero mutation actions; mixed/unsupported-only accounts have zero false setup/complete/no-data tone.                                                                                                                                                                                                                                                                        | component/page tests, manual QA, screenshots                                       | `5/5`                   |
| Visual design quality                         | `target`     | Reuse Child AA tokens/pattern, show no overlap or overflow at 320, 768, and 1440 px, and obtain owner approval for 2–4 after/reference screenshots.                                                                                                                                                                                                                                                                                     | screenshot handoff and visual review                                               | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Every field-level and mixed future/malformed fixture yields zero success contribution and every rejected write yields zero mutation/event; canonical and exact legacy fixtures remain deterministic and raw rows unchanged.                                                                                                                                                                                                             | domain/server/route/consumer/export tests                                          | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor, admin CRUD, publish flow, or operator queue is added or changed.                                                                                                                                                                                                                                                                                                                                           | explicit admin-editor scope rationale                                              | `N/A`                   |
| Accessibility (a11y)                          | `target`     | `Needs review` has a programmatic status/explanation, actions are absent rather than visually disabled, keyboard/focus remain intact, and no serious/critical automated issue is introduced.                                                                                                                                                                                                                                            | component assertions, focused axe/browser check, screenshots                       | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Classification is O(d) in fetched definition rows, adds zero read round trips/N+1, does not widen existing history windows, and adds zero supported-path/history/raw-row payload. Only a measured unsupported descriptor increase capped at 13 reason keys and the fixed one-row writer projection are allowed. Existing public-route budgets are general regression evidence, not proof for authenticated Habits routes or DB latency. | query/call-count/projection/descriptor tests, general perf/build gates, diff audit | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Raw rows/IDs remain server-canonical, classification/reasons are derived, no browser truth or read-time rewrite is added, and a later mapping applies on the next fresh server load.                                                                                                                                                                                                                                                    | contract tests, migration/storage diff                                             | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Existing force-dynamic/no-store and post-mutation refresh behavior remains; no cached fallback may survive a fresh request.                                                                                                                                                                                                                                                                                                             | route/cache audit and regression tests                                             | `4/5`                   |
| Reliability and failure handling              | `target`     | Mixed rows render without route-wide failure; expected invalid input is typed `400`, stored conflict is `409`, Micro truth stays saved, and the negative matrix produces zero unexpected `500`.                                                                                                                                                                                                                                         | mixed-fixture, error-code, zero-write tests                                        | `5/5`                   |
| Security and authz                            | `target`     | Authentication/owner filters remain fail closed, unauthenticated/cross-owner behavior stays `401/404`, and full-row guards run before mutation without disclosing another owner's row.                                                                                                                                                                                                                                                  | route negative-path and query-scope tests                                          | `5/5`                   |
| Privacy and compliance                        | `target`     | Logs/events contain zero private titles, notes, or raw unknown values; only authenticated owner export preserves raw values 1:1; no retention/consent boundary changes.                                                                                                                                                                                                                                                                 | payload/log/export tests and privacy review                                        | `5/5`                   |
| Content governance                            | `target`     | One classifier/error/legacy contract is identical in API, user-flow, support/GDPR, parent, queue, inventory, and child docs; no scoped fail-open fallback remains.                                                                                                                                                                                                                                                                      | impact sweep, docs diff, contract tests                                            | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin role, repair action, admin workflow, or operator edit surface changes.                                                                                                                                                                                                                                                                                                                                             | explicit admin-workflow scope rationale                                            | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because all affected Habit, Calendar, Micro, and export surfaces are private/authenticated and no metadata, sitemap, robots, or canonical URL changes.                                                                                                                                                                                                                                                                              | private-route scope audit                                                          | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because private Habit content must not become public or AI-discoverable and no structured-data/public content surface changes.                                                                                                                                                                                                                                                                                                      | explicit private-data rationale                                                    | `N/A`                   |
| Analytics and KPI observability               | `target`     | Unsupported rows contribute exactly zero to `habits_viewed.activeHabitCount` and all success events/metrics; known event taxonomy/payloads remain identical and no raw private values are emitted.                                                                                                                                                                                                                                      | analytics callsite and payload tests                                               | `5/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no catalog, pricing, checkout, Stripe, entitlement, refund, payout, or revenue workflow changes.                                                                                                                                                                                                                                                                                                                            | explicit commerce scope rationale                                                  | `N/A`                   |
| Incident response and support operations      | `target`     | Support documents stable code, generic symptom, owner-authorized diagnosis, recovery/escalation, no-rewrite rule, privacy boundary, and safe handling of legacy cadence.                                                                                                                                                                                                                                                                | support runbook, API contract, recovery evidence                                   | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: no invoice, refund, payout, revenue report, entitlement reconciliation, accounting truth, or finance workflow changes.                                                                                                                                                                                                                                                                                        | explicit finance scope rationale                                                   | `N/A`                   |
| i18n operational readiness                    | `target`     | Generic review labels come from shared mappings, raw machine values never become copy, stable IDs do not change with labels, and longer localized copy fits the required responsive screenshots.                                                                                                                                                                                                                                        | copy-source audit, responsive screenshots, tests                                   | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse current Next.js route/server boundaries, shared TypeScript classifier, Supabase/RLS patterns, H-080 review surface, and existing test stack with zero dependency, migration, or parallel renderer.                                                                                                                                                                                                                                | architecture/dependency/migration diff                                             | `5/5`                   |
| Testing and QA automation                     | `target`     | Field-by-field, shape, mixed, legacy, omission, every-consumer, every-write, export/privacy, analytics, a11y, screenshot, full-gate, and CI evidence all pass.                                                                                                                                                                                                                                                                          | Vitest, focused browser evidence, verify/CI gates                                  | `5/5`                   |
| Scalability and cost efficiency               | `target`     | One O(d) partition for the definition rows already fetched, a bounded reason vector per unsupported row, zero added read round trips/N+1/jobs/external requests, and no explicit H-074 window expansion or compact-read redesign.                                                                                                                                                                                                       | complexity/query/window audit and tests                                            | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Ship one atomic no-migration/no-secret/no-dependency PR; run current-head pre-PR/CI/pre-merge gates and apply the conditional fail-closed rollback rule.                                                                                                                                                                                                                                                                                | rollout record, diff audit, gate evidence                                          | `5/5`                   |

Release gate: every target category must reach at least `4/5`. A strict `10/10` claim requires every target and every critical target above to reach `5/5` with recorded evidence.

## Stack / Architecture Best-Practice Gate

- React/Next.js: local Next.js 16 route, server/client, and caching guides were read first. Keep classification/snapshot truth on the server, send only typed descriptors to clients, reuse the current Habits/Today/Calendar renderers and dynamic/no-store boundaries, and keep primary Micro truth separate from optional Habit credit.
- TypeScript/domain: extend the one discriminated classifier; usable branches carry strict resolved semantics, canonical typed sets stay authoritative, no normalizer runs first, and bounded codes never carry raw unknown values.
- Supabase/data: add no migration/RLS/index/type/seed/rewrite or query. Classify only owner-scoped rows and widen existing one-row writer projections. The privacy-safe exposure gate must be trustworthy and exactly zero; otherwise stop for an owner compatibility/repair/migration decision.
- External services/tools: N/A; no provider, SDK, secret, webhook, vendor, connector, job, or network dependency changes.
- UI reference surface/shared component contract: reuse Child AA's accessible `Needs review`, Calendar review state, `fs-*` tokens, and responsive semantics; compare `after/reference` and obtain owner screenshot approval.
- Testing: cover classifier, snapshot, every writer/consumer, H-082 precedence, export/privacy/analytics/a11y/support with synthetic fixtures and a temporary real-component harness; never weaken constraints or write unknown real-user data.

Systemic exception: H-074 read optimization and H-071 versioned/bounded history remain separate. Child AC must not widen history windows or mix performance architecture into this integrity boundary.

## Domain Granularity Contract

- User's mental object: one Habit, including its setup definition and child history recording what happened on local dates.
- Canonical objects:
  - `habit_definitions.id` and the untouched raw definition row;
  - child `habit_check_ins` and `habit_motivation_resets`;
  - optional `micro_session_habit_links` plus source-backed Habit credit;
  - separate H-082 owner/date absence-review acknowledgement/day-status evidence.
- Mature references:
  - `/my-library/habits` and `HabitPerfectDayHub` for the full Habit card/actions/history;
  - `lib/habits/shared.ts` plus `lib/habits/server.ts` for definition/snapshot truth;
  - Child AA's read-only `Needs review` state;
  - Calendar Plan/Trends review state and linked Micro nested credit result.

| Level                                                            | Child AC operation                                                                          | Explicit boundary                                                                                                                                                                                               |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Canonical supported definition                                   | `view` plus regression-only existing `create/edit/archive/restore/check-in/reset`           | Known behavior and labels stay unchanged.                                                                                                                                                                       |
| Legacy-cadence definition                                        | `view/edit/reconcile`                                                                       | Existing compatible reads/actions remain; unrelated writes preserve the raw null tuple, while explicit cadence edit may write one complete canonical tuple.                                                     |
| Unsupported definition                                           | `view` only                                                                                 | Show stable title with generic `Needs review` once; no mutation or credit action and no interpreted child success.                                                                                              |
| Category/target/timer/cadence/schedule fields                    | canonical `view/edit`; legacy cadence explicit `edit/reconcile`; unsupported `support-only` | Supported values use current controls; same-type/mode edits preserve hidden supported operators. Unsupported owner UI may show bounded field groups, never raw values. Owner-private export retains raw fields. |
| Check-in/reset child rows                                        | `reconcile` and private-export `view`                                                       | Preserve rows. Use only canonical/legacy parents for success; an unsupported parent's recorded date may prevent false whole-day not-tracked but earns no result.                                                |
| Linked Micro relation/source credit                              | `view` plus exact provenance-safe `reconcile` on undo                                       | Preserve independent Micro truth/link; block new credit; undo may remove at most the exact prior source-backed credit.                                                                                          |
| Today/Home/My Routines/Calendar/Motivation projections           | `reconcile` read-only                                                                       | Use one usable-ID partition and bounded review context without false complete/setup/no-data.                                                                                                                    |
| Private export/support                                           | owner-private `view` / `support-only`                                                       | Preserve raw identity/shape 1:1; routine support uses stable ID, code, and bounded reason only.                                                                                                                 |
| Repair, backfill, delete, repurpose, reorder, history versioning | `out of scope`                                                                              | A later owner-selected brief must define authorization, migration, and historical meaning.                                                                                                                      |

Child-structure rationale: unsupported check-ins/resets are not rendered as interpreted progress because target/cadence semantics are unknown. Their raw records remain intact in authenticated export/support evidence, while the user-facing card states that history is preserved. This is full-object evidence rather than a summary-only claim.

## Data Placement And Sync Contract

- Server-canonical: raw definition/ID, children, links/provenance, H-082 day evidence, and authenticated export rows.
- Derived server/view model: three-way classification, resolved usable semantics, bounded review reasons/count, and usable-ID-only summaries/analytics.
- Local/client: no new storage/offline truth/client classification; transient form/tab/card state stays non-canonical.
- Sync/conflict: classify every fresh load, apply later mappings without rewrite, never auto-retry rejected writes, and let valid Micro truth save independently; no background repair, dual write, optimistic classification, or history merge.
- Retention/privacy: preserve deletion/export rules; titles, notes, history, and future raw values remain private and absent from normal logs/analytics.
- Cache/invalidation: preserve force-dynamic/no-store and successful mutation refresh; rejected writes advance no cache, while explicit legacy cadence migration uses normal refresh.

## Identity And Rename Contract

- Stable identity: immutable `habit_definitions.id` continues through views, children, Micro links, analytics counts, and export; classification creates no replacement.
- Human labels: private title is renameable only on usable rows and never maps semantics; mode/category/cadence/review labels are display text, and raw machine values never become normal copy.
- Mutability: canonical actions remain; unrelated legacy edits preserve raw cadence, explicit cadence edits may canonicalize it, unsupported rows are read-only, and reads never mutate data.
- Rename/repurpose: a label-only change updates one shared mapping without ID/history change; materially new behavior needs explicit mapping or a new Habit, never silent repurposing.
- Compatibility/support: exact legacy cadence is the only implicit alias; deprecated values need a tested alias or fail closed. Support uses stable ID, shared code, bounded reason, and owner-authorized export—never raw-value logs or automated repair. No route slug/redirect applies.

## Forward Compatibility Contract

Checklist: `docs/runbooks/task-brief-forward-compatibility-contract.md`.

- Extensibility covers every Habit enum/target/timer/cadence/schedule field, label/action/metric, Calendar/Motivation/Micro mapping, analytics, support, and private export.
- Canonical typed sets aligned with database constraints define known values; one shared contract defines shapes, shared mappings define labels, and raw owner data stays server-canonical.
- Existing supported rows and label-only changes flow automatically through every current surface without ID/history rewrite; unknown future values enter `unsupported` without harming known rows.
- A new machine value or semantic needs explicit database/type/classifier, consumer/write, UI/a11y, analytics/privacy/export/support, tests, and Help-impact mapping before release.
- Unknown/deprecated values receive no invented label/progress/credit, never leak raw, and remain stable-ID-backed, private, read-only, and exportable; aliases are explicit/tested or fail closed.
- Evidence covers each field and mixed/malformed/null shapes, canonical and legacy 1/3/7-day fixtures, omitted versus explicit and old versus minimal payloads, preservation, every consumer/write, privacy/analytics/support, impact sweep, and approved screenshots.

## Codex Skill And Stack Readiness Radar

Runbook: `docs/runbooks/codex-skill-stack-readiness-radar.md`.

Capability audit on `2026-09-03`:

- Local repository inspection, Next.js/TypeScript code, Vitest, Playwright/browser tooling, current migrations/types, and existing screenshot/runbooks are sufficient.
- No plugin, connector, MCP server, skill install, dependency, production-data write, or local Codex configuration change is needed.
- Current synthetic fixture/visual-harness paths are safer than weakening constraints or using owner data.

| Surface                       | Finding                                                                                          | Severity | Recommended Type                 | Owner Decision Needed                                       | Follow-Up Brief Path       |
| ----------------------------- | ------------------------------------------------------------------------------------------------ | -------- | -------------------------------- | ----------------------------------------------------------- | -------------------------- |
| Full definition compatibility | H-081 has route-local/permissive category/target/cadence/schedule fallbacks before semantic use. | `high`   | `bounded implementation child`   | `no`: the owner selected Child AC for active implementation | this in-progress brief     |
| Snapshot read cost            | H-074 overfetch remains real but lacks a route/query/payload/latency baseline.                   | `medium` | `bounded implementation child`   | `yes`: select a measured compact-read child later           | `TBD after owner decision` |
| Historical review breadth     | H-071 cannot safely infer all history from today's mutable definition.                           | `medium` | `deferred architecture decision` | `yes`: choose bounded window/versioning policy later        | `TBD after owner decision` |

Top recommended next step: complete scoped H-081 implementation and targeted QA, then stop for owner screenshot approval before pre-PR gates.

Return path: parent remains `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`; Child AC is the only active/selected child at this in-progress path; last runtime PR stack is `#1253/#1254/#1255` with closeout `#1256`.

## Expected Implementation Scope

- Domain/server/API: `lib/habits/{shared,server}.ts`, Habit create/update/check-in/reset routes, `lib/dryland/micro-habit-linkage.ts`, and `lib/dryland/micro-plans.ts` only if shared result typing requires it.
- Consumers/adapters: `HabitPerfectDayHub`, Today/Home/My Routines, Calendar daily/Plan/Trends, current Micro adapters, authenticated export regression, and existing analytics callsites. Change only the minimal files needed for the shared partition/review result.
- Tests: focused domain/server/Habit-route/component, Today/Home/My Routines, Calendar, Micro, export, analytics, support, and accessibility suites already covering those surfaces.
- Docs: this child plus parent/queue/inventory lifecycle, API/user-flow contracts, auth/account support, and GDPR data rights.

## Out Of Scope

- Adding, renaming, deprecating, or changing semantics for any category, operator, unit, cadence, weekday, target, timer, type, mode, status, or label.
- Database migration, constraint, RLS, table, column, index, generated type, seed, backfill, repair, or production-data rewrite.
- Raw-value UI, admin repair/editor, automatic migration-on-read, background reconciliation, history versioning, hard delete, or repurpose workflow.
- H-071–H-075 or new H-082 behavior; analytics/export/deletion/navigation/reminder/provider/performance/UI redesign.
- Real-account malformed fixtures, weakened constraints, more than `4000` changed lines, or merge without explicit owner approval.

## Help / Guide And Operator Training Contract

- The implementation PR must update `docs/api-contracts.md` with classifier and `400/409` contracts, `docs/user-flow-map.md` with usable-only counts/review states, `docs/runbooks/auth-account-support.md` with symptom/code/privacy-safe diagnosis/recovery/no-rewrite rules, and `docs/runbooks/gdpr-data-rights.md` with raw owner-export truth.
- In-app Help/Guide is `N/A` only because the current sweep found no relevant Habits guide; if implementation discovers one, update it and its assertion in the same PR.
- No user-facing repair action is added. `Needs review` preserves history and directs the user to retry after support is added or use existing support; it must not promise an unavailable in-app repair.
- Any label/recovery change triggers the route/label/support impact sweep before broad gates.

## Security, Privacy, And Compliance Contract

- Preserve authentication and exact owner scoping on every definition/check-in/reset/link/export query.
- Cross-owner/missing IDs stay non-disclosing `401/404`; unsupported is disclosed only after an owner-scoped row is found.
- Run the full guard before direct Habit mutation, new linked credit, plan/link action, and success analytics. Exact source-scoped Micro undo remains the only bounded retraction exception.
- Owner-authenticated Habits UI may show the private Habit title with generic review copy. Analytics, normal logs, and generic support telemetry contain no title, notes, child history, or raw unknown values.
- Private export remains authenticated/owner-scoped; no public/shareable diagnostic artifact or new retention path is introduced.
- No secret, env value, elevated credential, service-role bypass, or weaker RLS policy is added.
- Expected validation/conflict paths are typed and never leak database details or become unexpected `500`.

## Observability And KPI Contract

- Keep existing first-party event names and taxonomy.
- `activeHabitCount` and every success metric/event include canonical and legacy-compatible rows only.
- No new event/property is required merely to detect private unsupported data.
- Existing error paths may report only shared machine code, bounded reason/count, and already permitted correlation context.
- Success threshold: each unsupported fixture produces zero success-event emission and zero success-count contribution; known fixtures preserve event count and payload semantics.

## Performance And Cost Contract

- One O(d) classification/partition pass, where `d` is the number of definition rows already fetched; the current definition query is not falsely described as bounded.
- Zero new read query on snapshot, Today/Home/My Routines, Calendar, export, or Micro link paths.
- Existing writer definition pre-reads select the fixed complete Child AC projection for one owner-scoped row but add zero query. Record the before/after selected-column count or serialized fixture size; this fixed guard-row increase is allowed.
- Canonical and legacy-compatible definitions keep the existing `getHabitCheckInStartDate` window algorithm. Excluding a newly H-081-unsupported oldest definition may narrow that lower bound as a required integrity effect; no explicit limit, wider window, compact Today read, or other H-074 redesign is allowed.
- Add zero supported-path, history-window, or raw-row client payload; no N+1 or extra Motivation pass.
- Unsupported descriptors contain stable display identity and at most the 13 named reason keys, never duplicate raw row payload. Record the before/after serialized mixed-fixture descriptor size; this bounded reason-vector increase is the only allowed client-payload growth.
- Preserve the repository's measured public-route baseline where applicable: LCP `<= 2.5s`, CLS `<= 0.10`, INP `<= 200ms`, TBT `<= 200ms`. This is general regression evidence only; it does not claim authenticated Habits-route, database-row, query-latency, server-payload, or p50/p95 coverage. Targeted tests additionally assert call/query/projection/window behavior.
- No dependency, job, external request, cache layer, or H-074 compact-read work is introduced.

## Route, Label, And Support-Surface Impact Sweep

Before the first broad gate, record:

- identifiers searched: normalizers/classifier/builders, every H-081 field/value list, `Needs review`, `UNSUPPORTED_HABIT_DEFINITION`, `UNSUPPORTED_HABIT_DEFINITION_VALUE`, `activeHabits`, `unsupportedHabits`, `activeHabitCount`, `habits_viewed`, `canCount`, `habitCredit`, and Calendar/Motivation review states;
- directories/surfaces: `app/`, `components/`, `lib/`, `tests/`, `types/`, `supabase/migrations/`, docs/runbooks, Help assertions, parent/queue/inventory, export, analytics, and Micro routes;
- fallout handled in the same PR: shared domain/server model, every read/write consumer, tests, API/user-flow/support/GDPR docs, and lifecycle records;
- intentional leftovers: historical mentions remain historical; H-071/H-074/H-072/H-073/H-075 stay linked to the parent.

## Acceptance Criteria

1. Each single-field future/malformed category, target operator/value/unit/time/timer, cadence period/policy/count, and schedule fixture plus each null that contradicts its resolved type/mode/cadence shape and mixed fixtures becomes `unsupported`; none borrows `other`, `at_least`, null/minutes/times, daily/weekly, or a filtered/deduplicated schedule. Canonical shape-required nulls remain supported.
2. Every canonical known shape, existing H-080 behavior, and H-082 day-status/coverage/check-in precedence remains behavior-identical. Exact pre-Child-AC full-editor payload fixtures for binary, count, build-duration, build-avoidance, time-of-day, quit, and timed remain accepted after known-noise projection and persist the same canonical rows; the new client serializer omits irrelevant fields.
3. Legacy cadence with 1, 3, and 7 unique known days derives exactly weekly/fixed/N or daily/fixed/1; partial-null cadence, duplicate/unknown/empty/non-array schedule, count mismatch, monthly/fixed, and contradictory tuples are unsupported.
4. Unsupported definitions contribute exactly zero to active/archived success counts, due/done, Perfect Day, cadence, streak/consistency, Motivation, absence-review eligibility, Today/Home/My Routines completion, Calendar Plan/Trends, new Micro credit, `activeHabitCount`, and Habit-success events.
5. A raw recorded check-in date under an unsupported parent may prevent a false whole-day `not_tracked` classification while still contributing zero success.
6. Each unsupported row appears exactly once in the existing accessible read-only `Needs review` state with stable owner-private title and zero mutation/credit actions; mixed/unsupported-only states show no false setup/complete/no-data tone.
7. POST/PATCH with an explicit unknown enum, explicit null for a non-null enum, malformed supplied scalar, a null that contradicts the projected shape, malformed combination, or any supplied `targetOperator` property returns `400 / UNSUPPORTED_HABIT_DEFINITION_VALUE` with zero database writes and zero success events; documented omission and old-client defaults remain.
8. PATCH merges omitted semantic fields from the validated stored candidate. A title-only edit writes zero Child AC semantic columns; a status-only edit writes only `status` and preserves every Child AC semantic column. When resolved type/mode is unchanged, full-editor and partial target edits preserve a supported stored `at_most`/`after` operator; an actual type/mode transition derives today's canonical operator. Unchanged legacy cadence stays raw, while an explicit valid cadence edit writes one complete canonical tuple.
9. PATCH/archive/restore/check-in/clear/timer/reset against an unsupported stored row returns `409 / UNSUPPORTED_HABIT_DEFINITION` after an owner-scoped full-row guard and performs zero insert/update/delete/upsert/event.
10. Calendar Plan and Trends use the same shared result, remove the Calendar-local special cadence gate, filter children by usable IDs, and expose identical bounded review count/state.
11. A valid Micro primary save/undo remains successful; unsupported new Habit credit is blocked with zero Habit insert/event; undo removes at most its exact source credit and reports no-match truthfully; pause/resume/renew is guarded before link/plan writes.
12. Owner-authenticated private export preserves stable ID plus every raw Child AC field 1:1 with unchanged schema; normal UI copy never shows raw unknowns, and analytics/logs contain zero raw unknown/title/note.
13. Unauthenticated/cross-owner/missing behavior remains non-disclosing `401/404`, and the complete failure-mode matrix has no unexpected 500 response.
14. Snapshot/Calendar/Micro supported reads add zero queries; writers add zero queries and only the measured fixed Child AC columns to their existing one-row guard; classification remains O(d) in fetched definitions; canonical/legacy history-window selection is unchanged; and no N+1/supported-path/history/raw-row payload/dependency/job expansion occurs. Removing an unsupported oldest definition may only narrow the derived lower bound; the only client growth is a measured unsupported descriptor capped at 13 reason keys.
15. API, user-flow, support, GDPR, parent, queue, inventory, and child docs describe the same legacy/read/write/Micro/export recovery truth.
16. Focused domain/server/route/Today/Calendar/Motivation/Micro/export/analytics/component/a11y tests cover every field and mixed/known/legacy/omission fixture and pass.
17. Two to four fresh `after/reference` screenshots using real components and synthetic fixtures are owner-approved before `verify:pre-pr`.
18. `git diff --check`, brief/quality lint, targeted tests, the full code lane, `verify:pre-pr`, required CI, and current-head `verify:pre-merge` pass in sequence.
19. The complete implementation stays within the `4000` changed-line PR-size gate or stops for a parent-level split before code continues.
20. A privacy-safe pre-release exposure query reports exactly zero existing DB-valid rows that the stricter application unit/timer/schedule/cadence contract would newly classify as unsupported. Any non-zero or unavailable trustworthy result stops deployment for an explicit owner-approved compatibility/repair/migration decision.
21. Every target score is at least `4/5`; strict `10/10` requires every target and every critical target at `5/5`.

## Screenshot Handoff Requirements

Required because more unsupported definitions enter visible review states. Follow `docs/runbooks/ui-debug-hypothesis-and-handoff.md`.

- Comparison type/folder: `after/reference` in `output/playwright/habits-full-definition-compatibility-YYYY-MM-DD-HHMMSS`.
- Capture 2–4 full-resolution artifacts named `after-habits-full-definition-needs-review-{mobile,desktop}.png`, `reference-today-calendar-full-definition-review-desktop.png`, and `reference-micro-full-definition-review-mobile.png`.
- Explain stable private title, generic review copy, absent actions, known-progress handling, no false complete/setup/no-data state, Micro independence, and responsive/a11y judgment.
- Use a deterministic temporary local harness with real production components if schema constraints block synthetic unknown rows. Never weaken constraints or use real owner data.
- Remove the harness after capture. Link the timestamped folder, record local capture time, and stop for owner approval/corrections before `verify:pre-pr`, commit/push, PR creation, or `verify:pre-merge`.
- Regenerate screenshots if any rendering/style/asset/export HTML changes afterward; otherwise state explicitly that none changed.

## Manual QA Environments

- Local: use `SITE_LOCK_ENABLED=0` at `http://127.0.0.1:3000` with deterministic fixtures; verify 320–390, 768, and 1440 px, keyboard/focus/status, canonical/legacy/unsupported/mixed, direct errors, Micro independence, all named consumers, and export.
- Preview: verify only normal canonical/legacy build and route regression; never seed unsupported real rows. Record local/preview differences or `none`.

## Validation

- Completed setup evidence: synced base, local Next.js guides, named branch/in-progress lifecycle, sole Child AC selection, planning docs gates, and early line-budget check.
- Before screenshot: targeted Vitest for every scoped suite, `npm run lint:briefs`, `npm run lint`, `npm run typecheck`, `git diff --check`, and route/label/support sweep evidence.

After stable targeted QA:

1. Capture and inspect the required screenshots.
2. Stop for explicit owner screenshot approval or corrections.
3. After approval, run escalation-first `npm run verify:pre-pr`.
4. Commit, push, open/update the PR, and monitor required CI under automation-first delivery.
5. Run escalation-first `npm run verify:pre-merge` on the current PR head and report readiness without merging.

Any code, test, config, script, migration, workflow, or runtime diff uses the full lane. No test may be silently skipped.

## Rollout And Rollback Contract

- Ship the classifier, every consumer/writer, tests, and docs atomically in one PR; no interim fail-open consumer.
- No migration, feature flag, secret, dependency, or raw rewrite is expected. Deploy this reader/writer guard before any future schema widening or new machine-value writer.
- Use only synthetic unsupported fixtures and require the privacy-safe persisted exposure gate to be exactly zero; never weaken constraints or create unknown real rows.
- Revert normally only while constraints/data prove no newly unsupported/future values. Otherwise roll forward or retain minimal guards—never restore silent coercion.
- Rollback never normalizes, deletes, or rewrites definitions, children, links, or H-082 day evidence.

## Automation, Git, And Session Continuity

- Child AC is executing on its named branch from `main@5651b9a1` under the automation-first contract and screenshot stop: implementation, targeted tests, screenshot handoff/approval, then pre-PR/commit/push/PR/CI/pre-merge.
- Never merge without explicit owner approval.
- Commit/push only validated scoped work. Recovery order is `git status -sb`, `git log --oneline -n 10`, then this brief/parent at the latest checkpoint.
- Record each meaningful checkpoint as `date | commit/working tree | completed scope | next step`.
- If tooling, credentials, screenshots, or CI block execution, state the exact blocker, one owner action, and the resume point.
- PR links open in Safari through the repository script when possible. Post-merge cleanup, one eligible docs-only closeout, and mandatory chat-handoff assessment follow `AGENTS.md`.

## Return Contract

- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- Before closeout, return exact evidence for H-081 closure and H-071/H-074 deferral; classifier/legacy and every read/write contract; `400/409`, zero writes/events, and Micro independence; raw identity/history/export/privacy; H-080/H-082 regression; bounds, screenshots, scores, validation, commit, and PR.
- Closeout moves this brief to `done`, updates parent/queue/inventory, resets `planned_child`/`selected_child` to `none`, and does not imply another Habits child.

## Checkpoint Log

- `2026-09-03 | planned-created | owner said "gjør neste anbefalte steg" after the fresh parent audit recommended Child AC; created this plan-only H-081 brief from clean synced main@5651b9a1 plus the uncommitted parent audit, with one pre-normalization full-definition classifier, exact legacy cadence, typed read/write/Micro/export/privacy contracts, and explicit H-071/H-074 exclusions; no runtime/schema/UI/test/branch/commit/push/PR work started | next: validate the four-file docs-only planning diff, then wait for explicit execute/build/implement/kjør`
- `2026-09-03 | planned-validated | the final four-file docs-only Child AC plan passed git diff --check, changed/all-brief lint including this child, verify:docs-only, and independent semantic review of usable/legacy branches, operator/unit/timer/input compatibility, exposure, payload, and H-071/H-074 boundaries. Child AC remains planned, none is active/selected, and no runtime/schema/UI/test/branch/commit/push/PR work started | next: wait for explicit execute/build/implement/kjør before moving Child AC to in-progress`
- `2026-09-03 | in-progress | owner explicitly said "Kjør Child AC"; confirmed clean synced main@5651b9a1, created codex/aw-006-habits-full-definition-compatibility-boundary, moved this brief to in-progress, selected only H-081, and reviewed the relevant local Next.js 16 route-handler, server/client-boundary, and caching guidance; H-071/H-074 remain outside scope | next: implement scoped domain, write, consumer, test, support, and screenshot evidence, then stop for owner visual approval`
- `2026-09-03 | screenshot-approval-stop | implemented the shared canonical/legacy/unsupported boundary, guarded every scoped write/consumer, preserved raw precision/history/export and H-082 date evidence, and updated support contracts. Privacy-safe exposure was 0/49 rows; writers remain one query with 6->17 guard columns; bounded descriptor worst case was 161->406 bytes; final scope is 3878/4000 changed lines. Combined Vitest passed 17 files/516 tests; typecheck, ESLint (0 errors/8 unrelated warnings), all-brief lint, targeted Prettier, and diff check passed. Four after/reference artifacts captured 2026-09-03 19:04–19:12 with zero 320/390/768/1440 horizontal overflow, zero console warnings/errors, zero serious/critical axe findings on Child AC review/Motivation and Today/Calendar/Micro surfaces; whole-Habits axe still reports five untouched Weekly Overview nodes (3 prohibited div aria-label, 2 4.37:1 contrast) outside this diff | next: wait for owner screenshot approval before verify:pre-pr, commit, push, PR, CI, or verify:pre-merge`
- `2026-09-03 | screenshot-approved | owner replied "godkjent" after reviewing the four after/reference artifacts; no product rendering/style/asset/export HTML changed after final capture | next: fetch origin, run verify:pre-pr, then commit/push/open PR and continue through CI plus verify:pre-merge without merging`
- `2026-09-03 | pre-pr-green | current branch remained 0 behind/0 ahead of origin/main@5651b9a1; full-lane npm run verify:pre-pr passed quality/brief gates, lint, typecheck, 265 files/2067 unit tests, production build, public performance budgets, and Playwright with 111 passed/573 environment-skipped; artifact artifacts/test-runs/20260903-192452 | next: commit, push, open the PR, record delivery evidence, monitor required CI, then run verify:pre-merge without merging`
- `2026-09-03 | pr-open | implementation committed as 3b361c09, pushed on codex/aw-006-habits-full-definition-compatibility-boundary, and opened as PR #1257 with canonical generated metadata; no product rendering/style/asset/export HTML changed after the approved capture | next: push this evidence-only docs checkpoint, monitor required CI on the final PR head, then run verify:pre-merge without merging`

## Completion Record

- `status`: `in progress; PR #1257 open, required CI and pre-merge validation active`
- `10/10 claim`: `no; required CI and current-head pre-merge evidence remain`
- `implementation_commit`: `3b361c09`
- `pull_request`: `#1257` (`https://github.com/stianvikra/freeswimming/pull/1257`)
- `screenshots`: `output/playwright/habits-full-definition-compatibility-2026-09-03-190420` (`after/reference`, captured locally 2026-09-03 19:04–19:12)
- `validation`: `exposure 0/49; targeted 17 files/516 tests; typecheck, lint, all-brief lint, Prettier, diff, responsive, console, and scoped axe passed; full-lane pre-PR PASS at artifacts/test-runs/20260903-192452 (265 files/2067 unit tests, build/performance, Playwright 111 passed/573 environment-skipped); CI/pre-merge pending`
