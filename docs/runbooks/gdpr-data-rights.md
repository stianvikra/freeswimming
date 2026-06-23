# GDPR Data Rights Runbook

## Purpose

Define the operational workflow for privacy rights handling in freeswimming.org:

- access/export requests,
- delete requests,
- rectification/objection manual requests,
- privacy/cookie disclosure consistency checks.

## SLA Target

- Respond to data-rights requests within `30 days`.
- Acknowledge manual requests within `3 business days`.

## Intake Channels

1. Self-service (authenticated):
   - `GET /api/user/export`
   - `POST /api/user/delete` with `confirm: "DELETE"`
2. Manual privacy request:
   - `POST /api/contact` (subject should include `Privacy request`)
   - contact page: `/contact`

## Identity and Safety Rules

- Never disclose user data without authenticated session verification or equivalent identity validation.
- For manual requests, verify ownership through signed-in request or confirmed mailbox challenge.
- Keep user-facing responses non-enumerating where account ownership is uncertain.

## Request Handling Workflow

1. Intake and triage:
   - classify as `export`, `delete`, `rectification`, `objection`, or `other privacy`.
   - create a dated ticket/event log entry with request channel and request type.
2. Verification:
   - confirm requester identity before processing manual access/rectification requests.
3. Fulfillment:
   - `export`: direct user to authenticated export flow or provide verified export bundle; saved dryland sessions are included, historical dryland Focus cue values appear only as read-only `legacyFocusText`, generic training activity rows appear as private foundation/review data, and provider evidence appears only as redacted connection/run/activity summaries.
   - `delete`: direct user to authenticated delete flow or perform verified backend-assisted deletion; owner-scoped training activity and provider evidence rows cascade with the account user, and V1 has no provider token bucket or raw FIT/GPX/TCX file path to purge.
   - `rectification/objection`: apply data correction or processing limitation according to request and legal basis.
4. Stripe/payment retention note:
   - communicate clearly that app-owned account data can be removed, but Stripe may retain payment records under legal/accounting obligations.
5. Closure:
   - send completion message with date/time and summary of fulfilled action.
   - store a minimal audit record for accountability.

## Cookie and Disclosure Workflow

- Canonical user-facing disclosure routes:
  - `/privacy`
  - `/cookies`
- Before enabling any non-essential tracker/cookie:
  - add consent gating for GDPR regions first,
  - update both policy routes and this runbook in the same PR,
  - document rollout decision in task brief checkpoint log.

## Operational Evidence (Keep Minimal)

For each privacy request, record:

- request date/time,
- request type,
- verification method,
- completion date/time,
- result (`fulfilled`, `rejected`, `partial`) and reason.

Avoid storing unnecessary personal data in operational notes.

## Escalation

Escalate to owner/legal review when:

- identity cannot be verified safely,
- request scope conflicts with legal retention obligations,
- potential security incident overlaps with the privacy request.

## Linked Product and Contract Docs

- `docs/api-contracts.md` (`/api/user/export`, `/api/user/delete`)
- `docs/runbooks/terms-privacy-compliance-lifecycle.md`
- `docs/task-briefs/done/2026-02-15-my-library-commerce-and-progress-sync.md`
