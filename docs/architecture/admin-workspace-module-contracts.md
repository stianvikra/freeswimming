# Admin Workspace Module Contracts

Last updated: 2026-05-06

## Purpose

Admin workspace modules must enter `/admin` through a typed module boundary before adding route-local client managers. The boundary defines where a module appears, what state it owns locally, what data is server-canonical, and which route/API mutations it may call.

## Active Modules

Active tabs remain defined by `ADMIN_TAB_VALUES` in `lib/admin/admin-workspace.ts` and rendered by `components/admin/AdminWorkspace.tsx`.

Current active tabs:

- `content`
- `qr-links`
- `commerce`
- `operations`
- `email-templates`
- `messages`
- `notes`
- `categories`
- `help`

## Active Admin Messages Boundary

Admin Messages v1 enters the dashboard through `/admin?tab=messages`. The inbox child activates the tab for stored public intake messages, status triage, archive/delete/restore, and provider-independent notification diagnostics. Reply composition and outbound logs remain owned by the later reply child brief.

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

- `docs/task-briefs/in-progress/2026-05-06-admin-message-inbox-10-10.md`

## Guardrails

- Do not add Admin Messages inbox/reply state to existing large admin managers.
- Do not let client panels call email or delivery providers directly.
- Do not treat provider delivery as the message source of truth.
- Help/Guide and screenshot handoff are required for visible Admin Messages workflow changes.
