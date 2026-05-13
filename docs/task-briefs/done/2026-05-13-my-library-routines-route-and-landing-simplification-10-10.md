# Task Brief: My Library Routines Route And Landing Simplification (10/10)

## Metadata

- `id`: `2026-05-13-my-library-routines-route-and-landing-simplification-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-13`
- `updated`: `2026-05-13`

## Goal

Make My Library a calmer scan-first overview by moving the full `My Routines` working surface to a focused canonical route shared by Home and the My Library `Open` row.

## Product Decision

`My Library` is the account overview. It should show one simple `My Routines` row with `Open`, matching the other top-level rows and without helper copy. `My Routines` is the working surface for micro-sessions, habits, and today's routine state, so it should live on its own protected route.

The canonical routines destination for this slice is `/my-library/routines`. Signed-in Home and My Library must both route there. Existing `/my-library/habits` and `/my-library/dryland` routes remain direct destination surfaces for their deeper editors and execution details.

## Relevance Assessment Before Scoring

Relevant target categories are authenticated IA, UX flow clarity, visual simplification, a11y, protected routing, data-boundary preservation, reliability, support docs, and testing. Admin editing, commerce, finance, SEO, and AI discoverability are not primary because this slice changes a private authenticated navigation surface without data model, checkout, or public crawl behavior changes.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
- Reliability and failure handling
- Security and authz
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                           | Evidence                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library` becomes a scan-first overview row for `My Routines`; `/my-library/routines` becomes the canonical focused working surface.     | route/component tests + screenshot handoff         | `5/5`                   |
| UX flow clarity                               | `target`     | Signed-in Home and My Library `Open` reach the same routines destination in one click; anonymous users still hit fail-closed sign-in.        | unit/e2e coverage + route review                   | `5/5`                   |
| Visual design quality                         | `target`     | My Library row matches existing menu-row style with heading left, `Open` right, no undertext, and no inline routines workspace clutter.      | before/after screenshot handoff                    | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Navigation changes do not mutate habit, micro-session, dryland, course, entitlement, workout, or program truth.                              | code review + targeted tests                       | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor, dashboard, publish, or operator CRUD workflow changes in this slice.                                            | explicit scope rationale                           | `N/A`                   |
| Accessibility (a11y)                          | `target`     | The `My Routines` row exposes visible text and keyboard-reachable `Open`; the focused route keeps tab/link semantics intact.                 | Testing Library/e2e assertions + screenshot review | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | `/my-library` removes inline habits/routines workspace rendering and adds no dependency; `/my-library/routines` reuses existing client code. | dependency diff + build/perf gate                  | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Routine facts remain server-canonical in existing stores; selected routines tab stays local client state; no new persistence is introduced.  | brief contract + implementation review             | `5/5`                   |
| Caching and invalidation strategy             | `target`     | `/my-library` and `/my-library/routines` remain dynamic authenticated routes; downstream mutation/cache behavior is unchanged.               | route/cache review                                 | `5/5`                   |
| Reliability and failure handling              | `target`     | Missing habits or micro-plan schema still leaves the routines route navigable with existing fallback states and My Library row usable.       | component/e2e coverage + manual QA                 | `5/5`                   |
| Security and authz                            | `target`     | `/my-library/routines` is protected server-side and redirects anonymous users to sign-in with a safe `next` path.                            | route guard review + e2e negative path             | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no new personal data, cookies, analytics payloads, exports, or sensitive habit labels are introduced.                       | privacy/no-event review                            | `4/5`                   |
| Content governance                            | `supporting` | Supporting only: private IA labels and support docs are updated; no public content model or editorial source-of-truth changes.               | route/label/support sweep                          | `4/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, role, status, editability, approval, or audit trail surface is changed.                                       | explicit scope rationale                           | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is an authenticated private route change and does not alter public metadata, sitemap, robots, canonicals, or crawlability.  | explicit scope rationale                           | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-discoverable content, structured data, or semantic entity page is introduced.                                       | explicit scope rationale                           | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no new analytics taxonomy ships; existing route-level events remain unchanged unless already present on child surfaces.     | analytics contract review                          | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: My Library purchase/entitlement rows remain intact; no checkout, entitlement, or catalog behavior changes.                  | My Library regression coverage                     | `4/5`                   |
| Incident response and support operations      | `target`     | Support/user-flow docs describe that `My Routines` is a focused route reached from Home and My Library.                                      | runbook/user-flow updates + tests                  | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice has no invoice, payout, refund, subscription, entitlement reconciliation, or finance reporting impact.                | explicit finance scope rationale                   | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: changed private labels remain concise and localizable; no locale routing or translation workflow ships here.                | copy review                                        | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `TodayTabsPanel`, existing My Library row style, Next route guards, Tailwind tokens, and current test stack; add no dependency.        | dependency diff + architecture review              | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit/e2e coverage protects Home href, My Library simple row, direct routines destination, and anonymous redirect.                            | targeted tests + screenshot handoff + verify gates | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no polling, background work, new DB tables, or fan-out queries are introduced; the landing page sheds one data load.        | query/dependency review                            | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback is a normal PR revert; no migration, generated type update, or data repair is required.                                             | PR summary + pre-pr/pre-merge gates                | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `TodayTabsPanel` as the mature routines reference surface,
  - keep authenticated data loading server-side on the new route,
  - keep tab switching client-local inside the existing component,
  - use standard `Link` for My Library row and Home action navigation,
  - keep both `/my-library` and `/my-library/routines` as `force-dynamic` authenticated routes.
- TypeScript/domain contracts:
  - do not alter `TodaySurfaceState`, habit snapshots, dryland snapshots, or completion semantics,
  - only change route/link contracts and tests.
- Supabase/data layer:
  - no migration, RLS, generated type, index, storage, or API route change,
  - existing protected route guards remain the auth boundary.
- External services:
  - no external SDK, webhook, secret, retry, or observability integration change.
- UI system:
  - reference surface for the landing row is existing My Library rows such as `My Swim Profile`, `Goals`, `Swim Sessions`, and `Dryland Sessions`,
  - reference surface for the working area is `TodayTabsPanel`,
  - screenshot handoff is `before/after` for Home/My Library/routines route where practical.
- Testing:
  - update Home unit/e2e tests,
  - update My Library landing e2e,
  - add direct routines route e2e coverage including anonymous redirect,
  - keep targeted component tests for `TodayTabsPanel` intact.

## Data Placement And Sync Contract

- Server-canonical:
  - authenticated user identity,
  - habits and habit check-ins,
  - dryland sessions and micro-plan state,
  - existing My Library product/entitlement/workout/program facts.
- Local-only:
  - selected tab inside `TodayTabsPanel`.
- Sync policy:
  - no new sync path; links route to existing canonical surfaces and APIs,
  - routines route reads current server snapshots on request.
- Retention and sensitivity:
  - no new data is stored,
  - do not log emails, habit labels, auth cookies, or routine details.
- Cache/invalidation:
  - `/my-library` remains `force-dynamic`,
  - `/my-library/routines` is `force-dynamic`,
  - existing downstream writes and reload behavior remain unchanged.

## Identity And Rename Contract

- Canonical stable ID:
  - route identity `/my-library/routines` becomes the canonical routines destination for Home and My Library.
- Human-readable identifiers:
  - `My Routines`, `Open`, `Micro Sessions`, and `Habits` are display labels and may be copy-edited with a route/label sweep.
- Mutability rules:
  - tab ids `micro-sessions` and `habits` remain stable UI ids,
  - existing `/my-library/habits` and `/my-library/dryland` route identities remain valid.
- Rename vs repurpose policy:
  - do not repurpose `/my-library/habits` or `/my-library/dryland`; use `/my-library/routines` as a hub over the two existing routine areas.
- Compatibility contract:
  - old Home anchor `/my-library#my-library-routines-heading` is replaced in first-party links only; no redirect is required because `/my-library` remains valid.
- Observability and repair:
  - route/link tests catch first-party regressions where Home or My Library drift away from the canonical routines route.

## Scope

- Add protected `/my-library/routines`.
- Move the full `TodayTabsPanel` routines working surface from inline My Library landing to the new route.
- Replace the landing surface with one simple `My Routines` row and `Open` action, no undertext.
- Point signed-in Home `My Routines` to `/my-library/routines`.
- Update route/label/support docs and tests for the new canonical destination.
- Capture screenshot handoff before broad PR gates.

## Out Of Scope

- Data model, Supabase migration, RLS, generated type, or API changes.
- New analytics taxonomy.
- Subscription gating.
- Habits or dryland feature redesign beyond moving the existing routines panel.
- Unrelated My Library row redesign.
- Public SEO or sitemap changes.
- Merge without explicit owner approval.

## Acceptance Criteria

1. Signed-in Home `My Routines` links to `/my-library/routines`.
2. `/my-library` shows a simple `My Routines` row with `Open` and no row undertext.
3. `/my-library` no longer renders the full routines tab workspace inline.
4. `/my-library/routines` renders the focused routines workspace with existing Micro Sessions and Habits tabs/actions.
5. Anonymous access to `/my-library/routines` redirects to `/auth/sign-in?next=%2Fmy-library%2Froutines`.
6. Existing `/my-library/habits` and `/my-library/dryland` routes remain valid.
7. Targeted unit/e2e tests pass before screenshot handoff.
8. Owner approves screenshot handoff before `npm run verify:pre-pr`, PR creation, and `npm run verify:pre-merge`.

## Validation

- `npm run lint:briefs`
- targeted unit/component tests:
  - `tests/unit/home-page-routines-entrypoint.test.tsx`
  - `tests/unit/today-tabs-panel.test.tsx`
- targeted e2e:
  - `tests/e2e/home-routines-entrypoint.spec.ts`
  - `tests/e2e/my-library-landing-entrypoints.spec.ts`
  - new/updated direct routines route coverage
- route/label/support sweep before broad gates
- screenshot handoff before broad PR gates
- after screenshot approval:
  - `npm run verify:pre-pr`
  - PR CI checks
  - `npm run verify:pre-merge`

## Help / Guide Impact

Required for this user-workflow route change:

- update `docs/user-flow-map.md`,
- update `docs/runbooks/auth-account-support.md`,
- update admin page-note context/help assertion if `/my-library/routines` is treated as a selected My Library hub.

## Route / Label / Support Surface Sweep

Run targeted sweep for `My Routines`, `Routines`, `/my-library/routines`, `/my-library#my-library-routines-heading`, `/my-library/habits`, `/my-library/dryland`, `Open`, and `my-library-today-tabs` before broad verification.

Identifiers searched: `My Routines`, `Routines`, `/my-library/routines`, `/my-library#my-library-routines-heading`, `/my-library/habits`, `/my-library/dryland`, `Open`, and `my-library-today-tabs`.

Surfaces checked: `app/`, `components/`, `lib/`, `tests/`, `docs/`, `scripts/`, `package.json`, and this active brief.

Fallout handled in this slice: Home route target, My Library landing row, new routines route, routines component accessible heading reuse, admin page-note hub registry, admin Help Center assertion, user-flow map, account support runbook, Home unit/e2e coverage, My Library landing e2e coverage, and direct routines route e2e coverage. The old `/my-library#my-library-routines-heading` target has no remaining first-party runtime reference; it remains mentioned only in this sweep evidence.

## Screenshot Artifact Handoff

Screenshot artifacts: `output/playwright/my-library-routines-route-2026-05-13-061217`

Captured: `2026-05-13 06:12` local time.

Screenshot comparison naming:

- `before-my-library-desktop.png`
- `after-my-library-desktop.png`
- `after-my-library-mobile.png`
- `after-routines-route-desktop.png`

Comparison type: `before/after` for My Library landing and `after` coverage for the focused routines route.

Known caveat: local auth-backed capture is blocked by the existing dev-login/Supabase HTML response, so `before-my-library-desktop.png` reuses the prior approved My Library screenshot from `output/playwright/my-library-dryland-ia-cleanup-20260511-101559`, and the after screenshots were captured through a temporary local preview route that rendered the affected components with deterministic snapshots. The preview route and capture script were removed after capture. After this capture, the visible label casing changed from `My routines` to `My Routines`; on `2026-05-13`, the owner explicitly waived a refreshed screenshot handoff for that casing-only visual change and asked to continue.

## Session Continuity

- Canonical source of truth: branch `my-library-routines-route` and this brief.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint.

## Checkpoint Log

- `2026-05-13 | working tree | started from clean main at 52f4ac5 after PR #690 and auto-closeout PR #691; created branch my-library-routines-route and scoped canonical /my-library/routines slice | next: implement route, landing row, links, docs, and targeted tests before screenshot handoff`
- `2026-05-13 | working tree | implemented protected /my-library/routines, replaced inline My Library Routines workspace with a simple Open row, pointed Home to the canonical route, updated support/admin references, and completed route-label-support sweep | next: run targeted lint/unit/e2e validation, then capture screenshot handoff before verify:pre-pr`
- `2026-05-13 | screenshot-ready | targeted validation passed: npm run lint:briefs:all PASS, npm run lint PASS, npm run typecheck PASS, targeted Vitest PASS (3 files, 9 tests), targeted Playwright PASS for anonymous Home and anonymous routines redirect with 3 auth-dependent tests skipped on known local dev-login/Supabase HTML response; screenshot artifacts captured at output/playwright/my-library-routines-route-2026-05-13-061217 and temporary preview route removed | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-05-13 | working tree | updated visible casing to My Routines across Home, My Library, routines route, support/admin labels, docs, and tests; reran targeted lint/unit/typecheck/e2e with same known auth-dependent skips; owner waived refreshed screenshot for casing-only visual change | next: npm run verify:pre-pr`
- `2026-05-13 | pre-pr-ready | npm run verify:pre-pr PASS full lane: branch-current, quality gates, lint, typecheck, 191 unit files / 1055 tests, build, perf budgets, and Playwright E2E 84 passed / 402 skipped; perf budget trend recommended tightening after 5 green weekly runs, held out of this IA slice and recorded for PR owner decision | next: commit and open PR`
