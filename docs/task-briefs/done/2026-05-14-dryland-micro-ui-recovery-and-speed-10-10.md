# Task Brief: Dryland Micro UI Recovery And Speed Polish (10/10)

## Metadata

- `id`: `2026-05-14-dryland-micro-ui-recovery-and-speed-polish-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-14`
- `updated`: `2026-05-14`

## Goal

Make the Dryland and Micro Sessions experience faster to understand and easier to recover on iPhone Home Screen/PWA by reducing repeated text, moving primary dryland sessions above secondary micro details, collapsing dense editors by default, and adding explicit retry affordances where offline/error states can otherwise trap the user.

## Audit Findings

Owner UI audit on `2026-05-14` identified these issues:

1. iPhone Home Screen / PWA offline states need an explicit `Retry` action because standalone iOS web apps do not expose normal browser refresh UI.
2. `Completed and skipped` repeats one card per unit and duplicates `Complete` under each exercise name while also showing a green `Completed` status pill.
3. `Edit quick session` shows every field for every exercise expanded by default, making `Add exercise` hard to reach on mobile.
4. Source-session impact copy is too long and `next Micro Session` is ambiguous.
5. `Edit sets` is not specific enough for per-set customization.
6. `/my-library/dryland` repeats `Dryland Sessions` as both hero heading and section heading.
7. `/my-library/dryland` places the full Micro Sessions panel before saved Dryland Sessions, forcing users to scroll to find manual strength/stretching sessions.
8. `/my-library/routines` keeps Micro Sessions in a compact intermediate card; `Open` should jump to the full active Micro Session surface, while `Edit` stays available.
9. Mobile/PWA speed feels slow; the implementation must avoid adding payload, reduce visible DOM noise where practical, and validate performance budgets.
10. The Home Screen / PWA offline page must use the real freeswimming.org brand asset; a fake or hand-drawn fallback logo is not acceptable.

## Product Decision

Dryland Sessions are the main saved-session library. Micro Sessions are a derived weekly execution layer. Therefore `/my-library/dryland` should prioritize saved Dryland Sessions and creation actions first, with Micro Sessions presented as a compact status/work panel underneath unless the route is explicitly micro-focused through `?micro=active`, `?micro=edit`, or `?micro=setup`.

Quick-session editing should use collapsed exercise rows by default. The row summary is the primary scan surface; detailed inputs open only for the exercise being edited. On mobile, only one exercise row should be expanded at a time to keep the page short and reduce accidental scroll fatigue.

Completed/skipped history should aggregate repeated units by exercise, sort within status groups for scanability, and show the useful set values, for example `Reps: 3 + 3 + 3` or `Time: 30 + 30 sec`. The status pill remains the status source of truth; duplicate `Complete` text is removed.

Copy should be literal and short. Replace ambiguous `next Micro Session` language with `future micro sessions` unless code/domain inspection proves a calendar-specific phrase is safer.

Performance is in scope as a guardrail and quick-win pass, not a separate architecture rewrite. This slice must not add dependencies, new polling, or extra authenticated fetches. If measurement finds a larger root cause, record a follow-up brief instead of widening this PR.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
- Performance (CWV + payloads)
- Reliability and failure handling
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                               | Evidence                                                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library/dryland` shows create actions and saved Dryland Sessions before the weekly Micro plan unless the route is micro-focused; routines `Open` jumps to the full work surface.            | IA diff review + screenshots                                   | `5/5`                   |
| UX flow clarity                               | `target`     | Users can scan saved sessions, open current micro work, add exercises, and review completed/skipped history with no duplicate status text or unnecessary intermediate choice cards.              | component tests + screenshot handoff                           | `5/5`                   |
| Visual design quality                         | `target`     | Mobile and desktop show compact rows, no text overlap, no repeated `Dryland Sessions` heading, and no long amber explanation block crowding the first viewport.                                  | before/after screenshot artifacts                              | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Aggregating completed/skipped units is display-only; saved-session order remains unchanged in edit mode; updating current micro still preserves completed/skipped history.                       | domain/UI tests + code review                                  | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes authenticated user Dryland/Micro surfaces and no admin editor workflow.                                                                                                 | explicit admin scope rationale                                 | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Collapsed exercise rows use labelled buttons with `aria-expanded`; retry actions are buttons/links with clear labels; status pills are not the only accessible status source.                    | Testing Library assertions + Playwright smoke                  | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency or extra route fetch; `/my-library` must stay within the current JS transfer budget `<= 390kb`; changed routes get local route-level speed/payload evidence before PR handoff. | `npm run test:perf:budgets`, route-level screenshot/perf notes | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Saved sessions and micro plans remain server-canonical; collapsed/expanded editor state and retry loading state remain local-only.                                                               | data-boundary review + tests                                   | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: authenticated routes remain dynamic; existing mutation responses/router refresh behavior remain the invalidation path.                                                          | route/cache diff review                                        | `4/5`                   |
| Reliability and failure handling              | `target`     | Offline/error states on changed library surfaces include recoverable `Retry`/refresh actions and never hide existing saved data after a failed mutation.                                         | component tests + manual PWA/offline QA notes                  | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: existing owner-scoped API routes remain the mutation boundary; no new protected API or auth rule is introduced.                                                                 | API diff review + existing negative tests                      | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no new personal data category, third-party service, notification token, or analytics payload is introduced.                                                                     | privacy/no-event diff review                                   | `4/5`                   |
| Content governance                            | `target`     | New labels are short and stable: `Future micro sessions`, `Customize sets`, `Your sessions`, `Weekly micro plan`, `Retry`; docs/tests are swept for stale labels.                                | route/label/support sweep                                      | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, operator action, moderation path, or admin content editability surface changes.                                                                                   | explicit admin workflow rationale                              | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because changed routes are authenticated/private and no public metadata, sitemap, robots, canonical, or crawlable content changes.                                                           | explicit private-route rationale                               | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable route, structured public entity data, or crawl-safe content model changes.                                                                                 | explicit AI-discoverability rationale                          | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no new event taxonomy is required; if existing events are touched, payloads must remain no-PII and route-stable.                                                                | no-event review or event diff review                           | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, entitlement, subscription, refund, payout, invoice, or revenue operation changes.                                                                              | explicit commerce scope rationale                              | `N/A`                   |
| Incident response and support operations      | `target`     | Support docs/user-flow map can explain offline retry, future-vs-current micro updates, saved sessions before micro plan, and how to recover if the active weekly surface feels stale.            | support/user-flow docs + route/label sweep                     | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance reporting, invoice, subscription, payout, revenue recognition, or reconciliation data changes.                                                                            | explicit finance scope rationale                               | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: new copy stays short, literal, and localizable; no locale routing or translation workflow ships.                                                                                | copy review                                                    | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `DrylandBuilderHub`, `DrylandSessionEditor`, `DrylandMicroPlanPanel`, `TodayTabsPanel`, existing domain helpers, and Tailwind primitives; add no dependency.                               | dependency diff + code review                                  | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted tests cover collapsed quick rows, aggregated history, routines open/edit links, retry affordances, and changed copy.                                                                    | targeted Vitest/Playwright + pre-PR/pre-merge gates            | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: grouping and collapse are local render transforms over already-loaded data; no extra queries, polling, or unbounded client state.                                               | query/runtime review                                           | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | No migration/config/dependency is required; rollback is a normal code/docs/test revert and restores the previous UI.                                                                             | no-migration review + verify gates                             | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - keep `/my-library/dryland`, `/my-library/dryland/[sessionId]`, and `/my-library/routines` on existing route boundaries;
  - reuse current server loaders and client components;
  - route micro-focused entry through existing query params instead of a new route.
- TypeScript/domain contracts:
  - keep `DrylandMicroPlanRecord`, `DrylandMicroBlockSnapshot`, `DrylandSessionDraft`, and summary helpers as the typed contract;
  - add display-only grouping helpers for completed/skipped history without mutating block data;
  - preserve saved exercise order in editors.
- Supabase/data layer:
  - no schema, RLS, generated type, or migration change.
- UI system:
  - reference surfaces are the current Dryland saved-session list, Micro plan panel, and quick-session editor;
  - use compact rows and accordions instead of separate full cards per repeated item;
  - screenshot handoff is required before `verify:pre-pr`.
- Testing:
  - update targeted component/unit tests first;
  - use Playwright screenshots for changed visual surfaces;
  - run full repo gates after screenshot approval.

## Data Placement And Sync Contract

- Server-canonical:
  - saved Dryland Sessions,
  - active Micro Session plan and block status,
  - completed/skipped/released timestamps.
- Local-only:
  - collapsed/expanded exercise row state,
  - selected accordion row,
  - retry/refresh pending state,
  - display grouping for completed/skipped history.
- Sync policy:
  - saving a saved Dryland Session remains the only saved-session mutation path;
  - `Update current micro session` remains explicit and preserves completed/skipped blocks;
  - retry actions refresh or reload existing route data without writing domain data.
- Conflict policy:
  - stale source sessions and failed refreshes show recoverable errors and keep last visible state.
- Cache/invalidation:
  - authenticated routes remain dynamic; existing router refresh and mutation payloads remain the source of truth.

## Identity And Rename Contract

- Canonical stable IDs:
  - saved dryland session ids,
  - micro plan id,
  - micro unit/block ids,
  - exercise/set ids inside saved-session drafts.
- Human-readable identifiers:
  - session titles, exercise names, and status labels are display copy and remain renameable.
- Mutability rules:
  - grouped history never creates or deletes units;
  - collapsed editor rows edit the same saved exercise/set ids.
- Rename vs repurpose policy:
  - materially different saved dryland work should be a new session or deliberate current-plan update, not a silent rewrite of completed history.
- Compatibility contract:
  - existing completed/skipped history remains readable even when grouped in the UI.

## Scope

- Add explicit `Retry`/refresh affordance for offline/error states touched in My Library/Dryland/Micro surfaces.
- Use the real brand lockup on the Home Screen / PWA offline fallback.
- Rework `Completed and skipped` into grouped display rows:
  - completed and skipped groups stay separate,
  - rows sort alphabetically inside each status group,
  - repeated sets show `Reps:` or `Time:` value series,
  - remove duplicate `Complete` text under exercise names.
- Make quick-session exercise editing collapsed by default:
  - row summary first,
  - one open row at a time on mobile,
  - `Add exercise` remains easy to reach,
  - rename per-set affordance to `Customize sets` or a similarly precise short label.
- Shorten active-source impact copy:
  - replace long warning paragraph with concise future/current micro session copy,
  - keep explicit `Open current micro session` and `Update current micro session` actions.
- Remove duplicated `Dryland Sessions` section heading and place create actions directly under the hero.
- Move saved Dryland Sessions list above the full Micro Sessions panel on the default `/my-library/dryland` route.
- Keep Micro Sessions first only when the route is explicitly micro-focused.
- Change `/my-library/routines` Micro Sessions `Open` to jump to the full active/setup Micro Sessions route, while retaining `Edit`.
- Run performance quick-win review and record route-level evidence; create follow-up if the slow feeling is outside this slice.
- Update tests, docs, and screenshot handoff.

## Out Of Scope

- New database model, migration, RLS, or generated type changes.
- New analytics taxonomy.
- Full app-wide performance architecture or bundle splitting beyond obvious no-regression checks.
- Automatic week rollover or new notification/reminder behavior.
- New calendar/history view.
- Redesign of Habits, Swim Sessions, admin, checkout, course, or public marketing surfaces.

## Acceptance Criteria

1. iPhone/PWA offline or load-error states changed in this slice have an explicit `Retry` path.
2. `Completed and skipped` is grouped by exercise/status, sorted alphabetically within each status group, and no longer repeats `Complete` under the exercise title.
3. Grouped history shows useful value summaries such as `Reps: 5 + 5 + 5` or `Time: 30 + 30 sec`.
4. Quick-session exercises are collapsed by default and expose a clear summary row.
5. Opening one exercise for editing exposes the same fields as before without losing saved data.
6. `Add exercise` remains visible/reachable without scrolling through every exercise field first.
7. Per-set edit copy is precise and short.
8. Source-session impact copy is shorter and uses `future micro sessions` unless a more exact code-derived phrase is needed.
9. The duplicated `Dryland Sessions` heading is gone.
10. Default `/my-library/dryland` shows create actions and saved Dryland Sessions before the full Micro Sessions panel.
11. Micro-focused routes still prioritize the Micro Sessions panel.
12. `/my-library/routines` Micro Sessions `Open` goes to the full active/setup Micro Sessions surface; `Edit` still goes to edit mode.
13. No new dependency, migration, polling, or extra authenticated fetch is added.
14. Targeted tests and screenshots cover mobile and desktop changed surfaces.
15. `npm run verify:pre-pr` passes after owner screenshot approval, and `npm run verify:pre-merge` passes before merge recommendation.

## Validation Plan

- `npm run lint:briefs`
- Targeted Vitest:
  - `tests/unit/dryland-micro-plan-panel.test.tsx`
  - `tests/unit/dryland-builder-hub.test.tsx`
  - `tests/unit/today-tabs-panel.test.tsx`
  - `tests/unit/my-library-today.test.ts`
- Targeted Playwright for `/my-library/dryland`, `/my-library/dryland?micro=active&view=auto`, `/my-library/dryland/[sessionId]`, and `/my-library/routines` when local auth is available.
- Screenshot handoff before `verify:pre-pr`.
- `npm run test:perf:budgets` or equivalent route-level perf evidence during pre-PR gate.
- `npm run verify:pre-pr`.
- `npm run verify:pre-merge`.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/dryland`
  - `http://127.0.0.1:3000/my-library/dryland?micro=active&view=auto#micro-sessions`
  - `http://127.0.0.1:3000/my-library/dryland?micro=edit#micro-sessions`
  - `http://127.0.0.1:3000/my-library/routines`
- Screenshot handoff:
  - before/after or after/reference for default Dryland sessions order,
  - quick-session collapsed editor desktop/mobile,
  - grouped completed/skipped history,
  - routines Open/Edit links.

## Help / Guide Impact

Required. Update `docs/user-flow-map.md` and support/runbook surfaces if labels or recovery behavior change:

- offline retry behavior for Home Screen/PWA-style use,
- saved Dryland Sessions before weekly Micro plan on the default Dryland route,
- future-vs-current Micro Session update copy,
- routines `Open` vs `Edit` behavior.

## Route / Label / Support Surface Sweep

Run targeted sweep before broad gates for:

- `Dryland Sessions`
- `My Routines`
- `Micro Sessions`
- `Weekly micro plan`
- `Completed and skipped`
- `Complete`
- `Completed`
- `Skipped`
- `Edit sets`
- `Customize sets`
- `next Micro Session`
- `future micro sessions`
- `current micro session`
- `Retry`
- `Offline`
- `/my-library/dryland`
- `/my-library/routines`

Surfaces to check: `app/`, `components/`, `lib/`, `tests/`, `docs/`, `docs/runbooks/`, task briefs, and Help/Guide assertions where relevant.

Route/label/support sweep evidence:

- Identifiers searched: `Dryland Sessions`, `My Routines`, `Micro Sessions`, `Weekly micro plan`, `Completed and skipped`, `Complete`, `Completed`, `Skipped`, `Edit sets`, `Customize sets`, `next Micro Session`, `future micro sessions`, `current micro session`, `Retry`, `Offline`, `No internet`, `/my-library/dryland`, and `/my-library/routines`.
- Surfaces checked: `app/`, `components/`, `lib/`, `tests/`, `docs/`, `docs/runbooks/`, task briefs, `public/offline.html`, and `public/sw.js`.
- Fallout handled: product UI now uses `Customize sets`, `future micro sessions`, grouped completed/skipped summaries, real-brand offline fallback, and explicit retry labels; support docs and user-flow map were updated; remaining `Edit sets`/`next Micro Session` hits are historical completed briefs or this active brief's audit/sweep text, not runtime product copy.

## Checkpoint Log

- `2026-05-14 | in-progress | branch dryland-micro-ui-recovery-polish created from clean main 8e28efb after PR #706 and closeout PR #707; owner UI audit captured nine Dryland/Micro/PWA speed findings; code audit located affected surfaces in DrylandBuilderHub, DrylandSessionEditor, DrylandMicroPlanPanel, TodayTabsPanel, and my-library today state helpers | next: implement scoped UI/copy/performance quick wins, then run targeted validation and screenshot handoff before verify:pre-pr`
- `2026-05-14 | implementation | collapsed quick-session edit rows, grouped completed/skipped history, shortened future/current micro-session copy, moved saved Dryland Sessions before the weekly Micro panel on the default dryland route, routed Home/Routines Micro Open to the full active/setup surface, added retry actions for sync/offline states plus a Home Screen offline fallback, and memoized micro-plan derived lists to reduce render work on large plans | validation: targeted Vitest PASS (5 files, 43 tests), npm run typecheck PASS, npm run lint PASS, npm run lint:briefs:all PASS | next: capture screenshot handoff for owner review before verify:pre-pr`
- `2026-05-14 | screenshot-handoff superseded | captured initial after-only screenshot evidence at output/dryland-micro-ui-recovery-2026-05-14-203912; owner flagged Wall Sit duration/rest readability and requested explicit My Routines Open-target evidence | next: recapture after the targeted corrections`
- `2026-05-14 | screenshot-handoff | changed duration summaries to `Hold 30 sec`plus one`Rest 45 sec`, removed mobile separator wrap ambiguity, and captured after/reference screenshot evidence at output/dryland-micro-ui-recovery-2026-05-14-205635 using a temporary local fixture with seeded Dryland/Micro/Routines data; the fixture and capture script were removed immediately after capture, and no final product components/styles/assets changed after capture | validation: targeted Vitest PASS (5 files, 43 tests), npm run typecheck PASS, npm run lint PASS, npm run lint:briefs:all PASS | next: wait for owner screenshot approval before npm run verify:pre-pr`
- `2026-05-14 | implementation follow-up | added planned follow-up brief docs/task-briefs/planned/2026-05-14-habits-my-library-density-and-language-polish.md for separate Habits density/language work, replaced the offline fallback with the real brand lockup, tightened mobile top spacing on Dryland/My Routines, removed redundant completed-history unit counts, kept completed status pills inline, and compacted duration history labels to `Time: 30 + 30 sec` | validation: targeted DrylandMicroPlanPanel Vitest PASS (21 tests) | next: remove temporary screenshot fixture, rerun targeted validation, and hand off refreshed screenshots before verify:pre-pr`
- `2026-05-15 | screenshot-approved | owner approved refreshed screenshot handoff at output/dryland-micro-ui-recovery-2026-05-14-213313; after/reference artifacts cover offline retry, default Dryland order, collapsed quick-session edit list, grouped completed/skipped history, routines card, and full Micro Sessions Open target | validation before approval: npm run lint PASS, npm run typecheck PASS, targeted Vitest PASS (5 files, 45 tests), npm run lint:briefs:all PASS, npm run lint:quality-gates PASS, git diff --check PASS | next: run npm run verify:pre-pr, commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge readiness`
- `2026-05-15 | pre-pr-gate | npm run verify:pre-pr PASS full lane; evidence log artifacts/test-runs/20260515-053603/verify.log; unit 1080 passed, build PASS, perf budgets PASS with /my-library JS 272.0kb under 390kb, e2e 84 passed and 408 skipped in public lane due auth/dev-login gating | performance ratchet decision: hold in this UI recovery slice because PR #706 just tightened the JS transfer budget, record the tool's tighten recommendation in the PR summary, and revisit in the next performance-governance slice | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge readiness`
