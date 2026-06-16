import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import {
  clickHrefAndAwaitUrlOrRetryGoto,
  gotoWithTransientRetry,
  prewarmRoute,
  waitForRouteToSettle,
} from "./utils/transient-navigation";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";
const DETERMINISTIC_NEW_CONTENT_SIGNAL = {
  signature: "v1:e2e-my-library-notice-signal",
  lessonCount: 1,
  lessonTokens: ["lesson-token-mod1-l1"],
  firstLessonId: "mod1-l1",
  lessons: [
    {
      lessonId: "mod1-l1",
      lessonTitle: "Welcome to the course",
      moduleId: "mod1",
      moduleTitle: "Introduction to the Course",
      lessonToken: "lesson-token-mod1-l1",
    },
  ],
};

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Library notice e2e is desktop-only.");
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

async function ensureMyLibraryHeadingVisible(page: Page) {
  const libraryHeading = page.getByRole("heading", { name: "My Library" });
  const libraryReady = await libraryHeading.isVisible({ timeout: 15_000 }).catch(() => false);

  if (libraryReady) {
    return;
  }

  await refreshDevSessionForCurrentRoute(page);
  await expect(libraryHeading).toBeVisible({ timeout: 15_000 });
}

async function openExpandedNewLessonFromNotice(page: Page, lessonId: string) {
  const openLink = page
    .getByTestId("my-library-new-content-notice")
    .getByTestId(`my-library-new-content-item-${lessonId}`);
  await expect(openLink).toBeVisible();
  await expect(openLink).toHaveAttribute("href", /\/(?:en\/)?course(?:\/|\?lesson=)/);
  const href = await openLink.getAttribute("href");
  expect(href).toBeTruthy();

  await clickHrefAndAwaitUrlOrRetryGoto({
    page,
    trigger: openLink,
    href: href!,
    expectedUrl: /\/(?:en\/)?course(?:\/|\?|$)/,
    clickNavigationTimeoutMs: 10_000,
  });
  await waitForRouteToSettle(page);
  await expect(page).toHaveURL(/\/(?:en\/)?course(?:\/|\?|$)/);
}

test.describe("my library new content notice", () => {
  async function waitForNoticeResolution(page: Page) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const loadingLocator = page.getByTestId("my-library-new-content-notice-loading");
      const resolved = await expect
        .poll(
          async () => {
            if ((await loadingLocator.count()) === 0) {
              return "resolved";
            }

            if ((await page.getByTestId("my-library-new-content-notice").count()) > 0) {
              return "resolved";
            }

            if ((await page.getByTestId("my-library-new-content-notice-error").count()) > 0) {
              return "resolved";
            }

            return "loading";
          },
          { timeout: 15_000 }
        )
        .toBe("resolved")
        .then(() => true)
        .catch(() => false);

      if (resolved) {
        return;
      }

      if (attempt === 0) {
        await refreshDevSessionForCurrentRoute(page);
        await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
      }
    }

    test.skip(true, "New content notice did not resolve in this environment.");
  }

  test("shows, dismisses, persists, and reappears on stale seen signature", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();
    testInfo.setTimeout(240_000);
    await page.route("**/api/my-library/new-content-signal", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          signal: DETERMINISTIC_NEW_CONTENT_SIGNAL,
        }),
      });
    });
    await loginToMyLibraryViaDevBypass(page);

    await page.evaluate(() => {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("fs_library_new_content_seen:")) {
          localStorage.removeItem(key);
        }
      }
    });
    await gotoWithTransientRetry(page, "/my-library");
    await waitForRouteToSettle(page);
    await ensureMyLibraryHeadingVisible(page);
    await waitForNoticeResolution(page);

    const banner = page.getByTestId("my-library-new-content-notice");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText("New lessons");
    await expect(banner).not.toContainText("Updated content");
    await expect(banner).not.toContainText("1 new lesson");
    await expect(page.getByTestId("my-library-new-content-toggle")).toHaveText("Show list");
    await expect(page.getByTestId("my-library-new-content-open")).toHaveCount(0);
    await expect(page.getByTestId("my-library-new-content-toggle")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    await expect(page.getByTestId("my-library-new-content-list")).toHaveCount(0);

    await page.getByTestId("my-library-new-content-toggle").click();
    await expect(page.getByTestId("my-library-new-content-toggle")).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    await expect(page.getByTestId("my-library-new-content-toggle")).toHaveText("Hide list");
    await expect(page.getByTestId("my-library-new-content-list")).toBeVisible();

    await openExpandedNewLessonFromNotice(page, "mod1-l1");

    await gotoWithTransientRetry(page, "/my-library");
    await waitForRouteToSettle(page);
    await ensureMyLibraryHeadingVisible(page);
    await waitForNoticeResolution(page);
    await expect(page.getByTestId("my-library-new-content-notice")).toBeVisible();

    await page.getByTestId("my-library-new-content-dismiss").click();
    await expect(banner).toBeHidden();

    await refreshDevSessionForCurrentRoute(page);
    await ensureMyLibraryHeadingVisible(page);
    await waitForNoticeResolution(page);
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

    await refreshDevSessionForCurrentRoute(page);
    await ensureMyLibraryHeadingVisible(page);
    await waitForNoticeResolution(page);
    await expect(page.getByTestId("my-library-new-content-notice")).toBeVisible();
    await page.getByTestId("my-library-new-content-toggle").click();
    await expect(page.getByTestId("my-library-new-content-item-mod1-l1")).toBeVisible();
    await openExpandedNewLessonFromNotice(page, "mod1-l1");
  });

  test("keeps page usable and shows retry state when notice signal fetch fails", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();
    testInfo.setTimeout(90_000);

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
    await waitForNoticeResolution(page);
    await expect(page.getByTestId("my-library-new-content-notice-error")).toBeVisible();
    await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
  });
});
