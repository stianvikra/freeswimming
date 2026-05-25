# Task Brief: AW-006 Course Open On Phone Feedback Semantics (10/10)

## Metadata

- `id`: `2026-05-25-aw-006-course-open-on-phone-feedback-semantics-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-25`
- `updated`: `2026-05-25`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-course-open-on-phone-feedback-semantics`
- `execution_mode`: `owner-approved implementation slice; screenshot handoff required before broad gates`

## Brief Audit Record

- `last_audited`: `2026-05-25`
- `base`: `main@0cc752c`
- `audit_status`: `ready`
- `decision`: Execute the approved bounded `AW-006 Course Open On Phone Feedback Semantics` slice now.
- `reason`: PR `#845` and repo-managed closeout PR `#846` are merged, `main` is clean at `0cc752c`, `npm run post-merge:preflight` was reported green, and the fresh queue/design/code re-audit found `CourseOpenOnPhoneCard` still rendering QR/copy/share feedback as route-local plain text while adjacent QR/export/action surfaces now use clearer accessible feedback contracts.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/course`, `CourseOpenOnPhoneCard`, QR redirect placement behavior, QR asset generation, course support-card tests, screenshot handoff rules, or verification lanes change before screenshot handoff.

## Goal

Make the course `Open on phone` QR/share/copy feedback consistent, accessible, and easy to extend while preserving course content, lesson routing, QR generation, stable redirect behavior, progress sync, auth, analytics, Help/Guide, and support procedures.

## Pre-Implementation Owner Explanation

Jeg skal gjore `Open on phone`-boksen paa kurssiden tydeligere naar QR, deling eller kopiering feiler eller lykkes. Det betyr noe fordi brukeren raskere forstaar neste steg, og skjermlesere faar riktig status/feilvarsel. Utenfor scope er kursinnhold, video, progresjon, innlogging, QR-lenker, admin-QR-systemet, analytics, Help/Guide og redesign av kurssiden.

Fremoverkompatibilitet: feedbacken skal folge handlingene `generate QR`, `share link` og `copy link`, ikke dagens konkrete leksjoner eller slugs. Nye cross-device actions, QR-plasseringer eller recovery-regler maa mappes eksplisitt med test foer release.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Reliability and failure handling`
- `Privacy and compliance`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                             | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/course` keeps the existing support-card job: desktop/tablet can scan QR; mobile and all users can share or copy the lesson link.                             | focused tests + screenshot handoff          | `5/5`                   |
| UX flow clarity                               | `target`     | QR loading/error/retry and Share/Copy success/error each show one clear next step near the triggering action.                                                  | focused tests + screenshot handoff          | `5/5`                   |
| Visual design quality                         | `target`     | Feedback uses the current course/support-card visual language and recent AW-006 feedback state rhythm without redesigning the course page.                     | before/after screenshot artifacts + diff    | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Existing share URL resolution, QR asset generation input, Share API payload, clipboard write path, retry path, and cancellation behavior remain unchanged.     | focused unit tests + diff review            | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice touches no admin editor, admin QR registry, CRUD surface, publishing workflow, operator workflow, or admin note.                        | explicit admin scope rationale              | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Recoverable errors use assertive alert semantics, non-error updates use polite status semantics, and action buttons reference active feedback with stable IDs. | Testing Library role/aria assertions        | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no dependency, route fetch, asset, polling loop, or heavy client library is added; route budgets keep existing behavior.                      | no-dependency diff + broad gates later      | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this changes only transient client presentation state and creates no local/server data boundary, browser storage, sync, or persistence behavior.   | explicit data-boundary rationale            | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this changes no route cache mode, fetch cache, revalidation, invalidation behavior, CDN behavior, or stale-data policy.                            | explicit cache scope rationale              | `N/A`                   |
| Reliability and failure handling              | `target`     | QR generation failure, clipboard failure, Share API failure, unsupported Share fallback, and retry remain deterministic and recoverable.                       | focused failure tests                       | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: course access, QR redirect policy, and protected admin QR controls remain unchanged; UI errors expose no raw diagnostics or secrets.          | diff review + unchanged auth/API paths      | `4/5`                   |
| Privacy and compliance                        | `target`     | Feedback exposes only the already-visible lesson-link action result and no user identifiers, entitlement details, raw diagnostics, secrets, or env values.     | copy/error review                           | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue and notice/empty-state inventory record this active course open-on-phone feedback slice and clear stale selected-slice wording.         | docs diff + brief lint                      | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin role, workflow action, status, mutation, Help/Guide surface, or operator editability path changes.                                        | explicit admin-workflow scope rationale     | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public metadata, sitemap, robots, canonical URL, structured data, or crawlable course content.                                     | explicit SEO scope rationale                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity model, structured data, or AI-facing documentation contract.                                              | explicit AI-discoverability scope rationale | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: existing course/support-card analytics behavior stays unchanged; no new event, taxonomy, dashboard, KPI, or consent behavior is introduced.   | analytics scope review                      | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no pricing, checkout, portal, entitlement, Stripe object, invoice, refund, payout, or revenue report.                                 | explicit commerce scope rationale           | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support workflow, operator diagnostics, runbook procedure, support escalation, or QR operations runbook behavior.    | explicit support-ops scope rationale        | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.       | explicit finance scope rationale            | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: touched English feedback strings stay short, route-local, and not grammar-coupled to a specific lesson or product.                            | copy/layout review                          | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `CourseOpenOnPhoneCard`, current QR helper, course support-card tests, Tailwind tokens, and focused Vitest/Playwright evidence; add no dependency.       | changed-files/dependency diff               | `5/5`                   |
| Testing and QA automation                     | `target`     | Focused unit coverage, targeted e2e smoke, brief lint, route/label/support sweep, screenshot handoff, pre-PR gate, CI, and pre-merge gate cover changed scope. | test commands + screenshot artifacts        | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: feedback rendering adds no service call, database query, asset, polling loop, background job, or traffic-dependent infrastructure cost.       | implementation review                       | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert rollback; no migrations, env changes, package changes, workflow changes, generated assets, provider settings, or production settings.        | git diff + validation evidence              | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: recent AW-006 action feedback semantics in `PoolsidePreviewPageClient`, `CreateManualWorkoutButton`, and admin QR asset feedback in `AdminQrLinksManager`.
  - Keep the existing client component boundary in `CourseOpenOnPhoneCard`.
  - Do not change `/course` server/client data loading, course content API, player behavior, auth, QR redirect route, cache mode, or revalidation behavior.
- TypeScript/domain contracts:
  - Preserve `sharePath` to absolute URL resolution, QR asset generation input, Web Share API payload, clipboard write path, cancellation behavior, and retry state.
  - Add only presentation semantics and typed local feedback state if needed.
- Supabase/data layer:
  - N/A; no migration, RLS/authz, generated type, storage, index, or Supabase query behavior changes.
- External services/tools:
  - N/A; no provider setting, SDK, secret, webhook, retry, idempotency, Stripe, Supabase, email, analytics vendor, or deployment setting change.
- UI system:
  - Use existing course/support-card styling and AW-006 feedback semantics.
  - Do not create a broad app-wide Notice primitive in this slice.
  - Screenshot handoff comparison type: `before/after` for `CourseOpenOnPhoneCard` desktop copy-error and mobile copy-success states.
- Testing:
  - Add focused unit coverage for QR loading/error/retry semantics and copy/share success/error semantics.
  - Keep targeted course support-card e2e coverage aligned to desktop/mobile placement behavior.

## Data Placement And Sync Contract

N/A with rationale: this slice changes only transient in-memory client feedback state for QR/copy/share actions. It adds no persisted data, browser storage, server-canonical data, sync, conflict resolution, retention rule, or cache invalidation behavior.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename/repurpose rule, alias, redirect, or migration behavior. Existing lesson IDs, QR stable links, share paths, and route labels remain unchanged.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Touched: course support-card feedback for QR generation, link sharing, link copying, and retry.
  - Not touched: course content, lesson IDs, QR slug/status behavior, admin QR registry, route labels, analytics payloads, auth, Help/Guide, or support procedures.
- Source of truth:
  - Feedback derives from typed local QR/action outcomes and the existing `sharePath` prop, not hardcoded lesson IDs or QR slugs.
- Additive behavior:
  - New lessons and new course share paths keep working automatically through the existing `sharePath` contract.
- Explicit mapping requirements:
  - New cross-device actions, QR placements, QR destination policies, Share API payload changes, route labels, analytics events, support promises, or admin QR workflow changes require explicit code/test/doc review before release.
- Unknown or deprecated values:
  - Unknown QR/share/copy failures keep safe generic copy and must not expose raw browser or provider diagnostics.
- Test/evidence:
  - Focused tests assert role/live-region/description semantics while preserving QR generation input, clipboard path, Share API fallback, and retry behavior.
  - Route/label/support sweep checks `CourseOpenOnPhoneCard`, support-card labels, QR/copy/share identifiers, docs, tests, and runbooks before broad gates.

## Help / Guide Impact

N/A with rationale: this changes only feedback presentation for an existing course support-card action. It does not change Help/Guide content, workflow labels, recovery procedures, entitlement rules, support/operator instructions, QR operations procedure, or admin procedures.

## Route / Label / Support Surface Sweep

Required as a targeted route/label/support-surface-impact-sweep because this slice changes user-facing feedback semantics on `/course`.

- Identifiers searched:
  - `CourseOpenOnPhoneCard`
  - `course-open-on-phone`
  - `Open on phone`
  - `Share link`
  - `Copy link`
  - `Link copied.`
  - `Could not copy link automatically.`
  - `Could not open share sheet right now.`
  - `Could not generate QR image right now.`
  - `role="alert"`
  - `aria-describedby`
  - `aria-live`
- Directories/surfaces checked:
  - `app/`
  - `components/`
  - `tests/`
  - `docs/`
  - `docs/runbooks/`
  - canonical AW-006 queue
  - notice/empty-state inventory
- Expected fallout:
  - Course open-on-phone component, focused tests, active brief, canonical AW-006 queue, notice inventory, and screenshot artifacts only.
  - No course content/player/progress, QR redirect, QR admin registry, Supabase, auth, analytics, Help/Guide, support-procedure, commerce, or admin workflow fallout.

## Scope

- Improve `components/course/CourseOpenOnPhoneCard.tsx` feedback presentation and accessibility semantics for:
  - QR loading and QR generation error/retry,
  - copy-link success and failure,
  - share-link success, failure, cancellation, and unsupported-share fallback.
- Preserve share URL resolution, QR asset generation input, `navigator.share` payload, clipboard write behavior, cancellation behavior, and retry behavior.
- Add focused unit coverage for changed semantics and unchanged action behavior.
- Keep existing course support-card e2e coverage passing.
- Update the canonical AW-006 queue and notice/empty-state inventory.
- Capture required `before/after` screenshot handoff before broad gates.

## Out Of Scope

- Course content, lesson identity, route labels, video/player behavior, drawer/navigation logic, progress API/localStorage, QR redirect route, QR slug/status behavior, admin QR registry, QR asset-generation internals, auth, analytics, Help/Guide, support procedures, Supabase, Stripe, commerce, broad design-system primitives, app-wide notice components, package changes, and merge without explicit owner approval.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves or waives screenshot review.

## Acceptance Criteria

1. QR loading uses polite status semantics without changing QR asset generation input.
2. QR generation failure uses recoverable alert semantics and keeps the retry button wired to the same generation path.
3. Copy-link success/error uses accessible feedback semantics and the Copy button references active feedback.
4. Share-link success/error and unsupported-share fallback preserve existing behavior while using accessible feedback semantics.
5. Existing desktop QR visibility and mobile static-QR hiding behavior remain covered by tests.
6. Canonical AW-006 queue and notice/empty-state inventory record this active slice.
7. Screenshot handoff is captured and approved before `npm run verify:pre-pr`.

## Validation

Targeted before screenshot handoff:

- `./node_modules/.bin/vitest run tests/unit/course-open-on-phone-card.test.tsx`
- `npx playwright test tests/e2e/course-support-card-actions.spec.ts --project=desktop-chromium --project=mobile-chromium`
- `npm run typecheck`
- `npm run lint:briefs:all`
- `npm run lint:quality-gates`
- `git diff --check`
- targeted route/label/support sweep for course open-on-phone identifiers

Visual gate:

- Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
- Capture representative `before/after` screenshots against `http://127.0.0.1:3000`.
- Screenshot artifacts folder: `output/aw-006-course-open-phone-feedback-2026-05-25-130608`.
- Owner approved screenshot handoff before `npm run verify:pre-pr`, PR creation, and `npm run verify:pre-merge`.

After screenshot approval:

- `npm run verify:pre-pr` - PASS (`artifacts/test-runs/20260525-140723/verify.log`; full lane, 99 passed / 483 skipped Playwright)
- commit, push, open/update PR, monitor CI
- `npm run verify:pre-merge`

## 10/10 Quality Bar

- UX clarity: every QR/copy/share outcome gives one direct status or recovery message near the action.
- Required UI states: QR loading, QR error, retry, copy success, copy error, share success, share error, unsupported-share fallback.
- Accessibility: alert/status semantics, stable descriptions, keyboard-reachable actions, and no hidden action-only recovery.
- Performance: no new dependency, fetch, asset, polling loop, or persistent client state.
- Visual consistency: course support-card styling remains quiet and compact across desktop/mobile.
- Business logic correctness: existing share URL, QR, clipboard, Share API, and cancellation behavior stay deterministic.

## Checkpoint Log

- `2026-05-25 | in-progress | owner approved AW-006 Course Open On Phone Feedback Semantics after clean main@0cc752c and fresh queue/design/code re-audit; created branch aw-006-course-open-on-phone-feedback-semantics and this active brief; captured before screenshot evidence in output/aw-006-course-open-phone-feedback-2026-05-25-130608 | next: update queue/inventory, implement feedback semantics, run targeted tests, then capture after screenshots before broad gates`
- `2026-05-25 | screenshot-handoff | implemented course open-on-phone feedback semantics for QR loading/error/retry and copy/share success/error while preserving share URL resolution, QR asset generation input, clipboard path, Share API payload/fallback, and desktop/mobile placement behavior; targeted validation passed: ./node_modules/.bin/vitest run tests/unit/course-open-on-phone-card.test.tsx (1 file / 6 tests), npm run typecheck, npm run lint:briefs:all, npm run lint:quality-gates, git diff --check, npx playwright test tests/e2e/course-support-card-actions.spec.ts --project=desktop-chromium --project=mobile-chromium (2 passed / 2 skipped by project guards), and targeted route/label/support sweep; before/after screenshot artifacts captured in output/aw-006-course-open-phone-feedback-2026-05-25-130608 | next: wait for owner screenshot approval before npm run verify:pre-pr, PR creation, and pre-merge gates`
- `2026-05-25 | pre-pr-green | owner approved screenshot handoff and pre-approved merge when tests are OK; npm run verify:pre-pr passed full lane with log artifacts/test-runs/20260525-140723/verify.log | next: commit, push, open PR, monitor CI, run npm run verify:pre-merge, then merge if all gates stay green`
