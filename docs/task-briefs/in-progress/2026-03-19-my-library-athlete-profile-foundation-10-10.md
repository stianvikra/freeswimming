# Task Brief: My Library Athlete Profile Foundation (10/10)

## Metadata

- `id`: `2026-03-19-my-library-athlete-profile-foundation-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-03-19`
- `updated`: `2026-03-19`

## Goal

Users can maintain a private athlete profile inside My Library with clear separation from `Goals`, `Focus`, and `Notes`, using a mobile-safe save flow that becomes later generator-ready without forcing metrics/preferences into the same first slice.

## Why This Brief Exists

- The parent brief `docs/task-briefs/planned/2026-03-19-my-library-athlete-profile-training-metrics-and-preferences-10-10.md` defines the broader direction.
- The correct first move is narrower:
  - ship a private athlete-profile foundation now,
  - keep it separate from account/auth profile rows,
  - make it genuinely usable for real swim practice now,
  - leave training metrics, personal records, and broader preferences to later child slices.
- The owner is actively swimming `5` times per week and is more likely to use this personal training layer than unfinished public course content.
- This slice should therefore optimize for immediate dogfooding value without overbuilding.

## Dependencies And Boundaries

- Parent direction:
  - `docs/task-briefs/planned/2026-03-19-my-library-athlete-profile-training-metrics-and-preferences-10-10.md`
- Existing nearby private user-owned training surfaces that must stay separate but compatible:
  - `docs/task-briefs/done/2026-03-19-my-library-goals-focus-notes-training-context-10-10.md`
  - `app/my-library/page.tsx`
  - `app/my-library/training/page.tsx`
  - `components/my-library/training/TrainingContextHub.tsx`
  - `lib/training-context/server.ts`
- This slice is only for:
  - private athlete profile foundation in My Library,
  - server-canonical profile save/read,
  - local draft recovery,
  - export compatibility,
  - later-generator-ready profile contract.
- This slice is not for:
  - CSS / training metrics,
  - personal records,
  - broader training preferences,
  - generator/program implementation,
  - admin workflows,
  - public profile or sharing.

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

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                 | Evidence                                |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Product goals and IA                          | `target`     | Users can distinguish `Athlete profile` from `Goals`, `Focus`, and `Notes`, and can reach the profile hub from My Library in <=2 taps.                         | IA review + manual QA + e2e             |
| UX flow clarity                               | `target`     | Mobile and desktop users can open, edit, save, recover, and revisit athlete-profile fields with explicit `loading`, `empty`, `saved`, `error`, and `retry` UX. | manual QA + e2e                         |
| Visual design quality                         | `target`     | New profile UI fits the existing My Library visual language and avoids settings sprawl or unfinished form seams.                                               | screenshot review + manual QA           |
| Business logic correctness and data integrity | `target`     | Athlete profile is a separate canonical entity, raw stale `age` is not stored, and only owner-scoped valid profile fields are persisted.                       | unit tests + runtime validation         |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes private end-user My Library data, not admin/editor workflows.                                                                   | scope rationale only                    |
| Accessibility (a11y)                          | `target`     | Form controls, labels, helper text, save states, and validation feedback remain keyboard/touch accessible with correct semantics and focus order.              | Playwright + manual QA                  |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: additions must avoid obvious payload/render regressions on `/my-library` and `/my-library/profile`.                                           | build + code review                     |
| Data placement and sync boundaries            | `target`     | Saved athlete profile data is server-canonical; unsaved edits stay local-only and recoverable after refresh until saved or dismissed.                          | contract review + tests                 |
| Caching and invalidation strategy             | `target`     | My Library profile summary and profile page data refresh deterministically after save without stale summary text or counts.                                    | integration tests + invalidation review |
| Reliability and failure handling              | `target`     | Auth/session/validation/network failures fail clearly without dropping already saved data and without silently discarding current draft text.                  | negative-path tests + manual QA         |
| Security and authz                            | `target`     | Athlete profile reads/writes are owner-only; unauthenticated/unauthorized requests fail closed with `401/403`.                                                 | API negative-path tests                 |
| Privacy and compliance                        | `target`     | Athlete profile data is private by default, minimized to fields with clear training value, excluded from public routes, and not leaked in logs or analytics.   | scope review + tests + log review       |
| Content governance                            | `supporting` | Supporting only: user-owned athlete profile still needs ownership, timestamps, and explicit source-of-truth rules even though this is not editorial content.   | schema review                           |
| Admin workflow and editability                | `N/A`        | N/A because this slice does not change admin workflows or editorial labels/actions.                                                                            | scope rationale only                    |
| SEO and crawlability                          | `N/A`        | N/A because this is a private authenticated My Library surface with no public crawl/index intent.                                                              | scope rationale only                    |
| AI discoverability                            | `N/A`        | N/A because no public content-discovery or structured discoverability surface changes in this slice.                                                           | scope rationale only                    |
| Analytics and KPI observability               | `supporting` | Supporting only: profile-view and profile-save events should be measurable enough to evaluate real dogfooding use later.                                       | event review                            |
| Commerce and revenue ops                      | `N/A`        | N/A because pricing, entitlements, and bundle logic are explicitly out of scope for this foundation slice.                                                     | scope rationale only                    |
| Incident response and support operations      | `supporting` | Supporting only: recovery behavior for failed saves or missing profile rows should be easy to diagnose through logs and support guidance.                      | runbook/help review                     |
| Finance and reporting operations              | `N/A`        | N/A because there is no billing, reconciliation, or financial reporting impact in this private profile foundation slice.                                       | scope rationale only                    |
| i18n operational readiness                    | `supporting` | Supporting only: labels and age-band enumerations must remain localization-safe and not hardcode future locale assumptions.                                    | copy/schema review                      |
| Stack-fit and dependency discipline           | `target`     | Implementation uses existing Next.js/TypeScript/Supabase/test patterns with no unnecessary new dependencies.                                                   | dependency diff + code review           |
| Testing and QA automation                     | `target`     | Unit/integration/e2e coverage protects profile CRUD, authz, export inclusion, local-draft recovery, and invalid-field handling before merge.                   | tests + verify outputs                  |
| Scalability and cost efficiency               | `supporting` | Supporting only: one-row-per-user profile reads/writes should avoid wasteful query patterns or duplicated storage.                                             | schema/query review                     |
| DevOps and rollback readiness                 | `supporting` | Supporting only: migration rollout must be backward-compatible for users who have My Library data but no athlete-profile row yet.                              | migration + rollback notes              |

## Data Placement And Sync Contract (Required For Stateful Features)

- Server-canonical:
  - athlete profile row,
  - ownership,
  - canonical saved fields,
  - timestamps,
  - export serialization.
- Local-only:
  - unsaved form draft,
  - transient success/error banners,
  - transient expanded/collapsed UI state.
- Sync policy:
  - explicit save,
  - server response becomes source of truth,
  - unsaved local draft survives reload long enough for retry,
  - stale auth fails clearly and preserves draft text locally.
- Retention and sensitivity:
  - athlete profile is private user data,
  - no public route exposure,
  - no collection of unnecessary sensitive fields,
  - no raw mutable `age` field that silently drifts over time.
- Cache/invalidation:
  - My Library summary and profile hub refresh after successful save,
  - users without a profile row still get a deterministic empty state.

## Identity And Rename Contract (Required When Entities Are Persisted Or Linkable)

- Canonical stable ID:
  - `athlete_profile.id` is the canonical stable ID for the athlete profile entity.
- Human-readable identifiers:
  - `display_name`, `first_name`, and `last_name` are editable display fields only.
- Mutability rules:
  - `athlete_profile.id` is immutable,
  - display fields are editable,
  - `age_band` is editable,
  - later generator integrations must read canonical IDs and canonical fields, not mutable labels alone.
- Rename vs repurpose:
  - wording/name changes are in-place edits of the same athlete profile,
  - materially broader training data such as metrics or PRs must be separate rows/entities in later slices rather than stuffed into the profile row.
- Compatibility contract:
  - this profile foundation must stay compatible with later linking from `Goals`, `Focus`, `Notes`, training metrics, personal records, preferences, and generator prefills,
  - users with no profile row must still be fully supported.
- Observability and repair:
  - missing profile rows are treated as valid empty state, not corruption,
  - invalid saved field combinations fail deterministically instead of being silently coerced.

## Scope

- Add a private My Library `Athlete profile` foundation surface.
- Add a separate canonical athlete-profile entity for a signed-in user.
- Support first-phase fields with clear dogfooding value:
  - `display_name`
  - `first_name`
  - `last_name`
  - privacy-safe non-stale age representation, expected as `age_band`
- Keep this clearly separate from:
  - account/auth profile data,
  - `Goals`
  - `Focus`
  - `Notes`
- Add a My Library summary card that links into the athlete profile hub.
- Add a dedicated profile page/hub inside My Library.
- Support explicit save and deterministic reload.
- Support local draft recovery for unsaved edits.
- Include athlete profile in user export.
- Update Help/Guide if workflow copy changes in My Library.

## Out Of Scope

- Training metrics / CSS.
- Personal records.
- Training preferences.
- Session/program generator implementation.
- Goal/focus/profile deep-link generator prefills.
- Admin surfaces.
- Public profile/sharing.
- Pricing, entitlements, and packaging.

## Acceptance Criteria

1. A signed-in user can open `Athlete profile` from My Library.
2. The athlete profile surface is clearly separate from `Goals`, `Focus`, and `Notes`.
3. A user can create or update their athlete profile with the scoped phase-1 fields.
4. Saved profile data is server-canonical and survives refresh/device changes.
5. Unsaved profile edits remain local-only and recoverable enough to avoid obvious frustration after accidental refresh.
6. No raw mutable `age` field is stored in this slice.
7. Users without an athlete-profile row see a deterministic empty state and can create one without errors.
8. Unauthorized access to another user's athlete profile is not possible.
9. Export payload includes athlete profile data when present and remains valid when absent.
10. `npm run lint:briefs`, relevant tests, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- targeted unit tests for:
  - athlete profile validation,
  - empty-state loading,
  - route authz,
  - export payload shape
- targeted e2e for:
  - open/save/reload flow,
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

- Keep this slice narrow and genuinely usable now.
- Do not pull metrics, PRs, or broad preferences into the same merge.
- Keep `My Library` naming unchanged in this slice.
- Follow existing Next.js/Supabase/My Library patterns.
- Avoid collecting profile fields without clear training value.

## 10/10 Quality Bar (Required For User-Facing Work)

- The athlete profile hub must feel like a real private training tool, not a placeholder settings page.
- Empty, loading, saved, and error states must all be explicit.
- Draft recovery must protect against accidental refresh while editing.
- The page must read cleanly on phone first.
- Validation must be strict enough to preserve data quality without becoming annoying to use.
- Business logic must remain deterministic:
  - one profile per user,
  - no stale-age drift,
  - no cross-user leakage,
  - no silent save failure.

## Help/Guide And Operator Training Contract (Required For Workflow Changes)

- User-facing My Library workflow copy changes are in scope.
- Help/Guide content must explain that:
  - athlete profile is private,
  - it is separate from goals/focus/notes,
  - metrics/preferences come later.

## Checkpoint Log

- `2026-03-19`: Child brief created and moved to `in-progress` for the narrow athlete-profile foundation slice. Metrics, PRs, and preferences remain deferred to later child briefs.
- `2026-03-19 | in-progress | athlete-profile foundation implemented across canonical Supabase row, private My Library profile hub, local draft recovery, My Library summary card, export payload support, and analytics event names; targeted unit/typecheck/eslint checks and full verify:pre-pr passed green (81 passed, 219 skipped) after hardening the My Library athlete-profile e2e entry path | next: commit slice state, push branch, and open PR in Safari`
