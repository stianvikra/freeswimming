# Task Brief: My Library Athlete Profile, Training Metrics, And Preferences (10/10)

## Metadata

- `id`: `2026-03-19-my-library-athlete-profile-training-metrics-and-preferences-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-03-19`
- `updated`: `2026-03-19`

## Goal

Users can maintain a private swimmer profile, trusted training metrics, and practical training preferences inside My Library as three separate but linkable foundations for later session/program generator prefills.

## Why This Brief Exists

- Real dogfooding use is already present:
  - the owner is swimming `5` sessions per week,
  - wants to use the platform personally before all course/program content is finished,
  - and needs a place for swimmer-specific facts that are not the same as `Goals`, `Focus`, or `Notes`.
- `Goals`, `Focus`, and `Notes` already answer:
  - where the swimmer wants to go,
  - what the swimmer is working on now,
  - what the swimmer noticed or wants to revisit.
- This new slice answers a different set of jobs:
  - who the swimmer is,
  - what current training metrics the swimmer has,
  - what practical preferences/constraints should later shape generated sessions/programs.
- The correct 10/10 move is not to bolt this into the next random merge or bury it inside `Goals`.
- The correct 10/10 move is:
  - create a separate parent brief now,
  - define a privacy-safe athlete profile model,
  - define explicit training-metric and personal-record contracts,
  - define preferences that are useful later for session/program generation,
  - keep later generator/program automation as a child-slice concern.

## Dependencies And Boundaries

- Existing nearby user-owned training context that must stay separate but compatible:
  - `docs/task-briefs/done/2026-03-19-my-library-goals-focus-notes-training-context-10-10.md`
  - `app/my-library/goals/page.tsx`
  - `app/my-library/training/page.tsx`
  - `components/my-library/training/TrainingContextHub.tsx`
  - `lib/goals/server.ts`
  - `lib/training-context/server.ts`
- Nearby later work that this must stay compatible with:
  - `docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`
  - `docs/task-briefs/planned/2026-02-28-workout-data-contract-and-step-engine-10-10.md`
  - `docs/task-briefs/planned/2026-02-28-ai-plan-generator-json-guardrails-10-10.md`
  - later workout/session generator implementation slices
- This brief is for private user-owned My Library data.
- It is not:
  - an admin profile workflow,
  - a public athlete profile,
  - a pricing/entitlement decision,
  - or a session/program generator implementation slice.

## Product Model

- `Athlete profile`
  - who the swimmer is in product terms.
  - user-owned identifying and background fields for later personalization.
- `Training metrics`
  - trusted swim metrics and tests that may change over time.
  - example: `CSS`.
- `Personal records`
  - best-known swim performances with date/course metadata.
  - example: `100m freestyle`, `400m freestyle`, `1000m swim`.
- `Preferences`
  - practical training constraints and defaults that later help shape sessions/programs.
  - example: pool length, available days, preferred session length.

These are not the same as:

- `Goals`
  - where the swimmer wants to go over time.
- `Focus`
  - what the swimmer is training on now.
- `Notes`
  - what the swimmer observed or wants to revisit later.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Security and authz`
- `Privacy and compliance`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                           | Evidence                                |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| Product goals and IA                          | `target`     | Users can distinguish `Profile`, `Training metrics`, `Personal records`, `Preferences`, `Goals`, `Focus`, and `Notes` without conceptual overlap or duplicate data jobs. | IA review + brief contract + e2e plan   |
| UX flow clarity                               | `target`     | Mobile and desktop users can view/edit/save their profile, metrics, and preferences with explicit `loading`, `empty`, `error`, `retry`, and `saved` states.              | UX review + e2e                         |
| Visual design quality                         | `target`     | My Library profile/metrics/preferences surfaces fit existing visual language and avoid “settings sprawl” or unfinished card/form seams.                                  | screenshot review + manual QA           |
| Business logic correctness and data integrity | `target`     | Profile data, metrics, records, and preferences remain separate entities with deterministic validation, no stale-age drift, and no ambiguous canonical metric units.     | unit tests + runtime guards             |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes end-user My Library data, not admin/editor workflows.                                                                                     | scope rationale only                    |
| Accessibility (a11y)                          | `target`     | Forms, tables/cards, edit controls, and validation feedback remain keyboard/touch accessible with correct labels and focus behavior.                                     | Playwright + manual QA                  |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: additions must avoid obvious payload/render regressions on `/my-library` and adjacent authenticated routes.                                             | build + perf budgets + code review      |
| Data placement and sync boundaries            | `target`     | Saved profile, metrics, records, and preferences are server-canonical; unsaved form drafts remain local-only and recoverable enough for safe retry.                      | brief contract + tests                  |
| Caching and invalidation strategy             | `target`     | After save/delete/update, derived profile summaries and generator-ready context reads refresh deterministically with no stale CSS/PR/preference view.                    | integration tests + invalidation review |
| Reliability and failure handling              | `target`     | Validation/auth/network failures never silently lose saved data and always return deterministic non-500 recovery paths.                                                  | negative-path tests + manual QA         |
| Security and authz                            | `target`     | User-owned profile/metric/preference reads and writes remain scoped to the authenticated owner; unauthorized access fails closed (`401/403`).                            | API negative-path tests                 |
| Privacy and compliance                        | `target`     | Personal data is minimized, private by default, excluded from public routes, and not leaked through logs/errors/events.                                                  | scope contract + log review + tests     |
| Content governance                            | `supporting` | Supporting only: ownership, timestamps, and canonical record history remain explicit even though this is user data rather than editorial content.                        | schema/model review                     |
| Admin workflow and editability                | `N/A`        | N/A because no admin/operator editing surface is introduced in this parent brief.                                                                                        | scope rationale only                    |
| SEO and crawlability                          | `N/A`        | N/A because these are authenticated private My Library surfaces with no public crawl/index contract.                                                                     | scope rationale only                    |
| AI discoverability                            | `N/A`        | N/A for phase 1 because this slice prepares internal generator context rather than public AI-discoverable content.                                                       | scope rationale only                    |
| Analytics and KPI observability               | `supporting` | Supporting only: create/update/use events should be measurable enough to evaluate later personalization and generator adoption.                                          | event contract notes                    |
| Commerce and revenue ops                      | `N/A`        | N/A for this parent brief because pricing, subscription packaging, and entitlement strategy are explicitly deferred.                                                     | scope rationale only                    |
| Incident response and support operations      | `supporting` | Supporting only: support guidance should explain missing saves, validation errors, and privacy-safe repair of malformed metric/preference state.                         | Help/Guide or runbook note              |
| Finance and reporting operations              | `N/A`        | N/A because no billing, refunds, or reconciliation logic is introduced by user profile/training metadata alone.                                                          | scope rationale only                    |
| i18n operational readiness                    | `supporting` | Supporting only: field labels, units, and enumerations must remain locale-extensible for later multilingual product work.                                                | copy/schema review                      |
| Stack-fit and dependency discipline           | `target`     | Implementation should use existing Next.js/TypeScript/Supabase/test patterns and avoid new settings/profile dependencies without strong evidence.                        | dependency diff + code review           |
| Testing and QA automation                     | `target`     | Critical CRUD, validation, authz, and generator-context serialization paths are covered by unit/integration/e2e before merge.                                            | verify outputs + test matrix            |
| Scalability and cost efficiency               | `supporting` | Supporting only: metric and record history should scale without introducing obviously expensive read/write patterns for normal personal use.                             | schema/query review                     |
| DevOps and rollback readiness                 | `supporting` | Supporting only: schema rollout must be migration-safe and not break users who have `Goals/Focus/Notes` but no athlete profile data yet.                                 | migration/rollback notes                |

## Data Placement And Sync Contract (Required For Stateful Features)

- Server-canonical:
  - athlete profile row/entity,
  - training-metric rows/entities,
  - personal-record rows/entities,
  - preferences row/entity,
  - ownership, timestamps, unit metadata, and any later generator-context serialization fields.
- Local-only:
  - unsaved form drafts,
  - temporary unit display toggles or filters,
  - transient expanded/collapsed UI state,
  - any temporary “edit in progress” state before explicit save.
- Sync policy:
  - explicit save for create/update,
  - server response becomes source of truth,
  - stale auth must fail clearly without dropping unsaved text/field edits,
  - downstream generator-context summaries refresh after successful mutation.
- Privacy/data minimization:
  - collect only fields with clear training or personalization value,
  - profile data is private to the owner by default,
  - no public exposure or SEO surface.
- Age representation rule:
  - phase 1 must not store a raw mutable `age` value that silently goes stale,
  - use a non-stale or low-maintenance representation such as `age_band` or other explicitly defined stable input chosen during implementation,
  - any exact-age derivation later must remain privacy-conscious and deterministic.

## Identity And Rename Contract (Required When Entities Are Persisted Or Linkable)

- Canonical stable IDs:
  - `athlete_profile.id` is canonical for the profile entity,
  - `training_metric.id` is canonical for metric/test rows,
  - `personal_record.id` is canonical for PR rows,
  - `training_preferences.id` is canonical for preferences.
- Human-readable identifiers:
  - names, labels, and note-like descriptions are editable display fields,
  - they must not become routing-critical or canonical integration keys.
- Mutability rules:
  - IDs are immutable,
  - profile text fields are editable,
  - metric values and PR values may be edited only through explicit user actions that preserve history semantics,
  - preference fields are editable and replace canonical current settings.
- Rename vs repurpose:
  - profile wording edits are in-place changes,
  - materially different metric/record entries should create a new record rather than overwrite unrelated historical meaning,
  - later generator integrations must reference canonical IDs, not mutable labels.
- Compatibility contract:
  - this slice must remain compatible with later linking from:
    - `Goals`
    - `Focus`
    - `Notes`
    - session/program generator
    - workout/program builder
  - generator-prefill later must tolerate missing profile/metric/preference fields gracefully.
- Observability and repair:
  - invalid metric units, duplicate “current best” conflicts, or unresolved preference serialization must surface deterministically instead of being silently coerced.

## Scope

- Add a private My Library “athlete profile + training preferences” foundation.
- Keep this separate from the already-defined `Goals`, `Focus`, and `Notes` model.
- Define a first-class `Athlete profile` concept with optional user-owned fields such as:
  - first name,
  - last name,
  - display name,
  - age representation chosen to avoid silent stale-age drift.
- Define a first-class `Training metrics` concept:
  - include `CSS` as a canonical metric with explicit unit contract,
  - include recorded date/source metadata,
  - remain ready for additional test metrics later.
- Define a first-class `Personal records` concept:
  - distance,
  - stroke,
  - course/pool context,
  - time,
  - recorded date,
  - optional note/source metadata.
- Define a first-class `Preferences` concept with generator-ready value, such as:
  - default pool length,
  - available training days,
  - preferred weekly session count,
  - preferred session length or duration band,
  - other training constraints with clear later personalization value.
- Keep relationship-ready compatibility with:
  - `Goals`
  - `Focus`
  - `Notes`
  - future session generator
  - future program builder
- Explicitly define later generator/prefill contract:
  - generator may later read open goals, active focus, athlete profile, metrics, and preferences together,
  - goal/focus/profile/preference surfaces may later deep-link into generator with prefilled context,
  - but generator/program automation is deferred to later child slices.

## Out Of Scope

- Session generator implementation.
- Program builder implementation.
- Auto-generated sessions/programs from profile/metrics/preferences in this slice.
- Wearable or third-party data imports.
- Public athlete profile or social sharing.
- Pricing, subscriptions, bundles, or entitlements.
- Admin workflow changes.

## Suggested Child Slices

1. `Athlete profile foundation`
   - private profile hub, create/edit/save flow, privacy-safe field model.
2. `Training metrics and preferences foundation`
   - CSS, pool length, available days, weekly session count, session duration band, validation, and export support.
3. `Personal records foundation`
   - PR CRUD, distance/stroke/course/time/date/source metadata, and generator-ready serialization.
4. `Generator prefill from athlete profile + metrics + preferences`
   - read-only consumption of canonical user context in generator flows.

## Checkpoint Log

- `2026-03-19`: Parent brief created to lock the broader profile/metrics/preferences direction before implementation.
- `2026-03-19 | e830b21 (main) | child slice 1 shipped via PR #237 for private athlete-profile foundation; profile hub, canonical row, local draft recovery, and export compatibility are now on main | next: take training metrics + preferences as the next child slice and continue to defer personal records`
- `2026-03-19 | 4101d21 (main) | child slice 2 shipped via PR #239 in docs/task-briefs/done/2026-03-19-my-library-training-metrics-and-preferences-foundation-10-10.md with canonical CSS, structured training preferences, My Library/profile UX, export support, and green local/CI gates | next: take Personal records as the next child slice and continue to defer generator-prefill automation`

## Acceptance Criteria

1. `Athlete profile`, `Training metrics`, `Personal records`, and `Preferences` are clearly separate concepts in My Library.
2. These concepts remain clearly separate from `Goals`, `Focus`, and `Notes`.
3. Saved profile/metric/preference data is server-canonical and survives refresh/device changes.
4. Unsaved draft edits remain local-only and recoverable enough to avoid obvious frustration on phone/desktop.
5. `CSS` has an explicit canonical unit contract suitable for later generator use.
6. Personal records have explicit canonical fields for distance, stroke, course context, time, and recorded date.
7. Preferences are practical training inputs, not a dumping ground for unrelated settings.
8. Age data is modeled without a stale raw-age field.
9. Later session/program generator slices can consume profile/metric/preference context without requiring a breaking data-model redesign.
10. Private user data remains private by default and fails closed on unauthorized access.
11. `npm run lint:briefs`, relevant tests, and `npm run verify:pre-pr` must pass before PR update when implementation starts.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- targeted unit tests for:
  - metric unit normalization,
  - PR validation,
  - profile field validation,
  - preference serialization,
  - authz negative paths
- targeted e2e for:
  - create/edit/save profile,
  - create/edit/save CSS and PRs,
  - create/edit/save preferences,
  - loading/empty/error/retry states,
  - My Library distinction between training context vs profile/metrics/preferences
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library`
  - `http://127.0.0.1:3000/my-library/training`
  - future profile route/surface introduced by implementation
- Preview:
  - Vercel preview URL from PR checks
- Recommended matrix:
  - iPhone Safari
  - Android Chromium
  - iPad/tablet viewport
  - Desktop Chrome
  - Desktop Safari/WebKit
  - Desktop Firefox

## Constraints

- Keep the model useful for real personal swim use before all content/program work is complete.
- Do not collapse `Goals`, `Focus`, `Notes`, `Profile`, `Metrics`, and `Preferences` into one overloaded object.
- Avoid storing stale or privacy-heavy fields without clear product value.
- Keep generator/program logic out of phase 1 while still making later integration straightforward.
- Do not use mutable labels or human-readable text as canonical identity for metrics, records, or preferences.

## Checkpoint Log

- `2026-03-19 | working tree | created parent brief for athlete profile, training metrics, and preferences as the adjacent user-data foundation to Goals/Focus/Notes, with generator-ready boundaries and explicit later child slices | next: lint brief and use it as the source brief when the first implementation slice starts`
- `2026-03-19 | e830b21 (main) | first child slice shipped via PR #237 as athlete-profile foundation with private My Library profile hub, canonical Supabase row, export support, and green local/CI gates; parent direction stays planned because training metrics, personal records, and preferences remain future child slices | next: open the next child brief when we are ready to ship metrics/records or preferences separately`
