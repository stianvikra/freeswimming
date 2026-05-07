# Task Brief: Admin Message One.com Inbox Shortcut (10/10)

## Metadata

- `id`: `2026-05-07-admin-message-one-com-inbox-shortcut-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-07`
- `updated`: `2026-05-07`

## Goal

Add a role-gated Admin Messages shortcut that opens One.com inbox for `hello@freeswimming.org` in a new tab, so the v1 e-mail-first reply workflow is one click from the stored inbox.

## Dependency Order

- Parent:
  - `docs/task-briefs/planned/2026-05-06-admin-message-management-parent-10-10.md`
- Builds on:
  - `docs/task-briefs/done/2026-05-06-admin-message-inbox-10-10.md`
  - `docs/task-briefs/done/2026-05-07-contact-email-pre-live-smoke-10-10.md`
- Related support surface:
  - `docs/runbooks/admin-message-inbox.md`
  - `components/admin/AdminHelpCenter.tsx`

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Admin workflow and editability`
- `Security and authz`
- `Testing and QA automation`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                   | Evidence                                  | Expected Closeout Score |
| --------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Messages keeps one clear operator job: review stored intake in app, then open the normal mailbox for actual replies.                                 | UI copy + screenshot handoff              | `5/5`                   |
| UX flow clarity                               | `target`     | The shortcut is visible beside Refresh for admin/editor users and opens the One.com inbox in a new tab without replacing the admin context.          | unit test + screenshot handoff            | `5/5`                   |
| Visual design quality                         | `target`     | New shortcut matches existing admin button spacing, height, icon style, and responsive wrapping.                                                     | screenshot handoff desktop/mobile         | `5/5`                   |
| Business logic correctness and data integrity | `supporting` | Supporting only: no stored message content, status mutation, delivery state, or reply log behavior changes.                                          | code diff review                          | `4/5`                   |
| Admin editor ergonomics                       | `target`     | Admin/editor can reach One.com inbox from Messages in one click while keeping the dashboard open for status updates.                                 | unit test + screenshot handoff            | `5/5`                   |
| Accessibility (a11y)                          | `target`     | Shortcut is a semantic link with clear accessible name, new-tab behavior, visible focus, and no icon-only ambiguity.                                 | unit test + screenshot handoff            | `5/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: adds one existing icon import and a static link; no data fetch, new dependency, or route payload expansion beyond the admin bundle. | code diff review                          | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical messages stay in `admin_messages`; replies stay in One.com email; the shortcut stores no browser or database state.                 | brief contract + code diff                | `5/5`                   |
| Caching and invalidation strategy             | `supporting` | Supporting only: no read/write cache behavior changes; Refresh remains the server-state reload action.                                               | code diff review                          | `4/5`                   |
| Reliability and failure handling              | `target`     | One.com/browser owns mailbox session state; if the session expired, the admin dashboard remains open and the status workflow remains available.      | screenshot handoff + runbook note         | `5/5`                   |
| Security and authz                            | `target`     | Shortcut is only rendered for roles that can mutate/administer messages and uses `target="_blank"` with `rel="noreferrer"`.                          | unit test                                 | `5/5`                   |
| Privacy and compliance                        | `target`     | No submitter email, message text, token, secret, mailbox password, or provider detail is embedded in the link or committed to repo.                  | code diff review                          | `5/5`                   |
| Content governance                            | `target`     | Help/Guide and the admin message runbook document that the shortcut is navigation only, not a dashboard reply sender.                                | docs diff                                 | `5/5`                   |
| Admin workflow and editability                | `target`     | The v1 workflow remains e-mail-first: use app status for triage, reply in mailbox, then mark `Replied` in Messages.                                  | Help/Guide + runbook + screenshot handoff | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this private admin-only shortcut changes no public routes, sitemap, robots, metadata, or crawlable content.                              | explicit scope rationale                  | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because this private admin-only shortcut adds no public AI-discoverable content or structured data.                                              | explicit scope rationale                  | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: no analytics event is added; this is an operator navigation shortcut and not a product KPI event.                                   | code diff review                          | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no checkout, entitlement, pricing, refund, payout, invoice, or revenue reporting workflow.                            | explicit commerce scope rationale         | `N/A`                   |
| Incident response and support operations      | `target`     | Support runbook explains how to use the shortcut during intake triage without treating email delivery as the storage source of truth.                | runbook diff                              | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because inbound support messages and mailbox navigation do not affect financial records, reconciliation, payouts, or reporting data.             | explicit finance scope rationale          | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: one admin English label is added inside an already English admin console; no locale routing or translation blocker is introduced.   | copy review                               | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Reuse existing Admin Messages component, lucide icon pattern, Tailwind button tokens, and tests; add no dependency or external SDK.                  | code diff + package diff                  | `5/5`                   |
| Testing and QA automation                     | `target`     | Unit tests cover admin/editor visibility, viewer hiding, href, target, and rel; screenshot handoff covers visible UI before broad gates.             | targeted unit test + screenshot handoff   | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: static link creates no server load, provider call, recurring job, or new vendor cost.                                               | code diff review                          | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Rollback is a normal app redeploy/revert; no env, Supabase, provider, or migration change is needed.                                                 | brief + PR summary                        | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - reuse `components/admin/AdminMessagesManager.tsx` as the reference surface,
  - keep the client component boundary unchanged,
  - add only a static external link; no new route, action, API, cache, or server state.
- TypeScript/domain:
  - reuse `AdminRole` and `canMutateAdminMessages` for role gating,
  - no new domain model, status transition, or provider contract.
- Supabase/data:
  - no schema, RLS, migration, generated type, or storage change.
- External services:
  - do not integrate with One.com APIs or store One.com credentials,
  - link to One.com inbox only.
- UI system:
  - reuse existing admin button classes, lucide icon sizing, and responsive wrapping,
  - screenshot handoff is after-only for desktop and mobile because this is an additive shortcut.
- Testing:
  - update `tests/unit/admin-messages-manager.test.tsx`,
  - run targeted unit test and brief lint before screenshot handoff,
  - run `npm run verify:pre-pr` only after owner approves or waives screenshot review.

## Data Placement And Sync Contract

- Server-canonical:
  - `admin_messages`, delivery diagnostics, and workflow statuses remain canonical in Supabase.
- External workspace:
  - One.com inbox remains the reply workspace for v1.
- Local-only:
  - no new local state is stored.
- Sync policy:
  - the link does not sync; after sending email, the operator manually marks the row `Replied`.
- Retention and sensitivity:
  - the link includes no submitter data, message body, token, or mailbox credential.
- Cache/invalidation:
  - no cache behavior changes; existing Refresh action reloads admin messages.

## Identity And Rename Contract

- Canonical stable IDs:
  - unchanged `admin_messages.id` and delivery attempt IDs.
- Human-readable identifiers:
  - `hello@freeswimming.org` is an operator-visible mailbox label, not a route param or persisted entity identifier.
- Mutability rules:
  - if the mailbox changes later, update label/link/help copy in one scoped admin workflow PR.
- Rename vs repurpose:
  - a mailbox rename is a label/configuration copy change; a dashboard reply feature requires a separate brief.
- Compatibility:
  - historical messages remain readable regardless of mailbox provider.
- Observability and repair:
  - One.com session/access issues are handled outside app state; stored messages remain the fallback source of truth.

## Route, Label, And Support Surface Impact Sweep

- Identifiers searched:
  - `Open hello inbox`
  - `hello@freeswimming.org`
  - `One.com inbox`
  - `normal email inbox`
  - `admin-message-inbox`
  - `Messages tab`
  - `mail.one.com`
- Surfaces checked:
  - `app/`
  - `components/admin/`
  - `tests/unit/`
  - `tests/e2e/`
  - `docs/`
  - `docs/runbooks/`
  - active/planned/done task briefs
- Fallout handled:
  - `components/admin/AdminMessagesManager.tsx` gets the only visible Messages-surface change: the `Open hello inbox` button.
  - `components/admin/AdminHelpCenter.tsx` and `tests/e2e/admin-help-center.spec.ts` document/assert the new button meaning in the existing Help/Guide button guide.
  - `docs/runbooks/admin-message-inbox.md` records the shortcut as navigation only, with One.com/browser owning mailbox session state.
  - No route rename, tab rename, dashboard reply workflow, inbound email ingestion, or One.com credential handling was introduced.

## Scope

- Add an admin/editor-only inbox shortcut in the Admin Messages header.
- Update Help/Guide copy and `docs/runbooks/admin-message-inbox.md`.
- Add targeted unit coverage.
- Capture screenshot handoff for desktop and mobile.

## Out Of Scope

- Dashboard reply composition.
- Inbound email ingestion.
- Deep-linking to a specific One.com message.
- One.com API integration.
- Storing mailbox credentials, secrets, or webmail session state.
- Supabase schema or Vercel env changes.

## Acceptance Criteria

1. Admin/editor sees a Messages shortcut that opens One.com inbox in a new tab.
2. Viewer/non-mutating role does not see the shortcut.
3. Link uses `target="_blank"` and `rel="noreferrer"`.
4. Help/Guide and runbook state that replies still happen in email and the app row is marked `Replied` after sending.
5. Screenshot handoff shows the shortcut on admin Messages without layout overlap.

## Validation

- `npm run lint:briefs`
- `npm exec vitest run tests/unit/admin-messages-manager.test.tsx`
- screenshot handoff before `verify:pre-pr`
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Validation Evidence

- `2026-05-07`: `npm run lint:briefs` passed.
- `2026-05-07`: `npm run lint:briefs:all` passed.
- `2026-05-07`: `npm exec vitest run tests/unit/admin-messages-manager.test.tsx` passed with `5` tests.
- `2026-05-07`: `npm exec eslint -- components/admin/AdminMessagesManager.tsx components/admin/AdminHelpCenter.tsx tests/unit/admin-messages-manager.test.tsx tests/e2e/admin-help-center.spec.ts` passed.
- `2026-05-07`: owner screenshot approval completed after the visual review stop, using after-only desktop/mobile artifacts:
  - `output/admin-message-one-com-inbox-shortcut-2026-05-07-104654/after-admin-messages-one-com-inbox-shortcut-desktop.png`
  - `output/admin-message-one-com-inbox-shortcut-2026-05-07-104654/after-admin-messages-one-com-inbox-shortcut-mobile.png`
- `2026-05-07`: `npm run verify:pre-pr` passed full lane before commit:
  - `178` unit test files passed,
  - build passed,
  - performance budgets passed,
  - E2E passed with `82` passed and `374` skipped for environment-gated flows.

## Performance Ratchet Note

- `npm run verify:pre-pr` reported `4` consecutive weekly green perf-budget runs with `20.2%` worst-margin and recommended tightening one stretch target step.
- Decision for this admin shortcut slice: hold budgets unchanged because the active scope adds a static admin-only link and no public performance budget surface.
- Recommended follow-up: tighten one stretch target in the next dedicated performance-governance slice rather than mixing budget changes into this admin workflow PR.

## Checkpoint Log

- `2026-05-07 | done | PR #633 merged as d727be4 and PR #634 moved this brief to done; metadata now matches lifecycle folder and closeout evidence is explicit | next: keep Admin Messages v1 e-mail-first until a separate accepted brief reopens dashboard replies`
- `2026-05-07 | pre-pr-pass | Full npm run verify:pre-pr passed before commit; perf budgets passed and recommended a stretch-target tighten, held for this admin-only shortcut slice and recorded follow-up recommendation | next: commit, push, open/update PR, then rerun verify:pre-pr on committed branch state`
- `2026-05-07 | screenshot-approved | Implemented the role-gated Open hello inbox shortcut with no extra explanatory copy in the Messages surface beyond the button itself; Help/Guide/runbook carry only minimal support-surface notes; targeted lint/unit checks passed and owner approved screenshot handoff | next: run verify:pre-pr, commit, push, and open/update PR`
- `2026-05-07 | in-progress | Started from contact email smoke branch after owner confirmed One.com receipt/reply path and requested a logged-in admin shortcut to the One.com inbox | next: implement shortcut, help/runbook updates, targeted tests, and screenshot handoff`

## Completion Record

- `merged_pr`: `#633`
- `merge_commit`: `d727be4`
- `completed`: `2026-05-07`
- `validation`: targeted lint/unit checks passed, owner approved screenshot handoff, `npm run verify:pre-pr` passed full lane before PR update, required GitHub checks passed before merge, and PR `#634` completed the repo-managed docs-only closeout.
- `10/10 claim`: yes for the Admin Message One.com Inbox Shortcut scope; dashboard replies, inbound email ingestion, and mailbox credential handling remain out of scope.

| Category                                 | Achieved Score | Evidence                                                                                                                               | Gaps / Notes |
| ---------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Product goals and IA                     | `5/5`          | Shortcut keeps one operator job: inspect stored intake in Admin Messages, then open the normal mailbox for replies.                    | None.        |
| UX flow clarity                          | `5/5`          | Screenshot handoff and unit coverage verified the new-tab One.com shortcut without replacing the admin context.                        | None.        |
| Visual design quality                    | `5/5`          | Desktop/mobile screenshot artifacts showed matching admin button spacing, wrapping, icon treatment, and no overlap.                    | None.        |
| Admin editor ergonomics                  | `5/5`          | Admin/editor can reach the One.com inbox in one click and return to Messages for status updates.                                       | None.        |
| Accessibility (a11y)                     | `5/5`          | Shortcut is a semantic link with clear label, new-tab behavior, and tested `target`/`rel` attributes.                                  | None.        |
| Data placement and sync boundaries       | `5/5`          | No app/browser/database state was added; replies remain external to One.com and status remains manual in Admin Messages.               | None.        |
| Reliability and failure handling         | `5/5`          | One.com session ownership remains outside app state; the dashboard stays open and stored messages remain the fallback source of truth. | None.        |
| Security and authz                       | `5/5`          | Unit coverage verifies admin/editor visibility and viewer hiding; link uses `target="_blank"` with `rel="noreferrer"`.                 | None.        |
| Privacy and compliance                   | `5/5`          | Link embeds no submitter data, message body, token, provider secret, mailbox password, or session state.                               | None.        |
| Content governance                       | `5/5`          | Help/Guide and runbook state the shortcut is navigation only and does not create dashboard replies.                                    | None.        |
| Admin workflow and editability           | `5/5`          | E-mail-first v1 workflow is preserved: mark `Needs reply`, reply in email, then mark `Replied`.                                        | None.        |
| Incident response and support operations | `5/5`          | Runbook explains One.com/browser owns mailbox session state while Admin Messages remains the intake diagnostic source.                 | None.        |
| Stack-fit and dependency discipline      | `5/5`          | Reused existing admin manager, role helper, lucide pattern, Tailwind tokens, and tests; no dependency or API added.                    | None.        |
| Testing and QA automation                | `5/5`          | `lint:briefs`, `lint:briefs:all`, targeted Vitest, targeted ESLint, screenshot approval, and full `verify:pre-pr` passed.              | None.        |
| DevOps and rollback readiness            | `5/5`          | Rollback is a normal revert/redeploy with no env, schema, RLS, provider, or migration dependency.                                      | None.        |
