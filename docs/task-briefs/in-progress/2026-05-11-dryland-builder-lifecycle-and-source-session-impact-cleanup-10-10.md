# Task Brief: Dryland Builder Lifecycle And Source Session Impact Cleanup (10/10)

## Metadata

- `id`: `2026-05-11-dryland-builder-lifecycle-and-source-session-impact-cleanup-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-11`
- `updated`: `2026-05-11`

## Goal

Make Dryland Sessions readable as the saved-session library while making Micro Sessions a compact daily execution layer with explicit lifecycle controls and clear source-session update behavior.

## Product Decision

Saved Dryland Sessions can be a full strength or mobility session, often much longer than the daily Micro Session. The Dryland page should therefore treat saved sessions as the main library and Micro Sessions as a small daily plan derived from that library, not as the primary saved workout.

The Micro Session surface should expand when there is something to do today and collapse when the week is complete, empty, stale, or blocked. Users need an explicit `Clear micro session` action so stale or completed plans can be removed from the active weekly surface without deleting saved Dryland Sessions.

When a saved Dryland Session is edited and that session is already used by the active Micro Session, the user must be told what will happen. Default behavior should be safe: saved-session edits apply to future Micro Sessions. A deliberate `Update current micro session` action may rebuild remaining queued units, but must preserve completed/skipped history and never rewrite what the user has already done.

Quick session building should stay compact. Exercises should render as rows inside one container, with per-exercise notes hidden from the default quick path. Notes can be session-level or behind a deliberate advanced/more affordance.

Micro Session execution should not make `Skip set` a default action. If a user does not do a unit, it can remain open; if the whole plan is stale, wrong, or no longer relevant, the user should clear the Micro Session at plan level. Existing skipped history must still remain readable and must not be rewritten by current-plan updates.

Set completion affordances must distinguish action from status. A ready unit should not look completed before the user acts; use a neutral `Done` action for open units and reserve green/check treatment for completed history or successful completion feedback.

`Bubbles` mode should be a direct task-selection surface. Bubbles show only the remaining task by default. First tap/click or `Enter` arms the bubble in place with `Mark done?`; the next tap/click or `Enter` confirms completion, while `Escape` cancels. Double-click/double-tap completes through the same two-step path as a power-user shortcut. Completion removes the bubble from available units, records completion, and adds the action to a stable undo stack so repeated `Undo` clicks restore units in reverse completion order.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Business logic correctness and data integrity
- Accessibility (a11y)
- Reliability and failure handling
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                     | Evidence                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Dryland Sessions remain the main saved-session library; Micro Sessions are presented as a compact daily plan with clear active/completed/empty states.                 | screenshot handoff + IA review           | `5/5`                   |
| UX flow clarity                               | `target`     | Users can clear stale/completed Micro Sessions, understand source-session edit impact, and build quick sessions without vertical card sprawl.                          | component tests + Playwright smoke       | `5/5`                   |
| Visual design quality                         | `target`     | Quick-session exercises fit as compact rows in one container on desktop/mobile; Micro Session complete/empty states collapse without hiding primary saved sessions.    | screenshot handoff                       | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Clearing a Micro Session never deletes saved Dryland Sessions; updating current Micro Session preserves completed/skipped units and only rebuilds queued units.        | domain/API/component tests               | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this is an authenticated user Dryland builder/library workflow and does not change admin editor surfaces.                                                  | explicit scope rationale                 | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Collapse/expand, clear confirmation, source-impact warning, row actions, and update-current controls remain keyboard and screen-reader usable.                         | semantic assertions + e2e/a11y smoke     | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no new dependency, polling, or broad data fetch may be added; page payload should not increase materially.                                            | dependency/query diff + perf budget gate | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Saved sessions remain server-canonical; Micro Session active/clear/update facts remain server-canonical; UI expansion state stays local-only.                          | data-boundary review + tests             | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: authenticated route remains dynamic and mutation responses update client state deterministically.                                                     | route/cache review                       | `4/5`                   |
| Reliability and failure handling              | `target`     | Empty source lists, stale active plans, failed clear/update-current mutations, and completed weeks recover with explicit actions and non-destructive fallback.         | negative-path tests                      | `5/5`                   |
| Security and authz                            | `target`     | Clear/update-current mutations are owner-scoped, fail closed, and reject invalid plan/session ids without leaking cross-user state.                                    | API negative tests                       | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no new personal data category, analytics payload, notification token, or third-party sharing is introduced.                                           | privacy/no-event review                  | `4/5`                   |
| Content governance                            | `target`     | Labels such as `Clear micro session`, `Update current micro session`, `Use from next micro session`, and `Saved Dryland Sessions` are swept across docs/tests/support. | route/label/support sweep                | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, moderation, operator CRUD, or admin content editability surface changes.                                                                | explicit scope rationale                 | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because Dryland builder routes are authenticated/private and no public metadata, sitemap, robots, or crawl behavior changes.                                       | explicit scope rationale                 | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable page or structured public entity data is introduced.                                                                             | explicit scope rationale                 | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no new analytics taxonomy is required; if events are added, they must use existing no-PII event rules.                                                | no-event review or event contract        | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no pricing, checkout, entitlement, subscription, refund, payout, or revenue reporting behavior.                                         | explicit commerce scope rationale        | `N/A`                   |
| Incident response and support operations      | `target`     | Support can explain how to clear stale Micro Sessions and how saved-session edits affect active vs future Micro Sessions.                                              | runbook update + support sweep           | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no invoice, payout, refund, entitlement, subscription, or finance reporting data changes.                                                                  | explicit finance scope rationale         | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: new copy remains short, explicit, and structurally localizable; no locale routing or translation workflow ships.                                      | copy review                              | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Dryland React components, micro-plan helpers, owner-scoped APIs, and Tailwind primitives; add no dependency.                                            | dependency diff + code review            | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit/domain/API/e2e tests cover clear lifecycle, source-impact warning/update, compact quick rows, and preserved completed/skipped history.                            | targeted tests + verify gates            | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no extra list fetch, polling, or unbounded client-side state is introduced.                                                                           | query review                             | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback by revert restores previous UI/API behavior; any migration, if needed for clear lifecycle, must be backward-compatible and non-destructive.                   | migration/no-migration review + gates    | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `DrylandBuilderHub`, `DrylandMicroPlanPanel`, and `DrylandSessionEditor`,
  - keep authenticated Dryland data server-loaded,
  - keep collapse/expand and confirmation UI client-local until mutation confirmation.
- TypeScript/domain contracts:
  - add explicit lifecycle contract for clear/reset if existing `active`/`paused`/`completed` status is insufficient,
  - preserve `mergeDrylandMicroBlocksForPlanEdit` semantics for completed/skipped history,
  - distinguish saved-session edits for future Micro Sessions from explicit current-plan rebuilds.
- Supabase/data layer:
  - prefer no migration if clear can be represented safely with existing plan/block fields,
  - if a clear/archive field is required, ship migration + RLS + generated type update in the same slice.
- UI system:
  - saved sessions are the main library list,
  - Micro Session is a compact daily plan panel that expands only when actionable,
  - quick-session exercises render as rows inside one container, not separate cards.
- Testing:
  - cover domain/API negative paths for owner scoping and invalid ids,
  - cover UI paths for completed week, empty saved sessions, clear confirm/cancel, source-impact warning, and compact quick rows.

## Data Placement And Sync Contract

- Server-canonical:
  - saved Dryland Sessions,
  - active Micro Session plan, source ids, blocks, completed/skipped/released timestamps,
  - any clear/archive status required to hide a plan from the active weekly surface.
- Local-only:
  - Micro Session panel collapsed/expanded presentation,
  - clear confirmation open state,
  - temporary row edit state before saved-session save,
  - source-impact choice before mutation.
- Sync policy:
  - `Clear micro session` updates only the active Micro Session surface; it never deletes saved Dryland Sessions,
  - saved-session edits apply to future Micro Sessions by default,
  - `Update current micro session` rebuilds only remaining queued units from the current saved-session draft and preserves completed/skipped units as history.
- Conflict policy:
  - if source sessions are missing, show a recoverable empty/stale state with `Clear micro session`,
  - stale or invalid plan/session ids fail closed through the owner-scoped API.
- Retention and sensitivity:
  - completed/skipped Micro Session history remains available for history/support unless product explicitly decides otherwise in implementation.
- Cache/invalidation:
  - mutation response must update client state deterministically; authenticated route remains dynamic.

## Identity And Rename Contract

- Canonical stable IDs:
  - saved dryland session ids remain source identity,
  - micro plan id remains the active weekly plan identity,
  - micro unit ids remain execution/history identity.
- Human-readable identifiers:
  - saved-session title and micro-plan title are display labels and can be renamed.
- Mutability rules:
  - saved sessions are renameable and editable,
  - completed/skipped micro units are immutable history except explicit undo actions already supported by the Micro Session surface,
  - queued units can be regenerated only through explicit current-plan update.
- Rename vs repurpose policy:
  - changing an exercise list substantially should either create a new saved session or explicitly update current queued micro units; do not silently repurpose completed history.
- Compatibility contract:
  - existing active/completed/manual micro plans remain readable,
  - old plans without new lifecycle fields, if any are introduced, receive safe default behavior.

## Scope

- Make saved Dryland Sessions the main library affordance on `/my-library/dryland`.
- Collapse Micro Session when week is complete, empty, stale, or source sessions are missing.
- Keep Micro Session expanded when ready units are available today.
- Add `Clear micro session` with confirmation and server-confirmed mutation.
- Add empty/stale-state recovery when active Micro Session has no available source sessions.
- Add source-impact warning in saved-session editor when the session is included in the active Micro Session.
- Default saved-session edits to future Micro Sessions.
- Add explicit `Update current micro session` behavior for remaining queued units only, preserving completed/skipped history.
- Convert quick-session exercise authoring into compact rows inside one container.
- Remove per-exercise `Notes` from default quick rows; retain session-level notes or advanced/more notes only if needed.
- Remove or tone down default per-unit `Skip set`; leave unfinished units open and use `Clear micro session` when the plan is no longer relevant.
- Use neutral `Done` action semantics for open units and reserve green/check treatment for completed state or successful completion feedback.
- Make `Bubbles` a direct remaining-task surface with in-bubble `Mark done?` confirmation, keyboard cancel/confirm, immediate stacked undo, no default `Skip set`, and no persistent detail card in the default view.
- Update tests, support docs, and user-flow docs.

## Out Of Scope

- Full training calendar/history redesign.
- Subscription gating for Dryland or Micro Sessions.
- Automatic week rollover beyond the clear/empty-state recovery required here.
- Analytics taxonomy expansion unless needed for existing product KPIs.
- Public SEO or marketing page changes.

## Acceptance Criteria

1. `/my-library/dryland` clearly treats saved Dryland Sessions as the main library and Micro Sessions as daily mini execution.
2. Completed, empty, stale, or source-missing Micro Sessions collapse to a compact state with recovery actions.
3. `Clear micro session` removes the active Micro Session from the active weekly surface without deleting saved Dryland Sessions.
4. Clearing or update-current failures show recoverable errors and keep the previous plan state visible.
5. Editing a saved Dryland Session used by the active Micro Session shows a source-impact warning.
6. Saved-session edits apply to future Micro Sessions by default.
7. `Update current micro session` only rebuilds queued units and preserves completed/skipped units as history.
8. Quick session builder uses compact rows inside one container and removes per-exercise notes from the default row.
9. Default execution UI does not present `Skip set` as a primary per-unit action; unfinished units remain available until completed or the plan is cleared.
10. Open units use neutral `Done` actions, while green check treatment is reserved for completed state/feedback.
11. Bubbles mode shows remaining tasks directly, supports accessible in-bubble confirmation without relying only on double-click/double-tap, removes completed bubbles from available units, and provides a stable LIFO undo stack.
12. Mobile and desktop screenshots show no text overlap, card sprawl, or competing primary tasks.
13. Support docs explain clearing stale Micro Sessions and source-session edit impact.

## Validation

- `npm run lint:briefs`
- targeted Vitest for Dryland micro-plan lifecycle, builder hub, micro-plan panel, and session editor
- targeted API tests for clear/update-current owner scoping and invalid ids
- targeted Playwright for `/my-library/dryland` completed/empty/active states and Bubbles completion/undo semantics when local auth is available
- screenshot handoff before `npm run verify:pre-pr`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Quality Gate Evidence

- API/server failure-mode evidence: clear/update-current mutations must return typed recoverable errors instead of unexpected 500 responses; targeted route tests cover owner-scoped success, invalid ids, and preserved blocks so failures keep the prior visible plan state.
- Route/label/support sweep evidence: identifiers searched include `Dryland Sessions`, `Saved Dryland Sessions`, `Micro Sessions`, `Weekly micro plan`, `Clear micro session`, `Update current micro session`, `Use from next micro session`, `Week complete`, `No dryland sessions yet`, `Quick session`, `Notes`, `Skip set`, `Done`, `Bubbles`, `Undo`, and `/my-library/dryland`. Surfaces checked include `app/`, `components/`, `tests/`, `docs/`, `docs/runbooks/`, active/planned/done task briefs, and Help/Guide assertions where relevant; fallout handled in product UI, tests, API contracts, support runbook, user-flow map, and data-access registry.
- UI reference surface evidence: reference surface is the existing My Library Dryland saved-session card/list and Micro Session panel, with `DrylandSessionEditor` and `DrylandMicroPlanPanel` kept as the shared component surfaces. The patch adapts source-impact and execution state into those shared components instead of creating a separate workflow surface; direct reuse exception is limited to local Bubbles interaction state because it is transient execution UI.

## Manual QA Environments

- Local: `http://127.0.0.1:3000/my-library/dryland`
- Screenshot handoff:
  - `after/reference` for saved-session library vs compact Micro Session panel,
  - `after` quick-session compact rows desktop/mobile,
  - `after` Bubbles remaining-task completion/undo desktop/mobile,
  - `after` source-impact warning in saved-session editor.

## Help / Guide Impact

Required: update `docs/runbooks/auth-account-support.md` and `docs/user-flow-map.md` for:

- `Clear micro session`,
- saved-session edits applying to future Micro Sessions by default,
- explicit `Update current micro session`,
- default removal/toning down of per-unit `Skip set`,
- Bubbles completion and undo behavior,
- compact quick-session rows and removed default per-exercise notes.

## Route / Label / Support Surface Sweep

Run targeted sweep for `Dryland Sessions`, `Saved Dryland Sessions`, `Micro Sessions`, `Weekly micro plan`, `Clear micro session`, `Update current micro session`, `Use from next micro session`, `Week complete`, `No dryland sessions yet`, `Quick session`, `Notes`, `Skip set`, `Done`, `Bubbles`, `Undo`, `/my-library/dryland`, and support docs before broad verification.

## Checkpoint Log

- `2026-05-11 | planned | owner identified follow-up UX/lifecycle findings while reviewing the My Library/Dryland IA cleanup: saved sessions can be long main workouts while Micro Sessions are short daily work, quick-session exercises should be compact rows, stale/completed micro plans need clear-to-empty recovery, and source-session edits need explicit current-vs-future impact handling | next: implement in a fresh branch after the current approved IA cleanup PR lands`
- `2026-05-11 | in-progress | branch dryland-builder-lifecycle-source-impact-2026-05-11 created from clean main a3e402a after PR #676 and closeout PR #677 landed; owner added execution UX decisions: remove/soften default per-unit skip, make ready units use neutral Done action semantics, and make Bubbles a direct remaining-task surface with accessible completion plus undo | next: inspect domain/API/UI surfaces, implement scoped lifecycle and UI changes, then run targeted validation and screenshot handoff before PR gates`
- `2026-05-11 | screenshot-ready | implemented non-destructive clear via existing completed plan status, active loader now shows only active/paused plans, saved-session editor warns when the session feeds the active Micro Session, explicit current-plan source rebuild reuses owner-scoped PATCH and preserves completed/skipped history, default per-unit skip is removed from execution UI, Bubbles uses in-bubble Mark done? confirmation with keyboard cancel/confirm and stable stacked undo, and quick-session exercises render as compact rows with per-exercise notes behind individual set edits | validation: targeted Vitest 4 files/41 tests PASS, focused panel Vitest 14 tests PASS after final duplicate-action cleanup, npm run typecheck PASS, npm run lint PASS, npm run lint:briefs:all PASS, git diff --check PASS, targeted Playwright Dryland spec exit 0 with 1 known local dev-login skip | screenshots: output/playwright/dryland-lifecycle-source-impact-2026-05-11-135004 | next: refresh targeted validation and screenshot handoff before npm run verify:pre-pr`
- `2026-05-11 | screenshot-ready-refresh | owner requested final Bubbles contract before PR gates: default bubbles show only task content, first tap/click or Enter arms Mark done? in place, second confirms completion, Escape cancels, completed bubbles leave the open board, and global Undo uses LIFO stack count such as Undo · 2 | validation: focused panel Vitest 15 tests PASS, targeted Vitest 4 files/42 tests PASS, npm run typecheck PASS, npm run lint PASS, npm run lint:briefs:all PASS, git diff --check PASS | screenshots: output/playwright/dryland-bubbles-undo-2026-05-11-140839 | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-05-11 | pre-pr-ready | owner approved screenshot handoff; npm run verify:pre-pr PASS on full lane with quality-gate, lint, typecheck, 189 unit files/1032 tests, build, perf budgets, and Playwright E2E 82 passed/380 skipped; perf trend reported 5 consecutive weekly green runs and recommended tightening one stretch target, decision recorded for PR summary as follow-up outside this UI lifecycle slice | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
