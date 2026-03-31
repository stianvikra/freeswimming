# Admin Notes Recovery Runbook

Use this runbook for AW-012 workflow `A4` stale-note reconciliation edge cases.

## Purpose

- Recover safely when note state in UI looks stale after concurrent admin edits.
- Keep note context links and status updates deterministic across `/admin`, supported public routes, and selected `My Library` hub routes.
- Provide a short manual walkthrough note contract for AW-012 evidence.

## Triggers

- Save returns `Could not update note.` or `Could not save note.` even though another operator already changed the row.
- Quick capture save fails or closes unexpectedly and you need to confirm whether a note was actually created.
- Clipboard image paste is blocked, empty, or never stages a preview and you need to finish the note safely.
- A pasted clipboard image never reaches preview, disappears before save, or you are unsure whether it uploaded after note save.
- A contextual note panel shows outdated title/body/status after recent edits in admin.
- You suspect duplicate/overlapping edits on the same note.
- Image upload/delete returns an error and you are unsure whether the stored image was fully removed.
- Related-note link/unlink returns an error and you need to confirm whether the link actually exists.
- A note title starts with `[E2E Admin Note Artifact]` and did not clear automatically after automated testing.

## Manual Recovery Walkthrough

1. Pause edits on the current row and copy your intended final text to a temporary local note.
2. If the failure happened in `Quick note`, first search by the visible success state or intended title in `/admin?tab=notes` before retrying so you do not create duplicates.
3. If you still need to inspect the page before saving, collapse the quick-note draft instead of closing it; the page underneath should remain interactive, and reopening from the docked right-edge handle should preserve the current text and staged images.
4. If you navigated to another supported admin/context surface before saving, confirm the quick-note `Locked context` card still points to the original page/item you meant to annotate before you save.
   Supported page-level quick-note hubs now include `/my-library`, `goals`, `training`, `profile`, `workouts`, `dryland`, `generator`, and `security` in addition to the existing supported public routes.
5. After a successful quick-note save, confirm the panel is now ready for another note on the same locked context before you continue capturing follow-up issues.
6. In `/admin?tab=notes`, keep the `Notes` tab active and click `Refresh` to reload server-canonical rows.
7. If the row title starts with `[E2E Admin Note Artifact]`, treat it as automated test residue:
   - do not repurpose it for operator work,
   - refresh once,
   - if it still remains open, follow the active admin-note artifact cleanup brief or delete only after confirming it matches the test-artifact contract.
8. If the note is no longer visible in the default queue, switch to `Done archive` or search by the visible `Note ID`.
9. Re-open the target note and confirm:
   - note ID,
   - title/body/category/date,
   - priority,
   - completion status,
   - context label (`Course Lesson`, `Product`, `Page`, etc.),
   - raw context ref/path when relevant.
10. If screenshots are involved:

- if contextual `Add note` is collapsed because notes already exist, expand it first before retrying image intake,
- if `Paste image from clipboard` says no image was found, confirm you copied the screenshot first and retry, or use `Upload images`,
- if clipboard access was blocked, retry from the explicit paste button after granting browser permission, or use `Upload images`,
- if you pasted an image from clipboard and no preview ever appeared, nothing was saved; retry paste or use `Upload images`,
- if preview existed but note save failed, search by `Note ID` or title before retrying image staging so you do not create duplicate notes,
- if a pasted image preview existed but note save failed, search by `Note ID` or title before retrying paste so you do not create duplicate notes,
- repeated paste/upload on create flows appends until the six-image cap is reached; remove only the screenshots you no longer want instead of restarting the whole draft,
- confirm the attachment list and image count in the note row,
- confirm each saved image card still shows its structured evidence summary (`Image X`, file type, file size, upload date),
- if delete failed, refresh once and verify whether the image is still present before retrying,
- if upload failed after note save, retry only after confirming you are not looking at a stale duplicate preview,
- if the staged images were removed locally, use clipboard paste again or fall back to `Upload images`.

11. If related notes are involved:

- click the linked note title to jump straight to that note in the queue when available, or search by the visible `Note ID` if needed,
- confirm the intended link exists only once,
- remove and re-add the link only if the relationship is clearly wrong.

12. Re-apply only the intended delta and click `Save changes`.
13. Confirm success notice (`Note updated.` or attachment/link success notice) and verify the same row in its contextual surface (`/course`, `/plans`, or the selected `My Library` hub route) when relevant.
14. If update still fails, create one incident note (P1/P2) with owner + next action and link it by note ID in AW-012 checkpoint evidence.

## Pass Criteria

- Recovery completes without deleting valid note history.
- Final note state is consistent in admin list and contextual panel.
- Attachment/image state and related-note links are consistent after one refresh.
- Blocked or empty clipboard-paste flows leave no fake saved attachment behind.
- AW-012 checkpoint includes branch/SHA + one-line result summary.

## Evidence Note Template (Checkpoint Entry)

- `YYYY-MM-DD | <branch-or-main@sha> | A4 stale-note recovery walkthrough: refresh -> reconcile -> save -> contextual verify => PASS/FAIL (<summary>) | next: <next step>`
