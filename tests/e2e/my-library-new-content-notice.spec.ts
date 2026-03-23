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

async function loginToMyLibraryViaDevBypass(page: Page) {
  await page.goto(`/dev/login?next=${encodeURIComponent("/my-library")}`);
  const pathAfterLogin = new URL(page.url()).pathname;

  if (pathAfterLogin !== "/my-library") {
    test.skip(true, "Dev auth bypass is not enabled in this environment.");
  }

  await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
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
        await page.reload({ waitUntil: "domcontentloaded", timeout: 60_000 });
        await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
      }
    }

    await expect(page.getByTestId("my-library-new-content-notice-loading")).toHaveCount(0, {
      timeout: 15_000,
    });
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
    await page.reload({ waitUntil: "domcontentloaded", timeout: 60_000 });
    await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
    await waitForNoticeResolution(page);

    const banner = page.getByTestId("my-library-new-content-notice");
    await expect(banner).toBeVisible();
    await expect(banner).toContainText(/\+\d+ nye leksjoner i Free Course/);
    await expect(page.getByTestId("my-library-new-content-list")).toBeVisible();

    await openFirstNewLessonFromNotice(page);

    await page.goto("/my-library");
    await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
    await waitForNoticeResolution(page);
    await expect(page.getByTestId("my-library-new-content-notice")).toBeVisible();

    await page.getByTestId("my-library-new-content-dismiss").click();
    await expect(banner).toBeHidden();

    await page.reload({ waitUntil: "domcontentloaded", timeout: 60_000 });
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

    await page.reload({ waitUntil: "domcontentloaded", timeout: 60_000 });
    await waitForNoticeResolution(page);
    await expect(page.getByTestId("my-library-new-content-notice")).toBeVisible();
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
