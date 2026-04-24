import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { gotoWithTransientRetry } from "./utils/transient-navigation";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

function skipCurrentTest(reason: string): never {
  test.skip(true, reason);
  throw new Error(reason);
}

function testBaseUrl() {
  return `http://127.0.0.1:${process.env.PW_PORT ?? "3100"}`;
}

async function expectSecurityRouteRedirect(
  page: Page,
  expectedPathname: string,
  expectedNext?: string
) {
  const response = await page.request.get("/my-library/security", {
    failOnStatusCode: false,
    maxRedirects: 0,
  });

  expect([303, 307, 308]).toContain(response.status());

  const location = response.headers().location;
  expect(location).toBeTruthy();

  const redirectUrl = new URL(location ?? "/", testBaseUrl());
  expect(redirectUrl.pathname).toBe(expectedPathname);

  if (expectedNext) {
    expect(redirectUrl.searchParams.get("next")).toBe(expectedNext);
  }
}

async function loginToMyLibraryViaDevBypass(page: Page) {
  const loginHref = `/dev/login?next=${encodeURIComponent("/my-library")}`;
  const loginProbe = await page.request
    .get(loginHref, {
      failOnStatusCode: false,
      maxRedirects: 0,
      timeout: 20_000,
    })
    .catch(() => null);

  if (!loginProbe) {
    skipCurrentTest("Dev auth bypass is not reachable in this environment.");
  }

  if (loginProbe.status() >= 500) {
    skipCurrentTest("Dev auth bypass is not reachable in this environment.");
  }

  const location = loginProbe.headers().location;
  const redirectUrl = new URL(location ?? "/", testBaseUrl());
  if (redirectUrl.pathname !== "/my-library") {
    skipCurrentTest("Dev auth bypass is not enabled in this environment.");
  }

  await gotoWithTransientRetry(page, "/my-library");
  await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
}

test.describe("account security simplification", () => {
  test("keeps the retired account-security route protected and redirects to My Library", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    await expectSecurityRouteRedirect(page, "/auth/sign-in", "/my-library");

    await loginToMyLibraryViaDevBypass(page);
    await expectSecurityRouteRedirect(page, "/my-library");
    expect(new URL(page.url()).pathname).toBe("/my-library");
    await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
    await expect(page.getByText("Account & Security")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Manage billing" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
  });
});
