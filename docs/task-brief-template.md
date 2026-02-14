# Task Brief Template

Use this template when requesting coding work from an agent.
Save new briefs in `docs/task-briefs/planned/` with date-based filenames.

## Metadata

- `id`: `YYYY-MM-DD-short-title`
- `status`: `planned | in-progress | done | blocked`
- `owner`: who is responsible
- `created`: `YYYY-MM-DD`
- `updated`: `YYYY-MM-DD`

## Goal

One sentence: what should be true after this task is done?

## Scope

Which files/features are in scope?

## Out Of Scope

What must not be changed?

## Acceptance Criteria

List measurable outcomes.

## Validation

Which commands should pass?

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run build`

## Constraints

Any constraints around copy, design, API compatibility, performance, or deadlines.

## Completion Record (fill when done)

- `PR`: link to merged PR
- `merge`: source branch -> target branch
- `result`: short outcome summary

### Delivered Changes

List shipped files/features.

### DevOps / Workflow Changes

Document CI, branch protection, deployment, and environment/process changes made during the task.

### Secrets Used (Names Only)

List secret names and where they are used.
Do not store secret values in this file.

### Post-Merge Notes

Anything temporary that must be reverted or re-hardened after merge.

## Lifecycle Rules

1. Start in `docs/task-briefs/planned/`.
2. Move to `docs/task-briefs/in-progress/` when coding starts.
3. Move to `docs/task-briefs/done/` when PR is merged.
4. Use `docs/task-briefs/blocked/` if paused.
