# Task Brief: Admin Notes Quick Capture Launcher (10/10)

## Metadata

- `id`: `2026-03-22-admin-notes-quick-capture-launcher-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-03-22`
- `updated`: `2026-03-22`

## Goal

Signed-in admins can capture a new admin note quickly from key app surfaces with canonical route/context prefilled, while non-admin users never see the launcher.

## Why This Brief Exists

- The richer admin-notes slice for attachments/priority/related links is already large enough on its own.
- Quick capture is a different kind of work:
  - touches multiple app surfaces,
  - depends on clean admin-only visibility rules,
  - changes navigation and workflow entrypoints more than the notes data model itself.
- Splitting it keeps storage/data-integrity work separate from launcher/surface rollout risk.

## Dependencies And Boundaries

- Depends on:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-21-admin-notes-workflow-v2-core-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-03-21-admin-notes-workflow-v2-attachments-and-linking-10-10.md`
  - `/Users/stianvikra/freeswimming/components/admin/AdminContextNotesPanel.tsx`
  - `/Users/stianvikra/freeswimming/components/admin/AdminNotesManager.tsx`
- This slice owns:
  - launcher visibility,
  - route/context prefill behavior,
  - lightweight capture UX from in-app surfaces.
- This slice does not own:
  - storage-backed attachment lifecycle,
  - note priority data model,
  - related-note linking schema.

## Scope

- Add an admin-only quick-capture launcher on key routes:
  - `/admin`
  - `/plans`
  - selected content/edit surfaces already using contextual admin tooling
- Launcher opens a lightweight note-create flow with canonical route/context prefilled.
- Saving routes the new note into the existing notes workflow without losing operator context.
- Non-admin users never see launcher affordances or launcher payloads.
- Help/Guide and runbooks explain launcher behavior and recovery path.

## Out Of Scope

- Public-user note capture.
- Broad site-wide floating-toolbar redesign.
- Replacing contextual notes panels that already exist where they are sufficient.
- Attachment upload logic, priority semantics, and related-note link lifecycle.

## Data Placement And Sync Contract

- Server-canonical data:
  - saved note row,
  - canonical context type/ref values.
- Local-only data:
  - launcher open/closed state,
  - unsaved draft text,
  - route-prefill preview before explicit save.
- Sync policy:
  - prefill remains local until explicit save,
  - save uses the canonical admin-notes API,
  - cancelling capture must not create or mutate any server note row.

## Identity And Rename Contract

- Canonical identity remains `admin_note.id`.
- Route labels and launcher captions are display metadata only.
- Quick capture must never invent free-text context refs when a canonical route/context ref exists.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Admin editor ergonomics`
- `Security and authz`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                     | Evidence                             |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Product goals and IA                          | `target`     | Admin can discover quick capture from key routes without confusing it with public UI or the full notes workspace.                  | IA review + manual QA + e2e          |
| UX flow clarity                               | `target`     | Opening, prefilling, saving, cancelling, and returning from quick capture feel obvious and deterministic on supported surfaces.    | e2e + manual QA                      |
| Visual design quality                         | `target`     | Launcher and sheet/modal affordances feel intentional and low-noise on both desktop and tablet/mobile layouts.                     | screenshot review + manual QA        |
| Business logic correctness and data integrity | `target`     | Launcher save uses canonical context refs and never creates stray notes on cancel or authz failure.                                | unit tests + runtime guards          |
| Admin editor ergonomics                       | `target`     | Admin can create a context-aware note without re-finding the notes tab or manually re-entering route context.                      | timed manual QA + e2e                |
| Accessibility (a11y)                          | `target`     | Launcher trigger, focus handling, and save/cancel actions remain keyboard and touch accessible.                                    | Playwright + manual QA               |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: launcher UI must avoid obvious route-level regressions or unnecessary client payload growth.                      | build + code review                  |
| Data placement and sync boundaries            | `target`     | Prefill state is local-only until save, while saved note context remains server-canonical and consistent with notes APIs.          | contract review + tests              |
| Caching and invalidation strategy             | `target`     | Saved notes refresh relevant contextual panels/work queues deterministically without forcing the admin out of the current surface. | integration review + e2e             |
| Reliability and failure handling              | `target`     | Failed save or authz checks show actionable guidance and preserve the draft when appropriate.                                      | negative-path tests + manual QA      |
| Security and authz                            | `target`     | Non-admin users never see the launcher, and direct launcher/save paths fail closed for unauthorized access.                        | API/UI negative-path tests           |
| Privacy and compliance                        | `target`     | Launcher-prefilled route context remains admin-only and is never leaked into public UI.                                            | route review + test assertions       |
| Content governance                            | `supporting` | Supporting only: launcher copy and context labels stay consistent with existing notes governance and route taxonomy.               | Help/Guide + code review             |
| Admin workflow and editability                | `target`     | Quick capture complements, rather than replaces, the full notes manager and contextual notes panels.                               | e2e + manual QA                      |
| SEO and crawlability                          | `N/A`        | N/A because the launcher is admin-only and adds no public crawl/index surface.                                                     | scope rationale                      |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public AI-facing discoverability surface.                                                        | scope rationale                      |
| Analytics and KPI observability               | `supporting` | Supporting only: launcher open/save/cancel events should remain measurable enough to confirm workflow value.                       | analytics review                     |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, billing, payout, or revenue workflow changes in this launcher slice.                                       | scope rationale                      |
| Incident response and support operations      | `target`     | Help/Guide and runbooks explain where quick capture appears, what it prefills, and how to recover if a save fails.                 | docs review + help-center assertions |
| Finance and reporting operations              | `N/A`        | N/A because no billing, reconciliation, payout, or finance reporting logic changes in this slice.                                  | scope rationale                      |
| i18n operational readiness                    | `supporting` | Supporting only: launcher labels and prefill copy remain localization-safe and do not hide logic inside free text.                 | copy review                          |
| Stack-fit and dependency discipline           | `target`     | Reuse existing admin auth, notes APIs, and contextual panels without introducing unnecessary launcher dependencies.                | dependency diff + code review        |
| Testing and QA automation                     | `target`     | Coverage protects launcher visibility, route/context prefill, cancel/save behavior, and unauthorized-path denial.                  | tests + `verify:pre-pr` evidence     |
| Scalability and cost efficiency               | `supporting` | Supporting only: launcher rollout should avoid duplicate entrypoints and accidental note spam from repeated prefills.              | workflow review + code review        |
| DevOps and rollback readiness                 | `supporting` | Supporting only: launcher rollout can be rolled back cleanly without touching existing saved note data.                            | rollback note + diff review          |

## Acceptance Criteria

1. Signed-in admins can open quick capture from the agreed key surfaces.
2. Route/context is prefilled canonically without manual re-entry on supported surfaces.
3. Cancelling quick capture creates no note and leaves no server drift.
4. Saving quick capture writes a normal admin note that appears in the existing notes workflow.
5. Non-admin users never see launcher controls or launcher-only data.
6. `npm run lint:briefs`, targeted tests, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- targeted unit tests for launcher visibility and route/context prefill
- targeted e2e for open, cancel, save, and unauthorized-path denial
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Checkpoint Log

- `2026-03-22 | verify:pre-pr green | completed reusable quick-note launcher rollout for admin dashboard and contextual notes surfaces, added viewer-safe authz gating, updated Help/Guide + recovery runbook, and passed full local verify:pre-pr on branch \`fix/admin-notes-quick-capture-launcher-2026-03-22\` | next: commit, push, open PR, and run merge gate`
- `2026-03-22 | implementation started | moved quick-capture launcher brief to in-progress, added a reusable admin quick-note launcher for dashboard/contextual surfaces, and aligned contextual notes authz so viewer sessions do not get create affordances | next: finish targeted unit/e2e coverage, update Help/Guide + recovery docs, and run lint/verify gates`
- `2026-03-22 | planning | split quick capture out of the richer attachments/linking notes scope so launcher rollout can be implemented and tested as its own authz/navigation slice after storage-backed note enrichments land | next: finish attachments/priority/related links first, then implement launcher surfaces on a dedicated branch`
