import { expect, test } from "@playwright/test";

test("public pages follow runtime banner flag while auth page stays focused", async ({ page }) => {
  const runtimeFlagsResponse = await page.request.get("/api/runtime/flags");
  const runtimeFlagsPayload = (await runtimeFlagsResponse.json()) as {
    ok?: boolean;
    flags?: { softLaunchBanner?: boolean };
  };
  const softLaunchBannerEnabled = runtimeFlagsPayload.flags?.softLaunchBanner === true;

  await page.goto("/");
  if (new URL(page.url()).pathname === "/preview-access") {
    test.skip(true, "Public-banner assertions are skipped while site lock is enabled.");
  }

  if (softLaunchBannerEnabled) {
    await expect(page.getByTestId("soft-launch-banner")).toBeVisible();
    await expect(page.getByText("This site is under construction.")).toBeVisible();
  } else {
    await expect(page.getByTestId("soft-launch-banner")).toHaveCount(0);
  }

  await expect(page.getByTestId("header-auth-link")).toBeVisible();
  await expect(page.getByTestId("site-utility-footer")).toHaveCount(0);

  await page.goto("/auth/sign-in");

  await expect(page.getByTestId("soft-launch-banner")).toHaveCount(0);
  await expect(page.getByTestId("site-utility-footer")).toHaveCount(0);
  await expect(page.getByTestId("header-auth-link")).toHaveCount(0);
});
