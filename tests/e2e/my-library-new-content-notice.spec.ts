import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Library notice e2e is desktop-only.");
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

test.describe("my library new content notice", () => {
  test("shows, dismisses, persists, and reappears on stale seen signature", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    await loginToMyLibraryViaDevBypass(page);

    await page.evaluate(() => {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("fs_library_new_content_seen:")) {
          localStorage.removeItem(key);
        }
      }
    });
    await page.reload();
    await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();

    const banner = page.getByTestId("my-library-new-content-notice");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText(/\+\d+ nye leksjoner i Free Course/);

    await page.getByTestId("my-library-new-content-dismiss").click();
    await expect(banner).toBeHidden();

    await page.reload();
    await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
    await expect(page.getByTestId("my-library-new-content-notice")).toHaveCount(0);

    await page.evaluate(() => {
      for (const key of Object.keys(localStorage)) {
        if (!key.startsWith("fs_library_new_content_seen:")) continue;
        localStorage.setItem(
          key,
          JSON.stringify({
            version: 1,
            signature: "v1:stale-signature",
            lessonCount: 0,
            lessonTokens: [],
            seenAt: new Date().toISOString(),
          })
        );
      }
    });

    await page.reload();
    await expect(page.getByTestId("my-library-new-content-notice")).toBeVisible();
    await page.getByTestId("my-library-new-content-open").click();
    await expect(page).toHaveURL(/\/course(\?|$)/);
  });

  test("keeps page usable and shows retry state when notice signal fetch fails", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    await page.route("**/api/my-library/new-content-signal", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          error: "Could not load signal.",
        }),
      });
    });

    await loginToMyLibraryViaDevBypass(page);
    await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
    await expect(page.getByTestId("my-library-new-content-notice-error")).toBeVisible();
    await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
  });
});
