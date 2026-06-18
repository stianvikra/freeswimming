# Task Brief: Admin Readability And Design Audit (10/10)

## Metadata

- `id`: `2026-06-18-admin-readability-design-audit-10-10`
- `status`: `planned`
- `owner`: `stianvikra`
- `created`: `2026-06-18`
- `updated`: `2026-06-18`
- `execution_mode`: `plan only until owner explicitly approves a bounded implementation child`

## Brief Audit Record

- `last_audited`: `2026-06-18`
- `base`: `main@a1d2cf17`
- `audit_status`: `ready`
- `decision`: Use this as the next admin planning target before any new admin implementation branch.
- `reason`: The repo is clean against `origin/main` except local untracked `Ja.docx`; PR `#1151` and closeout PR `#1152` are merged; there is no active Habits implementation brief; owner asked to choose between an admin readability/design audit and admin-created users, and the safer next step is audit-first because admin user creation would add sensitive Auth Admin/service-role mutation scope.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, `AdminWorkspace`, `lib/admin/admin-workspace.ts`, admin audit checklist, admin Help/Guide, Users role-management routes, Supabase Auth Admin behavior, screenshot handoff rules, route/label/support sweep rules, verification lanes, or performance-budget defaults change before execution.

## Goal

Produce a current, evidence-backed 10/10 audit of admin readability, design hierarchy, action grouping, support guidance, and workflow risk, then select one bounded implementation child from the findings.

## Pre-Implementation Owner Explanation

Vi starter med aa vurdere admin som arbeidsflate, ikke med aa bygge mer funksjon. Audit-en skal finne hvor admin er tung aa lese, hvor knapper og handlinger konkurrerer, hvor tester og dokumentasjon er utdatert, og hvilke forbedringer som gir mest effekt for en admin som jobber i dashbordet.

Hvorfor det betyr noe: Admin brukes til innhold, brukere, support, drift og publisering. Hvis flaten er rotete eller utydelig, oker risikoen for feil handling, treg support og daarlig kvalitet paa publisert innhold.

Utenfor scope: runtime/UI-endringer, nye admin-roller, brukeroppretting, invitasjoner, databaseendringer, Supabase Auth Admin-mutasjoner, checkout/finance, analytics-taxonomi og merge. Disse krever egne owner-godkjente child briefs.

Fremoverkompatibilitet: nye admin-tabs, statuser, knapper, workflows og supportkoder skal enten arve tydelige admin-primitives, audit-regler og Help/Guide-mapping automatisk, eller kreve eksplisitt mapping, tester og owner-beslutning for ukjente eller risikable verdier.

## Product Decision

Choose admin readability/design audit before admin-created users.

- Admin-created users are deferred because they touch Supabase Auth Admin APIs, service-role secrets, invite/create semantics, email confirmation, profile creation, access grants, audit logging, support recovery, and privacy rules.
- A future user-access child should prefer an invite/approval model over a broad `create user` button unless the owner explicitly approves server-created accounts and the required support/security controls.
- This audit may recommend a later user-invite/access child, but must not implement it.
- The brief must be updated before any audit starts. Both the baseline audit and the post-implementation audit happen only after this brief contains the two-pass audit model, external source baseline, evidence requirements, and closeout gates.

## External Design Source Baseline

Use current primary or authoritative design sources as audit lenses. These sources guide the review; they do not override the existing Freeswimming visual language or repo rules.

| Source                                   | Audit Use                                                                                                                                                                          | Boundary                                                                              |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Apple Human Interface Guidelines         | Simplicity, hierarchy, platform expectation, direct manipulation, predictable controls, and restrained in-product explanation.                                                     | Do not copy Apple visual styling or native-only patterns into the web admin surface.  |
| W3C WCAG 2.2                             | Keyboard, focus order/appearance, labels, names/roles/values, target size, status messages, error prevention, reflow, and contrast.                                                | Treat WCAG as a minimum compliance/testability baseline, not the full UX quality bar. |
| Nielsen Norman Group heuristics          | System status, match to admin mental model, user control, consistency, error prevention, recognition over recall, efficiency, minimalist design, recovery, and help.               | Use as evaluation heuristics; repo-specific workflow evidence decides priority.       |
| IBM Carbon Design System                 | Enterprise/admin forms, top-aligned labels, helper text discipline, progressive disclosure, primary/secondary/destructive action hierarchy, table/form density, and inline errors. | Use principles and patterns, not Carbon components or styling.                        |
| GOV.UK Design System and Service Manual  | Task-first service design, plain language, accessible reusable components, proven form/error/content patterns, and support guidance.                                               | Use as clarity/accessibility benchmark; Freeswimming is not a GOV.UK visual clone.    |
| Atlassian Design System                  | SaaS/admin component taxonomy for buttons, icon buttons, menus, tabs, tables, lozenges/status indicators, empty states, and inline messages.                                       | Use as enterprise workflow reference; avoid adding new dependencies.                  |
| Microsoft Fluent 2 and Material Design 3 | Cross-check navigation density, responsive structure, component state consistency, and interaction affordances.                                                                    | Secondary comparison only; do not broaden scope to a full redesign system.            |

Source URLs reviewed:

- Apple Human Interface Guidelines: `https://developer.apple.com/design/human-interface-guidelines/`
- W3C WCAG 2.2: `https://www.w3.org/TR/WCAG22/`
- Nielsen Norman Group usability heuristics: `https://www.nngroup.com/articles/ten-usability-heuristics/`
- IBM Carbon forms pattern: `https://carbondesignsystem.com/patterns/forms-pattern/`
- GOV.UK Design System: `https://design-system.service.gov.uk/`
- GOV.UK Service Manual design guidance: `https://www.gov.uk/service-manual/design`
- Atlassian Design System buttons/components: `https://atlassian.design/components/button/examples`
- Microsoft Fluent 2: `https://fluent2.microsoft.design/`
- Material Design 3: `https://m3.material.io/`

## Two-Pass Audit Model

The workstream must run two distinct audits, both after this brief is updated.

1. Baseline audit before implementation:
   - capture current admin evidence from code, docs, tests, and screenshots where practical;
   - compare active admin surfaces against the external source baseline and repo-specific scorecard;
   - produce ranked findings and select exactly one bounded implementation child;
   - do not edit runtime/UI code during this audit.
2. Post-implementation audit after the selected child is implemented:
   - rerun the same audit lens on the changed surfaces;
   - compare before/current or after/reference screenshots;
   - verify that no new admin workflow, support, a11y, privacy, or test coverage regression was introduced;
   - assign achieved score per target category before any `10/10` claim.

No implementation child may claim `10/10` without the post-implementation audit. For visual/UI child work, screenshot handoff and owner approval still happen before `npm run verify:pre-pr`.

## Perf-Budget Ratchet Decision

- `npm run test:perf:trend` on `2026-06-18` reported latest public PASS at `76e5a605b271`, `10` consecutive weekly green runs, `17.9%` worst margin, and `recommendation=tighten`.
- Decision: `tighten` is accepted as the next performance-governance direction.
- Scope boundary: this admin audit does not change performance thresholds. The concrete ratchet should be a separate small perf-governance child, with recommended first step `PERF_BUDGET_JS_TRANSFER_KB` default `390kb -> 380kb`, then `npm run test:perf:budgets` and normal gates.

## Codex Skill + Stack Readiness Radar

Capability audit:

| Capability                        | Evidence                                              | Current Status   | Recommended Trigger                                                      | Boundary                                                        |
| --------------------------------- | ----------------------------------------------------- | ---------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `playwright`                      | Session skill metadata                                | `installed`      | Admin visual audit, screenshot capture, keyboard/a11y flow verification. | Does not replace owner screenshot approval for future UI fixes. |
| `imagegen`                        | Session skill metadata                                | `available`      | Only if a later admin visual asset needs generated bitmap imagery.       | Not needed for admin UI audit or token/layout cleanup.          |
| Supabase/Auth Admin docs          | Official docs must be rechecked before auth mutation. | `evaluate later` | Future user invite/create/access child.                                  | No Auth Admin mutation in this audit.                           |
| Stripe plugin skills              | Session plugin metadata                               | `available`      | Future checkout, subscription, entitlement, or finance admin work.       | Not relevant for this audit unless Commerce mutates.            |
| Local skill/plugin config changes | Current session metadata                              | `not needed`     | N/A                                                                      | Do not install or configure local Codex capabilities.           |

Systemic findings:

| Surface                                | Finding                                                                                                                                      | Severity | Recommended Type               | Owner Decision Needed                                                                | Follow-Up Brief Path |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------ | ------------------------------------------------------------------------------------ | -------------------- |
| Admin audit coverage                   | `tests/e2e/admin-console-a11y-audit.spec.ts` audits older tabs and omits active `analytics` and `users`, so current admin coverage is stale. | `high`   | `bounded implementation child` | `no`; update audit coverage in the first implementation child if selected.           | TBD after audit      |
| Admin workspace documentation drift    | `docs/architecture/admin-workspace-module-contracts.md` lists active tabs without `analytics` and `users`, while code has both active.       | `high`   | `safe process/docs update`     | `no`; can be corrected with the audit closeout or first child.                       | TBD after audit      |
| Users admin wording and mutation scope | `AdminWorkspace` still describes Users as read-only, but `AdminUsersManager` now includes audited role management.                           | `medium` | `bounded implementation child` | `yes` only if wording changes imply a new user mutation or invite/create capability. | TBD after audit      |

Return path:

- Previous workstream: PR `#1151` Habits date-first absence review and closeout PR `#1152`.
- Current base: `main@a1d2cf17`.
- No active Habits implementation brief.
- Local untracked `Ja.docx` remains owner/local state and must not be touched.
- Next planning step: run this audit, rank findings, then select exactly one bounded implementation child.

## Current-State Audit Evidence

Code/docs inspected on `main@a1d2cf17`:

| Surface                                                 | Evidence                                                                                                                                 | Audit Finding                                                                                                                                                 |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/admin/AdminWorkspace.tsx`                   | Active admin tabs include `analytics` and `users`; tab labels are icon+text only, with hidden subtitle used as title.                    | Navigation has many peer tabs and no grouping by job type; scanability should be audited on desktop and mobile before adding more actions.                    |
| `lib/admin/admin-workspace.ts`                          | `ADMIN_USERS_WORKSPACE_BOUNDARY` says Users owns role-change confirmation and role mutation boundary.                                    | Users is no longer read-only; UI labels, Help/Guide, audit checklist, and test names must not imply read-only if role mutation remains.                       |
| `components/admin/AdminUsersManager.tsx`                | User detail panel includes role management form, reason select, confirmation checkbox, and admin-only submit.                            | Role mutation is high-risk enough that future create/invite controls must be separated and designed as a support workflow, not added beside filters casually. |
| `tests/e2e/admin-console-a11y-audit.spec.ts`            | `ADMIN_TAB_AUDIT_TARGETS` omits `analytics` and `users`.                                                                                 | Full admin a11y/readability audit evidence is stale for current active tabs.                                                                                  |
| `docs/architecture/admin-workspace-module-contracts.md` | Active module list omits `analytics` and `users`, while typed boundaries include them later.                                             | Admin architecture docs need cleanup before a 10/10 admin design claim.                                                                                       |
| `docs/checklists/admin-full-audit-gate-checklist.md`    | AW-012 checklist covers A1-A7 legacy workflows and does not include Users/Analytics/Operations/Categories as first-class active modules. | The full-admin audit gate is useful but no longer complete for present admin breadth.                                                                         |

## Baseline Audit Results (2026-06-18)

Audit status: baseline audit complete; no runtime/UI implementation is included in this audit result.

Baseline evidence:

- Repo base: `main@a1d2cf17`.
- Code/docs/tests reviewed: `components/admin/AdminWorkspace.tsx`, `components/admin/AdminUsersManager.tsx`, `components/admin/AdminAnalyticsDashboard.tsx`, `lib/admin/admin-workspace.ts`, `lib/admin/users.ts`, `tests/e2e/admin-console-a11y-audit.spec.ts`, `tests/e2e/admin-foundation.spec.ts`, `tests/e2e/admin-users-overview.spec.ts`, `tests/unit/admin-workspace-shell.test.tsx`, `docs/architecture/admin-workspace-module-contracts.md`, `docs/checklists/admin-full-audit-gate-checklist.md`.
- Screenshot artifacts: `output/admin-readability-baseline-2026-06-18-080414/`.
- Screenshot caveat: `/dev/login` was blocked locally by the Supabase cloud egress guard, so screenshots used a temporary local visual harness that mirrored `app/admin/layout.tsx` and rendered `AdminWorkspace` with mocked admin API responses. The harness is audit-only and must not remain in a validation/PR diff.
- External source lens: Apple Human Interface Guidelines, W3C WCAG 2.2, Nielsen Norman Group heuristics, IBM Carbon forms guidance, GOV.UK Design System/Service Manual, Atlassian Design System, Fluent 2, and Material Design 3.

Ranked findings:

| Rank | Surface                       | Finding                                                                                                                                                                                                   | Source Lens                                                                         | Severity | Recommended Type                 | Owner Decision Needed                              |
| ---- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------- | -------------------------------- | -------------------------------------------------- |
| 1    | Active admin coverage         | `tests/e2e/admin-console-a11y-audit.spec.ts` and `tests/e2e/admin-foundation.spec.ts` do not include active `analytics` and `users`, so current a11y/readability coverage is stale for high-risk modules. | WCAG, NN/g consistency, GOV.UK accessible service checks                            | `high`   | `bounded implementation child`   | `no`                                               |
| 2    | Admin docs/checklists         | `docs/architecture/admin-workspace-module-contracts.md` and AW-012 full-audit checklist are behind the active module set. This blocks a defensible 10/10 claim even if UI looks acceptable.               | Carbon governance, GOV.UK service ownership, Atlassian enterprise workflow taxonomy | `high`   | `safe process/docs update`       | `no`                                               |
| 3    | Users wording and action risk | Users navigation still says read-only, while the page contains audited role management. A future create/invite action must not be placed as a casual peer beside filters or refresh.                      | NN/g match/error prevention, Carbon form/action hierarchy, WCAG labels              | `high`   | `bounded implementation child`   | `yes` only for future invite/create semantics      |
| 4    | Navigation/IA density         | 11 peer admin tabs are shown as one flat navigation set. This is readable on desktop but nearing the point where grouping by admin job type is needed before adding more modules.                         | Apple hierarchy, Carbon task grouping, Material/Fluent nav density                  | `medium` | `deferred architecture decision` | `yes` for IA grouping                              |
| 5    | Mobile scan cost              | Mobile layout is usable, but the top admin header, horizontal tab row, Users filters, summary cards, detail panel, and role-management form create a long single-column scan path.                        | WCAG reflow, GOV.UK mobile service design, Carbon progressive disclosure            | `medium` | `bounded implementation child`   | `no` for copy/layout tuning; `yes` for IA grouping |
| 6    | Analytics failure state       | Analytics shows a clear error and retry affordance, but its tab is missing from broad audit coverage and screenshots should become part of future regression evidence.                                    | NN/g system status/recovery, WCAG status messages                                   | `medium` | `bounded implementation child`   | `no`                                               |

Baseline score snapshot:

| Target Category                          | Baseline Score | Reason                                                                                                                                                            |
| ---------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Product goals and IA                     | `4/5`          | Admin goal is clear, but 11 peer tabs and stale docs make future additions fragile.                                                                               |
| UX flow clarity                          | `3/5`          | Users and Analytics flows exist, but coverage drift and mobile scan cost reduce confidence.                                                                       |
| Visual design quality                    | `4/5`          | Visual system is coherent; current risk is density/grouping rather than styling inconsistency.                                                                    |
| Admin editor ergonomics                  | `3/5`          | Role management is appropriately guarded, but the Users area is still described as read-only and the action hierarchy needs tightening before create/invite work. |
| Accessibility (a11y)                     | `3/5`          | Active Users/Analytics modules are missing from the broad e2e a11y audit target list.                                                                             |
| Reliability and failure handling         | `4/5`          | Error/retry states exist, but regression evidence is incomplete for active modules.                                                                               |
| Security and authz                       | `4/5`          | Role mutation is guarded and user creation is deferred; wording must stop implying read-only behavior.                                                            |
| Privacy and compliance                   | `5/5`          | Users surface intentionally excludes raw private training, notes, provider, finance, and analytics payloads.                                                      |
| Admin workflow and editability           | `3/5`          | Workflow breadth has outgrown the docs/test coverage and needs a small drift-correction child first.                                                              |
| Incident response and support operations | `3/5`          | Help/checklist drift can slow support triage for Users/Analytics.                                                                                                 |
| i18n operational readiness               | `4/5`          | Labels are mostly short and stable; grouping/long-label behavior should be rechecked when IA changes.                                                             |
| Stack-fit and dependency discipline      | `4/5`          | Existing components/tokens are suitable; no dependency needed. Docs/tests need to catch up to the typed boundaries.                                               |
| Testing and QA automation                | `3/5`          | Unit coverage knows the active tabs, but e2e/a11y coverage is stale.                                                                                              |
| DevOps and rollback readiness            | `4/5`          | Audit-only path is low risk; future child should be small and reversible.                                                                                         |

Baseline decision:

- Keep admin-created users deferred. Do not add a `create user` button in this workstream.
- Recommended selected child: `admin-audit-coverage-and-users-readability-drift`.
- Child scope should update broad admin a11y/navigation coverage for active `analytics` and `users`, refresh admin module docs/checklists, and correct misleading Users read-only wording/action hierarchy without adding user creation.
- Post-implementation audit remains required after that child before any `10/10` claim.

At most three recommended next improvements:

| Priority | Improvement                                                                              | Classification                   | Rationale                                                                                                                      |
| -------- | ---------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1        | Create the selected child `admin-audit-coverage-and-users-readability-drift`.            | `bounded implementation child`   | Highest leverage and lowest product risk: fixes stale coverage/docs and misleading Users wording before larger UI work.        |
| 2        | Plan an IA grouping child for the 11-tab admin nav only after coverage/docs are current. | `deferred architecture decision` | Grouping may improve scanability, but changes admin mental model and needs owner review plus screenshots.                      |
| 3        | Keep user creation/invite as a separate Auth Admin/access brief.                         | `deferred architecture decision` | Requires service-role/Auth Admin semantics, profile bootstrap, audit logging, email/support recovery, and negative-path tests. |

## Full Dashboard Audit Follow-Up

Owner clarification on `2026-06-18`: the expanded screenshot handoff for the first child is not a full-dashboard 10/10 audit.

Follow-up brief:

- `docs/task-briefs/in-progress/2026-06-18-admin-full-dashboard-ui-ux-audit-and-gap-list-10-10.md`

Purpose:

- audit every active admin tab, state family, action group, responsive layout, Help/Guide linkage, and 10/10 gap before selecting a larger UI/UX implementation child.
- keep the current child scoped to Users/Analytics coverage drift and Users readability wording.

Whole-dashboard `10/10` claim status: `no`. A defensible claim requires the full-dashboard audit evidence and the selected follow-up implementation child or explicit owner deferral of remaining gaps.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Strict 10/10 mode for this audit: all `target` categories must close at `5/5` before claiming `10/10`.

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Admin editor ergonomics
- Accessibility (a11y)
- Reliability and failure handling
- Security and authz
- Incident response and support operations
- Stack-fit and dependency discipline
- Testing and QA automation
- DevOps and rollback readiness

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                      | Evidence                                                            | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Audit identifies the admin jobs, current IA friction, tab grouping risks, and the single best next implementation child.                                                | audit matrix + owner decision                                       | `5/5`                   |
| UX flow clarity                               | `target`     | Audit covers loading/empty/error/retry/read-only/mutation states for changed or high-risk admin modules, and identifies unclear next actions.                           | code audit + screenshot or browser notes + findings table           | `5/5`                   |
| Visual design quality                         | `target`     | Audit checks density, spacing, typography, button hierarchy, mobile layout, grouped actions, and no card/text clutter across representative admin surfaces.             | after/reference or current-state screenshots if captured + findings | `5/5`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: this audit changes no data behavior, but must classify any proposed mutation/readability fix by business/data risk before implementation.              | risk classification in findings                                     | `4/5`                   |
| Admin editor ergonomics                       | `target`     | Audit ranks high-frequency admin workflows by scan cost, button competition, destructive-action separation, and support recovery clarity.                               | admin workflow matrix + top-three recommendations                   | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Audit checks whether active tabs are represented in admin a11y coverage and notes missing keyboard/focus/label evidence.                                                | test coverage audit + Playwright target list review                 | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: audit should avoid recommending heavy client UI and record separate perf-budget ratchet scope; it does not change runtime payloads.                    | dependency/no-runtime-diff review + perf ratchet note               | `4/5`                   |
| Data placement and sync boundaries            | `supporting` | Supporting only: proposed future fixes must classify local UI state vs server-canonical admin data before implementation; this audit does not add state.                | proposal classification                                             | `4/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: future admin read/mutation fixes must preserve no-store/admin-scoped cache rules; this audit changes no cache behavior.                                | proposal classification                                             | `4/5`                   |
| Reliability and failure handling              | `target`     | Audit includes failure-state visibility, stale docs/tests, support recovery paths, and deterministic no-access/error behavior for high-risk modules.                    | findings table + follow-up acceptance criteria                      | `5/5`                   |
| Security and authz                            | `target`     | Audit explicitly separates read-only UI polish from auth/service-role/user-mutation work, and flags any future create/invite/user-access child as security-sensitive.   | product decision + security risk notes                              | `5/5`                   |
| Privacy and compliance                        | `target`     | Audit verifies recommendations do not expose private user, training, habit, note, raw analytics, provider, or finance payloads in admin screenshots/docs.               | privacy review notes + screenshot inspection if captured            | `5/5`                   |
| Content governance                            | `supporting` | Supporting only: audit may recommend Help/Guide or admin docs cleanup, but does not change publish/revision/content ownership workflows.                                | docs impact notes                                                   | `4/5`                   |
| Admin workflow and editability                | `target`     | Audit verifies current admin actions remain discoverable, grouped by risk/frequency, and not misleading before selecting one implementation child.                      | workflow/action inventory                                           | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A with scope rationale: admin audit surfaces are authenticated/private and no public route metadata, sitemap, robots, canonical, or crawl-safe page changes are made. | explicit private-admin scope rationale                              | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A with scope rationale: this audit adds no public AI-facing content, structured data, crawlable entity surface, or public semantic contract.                          | explicit AI-discoverability scope rationale                         | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: audit may cover Admin Analytics readability, but does not add events, raw drilldown, KPI taxonomy, or analytics persistence.                           | no-analytics-mutation review                                        | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: audit may inspect Commerce tab readability, but does not change products, pricing, checkout, Stripe, entitlements, invoices, refunds, or revenue data. | no-commerce-mutation review                                         | `4/5`                   |
| Incident response and support operations      | `target`     | Audit identifies stale support/admin docs, Help/Guide fallout, user/admin action risk, and recovery-path gaps that could slow operator response.                        | support-surface sweep + findings                                    | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this audit changes no billing provider data, finance report, payout, refund, invoice, reconciliation, entitlement grant, or revenue truth.    | explicit finance scope rationale                                    | `N/A`                   |
| i18n operational readiness                    | `target`     | Audit checks whether admin labels/action groups/layouts avoid fixed English-only clipping and records future localization risk for new status/action labels.            | copy/layout review + responsive evidence                            | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Audit uses existing admin components, typed module boundaries, runbooks, and tests; no new dependency or local Codex config is introduced.                              | architecture review + package/no-config-diff review                 | `5/5`                   |
| Testing and QA automation                     | `target`     | Audit lists missing or stale unit/e2e/a11y/screenshot coverage and defines exact validation gates for the selected child.                                               | test matrix + `npm run lint:briefs`                                 | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: audit recommendations should favor shared admin primitives and grouped patterns instead of per-tab one-off rewrites.                                   | recommendation rationale                                            | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Audit produces a no-runtime-risk planned brief, keeps branch/PR scope separate, and defines rollback/no-op behavior for future UI/docs-only children.                   | git status + validation + follow-up brief path                      | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Audit the existing admin shell first: `components/admin/AdminWorkspace.tsx`.
  - Use existing admin manager surfaces as references, not new layout primitives.
  - Any later UI fix must preserve URL-driven `tab` state, role-resolved server page entry, and client manager boundaries.
- TypeScript/domain contracts:
  - Treat `ADMIN_TAB_VALUES`, `AdminWorkspaceModuleBoundary`, admin roles, support codes, and user overview contracts as canonical.
  - Unknown tabs/actions/statuses must fail to safe generic states or be blocked until mapped.
- Supabase/data layer:
  - This audit does not touch schema, migrations, RLS, generated DB types, or service-role access.
  - Future user invite/create work must re-check official Supabase Auth Admin docs and add fail-closed negative-path tests.
- External services:
  - No Stripe, email-provider, analytics-vendor, or third-party SDK changes.
- UI system:
  - Audit against current admin tokens: `fs-library-card`, `fs-cta-*`, `ui-field`, status chips, icon+text actions, compact controls, and Help/Guide placement.
  - Compare admin decisions against the external source baseline before proposing a fix.
  - Future UI changes require screenshot handoff before `verify:pre-pr`.
- Testing:
  - Audit existing unit/e2e/a11y coverage and define targeted test updates for the selected child.
  - For audit-only docs, `npm run lint:briefs` is required.

## Data Placement And Sync Contract

- Server-canonical data:
  - N/A for audit-only docs; no data source changes.
  - Future fixes must keep admin roles, content, notes, products, analytics summaries, user summaries, and audit logs server-canonical.
- Local data:
  - N/A for audit-only docs; no local/browser state changes.
  - Future UI fixes may use local state only for filters, open panels, selected rows, drafts, confirmations, and retry state.
- Sync policy:
  - N/A for audit-only docs; future mutations must refetch or invalidate the affected admin state.
- Retention and sensitivity:
  - Audit evidence must not copy secrets, raw env values, raw private payloads, provider IDs, or private user content.
- Cache/invalidation:
  - N/A for audit-only docs; future admin user/data routes should remain dynamic and `no-store` where sensitive.

## Identity And Rename Contract

- Canonical stable ID:
  - Admin module IDs come from `ADMIN_TAB_VALUES` and `AdminWorkspaceModuleBoundary`.
  - User IDs, content IDs, product IDs, and support/status machine keys remain canonical for future child scopes.
- Human-readable identifiers:
  - Admin tab labels, action labels, Help/Guide copy, product titles, and user emails/display names are display/search labels, not mutation identity.
- Mutability rules:
  - Module/action/status machine keys must not be repurposed for new meanings.
  - Display labels may be renamed only with Help/Guide, test, and route/label/support sweep updates.
- Rename vs repurpose policy:
  - Create new action/status keys for materially new admin behavior.
  - Do not change user role or access semantics through label-only edits.
- Compatibility contract:
  - Legacy admin links using `?tab=` continue to parse only known tabs.
  - Unknown tabs fall back safely through existing parser behavior.
- Observability and repair:
  - Audit should flag stale docs/tests when active module IDs and coverage lists drift.

## Forward Compatibility Contract

- Extensibility surfaces:
  - admin tabs, admin actions, workflow statuses, support reason codes, Help/Guide sections, user-role/access labels, analytics dashboard modules, commerce/admin labels, locales, and future user invite/create surfaces.
- Source of truth:
  - Admin tabs: `ADMIN_TAB_VALUES`.
  - Module boundaries: `ADMIN_WORKSPACE_MODULE_BOUNDARIES`.
  - Roles: `ADMIN_ROLE_VALUES`.
  - User/access status: `lib/admin/users.ts` typed contracts.
  - Help/Guide/support behavior: `AdminHelpCenter` plus relevant runbooks.
- Additive behavior:
  - New admin tabs should be added through typed module boundaries and audit/test lists in the same child.
  - New labels/statuses should use shared renderers and generic fallback where safe.
- Explicit mapping requirements:
  - New user mutations, Auth Admin invite/create flows, entitlement grants, destructive admin actions, provider diagnostics, finance fields, and raw analytics drilldowns need explicit owner decision, Help/Guide mapping, negative-path tests, and privacy review.
- Unknown or deprecated values:
  - Unknown tabs parse to `null`; unknown roles/statuses should render as `needs review` or fail closed for mutations.
  - Deprecated docs/tests must be treated as audit findings, not ignored.
- Test/evidence:
  - Future selected child must include coverage for any changed tab/action/status list, plus route/label/support sweep for changed labels and Help/Guide references.

## Scope

- Admin readability/design audit across:
  - Admin shell/navigation,
  - active tabs and module grouping,
  - button/action hierarchy,
  - high-risk mutation surfaces,
  - Users and Analytics coverage drift,
  - Help/Guide and architecture docs,
  - a11y/test coverage,
  - mobile/desktop scanability expectations,
  - external design source comparison,
  - baseline and post-implementation audit gates,
  - forward-compatible admin module rules.
- Document at most three recommended next improvements.
- Select exactly one bounded implementation child after owner review.

## Out Of Scope

- Runtime UI changes.
- User creation, account invitation, access grants, or profile bootstrap.
- Supabase migrations, RLS changes, generated DB type changes, service-role mutation code, or Auth Admin API calls.
- Checkout, Stripe, pricing, finance, refunds, invoices, payout, or entitlement mutation.
- New analytics events, raw event drilldown, vendor analytics, or KPI taxonomy changes.
- Performance-budget threshold changes inside this admin audit.
- Merge without explicit owner approval.

## Acceptance Criteria

1. Brief is updated before either audit starts.
2. Baseline audit lists current active admin modules, stale docs/tests, high-risk action areas, and external-source design findings.
3. Baseline audit ranks findings by security/privacy/data integrity risk first, then admin workflow friction, then tooling/docs drift.
4. Baseline audit recommends at most three next improvements, each classified as `safe process/docs update`, `bounded implementation child`, `deferred architecture decision`, or `do not do`.
5. Baseline audit explicitly decides whether admin-created users remains deferred or becomes a future invite/access child.
6. Post-implementation audit is required before any implementation child claims `10/10`.
7. Changed brief passes `npm run lint:briefs`.

## Validation

- `npm run lint:briefs`
- Optional during execution if screenshots are captured: local admin screenshot/a11y pass using repo screenshot defaults.
- For any later implementation child:
  - baseline audit evidence before code,
  - targeted unit/component/e2e tests for changed surface,
  - screenshot handoff before `npm run verify:pre-pr` for visual/UI changes,
  - post-implementation audit evidence after code and screenshots,
  - `npm run verify:pre-pr`,
  - CI,
  - `npm run verify:pre-merge`.

## Help / Guide Impact

Audit-only scope does not change Help/Guide content. Any selected implementation child that changes admin labels, actions, workflow order, recovery behavior, support guidance, or user-role/access copy must update Help/Guide and relevant runbooks in the same PR.

## Route / Label / Support Surface Sweep

Before any implementation child, run a targeted sweep for:

- `AdminWorkspace`
- `ADMIN_TAB_VALUES`
- `analytics`
- `users`
- `read-only`
- `role management`
- `create user`
- `invite`
- `Help/Guide`
- `admin audit`
- `support`
- `access`
- `role`

Check at minimum `app/`, `components/`, `lib/`, `tests/`, `docs/`, `docs/runbooks/`, `docs/checklists/`, and active/planned/done task briefs.

## Checkpoint Log

- `2026-06-18 | child approved post-merge | post-merge admin re-audit on main@a7056f2a found whole-dashboard 10/10 still blocked by Analytics scan cost and mobile admin IA; owner approved the recommended bounded child for Admin Analytics density/caveat grouping; active child opened at docs/task-briefs/in-progress/2026-06-18-admin-analytics-density-and-caveats-10-10.md on branch admin-analytics-density-caveats | next: complete scoped Analytics UI/test/screenshot work and stop for owner screenshot approval before verify:pre-pr`
- `2026-06-18 | full-dashboard audit executing | owner clarified that the Users-focused screenshot handoff cannot stand in for all dashboard menus/states; moved follow-up brief to docs/task-briefs/in-progress/2026-06-18-admin-full-dashboard-ui-ux-audit-and-gap-list-10-10.md for full admin UI/UX audit and 10/10 gap list | next: complete the full-dashboard audit before any whole-dashboard 10/10 claim`
- `2026-06-18 | child approved | owner approved recommended child admin-audit-coverage-and-users-readability-drift; branch admin-audit-coverage-users-readability-drift created and child brief opened at docs/task-briefs/in-progress/2026-06-18-admin-audit-coverage-and-users-readability-drift-10-10.md | next: complete scoped child implementation, screenshot handoff, then wait for owner visual approval before verify:pre-pr`
- `2026-06-18 | baseline-audit | completed baseline audit after brief update: captured local screenshots, compared Users/Analytics/admin IA against external source lens, ranked findings, kept admin-created users deferred, and selected recommended child admin-audit-coverage-and-users-readability-drift | next: owner approves selected child before any implementation branch`
- `2026-06-18 | planning | updated brief before any audit starts with external design source baseline and two-pass audit model: baseline audit before code, post-implementation audit before any 10/10 claim; admin-created users remain deferred to a future invite/access child | next: run lint:briefs, then run the baseline audit only after this brief update is validated`
- `2026-06-18 | planning | created audit-first admin readability/design brief after choosing admin audit over admin-created users; perf-budget trend decision recorded as tighten but threshold change remains a separate perf-governance child | next: run lint:briefs, then owner selects whether to execute audit-only findings pass or create the first bounded implementation child after audit`
