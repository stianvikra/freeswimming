import { expect, test } from "@playwright/test";

test("public pages show under-construction banner while auth page stays focused", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByTestId("soft-launch-banner")).toBeVisible();
  await expect(page.getByText("This site is under construction.")).toBeVisible();
  await expect(page.getByTestId("header-auth-link")).toBeVisible();
  await expect(page.getByTestId("site-utility-footer")).toHaveCount(0);

  await page.goto("/auth/sign-in");

  await expect(page.getByTestId("soft-launch-banner")).toHaveCount(0);
  await expect(page.getByTestId("site-utility-footer")).toHaveCount(0);
  await expect(page.getByTestId("header-auth-link")).toHaveCount(0);
});
