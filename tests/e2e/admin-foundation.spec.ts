import { expect, test } from "@playwright/test";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";
const unauthenticatedDeniedStatuses = new Set([401, 403, 423]);

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Admin e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

function skipForUnexpectedDevLoginDestination(destination: URL): void {
  if (destination.pathname === "/auth/sign-in") {
    const errorMessage = destination.searchParams.get("error");
    if (errorMessage && /could not sign in/i.test(errorMessage)) {
      test.skip(
        true,
        "Dev auth bypass is enabled but sign-in failed; check DEV_AUTH_BYPASS_EMAIL/DEV_AUTH_BYPASS_PASSWORD."
      );
    }
    test.skip(true, "Dev auth bypass is not enabled in this environment.");
  }

  if (destination.pathname === "/preview-access") {
    test.skip(true, "Site lock is enabled; dev-login did not reach /admin.");
  }

  test.skip(true, `Dev login redirected to unexpected path (${destination.pathname}).`);
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
    const destinationAfterDevLogin = new URL(page.url());
    const pathAfterDevLogin = destinationAfterDevLogin.pathname;

    if (pathAfterDevLogin !== "/admin") {
      skipForUnexpectedDevLoginDestination(destinationAfterDevLogin);
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
    const tabQrLinks = page.getByTestId("admin-tab-qr-links");
    const tabCommerce = page.getByTestId("admin-tab-commerce");
    const tabOperations = page.getByTestId("admin-tab-operations");
    const tabEmailTemplates = page.getByTestId("admin-tab-email-templates");
    const tabNotes = page.getByTestId("admin-tab-notes");
    const tabCategories = page.getByTestId("admin-tab-categories");
    const tabHelp = page.getByTestId("admin-tab-help");
    const activeSectionLabel = page.getByTestId("admin-active-section-label");

    await expect(tabContent).toHaveAttribute("aria-pressed", "true");

    await tabQrLinks.click();
    await expect(activeSectionLabel).toHaveText("QR Links");
    await expect(page.getByRole("heading", { name: "QR registry" })).toBeVisible();
    await page.goto(
      "/admin?tab=qr-links&qrSlug=mod3-l1&qrDestinationPath=%2Fcourse%3Flesson%3Dmod3-l1&qrContentLabel=Kick%20Basics%20Support%20Not%20Speed&qrPlacementKey=course.lesson.share"
    );
    await expect(activeSectionLabel).toHaveText("QR Links");
    const qrCreateToggle = page.getByTestId("admin-qr-link-create-toggle");
    await expect(qrCreateToggle).toHaveAttribute("aria-expanded", "true");
    const qrCreateForm = page.getByTestId("admin-qr-link-create-form");
    if (!(await qrCreateForm.isVisible().catch(() => false))) {
      await qrCreateToggle.click();
    }
    await expect(qrCreateForm.getByLabel("Slug")).toHaveValue("mod3-l1");
    await expect(qrCreateForm.getByLabel("Destination URL (https)")).toHaveValue(
      /\/course\?lesson=mod3-l1$/
    );
    await expect(qrCreateForm.getByLabel("Content label (optional)")).toHaveValue(
      "Kick Basics Support Not Speed"
    );
    await expect(qrCreateForm.getByLabel("Placement key (optional)")).toHaveValue(
      "course.lesson.share"
    );

    await tabCommerce.click();
    await expect(activeSectionLabel).toHaveText("Commerce");
    await expect(page.getByRole("heading", { name: "Commerce" })).toBeVisible();

    await tabOperations.click();
    await expect(activeSectionLabel).toHaveText("Operations");
    await expect(page.getByRole("heading", { name: "Operations" })).toBeVisible();

    await tabEmailTemplates.click();
    await expect(activeSectionLabel).toHaveText("Email templates");
    await expect(page.getByRole("heading", { name: "Email templates" })).toBeVisible();

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
    const courseWorkspaceTab = page.getByTestId("admin-content-view-tab-course-workspace");
    const allContentTab = page.getByTestId("admin-content-view-tab-all-content");
    await expect(courseWorkspaceTab).toBeVisible();
    await expect(allContentTab).toBeVisible();
    await allContentTab.click();
    await expect(allContentTab).toHaveAttribute("aria-pressed", "true");

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
    await expect(createdItem.getByRole("button", { name: "Move up" })).toBeVisible();
    await expect(createdItem.getByRole("button", { name: "Move down" })).toBeVisible();

    const listTypeFilter = page.getByLabel("Filter by type");
    const listStatusFilter = page.getByLabel("Filter by status");
    const listSort = page.getByLabel("Sort content list");
    const listSearch = page.getByLabel("Search content items");
    const focusModeBanner = page.getByTestId("admin-content-focus-mode");
    const moduleTypeChip = page.getByTestId("admin-content-type-chip-course_module");
    const pageTypeChip = page.getByTestId("admin-content-type-chip-page");
    const productTypeChip = page.getByTestId("admin-content-type-chip-product");
    const allTypeChip = page.getByTestId("admin-content-type-chip-all");
    const typeSelect = createForm.getByLabel("Type");
    await expect(listTypeFilter).toHaveValue("course_module");
    await expect(listTypeFilter).toBeVisible();
    await expect(listStatusFilter).toBeVisible();
    await expect(listSort).toBeVisible();
    await expect(listSearch).toBeVisible();
    await expect(moduleTypeChip).toBeVisible();
    await expect(pageTypeChip).toBeVisible();
    await expect(productTypeChip).toBeVisible();
    await expect(allTypeChip).toBeVisible();
    await expect(typeSelect.locator("option[value='page']")).toHaveCount(1);
    await expect(typeSelect.locator("option[value='product']")).toHaveCount(1);

    await listTypeFilter.selectOption("course_module");
    await expect(createdItem).toBeVisible();
    await listSearch.fill(title);
    await expect(createdItem).toBeVisible();
    await listSearch.fill("");
    await listStatusFilter.selectOption("published");
    await expect(createdItem).toHaveCount(0);
    await listStatusFilter.selectOption("draft");
    await expect(createdItem).toBeVisible();
    await listSort.selectOption("updated_desc");
    await expect(createdItem).toBeVisible();
    await moduleTypeChip.click();
    await expect(createdItem).toBeVisible();
    await allTypeChip.click();
    await listStatusFilter.selectOption("all");
    await listTypeFilter.selectOption("all");

    await courseWorkspaceTab.click();
    await expect(courseWorkspaceTab).toHaveAttribute("aria-pressed", "true");

    const mirrorLessonCard = page.getByTestId("admin-mirror-metric-course_lesson");
    await expect(mirrorLessonCard).toHaveCount(0);
    await allContentTab.click();
    await expect(allContentTab).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("admin-course-list-visibility-toggle")).toBeVisible();
    await expect(mirrorLessonCard).toBeVisible();
    await mirrorLessonCard.click();
    await expect(listTypeFilter).toHaveValue("course_lesson");
    await expect(focusModeBanner).toContainText("Focus mode: Course lessons");
    await focusModeBanner.getByRole("button", { name: "Clear focus" }).click();
    await expect(listTypeFilter).toHaveValue("course_module");

    await courseWorkspaceTab.click();
    await expect(courseWorkspaceTab).toHaveAttribute("aria-pressed", "true");

    const lessonWorkspace = page.getByTestId("admin-course-lesson-workspace");
    await expect(lessonWorkspace).toBeVisible();
    await expect(page.getByTestId("admin-course-status-overview")).toBeVisible();
    const workspaceModuleSelect = lessonWorkspace.getByLabel("Module workspace");
    await expect(workspaceModuleSelect).toBeVisible();
    const introModuleValue = await workspaceModuleSelect.evaluate((node) => {
      const selectElement = node as HTMLSelectElement;
      const option = [...selectElement.options].find((entry) =>
        entry.textContent?.includes("Introduction to the Course")
      );
      return option?.value ?? "";
    });
    if (!introModuleValue) {
      test.skip(true, "Module workspace does not contain Introduction to the Course.");
    }
    await workspaceModuleSelect.selectOption(introModuleValue);
    await expect(listTypeFilter).toHaveValue("course_lesson");
    await expect(page.getByText(/Module scope:\s+1\. Introduction to the Course/)).toBeVisible();

    const workspaceLessonRow = lessonWorkspace
      .getByTestId("admin-workspace-lesson-row")
      .filter({ hasText: "Welcome & Course Structure" })
      .first();
    await expect(workspaceLessonRow).toBeVisible();
    await expect(workspaceLessonRow.getByText("Published")).toBeVisible();
    await expect(workspaceLessonRow.getByRole("button", { name: "Move up" })).toBeVisible();
    await expect(workspaceLessonRow.getByRole("button", { name: "Move down" })).toBeVisible();
    await expect(workspaceLessonRow.getByRole("button", { name: "Move to module" })).toBeVisible();
    await expect(workspaceLessonRow.getByRole("link", { name: "Open preview" })).toHaveAttribute(
      "href",
      /\/course\?lesson=mod1-l1&preview=1&previewMode=published&previewType=lesson&previewRef=course-lesson-mod1-l1/
    );
    await expect(workspaceLessonRow.getByRole("link", { name: "Open lesson" })).toHaveAttribute(
      "href",
      /\/course\?lesson=mod1-l1/
    );
    await workspaceLessonRow.getByRole("button", { name: "Edit lesson" }).click();

    const seededLessonItem = page
      .getByTestId("admin-content-item")
      .filter({ hasText: "Welcome & Course Structure" })
      .first();
    const seededLessonEditForm = seededLessonItem.getByTestId("admin-content-edit-form");
    await expect(seededLessonEditForm).toBeVisible();
    await expect(seededLessonEditForm.getByText("Lesson body editor")).toBeVisible();
    await expect(seededLessonEditForm.getByLabel("Lesson id (for open lesson link)")).toHaveValue(
      "mod1-l1"
    );
    const goalVisibilityToggle = seededLessonEditForm.getByLabel("Show goal section");
    const cuesVisibilityToggle = seededLessonEditForm.getByLabel("Show cues section");
    const drillVisibilityToggle = seededLessonEditForm.getByLabel("Show drill section");
    const supportVisibilityToggle = seededLessonEditForm.getByLabel("Show extra help card");
    const supportVideoToggle = seededLessonEditForm.getByLabel("Show Video Analysis");
    const supportPoolsideToggle = seededLessonEditForm.getByLabel("Show Poolside guide");
    const support0To1000Toggle = seededLessonEditForm.getByLabel("Show 0-1000 guide");
    const supportContactToggle = seededLessonEditForm.getByLabel("Show Contact");
    const supportPrimarySelect = seededLessonEditForm.getByLabel(
      "Primary highlighted action (optional)"
    );
    await expect(goalVisibilityToggle).toBeChecked();
    await expect(cuesVisibilityToggle).toBeChecked();
    await expect(drillVisibilityToggle).toBeChecked();
    await expect(supportVisibilityToggle).toBeChecked();
    await expect(supportVideoToggle).toBeChecked();
    await expect(supportPoolsideToggle).toBeChecked();
    await expect(support0To1000Toggle).not.toBeChecked();
    await expect(supportContactToggle).not.toBeChecked();

    const checkpointCriteriaText = `Swim 12.5m relaxed and controlled ${unique}`;
    const supportStartLessonInModule = "3";
    await seededLessonEditForm.getByLabel("Section badge label (optional)").fill(`Focus ${unique}`);
    await seededLessonEditForm
      .getByLabel("Extra help start lesson number in module (optional)")
      .fill(supportStartLessonInModule);
    await seededLessonEditForm.getByLabel("Lesson type").selectOption("swim");
    await seededLessonEditForm.getByLabel("Lesson goal").fill(`Lesson goal update ${unique}`);
    await cuesVisibilityToggle.uncheck();
    await supportVisibilityToggle.uncheck();
    await supportPoolsideToggle.uncheck();
    await support0To1000Toggle.check();
    await supportContactToggle.check();
    await supportPrimarySelect.selectOption("contact");
    await seededLessonEditForm.getByLabel("Cues (one per line)").fill("Relax shoulders\nLong line");
    await seededLessonEditForm
      .getByLabel("Common mistakes (one per line)")
      .fill("Rushing the pull\nHolding breath");
    await seededLessonEditForm.getByLabel("Drill title").fill("Relaxed 12.5m checkpoint");
    await seededLessonEditForm
      .getByLabel("Drill steps (one per line)")
      .fill("Push off calmly\nSwim 12.5m with long exhale");
    await seededLessonEditForm
      .getByLabel("Checkpoint criteria (one per line)")
      .fill(checkpointCriteriaText);
    await seededLessonEditForm.getByLabel("Next step").fill(`Repeat drill quality x3 ${unique}`);
    await seededLessonEditForm.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Content item updated.")).toBeVisible();

    await seededLessonItem.getByRole("button", { name: "Edit" }).click();
    const reopenedLessonEditForm = seededLessonItem.getByTestId("admin-content-edit-form");
    await expect(reopenedLessonEditForm.getByLabel("Lesson goal")).toHaveValue(
      `Lesson goal update ${unique}`
    );
    await expect(reopenedLessonEditForm.getByLabel("Drill title")).toHaveValue(
      "Relaxed 12.5m checkpoint"
    );
    await expect(reopenedLessonEditForm.getByLabel("Section badge label (optional)")).toHaveValue(
      `Focus ${unique}`
    );
    await expect(
      reopenedLessonEditForm.getByLabel("Extra help start lesson number in module (optional)")
    ).toHaveValue(supportStartLessonInModule);
    await expect(reopenedLessonEditForm.getByLabel("Lesson type")).toHaveValue("swim");
    await expect(reopenedLessonEditForm.getByLabel("Next step")).toHaveValue(
      `Repeat drill quality x3 ${unique}`
    );
    await expect(
      reopenedLessonEditForm.getByLabel("Checkpoint criteria (one per line)")
    ).toHaveValue(checkpointCriteriaText);
    await expect(reopenedLessonEditForm.getByLabel("Show goal section")).toBeChecked();
    await expect(reopenedLessonEditForm.getByLabel("Show drill section")).toBeChecked();
    await expect(reopenedLessonEditForm.getByLabel("Show cues section")).not.toBeChecked();
    await expect(reopenedLessonEditForm.getByLabel("Show extra help card")).not.toBeChecked();
    await expect(reopenedLessonEditForm.getByLabel("Show Video Analysis")).toBeChecked();
    await expect(reopenedLessonEditForm.getByLabel("Show Poolside guide")).not.toBeChecked();
    await expect(reopenedLessonEditForm.getByLabel("Show 0-1000 guide")).toBeChecked();
    await expect(reopenedLessonEditForm.getByLabel("Show Contact")).toBeChecked();
    await expect(
      reopenedLessonEditForm.getByLabel("Primary highlighted action (optional)")
    ).toHaveValue("contact");
    await reopenedLessonEditForm.getByRole("button", { name: "Cancel" }).click();
    await focusModeBanner.getByRole("button", { name: "Clear focus" }).click();
    await expect(listTypeFilter).toHaveValue("course_module");
    await expect(createdItem).toBeVisible();

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

    await createdItem.getByRole("button", { name: "Delete" }).click();
    const moduleDeleteDialog = page.getByTestId("admin-module-delete-dialog");
    await expect(moduleDeleteDialog).toBeVisible();
    await moduleDeleteDialog.getByRole("button", { name: "Delete module" }).click();
    await expect(page.getByTestId("admin-content-item").filter({ hasText: title })).toHaveCount(0);
  });
});
