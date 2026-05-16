# App Knowledge Book Quality Checklist

## Purpose

Use this checklist for every future App Knowledge Book chapter and generated inventory.

The goal is not to produce more documentation. The goal is to produce documentation that a
non-programmer owner can trust, use, and maintain without hiding technical risk.

## Required Chapter Checks

A chapter is acceptable only when it meets all of these checks:

- It states whether it is stable explanatory documentation, a repo audit, a generated inventory, or
  an operational runbook.
- It cites exact repo paths for important claims.
- It uses `Unknown / To Verify` when repo evidence is missing.
- It avoids raw secrets, env values, tokens, cookies, request IPs, provider response bodies, personal
  data, and free-text user content.
- It explains the owner-facing purpose before implementation detail.
- It links to canonical existing docs instead of copying large blocks that will drift.
- It names the maintenance trigger: what kind of code or product change should update the chapter.
- It includes `Known Future Refresh Points` when planned or likely workstreams should revisit the
  chapter later.
- It keeps examples small and safe.
- It has a clear last-review or evidence-date note when external/control-plane facts are involved.

## Accuracy And Evidence

Required:

- Use repo evidence first: `app/`, `components/`, `lib/`, `supabase/migrations/`, `types/`,
  `tests/`, `scripts/`, `.github/workflows/`, and existing `docs/`.
- Do not infer production state from local code.
- Do not treat task-brief intent as shipped behavior unless merged code or done-brief evidence
  supports it.
- Mark provider dashboards, live data, env configuration, billing state, and production logs as
  `Unknown / To Verify` unless evidence is explicitly provided.

Reject a chapter if:

- It says "the app does X in production" without code/docs/provider evidence.
- It copies raw env values.
- It describes a planned feature as already shipped.
- It hides material unknowns to make the system look cleaner.

## Beginner Clarity

Every owner-facing chapter should include:

- "What this is" in plain language.
- "Why it matters" for product or operations.
- "Where it lives" with repo paths.
- "How to verify it" with commands, tests, or runbooks.
- "What not to change casually" for risky surfaces.

Avoid:

- Tool names without context.
- Acronyms without a first-use explanation.
- Long code excerpts when a path reference is enough.
- Duplicating implementation comments from code.

## Technical Depth

Each chapter should be deep enough to support real maintenance:

- Name canonical data owners.
- Name local-only versus server-canonical state when relevant.
- Name route/auth/cache boundaries for API behavior.
- Name provider boundaries for Stripe, Supabase, email, Upstash, Vercel, or future AI providers.
- Name rollback or recovery paths for operationally sensitive flows.
- Name test coverage and gaps.

## Security And Privacy

Required rules:

- Record env variable names only, never values.
- Do not include cookies, auth headers, bearer tokens, SMTP passwords, webhook secrets, Supabase keys,
  or Stripe secret keys.
- Do not paste real email addresses, request IPs, user notes, message bodies, or raw provider
  responses.
- Use redacted examples such as `user@example.com` only when examples are necessary.
- Link to `docs/architecture/secret-config-inventory.md`,
  `docs/runbooks/environment-config-and-secret-parity.md`, and
  `docs/runbooks/gdpr-data-rights.md` instead of duplicating secret handling rules.

## Diagram Quality

A diagram is useful only when it:

- Answers a clear owner or developer question.
- Has a named scope.
- Uses stable component/service names from the repo.
- Shows trust boundaries where auth, payments, private data, or provider calls are involved.
- Marks uncertain provider/control-plane details as `Unknown / To Verify`.
- Links to source docs or paths below the diagram.

Do not create diagrams that are decorative, overly broad, or hard to update.

## Living-Doc Freshness

Each chapter must declare:

- Update trigger.
- Known future refresh points when planned or likely work should revisit the chapter.
- Primary owner or owning surface.
- Source-of-truth paths.
- Whether updates are manual, generated, or both.
- What must not be duplicated.

Required freshness triggers:

- Route/API change: update route and API chapters or generated route inventory.
- Supabase migration/type change: update data/schema chapter or generated database inventory.
- Auth/admin/access change: update auth/access and support chapters.
- Commerce/provider change: update commerce, finance, and external-service chapters.
- Workflow/runbook change: update owner learning and operations chapters.
- Scorecard/gate change: update testing and release chapters.

## Future Chapter Acceptance Checklist

Before approving a Phase 2+ chapter:

- [ ] Purpose is clear.
- [ ] Audience is clear.
- [ ] Exact repo paths are included.
- [ ] External facts are either evidenced or marked `Unknown / To Verify`.
- [ ] No secrets or personal data are included.
- [ ] Data ownership and state boundaries are explicit when relevant.
- [ ] Security/privacy implications are explicit when relevant.
- [ ] Tests or verification commands are named.
- [ ] Existing canonical docs are linked instead of duplicated.
- [ ] Maintenance trigger is documented.
- [ ] Known future refresh points are documented when planned or likely changes should revisit the
      chapter.
- [ ] The chapter can be reviewed independently in a PR.

## Strict 10/10 Phase 1 Closeout Checks

For this Phase 1 workstream, closeout must show `5/5` evidence for every target category in the
active task brief:

- Product goals and IA.
- UX flow clarity.
- Business logic correctness and data integrity.
- Admin editor ergonomics.
- Performance.
- Data placement and sync boundaries.
- Caching and invalidation strategy.
- Reliability and failure handling.
- Security and authz.
- Privacy and compliance.
- Content governance.
- Admin workflow and editability.
- SEO and crawlability.
- AI discoverability.
- Analytics and KPI observability.
- Commerce and revenue ops.
- Incident response and support operations.
- Finance and reporting operations.
- i18n operational readiness.
- Stack-fit and dependency discipline.
- Testing and QA automation.
- Scalability and cost efficiency.
- DevOps and rollback readiness.

`Visual design quality` and `Accessibility (a11y)` stay `N/A` only while the diff remains Markdown
documentation with no rendered UI or interactive behavior change.
