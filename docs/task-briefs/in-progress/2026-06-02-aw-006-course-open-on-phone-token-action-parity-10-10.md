# Task Brief: AW-006 Course Open On Phone Token/Action Parity (10/10)

## Metadata

- `id`: `2026-06-02-aw-006-course-open-on-phone-token-action-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-02`
- `updated`: `2026-06-02`
- `branch`: `aw-006-course-open-phone-token-action-parity`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `reference_done_brief`: `docs/task-briefs/done/2026-05-25-aw-006-course-open-on-phone-feedback-semantics-10-10.md`
- `design_contract`: `docs/design/mobile-action-layout-contract.md`
- `execution_mode`: `owner-approved implementation with screenshot approval stop`

## Brief Audit Record

- `last_audited`: `2026-06-02`
- `base`: `main@58764eb`
- `audit_status`: `ready`
- `decision`: Execute the approved AW-006 Course Open On Phone token/action/mobile-layout parity slice now.
- `reason`: `main` is clean and synced at `58764eb` after PR `#947`; the owner explicitly approved and requested this bounded slice. The re-audit found `CourseOpenOnPhoneCard` still using older route-local teal/slate card and button styling after the feedback semantics slice, while adjacent course support/install/backup and current AW-006 route action surfaces use `fs-library-card`, `fs-cta-*`, and shared mobile action grouping.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `CourseOpenOnPhoneCard`, QR/share/copy behavior, `/course` support-card placement, `components/ui/actionLayout.ts`, `docs/design/mobile-action-layout-contract.md`, screenshot handoff rules, or verification lanes change before screenshot handoff.

## Goal

Align the `/course` `Open on phone` card shell, visible actions, and mobile two-action layout with the current AW-006 token/action direction while preserving QR generation, share, copy, course data, auth, analytics, Help/Guide, and support behavior.

## Pre-Implementation Owner Explanation

For ikke-programmerer: Jeg skal gjore "Open on phone"-kortet pa kurssiden visuelt likt resten av AW-006-oppryddingen: samme korttoken, samme knappesprak og samme mobiloppsett for "Share link" og "Copy link".

Hvorfor det betyr noe: Brukeren skal oppleve dette som en del av samme kursflate, ikke en eldre hjelpeboks med egne regler.

Utenfor scope: QR-lenker, deling, kopiering, kursinnhold, innlogging, analytics, Help/Guide og supportflyt skal ikke endres.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                      | Evidence                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `Open on phone` remains a course-local helper below the lesson support area; IA, copy, and placement stay unchanged.                    | code diff + screenshots                  | `5/5`                   |
| UX flow clarity                               | `target`     | QR, share, copy, retry, success, and error states remain clear, with two equal mobile action columns and no orphan action row.          | unit tests + mobile screenshot           | `5/5`                   |
| Visual design quality                         | `target`     | Card shell uses current AW-006 `fs-library-card` treatment and actions use `fs-cta-secondary` plus shared mobile action layout.         | screenshot handoff + class assertions    | `5/5`                   |
| Business logic correctness and data integrity | `target`     | QR asset input, Share API payload, clipboard value, fallback behavior, state transitions, and course data are unchanged.                | focused unit tests + diff review         | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes no admin route, editor workflow, publish controls, or operator action.                                   | explicit admin scope rationale           | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Existing accessible names, feedback roles, aria-live, aria-describedby, keyboard buttons, and touch target sizing are preserved.        | Testing Library assertions               | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No dependency, image, network, route fetch, or client-state weight is added; `/course` budgets should not regress.                      | dependency diff + pre-PR gate            | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Browser-only QR/share/copy UI state remains local-only; course content/progress remains outside this component and unchanged.           | brief contract + code diff               | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this slice changes no route cache mode, revalidation, server fetch policy, or invalidation behavior.                        | explicit cache scope rationale           | `N/A`                   |
| Reliability and failure handling              | `target`     | QR retry and share/copy failure feedback remain reachable and are not hidden behind overflow or changed labels.                         | unit tests + screenshot QA               | `5/5`                   |
| Security and authz                            | `target`     | No auth, entitlement, protected API, URL allowlist, or credential behavior changes.                                                     | changed-files review                     | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because this slice changes no personal data, consent, legal copy, logs, telemetry payloads, secrets, or retention behavior.         | explicit privacy scope rationale         | `N/A`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, active brief, and inventory record this active follow-up and clear stale "done only" wording.                   | docs diff + brief lint                   | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow labels, actions, Help/Guide content, runbooks, recovery paths, or editability surfaces change.            | explicit workflow scope rationale        | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this slice changes no metadata, sitemap, robots, canonical URL, structured content, or indexability.                        | explicit SEO scope rationale             | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this slice changes no AI-facing public entity structure, crawl-safe documentation, or structured data.                      | explicit AI scope rationale              | `N/A`                   |
| Analytics and KPI observability               | `target`     | Existing analytics taxonomy remains untouched; no event names or payload values are added, removed, or renamed.                         | analytics diff review                    | `5/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no pricing, checkout, Stripe, entitlement, invoice, refund, or revenue workflow.                         | explicit commerce scope rationale        | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A with scope rationale: this slice changes no incident alerting, support escalation, diagnostics, support copy, or runbook steps.     | explicit support-ops scope rationale     | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this slice changes no finance reports, payouts, reconciliation, tax, invoices, or provider financial data.    | explicit finance scope rationale         | `N/A`                   |
| i18n operational readiness                    | `target`     | The two visible action labels use equal mobile columns with existing text-fit behavior; future longer labels can use shared stack rule. | mobile screenshot + action layout review | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `CourseOpenOnPhoneCard`, `components/ui/actionLayout.ts`, `components/ui/cx`, and `fs-*` tokens; add no dependency.               | changed-files/dependency diff            | `5/5`                   |
| Testing and QA automation                     | `target`     | Focused component tests cover token/action/mobile layout and unchanged feedback behavior; screenshot handoff happens before pre-PR.     | Vitest + screenshot artifacts            | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: token reuse reduces future UI drift without adding service cost, jobs, storage, or network work.                       | implementation review                    | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal revert restores previous presentation; no migration, dependency, env, provider, or feature flag rollback is needed.              | git diff + validation evidence           | `5/5`                   |

Critical target categories for a `10/10` claim: Product goals and IA, UX flow clarity, Visual design quality, Business logic correctness and data integrity, Accessibility (a11y), Data placement and sync boundaries, Reliability and failure handling, Security and authz, Content governance, Stack-fit and dependency discipline, Testing and QA automation, DevOps and rollback readiness.

## Stack / Architecture Best-Practice Gate

- React/Next.js: keep `CourseOpenOnPhoneCard` as the existing client component; do not move route ownership or change `/course` rendering conditions.
- TypeScript/domain contracts: keep current QR state and action feedback state unions; no new domain model.
- UI system reference surface: adjacent `/course` support/install/backup card actions in `app/course/page.tsx` and the shared component contract in `components/ui/actionLayout.ts`; reuse `fs-library-card`, `fs-library-card-muted` or equivalent existing course-local token direction, `fs-cta-secondary`, `getMobileActionGroupClass(2)`, `mobileActionItemClass`, and `cx`.
- Accessibility: preserve feedback `role`, `aria-live`, and `aria-describedby`; keep buttons keyboard-native and touch targets at least current size.
- Testing: update `tests/unit/course-open-on-phone-card.test.tsx`; use screenshot handoff for desktop and mobile `/course` evidence before broad gates.
- Dependencies: no new dependency.

## Data Placement And Sync Contract

- Server-canonical data: N/A for this slice; course content, lesson identity, progress, auth, and support data are not changed.
- Local data: QR/share/copy UI state remains browser-only React state inside `CourseOpenOnPhoneCard`.
- Sync policy: N/A; no local/server sync, conflict resolution, retry backoff, or persistence changes.
- Retention and sensitivity: No new stored values, logs, telemetry, or sensitive data handling.
- Cache/invalidation: N/A; no cache or revalidation behavior changes.

## Identity And Rename Contract

N/A with rationale: this slice introduces no persisted entity, slug, route param, title identity, alias, redirect, analytics identity, or operator-visible identifier. The existing `sharePath` is only resolved to a URL for QR/share/copy and must remain unchanged.

## Forward Compatibility Contract

- Future action labels in this two-action group should inherit the shared mobile action layout and `fs-cta-secondary` semantics automatically.
- A future third visible action must use `docs/design/mobile-action-layout-contract.md` to decide equal trio, mixed third-row, or full-width stacked behavior.
- A future primary, destructive, auth, analytics, support, or recovery action requires explicit mapping, tests, and screenshot evidence before release.
- Unknown or failed QR/share/copy states continue to fail into existing loading/error/status feedback instead of changing route behavior.
- Evidence for this slice: focused tests assert token classes and the two-action mobile group while existing tests continue to prove QR/share/copy feedback behavior.

## Help / Guide Impact

N/A with rationale: labels, support routes, recovery steps, Help/Guide copy, and support procedures do not change. This is presentation parity only.

## Route / Label / Support Surface Sweep

Required because this slice touches visible `/course` action presentation and stale AW-006 queue/inventory records.

Minimum identifiers:

- `CourseOpenOnPhoneCard`
- `course-open-on-phone`
- `Open on phone`
- `Share link`
- `Copy link`
- `Retry`
- `getMobileActionGroupClass`
- `mobileActionItemClass`
- `fs-cta-secondary`

Minimum surfaces:

- `components/course/CourseOpenOnPhoneCard.tsx`
- `app/course/page.tsx`
- `tests/unit/course-open-on-phone-card.test.tsx`
- `tests/e2e/course-support-card-actions.spec.ts`
- `docs/design/notice-empty-state-pattern-inventory.md`
- `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- relevant AW-006 done briefs used as reference

## Screenshot Handoff Plan

- Comparison type: `before/after`.
- Surfaces: `/course` desktop viewport showing QR + actions, and `/course` mobile viewport showing action layout without desktop QR.
- Artifact folder pattern: `output/aw-006-course-open-phone-token-action-YYYY-MM-DD-HHMMSS`.
- Stop after screenshot handoff for owner approval before `npm run verify:pre-pr`, PR creation, or `npm run verify:pre-merge`.

## Out Of Scope

- QR generation inputs, QR assets, QR fallback routes, stable redirects, share payload values, clipboard payload values, course data, progress sync, auth, analytics, Help/Guide, support behavior, and admin QR registry behavior.
- Broader `/course` redesign or changes to other course cards/prompts.

## Acceptance Criteria

1. `CourseOpenOnPhoneCard` shell uses current AW-006 card/token treatment without changing copy or placement.
2. `Share link`, `Copy link`, and QR retry actions use current `fs-cta-*` action semantics.
3. Mobile action layout uses the shared two-action mobile group and keeps desktop compact behavior.
4. Existing QR/share/copy success, error, retry, fallback, and cancellation behavior remains covered.
5. Canonical AW-006 queue and inventory no longer imply this surface has only the old feedback-semantics closeout.
6. Focused tests and screenshot handoff pass before broad gates.

## Validation Plan

- `npm run lint:briefs`
- `./node_modules/.bin/vitest run tests/unit/course-open-on-phone-card.test.tsx`
- targeted route/label/support sweep for the identifiers above
- `git diff --check`
- screenshot handoff before `npm run verify:pre-pr`

## Implementation Checkpoint Log

- `2026-06-02 | in-progress | started from clean main@58764eb on branch aw-006-course-open-phone-token-action-parity after owner approved the bounded Course Open On Phone token/action/mobile-layout parity slice | next: update queue/inventory, capture before screenshots, implement component/test changes, run focused validation, then capture after screenshots for owner approval before npm run verify:pre-pr`
- `2026-06-02 | screenshot-handoff | updated CourseOpenOnPhoneCard card/action/mobile classes to fs-library-card/fs-cta-secondary/shared mobile action layout; preserved QR generation input, Share API payload, clipboard path, fallback, copy/share/QR retry behavior, course data, auth, analytics, Help/Guide, and support behavior; updated stale AW-006 queue/inventory records; validation passed: ./node_modules/.bin/vitest run tests/unit/course-open-on-phone-card.test.tsx (1 file / 7 tests), npx playwright test tests/e2e/course-support-card-actions.spec.ts --project=desktop-chromium --project=mobile-chromium (3 passed / 3 skipped by project guards), npm run lint:briefs:all, npm run lint:quality-gates, targeted route/label/support sweep, and git diff --check; before/after screenshots captured in output/aw-006-course-open-phone-token-action-2026-06-02-192822; no product-rendering files changed after screenshot capture | next: wait for owner screenshot approval before npm run verify:pre-pr, PR creation, or npm run verify:pre-merge`
- `2026-06-02 | screenshot-approved | owner approved the before/after screenshot handoff; no product-rendering files changed after capture | next: run npm run verify:pre-pr`
- `2026-06-02 | pre-pr gate | npm run verify:pre-pr passed the full public lane locally after screenshot approval: branch-current passed against origin/main@58764eb, quality gates/admin audit/env parity/generated PR body/eslint/typecheck passed, unit suite passed (224 files / 1311 tests), build and performance budgets passed, full Playwright lane passed (102 passed / 492 skipped), and verify-open passed; only known eslint warning remains in output/capture-aw006-dryland-feedback.mjs outside this slice; no product-rendering files changed after screenshot capture | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
