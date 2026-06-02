# Task Brief: AW-006 Mobile Action Layout And Button Semantics Audit (10/10)

## Metadata

- `id`: `2026-06-02-aw-006-mobile-action-layout-button-semantics-audit-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-02`
- `updated`: `2026-06-02`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `design_contract`: `docs/design/mobile-action-layout-contract.md`
- `execution_mode`: `owner-approved implementation with screenshot approval stop`

## Brief Audit Record

- `last_audited`: `2026-06-02`
- `base`: `main@d416dd8`
- `audit_status`: `ready`
- `decision`: Execute this as the current owner-approved AW-006 mobile action layout audit and bounded small-fix slice.
- `reason`: PR `#945` and repo-managed closeout PR `#946` are merged, `main` is clean at `d416dd8`, `npm run post-merge:preflight` passed with no pending closeout, and a fresh queue/design/code re-audit found no active AW-006 implementation slice. The queue, design inventory, and WorkoutEditor support-tools closeout identify this mobile action layout audit as the next continuation of the recent design-token/action parity track. Owner approved auditing the already-migrated AW-006 surfaces as a control pass and implementing only clear mobile action contract violations, not another broad polish round.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `docs/design/mobile-action-layout-contract.md`, `components/ui/actionLayout.ts`, recently completed AW-006 token/action surfaces, screenshot handoff rules, route/label/support sweep rules, forward compatibility rules, or verification lanes change before screenshot handoff.

## Goal

Audit and align mobile action groups and button semantics across the app so action placement,
width, priority, color, and overflow behavior are predictable on compact screens.

## Pre-Implementation Owner Explanation

For ikke-programmerer: Vi skal sjekke knappene pa mobil i hele appen, inkludert flatene vi allerede
har ryddet i de siste AW-006-slicene. Maalet er a sikre at de samme knappereglene faktisk holder pa
tvers av Home, Course, Auth, My Library, Workouts, Dryland, Guides, Admin, policy/QR og supportflater.

Hvorfor det betyr noe: Brukeren skal laere at bla betyr hovedhandling, outline betyr støttehandling,
farehandlinger skiller seg ut, og knappene foler seg planlagt uansett om det er to, tre, fire eller
flere handlinger.

Utenfor scope: Dette er ikke en ny full redesignrunde og ikke en "endre alle knapper"-PR. Vi endrer
bare tydelige kontraktsbrudd som audit finner: feil primary/secondary/danger-semantikk, orphan-rad pa
mobil, klemt tekst, eller synlige komplekse action-grupper uten grouping/overflow. Vi endrer ikke
data, betaling, auth, eksportinnhold, API-er, analytics, Help/Guide eller supportflyt.

Fremoverkompatibilitet: Nye actions skal automatisk bruke den delte mobile action group-regelen nar
de passer inn i eksisterende actionhierarki. Nye komplekse grupper, seks eller flere synlige actions,
ukjente workflow-stater, nye danger-actions, betalings-/auth-/workflow-actions eller nye overflowvalg
krever eksplisitt mapping, test og screenshot-evidence.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                        | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Main user/admin action surfaces keep their current IA while mobile action priority becomes predictable and documented.                                                    | route inventory + screenshot handoff        | `5/5`                   |
| UX flow clarity                               | `target`     | Primary, secondary, mode, danger, and recovery actions are visually distinguishable and avoid orphan final-row actions on supported mobile widths.                        | before/after screenshots + focused tests    | `5/5`                   |
| Visual design quality                         | `target`     | Mobile action groups follow the shared 1/2/3/4/5-plus threshold rules, responsive text fit, and current `fs-cta-*` semantics.                                             | design contract + screenshots               | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Layout and styling changes do not alter action callbacks, request payloads, persistence, exports, or state transitions.                                                   | code review + regression tests              | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admin action groups retain operator scanability and do not hide required workflow actions without documented overflow behavior.                                           | admin route screenshots + tests             | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Changed buttons keep accessible names, keyboard/focus behavior, disabled semantics, touch target sizing, and no text overlap.                                             | Testing Library assertions + screenshot QA  | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new runtime dependency, media payload, network request, polling, or heavy client state is introduced for action layout.                                                | dependency diff + pre-PR gate               | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Local/server data ownership for changed workflows remains unchanged; layout helpers do not own domain state.                                                              | changed-files review + brief scope          | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this planned slice should not change route cache modes, revalidation, server fetch policy, or invalidation behavior.                                          | explicit cache scope rationale              | `N/A`                   |
| Reliability and failure handling              | `target`     | Error/retry/recovery buttons remain reachable and do not move into hidden overflow unless the recovery path is still explicit.                                            | negative-path UI tests + screenshots        | `5/5`                   |
| Security and authz                            | `target`     | Authenticated/admin/protected action boundaries remain untouched and fail-closed behavior is not weakened by layout changes.                                              | auth boundary review + existing tests       | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because this planned slice should not change personal data fields, telemetry payloads, legal copy, consent, logs, secrets, or retention behavior.                     | explicit privacy scope rationale            | `N/A`                   |
| Content governance                            | `target`     | The design contract, AW-006 queue, and completed closeout clearly record which surfaces were audited and which were deferred.                                             | docs diff + brief lint                      | `5/5`                   |
| Admin workflow and editability                | `target`     | Admin workflow labels and actions keep meaning; any overflow or grouping change is documented with Help/Guide impact if it changes operator behavior.                     | admin sweep + Help/Guide rationale          | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this planned slice should not change public metadata, sitemap, robots, canonical URLs, structured content, or indexability.                                   | explicit SEO scope rationale                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this planned slice should not change AI-facing public entity structure, crawl-safe semantics, or public documentation contracts.                              | explicit AI-discoverability scope rationale | `N/A`                   |
| Analytics and KPI observability               | `target`     | Existing analytics event names and payload values remain unchanged unless a later owner-approved slice explicitly maps an action move or overflow event.                  | analytics diff review                       | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting because commerce actions may be audited visually, but Stripe, checkout, portal, entitlement, finance, and reporting behavior must remain unchanged.            | commerce route screenshot + no API diff     | `4/5`                   |
| Incident response and support operations      | `N/A`        | N/A with scope rationale: this planned slice should not change incident response, support escalation, alerting, runbooks, or support diagnostics.                         | explicit support-ops scope rationale        | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this planned slice should not change finance reports, payouts, refunds, invoices, reconciliation, tax, or provider financial data.              | explicit finance scope rationale            | `N/A`                   |
| i18n operational readiness                    | `target`     | Mobile button groups tolerate longer labels by stacking full-width rows, wrapping safely, or moving excess actions to overflow instead of relying on English-only widths. | text-fit screenshots + focused tests        | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `components/ui/actionLayout.ts`, current `fs-cta-*`, route-local helpers, and mature reference surfaces; add no broad dependency.                                   | changed-files/dependency diff               | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused tests for migrated helper usage and screenshot coverage for representative mobile routes before broad gates.                                                  | unit/component tests + screenshot artifacts | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: layout consolidation should reduce future UI drift without adding service cost, storage, queues, jobs, or network work.                                  | implementation review                       | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal revert restores previous UI; no migration, dependency, provider setting, env value, generated artifact, or feature flag rollback is required.                      | git diff + validation evidence              | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js: keep route ownership and action callbacks in their existing components; use shared
  layout helpers only for presentation.
- TypeScript: encode mobile grouping rules through reusable helper contracts rather than ad hoc class
  strings per surface.
- UI system: start from `docs/design/mobile-action-layout-contract.md`,
  `components/ui/actionLayout.ts`, `fs-cta-*`, guide tracker overlay action rows, and WorkoutEditor
  as reference surfaces.
- Testing: use focused unit/component assertions for class contracts and screenshot handoff for
  visible mobile surfaces.
- Dependencies: no new dependency unless a later owner-approved slice proves it materially improves
  quality and reduces local duplication.

## Forward Compatibility Contract

- Future actions should inherit semantic role and mobile group behavior from shared helpers.
- Future five-action groups require a prioritization review before release.
- Future six-or-more visible mobile action groups require explicit grouping, overflow, or surface
  split decisions.
- Unknown labels or longer localized strings must fail into wrapping, full-width, or overflow
  behavior instead of clipping or creating orphan final-row buttons.
- Any new destructive, payment, auth, admin workflow, export, or recovery action needs explicit
  color/placement mapping and screenshot evidence.

## Scope

- Audit main mobile action groups across public, member, admin, commerce, guide, workout, program,
  dryland, auth, support, recovery, and recently completed AW-006 token/action surfaces.
- Mark audited surfaces as `pass`, `needs small fix`, or `defer`.
- Migrate only clear low-risk contract violations found in this audit.
- Update tests and screenshots for each migrated route or shared surface.

## Audit Inventory

| Surface group                                 | Status            | Finding / Decision                                                                                                                                                                                                                                                                         |
| --------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Home primary actions                          | `pass`            | Primary Home actions are already stacked as full-width action cards; signed-in routine quick actions use a stable two-column mobile grid. Footer auth/admin utility links are compact navigation utilities, not the primary action group for this slice.                                   |
| Public policy and QR fallback pages           | `pass`            | `/go/unavailable` already follows the #932 rule: when retry is present, the retry action is full-width above two secondary actions; without retry, the two secondary actions render as equal columns. `/privacy` and `/cookies` have no new mobile action contract violation in this pass. |
| Course support/install/backup surfaces        | `defer`           | The support card stacks dynamic support links intentionally and keeps support priority explicit. Conditional fixed backup/install prompts still use local two-action rows; they need a dedicated course-prompt pass only if owner wants those transient prompts migrated with screenshots. |
| Guide trackers and guide access states        | `pass`            | Guide tracker overlay actions already use a two-column mobile action shell; guide access states use full-width stacked actions on mobile and desktop-auto actions.                                                                                                                         |
| My Library route header actions               | `needs small fix` | Already-completed AW-006 route shells still used direct `flex flex-wrap`, so one mobile action stayed compact and two actions were not equal columns. Fixed in this slice with `getMobileActionGroupClass` and `mobileActionItemClass`.                                                    |
| My Swim Sessions builder and Poolside Preview | `needs small fix` | `WorkoutBuilderHub` browse actions and confirmation actions used direct flex rows; Poolside Preview used three mixed local buttons. Fixed in this slice with shared mobile grouping, text-fit stacking for longer browse labels, and primary/secondary token semantics.                    |
| WorkoutEditor and SessionStepSurfaceRenderer  | `pass`            | PR #945 already migrated support-tools, metadata, mode, add, mobile overflow, PDF, handoff, and undo actions to the shared mobile layout helper.                                                                                                                                           |
| SavedWorkoutsPanel mobile actions             | `pass`            | Saved-session row actions already collapse behind a `More actions` disclosure on mobile; the revealed panel is an intentional vertical overflow panel, not an equal visible top-level action group.                                                                                        |
| Dryland inner editor and Micro Sessions       | `pass`            | Recently completed dryland slices use tokenized action classes and explicit local grouping; no clear orphan-row or semantic color violation was found in the representative pass.                                                                                                          |
| Admin manager/action surfaces                 | `defer`           | Top-level admin token/action parity is recorded as shipped, but several admin internals have dense conditional workflow controls. This slice records them as deferred unless a future admin-specific audit identifies a concrete operator mobile failure with screenshots.                 |
| Commerce/auth/payment-adjacent actions        | `pass`            | Existing checkout/auth action surfaces keep their token semantics and no Stripe/auth payload, status, or security boundary changes are needed for this layout pass.                                                                                                                        |

## UI Debug / Artifact Evidence

- Visual/debug runbook: use `docs/runbooks/ui-debug-hypothesis-and-handoff.md` for local screenshot
  capture and hypothesis checks before broad gates.
- Actual consumed artifact scope: Poolside Preview action chrome changes are validated in the
  rendered page and screenshots. This slice does not change generated PDF/image bytes, filenames,
  print HTML, export payloads, or screenshot capture drivers.
- Screenshot handoff captured: `2026-06-02 11:14` Europe/Oslo, `after/reference`, artifacts under
  `/Users/stianvikra/freeswimming/output/aw006-mobile-action-layout-2026-06-02-111430`.
- Capture caveat: local dev auth was blocked by the Supabase egress guard because `.env.local`
  points at a cloud Supabase project in local/test context. The screenshot set therefore used a
  temporary local harness rendering the same `WorkoutBuilderHub`, `PoolsidePreviewPageClient`, and
  `components/ui/actionLayout.ts` helpers with representative data. The temporary harness was
  removed before handoff; final product-rendering files changed by this slice were not modified
  after screenshot capture.
- Owner approval stop: pause here for visual approval before `npm run verify:pre-pr`, PR creation,
  or `npm run verify:pre-merge`.
- High-cost/export guard: if screenshot or Poolside Preview validation contradicts the claimed
  layout fix twice, switch to the high-cost bug protocol and check
  `docs/runbooks/high-cost-debug-log.md` before more patching.

## Route / Label / Support Surface Sweep

Required because this slice changes visible route-header actions and Poolside Preview actions.

- Identifiers searched:
  - `getMobileActionGroupClass`
  - `mobileActionItemClass`
  - `mobile-action-layout-contract`
  - `route-actions`
  - `workout-builder-browse-actions`
  - `workout-builder-current-workout-confirm-actions`
  - `workout-builder-current-draft-confirm-actions`
  - `poolside-preview-actions`
  - `Poolside Preview`
  - `Print / Save PDF`
  - `Save image`
  - `Back to My Library`
  - `Back to My Swim Sessions`
  - `Dryland Sessions`
  - `Open goals`
  - `My Swim Sessions`
- Surfaces checked:
  - `app/my-library/`
  - `components/my-library/workouts/`
  - `components/my-library/dryland/`
  - `components/guides/`
  - `app/course/page.tsx`
  - `app/go/unavailable/page.tsx`
  - `app/page.tsx`
  - `components/admin/`
  - `tests/unit/`
  - `tests/e2e/`
  - `docs/design/`
  - `docs/task-briefs/`
  - `docs/runbooks/`
- Fallout handled:
  - Runtime changes are limited to visible layout/token classes on existing actions.
  - Existing labels, hrefs, callbacks, disabled states, API payloads, auth boundaries, analytics
    events, Help/Guide content, support procedures, export payloads, and generated artifacts are
    unchanged.
  - Admin internals and transient course prompts are recorded as deferred, not silently changed.

## Session-Step / Workout Domain Evidence

- Reference contract: `docs/design/session-step-surface-contract.md`.
- `SessionStepSurfaceRenderer` and `WorkoutEditor` were checked as part of this audit and are
  recorded as `pass` because PR #945 already moved their session-step action groups to
  `components/ui/actionLayout.ts`.
- This slice does not change session-step data, workout data, repeat/rest logic, generated artifacts,
  local draft storage, save/delete/discard behavior, or shared renderer contracts.

## Out Of Scope

- No data model, route contract, API, Supabase, Stripe, auth, analytics, export payload, generated
  artifact, Help/Guide, or support workflow change without a later approved implementation brief.
- No broad visual redesign beyond action placement, width, color role, grouping, and overflow.
- No aesthetic re-polish of already completed AW-006 surfaces that pass the mobile action contract.

## Acceptance Criteria

1. A route/surface inventory identifies mobile action groups and their semantic roles.
2. Already-completed AW-006 token/action surfaces are checked as a control pass and recorded as
   `pass`, `needs small fix`, or `defer`.
3. Migrated surfaces use the shared mobile action layout contract or document a justified exception.
4. Primary, secondary, danger, recovery, mode, and overflow actions use consistent visual semantics.
5. Mobile layouts avoid orphan final-row buttons and text overflow on representative viewport widths.
6. Six-or-more visible actions are grouped, split, or moved to overflow with documented rationale.
7. Existing callbacks, data flows, analytics, auth, persistence, exports, and support behavior remain
   unchanged unless explicitly approved.
8. Focused tests and screenshot handoff pass before broad gates.

## Validation

- Targeted unit/component tests for changed helper usage.
- Route/label/support sweep for changed labels, actions, and Help/Guide impact.
- Screenshot handoff across representative mobile surfaces.
- `npm run verify:pre-pr` passed locally on `2026-06-02` after owner screenshot approval:
  - full public lane selected because runtime/test files changed,
  - unit suite passed: `224` files, `1310` tests,
  - build passed,
  - performance budgets passed with `hold` recommendation,
  - E2E passed: `102` passed, `492` skipped.
- `npm run verify:pre-merge`

## Implementation Checkpoint Log

- `2026-06-02 | planned | created as the global follow-up for mobile action layout and button semantics after the WorkoutEditor support-tools slice introduced the reusable mobile action layout contract; this planned brief is not active implementation | next: select only after the current WorkoutEditor PR is merged and post-merge preflight is clean`
- `2026-06-02 | in-progress | started from clean main@d416dd8 after PR #945 and repo-managed closeout #946; post-merge preflight passed with no pending closeout; owner approved continuing the design-token/button-semantics track with an audit of already completed AW-006 surfaces plus bounded low-risk mobile action fixes only | next: audit representative public/member/admin/support action surfaces, update queue references, implement only clear contract violations, then run focused tests and screenshot handoff before broad gates`
- `2026-06-02 | implementation | completed representative audit inventory; fixed clear mobile action contract violations in My Library route headers, WorkoutBuilderHub browse/confirmation actions, and Poolside Preview print/save/close actions using components/ui/actionLayout.ts; recorded pass/defer decisions for public, course, guide, admin, commerce/auth, WorkoutEditor, saved-workout overflow, and dryland surfaces | next: run focused tests, targeted route/label/support sweep, and screenshot handoff before broad gates`
- `2026-06-02 | visual correction | owner flagged the wrapped half-width "Build open water session" label; added a documented text-fit override to docs/design/mobile-action-layout-contract.md, added stackOnMobile to components/ui/actionLayout.ts, and moved WorkoutBuilderHub browse actions to full-width mobile rows while keeping desktop flex behavior | next: rerun targeted tests and screenshot handoff`
- `2026-06-02 | screenshot handoff | captured after/reference mobile screenshots under output/aw006-mobile-action-layout-2026-06-02-111430 using a temporary local harness because dev auth was blocked by Supabase egress guard; removed the harness after capture and left final runtime files unchanged after screenshot capture | next: wait for owner visual approval before npm run verify:pre-pr`
- `2026-06-02 | owner approval | owner approved the refreshed mobile screenshot handoff for the text-fit stack correction; no product-rendering files changed after capture | next: run npm run verify:pre-pr`
- `2026-06-02 | pre-pr gate | npm run verify:pre-pr passed the full public lane locally with unit/build/perf/e2e green; E2E reported 102 passed and 492 skipped under the existing auth-gated local matrix | next: commit, push, open PR, then monitor CI before npm run verify:pre-merge`
