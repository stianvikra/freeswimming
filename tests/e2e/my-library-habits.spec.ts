import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import {
  gotoWithTransientRetry,
  prewarmRoute,
  waitForRouteToSettle,
} from "./utils/transient-navigation";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

async function loginToHabitsViaDevBypass(page: Page) {
  const loginHref = `/dev/login?next=${encodeURIComponent("/my-library/habits")}`;
  const loginProbe = await prewarmRoute(page, loginHref);
  if (!loginProbe || loginProbe.status() >= 500) {
    test.skip(true, "Dev auth bypass is not reachable in this environment.");
  }

  await gotoWithTransientRetry(page, loginHref);
  if (new URL(page.url()).pathname !== "/my-library/habits") {
    test.skip(true, "Dev auth bypass is not enabled in this environment.");
  }

  await waitForRouteToSettle(page);
}

test.describe("my library habits", () => {
  test("opens the private My Perfect Day surface", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Runs once on desktop Chromium.");
    test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");

    await loginToHabitsViaDevBypass(page);

    await expect(page.getByRole("heading", { name: "Habits", level: 1 })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("My Perfect Day").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to My Library" })).toHaveAttribute(
      "href",
      "/my-library"
    );
  });
});
