# Task Brief: AW-006 Habits Absence Review Not Tracked Day Status (10/10)

## Metadata

- `id`: `2026-09-03-aw-006-habits-absence-review-not-tracked-status-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-09-03`
- `updated`: `2026-09-03`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `parent_child`: `Child AB`
- `target_findings`: `H-082`
- `execution_mode`: `owner explicitly said Kjør Child AB; execute the scoped workstream end to end with the required screenshot approval stop before pre-PR gates`
- `intended_branch`: `codex/aw-006-habits-absence-review-not-tracked-status`
- `strict_10_10_mode`: `yes; visible changes require owner screenshot approval before pre-PR gates`

## Brief Audit Record

- `last_audited`: `2026-09-03`
- `base`: clean synced `main@4d874404` after the Child AA repo-managed closeout in PR `#1252`.
- `audit_status`: `active`; pickup audit began on clean synced `main@4d874404` before branch creation.
- `decision`: Execute Child AB as the only active H-082 slice for a reversible whole-local-day `not_tracked` review disposition, with H-071 and every other parent finding still outside scope.
- `reason`: The current server-canonical absence-review row can only store workflow `status = reviewed`. It can close a visible review day but cannot truthfully distinguish a day the user explicitly says was not tracked from Done, Missed, Rest day, Slip, Perfect Day, a clear Quit day, or ordinary missing evidence.
- `must_refresh_before_execution_if`: Refresh if `AGENTS.md`, task-brief or scorecard rules, `HabitPerfectDayHub`, Habits snapshot and Motivation helpers, absence-review/check-in routes, linked Micro Session Habit credit, local-day handling, Calendar Plan/Trends, comparison math, analytics taxonomy, Supabase migrations/RLS/generated types, Help/Guide/support surfaces, H-071/H-074 disposition, screenshot rules, or verification lanes change after `main@4d874404`; also refresh if `origin/main` advances before execution.
- `scope_stop`: Stop and revise before implementation if the safe design requires all-history review discovery or mutation, definition history/versioning, a new Habit check-in status, changing Rest/Skip semantics, destructive migration/backfill, cross-week bulk action, new provider, new analytics vendor, or a broad Calendar/Motivation/Trends redesign.

## Goal

Let a user explicitly and reversibly mark one visible absence-review day, or all currently visible review days, as not tracked while preserving truthful statistics, later correction, server ownership, and the existing date-first review flow.

## Pre-Implementation Owner Explanation

Vi gjennomfører en egen `Ikke registrert`-status for dager brukeren faktisk ikke førte Habits. Brukeren skal kunne ta review-dagene én etter én eller markere alle dagene som vises akkurat nå samlet. Statusen skal kunne angres, og en senere ekte registrering skal alltid overstyre den.

Hvorfor det betyr noe: manglende data er ikke det samme som at en vane ble fullført eller mislyktes. Når appen skiller «ikke registrert» fra Done, Missed, Rest day og Slip, blir prosenter, coverage, streaks, Calendar, Motivation og Trends mer ærlige.

Utenfor scope er en samlet kø eller bulkhandling på tvers av eldre uker/all history, bred historikk-/ytelsesrefaktor, nye Habit-check-in-statuser, endret Rest/Skip-regelverk og redesign av hele Habits eller Calendar. Brukeren kan fortsatt navigere til én uke om gangen; Child AB oppdager eller behandler aldri flere enn den valgte synlige uken.

Fremoverkompatibilitet: synlige dagstatusetiketter skal komme fra én delt mapping, mens stabile maskinverdier for review- og dagstatus forblir separate. Handlingscopy er overflatestyrt og må oppdateres eksplisitt sammen med analytics-ID, a11y, tester og support når en ny reviewhandling innføres. En ny status må få eksplisitt database-, TypeScript-, domene-, metrikk-, UI-, analytics-, test- og supportmapping før release. Ukjente verdier skal feile lukket og aldri arve suksess-semantikk.

## Parent Finding Owned

| Finding | Child AB disposition                                                                                                                                                                                                                                                                                                                              |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `H-082` | Own the explicit nullable `not_tracked` whole-day disposition on existing server-canonical absence-review acknowledgement rows, including single and visible-batch review actions, Undo, later-check-in precedence, metric semantics, Calendar/Motivation/Trends consumers, analytics, support, migration safety, tests, and screenshot evidence. |

Explicitly not owned:

- `H-071`: older-week or all-history absence-review breadth. Child AB operates only on review candidates visible in one selected ISO week; existing week navigation remains, but there is no cross-week discovery, queue, or bulk action.
- `H-074`: deep-history snapshot/query redesign or performance architecture.
- `H-081`: category, operator, unit, cadence, schedule, or target legacy/future definition classification.
- `H-072/H-073/H-075`: broad Home hash/browser coverage and legacy catch-up event-taxonomy cleanup beyond focused tests and directly required event mapping.
- A new Habit check-in status, Rest day/Skip semantics, vacation mode, reminders, hard delete, export redesign beyond the bounded additive `habitDayStatuses` portability contract, definition-history versioning, provider/native sync, or broad Habits/Calendar redesign.

## Pickup Audit And Active Implementation Evidence

- `habit_absence_review_acknowledgements` is already the owner-scoped server-canonical review table, uniquely keyed by user, review scope, and review date.
- At pickup on `main@4d874404`, its database constraint accepted only workflow `status = reviewed`. Existing rows therefore meant that a day was acknowledged, not why it was closed.
- At pickup, `POST /api/my-library/habits/absence-review` validated authentication, local-day context, ISO dates, future dates, and a bounded date list, then upserted every submitted row as `status = reviewed`.
- `loadHabitSnapshot` derives review eligibility and mutation membership only from the selected ISO week. Its day-status metric reader now follows the existing check-in evidence boundary so Motivation `All` and other current consumers see matching status/check-in history; this does not add older-week review discovery or mutation, and H-074 owns a later query-window split.
- The date-first review UI already supports `Start review`, `Dismiss`, `Done with this day`, `Close review`, selected historical dates, server persistence, and normal Habit controls. Child AB should extend this mature flow rather than create another recovery surface.
- Existing check-ins, including Rest day, Slip, timer/manual sources, and linked Micro Session credit, are the canonical evidence for what was actually recorded on a Habit and date.
- Candidate authority treats any owner check-in row on the selected-week date as recorded evidence, including rows attached to archived or fail-closed unsupported Habit definitions. Those rows block whole-day `not_tracked` without gaining supported metric credit, and the bounded snapshot exposes only their unique dates rather than private child content.
- At pickup, Motivation and Calendar projections had no whole-day unknown-observation contract. Without one explicit shared rule, a new marker could drift into false success, false failure, streak protection, or inconsistent denominators.
- At pickup, the private user export included Habit definitions/check-ins but not review acknowledgements. Once `day_status` changes visible metrics it must be exported as bounded canonical user history so downloaded data can explain those metrics.
- Child AA already established the broader fail-closed principle for unknown Habit definition values. Child AB must apply the same principle to future review/day-status values without conflating definition `status`, acknowledgement workflow `status`, and nullable `day_status`.

## External Reference Snapshot

These official product references are directional benchmarks, not imported semantics:

| Source                                                                                                                           | Observed product pattern                                       | Child AB boundary                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Habitify Progress, https://habitify.me/onboarding-instruction/progress                                                           | Progress views separate status and time-range reporting.       | FreeSwimming must pair performance with explicit data coverage instead of treating unknown days as ordinary completion data.        |
| Habitify Skip, https://habitify.me/onboarding-instruction/use-skip                                                               | Skip is an intentional day-off action that protects a streak.  | `not_tracked` is deliberately different: it is unknown observation coverage, not Rest/Skip, and cannot protect or extend a streak.  |
| Productive previous days, https://support.productiveapp.io/hc/en-us/articles/26920673789585-How-to-mark-habits-for-previous-days | Users can correct earlier days from a historical date surface. | Child AB preserves later correction but marks only the currently visible selected-week review candidates, not every historical day. |
| Productive Done/Skip/Undo, https://support.productiveapp.io/hc/en-us/articles/35967057602065-How-to-mark-a-habit-as-done         | Explicit historical actions can be undone.                     | Child AB requires an explicit Undo for the neutral day marker, while keeping it distinct from Done and Skip.                        |

Benchmark conclusion: `not_tracked` is not a synonym for either product's Skip/Rest behavior. It records lack of trustworthy observation and therefore changes coverage, not success.

## Canonical Day-Status Contract

### Persisted shape

- Reuse the existing `habit_absence_review_acknowledgements` row.
- Keep workflow `status = reviewed` as a separate, required field with its existing meaning: the review item has been acknowledged and should not re-prompt.
- Add nullable `day_status` with exactly one initially supported persisted value: `not_tracked`.
- Existing rows receive `day_status = null` through an additive nullable migration with no backfill or reinterpretation.
- `day_status = null` means no explicit whole-day not-tracked disposition. It does not itself claim that the day was tracked, completed, missed, rested, or slipped.
- The database constraint is `day_status is null` or one explicitly supported value. The application uses a shared parser before any metric or UI consumer.

### Scope and identity

- `not_tracked` applies to the whole effective local calendar day, not to one Habit and not to a definition.
- The existing canonical identity remains owner plus `review_scope` plus `review_date`; `day_status` is mutable state, never identity.
- A date can be newly marked only when the server independently derives it through the existing H-077 candidate contract as a currently visible selected-ISO-week past date with recovery history, at least one eligible non-Quit/non-source-backed Perfect Day item, zero recorded Habit actions, and no existing supported `not_tracked` marker.
- The client cannot use this route to mark arbitrary dates, hidden dates, another week, Today, a future date, or an already tracked day.
- H-071 stays explicit: bulk means all visible eligible dates in one selected-week review set, never multiple weeks or all history. Existing week navigation may select an older week without creating a cross-week queue.

### User actions

- Single: from one visible review date, `Mark this day not tracked` writes `status = reviewed` and `day_status = not_tracked` for exactly that date.
- Visible batch: `Mark visible days not tracked` includes the visible affected count in its accessible name/copy and atomically applies the same state to every exact current server-derived visible candidate. Already marked dates are not new candidates or normal batch inputs; a lost-response retry may include only current candidates plus already matching selected-week markers and remains a no-op for those rows.
- Undo: `Undo not tracked` atomically sets `day_status = null` on the same row while retaining `status = reviewed`. Undo removes the neutral marker, restores ordinary derived metric semantics for the zero-action date (which may therefore be Missed again), and does not re-open or re-prompt the already reviewed date. The selected historical date keeps a bounded status/Undo recovery row if later archiving or definition changes remove its original H-077 candidate children; it does not return to the Today queue or visible batch.
- Existing `Dismiss`, `Done with this day`, and `Close review` retain acknowledgement-only behavior and leave `day_status = null`; they must never silently become aliases for either single or batch not-tracked actions.
- Repeating single, batch, or Undo requests is idempotent. A lost response can be retried without duplicates or a different result.
- No action in this contract inserts, updates, deletes, or synthesizes a `habit_check_ins` row.

### Later-check-in precedence and races

- Any later supported Habit check-in for that local date atomically sets the acknowledgement row's `day_status` to null in the same server transaction as the successful check-in mutation.
- This includes binary/count completion, Rest day, Slip, timer time, manual time, and source-backed linked Micro Session Habit credit. The Micro Session's primary truth remains independent; only a successfully persisted Habit credit clears `day_status`.
- The check-in and nulling operation commit or roll back together. A failed check-in leaves `not_tracked` unchanged.
- Read precedence is deterministic: if a supported check-in exists, consumers treat the day as tracked even during a concurrent stale read; `not_tracked` can never override supported check-in evidence.
- Race handling must guarantee that concurrent mark-not-tracked and check-in requests cannot end with both an effective `not_tracked` state and a supported check-in. The supported check-in wins through transaction/locking or an equivalent deterministic database invariant.
- Clearing or undoing the later check-in does not revive `not_tracked` because the successful check-in already nulled the stored marker. Restoring it requires a new explicit mark-not-tracked action, if the date is still an eligible visible review candidate.

## Metric And Consumer Contract

### Shared units and formulas

- `evaluation unit`: the existing canonical denominator object for the metric being shown: an eligible day for day-average/Perfect Day reporting, a scheduled Habit-day opportunity for per-Habit consistency, or a cadence period for weekly/monthly any-day reporting. Consumers must name that unit and must not mix units in one ratio.
- `potential units`: those evaluation units in the selected reporting period before the `not_tracked` coverage exclusion.
- `known units`: potential units whose result is known under existing Habit semantics and is not hidden by an effective whole-day `not_tracked` marker.
- `successful units`: the existing mapped successes among known units. Child AB does not redefine success.
- `performance percentage`: successful units divided by known units.
- `coverage`: known units divided by potential units, shown together with a separate `not tracked` day count.
- Effective `not_tracked` units contribute zero to both the performance numerator and denominator. They remain in the potential coverage denominator.
- When known units are zero, the user-facing result is `No tracked data` with coverage context, never `0%` or `100%` performance.
- Example for a day-based seven-day range with two `not_tracked` dates, four Perfect Days, and one Missed day: `4/5` performance units, `80%` performance, `5/7 · 71% coverage`, and `2 not tracked`; no streak can bridge either unknown date.

### Status and period rules

- Effective `not_tracked` contributes exactly zero to Done, Missed, Rest day, Slip, Perfect Day, clear Quit day, successful period completion, or success-bearing analytics.
- It is not styled or worded as a success, failure, excuse, pause, Rest day, or Skip.
- A streak cannot start, extend, remain protected, or bridge across an effective `not_tracked` gap. The gap breaks continuity without being labelled Missed; a previously earned best streak remains unchanged.
- For weekly/monthly any-day cadence, a period already proven met by supported recorded evidence remains met.
- If a closed any-day period is otherwise unmet but includes an effective `not_tracked` gap that could have contained the missing evidence, its result is `unknown` and stays out of the performance denominator. It is not converted to Missed or Done.
- Open periods retain their current in-progress semantics; `not_tracked` cannot prematurely close them as met or missed.

| Consumer                         | Required `not_tracked` behavior                                                                                                                                                                                                                                                                                                                                                                               | Later supported check-in                                                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Habits review                    | Show one neutral whole-day `Not tracked` state and accessible Undo. Do not show completion/failure credit.                                                                                                                                                                                                                                                                                                    | Remove the effective marker and render the actual existing Habit state.                                                 |
| Weekly Overview                  | Treat the day percentage as unavailable, exclude the date from the week average/performance fraction, and show included/potential eligible-day coverage plus not-tracked count where material.                                                                                                                                                                                                                | Recompute using the actual supported check-in.                                                                          |
| Perfect Day                      | The day is ineligible for Perfect Day and does not increment perfect-day totals or streaks.                                                                                                                                                                                                                                                                                                                   | Re-evaluate from the complete supported day evidence.                                                                   |
| Quit                             | The day is neither clear nor a slip and cannot extend a clear-day streak.                                                                                                                                                                                                                                                                                                                                     | Apply the recorded Slip/Rest/other supported contract; no implicit revival after clear.                                 |
| Calendar                         | Show a neutral, non-success/non-failure `Not tracked` daily layer; do not include it in Done/Missed/Rest/Slip/Perfect counts.                                                                                                                                                                                                                                                                                 | Actual check-in layer has precedence and the neutral marker disappears.                                                 |
| Motivation                       | Keep success/performance conditional on known units, add explicit `Coverage` and `Not tracked` values, and use no failure or blame copy for unknown days.                                                                                                                                                                                                                                                     | Recompute coverage and performance from recorded evidence.                                                              |
| Trends / Calendar Comparison     | Replace the misleading `Tracked days` label with `Included days` plus explicit known/potential coverage and not-tracked values, retain known units and real duration/count actuals from partially known days, award Perfect Day only to fully known days, read markers in both bounded compared ranges, and do not imply improvement/decline when coverage is materially different without a coverage caveat. | Recompute the affected period; no duplicate category remains.                                                           |
| Today/Home/My Routines summaries | Never count `not_tracked` as Done, complete, Perfect, clear Quit, or success. Use bounded neutral context only if this historical state is surfaced.                                                                                                                                                                                                                                                          | Supported snapshot truth wins.                                                                                          |
| Analytics                        | No completion, success, streak, Perfect Day, clear Quit, or missed event/value is emitted from the day-status action.                                                                                                                                                                                                                                                                                         | Existing check-in analytics remain canonical; no synthetic override-success event is added.                             |
| Private user export              | Include a bounded `habitDayStatuses` list containing only non-null day-status rows with stable ID, review scope/date, raw owner-private day status, and timestamps; never export neutral acknowledgement-only rows or fabricate check-ins.                                                                                                                                                                    | Export reflects the cleared marker normally after override and preserves the actual check-in through its existing list. |

## Mutation And Failure-Mode Contract

| Case                                                         | Required result                                                                                                                                                                                                             | Write guarantee                                                                                                                                  |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Single current visible candidate                             | Typed success with the actually changed date, or zero affected rows for a same-state retry, plus refreshed snapshot/coverage.                                                                                               | One idempotent acknowledgement-row upsert/update; zero check-in writes.                                                                          |
| All current visible candidates                               | Typed success with the database-confirmed actually changed count/dates and refreshed snapshot/coverage.                                                                                                                     | One atomic batch operation for the exact eligible set; already matching dates are no-ops, with no partial date failure and zero check-in writes. |
| Undo                                                         | Typed success with `day_status = null`, reviewed acknowledgement retained, and zero affected rows on an already-null retry.                                                                                                 | One owner-scoped update; no acknowledgement delete and zero check-in writes.                                                                     |
| Later supported check-in                                     | Existing check-in response plus refreshed truthful snapshot.                                                                                                                                                                | Check-in and `day_status = null` commit atomically; no synthetic review/check-in row.                                                            |
| Concurrent day-status/check-in writes                        | Supported check-in wins deterministically.                                                                                                                                                                                  | No committed state may expose effective `not_tracked` beside a supported check-in.                                                               |
| Invalid or unknown action/day status                         | `400` with stable machine code and generic copy.                                                                                                                                                                            | Zero writes and zero analytics.                                                                                                                  |
| Date outside current server-visible selected-week candidates | `409` stale/ineligible review-set response with refresh guidance, except bounded same-state single/batch retries for already matching markers and Undo for an owner-scoped acknowledgement on the selected historical week. | Zero writes and zero analytics.                                                                                                                  |
| Invalid/future date or timezone                              | Preserve strict `400` validation and local-day contract.                                                                                                                                                                    | Zero writes and zero analytics.                                                                                                                  |
| Stale rendered local day                                     | Preserve `409 STALE_LOCAL_DAY_CONTEXT`.                                                                                                                                                                                     | Zero writes and zero analytics.                                                                                                                  |
| Unauthenticated request                                      | `401`.                                                                                                                                                                                                                      | Zero reads beyond auth and zero writes.                                                                                                          |
| Missing migration/schema                                     | `503` with safe sync copy.                                                                                                                                                                                                  | Zero fallback check-ins or local historical truth.                                                                                               |
| Export before the additive schema is available               | Preserve rollout compatibility with `habitDayStatuses: []`; any real query failure remains an export failure.                                                                                                               | Never fabricate a status or silently drop rows after the schema is known available.                                                              |
| Database/transaction failure                                 | Safe retryable failure; UI keeps current review context and does not advance or claim success.                                                                                                                              | Atomic rollback; no partial batch or half-cleared status.                                                                                        |

Failure-mode evidence must prove no unexpected `500` for expected auth, validation, stale-context, unknown-status, ineligible-date, or schema-missing paths. True storage failures may return a stable generic `500` without database details and without optimistic UI success.

If acknowledgement/day-status loading fails, Habits, Calendar, Motivation, or Trends must not assume there are zero markers. Affected percentages/comparisons become explicitly unavailable or `Needs review` until a truthful bounded reload succeeds; they do not fall back to normal zero/success data.

For a historical `habits_viewed` page view, `perfectDayPercent` must be nullable or omitted when the selected day is effectively `not_tracked`, with only a bounded mapped day-status field if needed. It must never emit the marker as a false numeric `0` or expose a raw unknown value.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Data placement and sync boundaries`
- `Caching and invalidation strategy`
- `Reliability and failure handling`
- `Security and authz`
- `Privacy and compliance`
- `Content governance`
- `Analytics and KPI observability`
- `Incident response and support operations`
- `i18n operational readiness`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                                                                                                                                                                                                                      | Evidence                                                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Exactly one whole-day `not_tracked` disposition supports single and visible-batch review inside the selected ISO week; H-071 remains outside.                                                                                                                                                                                                                                                           | domain contract, consumer matrix, component tests, parent return audit  | `5/5`                   |
| UX flow clarity                               | `target`     | Single, batch, pending, success, error, retry, and Undo each have one clear next action; later check-in replacement has no dead end or false completion copy.                                                                                                                                                                                                                                           | component/e2e tests and screenshot approval                             | `5/5`                   |
| Visual design quality                         | `target`     | Neutral state uses mature Habits/Calendar tokens, never success/failure color alone, has no overlap at 320, 768, or 1440 px, and receives 2–4 owner-approved screenshots.                                                                                                                                                                                                                               | responsive screenshot artifact handoff                                  | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Day-status mutations create exactly zero check-ins and zero success/failure credit; formulas, any-day periods, atomic batch, Undo, check-in clearing, and race precedence match this brief in deterministic tests.                                                                                                                                                                                      | domain, transaction, route, snapshot, consumer tests                    | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because Child AB changes a private user Habits review flow, not an admin editor, publishing flow, or operator queue.                                                                                                                                                                                                                                                                                | explicit admin-editor scope rationale                                   | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Actions and states have accessible names, keyboard/focus order, programmatic pending/result status, no color-only meaning, and zero new serious/critical automated violations.                                                                                                                                                                                                                          | Testing Library, focused axe/browser check, screenshots                 | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | No expansion of existing check-in evidence bounds, per-date/per-Habit query, N+1, chart dependency, or route payload redesign; day-status evidence shares those consumer bounds, batch is one bounded server operation, and existing route budgets remain green.                                                                                                                                        | query/call-count review, build and performance gates                    | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Acknowledgement `status` and nullable `day_status` are server-canonical, check-ins remain canonical evidence, local state is transient only, and reload/cross-device reads agree.                                                                                                                                                                                                                       | migration/RLS/type audit, snapshot and cross-reload tests               | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Successful mark, batch, Undo, and check-in override return or invalidate to one fresh snapshot; zero stale neutral marker remains after a confirmed override.                                                                                                                                                                                                                                           | cache/invalidation contract and route/component tests                   | `5/5`                   |
| Reliability and failure handling              | `target`     | Same-state requests are idempotent, batch is all-or-nothing, failed requests advance zero dates, lost responses are retry-safe, and expected failures produce no unexpected `500`.                                                                                                                                                                                                                      | failure-mode and race/negative-path tests                               | `5/5`                   |
| Security and authz                            | `target`     | Every request is authenticated and owner-bound; reads and acknowledgement-only writes retain RLS, the service-only day-status RPC receives only the authenticated user ID after candidate validation, and the no-execute clear trigger derives identity from the authorized check-in row. Exact status, real date, local-day, selected-week, and candidate guards reject forged input with zero writes. | grants/RLS/trigger review, route negative paths, local PostgreSQL smoke | `5/5`                   |
| Privacy and compliance                        | `target`     | Persist only owner/scope/date/workflow status/day status/timestamps; owner-private export preserves bounded raw status evidence, while no Habit title, note, raw unknown value, or private check-in detail enters analytics, normal logs, or UI errors.                                                                                                                                                 | schema/export/payload/log review and privacy tests                      | `5/5`                   |
| Content governance                            | `target`     | Database constraint, generated types, shared parser/copy, API contract, user-flow map, support runbook, parent, queue, inventory, and child describe identical semantics and H-071 boundary.                                                                                                                                                                                                            | route/label/support impact sweep and docs assertions                    | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin role, admin CRUD, repair tool, publish state, or operator mutation surface changes.                                                                                                                                                                                                                                                                                                | explicit admin-workflow scope rationale                                 | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because Habits, Calendar, Motivation, and Trends are private authenticated surfaces with no public metadata, sitemap, robots, or canonical URL change.                                                                                                                                                                                                                                              | private-route SEO rationale                                             | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because private Habit and review data must not become public or AI-discoverable, and no structured-data/public content surface changes.                                                                                                                                                                                                                                                             | explicit private-data rationale                                         | `N/A`                   |
| Analytics and KPI observability               | `target`     | Stable first-party action/status mapping distinguishes single, visible batch, and Undo; failures emit zero success event; `not_tracked` contributes zero success KPI and payloads contain no label/PII.                                                                                                                                                                                                 | analytics event/payload tests and KPI contract                          | `5/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no catalog, price, checkout, Stripe, entitlement, refund, payout, or revenue workflow changes.                                                                                                                                                                                                                                                                                              | explicit commerce scope rationale                                       | `N/A`                   |
| Incident response and support operations      | `target`     | Support can diagnose marker, selected-week limitation, coverage math, Undo, later-check-in override, and safe retry using stable owner-scoped evidence without private Habit text.                                                                                                                                                                                                                      | support runbook and recovery-path tests                                 | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: no invoice, refund, payout, accounting, revenue report, entitlement reconciliation, or finance truth changes.                                                                                                                                                                                                                                                                 | explicit finance scope rationale                                        | `N/A`                   |
| i18n operational readiness                    | `target`     | Stable machine values are separate from shared display labels, no raw status becomes copy, and longer localized actions/statuses remain usable at 320 px; new locales require explicit translation mapping.                                                                                                                                                                                             | copy-source audit, responsive screenshots, tests                        | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse Next.js route boundaries, shared TypeScript domain/view-model contracts, current Supabase/RLS patterns, `HabitPerfectDayHub`, Calendar adapters, and existing tests with zero new dependency or parallel renderer.                                                                                                                                                                                | architecture/dependency diff and review                                 | `5/5`                   |
| Testing and QA automation                     | `target`     | Focused domain/server/route/component/Calendar/Motivation/Trends/export/analytics tests cover single, batch, Undo, check-in override/clear, races, unknown future status, and H-071 exclusion; screenshot and full gates pass.                                                                                                                                                                          | Vitest, focused authenticated Playwright, screenshots, verify/CI gates  | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Review discovery/mutation stays bounded to at most seven visible dates in one selected ISO week and uses one batch mutation. Status evidence follows existing bounded consumer/check-in ranges; no independent review-backlog/all-history discovery query, background job, external service, or unbounded diagnostic list is added.                                                                     | query/window/cost audit                                                 | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Additive nullable migration lands before writes; after any non-null marker may exist, rollback retains the day-status-aware reader floor plus check-in-clear trigger and removes only writer/UI behavior through a scoped deploy or roll-forward; rows/column are preserved, and current-SHA release gates and CI pass.                                                                                 | migration/rollout/rollback record and gates                             | `4/5`                   |

Release gate: every target category must reach at least `4/5`. Strict 10/10 closeout requires every target and every critical target above to reach `5/5` with recorded evidence.

## Stack / Architecture Best-Practice Gate

React/Next.js:

- Execution read the current local Next.js 16 route-handler, server/client-component, and caching guides under `node_modules/next/dist/docs/`; the protected POST remains request-time/non-cached and the server/client boundary remains unchanged.
- Reuse `/my-library/habits`, `HabitPerfectDayHub`, the date-first review rows/panel, existing selected-date navigation, and current private/dynamic route boundaries.
- Keep candidate derivation and metric truth server/domain-owned. Client code receives typed visible rows and safe projection fields; it never decides eligibility from text or stale local arrays.
- Reuse Calendar Plan/Comparison and Motivation view-models rather than creating route-local metric formulas or a parallel status renderer.

TypeScript/domain:

- Define distinct typed contracts for acknowledgement workflow `status` and nullable `day_status`.
- Add one shared day-status parser/classifier and one shared display mapping. Do not duplicate known-value lists or labels across JSX, Calendar, Motivation, Trends, analytics, or routes.
- Model potential, known, and successful units plus unknown any-day periods explicitly enough that a future consumer cannot silently use the old denominator.
- Make race and later-check-in precedence a domain/database invariant, not a render-only preference.

Supabase/data:

- Use an additive migration for nullable `day_status`, its exact check constraint, atomic mark/batch/Undo operations, owner-scoped RLS, and the transaction path that clears status with a successful check-in.
- Update `types/database.ts` and any generated/select contracts in the same PR.
- Preserve the existing unique owner/scope/date identity and cascade deletion. Add no new table or backfill.
- Re-audit every Habit check-in writer, including linked Micro Session Habit credit, so the atomic clear invariant has no bypass.
- Add migration/RLS/authz and cross-owner negative-path evidence. If one transaction cannot safely cover a writer, stop and revise before shipping.

External services/tools:

- N/A. No external habit provider, analytics vendor, SDK, webhook, secret, background job, or network dependency is required.

UI system:

- Reuse current Habits action/card tokens, Calendar neutral/review-needed patterns, status semantics, mobile action-layout contract, and existing feedback primitives.
- Keep `Not tracked` visually neutral. Do not reuse green Done, red/amber Missed/Slip, or Rest day treatment.
- Provide explicit batch scope/count, pending/error feedback, and Undo without a second nested review workflow.
- Comparison type is `after/reference` unless a true before/after capture is practical. Owner screenshot approval is required before `verify:pre-pr`.

Testing:

- Cover domain formulas, selected-week eligibility, server transaction/race behavior, route auth/validation/failure, UI actions/a11y, Calendar, Motivation, Trends, Today/Home summaries, private export, analytics payloads, and migration compatibility.
- Include existing reviewed/null rows, explicit `not_tracked`, unknown future `day_status`, mixed check-in/status, concurrent write, zero-known-unit, any-day met/unmet, and H-071 older-week fixtures.

Systemic exception: H-074 owns any redesign that further bounds or splits existing deep-history snapshot reads. Child AB keeps review discovery/mutation selected-week-only and does not expand existing check-in evidence bounds, but the new day-status reader follows those existing bounds so consumer results stay coherent. That parity read is not an all-history review action and does not claim H-074.

## Codex Skill And Stack Readiness Radar

Runbook: `docs/runbooks/codex-skill-stack-readiness-radar.md`.

Skill/capability audit:

- Available now: repository inspection, TypeScript/Next.js, Supabase migration patterns, Vitest, Playwright/browser tooling, and screenshot-handoff runbooks.
- Execution evidence: current local Next.js 16 route/cache/component guidance was reviewed; the repository's current Supabase migration/RLS/grant patterns were audited and exercised in an isolated PostgreSQL 17.6.1 local smoke, including cross-owner denial, rollback, idempotency, and both real race orderings.
- Install/config changes: none. Do not install or configure a plugin, skill, MCP server, dependency, or local Codex capability without explicit owner approval.

| Surface                     | Finding                                                                                                            | Severity | Recommended Type                 | Owner Decision Needed                         | Follow-Up Brief Path             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------- | -------------------------------- | --------------------------------------------- | -------------------------------- |
| Whole-day review truth      | Existing acknowledgement rows cannot distinguish explicit unknown coverage from ordinary reviewed acknowledgement. | `high`   | `bounded implementation child`   | `no`; the owner locked the Child AB semantics | this brief                       |
| Cross-consumer metric truth | Percentage, coverage, streak, Calendar, Motivation, Trends, and linked check-in override need one shared contract. | `high`   | `bounded implementation child`   | `no`; the contract is fixed here              | this brief                       |
| Older/deep history          | H-071 breadth and H-074 query architecture remain separate from the selected-week status slice.                    | `medium` | `deferred architecture decision` | `yes` before either later slice               | `TBD after later owner decision` |

Return path:

- Parent: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`.
- Active status: Child AB is the only selected Habits implementation child on `codex/aw-006-habits-absence-review-not-tracked-status`.
- Last merged Habits runtime: Child AA in PR `#1251`, followed by repo-managed closeout PR `#1252` at `main@4d874404`.
- Next step: complete the refreshed code/schema/test audit, implement the bounded slice, run targeted QA, and stop at screenshot handoff for owner approval.

## Domain Granularity Contract

- User's mental object: one local calendar day in the absence-review list, containing the Habits that were due and any later recorded evidence.
- Canonical persisted objects:
  - `habit_absence_review_acknowledgements` row with stable ID and unique owner/scope/date identity;
  - child `habit_check_ins` rows with stable IDs, Habit ID, local date, status, and source fields;
  - Habit definitions and reset/linkage rows that retain existing identity and semantics.
- Mature reference surfaces:
  - `HabitPerfectDayHub` for visible date-first review and normal date-specific Habit controls;
  - `lib/habits/shared.ts` and `lib/habits/server.ts` for domain/snapshot projections;
  - existing Calendar daily layers and Calendar Comparison/Trends;
  - existing Motivation summaries and linked Micro Session Habit credit.

| Level                                 | Child AB operation                                            | Explicit boundary                                                                                                                                                                                                                                                                        |
| ------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Review day/list row                   | `view`, `edit`, `reconcile`                                   | Show whole-day neutral status, single action, candidate-only batch inclusion, pending/error, and Undo. If the selected historical date has a saved marker but no longer has candidate children, render only that one bounded recovery row; never add it to Today discovery or the batch. |
| Acknowledgement row                   | `create`, `edit`, `reconcile`                                 | Keep workflow `reviewed`; set or null `day_status` idempotently. Do not delete the acknowledgement on Undo.                                                                                                                                                                              |
| Due Habit definitions on that day     | `view`                                                        | Continue showing the normal selected-date child structure. No definition create/edit/archive semantics change.                                                                                                                                                                           |
| Habit check-in child rows             | existing `create`, `edit`, `delete` plus Child AB `reconcile` | Successful supported writes atomically null `day_status`; clear never revives it. No synthetic child row is created by review status.                                                                                                                                                    |
| Linked Micro Habit credit             | `reconcile`                                                   | Only a successfully persisted supported Habit credit nulls the marker; primary Micro truth remains independent.                                                                                                                                                                          |
| Day/week/period projection            | `view`, `reconcile`                                           | Apply known/potential coverage, conditional performance, streak-gap, Perfect Day, Quit, and any-day-period rules.                                                                                                                                                                        |
| Calendar/Motivation/Trends projection | `view`, `reconcile`                                           | Render the same neutral status and formulas through shared adapters, with no summary-only alternative semantics.                                                                                                                                                                         |
| Older weeks/all history               | `out of scope`                                                | H-071 remains one-selected-week-bound: existing manual week navigation remains, but no cross-week/all-history review discovery, queue, or bulk action is added. Consumer day-status reads may follow their existing check-in evidence windows; H-074 owns later query splitting.         |

Child-structure rule: component and screenshot evidence must show the day row and its due-Habit context, while domain/route tests prove acknowledgement and check-in child-record transitions. A top-level percentage screenshot alone cannot support a 10/10 claim.

## Data Placement And Sync Contract

Server-canonical:

- Existing acknowledgement workflow `status`, nullable `day_status`, row identity, review date/scope, and timestamps.
- Habit definitions, check-ins, reset boundaries, links, and source-backed credit.
- Server-derived visible candidate dates, potential/known/successful units, and consumer projections.

Local/client:

- Current selected review date, expanded state, pending action, optimistic affordance, and non-sensitive transient feedback only.
- No localStorage/cookie/IndexedDB copy of `day_status` is historical truth.

Sync and conflict:

- Mark, batch, and Undo are idempotent and refresh from the committed server result.
- Batch uses one atomic server operation against a revalidated selected-week candidate set.
- Successful supported check-in and status nulling commit together; check-in evidence wins every race and read.
- A failure preserves the last confirmed snapshot, current date, focus, and retry action. It never advances review or claims partial batch success.
- Cross-device reload derives the same state from server rows; no client merge policy can restore a nulled marker.

Retention and sensitivity:

- Existing account cascade deletion applies. No new retention period, public/shareable surface, raw provider payload, or free text is added.
- Add an owner-private `habitDayStatuses` export list containing only rows with non-null `day_status`: stable row ID, review scope, review date, raw day status, created timestamp, and updated timestamp. Do not export neutral acknowledgement-only rows, titles, notes, or fabricated check-ins.
- Bump and document the export `schemaVersion` because the payload shape changes. A mixed-version environment without the additive column may return `habitDayStatuses: []`; once the schema is available, a real query error must fail the export rather than silently omit canonical user history.
- Do not log or emit private Habit titles, notes, raw unknown status values, owner IDs, or check-in details.

Cache and invalidation:

- Preserve private dynamic/no-store boundaries.
- Mark, batch, Undo, and every check-in writer must return or trigger one fresh affected Habits snapshot and any Calendar/Motivation/Trends revalidation already required by the owning surface.
- Never cache a raw unknown `day_status` as a known value. A mapping deployed later takes effect on the next server load.

## Identity And Rename Contract

- Canonical stable ID: keep the existing acknowledgement row ID and unique owner/scope/review-date identity. A local date key is contextual identity within that owner/scope, not a Habit ID.
- Check-in identity remains its own row ID plus Habit/date/source semantics. Clearing `day_status` never changes or replaces a Habit/check-in ID.
- Human-readable day-state labels such as `Not tracked` come from the shared day-status mapping. Action copy such as `Mark this day not tracked` and `Undo not tracked` is renameable surface copy. Neither is a database value or analytics identity.
- Workflow `status = reviewed` and `day_status = not_tracked` are distinct machine contracts. Neither may be renamed, repurposed, or inferred from a label.
- Setting/nulling `day_status` updates the same acknowledgement entity. A materially different future meaning requires a new explicitly mapped machine value, not repurposing `not_tracked`.
- Unknown/deprecated day-status values never close a candidate, affect metrics, or become raw UI copy. They produce a bounded fail-closed review/support state until explicitly mapped.
- Support diagnosis uses stable owner-scoped row ID, review scope/date, bounded support classification, and safe error code; no title or note is identity.

## Forward Compatibility Contract

Checklist: `docs/runbooks/task-brief-forward-compatibility-contract.md`.

Extensibility surfaces:

- Acknowledgement workflow statuses, nullable day statuses, review actions/labels, Habit check-in statuses/sources, cadence/period projections, Calendar layers, Motivation/Trends fields, analytics actions/properties, locales, and private export/support contracts.

Source of truth:

- Database constraints and generated types define persisted values.
- One shared TypeScript parser/classifier defines supported versus unknown day status.
- One shared domain metric contract defines potential, known, successful, coverage, streak, and period outcomes.
- One shared display mapping defines day-status/state labels. Review action copy remains explicit per UI surface and is covered by analytics, accessibility, test, and support mappings. Stable machine IDs never derive from copy.

Additive behavior:

- New review rows with null `day_status` retain today's reviewed-acknowledgement behavior automatically.
- New supported check-in sources must use the shared atomic clear helper/transaction and therefore override `not_tracked` without a route-local exception.
- New consumers using the shared projection automatically receive known/potential coverage and neutral status.
- Day-status label-only changes for `not_tracked` flow through the shared display mapping without migration, ID change, or history rewrite. Review action copy changes require an explicit surface, analytics, accessibility, test, and support sweep.

Explicit mapping requirements:

- Every new workflow/day status, check-in source, cadence result, Calendar layer, Motivation/Trends field, analytics value, locale, or export behavior requires database/generated-type/domain/view-model/consumer/copy/a11y/privacy/support/test review before release.
- A source that cannot atomically clear `day_status` cannot ship as supported Habit check-in evidence.

Unknown or deprecated values:

- Unknown `day_status` is not treated as null or `not_tracked`, does not suppress review, contributes to neither performance nor success, and exposes only generic `Needs review` context.
- Unknown values never enter raw UI copy, analytics, or normal logs. Support receives a bounded field reason, while raw owner-authorized evidence stays private.
- No unknown value can produce Done, Missed, Rest, Slip, Perfect Day, clear Quit, streak protection, or success analytics.

Test/evidence:

- Null, supported `not_tracked`, unknown future status, mixed old/new rows, each supported check-in source, race orderings, zero-known data, any-day period, consumer parity, and older-week exclusion fixtures.
- Route/label/support impact sweep records every mapper/action/label/event consumer and intentional historical references.

## Expected Implementation Scope

Expected migration/data paths:

- one additive `supabase/migrations/<timestamp>_habit_absence_review_not_tracked_day_status.sql`;
- `types/database.ts`;
- existing absence-review RLS/policies and an atomic database function/transaction only where required to guarantee mark/batch/Undo/check-in precedence.

Expected domain/server/API paths:

- `lib/habits/shared.ts`;
- `lib/habits/server.ts`;
- `app/api/my-library/habits/absence-review/route.ts`;
- `app/api/my-library/habits/check-ins/route.ts`;
- every existing protected Habit check-in writer discovered by audit;
- `lib/dryland/micro-habit-linkage.ts` and its owning route only for successful linked Habit-credit clearing.
- `lib/user/export.ts` and `app/api/user/export/route.ts` for the bounded private `habitDayStatuses` list and schema-version update.

Expected UI/consumer paths:

- `components/my-library/habits/HabitPerfectDayHub.tsx`;
- `app/my-library/habits/page.tsx` only if snapshot/view-model wiring changes;
- `lib/my-library/today.ts` and existing Today/Home/My Routines adapters for regression-safe success summaries;
- Calendar daily-layer, plan, comparison, Motivation, and Trends view-models/components identified by pickup audit.

Expected tests:

- `tests/unit/habits.test.ts`;
- `tests/unit/habits-server.test.ts`;
- `tests/unit/habits-routes.test.ts`;
- `tests/unit/habit-perfect-day-hub.test.tsx`;
- Calendar daily-layer/plan/comparison and Motivation/Trends unit tests;
- linked Micro Session domain/route tests;
- private user export shape, ownership, schema-missing, real-failure, and raw-unknown-status tests;
- analytics event/payload tests;
- focused authenticated Playwright for single, visible batch, Undo, reload, and later-check-in override where the environment supports it.

Required docs/lifecycle:

- this brief and parent/queue/inventory return status;
- `docs/api-contracts.md`;
- `docs/user-flow-map.md`;
- `docs/runbooks/auth-account-support.md`;
- `docs/runbooks/gdpr-data-rights.md` for operational metadata/deletion/access truth;
- relevant Help/Guide assertion or explicit in-app N/A evidence.

The allowlist is subject to one recorded pickup checkpoint. Any necessary path expansion must remain strictly within H-082 and be explained before editing.

## Out Of Scope

- H-071 cross-week/all-history review discovery, aggregate queue, bulk action, rolling backlog, or historical definition versioning. Existing navigation to one selected week remains available.
- H-074 snapshot-history performance redesign, query-window split, new dashboard, or chart dependency.
- New or changed Habit check-in statuses; `not_tracked` is not stored in `habit_check_ins`.
- Reinterpreting `reviewed`, backfilling old acknowledgement rows, or converting old missing dates to `not_tracked`.
- Treating `not_tracked` as Done, Missed, Rest, Skip, Slip, Perfect Day, clear Quit, vacation/pause, or streak protection.
- Changing current Done/Rest/Slip/timer/manual/Micro truth beyond the atomic marker clear.
- H-081 definition compatibility, H-072 Home IA, broad H-073 e2e closure, or H-075 event rename.
- Broad Habits, Calendar, Motivation, Trends, Home, or My Routines redesign.
- Reminder/notification, provider/native integration, external analytics vendor, new dependency, background job, admin repair tool, hard delete, export redesign beyond the bounded additive `habitDayStatuses` list/schema-version update, or public/SEO surface.
- Merge without explicit owner approval.

## Help / Guide And Operator Training Contract

- Update `docs/user-flow-map.md` with single/batch/Undo, whole-day scope, later-check-in precedence, check-in-clear non-revival, and the selected-week-only limitation.
- Update `docs/api-contracts.md` with the distinct workflow `status` and nullable `day_status`, candidate validation, atomic writes, exact failures, and consumer formulas.
- Update `docs/runbooks/auth-account-support.md` with what `Not tracked` means, how it differs from Rest/Skip/Missed, why it breaks but does not label a streak gap, how to Undo/correct it, and why cross-week/all-history review breadth remains H-071.
- Update `docs/runbooks/gdpr-data-rights.md` with data minimization, account deletion/access, and the bounded owner-private `habitDayStatuses` export contract for this operational metadata.
- In-app Help/Guide is expected `N/A` only if the execution sweep reconfirms that current Guide surfaces cover unrelated Poolside/`0-1000m` workflows and no Habits review guide exists. If a relevant guide exists, update it and its automated assertion in the same PR.
- At least one automated component or documentation contract assertion must protect the shipped visible/recovery wording.
- User copy must say that bulk affects only the visible review days in the selected week. It must not imply that older weeks or all history were checked.

## Security, Privacy, And Compliance Contract

- Authenticate every route and preserve exact owner-scoped RLS on select, insert, update, and any database function.
- Treat JSON, action, status, dates, timezone, rendered local day, selected week, client-visible rows, and stored values as untrusted.
- Recompute the eligible visible review set server-side. Never accept client membership, count, or arbitrary historical dates as authority.
- Keep batch bounded to the selected ISO week and one server-derived candidate set; reject duplicates/out-of-window/future/Today/tracked dates safely.
- Keep the day-status RPC `security invoker`, revoke it from public/anon/authenticated, and grant it only to the server service role after route authentication, owner binding, and candidate revalidation. The check-in table trigger is the narrow `security definer` exception required to clear the marker in the same transaction across all supported writers; it has a fixed empty `search_path`, takes identity only from `NEW.user_id`/`NEW.check_in_date`, has no external execute grant, and relies on existing check-in writer ownership/RLS before it can run.
- Expected invalid/auth/stale/schema paths return stable `400`, `401`, `409`, or `503` with no unexpected `500`, no writes, no analytics, and no database error details.
- Store no secret or elevated credential. Emit no owner ID, title, note, raw unknown value, or private check-in payload to normal logs/events.
- Preserve cross-owner non-disclosure and existing account cascade deletion.

## Observability And KPI Contract

- Keep first-party analytics as source of truth; add no vendor.
- Do not rename the existing `habit_absence_review_*` taxonomy in this child. H-075 remains separate.
- Extend the existing server acknowledgement event or one existing mapped review event with stable typed machine actions for `not_tracked_single`, `not_tracked_visible_batch`, and `not_tracked_undo` only after an event-compatibility audit.
- Event payload may contain only bounded action, affected-date count, selected review scope, and safe existing date context where already approved. It contains no Habit titles, notes, raw unknown statuses, per-Habit values, or free text.
- Emit one success event only after the atomic mutation commits. Failure, retry before commit, unknown status, and rejected dates emit zero success event.
- `not_tracked` never improves completion, Perfect Day, clear Quit, streak, or other success KPI.
- Operational success thresholds:
  - 100% of committed single/batch/Undo results report the exact affected count and stable action;
  - 0 duplicate success events for one idempotent logical request under the existing event contract;
  - 0 success events and 0 check-in rows on rejected/failed day-status mutations;
  - 100% consumer fixtures agree on known/potential coverage and not-tracked count.
- A later check-in uses its existing analytics contract. Clearing `day_status` does not emit a synthetic completion or override-success event.

## Performance And Cost Contract

- Keep review discovery, eligibility, single/batch/Undo authority, and visible actions inside the selected ISO week. Day-status evidence may follow each existing consumer's bounded check-in history window so percentages and streaks use the same evidence; do not add an independent older-week/all-history review backlog or H-074 query redesign.
- At most seven dates can be effective visible-batch candidates. Preserve a defensive request cap even though server membership is stricter.
- Mark/batch/Undo uses one bounded atomic database operation, not one round trip per date or Habit.
- A successful check-in may add only the bounded owner/date status-clear work inside its transaction; no per-consumer query or N+1 path.
- Metric projection remains linear in the already-loaded definition/check-in/day sets and shares computed coverage fields rather than recomputing in every component.
- Add no dependency, chart package, background job, external call, duplicate raw-row payload, or unbounded diagnostic data.
- Existing route-level baseline remains `LCP <= 2.5s`, `CLS <= 0.10`, `INP <= 200ms`, and `TBT <= 200ms` where the performance harness covers the changed core routes. Build/performance budgets must remain green.

## Route / Label / Support Surface Impact Sweep

Run the route-label-support-surface-impact-sweep before the first broad implementation gate.

Identifiers searched must include:

- `habit_absence_review_acknowledgements`
- `HABIT_ABSENCE_REVIEW_SELECT`
- `absenceReviewAcknowledgedDates`
- `weekly_absence_review`
- acknowledgement `status`
- `day_status`
- `not_tracked`
- `Not tracked`
- `Mark this day not tracked`
- `Mark visible days not tracked`
- `Undo not tracked`
- `Dismiss`
- `Done with this day`
- `Close review`
- `reviewed`
- `Done`
- `Missed`
- `Rest day`
- `Slip`
- `Perfect Day`
- `clear` and Quit
- `coverage`
- `consistency`
- `streak`
- `No tracked data`
- `habit_absence_review_*`
- `checkInDate`
- timer/manual/source-backed Micro check-in writers
- `/my-library/habits` and Calendar comparison routes

Surfaces checked/directories must include `app/`, `components/`, `lib/habits/`, `lib/my-library/`, linked Micro Session code, `types/`, `supabase/migrations/`, `tests/`, API/user-flow docs, `docs/runbooks/`, Help/Guide assertions, lifecycle briefs, canonical queue, and design inventory.

Fallout handled must record the exact domain mappers, mutation routes, metric consumers, labels, events, tests, docs, and lifecycle references updated in the same PR. Intentional leftovers must name historical done-brief evidence, H-071, H-074, H-075, and unrelated uses of generic `tracked` or `reviewed`.

Execution evidence, 2026-09-03:

- `identifiers searched`: the full list above was swept with focused `rg` groups for acknowledgement table/select/scope, day/workflow status, all visible actions/labels, coverage/streak/outcome terms, analytics IDs, check-in date/source fields, and Habits/Calendar routes.
- `surfaces checked`: `app/`, `components/`, `lib/habits/`, `lib/my-library/`, `lib/dryland/micro-habit-linkage.ts`, `lib/user/export.ts`, `types/`, current and original Supabase migrations, unit/e2e tests, API/user-flow/support/privacy docs, parent, canonical queue, design inventory, and Guide/Help code/assertions.
- `fallout handled`: shared status/label/coverage/cadence/streak projection; snapshot and selected-week review candidates; atomic RPC plus all check-in-writer trigger precedence; absence-review route/result/analytics; Habits review actions/focus/pending states; Today, Calendar Plan/daily layer/Comparison, Motivation and Trends; bounded private export; generated database types; migration/RLS/race tests; component/domain/route/consumer/export tests; and all named docs/lifecycle surfaces.
- `intentional leftovers`: older-week/all-history review discovery and action remain H-071; deep-history query splitting remains H-074; event-taxonomy rename remains H-075; residual definition mapping remains H-081. Old planned/done checkpoint text is historical evidence, and unrelated generic `tracked`, `reviewed`, outcome, or Guide terms were not renamed.
- `Help/Guide`: explicit `N/A`. The fresh sweep found Poolside and `0-1000m` Guide trackers plus Admin Help Center, but no user-facing Habits review guide or Habits Help assertion. The in-product recovery copy, component assertions, user-flow map, API contract, auth support runbook, and privacy runbook are the owned surfaces for this child.

## Acceptance Criteria

1. An additive nullable `day_status` supports exactly `not_tracked` while workflow `status = reviewed` remains separate and every existing row stays null without backfill.
2. The server derives and returns the exact visible absence-review candidate set for the selected ISO week; arbitrary, hidden, Today, future, tracked, already-not-tracked, other-week, and older-history dates are rejected as new candidates.
3. The user can mark one visible day and atomically mark all current visible candidates as `not_tracked` with clear count/scope copy.
4. Single and batch mutations are idempotent after a lost response, batch still requires every current candidate and permits no extra date except an already matching marker in the same selected week, and both create zero `habit_check_ins` rows.
5. Undo sets only `day_status = null`, retains the reviewed acknowledgement, and does not re-open the date or write Habit history; the selected historical marker retains one visible Undo recovery row after its originating Habit is archived or changes, without joining Today discovery or batch.
6. Every supported later check-in source atomically nulls `day_status` with the successful check-in; failed writes leave the marker unchanged.
7. Supported check-in evidence wins every mark/check-in race, and no committed/read state exposes effective `not_tracked` beside that evidence.
8. Clearing or undoing the later check-in does not revive `not_tracked`.
9. Effective `not_tracked` contributes exactly zero to Done, Missed, Rest day, Slip, Perfect Day, clear Quit day, performance numerator, performance denominator, streak protection, and success analytics.
10. Coverage reports known/potential units plus not-tracked day count; zero known units show `No tracked data` rather than `0%` or `100%` performance.
11. Streaks cannot cross the unknown gap, while previously earned best streak remains unchanged and no Missed label is created.
12. An any-day period already proven met remains met; an otherwise unmet closed period is unknown only when its `not_tracked` dates could supply the missing completions, while a target that remains mathematically unreachable may still be Missed.
13. Habits, Weekly Overview, Calendar, Motivation, Trends/Comparison, Today/Home/My Routines, and analytics share the same marker precedence and metric contract; Trends retains known units and real duration/count actuals from partially known days while Perfect Day still requires full knowledge, and historical `habits_viewed` never emits a false numeric `perfectDayPercent` for the marker.
14. Calendar and Habits render a neutral, accessible status distinct from Done/Missed/Rest/Slip, with one clear Undo path and no color-only meaning.
15. Unknown future `day_status` values fail closed, suppress no review, gain no metric/event meaning, and expose no raw value in UI/analytics/logs.
16. Auth, RLS, validation, stale local-day, schema-missing, cross-owner, storage failure, and concurrency negative paths are deterministic with zero unauthorized/partial writes and no unexpected `500` for expected failures; a day-status read failure makes affected metrics unavailable rather than assuming zero markers.
17. The visible UI and support copy state that Child AB affects only the selected week's visible review days; H-071/H-074 remain explicit deferrals.
18. Private export adds only non-null `habitDayStatuses`, bumps/documents its schema version, preserves raw owner-private future values, returns an empty list during schema rollout, and fails rather than silently dropping known-schema query errors.
19. API, user-flow, support, privacy/export, parent, queue, inventory, and child lifecycle docs agree with the shipped data/metric/recovery contract.
20. Focused domain/server/route/component/Calendar/Motivation/Trends/Micro/export/analytics tests, screenshot approval, full release gates, and required CI pass in sequence.
21. All target scorecard categories reach at least `4/5`, and every target/critical category reaches `5/5` before a strict 10/10 claim.

## Screenshot Handoff Requirements

Required because Child AB changes visible Habits, Calendar, Motivation, and Trends states. Follow `docs/runbooks/ui-debug-hypothesis-and-handoff.md`.

- Comparison type: `after/reference` unless a true before/after pair is captured.
- Screenshot artifacts folder: `output/playwright/habits-absence-review-not-tracked-YYYY-MM-DD-HHMMSS`.
- Capture 2–4 representative full-resolution artifacts:
  - `after-habits-not-tracked-review-actions-mobile.png`;
  - `after-habits-not-tracked-visible-batch-desktop.png`;
  - `after-habits-not-tracked-selected-marker-undo-mobile.png`;
  - `reference-trends-partial-coverage-desktop.png`.
- Show single action, visible batch count/scope, selected historical marker recovery/Undo, retained known performance beside partial coverage, and selected-week limitation. The earlier approved Calendar/Motivation neutral-state artifacts remain supporting evidence when their renderers are unchanged.
- Verify mobile `320–390px`, tablet near `768px`, and desktop `1440px`; no overlap, clipped action, color-only meaning, or false green/red success/failure treatment.
- Use deterministic synthetic data and real production components. Do not alter production owner data merely to create evidence.
- Remove any temporary visual harness after capture and prove its route is unavailable.
- Stop for explicit owner screenshot approval or corrections before `npm run verify:pre-pr`, commit/push, PR creation, or `npm run verify:pre-merge`.
- If a product-rendering file, style, asset, or export HTML changes after capture, regenerate. Otherwise state explicitly that none changed.

## Manual QA Environments

- Local default: `SITE_LOCK_ENABLED=0` and `http://127.0.0.1:3000` using the repository's documented local visual-harness fallback if authenticated fixtures are unavailable.
- Exercise mobile Chromium/WebKit and desktop Chromium; include keyboard-only focus/Undo and reduced-motion behavior where relevant.
- Verify old reviewed/null rows, one not-tracked day, all-visible batch, Undo, reload/cross-device-equivalent snapshot, later completion, Rest, Slip, timer/manual, linked Micro credit, failed check-in, check-in clear, and race outcome.
- Verify Calendar, Motivation, and Trends with mixed known/unknown coverage and a zero-known period.
- Vercel preview verifies normal owner-authenticated behavior and migration readiness without seeding unsupported/raw future statuses into a real account.
- Record local-versus-preview differences or `none`.

## Validation

Planning creation only:

- `git diff --check`
- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `npm run verify:docs-only`

Before implementation:

- Refresh parent/child audits against latest `origin/main`.
- Run and record the Codex skill/stack readiness radar.
- Read relevant local Next.js 16 docs and current official Supabase migration/RLS/transaction guidance where behavior is implementation-sensitive.
- Move only this brief to `in-progress`, create the intended `codex/` branch, update parent/queue/inventory active references, and record the checkpoint.

Focused implementation validation before screenshot handoff:

- migration, constraint, generated-type, and RLS review/tests;
- targeted domain/server/route/transaction/race Vitest;
- targeted `HabitPerfectDayHub`, Calendar, Motivation, Trends, Today/Home, Micro linkage, private export, analytics, and a11y tests;
- focused authenticated Playwright for the changed review flow where supported;
- `npm run lint:quality-gates`;
- `npm run lint:briefs` and `npm run lint:briefs:all`;
- `npm run lint`;
- `npm run typecheck`;
- `git diff --check`;
- targeted route/label/support impact sweep evidence with `identifiers searched`, `surfaces checked`, and `fallout handled`.

After stable targeted QA:

1. Capture and inspect screenshot artifacts.
2. Stop for explicit owner screenshot approval or visual corrections.
3. After approval, run escalation-first `npm run verify:pre-pr`.
4. Commit, push, open/update the PR, and monitor all required CI under automation-first delivery.
5. Run escalation-first `npm run verify:pre-merge` on the current PR head and report merge readiness without merging.

Any runtime, migration, type, test, config, script, or workflow diff uses the full lane. Do not skip tests to make a gate pass. Do not merge without explicit owner approval.

## Rollout And Rollback Contract

- Ship as an expand-compatible change: first apply the additive nullable column/constraint and atomic database path, then deploy readers/writers/UI that understand `not_tracked`.
- Existing rows remain valid with `day_status = null`. No rewrite, backfill, destructive cleanup, new secret, or feature-data copy is required.
- New code must tolerate null and unknown values fail-closed. A full rollback to older code that ignores `day_status` is safe only before any non-null marker exists; after writers are available, an older reader could misclassify the date as Missed or a clear Quit/success/streak day and is therefore below the permitted runtime floor.
- The versioned private export returns `habitDayStatuses: []` only while the column is genuinely absent during expansion; after schema readiness, query failures fail the export and cannot masquerade as an empty history.
- Do not tighten or drop the existing workflow status contract. Do not coerce `not_tracked` rows into `reviewed` because reviewed is a different field/meaning.
- Once any marker may exist, safe rollback keeps the additive column, constraint, check-in-clear trigger, status-aware snapshot readers, and neutral metric projection. A defect in marking must be handled by a scoped deploy that disables/removes only the writer/UI while retaining that reader floor, or by roll-forward; a blind full release rollback is prohibited.
- Child AB does not add an instant runtime kill switch. Incident response therefore requires a scoped deploy or roll-forward, so DevOps and rollback readiness is capped at `4/5` and this child cannot claim 10/10 on that category.
- Never drop `day_status` or remove its atomic check-in clearing path while non-null rows or new writers exist. Any destructive schema rollback requires a separate owner-approved data migration/retention decision.
- Before release, verify linked environment migration state, RLS, generated types, mixed-version behavior, query/call bounds, current-SHA `verify:pre-pr`, required CI, and `verify:pre-merge`.

## Automation, Git, And Session Continuity

- Current mode is active implementation after the owner's explicit `Kjør Child AB`; keep every change within this brief and its named evidence surfaces.
- Once explicitly executed, use automation-first delivery with the screenshot approval exception: branch, implementation, targeted tests, screenshot handoff and stop, then pre-PR, commit/push, PR/CI, and pre-merge.
- Never merge without explicit owner approval.
- Commit and push validated implementation checkpoints without unrelated batching; update the PR after one complete vertical slice or 2–4 checkpoints.
- Recovery order:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and the parent, then continue from the latest checkpoint.
- Record checkpoints as `date | commit or working tree | completed scope | next step`.
- If tooling, migration access, credentials, screenshot capture, or CI blocks execution, state the exact blocker, give exactly one owner action, and record the resume point.
- Use the repository Safari PR helper where possible. Post-merge cleanup, repo-managed docs-only closeout, and mandatory chat-handoff assessment follow `AGENTS.md`.

## Return Contract

- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `resolved_findings`: `H-082` only after implementation PR merge and closeout evidence; none at plan creation.
- `deferred_findings`: `H-071` older-week/all-history review breadth, `H-074` snapshot-history performance redesign, `H-081` residual definition compatibility, and every parent finding not explicitly owned.
- `return_checkpoint`: update the parent with exact schema/status distinction, candidate window, mutation/race behavior, metric/consumer results, support/analytics/privacy evidence, screenshots, scores, gates, commit, and PR before Child AB is closeout-ready.
- `next_return_target`: after merge/closeout, return to the Habits parent and reset selected/planned child state before any later Habits or broader AW-006 slice.

Child Definition of Done:

1. Parent H-082 status, audit, invariants, coverage matrix, child queue, and checkpoint are current.
2. Canonical queue and design inventory contain no stale active/planned/done reference.
3. PR handoff includes `Return target: docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`.
4. Completion evidence records every target score, critical category, known gap, and explicit `10/10 claim: yes/no`.
5. H-071 and H-074 remain named deferrals and are not implied complete.

## Checkpoint Log

- `2026-09-03 | planned | created the plan-only Child AB brief on clean synced main@4d874404 for H-082: nullable whole-day not_tracked separate from reviewed workflow status, selected-week server candidates, single/atomic visible batch, Undo-to-null, later supported check-in atomic override without revival on clear, shared metric/consumer contract, migration/RLS/types, support/analytics/privacy/performance/release evidence, and explicit H-071/H-074 exclusions; no runtime/schema/UI/test/branch/commit/push/PR work started | next: validate the docs-only planning diff, then wait for explicit owner execute/build/implement/kjør`
- `2026-09-03 | planned-validated | the final four-file plan passed whitespace checks, changed/all-brief scorecard lint, and docs-only quality verification; semantic review confirmed no synthetic check-ins, exact single/all-visible/Undo scope, known-data performance plus coverage, neutral streak/Quit/Calendar/Motivation/Trends behavior, bounded owner-private export, later-check-in precedence, fail-closed future statuses, and H-071 exclusion; no runtime/schema/UI/test/branch/commit/push/PR work started | next: wait for explicit owner execute/build/implement/kjør`
- `2026-09-03 | in-progress | owner explicitly said Kjør Child AB; fetched origin, confirmed HEAD and origin/main at 4d874404, created codex/aw-006-habits-absence-review-not-tracked-status, moved this brief to in-progress, and selected only H-082 while H-071/H-074/H-081 and all other findings remain out of scope | next: refresh implementation-sensitive audits, implement runtime/schema/tests/docs, run targeted QA, and stop at screenshot handoff before verify:pre-pr`
- `2026-09-03 | working tree | implemented the additive nullable day_status, service-only atomic set/clear RPC with actual was_changed reporting, shared advisory-lock/check-in-clear invariant, strict selected-week route authority, no-op analytics suppression, shared fail-closed status/coverage/cadence/streak projections, single/all-visible/Undo UI, Calendar/Today/Motivation/Trends parity, and bounded private export; final independent audits found no remaining P0/P1 after separating raw Calendar not_tracked counts from cadence result units and hardening mutation-time navigation, stale-response rejection, live announcements, and failure focus | validation: 15 focused Vitest files / 345 tests passed; typecheck passed; full lint passed with zero errors and eight unrelated existing warnings; lint:quality-gates passed; all 561 briefs passed scorecard lint; git diff --check passed | next: present deterministic browser evidence and stop for owner screenshot approval`
- `2026-09-03 | local database evidence | isolated PostgreSQL 17.6.1 smoke passed additive migration, exact constraint, authenticated no-day_status direct write, service-only RPC, RLS/cross-owner denial, first-write/retry was_changed truth, Undo/retry, check-in precedence, failed-check-in rollback, and batch all-or-nothing; true concurrent check-in-first caused HABIT_ABSENCE_REVIEW_CHECK_IN_EXISTS with zero batch rows, while marker-first blocked then the authenticated check-in committed and cleared the marker; the exact temporary container was removed and no repo/user data was touched | next: capture production-component after/reference screenshots and stop for owner approval before verify:pre-pr`
- `2026-09-03 | screenshot approval stop | captured four after/reference artifacts from real production components with deterministic local data at output/playwright/habits-absence-review-not-tracked-2026-09-03-100931; review, Calendar, Motivation, Trends, batch boundary, Undo, and later-check-in copy are visible; 320/768/1440 px checks found no horizontal overflow and Axe found zero WCAG 2 A/AA or 2.1 A/AA violations on all three representative surfaces; the analytics request was mocked locally, the temporary harness was deleted, its route returned 404, and no product-rendering file changed after capture | validation: final 15-file Vitest run passed 345 tests, typecheck passed, full lint passed with zero errors and eight unrelated existing warnings, lint:quality-gates passed, all 561 briefs passed scorecard lint, route/label sweep was reviewed, and git diff --check passed | next: wait for owner screenshot approval before npm run verify:pre-pr`

- `2026-09-03 | screenshot approved | owner approved the four-image after/reference handoff; the temporary harness remained removed and no product-rendering file changed after capture | next: run npm run verify:pre-pr, then commit, push, open/update PR, monitor required CI, and run npm run verify:pre-merge before merge recommendation`

- `2026-09-03 | linked schema applied | the first npm run verify:pre-pr correctly stopped on migration drift; Supabase preflight confirmed the expected linked project freeswimming-org-prod (sazgjhgxvmxcyowovond), migration history and dry-run showed exactly 20260903123000_habit_absence_review_not_tracked_day_status.sql as local-only, and npx supabase db push --linked --yes applied only that additive migration; post-apply migration list showed local/remote parity and dry-run reported Remote database is up to date; linked type generation confirmed the nullable table column, while the checked-in RPC type intentionally remains wider than generated introspection because the specified Undo call passes SQL null and returns nullable day_status | next: rerun npm run verify:pre-pr on clean migration parity`
- `2026-09-03 | final scope correction and refreshed screenshot stop | the restarted full pre-PR lane passed migration drift, quality gates, lint, typecheck, 265 unit files / 1978 tests, production build, and performance budgets before it was intentionally interrupted during E2E when independent review found a candidate-authority gap; the snapshot now retains a bounded selected-week set of every owner check-in date before supported-definition filtering, so archived or fail-closed unsupported child rows also block review candidates and single/batch requests fail with zero writes before RPC or analytics; ordinary check-in selectedDate semantics were kept separate from the stricter absence-review selected-week bound; the rollback contract now prohibits blind old-reader rollback after markers exist, retains the status-aware reader/trigger floor, caps DevOps and rollback readiness at 4/5 because Child AB has no instant kill switch, and makes the overall 10/10 claim no | validation: refreshed 15-file Vitest run passed 347 tests, typecheck passed, full lint passed with zero errors and eight unrelated existing warnings, quality gates passed, all 561 briefs passed scorecard lint, and git diff --check passed; only the two affected review screenshots were regenerated at output/playwright/habits-absence-review-not-tracked-2026-09-03-112822, with no overflow at 320/1440 px and zero Axe violations; the unchanged previously approved Calendar/Motivation/Trends references remain at output/playwright/habits-absence-review-not-tracked-2026-09-03-100931; the temporary harness was deleted, its route returned 404, and the local server was stopped | next: wait for owner approval of the two refreshed review screenshots, then rerun npm run verify:pre-pr from the beginning`
- `2026-09-03 | final screenshot approved | final P1 corrections now keep selected-date Undo recovery when a saved marker's habit later becomes archived or unsupported without expanding the normal queue/batch into H-071, make lost-response single/batch retries bounded and idempotent, retain known Trends units and duration/count actuals on partially known days, and use clear zero-current-habits recovery copy; an independent scope audit found no remaining P0/P1 | validation: the focused 15-file Vitest suite passed 352 tests; four final after/reference artifacts were captured at output/playwright/habits-absence-review-not-tracked-2026-09-03-115142 with no horizontal overflow at 320/768/1440 px, zero Axe violations on review/recovery/Trends, and zero final console errors/warnings; the temporary harness was removed, its route returned 404, the local server was stopped, and no user/cloud data was written; owner approved the refreshed evidence | next: run npm run verify:pre-pr from the beginning, then commit, push, open/update PR, monitor required CI, and run npm run verify:pre-merge without merging`
- `2026-09-03 | pre-PR green | the final owner-approved working tree passed npm run verify:pre-pr on the full lane; linked migration parity, governance gates, lint with zero errors and eight unrelated existing warnings, typecheck, 265 unit files / 1,985 tests, production build, baseline performance budgets, and 111 active Playwright tests passed while 573 environment-gated cases were explicitly skipped; artifact: artifacts/test-runs/20260903-120523/verify.log | next: create the scoped commit, push, open the PR, monitor required CI, and run npm run verify:pre-merge without merging`
- `2026-09-03 | stacked PR checkpoint | the first combined implementation commit reproduced the approved and fully green tree exactly, but required PR Size failed because 8,628 changed lines exceeded the non-waivable 4,000-line repository limit; the unchanged final tree was therefore split in deploy order into three bounded branches: additive data/status foundation (3,357 changed lines), status-aware metric and consumer parity (2,248), then authenticated review actions and approved UI (3,023). Each branch is independently below the gate; the final stacked tree matched the safety branch byte-for-byte before this docs-only checkpoint, and no product-rendering file changed after the approved screenshots | next: run current-head npm run verify:pre-pr on each branch, push/update the three stacked PRs in order, require all CI green, then run npm run verify:pre-merge on every exact head without merging`
- `2026-09-03 | layer A merged and layer B restacked | owner approved sequential merge; PR #1253 merged as 2c93e9f5, local/origin main were fast-forwarded, and consumer layer B was replayed alone onto that squash commit at b14a47dc without duplicating the foundation. Stack-fit/classification rationale: the changed lib/my-library files are known Habit consumer view-model/domain surfaces, while their component peers reuse those shared view-model contracts and the established Calendar, Today, Motivation, and Trends reference surfaces; no unknown runtime surface is introduced. Targeted tests cover the potential/known/successful metric contract, neutral streak/Perfect Day/Quit behavior, and partial known duration/count evidence. The owner-approved after/reference screenshot artifacts remain output/playwright/habits-absence-review-not-tracked-2026-09-03-115142 plus the unchanged Calendar/Motivation support set at output/playwright/habits-absence-review-not-tracked-2026-09-03-100931; the screenshot approval stop is satisfied, comparison filenames are after-/reference-, responsive checks cover 320/768/1440 px, accessibility evidence remains zero Axe violations, and no product-rendering code changed during restack | next: rerun full current-head pre-PR on B, force-with-lease push, retarget #1254 to main, await required CI, and rerun pre-merge before the second approved merge`
- `2026-09-03 | layer B merged and layer C restacked | restacked B passed full pre-PR at ef91c9c7 with 265 unit files / 1,946 tests, build, performance budgets, and 111 Playwright passes plus 573 environment-gated skips; current-head private-gate pre-merge and required CI passed before PR #1254 merged as 94209bb2. Review writer/UI layer C was then replayed alone onto updated main without duplicating A or B; the resulting product tree retains the exact approved single/all-visible/Undo behavior and after/reference rendering, and the only post-capture changes are lifecycle documentation checkpoints | next: commit this C checkpoint, run full current-head pre-PR, force-with-lease push, retarget #1255 to main, await required CI, and rerun pre-merge before the final approved implementation merge`

## Completion Record

In progress. Record PR/commit/result, explicit `10/10 claim: yes/no`, one achieved-score/evidence/gap row for every target category, screenshot artifacts, test/CI evidence, rollback state, resolved/deferred findings, and the parent return checkpoint only after the implementation and required gates complete.
