# Route, Label, And Support-Surface Impact Sweep

Use this runbook before the first broad verification gate when a slice removes, renames, consolidates, or materially repositions a route, label, action, workflow surface, Help/Guide surface, runbook reference, or owner/operator-facing support path.

The goal is simple: find predictable fallout before `verify:pre-pr` or `verify:pre-merge` finds it for you.

## When This Is Required

Run this sweep when a change touches any of these:

- route paths, redirects, navigation links, route params, slugs, metadata, sitemap, or robots behavior,
- user/admin labels, buttons, tabs, headings, empty/error copy, status names, or action names,
- support surfaces such as Help/Guide content, runbooks, recovery steps, PR/body checklists, task briefs, or operator instructions,
- auth/account/security, billing, access, export, print, screenshot, or incident-recovery surfaces where stale wording can mislead users or operators,
- any route/label rename that affects tests, fixtures, screenshots, docs, release notes, or support diagnostics.

## Required Search Scope

At minimum, check:

- `app/`
- `components/`
- `tests/`
- `docs/`
- `docs/runbooks/`
- `docs/task-briefs/planned/`
- `docs/task-briefs/in-progress/`
- `docs/task-briefs/done/`
- Help/Guide assertions and fixtures when relevant
- `scripts/`, config, and workflow files when tooling, PR bodies, labels, or gates reference the changed surface

## Sweep Procedure

1. List the old and new identifiers before editing:
   - old route(s), route params, labels, headings, action names, support page names, and related synonyms,
   - new canonical names or explicit removal policy.
2. Run targeted `rg` sweeps before the first broad gate:

   ```bash
   rg -n --hidden --glob '!node_modules' --glob '!.next' '<old-route-or-label>|<old-heading>|<old-support-surface>' app components tests docs scripts package.json
   ```

3. For every match, choose one of three outcomes:
   - update it in the same commit as the product change,
   - keep it intentionally and add a short rationale in the active brief or PR,
   - move it to a follow-up brief if it is real scope but not safe to include now.
4. Update test contracts in the same commit as the behavior change:
   - route redirects and removed paths,
   - labels/headings/actions used by locators,
   - Help/Guide assertions,
   - auth/payment/admin negative paths when impacted.
5. Update support surfaces in the same PR when behavior or owner/operator guidance changes:
   - runbooks,
   - Help/Guide copy,
   - task briefs,
   - PR checklist/body expectations,
   - incident or support playbooks.
6. Run targeted tests for the changed surface before broad verification.
7. Use `npm run verify:pre-pr` and `npm run verify:pre-merge` as confirmation gates, not as the first discovery mechanism.

## Same-Commit Rule

If a product commit removes or renames a route, label, or support surface, the same commit should include the matching updates to:

- tests and locators,
- docs and runbooks,
- Help/Guide assertions,
- task brief scope/acceptance/evidence,
- PR-body or release checklist expectations when relevant.

Split only when there is a concrete safety reason. If split, record the dependency and exact follow-up in the active brief.

## Evidence To Record

In the active brief checkpoint or PR handoff, record:

- identifiers searched,
- directories/surfaces checked,
- targeted tests run,
- known intentional leftovers or follow-up brief links,
- whether `verify:pre-pr` and `verify:pre-merge` confirmed the sweep.

## Optional Script Support

Manual `rg`-first sweep is the baseline. Add a helper script only when it stays boring and low-noise:

- no new dependency unless strongly justified,
- no fragile smart parser,
- no blocking gate until it has proven useful,
- fail closed into manual instructions when intent cannot be inferred safely.
