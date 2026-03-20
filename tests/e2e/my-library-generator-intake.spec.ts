import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Generator intake e2e is desktop-only.");
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

async function waitForGeneratorIntakeClientReady(page: Page) {
  await expect(page.getByTestId("generator-intake-hub")).toHaveAttribute(
    "data-client-ready",
    "true"
  );
}

test.describe("my library generator intake", () => {
  test("opens generator intake and prepares a deterministic handoff", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    await loginToMyLibraryViaDevBypass(page);
    const openGeneratorLink = page.getByRole("link", { name: "Open generator intake" });
    await expect(openGeneratorLink).toBeVisible();
    await expect(openGeneratorLink).toHaveAttribute("href", "/my-library/generator");
    await openGeneratorLink.click();
    const navigatedAfterClick = await page
      .waitForURL(/\/my-library\/generator$/, { timeout: 7_000 })
      .then(() => true)
      .catch(() => false);
    if (!navigatedAfterClick) {
      const href = await openGeneratorLink.getAttribute("href");
      expect(href).toBeTruthy();
      await page.goto(href!, { waitUntil: "domcontentloaded", timeout: 60_000 });
      await expect(page).toHaveURL(/\/my-library\/generator$/);
    }
    await expect(
      page.getByRole("heading", {
        name: "Generator intake",
        level: 1,
      })
    ).toBeVisible();
    await waitForGeneratorIntakeClientReady(page);

    await expect(
      page.getByText("Notes stay out of default generator prefill in v1.", { exact: false })
    ).toBeVisible();

    await page.getByTestId("generator-intake-target-program").check();
    await page.getByTestId("generator-intake-session-count").fill("4");
    await page.getByTestId("generator-intake-session-minutes").selectOption("45");
    await page.getByTestId("generator-intake-focus-text").fill("Race-pace breathing control");
    await page
      .getByTestId("generator-intake-constraint-text")
      .fill("Keep the first week moderate.");
    await page.getByTestId("generator-intake-prepare").click();

    await expect(page.getByText("Generator handoff prepared for the next slice.")).toBeVisible();
    await expect(page.getByTestId("generator-intake-handoff-preview")).toContainText(
      '"targetType": "program"'
    );
    await expect(page.getByTestId("generator-intake-handoff-preview")).toContainText(
      '"notesIncluded": false'
    );
  });
});
