# Supabase Migration Discipline Runbook

## Purpose

Use this runbook whenever a change can affect Supabase schema, RLS, generated database types, route data access, or deployed runtime behavior that depends on a new table, column, function, policy, index, or enum-like constraint.

The goal is to apply database changes before app code depends on them, using versioned migrations rather than dashboard-only changes or ad hoc SQL.

## Official Baseline

- Supabase local development and migration workflow:
  - https://supabase.com/docs/guides/local-development/overview
- Supabase CLI reference for migrations, `db push`, and type generation:
  - https://supabase.com/docs/reference/cli/supabase-migration

If CLI behavior, flags, migration history, or generated-type behavior is unclear, check the official Supabase docs before acting.

## Non-Negotiables

- Use versioned SQL files in `supabase/migrations/`.
- Keep app code, migrations, RLS/policy changes, generated `types/database.ts`, tests, and runbook/brief evidence in the same workstream when they are coupled.
- Run status checks before applying migrations.
- Run a dry run before applying remote migrations.
- Apply additive, backward-compatible schema before deploying code that requires it.
- Use expand/contract for risky changes:
  - expand: add new schema while old app still works,
  - adapt: deploy app that can read/write the new shape,
  - contract: remove old schema only in a later safe slice.
- Do not commit secret values, database passwords, service-role keys, connection strings, SQL output containing user data, or raw production rows.

## Hard Stops

Stop and ask the owner before any of these:

- `supabase db reset --linked`
- `supabase migration repair`
- `supabase migration squash`
- dashboard SQL that mutates schema outside a committed migration
- `drop`, destructive `alter`, mass `delete`, mass `update`, or data backfill against remote databases
- applying migrations when `supabase projects list` points at an unexpected project
- applying migrations when `supabase migration list` shows unexpected remote-only or local-only drift
- applying app code that depends on a missing schema without a documented compatibility fallback

## Required Preflight

Run these before any remote migration apply:

```bash
supabase projects list
```

Confirm the linked project name, reference ID, and environment are the intended target.

```bash
supabase migration list --linked
```

Confirm local and remote history. If there is unexpected drift, stop and investigate before applying anything.

```bash
supabase db push --dry-run --linked
```

Confirm the pending migrations are exactly the intended files.

## Automated Drift Gate

`npm run verify:pre-pr` and `npm run verify:pre-merge` run
`node ./scripts/assert-supabase-migration-drift.mjs` before choosing the
verification lane.

The gate is intentionally narrow:

- when the branch does not change `supabase/migrations/*.sql`, it skips without
  contacting Supabase,
- when the branch changes a Supabase migration, it runs
  `npx supabase db push --dry-run --linked`,
- if the dry-run reports pending migrations, the gate fails until the linked
  remote has received the migration,
- if schema must intentionally be applied after app code, set
  `SUPABASE_MIGRATION_DRIFT_ALLOW_PENDING=1` for that gate run only and record
  the rollout rationale in the active brief and PR.

Treat missing Supabase credentials, an unlinked project, or an ambiguous dry-run
result as a release blocker for migration-touching PRs.

## Apply

Only after the required preflight is clean:

```bash
supabase db push --linked
```

Then confirm history again:

```bash
supabase migration list --linked
```

## Type Generation

When schema changes affect application types, regenerate database types after the schema is applied to the intended source:

```bash
supabase gen types typescript --linked --schema public > types/database.ts
```

Then inspect the diff and keep only expected generated type changes.

## Deploy Order

Use this order for schema-dependent app changes:

1. Create or update the versioned migration.
2. Update `types/database.ts` if the app reads or writes the changed schema.
3. Add or update route/domain tests, including negative-path behavior for missing auth, invalid payloads, forbidden access, and expected schema-not-ready states where relevant.
4. Run local targeted checks.
5. Run Supabase preflight.
6. Apply the migration to the remote environment that the next deploy will use.
7. Deploy the app version that depends on the schema.
8. Smoke the changed route or admin flow.
9. Record non-sensitive evidence in the active brief/checklist.

For Vercel Preview or Production flows, do not treat a green build as proof that the database is ready. Runtime smoke must prove the deployed route can read/write the expected schema.

## Rollback And Repair

- Prefer forward repair migrations over manual rollback SQL.
- If provider or app behavior fails but stored data is safe, disable the app feature or provider configuration first.
- If a migration causes runtime failure, record:
  - migration version,
  - target Supabase project reference,
  - route or job affected,
  - symptom,
  - rollback or forward-fix decision,
  - smoke result after repair.
- Do not delete production user data as a rollback unless the owner explicitly approves the exact action.

## Evidence Checklist

Record these in the active brief or PR body:

- linked project confirmed by `supabase projects list`,
- pending migration list from `supabase migration list --linked`,
- dry-run result from `supabase db push --dry-run --linked`,
- apply result from `supabase db push --linked`,
- post-apply migration list,
- generated type diff status,
- route/admin smoke result,
- any schema-not-ready, RLS, or provider failure observed.

Keep evidence non-sensitive. IDs and status names are allowed when useful; secrets, connection strings, raw rows, request bodies, submitter emails, cookies, and tokens are not.
