# Supabase Workspace

This folder stores versioned SQL migrations for database schema and RLS policy changes.

## Migration workflow

1. Create a new migration file in `supabase/migrations/` with a timestamp prefix.
2. Apply migrations to your linked Supabase project.
3. Refresh `types/database.ts` after schema changes.

## Reference commands

```bash
npx supabase migration new <name>
```

```bash
npx supabase db push
```

```bash
npx supabase gen types typescript --schema public > types/database.ts
```

Notes:

- Do not commit secret keys to repository files.
- Keep business logic in app/server code; use migrations for schema and access policy only.
