# Task Brief: Platform Containment And Border Hierarchy Audit (10/10)

## Metadata

- `id`: `2026-04-09-platform-containment-and-border-hierarchy-audit-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-04-09`
- `updated`: `2026-04-29`

## Goal

Define and validate a platform-wide containment and border hierarchy standard that reduces box-in-box UI density, preserves clarity, improves mobile width efficiency, and creates a prioritized rollout plan for the worst affected surfaces.

## Platform 10/10 Scorecard Mapping (Required)

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief closeout:

- `UX flow clarity`
- `Visual design quality`
- `Admin editor ergonomics`
- `Testing and QA automation`

Strict 10/10 mode for this brief:

- every declared `target` category must close at `5/5`

| Category                                      | Mapping      | Threshold For This Brief                                                                                                                                              | Evidence                              | Expected Closeout |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ----------------- |
| Product goals and IA                          | `target`     | The audit must define a clear containment model, explain when surfaces are separate units vs grouped controls, and identify the highest-priority routes to fix first. | brief review + audit output           | `5/5`             |
| UX flow clarity                               | `target`     | The audit must show how excessive containment harms scanability, action clarity, and mobile flow, with route-specific before/after recommendations.                   | route audit + annotated findings      | `5/5`             |
| Visual design quality                         | `target`     | The audit must define a clear visual containment system for borders, radius, spacing, headings, and grouping, with examples of what to remove and keep.               | design rules + screenshot/code review | `5/5`             |
| Business logic correctness and data integrity | `supporting` | Recommendations must not flatten or obscure real domain structure when visual grouping changes later.                                                                 | brief review                          | `4/5`             |
| Admin editor ergonomics                       | `target`     | The audit must explicitly assess width loss, nesting overhead, and edit-density problems in admin and builder surfaces and recommend lower-friction patterns.         | route audit + prioritized hit list    | `5/5`             |
| Accessibility (a11y)                          | `supporting` | Recommendations must preserve heading hierarchy, grouping semantics, focus clarity, and readable scan order.                                                          | review checklist                      | `4/5`             |
| Performance (CWV + payloads)                  | `supporting` | Recommendations must prefer CSS and layout simplification over heavier new component layers.                                                                          | architecture review                   | `4/5`             |
| Data placement and sync boundaries            | `N/A`        | N/A: this brief is an audit and design-governance slice and does not introduce new state ownership or sync behavior.                                                  | scope rationale                       | `N/A`             |
| Caching and invalidation strategy             | `N/A`        | N/A: no caching or fetch-path contract changes are defined in this audit brief.                                                                                       | scope rationale                       | `N/A`             |
| Reliability and failure handling              | `supporting` | Recommendations must avoid designs that bury loading, error, or recovery states inside unnecessary nested wrappers.                                                   | audit checklist                       | `4/5`             |
| Security and authz                            | `N/A`        | N/A: this brief does not change protected routes, permissions, or security-sensitive logic.                                                                           | scope rationale                       | `N/A`             |
| Privacy and compliance                        | `N/A`        | N/A: no user data collection, consent, or retention behavior changes are introduced.                                                                                  | scope rationale                       | `N/A`             |
| Content governance                            | `target`     | The audit must produce one clear platform rule set for containment usage so future UI work stops reintroducing nested-card drift.                                     | brief output + follow-up slice map    | `5/5`             |
| Admin workflow and editability                | `target`     | The audit must identify which admin surfaces lose the most usable width and recommend simpler grouping patterns for high-frequency edit flows.                        | prioritized route list                | `5/5`             |
| SEO and crawlability                          | `N/A`        | N/A: no public metadata, sitemap, or crawl behavior changes in this audit slice.                                                                                      | scope rationale                       | `N/A`             |
| AI discoverability                            | `N/A`        | N/A: no public semantic content or indexable documentation surface changes in this audit slice.                                                                       | scope rationale                       | `N/A`             |
| Analytics and KPI observability               | `supporting` | The audit should define simple measurable heuristics such as containment-depth count and mobile usable-width loss for future tracking.                                | brief metrics section                 | `4/5`             |
| Commerce and revenue ops                      | `N/A`        | N/A: no pricing, entitlement, checkout, or subscription scope.                                                                                                        | scope rationale                       | `N/A`             |
| Incident response and support operations      | `N/A`        | N/A: this audit does not change production recovery flows; support impact is limited to documenting future UI cleanup priorities.                                     | scope rationale                       | `N/A`             |
| Finance and reporting operations              | `N/A`        | N/A: no finance, payout, refund, or reconciliation behavior changes in scope.                                                                                         | scope rationale                       | `N/A`             |
| i18n operational readiness                    | `N/A`        | N/A: this audit does not change locale architecture or introduce new hard blockers for future localization.                                                           | scope rationale                       | `N/A`             |
| Stack-fit and dependency discipline           | `target`     | Audit recommendations must prefer existing layout primitives, CSS, and component patterns over new dependencies or parallel UI systems.                               | architecture review                   | `5/5`             |
| Testing and QA automation                     | `target`     | The brief must define measurable containment audit heuristics and required screenshot/manual QA evidence for follow-up slices.                                        | audit checklist + validation plan     | `5/5`             |
| Scalability and cost efficiency               | `supporting` | Recommendations must reduce UI complexity rather than create more wrapper abstractions or maintenance overhead.                                                       | review                                | `4/5`             |
| DevOps and rollback readiness                 | `N/A`        | N/A: no rollout, migration, or deploy-risk change is introduced by this audit brief itself.                                                                           | scope rationale                       | `N/A`             |

## Data Placement And Sync Contract

- `N/A`
- Rationale: this is a platform audit and UI-governance brief. It does not define new persisted entities, local state ownership, server-canonical state, or synchronization behavior.

## Identity And Rename Contract

- `N/A`
- Rationale: this audit does not introduce or mutate persisted or linkable entities, IDs, slugs, or rename rules.

## Scope

- Audit platform-wide overuse of borders, nested cards, framed sections, and excessive padding/radius layers.
- Review key user and admin surfaces where containment depth harms clarity or wastes width.
- Define a platform containment hierarchy rule set:
  - when a new border is allowed,
  - when spacing and typography should replace a box,
  - maximum recommended containment depth,
  - preferred radius and padding rhythm,
  - mobile-first width preservation rules.
- Produce a prioritized hit list of the worst affected routes and components.
- Produce recommended follow-up implementation slices with clear boundaries.
- Include screenshot-backed and code-backed before/after reasoning for the most problematic examples.
- Cover both desktop and phone-width behavior.
- Include builder and admin-heavy routes where edit density matters most.

## Out Of Scope

- Implementing the cleanup across the platform in this brief.
- Full redesign of the visual system.
- Rewriting unrelated copy, workflows, or domain logic.
- Introducing a new component library or design dependency.
- Flattening UI in ways that hide real data structure or workflow states.

## Initial Audit Findings

### Confirmed Pattern

- The current platform repeatedly uses a large page shell, then medium bordered sections, then smaller bordered sub-sections, and then bordered control groups inside those again.
- This creates width loss, weakens visual hierarchy, and makes phone-width layouts feel more crowded than the information itself requires.

### Representative Evidence

- `components/my-library/workouts/WorkoutEditor.tsx`
  - `rg` count: `106` bordered rounded wrappers in the current editor file.
  - The pool-size area currently uses an outer rounded section, then two bordered inner cards for `Unit and common sizes` and `Exact pool size`, creating three containment levels before the user even reaches the input.
  - Several editor zones use `rounded-2xl border ... p-4` wrappers around subgroups that are already inside a framed step editor.
- `components/admin/AdminNotesManager.tsx`
  - `rg` count: `75` bordered rounded wrappers in the current manager file.
  - The work-queue filter area is framed as a standalone rounded card inside an already framed manager surface, and then individual controls are framed again.
  - This lowers information density and steals horizontal width from a filter-heavy admin workflow.
- `app/my-library/page.tsx`
  - `rg` count: `22` bordered rounded wrappers on the page-level route file.
  - The route starts with a large rounded shell and then stacks many rounded white sections inside it, which compounds page chrome before the user reaches actual content.
- `app/my-library/profile/page.tsx`
  - The `How this fits` explainer uses a tinted bordered parent card containing four more bordered cards, even though the child items are informational, not separate interactive units.
- `components/my-library/profile/AthleteProfileHub.tsx`
  - `rg` count: `54` bordered rounded wrappers in the current hub file.
  - The hub stacks many `rounded-3xl` or `rounded-2xl` sections in sequence, reinforcing a card-on-card editing pattern that likely reduces effective width on smaller screens.

### Priority Problem Types

- Large page shell plus many inner cards.
- Secondary subcards inside already framed editor surfaces.
- Framed filter/control groups inside framed admin work surfaces.
- Informational explainer tiles that use separate cards even when they are not separate jobs or actions.
- Repeated `p-4` and `p-5` inner wrappers that turn spacing into containment.

## Proposed Platform Rule Candidates

### Core Rule

- Maximum `2` visible containment levels in the same normal content stack.
- A third level is only allowed for:
  - destructive or warning callouts,
  - embedded media/canvas regions,
  - explicit status islands with separate actions,
  - collapsible or sortable units with distinct ownership.

### Border Admission Rule

- Add a border only if the surface has its own:
  - title or legend,
  - state or status,
  - action set,
  - ownership boundary,
  - or navigation meaning.
- If a group is only helping layout, use spacing and typography instead of a new card.

### Mobile Width Rule

- On phone widths, avoid more than `1` padded bordered wrapper between route content and the primary input/action group.
- Prefer full-width inputs and chip wraps over side-by-side inner cards.
- Avoid explanatory copy blocks that consume width and repeat what visible controls already say.

### Information Density Rule

- Filter bars, quick settings, and short form groups should default to open layouts inside a parent surface.
- Informational tiles should become plain grid items unless they are individually actionable or stateful.

## Audit Heuristics

- Count visible containment depth per route and per major panel.
- Count cumulative horizontal padding before the primary input lane on phone width.
- Flag any route where a parent shell contains multiple child cards and those child cards contain additional child cards without separate actions or state.
- Flag repeated uppercase micro-headings that only exist to label inner cards that may not need to exist.
- Flag helper copy that repeats what adjacent controls already communicate.

## Recommended Initial Targets

### P0

- `components/my-library/workouts/WorkoutEditor.tsx`
- `components/admin/AdminNotesManager.tsx`
- `app/my-library/page.tsx`

### P1

- `app/my-library/profile/page.tsx`
- `components/my-library/profile/AthleteProfileHub.tsx`
- `components/my-library/programs/ProgramBuilderHub.tsx`
- `components/my-library/dryland/DrylandBuilderHub.tsx`

### P2

- Other My Library route shells that wrap already card-heavy hubs.
- Admin panels with nested quick-capture or context-edit wrappers.

## Suggested Follow-Up Slices

1. Workout builder containment cleanup.
2. Admin editor and filter-surface containment cleanup.
3. My Library route-shell and detail-surface containment cleanup.
4. Shared surface/container primitives cleanup where safe.

## Acceptance Criteria

1. The audit defines a clear platform rule for containment hierarchy, including when borders are justified and when they are not.
2. The audit defines a practical maximum containment depth guideline for normal app surfaces.
3. The audit defines concrete spacing, radius, and grouping principles that can replace unnecessary nested boxes.
4. The audit identifies the highest-priority affected surfaces across builder, admin, and My Library flows.
5. The audit explicitly evaluates phone-width impact, not only desktop appearance.
6. The audit includes route-level examples of width loss caused by nested wrappers.
7. The audit produces a prioritized follow-up plan with small implementation slices instead of one large redesign wave.
8. The audit preserves structural truth: recommendations must not visually flatten away meaningful domain or workflow separation.
9. The brief passes `npm run lint:briefs`.
10. The final audit output is strong enough to act as a platform UI governance reference for future slices.

## Manual QA Environments

- Local visual inspection of affected routes at:
  - phone width,
  - tablet width,
  - desktop width.
- Screenshot review of representative examples from:
  - workout builders,
  - admin editing surfaces,
  - My Library forms and detail views.

## Constraints

- Prefer calmer, flatter grouping without collapsing real workflow structure.
- Use spacing, headings, and background tone before adding another bordered card.
- Mobile width efficiency is a first-class quality gate.
- Preserve existing product meaning even when reducing visual framing.
- Avoid `card for every subsection` drift.
- Prefer system coherence over one-off page fixes.

## 10/10 Quality Bar

- The audit must define a containment system that is simple enough to reuse and strict enough to prevent drift.
- Recommendations must improve scanability, usable width, and hierarchy on phone-width layouts.
- Visual cleanup must not reduce action clarity or hide important states.
- The audit must clearly distinguish between:
  - true structural containers,
  - convenience styling wrappers,
  - controls that only need spacing and labels.
- The audit must identify where nested framing hurts admin speed and edit confidence.
- The audit must produce implementation-ready recommendations, not vague design opinions.

## 10/10 Cross-Cut Categories

- Content governance and source-of-truth:
  - the containment rule set from this audit becomes the reference for future UI cleanup slices in affected routes.
- Identity and rename safety:
  - `N/A` for this audit; no persisted entity identifiers are changed.
- Taxonomy and category management:
  - `N/A` for this audit; no taxonomy model changes.
- Workflow and publishing safety:
  - recommendations must not remove meaningful workflow boundaries or state cues.
- Business logic correctness and data integrity:
  - visual flattening must never erase real data/model separation.
- RBAC and auditability:
  - `N/A` for this audit; no role or audit contract changes.
- UX/UI quality contract:
  - must increase clarity, reduce unnecessary containment, and improve mobile width usage.
- Admin editor ergonomics:
  - high-frequency admin surfaces must be explicitly reviewed for density and nesting overhead.
- Performance contract:
  - prefer layout simplification and CSS reuse over new runtime-heavy abstractions.
- Data placement and sync boundaries:
  - `N/A` for this audit; no new state ownership defined.
- Caching and invalidation strategy:
  - `N/A` for this audit; no cache behavior changes.
- Testing contract:
  - follow-up slices must include screenshot and manual QA evidence plus relevant unit/e2e coverage where layout logic changes.
- Observability and KPI tracking:
  - the audit should propose simple reusable heuristics such as containment-depth count and width-loss hotspots.
- Incident response and support operations:
  - `N/A` for this audit; no support workflow change is introduced yet.
- Finance and reporting operations:
  - `N/A` for this audit; no finance or reconciliation scope.
- i18n operational readiness:
  - `N/A` for this audit; no locale blocker is introduced.
- Stack-fit and dependency discipline:
  - recommendations must use current stack patterns.
- Scalability and cost efficiency:
  - reduce long-term UI complexity rather than adding more wrapper abstractions.
- Migration and rollback readiness:
  - follow-up cleanup slices should be incremental and easily reversible.
- Definition of done quant targets:
  - the audit must yield concrete containment rules, route priorities, and implementation slices.
- Help/Guide and operator training documentation:
  - `N/A` for this audit brief itself; update requirements will be decided per follow-up workflow-changing slice.

## Help/Guide And Operator Training Contract

- `N/A`
- Rationale: this audit defines platform UI cleanup priorities and rules, but does not directly change a shipped user or admin workflow yet.
- Requirement for follow-up slices:
  - if a chosen cleanup slice changes workflow labels, grouping, or recovery behavior, Help/Guide impact must be handled in that implementation brief.

## Validation

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- before PR update: `npm run verify:pre-pr`
- before merge recommendation: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.

## Checkpoint Log

- `2026-04-29 | done | lifecycle triage confirmed the audit brief landed through PR #400 (9d0f020) and its primary containment follow-up shipped through PR #402 (90702ad); this audit is closed as historical governance evidence | next: use new scoped briefs for any fresh containment or border hierarchy issues`

- `2026-04-09 | in-progress | created the audit brief in a clean worktree from main, confirmed the containment problem as a platform pattern, and captured initial evidence from WorkoutEditor (`106` bordered wrappers), AdminNotesManager (`75`), My Library route shell (`22`), and AthleteProfileHub (`54`) to ground the follow-up rule set and priority list | next: lint the brief, run pre-PR validation, and open a docs PR with the initial audit brief`
- `2026-04-09 | in-progress | brief lint passed and verify:pre-pr passed in the isolated worktree after loading the repo .env.local for perf/e2e coverage; no brief-specific failures were found in the full gate run | next: run verify:pre-merge, then commit, push, and open the docs PR`
- `2026-04-09 | in-progress | verify:pre-merge passed, including the private-gate regression step; the public e2e leg emitted transient Supabase network noise but still closed green with no brief-specific failures | next: remove generated artifacts, commit the docs-only brief branch, push, and open the PR`
