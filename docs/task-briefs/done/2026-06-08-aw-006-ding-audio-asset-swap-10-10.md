# Task Brief: AW-006 Ding Audio Asset Swap (10/10)

## Metadata

- `id`: `2026-06-08-aw-006-ding-audio-asset-swap-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-08`
- `updated`: `2026-06-08`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `related_done_brief`: `docs/task-briefs/done/2026-06-08-aw-006-habits-ding-listenable-hotfix-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `execution_mode`: `end-to-end only after explicit owner execute/build/implement instruction`

## Brief Audit Record

- `last_audited`: `2026-06-08`
- `base`: clean synced `main@595c7084` with owner-local dirty asset replacement at `public/sounds/ding/ding.mp3`
- `audit_status`: `ready-for-execution`
- `decision`: Use this planned brief for a narrow runtime asset swap that replaces the shared Habits/Micro Sessions positive ding MP3 without changing code paths, volume, preferences, or completion triggers.
- `reason`: PR `#1027` made Habits and Micro Sessions share `/sounds/ding/ding.mp3` at app volume `0.15`; the owner has now locally replaced that MP3 and approved the new sound at app volume. The asset must be validated and shipped separately from the docs-only AW-006 design-parity reaudit.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, `lib/audio/client-sound.ts`, `public/sounds/ding/README.md`, `public/sounds/ding/ding.mp3`, Habits/Micro Sessions sound preference behavior, asset license/source facts, screenshot/audio handoff expectations, or verification lanes change before execution.

## Goal

Ship the owner-approved replacement ding MP3 as the shared positive feedback sound for Habits and Micro Sessions while preserving the existing path, app volume, and local opt-in behavior.

## Pre-Implementation Owner Explanation

Vi bytter bare selve lydfilen som appen allerede bruker til positiv feedback. Koden skal fortsatt peke paa samme filsti, og volumet skal fortsatt vaere lavt i appen.

Hvorfor det betyr noe: lyden er en liten, gjentatt feedback i Habits og Micro Sessions. Hvis den er feil eller for skarp, foeles hele loggingen mindre polert selv om funksjonen virker.

Utenfor scope er nye lydinnstillinger, opplastede lyder, global sound settings, endret volum, nye triggere, UI-endringer, design-reaudit og andre Habits-funksjoner.

Fremoverkompatibilitet: framtidige lyder eller lydprofiler skal mappes eksplisitt i lydkontrakten; ukjente lydprofiler skal ikke automatisk spille eller telle som en eksisterende positiv ding.

## Owner Audio Approval

- `2026-06-08`: Owner replaced `public/sounds/ding/ding.mp3` locally.
- Technical metadata after replacement:
  - MP3
  - estimated duration `1.680000 sec`
  - audio bytes `53760`
  - bit rate `256000 bps`
  - sample rate `48000 Hz`
- App contract:
  - path remains `/sounds/ding/ding.mp3`
  - `APP_SOUND_ASSET_VOLUMES.positiveDing` remains `0.15`
- Owner approval:
  - `2026-06-08`: owner approved the sound after checking app-volume playback.
  - `2026-06-08`: owner confirmed the replacement asset has free-use/license status.
  - During execution, update `public/sounds/ding/README.md` if the replacement asset source/license basis differs from the current README.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Performance (CWV + payloads)`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                             | Evidence                                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The replacement sound must improve the existing positive feedback moment without changing Habits/Micro Sessions IA, completion actions, sound toggle placement, or route flow. | owner audio approval + changed-files review               | `5/5`                   |
| UX flow clarity                               | `target`     | Habits and Micro Sessions must keep one shared positive ding path, local opt-in behavior, no failed-save sounds, and no new completion ambiguity.                              | targeted unit tests + code review                         | `5/5`                   |
| Visual design quality                         | `N/A`        | N/A because this changes no rendered UI, CSS, layout, typography, visual token, screenshot surface, print artifact, or brand image.                                            | visual scope rationale                                    | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Completion, timer-target, skipped/rest/undo/failure, and preference logic must remain unchanged; only the binary MP3 asset may change unless README metadata needs updating.   | targeted sound tests + diff review                        | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin editor, CRUD, publish workflow, operator queue, admin Help/Guide action, or admin action surface changes.                                                 | admin scope rationale                                     | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Sound remains optional and local-only; no required feedback may become sound-only, and existing icon-only controls must keep accessible names.                                 | existing Habits/Micro component tests + code review       | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Replacement MP3 should stay small enough for a local feedback asset and must not be loaded on initial route render unless the browser requests it for playback.                | asset metadata + no import-path change                    | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Local sound preferences remain localStorage-only; the MP3 stays a public static asset; no server-canonical user data, sync, or persistence behavior changes.                   | code review + targeted tests                              | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: the static asset path stays stable; deployment should naturally serve the new asset at the same path without app cache contract changes.                      | unchanged path + deploy/rollback notes                    | `4/5`                   |
| Reliability and failure handling              | `target`     | Browser playback fail-soft behavior must stay unchanged for blocked playback, missing asset, failed resume, failed saves, undo/restore, skipped units, and clearing plans.     | `client-sound` tests + Habits/Micro targeted tests        | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: public static asset changes no authz boundary or request input; source/license must be safe to commit and not include secrets or raw env values.              | changed-files review + source/license confirmation        | `4/5`                   |
| Privacy and compliance                        | `target`     | Asset source/license must be owner-confirmed for commercial use before PR; no user data, telemetry, or sensitive behavior may be added.                                        | README/source confirmation + changed-files review         | `5/5`                   |
| Content governance                            | `target`     | `public/sounds/ding/README.md` must accurately describe the replacement source/license basis or explicitly record owner confirmation for the new asset.                        | README diff or explicit no-change rationale               | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow label, editable field, status transition, audit trail, recovery path, Help/Guide assertion, or support procedure.                   | workflow scope rationale                                  | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because no metadata, sitemap, robots, canonical URL, structured data, public route content, or crawl-facing behavior changes.                                              | SEO scope rationale                                       | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                            | AI-discoverability scope rationale                        | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because no event taxonomy, payload, logging, dashboard, metric, or KPI threshold changes.                                                                                  | analytics scope rationale                                 | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no Stripe, checkout, pricing, entitlement, invoice, refund, payout, catalog, or revenue behavior changes.                                                          | commerce scope rationale                                  | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support workflow, recovery behavior, operator diagnostics, runbook procedure, or support escalation behavior.                        | explicit support-ops scope rationale                      | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue-recognition data.                       | explicit finance scope rationale                          | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because this changes no visible string, locale routing, translation workflow, metadata localization, grammar-coupled layout, or user-facing copy.                          | i18n scope rationale                                      | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | Use the existing static asset path and existing `client-sound` contract; add no dependency, codec tooling, alternate profile, global setting, or new playback abstraction.     | changed-files review + no dependency diff                 | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted client-sound/Habits/Micro tests plus full pre-PR/pre-merge gates must pass because this is a runtime asset diff, not docs-only.                                       | targeted tests + `npm run verify:pre-pr` + CI + pre-merge | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the file remains a small static asset used on demand; no new storage, CDN class, runtime generation, analytics vendor, or infrastructure cost.                | asset metadata + unchanged static path                    | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback is normal git revert of the MP3/README diff; no migration, secret, environment, package, workflow, deployment setting, or runtime code rollback needed.               | git diff review + rollback notes + verification gates     | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Preserve existing public static asset serving under `public/sounds/ding/ding.mp3`.
  - No route, server/client boundary, action/API route, cache mode, or rendering behavior changes expected.
- TypeScript/domain contracts:
  - Preserve `APP_SOUND_ASSETS.positiveDing` and `APP_SOUND_ASSET_VOLUMES.positiveDing` in `lib/audio/client-sound.ts`.
  - Preserve `playAppSoundProfile("positiveDing")` behavior and fail-soft result model.
- Supabase/data layer:
  - N/A; no migration, RLS/authz rule, generated DB type, index, storage bucket, or data access behavior changes.
- External services/tools:
  - N/A for runtime integration; no new provider, SDK, vendor, webhook, secret, retry, or idempotency behavior.
  - Asset source/license confirmation is required before PR.
- UI system:
  - No visual UI changes.
  - Habits and Micro Sessions icon-only sound toggles must keep their existing accessible names and local preference behavior.
- Testing:
  - Targeted unit tests for `client-sound`, `HabitPerfectDayHub`, and `DrylandMicroPlanPanel`.
  - Full `npm run verify:pre-pr` before PR and `npm run verify:pre-merge` before merge recommendation because the diff includes a runtime asset.

## Data Placement And Sync Contract

- Server-canonical data:
  - None added or changed.
- Local data:
  - Existing localStorage preferences remain:
    - `freeswimming:habits:v1:sound`
    - `freeswimming:micro-sessions:v1:sound`
- Public static asset:
  - `public/sounds/ding/ding.mp3` remains the only changed runtime asset path.
- Sync policy:
  - N/A; replacing the asset does not sync user data.
- Retention and sensitivity:
  - The asset contains no user data or secret values.
- Cache/invalidation:
  - Static asset path remains stable; normal deployment replaces the served file.
  - If production CDN/browser cache behavior becomes visible, rollback/redeploy is the safe recovery path.

## Identity And Rename Contract

- Canonical stable ID:
  - The sound profile identity remains `positiveDing`.
- Human-readable identifiers:
  - The file path remains `/sounds/ding/ding.mp3`; no user-facing label changes.
- Mutability rules:
  - The MP3 content may be replaced in place only through a brief that verifies owner approval, license/source, path, volume, and tests.
- Rename vs repurpose policy:
  - Changing the path, adding a new sound profile, or changing semantics from positive ding to another feedback meaning requires a separate mapping/update brief.
- Compatibility contract:
  - Existing tests and consumers continue to read `APP_SOUND_ASSETS.positiveDing`.
- Observability and repair:
  - If users report bad/blocked sound, support can inspect the deployed asset path, browser audio behavior, and local sound preference state; rollback is normal git revert.

## Forward Compatibility Contract

- Extensibility surfaces:
  - sound profile names, static asset paths, local preference keys, local preference versions, app playback volumes, completion triggers, future global sound settings, and future user-selected/uploaded sounds.
- Source of truth:
  - `lib/audio/client-sound.ts` remains the source of truth for bundled app sound paths and volumes.
  - `public/sounds/ding/README.md` records source/license basis for the bundled MP3.
- Additive behavior:
  - Future consumers using `positiveDing` automatically receive the replacement MP3 at the shared volume.
- Explicit mapping requirements:
  - New bundled sound profiles, new volumes, server-stored preferences, uploaded sounds, notification sounds, or global sound settings require explicit mapping, tests, source/license review, and Help/Guide/support review where relevant.
- Unknown or deprecated values:
  - Unknown profile names must not play automatically; existing `client-sound` profile guard behavior must remain.
- Test/evidence:
  - Unit tests should continue proving path and volume; asset metadata and owner approval prove this swap is not hardcoded to the old file content.

## Help / Guide Impact

N/A with rationale: this keeps the same sound path, same toggle labels, same local-only preference behavior, same completion semantics, and same support-facing behavior. If execution changes labels, workflow meaning, recovery behavior, or support diagnostics, Help/Guide/runbooks must be updated in the same PR.

## Route / Label / Support Surface Sweep

Required before broad gates because this changes a shared runtime asset used by multiple member surfaces.

- Identifiers to sweep:
  - `/sounds/ding/ding.mp3`
  - `positiveDing`
  - `APP_SOUND_ASSETS`
  - `APP_SOUND_ASSET_VOLUMES`
  - `freeswimming:habits:v1:sound`
  - `freeswimming:micro-sessions:v1:sound`
  - `Sound on`
  - `Sound off`
  - `ding.mp3`
- Minimum surfaces:
  - `lib/audio/`
  - `components/my-library/habits/`
  - `components/my-library/dryland/`
  - `tests/unit/`
  - `public/sounds/ding/`
  - `docs/task-briefs/`
  - `docs/design/`
  - `docs/runbooks/`
- Expected fallout:
  - this brief,
  - `public/sounds/ding/ding.mp3`,
  - optional `public/sounds/ding/README.md` update if the replacement source/license differs from the current README,
  - no UI, route, API, database, analytics, Help/Guide, or support workflow changes.

## Scope

- Replace only `public/sounds/ding/ding.mp3` with the owner-approved MP3.
- Verify path and volume remain unchanged:
  - `/sounds/ding/ding.mp3`
  - `0.15`
- Confirm source/license basis before PR.
- Run targeted audio/client/unit validation and full runtime gates.
- Keep the AW-006 design-parity reaudit brief separate.

## Out Of Scope

- Changing `lib/audio/client-sound.ts` path or volume unless validation finds accidental drift.
- New sound profiles, per-user uploaded sounds, server-stored preferences, global sound settings, notification APIs, waveform editing, compression tooling, or audio libraries.
- UI, layout, copy, labels, icons, routes, APIs, database, analytics, Stripe, auth, Help/Guide, support procedure, or design-reaudit changes.
- Merging the docs-only AW-006 design-parity reaudit brief with this runtime asset workstream.

## Acceptance Criteria

1. `public/sounds/ding/ding.mp3` is the only runtime asset changed.
2. `APP_SOUND_ASSETS.positiveDing` still resolves to `/sounds/ding/ding.mp3`.
3. `APP_SOUND_ASSET_VOLUMES.positiveDing` remains `0.15`.
4. Replacement asset is MP3, short enough for repeated positive feedback, and owner-approved at app volume.
5. Source/license basis for the replacement asset is confirmed and README is updated if the current README is no longer accurate.
6. Habits and Micro Sessions sound preference/toggle/completion tests still pass.
7. Full `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

Targeted before broad gates:

- `afinfo public/sounds/ding/ding.mp3`
- `afplay -v 0.15 public/sounds/ding/ding.mp3` owner-approved or owner-equivalent browser playback approval
- `npm run lint:briefs`
- `npm run lint:briefs:all`
- targeted route/label/support sweep listed above
- targeted unit tests for:
  - `tests/unit/client-sound.test.ts`
  - `tests/unit/habit-perfect-day-hub.test.tsx`
  - `tests/unit/dryland-micro-plan-panel.test.tsx`

Broad gates:

- `npm run verify:pre-pr`
- required PR CI checks
- `npm run verify:pre-merge`

Because this touches a runtime asset, docs-only verification is not sufficient for PR/merge.

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands should use escalation-first strategy per repo instructions.
- macOS local audio playback available for `afplay`, or owner provides equivalent browser/app playback approval.

## Screenshot Handoff

N/A with rationale: this changes no UI, print, layout, brand image, visible product rendering, or screenshot surface. Owner audio approval replaces screenshot approval for this audio-only asset swap.

## Checkpoint Log

- `2026-06-08 | planned | created from clean synced main@595c7084 with owner-local dirty replacement at public/sounds/ding/ding.mp3; owner approved the new sound at app volume 0.15; scope is a separate runtime asset-swap workstream from the docs-only AW-006 design-parity reaudit | next: confirm replacement source/license basis, move to in-progress only after explicit execute/build/implement instruction, then run targeted tests and full pre-PR/pre-merge gates`
- `2026-06-08 | planned | owner confirmed the replacement asset has free-use/license status; brief audit status updated to ready-for-execution | next: execute only after explicit execute/build/implement instruction; during execution, confirm whether public/sounds/ding/README.md still accurately describes the replacement source/license basis`
- `2026-06-08 | in-progress | execution started on branch aw-006-ding-audio-asset-swap; MP3 metadata verified as MPG3, 2 ch, 48000 Hz, 1.680000 sec, 53760 bytes, 256000 bps; public/sounds/ding/README.md updated to record owner-confirmed free-use/license status for the replacement asset | next: route/support sweep, targeted tests, brief lint, full pre-PR gate`
- `2026-06-08 | in-progress | route/label/support sweep confirmed the shared positiveDing path remains /sounds/ding/ding.mp3, shared app volume remains 0.15 in lib/audio/client-sound.ts, Habits and Micro Sessions keep local sound preference keys and accessible Sound on/off names, and no UI/API/data fallout was found; targeted Vitest passed for tests/unit/client-sound.test.ts, tests/unit/habit-perfect-day-hub.test.tsx, and tests/unit/dryland-micro-plan-panel.test.tsx with 108/108 tests passing; npm run lint:briefs:all passed | next: stage only audio-scope files and run npm run verify:pre-pr`
- `2026-06-08 | done | PR #1029 merged at squash commit 3cf49d64 after full local pre-PR, green CI, and pre-merge validation; post-merge preflight requested this repo-managed docs-only closeout | next: closeout PR validation`

## Completion Record

- `completed`: `2026-06-08`
- `merged_pr`: `#1029`
- `squash_commit`: `3cf49d64`
- `result`: Closed AW-006 Ding Audio Asset Swap by shipping the owner-approved replacement MP3 at the existing shared positive feedback path for Habits and Micro Sessions, while preserving app playback volume `0.15`, local opt-in preferences, and fail-soft playback behavior.
- `validation`: `afinfo public/sounds/ding/ding.mp3`; targeted Vitest for `tests/unit/client-sound.test.ts`, `tests/unit/habit-perfect-day-hub.test.tsx`, and `tests/unit/dryland-micro-plan-panel.test.tsx` with 108/108 tests passing; route/label/support sweep; `npm run lint:briefs:all`; `npm run verify:pre-pr` full lane PASS before PR; PR #1029 CI PASS including `verify`, `e2e-smoke`, `site-lock-smoke`, Vercel, CodeQL, and size-check; `npm run verify:pre-merge` PASS before merge.
- `10/10 claim`: yes - all critical target categories reached `5/5`; no remaining gaps.

| Category                                      | Achieved Score | Evidence                                                                                                                                    | Gaps / Notes |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                          | `5/5`          | Owner-approved replacement sound shipped at the same shared Habits/Micro Sessions path in PR `#1029`.                                       | None.        |
| UX flow clarity                               | `5/5`          | Route/support sweep and targeted tests confirmed shared path, local opt-in behavior, no failed-save sounds, and no completion ambiguity.    | None.        |
| Business logic correctness and data integrity | `5/5`          | Only the MP3 asset, README provenance note, and brief lifecycle changed; completion/preference logic stayed unchanged.                      | None.        |
| Accessibility (a11y)                          | `5/5`          | Existing Habits/Micro tests preserved accessible `Sound on` / `Sound off` names and sound remained optional, not required feedback.         | None.        |
| Performance (CWV + payloads)                  | `5/5`          | `afinfo` confirmed a small on-demand MP3 asset; full perf budgets passed in `npm run verify:pre-pr`.                                        | None.        |
| Data placement and sync boundaries            | `5/5`          | LocalStorage sound preference keys stayed local-only; static asset stayed under `public/sounds/ding/ding.mp3`; no server data changed.      | None.        |
| Reliability and failure handling              | `5/5`          | `client-sound` targeted tests and full verification preserved profile guard, asset volume, playback fail-soft behavior, and blocked result. | None.        |
| Privacy and compliance                        | `5/5`          | Owner confirmed free-use/license status; README records owner-provided replacement asset and no user data or secrets were added.            | None.        |
| Content governance                            | `5/5`          | `public/sounds/ding/README.md` now accurately records replacement source/license basis and product use.                                     | None.        |
| Stack-fit and dependency discipline           | `5/5`          | Existing Next.js public asset path and `client-sound` contract reused; no dependency, codec, profile, or playback abstraction was added.    | None.        |
| Testing and QA automation                     | `5/5`          | Targeted Vitest, `lint:briefs:all`, full `verify:pre-pr`, green CI, and `verify:pre-merge` all passed.                                      | None.        |
| DevOps and rollback readiness                 | `5/5`          | PR `#1029` is a normal git-revertable MP3/README/brief diff with no migration, env, secret, package, workflow, or runtime code rollback.    | None.        |
