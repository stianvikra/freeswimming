# Task Brief: AW-006 Guide Tracker Action Shell Token Parity (10/10)

## Metadata

- `id`: `2026-05-26-aw-006-guide-tracker-action-shell-token-parity-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-26`
- `updated`: `2026-05-26`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-guide-tracker-action-shell-token-parity`
- `execution_mode`: `implementation through screenshot handoff after owner approval`

## Brief Audit Record

- `last_audited`: `2026-05-26`
- `base`: `main@21beb33`
- `audit_status`: `ready`
- `decision`: Execute this as the current owner-approved PR-sized AW-006 UI slice through screenshot handoff.
- `reason`: PR `#866` and repo-managed closeout PR `#867` are merged, `main` is clean at `21beb33`, `npm run post-merge:preflight` was reported green with no pending closeout, and a fresh queue/design/code re-audit found the two entitled guide tracker action shells still using older rounded blue/slate one-off cards while `GuideAccessRequiredState`, My Library token/action classes, and `GuideSyncStatus` are mature references.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/guides/0-1000m`, `/guides/poolside`, guide product constants, guide content loaders, guide progress API/storage, `Guide0To1000Tracker`, `PoolsideGuideTracker`, `GuidePdfDownloadButton`, `GuideAccessRequiredState`, screenshot handoff rules, forward compatibility rules, or verification lanes change before screenshot handoff.

## Goal

Make the entitled `/guides/0-1000m` and `/guides/poolside` tracker action shells visually align with the current AW-006 guide/member token hierarchy while preserving access, PDF, progress, notes, sync, and fullscreen tracker behavior.

## Pre-Implementation Owner Explanation

Vi rydder opp i kort, knapper og statusomrader pa de to betalte guide-sidene: `0-1000m` og `Poolside`. Det betyr noe fordi sidene fungerer, men ser eldre ut enn My Library og de nyeste AW-006-flatene. Utenfor scope er betaling, tilgang, PDF-nedlasting, progresjon, lagring, innhold, synk, admin-notater, API-er, analytics, Help/Guide og supportflyt.

Fremoverkompatibilitet: dette skal holdes som en guide-lokal action shell-retning som kan gjenbrukes av nye guider senere. Nytt guideinnhold skal fortsatt komme fra `sessions`/`drills`-dataene, mens nye guideprodukter, actions, PDF-ruter eller produktspesifikk copy krever eksplisitt mapping, test og screenshot-evidence.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Reliability and failure handling`
- `Security and authz`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                               | Evidence                                     | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Both entitled guide routes keep their purpose: open the tracker, download the PDF, return to My Library, and continue the next session/drill from one coherent shell.            | route/component tests + screenshot handoff   | `5/5`                   |
| UX flow clarity                               | `target`     | Primary actions and progress/status cards are easier to scan on desktop and mobile without changing the order or meaning of guide actions.                                       | focused tests + screenshots                  | `5/5`                   |
| Visual design quality                         | `target`     | Route action strips, tracker summary shells, metric cards, secondary actions, and loading/empty shells use current token/card/action direction with no unrelated redesign.       | after/reference screenshots + diff review    | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Guide entitlement checks, content loading, progress rows, localStorage keys, notes, sync, completion toggles, PDF downloads, and fullscreen navigation remain unchanged.         | changed-files review + targeted tests        | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes no admin editor, CRUD, publishing workflow, operator queue, or admin action surface.                                                              | explicit admin-editor scope rationale        | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Buttons/links keep accessible names, keyboard reachability, visible focus, correct `aria-expanded` where present, and no noisy live-region changes beyond existing sync status.  | Testing Library assertions + screenshot QA   | `5/5`                   |
| Accessibility                                 | `target`     | Alias row for closeout-lint category normalization of `Accessibility (a11y)`; same target and evidence.                                                                          | Testing Library assertions + screenshot QA   | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No dependency, image, route fetch, client state model, polling path, or measurable route payload growth beyond small markup/class reuse.                                         | dependency diff + validation gate            | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Existing guide progress stays local-first with server sync through current API/storage paths; no new state owner, storage key, conflict policy, or retention rule is introduced. | unchanged sync code review + tests           | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this slice changes no route cache mode, fetch cache, revalidation, invalidation trigger, CDN behavior, or stale-data policy.                                         | explicit cache scope rationale               | `N/A`                   |
| Reliability and failure handling              | `target`     | Existing offline/error/retry sync behavior, missing guide-content states, and PDF feedback remain deterministic and accessible after visual alignment.                           | focused sync tests + UI review               | `5/5`                   |
| Security and authz                            | `target`     | Guide routes remain fail-closed: anonymous users redirect to sign-in and non-entitled users cannot reach tracker content or guide PDF controls.                                  | route/code review + existing tests           | `5/5`                   |
| Privacy and compliance                        | `target`     | The refreshed UI exposes no entitlement IDs, user IDs, emails, Stripe IDs, provider diagnostics, raw sync payloads, or private notes outside existing protected surfaces.        | copy/code review                             | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this active brief, and notice/state inventory record the selected slice without stale active-slice references.                                           | docs diff + brief lint                       | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow label, mutation, Help/Guide action, operator recovery behavior, or editability path.                                                  | explicit admin-workflow scope rationale      | `N/A`                   |
| SEO and crawlability                          | `supporting` | Supporting only: guide routes are protected utility/product routes; this changes no metadata, sitemap, robots, canonical URL, structured data, or public indexability contract.  | route metadata review                        | `4/5`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity model, structured data, public semantic content, or AI-facing documentation contract.                                       | explicit AI-discoverability scope rationale  | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event taxonomy, payload, persistence, dashboard, or KPI definition changes.                                                                             | analytics scope review                       | `N/A`                   |
| Commerce and revenue ops                      | `target`     | Existing PDF access, My Library return, plans/access state boundaries, pricing, checkout, portal, entitlement grants, Stripe IDs, and finance promises remain unchanged.         | commerce scope review + unchanged APIs       | `5/5`                   |
| Incident response and support operations      | `N/A`        | N/A with scope rationale: this changes no incident alert path, support workflow, operator diagnostic, runbook procedure, support escalation, or on-call flow.                    | explicit support-ops scope rationale         | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement write, or revenue data.          | explicit finance scope rationale             | `N/A`                   |
| i18n operational readiness                    | `target`     | Existing route-owned English labels remain short and layout-safe; no new copy/layout assumption blocks future locale mapping.                                                    | screenshot text-fit review + component tests | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse guide-local trackers, `GuideSyncStatus`, `GuideAccessRequiredState`/My Library token classes, and Tailwind/CSS variables; add no dependency or app-wide primitive.         | changed-files/dependency diff                | `5/5`                   |
| Testing and QA automation                     | `target`     | Update focused unit assertions, run targeted guide tests, brief lint, typecheck/diff checks, and stop at screenshot handoff before `verify:pre-pr`.                              | test output + screenshot artifacts           | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: token/action parity adds no service call, storage, job, polling, asset, or traffic-dependent cost.                                                              | implementation review                        | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert restores prior markup/tests/docs; no migration, env change, dependency, workflow, provider setting, or feature flag is needed.                                 | git diff + validation evidence               | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep `/guides/0-1000m` and `/guides/poolside` as existing protected server routes.
  - Keep `Guide0To1000Tracker` and `PoolsideGuideTracker` as the client owners for progress, notes, sync, completion, overview, and fullscreen behavior.
  - Reuse guide-local helpers/constants for shell/action classes only where they reduce duplication without changing data flow.
  - Do not change route redirects, entitlement checks, guide loaders, cache mode, or navigation targets.
- TypeScript/domain contracts:
  - Preserve `Guide0To1000Session`, `PoolsideDrill`, progress row payloads, guide slugs, section IDs, and storage keys.
  - Preserve existing note length limits, completion undo model, sync state union, and fullscreen navigation invariants.
  - No parser, validation layer, export contract, or mutation payload changes.
- Supabase/data layer:
  - No migration, RLS/authz, generated type, storage, index, or Supabase query change.
- External services/tools:
  - No Stripe, Supabase provider config, analytics vendor, email provider, SDK, webhook, secret, retry, or idempotency behavior changes.
- UI system:
  - Reference surfaces: `GuideAccessRequiredState` for guide card/action tokens, `MyLibraryHub`/`TodayTabsPanel` for AW-006 member card/action hierarchy, and `GuideSyncStatus` for guide-local sync feedback.
  - Keep this guide-local; do not introduce a broad app-wide Card/Button/Notice primitive in this slice.
  - Screenshot handoff type: `after/reference` for deterministic local capture: render the changed guide route action strips and tracker shells through a temporary local harness, compare against the mature `GuideAccessRequiredState` reference surface, then remove the harness before final diff.
  - High-cost UI/export debug path: use `docs/runbooks/ui-debug-hypothesis-and-handoff.md` if screenshot capture, rendered artifact, or viewport evidence contradicts the implementation claim.
- Testing:
  - Preserve existing sync tests.
  - Add focused token/action assertions for route action strips and tracker shells.
  - Use screenshot handoff before broad gates because rendered UI changes.

## Data Placement And Sync Contract

- Server-canonical data:
  - Entitlements remain Supabase/server-canonical and unchanged by this slice.
  - Guide content still loads through existing published content helpers.
  - Guide progress sync still uses the existing `/api/progress/guide` path and payload contract.
- Local data:
  - Existing guide progress and notes localStorage keys remain unchanged.
  - No new localStorage, sessionStorage, cookie, or local-only entitlement flag is introduced.
- Sync policy:
  - Existing hydrate, offline, retry, visibility-flush, and completion/note sync behavior remains unchanged.
  - No conflict resolution or retry policy change.
- Retention and sensitivity:
  - Existing note/progress retention behavior remains unchanged.
  - UI must not expose private note contents outside the current protected tracker cards/fullscreen panels.
- Cache/invalidation:
  - No route or fetch cache policy changes.

## Identity And Rename Contract

- Canonical stable ID:
  - Guide slugs, product IDs, session IDs, and drill IDs remain the stable identifiers for routes, entitlements, progress rows, and admin context notes.
- Human-readable identifiers:
  - Guide titles, session titles, and drill titles remain display labels only in this slice.
- Mutability rules:
  - No route, slug, product ID, session ID, or drill ID mutability change.
- Rename vs repurpose policy:
  - N/A for implementation behavior; any future guide/session/drill rename or repurpose must follow content identity rules outside this visual slice.
- Compatibility contract:
  - Existing `/guides/0-1000m`, `/guides/poolside`, `guide_session`, and `guide_drill` context references remain stable.
- Observability and repair:
  - Existing logging and sync diagnostics remain unchanged.

## Forward Compatibility Contract

- Extensibility surfaces touched:
  - guide route action strip,
  - tracker summary/action shell,
  - metric cards,
  - overview/completed controls,
  - loading/content-unavailable shells.
- Source of truth:
  - guide content stays data-driven from `sessions` and `drills`.
  - sync state stays data-driven from existing guide progress state.
  - guide-specific labels/copy remain route/component-owned.
- Additive behavior:
  - Future sessions/drills automatically inherit the same tracker card and action hierarchy.
  - Existing guide action kinds can reuse the same primary/secondary/quiet/completed shell helpers.
- Explicit mapping requirements:
  - New guide products, new route action kinds, new PDF routes, new protected content types, new fullscreen modes, or new support/recovery copy require deliberate mapping plus tests and screenshots.
- Unknown or deprecated values:
  - Empty guide content still falls back to the current content-unavailable state.
  - Missing entitlement remains fail-closed.
  - Unknown sync states are not introduced; the existing typed union remains the boundary.
- Test/evidence:
  - Focused tests cover both current guide trackers and current action shells.
  - Route/label/support sweep includes `/guides/0-1000m`, `/guides/poolside`, `Guide0To1000Tracker`, `PoolsideGuideTracker`, `GuideSyncStatus`, `GuidePdfDownloadButton`, `Open next session full screen`, `Open next drill`, and `Back to My Library`.

## Help / Guide Impact

N/A with rationale: this changes presentation only. It does not rename routes, product labels, workflow actions, Help/Guide content, support recovery behavior, admin instructions, checkout expectations, entitlement rules, PDF behavior, progress sync behavior, or notes behavior.

## Route / Label / Support Surface Sweep

Required because protected guide routes and visible guide actions are touched.

- Identifiers to search:
  - `/guides/0-1000m`
  - `/guides/poolside`
  - `Guide0To1000Tracker`
  - `PoolsideGuideTracker`
  - `GuideSyncStatus`
  - `GuidePdfDownloadButton`
  - `Back to My Library`
  - `Open next session full screen`
  - `Open next drill`
  - `Continue where you left off`
  - `Guide content unavailable`
- Surfaces to check:
  - `app/guides/`
  - `components/guides/`
  - `tests/`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/design/`
  - `docs/runbooks/`
- Expected fallout:
  - guide route action strip classes,
  - `Guide0To1000Tracker`,
  - `PoolsideGuideTracker`,
  - focused unit tests,
  - this active brief,
  - canonical AW-006 queue,
  - notice/state inventory,
  - no Help/Guide, support runbook, API contract, analytics taxonomy, Supabase, Stripe, or route-label fallout unless implementation discovers a direct contradiction.
- Evidence format:
  - Identifiers searched: `/guides/0-1000m`, `/guides/poolside`, `Guide0To1000Tracker`, `PoolsideGuideTracker`, `GuideSyncStatus`, `GuidePdfDownloadButton`, `Back to My Library`, `Open next session full screen`, `Open next drill`, `Continue where you left off`, and `Guide content unavailable`.
  - Surfaces checked: `app/guides/`, `components/guides/`, `tests/`, `docs/task-briefs/planned/`, `docs/task-briefs/in-progress/`, `docs/design/`, and `docs/runbooks/`.

## Scope

- `app/guides/0-1000m/page.tsx`
- `app/guides/poolside/page.tsx`
- `components/guides/Guide0To1000Tracker.tsx`
- `components/guides/PoolsideGuideTracker.tsx`
- focused unit tests for guide tracker action shell parity
- canonical AW-006 queue and notice/state inventory updates
- after/reference screenshot handoff artifacts

## Out Of Scope

- Guide entitlement query shape, entitlement write/repair behavior, `attachGuestEntitlementsByEmail`, Supabase schema/RLS/generated types, Stripe Checkout/Portal/webhook behavior, pricing/catalog data, product IDs, guide route slugs, guide content loading, guide progress API/storage keys, tracker sync behavior, note save behavior, completion behavior, fullscreen behavior, guide PDF APIs, PDF generation/assets, analytics taxonomy, Help/Guide, support procedures, metadata/sitemap/robots, broad design-system primitives, package/dependency/config/workflow changes, and merge to `main`.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves or waives screenshot review.

## Acceptance Criteria

1. `/guides/0-1000m` and `/guides/poolside` keep the same auth, entitlement, guide loader, PDF download, progress sync, notes, completion, and fullscreen behavior.
2. The route action strip and tracker top shells use current AW-006 token/action hierarchy and remain readable on mobile and desktop.
3. Metric cards, overview/completed controls, loading shells, and content-unavailable shells align visually across both guide trackers.
4. Existing dynamic sync/offline/error/retry semantics stay intact.
5. No Supabase, Stripe, API, PDF, analytics, Help/Guide, support, route metadata, dependency, or config behavior changes are introduced.
6. Canonical AW-006 queue and notice/state inventory record this active slice without stale active references.
7. Focused tests and screenshot handoff evidence are complete.
8. Work stops after screenshot handoff until owner approval.

## Validation

Targeted during implementation:

- `npm run lint:briefs`
- `npm run lint:briefs:all` while the new in-progress brief is uncommitted
- `./node_modules/.bin/vitest run tests/unit/guide-0-1000m-tracker-sync.test.tsx tests/unit/guide-poolside-tracker-sync.test.tsx`
- targeted route/component tests if route action strips gain assertions
- `npm run typecheck`
- `npm run lint:quality-gates`
- `git diff --check`
- targeted route/label/support sweep for guide tracker identifiers

Visual gate:

- Follow `docs/runbooks/ui-debug-hypothesis-and-handoff.md`; if screenshot evidence contradicts the claimed fix, switch to the ranked hypothesis loop before patching again.
- Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
- Capture `after/reference` screenshots against `http://127.0.0.1:3000`.
- Required representative screenshots:
  - `after-guide-0-1000m-tracker-desktop.png`
  - `after-guide-poolside-tracker-desktop.png`
  - `after-guide-0-1000m-tracker-mobile.png`
  - `reference-guide-access-required-desktop.png`
- Owner screenshot approval stop: required before `npm run verify:pre-pr`, PR creation/update, CI monitoring, or `npm run verify:pre-merge`.

Broad gates after screenshot approval or explicit waiver:

- `npm run verify:pre-pr`
- PR creation/update and CI monitoring
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS/npm available through the repo's normal `nvm use --silent` path.
- For implementation, release-gate commands follow repo escalation-first defaults where applicable.

## Manual QA / Screenshot Handoff

Required because this changes visible UI/layout.

- Capture type: `after/reference`.
- Required viewports:
  - desktop `/guides/0-1000m`,
  - desktop `/guides/poolside`,
  - mobile `/guides/0-1000m` and/or `/guides/poolside`.
- Artifact folder pattern:
  - `output/aw-006-guide-tracker-action-shell-token-parity-YYYY-MM-DD-HHMMSS/`
- Stop after screenshot handoff for owner approval before `npm run verify:pre-pr`.

## Checkpoint Log

- `2026-05-26 | in-progress | started from clean main@21beb33 after PR #866 and repo-managed closeout #867; owner approved Guide Tracker Action Shell Token Parity after fresh queue/design/code re-audit | next: update queue/inventory, implement guide tracker action shell parity, run targeted validation, capture after/reference screenshot handoff, and stop before npm run verify:pre-pr`
- `2026-05-26 | screenshot-handoff | implemented guide route action strip and tracker shell token/action parity for /guides/0-1000m and /guides/poolside while preserving guide content, progress sync, notes, PDFs, fullscreen behavior, Help/Guide, and support scope; targeted validation passed: ./node_modules/.bin/vitest run tests/unit/guide-0-1000m-tracker-sync.test.tsx tests/unit/guide-poolside-tracker-sync.test.tsx tests/unit/guide-access-required-state.test.tsx (3 files / 16 tests), npm run typecheck, npm run lint:briefs:all, npm run lint:quality-gates, git diff --cached --check, and targeted route/label/support sweep; refreshed after/reference screenshot artifacts captured in output/aw-006-guide-tracker-action-shell-token-parity-2026-05-26-203635 with a temporary local harness, deterministic progress/admin API mocks, and capture-only hiding of global dev/mobile chrome; desktop 0-1000m was reframed to first viewport so it shows the same color hierarchy as mobile instead of a scaled long-page capture; the harness/script were removed and no product rendering files changed after final capture | next: wait for owner screenshot approval before npm run verify:pre-pr, PR creation, and pre-merge gates`
- `2026-05-26 | screenshot-approved | owner approved the refreshed after/reference screenshot handoff for output/aw-006-guide-tracker-action-shell-token-parity-2026-05-26-203635, including desktop 0-1000m matching the mobile color hierarchy; no product rendering files changed after final capture | next: run npm run verify:pre-pr, commit, push, open/update PR, monitor CI, and run npm run verify:pre-merge`
- `2026-05-26 | closeout | PR #868 shipped as squash commit ce8292f after owner-approved screenshot handoff, full local pre-PR, CI, and local pre-merge gates passed; this repo-managed docs-only closeout moves the brief to done and clears the active AW-006 queue/design inventory references | next: validate and merge closeout, rerun post-merge preflight, then complete mandatory chat-handoff assessment before starting another implementation slice`

## Completion Record

- `completed`: `2026-05-26`
- `merged_pr`: `#868`
- `squash_commit`: `ce8292f`
- `result`: Closed AW-006 Guide Tracker Action Shell Token Parity. The entitled `/guides/0-1000m` and `/guides/poolside` route action strips and tracker shells now use the current AW-006 guide/member token hierarchy while preserving entitlements, PDFs, guide content, progress sync, notes, fullscreen behavior, Help/Guide, and support scope.
- `validation`: Owner-approved screenshot handoff at `output/aw-006-guide-tracker-action-shell-token-parity-2026-05-26-203635`; targeted guide tracker/access tests PASS (3 files / 16 tests); `npm run typecheck` PASS; `npm run lint:briefs:all` PASS; `npm run lint:quality-gates` PASS; `git diff --cached --check` PASS; targeted route/label/support sweep completed; `npm run verify:pre-pr` PASS on commit `ae004bb`; CI for PR #868 PASS; `npm run verify:pre-merge` PASS before merge.
- `10/10 claim`: yes - all critical target categories reached `5/5`, with no remaining release-blocking gaps.

| Category                                      | Achieved Score | Evidence                                                                                             | Gaps / Notes              |
| --------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------- | ------------------------- |
| Product goals and IA                          | `5/5`          | PR #868 diff, route action assertions, owner-approved screenshot handoff, CI PASS                    | No remaining gap.         |
| UX flow clarity                               | `5/5`          | After/reference screenshots and focused tracker action assertions                                    | No remaining gap.         |
| Visual design quality                         | `5/5`          | Screenshot artifacts captured after implementation; no product-rendering files changed afterward     | No remaining gap.         |
| Business logic correctness and data integrity | `5/5`          | Changed-files review, targeted sync/access tests, full local gates, CI PASS                          | No data/API change.       |
| Accessibility (a11y)                          | `5/5`          | Testing Library accessible-action assertions and full verification lane                              | No remaining gap.         |
| Accessibility                                 | `5/5`          | Alias row for brief-lint parity with same evidence as `Accessibility (a11y)`                         | No remaining gap.         |
| Performance (CWV + payloads)                  | `5/5`          | No dependency/media/API changes; perf budget PASS in pre-PR and pre-merge gates                      | No remaining gap.         |
| Data placement and sync boundaries            | `5/5`          | Existing progress API/localStorage and sync behavior preserved; focused sync tests passed            | No state-boundary change. |
| Reliability and failure handling              | `5/5`          | Existing loading, missing content, offline/sync retry, notes, and completion behavior preserved      | No remaining gap.         |
| Security and authz                            | `5/5`          | Protected route entitlement checks and PDF access boundaries untouched; CI/local gates passed        | No authz change.          |
| Privacy and compliance                        | `5/5`          | No private IDs, raw sync payloads, email, provider diagnostics, or private notes exposed             | No remaining gap.         |
| Content governance                            | `5/5`          | Active brief, queue, and inventory updated; repo-managed closeout clears stale active references     | No remaining gap.         |
| Commerce and revenue ops                      | `5/5`          | Entitlements, checkout, portal, PDF access, pricing, Stripe, and finance behavior unchanged          | No commerce change.       |
| i18n operational readiness                    | `5/5`          | Screenshot text-fit review and unchanged concise route-owned labels                                  | No new locale mapping.    |
| Stack-fit and dependency discipline           | `5/5`          | Reused guide-local trackers, `GuideSyncStatus`, guide access/My Library token classes; no dependency | No dependency change.     |
| Testing and QA automation                     | `5/5`          | Focused vitest, full local `verify:pre-pr`, PR CI, and `verify:pre-merge` PASS                       | No remaining gap.         |
| DevOps and rollback readiness                 | `5/5`          | Squash commit ce8292f is scoped and reversible; no migration/env/config/workflow change              | No remaining gap.         |
