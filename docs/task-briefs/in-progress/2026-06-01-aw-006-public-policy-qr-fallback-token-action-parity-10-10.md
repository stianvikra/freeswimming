# Task Brief: AW-006 Public Policy And QR Fallback Token/Action Parity (10/10)

## Metadata

- `id`: `2026-06-01-aw-006-public-policy-qr-fallback-token-action-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-01`
- `updated`: `2026-06-01`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-public-policy-qr-fallback-token-parity`

## Brief Audit Record

- `last_audited`: `2026-06-01`
- `base`: `main@572a286`
- `audit_status`: `ready`
- `decision`: Execute the next AW-006 UI slice as a bounded public policy and QR fallback token/action parity pass.
- `reason`: `main` is clean and synced after Guide Tracker fullscreen/action hierarchy PR `#930` and repo-managed closeout PR `#931`; `npm run post-merge:preflight` passed with no closeout remaining. A fresh queue/design/code re-audit found no active AW-006 slice and found `/privacy`, `/cookies`, and `/go/unavailable` still using older local rounded card/button styling while adjacent public recovery and member/admin surfaces use the newer `fs-library-card` and token/action hierarchy.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `app/privacy/page.tsx`, `app/cookies/page.tsx`, `app/go/unavailable/page.tsx`, QR redirect fallback behavior, policy copy, screenshot handoff rules, forward compatibility rules, route/label/support sweep rules, or verification lanes change before PR handoff.

## Goal

Align `/privacy`, `/cookies`, and `/go/unavailable` with the current AW-006 token/card/action hierarchy while preserving policy content, QR fallback safety, route metadata, support paths, and all runtime behavior.

## Pre-Implementation Owner Explanation

Vi gjør personvern-, cookie- og QR-feilsiden visuelt lik resten av appen med samme kort, knapper, farger og lesbarhet.

Hvorfor det betyr noe: dette er tillit/support-sider; de bør ikke føles som eldre UI når brukeren trenger trygg informasjon eller hjelp.

Utenfor scope: ingen endring i juridisk tekst, QR-redirect-regler, cookie/personvern-praksis, auth, Stripe, Supabase, analytics eller API-er.

Fremoverkompatibilitet: fremtidige prosessor-/retention-rader skal arve samme sideoppsett automatisk fra eksisterende arrays; nye QR-feilårsaker trenger eksplisitt tekstmapping hvis de skal vise egen brukerbeskjed.

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
- `Privacy and compliance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                                                                                                                   | Evidence                                                      | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/privacy`, `/cookies`, and `/go/unavailable` keep the same page jobs, headings, route purpose, and support navigation while matching current public recovery hierarchy.                                                                                                                             | page tests + screenshot handoff + changed-files review        | `5/5`                   |
| UX flow clarity                               | `target`     | Policy readers and QR fallback users keep obvious next steps: contact/privacy links, safe retry when allowed, open course, and contact support with clear primary/secondary hierarchy; mobile action groups avoid orphan final-row actions and keep compact headings from crowding recovery actions. | page tests + screenshot handoff                               | `5/5`                   |
| Visual design quality                         | `target`     | Changed pages use current `fs-library-card`, token radius, token colors, panel-scale compact headings, and `fs-cta-*` action classes instead of older route-local rounded card/button styling.                                                                                                       | DOM/class assertions + before/after screenshots               | `5/5`                   |
| Business logic correctness and data integrity | `target`     | QR fallback reason copy, slug display, safe retry path rules, policy arrays, metadata, and links remain deterministic and unchanged in meaning.                                                                                                                                                      | unit/page tests + route diff review                           | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes no admin editor, content CRUD, operator queue, role workflow, Context Notes, QR Registry admin surface, or Help Center editing path.                                                                                                                                  | explicit admin-editor scope rationale                         | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Headings, landmarks, lists, links, action labels, focus rings, contrast, and mobile touch targets remain semantic and reachable.                                                                                                                                                                     | Testing Library role assertions + screenshot review           | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: class/token reuse adds no dependency, media asset, route fetch, polling loop, or material JS payload.                                                                                                                                                                               | package/diff review + later pre-PR gate                       | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this presentation slice introduces no local-only state, server-canonical data, browser storage, sync, conflict policy, retention rule, or sensitive-data handling.                                                                                                                       | data/sync scope rationale                                     | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, API cache header, fetch path, revalidation, invalidation trigger, or stale-data policy changes.                                                                                                                                                                     | cache scope rationale                                         | `N/A`                   |
| Reliability and failure handling              | `target`     | `/go/unavailable` remains a deterministic non-500 fallback for invalid/missing/blocked QR links and keeps retry/help exits without dead ends.                                                                                                                                                        | unit/page tests + QR redirect tests review                    | `5/5`                   |
| Security and authz                            | `target`     | QR fallback safe retry validation remains exact-path only, destination policy and redirect route stay untouched, and no protected route/auth behavior changes.                                                                                                                                       | unchanged route/API diff review + fallback page test          | `5/5`                   |
| Privacy and compliance                        | `target`     | Privacy/cookie content, last-updated values, processor/retention meaning, rights links, and consent boundary remain unchanged while becoming visually consistent.                                                                                                                                    | copy-preservation diff review + page tests                    | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this active brief, and design inventory record the selected slice without stale active references.                                                                                                                                                                           | docs diff + brief lint                                        | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin role, workflow label, mutation path, support recovery procedure, operator edit path, or admin-facing instruction.                                                                                                                                                  | explicit admin-workflow scope rationale                       | `N/A`                   |
| SEO and crawlability                          | `target`     | Existing `/privacy` and `/cookies` metadata/canonicals and `/go/unavailable` `noindex,nofollow` behavior stay unchanged.                                                                                                                                                                             | metadata tests or diff review + existing sitemap/SEO coverage | `5/5`                   |
| AI discoverability                            | `supporting` | Supporting only: public policy pages remain semantically structured with stable headings/lists, but this slice does not add structured data or AI-facing content.                                                                                                                                    | semantic page review                                          | `4/5`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this changes no analytics event taxonomy, payload, persistence, dashboard, KPI definition, attribution, logging, or consent behavior.                                                                                                                                                    | explicit analytics scope rationale                            | `N/A`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: privacy copy references Stripe/payment records, but this slice changes no pricing, checkout, entitlement, billing, refund, payout, revenue report, or finance data.                                                                                                                 | commerce behavior unchanged review                            | `4/5`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support diagnostic, recovery workflow, runbook procedure, support escalation, or operator support process.                                                                                                                                                 | explicit support-ops scope rationale                          | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, invoice/refund path, payout, finance report, entitlement, revenue recognition data, or reporting operation.                                                                                                                                              | explicit finance scope rationale                              | `N/A`                   |
| i18n operational readiness                    | `target`     | Tokenized policy rows and fallback actions remain layout-safe on mobile/desktop without fixed-width text assumptions that would block later localization; compact headings and action groups use hierarchy-aware rows instead of accidental wrapping.                                                | screenshot text-fit review                                    | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next server pages, `PageTemplate`, `SiteChrome`, `Link`, and global `fs-*` tokens; add no dependency, new broad primitive, API, or config.                                                                                                                                            | changed-files/dependency diff                                 | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused page tests for token/action classes and preserved QR fallback behavior; run brief lint, targeted tests, route sweep, diff check, and screenshot handoff before broad gates.                                                                                                              | targeted tests + lint + screenshot artifacts + later gates    | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: array-driven policy rows and mapped QR fallback copy render through shared classes with no backend, storage, service, or traffic-dependent cost increase.                                                                                                                           | implementation review                                         | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR is reversible by normal git revert and contains no migration, env/config, package, workflow, deployment setting, or data repair requirement.                                                                                                                                                  | git diff review + validation gates                            | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep all three pages as their current route-owned server components.
  - Reuse existing `SiteChrome`, `PageTemplate`, and `next/link`.
  - Do not change route params, search param parsing semantics, metadata, cache behavior, redirect routes, or API boundaries.
- TypeScript/domain contracts:
  - Preserve `REASON_COPY`, `PROCESSORS`, `RETENTION_ROWS`, `readSingleParam`, and `getSafeRetryPath` semantics.
  - Deterministic invariant: unknown QR fallback reasons keep using the lookup-failed copy, and retry links only render for safe `/go/v/` paths.
- Supabase/data layer:
  - N/A; no migration, RLS/authz, generated DB type, query, storage, index, or data access change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, webhook, SDK, secret, retry policy, or observability integration change.
- UI system:
  - Reference surfaces: `/claim`, `/checkout/success`, current My Library/admin `fs-library-card` token direction, and QR Registry fallback/status copy contracts.
  - Use `fs-library-card`, `fs-library-card-accent`, `fs-library-card-muted`, token colors, token radius, and `fs-cta-primary`/`fs-cta-secondary` where appropriate.
  - Apply the AW-006 mobile action-group rule for three visible actions: avoid an orphan final-row action; when one clear primary exists, render the primary full-width above two equal secondary actions on mobile, with compact row layout allowed on desktop.
  - Apply the AW-006 compact card heading rule: modal-like fallback/support cards on mobile use panel-scale headings, not hero-scale headings, so actions and recovery copy retain room.
  - Screenshot handoff comparison type: `before/after` for `/privacy`, `/cookies`, and `/go/unavailable` on representative desktop/mobile viewports.
- Testing:
  - Add focused unit/page tests for public policy pages and QR fallback token/action parity.
  - Preserve existing QR redirect policy and route tests.

## Data Placement And Sync Contract

N/A with rationale: this presentation cleanup introduces no new local-only data, server-canonical data, browser storage, sync behavior, conflict policy, retention rule, sensitive-data handling, or cache invalidation. Existing static policy arrays and QR fallback query-param rendering remain route-local display data.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, alias, redirect, rename rule, or migration behavior. Existing QR slugs are only displayed or used in the existing safe retry path as today.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Privacy processor rows, retention rows, policy sections, cookie policy sections, and QR fallback reason copy.
- Source of truth:
  - Policy rows continue to render from `PROCESSORS` and `RETENTION_ROWS`.
  - QR fallback copy continues to render from `REASON_COPY`; safe retry behavior remains owned by `getSafeRetryPath`.
- Additive behavior:
  - New processor or retention rows should inherit the same row/card treatment automatically through the existing arrays.
  - Existing QR fallback reasons continue to inherit the same fallback page shell and action hierarchy.
  - Existing QR fallback action sets continue to inherit the mobile action-group layout without adding reason-specific layout branches.
- Explicit mapping requirements:
  - New QR reason keys, new policy sections with different hierarchy, new legal/consent behavior, new processor category, new support workflow, or action sets with different priority/quantity require explicit copy/mapping/layout review, tests, and docs review.
- Unknown or deprecated values:
  - Unknown QR reasons continue to fall back to the generic lookup-failed message.
  - Unsafe retry values continue to suppress the retry action.
- Test/evidence:
  - Focused tests prove class/token adoption, preserved policy rows, safe retry rendering, unsafe retry suppression, and unchanged support/course links.

## Help / Guide Impact

N/A with rationale: this slice preserves visible workflow labels, support destinations, policy meaning, QR fallback recovery behavior, Help/Guide assertions, support procedures, and operator-facing instructions. Help/Guide or runbook updates are required only if implementation changes labels, workflow meaning, recovery behavior, support procedure, payments, auth, privacy practice, or private-gate behavior.

## Route / Label / Support Surface Sweep

Required as a targeted public/support sweep because this slice changes visible public support/policy rendering.

- Identifiers to search before broad gates:
  - `Privacy Policy`
  - `Cookie Policy`
  - `QR link unavailable`
  - `QR link status`
  - `Retry QR link`
  - `Open course`
  - `Contact support`
  - `REASON_COPY`
  - `getSafeRetryPath`
  - `/privacy`
  - `/cookies`
  - `/go/unavailable`
- Surfaces to check:
  - `app/privacy/page.tsx`
  - `app/cookies/page.tsx`
  - `app/go/unavailable/page.tsx`
  - `app/go/v/[slug]/route.ts`
  - `tests/unit/go-video-redirect-route.test.ts`
  - public route tests
  - `docs/app-knowledge-book/`
  - `docs/runbooks/`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/task-briefs/done/`
- Expected fallout:
  - page presentation updates,
  - focused unit/page tests,
  - active brief checkpoint updates,
  - canonical AW-006 queue and design inventory update,
  - screenshot artifacts,
  - no Help/Guide, runbook, policy wording, API, QR redirect, analytics, auth, Supabase, Stripe, entitlement, package, config, or workflow change.
- Sweep execution evidence (`2026-06-01`):
  - Identifiers searched: `Privacy Policy`, `Cookie Policy`, `QR link unavailable`, `QR link status`, `Retry QR link`, `Open course`, `Contact support`, `REASON_COPY`, `getSafeRetryPath`, `/privacy`, `/cookies`, and `/go/unavailable`.
  - Surfaces checked: `app/`, `components/`, `tests/`, `docs/app-knowledge-book/`, `docs/runbooks/`, `docs/design/notice-empty-state-pattern-inventory.md`, and active/planned/done task briefs.
  - Fallout handled: implementation and tests stay limited to the three public pages plus one focused unit/page test; AW-006 queue and design inventory are updated; existing app-knowledge, runbook, sitemap, QR redirect route, and policy lifecycle references remain valid because labels, legal meaning, metadata, redirect policy, support procedure, APIs, auth, analytics, Supabase, and Stripe behavior are unchanged.

## Scope

- Align `app/privacy/page.tsx` with current AW-006 page/card/action tokens while preserving policy text, metadata, processor rows, retention rows, rights links, and contact/cookie links.
- Align `app/cookies/page.tsx` with current AW-006 page/card/action tokens while preserving policy text, metadata, consent boundary, contact/privacy links, and storage meaning.
- Align `app/go/unavailable/page.tsx` with current AW-006 page/card/action tokens and the mobile action-group rule while preserving reason copy, slug display, retry suppression, retry link, course link, support link, metadata, and robots behavior.
- Add focused tests for token/action classes and unchanged QR fallback behavior.
- Update canonical AW-006 queue and design inventory.
- Capture screenshot handoff artifacts for changed public UI before broad PR gates.

## Out Of Scope

- Legal/policy wording changes, last-updated date changes, consent behavior, cookie/storage behavior, data rights endpoints, QR redirect route behavior, QR allowlist behavior, QR slug/status behavior, safe retry validation semantics, metadata/canonical/robots behavior, support procedures, Help/Guide/runbooks, auth, Supabase, Stripe, analytics, entitlements, API routes, public route IA changes, broad public redesign, new shared primitives, packages, configs, workflows, and merge to `main`.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves screenshots.

## Acceptance Criteria

1. `/privacy`, `/cookies`, and `/go/unavailable` use current AW-006 `fs-*` card/action/token direction instead of older route-local rounded card/button styling.
2. Policy content, last-updated values, metadata/canonical behavior, rights links, support links, and storage/processor/retention meanings remain unchanged.
3. QR fallback reason copy, unknown-reason fallback, slug display, safe retry rendering, unsafe retry suppression, course link, support link, and robots noindex behavior remain unchanged.
4. QR fallback mobile actions avoid an orphan final-row button: safe retry spans full width as the clear primary action, course/support render as two equal secondary actions, and desktop remains compact.
5. QR fallback mobile heading uses compact card scale instead of hero scale, while desktop heading scale remains unchanged.
6. Headings, lists, links, and action controls remain semantic, keyboard reachable, contrast-safe, and mobile text-fit safe.
7. Future processor/retention rows inherit the same visual treatment automatically through existing arrays.
8. New QR reason keys require explicit mapping; unknown reasons keep the safe lookup-failed fallback.
9. Focused tests, brief lint, route/label/support sweep, `git diff --check`, and screenshot handoff are completed before broad gates.
10. Work stops after screenshot handoff until owner approval.

## Validation

- Targeted during implementation:
  - `./node_modules/.bin/vitest run tests/unit/public-policy-and-qr-fallback-pages.test.tsx`
  - `./node_modules/.bin/vitest run tests/unit/go-video-redirect-route.test.ts tests/unit/qr-redirect-policy.test.ts`
  - `npm run lint:briefs:all`
  - `npm run lint:quality-gates`
  - `npm run typecheck`
  - `npx eslint app/privacy/page.tsx app/cookies/page.tsx app/go/unavailable/page.tsx tests/unit/public-policy-and-qr-fallback-pages.test.tsx`
  - targeted route/label/support sweep listed above
  - `git diff --check`
- Visual gate:
  - Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
  - Capture representative `before/after` screenshots against `http://127.0.0.1:3000`.
  - Stop for owner screenshot approval before `npm run verify:pre-pr`.
- Broad gates after screenshot approval:
  - `npm run verify:pre-pr`
  - required PR CI checks
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS/npm available through the repo's normal `nvm use --silent` path.
- Browser screenshot capture uses the local Freeswimming screenshot default from `docs/runbooks/ui-debug-hypothesis-and-handoff.md`.

## Checkpoint Log

- `2026-06-01 | in-progress | started from clean main@572a286 after PR #930 and repo-managed closeout #931; post-merge preflight passed with no closeout remaining; owner approved Public Policy And QR Fallback Token/Action Parity after fresh queue/design/code re-audit | next: implement scoped public policy/QR fallback token-action parity, update tests/docs, run targeted QA, then capture screenshot handoff before broad PR gates`
- `2026-06-01 | in-progress | implemented token/action/card parity for /privacy, /cookies, and /go/unavailable; added focused unit/page coverage; updated AW-006 queue and design inventory; targeted Vitest, ESLint, typecheck, brief lint, quality gates, route/label/support sweep, and git diff whitespace checks are green | next: capture before/after screenshot handoff and stop for owner visual approval before npm run verify:pre-pr`
- `2026-06-01 | screenshot handoff | captured before/after screenshot artifacts in output/playwright/aw-006-public-policy-qr-fallback-token-parity-2026-06-01-015426 for privacy desktop, cookies mobile, and QR unavailable mobile; local dev indicator was removed from capture artifacts only | next: owner visual approval, then npm run verify:pre-pr`
- `2026-06-01 | visual correction | owner approved turning the mobile orphan-action concern into a rule; QR fallback now renders safe retry full-width above equal course/support secondary actions on mobile, while desktop stays compact; design inventory and tests record the rule | next: rerun targeted QA, refresh screenshot handoff, then stop again for owner visual approval`
- `2026-06-01 | visual correction | owner confirmed compact-card heading rule; QR fallback mobile heading reduced from hero-like scale to panel scale while keeping desktop scale unchanged; tests and design inventory record the rule | next: rerun targeted QA, refresh screenshot handoff, then stop again for owner visual approval`
- `2026-06-01 | screenshot handoff | refreshed before/after screenshot artifacts in output/playwright/aw-006-public-policy-qr-fallback-token-parity-2026-06-01-073111 after mobile action-group and compact-heading corrections; privacy desktop, cookies mobile, and QR unavailable mobile captures have expected dimensions and no local dev indicator | next: owner visual approval, then npm run verify:pre-pr`
