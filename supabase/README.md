# Supabase Workspace

This folder stores versioned SQL migrations for database schema and RLS policy changes.

## Migration workflow

Use the full operational runbook before changing a linked Supabase project:

- `docs/runbooks/supabase-migration-discipline.md`

Minimum workflow:

1. Create a new migration file in `supabase/migrations/` with a timestamp prefix.
2. Check linked project and migration status.
3. Run a dry run before applying remote migrations.
4. Apply migrations to the intended linked Supabase project.
5. Refresh `types/database.ts` after schema changes.
6. Smoke the app route or admin flow that depends on the schema before deploy/merge readiness.

## Reference commands

```bash
npx supabase migration new <name>
```

```bash
npx supabase db push
```

```bash
npx supabase db push --dry-run --linked
```

```bash
npx supabase gen types typescript --schema public > types/database.ts
```

Notes:

- Do not commit secret keys to repository files.
- Keep business logic in app/server code; use migrations for schema and access policy only.
- Do not run destructive remote database commands without explicit owner approval.
