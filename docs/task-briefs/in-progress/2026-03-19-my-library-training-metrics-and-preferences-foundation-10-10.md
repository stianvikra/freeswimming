# Task Brief: My Library Training Metrics And Preferences Foundation (10/10)

## Metadata

- `id`: `2026-03-19-my-library-training-metrics-and-preferences-foundation-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-03-19`
- `updated`: `2026-03-19`

## Goal

Users can maintain private, generator-ready training metrics and training preferences inside My Library, clearly separated from `Athlete profile`, `Goals`, `Focus`, and `Notes`, while remaining practical enough for immediate personal swim use.

## Why This Brief Exists

- The parent brief `docs/task-briefs/planned/2026-03-19-my-library-athlete-profile-training-metrics-and-preferences-10-10.md` defines the broader direction.
- The first child slice shipped the private athlete-profile foundation on `main`.
- The next highest-value move is not `Personal records` yet.
- The next highest-value move is:
  - add a trusted current `CSS` metric with a canonical unit contract,
  - add practical training preferences that can later shape session/program generation,
  - keep these private, server-canonical, and clearly separate from profile text fields,
  - leave `Personal records` for a later child slice so this merge stays narrow enough to dogfood immediately.
- The owner is actively swimming `5` sessions per week and wants to use this data layer personally before the session generator/program builder is fully finished.

## Dependencies And Boundaries

- Parent direction:
  - `docs/task-briefs/planned/2026-03-19-my-library-athlete-profile-training-metrics-and-preferences-10-10.md`
- Already-shipped child slice:
  - `docs/task-briefs/done/2026-03-19-my-library-athlete-profile-foundation-10-10.md`
- Existing nearby private user-owned training surfaces that must stay separate but compatible:
  - `docs/task-briefs/done/2026-03-19-my-library-goals-focus-notes-training-context-10-10.md`
  - `app/my-library/page.tsx`
  - `app/my-library/profile/page.tsx`
  - `components/my-library/profile/AthleteProfileHub.tsx`
  - `lib/athlete-profile/server.ts`
  - `lib/training-context/server.ts`
- This slice is only for:
  - private training metrics foundation,
  - private preferences foundation,
  - generator-ready data contracts,
  - My Library UX for editing and revisiting these fields now.
- This slice is not for:
  - `Personal records`,
  - session/program generator implementation,
  - automatic workout generation,
  - admin/operator workflows,
  - public profile/sharing,
  - pricing or entitlements.

## Product Model

- `Athlete profile`
  - private swimmer identity/context.
  - already shipped separately.
- `Training metrics`
  - trusted current swim-test values.
  - phase 1 in this slice: `CSS`.
- `Preferences`
  - practical training defaults and constraints that later help shape session generation.
  - phase 1 in this slice:
    - pool length,
    - available training days,
    - preferred weekly session count,
    - preferred session duration band.

These are not the same as:

- `Goals`
  - where the swimmer wants to go.
- `Focus`
  - what the swimmer is working on right now.
- `Notes`
  - what the swimmer noticed or wants to revisit.
- `Personal records`
  - best-known performances across distances/strokes, deferred to a later child slice.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Security and authz`
- `Privacy and compliance`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                                | Evidence                                |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Product goals and IA                          | `target`     | Users can distinguish `Athlete profile`, `Training metrics`, and `Preferences` from `Goals`, `Focus`, and `Notes` without role confusion or duplicated data jobs.             | IA review + child-brief contract + e2e  |
| UX flow clarity                               | `target`     | Mobile and desktop users can view/edit/save CSS and preferences with explicit `loading`, `empty`, `saved`, `error`, and `retry` states in <=2 actions from My Library.        | manual QA + e2e                         |
| Visual design quality                         | `target`     | Metrics/preferences UI fits the existing My Library visual language and avoids becoming a generic settings dump.                                                              | screenshot review + manual QA           |
| Business logic correctness and data integrity | `target`     | `CSS` is stored with one canonical unit contract, preferences are validated deterministically, and saved metric/preference entities remain separate from profile text fields. | unit tests + runtime validation         |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes private end-user My Library data, not admin/editor workflows.                                                                                  | scope rationale only                    |
| Accessibility (a11y)                          | `target`     | Metrics and preference controls remain keyboard/touch accessible with proper labels, field grouping, helper text, and save feedback semantics.                                | Playwright + manual QA                  |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: additions must avoid obvious payload/render regressions on `/my-library` and `/my-library/profile`.                                                          | build + perf budgets + code review      |
| Data placement and sync boundaries            | `target`     | Saved metrics/preferences are server-canonical; unsaved edits remain local-only and recoverable enough for safe retry without corrupting canonical values.                    | contract review + tests                 |
| Caching and invalidation strategy             | `target`     | My Library summary and profile hub refresh deterministically after saving metrics/preferences with no stale CSS or preference summaries.                                      | integration tests + invalidation review |
| Reliability and failure handling              | `target`     | Validation/auth/network failures fail clearly without silently losing saved data or silently coercing invalid metrics/preferences.                                            | negative-path tests + manual QA         |
| Security and authz                            | `target`     | Metric/preference reads and writes are owner-only; unauthenticated/unauthorized requests fail closed with `401/403`.                                                          | API negative-path tests                 |
| Privacy and compliance                        | `target`     | Metrics/preferences remain private by default, excluded from public routes, and not leaked through logs, errors, or analytics payloads.                                       | scope review + tests + log review       |
| Content governance                            | `supporting` | Supporting only: private user training data still needs explicit ownership, timestamps, and source-of-truth rules even though it is not editorial content.                    | schema/model review                     |
| Admin workflow and editability                | `N/A`        | N/A because no admin/operator workflow changes are introduced in this child slice.                                                                                            | scope rationale only                    |
| SEO and crawlability                          | `N/A`        | N/A because this is a private authenticated My Library surface with no public crawl/index contract.                                                                           | scope rationale only                    |
| AI discoverability                            | `N/A`        | N/A because this slice prepares private generator-ready context, not public AI-discoverable content.                                                                          | scope rationale only                    |
| Analytics and KPI observability               | `supporting` | Supporting only: create/update usage should be measurable enough to evaluate real dogfooding and later generator adoption.                                                    | event review                            |
| Commerce and revenue ops                      | `N/A`        | N/A because pricing, bundles, and entitlements are explicitly deferred.                                                                                                       | scope rationale only                    |
| Incident response and support operations      | `supporting` | Supporting only: failed metric/preference saves should be diagnosable with privacy-safe logs and recoverable user-facing messaging.                                           | runbook/help review                     |
| Finance and reporting operations              | `N/A`        | N/A because no billing, reconciliation, or financial reporting logic is introduced by private metrics/preferences.                                                            | scope rationale only                    |
| i18n operational readiness                    | `supporting` | Supporting only: day labels, units, and preference enumerations must remain locale-extensible for later multilingual product work.                                            | copy/schema review                      |
| Stack-fit and dependency discipline           | `target`     | Implementation uses existing Next.js/TypeScript/Supabase/test patterns with no unnecessary new dependencies.                                                                  | dependency diff + code review           |
| Testing and QA automation                     | `target`     | Unit/integration/e2e coverage protects metric/preference CRUD, unit validation, authz, export inclusion, and local draft persistence before merge.                            | tests + verify outputs                  |
| Scalability and cost efficiency               | `supporting` | Supporting only: one current metric row plus one preference row per user should avoid wasteful query patterns and stay cheap to read in later generator flows.                | schema/query review                     |
| DevOps and rollback readiness                 | `supporting` | Supporting only: migration rollout must be backward-compatible for users who have athlete profiles but no metric/preference rows yet.                                         | migration + rollback notes              |

## Data Placement And Sync Contract (Required For Stateful Features)

- Server-canonical:
  - current training metric rows,
  - training preferences row,
  - ownership,
  - timestamps,
  - canonical units and enumerations,
  - export serialization.
- Local-only:
  - unsaved metrics/preferences draft edits,
  - transient save banners,
  - transient expanded/collapsed UI state.
- Sync policy:
  - explicit save,
  - server response becomes source of truth,
  - unsaved local drafts survive reload long enough for retry,
  - stale auth fails clearly and preserves local unsaved input.
- Unit contract:
  - `CSS` is stored canonically as seconds-per-100m,
  - input UX may be swimmer-friendly, but persisted canonical value must stay deterministic.
- Preference contract:
  - available days are explicit weekday values, not free text,
  - pool length and duration are explicit enumerations or bounded numeric fields, not ambiguous strings.

## Identity And Rename Contract (Required When Entities Are Persisted Or Linkable)

- Canonical stable IDs:
  - `training_metric.id` is canonical for metric rows,
  - `training_preferences.id` is canonical for the preferences row.
- Human-readable identifiers:
  - metric labels and preference helper text are editable display copy only.
- Mutability rules:
  - IDs are immutable,
  - metric values are editable through explicit user actions,
  - preferences are editable current settings,
  - later generator integrations must read canonical IDs and canonical units, not mutable display labels.
- Rename vs repurpose:
  - updating current `CSS` is an in-place update of the same metric type for the same user,
  - materially different future metric types must become distinct rows rather than overwriting unrelated meaning,
  - preferences are current-state values and may be edited in place.
- Compatibility contract:
  - users with no metric/preference rows must still get deterministic empty states,
  - later generator-prefill slices must tolerate missing values gracefully.
- Observability and repair:
  - invalid units, duplicate current metric conflicts, or malformed day/preference payloads must fail deterministically instead of being silently coerced.

## Scope

- Add private My Library `Training metrics` and `Preferences` sections on top of the shipped athlete-profile foundation.
- Add a first-class `training_metrics` entity with phase-1 support for:
  - `CSS`,
  - measured/recorded date,
  - optional source note,
  - canonical stored value in seconds-per-100m.
- Add a first-class `training_preferences` entity with phase-1 support for:
  - pool length,
  - available training days,
  - preferred weekly session count,
  - preferred session duration band.
- Keep these clearly separate from:
  - athlete profile text fields,
  - `Goals`,
  - `Focus`,
  - `Notes`.
- Surface this inside My Library/profile in a phone-friendly way.
- Update the My Library summary card so the athlete-profile entry reflects whether metrics/preferences are present.
- Include metrics/preferences in user export.
- Keep the page generator-ready without building generator logic yet.

## Out Of Scope

- `Personal records`.
- Session/program generator implementation.
- Automatic workout/program generation from metrics/preferences.
- Admin/operator surfaces.
- Public sharing.
- Pricing, subscriptions, or bundles.

## Acceptance Criteria

1. A signed-in user can view and edit private `Training metrics` and `Preferences` from My Library.
2. `Training metrics` and `Preferences` remain clearly separate from `Athlete profile`, `Goals`, `Focus`, and `Notes`.
3. `CSS` is saved using an explicit canonical unit contract suitable for later generator use.
4. Preferences are saved as deterministic structured values, not ambiguous free text.
5. Saved metrics/preferences are server-canonical and survive refresh/device changes.
6. Unsaved metric/preference edits remain local-only and recoverable enough to avoid obvious frustration after accidental refresh.
7. Users with no metrics/preferences rows see deterministic empty states and can create them without errors.
8. Unauthorized access to another user's metrics/preferences is not possible.
9. Export payload includes metrics/preferences when present and remains valid when absent.
10. `npm run lint:briefs`, relevant tests, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- targeted unit tests for:
  - CSS unit parsing/normalization,
  - preference validation,
  - route authz,
  - export payload shape
- targeted e2e for:
  - open/save/reload metrics and preferences,
  - local draft recovery,
  - My Library summary entry point
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library`
  - `http://127.0.0.1:3000/my-library/profile`
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

- Keep this slice narrow and genuinely useful now.
- Do not pull `Personal records` into the same merge.
- Keep `My Library` naming unchanged.
- Follow existing Next.js/Supabase/My Library patterns.
- Avoid collecting fields without clear training or generator-prefill value.

## 10/10 Quality Bar (Required For User-Facing Work)

- The metrics/preferences surface must feel like a real private training tool, not a placeholder settings dump.
- `CSS` must be explicit enough that later generator logic can trust it without guessing units.
- Preference choices must be practical for real swimmer planning, not generic profile fluff.
- Empty, loading, saved, and error states must all be explicit.
- Draft recovery must protect against accidental refresh while editing.
- Business logic must stay deterministic:
  - one current canonical CSS value per user in this slice,
  - one preferences row per user,
  - no cross-user leakage,
  - no silent save failure.

## Help/Guide And Operator Training Contract (Required For Workflow Changes)

- User-facing My Library workflow copy changes are in scope.
- Help/Guide content must explain that:
  - metrics/preferences are private,
  - they stay separate from athlete profile text, goals, focus, and notes,
  - generator/program use comes later.

## Checkpoint Log

- `2026-03-19`: Child brief created and moved to `in-progress` for private training metrics and preferences foundation. `Personal records` stay deferred to a later child slice.
- `2026-03-19 | feat/my-library-training-metrics-preferences-foundation | implemented training metrics + preferences foundation: added private CSS metric + training preferences schema/API/UI/export support, updated My Library summary/profile surfaces, added validation/authz/export/draft-recovery coverage, and ran targeted typecheck/unit/e2e plus full \`npm run verify:pre-pr\` PASS. Perf trend recommended \`tighten\` after another weekly green run; decision for this non-perf slice is \`hold\` and carry the ratchet decision in the next perf-focused workstream.`
