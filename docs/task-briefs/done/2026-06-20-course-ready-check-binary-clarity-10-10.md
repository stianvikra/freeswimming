# Task Brief: Course Ready Check Binary Clarity (10/10)

## Metadata

- `id`: `2026-06-20-course-ready-check-binary-clarity-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-20`
- `updated`: `2026-06-20`
- `execution_mode`: `end-to-end implementation with visual approval stop before pre-PR gate`
- `parent`: `docs/task-briefs/planned/2026-06-18-course-lesson-pass-criteria-scoring-decision-10-10.md`
- `branch`: `feat/course-ready-check-clarity`

## Brief Audit Record

- `last_audited`: `2026-06-20`
- `base`: `main@f66a9525`
- `audit_status`: `ready`
- `decision`: Execute a small UI-only child that clarifies the existing binary Ready check model without scoring.
- `reason`: The pass-criteria decision brief recommends keeping binary criteria for now. Current progress, tests, and analytics use lesson-level `done` plus local checklist checks, so percent, weights, and scoring remain deferred.
- `must_refresh_before_execution_if`: Refresh if `app/course/page.tsx`, `lib/course/progress-status.ts`, course progress API/storage, course analytics, course lesson data shape, screenshot handoff rules, scorecard categories, or verification lanes change before implementation finishes.

## Goal

Make the public course Ready check easier to understand while preserving the current binary completion model.

## Pre-Implementation Owner Explanation

Vi endrer ikke hva "ferdig" betyr. Vi gjør dagens Ready check tydeligere: brukeren ser om leksjonen ikke er startet, er i gang, er klar til å markeres ferdig, eller allerede er ferdig.

Hvorfor det betyr noe: Dette løser friksjon rundt Pass criteria uten å innføre prosent, poeng, vekting eller nye dataregler som kan bli misvisende.

Utenfor scope: scoring, prosent, farger som betyr score, vekting, databaseendringer, analytics-endringer, admin editor-endringer, progress-API-endringer, nye completion-regler, og merge uten eksplisitt owner approval.

Fremoverkompatibilitet: nye tekstbaserte pass criteria skal fortsatt fungere automatisk i dagens binære modell. Hvis scoring senere ønskes, krever det egen brief med kriterie-IDer, vekter, fallback, migration/backfill og tester.

## Codex Skill + Stack Readiness Radar

Capability audit:

| Capability                         | Evidence                                              | Current Status | Recommended Trigger                                             | Boundary                                                       |
| ---------------------------------- | ----------------------------------------------------- | -------------- | --------------------------------------------------------------- | -------------------------------------------------------------- |
| `playwright`                       | `/Users/stianvikra/.codex/skills/playwright/SKILL.md` | `installed`    | Screenshot handoff and browser validation for public course UI. | Does not replace owner screenshot approval before pre-PR gate. |
| `imagegen`                         | session metadata                                      | `available`    | Not needed.                                                     | No generated raster assets in this slice.                      |
| Supabase/service-role tooling      | repo env contracts                                    | `not needed`   | N/A                                                             | No database/API/admin-note mutation.                           |
| Local Codex install/config changes | current session metadata                              | `not needed`   | N/A                                                             | Do not install or configure capabilities.                      |

Systemic findings:

| Surface                 | Finding                                                                                                    | Severity | Recommended Type                 | Owner Decision Needed                   | Follow-Up Brief Path                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- | -------- | -------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------- |
| Course completion model | Existing progress is binary lesson completion plus local criteria checks.                                  | `medium` | `bounded implementation child`   | `no` for UI clarity; `yes` for scoring. | this brief                                                                                  |
| Pass-criteria scoring   | Percent/weighted scoring would require criterion identity, persistence, fallback, and analytics semantics. | `high`   | `deferred architecture decision` | `yes`                                   | `docs/task-briefs/planned/2026-06-18-course-lesson-pass-criteria-scoring-decision-10-10.md` |
| Screenshot workflow     | Course UI is visual and responsive, so full-resolution artifacts are required before PR gates.             | `medium` | `safe process/docs update`       | `no`                                    | this brief                                                                                  |

Return path:

- Parent decision brief remains planned and records scoring as deferred unless the owner later selects a scoring model.
- This child owns only the non-scoring public course Ready check clarity change.
- After screenshot approval, continue normal automation: targeted tests, `npm run verify:pre-pr`, commit, push, PR, CI, `npm run verify:pre-merge`, and merge-readiness summary.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for this slice: Product goals and IA, UX flow clarity, Visual design quality, Business logic correctness and data integrity, Accessibility (a11y), Reliability and failure handling, Testing and QA automation, DevOps and rollback readiness.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                  | Evidence                                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Ready check communicates the existing binary completion path without introducing score semantics.                                                   | screenshot review + e2e assertions                        | `5/5`                   |
| UX flow clarity                               | `target`     | User can distinguish not-started, in-progress, ready-to-complete, and done states from the Ready check card.                                        | browser QA + tests                                        | `5/5`                   |
| Visual design quality                         | `target`     | Ready check remains compact, readable, and aligned with the existing course visual language on mobile and desktop.                                  | screenshot handoff                                        | `5/5`                   |
| Business logic correctness and data integrity | `target`     | No change to completion persistence, local checklist normalization, API payloads, or done semantics.                                                | code diff review + existing progress tests                | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice does not change admin editing, content fields, publish controls, or admin workflows.                                         | explicit admin no-change review                           | `N/A`                   |
| Accessibility (a11y)                          | `target`     | New visible status/help copy remains text-based, keyboard-safe, and correctly associated with the existing controls.                                | Testing Library/Playwright assertions + screenshot review | `5/5`                   |
| Accessibility                                 | `target`     | Lifecycle-lint alias for the canonical `Accessibility (a11y)` gate; same threshold and evidence.                                                    | Testing Library/Playwright assertions + screenshot review | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no dependency, media, route, or data-fetch expansion; keep client impact negligible.                                               | dependency diff + build/pre-pr gate                       | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical progress remains lesson-level done state; local criteria checks stay local unlock state.                                           | diff review + progress tests                              | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache, revalidation, CDN, or browser-cache behavior changes.                                                                   | explicit cache no-change review                           | `N/A`                   |
| Reliability and failure handling              | `target`     | Loading, blocked, ready, done, and undo states remain deterministic with clear fallback copy.                                                       | e2e state assertions                                      | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no protected route or authz change; completion writes continue through existing progress contract.                                 | route/API diff review                                     | `4/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no personal data, logging, analytics payload, or private admin/member data exposure changes.                                       | diff review                                               | `4/5`                   |
| Content governance                            | `target`     | User-facing Ready check copy avoids false precision and does not claim durable score or mastery.                                                    | copy review + screenshots                                 | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin labels, actions, recovery behavior, or Help/Guide workflow changes.                                                            | explicit admin workflow no-change rationale               | `N/A`                   |
| SEO and crawlability                          | `supporting` | Supporting only: public course content markup remains crawlable; no metadata, sitemap, robots, or canonical changes.                                | route/metadata diff review                                | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: public lesson text remains visible and truthful; no schema or crawler-policy changes.                                              | markup diff review                                        | `4/5`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no event taxonomy or KPI payload change; existing completion analytics meaning remains binary.                                     | analytics diff review                                     | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no products, checkout, entitlements, pricing, invoices, payouts, refunds, or revenue truth.                          | explicit commerce no-change rationale                     | `N/A`                   |
| Incident response and support operations      | `supporting` | Supporting only: clearer public copy may reduce support confusion; no support runbook or recovery path changes.                                     | Help/Guide impact review                                  | `4/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no billing provider data, finance reports, payout, refund, invoice, accounting export, entitlement grant, or revenue reporting changes. | explicit finance no-change rationale                      | `N/A`                   |
| i18n operational readiness                    | `target`     | New copy stays short, status-based, and layout-safe for future locale expansion.                                                                    | screenshot review + copy review                           | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing course page state, helpers, icons, and Tailwind tokens; add no dependency or parallel renderer.                                      | dependency diff + code review                             | `5/5`                   |
| Testing and QA automation                     | `target`     | Update targeted coverage for Ready check clarity and run focused tests before screenshot handoff.                                                   | targeted Vitest/Playwright results                        | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no new network calls, storage fanout, or route generation; future criteria remain data-driven from lesson content.                 | diff review                                               | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Change is one reversible UI patch plus tests; visual approval happens before release gates.                                                         | git diff + gates + screenshot artifacts                   | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surface: reuse the existing Ready check and course lesson progress status surface in
    `app/course/page.tsx`; keep the same `docs/user-flow-map.md` contract where `Ready check` is the
    header shortcut/status and `Mark as done` / `Done` owns the binary completion action.
  - Reuse `app/course/page.tsx` and existing Ready check state rather than creating a parallel renderer.
  - Keep this as client UI state only; do not touch route handlers, metadata, or cache behavior.
- TypeScript/domain:
  - Preserve `CourseLessonProgressStatus` as `not_started | in_progress | done`.
  - Treat `ready_to_complete` as UI-derived from all criteria checked, not a new persisted status.
- Supabase/data:
  - No schema, RLS, generated type, storage, or migration changes.
- UI system:
  - Reuse existing course card/tokens and lucide icons already used by the course page.
  - Screenshot handoff must include mobile and desktop after-state, plus reference where useful.
- Testing:
  - Update targeted e2e expectations around Ready check help/status.
  - Run focused course tests before screenshot handoff.

## Data Placement And Sync Contract

- Server-canonical data: existing lesson-level progress rows and `done` state remain canonical.
- Local/browser data: checked pass criteria remain local unlock/checklist state until the user marks the lesson done.
- Sync policy: unchanged; marking done writes existing lesson-level progress only.
- Retention and sensitivity: unchanged; no new personal/sensitive data is collected.
- Cache/invalidation: unchanged; no route cache or API cache behavior changes.

## Identity And Rename Contract

- Canonical stable IDs: existing lesson IDs remain the only persisted course progress identity.
- Human-readable identifiers: pass-criteria text remains display content and is not promoted to stable scoring identity.
- Mutability rules: criteria text can still change as content copy; it is not a score entity.
- Rename vs repurpose: scoring or durable per-criterion mastery requires a future criterion identity contract.
- Compatibility: existing checklist normalization and legacy fallback behavior remain in place.
- Observability and repair: unknown/deprecated scoring values remain out of scope because scoring is not implemented.

## Forward Compatibility Contract

- Extensibility surfaces: pass criteria text, course progress states, Ready check copy, future locales.
- Source of truth: pass criteria derive from lesson content and existing defaults.
- Additive behavior: new text criteria automatically appear in the Ready check and use the same binary unlock behavior.
- Explicit mapping requirements: scoring, percentages, weights, criterion IDs, analytics score payloads, and color-score semantics require a separate owner-approved brief.
- Unknown or deprecated values: no score values are accepted; the UI falls back to the binary checklist/done model.
- Test/evidence: targeted Ready check tests and screenshot handoff prove the active slice is not hardcoded to one lesson only.

## Scope

- Public course Ready check card in `app/course/page.tsx`.
- Targeted Ready check/pass-criteria tests.
- This in-progress brief and closeout evidence.
- Screenshot handoff artifacts for changed course surface.

## Out Of Scope

- Percent, score, weighting, or per-criterion persistence.
- Course progress API, Supabase schema, migrations, analytics events, admin editor, metadata, sitemap, private gate, checkout, pricing, products, and support runbooks.
- Admin dashboard changes.
- Performance budget ratchet.
- `Ja.docx`.

## Acceptance Criteria

1. Ready check shows a clear non-scored status for the existing binary flow.
2. `Mark as done` remains disabled until all criteria are checked.
3. Done and undo behavior stays unchanged.
4. No persisted data/API/analytics/schema change is introduced.
5. Targeted tests cover the visible clarity change.
6. Screenshot handoff is captured and approved before `npm run verify:pre-pr`.

## Validation

- `npm run lint:briefs`
- targeted unit/e2e tests for course Ready check behavior
- screenshot handoff before pre-PR gate
- `npm run verify:pre-pr` after screenshot approval
- PR CI required checks
- `npm run verify:pre-merge` before merge recommendation

## Completion Record

- `merged_pr`: `#1184`
- `merge_commit`: `bdf151d1`
- `completed`: `2026-06-20`
- `result`: Public course Ready check now shows a clear non-scored status/helper for not-started, in-progress, ready-to-complete, and done states while preserving the existing binary lesson completion model.
- `validation`: targeted `npx playwright test tests/e2e/course-pass-criteria-visibility.spec.ts --project=desktop-chromium` PASS; `npm run verify:pre-pr` PASS on `a930e3e1` (`artifacts/test-runs/20260620-023215`, full-public lane); GitHub required checks PASS for PR #1184; `npm run gate:pre-merge` PASS on `a930e3e1` with `verify:pre-merge` marker `artifacts/verify-pre-merge/20260620-003944.json`.
- `screenshot_handoff`: PASS; [Screenshot artifacts](/Users/stianvikra/freeswimming/output/course-ready-check-2026-06-20-020022), captured `2026-06-20 02:01`, owner approved in chat, and no product-rendering files changed after capture.
- `preview_qa`: Waived by owner on `2026-06-20`; Vercel deployment/check was green, but preview `/course` rendered the Next error boundary because preview runtime lacked `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Local screenshot QA, CI, and pre-merge gates were used as release evidence for this UI-only slice.
- `perf_budget_decision`: `hold`; `test:perf:budgets` passed and recommended `tighten`, but the planned performance ratchet remains deferred until at least two new green weekly cycles after `2026-06-19`.
- `10/10 claim`: yes for the Course Ready Check Binary Clarity UI-only scope. Scoring, percentages, weights, persisted criterion identity, analytics score payloads, and admin editor changes remain intentionally out of scope.

Critical target categories for `10/10` claim all achieved `5/5`:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
- Reliability and failure handling
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Achieved Score | Evidence                                                                                                                         | Remaining Gap                                                                                     |
| --------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | Ready check communicates existing binary completion with no score, percent, or weighting claim.                                  | Scoring remains deferred to the parent decision brief.                                            |
| UX flow clarity                               | `5/5`          | Screenshots and E2E assertions cover not-started, in-progress, ready-to-complete, done, and undo states.                         | None for binary clarity scope.                                                                    |
| Visual design quality                         | `5/5`          | Owner-approved mobile/desktop screenshot handoff shows compact status/helper and checked-row treatment.                          | None.                                                                                             |
| Business logic correctness and data integrity | `5/5`          | Diff changes only derived UI copy/styling and tests; completion persistence, API payloads, and done semantics unchanged.         | No persisted per-criterion data by design.                                                        |
| Accessibility (a11y)                          | `5/5`          | New state is visible text near existing controls; Playwright verifies user-observable state without hidden-only cues.            | None.                                                                                             |
| Accessibility                                 | `5/5`          | Same accessibility closeout gate as the canonical `Accessibility (a11y)` row; the explicit alias satisfies lifecycle validation. | None.                                                                                             |
| Data placement and sync boundaries            | `5/5`          | Server-canonical progress stays lesson-level done; local pass criteria remain local checklist state.                             | None for this slice.                                                                              |
| Reliability and failure handling              | `5/5`          | Loading, blocked, ready, done, and undo states remain deterministic and covered by targeted E2E assertions.                      | None.                                                                                             |
| Content governance                            | `5/5`          | Copy avoids false precision and explicitly preserves non-scored binary readiness semantics.                                      | None.                                                                                             |
| i18n operational readiness                    | `5/5`          | Short status/helper copy fits mobile screenshots and does not depend on hardcoded score language.                                | Future locale rollout still needs normal translation workflow.                                    |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing `app/course/page.tsx` state, Tailwind tokens, icons, and test surface; no dependency added.                      | None.                                                                                             |
| Testing and QA automation                     | `5/5`          | Targeted E2E, full `verify:pre-pr`, GitHub CI, and full local `gate:pre-merge` passed on the PR head.                            | None.                                                                                             |
| DevOps and rollback readiness                 | `5/5`          | One squash commit can be reverted; CI and local merge gates passed; Vercel preview QA waiver is recorded.                        | Preview env missing `NEXT_PUBLIC_SUPABASE_ANON_KEY` is an environment follow-up, not a slice gap. |

## Help / Guide Impact

N/A for admin Help/Guide because this slice changes no admin workflow labels, support recovery behavior, or operator runbook steps. Public course visible copy is tested in the changed route.

## Screenshot Handoff Plan

- Comparison type: `after/reference` unless a local before-state is needed during implementation.
- Required after-state screenshots:
  - mobile Ready check before criteria are complete,
  - mobile Ready check after all criteria are checked,
  - desktop Ready check with the course outline visible.
- Store artifacts under `output/course-ready-check-YYYY-MM-DD-HHMMSS`.

## Route / Label / Support Surface Sweep

Run a targeted sweep for `Ready check`, `Pass criteria`, `Mark as done`, `Ready to complete`, `In progress`, `Done`, and `course-pass-criteria` before pre-PR gate. Update tests/docs only if this slice changes a contract beyond local UI copy.

Identifiers searched: `Ready check`, `Pass criteria`, `Mark as done`, `Ready to complete`, `In progress`, `Done`, `course-pass-criteria`.

Surfaces checked: `app/`, `components/`, `lib/`, `tests/`, `docs/user-flow-map.md`, `docs/decisions/`, and active/planned/in-progress task briefs. Fallout handled: existing user-flow-map contract remains aligned; no Help/Guide, admin workflow, support runbook, metadata, sitemap, API, analytics, or route contract update is required.

## Checkpoint Log

- `2026-06-20 | in-progress | owner approved deferring scoring and implementing a UI-only Ready check clarity slice; branch created from clean synced main@f66a9525 | next: implement scoped UI patch and targeted tests, then screenshot handoff before pre-PR gate`
- `2026-06-20 | implementation checkpoint | added a visible non-scored Ready check status/helper, clearer checked-row styling, and targeted e2e assertions for not started, in progress, ready to complete, done, and undo states; no progress API, persistence, analytics, admin editor, metadata, or scoring changes; validation passed: npm run lint:briefs:all, Prettier check, npx eslint app/course/page.tsx tests/e2e/course-pass-criteria-visibility.spec.ts, and npx playwright test tests/e2e/course-pass-criteria-visibility.spec.ts --project=desktop-chromium; route/label sweep found the existing user-flow contract still aligned | screenshots: output/course-ready-check-2026-06-20-020022 | next: owner visual approval before npm run verify:pre-pr`
- `2026-06-20 | pre-pr gate fix | npm run verify:pre-pr initially failed quality-gate evidence because the brief did not explicitly name sweep identifiers/surfaces or the UI reference surface; added those evidence lines without changing runtime/UI files after screenshot capture | next: rerun npm run verify:pre-pr`
- `2026-06-20 | merged | PR #1184 merged as bdf151d1 after green local gates, green GitHub checks, owner-approved screenshot handoff, and explicit Vercel preview QA waiver; post-merge preflight moved this brief to done and recorded completion evidence | next: validate docs-only closeout PR`
