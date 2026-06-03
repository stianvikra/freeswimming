import { expect, test, type Locator, type Page, type TestInfo } from "@playwright/test";
import { isMobileProject } from "./project-guards";
import { gotoWithTransientRetry, waitForRouteToSettle } from "./utils/transient-navigation";

const MIN_NAV_GAP_PX = 8;

async function expectAboveBottomNav(page: Page, target: Locator) {
  const nav = page.getByTestId("mobile-fixed-nav");

  await expect(nav).toBeVisible();
  await expect(target).toBeVisible();

  const [navBox, targetBox] = await Promise.all([nav.boundingBox(), target.boundingBox()]);

  expect(navBox, "mobile fixed nav should have a measurable box").not.toBeNull();
  expect(targetBox, "target action should have a measurable box").not.toBeNull();

  const gap = navBox!.y - (targetBox!.y + targetBox!.height);
  expect(gap, "target action should clear the mobile bottom nav").toBeGreaterThanOrEqual(
    MIN_NAV_GAP_PX
  );
}

async function openMobileRoute(page: Page, href: string) {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoWithTransientRetry(page, href, 60_000);
  await waitForRouteToSettle(page);
}

function skipUnlessMobileChromium(testInfo: TestInfo) {
  test.skip(!isMobileProject(testInfo), "Safe-area checks only apply to mobile projects.");
  test.skip(
    testInfo.project.name !== "mobile-chromium",
    "Safe-area regression is standardized on the Chromium mobile profile."
  );
}

async function getPlansPrimaryAction(page: Page) {
  const purchaseActions = page.getByRole("button", {
    name: /^(Buy now|Buy 0-1000m guide|Buy Poolside guide|Buy Video analysis)$/,
  });
  if ((await purchaseActions.count()) > 0) {
    return purchaseActions.first();
  }

  return page.getByRole("link", { name: "Contact support" });
}

test.describe("mobile bottom nav safe area", () => {
  test("plans primary action clears the fixed bottom nav on first view", async ({
    page,
  }, testInfo) => {
    skipUnlessMobileChromium(testInfo);
    await openMobileRoute(page, "/plans");

    await expectAboveBottomNav(page, await getPlansPrimaryAction(page));
  });

  test("contact submit action clears the fixed bottom nav when scrolled into view", async ({
    page,
  }, testInfo) => {
    skipUnlessMobileChromium(testInfo);
    await openMobileRoute(page, "/contact");

    const submit = page.getByRole("button", { name: "Send message" });
    await submit.scrollIntoViewIfNeeded();
    await expectAboveBottomNav(page, submit);
  });

  test("analysis submit action clears the fixed bottom nav when scrolled into view", async ({
    page,
  }, testInfo) => {
    skipUnlessMobileChromium(testInfo);
    await openMobileRoute(page, "/analysis");

    const submit = page.getByRole("button", { name: "Send" });
    await submit.scrollIntoViewIfNeeded();
    await expectAboveBottomNav(page, submit);
  });
});
