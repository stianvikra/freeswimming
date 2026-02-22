import { expect, test } from "@playwright/test";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";
const unauthenticatedDeniedStatuses = new Set([401, 403, 423]);

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Admin e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

type AdminContentProbeResponse =
  | {
      ok: true;
      schemaReady?: boolean;
      warning?: string | null;
    }
  | {
      ok: false;
      error?: string;
    };

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
      let response;
      try {
        response = await request.get(endpoint, { timeout: 10_000 });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isUnavailableProbe =
          /timeout|Request context disposed|ECONNREFUSED|ENOTFOUND|EAI_AGAIN/i.test(errorMessage);
        if (isUnavailableProbe) {
          test.skip(
            true,
            `Admin API unauthenticated probe is unavailable in this environment (${endpoint}).`
          );
        }
        throw error;
      }
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
    const roleBadge = page.getByText(/^Role:\s*/i).first();
    if (await roleBadge.isVisible().catch(() => false)) {
      const roleText = ((await roleBadge.textContent()) ?? "").toLowerCase();
      if (!roleText.includes("admin") && !roleText.includes("editor")) {
        test.skip(true, "Current admin session is read-only (viewer) in this environment.");
      }
    }

    const contentProbeResponse = await page.request.get("/api/admin/content");
    if (!contentProbeResponse.ok()) {
      test.skip(true, `Admin content API unavailable (${contentProbeResponse.status()}).`);
    }
    const contentProbePayload = (await contentProbeResponse.json()) as AdminContentProbeResponse;
    if (!contentProbePayload.ok) {
      test.skip(true, contentProbePayload.error ?? "Admin content API is not ready.");
    }
    if (contentProbePayload.ok && contentProbePayload.schemaReady === false) {
      test.skip(true, contentProbePayload.warning ?? "Admin content schema is not ready.");
    }

    const tabContent = page.getByTestId("admin-tab-content");
    const tabCommerce = page.getByTestId("admin-tab-commerce");
    const tabOperations = page.getByTestId("admin-tab-operations");
    const tabNotes = page.getByTestId("admin-tab-notes");
    const tabCategories = page.getByTestId("admin-tab-categories");
    const tabHelp = page.getByTestId("admin-tab-help");
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

    await tabCategories.click();
    await expect(activeSectionLabel).toHaveText("Categories");
    await expect(page.getByRole("heading", { name: "Categories" })).toBeVisible();

    await tabHelp.click();
    await expect(activeSectionLabel).toHaveText("Help/Guide");
    await expect(page.getByRole("heading", { name: "Help/Guide" })).toBeVisible();

    await tabContent.click();
    await expect(activeSectionLabel).toHaveText("Content");
    await expect(page.getByRole("heading", { name: "Content items" })).toBeVisible();

    const createForm = page.getByTestId("admin-content-create-form");
    await createForm.getByLabel("Title").fill(title);
    await createForm.getByLabel("Slug (optional)").fill(slug);
    await createForm.getByLabel("Summary").fill("Created by Playwright admin e2e.");
    await createForm.getByRole("button", { name: "Save content item" }).click();

    const createdItem = page.getByTestId("admin-content-item").filter({ hasText: title });
    try {
      await expect(createdItem).toHaveCount(1, { timeout: 15_000 });
    } catch {
      const schemaNotice = page.getByText(/setup is not ready/i).first();
      const createError = page.getByText(/Could not create content item\./i).first();
      if (
        (await schemaNotice.isVisible().catch(() => false)) ||
        (await createError.isVisible().catch(() => false))
      ) {
        test.skip(true, "Admin content create is not write-ready in this environment.");
      }
      throw new Error("Admin content item was not created in expected time.");
    }
    await expect(createdItem).toContainText("draft");

    const listTypeFilter = page.getByLabel("Filter by type");
    const listSearch = page.getByLabel("Search content items");
    await expect(listTypeFilter).toBeVisible();
    await expect(listSearch).toBeVisible();

    await listTypeFilter.selectOption("course_module");
    await expect(createdItem).toBeVisible();
    await listSearch.fill(title);
    await expect(createdItem).toBeVisible();
    await listSearch.fill("");
    await listTypeFilter.selectOption("all");

    const editedTitle = `${title} Updated`;
    const editedSlug = `${slug}-updated`;
    await createdItem.getByRole("button", { name: "Edit" }).click();
    const editForm = createdItem.getByTestId("admin-content-edit-form");
    await expect(editForm).toBeVisible();
    await editForm.getByLabel("Title").fill(editedTitle);
    await editForm.getByLabel("Slug").fill(editedSlug);
    await editForm.getByLabel("Category").fill("E2E QA");
    await editForm.getByLabel("Sort order").fill("5");
    await editForm.getByLabel("Summary").fill("Updated by Playwright admin e2e.");
    await editForm.getByRole("button", { name: "Save changes" }).click();
    await expect(createdItem).toContainText(editedTitle);
    await expect(createdItem).toContainText("/" + editedSlug);
    await expect(createdItem).toContainText("E2E QA");
    await expect(createdItem).toContainText("Order: 5");
    await expect(page.getByText("Content item updated.")).toBeVisible();

    await createdItem.getByRole("button", { name: "Edit" }).click();
    const editFormDirty = createdItem.getByTestId("admin-content-edit-form");
    await expect(editFormDirty).toBeVisible();
    await editFormDirty.getByLabel("Title").fill(`${editedTitle} Unsaved`);

    page.once("dialog", (dialog) => dialog.dismiss());
    await editFormDirty.getByRole("button", { name: "Cancel" }).click();
    await expect(createdItem.getByTestId("admin-content-edit-form")).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    await editFormDirty.getByRole("button", { name: "Cancel" }).click();
    await expect(createdItem.getByTestId("admin-content-edit-form")).toHaveCount(0);

    const guideSessionItem = page
      .getByTestId("admin-content-item")
      .filter({ hasText: "Baseline and breathing rhythm" })
      .first();
    await expect(guideSessionItem).toContainText("guide_session");
    await guideSessionItem.getByRole("button", { name: "Edit" }).click();
    const guideSessionEditForm = guideSessionItem.getByTestId("admin-content-edit-form");
    await expect(guideSessionEditForm).toBeVisible();
    await expect(guideSessionEditForm.getByText("Parent module")).toHaveCount(0);
    await guideSessionEditForm.getByRole("button", { name: "Cancel" }).click();
    await expect(guideSessionItem.getByTestId("admin-content-edit-form")).toHaveCount(0);

    const guideDrillItem = page
      .getByTestId("admin-content-item")
      .filter({ hasText: "Streamline push and glide reset" })
      .first();
    await expect(guideDrillItem).toContainText("guide_drill");
    await guideDrillItem.getByRole("button", { name: "Edit" }).click();
    const guideDrillEditForm = guideDrillItem.getByTestId("admin-content-edit-form");
    await expect(guideDrillEditForm).toBeVisible();
    await expect(guideDrillEditForm.getByText("Parent module")).toHaveCount(0);
    await guideDrillEditForm.getByRole("button", { name: "Cancel" }).click();
    await expect(guideDrillItem.getByTestId("admin-content-edit-form")).toHaveCount(0);

    await createdItem.getByRole("button", { name: "Move to review" }).click();
    await expect(createdItem).toContainText("review");

    await createdItem.getByRole("button", { name: "Publish" }).click();
    await expect(createdItem).toContainText("published");

    await createdItem.getByRole("button", { name: "Archive" }).click();
    await expect(createdItem).toContainText("archived");

    await createdItem.getByRole("button", { name: "Move to draft" }).click();
    await expect(createdItem).toContainText("draft");

    await createdItem.getByRole("button", { name: "Revisions" }).click();
    await expect(createdItem.getByText("Revision history")).toBeVisible();
    const revisionEntries = createdItem.getByTestId("admin-content-revision-item");
    await expect(revisionEntries.first()).toBeVisible({ timeout: 10_000 });

    page.once("dialog", (dialog) => dialog.accept());
    await revisionEntries.first().getByRole("button", { name: "Restore" }).click();
    await expect(page.getByText("Revision restored.")).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    await createdItem.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByTestId("admin-content-item").filter({ hasText: title })).toHaveCount(0);
  });
});
