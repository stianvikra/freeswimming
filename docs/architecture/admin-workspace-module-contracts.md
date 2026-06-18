# Admin Workspace Module Contracts

Last updated: 2026-06-18

## Purpose

Admin workspace modules must enter `/admin` through a typed module boundary before adding route-local client managers. The boundary defines where a module appears, what state it owns locally, what data is server-canonical, and which route/API mutations it may call.

## Active Modules

Active tabs remain defined by `ADMIN_TAB_VALUES` in `lib/admin/admin-workspace.ts` and rendered by `components/admin/AdminWorkspace.tsx`.

Current active tabs:

- `content`
- `qr-links`
- `commerce`
- `operations`
- `analytics`
- `users`
- `email-templates`
- `messages`
- `notes`
- `categories`
- `help`

Active high-risk module boundaries with typed contracts:

- `analytics`: `ADMIN_ANALYTICS_WORKSPACE_BOUNDARY`
- `users`: `ADMIN_USERS_WORKSPACE_BOUNDARY`
- `messages`: `ADMIN_MESSAGES_WORKSPACE_BOUNDARY`

Modules without dedicated boundary constants still use `ADMIN_TAB_VALUES`, `components/admin/AdminWorkspace.tsx`, and their route/API contracts as the active source of truth until a high-risk child promotes them to a typed boundary.

## Active Admin Analytics Boundary

Admin Analytics enters the dashboard through `/admin?tab=analytics`. It is a read-only insight dashboard for sanitized first-party product, route, commerce, and workout-builder signals. The module owns range selection, retry state, and dashboard rendering over the existing admin insights endpoint; it does not mutate analytics rows.

Typed source of truth:

- `ADMIN_ANALYTICS_WORKSPACE_BOUNDARY` in `lib/admin/admin-workspace.ts`

Boundary contract:

- Route/module entry: `/admin?tab=analytics`.
- Orchestration state: selected range, loading, error, and retry state stay in `components/admin/AdminAnalyticsDashboard.tsx`.
- Mutations: none; reads use `/api/admin/analytics/insights` through the admin viewer+ route boundary.
- Views: metrics, commerce funnel, workout-builder funnel, top lists, caveats, and trust states live under the dedicated Analytics component boundary.
- Server-canonical data: sanitized `analytics_events` rows and the admin analytics insights response.
- Local-only state: selected range and loading/error/retry state.

Activation owner:

- `docs/task-briefs/in-progress/2026-06-10-workout-builder-funnel-dashboard-v1-10-10.md`

## Active Admin Users Boundary

Admin Users enters the dashboard through `/admin?tab=users`. It is an Auth-canonical account/access/support surface with audited role controls. The module starts from Supabase Auth users, enriches them with purpose-bound profile/access/activity support signals, and keeps private training, habit, raw analytics, provider, and finance data out of the view.

Typed source of truth:

- `ADMIN_USERS_WORKSPACE_BOUNDARY` in `lib/admin/admin-workspace.ts`

Boundary contract:

- Route/module entry: `/admin?tab=users`.
- Orchestration state: filters, pagination, selection, retry state, and role-change confirmation stay in `components/admin/AdminUsersManager.tsx`.
- Mutations: overview reads use the admin users overview route after a viewer+ gate; role changes use an admin-only route and audited server transaction.
- Views: user list, summary metrics, role controls, privacy boundary, and minimized detail panel live under the dedicated Users component boundary.
- Server-canonical data: Supabase Auth users, profiles, admin roles, athlete profile display identity, entitlements, product labels, admin audit logs, and minimized last-activity timestamps.
- Local-only state: search draft, role filter, sort choice, current page, selected user, pending role selection, and role confirmation state.

Activation owner:

- `docs/task-briefs/in-progress/2026-06-15-admin-users-10-10-foundation-repair.md`

## Active Admin Messages Boundary

Admin Messages v1 enters the dashboard through `/admin?tab=messages`. The inbox child activates the tab for stored public intake messages, status triage, archive/delete/restore, and provider-independent notification diagnostics. Dashboard reply composition and outbound logs are explicitly deferred; the normal email inbox remains the daily reply workspace for v1.

Typed source of truth:

- `ADMIN_MESSAGES_WORKSPACE_BOUNDARY` in `lib/admin/admin-workspace.ts`

Boundary contract:

- Route/module entry: `/admin?tab=messages`.
- Orchestration state: message filters, current selection, and pending action state stay in `components/admin/AdminMessagesManager.tsx`.
- Mutations: admin message reads, status updates, archive/delete/restore actions, and diagnostics go through admin-only route handlers backed by `lib/admin/messages.ts`.
- Views: list, detail, and diagnostics live under a dedicated Admin Messages component boundary instead of being added to `AdminWorkspace`, `AdminNotesManager`, or another mature manager.
- Server-canonical data: inbound messages, message statuses, delivery attempts, and redacted diagnostics.
- Local-only state: filters, selection, and pending action state.

Activation owner:

- `docs/task-briefs/done/2026-05-06-admin-message-inbox-10-10.md`

## Guardrails

- Do not fold Admin Messages state into existing large admin managers.
- Do not add dashboard reply state until the deferred reply/outbound brief is reprioritized from product evidence.
- Do not let client panels call email or delivery providers directly.
- Do not treat provider delivery as the message source of truth.
- Help/Guide and screenshot handoff are required for visible Admin Messages workflow changes.
