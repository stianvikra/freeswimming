# Task Brief: My Library Personal Records Foundation (10/10)

## Metadata

- `id`: `2026-03-19-my-library-personal-records-foundation-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-03-19`
- `updated`: `2026-03-19`

## Goal

Users can maintain private, generator-ready personal swim records inside My Library with explicit event identity (`distance + stroke + course`), canonical time storage, and clear separation from `Athlete profile`, `Training metrics`, `Preferences`, `Goals`, `Focus`, and `Notes`.

## Why This Brief Exists

- The parent brief `docs/task-briefs/planned/2026-03-19-my-library-athlete-profile-training-metrics-and-preferences-10-10.md` defines the broader profile/metrics/preferences direction.
- Child slice 1 already shipped private athlete profile foundation on `main`.
- Child slice 2 already shipped private CSS + structured training preferences on `main`.
- The next highest-value move is now:
  - save trusted personal records for specific swim events,
  - keep them private and server-canonical,
  - make them usable for immediate personal swim tracking,
  - and keep them ready for later generator/program context without building generator automation now.
- The owner is actively swimming `5` sessions per week and wants to dogfood this directly in personal training before later generator work lands.

## Dependencies And Boundaries

- Parent direction:
  - `docs/task-briefs/planned/2026-03-19-my-library-athlete-profile-training-metrics-and-preferences-10-10.md`
- Already-shipped adjacent child slices:
  - `docs/task-briefs/done/2026-03-19-my-library-athlete-profile-foundation-10-10.md`
  - `docs/task-briefs/done/2026-03-19-my-library-training-metrics-and-preferences-foundation-10-10.md`
- Existing nearby private user-owned training surfaces that must stay separate but compatible:
  - `docs/task-briefs/done/2026-03-19-my-library-goals-focus-notes-training-context-10-10.md`
  - `app/my-library/page.tsx`
  - `app/my-library/profile/page.tsx`
  - `components/my-library/profile/AthleteProfileHub.tsx`
  - `lib/athlete-profile/server.ts`
  - `lib/user/export.ts`
- This slice is only for:
  - private personal-records foundation,
  - canonical event identity and time contract,
  - My Library/profile UX for create/edit/delete now,
  - export compatibility,
  - later generator-ready serialization.
- This slice is not for:
  - generator/program implementation,
  - wearable imports,
  - public sharing,
  - pricing or entitlements,
  - admin/operator workflows.

## Product Model

- `Athlete profile`
  - who the swimmer is.
- `Training metrics`
  - trusted current test values, such as `CSS`.
- `Preferences`
  - practical planning defaults such as pool length and weekly cadence.
- `Personal records`
  - best-known performances for explicit swim events.
  - phase 1 in this slice:
    - distance,
    - stroke,
    - course,
    - canonical time,
    - recorded date,
    - optional source note.

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
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Security and authz`
- `Privacy and compliance`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                       | Evidence                                |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Product goals and IA                          | `target`     | Users can distinguish `Personal records` from `Athlete profile`, `Training metrics`, `Preferences`, `Goals`, `Focus`, and `Notes` without duplicate data jobs.       | IA review + child-brief contract + e2e  |
| UX flow clarity                               | `target`     | Mobile and desktop users can create, edit, delete, and revisit private personal records with explicit `loading`, `empty`, `saved`, `error`, and `retry` states.      | manual QA + e2e                         |
| Visual design quality                         | `target`     | Personal-record UI fits the existing My Library visual language and avoids becoming a dense generic table/settings dump.                                             | screenshot review + manual QA           |
| Business logic correctness and data integrity | `target`     | Each record keeps deterministic event identity (`distance + stroke + course`) and canonical time storage, with no ambiguous duplicate-event writes or unit guessing. | unit tests + runtime validation         |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes private end-user My Library data, not admin/editor workflows.                                                                         | scope rationale only                    |
| Accessibility (a11y)                          | `target`     | Record forms, lists, edit actions, delete confirmation, and validation feedback remain keyboard/touch accessible with proper labels and focus recovery.              | Playwright + manual QA                  |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: additions must avoid obvious payload/render regressions on `/my-library` and `/my-library/profile`.                                                 | build + perf budgets + code review      |
| Data placement and sync boundaries            | `target`     | Saved personal records are server-canonical; unsaved record drafts stay local-only and recoverable enough for safe retry on phone/desktop.                           | contract review + tests                 |
| Caching and invalidation strategy             | `target`     | My Library summary and profile hub refresh deterministically after record create/update/delete without stale counts or stale event summaries.                        | integration tests + invalidation review |
| Reliability and failure handling              | `target`     | Invalid event/time payloads, auth failures, and duplicate-event conflicts fail clearly without silent coercion or silent data loss.                                  | negative-path tests + manual QA         |
| Security and authz                            | `target`     | Personal-record reads and writes are owner-only; unauthenticated or unauthorized record access fails closed with `401/403/404` as appropriate.                       | API negative-path tests                 |
| Privacy and compliance                        | `target`     | Personal records remain private by default, excluded from public routes, and not leaked through logs, errors, or analytics payloads.                                 | scope review + tests + log review       |
| Content governance                            | `supporting` | Supporting only: private record data still needs explicit ownership, timestamps, and current-state semantics even though it is not editorial content.                | schema/model review                     |
| Admin workflow and editability                | `N/A`        | N/A because no admin/operator workflow changes are introduced in this slice.                                                                                         | scope rationale only                    |
| SEO and crawlability                          | `N/A`        | N/A because this is a private authenticated My Library surface with no public crawl/index contract.                                                                  | scope rationale only                    |
| AI discoverability                            | `N/A`        | N/A because this slice prepares private generator-ready context, not public AI-discoverable content.                                                                 | scope rationale only                    |
| Analytics and KPI observability               | `supporting` | Supporting only: create/update/delete usage should be measurable enough to evaluate dogfooding and later generator-prefill value.                                    | analytics review                        |
| Commerce and revenue ops                      | `N/A`        | N/A because pricing, bundles, and entitlements are explicitly deferred.                                                                                              | scope rationale only                    |
| Incident response and support operations      | `supporting` | Supporting only: record save/delete failures should be diagnosable with privacy-safe logs and clear recovery copy.                                                   | runbook/help review                     |
| Finance and reporting operations              | `N/A`        | N/A because no billing, reconciliation, or financial reporting logic is introduced by private personal records.                                                      | scope rationale only                    |
| i18n operational readiness                    | `supporting` | Supporting only: stroke labels, course labels, and time helpers must remain locale-extensible for later multilingual product work.                                   | copy/schema review                      |
| Stack-fit and dependency discipline           | `target`     | Implementation uses existing Next.js/TypeScript/Supabase/test patterns with no unnecessary new dependencies.                                                         | dependency diff + code review           |
| Testing and QA automation                     | `target`     | Unit/integration/e2e coverage protects personal-record CRUD, time parsing/formatting, authz, export inclusion, and draft recovery before merge.                      | tests + verify outputs                  |
| Scalability and cost efficiency               | `supporting` | Supporting only: one current record row per user-event should avoid wasteful query patterns and remain cheap for later generator reads.                              | schema/query review                     |
| DevOps and rollback readiness                 | `supporting` | Supporting only: migration rollout must be backward-compatible for users who have athlete profile/CSS/preferences but no personal-record rows yet.                   | migration + rollback notes              |

## Data Placement And Sync Contract (Required For Stateful Features)

- Server-canonical:
  - personal-record rows,
  - event identity,
  - canonical time storage,
  - ownership,
  - timestamps,
  - export serialization.
- Local-only:
  - unsaved personal-record draft,
  - current edit-mode state,
  - transient success/error banners.
- Sync policy:
  - explicit save for create/update,
  - explicit delete for removal,
  - server response becomes source of truth,
  - unsaved draft survives reload long enough for retry,
  - stale auth fails clearly and preserves local unsaved input.
- Canonical time contract:
  - record time is stored canonically as centiseconds,
  - input UX may be swimmer-friendly (`ss.hh`, `m:ss.hh`, `h:mm:ss.hh`), but persisted value must stay deterministic.
- Event identity contract:
  - one current record per `user + distance + stroke + course`,
  - duplicate-event create/update conflicts must fail clearly instead of silently merging unrelated rows.

## Identity And Rename Contract (Required When Entities Are Persisted Or Linkable)

- Canonical stable ID:
  - `personal_record.id` is the canonical stable ID for each saved record row.
- Human-readable identifiers:
  - event labels (`100m freestyle · 25m pool`) are derived display copy only.
- Mutability rules:
  - IDs are immutable,
  - distance/stroke/course/time/date/source note are editable through explicit user actions,
  - later generator integrations must read canonical IDs and canonical fields, not mutable labels alone.
- Rename vs repurpose:
  - changing the saved time/date/note for the same event is an in-place update,
  - changing the event identity to a materially different record creates or targets a different row,
  - duplicate-event collisions must be resolved explicitly, not silently overwritten.
- Compatibility contract:
  - users with no personal-record rows still get deterministic empty states,
  - later generator-prefill slices must tolerate missing records gracefully.
- Observability and repair:
  - malformed time strings, unsupported strokes/courses, and duplicate-event conflicts surface deterministically instead of being silently coerced.

## Scope

- Add private My Library `Personal records` on top of the shipped athlete-profile + metrics/preferences foundation.
- Add a first-class `personal_records` entity with phase-1 support for:
  - distance in meters,
  - stroke,
  - course,
  - canonical stored time in centiseconds,
  - recorded date,
  - optional source note.
- Keep this clearly separate from:
  - athlete profile text fields,
  - CSS/training metrics,
  - training preferences,
  - `Goals`,
  - `Focus`,
  - `Notes`.
- Surface this inside My Library/profile in a phone-friendly way.
- Update the My Library summary card so the training-setup entry reflects whether personal records are present.
- Include personal records in user export.
- Keep the page generator-ready without building generator logic yet.

## Out Of Scope

- Generator/program implementation.
- Wearable or third-party imports.
- Public sharing.
- Pricing, subscriptions, or bundles.
- Admin/operator surfaces.

## Acceptance Criteria

1. A signed-in user can view, create, edit, and delete private `Personal records` from My Library/profile.
2. `Personal records` remain clearly separate from `Athlete profile`, `Training metrics`, `Preferences`, `Goals`, `Focus`, and `Notes`.
3. Each saved record has explicit canonical fields for distance, stroke, course, time, and recorded date.
4. Record time is stored canonically in centiseconds and formatted back into swimmer-friendly display without ambiguity.
5. Saved personal records are server-canonical and survive refresh/device changes.
6. Unsaved record edits remain local-only and recoverable enough to avoid obvious frustration after accidental refresh.
7. Users with no personal-record rows see a deterministic empty state and can create their first record without errors.
8. Duplicate-event conflicts fail clearly instead of silently overwriting another row.
9. Unauthorized access to another user's personal records is not possible.
10. Export payload includes personal records when present and remains valid when absent.
11. `npm run lint:briefs`, relevant tests, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- targeted unit tests for:
  - record time parsing/formatting,
  - event validation,
  - route authz and conflict handling,
  - export payload shape
- targeted e2e for:
  - create/edit/delete personal records,
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

- Keep this slice narrow and practically useful now.
- Do not pull generator logic into the same merge.
- Keep `My Library` naming unchanged.
- Follow existing Next.js/Supabase/My Library patterns.
- Avoid inventing ambiguous free-text event identity.

## 10/10 Quality Bar (Required For User-Facing Work)

- The personal-records surface must feel like a real private swim tool, not a placeholder list.
- Event identity must be explicit enough that later generator logic can trust it without guessing.
- Time input must be swimmer-friendly while canonical storage remains deterministic.
- Empty, loading, saved, conflict, and error states must all be explicit.
- Draft recovery must protect against accidental refresh while editing.
- Business logic must stay deterministic:
  - one current canonical row per user-event,
  - no cross-user leakage,
  - no silent duplicate-event merge,
  - no silent save failure.

## Help/Guide And Operator Training Contract (Required For Workflow Changes)

- User-facing My Library workflow copy changes are in scope.
- The My Library/profile surface must explain that:
  - personal records are private,
  - they stay separate from swimmer profile text, CSS, preferences, goals, focus, and notes,
  - later generator/program use comes later.
- Separate admin/operator docs are `N/A` because this slice is private end-user workflow only.

## Checkpoint Log

- `2026-03-19`: Child brief created and moved to `in-progress` for private personal-records foundation. Generator-prefill work stays deferred to a later child slice.
- `2026-03-19 | feat/my-library-personal-records-foundation | implemented private personal-record CRUD, canonical event identity/time storage, My Library/profile UX, export support, and automated coverage; local targeted tests, targeted e2e, and npm run verify:pre-pr are green | next: commit, push, open PR, and run npm run verify:pre-merge before merge; perf recommendation: hold for this non-perf slice despite tighten suggestion`
