# Task Brief: AI Swim Coach Roadmap Alignment (10/10)

## Metadata

- `id`: `2026-05-01-ai-swim-coach-roadmap-alignment-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-01`
- `updated`: `2026-05-08`

## Closeout Status

This docs-only roadmap alignment shipped in PR `#564`, merged to `main` as `f9e0cda` on `2026-05-01`. This lifecycle closeout moves the brief to `done` after the merged work was found still listed under `in-progress`.

## Goal

Align the AI swim-session, AI program, manual program-builder, and training-history briefs so V1 can stay small while V2/V3 coaching, calendar, history, and feedback ideas remain preserved in the roadmap.

## Why This Brief Exists

- Owner review on `2026-05-01` clarified that AI coaching should eventually cover:
  - one-session generation,
  - user/profile context,
  - drill/kick/rest coach decisions,
  - weekly/multi-session planning,
  - planned-vs-actual program history,
  - Garmin/manual completion feedback,
  - adaptive coaching for real-life schedule changes.
- The next implementation should still be AI Swim Session V1, not a large calendar/history/program build.
- This docs-only slice preserves the bigger product direction in the right parent briefs before implementation starts.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in closeout:

- Product goals and IA
- UX flow clarity
- Business logic correctness and data integrity
- Data placement and sync boundaries
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                               | Evidence                         | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Briefs clearly separate AI Session V1 from future AI program/history/calendar work while preserving one coherent coach roadmap.                  | brief diff + owner scope review  | `5`                     |
| UX flow clarity                               | `target`     | Roadmap documents one-session V1, later weekly-pattern/full-AI program entrypoints, and planned-vs-actual history without competing user models. | brief diff                       | `5`                     |
| Visual design quality                         | `N/A`        | N/A because this docs-only alignment changes no UI, layout, or visual assets.                                                                    | explicit docs-only rationale     | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Parent briefs preserve one canonical session/program/history model and forbid AI-only duplicate planning truth.                                  | data-contract wording review     | `5`                     |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin/editor workflow is changed.                                                                                                 | explicit docs-only rationale     | `N/A`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: future UI briefs must keep controls accessible, but this slice changes no user-facing surface.                                  | scope rationale                  | `4`                     |
| Performance (CWV + payloads)                  | `N/A`        | N/A because this docs-only slice changes no runtime, routes, bundles, or requests.                                                               | explicit docs-only rationale     | `N/A`                   |
| Data placement and sync boundaries            | `target`     | V1 vs V2/V3 ownership is explicit: V1 draft generation stays separate from future calendar/history/Garmin completion truth.                      | brief diff                       | `5`                     |
| Caching and invalidation strategy             | `supporting` | Supporting only: future accepted-session/program/history mutations must define invalidation in their implementation briefs.                      | scope rationale                  | `4`                     |
| Reliability and failure handling              | `supporting` | Supporting only: roadmap preserves future failure states such as mismatch, skipped sessions, provider conflicts, and AI failure.                 | brief diff                       | `4`                     |
| Security and authz                            | `supporting` | Supporting only: future implementation briefs still own endpoint authz and negative-path tests.                                                  | scope rationale                  | `4`                     |
| Privacy and compliance                        | `supporting` | Supporting only: roadmap calls out profile/history/Garmin context as future sensitive inputs without changing data flow now.                     | brief diff                       | `4`                     |
| Content governance                            | `target`     | Course-aligned drills, profile save-back, program history, and future feedback are assigned to explicit owner/source-of-truth briefs.            | brief diff                       | `5`                     |
| Admin workflow and editability                | `N/A`        | N/A because this slice introduces no admin publishing or editing workflow.                                                                       | explicit scope rationale         | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because authenticated AI/program/history briefs do not change public crawl surfaces in this docs-only slice.                                 | explicit scope rationale         | `N/A`                   |
| AI discoverability                            | `supporting` | Supporting only: this governs private AI coaching roadmap, not public AI-discoverable content.                                                   | scope rationale                  | `4`                     |
| Analytics and KPI observability               | `supporting` | Supporting only: future generate/accept/complete/skip events should remain measurable, but no event contract changes ship here.                  | scope rationale                  | `4`                     |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, entitlement, billing, invoice, refund, or revenue workflow is changed.                                                  | explicit scope rationale         | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: future provider/history conflict handling should leave support-visible diagnostics; this docs-only slice does not add tooling.  | scope rationale                  | `4`                     |
| Finance and reporting operations              | `N/A`        | N/A because this docs-only roadmap alignment has no finance, reporting, ledger, payout, refund, or reconciliation impact.                        | explicit finance scope rationale | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: future coach labels and outcome states should remain locale-extensible; no localization implementation changes here.            | scope rationale                  | `4`                     |
| Stack-fit and dependency discipline           | `target`     | Docs-only PR adds no dependencies and keeps implementation sequencing compatible with existing Next/TypeScript/Supabase stack.                   | package diff review              | `5`                     |
| Testing and QA automation                     | `target`     | Changed briefs pass brief lint and docs-only verification before PR handoff.                                                                     | `npm run verify:pre-pr`          | `5`                     |
| Scalability and cost efficiency               | `supporting` | Supporting only: roadmap defers costly multi-session/history/Garmin/AI feedback work until the lower-risk V1 is stable.                          | scope rationale                  | `4`                     |
| DevOps and rollback readiness                 | `supporting` | Supporting only: docs-only change has no runtime rollback need; future AI features must keep disable/rollback paths in their briefs.             | scope rationale                  | `4`                     |

## Data Placement And Sync Contract

N/A for this docs-only alignment because no runtime state, API, database table, cache, or persisted entity changes in this PR.

The aligned briefs still assign future state ownership:

- AI Session V1: provisional one-session draft until explicit accept/save.
- Program Builder: planned program assignments and schedule review.
- Training History: canonical completed/cancelled/moved/partial outcome truth.
- Future AI Program: generated proposals that converge into the canonical Program Builder after review.

## Identity And Rename Contract

N/A for this docs-only alignment because no new persisted entity or linkable route is introduced.

The aligned briefs preserve future identity rules:

- no AI-only workout identity separate from canonical workouts,
- no AI-only program identity separate from canonical programs,
- no planner-local completion truth separate from canonical training history,
- no silent overwrite of planned program truth when actual completion differs.

## Scope

- Update AI Session Generator V1 brief with:
  - technical fault correction,
  - drill/kick meter preferences or `Coach decides`,
  - rest preference or `Coach decides`,
  - FreeSwimming course-aligned drill defaults,
  - Swim Profile mismatch/save-back choice,
  - generated coach rationale,
  - explicit V2/V3 deferrals.
- Update AI Plan Generator parent brief with:
  - one canonical Program Builder,
  - manual, weekly-pattern, and AI-assisted program entrypoints,
  - full AI program planning deferral until prerequisites are stable.
- Update Program Builder parent brief with:
  - one canonical manual planner,
  - future weekly-pattern entrypoint,
  - planned vs actual handoff to history.
- Update Training History parent brief with:
  - planned vs actual states,
  - completed on another day,
  - partly completed,
  - skipped/cancelled,
  - moved forward,
  - future AI feedback/adaptive replanning readiness.

## Out Of Scope

- Runtime code changes.
- UI changes.
- Database migrations.
- AI endpoint or prompt implementation.
- Calendar implementation.
- Garmin import or feedback implementation.
- Program-builder feature implementation.
- Training-history feature implementation.

## Acceptance Criteria

1. AI Session V1 brief captures the new V1-level coach inputs without expanding V1 into program/history/calendar scope.
2. Parent AI plan brief preserves the future manual/weekly-pattern/AI-assisted program roadmap using one canonical Program Builder.
3. Program builder brief clearly separates planned schedule state from actual completion/history truth.
4. Training history brief captures planned-vs-actual outcome states needed for real-life schedule changes.
5. Changed briefs remain scorecard-complete and pass local docs-only gates.

## Validation

- `npm run lint:briefs`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js and npm from the repo runtime are available locally.
- This is a docs-only change; no browser or screenshot handoff is required.

## Manual QA Environments

N/A because this PR changes only task-brief documentation and does not change UI, runtime routes, browser behavior, or deployment behavior.

## Constraints

- Keep V1 implementation scope small after this PR:
  - one AI-generated swim-session draft,
  - review/edit/save,
  - no calendar,
  - no history implementation,
  - no Garmin import,
  - no multi-session generation.
- Preserve all broader owner ideas in parent briefs so future work can be scoped deliberately.
- Do not create a second AI-only program or history system.

## Debugging And Handoff Contract

- No UI debugging or screenshot handoff required.
- If docs-only validation fails, fix the changed briefs rather than weakening the lint gate.

## 10/10 Quality Bar

- V1 is immediately buildable as a focused slice.
- V2/V3 ideas are not lost and are assigned to the right parent briefs.
- Program planning and completion history remain separate truths.
- The roadmap supports real-life schedule flexibility without making V1 too broad.

## Checkpoint Log

- `2026-05-01 | in-progress | created docs-only roadmap-alignment brief and updated AI session, AI program, program-builder, and training-history briefs with owner coaching, calendar, and planned-vs-actual requirements | next: run docs-only validation, commit, push, and open PR`
- `2026-05-01 | validation | docs-only validation passed: npm run lint:briefs:all PASS, npm run verify:pre-pr selected docs-only lane and PASS | next: commit, push, open PR, then run verify:pre-merge before merge recommendation`
- `2026-05-01 | done | PR #564 merged to main as f9e0cda; roadmap alignment is shipped and implementation sequencing now points back to AI Session V1 rather than a broad calendar/history/program build | next: lifecycle closeout`
- `2026-05-08 | done | moved stale in-progress brief to done and recorded closeout scores/evidence after recovery scan found PR #564 already merged | next: validate docs-only closeout PR`
- `2026-05-08 | closeout verify | npm run verify:pre-pr passed on docs-only lane with artifact artifacts/test-runs/20260508-082636/verify.log | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge recommendation`

## Completion Record

- `merged_pr`: `#564`
- `merge_commit`: `f9e0cda`
- `completed`: `2026-05-01`
- `closeout`: `2026-05-08`
- `validation`: original docs-only roadmap PR recorded `npm run lint:briefs:all` PASS and `npm run verify:pre-pr` PASS on docs-only lane; closeout `npm run verify:pre-pr` passed on docs-only lane with artifact `artifacts/test-runs/20260508-082636/verify.log`.
- `10/10 claim`: yes for the docs-only roadmap-alignment scope; runtime AI session generation, calendar/history implementation, Garmin import, and multi-session program generation remain out of scope.

| Category                                      | Achieved Score | Evidence                                                                                                                       | Gaps / Notes |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| Product goals and IA                          | `5/5`          | AI Session V1 remains separate from future AI program, calendar, and training-history work while preserving one coach roadmap. | None.        |
| UX flow clarity                               | `5/5`          | Briefs document one-session V1, later weekly-pattern/full-AI program entrypoints, and planned-vs-actual history boundaries.    | None.        |
| Business logic correctness and data integrity | `5/5`          | Roadmap keeps one canonical session/program/history model and explicitly avoids AI-only duplicate planning truth.              | None.        |
| Data placement and sync boundaries            | `5/5`          | V1 draft generation, future program planning, and training-history completion truth are assigned to separate canonical owners. | None.        |
| Content governance                            | `5/5`          | Course-aligned drills, profile save-back, program history, and future feedback are assigned to the appropriate parent briefs.  | None.        |
| Stack-fit and dependency discipline           | `5/5`          | Docs-only change added no dependencies and kept future implementation sequencing compatible with the existing stack.           | None.        |
| Testing and QA automation                     | `5/5`          | Original docs-only PR recorded `npm run lint:briefs:all` PASS and `npm run verify:pre-pr` PASS; closeout pre-PR gate passed.   | None.        |
