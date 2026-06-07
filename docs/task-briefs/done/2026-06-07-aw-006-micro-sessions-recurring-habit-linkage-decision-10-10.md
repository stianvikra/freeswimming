# Task Brief: AW-006 Micro Sessions Recurring Habit Linkage Decision (10/10)

## Metadata

- `id`: `2026-06-07-aw-006-micro-sessions-recurring-habit-linkage-decision-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-07`
- `updated`: `2026-06-07`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `parent_brief`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `execution_mode`: `docs-only decision brief; no runtime implementation`
- `target_findings`: `H-028`, `H-046`
- `resolved_decisions`: H-028 no midnight auto-write; H-046 Micro Sessions can become recurring habits only through explicit opt-in linkage to a stable Micro Session routine identity that can contain one or more source Dryland Sessions.
- `deferred_findings`: Runtime Micro Sessions/Habits linkage, notification APIs, reminders, hard delete, exports, broad graphs/dashboard work, user-selected sounds, server/global sound preferences, global calendar storage, persistent Micro Sessions timer telemetry, and automatic Perfect Day linkage remain out of scope.
- `return_checkpoint`: update the Habits parent before this decision brief is considered closeout-ready.
- `next_return_target`: `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-07`
- `base`: clean synced `main@6a83ba39`
- `audit_status`: `ready`
- `decision`: Execute this as a docs-only decision brief after the owner selected Micro Sessions recurring habit linkage as the next Habits decision.
- `reason`: PR `#1013` shipped non-destructive Habits lifecycle CRUD and repo-managed closeout PR `#1014` left main clean with post-merge preflight green. Fresh parent/queue audit found no active Habits child, H-028 still deferred as midnight auto-complete data integrity, and H-046 still deferred as Micro Sessions/Habits linkage consent.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, the Habits parent, `/my-library/habits`, `/my-library/routines`, `TodayTabsPanel`, `HabitPerfectDayHub`, Micro Sessions storage/actions, Habits API/storage/local timer contracts, Perfect Day rules, Help/Guide/support rules, screenshot handoff rules, forward compatibility rules, route/label/support sweep rules, or verification lanes change before PR handoff.

## Goal

Define the product, UX, data-boundary, identity, and future implementation contract for turning a Micro Session into a recurring Habit without silently creating habits, rewriting history, or inflating Perfect Day/motivation metrics.

## Pre-Implementation Owner Explanation

Vi dokumenterer hvordan en Micro Session kan bli en lopende vane senere.

Hvorfor det betyr noe: Micro Sessions er korte okter du kan gjore naa, mens Habits er motiverende historikk over tid. Appen maa derfor ikke telle eller opprette vaner i skjul, fordi det kan gjore streaks, Perfect Day og historikk mindre troverdig.

Utenfor scope er produktkode, UI-endringer, databaseendringer, reminders, notifications, hard delete, exports, store grafer, automatisk backfill av gamle Micro Sessions og full Perfect Day-ombygging.

Fremoverkompatibilitet: nye Micro Session-typer skal kunne bruke samme eksplisitte koblingsmodell uten hardkodede navn; nye habit modes eller koblingstyper maa kreve eksplisitt mapping foer de kan telle automatisk.

## Product Decision

- Micro Session and Habit are separate concepts:
  - Micro Session: a one-off or saved short routine/mini-program the user can run now, which may be built from one or more source Dryland Sessions and their blocks/units.
  - Habit: a recurring commitment/rule to do something over time.
- Default Micro Session builder behavior remains one-off/save-session, not recurring.
- The first user-facing recurring affordance should be explicit, for example `Make recurring habit`.
- Creating a recurring habit from a Micro Session requires the user to choose:
  - habit name, defaulting from the Micro Session title where safe;
  - cadence, for example daily or weekly count;
  - start date;
  - whether today's just-completed Micro Session should count now.
- The app must not create many future Micro Session rows. It should create one recurring Habit rule when the user opts in.
- Completed Micro Sessions do not count toward Habits or Perfect Day unless an explicit active linkage exists.
- Existing historical Micro Sessions are not backfilled automatically.
- Future linked completions may count only after opt-in and only according to a typed mapping.
- The UI should explain active linkage near the action, for example `Counts toward: Mobility habit`.
- Habit linkage points to the stable Micro Session routine/plan identity, not to the Micro Session title, visible copy, a single source Dryland Session title, or a transient `current` rebuild state.
- A linked Micro Session routine may contain multiple source Dryland Sessions, for example stretching plus band strength plus bodyweight strength. Adding, removing, or editing source sessions inside the same real-world routine must not break the Habit linkage by default.
- Editing a source Dryland Session or using `Update current micro session` updates future queued content only. It must preserve completed/skipped Micro Session history and must not reinterpret old Habit credit.
- Old completions keep a snapshot of what was actually done, including source session/block identity where available. New completions use the updated Micro Session routine content.
- Materially repurposing the Micro Session, for example changing `Evening mobility` into unrelated strength work, should create a new Micro Session/Habit linkage or require explicit repurpose warning before old history remains attached.
- If a linked Micro Session routine or source Dryland Session becomes unavailable, archived, or deleted later, the Habit should show a fail-closed recovery state such as `Linked session unavailable` rather than losing history or silently counting future work.
- Future runtime work must define the count threshold explicitly. Recommended default: one server-confirmed completion from the linked Micro Session routine can satisfy one Habit occurrence for the active Habit period, while multiple completions in the same period must not overcount unless the Habit mode is explicitly mapped as count-based.
- H-028 decision: no automatic midnight write creates positive or negative check-ins. Completion may be derived from saved evidence; missed status may be derived from missing data plus cadence; rest day remains explicit user action.

## Scope

- Create this docs-only decision brief.
- Record the preferred Micro Sessions to recurring Habit UX rule.
- Record the stable Micro Session routine identity rule, including multiple source Dryland Sessions and source-edit behavior.
- Record the H-028 decision so no separate midnight auto-complete implementation brief is needed now.
- Update the Habits parent, AW-006 canonical queue, and design inventory to show this docs-only decision is active.
- Define future implementation guardrails for data placement, identity, sync, failure handling, Help/Guide impact, support diagnostics, tests, and screenshots.

## Out Of Scope

- Runtime app code, React components, CSS, UI copy in product files, screenshots, routes, APIs, tests, scripts, configs, workflows, migrations, generated files, assets, external services, package changes, environment settings, or feature behavior.
- Creating Micro Sessions from Habits or Habits from Micro Sessions in product code.
- Automatic habit creation, automatic Perfect Day linkage, automatic backfill, automatic midnight writes, negative check-in rows, reminders, notification APIs, user-selected/uploaded sounds, server/global sound preferences, hard delete, exports, broad graphs/dashboard work, global calendar storage, persistent Micro Sessions timer telemetry, or new analytics events.
- Changing existing Habits reset, lifecycle, timer/manual, rest day, selected-date, sound, or Calendar comparison behavior.
- Merge to `main` without explicit owner approval.

## Acceptance Criteria

1. H-028 is recorded as a product decision: do not auto-write midnight check-ins; derive completion/missed truth from existing evidence and cadence where safe.
2. H-046 is recorded as a product decision: Micro Sessions do not silently create or count as Habits.
3. The preferred future UX is explicit opt-in: one-off/save remains default, with `Make recurring habit` as a conscious action.
4. The future recurring flow defines habit name, cadence, start date, and whether today's just-completed Micro Session counts now.
5. Habit linkage is explicitly tied to stable Micro Session routine identity, not title text, a single source Dryland Session title, or transient current-plan rebuild state.
6. A linked Micro Session routine may contain one or more source Dryland Sessions; ordinary source edits and `Update current micro session` must not break the linkage or rewrite old counted history.
7. Historical Micro Sessions are not backfilled automatically.
8. Future linked completions count only after an active explicit linkage and typed mapping.
9. Future runtime implementation must define count threshold and duplicate-prevention rules before any Micro Session completion can affect Habit/Perfect Day metrics.
10. Unknown Micro Session types, habit modes, linkage states, source sessions, or completion sources fail closed and do not improve streak, Perfect Day, consistency, or days-hit metrics.
11. Parent, queue, and design inventory agree this is docs-only and no product/UI implementation has shipped.
12. Help/Guide impact is explicitly N/A for this docs-only PR, while future runtime linkage must update Help/Guide and support docs.
13. Changed briefs pass `npm run lint:briefs`; broad docs-only gates pass before PR handoff and merge-readiness summary.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Data placement and sync boundaries`
- `Reliability and failure handling`
- `Privacy and compliance`
- `Content governance`
- `Incident response and support operations`
- `i18n operational readiness`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                            | Evidence                                      | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Brief clearly separates Micro Session one-off work from recurring Habit commitment and names the future primary action path.                                                                                  | product decision + acceptance criteria        | `5/5`                   |
| UX flow clarity                               | `target`     | Future UX must keep one-off/save as default, make recurrence opt-in, and require explicit choices for name, cadence, start date, and today-only counting.                                                     | product decision + future UX contract         | `5/5`                   |
| Visual design quality                         | `N/A`        | N/A because this PR changes no rendered UI, CSS, layout, print output, brand asset, screenshot artifact, or browser-visible product surface.                                                                  | visual scope rationale                        | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Decision forbids silent auto-creation, automatic backfill, hidden Perfect Day linkage, midnight auto-write check-ins, source-edit history rewrites, and title-based linkage; unknown values must fail closed. | data/invariant contract + acceptance criteria | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes no admin editor CRUD, publish workflow, operator content editing, admin status flow, or admin recovery path.                                                                   | admin-editor scope rationale                  | `N/A`                   |
| Accessibility (a11y)                          | `N/A`        | N/A because this docs-only PR changes no markup, focus behavior, keyboard path, labels, contrast, live region, or screen-reader semantics.                                                                    | a11y scope rationale                          | `N/A`                   |
| Performance (CWV + payloads)                  | `N/A`        | N/A because no route, JavaScript payload, CSS, media asset, build output, cache behavior, or Core Web Vitals budget changes.                                                                                  | performance scope rationale                   | `N/A`                   |
| Data placement and sync boundaries            | `target`     | Future linkage truth must be server-canonical; transient dialogs remain local-only; completion writes must be explicit and never inferred from UI copy, title text, or current-plan rebuild state.            | data placement contract                       | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no cache changes here; future linkage writes must refresh Micro Sessions, Habits, Motivation, and Calendar comparison reads deterministically.                                               | future implementation contract                | `4/5`                   |
| Reliability and failure handling              | `target`     | Future failed link/create/count/rebuild mutations must leave existing Micro Session and Habit metrics unchanged, show retry-safe recovery, and fail closed for unavailable linked sessions.                   | failure contract + acceptance criteria        | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: no protected route changes here; future linkage APIs must fail closed for unauthenticated or cross-owner access with negative-path tests.                                                    | future authz contract                         | `4/5`                   |
| Privacy and compliance                        | `target`     | Habit names, Micro Session names, linkage choices, and completion sources remain private member data and must not leak through logs, support copy, analytics, or public surfaces.                             | privacy contract                              | `5/5`                   |
| Content governance                            | `target`     | Parent, AW-006 queue, design inventory, and this decision brief must agree on active docs-only state and future implementation deferral.                                                                      | docs diff + targeted sweeps                   | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow label, admin action, admin editability surface, audit trail, Help/Guide admin action, or operator recovery path.                                                   | admin-workflow scope rationale                | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because changed surfaces are private/planning docs only and this PR changes no public metadata, sitemap, robots, canonical URL, or structured data.                                                       | SEO scope rationale                           | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this PR changes no crawl-safe public entity, structured data, AI-facing public docs, or public semantic content surface.                                                                          | AI-discoverability scope rationale            | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics changes here; future linkage events require explicit taxonomy, PII review, and unknown-value fallback before implementation.                                                    | future analytics contract                     | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no Stripe, checkout, entitlement, catalog, billing portal, refund, invoice, payout, or revenue flow.                                                                                 | commerce scope rationale                      | `N/A`                   |
| Incident response and support operations      | `target`     | Future support diagnostics must use redacted routine/source/linkage IDs, dates, linkage state, and error class only; support can diagnose why a Micro Session did or did not count.                           | support diagnostics contract                  | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this changes no billing provider data, invoices, refunds, payouts, entitlements, revenue report, reconciliation surface, or finance operation.                                      | finance scope rationale                       | `N/A`                   |
| i18n operational readiness                    | `target`     | Future copy must avoid tight layout assumptions for `Make recurring habit`, `Counts toward`, cadence labels, and longer localized habit/session names.                                                        | future i18n contract                          | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Decision requires future implementation to reuse existing Micro Sessions, Dryland source-session snapshots, Habits, My Library, and typed domain contracts before adding abstractions or dependencies.        | stack gate                                    | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed briefs must pass brief lint and docs-only verification; future runtime linkage must define unit/domain/API/component/e2e/screenshot coverage before implementation.                                   | validation commands + future test contract    | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: no runtime cost here; future implementation must avoid generating future session rows and use one recurring rule/linkage rather than event bloat.                                            | future cost contract                          | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Diff remains docs-only with normal git revert rollback; future persistence changes require migration, deploy order, and rollback notes before implementation.                                                 | docs-only diff + validation gates             | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Future implementation should reuse `/my-library/routines`, `/my-library/dryland`, `/my-library/habits`, `TodayTabsPanel`, `HabitPerfectDayHub`, and existing My Library action/token surfaces.
  - Keep builder/run completion UI in the owning route/component and keep confirmation feedback close to the action.
  - Preserve authenticated route boundaries and avoid route-local linkage truth.
- TypeScript/domain contracts:
  - Future implementation must add typed Micro Session linkage state/source contracts instead of title/copy checks.
  - Reuse existing Dryland Micro Plan source snapshots and `sourceDrylandSessionIds` concepts where they fit; do not replace them with title/copy matching.
  - Define deterministic invariants for one-off, linked, unlinked, today-only count, future-counting, multi-source routine, source-session edit, current-plan rebuild, stale link, unavailable link, duplicate completion, and unknown state.
  - Unknown linkage state, Micro Session type, source Dryland Session, habit mode, or completion source fails closed for positive metrics.
- Supabase/data layer:
  - N/A for this docs-only PR.
  - Future implementation needs explicit migration/RLS/authz review if linkage is persisted, plus generated type updates, owner-scoped writes, and negative-path tests.
- External services/tools:
  - N/A; do not add notification APIs, analytics vendors, native integrations, or sound libraries in this decision slice.
- UI system:
  - N/A for rendered UI in this PR.
  - Future UI must reuse existing action hierarchy and provide screenshot handoff because it changes user-facing workflow and labels.
- Testing:
  - This PR uses docs-only validation.
  - Future runtime implementation must include domain/unit tests for metric eligibility, route/API authz and validation tests, component tests for explicit opt-in copy, e2e for linked/unlinked flows, and screenshot handoff for mobile and desktop.

## Data Placement And Sync Contract

- Server-canonical data in future implementation:
  - Micro Session routine/plan identity;
  - source Dryland Session IDs and source snapshots for each routine/block where available;
  - Micro Session completion identity and completion snapshot;
  - Habit definition/stable ID;
  - explicit linkage record or typed field;
  - linkage start date, cadence mapping, and active/ended state;
  - explicit counted completion events or references.
- Local data:
  - open dialogs, pending state, transient success/error feedback, and unsaved form choices.
  - no local-only linkage truth and no local-only Perfect Day truth.
- Sync policy:
  - creating or changing linkage is an explicit write and treats the server response as source of truth.
  - failed writes preserve previous Micro Session and Habit metrics.
  - stale writes reload canonical session/habit/linkage state before retry.
  - source Dryland Session edits and `Update current micro session` rebuild remaining queued content only and must not rewrite completed/skipped history or existing Habit credit.
  - duplicate completion protection must prevent multiple linked blocks/completions from overcounting the same Habit period unless count-mode mapping explicitly allows it.
  - successful future writes refresh Micro Sessions, Habits, Motivation, and Calendar comparison read paths affected by the linkage.
- Retention and sensitivity:
  - Micro Session names, source Dryland Session names, Habit names, cadence choices, and completion sources are private member data.
  - automatic backfill is forbidden by this decision; any future backfill requires a separate owner-approved destructive/data-integrity brief.
  - support diagnostics use redacted routine IDs, source IDs, Habit IDs, dates, linkage status, and error class only.
- Cache/invalidation:
  - no cache changes in this PR.
  - future linkage mutations must define exact invalidation for `/my-library/routines`, `/my-library/habits`, Motivation, and Calendar comparison.

## Identity And Rename Contract

- Canonical stable IDs:
  - Micro Session routine/plan ID remains the identity of the user-visible Micro Session, even when it contains one or more source Dryland Sessions.
  - Source Dryland Session IDs remain the identity of the saved dryland source sessions used to build routine blocks/units.
  - Habit ID remains the identity for recurring habit history, reset boundaries, Calendar markers, and support diagnostics.
  - Future linkage must have a stable ID or deterministic composite identity that is not derived from display names.
- Human-readable identifiers:
  - Micro Session title, source Dryland Session titles, block labels, and Habit title are display labels and renameable.
  - UX copy such as `Make recurring habit` and `Counts toward` must not become storage keys.
- Mutability rules:
  - renaming a Micro Session, source Dryland Session, or Habit does not rebind old history.
  - adding, removing, or editing source Dryland Sessions inside the same real-world Micro Session routine preserves the linkage by default for future completions.
  - current-plan rebuilds update remaining queued content only and do not change the identity of completed historical work.
  - changing cadence/start date is a linkage or Habit edit, not a new Micro Session completion.
  - ending a Habit or unlinking a Micro Session must preserve historical counted evidence unless a future destructive brief says otherwise.
- Rename vs repurpose:
  - rename in place only when the underlying real-world session/habit remains the same.
  - materially repurposing a linked Micro Session or replacing its source Dryland Sessions with unrelated work should create a new Micro Session, create a new Habit, unlink/relink explicitly, or require a warning because old completion evidence would otherwise attach to the wrong behavior.
- Compatibility contract:
  - existing Micro Sessions remain unlinked by default.
  - existing Habits remain unchanged.
  - existing multi-source Micro Sessions remain valid routines and do not need to be split into one Habit per source session.
  - unknown, unavailable, archived, deleted, or legacy linkage/source values fail closed and do not count as completion credit.
- Observability and repair:
  - invalid linkage rows should be detectable by redacted linkage ID, Micro Session routine ID, source Dryland Session IDs, Habit ID, dates, and status; repair should not require private titles or notes.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Micro Session routine types, source Dryland Session kinds, block/unit types, Micro Session completion sources, Habit modes, cadence values, linkage states, linkage actions, Perfect Day eligibility, Calendar marker meanings, analytics payload values, support labels, export fields, and future locale strings.
- Source of truth:
  - linkage and count eligibility must derive from server-canonical typed data, not UI copy, title text, source-session title, localStorage, current-plan rebuild state, or route-local booleans.
- Additive behavior:
  - future Micro Session types can offer `Make recurring habit` if they provide a typed completion source that maps safely to an existing Habit mode.
  - future Micro Sessions can include more source Dryland Sessions or block types without breaking existing Habit linkage when the stable routine identity stays the same.
  - future Habit titles/categories inherit the same linkage contract.
  - future non-linked Micro Sessions stay separate and do not affect Habits.
- Explicit mapping requirements:
  - new Habit modes, Micro Session completion sources, source Dryland Session kinds, block/unit types, duplicate-counting policies, linkage states, Perfect Day eligibility rules, Calendar marker styles, export meanings, analytics values, support labels, and locales require explicit code/copy/test/docs mapping.
- Unknown or deprecated values:
  - unknown Micro Session types, source Dryland Session kinds, block/unit types, Habit modes, linkage states, or completion sources do not count toward Habits, Perfect Day, streaks, consistency, or days-hit metrics.
  - deprecated linkage labels remain aliases only if explicitly mapped.
- Test/evidence:
  - this docs-only PR proves the active decision is not chat-only through brief lint and queue/parent/design-inventory alignment.
  - future runtime implementation must include fixtures for unlinked one-off, save-only, make-recurring, count-today-only, future-linked completion, multi-source Micro Session routine, source Dryland Session edit, current-plan rebuild preserving completed/skipped history, duplicate completion in one Habit period, unavailable linked session, unlink/end, stale link, cross-owner denial, unknown Micro Session type, unknown source Dryland Session kind, unknown Habit mode, and unknown linkage state.

## Help / Guide Impact

N/A for this PR with rationale: this is a docs-only decision brief and changes no user/admin workflow label in product, Help/Guide content, support recovery behavior, operator instruction, runbook procedure, auth, payments, or support path.

Future runtime implementation must update Help/Guide and support docs if it adds user-facing labels such as `Make recurring habit`, `Track as habit`, `Counts toward`, `Count today only`, `Unlink`, or related recovery behavior.

## Route / Label / Support Surface Sweep

Required because this decision changes future user-facing workflow labels and support expectations, even though this PR is docs-only.

- Identifiers to sweep before broad gates:
  - `Micro Sessions`
  - `Make recurring habit`
  - `Track as habit`
  - `Counts toward`
  - `Update current micro session`
  - `sourceDrylandSessionIds`
  - `Linked session unavailable`
  - `Dryland Session`
  - `Perfect Day`
  - `H-028`
  - `H-046`
  - `midnight auto-complete`
  - `automatic Perfect Day linkage`
  - `silent habit creation`
  - `2026-06-07-aw-006-micro-sessions-recurring-habit-linkage-decision-10-10`
- Minimum surfaces:
  - `docs/task-briefs/planned/2026-06-03-aw-006-habits-ux-findings-reconcile-parent-10-10.md`
  - `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - active and done Habits/Micro Sessions briefs referenced by the parent
- Expected fallout:
  - this active decision brief;
  - Habits parent H-028/H-046 status and checkpoint log;
  - AW-006 canonical queue checkpoint;
  - design inventory note;
  - no product code, Help/Guide content, support workflow, route label, rendered UI, screenshot, provider, test, script, config, or API changes.

## Validation

- Targeted during implementation:
  - `npm run lint:briefs`
  - `npm run lint:briefs:all`
  - targeted route/label/support sweep listed above
  - `git diff --check`
- Broad gates:
  - `npm run verify:pre-pr`
  - required PR CI checks
  - `npm run verify:pre-merge`

Docs-only lane is expected while the diff stays limited to Markdown docs.

## Local Tooling Prerequisite

- Node.js/npm available through the repo's normal `nvm use --silent` path.
- For Codex, release-gate commands should use escalation-first strategy per repo instructions.

## Screenshot Handoff

N/A with rationale: this PR changes no UI, print, layout, brand, asset, product-rendering file, or browser-visible behavior. No screenshot handoff is required.

## Checkpoint Log

- `2026-06-07 | in-progress | started from clean synced main@6a83ba39 after PR #1013 and repo-managed closeout PR #1014; owner agreed H-028 can be dropped as an implementation brief and selected Micro Sessions recurring Habit linkage as a docs-only decision brief; no runtime implementation is in scope | next: update parent/queue/design inventory, run docs-only validation, open PR, monitor CI, and run verify:pre-merge before merge-readiness summary`
- `2026-06-07 | in-progress | owner clarified that the user-facing Micro Session may be a stable routine containing one or more source Dryland Sessions, and that editing a source session or rebuilding the current micro session must not break a linked Habit or rewrite old counted history | next: update parent/queue/design inventory, rerun docs-only gates, push PR #1015, monitor CI, and rerun verify:pre-merge`
- `2026-06-08 | done | PR #1015 merged as squash commit 9af31aca; docs-only decision is complete and runtime implementation remains deferred | next: repo-managed closeout updates parent/queue/design inventory and reruns docs-only gates`

## Completion Record

- `completed`: `2026-06-08`
- `merged_pr`: `#1015`
- `squash_commit`: `9af31aca`
- `result`: Closed AW-006 Micro Sessions Recurring Habit Linkage Decision. The app contract now says Micro Sessions stay one-off/save by default, recurring Habit linkage requires explicit opt-in, linked Habits point to stable Micro Session routine identity, multi-source Dryland routines are supported, source edits/current-plan rebuilds preserve old history, and unknown or unavailable linkage values fail closed.
- `validation`: `npm run verify:pre-pr` PASS docs-only; PR CI all green (`verify`, `CodeQL`, `e2e-smoke`, `site-lock-smoke`, `deploy-preview`, `size-check`, `Vercel`); `npm run verify:pre-merge` PASS docs-only for `95e1cdd0`.
- `10/10 claim`: yes - all critical target categories reached `5/5`; runtime implementation is intentionally out of scope.

| Category                                      | Achieved Score | Evidence                                                                                                                                        | Gaps / Notes                                   |
| --------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Product goals and IA                          | `5/5`          | PR #1015 product decision, parent/queue/inventory alignment, docs-only gates, and CI green.                                                     | No gap; runtime implementation deferred.       |
| UX flow clarity                               | `5/5`          | Explicit opt-in UX rule, no silent habit creation, no backfill, future `Make recurring habit` flow requirements, docs-only gates, and CI green. | No gap; future UI requires screenshot handoff. |
| Business logic correctness and data integrity | `5/5`          | Stable routine identity, multi-source/source-edit history safety, fail-closed unknowns, docs-only gates, and CI green.                          | No gap; persistence deferred.                  |
| Data placement and sync boundaries            | `5/5`          | Server-canonical future linkage contract, local-only transient state boundaries, docs-only gates, and CI green.                                 | No gap; future schema/API work deferred.       |
| Reliability and failure handling              | `5/5`          | Retry-safe future mutation contract, unavailable-link fail-closed state, docs-only gates, and CI green.                                         | No gap.                                        |
| Privacy and compliance                        | `5/5`          | Private member data/redacted support diagnostics contract, docs-only gates, and CI green.                                                       | No gap.                                        |
| Content governance                            | `5/5`          | Parent, AW-006 queue, design inventory, route/label/support sweep, docs-only gates, and CI green.                                               | No gap.                                        |
| Incident response and support operations      | `5/5`          | Redacted routine/source/linkage support diagnostics contract, docs-only gates, and CI green.                                                    | No gap.                                        |
| i18n operational readiness                    | `5/5`          | Future-copy/localization guardrails for longer labels and names, docs-only gates, and CI green.                                                 | No gap; future UI copy remains deferred.       |
| Stack-fit and dependency discipline           | `5/5`          | Future reuse contract for Micro Sessions, Dryland snapshots, Habits, My Library, typed domain contracts, docs-only gates, and CI green.         | No gap; no dependency/runtime change.          |
| Testing and QA automation                     | `5/5`          | `lint:briefs`, `lint:briefs:all`, `verify:pre-pr`, PR CI, and `verify:pre-merge` all passed for the docs-only decision.                         | No gap; future runtime tests are scoped later. |
| DevOps and rollback readiness                 | `5/5`          | Docs-only diff, normal git revert rollback, current-with-main branch checks, pre-merge PASS, and CI green.                                      | No gap.                                        |
