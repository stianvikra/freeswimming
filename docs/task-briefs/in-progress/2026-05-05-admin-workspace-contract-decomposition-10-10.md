# Task Brief: Admin Workspace Contract Decomposition (10/10)

## Metadata

- `id`: `2026-05-05-admin-workspace-contract-decomposition-10-10`
- `status`: `in-progress`
- `owner`: `stianvikra`
- `created`: `2026-05-05`
- `updated`: `2026-05-06`

## Goal

Decompose mature admin workspace surfaces into smaller typed orchestration, mutation, and view contracts while preserving admin content, notes, QR, email-template, commerce, and operations behavior.

## Why This Brief Exists

The platform architecture audit found large admin UI concentration:

- `components/admin/AdminContentManager.tsx` at `4610` lines,
- `components/admin/AdminNotesManager.tsx` at `2535` lines,
- `components/admin/AdminContextNotesPanel.tsx` at `1582` lines,
- `components/admin/AdminQrLinksManager.tsx` at `1240` lines,
- `components/admin/AdminEmailTemplatesManager.tsx` at `1151` lines.

The workflows are mature and well covered, but additional admin features should not continue to accumulate state and rendering in the same client managers.

This brief is now also a prerequisite for the Admin Message Management parent:

- `docs/task-briefs/planned/2026-05-06-admin-message-management-parent-10-10.md`

The message inbox/reply workflow must not be added as another large route-local admin manager. This architecture slice should establish a narrow admin message module boundary before inbox UI implementation.

## Admin Message Module Dependency

- Define where Admin Messages v1 enters the admin workspace navigation and route/module tree.
- Define the typed boundary between:
  - admin message orchestration state,
  - admin message route/API mutations,
  - admin message presentational list/detail/reply panels.
- The decomposition can be intentionally narrow:
  - it does not need to refactor all mature admin managers before Admin Messages work,
  - it must create enough pattern/evidence that the inbox and reply UI do not increase existing admin-manager concentration.
- Screenshot handoff is required if admin navigation, tabs, or workspace layout changes.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Admin editor ergonomics`
- `Admin workflow and editability`
- `Security and authz`
- `Reliability and failure handling`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                 | Evidence                            | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Admin workspace tabs and route purposes remain clear after extraction; no duplicate admin entrypoint model is introduced.          | admin IA review + route sweep       | `5/5`                   |
| UX flow clarity                               | `target`     | Create/edit/publish/revert/delete/recover flows keep current next-step clarity and no dead-end states.                             | E2E + manual QA                     | `5/5`                   |
| Visual design quality                         | `target`     | Extracted panels preserve current visual hierarchy, density, and responsive behavior.                                              | screenshot handoff                  | `5/5`                   |
| Business logic correctness and data integrity | `target`     | Admin content status, revisions, notes, attachments, links, QR, email templates, and products keep deterministic mutation rules.   | route/unit negative tests           | `5/5`                   |
| Admin editor ergonomics                       | `target`     | High-frequency admin operations require no extra avoidable steps and keep existing recovery affordances.                           | admin manual QA + Help/Guide review | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Extracted controls preserve labels, focus order, keyboard reachability, and modal/panel semantics.                                 | component/E2E a11y checks           | `5/5`                   |
| Performance (CWV + payloads)                  | `target`     | Admin route payload and interaction latency do not regress materially; no new heavy dependency is added.                           | build/perf review                   | `5/5`                   |
| Data placement and sync boundaries            | `target`     | Admin mutations remain server-canonical in Supabase; local form draft state remains local until explicit save.                     | data-boundary review                | `5/5`                   |
| Caching and invalidation strategy             | `target`     | Admin fetches and mutations keep explicit freshness behavior and refresh affected lists/details deterministically.                 | route/component tests               | `5/5`                   |
| Reliability and failure handling              | `target`     | Fetch/upload/save/revert/delete failures remain recoverable and do not corrupt local editor state.                                 | failure-path tests                  | `5/5`                   |
| Security and authz                            | `target`     | Admin/editor role gates continue to fail closed with `401`/`403` negative coverage.                                                | API guard tests                     | `5/5`                   |
| Privacy and compliance                        | `target`     | Admin notes, images, support diagnostics, and logs avoid leaking private content beyond authorized admin surfaces.                 | privacy/log review                  | `5/5`                   |
| Content governance                            | `target`     | Admin content source-of-truth, status workflow, revision history, and rollback semantics remain documented.                        | docs/runbook review                 | `5/5`                   |
| Admin workflow and editability                | `target`     | Edited admin entities remain safely createable, updateable, publishable, revertible, and deletable according to existing rules.    | admin tests + manual QA             | `5/5`                   |
| SEO and crawlability                          | `supporting` | Supporting only: admin surfaces are private; public content output must not drift if admin content structures are touched.         | public route spot check             | `4/5`                   |
| AI discoverability                            | `supporting` | Supporting only: public semantic output must not change unless explicitly scoped.                                                  | scope review                        | `4/5`                   |
| Analytics and KPI observability               | `target`     | Admin workflow events keep stable typed names and safe payloads when touched.                                                      | analytics tests                     | `5/5`                   |
| Commerce and revenue ops                      | `supporting` | Supporting only: admin product edits must preserve Stripe price/entitlement reconciliation if commerce tab is touched.             | finance checklist review            | `4/5`                   |
| Incident response and support operations      | `target`     | Admin recovery and support diagnostics remain documented for changed workflows.                                                    | runbook/Help impact sweep           | `5/5`                   |
| Finance and reporting operations              | `supporting` | Supporting only: product/commerce admin changes require reconciliation notes; non-commerce admin extraction has no finance effect. | explicit finance scope rationale    | `4/5`                   |
| i18n operational readiness                    | `supporting` | Supporting only: extracted admin labels should stay centralized enough for later localization.                                     | copy placement review               | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing React, fetch/API, Supabase, and UI primitives; add no dependency for state decomposition.                             | package diff + code review          | `5/5`                   |
| Testing and QA automation                     | `target`     | Existing admin unit/E2E suites are extended rather than duplicated.                                                                | targeted tests + verify gate        | `5/5`                   |
| Scalability and cost efficiency               | `target`     | Decomposition reduces duplicate fetch/state work and avoids extra admin API chatter.                                               | request/state review                | `5/5`                   |
| DevOps and rollback readiness                 | `target`     | Refactor slices are reversible and avoid schema changes unless separately briefed.                                                 | PR plan + rollback notes            | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - split admin client managers into typed hooks/view-models and presentational panels,
  - establish the Admin Messages module boundary before inbox/reply UI is implemented.
- TypeScript/domain:
  - keep admin entity schemas and mutation contracts in `lib/admin/*`.
- Supabase:
  - preserve existing RLS/admin role assumptions and service-role boundaries.
- UI:
  - preserve current admin workspace visual language; screenshot handoff is required for changed UI.
- Testing:
  - extend existing admin route/component/E2E suites.

## Data Placement And Sync Contract

- Server-canonical:
  - admin content, categories, notes, attachments, links, QR links, email templates, products, runtime flags.
- Local-only:
  - unsaved form state, panel state, filters, current selection, and staged uploads.
- Sync policy:
  - mutations must round-trip through route handlers; optimistic state may only reflect non-destructive pending state.
- Cache/invalidation:
  - changed admin lists/details refresh after mutation and keep current no-store/private assumptions.

## Identity And Rename Contract

- Canonical stable ID:
  - admin entity IDs remain immutable.
- Human-readable identifiers:
  - titles, slugs, labels, and statuses remain editable only under existing workflow rules.
- Rename vs repurpose:
  - material content/entity repurpose must not silently reuse an identifier when history or support diagnostics would become misleading.
- Compatibility:
  - route params, support links, and revision/history views must continue to resolve existing IDs.

## Scope

- Admin content manager decomposition.
- Admin notes manager/context panel decomposition.
- Admin QR/email/product/operations manager extraction only where needed to establish shared patterns.
- Admin Messages module boundary preparation for inbox/reply implementation.
- Help/Guide/runbook impact for any label, action, or recovery behavior change.

## Out Of Scope

- Full Admin Messages inbox/reply runtime implementation; that belongs to the Admin Message Management child briefs.
- New admin products or content models outside the Admin Messages module boundary.
- Broad admin redesign.
- Schema/RLS changes unless explicitly split into a child slice.

## Acceptance Criteria

1. At least one large admin manager is reduced through a typed boundary without behavior loss.
2. Admin route negative paths remain covered.
3. Changed admin UI has screenshot handoff and Help/Guide impact review.
4. No unrelated admin workflow labels/actions change without the route-label-support sweep.
5. Admin Messages has a documented module boundary before inbox/reply UI implementation starts.

## Validation

- `npm run lint:briefs`
- targeted admin unit tests
- targeted admin E2E/screenshot handoff for visual changes
- `npm run verify:pre-pr`

## Implementation Slice

- Establish a typed planned-module boundary for Admin Messages without activating a visible tab or route UI in this PR.
- Reduce `AdminNotesManager` by moving typed note form state, response contracts, context helpers, and presentation labels into `lib/admin/notes-manager.ts`.
- Keep existing admin navigation labels, layout, routes, and Help/Guide copy unchanged in this slice.

## Help/Guide And Screenshot Impact

- Help/Guide: `N/A` for this slice because no active admin labels, actions, recovery steps, or operator instructions change.
- Screenshot artifact handoff: `N/A` because `AdminNotesManager.tsx` changes only move typed helpers/contracts out of the component; no JSX, Tailwind classes, visible copy, active tab, or layout behavior changes. No `output/` artifact folder is produced for this non-visual refactor.
- Owner screenshot approval stop: `N/A` for this non-visual refactor. If this slice expands into visible navigation, tabs, workspace layout, or rendered copy changes, stop for owner screenshot approval before pre-PR.
- Screenshot comparison naming: `N/A` because no screenshots are required for this patch. If visual scope is added, use `before-`/`after-` or `after-`/`reference-` artifact names.

## Checkpoint Log

- `2026-05-06 | pre-pr-pass | implemented typed planned Admin Messages module boundary, documented admin workspace module contracts, and moved Notes form/response/label helpers into lib/admin/notes-manager.ts; targeted vitest passed (3 files, 16 tests), npm run lint:briefs:all passed, npm run typecheck passed, route/support sweep confirmed tab=messages is not active UI, and npm run verify:pre-pr passed full lane (912 unit tests, build, perf budgets, 82 e2e passed / 374 skipped); perf trend recommended tighten after 4 weekly green runs, decision: hold in this non-performance admin contract slice and prompt owner in PR summary to tighten one stretch target in the next perf-governance or performance-relevant slice | next: inspect diff, commit, push, open PR`
- `2026-05-06 | quality-gate-adjustment | first npm run verify:pre-pr stopped in lint:quality-gates because AdminNotesManager.tsx is classified as UI and the brief lacked explicit screenshot N/A evidence; no rendered UI changed, so screenshot artifact handoff, owner screenshot approval stop, and comparison naming are now documented as N/A | next: rerun quality gate and verify:pre-pr`
- `2026-05-06 | in-progress | branch admin-workspace-contract-decomposition-10-10 opened from clean synced main; implementation scoped to a non-visible Admin Messages workspace boundary plus Notes-manager typed helper extraction, with no admin tab/layout/copy activation planned | next: implement contracts and targeted tests`
- `2026-05-06 | planned-update | Admin Message Management parent and child briefs now depend on this brief for a narrow admin message module boundary before inbox/reply UI is implemented | next: execute this architecture slice after external-service contract hardening or as a scoped prerequisite to Admin Messages v1`
- `2026-05-05 | planned | created by platform architecture audit to own mature admin workspace decomposition without mixing it into feature work | next: execute only after owner chooses an admin-maintenance slice`
