# Task Brief: My Library Goals To Focus And Notes Workflow Bridge (10/10)

## Metadata

- `id`: `2026-03-20-my-library-goals-focus-workflow-bridge-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-03-20`
- `updated`: `2026-03-21`

## Goal

Users can move from a saved goal into a current focus or note in one clear workflow, without re-entering context, losing drafts, or confusing long-term goals with session-to-session training intent.

## Why This Brief Exists

- The `Goals`, `Focus`, and `Notes` foundations are shipped and working as separate concepts.
- The current UX still leaves too much manual translation between the two private surfaces:
  - goals live in one hub,
  - focus and notes live in another hub,
  - but the bridge between them is still too weak for frequent real use.
- This creates friction for the common real-world job:
  - set a longer-term goal,
  - then turn that goal into the one thing to train on now,
  - or capture a note/question that belongs to that goal.
- This slice should improve workflow clarity and cross-surface usability without changing the underlying canonical data model.

## Dependencies And Boundaries

- Existing authoritative foundations that must remain intact:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-19-my-library-goals-focus-notes-training-context-10-10.md`
  - `/Users/stianvikra/freeswimming/app/my-library/goals/page.tsx`
  - `/Users/stianvikra/freeswimming/app/my-library/training/page.tsx`
  - `/Users/stianvikra/freeswimming/components/my-library/goals/GoalsHub.tsx`
  - `/Users/stianvikra/freeswimming/components/my-library/training/TrainingContextHub.tsx`
- Nearby follow-on work that must stay compatible:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-02-28-ai-plan-generator-json-guardrails-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-02-28-program-builder-calendar-completion-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-03-20-training-history-completion-reconciliation-and-retrospective-evaluation-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-21-my-library-focus-management-v2-multi-open-focuses-10-10.md`
- This is a workflow-bridge slice, not a new schema/model slice.
- This is private user-owned My Library UX, not admin workflow.
- Dependency note:
  - focus-v2 multi-open behavior is now shipped,
  - this bridge follow-up must therefore use `open focus` + `primary focus` semantics rather than reintroducing singular-active-focus assumptions.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                          | Evidence                                   |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Product goals and IA                          | `target`     | Users can move from `Goals` to `Focus & Notes` with one explicit next-step path and no ambiguity about which concept they are editing.                  | brief contract + manual QA + e2e           |
| UX flow clarity                               | `target`     | Goal-to-focus and goal-to-note flows complete without dead ends and support `empty`, `prefilled`, `success`, `error`, `offline`, and `retry` states.    | e2e + unit + manual QA                     |
| Visual design quality                         | `target`     | New bridge affordances fit the existing My Library visual language and feel intentional rather than bolted-on.                                          | screenshot review + manual QA              |
| Business logic correctness and data integrity | `target`     | Goal quick actions never mutate saved goals implicitly; prefill only influences local draft state until explicit save on focus/note forms.              | unit tests + code review + runtime guards  |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice only changes authenticated end-user My Library workflow, not admin/editor surfaces.                                              | explicit scope rationale                   |
| Accessibility (a11y)                          | `target`     | Added quick actions, prefill banners, and selection controls remain keyboard/touch accessible with labeled controls and visible focus states.           | Playwright + manual QA                     |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: bridge UX should reuse current My Library data and avoid obvious payload or render regressions on `/my-library/goals` and `/training`. | build + perf budgets + code review         |
| Data placement and sync boundaries            | `target`     | Saved goals, focus entries, and notes remain server-canonical; cross-surface prefill and chooser state remain local-only until explicit save.           | brief contract + tests + code review       |
| Caching and invalidation strategy             | `target`     | After create/update, both hubs show deterministic canonical state; goal-prefill UI never leaves stale selected context after refresh or save.           | integration review + e2e                   |
| Reliability and failure handling              | `target`     | Offline/auth/validation failures preserve drafts and show actionable non-500 guidance for goal-linked focus/note flows.                                 | negative-path tests + manual QA            |
| Security and authz                            | `target`     | Goal-linked quick actions only operate on owner-scoped data and all related endpoints remain fail-closed for unauthorized access.                       | existing route guards + negative-path test |
| Privacy and compliance                        | `target`     | Goal-linked notes/focus drafts remain private to the signed-in user and no new public exposure path is introduced.                                      | route review + test assertions             |
| Content governance                            | `supporting` | Supporting only: user-owned titles, statuses, and timestamps remain canonical and unchanged by workflow-only affordances.                               | schema review + code review                |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, help-center tab, or editorial actions are changed in this slice.                                                         | explicit scope rationale                   |
| SEO and crawlability                          | `N/A`        | N/A because these are authenticated private My Library routes with no public crawl/index contract.                                                      | explicit scope rationale                   |
| AI discoverability                            | `N/A`        | N/A because this slice improves user workflow only and does not change public AI-facing discoverability surfaces.                                       | explicit scope rationale                   |
| Analytics and KPI observability               | `supporting` | Supporting only: key bridge actions should remain measurable enough to learn whether users actually convert goals into focus/note workflows.            | analytics event review + code inspection   |
| Commerce and revenue ops                      | `N/A`        | N/A because this workflow slice changes no pricing, entitlements, upsell logic, or commercial reporting.                                                | explicit scope rationale                   |
| Incident response and support operations      | `target`     | Core-flow runbook includes specific checks for goal-linked training prefill and quick-action failure states on private My Library routes.               | runbook update + docs review               |
| Finance and reporting operations              | `N/A`        | N/A because no billing, payout, reconciliation, or reporting data path is touched in this private UX slice.                                             | explicit scope rationale                   |
| i18n operational readiness                    | `supporting` | Supporting only: new labels and intent enums stay localization-safe and avoid burying logic in user-facing copy.                                        | copy review + code review                  |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next.js, React, Tailwind, and Supabase patterns with no unnecessary new dependency.                                                      | dependency diff + code review              |
| Testing and QA automation                     | `target`     | Unit and e2e coverage protect goal-to-focus prefill, goal-to-note selection, draft preservation, and no-implicit-mutation behavior.                     | tests + `verify:pre-pr`/`verify:pre-merge` |
| Scalability and cost efficiency               | `supporting` | Supporting only: bridge helpers should avoid extra heavy writes or duplicate fetches beyond existing route needs.                                       | query review + code review                 |
| DevOps and rollback readiness                 | `supporting` | Supporting only: UI-only workflow changes remain easy to disable or revert without schema rollback.                                                     | release notes + git diff review            |

## Data Placement And Sync Contract (Required For Stateful Features)

- Server-canonical data:
  - `goals`, `training_focuses`, and `training_notes` remain the only saved source-of-truth entities.
  - Goal status, focus status, note status, timestamps, and linked ids remain canonical on the server.
- Local data:
  - quick-action selection state,
  - URL/query prefill intent,
  - unsaved focus draft and note draft,
  - UI dismissal/highlight state for the currently selected goal context.
- Sync policy:
  - quick actions may prefill local drafts immediately but must not write server data,
  - explicit form submit remains required for create/update,
  - successful create/update responses replace local rendered snapshot state,
  - stale auth/offline failures preserve unsaved draft text and selected goal context for retry.
- Retention and sensitivity:
  - goal-linked notes and focus details remain private user data,
  - no new retention semantics are introduced in this slice.
- Cache/invalidation:
  - route reads remain no-store/dynamic as already defined,
  - post-write UI refresh must show canonical updated state without requiring the user to manually re-open the linked goal.

## Identity And Rename Contract (Required When Entities Are Persisted Or Linkable)

- Canonical stable IDs:
  - `goal.id`, `focus.id`, and `note.id` remain the only canonical identifiers.
- Human-readable identifiers:
  - goal titles, focus titles, and note text are editable display fields only.
  - URL prefill uses canonical ids, not titles, as source-of-truth.
- Mutability rules:
  - quick actions may select an existing goal id for local use,
  - they must never rename, archive, or otherwise mutate the selected goal implicitly.
- Rename vs repurpose policy:
  - editing a goal title in place does not break the bridge because selection stays id-based,
  - materially different goals/focuses/notes still require separate canonical rows rather than in-place repurposing.
- Compatibility contract:
  - this workflow bridge must remain compatible with later generator intake, which reads open goals and primary focus canonically.
- Observability and repair:
  - if a URL/query prefill references a goal id that is no longer available to the user, the UI must fall back safely and explain that the selected goal is unavailable.

## Scope

- Improve the user-facing workflow between `/my-library/goals` and `/my-library/training`.
- Add explicit quick actions from goals into `Focus & Notes`.
- Add safe goal-prefill context on the training page so users do not need to re-select the same goal manually.
- Surface active goal context inside training workflow so users can choose whether the selected goal should support:
  - a new open focus,
  - a new note.
- Keep all existing entity boundaries intact:
  - `Goal` remains long-term target,
  - `Focus` remains current priority,
  - `Note` remains observation/question capture.
- Add or update targeted automated coverage for the workflow bridge.
- Update operational/runbook notes for the new private-route checks.

## Out Of Scope

- New database schema or migration work.
- Generator/session/program implementation.
- Auto-generating focus or notes from goals.
- Expanding note taxonomy beyond `Observation` and `Question`.
- AI answers, coaching automation, or public marketing copy changes.

## Acceptance Criteria

1. A signed-in user can start from a goal and reach `Focus & Notes` with goal context already selected.
2. The bridge makes it obvious that the goal remains a long-term destination while focus/notes are next-session tools.
3. Quick actions never save or mutate a goal until the user explicitly submits a focus or note form.
4. If the user already has unsaved draft text, the bridge does not silently wipe it.
5. If the selected goal is unavailable or archived by the time the training page loads, the UI falls back safely with clear guidance.
6. Training page quick actions can set goal context for both:
   - `open focus`
   - `note`
7. Existing multi-open focus, primary-focus selection, and note-status rules continue to hold without regression.
8. Unauthorized access remains fail-closed on all touched API surfaces.
9. `npm run lint:briefs`, relevant targeted tests, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- `npx vitest run tests/unit/training-context-hub.test.tsx`
- `npx playwright test tests/e2e/my-library-training-context.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite (Required)

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation should run from this repo root:
  - `npm run lint:briefs`
  - `npm run verify:pre-pr`

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/goals`
  - `http://127.0.0.1:3000/my-library/training`
- Preview:
  - PR preview URL after branch push
- Recommended verification:
  - desktop Chromium
  - mobile Safari-width viewport

## Constraints

- Preserve the shipped foundations and keep the code changes focused on workflow clarity.
- Do not introduce a second source of truth or hidden auto-save behavior.
- Keep copy plain and action-oriented.
- Avoid new dependencies.

## 10/10 Quality Bar (Required For User-Facing Work)

- A user should immediately understand what to do after creating or reviewing a goal.
- The primary next action from a goal should be visible without making the user guess which page to open next.
- Added bridge UI must support:
  - `empty`
  - `prefilled`
  - `loading`
  - `error`
  - `offline`
  - `retry`
  - `success`
- Keyboard and touch usage must remain complete for all added controls.
- Draft preservation must be explicit and deterministic.
- No silent goal mutation, no silent draft loss, and no ambiguous open-focus or primary-focus behavior.

## Checkpoint Log

- `2026-03-21 | intent-aware bridge follow-up | realigned the shipped workflow bridge to focus-v2 by honoring goal-prefill intent on initial load, highlighting the intended form, and extending unit + Playwright coverage for both deeplink paths | next: rerun brief lint + verify:pre-pr, then open/update PR`
- `2026-03-21 | planning dependency note | recorded that this bridge slice currently assumes the shipped singular-active-focus model and must be realigned if the new focus-v2 multi-open/primary-focus brief is executed; this keeps follow-up goal->focus UX work from silently diverging from the new planned direction | next: sequence focus-v2 before further bridge follow-up changes`
- `2026-03-20 | planning + implementation started | opened follow-up UX bridge slice because shipped goals/focus foundations are conceptually correct but still too detached for real day-to-day use; scope locked to goal-to-focus/note quick actions, safe prefill, and workflow clarity without schema changes | next: implement bridge UI, add targeted tests, update runbook, and run verify:pre-pr`
- `2026-03-20 | local implementation checkpoint | shipped goal-to-training quick actions on the goals hub, added safe goal-prefill and goal chooser workflow on Focus & Notes, added unit coverage plus a dedicated goals->training Playwright flow, and updated the core incident-response runbook for the new private-route checks | next: commit branch head, rerun lint:briefs from branch diff, then run verify:pre-pr before PR handoff`
- `2026-03-20 | c13fd63 | branch-head validation green | \`npm run lint:briefs\`, targeted eslint, \`npm run typecheck\`, targeted unit, targeted Playwright, and full \`npm run verify:pre-pr\` all passed; perf trend recommended \`tighten\` after the second consecutive weekly green run, and the decision for this workflow-focused slice is \`hold\` with the ratchet to be taken in the next perf-owned workstream or PR summary | next: push branch, open PR, monitor required checks, then run \`npm run verify:pre-merge\` before merge`
