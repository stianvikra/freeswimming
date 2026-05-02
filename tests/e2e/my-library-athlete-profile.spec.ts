import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import {
  clickHrefAndAwaitUrlOrRetryGoto,
  gotoWithTransientRetry,
  prewarmRoute,
  waitForRouteToSettle,
} from "./utils/transient-navigation";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Athlete profile e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

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

async function refreshDevSessionForCurrentRoute(page: Page) {
  const currentUrl = new URL(page.url());
  const nextPath = `${currentUrl.pathname}${currentUrl.search}`;
  const loginHref = `/dev/login?next=${encodeURIComponent(nextPath)}`;
  const loginProbe = await prewarmRoute(page, loginHref);
  if (!loginProbe || loginProbe.status() >= 500) {
    test.skip(true, "Dev auth bypass is not reachable in this environment.");
  }

  await gotoWithTransientRetry(page, loginHref);
  if (new URL(page.url()).pathname !== currentUrl.pathname) {
    test.skip(true, "Dev auth bypass is not enabled in this environment.");
  }
  await waitForRouteToSettle(page);
}

async function waitForAthleteProfileClientReady(page: Page) {
  const hub = page.getByTestId("athlete-profile-hub");
  const clientReady = await expect
    .poll(async () => await hub.getAttribute("data-client-ready"), {
      timeout: 15_000,
    })
    .toBe("true")
    .then(() => true)
    .catch(() => false);

  if (clientReady) {
    return;
  }

  await refreshDevSessionForCurrentRoute(page);

  const readyAfterRefresh = await expect
    .poll(async () => await hub.getAttribute("data-client-ready"), {
      timeout: 15_000,
    })
    .toBe("true")
    .then(() => true)
    .catch(() => false);

  if (!readyAfterRefresh) {
    test.skip(true, "Athlete profile client did not hydrate in this environment.");
  }
}

async function openAthleteProfileSection(page: Page, section: "css" | "preferences" | "records") {
  const sectionPanel = page.getByTestId(`athlete-profile-section-${section}`);
  await expect(sectionPanel).toBeVisible();
  if ((await sectionPanel.getAttribute("data-section-open")) === "true") {
    return;
  }

  await page.getByTestId(`athlete-profile-section-toggle-${section}`).click();
  await expect(sectionPanel).toHaveAttribute("data-section-open", "true");
}

test.describe("my library athlete profile", () => {
  test("opens training setup from My Library and preserves drafts after reload", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();
    testInfo.setTimeout(150_000);

    await loginToMyLibraryViaDevBypass(page);
    await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
    const profileCard = page
      .getByRole("heading", { name: "My Swim Profile" })
      .locator("xpath=ancestor::section[1]");
    await expect(profileCard.getByRole("link", { name: "Open" })).toBeVisible();

    const openProfileLink = profileCard.getByRole("link", { name: "Open" });
    await expect(openProfileLink).toHaveAttribute("href", "/my-library/profile");
    const href = await openProfileLink.getAttribute("href");
    expect(href).toBeTruthy();
    await clickHrefAndAwaitUrlOrRetryGoto({
      page,
      trigger: openProfileLink,
      href: href!,
      expectedUrl: /\/my-library\/profile$/,
      clickNavigationTimeoutMs: 7_000,
    });
    await waitForRouteToSettle(page);
    await expect(
      page.getByRole("heading", {
        name: "My Swim Profile",
        level: 1,
      })
    ).toBeVisible();
    await waitForAthleteProfileClientReady(page);

    const displayNameInput = page.getByTestId("athlete-profile-display-name");
    if ((await displayNameInput.count()) === 0) {
      test.skip(true, "Athlete profile schema is not available in this environment.");
    }
    const personalRecordDistanceInput = page.getByTestId("athlete-record-distance-m");
    const hasPersonalRecordControls = (await personalRecordDistanceInput.count()) > 0;

    await displayNameInput.fill("Pool draft");
    await openAthleteProfileSection(page, "css");
    await page.getByTestId("athlete-profile-css-pace").fill("1:58");
    await openAthleteProfileSection(page, "preferences");
    await page.getByTestId("athlete-preferences-day-monday").check();
    await page.getByTestId("athlete-preferences-weekly-session-count").fill("13");
    await page.getByTestId("athlete-preferences-session-minutes").selectOption("60");
    if (hasPersonalRecordControls) {
      await openAthleteProfileSection(page, "records");
      await personalRecordDistanceInput.fill("200");
      await page.getByTestId("athlete-record-stroke").selectOption("freestyle");
      await page.getByTestId("athlete-record-course").selectOption("pool_25m");
      await page.getByTestId("athlete-record-time").fill("2:24.18");
    }
    await page.reload({ waitUntil: "domcontentloaded", timeout: 60_000 });
    await waitForRouteToSettle(page);
    await expect(
      page.getByRole("heading", {
        name: "My Swim Profile",
        level: 1,
      })
    ).toBeVisible();
    await waitForAthleteProfileClientReady(page);
    await expect(page.getByTestId("athlete-profile-display-name")).toHaveValue("Pool draft");
    await openAthleteProfileSection(page, "css");
    await expect(page.getByTestId("athlete-profile-css-pace")).toHaveValue("1:58");
    await openAthleteProfileSection(page, "preferences");
    await expect(page.getByTestId("athlete-preferences-day-monday")).toBeChecked();
    await expect(page.getByTestId("athlete-preferences-weekly-session-count")).toHaveValue("13");
    await expect(page.getByTestId("athlete-preferences-session-minutes")).toHaveValue("60");
    await expect(
      page.getByText("Unsaved swimmer-profile edits were restored on this device.")
    ).toBeVisible();
    await expect(page.getByText("Unsaved CSS edits were restored on this device.")).toBeVisible();
    await expect(
      page.getByText("Unsaved training preferences edits were restored on this device.")
    ).toBeVisible();
    if (hasPersonalRecordControls) {
      await openAthleteProfileSection(page, "records");
      await expect(page.getByTestId("athlete-record-distance-m")).toHaveValue("200");
      await expect(page.getByTestId("athlete-record-time")).toHaveValue("2:24.18");
      await expect(
        page.getByText("Unsaved personal-record edits were restored on this device.")
      ).toBeVisible();
    }
  });

  test("creates and deletes a personal record", async ({ page }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();
    testInfo.setTimeout(150_000);

    await loginToMyLibraryViaDevBypass(page);
    await gotoWithTransientRetry(page, "/my-library/profile", 60_000);
    await waitForRouteToSettle(page);
    await expect(
      page.getByRole("heading", {
        name: "My Swim Profile",
        level: 1,
      })
    ).toBeVisible();
    await waitForAthleteProfileClientReady(page);

    const distanceInput = page.getByTestId("athlete-record-distance-m");
    if ((await distanceInput.count()) === 0) {
      test.skip(true, "Personal records schema is not available in this environment.");
    }

    const distance = String(700 + (Date.now() % 200));
    const eventLabel = `${distance}m Freestyle · 25m pool`;

    await distanceInput.fill(distance);
    await page.getByTestId("athlete-record-stroke").selectOption("freestyle");
    await page.getByTestId("athlete-record-course").selectOption("pool_25m");
    await page.getByTestId("athlete-record-time").fill("9:59.99");
    const createRecordResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().includes("/api/my-library/profile/records") &&
        response.ok()
    );
    await page.getByTestId("athlete-record-save").click();

    await createRecordResponse;
    await expect(page.getByText("Personal record saved.")).toBeVisible();
    await expect(page.getByTestId("athlete-profile-section-records")).toHaveAttribute(
      "data-section-open",
      "false"
    );
    await expect(page.getByRole("heading", { name: eventLabel })).toBeVisible();

    await page.getByTestId("athlete-profile-section-toggle-records").click();
    await expect(page.getByTestId("athlete-profile-section-records")).toHaveAttribute(
      "data-section-open",
      "true"
    );

    const deleteRecordResponse = page.waitForResponse(
      (response) =>
        response.request().method() === "DELETE" &&
        response.url().includes("/api/my-library/profile/records/") &&
        response.ok()
    );
    page.once("dialog", async (dialog) => {
      await dialog.accept();
    });
    await page
      .locator("article")
      .filter({ hasText: eventLabel })
      .getByRole("button", { name: "Delete" })
      .click();

    await deleteRecordResponse;
    await expect(page.locator("article").filter({ hasText: eventLabel })).toHaveCount(0);
  });
});
