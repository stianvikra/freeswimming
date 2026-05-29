# Task Brief: AW-006 Course Install Prompt Token And Action Hierarchy Parity (10/10)

## Metadata

- `id`: `2026-05-29-aw-006-course-install-prompt-token-action-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-29`
- `updated`: `2026-05-29`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `related_parent_brief`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `execution_mode`: `owner-approved implementation slice; visual screenshot approval stop applies before pre-PR/PR/pre-merge gates`

## Brief Audit Record

- `last_audited`: `2026-05-29`
- `base`: `main@860400a`
- `audit_status`: `ready`
- `decision`: Execute this as the current AW-006 PR-sized visual slice through screenshot handoff.
- `reason`: PR `#892` Course Support Card Token And Action Hierarchy Parity and repo-managed closeout PR `#893` are merged; `main` was clean and synced at `860400a`; `npm run post-merge:preflight` passed with no pending closeout. A fresh queue/design/code re-audit found no active AW-006 implementation slice selected and found the `/course` contextual `Install app` prompt still using bespoke rounded card, radial background, and gradient button styling while adjacent course backup prompt, course support card, Menu Drawer, auth, and My Library surfaces use the current AW-006 token/action hierarchy. The owner approved this slice by saying `godkjent`.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/course` install prompt behavior, `InstallProvider`, `InstallFeedback`, install prompt tests, screenshot handoff rules, forward compatibility rules, or verification lanes change before screenshot handoff.

## Goal

Align the `/course` contextual `Install app` prompt with current AW-006 token/card/action hierarchy while preserving existing PWA install behavior, local prompt cadence, platform instructions, and course progress flow.

## Pre-Implementation Owner Explanation

For ikke-programmerer: Vi rydder den lille `Install app`-boksen som dukker opp i kurset etter at en leksjon er fullført.

Hvorfor det betyr noe: Den fungerer allerede, men ser fortsatt mer lokal og gammel ut enn de nye kurskortene og knappene. Dette gjør kurset mer helhetlig uten å endre hva installering faktisk gjør.

Utenfor scope: Vi endrer ikke PWA-regler, native installprompt, service worker, manifest, localStorage-cadence, kursprogresjon, drawer, analytics, Help/Guide, supportflyt eller bred kursdesign.

Fremoverkompatibilitet: Nye install-resultater skal fortsatt komme fra eksisterende install-kontekst og `InstallFeedback`. Nye plattformer eller install-resultater krever eksplisitt mapping, trygg fallback og test før release.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Data placement and sync boundaries`
- `Reliability and failure handling`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                                                                        | Evidence                                                 | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/course` still offers the same contextual install job after the same lesson-completion conditions, with the same platform-specific next steps.                                                                                                           | focused install prompt flow + code review                | `5/5`                   |
| UX flow clarity                               | `target`     | Install, not-now, done, unsupported, accepted, dismissed, iOS, and Mac Safari states keep one clear next step near the prompt action.                                                                                                                     | focused Playwright + before/after screenshots            | `5/5`                   |
| Visual design quality                         | `target`     | Prompt uses current AW-006 token/card/action classes where practical instead of bespoke rounded card, radial prompt shell, and gradient/ring button styling; no prompt-internal text/action overlap while preserving the existing fixed overlay position. | screenshot handoff + class/diff review                   | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Existing `InstallProvider` result handling, `beforeinstallprompt`, installed suppression, local prompt cadence, completion trigger, and dismissal persistence remain unchanged.                                                                           | focused tests + unchanged storage/API diff               | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes no admin editor, content CRUD, publishing workflow, operator queue, notes, QR Registry, email-template surface, or admin route.                                                                                            | explicit admin-editor scope rationale                    | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Dynamic feedback remains announced via `InstallFeedback`; prompt controls keep accessible names, focus rings, touch targets, contrast, and `aria-describedby` behavior.                                                                                   | Playwright role/attribute assertions + screenshot review | `5/5`                   |
| Accessibility                                 | `target`     | Closeout validation alias for the same accessibility gate above; install prompt controls and feedback remain accessible and named.                                                                                                                        | Playwright role/attribute assertions + screenshot review | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: no new dependency, asset, route fetch, polling loop, storage write, or meaningful JS payload growth is planned.                                                                                                                          | dependency diff + pre-PR gate later                      | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Install feedback remains transient local UI state; existing prompt cadence and installed-state detection stay browser-local and no server-canonical state is added.                                                                                       | data-boundary review + unchanged storage keys            | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this changes no route cache mode, course content fetch, API response, revalidation, CDN behavior, or invalidation behavior.                                                                                                                   | explicit cache scope rationale                           | `N/A`                   |
| Reliability and failure handling              | `target`     | Unsupported install, dismissed native prompt, already-installed state, success confirmation, and platform guidance remain deterministic and non-blocking.                                                                                                 | focused fallback tests + changed-files review            | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: course access, auth, private gate, and install APIs remain unchanged; feedback exposes no raw browser diagnostics, secrets, tokens, or identifiers.                                                                                      | diff review + unchanged auth/API paths                   | `4/5`                   |
| Privacy and compliance                        | `target`     | Feedback exposes only local browser capability/outcome and no user identifiers, entitlement details, raw diagnostics, secrets, or analytics payloads.                                                                                                     | copy/error review                                        | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this active brief, and notice/empty-state inventory record the selected slice without stale active-slice references.                                                                                                              | docs diff + brief lint                                   | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin role, workflow action, status, mutation, Help/Guide surface, or operator editability path changes.                                                                                                                                   | explicit admin-workflow scope rationale                  | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no metadata, sitemap, robots, canonical URL, structured data, public route availability, or crawlable course content.                                                                                                            | explicit SEO scope rationale                             | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no public semantic content model, structured data, crawl-safe entity page, or AI-facing documentation contract.                                                                                                                  | explicit AI-discoverability scope rationale              | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this changes no analytics event taxonomy, payload, persistence, dashboard, KPI definition, attribution, or consent behavior.                                                                                                                  | explicit analytics scope rationale                       | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no pricing, checkout, portal, entitlement, Stripe object, invoice, refund, payout, or revenue report.                                                                                                                            | explicit commerce scope rationale                        | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support workflow, operator diagnostics, runbook procedure, support escalation, or on-call flow.                                                                                                                 | explicit support-ops scope rationale                     | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, revenue recognition data, or reporting operation.                                                                             | explicit finance scope rationale                         | `N/A`                   |
| i18n operational readiness                    | `target`     | Existing English install strings remain short and layout-safe under tokenized cards/actions without fixed-width assumptions that block later localization.                                                                                                | mobile/desktop screenshot text-fit review                | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing `/course` component boundary, `InstallFeedback`, `PressButton`, and AW-006 CSS tokens; add no dependency or broad primitive.                                                                                                               | changed-files/dependency diff                            | `5/5`                   |
| Testing and QA automation                     | `target`     | Focused install prompt coverage, brief lint, route/label/support sweep, screenshot handoff, and later gates cover changed scope.                                                                                                                          | focused Playwright + brief lint + screenshot artifacts   | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: visual class changes add no backend polling, storage, image pipeline, scheduled job, third-party call, or traffic-dependent infrastructure cost.                                                                                         | implementation review                                    | `4/5`                   |
| DevOps and rollback readiness                 | `supporting` | Supporting only: rollback is a normal component/test/docs revert with no migration, config, secret, package, workflow, or deployment setting change.                                                                                                      | git diff + screenshot artifacts + later gate logs        | `4/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep the existing `/course` client component boundary and `InstallProvider` interaction.
  - Do not change course route boundaries, course content loading, auth, private gate, server actions, route cache, or navigation.
- TypeScript/domain contracts:
  - Preserve `InstallRequestResult`, `requestInstall`, `canInstall`, `isInstalled`, local prompt timing, and platform instruction mapping.
  - Add only presentation classes unless focused tests require class/assertion updates.
- Supabase/data layer:
  - N/A; no migration, RLS/authz rule, generated DB type, query, storage, index, or data access change.
- External services/tools:
  - N/A; no app manifest, service worker, provider setting, SDK, secret, webhook, retry, idempotency, Stripe, Supabase, email, or analytics vendor change.
- UI system:
  - Reference surfaces: course backup prompt token/action parity, course support card token/action parity, Menu Drawer install card, auth sign-in token shell, and `InstallFeedback`.
  - Reuse `fs-library-card`, `fs-library-card-muted` or `fs-library-card-accent`, `fs-cta-primary`, `fs-cta-secondary`, `PressButton`, and `InstallFeedback` where practical.
  - Screenshot handoff type: `before/after` for `/course` contextual install prompt on mobile and desktop.
- Testing:
  - Reuse/update `tests/e2e/install-prompt.spec.ts`.
  - Add unit/component coverage only if implementation extracts new helper constants or contracts.

## Data Placement And Sync Contract

Install outcome feedback stays local-only, transient React state in the owning UI. Existing browser-local prompt cadence, installed-state detection, and dismissal persistence remain unchanged. No server-canonical data, persistence model, sync, conflict resolution, retention rule, or cache invalidation behavior is added.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename/repurpose rule, alias, redirect, or migration behavior. Existing install labels and route labels remain unchanged except for visual hierarchy around current labels.

## Forward Compatibility Contract

- Extensibility surfaces touched:
  - Course contextual install prompt states and local feedback presentation.
- Source of truth:
  - Install outcomes continue to derive from the typed `InstallRequestResult` returned by `requestInstall`.
- Additive behavior:
  - Existing outcomes (`accepted`, `dismissed`, `ios-instructions`, `mac-safari-instructions`, `already-installed`, `unsupported`) keep working through the existing local feedback/instruction state.
- Explicit mapping requirements:
  - New install outcomes, platform-specific instructions, analytics events, Help/Guide promises, or support procedures require explicit code/test/doc review before release.
- Unknown or deprecated values:
  - Unknown install failures must fall back to safe generic install-unavailable copy and must not expose raw browser diagnostics.
- Test/evidence:
  - Focused Playwright asserts visible feedback/instruction semantics while preserving the native prompt path, manual platform instructions, unsupported fallback, and installed-state suppression.

## Help / Guide Impact

N/A with rationale: this changes only visual/action hierarchy for existing install feedback. It does not change Help/Guide content, workflow labels, support procedures, install availability promises, entitlement rules, operator instructions, auth, payments, or admin procedures.

## Route / Label / Support Surface Sweep

Required before broad gates because this slice changes user-facing presentation on `/course`.

- Identifiers searched/to search:
  - `Install app`
  - `a2hs-auto-prompt`
  - `course-install-prompt-feedback`
  - `course-install-ios-guide`
  - `course-install-mac-safari-guide`
  - `installPromptFeedback`
  - `showInstallIosGuide`
  - `showInstallMacSafariGuide`
  - `Install on iPhone/iPad`
  - `Install on Mac (Safari)`
  - `App installed.`
  - `Install is not available`
- Surfaces checked/to check:
  - `app/course/page.tsx`
  - `components/install/InstallFeedback.tsx`
  - `components/install/install-context.tsx`
  - `components/MenuDrawer.tsx`
  - `tests/e2e/install-prompt.spec.ts`
  - `tests/e2e/mobile-nav.spec.ts`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/task-briefs/done/`
  - `docs/runbooks/`
- Expected fallout:
  - implementation/test/docs updates are limited to `/course` install prompt presentation, focused install tests, this active brief, the AW-006 queue, and design inventory.
  - No service worker, app manifest, install provider behavior, course content/player/progress, auth, analytics, Help/Guide, support procedure, commerce, or admin workflow fallout unless implementation discovers label/support changes.
- Sweep execution evidence (`2026-05-29`):
  - Ran the listed identifiers across `app`, `components`, `tests`, and `docs`.
  - Findings were limited to the expected `/course` prompt implementation, install/Menu Drawer tests, design inventory, and task briefs.
  - No Help/Guide, support runbook, admin, commerce, analytics, service worker, manifest, or install-provider fallout was found.

## Scope

- `/course` contextual `Install app` prompt card/action hierarchy:
  - prompt shell,
  - platform instruction states,
  - success/unsupported feedback placement,
  - `Install app`, `Not now`, and `Done` actions.
- Focused assertions for unchanged install prompt behavior and token/action adoption.
- Canonical AW-006 queue and design inventory updates.
- Before/after screenshot handoff artifacts during implementation.

## Out Of Scope

- App manifest, service worker, PWA install detection rules, `InstallProvider` behavior, localStorage cadence, analytics taxonomy, course progress, course content/player/navigation, auth, private gate, Help/Guide, support procedures, Supabase, Stripe, commerce, broad design-system primitives, app-wide notice components, package/config/workflow changes, and merge without explicit owner approval.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves screenshots.

## Acceptance Criteria

1. Course contextual install prompt appears under the existing trigger conditions and not because of a new trigger.
2. Prompt uses current AW-006 token/card/action classes instead of bespoke rounded card, radial prompt shell, and gradient/ring button styling where practical.
3. `Install app`, `Not now`, and `Done` keep existing behavior and accessible names.
4. iOS and Mac Safari instruction states keep the existing manual steps and remain associated with the prompt state.
5. Accepted, dismissed, unsupported, and already-installed outcomes keep existing `InstallProvider` behavior and local feedback semantics.
6. Existing native prompt, installed-state suppression, local prompt cadence, and course completion trigger behavior remain covered.
7. Mobile and desktop screenshots show no text overlap, incoherent nested-card feel, or broken button spacing.
8. No service worker, manifest, route, API, course data, auth, analytics, Help/Guide, support, Supabase, Stripe, entitlement, package, config, or workflow behavior changes are introduced.
9. Focused tests and before/after screenshot handoff are completed before broad gates.
10. Work stops after screenshot handoff until owner approval.

## Validation

Targeted during implementation:

- `npm run lint:briefs`
- `npm run lint:quality-gates`
- `npm run typecheck`
- `npx playwright test tests/e2e/install-prompt.spec.ts --project=desktop-chromium --project=mobile-chromium`
- targeted route/label/support sweep with identifiers listed above
- `git diff --check`

Executed before screenshot handoff:

- `npm run typecheck`: pass.
- `npm run lint:quality-gates`: pass.
- `npm run lint:briefs:all`: pass for the new untracked active brief and existing brief corpus.
- `npx playwright test tests/e2e/install-prompt.spec.ts --project=desktop-chromium --project=mobile-chromium`: pass, `7 passed`, `9 skipped` by existing project guards.
- Targeted route/label/support sweep: pass, expected hits only.
- `git diff --check`: pass after final brief evidence update.

Visual gate:

- artifact folder: `output/aw006-course-install-prompt-token-parity-YYYY-MM-DD-HHMMSS`
- comparison type: `before/after`
- representative filenames:
  - `before-course-install-prompt-mobile-390.png`
  - `after-course-install-prompt-mobile-390.png`
  - `before-course-install-prompt-desktop-1440.png`
  - `after-course-install-prompt-desktop-1440.png`

After owner screenshot approval:

- `npm run verify:pre-pr`
- CI required checks green
- `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS/npm available through the repo's normal `nvm use --silent` path.
- Visual/dev-server commands use the repo's escalation-first convention.

## Checkpoint Log

- `2026-05-29 | in-progress | owner approved Course Install Prompt Token And Action Hierarchy Parity after fresh queue/design/code re-audit from clean main@860400a; created branch aw-006-course-install-prompt-token-parity and this active brief | next: capture before screenshots, implement scoped prompt token/action parity, run targeted validation, and capture after screenshots before broad gates`
- `2026-05-29 | implementation | aligned the /course contextual install prompt with fs-library-card, fs-cta-primary/fs-cta-secondary, shared PressButton action classes, and token-rounded InstallFeedback panels while preserving InstallProvider outcomes, prompt cadence, local storage keys, course progress, app manifest, service worker, analytics, Help/Guide, support, and admin scope | next: complete screenshot handoff before npm run verify:pre-pr`
- `2026-05-29 | validation | npm run typecheck, npm run lint:quality-gates, npm run lint:briefs:all, targeted install-prompt Playwright, route/label/support sweep, and git diff --check passed; Playwright result after final visual adjustment was 7 passed and 9 skipped by existing project guards | next: owner screenshot approval stop`
- `2026-05-29 | screenshot-review | before/after mobile and desktop screenshots captured in output/aw006-course-install-prompt-token-parity-2026-05-29-131049 after owner flagged the first after-state as too transparent; the prompt now keeps near-before opacity while retaining token-backed card/actions; no product-rendering files changed after this capture, only this evidence note was updated | next: continue through npm run verify:pre-pr, PR, CI, npm run verify:pre-merge, and merge under owner pre-approval`
