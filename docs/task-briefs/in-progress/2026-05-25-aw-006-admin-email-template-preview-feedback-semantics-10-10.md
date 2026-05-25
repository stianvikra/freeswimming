# Task Brief: AW-006 Admin Email Template Preview Feedback Semantics (10/10)

## Metadata

- `id`: `2026-05-25-aw-006-admin-email-template-preview-feedback-semantics-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-25`
- `updated`: `2026-05-25`
- `parent_backlog`: `AW-006` in `docs/task-briefs/in-progress/2026-02-17-additional-work-backlog.md`
- `canonical_queue`: `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- `design_inventory`: `docs/design/notice-empty-state-pattern-inventory.md`
- `branch`: `aw-006-admin-email-template-preview-feedback`

## Brief Audit Record

- `last_audited`: `2026-05-25`
- `base`: `main@a70d0ce`
- `audit_status`: `ready`
- `decision`: Execute this as the next bounded AW-006 admin feedback semantics slice.
- `reason`: PR `#847` and repo-managed closeout PR `#848` left no active AW-006 implementation slice. A fresh queue/design/code re-audit found `AdminEmailTemplatesManager` still renders create/edit preview JSON errors and missing preview values as local red/amber text while the same manager already uses `AdminManagerState` for top-level and revision-history states.
- `must_refresh_before_execution_if`: Refresh if `AdminEmailTemplatesManager`, `AdminManagerState`, admin email-template APIs, placeholder rendering helpers, scorecard categories, screenshot handoff rules, forward compatibility rules, or verification lanes change before merge.

## Goal

Make Admin Email Templates preview error/warning feedback use the existing admin-local state primitive without changing template data, preview rendering, placeholders, APIs, or email delivery.

## Pre-Implementation Owner Explanation

Vi rydder de små varslene i Admin Email Templates-previewen. Det betyr at ugyldig JSON og manglende preview-verdier vises med samme ryddige admin-standard som lasting, feil og tomme stater ellers i flaten. Utenfor scope er e-postutsending, mal-API, Supabase, auth, workflow-labels, Help/Guide og bred designsystem-ombygging.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for a `10/10` claim:

- `UX flow clarity`
- `Business logic correctness and data integrity`
- `Admin editor ergonomics`
- `Accessibility (a11y)`
- `Reliability and failure handling`
- `Security and authz`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                                               | Evidence                                                               | Expected Closeout Score |
| --------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Admin Email Templates keeps the same page purpose and create/edit preview workflow while preview feedback becomes consistent with adjacent admin manager state rendering.        | component diff + screenshot handoff                                    | `5/5`                   |
| UX flow clarity                               | `target`     | Create and edit preview JSON errors and missing preview values use clear state treatment near the preview, with no dead-end or hidden retry/action requirement.                  | focused component tests + screenshot handoff                           | `5/5`                   |
| Visual design quality                         | `target`     | Preview feedback matches the existing `AdminManagerState` visual language without crowding the preview panel on desktop/mobile admin captures.                                   | screenshot handoff                                                     | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Placeholder extraction, preview sample parsing, rendered subject/body, fallback defaults, missing-key calculation, fetches, mutations, and persisted templates remain unchanged. | focused tests + code review                                            | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admins can still create/edit templates and read preview diagnostics quickly, with invalid JSON and missing values more scannable in both create and edit contexts.               | focused tests + screenshot handoff                                     | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Preview errors announce with error semantics and missing preview warnings use polite status semantics without adding noisy announcements for static preview content.             | role/aria assertions in focused tests                                  | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: this swaps local markup for an existing component, adds no dependency, no route fetch, no asset, and no meaningful JS payload growth.                           | package diff + implementation review                                   | `4/5`                   |
| Data placement and sync boundaries            | `N/A`        | N/A because this slice changes no local storage, server-canonical email-template data, sync trigger, conflict policy, retention rule, cache mutation, or persisted state.        | explicit state-boundary scope review                                   | `N/A`                   |
| Caching and invalidation strategy             | `N/A`        | N/A because no fetch cache mode, API response, revalidation trigger, route cache, or stale-data behavior changes.                                                                | explicit cache scope review                                            | `N/A`                   |
| Reliability and failure handling              | `target`     | Invalid JSON and missing preview-value states remain deterministic and recover automatically as the admin edits sample JSON or placeholders.                                     | focused tests for invalid-to-valid preview recovery                    | `5/5`                   |
| Security and authz                            | `target`     | Admin authz, API calls, template mutation boundaries, raw provider behavior, and secret handling remain untouched; preview text does not expose secrets beyond existing input.   | code review + no API/auth diff                                         | `5/5`                   |
| Privacy and compliance                        | `supporting` | Supporting only: preview values remain admin-entered UI text; this PR stores no new personal data and adds no logs/events/provider diagnostics.                                  | code review                                                            | `4/5`                   |
| Content governance                            | `supporting` | Supporting only: email template content model, status workflow, locale fields, revisions, and publish ownership remain unchanged.                                                | diff review                                                            | `4/5`                   |
| Admin workflow and editability                | `target`     | Existing create/edit/save/publish/archive controls remain unchanged; only preview feedback rendering changes.                                                                    | targeted tests + route/label/support sweep                             | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this admin-only UI change affects no public route, metadata, sitemap, robots, canonical URL, or structured content.                                                  | explicit SEO scope rationale                                           | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this admin-only UI change exposes no public semantic entity, structured data, crawl-safe content, or AI-facing documentation surface.                                | explicit AI-discoverability scope rationale                            | `N/A`                   |
| Analytics and KPI observability               | `N/A`        | N/A because this slice changes no event taxonomy, analytics payload, logging, dashboard, or KPI definition.                                                                      | explicit analytics scope rationale                                     | `N/A`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no Stripe, pricing, checkout, entitlement, invoice, refund, payout, billing portal, or revenue reporting path.                                    | explicit commerce scope rationale                                      | `N/A`                   |
| Incident response and support operations      | `N/A`        | N/A with scope rationale: no support workflow, alert path, runbook procedure, incident diagnostic, recovery path, or operator escalation text changes.                           | explicit support-ops scope rationale                                   | `N/A`                   |
| Finance and reporting operations              | `N/A`        | N/A with scope rationale: no finance reconciliation, billing data, payout, invoice, refund, entitlement, product catalog, or revenue report behavior changes.                    | explicit finance scope rationale                                       | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: Email templates have locale fields, and this slice must avoid layout/copy assumptions that block later localized admin strings.                                 | copy review                                                            | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing `AdminManagerState` and admin component patterns; add no dependency, route rewrite, API, migration, or app-wide primitive.                                        | package diff + component diff                                          | `5/5`                   |
| Testing and QA automation                     | `target`     | Add focused unit/component assertions for create/edit preview feedback semantics, run targeted tests, screenshot handoff, then required pre-PR/pre-merge gates.                  | targeted Vitest + screenshot handoff + later gates                     | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: future templates/placeholders continue through existing preview derivation with no new backend cost or traffic-dependent work.                                  | forward compatibility contract + code review                           | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | One PR revert restores previous preview markup; no migrations, provider actions, data repair, or config rollback are needed.                                                     | git diff + validation evidence + PR checks before merge recommendation | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - Reuse `components/admin/AdminManagerState.tsx` in `components/admin/AdminEmailTemplatesManager.tsx`.
  - Keep the component client-side boundary unchanged.
  - Do not introduce routes, API handlers, server actions, or cache behavior changes.
- TypeScript/domain contracts:
  - Preserve `parsePreviewSampleValues`, `extractAdminEmailTemplatePlaceholders`, and `renderAdminEmailTemplatePreview` behavior.
  - No email-template type, status, locale, placeholder, or revision contract changes.
- Supabase/data layer:
  - N/A; no migrations, RLS/authz, generated types, storage, indexes, or DB reads/writes change.
- External services/tools:
  - N/A; no email provider, Stripe, Supabase provider setting, webhook, secret, retry, idempotency, or observability integration change.
- UI system:
  - Mature reference surface is the same manager's existing `AdminManagerState` usage for loading, load error, action feedback, empty, and revision-history states.
  - Screenshot handoff comparison type: `after/reference`, comparing create/edit preview feedback against existing Email Templates/admin state primitive rendering where practical.
- Testing:
  - Add focused component tests in `tests/unit/admin-email-templates-manager-state.test.tsx`.
  - Existing admin email-template preview e2e remains a supporting regression reference; targeted unit coverage owns this small slice.

## Data Placement And Sync Contract

N/A with rationale: this is a UI feedback rendering cleanup. It introduces no local-only state, server-canonical state, browser storage, sync trigger, conflict policy, cache invalidation, retention rule, or sensitive data handling. Email templates and revisions remain server-canonical through existing admin APIs; preview values remain transient admin-entered form state.

## Identity And Rename Contract

N/A with rationale: this slice creates no persisted product entity, email-template identity, route param, slug, title identity, operator-visible identifier, alias, redirect, rename, or repurpose behavior.

## Forward Compatibility Contract

- Extensibility surfaces:
  - Admin email templates, locales, placeholders, fallback defaults, and preview sample JSON values.
- Source of truth:
  - Template rows, locale fields, subject/body text, and placeholder arrays remain server/API data.
  - Placeholder detection and missing/fallback preview derivation remain owned by existing email-template helpers.
- Additive behavior:
  - New templates, locales, and placeholders continue to render through the same preview panel and state primitive without code changes.
  - Unknown placeholders continue to surface through the existing missing-key list.
- Explicit mapping requirements:
  - New provider-specific email behavior, template status workflows, or user-facing/support copy still require explicit product/docs/test updates outside this slice.
- Unknown or deprecated values:
  - Unknown preview placeholders stay visible as missing preview values; invalid JSON stays blocked to an admin-visible preview error until corrected.
- Test/evidence:
  - Focused tests must prove invalid JSON and missing preview values render through the primitive and recover when inputs become valid/complete.

## Help / Guide Impact

N/A with rationale: this changes no admin workflow labels, actions, recovery procedure, Help/Guide content contract, support runbook, auth, payments, or operator instructions. It only changes the visual/semantic wrapper around existing preview diagnostics.

## Route / Label / Support Surface Sweep

Required before broad gates because admin feedback semantics are touched.

- Identifiers to search:
  - `AdminEmailTemplatesManager`
  - `Preview sample values`
  - `Preview sample values must be valid JSON`
  - `Missing preview values`
  - `admin-email-template-create-preview-error`
  - `admin-email-template-create-preview-missing`
  - `AdminManagerState`
- Surfaces to check:
  - `components/admin/`
  - `tests/unit/`
  - `tests/e2e/`
  - `docs/design/`
  - canonical AW-006 queue and this active brief
- Expected fallout:
  - component, focused tests, canonical queue, design inventory, and this brief only.
  - no Help/Guide, API, route, support runbook, workflow label, or email-provider change expected.

## Scope

- `components/admin/AdminEmailTemplatesManager.tsx`
- `tests/unit/admin-email-templates-manager-state.test.tsx`
- `docs/design/notice-empty-state-pattern-inventory.md`
- `docs/task-briefs/planned/2026-05-17-aw-006-ux-ui-design-review-capture-and-next-slices-10-10.md`
- this active task brief
- Screenshot artifacts under `output/aw-006-admin-email-template-preview-feedback-YYYY-MM-DD-HHMMSS/`

## Out Of Scope

- Email-template APIs, schema, RLS/authz, migrations, generated DB types, audit history, revision restore, publish/archive semantics, locale model, and placeholder rendering logic.
- Email provider delivery, Supabase Auth, Stripe, checkout, entitlements, analytics taxonomy, metadata/SEO, Help/Guide, support runbooks, and admin workflow labels.
- Broad shared Notice/EmptyState primitive work or redesign of Admin Email Templates.
- `npm run verify:pre-pr`, PR creation/update, CI monitoring, and `npm run verify:pre-merge` until owner approves or waives screenshot review.
- Merge without explicit owner approval.

## Acceptance Criteria

1. Create preview invalid JSON feedback uses `AdminManagerState` with error semantics and keeps the existing message text.
2. Create preview missing values feedback uses `AdminManagerState` with warning/status semantics and keeps the existing missing-key list.
3. Edit preview invalid JSON and missing values receive the same treatment as create preview.
4. Placeholder detection, rendered subject/body, fallback defaults, missing-key calculation, form values, fetches, mutations, and email-template API behavior remain unchanged.
5. Focused component tests cover create/edit preview error/warning semantics and invalid-to-valid recovery.
6. Canonical AW-006 queue and notice/empty-state inventory record this active slice.
7. Screenshot handoff includes representative after/reference artifacts before broad gates.

## Validation

Targeted before screenshot handoff:

- `npm run lint:briefs`
- `./node_modules/.bin/vitest run tests/unit/admin-email-templates-manager-state.test.tsx`
- `npm run lint`
- `npm run typecheck`
- `git diff --check`

After owner screenshot approval:

- `npm run verify:pre-pr`
- push/open PR
- required CI checks green
- `npm run verify:pre-merge`

## Manual QA / Screenshot Handoff

Required because rendered admin UI changes.

- Start local Next dev with `SITE_LOCK_ENABLED=0`.
- Capture against `http://127.0.0.1:3000`.
- Comparison type: `after/reference`.
- Artifact folder: `output/aw-006-admin-email-template-preview-feedback-YYYY-MM-DD-HHMMSS/`.
- Representative screenshots:
  - `after-email-template-create-preview-error-desktop.png`
  - `after-email-template-edit-preview-warning-desktop.png`
  - `reference-email-template-existing-admin-state-desktop.png`

## Implementation Checkpoint Log

- `2026-05-25 | in-progress | started from clean main@a70d0ce after PR #847 and closeout PR #848; created branch aw-006-admin-email-template-preview-feedback and active brief for Admin Email Templates preview feedback semantics | next: migrate create/edit preview diagnostics to AdminManagerState, add focused tests, update queue/inventory, run targeted validation, and capture screenshot handoff before broad gates`
- `2026-05-25 | screenshot-review | migrated create/edit preview JSON errors and missing preview values to AdminManagerState, added focused component coverage, refreshed the canonical queue/design inventory, and captured after/reference screenshots in output/aw-006-admin-email-template-preview-feedback-2026-05-25-152911 at 2026-05-25 15:29; validation passed: npm run lint:briefs:all, ./node_modules/.bin/vitest run tests/unit/admin-email-templates-manager-state.test.tsx, npm run lint (one existing warning in output/capture-aw006-dryland-feedback.mjs), npm run typecheck, git diff --check, and targeted route/label/support sweep | next: wait for owner screenshot approval before npm run verify:pre-pr, PR creation, and npm run verify:pre-merge`
