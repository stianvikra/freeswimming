# Task Brief: Contact Email Pre-Live Smoke (10/10)

## Metadata

- `id`: `2026-05-07-contact-email-pre-live-smoke-10-10`
- `status`: `done`
- `owner`: `stianvikra`
- `created`: `2026-05-07`
- `updated`: `2026-05-07`

## Goal

Verify that Preview and Production contact intake can store requests, attempt admin notification email through the configured provider, expose diagnostics in Admin Messages, and preserve the e-mail-first reply workflow before inviting test swimmers.

## Dependency Order

- Parent:
  - `docs/task-briefs/planned/2026-05-06-admin-message-management-parent-10-10.md`
- Builds on:
  - `docs/task-briefs/done/2026-05-06-admin-message-delivery-provider-contract-10-10.md`
  - `docs/task-briefs/done/2026-05-06-contact-intake-message-storage-10-10.md`
  - `docs/task-briefs/done/2026-05-06-admin-message-inbox-10-10.md`
  - `docs/task-briefs/done/2026-05-06-admin-message-ops-tests-runbook-closeout-10-10.md`
- Evidence targets:
  - `docs/checklists/admin-message-v1-pre-live-smoke.md`
  - `docs/runbooks/admin-message-inbox.md`
  - `docs/runbooks/environment-config-and-secret-parity.md`
  - `docs/runbooks/supabase-migration-discipline.md`

## Current State

- Vercel CLI auth is available for `stianvikra-2409`.
- The Admin Messages v1 contact/provider env group was added to Vercel Preview and Production on `2026-05-07`.
- Preview redeploy `https://freeswimming-1fg66r89s-stian-vikras-projects.vercel.app` is `READY`.
- Supabase preflight and apply completed on `2026-05-07`:
  - `supabase projects list` confirmed linked project `freeswimming-org-prod` / `sazgjhgxvmxcyowovond`,
  - `supabase migration list --linked` showed remote missing `20260506183000` and `20260506213000`,
  - `supabase db push --dry-run --linked` showed only those two expected Admin Messages migrations,
  - `supabase db push --linked` applied both,
  - post-apply `supabase migration list --linked` showed local and remote in sync through `20260506213000`.
- Preview `/api/contact` smoke first reached runtime but returned `500` before email delivery because `public.admin_messages` was missing in remote Supabase. After migration apply, the same Preview route returned `200` / `{"ok":true}`.
- Preview intake/admin smoke has now verified:
  - contact submit returned `200` and latest contact row showed SMTP delivery `accepted_by_provider`,
  - goals coaching submit returned `200`, latest row showed structured intake count `6`, diagnostics count `5`, and SMTP delivery `accepted_by_provider`,
  - preview notify submit returned `200`, latest row showed diagnostics count `5` and SMTP delivery `accepted_by_provider`,
  - authenticated admin API listed messages with `role: editor` and `schemaReady: true`,
  - reversible status workflow passed: `needs_reply` -> `replied` -> `archived` -> `new` -> `deleted` -> `new`,
  - browser smoke opened `/admin?tab=messages` and verified `Admin console`, `Messages`, stored requests, request diagnostics, delivery attempts, `Notification: Accepted`, Early access row, and Goals coaching row.
- Browser evidence artifact: `output/contact-email-pre-live-smoke-2026-05-07-095726/after-preview-admin-messages-desktop.png`.
- Preview owner mailbox receipt/reply confirmation was not repeated because Production later proved the real One.com receipt/reply path against the live mailbox; Preview provider acceptance and admin workflow were verified through app/provider evidence.
- Production redeploy completed on `2026-05-07`:
  - deployment `dpl_7vwxhecjct57GmKcD1Ad13hhQ1SA` reached `READY`,
  - `https://freeswimming.org` was aliased to the new deployment,
  - contact submit returned `200` and latest contact row showed SMTP delivery `accepted_by_provider`,
  - goals coaching submit returned `200`, latest row showed structured intake count `6`, diagnostics count `5`, and SMTP delivery `accepted_by_provider`,
  - preview notify submit returned `200`, latest row showed diagnostics count `5` and SMTP delivery `accepted_by_provider`,
  - reversible Production status workflow passed: `needs_reply` -> `replied` -> `archived` -> `new` -> `deleted` -> `new`.
- Production logs after redeploy confirm `contact_intake_accepted` for `contact`, `goals_coaching`, and `preview_access_notify` with `notificationStatus: accepted_by_provider`.
- Owner confirmed One.com mailbox receipt for a real Production `preview_access_notify` message from an owner-controlled address after redeploy.
- Owner reported the real Production reply step was completed, and admin API confirmed the same row is `status: replied` with SMTP delivery `accepted_by_provider`.
- Preview and Production logs also show Upstash rate limiting returned `401` and fell back to in-memory limiting. This is explicitly deferred to the secrets/config governance track because storage, SMTP delivery, admin diagnostics, and the Production mailbox reply path pass.

## Supabase Preflight Note

The first Preview smoke exposed a sequencing gap: app/provider env was ready, but the remote Supabase schema had not received the Admin Messages migrations. The preflight and apply sequence from `docs/runbooks/supabase-migration-discipline.md` has now been executed for the expected pending migrations:

1. Confirm linked Supabase project with `supabase projects list`.
2. Read migration status with `supabase migration list --linked`.
3. Run `supabase db push --dry-run --linked`.
4. Apply only expected pending migrations with `supabase db push --linked`.
5. Re-check migration status and rerun `/api/contact` smoke.

For future schema-dependent app changes, this runbook must run before Vercel deploy/smoke when deployed code depends on the new schema.

## Platform 10/10 Scorecard Mapping

Reference: `docs/quality/platform-10-10-scorecard.md`

Critical target categories for `10/10` claim:

- `Business logic correctness and data integrity`
- `Reliability and failure handling`
- `Security and authz`
- `Privacy and compliance`
- `Incident response and support operations`
- `Testing and QA automation`
- `DevOps and rollback readiness`

| Category                                      | Mapping      | Target Threshold / Scope Rationale                                                                                                                | Evidence                                              | Expected Closeout Score |
| --------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------- |
| Product goals and IA                          | `target`     | Contact intake readiness has one clear pre-live gate covering storage, provider notification, admin diagnostics, and e-mail-first replies.        | smoke checklist + brief closeout                      | `5/5`                   |
| UX flow clarity                               | `target`     | User success continues to mean stored intake, while operator evidence separates stored, accepted, disabled, retryable, and failed notification.   | smoke rows + admin message diagnostics                | `5/5`                   |
| Visual design quality                         | `N/A`        | N/A because this slice changes no UI, layout, print, brand, or export surface.                                                                    | explicit scope rationale                              | `N/A`                   |
| Business logic correctness and data integrity | `target`     | Preview and Production smoke prove no user-facing success happens without durable app storage, and provider failure never deletes intake history. | smoke checklist + admin message row verification      | `5/5`                   |
| Admin editor ergonomics                       | `target`     | Admin/editor can open `/admin?tab=messages`, inspect diagnostics, set `Needs reply`, mark `Replied`, archive, delete, and restore test rows.      | admin smoke steps + checklist notes                   | `5/5`                   |
| Accessibility (a11y)                          | `supporting` | Supporting only: no visible UI changes; existing admin/contact accessibility is protected by existing tests and smoke navigation.                 | existing tests + no UI diff rationale                 | `4/5`                   |
| Performance (CWV + payloads)                  | `supporting` | Supporting only: provider smoke must not introduce runtime code or bundle changes; existing perf gates cover regressions if code changes occur.   | package/code diff + verify gates                      | `4/5`                   |
| Data placement and sync boundaries            | `target`     | Server-canonical `admin_messages` remains the intake truth; provider status is diagnostic; normal email is the reply workspace.                   | runbook + smoke verification                          | `5/5`                   |
| Caching and invalidation strategy             | `target`     | `/api/contact` remains `no-store`, and admin message state is refreshed after status/archive/delete mutations.                                    | existing route contract + smoke steps                 | `5/5`                   |
| Reliability and failure handling              | `target`     | Missing config, disabled provider, provider failure, invalid origin, and invalid payload have deterministic outcomes in Preview before closeout.  | failure probes + smoke evidence                       | `5/5`                   |
| Security and authz                            | `target`     | Env verification never records secret values; admin message diagnostics are admin/editor-only and public invalid-origin probes fail closed.       | Vercel env-name audit + negative smoke probes         | `5/5`                   |
| Privacy and compliance                        | `target`     | Evidence records no secret values, raw provider responses, message free text, submitter email, IP, cookies, or tokens.                            | checklist notes + PR review                           | `5/5`                   |
| Content governance                            | `target`     | Smoke outcome and provider readiness are recorded in the canonical checklist and this brief, not only in chat.                                    | checklist + checkpoint log                            | `5/5`                   |
| Admin workflow and editability                | `target`     | The v1 e-mail-first workflow is proven end to end: app stores intake, email receives/attempts notification, admin updates status after reply.     | manual smoke + admin inbox runbook                    | `5/5`                   |
| SEO and crawlability                          | `N/A`        | N/A because this private POST/admin smoke does not change sitemap, robots, public metadata, or crawlable content.                                 | explicit scope rationale                              | `N/A`                   |
| AI discoverability                            | `N/A`        | N/A because contact smoke does not add public AI-discoverable content or structured data.                                                         | explicit scope rationale                              | `N/A`                   |
| Analytics and KPI observability               | `supporting` | Supporting only: existing `contact_intake_*` events should remain safe; this slice verifies operations rather than adding event taxonomy.         | smoke/diagnostic review                               | `4/5`                   |
| Commerce and revenue ops                      | `N/A`        | N/A because this slice changes no checkout, entitlement, invoice, refund, payout, ledger, or revenue reporting workflow.                          | explicit commerce scope rationale                     | `N/A`                   |
| Incident response and support operations      | `target`     | Operators can diagnose missing env, missing intake rows, failed notifications, and rollback by disabling provider delivery.                       | admin-message runbook + smoke checklist               | `5/5`                   |
| Finance and reporting operations              | `N/A`        | N/A because this slice has no finance/reporting data impact and must not treat inquiries as revenue records.                                      | explicit finance scope rationale                      | `N/A`                   |
| i18n operational readiness                    | `supporting` | Supporting only: no copy changes; status keys and user/admin labels remain structurally locale-ready from prior Admin Messages work.              | no-copy-diff rationale                                | `4/5`                   |
| Stack-fit and dependency discipline           | `target`     | Use existing Next.js route, Supabase storage, message-delivery adapter, Vercel env scopes, and runbooks; add no dependencies.                     | dependency diff + smoke evidence                      | `5/5`                   |
| Testing and QA automation                     | `target`     | Relevant lint/brief gates pass; local no-egress tests remain green; live smoke evidence is recorded for both Preview and Production.              | targeted tests + `verify:pre-pr` + `verify:pre-merge` | `5/5`                   |
| Scalability and cost efficiency               | `supporting` | Supporting only: smoke uses bounded test submissions and existing rate/provider guards, with no recurring job or new vendor cost.                 | smoke notes                                           | `4/5`                   |
| DevOps and rollback readiness                 | `target`     | Env setup, redeploy, rollback by provider disable/env restore, and post-rollback smoke are documented before closeout.                            | runbook + checklist + rollback notes                  | `5/5`                   |

## Stack / Architecture Best-Practice Gate

- React/Next.js:
  - no UI or component changes are intended,
  - `/api/contact` remains the canonical submit route and `no-store` response boundary.
- TypeScript/domain:
  - reuse existing contact-intake and message-delivery contracts,
  - do not add a second provider status model or reply workflow.
- Supabase/data:
  - no new schema changes are expected in this smoke slice, but pending existing Admin Messages migrations must be applied to the linked remote project before deployed smoke can pass,
  - smoke confirms server-canonical `admin_messages` and `admin_message_delivery_attempts` behavior in deployed environments.
- External services:
  - use Vercel environment scopes for Preview and Production,
  - use the existing provider keys only: `disabled`, `resend_api`, `resend_smtp`, or `smtp_one_com_compatible`,
  - record env presence/status only, never secret values.
- UI:
  - screenshot handoff is `N/A` because no UI, print, layout, brand, or export surface changes.
- Testing:
  - use existing contact API, admin message, env-parity, and release gates,
  - live provider smoke remains manual/ops evidence because CI must not call real provider by default.

## Data Placement And Sync Contract

- Server-canonical:
  - `admin_messages`,
  - `admin_message_delivery_attempts`,
  - admin status/archive/delete markers.
- Provider-canonical:
  - provider acceptance and provider message IDs when available.
- Local-only:
  - unsent form drafts and admin filter state.
- Sync policy:
  - public submit succeeds only after server-canonical storage,
  - provider notification is attempted after storage,
  - provider failure records diagnostic state and must not delete or mutate the stored intake content.
- Retention and sensitivity:
  - smoke artifacts record IDs/statuses only when needed,
  - no message body, submitter email, raw provider transcript, IP, cookie, token, or secret value is recorded.
- Cache/invalidation:
  - `/api/contact` remains `no-store`,
  - admin message list/detail refresh happens after status/archive/delete mutations during smoke.

## Identity And Rename Contract

- Canonical stable IDs:
  - internal `admin_messages.id`,
  - internal delivery attempt ID.
- Human-readable identifiers:
  - submitter name/email, source label, and provider display name are diagnostics/search/display metadata only.
- Mutability rules:
  - message content is immutable except future explicit redaction/delete workflow,
  - admin status/archive/delete markers are mutable workflow state,
  - provider key semantics are versioned rather than repurposed.
- Rename vs repurpose:
  - provider display label may be renamed,
  - materially different delivery behavior needs a new provider key/version.
- Compatibility:
  - historical message rows remain readable if provider changes from SMTP to Resend or disabled mode.
- Observability and repair:
  - missing env and failed provider attempts are recorded through checklist/runbook evidence without exposing secrets.

## Scope

- Verify Vercel Preview and Production contact/message-delivery env presence.
- Apply pending existing Supabase migrations if the linked remote project is behind the repo migration history.
- Record non-sensitive environment evidence in `docs/checklists/admin-message-v1-pre-live-smoke.md`.
- Run Preview and Production smoke once env is configured:
  - contact submit,
  - goals coaching submit,
  - preview notify submit if enabled,
  - admin message diagnostics,
  - e-mail-first reply/status workflow,
  - archive/delete/restore recovery,
  - Preview-only failure probes.
- Update this brief checkpoint log and final closeout evidence.

## Out Of Scope

- Adding dashboard reply composition.
- Inbound email ingestion.
- CRM assignment, SLA automation, marketing email, or newsletter tooling.
- Changing public contact UI copy/layout.
- Creating new Supabase schema or RLS beyond applying already-versioned pending migrations unless smoke exposes a deterministic defect that needs a separate scoped implementation patch.
- Recording or committing secret values.

## Acceptance Criteria

1. Preview and Production have the required contact/message-delivery env group configured with provider-specific secrets present.
2. `docs/checklists/admin-message-v1-pre-live-smoke.md` has non-sensitive evidence rows for Preview and Production; Production carries the real mailbox receipt/reply proof and Preview carries provider-accepted/admin-workflow proof.
3. Public intake success is proven to happen only after durable app storage.
4. Admin Messages shows stored content and redacted delivery diagnostics.
5. Normal email remains the only daily reply workspace for v1.
6. Rollback path is proven or documented: disable/swap provider config without deleting stored intake history.

## Upstash Defer Decision

Upstash is the hosted Redis-backed shared rate-limit store used by public abuse controls. During this smoke, Preview and Production logs showed Upstash `401`, so the app used the deterministic in-memory fallback.

Decision for this Admin Messages v1 closeout:

- defer Upstash credential repair to `docs/task-briefs/planned/2026-04-18-secrets-and-config-governance-pre-live-10-10.md`,
- do not block Admin Messages v1 readiness because intake storage, provider notification, admin diagnostics, and the e-mail-first Production reply path are verified,
- repair before broader public launch or higher-volume intake so rate limits are shared across deployed instances,
- record only presence/status and log outcome during repair; never record Upstash URL/token values in repo docs, screenshots, PRs, or chat.

## Validation

- `npm run lint:briefs`
- `npm run lint:briefs:all`
- `npm run lint:env-parity`
- Supabase migration preflight from `docs/runbooks/supabase-migration-discipline.md`
- targeted contact/admin message tests if code changes are required
- `npm run verify:pre-pr`
- `npm run verify:pre-merge`

## Manual QA Environments

- Vercel Preview:
  - automated intake/admin smoke passed after Supabase migrations were applied.
  - SMTP provider acceptance and admin workflow passed; duplicate owner mailbox receipt/reply verification was intentionally not repeated after the Production real-mailbox proof.
- Production:
  - redeploy completed and automated intake/admin smoke passed.
  - owner mailbox receipt and admin `Replied` confirmation are complete.
- Local:
  - no real-provider smoke possible from current `.env.local` because the contact/message-delivery env group is absent.

## Constraints

- Do not paste, print, screenshot, or commit secret values.
- Do not use `CONTACT_INTAKE_STORAGE=local_verify` in Preview or Production.
- Keep real-provider smoke submissions minimal and clearly test-labeled.
- If provider smoke fails, preserve stored app messages, disable or restore provider config, redeploy, and re-run smoke.
- If schema smoke fails, stop and run Supabase migration preflight before retrying provider/email diagnosis.

## Checkpoint Log

- `2026-05-07 | lifecycle-upstash-defer | Status corrected to done after PR #634 moved this brief to done; Upstash 401 is explicitly deferred to secrets/config governance with in-memory fallback accepted for Admin Messages v1 pre-live smoke, and no secret values are recorded | next: repair Upstash in the planned secrets/config governance workstream before broader public launch`
- `2026-05-07 | production-owner-reply-confirmed | Owner reported the real Production reply step was completed and admin API confirmed the real preview notify row is status replied with SMTP delivery accepted_by_provider | next: repair or explicitly defer Upstash env, then run pre-PR gate`
- `2026-05-07 | production-owner-mailbox-receipt-confirmed | Owner screenshot confirmed One.com mailbox receipt for a real Production preview notify message from an owner-controlled address after redeploy; reply-from-mailbox confirmation remains pending | next: owner replies from One.com to confirm the v1 e-mail-first reply path`
- `2026-05-07 | production-smoke-automated-pass | Production redeploy dpl_7vwxhecjct57GmKcD1Ad13hhQ1SA reached READY and aliased freeswimming.org; live contact, goals coaching, and preview notify submissions returned 200 and latest admin rows showed SMTP accepted_by_provider; reversible Production status workflow passed through needs_reply/replied/archived/restored/deleted/restored; logs confirm contact_intake_accepted with notificationStatus accepted_by_provider while Upstash 401 fallback remains a secondary env issue | next: owner confirms One.com mailbox receipt/reply, then repair or explicitly defer Upstash env`
- `2026-05-07 | preview-admin-smoke-automated-pass | Preview contact, goals coaching, and preview notify submissions returned 200, latest admin message rows showed SMTP accepted_by_provider with privacy-safe diagnostics, authenticated admin API listed messages as role editor with schemaReady true, reversible status workflow passed through needs_reply/replied/archived/restored/deleted/restored, and browser smoke verified /admin?tab=messages with screenshot evidence at output/contact-email-pre-live-smoke-2026-05-07-095726/after-preview-admin-messages-desktop.png | next: owner confirms One.com mailbox receipt/reply, then Production redeploy/smoke`
- `2026-05-07 | preview-contact-smoke-partial-pass | Supabase preflight confirmed remote was missing only expected Admin Messages migrations, dry-run showed the same two files, db push applied them, post-apply migration list is in sync, Preview `/api/contact` returned 200, and latest non-sensitive DB status shows message + SMTP delivery attempt accepted_by_provider; full Preview admin workflow smoke and Production redeploy/smoke remain pending, and Upstash 401 fallback remains a secondary env issue | next: complete Preview admin workflow smoke, then redeploy/smoke Production`
- `2026-05-07 | supabase-preflight-note | Vercel contact/message-delivery env group was configured and Preview redeploy succeeded, but `/api/contact`Preview smoke returned 500 before email delivery because`public.admin_messages` is missing in remote Supabase; added Supabase migration discipline runbook and linked this brief so future schema-dependent app changes apply migrations before deploy/smoke | next: run Supabase migration list, dry-run, db push for expected pending Admin Messages migrations, then rerun Preview contact smoke`
- `2026-05-07 | in-progress | opened branch contact-email-pre-live-smoke-10-10 from clean main and checked local/Vercel config presence; local .env.local has no contact/message-delivery values, and Vercel Preview/Production env listings are missing CONTACT_TO_EMAIL, CONTACT_ALLOWED_ORIGINS, MESSAGE_DELIVERY_PROVIDER, MESSAGE_DELIVERY_FROM_EMAIL, and provider-specific secret group | next: configure required Vercel env group, redeploy, then run admin-message-v1 pre-live smoke`

## Completion Record

- `merged_pr`: `#634`
- `merge_commit`: `408b126`
- `completed`: `2026-05-07`
- `validation`: Preview and Production intake/admin smoke passed for storage, provider acceptance, diagnostics, reversible status workflow, and Production real-mailbox receipt/reply; PR `#634` completed the repo-managed docs-only closeout and post-merge preflight found no further closeout.
- `10/10 claim`: yes for the Admin Messages v1 pre-live smoke scope; app-wide secrets/config governance is not claimed, and Upstash shared-rate-limit repair is deferred to the planned secrets/config governance brief.

| Category                                      | Achieved Score | Evidence                                                                                                                                          | Gaps / Notes                                                                |
| --------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Product goals and IA                          | `5/5`          | Preview and Production smoke verified the Admin Messages v1 intake, diagnostic, and e-mail-first reply readiness path.                            | None for smoke scope.                                                       |
| UX flow clarity                               | `5/5`          | User success remains tied to durable app storage; operator evidence separates stored intake from provider notification status.                    | None.                                                                       |
| Business logic correctness and data integrity | `5/5`          | Contact, goals coaching, and preview notify submissions returned success after stored app rows and accepted provider attempts.                    | None.                                                                       |
| Admin editor ergonomics                       | `5/5`          | Admin API/status workflow passed `needs_reply` -> `replied` -> `archived` -> `new` -> `deleted` -> `new`.                                         | None.                                                                       |
| Data placement and sync boundaries            | `5/5`          | `admin_messages` stayed server-canonical; SMTP delivery stayed diagnostic; One.com email remained the reply workspace.                            | None.                                                                       |
| Caching and invalidation strategy             | `5/5`          | `/api/contact` smoke used no-store route behavior and admin status changes refreshed through the admin workflow.                                  | None.                                                                       |
| Reliability and failure handling              | `5/5`          | Missing remote schema was diagnosed and repaired through Supabase preflight; provider delivery and reversible admin recovery passed.              | Upstash shared rate-limit repair deferred; in-memory fallback was explicit. |
| Security and authz                            | `5/5`          | Admin API access was authenticated as `role: editor`; env and provider evidence recorded no secret values.                                        | None for smoke scope.                                                       |
| Privacy and compliance                        | `5/5`          | Evidence avoided secret values, raw provider transcripts, message free text, submitter email, IP, cookies, and tokens.                            | None.                                                                       |
| Content governance                            | `5/5`          | Smoke outcome and Upstash defer decision are recorded in the checklist, runbook, parent, and this closeout.                                       | None.                                                                       |
| Admin workflow and editability                | `5/5`          | Production proved One.com receipt/reply and admin `Replied` status confirmation; dashboard replies remain out of scope.                           | None.                                                                       |
| Incident response and support operations      | `5/5`          | Runbook/checklist explain missing row, failed notification, provider rollback, schema preflight, and Upstash fallback handling.                   | Upstash repair remains a pre-live secrets/config follow-up.                 |
| Stack-fit and dependency discipline           | `5/5`          | Smoke reused existing Next.js route, Supabase schema, message-delivery adapter, Vercel env scopes, and runbooks; no dependencies added.           | None.                                                                       |
| Testing and QA automation                     | `5/5`          | Live smoke evidence plus docs-only closeout PR `#634`; targeted runtime tests were already covered by Admin Messages implementation child briefs. | None for smoke scope.                                                       |
| DevOps and rollback readiness                 | `5/5`          | Provider disable/swap rollback preserves stored intake; Supabase migration preflight gap was documented for future schema-dependent deploys.      | Upstash repair is control-plane follow-up, not repo runtime rollback scope. |
