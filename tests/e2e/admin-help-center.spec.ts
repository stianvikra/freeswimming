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
    await expect(page.getByText("Open module scope / Show all modules:")).toBeVisible();
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
    await expect(page.getByText("Open lock operations workflow:")).toBeVisible();
    await expect(page.getByText("Open password page:")).toBeVisible();
    await expect(page.getByText("Create template:")).toBeVisible();
    await expect(page.getByText("Show history / Hide history:")).toBeVisible();
    await expect(
      page.getByText("Move to Review / Move to Published / Move to Archived / Move to Draft:")
    ).toBeVisible();
    await expect(
      page.getByText(
        "Every new/updated brief must declare Help/Guide impact as: required update or explicit N/A with reason."
      )
    ).toBeVisible();
    await expect(page.getByText("docs/runbooks/qr-redirect-operations.md")).toBeVisible();
    await expect(page.getByText("docs/runbooks/site-lock-operations.md")).toBeVisible();
    await expect(page.getByText("docs/runbooks/admin-notes-recovery.md")).toBeVisible();
    await expect(page.getByText("docs/runbooks/admin-email-template-governance.md")).toBeVisible();
  });
});
