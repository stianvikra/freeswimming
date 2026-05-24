# Task Brief: AW-006 Goals Feedback Semantics (10/10)

## Metadata

- `id`: `2026-05-24-aw-006-goals-feedback-semantics-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-24`
- `updated`: `2026-05-24`
- `parent_review_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-goals-feedback-semantics`
- `execution mode`: `end-to-end implementation after owner approved the selected AW-006 slice`

## Brief Audit Record

- `last_audited`: `2026-05-24`
- `base`: `main@51f6d04`
- `audit_status`: `ready`
- `decision`: Execute a bounded member/goals feedback semantics slice on `/my-library/goals`.
- `reason`: PR `#830` and repo-managed closeout `#831` left no active AW-006 implementation slice. A fresh queue/design/code re-audit found `GoalsHub` still renders local offline, action error, action success, and empty/no-results feedback with repeated route-local markup and without focused semantic tests while adjacent member surfaces now have clearer accessible feedback contracts.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/my-library/goals`, `GoalsHub`, goals storage/API contracts, My Training bridge links, My Library reference surfaces, screenshot handoff rules, or verification lanes change before PR handoff.

## Goal

Make Goals offline, action error, action success, first-run empty, and filtered no-results feedback consistent, accessible, and easy to extend without changing goals data, API behavior, filters, active-limit logic, My Training bridge links, analytics, or support procedures.

## Pre-Implementation Owner Explanation

Jeg skal bare rydde opp i meldingene som vises i Goals naar noe lagres, feiler, er offline eller listen er tom. Det betyr noe fordi brukeren raskere forstar hva som skjedde og hva som er trygt neste steg, mens skjermlesere far riktigere status/feil-semantikk. Utenfor scope er goal-data, API-er, Supabase, analytics, My Training-koblinger, nye goal-typer/statusregler, Help/Guide-copy og bred redesign. Fremoverkompatibilitet ivaretas ved at nye goal-rader og statusverdier fortsatt kommer fra eksisterende `GoalView`/filterlogikk; denne slicen standardiserer bare feedback-visningen og krever eksplisitt mapping for nye feedback-toner eller workflow-handlinger.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
- Data placement and sync boundaries
- Reliability and failure handling
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                            | Evidence                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library/goals` remains the canonical private goals surface; feedback stays attached to existing add/log/archive/restore/refresh jobs without new route or workflow fork. | focused tests + screenshot handoff                 | `5/5`                   |
| UX flow clarity                               | `target`     | Offline, action error, action success, first-run empty, and filtered no-results states are visible, recoverable where relevant, and do not create dead ends.                  | focused tests + screenshot handoff                 | `5/5`                   |
| Visual design quality                         | `target`     | Feedback uses consistent member-library styling, stable spacing, readable contrast, and no broad Goals redesign or layout churn.                                              | screenshot handoff + class review                  | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Goal create/log/reset/archive/restore/refresh payloads, filter selection, active-limit behavior, result drafts, and My Training links remain unchanged.                       | focused unit tests + diff review                   | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice touches no admin editor, admin CRUD, publishing, notes, QR, or operator editing workflow.                                                              | changed-files review                               | `N/A`                   |
| Accessibility (a11y)                          | `target`     | User-action success feedback uses polite status semantics; actionable errors use alert/assertive semantics; static empty states are not noisy live regions.                   | Testing Library role/aria assertions + screenshots | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no dependency, asset, route fetch, polling loop, or heavy client library is added; `/my-library/goals` keeps existing route budgets.                         | dependency diff + broad gates                      | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical goals and local-only result drafts remain in existing boundaries; this slice adds only transient presentation markup/state helpers.                          | data contract review + tests                       | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, fetch cache, mutation response, revalidation, or invalidation behavior changes.                                                              | cache scope rationale                              | `N/A`                   |
| Reliability and failure handling              | `target`     | Failure messages keep retry or recovery visible where existing flows allow it and do not hide goal cards, drafts, or current filter context.                                  | focused failure tests                              | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: protected member access and owner-scoped Goals APIs remain unchanged; feedback exposes no raw diagnostics, secrets, or cross-user details.                   | diff review + route-boundary review                | `4/5`                   |
| Privacy and compliance                        | `target`     | Feedback does not include private goal values beyond existing user-entered UI, user identifiers, entitlement details, raw provider diagnostics, secrets, or env values.       | copy/error review                                  | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue and notice/empty-state inventory record this active Goals feedback semantics slice.                                                                    | docs diff                                          | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin role, workflow action, status, mutation, Help/Guide surface, or operator editability path changes.                                                       | explicit admin workflow scope rationale            | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this touches a protected/member utility UI and changes no public metadata, sitemap, robots, canonical URL, or structured public content.                          | changed-files review                               | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this protected member surface changes no crawl-safe public entity model, structured data, or AI-facing documentation contract.                                    | changed-files review                               | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice changes no analytics event taxonomy, payload, logging, dashboard, KPI, or consent behavior.                                                            | analytics scope rationale                          | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no pricing, checkout, entitlement, Stripe object, invoice, refund, payout, or revenue report.                                                  | explicit commerce scope rationale                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support workflow, recovery behavior, operator diagnostics, runbook procedure, or support escalation behavior.                       | explicit support-ops scope rationale               | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                      | explicit finance scope rationale                   | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: touched feedback strings stay existing/short and avoid layout assumptions that block later localization; no locale routing or translation workflow changes.  | copy/layout review                                 | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing `GoalsHub`, My Library/member feedback references, Tailwind tokens, and focused tests; add no package, API layer, or broad primitive.                          | changed-files/dependency diff                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Focused unit coverage, brief lint, route/label/support sweep, screenshot handoff, pre-PR gate, CI, and pre-merge gate cover the changed surface.                              | test commands + screenshot handoff + later gates   | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: feedback rendering adds no service call, database query, asset, polling loop, background job, or traffic-dependent infrastructure cost.                      | diff review                                        | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert rollback; no migrations, env changes, package changes, workflow changes, generated assets, or provider changes.                                             | git diff + validation evidence                     | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces: existing `GoalsHub` route state, member feedback semantics from `AthleteProfileHub`, `DrylandFeedback`, and `MyLibraryNewContentNotice`.
  - Keep implementation inside `components/my-library/goals/GoalsHub.tsx` or a goals-local helper.
  - Do not change route boundaries, server components, API routes, auth redirects, cache mode, or goals snapshot loading.
- TypeScript/domain contracts:
  - Preserve `GoalView`, `GoalPrimaryAction`, `GoalFilter`, template option shape, API payload parsing, and local result draft behavior.
  - Add only local presentation helpers/types for feedback tone/message semantics if needed.
- Supabase/data layer:
  - N/A; no migration, RLS/authz, generated type, storage, index, or data access change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, SDK, secret, webhook, retry, or idempotency contract change.
- UI system:
  - Use existing My Library/member visual language and recent AW-006 feedback semantics.
  - Do not create a broad app-wide notice primitive in this slice.
  - Screenshot handoff comparison type: `after/reference`, comparing changed Goals feedback to mature My Library/member feedback references where practical.
- Testing:
  - Update focused Vitest coverage for success/error/offline/empty live-region semantics and unchanged goals behavior.
  - Keep existing e2e aligned unless selectors/semantics require a focused update.

## Data Placement And Sync Contract

- Server-canonical data:
  - Goals remain server-canonical through existing authenticated `/api/goals` and `/api/goals/[goalId]` routes.
- Local data:
  - Result input drafts, filter selection, add-goal disclosure state, and expanded-card state remain local component state only.
  - This slice adds no new persisted local data.
- Sync policy:
  - Existing create, refresh, log result, clear result, archive, restore, and celebration-dismiss flows remain unchanged.
  - Failed actions keep current UI context and preserve drafts for retry.
- Retention and sensitivity:
  - Existing data retention behavior stays unchanged; feedback must not expose raw diagnostics, secrets, or cross-user details.
- Cache/invalidation:
  - `/my-library/goals` keeps existing server page load and client refresh behavior; no cache or revalidation behavior changes.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename/repurpose rule, alias, redirect, or migration behavior. Existing goal IDs, titles, statuses, and My Training link parameters remain unchanged.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Touched: Goals feedback states for offline, action error, action success, first-run empty, and filtered no-results.
  - Not touched: Goals data contracts, API routes, analytics payloads, route labels, My Training bridge behavior, auth, Supabase, Help/Guide, or support procedures.
- Source of truth:
  - Goal rows and statuses remain the typed `GoalView` data model and existing filter helpers.
  - Feedback tone is derived from local UI state (`isOnline`, `actionError`, `actionNotice`, `goals.length`, `filteredGoals.length`, and `activeFilter`), not hardcoded goal row IDs.
- Additive behavior:
  - New goal rows, templates, and existing status labels should automatically render through the same list and feedback shell.
  - New filters using the current generic fallback can render a safe no-results message.
- Explicit mapping requirements:
  - New goal workflow actions, feedback tones, destructive recovery paths, route labels, analytics events, or support promises require explicit code/test/doc review before release.
- Unknown or deprecated values:
  - Unknown goal values must keep existing safe generic copy and must not invent success states from unknown API payloads.
  - Deprecated goal actions remain recoverable through existing API failure feedback until removed in a separate scoped brief.
- Test/evidence:
  - Focused tests assert feedback semantics for success, error, offline, first-run empty, and filtered no-results paths while preserving existing goal actions.
  - Route/label/support sweep checks Goals feedback identifiers across code, tests, docs, and runbooks before broad gates.

## Help / Guide Impact

N/A with rationale: this changes only visual/accessibility treatment of existing Goals feedback. It does not change Help/Guide content, workflow labels, recovery procedures, entitlement rules, support/operator instructions, or admin procedures.

## Route / Label / Support Surface Sweep

Required as a targeted member/goals feedback sweep because this slice changes user-facing feedback semantics.

- Identifiers to search before broad gates:
  - `GoalsHub`
  - `My Goals`
  - `Your goals`
  - `Goals refreshed`
  - `Goal added from template`
  - `Custom goal created`
  - `Result saved`
  - `Best result cleared`
  - `Goal archived`
  - `Goal restored`
  - `Could not refresh goals`
  - `Could not create goal`
  - `Could not log this goal result`
  - `Could not clear this best result`
  - `You are offline. Reconnect`
- Surfaces to check:
  - `components/my-library/goals/GoalsHub.tsx`
  - `tests/unit/goals-hub.test.tsx`
  - `tests/e2e/` if selectors/semantics change
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - canonical AW-006 queue
  - `docs/runbooks/`
- Expected fallout:
  - Goals component, focused unit tests, active brief, canonical AW-006 queue, notice inventory, and screenshot artifacts only.
  - No Goals API, Supabase, auth, analytics, Help/Guide, support-procedure, My Training, commerce, or admin workflow fallout.

## Scope

- Improve `components/my-library/goals/GoalsHub.tsx` feedback presentation and accessibility semantics for existing offline, action error, action success, first-run empty, and filtered no-results messages.
- Preserve goal create/log/reset/archive/restore/refresh payloads, result drafts, filters, add-goal behavior, active limit, My Training links, and existing copy meaning.
- Update focused tests in `tests/unit/goals-hub.test.tsx`.
- Update the canonical AW-006 queue and notice/empty-state inventory.
- Capture required screenshot handoff before broad gates.

## Out Of Scope

- Goals data model, API routes, Supabase, generated database types, migrations, auth, analytics, route labels, My Training bridge behavior, goal filters/ordering, active-limit rules, goal status/action taxonomy, Help/Guide updates, broad member notice primitive, app-wide design-system primitive, new dependencies, commerce, packages, and merge without explicit owner approval.

## Acceptance Criteria

1. Goals offline, action error, action success, first-run empty, and filtered no-results feedback use one goals-local feedback contract/helper.
2. Action errors are announced as alert/assertive live regions and keep retry or the current goal action recoverable.
3. Success feedback is announced politely and does not disrupt current filter/card context.
4. Static empty states are not announced as live regions.
5. Existing create/log/reset/archive/restore/refresh payloads, result drafts, active-limit behavior, filters, and My Training links remain unchanged.
6. Focused unit tests cover changed feedback semantics and unchanged goal behavior.
7. Canonical AW-006 queue and notice/empty-state inventory record this active slice.
8. Screenshot handoff is captured and approved before `npm run verify:pre-pr`.

## Validation

Targeted before screenshot handoff:

- `./node_modules/.bin/vitest run tests/unit/goals-hub.test.tsx`
- `npm run typecheck`
- `git diff --check`
- `npm run lint:briefs:all`
- targeted route/label/support sweep for Goals feedback identifiers

Visual gate:

- Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
- Capture representative `after/reference` screenshots against `http://127.0.0.1:3000`.
- Stop for owner screenshot approval before `npm run verify:pre-pr`, PR creation, and `npm run verify:pre-merge`.

After screenshot approval:

- `npm run verify:pre-pr`
- open/update PR
- required CI checks green
- `npm run verify:pre-merge`

## Manual QA / Screenshot Plan

- Capture Goals feedback on desktop and mobile/tablet where practical:
  - after/reference Goals empty or no-results state,
  - after action success state,
  - after forced action error or existing tested error state where practical.
- Use `after/reference` naming because the handoff compares changed Goals feedback to mature My Library/member feedback references rather than a true before-state.

## Checkpoint Log

- `2026-05-24 | in-progress | owner approved the AW-006 Goals Feedback Semantics slice after fresh queue/design/code re-audit on clean main@51f6d04; created branch aw-006-goals-feedback-semantics and active brief; next: implement the goals-local feedback helper and focused tests, then capture screenshot handoff before broad gates`
- `2026-05-24 | implemented + targeted validation | added a goals-local feedback renderer for offline, action error, action success, first-run empty, and filtered no-results states; updated focused unit assertions for polite status, assertive alert, and static empty semantics; updated AW-006 queue/inventory; targeted checks passed: ./node_modules/.bin/vitest run tests/unit/goals-hub.test.tsx, npm run typecheck, npm run lint:briefs:all, git diff --check; targeted route/label/support sweep found only expected fallout in GoalsHub, focused tests, AW-006 docs, the active brief, existing e2e helper references, and historical/support docs | next: capture required screenshot handoff and stop for owner approval before verify:pre-pr`
- `2026-05-24 | screenshot handoff ready | captured after/reference screenshot artifacts in output/aw-006-goals-feedback-2026-05-24-171809 for success, action error, mobile empty, mobile no-results, and My Library reference feedback; capture used a temporary local fixture route with seeded props and mocked fetch responses to avoid writing real Goals data; fixture route was removed after capture and npm run typecheck passed again; no shipped product-rendering files changed after capture | next: owner screenshot approval before verify:pre-pr`
- `2026-05-24 | pre-pr green | owner approved the screenshot handoff; npm run verify:pre-pr passed on the full lane with branch-current, quality gates, lint, typecheck, unit tests, build, performance budgets, and Playwright e2e (98 passed, 478 skipped) | next: commit, push, open PR, monitor CI, then run verify:pre-merge before merge-readiness handoff`
