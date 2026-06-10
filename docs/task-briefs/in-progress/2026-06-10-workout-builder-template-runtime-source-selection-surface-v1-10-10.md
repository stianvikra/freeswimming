# Task Brief: Workout Builder Template Runtime Source / Selection Surface V1 (10/10)

## Metadata

- `id`: `2026-06-10-workout-builder-template-runtime-source-selection-surface-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-10`
- `updated`: `2026-06-10`
- `parent_brief`: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- `depends_on`:
  - `docs/task-briefs/done/2026-06-10-workout-builder-template-identity-selection-contract-v1-10-10.md`
  - `docs/architecture/workout-builder-template-identity-selection-contract.md`
- `unblocks`:
  - `docs/task-briefs/blocked/2026-06-10-workout-builder-template-usage-instrumentation-v1-10-10.md`
- `execution_mode`: `end-to-end-after-explicit-implement`
- `branch`: `workout-builder-template-runtime-source-selection-surface-v1`

## Brief Audit Record

- `last_audited`: `2026-06-10`
- `base`: clean synced `main@ba125c18` after Workout Builder Template Identity / Selection Contract V1 PR `#1057` and repo-managed closeout PR `#1058`.
- `audit_status`: `ready`
- `decision`: Execute this as the approved runtime child that creates the real template source and explicit selection surface required before template usage instrumentation can resume.
- `reason`: Owner explicitly said `implementer Workout Builder Template Runtime Source / Selection Surface V1` on `2026-06-10`; the identity contract closed the product/data decision but kept runtime support as `not supported`, and current code has manual starter scaffolds, generated-session inputs, and source kinds, but no canonical workout-builder template source or `Use template` action.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, task brief template, scorecard categories, `docs/architecture/workout-builder-template-identity-selection-contract.md`, `components/my-library/workouts/WorkoutBuilderHub.tsx`, `components/my-library/workouts/WorkoutEditor.tsx`, `components/my-library/workouts/CreateManualWorkoutButton.tsx`, `lib/workouts/manual.ts`, `lib/workouts/manual-local-draft.ts`, `lib/workouts/shared.ts`, `lib/workouts/persistence.ts`, `app/api/my-library/workouts/**`, `components/my-library/generator/**`, analytics event taxonomy, Admin Analytics template usage contract, Help/Guide contracts, screenshot handoff rules, or route/label/support sweep rules change before implementation starts.

## Goal

Ship a minimal, real workout-builder template source and explicit `Use template` selection surface so a user can start a workout draft from a stable template identity without inferring template usage from session type, generator toggles, manual starter scaffolds, or save events.

## Pre-Implementation Owner Explanation

Vi legger inn en ekte, liten template-kilde for Workout Builder og en tydelig flate der brukeren kan velge `Use template` for aa starte en ny draft. Det betyr at senere template usage kan telles fra en konkret template-ID, ikke fra gjetting rundt session type, AI-generering eller at en workout ble lagret. Utenfor scope er analytics-event, Admin Analytics-KPI, checkout, priser, Stripe, finance-rapportering, export, tredjeparts analytics, nytt database-skjema og bred redesign av builderen.

Forward-compatibility-intent: nye templates i samme registry skal automatisk arve samme stabile `templateKey`, visning og valgkontrakt. Nye template-kilder, persisted `workout_template`-entity, template-familier, lokaliserte labels med forretningsbetydning, analytics-KPI-er, export-formater eller kommersielle plasseringer krever eksplisitt mapping, brief og tester.

## Product Decision

- V1 source of truth:
  - use a typed in-repo workout-template registry as the approved interim source from `docs/architecture/workout-builder-template-identity-selection-contract.md`;
  - do not create a Supabase `workout_template` entity in this slice because the broader workout data-contract brief is still `revise-before-use`.
- Canonical identity:
  - every V1 template uses a write-once low-cardinality `templateKey` that follows the existing contract: lowercase ASCII, starts with a letter or number, only letters/numbers/underscore/hyphen, length `3-64`.
- Selection action:
  - selection is only an explicit `Use template`-equivalent action that resolves a valid registry template and starts or populates a workout draft.
- Runtime behavior:
  - a selected template creates a normal local workout draft that can be edited and saved through the existing Workout Builder path;
  - saved workouts remain owned by the existing workout save contract and do not gain template analytics in this slice.
- Analytics behavior:
  - do not add `workout_builder_template_selected`;
  - keep Admin Analytics `Template usage` as `not_instrumented` until the blocked instrumentation child resumes.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the 10/10 claim gate:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Security and authz
- Privacy and compliance
- Analytics and KPI observability
- Content governance
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                         | Evidence                                                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ----------------------- |
| Product goals and IA                          | `target`     | My Library / Workout Builder gains one clear template-start path that is separate from manual blank creation and AI generation.                                                            | component/e2e tests + screenshot handoff                                 | `5/5`                   |
| UX flow clarity                               | `target`     | `Use template` is the only counted selection moment; preview/list viewing, session type changes, starter defaults, generation, and saving remain visibly different actions.                | component tests + e2e journey + copy review                              | `5/5`                   |
| Visual design quality                         | `target`     | Template selection reuses existing Workout Builder/My Library visual language, fits mobile/desktop, and has no clipped or overlapping text.                                                | after/reference screenshot handoff                                       | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Valid registry templates create deterministic editable drafts; unknown, deprecated, duplicate, or invalid `templateKey` values fail closed and never map to session type or source kind.   | registry/factory tests + negative-path tests                             | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: no admin template CRUD ships here; any admin-managed template workflow requires a later persisted-template/admin child.                                                   | admin scope rationale                                                    | `4/5`                   |
| Accessibility (a11y)                          | `target`     | Template cards/actions have accessible names, keyboard focus, heading structure, disabled/loading/error semantics, and no serious/critical a11y regressions.                               | Testing Library assertions + targeted e2e/a11y checks                    | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Registry and UI are dependency-free/lightweight, add no chart/vendor bundle, and do not materially regress `/my-library` route payload or interaction latency.                             | package diff + build/perf gate + manual interaction QA                   | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Registry is repo-canonical for V1; selected draft state is local until existing save; no browser storage or analytics event becomes template identity truth.                               | data-boundary review + tests                                             | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Registry changes deploy through normal build invalidation; workout save/read cache behavior remains unchanged and no stale dynamic template read is introduced.                            | code review + route/cache notes                                          | `5/5`                   |
| Reliability and failure handling              | `target`     | Invalid/deprecated template reads show deterministic safe UI or no action; template draft creation failures do not corrupt existing manual drafts or saved workouts.                       | negative-path component/unit tests                                       | `5/5`                   |
| Security and authz                            | `target`     | Template selection does not widen protected My Library/workout access; save/update routes keep existing auth fail-closed behavior and reject malformed draft payloads.                     | auth boundary review + existing/targeted route tests                     | `5/5`                   |
| Privacy and compliance                        | `target`     | Template metadata and future-safe dimensions exclude workout titles, notes, raw workout text, raw URLs, emails, IPs, user agents, user IDs, visitor IDs, payment data, and raw payload UI. | payload/metadata review + sanitizer-oriented tests where touched         | `5/5`                   |
| Content governance                            | `target`     | Registry entries have owner, write-once key, rename/repurpose rules, deprecation behavior, and support interpretation documented before runtime use.                                       | registry contract + architecture/doc updates + route/label/support sweep | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: no admin workflow label, role, approval, edit, publish, or recovery behavior changes in this user-facing template-selection slice.                                        | scope rationale                                                          | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes only authenticated My Library / Workout Builder surfaces and no public route, metadata, sitemap, robots, canonical URL, structured data, or crawlable content.    | explicit SEO scope rationale                                             | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this adds no public semantic page, public docs page, structured data, or AI-facing crawl surface.                                                                              | explicit AI-discoverability scope rationale                              | `N/A`                   |
| Analytics and KPI observability               | `target`     | Runtime source and explicit selection action are implemented, while template usage remains `not_instrumented` until the dedicated instrumentation child adds the event.                    | runtime source tests + Admin Analytics fallback assertions               | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: template selection remains product workflow, not checkout conversion, entitlement truth, revenue attribution, Stripe reconciliation, or finance reporting.                | commerce boundary review + Help/Guide/Admin caveat check                 | `4/5`                   |
| Incident response and support operations      | `supporting` | Supporting only: deterministic unknown/deprecated/failure states must leave enough support-readable context; no new incident/on-call workflow ships.                                       | error-state tests + support-surface sweep rationale                      | `4/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: this slice changes no finance reconciliation, refunds, payouts, invoices, revenue recognition, accounting export, or Stripe reporting.                                    | explicit finance scope rationale                                         | `4/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: `templateKey` stays locale-independent and visible template labels remain display-only/localizable later; no full locale workflow ships.                                  | copy/identity review + scope rationale                                   | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next.js, TypeScript, Workout Builder, manual draft, and test patterns; add no dependency and avoid a new route/API unless the existing route cannot support the flow.       | changed-files review + package diff                                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Registry, draft creation, unknown/deprecated behavior, component UI, screenshot handoff, `lint:briefs`, `verify:pre-pr`, CI, and `verify:pre-merge` cover the slice.                       | targeted tests + screenshot artifacts + verify gates                     | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Template registry stays low-cardinality and renders from bounded static data; adding new templates does not add per-user/per-workout cardinality or runtime query cost.                    | registry fixture review + perf/build gate                                | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | No migration, provider, env, secret, or external service change; rollback is a revert of registry/UI/docs/tests and preserves existing manual/AI builder entrypoints.                      | PR rollback note + verify gates                                          | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse `components/my-library/workouts/WorkoutBuilderHub.tsx` and existing My Library / manual builder entry patterns.
  - Prefer adapting selected template data into the existing `WorkoutEditor` / `SessionDraft` contract instead of creating a parallel editor.
  - Session-step reference contract: `docs/design/session-step-surface-contract.md` remains the canonical shared renderer/interaction contract for the editable step surface; template fixtures adapt into that existing session-step shape instead of introducing alternate step markup or semantics.
  - Do not add a new public route, admin tab, dashboard module, chart, modal stack, or route-local state system unless implementation proves the existing builder entry surface cannot support the V1 flow.
  - Preserve existing authenticated My Library route boundaries.
- TypeScript/domain contracts:
  - Add a narrow typed registry, for example `lib/workouts/templates.ts`, with `templateKey`, display metadata, environment/session fields, lifecycle status, and a draft factory.
  - Validate `templateKey` through one shared parser/helper and cover valid, invalid, duplicate, deprecated, and unknown fixtures.
  - Keep title/label/category/sort order display-only; never derive identity from visible copy.
  - A selected template must produce the same editable `SessionDraft` shape as manual/AI accepted workouts.
- Supabase/data layer:
  - No migration, RLS policy, generated type update, index, storage object, or server-canonical `workout_template` table in V1.
  - Existing workout save APIs remain the only persistence path for resulting workouts.
  - A future persisted-template child must replace or migrate the registry through an explicit mapping and tests.
- External services/tools:
  - No Stripe, checkout, finance, Garmin API delivery, vendor analytics, tag manager, cookie, visitor ID, webhook, SDK, secret, or third-party service change.
- UI system:
  - Reuse existing My Library / Workout Builder cards, buttons, spacing, trust states, and accessible form/action conventions.
  - Handoff type: `after/reference`, comparing the new template selection surface to the existing manual builder entry/workout builder reference surface.
  - Screenshot approval stop is required before `npm run verify:pre-pr`.
- Testing:
  - Unit tests for registry parsing, draft factories, unknown/deprecated fallback, and no inference from `sessionType` / `sourceKind`.
  - Component tests for template cards/actions, accessible names, selection, local draft creation, and empty/unsupported states.
  - E2E coverage for mobile/desktop selection -> edit -> save using existing workout-builder flow.

## Data Placement And Sync Contract

- Server-canonical:
  - Existing saved workouts remain server-canonical only after the current workout save API succeeds.
  - No V1 server-canonical template entity exists.
- Repo-canonical:
  - The typed template registry is the V1 source of truth for template identity, lifecycle status, display metadata, and draft factory behavior.
- Local/browser:
  - Selected template draft state is local until the user saves through the existing builder path.
  - Existing local manual draft behavior may be reused only for transient draft recovery; it must not become the source of truth for template identity.
  - No analytics cookie, visitor ID, localStorage analytics identity, or public-to-user attribution bridge is added.
- Sync policy:
  - `Use template` starts/populates a local editable draft from a valid registry entry.
  - Save continues through the existing workout save route and existing `sourceKind` contract unless a later persistence child adds explicit template provenance.
  - If a template cannot be resolved, the action fails closed and does not create a nearby/fallback draft.
- Retention and sensitivity:
  - Registry metadata must be non-sensitive product metadata.
  - User edits, workout notes, and workout text remain in the existing draft/save contract and are not copied into template identity or future analytics dimensions.
- Cache/invalidation:
  - Static registry changes invalidate on deploy/build.
  - Existing workout save/read invalidation remains unchanged.
  - No dynamic template cache, revalidation tag, rollup, or background job is introduced.

## Identity And Rename Contract

- Canonical stable ID:
  - V1 templates use write-once `templateKey`.
  - `templateKey` is independent of title, label, category, sort order, locale, `sessionType`, `sourceKind`, generated draft fingerprint, and save event.
- Human-readable identifiers:
  - Template title, card label, description, category, and visible copy are display-only.
  - Copy may be renamed when the underlying reusable workout/session pattern and selection meaning are unchanged.
- Mutability rules:
  - `templateKey` must not be reused or repurposed.
  - Registry sort order and display copy can change without identity change when semantic meaning is stable.
  - Deprecated templates need explicit lifecycle status and safe display/selection behavior.
- Rename vs repurpose:
  - Rename in place is allowed for copy-only clarity.
  - A materially different workout structure, target user job, source behavior, canonical step/progression semantics, or commercial interpretation requires a new `templateKey`.
- Compatibility contract:
  - Unknown keys fail closed.
  - Deprecated keys must be hidden, blocked, or explicitly read-through before a later analytics child counts them.
  - Future persisted `templateId` migration must include an alias/mapping from V1 `templateKey` to persisted identity before instrumentation or dashboards rely on both.
- Observability and repair:
  - Invalid, duplicate, missing, or deprecated keys should be detectable through deterministic tests and safe UI state.
  - Support/admin interpretation must distinguish "template not available" from analytics not instrumented.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Template keys, template lifecycle statuses, template families/categories, builder modes, environments, session types, draft factories, workflow labels/actions, analytics event names/payload fields, Admin Analytics labels, Help/Guide copy, locales, export formats, commerce CTA placements, and future persisted `workout_template` entities.
- Source of truth:
  - V1 template values come from the typed registry, not from card text, session type, source kind, generator blocks, draft creation, or save events.
  - Future analytics event names come from `ANALYTICS_EVENT_NAMES` only in the later instrumentation child.
- Additive behavior:
  - New active registry templates with valid `templateKey` and draft factory should appear in the selection surface automatically through registry iteration.
  - Existing selection and draft tests should keep passing when a future fixture is added.
- Explicit mapping requirements:
  - New template source, persisted-template migration, template family with special UI, deprecated/aliased key behavior, localized business labels, dedicated Admin Analytics template module, commercial CTA placement, export format, finance reporting, vendor forwarding, or public-to-user attribution requires explicit mapping, docs, Help/Guide review, and tests.
- Unknown or deprecated values:
  - Unknown or invalid values fail closed and create no draft.
  - Deprecated values are hidden or blocked unless an explicit compatibility path exists.
  - Unmapped future values must not be counted as template usage in dedicated KPIs.
- Test/evidence:
  - Include fixtures for valid template, future active template, renamed label, duplicate key, invalid key, unknown key, deprecated key, and unrelated template surfaces.
  - Run route/label/support sweep for `Use template`, `Template usage`, `templateKey`, `templateId`, `sourceKind`, `sessionType`, Admin Analytics, Help/Guide, API contracts, and analytics docs.

## Help / Guide Impact

Required because this changes a visible user workflow label/action in Workout Builder.

- Update relevant user/admin Help/Guide or linked runbook if an existing Help/Guide surface describes Workout Builder creation paths.
- If no user-facing Help/Guide surface exists for Workout Builder templates, record the search evidence and explicit `N/A` rationale in this brief/PR.
- Preserve Admin Analytics interpretation that `Template usage` remains `not_instrumented` until the later instrumentation child ships.

## Screenshot / Visual Impact

Required because this changes visible UI.

- Capture folder: `output/workout-builder-template-runtime-source-selection-surface-v1-YYYY-MM-DD-HHMMSS`.
- Handoff type: `after/reference`.
- Required examples:
  - `after-workout-builder-template-selection-desktop.png`
  - `after-workout-builder-template-selection-mobile.png`
  - `after-workout-builder-template-draft-desktop.png`
  - `reference-workout-builder-manual-entry-desktop.png`
- Screenshot approval stop: stop after screenshot handoff and wait for owner approval or visual corrections before `npm run verify:pre-pr`, PR creation, or `npm run verify:pre-merge`.

Captured on `2026-06-10 17:28` local time in `output/workout-builder-template-runtime-source-selection-surface-v1-2026-06-10-171145` using an `after/reference` set:

- `after-workout-builder-template-selection-desktop.png`
- `after-workout-builder-template-selection-mobile.png`
- `after-workout-builder-template-draft-desktop.png`
- `reference-workout-builder-manual-entry-desktop.png`

Capture notes:

- Screenshots used a temporary local harness route that rendered the real `WorkoutBuilderHub` with auth-free fixture data because local dev-login/Supabase bypass was unavailable for e2e.
- The temporary harness hid global mobile nav and Next dev overlay so owner review focuses on the changed template selection/draft surfaces; the harness route was removed after capture.
- No product-rendering files, styles, assets, or export HTML changed after screenshot capture.

## Route / Label / Support Surface Sweep

Required before the first broad gate because this changes workflow labels/actions and support interpretation.

Search at minimum:

- `Use template`
- `Template usage`
- `workout template`
- `workout_template`
- `templateKey`
- `templateId`
- `workout_builder_template_selected`
- `sourceKind`
- `sessionType`
- `manual-pool`
- `manual-open-water`
- `Admin Analytics`
- `Help/Guide`
- `finance reporting`
- `Stripe reconciliation`

Check at minimum:

- `app/`
- `components/my-library/workouts/`
- `components/my-library/generator/`
- `components/admin/`
- `lib/workouts/`
- `lib/session-generator-v1/`
- `lib/analytics/`
- `tests/`
- `docs/api-contracts.md`
- `docs/architecture/`
- `docs/runbooks/`
- active/planned/blocked/done workout and analytics briefs.

Record executed identifiers, checked surfaces, fallout handled, and deferred fallout in this brief before `verify:pre-pr`.

Sweep evidence on `2026-06-10`:

- Executed identifiers: `Use template`, `Template usage`, `workout template`, `workout_template`, `templateKey`, `templateId`, `workout_builder_template_selected`, `sourceKind`, `sessionType`, `manual-pool`, `manual-open-water`, `Admin Analytics`, `Help/Guide`, `finance reporting`, and `Stripe reconciliation`.
- Checked surfaces: `app/`, `components/my-library/workouts/`, `components/my-library/generator/`, `components/admin/`, `lib/workouts/`, `lib/session-generator-v1/`, `lib/analytics/`, `tests/`, `docs/api-contracts.md`, `docs/architecture/`, `docs/runbooks/`, and workout/analytics task briefs.
- Fallout handled: added registry-backed runtime template source, added visible `Use template` actions, added template query handling that fails closed for invalid keys, updated Admin Help/API/architecture interpretation so `Template usage` remains `not_instrumented` until the dedicated event ships, and updated the blocked instrumentation brief to depend on this runtime child.
- Deferred fallout: no `workout_builder_template_selected`, no Admin Analytics template KPI, no source breakdown conversion, no persisted `workout_template` table, no RLS/migration/generated DB types, no admin template CRUD, no checkout/pricing/entitlement/Stripe/finance/export/vendor analytics, no raw payload drilldown, and no broad builder/generator redesign.

## Scope

- Add a typed V1 workout-template registry with stable `templateKey` identity and lifecycle/status rules.
- Add a visible, compact template selection surface to the existing Workout Builder/My Library entry flow.
- Add a `Use template` action that creates/populates an editable local workout draft from a valid registry template.
- Keep manual blank creation and AI-generated workout flows available and clearly separate.
- Keep resulting workouts editable and saveable through the existing `WorkoutEditor` / workout save path.
- Add targeted tests for registry identity, draft creation, selection UI, unknown/deprecated failures, accessibility, and no inference from adjacent values.
- Update docs/Help/Guide/support interpretation where the visible workflow or template contract changes.
- Capture screenshot handoff before pre-PR verification.

## Out Of Scope

- Adding `workout_builder_template_selected` or any new analytics event.
- Changing Admin Analytics `Template usage` from `not_instrumented`.
- Dedicated template usage dashboard, source breakdown, conversion, or commercial KPI.
- Supabase `workout_template` table, migration, RLS, generated DB types, admin template CRUD, or persisted template management.
- Checkout, prices, Stripe, entitlements, finance/reporting, vendor analytics, cookies, visitor IDs, raw payload drilldown, export/CSV, Garmin delivery, or public SEO pages.
- Inferring template usage from session type, generator toggles, generated draft creation, manual starter scaffolds, source kind, save events, button text, or display labels.
- Broad redesign of My Library, Workout Builder, Generator Intake, or Admin Analytics.

## Acceptance Criteria

- At least one real V1 registry-backed workout-builder template is available through a stable `templateKey`; preferred implementation includes a small seed set that proves list rendering is data-driven.
- Users can explicitly choose `Use template` and land in an editable workout draft built from that template.
- Manual blank workout creation and AI-generated session flows still work and are visually/actionably distinct from template selection.
- Unknown, invalid, duplicate, deprecated, or unavailable template keys fail closed and do not create fallback drafts.
- Template labels can be renamed without changing identity; materially different template patterns require a new key.
- Existing workout save behavior remains deterministic and protected; the saved workout is not treated as a template analytics event in this slice.
- Admin Analytics still reports template usage as `not_instrumented`.
- Help/Guide impact is handled or explicitly ruled N/A with search evidence.
- Screenshot handoff is captured and owner-approved before pre-PR validation.
- Brief remains scorecard-complete, forward-compatible, and lintable before execution starts.

## Validation

During implementation:

- `npm run lint:briefs`
- targeted registry/unit tests for template identity and draft factories
- targeted component tests for template selection UI and accessibility
- targeted e2e for template selection -> edit -> save on desktop and mobile where practical
- screenshot handoff with owner approval before `npm run verify:pre-pr`
- `npm run verify:pre-pr`
- required CI checks
- `npm run verify:pre-merge`

For this planned docs-only creation:

- `npm run lint:briefs`

Current implementation validation before screenshot handoff:

- `./node_modules/.bin/vitest run tests/unit/workout-templates.test.ts tests/unit/workout-pages.test.tsx tests/unit/workout-builder-hub.test.tsx tests/unit/admin-analytics-dashboard-view-model.test.ts tests/unit/admin-help-center.test.tsx` PASS: 5 files / 86 tests.
- `npm run typecheck` PASS.
- `npm run lint` PASS with 7 pre-existing warnings in old `output/` capture scripts, no errors.
- `env SITE_LOCK_ENABLED=0 npx playwright test tests/e2e/my-library-workout-builder.spec.ts --project=desktop-chromium --grep "starts from a workout template"` started but skipped because local dev-login/Supabase bypass returned HTML instead of auth JSON; browser evidence was captured through the temporary local screenshot harness instead.
- Screenshot handoff captured and owner-approved on `2026-06-10`; no product-rendering files changed after capture.
- `npm run lint:briefs:all` PASS.
- `npm run verify:pre-pr` first run failed on missing standard brief evidence for the session-step reference contract; fixed by documenting `docs/design/session-step-surface-contract.md` reuse before rerun.
- `npm run verify:pre-pr` PASS after evidence fix: full public lane, including lint, typecheck, unit, build, perf budgets, and E2E summary `106 passed`, `536 skipped`.
- PR `#1059` CI initially blocked on required CodeQL `Analyze (javascript-typescript)` with repeated GitHub REST auth failures during CodeQL init; narrowed CodeQL workflow `GITHUB_TOKEN` permissions were expanded with PR read and status write scopes so explicit permissions do not set those API surfaces to `none`.
- `npm run verify:pre-pr` PASS after CodeQL workflow permission fix: full public lane, including lint, typecheck, unit, build, perf budgets, and E2E summary `106 passed`, `536 skipped`.

## Checkpoint Log

- `2026-06-10 | planning | created planned child after the identity contract closed; runtime template selection remains the next unblocker before `workout_builder_template_selected` instrumentation can resume | next: wait for explicit owner instruction to implement this named brief`
- `2026-06-10 | implementation start | moved brief to in-progress on branch `workout-builder-template-runtime-source-selection-surface-v1`after explicit owner implementation instruction; scope remains registry-backed runtime source + visible`Use template` selection surface with analytics/Admin Analytics/commerce out of scope | next: inspect builder/manual draft surfaces and implement the minimal registry-backed selection flow`
- `2026-06-10 | screenshot handoff | implemented typed template registry, visible template selection cards, template query handling, local template draft creation, fail-closed invalid key behavior, Admin Help/API interpretation updates, targeted tests, and after/reference screenshot artifacts | next: wait for owner screenshot approval before `npm run verify:pre-pr`, PR creation, and `npm run verify:pre-merge`
- `2026-06-10 | screenshot approval | owner approved screenshot handoff and authorized merge when tests are green | next: run `npm run verify:pre-pr`, commit, push, open PR, monitor CI, run `npm run verify:pre-merge`, then merge if all required checks stay green`
- `2026-06-10 | pre-pr gate fix | first `npm run verify:pre-pr`stopped at quality-gate evidence for missing session-step reference contract wording; added explicit`docs/design/session-step-surface-contract.md`reuse evidence | next: rerun`npm run verify:pre-pr`
- `2026-06-10 | pre-pr verified | `npm run verify:pre-pr` passed the full public lane after the brief evidence fix; no generated output artifacts were left in the commit set | next: commit, push, open PR, and monitor CI`
- `2026-06-10 | CI release-gate fix | required CodeQL `Analyze (javascript-typescript)`failed twice in init with GitHub REST`Requires authentication`; added minimal `pull-requests: read`and`statuses: write`permissions to the CodeQL workflow while keeping`security-events: write` | next: rerun pre-PR validation, commit, push, and monitor required CI again`
- `2026-06-10 | CI fix pre-pr verified | `npm run verify:pre-pr`passed after the CodeQL workflow permission fix with E2E summary`106 passed`, `536 skipped` | next: commit, push, and monitor required CI again`
