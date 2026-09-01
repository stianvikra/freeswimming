# Task Brief: AW-006 Habits Canonical Local-Day Boundary (10/10)

## Metadata

- `id`: `2026-08-31-aw-006-habits-canonical-local-day-boundary-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-08-31`
- `updated`: `2026-09-01`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `parent_child`: `Child X`
- `target_findings`: `H-070`, `H-079`
- `execution_mode`: `completed; PR #1248 squash-merged as 8cec2b77 after owner approval and green release gates`
- `intended_branch`: `codex/aw-006-habits-canonical-local-day-boundary`
- `strict_10_10_mode`: `yes; screenshot approval stop applies if product-rendering files or visible date state change`

## Brief Audit Record

- `last_audited`: `2026-09-01`
- `base`: completed runtime merged at clean synced `main@8cec2b77`; original implementation started from `main@e8e366ce`.
- `audit_status`: `completed`
- `decision`: Completed as the single Child X for H-070/H-079 in PR `#1248`; no second Habits child was activated.
- `reason`: The original audit found UTC-derived `today` values across Habits and Calendar plus a create/update guard that trusted client-controlled `selectedDate`. PR `#1248` closed both problems with a validated request-time timezone contract and server-owned local-day write boundary, without database persistence or a broad app-shell rewrite.
- `transport_decision`: Browser IANA timezone is reconciled into a functional `fs_timezone` cookie. Server reads validate the cookie; explicit valid mutation timezone takes precedence; missing context falls back to UTC; invalid explicit mutation timezone returns typed `400`.
- `must_refresh_before_execution_if`: Refresh if Next.js request-cookie/cache behavior, `components/SiteChrome.tsx`, `/my-library/habits`, `/my-library/calendar`, Home/My Routines loaders, `lib/habits/shared.ts`, `lib/habits/server.ts`, Habits or Micro Sessions linked-Habit routes, Calendar date helpers, scorecard categories, Help/support contracts, screenshot rules, or validation lanes change after `main@e8e366ce`.
- `scope_stop`: If execution proves that a validated request cookie cannot provide the required boundary without profile/database persistence, a broad app-shell rewrite, or a new external dependency, stop and revise this brief before continuing.

## Goal

Make one validated local calendar day the shared boundary for Habits reads, summaries, and protected writes across Habits, Home/My Routines, Calendar, and linked Micro Session credit, while independently closing the future definition-start bypass.

## Pre-Implementation Owner Explanation

Vi skal gjøre `today` likt i Habits, Home/My Routines, Calendar og Habits-API-ene. Appen skal bruke klokkeslettet fra serveren sammen med en validert IANA-tidssone fra enheten, slik at lokal midnatt ikke flytter brukeren til feil dag.

Hvorfor det betyr noe: i dag kan noen flater bruke UTC mens nettleseren bruker lokal tid. Da kan brukeren se feil dag, få feil uke eller møte en sperre som ikke passer lokal tid. En klient kan også sende både fremtidig `startDate` og samme fremtidige `selectedDate`; serveren må avvise dette mot sin effektive lokale dag.

Utenfor scope er review-backlog, H-080 ukjente habit-definition-verdier, bred e2e-hardening, snapshot-ytelse, analytics-rename, redesign, reminders, eksport, provider/native timezone-sync og profilbasert timezone-persistens.

Fremoverkompatibilitet: alle gyldige IANA-tidssoner skal virke uten en hardkodet soneliste. Nye støttede habit-typer skal arve samme dato-/ukegrense. Labels skal komme fra delte view-model-mappinger uten å endre ID-er eller historikk. Nye modes/states som endrer `due`, `done`, review, streak eller Calendar-telling krever eksplisitt mapping, tester og Help/support-sweep før release.

## Parent Findings Owned

| Finding | Child X disposition                                                                                                                                                                           |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `H-070` | Own one canonical local-day contract across Habits, Home/My Routines, Calendar, snapshot windows, absence review, reset, check-ins, definition writes, and linked Micro Session Habit credit. |
| `H-079` | Reject create/update `startDate` later than server-derived effective local `today`, even when the client sends the same future `selectedDate`.                                                |

Explicitly not owned:

- `H-063`: owner-deferred setup guide/tracking-mode intent.
- `H-071`: current-week versus all-unresolved review backlog breadth; separate product/query decision.
- `H-072/H-073`: broad route/hash and browser-flow hardening beyond the focused timezone reconciliation proof.
- `H-074`: deep-history snapshot performance.
- `H-075`: legacy catch-up analytics taxonomy decision.
- `H-080`: unknown definition type/mode/status fail-closed mapping; later Child AA.

## Current Audit Evidence

- Reads and snapshots mixed UTC-derived `today` values across Habits, Home/My Routines, Calendar, and `getHabitCheckInEndDate`; check-in, absence-review, reset, and linked Micro paths also owned separate write boundaries.
- H-079 existed because definition create/update trusted client-controlled `selectedDate` as the upper bound for `startDate`; matching future values could pass together.
- The repo already had dependency-free `Intl.DateTimeFormat(...).formatToParts` IANA handling in Dryland, and local Next.js 16 docs confirmed async request-time `cookies()` for Server Components and Route Handlers.

## Canonical Local-Day Contract

`instant` is the captured server clock; `effectiveTimezone` is a validated IANA zone; `todayDate` is its `YYYY-MM-DD`; `selectedDate` is view context only and never proof of server today.

| Boundary        | Contract                                                                                                                                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Source priority | Valid explicit mutation timezone, then valid `fs_timezone`, then deterministic `UTC`; invalid explicit input is typed `400` even when the cookie is valid.                                                              |
| Conversion      | One dependency-free `formatToParts` helper accepts every runtime-supported IANA zone after length validation; critical paths inject `now`/`todayDate` and never hide a wall clock.                                      |
| Cookie sync     | One small client synchronizer writes only missing/changed values and refreshes at most once; `Path=/`, `SameSite=Lax`, HTTPS `Secure`, no `Domain`, at most 12 months, JavaScript-readable but always server-validated. |
| Travel/history  | A changed device zone affects later requests only and never re-keys history; first request may use UTC before one hydration reconciliation.                                                                             |
| Date keys       | Only instant-to-day conversion is timezone-aware; validated date-key arithmetic remains UTC-safe. Historical backfill stays between Habit start and local today; intentional future Calendar Plan dates stay supported. |
| Definitions     | Create/update requires `startDate <= todayDate` independently of `selectedDate`.                                                                                                                                        |
| Child writes    | Check-ins, absence acknowledgements, resets, and linked Micro credit/removal use the same boundary, reject future/invalid dates before mutation, and preserve auth, ownership, and stable errors.                       |
| Reads/cache     | Habits, Home/My Routines, Calendar, and explicit snapshot contexts agree for the same instant/zone; existing dynamic/no-store isolation remains.                                                                        |

## Expected Impacted Surfaces

- Shared contract: `lib/my-library/local-day.ts`, `lib/my-library/local-day-server.ts`, and `components/my-library/LocalDayTimezoneSynchronizer.tsx`.
- Domain/read surfaces: `lib/habits/{shared,server}.ts`, `lib/my-library/{calendar,today}.ts`, Home, Habits, My Routines, Calendar, and Review Actual pages.
- Writes: the five Habits route handlers plus linked Habit behavior in `lib/dryland/micro-habit-linkage.ts` and the Micro Plan route.
- Evidence: focused helper/domain/route/page/component/analytics tests and one narrow Playwright reconciliation flow, without claiming broad H-072/H-073 closure.
- Support/contracts: `docs/api-contracts.md`, `docs/user-flow-map.md`, `docs/runbooks/auth-account-support.md`, lifecycle docs, and the `/cookies` disclosure.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Business logic correctness and data integrity
- Performance (CWV + payloads)
- Data placement and sync boundaries
- Caching and invalidation strategy
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Content governance
- Incident response and support operations
- i18n operational readiness
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                               | Evidence                                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Close H-070/H-079 only; all named Habits/Today/Calendar/write consumers use one date context without widening backlog, UI, analytics, or performance scope.                      | impacted-surface audit, parent return, tests             | `5/5`                   |
| UX flow clarity                               | `target`     | For the same instant/zone, Habits, Home/My Routines, and Calendar agree on Today/week with no refresh loop, focus loss, or conflicting date copy.                                | focused browser proof, page/component tests, screenshots | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: no redesign; visible date states must preserve current hierarchy and avoid flicker/layout regression after timezone reconciliation.                             | screenshot handoff and visual review                     | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Identical instant/zone yields identical date keys; every relevant future write is rejected; H-079 matching-future bypass performs zero insert/update; no history is re-keyed.    | pure/domain/route negative-path tests                    | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor, publish flow, operator queue, or admin CRUD changes.                                                                                                | explicit admin-editor scope rationale                    | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: reconciliation must not steal focus, create noisy announcements, or alter existing accessible names/semantics.                                                  | component/browser assertions and screenshot review       | `4/5`                   |
| Performance (CWV + payloads)                  | `target`     | Zero extra refresh when cookie matches, at most one refresh per detected zone change, no new DB query/dependency/history expansion, and existing route/performance budgets pass. | synchronizer tests, query/dependency diff, perf gate     | `5/5`                   |
| Performance                                   | `target`     | Alias row for brief-lint closeout normalization of `Performance (CWV + payloads)`; the same threshold and evidence apply.                                                        | synchronizer tests, query/dependency diff, perf gate     | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Server clock plus validated request timezone derives today; cookie stores timezone only; database dates remain canonical; no profile persistence or historical rewrite.          | data contract, storage diff, tests                       | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Existing dynamic/no-store behavior is preserved; timezone change refreshes only once; mutation snapshots use the same date context; no cross-zone cache reuse.                   | route/cache audit and tests                              | `5/5`                   |
| Reliability and failure handling              | `target`     | Missing timezone uses UTC, invalid cookie fails soft, invalid explicit timezone returns `400`, sync cannot loop, and covered paths produce zero unexpected `500`.                | unit/route/browser negative paths                        | `5/5`                   |
| Security and authz                            | `target`     | All protected writes remain authenticated, owner-scoped, strictly validated, and fail closed before DB mutation.                                                                 | unauthorized/cross-owner/invalid/future route tests      | `5/5`                   |
| Privacy and compliance                        | `target`     | `fs_timezone` contains only an IANA zone, has bounded retention/secure attributes, is documented, and no habit content or raw request data enters logs/analytics.                | cookie/privacy review, payload/log audit                 | `5/5`                   |
| Content governance                            | `target`     | API, user-flow, cookie, support, parent, and child docs describe the same source priority, fallback, and date guard.                                                             | docs diff and impact sweep                               | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow labels/actions, role-gated admin mutation, or operator edit surface changes.                                                                       | explicit admin-workflow scope rationale                  | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because changed domain surfaces are authenticated/private or signed-in branches of Home; no metadata, sitemap, robots, canonical URL, or public content change.              | private/signed-in route rationale                        | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no crawl-safe public entity, structured data, AI-facing content, or public discovery surface changes.                                                                | explicit AI scope rationale                              | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no new event is required; existing events must not receive raw timezone or double-fire because of reconciliation refresh.                                       | analytics callsite/event-count audit                     | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, Stripe, catalog, entitlement, invoice, refund, payout, or revenue operation changes.                                                                    | explicit commerce scope rationale                        | `N/A`                   |
| Incident response and support operations      | `target`     | Support can identify timezone source/fallback, explain local-day behavior, and diagnose a rejected date without private habit text or unsafe manual repair.                      | support runbook and deterministic diagnostics            | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: no billing provider data, invoice/refund path, payout, finance report, reconciliation, entitlement truth, or revenue operation changes.                | explicit finance scope rationale                         | `N/A`                   |
| i18n operational readiness                    | `target`     | Every runtime-supported IANA zone works without a hardcoded list; date keys stay locale-independent and display labels remain view-model-owned.                                  | zone matrix and label/locale review                      | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse Next.js 16 request APIs, current Habits/Calendar helpers, the Dryland IANA pattern, and existing test stack; add no dependency or parallel date system.                    | architecture/dependency diff                             | `5/5`                   |
| Testing and QA automation                     | `target`     | Deterministic zone/DST matrix plus read/write/page/sync negative paths pass; focused browser proof is added without claiming broad H-072/H-073 closure.                          | Vitest, focused Playwright, verify gates                 | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no new DB query, deep-history window, per-zone cache fan-out, background job, or external call.                                                                 | query/cost diff and perf gate                            | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | No migration or secret; rollback is a normal code/docs revert, removes/ignores the cookie safely, and preserves stored history.                                                  | migration/secret diff, rollback note, CI/pre-merge       | `5/5`                   |

Release gate: every target category must be at least `4/5`. A `10/10` claim requires every critical target category above to reach `5/5` with recorded evidence.

## Stack / Architecture Best-Practice Gate

- React/Next.js: local Next.js 16 cookie, route-handler, server/client, and caching guides were read; timezone detection stays in a minimal Client Component, async request cookies in a server-only adapter, and existing dynamic/no-store route boundaries remain.
- TypeScript/domain: discriminated timezone/date validation receives captured `now`; route adapters return typed errors; snapshots receive explicit `{ selectedDate, todayDate }`; lexical comparison follows strict real-date validation.
- Supabase/data: no migration, RLS/index/generated-type/backfill change; `habit_check_ins.timezone` remains write provenance. Profile persistence would require a refreshed brief.
- External services: no dependency, provider, secret, plugin, native/geolocation service, or Sites work; Playwright timezone emulation is test-only.
- UI/reference: reuse `HabitPerfectDayHub`, Habits snapshots, Home/My Routines quick actions, Calendar models, and existing tokens; preserve visual language and use the required screenshot stop for corrected visible date state.

## Codex Skill / Stack Readiness Radar

Capability audit:

- Available: local repo/test tooling, Playwright timezone emulation, browser screenshot workflow, and local Next.js 16 docs.
- Not needed: Sites, external timezone APIs, database plugins, or new skills/dependencies.
- Install/config changes: none without separate owner approval.

| Surface                     | Finding                                                                             | Severity | Classification                 | Owner decision                                                     | Return path                     |
| --------------------------- | ----------------------------------------------------------------------------------- | -------- | ------------------------------ | ------------------------------------------------------------------ | ------------------------------- |
| Server-readable local day   | Browser knows IANA timezone while server reads currently fall back to UTC.          | `high`   | `bounded implementation child` | No; this brief selects validated functional cookie + UTC fallback. | This Child X.                   |
| Definition start-date guard | Matching future `startDate`/`selectedDate` can bypass the intended server boundary. | `high`   | `bounded implementation child` | No; same local-day invariant.                                      | This Child X, H-079.            |
| Unknown definition values   | Type/mode/status coercion requires a wider consumer mapping contract.               | `medium` | `do not do` in Child X         | Later scope approval.                                              | Parent H-080 / future Child AA. |

Return path: after merge/closeout, update the parent with exact H-070/H-079 status, keep every other open finding unchanged, reset `selected_child` to `none`, and return to the parent before another Habits slice.

## Domain Granularity Gate

- User's mental object: today's Habit day and the Monday-Sunday week that contains it.
- Canonical persisted objects: Habit definition, check-in, absence-review acknowledgement, reset event, and optional linked Micro Session Habit credit, each identified by its existing stable row ID.
- Mature reference surfaces: `HabitPerfectDayHub`, `loadHabitSnapshot`, Habits routes, `lib/my-library/calendar.ts`, Calendar page models, and `lib/my-library/today.ts`.

| Level                     | Child X decision                                                                                                             |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Habit definition          | Preserve `view/create/edit/archive/restore`; reconcile only `start_date <= effective local today`. No delete/reorder change. |
| Habit check-in            | Preserve existing create/update/clear/backfill actions; reconcile future boundary and snapshot date context.                 |
| Absence acknowledgement   | Preserve current create/update semantics; reconcile future boundary only. No backlog expansion.                              |
| Reset boundary            | Preserve reset event and history; reconcile effective local-day guard only.                                                  |
| Day summary               | `view/reconcile` so all consumers use the same local date key.                                                               |
| Week summary              | `view/reconcile` so the same local date selects the same ISO week; cadence math otherwise unchanged.                         |
| Calendar Plan future day  | `view` unchanged; intentional future planning remains supported.                                                             |
| Timer/local UI state      | Out of scope except the explicit date key used when saving.                                                                  |
| Unknown definition values | Out of scope; H-080 remains visible as a separate fail-closed gap.                                                           |

Child-structure rule: tests must prove the definition/check-in/review/reset child records at their own write boundaries; summary-only screenshots cannot prove this data-integrity slice.

## Data Placement And Sync Contract

| Placement          | Decision                                                                                                                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Server-canonical   | Captured server instant plus persisted definitions, check-ins, acknowledgements, resets, links/credit, and validated stored date keys.                                           |
| Request-local      | Browser IANA zone in `fs_timezone` and one-refresh reconciliation state; neither is identity, auth, nor history.                                                                 |
| Derived            | Source classification (`explicit`, `cookie`, `utc_fallback`), `todayDate`, and ISO week/month windows.                                                                           |
| Sync/conflict      | Matching cookie does nothing; missing/changed value writes and refreshes once; valid explicit mutation value wins; failure preserves snapshot/draft; travel never rewrites rows. |
| Retention/privacy  | At most 12 months and disclosed as functional; no user ID, habit text/status, raw timezone analytics field, or secret.                                                           |
| Cache/invalidation | Preserve dynamic/no-store isolation; successful mutations reuse their guard context; no global tag or cross-user/cross-zone reuse.                                               |

## Identity And Rename Contract

- Canonical stable IDs: existing Habit, check-in, acknowledgement, reset, Micro Plan, and link row IDs.
- Date keys and timezone are contextual attributes, never entity IDs.
- Habit titles remain renameable and do not affect timezone/date identity.
- A timezone rename/alias accepted by the runtime may normalize only future request context; it cannot rewrite rows.
- `fs_timezone` may be replaced or deleted safely; missing state falls back to UTC.
- Support diagnostics use owner-scoped stable IDs plus date/source classification, never a title as identity.

## Forward Compatibility Contract

- Extensibility covers IANA zones, Habit types/modes/cadences/statuses, labels/locales, Calendar consumers, mutation sources, analytics, exports, and native/provider sources.
- Automatic: every runtime-supported IANA zone and currently supported Habit type uses the shared boundary; compatible consumers reuse the context; label changes remain shared view-model presentation and never alter IDs/history.
- Explicit mapping: any new value that changes `due`, `done`, review, streak, Perfect Day, Calendar, source precedence, exports, analytics, native/provider input, or persistence requires the relevant DB/type/domain/view-model/consumer/test/Help-support decision before release.
- Fallback: invalid explicit zone is `400`/no write; invalid or missing cookie uses UTC and may reconcile; H-080 remains the documented unknown-definition exception and is not claimed fixed here.
- Evidence: deterministic zone/DST and invalid/missing fixtures, future-write negatives, cookie-sync proof, and route/label/support sweep.

## Help / Guide And Operator Training Impact

- Update user-flow, API-contract, support-runbook, and `/cookies` surfaces with source priority, local Today, typed rejection, safe diagnosis, no-history-rewrite, purpose/content, and retention; protect the contract with automated assertions.
- In-app Help/Guide is `N/A` only because the execution sweep found no relevant Habits/local-day guide; existing guide content covers unrelated Poolside and `0-1000m` workflows.

## Route / Label / Support Surface Sweep

- Before the first broad gate, search `getTodayCalendarDate|normalizeHabitDate|todayDate|selectedDate|startDate|checkInDate|effectiveDate|reviewDate|timezone|fs_timezone|loadHabitSnapshot|check_in_date|start_date|effective_date|review_date|Today|Weekly Overview`.
- Sweep `app/`, `components/`, relevant `lib/`, `tests/`, API/user-flow docs, runbooks, lifecycle briefs, and cookie/privacy copy; record updated fallout and intentional leftovers.
- H-071/H-072/H-073/H-074/H-075/H-080 remain explicit deferrals, never silent scope expansion.

## Security, Privacy, And Failure-Mode Contract

- Cookie, query, params, JSON, browser zone, and stored boundary rows are untrusted; validate exact runtime IANA values and strict real dates before every mutation, with no substring/offset/location inference.
- Preserve Supabase auth/ownership and fail closed: stable `400` for invalid input, `401/404` for access, `503` for missing schema, and safe deterministic `500` for true storage/corrupt persisted data.
- The cookie is neither secret nor authorization. Add no key, geolocation/IP service, private habit diagnostics, migration, re-key, or destructive cleanup.

## Observability And KPI Contract

- Add no event or raw timezone payload. Existing view/mutation events must wait for reconciled context and not double-fire; safe support diagnostics may expose source classification and validation result without habit text.
- Success is zero unexpected validation `500`, refresh loops, and covered future writes, plus identical date keys for the same instant/zone across named consumers.

## Scope

In scope: one dependency-free IANA/local-day contract; validated functional-cookie reconciliation; explicit context through Habits, Home/My Routines, Calendar, and snapshots; the same boundary for protected Habit and linked Micro writes; H-079 closure; focused automated/visual evidence; support/contracts and parent/queue/inventory lifecycle.

## Out Of Scope

Out of scope: H-063/H-071/H-072/H-073/H-074/H-075/H-080; new/redesigned Habit UI, labels or semantics; reminders/notifications/exports/delete/dashboard/new analytics; profile/database timezone persistence, migrations/RLS/types, providers/native/geolocation/IP/external dependencies; historical date/ID rewrites; unrelated Dryland/Micro work; and merge without explicit owner approval.

## Acceptance Criteria

1. One shared helper converts an injected instant plus any valid IANA timezone into a deterministic `YYYY-MM-DD`; normalized date-key arithmetic remains UTC-based.
2. Source precedence is implemented exactly as explicit valid mutation timezone, valid `fs_timezone` cookie, then UTC fallback.
3. Invalid explicit timezone returns `400` with no DB write; invalid/missing cookie yields deterministic UTC reads and no unexpected `500`.
4. Cookie reconciliation performs zero refreshes when matched and at most one refresh for each detected timezone change, without focus loss or event loops.
5. Habits, Home, My Routines, Calendar, and snapshot boundaries produce the same `todayDate` for the same injected instant/timezone.
6. UTC, Europe/Oslo midnight, Oslo DST start/end, and at least one opposite date-boundary timezone are covered deterministically.
7. Habit create and update each reject matching future `startDate` + future `selectedDate` with `400` before insert/update; local today and earlier valid dates still work.
8. Check-in, absence-review, reset, and linked Habit credit/removal reject future local date keys wherever that mutation contract applies.
9. Unauthorized/cross-owner/invalid/future negative paths keep stable status codes and perform no mutation.
10. Home/My Routines/Habits/Calendar preserve intentional future Calendar Plan behavior while history/completion boundaries stay capped to local today.
11. Timezone change does not rewrite/re-key any persisted history, and no migration/profile field is added.
12. No new DB query, history-window expansion, external dependency, analytics event, or raw timezone analytics payload is introduced.
13. API, user-flow, support, cookie, parent, queue, and inventory docs agree with shipped behavior.
14. Focused Vitest and Playwright timezone reconciliation tests pass without claiming H-072/H-073 broad closure.
15. If visible rendering changes, 2-4 after/reference screenshots receive owner approval before `npm run verify:pre-pr`.
16. Required local gates and CI pass; all target categories are at least `4/5`, and every critical target is `5/5` before any `10/10` claim.

## Validation

- Planning creation: `git diff --check`, changed/all brief lint, and docs-only verify; no runtime gate merely to create the plan.
- Execution: targeted impact sweep; focused helper/domain/route/page/component/Micro Vitest; focused timezone reconciliation Playwright; quality lint; owner-approved screenshots; then `verify:pre-pr`, required CI, and `verify:pre-merge` in order.

## Implementation Evidence Before Screenshot Approval

- Shared helpers own runtime-backed IANA validation, PostgreSQL-safe real date keys, timezone-aware conversion, UTC-safe key arithmetic, view clamping, server-rendered context validation, async cookie reading, and `explicit -> cookie -> utc_fallback` resolution.
- The synchronizer writes only `fs_timezone` with the contracted attributes; matching state does nothing and changed state refreshes once without focus loss. Habits, signed-in Home, My Routines, Calendar/Review Actual, snapshots, protected writes, and linked Micro Habit behavior now share the request-local date context while future Calendar Plan stays supported.
- Critical write builders require injected server date/instant. All Habits writes send `renderedTodayDate`; missing/stale context is `409 STALE_LOCAL_DAY_CONTEXT`, malformed is `400 INVALID_DATE`, and the client refreshes once without auto-retry while preserving drafts/focus. Browser time never owns a write.
- Micro completion/undo validates the captured action instant against its timezone-based week and credits/removes the server-derived local date. Travel preserves unchanged stored start dates; explicit changes still reach the guard; untouched Add defaults follow corrected Today while touched values remain.
- Analytics waits for corrected timezone/snapshot, emits no raw timezone, and does not double-fire. Invalid explicit zones/dates, non-object JSON, and corrupt stored linkage/reset boundaries fail closed before mutation.

Help/Guide audit:

- `N/A` for in-app Help/Guide because the execution sweep found no Habits or local-day guide surface: current guide content covers the Poolside and `0-1000m` trackers, while `AdminHelpCenter` is an unrelated operator surface.
- The affected guidance is instead updated in `docs/api-contracts.md`, `docs/user-flow-map.md`, `docs/runbooks/auth-account-support.md`, and the public functional-cookie disclosure in `app/cookies/page.tsx`; automated route/policy tests protect the fallback, rejection, and disclosure contracts.

Route/label/support sweep — identifiers searched: the exact brief terms; surfaces checked: product code, tests, API/user-flow/runbook/lifecycle docs, and cookie/privacy copy; fallout handled: all Child X consumers and related tests/docs. Only validated-key UTC arithmetic, legacy read normalization outside protected writes, future Calendar Plan, and H-071/H-072/H-073/H-074/H-075/H-080 remain intentionally. No schema/RLS/dependency/secret/service/history/event/label/mode/state expansion occurred.

Validation checkpoint:

- Focused Vitest passed `16/270`; compacted combined regression passed `5` files / `204` tests, and independent P0-P2 review closed UTC+14 Sunday Micro and touched-away-and-back Add-date edges. Typecheck, lint (`0` errors/`8` unrelated existing warnings), brief/quality lint, and diff check passed.
- Owner-approved, command-scoped, read-only production Supabase smoke passed the focused auth-backed Playwright reconciliation `1/1`: UTC wrote `fs_timezone=Europe/Oslo` exactly once and matching-cookie reload wrote it zero times; no Habit mutation ran. Direct cookie-write instrumentation replaced a brittle assertion that counted two normal Next reload RSC requests.
- Final current-SHA `verify:pre-pr` passed on `ea213b81` at `artifacts/test-runs/20260901-025103`: `264` unit files / `1836` tests, build, performance budgets, and Playwright `111` passed / `573` expected configuration/auth skips. PR `#1248` then passed all required CI, and `verify:pre-merge` passed on the same head with private site-lock `6/6` before the owner-approved squash merge.

## Screenshot Handoff Requirements

Required because local Today is visible: capture 2-4 deterministic `after/reference` Habits mobile/desktop plus Calendar/Home/My Routines references under a timestamped folder; explain the shared date and owner check. Tests remain authoritative for midnight/DST/writes. Owner approval is required before PR gates.

Captured evidence approved by the owner:

- Captured: `2026-08-31 22:20` local time.
- Owner approval: `2026-09-01`; the owner replied `Godkjent` with no requested visual correction.
- Artifact folder: `output/habits-local-day-boundary-2026-08-31-221335`.
- Deterministic fixture: server instant `2026-08-30T22:30:00.000Z`, runtime-validated `Europe/Oslo`, shared local Today `2026-08-31`; browser timezone was confirmed as `Europe/Oslo` in both Chromium and WebKit.
- Artifacts: Chromium `after-habits-local-today-mobile.png` (`390x844`) and desktop (`1440px`) show Aug 31 Today/Weekly Overview; WebKit `reference-calendar-local-today-mobile.png` shows `This week so far / 31 Aug`; Chromium `reference-home-routines-local-today-desktop.png` shows the matching `1/2 done · 50%` snapshot.
- Comparison is `after/reference`, not a visual redesign before/after. The temporary auth-free harness rendered the real production components because local dev-login was blocked by the documented Supabase egress guard; it was removed after capture. No production rendering file, style, or asset changed after capture.

## Manual QA Environments

- Local: `http://127.0.0.1:3000`, `SITE_LOCK_ENABLED=0`, timezone emulation; mobile Chromium/WebKit and desktop Chromium. Preview deploy/site-lock passed; external Playwright auth is unsupported and magic-link UI QA was replaced by the owner-approved local auth-backed read-only reconciliation smoke, with visual differences `none`.

## Automation, Git, And Continuity Contract

- Child X started from `main@e8e366ce` on `codex/aw-006-habits-canonical-local-day-boundary` and shipped through PR `#1248` as squash commit `8cec2b77`. The owner approved both the screenshot handoff and merge after green local and CI gates. Recovery is status, last 10 commits, then this checkpoint log; this docs-only closeout returns control to the parent.

## Return Contract

- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `resolved_findings`: `H-070/H-079 resolved in PR #1248, squash commit 8cec2b77`
- `deferred_findings`: `H-063, H-071, H-072, H-073, H-074, H-075, H-080, and every other parent finding not explicitly owned above`
- `return_checkpoint`: completed with the exact local-day source/fallback, affected consumers, tests, screenshot evidence, scorecard scores, commit/PR, and no accepted Child X gap.
- `next_return_target`: parent intake updated; `selected_child` reset to `none`; no next Habits child is selected.

## Checkpoint Log

- `2026-09-01 | done | PR #1248 shipped Child X as squash commit 8cec2b77 after owner-approved after/reference screenshots, current-SHA verify:pre-pr, green required CI, verify:pre-merge, and explicit owner merge approval; H-070/H-079 are resolved, selected_child returns to none, and every other parent finding remains deferred | next: complete the repo-managed docs-only closeout, rerun post-merge preflight, then perform the mandatory chat handoff before selecting another Habits child`
- `2026-09-01 | authenticated-browser-green | owner approved one read-only production smoke after local fake-config and preview magic-link paths could not authenticate; the corrected command loaded local env without printing secrets, focused Playwright passed 1/1 with one timezone-cookie write then zero after reload, no Habit mutation ran, and direct cookie-write evidence replaced brittle Next RSC traffic counting; diff remains below 4000 and no production rendering/style/asset changed after approved screenshots | next: amend, rerun current-SHA verify:pre-pr, push/CI, rerun pre-merge, finalize PR evidence, and report readiness without merging`
- `2026-09-01 | pre-pr-green | commit e4aeb786 at base e8e366ce passed full-public verify:pre-pr in artifacts/test-runs/20260901-013456: 265 unit files / 1807 tests, build, performance budgets, and Playwright 111 passed/573 configuration/auth skips; independent review also closed UTC+14 Sunday Micro and touched-away-and-back Add-date edges before that gate | next: superseded by the PR-size rework checkpoint above`
- `2026-09-01 | screenshot-approved | owner replied "Godkjent" to the required after/reference handoff with no visual correction; artifact folder and production-rendering stability remain unchanged | next: fetch origin/main, run verify:pre-pr, commit/push/open PR, monitor required CI, then run verify:pre-merge and report merge readiness without merging`
- `2026-08-31 | screenshot-stop | branch remains uncommitted at base e8e366ce; deterministic after/reference artifacts captured under output/habits-local-day-boundary-2026-08-31-221335 with Chromium mobile/desktop and WebKit mobile, browser timezone confirmed Europe/Oslo, all four artifacts inspected at full resolution, temporary harness/browser/server artifacts removed, and no production rendering file changed after capture | next: wait for explicit owner screenshot approval or visual corrections; do not run verify:pre-pr, commit, push, or open PR before approval`
- `2026-08-31 | pre-screenshot-validation | branch remains uncommitted at base e8e366ce; final integration review closed stale UTC/travel and long-open-midnight mutation races with server-clock-owned rendered-context guards, preserved form/focus reconciliation, strict non-object JSON rejection, and server-owned Micro current-action credit/removal; root focused Vitest 16/270, typecheck, lint (0 errors), all-brief lint 559, quality gates, and diff-check pass | next: capture and inspect the deterministic after/reference visual artifacts, remove the temporary harness, then stop for owner screenshot approval before verify:pre-pr`
- `2026-08-31 | implementation-review | branch remains uncommitted at base e8e366ce; shared local-day/request-cookie context, page/snapshot consumers, protected Habits and linked Micro writes, analytics reconciliation, travel-safe unchanged start-date edits, strict real-date handling, docs/support/cookie copy, and focused tests are implemented; in-app Help/Guide is N/A because no relevant Habits guide exists; focused Playwright was added but the local auth-backed run skipped on the documented Supabase egress guard and is not claimed green | next: finish final integration audit, run the root-owned focused suite and quality/brief linters, capture the required deterministic local visual harness, then stop for owner screenshot approval before verify:pre-pr`
- `2026-08-31 | in-progress | owner said "kjør Child X"; created branch codex/aw-006-habits-canonical-local-day-boundary from main@e8e366ce, moved this brief to in-progress, and selected it as the only active Habits child; implementation remains scoped to H-070/H-079 with the screenshot approval stop before verify:pre-pr | next: implement shared local-day context, protected write guards, page/cookie reconciliation, focused tests, docs, and screenshot handoff`
- `2026-08-31 | planned-validated | owner authorized plan-only Child X creation on main@e8e366ce; current code, tests, parent, scorecard, forward-compatibility checklist, readiness radar, and local Next.js 16 cookie/request docs were audited; this brief owns H-070/H-079 only and selects validated fs_timezone request context with explicit-mutation precedence and UTC fallback; git diff --check, lint:briefs:all, and verify:docs-only passed for the four-file planning diff; selected_child remains none, and no branch, runtime code, screenshot, commit, push, or PR started | next: wait for explicit execute/build/implement/kjør before moving to in-progress`

## Completion Record

- `completed`: `2026-09-01`
- `merged_pr`: `#1248`
- `squash_commit`: `8cec2b77`
- `result`: Closed AW-006 Child X by making the server clock plus a validated request-local IANA timezone the shared local-day boundary across Habits, signed-in Home, My Routines, Calendar, Review Actual, protected Habit writes, and linked Micro Session Habit credit/removal. Definition start dates and other covered writes now reject future local dates independently of client-selected view dates, without rewriting history or adding profile/database persistence.
- `validation`: Focused Vitest (`16` files / `270` tests plus final combined regression `5` files / `204` tests); typecheck; lint with `0` errors and `8` unrelated existing warnings; brief/quality lint; `git diff --check`; owner-approved read-only production-auth Playwright smoke `1/1`; current-SHA `npm run verify:pre-pr` on `ea213b81` at `artifacts/test-runs/20260901-025103` with `264` unit files / `1836` tests, build, performance budgets, and Playwright `111` passed / `573` expected configuration/auth skips; required GitHub CI for PR `#1248`; and `npm run verify:pre-merge`, including private site-lock `6/6`.
- `screenshot_artifacts`: `output/habits-local-day-boundary-2026-08-31-221335`; captured `2026-08-31 22:20`, approved by owner `2026-09-01`; comparison type `after/reference`; no production rendering, style, asset, or export file changed after capture.
- `resolved_findings`: `H-070`, `H-079`.
- `remaining_gaps`: None in Child X. `H-063`, `H-071`, `H-072`, `H-073`, `H-074`, `H-075`, and `H-080` remain explicitly outside scope.
- `10/10 claim`: yes - all 15 critical target categories reached `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                                                                                    | Gaps / Notes |
| --------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | H-070/H-079 closed across the named read/write consumers in PR `#1248` without widening the Habits backlog.                                                 | None.        |
| UX flow clarity                               | `5/5`          | Shared local Today/week, zero refresh when the cookie matches, at most one reconciliation refresh, preserved form/focus, and approved screenshots.          | None.        |
| Business logic correctness and data integrity | `5/5`          | Deterministic local date keys, server-owned write boundary, matching-future bypass and covered future writes rejected before mutation; no history re-key.   | None.        |
| Performance (CWV + payloads)                  | `5/5`          | No new DB query, dependency, history expansion, or refresh loop; build and performance budgets passed.                                                      | None.        |
| Performance                                   | `5/5`          | Alias row for the critical-category parser; the same evidence as `Performance (CWV + payloads)` applies.                                                    | None.        |
| Data placement and sync boundaries            | `5/5`          | Server instant plus validated request timezone derives Today; the cookie stores timezone only; database rows and history remain canonical.                  | None.        |
| Caching and invalidation strategy             | `5/5`          | Existing dynamic/no-store isolation was preserved; timezone changes refresh once; snapshots and mutations share the same context.                           | None.        |
| Reliability and failure handling              | `5/5`          | Missing/invalid cookie falls back to UTC, invalid explicit zone returns `400`, stale rendered day returns `409`, and negative paths avoid unexpected `500`. | None.        |
| Security and authz                            | `5/5`          | Protected writes remain authenticated, owner-scoped, validated, and fail closed before database mutation.                                                   | None.        |
| Privacy and compliance                        | `5/5`          | `fs_timezone` contains only an IANA zone with bounded functional-cookie attributes and disclosure; no raw timezone analytics or habit-content logging.      | None.        |
| Content governance                            | `5/5`          | API contract, user-flow map, support runbook, cookie disclosure, parent, queue, inventory, and child lifecycle agree with shipped behavior.                 | None.        |
| Incident response and support operations      | `5/5`          | Support guidance explains timezone source/fallback, rejected dates, safe diagnosis, and no-history-rewrite behavior.                                        | None.        |
| i18n operational readiness                    | `5/5`          | Runtime-supported IANA zones are data-driven; date keys remain locale-independent; labels remain view-model-owned.                                          | None.        |
| Stack-fit and dependency discipline           | `5/5`          | Reused Next.js 16 request APIs, existing Habits/Calendar contracts, shared helpers, and the current test stack; no dependency or migration.                 | None.        |
| Testing and QA automation                     | `5/5`          | Deterministic zone/DST and read/write negatives, production-auth smoke, full pre-PR lane, required CI, and pre-merge gate passed.                           | None.        |
| DevOps and rollback readiness                 | `5/5`          | No migration, secret, or external service; rollback is a normal revert that safely ignores/removes the cookie and preserves history.                        | None.        |
