# Task Brief: AW-006 Course Support Card Token And Action Hierarchy Parity (10/10)

## Metadata

- `id`: `2026-05-29-aw-006-course-support-card-token-action-parity-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-29`
- `updated`: `2026-05-29`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `related_parent_brief`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `execution_mode`: `end-to-end after owner explicitly said execute; visual screenshot approval stop applies before pre-PR/PR/pre-merge gates`

## Brief Audit Record

- `last_audited`: `2026-05-29`
- `base`: `main@92febbf`
- `audit_status`: `ready`
- `decision`: Execute this as the current AW-006 PR-sized visual slice through screenshot handoff.
- `reason`: PR `#890` Menu Drawer Token And Action Hierarchy Parity and repo-managed closeout PR `#891` are merged; `main` is clean and synced at `92febbf`; `npm run post-merge:preflight` was reported green with no pending closeout. A fresh queue/design/code re-audit found no active AW-006 implementation slice selected and found the `/course` `Need extra help?` support card still using route-local rounded card and action styling while adjacent `/course` backup prompt, Menu Drawer, My Library, auth, and guide surfaces now use AW-006 token/action hierarchy. The owner approved this slice by saying `godkjent` and then explicitly said `execute AW-006 Course Support Card Token And Action Hierarchy Parity`.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/course`, `SUPPORT_ACTION_ORDER`, `SUPPORT_ACTION_META`, `CourseOpenOnPhoneCard`, course support-card e2e coverage, course content/support-card admin controls, screenshot handoff rules, forward compatibility rules, or verification lanes change before implementation.

## Goal

Align the `/course` `Need extra help?` support card and support-action hierarchy with current AW-006 token/card/action patterns while preserving course content, support action mapping, and QR/share/copy behavior.

## Pre-Implementation Owner Explanation

For ikke-programmerer: Vi rydder bare hjelpekortet nederst i kursleksjonen, der brukeren kan gå til videoanalyse, Poolside Guide eller andre støttevalg.

Hvorfor det betyr noe: Kortet er en viktig vei fra gratis kurs til relevant hjelp, men det bruker fortsatt eldre lokal knappestil og føles mindre helhetlig enn de nyeste AW-006-flatene.

Utenfor scope: Vi endrer ikke kursinnhold, hvilke støttevalg som vises, lenker, QR-/dele-/kopier-funksjon, progresjon, auth, API-er, analytics, Help/Guide, supportprosedyrer eller bred kursredesign.

Fremoverkompatibilitet: Nye support actions skal fortsatt komme fra eksisterende course support metadata og arve samme primær-/sekundærhierarki automatisk. Nye action-typer, nye støtteområder eller endret kjøps-/supportflyt krever eksplisitt mapping, tester og screenshot-evidence.

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

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                         | Evidence                                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | `/course` still presents the same lesson support job after the same course-content conditions, with support actions and Open-on-phone utility clearly grouped.                             | code review + focused e2e                              | `5/5`                   |
| UX flow clarity                               | `target`     | `Need extra help?` keeps the same explanatory copy, action order, destinations, and primary highlight while using clearer primary/secondary visual hierarchy.                              | before/after screenshots + focused e2e                 | `5/5`                   |
| Visual design quality                         | `target`     | Support card uses current AW-006 token/card/action classes where practical instead of older route-local rounded card, gradient CTA, and ring action styling; no text overlap on mobile.    | screenshot handoff + class/diff review                 | `5/5`                   |
| Business logic correctness and data integrity | `target`     | `SUPPORT_ACTION_ORDER`, enabled action filtering, `primaryAction`, support start threshold, active lesson state, and `CourseOpenOnPhoneCard` props/placement remain unchanged.             | targeted tests + changed-files review                  | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes no admin editor, content CRUD, support-card admin controls, publish workflow, operator queue, Context Notes, QR Registry, or email-template surface.        | explicit admin-editor scope rationale                  | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Card heading, support links, Open-on-phone controls, QR/share/copy feedback semantics, focus rings, contrast, and touch targets remain accessible and named.                               | Playwright role assertions + screenshot review         | `5/5`                   |
| Accessibility                                 | `target`     | Closeout validation alias for the same accessibility gate above; support links, Open-on-phone controls, focus rings, contrast, and touch targets remain accessible and named.              | Playwright role assertions + screenshot review         | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no new dependency, media asset, route fetch, polling loop, or meaningful JS payload growth is planned; `/course` budgets remain unchanged.                                | dependency diff + pre-PR gate                          | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Existing state remains current course content/progress/UI state; this slice adds no server-canonical data, browser storage key, sync mutation, or conflict behavior.                       | data-boundary review + unchanged storage/API diff      | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this changes no course content fetch path, route cache mode, revalidation, API response, or invalidation behavior.                                                             | explicit cache scope rationale                         | `N/A`                   |
| Reliability and failure handling              | `target`     | Support action rendering stays deterministic for default, disabled, and primary-highlight configurations; Open-on-phone QR/copy/share feedback behavior remains unchanged.                 | existing support-card e2e + unchanged component review | `5/5`                   |
| Security and authz                            | `target`     | Support links keep existing destinations and do not change protected route access, entitlement checks, QR redirect safety, auth redirects, or external link behavior.                      | changed-files review + unchanged route/API diff        | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: the card continues to show only route-visible lesson support options and stores no new personal data, raw email, token, payment detail, or provider diagnostic.           | copy/data review                                       | `4/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this planned brief, and design inventory record the selected planned slice without marking implementation active before explicit execution.                        | docs diff + brief lint                                 | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin role, workflow label, Help/Guide action, support recovery procedure, operator edit path, course content editing, or admin mutation.                      | explicit admin-workflow scope rationale                | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no route metadata, sitemap, robots, canonical URL, structured data, public indexability, or crawl-safe content model.                                             | explicit SEO scope rationale                           | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no public semantic content model, structured data, entity page, canonical public docs, or AI-facing discoverability contract.                                     | explicit AI-discoverability scope rationale            | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this changes no analytics event taxonomy, payload, persistence, dashboard, KPI definition, attribution, or consent behavior.                                                   | explicit analytics scope rationale                     | `N/A`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: this support card can route to commercial/support surfaces, but the slice changes no pricing, catalog, checkout, entitlement, billing, refund, payout, or reporting flow. | commerce behavior unchanged review                     | `4/5`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident path, alert, support diagnostic, recovery workflow, runbook procedure, or support escalation behavior.                                                       | explicit support-ops scope rationale                   | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, revenue recognition data, or reporting operation.              | explicit finance scope rationale                       | `N/A`                   |
| i18n operational readiness                    | `target`     | Existing labels and short support copy remain layout-safe under tokenized cards/actions, without fixed-width assumptions that block later localization.                                    | mobile/desktop screenshot text-fit review              | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing `/course` component boundary, `PressLink`, `CourseOpenOnPhoneCard`, and AW-006 CSS tokens; add no dependency or broad primitive.                                            | changed-files/dependency diff                          | `5/5`                   |
| Testing and QA automation                     | `target`     | Update or reuse focused support-card assertions for default actions, mobile QR visibility, and token/action adoption; screenshot handoff must happen before broad gates.                   | targeted e2e + screenshot artifacts + later gates      | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: visual class changes add no backend polling, storage, image pipeline, scheduled job, third-party call, or traffic-dependent platform cost.                                | implementation review                                  | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: rollback is a normal component/test/docs revert with no migration, config, secret, package, workflow, or deployment setting change.                                       | git diff + screenshot artifacts + later gate logs      | `4/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep the existing `/course` client component boundary and `CourseOpenOnPhoneCard` child component.
  - Preserve `SUPPORT_ACTION_ORDER`, `SUPPORT_ACTION_META`, enabled-action filtering, configured primary action behavior, support start threshold, and active lesson routing.
  - Do not change course content APIs, route cache, server actions, auth redirects, or preview behavior.
- TypeScript/domain contracts:
  - Preserve `CourseSupportActionId`, `CourseSupportCard`, course lesson display flags, active lesson state, and support action href/label metadata.
  - No parser, validation, storage, or error model change is planned.
- Supabase/data layer:
  - N/A; no migration, RLS/authz rule, generated DB type, query, storage, index, or data access change.
- External services/tools:
  - N/A; no Supabase provider setting, Stripe, email, analytics vendor, webhook, secret, SDK, retry policy, or observability integration change.
- UI system:
  - Reference surfaces: recently aligned course backup prompt, Menu Drawer token/action hierarchy, My Library token cards/actions, guide tracker action shell, and `CourseOpenOnPhoneCard` feedback semantics.
  - Reuse `fs-library-card`, `fs-library-card-muted` or `fs-library-card-accent` only where they fit; use `fs-cta-primary`/`fs-cta-secondary` and `PressLink` for support actions.
  - Screenshot handoff type: `before/after` for `/course` support card on mobile and desktop.
- Testing:
  - Reuse/update `tests/e2e/course-support-card-actions.spec.ts`.
  - Add unit/component coverage only if implementation extracts new helper constants or contracts.

## Data Placement And Sync Contract

Existing state boundaries remain unchanged.

- Server-canonical data:
  - None added by this slice. Existing course content, signed-in progress, entitlements, auth, and commerce data remain owned by their current route/API contracts.
- Local/UI data:
  - Active lesson, lesson display, support card visibility, QR/copy/share UI state, and route-local progress display remain as today.
- Sync policy:
  - Existing course progress sync and Open-on-phone QR/share/copy feedback behavior remain unchanged; this slice changes presentation only.
- Retention and sensitivity:
  - No new personal data, secret, token, email, raw provider diagnostic, or payment detail is stored or displayed.
- Cache/invalidation:
  - No route/data cache mode or invalidation event changes.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, alias, redirect, rename rule, or migration behavior. Existing course lesson/module IDs, support action IDs, hrefs, and labels are consumed as today.

## Forward Compatibility Contract

- Extensibility surfaces touched:
  - Course support actions, active lesson support-card config, support action primary-highlight setting, and Open-on-phone utility placement.
- Source of truth:
  - Support action rendering continues to derive from `SUPPORT_ACTION_ORDER`, `SUPPORT_ACTION_META`, `activeLesson.supportCard?.actions`, and `activeLesson.supportCard?.primaryAction`.
- Additive behavior:
  - Newly enabled existing support actions should inherit the same card/action hierarchy automatically through mapped rendering.
  - New lessons/modules keep support-card behavior when their content enables support fields.
- Explicit mapping requirements:
  - A new support action ID, new support-card section, new purchase/support destination, or new primary-action semantics requires explicit metadata/copy/test/doc mapping before release.
- Unknown or deprecated values:
  - Unknown `primaryAction` values continue to fall back to no highlighted primary action because existing code only honors IDs present in the enabled action list.
  - Missing support-card config continues to use existing default video-analysis and poolside-guide behavior.
- Test/evidence:
  - Focused E2E proves default action visibility, hidden optional actions, mobile Open-on-phone behavior, and unchanged support-card render path.

## Help / Guide Impact

N/A with rationale: this planned slice preserves visible workflow labels, support destinations, QR/share/copy recovery behavior, course progress behavior, support procedures, and operator-facing instructions. Help/Guide or runbook updates are required only if implementation changes labels, workflow meaning, recovery behavior, support procedure, payments, auth, or private-gate behavior.

## Route / Label / Support Surface Sweep

Required before broad gates because this slice touches `/course` user-visible support actions.

- Identifiers to search:
  - `Need extra help?`
  - `SUPPORT_ACTION_ORDER`
  - `SUPPORT_ACTION_META`
  - `supportCard`
  - `primaryAction`
  - `CourseOpenOnPhoneCard`
  - `course-support-card-actions`
  - `Video Analysis (Optional)`
  - `Poolside Guide`
  - `0-1000 Guide`
  - `Contact us`
- Surfaces to check:
  - `app/course/page.tsx`
  - `app/course/courseData.ts`
  - `components/course/CourseOpenOnPhoneCard.tsx`
  - `tests/e2e/course-support-card-actions.spec.ts`
  - `tests/e2e/install-prompt.spec.ts`
  - `tests/e2e/course-progress-sync.spec.ts`
  - `tests/unit/qr-admin-payload.test.ts`
  - `docs/runbooks/`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/task-briefs/done/`
- Expected fallout:
  - planned/in-progress brief,
  - canonical AW-006 queue,
  - design inventory,
  - focused course support-card tests,
  - screenshot artifacts,
  - no API, course content, auth, Supabase, Stripe, entitlement, analytics, Help/Guide, or support-procedure change unless implementation discovers label/support fallout.
- Sweep execution evidence (`2026-05-29`):
  - Identifiers searched: `Need extra help?`, `SUPPORT_ACTION_ORDER`, `SUPPORT_ACTION_META`, `supportCard`, `primaryAction`, `CourseOpenOnPhoneCard`, `course-support-card-actions`, `Video Analysis (Optional)`, `Poolside Guide`, `0-1000 Guide`, `Contact us`.
  - Surfaces checked: `app/course/`, `components/course/`, `tests/e2e/`, `tests/unit/`, `docs/`, `docs/runbooks/`, active/planned/in-progress task briefs, and non-done design inventory references.
  - Fallout handled: implementation/test/docs updates are limited to `app/course/page.tsx`, `tests/e2e/course-support-card-actions.spec.ts`, this active brief, the AW-006 queue, and the design inventory. Existing `docs/user-flow-map.md`, app-knowledge references, admin content support-card controls, QR tests, and runbook references remain valid because workflow labels, destinations, support procedures, course content, QR/share/copy behavior, auth, analytics, Help/Guide, and operator instructions are unchanged.

## Scope

- `/course` `Need extra help?` support card visual/card/action hierarchy:
  - card shell,
  - support-action links,
  - primary-highlight treatment,
  - secondary action treatment,
  - spacing around `CourseOpenOnPhoneCard`.
- Focused assertions for unchanged support action visibility and Open-on-phone mobile behavior.
- Canonical AW-006 queue and design inventory updates.
- Before/after screenshot handoff artifacts during implementation.

## Out Of Scope

- Course content data, course lesson IDs, module order, support action order, support action labels, support action destinations, admin support-card controls, QR redirect route, QR asset generation, copy/share behavior, progress API shape, localStorage keys, signed-in sync behavior, auth provider behavior, analytics taxonomy, Supabase, Stripe, entitlement behavior, commerce, Help/Guide, support procedures, broad course redesign, broad design-system primitive, new dependencies, package/config/workflow changes, and merge without explicit owner approval.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves screenshots.

## Acceptance Criteria

1. `/course` still shows `Need extra help?` only under the existing support-card conditions.
2. Default support actions still show `Video Analysis (Optional)` and `Poolside Guide`, while optional `0-1000 Guide` and `Contact us` remain hidden unless enabled.
3. Configured `primaryAction` still controls which support action receives primary treatment.
4. Support links keep the same hrefs, labels, action order, and route behavior.
5. `CourseOpenOnPhoneCard` remains present in the same support group when expected and keeps desktop/mobile QR/share/copy behavior.
6. The support card uses current AW-006 token/card/action classes instead of older route-local rounded card, gradient CTA, and ring action styling where practical.
7. Mobile and desktop screenshots show no text overlap, incoherent nested-card feel, or broken card/action spacing.
8. No route, API, course data, auth, QR generation, analytics, Help/Guide, support, Supabase, Stripe, entitlement, package, config, or workflow behavior changes are introduced.
9. Focused tests and before/after screenshot handoff are completed before broad gates.
10. Work stops after screenshot handoff until owner approval.

## Validation

Targeted during implementation:

- `npm run lint:briefs`
- `npm run lint:quality-gates`
- `npm run typecheck`
- `npx playwright test tests/e2e/course-support-card-actions.spec.ts --project=desktop-chromium --project=mobile-chromium`
- targeted route/label/support sweep with identifiers listed above
- `git diff --check`

Visual gate:

- artifact folder: `output/aw006-course-support-card-token-parity-2026-05-29-085946`
- comparison type: `before/after`
- representative filenames:
  - `before-course-support-card-mobile-390.png`
  - `after-course-support-card-mobile-390.png`
  - `before-course-support-card-desktop-1440.png`
  - `after-course-support-card-desktop-1440.png`

Execution evidence (`2026-05-29`):

- `npm run lint:briefs:all` -> PASS.
- `npm run lint:quality-gates` -> PASS.
- `npm run typecheck` -> PASS.
- `git diff --check` -> PASS.
- `npx playwright test tests/e2e/course-support-card-actions.spec.ts --project=desktop-chromium --project=mobile-chromium` -> PASS (`3 passed`, `3 skipped` by project-specific mobile/desktop coverage).
- Screenshot capture -> PASS: before/after artifacts captured in `output/aw006-course-support-card-token-parity-2026-05-29-085946`.

After owner screenshot approval:

- `npm run verify:pre-pr`
- CI required checks green
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS/npm available through the repo's normal `nvm use --silent` path.
- Visual/dev-server commands use the repo's escalation-first convention.

## Checkpoint Log

- `2026-05-29 | planned | selected after PR #890/#891 on clean main@92febbf; post-merge preflight was reported green with no pending closeout, and a fresh queue/design/code re-audit found the /course Need extra help support card as the next bounded AW-006 token/action hierarchy candidate; owner approved the slice by saying godkjent, but had not yet explicitly said execute/build/implement | next: wait for explicit execute/build/implement before moving this brief to in-progress and touching runtime code`
- `2026-05-29 | in-progress | owner explicitly said execute; created branch aw-006-course-support-card-token-parity, moved the brief to in-progress, and captured before screenshots for the deterministic /course support card fixture in output/aw006-course-support-card-token-parity-2026-05-29-085946 | next: implement scoped support-card token/action parity, run targeted validation, and capture after screenshots before broad gates`
- `2026-05-29 | screenshot-handoff-ready | implemented scoped /course support-card token/action hierarchy parity, updated focused e2e assertions for default and configured primary-action behavior, captured after screenshots in the same before/after artifact folder, and completed targeted lint/typecheck/Playwright/diff validation; no product-rendering files changed after after-screenshot capture | next: wait for owner screenshot approval before running npm run verify:pre-pr, commit, push, PR, CI, and npm run verify:pre-merge`
- `2026-05-29 | screenshot-approved | owner approved the screenshot handoff in chat; no product-rendering files, styles, assets, or export HTML changed after capture | next: run npm run verify:pre-pr, commit, push, open PR, monitor CI, and run npm run verify:pre-merge before merge-readiness summary`
- `2026-05-29 | pre-pr-pass | npm run verify:pre-pr passed on full lane after one unrelated unit-test timing flake was confirmed by an isolated passing rerun; final successful full lane included 1280 unit tests passed, production build passed, perf budgets passed with hold recommendation, and Playwright e2e passed with 102 passed / 492 skipped | next: commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
- `2026-05-29 | commit-created | commit 157e66a created for scoped implementation, tests, AW-006 queue update, design inventory update, screenshot evidence, and task brief lifecycle state | next: amend this checkpoint into the commit, rerun npm run verify:pre-pr on final commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
- `2026-05-29 | done | shipped in PR #892 as squash commit 7093b4d after final implementation commit aadc676; GitHub CI was green and npm run verify:pre-merge passed on the current branch | next: complete repo-managed docs-only closeout and rerun post-merge preflight`

## Completion Record

- `completed`: `2026-05-29`
- `merged_pr`: `#892`
- `squash_commit`: `7093b4d`
- `result`: Closed AW-006 Course Support Card Token And Action Hierarchy Parity by aligning the `/course` `Need extra help?` support card shell and support-action hierarchy with current AW-006 token/card/action patterns while preserving course content, action mapping, destinations, QR/share/copy behavior, progress, auth, APIs, analytics, Help/Guide, and support procedures.
- `validation`: `npm run lint:briefs:all` PASS; `npm run lint:quality-gates` PASS; `npm run typecheck` PASS; `git diff --check` PASS; `npx playwright test tests/e2e/course-support-card-actions.spec.ts --project=desktop-chromium --project=mobile-chromium` PASS (`3 passed`, `3 skipped`); screenshot handoff approved from `output/aw006-course-support-card-token-parity-2026-05-29-085946`; `npm run verify:pre-pr` PASS on final implementation commit `aadc676`; GitHub CI for PR `#892` PASS; `npm run verify:pre-merge` PASS before merge.
- `10/10 claim`: yes - all critical target categories reached `5/5` with no known remaining gaps.

| Category                                      | Achieved Score | Evidence                                                                                                                                                                                                                 | Gaps / Notes |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| Product goals and IA                          | `5/5`          | PR `#892`, code review, focused e2e, `npm run verify:pre-pr`, GitHub CI, and `npm run verify:pre-merge` confirm the same `/course` lesson support job, support group, and Open-on-phone placement remain intact.         | None.        |
| UX flow clarity                               | `5/5`          | Screenshot handoff in `output/aw006-course-support-card-token-parity-2026-05-29-085946`, focused e2e, and PR `#892` confirm the same action order/destinations with clearer primary/secondary hierarchy.                 | None.        |
| Visual design quality                         | `5/5`          | Before/after mobile and desktop screenshots, token/class assertions, and PR `#892` confirm the support card uses AW-006 card/action tokens without text overlap or broken spacing.                                       | None.        |
| Business logic correctness and data integrity | `5/5`          | Focused e2e and changed-files review confirm `SUPPORT_ACTION_ORDER`, enabled action filtering, configured `primaryAction`, support start threshold, lesson state, and `CourseOpenOnPhoneCard` behavior remain unchanged. | None.        |
| Accessibility (a11y)                          | `5/5`          | Playwright role assertions, link assertions, touch-target classes, focus classes, and screenshot review confirm accessible names, headings, and action affordances remain intact.                                        | None.        |
| Accessibility                                 | `5/5`          | Same accessibility closeout gate as the canonical `Accessibility (a11y)` row; the explicit alias satisfies current done-brief 10/10 validation.                                                                          | None.        |
| Data placement and sync boundaries            | `5/5`          | Changed-files review confirms no new server-canonical data, storage key, sync mutation, cache path, API, or conflict behavior was introduced.                                                                            | None.        |
| Reliability and failure handling              | `5/5`          | Focused e2e covers default actions, optional hidden actions, configured primary-action rendering, and mobile Open-on-phone presence; QR/share/copy feedback behavior stayed in the existing component.                   | None.        |
| Security and authz                            | `5/5`          | Changed-files review confirms support links, protected route access, auth redirects, QR redirect safety, external links, APIs, Supabase, Stripe, and entitlements were not changed.                                      | None.        |
| Content governance                            | `5/5`          | This done brief, AW-006 queue update, design inventory update, `npm run lint:briefs:all`, and `npm run lint:quality-gates` record the shipped scope and closeout path.                                                   | None.        |
| i18n operational readiness                    | `5/5`          | Mobile/desktop screenshot review and tokenized responsive classes confirm the short labels remain layout-safe without fixed-width assumptions blocking future localization.                                              | None.        |
| Stack-fit and dependency discipline           | `5/5`          | PR `#892` reused the existing `/course` component boundary, `PressLink`, `CourseOpenOnPhoneCard`, and AW-006 classes without adding dependencies, broad primitives, package/config changes, or workflow changes.         | None.        |
| Testing and QA automation                     | `5/5`          | Targeted Playwright support-card tests, `npm run verify:pre-pr`, GitHub CI, and `npm run verify:pre-merge` passed; screenshot handoff was approved before broad gates.                                                   | None.        |
