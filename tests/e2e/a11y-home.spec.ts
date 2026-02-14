import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home has no serious or critical accessibility violations", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const results = await new AxeBuilder({ page }).analyze();
  const seriousOrCritical = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? "")
  );

  expect(seriousOrCritical).toEqual([]);
});
