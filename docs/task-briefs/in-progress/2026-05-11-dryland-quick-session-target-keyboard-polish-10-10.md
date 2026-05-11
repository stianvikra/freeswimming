# Task Brief: Dryland Quick Session Target And Keyboard Polish (10/10)

## Metadata

- `id`: `2026-05-11-dryland-quick-session-target-keyboard-polish-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-11`
- `updated`: `2026-05-11`

## Goal

Make Dryland quick-session authoring faster and clearer by removing repeated desktop headings, collapsing secondary session metadata, adding exercise-level `Reps`/`Time` targeting, preserving normal keyboard navigation, and placing add/save/train actions where the user finishes editing.

## Product Decision

Quick session rows are an authoring table on desktop and stacked field groups on mobile. Desktop should use one shared header row so repeated labels do not distract from the exercise list. Mobile keeps visible per-field labels because rows stack vertically.

Dryland strength sessions must support both repetition-based and time-based targets per exercise and per set. Exercises such as `Plank`, `Wall Sit`, and `Hollow Hold` should default to `Time`, while normal strength movements default to `Reps`. The user can always override the target type.

Keyboard behavior must stay accessible. `Tab` keeps normal focus order from `Load kg` to `Edit sets` to `Remove`. `Enter` in the last row's `Load kg` field creates a new row at the bottom and focuses the new exercise name. `Enter`/`Space` on buttons activates the button through native semantics.

`Add exercise` belongs below the list once rows exist, because new rows are appended to the bottom. `Save session` should be shortened to `Save`, and bottom actions should expose `Save` plus `Open Train mode` so long lists do not force the user to scroll back to the header.

`Build session` is renamed to `Session details` and is collapsed by default after a session exists. The session title remains visible in the top header, so the collapsed details row must not repeat it. Build mode owns only authoring metadata (`Title` and `Description`); timing belongs to Train mode because `Start`, elapsed time, completion, and actual duration describe execution, not session construction.

Unsaved quick-session edits should survive leaving and returning to the same dryland session. This is a browser-only recovery draft, keyed by dryland session id and saved-session `updatedAt`; the server remains canonical and the local draft is cleared on successful `Save` or `Reset`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                                                                                             | Evidence                                              | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Quick session authoring clearly reads as one editable sequence; add/save/train actions appear where users finish editing.                                                                                                                                                      | screenshot handoff + owner review                     | `5/5`                   |
| UX flow clarity                               | `target`     | Users can choose `Reps` or `Time` through the target field unit button, add rows with `Enter`, tab through actions predictably, edit details intentionally, and save/train from the bottom of long lists. Build mode has no timing controls; Train mode owns execution timing. | component tests + screenshot handoff                  | `5/5`                   |
| Visual design quality                         | `target`     | Desktop uses one header row with no repeated headings; `Session details` is collapsed without repeating the title or showing timing noise; mobile keeps readable field labels; buttons fit without overlap at supported widths.                                                | desktop/mobile screenshots                            | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Strength dryland sets persist either reps or duration seconds deterministically; legacy reps-only sessions remain valid.                                                                                                                                                       | shared/domain tests + builder tests                   | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes authenticated user dryland authoring, not admin editor surfaces.                                                                                                                                                                                      | explicit scope rationale                              | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Inputs have unique accessible names, target unit buttons expose the next switch action, `Tab` order remains native, and `Enter` row-add does not trap focus.                                                                                                                   | Testing Library assertions + Playwright/screenshot QA | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no new dependency, route fetch, polling, or heavy client state may be introduced.                                                                                                                                                                             | dependency diff + verify gate                         | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Saved dryland session draft remains server-canonical; target-type selection is represented inside existing set JSON; browser draft is recovery-only and cleared on save.                                                                                                       | data-boundary review + tests                          | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: authenticated dryland route remains dynamic and save responses continue to update client state deterministically.                                                                                                                                             | route/cache review                                    | `4/5`                   |
| Reliability and failure handling              | `target`     | Invalid target inputs block save/train with a useful message; row add/focus works even on long lists and does not drop existing rows.                                                                                                                                          | component negative-path tests                         | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no new protected route, auth boundary, token, or cross-user mutation is introduced; existing save route validation remains fail-closed.                                                                                                                       | no-new-route review + route tests where affected      | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no new personal data category, analytics payload, log payload, or third-party sharing is introduced.                                                                                                                                                          | privacy/no-event review                               | `4/5`                   |
| Content governance                            | `target`     | Changed labels (`Save`, `Edit sets`, `Target`, `Time`, `Reps`, quick-session helper copy) are swept across tests/docs/support surfaces.                                                                                                                                        | route/label/support sweep                             | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, moderation, operator CRUD, or admin content editability surface changes.                                                                                                                                                                        | explicit scope rationale                              | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/dryland` is authenticated/private and no public metadata, sitemap, robots, or crawl behavior changes.                                                                                                                                                 | explicit scope rationale                              | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable page or structured public entity data is introduced.                                                                                                                                                                                     | explicit scope rationale                              | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no new analytics taxonomy is required; if events are discovered, they must remain no-PII and use existing event rules.                                                                                                                                        | no-event review                                       | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no pricing, checkout, entitlement, subscription, refund, payout, or revenue reporting behavior.                                                                                                                                                 | explicit commerce scope rationale                     | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: support docs may mention time targets if existing dryland workflow docs become stale; no incident response process changes.                                                                                                                                   | support sweep or explicit no-update rationale         | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no invoice, payout, refund, entitlement, subscription, or finance reporting data changes.                                                                                                                                                                          | explicit finance scope rationale                      | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: new copy remains short and localizable; no locale routing or translation workflow ships.                                                                                                                                                                      | copy review                                           | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `DrylandSessionEditor`, existing dryland draft JSON, shared dryland domain helpers, Tailwind tokens, and current tests; add no dependency.                                                                                                                               | dependency diff + code review                         | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit/component/domain/e2e tests cover target type, keyboard add row, label changes, and micro-unit duration propagation.                                                                                                                                                       | targeted tests + verify gates                         | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no additional backend reads, polling, unbounded timers, or new storage tables are introduced.                                                                                                                                                                 | query/runtime review                                  | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback by revert restores prior authoring UI and reps-only strength normalization without data migration rollback.                                                                                                                                                           | no-migration review + gates                           | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `DrylandSessionEditor` as the single quick-session authoring surface,
  - keep authenticated data load/save boundaries unchanged,
  - keep row focus and target-type UI state inside the client editor.
- TypeScript/domain contracts:
  - use the existing `DrylandSetDraft` shape where `reps` and `holdSeconds` already exist,
  - normalize strength sets as either reps-based or time-based,
  - preserve legacy reps-only drafts as valid.
- Supabase/data layer:
  - no migration expected; the persisted `exercises` JSON already stores both `reps` and `holdSeconds`,
  - owner-scoped save route behavior remains unchanged.
- UI system:
  - desktop quick session is a table-like row editor with one header row,
  - mobile uses stacked labels and stable action rows,
  - screenshot handoff uses explicit `after-*` artifacts for the changed quick-session surface.
- Testing:
  - update dryland builder component tests, dryland shared/domain tests, micro-plan tests, and focused E2E assertions.

## Data Placement And Sync Contract

- Server-canonical:
  - saved Dryland Session draft JSON, including per-set `reps` or `holdSeconds`.
- Local-only:
  - transient input strings, focus-after-add intent, open per-set editor state, target toggles before save, and a browser recovery draft keyed by session id + saved `updatedAt`.
- Sync policy:
  - saving persists the normalized draft through the existing dryland save route,
  - legacy strength sets with `reps` remain reps-based,
  - new strength time sets persist as `holdSeconds` with `reps: null`.
  - browser recovery draft is restored only for the same saved `updatedAt` and cleared when `Save` succeeds or `Reset` is used.
- Conflict policy:
  - invalid target values block save/train locally and remain visible for correction.
- Retention and sensitivity:
  - no new sensitive data category or retention behavior.
- Cache/invalidation:
  - no route cache behavior changes; mutation response remains the client refresh boundary.

## Identity And Rename Contract

- Canonical stable IDs:
  - saved dryland session IDs, exercise IDs, and set IDs remain unchanged.
- Human-readable identifiers:
  - exercise titles remain editable display labels and may auto-suggest target type only while authoring.
- Mutability rules:
  - target type and value are editable until saved; completed-set history remains tied to set IDs.
- Rename vs repurpose policy:
  - renaming an exercise may suggest time targeting for known static exercises but never changes session identity.
- Compatibility contract:
  - old reps-only strength sessions and old stretching sessions remain readable.

## Scope

- Quick session helper copy.
- Desktop quick-session header row and mobile label behavior.
- `Target` column with `Reps`/`Time` target selection and value.
- Auto-suggest `Time` for static exercise names such as `Plank`, `Wall Sit`, and `Hollow Hold`.
- Per-set editor target type/value support.
- `Tab` and `Enter` keyboard behavior for row actions and bottom row creation.
- Move `Add exercise` below the list and append new rows at the bottom with focus.
- Rename dryland `Save session` action to `Save`.
- Add bottom `Save` + `Open Train mode` actions.
- Rename `Build session` to `Session details`, collapse it by default, and avoid repeating the title in the collapsed row.
- Remove execution timing controls from Build/Session details; `Start`, stop/clear timing, and actual duration remain Train-mode concerns.
- Persist unsaved quick-session edits in browser storage so leaving and returning to the same saved session restores progress until `Save` or `Reset`.
- Update tests/docs touched by changed labels and target semantics.

## Out Of Scope

- New dryland database tables or migrations.
- Full exercise bank taxonomy redesign.
- Analytics taxonomy expansion.
- Public SEO/metadata changes.
- Changing the swim workout builder `Save session` label.

## Acceptance Criteria

1. Desktop quick session shows a single header row for `Exercise`, `Sets`, `Target`, `Rest sec`, `Load kg`, and `Actions`.
2. Mobile quick session keeps readable per-field labels.
3. Helper copy reads `Manually enter the exercises and their details.`
4. Strength quick-session rows support `Reps` and `Time`; time targets save as seconds and feed Train/Micro Session/Bubbles labels.
5. Typing a known static exercise name such as `Plank` defaults that row to `Time`.
6. Per-set editing supports reps/time target choice for strength exercises.
7. `Tab` from `Load kg` proceeds to `Edit sets`, then `Remove`; `Enter`/`Space` activates buttons natively.
8. `Enter` in `Load kg` on the last row adds a row at the bottom and focuses the new exercise input.
9. `Add exercise` is placed below the list and appends/focuses the new bottom row.
10. Dryland editor actions use `Save`, plus bottom `Save` and `Open Train mode` actions for long lists.
11. Build metadata appears under a collapsed `Session details` panel by default; the collapsed panel does not repeat the session title already shown in the top header.
12. Build `Session details` contains only title and description; timing summary, manual duration input, and `Start` are not available in Build mode.
13. Unsaved quick-session edits are restored from browser storage after navigating away and back to the same saved session, then cleared on successful `Save` or `Reset`.
14. No text overlap or action overflow on desktop/mobile screenshots.

## Validation

- `./node_modules/.bin/vitest run tests/unit/dryland-builder-hub.test.tsx tests/unit/dryland-micro-plans.test.ts tests/unit/dryland-routes.test.ts tests/unit/dryland-micro-plan-routes.test.ts tests/unit/dryland-manual.test.ts` - pass after `Session details` collapse (`5` files, `40` tests)
- `./node_modules/.bin/vitest run tests/unit/dryland-builder-hub.test.tsx tests/unit/dryland-micro-plans.test.ts` - pass after removing Build-mode timing controls (`2` files, `22` tests)
- `npm run typecheck` - pass
- `npm run lint` - pass
- `npm run lint:briefs:all` - pass
- `npx playwright test tests/e2e/my-library-dryland-builder.spec.ts --project=desktop-chromium` - exit `0`; test skipped because existing local dev-login Supabase response returned HTML instead of JSON
- Screenshot handoff after removing Build-mode timing controls: `output/playwright/dryland-quick-session-polish-2026-05-11-203757`; owner approved the refreshed handoff.
- `npm run verify:pre-pr` - pass full lane after final Build-mode timing removal and owner screenshot approval (`artifacts/test-runs/20260511-205327/verify.log`).
- `npm run verify:pre-merge` - previous pass before final Build-mode timing removal; rerun required after PR is updated.

## Quality Gate Evidence

- UI reference surface evidence: changed surface is the existing `DrylandSessionEditor` quick-session row editor introduced in the dryland lifecycle workstream; this patch refines that same component instead of creating a parallel authoring surface.
- Validation/invariant contract: a dryland strength set is valid when exactly one primary target is present (`reps > 0` or `holdSeconds > 0`), and micro-plan target building uses the normalized set field to display `reps` or `sec`. Browser recovery drafts are accepted only when the saved-session `updatedAt` matches.
- Route/label/support sweep evidence: identifiers searched include `Quick session`, `Type the exercises you want to do now.`, `Manually enter the exercises and their details.`, `Save session`, `Save`, `Edit sets individually`, `Edit sets`, `Reps`, `Time`, `Target`, `Load kg`, `Open Train mode`, `Session details`, `Timing`, `Duration (min)`, `Start`, and `/my-library/dryland`; surfaces checked include `app/`, `components/`, `tests/`, `docs/`, `docs/runbooks/`, active task briefs, and relevant support docs; fallout handled by updating the dryland auth/support runbook and leaving swim workout `Save session` labels intentionally unchanged because they are out of scope.
- Accessibility evidence: tests must assert unique accessible names for target unit controls and row action buttons; screenshot/manual QA must confirm keyboard-visible focus and no focus trap.
- No-new-route/security evidence: this slice changes no API route or auth boundary; existing owner-scoped save route validation is reused.
- Owner screenshot approval evidence: owner screenshot approval received on `2026-05-11 16:46` for `output/playwright/dryland-quick-session-polish-2026-05-11-163847`, then superseded by the final Build-mode timing cleanup. Refreshed screenshot review was approved for `output/playwright/dryland-quick-session-polish-2026-05-11-203757`; `npm run verify:pre-pr` then passed full lane.
- Performance budget ratchet decision: `npm run verify:pre-pr` reported `5` consecutive weekly green runs and recommended tightening one stretch target; decision for this scoped dryland UI PR is `hold`, because the patch does not change perf budgets and the ratchet should happen in a dedicated governance/performance PR.

## Manual QA Environments

- Local: `http://127.0.0.1:3000/my-library/dryland`
- Screenshot handoff:
  - `reference-quick-session-desktop.png` and `reference-session-details-expanded-desktop.png` for the previously approved Build-mode timing state,
  - `after-quick-session-desktop.png` for one desktop header row, compact target unit controls, bottom actions,
  - `after-session-details-expanded-desktop.png` for the intentionally expanded title/description panel with timing removed from Build mode,
  - `after-set-editor-desktop.png` for row-owned `Plank details`, `Plank notes`, and per-set `Reps`/`Time` editing,
  - `after-quick-session-mobile.png` for stacked mobile rows.
- Capture note: screenshots were captured against the authenticated dryland route using unsaved client-side edits only; global fixed SiteChrome and Next dev overlay were hidden in artifacts so they do not cover the Dryland editor surface.

## Help / Guide Impact

Run support/doc sweep. Update relevant support docs only if existing text claims strength dryland targets are reps-only or references the old dryland `Save session`/`Edit sets individually` labels.

## Route / Label / Support Surface Sweep

Run targeted sweep for `Quick session`, `Type the exercises you want to do now.`, `Manually enter the exercises and their details.`, `Save session`, `Save`, `Edit sets individually`, `Edit sets`, `Reps`, `Time`, `Target`, `Load kg`, `Open Train mode`, `Session details`, `Timing`, `Duration (min)`, `Start`, and `/my-library/dryland` before broad verification.

## Checkpoint Log

- `2026-05-11 | in-progress | branch dryland-quick-session-target-keyboard-polish-2026-05-11 created from clean main 7cae59e after PR #678 and closeout PR #679 landed; owner reviewed quick-session authoring and requested one desktop header row, new helper copy, normal Tab order, Enter-to-add-row, time targets for Plank/static exercises, bottom Add/Save/Train actions, and shorter Save copy | next: implement scoped editor/domain/tests and capture screenshot handoff before PR gates`
- `2026-05-11 | working tree | implemented quick-session desktop header row, neutral in-field reps/sec unit controls, static-exercise time defaults, per-set time/reps editing, bottom Add/Save/Open Train actions, browser recovery draft, label/support updates, and domain normalization for strength duration targets; validation passed with targeted dryland Vitest, typecheck, ESLint, all-brief lint, and local dryland Playwright exit 0 with known dev-login skip; screenshots refreshed at output/playwright/dryland-quick-session-polish-2026-05-11-160757 after owner rejected the blue segmented target toggle as too dominant | next: owner screenshot review before npm run verify:pre-pr`
- `2026-05-11 | working tree | owner flagged the open set editor as visually detached from the exercise row; replaced the ambiguous global-looking Individual sets section with row-owned exercise details copy and hierarchy (Plank details, Plank notes, Plank sets), demoted nested actions, and refreshed screenshots at output/playwright/dryland-quick-session-polish-2026-05-11-161909 | next: owner screenshot review before npm run verify:pre-pr`
- `2026-05-11 | working tree | owner requested no duplicate title in build details; renamed Build session to a collapsed-by-default Session details panel, removed repeated session type from that row, kept the session title only in the top header unless details are intentionally expanded, updated DOM tests for explicit details editing, and refreshed screenshots at output/playwright/dryland-quick-session-polish-2026-05-11-163847 | next: owner screenshot review before npm run verify:pre-pr`
- `2026-05-11 16:46 | working tree | owner approved screenshot handoff at output/playwright/dryland-quick-session-polish-2026-05-11-163847 | next: run npm run verify:pre-pr, commit, push, and open PR`
- `2026-05-11 | working tree | npm run verify:pre-pr passed full lane at artifacts/test-runs/20260511-164747/verify.log; perf budget ratchet recommendation recorded as hold for this scoped UI PR | next: commit, push, and open PR`
- `2026-05-11 20:37 | working tree | owner flagged Build-mode timing as unclear; removed Timing summary/card, manual Duration input, and Start/Stop/Clear controls from Build/Session details so Train mode owns execution timing; updated unit/e2e assertions, refreshed screenshot artifacts at output/playwright/dryland-quick-session-polish-2026-05-11-203757, passed targeted Vitest, lint, typecheck, and brief lint, received owner screenshot approval, and passed npm run verify:pre-pr full lane at artifacts/test-runs/20260511-205327/verify.log | next: commit, push, update PR, monitor CI, and rerun npm run verify:pre-merge`
