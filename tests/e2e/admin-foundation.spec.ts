import { expect, test } from "@playwright/test";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";
const unauthenticatedDeniedStatuses = new Set([401, 403, 423]);

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Admin e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

test.describe("admin foundation", () => {
  test("redirects unauthenticated users to access gate with next path", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    await page.goto("/admin");

    const destination = new URL(page.url());
    expect(["/auth/sign-in", "/preview-access"]).toContain(destination.pathname);
    expect(destination.searchParams.get("next")).toBe("/admin");
  });

  test("rejects unauthenticated admin API access", async ({ request }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    const endpoints = ["/api/admin/content", "/api/admin/products", "/api/admin/operations/flags"];

    for (const endpoint of endpoints) {
      const response = await request.get(endpoint);
      expect(
        unauthenticatedDeniedStatuses.has(response.status()),
        `Unexpected status ${response.status()} for ${endpoint}`
      ).toBeTruthy();
    }
  });

  test("allowlisted dev account can complete core content workflow", async ({ page }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    const unique = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const title = `E2E Admin Content ${unique}`;
    const slug = `e2e-admin-content-${unique}`;

    await page.goto(`/dev/login?next=${encodeURIComponent("/admin")}`);
    const pathAfterDevLogin = new URL(page.url()).pathname;

    if (pathAfterDevLogin !== "/admin") {
      test.skip(true, "Dev auth bypass is not enabled in this environment.");
    }

    const noAccessHeading = page.getByRole("heading", { name: "You don't have access" });
    if (await noAccessHeading.isVisible().catch(() => false)) {
      test.skip(true, "Dev bypass account is signed in but not allowlisted/admin.");
    }

    await expect(page.getByRole("heading", { name: "Admin console" })).toBeVisible();

    const tabContent = page.getByTestId("admin-tab-content");
    const tabCommerce = page.getByTestId("admin-tab-commerce");
    const tabOperations = page.getByTestId("admin-tab-operations");
    const tabNotes = page.getByTestId("admin-tab-notes");
    const activeSectionLabel = page.getByTestId("admin-active-section-label");

    await expect(tabContent).toHaveAttribute("aria-pressed", "true");

    await tabCommerce.click();
    await expect(activeSectionLabel).toHaveText("Commerce");
    await expect(page.getByRole("heading", { name: "Commerce" })).toBeVisible();

    await tabOperations.click();
    await expect(activeSectionLabel).toHaveText("Operations");
    await expect(page.getByRole("heading", { name: "Operations" })).toBeVisible();

    await tabNotes.click();
    await expect(activeSectionLabel).toHaveText("Notes");
    await expect(page.getByRole("heading", { name: "Notes" })).toBeVisible();

    await tabContent.click();
    await expect(activeSectionLabel).toHaveText("Content");
    await expect(page.getByRole("heading", { name: "Content items" })).toBeVisible();

    const createForm = page.getByTestId("admin-content-create-form");
    await createForm.getByLabel("Title").fill(title);
    await createForm.getByLabel("Slug (optional)").fill(slug);
    await createForm.getByLabel("Summary").fill("Created by Playwright admin e2e.");
    await createForm.getByRole("button", { name: "Save content item" }).click();

    const createdItem = page.getByTestId("admin-content-item").filter({ hasText: title });
    await expect(createdItem).toHaveCount(1, { timeout: 15_000 });
    await expect(createdItem).toContainText("draft");

    await createdItem.getByRole("button", { name: "Publish" }).click();
    await expect(createdItem).toContainText("published");

    page.once("dialog", (dialog) => dialog.accept());
    await createdItem.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByTestId("admin-content-item").filter({ hasText: title })).toHaveCount(0);
  });
});
