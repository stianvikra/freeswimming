import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Athlete profile e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

async function loginToMyLibraryViaDevBypass(page: Page) {
  await page.goto(`/dev/login?next=${encodeURIComponent("/my-library")}`);
  const pathAfterLogin = new URL(page.url()).pathname;

  if (pathAfterLogin !== "/my-library") {
    test.skip(true, "Dev auth bypass is not enabled in this environment.");
  }

  await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
}

test.describe("my library athlete profile", () => {
  test("opens training setup from My Library and preserves drafts after reload", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    await loginToMyLibraryViaDevBypass(page);
    await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open training setup" })).toBeVisible();

    const openProfileLink = page.getByRole("link", { name: "Open training setup" });
    await expect(openProfileLink).toHaveAttribute("href", "/my-library/profile");
    await openProfileLink.click();
    const navigatedAfterClick = await page
      .waitForURL(/\/my-library\/profile$/, { timeout: 7_000 })
      .then(() => true)
      .catch(() => false);
    if (!navigatedAfterClick) {
      const href = await openProfileLink.getAttribute("href");
      expect(href).toBeTruthy();
      await page.goto(href!, { waitUntil: "domcontentloaded", timeout: 60_000 });
      await expect(page).toHaveURL(/\/my-library\/profile$/);
    }
    await expect(
      page.getByRole("heading", {
        name: "Athlete profile & training setup",
        level: 1,
      })
    ).toBeVisible();

    const displayNameInput = page.getByTestId("athlete-profile-display-name");
    if ((await displayNameInput.count()) === 0) {
      test.skip(true, "Athlete profile schema is not available in this environment.");
    }

    await displayNameInput.fill("Pool draft");
    await page.getByTestId("athlete-profile-css-pace").fill("1:58");
    await page.getByTestId("athlete-preferences-day-monday").check();
    await page.getByTestId("athlete-preferences-session-minutes").selectOption("60");
    await page.reload({ waitUntil: "domcontentloaded", timeout: 60_000 });
    await expect(
      page.getByRole("heading", {
        name: "Athlete profile & training setup",
        level: 1,
      })
    ).toBeVisible();
    await expect(page.getByTestId("athlete-profile-display-name")).toHaveValue("Pool draft");
    await expect(page.getByTestId("athlete-profile-css-pace")).toHaveValue("1:58");
    await expect(page.getByTestId("athlete-preferences-day-monday")).toBeChecked();
    await expect(page.getByTestId("athlete-preferences-session-minutes")).toHaveValue("60");
    await expect(
      page.getByText("Unsaved athlete-profile edits were restored on this device.")
    ).toBeVisible();
    await expect(page.getByText("Unsaved CSS edits were restored on this device.")).toBeVisible();
    await expect(
      page.getByText("Unsaved training preferences edits were restored on this device.")
    ).toBeVisible();
  });
});
