# Task Brief: My Library Training Focus Goals Notes IA Simplification (10/10)

## Metadata

- `id`: `2026-03-30-my-library-training-focus-goals-notes-ia-simplification-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-03-30`
- `updated`: `2026-03-30`

## Goal

Make `/my-library/training` calmer, more self-explanatory, and easier to use in real life by reducing instructional copy, making the `Add focus` and `Add note` workflows collapsible, and presenting open focuses in a clearer primary-first hierarchy.

## Why This Brief Exists

- Real production usage on `2026-03-30` shows the route is conceptually correct but still too verbose and button-heavy.
- The current page teaches the model too much in copy instead of letting the structure and actions explain it:
  - long hero paragraph,
  - extra section explanation,
  - "Turn a goal into today's work" bridge copy,
  - redundant "how goals/focus/notes work together" tone.
- The two main create flows are always open, which adds scroll and visual noise even when the user mainly wants to review or edit existing work.
- The open-focus list is still too action-dense:
  - many inline buttons on each card,
  - no calmer primary-first grouping,
  - too much repeated decision-making on the surface itself.
- This should be a dedicated IA and workflow simplification slice rather than being buried inside generator or builder work.

## Dependencies And Boundaries

- Existing foundations that remain authoritative:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-19-my-library-goals-focus-notes-training-context-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-21-my-library-focus-management-v2-multi-open-focuses-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-22-my-library-training-focus-edit-primary-and-section-nav-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-03-20-my-library-goals-focus-workflow-bridge-10-10.md`
  - `/Users/stianvikra/freeswimming/components/my-library/training/TrainingContextHub.tsx`
  - `/Users/stianvikra/freeswimming/app/my-library/training/page.tsx`
- This slice owns:
  - `/my-library/training` information architecture,
  - copy reduction on that route,
  - calmer focus-card action model,
  - collapsible create flows for focus and note.
- This slice does not own:
  - new schema or persistence behavior,
  - generator/program behavior,
  - admin notes ergonomics,
  - goals-page IA on `/my-library/goals`,
  - changing canonical focus/note/goal meanings.
- Related admin-note scope intentionally stays separate:
  - `0d1fa716-460e-406a-a68d-28c1aaae5b22` `Mulitple Screenshots`
  - `40b252d8-ee9f-41ed-89ca-0eb5af8bcc89` `Quick note`
  - those remain owned by `/Users/stianvikra/freeswimming/docs/task-briefs/planned/2026-03-27-admin-notes-ergonomics-multi-image-and-route-surface-followup-10-10.md`
  - reason: they affect admin capture ergonomics, not the end-user My Library training route.

## Admin Notes Triage Disposition

Production admin notes reviewed against this brief on `2026-03-30`:

- `4f8cda7e-b8a9-4e14-976c-71964c239a5f` `Make collapsable`
  - disposition: owned by this brief.
  - reason: directly requests a collapsible `Add focus` flow on `/my-library/training`.
- `fb290ab1-60f4-4840-8bca-14408d096b68` `Add note collapsable`
  - disposition: owned by this brief.
  - reason: directly requests a collapsible note composer on `/my-library/training`.
- `b5e46d29-d250-4b0d-b257-eec77a92b886` `Focuses`
  - disposition: owned by this brief.
  - reason: requests calmer primary-first focus presentation and fewer inline actions on non-primary focuses.
- `ecf1940c-9709-4d97-b7d7-4b0a81faf741` `Remove paragraph`
  - disposition: owned by this brief.
  - reason: requests removal of over-explanatory training-route copy.
- `29d53a01-9849-4a2a-9136-6eba58254e1c` `Turn a goal into todays work - remove?`
  - disposition: owned by this brief.
  - reason: requests a calmer goals bridge heading and less teaching copy on the training route.
- `a4821b30-4078-4bb2-8466-26444b95e4ea` `How goals focus notes work together`
  - disposition: owned by this brief.
  - reason: requests that the page rely more on instinctive use and less on explanatory copy overload.
- `0d1fa716-460e-406a-a68d-28c1aaae5b22` `Mulitple Screenshots`
  - disposition: remains owned by existing admin-notes ergonomics brief.
  - reason: the note concerns admin capture evidence, not My Library training IA.
- `40b252d8-ee9f-41ed-89ca-0eb5af8bcc89` `Quick note`
  - disposition: remains owned by existing admin-notes ergonomics brief.
  - reason: the note concerns admin quick-capture reuse, not the user training route.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                           | Evidence                                   |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| Product goals and IA                          | `target`     | Users can understand the three jobs on the route in one scan: review goals context, review current focus state, and add/edit notes without reading dense explainer copy. | IA review + manual QA + e2e                |
| UX flow clarity                               | `target`     | Focus and note creation, collapse/reopen, goal-prefill, and primary-focus review complete without dead ends, hidden state loss, or unclear next steps.                   | e2e + unit + manual QA                     |
| Visual design quality                         | `target`     | `/my-library/training` feels calmer and less cluttered on phone and desktop, with reduced copy noise and more intentional action hierarchy.                              | screenshot review + manual QA              |
| Business logic correctness and data integrity | `target`     | IA simplification never changes canonical goal/focus/note data implicitly; collapse, edit-entry, and status-action changes preserve existing saved truth.                | unit tests + runtime guards + code review  |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes private end-user My Library workflow, not admin editing surfaces.                                                                         | explicit scope rationale                   |
| Accessibility (a11y)                          | `target`     | Collapsible sections, grouped focus cards, and edit-only action paths remain keyboard/touch accessible with visible focus and explicit labels.                           | Playwright + manual QA                     |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: calmer IA must avoid obvious payload or render regressions on `/my-library/training`.                                                                   | build + perf review + code review          |
| Data placement and sync boundaries            | `target`     | Saved goals, focuses, and notes remain server-canonical; collapse state, selected section, and draft visibility remain local-only until explicit save.                   | brief contract + tests + code review       |
| Caching and invalidation strategy             | `target`     | After create/update/status changes, the route still refreshes deterministically and collapse state never masks stale canonical data.                                     | integration review + e2e                   |
| Reliability and failure handling              | `target`     | Drafts survive route-local collapse/reopen, and offline/error/retry states stay actionable with no false-success or silent data loss.                                    | negative-path tests + manual QA            |
| Security and authz                            | `supporting` | Supporting only: owner-only My Library protections remain fail-closed and unchanged by IA-only edits.                                                                    | API regression review + existing tests     |
| Privacy and compliance                        | `supporting` | Supporting only: no new exposure path is introduced; notes and linked goals remain private to the signed-in owner.                                                       | scope review + regression checks           |
| Content governance                            | `supporting` | Supporting only: simplified headings and helper copy remain consistent with canonical goal/focus/note meanings.                                                          | copy review + code review                  |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, dashboard label, or editor-facing route changes in this slice.                                                                            | explicit scope rationale                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/training` is a private authenticated route with no public crawl/index contract.                                                                 | explicit scope rationale                   |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public AI-facing discoverability surface.                                                                                              | explicit scope rationale                   |
| Analytics and KPI observability               | `supporting` | Supporting only: goal-prefill usage, collapse usage, and focus-edit entry should stay measurable if analytics hooks already exist.                                       | analytics event review + code inspection   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlements, or revenue reporting path changes in this private UX slice.                                                                        | explicit scope rationale                   |
| Incident response and support operations      | `target`     | Runbooks/help checks must describe the calmer training IA, collapse behavior, and where focus status actions moved if labels or recovery behavior change.                | runbook/help update + docs review          |
| Finance and reporting operations              | `N/A`        | N/A because no billing, payouts, reconciliation, or finance reporting logic changes in this slice.                                                                       | explicit scope rationale                   |
| i18n operational readiness                    | `supporting` | Supporting only: simplified labels stay localization-safe and avoid hiding logic in English/Norwegian prose.                                                             | copy review + code review                  |
| Stack-fit and dependency discipline           | `target`     | Reuse existing My Library patterns and components with no unnecessary new dependency.                                                                                    | dependency diff + code review              |
| Testing and QA automation                     | `target`     | Coverage protects collapse/reopen behavior, primary-first focus presentation, edit-entry action path, and no-draft-loss regressions.                                     | tests + `verify:pre-pr`/`verify:pre-merge` |
| Scalability and cost efficiency               | `supporting` | Supporting only: the calmer route should not add extra heavy polling, duplicate fetches, or unnecessary writes.                                                          | query review + code review                 |
| DevOps and rollback readiness                 | `supporting` | Supporting only: route-level UX changes remain reversible without schema rollback.                                                                                       | release notes + git diff review            |

## Data Placement And Sync Contract

- Server-canonical:
  - `goals`,
  - `training_focuses`,
  - `training_notes`,
  - primary-focus selection,
  - focus/note statuses,
  - timestamps and linked IDs.
- Local-only:
  - collapse/open state for `Add focus` and `Add note`,
  - current selected goal context,
  - current workflow-intent highlight,
  - unsaved focus draft and note draft,
  - focus-history visibility.
- Sync policy:
  - collapse/reopen must not write server data,
  - create/update/status actions remain explicit writes,
  - draft text persists locally until explicit save or explicit discard,
  - goal-prefill continues to influence local draft state only until save.
- Retention and sensitivity:
  - no retention changes,
  - notes and focus details remain private owner data,
  - collapse must hide drafts without deleting them unless the user explicitly clears/discards.
- Cache/invalidation:
  - route refresh after writes must keep canonical data truthful,
  - collapse/open state should not force manual re-selection of saved canonical items.

## Identity And Rename Contract

- Canonical stable IDs:
  - `goal.id`, `focus.id`, and `note.id` remain the only canonical identifiers.
- Human-readable identifiers:
  - titles, details, and note text remain editable display fields only.
- Mutability rules:
  - changing the UI hierarchy or moving status actions behind `Edit` must not alter saved semantics,
  - goal-prefill still selects by canonical goal ID, not by title.
- Rename vs repurpose policy:
  - editing focus title/details remains an in-place edit,
  - materially different training intent still becomes a different canonical focus/note row instead of repurposing history silently.
- Compatibility contract:
  - goals remain long-term intent,
  - focuses remain current cues,
  - notes remain observations/questions,
  - this simplification must not blur those boundaries.
- Observability and repair:
  - if a selected goal disappears or becomes unavailable, the route must still fall back safely and preserve unrelated drafts.

## Scope

- Reduce or remove over-explanatory copy on `/my-library/training`, including the long hero explanation and redundant section teaching copy where it no longer helps.
- Simplify the goals bridge section so the route does not over-teach "how goals, focus, and notes work together."
- Replace the current "Turn a goal into today's work" framing with calmer, plainer route language.
- Make `Add focus` collapsible.
- Make `Add note` collapsible.
- Define deterministic collapse defaults that reduce overload while preserving draft safety:
  - auto-open for relevant goal-prefill intent,
  - auto-open when a local draft exists,
  - otherwise allow calmer collapsed defaults when existing saved content already exists.
- Rework open-focus presentation into a primary-first hierarchy:
  - primary focus summary first when one exists,
  - other open focuses grouped underneath,
  - calmer metadata and fewer inline actions on non-primary cards.
- Move non-primary focus status churn behind a clearer `Edit focus` path or similarly constrained action surface so cards are easier to scan.
- Keep existing note counts, focus history, and owner-only protections intact.

## Out Of Scope

- Database migrations or schema/model changes.
- Generator/session/program implementation.
- Admin notes quick-capture behavior.
- Multi-image evidence capture for admin notes.
- Goals-page IA cleanup on `/my-library/goals`.
- New public content, marketing, or SEO work.

## Acceptance Criteria

1. The route no longer relies on long explanatory paragraphs to teach the relationship between goals, focus, and notes.
2. `Add focus` can collapse and reopen without losing unsaved draft state.
3. `Add note` can collapse and reopen without losing unsaved draft state.
4. Goal-prefill still opens or highlights the correct composer when the user arrives from Goals.
5. Open focuses are presented in a calmer primary-first hierarchy instead of a repeated multi-button card wall.
6. Non-primary focus cards no longer expose the current full row of status buttons directly on every card; the action model is materially calmer and still complete.
7. The goals bridge section uses simpler heading/copy while preserving the ability to choose whether a selected goal feeds a focus or a note.
8. Existing primary-focus, open-focus, note-status, and goal-link behavior continue to work without regression.
9. `npm run lint:briefs`, relevant targeted tests, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- targeted unit tests for:
  - collapse/reopen draft preservation,
  - primary-first focus rendering,
  - action availability after calmer focus-card simplification
- targeted e2e for:
  - goal-prefill into focus,
  - goal-prefill into note,
  - collapse/reopen with preserved draft,
  - primary-focus + secondary-focus scanability/action flow
- `npx playwright test tests/e2e/my-library-training-context.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation should run from the repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/my-library/training`
- Preview:
  - PR preview URL after branch push
- Recommended matrix:
  - iPhone Safari-width viewport
  - Android Chromium-width viewport
  - desktop Chromium
  - desktop Safari/WebKit

## Constraints

- Keep the slice focused on one private route.
- Preserve existing canonical meanings for goals, focus, and notes.
- Prefer removing or collapsing noise rather than adding new IA layers.
- Avoid new dependencies.

## 10/10 Quality Bar

- The page should feel calmer in one screenful.
- The user should not need explanatory prose to know where to act next.
- Required changed states remain explicit:
  - `loading`
  - `empty`
  - `error`
  - `offline`
  - `retry`
  - `success`
  - collapsed with draft preserved
  - reopened from prefill intent
- No silent draft loss, no silent data mutation, and no ambiguous primary-focus behavior.

## Help/Guide And Operator Training Contract

- Required:
  - update any relevant Help/Guide or runbook copy in the same PR if changed labels, collapse defaults, or action placement alter the recovery contract for this route,
  - update at least one automated assertion if the help contract changes.

## Security, Privacy, and Compliance

- No new public routes or public data exposure paths are introduced.
- Existing owner-only My Library protections remain fail-closed.
- Local draft preservation must not leak private note/focus text outside the signed-in owner's browser context.

## Observability And KPI Contract

- Supporting metrics if hooks already exist:
  - goal-prefill to focus usage,
  - goal-prefill to note usage,
  - collapse/reopen usage,
  - focus edit-entry usage after action simplification.
- Success KPI for this slice:
  - real users can scan `/my-library/training` faster and complete the intended action without feeling buried in copy or button clutter.

## Session Continuity And Recovery

- Canonical source of truth: git branch + this brief path.
- Checkpoint cadence:
  - keep the checkpoint log current at each meaningful planning or implementation milestone,
  - record the latest validated commit hash once implementation starts.
- Recovery order:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from latest checkpoint

## Git Rhythm Defaults

- Commit + push after each validated training-route slice.
- Open/update PR after one coherent vertical slice or after `2-4` validated checkpoint commits, whichever comes first.

## Automation Mode

- `automation-first`
  - assistant handles implementation, tests, git checkpoints, push, PR open/update, and CI monitoring unless blocked by credentials, UI-only approval, or an explicit owner decision.

## Branch Hygiene Defaults

- Post-merge cleanup:
  - `git checkout main`
  - `git pull --ff-only origin main`
  - `git branch -d <merged-branch>`
  - `git push origin --delete <merged-branch>` when appropriate

## PR Browser Rule

- Default PR create/review/merge links open in Safari.

## Manual QA URL Rule

- Default local and preview QA URLs for `/my-library/training` should be opened in Safari before requesting owner confirmation.

## Checkpoint Log

- `2026-03-30 | working tree | aligned this planned brief with the current repo execution defaults so validation, automation ownership, and Safari QA expectations are explicit before implementation starts | next: keep the slice planned until the route simplification work is scheduled`
- `2026-03-30 | planning | created a dedicated training-route follow-up brief after production notes showed that /my-library/training still feels too verbose and action-dense even though the underlying goals/focus/notes model is sound; locked scope to calmer IA, collapsible composers, and primary-first focus presentation without schema change | next: implement route simplification, update tests/docs, and validate with verify:pre-pr`
- `2026-03-30 | working tree | implementation started on branch \`feat/my-library-training-ia-simplification-2026-03-30\`; brief moved to in-progress and lifecycle-aligned with the already-merged auth cleanup so this slice can focus on calmer training IA, collapsible composers, and primary-first focus actions | next: ship the training route UI changes, update tests/runbook coverage, then run lint:briefs + verify:pre-pr before PR handoff`
- `2026-03-30 | working tree | shipped calmer /my-library/training IA locally: shorter hero/bridge copy, collapsible Add focus/Add note composers with preserved drafts, primary-first focus grouping, and calmer non-primary action surfaces; updated incident-response runbook plus unit + targeted Playwright coverage, then passed \`npm run lint:briefs:all\`, \`npm run typecheck\`, \`npx vitest run tests/unit/training-context-hub.test.tsx\`, \`npx playwright test tests/e2e/my-library-training-context.spec.ts --project=desktop-chromium\`, and full \`npm run verify:pre-pr\` | next: commit, push branch, open PR, and monitor CI`
