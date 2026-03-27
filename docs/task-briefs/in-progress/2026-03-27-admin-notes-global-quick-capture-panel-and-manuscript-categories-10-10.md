# Task Brief: Admin Notes Global Quick Capture Panel And Manuscript Categories (10/10)

## Metadata

- `id`: `2026-03-27-admin-notes-global-quick-capture-panel-and-manuscript-categories-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-03-27`
- `updated`: `2026-03-27`

## Goal

Quick note should behave like a true non-modal right-docked utility panel that admins can collapse, reopen, and keep using while scrolling or navigating the app, and the notes taxonomy should add the manuscript/planning categories the owner needs for live content production.

## Why This Brief Exists

- The original quick-capture launcher shipped the right note-creation foundation, but the current shell still behaves too much like a modal for the real screenshot-and-review workflow.
- Live use exposed the intended operator mental model clearly:
  - start a quick note,
  - temporarily slide it out of the way,
  - keep the page underneath interactive,
  - collect screenshots or inspect other pages,
  - reopen the same note with the same draft still intact.
- Production admin note `881e222b-4c14-4a23-b677-60b0713e220f` explicitly keeps the route-surface and rollout question open for quick capture, so this is the correct owner brief for turning quick capture into a better global utility surface rather than a route-local modal.
- The owner also needs manuscript-focused note categories for planning course/page/video content in notes, plus a `Swimshop` category for tracking prospective buy/sell items.

## Dependencies And Boundaries

- Shipped launcher baseline:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-22-admin-notes-quick-capture-launcher-10-10.md`
- Shipped compose/image-intake follow-ups:
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-24-admin-notes-compose-parity-and-input-stability-10-10.md`
  - `/Users/stianvikra/freeswimming/docs/task-briefs/done/2026-03-25-admin-notes-image-intake-simplification-and-clipboard-paste-button-10-10.md`
- This slice owns:
  - quick-note panel shell behavior,
  - collapse/reopen model,
  - cross-route draft continuity,
  - new note-category taxonomy rows needed for current editorial use.
- This slice does not own:
  - broad all-pages launcher rollout beyond already supported surfaces,
  - full route-surface eligibility policy for every page in the app,
  - content-model changes for lessons/pages/videos themselves,
  - non-note commerce/catalog workflows beyond the note-category taxonomy needed for `Swimshop`.

## Admin Notes Triage Status

Production admin notes reviewed against this scope on `2026-03-27`:

- `881e222b-4c14-4a23-b677-60b0713e220f` `Admin notes quick capture route-surface expansion follow-up`
  - disposition: owned by this brief.
  - rationale: the requested redesign turns quick capture into a better app-wide utility surface with clearer behavior during route/page review, which is exactly the unresolved follow-up question in that production note.

Owner-requested scope not currently represented as its own production admin note:

- Add note categories:
  - `Video Manuscript`
  - `Lesson Manuscript`
  - `Page Manuscript`
  - `Swimshop`
  - disposition: directly owned here as current editorial-taxonomy setup requested during live content production.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim in this brief:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold (if `target`)                                                                                                                                 | Evidence                                          |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Product goals and IA                          | `target`     | Quick note reads as a reusable utility panel, not a dead-end modal, and the category additions map cleanly to manuscript/planning jobs without taxonomy noise. | manual QA + code review + brief acceptance        |
| UX flow clarity                               | `target`     | Admin can open, collapse, reopen, scroll behind, navigate, and save/discard a quick note without guessing which action preserves the draft.                    | unit + e2e + manual QA                            |
| Visual design quality                         | `target`     | Open and collapsed quick-note states feel edge-docked, intentional, and non-obstructive; no floating box obscures primary content.                             | screenshots + manual QA                           |
| Business logic correctness and data integrity | `target`     | Draft state persists predictably across collapse/reopen and route changes, while saved notes still write one normal canonical admin note with locked context.  | unit tests + e2e + runtime guard review           |
| Admin editor ergonomics                       | `target`     | Screenshot/content-review flow no longer requires discarding or recreating drafts just to inspect the page or move to another route.                           | manual QA + e2e                                   |
| Accessibility (a11y)                          | `target`     | Quick note remains keyboard reachable with clear labels for collapse, reopen, close, and discard; underlying page remains navigable when panel is open.        | unit + e2e + code review                          |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: redesign should not add obvious route-level regressions or heavy dependencies.                                                                | build + dependency diff                           |
| Data placement and sync boundaries            | `target`     | Brief and implementation explicitly define what draft state is local, what note data is server-canonical, and how route changes interact with draft context.   | brief contract + unit tests                       |
| Caching and invalidation strategy             | `supporting` | Supporting only: saved notes still refresh canonical notes surfaces predictably after mutation.                                                                | existing mutation flow + e2e                      |
| Reliability and failure handling              | `target`     | Collapse/navigation/reopen never silently discards the draft; failures preserve recovery path and explain next action.                                         | unit + e2e + recovery-doc update                  |
| Security and authz                            | `target`     | Quick note remains role-gated and continues to fail closed for unauthorized users and endpoints.                                                               | existing negative-path coverage + targeted tests  |
| Privacy and compliance                        | `supporting` | Supporting only: draft persistence must avoid leaking sensitive note content outside the signed-in browser session.                                            | code review + local storage contract              |
| Content governance                            | `supporting` | Supporting only: manuscript categories improve planning taxonomy without changing canonical content ownership or publish flows.                                | migration + admin category behavior review        |
| Admin workflow and editability                | `target`     | Manuscript and `Swimshop` categories appear in normal note workflows without special casing, and quick note stays compatible with full Notes management.       | manual QA + category fetch behavior               |
| SEO and crawlability                          | `N/A`        | N/A because this slice affects admin-only tooling and note taxonomy only, with no public metadata or crawl surface changes.                                    | scope rationale                                   |
| AI discoverability                            | `N/A`        | N/A because the work changes no public semantic/content-discovery surface.                                                                                     | scope rationale                                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice adds no new analytics requirement; workflow value can be judged from operator use directly.                                             | scope rationale                                   |
| Commerce and revenue ops                      | `N/A`        | N/A because `Swimshop` is only a notes category for operator planning and does not change catalog, pricing, checkout, or entitlements.                         | scope rationale                                   |
| Incident response and support operations      | `target`     | Help/Guide and recovery docs explain the new collapse/reopen behavior, page interaction model, and cross-route draft expectations.                             | Help/Guide + runbook update + tests               |
| Finance and reporting operations              | `N/A`        | N/A because note-category additions do not affect finance records, reporting, reconciliation, or payouts.                                                      | scope rationale                                   |
| i18n operational readiness                    | `supporting` | Supporting only: new category titles and panel labels remain localization-safe plain strings with no hidden logic.                                             | copy review                                       |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Next/React/admin-note patterns without adding new dependencies.                                                                                 | dependency diff + code review                     |
| Testing and QA automation                     | `target`     | Coverage protects collapse/reopen, non-modal behavior, cross-route draft continuity, note save/discard paths, and category availability.                       | unit + e2e + `verify:pre-pr`                      |
| Scalability and cost efficiency               | `supporting` | Supporting only: local draft persistence stays lightweight and avoids runaway network chatter or duplicate note creation.                                      | code review + test assertions                     |
| DevOps and rollback readiness                 | `target`     | Category additions ship via migration, and the quick-note shell can be rolled back without data migration or saved-note corruption.                            | migration diff + rollback reasoning + verify gate |

## Data Placement And Sync Contract

- Server-canonical data:
  - saved admin-note rows,
  - admin-note attachments after explicit upload,
  - admin-note categories in `public.admin_categories`.
- Local data:
  - open/collapsed quick-note panel state,
  - unsaved draft text, staged image preview, and locked draft context while the operator is still composing.
- Sync policy:
  - draft remains local until explicit save,
  - save continues to use canonical admin-notes APIs,
  - once a quick-note draft starts, the note context stays locked to the original context even if the operator navigates elsewhere before saving,
  - route changes may restore or rehydrate the same local draft, but must not silently mutate the original note context.
- Retention and sensitivity:
  - draft persistence is browser-session scoped only and must not become a cross-user/shared artifact,
  - image preview/local metadata should stay ephemeral and clear on discard or successful save.
- Cache/invalidation:
  - category reads stay `no-store` and server-canonical,
  - successful note saves continue to refresh/reinsert the saved item through existing notes-surface logic.

## Identity And Rename Contract

- Canonical stable ID:
  - `admin_note.id` remains the source-of-truth identity for saved notes.
  - `admin_categories.id` remains the source-of-truth identity for categories.
- Human-readable identifiers:
  - category `slug` is the stable machine-readable taxonomy key,
  - category `title` is the operator-facing label and may be edited later through normal category-management workflows if needed.
- Mutability rules:
  - quick-note draft context is temporarily local and not a durable identifier,
  - draft context is locked for that draft instance after the first open so a route change does not repurpose the same draft unexpectedly.
- Rename vs repurpose policy:
  - new manuscript/`Swimshop` categories should be created as new rows, not repurposed from older generic categories.
- Compatibility contract:
  - existing note flows continue to accept any server-provided active note category by title without special migration in UI.
- Observability and repair:
  - if draft restore fails, the operator still gets a clear empty-state panel instead of a broken shell, and no server note is created until save succeeds.

## Scope

- Redesign `AdminNoteQuickCaptureLauncher` into a non-modal right-docked utility panel.
- Replace destructive modal-close mental model with:
  - explicit collapse/reopen arrows,
  - separate close/discard behavior,
  - persistent slim edge handle when collapsed.
- Keep the page underneath interactive while the panel is open:
  - no backdrop,
  - no body scroll lock,
  - no inerting of underlying content.
- Preserve unsaved quick-note drafts across client-side route navigation while keeping original note context locked and visible.
- Add note categories:
  - `Video Manuscript`
  - `Lesson Manuscript`
  - `Page Manuscript`
  - `Swimshop`
- Update Help/Guide and admin-notes recovery docs for the new panel behavior.

## Out Of Scope

- Broad redesign of full admin notes manager.
- Automatic retargeting of a draft note to the page you navigate to later.
- General-purpose multi-draft notes workspace.
- Public-user note capture or public taxonomy changes.
- Commerce/catalog feature work beyond adding the `Swimshop` notes category.

## Acceptance Criteria

1. Quick note opens as a non-modal right-docked panel, not a blocking modal sheet.
2. While quick note is open, the page behind it remains scrollable and clickable.
3. Quick note always exposes a clear collapse action that slides the panel out to the right and leaves a slim reopen handle with an arrow.
4. Quick note collapse/reopen preserves current draft fields and one staged image without covering arbitrary page content when collapsed.
5. Navigating to another supported route while a draft exists preserves the draft and reopens it with the original locked context still shown clearly.
6. Discard/close remains separate from collapse so admins can intentionally abandon a draft instead of hiding it temporarily.
7. Saving from quick note still creates one normal admin note in the existing notes workflow with canonical context and attachment behavior.
8. The notes category list includes `Video Manuscript`, `Lesson Manuscript`, `Page Manuscript`, and `Swimshop`, and those categories are available in quick capture and other note-compose surfaces that load active note categories from the API.
9. Help/Guide and recovery docs explain the new utility-panel behavior and the difference between collapse and discard.
10. `npm run lint:briefs`, targeted tests, and `npm run verify:pre-pr` pass before PR update.

## Validation

- `npm run lint:briefs`
- `npm run typecheck`
- `npx vitest run tests/unit/admin-note-quick-capture-launcher.test.tsx`
- targeted Playwright:
  - `npx playwright test tests/e2e/admin-notes-workflow.spec.ts --project=desktop-chromium`
  - `npx playwright test tests/e2e/admin-contextual-notes.spec.ts --project=desktop-chromium`
  - `npx playwright test tests/e2e/admin-help-center.spec.ts --project=desktop-chromium`
- `npm run verify:pre-pr`
- before merge: `npm run verify:pre-merge`

## Manual QA Environments

- Production/admin verification after merge:
  - `https://freeswimming.org/admin`
  - `https://freeswimming.org/course`
  - one additional supported quick-capture surface such as `/plans`
- Local iteration:
  - `http://127.0.0.1:3100/admin`

## Constraints

- Preserve existing visual language; this should feel like a refinement of the admin notes utility, not a brand-new design system.
- Do not regress the already-shipped quick-note save/image flows while changing shell behavior.
- Avoid new dependencies.
- Keep draft persistence limited enough that it is helpful during current work but does not become a hidden multi-session sync problem.

## 10/10 Quality Bar

- Quick note must communicate three distinct intents clearly:
  - `collapse/hide temporarily`,
  - `reopen/resume`,
  - `discard/close for real`.
- Required states for the panel:
  - loading categories,
  - empty draft,
  - draft with staged image,
  - upload-retry recovery,
  - save error,
  - collapsed handle,
  - restored draft after navigation.
- Accessibility:
  - collapse/reopen controls labeled,
  - keyboard reachable,
  - no focus trap that blocks page interaction when the utility panel is open.
- Performance:
  - no obvious interaction lag from draft persistence or repeated category fetches,
  - no new dependency cost.
- Visual consistency:
  - collapsed state reads like a docked utility handle, not a floating widget or random obstructive card.
- Business-logic correctness:
  - original context remains visible and stable for the life of a draft,
  - no accidental draft loss on collapse/navigation,
  - no duplicate note creation on save/retry.

## Help/Guide And Operator Training Contract

- Required in same PR:
  - explain that quick note is now a non-modal docked utility panel,
  - explain collapse vs discard,
  - explain that the underlying page remains interactive,
  - explain that draft context stays tied to the original page/item even if the operator navigates elsewhere before saving.

## Checkpoint Log

- `2026-03-27 | verify:pre-pr green + prod categories inserted | replaced modal quick capture with a non-modal docked utility panel, preserved drafts across supported-route navigation with locked original context, updated Help/Guide + recovery docs, added Lesson Manuscript/Page Manuscript/Video Manuscript/Swimshop via migration, inserted the same four categories directly into the production admin_categories table, and passed targeted unit/e2e plus full \`npm run verify:pre-pr\` | next: review worktree, commit, push, open PR, and wait for CI before merge gate`
- `2026-03-27 | planning | confirmed production note 881e222b-4c14-4a23-b677-60b0713e220f as the canonical quick-capture follow-up owner, and added owner-requested taxonomy scope for Video Manuscript, Lesson Manuscript, Page Manuscript, and Swimshop | next: implement non-modal docked panel, draft persistence, category migration, docs, and tests`
