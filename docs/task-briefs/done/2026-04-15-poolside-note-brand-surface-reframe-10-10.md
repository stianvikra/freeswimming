# Task Brief: Poolside Note Brand Surface Reframe (10/10)

## Metadata

- `id`: `2026-04-15-poolside-note-brand-surface-reframe-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-15`
- `updated`: `2026-04-15`

## Goal

Make the Poolside Note a true 10/10 lane-side brand artifact: premium, instantly scannable, operationally trustworthy, and strong enough to function as a visible FreeSwimming poster without becoming a generic ad flyer.

## Why This Brief Exists

- The current Poolside Note is clean enough to use, but it still reads more like a competent print view than a world-class brand surface.
- Owner review on `2026-04-15` raised three real quality questions that the current output does not fully solve:
  - whether `Poolside Note` should be the hero at all,
  - whether the current print logo is too conservative compared with the stronger brand variants already used on `/`,
  - and whether marketing-style copy belongs on an artifact that must still work as a lane-side workout sheet.
- Current implementation findings from `main`:
  - the output still uses `Poolside Note` as the main title in [lib/workouts/shared.ts](/Users/stianvikra/freeswimming/lib/workouts/shared.ts),
  - the poolside lines still rely on internal-looking `P:` prefixes for rest rows,
  - the default PDF logo path still points to the safe ink print lockup in [lib/brand.ts](/Users/stianvikra/freeswimming/lib/brand.ts),
  - and the test contract still locks the old title/copy in [tests/e2e/my-library-workout-builder.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts).
- This brief exists to lock the design bar and the scoring gate before any code changes happen.

## Current Preflight Score Audit

Pre-implementation audit on `2026-04-15`, based on the current `main` poolside print output:

| Category                                      | Current Score | Why It Is Not 10/10 Yet                                                                   |
| --------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------- |
| Product goals and IA                          | `3/5`         | The sheet still splits attention between artifact label, brand, and workout title.        |
| UX flow clarity                               | `4/5`         | It is usable, but the primary reading order is not as immediate as it should be.          |
| Visual design quality                         | `3/5`         | The layout is polished, but not yet signature-level or compositionally decisive.          |
| Business logic correctness and data integrity | `4/5`         | Semantics are mostly correct, but rest labeling still reads like internal system output.  |
| Accessibility (a11y)                          | `4/5`         | Baseline semantics hold, but long wrapped lines reduce scan speed and reading comfort.    |
| Reliability and failure handling              | `4/5`         | Output is stable, but the visual contract is not yet deliberate enough under edge cases.  |
| Security and authz                            | `5/5`         | Existing owner-scoped access model is already correct.                                    |
| Privacy and compliance                        | `4/5`         | The output is still safe, but copy/data hierarchy should better signal intended exposure. |
| Content governance                            | `3/5`         | Brand/copy choices are not yet locked into one clear poolside output contract.            |
| Testing and QA automation                     | `4/5`         | Tests exist, but they currently lock the old header/copy and not the target brand bar.    |

This brief cannot move to `done` unless all declared `target` categories close at `5/5`.

## Dependencies And Boundaries

- Parent builder/runtime brief that still owns the broader authoring track:
  - [2026-02-28-workout-builder-and-poolside-execution-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-02-28-workout-builder-and-poolside-execution-10-10.md)
- Poolside lineage that this brief intentionally supersedes at the brand/composition layer:
  - [2026-04-01-workout-builder-poolside-note-print-and-surface-clarity-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-01-workout-builder-poolside-note-print-and-surface-clarity-10-10.md)
  - [2026-04-11-swim-session-builder-garmin-authoring-and-poolside-note-redesign-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-11-swim-session-builder-garmin-authoring-and-poolside-note-redesign-10-10.md)
  - [2026-04-12-swim-session-builder-scan-delete-and-poolside-brand-polish-10-10.md](/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-12-swim-session-builder-scan-delete-and-poolside-brand-polish-10-10.md)
- Primary code surfaces expected in scope when implementation begins:
  - [lib/workouts/shared.ts](/Users/stianvikra/freeswimming/lib/workouts/shared.ts)
  - [lib/brand.ts](/Users/stianvikra/freeswimming/lib/brand.ts)
  - [components/my-library/workouts/WorkoutEditor.tsx](/Users/stianvikra/freeswimming/components/my-library/workouts/WorkoutEditor.tsx)
  - [tests/unit/workouts-shared.test.ts](/Users/stianvikra/freeswimming/tests/unit/workouts-shared.test.ts)
  - [tests/unit/workout-builder-hub.test.tsx](/Users/stianvikra/freeswimming/tests/unit/workout-builder-hub.test.tsx)
  - [tests/e2e/my-library-workout-builder.spec.ts](/Users/stianvikra/freeswimming/tests/e2e/my-library-workout-builder.spec.ts)
- Locked boundaries:
  - no new workout entity,
  - no poolside execution mode,
  - no Home-page redesign,
  - no public marketing landing page inside the workout print sheet,
  - no change to canonical workout math or repeat/rest storage beyond presentation wording.

## Product Direction Locked By This Brief

1. The Poolside Note is a premium operational artifact first, and a brand surface second.
2. The printed artifact must still feel unmistakably like FreeSwimming.
3. The artifact should carry brand through composition, typography, color, logo choice, and disciplined copy, not through salesy claims.
4. The session title, not `Poolside Note`, should own the visual hierarchy.
5. If `Poolside Note` remains anywhere, it must become secondary supporting copy rather than the main hero.
6. The artifact must never expose internal implementation language such as `P:` or source/debug labels.
7. Color mode may use a stronger brand asset than ink-saver mode, but both variants must look intentional and premium.
8. No comparative marketing line or explicit promotional sentence should appear on the sheet.
9. A restrained brand tagline such as `Learn. Drill. Swim.` may be used only if it improves the composition without competing with the workout title or first sets.
10. Portrait and landscape must be treated as two intentionally composed layouts, not one stretched template.

## Locked Design Decisions

### 1. Hero Hierarchy

- The session title becomes the primary hero.
- Brand lockup becomes secondary but still prominent.
- `Poolside Note` should not remain the dominant `h1`.
- The first visible hierarchy should read in this order:
  - brand,
  - session title,
  - session summary,
  - swimmer identity,
  - first workout content.

### 2. Brand System Usage

- In `color` mode, use a stronger existing brand asset from the manifest than the current conservative print lockup, or add one dedicated poolside print usage in [lib/brand.ts](/Users/stianvikra/freeswimming/lib/brand.ts).
- In `ink_saver` mode, use an ink-safe lockup that remains crisp on paper.
- Do not import random Home hero composition directly into the sheet.
- Reuse the existing brand system and asset manifest rather than inventing one-off image paths.

### 3. Marketing Copy Discipline

- Ban explicit promotional claims such as:
  - `Improve your freestyle at FreeSwimming.org`
  - `One of the world's best free freestyle courses.`
- The artifact may carry:
  - domain,
  - logo/lockup,
  - and at most one restrained brand line if it passes hierarchy review.
- The sheet must not read like a flyer or ad insert.

### 4. Workout-Line Language

- Replace `P:` rest rows with plain-language labels.
- Rest language should read like swimmer-facing instruction, for example:
  - `Rest 0:30`
  - `Rest between rounds 0:30`
  - `Final rest skipped`
- Repeat/rest semantics must remain truthful to the canonical workout model.

### 5. Layout Composition

- Portrait:
  - compressed premium header,
  - strong vertical rhythm,
  - title and first actionable set visible quickly.
- Landscape:
  - left column for compact context,
  - right column for the set list,
  - no dead empty zones that make the output feel under-designed.
- Focus and total blocks must support the workout rather than dominate it.

### 6. Identity And Exposure

- Swimmer identity should stay present but calmer than the current labeled pill if that improves hierarchy.
- The sheet must only show data intentionally meant to be seen on paper at the pool.
- The brand surface must not accidentally elevate private/internal metadata above workout content.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Strict `10/10` mode for this brief:

- all `target` categories must close at `5/5`
- no target category may close at `4/5`

Critical target categories for `10/10` claim in this brief:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Security and authz`
- `Content governance`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                            | Evidence                                        | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The sheet has one obvious primary job: help the swimmer run the session while broadcasting a premium FreeSwimming identity without mixed messaging.                       | screenshot review + manual QA + brief review    | `5/5`                   |
| UX flow clarity                               | `target`     | A swimmer or coach can identify title, total, focus, and first set within `3` seconds in both portrait and landscape; no internal labels or ambiguous prefixes remain.    | manual timed QA + targeted e2e                  | `5/5`                   |
| Visual design quality                         | `target`     | Portrait and landscape outputs both look intentionally art-directed, balanced, and premium with no awkward wraps, dead zones, weak logo treatment, or noisy helper copy.  | screenshot review + PDF review + print QA       | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Brand/layout changes preserve exact workout semantics, keep rest/repeat truth intact, and never mutate canonical workout data or selected training focus data.            | unit coverage + code review + targeted e2e      | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: the owner can prepare a print-ready artifact from the existing builder with fewer distracting copy decisions and less last-minute visual doubt.          | builder QA + scope review                       | `4/5`                   |
| Accessibility (a11y)                          | `target`     | The changed print preview and builder controls retain correct headings, list semantics, labels, contrast, and keyboard reachability; no new serious/critical a11y issues. | unit/e2e + manual keyboard QA                   | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: the poolside artifact redesign adds no material builder-route payload regression and does not make preview opening feel slower.                          | build/perf review + interaction QA              | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Style/layout/brand presentation choices remain local-only, while canonical workout content, swimmer identity, and focus source data stay explicitly server-canonical.     | brief contract + code review + tests            | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Reopened preview always reflects the current local draft and current local print choices, and saved canonical output refreshes deterministically after save/reset.        | code review + targeted unit/e2e                 | `5/5`                   |
| Reliability and failure handling              | `target`     | Missing logo assets, long titles, long focus text, long set lists, and popup/preview edge cases all degrade gracefully without broken layout or misleading brand output.  | negative-path QA + unit/e2e + screenshot review | `5/5`                   |
| Security and authz                            | `target`     | The poolside output remains owner-scoped, exposes no new public data path, and keeps all existing workout/export access boundaries fail-closed.                           | route review + existing negative-path coverage  | `5/5`                   |
| Privacy and compliance                        | `target`     | The output includes only intentionally chosen workout and identity data, and never leaks internal source labels, debug state, or unrelated private context.               | code review + output QA + targeted tests        | `5/5`                   |
| Content governance                            | `target`     | Poolside copy, rest vocabulary, brand asset usage, and optional tagline usage are centralized and truthful, with one clear artifact contract rather than drift.           | code review + asset review + test assertions    | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this brief changes an owner-scoped workout print artifact and preview workflow, not an admin CRUD or publishing workflow.                                     | explicit scope rationale                        | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because the changed route/output is private, authenticated, and intentionally not a public crawl surface.                                                             | explicit scope rationale                        | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this brief changes no public metadata, schema, or public semantic content intended for AI retrieval.                                                          | explicit scope rationale                        | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because the brief does not introduce a new analytics contract; success is evaluated through design QA rather than new instrumentation.                                | explicit scope rationale                        | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, entitlement, billing, or conversion flow changes in this print-surface redesign.                                                                  | explicit scope rationale                        | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because the brief does not alter runbooks, alerting, escalation, or support-only diagnostics; it refines a private print artifact and preview surface.                | explicit scope rationale                        | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because no revenue reporting, payout, refund, or reconciliation behavior changes in this scope.                                                                       | explicit scope rationale                        | `N/A`                   |
| i18n operational readiness                    | `N/A`        | N/A because the brief tightens one English-only private artifact contract and introduces no new localization architecture or locale storage model.                        | explicit scope rationale                        | `N/A`                   |
| Stack-fit and dependency discipline           | `target`     | The redesign reuses the existing PDF builder, brand manifest, and test stack with no unnecessary dependency or parallel rendering system.                                 | dependency diff + code review                   | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit/e2e coverage locks the new poolside hierarchy, copy discipline, brand asset contract, and rest vocabulary; `verify:pre-pr` and `verify:pre-merge` must pass.         | updated tests + verification gates              | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the redesign should not add wasteful image handling, extra network fetches, or duplicate preview generation paths.                                       | code review + diff review                       | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: the change must stay rollback-safe with code-only revert and no data/schema migration.                                                                   | PR diff + rollback note                         | `4/5`                   |

## Data Placement And Sync Contract

- Server-canonical data:
  - saved workout content and step ordering,
  - canonical workout ID and saved-session metadata,
  - athlete profile name fields already used for swimmer identity,
  - selected training-focus source data available to the owner.
- Local-only data:
  - chosen poolside print style (`color` vs `ink_saver`),
  - chosen poolside print layout (`portrait` vs `landscape`),
  - any local preview-only toggles or selected focus IDs,
  - popup/open state and transient print-preview UI state.
- Sync policy:
  - local poolside settings must never write back to the workout row,
  - the artifact preview should reflect the current local draft immediately,
  - saved canonical output should reflect the latest saved workout after save or reset,
  - if the current draft diverges from saved state, preview/output must remain truthful about the currently visible workout content without leaking internal source labels.
- Retention and sensitivity:
  - no new persistent preference or print-profile entity is added in this slice,
  - swimmer identity remains limited to the name fields already intentionally used in the owner-facing workflow,
  - no hidden/internal metadata should appear in printed output.
- Cache/invalidation:
  - keep existing owner-scoped route/export boundaries,
  - do not introduce extra fetches solely for brand decoration,
  - preview reopening after save/reset must invalidate stale local composition and rebuild deterministically from current state.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the only canonical identity for the session behind the artifact.
- Human-readable identifiers:
  - session title is renameable and remains the primary human-facing identifier on the artifact,
  - swimmer display name is a derived presentation field from the athlete profile,
  - `Poolside Note` is treated as a presentation label only and may be demoted, renamed, or removed from the visible hero.
- Mutability rules:
  - title and presentation labels are renameable,
  - brand asset choice and tagline usage are presentation-level and do not affect canonical workout identity,
  - print style/layout remain local and non-persistent in this slice.
- Rename vs repurpose policy:
  - changing the visible print heading or brand lockup is an in-place presentation change,
  - it must not create a second workout artifact type or separate canonical document model.
- Compatibility contract:
  - existing `variant=poolside` flows stay intact,
  - old links and preview actions must still produce a valid poolside artifact even if the visible hero naming changes.
- Observability and repair:
  - missing brand assets or invalid optional brand usage must fall back to a committed manifest asset, not a broken image block,
  - any legacy copy expectation in tests must be updated to the new artifact contract.

## Scope

- Reframe the Poolside Note as a premium branded lane-side artifact while keeping the workout operationally primary.
- Redesign the poolside hero hierarchy so the session title becomes the primary heading.
- Revisit whether `Poolside Note` stays visible at all in the artifact output, and if retained, demote it from primary hero status.
- Replace internal `P:` rest rows with plain-language rest labeling.
- Upgrade brand asset usage for the `color` poolside variant using the existing brand manifest, while preserving an ink-safe `ink_saver` variant.
- Remove any temptation toward explicit marketing-claim copy from the artifact.
- Decide whether a restrained `Learn. Drill. Swim.` line belongs in the composition, and only ship it if it improves hierarchy rather than competes with it.
- Recompose portrait and landscape layouts separately so both feel intentional.
- Rebalance the total/focus/identity blocks so they support scan speed instead of acting like oversized side cards.
- Update the builder-side poolside preview contract where needed so naming and preview behavior stay coherent with the new artifact.
- Update tests to lock the new brand/copy/layout contract.

## Out Of Scope

- Full poolside execution mode or interactive deck-side tracking.
- Home-page redesign or broader campaign-brand changes.
- New public marketing poster route or printable brochure.
- Changing canonical workout step math, Garmin readiness logic, or rest/repeat storage.
- New analytics taxonomy.
- New persistent print-preferences storage.

## Acceptance Criteria

1. The poolside artifact no longer uses `Poolside Note` as the dominant visual hero.
2. The session title is the most visually prominent text element in both portrait and landscape.
3. The color variant uses a stronger brand lockup from the existing brand system than the current conservative print-only lockup, while the ink-saver variant remains print-safe and premium.
4. The output contains no explicit promotional sentence, comparative claim, or flyer-style marketing block.
5. If a tagline is used, it appears only once, remains secondary, and does not push the session title or first workout content out of the immediate visual priority zone.
6. Rest rows no longer render with raw `P:` prefixes.
7. Rest and repeat labels remain semantically truthful to the canonical workout structure.
8. Portrait and landscape both pass screenshot review with no major dead zones, no clipped content, and no obviously awkward wraps on long titles or long rest lines.
9. The sheet includes only intended data: workout content, selected focus content, and swimmer identity already allowed by the owner workflow.
10. Internal implementation labels such as source state, print mode chips, debug text, or draft/canonical internals do not appear in the artifact.
11. Updated unit and e2e tests lock the new hierarchy, brand asset contract, and copy contract.
12. `npm run lint:briefs`, `npm run verify:pre-pr`, and `npm run verify:pre-merge` pass in the implementation PR.

## Validation

For this planning brief itself:

- `npm run lint:briefs`

For the later implementation PR:

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- targeted `vitest`:
  - `tests/unit/workouts-shared.test.ts`
  - `tests/unit/workout-builder-hub.test.tsx`
- targeted `playwright`:
  - `tests/e2e/my-library-workout-builder.spec.ts --project=desktop-chromium`
- `npm run build`
- `npm run verify:pre-pr`
- before merge recommendation: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

Required for the later implementation PR:

- Local:
  - saved workout route at `http://127.0.0.1:3000/my-library/workouts/<id>`
  - poolside print popup from the builder route
  - browsers/devices:
    - Desktop Safari print preview
    - Desktop Chrome
    - Desktop Firefox
    - tablet-width browser viewport
- Preview:
  - Vercel preview URL from the implementation PR
  - browsers/devices:
    - Desktop Safari
    - Desktop Chrome
- Required checks:
  - portrait preview screenshot
  - landscape preview screenshot
  - print/PDF save from Safari
  - long-title / long-rest-row stress case
  - one focus-heavy case and one no-focus case

## Constraints

- The artifact must feel premium without turning into a generic ad or brochure.
- Use the existing brand system first; do not invent a disconnected one-off poster style.
- Keep the design compatible with real print use, not only browser preview.
- Do not weaken workout scan speed to make room for brand theatrics.
- Preserve the existing owner-scoped route/export contract.
- Keep copy in English.

## 10/10 Quality Bar

- The artifact should feel professionally designed enough that the owner would be comfortable leaving it visible on the pool deck as a brand signal.
- The first glance should answer:
  - what session this is,
  - who it is for,
  - how big/hard it is,
  - and what the first set is.
- Brand presence should feel premium, not needy.
- No line should read like implementation detail or internal developer shorthand.
- Long workouts must still feel composed, not like a stretched admin report.
- The layout must survive both screen preview and paper.
- State changes in the builder must remain deterministic and truthful in the generated artifact.

## Help/Guide Impact

- `N/A` for this planning slice.
- If implementation changes the owner-facing preview labels or workflow materially, the implementation PR must either update the relevant builder guidance/runbook in the same PR or record an explicit `N/A` rationale.

## Closeout

- Shipped via PR `#435`, merged to `main` as `373c242` on `2026-04-15`.
- Achieved critical target categories at `5/5`:
  - `Product goals and IA`
  - `UX flow clarity`
  - `Visual design quality`
  - `Business logic correctness and data integrity`
  - `Reliability and failure handling`
  - `Security and authz`
  - `Content governance`
  - `Testing and QA automation`
- Supporting target closeout stayed release-safe:
  - `Admin editor ergonomics` at `4/5`
  - `Performance (CWV + payloads)` at `4/5`
  - `Scalability and cost efficiency` at `4/5`
  - `DevOps and rollback readiness` at `4/5`
- Release evidence for the implementation slice:
  - local targeted unit coverage passed,
  - local targeted Playwright coverage passed,
  - local `npm run verify:pre-pr` passed,
  - local `npm run verify:pre-merge` passed,
  - required GitHub checks for PR `#435` passed green before merge.

## Checkpoint Log

- `2026-04-15 | planning | captured a pre-implementation 10/10 score audit for the current poolside artifact, locked the direction away from flyer-style marketing copy, and split the poolside brand-surface redesign into its own brief before any code changes | next: confirm the brief direction, then implement in a separate execution slice`
- `2026-04-15 | implementation start | moved the brief to in-progress, chose a stronger domain lockup for color poolside output, and started the print-surface rewrite around title hierarchy, rest-row language, and portrait/landscape composition | next: finish the artifact redesign, update tests, and run verification`
- `2026-04-15 | implementation checkpoint | finished the poolside brand-surface rewrite, added the stronger color lockup, converted rest rows into plain-language swimmer-facing labels, collapsed sparse landscape meta into a compact top strip, and patched contact-form error focus timing so the desktop WebKit contact a11y check passes again | next: rerun the full pre-pr gate to get one uninterrupted green run after a flaky desktop Chromium training-context failure that passed on isolated rerun`
- `2026-04-15 | verification checkpoint @ 5b272d1 | completed targeted unit coverage, reran the full pre-pr gate green, confirmed the earlier desktop Chromium training-context flake passed inside the full matrix, and verified the desktop WebKit contact-form focus regression is fixed | next: commit the scoped changes, push the branch, open/update the PR, and run the pre-merge gate`
- `2026-04-15 | commit checkpoint @ 19097fb | committed the scoped poolside brand-surface rewrite and supporting contact-form focus fix after a green full pre-pr run, leaving only untracked local QA screenshots outside the commit | next: push the branch, open or update the PR, and run the full pre-merge gate before merge recommendation`
- `2026-04-15 | done | PR #435 merged to main as \`373c242\` after local \`npm run verify:pre-pr\`, local \`npm run verify:pre-merge\`, and green required GitHub checks; this docs-only follow-up moved the brief from \`in-progress\` to \`done\` so lifecycle state matches shipped reality | next: none`
