import { expect, test } from "@playwright/test";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Admin help e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

test.describe("admin help center", () => {
  test("allowlisted admin can open help tab and read plain-language operations guide", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    await page.goto(`/dev/login?next=${encodeURIComponent("/admin")}`);
    if (new URL(page.url()).pathname !== "/admin") {
      test.skip(true, "Dev auth bypass is not enabled in this environment.");
    }

    const noAccessHeading = page.getByRole("heading", { name: "You don't have access" });
    if (await noAccessHeading.isVisible().catch(() => false)) {
      test.skip(true, "Dev bypass account is signed in but not allowlisted/admin.");
    }

    const helpTab = page.getByTestId("admin-tab-help");
    await expect(helpTab).toBeVisible();

    const activeSectionLabel = page.getByTestId("admin-active-section-label");
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await helpTab.click();
      try {
        await expect(activeSectionLabel).toHaveText("Help/Guide", { timeout: 2_000 });
        break;
      } catch (error) {
        if (attempt === 2) {
          throw error;
        }
      }
    }

    await expect(page.getByTestId("admin-help-center")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Help/Guide" })).toBeVisible();
    await expect(page.getByText("Last updated:")).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Operator learning path (first day)" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Dashboard tabs and when to use them" })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "How the Content page works" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "How QR Links work" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "How Email Templates work" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Buttons and what they do" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What can be edited right now" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "10/10 Help/Training quality coverage matrix" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Documentation controls (required)" })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Connected services" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Daily playbooks" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Troubleshoot fast" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Change governance and freshness" })
    ).toBeVisible();

    await expect(page.getByText("Course Workspace / All Content tabs:")).toBeVisible();
    await expect(
      page.getByText("Overview mode shows all modules with compact lesson previews.")
    ).toBeVisible();
    await expect(
      page.getByText(
        "Lesson edits stay open after save so small follow-up fixes can be made without reopening the same row."
      )
    ).toBeVisible();
    await expect(page.getByText("Open module scope / Show all modules:")).toBeVisible();
    await expect(page.getByText("Learner common mistakes visibility")).toBeVisible();
    await expect(
      page.getByText(
        "When a lesson has authored `Common mistakes` and the section is enabled, learners see it by default."
      )
    ).toBeVisible();
    await expect(page.getByText("Course identity: slug vs runtime ID")).toBeVisible();
    await expect(
      page.getByText("Slug is the human-readable content key and can be renamed carefully.")
    ).toBeVisible();
    await expect(page.getByText("Use `Show all modules` to return to overview.")).toBeVisible();
    await expect(page.getByText("Guide identity: slug vs runtime ID")).toBeVisible();
    await expect(
      page.getByText(
        "Guide session/drill slugs are readable labels, not the canonical runtime identity."
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        "Rename in place only for the same learning object; do not repurpose old lessons."
      )
    ).toBeVisible();
    await expect(page.getByText("New link / Hide new link:")).toBeVisible();
    await expect(page.getByText("Use edit-surface QR for in-context work")).toBeVisible();
    await expect(page.getByText("Required / Advanced (optional):")).toBeVisible();
    await expect(page.getByText("Create first QR link / Use example values:")).toBeVisible();
    await expect(page.getByText("Show QR:")).toBeVisible();
    await expect(page.getByText("More actions:")).toBeVisible();
    await expect(page.getByText("Activate / Disable:")).toBeVisible();
    await expect(
      page.getByText("Use P0 template / Use P1 template / Use P2 template:")
    ).toBeVisible();
    await expect(
      page.getByText(
        "P0 = critical outage, P1 = major degradation with workaround, P2 = low-impact bug/UX issue."
      )
    ).toBeVisible();
    await expect(page.getByText("Quick note:", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Open / Done archive / All + Search + Context filters:")
    ).toBeVisible();
    await expect(
      page.getByText("Visible note ID / Open in Notes / Related note title:")
    ).toBeVisible();
    await expect(page.getByText("Priority:")).toBeVisible();
    await expect(page.getByText("Add images / Delete image:")).toBeVisible();
    await expect(page.getByText("Paste image from clipboard / Upload images:")).toBeVisible();
    await expect(page.getByText("Link note / Remove link:")).toBeVisible();
    await expect(page.getByText("Open lock operations workflow:")).toBeVisible();
    await expect(page.getByText("Open password page:")).toBeVisible();
    await expect(page.getByText("Create template:")).toBeVisible();
    await expect(page.getByText("Show history / Hide history:")).toBeVisible();
    await expect(
      page.getByText("Move to Review / Move to Published / Move to Archived / Move to Draft:")
    ).toBeVisible();
    await expect(page.getByText("Save changes / Cancel:")).toBeVisible();
    await expect(
      page.getByText(
        "Every new/updated brief must declare Help/Guide impact as: required update or explicit N/A with reason."
      )
    ).toBeVisible();
    await expect(page.getByText("docs/runbooks/qr-redirect-operations.md")).toBeVisible();
    await expect(page.getByText("docs/runbooks/site-lock-operations.md")).toBeVisible();
    await expect(page.getByText("docs/runbooks/admin-notes-recovery.md")).toBeVisible();
    await expect(page.getByText("docs/runbooks/admin-email-template-governance.md")).toBeVisible();
    await expect(
      page.getByText(
        "Use `Quick note` when you want a lightweight admin note from the current surface without losing context."
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        "If you still need to scroll, click, or collect a screenshot before saving, collapse `Quick note`; the page stays interactive underneath and you can reopen the same draft from the docked edge handle on the right."
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        "If you navigate to another supported admin/context surface before saving, the same draft can follow you, but it stays attached to the original locked context shown in the panel."
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        "Page-level `Quick note` is intentionally available on supported public pages plus selected My Library hubs: `/my-library`, `goals`, `training`, `profile`, `workouts`, `dryland`, and `generator`, plus saved detail routes under `/my-library/workouts/<id>`, `/my-library/dryland/<id>`, and `/my-library/programs/<id>`."
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        "If the note is already saved and you forgot the screenshot, open `Edit` in the contextual notes panel and upload the image there instead of recreating the note."
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        "Saved contextual notes now show the visible note ID, an `Open in Notes` jump, and related-note titles that jump into the full queue by stable note ID."
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        "If the issue is visual, copy the screenshot or image to your clipboard first, then use `Paste image from clipboard`, or choose `Upload images` if you already have the files."
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        "Fastest screenshot path is often: let Codex create the note first, open the direct note link, then paste or upload the screenshot yourself in Notes."
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        "You can stage up to six pre-save images on create flows, and repeated paste/upload appends instead of replacing the earlier screenshots."
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        "Remember that pasted or uploaded pre-save images stay local until note save and attachment upload both succeed; if clipboard access is blocked or no image is found, fall back to `Upload images`."
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        "If you need Codex to perform the attachment step, the chat image is discussion-only; save the real file under `/.tmp/admin-note-imports/` and give Codex the canonical note ID plus that staged file path."
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        "Codex-led staged imports should delete the local staging file after confirmed success and keep it in place if upload fails so recovery stays explicit."
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        "After a successful Quick note save, the panel stays open and ready for another note on the same locked context so you can keep capturing without reopening it."
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        "Saved image cards now show a stable evidence summary: image order, file type, file size, and upload date, without exposing raw storage paths."
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        "If a note title starts with `[E2E Admin Note Artifact]`, it is automated test residue and should clear automatically; if it stays open, use the admin-notes recovery runbook before deleting anything manually."
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        "On mobile, the two image actions stay visible so you do not need to remember hidden paste shortcuts."
      )
    ).toBeVisible();
    await expect(
      page.getByText("Clipboard paste is blocked, chat image is not enough, or image upload fails")
    ).toBeVisible();
  });
});
