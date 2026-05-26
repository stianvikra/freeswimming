# Task Brief: AW-006 Guide Access Required State Parity (10/10)

## Metadata

- `id`: `2026-05-26-aw-006-guide-access-required-state-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-26`
- `updated`: `2026-05-26`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-guide-access-required-state-parity`
- `execution_mode`: `end-to-end implementation after explicit owner execute instruction`

## Brief Audit Record

- `last_audited`: `2026-05-26`
- `base`: `main@6c0f19a`
- `audit_status`: `ready`
- `decision`: Execute this as the current owner-approved PR-sized AW-006 UI slice.
- `reason`: PR `#855` and repo-managed closeout PR `#856` are merged, `main` is clean at `6c0f19a`, `npm run post-merge:preflight` was reported green with no pending closeout, the fresh queue/design/code re-audit found duplicated older guide access-required cards on `/guides/0-1000m` and `/guides/poolside`, and the owner explicitly said `execute AW-006 Guide Access Required State Parity`.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, guide product/catalog IDs, guide entitlement rules, `/guides/0-1000m`, `/guides/poolside`, guide PDF routes, `GuidePdfDownloadButton`, guide tracker sync surfaces, screenshot handoff rules, forward compatibility rules, or verification lanes change before execution.

## Goal

Make the signed-in no-entitlement state on the two guide routes feel consistent with current AW-006 card/action/state direction while preserving guide access, entitlement checks, PDF downloads, and tracker behavior.

## Pre-Implementation Owner Explanation

Jeg skal rydde den synlige "Guide access required"-tilstanden på `/guides/0-1000m` og `/guides/poolside`. Det betyr noe fordi innloggede brukere uten guide-tilgang nå møter et eldre, duplisert kort som ikke følger samme tydelige kort/action-hierarki som nyere AW-006-flater. Utenfor scope er entitlements, Stripe, Supabase, PDF-API, guideinnhold, tracker/sync og checkout.

Fremoverkompatibilitet: løsningen skal være guide-konfigurert, slik at nye guider kan få samme tilgangstilstand via data/mapping, med trygg fallback for ukjente guider.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Accessibility`
- `Reliability and failure handling`
- `Security and authz`
- `Commerce and revenue ops`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                              | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/guides/0-1000m` and `/guides/poolside` keep the same guide route purpose while the no-access state gives clear next actions to plans and My Library.                          | route render tests + screenshot handoff     | `5/5`                   |
| UX flow clarity                               | `target`     | Signed-in users without entitlement see one clear reason for blocked access and two safe actions: view plans or return to My Library.                                           | component/route tests + screenshot handoff  | `5/5`                   |
| Visual design quality                         | `target`     | Access-required cards use current AW-006 token/action hierarchy without nested page-card sprawl, unrelated redesign, or text overflow on mobile/desktop.                        | before/after screenshots + diff review      | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Entitlement lookup, guest entitlement attachment, guide content loading, PDF route calls, and redirect behavior remain unchanged except presentation.                           | changed-files review + route tests          | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes no admin editor, admin CRUD, publishing workflow, operator queue, or admin action surface.                                                       | explicit admin-editor scope rationale       | `N/A`                   |
| Accessibility (a11y)                          | `target`     | The no-access state keeps a semantic heading, readable body copy, keyboard-reachable links, visible focus, and no noisy live region for a static state.                         | Testing Library assertions + screenshots    | `5/5`                   |
| Accessibility                                 | `target`     | Same target as `Accessibility (a11y)` for closeout-lint alias compatibility.                                                                                                    | Testing Library assertions + screenshots    | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency, media asset, fetch, client state model, polling, or measurable route payload growth beyond small shared markup/classes.                                      | dependency diff + broad gate evidence       | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Access state remains server-rendered from existing user-scoped entitlement rows; no browser persistence, local sync, or optimistic access state is introduced.                  | data-boundary review + unchanged queries    | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this slice changes no route cache mode, fetch cache, revalidation, invalidation trigger, CDN behavior, or stale-data policy.                                        | explicit cache scope rationale              | `N/A`                   |
| Reliability and failure handling              | `target`     | Entitlement lookup errors keep the existing safe no-access behavior and do not introduce unexpected `500`s or dead-end UI.                                                      | route tests + failure-path review           | `5/5`                   |
| Security and authz                            | `target`     | Guide access remains fail-closed: anonymous users redirect to sign-in, signed-in users without entitlement cannot see protected guide content or PDF artifacts.                 | auth/entitlement route review + tests       | `5/5`                   |
| Privacy and compliance                        | `target`     | UI copy must not expose entitlement row IDs, Stripe customer IDs, raw provider diagnostics, user email, or purchase details.                                                    | copy/error review                           | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this planned brief, and notice/state inventory record the approved guide access slice without stale active references.                                  | docs diff + brief lint                      | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this slice changes no admin workflow label, mutation, Help/Guide action, operator recovery behavior, or editability path.                                           | explicit admin-workflow scope rationale     | `N/A`                   |
| SEO and crawlability                          | `supporting` | Supporting only: guide routes are protected utility/product routes; this changes no metadata, sitemap, robots, canonical URL, structured data, or public indexability contract. | route metadata review                       | `4/5`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity model, structured data, public semantic content, or AI-facing documentation contract.                                      | explicit AI-discoverability scope rationale | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no event taxonomy or payload change is planned; existing plans/My Library navigation remains observable through current link/navigation behavior.              | analytics scope review                      | `4/5`                   |
| Commerce and revenue ops                      | `target`     | The no-access state may point to `/plans` but must not change pricing, checkout, portal, entitlement grant, Stripe IDs, finance reconciliation, or purchase promises.           | commerce scope review + unchanged APIs      | `5/5`                   |
| Incident response and support operations      | `N/A`        | N/A with scope rationale: this changes no incident alert path, support workflow, operator diagnostic, runbook procedure, support escalation, or on-call flow.                   | explicit support-ops scope rationale        | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement write, or revenue data.         | explicit finance scope rationale            | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: touched English strings stay short, route-local, and layout-safe so future locale work can map guide-specific copy deliberately.                               | copy/layout review                          | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse Next server route ownership, existing catalog/guide constants, current Tailwind token direction, and focused tests; add no dependency or app-wide notice primitive.       | changed-files/dependency diff               | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused coverage for both access-required route states, run brief lint, targeted tests, screenshot handoff, pre-PR gate, CI, and pre-merge gate after visual approval.      | test output + screenshot artifacts + gates  | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: shared guide-local access markup reduces duplication and adds no service call, database query, asset, background job, or traffic-dependent cost.               | implementation review                       | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert restores prior cards; no migrations, env changes, dependency changes, workflow changes, provider settings, or feature flags are required.                     | git diff + validation evidence              | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep `/guides/0-1000m` and `/guides/poolside` as server routes with `dynamic = "force-dynamic"`.
  - Reuse a small guide-local access-required presentation contract instead of duplicating route markup.
  - Preserve current redirect, entitlement check, and guide content loading order.
- TypeScript/domain contracts:
  - Use existing guide constants and typed route-local config for title, description, product label, and safe actions.
  - Unknown guide/access config must fall back to generic guide access copy, not to product-specific false promises.
- Supabase/data layer:
  - No migrations, RLS/authz changes, generated DB type updates, storage changes, index changes, or query shape changes.
- External services/tools:
  - No Stripe, Supabase provider config, email provider, analytics vendor, SDK, webhook, secret, retry, or idempotency behavior changes.
- UI system:
  - Reference surfaces: current AW-006 public/member token card direction on `/plans`, `/my-library`, guide PDF feedback, and route-owned recovery states.
  - Avoid app-wide Notice/EmptyState primitives in this slice; keep the helper guide-local unless later reuse proves broader need.
  - Screenshot handoff type: `before/after` for both guide routes on desktop and one representative mobile viewport.
- Testing:
  - Add focused route/component coverage for no-entitlement access state on both guides.
  - Run screenshot handoff before broad gates because rendered UI changes.

## Data Placement And Sync Contract

- Server-canonical data:
  - Existing Supabase `entitlements` rows remain the source of truth for guide access.
  - Existing helper `attachGuestEntitlementsByEmail` remains best-effort entitlement repair before the read.
- Local data:
  - None introduced. This slice must not add localStorage, sessionStorage, cookies, local-only entitlement flags, or optimistic access state.
- Sync policy:
  - No new sync behavior. Existing server-rendered route load determines whether the user sees guide content or the access-required state.
- Retention and sensitivity:
  - UI copy must not expose entitlement IDs, user IDs, emails, Stripe IDs, provider diagnostics, or purchase details.
- Cache/invalidation:
  - No cache mode change; current `force-dynamic` route behavior remains.

## Identity And Rename Contract

- Canonical stable ID:
  - Guide access truth continues to use product IDs from existing guide/catalog constants and entitlement rows.
- Human-readable identifiers:
  - Guide titles/slugs remain existing route/product labels; this slice does not rename routes, slugs, product IDs, or titles.
- Mutability rules:
  - No persisted identifier mutability changes.
- Rename vs repurpose policy:
  - N/A for runtime behavior; any future guide rename/repurpose must be handled by catalog/product identity rules, not this visual slice.
- Compatibility contract:
  - Existing `/guides/0-1000m` and `/guides/poolside` routes remain stable.
- Observability and repair:
  - Existing entitlement lookup logging remains unchanged.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Touched: guide access-required presentation for guide products/routes.
  - Not touched: product catalog source of truth, entitlement writes, guide PDF route contracts, checkout, portal, analytics taxonomy, metadata, or support procedures.
- Source of truth:
  - Access stays derived from server-canonical entitlement rows and existing guide product constants.
  - Guide-specific no-access copy should be supplied through an explicit route-local config or helper mapping.
- Additive behavior:
  - A future guide can reuse the same access-required state by passing a new config with title/body/actions.
  - Generic layout, action hierarchy, and accessibility semantics should apply automatically to added guide configs.
- Explicit mapping requirements:
  - New guide products, product-specific copy, new access actions, new purchase/claim language, new PDF routes, or new entitlement product IDs require deliberate code/test/docs updates before release.
- Unknown or deprecated values:
  - Unknown guide configs must fail safely with generic access-required copy and no protected content.
  - Missing entitlement remains fail-closed; no fallback may imply purchase or access exists.
- Test/evidence:
  - Focused tests should cover both current guide configs and at least one generic fallback or duplicated-config guard.
  - Route/label/support sweep must include `/guides/0-1000m`, `/guides/poolside`, `Guide access required`, `View plans`, `Back to My Library`, and guide product labels.

## Help / Guide Impact

N/A with rationale: this changes presentation only for an existing no-entitlement state. It does not rename routes, product labels, workflow actions, recovery behavior, Help/Guide content, support procedures, admin instructions, checkout expectations, or entitlement rules.

## Route / Label / Support Surface Sweep

Required because guide route labels/actions and a protected access state are touched.

- Identifiers searched:
  - `/guides/0-1000m`
  - `/guides/poolside`
  - `Guide access required`
  - `0-1000m guide`
  - `Poolside guide`
  - `View plans`
  - `Back to My Library`
  - `GuidePdfDownloadButton`
  - `entitlement`
  - `Guide access`
- Surfaces checked:
  - `app/guides/`
  - `components/guides/`
  - `tests/`
  - `docs/task-briefs/planned/`
  - `docs/design/`
  - `docs/runbooks/`
  - `docs/app-knowledge-book/`
  - `docs/architecture/`
  - `docs/api-contracts.md`
- Expected fallout:
  - guide route presentation/helper,
  - focused tests,
  - this planned/active brief,
  - canonical AW-006 queue,
  - notice/state inventory.
  - no API contracts, route auth/cache registry, Help/Guide, support runbook, commerce, finance, Stripe, Supabase, or analytics fallout unless implementation discovers stale docs.

## Scope

- `app/guides/0-1000m/page.tsx`
- `app/guides/poolside/page.tsx`
- possible new guide-local presentation helper under `components/guides/`
- focused unit/route tests for no-entitlement access state
- canonical AW-006 queue and notice/state inventory updates
- before/after screenshot handoff artifacts

## Out Of Scope

- Entitlement query shape, entitlement write/repair behavior, `attachGuestEntitlementsByEmail`, Supabase schema/RLS/generated types, Stripe Checkout/Portal/webhook behavior, pricing/catalog data, product IDs, guide route slugs, guide content loading, guide tracker sync/progress, guide PDF APIs, PDF generation/assets, analytics taxonomy, Help/Guide, support procedures, metadata/sitemap/robots, broad design-system primitives, package/dependency/config/workflow changes, and merge to `main`.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves or waives screenshot review if rendered UI changes.

## Acceptance Criteria

1. `/guides/0-1000m` and `/guides/poolside` still redirect anonymous users to their current sign-in destinations.
2. Signed-in users without the relevant entitlement see a consistent access-required state on both guide routes.
3. The access-required state has clear, keyboard-reachable `View plans` and `Back to My Library` actions.
4. Entitled users still reach the guide tracker and PDF download controls without behavior changes.
5. No entitlement, Stripe, Supabase, PDF API, guide content, tracker sync, analytics, Help/Guide, or support behavior changes are introduced.
6. The shared guide access presentation is route-configurable and safe for future guide products.
7. Canonical AW-006 queue and notice/state inventory record this approved planned slice without stale active references.
8. Screenshot handoff is captured and approved or waived before `npm run verify:pre-pr` if rendered UI changes.

## Validation

Targeted during implementation:

- `npm run lint:briefs`
- focused route/component tests for guide access-required states
- targeted guide PDF/download tests if implementation touches adjacent guide controls
- `npm run typecheck`
- `npm run lint:quality-gates`
- `git diff --check`
- targeted route/label/support sweep for guide access identifiers

Visual gate:

- Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
- Capture representative `before/after` screenshots against `http://127.0.0.1:3000`.
- Required representative screenshots:
  - `before-guide-0-1000m-desktop.png`
  - `after-guide-0-1000m-desktop.png`
  - `before-guide-poolside-desktop.png`
  - `after-guide-poolside-desktop.png`
  - mobile before/after states for both guide configs when local capture is available.
- Owner screenshot approval stop: required before `npm run verify:pre-pr`, PR creation, and `npm run verify:pre-merge` if rendered UI changes.

Broad gates after screenshot approval or explicit waiver:

- `npm run verify:pre-pr`
- PR creation/update and CI monitoring
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS/npm available through the repo's normal `nvm use --silent` path.
- For implementation, release-gate commands follow repo escalation-first defaults where applicable.

## Manual QA Environments

Required because this is visible protected-route UI work.

- Local environment:
  - `http://127.0.0.1:3000/guides/0-1000m`
  - `http://127.0.0.1:3000/guides/poolside`
- Browser/device matrix:
  - desktop Chromium viewport,
  - mobile Chromium viewport if changed text/action layout could wrap.
- Required states:
  - anonymous redirect remains unchanged,
  - signed-in no-entitlement access state,
  - entitled route remains available where local fixtures allow it.

## Communication And Execution Mode

- Current mode: active implementation on branch `aw-006-guide-access-required-state-parity`.
- Use automation-first delivery within this brief's scope, with the screenshot approval stop before `npm run verify:pre-pr`.

## Checkpoint Log

- `2026-05-26 | planned | created after owner approved the Guide Access Required State Parity slice from clean main@6c0f19a; scope is limited to guide no-entitlement state presentation, focused tests, queue/inventory docs, and screenshot-reviewed UI parity; no runtime code has been changed yet | next: wait for explicit execute/build/implement instruction before moving to in-progress`
- `2026-05-26 | in-progress | owner explicitly said execute; moved brief to in-progress on branch aw-006-guide-access-required-state-parity | next: implement guide access state parity, run targeted validation, and capture screenshot handoff before broad gates`
- `2026-05-26 | implementation + screenshot checkpoint | added route-configurable GuideAccessRequiredState, replaced duplicated no-entitlement cards on /guides/0-1000m and /guides/poolside without changing auth, entitlement, PDF, tracker, checkout, Supabase, or Stripe behavior; targeted Vitest, lint:briefs:all, typecheck, lint, git diff --check, and route/label/support sweep passed, while lint:quality-gates initially required the sweep evidence labels to use the canonical "Identifiers searched" and "Surfaces checked" wording; captured before/after screenshots in output/aw-006-guide-access-required-state-2026-05-26-062040 via a temporary local visual route because /dev/login is blocked by the local Supabase egress guard, then removed the temporary route before validation | next: rerun lint:quality-gates and stop for owner screenshot approval before npm run verify:pre-pr`
- `2026-05-26 | screenshot approved | owner approved the screenshot handoff and approved merge once tests/checks are green | next: run npm run verify:pre-pr, commit, push, open PR, monitor CI, run npm run verify:pre-merge, and merge only after all required checks pass`
- `2026-05-26 | pre-pr gate | npm run verify:pre-pr PASS in full public lane; evidence artifact artifacts/test-runs/20260526-063056/verify.log; unit 209 files / 1240 tests passed, build passed, perf budgets passed with hold recommendation, and Playwright E2E passed with 101 passed / 487 skipped; local lint kept the pre-existing output/capture-aw006-dryland-feedback.mjs unused-variable warning only | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge`
- `2026-05-26 | merged | PR #857 merged as squash commit 27502a6 after owner screenshot approval, npm run verify:pre-pr PASS, GitHub required checks PASS, npm run verify:pre-merge PASS, and merge preflight PASS | next: repo-managed docs-only closeout moved this brief to done and refreshed queue/inventory references`

## Completion Record

- `completed`: `2026-05-26`
- `merged_pr`: `#857`
- `squash_commit`: `27502a608038559fedecaa57c8bd6d3c7b821125`
- `result`: Closed AW-006 Guide Access Required State Parity by replacing duplicated guide no-entitlement cards with a shared guide-local access-required state for `/guides/0-1000m` and `/guides/poolside`; preserved auth redirects, entitlement checks, guide content, PDF download controls, trackers, checkout, analytics, Help/Guide, support, Supabase, and Stripe behavior.
- `validation`: `./node_modules/.bin/vitest run tests/unit/guide-access-required-state.test.tsx` PASS; `npm run lint:briefs:all` PASS; `npm run typecheck` PASS; `npm run lint` PASS with only the pre-existing `output/capture-aw006-dryland-feedback.mjs` warning; `npm run lint:quality-gates` PASS; `git diff --check` PASS; targeted route/label/support sweep PASS; screenshot handoff approved from `output/aw-006-guide-access-required-state-2026-05-26-062040`; `npm run verify:pre-pr` PASS in `artifacts/test-runs/20260526-063811`; GitHub PR #857 required checks PASS including `verify` 14m47s, `e2e-smoke`, `site-lock-smoke`, `deploy-preview`, `CodeQL`, `PR Size`, and `Vercel`; `npm run verify:pre-merge` PASS in `artifacts/verify-pre-merge/20260526-045105.json`; `npm run merge:preflight -- --assert-ready` PASS.
- `10/10 claim`: yes - all critical target categories listed below reached `5/5`.

Critical target categories confirmed `5/5`: Product goals and IA, UX flow clarity, Visual design quality, Business logic correctness and data integrity, Accessibility (a11y), Accessibility, Reliability and failure handling, Security and authz, Commerce and revenue ops, Stack-fit and dependency discipline, Testing and QA automation, DevOps and rollback readiness.

| Category                                      | Achieved Score | Evidence                                                                                                                                                                                                                       | Gaps / Notes |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| Product goals and IA                          | `5/5`          | PR #857 replaced guide no-entitlement cards with the shared access-required state while keeping `/guides/0-1000m` and `/guides/poolside` route purpose; focused route tests and screenshot handoff covered both guide configs. | None.        |
| UX flow clarity                               | `5/5`          | Component and route tests assert `Guide access required`, route-specific body copy, `View plans`, and `Back to My Library`; owner approved before/after screenshot handoff.                                                    | None.        |
| Visual design quality                         | `5/5`          | Screenshot artifacts in `output/aw-006-guide-access-required-state-2026-05-26-062040` show desktop and mobile before/after parity using AW-006 card/action hierarchy.                                                          | None.        |
| Business logic correctness and data integrity | `5/5`          | Focused tests cover anonymous redirects, signed-in no-entitlement states, entitlement product IDs, guest entitlement attachment call preservation, and unchanged entitled-route behavior boundaries.                           | None.        |
| Accessibility (a11y)                          | `5/5`          | Testing Library assertions verify semantic heading/action links; full `npm run verify:pre-pr`, CI `verify`, and existing a11y smoke passed.                                                                                    | None.        |
| Accessibility                                 | `5/5`          | Same evidence as `Accessibility (a11y)` for closeout-lint alias compatibility.                                                                                                                                                 | None.        |
| Performance (CWV + payloads)                  | `5/5`          | No dependencies, media, client state, polling, new fetches, or route cache changes; `npm run verify:pre-pr` build and perf budgets passed with hold recommendation.                                                            | None.        |
| Data placement and sync boundaries            | `5/5`          | Access state remains server-rendered from existing user-scoped entitlement checks; no local persistence, sync, or optimistic access state added.                                                                               | None.        |
| Reliability and failure handling              | `5/5`          | Existing fail-closed no-access behavior remains; route tests and changed-file review verified no new error path, API route, PDF route, or tracker recovery behavior.                                                           | None.        |
| Security and authz                            | `5/5`          | Anonymous users still redirect, signed-in users without entitlement still cannot see guide content/PDF artifacts, and product ID checks remain tied to existing entitlement queries.                                           | None.        |
| Privacy and compliance                        | `5/5`          | New copy exposes no entitlement row IDs, Stripe IDs, user email, provider diagnostics, purchase details, or raw errors.                                                                                                        | None.        |
| Content governance                            | `5/5`          | This done brief, AW-006 queue, and notice/state inventory were updated; `npm run lint:briefs:all` and `npm run lint:quality-gates` passed.                                                                                     | None.        |
| Commerce and revenue ops                      | `5/5`          | CTA links to `/plans` without pricing, checkout, portal, entitlement grant, Stripe ID, finance reconciliation, or purchase-promise changes; scope review and unchanged API/provider files confirm boundary.                    | None.        |
| Stack-fit and dependency discipline           | `5/5`          | Added a guide-local server-compatible component using existing Next/Link and Tailwind/token conventions; no dependency, config, workflow, or broad design-system primitive changes.                                            | None.        |
| Testing and QA automation                     | `5/5`          | Focused Vitest tests, brief lint, typecheck, lint, quality gates, route/label/support sweep, screenshot handoff, `npm run verify:pre-pr`, GitHub checks, `npm run verify:pre-merge`, and merge preflight all passed.           | None.        |
| DevOps and rollback readiness                 | `5/5`          | PR #857 squash commit `27502a6` can be reverted directly; no migrations, env changes, feature flags, dependencies, workflows, provider settings, or data migrations are involved.                                              | None.        |
