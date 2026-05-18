# Task Brief: AW-006 Anonymous Course Progress Noise (10/10)

## Metadata

- `id`: `2026-05-18-aw-006-anonymous-course-progress-noise-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-18`
- `updated`: `2026-05-18`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `branch`: `feat/aw-006-anonymous-course-progress-noise`

## Brief Audit Record

- `last_audited`: `2026-05-18`
- `base`: `main@2ed797f`
- `audit_status`: `ready`
- `decision`: Execute the next small AW-006 UX/UI queue slice by removing anonymous background noise from public `/course` browsing.
- `reason`: Contact/analysis trust copy and closeout shipped through `#748/#749`; the canonical AW-006 queue names anonymous course-progress console noise as the next small slice. A local anonymous `/course` probe showed no `/api/progress/course` call, but did show an unnecessary `/api/admin/notes` request from the course contextual admin panel. The same user-facing problem remains: public course browsing produces avoidable background errors.
- `must_refresh_before_execution_if`: Refresh if `/course`, `AdminContextNotesPanel`, course progress sync, runtime flags, admin notes access, AW-006 scope, scorecard categories, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Public `/course` browsing should stay visually unchanged for guests and should not make background calls to account progress sync or admin notes APIs unless the visitor is signed in with admin/dashboard access.

## Mature Reference Surfaces

- `SiteChrome` already mounts page-level `AdminContextNotesPanel` only when `dashboardVisible` is true.
- `/course` already uses `/api/runtime/flags` to resolve `dashboardVisible` for signed-in users and to include the dashboard menu item only for admins.
- Existing course progress sync guards on `signedInUserId` are the reference behavior for keeping guest progress local-only.
- Existing admin contextual notes E2E is the reference that course lesson notes remain available for allowlisted admins.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `UX flow clarity`
- `Reliability and failure handling`
- `Security and authz`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                           | Evidence                                                         | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/course` remains the public free-course route and admin lesson notes remain an admin-only support surface, with no route or IA identity change.                             | course E2E + admin contextual notes gate                         | `5/5`                   |
| UX flow clarity                               | `target`     | Guest course browsing has no visible admin panel, no visible sync error, and no avoidable background failure while keeping the same lesson/player UI.                        | before/after screenshots + course E2E                            | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: the visible course UI should remain unchanged except absence of hidden admin-only background work for guests.                                               | screenshot handoff                                               | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Guest progress stays local-only; signed-in user progress sync guards stay unchanged; admin notes are mounted only after existing `dashboardVisible` admin/runtime flag.      | course E2E request assertions + code review                      | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: contextual lesson notes remain available to admins through the same panel, but anonymous users never pay the admin-loading cost.                            | existing admin contextual notes coverage + targeted QA           | `4/5`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: no changed headings, labels, focus order, controls, ARIA, or visible tap targets for guests; admin-only panel semantics remain unchanged.                   | screenshot/DOM review + existing gates                           | `4/5`                   |
| Performance (CWV + payloads)                  | `target`     | Anonymous `/course` must make zero `/api/progress/course` and zero `/api/admin/notes` calls during initial guest browse.                                                     | Playwright request assertions + screenshot probe JSON            | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Guest course progress remains local browser storage only; server-canonical `course_progress` remains signed-in only; admin notes remain server-canonical admin-only data.    | data-boundary review + request assertions                        | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this slice changes no route cache mode, fetch cache setting, revalidation trigger, mutation response, or invalidation behavior.                                  | explicit cache scope rationale                                   | `N/A`                   |
| Reliability and failure handling              | `target`     | Public course browse should not surface or log avoidable admin/progress failures; admin notes still rely on existing protected API failure handling once mounted for admins. | local probe + Playwright regression                              | `5/5`                   |
| Security and authz                            | `target`     | Admin notes remain inaccessible to guests and should not be requested from guest course UI; protected API routes continue to fail closed when called directly.               | request assertions + existing negative-path API tests            | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: fewer unnecessary protected API probes from guest UI; no new data collection, logging payload, cookie, or personal data handling.                           | diff review                                                      | `4/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue and this brief record the real observed cause and the updated current slice after contact/analysis shipped.                                           | brief + queue update                                             | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: admin lesson-note create/edit flow remains unchanged once dashboard access is resolved; no Help/Guide workflow label changes.                               | admin contextual notes coverage + scope review                   | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this slice changes no public copy, metadata, headings, sitemap, robots, canonical URLs, structured data, or crawlable route content.                             | explicit SEO scope rationale                                     | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public semantic content, structured data, entity surface, or AI-facing documentation contract.                                             | explicit AI-discoverability scope rationale                      | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice changes no event taxonomy, analytics payload, dashboard, metric, logging event, or KPI definition.                                                    | explicit analytics scope rationale                               | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no pricing, checkout, entitlement, invoice, refund, payout, revenue report, or purchase recovery behavior.                                    | explicit commerce scope rationale                                | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this slice changes no alert path, support workflow, recovery behavior, support diagnostics, runbook, incident response process, or on-call action.                      | explicit support-ops scope rationale                             | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this slice changes no billing, reconciliation, finance report, payout, refund, invoice, entitlement, provider financial data, or reporting workflow.                    | explicit finance scope rationale                                 | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A: this slice changes no user-facing copy, locale routing, translation workflow, metadata text, or grammar-coupled UI string.                                              | explicit i18n scope rationale                                    | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing React state and runtime-flag boundary; add no dependency, API route, Supabase query, schema, feature flag, or new client component.                           | package diff review + code review                                | `5/5`                   |
| Testing and QA automation                     | `target`     | Add a targeted course browser regression that fails if anonymous `/course` calls `/api/progress/course` or `/api/admin/notes`; capture screenshot handoff before broad gate. | targeted Playwright + screenshot artifacts + `lint:briefs`       | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: avoiding guest admin-note calls reduces unnecessary protected API work without changing data volume or infrastructure.                                      | request assertion + diff review                                  | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | One PR revert restores prior behavior; no migration, env var, dependency, provider, data repair, or release flag rollback is required.                                       | git diff review + pre-pr/pre-merge gates after screenshot review | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse existing `dashboardVisible` state in `/course` rather than adding a second auth/admin probe.
  - Keep `AdminContextNotesPanel` as the admin-only reference component; only gate its mounting on `/course`.
  - Do not change route boundaries, API handlers, server actions, metadata, cache, or revalidation.
- TypeScript/domain contracts:
  - No new domain type or payload contract.
  - Preserve `signedInUserId` progress sync guards and `dashboardVisible` runtime flag semantics.
- Supabase/data layer:
  - No migration, RLS/authz, generated type, index, storage, or server data change.
  - Course progress stays server-canonical only for signed-in users.
  - Admin notes stay server-canonical behind existing admin API authorization.
- External services/tools:
  - No Stripe, email, analytics, Supabase provider, webhook, SDK, secret, retry, or idempotency change.
- UI system:
  - Visible course UI should remain visually unchanged for guests.
  - Screenshot handoff type: `before/after` for `/course` mobile and desktop, supported by request-probe JSON.
- Testing:
  - E2E: anonymous `/course` request regression.
  - Existing admin contextual notes coverage protects admin access.
  - Broad gates run only after screenshot handoff approval.

## Data Placement And Sync Contract

- Local-only:
  - Guest course lesson progress remains in existing browser storage keys.
  - No new local storage key is introduced.
- Server-canonical:
  - `course_progress` remains server-canonical for signed-in users only.
  - `admin_notes` remains server-canonical for authorized admins only.
- Sync policy:
  - Guest browse does not call `/api/progress/course`.
  - Signed-in non-admin progress sync behavior is unchanged.
  - Admin contextual notes mount only after `dashboardVisible` confirms admin/dashboard access.
- Retention and sensitivity:
  - No retention or sensitivity behavior changes.
- Cache/invalidation:
  - No cache or invalidation behavior changes.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename policy, alias, redirect, or compatibility mapping.

## Help / Guide Impact

N/A with rationale: this slice changes no user/admin workflow label, recovery behavior, Help/Guide assertion, runbook instruction, support workflow, or operator-facing procedure. Admin notes remain the same surface for admins.

## Route / Label / Support Surface Sweep

Required because an admin support surface is hidden from anonymous course browsing.

- Identifiers searched:
  - `AdminContextNotesPanel`
  - `admin-context-notes-panel`
  - `/api/admin/notes`
  - `/api/progress/course`
  - `dashboardVisible`
  - `course progress`
- Surfaces checked:
  - `app/course/page.tsx`
  - `components/SiteChrome.tsx`
  - `components/admin/AdminContextNotesPanel.tsx`
  - `components/guides/`
  - `tests/e2e/`
  - `tests/unit/`
  - `docs/task-briefs/`
- Expected fallout:
  - `/course` gates lesson-context admin notes on `dashboardVisible`.
  - Targeted course E2E asserts no guest progress/admin-note background requests.
  - Canonical AW-006 queue points to this current slice.
  - No Help/Guide, admin API, progress API, Supabase, or visible course copy change.

## Failure-Mode Evidence

- Before probe:
  - anonymous `/course` made zero `/api/progress/course` calls.
  - anonymous `/course` made an avoidable `/api/admin/notes?contextType=course_lesson...` call that produced a 500 in local protected Supabase config.
- Required after evidence:
  - anonymous `/course` makes zero `/api/progress/course` calls.
  - anonymous `/course` makes zero `/api/admin/notes` calls.
  - visible course layout remains unchanged in representative mobile/desktop screenshots.

## Scope

- Create this in-progress child brief.
- Refresh the canonical AW-006 UX/UI queue to mark Contact/Analysis shipped and this slice active.
- Gate `/course` lesson-context `AdminContextNotesPanel` behind existing `dashboardVisible`.
- Add/update targeted E2E coverage for anonymous course background requests.
- Capture before/after `/course` screenshots and request-probe JSON.

## Out Of Scope

- Course progress sync behavior for signed-in users.
- Admin notes API behavior, authorization, schema, storage, categories, attachments, or editor UI.
- Supabase config, migrations, RLS, generated types, analytics, Stripe, commerce, metadata, sitemap, Help/Guide, app-wide admin panel gating, guide tracker admin notes, new dependencies, new routes, new assets, and visual redesign.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves or waives screenshot review.
- Merge to `main`.

## Acceptance Criteria

1. Anonymous `/course` initial browse does not call `/api/progress/course`.
2. Anonymous `/course` initial browse does not call `/api/admin/notes`.
3. Signed-in/admin course lesson contextual notes remain mounted through the existing `dashboardVisible` runtime-flag path.
4. Guest-visible course player, title, CTA, poster, menu, and bottom bar remain visually unchanged.
5. No progress API, admin API, Supabase schema, auth, or persistence contract changes.
6. Targeted Playwright and brief lint pass before screenshot handoff.
7. Screenshot handoff is captured and approved before `npm run verify:pre-pr`.

## Validation

- Targeted before screenshot handoff:
  - `npx playwright test tests/e2e/course-desktop-player-polish.spec.ts --project=desktop-chromium`
  - `npx playwright test tests/e2e/admin-contextual-notes.spec.ts --project=desktop-chromium --grep "allowlisted admin can manage contextual lesson notes from course page"`
  - `npm run lint:briefs`
  - `git diff --check`
- Screenshot handoff before `npm run verify:pre-pr`
  - artifact folder: `output/course-anonymous-progress-noise-YYYY-MM-DD-HHMMSS`
  - comparison type: `before/after`
  - representative filenames:
    - `before-course-mobile-390.png`
    - `after-course-mobile-390.png`
    - `before-course-desktop-1440.png`
    - `after-course-desktop-1440.png`
  - supporting probe JSON:
    - `before-course-mobile-390-probe.json`
    - `after-course-mobile-390-probe.json`
    - `before-course-desktop-1440-probe.json`
    - `after-course-desktop-1440-probe.json`
- After screenshot approval:
  - `npm run verify:pre-pr`
  - push/open PR
  - CI required checks green
  - `npm run verify:pre-merge`

## Checkpoint Log

- `2026-05-18 | in-progress | started from clean main@2ed797f after PR #748 contact/analysis trust copy and closeout #749; post-merge preflight found no repo-managed closeout; selected the AW-006 anonymous course-progress noise slice because contact/analysis is done and this is the next small queue item; local anonymous /course probe showed no /api/progress/course calls but did show an avoidable /api/admin/notes background request from the course contextual admin panel | next: gate the course admin notes panel on dashboardVisible, add request-regression coverage, update AW-006 queue, run targeted tests, and capture screenshot handoff before broad gates`
- `2026-05-18 | screenshot-review | gated the /course lesson-context AdminContextNotesPanel on the existing dashboardVisible runtime flag, updated the course desktop Playwright regression to assert zero guest /api/progress/course and /api/admin/notes requests, refreshed the canonical AW-006 queue, and captured before screenshots/probe in output/course-anonymous-progress-noise-2026-05-18-174841; targeted guest course Playwright passed (1 passed, 1 skipped mobile-only test), targeted admin contextual notes Playwright was environment-skipped because local dev-login could not authenticate against configured example Supabase, npm run lint:briefs skipped untracked brief diff while npm run lint:briefs:all passed all 313 briefs including this one, and git diff --check passed | next: capture after screenshots/probe, hand off visual evidence, then wait for owner approval before npm run verify:pre-pr`
- `2026-05-18 | screenshot-handoff | captured after screenshots/probe in output/course-anonymous-progress-noise-2026-05-18-174841; before probe showed one guest GET /api/admin/notes request returning 500 and after probe showed zero /api/progress/course and zero /api/admin/notes requests on both mobile and desktop while visible course screenshots remain a before/after comparison | next: wait for owner screenshot approval before npm run verify:pre-pr, PR, CI, and npm run verify:pre-merge`
- `2026-05-18 | screenshot-approved | owner approved screenshot handoff; no product-rendering files changed after screenshot capture | next: run npm run verify:pre-pr, then commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
- `2026-05-18 | pre-pr-green | npm run verify:pre-pr passed on feat/aw-006-anonymous-course-progress-noise with the full lane selected because app/course/page.tsx changed; unit, build, perf budgets, and e2e passed locally. Performance gate reported 6 consecutive weekly green runs and enough margin to tighten, but this slice holds/defer budget tightening because it only removes an anonymous background request and does not change a core-route performance budget target | next: stage, commit, push, open PR, monitor CI, and run npm run verify:pre-merge`
