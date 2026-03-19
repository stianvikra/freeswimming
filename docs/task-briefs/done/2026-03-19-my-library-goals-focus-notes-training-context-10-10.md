# Task Brief: My Library Goals, Focus, And Notes Training Context (10/10)

## Metadata

- `id`: `2026-03-19-my-library-goals-focus-notes-training-context-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-03-19`
- `updated`: `2026-03-19`

## Goal

Users can capture long-term swim goals, one active short-term focus, and structured notes (`Observation` / `Question`) as three separate but linkable training tools inside My Library, with the model ready for later session-generator prefills.

## Why This Brief Exists

- `Goals` already exists and is useful as a longer-term destination layer, but it is not the same as a day-to-day training focus or note-taking flow.
- Real swim practice creates a different kind of value:
  - a user notices something in the pool,
  - wants to capture it quickly on the phone,
  - wants to keep one clear active focus for the next session,
  - and may later want to turn a goal or focus into session/program generator input.
- The best first move is not to price or bundle this now.
- The correct 10/10 move is:
  - preserve `Goals` as a separate concept,
  - introduce `Focus` as its own active training object,
  - introduce `Notes` as a separate capture layer with `Observation` and `Question`,
  - make all three relationship-ready for later lesson/drill/session/program connections.
- `Goals`, `Focus`, and `Notes` are not variations of the same object:
  - `Goal` = where the swimmer wants to go over time,
  - `Focus` = what the swimmer is training on now,
  - `Note` = what the swimmer noticed or wants to check later.

## Dependencies And Boundaries

- Existing scope that must be respected:
  - `app/my-library/goals/page.tsx`
  - `lib/goals/mvp.ts`
- Nearby future work that this must stay compatible with:
  - `docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`
  - `docs/task-briefs/planned/2026-02-28-workout-data-contract-and-step-engine-10-10.md`
  - any later session-generator / AI plan generation slice
- This brief is for user-owned training context in My Library.
- It is not an admin-notes extension and must not be mixed with admin editorial notes.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Security and authz`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                    | Evidence                               |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Product goals and IA                          | `target`     | Users can distinguish `Goals`, `Focus`, and `Notes` without ambiguity, and each surface answers a different user job in <=2 taps from My Library. | IA review + manual QA + e2e            |
| UX flow clarity                               | `target`     | Mobile-first capture of `Observation` / `Question` and active-focus updates has no dead ends and supports `loading`, `empty`, `error`, `retry`.   | UX review + e2e                        |
| Visual design quality                         | `target`     | New My Library surfaces match the platform visual language and remain calm, lightweight, and readable on phone.                                   | screenshot review + manual QA          |
| Business logic correctness and data integrity | `target`     | `Goals`, `Focus`, and `Notes` remain distinct entities; only one active focus exists at a time; invalid note/status transitions are blocked.      | unit tests + runtime guards            |
| Admin editor ergonomics                       | `N/A`        | N/A for this user-owned My Library slice; no admin workflow or editorial operator surface is changed.                                             | scope rationale only                   |
| Accessibility (a11y)                          | `target`     | Capture forms, status controls, filters, and linked context affordances remain keyboard/touch accessible with correct labels and focus behavior.  | Playwright + manual QA                 |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: My Library additions must avoid obvious route payload/render regressions on mobile.                                              | build + perf budgets + code review     |
| Data placement and sync boundaries            | `target`     | Saved `Goals`, `Focus`, and `Notes` are server-canonical; drafts and unsaved input are clearly local-only and recoverable.                        | brief contract + code review + tests   |
| Caching and invalidation strategy             | `target`     | Newly created/updated items appear predictably after save and linked context chips/counts refresh deterministically.                              | e2e + cache/invalidation review        |
| Reliability and failure handling              | `target`     | Expected failures (offline, expired auth, validation errors) produce deterministic non-500 UX and do not silently drop saved data.                | negative-path tests + manual QA        |
| Security and authz                            | `target`     | User-owned training context is scoped to the authenticated owner; unauthorized reads/writes fail closed.                                          | API negative-path tests                |
| Privacy and compliance                        | `target`     | Personal swim notes/focus entries do not leak into logs, public routes, or other user contexts.                                                   | log review + test assertions           |
| Content governance                            | `supporting` | Supporting only: user-owned training context must still have ownership, timestamps, and deterministic status handling.                            | schema + tests                         |
| Admin workflow and editability                | `N/A`        | N/A for this slice because the workflow is end-user My Library training context, not admin content editing.                                       | scope rationale only                   |
| SEO and crawlability                          | `N/A`        | N/A because this slice is authenticated/private My Library functionality with no public indexable route contract.                                 | scope rationale only                   |
| AI discoverability                            | `N/A`        | N/A for phase 1 because no public AI-facing content or structured discoverability surface changes here.                                           | scope rationale only                   |
| Analytics and KPI observability               | `supporting` | Supporting only: capture/create/resolve/use events should be measurable enough to evaluate later pricing and bundling decisions.                  | event contract + product metrics notes |
| Commerce and revenue ops                      | `N/A`        | N/A for phase 1 because pricing, entitlement, and bundle logic are explicitly out of scope until value is proven through use.                     | scope rationale only                   |
| Incident response and support operations      | `supporting` | Supporting only: support/runbook notes should explain how to diagnose missing saves, auth failures, or stuck active-focus state.                  | Help/Guide or runbook update           |
| Finance and reporting operations              | `N/A`        | N/A for phase 1 because there is no billing/reporting/reconciliation impact until these capabilities become paid products or bundles.             | scope rationale only                   |
| i18n operational readiness                    | `supporting` | Supporting only: labels/types/statuses must stay string-based and localization-safe for future multilingual rollout.                              | copy review + schema review            |
| Stack-fit and dependency discipline           | `target`     | Use the existing Next.js/TypeScript/Supabase/test stack with no unnecessary dependency additions.                                                 | dependency diff + code review          |
| Testing and QA automation                     | `target`     | Unit/e2e/negative-path coverage protects distinct models, active-focus rules, note-type status rules, and save/retry behavior.                    | tests + CI/local gates                 |
| Scalability and cost efficiency               | `supporting` | Supporting only: data model and queries should scale to many personal notes without introducing obvious cost-heavy patterns.                      | schema/query review                    |
| DevOps and rollback readiness                 | `supporting` | Supporting only: any schema change must be rollback-safe and deployment must tolerate users with pre-existing `Goals` but no `Focus`/`Notes`.     | migration + rollback notes             |

## Data Placement And Sync Contract (Required For Stateful Features)

- Server-canonical data:
  - `goals` rows remain canonical for long-term user goals,
  - new `focus` rows (or equivalent canonical focus entity) remain server-canonical,
  - new user-owned `notes` rows remain server-canonical,
  - ownership, status, links, timestamps, and answer/action fields remain canonical on the server,
  - linked relations between `goal`, `focus`, `note`, and training context remain canonical on the server.
- Local data:
  - draft note/focus input before explicit save,
  - temporary filters, sort, and current expanded/collapsed UI state,
  - optional short-lived offline retry buffer only if explicitly implemented.
- Sync policy:
  - explicit save for create/update,
  - server response becomes source of truth,
  - if auth/session is stale, fail clearly and preserve unsaved text locally long enough for retry,
  - linked context chips/counts refresh after successful write.
- Retention and sensitivity:
  - notes/focus are personal training reflections and must be treated as private user data,
  - soft-close/archival rules must preserve history unless explicit deletion is requested.
- Cache/invalidation:
  - My Library routes and any linked goal/focus/note summaries refresh deterministically after mutation,
  - no stale active-focus banner after successful focus change.

## Identity And Rename Contract (Required When Entities Are Persisted Or Linkable)

- Canonical stable IDs:
  - `goal.id` remains canonical for goals,
  - `focus.id` remains canonical for focus entries,
  - `note.id` remains canonical for notes.
- Human-readable identifiers:
  - titles/labels/body text are editable and not routing-critical,
  - note `type` and `status` are semantic/stateful fields, not display-only hints.
- Mutability rules:
  - IDs are immutable,
  - note text, answer text, labels, and status are editable within allowed transitions,
  - linked context refs are editable only through explicit user action,
  - `Focus` status is write-controlled and must follow explicit transition rules rather than silent replacement.
- Rename vs repurpose policy:
  - users may edit the wording of the same goal/focus/note in place,
  - materially different training concerns should create a new note/focus instead of overwriting history.
- Compatibility contract:
  - phase 1 must be relationship-ready for later linking to lessons, drills, guide sessions, future workout sessions, and future generated programs,
  - but generator/program automation is explicitly deferred to later work.
- Observability and repair:
  - unresolved linked context should surface as safe “context unavailable” state instead of silent breakage,
  - later generator-prefill integrations must tolerate notes/focus entries that have no linked lesson/workout target.

## Scope

- Extend My Library training-context model so users have three separate concepts:
  - `Goals`
  - `Focus`
  - `Notes`
- Preserve `Goals` as an existing separate hub.
- Add first-class `Focus` as its own concept:
  - short-term,
  - user-owned,
  - action-oriented,
  - typically one active focus at a time.
- Define `Focus` state model in phase 1:
  - `active`
  - `completed`
  - `archived`
- Require explicit handling when a new focus replaces the currently active focus:
  - no silent overwrite of the prior active focus,
  - prior focus must be explicitly completed or archived by the flow.
- Add first-class `Notes` as a separate concept:
  - `Observation`
  - `Question`
- `Notes` are user-authored reflections, not coach/admin notes and not AI responses.
- Define note statuses:
  - `Observation`: `open`, `actioned`, `no_action_needed`
  - `Question`: `unanswered`, `answered`, `no_answer_needed`
- Include user-authored `answer` field for `Question`.
- Allow optional relationships between the three user-owned entities:
  - a `Focus` may optionally reference the `Goal` it supports,
  - a `Note` may optionally reference a related `Goal` and/or current `Focus`,
  - a `Focus` may optionally be promoted from a `Note` without destroying note history.
- Allow optional relationships from `Goal`, `Focus`, and `Note` to nearby training context:
  - lesson
  - drill
  - guide session
  - module
  - future workout/session/program ids
- Define later generator-prefill contract:
  - session generator may later prefill from open goals and active focus,
  - goal/focus surfaces may later deep-link into generator with prefilled context.
- Keep phase 1 user-focused and ready for heavy personal use on phone during swim week.

## Out Of Scope

- Pricing, bundles, entitlements, and subscriptions.
- Program-builder or session-generator implementation.
- Auto-generating sessions/programs from goals/focus in phase 1.
- Coach/AI answer generation for questions.
- Admin notes/editorial workflow changes.
- Public marketing positioning for these features.

## Acceptance Criteria

1. `Goals`, `Focus`, and `Notes` are clearly separate user-facing concepts with distinct jobs-to-be-done.
2. A user can maintain one active focus without confusing it with longer-term goals or freeform notes.
3. A user can quickly create a note on phone as either:
   - `Observation`
   - `Question`
4. `Observation` supports statuses:
   - `Open`
   - `Actioned`
   - `No action needed`
5. `Question` supports statuses:
   - `Unanswered`
   - `Answered`
   - `No answer needed`
6. `Question` cannot be marked `Answered` without answer content.
7. `Focus` supports statuses:
   - `Active`
   - `Completed`
   - `Archived`
8. Only one `Focus` can be `Active` per user at a time, and replacing it requires an explicit completion/archive decision for the current active focus.
9. Saved content is server-canonical and survives refresh/device changes.
10. Unsaved draft state is clearly local and recoverable enough to avoid obvious data-loss frustration on mobile.
11. Data model is ready for later generator/session/program linking without requiring a breaking redesign.
12. Session-generator integration is explicitly deferred, but the phase-1 contract already supports:

- choosing open goals / active focus later inside generator,
- deep-linking from goal/focus later into generator with prefilled context.

13. `npm run lint:briefs`, relevant tests, and `npm run verify:pre-pr` must pass before PR update when implementation starts.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- targeted unit tests for:
  - note type/status transitions,
  - active-focus exclusivity,
  - linked-context normalization,
  - answer-required rules for questions
- targeted e2e for:
  - phone-first capture,
  - create/edit/resolve flow,
  - save/retry/failure UX,
  - goal/focus/note distinction
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library`
  - `http://127.0.0.1:3000/my-library/goals`
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

- Mobile-first capture speed matters more than adding many note types up front.
- Keep the model simple in phase 1:
  - `Observation`
  - `Question`
- Keep `Focus` separate from `Goals`.
- Keep `Focus` separate from `Notes`.
- Do not force generator/program integration now.
- Avoid overfitting to pricing before personal-use value is proven.

## 10/10 Quality Bar (Required For User-Facing Work)

- `Goals`, `Focus`, and `Notes` must feel like three separate mental models, not one blurred dashboard.
- Creating a note or updating focus on phone should be fast enough to use during or right after a pool session.
- Required UI states on changed surfaces:
  - `loading`
  - `empty`
  - `error`
  - `offline`
  - `retry`
- Accessibility:
  - large touch targets,
  - visible focus,
  - plain-language labels,
  - clear status chips,
  - no gesture-only critical action.
- Performance:
  - My Library route should remain lightweight enough for quick open/check/capture cycles.
- Business-logic correctness:
  - deterministic status transitions,
  - one active focus at a time,
  - explicit active-focus replacement path,
  - no silent overwrite of saved note/focus data,
  - no impossible “answered without answer” state.

## 10/10 Cross-Cut Categories (Apply When Relevant)

- Content governance and source-of-truth
  - user-owned training context has owner id, timestamps, and deterministic mutation rules.
- Identity and rename safety
  - stable IDs; editable wording without breaking links/history.
- Taxonomy and category management
  - note type + status taxonomy stays intentionally minimal in phase 1.
- Workflow and publishing safety
  - N/A for public publishing; equivalent safety here is clear save/resolve/archive behavior for personal records.
- Business logic correctness and data integrity
  - distinct entities, valid transitions, active-focus exclusivity, and safe linked-context handling.
- RBAC and auditability
  - authenticated-owner-only access; auditability proportional to user-owned sensitive data.
- UX/UI quality contract
  - fast capture, clear distinction of surfaces, visible next action.
- Admin editor ergonomics
  - N/A for phase 1 because no admin workflow changes.
- Performance contract
  - no obvious My Library regression.
- Data placement and sync boundaries
  - server-canonical saved data, local-only drafts.
- Caching and invalidation strategy
  - deterministic refresh after writes.
- Testing contract
  - unit + e2e + negative-path auth coverage.
- Observability and KPI tracking
  - enough instrumentation to learn whether users actually create/use/resolve notes and focus.
- Incident response and support operations
  - basic troubleshooting path for missing saves, stale auth, or broken active-focus state.
- Finance and reporting operations
  - N/A in phase 1 because there is no monetization/reporting logic in scope.
- i18n operational readiness
  - note/focus labels and statuses remain localization-safe.
- Stack-fit and dependency discipline
  - use current stack and patterns.
- Scalability and cost efficiency
  - avoid note models or query patterns that become expensive as personal history grows.
- Migration and rollback readiness
  - schema rollout must not disrupt existing goals data.
- Definition of done quant targets
  - all target categories `>=4/5`; critical target categories `5/5` for 10/10 claim.
- Help/Guide and operator training documentation
  - user-facing Help/Guide copy must explain the difference between goals, focus, and notes, or explicit `N/A` rationale if no surfaced Help exists yet.

## Help/Guide And Operator Training Contract (Required For Workflow Changes)

- Required in same PR when implementation starts:
  - explain what `Goals` are for,
  - explain what `Focus` is for,
  - explain `Observation` vs `Question`,
  - explain `No action needed` and `No answer needed`,
  - explain that generator/session prefills are future work, not current behavior.

## Risks And Mitigations

- Risk: users confuse focus with goals.
  - Mitigation: separate IA, separate labels, one-active-focus rule, different empty-state copy.
- Risk: users confuse focus with notes.
  - Mitigation: separate creation entry points, distinct status models, and explicit copy that focus is "what I am training on now" while notes are "what I noticed / want to check."
- Risk: note system gets too complex too early.
  - Mitigation: phase 1 supports only `Observation` and `Question`.
- Risk: later generator integration forces redesign.
  - Mitigation: define optional linked-context contract now without building generator behavior yet.
- Risk: mobile note capture feels slow and gets ignored.
  - Mitigation: optimize for short create flow first and defer richer categorization.
- Risk: answered/actioned statuses become messy.
  - Mitigation: type-specific allowed statuses + validation rules.

## Session Continuity And Recovery

1. `git status -sb`
2. `git log --oneline -n 10`
3. reopen this brief and continue from the latest checkpoint.

## Checkpoint Log

- `2026-03-19 | planning | created phase-1 user training-context brief after product review confirmed that Goals, Focus, and Notes are separate user choices: Goals = longer-term destination, Focus = current training priority, Notes = observations/questions from real swim practice; phase-1 should be relationship-ready for later generator/session/program prefills without building those automations yet | next: decide whether to start with schema + My Library IA foundations first or combine first usable mobile capture with minimal model rollout`
- `2026-03-19 | in-progress | implementation started on branch feat/my-library-focus-notes-foundation; chosen first slice is schema + first usable My Library Focus/Notes capture flow so dogfooding can start early while preserving Goals as a separate hub | next: add server-canonical tables/types/helpers and a minimal My Library surface for Focus + Notes`
- `2026-03-19 | in-progress | phase-1 foundation now includes server-canonical Focus/Notes tables, authenticated My Library routes, phone-first capture UI with inline Goals/Focus/Notes mental-model guidance, export coverage, and targeted analytics; targeted unit tests, typecheck, lint, build, perf budgets, and full npm run verify:pre-pr passed locally | next: stage files cleanly, rerun brief lint with the brief tracked, then package PR handoff for the first usable dogfooding slice`
- `2026-03-19 | done | feature slice merged to main as 5f015bc after local npm run lint:briefs, npm run verify:pre-pr, npm run verify:pre-merge, and green required GitHub checks on PR #233; perf trend recommendation remained tighten and the decision for this non-perf slice was hold | next: follow-on child slices can build richer context-linking and generator-prefill flows on top of this foundation`
