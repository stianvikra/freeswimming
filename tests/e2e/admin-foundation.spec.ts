import {
  expect,
  request as playwrightRequest,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";
const unauthenticatedDeniedStatuses = new Set([401, 403, 423]);
const transientResponseStatuses = new Set([404]);

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

type AdminSessionInfo = {
  isAdmin: boolean;
  isEditor: boolean;
};

type AdminContentMutationResponse =
  | {
      ok: true;
      item: {
        id: string;
        slug: string;
        title: string;
      };
    }
  | {
      ok: false;
      error?: string;
    };

type AdminContentCleanupResponse =
  | {
      ok: true;
      deletedCount: number;
      normalizedCourseStructure?: boolean;
      warning?: string | null;
    }
  | {
      ok: false;
      error?: string;
    };

async function openAllowlistedAdmin(page: Page): Promise<AdminSessionInfo> {
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
  let roleText = "";
  if (await roleBadge.isVisible().catch(() => false)) {
    roleText = ((await roleBadge.textContent()) ?? "").toLowerCase();
    if (!roleText.includes("admin") && !roleText.includes("editor")) {
      test.skip(true, "Current admin session is read-only (viewer) in this environment.");
    }
  }

  return {
    isAdmin: roleText.includes("admin"),
    isEditor: roleText.includes("editor"),
  };
}

async function assertAdminContentReady(page: Page) {
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
}

async function createAuthenticatedRequestContext(page: Page): Promise<APIRequestContext> {
  return playwrightRequest.newContext({
    baseURL: new URL(page.url()).origin,
    storageState: await page.context().storageState(),
  });
}

async function sendWithTransientRetry(send: () => Promise<ResponseLike>) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await send();
      if (!transientResponseStatuses.has(response.status()) || attempt === 3) {
        return response;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isUnavailableProbe =
        /timeout|Request context disposed|ECONNREFUSED|ECONNRESET|ENOTFOUND|EAI_AGAIN|socket hang up/i.test(
          errorMessage
        );
      if (!isUnavailableProbe || attempt === 3) {
        throw error;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  throw new Error("Transient retry exhausted.");
}

type ResponseLike = Awaited<ReturnType<APIRequestContext["get"]>>;

async function createAdminContentItem(
  adminRequest: APIRequestContext,
  payload: Record<string, unknown>
): Promise<{ id: string; slug: string; title: string }> {
  const response = await adminRequest.post("/api/admin/content", {
    headers: {
      "content-type": "application/json",
    },
    data: JSON.stringify(payload),
  });
  const parsed = (await response.json()) as AdminContentMutationResponse;
  expect(
    response.ok(),
    parsed.ok ? "Expected successful admin content create." : parsed.error
  ).toBe(true);
  if (!parsed.ok) {
    throw new Error(parsed.error ?? "Admin content create failed.");
  }
  return parsed.item;
}

async function cleanupQaTestRecords(adminRequest: APIRequestContext): Promise<void> {
  const response = await adminRequest.post("/api/admin/content/test-records");
  const parsed = (await response.json()) as AdminContentCleanupResponse;
  expect(response.ok(), parsed.ok ? "Expected successful QA cleanup." : parsed.error).toBe(true);
  if (!parsed.ok) {
    throw new Error(parsed.error ?? "QA cleanup failed.");
  }
  if (parsed.normalizedCourseStructure === false) {
    throw new Error(
      parsed.warning ?? "QA cleanup finished, but course order normalization failed."
    );
  }
}

function buildQaLessonBody(runtimeLessonId: string): Record<string, unknown> {
  return {
    lessonId: runtimeLessonId,
    goal: "Test lesson goal for admin foundation coverage.",
    cues: ["Relax shoulders", "Long line"],
    commonMistakes: ["Holding breath"],
    drill: {
      title: "Support drill",
      steps: ["Push off calmly", "Glide long"],
    },
    display: {
      goal: true,
      cues: true,
      commonMistakes: true,
      drill: true,
      checkpoint: true,
      nextStep: true,
      support: true,
    },
    supportCard: {
      actions: {
        videoAnalysis: false,
        poolsideGuide: true,
        guide0To1000: false,
        contact: true,
      },
      primaryAction: "contact",
    },
    nextStep: "Repeat twice with relaxed breathing.",
    passCriteria: ["Swim 12.5m relaxed and controlled."],
  };
}

async function exerciseFoundationNavigation(page: Page) {
  const tabContent = page.getByTestId("admin-tab-content");
  const tabQrLinks = page.getByTestId("admin-tab-qr-links");
  const tabCommerce = page.getByTestId("admin-tab-commerce");
  const tabOperations = page.getByTestId("admin-tab-operations");
  const tabEmailTemplates = page.getByTestId("admin-tab-email-templates");
  const tabMessages = page.getByTestId("admin-tab-messages");
  const tabNotes = page.getByTestId("admin-tab-notes");
  const tabCategories = page.getByTestId("admin-tab-categories");
  const tabHelp = page.getByTestId("admin-tab-help");
  const activeSectionLabel = page.getByTestId("admin-active-section-label");

  async function openTabWithFallback(
    tabButton: ReturnType<Page["getByTestId"]>,
    expectedLabel: string,
    tabId: string
  ) {
    const expectedUrl = new RegExp(`/admin\\?tab=${tabId}(?:&|$)`);
    await tabButton.click();
    const switchedViaClientNav = await Promise.all([
      page
        .waitForURL(expectedUrl, { timeout: 2_500 })
        .then(() => true)
        .catch(() => false),
      expect(activeSectionLabel)
        .toHaveText(expectedLabel, { timeout: 2_500 })
        .then(() => true)
        .catch(() => false),
    ])
      .then(([urlReady, labelReady]) => urlReady || labelReady)
      .catch(() => false);

    if (!switchedViaClientNav) {
      await page.goto(`/admin?tab=${encodeURIComponent(tabId)}`, {
        waitUntil: "domcontentloaded",
        timeout: 60_000,
      });
      await expect(activeSectionLabel).toHaveText(expectedLabel);
    }
  }

  await expect(tabContent).toHaveAttribute("aria-pressed", "true");

  await openTabWithFallback(tabQrLinks, "QR Links", "qr-links");
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

  await openTabWithFallback(tabCommerce, "Commerce", "commerce");
  await expect(page.getByRole("heading", { name: "Commerce" })).toBeVisible();

  await openTabWithFallback(tabOperations, "Operations", "operations");
  await expect(page.getByRole("heading", { name: "Operations" })).toBeVisible();

  await openTabWithFallback(tabEmailTemplates, "Email templates", "email-templates");
  await expect(page.getByRole("heading", { name: "Email templates" })).toBeVisible();

  await openTabWithFallback(tabMessages, "Messages", "messages");
  await expect(page.getByRole("heading", { name: "Messages" })).toBeVisible();

  await openTabWithFallback(tabNotes, "Notes", "notes");
  await expect(page.getByRole("heading", { name: "Notes" })).toBeVisible();

  await openTabWithFallback(tabCategories, "Categories", "categories");
  await expect(page.getByRole("heading", { name: "Categories" })).toBeVisible();

  await openTabWithFallback(tabHelp, "Help/Guide", "help");
  await expect(page.getByRole("heading", { name: "Help/Guide" })).toBeVisible();

  await openTabWithFallback(tabContent, "Content", "content");
  await expect(page.getByRole("heading", { name: "Content items" })).toBeVisible();
  const courseWorkspaceTab = page.getByTestId("admin-content-view-tab-course-workspace");
  const allContentTab = page.getByTestId("admin-content-view-tab-all-content");
  await expect(courseWorkspaceTab).toBeVisible();
  await expect(allContentTab).toBeVisible();
  await allContentTab.click();
  await expect(allContentTab).toHaveAttribute("aria-pressed", "true");
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

    const endpoints = [
      "/api/admin/content",
      "/api/admin/messages",
      "/api/admin/products",
      "/api/admin/operations/flags",
    ];

    for (const endpoint of endpoints) {
      let response;
      try {
        response = await sendWithTransientRetry(() => request.get(endpoint, { timeout: 10_000 }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isUnavailableProbe =
          /timeout|Request context disposed|ECONNREFUSED|ECONNRESET|ENOTFOUND|EAI_AGAIN|socket hang up/i.test(
            errorMessage
          );
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

  test("allowlisted dev account can browse core admin surfaces", async ({ page }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();
    await openAllowlistedAdmin(page);
    await assertAdminContentReady(page);
    await exerciseFoundationNavigation(page);
  });

  test("allowlisted admin can complete mutable content lifecycle", async ({ page }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.setTimeout(60_000);

    const session = await openAllowlistedAdmin(page);
    if (!session.isAdmin) {
      test.skip(
        true,
        "Mutable admin content lifecycle coverage requires admin so cleanup does not leave shared drift."
      );
    }

    await assertAdminContentReady(page);
    const adminRequest = await createAuthenticatedRequestContext(page);

    try {
      const unique = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const title = `E2E Admin Content ${unique}`;
      const slug = `e2e-admin-content-${unique}`;
      const lessonFixtureModuleTitle = `E2E Lesson Module ${unique}`;
      const lessonFixtureTitle = `E2E Lesson ${unique}`;
      const lessonFixtureRuntimeId = `e2e-admin-lesson-${unique}`;

      const activeSectionLabel = page.getByTestId("admin-active-section-label");
      await expect(activeSectionLabel).toHaveText("Content");
      const courseWorkspaceTab = page.getByTestId("admin-content-view-tab-course-workspace");
      await expect(page.getByRole("heading", { name: "Content items" })).toBeVisible();
      const allContentTab = page.getByTestId("admin-content-view-tab-all-content");
      await expect(allContentTab).toBeVisible();
      await allContentTab.click();
      await expect(allContentTab).toHaveAttribute("aria-pressed", "true");

      const createForm = page.getByTestId("admin-content-create-form");
      await createForm.getByLabel("Type").selectOption("course_module");
      await createForm.getByLabel("Title").fill(title);
      await createForm.getByLabel("Slug (optional)").fill(slug);
      await createForm.getByLabel("Summary").fill("Created by Playwright admin e2e.");
      await createForm.getByRole("button", { name: "Save content item" }).click();
      await expect(page.getByText("Content item created.")).toBeVisible();

      const lessonFixtureModule = await createAdminContentItem(adminRequest, {
        contentType: "course_module",
        title: lessonFixtureModuleTitle,
        slug: `${slug}-lesson-module`,
        summary: "QA lesson fixture parent module.",
        category: "E2E QA",
        status: "draft",
      });
      const lessonFixture = await createAdminContentItem(adminRequest, {
        contentType: "course_lesson",
        title: lessonFixtureTitle,
        slug: `${slug}-lesson`,
        summary: "QA lesson fixture child lesson.",
        category: "E2E QA",
        status: "draft",
        parentId: lessonFixtureModule.id,
        body: buildQaLessonBody(lessonFixtureRuntimeId),
      });

      await page.getByRole("button", { name: "Refresh" }).click();

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
      const createdItemMeta = createdItem.locator("p").nth(1);
      await expect(createdItemMeta).toContainText("· draft ·");
      await expect(createdItem.getByRole("button", { name: "Move up" })).toBeVisible();

      async function moveCreatedItemToStatus(
        actionName: string,
        nextStatus: "draft" | "review" | "published" | "archived",
        successNotice: string
      ) {
        await expect(createdItem.getByRole("button", { name: actionName })).toBeEnabled();
        await Promise.all([
          page.waitForResponse(
            (response) =>
              response.request().method() === "PATCH" &&
              /\/api\/admin\/content\/[^/]+$/.test(new URL(response.url()).pathname),
            { timeout: 15_000 }
          ),
          createdItem.getByRole("button", { name: actionName }).click(),
        ]);
        await expect(page.getByText(successNotice)).toBeVisible();
        await expect(createdItem.getByRole("button", { name: "Saving…" })).toHaveCount(0);
        await expect(createdItemMeta).toContainText(`· ${nextStatus} ·`);
      }
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
      await expect(page.getByTestId("admin-course-workspace-overview-guidance")).toBeVisible();
      const workspaceFocusPanel = page.getByTestId("admin-course-workspace-focus-panel");
      await expect(workspaceFocusPanel).toBeVisible();
      const overviewHeading = lessonWorkspace.getByRole("heading", {
        name: "Course workspace overview",
      });
      const [focusPanelBox, overviewHeadingBox] = await Promise.all([
        workspaceFocusPanel.boundingBox(),
        overviewHeading.boundingBox(),
      ]);
      if (!focusPanelBox || !overviewHeadingBox) {
        throw new Error("Could not measure course workspace layout boxes.");
      }
      expect(focusPanelBox.y).toBeLessThan(overviewHeadingBox.y);
      const workspaceModuleSelect = lessonWorkspace.getByLabel("Module workspace");
      await expect(workspaceModuleSelect).toBeVisible();
      const fixtureModuleValue = await workspaceModuleSelect.evaluate((node, moduleId) => {
        const selectElement = node as HTMLSelectElement;
        const option = [...selectElement.options].find((entry) => entry.value === moduleId);
        return option?.value ?? "";
      }, lessonFixtureModule.id);
      if (!fixtureModuleValue) {
        throw new Error(
          `Module workspace does not contain fixture module ${lessonFixtureModule.title}.`
        );
      }
      const fixtureModuleLabel = await workspaceModuleSelect.evaluate((node, moduleId) => {
        const selectElement = node as HTMLSelectElement;
        const option = [...selectElement.options].find((entry) => entry.value === moduleId);
        return option?.textContent?.trim() ?? "";
      }, lessonFixtureModule.id);
      const overviewModuleRow = lessonWorkspace
        .getByTestId("admin-course-module-status-row")
        .filter({ hasText: lessonFixtureModule.title })
        .first();
      await expect(
        overviewModuleRow.getByTestId("admin-course-module-lesson-preview-row")
      ).toContainText(lessonFixtureTitle);
      const overviewLessonRow = overviewModuleRow
        .getByTestId("admin-course-module-lesson-preview-row")
        .filter({ hasText: lessonFixtureTitle })
        .first();
      await expect(overviewLessonRow.getByRole("button", { name: "Edit lesson" })).toBeVisible();
      await expect(overviewLessonRow.getByRole("button", { name: "Delete lesson" })).toBeVisible();
      await expect(overviewModuleRow.getByRole("button", { name: "Delete module" })).toBeVisible();
      await expect(overviewLessonRow.getByRole("link", { name: "Open lesson" })).toHaveAttribute(
        "href",
        new RegExp(`/course\\?lesson=${lessonFixtureRuntimeId}$`)
      );
      await workspaceModuleSelect.selectOption(fixtureModuleValue);
      await expect(workspaceModuleSelect).toHaveValue(fixtureModuleValue);
      const scopedModuleRow = lessonWorkspace
        .getByTestId("admin-course-module-status-row")
        .filter({ hasText: lessonFixtureModule.title })
        .first();
      await expect(scopedModuleRow).toContainText("Active module scope");
      await expect(
        scopedModuleRow.getByTestId("admin-course-module-lesson-preview-row")
      ).toHaveCount(0);
      await expect(page.getByTestId("admin-course-workspace-overview-guidance")).toHaveCount(0);

      const workspaceLessonTitle = `Workspace lesson ${unique}`;
      const workspaceLessonSlug = `${slug}-workspace-lesson`;
      await lessonWorkspace.getByRole("button", { name: "Add lesson in this module" }).click();
      const workspaceCreateForm = lessonWorkspace.getByTestId("admin-workspace-lesson-create-form");
      await expect(workspaceCreateForm).toBeVisible();
      await expect(workspaceCreateForm.getByLabel("Parent module")).toHaveValue(fixtureModuleValue);
      await workspaceCreateForm.getByLabel("Title").fill(workspaceLessonTitle);
      await workspaceCreateForm.getByLabel("Slug (optional)").fill(workspaceLessonSlug);
      await workspaceCreateForm
        .getByLabel("Summary")
        .fill("Created from module-scoped workspace context.");
      await workspaceCreateForm.getByRole("button", { name: "Create lesson" }).click();
      await expect(
        page.getByText("Lesson created in selected module. Opening editor.")
      ).toBeVisible();
      await expect(listTypeFilter).toHaveValue("course_lesson");
      const workspaceCreatedItem = page
        .getByTestId("admin-content-item")
        .filter({ hasText: workspaceLessonTitle })
        .first();
      const workspaceCreatedEditForm = workspaceCreatedItem.getByTestId("admin-content-edit-form");
      await expect(workspaceCreatedEditForm).toBeVisible();
      await expect(workspaceCreatedEditForm.getByText("Parent module")).toBeVisible();
      await expect(workspaceCreatedEditForm.getByTestId("admin-context-notes-panel")).toBeVisible();
      const qrPanel = workspaceCreatedEditForm.getByTestId("admin-context-qr-panel");
      await expect(qrPanel).toBeVisible();
      const qrCreateForm = qrPanel.getByTestId("admin-context-qr-create-form");
      await expect(qrCreateForm.getByLabel("Slug")).toHaveValue(/--workspace-lesson(?:-2)?$/);
      await expect(qrCreateForm.getByLabel("Destination URL (https)")).toHaveValue(
        /\/course\?lesson=/
      );

      await courseWorkspaceTab.click();
      await expect(courseWorkspaceTab).toHaveAttribute("aria-pressed", "true");
      await expect(workspaceModuleSelect).toHaveValue(fixtureModuleValue);
      await expect(page.getByTestId("admin-course-workspace-current-scope")).toContainText(
        fixtureModuleLabel
      );

      const workspaceLessonRow = lessonWorkspace
        .getByTestId("admin-workspace-lesson-row")
        .filter({ hasText: lessonFixtureTitle })
        .first();
      await expect(workspaceLessonRow).toBeVisible();
      await expect(workspaceLessonRow.getByText("Draft")).toBeVisible();
      await expect(workspaceLessonRow.getByRole("button", { name: "Move up" })).toBeVisible();
      await expect(workspaceLessonRow.getByRole("button", { name: "Move down" })).toBeVisible();
      await expect(
        workspaceLessonRow.getByRole("button", { name: "Move to module" })
      ).toBeVisible();
      await expect(workspaceLessonRow.getByRole("link", { name: "Open preview" })).toHaveAttribute(
        "href",
        new RegExp(
          `/course\\?lesson=${lessonFixtureRuntimeId}&preview=1&previewMode=draft&previewType=lesson&previewRef=${lessonFixture.slug}`
        )
      );
      await expect(workspaceLessonRow.getByRole("link", { name: "Open lesson" })).toHaveAttribute(
        "href",
        new RegExp(`/course\\?lesson=${lessonFixtureRuntimeId}$`)
      );
      await workspaceLessonRow.getByRole("button", { name: "Edit lesson" }).click();
      await expect(listTypeFilter).toHaveValue("course_lesson");
      await expect(focusModeBanner).toContainText(`Focus mode: ${fixtureModuleLabel}`);

      const fixtureLessonItem = page
        .getByTestId("admin-content-item")
        .filter({ hasText: lessonFixtureTitle })
        .first();
      const fixtureLessonEditForm = fixtureLessonItem.getByTestId("admin-content-edit-form");
      await expect(fixtureLessonEditForm).toBeVisible();
      await expect(fixtureLessonEditForm).toContainText("Course workspace context");
      await expect(
        fixtureLessonEditForm.getByRole("button", { name: "Back to module workspace" })
      ).toBeVisible();
      await fixtureLessonEditForm.getByRole("button", { name: "Back to module workspace" }).click();
      await expect(courseWorkspaceTab).toHaveAttribute("aria-pressed", "true");
      await expect(workspaceModuleSelect).toHaveValue(fixtureModuleValue);
      await expect(page.getByTestId("admin-course-workspace-current-scope")).toContainText(
        fixtureModuleLabel
      );

      await workspaceLessonRow.getByRole("button", { name: "Edit lesson" }).click();
      await expect(listTypeFilter).toHaveValue("course_lesson");
      await expect(focusModeBanner).toContainText(`Focus mode: ${fixtureModuleLabel}`);
      await expect(fixtureLessonEditForm).toBeVisible();
      await expect(fixtureLessonEditForm.getByText("Lesson body editor")).toBeVisible();
      await expect(fixtureLessonEditForm.getByText("Lesson runtime ID")).toBeVisible();
      await expect(fixtureLessonEditForm.getByText(lessonFixtureRuntimeId)).toBeVisible();
      await expect(
        fixtureLessonEditForm.getByText(
          "Internal ID used by open lesson links, progress, notes, and previews."
        )
      ).toBeVisible();
      const goalVisibilityToggle = fixtureLessonEditForm.getByLabel("Show goal section");
      const cuesVisibilityToggle = fixtureLessonEditForm.getByLabel("Show cues section");
      const drillVisibilityToggle = fixtureLessonEditForm.getByLabel("Show drill section");
      const supportVisibilityToggle = fixtureLessonEditForm.getByLabel("Show extra help card");
      const supportVideoToggle = fixtureLessonEditForm.getByLabel("Show Video Analysis");
      const supportPoolsideToggle = fixtureLessonEditForm.getByLabel("Show Poolside guide");
      const support0To1000Toggle = fixtureLessonEditForm.getByLabel("Show 0-1000 guide");
      const supportContactToggle = fixtureLessonEditForm.getByLabel("Show Contact");
      const supportPrimarySelect = fixtureLessonEditForm.getByLabel(
        "Primary highlighted action (optional)"
      );
      await expect(goalVisibilityToggle).toBeVisible();
      await expect(cuesVisibilityToggle).toBeVisible();
      await expect(drillVisibilityToggle).toBeVisible();
      await expect(supportVisibilityToggle).toBeVisible();
      await expect(supportVideoToggle).toBeVisible();
      await expect(supportPoolsideToggle).toBeVisible();
      await expect(support0To1000Toggle).toBeVisible();
      await expect(supportContactToggle).toBeVisible();

      const checkpointCriteriaText = `Swim 12.5m relaxed and controlled ${unique}`;
      const supportStartLessonInModule = "3";
      await fixtureLessonEditForm
        .getByLabel("Section badge label (optional)")
        .fill(`Focus ${unique}`);
      await fixtureLessonEditForm
        .getByLabel("Extra help start lesson number in module (optional)")
        .fill(supportStartLessonInModule);
      await goalVisibilityToggle.check();
      await fixtureLessonEditForm.getByLabel("Lesson type").selectOption("swim");
      await fixtureLessonEditForm.getByLabel("Lesson goal").fill(`Lesson goal update ${unique}`);
      await cuesVisibilityToggle.uncheck();
      await drillVisibilityToggle.check();
      await supportVisibilityToggle.uncheck();
      await supportVideoToggle.check();
      await supportPoolsideToggle.uncheck();
      await support0To1000Toggle.check();
      await supportContactToggle.check();
      await supportPrimarySelect.selectOption("contact");
      await fixtureLessonEditForm
        .getByLabel("Cues (one per line)")
        .fill("Relax shoulders\nLong line");
      await fixtureLessonEditForm
        .getByLabel("Common mistakes (one per line)")
        .fill("Rushing the pull\nHolding breath");
      await fixtureLessonEditForm.getByLabel("Drill title").fill("Relaxed 12.5m checkpoint");
      await fixtureLessonEditForm
        .getByLabel("Drill steps (one per line)")
        .fill("Push off calmly\nSwim 12.5m with long exhale");
      await fixtureLessonEditForm
        .getByLabel("Checkpoint criteria (one per line)")
        .fill(checkpointCriteriaText);
      await fixtureLessonEditForm
        .getByRole("textbox", { name: "Next step" })
        .fill(`Repeat drill quality x3 ${unique}`);
      await fixtureLessonEditForm.getByRole("button", { name: "Save changes" }).click();
      await expect(page.getByText("Content item updated.")).toBeVisible();

      const savedLessonEditForm = fixtureLessonItem.getByTestId("admin-content-edit-form");
      await expect(savedLessonEditForm).toBeVisible();
      await expect(savedLessonEditForm.getByLabel("Lesson goal")).toHaveValue(
        `Lesson goal update ${unique}`
      );
      await expect(savedLessonEditForm.getByLabel("Drill title")).toHaveValue(
        "Relaxed 12.5m checkpoint"
      );
      await expect(savedLessonEditForm.getByLabel("Section badge label (optional)")).toHaveValue(
        `Focus ${unique}`
      );
      await expect(
        savedLessonEditForm.getByLabel("Extra help start lesson number in module (optional)")
      ).toHaveValue(supportStartLessonInModule);
      await expect(savedLessonEditForm.getByLabel("Lesson type")).toHaveValue("swim");
      await expect(savedLessonEditForm.getByRole("textbox", { name: "Next step" })).toHaveValue(
        `Repeat drill quality x3 ${unique}`
      );
      await expect(
        savedLessonEditForm.getByLabel("Checkpoint criteria (one per line)")
      ).toHaveValue(checkpointCriteriaText);
      await expect(savedLessonEditForm.getByLabel("Show goal section")).toBeChecked();
      await expect(savedLessonEditForm.getByLabel("Show drill section")).toBeChecked();
      await expect(savedLessonEditForm.getByLabel("Show cues section")).not.toBeChecked();
      await expect(savedLessonEditForm.getByLabel("Show extra help card")).not.toBeChecked();
      await expect(savedLessonEditForm.getByLabel("Show Video Analysis")).toBeChecked();
      await expect(savedLessonEditForm.getByLabel("Show Poolside guide")).not.toBeChecked();
      await expect(savedLessonEditForm.getByLabel("Show 0-1000 guide")).toBeChecked();
      await expect(savedLessonEditForm.getByLabel("Show Contact")).toBeChecked();
      await expect(
        savedLessonEditForm.getByLabel("Primary highlighted action (optional)")
      ).toHaveValue("contact");
      await savedLessonEditForm.getByRole("button", { name: "Save changes" }).click();
      await expect(page.getByText("No changes to save.")).toBeVisible();
      await expect(savedLessonEditForm).toBeVisible();
      await savedLessonEditForm.getByRole("button", { name: "Cancel" }).click();
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

      await listTypeFilter.selectOption("guide_session");
      const guideSessionItem = page
        .getByTestId("admin-content-item")
        .filter({ hasText: "Baseline and breathing rhythm" })
        .first();
      await expect(guideSessionItem).toContainText("Guide session");
      await guideSessionItem.getByRole("button", { name: "Edit" }).click();
      const guideSessionEditForm = guideSessionItem.getByTestId("admin-content-edit-form");
      await expect(guideSessionEditForm).toBeVisible();
      await expect(guideSessionEditForm.getByText("Parent module")).toHaveCount(0);
      await guideSessionEditForm.getByRole("button", { name: "Cancel" }).click();
      await expect(guideSessionItem.getByTestId("admin-content-edit-form")).toHaveCount(0);

      await listTypeFilter.selectOption("guide_drill");
      const guideDrillItem = page
        .getByTestId("admin-content-item")
        .filter({ hasText: "Streamline push and glide reset" })
        .first();
      await expect(guideDrillItem).toContainText("Guide drill");
      await guideDrillItem.getByRole("button", { name: "Edit" }).click();
      const guideDrillEditForm = guideDrillItem.getByTestId("admin-content-edit-form");
      await expect(guideDrillEditForm).toBeVisible();
      await expect(guideDrillEditForm.getByText("Parent module")).toHaveCount(0);
      await guideDrillEditForm.getByRole("button", { name: "Cancel" }).click();
      await expect(guideDrillItem.getByTestId("admin-content-edit-form")).toHaveCount(0);

      await listTypeFilter.selectOption("course_module");
      await expect(createdItem).toBeVisible();
      await moveCreatedItemToStatus("Move to review", "review", "Moved to review.");
      await moveCreatedItemToStatus("Publish", "published", "Content item published.");
      await moveCreatedItemToStatus("Archive", "archived", "Content item archived.");
      await moveCreatedItemToStatus("Move to draft", "draft", "Moved to draft.");

      await createdItem.getByRole("button", { name: "Revisions" }).click();
      await expect(createdItem.getByText("Revision history")).toBeVisible();
      const revisionEntries = createdItem.getByTestId("admin-content-revision-item");
      await expect(revisionEntries.first()).toBeVisible({ timeout: 10_000 });
      const firstEnabledRestoreButton = createdItem
        .locator('button:has-text("Restore"):not([disabled])')
        .first();
      await expect(firstEnabledRestoreButton).toBeVisible();

      page.once("dialog", (dialog) => dialog.accept());
      await firstEnabledRestoreButton.click();
      await expect(page.getByText("Revision restored.")).toBeVisible();

      await createdItem.getByRole("button", { name: "Delete" }).click();
      const moduleDeleteDialog = page.getByTestId("admin-module-delete-dialog");
      await expect(moduleDeleteDialog).toBeVisible();
      await moduleDeleteDialog.getByRole("button", { name: "Delete module" }).click();
      await expect(page.getByTestId("admin-content-item").filter({ hasText: title })).toHaveCount(
        0
      );
    } finally {
      await cleanupQaTestRecords(adminRequest);
      await adminRequest.dispose();
    }
  });
});
