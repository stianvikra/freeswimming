# Task Brief: AW-006 Habits Type/Mode/Status Fail-Closed (10/10)

## Metadata

- `id`: `2026-09-01-aw-006-habits-type-mode-status-fail-closed-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-09-01`
- `updated`: `2026-09-01`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `parent_child`: `Child AA`
- `target_findings`: `H-080`
- `execution_mode`: `implementation authorized by the owner's explicit \`Kjør Child AA\``
- `intended_branch`: `codex/aw-006-habits-type-mode-status-fail-closed`
- `strict_10_10_mode`: `yes; visible review-state changes require screenshot approval before pre-PR gates`

## Brief Audit Record

- `last_audited`: `2026-09-01`
- `base`: clean synced `main@9d315c53` before the uncommitted parent/child planning diff.
- `audit_status`: `ready`
- `decision`: Execute this as the only selected Habits child for H-080 on `codex/aw-006-habits-type-mode-status-fail-closed`. Preserve the screenshot approval stop before pre-PR gates.
- `reason`: Current reads silently coerce unknown persisted `habit_type`, `habit_mode`, and definition `status` into `binary`, `build`, and `active`. The same type/mode fallback can accept explicit future values in create/update input. This can make a partially deployed or future definition look successful across Habits, Home/My Routines, Calendar, Motivation, analytics, and linked Micro Session credit. One shared supported/unsupported boundary plus write guards is bounded and does not require a new product semantic or database migration.
- `must_refresh_before_execution_if`: Refresh this brief if `AGENTS.md`, the parent H-080/H-081 disposition, `lib/habits/{shared,server}.ts`, Habits route handlers, Today/Home/My Routines contracts, Calendar Plan/Trends adapters, Micro Session Habit linkage, private export, analytics payloads, `habit_definitions` constraints/generated types, local Next.js 16 docs, support/Help contracts, scorecard categories, screenshot rules, or verification lanes change after `main@9d315c53`; also refresh if `origin/main` advances before execution.
- `scope_stop`: Stop and revise before implementation broadens into a schema migration, a new habit type/mode/status, H-081 category/operator/unit/cadence repair, raw-value logging, an admin repair tool, or a redesign. If safe classification cannot be centralized without such expansion, return to the parent for a product/architecture decision.

## Goal

Make unknown Habit definition type/mode/status values fail closed everywhere they can affect user-visible truth or writes, while preserving stable identity, private raw export data, known-value behavior, and independent Micro Session completion.

## Pre-Implementation Owner Explanation

Vi skal lage én felles sikkerhetsgrense for ukjente Habit-typer, modes og statuser. En Habit som appen ikke forstår, skal vises som `Needs review`, være skrivebeskyttet og holdes utenfor progresjon, streaks, Perfect Day, Calendar og Habit-kreditering.

Hvorfor det betyr noe: i dag kan en fremtidig eller delvis utrullet verdi stille bli tolket som en vanlig aktiv `Do`-habit. Da kan appen vise eller lagre feil progresjon uten at brukeren ser at datakontrakten ikke er støttet.

Utenfor scope er å legge til nye typer/modes/statuses, endre kjente Habit-regler eller labels, migrere databasen, reparere andre definition-fallbacker, bygge et admin-verktøy, løse øvrige Habits-funn eller gjøre en bred UI-/ytelsesrefaktor.

Fremoverkompatibilitet: nye rader med allerede støttede maskinverdier fortsetter automatisk gjennom den delte kontrakten. En label for en eksisterende stabil verdi endres i én delt visningsmapping. En faktisk ny type, mode eller status må få eksplisitt database-, TypeScript-, domene-, consumer-, test- og supportmapping før den kan telle; ukjente verdier forblir trygt skrivebeskyttet frem til da.

## Parent Finding Owned

| Finding | Child AA disposition                                                                                                                                                                                                                                                                                             |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `H-080` | Own exactly the shared fail-closed boundary for persisted and explicitly supplied `habit_type`, `habit_mode`, and definition `status`, including read consumers, direct Habit writes, linked Habit credit/removal, private export preservation, analytics redaction, visible review state, and support guidance. |

Explicitly not owned:

- `H-071`: absence-review window breadth and historical definition truth.
- `H-072/H-073`: Home hash navigation and broad authenticated browser-flow depth beyond focused regression proof.
- `H-074`: deep-history snapshot/query performance redesign.
- `H-075`: legacy catch-up analytics taxonomy.
- `H-081`: category, target operator/unit, cadence/day-policy, schedule, or target-shape legacy/default compatibility.
- New Habit values, database constraint changes, history versioning, repair tooling, reminders, hard delete, provider/native sync, export-format redesign, or broad visual redesign.

## Current Audit Evidence

- `lib/habits/shared.ts`:
  - `getHabitType` maps every unknown value to `binary`;
  - `getHabitMode` maps every unknown value to `build` unless the legacy timer inference applies;
  - `buildHabitDefinitionView` maps every non-`archived` status to `active`;
  - `buildHabitDefinitionInsert` and the shape-changing branch of `buildHabitDefinitionUpdate` reuse the type/mode fallback, so explicitly supplied future values can be accepted as known values.
- `lib/habits/server.ts` maps all definition rows before splitting active/archived and before building day, week, and every Motivation summary.
- `lib/my-library/today.ts` treats zero mapped active rows as setup and can emit `No habits yet`, `Done today`, or a normal success state without an unsupported-definition branch.
- `lib/my-library/calendar-daily-layers.ts` has a Calendar-local partial cadence/mode partition, but it does not cover type/status and is not shared by other consumers.
- `lib/my-library/calendar-comparison.ts` maps definition rows directly before Habits Trends statistics.
- Protected PATCH, check-in, and reset routes do not all validate the existing row's three core fields before mutation; check-in/reset also default unknown persisted mode/status into known behavior.
- `lib/dryland/micro-habit-linkage.ts` builds a coerced Habit view before deciding `canCount`, so an unsupported linked definition can become eligible for Habit credit.
- `app/my-library/habits/page.tsx` sends `initialSnapshot.activeHabits.length` through `habits_viewed`; coerced rows can therefore improve an existing success-bearing analytics count.
- `lib/user/export.ts` already preserves raw `habit_mode`, `habit_type`, and `status` values in the authenticated private export. Child AA must prove and preserve this behavior rather than redesign the export.
- Current database constraints make unknown values unlikely on today's schema, but they do not make older application code safe during partial rollout, rollback, restored data, mocks, or a future schema expansion.

## Canonical H-080 Classification Contract

One shared TypeScript classification boundary must run before any known-definition view builder or success-bearing consumer:

| Result        | Required shape and behavior                                                                                                                                                                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `supported`   | Carries a definition whose `habit_type`, `habit_mode`, and `status` are all members of today's canonical value sets. Only this branch may enter `HabitDefinitionView`, active/archived collections, summaries, actions, analytics counts, or Habit credit.                     |
| `unsupported` | Carries stable Habit ID, private display title, and bounded reason keys from `unknown_habit_type`, `unknown_habit_mode`, and `unknown_definition_status`. It never carries raw unknown values into normal UI, analytics, or logs and never receives a known fallback semantic. |

Required architecture invariants:

1. The known-definition builder accepts only the supported branch; new call sites cannot bypass classification by calling a permissive mapper.
2. Unknown, `null`, malformed, or deprecated non-mapped values for any of the three fields are unsupported. Today's non-null database contract and known values remain unchanged.
3. Existing omitted create fields retain the current `binary`/`build` compatibility default. An explicitly supplied unknown or `null` type/mode is different from omission and returns typed `400` with zero writes.
4. PATCH inherits omitted type/mode from the already validated current row when another target-shape field changes; it must not rebuild omitted fields from fallback defaults. Explicitly supplied unknown type/mode returns typed `400`.
5. Inbound status validation remains strict. An existing row with unknown persisted status follows the unsupported branch and cannot be edited, archived, restored, checked in, or reset.
6. H-081 fields keep their current behavior. Calendar Plan composes the shared H-080 core boundary with its existing cadence/day-policy gate until H-081 is separately resolved.
7. Classification is derived only. It never rewrites the raw definition, creates a replacement entity, deletes history, or changes the private export row.

Bounded reason keys are diagnostic field names, not raw values. Normal logs may contain only stable owner-scoped correlation context already permitted by current support policy, the bounded reason keys/count, and the generic machine error code; never Habit title, notes, or raw unknown values.

## Consumer And Recovery Matrix

| Surface                                   | Supported rows                                                                 | Unsupported rows                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Habits snapshot and Motivation            | Preserve today's behavior.                                                     | Return separately from active/archived; contribute `0` to due/done, Perfect Day, cadence progress, streak/consistency, Motivation, active/archived counts, or absence-review eligibility.                                                                                                                                                                                                                                                                                                                                          |
| `/my-library/habits`                      | Preserve current cards/actions.                                                | Show one accessible read-only card per row with title, generic `Needs review`, history-preserved explanation, and no completion/edit/archive/restore/reset/source-credit action.                                                                                                                                                                                                                                                                                                                                                   |
| Signed-in Home and My Routines            | Count only supported rows.                                                     | If any exist, show a generic review state and never `No habits yet`, `Done today`, `Week complete`, `100%`, or a misleading `Needs review · 0%` score. Mixed known/unknown accounts may show the known ratio plus review count, but never a complete tone.                                                                                                                                                                                                                                                                         |
| Calendar Plan/daily layers                | Preserve existing cadence behavior and compose the current H-081 cadence gate. | Exclude the definition plus its check-ins/resets from all daily/week totals and expose generic `Habits review needed`; never show raw values or treat the date as ordinary no-data when only unsupported rows exist.                                                                                                                                                                                                                                                                                                               |
| Calendar Trends                           | Compare supported rows only.                                                   | Exclude the definition plus its check-ins/resets from all metrics and name lists. Show bounded review support; if no supported rows exist, use an explicit review state instead of ordinary `No data`.                                                                                                                                                                                                                                                                                                                             |
| Direct Habit create/update                | Preserve known and intentionally omitted input behavior.                       | Explicit unknown input is typed `400` before database work; a PATCH against an unsupported stored row is typed `409 / UNSUPPORTED_HABIT_DEFINITION` with zero writes. The persisted 12-active-row integrity cap still counts every raw `status = active` row so a later mapping cannot materialize an over-cap account.                                                                                                                                                                                                            |
| Check-in and reset                        | Preserve known behavior.                                                       | Return `409 / UNSUPPORTED_HABIT_DEFINITION` before insert/update/delete and before success analytics.                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Linked Micro Session Habit credit/removal | Preserve Micro Session behavior and known Habit credit.                        | A valid primary Micro Session save/undo remains `200` and is not rolled back even if a later link load/resume/credit step fails. New credit is `blocked` with `code = UNSUPPORTED_HABIT_DEFINITION`, zero Habit insert, and no Habit-success event. Undo may still delete only an existing owner/plan/week/source-scoped `source_kind = micro_session` credit and reports `removed` only when a row matched. Unsupported links expose no pause/resume/renew action; direct attempts return shared-code `409` before writes/events. |
| `habits_viewed`                           | Preserve the existing event.                                                   | `activeHabitCount` counts supported active rows only. No new event is required; payloads contain no title, raw value, or reason-value pair.                                                                                                                                                                                                                                                                                                                                                                                        |
| Private export and support                | Preserve the authenticated raw export shape.                                   | Stable ID and raw values remain 1:1 in the owner's private export. Normal support uses stable ID plus bounded field reason; raw values are read only from owner-authorized private evidence, never routine logs/analytics.                                                                                                                                                                                                                                                                                                         |

## Mutation Error Contract

| Case                                                               | HTTP/result                                                                               | Machine code                                                   | Write guarantee                                                                                                                   |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Explicit unknown/null type or mode on create/update input          | `400`                                                                                     | `UNSUPPORTED_HABIT_DEFINITION_VALUE`                           | Zero definition/check-in/reset/credit writes.                                                                                     |
| PATCH/check-in/reset against an existing unsupported definition    | `409`                                                                                     | `UNSUPPORTED_HABIT_DEFINITION`                                 | Zero insert/update/delete/upsert and zero success analytics.                                                                      |
| Pause/resume/renew an unsupported linked definition                | `409`                                                                                     | `UNSUPPORTED_HABIT_DEFINITION`                                 | Zero Micro plan/link write and zero success analytics.                                                                            |
| Valid Micro Session completion linked to an unsupported definition | Primary response remains `200 ok: true`; nested credit is `blocked`                       | `UNSUPPORTED_HABIT_DEFINITION`                                 | Micro truth may change; new Habit-credit insert and Habit-success analytics remain zero.                                          |
| Valid Micro Session undo linked to an unsupported definition       | Primary response remains `200 ok: true`; nested result reports removal/blocked truthfully | Existing source-scoped result plus bounded unsupported context | May delete only the existing owner/plan/week/source-scoped Micro credit; no generic Habit/check-in mutation or success analytics. |
| Missing/cross-owner Habit                                          | Preserve current `404` behavior without revealing whether another owner has the ID.       | Existing contract                                              | Zero writes.                                                                                                                      |

All user-facing errors are generic and retry-safe. Reload cannot reinterpret the same unsupported row as supported unless a later deployed mapping explicitly adds the stored value.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim: Product goals and IA; UX flow clarity; Visual design quality; Business logic correctness and data integrity; Accessibility (a11y); Performance (CWV + payloads); Data placement and sync boundaries; Reliability and failure handling; Security and authz; Privacy and compliance; Content governance; Analytics and KPI observability; Incident response and support operations; i18n operational readiness; Stack-fit and dependency discipline; Testing and QA automation; Scalability and cost efficiency; DevOps and rollback readiness.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                                                                                                                    | Evidence                                                     | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | Exactly the three H-080 definition fields share one read/write contract across every named consumer; H-071–H-075/H-081 and new product semantics remain unchanged.                                                                                                                                    | consumer/callsite sweep, child/parent return audit, tests    | `5/5`                   |
| UX flow clarity                               | `target`     | Unsupported rows have one clear review state and zero mutation actions; mixed or unsupported-only accounts never show setup/complete/no-data copy that implies success.                                                                                                                               | component/page tests, manual QA, screenshots                 | `5/5`                   |
| Visual design quality                         | `target`     | The read-only state reuses mature tokens/patterns, has no overlap/overflow at 320, 768, and 1440 px, and 2–4 after/reference screenshots receive owner approval.                                                                                                                                      | screenshot handoff and visual review                         | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Type-only, mode-only, status-only, and mixed fixtures contribute exactly `0` to every success-bearing read; rejected direct writes/new credit perform `0` writes, while provenance-safe Micro undo may remove only its exact prior source credit; raw definition/history otherwise remains unchanged. | domain/server/route/consumer/export negative tests           | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor, admin CRUD, publish flow, or operator queue is added or changed.                                                                                                                                                                                                         | explicit admin-editor scope rationale                        | `N/A`                   |
| Accessibility (a11y)                          | `target`     | `Needs review` has a programmatic status/explanation, removed actions are absent rather than only visually disabled, keyboard/focus flow stays intact, and no serious/critical automated accessibility issue is introduced.                                                                           | component assertions, focused axe/browser check, screenshots | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Classification is O(n), adds no snapshot/Calendar/Micro read query or deep-history expansion, adds at most one owner-scoped current-row guard on PATCH, avoids N+1 work, and existing route/CWV/payload budgets pass.                                                                                 | query/call-count tests, bundle/perf gates, diff audit        | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Raw values and stable IDs remain server-canonical; classification is derived, no browser persistence or history rewrite is added, and a later mapping takes effect on the next server load.                                                                                                           | contract tests, storage/migration diff                       | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: existing force-dynamic/no-store and post-mutation snapshot behavior stay unchanged; no cached supported classification survives a fresh server request.                                                                                                                              | route/cache audit and regression tests                       | `4/5`                   |
| Reliability and failure handling              | `target`     | Mixed rows render without route-wide failure; expected unsupported input is `400`, stored conflict is `409`, Micro credit is explicitly blocked, and all covered expected paths produce zero unexpected `500`.                                                                                        | mixed-fixture, error-code, zero-write tests                  | `5/5`                   |
| Security and authz                            | `target`     | Existing auth and owner filters remain fail closed; unauthenticated/cross-owner behavior stays `401/404`; unsupported guards run before mutation without exposing another owner's row.                                                                                                                | route negative-path and query-scope tests                    | `5/5`                   |
| Privacy and compliance                        | `target`     | Analytics/logs contain zero Habit titles, notes, or raw unknown values; the existing authenticated private export alone preserves raw values 1:1; no retention or consent boundary changes.                                                                                                           | payload/log/export tests and privacy review                  | `5/5`                   |
| Content governance                            | `target`     | One canonical classifier/error contract is reflected consistently in API, user-flow, support, parent, queue, inventory, and child docs; no scoped fail-open fallback remains.                                                                                                                         | impact sweep, docs diff, contract tests                      | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin role, admin action, repair workflow, or operator edit surface changes.                                                                                                                                                                                                           | explicit admin-workflow scope rationale                      | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because Habits, My Routines, Calendar, export, and mutation paths are private/authenticated; no public metadata, sitemap, robots, or canonical URL changes.                                                                                                                                       | private-route scope audit                                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because private Habit content must not become public or AI-discoverable and no structured-data/public content surface changes.                                                                                                                                                                    | explicit private-data rationale                              | `N/A`                   |
| Analytics and KPI observability               | `target`     | Unsupported rows contribute `0` to `habits_viewed.activeHabitCount` and every success metric; no new event/taxonomy rename; event/log payloads contain zero raw values or titles.                                                                                                                     | analytics callsite and payload tests                         | `5/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no catalog, pricing, checkout, Stripe, entitlement, refund, payout, or revenue workflow changes.                                                                                                                                                                                          | explicit commerce scope rationale                            | `N/A`                   |
| Incident response and support operations      | `target`     | Support guidance identifies the generic symptom, stable error code, safe owner-authorized diagnosis, recovery/escalation, no-history-rewrite rule, and why raw private content is absent from logs.                                                                                                   | support runbook, API contract, recovery test evidence        | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: no invoice, refund, payout, revenue report, entitlement reconciliation, finance truth, or accounting workflow changes.                                                                                                                                                      | explicit finance scope rationale                             | `N/A`                   |
| i18n operational readiness                    | `target`     | Review/error labels come from shared display mappings, raw machine values never become copy, layouts tolerate longer localized text, and stable machine IDs/history do not change with labels.                                                                                                        | copy-source audit, responsive screenshots, tests             | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse Next.js 16 route/server boundaries, shared TypeScript domain contracts, current Supabase/RLS patterns, Habits/Calendar review primitives, and existing test stack with zero new dependency or parallel renderer.                                                                                | architecture/dependency diff and review                      | `5/5`                   |
| Testing and QA automation                     | `target`     | All four fixture classes cross domain, snapshot, direct writes, Micro linkage, Today/Home/My Routines, Calendar Plan/Trends, export, analytics, component, and support contracts; focused and full release gates pass.                                                                                | Vitest, focused browser evidence, verify/CI gates            | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Classification remains one O(n) partition per fetched row set, diagnostics are bounded, supported-path reads avoid added round trips/N+1 queries, and no background job/external service is introduced.                                                                                               | complexity/query audit and tests                             | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | No migration, secret, dependency, or feature flag; rollout/rollback checks account for existing unsupported rows; current-SHA pre-PR, required CI, and pre-merge gates pass.                                                                                                                          | migration/secret diff, rollback record, gate evidence        | `5/5`                   |

Release gate: every target category must reach at least `4/5`. Strict 10/10 closeout requires every target and every critical target above to reach `5/5` with recorded evidence.

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Before implementation, read the current local Next.js 16 guides at `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`, `05-server-and-client-components.md`, and `08-caching.md`.
  - Keep classification and snapshot construction server/domain-owned. Client components receive a typed safe descriptor and do not infer support from labels, missing fields, or raw values.
  - Reuse `/my-library/habits`, `HabitPerfectDayHub`, `TodayTabsPanel`, Calendar's existing review-needed presentation, and current dynamic/no-store route boundaries. Do not add a parallel route or renderer.
  - A valid Micro Session mutation and its optional Habit-credit result remain distinct outcomes; never return a route-wide failure after Micro truth has already been saved.
- TypeScript/domain:
  - Introduce one discriminated core-definition classifier for exactly type/mode/status plus one strict supported-definition builder.
  - Keep canonical known-value arrays/types as the source of truth. Do not duplicate lists in Today, Calendar, routes, components, analytics, or export code.
  - Model bounded reason keys and machine error codes as typed unions. Raw unknown strings never enter the supported union.
  - Direct expected conflicts use deterministic `400`/`409` models; the Micro result uses a deterministic nested blocked code.
- Supabase/data:
  - No migration, table, column, RLS, index, storage, or generated database type change is expected. Current constraints remain authoritative for today's values.
  - Every protected read stays owner-scoped before classification or disclosure. Mutation guards run before the domain write and before success analytics.
  - Snapshot/Calendar/Micro reads add no query. PATCH may add at most one owner-scoped current-row guard; no N+1 or deep-history expansion is allowed.
  - If execution discovers that schema work is required, stop and revise rather than silently changing constraints or generated types.
- External services/tools:
  - N/A. No external Habit provider, analytics vendor, SDK, secret, webhook, background job, or network dependency is needed.
- UI system:
  - Mature references are the existing Habits feedback/notice language and Calendar `review needed` treatment. Reuse current `fs-*` tokens, accessible status semantics, and responsive card/action patterns.
  - The unsupported card is deliberately read-only; actions are absent, not disabled-looking controls that imply a future retry will work.
  - Comparison type is `after/reference`, with owner screenshot approval required before `verify:pre-pr`.
- Testing:
  - Domain classification, server snapshot, direct route, linked Micro, Today/Home/My Routines, Calendar Plan/Trends, export, analytics, component, accessibility, and support-contract evidence are all required.
  - Use type-only, mode-only, status-only, mixed, known-value, mixed-known/unknown-account, cross-owner, and explicit-input fixtures.
  - Do not bypass production constraints or write future values to a real account merely to create visual evidence; use mocked repository tests and a temporary local visual harness with real components.

Systemic exception: H-081 remains a separately documented legacy-versus-future compatibility audit. Child AA may expose an extensible classifier shape, but it must not classify, migrate, or claim closure for category/operator/unit/cadence/schedule/target fields.

## Domain Granularity Contract

- User's mental object: one Habit, including its setup/definition and the history that records what happened on particular days.
- Canonical objects:
  - `habit_definitions.id` plus raw type/mode/status and other setup fields;
  - child `habit_check_ins` rows;
  - child `habit_motivation_resets` rows;
  - optional `micro_session_habit_links` relationship and source-backed Habit check-ins.
- Mature reference surfaces:
  - `/my-library/habits` and `HabitPerfectDayHub` for Habit summary/actions/history;
  - `lib/habits/shared.ts` plus `lib/habits/server.ts` for the view/snapshot contract;
  - Calendar daily-layer `review needed` for read-only unmapped state;
  - linked Micro Session credit result for independent primary-versus-credit outcomes.

| Level                                              | Child AA operation                                                                | Explicit boundary                                                                                                                                                                                                                           |
| -------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supported Habit definition/card                    | `view` plus regression-only existing `edit/create/archive/restore/reset/check-in` | Known behavior stays unchanged. Child AA does not redesign these actions.                                                                                                                                                                   |
| Unsupported Habit definition/card                  | `view` only                                                                       | Show stable title/ID-backed row and bounded reasons as generic `Needs review`; no edit/create/delete/archive/restore/reset/check-in/reorder/credit action.                                                                                  |
| Type/mode/status machine fields                    | `support-only`                                                                    | Normal UI shows field-level reason names only, never raw values. Owner-private export retains raw values.                                                                                                                                   |
| Existing check-ins under an unsupported definition | `support-only` and private-export `view`                                          | Preserve every row and exclude it from interpreted success. User-facing raw child-history values are intentionally not rendered because their meaning depends on the unsupported definition; the card must state that history is preserved. |
| Motivation/reset history                           | `support-only`                                                                    | Preserve rows, exclude unsupported definition from derived metrics, and block new resets. No historical rewrite or reconciliation occurs.                                                                                                   |
| Linked Micro relationship                          | `view` plus provenance-safe `reconcile` on undo                                   | Preserve the link and primary Micro history; new Habit credit is blocked. Undo may remove only the exact existing source-backed credit so stale derived success cannot survive a later mapping.                                             |
| Today/Home/My Routines/Calendar summaries          | `reconcile` read-only                                                             | Count supported rows only and add bounded review context without hiding known progress or claiming complete/setup/no-data.                                                                                                                  |
| Private export                                     | `view` raw owner data                                                             | Preserve stable identity, shape, and raw values 1:1. No export-format or support-download redesign.                                                                                                                                         |
| Repair, mapping, delete, repurpose, reorder        | `out of scope`                                                                    | A later owner-selected mapping/repair slice must define authorization, migration, and history semantics.                                                                                                                                    |

Child-structure rationale: existing unsupported check-ins are not rendered as interpreted day-level progress because type/mode defines what their fields mean. Raw rows remain intact in the authenticated private export and support evidence; the user-facing card explicitly confirms history preservation. This avoids presenting guessed child semantics while meeting the trusted-object boundary honestly.

## Data Placement And Sync Contract

- Server-canonical:
  - `habit_definitions` raw fields and stable IDs;
  - existing check-ins, resets, links, and source-backed check-in lineage;
  - private export rows.
- Derived server/view-model data:
  - `supported | unsupported` classification;
  - bounded unsupported reason keys/count;
  - supported-only summaries and analytics counts;
  - generic review copy/status.
- Local/client data:
  - no new localStorage, cookie, IndexedDB, offline buffer, or client-owned support classification;
  - existing transient tab/expanded-card state is unchanged and never becomes definition truth.
- Sync/conflict policy:
  - each server load classifies current raw rows; a future explicit mapping becomes effective on the next normal load without rewriting data;
  - direct rejected writes are non-retryable until software/data mapping changes and must never be auto-retried;
  - valid Micro truth may save independently, while its blocked Habit-credit result remains explicit;
  - no background repair, dual write, conflict merge, or optimistic classification is added.
- Retention/sensitivity:
  - existing user deletion/export retention behavior is unchanged;
  - Habit title, notes, check-ins, and raw future values remain private health-adjacent behavior data;
  - normal logs/analytics receive no raw values/title/notes.
- Cache/invalidation:
  - preserve force-dynamic/no-store and current mutation snapshot refresh behavior;
  - a rejected write performs no invalidation-requiring data mutation;
  - the client may reload normally after a later deployment adds support, but must not cache a fallback semantic.

## Identity And Rename Contract

- Canonical stable ID: `habit_definitions.id` remains immutable across definition view, check-ins, resets, Micro linkage, analytics counts, and export. Unsupported classification never creates a replacement row.
- Human-readable identifiers:
  - Habit title is private and renameable for supported rows, but is never a mapping key;
  - `Do`, `Quit`, `Timed`, `Active`, `Past habit`, and `Needs review` are display labels, not identity;
  - type/mode/status machine values classify behavior and must not be surfaced as user copy.
- Mutability:
  - unsupported rows are read-only in this slice;
  - supported-row mutability stays as today;
  - raw unsupported data and history are never normalized in place by a read.
- Rename versus repurpose:
  - a label-only rename for an existing machine value updates the shared view mapping and preserves history;
  - materially new semantics require a new explicitly mapped value or a new Habit, not repurposing a stored value silently.
- Compatibility:
  - no alias is introduced here;
  - a deprecated value needs an explicit compatibility alias with tests or remains unsupported;
  - H-081 values keep their current documented compatibility until their own audit.
- Observability/repair:
  - support uses stable ID, bounded reason field, machine error code, and owner-authorized export evidence;
  - no automated repair or raw-value log is introduced.

## Forward Compatibility Contract

Checklist: `docs/runbooks/task-brief-forward-compatibility-contract.md`.

- Extensibility surfaces:
  - Habit types, modes, statuses, display labels, actions, success metrics, Calendar mappings, Micro credit, analytics payload counts, support recovery, and private export.
- Source of truth:
  - known machine values come from canonical typed value sets aligned with current database constraints;
  - user-facing labels come from shared view-model/copy mappings;
  - raw rows remain server-canonical, while supported/unsupported is derived.
- Additive behavior:
  - a new row using already supported values automatically inherits current cards, summaries, Calendar mapping, analytics counts, and protected actions;
  - a new label for an existing value flows through one shared mapping without ID/history rewrite;
  - any unknown future value automatically enters the generic unsupported branch, keeps private data, blocks Habit writes/credit, and leaves known rows usable.
- Explicit mapping requirements:
  - every new type/mode/status requires database constraint and generated-type review, canonical union/parser update, semantic mapping for every consumer and mutation, UI/copy/a11y decisions, analytics/privacy review, export/support review, future-value and known-regression tests, and Help/support impact sweep before release.
- Unknown/deprecated values:
  - never inherit `binary`, `build`, `active`, due, done, streak, Perfect Day, Calendar, or Habit-credit semantics;
  - never appear as raw UI text or analytics/log payload;
  - remain read-only and owner-exportable until explicitly supported;
  - deprecated aliases are explicit and test-covered or fail closed identically.
- H-081 deferral:
  - category/operator/unit/cadence/day-policy/schedule/target compatibility remains unchanged;
  - Calendar Plan keeps and composes its existing cadence gate;
  - Child AA closeout must not claim the whole Habit definition contract is solved.
- Evidence:
  - independent unknown type, mode, status, and mixed fixtures;
  - known-value and omitted-create compatibility fixtures;
  - explicit unknown input, mixed-account, every-consumer, zero-write, export, analytics-redaction, and support-contract tests.

## Codex Skill And Stack Readiness Radar

Runbook: `docs/runbooks/codex-skill-stack-readiness-radar.md`.

Capability audit on `2026-09-01`:

- Local repository inspection, TypeScript/Next.js code, Vitest, Playwright, and existing screenshot/runbook tooling are sufficient.
- No external connector, plugin, MCP server, skill install, new dependency, or production-data write is needed.
- The repository's local visual-harness fallback is safer than weakening production constraints to manufacture unknown-value screenshots.

| Finding                                                              | Classification                   | Decision / return path                                                                                                                      |
| -------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| One shared H-080 discriminated classifier plus strict builder        | `bounded implementation child`   | Owned by Child AA; return exact consumer/test evidence to the parent.                                                                       |
| Direct write guards plus separate Micro-credit/retraction sub-result | `bounded implementation child`   | Owned by Child AA; preserve independent Micro truth, block new unsupported credit, and allow only exact provenance-safe retraction on undo. |
| H-081 remaining definition fallbacks                                 | `deferred architecture decision` | Do not change here; return unchanged H-081 to the parent for later classification audit.                                                    |

No local Codex configuration change is authorized or required.

## Expected Implementation Scope

Expected runtime/domain allowlist, subject to a brief checkpoint before any necessary expansion:

- `lib/habits/shared.ts`
- `lib/habits/server.ts`
- `app/api/my-library/habits/route.ts`
- `app/api/my-library/habits/[habitId]/route.ts`
- `app/api/my-library/habits/check-ins/route.ts`
- `app/api/my-library/habits/[habitId]/reset-stats/route.ts`
- `lib/dryland/micro-habit-linkage.ts`
- `lib/dryland/micro-plans.ts` only if needed to type the existing nested blocked result code
- `lib/my-library/today.ts`
- `components/my-library/TodayTabsPanel.tsx`
- `components/my-library/habits/HabitPerfectDayHub.tsx`
- `lib/my-library/calendar-daily-layers.ts`
- `lib/my-library/calendar-comparison.ts`

Expected regression-only or minimal adapter consumers:

- `app/my-library/habits/page.tsx`
- signed-in Home and `app/my-library/routines/page.tsx`
- current Calendar page/plan/comparison components
- `app/api/my-library/dryland/micro-plans/[planId]/route.ts`
- `lib/user/export.ts` and authenticated export route
- existing analytics event contract

Expected tests:

- `tests/unit/habits.test.ts`
- `tests/unit/habits-server.test.ts`
- `tests/unit/habits-routes.test.ts`
- `tests/unit/habit-perfect-day-hub.test.tsx`
- `tests/unit/habits-page.test.tsx`
- `tests/unit/my-library-today.test.ts`
- `tests/unit/home-page-routines-entrypoint.test.tsx`
- `tests/unit/today-tabs-panel.test.tsx`
- `tests/unit/my-library-calendar-daily-layers.test.ts`
- `tests/unit/my-library-calendar-plan.test.ts`
- `tests/unit/my-library-calendar-comparison.test.ts`
- `tests/unit/calendar-period-comparison-hub.test.tsx`
- `tests/unit/dryland-micro-plans.test.ts`
- `tests/unit/dryland-micro-plan-routes.test.ts`
- `tests/unit/dryland-micro-plan-panel.test.tsx`
- `tests/unit/user-export-payload.test.ts`
- relevant analytics payload/page tests

Required contract/support docs:

- this Child AA brief and parent lifecycle/return status;
- `docs/api-contracts.md`;
- `docs/user-flow-map.md`;
- `docs/runbooks/auth-account-support.md`;
- `docs/runbooks/gdpr-data-rights.md` for private Habit export/data-rights truth;
- canonical queue and design inventory only where lifecycle/status changes.

## Out Of Scope

- Adding, renaming, deprecating, or changing the semantics of a Habit type/mode/status.
- H-071 through H-075 or H-081 implementation.
- Category/operator/unit/cadence/day-policy/schedule/target normalization changes.
- Supabase migration, constraint, table, column, RLS, index, storage, generated database type, seed, or production-data rewrite.
- Admin repair/editor surface, raw-value viewer, automated backfill, history versioning, hard delete, or repurpose workflow.
- Analytics taxonomy/event rename, admin analytics dashboard work, new KPI event, raw diagnostic payload, or vendor.
- Export shape/format/redesign, account deletion behavior, new route, provider/native sync, reminder, notification, sound, or broad performance refactor.
- Broad Habits/Home/My Routines/Calendar redesign or navigation change.
- Creating unknown rows in a real user account or weakening constraints for QA/screenshots.
- Merge without explicit owner approval.

## Help / Guide And Operator Training Contract

- Required in the implementation PR:
  - update `docs/api-contracts.md` with the classification and direct/nested error contracts;
  - update `docs/user-flow-map.md` with supported-only counts and review states;
  - update `docs/runbooks/auth-account-support.md` with symptom, stable code, privacy-safe diagnosis, recovery/escalation, and no-history-rewrite behavior.
- In-app Help/Guide is `N/A` with a concrete rationale: the current Guide surfaces cover Poolside and `0-1000m`, while Admin Help is an unrelated operator workflow; there is no relevant Habit setup/recovery Guide to update. If execution discovers one, stop this N/A assumption and update it plus a Help assertion in the same PR.
- No user-facing repair action is added. `Needs review` directs the user to preserve/retry after mapping or contact support through existing channels; it must not promise an in-app fix that does not exist.
- The GDPR/data-rights runbook must confirm that the authenticated private export preserves raw unsupported values while normal UI, analytics, and logs do not expose them.
- Any label/recovery wording change triggers the route/label/support sweep before the first broad gate.

## Security, Privacy, And Compliance Contract

- Preserve current authentication and exact owner scoping on every definition/check-in/reset/link query.
- Cross-owner/missing IDs retain non-disclosing `404`; unsupported is reported only after an owner-scoped row is found.
- Run all unsupported guards before direct Habit insert/update/delete/upsert, before new linked credit, and before success analytics. The only exception is the explicitly allowlisted owner/plan/week/source-scoped retraction of an existing Micro-derived credit during a valid Micro undo.
- Do not include raw unknown values, Habit title, notes, check-in data, or owner identifiers in analytics or normal error logs.
- Private export remains authenticated and owner-scoped; no public or shareable diagnostic artifact is introduced.
- No secret, env value, elevated service credential, or RLS bypass is added.
- Expected failure paths are typed and must not become `500` or leak database errors.

## Observability And KPI Contract

- Keep the existing first-party `habits_viewed` event name and taxonomy.
- `activeHabitCount` includes only supported active rows. Unsupported rows never improve completion, Perfect Day, streak, Calendar, or Micro-credit success metrics.
- No new analytics event/property is required merely to detect unsupported private data.
- Support diagnostics are the stable response code plus bounded field reason/count in private UI/support context; no raw machine values or titles in logs/events.
- Success threshold: every unsupported fixture produces zero success-event emission and zero success-count contribution; known fixtures preserve today's event count/payload semantics.

## Performance And Cost Contract

- Classification is one linear pass per fetched definition set and reuses canonical lookup sets.
- No additional query on snapshot, Today/Home/My Routines, Calendar, export, or Micro link reads; no history-window expansion or added Motivation pass.
- PATCH may perform at most one owner-scoped current-definition pre-read/negative diagnostic read needed for merge-with-current validation and typed `409`; avoid per-field or per-consumer queries.
- Unsupported descriptors contain only existing display identity plus bounded reason keys, with no duplicate raw row payload.
- Existing route-level baseline remains: LCP `<= 2.5s`, CLS `<= 0.10`, INP `<= 200ms`, and TBT `<= 200ms` where the repo's performance harness can measure the changed core routes; authenticated fixture evidence additionally proves query counts and no N+1.
- No dependency, job, external request, or unbounded diagnostic list is introduced.

## Route, Label, And Support-Surface Impact Sweep

- Failure-mode evidence: focused route tests cover explicit input rejection, stored-definition conflicts, owner/missing paths, Micro post-save link-load/resume/credit failures, refresh failure after a successful resume write, and truthful undo no-match behavior; all expected unsupported paths produce no unexpected `500`.
- Identifiers searched: `getHabitType`, `getHabitMode`, `buildHabitDefinitionView`, `classifyHabitDefinition`, `binary`, `build`, `active`, `archived`, `habit_type`, `habit_mode`, definition `status`, `activeHabits`, `archivedHabits`, `activeHabitCount`, `habits_viewed`, `canCount`, `habitCredit`, `habitDefinitionSupport`, `Needs review`, `UNSUPPORTED_HABIT_DEFINITION`, and `UNSUPPORTED_HABIT_DEFINITION_VALUE`.
- Directories/surfaces checked: `app/`, `components/`, `lib/`, `tests/`, `types/`, `supabase/migrations/`, API contracts, user-flow documentation, support/GDPR runbooks, active/planned/done/blocked/deferred briefs, the AW-006 queue, design inventory, and relevant Help/Guide assertions.
- Fallout handled: shared domain/server builders, every direct Habit writer, linked Micro read/write/undo/renewal, Habits/Today/Home/My Routines, Calendar Plan/Trends, analytics counts, private export assertions, API/user-flow/support/privacy docs, parent/queue/inventory lifecycle, and focused tests were updated; historical references stay historical and H-081 cadence/category/operator/unit fallback remains explicitly deferred.

## Acceptance Criteria

1. Type-only, mode-only, status-only, and mixed persisted fixtures always return the unsupported branch; none becomes `binary`, `build`, `active`, or `archived`.
2. Supported-only fixtures remain behavior-identical across definitions, summaries, actions, exports, Calendar, Today/Home/My Routines, analytics, and linked Micro credit.
3. Unsupported rows contribute exactly `0` to active/archived, due/done, Perfect Day, cadence progress, streak/consistency, Motivation, absence-review eligibility, Today/Home/My Routines success, Calendar Plan/Trends, linked credit, and `habits_viewed.activeHabitCount`.
4. Habits renders each unsupported row exactly once as an accessible read-only `Needs review` card with stable title and history-preserved explanation, and without completion/edit/archive/restore/reset/source-credit actions.
5. Unsupported-only and mixed accounts never produce whole-surface `No habits yet`, `Add first habit`, `Done today`, `Week complete`, ordinary `No data`, `100%`, or a misleading `Needs review · 0%`; known progress remains visible with bounded review context.
6. Calendar Plan composes the central H-080 classifier with its existing cadence gate; Plan and Trends filter check-ins/resets by supported Habit IDs, count/name supported rows only, and expose bounded review context.
7. Explicit unknown or `null` create/update type/mode input returns `400 / UNSUPPORTED_HABIT_DEFINITION_VALUE` and zero writes; omitted create type/mode retains current compatibility defaults.
8. A shape-changing update with omitted type/mode inherits the already validated stored supported values instead of fallback defaults.
9. PATCH, check-in, and reset against an existing unsupported definition each return `409 / UNSUPPORTED_HABIT_DEFINITION`, run zero insert/update/delete/upsert, and emit zero success analytics.
10. A valid Micro completion/undo remains saved and returns `200` even when a post-save link load/resume/credit step fails; unsupported new Habit credit is `blocked` with the shared code, runs zero Habit insert, and emits no Habit-success event. Undo may remove only the exact owner/plan/week/source-scoped prior Micro credit, reports no-match without claiming removal, and performs no other Habit write. Unsupported link pause/resume/renew attempts return shared-code `409` before any plan/link write or success event.
11. Cross-owner/missing behavior remains non-disclosing `401/404`, and expected unsupported paths produce zero unexpected `500`.
12. Existing authenticated private export keeps stable ID and raw type/mode/status values 1:1 with unchanged shape; normal UI, analytics, and logs contain none of those raw unknown values or private notes.
13. Snapshot/Calendar/Micro supported reads add zero queries, PATCH adds at most one bounded owner-scoped guard, classification stays O(n), and no history/payload/dependency cost expansion violates the performance contract.
14. API, user-flow, support, parent, queue, inventory, and child lifecycle docs describe the same direct-Habit versus nested-Micro recovery contract and retain H-081 explicitly.
15. Focused domain/server/route/Today/Calendar/Micro/export/analytics/component/a11y tests pass, including every future-value and mixed-account fixture.
16. A deterministic temporary local harness using real components produces 2–4 owner-approved `after/reference` screenshots, then is removed before gates.
17. `git diff --check`, brief/quality lint, targeted tests, `verify:pre-pr`, required CI, and `verify:pre-merge` pass in sequence.
18. Every target score is at least `4/5`, and all target/critical rows are `5/5` before a strict `10/10` claim.

## Screenshot Handoff Requirements

Required because the new review state is visible. Follow the repository screenshot sequence and `docs/runbooks/ui-debug-hypothesis-and-handoff.md`.

- Comparison type: `after/reference`, not a redesign before/after.
- Artifact folder: `output/playwright/habits-definition-fail-closed-YYYY-MM-DD-HHMMSS`.
- Capture 2–4 representative full-resolution artifacts, including:
  - `after-habits-needs-review-mobile.png`;
  - `after-habits-needs-review-desktop.png`;
  - `reference-today-calendar-needs-review-desktop.png`, with real Today plus Calendar Plan/Trends review consumers in one deterministic reference page;
  - `reference-micro-habit-needs-review-mobile.png`.
- Explain for each image: stable private title, generic review explanation, absent mutation actions, known-progress handling, no false complete/setup/no-data state, Micro independence, and responsive/accessibility judgment. Home/My Routines shares the review-first Today label and remains covered by focused component/page assertions where it has no separate reusable renderer.
- Use the repo's temporary local visual-harness fallback with real production components if database constraints prevent an unknown-value fixture. Do not weaken constraints or use real owner data.
- Remove the harness after capture. Link the timestamped folder, record local capture time, and stop for owner approval or corrections before `verify:pre-pr`, commit/push, PR creation, or `verify:pre-merge`.
- If any product-rendering file, style, asset, or export HTML changes after capture, regenerate. Otherwise state explicitly that none changed.

## Manual QA Environments

- Local default: `SITE_LOCK_ENABLED=0`, Next dev on `http://127.0.0.1:3000`, using the repository's deterministic temporary fixture/harness when needed.
- Required viewports: mobile `320–390px`, tablet near `768px`, desktop `1440px`; include Chromium plus WebKit/Safari coverage where the harness supports it.
- Verify supported-only, unsupported-only, and mixed rows; direct mutation errors; independent Micro save plus blocked Habit credit; Today/Home/My Routines; Calendar Plan/Trends; private export; keyboard/focus/status semantics.
- Vercel preview: verify normal known-value flows and no route/build regression. Do not seed unsupported production-like rows merely for preview QA.
- Document local-versus-preview differences or `none`.

## Validation

Planning creation only:

- `git diff --check`
- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `npm run verify:docs-only`

Before implementation code, refresh audit/base, read the local Next.js 16 guides named above, move only this brief to `in-progress`, create the intended branch from latest `origin/main`, and record the checkpoint.

Focused implementation validation before screenshot handoff:

- targeted `npm exec vitest run` for the test files listed in Expected Implementation Scope;
- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- `git diff --check`
- targeted route/label/support sweep evidence.

After stable targeted QA:

1. Capture and inspect the required screenshots.
2. Stop for explicit owner screenshot approval or visual corrections.
3. After approval, run escalation-first `npm run verify:pre-pr`.
4. Commit, push, open/update the PR, and monitor required CI under the repository automation-first contract.
5. Run escalation-first `npm run verify:pre-merge` on the current PR head and report merge readiness without merging.

Any code, test, config, script, or runtime diff uses the full validation lane. No test may be silently skipped to make the gate pass.

## Rollout And Rollback Contract

- Ship the shared classifier, consumers, direct guards, nested Micro result, tests, and docs atomically in one PR; do not stage a fail-open consumer against the new model.
- No migration, secret, feature flag, or raw-data rewrite is expected.
- Before release/rollback judgment, confirm current database constraints and use only privacy-safe aggregate evidence to determine whether unsupported rows can exist in the target environment.
- A normal code/docs revert is safe only when unsupported-row occurrence is confirmed `0` under the deployed constraint set.
- If unsupported rows exist, do not roll back to silent coercion. Roll forward or retain the minimal fail-closed classifier/guards while fixing the regression.
- Rollback never rewrites, deletes, or normalizes raw definition/check-in/reset/link history.

## Automation, Git, And Session Continuity

- Current mode is active implementation on `codex/aw-006-habits-type-mode-status-fail-closed`. Runtime/tests/docs and screenshot capture are authorized; commit/push/PR wait until the required owner screenshot approval, and merge still requires separate explicit approval.
- When explicitly executed, use automation-first delivery with the screenshot approval exception: branch, implementation, targeted tests, screenshot handoff and stop, then pre-PR/commit/push/PR/CI/pre-merge.
- Never merge without explicit owner approval.
- Commit/push each validated implementation checkpoint; avoid unrelated batching. Open/update the PR after one complete vertical slice or 2–4 validated commits.
- Recovery order:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and the parent, then continue from the latest checkpoint.
- Record every meaningful checkpoint as `date | commit/working tree | completed scope | next step`.
- If tooling, credentials, screenshot capture, or CI blocks execution, state the exact blocker, one exact owner step, and the resume point.
- PR links open in Safari through the repository script when possible. Post-merge cleanup and the repo-managed docs-only closeout follow `AGENTS.md`; the mandatory chat-handoff assessment occurs after merge/sync/closeout.

## Return Contract

- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- Before closeout, return exact evidence for:
  - H-080 resolved/deferred status;
  - supported/unsupported classifier and every consumer/write path;
  - direct `400/409` and nested Micro blocked results;
  - zero-write/count/event guarantees;
  - private export/privacy and support recovery;
  - screenshots, target scores, validation, commit, and PR.
- H-081 and H-071–H-075 remain explicitly open unless a separate owner-selected brief later owns them.
- After merge/closeout, move this brief to `done`, update the parent/queue/inventory, reset `selected_child` to `none`, and do not imply another Habits child.

## Checkpoint Log

- `2026-09-01 | planned-validated | owner said "Gjør som anbefalt" after the parent recommended Child AA; created this plan-only H-080 brief from clean synced main@9d315c53 plus the uncommitted parent planning refresh, with one central type/mode/status boundary, direct Habit 400/409 guards, independent Micro save plus blocked Habit credit/provenance-safe retraction, visible review state, and forward-compatibility contract; git diff --check, changed-brief lint, all-brief lint including this new file, and verify:docs-only passed; no branch, runtime implementation, screenshot, commit, push, or PR started | next: wait for explicit execute/build/implement/kjør before moving this brief to in-progress`
- `2026-09-01 | in-progress | owner explicitly said "Kjør Child AA"; fetched origin, confirmed HEAD and origin/main at 9d315c53, created codex/aw-006-habits-type-mode-status-fail-closed, moved this brief to in-progress, and selected H-080 only | next: implement the shared classifier, consumers, mutation guards, tests, and docs, then stop at the required screenshot handoff before pre-PR gates`
- `2026-09-01 | screenshot-approval-stop | implemented the shared supported/unsupported classifier, fail-closed direct Habit and linked Micro boundaries, supported-only Today/Home/Calendar/analytics consumers, read-only Habits/Micro review states, private-export preservation, support/API/user-flow contracts, and parent/queue/inventory lifecycle updates; three independent final reviews found no remaining P0/P1 and their bounded P2/P3 fixture, refresh-truth, parent-status, and spy-cleanup findings were fixed; targeted route/label/support sweep covered classifier/builders, type/mode/status, active/archived/count analytics, Micro credit/link state, review labels, API docs, user flow, support and GDPR runbooks, with H-081 retained; PASS 18 focused Vitest files / 351 tests, npm run typecheck, npm run lint with 0 errors and 8 unrelated existing warnings, npm run lint:briefs:all for 560 briefs, and git diff --check; captured and inspected four after/reference artifacts at output/playwright/habits-definition-fail-closed-2026-09-01-131633 using real production components plus deterministic synthetic data, verified 390 px and 1440 px no-overflow/action-absence assertions, removed the temporary harness, confirmed its route returns 404, and changed no product-rendering file/style/asset after final capture | next: wait for explicit owner screenshot approval or visual corrections before npm run verify:pre-pr, commit, push, PR, CI, and npm run verify:pre-merge`
- `2026-09-01 | screenshots-approved | owner explicitly approved the four after/reference artifacts; no product-rendering file, style, asset, or export HTML changed after final capture | next: run npm run verify:pre-pr, commit, push, open PR, monitor required CI, then run npm run verify:pre-merge`
- `2026-09-01 | pre-pr-green | first npm run verify:pre-pr attempt stopped at the deterministic brief quality gate because the operational evidence did not use the required literal phrases for unexpected-500 coverage and the route/label/support sweep; added those exact evidence labels without changing scope or runtime, confirmed npm run lint:quality-gates, then reran the full gate successfully: branch-current and brief/governance checks passed; ESLint reported 0 errors and 8 unrelated existing warnings; TypeScript passed; Vitest passed 264 files / 1888 tests; the production build passed; route performance budgets passed with a 16.8% worst margin and the baseline decision remains hold at green run 1/2; Playwright passed 111 tests with 573 environment/profile skips in 5.4 minutes; verify-open reported PASS | next: run final brief lint and git diff check, commit, push, open PR, monitor required CI, then run npm run verify:pre-merge`
- `2026-09-02 | pr-size-recovery | committed and pushed 0c98df7b, opened PR #1251, and observed every required CI job except PR Size pass; the size check correctly rejected 4538 changed lines against its hard 4000-line limit; preserved the atomic Child AA behavior and all required scenarios while removing Markdown table-formatting churn, an unrelated unchanged-auth export assertion, duplicate completed sweep instructions, and repetitive test fixture/setup/expected blocks; no product-rendering file/style/asset/export HTML changed, and the resulting main diff is 3953 lines including this checkpoint; PASS focused Vitest 5 files / 77 tests, npm run typecheck, npm run lint:briefs:all for 560 briefs, and git diff --check | next: rerun npm run verify:pre-pr on the revised HEAD, commit and push the bounded recovery, confirm required CI including PR Size, then run npm run verify:pre-merge`

## Completion Record

- `status`: implementation, targeted QA, owner screenshot approval, initial full pre-PR, commit/push, and PR creation are complete; a bounded PR-size recovery awaits full pre-PR, update push, CI, and pre-merge; merge and closeout remain open.
- `10/10 claim`: no - the revised HEAD still needs full pre-PR, required CI, pre-merge, merge evidence, and closeout scores.
- Target-category achieved scores: to be filled only from implementation/merge evidence.
