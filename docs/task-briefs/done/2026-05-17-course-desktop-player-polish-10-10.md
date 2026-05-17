# Task Brief: Course Desktop Player Polish (10/10)

## Metadata

- `id`: `2026-05-17-course-desktop-player-polish-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-17`
- `updated`: `2026-05-17`
- `parent_review_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `execution mode`: `end-to-end implementation after owner explicitly requested the next PR-sized AW-006 UX/UI slice`

## Brief Audit Record

- `last_audited`: `2026-05-17`
- `base`: `main@f0a185a`
- `audit_status`: `ready`
- `decision`: Use the review queue's first recommended child slice, `Course desktop player polish`, as the next small AW-006 PR.
- `reason`: The canonical AW-006 review queue says the desktop course/player first viewport lacks finish and should show a clear title, play CTA, poster/preview, and less optional progress-console noise before larger design-system or commerce work.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, screenshot handoff rules, `/course`, course/player state, course progress sync, course content API, design tokens, Playwright projects, or verification lanes change before completion.

## Goal

Make the `/course` desktop player first viewport feel finished before play while preserving mobile course behavior and existing lesson/progress state.

## Product Decisions

- This slice polishes the existing free course player; it does not redesign course IA, lesson content, mobile nav, progress sync, auth, payments, admin content, or data storage.
- Use the current `/course` video player as the reference surface and improve its pre-play state in place instead of introducing a new player abstraction.
- Use the YouTube thumbnail as a lightweight poster/preview for the active lesson; if the remote image is unavailable, the existing styled fallback remains acceptable.
- Prefer per-lesson video thumbnails over one repeated generic swimming image because the player should preview the actual lesson content, not read as a campaign hero. A generic swim image remains a future fallback option only when lesson thumbnails are unavailable or unfit.
- Correct the course intro brand mark in this slice where it is visually exposed by the player polish; keep the adjustment scoped through the `PageIntro` API instead of changing every PageIntro instance.
- On mobile, hide the duplicate intro `Lessons` CTA and rely on the fixed course nav so the course title has enough width to stay on one line.
- Hide anonymous/local progress-console copy from the default learner overview details. Keep preview, signed-in sync, and sync-error messages where they are operationally useful.
- Screenshot handoff is required before `npm run verify:pre-pr`, PR creation/update, and `npm run verify:pre-merge`. This is a screenshot approval stop.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- UX flow clarity
- Visual design quality
- Accessibility (a11y)
- Performance (CWV + payloads)
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                              | Evidence                                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/course` still communicates one primary job: watch the current lesson and move through the course; desktop first viewport must keep lesson, module, progress, and next actions understandable. | code review + desktop screenshot handoff                | `5/5`                   |
| UX flow clarity                               | `target`     | On desktop, the pre-play player must show the active lesson title and a visible play/resume CTA in the first viewport without relying on scrolling.                                             | targeted Playwright test + screenshot handoff           | `5/5`                   |
| Visual design quality                         | `target`     | Desktop player pre-play state must include a poster/preview, clear hierarchy, stable spacing, and no unfinished oversized blank area; mobile visual behavior must remain acceptable.            | before/after screenshots                                | `5/5`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: preserve existing lesson selection, done gate, local playback progress, signed-in sync, and preview isolation behavior.                                                        | targeted regression test + unchanged data contracts     | `4/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes no admin editing, publishing, moderation, note capture, or operator CRUD workflow.                                                                               | explicit admin scope rationale                          | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Player CTA must remain a named button, thumbnail must not create duplicate spoken content, focus order must remain logical, and status/progress controls must remain reachable.                 | targeted Playwright role assertions + screenshot review | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | `/course` route-level targets remain `LCP <= 2.5s`, `CLS <= 0.10`, `INP <= 200ms`, `TBT <= 200ms`; add no dependency and avoid new heavy client runtime.                                        | dependency diff + build/perf gate evidence              | `5/5`                   |
| Data placement and sync boundaries            | `supporting` | Supporting only: existing local-only UI preferences and local-first course progress with signed-in sync stay unchanged; no new state boundary is introduced.                                    | data contract review                                    | `4/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this slice changes no course content fetch mode, route cache, revalidation, API response, or invalidation behavior.                                                                 | explicit cache scope rationale                          | `N/A`                   |
| Reliability and failure handling              | `supporting` | Supporting only: video load failure fallback and YouTube-open fallback must continue to render after the visual change.                                                                         | code review + targeted test coverage                    | `4/5`                   |
| Security and authz                            | `N/A`        | N/A because this changes no auth, authorization, protected route, API, cookies, credentials, or security-sensitive input.                                                                       | explicit security scope rationale                       | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because this changes no personal data collection, logs, analytics payloads, consent, retention, or private user data display.                                                               | explicit privacy scope rationale                        | `N/A`                   |
| Content governance                            | `supporting` | Supporting only: lesson title/module metadata remain sourced from existing course content; no course copy ownership or publish workflow changes.                                                | unchanged content model review                          | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin role, support console, admin mutation, or operator editability changes.                                                                                                    | explicit admin workflow scope rationale                 | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no metadata, robots, sitemap, canonical, structured content, route availability, or crawl behavior.                                                                    | explicit SEO scope rationale                            | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no public semantic content model, structured data, crawl-safe docs, or entity modeling beyond existing course UI.                                                      | explicit AI discoverability scope rationale             | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this changes no event taxonomy, analytics payload, KPI definition, dashboard, or persistence.                                                                                       | explicit analytics scope rationale                      | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no pricing, catalog, checkout entry, entitlement, refund, payout, invoice, or revenue reporting behavior.                                                              | explicit commerce scope rationale                       | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this UI polish changes no support workflow, runbook, alert path, operational diagnostic, recovery behavior, or incident response process.                                                  | explicit support-ops scope rationale                    | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing, invoice, payout, refund, entitlement, revenue report, reconciliation surface, or finance data.                                                                    | explicit finance scope rationale                        | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: no new locale system is introduced; any new user-facing strings must be concise and avoid hard-coding grammar that blocks future localization.                                 | copy review                                             | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing `/course` client component, `PressButton`, `PressLink`, `BrandImage`, and Tailwind patterns; add no dependency and avoid design-system refactors outside this slice.             | architecture review + no-dependency diff                | `5/5`                   |
| Testing and QA automation                     | `target`     | Add targeted desktop Playwright coverage for pre-play player title/CTA/poster and reduced anonymous progress noise; run targeted tests, screenshot handoff, then broad gates after approval.    | targeted tests + screenshot artifacts + verify gates    | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: thumbnail preview is one remote image per active lesson and adds no backend polling, storage, scheduled job, external service, or traffic-dependent platform cost.             | implementation review                                   | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: rollback is a normal component/test/docs revert with no migration or config change; validation and screenshot artifacts must make the visual delta reviewable.                 | git diff + screenshot artifacts + gate logs             | `4/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface is the existing `/course` player in `app/course/page.tsx`.
  - Keep the current client component boundary and route boundary.
  - Do not change course content API routes, server actions, route cache, or revalidation behavior.
- TypeScript/domain contracts:
  - Preserve `CourseLesson`, `CourseModule`, lesson IDs, done-gate, local playback progress, preview mode, and progress sync contracts.
  - No parser, validation, or error model changes are planned.
- Supabase/data layer:
  - N/A; no migration, RLS/authz, generated type, storage, or Supabase query changes.
- External services/tools:
  - No SDK or secret changes.
  - The YouTube thumbnail URL is display-only and derived from the existing `youtubeId`; playback remains handled by the current YouTube iframe API flow.
- UI system:
  - Reuse existing Tailwind card/player language, `PageIntro`, `BrandImage`, and `PressButton`/`PressLink`.
  - Use a scoped `PageIntro` brand-mark override on `/course` so the symbol renders at its intrinsic ratio instead of stretching inside the compact intro frame.
  - Add stable dimensions for the player pre-play state so desktop and mobile do not shift when title, module, or CTA length changes.
  - Screenshot handoff type is `before/after` for `/course` desktop and mobile first viewport.
- Testing:
  - Add one targeted desktop Playwright regression.
  - Run `npm run lint:briefs` and the targeted Playwright test before screenshot handoff.
  - After owner screenshot approval, run `npm run verify:pre-pr`, update PR, monitor CI, then run `npm run verify:pre-merge`.

## Data Placement And Sync Contract

Existing state boundaries remain unchanged.

- Server-canonical data:
  - Signed-in course progress rows remain owned by the existing `/api/progress/course` and Supabase-backed path.
- Local data:
  - Existing local lesson progress, playback progress, overview expansion, common mistakes expansion, and install prompt state remain in browser storage.
- Sync policy:
  - Existing dirty lesson sync, interval sync, force retry, and preview isolation behavior remain unchanged.
- Retention and sensitivity:
  - No new learner data, secret, or sensitive field is stored.
- Cache/invalidation:
  - No course content cache or invalidation behavior changes.

## Identity And Rename Contract

N/A with rationale: this changes no persisted entity, route param, lesson/module stable ID, slug, title identity, analytics identity, operator-visible identifier, alias, redirect, or rename/repurpose behavior.

## Help / Guide Impact

N/A with rationale: this changes visual hierarchy and one optional progress-detail copy path only. It does not change user/admin workflow labels, recovery behavior, Help/Guide assertions, support runbooks, or operator-facing instructions.

## Route / Label / Support Surface Sweep

- Required before broad gates because `/course` user-visible layout and copy are touched.
- Identifiers searched:
  - `Course desktop`
  - `Play lesson`
  - `Lesson and playback progress saved on this device`
  - `course-player`
  - `course-video`
  - `course-intro-brand-mark`
  - `brandMarkClassName`
  - `/course`
- Surfaces checked:
  - `app/course/`
  - `components/PageIntro.tsx`
  - `components/course/`
  - `tests/e2e/`
  - `tests/unit/`
  - `docs/task-briefs/`
  - `docs/design/`
  - `docs/runbooks/`
- Expected fallout:
  - product code and targeted test update only,
  - no Help/Guide, auth, payment, database, route, SEO, admin, or runbook update unless implementation discovers a direct reference.

## Scope

- `/course` first viewport pre-play player polish on desktop.
- `/course` intro/player brand-mark proportion fix for the affected course surface.
- Preserve mobile player behavior while allowing minor responsive polish if required by shared markup.
- Reduce anonymous/local-only progress-console copy in overview details.
- Targeted Playwright regression.
- Screenshot handoff artifacts.

## Out Of Scope

- New course IA, course content, lesson ordering, progress sync behavior, YouTube playback mechanics, mobile bottom nav behavior, auth, payments, plans conversion, admin content, database/schema, analytics, SEO metadata, design-token foundation, and new dependencies.
- Merge without explicit owner approval.

## Acceptance Criteria

1. On desktop `/course`, before playback starts, the active lesson title, module label, poster/preview, and play/resume CTA are visible in the first viewport.
2. The pre-play player no longer presents as a large blank panel on desktop.
3. Course intro brand mark renders without vertical or horizontal squeeze.
4. Anonymous/default learners do not see the optional "Lesson and playback progress saved on this device." console copy in overview details.
5. Existing course navigation, mark-done gate, video load failure fallback, YouTube open fallback, preview mode, local progress, and signed-in sync behavior are not intentionally changed.
6. Mobile `/course` keeps the course title on one line, still exposes the fixed `Lessons` nav, and shows the player title and play CTA clearly above the fixed course nav.
7. No new dependency is added.
8. Targeted test and screenshot handoff evidence are complete before broad gates.

## Validation

- `npm run lint:briefs`
- Targeted:
  - `PW_PORT=3100 NEXT_DIST_DIR=.next-playwright SITE_LOCK_ENABLED=0 npm exec playwright -- test tests/e2e/course-desktop-player-polish.spec.ts --project=desktop-chromium --project=mobile-chromium`
- Screenshot handoff before `npm run verify:pre-pr`
  - artifact folder: `output/course-desktop-player-polish-YYYY-MM-DD-HHMMSS`
  - comparison type: `before/after`
  - filenames: `before-course-desktop-player-desktop-1440.png`, `after-course-desktop-player-desktop-1440.png`, `before-course-desktop-player-mobile-390.png`, `after-course-desktop-player-mobile-390.png`
- Owner screenshot approval or correction pass before PR creation/update and broad gates.
- `npm run verify:pre-pr`
- CI required checks green.
- `npm run verify:pre-merge`

## Checkpoint Log

- `2026-05-17`: Started from clean `main@f0a185a` after `npm run post-merge:preflight` found no repo-managed closeout; branch `aw-006-course-desktop-player-polish` created; before screenshots captured in `output/course-desktop-player-polish-2026-05-17-152213`.
- `2026-05-17`: Implemented scoped `/course` desktop player polish with a CSS Module for stable player/overview ordering and pre-play poster overlay, removed anonymous local progress-console copy from overview details, added `tests/e2e/course-desktop-player-polish.spec.ts`, and completed the route/label/support sweep with no Help/Guide, auth, payment, database, route, SEO, admin, or runbook fallout.
- `2026-05-17`: Targeted validation passed: `npm run lint:briefs:all` and `PW_PORT=3100 NEXT_DIST_DIR=.next-playwright SITE_LOCK_ENABLED=0 npm exec playwright -- test tests/e2e/course-desktop-player-polish.spec.ts --project=desktop-chromium`; after screenshots captured in `output/course-desktop-player-polish-2026-05-17-152213`; next step is owner screenshot approval before `npm run verify:pre-pr`, PR creation, CI, and `npm run verify:pre-merge`.
- `2026-05-17`: Owner flagged debug screenshots and a squeezed/wrong logo icon. Kept video poster decision on per-lesson YouTube thumbnails, added scoped `PageIntro` brand-mark override plus Playwright ratio assertion, reran targeted Playwright successfully, and regenerated a clean screenshot folder in `output/course-desktop-player-polish-2026-05-17-174228` with no debug artifacts.
- `2026-05-17`: Owner flagged mobile title wrapping in the course intro. Hid the duplicate intro `Lessons` CTA on mobile through a scoped `PageIntro` right-slot wrapper while preserving desktop, added a mobile Playwright assertion that `Free Course` stays on one line, reran targeted desktop+mobile Playwright successfully, and regenerated clean screenshots in `output/course-desktop-player-polish-2026-05-17-181136`.
- `2026-05-17`: Owner accepted the visual direction after the final mobile screenshot. Full `npm run verify:pre-pr` passed on branch `aw-006-course-desktop-player-polish`; gate evidence included quality-gates, lint, typecheck, 192 unit files / 1095 unit tests, build, perf budgets, and Playwright `90 passed / 438 skipped`. Non-blocking notes: ESLint warned about the display-only YouTube thumbnail `<img>`, and perf-budget trend recommended tightening after 5 green runs; decision for this non-perf UI slice is `hold` and carry a tighten prompt into the PR summary/follow-up.
- `2026-05-17`: Pre-commit enforces `eslint --max-warnings=0`, so the poster thumbnail was switched from a raw `<img>` to `next/image` with `unoptimized` to preserve the direct YouTube thumbnail URL without adding image config. Targeted `npx eslint app/course/page.tsx components/PageIntro.tsx tests/e2e/course-desktop-player-polish.spec.ts` and targeted desktop+mobile Playwright passed. Because `page.tsx` rendering changed after screenshot capture, regenerated clean screenshots in `output/course-desktop-player-polish-2026-05-17-182500`; no material visual difference from the owner-approved `2026-05-17-181136` handoff.
