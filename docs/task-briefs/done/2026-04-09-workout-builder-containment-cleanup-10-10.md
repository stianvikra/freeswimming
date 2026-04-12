# Task Brief: Workout Builder Containment Cleanup (10/10)

## Metadata

- `id`: `2026-04-09-workout-builder-containment-cleanup-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-09`
- `updated`: `2026-04-10`

## Goal

Apply the new containment and border-hierarchy standard to the swim workout builder shell and the highest-impact framed surfaces inside `WorkoutEditor`, so manual authoring gains usable width and calmer hierarchy without changing canonical workout, repeat/rest, pool-size, or export semantics.

## Why This Brief Exists

- The new platform containment audit identified `components/my-library/workouts/WorkoutEditor.tsx` as the highest-priority first implementation target, with `106` bordered rounded wrappers in one editor file.
- The current workout builder still stacks a framed `WorkoutBuilderHub` shell around an already heavy editor, then adds more framed sections inside the editor for pool size, support tools, exports, poolside note, and repeat blocks.
- The pool-size area currently uses an outer framed section plus two inner framed cards before the user reaches the exact input, which is precisely the `box in box` pattern the audit is meant to stop.
- This is the best first proof slice because it affects a high-frequency owner workflow and can improve mobile width efficiency without reopening canonical workout logic.

## Dependencies And Boundaries

- Parent containment audit:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-04-09-platform-containment-and-border-hierarchy-audit-10-10.md`
- Existing workout-builder UX parent that still owns broader workflow decisions:
- `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-27-workout-builder-live-review-ux-and-actions-10-10.md`
- Preserve shipped pool-builder semantics from:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-09-pool-swim-builder-repeat-rest-and-pool-size-clarity-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-04-08-swim-session-builder-support-tools-pool-size-and-poolside-focus-polish-10-10.md`
- Likely implementation surfaces:
  - `components/my-library/workouts/WorkoutBuilderHub.tsx`
  - `components/my-library/workouts/WorkoutEditor.tsx`
  - `tests/unit/workout-builder-hub.test.tsx`
  - `tests/e2e/my-library-workout-builder.spec.ts`
- Locked boundaries:
  - no canonical workout schema changes,
  - no repeat/rest behavior rewrite,
  - no pool-size parsing or unit-contract rewrite,
  - no saved-session browse-route redesign in this slice,
  - no admin-panel containment work in this slice.

## Product Direction Locked By This Brief

- This slice is a containment and hierarchy cleanup, not a workflow or data-model redesign.
- The platform audit rule applies here:
  - normal visible content stacks should stay at a maximum of `2` containment levels,
  - a third level is allowed only where the surface is a genuinely separate unit with separate state, actions, or ownership.
- Step cards and repeat blocks may remain visually distinct where they represent real authoring units.
- Layout-only groups must prefer spacing, headings, and tone before another bordered card.
- Mobile width efficiency is a first-class quality gate, not a desktop-only afterthought.
- Canonical workout save, repeat semantics, pool-size semantics, PDF/poolside note truthfulness, Garmin-ready export, and handoff semantics must remain unchanged.
- No new UI dependency, alternate component library, or parallel layout system may be introduced.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief closeout:

- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Admin editor ergonomics`
- `Testing and QA automation`

Strict 10/10 mode for this brief:

- every declared `target` category must close at `5/5`

| Category                                      | Mapping      | Threshold For This Brief                                                                                                                                                 | Evidence                              | Expected Closeout |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- | ----------------- |
| Product goals and IA                          | `target`     | The slice must reduce framed noise in the builder while keeping the editor legible as one primary authoring surface with truthful section grouping.                      | brief review + screenshot/code review | `5/5`             |
| UX flow clarity                               | `target`     | The builder must feel calmer and wider on phone and desktop, with less chrome between the user and primary controls.                                                     | manual QA + screenshot review         | `5/5`             |
| Visual design quality                         | `target`     | Targeted builder surfaces must follow the new containment hierarchy with fewer nested cards, calmer headings, and stronger spacing rhythm.                               | screenshot review + code review       | `5/5`             |
| Business logic correctness and data integrity | `target`     | Visual cleanup must not alter canonical workout save/export/handoff/pool-size/repeat behavior or obscure meaningful structural boundaries.                               | targeted unit/e2e + code review       | `5/5`             |
| Admin editor ergonomics                       | `target`     | The owner-facing builder must gain usable width and lower edit-density friction without adding extra clicks for common tasks.                                            | manual QA + route review              | `5/5`             |
| Accessibility (a11y)                          | `supporting` | Heading hierarchy, grouping semantics, focus order, and control labeling must remain intact after containment cleanup.                                                   | targeted review + existing coverage   | `4/5`             |
| Performance (CWV + payloads)                  | `supporting` | The slice must simplify layout rather than add heavier runtime abstractions or payload cost.                                                                             | build/verify evidence + code review   | `4/5`             |
| Data placement and sync boundaries            | `supporting` | The brief must keep the builder's local-vs-canonical state contract unchanged and explicit.                                                                              | brief contract + code review          | `4/5`             |
| Caching and invalidation strategy             | `N/A`        | N/A: this slice does not change fetch paths, cache keys, or invalidation behavior.                                                                                       | scope rationale                       | `N/A`             |
| Reliability and failure handling              | `supporting` | Error, warning, and save-state surfaces must remain visible and truthful after chrome reduction.                                                                         | manual QA + targeted review           | `4/5`             |
| Security and authz                            | `N/A`        | N/A: no permission model, protected route policy, or security-sensitive logic changes.                                                                                   | scope rationale                       | `N/A`             |
| Privacy and compliance                        | `N/A`        | N/A: owner-facing builder containment cleanup does not change sensitive-data classes, consent, or retention.                                                             | scope rationale                       | `N/A`             |
| Content governance                            | `target`     | The slice must apply the containment audit rules concretely enough that later builder cleanup can reuse the same decisions instead of drifting back into nested-card UI. | brief review + implementation diff    | `5/5`             |
| Admin workflow and editability                | `target`     | Common builder tasks must stay editable with less visual noise, especially around pool size, support tools, and repeat authoring surfaces.                               | manual QA + targeted tests            | `5/5`             |
| SEO and crawlability                          | `N/A`        | N/A: authenticated builder surfaces only, with no public crawl contract.                                                                                                 | scope rationale                       | `N/A`             |
| AI discoverability                            | `N/A`        | N/A: no public semantic metadata or AI-facing route changes.                                                                                                             | scope rationale                       | `N/A`             |
| Analytics and KPI observability               | `supporting` | Existing analytics/tracking surfaces must remain intact where already present; no new analytics is required for this UI cleanup.                                         | code review + scope rationale         | `4/5`             |
| Commerce and revenue ops                      | `N/A`        | N/A: no pricing, entitlement, or billing scope.                                                                                                                          | scope rationale                       | `N/A`             |
| Incident response and support operations      | `N/A`        | N/A: no production support workflow contract changes beyond internal builder layout cleanup.                                                                             | scope rationale                       | `N/A`             |
| Finance and reporting operations              | `N/A`        | N/A: no finance or reconciliation impact.                                                                                                                                | scope rationale                       | `N/A`             |
| i18n operational readiness                    | `N/A`        | N/A: no locale architecture or translation workflow changes are introduced by this containment slice.                                                                    | scope rationale                       | `N/A`             |
| Stack-fit and dependency discipline           | `target`     | Reuse the existing builder stack and Tailwind/layout primitives; do not introduce a new UI system for containment cleanup.                                               | dependency diff + code review         | `5/5`             |
| Testing and QA automation                     | `target`     | Targeted coverage must protect the unchanged builder semantics while validating the new containment behavior and critical route rendering.                               | unit/e2e coverage + `verify:pre-pr`   | `5/5`             |
| Scalability and cost efficiency               | `supporting` | The slice should reduce maintenance complexity by removing wrapper drift rather than adding more wrapper variants.                                                       | diff review                           | `4/5`             |
| DevOps and rollback readiness                 | `supporting` | The cleanup must remain reversible in the touched component paths with no schema drift or rollout complexity.                                                            | rollback note + PR summary            | `4/5`             |

## Data Placement And Sync Contract

- Server-canonical:
  - saved workout rows,
  - canonical workout draft payload,
  - repeat and pool-size semantics,
  - export and handoff truthfulness state.
- Local-only:
  - panel open/closed state,
  - temporary notices,
  - unsaved local draft edits,
  - local delete confirmations,
  - local print-style and poolside-focus selections that already exist.
- Sync policy:
  - this slice must not introduce any new persisted UI-only state,
  - save/delete/export actions must keep the current canonical flow unchanged,
  - containment cleanup must not change when list/editor surfaces refresh or invalidate.
- Retention and sensitivity:
  - no new sensitive data,
  - no retention policy change.
- Cache and invalidation:
  - unchanged from the current builder contract.

## Identity And Rename Contract

- Canonical stable ID:
  - `workout.id` remains the only canonical workout identity.
- Human-readable identifiers:
  - builder headings, support labels, and helper copy remain mutable display text only.
- Mutability rules:
  - this slice may refine grouping labels and section headings,
  - this slice must not repurpose or reinterpret workout identity.
- Compatibility contract:
  - existing workout routes and saved workouts remain valid,
  - no route or slug changes are in scope.
- Observability and repair:
  - error and warning surfaces must stay explicit after containment cleanup.

## Scope

- Remove redundant outer framing where the builder shell and editor are both acting as primary cards for the same authoring surface.
- Reduce top-level containment depth inside `WorkoutEditor`, especially in:
  - pool-size authoring,
  - support/export surfaces,
  - poolside note panel,
  - top-level status/summary blocks,
  - repeat-section chrome where framing is decorative rather than meaningful.
- Integrate the pool-size surface into one calmer section instead of an outer framed area plus two inner cards.
- Simplify support/export grouping so PDF, Garmin-ready JSON, handoff, and support-status presentation use fewer nested cards while staying truthful.
- Keep repeat blocks structurally clear while avoiding decorative card multiplication around repeat metadata and action rows.
- Improve phone-width efficiency and overall content-lane width in the targeted builder surfaces.
- Add or update tests only where containment cleanup changes rendered structure, labels, or exposed controls enough to require protection.

## Out Of Scope

- Rewriting workout-builder domain logic.
- Changing repeat/rest execution semantics, pool-size semantics, or export contracts.
- Full field-by-field redesign of every label/input wrapper inside the step editor.
- Saved-session browse-route cleanup outside the builder route itself.
- Admin-notes, profile, or broader My Library shell containment work.
- New component libraries, motion systems, or broad visual-brand refresh work.

## Acceptance Criteria

1. The targeted workout-builder surfaces comply with the platform containment rule of maximum `2` normal visible containment levels, except where a third level is justified by a distinct authoring unit.
2. `WorkoutBuilderHub` no longer adds redundant card chrome around an already framed primary editor surface.
3. The pool-size area no longer uses the current outer-card plus two-inner-card structure, while preserving the shipped unit/preset/exact-size behavior.
4. Support and export surfaces become visually calmer with fewer nested cards, while preserving the same actions, truthfulness copy, and preview affordances.
5. Repeat authoring remains structurally truthful, including distinct repeat grouping and post-set rest meaning, while losing unnecessary decorative framing.
6. Phone-width layouts show improved usable width and reduced chrome in screenshot/manual review.
7. Canonical save, repeat/rest, pool-size, handoff, PDF, and Garmin-ready export behavior remain unchanged.
8. Relevant tests and brief/help contract handling are included, with explicit `N/A` rationale if no Help/Guide update is needed.

## Manual QA Environments

- Phone width
- Tablet width
- Desktop width
- Builder route with:
  - a normal saved workout,
  - a pool workout with pool-size controls,
  - a repeat block with post-set rest,
  - support/export sections expanded and collapsed

## Constraints

- Preserve existing product meaning and canonical behavior.
- Remove layout-only framing before touching true structural containers.
- Mobile width usage matters as much as desktop aesthetics.
- Do not flatten away real distinct units such as step cards, repeat blocks, or error callouts.
- Favor spacing, heading rhythm, and tone over new bordered wrappers.

## 10/10 Quality Bar

- The slice must deliver a visibly calmer workout builder without introducing ambiguity about what is a real authoring unit.
- Pool-size and support surfaces should read as integrated parts of one editor, not separate mini-apps.
- The builder should feel less like stacked admin cards and more like one intentional authoring surface.
- Reduced chrome must not make actions or state sources harder to find.
- The slice must be small enough to ship safely and clear enough to act as the template for later builder/admin containment cleanup.

## 10/10 Cross-Cut Categories

- Content governance and source-of-truth:
  - this slice is the first production implementation of the containment audit rules inside a high-frequency builder flow.
- Identity and rename safety:
  - no identity contract changes; headings and helper copy remain mutable display text only.
- Taxonomy and category management:
  - `N/A`; no taxonomy model changes.
- Workflow and publishing safety:
  - authoring flow stays truthful; grouping changes must not obscure real workflow states.
- Business logic correctness and data integrity:
  - visual cleanup must preserve repeat, pool, export, and save semantics exactly.
- RBAC and auditability:
  - `N/A`; no permission or audit-log contract change.
- UX/UI quality contract:
  - must reduce nested framing and improve mobile width without increasing confusion.
- Admin editor ergonomics:
  - must reduce width loss and card noise in the owner-facing workout editor.
- Performance contract:
  - must simplify structure rather than add heavier client cost.
- Data placement and sync boundaries:
  - no new state ownership; current local-vs-canonical split stays intact.
- Caching and invalidation strategy:
  - `N/A`; unchanged by this slice.
- Testing contract:
  - targeted tests must protect the unchanged semantics and the new rendered structure where it matters.
- Observability and KPI tracking:
  - existing observability must not regress; no new analytics requirement.
- Incident response and support operations:
  - `N/A`; internal layout cleanup only.
- Finance and reporting operations:
  - `N/A`; no finance surface changes.
- i18n operational readiness:
  - `N/A`; no new localization blocker introduced.
- Stack-fit and dependency discipline:
  - use existing repo patterns only.
- Scalability and cost efficiency:
  - reduce wrapper complexity and drift.
- Migration and rollback readiness:
  - keep the diff reversible in the touched component paths.
- Definition of done quant targets:
  - builder shell and targeted editor sections are visibly flatter and calmer with semantics preserved.
- Help/Guide and operator training documentation:
  - `N/A` unless the implementation changes operator-facing guidance text enough to require an update.

## Help/Guide And Operator Training Contract

- `N/A` by default.
- Rationale:
  - this slice is scoped to containment cleanup in an owner-facing builder and is not intended to change the underlying workflow contract.
- If the implementation ends up renaming or materially regrouping visible builder actions, the implementation PR must revisit this section and either update the relevant guidance or replace `N/A` with the exact documentation delta.

## Validation

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- before PR update: `npm run verify:pre-pr`
- before merge recommendation: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm installed locally.

## Checkpoint Log

- `2026-04-09 | planned | created the first child brief under the platform containment audit, scoped to WorkoutBuilderHub plus the highest-impact top-level WorkoutEditor containment problems so implementation can start as a small, semantics-preserving first slice | next: lint the brief, run docs validation, and open the docs PR`
- `2026-04-09 | planned | brief lint, verify:pre-pr, and verify:pre-merge all passed in the isolated worktree; branch is ready for docs-only PR handoff | next: commit, push, and open/update the PR`
- `2026-04-09 | in-progress | implementation started from main in an isolated worktree; scope stays limited to WorkoutBuilderHub plus the targeted top-level WorkoutEditor containment surfaces from this brief | next: flatten the builder shell, pool-size, support/export, poolside note, and repeat chrome without touching workout semantics`
- `2026-04-09 | in-progress | flattened the builder shell plus the targeted pool-size, support/export, poolside, and repeat-containment surfaces; targeted unit/e2e checks and full verify:pre-pr passed locally | next: commit, push, and open the implementation PR`
- `2026-04-10 | done | implementation PR #402 merged to main as 90702ade5ae83b31251430c1b9e52997fb80962a after local verify:pre-pr, local verify:pre-merge, and green required CI; brief moved to done during closeout | next: mobile density follow-up, if approved, should be scoped as a separate child brief rather than reopening this slice`
