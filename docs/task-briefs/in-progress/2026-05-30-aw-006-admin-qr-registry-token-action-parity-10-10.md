# Task Brief: AW-006 Admin QR Registry Manager Token/Action Parity (10/10)

## Metadata

- `id`: `2026-05-30-aw-006-admin-qr-registry-token-action-parity-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-30`
- `updated`: `2026-05-30`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-admin-qr-registry-token-parity`

## Brief Audit Record

- `last_audited`: `2026-05-30`
- `base`: `main@6253bd1`
- `audit_status`: `ready`
- `decision`: Execute the next AW-006 UI slice as a bounded Admin QR Registry manager token/action parity pass.
- `reason`: `main` is clean and synced after PR `#904` and repo-managed closeout PR `#905`; `npm run post-merge:preflight` is green with no closeout remaining. A fresh queue/design/code re-audit found no active AW-006 slice and identified `AdminQrLinksManager` as a small remaining admin manager presentation gap after `/admin` shell parity and Commerce/Operations manager parity shipped.
- `must_refresh_before_execution_if`: Refresh if AGENTS.md, scorecard categories, AW-006 scope, `components/admin/AdminQrLinksManager.tsx`, `AdminManagerState`, QR registry API contracts, QR asset generation behavior, screenshot handoff rules, forward compatibility rules, route/label/support sweep rules, or verification lanes change before PR handoff.

## Goal

Align the Admin QR Registry manager shell, filters, row cards, QR preview card, and visible actions with the current AW-006 `fs-library-card` and action-token direction without changing QR link data, slugs, redirects, asset generation, APIs, authz, Help/Guide content, or support procedures.

## Pre-Implementation Owner Explanation

Jeg rydder QR Registry-panelet slik at kort, filtre og knapper ser ut som resten av den nye admin-flaten. Det gjør QR-arbeid lettere å skanne og bruke etter at admin-skallet og Commerce/Operations er pusset. Utenfor scope er QR API-er, `/go/v/[slug]`, QR-generering, slug/status-regler, content-prefill, Help/Guide-tekst, roller, lagring og faktisk QR-logikk.

Fremoverkompatibilitet: nye QR-rader skal fortsatt komme fra eksisterende QR API-er og arve samme visuelle radmønster automatisk; nye QR-statuser, nye handlinger, nye supportprosedyrer eller endret redirect-policy krever eksplisitt mapping, tester og dokumentgjennomgang senere.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `Product goals and IA`
- `UX flow clarity`
- `Visual design quality`
- `Business logic correctness and data integrity`
- `Admin editor ergonomics`
- `Security and authz`
- `Stack-fit and dependency discipline`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                                                                | Evidence                                                    | Expected Closeout Score |
| --------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | The slice must stay inside `AdminQrLinksManager` presentation and keep the AW-006 queue/design inventory accurate.                                                                                                | active brief + queue/inventory diff + changed-files review  | `5/5`                   |
| UX flow clarity                               | `target`     | QR registry filters, create entry, QR rows, preview, downloads, and more-actions are easier to scan while labels and click paths stay unchanged.                                                                  | screenshot handoff + component tests + diff review          | `5/5`                   |
| Visual design quality                         | `target`     | The manager reuses current `fs-library-card`, `fs-library-card-muted`, `fs-library-card-accent`, `fs-cta-primary`, `fs-cta-secondary`, and local quiet/destructive action direction without broad admin redesign. | screenshot handoff + DOM/class review                       | `5/5`                   |
| Business logic correctness and data integrity | `target`     | QR GET/POST/PATCH/DELETE payloads, content attachment display, stable link generation, QR asset generation, and filter behavior remain unchanged.                                                                 | targeted unit tests + diff review                           | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admins can still refresh, create, filter, edit, activate/disable, delete, copy stable links, preview QR, and download SVG/PNG with no extra workflow step.                                                        | component tests + screenshot handoff                        | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Buttons, links, labels, inputs, selects, status states, QR image alt text, disabled states, and expanded panels remain keyboard reachable and screen-reader clear.                                                | Testing Library assertions + screenshot/manual review       | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: class/token reuse adds no dependency, fetch path, repeated render loop, or material payload increase.                                                                                            | package diff + pre-pr gate                                  | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this UI cleanup introduces no local-only data, server-canonical data, browser storage, sync, conflict, retention, or sensitive-data behavior. Existing UI state remains component-local.              | data/sync scope rationale                                   | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no cache mode, API cache header, invalidation trigger, revalidation behavior, or stale-data policy changes.                                                                                           | cache scope rationale                                       | `N/A`                   |
| Reliability and failure handling              | `target`     | Existing loading, warning, error, empty, no-results, action-error, action-notice, QR asset loading/error, and retry behavior remains deterministic.                                                               | targeted state tests + diff review                          | `5/5`                   |
| Security and authz                            | `target`     | Protected admin route gating, API authz, credentials mode, cookies, secrets, redirect policy, and QR destination validation boundaries remain untouched.                                                          | unchanged auth/API diff review + existing security coverage | `5/5`                   |
| Privacy and compliance                        | `N/A`        | N/A because no user data exposure, logs, analytics payloads, legal/consent copy, retention rule, or raw env value handling changes.                                                                               | privacy scope rationale                                     | `N/A`                   |
| Content governance                            | `target`     | Existing QR labels, Help/Guide behavior, support procedures, and AW-006 docs source of truth are preserved or updated for this slice only.                                                                        | copy-preservation diff review + docs update                 | `5/5`                   |
| Admin workflow and editability                | `target`     | QR workflows remain editable through the same controls and API calls; this PR changes shell/card/action presentation only.                                                                                        | targeted tests + changed-files review                       | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this changes no public route metadata, sitemap, robots, canonical URL, structured data, or crawl-facing content.                                                                                      | SEO scope rationale                                         | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because no public semantic entity surface, structured data, crawl-safe AI content, or AI-facing documentation contract changes.                                                                               | AI-discoverability scope rationale                          | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event taxonomy, payload, persistence, dashboard, or KPI behavior changes.                                                                                                           | diff review                                                 | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this changes no Stripe, checkout, entitlement, catalog, invoice, refund, payout, revenue report, or finance-facing data.                                                                              | explicit commerce scope rationale                           | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A: this changes no incident alert path, support recovery workflow, operator diagnostics, runbook procedure, or support escalation behavior.                                                                     | explicit support-ops scope rationale                        | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A: this changes no billing provider data, reconciliation logic, invoice/refund path, payout, finance report, entitlement, or revenue recognition data.                                                          | explicit finance scope rationale                            | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting because admin strings may later become locale-sensitive, but this slice preserves existing English admin labels and changes no translation workflow.                                                   | copy-preservation diff review                               | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing admin-local state helper and global `fs-*` tokens, keep client/API boundaries unchanged, and add no dependency or new global primitive.                                                            | component diff + package diff                               | `5/5`                   |
| Testing and QA automation                     | `target`     | Add or update focused unit coverage for QR manager token/action classes, run targeted tests, brief lint, route/label/support sweep, screenshot handoff, and broad gates after approval.                           | targeted tests + `verify:pre-pr` + CI + `verify:pre-merge`  | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting because data-driven QR rows should inherit the same treatment without extra services, infrastructure, or recurring cost.                                                                               | row-rendering diff review                                   | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | The PR must be reversible through normal git revert; no migrations, config, package, workflow, or deployment setting changes are allowed.                                                                         | git diff review + validation gates                          | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reference surfaces: `/admin` shell after PR `#900`, `AdminManagerState`, Commerce/Operations manager parity from PR `#904`, and AW-006 tokenized My Library/admin card/action classes.
  - `AdminQrLinksManager` stays a client component.
  - Route/action/API boundary remains unchanged: `/api/admin/qr-links`, `/api/admin/qr-links/[id]`, `/api/admin/content`, and `/go/v/[slug]`.
  - Cache/revalidation behavior remains unchanged; existing `cache: "no-store"` fetches are preserved.
- TypeScript/domain contracts:
  - Preserve `QrRedirectLinkRow`, `LinkFormState`, `QrAssetState`, response unions, and existing fallback/error strings.
  - Deterministic invariant: every returned QR row renders one row card with the same source identifiers and actions.
- Supabase/data layer:
  - N/A; no migration, RLS, authz, generated DB type, index, storage, or query shape change.
- External services/tools:
  - N/A; no Stripe, Supabase provider setting, email provider, analytics vendor, webhook, SDK, secret, retry policy, or observability integration change.
- UI system:
  - Reuse `fs-library-card`, `fs-library-card-muted`, `fs-library-card-accent`, `fs-cta-primary`, `fs-cta-secondary`, and manager-local quiet/destructive action classes aligned to the same radius/focus/token direction.
  - Keep the change manager-local; do not introduce a broad shared Button/Card/PageShell primitive.
  - Screenshot handoff comparison type: `after/reference`, comparing changed QR Registry states inside `/admin` to the current tokenized `/admin` shell and nearby admin manager surfaces.
- Testing:
  - Add or update focused unit tests for QR manager token/action classes plus existing state behavior.
  - Capture screenshot handoff before `npm run verify:pre-pr` because rendered admin UI changes.

## Data Placement And Sync Contract

N/A with rationale: this presentation cleanup introduces no new local-only data, server-canonical data, browser storage, sync behavior, conflict policy, retention rule, sensitive-data handling, or cache invalidation. Existing create/edit/filter/open-panel/QR-asset state remains component-local UI state derived from server-canonical admin APIs and local QR asset generation.

## Identity And Rename Contract

This slice does not change identity behavior. QR link `id`, `slug`, `destination_url`, `status`, `content_item_id`, `content_label`, `placement_key`, and `owner_user_id` remain displayed from existing API rows. Slug editing and active/disabled transitions keep the existing edit-in-place behavior; stable `/go/v/[slug]` routing, legacy compatibility, redirect policy, and content identity are not changed.

## Forward Compatibility Contract

- Extensibility surfaces:
  - QR registry rows, QR statuses, content attachments, placement keys, owner IDs, stable link actions, QR asset preview/download actions, and manager-local status states.
- Source of truth:
  - QR rows come from `/api/admin/qr-links`.
  - Content attachment labels come from `/api/admin/content`.
  - Stable links continue to derive from the current origin and `/go/v/${slug}`.
  - Visual treatment comes from existing `fs-*` tokens and admin-local `AdminManagerState`.
- Additive behavior:
  - New QR rows should render through the same QR row card without code changes.
  - Empty/error/warning/no-results and QR asset states should continue to use `AdminManagerState`.
- Explicit mapping requirements:
  - New QR statuses, new redirect behavior, new QR asset formats, new content attachment types, new operator workflows, or new support/runbook flows require explicit owner-approved mapping, tests, and Help/Guide/runbook review before release.
- Unknown or deprecated values:
  - Unknown safe string values continue to display from existing data where the current typed contract allows them; unsupported API failures remain handled by current error states.
- Test/evidence:
  - Focused unit tests verify row/action class parity and unchanged fetch, filter, preview, asset retry, and create-form behavior.
  - Route/label/support sweep checks no workflow label or support path changed silently.

## Help / Guide Impact

N/A with rationale: this slice preserves existing QR workflow labels, recovery action labels, Help/Guide assertions, support procedures, and operator instructions. Help/Guide or runbook updates are required only if implementation changes action meaning, recovery behavior, auth, redirects, support procedure, or QR operational workflow; those are out of scope.

## Route / Label / Support Surface Sweep

Required as a targeted admin/operator sweep because this slice changes operator-visible rendering without changing labels or workflow actions.

- Identifiers to search before broad gates:
  - `QR registry`
  - `QR workflow`
  - `QR Links`
  - `New link`
  - `Create first QR link`
  - `Use example values`
  - `Copy link`
  - `Show QR`
  - `Hide QR`
  - `Download SVG`
  - `Download PNG`
  - `Activate`
  - `Disable`
  - `Delete`
  - `AdminQrLinksManager`
- Surfaces to check:
  - `components/admin/AdminQrLinksManager.tsx`
  - `components/admin/AdminContextQrPanel.tsx`
  - `components/admin/AdminWorkspace.tsx`
  - `components/admin/AdminHelpCenter.tsx`
  - `tests/unit/admin-qr-links-manager-state.test.tsx`
  - `tests/unit/admin-workspace-shell.test.tsx`
  - `tests/e2e/admin-foundation.spec.ts`
  - `docs/design/notice-empty-state-pattern-inventory.md`
  - `docs/task-briefs/planned/`
  - `docs/task-briefs/in-progress/`
- Expected fallout:
  - QR Registry card/action presentation aligns with current AW-006 token direction.
  - Focused test coverage.
  - Screenshot artifacts.
  - Active brief checkpoint updates.
  - Canonical AW-006 queue and design inventory update.
  - No Help/Guide or runbook runtime update unless a workflow label or recovery behavior changes.

## Scope

- Align `components/admin/AdminQrLinksManager.tsx` shell, filter controls, empty/no-results actions, QR row cards, visible row actions, more-actions panel, QR preview card, download actions, edit/create panels, and retry actions with current AW-006 token/action direction.
- Preserve QR registry fetch/create/update/delete behavior, content fetch behavior, prefill behavior, filter behavior, stable link generation, QR asset generation, QR asset download, and all API/auth behavior.
- Add or update focused tests for QR Registry token/action classes and preserved behavior.
- Update this active brief, the canonical AW-006 queue, and the design inventory.
- Capture screenshot handoff artifacts for changed admin UI before PR gates.

## Out Of Scope

- QR API changes, QR slug/status behavior changes, `/go/v/[slug]` redirect behavior, QR asset generation internals, SVG/PNG payloads, generated filenames, content API changes, prefill query contract changes, authz, RLS, migrations, generated DB types, cookies, credentials, secrets, or environment variables.
- Admin workspace shell, admin content, Commerce, Operations, email templates, messages, notes, categories, Help Center, or other manager internals beyond the scoped QR Registry manager.
- Workflow labels, Help/Guide text, support procedures, analytics taxonomy, packages, workflows, public visual redesign, or merge to `main`.

## Acceptance Criteria

1. QR Registry manager shell, filters, rows, preview, create/edit panels, and actions use the current AW-006 token/action direction while preserving labels, destinations, disabled states, and user flow.
2. QR row data, filter behavior, create/edit payloads, activate/disable behavior, delete behavior, stable link generation, and QR asset generation/download behavior remain unchanged.
3. Buttons, links, inputs, selects, QR image alt text, status states, and disabled states remain keyboard reachable and semantically clear.
4. Future QR rows returned by existing APIs inherit the same row/card treatment without hardcoded today-only values.
5. Screenshot handoff includes `after/reference` artifacts for representative changed admin states before `npm run verify:pre-pr`.
6. Targeted tests, `npm run lint:briefs`, route/label/support sweep, `git diff --check`, `npm run verify:pre-pr`, required CI, and `npm run verify:pre-merge` pass before merge-readiness summary.

## Validation

- Targeted during implementation:
  - `./node_modules/.bin/vitest run tests/unit/admin-qr-links-manager-state.test.tsx`
  - `npm run lint:briefs`
  - `npm run lint:briefs:all`
  - targeted route/label/support sweep listed above
  - `git diff --check`
- Visual gate:
  - Start local Next dev with `env SITE_LOCK_ENABLED=0 npm exec next dev -- -H 127.0.0.1 -p 3000`.
  - Capture representative `after/reference` screenshots against `http://127.0.0.1:3000`.
  - Stop for owner screenshot approval before `npm run verify:pre-pr`.
- Broad gates after screenshot approval:
  - `npm run verify:pre-pr`
  - required PR CI checks
  - `npm run verify:pre-merge`

## Local Tooling Prerequisite

- Node.js LTS/npm available through the repo's normal `nvm use --silent` path.
- Browser screenshot capture uses the local Freeswimming screenshot default from `docs/runbooks/ui-debug-hypothesis-and-handoff.md`.

## Checkpoint Log

- `2026-05-30 | in-progress | started from clean main@6253bd1 after PR #904 and repo-managed closeout #905; post-merge preflight passed with no closeout remaining; owner explicitly requested execution of AW-006 Admin QR Registry Manager Token/Action Parity after fresh queue/design/code re-audit | next: implement scoped manager token/action parity, update tests/docs, run targeted QA, then capture screenshot handoff before broad PR gates`
- `2026-05-30 | in-progress | implemented QR Registry token/action parity in AdminQrLinksManager, updated focused unit assertions, refreshed AW-006 queue/design-inventory active-slice evidence, passed targeted unit test, all-brief lint, route/label/support sweep, and git diff whitespace check, then captured after/reference screenshot artifacts in output/aw-006-admin-qr-registry-token-action-parity-20260530083848 | next: owner screenshot approval before npm run verify:pre-pr, commit, push, PR, CI, and pre-merge gate`
