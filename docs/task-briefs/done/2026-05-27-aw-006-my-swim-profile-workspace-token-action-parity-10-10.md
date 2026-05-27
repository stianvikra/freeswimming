# Task Brief: AW-006 My Swim Profile Workspace Token And Action Hierarchy Parity (10/10)

## Metadata

- `id`: `2026-05-27-aw-006-my-swim-profile-workspace-token-action-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-27`
- `updated`: `2026-05-27`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-my-swim-profile-token-parity`
- `execution_mode`: `owner-approved implementation through screenshot handoff; stop before broad PR gates until screenshot approval`

## Brief Audit Record

- `last_audited`: `2026-05-27`
- `base`: `main@fa8b2fa`
- `audit_status`: `ready`
- `decision`: Execute this as the current owner-approved PR-sized AW-006 UI slice through screenshot handoff.
- `reason`: PR `#870` and repo-managed closeout PR `#871` are merged, `main` is clean at `fa8b2fa`, `npm run post-merge:preflight` was reported green with no pending closeout, and a fresh queue/design/code re-audit found `/my-library/profile` route shell/header/back action plus the profile readiness panel still using older local blue rounded-card/action styling while `MyLibraryHub`, `MyLibraryRoutinesWorkspace`, `/my-library/item/[slug]`, `SavedWorkoutsPanel`, and `/my-library/training` now use the newer AW-006 token/action hierarchy.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/my-library/profile`, `AthleteProfileHub`, profile API/storage/local draft contracts, readiness scoring, My Library token references, screenshot handoff rules, forward compatibility rules, or verification lanes change before screenshot handoff.

## Goal

Make the `/my-library/profile` workspace shell, header, route action, and top readiness panel visually align with the current My Library token/action hierarchy while preserving profile data, API behavior, local drafts, analytics, section order, readiness scoring, feedback semantics, Help/Guide, and support behavior.

## Pre-Implementation Owner Explanation

Vi rydder `My Swim Profile`-siden slik at toppen av siden, tilbake-knappen og `Profile readiness`-omradet ser ut som resten av nye My Library. Det betyr noe fordi profilen er en viktig medlemsside, og den skal oppleves som en trygg del av samme produkt i stedet for en eldre separat side.

Utenfor scope er svommeprofil-data, skjema-logikk, API-er, lagring, localStorage-drafts, innlogging, analytics, rekkefolgen pa profilseksjoner, readiness-beregning, Help/Guide, supportflyt og bred design-system-refaktor.

Fremoverkompatibilitet: readiness-kortene skal fortsatt drives av eksisterende snapshot/readiness-kontrakt. Nye profilseksjoner eller nye route-actions krever eksplisitt mapping, copy og test for de skal vises i readiness eller handlingshierarkiet.

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
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                        | Evidence                                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library/profile` remains the private My Swim Profile workspace reached from My Library, with the same profile purpose and back destination.                          | route/action review + focused tests            | `5/5`                   |
| UX flow clarity                               | `target`     | The profile header, `Back to My Library`, readiness summary, readiness chips, and next setup action are easier to scan without changing profile workflows.                | screenshot handoff + focused tests             | `5/5`                   |
| Visual design quality                         | `target`     | Route shell/header/actions and the top readiness panel use My Library token/card/action language with stable spacing and no text overflow on mobile/desktop.              | before/after screenshots + diff review         | `5/5`                   |
| Business logic correctness and data integrity | `target`     | No changes to profile snapshot loading, save/delete/reset payloads, local draft keys, section order, readiness scoring, or profile section state transitions.             | changed-files review + targeted tests          | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this private member workspace slice changes no admin editor, CRUD, publish workflow, operator queue, or admin action surface.                                 | explicit admin-editor scope rationale          | `N/A`                   |
| Accessibility (a11y)                          | `target`     | One visible `My Swim Profile` H1 remains; the back action and readiness action stay keyboard reachable with accessible names and layout-safe touch targets.               | Testing Library/e2e assertions + screenshot QA | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency, media asset, API call, polling loop, client state model, or route payload growth beyond markup/class changes.                                          | dependency diff + pre-PR gate                  | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this visual shell/readiness slice introduces no local-only data, server-canonical data, sync trigger, conflict policy, retention, or sensitive-data flow.     | explicit state-boundary review                 | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because existing `dynamic = "force-dynamic"` behavior and profile server snapshot loading remain unchanged; no fetch/cache path changes.                              | changed-files review                           | `N/A`                   |
| Reliability and failure handling              | `target`     | Existing profile offline, recovered-draft, action-error, action-success, schema-missing, and section feedback states continue to render without shell interference.       | focused regression tests + diff review         | `5/5`                   |
| Security and authz                            | `target`     | Anonymous `/my-library/profile` still redirects to `/auth/sign-in?next=%2Fmy-library%2Fprofile`; no protected data moves to a new client boundary.                        | existing e2e/unit route coverage + review      | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data fields, telemetry payloads, legal copy, consent behavior, logs, secrets, or sensitive diagnostics change.                                        | privacy scope review                           | `N/A`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this active brief, and design inventory record the selected slice without stale active-slice references.                                          | docs diff + brief lint                         | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this slice changes no admin workflow label, Help/Guide action, support recovery procedure, operator edit path, or admin mutation.                             | explicit admin-workflow scope rationale        | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/profile` is authenticated/private and this slice changes no public metadata, sitemap, robots, canonical URL, or indexability contract.           | private-route SEO rationale                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity model, structured data, public semantic content, or AI-facing documentation contract.                                | AI-discoverability scope rationale             | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event taxonomy, payload, persistence, dashboard, KPI definition, or consent behavior changes.                                                    | analytics scope rationale                      | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no Stripe, checkout, catalog, entitlement, portal, invoice, refund, payout, or reporting behavior.                                         | commerce scope review                          | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A with scope rationale: this changes no incident path, alerting, runbook procedure, support diagnostics, recovery workflow, or support escalation behavior.             | explicit support-ops scope rationale           | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this changes no billing, reconciliation, finance report, payout, refund, invoice, entitlement, provider financial data, or revenue operation.   | explicit finance scope rationale               | `N/A`                   |
| i18n operational readiness                    | `target`     | Route-action and readiness labels stay concise and layout-safe so later localization is not blocked by tight fixed-width assumptions.                                     | screenshot text-fit review + focused tests     | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `SiteChrome`, existing `/my-library/profile` server route, `AthleteProfileHub`, My Library token/action references, Tailwind, and current tests; add no dependency. | changed-files/dependency diff                  | `5/5`                   |
| Testing and QA automation                     | `target`     | Update focused assertions where route/readiness shell classes or protected navigation contracts matter; capture screenshot handoff before broad gates.                    | test output + screenshot handoff               | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: token/action parity adds no service call, storage, job, polling, or traffic-dependent cost.                                                              | implementation review                          | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert restores prior markup/tests/docs; no migration, dependency, config, workflow, provider setting, or feature flag rollback is needed.                     | git diff + validation evidence                 | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep `/my-library/profile` as the authenticated server route with `dynamic = "force-dynamic"`.
  - Reuse `SiteChrome` and `AthleteProfileHub`; do not move profile data ownership into a new client boundary.
  - Reuse My Library hub, My Routines, owned item detail, saved-list, and My Training token/action direction instead of inventing a new route-specific visual system.
  - Do not change route redirects, server loaders, API routes, cache behavior, or profile section order.
- TypeScript/domain contracts:
  - Preserve profile snapshot types, profile/local draft keys, section keys, readiness card data, readiness recommendation logic, and feedback semantics.
  - Do not change validation, API payloads, save/delete/reset behavior, section disclosure persistence, or fallback state builders.
- Supabase/data layer:
  - N/A; no migration, RLS/authz rule, generated DB type, storage, index, or data access change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, analytics vendor, email provider, SDK, secret, webhook, retry, or idempotency behavior changes.
- UI system:
  - Mature reference surfaces: `MyLibraryHub`, `MyLibraryRoutinesWorkspace`, `/my-library/item/[slug]`, `SavedWorkoutsPanel`, and `/my-library/training`.
  - Keep the change route/readiness-shell scoped; do not create a broad app-wide page shell/button/card primitive in this slice.
  - Screenshot handoff type: `before/after` for `/my-library/profile` desktop and mobile.
- Testing:
  - Update focused tests for profile route shell/action classes and protected redirect if structure changes.
  - Preserve existing My Swim Profile draft recovery and section workflow coverage.

## Data Placement And Sync Contract

N/A with rationale: this is a visual/action hierarchy parity slice. It introduces no new local-only data, server-canonical data, browser storage, sync trigger, conflict resolution, retry policy, retention rule, cache invalidation, or sensitive data handling. Existing profile snapshots and local draft keys remain the source of truth.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible identifier, alias, redirect, or compatibility mapping. Existing profile section keys and route labels remain stable.

## Forward Compatibility Contract

- Extensibility surfaces touched:
  - route-local `/my-library/profile` shell/header/back action,
  - `AthleteProfileHub` top readiness panel,
  - readiness action/chip visual hierarchy.
- Source of truth:
  - Profile content remains derived from `loadAthleteProfileSnapshot` and existing `AthleteProfileHub` state.
  - Readiness cards remain derived from existing profile, CSS metric, preferences, capability limits, and personal records helpers.
- Additive behavior:
  - new values inside existing profile fields should continue to render inside the existing profile sections without route-shell changes.
  - the shell should remain stable if the hub grows vertically or renders existing feedback states.
- Explicit mapping requirements:
  - new profile sections, route-level actions, readiness cards, workspace labels, or materially different profile modes require deliberate copy/class/test/screenshot updates before release.
  - future Help/Guide or support changes are required only if labels, routes, recovery behavior, or workflow meaning change.
- Unknown or deprecated values:
  - this slice adds no new unknown value path; existing typed profile helpers and section fallback/error behavior continue to own unsupported data states.
  - unknown API payloads must not be interpreted as route-shell success states.
- Test/evidence:
  - focused tests/e2e assertions verify route actions and auth redirect remain stable.
  - screenshot handoff checks desktop/mobile text fit.
  - route/label/support sweep checks My Swim Profile, Back to My Library, Profile readiness, readiness action, and `/my-library/profile` fallout.

## Help / Guide Impact

N/A with rationale: this slice changes presentation only. It does not rename routes, labels, workflow actions, Help/Guide content, support recovery behavior, profile storage behavior, or operator instructions.

## Route / Label / Support Surface Sweep

Required because `/my-library/profile`, visible route actions, and readiness labels are touched.

- Identifiers searched:
  - `/my-library/profile`
  - `My Swim Profile`
  - `AthleteProfileHub`
  - `Back to My Library`
  - `Profile readiness`
  - `athlete_profile_viewed`
  - `athlete-profile-readiness`
  - `athlete-profile-next-action`
- Surfaces checked:
  - `app/`
  - `components/`
  - `tests/`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/design/`
  - `docs/runbooks/`
- Expected fallout:
  - `app/my-library/profile/page.tsx`,
  - `components/my-library/profile/AthleteProfileHub.tsx`,
  - focused tests if route/readiness shell assertions change,
  - this active brief,
  - canonical AW-006 queue,
  - design inventory,
  - screenshot artifacts during implementation.

## Scope

- `app/my-library/profile/page.tsx` route shell/header/back action styling.
- `components/my-library/profile/AthleteProfileHub.tsx` top readiness panel/action/chip styling only.
- Focused route/component/e2e/unit assertions where route shell or readiness shell class contracts change.
- Canonical AW-006 queue and design inventory updates.
- Before/after screenshot handoff artifacts during implementation.

## Out Of Scope

- Profile data model, API routes, Supabase queries, generated database types, migrations, auth, analytics taxonomy, route labels, profile section order, readiness scoring, localStorage keys, section save/delete/reset behavior, Help/Guide updates, support workflow, broad member notice primitive, app-wide design-system primitive, new dependencies, commerce, packages, and merge without explicit owner approval.
- `GoalsHub`, `WorkoutBuilderHub`, `HabitPerfectDayHub`, `DrylandBuilderHub`, and other member shell parity work.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves screenshots.

## Acceptance Criteria

1. `/my-library/profile` keeps the same auth redirect and server data-loading behavior.
2. `AthleteProfileHub` keeps the same profile snapshot, local draft, section disclosure, readiness recommendation, save/reset/delete, and feedback semantics.
3. The page shell/header/back action visually align with My Library token/action hierarchy and avoid nested card sprawl.
4. The `Profile readiness` panel uses the current token/card/action direction while preserving readiness counts, recommended action, and section-open behavior.
5. No profile business logic, data persistence, API routes, analytics, Help/Guide, or support workflow changes are introduced.
6. Focused tests pass and screenshot handoff is captured before broad gates.
7. Canonical AW-006 queue and design inventory record this selected slice without stale active references.
8. Work stops after screenshot handoff until owner approval.

## Validation

Targeted during implementation:

- `./node_modules/.bin/vitest run tests/unit/athlete-profile-page.test.tsx tests/unit/athlete-profile-hub.test.tsx` - PASS, 2 files / 10 tests.
- `env PW_PORT=3100 NEXT_DIST_DIR=.next-playwright SITE_LOCK_ENABLED=0 npx playwright test tests/e2e/my-library-athlete-profile.spec.ts --project=desktop-chromium` - completed with 2 expected environment skips because local dev auth bypass could not sign in against the configured Supabase endpoint; no deterministic product failure was observed.
- `npm run typecheck` - PASS.
- `npm run lint:quality-gates` - PASS.
- `npm run lint:briefs -- --all` - PASS.
- `git diff --check` - PASS.
- Route/label/support sweep for the identifiers listed above - PASS; expected references only in profile route/component/tests, this active brief, canonical AW-006 queue, design inventory, and existing support runbook. No Help/Guide, support, API, or analytics fallout found.

Visual gate:

- Started local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
- Captured `before/after` desktop and mobile screenshots using a temporary local harness with deterministic profile data because local auth-backed capture was blocked by Supabase/dev-login egress.
- Temporary capture route/script were removed after capture; no committed product-rendering file changed after final capture.
- Screenshot metadata recorded 0 px horizontal overflow on desktop and mobile.
- Stop for owner screenshot approval before `npm run verify:pre-pr`, PR creation, and `npm run verify:pre-merge`.

After owner screenshot approval:

- `npm run verify:pre-pr` - PASS full lane; lint/quality gates/typecheck/unit/build/perf/E2E passed with 101 browser tests passed and 487 expected environment skips.
- PR `#872` opened and shipped as squash commit `1e0c41d`.
- Required CI checks passed; one initial `e2e-smoke` run timed out during Playwright install after 100% browser download, and the rerun passed.
- `npm run verify:pre-merge` - PASS full lane with 101 browser tests passed and 487 expected environment skips; marker `artifacts/verify-pre-merge/20260527-065145.json`.

## Manual QA / Screenshot Handoff

Required because this changes visible UI/layout.

- Capture type: `before/after`.
- Required viewports:
  - desktop `/my-library/profile`,
  - mobile `/my-library/profile`.
- Artifact folder pattern:
  - `output/aw006-my-swim-profile-token-parity-YYYY-MM-DD-HHMMSS/`
- Captured artifact folder:
  - `output/aw006-my-swim-profile-token-parity-2026-05-27-070555/`
- Captured:
  - `2026-05-27 07:06` Europe/Oslo.
- Screenshot filenames:
  - `before-profile-desktop.png`
  - `after-profile-desktop.png`
  - `before-profile-mobile.png`
  - `after-profile-mobile.png`
- Stop after screenshot handoff for owner approval before `npm run verify:pre-pr`.

## Checkpoint Log

- `2026-05-27 | in-progress | owner approved My Swim Profile Workspace Token And Action Hierarchy Parity after fresh queue/design/code re-audit from clean main@fa8b2fa; branch aw-006-my-swim-profile-token-parity created; scope is limited to /my-library/profile route shell/header/back action plus AthleteProfileHub readiness panel visual parity, focused tests, queue/inventory docs, and screenshot-reviewed UI parity | next: implement scoped visual parity and targeted validation, then capture screenshot handoff before broad gates`
- `2026-05-27 | implemented + targeted validation | aligned /my-library/profile route shell/header/back action and AthleteProfileHub readiness panel with My Library token/action hierarchy, added focused route/hub/e2e assertions, updated canonical queue and design inventory, passed targeted Vitest/typecheck/brief lint/quality lint/diff check/route-label-support sweep, and confirmed the local browser e2e route is environment-skipped by dev-login/Supabase egress rather than a product regression | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-05-27 | screenshot handoff ready | captured before/after desktop and mobile screenshots in output/aw006-my-swim-profile-token-parity-2026-05-27-070555 using a temporary local harness with deterministic profile data because local auth-backed capture was blocked; temporary capture route/script were removed after capture; no committed product-rendering file changed after final capture | next: wait for owner screenshot approval before npm run verify:pre-pr`
- `2026-05-27 | screenshot approved | owner approved the before/after screenshot handoff for /my-library/profile token/action hierarchy parity; no committed product-rendering file changed after final capture | next: run npm run verify:pre-pr before PR creation`
- `2026-05-27 | pre-pr verified | npm run verify:pre-pr passed the full lane with 101 browser tests passed and 487 expected environment skips; perf budget trend recommendation was hold because worst margin was 14.0% against the 15.0% tighten threshold | next: commit, push, and open/update PR`
- `2026-05-27 | shipped | PR #872 merged as squash commit 1e0c41d after screenshot approval, local pre-PR, CI, and local pre-merge gates passed; post-merge preflight surfaced the expected repo-managed docs-only closeout | next: complete closeout PR, rerun post-merge preflight, then complete mandatory chat-handoff assessment before any new AW-006 slice`

## Completion Record

- `completed`: `2026-05-27`
- `merged_pr`: `#872`
- `squash_commit`: `1e0c41d`
- `result`: Closed AW-006 My Swim Profile Workspace Token And Action Hierarchy Parity. My Swim Profile now matches the newer My Library workspace shell/action/readiness-panel hierarchy while preserving profile data, APIs, local drafts, analytics, section order, readiness scoring, Help/Guide, and support behavior.
- `validation`: Targeted Vitest PASS, typecheck PASS, quality/brief/diff/sweep gates PASS, screenshot handoff approved, `npm run verify:pre-pr` PASS, required CI PASS after one Playwright-install rerun, `npm run verify:pre-merge` PASS.
- `10/10 claim`: yes - all critical target categories reached `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                                                      | Gaps / Notes |
| --------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | Route/action review, focused tests, PR #872                                                                                   | No gap.      |
| UX flow clarity                               | `5/5`          | Approved screenshot handoff and focused route/readiness assertions                                                            | No gap.      |
| Visual design quality                         | `5/5`          | Before/after screenshots in `output/aw006-my-swim-profile-token-parity-2026-05-27-070555`; no horizontal overflow in metadata | No gap.      |
| Business logic correctness and data integrity | `5/5`          | Changed-files review and targeted unit/E2E assertions; no profile API/data contract changes                                   | No gap.      |
| Accessibility (a11y)                          | `5/5`          | Testing Library route assertions, E2E auth/navigation assertions, keyboard-reachable action semantics preserved               | No gap.      |
| Performance (CWV + payloads)                  | `5/5`          | No new dependency/media/API calls; perf budgets PASS with hold recommendation                                                 | No gap.      |
| Reliability and failure handling              | `5/5`          | Existing offline/draft/error/success states preserved; focused hub tests PASS                                                 | No gap.      |
| Security and authz                            | `5/5`          | Auth redirect contract covered; no protected data boundary change                                                             | No gap.      |
| Content governance                            | `5/5`          | Queue, design inventory, and this closeout updated; brief lint PASS                                                           | No gap.      |
| i18n operational readiness                    | `5/5`          | Screenshot text-fit review and route/action tests avoid tight fixed-width assumptions                                         | No gap.      |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing route, `AthleteProfileHub`, Tailwind tokens, and tests; no dependency added                                   | No gap.      |
| Testing and QA automation                     | `5/5`          | Targeted Vitest, full `verify:pre-pr`, CI, and full `verify:pre-merge` PASS                                                   | No gap.      |
| DevOps and rollback readiness                 | `5/5`          | Squash commit `1e0c41d`; rollback via `git revert 1e0c41d`; no migration/config rollback needed                               | No gap.      |
