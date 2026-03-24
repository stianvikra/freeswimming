# Task Brief: Admin Notes Compose Parity And Input Stability (10/10)

## Metadata

- `id`: `2026-03-24-admin-notes-compose-parity-and-input-stability-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-03-24`
- `updated`: `2026-03-24`

## Goal

Admins can create notes from the manager, contextual panels, and quick capture with consistent fields, stable typing/search behavior, and low-friction mobile compose UX.

## Admin Notes Triage (Required When Relevant)

- Canonical source of truth:
  - relevant admin notes in `freeswimming.org` production admin on the production database.
- Reviewed production notes:
  - `9c35eed6-10d3-4495-a720-53dc7947f4b0` - `Admin note addition - paste image from clipboard to notes`
  - `edda7567-aba3-4f2e-960b-a9fa97ecc7e6` - `ADMIN NOTES`
  - `23553d48-a9b4-4c48-ae62-36dcd8c537fb` - `Discrepancies between forms in - add form on pages, the open add form in admin notes and the quick note`
  - `d78682ec-8687-48d1-90f3-269c79da1815` - `Add note form do not have all options that quick note has`
  - `e165595b-58ef-4bc0-aeeb-affbee3ff1da` - `Scrolling on mobile`
  - `8f6353f4-2e3f-473e-a420-4ca8a19e9d26` - `DEVELOPEMENT - ADMIN NOTES - Add, delete images`
- Disposition:
  - `in this brief` for compose-form parity, typing/search stability, clipboard image paste, and mobile compose ergonomics.
  - covered elsewhere from the same note cluster:
    - screenshot capture/preview is already covered by `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-22-admin-notes-screenshot-region-capture-10-10.md`,
    - attachment delete, note priority, related-note links, done archive, search/filter, and quick capture foundations are already covered by shipped admin-notes slices.
- Rules:
  - do not treat local DB/test notes/chat summaries as canonical for note status,
  - this brief is intended to own the remaining compose-surface inconsistencies without reopening already-shipped attachment/search foundations.

## Why This Brief Exists

- Admin notes now have strong foundations for:
  - search/filter and done archive,
  - quick capture,
  - screenshot capture,
  - attachments, priority, and related-note links.
- The remaining friction is now concentrated in compose ergonomics:
  - inconsistent fields between note entry surfaces,
  - unstable text-input behavior,
  - no clipboard image paste path,
  - too much mobile scrolling when creating notes quickly.
- This is valuable enough to deserve its own slice instead of being hidden inside builder or unrelated admin work.

## Dependencies And Boundaries

- Depends on:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-21-admin-notes-workflow-v2-core-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-22-admin-notes-quick-capture-launcher-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-22-admin-notes-screenshot-region-capture-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/in-progress/2026-03-21-admin-notes-workflow-v2-attachments-and-linking-10-10.md`
  - `/Users/stianvikra/freeswimming/components/admin/AdminNotesManager.tsx`
  - `/Users/stianvikra/freeswimming/components/admin/AdminContextNotesPanel.tsx`
  - `/Users/stianvikra/freeswimming/components/admin/AdminNoteQuickCaptureLauncher.tsx`
- This slice owns:
  - compose-surface parity,
  - typing and search-input stability,
  - clipboard image paste UX for admin-note image flows,
  - compose-entry ergonomics on smaller viewports.
- This slice does not own:
  - a new ticket system,
  - OCR or screenshot annotation,
  - public uploads,
  - broad admin dashboard redesign.

## Scope

- Align note-create fields and compose semantics across:
  - `/admin` notes manager create flow,
  - contextual `Add note` panels,
  - admin quick-capture launcher.
- Fix input stability regressions:
  - textarea/input focus should not drop after one character,
  - search should accept normal continuous typing without broken focus or state churn.
- Support admin-only clipboard image paste where image attachments are already supported.
- Improve mobile compose ergonomics so admins can add a note quickly without excessive scroll or confusing always-open compose chrome.
- Keep create/edit/cancel/save/retry states explicit and consistent across the in-scope note-entry surfaces.

## Out Of Scope

- Public-user note capture.
- OCR, image analysis, or automatic screenshot labeling.
- Full admin-notes taxonomy redesign.
- Replacing normal image upload/capture flows rather than complementing them.
- General site search/input redesign outside admin notes.

## Data Placement And Sync Contract

- Server-canonical data:
  - saved note rows,
  - saved attachment metadata rows,
  - saved attachment storage objects,
  - canonical context refs for saved notes.
- Local-only data:
  - in-progress create/edit draft state,
  - current search query,
  - temporary pasted image blob/preview before save,
  - disclosure/collapse state for compose chrome where applicable.
- Sync policy:
  - typing/search state remains local until explicit note mutation occurs,
  - pasted images stay local until note save/upload confirmation,
  - form parity must not create divergent payload meaning across surfaces.
- Retention and sensitivity:
  - pasted screenshots/images remain admin-only,
  - temporary pasted image data must not persist beyond the current local editing session unless explicitly saved.
- Cache/invalidation:
  - saved notes and attachments refresh relevant manager/contextual surfaces deterministically after success,
  - failed or cancelled compose attempts do not mutate canonical note rows.

## Identity And Rename Contract

- Canonical stable ID:
  - `admin_note.id` remains canonical note identity across all compose surfaces.
- Human-readable identifiers:
  - titles, helper text, placeholder copy, and filenames are display metadata only.
- Mutability rules:
  - field parity must not change note identity or silently rewrite canonical context refs,
  - search and compose disclosure state are UI state only.
- Rename vs repurpose policy:
  - wording and helper-text changes stay in place for the same compose surface,
  - materially different note concerns still create separate note rows instead of overloading one draft.
- Compatibility contract:
  - existing notes and attachments remain valid with no migration to a new note identity model.
- Observability and repair:
  - input-state bugs, failed paste handling, and mismatched field availability should be diagnosable and test-covered.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Admin editor ergonomics`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                              | Evidence                             |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Product goals and IA                          | `target`     | Admin can understand where to add a note and what fields are available without re-learning each surface.                                    | IA review + manual QA + e2e          |
| UX flow clarity                               | `target`     | Typing, search, paste, save, cancel, and retry feel consistent and stable across in-scope note-entry surfaces.                             | e2e + manual QA                      |
| Visual design quality                         | `target`     | Compose controls feel intentional and coherent instead of like three slightly different note forms.                                         | screenshot review + manual QA        |
| Business logic correctness and data integrity | `target`     | Equivalent fields mean equivalent saved payload semantics across manager/context/quick-capture paths with no silent data loss.             | unit tests + runtime guards          |
| Admin editor ergonomics                       | `target`     | High-frequency note capture remains fast on desktop and mobile, with low-friction image paste and stable text entry.                       | timed manual QA + e2e                |
| Accessibility (a11y)                          | `target`     | Search, compose, paste/upload affordances, and error states remain keyboard/touch accessible with clear labels and focus behavior.         | Playwright + manual QA               |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: compose-parity work must avoid obvious `/admin` or contextual-panel responsiveness regressions.                            | build + code review                  |
| Data placement and sync boundaries            | `target`     | Local draft/search/paste state stays local until explicit save/upload confirmation, while note truth remains server-canonical.             | contract review + tests              |
| Caching and invalidation strategy             | `target`     | Saved note changes refresh relevant manager/contextual/quick-capture surfaces deterministically without stale field mismatches.             | integration review + e2e             |
| Reliability and failure handling              | `target`     | Input/search/paste failures show actionable recovery and never claim saved note state before server confirmation.                           | negative-path tests + manual QA      |
| Security and authz                            | `target`     | Pasted/admin-only images and richer compose fields remain hidden from non-admin users and fail closed on unauthorized paths.               | API/UI negative-path tests           |
| Privacy and compliance                        | `supporting` | Supporting only: pasted/admin images stay private and temporary client-only image state does not become a hidden retention risk.           | storage review + tests               |
| Content governance                            | `supporting` | Supporting only: category/priority/context semantics remain consistent with the canonical admin-notes workflow.                             | Help/Guide + code review             |
| Admin workflow and editability                | `target`     | All note-entry surfaces behave consistently enough that admins do not need surface-specific memory to create the same kind of note.        | e2e + manual QA                      |
| SEO and crawlability                          | `N/A`        | N/A because admin-note compose surfaces are private admin-only workflows with no public crawl/index contract.                              | scope rationale                      |
| AI discoverability                            | `N/A`        | N/A because this slice changes no public AI-facing discoverability surface.                                                                | scope rationale                      |
| Analytics and KPI observability               | `supporting` | Supporting only: compose open, search, paste, save, cancel, and retry paths should remain measurable enough to validate reduced friction.  | analytics review                     |
| Commerce and revenue ops                      | `N/A`        | N/A because no pricing, billing, payout, or commercial reporting path changes in this admin-notes compose slice.                           | scope rationale                      |
| Incident response and support operations      | `target`     | Help/Guide and runbooks explain compose-surface differences, paste/capture fallback paths, and failure recovery clearly.                   | docs review + help-center assertions |
| Finance and reporting operations              | `N/A`        | N/A because no billing, reconciliation, payout, or finance reporting logic changes in this slice.                                          | scope rationale                      |
| i18n operational readiness                    | `supporting` | Supporting only: compose labels and helper text remain localization-safe and do not encode logic in free text alone.                       | copy review                          |
| Stack-fit and dependency discipline           | `target`     | Reuse existing admin-note APIs and browser-native capabilities without unnecessary third-party compose/upload dependencies.                 | dependency diff + code review        |
| Testing and QA automation                     | `target`     | Coverage protects field parity, typing/search stability, clipboard paste, mobile compose behavior, and unauthorized-path denial.           | tests + `verify:pre-pr` evidence     |
| Scalability and cost efficiency               | `supporting` | Supporting only: compose improvements avoid duplicate entrypoints, duplicate saves, and unnecessary attachment churn.                      | workflow review + code review        |
| DevOps and rollback readiness                 | `supporting` | Supporting only: compose-surface hardening can be rolled back cleanly without schema rewrite or data migration.                            | rollback note + diff review          |

## Acceptance Criteria

1. In-scope note-create surfaces expose a coherent set of note fields and helper behaviors.
2. Quick note and notes search accept normal continuous typing without focus-loss or one-character churn.
3. Admin can paste a supported image from clipboard into an in-scope note flow and save it through the existing attachment lifecycle.
4. Mobile note creation feels faster and less scroll-heavy than the current compose experience.
5. Existing screenshot capture, upload, priority, and related-note foundations remain intact.
6. `npm run lint:briefs`, targeted tests, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run lint`
- `npm run typecheck`
- targeted unit tests for:
  - compose payload parity,
  - typing/search state stability,
  - clipboard image validation/paste handling
- targeted e2e for:
  - manager create flow,
  - contextual add-note flow,
  - quick-capture flow,
  - mobile compose behavior,
  - unauthorized-path denial
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS and npm must be installed on the machine used for local validation.
- Local validation runs from repo root.

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/admin?tab=notes`
  - contextual note surfaces such as `/my-library/profile`
- Preview:
  - PR preview URL after branch push
- Recommended matrix:
  - iPhone Safari
  - Android Chromium
  - iPad/tablet viewport
  - Desktop Chrome
  - Desktop Safari/WebKit
  - Desktop Firefox

## Constraints

- Keep this slice focused on compose-surface consistency rather than reopening the full admin-notes data model.
- Preserve already-shipped attachment, priority, related-note, and screenshot-capture semantics.
- Prefer browser-native/platform-native patterns over new dependencies.

## 10/10 Quality Bar

- Compose should feel like one coherent system, not three similar-but-different note forms.
- Admin should trust that typing, searching, and pasted image staging are stable before save.
- Required states remain explicit:
  - `loading`
  - `empty`
  - `error`
  - `retry`
  - `success`
- Mobile compose should reduce friction without hiding important fields or failure states.

## Checkpoint Log

- `2026-03-24 | planning | created dedicated admin-notes compose-parity brief from real production-note friction around field mismatch, unstable typing/search, clipboard image paste, and mobile compose ergonomics | next: triage remaining admin notes against this planned brief, then return execution priority to the manual workout builder`
- `2026-03-24 | feat/admin-notes-compose-parity-clipboard@working-tree | moved brief to in-progress and implemented priority parity for contextual note forms, local search state with URL persistence in the notes manager, clipboard-image paste for attachment-capable note flows, and a lighter quick-capture image-tools disclosure for mobile | next: finish repo gates, open PR, and record the validation evidence`
- `2026-03-24 | feat/admin-notes-compose-parity-clipboard@working-tree | help-guide and recovery docs now cover clipboard paste, collapsed image tools, and local-only staged-image recovery; targeted tests, targeted admin Playwright, typecheck, build, and full npm run verify:pre-pr passed with NODE_OPTIONS=--max-old-space-size=4096 in the isolated worktree | next: stage cleanly, rerun changed-brief lint, commit, push, and open PR`
- `2026-03-24 | feat/admin-notes-compose-parity-clipboard@working-tree | hardened notes-manager filter state to stay local-first and hardened admin-notes workflow readiness checks so full-suite loading transients skip instead of failing half-hydrated note queues; final targeted admin-notes tests and final npm run verify:pre-pr passed in the isolated worktree | next: commit, push, open PR, and monitor CI`
- `2026-03-24 | main@5221342 | PR #283 merged as squash commit 5221342fc9c5b8061b306f3ef7e834c1b8d577ad after required CI green plus local npm run verify:pre-merge PASS; brief moved to done in follow-up closeout branch so lifecycle state matches shipped code | next: return focus to builder/Garmin handoff priority`
