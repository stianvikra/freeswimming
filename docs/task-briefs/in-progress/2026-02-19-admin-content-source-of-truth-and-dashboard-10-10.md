# Task Brief: Admin Content Source Of Truth And Dashboard 10/10

## Metadata

- `id`: `2026-02-19-admin-content-source-of-truth-and-dashboard-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-02-19`
- `updated`: `2026-02-20`

## Goal

Make admin/dashboard the reliable source of truth for platform content (modules, lessons, drills, programs) with 10/10 UX, backend safety, and operational control.

## Decisions Locked

- Publish model: `manual` only.
- Workflow: `draft -> review -> published -> archived`.
- Approval: `self publish` is allowed for admins (no separate approver requirement now).
- Mutation access: admin backend only (`viewer/editor/admin` role boundaries).
- Owner field: required on admin-managed records.
- Languages: build single-language first, but schema and APIs must be i18n-ready.

## Scope

- Replace hardcoded platform content with database-backed content model:
  - course modules,
  - course lessons,
  - guide sessions,
  - guide drills,
  - programs/products metadata linkage.
- Add robust admin content architecture:
  - hierarchical content tree,
  - status workflow,
  - revision/audit trail,
  - owner assignment,
  - category management for notes and content.
- Expand admin dashboard UX:
  - content section with parity/mirror health,
  - notes section with category/date/done state,
  - category management UI,
  - clear loading/empty/error/retry states.
- Ensure backend access controls and mutation policies are strict and deterministic.
- Add migration/import pipeline to move existing hardcoded data into DB.
- Add read-path strategy:
  - phase-safe dual-read while migrating,
  - final DB-first source of truth.

## Out Of Scope

- Full multi-language rollout and translated editorial UI.
- Marketing CMS pages outside current app scope.
- Non-admin public authoring.

## Architecture Target (10/10)

- Data model (minimum):
  - `admin_content_items` (hierarchy + status + ownership + sort),
  - `admin_content_revisions` (immutable change history),
  - `admin_content_categories` (admin-defined categories),
  - `admin_notes` (title/body/category/date/done/owner),
  - `admin_note_categories` (admin-defined note categories).
- Contracts:
  - typed API payload validation,
  - deterministic error codes for invalid auth/role/payload/schema states.
- Source of truth:
  - platform render paths read from DB content records,
  - parity contract confirms app content matches admin-managed records.

## UX And Design Target (10/10)

- Information architecture:
  - top-level tabs: `Content`, `Commerce`, `Operations`, `Notes`, `Categories` (or embedded category manager).
- Module-level quality requirement:
  - every module/content surface must meet 10/10 UX and design quality, not only backend correctness.
  - each module must have clear primary action, clear information hierarchy, and consistent interaction patterns.
  - each module must explicitly handle `loading`, `empty`, `error`, and `retry` states with polished UI.
- Content UX:
  - tree view by type/parent,
  - fast filter/search,
  - status badges and owner visibility,
  - last-updated metadata.
- Editor UX:
  - concise, consistent form fields,
  - validation hints before submit,
  - explicit save/publish actions,
  - clear optimistic feedback and rollback-safe errors.
- Notes UX:
  - create/edit/delete,
  - category picker,
  - date picker,
  - done checkbox,
  - sort/filter by date/category/status.
- Reliability UX:
  - every section has `loading`, `empty`, `error`, `retry`,
  - schema-not-ready warnings are actionable (not generic failures).
- Design consistency:
  - visual language, spacing, and typography must be consistent across all admin modules.
  - no “unfinished” module surfaces are accepted as done.

## Security, Privacy, And Access Control

- Admin-only mutation APIs.
- Role boundaries:
  - `viewer`: read only,
  - `editor`: create/update,
  - `admin`: full control (including destructive actions and governance).
- RLS and server-side role checks both enforced.
- Audit trail for all content/notes mutations:
  - actor id/email,
  - action,
  - before/after payload,
  - timestamp.
- No sensitive internal errors returned to client.

## i18n Strategy (Build First, Localize Later)

- Build product in one language now.
- Keep schema forward-compatible for localization by reserving fields/relations for future locale variants.
- Do not implement translation workflow in this task.

## Acceptance Criteria

- Existing hardcoded course/guide/program structures are represented in DB with migration/import coverage.
- Public app reads platform content from DB (with transitional fallback only if explicitly documented).
- Admin can create/update/publish/archive content with correct role enforcement.
- Admin can manage note categories and content categories from dashboard.
- Admin notes support title, body, category, date, done flag, and owner.
- Mirror/parity panel reports alignment between platform content and admin records.
- All new/changed APIs return deterministic statuses for auth/role/schema/payload errors.
- Audit/revision evidence exists for content and notes mutations.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run build`
- `npm run test:e2e -- tests/e2e/admin-foundation.spec.ts`
- relevant new admin/content parity e2e tests added and passing

## Manual QA Environments

- Local:
  - `http://127.0.0.1:3000/admin`
  - verify content CRUD/status transitions
  - verify notes CRUD/category/date/done
  - verify parity mirror reflects platform structures
- Vercel preview:
  - verify identical admin behavior and role gates

## Constraints

- Keep current visual language; improve clarity and structure without style drift.
- Avoid duplicate tests; extend existing suites first.
- Preserve backward compatibility during migration phase.

## 10/10 Cross-Cut Categories (Apply When Relevant)

State scope or `N/A` for each category during implementation and closeout:

- Content governance and source-of-truth: canonical model, required fields, owner assignment, revision/rollback policy.
- Taxonomy and category management: naming rules, sorting, and active/archive lifecycle.
- Workflow and publishing safety: status model (`draft/review/published/archived`), publish safeguards, destructive confirmation.
- RBAC and auditability: role boundaries per endpoint/UI action and audit trail for sensitive mutations.
- UX/UI quality contract: clear primary action and required states (`loading`, `empty`, `error`, `retry`).
- Performance contract: latency/render/payload guardrails for changed surfaces.
- Testing contract: unit + e2e coverage for critical and negative paths; avoid duplicate tests.
- Observability and KPI tracking: required events/logs and measurable thresholds.
- Migration and rollback readiness: rollout plan, compatibility window, rollback path.
- Definition-of-done quant targets: explicit measurable pass criteria.

## Observability And KPI Contract

- Required admin telemetry/logging:
  - content mutation success/failure,
  - note mutation success/failure,
  - parity mismatch count over time,
  - schema-not-ready occurrences.
- KPI targets:
  - zero unexpected 500s on expected admin deny/missing-schema paths,
  - parity mismatch trend goes to zero after migration completion.

## Implementation Phases

1. Data foundation and migration scaffolding.
2. Import existing hardcoded content into DB.
3. Admin categories + owner support.
4. Content read-path switch to DB (with temporary fallback contract).
5. Parity verification, hardening, and cleanup.

## Session Continuity And Recovery

- Canonical source: git branch + this brief.
- Checkpoints every validated slice.
- Recovery:
  1. `git status -sb`
  2. `git log --oneline -n 10`

3. reopen this brief and continue from latest checkpoint.

## Implementation Checkpoint Log

- `2026-02-20 | working tree | moved brief to in-progress and started admin API hardening for schema/policy readiness handling | patch schema helpers + admin routes and validate with tests`
- `2026-02-20 | working tree | hardened admin schema helpers + products APIs/UI for setup-not-ready fallback (no red 500 for missing grants/RLS) | commit checkpoint + push + PR`

## Final Closeout Gate

- Confirm all acceptance criteria completed or explicitly deferred.
- Confirm admin UX states (`loading/empty/error/retry`) for changed surfaces.
- Confirm no regressions on public content rendering.
- Ask owner before moving brief to `done` and before post-merge cleanup.

## Completion Record (fill when done)

- `PR`: link
- `merge`: source -> target
- `result`: short summary
