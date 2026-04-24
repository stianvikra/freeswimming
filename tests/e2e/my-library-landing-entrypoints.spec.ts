import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import {
  gotoWithTransientRetry,
  prewarmRoute,
  waitForRouteToSettle,
} from "./utils/transient-navigation";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

async function loginToMyLibraryViaDevBypass(page: Page) {
  const loginHref = `/dev/login?next=${encodeURIComponent("/my-library")}`;
  const loginProbe = await prewarmRoute(page, loginHref);
  if (!loginProbe || loginProbe.status() >= 500) {
    test.skip(true, "Dev auth bypass is not reachable in this environment.");
  }

  await gotoWithTransientRetry(page, loginHref);
  const pathAfterLogin = new URL(page.url()).pathname;

  if (pathAfterLogin !== "/my-library") {
    test.skip(true, "Dev auth bypass is not enabled in this environment.");
  }

  await waitForRouteToSettle(page);
  await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
}

test.describe("my library landing entrypoints", () => {
  test("keeps the landing page browse-first and strips low-value helper copy", async ({ page }) => {
    test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");

    await loginToMyLibraryViaDevBypass(page);

    await expect(page.getByRole("heading", { name: "Free Course" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "My Swim Profile" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Goals" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Focus & Notes" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Swim Sessions" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Swim session builder" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Continue Free Course" })).toHaveCount(0);

    await expect(page.getByText(/active goal/i)).toHaveCount(0);
    await expect(
      page.getByText(
        "Add an open focus and capture observations or questions between swim sessions."
      )
    ).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Start free course" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Open profile" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Open goals" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Open focus & notes" })).toHaveCount(0);

    const freeCourseCard = page
      .getByRole("heading", { name: "Free Course" })
      .locator("xpath=ancestor::section[1]");
    await expect(freeCourseCard.getByRole("link", { name: /^(Start|Continue)$/ })).toBeVisible();

    const profileCard = page
      .getByRole("heading", { name: "My Swim Profile" })
      .locator("xpath=ancestor::section[1]");
    await expect(profileCard.getByRole("link", { name: "Open" })).toBeVisible();

    const goalsCard = page
      .getByRole("heading", { name: "Goals" })
      .locator("xpath=ancestor::section[1]");
    await expect(goalsCard.getByRole("link", { name: "Open" })).toBeVisible();

    const focusCard = page
      .getByRole("heading", { name: "Focus & Notes" })
      .locator("xpath=ancestor::section[1]");
    await expect(focusCard.getByRole("link", { name: "Open" })).toBeVisible();

    const mySwimSessionsLink = page.getByRole("link", { name: "My Swim Sessions" });
    await expect(mySwimSessionsLink).toBeVisible();
    await expect(mySwimSessionsLink).toHaveClass(/bg-blue-600/);

    const buildPoolButton = page.getByTestId("my-library-create-pool-workout");
    await expect(buildPoolButton).toBeVisible();
    await expect(buildPoolButton).toHaveClass(/border/);
    await expect(buildPoolButton).not.toHaveClass(/bg-blue-600/);
  });
});
