# Notice And Empty-State Pattern Inventory

## Purpose

This document records the AW-006 inventory for repeated notice, empty, loading, and error
treatments. It is intentionally not a component API spec yet. The goal is to choose one narrow
primitive-consolidation slice before attempting any broader design-system rewrite.

## Current Pattern Types

| Pattern type           | Current use                                                                       | Baseline contract for future consolidation                                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Inline feedback notice | Success, warning, error, and action feedback near a form or admin action.         | Keep the message close to the action, use truthful severity color, preserve accessible announcement where the state changes after user action. |
| Loading state          | Data fetches for admin lists, guide progress, member notices, and protected hubs. | Avoid decorative-only loaders; use concise copy or skeletons only when the wait is meaningful.                                                 |
| Empty state            | No user content, no admin records, no filtered results, or no selected record.    | Distinguish first-run empty from filtered no-results; include one useful next action when the user can resolve it.                             |
| Error and retry state  | Recoverable load/mutation failure.                                                | Show the exact safe user action, usually `Retry`, without hiding protected/authz failures or support-relevant diagnostics.                     |
| Recovery warning       | Partial success or staged data that still needs attention.                        | Keep domain-specific copy in the owning workflow until the recovery contract is stable.                                                        |

## Representative Inventory

| Surface                           | Files                                                                                                                                                                                                                                    | States found                                                                                     | Inventory finding                                                                                                                     | Consolidation decision                                                                                                                 |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Auth sign-in feedback             | `components/auth/AuthRequestStatus.tsx`, `components/auth/AuthErrorNotice.tsx`                                                                                                                                                           | sent, cooldown, error                                                                            | Good state machine exists, but two components style similar auth feedback differently and only one has `role="status"` + `aria-live`. | Candidate later, but auth is high-sensitivity and should not be the first primitive pilot.                                             |
| Contact and analysis request form | `components/ContactForm.tsx`                                                                                                                                                                                                             | field errors, submit error, success                                                              | Public conversion copy and proof cards already use AW-006 tokens; submit error is route-local and visually close to the form.         | Leave alone until a shared public form-feedback contract exists.                                                                       |
| My Library new-content notice     | `components/my-library/MyLibraryNewContentNotice.tsx`                                                                                                                                                                                    | loading, error, retry, status notice, dismissible detail list                                    | Strongest token-backed member notice reference after PR `#758`; it uses `fs-library-card`, clear retry, and polite live status.       | Reference surface only for now; no member behavior changes in the inventory slice.                                                     |
| My Library hub empty/member cards | `components/my-library/MyLibraryHub.tsx`                                                                                                                                                                                                 | owned/explore empty-ish cards, commerce/account guidance                                         | Recently polished with route-local token hierarchy.                                                                                   | Do not disturb immediately after My Library surface polish.                                                                            |
| Admin management panels           | `components/admin/AdminCommerceManager.tsx`, `components/admin/AdminOperationsManager.tsx`, `components/admin/AdminQrLinksManager.tsx`, `components/admin/AdminEmailTemplatesManager.tsx`, `components/admin/AdminCategoriesManager.tsx` | loading, schema warning, load error + retry, action error, action notice, empty list, no matches | These repeat the same card classes, copy shape, retry button, and dashed empty containers across one bounded admin family.            | Best next primitive pilot: create one small admin feedback/list-state helper and migrate two or three low-risk manager surfaces first. |
| Admin messages                    | `components/admin/AdminMessagesManager.tsx`                                                                                                                                                                                              | warning, error, notice, action error, loading list, no matches, no selection                     | Similar to other admin managers, but has a two-pane selection model and delivery diagnostics.                                         | Include as a reference or second-wave consumer, not first pilot.                                                                       |
| Admin notes/content managers      | `components/admin/AdminNotesManager.tsx`, `components/admin/AdminContextNotesPanel.tsx`, `components/admin/AdminContentManager.tsx`                                                                                                      | loading, warning, errors, recovery warnings, upload retry, empty, no matches                     | Dense, high-value operator workflows with staged uploads, related records, and recovery behavior.                                     | Defer. They need workflow-specific regression coverage before shared primitive migration.                                              |
| Guide progress trackers           | `components/guides/Guide0To1000Tracker.tsx`, `components/guides/PoolsideGuideTracker.tsx`                                                                                                                                                | loading skeletons, offline/sync error, retry sync, saved status                                  | The two guide trackers are sibling surfaces and share a domain-specific sync/offline model.                                           | Separate future guide-sync-state cleanup, not the admin primitive pilot.                                                               |
| Dryland and micro sessions        | `components/my-library/dryland/DrylandBuilderHub.tsx`, `components/my-library/dryland/DrylandMicroPlanPanel.tsx`                                                                                                                         | schema warning, load error, route refresh, action error/success, empty sessions                  | Complex stateful training flows with many local/server boundaries.                                                                    | Defer until a route-owned dryland cleanup slice needs these states.                                                                    |
| Poolside PDF/download             | `components/guides/GuidePdfDownloadButton.tsx`, `components/my-library/workouts/PoolsidePreviewPageClient.tsx`                                                                                                                           | download pending, error, save/export status                                                      | Export states are artifact-specific and have image/PDF validation risk.                                                               | Defer; do not pull into generic notice work.                                                                                           |

## Completed Primitive Pilot

Completed AW-006 implementation slice:

`Admin management feedback and list-state primitive pilot`

Completed implementation brief:

`docs/task-briefs/done/2026-05-19-aw-006-admin-management-feedback-list-state-primitive-pilot-10-10.md`

Completed scope:

- Build one small admin-local helper for manager feedback/list states, likely under `components/admin/`.
- Start with low-risk admin manager surfaces that already share the same structure:
  - `AdminCommerceManager`
  - `AdminOperationsManager`
  - `AdminQrLinksManager` or `AdminEmailTemplatesManager`
- Preserve copy, fetch behavior, retry callbacks, authz, schema warning behavior, and mutation logic.
- Add focused component/unit coverage around the helper and one migrated manager.
- Use `after/reference` screenshot handoff if rendered admin UI changes.

## Completed Primitive Expansion Slice

Completed AW-006 implementation slice:

`Shared notice/empty-state primitive expansion`

Done implementation brief:

`docs/task-briefs/done/2026-05-19-aw-006-shared-notice-empty-state-primitive-expansion-10-10.md`

Scope direction:

- Reuse the existing admin-local `AdminManagerState` helper on one additional bounded surface:
  - `AdminEmailTemplatesManager`
- Preserve copy, fetch behavior, retry callbacks, authz, schema warning behavior, create/update/status mutation logic, and revision-history behavior.
- Add focused component/unit coverage around Email templates loading, load error+retry, empty list, action feedback, and revision-history states.
- Use `after/reference` screenshot handoff because rendered admin UI changes.

Do not include:

- auth sign-in feedback,
- contact form conversion states,
- My Library new-content behavior,
- admin notes/content upload recovery,
- guide offline/sync states,
- dryland/micro session state flows,
- public visual redesign,
- Supabase, Stripe, auth, analytics, or API behavior.

## Active Primitive Completion Slice

Active AW-006 implementation slice:

`Admin Categories state primitive completion`

Active implementation brief:

`docs/task-briefs/in-progress/2026-05-19-aw-006-admin-categories-state-primitive-completion-10-10.md`

Scope direction:

- Reuse the existing admin-local `AdminManagerState` helper on one remaining low-risk admin management surface:
  - `AdminCategoriesManager`
- Preserve copy, fetch behavior, retry callbacks, authz, schema warning behavior, create/update/delete mutation logic, scope switching, sort behavior, and delete confirmation behavior.
- Add focused component/unit coverage around Categories loading, warning, load error+retry, empty list, and action-error states.
- Use `after/reference` screenshot handoff because rendered admin UI changes.

Do not include:

- category API changes,
- category copy or workflow label changes,
- admin notes/content upload recovery,
- admin messages two-pane selection states,
- guide offline/sync states,
- dryland/micro session state flows,
- public visual redesign,
- Supabase, Stripe, auth, analytics, or API behavior.

## Reuse Rules For Later Implementation

1. Keep the primitive narrow and admin-local until at least one low-risk manager proves it.
2. Model four slots first: `loading`, `warning`, `error+retry`, and `empty/no-results`.
3. Do not generalize recovery warnings until the workflow-specific repair action is stable.
4. Preserve accessibility semantics:
   - action feedback that appears after user action should be announced politely,
   - urgent blocking errors may use `role="alert"` when the existing flow already expects interruption,
   - static empty states should not be noisy live regions.
5. Use the AW-006 token direction where practical, but do not migrate unrelated card/action styling in the same PR.

## Evidence Commands

Inventory was based on targeted code searches:

- `rg -n "Loading .*|Could not load .*|Retry|No .* yet|No .* match|border-dashed border-slate-300|actionNotice|actionError|warning \\?" components/admin --glob '*Manager.tsx'`
- `rg -n "role=\"status\"|role=\"alert\"|aria-live=\"polite\"|aria-live=\"assertive\"" app components --glob '*.{tsx,ts}'`
- `rg -n "fs-(library-card|surface-card|program-card|cta|color|radius|border|shadow)" app components tests docs --glob '!docs/task-briefs/done/**'`
