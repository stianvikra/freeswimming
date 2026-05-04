# Task Brief: Program PDF Session-Step Parity (10/10)

## Metadata

- `id`: `2026-05-04-program-pdf-session-step-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-04`
- `updated`: `2026-05-04`
- `mode`: `end-to-end implementation`

## Goal

Make Program PDF scheduled workout cards show compact session-step sections from the shared session-step display contract so program printouts do not hide the actual workout structure behind one generic workout summary.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim: `UX flow clarity`, `Visual design quality`, `Business logic correctness and data integrity`, `Stack-fit and dependency discipline`, `Testing and QA automation`.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                            | Evidence                                     | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Program PDF exposes scheduled workout structure inside the program artifact while preserving the program schedule hierarchy.                  | PDF model diff + screenshot handoff          | `5/5`                   |
| UX flow clarity                               | `target`     | A swimmer/coach can scan week, day, workout, section, and step prescriptions without opening a separate workout PDF.                          | unit tests + screenshot handoff              | `5/5`                   |
| Visual design quality                         | `target`     | Program PDF workout details reuse the shared section/category rhythm and stay print-safe without making cards cramped or visually noisy.      | after/reference screenshots                  | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Step sections preserve workout order, category identity, linked rests, repeat rests, post-set rests, and missing-workout review states.       | program export tests + shared workout tests  | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this private end-user program print artifact does not change admin authoring, moderation, or publishing workflows.                | explicit admin scope rationale               | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Printable HTML keeps semantic week/day/workout/section headings and readable fallback text for missing or review-needed workouts.             | HTML assertions + screenshot review          | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency, no extra server read, and no route-level fetch expansion; Program PDF derives sections from already loaded workout drafts. | dependency diff + targeted tests             | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Saved programs/workouts remain server-canonical; Program PDF uses derived display-only section data.                                          | brief + code review                          | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: export route cache behavior stays unchanged and reflects the current program export snapshot.                                | route review                                 | `4/5`                   |
| Reliability and failure handling              | `target`     | Missing workout references and review-needed workouts still render deterministic review text instead of blank PDF content.                    | route/model tests                            | `5/5`                   |
| Security and authz                            | `target`     | Protected Program PDF export continues to fail closed for unauthenticated users.                                                              | existing + targeted route tests              | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no new personal data source, logging, sharing destination, or retention behavior.                                            | data review                                  | `4/5`                   |
| Content governance                            | `target`     | Section labels, rest wording, and repeat wording come from the shared workout/session-step display helpers rather than program-local copy.    | contract tests + code review                 | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin/user recovery queue, workflow status, or support action changes in this print-only slice.                                | explicit workflow scope rationale            | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because authenticated Program PDF export changes no public metadata, sitemap, robots, or crawlable page content.                          | explicit SEO scope rationale                 | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this private export changes no public AI-discoverable entity, structured data, or crawl-safe content.                             | explicit AI-discovery scope rationale        | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: export action/test IDs remain stable; no event taxonomy is introduced.                                                       | test-id/event diff review                    | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, entitlement, subscription, refund, or revenue workflow changes.                                             | explicit commerce scope rationale            | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this print-rendering change adds no alerting, incident path, support queue, or customer recovery workflow.                        | explicit support-ops scope rationale         | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no payout, invoice, ledger, entitlement report, refund, or finance reconciliation data changes.                                   | explicit finance scope rationale             | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: shared labels reduce future localization drift, but no locale routing/storage or translation layer changes.                  | label centralization review                  | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse TypeScript workout/program export helpers and the existing HTML print stack with zero new dependencies and no direct React reuse.       | dependency diff + code review                | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted tests, screenshot handoff, `verify:pre-pr`, CI, and `verify:pre-merge` cover the change.                                             | unit tests + screenshots + gate evidence     | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Program PDF reuses derived workout data already loaded for export, avoiding duplicate render engines or additional runtime services.          | architecture review + export snapshot review | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Code/docs-only, no migration, no cache purge; rollback is a single PR revert.                                                                 | PR diff + rollback note                      | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js: Program PDF remains server-generated HTML from `lib/programs/export.ts`; no route, action, API, or client component boundary changes.
- TypeScript/domain contracts: program export uses `ProgramEditorRecord`, `WorkoutEditorRecord`, and canonical `SessionDraft`; workout session sections are derived display-only data.
- Supabase/data layer: N/A with rationale: no schema, migration, RLS, auth, storage, or generated DB type changes.
- External services/tools: N/A with rationale: no SDK, webhook, secret, retry, idempotency, or provider behavior changes.
- UI/print system: use `docs/design/session-step-surface-contract.md`; the mature reference is manual builder `View` plus saved-workout Quick View, but Program PDF must render HTML rather than directly reusing `SessionStepSurfaceRenderer`.
- Testing: update focused program export route/model assertions and reuse existing workout shared tests for linked rests/repeat rest semantics.

## Data Placement And Sync Contract

- Server-canonical data: saved program records, week/day assignments, and referenced saved workout drafts remain owned by the existing program/workout APIs.
- Local-only data: none added.
- Sync policy: no new sync; Program PDF derives display-only step sections from the already loaded export snapshot at request time.
- Retention and sensitivity: no new persistence, logging, or personal-data exposure.
- Cache/invalidation: unchanged; export route uses the existing authenticated export snapshot read path.

## Identity And Rename Contract

- Canonical stable IDs: program IDs, week IDs, assignment IDs, workout IDs, step IDs, and repeat IDs remain unchanged.
- Human-readable identifiers: program titles, workout titles, week labels, day labels, and section labels remain display-only and renameable.
- Mutability rules: this slice does not mutate entities.
- Rename vs repurpose: N/A for runtime behavior because no persisted identifier changes.
- Compatibility contract: missing workout references continue to render review states instead of rebinding to labels.
- Observability and repair: existing export diagnostics remain the repair surface for missing references and workout review issues.

## Scope

- `lib/programs/export.ts`
- `tests/unit/program-export-routes.test.ts`
- Existing workout shared tests where needed
- `docs/design/session-step-surface-contract.md`
- `AGENTS.md` and `docs/runbooks/ui-debug-hypothesis-and-handoff.md` for screenshot artifact handoff governance clarified during owner review
- Screenshot handoff for Program PDF after/reference parity

## Out Of Scope

- Program builder calendar UX.
- Training history/completion state.
- Poolside note renderer changes.
- Workout PDF renderer changes outside shared semantic reference.
- Garmin-ready JSON payload expansion.
- Schema, RLS, authz, cache, or dependency changes.

## Acceptance Criteria

1. Program PDF assignment cards show grouped workout section rows for referenced workouts.
2. Section rows preserve workout order, category, repeat summaries, linked rest, repeat rest, and post-set rest wording from the shared workout/session-step display contract.
3. Program PDF still renders missing workout references and review-needed workouts deterministically.
4. Program export auth failures remain fail-closed.
5. Screenshot handoff is approved before `npm run verify:pre-pr`.

## Validation

- `npm run lint:briefs`
- targeted unit tests:
  - `tests/unit/program-export-routes.test.ts`
  - `tests/unit/workouts-shared.test.ts`
- screenshot handoff before `verify:pre-pr`
- after owner screenshot approval:
  - `npm run verify:pre-pr`
  - CI
  - `npm run verify:pre-merge`

## Help/Guide And Operator Training Impact

N/A with rationale: this slice changes an authenticated print artifact only; it does not rename workflow actions, support recovery behavior, admin labels, or Help/Guide content contracts.

## Manual QA Environments

- Local URL: `http://127.0.0.1:3000`
- Screenshot comparison type: `after/reference`
- Required representative screenshots:
  - `after-program-pdf-desktop`
  - `after-program-pdf-mobile`
  - `reference-workout-pdf-desktop` or `reference-saved-quick-view-desktop`

## Rollback Plan

Revert this PR. No schema rollback, data repair, cache purge, finance action, or customer communication is required.

## Checkpoint Log

- `2026-05-04 | in-progress | created implementation brief after owner explicitly requested execution of program PDF session-step parity from clean main | next: implement derived session-step sections in Program PDF and targeted coverage`
- `2026-05-04 | implementation + screenshot-review | Program PDF now derives scheduled-workout sections from the shared workout preview-section contract; targeted tests, typecheck, lint, and lint:briefs:all pass; after/reference screenshots captured in /Users/stianvikra/freeswimming/output/program-pdf-session-step-parity-2026-05-04 | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-05-04 | pre-pr gate | owner approved screenshot handoff; npm run verify:pre-pr passed full lane including lint, typecheck, unit, build, perf budgets, and Playwright e2e; perf budget trend recommended tightening after 4 weekly green runs, but budget changes are held out of this PDF parity PR and should be handled in the dedicated performance-budget track | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge`
- `2026-05-04 | screenshot governance follow-up | owner flagged inconsistent screenshot artifact folder linking and timestamp ambiguity; AGENTS.md and the UI debug handoff runbook now require clickable Screenshot artifacts links, timestamped artifact folders, capture timestamps, final-handoff link repetition, and explicit regenerate/no-visual-change-after-capture handling | next: rerun gates on updated PR, merge #585, run post-merge preflight`
