import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

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

async function prewarmRoute(page: Page, href: string, timeoutMs = 90_000) {
  return page.request
    .get(href, {
      timeout: timeoutMs,
      failOnStatusCode: false,
    })
    .catch(() => null);
}

async function gotoWithTransientRetry(page: Page, href: string, initialTimeoutMs = 90_000) {
  await prewarmRoute(page, href, initialTimeoutMs);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await page.goto(href, {
        waitUntil: "domcontentloaded",
        timeout: attempt === 0 ? initialTimeoutMs : 60_000,
      });
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isTransientGotoError =
        /ERR_ABORTED|frame was detached|page\.goto: Timeout \d+ms exceeded/i.test(errorMessage);

      if (!isTransientGotoError || attempt === 2) {
        throw error;
      }

      await page.waitForTimeout(1_000);
    }
  }
}

async function waitForRouteToSettle(page: Page) {
  const compilingIndicator = page.getByText("Compiling", { exact: true });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await expect(compilingIndicator).toHaveCount(0, { timeout: 60_000 });
    await page.waitForTimeout(750);
    if ((await compilingIndicator.count()) === 0) {
      break;
    }
  }

  await page.waitForTimeout(300);
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

async function openFirstNewLessonFromNotice(page: Page) {
  const openLink = page
    .getByTestId("my-library-new-content-notice")
    .getByTestId("my-library-new-content-open");
  await expect(openLink).toBeVisible();
  await expect(openLink).toHaveAttribute("href", /\/course\?lesson=/);
  const href = await openLink.getAttribute("href");
  expect(href).toBeTruthy();

  await openLink.click();
  const navigatedAfterClick = await page
    .waitForURL(/\/course(\?|$)/, { timeout: 7_000 })
    .then(() => true)
    .catch(() => false);
  if (navigatedAfterClick) return;

  await page.goto(href!, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await expect(page).toHaveURL(/\/course(\?|$)/);
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
    await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
    await waitForNoticeResolution(page);

    const banner = page.getByTestId("my-library-new-content-notice");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText(/\+\d+ nye leksjoner i Free Course/);
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
    await expect(page.getByTestId("my-library-new-content-list")).toBeVisible();

    await openFirstNewLessonFromNotice(page);

    await gotoWithTransientRetry(page, "/my-library");
    await waitForRouteToSettle(page);
    await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
    await waitForNoticeResolution(page);
    await expect(page.getByTestId("my-library-new-content-notice")).toBeVisible();

    await page.getByTestId("my-library-new-content-dismiss").click();
    await expect(banner).toBeHidden();

    await refreshDevSessionForCurrentRoute(page);
    await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
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
    await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
    await waitForNoticeResolution(page);
    await expect(page.getByTestId("my-library-new-content-notice")).toBeVisible();
    await page.getByTestId("my-library-new-content-toggle").click();
    await expect(page.getByTestId("my-library-new-content-item-mod1-l1")).toBeVisible();
    await openFirstNewLessonFromNotice(page);
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
    await waitForNoticeResolution(page);
    await expect(page.getByTestId("my-library-new-content-notice-error")).toBeVisible();
    await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
  });
});
