# Task Brief: AW-006 Install App Prompt Feedback Semantics (10/10)

## Metadata

- `id`: `2026-05-25-aw-006-install-app-prompt-feedback-semantics-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-25`
- `updated`: `2026-05-25`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-install-app-prompt-feedback-semantics`
- `execution_mode`: `owner-approved implementation slice; screenshot handoff required before broad gates`

## Brief Audit Record

- `last_audited`: `2026-05-25`
- `base`: `main@8e1476f`
- `audit_status`: `ready`
- `decision`: Execute the approved bounded `AW-006 Install App Prompt Feedback Semantics` slice now.
- `reason`: PR `#849` and repo-managed closeout PR `#850` left no active AW-006 implementation slice. A fresh queue/design/code re-audit found install-app feedback in `app/course/page.tsx` and `components/MenuDrawer.tsx` still renders as local plain text/instruction panels while adjacent course/member feedback slices now use clearer accessible status/error contracts.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, course install prompt behavior, `MenuDrawer`, `InstallProvider`, install prompt tests, screenshot handoff rules, forward compatibility rules, or verification lanes change before screenshot handoff.

## Goal

Make course and main-menu install-app feedback easier to understand and more accessible while preserving existing PWA install detection, native prompt behavior, local prompt cadence, course progress, navigation, and platform-specific instructions.

## Pre-Implementation Owner Explanation

Jeg skal rydde statusene rundt `Install app` i kurset og hovedmenyen. Det betyr at brukeren får tydelig beskjed når installering lykkes, blir avvist, ikke støttes, eller krever iPhone/Mac Safari-steg. Utenfor scope er PWA-reglene, kursprogresjon, localStorage-cadence, native installprompt, navigasjon og bred redesign.

Fremoverkompatibilitet: feedbacken skal følge install-resultatene fra den eksisterende install-konteksten, ikke dagens konkrete nettlesere alene. Nye plattformer eller install-resultater må enten bruke en trygg generisk fallback eller få en eksplisitt mapping med test før release.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Reliability and failure handling`
- `Privacy and compliance`
- `Content governance`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                             | Evidence                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Course auto-prompt and main-menu install entry keep the same jobs: install when possible, show manual platform guidance when needed, or fail softly.           | focused tests + screenshot handoff          | `5/5`                   |
| UX flow clarity                               | `target`     | Accepted, dismissed, unsupported, iOS instructions, Mac Safari instructions, and already-installed outcomes each show one clear next step near the action.     | focused tests + screenshot handoff          | `5/5`                   |
| Visual design quality                         | `target`     | Feedback uses the current course prompt and drawer visual language without expanding the prompt into a redesign or adding noisy decoration.                    | before/after screenshot artifacts + diff    | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Existing install result handling, `beforeinstallprompt` use, installed-state suppression, local prompt cadence, and course completion trigger remain intact.   | focused tests + diff review                 | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice touches no admin editor, admin CRUD, publishing workflow, operator workflow, or admin note surface.                                     | explicit admin scope rationale              | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Dynamic install outcomes use status semantics, platform instruction panels have stable descriptions, and unsupported/error-like feedback remains announced.    | Testing Library/Playwright role assertions  | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: this adds no dependency, route fetch, asset, polling loop, storage write, or heavy client library.                                            | no-dependency diff + broad gates later      | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Install feedback remains transient UI state; existing local prompt cadence/install detection stays local-only and is not treated as server-canonical truth.    | data-boundary review + tests                | `5/5`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because this changes no route cache mode, fetch cache, revalidation, invalidation behavior, CDN behavior, or stale-data policy.                            | explicit cache scope rationale              | `N/A`                   |
| Reliability and failure handling              | `target`     | Unsupported install, dismissed native prompt, already-installed state, and platform-guidance fallbacks remain deterministic and non-blocking.                  | focused failure/fallback tests              | `5/5`                   |
| Security and authz                            | `supporting` | Supporting only: course access, auth, private gate, and install APIs remain unchanged; feedback exposes no raw diagnostics or secrets.                         | diff review + unchanged auth/API paths      | `4/5`                   |
| Privacy and compliance                        | `target`     | Feedback exposes only local browser capability/outcome and no user identifiers, entitlement details, raw diagnostics, secrets, or analytics payloads.          | copy/error review                           | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue and notice/empty-state inventory record this active install feedback slice and avoid stale selected-slice wording.                      | docs diff + brief lint                      | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin role, workflow action, status, mutation, Help/Guide surface, or operator editability path changes.                                        | explicit admin-workflow scope rationale     | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public metadata, sitemap, robots, canonical URL, structured data, or crawlable course content.                                     | explicit SEO scope rationale                | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity model, structured data, or AI-facing documentation contract.                                              | explicit AI-discoverability scope rationale | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: existing install events/tests remain unchanged; no new taxonomy, dashboard, KPI, consent behavior, or vendor instrumentation is introduced.   | analytics scope review                      | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no pricing, checkout, portal, entitlement, Stripe object, invoice, refund, payout, or revenue report.                                 | explicit commerce scope rationale           | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A with scope rationale: this changes no incident alert path, support workflow, operator diagnostics, runbook procedure, support escalation, or on-call flow. | explicit support-ops scope rationale        | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, or revenue data.           | explicit finance scope rationale            | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: touched English install strings stay short, platform-specific, and isolated so later locale workflows can map them deliberately.              | copy/layout review                          | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `MenuDrawer`, `/course` install prompt state, `InstallProvider`, existing Tailwind/PressButton patterns, and focused tests; add no dependency.           | changed-files/dependency diff               | `5/5`                   |
| Testing and QA automation                     | `target`     | Focused install prompt coverage, brief lint, route/label/support sweep, screenshot handoff, pre-PR gate, CI, and pre-merge gate cover changed scope.           | test commands + screenshot artifacts        | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: feedback rendering adds no service call, database query, asset, polling loop, background job, or traffic-dependent infrastructure cost.       | implementation review                       | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert rollback; no migrations, env changes, package changes, workflow changes, generated assets, provider settings, or production settings.        | git diff + validation evidence              | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces: recent AW-006 route-owned feedback semantics in `CourseOpenOnPhoneCard`, `CourseProgressSyncStatus`, and `CommerceActionFeedback`.
  - Keep existing client component ownership in `app/course/page.tsx`, `components/MenuDrawer.tsx`, and `components/install/install-context.tsx`.
  - Do not change route boundaries, server components, course data loading, auth, private gate, or navigation.
- TypeScript/domain contracts:
  - Preserve `InstallRequestResult`, `requestInstall`, `canInstall`, `isInstalled`, and local prompt timing behavior.
  - Add only presentation semantics and stable local feedback mapping if needed.
- Supabase/data layer:
  - N/A; no migration, RLS/authz, generated type, storage, index, or Supabase query behavior changes.
- External services/tools:
  - N/A; no app manifest, service worker, provider setting, SDK, secret, webhook, retry, idempotency, Stripe, Supabase, email, or analytics vendor change.
- UI system:
  - Use existing course prompt and drawer card styling.
  - Do not create a broad app-wide Notice primitive in this slice.
  - Screenshot handoff comparison type: `before/after` for representative course install prompt and main-menu install feedback states.
- Testing:
  - Extend focused install prompt tests around role/live-region/feedback semantics.
  - Keep existing PWA/install behavior tests as the behavior guard.

## Data Placement And Sync Contract

Install outcome feedback stays local-only, transient React state in the owning UI. Existing browser-local prompt cadence and installed-state detection remain unchanged. No server-canonical data, persistence model, sync, conflict resolution, retention rule, or cache invalidation behavior is added.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename/repurpose rule, alias, redirect, or migration behavior. Existing install labels and route labels remain unchanged except for feedback semantics around current labels.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Touched: install outcome feedback for course contextual prompt and main-menu install action.
  - Not touched: install provider detection, app manifest, service worker, course content, route labels, analytics taxonomy, auth, Help/Guide, or support procedures.
- Source of truth:
  - Install outcomes derive from the typed `InstallRequestResult` returned by `requestInstall`.
- Additive behavior:
  - Existing outcomes (`accepted`, `dismissed`, `ios-instructions`, `mac-safari-instructions`, `already-installed`, `unsupported`) keep working through a shared local feedback mapping.
- Explicit mapping requirements:
  - New install outcomes, platform-specific instructions, analytics events, Help/Guide promises, or support procedures require explicit code/test/doc review before release.
- Unknown or deprecated values:
  - Unknown install failures must fall back to safe generic install-unavailable copy and must not expose raw browser diagnostics.
- Test/evidence:
  - Focused tests assert visible feedback/instruction semantics while preserving the native prompt path, manual platform instructions, unsupported fallback, and installed-state suppression.

## Help / Guide Impact

N/A with rationale: this changes only feedback semantics for existing install actions. It does not change Help/Guide content, workflow labels, support procedures, install availability promises, entitlement rules, operator instructions, auth, payments, or admin procedures.

## Route / Label / Support Surface Sweep

Required as a targeted route/label/support-surface-impact-sweep because this slice changes user-facing feedback semantics on `/course` and the main menu.

- Identifiers searched:
  - `Install app`
  - `installPromptFeedback`
  - `showInstallIosGuide`
  - `showInstallMacSafariGuide`
  - `showInstallSuccessNotice`
  - `install-app-menu-action`
  - `a2hs-auto-prompt`
  - `Install on iPhone/iPad`
  - `Install on Mac (Safari)`
  - `Browser support varies`
  - `App installed.`
  - `Install is not available`
  - `aria-live`
  - `role="status"`
- Directories/surfaces checked:
  - `app/`
  - `components/`
  - `tests/`
  - `docs/`
  - `docs/runbooks/`
  - canonical AW-006 queue
  - notice/empty-state inventory
- Expected fallout:
  - Course install prompt, main menu install card, focused install tests, active brief, canonical AW-006 queue, notice inventory, and screenshot artifacts only.
  - No service worker, app manifest, course content/player/progress, auth, analytics, Help/Guide, support-procedure, commerce, or admin workflow fallout.

## Scope

- Improve install-app feedback presentation and accessibility semantics in:
  - `app/course/page.tsx`
  - `components/MenuDrawer.tsx`
- Preserve:
  - `InstallProvider` behavior,
  - native prompt behavior,
  - manual iOS/Mac Safari instruction behavior,
  - local prompt cadence and dismissal behavior,
  - course completion/progress behavior,
  - navigation and route labels.
- Add focused test coverage for changed semantics and unchanged behavior.
- Update the canonical AW-006 queue and notice/empty-state inventory.
- Capture required screenshot handoff before broad gates.

## Out Of Scope

- App manifest, service worker, PWA install detection rules, localStorage cadence, analytics taxonomy, course progress, course content/player/navigation, auth, private gate, Help/Guide, support procedures, Supabase, Stripe, commerce, broad design-system primitives, app-wide notice components, package changes, and merge without explicit owner approval.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves or waives screenshot review.

## Acceptance Criteria

1. Course contextual install prompt success/unsupported feedback uses accessible status semantics without changing install behavior.
2. Course contextual iOS and Mac Safari instruction states keep existing manual steps and are associated with the prompt action state.
3. Main-menu install feedback uses the same local feedback semantics for unsupported, dismissed, accepted, already-installed, and platform-instruction outcomes.
4. Existing native prompt, installed-state suppression, local prompt cadence, and course completion trigger behavior remain covered.
5. Canonical AW-006 queue and notice/empty-state inventory record this active slice.
6. Screenshot handoff is captured and approved before `npm run verify:pre-pr`.

## Validation

Targeted before screenshot handoff:

- `./node_modules/.bin/vitest run tests/unit/install-context.test.ts tests/unit/install-rules.test.ts`
- `npx playwright test tests/e2e/install-prompt.spec.ts --project=desktop-chromium --project=mobile-chromium`
- `npm run typecheck`
- `npm run lint:briefs:all`
- `npm run lint:quality-gates`
- `git diff --check`
- targeted route/label/support sweep for install prompt identifiers

Current evidence before owner screenshot approval:

- `./node_modules/.bin/vitest run tests/unit/install-context.test.ts tests/unit/install-rules.test.ts` -> PASS, 2 files / 6 tests.
- `npx playwright test tests/e2e/install-prompt.spec.ts --project=desktop-chromium --project=mobile-chromium` -> PASS, 7 passed / 9 existing desktop skips.
- `npm run typecheck` -> PASS after clearing stale generated Next dev route types.
- `npm run lint` -> PASS with one pre-existing warning in `output/capture-aw006-dryland-feedback.mjs`.
- `npm run lint:briefs:all` -> PASS.
- `npm run lint:quality-gates` -> PASS.
- `git diff --check` -> PASS.
- Targeted route/label/support sweep for install prompt identifiers -> PASS; no Help/Guide or support-surface fallout for this scoped label/feedback update.

Visual gate:

- Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
- Capture representative `before/after` screenshots against `http://127.0.0.1:3000`.
- Screenshot artifacts folder: `output/aw-006-install-app-feedback-20260525-182641`.
- Screenshot files: `before-main-menu-install-unsupported-mobile.png`, `after-main-menu-install-unsupported-mobile.png`, `before-course-install-success-mobile.png`, `after-course-install-success-mobile.png`.
- Owner screenshot approval stop: owner approved the screenshot handoff in chat on `2026-05-25`; continue with `npm run verify:pre-pr`, PR creation, and `npm run verify:pre-merge`.

## 10/10 Quality Bar

- UX clarity: every install outcome gives one direct status or recovery message near the action.
- Required UI states: native accepted, native dismissed, unsupported, iOS instructions, Mac Safari instructions, and already installed.
- Accessibility: status semantics, stable descriptions, keyboard-reachable actions, and no hidden action-only recovery.
- Performance: no new dependency, fetch, asset, polling loop, or persistent client state.
- Visual consistency: course prompt and drawer card styling remain compact and consistent.
- Business logic correctness: existing install provider, native prompt, local prompt cadence, and installed-state behavior stay deterministic.

## Implementation Checkpoint Log

- `2026-05-25 | in-progress | owner approved AW-006 Install App Prompt Feedback Semantics after clean main@8e1476f and fresh queue/design/code re-audit; created branch aw-006-install-app-prompt-feedback-semantics and this active brief | next: update queue/inventory, implement install feedback semantics, run targeted tests, then capture screenshot handoff before broad gates`
- `2026-05-25 | in-progress | implemented shared install feedback status component, wired course/main-menu install feedback and platform guides, added focused install prompt tests, and captured before/after screenshots in output/aw-006-install-app-feedback-20260525-182641 after targeted gates passed | next: owner screenshot approval or visual corrections before verify:pre-pr/PR`
- `2026-05-25 | in-progress | owner approved screenshot handoff in chat after reviewing output/aw-006-install-app-feedback-20260525-182641 | next: run verify:pre-pr, commit, push, and open PR`
- `2026-05-25 | in-progress | npm run verify:pre-pr passed full lane after screenshot approval; unit, build, perf budgets, and e2e passed with expected skips | next: commit, push, open PR, monitor CI, and run verify:pre-merge`
