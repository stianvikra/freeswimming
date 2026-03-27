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
    await helpTab.click();

    await expect(page.getByTestId("admin-active-section-label")).toHaveText("Help/Guide");
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
    await expect(page.getByText("Visible note ID:")).toBeVisible();
    await expect(page.getByText("Priority:")).toBeVisible();
    await expect(page.getByText("Add images / Delete image:")).toBeVisible();
    await expect(page.getByText("Paste image from clipboard / Upload image:")).toBeVisible();
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
        "Use `Quick note` when you want to capture the issue fast from the current surface without losing context."
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
        "Create note with category, priority, and context link, then copy the visible note ID if you need to reference it later."
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        "If the issue is visual, copy the screenshot or image to your clipboard first, then use `Paste image from clipboard`, or choose `Upload image` if you already have the file."
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        "Remember that pasted or uploaded pre-save images stay local until note save and attachment upload both succeed; if clipboard access is blocked or no image is found, fall back to `Upload image`."
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
    await expect(page.getByText("Clipboard paste is blocked or image upload fails")).toBeVisible();
  });
});
