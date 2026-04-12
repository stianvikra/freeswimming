# Task Brief: Workout Builder Mobile Density And Width Reclaim (10/10)

## Metadata

- `id`: `2026-04-10-workout-builder-mobile-density-and-width-reclaim-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-10`
- `updated`: `2026-04-10`

## Goal

Make the swim workout builder feel decisively tighter, calmer, and wider on phone-width layouts by reclaiming horizontal space and reducing action noise, while preserving existing workout logic and keeping desktop authoring speed intact.

## Why This Brief Exists

- The first containment cleanup shipped as a safe `step 1`, but iPhone screenshots still show too much unused side space and too much vertical action noise.
- The remaining issue is now a mobile density problem, not a basic border-hierarchy problem.
- The current builder still spends too much mobile space on:
  - route shell gutters,
  - large inner padding values,
  - a tall hero/header region,
  - and full rows of equally weighted step actions.
- Step cards currently expose too many peer actions at once on narrow screens, which increases height and reduces focus.
- This slice is the correct `step 2` because it can target mobile-first layout and action prioritization without reopening workout semantics.

## Dependencies And Boundaries

- Parent containment audit:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-09-platform-containment-and-border-hierarchy-audit-10-10.md`
- Previous builder containment step:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-09-workout-builder-containment-cleanup-10-10.md`
- Existing workout-builder UX parent:
- `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-27-workout-builder-live-review-ux-and-actions-10-10.md`
- Preserve shipped pool-builder semantics from:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-09-pool-swim-builder-repeat-rest-and-pool-size-clarity-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-08-swim-session-builder-support-tools-pool-size-and-poolside-focus-polish-10-10.md`
- Likely implementation surfaces:
  - `app/my-library/workouts/[workoutId]/page.tsx`
  - `app/my-library/workouts/page.tsx`
  - `components/my-library/workouts/WorkoutBuilderHub.tsx`
  - `components/my-library/workouts/WorkoutEditor.tsx`
  - `tests/unit/workout-builder-hub.test.tsx`
  - `tests/e2e/my-library-workout-builder.spec.ts`
- Locked boundaries:
  - no canonical workout schema changes,
  - no repeat/rest execution rewrite,
  - no pool-size parsing or unit-contract rewrite,
  - no export or handoff contract rewrite,
  - no broad desktop redesign,
  - no My Library shell redesign outside the workout-builder route surfaces touched here.

## Product Direction Locked By This Brief

- This slice is mobile-first density and action prioritization, not a workout-model redesign.
- Phone-width layouts should reclaim width first by reducing gutters, internal padding, and redundant vertical spacing.
- Step cards on mobile should use progressive disclosure for secondary actions instead of exposing the full action wall at all times.
- Desktop and larger tablet layouts should largely preserve the current higher-density authoring pattern where that still improves speed.
- Primary workout semantics, step ordering behavior, repeat behavior, pool-size behavior, save behavior, PDF truthfulness, Garmin-ready export truthfulness, and handoff truthfulness must remain unchanged.
- No new component library or parallel layout system may be introduced.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief closeout:

- `UX flow clarity`
- `Visual design quality`
- `Admin editor ergonomics`
- `Admin workflow and editability`
- `Testing and QA automation`

Strict 10/10 mode for this brief:

- every declared `target` category must close at `5/5`

| Category                                      | Mapping      | Threshold For This Brief                                                                                                                                                  | Evidence                            | Expected Closeout |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ----------------- |
| Product goals and IA                          | `target`     | The builder route must present one clear mobile authoring lane with less shell waste, clearer hierarchy, and a tighter header-to-editor transition.                       | screenshot review + code review     | `5/5`             |
| UX flow clarity                               | `target`     | On phone width, the builder must feel meaningfully wider, calmer, and easier to scan, with step actions prioritized instead of dumped into full-width button walls.       | mobile screenshot/manual QA + e2e   | `5/5`             |
| Visual design quality                         | `target`     | Mobile layouts must show tighter spacing rhythm, more intentional width usage, and more disciplined action density without regressing the existing visual language.       | screenshot review + code review     | `5/5`             |
| Business logic correctness and data integrity | `supporting` | Layout and action-priority changes must not alter canonical step ordering, repeat behavior, pool-size behavior, or save/export semantics.                                 | targeted unit/e2e + code review     | `4/5`             |
| Admin editor ergonomics                       | `target`     | The owner-facing builder must reclaim enough mobile width and reduce enough action clutter that common step editing feels faster and less cramped on phone-sized screens. | mobile QA + targeted tests          | `5/5`             |
| Accessibility (a11y)                          | `supporting` | Focus order, labels, button semantics, disclosure state, and destructive-action clarity must remain intact after mobile action reprioritization.                          | targeted review + existing coverage | `4/5`             |
| Performance (CWV + payloads)                  | `supporting` | The slice must simplify layout and action presentation without introducing heavy runtime abstractions or significant payload cost.                                        | build/verify evidence + code review | `4/5`             |
| Data placement and sync boundaries            | `supporting` | The existing local-vs-canonical state contract must remain unchanged and explicit.                                                                                        | brief contract + code review        | `4/5`             |
| Caching and invalidation strategy             | `N/A`        | N/A: this slice does not change fetch paths, cache keys, or invalidation behavior.                                                                                        | scope rationale                     | `N/A`             |
| Reliability and failure handling              | `supporting` | Error, warning, save-state, and destructive-confirmation surfaces must remain visible and truthful after mobile density tightening.                                       | targeted review + manual QA         | `4/5`             |
| Security and authz                            | `N/A`        | N/A: no permission model, protected route policy, or security-sensitive logic changes are introduced.                                                                     | scope rationale                     | `N/A`             |
| Privacy and compliance                        | `N/A`        | N/A: owner-facing layout cleanup does not change sensitive-data classes, consent, or retention.                                                                           | scope rationale                     | `N/A`             |
| Content governance                            | `supporting` | The slice must stay aligned with the containment audit and provide a reusable mobile-density pattern for later builder cleanup.                                           | brief review + implementation diff  | `4/5`             |
| Admin workflow and editability                | `target`     | Mobile editing must still expose all necessary actions, but secondary actions should move to a lower-noise pattern that does not block the primary editing lane.          | mobile QA + targeted tests          | `5/5`             |
| SEO and crawlability                          | `N/A`        | N/A: authenticated builder surfaces only, with no public crawl contract.                                                                                                  | scope rationale                     | `N/A`             |
| AI discoverability                            | `N/A`        | N/A: no public semantic metadata or AI-facing route changes.                                                                                                              | scope rationale                     | `N/A`             |
| Analytics and KPI observability               | `supporting` | Existing analytics and event wiring must remain intact where already present; no new analytics requirement is introduced by this UI density slice.                        | code review + scope rationale       | `4/5`             |
| Commerce and revenue ops                      | `N/A`        | N/A: no pricing, entitlement, or billing scope.                                                                                                                           | scope rationale                     | `N/A`             |
| Incident response and support operations      | `N/A`        | N/A: no production support workflow contract changes beyond mobile presentation of an internal owner-facing builder.                                                      | scope rationale                     | `N/A`             |
| Finance and reporting operations              | `N/A`        | N/A: no finance or reconciliation impact.                                                                                                                                 | scope rationale                     | `N/A`             |
| i18n operational readiness                    | `N/A`        | N/A: no locale architecture or translation workflow changes are introduced by this mobile density slice.                                                                  | scope rationale                     | `N/A`             |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing builder stack, Tailwind, and repo-native modal/disclosure primitives; do not add a new UI dependency for mobile action handling.                       | dependency diff + code review       | `5/5`             |
| Testing and QA automation                     | `target`     | Targeted tests must protect mobile density behavior, action availability, and unchanged builder semantics before PR handoff.                                              | unit/e2e coverage + `verify:pre-pr` | `5/5`             |
| Scalability and cost efficiency               | `supporting` | The slice should reduce long-term UI noise and wrapper complexity rather than add new layers of maintenance overhead.                                                     | diff review                         | `4/5`             |
| DevOps and rollback readiness                 | `supporting` | The mobile tightening must remain reversible in the touched route and builder component paths with no schema drift or rollout complexity.                                 | rollback note + PR summary          | `4/5`             |

## Data Placement And Sync Contract

- Server-canonical:
  - saved workout rows,
  - canonical workout draft payload,
  - repeat and pool-size semantics,
  - export and handoff truthfulness state.
- Local-only:
  - step open/closed state,
  - temporary action-sheet or overflow state introduced by this slice,
  - temporary notices,
  - unsaved local draft edits,
  - local delete confirmations,
  - local print-style and poolside-focus selections that already exist.
- Sync policy:
  - this slice must not introduce any new persisted UI-only state,
  - save/delete/export actions must keep the current canonical flow unchanged,
  - mobile action disclosure state resets locally and must not affect saved workout payloads.
- Retention and sensitivity:
  - no new sensitive data,
  - no retention policy change.
- Cache and invalidation:
  - unchanged from the current builder contract.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the only canonical workout identity.
- Human-readable identifiers:
  - builder headings, button labels, helper copy, and mobile action labels remain mutable display text only.
- Mutability rules:
  - this slice may shorten or regroup visible labels for mobile ergonomics,
  - this slice must not repurpose or reinterpret workout identity.
- Compatibility contract:
  - existing workout routes and saved workouts remain valid,
  - no route or slug changes are in scope.
- Observability and repair:
  - destructive and save-state surfaces must remain explicit and testable after action reprioritization.

## Scope

- Reduce mobile route-shell width loss in:
  - `app/my-library/workouts/[workoutId]/page.tsx`
  - `app/my-library/workouts/page.tsx`
- Tighten mobile spacing in the workout-builder shell and the highest-traffic builder sections.
- Reduce mobile top-area height and redundant vertical spacing before the editor starts.
- Rework mobile step-card action presentation so only the highest-priority actions remain inline.
- Move secondary step actions into a lower-noise mobile disclosure pattern using repo-native primitives.
- Preserve desktop and larger-layout speed by keeping the broader action layout where it still works well.
- Add or update tests where mobile action presentation or route-shell density changes rendered behavior enough to require protection.

## Out Of Scope

- Rewriting workout-builder domain logic.
- Changing repeat/rest execution semantics, pool-size semantics, or export contracts.
- Desktop-wide visual redesign.
- Broad My Library shell redesign beyond the touched workout-builder routes.
- New UI dependencies or a large new shared design system abstraction.
- New operator docs unless visible workflow labels or recovery behavior materially change.

## Acceptance Criteria

1. Phone-width workout-builder routes reclaim noticeable horizontal space compared with the current shipped state.
2. The builder shell and route wrapper use smaller mobile gutters and smaller mobile internal padding without harming desktop layout.
3. The top area above the active editor feels shorter and calmer on mobile.
4. Step cards no longer expose the full wall of peer actions inline on mobile.
5. Secondary step actions remain reachable on mobile through a lower-noise disclosure pattern, with destructive actions still clearly separated.
6. Desktop and larger layouts keep efficient authoring access and do not regress into mobile-only constraints.
7. Canonical save, step ordering, repeat behavior, pool-size behavior, PDF truthfulness, Garmin-ready export truthfulness, and handoff truthfulness remain unchanged.
8. Relevant tests and brief/help contract handling are included, with explicit `N/A` rationale if no Help/Guide update is needed.

## Manual QA Environments

- Phone width:
  - iPhone-sized viewport
  - Android mobile viewport
- Tablet width:
  - narrow tablet check where mobile density rules may still apply
- Desktop width:
  - confirm larger layouts keep their faster action density where intended
- Builder route scenarios:
  - saved pool workout,
  - manual pool create entry,
  - repeat block present,
  - support/export panel expanded,
  - destructive remove flow,
  - step add/duplicate/move flow.

## Constraints

- Preserve existing product meaning and canonical behavior.
- Reclaim width before introducing more visual complexity.
- Mobile-first density is the point of this slice; desktop should only change where necessary.
- Secondary actions may move, but they must not become hard to discover.
- Destructive actions must remain explicit and accessible.
- Favor spacing, hierarchy, and progressive disclosure over extra wrappers or extra copy.

## 10/10 Quality Bar

- The builder must stop feeling like a narrow card floating inside unused white margins on iPhone-sized screens.
- Mobile step cards must feel focused and scannable, not like miniature action dashboards.
- The layout should visibly use more of the available screen width while staying calm and readable.
- Progressive disclosure must reduce clutter without hiding important workflow choices.
- The slice must be small enough to ship safely while still producing an obvious mobile-quality jump over the previous step.

## 10/10 Cross-Cut Categories

- Content governance and source-of-truth:
  - this slice applies the containment audit to mobile density and action hierarchy inside the builder without changing the canonical workout model.
- Identity and rename safety:
  - no identity contract changes; visible labels remain mutable display text only.
- Taxonomy and category management:
  - `N/A`; no taxonomy model changes.
- Workflow and publishing safety:
  - the mobile action pattern must preserve the same underlying workflow and destructive safeguards.
- Business logic correctness and data integrity:
  - mobile layout cleanup must preserve repeat, pool, export, and save semantics exactly.
- RBAC and auditability:
  - `N/A`; no permission or audit-log contract change.
- UX/UI quality contract:
  - must reclaim mobile width, reduce noise, and preserve action clarity through progressive disclosure.
- Admin editor ergonomics:
  - must improve one-handed editing and scanning on phone-sized screens without punishing desktop users.
- Performance contract:
  - must simplify or restack structure rather than add heavy client cost.
- Data placement and sync boundaries:
  - no new persisted UI-only state; current local-vs-canonical split stays intact.
- Caching and invalidation strategy:
  - `N/A`; unchanged by this slice.
- Testing contract:
  - targeted tests must protect action access, disclosure state, and unchanged semantics where it matters.
- Observability and KPI tracking:
  - existing observability must not regress; no new analytics requirement.
- Incident response and support operations:
  - `N/A`; owner-facing mobile presentation only, with no new production support workflow.
- Finance and reporting operations:
  - `N/A`; no finance surface changes.
- i18n operational readiness:
  - `N/A`; no new localization blocker introduced.
- Stack-fit and dependency discipline:
  - use existing repo patterns only.
- Scalability and cost efficiency:
  - reduce UI noise and maintenance drift rather than adding more wrappers or bespoke variants.
- Migration and rollback readiness:
  - keep the diff reversible in the touched route and builder component paths.
- Definition of done quant targets:
  - mobile route shell, mobile editor density, and mobile step action hierarchy all show a visible quality improvement without semantic regression.
- Help/Guide and operator training documentation:
  - `N/A` unless mobile-visible action labels or recovery wording change enough to require an update.

## Help/Guide And Operator Training Contract

- `N/A` by default.
- Rationale:
  - this slice is scoped to owner-facing mobile presentation and action density, not to a workflow contract rewrite.
- If the implementation materially renames visible actions or changes destructive-action wording, the implementation PR must revisit this section and either update relevant guidance or replace `N/A` with the exact documentation delta.

## Validation

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- targeted `vitest` for workout builder behavior
- targeted Playwright for the workout builder route
- before PR update: `npm run verify:pre-pr`
- before merge recommendation: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm installed locally.

## Checkpoint Log

- `2026-04-10 | in-progress | created the mobile density and width reclaim child brief in a fresh isolated worktree from main so step-2 builder cleanup can proceed without touching unrelated local changes | next: tighten route-shell/mobile spacing, reprioritize step actions on phone-width layouts, and add targeted tests before running the normal gates`
- `2026-04-10 | in-progress | tightened route-shell and builder mobile spacing, moved step/repeat secondary actions behind progressive disclosure on phone-width layouts, added targeted unit + mobile e2e coverage, and completed a green local verify:pre-pr run in the isolated worktree | next: commit, push, open the implementation PR, and run verify:pre-merge before final merge-readiness call`
- `2026-04-10 | done | merged implementation PR #404 as 5c23d49, completed green local verify:pre-merge plus green required CI, and moved the brief to done in a docs closeout branch | next: none`
