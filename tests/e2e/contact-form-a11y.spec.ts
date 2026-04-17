import { expect, test, type Page } from "@playwright/test";
import { gotoWithTransientRetry, waitForRouteToSettle } from "./utils/transient-navigation";

async function waitForContactPageToSettle(page: Page) {
  await waitForRouteToSettle(page);
}

test("contact form labels are associated and mobile load does not force focus", async ({
  page,
}) => {
  test.slow();
  await gotoWithTransientRetry(page, "/contact", 60_000);
  await waitForContactPageToSettle(page);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );

  const name = page.getByLabel("NAME");
  const email = page.getByLabel("EMAIL");
  const message = page.getByLabel("MESSAGE");
  const sendButton = page.getByRole("button", { name: "Send" });
  const form = page.locator("form");

  await expect(name).toBeVisible();
  await expect(email).toBeVisible();
  await expect(message).toBeVisible();
  await expect(sendButton).toBeVisible();
  await expect(sendButton).toBeEnabled();
  await expect(form).toBeVisible();

  await expect(name).not.toBeFocused();

  const formError = page.locator("#contact-form-error");

  let submitted = false;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await waitForContactPageToSettle(page);
    await sendButton.scrollIntoViewIfNeeded();
    await sendButton.click();
    const invalidStateVisible = await expect(formError)
      .toContainText("Please enter your name.", { timeout: 4_000 })
      .then(() => true)
      .catch(async () => {
        return (await name.getAttribute("aria-invalid").catch(() => null)) === "true";
      });
    if (invalidStateVisible) {
      submitted = true;
      break;
    }
    await page.waitForTimeout(250);
  }

  expect(submitted).toBe(true);
  await expect(formError).toContainText("Please enter your name.");
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(name).toHaveAttribute("aria-describedby", "contact-form-error");
});

test("preview notify contact stays minimal and uses the library lockup", async ({ page }) => {
  test.slow();

  await gotoWithTransientRetry(page, "/contact?source=preview_access_notify", 60_000);
  await waitForContactPageToSettle(page);

  await expect(page.getByRole("heading", { name: "Preview Updates" })).toBeVisible();
  await expect(page.getByAltText("freeswimming.org")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Get notified when preview opens" })
  ).toBeVisible();
  await expect(page.getByLabel("NAME")).toBeVisible();
  await expect(page.getByLabel("EMAIL")).toBeVisible();
  await expect(page.getByLabel("OPTIONAL NOTE")).toBeVisible();
  await expect(page.getByRole("button", { name: "Join notify list" })).toBeVisible();
  await expect(page.getByText("What to include")).toHaveCount(0);
  await expect(page.getByText("Optional note ideas")).toHaveCount(0);
});
