# Task Brief: Admin Lesson Editor Less-Is-More Readability

## Metadata

- `id`: `2026-06-18-admin-lesson-editor-less-is-more-readability-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-18`
- `updated`: `2026-06-18`
- `parent`: `docs/task-briefs/in-progress/2026-06-18-admin-full-dashboard-ui-ux-audit-and-gap-list-10-10.md`
- `execution_mode`: `owner approved implementation on 2026-06-18`

## Brief Audit Record

- `last_audited`: `2026-06-18`
- `base`: `current branch admin-audit-coverage-users-readability-drift on main@a1d2cf17`
- `audit_status`: `ready`
- `decision`: Owner approved this as the first full-dashboard UI/UX implementation child.
- `reason`: Full admin audit found lesson editing is the biggest blocker to a whole-dashboard 10/10 readability claim: `6465px` desktop and `9458px` mobile, with too much explanatory text inside the high-frequency edit form.
- `must_refresh_before_execution_if`: Refresh if `AdminContentManager`, `AdminHelpCenter`, lesson public-field tests, lesson body contract, course workspace tests, screenshot rules, scorecard categories, or the full-dashboard audit findings change before implementation.

## Goal

Make Admin lesson editing 10/10 easier to read, understand, and act on by reducing inline explanatory text, improving grouping/action hierarchy, and preserving all existing lesson data behavior.

## Pre-Implementation Owner Explanation

Vi skal gjore lesson-editoren enklere aa bruke. Den skal fortsatt ha alle trygge felter og handlinger, men mindre forklarende tekst inne i selve skjemaet. Det som er hjelpestoff skal heller ligge i Help/Guide eller bak tydelig progressive disclosure.

Hvorfor det betyr noe: Leksjoner er en av de viktigste admin-arbeidsflatene. Hvis editoren er for lang og teksttung, tar det lenger tid aa gjore riktige endringer, og risikoen for aa overse viktige felt oker.

Utenfor scope: ingen endring av lesson-data, publiseringslogikk, revisjoner, Supabase, API-er, nye felt, nye roller, brukeropprettelse, checkout, analytics, bred admin-nav-redesign eller Help/Guide totalredesign.

Forward compatibility: nye lesson-felter og seksjoner skal kunne legges til gjennom eksisterende lesson body/visibility-kontrakter og arve samme kompakte editorstruktur. Nye safety-critical forklaringer maa enten bli korte inline-labels eller eksplisitt mapped til Help/Guide med tester.

## Scope

- Simplify visible copy inside Admin lesson edit form.
- Keep labels/action names clear enough that less helper text is needed.
- Reduce repeated section explanations and fallback/scope prose.
- Improve grouping around:
  - public lesson mirror,
  - lesson container/layout,
  - video/estimated time,
  - video planning notes,
  - lesson sections,
  - admin/list fallback,
  - technical fallback,
  - admin notes,
  - QR links,
  - save/view/cancel actions.
- Update Help/Guide and tests only where visible wording/structure changes require it.
- Capture before/after screenshots for lesson edit desktop and mobile.

## Out Of Scope

- No database/API/schema/RLS/generated-type changes.
- No change to saved lesson body shape, status workflow, revision history, preview URLs, QR logic, admin notes, authz, or cache behavior.
- No broad Content manager redesign beyond lesson editor surfaces that must move with the same form.
- No full Help/Guide redesign; only targeted Help copy adjustments required by moved/removed lesson-editor explanations.
- No mobile admin navigation redesign.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for this child: Product goals and IA, UX flow clarity, Visual design quality, Business logic correctness and data integrity, Admin editor ergonomics, Accessibility (a11y), Reliability and failure handling, Security and authz, Privacy and compliance, Content governance, Admin workflow and editability, Incident response and support operations, i18n operational readiness, Stack-fit and dependency discipline, Testing and QA automation, DevOps and rollback readiness.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                         | Evidence                                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Lesson edit flow keeps the same job structure while reducing scan cost and preserving clear route from lesson row to edit/save/view.                       | before/after screenshots + component/test review          | `5/5`                   |
| UX flow clarity                               | `target`     | Inline explanatory text is shortened or moved; primary next actions are obvious without reading long paragraphs.                                           | copy diff + screenshots + tests                           | `5/5`                   |
| Visual design quality                         | `target`     | Lesson edit desktop/mobile screenshots show reduced height, stable spacing, no overlap, no clipped text, and cleaner grouping.                             | before/after screenshot handoff                           | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Existing lesson save payload, section visibility, immutable runtime IDs, preview link, revisions, notes, and QR behavior are unchanged.                    | targeted unit/e2e tests + diff review                     | `5/5`                   |
| Admin editor ergonomics                       | `target`     | High-frequency lesson editing is faster to scan, with save/view/cancel actions easy to find and advanced/fallback content not dominating routine edits.    | workflow review + screenshots                             | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Labels, controls, focus order, status messages, section headings, and touch targets remain accessible after copy/layout changes.                           | Testing Library + Playwright/a11y spot check              | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | No new dependency or heavy client UI; any layout change reuses existing components/tokens.                                                                 | package/diff review                                       | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical lesson data and local form draft boundaries remain unchanged.                                                                             | scope/diff review                                         | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Existing admin no-store/fetch/reload behavior remains unchanged.                                                                                           | diff review + tests                                       | `5/5`                   |
| Reliability and failure handling              | `target`     | Existing unsaved, save error, retry/reload, and dirty-state behavior remains visible and test-covered.                                                     | targeted tests                                            | `5/5`                   |
| Security and authz                            | `target`     | No authz broadening; admin-only/edit role behavior remains unchanged and fail-closed.                                                                      | diff review + existing negative-path tests where relevant | `5/5`                   |
| Privacy and compliance                        | `target`     | No private training/user/payment/raw analytics/provider data is added to lesson editor or screenshots.                                                     | screenshot/privacy review                                 | `5/5`                   |
| Content governance                            | `target`     | Public lesson mirror, admin-only notes, fallback content, technical fallback, preview, and revision semantics remain clear after copy reduction.           | Help/Guide/tests + screenshot review                      | `5/5`                   |
| Admin workflow and editability                | `target`     | Lesson fields remain editable with less friction; destructive or high-risk actions remain separated and clear.                                             | e2e/unit coverage + screenshot review                     | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because authenticated/private admin editor changes do not change public metadata, sitemap, robots, canonicals, or crawlable routes.                    | explicit private-admin scope rationale                    | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this child changes no public AI-facing content, structured data, or crawlable entity surface.                                                  | explicit private-admin scope rationale                    | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this child changes no events, KPI labels, analytics persistence, dashboard logic, or telemetry payloads.                                       | explicit analytics scope rationale                        | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this child changes no products, checkout, Stripe, entitlements, pricing, revenue, refunds, invoices, or commerce admin behavior.               | explicit commerce scope rationale                         | `N/A`                   |
| Incident response and support operations      | `target`     | Any moved/removed lesson-editor guidance remains recoverable in Help/Guide or runbooks, and support-facing lesson edit semantics stay clear.               | Help/Guide impact review + sweep                          | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this child changes no billing provider data, finance reports, payouts, refunds, invoices, reconciliation, entitlement grant, or revenue truth. | explicit finance scope rationale                          | `N/A`                   |
| i18n operational readiness                    | `target`     | Shorter labels/copy reduce future locale clipping risk; no fixed-width English-only assumptions added.                                                     | responsive screenshots + copy review                      | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing AdminContentManager structure and Freeswimming tokens; no new dependency or local Codex config.                                             | diff/package review                                       | `5/5`                   |
| Testing and QA automation                     | `target`     | Update relevant unit/e2e/help assertions; run targeted tests and required gates after screenshot approval.                                                 | test logs + `verify:pre-pr`                               | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Reusable lesson editor grouping avoids one-off future section clutter.                                                                                     | implementation review                                     | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Small reversible UI/copy diff with no schema/API dependency; screenshot approval before PR.                                                                | git diff + validation gates                               | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `AdminContentManager` and existing lesson editor helpers;
  - preserve `/admin?tab=content` URL behavior and client manager boundary;
  - no new route, server action, API route, or cache behavior.
- TypeScript/domain:
  - preserve `AdminContentItemRow`, lesson body fields, section visibility, immutable runtime IDs, and status values.
- Supabase/data:
  - no migrations, RLS, generated DB types, or service-role behavior.
- UI system:
  - use existing `fs-library-card`, `fs-cta-*`, `ui-field`, status chips, and lesson section primitives;
  - avoid new components unless they remove real repeated structure.
- Testing:
  - update `admin-content-manager-state`, `admin-foundation`, `admin-help-center`, and parity tests only as needed by changed copy/structure.

## Data Placement And Sync Contract

- Server-canonical data: lesson content rows, body JSON, status, revisions, QR rows, and admin notes remain server-owned.
- Local-only state: open edit form, draft fields, dirty state, section open/collapsed UI if introduced, pending save state.
- Sync policy: unchanged; saving still uses existing admin content update route and refresh behavior.
- Retention/sensitivity: no new sensitive data appears in UI, logs, screenshots, or Help/Guide.
- Cache/invalidation: unchanged admin no-store route behavior.

## Identity And Rename Contract

- Canonical IDs: lesson row IDs, module IDs, lesson runtime IDs, slugs, QR slugs, note IDs, and tab values remain unchanged.
- Human-readable labels: copy may be shortened, but semantic action labels like `Save changes`, `View changes`, `Cancel`, and public visibility labels must preserve meaning unless tests/docs are updated.
- Rename vs repurpose: no persisted entity is renamed or repurposed.
- Compatibility: existing lesson preview/admin links remain unchanged.

## Forward Compatibility Contract

- Extensibility surfaces: lesson sections, visibility labels, fallback fields, video planning, support card, QR links, notes, locales, and future lesson media fields.
- Source of truth: existing lesson body and admin content contracts remain canonical.
- Additive behavior: future lesson fields should enter the compact grouping pattern, not add new long explanatory blocks by default.
- Explicit mapping requirements: any new safety-critical lesson guidance, public/private visibility mode, fallback identity field, or media field requires Help/Guide mapping and tests.
- Unknown/deprecated values: preserve existing fallback rendering and do not hide unknown technical data without a compatibility decision.

## Help / Guide Impact

Required. If explanatory lesson-editor text is removed from the edit form, Help/Guide must keep the essential operational guidance in shorter, scannable form. Existing Help/Guide assertions must be updated to match the new copy contract.

## Route / Label / Support Surface Sweep

Before broad gates, sweep at minimum:

- `Public lesson mirror`
- `Video planning notes`
- `Lesson experience layout`
- `Admin/list fallback`
- `Technical fallback`
- `Shown`
- `Hidden`
- `View changes`
- `Save changes`
- `Edit lesson`
- `Help/Guide`
- `/admin?tab=content`

Check `components/`, `tests/`, `docs/`, `docs/runbooks/`, and active/planned/done task briefs.

Pre-PR sweep evidence:

- `identifiers searched`: `Public lesson mirror`, `Video planning notes`, `Lesson experience layout`, `Admin/list fallback`, `Technical fallback`, `Shown`, `Hidden`, `View changes`, `Save changes`, `Edit lesson`, `Help/Guide`, `/admin?tab=content`, `Create content item`, `Show safety note`, `Visual not added yet`, `Cues`, `Mistakes`, and `Ready check`.
- `surfaces checked`: `app/`, `components/`, `tests/`, `docs/`, `docs/runbooks/`, active in-progress task briefs, planned task briefs, done task briefs, admin Help/Guide source, admin Help/Guide e2e/unit assertions, Admin Content unit/e2e coverage, and screenshot handoff artifacts.
- `fallout handled`: Admin lesson editor labels/layout, Admin Help/Guide assertions, Admin Content unit/e2e expectations, course lesson admin/public parity assertions, active brief evidence, and screenshot handoff were updated in this slice. Historical done-brief hits remain as past implementation evidence. No route param, API endpoint, authz boundary, support runbook procedure, public SEO, checkout, finance, analytics payload, or persisted lesson identity fallout was found.

## Acceptance Criteria

1. Lesson edit desktop and mobile are materially easier to scan than baseline screenshots.
2. Inline explanatory text is reduced; required guidance remains available in Help/Guide or clear labels.
3. Existing lesson save payload, preview, visibility, notes, QR, revisions, and fallback semantics are unchanged.
4. Relevant unit/e2e/help assertions are updated.
5. Screenshot handoff includes before/after desktop and mobile lesson edit artifacts and is owner-approved before `npm run verify:pre-pr`.
6. `npm run lint:briefs` passes for changed briefs.

## 10/10 Visual Memory For Follow-Up Audit

Do not claim full visual 10/10 until the refreshed screenshot handoff and audit confirm these points:

- Visual design quality: lesson editor reads as an editable public lesson surface, not just an admin form with better cards.
- Readability: every open field is easy to read at desktop and mobile widths, with no clipped labels or cramped controls.
- Scannability: repeated public sections are grouped by job and can be understood without reading helper paragraphs.
- Whitespace/density: parallel practice blocks share available desktop width, low-value placeholders do not dominate, and textarea width is used well.
- Grouping/IA: `Coach check` separates cues from common mistakes clearly, and `Ready check` keeps completion/support decisions together.
- Public lesson parity: after/reference screenshots compare the admin edit surface against the real public lesson surface before any 10/10 claim.
- Action clarity: `Save changes`, `View changes`, and `Cancel` remain obvious after visual changes, and visibility toggles include enough context.
- Mobile quality: the open all-fields state is still long, so any 10/10 claim must either prove it scans well on mobile or defer a dedicated mobile collapse/sticky-action pass.
- Visual correction gate after owner critique: remove duplicate visible headings/labels, make `Shown` controls visually secondary, keep Dryland practice and Pool drill breaking the same way, let large text fields use available card space on desktop, and prevent mobile/top filters from reading as a second competing control wall.
- Remaining known risks after this pass: Notes/QR remain admin-support surfaces rather than public preview, and sticky save/view actions are not yet implemented.

## Validation Plan

- Targeted Vitest for Admin Content lesson editor and Help/Guide assertions.
- Targeted Playwright/admin foundation coverage for lesson edit flow if local auth/dev-login allows; otherwise use documented harness only for screenshot review and rely on existing e2e where available.
- `git diff --check`
- Screenshot handoff before `npm run verify:pre-pr`.
- After screenshot approval: `npm run verify:pre-pr`, PR, CI, `npm run verify:pre-merge`.

## Checkpoint Log

- `2026-06-18 | planned | created from full-dashboard audit finding rank 1: lesson editing is the clearest blocker to 10/10 readability and owner explicitly prefers less explanatory text | next: owner approves this child before implementation`
- `2026-06-18 | in-progress | owner approved implementation; scope stays on lesson editor less-is-more readability with no data/API behavior changes | next: inspect AdminContentManager editor structure and update the compact UI/copy`
- `2026-06-18 | implementation-checkpoint | shortened lesson editor copy, collapsed support/fallback/notes/QR surfaces by default, and updated Help/Guide/test wording to preserve the same edit semantics with less inline explanation | next: run targeted tests, capture before/after screenshot handoff, then wait for owner visual approval before pre-pr`
- `2026-06-18 | visual-correction | owner rejected first screenshot because whitespace remained and the editor did not compare well enough with the public lesson surface; confirmed root cause was empty header rows plus generic cards, then combined cues/mistakes into a public-like Coach check surface, moved toggles into headings, widened mistake/correction fields, and aligned lesson-editor cards closer to public lesson colors | next: rerun targeted validation and present refreshed screenshot handoff`
- `2026-06-18 | visual-correction-2 | owner asked not to approve the first correction as 10/10; tightened the lesson editor toward a public lesson renderer with editable fields by adding a stronger public mirror frame, replacing large media-deferred blocks with compact status chips, and combining Pass criteria, Next step, and Support card into one public-like Ready check surface | next: run targeted validation and capture refreshed screenshot handoff before pre-pr`
- `2026-06-18 | visual-correction-3 | owner asked for the highest-impact remaining layout changes before another 10/10 assessment; changed Dryland practice and Pool drill to a 50/50 desktop row, moved Common mistakes onto its own full-width Coach check line, added contextual visibility labels such as Cues/Mistakes/Next/Support, and recorded the remaining 10/10 visual memory list for follow-up audit | next: run targeted validation and regenerate screenshot handoff before pre-pr`
- `2026-06-18 | visual-correction-4 | owner rejected the refreshed visual quality on duplicate headings, dominant Shown pills, uneven Dryland/Pool header wrapping, underfilled text areas, mobile quality, and top filter chaos; changed visibility toggles to secondary status controls, hid duplicate visual labels while preserving aria-labels, normalized practice card headers/media rows, shortened practice field labels, gave major textareas a desktop minimum height, made All Content filters grid-based with mobile chip suppression, and hid the Create content form while an existing row is being edited | next: run targeted validation and regenerate screenshot handoff before pre-pr`
- `2026-06-18 | screenshot-approved | owner approved the refreshed before/after screenshot handoff at \`output/admin-lesson-editor-less-is-more-handoff-2026-06-18-105524\`; local targeted evidence passed: \`npm run typecheck\`, targeted Vitest 4 files / 30 tests, \`npm run lint:briefs:all\`, and \`git diff --check\` | next: run \`npm run verify:pre-pr\`, then commit, push, and open/update PR`
- `2026-06-18 | pre-pr-pass | \`npm run verify:pre-pr\` passed full lane locally after screenshot approval: lint/quality gates/typecheck/unit/build/perf/E2E all completed, with E2E 110 passed and 568 skipped in the local auth-limited matrix. Perf-budget trend recommended tightening after 10 green weekly runs; decision for this UI PR is hold, because budget tightening belongs in a separate perf maintenance slice after this admin readability PR merges. | next: remove incidental lint warning, rerun focused validation after the cleanup, then commit, push, and open/update PR`
- `2026-06-18 | final-pre-pr-pass | removed the incidental unused lesson-variant helper, reran focused validation (\`npm run typecheck\`, targeted Vitest, \`npm run lint:briefs:all\`, \`git diff --check\`), then reran \`npm run verify:pre-pr\` full lane successfully with E2E 110 passed / 568 skipped. No production rendering files changed after the approved screenshot capture except the unused-helper cleanup, which does not affect rendered output. | next: commit, push, open/update PR, monitor CI, and run \`npm run verify:pre-merge\` before merge readiness`
- `2026-06-18 | merged | PR #1153 merged as squash commit 003797fe after owner screenshot approval, local verify:pre-pr, green required CI, and local verify:pre-merge; no data/API/schema/auth behavior changed | next: repo-managed docs-only closeout, then post-merge re-audit`

## Completion Record

- `completed`: `2026-06-18`
- `merged_pr`: `#1153`
- `squash_commit`: `003797fe`
- `result`: Closed the lesson editor less-is-more readability child by making the editor closer to the public lesson surface, reducing duplicate visible labels and explanatory copy, quieting visibility controls, aligning dryland/pool practice layout, improving text-area use of available space, and cleaning mobile filter density.
- `validation`: owner-approved screenshot handoff at `output/admin-lesson-editor-less-is-more-handoff-2026-06-18-105524`, targeted unit/type/brief/diff checks, `npm run verify:pre-pr` PASS on commit `41079043`, GitHub required checks PASS for PR `#1153`, and `npm run verify:pre-merge` PASS with marker `artifacts/verify-pre-merge/20260618-093609.json`.
- `10/10 claim`: yes - all critical target categories reached `5/5` for this scoped lesson-editor readability child. Whole-dashboard admin product `10/10` still requires the planned post-merge re-audit.

| Category                                      | Achieved Score | Evidence                                                                                      | Gaps / Notes                                               |
| --------------------------------------------- | -------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | Lesson edit job structure preserved while scan cost was reduced; screenshot handoff approved. | No gap in child scope.                                     |
| UX flow clarity                               | `5/5`          | Duplicate labels/helper copy reduced; section controls made contextual.                       | No gap in child scope.                                     |
| Visual design quality                         | `5/5`          | Before/after desktop and mobile screenshots approved after owner visual corrections.          | Post-merge audit still checks whole-dashboard consistency. |
| Business logic correctness and data integrity | `5/5`          | Lesson body/save/preview/visibility/notes/QR/revision behavior unchanged; tests passed.       | No gap.                                                    |
| Admin editor ergonomics                       | `5/5`          | Practice, Coach check, Ready check, filters, and edit/create surfaces became easier to scan.  | Sticky save/view actions remain out of scope.              |
| Accessibility (a11y)                          | `5/5`          | Visible duplicate labels removed while aria labels were preserved; broad gates passed.        | No gap in child scope.                                     |
| Data placement and sync boundaries            | `5/5`          | Server-canonical lesson data and local draft boundaries unchanged.                            | No gap.                                                    |
| Caching and invalidation strategy             | `5/5`          | Existing admin fetch/save/refresh behavior unchanged.                                         | No gap.                                                    |
| Reliability and failure handling              | `5/5`          | Save/error/dirty-state behavior preserved by unchanged data flow and tests.                   | No gap.                                                    |
| Security and authz                            | `5/5`          | No authz broadening, no new API route, no schema/RLS/Auth Admin change.                       | No gap.                                                    |
| Privacy and compliance                        | `5/5`          | No private user/payment/provider/raw analytics data added to editor or screenshots.           | No gap.                                                    |
| Content governance                            | `5/5`          | Public mirror, visibility, safety note, fallback, notes, and QR semantics preserved.          | Notes/QR remain support surfaces by design.                |
| Admin workflow and editability                | `5/5`          | Existing edit/save/view/cancel behavior kept with less visual friction.                       | No gap in child scope.                                     |
| Incident response and support operations      | `5/5`          | Essential removed inline guidance remains recoverable through Help/Guide/test coverage.       | Broader Help/Guide redesign remains a future child.        |
| i18n operational readiness                    | `5/5`          | Shorter labels and stable desktop/mobile layout reduce clipping risk.                         | Future locales still need normal screenshot QA.            |
| Stack-fit and dependency discipline           | `5/5`          | Existing `AdminContentManager` and local tokens reused; no dependency added.                  | No gap.                                                    |
| Testing and QA automation                     | `5/5`          | Targeted tests, `npm run verify:pre-pr`, CI, and `npm run verify:pre-merge` passed.           | No gap.                                                    |
| DevOps and rollback readiness                 | `5/5`          | Reversible squash commit `003797fe`; rollback is `git revert 003797fe`.                       | No gap.                                                    |
