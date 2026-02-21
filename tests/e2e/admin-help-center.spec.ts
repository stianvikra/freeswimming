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
    await expect(page.getByRole("heading", { name: "Connected services" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Daily playbooks" })).toBeVisible();
    await expect(
      page.getByText("If a workflow changes, update this Help/Guide page in the same PR.")
    ).toBeVisible();
  });
});
