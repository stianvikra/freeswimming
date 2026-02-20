import { expect, test } from "@playwright/test";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Admin e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

test.describe("admin content parity", () => {
  test("imports baseline and shows mirror snapshot coverage", async ({ page }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    await page.goto(`/dev/login?next=${encodeURIComponent("/admin")}`);
    const pathAfterDevLogin = new URL(page.url()).pathname;

    if (pathAfterDevLogin !== "/admin") {
      test.skip(true, "Dev auth bypass is not enabled in this environment.");
    }

    const noAccessHeading = page.getByRole("heading", { name: "You don't have access" });
    if (await noAccessHeading.isVisible().catch(() => false)) {
      test.skip(true, "Dev bypass account is signed in but not allowlisted/admin.");
    }

    await expect(page.getByRole("heading", { name: "Admin console" })).toBeVisible();
    await page.getByTestId("admin-tab-content").click();
    await expect(page.getByRole("heading", { name: "Content items" })).toBeVisible();

    const importButton = page.getByTestId("admin-content-import-platform");
    await expect(importButton).toBeVisible();
    await expect(importButton).toBeEnabled();
    await importButton.click();

    await expect(page.getByText(/Imported \d+ platform items/)).toBeVisible({ timeout: 20_000 });

    await expect(page.getByRole("heading", { name: "Platform mirror snapshot" })).toBeVisible();
    await expect(page.getByText("Course modules")).toBeVisible();
    await expect(page.getByText("Course lessons")).toBeVisible();
    await expect(page.getByText("0-1000 sessions")).toBeVisible();
    await expect(page.getByText("Poolside drills")).toBeVisible();
    await expect(page.getByText("Programs/products")).toBeVisible();
    await expect(page.getByText(/Platform: \d+ · Admin: \d+/).first()).toBeVisible();
  });
});
