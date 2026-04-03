# Task Brief: Production Admin Notes Remaining Work Umbrella (10/10)

## Metadata

- `id`: `2026-04-01-production-admin-notes-remaining-work-umbrella-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-01`
- `updated`: `2026-04-02`

## Goal

Use one umbrella brief to take every still-open production admin note from the `2026-04-01` live triage through implementation, explicit closure, or decision-grade disposition, without leaving orphan work behind.

## Why This Brief Exists

- Production admin notes were re-triaged live on `2026-04-01`.
- Starting point:
  - `32` notes were still open in production.
- Immediate cleanup already completed during triage:
  - `8` notes were closed as already shipped.
  - `1` obsolete note was deleted by owner request:
    - `ebbf4d26-2712-43e9-a96a-971e7d4425c3` `Swim sessions builder - Session Details`
- Remaining work after cleanup:
  - `23` notes still open across workout-builder UX, admin notes, My Library UI/copy, learner/course polish, brand rollout, non-admin cleanup, pricing strategy, and operator/process clarity.
- Since umbrella execution started, merged child slices have already reduced the live remainder:
  - PR `#337`: existing-note screenshots + quick-note calmness
  - PR `#338`: builder/my-library flow cleanup + workout-detail Quick note
  - PR `#339`: saved dryland/program detail-route Quick note expansion
- Several older briefs already mention parts of this remaining backlog, but the owner explicitly asked to take the rest "under one".
- This brief becomes the single planning/orchestration source of truth for the remaining production-note backlog.
- This brief does not authorize one giant implementation PR:
  - execution should happen in small vertical slices,
  - each slice should close a coherent subset of live notes,
  - each slice should still satisfy `verify:pre-pr`,
  - the umbrella closes only when all targeted production notes are explicitly disposed.

## Dependencies And Boundaries

- Existing execution/foundation briefs that remain authoritative for already-started code paths:
  - [2026-03-27-workout-builder-live-review-ux-and-actions-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-03-27-workout-builder-live-review-ux-and-actions-10-10.md)
  - [2026-03-21-admin-notes-workflow-v2-attachments-and-linking-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-03-21-admin-notes-workflow-v2-attachments-and-linking-10-10.md)
- Relevant completed lineage that should be consumed rather than re-solved:
  - [2026-03-31-admin-notes-multi-image-and-save-again-followup-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-31-admin-notes-multi-image-and-save-again-followup-10-10.md)
  - [2026-03-27-admin-notes-global-quick-capture-panel-and-manuscript-categories-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-27-admin-notes-global-quick-capture-panel-and-manuscript-categories-10-10.md)
  - [2026-03-26-course-content-live-review-and-learner-surface-polish-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-26-course-content-live-review-and-learner-surface-polish-10-10.md)
- Brand/logo rollout work should consume whatever canonical logo assets, typography choices, and helper primitives exist on `main` at implementation time instead of duplicating asset/token logic.
- This umbrella owns backlog coordination and note disposition for the remaining `23` live production notes.
- Existing child briefs may still be used as execution vehicles where that reduces churn, but they should reference this umbrella as the parent remainder owner until the corresponding notes are closed.
- Decision-oriented notes are still in scope:
  - if a note turns out to require a decision record or a small policy/doc slice rather than product code, that is acceptable,
  - but the note must still exit production admin notes with an explicit disposition.

## Live Triage Snapshot

Production admin notes were re-reviewed live on `2026-04-01`.

Already closed during triage as effectively shipped:

- `4f8cda7e-b8a9-4e14-976c-71964c239a5f` `Make collapsable`
- `fb290ab1-60f4-4840-8bca-14408d096b68` `Add note collapsable`
- `b5e46d29-d250-4b0d-b257-eec77a92b886` `Focuses`
- `ecf1940c-9709-4d97-b7d7-4b0a81faf741` `Remove paragraph`
- `29d53a01-9849-4a2a-9136-6eba58254e1c` `Turn a goal into todays work - remove?`
- `a4821b30-4078-4bb2-8466-26444b95e4ea` `How goals focus notes work together`
- `0d1fa716-460e-406a-a68d-28c1aaae5b22` `Mulitple Screenshots`
- `40b252d8-ee9f-41ed-89ca-0eb5af8bcc89` `Quick note`

Deleted during triage by explicit owner request:

- `ebbf4d26-2712-43e9-a96a-971e7d4425c3` `Swim sessions builder - Session Details`

Remaining open notes grouped for execution:

### Package A: Builder And Workout Flow

- `4197daee-8044-48c9-a5b8-fdb311fc900e` `Swim sessions builder - Details`
  - keep only `12,5m`, `25m`, and `50m` pool-size preset buttons.
- `2d2cb8af-b65b-48c0-8d7d-0e5d9cd58daf` `Swim session builder`
  - remove duplicated headings and extra explanatory copy from the workout/session builder detail route.
- `eb419b3f-e996-4af4-b21c-da0d14958882` `Missing note options`
  - enable `Quick note` and page-level admin-note access on workout-detail pages like `/my-library/workouts/[workoutId]`.
- `0655d28e-8fa8-4077-8d20-0bc34309671c` `Swim session builder`
  - tighten continue-vs-start-from-scratch copy and button labels.
- `a2151996-fe98-463b-9255-ebda6df44541` `My sessions`
  - rename `My Sessions` to `My Swim Sessions` and `Open` to `Edit`.
- `697c328a-5665-4cbc-8541-b850560c5b61` `Swim Session Builder`
  - place the AI session-generator entry under the swim-session-builder flow so My Library reads as one session workflow instead of two products.
- `9245eaba-e5fd-4bc2-83c1-2f53c7df100e` `Workout builder drill and kick taxonomy follow-up`
  - make drill/kick handling explicit enough in the session-authoring model and UI.
- `854d3f39-9275-4d80-a624-a687e47db320` `Workout builder notice placement and audience follow-up`
  - decide final notice placement and whether some notices should stay admin-only.
- `d76825bd-4b5c-4e7e-aa22-49e6c25350ba` `Saved workouts list density follow-up`
  - show the first `3` saved workouts by default, then reveal the rest through deterministic `load more`.

### Package B: Admin Notes System

- `85fb1d9f-efd9-4aa5-8bfe-7ab35c989b43` `Quick notes - Less is more`
  - remove low-value helper copy from quick-note surfaces.
- `24bc6866-1b4e-41b1-9e4f-ae803bf06ca3` `Quick Note`
  - simplify labels, helper text, and action copy on the security quick-note surface.
- `95f2361c-925d-42e3-a7e5-553410faec88` `Add screenshots to admin notes`
  - let operators attach image evidence to an already-saved note from the contextual notes panel instead of recreating the note.
- `881e222b-4c14-4a23-b677-60b0713e220f` `Admin notes quick capture route-surface expansion follow-up`
  - define where quick capture/page-notes should be available beyond the current launch surfaces.
- `204913d0-5c97-41e8-b6f7-ab42de3bc84e` `Admin notes attachment metadata and agent-readiness follow-up`
  - decide richer attachment metadata, context labeling, and agent-safe inspection/readiness.

### Package C: My Library, Login, And Freshness UX

- `3aa25b37-d7b4-4059-9a2f-05de2563f9f7` `Login Screen`
  - simplify sign-in copy and CTA labels.
- `2580d437-c1f3-47c4-80e9-70865a259d46` `New content`
  - make the new-content message collapsible and turn it into a calmer 10/10 UI.
- `99a18e5f-3b91-42d4-96d8-1d5f1343b05c` `Observations should have a date, also last edited.`
  - show observation dates and last-edited information.
- `3b7783ba-6a98-46f9-9259-909a1a90ac9e` `NEW CONTENT NOTIFICATION`
  - only show `NEW CONTENT` for content created after the user created their profile.

### Package D: Course And Brand Rollout

- `23a95fce-3589-4e5c-9efd-1830502df768` `Course menu and pass criteria`
  - add clearer default pass criteria and a distinct partial-complete state for course lessons.
- `947639ce-cc2e-4da3-aeb1-f0c11705ad41` `Website brand updates`
  - apply the new logo/symbol/slogan/brand system across applicable public site surfaces, poolside notes, and PDFs using canonical brand assets.

### Package E: Platform, Cleanup, And Commercial Follow-Ups

- `67e2ab65-5f56-475d-842d-459ad6b56c32` `Rettigheter`
  - resolve the permanent-permissions/process question as operator guidance or agent-working agreement rather than letting it linger as a product note.
- `f96e7d7c-3477-417d-b96f-f2c8f876e2ab` `Non-admin test data cleanup follow-up`
  - clean up non-admin QA/test artifacts and define the prevention rule for future leakage.
- `e27aae0e-0eb1-4830-8cde-daf8fe63a995` `Subscription prices - Thoughs`
  - turn pricing/offer thoughts into an explicit product-offer decision and only then implement any resulting copy or entitlement changes.

## Recommended Execution Order

1. `Package B: Admin Notes System`
   - highest leverage for the same note-taking workflow that is generating the backlog.
2. `Package A: Builder And Workout Flow`
   - largest concentration of operator-facing friction on actively used routes.
3. `Package C: My Library, Login, And Freshness UX`
   - compact UX and logic wins across core user routes.
4. `Package D: Course And Brand Rollout`
   - user-facing quality polish that should land after the core workflow cleanup is stable.
5. `Package E: Platform, Cleanup, And Commercial Follow-Ups`
   - includes process, cleanup, and strategy work that may produce smaller follow-up decisions.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this umbrella:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Security and authz`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                     | Evidence                                                    |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| Product goals and IA                          | `target`     | Every remaining live production note is assigned to one package, one intended route/job, and one final disposition with no orphan notes left at umbrella closeout. | this brief + child briefs + admin-note closeout log         |
| UX flow clarity                               | `target`     | Changed routes remove duplicate or low-value guidance, clarify the primary action in one scan, and avoid dead-end note/builder/login/content states.              | manual QA + targeted unit/e2e + copy review                 |
| Visual design quality                         | `target`     | Brand rollout, quick-note simplification, course partial-complete states, notices, and new-content UI feel intentional and consistent with the platform.           | screenshot review + preview QA                              |
| Business logic correctness and data integrity | `target`     | Attachment add-after-save, content freshness, observation timestamps, pass-criteria states, workout taxonomy, and pricing/offer decisions remain deterministic.    | unit tests + code review + targeted e2e + runtime guards    |
| Admin editor ergonomics                       | `target`     | Admin/operator flows for note capture, note evidence recovery, builder cleanup, and course/pass updates become faster with fewer reopen/recreate loops.            | timed manual QA + route-level workflow review               |
| Accessibility (a11y)                          | `supporting` | Supporting only: changed labels, collapsibles, notices, and status states remain keyboard/touch accessible with clear semantics.                                   | targeted e2e + code review                                  |
| Performance (CWV + payloads)                  | `target`     | Core changed public/core routes stay within practical baseline targets (`LCP <= 2.5s`, `CLS <= 0.10`, `INP <= 200ms`) or show no material regression if private. | `verify:pre-pr`/`verify:pre-merge` + perf budget evidence   |
| Data placement and sync boundaries            | `target`     | Each slice defines server-canonical vs local-only state for notes, content freshness, criteria/progress, timestamps, and offer data before implementation.         | umbrella + child brief contracts                            |
| Caching and invalidation strategy             | `target`     | Notes, builder lists/details, observations, course views, content-freshness surfaces, and offer/copy reads refresh deterministically after relevant writes.        | code review + targeted tests + manual QA                    |
| Reliability and failure handling              | `target`     | Save, retry, empty, and failure states remain explicit; changed protected or failure-mode paths do not introduce unexpected `500`s.                               | negative-path tests + e2e + manual QA                       |
| Security and authz                            | `target`     | Admin-note evidence flows stay admin-only, user-scoped freshness/pricing data stays scoped correctly, and changed protected paths fail closed with `401`/`403`.    | negative-path tests + authz review + protected-route checks |
| Privacy and compliance                        | `target`     | Screenshots/attachments, profile-created timestamps, and observation metadata do not leak into public or cross-user surfaces.                                      | code review + manual QA + targeted tests                    |
| Content governance                            | `target`     | Canonical brand assets, pass-criteria defaults, note-surface copy, and commercial offer language each have one source of truth before rollout.                    | brief decisions + code review + docs alignment              |
| Admin workflow and editability                | `target`     | Every admin-facing mutation touched here keeps a clear create/edit/attach/retry/close path without forcing operators into hidden alternate surfaces.               | workflow QA + targeted tests                                |
| SEO and crawlability                          | `supporting` | Supporting only: public branding/copy changes must preserve correct metadata, canonicals, and sitemap behavior where relevant.                                     | route QA + existing metadata/sitemap coverage               |
| AI discoverability                            | `supporting` | Supporting only: public brand/content changes should keep semantic structure and canonical public references stable for future AI-facing discoverability.           | markup review + scope rationale                             |
| Analytics and KPI observability               | `target`     | New-content freshness, note evidence recovery, and any changed commercial/user-entry flow remain measurable through existing events or explicit future-event notes.  | analytics review + logs + brief closeout notes              |
| Commerce and revenue ops                      | `target`     | If pricing or offer packaging changes ship under this umbrella, catalog, entitlement, and public pricing copy must agree everywhere they appear.                   | decision record + code review + QA                          |
| Incident response and support operations      | `target`     | Help/Guide and recovery/runbook docs explain changed note, builder, login, course, and pricing support paths in the same PRs that change behavior.                 | docs updates + automated help assertion where applicable    |
| Finance and reporting operations              | `target`     | Any shipped price or package change documents reporting/reconciliation impact, or explicitly records no-change rationale if the slice stays decision-only.          | decision brief notes + implementation QA                    |
| i18n operational readiness                    | `supporting` | Supporting only: copy cleanups and status labels must not hard-code structural logic that would block later locale rollout.                                        | code review + scope rationale                               |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next.js, Supabase, notes, builder, course, and branding primitives; avoid new dependencies unless they clearly improve quality.                     | dependency diff + architecture review                       |
| Testing and QA automation                     | `target`     | Each execution slice ships with targeted tests plus `npm run verify:pre-pr`; final umbrella closeout requires `npm run verify:pre-merge` and green required CI.    | child-PR evidence + CI + final merge gate                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no slice should introduce runaway attachment storage, query fan-out, or duplicated brand/render pipelines.                                        | code review + perf/storage review                           |
| DevOps and rollback readiness                 | `target`     | Brand, notes, content freshness, and commercial changes ship in rollback-safe slices with explicit follow-up ownership for anything deferred.                       | PR summaries + rollback notes + child brief closeouts       |

## Data Placement And Sync Contract

- Server-canonical:
  - `admin_notes` rows, note attachments, note-route context, and note completion state.
  - saved workouts/sessions and any persisted builder metadata.
  - learner-facing content publish timestamps, user/profile creation timestamps used for `NEW CONTENT`, observation records and edit timestamps, and course pass-criteria definitions/progress state.
  - pricing/offer configuration, public offer copy source, and entitlement-driving identifiers if commercial changes ship.
  - canonical brand assets, tokenized brand helpers, and shared PDF/poolside branding inputs stored in repo/runtime config.
- Local-only:
  - temporary draft text, panel collapse/expand state, inline view disclosures, local note-image staging before save, and transient notices.
  - non-persisted visual preferences or temporary builder/list state.
- Sync policy:
  - server mutations become authoritative only after successful server confirmation.
  - add-to-existing-note image uploads must target the canonical saved note ID and keep explicit retry/remove behavior on failure.
  - `NEW CONTENT` must derive from canonical content-publish time compared with canonical user-profile creation time, not one-off local heuristics.
  - observation `last edited` data should update only on successful save.
  - course partial/full completion should derive from explicit pass-criteria state rather than presentation-only shortcuts.
  - pricing/offer changes must come from one decision/config path instead of diverging copy or hard-coded labels.
- Retention and sensitivity:
  - note attachments remain admin-only and follow existing attachment lifecycle controls.
  - profile-created timestamps and observation metadata remain user-scoped.
  - pricing/offer work must not introduce secret handling into content files.
- Cache/invalidation:
  - note panels, workout routes, My Library cards/banners, course lesson/menu surfaces, and commercial copy reads must invalidate deterministically after relevant writes.

## Identity And Rename Contract

- Canonical stable IDs:
  - `admin_note.id` and `admin_note_attachment.id` remain the canonical note/evidence identities.
  - `workout.id` remains the canonical saved session/workout identity.
  - course lesson/module/runtime IDs remain the canonical course identities.
  - content item IDs plus canonical publish timestamps remain the source for freshness logic.
  - offer/plan/price IDs remain the canonical commercial identifiers if pricing changes ship.
- Human-readable identifiers:
  - note titles, quick-note labels, builder headings, course status labels, slogans, plan display names, and button copy are editable display text only.
  - brand asset filenames are deployment artifacts, not product identities; shared brand helpers/tokens should own references where possible.
- Mutability rules:
  - copy and labels may be edited in place.
  - canonical entity IDs stay stable.
  - if an offer changes materially, create a new offer/price identity instead of silently repurposing an existing paid entitlement identifier.
- Rename vs repurpose policy:
  - workout/session/course/note copy cleanups are in-place edits when the underlying object is the same entity.
  - materially different commercial packages or content objects should become new entities rather than repurposed legacy ones.
  - route-surface expansion for notes should key off explicit page context rules, not fragile route-title text.
- Compatibility contract:
  - existing notes, workouts, lessons, and content items remain valid as labels/copy/UI surfaces improve.
  - old content should not become `NEW CONTENT` unless the canonical freshness rule says it should.
  - legacy brand asset references may remain temporarily only where they do not conflict with the new canonical brand system.
- Observability and repair:
  - failed attachment uploads, stale freshness badges, pass-criteria state mismatches, or price-label mismatches should be detectable through tests, logs, or explicit operator QA.

## Scope

- Maintain one umbrella brief for the remaining `23` live production notes from the `2026-04-01` triage.
- Implement the open notes through small execution slices and close the corresponding production notes as each slice lands.
- Unify builder/workout, admin-notes, My Library, course, brand, cleanup, and pricing follow-ups under one disposition map.
- Update Help/Guide, runbooks, and operator-facing guidance in the same PR whenever changed workflows, labels, or recovery behavior require it.
- Convert process/strategy notes into explicit operator guidance or decision records where product code is not the right output.

## Out Of Scope

- One monolithic PR that mixes unrelated route changes just because they share this umbrella.
- Reopening the already-closed `8` notes unless a real regression is found.
- Restoring the deleted `ebbf4d26-2712-43e9-a96a-971e7d4425c3` note.
- Removing existing manual `Swim session builder` authoring fields/input boxes through interpretation of adjacent copy, IA, taxonomy, or notice notes.
- Broad redesign outside the routes and systems directly referenced by the remaining production notes.
- Hidden schema or dependency churn without a child slice that justifies it explicitly.

## Acceptance Criteria

1. Every still-open production note listed in this brief is assigned to one package and later exits with one explicit disposition:
   - implemented and closed,
   - intentionally closed with decision/doc rationale,
   - or split into a narrower follow-up brief with owner and next step.
2. Builder/workout surfaces ship the requested pool-size, copy, action-label, note-surface, notice, taxonomy, and density improvements without regressing canonical workout/session behavior.
3. Admin-note surfaces ship calmer quick-note copy, add-to-existing-note image evidence support where intended, and a clear route-surface/attachment-metadata contract.
4. My Library/login/freshness surfaces ship the requested simplifications, timestamp visibility, and deterministic `NEW CONTENT` logic.
5. Course pass criteria and partial/full completion visuals ship with explicit defaults and truthful learner-state semantics.
6. Brand rollout uses canonical logo/symbol/slogan assets across the targeted public, PDF, and poolside surfaces instead of ad hoc logo copies.
7. Process/cleanup/commercial notes do not linger as ambiguous product asks:
   - each becomes implemented, documented, or explicitly re-scoped through a decision-grade child slice.
8. As each slice lands, the corresponding live production note IDs are marked done or otherwise disposed in production admin notes.
9. `npm run lint:briefs` passes for brief changes; each implementation slice passes targeted validation plus `npm run verify:pre-pr`; final umbrella closeout requires `npm run verify:pre-merge`.

## Validation

- planning / brief maintenance:
  - `npm run lint:briefs`
- common implementation gates per slice:
  - `npm run lint`
  - `npm run typecheck`
  - relevant targeted `vitest`
  - relevant targeted `playwright`
  - `npm run verify:pre-pr`
- recommended targeted e2e coverage depending on slice:
  - `tests/e2e/admin-contextual-notes.spec.ts`
  - `tests/e2e/admin-help-center.spec.ts`
  - `tests/e2e/admin-notes-workflow.spec.ts`
  - `tests/e2e/auth-sign-in-ux.spec.ts`
  - `tests/e2e/course-pass-criteria-visibility.spec.ts`
  - `tests/e2e/course-progress-sync.spec.ts`
  - `tests/e2e/my-library-generator-intake.spec.ts`
  - `tests/e2e/my-library-new-content-notice.spec.ts`
  - `tests/e2e/my-library-workout-builder.spec.ts`
- recommended targeted unit coverage depending on slice:
  - `tests/unit/admin-note-compose.test.ts`
  - `tests/unit/admin-note-quick-capture-launcher.test.tsx`
  - `tests/unit/admin-notes-manager.test.ts`
  - `tests/unit/page-note-context.test.ts`
  - `tests/unit/create-manual-workout-button.test.tsx`
  - `tests/unit/library-item-actions.test.ts`
  - `tests/unit/my-library-new-content-notice.test.ts`
  - `tests/unit/my-library-new-content-notice-component.test.tsx`
  - `tests/unit/session-generator-panel.test.tsx`
  - `tests/unit/workout-builder-hub.test.tsx`
  - `tests/unit/course-progress.test.ts`
  - `tests/unit/course-workspace.test.ts`
- before final merge recommendation:
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library`
  - `http://127.0.0.1:3000/my-library/workouts`
  - `http://127.0.0.1:3000/my-library/security`
  - `http://127.0.0.1:3000/sign-in`
  - `http://127.0.0.1:3000/course`
  - `http://127.0.0.1:3000/admin`
- Preview:
  - PR Vercel preview URL for each child slice before merge
- Recommended matrix:
  - desktop Chromium
  - desktop Safari/WebKit
  - iPhone Safari-width viewport
  - tablet viewport for dense My Library/course states

## Constraints

- Keep this as one umbrella brief but many small implementation slices.
- Do not let brand or pricing work accidentally outrank broken operator workflows unless explicitly reprioritized.
- Preserve existing canonical data models unless a child slice makes the needed contract explicit.
- Do not remove manual `Swim session builder` form fields or input boxes unless the owner makes a new explicit decision in a dedicated note/brief.
- The deleted `ebbf4d26-2712-43e9-a96a-971e7d4425c3` ask must not be reintroduced indirectly through builder-copy, taxonomy, or IA follow-ups.
- Do not expand quick-capture route coverage blindly:
  - route-noise, authz, and contextual-panel overlap must be decided deliberately.
- Do not ship pricing or commercial copy changes without one explicit source of truth for what is free vs paid.

## 10/10 Quality Bar

- The owner should be able to look at the remaining-note backlog and understand exactly where each ask belongs.
- Changed routes must feel clearer and lighter, not just shorter.
- Required changed-state coverage across slices:
  - `loading`
  - `empty`
  - `error`
  - `retry`
  - `success`
  - `partial complete` where lesson criteria now support it
  - `no image yet` / `image attached` / `upload failed` where admin-note evidence flows change
- Builder and admin-note improvements must reduce operator friction, not add another layer of explanation.
- Brand rollout must increase consistency across web and exported artifacts, not create two competing brand systems.
- Content freshness, timestamps, pass criteria, and pricing decisions must be truthful to canonical data, never cosmetic-only approximations.

## Help/Guide And Operator Training Contract

- Required for any child slice that changes:
  - labels,
  - workflow steps,
  - support/recovery behavior,
  - admin-note evidence handling,
  - course completion semantics,
  - sign-in guidance,
  - pricing/offer explanations.
- Each such slice must:
  - update relevant Help/Guide copy in the same PR,
  - update runbook references when recovery/ops behavior changes,
  - update at least one automated assertion when the help contract changed,
  - record the docs alignment in child-brief closeout.

## Security, Privacy, and Compliance

- Admin-note creation, editing, and attachment flows must remain admin-only and fail closed on unauthorized access.
- User-specific freshness signals, timestamps, and observations must stay scoped to the right user and must not leak across surfaces.
- Brand/public-copy rollout must not expose internal asset paths, notes data, or private admin context.
- Pricing/offer work must not store secrets or raw billing tokens in repo content or logs.
- Changed auth, admin, or access-control paths require negative-path coverage.

## Observability And KPI Contract

- Useful future events/logs where hooks exist:
  - note attachment added to an existing note,
  - note upload retry/remove after save,
  - `NEW CONTENT` item count before and after freshness filtering,
  - pass-criteria partial-vs-full completion transitions,
  - builder continue-vs-start-new usage,
  - pricing/offer selection or CTA impressions if commercial UI changes ship.
- Minimum operational expectations:
  - no unexpected `500` on covered changed routes,
  - deterministic refresh after note/content/progress mutations,
  - supportable operator recovery when note-image upload or course state looks wrong.
- Success KPI for this umbrella:
  - by closeout, every currently remaining production note is either shipped, intentionally closed with rationale, or moved into a narrower explicit follow-up with owner and next step.

## Session Continuity And Recovery

- Canonical source of truth:
  - git branch
  - this brief path
- Checkpoint cadence:
  - update this umbrella and the active child brief after each meaningful planning or implementation milestone.
  - once code work starts, record latest validated commit hash in the active child slice.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this umbrella brief and the active child brief, then continue from the latest checkpoint

## Git Rhythm Defaults

- Commit + push after each validated child slice step.
- Open or refresh PR after one coherent vertical slice or after `2-4` validated checkpoint commits, whichever comes first.
- Keep unrelated package work out of the same commit unless it is truly shared infrastructure.

## Automation Mode

- `automation-first`
  - assistant handles implementation, tests, git checkpoints, push, PR open/update, and CI monitoring unless blocked by credentials, UI-only approval, or an explicit owner decision.
- Expected assistant-owned commands for each child slice:
  - `npm run lint:briefs`
  - relevant targeted tests
  - `npm run verify:pre-pr`
  - before merge recommendation: `npm run verify:pre-merge`

## Branch Hygiene Defaults

- Prefer one branch per coherent child slice even though this umbrella tracks the whole remainder.
- Post-merge cleanup:
  - `git checkout main`
  - `git pull --ff-only origin main`
  - `git branch -d <merged-branch>`
  - `git push origin --delete <merged-branch>` when appropriate
  - `git fetch --prune origin`

## PR Browser Rule

- Default PR create/review/merge links open in Safari.

## Manual QA URL Rule

- For future manual QA steps on child slices, open the exact local or preview URL in Safari before asking the owner to validate it.

## Checkpoint Log

- `2026-04-03 | working tree | login-screen child slice for note 3aa25b37 now has the shorter /auth/sign-in copy and CTA contract in place, with targeted auth tests, npm run typecheck, and full npm run verify:pre-pr green on branch feat/login-screen-copy-cleanup-2026-04-03 | next: commit/push/open the PR and take it through CI + pre-merge`
- `2026-04-03 | working tree | started the next umbrella child slice on branch feat/login-screen-copy-cleanup-2026-04-03 for admin note 3aa25b37, scoped to simplifying /auth/sign-in copy and CTA labels without changing auth mechanics | next: land the tighter sign-in copy, update auth UX tests, and run targeted validation + verify:pre-pr`
- `2026-04-02 | e6c9ef8 | PR #339 merged the saved dryland/program detail-route Quick note expansion on main; Package B is now narrowed to the remaining contextual note reference/related-note parity needed to close the attachment-metadata + agent-readiness follow-up cleanly | next: start a final Package B child slice for contextual note reference/open-in-notes/related-note parity and move the route-expansion brief to done`
- `2026-04-02 | 2008230 | PR #338 merged the builder/my-library flow slice on main after PR #337 had already landed the existing-note images + quick-note calmness slice; remaining admin-notes system work is now narrowed to route-surface expansion plus later metadata/agent-readiness decisions | next: execute the detail-route expansion child slice for saved dryland/program routes`
- `2026-04-02 | feat/swim-session-builder-flow-cleanup-2026-04-02 | child execution started under the umbrella through the builder/my-library slice covering swim-session flow consolidation, My Swim Sessions naming, Edit labels, reduced pool-length presets, calmer detail-route copy, and workout-detail Quick note route support without removing any manual builder input fields; targeted vitest + targeted desktop-chromium playwright are green, with the new workout-detail admin-notes e2e currently environment-skipped on write readiness | next: run npm run verify:pre-pr for this slice, then commit/push/open PR and keep the umbrella in-progress`
- `2026-04-01 | working tree | re-triaged live production admin notes, closed 8 already-shipped notes, deleted 1 obsolete note by owner request, and created one umbrella brief for the remaining 23-note backlog | next: keep this planned until the first child execution slice is chosen`

## Completion Record

- `PR`: `TBD`
- `merge`: `TBD`
- `result`: `TBD`

## Merge Handoff

- `merge_url`: `TBD`
- `merge_when`:
  - all required checks are green,
  - local manual QA is done,
  - preview QA is done,
  - all targeted production notes in scope have explicit dispositions.
- `assistant_rule`:
  - do not recommend umbrella closeout until the remaining production-note count for this brief is effectively zero or every residual item has a narrower explicit owner.
