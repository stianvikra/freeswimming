# Task Brief: Admin Shell Mobile Discoverability And Quick Note Context

## Metadata

- `id`: `2026-06-18-admin-shell-mobile-discoverability-and-quick-note-context-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-18`
- `updated`: `2026-06-18`
- `execution_mode`: `plan only until owner explicitly approves implementation`
- `parent`: `docs/task-briefs/planned/2026-06-18-admin-notes-residual-disposition-intake-10-10.md`

## Brief Audit Record

- `last_audited`: `2026-06-18`
- `base`: `main@a0a63d58`
- `audit_status`: `draft-for-owner-audit`
- `decision`: Keep this as the recommended next bounded admin implementation candidate, but re-audit before moving it to `in-progress` or creating a branch.
- `reason`: Post-merge re-audit shows mobile admin navigation exposes only about `3/11` tabs in first viewport, and open notes `a4677939` and `89eacfbc` point to admin shell/header and Quick note context clarity.
- `must_refresh_before_execution_if`: Refresh if `AdminWorkspace`, `app/admin/layout.tsx`, `AdminNoteQuickCaptureLauncher`, admin tab metadata, Help/Guide quick actions, screenshot rules, or active admin-note source IDs change.

## Goal

Make the admin shell easier to understand and navigate on mobile by exposing all admin tabs through a clear mobile switcher, reducing first-screen header noise, and clarifying Quick note locked-context behavior without changing admin data behavior.

## Pre-Implementation Owner Explanation

Vi gjør admin-starten på mobil lettere å bruke. Admin skal ikke kreve at du husker at flere menyer ligger skjult bortover i en scroll-rad; alle seksjoner skal være tydelige, og Quick note skal forklare når et utkast fortsatt lagres mot en annen side.

Hvorfor det betyr noe: Admin brukes på tvers av innhold, meldinger, notes, analytics og drift. Hvis menyen skjuler mesteparten av admin på mobil, føles dashboardet halvferdig selv om enkeltflater er forbedret.

Utenfor scope: desktop-rail, ny IA-gruppering, Content mirror/status dropdown, unread message count, lesson pass-criteria scoring, Auth Admin, database/API/schema-endringer og merge.

Fremoverkompatibilitet: nye admin-tabs skal automatisk være tilgjengelige i mobilvelgeren fra samme kanoniske tab metadata. Ukjente `tab`-verdier skal fortsatt falle trygt tilbake gjennom eksisterende parser.

## Source Notes Covered

| Note ID                                | Covered Scope                                                                           | Explicit Boundary                                                                                                                     |
| -------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `a4677939-8f6a-44ce-b585-490f65b07793` | Admin header/first-screen shell clarity and mobile admin tab discoverability.           | Content mirror snapshot and status action dropdown are owned by `2026-06-18-admin-content-mirror-and-status-action-density-10-10.md`. |
| `89eacfbc-3b70-4920-a505-21301816b7e6` | Quick note context-warning copy/affordance so stale locked context does not feel stuck. | No note persistence, route, schema, or draft-store semantic change unless explicitly proven safe.                                     |

## Pre-Execution Audit Gate

Before implementation starts:

1. Reopen this brief, the residual intake, `AdminWorkspace`, `app/admin/layout.tsx`, and `AdminNoteQuickCaptureLauncher`.
2. Refresh the live status of source notes `a4677939` and `89eacfbc`; do not assume they were closed.
3. Re-capture or inspect current mobile admin shell evidence so the slice targets the current UI, not stale screenshots.
4. Confirm Help/Guide impact for any visible nav or Quick note copy change.
5. Run `npm run lint:briefs:all` and get owner approval before moving this brief to `in-progress`.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for this child: Product goals and IA, UX flow clarity, Visual design quality, Admin editor ergonomics, Accessibility (a11y), Business logic correctness and data integrity, Reliability and failure handling, Security and authz, Privacy and compliance, Admin workflow and editability, Incident response and support operations, i18n operational readiness, Stack-fit and dependency discipline, Testing and QA automation, DevOps and rollback readiness.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                               | Evidence                                     | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Mobile shell exposes all active admin tabs without relying on horizontal-scroll memory.                                                          | mobile screenshots + tab coverage test       | `5/5`                   |
| UX flow clarity                               | `target`     | Admin can identify current tab, switch tabs, and understand Quick note locked context within first mobile viewport.                              | screenshots + unit/e2e assertions            | `5/5`                   |
| Visual design quality                         | `target`     | Mobile header/tab switcher has no clipped text, overlap, or competing control wall.                                                              | before/after screenshot handoff              | `5/5`                   |
| Business logic correctness and data integrity | `target`     | URL-driven `?tab=` state, Quick note draft context, and note save behavior remain unchanged.                                                     | unit tests + diff review                     | `5/5`                   |
| Admin editor ergonomics                       | `target`     | High-frequency admin navigation requires fewer scan guesses on mobile.                                                                           | workflow review + screenshots                | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Switcher/buttons preserve keyboard focus, names, roles, active state, and 44px-class touch targets.                                              | Testing Library + Playwright/a11y spot check | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no dependency or data fetch should be added.                                                                                    | package/diff review                          | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Admin active tab remains URL/search-param state; Quick note draft remains local draft state until save.                                          | diff review + tests                          | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no route cache behavior changes.                                                                                                | changed-files review                         | `4/5`                   |
| Reliability and failure handling              | `target`     | Invalid tabs still fail safe; Quick note stale-context warning remains deterministic.                                                            | parser/unit tests + Quick note tests         | `5/5`                   |
| Security and authz                            | `target`     | No authz broadening; admin shell remains protected and Quick note create remains role-gated.                                                     | changed-files review + existing auth tests   | `5/5`                   |
| Privacy and compliance                        | `target`     | No private note body, user, payment, provider, raw analytics, or env values appear in UI/screenshots.                                            | screenshot/privacy review                    | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: Content workflows are not changed; linked note is split for Content action density.                                             | scope review                                 | `4/5`                   |
| Admin workflow and editability                | `target`     | Existing admin tab workflows stay reachable and easier to discover on mobile.                                                                    | e2e/unit + screenshots                       | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because authenticated private admin shell changes no public metadata, sitemap, robots, canonicals, or crawlable routes.                      | explicit private-admin scope rationale       | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-facing content, structured data, or crawl-safe entity surface changes.                                                  | explicit private-admin scope rationale       | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: Analytics tab remains reachable; no KPI/event changes.                                                                          | no-analytics-diff review                     | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: Commerce tab remains reachable; no pricing, checkout, Stripe, entitlement, or revenue behavior changes.                         | no-commerce-diff review                      | `4/5`                   |
| Incident response and support operations      | `target`     | Mobile admin can reach Messages, Notes, Operations, Users, and Help without hidden-tab guesswork.                                                | screenshot + Help/Guide impact review        | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because no billing provider data, finance reports, payouts, refunds, invoices, reconciliation, entitlement grants, or revenue truth changes. | explicit finance scope rationale             | `N/A`                   |
| i18n operational readiness                    | `target`     | Mobile switcher and header copy tolerate longer labels without clipping or layout collapse.                                                      | responsive screenshots + copy review         | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `AdminWorkspace`, `app/admin/layout.tsx`, existing tab metadata, and `AdminNoteQuickCaptureLauncher`; no dependency.                       | diff/package review                          | `5/5`                   |
| Testing and QA automation                     | `target`     | Add/update shell and Quick note tests; visual handoff before `verify:pre-pr`.                                                                    | test output + screenshots                    | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: tab rendering should remain data-driven from existing metadata.                                                                 | future-tab review                            | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Small reversible UI/copy/test diff with no migration/API dependency.                                                                             | git diff + gates                             | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js: reuse `AdminWorkspace` and `app/admin/layout.tsx`; preserve `/admin?tab=` behavior and client manager boundaries.
- TypeScript/domain: `AdminTab` and tab metadata are canonical; unknown tab parsing remains fail-safe.
- Supabase/data: no schema, RLS, generated type, API, or service-role change.
- UI system: use existing `fs-*` tokens, lucide icons, compact controls, and accessible form/navigation primitives.
- Testing: update `admin-workspace-shell`, Quick note unit tests, and relevant admin e2e/a11y coverage; screenshot handoff is required.

## Data Placement And Sync Contract

- Server-canonical data: unchanged admin data and notes.
- Local data: active tab stays in URL search params; Quick note draft remains local until saved.
- Sync policy: unchanged.
- Retention/sensitivity: no new sensitive data in UI/screenshots/logs.
- Cache/invalidation: unchanged private admin route behavior.

## Identity And Rename Contract

- Canonical IDs: `ADMIN_TAB_VALUES`, `AdminTab`, and note IDs.
- Human-readable labels: tab labels may be presented differently but must keep meaning and tests.
- Mutability rules: no route/query value rename.
- Rename vs repurpose: no tab repurpose; new tab values require metadata/tests.
- Compatibility: existing `/admin?tab=<value>` links remain valid.
- Observability and repair: unknown tab values fall back safely.

## Forward Compatibility Contract

- Extensibility surfaces: admin tabs, tab labels, mobile switcher labels, Quick note warning copy, locales.
- Source of truth: tab switcher derives from existing tab metadata.
- Additive behavior: future tabs appear in mobile switcher through the same list.
- Explicit mapping requirements: new high-risk tabs/actions need Help/Guide and screenshot coverage.
- Unknown/deprecated values: parser fallback remains safe.
- Test/evidence: future tab contract test and mobile screenshot.

## Scope

- `components/admin/AdminWorkspace.tsx`
- `app/admin/layout.tsx`
- `components/admin/AdminNoteQuickCaptureLauncher.tsx`
- targeted tests and Help/Guide assertions only if copy changes require them
- screenshot artifacts for mobile admin shell and representative tabs

## Out Of Scope

- Desktop nav redesign.
- Content mirror/status action dropdown.
- New message count badge.
- Lesson scoring or public lesson tab changes.
- API/database/authz changes.
- Merge without owner approval.

## Acceptance Criteria

1. Mobile first viewport makes all 11 active admin tabs discoverable.
2. Header copy/actions are calmer on mobile and do not hide the work surface.
3. Quick note locked-context warning is clear and does not imply the draft is stuck.
4. URL tab state and Quick note save behavior are unchanged.
5. Screenshot handoff is owner-approved before `npm run verify:pre-pr`.

## Validation

- `npm run lint:briefs`
- targeted unit/component tests
- targeted Playwright/admin shell screenshot capture
- after screenshot approval: `npm run verify:pre-pr`, CI, `npm run verify:pre-merge`

## Help / Guide Impact

Required if visible admin navigation labels, Quick note warning copy, or recovery guidance changes. Otherwise record explicit no-impact evidence in the child closeout.

## Checkpoint Log

- `2026-06-18 | planned | created from residual admin-note intake and post-merge re-audit: mobile admin tabs expose only about 3/11 tabs, with Quick note locked-context copy also captured | next: pre-execution audit and owner approval before branch`
