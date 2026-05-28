# Task Brief: AW-006 Course Progress Backup Prompt Token And Action Hierarchy Parity (10/10)

## Metadata

- `id`: `2026-05-28-aw-006-course-backup-prompt-token-action-parity-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-28`
- `updated`: `2026-05-28`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `related_parent_brief`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-05-28`
- `base`: `main@8e4ea6f`
- `audit_status`: `ready`
- `decision`: Done in PR `#888`; repo-managed closeout records completion evidence and clears active AW-006 queue references.
- `reason`: PR `#888` aligned the `/course` guest progress backup prompt with the current AW-006 token/action hierarchy while preserving course progress, storage, dismissal, sign-in next-path, install prompt, analytics, Help/Guide, and support behavior.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/course`, course progress backup prompt behavior, sign-in next-path handling, course progress storage/sync contracts, install prompt behavior, screenshot handoff rules, forward compatibility rules, or verification lanes change before screenshot handoff.

## Goal

Align the `/course` guest progress backup prompt with the current AW-006 card/action hierarchy while preserving course progress behavior and sign-in routing.

## Pre-Implementation Owner Explanation

Jeg rydder kun den lille kurs-prompten som ber gjester opprette konto for å ta vare på progresjon. Det betyr at brukeren møter samme rolige kort- og knappestil som i auth, checkout og My Library. Utenfor scope er kursdata, sync, innlogging, install-prompt, kursinnhold, videoavspilling, analytics, Help/Guide og bred redesign.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `UX flow clarity`
- `Visual design quality`
- `Accessibility (a11y)`
- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Security and authz`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                            | Evidence                                                   | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/course` still keeps the learner job intact: complete lessons first, then optionally create a free account to back up progress after the existing threshold.                                 | code review + focused Playwright prompt flow               | `5/5`                   |
| UX flow clarity                               | `target`     | Backup prompt keeps the same trigger, same primary sign-in/account action, same dismiss action, and clearer AW-006 visual hierarchy with no competing install prompt.                         | focused Playwright + screenshot handoff                    | `5/5`                   |
| Visual design quality                         | `target`     | Prompt uses existing token-backed card/action classes instead of older one-off radial-gradient/emerald button styling; desktop and mobile screenshots show no overlap with course nav.        | before/after screenshots                                   | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Course completion count, local progress storage, backup threshold, dismissal cooldown, and sign-in `next=/course` behavior remain unchanged.                                                  | targeted Playwright + code diff review                     | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor, content publishing, moderation, note capture, or operator CRUD workflow.                                                                            | explicit admin scope rationale                             | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Prompt remains keyboard-operable; `Create free account` stays a named link, `Maybe later` stays a named button, focus/contrast remain reviewable, and no hidden duplicate controls are added. | focused Playwright role assertions + screenshot review     | `5/5`                   |
| Accessibility                                 | `target`     | Closeout validation alias for the same accessibility gate above; the prompt remains keyboard-operable with named link/button controls and no hidden duplicates.                               | focused Playwright role assertions + screenshot review     | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: `/course` route budgets remain `LCP <= 2.5s`, `CLS <= 0.10`, `INP <= 200ms`, `TBT <= 200ms`; no dependency or extra network work is added.                                   | no-dependency diff + pre-PR perf gate later                | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Existing guest course progress stays local-only until the user signs in; this slice adds no server-canonical state, sync mutation, storage key, or conflict behavior.                         | data-boundary review + unchanged storage keys              | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this changes no course content fetch path, route cache mode, revalidation, API response, or invalidation behavior.                                                                | explicit cache scope rationale                             | `N/A`                   |
| Reliability and failure handling              | `supporting` | Supporting only: prompt rendering and dismissal remain deterministic; no network error path or retry behavior changes in this visual slice.                                                   | focused prompt flow test                                   | `4/5`                   |
| Security and authz                            | `target`     | Sign-in destination remains the existing encoded active `/course?lesson=...` next path; no protected route, auth provider behavior, cookie handling, or authorization boundary is changed.    | code review + unchanged href assertion                     | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: prompt still reveals only local lesson count already visible to the learner and stores no new personal data, email, event payload, or sensitive value.                       | code review                                                | `4/5`                   |
| Content governance                            | `supporting` | Supporting only: prompt copy stays route-owned and unchanged unless visual fitting requires minor wording; no content model, owner workflow, or publish status changes.                       | route/label/support sweep                                  | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin role, workflow action, audit trail, editability, or operator surface.                                                                                       | explicit admin workflow scope rationale                    | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no metadata, sitemap, robots, canonical URL, structured data, public route availability, or indexability behavior.                                                   | explicit SEO scope rationale                               | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no public semantic content model, structured data, crawl-safe entity page, or AI-facing documentation contract.                                                      | explicit AI-discoverability scope rationale                | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this changes no analytics event taxonomy, payload, persistence, dashboard, KPI definition, or reporting path.                                                                     | explicit analytics scope rationale                         | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no pricing, catalog, checkout, entitlement, billing portal, refund, payout, invoice, or revenue reporting behavior.                                                  | explicit commerce scope rationale                          | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no support workflow, runbook, alert path, support diagnostic, recovery behavior, or incident response process.                                                              | explicit support-ops scope rationale                       | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing, invoice, payout, refund, entitlement, revenue report, reconciliation surface, finance data, or reporting operation.                                             | explicit finance scope rationale                           | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: no locale system is introduced; unchanged or minimally changed strings must stay concise and not block later translation extraction.                                         | copy review                                                | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing `/course` component boundaries, `PressLink`, `PressButton`, and AW-006 token classes; add no dependency and no broad design-system primitive.                                  | changed-files/dependency diff                              | `5/5`                   |
| Testing and QA automation                     | `target`     | Update or reuse focused Playwright coverage for the backup prompt, run brief lint and targeted checks before screenshot handoff, then run broad gates only after owner screenshot approval.   | targeted tests + screenshot artifacts + later verify gates | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: visual class changes add no backend polling, storage, image, scheduled job, third-party call, or traffic-dependent platform cost.                                            | implementation review                                      | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: rollback is a normal component/test/docs revert with no migration, config, secret, workflow, or deployment setting change.                                                   | git diff + screenshot artifacts + later gate logs          | `4/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces are the recently aligned `/auth/sign-in`, `/checkout/success`, and My Library card/action hierarchy.
  - Keep the existing `/course` client component boundary and route boundary.
  - Do not change course content APIs, server actions, route cache, or revalidation behavior.
- TypeScript/domain contracts:
  - Preserve course lesson IDs, done-gate state, local progress, backup threshold, dismissal key, active-lesson sign-in URL construction, and progress sync contracts.
  - No parser, validation, or error model changes are planned.
- Supabase/data layer:
  - N/A; no migration, RLS/authz, generated type, storage, or Supabase query changes.
- External services/tools:
  - N/A; no SDK, secret, Stripe, email, Supabase provider, YouTube, or analytics integration changes.
- UI system:
  - Reuse existing token-backed `fs-library-card`, `fs-cta-primary`, `fs-cta-secondary`, `PressLink`, and `PressButton` patterns.
  - Screenshot handoff comparison type is `before/after` for the course backup prompt on mobile and desktop where practical.
- Testing:
  - Reuse/update the focused backup prompt Playwright flow in `tests/e2e/install-prompt.spec.ts`.
  - Run targeted checks before screenshot handoff; broad `verify:pre-pr` waits for owner screenshot approval.

## Data Placement And Sync Contract

Existing state boundaries remain unchanged.

- Server-canonical data:
  - Signed-in course progress rows remain owned by the existing `/api/progress/course` and Supabase-backed path.
- Local data:
  - Guest done lessons, playback progress, done confirmations, and the backup prompt dismissal timestamp remain browser-local.
- Sync policy:
  - Existing signed-in sync, dirty lesson tracking, retry, and preview isolation behavior remain unchanged.
- Retention and sensitivity:
  - No new learner data, secret, email, or sensitive value is stored.
- Cache/invalidation:
  - No course content cache or invalidation behavior changes.

## Identity And Rename Contract

N/A with rationale: this changes no persisted entity, route param, lesson/module stable ID, slug, title identity, analytics identity, operator-visible identifier, alias, redirect, or rename/repurpose behavior.

## Forward Compatibility Contract

- Extensibility surfaces:
  - The touched surface is one route-owned `/course` backup prompt derived from existing course progress state.
- Source of truth:
  - The prompt continues to derive from the current completed-lesson count and `BACKUP_PROMPT_MIN_DONE_LESSONS`; it does not hardcode today-only lesson IDs.
- Additive behavior:
  - New course lessons continue to work automatically because the trigger counts completed lessons from canonical course progress state.
- Explicit mapping requirements:
  - A future new backup prompt type, new account CTA destination, or changed onboarding policy requires explicit copy/test/doc mapping.
- Unknown or deprecated values:
  - N/A for unknown values because this slice does not parse external workflow states or dynamic product identifiers.
- Test/evidence:
  - Focused Playwright proves the prompt still appears after completing the required number of lessons and remains dismissible.

## Help / Guide Impact

N/A with rationale: this changes visual hierarchy only and does not change user/admin workflow labels, recovery behavior, Help/Guide assertions, support runbooks, or operator-facing instructions.

## Route / Label / Support Surface Sweep

Required before broad gates because `/course` user-visible UI and account-backup CTA are touched.

- Identifiers searched:
  - `course-backup-prompt`
  - `Progress backup`
  - `Create free account`
  - `Maybe later`
  - `fs_course_backup_prompt_dismissed_at`
  - `BACKUP_PROMPT_MIN_DONE_LESSONS`
  - `/course`
- Surfaces checked:
  - `app/course/`
  - `components/course/`
  - `tests/e2e/`
  - `tests/unit/`
  - `docs/task-briefs/`
  - `docs/design/`
  - `docs/runbooks/`
- Expected fallout:
  - product code, focused Playwright coverage, active brief, AW-006 queue, and design inventory only.
  - no Help/Guide, support runbook, auth, payment, database, route, SEO, admin, or analytics update unless implementation changes labels or behavior.

## Scope

- `/course` guest progress backup prompt visual/card/action hierarchy.
- Focused Playwright assertion updates for the existing backup prompt flow.
- Active AW-006 queue/design inventory updates.
- Screenshot handoff artifacts.

## Out Of Scope

- Course progress API shape, Supabase storage, localStorage keys, backup threshold/cadence, dismissal cooldown, course content, lesson ordering, player behavior, preview mode, install prompt behavior, auth provider behavior, sign-in callback logic, analytics taxonomy, Help/Guide, support procedures, broad course redesign, broad design-system primitive, new dependencies, package/config/workflow changes, and merge without explicit owner approval.

## Acceptance Criteria

1. Backup prompt appears after the existing guest completed-lesson threshold and not before.
2. Prompt uses current AW-006 token/card/action classes instead of older one-off radial-gradient/emerald button styling.
3. `Create free account` keeps the existing sign-in destination with encoded active `/course?lesson=...` next path.
4. `Maybe later` keeps the existing dismissal behavior.
5. Prompt remains readable and non-overlapping on mobile and desktop course viewports.
6. Course completion, local progress storage, progress sync, install prompt, video/player, course content, auth, and analytics behavior are not intentionally changed.
7. Focused Playwright coverage passes.
8. Screenshot handoff is complete and approved before `npm run verify:pre-pr`, PR creation/update, and `npm run verify:pre-merge`.

## Validation

- Targeted before screenshot handoff:
  - `npm run lint:briefs`
  - `npm run lint:quality-gates`
  - `npm run typecheck`
  - `PW_PORT=3100 NEXT_DIST_DIR=.next-playwright SITE_LOCK_ENABLED=0 npm exec playwright -- test tests/e2e/install-prompt.spec.ts --grep "guest sees free-account backup prompt" --project=mobile-chromium`
- Screenshot handoff before `npm run verify:pre-pr`
  - artifact folder: `output/aw006-course-backup-prompt-token-parity-YYYY-MM-DD-HHMMSS`
  - comparison type: `before/after`
  - representative filenames: `before-course-backup-prompt-mobile-390.png`, `after-course-backup-prompt-mobile-390.png`, `before-course-backup-prompt-desktop-1440.png`, `after-course-backup-prompt-desktop-1440.png`
- After owner screenshot approval:
  - `npm run verify:pre-pr`
  - CI required checks green
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS/npm available through the repo's normal `nvm use --silent` path.
- Visual/dev-server commands use the repo's escalation-first convention.

## Checkpoint Log

- `2026-05-28 | in-progress | owner approved and explicitly requested execution of Course Progress Backup Prompt Token And Action Hierarchy Parity from clean main@8e4ea6f; created branch aw-006-course-backup-prompt-token-parity and this active brief | next: capture before screenshots, implement scoped prompt parity, run targeted validation, and prepare screenshot handoff before broad gates`
- `2026-05-28 | screenshot-handoff | aligned the /course guest progress backup prompt with the current AW-006 card/action hierarchy, preserving course completion count, local progress storage, backup threshold, dismissal behavior, active-lesson sign-in next path, progress sync, install prompt behavior, analytics, Help/Guide, and support behavior; validation passed: npm run lint:quality-gates, npm run typecheck, targeted Playwright backup prompt flow, route/label/support sweep, and git diff --check; npm run lint:briefs reported no changed task briefs found in changed-file mode; before/after screenshots captured in output/aw006-course-backup-prompt-token-parity-2026-05-28-202924; no product-rendering files changed after final capture | next: wait for owner screenshot approval before npm run verify:pre-pr, PR creation, and npm run verify:pre-merge`
- `2026-05-28 | pre-pr | owner approved the screenshot handoff; fixed queue wording so shipped AW-006 sign-in work is not listed as active; validation passed: npm run lint:briefs:all, git diff --check, and npm run verify:pre-pr full lane (quality gates, lint, typecheck, 1280 unit tests, build, perf budgets, 101 e2e passed / 487 skipped); no product-rendering files changed after final screenshot capture | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
- `2026-05-28 | closeout | PR #888 shipped as squash commit 1b801b7; CI and npm run verify:pre-merge passed, and this repo-managed docs-only closeout moves the brief to done and clears active AW-006 queue/inventory references | next: run docs-only closeout gates, merge the closeout PR, rerun post-merge preflight, then complete the mandatory chat-handoff assessment before starting any new implementation slice`

## Completion Record

- `completed`: `2026-05-28`
- `merged_pr`: `#888`
- `squash_commit`: `1b801b7`
- `result`: Closed AW-006 Course Progress Backup Prompt Token And Action Hierarchy Parity; the `/course` guest account-backup prompt now uses the same token-backed card and primary/secondary action hierarchy as adjacent AW-006 surfaces without changing progress, storage, dismissal, sign-in routing, install prompt, analytics, Help/Guide, or support behavior.
- `validation`: screenshot handoff approved; targeted Playwright backup prompt flow passed; `npm run lint:briefs:all` passed; `npm run verify:pre-pr` full lane passed on commit `5c3b9b7`; PR #888 CI passed; `npm run verify:pre-merge` passed before merge.
- `10/10 claim`: yes - all critical target categories reached `5/5`.

| Category                                      | Achieved Score | Evidence                                                                                                                                                                    | Gaps / Notes |
| --------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | PR #888 kept the learner job intact: complete lessons first, then optionally create a free account to back up progress after the existing threshold.                        | None.        |
| UX flow clarity                               | `5/5`          | Screenshot-approved prompt hierarchy keeps `Create free account` primary and `Maybe later` secondary; focused Playwright flow passed.                                       | None.        |
| Visual design quality                         | `5/5`          | Before/after screenshots show token-backed card/action classes on mobile and desktop with no prompt/nav overlap.                                                            | None.        |
| Business logic correctness and data integrity | `5/5`          | Completion count, local progress storage, backup threshold, dismissal behavior, and sign-in `next=/course?lesson=...` assertion stayed covered.                             | None.        |
| Accessibility (a11y)                          | `5/5`          | Named link/button controls remain keyboard-operable and role-visible in the focused Playwright prompt flow; no hidden duplicate controls were added.                        | None.        |
| Accessibility                                 | `5/5`          | Same accessibility closeout gate as the canonical `Accessibility (a11y)` row; the explicit alias satisfies current done-brief 10/10 validation.                             | None.        |
| Data placement and sync boundaries            | `5/5`          | No server-canonical state, sync mutation, storage key, or conflict behavior changed; guest progress remains local-only until sign-in.                                       | None.        |
| Security and authz                            | `5/5`          | Sign-in destination remains the existing encoded active course lesson path; no protected route, cookie, provider, callback, or authorization boundary changed.              | None.        |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing `/course` route boundaries, `PressLink`, `PressButton`, and AW-006 token classes; no dependency, config, workflow, migration, or broad primitive was added. | None.        |
| Testing and QA automation                     | `5/5`          | Targeted Playwright prompt test, screenshot handoff, `npm run verify:pre-pr`, CI, and `npm run verify:pre-merge` passed for the implementation PR.                          | None.        |
