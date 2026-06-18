# Task Brief: Admin Help/Guide Quick Reference 10/10

## Metadata

- `id`: `2026-06-18-admin-help-guide-quick-reference-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-06-18`
- `updated`: `2026-06-18`
- `parent`: `docs/task-briefs/planned/2026-06-18-admin-readability-design-audit-10-10.md`
- `execution_mode`: `owner approved implementation on 2026-06-18`

## Brief Audit Record

- `last_audited`: `2026-06-18`
- `base`: `main@1426cc84`
- `audit_status`: `ready`
- `decision`: Execute this bounded admin UI/support implementation child now.
- `reason`: Post-merge re-audit found Help/Guide is the clearest current 10/10 blocker: it behaves like a long documentation page, with screenshot metrics around `16399px` desktop and `31799px` mobile, instead of a fast operator quick-reference.
- `must_refresh_before_execution_if`: Refresh if `ADMIN_TAB_VALUES`, `AdminWorkspace`, `AdminHelpCenter`, `admin-help-center` e2e assertions, admin tabs/actions, screenshot rules, scorecard categories, route/label/support sweep rules, or post-merge audit evidence changes before implementation.

## Goal

Make Admin Help/Guide a fast, mobile-safe operator quick-reference that explains every active admin tab, common actions, dangerous actions, and recovery states without changing admin runtime behavior.

## Pre-Implementation Owner Explanation

Vi gjor Help/Guide om fra en lang dokumentasjonsside til en rask arbeidsflate for admin: hva skal jeg gjore naa, hvor trykker jeg, hva er farlig, og hvordan fikser jeg vanlige feiltilstander.

Hvorfor det betyr noe: Admin skal kunne lose innhold, support og drift raskt uten aa lese en hel runbook midt i arbeidet. Kortere og tydeligere hjelp reduserer feilhandlinger og gjor mobilbruk mer realistisk.

Utenfor scope: mobil hovednavigasjon, Analytics-opprydding, lesson editor viderepolering, nye admin-funksjoner, data/API/auth-endringer, checkout/finance og bred dashboard-redesign.

Forward compatibility: nye admin-tabs, handlinger og recovery states skal enten vises automatisk fra kanoniske admin-tab/action-kilder eller kreve eksplisitt Help/Guide-mapping, test og owner-beslutning for ukjente eller risikable verdier.

## Current Audit Evidence

Post-merge re-audit evidence:

- Screenshot artifacts: `output/admin-dashboard-post-merge-reaudit-20260618-23341/`
- Captured: `2026-06-18 12:33`
- `after-admin-help-desktop.png`: current Help/Guide full-page height around `16399px`.
- `after-admin-help-mobile.png`: current Help/Guide full-page height around `31799px`.
- Mobile admin tab row currently exposes only about `3/11` tabs in the first viewport; the nav IA problem is recorded as a separate follow-up, not this child.

Finding:

- Help/Guide contains useful guidance, but too much of it is presented as one long page. The next slice should keep essential guidance while making the first screen and mobile flow behave like a quick operations reference.

## Scope

- Restructure `components/admin/AdminHelpCenter.tsx` into a quick-reference-first surface.
- Keep a short "Start here" area that answers:
  - what this page is for,
  - where to go for the next admin action,
  - when to stop and use a runbook or owner decision.
- Provide quick-reference coverage for every active admin tab:
  - `Content`,
  - `QR Links`,
  - `Commerce`,
  - `Operations`,
  - `Analytics`,
  - `Users`,
  - `Email templates`,
  - `Messages`,
  - `Notes`,
  - `Categories`,
  - `Help/Guide`.
- For each tab, include:
  - primary job,
  - most common action,
  - dangerous or irreversible action,
  - recovery path for `loading`, `empty`, `error`, and `retry` states where relevant,
  - link or pointer to the right runbook when the answer should not live inline.
- Make the mobile Help/Guide path scannable:
  - avoid a single long scroll wall,
  - use compact grouped sections,
  - keep high-frequency recovery guidance near the top,
  - collapse or link lower-frequency detail where practical.
- Update `ADMIN_HELP_QUICK_ACTIONS`, `DASHBOARD_TABS`, action/recovery guidance, and any local helper structures needed to keep coverage auditable.
- Update `tests/e2e/admin-help-center.spec.ts` and targeted unit/component assertions so Help/Guide coverage does not drift from active admin tabs.
- Capture before/after screenshots for Help/Guide desktop and mobile, plus any relevant error/retry quick-reference state.

## Out Of Scope

- No redesign of the main admin tab navigation or mobile admin IA.
- No Analytics dashboard semantics, KPI, caveat, event, or aggregation changes.
- No lesson editor layout or sticky action changes.
- No database, Supabase, RLS, generated type, API route, server action, auth, role, entitlement, checkout, Stripe, finance, or analytics payload change.
- No new dependency, external design system, or local Codex skill/plugin configuration.
- No broad runbook rewrite unless a Help/Guide link becomes stale inside this scoped change.
- No merge without explicit owner approval.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for this child: Product goals and IA, UX flow clarity, Visual design quality, Admin editor ergonomics, Accessibility (a11y), Reliability and failure handling, Security and authz, Privacy and compliance, Content governance, Admin workflow and editability, Incident response and support operations, i18n operational readiness, Stack-fit and dependency discipline, Testing and QA automation, DevOps and rollback readiness.

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                   | Evidence                                                   | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Help/Guide first screen explains the operator job and gives quick paths for all active admin tabs without changing main admin nav IA.                                                | screenshots + tab coverage test + copy review              | `5/5`                   |
| UX flow clarity                               | `target`     | Each active tab has primary job, common action, dangerous action, and recovery guidance; no dead-end Help/Guide section remains for common admin states.                             | e2e assertions + screenshot review                         | `5/5`                   |
| Visual design quality                         | `target`     | Desktop/mobile Help/Guide screenshots show compact hierarchy, no clipped text, no overlap, and materially less scroll wall than baseline.                                            | before/after screenshot handoff + page-height metrics      | `5/5`                   |
| Business logic correctness and data integrity | `supporting` | This slice changes guidance/UI only; no mutations, payloads, persisted data, or workflow state transitions change.                                                                   | diff review + targeted tests                               | `4/5`                   |
| Admin editor ergonomics                       | `target`     | Admin can find the right tab/action/recovery step quickly; Help/Guide supports high-frequency admin work instead of forcing runbook reading.                                         | manual QA checklist + screenshots                          | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Help/Guide headings, anchors/subnav, cards/details, focus order, keyboard access, labels, contrast, and touch targets remain accessible on desktop and mobile.                       | Playwright/e2e + a11y spot check                           | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency or heavy client code; Help/Guide page remains static/client-light and does not regress admin bundle materially.                                                    | package diff + build output/perf review                    | `5/5`                   |
| Data placement and sync boundaries            | `supporting` | No server/local data ownership changes; any expand/collapse or hash navigation state is local-only UI state.                                                                         | scope/diff review                                          | `4/5`                   |
| Caching and invalidation strategy             | `supporting` | Existing private admin rendering/cache behavior remains unchanged.                                                                                                                   | diff review                                                | `4/5`                   |
| Reliability and failure handling              | `target`     | Help/Guide explicitly covers common admin `loading`, `empty`, `error`, and `retry` states, including Content load-failure confusion found in re-audit.                               | help assertions + screenshot/review                        | `5/5`                   |
| Security and authz                            | `target`     | Guidance must not imply broader access than current admin roles; no protected route or authz behavior changes.                                                                       | copy review + existing protected-path tests where relevant | `5/5`                   |
| Privacy and compliance                        | `target`     | Help/Guide preserves privacy boundaries for Users, Analytics, Notes, Messages, and screenshots; no raw private/provider/payment data is exposed.                                     | copy/privacy review + screenshots                          | `5/5`                   |
| Content governance                            | `target`     | Help/Guide becomes the canonical in-app support surface for active admin workflows and links out to runbooks for lower-frequency procedures.                                         | Help/Guide diff + route/support sweep                      | `5/5`                   |
| Admin workflow and editability                | `target`     | Current admin workflow labels/actions remain accurately documented; dangerous actions and recovery paths are grouped by operator task.                                               | e2e assertions + manual QA                                 | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this private authenticated admin Help/Guide surface does not change public metadata, sitemap, robots, canonical URLs, or crawlable public content.                       | explicit private-admin scope rationale                     | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public AI-facing content, structured data, entity schema, or crawlable semantic route changes.                                                                        | explicit private-admin scope rationale                     | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Analytics guidance/caveats may be shortened or linked, but event taxonomy, KPI definitions, persistence, and dashboard logic remain unchanged.                                       | copy diff + no analytics code diff                         | `4/5`                   |
| Commerce and revenue ops                      | `supporting` | Commerce/finance caveats must remain accurate; no product, checkout, entitlement, Stripe, revenue, refund, invoice, payout, or reconciliation behavior changes.                      | copy review + no commerce code diff                        | `4/5`                   |
| Incident response and support operations      | `target`     | Help/Guide must make common support/recovery steps faster to find and link to relevant runbooks for incidents, notes, messages, QR redirects, site lock, and email templates.        | Help/Guide assertions + support/runbook sweep              | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice changes no billing provider data, finance reports, payout/refund/invoice flows, entitlement grants, or revenue truth; finance caveats must only be preserved. | explicit finance scope rationale + copy review             | `N/A`                   |
| i18n operational readiness                    | `target`     | Short grouped copy and responsive cards/details must avoid fixed-width English-only assumptions and reduce future locale clipping risk.                                              | desktop/mobile screenshots + copy review                   | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing `AdminHelpCenter`, `AdminWorkspace` Help subnav, Freeswimming tokens, and test stack; add no dependency.                                                              | diff/package review                                        | `5/5`                   |
| Testing and QA automation                     | `target`     | Add/update automated assertions that active admin tabs have Help/Guide coverage; run targeted tests, brief lint, and required gates after screenshot approval.                       | test logs + `npm run verify:pre-pr`                        | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Future tabs/actions should not require another long static page; reusable coverage structures should keep guidance maintainable without runtime cost growth.                         | implementation review + tests                              | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Small reversible UI/copy/test diff with no schema/API dependency; screenshot approval before PR; rollback is normal git revert.                                                      | git diff + gates + PR evidence                             | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reference surface: reuse the existing `AdminHelpCenter` quick-action/subnav pattern and `AdminWorkspace` Help/Guide desktop rail rather than creating a new admin support route or layout system;
  - reuse `components/admin/AdminHelpCenter.tsx` as the primary surface;
  - reuse `components/admin/AdminWorkspace.tsx` Help/Guide subnav behavior unless a small local adaptation is required;
  - keep `/admin?tab=help` route behavior unchanged;
  - no server action, route handler, API route, or cache behavior change.
- TypeScript/domain:
  - treat `ADMIN_TAB_VALUES`/admin tab metadata as the active admin surface source of truth;
  - keep Help/Guide coverage typed enough that missing tab guidance becomes a test/audit failure.
- Supabase/data:
  - no migrations, RLS, generated DB types, service-role, or Auth Admin behavior.
- External services:
  - no new provider integration; preserve existing caveats for Stripe/finance, analytics storage, email, and site-lock operations.
- UI system:
  - reuse existing Freeswimming admin tokens, `fs-*` card/action patterns, headings, status chips, anchors, and responsive layout conventions;
  - do not introduce a new design system or decorative layout.
- Testing:
  - update Help/Guide e2e assertions and any unit/component coverage that can compare active tab values with Help/Guide coverage;
  - screenshot handoff comparison type is `before/after` for `/admin?tab=help` desktop and mobile.

## Codex Skill And Stack Readiness Radar

Capability audit:

| Capability                   | Evidence                 | Current Status | Recommended Trigger                                    | Boundary                                           |
| ---------------------------- | ------------------------ | -------------- | ------------------------------------------------------ | -------------------------------------------------- |
| `playwright`                 | Session skill metadata   | `installed`    | Help/Guide desktop/mobile screenshots and local UI QA. | Does not replace owner screenshot approval.        |
| `imagegen`                   | Session skill metadata   | `available`    | Not needed for this admin UI/copy slice.               | Do not generate decorative assets for Help/Guide.  |
| Stripe plugin skills         | Session plugin metadata  | `available`    | Only if future commerce/finance behavior changes.      | Not relevant because finance behavior is out.      |
| Supabase/Auth Admin docs     | Repo/source audit needed | `not needed`   | Future user invite/create/access child.                | No auth/data mutation in this slice.               |
| Local Codex skill/plugin cfg | Repo rule                | `not needed`   | N/A                                                    | Do not install/configure local tools in this task. |

Top findings:

| Surface                         | Finding                                                                                 | Classification                   | Owner Decision Needed                          |
| ------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------- | ---------------------------------------------- |
| Help/Guide quick-reference      | Current page is too long for fast operator use, especially mobile.                      | `bounded implementation child`   | `no`, if scope stays to layout/copy/test.      |
| Mobile admin navigation         | Main admin nav still hides most tabs on mobile first viewport.                          | `deferred architecture decision` | `yes`, for nav grouping/IA.                    |
| Analytics density/caveat burden | Analytics still needs a separate density/caveat-grouping child after Help/Guide or nav. | `bounded implementation child`   | `no` for copy grouping, `yes` for KPI meaning. |

Return path:

- Current base: `main@1426cc84`.
- Local untracked `Ja.docx` is owner/local state and must not be touched.
- This brief owns only the Help/Guide quick-reference child. Mobile nav and Analytics remain follow-up candidates.

## Data Placement And Sync Contract

- Server-canonical data: unchanged; Help/Guide content remains repo-authored UI/copy, not database content.
- Local data: only local UI state such as active anchor, details open/closed state, or scroll position if used.
- Sync policy: N/A because no persisted client/server data is introduced.
- Retention and sensitivity: no raw user, payment, provider, analytics payload, private note, or staged screenshot data is added to Help/Guide.
- Cache/invalidation: unchanged private admin route behavior.

## Identity And Rename Contract

- Canonical stable IDs: admin tab values from `ADMIN_TAB_VALUES`, Help section IDs, runbook paths, and test IDs remain the compatibility surface.
- Human-readable labels: labels may be shortened for clarity, but semantic meaning for tabs/actions/recovery states must not change unless tests and Help/Guide mapping are updated in the same PR.
- Mutability rules: no persisted entity IDs, route params, slugs, or database rows are renamed.
- Rename vs repurpose: do not repurpose an existing Help section ID for a different operator meaning; create a new ID and preserve/redirect anchors if old anchors may be used.
- Compatibility contract: existing `/admin?tab=help` and important `#section` anchors should remain valid or have an intentional fallback documented in the PR.
- Observability and repair: missing active-tab Help coverage should fail test/lint evidence, not silently ship.

## Forward Compatibility Contract

- Extensibility surfaces:
  - admin tabs,
  - tab labels,
  - workflow actions,
  - dangerous/destructive actions,
  - recovery states,
  - runbook links,
  - locales,
  - support diagnostics.
- Source of truth:
  - active admin tabs come from `ADMIN_TAB_VALUES`/admin workspace metadata;
  - Help/Guide action/recovery copy can stay explicitly mapped where meaning is operator-specific.
- Additive behavior:
  - future active tabs should appear in the quick-reference coverage structure and automated tests;
  - generic tab rendering may use fallback primary-job copy only when the tab is intentionally low-risk and the fallback is visible as needing owner review.
- Explicit mapping requirements:
  - new admin workflow states, destructive actions, role/account mutations, analytics KPI meanings, commerce/finance interpretation, support runbooks, or recovery procedures require explicit Help/Guide mapping, tests, and owner-approved scope before release.
- Unknown or deprecated values:
  - unknown tab/action values must fail safe as "guidance missing" in tests or render a clear admin warning rather than implying unsupported guidance.
- Test/evidence:
  - add or update a contract assertion that every active admin tab has Help/Guide quick-reference coverage;
  - run route/label/support sweep for Help/Guide labels, action names, runbook paths, and recovery wording.

## Help / Guide And Operator Training Impact

Required and central to this brief.

- Update Help/Guide itself in the same PR.
- Update `tests/e2e/admin-help-center.spec.ts` or equivalent assertions to prove:
  - every active admin tab has quick-reference coverage,
  - common recovery actions are visible,
  - finance/privacy caveats still do not overclaim,
  - long-form docs/runbook links remain reachable where needed.
- Include closeout note proving Help/Guide is aligned with shipped admin behavior.

## Route / Label / Support Surface Sweep

Required before broad gates because this slice materially changes Help/Guide structure, anchors, labels, and support guidance.

Search at minimum:

- `Help/Guide`
- `Start here`
- `Dashboard tabs`
- `Troubleshoot`
- `Daily playbooks`
- `Buttons explained`
- `Content`
- `QR Links`
- `Commerce`
- `Operations`
- `Analytics`
- `Users`
- `Email templates`
- `Messages`
- `Notes`
- `Categories`
- `loading`
- `empty`
- `error`
- `retry`
- `runbook`
- `/admin?tab=help`
- `admin-help-subnav`
- `admin-help-center`

Check at minimum:

- `app/`
- `components/`
- `tests/`
- `docs/`
- `docs/runbooks/`
- `docs/checklists/`
- active/planned/done task briefs when current assertions mention Help/Guide behavior.

Sweep evidence must record searched identifiers, surfaces checked, fallout handled, and any intentionally deferred findings.

Implementation sweep evidence before screenshot approval:

- `identifiers searched`: `Help/Guide`, `Start here`, `Tab quick reference`, `Recovery states`, `Dashboard tabs`, `Troubleshoot fast`, `Buttons explained`, `Content load mismatch`, `admin-help-subnav`, `admin-help-center`, `/admin?tab=help`, `admin-help-guide-harness`, and `capture-admin-help-guide-screenshots`.
- `surfaces checked`: `app/`, `components/`, `tests/`, `docs/`, `docs/runbooks/`, `docs/checklists/`, and temporary screenshot harness/script paths.
- `fallout handled`: `AdminHelpCenter` quick-reference/recovery structure, Help/Guide e2e assertions, Help/Guide unit assertions, and active-tab coverage contract were updated in this slice.
- `intentional leftovers`: historical done-brief references to Help/Guide and previous screenshot harnesses remain as past evidence; no temp harness or capture-script references remain in active code.
- `out of scope`: mobile main admin nav IA, Analytics dashboard density/caveat grouping, lesson editor sticky actions, data/API/auth behavior, and runbook rewrites.

## Acceptance Criteria

1. Help/Guide opens with a quick-reference-first structure, not a long documentation wall.
2. All 11 active admin tabs have visible quick-reference coverage for primary job, common action, dangerous action, and recovery path or explicit N/A rationale.
3. Common `loading`, `empty`, `error`, and `retry` guidance is easy to find and includes the Content load-failure copy issue discovered in the post-merge audit.
4. Desktop and mobile screenshots show materially improved scannability, no text overlap/clipping, and at least a `40%` reduction in default full-page scroll height or equivalent collapsed-by-default evidence that lower-frequency material no longer dominates the main path.
5. Mobile Help/Guide gives the operator the critical quick-reference path within the first `2` mobile viewports.
6. Finance, privacy, analytics, role-management, and destructive-action caveats remain accurate and do not imply new capabilities.
7. Automated coverage prevents active admin tabs from drifting out of Help/Guide coverage.
8. Screenshot handoff is owner-approved before `npm run verify:pre-pr`.
9. Changed briefs pass `npm run lint:briefs`.

## Validation Plan

- Before implementation:
  - `git status -sb`
  - `git log --oneline -n 10`
  - refresh this brief if base/scope changed.
- During implementation:
  - targeted unit/component tests for Help/Guide coverage if added,
  - targeted Playwright: `npx playwright test tests/e2e/admin-help-center.spec.ts --project=desktop-chromium` when local auth/dev-login allows,
  - `npm run typecheck`,
  - `npm run lint:briefs`,
  - `git diff --check`.
- Visual checkpoint:
  - capture before/after screenshots for `/admin?tab=help` desktop and mobile,
  - artifact folder named `output/admin-help-guide-quick-reference-YYYY-MM-DD-HHMMSS`,
  - filenames use `before-admin-help-guide-desktop.png`, `after-admin-help-guide-desktop.png`, `before-admin-help-guide-mobile.png`, and `after-admin-help-guide-mobile.png`,
  - wait for owner screenshot approval before `verify:pre-pr`, PR creation, or `verify:pre-merge`.
- Before PR update:
  - `npm run verify:pre-pr`.
- Before merge readiness:
  - required CI checks green,
  - `npm run verify:pre-merge`.

## Manual QA Environments

- Local URL: `http://127.0.0.1:3000/admin?tab=help` or local visual harness only if `/dev/login` remains blocked by Supabase egress.
- Browser/device matrix:
  - desktop Chromium screenshot required,
  - mobile Chromium/iPhone-size viewport screenshot required,
  - keyboard/focus spot check required for Help subnav and any details/accordion controls.
- Preview QA:
  - use PR preview URL if available after screenshot approval and `verify:pre-pr`.
  - document any local-vs-preview difference, or state `none`.

## Constraints

- Keep the slice narrow and reversible.
- Preserve existing Freeswimming admin visual language.
- Prefer short plain-language copy and links to runbooks over in-page long explanations.
- Do not hide safety-critical caveats; move or compress them only when recovery/support meaning remains clear.
- Do not touch `Ja.docx`.
- Do not add dependencies.
- Do not change protected route behavior, data fetch behavior, roles, or mutations.

## Debugging And Handoff Contract

- For visual/layout bugs, follow `docs/runbooks/ui-debug-hypothesis-and-handoff.md`.
- If a Help/Guide visual fix fails twice or screenshots contradict the claimed fix:
  - restate the exact observed failure,
  - list likely causes in order,
  - verify/eliminate with targeted evidence,
  - make the smallest fix,
  - regenerate full-resolution artifacts before presenting again.
- If a reusable high-cost issue is discovered, update `docs/runbooks/high-cost-debug-log.md` or explicitly justify why it is not reusable.
- If context gets heavy after screenshot handoff or PR closeout, use `docs/runbooks/pr-flow-and-chat-handoff.md` for the carry-forward prompt.

## 10/10 Quality Bar

- UX clarity:
  - first screen explains where to start and what the operator can safely do next.
- Required states:
  - Help/Guide covers `loading`, `empty`, `error`, `retry`, and known support recovery paths.
- Accessibility:
  - anchors/details/cards are keyboard reachable with visible focus, semantic headings, readable labels, sufficient contrast, and mobile touch targets.
- Performance:
  - no new dependency, no heavy dynamic rendering, no material admin bundle growth.
- Visual consistency:
  - reuse existing admin cards, tokens, heading scale, and action hierarchy.
- Business logic correctness:
  - no mutation or data semantics change; guidance must match existing admin behavior exactly.

## 10/10 Cross-Cut Categories

- Content governance and source-of-truth:
  - Help/Guide becomes the in-app quick-reference source; linked runbooks remain the deeper procedure source.
- Identity and rename safety:
  - preserve `/admin?tab=help`, Help section IDs where used, active tab values, and runbook paths unless intentionally migrated.
- Forward compatibility and extensibility:
  - active admin tab coverage must be data-driven or explicitly mapped with failing evidence for unmapped values.
- Taxonomy and category management:
  - no category model change; Categories tab guidance must preserve taxonomy ownership.
- Workflow and publishing safety:
  - destructive/publish/status actions must be named and separated from common actions.
- Business logic correctness and data integrity:
  - no data behavior changes; guidance must not imply new capabilities.
- RBAC and auditability:
  - role/admin-only actions must remain described as guarded and audited where applicable.
- UX/UI quality contract:
  - compact quick-reference, no scroll wall, clear recovery states.
- Admin editor ergonomics:
  - Help/Guide supports faster admin operation across Content, Users, Notes, Messages, Analytics, and support surfaces.
- Performance contract:
  - no new dependency or heavy client pattern.
- Data placement and sync boundaries:
  - no persisted data boundary change.
- Caching and invalidation strategy:
  - no route cache behavior change.
- Testing contract:
  - tab coverage assertion, Help/Guide e2e, screenshot handoff, broad gates.
- Observability and KPI tracking:
  - preserve Analytics caveats; no event/log changes.
- Incident response and support operations:
  - make recovery/runbook routing faster to find.
- Finance and reporting operations:
  - N/A for behavior; preserve finance caveat wording where Commerce/Analytics mentions revenue or Stripe.
- i18n operational readiness:
  - shorter grouped copy and responsive checks reduce future locale clipping.
- Stack-fit and dependency discipline:
  - existing stack only.
- Scalability and cost efficiency:
  - maintainable mapping avoids repeated long-page growth.
- Migration and rollback readiness:
  - no migration; rollback by revert.
- Definition of done quant targets:
  - all target scorecard rows close at `>=4/5`; critical target rows close at `5/5` for any scoped 10/10 claim.
- Help/Guide and operator training documentation:
  - this is the changed surface; update assertions and closeout evidence in same PR.

## Security, Privacy, and Compliance

- Do not add secrets, env values, raw API payloads, private user data, provider IDs, IP addresses, User-Agent strings, payment data, invoices, refunds, payouts, raw analytics payloads, or private notes to Help/Guide or screenshots.
- Guidance must keep Users/Analytics privacy boundaries explicit.
- Guidance must not imply user creation, entitlement grants, role changes, refunds, payouts, or finance reconciliation unless those already exist and are properly guarded.
- Protected admin access behavior remains fail-closed and unchanged.

## Observability and KPI Contract

- No new analytics events, KPI payloads, logs, dashboards, or persistence changes.
- Success evidence is operational:
  - Help/Guide coverage tests,
  - screenshot metrics,
  - owner screenshot approval,
  - route/label/support sweep.

## Session Continuity And Recovery

- Canonical source of truth: this brief path plus implementation branch when owner approves execution.
- Checkpoint cadence:
  - commit after each validated implementation step if the owner approves execution,
  - update this brief checkpoint log at meaningful milestones.
- Recovery protocol:
  1. `git status -sb`
  2. `git log --oneline -n 10`
  3. reopen this brief and continue from the latest checkpoint.

## Git Rhythm Defaults

- Implementation branch should be created from latest `main` only after owner approval.
- Commit and push after validated implementation checkpoints.
- Open/update PR after screenshot approval and `npm run verify:pre-pr`.
- Do not merge without explicit owner approval.
- Post-merge cleanup follows repo defaults after merge approval.

## Automation Mode

- `automation-first` after owner explicitly approves implementation:
  - assistant owns branch, implementation, targeted tests, screenshot handoff, `verify:pre-pr`, commit/push, PR, CI monitoring, `verify:pre-merge`, and merge-readiness summary.
- Visual work exception:
  - pause after screenshot handoff and wait for owner approval before `verify:pre-pr`, PR creation, or `verify:pre-merge`.
- Fallback:
  - if local auth/dev-login blocks screenshots, use the documented local visual-harness fallback and remove harness files before PR diff.

## Branch Hygiene Defaults

- Post-merge cleanup:
  - `git checkout main`
  - `git pull --ff-only origin main`
  - `git branch -d <merged-branch>`
  - delete remote branch if still present,
  - `git fetch --prune origin`.
- Safety:
  - do not use `git branch -D` without explicit owner confirmation or a dated backup/tag.

## PR Browser Rule

- Prefer repo Safari helpers for PR create/review/merge URLs.
- Do not overwrite the owner's active Safari tab unless that tab already belongs to the target PR.

## Manual QA URL Rule

- Assistant opens or provides the local/preview Help/Guide URL for QA after screenshots are ready.
- Give the owner exactly one manual action at a time if UI/GitHub action is required.

## Closeout Gate

Before marking done:

- screenshot handoff approved,
- `npm run verify:pre-pr` passed,
- PR CI required checks green,
- `npm run verify:pre-merge` passed,
- route/label/support sweep evidence recorded,
- completion scores recorded for every target category,
- `10/10 claim: yes/no` recorded explicitly,
- if claiming `10/10`, list critical target categories and confirm each is `5/5`.

## Implementation Evidence Before Screenshot Approval

- `implementation summary`: Help/Guide now opens with Start here, Recovery states, and active tab quick-reference cards before deeper documentation. Long-form learning path, workflow details, button glossary, controls, services, playbooks, troubleshoot, and governance sections remain available as collapsed details.
- `coverage contract`: `ADMIN_HELP_TAB_GUIDES` covers all current `ADMIN_TAB_VALUES`; unit tests assert this so future active tabs cannot silently drift out of Help/Guide coverage.
- `screenshot artifacts`: `output/admin-help-guide-quick-reference-2026-06-18-130232/`
- `screenshot type`: before/after.
- `screenshot metrics`: desktop full-page height reduced from `16399px` to `5398px`; mobile full-page height reduced from `31799px` to `10268px`; after-state has `11` tab quick-reference cards, `5` recovery cards, `16` collapsed detail sections, and `0` open detail sections by default.
- `visual caveat`: local `/admin?tab=help` still cannot be captured through dev-login because Supabase/dev-login egress returns HTML instead of JSON, so after screenshots used a temporary local harness that rendered the real admin shell and `AdminWorkspace` on the Help tab. The harness route and capture script were removed after capture.
- `product-rendering files changed after final capture`: none. Only the temporary screenshot harness route and capture script were removed after final capture.
- `validation before screenshot handoff`: targeted Vitest passed (`tests/unit/admin-help-center.test.tsx`, `tests/unit/admin-workspace-shell.test.tsx`: `9` tests); `npm run typecheck` passed; `npm run lint` passed with `7` pre-existing warnings in old `output/` capture scripts; `npm run lint:briefs:all` passed before this evidence update and must be rerun after this patch; `git diff --check` passed; targeted Playwright admin Help/Guide spec exited `0` with `1` skipped because local dev-login/Supabase returned `AuthUnknownError: Unexpected token '<'`.

## Completion Record

- `completed`: `2026-06-18`
- `merged_pr`: `#1155`
- `squash_commit`: `e707d0b4`
- `result`: Closed the scoped Admin Help/Guide Quick Reference 10/10 slice. Help/Guide now starts as a compact operator reference for all active admin tabs, common/dangerous actions, and recovery states while leaving admin runtime behavior unchanged.
- `validation`: targeted unit/type/lint/diff checks passed before screenshot handoff; owner approved before/after screenshots; `npm run verify:pre-pr` passed on `8e7e0e37`; PR CI passed on #1155; `npm run verify:pre-merge` passed on `8e7e0e37`; `npm run merge:preflight -- --assert-ready` passed before merge.
- `10/10 claim`: yes - all critical target categories listed in this brief reached `5/5` for this scoped Help/Guide slice. This does not claim the whole admin dashboard/lesson editor is 10/10.

Critical target categories confirmed `5/5`:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Admin editor ergonomics`
- `Reliability and failure handling`
- `Security and authz`
- `Privacy and compliance`
- `Content governance`
- `Admin workflow and editability`
- `Incident response and support operations`
- `i18n operational readiness`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

Accessibility (a11y) also closed at `5/5` in the achieved-score table below; it is kept out of this machine-read critical list because the current brief linter strips parenthetical suffixes from critical-category bullets.

| Category                                 | Achieved Score | Evidence                                                                                                                                                       | Gaps / Notes   |
| ---------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Product goals and IA                     | `5/5`          | Help/Guide first-screen quick reference, all-tab coverage contract, screenshots, PR #1155 CI.                                                                  | No scoped gap. |
| UX flow clarity                          | `5/5`          | Tab cards cover primary job, common action, dangerous action, and recovery; e2e/unit assertions updated.                                                       | No scoped gap. |
| Visual design quality                    | `5/5`          | Before/after screenshots in `output/admin-help-guide-quick-reference-2026-06-18-130232/`; desktop height `16399px` to `5398px`, mobile `31799px` to `10268px`. | No scoped gap. |
| Admin editor ergonomics                  | `5/5`          | Start here, Recovery states, and Tab quick reference put frequent admin decisions above collapsed long-form docs.                                              | No scoped gap. |
| Accessibility (a11y)                     | `5/5`          | Existing semantic headings/details/buttons preserved; desktop/mobile screenshots and e2e coverage passed.                                                      | No scoped gap. |
| Performance (CWV + payloads)             | `5/5`          | No dependency or data/runtime behavior added; build and perf budgets passed. Perf-budget tightening held for separate maintenance slice.                       | No scoped gap. |
| Reliability and failure handling         | `5/5`          | Loading, empty, error, retry, content mismatch, and retry/recovery guidance now appear near the top.                                                           | No scoped gap. |
| Security and authz                       | `5/5`          | Copy review and no auth/API/RLS route changes; protected behavior unchanged.                                                                                   | No scoped gap. |
| Privacy and compliance                   | `5/5`          | Users, Analytics, Notes, Messages, screenshots, and provider caveats remain privacy-bounded; no sensitive data added.                                          | No scoped gap. |
| Content governance                       | `5/5`          | Help/Guide is now the in-app quick-reference surface; deeper runbook/procedure material remains reachable in collapsed sections.                               | No scoped gap. |
| Admin workflow and editability           | `5/5`          | Current tab labels/actions/recovery paths are mapped and tested against active admin tabs.                                                                     | No scoped gap. |
| Incident response and support operations | `5/5`          | Common support/recovery paths are grouped up front and runbook boundaries remain explicit.                                                                     | No scoped gap. |
| i18n operational readiness               | `5/5`          | Shorter grouped copy and responsive cards reduce clipping risk; desktop/mobile screenshots approved.                                                           | No scoped gap. |
| Stack-fit and dependency discipline      | `5/5`          | Reused `AdminHelpCenter`, existing admin patterns, TypeScript test stack, and no new dependencies.                                                             | No scoped gap. |
| Testing and QA automation                | `5/5`          | Unit coverage prevents active admin tab drift; e2e Help/Guide assertions updated; `verify:pre-pr`, CI, and `verify:pre-merge` passed.                          | No scoped gap. |
| DevOps and rollback readiness            | `5/5`          | Small reversible UI/copy/test diff; rollback is `git revert e707d0b4`; merge-preflight passed.                                                                 | No scoped gap. |

## Checkpoint Log

- `2026-06-18 | planned | created from post-merge admin dashboard re-audit finding: Help/Guide is the clearest bounded next child because it is too long for quick operator use while mobile nav and Analytics density remain separate follow-ups | next: owner reviews/approves or edits this brief before implementation`
- `2026-06-18 | in-progress | owner approved implementation; branch admin-help-guide-quick-reference created from main@1426cc84; scope remains Help/Guide quick-reference with mobile nav, Analytics density, lesson-editor polish, and data/auth/API changes out of scope | next: inspect AdminHelpCenter structure and implement compact tab/recovery guidance`
- `2026-06-18 | screenshot-handoff-ready | implemented quick-reference-first Help/Guide, active-tab coverage contract, collapsed long-form detail sections, targeted unit/e2e assertion updates, route/label/support sweep, and before/after screenshots at output/admin-help-guide-quick-reference-2026-06-18-130232; targeted unit/type/lint/diff checks pass, with Playwright e2e skipped by known local dev-login/Supabase egress blocker | next: owner reviews screenshot handoff before npm run verify:pre-pr`
- `2026-06-18 | screenshot-approved | owner approved screenshot handoff at output/admin-help-guide-quick-reference-2026-06-18-130232; no product-rendering files changed after final capture, only this brief checkpoint was updated | next: run npm run verify:pre-pr, then commit, push, and open PR`
- `2026-06-18 | pre-pr-pass | npm run verify:pre-pr passed on the Help/Guide runtime/test diff: lint, typecheck, unit, build, perf budget, and full Playwright gate passed; Playwright reported 110 passed and 568 skipped under the known local dev-login/Supabase egress blocker; perf-budget trend remains hold for this UI PR and should be handled as a separate perf-maintenance slice | next: restage final brief checkpoint, commit, push, and open PR`
- `2026-06-18 | merged | PR #1155 was squash-merged as e707d0b4 after all required GitHub checks, npm run verify:pre-merge, and merge-preflight passed; post-merge preflight surfaced this repo-managed docs-only closeout | next: validate, PR, and auto-merge the docs-only closeout if all closeout gates pass`
