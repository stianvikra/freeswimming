# Task Brief: Swim Session Builder Create Vs Edit Clarity (10/10)

## Metadata

- `id`: `2026-04-05-swim-session-builder-create-vs-edit-clarity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-04-05`
- `updated`: `2026-04-05`

## Goal

The swim-session experience makes it immediately clear whether the user is browsing sessions, starting a new manual session, or entering the AI flow, with the manual-builder detail route focused on the current session instead of competing create actions.

## Why This Brief Exists

- Live production review on `2026-04-05` surfaced a tighter, more specific UX seam than the broader builder parent brief currently expresses:
  - users should enter through a simpler three-action overview,
  - `Create session` chooser behavior tied to the latest saved session feels misleading,
  - fresh-manual entry should feel like a true new-session form,
  - the detail route should not keep re-offering competing creation paths once the user is already inside a manual session.
- Existing open notes point to the same shared problem:
  - `0655d28e` `Swim session builder`
  - `2d2cb8af` `Swim session builder`
  - `f271ea91` `Swim session builder edit-entry clarity`
- The owner explicitly chose the lower-click model for this slice:
  - `My Swim Sessions`
  - `Build manual session`
  - `AI-generated session`

## Dependencies And Boundaries

- Parent brief that remains authoritative for the larger builder UX wave:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-03-27-workout-builder-live-review-ux-and-actions-10-10.md`
- Current builder/runtime foundations to reuse rather than replace:
  - `/Users/stianvikra/freeswimming/app/my-library/page.tsx`
  - `/Users/stianvikra/freeswimming/app/my-library/workouts/page.tsx`
  - `/Users/stianvikra/freeswimming/app/my-library/workouts/[workoutId]/page.tsx`
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutBuilderHub.tsx`
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx`
  - `/Users/stianvikra/freeswimming/components/my-library/workouts/CreateManualWorkoutButton.tsx`
- Locked product decisions for this slice unless the owner explicitly changes them:
  - overview/entry should expose three primary actions with minimal clicks:
    - `My Swim Sessions`
    - `Build manual session`
    - `AI-generated session`
  - the manual create button should create a fresh manual session directly,
  - the latest-saved chooser should be removed,
  - existing saved-session editing should happen from `My Swim Sessions`,
  - once the user is inside a manual session detail route, the route should focus on that current session instead of presenting a second create-mode chooser.
- Truthfulness guardrail:
  - the current data model still creates a canonical workout row immediately for a new manual session,
  - so destructive labels in this slice must stay truthful to the persisted model and should not claim a purely local unsaved draft if that is not what exists yet.

## Admin Notes Triage Disposition

- `f271ea91-a7f7-4687-937f-6e6f64e68b27` `Swim session builder edit-entry clarity`
  - disposition: owned by this brief.
  - reason: this is the core note for create-vs-edit boundaries, manual-vs-AI entry clarity, and button/copy truthfulness.
- `0655d28e-8fa8-4077-8d20-0bc34309671c` `Swim session builder`
  - disposition: owned by this brief.
  - reason: the note now captures the screenshot-backed copy and action confusion on the current session detail route.
- `2d2cb8af` `Swim session builder`
  - disposition: owned by this brief.
  - reason: the note belongs to the same overview/create/edit IA seam and should ship through the same three-action model.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Admin workflow and editability`
- `Testing and QA automation`
- `Product goals and IA`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                     | Evidence                              |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| Product goals and IA                          | `target`     | Users can identify browse vs manual vs AI entry from the overview in one glance, and the detail route no longer competes with a second create-mode decision.       | IA review + manual QA + e2e           |
| UX flow clarity                               | `target`     | New manual session entry, existing-session browse/edit, and AI entry each have one obvious path with no latest-saved chooser or misleading duplicate create CTA.   | manual QA + e2e                       |
| Visual design quality                         | `target`     | The entry surface feels calmer and more intentional after redundant helper copy and competing actions are removed.                                                 | screenshot review + manual QA         |
| Business logic correctness and data integrity | `target`     | Manual creation still creates a canonical owner-scoped workout deterministically, and saved-session editing continues to route through canonical workout IDs only. | unit tests + API continuity review    |
| Admin editor ergonomics                       | `target`     | The owner can move between browse, manual create, and AI create with fewer clicks and less ambiguity during repeated testing.                                      | timed manual QA + e2e                 |
| Accessibility (a11y)                          | `supporting` | Supporting only: the new entry buttons and calmer detail-route actions must remain keyboard/touch accessible with clear labels.                                    | targeted tests + code review          |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: this IA cleanup should not materially regress `/my-library` or workout-detail route responsiveness.                                               | typecheck + targeted review           |
| Data placement and sync boundaries            | `target`     | The brief states that a newly created manual session still maps to the canonical persisted workout model while UI entry labels stay truthful.                      | brief contract + code review          |
| Caching and invalidation strategy             | `supporting` | Supporting only: browse/detail transitions and fresh-create redirects should keep using the existing deterministic refresh path.                                   | integration review                    |
| Reliability and failure handling              | `target`     | If manual creation fails, the user still gets an actionable inline error and does not end up in an ambiguous partial state.                                        | unit tests + existing route behavior  |
| Security and authz                            | `supporting` | Supporting only: all changed swim-session routes remain owner-scoped and authenticated.                                                                            | existing auth boundaries              |
| Privacy and compliance                        | `N/A`        | N/A because this slice changes owner-scoped workout IA and copy, not privacy policy or public disclosure.                                                          | explicit scope rationale              |
| Content governance                            | `supporting` | Supporting only: button/copy changes must stay aligned with the canonical workout model and current My Swim Sessions naming.                                       | copy review                           |
| Admin workflow and editability                | `target`     | Existing saved sessions are edited from the list, while new manual entry opens a more obvious form-first route with less competing chrome.                         | manual QA + targeted tests            |
| SEO and crawlability                          | `N/A`        | N/A because these are authenticated My Library surfaces with no public crawl contract.                                                                             | explicit scope rationale              |
| AI discoverability                            | `N/A`        | N/A because the slice changes no public AI-facing route or metadata contract.                                                                                      | explicit scope rationale              |
| Analytics and KPI observability               | `supporting` | Supporting only: entrypoint usage can still be inferred from the clearer route/action split even if no new events are added in this slice.                         | scope review                          |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, billing, entitlement, or commercial reporting logic changes.                                                                               | explicit scope rationale              |
| Incident response and support operations      | `supporting` | Supporting only: if help text or runbook guidance changes, it must explain the new three-action overview model truthfully.                                         | docs update if needed                 |
| Finance and reporting operations              | `N/A`        | N/A because no billing, payout, reconciliation, or finance reporting path changes in this slice.                                                                   | explicit scope rationale              |
| i18n operational readiness                    | `N/A`        | N/A because this slice only changes internal English UI copy on authenticated builder surfaces and should not block future localization architecture.              | explicit scope rationale              |
| Stack-fit and dependency discipline           | `target`     | Reuse the current workout-builder stack and existing route model; do not add a parallel draft store or new dependencies in this slice.                             | dependency diff + architecture review |
| Testing and QA automation                     | `target`     | Coverage protects overview action labels, direct manual-create routing, expanded fresh-manual details, and the calmer detail-route action model.                   | unit/e2e coverage + `verify:pre-pr`   |
| Scalability and cost efficiency               | `supporting` | Supporting only: removing the chooser should simplify repeated operator interactions without increasing extra saved-session churn beyond the current model.        | code review + manual QA               |
| DevOps and rollback readiness                 | `supporting` | Supporting only: this route/copy/UI slice stays reversible without schema or storage migration.                                                                    | rollback note + diff review           |

## Data Placement And Sync Contract

- Server-canonical:
  - `workout.id`,
  - persisted workout draft payload saved in the canonical workouts table,
  - recent saved workout summaries used by `My Swim Sessions`.
- Local-only:
  - route entry context such as whether the current detail route came from a fresh manual-create action,
  - metadata panel open/closed UI state after hydration,
  - transient notices and in-progress inline errors.
- Sync policy:
  - pressing `Build manual session` creates a fresh canonical workout row immediately using the existing manual-create API,
  - the UI may mark that route as a fresh manual entry so the details panel opens expanded on first load,
  - editing an existing session still routes through the canonical `My Swim Sessions` list and workout detail route.
- Retention and sensitivity:
  - no new private data model is introduced,
  - the slice only changes how users enter and understand the existing owner-scoped workout flow.
- Cache/invalidation:
  - existing `router.push`/`router.refresh` behavior remains authoritative for fresh create and saved-session browse/edit transitions.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the only canonical swim-session identity.
- Human-readable identifiers:
  - `My Swim Sessions`, `Build manual session`, and `AI-generated session` are entry labels only, not identifiers.
- Mutability rules:
  - entry labels may change in place,
  - canonical workout identity and existing detail routes remain unchanged.
- Rename vs repurpose policy:
  - this slice refines route/action naming and entry emphasis only,
  - it does not repurpose saved sessions into a new entity type.
- Compatibility contract:
  - existing saved sessions remain accessible from `My Swim Sessions`,
  - existing manual-create behavior still persists a workout immediately, even while the entry language becomes clearer.
- Observability and repair:
  - failed manual create stays recoverable through inline error messaging,
  - missing saved workout routes still send the user back toward `My Swim Sessions` or a fresh create path.

## Scope

- On the swim-session overview entry surface:
  - expose three primary actions with minimal clicks:
    - `My Swim Sessions`
    - `Build manual session`
    - `AI-generated session`
  - remove the latest-saved chooser behavior from manual create,
  - remove the now-misleading explanatory helper text around manual/AI convergence.
- On the manual workout detail route:
  - remove redundant create/AI entry competition from the focused manual-builder screen,
  - keep navigation centered on the current session plus a path back to `My Swim Sessions`,
  - calm or remove the misleading “edit one saved session...” shell copy.
- On fresh manual-create entry:
  - open `Session details` expanded by default for a just-created manual session,
  - keep the calmer collapsed behavior available for normal saved-session edit entry when appropriate.
- Update targeted tests to match the chosen three-action model.

## Out Of Scope

- Creating a true separate local-only unsaved draft entity.
- Reworking the underlying canonical workout schema.
- Reopening broader program-builder, Garmin, or export logic.
- Changing the AI generator’s internal review flow beyond entry labels and linking.
- Reworking dryland builder entrypoints in this slice.

## Acceptance Criteria

1. The overview entry surface exposes three primary actions: `My Swim Sessions`, `Build manual session`, and `AI-generated session`.
2. Manual create no longer opens a latest-saved chooser and instead creates a fresh manual session directly.
3. The three requested helper text blocks are removed from the swim-session overview/detail flow where they currently create confusion.
4. A freshly created manual session opens with `Session details` expanded by default.
5. The focused swim-session detail route no longer re-offers competing manual/AI create actions while the user is already inside that session.
6. Existing saved-session editing remains reachable from `My Swim Sessions`.
7. Targeted tests and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted `vitest`:
  - `tests/unit/create-manual-workout-button.test.tsx`
  - `tests/unit/workout-builder-hub.test.tsx`
- targeted `playwright`:
  - `tests/e2e/my-library-workout-builder.spec.ts --project=desktop-chromium`
  - `tests/e2e/my-library-generator-intake.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library`
  - `http://127.0.0.1:3000/my-library/workouts`
  - `http://127.0.0.1:3000/my-library/workouts/<id>`
- Preview:
  - PR preview URL after branch push

## Constraints

- Keep the first pass small and truthful.
- Do not imply a true local unsaved draft store if the route still represents a canonical saved workout row.
- Prefer reducing confusion by removing competing actions rather than adding more helper copy.

## 10/10 Quality Bar

- The user should immediately understand the difference between:
  - browsing saved sessions,
  - building a fresh manual session,
  - entering the AI flow.
- The manual builder detail route should feel like one mode, not three competing modes at once.
- Fresh manual entry should feel like a form-first setup moment rather than dropping the user into a collapsed edit surface with contradictory actions.

## Checkpoint Log

- `2026-04-05 | planning + implementation start | created child brief under the active builder parent after the owner chose the simpler three-action overview model (`My Swim Sessions`, `Build manual session`, `AI-generated session`) and asked to implement it end-to-end without further approval prompts | next: remove chooser logic, simplify overview/detail action surfaces, open fresh manual entry with details expanded, and update targeted coverage`
- `2026-04-05 | implementation + targeted validation | removed the latest-saved chooser, switched the overview to the owner-chosen three-action model, calmed the manual detail route, opened fresh manual entry with details expanded, updated the core-flow incident runbook to match the new labels, and got typecheck + targeted vitest + targeted desktop-chromium generator/workout playwright green | next: finish the running \`npm run verify:pre-pr\`, then stage only the builder/runbook files for commit so unrelated admin-note workflow edits stay separate`
- `2026-04-05 | verify hardening + release gate green | hardened the admin email-template preview e2e to wait for status-transition PATCH responses, relaxed the course common-mistakes e2e to tolerate unresolved lesson candidates while still checking the actual common-mistakes behavior on resolved lessons, and got a final full \`npm run verify:pre-pr\` green on branch \`feat/swim-session-builder-overview-manual-ai-2026-04-05\` | next: commit the staged builder/runbook/test set, push, and open the PR`
