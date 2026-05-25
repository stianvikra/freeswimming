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

| Surface                             | Files                                                                                                                                                                                                                                    | States found                                                                                                                                                    | Inventory finding                                                                                                                                                                                                                                                                                                                          | Consolidation decision                                                                                                                                                                         |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth sign-in feedback               | `components/auth/AuthRequestStatus.tsx`, `components/auth/AuthResendButton.tsx`                                                                                                                                                          | sent, cooldown, error                                                                                                                                           | Good state machine exists, and PR `#774/#775` removed the former unused `AuthErrorNotice` overlap while keeping cooldown feedback hydration-safe.                                                                                                                                                                                          | Completed cleanup; keep as a reference for route-owned request feedback, not as an app-wide notice primitive.                                                                                  |
| Contact and analysis request form   | `components/ContactForm.tsx`                                                                                                                                                                                                             | field errors, submit error, success                                                                                                                             | Public conversion copy and proof cards already use AW-006 tokens; submit error is route-local and visually close to the form.                                                                                                                                                                                                              | Leave alone until a shared public form-feedback contract exists.                                                                                                                               |
| My Library new-content notice       | `components/my-library/MyLibraryNewContentNotice.tsx`                                                                                                                                                                                    | loading, error, retry, status notice, dismissible detail list                                                                                                   | Strongest token-backed member notice reference after PR `#758`; it uses `fs-library-card`, clear retry, and polite live status.                                                                                                                                                                                                            | Reference surface only for now; no member behavior changes in the inventory slice.                                                                                                             |
| My Library hub empty/member cards   | `components/my-library/MyLibraryHub.tsx`                                                                                                                                                                                                 | owned/explore empty-ish cards, commerce/account guidance                                                                                                        | Recently polished with route-local token hierarchy.                                                                                                                                                                                                                                                                                        | Do not disturb immediately after My Library surface polish.                                                                                                                                    |
| Manual creation entry feedback      | `components/my-library/workouts/CreateManualWorkoutButton.tsx`, `components/my-library/programs/CreateManualProgramButton.tsx`, `components/my-library/dryland/CreateManualDrylandSessionButton.tsx`                                     | manual swim builder open error, manual program create error, dryland create error                                                                               | Fresh `2026-05-25` re-audit found manual swim and program create entry failures still rendering as plain red text while the adjacent dryland create entry already has accessible feedback semantics. PR #845 closed the gap for swim/program entry feedback.                                                                               | Done: `docs/task-briefs/done/2026-05-25-aw-006-manual-creation-entry-feedback-semantics-10-10.md`; keep future work button-local/member-local unless a broader primitive is explicitly scoped. |
| My Swim Sessions builder feedback   | `components/my-library/workouts/WorkoutBuilderHub.tsx`                                                                                                                                                                                   | schema warning, load error, action error, action success, local-draft recovery, first-run empty, selected-workout missing, no-loaded-session guidance           | PR `#840` standardized builder-local feedback semantics while preserving workout data, APIs, local drafts, export/PDF behavior, editor behavior, analytics, routes, Help/Guide, and support procedures.                                                                                                                                    | Shipped by `#840`; no active My Swim Sessions builder feedback follow-up is selected until a future queue/design/code re-audit chooses one.                                                    |
| AI Session Generator feedback       | `components/my-library/generator/GeneratorIntakeHub.tsx`, `components/my-library/generator/SessionGeneratorPanel.tsx`                                                                                                                    | draft recovery, stale-source warning, generator-intake load error, workout load error, selected-workout missing, save-unavailable warning, action error/success | PR `#843` shipped generator-local feedback semantics while preserving generator data, APIs, workout saves, editor behavior, analytics, routes, Help/Guide, support procedures, and broad primitive boundaries.                                                                                                                             | Done: `docs/task-briefs/done/2026-05-25-aw-006-ai-session-generator-feedback-semantics-10-10.md`.                                                                                              |
| My Swim Profile section feedback    | `components/my-library/profile/AthleteProfileHub.tsx`                                                                                                                                                                                    | section save/reset/delete success and errors, offline/save-blocked errors, local draft recovery notices                                                         | Fresh `2026-05-24` re-audit found repeated local success/error markup across five private profile sections while adjacent member/export surfaces now have clearer accessible feedback contracts. PR `#830` closed the bounded section feedback semantics slice.                                                                            | Done: consolidated existing section feedback rendering behind a profile-local helper without changing profile data, APIs, local drafts, analytics, section workflow, or copy.                  |
| Goals feedback                      | `components/my-library/goals/GoalsHub.tsx`                                                                                                                                                                                               | offline notice, action error + retry, action success, first-run empty goals, filtered no-results                                                                | PR `#832` standardized Goals feedback semantics using a goals-local helper while preserving goal data, APIs, filters, active-limit logic, My Training links, analytics, and support procedures.                                                                                                                                            | Shipped by `#832`; no active Goals feedback follow-up is selected until a future queue/design/code re-audit chooses one.                                                                       |
| My Training feedback                | `components/my-library/training/TrainingContextHub.tsx`                                                                                                                                                                                  | schema warning, offline notice, load error + retry, context message, action error, action success, first-run empty, primary-focus warning, filtered no-results  | PR `#834` standardized route-owned My Training feedback semantics while preserving training data, APIs, local drafts, Goals bridge links, analytics, focus/note workflow rules, and support procedures.                                                                                                                                    | Shipped by `#834`; no active My Training feedback follow-up is selected until a future queue/design/code re-audit chooses one.                                                                 |
| Habits feedback                     | `components/my-library/habits/HabitPerfectDayHub.tsx`                                                                                                                                                                                    | schema warning, action error, action success, create notice, first-run/no-active empty state                                                                    | PR `#836` standardized Habits feedback semantics using a habits-local helper while preserving habit data, APIs, cadence, timers, check-ins, analytics, navigation, Help/Guide, and support behavior.                                                                                                                                       | Shipped by `#836`; no active Habits feedback follow-up is selected until a future queue/design/code re-audit chooses one.                                                                      |
| Admin management panels             | `components/admin/AdminCommerceManager.tsx`, `components/admin/AdminOperationsManager.tsx`, `components/admin/AdminQrLinksManager.tsx`, `components/admin/AdminEmailTemplatesManager.tsx`, `components/admin/AdminCategoriesManager.tsx` | loading, schema warning, load error + retry, action error, action notice, empty list, no matches, QR asset generation feedback                                  | Top-level repeated manager states and the QR Registry preview asset loading/error treatment have moved to the admin-local helper.                                                                                                                                                                                                          | Completed QR Registry asset feedback parity; do not reopen the completed broad pilot scope.                                                                                                    |
| Admin messages                      | `components/admin/AdminMessagesManager.tsx`                                                                                                                                                                                              | warning, error, notice, action error, loading list, no matches, no selection                                                                                    | Similar to other admin managers, but has a two-pane selection model and delivery diagnostics.                                                                                                                                                                                                                                              | Completed second-wave consumer; keep as a reference for two-pane admin state rendering.                                                                                                        |
| Admin context QR panel              | `components/admin/AdminContextQrPanel.tsx`                                                                                                                                                                                               | schema warning, action error, action notice, loading, load error + retry, no attached QR links                                                                  | PR `#780/#781` moved contextual QR state rendering to the admin-local helper while preserving QR APIs, copy, labels, and editor workflow behavior.                                                                                                                                                                                         | Completed parity consumer; keep as the contextual QR reference beside full QR Registry.                                                                                                        |
| Admin notes/content managers        | `components/admin/AdminNotesManager.tsx`, `components/admin/AdminContextNotesPanel.tsx`, `components/admin/AdminContentManager.tsx`                                                                                                      | loading, warning, errors, recovery warnings, upload retry, empty, no matches                                                                                    | Dense, high-value operator workflows with staged uploads, related records, and recovery behavior. Admin Notes top-level, Context Notes, and Content Manager top-level/revision/course-workspace/inline/course-structure feedback parity are done.                                                                                          | Continue deferring Content Manager recovery workflow states unless explicitly scoped.                                                                                                          |
| Admin note screenshot capture       | `components/admin/AdminNoteScreenshotCaptureButton.tsx`                                                                                                                                                                                  | permission denied, cancelled, unsupported, capture error, preview save error                                                                                    | Small admin notes utility surface with focused unit coverage; PR `#804` moved scoped recovery/save-error feedback to the admin-local helper.                                                                                                                                                                                               | Completed parity consumer; keep as an admin notes utility reference without changing capture, crop, upload, or recovery behavior.                                                              |
| Admin quick capture                 | `components/admin/AdminNoteQuickCaptureLauncher.tsx`                                                                                                                                                                                     | saved notice, locked-context warning, action error, image-upload recovery                                                                                       | PR `#822` closed the bounded mature gap by moving saved, locked-context warning, and error feedback to the proven admin-local `AdminManagerState` contract.                                                                                                                                                                                | Done: preserves note save, image upload/retry, draft restore, API, authz, Help/Guide, and support behavior.                                                                                    |
| Guide progress trackers             | `components/guides/Guide0To1000Tracker.tsx`, `components/guides/PoolsideGuideTracker.tsx`                                                                                                                                                | loading skeletons, offline/sync error, retry sync, saved status                                                                                                 | The two guide trackers are sibling surfaces and share a domain-specific sync/offline model, and PR `#776/#777` moved them to one guide-local sync-status treatment.                                                                                                                                                                        | Completed cleanup; keep as a reference for domain-local sync/offline status, not as an app-wide notice primitive.                                                                              |
| Course progress sync                | `app/course/page.tsx`, `components/course/CourseProgressSyncStatus.tsx`                                                                                                                                                                  | signed-in sync idle/syncing/synced/error, retry, guest local-only progress, preview local-only progress                                                         | PR `#838` added visible signed-in course progress sync status/retry semantics while preserving course progress API, storage keys, lesson identity, auth, analytics, course content, player behavior, and broad primitive boundaries.                                                                                                       | Shipped by `#838`; no active Course progress sync follow-up is selected until a future queue/design/code re-audit chooses one.                                                                 |
| Course open-on-phone feedback       | `components/course/CourseOpenOnPhoneCard.tsx`                                                                                                                                                                                            | QR loading, QR generation error + retry, copy/share success, copy/share error, unsupported-share fallback                                                       | Fresh `2026-05-25` re-audit found this `/course` support-card utility still rendering QR/copy/share feedback as route-local plain text while adjacent QR/export/action surfaces now use clearer accessible feedback contracts.                                                                                                             | Done: PR `#847`, `docs/task-briefs/done/2026-05-25-aw-006-course-open-on-phone-feedback-semantics-10-10.md`; scope stayed course-local and preserved QR/share/copy behavior.                   |
| Checkout success and claim recovery | `app/checkout/success/page.tsx`, `app/claim/page.tsx`, `components/commerce/DownloadResendForm.tsx`                                                                                                                                      | payment received, sign-in/claim next step, resend access link, privacy-safe recovery                                                                            | Post-purchase recovery is a conversion-critical route-owned flow with privacy-safe generic responses and entitlement checks outside the page UI.                                                                                                                                                                                           | Completed cleanup; keep as a reference for route-owned recovery clarity, not as an app-wide notice primitive.                                                                                  |
| Commerce action feedback            | `components/my-library/CheckoutButton.tsx`, `components/my-library/PortalButton.tsx`, `components/commerce/DownloadResendForm.tsx`                                                                                                       | checkout pending/error, billing portal pending/error, resend validation/pending/success/error                                                                   | PR `#810` completed the bounded commerce action feedback semantics pass for checkout start, billing portal, and download access resend.                                                                                                                                                                                                    | Completed cleanup; keep as a commerce-local feedback reference without changing Stripe/API payloads, entitlements, email delivery, analytics taxonomy, finance behavior, or route design.      |
| Dryland and micro sessions          | `components/my-library/dryland/DrylandBuilderHub.tsx`, `components/my-library/dryland/DrylandMicroPlanPanel.tsx`, `components/my-library/dryland/CreateManualDrylandSessionButton.tsx`                                                   | schema warning, load error, route refresh, action error/success, create error, empty sessions                                                                   | Complex stateful training flows with many local/server boundaries. PR `#818/#819` completed the bounded route-owned feedback-semantics slice without changing training state flows, APIs, local drafts, release logic, or persistence.                                                                                                     | Completed cleanup; keep Dryland/Micro Sessions as a member route-owned feedback reference and require a fresh re-audit before selecting another training feedback slice.                       |
| Poolside PDF/download               | `components/guides/GuidePdfDownloadButton.tsx`, `components/my-library/workouts/PoolsidePreviewPageClient.tsx`                                                                                                                           | download pending, error, save/export status                                                                                                                     | Export states are artifact-specific and have image/PDF validation risk. PR `#808` completed the bounded `GuidePdfDownloadButton` feedback slice without changing generated PDF artifacts, and PR `#812` completed Poolside preview save-image feedback without changing capture, filenames, share/download mechanics, or PDF/print layout. | Completed export-feedback cleanup; keep as an artifact-specific reference and require a fresh re-audit before selecting another Poolside/export slice.                                         |
| Program Builder exports             | `components/my-library/programs/ProgramBuilderHub.tsx`                                                                                                                                                                                   | Garmin-ready JSON preview/download, Program PDF open status, download/open errors                                                                               | PR `#826` closed the bounded gap by adding accessible pending/success/error feedback for Program Builder JSON/PDF export actions while preserving program data, export routes, artifact formats, filenames, auth, persistence, and planner behavior.                                                                                       | Completed export-feedback cleanup; keep Program Builder exports as a member/export reference and require a fresh re-audit before selecting another Program Builder/export slice.               |
| Workout Editor exports and handoff  | `components/my-library/workouts/WorkoutEditor.tsx`                                                                                                                                                                                       | standard PDF open, Poolside PDF open, Garmin-ready JSON download, handoff copy/download success and errors                                                      | PR `#828` closed the bounded gap by adding accessible success/error feedback for Workout Editor PDF, Poolside PDF, Garmin-ready JSON, and handoff actions while preserving workout data, artifact payloads, filenames, adapter behavior, popup behavior, Poolside preview storage, and persistence.                                        | Completed export-feedback cleanup; keep Workout Editor exports as a member/export reference and require a fresh re-audit before selecting another Workout Editor/export slice.                 |

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

## Completed Course Progress Sync Status Clarity Slice

Completed AW-006 implementation slice:

`Course Progress Sync Status Clarity`

Done implementation brief:

`docs/task-briefs/done/2026-05-24-aw-006-course-progress-sync-status-clarity-10-10.md`

Scope direction:

- Keep the work route-owned to `/course` progress sync status.
- Use `GuideSyncStatus` semantics as the mature reference without promoting an app-wide primitive.
- Improve visible signed-in synced/syncing/error/retry feedback only.
- Preserve course progress API shape, `CourseProgressRow` payloads, localStorage keys, dirty lesson tracking, hydrate/merge behavior, canonical lesson identity, auth boundaries, analytics taxonomy, course content API, and video/player behavior.
- Add focused tests for visible status semantics, retry visibility, and unchanged sync behavior.
- Use screenshot handoff because rendered course UI changes.

Do not include:

- course progress API changes,
- Supabase migrations, RLS, generated DB types, or storage changes,
- localStorage key or sync algorithm changes,
- lesson identity/canonicalization changes,
- course content API/content/editor changes,
- course drawer/navigation or video/player behavior changes,
- preview content loading changes,
- guide tracker changes,
- broad member notice primitive or app-wide design-system primitive,
- Supabase, Stripe, auth, analytics, commerce, entitlement, Help/Guide, or email behavior.

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

## Completed Admin Content Manager Course-Structure Feedback State Parity Slice

Completed AW-006 implementation slice:

`Admin Content Manager course-structure feedback state parity`

Done implementation brief:

`docs/task-briefs/done/2026-05-22-aw-006-admin-content-manager-course-structure-feedback-state-parity-10-10.md`

Completed scope:

- Reuse the existing admin-local `AdminManagerState` helper for `AdminContentManager` course-structure follow-up feedback.
- Preserve copy, fetch behavior, retry callbacks, create/update payloads, course-structure normalize/delete behavior, Context Notes, Context QR, labels, and support procedures.
- Add focused component/unit coverage around course-structure feedback semantics.
- Use `after/reference` screenshot handoff because rendered admin UI changes.

## Completed Admin QR Registry Asset Feedback State Parity Slice

Completed AW-006 implementation slice:

`Admin QR Registry asset feedback state parity`

Done implementation brief:

`docs/task-briefs/done/2026-05-22-aw-006-admin-qr-registry-asset-feedback-state-parity-10-10.md`

Completed scope:

- Reuse the existing admin-local `AdminManagerState` helper for `AdminQrLinksManager` QR asset generation loading and error+retry feedback only.
- Preserve QR APIs, slug/status behavior, stable redirect behavior, asset generation internals, SVG/PNG download behavior, content APIs, authz, labels, and support procedures.
- Add focused component/unit coverage around QR asset feedback semantics.
- Use `after/reference` screenshot handoff because rendered admin UI changed.

Do not include:

- QR API changes,
- QR slug/status behavior changes,
- stable redirect or `/go/v/[slug]` behavior changes,
- QR asset generation internals or SVG/PNG download behavior changes,
- content API changes,
- Context Notes or Context QR behavior changes,
- admin content editor layout redesign,
- admin notes upload/recovery behavior,
- broad app-wide Notice/EmptyState primitives,
- guide offline/sync states,
- dryland/micro session state flows,
- public visual redesign,
- Supabase, Stripe, auth, analytics, or API behavior.

## Completed Admin Note Screenshot Capture Feedback State Parity Slice

Completed AW-006 implementation slice:

`Admin Note Screenshot Capture feedback state parity`

Completed implementation brief:

`docs/task-briefs/done/2026-05-22-aw-006-admin-note-screenshot-capture-feedback-state-parity-10-10.md`

Scope direction:

- Reused the existing admin-local `AdminManagerState` helper for `AdminNoteScreenshotCaptureButton` recovery and save-error feedback only.
- Preserve screenshot support detection, browser capture, crop-to-file, save callback, modal close behavior, note attachment handoff, labels, and support procedures.
- Added focused component/unit coverage around screenshot feedback semantics.
- Used `after/reference` screenshot handoff because rendered admin UI changed.

Do not include:

- screenshot capture internals,
- crop math,
- capture driver behavior,
- upload behavior,
- note attachment behavior,
- recovery draft behavior,
- file naming,
- admin notes APIs,
- Context Notes or Context QR behavior,
- QR APIs,
- content APIs,
- quick-capture redesign,
- public visual redesign,
- Supabase, Stripe, auth, analytics, or API behavior.

## Completed Guide PDF Download Feedback Clarity Slice

Completed AW-006 implementation slice:

`Guide PDF Download Feedback Clarity`

Done implementation brief:

`docs/task-briefs/done/2026-05-22-aw-006-guide-pdf-download-feedback-clarity-10-10.md`

Completed scope:

- Improve the existing `GuidePdfDownloadButton` pending and error feedback only.
- Preserve guide PDF API routes, entitlement behavior, fetch credentials, `cache: "no-store"`, analytics event payload, content-disposition filename handling, and fallback filename behavior.
- Add focused component coverage around success, pending live-region semantics, API error feedback, and retry/error reset.
- Used screenshot handoff because rendered guide/member UI changed.

Do not include:

- guide PDF API route changes,
- PDF generation,
- PDF asset loading,
- print/export layout changes,
- entitlement/auth changes,
- analytics taxonomy changes,
- Poolside preview image export states,
- guide tracker sync/offline states,
- admin state primitive work,
- broad app-wide Notice/EmptyState primitives,
- Supabase, Stripe, auth, analytics, or API behavior.

## Completed Poolside Preview Save Image Feedback Clarity Slice

Completed AW-006 implementation slice:

`Poolside Preview Save Image Feedback Clarity`

Done implementation brief:

`docs/task-briefs/done/2026-05-22-aw-006-poolside-preview-save-image-feedback-clarity-10-10.md`

Completed scope:

- Improve `PoolsidePreviewPageClient` save-image pending, success/share, and error feedback only.
- Preserve PNG capture driver behavior, export readiness polling, generated filenames, native share preference, cancelled-share handling, fallback download mechanics, object URL cleanup, route data, and PDF/print layout.
- Add focused component coverage for the changed feedback semantics and unchanged export behavior.
- Use screenshot/export-adjacent handoff because rendered Poolside preview UI changes.

Do not include:

- image capture driver changes,
- generated filename changes,
- native share/download behavior changes,
- PDF/print layout changes,
- guide PDF API route changes,
- entitlement/auth changes,
- analytics taxonomy changes,
- admin state primitive work,
- dryland/micro-session state flows,
- broad app-wide Notice/EmptyState primitives,
- Supabase, Stripe, auth, analytics, or API behavior.

## Completed Dryland / Micro Sessions Feedback Semantics Slice

Completed AW-006 implementation slice:

`Dryland / Micro Sessions Feedback Semantics`

Done implementation brief:

`docs/task-briefs/done/2026-05-23-aw-006-dryland-micro-sessions-feedback-semantics-10-10.md`

Completed scope:

- Kept the work route-owned to Dryland and Micro Sessions member feedback.
- Used a small dryland-local feedback presentation for schema warning, load error + retry,
  action error/success, create error, and first-run empty states.
- Preserved dryland session APIs, micro-plan APIs, local draft persistence, save/delete behavior,
  release-now, pause/resume, completion, skip, undo, bubble/timer behavior, routes, labels, and
  support procedures.
- Added focused unit coverage for status/alert semantics and unchanged request payloads.
- Used screenshot handoff because rendered member UI changed.

Do not include:

- dryland or micro-plan API changes,
- Supabase migrations, RLS, generated DB type, or storage changes,
- local draft key or sync behavior changes,
- micro-session release/completion/skip/undo/bubble logic changes,
- broad member notice primitive or app-wide design-system primitive,
- public visual redesign,
- Supabase, Stripe, auth, analytics, commerce, entitlement, or email behavior.

## Closed Admin Quick Capture Feedback State Parity Slice

Closed AW-006 implementation slice:

`Admin Quick Capture Feedback State Parity`

Done implementation brief:

`docs/task-briefs/done/2026-05-23-aw-006-admin-quick-capture-feedback-state-parity-10-10.md`

Scope direction:

- Reuse the existing admin-local `AdminManagerState` helper for `AdminNoteQuickCaptureLauncher`
  saved, locked-context warning, and action/error feedback only.
- Preserve note-save payloads, image upload/retry/remove behavior, draft restore, route context,
  category fetch, `onSaved` callback, API/authz behavior, Help/Guide, and support procedures.
- Add focused unit coverage around feedback semantics and unchanged request/retry behavior.
- Use `after/reference` screenshot handoff because rendered admin UI changes.

Do not include:

- admin notes API changes,
- attachment upload/retry/recovery behavior changes,
- quick-capture route matrix or host-surface changes,
- Help/Guide or runbook copy changes,
- Context Notes, Context QR, content APIs, QR APIs, screenshot capture, or admin content editor work,
- dryland/micro session state flows,
- broad app-wide Notice/EmptyState primitives,
- Supabase, Stripe, auth, analytics, commerce, entitlement, or email behavior.

## Completed Program Builder Export Feedback Semantics Slice

Closed AW-006 implementation slice:

`Program Builder Export Feedback Semantics`

Done implementation brief:

`docs/task-briefs/done/2026-05-23-aw-006-program-builder-export-feedback-semantics-10-10.md`

Completed scope:

- Keep the work route-owned to `ProgramBuilderHub` export feedback.
- Use Guide PDF download feedback and Poolside preview save-image feedback as mature references.
- Improve Garmin-ready JSON download pending/success/error feedback and Program PDF open/blocked feedback only.
- Preserve program save state, program data, export preview retry behavior, JSON download payload, object URL cleanup, PDF route, popup behavior, generated filenames, auth, and persistence.
- Add focused unit coverage around feedback semantics and unchanged export behavior.
- Use screenshot handoff because rendered member/export UI changes.

Do not include:

- program data model changes,
- planner or week/day assignment behavior changes,
- export route payload changes,
- generated JSON/PDF schema changes,
- generated filename changes,
- PDF/print layout changes,
- workout editor export UI changes,
- broad member notice primitive or app-wide design-system primitive,
- Supabase, Stripe, auth, analytics, commerce, entitlement, or email behavior.

## Completed Workout Editor Export And Handoff Feedback Semantics Slice

Completed AW-006 implementation slice:

`Workout Editor Export And Handoff Feedback Semantics`

Done implementation brief:

`docs/task-briefs/done/2026-05-24-aw-006-workout-editor-export-handoff-feedback-semantics-10-10.md`

Completed scope:

- Keep the work route-owned to `WorkoutEditor` export and handoff feedback.
- Use Program Builder export feedback, Guide PDF download feedback, and Poolside preview save-image feedback as mature references.
- Improve standard PDF, Poolside PDF, Garmin-ready JSON, handoff copy, and handoff text download success/error feedback only.
- Preserve workout draft editing, save/delete/discard behavior, handoff text, JSON payload, PDF HTML, Poolside preview draft storage, popup behavior, object URL cleanup, generated filenames, auth, and persistence.
- Add focused unit coverage around feedback semantics and unchanged export/handoff behavior.
- Use screenshot handoff because rendered member/export UI changes.

Do not include:

- workout data model changes,
- step rendering or shared renderer changes,
- save/delete/discard behavior changes,
- export adapter payload changes,
- generated JSON/PDF/text schema changes,
- generated filename changes,
- PDF/print layout changes,
- Poolside preview rendering/capture changes,
- Program Builder changes,
- broad member notice primitive or app-wide design-system primitive,
- Supabase, Stripe, auth, analytics, commerce, entitlement, or email behavior.

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
