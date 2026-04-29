# Monthly Maintenance Pass Checklist

Use this checklist for the monthly issue created by `.github/workflows/monthly-maintenance-reminder.yml`.

## Scope

- Month: `YYYY-MM`
- Owner:
- Related PRs:
- Final result: `pass` / `deferred` / `blocked`

## Preflight

- [ ] Confirm local `main` is clean and up to date.
- [ ] Review open PRs and classify them as `auto-dependency`, `human/agent`, `superseded`, or `dirty/stale`.
- [ ] Close superseded stale PRs with a comment naming the replacing PR/brief/current-main evidence; leave branches intact unless explicitly approved.
- [ ] Review open Dependabot PRs and group by patch/minor/major/security-advisory.
- [ ] Review GitHub security alerts, CodeQL status, nightly E2E, and admin E2E status.
- [ ] Run or review `npm audit --omit=dev --audit-level=high`.

## Runtime And Tooling

- [ ] Confirm `.nvmrc`, `package.json` `engines.node`, and `packageManager` still match the intended runtime contract.
- [ ] Confirm GitHub Actions still use `node-version-file: .nvmrc`.
- [ ] Confirm `docs/architecture.md` and `docs/testing-strategy.md` still match the current major stack and local gate assumptions.
- [ ] Run the lightweight stack/tooling fit check and record each decision as `upgrade now`, `hold`, `watch`, or `replace later`.
- [ ] Confirm Next.js, React, Node, npm, TypeScript, ESLint, Tailwind/PostCSS, Playwright, Vitest, Supabase, Stripe, GitHub Actions, Vercel, and CI are still the best supported, stable, compatible, and launch-safe choices.
- [ ] For any major upgrade or tool replacement, open a dedicated migration brief instead of mixing it into feature work.
- [ ] If this is a quarterly pass, run the deeper ecosystem-fit audit from `docs/runbooks/maintenance-cadence.md`.
- [ ] If this is a pre-live or major-release pass, include rollback, secrets/config, monitoring, perf, security, billing, support, and incident-readiness checks before claiming release readiness.
- [ ] Document any required runtime/tooling change as its own PR or planned brief.

## Continuous Improvement Capture

- [ ] Review recent PRs, CI failures, screenshot handoffs, and release-gate notes for repeatable lessons.
- [ ] Place each lesson in the narrowest durable home: active brief/PR evidence, maintenance runbook, domain runbook, architecture/testing docs, or a planned brief.
- [ ] Promote recurring non-failing warnings to a planned hardening brief when they appear in consecutive release gates or correlate with a test failure.
- [ ] Record owner and next checkpoint for any lesson intentionally deferred out of the current maintenance pass.

## Performance Budget Ratchet

- [ ] Run `npm run test:perf:trend`.
- [ ] Record recommendation: `tighten` / `hold` / `revert`.
- [ ] If `tighten`, adjust one metric one step only and run `npm run test:perf:budgets`.
- [ ] If `hold` or `revert`, record rationale and owner.

## Dependency Hygiene

- [ ] Do not merge dependency PRs directly from the open queue; promote one narrow PR at a time from current `main`.
- [ ] If a dependency PR is blocked by unrelated local E2E baseline failures, keep it open and stabilize the baseline before promoting the next dependency PR.
- [ ] Patch/minor updates are merged only after required gates are green.
- [ ] Major updates are deferred to planned briefs unless explicitly approved as the monthly slice.
- [ ] High/critical production advisories are prioritized before routine cleanup.

## Billing Carry-Forward

- [ ] If checkout, portal, webhook, or finance reconciliation changed this month, repeat the fresh Stripe sandbox purchase invoice-visibility check.
- [ ] If not in scope, record the deferral and do not claim live billing confidence.

## Closeout

- [ ] Each merged PR has a rollback note.
- [ ] `npm run verify:pre-pr` evidence is recorded for implementation PRs.
- [ ] `npm run verify:pre-merge` evidence is recorded before merge.
- [ ] Deferred items have an owner, planned brief, or explicit next monthly checkpoint.
