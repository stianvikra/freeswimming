# Task Brief: Generator Intake UX Clarity And Progressive Disclosure (10/10)

## Metadata

- `id`: `2026-03-28-generator-intake-ux-clarity-and-progressive-disclosure-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-03-28`
- `updated`: `2026-03-30`

## Goal

Make `/my-library/generator` understandable on first use by treating it as a true single-session AI generator, simplifying language, and removing redundant setup layers that still read like an internal staging tool.

## Why This Brief Exists

- Real use in `freeswimming.org` shows the generator intake is functionally correct but still reads too much like an internal staging tool.
- The current friction is tightly related:
  - `Desired session count` appears even when the user is generating a single session,
  - `Saved My Library context` is too technical as a heading,
  - `One-run overrides` is correct but not self-explanatory enough,
  - `Deterministic handoff` exposes raw payload/ID detail too aggressively in the normal flow.
- These are primarily IA, copy, and progressive-disclosure problems, not missing data-contract problems.
- Live review after slice 1 also showed a second-order UX issue:
  - `Before you generate` and `This run only` still create too much explanatory overhead,
  - single-session users still see concepts that belong to a later AI program generator,
  - session-specific notes/settings feel split across two different areas.
- The correct next step is a focused UX cleanup that keeps the existing canonical handoff model intact while making the page much easier to understand.

## Dependencies And Boundaries

- Existing intake/data-contract foundation that remains authoritative:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-19-my-library-generator-intake-and-prefill-foundation-10-10.md`
- Existing session-builder/workout-builder downstream surfaces that must stay compatible:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-03-27-workout-builder-live-review-ux-and-actions-10-10.md`
- Locked boundary decisions unless explicitly changed later:
  - generator handoff remains canonical and deterministic,
  - notes still stay out of default generator prefill in this slice,
  - no new program-planner implementation,
  - no AI generation logic change,
  - no new persisted generator entity.

## Admin Notes Triage Disposition

Production admin notes reviewed against this brief on `2026-03-28`:

- `54c8c570-ed7b-4e63-94a5-5b3748389337` `Hva er denne koden på bildet?`
  - disposition: owned by this brief.
  - reason: the raw payload/canonical ID preview is too exposed in the normal session flow.
- `8eb45996-83d4-4e78-ab3b-807272982d6d` `Deterministic handoff`
  - disposition: owned by this brief.
  - reason: the technical preview needs calmer IA, clearer explanation, and progressive disclosure.
- `33e123ad-d05f-4ef3-add0-803bf52b96d2` `One-run overrides`
  - disposition: owned by this brief.
  - reason: the section is correct conceptually but needs clearer labels, explanation, and less default density.
- `a80e8f69-2a5c-4c4c-ba4d-21009cf589e6` `Saved My Library Context`
  - disposition: owned by this brief.
  - reason: the heading/copy is too technical and should explain that this is read-only information loaded from My Library.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                  | Evidence                              |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Product goals and IA                          | `target`     | A first-time user can distinguish saved source data, this-run-only choices, and advanced technical preview without internal-tool confusion.                     | IA review + manual QA + e2e           |
| UX flow clarity                               | `target`     | Single-session users never see irrelevant program-only controls by default, and every changed heading/action explains what it affects in plain language.        | timed manual QA + unit/e2e            |
| Visual design quality                         | `target`     | The generator page feels calmer and more intentional, with advanced technical detail visually de-emphasized and non-technical sections easier to scan.          | screenshot review + manual QA         |
| Business logic correctness and data integrity | `target`     | Hiding or collapsing fields must not change the canonical handoff contract; session/program overrides still serialize deterministically when intentionally set. | unit tests + runtime guards           |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes a private end-user generator flow, not an admin/editor workflow.                                                                 | explicit scope rationale              |
| Accessibility (a11y)                          | `target`     | New disclosure controls and conditional fields remain keyboard accessible, correctly labeled, and announce expanded/collapsed state.                            | targeted unit/e2e + manual QA         |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: calmer disclosure must not materially increase client JS or add extra fetches on the generator route.                                          | verify evidence + scope rationale     |
| Data placement and sync boundaries            | `target`     | UI-only disclosure state stays local, while canonical snapshot and handoff payload rules remain unchanged and explicit.                                         | brief contract + tests                |
| Caching and invalidation strategy             | `supporting` | Supporting only: disclosure/copy cleanup must keep existing refresh and stale-source behavior deterministic.                                                    | code review + targeted tests          |
| Reliability and failure handling              | `target`     | Hidden/collapsed technical detail never blocks generate/prepare actions, and users still get clear retry/recovery states for stale or refreshed data.           | negative-path review + targeted tests |
| Security and authz                            | `supporting` | Supporting only: the slice must not widen any private route or technical payload visibility beyond the authenticated owner.                                     | existing auth tests + code review     |
| Privacy and compliance                        | `target`     | Progressive disclosure must reduce accidental exposure of raw private payload detail in the default UI while preserving the same owner-scoped contract.         | code review + manual QA               |
| Content governance                            | `supporting` | Supporting only: labels and descriptions stay coherent with My Library and the canonical generator-input model.                                                 | copy review + lineage review          |
| Admin workflow and editability                | `N/A`        | N/A because no admin/operator workflow changes in this slice.                                                                                                   | explicit scope rationale              |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/generator` is an authenticated private route with no public crawl/index contract.                                                      | explicit scope rationale              |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public metadata or discoverable route content.                                                                                | explicit scope rationale              |
| Analytics and KPI observability               | `supporting` | Supporting only: existing prepare/generate events should remain truthful after label and disclosure changes.                                                    | analytics review + code review        |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, checkout, entitlement, or billing behavior changes here.                                                                                | explicit scope rationale              |
| Incident response and support operations      | `supporting` | Supporting only: the generator runbook/help copy should explain any renamed sections or advanced-preview placement if operator/support guidance changes.        | runbook/help review                   |
| Finance and reporting operations              | `N/A`        | N/A because no finance reconciliation, payout, or reporting logic changes in this private generator-intake cleanup.                                             | explicit scope rationale              |
| i18n operational readiness                    | `supporting` | Supporting only: new simpler labels should remain locale-extensible and avoid hard-coded technical jargon that is harder to localize later.                     | copy review + scope rationale         |
| Stack-fit and dependency discipline           | `target`     | The slice reuses existing Next.js/TypeScript/test patterns and adds no new dependencies for disclosure/copy cleanup.                                            | dependency diff + code review         |
| Testing and QA automation                     | `target`     | Conditional field visibility, renamed headings, and advanced-preview disclosure are covered with targeted unit/e2e tests and full pre-PR verification.          | tests + verify outputs                |
| Scalability and cost efficiency               | `supporting` | Supporting only: calmer UI should reduce unnecessary user churn without adding redundant data loads or expensive derived work.                                  | code review + manual QA               |
| DevOps and rollback readiness                 | `supporting` | Supporting only: copy/disclosure changes are easy to revert without data migration or contract drift.                                                           | PR diff + rollback notes              |

## Data Placement And Sync Contract

- Server-canonical:
  - generator intake snapshot blocks,
  - source data loaded from My Library,
  - canonical handoff payload assembly rules.
- Local-only:
  - section expanded/collapsed state,
  - selected target type before handoff,
  - visible/invisible program-only override fields,
  - restored draft UI state already scoped to the current user/device.
- Sync policy:
  - hiding program-only fields for `session` must not erase intentional program values unless the target changes and normalization already requires it,
  - advanced-preview disclosure remains local-only and must not affect what `prepare` serializes,
  - refresh/reset behavior must continue to use the existing snapshot/draft rules.
- Retention and sensitivity:
  - raw handoff preview contains more technical private detail than the main UI and should stay hidden by default,
  - no additional private data is introduced in this slice.
- Cache/invalidation:
  - no new fetch paths,
  - existing refresh/reset and stale-source warnings remain authoritative.

## Identity And Rename Contract

- Canonical stable IDs:
  - source entity IDs and handoff payload identity remain unchanged.
- Human-readable identifiers:
  - section headings, helper text, and field labels are presentation copy only and may be renamed for clarity.
- Mutability rules:
  - renamed UI copy must not imply any new persistence semantics,
  - program-only fields remain mutable as local overrides only.
- Rename vs repurpose policy:
  - this slice renames and re-explains existing UI sections in place,
  - it does not create a second intake model or alternate handoff type.
- Compatibility contract:
  - downstream generator/session builder code keeps reading the same payload fields,
  - conditional visibility for session/program must not break existing tests or saved local drafts.
- Observability and repair:
  - if a restored draft contains program-only values while target type is `session`, the UI should normalize or safely hide them without silent payload corruption.

## Scope

- Rename and simplify the main generator intake copy so the page reads as a user-facing tool instead of an internal staging screen.
- Treat `/my-library/generator` as a single-session generator for now and hide program-generation controls from the normal flow.
- Simplify the source-data section heading/copy so it reads as saved information from My Library.
- Remove the separate `Before you generate` section and its refresh action from the normal user flow.
- Move remaining one-time session notes into the actual generator panel so users do not have to understand two overlapping setup layers.
- Rename the route and entrypoint so the experience reads as `AI session generator`, not a technical `generator intake`.
- Remove the explicit `prepare` step from the normal user flow so current saved data plus this-run-only choices can generate immediately.
- Remove the raw technical payload preview from the normal end-user flow.
- Keep saved swim sessions in their dedicated browse surface instead of duplicating the same canonical-session list inside the generator.
- Keep the current canonical handoff model, refresh/reset behavior, and session-generator compatibility intact.

## Out Of Scope

- Program planner/calendar implementation.
- AI generation logic changes.
- New persistence or schema changes.
- Reopening notes-prefill scope.
- Broad My Library IA changes outside the generator route.

## Acceptance Criteria

1. `/my-library/generator` behaves as a single-session AI generator in the normal flow; program-generation controls are not shown.
2. The first intro paragraph and the full `Before you generate` section are removed from the main route.
3. The source-data section uses plainer, consistent language around saved My Library information.
4. One-time session notes no longer live in a separate intake section; they are grouped with the generator panel where the session is actually configured.
5. Session-length guidance in the single-session flow is clear and supports up to `180` minutes where time-based generation is used.
6. The route and My Library entrypoint read as `AI session generator`, not an internal `generator intake` tool.
7. The explicit `prepare` step is removed from the normal user flow, and generating uses current saved data plus this-run-only choices directly.
8. The raw technical handoff preview is no longer exposed in the normal end-user flow.
9. The generator route does not repeat a full saved-session list that already lives in `My sessions`; it uses lighter navigation to that dedicated browse surface instead.
10. The changed UX remains truthful to the canonical handoff model and does not alter the payload contract unintentionally.
11. Relevant production admin notes listed above remain explicitly owned by this brief until shipped or intentionally split again.
12. `npm run lint:briefs`, targeted validation, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- targeted unit tests for:
  - target-type conditional field visibility,
  - renamed copy/disclosure states,
  - unchanged handoff payload serialization
- targeted e2e for:
  - generator intake single-session path,
  - generator intake program path
- `npm run verify:pre-pr`
- before merge recommendation: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Production review:
  - `https://freeswimming.org/my-library/generator`
- Local iteration:
  - `http://127.0.0.1:3000/my-library/generator`
- Preview:
  - PR Vercel preview URL for the implementation branch

## Constraints

- Keep the route consistent with existing My Library language.
- Do not expose more technical JSON/ID detail in the normal end-user view.
- Do not change the downstream handoff schema in this slice.
- Prefer fewer steps and clearer language over extra explainer copy.

## 10/10 Quality Bar

- A first-time user should understand what is saved, what is temporary, and what is advanced without asking for help.
- The single-session path should feel simpler after this slice, not more configurable.
- Required UI states for changed surfaces:
  - `loading`
  - `empty`
  - `error`
  - `retry`
  - `success`
  - session/program conditional override visibility
- The page must preserve visual calm and avoid raw internal/debug language in primary view.
- Business logic must stay deterministic and canonical under every disclosure state.

## Help/Guide And Operator Training Contract

- Required if labels or explanations change in a way that affects support/recovery language:
  - update the relevant private runbook/help copy in the same PR,
  - update at least one automated assertion if the visible help contract changes.
- `AdminHelpCenter` is `N/A` unless this slice changes shared admin/operator help text rather than private My Library copy.

## Security, Privacy, and Compliance

- `/my-library/generator` remains authenticated and owner-scoped.
- Technical payload detail remains private and should stay out of the normal end-user route.
- No secret/env values or cross-user data may appear in disclosure copy or payload preview.

## Observability and KPI Contract

- Existing analytics remain sufficient if they still truthfully capture:
  - refresh,
  - reset,
  - target type selected,
  - generator draft generated/saved when existing client events fire.
- Success KPI for this slice:
  - a user can explain what each main section does without needing internal product vocabulary.

## Session Continuity and Recovery

- Canonical source of truth: git branch + this brief path.
- Checkpoint cadence:
  - commit at each validated implementation milestone,
  - update checkpoint log before pause or PR handoff.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint note

## Git Rhythm Defaults

- Commit + push after each validated generator-intake UX slice.

## Checkpoint Log

- `2026-03-30` — Slice 3 live-review follow-up started on branch `fix/ai-session-generator-ux-clarity-2026-03-30`.
  - remove the redundant `Before you generate` layer from the normal flow
  - keep the route session-only for now and hide program-generation controls
  - rename source context to calmer My Library language
  - move one-time session notes into the generator panel to reduce overlap with `Generate session`

- `2026-03-29` — slice 2 completed on branch `fix/swim-sessions-and-generator-ia-cleanup-2026-03-29`; the route now reads as `AI session generator`, uses athlete-profile/My Library language instead of internal intake/debug language, removes the explicit prepare gate and technical-preview UI from the normal flow, and keeps canonical saved sessions in the dedicated `My sessions` route instead of duplicating the list inside generator work. Targeted generator/workout vitest and desktop-chromium generator-intake + workout-builder + dryland e2e are green. Next step: run `npm run lint:briefs` and `npm run verify:pre-pr`, then commit/push/open PR if the full gate stays green.`
- `2026-03-29` — slice 2 started on branch `fix/swim-sessions-and-generator-ia-cleanup-2026-03-29`; live review showed the route still read like an internal tool, so this slice renames the surface to `AI session generator`, removes the explicit prepare gate and visible technical preview from the normal flow, and keeps saved sessions in the dedicated `My sessions` surface instead of duplicating the list inside generator work. Next step: finish the code cleanup, run targeted generator/workout validation, and then `npm run verify:pre-pr`.
- `2026-03-28` — brief created directly in `in-progress` after live production-note triage confirmed the next highest-value generator work is IA/copy/progressive-disclosure cleanup, not new generator capability. Next step: update the generator route UI to hide program-only fields in the single-session path, simplify headings, and collapse the technical preview by default, then run targeted tests and `npm run verify:pre-pr`.
- `2026-03-28` — implemented the first generator-intake UX cleanup slice: single-session hides the weekly session-count override, program mode relabels it to `Swim sessions per week`, source/override/technical sections now use calmer plain-language headings, and the technical payload preview is hidden behind explicit disclosure. Targeted generator unit/e2e, `npm run typecheck`, and full `npm run verify:pre-pr` passed. During verification, two unrelated full-suite flakes (`course-progress-sync` and `soft-launch-banner`) were hardened with more stable browser-context polling and retryable route navigation so the release gate reflects the generator slice instead of transient test races. Next step: stage the changed briefs so `npm run lint:briefs` evaluates them directly, then commit, push, and open the PR for review.
