# Task Brief: My Library Focus Management V2 Multi-Open Focuses (10/10)

## Metadata

- `id`: `2026-03-21-my-library-focus-management-v2-multi-open-focuses-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-03-21`
- `updated`: `2026-03-21`

## Goal

Users can keep multiple current focus points in My Library without the system auto-completing or auto-archiving old focus entries, while downstream surfaces still have one deterministic `primary focus` when they need a single active cue.

## Why This Brief Exists

- The shipped focus foundation intentionally enforced `one active focus at a time`.
- Real use now shows that this is too restrictive:
  - swimmers may want several current technical reminders,
  - creating a new focus should not imply the old one is done,
  - `completed` and `archived` should be explicit user decisions.
- This is not a copy tweak:
  - it changes focus state semantics,
  - affects API invariants,
  - affects generator intake and My Library summaries that currently read one singular active focus.
- The safest move is a dedicated v2 brief rather than sneaking the change into a workflow-only slice.

## Dependencies And Boundaries

- Existing authoritative foundations to reuse and partially supersede:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-19-my-library-goals-focus-notes-training-context-10-10.md`
  - `/Users/stianvikra/freeswimming/components/my-library/training/TrainingContextHub.tsx`
  - `/Users/stianvikra/freeswimming/app/api/my-library/training-context/focus/route.ts`
  - `/Users/stianvikra/freeswimming/lib/training-context/server.ts`
- Downstream work that must stay compatible:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-03-20-my-library-goals-focus-workflow-bridge-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-19-my-library-generator-intake-and-prefill-foundation-10-10.md`
  - `/Users/stianvikra/freeswimming/components/my-library/generator/GeneratorIntakeHub.tsx`
  - `/Users/stianvikra/freeswimming/components/my-library/generator/SessionGeneratorPanel.tsx`
- Recommended direction locked unless owner overrides:
  - focus status model becomes `open`, `completed`, `archived`,
  - one optional `primary focus` may exist among `open` focuses,
  - creating a new focus never mutates existing focus rows implicitly.
- This slice owns focus model v2 and compatibility updates.
- This slice does not own:
  - broad notes redesign,
  - goals IA cleanup,
  - builder/program generation implementation beyond compatibility alignment.

## Scope

- Replace single-active-focus rule with multi-open focus support.
- Define canonical v2 focus state model:
  - `open`
  - `completed`
  - `archived`
- Add deterministic `primary focus` contract:
  - zero or one `primary focus` among open focuses,
  - if the user has exactly one open focus, it may become primary automatically,
  - creating a second or later open focus must not auto-complete/archive other rows.
- Update training-context UI:
  - open focuses listed first,
  - primary focus clearly marked,
  - completed and archived history collapsed or filtered by default,
  - explicit actions for `Mark completed`, `Archive`, `Set primary`, and `Reopen` when in scope.
- Update My Library summary and generator-intake compatibility:
  - summaries prefer `primary focus`,
  - if multiple open focuses exist and no primary is set, downstream single-focus surfaces must fail safe and ask the user to choose instead of guessing silently.
- Update API/runtime invariants:
  - no more replacement-status requirement on create,
  - guard against multiple primaries,
  - preserve owner-only access and deterministic transitions.
- Migrate or read through old `active` rows safely:
  - legacy `active` maps to `open`,
  - existing singular active row becomes `primary` during migration or compatibility read-through.

## Out Of Scope

- New notes taxonomy.
- Broad training-page visual redesign beyond what is required for focus-v2 clarity.
- AI-generated focus suggestions.
- Public marketing or pricing changes.
- Workout/program builder feature implementation.

## Data Placement And Sync Contract

- Server-canonical data:
  - focus rows,
  - focus status,
  - primary-focus assignment,
  - linked goal ID,
  - timestamps and ownership.
- Local-only data:
  - unsaved focus draft,
  - current section/filter disclosure state,
  - transient selection UI when choosing a primary focus in the client.
- Sync policy:
  - focus create/update/primary-set actions require explicit user action,
  - server response is the source of truth after each mutation,
  - legacy `active` reads must resolve to v2-safe view data until all surfaces are aligned,
  - failed writes preserve draft text and do not half-apply primary reassignment in UI.
- Retention and sensitivity:
  - completed and archived focuses remain part of private training history unless a later explicit delete policy is introduced,
  - no new public exposure path is introduced.
- Cache/invalidation:
  - training-context route, My Library summary, generator intake summary, and focus-linked goal surfaces refresh deterministically after every focus mutation.

## Identity And Rename Contract

- Canonical stable ID:
  - `focus.id` remains the canonical ID for each focus row.
- Human-readable identifiers:
  - focus title and details are editable display fields only.
- Mutability rules:
  - `status` and `is_primary` are semantic state fields and must change only through allowed transitions,
  - creating a new focus must not rewrite or close existing focuses implicitly.
- Rename vs repurpose policy:
  - wording changes to the same training cue are in-place edits,
  - materially different training cues should become new focus rows.
- Compatibility contract:
  - legacy `active` state must map safely to `open` during rollout,
  - downstream singular-focus consumers must use `primary focus` first, then deterministic fallback rules, never arbitrary first-row selection.
- Observability and repair:
  - invalid states such as multiple primaries or orphaned legacy state must be detectable and repairable through deterministic runtime guards and tests.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                        | Evidence                             |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Product goals and IA                          | `target`     | Users can understand the difference between `open`, `primary`, `completed`, and `archived` focus without external explanation.        | IA review + manual QA + e2e          |
| UX flow clarity                               | `target`     | Creating a new focus never forces hidden replacement decisions, and selecting a primary focus is explicit and recoverable.            | e2e + manual QA                      |
| Visual design quality                         | `target`     | The focus surface remains calm and readable even when several open focus cards exist.                                                 | screenshot review + manual QA        |
| Business logic correctness and data integrity | `target`     | Multiple open focuses are supported without auto-closing prior rows, and at most one primary focus exists at a time.                  | unit tests + runtime guards          |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes private user focus management, not admin editing workflows.                                            | scope rationale                      |
| Accessibility (a11y)                          | `target`     | Focus create/edit/status/primary actions remain keyboard/touch accessible with correct labels and focus behavior.                     | Playwright + manual QA               |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: focus-v2 changes must avoid obvious render or payload regressions on private My Library routes.                      | build + code review                  |
| Data placement and sync boundaries            | `target`     | Focus rows and primary assignment remain server-canonical while selection/disclosure state remains local-only.                        | contract review + tests              |
| Caching and invalidation strategy             | `target`     | My Library summary, training hub, and generator intake show updated primary/open focus truth immediately after successful mutation.   | integration review + e2e             |
| Reliability and failure handling              | `target`     | Failed creates/updates/primary changes do not leave stale client assumptions or hidden state corruption.                              | negative-path tests + manual QA      |
| Security and authz                            | `target`     | Focus reads/writes remain owner-scoped and fail closed for unauthenticated or unauthorized requests.                                  | API negative-path tests              |
| Privacy and compliance                        | `supporting` | Supporting only: focus data remains private training data and must not leak into public routes, logs, or cross-user views.            | scope review + test assertions       |
| Content governance                            | `supporting` | Supporting only: status labels and primary-focus semantics must remain canonical and consistent across private surfaces.              | copy review + tests                  |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, Help/Guide admin tab, or editorial action changes are owned here.                                      | scope rationale                      |
| SEO and crawlability                          | `N/A`        | N/A because this is authenticated/private My Library functionality with no public crawl/index contract.                               | scope rationale                      |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public AI-facing discoverability surface.                                                           | scope rationale                      |
| Analytics and KPI observability               | `supporting` | Supporting only: key events should distinguish create, complete, archive, reopen, and primary-selection behavior for future learning. | analytics event review               |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, or finance-linked workflow changes in this focus-management slice.                               | scope rationale                      |
| Incident response and support operations      | `supporting` | Supporting only: runbook/support notes should explain migration and repair for bad legacy active-focus states if encountered.         | runbook/help review                  |
| Finance and reporting operations              | `N/A`        | N/A because no billing, reconciliation, payout, or reporting logic is changed by focus-management v2.                                 | scope rationale                      |
| i18n operational readiness                    | `supporting` | Supporting only: new status labels and primary-focus copy must remain localization-safe and enum-backed.                              | copy review + schema review          |
| Stack-fit and dependency discipline           | `target`     | Reuse existing My Library, Supabase, and generator-intake stack with no unnecessary dependencies.                                     | dependency diff + code review        |
| Testing and QA automation                     | `target`     | Coverage protects multi-open invariants, primary-focus rules, migration/read-through behavior, and downstream compatibility paths.    | tests + `verify:pre-pr` evidence     |
| Scalability and cost efficiency               | `supporting` | Supporting only: multi-open focus support should avoid wasteful duplicate fetches or N+1 focus-resolution patterns.                   | query review + code review           |
| DevOps and rollback readiness                 | `target`     | Status-model rollout includes a safe migration/read-through path and rollback guidance for legacy singular-active data.               | migration notes + rollback checklist |

## Acceptance Criteria

1. A user can keep more than one current focus open at the same time.
2. Creating a new focus never auto-completes or auto-archives an existing focus.
3. `Completed` and `Archived` remain explicit user-driven actions.
4. At most one `primary focus` exists at a time, with deterministic fallback rules when none is set.
5. Generator-intake and summary surfaces use `primary focus` safely instead of assuming one singular active row.
6. Legacy `active` data migrates or reads through without data loss or ambiguous UI.
7. Completed and archived focus history stays available but is visually secondary by default.
8. `npm run lint:briefs`, targeted tests, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- targeted unit tests for:
  - multi-open invariants,
  - primary-focus exclusivity,
  - legacy `active` read-through/migration behavior,
  - downstream focus selection rules
- targeted e2e for:
  - create multiple open focuses,
  - set and switch primary focus,
  - complete/archive without implicit replacement,
  - generator-intake compatibility
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/training`
  - `http://127.0.0.1:3000/my-library`
  - `http://127.0.0.1:3000/my-library/generator`
- Preview:
  - PR preview URL after branch push
- Recommended matrix:
  - iPhone Safari
  - Android Chromium
  - iPad/tablet viewport
  - Desktop Chrome
  - Desktop Safari/WebKit
  - Desktop Firefox

## Constraints

- Keep the model simple:
  - multiple `open` focuses,
  - explicit `completed` and `archived`,
  - zero-or-one `primary`.
- Do not guess silently when downstream surfaces need one focus and the user has many.
- Preserve existing goal and note boundaries.
- Avoid broad route redesign beyond what focus-v2 needs for clarity.

## 10/10 Quality Bar

- Focus management must feel more flexible without becoming ambiguous.
- Users must always know:
  - what is still current,
  - what is the main current cue,
  - what is finished,
  - what is archived.
- Required states remain explicit:
  - `loading`
  - `empty`
  - `error`
  - `offline`
  - `retry`
  - `success`
- No silent replacement, no silent closure, and no hidden primary-focus drift are acceptable.
- Downstream compatibility must be deterministic, not best-effort guesswork.

## Checkpoint Log

- `2026-03-21 | merged-ready closeout | moved this brief to \`done\`, passed local \`npm run verify:pre-merge\`, confirmed PR #255 had all required GitHub checks green, and recorded the latest perf-budget signal as a \`tighten\` recommendation with a deliberate \`hold\` decision for this slice because focus-v2 does not own budget target changes | next: squash merge PR #255 and sync local main`
- `2026-03-21 | focus-v2 slice implemented and locally verified | shipped schema-backed multi-open focus support with one optional primary focus, updated training hub/My Library/generator compatibility semantics, added primary-focus analytics and export/schema contract updates, hardened focused My Library e2e coverage, and passed \`npm run verify:pre-pr\` after fixing a recent-workout locator/timing flake in the desktop generator-intake flow | next: stage only focus-v2 files, open PR, and monitor CI`
- `2026-03-21 | perf trend decision | perf budget trend recommended tightening one stretch target step after two consecutive weekly green runs; decision for this slice is \`hold\` and carry the tighten/hold decision into the AW-010/PR summary because focus-v2 does not own performance-budget target selection | next: record the same note in PR handoff`
- `2026-03-21 | implementation started on branch \`fix/my-library-focus-v2-2026-03-21\` | moved brief to in-progress, confirmed current single-focus assumptions across schema, training hub, My Library summary, and generator intake, and locked implementation direction to schema-backed multi-open focus support with one optional primary focus plus deterministic downstream fallback | next: ship schema/type updates first, then training-context UI and generator compatibility updates with targeted tests`
- `2026-03-21 | planning | created dedicated focus-v2 brief after confirming current foundations and APIs explicitly enforce one active focus at a time; locked recommended direction to multi-open focuses plus one optional primary focus so future implementation can update generator and workflow-bridge assumptions safely | next: execute this slice before further focus-bridge follow-up work`
