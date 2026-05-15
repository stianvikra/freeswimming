# Living Documentation Plan

## Goal

Keep the App Knowledge Book accurate without turning documentation into a large stale artifact.

The core rule: stable explanations should be manual and owner-readable; volatile inventories should
be generated only after the owner approves the structure and review workflow.

## Source-Of-Truth Layers

Stable source docs:

- App Knowledge Book chapters under `docs/app-knowledge-book/`.
- Architecture docs under `docs/architecture*.md` and `docs/architecture/`.
- Runbooks under `docs/runbooks/`.
- Product rules and API contracts under `docs/product-rules.md` and `docs/api-contracts.md`.
- Scorecard under `docs/quality/platform-10-10-scorecard.md`.

Dynamic repo state:

- Routes: `app/`.
- Components: `components/`.
- Domain/service logic: `lib/`.
- Migrations: `supabase/migrations/`.
- Generated DB types: `types/database.ts`.
- Tests: `tests/`.
- Scripts: `scripts/`.
- Workflows: `.github/workflows/`.
- Dependencies and commands: `package.json`.

Potential future generated docs:

- `docs/system-state/routes.md`
- `docs/system-state/api-routes.md`
- `docs/system-state/env-vars.md`
- `docs/system-state/migrations.md`
- `docs/system-state/tests.md`
- `docs/system-state/scripts.md`
- `docs/system-state/workflows.md`
- `docs/system-state/dependencies.md`

Do not create these generated files until Phase 2+ is explicitly approved.

## Update Triggers

Update stable docs when:

- A route or user flow is added, removed, renamed, or materially repositioned.
- Admin labels, actions, Help/Guide, support paths, or recovery behavior change.
- Supabase schema, RLS, generated DB types, or canonical data ownership changes.
- Auth, private gate, admin access, or provider trust boundaries change.
- Stripe, email, Upstash, Vercel, Supabase, or future AI provider behavior changes.
- Verification gates, CI, branch protection, release flow, or rollback flow changes.
- Scorecard categories or quality-gate rules change.

Update generated inventories when:

- The underlying file set changes.
- A script can regenerate a deterministic small table.
- The inventory is reviewed in a normal PR.

## When Not To Regenerate

Do not regenerate broad docs when:

- Only one targeted stable chapter needs a small update.
- The generator would copy large code comments or implementation details.
- The output includes secrets, personal data, or local-only files.
- The owner has not approved the inventory structure.
- A runtime/product decision is still unsettled.
- The output is too large to review meaningfully.

## Anti-Drift Rules

- Every stable chapter must link to canonical source paths.
- Large tables of routes/env/tests should eventually be generated, not hand-maintained.
- Existing canonical docs should not be duplicated. Link to them and summarize the owner-facing
  meaning.
- Use `Unknown / To Verify` for provider/control-plane facts.
- Add a review date only when the chapter includes external or control-plane evidence.
- Treat docs-only PRs as real release artifacts: run brief lint and docs-only verification.

## Future Freshness Checks

Recommended later checks, if Phase 2+ approves tooling:

- Route inventory check:
  - compare `app/**/page.tsx` and `app/**/route.ts` against `docs/system-state/routes.md`.
- Env inventory check:
  - extract env variable names from code/docs and compare against `docs/system-state/env-vars.md`.
- Migration inventory check:
  - compare `supabase/migrations/*.sql` against `docs/system-state/migrations.md`.
- Script inventory check:
  - compare `package.json` scripts and `scripts/*` against `docs/system-state/scripts.md`.
- Workflow inventory check:
  - compare `.github/workflows/*.yml` against `docs/system-state/workflows.md`.

These should start as report-only checks before becoming blocking CI.

## GitHub Actions Recommendation

Do not add a workflow in Phase 1.

If later approved:

1. Add a local script that can generate one small inventory.
2. Validate it locally and in a PR.
3. Add a CI check that reports drift.
4. Only make it blocking after at least two clean runs and owner review.

## Manual Maintenance Workflow

For future feature PRs:

1. Identify affected App Knowledge Book chapters in the active task brief.
2. Update only the relevant stable chapters.
3. Update or regenerate approved system-state inventories if affected.
4. Run docs/brief validation.
5. Record remaining `Unknown / To Verify` items in the chapter or a follow-up brief.

For docs-only maintenance PRs:

1. Keep changes under `docs/` unless a script/check was explicitly scoped.
2. Use `npm run lint:briefs`.
3. Use `npm run verify:pre-pr`; it should select docs-only lane for pure docs/governance diffs.
4. Use `npm run verify:pre-merge` before merge readiness.

## Ownership Model

Recommended chapter ownership:

- Owner overview and product map: product owner.
- Stack/runtime, routes, data, auth, and testing: engineering owner.
- Admin/help/support/incident docs: operator owner plus engineering review.
- Commerce/finance: owner plus engineering review.
- Security/privacy/compliance: owner plus engineering review.
- Generated inventories: engineering owner.

## Rollback

For Phase 1 and later Markdown-only docs:

- Rollback is a normal git revert.
- No runtime rollback, migration rollback, or provider rollback applies.

For future generated inventory tooling:

- Keep the first workflow report-only.
- If it is noisy or wrong, disable the check and keep the generated files manual until fixed.
