import { expect, test } from "@playwright/test";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

const activeAdminTabs = [
  { id: "content", label: "Content" },
  { id: "qr-links", label: "QR Links" },
  { id: "commerce", label: "Commerce" },
  { id: "operations", label: "Operations" },
  { id: "analytics", label: "Analytics" },
  { id: "users", label: "Users" },
  { id: "email-templates", label: "Email templates" },
  { id: "messages", label: "Messages" },
  { id: "notes", label: "Notes" },
  { id: "categories", label: "Categories" },
  { id: "help", label: "Help/Guide" },
] as const;

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Admin help e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

test.describe("admin help center", () => {
  test("allowlisted admin can use quick-reference guidance and open deeper support docs", async ({
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
    await expect(page.getByRole("heading", { name: "Start here" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tab quick reference" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Recovery states" })).toBeVisible();

    await expect(page.getByTestId("admin-help-quick-action-quick-reference")).toHaveAttribute(
      "href",
      "#quick-reference"
    );
    await expect(page.getByTestId("admin-help-quick-action-recovery")).toHaveAttribute(
      "href",
      "#recovery"
    );

    for (const tab of activeAdminTabs) {
      const card = page.getByTestId(`admin-help-tab-guide-${tab.id}`);
      await expect(card).toBeVisible();
      await expect(card.getByText(tab.label, { exact: true })).toBeVisible();
      await expect(card.getByText("Primary job")).toBeVisible();
      await expect(card.getByText("Common action")).toBeVisible();
      await expect(card.getByText("Dangerous action")).toBeVisible();
      await expect(card.getByText("Recovery")).toBeVisible();
    }

    await expect(page.getByTestId("admin-help-recovery-content-load-mismatch")).toBeVisible();
    await expect(page.getByText(/No content items yet/i)).toBeVisible();
    await expect(page.getByText(/Do not create or publish new records/i)).toBeVisible();
    await expect(
      page.getByText(/not purchase, access, revenue, or accounting evidence/i)
    ).toBeVisible();
    await expect(page.getByText(/does not open private profile/i)).toBeVisible();

    await page.locator("#buttons summary").click();
    await expect(page.getByText("Course Workspace / All Content tabs:")).toBeVisible();
    await expect(page.getByText("Save changes / View changes / Cancel:")).toBeVisible();
    await expect(page.getByText("7 days / 30 days / 90 days:")).toBeVisible();
    await expect(page.getByText("Open hello inbox:")).toBeVisible();
    await expect(page.getByText("Search / Role / Sort:")).toBeVisible();
    await expect(page.getByText("Change role:")).toBeVisible();

    await page.locator("#analytics summary").click();
    await expect(
      page.getByText(/not money records or tracking individual public visitors/i)
    ).toBeVisible();
    await expect(page.getByText("Poolside guide paused funnel")).toBeVisible();
    await expect(
      page.getByText(/future-placement readiness until a new placement launches/i).first()
    ).toBeVisible();

    await page.locator("#controls summary").click();
    await expect(
      page.getByText(
        "Every new/updated brief must declare Help/Guide impact as: required update or explicit N/A with reason."
      )
    ).toBeVisible();
    await expect(page.getByText("docs/runbooks/admin-message-inbox.md")).toBeVisible();
    await expect(
      page.getByText("docs/runbooks/public-analytics-privacy-assessment.md")
    ).toBeVisible();
    await expect(page.getByText("docs/runbooks/admin-email-template-governance.md")).toBeVisible();
  });
});
