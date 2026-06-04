# Task Brief: AW-006 Habits Mobile Card Polish And Calendar Access (10/10)

## Metadata

- `id`: `2026-06-04-aw-006-habits-mobile-card-polish-and-calendar-access-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-04`
- `updated`: `2026-06-04`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-habits-mobile-card-polish`

## Brief Audit Record

- `last_audited`: `2026-06-04`
- `base`: `main@b090d9d`
- `audit_status`: `ready`
- `decision`: Execute Child D as the next bounded Habits child after Child A and Child B shipped.
- `reason`: `main` is clean and synced after Habits Timed Timer/Manual UX PR `#979` and repo-managed closeout PR `#980`; post-merge preflight was reported green. The remaining owner-selected Habits UI findings are now card/mobile readability and date/calendar access, while history/backfill editing still belongs to Child C.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, `/my-library/habits`, `HabitPerfectDayHub`, `lib/habits/shared.ts`, `lib/habits/server.ts`, Habits route params, `SiteChrome`, fixed mobile nav, contextual admin notes, `TodayTabsPanel`, Habits support docs, screenshot handoff rules, route/label/support sweep rules, or verification lanes change.

## Goal

Make the Habits active list easier to scan on mobile and desktop without changing Habits storage, check-in semantics, API contracts, analytics, reminders, sound, or history/backfill scope.

## Pre-Implementation Owner Explanation

Vi rydder Habits-kortene slik at mobilen raskere viser hva vanen er, statusen akkurat naa, og hva brukeren kan gjore. Det betyr bedre plassering av piller, mer lesbar streak/progress-copy, `Build` som brukerlabel endres til `Do`, og en mobil kalenderknapp som viser dagens ukeoversikt naar den ellers er skjult.

Hvorfor det betyr noe: Habits skal vaere raskt aa bruke i farta. Naar tekst og piller konkurrerer om oppmerksomheten, blir det vanskeligere aa stole paa hva som er gjort og hva som gjenstaar.

Utenfor scope er database/API-endringer, backfill eller redigering av gamle dager, full historikkdashboard, notes per log, archive-keep-history, sound, reminders, timerlogikk, analytics-endringer og bred redesign av Home/My Routines.

Fremoverkompatibilitet: nye habit modes/statusverdier skal fortsatt gaa gjennom eksplisitte label/view-model mappings med trygg fallback, og fremtidig kalender/backfill maa eies av Child C slik at gamle dager ikke utilsiktet blir redigerbare uten datakontrakt.

## Selected Scope

- Move/quiet mode pills so the card first emphasizes habit title, cadence/status, and primary action.
- Change user-facing `Build` habit mode label to `Do` while preserving internal `habit_mode = build` payloads/storage.
- Improve streak copy from compact hyphen wording like `20-day streak` to `Streak: 20 days`.
- Replace duplicate or competing count progress copy such as `0 times today` plus `0 / 1 today` with one readable progress line.
- Improve count/duration card copy, for example `Today: 0 times · Goal: 1 time` and timed `0:00 of 8:00 today`.
- Add a mobile-accessible calendar/week button near `Add habit` for the active-focus Habits view so the existing 7-day overview can be shown in vertical mobile.
- Add/update focused tests for label mapping, progress copy, chip hierarchy, and mobile calendar access.
- Update support/user-flow docs and parent/queue/inventory return references.
- Capture screenshot handoff before `npm run verify:pre-pr`.

## Out Of Scope

- Selecting a prior day and editing that day's habits.
- Backfill/edit previous days semantics.
- Full history dashboard, calendar/heatmap, best streak, habit score, notes per log, archive-keep-history, export.
- Sound, reminders, notifications, native integrations, HealthKit, Apple Watch.
- Builder target semantics for `Any amount`, litres, glasses, or no-fixed-amount count habits.
- Weekly calendar date-range labels, previous/next week swipe, selected-day routing, and prior-day editing/backfill.
- Database migrations, Supabase schema changes, generated DB types, RLS changes, API payload changes, analytics taxonomy changes.
- Timer semantics, one-active-timer behavior, manual-time additive behavior, rest-day semantics, quit-slip semantics, weekly/monthly target-met semantics.
- Broad `SiteChrome` redesign or app-wide fixed-nav spacing changes beyond scoped Habits safe-area/card spacing if needed.

## Finding Disposition

| ID    | Disposition              | Rationale                                                                                                                                            |
| ----- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| H-001 | Not affected             | Timed additive manual/time semantics already resolved by Child B.                                                                                    |
| H-002 | Not affected             | Manual-time labels already resolved by Child B.                                                                                                      |
| H-003 | Supporting               | Streak copy readability is in scope; motivation semantics stay unchanged.                                                                            |
| H-004 | Not affected             | Rest-day data semantics already resolved by Child A.                                                                                                 |
| H-005 | Deferred                 | Sound preference remains a future preferences/sound child.                                                                                           |
| H-006 | Deferred                 | Sound preference remains a future preferences/sound child.                                                                                           |
| H-007 | Not affected             | Weekly/monthly target-met semantics already resolved by Child A.                                                                                     |
| H-008 | In scope                 | Mobile fixed-nav/admin-notes spacing and last-card breathing room are part of Child D.                                                               |
| H-009 | Satisfied for this child | Fresh code/design audit recorded here before implementation.                                                                                         |
| H-010 | Partially in scope       | Calendar/week access and copy readability are in scope; history/backfill/best streak/reminders/export remain deferred.                               |
| H-011 | Not affected             | Duplicate timed timer truth already resolved by Child B.                                                                                             |
| H-012 | Not affected             | One-active-timer already resolved by Child B.                                                                                                        |
| H-013 | In scope                 | Broader metadata chip/card scan hierarchy is a primary target.                                                                                       |
| H-014 | Ongoing                  | New owner findings captured in selected scope; future findings return to parent.                                                                     |
| H-015 | In scope                 | User-facing `Build` becomes `Do`; stored/API `build` remains unchanged.                                                                              |
| H-016 | In scope                 | Streak copy changes to `Streak: N days` where a streak label is shown.                                                                               |
| H-017 | In scope                 | Count/today progress copy uses one readable line without duplicate done/progress phrases.                                                            |
| H-018 | In scope for access only | Mobile gets a compact calendar control for the existing current-week overview; selected-date/backfill remains Child C.                               |
| H-019 | Deferred                 | Water-style no-fixed-amount target semantics require a future builder target semantics child; this child treats simple water reminders as Done-only. |
| H-020 | Deferred                 | Week date labels, previous/next week swipe, selected-day behavior, and edit rules belong to Child C History/Calendar.                                |

## Local Code Audit

- `components/my-library/habits/HabitPerfectDayHub.tsx`
  - owns add/edit mode labels, cadence/status chips, card quick status copy, streak/motivation copy, timed progress module, 7-day summary, and active-focus mobile summary hiding.
  - current `getHabitModeLabel("build")` returns `Build`; payloads still use `habitMode: "build"`.
  - current count quick status can combine `0 times today` and `0/1 today` in one line; this child should keep one progress truth.
  - current active-focus route hides the summary on mobile (`hidden sm:block`), so the 7-day overview is only visible at larger breakpoints.
- `app/my-library/habits/page.tsx`
  - route passes `preferMobileActiveFocus` from `view=active`; it does not currently expose `date` to `loadHabitSnapshot`.
  - route-level bottom padding is `pb-20`; scoped spacing may need additional safe-area room for the active list.
- `components/SiteChrome.tsx`
  - default mobile nav is fixed at the bottom with safe-area padding.
  - admin contextual notes may also render on supported routes for admin users; broad `SiteChrome` behavior is protected.
- `components/my-library/TodayTabsPanel.tsx`
  - Home/My Routines entrypoint links to `/my-library/habits?view=active#today-habits`.
  - no direct card rendering changes needed here unless label docs mention `Build`.
- `lib/habits/shared.ts`
  - internal `HABIT_MODE_VALUES` remains `["build", "quit", "timed"]`.
  - target labels and evaluations are domain-derived; this child should not alter satisfaction, cadence, rest/slip, timer, or check-in calculations.
- `lib/habits/server.ts`
  - supports selected-date snapshots, but route exposure/backfill UX remains out of this child.
- `lib/habits/schema.ts`
  - no schema change required.
- `tests/unit/habits.test.ts`
  - domain behavior tests should remain stable because internal `build` semantics do not change.
- `tests/unit/habit-perfect-day-hub.test.tsx`
  - owns component expectations for mode labels, card chips, progress copy, timer copy, and details behavior; must be updated.

## Benchmark Refresh

- Parent benchmark remains sufficient for this UI/copy child because no new habit feature model is introduced.
- Relevant pattern from Streaks/Habitify/Productive/Loop: streak/progress labels should be understandable at a glance and not let one technical label dominate the card.
- Calendar/backfill audit result: established habit apps commonly support previous-day edits, but this child deliberately does not ship that data behavior. Child C must own prior-day selection/edit semantics with explicit data-boundary and support contracts.

## Data Placement And Sync Contract

- Server-canonical data:
  - habit definitions, habit mode `build`/`quit`/`timed`, cadence, check-ins, rest/slip/timer/manual totals remain unchanged.
- Local data:
  - mobile calendar/week panel open/closed state is transient component state only.
  - existing same-day timer localStorage behavior remains unchanged.
- Derived view-model data:
  - user-facing mode label `Do`, card chip list, quick status labels, and streak wording are derived render labels.
- Sync policy:
  - no new writes or sync triggers.
  - check-in mutations continue to use existing selected snapshot date; this route will not expose historical date editing in this child.
- Retention and sensitivity:
  - no new data retained.
  - habit names/check-ins remain private and must not leak into logs/analytics.
- Cache/invalidation:
  - `/my-library/habits` remains dynamic.
  - no new revalidation path.

## Identity And Rename Contract

- Canonical stable ID:
  - habit row IDs remain the source of truth.
- Human-readable identifiers:
  - habit titles remain editable user labels.
  - `Do` is only a user-facing label for internal `habit_mode = build`.
- Mutability rules:
  - changing a visible mode label does not rename, migrate, or repurpose stored habits.
- Compatibility contract:
  - existing `build` rows continue to render as `Do`.
  - unknown future modes must not render as success or silently map to `Do`; future mode labels need explicit mapping and tests.
- Observability and repair:
  - support should diagnose stored mode as `build` while describing it to users as `Do`.

## Forward Compatibility Contract

- Future habit modes, cadence policies, status labels, card actions, calendar states, history event types, and localized strings require explicit label/view-model mapping.
- New habit rows returned by current contracts inherit the card hierarchy automatically.
- New status/event types must fail visibly as unknown/not-counted until mapped in the relevant child.
- Future prior-day editing/backfill must be owned by Child C with explicit rules for start date, check-in overwrites, undo, rest/slip, timer/manual source, support diagnosis, and tests.
- Evidence for this child:
  - component tests cover `build` storage rendered as `Do`;
  - route/label/support sweep covers stale `Build` user-facing docs;
  - screenshot handoff covers mobile/desktop chip and calendar access.

## Help / Guide Impact

Required because visible habit labels and support language change:

- update `docs/user-flow-map.md` for `Do` user-facing mode and mobile calendar/week overview behavior;
- update `docs/runbooks/auth-account-support.md` so support knows `Do` maps to stored `habit_mode = build`;
- route/label/support sweep before broad gates.

## Route / Label / Support Surface Sweep

Required search terms:

- `/my-library/habits`
- `HabitPerfectDayHub`
- `Build`
- `Do`
- `build`
- `habit_mode`
- `Streak`
- `streak`
- `0 times today`
- `on target today`
- `Today:`
- `Calendar`
- `Add habit`
- `Details`
- `Rest day`
- `Timed`
- `Quit`

Required surfaces:

- `app/`
- `components/`
- `lib/habits/`
- `tests/`
- `docs/task-briefs/`
- `docs/design/`
- `docs/runbooks/`
- Help/Guide assertions when present.

Sweep evidence:

- identifiers searched: `/my-library/habits`, `HabitPerfectDayHub`, `Build`, `Do`, `build`, `habit_mode`, `Streak`, `streak`, `0 times today`, `on target today`, `Today:`, `Calendar`, `Add habit`, `Details`, `Rest day`, `Timed`, `Quit`;
- surfaces checked: `app/`, `components/`, `lib/habits/`, `tests/`, `docs/task-briefs/`, `docs/design/`, `docs/runbooks/`, `docs/user-flow-map.md`;
- fallout handled: stale user-facing Habits card labels/tests/support wording updated in this child; weekly swipe/selected-day editing and water `Any amount` builder semantics deferred to H-020/Child C and H-019/Child F.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `UX flow clarity`
- `Visual design quality`
- `Accessibility (a11y)`
- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Content governance`
- `Incident response and support operations`
- `i18n operational readiness`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                        | Evidence                        | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Habits card UI supports fast mobile scanning and keeps calendar/backfill scope clearly separated.                                                                         | brief scope + screenshots       | `5/5`                   |
| UX flow clarity                               | `target`     | Cards show one primary status/progress truth and clear next action; mobile can reveal week overview without landscape rotation.                                           | component tests + screenshots   | `5/5`                   |
| Visual design quality                         | `target`     | Pills, progress text, and action rows fit mobile/desktop without overlap and match existing My Library tokens.                                                            | screenshot handoff              | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Internal `build` mode, cadence, timer, rest/slip, and check-in calculations remain unchanged; only derived labels/layout change.                                          | unit tests + diff review        | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor, CRUD, publish workflow, or admin action surface changes.                                                                                     | explicit scope rationale        | `N/A`                   |
| Accessibility (a11y)                          | `target`     | New calendar/week toggle has accessible name/state; changed labels remain keyboard and screen-reader friendly.                                                            | component tests + screenshot QA | `5/5`                   |
| Accessibility                                 | `target`     | Lifecycle-lint alias for canonical `Accessibility (a11y)`; same threshold and evidence.                                                                                   | component tests + screenshot QA | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no new dependency; changed route should avoid meaningful JS/CSS bloat.                                                                                   | diff review + verify gate       | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Derived UI labels/toggle state are separated from server-canonical habit/check-in data; no backfill editing is introduced.                                                | data contract + tests           | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: route remains dynamic and no cache behavior changes.                                                                                                     | diff review                     | `4/5`                   |
| Reliability and failure handling              | `target`     | Existing load/offline/action feedback remains intact and calendar toggle does not hide recovery states.                                                                   | component tests + screenshots   | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: protected route/authz/API behavior unchanged; no new API input.                                                                                          | diff review                     | `4/5`                   |
| Privacy and compliance                        | `target`     | No new logging/analytics/public exposure of private habit names or check-ins.                                                                                             | diff review                     | `5/5`                   |
| Content governance                            | `target`     | User-facing `Build` -> `Do` fallout is swept across product tests/docs/support surfaces.                                                                                  | route/label/support sweep       | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: contextual admin notes spacing risk is checked visually, but admin workflows/actions do not change.                                                      | screenshot handoff              | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because Habits is authenticated/private and no public metadata, sitemap, robots, canonical URL, or structured data changes.                                           | private-route rationale         | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity model, structured data, or public AI-facing copy.                                                                    | private-route rationale         | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no event taxonomy or payload changes; rendered labels should not alter analytics IDs.                                                                    | diff review                     | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no Stripe, checkout, entitlement, catalog, portal, invoice, refund, payout, or revenue flow changes.                                                          | commerce scope rationale        | `N/A`                   |
| Incident response and support operations      | `target`     | Support docs explain `Do` user label vs stored `build` mode and preserve diagnosis guidance.                                                                              | support docs diff               | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: no billing provider data, invoice/refund path, payout, finance report, reconciliation surface, entitlement truth, or revenue operation changes. | explicit finance rationale      | `N/A`                   |
| i18n operational readiness                    | `target`     | Changed labels avoid compound hyphen wording, tight fixed widths, and mode-copy hardcoding without mapping.                                                               | tests + screenshot QA           | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing `HabitPerfectDayHub`, helpers, My Library tokens, lucide icons, and tests; no dependency added.                                                            | diff review                     | `5/5`                   |
| Testing and QA automation                     | `target`     | Focused unit/component tests pass, changed briefs pass lint, and visual work gets screenshot handoff before broad gates.                                                  | test commands + screenshots     | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no storage/API/event-volume increase.                                                                                                                    | diff review                     | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | UI/copy-only runtime diff rolls back by git revert; no migration/flag required.                                                                                           | PR diff + gates                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse `HabitPerfectDayHub` as the mature Habits renderer.
  - Keep `/my-library/habits` authenticated route boundaries.
  - Do not expose historical date route behavior in this child.
- TypeScript/domain contracts:
  - Keep `HABIT_MODE_VALUES`, `HabitMode`, `HabitDayItem`, `HabitEvaluation`, cadence, timer, and check-in helpers unchanged unless tests prove copy-only helper extraction is needed.
  - Preserve `habitMode: "build"` payloads.
- Supabase/data layer:
  - No migration, RLS, schema, generated type, or API persistence change.
- External services/tools:
  - No new external services, SDKs, analytics vendors, notification providers, or sound libraries.
- UI system:
  - Use existing `fs-library-card`, `fs-cta-*`, `ui-field`, `mobileActionItemClass`, and lucide icons.
  - Screenshot handoff must be before/after or after/reference for mobile and desktop Habits cards.
- Testing:
  - Update focused component tests for label, progress, chip, and calendar toggle behavior.
  - Domain tests should remain unchanged unless copy helper behavior moves into shared code.

## Acceptance Criteria

1. Child D brief exists in `docs/task-briefs/in-progress/` and parent/queue/inventory point to it.
2. `Build` is no longer the user-facing Habits mode label in active product UI; `Do` is shown instead while API payloads remain `build`.
3. Card quick-status copy shows one readable count/progress truth for count habits.
4. Streak copy uses `Streak: N days` style where a streak label is shown.
5. Mode/cadence/status chips no longer compete with the title on mobile; details still exposes the mode.
6. Active-focus mobile Habits can reveal the existing 7-day overview through a calendar/week control near `Add habit`.
7. Prior-day editing/backfill remains deferred and is documented as Child C scope.
8. Focused component tests pass.
9. Route/label/support sweep fallout is handled or explicitly deferred.
10. Screenshot handoff is captured and approved before `npm run verify:pre-pr`.

## Validation

Required before screenshot handoff:

- `./node_modules/.bin/vitest run tests/unit/habit-perfect-day-hub.test.tsx`
- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `git diff --check`

Required after owner screenshot approval:

- `npm run verify:pre-pr`
- PR checks green
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-06-04 | in-progress | owner approved the recommended Child D direction after Child B closeout; created branch aw-006-habits-mobile-card-polish and this in-progress brief from clean main@b090d9d; scoped visible Habits card/mobile/copy/calendar access while deferring backfill/history editing to Child C | next: update parent/queue/inventory, implement focused UI/copy changes, run targeted tests, then capture screenshot handoff before broad gates`
- `2026-06-04 | screenshot-handoff | implemented focused card/mobile copy polish, user-facing Do label, compact mobile calendar icon access, Apple-inspired 17px title/15px secondary card hierarchy, count copy as Today + Goal, and scoped mobile nav/admin-notes spacing; validation passed: habit-perfect-day-hub vitest 37/37, npm run typecheck, npm run lint:briefs:all, git diff --check; npm run lint:briefs skipped because the new brief is not staged yet; screenshot artifacts captured at output/aw006-habits-child-d-2026-06-04-100948 using a temporary deterministic production-component harness that was removed after capture | next: owner visual approval before npm run verify:pre-pr`
- `2026-06-04 | screenshot-refresh | owner review requested water reminder semantics, amber slip chip, consistent timed pill placement, removal of on-track wording, and week swipe/date-label scope decision; implemented amber slip chip, aligned timed cadence chip with other card chips, changed quit consistency to days clear, changed Do consistency wording to days done, hid non-meaningful completed Do secondary copy, modeled water as Done-only in screenshot evidence, and recorded H-019/H-020 as deferred to builder semantics / Child C history-calendar; validation passed: habit-perfect-day-hub vitest 37/37, npm run typecheck, npm run lint:briefs:all, git diff --check; screenshot artifacts captured at output/aw006-habits-child-d-2026-06-04-103839 using a temporary deterministic production-component harness that was removed after capture | next: owner visual approval before npm run verify:pre-pr`
