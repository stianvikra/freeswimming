# Task Brief: AW-006 Owned Library Item Detail Token And Action Parity (10/10)

## Metadata

- `id`: `2026-05-26-aw-006-owned-library-item-detail-token-action-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-26`
- `updated`: `2026-05-26`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-owned-library-item-detail-token-parity`
- `execution_mode`: `owner-approved implementation through targeted validation and screenshot handoff only`

## Brief Audit Record

- `last_audited`: `2026-05-26`
- `base`: `main@11b40a8`
- `audit_status`: `ready`
- `decision`: Execute this as the current owner-approved PR-sized AW-006 UI slice through screenshot handoff.
- `reason`: PR `#862` and repo-managed closeout PR `#863` are merged, `main` is clean at `11b40a8`, `npm run post-merge:preflight` was reported green with no pending closeout, and a fresh queue/design/code re-audit found `/my-library/item/[slug]` still using older one-off card/action styling while `MyLibraryHub`, `GuidePdfDownloadButton`, and owned-product fallback contracts are mature references.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `/my-library/item/[slug]`, `MyLibraryHub`, `GuidePdfDownloadButton`, catalog product/action-copy contracts, entitlement behavior, screenshot handoff rules, forward compatibility rules, or verification lanes change before screenshot handoff.

## Goal

Make owned product detail pages in My Library visually align with the current My Library token/action hierarchy while preserving entitlement checks, product actions, analytics, PDFs, and admin context notes.

## Pre-Implementation Owner Explanation

Vi rydder detaljsiden for et eid bibliotekprodukt, altsa siden brukeren far etter at et produkt allerede ligger i My Library. Den skal se mer ut som resten av My Library, med samme kort- og knappesprak. Det betyr noe fordi kjopte guider og analysevalg skal oppleves som en trygg del av biblioteket, ikke som en eldre separat side.

Utenfor scope er Stripe, entitlement-regler, produktmappinger, PDF-generering, guideinnhold, admin notes-funksjon, ruter, analytics-taksonomi, Help/Guide og supportflyt.

Fremoverkompatibilitet: nye produkter skal fortsatt komme fra katalog/action-copy-kontrakten. Kjente produkter arver samme detaljvisning automatisk; helt nye produkt- eller action-typer krever eksplisitt mapping i `getLibraryItemActionCopy`, mens ukjente verdier fortsatt skal falle trygt tilbake til claim/support.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Accessibility (a11y)`
- `Reliability and failure handling`
- `Security and authz`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                      | Evidence                                          | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | `/my-library/item/[slug]` remains the owned-item detail surface reached from My Library, with the same primary/secondary/download/back actions.                         | focused page test + screenshot handoff            | `5/5`                   |
| UX flow clarity                               | `target`     | Owned status, product title, description, primary action, optional support action, optional PDF download, and back action are easy to scan on mobile and desktop.       | Testing Library assertions + screenshots          | `5/5`                   |
| Visual design quality                         | `target`     | The route uses My Library token/card/action language, stable spacing, and no nested card sprawl or text overflow.                                                       | before/after screenshots + diff review            | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Entitlement query, product override lookup, redirects, action-copy resolution, PDF download wiring, and analytics payloads remain unchanged.                            | page tests + changed-files review                 | `5/5`                   |
| Admin editor ergonomics                       | `N/A`        | N/A because this slice changes no admin editor, admin CRUD, publishing workflow, operator queue, or admin action surface.                                               | explicit admin-editor scope rationale             | `N/A`                   |
| Accessibility (a11y)                          | `target`     | Heading hierarchy and named links/buttons remain valid; token styling does not introduce unlabeled controls or noisy live regions.                                      | Testing Library role assertions + screenshot QA   | `5/5`                   |
| Accessibility                                 | `target`     | Alias row for brief-lint closeout normalization of `Accessibility (a11y)`; same accessibility target and evidence.                                                      | Testing Library role assertions + screenshot QA   | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | No new dependency, media asset, API call, client state model, or route payload growth beyond markup/class changes.                                                      | dependency diff + targeted build/type evidence    | `5/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this slice introduces no local-only data, server-canonical data, browser storage, sync trigger, conflict policy, retention, or sensitive-data movement.     | explicit data-boundary rationale                  | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because existing `dynamic = "force-dynamic"` behavior, entitlement reads, and product override reads remain unchanged.                                              | changed-files review                              | `N/A`                   |
| Reliability and failure handling              | `target`     | Anonymous, unknown slug, missing entitlement, entitlement read error, missing product override, and unknown action-copy fallback behavior remain fail-safe.             | focused tests + unchanged redirect/error review   | `5/5`                   |
| Security and authz                            | `target`     | The route still fails closed behind auth and entitlement checks; no protected data, raw provider errors, secrets, or IDs are exposed beyond existing user-visible copy. | focused tests + route boundary review             | `5/5`                   |
| Privacy and compliance                        | `target`     | No new user data, telemetry payload fields, legal copy, consent behavior, raw logs, or sensitive diagnostics are introduced.                                            | copy/analytics diff review                        | `5/5`                   |
| Content governance                            | `target`     | Canonical AW-006 queue, this active brief, and notice/state inventory record the selected slice without stale active references.                                        | docs diff + brief lint                            | `5/5`                   |
| Admin workflow and editability                | `N/A`        | N/A because this changes no admin workflow label, Help/Guide action, support recovery procedure, operator edit path, or admin mutation.                                 | explicit admin-workflow scope rationale           | `N/A`                   |
| SEO and crawlability                          | `N/A`        | N/A because this is an authenticated member route and changes no metadata, sitemap, robots, canonical URL, structured data, or public indexability contract.            | private-route SEO rationale                       | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this changes no crawl-safe public entity model, structured data, public semantic content, or AI-facing documentation contract.                              | AI-discoverability scope rationale                | `N/A`                   |
| Analytics and KPI observability               | `target`     | Existing `item_preview_opened` and `support_clicked` payloads remain wired to the same product/action sources; no taxonomy or payload field changes.                    | page test/mocked TrackedLink props + diff review  | `5/5`                   |
| Commerce and revenue ops                      | `target`     | Checkout, catalog availability, entitlements, claim fallback, PDF access, and support paths remain unchanged for owned products.                                        | focused tests + changed-files review              | `5/5`                   |
| Incident response and support operations      | `N/A`        | N/A with scope rationale: this changes no incident alert path, support workflow, operator diagnostic, support runbook, support escalation, or on-call flow.             | explicit support-ops scope rationale              | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement write, or revenue data. | explicit finance scope rationale                  | `N/A`                   |
| i18n operational readiness                    | `target`     | Existing route-owned English labels remain concise and layout-safe; no text-in-layout assumption blocks future localization.                                            | screenshot text-fit review + component assertions | `5/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse `MyLibraryHub` token direction, `GuidePdfDownloadButton`, `TrackedLink`, and existing catalog/action-copy contracts; add no dependency or broad primitive.        | changed-files/dependency diff                     | `5/5`                   |
| Testing and QA automation                     | `target`     | Add/refresh focused unit coverage, run targeted tests, brief/quality gates, and stop at screenshot handoff before `verify:pre-pr`.                                      | test output + screenshot artifacts                | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: token/action parity adds no service call, storage, job, polling, or traffic-dependent cost.                                                            | implementation review                             | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Normal git revert restores prior markup/tests/docs; no migration, env change, dependency, workflow, provider setting, or feature flag is needed.                        | git diff + validation evidence                    | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Keep `/my-library/item/[slug]` as an authenticated server route with `dynamic = "force-dynamic"`.
  - Reuse `SiteChrome`, `TrackedLink`, `GuidePdfDownloadButton`, `AdminContextNotesPanel`, and My Library token/card/action classes instead of adding a new route-local component family.
  - Do not change route params, redirects, cache behavior, entitlement reads, product override reads, or admin context notes placement.
- TypeScript/domain contracts:
  - Preserve `CatalogProduct`, catalog slug lookup, `LibraryItemActionCopy`, product IDs, product slugs, and action-copy fallback behavior.
  - No parser, validation layer, entitlement contract, PDF contract, or analytics event taxonomy changes.
- Supabase/data layer:
  - No migration, RLS/authz, generated type, storage, index, or Supabase query change.
- External services/tools:
  - No Stripe, Supabase provider config, email, analytics vendor, webhook, secret, SDK, retry, or idempotency behavior changes.
- UI system:
  - Reference surfaces: `MyLibraryHub` owned-item cards/actions and `GuideAccessRequiredState`/guide PDF download feedback for member-product actions.
  - Screenshot handoff type: `before/after` for `/my-library/item/[slug]` desktop and mobile, using a deterministic local harness if auth-backed local capture is blocked by Supabase egress.
- Testing:
  - Add focused route/page tests for owned item token/action contract, unknown action fallback where practical, and unchanged redirect/authz behavior.
  - Run route/label/support sweep before screenshots.

## Data Placement And Sync Contract

N/A with rationale: this is a visual/action hierarchy parity slice. It introduces no new local-only data, server-canonical data, browser storage, sync trigger, conflict resolution, retry policy, retention rule, cache invalidation, or sensitive data handling. Entitlements and products remain server-canonical.

## Identity And Rename Contract

No identity changes. Existing catalog product IDs remain stable identifiers, product slugs remain routing identifiers, and product titles remain human-readable display values with existing override behavior. This slice adds no alias, redirect, analytics identity, import/export identity, or rename/repurpose rule.

## Forward Compatibility Contract

- Extensibility surfaces touched:
  - catalog products,
  - product slugs,
  - owned product action-copy mapping,
  - optional PDF download actions,
  - analytics source payloads for existing item action links.
- Source of truth:
  - known product identity and display copy still come from `lib/commerce/catalog`.
  - owned item actions still come from `getLibraryItemActionCopy`.
  - product title override still comes from the existing `products` read.
- Additive behavior:
  - existing known products automatically use the same owned detail shell.
  - existing action-copy records automatically receive the same primary/secondary/back/PDF action hierarchy.
- Explicit mapping requirements:
  - a new product ID, a new self-serve route, a new PDF/API export, or a new action type requires a deliberate `getLibraryItemActionCopy` update with tests before release.
  - a new support workflow, Help/Guide claim, analytics taxonomy, or entitlement behavior requires a separate scoped brief.
- Unknown or deprecated values:
  - unknown product IDs remain handled by existing unknown-owned cards in `MyLibraryHub`.
  - unknown action-copy values in `getLibraryItemActionCopy` continue to fall back to claim/support copy.
  - unknown route slug continues to `notFound()`.
- Test/evidence:
  - focused tests cover the known Poolside owned detail action hierarchy and redirect/fail-closed behavior.
  - route/label/support sweep includes `/my-library/item`, `LibraryItemPage`, `getLibraryItemActionCopy`, `item_preview_opened`, `support_clicked`, and `AdminContextNotesPanel`.

## Help / Guide Impact

N/A with rationale: this changes presentation only. It does not rename routes, labels, workflow actions, Help/Guide content, support recovery behavior, admin instructions, entitlement behavior, or product access rules.

## Route / Label / Support Surface Sweep

Required because a member-owned product route and visible action hierarchy are touched.

- Identifiers searched:
  - `/my-library/item`
  - `LibraryItemPage`
  - `owned library item`
  - `getLibraryItemActionCopy`
  - `item_preview_opened`
  - `support_clicked`
  - `GuidePdfDownloadButton`
  - `AdminContextNotesPanel`
- Surfaces checked:
  - `app/`
  - `components/`
  - `tests/`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
  - `docs/design/`
  - `docs/runbooks/`
- Expected fallout:
  - `app/my-library/item/[slug]/page.tsx`,
  - focused page tests,
  - this active brief,
  - canonical AW-006 queue,
  - notice/state inventory,
  - no Help/Guide, support runbook, API contract, analytics taxonomy, entitlement, Stripe, Supabase, or route-label fallout unless implementation discovers a direct contradiction.
- Actual evidence:
  - `rg -n "/my-library/item|LibraryItemPage|owned library item|getLibraryItemActionCopy|item_preview_opened|support_clicked|GuidePdfDownloadButton|AdminContextNotesPanel" app components tests docs/task-briefs/planned docs/task-briefs/in-progress docs/design docs/runbooks`
  - Result: expected references only in the owned item route, My Library entry links, PDF/admin notes reference surfaces, focused tests, this brief, canonical AW-006 queue, and notice/state inventory. No Help/Guide, support runbook, API contract, analytics taxonomy, entitlement, Stripe, Supabase, or route-label fallout found.

## Scope

- `app/my-library/item/[slug]/page.tsx`
- focused unit/page tests for owned item detail
- canonical AW-006 queue and notice/state inventory updates
- before/after screenshot handoff artifacts

## Out Of Scope

- Product catalog IDs, slugs, pricing, Stripe, checkout, billing portal, refunds, invoices, finance reports, or revenue behavior.
- Entitlement creation, entitlement lookup semantics, claim flow behavior, guest attachment, auth provider behavior, or protected-route policy.
- Guide/PDF API routes, generated PDF content, filenames, fetch credentials, or guide tracker behavior.
- Admin notes APIs, Context Notes behavior, page-note routing, support workflows, Help/Guide content, runbooks, analytics taxonomy, or provider diagnostics.
- Broad shared Button/Card/PageShell/Notice primitive rollout.
- Package, dependency, config, workflow, migration, Supabase, or generated-type changes.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves screenshots.

## Acceptance Criteria

1. `/my-library/item/[slug]` keeps the same auth redirect, unknown-slug `notFound`, entitlement query, missing-entitlement redirect, and product title override behavior.
2. The owned item detail surface uses My Library token/card/action hierarchy and avoids older one-off shadow/card styling.
3. Known product primary actions, optional support action, optional guide PDF download, and back action remain wired to the same destinations and analytics payloads.
4. Unknown/future product action-copy fallback remains safe through `getLibraryItemActionCopy`.
5. No commerce, entitlement, PDF, admin notes, Help/Guide, support, analytics taxonomy, API, Supabase, dependency, or route behavior change is introduced.
6. Canonical AW-006 queue and notice/state inventory record this active slice without stale active references.
7. Targeted tests and screenshot handoff evidence are complete.
8. Work stops after screenshot handoff until owner approval.

## Validation

Targeted during implementation:

- `./node_modules/.bin/vitest run tests/unit/library-item-page.test.tsx tests/unit/library-item-actions.test.ts` - PASS, 2 files / 9 tests.
- `npm run typecheck` - PASS.
- `git diff --check` - PASS.
- `npm run lint:quality-gates` - PASS.
- `npm run lint:briefs -- --all` - PASS.
- targeted route/label/support sweep for owned-library item identifiers - PASS, expected references only.

Visual gate:

- Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
- Capture `before/after` screenshots against `http://127.0.0.1:3000`.
- If auth-backed capture is blocked by local Supabase egress, use a temporary local harness rendering the same production owned-item shell with deterministic data, then remove the harness before validation.
- Owner screenshot approval stop: stop after screenshot handoff and wait for owner approval before `npm run verify:pre-pr`, PR creation/update, CI monitoring, or `npm run verify:pre-merge`.

Visual evidence:

- `output/owned-library-item-detail-2026-05-26-160459`
- Captured: `2026-05-26 16:04` local time.
- Type: `before/after` card-level screenshots for the owned library item detail surface on desktop and mobile.
- Method: temporary local capture route rendered deterministic before/after owned-item card data because the production route is auth/entitlement gated; the temporary route and capture script were removed after screenshots.
- Production-rendering files changed after capture: No.
- Owner approval: `2026-05-26` in chat, approved to continue and merge when tests are ok.

## Local Tooling Prerequisite

- Node.js LTS/npm available through the repo's normal `nvm use --silent` path.

## Checkpoint Log

- `2026-05-26 | in-progress | started from clean main@11b40a8 after Program Builder Route Feedback Semantics #862 and closeout #863; owner approved Owned Library Item Detail Token And Action Parity and requested execution through screenshot approval | next: update queue/inventory, implement owned item token/action parity, run targeted validation, capture before/after screenshot handoff, and stop before npm run verify:pre-pr`
- `2026-05-26 | screenshot-ready | implemented owned item detail token/action parity, updated queue/inventory/brief evidence, passed targeted tests/typecheck/quality-gate/brief-lint/diff-check, captured before/after screenshot artifacts, and removed temporary capture route/script | next: owner screenshot approval before npm run verify:pre-pr`
- `2026-05-26 | screenshot-approved | owner approved screenshot handoff and authorized merge when tests are ok | next: run npm run verify:pre-pr, commit, push, open PR, monitor CI, run npm run verify:pre-merge, then merge if green`
