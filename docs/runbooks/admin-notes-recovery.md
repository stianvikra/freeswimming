# Admin Notes Recovery Runbook

Use this runbook for AW-012 workflow `A4` stale-note reconciliation edge cases.

## Purpose

- Recover safely when note state in UI looks stale after concurrent admin edits.
- Keep note context links and status updates deterministic across `/admin`, `/course`, and `/plans`.
- Provide a short manual walkthrough note contract for AW-012 evidence.

## Triggers

- Save returns `Could not update note.` or `Could not save note.` even though another operator already changed the row.
- A contextual note panel shows outdated title/body/status after recent edits in admin.
- You suspect duplicate/overlapping edits on the same note.

## Manual Recovery Walkthrough

1. Pause edits on the current row and copy your intended final text to a temporary local note.
2. In `/admin` -> `Notes`, click `Refresh` to reload server-canonical rows.
3. Re-open the target note and confirm:
   - title/body/category/date,
   - completion status,
   - context label (`Course Lesson`, `Product`, `Page`, etc.).
4. Re-apply only the intended delta and click `Save changes`.
5. Confirm success notice (`Note updated.`) and verify the same row in its contextual surface (`/course` or `/plans`).
6. If update still fails, create one incident note (P1/P2) with owner + next action and link it in AW-012 checkpoint evidence.

## Pass Criteria

- Recovery completes without deleting valid note history.
- Final note state is consistent in admin list and contextual panel.
- AW-012 checkpoint includes branch/SHA + one-line result summary.

## Evidence Note Template (Checkpoint Entry)

- `YYYY-MM-DD | <branch-or-main@sha> | A4 stale-note recovery walkthrough: refresh -> reconcile -> save -> contextual verify => PASS/FAIL (<summary>) | next: <next step>`
