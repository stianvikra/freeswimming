# Task Brief: Workout Builder Template Identity / Selection Contract V1 (10/10)

## Metadata

- `id`: `2026-06-10-workout-builder-template-identity-selection-contract-v1-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-10`
- `updated`: `2026-06-10`
- `parent_brief`: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- `unblocks`:
  - `docs/task-briefs/blocked/2026-06-10-workout-builder-template-usage-instrumentation-v1-10-10.md`
- `related_briefs`:
  - `docs/task-briefs/planned/2026-02-28-workout-data-contract-and-step-engine-10-10.md`
  - `docs/task-briefs/done/2026-06-10-workout-builder-template-usage-generated-completion-dashboard-v1-10-10.md`
- `execution_mode`: `docs-only-contract-after-explicit-implement`
- `branch`: `workout-builder-template-identity-selection-contract-v1`

## Brief Audit Record

- `last_audited`: `2026-06-10`
- `base`: active branch `workout-builder-template-identity-selection-contract-v1` after clean synced `main@99acbbb5`, with the template usage instrumentation child blocked by audit.
- `audit_status`: `ready`
- `decision`: Implement this as the narrow docs-only contract child that must be completed before template usage instrumentation can resume.
- `reason`: The instrumentation audit found no runtime workout-builder template entity, stable template ID/key, or explicit template-selection action; this child owns the product/data identity decision instead of adding fake analytics.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, task brief template, scorecard categories, workout data-contract brief, workout-builder/generator runtime surfaces, `lib/workouts/`, `lib/session-generator-v1/`, analytics event taxonomy, Admin Analytics template usage contract, Help/Guide contract, or route/label/support sweep rules change before merge.

## Goal

Define the stable workout-builder template identity and explicit selection contract required before template usage can be instrumented or shown as a counted Admin Analytics KPI.

## Pre-Implementation Owner Explanation

Vi definerer forst hva en workout-template faktisk er i produktet: hvor den bor, hvilken stabil ID den har, om navn kan endres, og hva som teller som at brukeren valgte den. Dette betyr at senere template-usage tall kan bli ekte, ikke gjetting fra session type, AI-utkast eller lagrede okter. Utenfor scope er runtime template-UI, nytt database-skjema, analytics-event, Admin Analytics-dashboard, CTA, checkout, Stripe, priser, finance, export og tredjeparts analytics.

Forward-compatibility-intent: nye workout templates skal kunne arve samme stabile ID/valgkontrakt automatisk. Nye template-kilder, template-familier, kommersielle plasseringer, localized labels, export-format eller analytics-KPI-er krever eksplisitt mapping, docs og tester.

## Implemented Product Decision

Contract source: `docs/architecture/workout-builder-template-identity-selection-contract.md`

This child answers the required decision gate as follows:

1. Workout-builder template definition:
   - A workout-builder template is a reusable full workout/session pattern that can create or populate a workout draft through an explicit user action.
   - Reusable single step/block snippets, generated-session presets, manual starter scaffolds, session type, generator toggles, source kind, and unrelated goal/email/admin/route templates do not count for this KPI.
2. Current source of truth:
   - Current runtime support is `not supported`.
   - The preferred future source is a persisted `workout_template` or equivalent server-canonical entity from the workout data contract after that contract is refreshed and implemented.
   - A typed in-repo registry with a write-once `templateKey` is allowed only as a separate owner-approved interim child with fixtures, unknown/deprecated tests, and a migration path to the persisted entity.
3. Canonical stable identifier:
   - Future persisted templates use immutable `templateId`.
   - Future registry templates use write-once `templateKey`.
   - `templateKey` must be lowercase ASCII, start with a letter or number, use only letters/numbers/underscore/hyphen, and be 3-64 characters.
   - Identity is separate from title, route slug, label, category, sort order, locale, and session type.
4. Human-readable fields:
   - Title, label, description, category, sort order, admin copy, and localized visible copy are display-only and renameable when the underlying template meaning is unchanged.
5. Selection action:
   - Template selection means an explicit `Use template`-equivalent action where a valid canonical template identity is resolved and the builder/generator accepts the template to start or populate a workout draft.
   - Opening/previewing a template, viewing a list, generating without template identity, saving a workout, or editing a workout created earlier from a template does not count as selection.
6. Unknown/deprecated behavior:
   - Unknown, invalid, unavailable, or deprecated template IDs fail closed.
   - They must not be mapped to nearby titles, current session type, source kind, draft creation, or fallback templates.
7. Instrumentation impact:
   - Do not add `workout_builder_template_selected` in this slice.
   - Keep Admin Analytics `Template usage` as `not_instrumented`.
   - The blocked instrumentation child may resume only after a future runtime child creates or identifies the canonical source and explicit selection surface.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for the 10/10 claim gate:

- Product goals and IA
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Reliability and failure handling
- Privacy and compliance
- Analytics and KPI observability
- Stack-fit and dependency discipline
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                             | Evidence                                        | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Contract defines whether workout templates exist now, where they fit in builder/generator IA, and what decision unblocks analytics.                                            | contract doc + parent/blocked checkpoint        | `5/5`                   |
| UX flow clarity                               | `target`     | Selection action is defined clearly enough that future UI can show one obvious `Use template` moment without confusing generator settings or normal saves.                     | selection contract + future UI acceptance notes | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: no visual change in this contract slice; future template UI must reuse existing workout-builder surfaces and screenshot handoff.                              | scope rationale + UI follow-up rule             | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Template identity, rename/repurpose policy, invalid/unknown behavior, and selection semantics are deterministic before analytics or persistence depends on them.               | identity contract + negative examples           | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: no admin template editor ships here; if admin-managed templates are chosen later, CRUD ergonomics need a separate child.                                      | admin scope rationale                           | `4/5`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: no rendered UI ships here; future selection controls must define accessible name, keyboard, focus, and state semantics.                                       | future UI acceptance notes                      | `4/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: contract must avoid future per-title/high-cardinality payloads or heavy template catalogs on core routes.                                                     | payload/cardinality guardrails                  | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Contract states whether template truth is server-canonical, registry-canonical, or not supported, and what remains local-only.                                                 | data placement section                          | `5/5`                   |
| Caching and invalidation strategy             | `target`     | If a template source is selected, contract defines read/cache/invalidation expectations; if not, it records `N/A` with unblock condition.                                      | cache/invalidation contract                     | `5/5`                   |
| Reliability and failure handling              | `target`     | Missing, deprecated, invalid, or unavailable template IDs fail safely and never get rebound to an adjacent session/generator value.                                            | fallback/error contract                         | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only for docs-only contract: future protected template reads/writes must fail closed and include negative-path tests.                                               | authz future-scope rule                         | `4/5`                   |
| Privacy and compliance                        | `target`     | Template analytics/selection payload rules exclude titles, notes, raw workout text, user IDs, emails, payment data, raw URLs, and raw payload UI.                              | privacy guardrails + instrumentation dependency | `5/5`                   |
| Content governance                            | `target`     | Contract defines owner, lifecycle, rename/repurpose, alias/deprecation, and support interpretation for template identities.                                                    | governance section + route/label/support sweep  | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: admin edit/publish workflow is out of scope unless a later template-management child is approved.                                                             | admin workflow scope rationale                  | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this contract changes no public route, metadata, sitemap, robots, canonical URL, structured data, or crawlable content.                                            | explicit SEO scope rationale                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this contract adds no public semantic entity page, public docs page, structured data, or AI-facing crawl surface.                                                  | explicit AI-discoverability scope rationale     | `N/A`                   |
| Analytics and KPI observability               | `target`     | Contract names the exact identity and selection event preconditions required before template usage can become a counted KPI.                                                   | analytics unblock contract                      | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: template identity remains product telemetry, not checkout, revenue attribution, entitlement truth, Stripe reconciliation, or finance reporting.               | commerce boundary rationale                     | `4/5`                   |
| Incident response and support operations      | `supporting` | Supporting only: future support diagnostics must distinguish unknown/deprecated templates from instrumentation failure; no incident workflow ships here.                       | support interpretation rule                     | `4/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: no finance reconciliation, invoices, refunds, payouts, subscriptions, accounting export, or Stripe reporting changes.                                         | explicit finance scope rationale                | `4/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: stable template IDs must be locale-independent and visible labels must remain renameable/localizable later.                                                   | i18n identity rule                              | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Contract reuses existing Next.js, TypeScript, workout, generator, analytics, and brief patterns; no dependency, vendor, or schema change is introduced by this planning slice. | changed-files/package diff                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed briefs pass brief lint; future runtime children must add identity, selection, invalid/unknown, and analytics no-inference tests.                                       | lint + future test matrix                       | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Template IDs must stay low-cardinality and safe for aggregate analytics; template titles/per-user/per-workout IDs must not become KPI dimensions.                              | cardinality guardrail                           | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Docs-only contract is revertable; future runtime/schema children must define migration/rollback before shipping template identity.                                             | rollback scope + follow-up release rule         | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - This docs-only contract does not add UI.
  - Future UI must reuse `components/my-library/workouts/WorkoutBuilderHub.tsx`, `components/my-library/workouts/WorkoutEditor.tsx`, or `components/my-library/generator/*` only after the contract defines the selection moment.
  - No new route, tab, modal, dashboard module, or chart is in scope here.
- TypeScript/domain contracts:
  - Define a stable `templateId` or `templateKey` shape before any `ANALYTICS_EVENT_NAMES` addition.
  - Decide whether the source is a typed registry, persisted entity, or unavailable.
  - Unknown/invalid template identifiers must fail closed for dedicated analytics.
- Supabase/data layer:
  - No migration in this brief.
  - If future persisted templates are chosen, they need a separate migration/RLS/generated-types child with negative-path tests.
  - If a registry is chosen, it needs typed fixtures and unknown-value tests before analytics.
- External services/tools:
  - No Stripe, checkout, finance, vendor analytics, SDK, webhook, secret, cookie, visitor ID, or tag-manager change.
- UI system:
  - No screenshot handoff for this docs-only contract slice.
  - Future visible template-selection UI requires screenshot handoff before `npm run verify:pre-pr`.
- Testing:
  - This brief requires brief lint, diff-check, and docs-only verification.
  - Future implementation must include contract tests for valid, unknown, deprecated, renamed, and repurposed templates plus selection/no-selection behavior.

## Data Placement And Sync Contract

- Server-canonical:
  - If persisted templates are selected, `workout_template` or equivalent server entity becomes source of truth in a future child.
  - If a typed registry is selected, the registry file and tests become repo-canonical until a server entity replaces it.
- Local/browser:
  - No local analytics identity, visitor ID, cookie, localStorage template truth, or user-to-public attribution bridge is added by this contract.
  - Existing builder/generator transient state remains local-only where already implemented.
- Sync behavior:
  - Future template selection should read from canonical template identity, not session labels, titles, or source kind.
  - Missing/deprecated template IDs must not auto-map to another visible template.
- Retention and sensitivity:
  - Template IDs/keys must be non-sensitive machine identifiers.
  - Titles, notes, raw workout text, raw URLs/referrers, emails, IPs, user agents, user IDs, visitor IDs, payment/cart/shipping data, Stripe IDs, and raw payload JSON must not be analytics dimensions.
- Cache/invalidation:
  - If the template source is a static registry, normal build/deploy invalidation is enough until a later child says otherwise.
  - If the template source is server-canonical, future reads must define no-store/cache/revalidation and mutation invalidation rules.

## Identity And Rename Contract

- Canonical stable ID:
  - Required before instrumentation can resume.
  - Must be either immutable `templateId` or write-once `templateKey`.
  - Must be separate from editable title, route slug, display label, sort order, and session type.
- Human-readable identifiers:
  - Template title, description, category, and admin/user labels are display-only.
  - Labels may be renamed when the underlying template is still the same template.
- Mutability rules:
  - Canonical ID/key must not be repurposed.
  - Sort order, copy, labels, and grouping can change without changing ID when semantic template meaning is stable.
- Rename vs repurpose:
  - Rename in place is allowed for copy-only or clarity changes.
  - A materially different workout structure, target user job, source behavior, or selection meaning requires a new template ID/key.
- Compatibility contract:
  - Deprecated template IDs need explicit alias, hidden-but-readable, or blocked behavior before analytics counts them.
  - Unknown template IDs must not be counted in dedicated template-specific KPIs until mapped.
- Observability and repair:
  - Future analytics/dashboard code must expose unknown/deprecated template states as safe diagnostics or exclude them with documented fallback.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Template IDs/keys, template families, template source kinds, builder modes, generator stages, session types, workflow labels/actions, admin surfaces, future locales, analytics payload fields, export formats, commerce modules, and support copy.
- Source of truth:
  - Template identity must come from the selected source of truth, not from mutable display copy, `sessionType`, `sourceKind`, generator block keys, draft creation, save events, or button text.
  - Analytics event identity remains `ANALYTICS_EVENT_NAMES` only after a later instrumentation child resumes.
- Additive behavior:
  - New templates from the selected source should inherit the same identity/selection rules automatically.
  - Generic Admin Analytics event lists can later show a selection event once instrumentation exists.
- Explicit mapping requirements:
  - New template sources/families, dedicated Admin Analytics template modules, localized labels, commercial CTA placement, checkout attribution, export formats, finance reporting, vendor forwarding, or public-to-user attribution require explicit mapping, docs, tests, and owner decision.
- Unknown or deprecated values:
  - Unknown template values fail closed for dedicated analytics.
  - Deprecated IDs require alias/migration/support interpretation before they are counted in template-specific modules.
- Test/evidence:
  - Future runtime children must include fixtures for new template, renamed label, deprecated template, unknown ID, invalid ID, duplicate selection, and selection failure.
  - Route/label/support sweep must cover template, Template usage, sourceKind, sessionType, generator blocks, Help/Guide, API contracts, and analytics docs.

## Help / Guide Impact

N/A for this docs-only contract with rationale: it changes no visible Admin Help/Guide content, workflow label, support recovery path, or user-facing template UI. If a later child adds visible template-selection UI, Admin Analytics interpretation, or support guidance, Help/Guide assertions must update in that same PR.

## Screenshot / Visual Impact

No screenshot handoff is required for this docs-only brief because it changes no rendered UI, print, layout, brand, CSS, button/card text, or user workflow.

- Screenshot artifacts: N/A.
- Screenshot comparison naming: N/A.
- Owner screenshot approval stop: required only for future visible UI changes.

## Route / Label / Support Surface Sweep

Required before this contract is executed because it changes template identity/support interpretation.

Search at minimum:

- `workout_template`
- `workout template`
- `templateId`
- `templateKey`
- `Use template`
- `Template usage`
- `workout_builder_template_selected`
- `sessionType`
- `sourceKind`
- `generator_intake_block_toggled`
- `session_draft_generated`
- `workout_builder_saved`
- `Admin Analytics`
- `Help/Guide`
- `finance reporting`
- `Stripe reconciliation`
- `CSV export`

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

Sweep evidence on `2026-06-10`:

- `docs/api-contracts.md` states `Template usage` remains `not_instrumented` until explicit template identity/selection exists and must not infer usage from session type, generator toggles, draft creation, or adjacent activity.
- `docs/architecture/data-access-authz-cache-contract-registry.md` and `docs/architecture/external-service-contract-matrix.md` already preserve the same not-instrumented analytics boundary.
- The runtime audit recorded in `docs/task-briefs/blocked/2026-06-10-workout-builder-template-usage-instrumentation-v1-10-10.md` found no current workout-builder template entity, stable template ID/key, or explicit selection action in builder/generator code.
- `docs/task-briefs/planned/2026-02-28-workout-data-contract-and-step-engine-10-10.md` names future `workout_template` as a planned canonical entity, but its audit status is `revise-before-use`; it is not a current runtime source.

## Scope

- Move the contract brief to `in-progress` after explicit owner implementation approval.
- Create a durable architecture contract that defines the decisions needed before template usage instrumentation.
- Identify required template identity, source-of-truth, rename/repurpose, compatibility, and support interpretation rules.
- Define the explicit selection-action contract required before `workout_builder_template_selected` can exist.
- Link this in-progress child and architecture contract from the commercial analytics parent and the blocked instrumentation child.
- Keep this docs-only and do not add runtime template, analytics, dashboard, schema, vendor, checkout, export, or finance behavior.

## Out Of Scope

- Runtime template UI.
- New database schema/migration.
- RLS/generated database type changes.
- New `ANALYTICS_EVENT_NAMES` entry.
- Analytics payload helper or call site.
- Admin Analytics dashboard module or label change.
- Help/Guide runtime copy.
- CTA placement, upsell copy, checkout, pricing, entitlements, Stripe, refunds, payouts, finance reporting, accounting export, vendor forwarding, cookies, visitor IDs, or tag manager.
- Export/CSV.
- Builder/generator UX redesign.
- New dependencies.

## Acceptance Criteria

1. In-progress brief exists at `docs/task-briefs/in-progress/2026-06-10-workout-builder-template-identity-selection-contract-v1-10-10.md`.
2. Brief explains the product decision in owner-readable Norwegian and states what is out of scope.
3. Architecture contract exists at `docs/architecture/workout-builder-template-identity-selection-contract.md`.
4. Contract defines template source-of-truth, stable identity, rename/repurpose, selection action, unknown/deprecated fallback, and future instrumentation preconditions.
5. Brief includes complete scorecard mapping, stack/architecture gate, data placement, identity, forward compatibility, Help/Guide, screenshot, route/label/support sweep, scope, out-of-scope, acceptance, validation, and recovery sections.
6. Parent brief points to this in-progress child and the architecture contract as the unblock path for blocked template usage instrumentation.
7. Blocked instrumentation brief points to this in-progress child and architecture contract as the resume condition.
8. Changed docs pass `npm run lint:briefs:all`, `git diff --check`, and docs-only `npm run verify:pre-pr`.

## Validation

For this docs-only contract implementation:

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `git diff --check`
- route/label/support-surface sweep
- `npm run verify:pre-pr`

For future runtime execution:

- contract tests or docs assertions named by the implemented source decision
- targeted unit/component tests for valid, unknown, deprecated, renamed, and repurposed templates plus selection/no-selection behavior
- required PR CI checks
- `npm run verify:pre-merge`

## Session Continuity And Recovery

- Parent path: `docs/task-briefs/planned/2026-02-28-workout-commercial-analytics-funnel-10-10.md`
- Active child path: `docs/task-briefs/in-progress/2026-06-10-workout-builder-template-identity-selection-contract-v1-10-10.md`
- Contract path: `docs/architecture/workout-builder-template-identity-selection-contract.md`
- Blocked dependent child path: `docs/task-briefs/blocked/2026-06-10-workout-builder-template-usage-instrumentation-v1-10-10.md`
- Current status: docs-only contract implemented locally; no runtime template or analytics work is approved in this child.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this child, the parent, and the blocked instrumentation child, then continue from the latest checkpoint.

## Checkpoint Log

- `2026-06-10 | planned child created | created planned contract brief after template usage instrumentation was blocked by audit; this child owns the source-of-truth, stable template identity, rename/repurpose, selection action, and unknown/deprecated fallback decisions needed before instrumentation can resume | next: wait for owner implementation approval or scope edits`
- `2026-06-10 | child moved to in-progress | owner requested implementation, branch renamed to workout-builder-template-identity-selection-contract-v1, and lifecycle moved to in-progress; scope remains docs-only contract with no runtime template/event/schema/dashboard/commerce changes | next: create durable architecture contract and update parent/blocked child references`
- `2026-06-10 | contract implemented | added docs/architecture/workout-builder-template-identity-selection-contract.md with the conservative decision that runtime templates are not supported yet, future identity must be immutable templateId or write-once templateKey, selection requires explicit Use-template-equivalent draft population, and unknown/deprecated values fail closed; instrumentation remains blocked until a real template source and selection surface exist | next: validate brief lint, diff check, and pre-pr docs lane`
