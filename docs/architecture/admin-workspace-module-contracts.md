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
- `notes`
- `categories`
- `help`

## Planned Admin Messages Boundary

Admin Messages v1 is reserved as the planned `/admin?tab=messages` module. This PR does not activate a visible tab or render an inbox placeholder.

Typed source of truth:

- `ADMIN_MESSAGES_WORKSPACE_BOUNDARY` in `lib/admin/admin-workspace.ts`

Boundary contract:

- Route/module entry: `/admin?tab=messages` once the inbox child activates the tab.
- Orchestration state: message filters, current selection, pending action state, and unsent reply draft stay in a dedicated Admin Messages workspace hook/module.
- Mutations: admin message reads, status updates, archive/delete/restore actions, reply saves, sends, retries, and diagnostics go through admin-only route handlers backed by `lib/admin` message contracts.
- Views: list, detail, diagnostics, and reply panels live under a dedicated Admin Messages component boundary instead of being added to `AdminWorkspace`, `AdminNotesManager`, or another mature manager.
- Server-canonical data: inbound messages, message statuses, admin replies, delivery attempts, and redacted diagnostics.
- Local-only state: filters, selection, pending action state, and unsent reply drafts before explicit save/send.

Activation owner:

- `docs/task-briefs/planned/2026-05-06-admin-message-inbox-10-10.md`

## Guardrails

- Do not add Admin Messages inbox/reply state to existing large admin managers.
- Do not let client panels call email or delivery providers directly.
- Do not treat provider delivery as the message source of truth.
- If the planned `messages` tab becomes visible, update Help/Guide and provide screenshot handoff in the same PR.
