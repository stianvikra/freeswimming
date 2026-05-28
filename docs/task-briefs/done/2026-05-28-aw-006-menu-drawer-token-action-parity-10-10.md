# Task Brief: AW-006 Menu Drawer Token And Action Hierarchy Parity (10/10)

## Metadata

- `id`: `2026-05-28-aw-006-menu-drawer-token-action-parity-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-28`
- `updated`: `2026-05-28`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `related_parent_brief`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `execution_mode`: `end-to-end after owner explicitly said execute; visual screenshot approval stop applies before pre-PR/PR/pre-merge gates`

## Brief Audit Record

- `last_audited`: `2026-05-28`
- `base`: `main@2d04341`
- `audit_status`: `ready`
- `decision`: Execute this as the current AW-006 PR-sized visual slice through screenshot handoff.
- `reason`: `main` is clean and synced at `2d04341`; PR `#888` and repo-managed closeout PR `#889` are merged; `npm run post-merge:preflight` was reported green with no pending closeout. A fresh queue/design/code re-audit found no active AW-006 implementation slice selected and found `components/MenuDrawer.tsx` still using older route-local gradients, large radius values, local status pills, and custom action styling while the current My Library, auth, guide, and course backup surfaces use newer AW-006 token/action hierarchy. The owner approved this slice by saying `godkjent` and then explicitly said `execute`.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `components/MenuDrawer.tsx`, `SiteChrome`, `MobileSegmentedNav`, `PressButton`, `PressLink`, `InstallFeedback`, course lesson/progress drawer contracts, install prompt behavior, screenshot handoff rules, forward compatibility rules, or verification lanes change before implementation.

## Goal

Align the shared navigation menu and course drawer surfaces with the current AW-006 token/action hierarchy while preserving navigation, course progress, and install prompt behavior.

## Pre-Implementation Owner Explanation

For ikke-programmerer: Vi rydder mobilmenyen og kursmenyen visuelt slik at kort, statusfelt og knapper ligner de nyeste My Library-, auth- og course-flatene.

Hvorfor det betyr noe: Menyen brukes på tvers av appen, og den gamle lokale stilen gjør at appen føles mindre helhetlig selv om funksjonen virker.

Utenfor scope: Vi endrer ikke navigasjonslogikk, kursprogresjon, leksjonsdata, installprompt-logikk, API-er, analytics, Help/Guide, supportflyt eller bred app-redesign.

Fremoverkompatibilitet: Nye hovedmenyvalg, course-moduler og leksjoner skal arve samme kort-, status- og action-hierarki fra datadrevet rendering. Nye menyseksjoner, nye prompt-typer eller nye navigasjonsmoduser krever eksplisitt mapping, tester og screenshot-evidence.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Data placement and sync boundaries`
- `Reliability and failure handling`
- `Security and authz`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                       | Evidence                                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The menu still provides the same Main/Close/Lessons navigation model, the same active-page/course context through selected cards, and the same user jobs with clearer visual hierarchy.  | code review + focused e2e                                | `5/5`                   |
| UX flow clarity                               | `target`     | Main menu cards, install card, course progress card, module rows, lesson rows, and drawer bottom actions are easier to scan without changing workflow labels, destinations, or sequence. | before/after screenshots + focused e2e                   | `5/5`                   |
| Visual design quality                         | `target`     | Replace older one-off gradients/large radii/custom pills where practical with existing AW-006 token/card/action patterns; mobile screenshots show no text overlap or incoherent nesting. | screenshot handoff + class assertions                    | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Course lesson selection, active lesson, done/in-progress counts, module expansion, install feedback state, and close behavior remain unchanged.                                          | targeted tests + changed-files review                    | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor, content CRUD, publish workflow, operator queue, admin note, QR, or email-template surface.                                                     | explicit admin-editor scope rationale                    | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Dialog label, close button, segmented navigation, module disclosure controls, lesson buttons, install status live regions, focus rings, and touch targets remain accessible.             | Playwright role assertions + screenshot/keyboard review  | `5/5`                   |
| Accessibility                                 | `target`     | Closeout validation alias for the same accessibility gate above; dialog controls, lesson buttons, install status regions, focus rings, and touch targets remain accessible.              | Playwright role assertions + screenshot/keyboard review  | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no new dependency, media asset, route fetch, polling loop, or meaningful JS payload growth is planned; `/course` budgets remain unchanged.                              | dependency diff + pre-PR gate                            | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Existing state remains local UI state or existing course/install state; this slice adds no server-canonical data, browser storage key, sync mutation, or conflict behavior.              | data-boundary review + unchanged storage/API diff        | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this changes no fetch path, route cache mode, revalidation, API response, or invalidation behavior.                                                                          | explicit cache scope rationale                           | `N/A`                   |
| Reliability and failure handling              | `target`     | Install accepted/dismissed/unsupported/iOS/Mac Safari feedback, current lesson highlighting, module expansion, and scroll hint remain deterministic.                                     | existing install/nav e2e + focused regression checks     | `5/5`                   |
| Security and authz                            | `target`     | Menu rendering must not change protected route access, auth redirects, entitlement checks, course progress authorization, install permissions, or safe external behavior.                | changed-files review + unchanged route/API diff          | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: the drawer continues to show only already-visible navigation, account/install, and course progress state; no new personal data, raw email, token, or provider detail.   | copy/data review                                         | `4/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this planned brief, and design inventory record the selected slice without marking implementation active before explicit execution.                              | docs diff + brief lint                                   | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin role, workflow label, Help/Guide action, support recovery procedure, operator edit path, or admin mutation.                                            | explicit admin-workflow scope rationale                  | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no route metadata, sitemap, robots, canonical URL, structured data, public indexability, or crawl-safe content model.                                           | explicit SEO scope rationale                             | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no public semantic content model, structured data, entity page, canonical public docs, or AI-facing discoverability contract.                                   | explicit AI-discoverability scope rationale              | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this changes no analytics event taxonomy, payload, persistence, dashboard, KPI definition, or consent behavior.                                                              | explicit analytics scope rationale                       | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no pricing, catalog, checkout, entitlement, billing portal, invoice, refund, payout, revenue report, or finance behavior.                                       | explicit commerce/revenue scope rationale                | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident path, alert, support diagnostic, recovery workflow, runbook procedure, or support escalation behavior.                                                     | explicit support-ops scope rationale                     | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                                 | explicit finance scope rationale                         | `N/A`                   |
| i18n operational readiness                    | `target`     | Existing labels and short status copy remain layout-safe under tokenized cards/actions, without fixed-width assumptions that block later localization.                                   | mobile/desktop screenshot text-fit review                | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `MenuDrawer`, `MobileSegmentedNav`, `PressButton`, `PressLink`, `InstallFeedback`, and existing AW-006 CSS tokens; add no dependency or broad primitive.                           | changed-files/dependency diff                            | `5/5`                   |
| Testing and QA automation                     | `target`     | Add or update focused assertions for token/action classes and preserve existing menu/course/install e2e behavior; screenshot handoff must happen before broad gates.                     | targeted Vitest/e2e + screenshot artifacts + later gates | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: visual class changes add no backend polling, storage, image pipeline, scheduled job, third-party call, or traffic-dependent platform cost.                              | implementation review                                    | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: rollback is a normal component/test/docs revert with no migration, config, secret, package, workflow, or deployment setting change.                                     | git diff + screenshot artifacts + later gate logs        | `4/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep `MenuDrawer` as the existing client component used by `SiteChrome` and `/course`.
  - Preserve the existing `SiteChrome` route integration, `mobileNavMode`, drawer open/close behavior, course drawer props, and bottom-bar integration.
  - Do not change route cache behavior, server actions, API routes, auth redirects, or course content loading.
- TypeScript/domain contracts:
  - Preserve `MainItem`, `CourseModule`, `CourseLesson`, `CourseLessonProgressStatus`, active route detection, module expansion state, lesson selection callback, install feedback states, and progress status derivation.
  - No parser, validation, or error model change is planned.
- Supabase/data layer:
  - N/A; no migration, RLS/authz rule, generated DB type, query, storage, index, or data access change.
- External services/tools:
  - N/A; no Supabase provider setting, Stripe, email, analytics vendor, webhook, secret, SDK, retry policy, or observability integration change.
- UI system:
  - Reference surfaces: `MyLibraryHub` token cards/actions, recently aligned `/auth/sign-in`, course backup prompt, guide tracker action shell, and `MobileSegmentedNav`.
  - Reuse `fs-library-card`, `fs-library-card-accent`, `fs-library-card-muted`, `fs-cta-primary`, `fs-cta-secondary`, `PressButton`, `PressLink`, and `InstallFeedback` where they fit.
  - Screenshot handoff type: `before/after` for mobile main menu and mobile course menu; add desktop/tablet menu if the implementation materially affects wider layouts.
- Testing:
  - Reuse/update focused E2E coverage in `tests/e2e/mobile-nav.spec.ts`, `tests/e2e/course-nav-contextual.spec.ts`, `tests/e2e/drawer-focus-trap.spec.ts`, and `tests/e2e/install-prompt.spec.ts`.
  - Add unit/component assertions only if the implementation introduces reusable class constants or testable token contracts.

## Data Placement And Sync Contract

Existing state boundaries remain unchanged.

- Server-canonical data:
  - None added by this slice. Existing signed-in course progress, entitlements, auth, and commerce data remain owned by their current route/API contracts.
- Local/UI data:
  - Drawer open state, selected view, open module ID, menu tip seen flag, install feedback UI state, and course local progress display remain browser/UI-local as today.
- Sync policy:
  - Existing course progress sync and install prompt behavior remain unchanged; this slice changes presentation only.
- Retention and sensitivity:
  - No new personal data, secret, token, email, raw provider diagnostic, or payment detail is stored or displayed.
- Cache/invalidation:
  - No route/data cache mode or invalidation event changes.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, alias, redirect, rename rule, or migration behavior. Existing course lesson/module IDs and nav hrefs are consumed as today.

## Forward Compatibility Contract

- Extensibility surfaces touched:
  - Main menu items passed into `MenuDrawer`.
  - Course modules, course lessons, lesson progress statuses, install prompt feedback states, and drawer bottom nav items.
- Source of truth:
  - Main menu cards continue to render from the `mainItems` prop.
  - Course rows continue to render from `course.modules` or `COURSE_MODULES`.
  - Progress status continues to derive from `lessonProgressStatusById`, done lesson IDs, and done-gate checks.
  - Install feedback continues to derive from `useInstallContext` and `InstallFeedback`.
- Additive behavior:
  - New main menu links, course modules, course lessons, and known progress statuses should inherit the same card/action hierarchy automatically through mapped rendering.
  - New course lessons should still count in totals and render in module lists without hardcoded IDs.
- Explicit mapping requirements:
  - A new drawer view, new bottom-nav mode, new install feedback tone, new course progress status, or new non-course menu section requires explicit copy/class/test mapping before release.
- Unknown or deprecated values:
  - Unknown route paths fall back to the existing generic active-page label behavior.
  - Unknown or missing lesson progress values should continue to fall back to not-started treatment.
  - Unsupported install paths must keep safe generic browser-support guidance.
- Test/evidence:
  - Focused E2E should prove main menu navigation, course drawer lesson selection, install feedback, and focus trap still work.
  - Route/label/support sweep covers changed menu labels, test IDs, and install/course drawer support surfaces.

## Help / Guide Impact

N/A with rationale: this planned slice preserves visible workflow labels, navigation destinations, install recovery behavior, course progress behavior, support procedures, and operator-facing instructions. Help/Guide or runbook updates are required only if implementation changes labels, workflow meaning, recovery behavior, support procedure, payments, auth, or private-gate behavior.

## Route / Label / Support Surface Sweep

Required before broad gates because this slice touches shared navigation/menu UI, course menu UI, and install action presentation.

- Identifiers to search:
  - `MenuDrawer`
  - `Navigation menu`
  - `Main menu`
  - `Course menu`
  - `Install app`
  - `main-menu-install`
  - `Course progress in menu`
  - `course-menu-lesson`
  - `MobileSegmentedNav`
  - `MENU_TIP_SEEN_KEY`
- Surfaces to check:
  - `components/MenuDrawer.tsx`
  - `components/SiteChrome.tsx`
  - `components/install/`
  - `components/ui/`
  - `app/course/page.tsx`
  - `tests/e2e/mobile-nav.spec.ts`
  - `tests/e2e/course-nav-contextual.spec.ts`
  - `tests/e2e/drawer-focus-trap.spec.ts`
  - `tests/e2e/install-prompt.spec.ts`
  - `tests/e2e/mobile-screenshots.spec.ts`
  - `docs/runbooks/`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/task-briefs/done/`
- Expected fallout:
  - planned/in-progress brief,
  - canonical AW-006 queue,
  - design inventory,
  - focused menu/course/install tests,
  - screenshot artifacts,
  - no API, course content, auth, Supabase, Stripe, entitlement, analytics, Help/Guide, or support-procedure change unless implementation discovers label/support fallout.
- Sweep execution evidence (`2026-05-28`):
  - Identifiers searched: `MenuDrawer`, `Navigation menu`, `Main menu`, `Course menu`, `Install app`, `main-menu-install`, `Course progress in menu`, `course-menu-lesson`, `MobileSegmentedNav`, `MENU_TIP_SEEN_KEY`.
  - Directories/surfaces checked: `components/`, `app/`, `tests/`, and `docs/` with `docs/task-briefs/done/**` excluded from the active fallout scan.
  - Fallout handled: implementation/test fallout is limited to `components/MenuDrawer.tsx`, `tests/e2e/mobile-nav.spec.ts`, `tests/e2e/course-nav-contextual.spec.ts`, this brief, the AW-006 queue, and the design inventory. Existing `docs/user-flow-map.md`, install prompt tests, screenshot tests, `SiteChrome`, `/course`, `MobileSegmentedNav`, and `InstallFeedback` references remain valid because workflow labels, destinations, install behavior, support procedures, Help/Guide content, and route meanings are unchanged. Visual review removed redundant drawer-header helper copy (`Navigate the site. Active: ...` and `Pick a module, then choose a lesson.`); the same context remains visible in active menu cards and course/module state.

## Scope

- `components/MenuDrawer.tsx` visual/card/action hierarchy for:
  - drawer shell/header/close action,
  - Main menu cards,
  - install app card and install feedback placement,
  - menu tip,
  - course progress summary card,
  - course module cards,
  - course lesson rows,
  - drawer bottom segmented actions where needed.
- Focused assertions for unchanged navigation/course/install behavior and token/action class adoption.
- Canonical AW-006 queue and design inventory updates.
- Before/after screenshot handoff artifacts during implementation.

## Out Of Scope

- `SiteChrome` route integration behavior, route list generation, auth redirects, protected route access, course content data, course lesson IDs, course progress API shape, localStorage keys, signed-in sync behavior, install prompt detection/native prompt behavior/local cadence, app manifest, service worker, analytics taxonomy, Supabase, Stripe, entitlement behavior, commerce, Help/Guide, support procedures, broad navigation redesign, broad design-system primitive, new dependencies, package/config/workflow changes, and merge without explicit owner approval.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves screenshots.

## Acceptance Criteria

1. Shared navigation menu still opens/closes, traps focus, and switches Main/Lessons views as today.
2. Main menu cards keep the same hrefs, active-route behavior, labels, and close-on-click behavior.
3. Course menu keeps the same module expansion, active lesson, lesson selection, done/in-progress states, and progress summary behavior.
4. Install app action keeps the same accepted/dismissed/already-installed/iOS/Mac Safari/unsupported behavior and accessible status region.
5. Drawer surfaces use current AW-006 token/card/action classes instead of older one-off radial-gradient/large-radius/custom CTA styling where practical.
6. Mobile and desktop/tablet screenshots show no text overlap, incoherent card nesting, or broken bottom action bar.
7. No route, API, course data, auth, install detection, analytics, Help/Guide, support, Supabase, Stripe, entitlement, package, config, or workflow behavior changes are introduced.
8. Focused tests and before/after screenshot handoff are completed before broad gates.
9. Work stops after screenshot handoff until owner approval.

## Validation

Targeted during implementation:

- `npm run lint:briefs`
- `npm run lint:quality-gates`
- `npm run typecheck`
- `npx playwright test tests/e2e/mobile-nav.spec.ts --project=mobile-chromium`
- `npx playwright test tests/e2e/course-nav-contextual.spec.ts --project=mobile-chromium`
- `npx playwright test tests/e2e/drawer-focus-trap.spec.ts --project=mobile-chromium`
- `npx playwright test tests/e2e/install-prompt.spec.ts --project=mobile-chromium`
- targeted route/label/support sweep with identifiers listed above
- `git diff --check`

Visual gate:

- Capture `before/after` screenshot artifacts for mobile main menu and mobile course menu.
- Artifact folder: `output/aw-006-menu-drawer-token-action-YYYY-MM-DD-HHMMSS`
- Representative filenames:
  - `before-menu-drawer-main-mobile-390.png`
  - `after-menu-drawer-main-mobile-390.png`
  - `before-menu-drawer-course-mobile-390.png`
  - `after-menu-drawer-course-mobile-390.png`
- Stop for owner screenshot approval before `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge`.

Broad gates after screenshot approval:

- `npm run verify:pre-pr`
- required CI checks green
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS/npm available through the repo's normal `nvm use --silent` path.
- Visual/dev-server and Playwright commands use the repo's escalation-first convention.

## Checkpoint Log

- `2026-05-28 | planned | selected by owner approval from clean main@2d04341 after PR #888 and repo-managed closeout #889; fresh queue/design/code re-audit found MenuDrawer as the next PR-sized AW-006 token/action parity slice; no implementation started | next: wait for explicit execute/build/implement instruction before moving this brief to in-progress and starting screenshot-reviewed implementation`
- `2026-05-28 | in-progress | owner explicitly said execute; created branch aw-006-menu-drawer-token-parity and moved this brief to in-progress | next: implement scoped MenuDrawer token/action parity, run targeted validation, and prepare screenshot handoff before broad gates`
- `2026-05-28 | screenshot-review | implemented scoped MenuDrawer token/action parity, added focused class assertions, completed targeted route/label/support sweep, captured before/after mobile screenshots in output/aw-006-menu-drawer-token-action-2026-05-28-213313, and passed targeted lint/typecheck/e2e/quality checks | next: wait for owner screenshot approval before npm run verify:pre-pr, commit, push, PR creation, CI monitoring, and npm run verify:pre-merge`
- `2026-05-28 | visual-correction | owner flagged drawer headers as too text-heavy; removed redundant helper copy from the header while preserving Main/Course titles, active card context, navigation destinations, and course/install behavior; reran focused lint/typecheck/quality and Playwright with 13 passed / 15 skipped; owner explicitly requested no new screenshot files for this correction | next: wait for owner visual approval or further correction before npm run verify:pre-pr`
- `2026-05-28 | pre-pr-green | owner approved the visual correction and requested merge on good tests; npm run verify:pre-pr passed the full lane, including 101 Playwright passed / 487 skipped | next: commit, push, open PR, monitor CI, run npm run verify:pre-merge, and merge if gates stay green`
- `2026-05-28 | merged | PR #890 shipped as squash commit 5edbe2742861b3aa3b71bbf454130bc617831e1d after local pre-PR, CI, and local pre-merge gates passed; post-merge preflight surfaced the expected repo-managed docs-only closeout | next: move brief to done and clear active queue/inventory references`
- `2026-05-28 | closeout | repo-managed docs-only closeout moved this brief to done, recorded completion evidence, and cleared stale active AW-006 queue/design-inventory references | next: run docs-only closeout gates, merge the closeout PR, rerun post-merge preflight, then complete chat-handoff assessment`

## Completion Record

- `completed`: `2026-05-28`
- `merged_pr`: `#890`
- `squash_commit`: `5edbe2742861b3aa3b71bbf454130bc617831e1d`
- `result`: Closed AW-006 Menu Drawer Token And Action Hierarchy Parity by aligning the shared main menu/course drawer cards, install action, course progress summary, module rows, lesson rows, and drawer actions with the current AW-006 token/action hierarchy while preserving navigation, course progress, install prompt behavior, APIs, analytics, Help/Guide, and support behavior.
- `validation`: targeted lint/typecheck/quality/e2e passed; screenshot handoff artifacts captured before the owner-requested no-new-screenshot header correction; `npm run verify:pre-pr` passed full lane with 101 Playwright passed / 487 skipped; PR #890 CI passed; `npm run verify:pre-merge` passed full lane with 101 Playwright passed / 487 skipped and PASS marker `artifacts/verify-pre-merge/20260528-202427.json`.
- `10/10 claim`: yes - all critical target categories reached `5/5`; visual screenshot regeneration after the final header-copy correction was intentionally waived by owner request (`ikke generer nye skjermbilder for dette`) and covered by focused tests plus owner approval.

| Category                                      | Achieved Score | Evidence                                                                                                                                                                                                 | Gaps / Notes                                                                                            |
| --------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | PR #890 code diff, `npm run verify:pre-pr`, CI, and `npm run verify:pre-merge` preserved Main/Lessons navigation, active context, and menu jobs.                                                         | None.                                                                                                   |
| UX flow clarity                               | `5/5`          | Shared card/action hierarchy landed; owner flagged header copy as too heavy, correction removed it, and owner approved merge on good tests.                                                              | No new manual screenshots were generated after the header correction per owner instruction.             |
| Visual design quality                         | `5/5`          | Before/after screenshot handoff in `output/aw-006-menu-drawer-token-action-2026-05-28-213313`, token class assertions, focused Playwright, owner approval, and full gates.                               | Final header-copy visual was owner-approved without refreshed screenshot artifacts by explicit request. |
| Business logic correctness and data integrity | `5/5`          | Targeted menu/course/install/focus tests, full Playwright, and changed-files review show course lesson selection, progress counts, module expansion, install feedback, and close behavior stayed intact. | None.                                                                                                   |
| Accessibility (a11y)                          | `5/5`          | Focus trap coverage, Playwright role/status assertions, full E2E matrix, and unchanged dialog/button semantics.                                                                                          | None.                                                                                                   |
| Accessibility                                 | `5/5`          | Same accessibility closeout gate as the canonical `Accessibility (a11y)` row; the explicit alias satisfies current done-brief 10/10 validation.                                                          | None.                                                                                                   |
| Data placement and sync boundaries            | `5/5`          | Changed-files review confirmed no new storage key, API, server-canonical data, sync mutation, or conflict behavior.                                                                                      | None.                                                                                                   |
| Reliability and failure handling              | `5/5`          | Install prompt states, course navigation states, and menu focus behavior covered by targeted and full E2E gates.                                                                                         | None.                                                                                                   |
| Security and authz                            | `5/5`          | No protected route/API/authz/entitlement changes; full local and CI gates passed.                                                                                                                        | None.                                                                                                   |
| Content governance                            | `5/5`          | This closeout moves the brief to done and clears stale AW-006 queue/design-inventory active references.                                                                                                  | None.                                                                                                   |
| i18n operational readiness                    | `5/5`          | Header helper copy was removed, tokenized cards/actions avoid fixed-width assumptions, and full responsive E2E passed.                                                                                   | None.                                                                                                   |
| Stack-fit and dependency discipline           | `5/5`          | Reused `MenuDrawer`, `MobileSegmentedNav`, `PressButton`, `PressLink`, `InstallFeedback`, and existing AW-006 token classes; no dependency/config changes.                                               | None.                                                                                                   |
| Testing and QA automation                     | `5/5`          | Targeted tests, `npm run verify:pre-pr`, CI, and `npm run verify:pre-merge` passed.                                                                                                                      | None.                                                                                                   |
