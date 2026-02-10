import { expect, test } from "@playwright/test";

test("contact form labels are associated and mobile load does not force focus", async ({
  page,
}) => {
  await page.goto("/contact");

  const name = page.getByLabel("NAME");
  const email = page.getByLabel("EMAIL");
  const message = page.getByLabel("MESSAGE");

  await expect(name).toBeVisible();
  await expect(email).toBeVisible();
  await expect(message).toBeVisible();

  await expect(name).not.toBeFocused();

  await page.getByRole("button", { name: "Send" }).click();

  await expect(page.locator("#contact-form-error")).toContainText("Please enter your name.");
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(name).toHaveAttribute("aria-describedby", "contact-form-error");
});
