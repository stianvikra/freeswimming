# Task Brief: Admin Notes Residual Disposition Intake

## Metadata

- `id`: `2026-06-18-admin-notes-residual-disposition-intake-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-18`
- `updated`: `2026-06-18`
- `execution_mode`: `plan only; captures live admin notes without runtime implementation`
- `parent`: `docs/task-briefs/planned/2026-06-18-admin-readability-design-audit-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-18`
- `base`: `main@a0a63d58`
- `audit_status`: `captured-and-source-notes-closed`
- `decision`: Use this as the residual admin-note intake after PR `#1157` and closeout PR `#1158`; six live source notes were closed after owner approval because they are captured in audited repo briefs. Child implementation still requires its own pre-execution audit.
- `reason`: A read-only live admin-note query on `2026-06-18` found six open notes that are not yet captured in a current planned child after the lesson editor, Help/Guide, and Analytics slices closed.
- `must_refresh_before_execution_if`: Refresh if `AdminWorkspace`, `AdminNoteQuickCaptureLauncher`, `AdminContentManager`, `AdminMessagesManager`, course lesson renderer, pass-criteria model, admin notes schema/status behavior, screenshot rules, or scorecard categories change before a child starts.

## Goal

Capture every currently open live admin note in durable repo briefs, improve the briefs before any child starts, and mark the captured live notes done after owner approval without implying implementation is complete.

## Pre-Implementation Owner Explanation

Vi samler de gjenværende åpne admin-notatene i repoet før vi bygger mer. Det betyr at hvert funn får en tydelig eier, et avgrenset scope og en test-/screenshot-plan, slik at live Notes-køen ikke blir en ekstra backlog ved siden av briefene.

Hvorfor det betyr noe: Når notatene er fanget og kvalitetssjekket i briefs, kan vi styre arbeidet fra repoet i stedet for fra løse notater. Live notes er lukket bare som “captured in audited briefs”, ikke som implementert.

Utenfor scope: ingen runtime/UI-kode, ingen data/API/schema-endringer, ingen PR, ingen merge, ingen user creation/Auth Admin, ingen pass-criteria scoring-implementasjon og ingen unread-message badge før egne owner-godkjente child briefs kjøres.

Fremoverkompatibilitet: nye admin-notater kan først lukkes når de er fanget med ID, eierbrief og godkjent closure-beslutning; ellers skal de ligge åpne med tydelig grunn. Nye admin-tabs, lesson controls, message states og completion metrics må følge kanoniske typed contracts eller kreve eksplisitt mapping/test før release.

## Source Note Disposition

Live query on `2026-06-18` returned six open notes. Bodies were used only to classify scope; this brief stores IDs, titles, context, and concise disposition.

| Note ID                                | Title                                                                                            | Context                                                                                                    | Disposition                                                                                                                                          |
| -------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `a4677939-8f6a-44ce-b585-490f65b07793` | `Admin dashboard 0 header`                                                                       | `page:/admin`                                                                                              | Split across the selected admin shell child for header/mobile discoverability and a Content action-density child for mirror snapshot/status actions. |
| `89eacfbc-3b70-4920-a505-21301816b7e6` | `Message stuck?`                                                                                 | `course_lesson:breathing-and-floating--floating-back`                                                      | Captured in the selected admin shell child as Quick note context-warning clarity.                                                                    |
| `833d64f7-0a8e-4f78-916c-71a321cd96e4` | `Indicate New Messages in Menu on Messages with Icon and number? when new messages are present?` | `course_lesson:breathing-and-floating--floating-back`                                                      | Captured in a separate Admin Messages menu indicator child because it needs a message count/unread source-of-truth decision.                         |
| `63d7037f-f025-404d-8e4e-80630fbd70dc` | `What good looks like and common mistakes - make tab?`                                           | `page:/en/course/course-module-body-position-drills/course-lesson-body-position-drills-body-position-back` | Captured in a course lesson Coach check/action clarity child.                                                                                        |
| `46eae589-ae52-4fea-bb00-8eb2fb04f29c` | `Evaluate to much text?less is more?`                                                            | `course_lesson:breathing-and-floating--floating-back`                                                      | Captured in the same course lesson Coach check/action clarity child as a re-audit of public lesson copy/actions.                                     |
| `2832e67b-bb7a-4a71-905d-1be278af606d` | `Pass Criteria -- lessons`                                                                       | `page:/admin`                                                                                              | Captured in a pass-criteria scoring decision child; implementation needs an explicit product decision.                                               |

## Child Briefs

| Priority | Child Brief                                                                                           | Notes Covered          | Classification                   | Why                                                                                                                                     |
| -------- | ----------------------------------------------------------------------------------------------------- | ---------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | `docs/task-briefs/done/2026-06-18-admin-shell-mobile-discoverability-and-quick-note-context-10-10.md` | `a4677939`, `89eacfbc` | `done`                           | Closed by PR `#1160` and closeout PR `#1161`: mobile exposes all admin tabs and Quick note context warning is clearer.                  |
| 2        | `docs/task-briefs/in-progress/2026-06-18-admin-content-mirror-and-status-action-density-10-10.md`     | `a4677939`             | `bounded implementation child`   | Active next child: keeps Content-specific mirror/status action density out of the completed shell nav slice.                            |
| 3        | `docs/task-briefs/done/2026-06-18-course-lesson-coach-check-and-action-clarity-followups-10-10.md`    | `63d7037f`, `46eae589` | `done`                           | Closed by PR `#1164`: Ready check owns completion, Coach check copy/layout is clearer, and stale Common mistakes coverage was replaced. |
| 4        | `docs/task-briefs/planned/2026-06-18-course-lesson-pass-criteria-scoring-decision-10-10.md`           | `2832e67b`             | `deferred architecture decision` | Scoring/percent/color semantics affect completion logic and should not be folded into admin shell work.                                 |
| 5        | `docs/task-briefs/planned/2026-06-18-admin-messages-menu-new-message-indicator-10-10.md`              | `833d64f7`             | `deferred architecture decision` | Requires a source-of-truth for `new/unread` message count and cross-tab shell data.                                                     |

Recommended next implementation candidate after owner audit approval: `admin-content-mirror-and-status-action-density`.

## Residual Notes Closure Policy

- Live admin notes are closed only after planning audit and owner approval.
- Closing these notes means `captured in audited repo briefs`, not `implemented`.
- Closure is allowed only after this intake and all child briefs pass brief lint, the source-note mapping still matches the live notes, and the owner explicitly approves closing the six listed IDs.
- If a child needs the source note to remain operationally visible until implementation starts, keep that note open and record the reason in this brief before any closure command.

## Closure Evidence

- Owner approval: chat approval on `2026-06-18` to run the recommended closeout end to end.
- Pre-closure live query: all six listed IDs existed and were open.
- Mutation: only the six listed IDs were updated from `is_done=false` to `is_done=true`.
- Post-closure live query: `count=6`, `open=0`, `all_done=true`.
- Server timestamp observed on the six updated rows: `2026-06-18T14:59:39.490705+00:00`.

## Pre-Execution Audit Gate

Before any child moves to `in-progress` or gets an implementation branch:

1. Refresh `git status -sb`, `git log --oneline -n 10`, this intake, and the selected child.
2. Re-check the live admin-note state for the source IDs and update disposition if titles/context/status changed.
3. Reinspect the current code surfaces named by that child and update scope, tests, Help/Guide impact, and screenshot plan.
4. Run `npm run lint:briefs:all`.
5. Get owner approval for the selected child scope before implementation begins.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for this intake: Product goals and IA, Business logic correctness and data integrity, Reliability and failure handling, Security and authz, Privacy and compliance, Content governance, Incident response and support operations, Stack-fit and dependency discipline, Testing and QA automation, DevOps and rollback readiness.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                     | Evidence                                            | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | All six open notes have one owner path and one next-step classification.                                                                               | source-note disposition table + child brief paths   | `5/5`                   |
| UX flow clarity                               | `target`     | The intake separates shell navigation, Content actions, public lesson UX, pass-criteria decisions, and message indicators so no child has mixed goals. | child brief priority table                          | `5/5`                   |
| Visual design quality                         | `supporting` | Supporting only: visual work is deferred to child screenshot handoffs.                                                                                 | child acceptance criteria                           | `4/5`                   |
| Business logic correctness and data integrity | `target`     | Live note closure updates only the six explicit note IDs after brief audit, lint, live-state refresh, and owner approval.                              | exact ID list + closure evidence                    | `5/5`                   |
| Admin editor ergonomics                       | `supporting` | Supporting only: admin ergonomics are classified into shell and Content children, not changed here.                                                    | child classifications                               | `4/5`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: child UI work must validate keyboard/focus/mobile behavior; this intake changes no UI.                                                | child validation plans                              | `4/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no runtime payload change in this docs-only intake.                                                                                   | changed-files review                                | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Admin notes remain server-canonical; this intake stores only durable planning metadata and closure evidence in repo docs.                              | live query evidence + docs diff                     | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no route/cache behavior changes.                                                                                                      | changed-files review                                | `4/5`                   |
| Reliability and failure handling              | `target`     | Closure is verified by a fresh live query; if any future closure fails, failed IDs stay open and are reported instead of silently treated as done.     | post-update query count                             | `5/5`                   |
| Security and authz                            | `target`     | Read/write access uses existing service-role admin-note contract; no secrets or raw env values are printed or committed.                               | command output review + git diff                    | `5/5`                   |
| Privacy and compliance                        | `target`     | Briefs store note titles/context/disposition only, not full private note bodies or attachments.                                                        | brief content review                                | `5/5`                   |
| Content governance                            | `target`     | Live notes are closed only after durable repo-backed owner paths are audited and owner-approved for closure.                                           | source-note table + child briefs + closure evidence | `5/5`                   |
| Admin workflow and editability                | `supporting` | Supporting only: workflow improvements are delegated to child briefs.                                                                                  | child scope table                                   | `4/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this private admin-note intake changes no public routes, metadata, sitemap, robots, canonicals, or crawlable content.                      | explicit private-admin scope rationale              | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this intake adds no public AI-facing content, structured data, entity page, or crawl-safe semantic contract.                               | explicit private-admin scope rationale              | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no event taxonomy or analytics payload changes; one future pass-criteria metric decision is separated.                                | no-runtime-diff review                              | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this intake changes no products, checkout, Stripe, entitlements, pricing, revenue, refunds, invoices, or finance behavior.                 | explicit commerce scope rationale                   | `N/A`                   |
| Incident response and support operations      | `target`     | Notes queue becomes triaged and non-duplicative; future support/UI findings are traceable by note ID.                                                  | disposition table + closure decision log            | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no billing provider data, finance report, payout, refund, invoice, accounting export, entitlement grant, or revenue truth changes.         | explicit finance scope rationale                    | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: future UI children must check copy expansion; this intake adds no visible UI copy.                                                    | child validation plans                              | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use repo task-brief process and existing admin-note service contract; no dependency or local Codex config change.                                      | docs diff + package diff review                     | `5/5`                   |
| Testing and QA automation                     | `target`     | Changed briefs pass `npm run lint:briefs:all`; live closure is verified with a fresh query after approval.                                             | lint output + query output                          | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: one intake prevents duplicate backlog handling without runtime cost.                                                                  | child routing table                                 | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Docs-only changes are reversible; live-note closure is reversible by reopening the explicit note IDs if needed.                                        | git diff + note ID list                             | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js: no runtime changes in this intake; child briefs identify their reference surfaces.
- TypeScript/domain: note IDs are canonical; note titles are human-readable labels only.
- Supabase/data: live `admin_notes.is_done` remains server-canonical; only explicit IDs were updated after brief validation and owner approval.
- External services: none.
- UI system: no UI changes here; child visual work requires screenshot handoff.
- Testing: `npm run lint:briefs:all`; fresh live note query after owner-approved closure.

## Data Placement And Sync Contract

- Server-canonical data: `admin_notes` rows and `is_done` status.
- Local data: repo brief files with source-note ID, title, context, and disposition.
- Sync policy: source notes were marked done only after this intake and child briefs were audited, linted, live-refreshed, and owner-approved for closure; closure was verified with a fresh live query.
- Retention and sensitivity: do not copy full note bodies, screenshots, attachments, secrets, provider IDs, private user data, or raw env values.
- Cache/invalidation: no route cache changes.

## Identity And Rename Contract

- Canonical stable ID: `admin_notes.id`.
- Human-readable identifiers: note titles and child brief titles may change; IDs do not.
- Mutability rules: closing a note means “captured in repo planning,” not “implemented.”
- Rename vs repurpose: materially new findings require new notes or new brief entries.
- Compatibility contract: done archive plus this brief gives traceability.
- Observability and repair: failed closure IDs would be reported and left open; this closure verified all six IDs as done.

## Forward Compatibility Contract

- Extensibility surfaces: live admin notes, admin shell tabs, Content actions, Quick note context warnings, public lesson UX, pass criteria, message states.
- Source of truth: source notes come from `admin_notes`; implementation scope comes from child briefs.
- Additive behavior: future open notes can be appended to this intake before closure, or captured in a dated successor after this intake is frozen.
- Explicit mapping requirements: new data semantics, message unread counts, completion scoring, and public lesson tab behavior require explicit child scope and tests.
- Unknown or deprecated values: unknown note contexts stay visible as raw context strings and are not auto-closed.
- Test/evidence: brief lint and live query evidence.

## Scope

- Create this residual intake.
- Create child briefs for the five owner paths listed above.
- Audit and improve this intake and the child briefs before selecting any implementation branch.
- Mark only the six listed source notes done as captured in audited briefs after owner approval.

## Out Of Scope

- Runtime UI/code/API/database schema changes.
- Runtime implementation branch, PR, CI, or merge for any child brief.
- Deleting admin notes.
- Closing notes not listed in this brief.
- Claiming the full admin dashboard is `10/10`.

## Acceptance Criteria

1. All six open note IDs are captured with disposition.
2. Child briefs exist for each owner path.
3. Changed briefs pass `npm run lint:briefs:all`.
4. Owner approval for closure is recorded in the checkpoint evidence.
5. A fresh query confirms the six IDs are no longer open.

## Validation

- `npm run lint:briefs:all`
- Fresh read-only live admin-note query before closure decision and after owner-approved closure.

## Help / Guide Impact

N/A for this intake because no product labels, runtime actions, recovery behavior, or Help/Guide UI changes. Child briefs must decide Help/Guide impact for their own scope.

## Checkpoint Log

- `2026-06-18 | planned | captured six open live admin notes into a residual intake and split them into five planned child paths after admin lesson editor, Help/Guide, and Analytics closeouts | next: audit/improve briefs before owner-approved source-note closure`
- `2026-06-18 | planned | owner approved recommended closeout; six listed live source notes were marked done as captured in audited briefs and verified with post-closure query open=0 | next: docs-only local gates, PR, merge when green, then start recommended admin shell mobile child`
- `2026-06-18 | active-child-refresh | PR #1160 and repo-managed closeout PR #1161 closed the shell/Quick note child; live metadata re-check still shows the six captured note IDs done/open=0; Content mirror/status child moved to in-progress on branch feat/admin-content-mirror-status-density | next: implement the bounded Content density child without reopening source notes`
- `2026-06-18 | active-child-refresh | PR #1162 and repo-managed closeout PR #1163 closed the Content mirror/status child; course lesson Coach check/action clarity child moved to in-progress on branch feat/course-lesson-action-clarity after owner approved the recommended scope | next: screenshot-reviewed public lesson implementation`
- `2026-06-18 | child-closed | PR #1164 closed the course lesson Coach check/action clarity child with owner-approved screenshots, full pre-PR/pre-merge gates, and required CI green; non-required deploy-preview hit Vercel upload/rate-limit while the required Vercel status was green | next: remaining planned children stay queued for separate owner audit`
