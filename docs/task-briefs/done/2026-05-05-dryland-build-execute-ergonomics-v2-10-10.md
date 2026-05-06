# Task Brief: Dryland Training Product Surface Redesign V3 (10/10)

## Metadata

- `id`: `2026-05-05-dryland-build-execute-ergonomics-v2-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-05`
- `updated`: `2026-05-06`

## Goal

Redesign the existing dryland builder into a credible training-product surface for owner QA: `Train` behaves like a workout player, `Build` behaves like a compact session composer, destructive and creation actions are no longer primary clutter, and save/recovery states remain explicit without expanding into dryland history, programs, AI, or media CMS work.

## Product Phase

- Launch phase: private pre-test-user product build.
- Optimize for owner QA, real personal use during app development, deterministic failure handling, and future pilot readiness.
- Do not optimize this slice for public growth, SEO, broad onboarding, or scaled support operations.

## Current-State Findings

- The dryland foundation is already real product code, not only a placeholder:
  - persisted `dryland_sessions` table with RLS,
  - authenticated `/my-library/dryland` browse route,
  - authenticated `/my-library/dryland/[sessionId]` focused builder route,
  - create/save/delete APIs,
  - manual `strength` and `stretching` sessions,
  - code-owned exercise bank plus custom exercises,
  - timing and per-set completion controls,
  - focused unit and desktop Chromium e2e coverage.
- The foundation brief is done:
  - `docs/task-briefs/done/2026-03-29-dryland-builder-foundation-strength-and-stretching-10-10.md`
- The main gap against that brief is the session-kind mutability contract:
  - current UI allows changing `strength` / `stretching` inside an existing session,
  - incompatible existing sets are not converted safely,
  - V2 should lock session kind after creation and direct meaningful kind changes to a new session unless a small, tested conversion flow is explicitly chosen.
- V2 should build on the existing foundation rather than replacing the dryland domain model.

## Dependencies And Boundaries

- Reference foundation:
  - `docs/task-briefs/done/2026-03-29-dryland-builder-foundation-strength-and-stretching-10-10.md`
- Mature reference surfaces:
  - primary: current dryland builder and dryland route structure,
  - secondary: current swim-session builder action hierarchy and saved-state feedback patterns,
  - do not force dryland exercises into swim-session step renderers because the domain model differs.
- Related architecture:
  - `docs/architecture/data-access-authz-cache-contract-registry.md`
  - `docs/user-flow-map.md`
- Visual work:
  - screenshot handoff is required before `verify:pre-pr`,
  - owner approval or corrections are required before PR creation or merge-readiness handoff.
- Visual correction gate:
  - first screenshot handoff failed because the focused builder still rendered frame-in-frame set editors,
  - V2 must now split the surface into explicit `Build` and `Train` modes before PR gates,
  - the set editor must avoid nested per-set cards and use a compact table/row pattern on desktop plus a readable single-row mobile stack,
  - the live `Train` mode must be the default owner QA surface and keep next-set/progress/save state visible without exposing the full edit form.
- V3 redesign gate:
  - do not PR-gate the intermediate V2 screenshots as `10/10`,
  - focused dryland must be redesigned around a workout-player mental model, not a dashboard/editor page,
  - `Build` must be a composer with compact plan rows and one-open-exercise editing, not a long unstructured form,
  - focused route top actions must hide destructive actions behind secondary disclosure and avoid showing unrelated create buttons during an active session,
  - screenshots must be regenerated after this redesign and owner-approved before `verify:pre-pr`.
- Foundation shell quality gate:
  - this slice may claim `10/10` only as a private dryland product-surface foundation shell, not as full market parity with mature strength/mobility apps,
  - content depth, video library, adaptive programming, progression charts, PR history, mobility tests, and guided protocols remain out of scope,
  - the shell must still expose stable placeholders for those future content surfaces so later content work does not require another UI rebuild.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- UX flow clarity
- Visual design quality
- Accessibility (a11y)
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                         | Evidence                                                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | Dryland browse/build/execute surfaces have distinct purposes; create/open/build/execute/save paths are scannable without mixing swim-session mental models into dryland.                   | route review + screenshot handoff + e2e route flow                       | `5/5`                   |
| UX flow clarity                               | `target`     | Owner can build and execute one dryland session with obvious next action, no dead-end state, and clear local-vs-saved feedback across create, edit, timing, set completion, save, reset.   | unit/component tests + Playwright flow + manual QA notes                 | `5/5`                   |
| Visual design quality                         | `target`     | Changed dryland UI matches My Library visual language, uses stable responsive dimensions, avoids nested-card clutter, and keeps controls readable on desktop and mobile.                   | before/after screenshot handoff on desktop and mobile                    | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Session kind cannot silently corrupt incompatible set fields; strength sets preserve reps/load/rest; stretching sets preserve hold/rest; save/delete/update target canonical IDs only.     | dryland domain tests + route tests + editor tests                        | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this is owner-facing My Library dryland training work and introduces no admin content editor, publish queue, or admin CRUD workflow.                                           | explicit scope rationale                                                 | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Changed controls preserve labels, keyboard navigation, focus order, modal semantics, color contrast, and no serious/critical accessibility issues on changed dryland surfaces.             | Testing Library assertions + Playwright/a11y smoke + keyboard QA         | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no new heavy dependency or media-loading path; `/my-library` and `/my-library/dryland` should not materially regress in payload or interaction cost.                      | dependency diff + build/perf gate review                                 | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical session fields and local-only execution/editor state are explicit; set completion/timing save boundaries are visible and deterministic.                                   | data-boundary review + tests for local changes before save               | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Existing `force-dynamic`/`no-store` behavior stays explicit; create/save/delete refresh list/detail state deterministically without stale selected sessions.                               | route review + e2e create/save/delete coverage                           | `5/5`                   |
| Reliability and failure handling              | `target`     | Load/save/delete/invalid-payload failures are visible, recoverable, and do not discard in-progress local edits; expected failure paths avoid unexpected `500` where user input is invalid. | negative-path unit tests + manual failure-state QA                       | `5/5`                   |
| Security and authz                            | `target`     | Authenticated dryland APIs remain fail-closed and owner-scoped; invalid IDs and unauthorized access return deterministic `400`/`401`/`404` behavior.                                       | route negative-path tests                                                | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: owner-entered notes/load/timing remain private, logs avoid sensitive payloads, and no new personal data collection is introduced.                                         | code/log review                                                          | `4/5`                   |
| Content governance                            | `target`     | Code-owned exercise bank remains the source of truth; custom exercises remain user-authored snapshots; V2 does not silently mutate shared bank content from user edits.                    | model review + exercise-bank/editor tests                                | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin-managed exercise bank, publish workflow, moderation queue, or operator editability surface is introduced in this slice.                                               | explicit scope rationale                                                 | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/dryland` is authenticated/private and this slice changes no public crawlable route, metadata, sitemap, or robots behavior.                                        | explicit scope rationale                                                 | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this slice introduces no public AI-discoverable page, structured public entity data, or AI-generated dryland content.                                                          | explicit scope rationale                                                 | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: changed interaction states should remain event-loggable later, but no analytics vendor/event taxonomy expansion is required before test users.                            | code review + explicit defer note if no event work is done               | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because dryland builder ergonomics change no pricing, entitlements, checkout, refund, payout, or revenue workflow.                                                                     | explicit scope rationale                                                 | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: if labels, recovery behavior, or Help/Guide assertions change, update the relevant Help/Guide/runbook surface in the same PR; otherwise document explicit no-impact.      | Help/Guide impact review + route/label/support sweep                     | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because the slice has no finance, reconciliation, payout, subscription, entitlement, or reporting data impact.                                                                         | explicit scope rationale                                                 | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: copy remains concise and structurally localizable later, but no localization system or translated copy ships in this private owner-facing slice.                          | copy review                                                              | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse current Next.js/Supabase/Tailwind/Test stack, dryland helpers, and existing UI primitives; add no new dependency unless a concrete ergonomics problem cannot be solved locally.      | dependency diff + architecture review                                    | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit/component/e2e coverage protects session-kind safety, build controls, execution/timing states, save/reset/delete, invalid API payloads, and screenshot-reviewed responsive behavior.   | targeted Vitest + targeted Playwright + screenshot handoff + verify gate | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: keep compact JSON session storage, avoid per-keystroke persistence, and avoid media or polling patterns that would scale poorly later.                                    | persistence/path review                                                  | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Slice is rollback-safe as a focused UI/domain patch; migrations are avoided unless strictly necessary and, if needed, are explicit with generated type updates and rollback notes.         | PR diff + migration/no-migration review + verify gates                   | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - keep `/my-library/dryland` as the browse route and `/my-library/dryland/[sessionId]` as the focused build/execute route,
  - reuse `DrylandBuilderHub`, `DrylandSessionEditor`, and current My Library action patterns before adding new components,
  - keep route components server-rendered for auth/data loading and client components for interactive build/execute state,
  - keep changed dryland routes dynamic and protected.
- TypeScript/domain contracts:
  - keep canonical dryland types in `lib/dryland/shared.ts`,
  - keep runtime validation in shared/domain helpers,
  - add deterministic guards for session-kind safety and set model invariants,
  - preserve `strength` and `stretching` set semantics.
- Supabase/data layer:
  - prefer no migration for this slice,
  - keep `dryland_sessions` owner-scoped with existing RLS,
  - if a schema change becomes necessary, use an explicit migration, update generated database types, and add negative-path tests.
- External services:
  - no external services are expected in this slice.
- UI system:
  - preserve current My Library visual language,
  - use existing Tailwind tokens/primitives and stable responsive dimensions,
  - use before/after screenshots for changed dryland surfaces,
  - include desktop and mobile/tablet width coverage for build and execution states.
- Testing:
  - update dryland unit/component tests for domain invariants and editor behavior,
  - update route tests for invalid payload/not-found/authz cases if API paths change,
  - update targeted desktop Chromium Playwright for create/open/build/execute/save/delete,
  - capture screenshot handoff before PR gate.

## Data Placement And Sync Contract

- Server-canonical:
  - dryland session row `id`, owner `user_id`, `source_kind`, `status`, `session_kind`,
  - title, description, focus text,
  - exercise entries and set definitions,
  - persisted set completion values only after explicit save,
  - persisted timing values only after explicit save,
  - created/updated timestamps.
- Local-only:
  - unsaved inline editor changes,
  - transient selected exercise/detail panel state,
  - current execution focus/next-set highlight before save,
  - pending confirmations,
  - success/error notices,
  - responsive UI state.
- Sync policy:
  - create/save/delete mutate only after server confirmation,
  - no per-keystroke persistence,
  - save keeps the owner on the same canonical session route,
  - delete of current session returns to `/my-library/dryland`,
  - failed save/delete keeps local edits recoverable.
- Conflict policy:
  - no cross-device live execution sync in V2,
  - if stale data is detected or suspected, show a recoverable error rather than silently overwriting.
- Retention and sensitivity:
  - dryland sessions remain owner-scoped personal training artifacts,
  - no cross-user sharing,
  - no new analytics payload should include raw notes/load/timing unless explicitly reviewed.
- Cache/invalidation:
  - dryland page/detail reads stay dynamic,
  - API responses stay `no-store`,
  - create/save/delete refresh list/detail state deterministically.

## Identity And Rename Contract

- Canonical stable ID:
  - `dryland_sessions.id` remains the only route and persistence identity.
- Human-readable identifiers:
  - title is editable display metadata only,
  - session kind is a domain type, not a route identifier,
  - exercise bank labels are display labels and may evolve without changing saved session identity.
- Mutability rules:
  - title, description, focus, exercise content, set content, timing, and completion state are editable in place,
  - session kind should be locked after creation in V2 unless a bounded conversion flow is explicitly implemented with tests.
- Rename vs repurpose policy:
  - rename/edit in place when the same dryland session intent remains,
  - create a new session when switching between strength and stretching or meaningfully starting over.
- Compatibility contract:
  - saved bank exercises remain durable snapshots even if the bank changes,
  - custom exercises remain user-authored snapshots.
- Observability and repair:
  - invalid stored dryland sessions should produce recoverable load errors and safe logs, not broken UI or silent data rewriting.

## Help / Guide Impact

- This is user-facing workflow UI.
- If implementation changes dryland route labels, action labels, recovery behavior, or support-visible failure language, update:
  - relevant Help/Guide assertions,
  - `docs/user-flow-map.md`,
  - support/runbook notes if recovery semantics change.
- If implementation only rearranges controls without changing labels/recovery contracts, record explicit `N/A` rationale in the PR/brief checkpoint.

## Route, Label, And Support-Surface Sweep

- Required before `verify:pre-pr` if any labels/actions/recovery paths change.
- Sweep at minimum:
  - `app/`,
  - `components/`,
  - `tests/`,
  - `docs/`,
  - `docs/runbooks/`,
  - active/planned/done task briefs,
  - Help/Guide assertions.
- 2026-05-06 sweep evidence:
  - Identifiers searched: `dryland`, `Dryland Sessions`, `Workout player`, `Build session`, `dryland-mode-train`, `dryland-mode-build`, `dryland-session-more`, `dryland-delete-current-session`, `/my-library/dryland`, `api/my-library/dryland`.
  - Directories/surfaces checked: `app/`, `components/`, `tests/`, `docs/`, `docs/runbooks/`, `docs/task-briefs/planned/`, `docs/task-briefs/in-progress/`, `docs/task-briefs/done/`, Help/Guide assertions, `scripts/`, and `package.json`.
  - Command: `rg -n --hidden --glob '!node_modules' --glob '!.next' "dryland|Dryland Sessions|Workout player|Build session|dryland-mode-train|dryland-mode-build|dryland-session-more|dryland-delete-current-session|/my-library/dryland|api/my-library/dryland" app components tests docs scripts package.json`.
  - Fallout handled: dryland UI and e2e/unit locators were updated in this slice; `docs/user-flow-map.md`, admin Help/Guide assertions, admin quick-note route support docs, and architecture route contracts remain accurate because the route, route label, auth boundary, and support-visible recovery contract did not change.
  - Intentional leftovers: historical done briefs still describe earlier dryland foundation/V2 states and are retained as lifecycle history, not live product guidance.

## Scope

- Dryland browse/build/execute routes:
  - `app/my-library/dryland/page.tsx`,
  - `app/my-library/dryland/[sessionId]/page.tsx`.
- Dryland UI components:
  - `components/my-library/dryland/DrylandBuilderHub.tsx`,
  - `components/my-library/dryland/DrylandSessionEditor.tsx`,
  - `components/my-library/dryland/CreateManualDrylandSessionButton.tsx` if create entry behavior changes.
- Dryland domain helpers:
  - `lib/dryland/shared.ts`,
  - `lib/dryland/manual.ts`,
  - `lib/dryland/exercise-bank.ts`,
  - `lib/dryland/server.ts` only if save/domain behavior changes.
- Dryland API tests and UI tests:
  - `tests/unit/dryland-routes.test.ts`,
  - `tests/unit/dryland-builder-hub.test.tsx`,
  - `tests/unit/create-manual-dryland-session-button.test.tsx`,
  - `tests/e2e/my-library-dryland-builder.spec.ts`.
- Docs/support surfaces touched by changed labels or recovery behavior.

## Out Of Scope

- AI dryland generation.
- Real AI swim session builder integration.
- Video lessons or video CMS.
- Admin-managed dryland exercise bank.
- Rich exercise media CMS or upload flow.
- Full dryland history/progression dashboard.
- Market-parity strength app depth such as complete exercise history, PR tracking, 1RM charts, wearable execution, social features, or adaptive progressive overload.
- Market-parity stretching app depth such as guided video classes, mobility tests, personalized protocols, or large flexibility programs.
- Automatic load/reps/hold recommendations.
- Program-planner assignment of dryland sessions.
- Public dryland routes, public SEO, or marketing pages.
- Cross-device live execution sync.
- New analytics vendor or broad event taxonomy.
- Commerce, pricing, checkout, or entitlement changes.
- Broad My Library redesign outside dryland entrypoints needed for this flow.

## Acceptance Criteria

1. Owner can create, open, build, execute, save, reset, and delete dryland sessions with no ambiguous next step.
2. Existing dryland sessions cannot be silently corrupted by switching between `strength` and `stretching`; V2 locks kind after creation or ships a deliberately tested conversion flow.
3. Build mode clearly separates session setup, exercise selection, and selected session content as a compact composer.
4. Train mode makes current/next set, completed progress, timing state, save boundary, current exercise guidance, and session plan obvious.
5. Focused builder uses explicit `Build` and `Train` modes; `Train` is optimized as a workout player, while `Build` owns setup, exercise bank, and detailed set editing.
6. Set editing uses a compact row/table pattern with at most one visual container level below the exercise block; no frame-in-frame-in-frame layout or admin-form wall is accepted on desktop or mobile.
7. Set completion and timing changes visibly distinguish local unsaved state from persisted saved state.
8. Exercise bank interaction remains scan-friendly as the bank grows and does not become a long unstructured wall of cards.
9. Train mode exposes a foundation-shell cockpit with current/next/done state, completion action, timing, save boundary, and future-ready content slots without requiring real video/content production in this slice.
10. Build mode exposes exercise media/coaching/swim-relevance slots as placeholders or existing draft fields without adding a CMS, migration, or fake content library.
11. Destructive actions are no longer presented as primary focused-session actions and require an explicit secondary disclosure before confirmation.
12. Save/delete/load failures are visible and recoverable; failed save does not discard local edits.
13. Auth/API negative paths remain deterministic for unauthenticated, invalid id, invalid payload, and missing session cases.
14. Changed UI is keyboard accessible and has no known serious/critical accessibility regression.
15. Screenshot handoff includes before/after desktop and mobile/tablet artifacts for the changed dryland build/execute states before `verify:pre-pr`.
16. Targeted unit/e2e tests and `npm run verify:pre-pr` pass before PR update; `npm run verify:pre-merge` and CI pass before merge recommendation.

## Validation

- Planning/brief:
  - `npm run lint:briefs`
- Targeted implementation validation:
  - `npm run lint:briefs`
  - `npm run typecheck`
  - `npx vitest run tests/unit/dryland-routes.test.ts tests/unit/dryland-builder-hub.test.tsx tests/unit/create-manual-dryland-session-button.test.tsx`
  - `npx playwright test tests/e2e/my-library-dryland-builder.spec.ts --project=desktop-chromium`
- UI screenshot gate:
  - start Next locally with `SITE_LOCK_ENABLED=0`,
  - capture before/after screenshots for dryland browse and focused build/execute route,
  - include desktop and mobile/tablet coverage,
  - wait for owner screenshot approval or corrections before `verify:pre-pr`.
- Release gates:
  - `npm run verify:pre-pr`
  - PR checks green
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be available.
- Before reporting missing `node` or `npm`, bootstrap through local `nvm`:
  - `export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"`
  - `[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"`
  - `nvm use --silent`

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000`
  - Desktop Chromium first.
- Preview:
  - Vercel preview after PR checks are available.
- Recommended manual QA focus:
  - create strength session,
  - create stretching session,
  - open existing session,
  - build exercises and sets,
  - execute/toggle several sets,
  - start/stop/clear timing,
  - save/reset/delete,
  - reload after save,
  - keyboard pass through changed controls.

## Screenshot Handoff Contract

- Required because this is UI/build/execute workflow work.
- Capture artifacts under `output/dryland-training-product-surface-v3-YYYY-MM-DD-HHMMSS`.
- Use explicit before/after filenames:
  - `before-dryland-browse-desktop.png`
  - `after-dryland-browse-desktop.png`
  - `before-dryland-builder-execution-desktop.png`
  - `before-dryland-builder-execution-mobile.png`
  - `after-dryland-builder-train-desktop.png`
  - `after-dryland-builder-train-mobile.png`
  - `after-dryland-builder-build-desktop.png`
  - `after-dryland-builder-build-mobile.png`
- Handoff must include:
  - clickable `Screenshot artifacts` folder link,
  - `Captured: YYYY-MM-DD HH:MM`,
  - 2-4 representative screenshots,
  - one short verification note per screenshot,
  - known caveats or judgment calls.

## Constraints

- Keep changes minimal and scoped to dryland V3 product-surface redesign.
- Preserve current My Library visual language.
- Do not add new dependencies unless explicitly justified in the PR.
- Do not migrate data unless the session-kind safety fix cannot be done correctly without migration.
- Do not hide save boundaries: local edits must remain visible until saved.
- Keep copy concise and operational; do not add in-app tutorial text for obvious controls.
- Use existing dryland domain contracts before adding new abstractions.

## Implementation Notes

- Recommended session-kind decision:
  - lock session kind after creation,
  - show kind as read-only metadata in the focused builder,
  - direct users to create a new session when switching between strength and stretching.
- Recommended V2 UI direction:
  - browse route remains a list/create surface,
  - focused route prioritizes the active session,
  - setup controls become calmer and less dominant,
  - execution controls become easier to use during training,
  - exercise bank becomes a compact picker or better-scannable section,
  - completed/remaining state is legible without reading helper paragraphs.

## Checkpoint Log

- `2026-05-06 | merged-closeout | PR #612 merged to main as f70fac2 and post-merge preflight requested this brief closeout; moved brief to done and marked lifecycle status complete | next: open docs-only closeout PR and run repo gates`
- `2026-05-06 | verify-pre-pr-green | full npm run verify:pre-pr passed on the V3 dryland product-surface candidate after route/label/support sweep evidence was added; result: quality gate PASS, lint/admin/env/pr-body/typecheck/unit/build/perf PASS, Playwright PASS with 82 passed / 374 skipped; perf trend recommended tightening after 4 weekly green runs, but decision is hold in this dryland UI slice and carry tightening to a dedicated performance-governance follow-up/PR summary because this branch does not own platform-wide budgets | next: rerun final pre-pr confirmation after this checkpoint-only brief update, then commit, push, open/update PR, monitor CI, and run verify:pre-merge`
- `2026-05-06 | screenshot-approved-v3 | owner approved the V3 screenshot handoff for later manual testing, accepting the current private foundation-shell direction as the PR candidate; no product-rendering files changed after the approved capture | next: run verify:pre-pr, commit, push, open/update PR, monitor CI, and run verify:pre-merge before merge recommendation`
- `2026-05-06 | screenshot-review-ready-v3 | regenerated before/after V3 screenshot handoff at output/dryland-training-product-surface-v3-2026-05-06-073136; temporary screenshot route/script were removed, generated Next type cache was refreshed after temp route removal, and npm run typecheck, npm run lint, npm run lint:briefs:all, git diff --check, and targeted dryland Vitest all passed; no product-rendering files changed after capture | next: owner reviews screenshots before verify:pre-pr`
- `2026-05-06 | v3-redesign-in-progress | owner rejected the V2 handoff as chaos relative to best-in-class training apps; scope upgraded to V3 dryland product-surface redesign, hiding destructive focused actions behind More, removing focused create-button clutter, turning Train into a workout-player surface, and turning Build into a compact composer with plan rows and one-open-exercise editing | next: regenerate screenshots and owner review before verify:pre-pr`
- `2026-05-05 | screenshot-review-ready | regenerated before/after screenshot handoff at output/dryland-build-execute-v2-foundation-shell-2026-05-05-230157 after final Build accordion and focused-route frame reduction; temporary screenshot route/script were removed; npm run typecheck, npm run lint, npm run lint:briefs:all, git diff --check, targeted dryland Vitest all passed, and targeted desktop Chromium Playwright exited green with the known local dev-login/Supabase skip | next: owner reviews screenshots before verify:pre-pr`
- `2026-05-05 | foundation-shell-frame-reduction | removed the large outer card from the focused dryland builder route so Build/Train acts like a workbench instead of another framed library card; browse keeps the saved-session library card | next: rerun targeted validation and regenerate before/after screenshot handoff`
- `2026-05-05 | foundation-shell-polish | owner approved one more correction round to make dryland as close to 10/10 as possible without producing full strength/stretching content; scope clarified as 10/10 private foundation shell, not market parity with mature strength/mobility apps | next: polish Train/Build shell, add future-ready content placeholders, rerun validation, and regenerate screenshots`
- `2026-05-05 | screenshot-review-correction | corrected failed visual gate by splitting focused dryland into Train and Build modes, defaulting to Train, replacing nested set cards with compact rows, removing the focused-mode hub frame and duplicate heading, and capturing refreshed before/after artifacts at output/dryland-build-execute-v2-correction-2026-05-05-222629; targeted unit, typecheck, lint, brief-lint-all, and diff-check passed, targeted Playwright still exits green but skips because local dev-login auth is unavailable in the fake Supabase setup | next: owner reviews corrected screenshots before verify:pre-pr`
- `2026-05-05 | failed-visual-gate | owner rejected first screenshot handoff because the builder still showed frame-in-frame-in-frame set editors and failed the visual-design target for avoiding nested-card clutter; brief scope tightened to require explicit Build/Train modes and compact set rows before any PR gate | next: rebuild dryland UI layout, rerun targeted validation, and regenerate screenshots`
- `2026-05-05 | screenshot-review | implemented scoped V2 build/execute ergonomics: locked existing session kind, added execution progress and next-set action, clarified save-state boundary, added route negative-path tests, and captured before/after screenshots at output/dryland-build-execute-v2-2026-05-05-214622; targeted Vitest/typecheck/lint passed, targeted Playwright dryland flow exited green but skipped because local dev-login auth was unavailable in the fake Supabase test setup | next: owner reviews screenshot handoff before verify:pre-pr`
- `2026-05-05 | in-progress | owner approved end-to-end implementation; moved brief to in-progress on branch fix/dryland-build-execute-v2-2026-05-05 and started scoped UI/domain/test work with screenshot handoff required before PR gates | next: implement dryland build/execute ergonomics and run targeted validation`
- `2026-05-05 | planning | created planned dryland v2 brief after current-state review confirmed the foundation is implemented and the next useful slice should improve build/execute ergonomics plus session-kind safety, not rebuild the dryland domain | next: owner reviews brief and explicitly says implement when ready`
