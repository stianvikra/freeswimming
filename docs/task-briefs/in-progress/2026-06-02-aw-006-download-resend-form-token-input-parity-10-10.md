# Task Brief: AW-006 Download Resend Form Token/Input Parity (10/10)

## Metadata

- `id`: `2026-06-02-aw-006-download-resend-form-token-input-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-06-02`
- `updated`: `2026-06-02`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-download-resend-token-parity`

## Brief Audit Record

- `last_audited`: `2026-06-02`
- `base`: `main@a4e9934`
- `audit_status`: `ready`
- `decision`: Execute this as the current bounded AW-006 UI slice.
- `reason`: `main` is clean and synced after AW-006 Queue/Design Inventory Repair PR `#951` and repo-managed closeout PR `#952`; post-merge preflight was reported green with no pending closeout. A fresh queue/design/code review found no selected product/UI slice and found `DownloadResendForm` still using older local rounded input and blue submit styling inside otherwise token-backed `/checkout/success`, `/claim`, and My Library recovery surfaces. Screenshot review then found the same workflow's route-owned sign-in/back action groups needed the current mobile action layout contract as part of the same visible recovery surface.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `DownloadResendForm`, `CommerceActionFeedback`, `/checkout/success`, `/claim`, `MyLibraryHub`, download-resend API behavior, Stripe/entitlement behavior, screenshot handoff rules, forward compatibility rules, or verification lanes change before PR handoff.

## Goal

Align the access-link resend form input, submit action, and adjacent route-owned recovery action groups with the current AW-006 token/input/action and mobile action layout direction without changing recovery behavior.

## Pre-Implementation Owner Explanation

Vi gjor recovery-formen visuelt mer konsistent pa kjop/tilgangssidene. Det betyr mer tillit nar brukeren ber om ny tilgangslenke, fordi felt og knapp matcher resten av de nyere flatene. Utenfor scope er betaling, tilgangssjekk, API, e-postsending, tekster, labels og selve recovery-flyten.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Commerce and revenue ops`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                            | Evidence                                              | Expected Closeout Score |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The form and adjacent recovery actions remain attached to the same checkout, claim, and My Library recovery moments and add no new route, decision point, or workflow branch.                 | component/route diff + screenshots                    | `5/5`                   |
| UX flow clarity                               | `target`     | Purchase email entry, pending state, success/error feedback, sign-in action, and back action remain clear and recoverable with unchanged labels and copy.                                     | focused component/route tests + screenshot handoff    | `5/5`                   |
| Visual design quality                         | `target`     | `DownloadResendForm` uses existing `ui-field` and `fs-cta-primary`/token direction, and same-workflow recovery actions use the mobile action layout contract with no text overflow on mobile. | DOM/class assertions + after/reference screenshots    | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Email normalization, request URL, method, body, `nextPath`, `source`, pending lifecycle, and fallback errors remain unchanged.                                                                | existing and updated unit tests + diff review         | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this changes no admin editor, CRUD workflow, dashboard action, operator queue, or admin editability surface.                                                                      | explicit admin-editor scope rationale                 | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Label association, invalid state, `aria-describedby`, polite feedback, keyboard submission, and disabled pending state remain intact after visual token changes.                              | Testing Library assertions + screenshot/manual review | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: class-name reuse should not add dependencies, new routes, extra fetches, media, or meaningful JS payload.                                                                    | package/diff review + broad gate                      | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this visual cleanup introduces no local storage, server-canonical data, sync queue, conflict policy, retention rule, or sensitive-data handling.                                  | data contract rationale                               | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no route cache mode, API cache header, revalidation trigger, stale-data behavior, or invalidation path changes.                                                                   | cache scope rationale                                 | `N/A`                   |
| Reliability and failure handling              | `target`     | Validation failure, API failure, pending feedback, and success feedback continue to resolve deterministically without losing recovery context.                                                | focused validation/pending/error/success tests        | `5/5`                   |
| Security and authz                            | `target`     | Protected routes, cookies, authz checks, entitlement lookup, download-resend API, and fail-closed boundaries remain untouched.                                                                | API/route diff review + broad gate                    | `5/5`                   |
| Privacy and compliance                        | `target`     | The resend response stays non-enumerating and the UI exposes no customer, entitlement, provider, or raw payment details beyond existing safe context.                                         | resend tests + copy/diff review                       | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this active brief, and design inventory record the selected recovery-form parity slice without stale active references.                                               | docs diff + brief lint                                | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because no admin workflow label, editable field, status transition, review/publish path, recovery procedure, Help/Guide assertion, or support action changes.                             | explicit admin-workflow scope rationale               | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no metadata, sitemap, robots, canonical URL, structured data, or crawl-facing page content.                                                                          | SEO scope rationale                                   | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no public semantic entity model, structured data, crawl-safe AI content, or AI-facing documentation contract.                                                        | AI-discoverability scope rationale                    | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: existing recovery source values remain unchanged; no analytics event taxonomy or payload value is introduced or removed.                                                     | diff review + existing tests                          | `4/5`                   |
| Commerce and revenue ops                      | `target`     | Stripe checkout, entitlements, download access resend payloads, email delivery, invoices, refunds, payouts, and finance behavior remain unchanged.                                            | unchanged API/Stripe diff review + focused tests      | `5/5`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support recovery workflow, operator diagnostic path, runbook procedure, or support escalation behavior.                                             | explicit support-ops scope rationale                  | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, invoice/refund path, payout, finance report, reconciliation surface, entitlement truth, or revenue data.                                          | explicit finance scope rationale                      | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: button/input styling and recovery action groups must tolerate the existing English labels and future longer labels by stacking/full-width behavior on mobile.                | screenshot handoff + class review                     | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing React client component boundaries, `ui-field`, `fs-cta-*`, `components/ui/actionLayout.ts`, Tailwind/CSS variables, and Testing Library; add no dependency or broad primitive. | component/route diff + package diff                   | `5/5`                   |
| Testing and QA automation                     | `target`     | Update focused tests, run targeted Vitest, brief lint, route/label/support sweep, screenshot handoff, `verify:pre-pr`, required CI, and `verify:pre-merge`.                                   | test commands + screenshot artifacts + verify gates   | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: this reuses existing local UI classes and adds no provider call, polling, job, service, storage, or recurring cost.                                                          | implementation review                                 | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | PR is reversible by normal git revert and must not include migrations, package/config/workflow/deployment setting changes, secrets, or external service changes.                              | git diff review + validation gates                    | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces: `/claim`, `/checkout/success`, My Library token cards/actions, `ContactForm` field token use, and existing `fs-cta-*` action direction.
  - Keep `DownloadResendForm` as a client component and keep `/checkout/success`, `/claim`, and `/my-library` route boundaries unchanged.
  - Route/action/API boundary: `/api/download/resend`, Stripe Checkout, entitlements, and auth helpers remain unchanged.
  - Cache/revalidation: no cache, revalidation, or route data behavior changes.
- TypeScript/domain contracts:
  - Preserve `DownloadResendForm` props, `DownloadResendResponse`, resend email normalization, source enum usage, fallback error strings, and pending lifecycle.
  - Deterministic invariant: visual styling must not change when a request is made, what is posted, or what privacy-safe message appears.
- Supabase/data layer:
  - N/A; no schema, migration, RLS/authz policy, generated DB type, query, storage, or index change.
- External services/tools:
  - Stripe and email providers are out of scope; no SDK/docs, secret, idempotency, retry, webhook, or observability behavior changes.
- UI system:
  - Use existing `ui-field`, `ui-field-label`, `fs-cta-primary`, `fs-cta-secondary`, `components/ui/actionLayout.ts`, token radius/focus/color variables, and existing `CommerceActionFeedback` semantics.
  - Screenshot fallout rule: visible same-workflow controls in captured artifacts must be checked against active design contracts and either fixed in scope or explicitly documented as out of scope before handoff.
  - Screenshot handoff comparison type: `after/reference` for `/claim` and `/checkout/success` against an existing tokenized form/action reference.
- Testing:
  - Update `tests/unit/download-resend-form.test.tsx` with class/a11y assertions.
  - Use route screenshots and broad gates after owner screenshot approval.

## Data Placement And Sync Contract

N/A with rationale: this UI styling cleanup introduces no local-only data, server-canonical data, browser storage, sync trigger, conflict policy, retention rule, sensitive-data handling, cache mutation, or invalidation behavior. Existing download-resend API and entitlement data ownership remain unchanged.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted product entity, route param, slug, title identity, analytics identity, operator-visible identifier, rename rule, alias, redirect, migration, or compatibility mapping. Existing `source`, `nextPath`, product, entitlement, and Stripe identifiers are preserved.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Recovery form reuse across `/checkout/success`, `/claim`, My Library recovery cards, and future access-link surfaces.
  - Source values remain the existing explicit enum owned by `DownloadResendForm`/download-resend API.
- Source of truth:
  - Visual behavior comes from shared `ui-field` and `fs-cta-*` token classes, not route-local button colors.
  - Request semantics remain owned by the download-resend API and helper functions.
- Additive behavior:
  - Future surfaces that render `DownloadResendForm` automatically inherit the same tokenized input/action presentation.
  - Future same-workflow recovery action groups can inherit mobile-safe stacking by using `getMobileActionGroupClass` and `mobileActionItemClass`.
- Explicit mapping requirements:
  - New resend `source` values still require explicit API/helper/test mapping before release.
  - New workflow labels or recovery instructions require Help/Guide/runbook impact review.
- Unknown or deprecated values:
  - Existing server-side source fallback and privacy-safe response behavior remain unchanged.
- Test/evidence:
  - Focused component tests assert class/token reuse and unchanged request payloads; route/label/support sweep confirms no workflow fallout.

## Help / Guide Impact

N/A with rationale: this slice preserves all workflow labels, recovery instructions, support procedures, Help/Guide assertions, API behavior, payment behavior, and entitlement behavior. Help/Guide or runbook updates are required only if implementation changes labels, action meaning, recovery behavior, auth, payments, or support procedures; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted sweep because this slice touches visible recovery form and same-workflow recovery action presentation across checkout/claim/My Library surfaces.

- Identifiers searched before broad gates:
  - `DownloadResendForm`
  - `CommerceActionFeedback`
  - `Email me access link`
  - `Purchase email`
  - `Sending...`
  - `Sending access link...`
  - `Enter your purchase email.`
  - `Sign in to My Library`
  - `Back to Programs`
  - `getMobileActionGroupClass`
  - `/checkout/success`
  - `/claim`
  - `library_recovery`
  - `claim_entry`
  - `checkout_success`
- Surfaces checked:
  - `components/commerce/DownloadResendForm.tsx`
  - `components/commerce/CommerceActionFeedback.tsx`
  - `app/checkout/success/page.tsx`
  - `app/claim/page.tsx`
  - `components/my-library/MyLibraryHub.tsx`
  - `tests/unit/`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - canonical AW-006 queue
- Expected fallout:
  - focused component tests,
  - screenshot artifacts,
  - active brief checkpoint update,
  - canonical queue/design inventory update,
  - no Help/Guide update because labels and recovery behavior are preserved.

## Scope

- Update `components/commerce/DownloadResendForm.tsx` input and submit action classes.
- Update `/checkout/success` and `/claim` route-owned sign-in/back action groups to use the shared mobile action layout helper while preserving links and labels.
- Optionally make a minimal `CommerceActionFeedback` visual token adjustment only if needed to match the form; preserve tone semantics and live-region behavior.
- Update focused unit tests in `tests/unit/download-resend-form.test.tsx`, `tests/unit/checkout-success-page.test.tsx`, and `tests/unit/claim-page.test.tsx`.
- Update this active brief, canonical AW-006 queue, design inventory, and screenshot handoff runbook.
- Capture after/reference screenshots for `/claim` and `/checkout/success` before broad gates.

## Out Of Scope

- `/api/download/resend`, Stripe Checkout, Stripe webhooks, entitlements, email delivery, auth, Supabase, analytics taxonomy, prices, product catalog, invoices, refunds, payouts, finance reporting, environment variables, package dependencies, migrations, workflows, route redesigns, copy/label changes, Help/Guide/runbook behavior changes, or merge to `main`.
- Broad commerce button cleanup beyond `DownloadResendForm` and the adjacent route-owned recovery action groups shown in the screenshot handoff.
- App-wide input/button primitive rollout.

## Acceptance Criteria

1. `DownloadResendForm` input uses the shared field token direction while preserving label association, invalid state, placeholder, autocomplete, and `aria-describedby`.
2. Submit action uses current `fs-cta-primary` direction and avoids mobile text overflow by using full-width/mobile-safe sizing.
3. Same-workflow sign-in/back recovery action groups use the shared mobile action layout helper, stack full-width on mobile, and preserve existing links and labels.
4. Request payloads, source values, `nextPath`, pending/success/error lifecycle, labels, and privacy-safe feedback behavior are unchanged.
5. Focused tests cover visual token class reuse plus existing validation, pending, success, error, and route-owned recovery action layout semantics.
6. Screenshot handoff includes `/claim` and `/checkout/success` after/reference artifacts before `npm run verify:pre-pr`.
7. `npm run lint:briefs`, targeted tests, route/label sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `npm run lint:briefs`
  - `npm exec vitest run tests/unit/download-resend-form.test.tsx`
  - `npm exec vitest run tests/unit/download-resend-form.test.tsx tests/unit/checkout-success-page.test.tsx tests/unit/claim-page.test.tsx`
  - targeted route/label/support sweep
  - `git diff --check`
- Completed before screenshot approval:
  - `npm run lint:briefs`: passed; no changed tracked task briefs found before first commit.
  - `npm run lint:briefs:all`: passed after active-brief wording was adjusted to avoid stale done-brief references.
  - `npm exec vitest run tests/unit/download-resend-form.test.tsx`: passed, `1` file / `6` tests.
  - targeted route/label/support sweep for `DownloadResendForm`, resend labels, `/checkout/success`, `/claim`, and source values: expected component, route, test, queue, inventory, and active brief references only; no Help/Guide/runbook fallout.
  - `git diff --check`: passed.
  - `npm exec vitest run tests/unit/download-resend-form.test.tsx tests/unit/checkout-success-page.test.tsx tests/unit/claim-page.test.tsx`: passed, `3` files / `10` tests, after adding same-workflow recovery action layout coverage.
  - targeted route/label/support sweep refreshed with identifiers searched for resend labels, sign-in/back recovery actions, `/checkout/success`, `/claim`, source values, and mobile action helpers; surfaces checked were `components/commerce`, `app/checkout`, `app/claim`, `components/my-library`, `tests/unit`, `docs/design`, active/planned task briefs, and `docs/runbooks`; expected component, route, test, queue, inventory, runbook, and active brief references only; no Help/Guide/support workflow fallout.
  - `npm exec -- prettier --check ...`: passed for changed TS/TSX and docs files after mechanical formatting.
  - `npm run lint:briefs:all`: passed after scope expansion and formatting.
  - `git diff --check`: passed after scope expansion and formatting.
- Visual gate:
  - start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`
  - capture after/reference screenshots for `/claim` and `/checkout/success`
  - screenshot artifacts: `output/aw-006-download-resend-token-parity-2026-06-02-205447`
  - captured: `2026-06-02 20:55` local time
  - comparison type: `after/reference`
  - prior artifacts in `output/aw-006-download-resend-token-parity-2026-06-02-204418` are superseded because visual/rendering files changed after that capture.
  - stop for owner screenshot approval before `npm run verify:pre-pr`
- Broad gates after screenshot approval:
  - `npm run verify:pre-pr`
  - `npm run verify:pre-pr`: first run stopped in `lint:quality-gates` because the route/label/support sweep evidence did not include the exact expected identifiers/surfaces wording; fixed in the brief.
  - `npm run verify:pre-pr`: passed on rerun in full lane, including quality gates, lint, typecheck, `224` unit files / `1312` tests, build, perf budgets, and Playwright E2E (`102` passed / `492` skipped).
  - required PR CI checks
  - `npm run verify:pre-merge`

## Checkpoint Log

- `2026-06-02 | in-progress | started from clean main@a4e9934 after PR #951 and repo-managed closeout #952; owner approved and explicitly executed Download Resend Form Token/Input Parity after queue/design/code review | next: implement scoped component/test/docs changes and capture screenshot handoff before verify:pre-pr`
- `2026-06-02 | in-progress | implemented DownloadResendForm token/input/action parity, updated focused tests and AW-006 queue/design inventory, passed targeted Vitest, brief lint, route/label/support sweep, git diff whitespace check, and captured after/reference screenshot artifacts | next: owner screenshot approval before verify:pre-pr`
- `2026-06-02 | in-progress | owner screenshot review flagged adjacent sign-in/back recovery actions; expanded scope to same-workflow route-owned action layout parity, added route tests, and documented the screenshot same-workflow fallout rule in the UI handoff runbook | next: refresh docs lint, route/label sweep, whitespace check, and regenerate screenshot handoff before verify:pre-pr`
- `2026-06-02 | screenshot-review | refreshed after/reference artifacts in output/aw-006-download-resend-token-parity-2026-06-02-205447 after same-workflow action layout fix; targeted tests, brief lint, formatter check, route/label/support sweep, and git diff whitespace check are green | next: owner screenshot approval before verify:pre-pr`
- `2026-06-02 | screenshot-approved | owner approved refreshed after/reference screenshot handoff for DownloadResendForm token/input/action parity and adjacent recovery action layout parity | next: run npm run verify:pre-pr before commit, push, and PR handoff`
- `2026-06-02 | pre-pr-fix | npm run verify:pre-pr stopped in quality-gate because route/label/support sweep evidence did not include the expected identifiers/surfaces wording; added explicit identifiers searched and surfaces checked evidence | next: rerun npm run verify:pre-pr`
- `2026-06-02 | pre-pr-pass | npm run verify:pre-pr passed in full lane after the brief evidence fix; validation included quality gates, lint, typecheck, unit, build, perf budgets, and Playwright E2E | next: commit, push, open PR, monitor CI, and run npm run verify:pre-merge before merge-readiness summary`
