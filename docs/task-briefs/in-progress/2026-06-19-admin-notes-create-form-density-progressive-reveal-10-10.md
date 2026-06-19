# Task Brief: Admin Notes Create-Form Density Progressive Reveal

## Metadata

- `id`: `2026-06-19-admin-notes-create-form-density-progressive-reveal-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-19`
- `updated`: `2026-06-19`
- `parent`: `docs/task-briefs/planned/2026-06-18-admin-readability-design-audit-10-10.md`
- `source_audit`: `docs/task-briefs/done/2026-06-19-admin-readability-combined-score-refresh-notes-preaudit-10-10.md`
- `execution_mode`: `execute after owner approval`

## Brief Audit Record

- `last_audited`: `2026-06-19`
- `base`: `main@0fe229f4`
- `audit_status`: `ready`
- `decision`: Execute this child now after the smaller Notes open-count navigation indicator child shipped.
- `reason`: PR `#1177` and closeout PR `#1178` are merged, and the owner approved the recommended next step: create-form density first, with floating Notes quick access kept as a separate planned child.
- `must_refresh_before_execution_if`: Refresh if `AdminNotesManager`, Notes API contracts, attachment limits, admin note context types, incident severity guidance, Admin Help/Guide Notes copy, Notes tests, screenshot handoff rules, scorecard categories, or parent admin-readability status change before implementation.

## Relationship To Notes Open-Count Child

Recommended order:

1. `docs/task-briefs/done/2026-06-19-admin-notes-open-count-navigation-indicator-10-10.md`
2. this create-form density child

Reason: the open-count child improves Notes triage/discovery without touching create/edit/upload/link layout. It is smaller and matches the proven Messages badge pattern.

## Goal

Make the Admin Notes create form easier to scan by progressively revealing low-frequency incident/image/context detail while preserving all Notes data, upload, context, related-note, and recovery behavior.

## Pre-Implementation Owner Explanation

Vi vil gjore Notes-oppretting roligere uten aa endre hva en note er. Den vanlige jobben - tittel, kategori, dato, prioritet, tekst og lagring - skal vaere lett aa se. Incident-maler, bilder og kontekst skal fortsatt finnes, men ikke dominere naar de ikke er i bruk.

Hvorfor det betyr noe: Notes brukes baade som enkel oppgaveliste og som support-/incident-logg. Naar alt vises samtidig, blir det tungt aa opprette en enkel note og lettere aa overse aktive recovery-varsler.

Utenfor scope: ingen API-, database-, auth-, attachment-, related-note-, context-, incident-severity-, status-, Quick note-, filter-, Help/Guide-prosedyre-, performance-budget- eller admin-nav-endring uten eksplisitt scope.

Fremoverkompatibilitet: nye Notes-kategorier/context-valg skal fortsatt komme fra eksisterende kilder, mens nye incident-severities, recovery states eller support-prosedyrer maa mappes eksplisitt med tester og Help/Guide/runbook-beslutning.

## Scope

- Presentation/copy structure inside `components/admin/AdminNotesManager.tsx` create panel only, plus tests/docs required by visible label changes.
- Keep immediately visible:
  - create form title,
  - category,
  - date,
  - priority,
  - text,
  - save action,
  - active errors/recovery states.
- Make lower-frequency controls less dominant when inactive:
  - incident quick templates,
  - image paste/upload guidance,
  - optional context attachment.
- Preserve visibility when active:
  - staged images,
  - failed staged-image upload recovery,
  - partial context validation warning,
  - create error state.
- Compare with edit form so create/edit/upload/link workflows still feel consistent.
- Capture Notes desktop/mobile screenshots before broad PR gates.

## Out Of Scope

- No note API, payload, schema, RLS, generated type, storage, authz, service-role, or cache change.
- No change to note IDs, category semantics, priority values, status behavior, done/archive behavior, context type/ref values, related-note identity, attachment format/limit, or incident severity meaning.
- No change to dashboard Quick note save behavior.
- No admin shell/nav redesign.
- No floating/sticky Notes quick-access control; that is tracked separately in `docs/task-briefs/planned/2026-06-19-admin-notes-floating-quick-access-10-10.md`.
- No new dependency or local Codex config change.
- No performance-budget threshold change.
- Do not touch `Ja.docx`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for this child: Product goals and IA, UX flow clarity, Visual design quality, Business logic correctness and data integrity, Admin editor ergonomics, Accessibility (a11y), Reliability and failure handling, Security and authz, Privacy and compliance, Admin workflow and editability, Incident response and support operations, i18n operational readiness, Stack-fit and dependency discipline, Testing and QA automation, DevOps and rollback readiness.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                             | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Notes create surface separates routine note capture from support/incident/context helpers without changing the Notes workspace job.                            | before/after or after/reference screenshots | `5/5`                   |
| UX flow clarity                               | `target`     | Routine create path is immediately scannable; incident templates, image staging, and context attachment remain obvious when needed or active.                  | screenshots + targeted tests                | `5/5`                   |
| Visual design quality                         | `target`     | Notes desktop/mobile create panel shows no text overlap, clipped labels, arbitrary button widths, or inactive helper wall dominating the form.                 | screenshot handoff                          | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Notes create payload, staged-image upload, recovery, context validation, done state, edit/upload/link/delete behavior remain unchanged.                        | targeted unit/e2e tests + diff review       | `5/5`                   |
| Admin editor ergonomics                       | `target`     | High-frequency note creation gets fewer default scan obstacles while low-frequency tools remain reachable.                                                     | workflow review + screenshots               | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Any disclosure/control change preserves labels, roles, focus, keyboard access, visible validation, and touch targets.                                          | Testing Library + screenshot/a11y review    | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no new dependency, image asset, API call, or heavy client state; disclosure state is local-only if used.                                      | package/diff review                         | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical notes and local create/staged-image draft state stay distinct and documented.                                                                 | diff review + contract notes                | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: existing Notes fetch/refresh/no-store behavior and mutation refresh semantics remain unchanged.                                               | route/component diff review                 | `4/5`                   |
| Reliability and failure handling              | `target`     | Loading, schema warning, load retry, create errors, staged-image recovery, upload retry, and context validation remain deterministic and visible.              | unit/e2e tests                              | `5/5`                   |
| Security and authz                            | `target`     | No admin/authz broadening and no new route/API/storage behavior.                                                                                               | changed-files review + existing guard tests | `5/5`                   |
| Privacy and compliance                        | `target`     | Screenshots and UI expose no private user/payment/provider/raw analytics data; staged images remain admin-only/local until upload.                             | screenshot/privacy review                   | `5/5`                   |
| Content governance                            | `target`     | Incident template guidance and context attachment meaning remain accurate or are mapped to Help/Guide if visible copy changes.                                 | Help/Guide impact review                    | `5/5`                   |
| Admin workflow and editability                | `target`     | Create, edit, upload, related-note link, done/archive, and delete workflows remain available and tested.                                                       | Notes workflow tests + screenshots          | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A with scope rationale: authenticated private admin UI only; no public metadata, sitemap, robots, canonical, or crawlable route changes.                     | private-admin scope review                  | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A with scope rationale: no public AI-facing content, structured data, entity page, or crawl-safe semantic contract changes.                                  | private-admin scope review                  | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event, KPI, dashboard, taxonomy, or telemetry payload change.                                                                    | no-analytics-diff review                    | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A with scope rationale: no product, checkout, Stripe, entitlement, pricing, revenue, refund, invoice, payout, or commerce behavior changes.                  | explicit commerce scope review              | `N/A`                   |
| Incident response and support operations      | `target`     | Incident templates remain available and clear; support recovery states are not hidden when active.                                                             | Help/Guide/runbook impact review + tests    | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: no billing provider data, finance reports, payouts, refunds, invoices, reconciliation, entitlement grants, or revenue truth changes. | explicit finance scope review               | `N/A`                   |
| i18n operational readiness                    | `target`     | Short labels/disclosure summaries and responsive layouts tolerate longer localized text without clipping.                                                      | desktop/mobile screenshots                  | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `AdminNotesManager`, existing Notes helpers, Freeswimming tokens, native disclosure if useful, and current tests; no dependency.                         | diff/package review                         | `5/5`                   |
| Testing and QA automation                     | `target`     | Targeted Notes tests cover create payload, staged images, recovery, context validation, disclosure labels, and unchanged edit/link behavior.                   | Vitest/e2e + gates                          | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: pattern should scale to future Notes helpers without adding new queries or one-off UI systems.                                                | future-value review                         | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Small reversible UI/test/docs diff with no schema/API/package/workflow dependency and screenshot approval before broad gates.                                  | git diff + gates + PR evidence              | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `components/admin/AdminNotesManager.tsx`;
  - preserve `/admin?tab=notes` URL behavior and client component boundary;
  - do not add route handlers, server actions, API calls, or global state.
- TypeScript/domain:
  - preserve `AdminNoteItem`, priority values, context types, attachment limit constants, incident severity labels, and related-note IDs.
- Supabase/data:
  - no migrations, RLS, generated DB types, storage policy, or service-role changes.
- External services:
  - no Stripe, email, analytics provider, Vercel, or GitHub workflow changes.
- UI system:
  - reference surface: reuse existing `AdminNotesManager` create/edit form surface, with the edit form as the parity reference for upload/context/related-note controls;
  - shared component contract: keep existing `AdminNoteClipboardPasteButton`, `fs-library-card`, `fs-cta-*`, field classes, nested panel pattern, status states, and native controls where possible.
  - screenshot handoff comparison type should be `before/after` if baseline recapture is practical; otherwise `after/reference` with current Notes and edit-form references.
- Testing:
  - update `tests/unit/admin-notes-manager-state.test.tsx` and `tests/e2e/admin-notes-workflow.spec.ts` only as needed by changed labels/structure.
  - run screenshot handoff before `npm run verify:pre-pr`.

## Data Placement And Sync Contract

- Server-canonical data: admin notes, statuses, categories, priorities, context refs, attachments, and related-note links.
- Local data: create/edit form drafts, filters/search, staged create images and preview URLs, active disclosure state, pending action IDs.
- Sync policy: unchanged; create/save/upload/link/delete/done operations wait for server confirmation and update UI from server response.
- Retention and sensitivity: staged create images remain local until upload succeeds; screenshots must use sanitized mock or non-sensitive data.
- Cache/invalidation: unchanged admin Notes fetch and refresh behavior.

## Identity And Rename Contract

- Canonical stable IDs: note IDs, attachment IDs, related-note IDs, context refs, and admin tab query value `notes`.
- Human-readable identifiers: note titles/categories can be edited as today; UI labels may be shortened but must not redefine priority, incident severity, or context meaning.
- Mutability rules: related notes are linked by stable ID; attachment identity and file evidence remain server-owned after upload.
- Rename vs repurpose: new incident severity, context type, attachment state, or relationship meaning requires new mapping/tests.
- Compatibility contract: existing Notes URLs, filters, context refs, and support workflows remain valid.
- Observability and repair: partial context and staged-image upload recovery states remain visible and tested.

## Forward Compatibility Contract

- Extensibility surfaces: Notes categories, priorities, context types/refs, incident severities, attachment formats/limits, recovery states, related-note relationships, locales.
- Source of truth: existing Notes API contracts, Notes helper constants, context catalog, and `ADMIN_TAB_VALUES`.
- Additive behavior: future routine fields should enter the visible create path only when high-frequency; future support helpers should use the same secondary/progressive pattern.
- Explicit mapping requirements: new incident severities, destructive actions, upload failure modes, support procedures, or context types require Help/Guide/runbook mapping and tests.
- Unknown or deprecated values: use safe fallback labels or block until mapped; do not silently treat unknown support values as current procedure.
- Test/evidence: future-value fixture or explicit unknown-value rationale if new values are introduced; otherwise unchanged contract evidence and route/label/support sweep.

## Help / Guide Impact

Expected `N/A` if implementation only changes placement/disclosure while preserving visible action meaning and recovery guidance. Required if incident template copy, upload recovery wording, context attachment labels, or support procedure meaning changes.

Current implementation impact: `N/A` for Help/Guide runtime copy because the shipped action labels and recovery meanings are preserved. Incident, image, context, upload, retry, save, related-note, and context-validation semantics are unchanged; only default placement/disclosure changed.

## Route / Label / Support Surface Sweep

Run before broad gates:

- `Create note`
- `Incident quick templates`
- `Use P1 template`
- `Use P2 template`
- `Use P3 template`
- `Image (optional)`
- `Paste image from clipboard`
- `Upload images`
- `Retry upload`
- `Attach to (optional)`
- `Selected target`
- `Set both context type and context ref`
- `Save note`
- `Related notes`
- `Help/Guide`
- `/admin?tab=notes`

Check at minimum `app/`, `components/`, `lib/`, `tests/`, `docs/`, `docs/runbooks/`, `docs/checklists/`, and active/planned/done task briefs.

Execution evidence: searched the required labels across `app/`, `components/`, `lib/`, `tests/`, `docs/`, `docs/runbooks/`, `docs/checklists/`, and task briefs. Fallout handled in this slice: `AdminNotesManager` create-panel disclosure structure, targeted unit/e2e selectors, active child brief, and parent pointer. No Help/Guide or runbook update is required because visible action meaning and recovery procedure did not change.

## Screenshot Handoff Plan

- Use `docs/runbooks/ui-debug-hypothesis-and-handoff.md`.
- Capture against local `http://127.0.0.1:3000` with `SITE_LOCK_ENABLED=0`.
- If `/dev/login` or Supabase egress blocks screenshot-only capture, use the documented temporary local visual-harness fallback and remove it before validation/PR diff.
- Artifact folder: `output/admin-notes-create-form-density-YYYY-MM-DD-HHMMSS`.
- Required screenshots:
  - Notes create panel desktop.
  - Notes create panel mobile.
  - Active staged-image state.
  - Edit form reference for upload/related-note parity.
- Handoff must state `before/after` or `after/reference` explicitly and wait for owner approval before `npm run verify:pre-pr`.

## Acceptance Criteria

1. Routine create fields and save action are easier to scan on desktop and mobile.
2. Incident templates remain reachable without dominating the default create form.
3. Image paste/upload controls remain reachable, and staged-image/retry recovery remains prominent when active.
4. Optional context attachment remains explicit and validation warning behavior is unchanged.
5. Existing create/edit/upload/link/done/archive/delete behavior and payloads are unchanged.
6. Relevant Notes tests are updated and pass.
7. Screenshot handoff is owner-approved before `npm run verify:pre-pr`.
8. Changed briefs pass `npm run lint:briefs`.

## Validation

- `npm run lint:briefs`
- targeted Notes unit tests, expected starting point:
  - `./node_modules/.bin/vitest run tests/unit/admin-notes-manager-state.test.tsx tests/unit/admin-notes-manager-related-links.test.tsx`
- targeted Notes e2e only when local admin/dev-login allows:
  - `npx playwright test tests/e2e/admin-notes-workflow.spec.ts --project=desktop-chromium`
- route/label/support sweep for Notes labels and Help/Guide impact
- screenshot handoff
- after owner screenshot approval: `npm run verify:pre-pr`
- PR CI
- before merge recommendation: `npm run verify:pre-merge`

## Checkpoint Log

- `2026-06-19 | planned | created as the selected next child from the combined admin readability score refresh and Notes pre-execution audit; no runtime implementation has started | next: owner decides whether to execute this child`
- `2026-06-19 | in-progress | owner approved recommended sequence: run create-form density first and keep floating Notes quick access as a separate planned child; branch feat/admin-notes-create-form-density created from main@0fe229f4 | next: implement create-panel progressive reveal without API/data/status/nav changes`
- `2026-06-19 | screenshot-review | implemented create-panel progressive reveal: routine fields, mark-done, and save stay in the primary path, while incident templates, image tools, and optional context attach are compact disclosure sections that auto-open when staged images, upload recovery, or partial context validation are active; validation passed: targeted Vitest for admin notes manager state + related links, targeted ESLint, npm run typecheck, route/label/support sweep, and git diff --check; targeted desktop Chromium e2e command completed with 3 tests skipped because local dev-login/Supabase returned HTML instead of JSON; screenshot artifacts captured at output/admin-notes-create-form-density-2026-06-19-191713 using a temporary local visual harness, then the harness/script were removed before final diff | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-06-19 | pre-pr-pass | owner approved screenshot handoff; npm run verify:pre-pr passed full public lane on branch feat/admin-notes-create-form-density: quality gates, lint, typecheck, 249 unit files / 1636 tests, build, performance budgets, and Playwright e2e 111 passed / 567 skipped with skips tied to the local dev-login/Supabase guard matrix; perf-budget trend recommended tighten after consecutive green runs, decision: hold inside this non-performance Notes UI slice and carry the tighten prompt to the existing planned performance-ratchet queue | next: commit, push, open PR, monitor CI, then run npm run verify:pre-merge before merge`
