# Task Brief: Home Routines And My Library Semantics (10/10)

## Metadata

- `id`: `2026-05-12-home-routines-library-semantics-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-12`
- `updated`: `2026-05-12`

## Goal

Make the signed-in Home page surface daily routines in one click while making My Library freshness copy describe newly published lessons, not vague `updated` content.

## Product Decision

For signed-in users, Home should expose `My routines` directly under `Free course` because routines are a repeated daily action and should not require opening generic My Library first. Anonymous users should not see a second sign-in CTA for routines in this slice.

The My Library notice should keep using the existing freshness signal, but the visible semantics should be precise: it announces new course lessons since the learner baseline or seen signature. It should not imply all content changes or edited existing content are `new`.

## Relevance Assessment Before Scoring

Relevant target categories are Home IA, signed-in UX flow clarity, visual quality, accessibility, local/server data boundaries for freshness state, auth-gated routing, testing, and rollback. Admin CRUD, commerce, finance, SEO, and AI discoverability are not primary because this slice changes authenticated Home/My Library navigation and private notice copy only.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- Product goals and IA
- UX flow clarity
- Visual design quality
- Business logic correctness and data integrity
- Accessibility (a11y)
- Security and authz
- Testing and QA automation

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                             | Evidence                                           | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Signed-in Home exposes routines directly under Free Course, and My Library freshness wording has one clear meaning: new lessons.               | route/component tests + screenshot handoff         | `5/5`                   |
| UX flow clarity                               | `target`     | A signed-in learner can reach routines from Home in one click; anonymous Home remains browse-first without duplicate routine login friction.   | e2e entrypoint coverage + screenshot handoff       | `5/5`                   |
| Visual design quality                         | `target`     | The new Home entrypoint follows existing `ActionButton` rhythm and does not crowd the first screen on mobile or desktop.                       | before/after screenshot handoff                    | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Routine entrypoint visibility is based only on authenticated server user state; new-lesson notice keeps deterministic seen-signature behavior. | unit tests + code review                           | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because no admin edit, publish, dashboard, or operator workflow changes in this slice.                                                     | explicit scope rationale                           | `N/A`                   |
| Accessibility (a11y)                          | `target`     | New Home action is keyboard reachable, labeled by visible text, and existing notice controls keep accessible names and status semantics.       | Testing Library/e2e assertions + screenshot review | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Home does not add client state, new dependency, or heavy payload; `/` remains within existing core-route performance expectations.             | dependency diff + build/perf gate                  | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Server auth decides Home routine visibility; localStorage remains limited to seen new-lesson signatures and never becomes content truth.       | brief contract + helper tests                      | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: Home is already dynamic for auth-aware CTA and new-content signal remains no-store.                                           | route/cache review                                 | `4/5`                   |
| Reliability and failure handling              | `target`     | Missing/failed new-content signal keeps My Library usable with retry state; anonymous Home never renders a broken routines link.               | existing/updated e2e + unit tests                  | `5/5`                   |
| Security and authz                            | `target`     | Authenticated-only Home routines entrypoint must not expose protected data; protected My Library routes still enforce auth server-side.        | auth route review + e2e entrypoint behavior        | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: no new personal data, cookies, local identifiers, or analytics payload fields are introduced.                                 | code/event review                                  | `4/5`                   |
| Content governance                            | `target`     | Notice language aligns to canonical published lesson availability rather than editorial update noise.                                          | helper tests + copy review                         | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow, editability, status, role, or Help/Guide admin action changes.                                                  | explicit scope rationale                           | `N/A`                   |
| SEO and crawlability                          | `supporting` | Supporting only: public Home remains crawlable and anonymous-first; signed-in-only CTA should not change public metadata or sitemap behavior.  | metadata/sitemap no-change review                  | `4/5`                   |
| AI discoverability                            | `N/A`        | N/A because this slice adds no public structured data, crawl-facing AI docs, or semantic entity pages.                                         | explicit scope rationale                           | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: existing new-content events remain valid; no new analytics taxonomy is required for the Home link in this small slice.        | analytics contract review                          | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because no checkout, pricing, entitlement, product catalog, refund, payout, or revenue operation changes.                                  | explicit scope rationale                           | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A because this private navigation/copy slice adds no critical support recovery path, operator alert, or incident runbook burden.             | explicit scope rationale                           | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice has no finance, invoice, payout, subscription, entitlement reconciliation, or reporting impact.                         | explicit scope rationale                           | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: changed Home and notice copy stays concise and localizable without hard-coded locale-dependent formatting.                    | copy review                                        | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing `ActionButton`, Home auth boundary, My Library notice helpers, Tailwind tokens, and current test stack; add no dependency.      | dependency diff + architecture review              | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit/e2e coverage protects Home signed-in/anonymous entrypoint and notice semantics; visual screenshot approval precedes broad PR gates.       | targeted tests + screenshot handoff + verify gates | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: entrypoint is static render markup under existing auth lookup; no polling, fan-out, or background job is introduced.          | implementation review                              | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback is a small revert of Home/copy/test changes with no migration or persisted data repair required.                                      | PR summary + pre-pr/pre-merge gates                | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `app/page.tsx` server-side auth user resolution already used for My Library CTA,
  - reuse `ActionButton` for Home hierarchy instead of creating new Home card markup,
  - deep-link routines to the existing My Library routines section unless a dedicated routine route already exists.
- TypeScript/domain contracts:
  - preserve `MyLibraryCourseSignal`, `MyLibrarySeenState`, and `resolveNewContentDecision` contracts,
  - add semantic helper copy only where it describes existing deterministic signal states.
- Supabase/data layer:
  - no schema, RLS, generated type, or migration changes expected,
  - protected My Library routes remain the server-side auth boundary.
- UI system:
  - reference surface: current Home `ActionButton` stack and existing My Library `TodayTabsPanel`,
  - Home routines entrypoint should sit immediately after `Free course` for signed-in users,
  - screenshot handoff is before/after for Home and after/reference for My Library notice semantics if a deterministic notice state is captured.
- Testing:
  - unit coverage for notice helper semantics,
  - component/e2e coverage for routines panel and Home entrypoint,
  - screenshot handoff before `npm run verify:pre-pr`.

## Data Placement And Sync Contract

- Server-canonical:
  - authenticated user state,
  - protected My Library route access,
  - course lesson publish availability returned by `/api/my-library/new-content-signal`.
- Local-only:
  - seen new-lesson signature in `localStorage`,
  - transient notice disclosure state.
- Sync policy:
  - Home routine entrypoint is evaluated on server render from current auth cookies,
  - new-lesson signal remains loaded through the no-store protected endpoint,
  - dismissing the notice only records the seen signature locally.
- Retention and sensitivity:
  - no new personally identifying state is stored,
  - do not log user id, email, localStorage values, or auth cookies.
- Cache/invalidation:
  - Home remains `force-dynamic`,
  - new-content signal remains `no-store`,
  - local seen signature is refreshed when the user dismisses the current signal.

## Identity And Rename Contract

- Canonical stable ID:
  - signed-in user id for local seen-signature key,
  - course lesson id for deep links,
  - existing My Library route anchors for Home navigation.
- Human-readable identifiers:
  - `My routines`, `Micro Sessions`, `Habits`, and lesson/module titles remain display labels only.
- Mutability rules:
  - labels may be copy-edited in place, but route/anchor targets must remain stable unless a route-label sweep updates all callers.
- Rename vs repurpose policy:
  - do not repurpose `new content` to mean edited existing lessons; use precise new-lesson wording instead.
- Compatibility contract:
  - existing local seen-signature payloads remain compatible.
- Observability and repair:
  - tests catch regressions where the Home routines link disappears for signed-in users or notice copy drifts back to ambiguous `updated` semantics.

## Scope

- Add a signed-in-only `My routines` Home entrypoint directly under `Free course`.
- Keep anonymous Home browse-first without a routines login prompt.
- Clarify My Library new-content notice copy/test semantics around new lessons, not generic updates.
- Add or update focused tests and screenshot handoff evidence.
- Update this task brief checkpoint log through the workstream.

## Out Of Scope

- New routines route or routines dashboard redesign.
- Reordering the full My Library landing page.
- New analytics event taxonomy.
- Admin Help/Guide changes.
- Supabase schema or RLS changes.
- Commerce, entitlement, pricing, or checkout changes.

## Acceptance Criteria

1. Signed-in Home shows `My routines` immediately after `Free course` and links to the existing My Library routines surface.
2. Anonymous Home does not show the routines entrypoint.
3. My Library notice copy and tests describe `new lessons`, not generic new/updated content.
4. Existing seen-signature and dismissal behavior remains compatible.
5. Targeted unit/e2e tests pass before screenshot handoff.
6. Owner approves screenshot handoff before `npm run verify:pre-pr`, PR creation, and `npm run verify:pre-merge`.

## Validation

- `npm run lint:briefs`
- targeted unit/component tests:
  - `tests/unit/my-library-new-content-notice.test.ts`
  - routines/Home component tests added or updated in this slice
- targeted e2e:
  - Home signed-in/anonymous routines entrypoint
  - `tests/e2e/my-library-new-content-notice.spec.ts`
- screenshot handoff before broad PR gates
- after screenshot approval:
  - `npm run verify:pre-pr`
  - PR CI checks
  - `npm run verify:pre-merge`

## Help / Guide Impact

N/A for this slice because it changes learner Home navigation and private My Library notice wording only; no admin workflow labels, support recovery actions, or Help/Guide content contracts change.

## Route / Label / Support Surface Sweep

Run targeted sweep for `Free Course`, `My routines`, `Routines`, `New content`, `new lesson`, `updated content`, `/my-library`, and `my-library-routines-heading` before broad gates.

Identifiers searched: `Free Course`, `Free course`, `My routines`, `Routines`, `New content`, `new lesson`, `new lessons`, `updated content`, `/my-library`, and `my-library-routines-heading`.

Surfaces checked: `app/`, `components/`, `tests/`, `docs/runbooks/`, `docs/architecture/`, and this active task brief. Fallout handled in this slice: Home action ordering, My Library notice label, Home e2e/unit coverage, notice unit/e2e assertions, and active brief evidence. No Help/Guide or runbook copy required because no admin/support workflow changed.

## Screenshot Artifact Handoff

Screenshot artifacts: `output/home-routines-library-semantics-2026-05-12-213251`

Screenshot comparison naming: `after-home-signed-in-desktop.png`, `after-home-signed-in-mobile.png`, `reference-home-anonymous-desktop.png`, and `reference-home-anonymous-mobile.png`.

Owner screenshot approval stop: completed in chat on 2026-05-12 after the after/reference handoff was presented and owner replied `godkjent`.

## Checkpoint Log

- `2026-05-12 | in-progress | started from clean main after PR #688 and auto-closeout PR #689; scoped one combined slice for signed-in Home routines access and My Library new-lesson semantics | next: implement Home entrypoint, copy/test updates, targeted validation, and screenshot handoff before broad gates`
- `2026-05-12 | working tree | implemented signed-in-only Home My routines action directly under Free course, updated My Library notice label from New content to New lessons, and added deterministic Home unit coverage plus targeted notice assertions; validation so far: npm run lint:briefs:all PASS, targeted Vitest PASS (4 files, 18 tests), npm run typecheck PASS, targeted Playwright PASS for anonymous Home with 3 auth-dependent cases skipped because local dev-login could not reach Supabase JSON | next: capture before/after screenshot handoff for owner approval before npm run verify:pre-pr`
- `2026-05-12 | screenshot approved | captured after/reference screenshot artifacts at output/home-routines-library-semantics-2026-05-12-213251 and received owner approval in chat; first npm run verify:pre-pr attempt failed at quality-gate evidence wording only, before code lint/typecheck/test/build/e2e execution | next: add required quality-gate evidence phrases and rerun npm run verify:pre-pr`
