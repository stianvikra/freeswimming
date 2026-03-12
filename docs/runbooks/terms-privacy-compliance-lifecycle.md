# Terms And Privacy Compliance Lifecycle Runbook

## Purpose

Keep policy content aligned with real product behavior for auth, analytics, user-data rights, and third-party integrations.

## Ownership Model

- Policy owner: repo owner (`stianvikra`).
- Change implementer: branch owner for the relevant feature/ops slice.
- Merge approver: repo owner on PR page.

## Policy Surfaces In Scope

- `/privacy`
- `/cookies`
- `docs/runbooks/gdpr-data-rights.md`

Notes:

- This lifecycle runbook governs policy process and evidence.
- Legal wording changes can be made in smaller slices, but must follow the same release checklist.

## Required Review Cadence

- Weekly: quick review of merged PRs since last checkpoint for policy-impact tags.
- Per release PR: run policy-impact checklist before merge.
- Incident-triggered: immediate review when auth/data/export/delete/integration behavior changes unexpectedly.

## Change Classes That Require Checklist

Run `docs/checklists/policy-impact-release-review.md` when a PR changes any of:

- authentication/session or account flows,
- analytics/tracking payloads or consent boundaries,
- user export/delete/privacy endpoints,
- third-party processors (Stripe, Supabase, Resend, Vercel) or data paths.

## Release Linkage Contract

1. Mark policy-impact scope in PR summary (`yes`/`no`).
2. If `yes`, attach checklist evidence in PR body.
3. Confirm latest policy version metadata in checkpoint notes.
4. Run required gates:
   - `npm run verify:pre-pr` before PR update,
   - `npm run verify:pre-merge` (or `npm run gate:pre-merge`) before merge.

## Versioning And Rollback

- Use semantic policy version label format: `YYYY-MM-DD.<rev>` (example: `2026-03-12.1`).
- Record in PR summary:
  - new version,
  - effective date,
  - related product-change rationale.
- Rollback path:
  1. Revert policy content to prior version in a dedicated PR.
  2. Reference the previous version and reason in PR summary.
  3. Re-run policy-impact checklist and release gates.

## Support/Incident Lookup (<=5 Minutes)

For support incidents involving policy questions:

1. Open merged PR list and filter for latest policy-impact PR.
2. Read checklist evidence in PR body.
3. Confirm active `/privacy` + `/cookies` behavior in preview/production.
4. If mismatch exists, open rollback/fix PR immediately with this runbook and checklist linked.
