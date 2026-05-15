# Unknowns And Risks

## Purpose

This file collects what Phase 1 cannot safely prove from repository evidence.

Use the exact marker `Unknown / To Verify` until the owner or a future scoped workstream verifies the
fact.

## Control-Plane Unknowns

- `Unknown / To Verify`: current Vercel project settings, environment scope, preview/production
  differences, and deployment aliases.
- `Unknown / To Verify`: current Supabase project settings, live RLS policies, backups, auth
  provider settings, row counts, and production storage usage.
- `Unknown / To Verify`: current Stripe dashboard products, prices, webhook endpoints, customer
  portal settings, refund policy, and payout/reporting configuration.
- `Unknown / To Verify`: current One.com/SMTP/Resend configuration and mailbox delivery health.
- `Unknown / To Verify`: current Upstash database isolation, token health, and production traffic
  limits.
- `Unknown / To Verify`: GitHub branch protection and required check configuration beyond what repo
  docs and workflows state.

## Product And Route Unknowns

- `Unknown / To Verify`: whether the `/about` to `/how-we-teach` redirect in `next.config.ts` is
  intentional, stale, or missing a route.
- `Unknown / To Verify`: final public launch posture and when private/site-lock mode should be
  removed or changed.
- `Unknown / To Verify`: which planned large epics should shape Phase 2 first: admin user
  management, tester access, visual coaching, passkeys, pre-live ops, or AI/program planning.
- `Unknown / To Verify`: which route groups should become primary owner-learning chapters versus
  generated inventories.

## Data And Schema Unknowns

- `Unknown / To Verify`: live production data shape, row counts, and whether every migration has
  been applied to every expected environment.
- `Unknown / To Verify`: backup/restore proof for each server-canonical data family.
- `Unknown / To Verify`: long-term retention policy for admin messages, notes, analytics console
  records, and delivery attempts.
- `Unknown / To Verify`: final user-management and tester-access schema direction.

## Security And Privacy Risks

Risks:

- A future generated env inventory could accidentally read raw local env values if implemented
  carelessly.
- A future support chapter could copy real messages, emails, or provider responses if review rules
  are weak.
- A future auth/admin chapter could overstate production access rules if it relies only on task brief
  intent.
- A future AI/provider chapter could expose prompt/user note content unless data minimization is
  explicit.

Mitigation:

- Generate names and paths only, never values.
- Keep local secret files out of documentation inputs.
- Require `Unknown / To Verify` for provider and live-data facts.
- Require owner review before Phase 2 generated inventories.

## Stale Documentation Risks

High-risk drift areas:

- Routes under `app/`.
- API route classes and auth/cache behavior.
- Supabase migrations and generated types.
- Admin labels, tabs, Help/Guide, and support runbooks.
- Stripe/catalog/entitlement behavior.
- Verification gate behavior and performance budget ratchets.
- Private gate/site-lock behavior.

Mitigation:

- Keep stable docs short and linked to canonical paths.
- Generate volatile inventories only after owner approval.
- Use route-label/support sweep for label/workflow changes.
- Keep task briefs responsible for docs impact.

## Scope Risks

Phase 1 risks:

- Trying to write the whole book too early.
- Creating generated inventories before the owner approves structure.
- Adding scripts/workflows while the intended docs shape is still being reviewed.
- Treating docs as "done" because they are long rather than because they are accurate.

Mitigation:

- Stop at the seven Phase 1 files.
- Keep the PR docs-only.
- Use strict relevant-category closeout evidence.
- Defer Phase 2 until owner approves structure, naming, and generation strategy.

## Owner Learning Risks

Risks:

- Too much implementation detail can make the book unusable.
- Too little detail can make the book reassuring but not operationally useful.
- Large generated docs can hide important decisions in noise.

Mitigation:

- Begin each future chapter with owner-facing purpose.
- Keep code references exact but concise.
- Use diagrams only where they answer a clear question.
- Separate "how it works" from "how to change it safely".

## Recommended Decisions Before Phase 2

1. Approve or revise the proposed chapter list.
2. Decide whether Phase 2 should prioritize owner learning, launch operations, or domain/product
   architecture.
3. Decide which generated inventories are worth building first.
4. Confirm whether `/about` to `/how-we-teach` needs route cleanup before final public-route docs.
5. Confirm which provider/control-plane facts the owner wants verified outside the repo.
6. Decide whether App Knowledge Book chapters should be kept in one folder or split into owner,
   developer, and operations sections.
