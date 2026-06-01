import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import {
  gotoWithTransientRetry,
  prewarmRoute,
  waitForRouteToSettle,
} from "./utils/transient-navigation";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

async function loginToHomeViaDevBypass(page: Page) {
  const loginHref = `/dev/login?next=${encodeURIComponent("/")}`;
  const loginProbe = await prewarmRoute(page, loginHref, 5_000);
  if (!loginProbe || loginProbe.status() >= 500) {
    test.skip(true, "Dev auth bypass is not reachable in this environment.");
  }

  await page
    .goto(loginHref, {
      waitUntil: "commit",
      timeout: 5_000,
    })
    .catch(() => test.skip(true, "Dev auth bypass is not reachable in this environment."));
  if (new URL(page.url()).pathname !== "/") {
    test.skip(true, "Dev auth bypass is not enabled in this environment.");
  }

  await waitForRouteToSettle(page);
  await expect(page.getByRole("heading", { name: "Adult learner?" })).toBeVisible({
    timeout: 15_000,
  });
}

async function getPrimaryActionLabels(page: Page) {
  return page
    .getByTestId("home-primary-actions")
    .locator("a")
    .evaluateAll((links) =>
      links.map((link) => ((link as HTMLElement).innerText ?? "").replace(/\s+/g, " ").trim())
    );
}

test.describe("home routines entrypoint", () => {
  test("keeps anonymous Home browse-first without routines login duplication", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Runs once on desktop Chromium.");
    test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");

    await gotoWithTransientRetry(page, "/");
    await waitForRouteToSettle(page);

    await expect(page.getByRole("heading", { name: "Adult learner?" })).toBeVisible();
    await expect(page.getByRole("link", { name: /My Routines/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Micro Sessions/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /^Habits/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Free course/i })).toHaveClass(/fs-cta-primary/);
    await expect(page.getByRole("link", { name: /Swim programs/i })).toHaveClass(/fs-library-card/);
    await expect(page.getByTestId("home-auth-link")).toHaveClass(/fs-cta-secondary/);
    await expect(await getPrimaryActionLabels(page)).toEqual([
      "Free course Start swimming today No signup. No paywall. Just swim.",
      "Swim programs Structured plans and PDFs",
      "Video analysis Technique feedback when useful",
      "Contact Questions, requests, and early access",
    ]);
  });

  test("puts signed-in routine quick actions one click below Free course", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Runs once on desktop Chromium.");
    test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");

    await loginToHomeViaDevBypass(page);

    const microSessionsLink = page.getByRole("link", {
      name: /Micro Sessions:/i,
    });
    const habitsLink = page.getByRole("link", {
      name: /Habits:/i,
    });
    await expect(microSessionsLink).toBeVisible();
    await expect(habitsLink).toBeVisible();
    await expect(microSessionsLink).toHaveAttribute(
      "href",
      /\/my-library\/dryland(\?micro=(active|edit|setup).*#micro-sessions|#micro-sessions)/
    );
    await expect(habitsLink).toHaveAttribute(
      "href",
      /\/my-library\/habits\?view=active#(today-habits|add-habit)/
    );
    await expect(microSessionsLink).toHaveClass(/fs-library-card/);
    await expect(habitsLink).toHaveClass(/fs-library-card/);
    await expect(page.getByTestId("home-auth-link")).toHaveClass(/fs-cta-secondary/);
    await expect(await getPrimaryActionLabels(page)).toEqual([
      "Free course Start swimming today No signup. No paywall. Just swim.",
      expect.stringMatching(/^Micro Sessions /),
      expect.stringMatching(/^Habits /),
      "Swim programs Structured plans and PDFs",
      "Video analysis Technique feedback when useful",
      "Contact Questions, requests, and early access",
    ]);
  });
});
