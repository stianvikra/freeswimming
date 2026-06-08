# Task Brief: AW-006 Design-Parity Reaudit (10/10)

## Metadata

- `id`: `2026-06-08-aw-006-design-parity-reaudit-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-08`
- `updated`: `2026-06-08`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `execution_mode`: `docs-only audit; no runtime implementation until owner selects a follow-up slice`

## Brief Audit Record

- `last_audited`: `2026-06-08`
- `base`: clean synced `main@6c78ab6e`
- `audit_status`: `ready`
- `decision`: Execute this docs-only AW-006 design-parity re-audit before selecting another product feature or Habits child slice.
- `reason`: PR `#1029` swapped the shared ding audio asset to the owner-approved/free-use MP3 and PR `#1030` closed that docs-only workstream; post-merge preflight was reported green with no pending closeout. Habits and Micro Sessions still intentionally use `/sounds/ding/ding.mp3` through the shared app playback path at volume `0.15`, so the next useful AW-006 step is to check whether any visible design-parity surfaces still use older route-local styling instead of treating completed audio/product work as active design debt.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 queue format, `docs/design/notice-empty-state-pattern-inventory.md`, screenshot handoff rules, mobile action layout contract, task-brief lint rules, major route ownership, or verification lanes change before executing the audit.

## Goal

Produce a current, evidence-backed AW-006 design-parity status list that separates completed parity, likely remaining old design surfaces, and non-parity product-feature backlog.

## Audit Output Contract

When this audit is executed, add an `Audit Matrix` section to this brief or a linked docs-only audit note with these columns:

| Column                    | Required content                                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `surface`                 | User-visible route, component family, or admin/member workflow being evaluated.                                                       |
| `route/files`             | Primary route and component files inspected.                                                                                          |
| `reference surface`       | Mature AW-006 surface, primitive, token family, or completed done brief used as comparison.                                           |
| `status`                  | One of `done / likely done`, `needs visual/code re-audit`, `candidate follow-up slice`, or `not design-parity, product feature only`. |
| `evidence`                | Code, inventory, done-brief, screenshot/artifact, or targeted sweep evidence.                                                         |
| `risk`                    | Visual, mobile action layout, dense workflow, a11y/contrast, i18n, support, or architecture risk if any.                              |
| `recommended next action` | Exactly one action for that surface: keep closed, inspect visually, create child brief, or defer as product feature.                  |

The executed audit must end with one overall recommendation:

- `Recommended next slice: <single bounded slice>` when a clear design-parity candidate exists.
- `No design-parity next slice: <rationale>` when the remaining items are product features, future IA, or already covered.
- `Blocked: <missing evidence>` only when the same missing evidence prevents a trustworthy audit conclusion.

## Audit Decision Rules

Use these rules when the audit is executed:

1. Mark a surface `candidate follow-up slice` only when there is current code/design evidence that visible UI still uses older route-local styling, local action/input/card treatment, cramped mobile action layout, or stale compact-panel treatment that can be fixed with existing AW-006 tokens/primitives in one PR-sized slice.
2. Mark a surface `needs visual/code re-audit` when the current docs say it may be done but the active code or route screenshot evidence has not been checked after the latest related PR.
3. Mark a surface `done / likely done` only when the route/component has a named reference surface or done brief, current code evidence, and no obvious stale local styling hit from the targeted sweeps.
4. Mark a surface `not design-parity, product feature only` when the remaining work is reminders, exports, uploaded/user-selected sounds, global sound settings, hard delete, dashboards/graphs, persistent telemetry, new analytics, new commerce behavior, new content/product IA, or runtime Micro Sessions/Habits behavior that needs its own owner-selected product brief.
5. Recommend exactly one next slice. If multiple candidates appear, choose the smallest visible parity fix with the clearest reference surface and leave the rest as ranked notes.

## Audit Execution Checklist

Execution steps:

1. Refresh repo state with `git status -sb`, `git log --oneline -n 10`, and current `main@<sha>` in this brief.
2. Read the current AW-006 canonical queue, Habits parent/intake, design inventory, and latest relevant done briefs through PR `#1030`.
3. Run the targeted route/class/support sweeps listed below and record the exact commands or summarized evidence.
4. Inspect representative public, member, guide, and admin surfaces in code; capture visual evidence only for uncertain/candidate surfaces where it materially helps classification.
5. Add the `Audit Matrix` and one overall recommendation to this brief or a linked docs-only note.
6. Keep any future implementation brief separate and do not edit runtime UI from this brief.

## Audit Evidence Log

Executed on `2026-06-08` from branch `aw-006-design-parity-reaudit` on `main@6c78ab6e`.

- Repo recovery:
  - `git status -sb`: branch started from clean `main...origin/main` with only this planned brief untracked before it moved to `in-progress`.
  - `git log --oneline -n 10`: latest commits were `6c78ab6e` (`#1030`) and `3cf49d64` (`#1029`).
- Queue and inventory reads:
  - `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
  - `docs/task-briefs/done/2026-06-08-aw-006-ding-audio-asset-swap-10-10.md`
- Token/action/input sweep:
  - `rg -n "fs-cta|ui-field|fs-library-card|actionLayout|getMobileActionGroupClass|mobileActionItemClass" app components --glob '*.{ts,tsx}' --count-matches`
  - Result: representative public, guide, admin, and member surfaces already use the current shared action/card/input/mobile-layout paths. Notable hits include `app/page.tsx`, `components/ContactForm.tsx`, `app/claim/page.tsx`, guide trackers, admin managers, My Library child routes, Habits, Dryland, Program Builder, Workout Editor, and `components/ui/actionLayout.ts`.
- Old local styling sweep:
  - `rg -n "rounded-xl bg-blue|bg-blue-600|rounded-lg border border-blue|h-10 w-full rounded-xl border border-slate-200" app components --glob '*.{ts,tsx}'`
  - Result: remaining actionable hits are concentrated in `components/admin/AdminContentManager.tsx` All Content/create/revision areas; `MenuDrawer` and `HabitPerfectDayHub` hits are progress/status rails already covered by completed token/action or product slices.
- Admin Content Manager focused read:
  - `components/admin/AdminContentManager.tsx` currently has shared references at `compactFieldClass`, `compactPrimaryActionClass`, `compactSecondaryActionClass`, `compactDangerActionClass`, `managerHeaderClass`, `workspacePanelClass`, and `rowCardClass`.
  - The same file still has route-local All Content action/field styling at `Save changes`, `Edit`, revision `Restore`, create form fields, and `Save content item`.
  - The completed `Admin Content Manager Course Workspace Token/Action Parity` brief explicitly scoped Course Workspace and nearby All Content filters, while excluding full All Content edit-form redesign.

## Audit Matrix

| Surface                                                            | Route/files                                                                                                                                                                                                                                                                | Reference surface                                                                                                                                                                                  | Status                                    | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Risk                                                                                                                                                                  | Recommended next action  |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Public core routes and trust/support pages                         | `/`, `/contact`, `/analysis`, `/auth/sign-in`, `/claim`, `/privacy`, `/cookies`, `/go/unavailable`, `components/ContactForm.tsx`, `components/MenuDrawer.tsx`                                                                                                              | Home primary action token parity, public policy/QR fallback parity, auth sign-in token/action parity, core-flow keyboard/contrast audit                                                            | `done / likely done`                      | Shared token sweep found current `fs-cta-*`, `ui-field`, `fs-library-card`, and mobile action layout usage across the public/recovery surfaces; done evidence includes PR `#935`, `#932`, `#886`, `#853`, `#957`, and `#953`.                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Future public routes still need explicit matrix updates before being counted covered.                                                                                 | keep closed              |
| Commerce, plans, checkout, and recovery actions                    | `/plans`, `/checkout/success`, `/claim`, `components/my-library/CheckoutButton.tsx`, `components/commerce/DownloadResendForm.tsx`                                                                                                                                          | Plans comparison card parity, checkout button token/action parity, commerce action feedback semantics, download resend form token/input parity                                                     | `done / likely done`                      | Done queue records PR `#824`, `#975`, `#810`, and `#953`; code sweep shows checkout/recovery actions use `fs-cta-*`, `ui-field`, `fs-library-card`, and `actionLayout` where relevant.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Future package/subscription or finance changes are product/commerce work, not design-parity closeout.                                                                 | keep closed              |
| Member hubs and route shells                                       | `/my-library`, `/my-library/goals`, `/my-library/profile`, `/my-library/training`, `/my-library/generator`, `/my-library/workouts`, `/my-library/programs/[programId]`, `/my-library/dryland`, route pages and hub components                                              | My Library dashboard hierarchy, member workspace token/action slices, inner token/input/action slices                                                                                              | `done / likely done`                      | Done queue records PR `#955`, `#963`, `#965`, `#967`, `#971`, `#973`, `#884`, `#880`, `#937`, and sibling member workspace slices. Sweep shows broad member use of `fs-cta-*`, `ui-field`, `fs-library-card`, and `components/ui/actionLayout.ts`.                                                                                                                                                                                                                                                                                                                                                                                                                            | Dense future workflow additions must inherit existing route-shell/action helpers or get their own child brief.                                                        | keep closed              |
| Workout Editor, Session Step, saved workouts, and Poolside Preview | `components/my-library/workouts/WorkoutEditor.tsx`, `SessionStepSurfaceRenderer.tsx`, `sessionStepSurfaceContract.ts`, `PoolsidePreviewPageClient.tsx`, `SavedWorkoutsPanel.tsx`                                                                                           | Session-step surface contract, Workout Editor inner/support token-action parity, mobile action layout audit, Poolside preview feedback/action fixes                                                | `done / likely done`                      | Done queue records PR `#943`, `#945`, `#947`, `#812`, and session-step reference contracts. Remaining `rounded-2xl`/blue/emerald/rose hits are structural tone/status or shared renderer/domain visuals, while action groups use `fs-cta-*` and `actionLayout`.                                                                                                                                                                                                                                                                                                                                                                                                               | Export/artifact changes need artifact-level validation and screenshot/export handoff, but no current design-parity candidate was found.                               | keep closed              |
| Guide access, trackers, and PDF/download actions                   | `/guides/0-1000m`, `/guides/poolside`, `GuideAccessRequiredState`, `Guide0To1000Tracker`, `PoolsideGuideTracker`, `GuidePdfDownloadButton`, guide shell styles                                                                                                             | Guide action shell token parity, guide tracker fullscreen/completion parity, guide entitlement/tracker a11y audit, residual action token parity                                                    | `done / likely done`                      | Done queue and inventory record PR `#868`, `#930`, `#959`, `#937`, and `#808`; code sweep shows guide shell/action helper classes use `fs-cta-*` and `fs-library-card`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | New guide products/routes require matrix updates unless they directly reuse the covered guide access/tracker surfaces.                                                | keep closed              |
| Admin shell and most admin managers                                | `/admin`, `AdminWorkspace`, `AdminNotesManager`, `AdminMessagesManager`, `AdminEmailTemplatesManager`, `AdminCategoriesManager`, `AdminQrLinksManager`, `AdminCommerceManager`, `AdminOperationsManager`, Context Notes/QR, Quick Capture, Screenshot Capture, Help Center | Admin Workspace shell parity, admin manager token/action parity waves, admin state primitive, admin console a11y audit                                                                             | `done / likely done`                      | Done queue/inventory record PR `#900`, `#961`, manager token/action slices through `#920/#922/#924/#926`, state primitive slices, and Help/Guide/admin context parity slices. Code sweep shows these managers now rely on shared `fs-library-card`, `fs-cta-*`, and `AdminManagerState` patterns.                                                                                                                                                                                                                                                                                                                                                                             | Future admin tabs or workflow labels require explicit Help/Guide/support review.                                                                                      | keep closed              |
| Admin Content Manager All Content create/edit/revision controls    | `components/admin/AdminContentManager.tsx`; All Content create form, row edit actions, revision restore action                                                                                                                                                             | `AdminContentManager` Course Workspace token/action parity (`#928`) plus adjacent admin manager `compactFieldClass` / `compactPrimaryActionClass` / `compactSecondaryActionClass` / `rowCardClass` | `candidate follow-up slice`               | Focused code read found route-local classes in All Content controls: `Save changes` uses local `rounded-lg border-blue-200 bg-blue-50`; `Edit` and revision `Restore` use local blue bordered buttons; create form fields use repeated `h-10 w-full rounded-xl border border-slate-200`; `Save content item` still uses `rounded-xl bg-blue-600`. PR `#928` explicitly aligned Course Workspace and nearby filters but excluded full All Content edit form redesign. Visual capture is not required to classify this candidate because the code evidence is direct; the child implementation must still capture `after/reference` screenshots before `npm run verify:pre-pr`. | Dense operator surface, mobile action layout, i18n label fit, focus/label consistency, and admin workflow regression if actions are changed instead of only restyled. | create child brief       |
| Habits, Calendar/Comparison, and Micro Sessions product backlog    | `/my-library/habits`, `/my-library/calendar`, `/my-library/dryland`, Habits parent/intake, design inventory, ding asset swap done brief                                                                                                                                    | Habits parent/intake return contract, Habits/Micro done child briefs, ding audio asset swap closeout                                                                                               | `not design-parity, product feature only` | Parent/intake records H-IDs through H-059. PR `#1027` made Habits/Micro positive feedback share `/sounds/ding/ding.mp3` at `0.15`; PR `#1029/#1030` shipped and closed the owner-approved/free-use replacement MP3. Remaining reminders, server-stored preferences, uploaded/user-selected sounds, global sound settings, exports, graphs/dashboard, hard delete, and persistent Micro Sessions telemetry are explicitly deferred product slices.                                                                                                                                                                                                                             | Mixing product backlog with parity debt would select the wrong next slice and skip data/Help/Guide/visual gates.                                                      | defer as product feature |
| Cross-cutting mobile action layout and old local action sweep      | `components/ui/actionLayout.ts`, route headers, public/member/admin action groups, targeted old-style sweep                                                                                                                                                                | Mobile action layout contract, mobile action layout/button semantics audit                                                                                                                         | `done / likely done`                      | PR `#947` introduced/validated mobile action layout behavior. Current sweep shows broad `actionLayout` usage across public/member routes; remaining `bg-blue-600` hits outside `AdminContentManager` are status/progress treatments in `MenuDrawer` and Habits, not action buttons.                                                                                                                                                                                                                                                                                                                                                                                           | Future 5+ action groups, long labels, icon-only controls, and localization should use the existing helper or get explicit overflow/grouping decisions.                | keep closed              |

## Overall Audit Recommendation

Recommended next slice: `Admin Content Manager All Content Token/Input/Action Parity`.

Scope should stay inside `components/admin/AdminContentManager.tsx` All Content create form, row edit action strip, and revision restore/action controls. It should reuse existing `compactFieldClass`, `compactPrimaryActionClass`, `compactSecondaryActionClass`, `compactDangerActionClass`, `rowCardClass`, `fs-cta-*`, `ui-field`, and mobile action layout rules where practical. It must preserve content APIs, authz, course structure behavior, Context Notes/QR, revision restore behavior, labels, Help/Guide, support procedures, and data contracts. Because it changes visible admin UI, the child must include `after/reference` screenshot handoff before `npm run verify:pre-pr`.

No Habits/Micro Sessions feature should be selected from this design-parity audit. That work remains under the Habits parent/intake and needs a separate owner-selected product brief.

## Pre-Implementation Owner Explanation

Vi gjoer en kort design-parity reaudit foer vi velger flere produktfunksjoner. Det betyr at vi sjekker hovedflatene mot den nye AW-006 designretningen og finner ut om noe fortsatt ser ut som gammel lokal styling.

Hvorfor det betyr noe: den opprinnelige AW-006-briefen handlet om designkvalitet paa tvers av appen. Hvis det fortsatt finnes synlige gamle flater, boer de prioriteres foer vi legger flere nye funksjoner oppaa dem.

Utenfor scope er runtime-kode, UI-endringer, databaser, API-er, screenshots som eier-handoff, PR, commit, merge og nye Habits-funksjoner som reminders, exports eller dashboard.

Fremoverkompatibilitet: auditten skal skille mellom design-parity-gjeld som kan migreres til eksisterende tokens/primitives, og framtidig produktarbeid som krever egen mapping, brief, tester og eierbeslutning.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                                                  | Evidence                                                       | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Audit must cover the current AW-006 route/surface map and produce one current recommendation: parity follow-up, product-feature follow-up, or no design-parity next slice.                                                          | audit matrix + recommended next slice                          | `5/5`                   |
| UX flow clarity                               | `target`     | Findings must distinguish old visual treatment, mobile action-layout risk, dense workflow risk, and non-parity feature backlog so owner decisions are not mixed together.                                                           | status matrix with required output columns                     | `5/5`                   |
| Visual design quality                         | `target`     | Audit must check representative public, member, guide, and admin surfaces against AW-006 token/card/action/input direction; every candidate must include code evidence plus visual evidence or an explicit no-screenshot rationale. | code/design inventory review + visual evidence rule            | `5/5`                   |
| Business logic correctness and data integrity | `N/A`        | N/A because this planned audit changes no runtime state, persisted data, mutation, validation, domain invariant, checkout, entitlement, or user-visible business truth.                                                             | docs-only audit scope rationale                                | `N/A`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin dense internals are in audit scope as possible design-parity candidates, but no admin CRUD, publish workflow, or operator action changes in this brief.                                                      | admin surface audit notes                                      | `4/5`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: the audit should note existing a11y coverage, contrast risk, focus/label risk, and mobile action layout risk per candidate, but it changes no markup.                                                              | reference to existing a11y audit rows and candidate risk notes | `4/5`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because this planned audit changes no route, JavaScript payload, CSS, media asset, build output, cache behavior, or Core Web Vitals budget.                                                                                     | performance scope rationale                                    | `N/A`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this introduces no local-only data, server-canonical data, browser storage, sync policy, conflict behavior, cache invalidation, retention rule, or sensitive data.                                                      | data-boundary scope rationale                                  | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this changes no fetch path, route cache mode, revalidation trigger, mutation response, CDN behavior, or stale-data contract.                                                                                            | cache scope rationale                                          | `N/A`                   |
| Reliability and failure handling              | `supporting` | Supporting only: stale queue state and ambiguous design debt are planning risks; the audit changes no runtime failure behavior.                                                                                                     | stale-status sweep + audit matrix                              | `4/5`                   |
| Security and authz                            | `N/A`        | N/A because this changes no protected route, authz check, auth provider behavior, token handling, cookie, secret, or request input.                                                                                                 | security scope rationale                                       | `N/A`                   |
| Privacy and compliance                        | `N/A`        | N/A because this stores no user data, credentials, logs, analytics payload, legal copy, consent behavior, retention rule, or raw environment value.                                                                                 | privacy scope rationale                                        | `N/A`                   |
| Content governance                            | `target`     | Audit must keep AW-006 queue/design-inventory truth current, include planned/in-progress/done/deferred/blocked lifecycle sweep, and avoid treating completed briefs or feature backlog as active design-parity implementation.      | docs diff + route/label/support sweep                          | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: admin workflow surfaces are audited for visual parity, but no editable field, workflow label, status transition, audit trail, or support procedure changes.                                                        | admin audit notes                                              | `4/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: public route visual parity may be audited, but no metadata, sitemap, robots, canonical URL, structured data, or crawl behavior changes.                                                                            | public route audit notes                                       | `4/5`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract.                                                                                            | AI-discoverability scope rationale                             | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: audit may classify analytics/dashboard work as feature backlog, but no event taxonomy, payload, logging, dashboard, or KPI threshold changes.                                                                      | feature-vs-parity classification                               | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: plans/checkout/recovery surfaces are audited for design parity, but no Stripe, pricing, entitlement, invoice, refund, payout, or finance behavior changes.                                                         | commerce surface audit notes                                   | `4/5`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support workflow, recovery behavior, operator diagnostics, runbook procedure, or support escalation behavior.                                                                             | explicit support-ops scope rationale                           | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue-recognition data.                                                                            | explicit finance scope rationale                               | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: audit should flag tight fixed-width text/action layouts, cramped headings, icon-only ambiguity, and action labels that would be risky for future localization.                                                     | i18n-risk note in audit matrix                                 | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Audit must prefer existing AW-006 tokens, `fs-cta-*`, `ui-field`, `fs-library-card`, `components/ui/actionLayout.ts`, and mature reference surfaces before proposing new UI.                                                        | reference-surface mapping + no new dependencies                | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed brief must pass task-brief lint; executed audit must record exact commands/sweeps, visual-evidence decisions, and the validation lane for any docs-only audit update.                                                       | `npm run lint:briefs`; `lint:briefs:all`; audit evidence log   | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: the audit reduces future review cost by separating small parity slices from broad redesign, but no runtime cost, infrastructure, or storage behavior changes.                                                      | PR-sized follow-up recommendation                              | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Diff remains Markdown-only with normal git revert rollback and no migration, secret, environment, package, workflow, production setting, or runtime deploy change.                                                                  | changed-files review + docs-only validation                    | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Audit only; no route, component, server/client boundary, action/API route, cache mode, or rendering behavior changes.
  - Future implementation slices must identify the mature reference surface before editing markup.
- TypeScript/domain contracts:
  - N/A for this audit brief; no domain type, parser, validation layer, error model, or deterministic product invariant changes.
- Supabase/data layer:
  - N/A; no migration, RLS/authz rule, generated DB type, index, storage, or data access behavior changes.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, SDK, webhook, secret, retry, or idempotency change.
- UI system:
  - Reference surfaces to audit against: current AW-006 token/action direction, `fs-cta-*`, `ui-field`, `fs-library-card`, `components/ui/actionLayout.ts`, `docs/design/mobile-action-layout-contract.md`, and the completed rows in `docs/design/notice-empty-state-pattern-inventory.md`.
  - If the executed audit identifies a visual implementation candidate, that later child must include screenshot handoff before `npm run verify:pre-pr`.
- Testing:
  - Brief creation requires task-brief lint.
  - Executed audit should use targeted `rg` sweeps and optional code/visual inspection, not broad runtime tests unless a later implementation slice starts.

## Architecture Evaluation Criteria

Each audited surface should answer these architecture questions before it can be marked `done / likely done`:

1. **Reference surface**: Which completed AW-006 surface or shared primitive is the comparison point?
2. **Token/action/input path**: Does the surface use `fs-cta-*`, `ui-field`, `fs-library-card`, `components/ui/actionLayout.ts`, or another documented local primitive? If not, is the exception justified?
3. **Route-local markup**: Is route-local markup still necessary for domain behavior, or is it old styling that should be migrated?
4. **Mobile layout**: Does the surface satisfy `docs/design/mobile-action-layout-contract.md`, including no orphan final action rows, stable button widths, and readable compact labels?
5. **Compact-heading scale**: Do compact panels avoid hero-scale headings and preserve room for actions/status copy?
6. **Nested-card/container risk**: Does the surface avoid card-in-card layering, leftover blue/glass-card treatment, and one-off decorative containers unless a completed reference surface already uses them?
7. **A11y/design overlap**: Are focus, labels, status semantics, contrast, and icon-only actions covered by an existing audit or called out as a follow-up risk?
8. **i18n resilience**: Do labels, chips, buttons, and dense action rows have enough space or wrapping behavior for longer future copy?
9. **Forward compatibility**: Would a new product, route, guide, admin tab, workflow action, or status inherit the current design path automatically, or does it need explicit mapping?

Surfaces that cannot answer these questions with evidence must be marked `needs visual/code re-audit` instead of `done`.

## Visual Evidence Rule For Audit Execution

This planned brief does not require screenshot handoff because it changes no UI. When the audit is executed:

- Every `candidate follow-up slice` must include either:
  - a code-backed explanation plus at least one representative desktop/mobile visual evidence artifact, or
  - an explicit rationale for why visual capture is not useful or not possible.
- Every `needs visual/code re-audit` surface must state exactly what evidence is missing.
- Visual evidence for audit execution is not owner screenshot approval. If a later implementation changes UI/print/layout/brand files, that child still needs the normal screenshot handoff before `npm run verify:pre-pr`.

## Design Quality Gates For Candidate Slices

Any follow-up slice recommended by the audit must explicitly evaluate:

- visible token/action/input parity against the named reference surface,
- mobile action layout and safe-area behavior,
- text fit and compact heading scale on mobile and desktop,
- no unresolved card-in-card, legacy blue/glass-card, one-off `rounded-xl bg-blue-*`, `rounded-2xl`, slate/rose/emerald local button styling, or decorative container drift,
- accessible name/status/focus/contrast risk,
- i18n layout resilience for longer labels,
- whether the fix can stay PR-sized without broad redesign.

## Data Placement And Sync Contract

N/A with rationale: this is a docs-only design-parity audit brief. It introduces no local-only data, server-canonical data, browser storage, sync trigger, conflict policy, cache invalidation, retention rule, or sensitive data handling.

## Identity And Rename Contract

N/A with rationale: this brief creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename/repurpose policy, alias, redirect, or compatibility mapping. Brief filename and audit labels are repository lifecycle identifiers only.

## Forward Compatibility Contract

- Extensibility surfaces:
  - AW-006 queue rows, design-inventory rows, route/surface names, token/action/input primitives, mobile action layouts, admin surfaces, guide products, public/member route groups, and future product-feature backlog labels.
- Source of truth:
  - Current shipped status comes from linked `done/` briefs, PR evidence in the AW-006 canonical queue, and `docs/design/notice-empty-state-pattern-inventory.md`.
  - Future implementation candidates should derive from current code/design evidence, not from stale chat memory.
- Additive behavior:
  - New route/surface additions should be classifiable into the audit matrix without rewriting the whole AW-006 queue.
  - Surfaces already using shared tokens/primitives should stay `done/covered` unless code or screenshots show regression.
- Explicit mapping requirements:
  - New UI primitives, token families, action semantics, admin workflow labels, guide products, product dashboards, analytics events, export surfaces, or brand media systems require a separate owner-selected implementation brief.
  - Future Habits feature work remains under the Habits parent unless the owner explicitly returns to broader AW-006 design parity.
- Unknown or deprecated values:
  - Ambiguous surfaces should be marked `needs visual/code re-audit`, not silently treated as done.
  - Product-feature backlog should be marked `not design-parity` so it does not block parity closeout.
- Test/evidence:
  - Executed audit should include a route/surface matrix, targeted `rg` evidence for old local styling where practical, and a clear recommendation for either one follow-up slice or no design-parity next slice.

## Help / Guide Impact

N/A with rationale: this planned audit changes no user/admin workflow label, Help/Guide content, support recovery behavior, operator instruction, or runbook procedure. Any later implementation slice that changes workflow labels, recovery behavior, or support diagnostics must update Help/Guide/runbooks or provide an explicit N/A rationale.

## Route / Label / Support Surface Sweep

Required during audit execution as a planning/support sweep, not as implementation fallout.

- Identifiers to sweep:
  - `AW-006`
  - `token/action`
  - `token/input`
  - `route-local`
  - `older local`
  - `older route-local`
  - `rounded blue`
  - `rounded-xl bg-blue`
  - `rounded-2xl`
  - `bg-slate`
  - `bg-rose`
  - `bg-emerald`
  - `fs-cta`
  - `ui-field`
  - `fs-library-card`
  - `actionLayout`
  - `mobile action layout`
  - `glass`
  - `hero-scale`
  - `not selected`
  - `requires fresh re-audit`
- Minimum surfaces:
  - `app/`
  - `components/`
  - `components/ui/`
  - `tests/`
  - `docs/design/`
  - `docs/app-knowledge-book/`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/task-briefs/done/`
  - `docs/task-briefs/deferred/`
  - `docs/task-briefs/blocked/`
  - `docs/runbooks/`
- Expected fallout:
  - one audit matrix,
  - optional update to the canonical AW-006 queue/design inventory if the audit is later executed,
  - no product code, Help/Guide, support workflow, route label, rendered UI, screenshot, provider, or API changes in this planned brief.

## Audit Scope

- Public:
  - Home, Plans, Contact, Analysis, Course, Auth, Preview Access, policy pages, and QR fallback.
- Member:
  - My Library, My Routines, Habits, Calendar/Comparison, Dryland/Micro Sessions, My Swim Sessions, Workout Editor, Program Builder, Goals, My Swim Profile, My Training, and AI Session Generator.
- Guide:
  - access-required states, entitlement/tracker states, PDF/download actions, and guide route action groups.
- Admin:
  - admin shell, Admin Workspace, managers for notes/content/QR/messages/categories/email templates/help, dense inner controls, list states, and contextual panels.
- Cross-cutting:
  - buttons, inputs, compact cards, empty/loading/error states, recovery notices, mobile action groups, compact headings, and old one-off rounded blue/slate/rose/emerald action styling.

## Scope

- Create and later execute a docs-only AW-006 design-parity audit.
- Produce an evidence-backed matrix with these statuses:
  - `done / likely done`
  - `needs visual/code re-audit`
  - `candidate follow-up slice`
  - `not design-parity, product feature only`
- Recommend exactly one next slice if a clear parity candidate exists, or `No design-parity next slice` if no material candidate is found.
- Keep Habits feature backlog separate from broad AW-006 design-parity debt.

## Out Of Scope

- Runtime app code, UI, CSS, product rendering, screenshots as owner handoff, routes, APIs, migrations, generated files, assets, external services, package changes, workflows, environment settings, feature behavior, commits, PR, or merge.
- Implementing the next AW-006 product/UI slice.
- Habits reminders, server-stored preferences, uploaded sounds, exports, graphs/dashboard, hard delete, or persistent Micro Sessions telemetry.
- Stripe Checkout, prices, subscriptions/packages, entitlements, invoices, refunds, payouts, or reporting.
- Supabase, auth, analytics taxonomy, database, commerce, finance, i18n, Help/Guide, support procedures, or production settings.

## Acceptance Criteria

1. This planned brief exists in `docs/task-briefs/planned/` and passes changed-brief lint.
2. The audit scope covers public, member, guide, admin, and cross-cutting AW-006 design-parity surfaces.
3. The brief defines clear classification buckets so product-feature backlog is not confused with design-parity debt.
4. The brief names mature reference surfaces and token/action/input primitives to reuse before proposing new UI.
5. The brief defines required `Audit Matrix` columns and per-surface architecture evaluation criteria.
6. The brief defines visual-evidence rules for candidate/uncertain surfaces without requiring owner screenshot approval for this docs-only planning update.
7. The executed audit, when requested later, must produce one recommended next step or explicitly say no design-parity slice is needed.
8. Diff remains docs-only and does not touch runtime code, tests, scripts, configs, workflows, generated files, screenshots, assets, provider behavior, or API behavior.

## Validation

Required for creating this planned brief:

- `npm run lint:briefs`
- `npm run lint:briefs:all` if the changed-brief lint or queue/reference lint indicates broader lifecycle fallout.

Expected for later audit execution:

- targeted route/label/support sweep listed above
- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `git diff --check`
- `npm run verify:docs-only` if the audit writes docs output or updates queue/design-inventory docs
- explicit note when changed-brief lint does not include untracked planned files before they are added to git

Not required for this planned brief creation:

- screenshot handoff
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`
- PR creation

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.

## Screenshot Handoff

N/A with rationale: this planned brief changes no UI, print, layout, brand, asset, product-rendering file, or browser-visible behavior. No screenshot handoff is required unless a later implementation slice changes rendered UI.

## Checkpoint Log

- `2026-06-08 | planned | created from clean synced main@595c7084 after PR #1027 and docs-only closeout PR #1028; owner asked to plan an AW-006 design-parity reaudit before choosing more Habits feature work | next: refresh after ding audio asset swap closeout and keep this planned until owner explicitly asks to execute the audit`
- `2026-06-08 | planned | tightened the planned audit to 10/10 criteria by adding a fixed Audit Matrix output contract, per-surface architecture questions, visual evidence rules for candidate/uncertain surfaces, stronger design-quality gates, expanded lifecycle/code sweeps, and docs-only validation expectations while keeping the local MP3 asset change out of scope | next: refresh current base after PR #1029/#1030 and run all-brief lint`
- `2026-06-08 | planned | refreshed on clean synced main@6c78ab6e after PR #1029 swapped the shared ding asset and PR #1030 closed the workstream; recorded that Habits/Micro Sessions still use /sounds/ding/ding.mp3 at shared volume 0.15, added stricter audit decision rules, and made audit execution steps explicit so product-feature backlog cannot be mistaken for active design-parity debt | next: validate with lint:briefs:all and keep this planned until owner explicitly asks to execute the audit`
- `2026-06-08 | in-progress | owner explicitly said "kjor AW-006 reauditten"; moved this brief from planned to in-progress on branch aw-006-design-parity-reaudit with no runtime code in scope | next: collect queue/inventory/code evidence, write the audit matrix, validate docs-only, commit, push, and open PR`
- `2026-06-08 | in-progress | executed queue/inventory/code re-audit; current evidence leaves one recommended design-parity candidate, Admin Content Manager All Content Token/Input/Action Parity, while Habits/Micro remaining work is product-feature backlog under the Habits parent/intake | next: update stale queue/inventory/parent notes, run docs-only validation, commit, push, and open PR`
