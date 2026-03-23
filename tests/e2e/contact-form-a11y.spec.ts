import { expect, test, type Page } from "@playwright/test";

async function waitForContactPageToSettle(page: Page) {
  const compilingIndicator = page.getByText("Compiling", { exact: true });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await expect(compilingIndicator).toHaveCount(0, { timeout: 60_000 });
    await page.waitForTimeout(750);
    if ((await compilingIndicator.count()) === 0) {
      return;
    }
  }

  await expect(compilingIndicator).toHaveCount(0, { timeout: 60_000 });
}

test("contact form labels are associated and mobile load does not force focus", async ({
  page,
}) => {
  await page.goto("/contact", { waitUntil: "domcontentloaded", timeout: 60_000 });
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
  await expect
    .poll(
      () =>
        form.evaluate((node) =>
          Object.keys(node).some(
            (key) => key.startsWith("__reactProps$") || key.startsWith("__reactFiber$")
          )
        ),
      {
        timeout: 15_000,
        message: "Expected the contact form to finish React hydration before submitting.",
      }
    )
    .toBe(true);

  await expect(name).not.toBeFocused();

  const formError = page.locator("#contact-form-error");

  let submitted = false;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await waitForContactPageToSettle(page);
    await sendButton.scrollIntoViewIfNeeded();
    await sendButton.click();
    await expect(formError)
      .toContainText("Please enter your name.", { timeout: 4_000 })
      .catch(() => {});
    if ((await formError.textContent())?.includes("Please enter your name.")) {
      submitted = true;
      break;
    }
    await page.waitForTimeout(250);
  }

  expect(submitted).toBe(true);
  await expect(name).toBeFocused();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(name).toHaveAttribute("aria-describedby", "contact-form-error");
});
