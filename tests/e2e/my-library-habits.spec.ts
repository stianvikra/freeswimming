import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import {
  gotoWithTransientRetry,
  prewarmRoute,
  waitForRouteToSettle,
} from "./utils/transient-navigation";
import { isMobileProject } from "./project-guards";

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

async function getTimezoneCookieWriteCount(page: Page) {
  return page.evaluate(
    () =>
      (
        (window as typeof window & { __fsTimezoneCookieWrites?: string[] })
          .__fsTimezoneCookieWrites ?? []
      ).filter((value) => value.startsWith("fs_timezone=")).length
  );
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

  test("mobile contextual nav links Habits and Micro Sessions directly", async ({
    page,
  }, testInfo) => {
    test.skip(
      !isMobileProject(testInfo),
      "Contextual mobile nav behavior is validated only on mobile projects."
    );
    test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
    test.slow();

    await loginToHabitsViaDevBypass(page);

    const nav = page.getByTestId("mobile-fixed-nav");
    const library = page.getByTestId("mobile-nav-library");
    const micro = page.getByTestId("mobile-nav-micro");
    const habits = page.getByTestId("mobile-nav-habits");

    await expect(nav).toBeVisible();
    await expect(library).toHaveAttribute("href", "/my-library");
    await expect(micro).toHaveAttribute(
      "href",
      "/my-library/dryland?micro=active&view=auto#micro-sessions"
    );
    await expect(habits).toHaveAttribute("aria-current", "page");

    await micro.click();
    await waitForRouteToSettle(page);
    const microUrl = new URL(page.url());
    expect(microUrl.pathname).toBe("/my-library/dryland");
    expect(microUrl.searchParams.get("micro")).toBe("active");
    await expect(page.getByTestId("mobile-nav-micro")).toHaveAttribute("aria-current", "page");
    await expect(page.getByTestId("mobile-nav-habits")).toHaveAttribute(
      "href",
      "/my-library/habits?view=active#today-habits"
    );

    await page.getByTestId("mobile-nav-habits").click();
    await waitForRouteToSettle(page);
    expect(new URL(page.url()).pathname).toBe("/my-library/habits");
  });
});

test.describe("my library habits local-day reconciliation", () => {
  test.use({ timezoneId: "Europe/Oslo" });

  test("repairs a stale timezone cookie once and stays stable after reload", async ({
    context,
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Runs once on desktop Chromium.");
    test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");

    await page.addInitScript(() => {
      const descriptor = Object.getOwnPropertyDescriptor(Document.prototype, "cookie");
      if (!descriptor?.get || !descriptor.set) return;
      const writes: string[] = [];
      Object.defineProperty(window, "__fsTimezoneCookieWrites", { value: writes });
      Object.defineProperty(document, "cookie", {
        configurable: true,
        get: () => descriptor.get?.call(document),
        set: (value: string) => {
          writes.push(value);
          descriptor.set?.call(document, value);
        },
      });
    });

    const baseUrl = `http://127.0.0.1:${process.env.PW_PORT ?? "3100"}`;
    await context.addCookies([
      {
        name: "fs_timezone",
        value: "UTC",
        url: baseUrl,
        sameSite: "Lax",
      },
    ]);

    await loginToHabitsViaDevBypass(page);
    await expect(page.getByRole("heading", { name: "Habits", level: 1 })).toBeVisible({
      timeout: 15_000,
    });
    await expect
      .poll(async () => {
        const cookie = (await context.cookies()).find(({ name }) => name === "fs_timezone");
        return cookie ? decodeURIComponent(cookie.value) : null;
      })
      .toBe("Europe/Oslo");
    expect(await getTimezoneCookieWriteCount(page)).toBe(1);

    await page.reload();
    await waitForRouteToSettle(page);
    await expect(page.getByRole("heading", { name: "Habits", level: 1 })).toBeVisible();
    expect(await getTimezoneCookieWriteCount(page)).toBe(0);
  });
});
