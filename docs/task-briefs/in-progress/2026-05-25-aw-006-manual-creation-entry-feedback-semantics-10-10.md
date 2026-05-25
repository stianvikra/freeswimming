# Task Brief: AW-006 Manual Creation Entry Feedback Semantics (10/10)

## Metadata

- `id`: `2026-05-25-aw-006-manual-creation-entry-feedback-semantics-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-25`
- `updated`: `2026-05-25`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-manual-creation-entry-feedback-semantics`
- `execution_mode`: `owner-approved implementation slice; screenshot handoff required before broad gates`

## Brief Audit Record

- `last_audited`: `2026-05-25`
- `base`: `main@19cc583`
- `audit_status`: `ready`
- `decision`: Execute the approved bounded `AW-006 Manual Creation Entry Feedback Semantics` slice now.
- `reason`: PR `#843` and repo-managed closeout PR `#844` are merged, `main` is clean at `19cc583`, `npm run post-merge:preflight` was reported green, and the fresh queue/design/code re-audit found manual swim and program create entry errors still rendering as plain red text while the adjacent dryland create entry already has accessible feedback semantics.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/my-library/workouts`, `/my-library/programs`, `CreateManualWorkoutButton`, `CreateManualProgramButton`, `CreateManualDrylandSessionButton`, manual workout/program creation contracts, screenshot handoff rules, or verification lanes change before screenshot handoff.

## Goal

Make manual creation entry feedback for swim sessions and programs consistent, accessible, and easy to extend while preserving create/open behavior, APIs, payloads, builders, routing, analytics, auth, Help/Guide, and support procedures.

## Pre-Implementation Owner Explanation

Jeg skal rydde feilmeldingene som vises hvis brukeren ikke faar startet en ny manuell svommeokt eller opprettet et nytt program. Det betyr noe fordi brukeren tydeligere forstaar at handlingen feilet og kan prove igjen, samtidig som skjermlesere faar riktig feilvarsel. Utenfor scope er API-er, lagring, builder/editor-logikk, eksport, analytics, auth, ruter, Help/Guide og bred member notice-primitive.

Fremoverkompatibilitet: feedbacken skal folge eksisterende typed create/open-state for manuelle entrypoints, ikke dagens tilfeldige tekstmarkup. Nye entrypoints, workflow-typer eller recovery-regler maa mappes eksplisitt med test foer release.

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
- `Data placement and sync boundaries`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                    | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library/workouts` and `/my-library/programs` keep their existing manual creation entrypoints; feedback stays attached to the existing start/create action.       | focused tests + screenshot handoff          | `5/5`                   |
| UX flow clarity                               | `target`     | Manual swim open failure and manual program create failure each show one clear, recoverable error state near the triggering action.                                   | focused tests + screenshot handoff          | `5/5`                   |
| Visual design quality                         | `target`     | Feedback uses current member-library styling and aligns with dryland/member feedback references without redesigning cards, routes, or action hierarchy.               | screenshot handoff + class review           | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Manual workout draft href generation, router push/refresh fallback behavior, program POST payload, and program route destination remain unchanged.                    | focused unit tests + diff review            | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice touches no admin editor, CRUD surface, publishing workflow, admin notes, QR, content manager, or operator workflow.                            | explicit admin scope rationale              | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Recoverable create/open errors are announced as assertive alerts and triggering buttons reference the feedback through `aria-describedby`.                            | Testing Library role/aria assertions        | `5/5`                   |
| Accessibility                                 | `target`     | Alias row for brief-lint closeout normalization of `Accessibility (a11y)`; same accessibility target and evidence.                                                    | Testing Library role/aria assertions        | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no dependency, asset, route fetch, polling loop, or heavy client library is added; member route budgets keep existing behavior.                      | no-dependency diff + broad gates later      | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical program creation and local-only workout draft entry behavior keep existing boundaries; this slice adds only transient presentation semantics.        | data boundary review + focused tests        | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this changes no route cache mode, fetch cache, mutation response, revalidation, invalidation behavior, CDN behavior, or stale-data policy.                | explicit cache scope rationale              | `N/A`                   |
| Reliability and failure handling              | `target`     | Expected create/open failures remain visible, actionable, and do not hide the button or route context needed for retry.                                               | focused failure tests                       | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: protected member access and owner-scoped create APIs remain unchanged; feedback exposes no raw diagnostics, secrets, or cross-user details.          | diff review + unchanged protected APIs      | `4/5`                   |
| Privacy and compliance                        | `target`     | Feedback exposes no private workout/program values beyond already-visible private UI, user identifiers, entitlement details, raw diagnostics, secrets, or env values. | copy/error review                           | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue and notice/empty-state inventory record this active manual creation entry feedback semantics slice.                                            | docs diff + brief lint                      | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin role, workflow action, status, mutation, Help/Guide surface, or operator editability path changes.                                               | explicit admin-workflow scope rationale     | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this protected member UI change touches no public metadata, sitemap, robots, canonical URL, or structured public content.                                 | explicit SEO scope rationale                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this protected member utility changes no crawl-safe public entity model, structured data, or AI-facing documentation contract.                            | explicit AI-discoverability scope rationale | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: existing manual workout/program entry analytics behavior stays unchanged; no new event, dashboard, KPI, or consent behavior is introduced.           | analytics scope review                      | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no pricing, checkout, portal, entitlement, Stripe object, invoice, refund, payout, or revenue report.                                        | explicit commerce scope rationale           | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support workflow, recovery behavior, operator diagnostics, runbook procedure, or support escalation behavior.               | explicit support-ops scope rationale        | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.              | explicit finance scope rationale            | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: touched English strings stay route-local and concise; no locale routing or translation workflow is introduced.                                       | copy/layout review                          | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing `CreateManualWorkoutButton`, `CreateManualProgramButton`, dryland feedback reference semantics, Tailwind tokens, and focused tests; add no dependency. | changed-files/dependency diff               | `5/5`                   |
| Testing and QA automation                     | `target`     | Focused unit coverage, brief lint, route/label/support sweep, screenshot handoff, pre-PR gate, CI, and pre-merge gate cover the changed surface.                      | test commands + screenshot handoff          | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: feedback rendering adds no service call, database query, asset, polling loop, background job, or traffic-dependent infrastructure cost.              | implementation review                       | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert rollback; no migrations, env changes, package changes, workflow changes, generated assets, provider settings, or production settings.               | git diff + validation evidence              | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: `CreateManualDrylandSessionButton` using dryland-local accessible feedback semantics, plus recent member feedback contracts in `WorkoutBuilderHub`, `ProgramBuilderHub`, and `GeneratorFeedback`.
  - Keep existing client components and route boundaries for `/my-library/workouts` and `/my-library/programs`.
  - Do not change API routes, server components, auth redirects, cache mode, or revalidation behavior.
  - Session-step reference contract: `docs/design/session-step-surface-contract.md` remains unchanged and is not invoked by this slice, because manual workout creation still only opens the existing builder entry route and no session-step `Edit`, `Rearrange`, `View`, renderer, or workout draft content is changed.
- TypeScript/domain contracts:
  - Preserve `ManualWorkoutBuilderMode`, manual draft href derivation, `ProgramSaveApiResponse`, and create response handling.
  - Add only button-local presentation semantics or a small local helper if needed.
- Supabase/data layer:
  - N/A; no migration, RLS/authz, generated type, storage, index, or Supabase query behavior changes.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, SDK, secret, webhook, retry, or idempotency contract change.
- UI system:
  - Use existing member-library visual language and dryland/member feedback semantics.
  - Do not create a broad app-wide or member-wide notice primitive in this slice.
  - Screenshot handoff comparison type: `after/reference`, comparing changed manual swim/program create feedback to dryland/manual member feedback where practical.
- Testing:
  - Update focused Vitest coverage for manual workout open failure and manual program create failure semantics while preserving existing route/payload behavior.
  - Keep e2e unchanged unless selectors/semantics require a focused update.

## Data Placement And Sync Contract

- Server-canonical data:
  - Saved programs remain server-canonical through the existing authenticated program create route.
  - Saved workouts remain server-canonical after the existing builder flow saves them; this slice does not create or mutate workouts.
- Local data:
  - Manual workout draft entry remains local/route-query driven through the existing builder href.
  - Error feedback remains transient component state and is not persisted.
- Sync policy:
  - Existing manual workout route push/refresh/fallback behavior and manual program POST/create routing remain unchanged.
  - Failed actions keep current UI context and preserve the same button for retry.
- Retention and sensitivity:
  - No new stored data. Feedback must not expose raw diagnostics, secrets, or cross-user details.
- Cache/invalidation:
  - Existing router refresh after route navigation remains unchanged; no cache or revalidation behavior changes.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename/repurpose rule, alias, redirect, or migration behavior. Existing program IDs, workout draft query values, route labels, and destinations remain unchanged.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Touched: manual creation entry feedback states for swim session draft opening and program shell creation.
  - Not touched: workout/program data models, API routes, export formats, analytics payloads, route labels, auth, Supabase, Help/Guide, or support procedures.
- Source of truth:
  - Feedback derives from typed local UI error state and existing API/navigation outcomes, not hardcoded workout/program row IDs.
- Additive behavior:
  - Additional manual swim builder modes or program create responses should render through the same button-local feedback treatment when routed through these components.
- Explicit mapping requirements:
  - New manual creation components, workflow actions, destructive recovery paths, route labels, analytics events, support promises, or cross-route recovery flows require explicit code/test/doc review before release.
- Unknown or deprecated values:
  - Unknown create/open failures keep safe generic copy and must not invent success states from unknown payloads.
  - Deprecated actions remain recoverable through existing failure feedback until removed in a separate scoped brief.
- Test/evidence:
  - Focused tests assert alert semantics for manual workout/program failures while preserving existing route and POST payload behavior.
  - Route/label/support sweep checks manual creation feedback identifiers across code, tests, docs, and runbooks before broad gates.

## Help / Guide Impact

N/A with rationale: this changes only visual/accessibility treatment of existing manual creation feedback. It does not change Help/Guide content, workflow labels, recovery procedures, entitlement rules, support/operator instructions, or admin procedures.

## Route / Label / Support Surface Sweep

Required as a targeted member/manual creation feedback sweep because this slice changes user-facing feedback semantics.

- Identifiers to search before broad gates:
  - `CreateManualWorkoutButton`
  - `CreateManualProgramButton`
  - `CreateManualDrylandSessionButton`
  - `Build pool session`
  - `Build open water session`
  - `Create program shell`
  - `Could not open pool session builder`
  - `Could not open open-water session builder`
  - `Could not create program`
  - `role="alert"`
  - `aria-describedby`
  - `aria-live`
- Surfaces to check:
  - `components/my-library/workouts/CreateManualWorkoutButton.tsx`
  - `components/my-library/programs/CreateManualProgramButton.tsx`
  - `components/my-library/dryland/CreateManualDrylandSessionButton.tsx`
  - `tests/unit/create-manual-workout-button.test.tsx`
  - `tests/unit/create-manual-program-button.test.tsx`
  - `tests/unit/create-manual-dryland-session-button.test.tsx`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - canonical AW-006 queue
  - `docs/runbooks/`
- Expected fallout:
  - Manual creation entry components, focused unit tests, active brief, canonical AW-006 queue, notice inventory, and screenshot artifacts only.
  - No workout/program API, Supabase, auth, analytics, Help/Guide, support-procedure, export, commerce, or admin workflow fallout.

## Scope

- Improve `components/my-library/workouts/CreateManualWorkoutButton.tsx` feedback presentation and accessibility semantics for existing manual builder open failures.
- Improve `components/my-library/programs/CreateManualProgramButton.tsx` feedback presentation and accessibility semantics for existing manual program create failures.
- Preserve manual workout draft href generation, router push/refresh behavior, navigation fallback, program POST payload, program route destination, and existing copy meaning.
- Update focused tests in `tests/unit/create-manual-workout-button.test.tsx` and `tests/unit/create-manual-program-button.test.tsx`.
- Update the canonical AW-006 queue and notice/empty-state inventory.
- Capture required screenshot handoff before broad gates.

## Out Of Scope

- Workout/program data model changes, API route changes, Supabase migrations/RLS/types, generated database types, auth, analytics, route label changes, editor/builder behavior changes, localStorage key changes, export/PDF/Poolside/Garmin/handoff behavior, Help/Guide updates, broad member notice primitive, app-wide design-system primitive, new dependencies, commerce, packages, and merge without explicit owner approval.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves or waives screenshot review.

## Acceptance Criteria

1. Manual swim create/open errors use accessible feedback semantics with `role="alert"`, assertive live region, stable ID, and button `aria-describedby`.
2. Manual program create errors use accessible feedback semantics with `role="alert"`, assertive live region, stable ID, and button `aria-describedby`.
3. Existing manual workout draft route generation, router push/refresh, navigation fallback, program create POST payload, and destination routing remain unchanged.
4. Feedback visual treatment matches current member-library style and dryland/manual reference semantics without broad redesign.
5. Focused unit tests cover changed feedback semantics and unchanged create/open behavior.
6. Canonical AW-006 queue and notice/empty-state inventory record this active slice.
7. Screenshot handoff is captured and approved before `npm run verify:pre-pr`.

## Validation

Targeted before screenshot handoff:

- `./node_modules/.bin/vitest run tests/unit/create-manual-workout-button.test.tsx tests/unit/create-manual-program-button.test.tsx tests/unit/create-manual-dryland-session-button.test.tsx`
- `npm run typecheck`
- `git diff --check`
- `npm run lint:briefs:all`
- targeted route/label/support sweep for manual creation feedback identifiers

Visual gate:

- Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
- Capture representative `after/reference` screenshots against `http://127.0.0.1:3000`.
- Stop for owner screenshot approval before `npm run verify:pre-pr`, PR creation, and `npm run verify:pre-merge`.

After screenshot approval:

- `npm run verify:pre-pr` (PASS, `artifacts/test-runs/20260525-122602/verify.log`)
- open/update PR
- required CI checks green
- `npm run verify:pre-merge`

## Manual QA / Screenshot Plan

- Capture manual swim creation feedback on desktop and mobile/tablet where practical.
- Capture manual program creation feedback on desktop and mobile/tablet where practical.
- Capture dryland manual creation feedback as the reference surface where practical.
- Use `after/reference` naming because the handoff compares changed swim/program entry feedback to the mature dryland/manual reference rather than a true before-state.

## Local Tooling Prerequisite

Node.js/npm should be loaded through the repo's normal `nvm use --silent` path before npm commands. For Codex, release-gate/dev-server commands use escalation-first strategy per repo instructions.

## Screenshot Handoff

Required because this is a user-facing UI state rendering change. Stop after targeted implementation QA and screenshot artifacts; do not run `npm run verify:pre-pr`, open/update PR, or run pre-merge until owner approves or waives the screenshot handoff.

- `status`: captured and owner-approved before broad gates
- `captured`: `2026-05-25 12:23 CEST`
- `comparison_type`: `after/reference`
- `artifacts`: `output/aw-006-manual-creation-feedback-2026-05-25-122303`
- `notes`: Captured with a temporary deterministic local screenshot fixture that rendered the production `CreateManualWorkoutButton`, `CreateManualProgramButton`, and `CreateManualDrylandSessionButton` with controlled failure states. The refreshed artifacts use the same primary blue button class passed by the production hubs, after the first capture used a fixture-only black button style. The temporary fixture route was removed after capture; no shipped product-rendering files, styles, assets, or export HTML changed after the approved artifacts. Owner approved screenshot handoff in chat with `godjent`.

## Checkpoint Log

- `2026-05-25 | in-progress | owner approved AW-006 Manual Creation Entry Feedback Semantics after clean main@19cc583 and fresh queue/design/code re-audit; created branch aw-006-manual-creation-entry-feedback-semantics and this active brief | next: update queue/inventory, implement manual creation feedback semantics, run targeted tests, then capture screenshot handoff before broad gates`
- `2026-05-25 | targeted-qa | implemented accessible alert feedback and button descriptions for manual swim/program creation failures while preserving manual workout draft routing, router push/refresh behavior, navigation fallback, program POST payload, and program destination routing; targeted validation passed: ./node_modules/.bin/vitest run tests/unit/create-manual-workout-button.test.tsx tests/unit/create-manual-program-button.test.tsx tests/unit/create-manual-dryland-session-button.test.tsx (3 files / 9 tests), npm run lint:briefs:all, npm run lint:quality-gates, npm run typecheck, git diff --check, and targeted route/label/support sweep | next: capture after/reference screenshot handoff before broad gates`
- `2026-05-25 | screenshot-handoff | captured after/reference screenshots for manual swim/program create-entry feedback and dryland create-entry reference in output/aw-006-manual-creation-feedback-2026-05-25-105759; owner flagged fixture-only black button styling, so screenshots were refreshed with production-primary blue button classes in output/aw-006-manual-creation-feedback-2026-05-25-122303; temporary local screenshot route was removed after capture with no shipped product-rendering files changed after capture | next: wait for owner screenshot approval before npm run verify:pre-pr, PR creation, and pre-merge gates`
- `2026-05-25 | screenshot-approved | owner approved refreshed screenshot handoff in output/aw-006-manual-creation-feedback-2026-05-25-122303; no product-rendering files changed after capture | next: run npm run verify:pre-pr, commit, push, open PR, monitor CI, and run npm run verify:pre-merge before merge readiness`
- `2026-05-25 | pre-pr | npm run verify:pre-pr passed on full lane with branch current to origin/main@19cc583; build, unit, perf budget, Playwright E2E, and gate scripts passed; log: artifacts/test-runs/20260525-122602/verify.log | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge readiness`
