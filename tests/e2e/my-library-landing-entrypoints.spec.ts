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
  const libraryHeading = page.getByRole("heading", { name: "My Library" });
  const libraryReady = await libraryHeading.isVisible({ timeout: 15_000 }).catch(() => false);

  if (libraryReady) {
    return;
  }

  await gotoWithTransientRetry(page, loginHref);
  if (new URL(page.url()).pathname !== "/my-library") {
    test.skip(true, "Dev auth bypass is not enabled in this environment.");
  }

  await waitForRouteToSettle(page);
  await expect(libraryHeading).toBeVisible({ timeout: 15_000 });
}

test.describe("my library landing entrypoints", () => {
  test("keeps the landing page browse-first and strips low-value helper copy", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Runs once on desktop Chromium.");
    test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
    test.slow();

    await loginToMyLibraryViaDevBypass(page);

    await expect(page.getByRole("heading", { name: "Free Course" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "My Swim Profile" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Goals" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "My Training" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Habits" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Swim Sessions" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Dryland Sessions" })).toBeVisible();
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
    await expect(page.getByRole("link", { name: "Open My Training" })).toHaveCount(0);

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
      .getByRole("heading", { name: "My Training" })
      .locator("xpath=ancestor::section[1]");
    await expect(focusCard.getByRole("link", { name: "Open" })).toBeVisible();

    const habitsCard = page
      .getByRole("heading", { name: "Habits" })
      .locator("xpath=ancestor::section[1]");
    await expect(habitsCard.getByRole("link", { name: "Open" })).toBeVisible();

    const swimSessionsCard = page
      .getByRole("heading", { name: "Swim Sessions" })
      .locator("xpath=ancestor::section[1]");
    await expect(swimSessionsCard.getByRole("link", { name: "Open" })).toBeVisible();
    await expect(swimSessionsCard.getByRole("link", { name: "Open" })).toHaveClass(/bg-blue-600/);
    await expect(swimSessionsCard.getByText("Build pool session")).toHaveCount(0);
    await expect(swimSessionsCard.getByText("Build open water session")).toHaveCount(0);
    await expect(swimSessionsCard.getByText("AI session generator")).toHaveCount(0);

    const drylandCard = page
      .getByRole("heading", { name: "Dryland Sessions" })
      .locator("xpath=ancestor::section[1]");
    await expect(drylandCard.getByRole("link", { name: "Open" })).toBeVisible();
    await expect(drylandCard.getByText("Create strength session")).toHaveCount(0);
    await expect(drylandCard.getByText("Create stretching session")).toHaveCount(0);
  });
});
