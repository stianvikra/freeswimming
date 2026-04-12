# Task Brief: Workout Builder Notice Placement And Audience (10/10)

## Metadata

- `id`: `2026-04-03-workout-builder-notice-placement-and-audience-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-03`
- `updated`: `2026-04-03`

## Goal

Keep the manual `Swim session builder` form primary while moving export/handoff notices into a calmer secondary disclosure that stays truthful about who the tools are for and what actions do or do not persist.

## Why This Brief Exists

- The production admin-notes umbrella still carries one explicit builder follow-up:
  - `854d3f39-9275-4d80-a624-a687e47db320` `Workout builder notice placement and audience follow-up`
- Earlier builder slices already:
  - collapsed the heaviest read surfaces,
  - moved `PDF` / `Poolside Note` into the save/action bar,
  - kept the editor form dominant on the saved-session detail route.
- The remaining friction is narrower:
  - export/handoff diagnostics still occupy a large block in the calm builder layout,
  - the current copy is not explicit enough that these tools are optional support tools rather than the primary editing path,
  - persistence truth still needs to stay obvious so opening/downloading support outputs is never mistaken for saving or sending a session.

## Dependencies And Boundaries

- Parent umbrella:
  - `docs/task-briefs/done/2026-04-01-production-admin-notes-remaining-work-umbrella-10-10.md`
- Parent builder brief:
- `docs/task-briefs/done/2026-03-27-workout-builder-live-review-ux-and-actions-10-10.md`
- Main product surfaces in scope:
  - `components/my-library/workouts/WorkoutEditor.tsx`
  - `tests/unit/workout-builder-hub.test.tsx`
  - `tests/e2e/my-library-workout-builder.spec.ts`
  - `docs/runbooks/core-flow-incident-response.md`
- This slice owns:
  - calmer placement for export/handoff notices in the calm manual-builder layout,
  - audience/persistence copy for support tools,
  - regression coverage and runbook/brief updates.
- This slice does not own:
  - removal of any manual swim-session builder input fields,
  - drill/kick taxonomy changes,
  - saved-session browse density,
  - generator-route IA or top-level My Library card copy.

## Triage Disposition

- `854d3f39-9275-4d80-a624-a687e47db320` `Workout builder notice placement and audience follow-up`
  - disposition: owned by this brief.
  - reason: the note maps directly to calmer placement and truthful copy for builder support notices.
- `9245eaba-e5fd-4bc2-83c1-2f53c7df100e` `Workout builder drill and kick taxonomy follow-up`
  - disposition: already split and handled in a separate child slice.
  - reason: taxonomy clarity is a different risk surface than export/handoff placement.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                    | Evidence                                 |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Product goals and IA                          | `target`     | The manual builder route keeps the session form and primary save/print actions visually ahead of secondary export/handoff diagnostics.            | UI review + unit/e2e                     |
| UX flow clarity                               | `target`     | Owners can tell in one scan that export/handoff tools are optional support tools and that opening/downloading them does not save or publish work. | targeted unit/e2e + copy review          |
| Visual design quality                         | `target`     | Support notices feel materially calmer than the current always-expanded block and fit the existing builder visual language.                       | screenshot review + manual QA            |
| Business logic correctness and data integrity | `target`     | The new disclosure changes only placement/copy; canonical workout IDs, saved-session state, and export payload behavior remain unchanged.         | unit tests + code review                 |
| Admin editor ergonomics                       | `supporting` | Supporting only: the owner can still reach readiness, Garmin export, and handoff tools quickly when needed.                                       | manual QA + targeted e2e                 |
| Accessibility (a11y)                          | `supporting` | Supporting only: the new disclosure remains keyboard accessible with correct `aria-expanded` semantics.                                           | Testing Library + Playwright             |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: the disclosure adds no material route payload or blocking network work.                                                          | `verify:pre-pr` + diff review            |
| Data placement and sync boundaries            | `target`     | Disclosure open/closed state stays local-only UI state; support outputs continue to reflect the existing draft/canonical source contract.         | brief contract + code review             |
| Caching and invalidation strategy             | `N/A`        | N/A because the slice adds no new fetch path, cache key, or invalidation rule.                                                                    | explicit scope rationale                 |
| Reliability and failure handling              | `target`     | Support notices remain visible when the section is opened, and success/error feedback stays deterministic after copy/download/open actions.       | unit tests + targeted e2e                |
| Security and authz                            | `supporting` | Supporting only: the slice does not widen access beyond the existing authenticated owner-scoped workout builder.                                  | existing auth coverage + scope rationale |
| Privacy and compliance                        | `N/A`        | N/A because the slice changes private builder copy/placement only and does not alter personal-data handling or exposure.                          | explicit scope rationale                 |
| Content governance                            | `supporting` | Supporting only: support-tool wording must stay aligned with the truthful Garmin/export contracts already shipped.                                | copy review + parent-brief alignment     |
| Admin workflow and editability                | `supporting` | Supporting only: the owner still has deterministic access to support exports while the main editing surface stays calmer.                         | targeted QA                              |
| SEO and crawlability                          | `N/A`        | N/A because the swim-session builder is an authenticated/private route with no public crawl/index change.                                         | explicit scope rationale                 |
| AI discoverability                            | `N/A`        | N/A because the slice changes no public route metadata, schema, or AI-facing contract.                                                            | explicit scope rationale                 |
| Analytics and KPI observability               | `N/A`        | N/A because the slice adds no new instrumentation and keeps existing builder/export behavior intact.                                              | explicit scope rationale                 |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, or billing behavior changes.                                                                                 | explicit scope rationale                 |
| Incident response and support operations      | `supporting` | Supporting only: the runbook must note that PDF stays primary while Garmin/handoff support now sits behind a dedicated disclosure.                | runbook update + QA checklist            |
| Finance and reporting operations              | `N/A`        | N/A because no finance or reporting workflow changes.                                                                                             | explicit scope rationale                 |
| i18n operational readiness                    | `N/A`        | N/A because the slice only changes small English private-route labels and does not alter locale infrastructure.                                   | explicit scope rationale                 |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing `WorkoutEditor` structure without new dependencies or a second support-tool model.                                             | dependency diff + code review            |
| Testing and QA automation                     | `target`     | Coverage proves the calm layout defaults to collapsed support tools, preserves export/handoff behavior after expansion, and passes verify gates.  | unit tests + targeted e2e + gate output  |
| Scalability and cost efficiency               | `N/A`        | N/A because no new storage, background job, or repeated network cost is introduced.                                                               | explicit scope rationale                 |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the slice remains reversible in one component path plus tests/docs, with no schema or data migration.                            | rollback note + PR summary               |

## Data Placement And Sync Contract

- Server-canonical:
  - saved workout rows,
  - canonical workout IDs,
  - readiness/export/handoff payloads derived from the existing draft or canonical session state.
- Local-only:
  - whether the calm-layout support disclosure is open,
  - transient copy/download/open notices,
  - any unsaved draft edits already supported by the builder.
- Sync policy:
  - opening the disclosure never fetches or mutates canonical data,
  - support outputs continue to reflect the same on-screen draft vs canonical state contract as before.
- Retention and sensitivity:
  - disclosure state is ephemeral client UI state only,
  - no new sensitive fields or persisted flags are introduced.
- Cache/invalidation:
  - unchanged; normal workout save/refresh remains the only canonical invalidation path.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the only canonical identity for save, export, print, and handoff actions.
- Human-readable identifiers:
  - support-tool labels are UI copy only.
- Mutability rules:
  - this slice changes labels/placement only and does not rename or repurpose saved workout entities.
- Compatibility contract:
  - existing workout-detail routes and export/handoff actions keep the same targets and payload contracts.
- Observability and repair:
  - regression coverage must catch any case where the new disclosure hides or retargets the wrong support action.

## Scope

- Add a calm disclosure shell around the export/handoff support block on the manual builder route.
- Keep `PDF` and `Poolside Note` as primary actions while support diagnostics stay secondary.
- Tighten support copy so the UI makes audience and persistence explicit:
  - optional support tools,
  - current draft vs canonical source truth,
  - opening/downloading does not save, send, or publish the session.
- Update regression coverage, runbook, and parent brief checkpoints.

## Out Of Scope

- Any removal of manual `Swim session builder` authoring fields/input boxes.
- New role-gating or auth model for support exports.
- Drill/kick taxonomy, browse density, or My Library card IA changes.
- New export formats or provider integrations.

## Acceptance Criteria

1. The calm manual builder layout defaults the export/handoff support block to a collapsed disclosure.
2. The collapsed disclosure still surfaces enough summary/status information for the owner to know whether review items exist.
3. `PDF` / `Poolside Note` remain primary actions outside that disclosure.
4. Export/handoff copy explicitly says that opening/downloading support outputs does not save, send, or publish the session.
5. Existing Garmin readiness, JSON export, and workout handoff functionality still works once the disclosure is opened.
6. No manual swim-session builder input field is removed in this slice.
7. `npm run lint:briefs`, targeted validation, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted `vitest`:
  - `tests/unit/workout-builder-hub.test.tsx`
- targeted `playwright`:
  - `tests/e2e/my-library-workout-builder.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root/worktree with the shared dependency set available.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/workouts/<workoutId>`
- Preview:
  - PR Vercel preview URL after branch push
- Recommended matrix:
  - desktop Chromium
  - desktop Safari/WebKit

## Constraints

- Keep the change scoped to notice placement/copy in the existing manual builder route.
- Do not remove any manual swim-session builder input fields.
- Do not move primary save or print actions back into the support disclosure.
- Preserve the current export/handoff payload contracts.

## 10/10 Quality Bar

- The builder should feel calmer before the owner expands any support tools.
- Support state should stay legible even while collapsed:
  - `ready`
  - `review items present`
  - `local draft source`
  - `canonical source`
- The disclosure copy should remove ambiguity about persistence without sounding alarmist.

## Help/Guide And Operator Training Contract

- Update `docs/runbooks/core-flow-incident-response.md` so the QA checklist explicitly notes:
  - `PDF` / `Poolside Note` stay primary in the action strip,
  - secondary Garmin/handoff support now lives behind the calm disclosure,
  - opening/downloading support outputs does not save or publish the session.

## Security, Privacy, and Compliance

- Authentication and owner-scoped routing remain unchanged.
- No new storage, secrets, or sensitive payload fields are introduced.
- The slice must not imply a new admin-only or public audience that the code does not actually enforce.

## Observability And KPI Contract

- Success signal for this slice:
  - the owner can stay focused on editing the session first and only expand support tools when they actually need them.
- No new instrumentation is required in this slice.

## Session Continuity And Recovery

- Canonical source of truth:
  - git branch
  - this brief path
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint note

## Git Rhythm Defaults

- Commit + push after one coherent validated notice-placement slice.
- Open/update PR after `npm run verify:pre-pr` is green.

## PR Browser Rule

- Default PR create/review/merge links open in Safari.

## Checkpoint Log

- `2026-04-03 | working tree | created the notice-placement child slice under the umbrella and parent builder brief so the remaining builder follow-up can land as a focused calmer-placement/copy pass without touching manual input fields | next: implement the calm support disclosure, update regression coverage/runbook, and run targeted validation`
