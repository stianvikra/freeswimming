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

| Surface                             | Files                                                                                                                                                                                                                                    | States found                                                                                     | Inventory finding                                                                                                                                                                            | Consolidation decision                                                                                                                 |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Auth sign-in feedback               | `components/auth/AuthRequestStatus.tsx`, `components/auth/AuthResendButton.tsx`                                                                                                                                                          | sent, cooldown, error                                                                            | Good state machine exists, and PR `#774/#775` removed the former unused `AuthErrorNotice` overlap while keeping cooldown feedback hydration-safe.                                            | Completed cleanup; keep as a reference for route-owned request feedback, not as an app-wide notice primitive.                          |
| Contact and analysis request form   | `components/ContactForm.tsx`                                                                                                                                                                                                             | field errors, submit error, success                                                              | Public conversion copy and proof cards already use AW-006 tokens; submit error is route-local and visually close to the form.                                                                | Leave alone until a shared public form-feedback contract exists.                                                                       |
| My Library new-content notice       | `components/my-library/MyLibraryNewContentNotice.tsx`                                                                                                                                                                                    | loading, error, retry, status notice, dismissible detail list                                    | Strongest token-backed member notice reference after PR `#758`; it uses `fs-library-card`, clear retry, and polite live status.                                                              | Reference surface only for now; no member behavior changes in the inventory slice.                                                     |
| My Library hub empty/member cards   | `components/my-library/MyLibraryHub.tsx`                                                                                                                                                                                                 | owned/explore empty-ish cards, commerce/account guidance                                         | Recently polished with route-local token hierarchy.                                                                                                                                          | Do not disturb immediately after My Library surface polish.                                                                            |
| Admin management panels             | `components/admin/AdminCommerceManager.tsx`, `components/admin/AdminOperationsManager.tsx`, `components/admin/AdminQrLinksManager.tsx`, `components/admin/AdminEmailTemplatesManager.tsx`, `components/admin/AdminCategoriesManager.tsx` | loading, schema warning, load error + retry, action error, action notice, empty list, no matches | These repeat the same card classes, copy shape, retry button, and dashed empty containers across one bounded admin family.                                                                   | Best next primitive pilot: create one small admin feedback/list-state helper and migrate two or three low-risk manager surfaces first. |
| Admin messages                      | `components/admin/AdminMessagesManager.tsx`                                                                                                                                                                                              | warning, error, notice, action error, loading list, no matches, no selection                     | Similar to other admin managers, but has a two-pane selection model and delivery diagnostics.                                                                                                | Completed second-wave consumer; keep as a reference for two-pane admin state rendering.                                                |
| Admin context QR panel              | `components/admin/AdminContextQrPanel.tsx`                                                                                                                                                                                               | schema warning, action error, action notice, loading, load error + retry, no attached QR links   | PR `#780/#781` moved contextual QR state rendering to the admin-local helper while preserving QR APIs, copy, labels, and editor workflow behavior.                                           | Completed parity consumer; keep as the contextual QR reference beside full QR Registry.                                                |
| Admin notes/content managers        | `components/admin/AdminNotesManager.tsx`, `components/admin/AdminContextNotesPanel.tsx`, `components/admin/AdminContentManager.tsx`                                                                                                      | loading, warning, errors, recovery warnings, upload retry, empty, no matches                     | Dense, high-value operator workflows with staged uploads, related records, and recovery behavior. Admin Notes top-level, Context Notes, and Content Manager top-level state parity are done. | Continue deferring Content Manager recovery/revision workflow states unless explicitly scoped.                                         |
| Guide progress trackers             | `components/guides/Guide0To1000Tracker.tsx`, `components/guides/PoolsideGuideTracker.tsx`                                                                                                                                                | loading skeletons, offline/sync error, retry sync, saved status                                  | The two guide trackers are sibling surfaces and share a domain-specific sync/offline model, and PR `#776/#777` moved them to one guide-local sync-status treatment.                          | Completed cleanup; keep as a reference for domain-local sync/offline status, not as an app-wide notice primitive.                      |
| Checkout success and claim recovery | `app/checkout/success/page.tsx`, `app/claim/page.tsx`, `components/commerce/DownloadResendForm.tsx`                                                                                                                                      | payment received, sign-in/claim next step, resend access link, privacy-safe recovery             | Post-purchase recovery is a conversion-critical route-owned flow with privacy-safe generic responses and entitlement checks outside the page UI.                                             | Completed cleanup; keep as a reference for route-owned recovery clarity, not as an app-wide notice primitive.                          |
| Dryland and micro sessions          | `components/my-library/dryland/DrylandBuilderHub.tsx`, `components/my-library/dryland/DrylandMicroPlanPanel.tsx`                                                                                                                         | schema warning, load error, route refresh, action error/success, empty sessions                  | Complex stateful training flows with many local/server boundaries.                                                                                                                           | Defer until a route-owned dryland cleanup slice needs these states.                                                                    |
| Poolside PDF/download               | `components/guides/GuidePdfDownloadButton.tsx`, `components/my-library/workouts/PoolsidePreviewPageClient.tsx`                                                                                                                           | download pending, error, save/export status                                                      | Export states are artifact-specific and have image/PDF validation risk.                                                                                                                      | Defer; do not pull into generic notice work.                                                                                           |

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

## Completed Primitive Completion Slice

Completed AW-006 implementation slice:

`Admin Categories state primitive completion`

Done implementation brief:

`docs/task-briefs/done/2026-05-19-aw-006-admin-categories-state-primitive-completion-10-10.md`

Completed scope:

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

## Completed Second-Wave Primitive Slice

Completed AW-006 implementation slice:

`Admin Messages state primitive second-wave`

Done implementation brief:

`docs/task-briefs/done/2026-05-19-aw-006-admin-messages-state-primitive-second-wave-10-10.md`

Scope direction:

- Reuse the existing admin-local `AdminManagerState` helper on the primary state renderings in:
  - `AdminMessagesManager`
- Preserve copy, fetch behavior, retry callbacks, authz, filter behavior, pagination, status mutation logic, selection behavior, delete confirmation, delivery diagnostics, and external inbox behavior.
- Add focused component/unit coverage around Messages loading, warning, load error+retry, action feedback, empty/no-results list, and no selected message.
- Use `after/reference` screenshot handoff because rendered admin UI changes.

Do not include:

- message API changes,
- message copy or workflow label changes,
- provider delivery diagnostics changes,
- admin notes/content upload recovery,
- guide offline/sync states,
- dryland/micro session state flows,
- public visual redesign,
- Supabase, Stripe, auth, analytics, or API behavior.

## Completed Auth Feedback Source Of Truth Cleanup Slice

Completed AW-006 implementation slice:

`Auth feedback source-of-truth cleanup`

Done implementation brief:

`docs/task-briefs/done/2026-05-19-aw-006-auth-feedback-source-of-truth-cleanup-10-10.md`

Scope direction:

- Keep the live `/auth/sign-in` request-feedback source in:
  - `AuthRequestStatus`
- Remove or explicitly retire unused overlapping feedback code:
  - `AuthErrorNotice`
- Preserve copy, sign-in state derivation, cooldown math, resend behavior, form actions, redirects, auth provider calls, rate limits, and server-action behavior.
- Start countdown text after client mount so request feedback and resend cooldown labels do not drift during hydration.
- Add focused component coverage for sent, cooldown, error, expired-cooldown, idle feedback, and resend cooldown semantics.
- Screenshot handoff is required before broad gates because auth feedback UI files are touched.

Do not include:

- sign-in server actions,
- auth provider or email delivery changes,
- OTP generation/verification,
- callback redirect logic,
- cooldown cadence changes,
- passkeys,
- private-gate unlock behavior,
- Help/Guide or support-procedure changes,
- Stripe, Supabase, analytics, database, workflow, package, or environment changes.

## Completed Guide Tracker Sync State Clarity Slice

Completed AW-006 implementation slice:

`Guide tracker sync-state clarity`

Done implementation brief:

`docs/task-briefs/done/2026-05-19-aw-006-guide-tracker-sync-state-clarity-10-10.md`

Scope direction:

- Keep guide progress local-first and server-synced through the existing guide progress contract.
- Add at most one guide-local sync status helper under `components/guides/`.
- Apply the same saved/syncing/offline/error/retry treatment to:
  - `Guide0To1000Tracker`
  - `PoolsideGuideTracker`
- Preserve guide progress row normalization, merge/upsert behavior, localStorage keys, guide content, auth redirects, and entitlement boundaries.
- Add focused tests for successful sync status, offline status, recoverable load error, retry recovery, and existing merge/upsert payloads.
- Screenshot handoff is required before broad gates because guide tracker UI changes.

Do not include:

- guide progress API shape changes,
- guide route auth or entitlement changes,
- localStorage key changes,
- PWA service worker/offline-shell work,
- dryland/micro-session state flows,
- Poolside PDF/export states,
- public visual redesign,
- Supabase, Stripe, analytics, database, workflow, package, or environment changes.

## Completed Checkout Success And Claim Recovery Clarity Slice

Completed AW-006 implementation slice:

`Checkout success and claim recovery clarity`

Done implementation brief:

`docs/task-briefs/done/2026-05-20-aw-006-checkout-success-claim-recovery-clarity-10-10.md`

Completed scope:

- Keep `/checkout/success` and `/claim` route-owned.
- Preserve `DownloadResendForm` request behavior and privacy-safe generic resend responses.
- Make payment received, My Library, sign-in, and claim/resend recovery next steps clearer.
- Preserve signed-in claim redirect, safe sign-in source context, session reference handling, and existing server helpers.
- Add focused route render tests and screenshot handoff.

Do not include:

- Stripe Checkout Session payload changes,
- webhooks or entitlement upserts,
- auth provider behavior,
- email delivery/provider templates,
- resend API payload shape changes,
- analytics taxonomy changes,
- Supabase, database, finance, or reporting behavior,
- app-wide notice primitive rollout.

## Completed Admin Context QR Panel State Primitive Parity Slice

Completed AW-006 implementation slice:

`Admin Context QR Panel state primitive parity`

Done implementation brief:

`docs/task-briefs/done/2026-05-20-aw-006-admin-context-qr-panel-state-primitive-parity-10-10.md`

Completed scope:

- Reuse the existing admin-local `AdminManagerState` helper on the contextual QR panel embedded in admin content editing:
  - `AdminContextQrPanel`
- Preserve copy, fetch behavior, retry callbacks, authz, create/update/delete payloads, copied-link behavior, status toggles, delete confirmation, and content-editor placement.
- Add focused component/unit coverage around Context QR loading, warning, load error+retry, empty state, and action feedback.
- Use `after/reference` screenshot handoff because rendered admin UI changes.

Do not include:

- QR API changes,
- QR slug/status behavior changes,
- full QR Registry changes beyond reference comparison,
- admin content editor layout redesign,
- admin notes/content upload recovery,
- guide offline/sync states,
- dryland/micro session state flows,
- public visual redesign,
- Supabase, Stripe, auth, analytics, or API behavior.

## Completed Admin Context Notes Panel State Parity Slice

Completed AW-006 implementation slice:

`Admin Context Notes Panel state primitive parity`

Done implementation brief:

`docs/task-briefs/done/2026-05-20-aw-006-admin-context-notes-panel-state-primitive-parity-10-10.md`

Completed scope:

- Reuse the existing admin-local `AdminManagerState` helper on contextual notes panel states:
  - `AdminContextNotesPanel`
- Preserve notes fetch behavior, categories fetch behavior, retry callbacks, context ref handling, inherited module notes, note create/update/delete payloads, attachment upload and recovery behavior, related-note links, action copy, and authz boundaries.
- Add focused component/unit coverage around Context Notes loading, schema warning, load error+retry, action error/notice, and empty attached-notes states.
- Use `after/reference` screenshot handoff because rendered admin UI changes.

Do not include:

- `AdminContentManager`,
- attachment upload/recovery behavior changes,
- related-note link/unlink behavior changes,
- note API changes,
- note copy or workflow label changes,
- admin content editor redesign,
- guide offline/sync states,
- dryland/micro session state flows,
- public visual redesign,
- Supabase, Stripe, auth, analytics, or API behavior.

## Completed Admin Content Manager Top-Level State Parity Slice

Completed AW-006 implementation slice:

`Admin Content Manager top-level state parity`

Done implementation brief:

`docs/task-briefs/done/2026-05-21-aw-006-admin-content-manager-top-level-state-parity-10-10.md`

Completed scope:

- Reuse the existing admin-local `AdminManagerState` helper on top-level `AdminContentManager` state renderings:
  - schema warning,
  - content list loading,
  - content list load error + retry,
  - course structure integrity warning,
  - action error where currently rendered in the create form,
  - action notice,
  - empty content list,
  - no-results list.
- Preserve copy, fetch behavior, retry callbacks, authz, create/update/delete/status/course-structure/revision behavior, filters, sort, Context Notes, Context QR, Help/Guide, and support procedures.
- Add focused component/unit coverage around Content Manager loading, warning, load error+retry, action feedback, empty state, and no-results state.
- Use `after/reference` screenshot handoff because rendered admin UI changes.

Do not include:

- content API changes,
- content copy or workflow label changes,
- create/update/delete/status/course-structure/revision behavior changes,
- Context Notes or Context QR behavior changes,
- admin content editor redesign,
- admin notes upload/recovery behavior,
- broad app-wide Notice/EmptyState primitives,
- guide offline/sync states,
- dryland/micro session state flows,
- public visual redesign,
- Supabase, Stripe, auth, analytics, or API behavior.

## Current Implementation Slice

Selected AW-006 implementation slice after PR `#794` and repo-managed closeout `#795`:

`Admin Content Manager course workspace empty-state parity`

Active implementation brief:

`docs/task-briefs/in-progress/2026-05-21-aw-006-admin-content-manager-course-workspace-empty-state-parity-10-10.md`

Scoped target:

- Reuse the existing admin-local `AdminManagerState` helper on two low-risk `AdminContentManager` course-workspace empty states:
  - module lesson-preview empty state,
  - focused module empty lesson workspace state.
- Preserve copy, module/lesson grouping, focus behavior, create/edit/delete/reorder actions, preview links, status actions, Context Notes, Context QR, Help/Guide, and support procedures.
- Add focused component/unit coverage and use `after/reference` screenshot handoff because rendered admin UI changes.

Do not include:

- content API changes,
- content copy or workflow label changes,
- revision restore behavior changes,
- create/update/delete/status/course-structure behavior changes,
- Context Notes or Context QR behavior changes,
- admin content editor redesign,
- admin notes upload/recovery behavior,
- broad app-wide Notice/EmptyState primitives,
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
