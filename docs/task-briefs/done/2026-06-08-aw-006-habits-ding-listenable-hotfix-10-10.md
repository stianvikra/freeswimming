# Task Brief: AW-006 Habits Ding Listenable Hotfix (10/10)

## Metadata

- `id`: `2026-06-08-aw-006-habits-ding-listenable-hotfix-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-08`
- `updated`: `2026-06-08`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `branch`: `hotfix/habits-ding-listenable-artifact`
- `target_findings`: `H-059 + owner-requested Habits feedback/label/list-density fixes`
- `execution_mode`: `implementation with owner audio approval stop before PR gates`

## Brief Audit Record

- `last_audited`: `2026-06-08`
- `base`: clean synced `main@776e1254`
- `audit_status`: `closed`
- `decision`: Closed as a narrow Habits hotfix before any new feature slice.
- `reason`: PR `#1025` replaced the rejected synthetic Habits ding with the owner-selected bundled MP3 asset, moved `Slip logged.` into the local habit notice surface, expanded Motivation Stats week context, and collapsed long `Past habits` history behind `See all`.
- `must_refresh_before_execution_if`: Refresh if `lib/audio/client-sound.ts`, `lib/audio/app-sound-profiles.json`, `HabitPerfectDayHub`, audio tests, browser-audio behavior, or the owner-requested target sound changes before approval.

## Goal

Habits plays the owner-selected short notification-style MP3 ding, keeps slip feedback inside the relevant habit container, shows Motivation Stats week context with week number plus full week date range, and keeps long `Past habits` lists collapsed to the three newest entries until `See all`.

## Pre-Implementation Owner Explanation

Vi lager en ren Habits-hotfix. Det viktigste er at appen spiller den faktiske MP3-filen du valgte, at `Slip logged.` vises inne pa riktig habit-kort, at ukevisningen i Motivation Stats viser hele uka, og at lange `Past habits`-lister ikke tar over panelet.

Hvorfor det betyr noe: dette har feilet flere ganger fordi tester bare bekreftet at kode ble kalt, ikke at lyden faktisk hortes riktig ut. UI-funnene handler om at meldinger, datokontekst og lange historikklister skal dukke opp der brukeren forventer dem uten a lage stoy.

Utenfor scope er reminders, nye statistikker, bred layout-redesign, Micro Sessions, server-lagrede lydvalg, brukeropplastede lyder, dashboards, eksport, egen Past habits-side, sok/filter, bulk cleanup og andre Habits-endringer.

Fremoverkompatibilitet: fremtidige lydprofiler skal enten vaere eksplisitte statiske assets eller ligge i den delte oscillator-kontrakten; ukjente profiler feiler i TypeScript/lydlaget i stedet for a spille en gammel fallback. Nye past habits skal automatisk sorteres nyest forst og ligge bak samme `See all`-kontroll nar listen blir lang.

## Acceptance Criteria

1. Habits `positiveDing` plays the imported MP3 asset at `/sounds/ding/ding.mp3`.
2. The app playback path and the listenable approval artifact are the same file.
3. The MP3 asset is committed under `public/sounds/ding/` with owner-confirmed Pixabay/free-commercial provenance notes before `npm run verify:pre-pr`; exact source URL is not retained and is explicitly owner-waived for this hotfix.
4. Owner approves the audio artifact before commit/push/PR gates continue.
5. Targeted tests cover the asset binding, Habits playback path, and blocked-audio fail-soft path.
6. High-cost debug log records the root cause and prevention rule for future audio changes.
7. `Slip logged.` is rendered through the same local habit notice path as `Completion saved.`, not as a global notice above Admin notes/bottom navigation.
8. Motivation Stats `Week` range label includes week number and full date range, for example `This week · Week 24 · Jun 8-14, 2026`.
9. Motivation Stats `Past habits` shows the three newest archived habits first, offers `See all`/`Show less` when more exist, and makes the expanded list scrollable.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Data placement and sync boundaries`
- `Content governance`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                                        | Evidence                                | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Habits sound feedback matches the owner-requested short notification-style ding and adjacent Habits feedback/context/list-density fixes land in expected places.                                                          | owner audio approval + code diff        | `5/5`                   |
| UX flow clarity                               | `target`     | Sound opt-in behavior stays the same, slip feedback is local to the habit, Motivation Stats week context shows week number plus full week range, and `Past habits` defaults to the three newest entries with `See all`.   | MP3 asset + component tests             | `5/5`                   |
| Visual design quality                         | `target`     | The visible text/status/list-density changes reuse existing Habits card/status/action styling and require screenshot handoff before PR gates.                                                                             | screenshot handoff + code review        | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Sound/notice/range-label/list-density changes remain presentational and cannot create, update, or complete Habits check-ins.                                                                                              | HabitPerfectDayHub tests                | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor, CRUD, publish workflow, operator queue, or admin action surface changes.                                                                                                                     | explicit admin-editor scope rationale   | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Sound stays optional/default-off, local habit notices keep status semantics, Motivation Stats date context remains readable text, and `See all` exposes `aria-expanded`/`aria-controls`.                                  | component tests + code review           | `5/5`                   |
| Accessibility                                 | `target`     | Lifecycle-lint alias for canonical `Accessibility (a11y)`; same optional sound, local status, readable range-label, and expandable list contract.                                                                         | component tests + code review           | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: static MP3 asset and JSON oscillator profiles must not add runtime dependencies or route payload growth beyond the existing client bundle.                                                               | package/code diff                       | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Sound profile/asset data is static code data; sound preference remains browser-local; no server persistence or sync behavior changes.                                                                                     | code diff + tests                       | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route data, server cache, CDN behavior, or revalidation path changes.                                                                                                                                      | explicit cache scope rationale          | `N/A`                   |
| Reliability and failure handling              | `target`     | Browser audio remains fail-soft (`blocked`/`unsupported`) and Habits does not fall back to the rejected synthetic oscillator ding.                                                                                        | client sound tests                      | `5/5`                   |
| Security and authz                            | `N/A`        | N/A because no protected routes, authz checks, request inputs, secrets, or API handlers change.                                                                                                                           | explicit security scope rationale       | `N/A`                   |
| Privacy and compliance                        | `target`     | No habit names, health-adjacent data, user IDs, or analytics payloads are logged or exported by the sound change.                                                                                                         | code review                             | `5/5`                   |
| Content governance                            | `target`     | Parent, queue, and high-cost debug log record the regression and the new audio-artifact gate.                                                                                                                             | docs diff + brief lint                  | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow label, support queue action, recovery action, or operator-visible admin state changes.                                                                                                      | explicit admin workflow scope rationale | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because `/my-library/habits` is private/authenticated and no public metadata, sitemap, robots, canonical URL, or structured data changes.                                                                             | private-route SEO rationale             | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no crawl-safe public entity model, public copy, structured data, or AI-facing content changes.                                                                                                                | AI-discoverability scope rationale      | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no analytics event names, payloads, dashboards, or KPI definitions change.                                                                                                                                    | explicit analytics scope rationale      | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no Stripe, checkout, entitlement, catalog, portal, invoice, refund, payout, or revenue flow changes.                                                                                                          | commerce scope rationale                | `N/A`                   |
| Incident response and support operations      | `target`     | Regression is logged with symptom, root cause, fix pattern, detection, and prevention for future audio work.                                                                                                              | high-cost debug log                     | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this hotfix changes no billing provider data, invoice/refund path, payout, finance report, entitlement truth, or revenue operation.                                                             | explicit finance scope rationale        | `N/A`                   |
| i18n operational readiness                    | `target`     | Changed English labels (`See all`, `Show less`, week range text) must fit mobile and use existing `Intl.DateTimeFormat` UTC formatting where dates are involved; no locale routing or translation workflow is introduced. | unit tests + screenshot handoff         | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing sound helper, add no dependencies, keep Habits on an explicit static asset, and keep oscillator profiles for existing non-Habits sounds.                                                                   | package/code diff + tests               | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted audio tests and Habits component tests pass; the MP3 asset is the approval artifact before broad gates.                                                                                                          | Vitest + asset handoff                  | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no runtime service, storage, external vendor, or recurring job is introduced.                                                                                                                            | package/code diff                       | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Hotfix is isolated to audio asset/profile/docs/tests and can be reverted without data migration or cleanup.                                                                                                               | git diff + validation                   | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse existing `HabitPerfectDayHub`, local `habitNotices`, Motivation Stats renderer, and `playAppSoundProfile("positiveDing")`; no route or server component changes.
  - Keep `Past habits` collapse/expand as local component state only.
- TypeScript/domain contracts:
  - Keep `AppSoundProfileName`, `AppSoundProfile`, static asset mapping, and browser-audio result types as the contract.
  - Keep oscillator profile values in shared JSON for existing generated WebAudio sounds; keep Habits `positiveDing` as an explicit MP3 asset.
- Supabase/data layer:
  - N/A; no persistence, migrations, generated DB types, RLS, or indexes.
- External services/tools:
  - No external runtime audio libraries or copied platform sounds.
  - Owner provided the MP3 and confirmed "Pixabay free commercial" on 2026-06-08; owner also confirmed the exact Pixabay source URL is not retained and is not required for this hotfix closeout.
- UI system:
  - Reuse the existing local habit notice/status/action pattern and Motivation Stats typography; screenshot handoff required before PR gates.
  - Reference surface: existing `HabitPerfectDayHub` local habit feedback renderer, existing Motivation Stats renderer, and existing mobile/desktop Habits action styles.
- Testing:
  - `tests/unit/client-sound.test.ts`
  - `tests/unit/habit-perfect-day-hub.test.tsx`
  - Asset binding and blocked playback covered in unit/component tests.

## Data Placement And Sync Contract

- Server-canonical data: none changed.
- Local data: existing Habits sound enabled/disabled preference remains localStorage-only.
- Static/code data: Habits `positiveDing` lives in `public/sounds/ding/ding.mp3` and `APP_SOUND_ASSETS`; generated oscillator profiles live in `lib/audio/app-sound-profiles.json`.
- Sync policy: no cross-device sync is introduced.
- Retention and sensitivity: the static audio asset contains no user data.
- Cache/invalidation: N/A; no route cache or server data changes.
- Past habits expansion state: local component-only UI state; no persistence or sync.

## Identity And Rename Contract

N/A with rationale: this hotfix changes no persisted entities, slugs, route params, operator-visible IDs, imports, exports, or analytics identifiers. `positiveDing` remains the stable code-level profile key used by Habits.

## Forward Compatibility Contract

- Future static sound assets should be mapped explicitly in `APP_SOUND_ASSETS`; future oscillator profiles should be added to `lib/audio/app-sound-profiles.json` and covered by tests.
- Future app surfaces should call profiles by typed `AppSoundProfileName`.
- Future audio changes must provide a listenable approval artifact from the same source the app plays before approval.
- Unknown profiles fail in the TypeScript contract/sound layer instead of falling back to an unrelated old sound.
- Future archived habits automatically sort newest-first in the Motivation Stats `Past habits` preview using `updatedAt`; if archive timestamp semantics change later, the explicit mapping must be revisited.
- User-selected/uploaded sounds, server-stored preferences, native notifications, or push sounds require a new explicit brief.

## Help / Guide Impact

N/A with rationale: this hotfix changes local Habits feedback placement, Motivation Stats range label, and a local `Past habits` expand/collapse list, but it does not change workflow meanings, timer recovery, check-in semantics, support actions, or user-facing Help/Guide instructions.

## Route / Label / Support Surface Sweep

Minimum sweep for this hotfix:

Identifiers searched:

- `positiveDing`
- `softSuccessChime`
- `playAppSoundProfile`
- `Sound`
- `Slip logged.`
- `Completion saved.`
- `formatMotivationRangeLabel`
- `Week 24`
- `Past habits`
- `See all`
- `Show less`
- `updatedAt`
- `Habits`
- `client-sound`

Surfaces checked:

- `lib/audio/`
- `components/my-library/habits/`
- `tests/unit/`
- `docs/task-briefs/`
- `docs/design/`
- `docs/runbooks/high-cost-debug-log.md`

Fallout handled: sound asset/profile tests, Habits component tests, active brief, parent/queue brief notes, design inventory, and high-cost debug log were updated in this same hotfix.

## High-Cost Debug Protocol

Observed failure: after four sound-fix attempts and #1023 merge, owner still hears the wrong/same Habits sound.

Ranked hypotheses:

1. The shipped `positiveDing` profile is too similar/soft/synthetic and was never validated as audible output.
2. App and preview/test paths can drift if the approval artifact is not the same source the app plays.
3. Browser audio may be blocked/unsupported, but owner reports hearing a sound, so this is less likely than wrong profile quality.

Probe and fix:

- Inspect `lib/audio/client-sound.ts` and Habits call site.
- Replace blind oscillator tuning with an explicit static MP3 asset selected by the owner.
- Stop for owner approval before `verify:pre-pr`, PR, or merge readiness.

## Validation

Before owner audio approval:

- Confirm the app maps `positiveDing` to `public/sounds/ding/ding.mp3`.
- Run targeted Vitest for `tests/unit/client-sound.test.ts` and relevant Habits sound tests.
- Run `npm run lint:briefs` for changed task briefs.
- Capture screenshot handoff for the visible Habits UI fixes and stop for owner approval.
- Owner screenshot approval stop: completed on 2026-06-08 when owner replied `godkjent`; owner then instructed `merge pa gode tester`.
- Screenshot comparison naming: after-only evidence uses `after-*` filenames because this hotfix validates the final rendered state against the owner-reported symptoms, not a stored before baseline.

After owner audio approval:

- Run `npm run verify:pre-pr`.
- Commit, push, open/update PR, monitor CI.
- Run `npm run verify:pre-merge` before merge recommendation.

## Checkpoint Log

- `2026-06-08 | in-progress | owner explicitly said "kjor lyd-hotfix" after reporting #1023 still plays the same/wrong sound; branch hotfix/habits-ding-listenable-artifact started from clean main@776e1254; active scope is only Habits positiveDing quality plus listenable asset gate | next: wire imported MP3, run targeted tests, and stop for owner audio approval before broad gates`
- `2026-06-08 | in-progress | owner added public/sounds/ding/ding.mp3 and confirmed it was Pixabay free commercial; implementation pivoted from synthetic WAV candidates to explicit MP3 asset playback with owner-confirmed provenance and no exact source URL retained | next: targeted validation and owner approval of the exact MP3 asset`
- `2026-06-08 | in-progress | owner added two adjacent Habits fixes to the same hotfix: move Slip logged. into the local habit container and show Week range label as week number plus Jun 8-14, 2026 style range | next: implement UI fixes, run targeted tests, capture screenshot handoff, and stop for owner approval before verify:pre-pr`
- `2026-06-08 | screenshot handoff ready | targeted Vitest, typecheck, lint:briefs:all, and diff check passed; screenshot/audio artifacts captured in output/habits-ding-ui-hotfix-2026-06-08-185503; temporary AW screenshot habits used for visual proof were archived after capture | next: owner reviews screenshots plus public/sounds/ding/ding.mp3 before verify:pre-pr`
- `2026-06-08 | in-progress | owner approved adding a Past habits density fix to the same hotfix: show three newest archived habits first, expand via See all, and scroll the full list when open | next: targeted validation, refreshed screenshot handoff, and owner approval before verify:pre-pr`
- `2026-06-08 | screenshot handoff refreshed | targeted Vitest, typecheck, lint:briefs:all, and diff check passed after Past habits change; refreshed screenshot/audio artifacts captured in output/habits-ding-ui-hotfix-2026-06-08-191747; temporary AW screenshot habit used for visual proof was archived after capture | next: owner reviews refreshed screenshots plus public/sounds/ding/ding.mp3 before verify:pre-pr`
- `2026-06-08 | owner approval to proceed | owner approved screenshots/audio and explicitly said exact Pixabay URL is not required because it was no longer available after leaving Pixabay; provenance remains owner-confirmed Pixabay/free-commercial in public/sounds/ding/README.md | next: run verify:pre-pr, commit, push, open PR, monitor CI, run verify:pre-merge, and merge on green checks per owner instruction`
- `2026-06-08 | pre-pr gate passed | npm run verify:pre-pr passed full lane, including quality gates, lint, typecheck, unit tests, build, perf budgets, and Playwright E2E | next: commit, push, open PR, monitor CI, run verify:pre-merge, and merge on green checks per owner instruction`
- `2026-06-08 | done | PR #1025 merged as squash commit 5b27d823 after owner audio/screenshot approval, local verify:pre-pr, GitHub CI, and local verify:pre-merge passed | next: complete repo-managed docs-only closeout, rerun post-merge preflight, then make the mandatory chat-handoff assessment`

## Completion Record

- `completed`: `2026-06-08`
- `merged_pr`: `#1025`
- `squash_commit`: `5b27d823`
- `result`: Closed AW-006 Habits Ding Listenable Hotfix. Habits `positiveDing` now plays the owner-selected bundled MP3, `Slip logged.` renders inside the relevant habit card, Motivation Stats Week context shows week number plus full week date range, and `Past habits` defaults to the three newest archived habits with `See all`/`Show less` plus scroll when expanded.
- `validation`: Targeted sound/Habits tests, `npm run lint:briefs:all`, `npm run typecheck`, `git diff --check`, owner-approved screenshot/audio handoff at `output/habits-ding-ui-hotfix-2026-06-08-191747`, `npm run verify:pre-pr` full lane with artifacts at `artifacts/test-runs/20260608-194032`, GitHub CI for PR `#1025`, and `npm run verify:pre-merge` with evidence at `artifacts/verify-pre-merge/20260608-175549.json` passed.
- `10/10 claim`: yes - critical target categories are listed below and each reached `5/5`.

Critical target categories confirmed `5/5`:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Achieved Score | Evidence                                                                                                                                                                                                  | Gaps / Notes                                                  |
| --------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | The app playback source is the owner-selected MP3 and the adjacent Habits feedback/date/list-density fixes landed in the expected Habits surfaces.                                                        | None.                                                         |
| UX flow clarity                               | `5/5`          | `Slip logged.` uses local habit notices, Week context shows week number and date range, and `Past habits` exposes newest-first collapsed/expanded behavior.                                               | None.                                                         |
| Visual design quality                         | `5/5`          | Owner-approved screenshot handoff covered slip notice placement, Week range copy, and Past habits collapsed/expanded states.                                                                              | None.                                                         |
| Business logic correctness and data integrity | `5/5`          | Component/tests prove the changes are presentational/audio-only and do not create, update, complete, or migrate Habit data.                                                                               | None.                                                         |
| Accessibility (a11y)                          | `5/5`          | Optional sound behavior remains default-off/fail-soft, local status copy stays visible, and `See all`/`Show less` uses expandable control semantics.                                                      | None.                                                         |
| Accessibility                                 | `5/5`          | Lifecycle-lint alias for canonical `Accessibility (a11y)`; same optional sound, readable status/date context, and expandable list contract.                                                               | None.                                                         |
| Data placement and sync boundaries            | `5/5`          | MP3/profile data is static, sound preference remains browser-local, and Past habits expansion state is component-local only.                                                                              | None.                                                         |
| Reliability and failure handling              | `5/5`          | Browser audio remains fail-soft and Habits no longer falls back to the rejected synthetic oscillator ding for `positiveDing`.                                                                             | None.                                                         |
| Privacy and compliance                        | `5/5`          | The bundled audio asset and UI state add no user data logging, analytics payloads, secrets, or exported habit information.                                                                                | None.                                                         |
| Content governance                            | `5/5`          | Parent, queue, done brief, high-cost debug log, and asset README record the same-source listenable-artifact rule and owner-confirmed Pixabay/free-commercial provenance without requiring a retained URL. | None.                                                         |
| Incident response and support operations      | `5/5`          | High-cost debug log records symptom, root cause, fix pattern, detection, and prevention for repeated audio-regression work.                                                                               | None.                                                         |
| i18n operational readiness                    | `4/5`          | Date formatting uses existing `Intl.DateTimeFormat` behavior and labels fit the changed mobile surfaces, but the static English labels are not routed through a translation workflow.                     | Future locale expansion should add explicit localized labels. |
| Stack-fit and dependency discipline           | `5/5`          | Reused existing Habits component state, audio helper, asset mapping, and tests; no dependency, route, API, schema, or server change was introduced.                                                       | None.                                                         |
| Testing and QA automation                     | `5/5`          | Targeted tests, full local pre-pr lane, GitHub CI, and local pre-merge gate passed for the merged PR.                                                                                                     | None.                                                         |
| DevOps and rollback readiness                 | `5/5`          | Isolated asset/UI/runtime hotfix with no migration; rollback is normal git revert of squash commit `5b27d823`.                                                                                            | None.                                                         |
