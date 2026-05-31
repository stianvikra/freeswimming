# Task Brief: AW-006 Guide Tracker Fullscreen And Completion Feedback Token/Action Parity (10/10)

## Metadata

- `id`: `2026-05-31-aw-006-guide-tracker-fullscreen-completion-token-action-parity-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-31`
- `updated`: `2026-06-01`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-guide-tracker-fullscreen-token-parity`
- `execution_mode`: `merged via PR #930 with repo-managed docs-only closeout`

## Brief Audit Record

- `last_audited`: `2026-05-31`
- `base`: `main@b7a4564`
- `audit_status`: `ready`
- `decision`: Execute this as the current owner-approved PR-sized AW-006 UI slice through screenshot handoff.
- `reason`: `main` is clean at `b7a4564` after PR `#928` and repo-managed closeout PR `#929`; `npm run post-merge:preflight` passed with no pending closeout. A fresh queue/design/code re-audit found the entitled guide tracker top shells already aligned by PR `#868`, but the guide fullscreen action bars and completion undo toasts still use older route-local rounded slate/blue/emerald action styling while the guide-local `guideTrackerShellStyles` helpers are the mature reference.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/guides/0-1000m`, `/guides/poolside`, `Guide0To1000Tracker`, `PoolsideGuideTracker`, `guideTrackerShellStyles`, guide progress API/storage, guide content loaders, `AdminContextNotesPanel`, screenshot handoff rules, forward compatibility rules, or verification lanes change before screenshot handoff.

## Goal

Make the entitled guide fullscreen controls, Poolside visual frame, and completion undo feedback align with the current AW-006 guide/member token/action hierarchy while preserving guide access, progress sync, notes, completion, fullscreen navigation, visual zoom, and support behavior.

## Pre-Implementation Owner Explanation

Owner-approved summary from the current chat: Vi rydder opp i fullskjermvisningene og "markert fullfort/angre"-meldingene i de betalte guide-trackerne, slik at de matcher resten av den nye Freeswimming-opplevelsen. Det betyr noe fordi dette er treningsoyeblikket brukeren faktisk star i, og UI-en bor ikke falle tilbake til eldre stil akkurat der. Utenfor scope er tilgang, betaling, progresjonssynk, lokale lagringsnokler, PDF-er, guideinnhold, admin-notater, analytics, Help/Guide og bred design-system-refaktor.

Fremoverkompatibilitet: nye okter og drills skal arve samme visuelle monster automatisk via tracker-komponentene; nye guideprodukter eller nye fullscreen-moduser ma fa eksplisitt mapping, test og screenshots.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Security and authz`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                                                       | Evidence                                              | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The two entitled guide trackers keep their same training job: fullscreen session/drill focus, previous/next, mark complete, close, and undo without route or action drift.                                                               | focused tests + screenshot handoff + diff review      | `5/5`                   |
| UX flow clarity                               | `target`     | Fullscreen controls and completion undo feedback remain obvious on mobile and desktop, with no hidden primary action, overlapped action bar, overly black overlay, or dead-end completion state.                                         | Testing Library assertions + screenshots              | `5/5`                   |
| Visual design quality                         | `target`     | Fullscreen overlay, light standard action bars, visual-view controls, transparent visual assets, and undo toasts use the current guide-local token/action helpers where practical and avoid older one-off rounded-xl/dark action styles. | after/reference screenshot handoff + class assertions | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Completion toggles, undo state, notes, progress rows, localStorage keys, sync paths, fullscreen navigation, and zoom behavior are unchanged.                                                                                             | unchanged data-flow review + focused tests            | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes no admin editor, admin CRUD, publishing workflow, operator queue, or admin action surface.                                                                                                                | explicit admin-editor scope rationale                 | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Existing button names, dialog semantics, overlay close controls, keyboard/focus reachability, and visible focus styling remain intact or improve through token helpers.                                                                  | Testing Library queries + screenshot review           | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No dependency, image, route fetch, polling path, or measurable route payload growth beyond class/helper reuse.                                                                                                                           | dependency diff + build/typecheck evidence            | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Existing local-first guide progress with server sync remains unchanged; no new storage owner, cache, sync trigger, or conflict policy is introduced.                                                                                     | data contract review + guide sync tests               | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this slice changes no route cache mode, fetch cache, revalidation, invalidation trigger, CDN behavior, or stale-data policy.                                                                                                 | explicit cache scope rationale                        | `N/A`                   |
| Reliability and failure handling              | `target`     | Offline/error/retry sync behavior and completion undo remain deterministic after visual alignment.                                                                                                                                       | existing guide sync tests + completion tests          | `5/5`                   |
| Security and authz                            | `target`     | Guide routes remain fail-closed through existing protected route boundaries; no entitlement, API, notes authz, Stripe, or Supabase behavior changes.                                                                                     | changed-files review + existing route boundaries      | `5/5`                   |
| Privacy and compliance                        | `target`     | The refreshed UI exposes no user IDs, emails, Stripe IDs, raw sync payloads, provider diagnostics, or private notes outside existing protected guide surfaces.                                                                           | copy/code review                                      | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this active brief, and notice/state inventory record the selected slice without stale active-slice references.                                                                                                   | docs diff + `npm run lint:briefs`                     | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow label, mutation, Help/Guide action, operator recovery behavior, or editability path.                                                                                                          | explicit admin-workflow scope rationale               | `N/A`                   |
| SEO and crawlability                          | `supporting` | Supporting only: protected guide utility routes keep metadata/indexing behavior unchanged; this changes no sitemap, robots, canonical URL, or structured data.                                                                           | route metadata review                                 | `4/5`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity model, structured data, public semantic content, or AI-facing documentation contract.                                                                                               | explicit AI-discoverability scope rationale           | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this changes no analytics event taxonomy, payload, persistence, dashboard, or KPI definition.                                                                                                                                | analytics scope review                                | `N/A`                   |
| Commerce and revenue ops                      | `target`     | Existing guide access, PDF controls, pricing, checkout, portal, entitlement grants, Stripe IDs, and finance promises remain unchanged.                                                                                                   | commerce scope review + unchanged APIs                | `5/5`                   |
| Incident response and support operations      | `N/A`        | N/A with scope rationale: this changes no incident alert path, support workflow, operator diagnostic, runbook procedure, support escalation, or on-call flow.                                                                            | explicit support-ops scope rationale                  | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement write, or revenue data.                                                                  | explicit finance scope rationale                      | `N/A`                   |
| i18n operational readiness                    | `target`     | Existing English labels stay short and layout-safe in compact fullscreen controls; no new copy/layout assumption blocks later locale mapping.                                                                                            | screenshot text-fit review + focused tests            | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse guide-local helpers and Tailwind/CSS variables; do not introduce a broad app-wide primitive, dependency, config, or workflow change.                                                                                               | changed-files/dependency diff                         | `5/5`                   |
| Testing and QA automation                     | `target`     | Add/update focused guide tests for fullscreen/undo parity, run brief lint/typecheck/quality gates/diff checks, and stop at screenshot handoff before broad gates.                                                                        | command output + screenshot artifacts                 | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: presentation helper reuse adds no service calls, storage, jobs, polling, asset, or traffic-dependent cost.                                                                                                              | implementation review                                 | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert restores prior presentation/tests/docs; no migration, env change, dependency, provider setting, or feature flag is needed.                                                                                             | git diff + validation evidence                        | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep `/guides/0-1000m` and `/guides/poolside` as existing protected server routes.
  - Keep `Guide0To1000Tracker` and `PoolsideGuideTracker` as the client owners for progress, notes, sync, completion, overview, fullscreen session/drill state, and visual zoom state.
  - Reuse `components/guides/guideTrackerShellStyles.ts` for guide-local visual contracts where practical.
  - Do not change route redirects, entitlement checks, guide loaders, cache mode, or navigation targets.
- TypeScript/domain contracts:
  - Preserve `Guide0To1000Session`, `PoolsideDrill`, progress row payloads, guide slugs, section IDs, and storage keys.
  - Preserve existing completion undo model, note length limits, sync state union, visual zoom limits, and fullscreen navigation invariants.
  - No parser, validation layer, export contract, or mutation payload changes.
- Supabase/data layer:
  - No migration, RLS/authz, generated type, storage, index, or Supabase query change.
- External services/tools:
  - No Stripe, Supabase provider config, analytics vendor, email provider, SDK, webhook, secret, retry, or idempotency behavior change.
- UI system:
  - Reference surfaces: PR `#868` guide tracker shell helpers, `GuideAccessRequiredState`, My Library token/action hierarchy, and `GuideSyncStatus`.
  - Keep this guide-local; do not introduce a broad app-wide Card/Button/Notice primitive in this slice.
  - Keep the Poolside fullscreen visual asset inside a neutral guide-local frame so transparent SVG drills stay legible against the dark overlay.
  - Position completion undo feedback above fullscreen action bars so mobile controls remain reachable while the undo affordance is visible.
  - Keep the fullscreen overlay dim enough to focus the workout while avoiding a visually black screen.
  - Use the existing guide `fs-cta-primary`/`fs-cta-secondary` action helpers inside fullscreen action bars instead of a bespoke dark button rail.
  - Screenshot handoff type: `after/reference`, comparing changed guide fullscreen/completion feedback against the existing guide token shell direction.
- Testing:
  - Preserve existing sync tests.
  - Add focused assertions for fullscreen controls and completion undo token/action parity.
  - Use screenshot handoff before broad gates because rendered UI changes.

## Data Placement And Sync Contract

- Server-canonical data:
  - Entitlements remain Supabase/server-canonical and unchanged.
  - Guide content still loads through existing published content helpers.
  - Guide progress sync still uses the existing `/api/progress/guide` path and payload contract.
- Local data:
  - Existing guide progress and notes localStorage keys remain unchanged.
  - Existing in-memory fullscreen/visual/completion undo UI state remains component-local.
  - No new localStorage, sessionStorage, cookie, or local-only entitlement flag is introduced.
- Sync policy:
  - Existing hydrate, offline, retry, visibility-flush, completion, note, and undo behavior remains unchanged.
  - No conflict resolution or retry policy change.
- Retention and sensitivity:
  - Existing note/progress retention behavior remains unchanged.
  - UI must not expose private note contents outside current protected tracker cards/fullscreen panels.
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
  - N/A for implementation behavior; future guide/session/drill rename or repurpose must follow content identity rules outside this visual slice.
- Compatibility contract:
  - Existing `/guides/0-1000m`, `/guides/poolside`, `guide_session`, and `guide_drill` context references remain stable.
- Observability and repair:
  - Existing logging and sync diagnostics remain unchanged.

## Forward Compatibility Contract

- Extensibility surfaces touched:
  - fullscreen session action bar,
  - fullscreen overlay tone,
  - visual-view action bar,
  - visual-view asset frame,
  - fullscreen completion undo toast position,
  - completion undo toast,
  - guide-local action helper classes.
- Source of truth:
  - guide content stays data-driven from `sessions` and `drills`.
  - guide fullscreen state stays derived from selected session/drill IDs.
  - completion state stays derived from existing progress maps.
  - guide-specific labels/copy remain route/component-owned.
- Additive behavior:
  - Future sessions/drills automatically inherit the same fullscreen control and undo feedback hierarchy through the existing tracker components.
  - Existing guide action kinds can reuse the same primary/secondary/completed shell helpers.
- Explicit mapping requirements:
  - New guide products, new fullscreen modes, new action kinds, new PDF routes, new protected content types, or new support/recovery copy require deliberate mapping plus tests and screenshots.
- Unknown or deprecated values:
  - Empty guide content still falls back to current content-unavailable state.
  - Missing entitlement remains fail-closed.
  - Unknown sync states are not introduced; the existing typed union remains the boundary.
  - Unknown session/drill IDs continue to be ignored by current selection guards.
- Test/evidence:
  - Focused tests cover both current guide trackers, fullscreen controls, and completion undo feedback.
  - Route/label/support sweep includes `/guides/0-1000m`, `/guides/poolside`, `Guide0To1000Tracker`, `PoolsideGuideTracker`, `GuideSyncStatus`, `Open next session full screen`, `Visual view`, `Mark complete`, `Completed`, and `Undo`.

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
  - `Open next session full screen`
  - `Open next drill`
  - `Visual view`
  - `Mark complete`
  - `Completed`
  - `Undo`
- Surfaces to check:
  - `app/guides/`
  - `components/guides/`
  - `tests/`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/design/`
  - `docs/runbooks/`
- Expected fallout:
  - guide tracker fullscreen classes,
  - guide tracker completion undo classes,
  - focused unit tests,
  - this active brief,
  - canonical AW-006 queue,
  - notice/state inventory,
  - no Help/Guide, support runbook, API contract, analytics taxonomy, Supabase, Stripe, or route-label fallout unless implementation discovers a direct contradiction.
- Evidence format:
  - Identifiers searched: `/guides/0-1000m`, `/guides/poolside`, `Guide0To1000Tracker`, `PoolsideGuideTracker`, `GuideSyncStatus`, `Open next session full screen`, `Open next drill`, `Visual view`, `Mark complete`, `Completed`, and `Undo`.
  - Surfaces checked: `app/guides/`, `components/guides/`, `tests/`, `docs/task-briefs/planned/`, `docs/task-briefs/in-progress/`, `docs/design/`, and `docs/runbooks/`.

## Scope

- `components/guides/guideTrackerShellStyles.ts`
- `components/guides/Guide0To1000Tracker.tsx`
- `components/guides/PoolsideGuideTracker.tsx`
- Poolside fullscreen visual asset frame legibility
- fullscreen completion undo toast positioning
- fullscreen overlay tone
- light standard fullscreen action bar
- focused unit tests for guide fullscreen/completion feedback token-action parity
- canonical AW-006 queue and notice/state inventory updates
- after/reference screenshot handoff artifacts

## Out Of Scope

- Guide entitlement query shape, entitlement write/repair behavior, Supabase schema/RLS/generated types, Stripe Checkout/Portal/webhook behavior, pricing/catalog data, product IDs, guide route slugs, guide content loading, guide progress API/storage keys, tracker sync behavior, note save behavior, completion behavior, fullscreen state behavior, visual zoom/pinch/swipe behavior, guide visual asset content, guide PDF APIs, PDF generation/assets, analytics taxonomy, Help/Guide, support procedures, metadata/sitemap/robots, broad design-system primitives, package/dependency/config/workflow changes, and merge to `main`.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves or waives screenshot review.

## Acceptance Criteria

1. `/guides/0-1000m` and `/guides/poolside` keep the same auth, entitlement, guide loader, PDF download, progress sync, notes, completion, undo, fullscreen, swipe, and visual zoom behavior.
2. Fullscreen overlay, session/drill controls, visual-view controls, transparent visual assets, and completion undo feedback use the current guide token/action hierarchy and remain readable/reachable on mobile and desktop.
3. Existing dynamic sync/offline/error/retry semantics stay intact.
4. No Supabase, Stripe, API, PDF, analytics, Help/Guide, support, route metadata, dependency, or config behavior changes are introduced.
5. Canonical AW-006 queue and notice/state inventory record this active slice without stale active references.
6. Focused tests and screenshot handoff evidence are complete.
7. Work stops after screenshot handoff until owner approval.

## Validation

Targeted during implementation:

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `./node_modules/.bin/vitest run tests/unit/guide-0-1000m-tracker-sync.test.tsx tests/unit/guide-poolside-tracker-sync.test.tsx`
- `npm run typecheck`
- `npm run lint:quality-gates`
- `git diff --check`
- targeted route/label/support sweep for guide tracker identifiers

Visual gate:

- Follow `docs/runbooks/ui-debug-hypothesis-and-handoff.md`.
- Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
- Capture `after/reference` screenshots against `http://127.0.0.1:3000`.
- Required representative screenshots:
  - `after-guide-0-1000m-fullscreen-desktop.png`
  - `after-guide-poolside-visual-view-desktop.png`
  - `after-guide-0-1000m-completion-undo-mobile.png`
  - `reference-guide-token-shell-desktop.png`
- Owner screenshot approval stop: required before `npm run verify:pre-pr`, PR creation/update, CI monitoring, or `npm run verify:pre-merge`.

Broad gates after screenshot approval or explicit waiver:

- `npm run verify:pre-pr`
- PR creation/update and CI monitoring
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS/npm available through the repo's normal `nvm use --silent` path.
- Playwright Chromium available for screenshot capture; if missing, run `npx playwright install chromium`.

## Checkpoint Log

- `2026-05-31 | in-progress | started from clean main@b7a4564 after PR #928 and repo-managed closeout #929; post-merge preflight passed with no pending closeout; owner approved Guide Tracker Fullscreen And Completion Feedback Token/Action Parity after fresh queue/design/code re-audit | next: update queue/inventory, implement guide fullscreen and undo token/action parity, run targeted validation, capture after/reference screenshot handoff, and stop before npm run verify:pre-pr`
- `2026-05-31 | in-progress | owner requested less-black fullscreen screenshot after first visual handoff; scoped correction added shared lighter overlay tone while preserving tracker behavior | next: rerun targeted validation, refresh after/reference screenshots, and stop before npm run verify:pre-pr`
- `2026-05-31 | in-progress | owner asked whether the dark button background was standard; audit confirmed it was local to the two guide fullscreen surfaces; scoped correction switched fullscreen action bars back to light standard guide CTA helpers | next: rerun targeted validation, refresh after/reference screenshots, and stop before npm run verify:pre-pr`
- `2026-05-31 | in-progress | owner flagged mobile fullscreen buttons as messy and nearly invisible; scoped correction made the overlay action bar a stable two-column mobile grid, strengthened the completed-state contrast, and removed the completed-state color transition that caused screenshot capture to hit a near-invisible intermediate frame | next: rerun targeted validation, refresh after/reference screenshots, and stop before npm run verify:pre-pr`
- `2026-06-01 | in-progress | owner approved making navigation secondary wherever Next competed with Mark complete; scoped correction changed guide fullscreen and Poolside drill/visual Next buttons to secondary while keeping Mark complete as the single primary action | next: rerun targeted validation, refresh after/reference screenshots, and stop before npm run verify:pre-pr`
- `2026-06-01 | done | PR #930 merged as 11679c9 after owner-approved screenshot handoff, green GitHub checks, and local pre-merge gate on bedb1b8 | next: repo-managed docs-only closeout`

## Completion Record

- `completed`: `2026-06-01`
- `merged_pr`: `#930`
- `squash_commit`: `11679c96f7d048d45f2b37c7d5f9df6ff2586980`
- `implementation_commit`: `bedb1b87f34ea802a191ece3b0b87a309b45195f`
- `result`: Closed AW-006 Guide Tracker Fullscreen And Completion Feedback Token/Action Parity. Guide fullscreen action bars now use the light guide action hierarchy; `Mark complete` is the only blue primary action before completion, `Next` is secondary where it competes with completion, `Completed` is green/readable on mobile, and undo feedback sits above the fullscreen action bar.
- `validation`: `npm run verify:pre-pr` PASS on `bedb1b8`; GitHub checks PASS for PR `#930`; `npm run verify:pre-merge` PASS on `bedb1b87f34ea802a191ece3b0b87a309b45195f`; screenshot artifacts captured at `output/aw-006-guide-fullscreen-token-parity-2026-06-01-005020`.
- `10/10 claim`: yes - all critical target categories reached `5/5`: Product goals and IA, UX flow clarity, Visual design quality, Business logic correctness and data integrity, Reliability and failure handling, Security and authz, Stack-fit and dependency discipline, Testing and QA automation, and DevOps and rollback readiness. Accessibility (a11y) also scored `5/5` as a target category.

| Category                                      | Achieved Score | Evidence                                                                                                   | Gaps / Notes                                                                                 |
| --------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | PR `#930`, targeted guide tests, `npm run verify:pre-pr`, `npm run verify:pre-merge`                       | None.                                                                                        |
| UX flow clarity                               | `5/5`          | Owner-approved screenshot handoff, mobile two-column action grid, guide tracker tests                      | None.                                                                                        |
| Visual design quality                         | `5/5`          | `output/aw-006-guide-fullscreen-token-parity-2026-06-01-005020`, shared guide token helpers, PR `#930`     | Existing Poolside placeholder SVG dummy-text clipping remains outside this slice.            |
| Business logic correctness and data integrity | `5/5`          | No progress/storage/API contract changes, targeted sync tests, full pre-merge gate                         | None.                                                                                        |
| Accessibility (a11y)                          | `5/5`          | Dialog/action semantics preserved, Testing Library queries, full Playwright gate                           | None.                                                                                        |
| Performance (CWV + payloads)                  | `5/5`          | No dependency/config/assets added, build PASS, perf budgets PASS                                           | No tighten prompt: trend recommendation stayed `hold` due worst margin under tighten target. |
| Data placement and sync boundaries            | `5/5`          | Existing local-first guide progress/server sync contract unchanged, targeted guide sync tests              | None.                                                                                        |
| Reliability and failure handling              | `5/5`          | Completion undo behavior preserved, sync/offline retry tests, full pre-merge gate                          | None.                                                                                        |
| Security and authz                            | `5/5`          | Protected guide route boundaries unchanged, no API/auth/entitlement diff                                   | None.                                                                                        |
| Privacy and compliance                        | `5/5`          | UI-only diff; no user IDs, emails, provider diagnostics, or raw private payloads exposed                   | None.                                                                                        |
| Content governance                            | `5/5`          | Active brief moved to done in this closeout, queue/inventory stale active references removed               | None after closeout.                                                                         |
| Commerce and revenue ops                      | `5/5`          | Checkout, portal, pricing, entitlements, Stripe IDs, guide access, and PDF behavior unchanged              | None.                                                                                        |
| i18n operational readiness                    | `5/5`          | Short existing labels preserved, mobile screenshots confirm button text fits                               | Future locales still require normal explicit mapping.                                        |
| Stack-fit and dependency discipline           | `5/5`          | Reused guide-local helpers; no dependency, broad primitive, config, workflow, or package change            | None.                                                                                        |
| Testing and QA automation                     | `5/5`          | Focused unit tests, screenshot approval stop, `npm run verify:pre-pr`, GitHub checks, `verify:pre-merge`   | None.                                                                                        |
| DevOps and rollback readiness                 | `5/5`          | Single squash commit `11679c9`; rollback by reverting PR `#930`; no migrations/env/provider changes needed | None.                                                                                        |
