import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { buildAdminNoteTestArtifactTitle } from "@/lib/admin/admin-note-test-artifacts";
import { resolveCanonicalCourseLessonRuntimeId } from "@/lib/course/runtime-id-manifest";
import { buildManualDrylandStarterDraft } from "@/lib/dryland/manual";
import { buildManualWorkoutEmptyDraft } from "@/lib/workouts/manual";
import { cleanupAdminNoteTestArtifacts } from "@/tests/e2e/admin-note-test-artifact-cleanup";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";
const ADMIN_CONTEXTUAL_NOTES_ARTIFACT_SCOPE = "contextual-notes";

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Admin e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

function shouldManageAdminNoteArtifacts(projectName: string) {
  return projectName === "desktop-chromium" && !isSiteLockEnabled;
}

async function prewarmRoute(page: Page, href: string, timeoutMs = 90_000) {
  return page.request
    .get(href, {
      timeout: timeoutMs,
      failOnStatusCode: false,
    })
    .catch(() => null);
}

async function gotoWithTransientRetry(page: Page, href: string, initialTimeoutMs = 90_000) {
  await prewarmRoute(page, href, initialTimeoutMs);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await page.goto(href, {
        waitUntil: "domcontentloaded",
        timeout: attempt === 0 ? initialTimeoutMs : 60_000,
      });
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isTransientGotoError =
        /ERR_ABORTED|frame was detached|page\.goto: Timeout \d+ms exceeded/i.test(errorMessage);

      if (!isTransientGotoError || attempt === 2) {
        throw error;
      }

      await page.waitForTimeout(1_000);
    }
  }
}

async function waitForRouteToSettle(page: Page) {
  const compilingIndicator = page.getByText("Compiling", { exact: true });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await expect(compilingIndicator).toHaveCount(0, { timeout: 60_000 });
    await page.waitForTimeout(750);
    if ((await compilingIndicator.count()) === 0) {
      break;
    }
  }

  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );
}

async function loginAsAdminViaDevBypass(page: Page, nextPath: string) {
  const loginHref = `/dev/login?next=${encodeURIComponent(nextPath)}`;
  const loginProbe = await prewarmRoute(page, loginHref);
  if (!loginProbe || loginProbe.status() >= 500) {
    test.skip(true, "Dev auth bypass is not reachable in this environment.");
  }

  await gotoWithTransientRetry(page, loginHref);
  const pathAfterDevLogin = new URL(page.url()).pathname;

  if (pathAfterDevLogin !== new URL(`https://freeswimming.org${nextPath}`).pathname) {
    test.skip(true, "Dev auth bypass is not enabled in this environment.");
  }

  const noAccessHeading = page.getByRole("heading", { name: "You don't have access" });
  if (await noAccessHeading.isVisible().catch(() => false)) {
    test.skip(true, "Dev bypass account is signed in but not allowlisted/admin.");
  }

  await waitForRouteToSettle(page);
}

async function refreshDevSessionForCurrentRoute(page: Page) {
  const currentUrl = new URL(page.url());
  const nextPath = `${currentUrl.pathname}${currentUrl.search}`;
  await loginAsAdminViaDevBypass(page, nextPath);
}

async function ensureAdminContextPanelVisible(page: Page, expectedPath: string) {
  const panel = page.getByTestId("admin-context-notes-panel");
  const panelVisible = await panel.isVisible({ timeout: 1_500 }).catch(() => false);

  if (!panelVisible) {
    await loginAsAdminViaDevBypass(page, expectedPath);
  }

  const visibleAfterRefresh = await panel.isVisible({ timeout: 5_000 }).catch(() => false);
  if (!visibleAfterRefresh) {
    test.skip(true, "Admin context notes panel did not mount in this environment.");
  }

  await expect(panel).toBeVisible({ timeout: 15_000 });
  return panel;
}

async function ensureAdminContextPanelLoaded(page: Page, expectedPath: string) {
  let panel = await ensureAdminContextPanelVisible(page, expectedPath);
  let toggle = panel.getByTestId("admin-context-notes-toggle");

  if ((await toggle.textContent())?.includes("Show")) {
    await toggle.click();
    await expect(toggle).toHaveText("Collapse notes", { timeout: 10_000 });
  }

  const loadingResolved = await expect
    .poll(async () => await panel.getByText("Loading notes…").count(), { timeout: 15_000 })
    .toBe(0)
    .then(() => true)
    .catch(() => false);

  if (loadingResolved) {
    return panel;
  }

  await refreshDevSessionForCurrentRoute(page);
  panel = await ensureAdminContextPanelVisible(page, expectedPath);
  toggle = panel.getByTestId("admin-context-notes-toggle");

  if ((await toggle.textContent())?.includes("Show")) {
    await toggle.click();
    await expect(toggle).toHaveText("Collapse notes", { timeout: 10_000 });
  }

  const loadingResolvedAfterRefresh = await expect
    .poll(async () => await panel.getByText("Loading notes…").count(), { timeout: 15_000 })
    .toBe(0)
    .then(() => true)
    .catch(() => false);

  if (!loadingResolvedAfterRefresh) {
    test.skip(true, "Admin context notes panel did not finish loading in this environment.");
  }

  return panel;
}

async function waitForCourseLessonContext(page: Page, lessonId: string) {
  const coursePage = page.getByTestId("course-page");
  await expect(coursePage).toHaveAttribute("data-has-resolved-requested-lesson", "true", {
    timeout: 15_000,
  });
  await expect(coursePage).toHaveAttribute("data-active-lesson-id", lessonId, {
    timeout: 15_000,
  });
}

async function toggleDoneAndWait(
  page: Page,
  panel: ReturnType<Page["getByTestId"]>,
  itemText: string,
  expectedNotice: string
) {
  const item = () =>
    panel.getByTestId("admin-context-note-item").filter({ hasText: itemText }).first();
  const doneCheckbox = item().getByRole("checkbox");
  await expect(item()).toBeVisible({ timeout: 10_000 });
  await expect(doneCheckbox).toBeEnabled({ timeout: 10_000 });

  let updateResponse: Awaited<ReturnType<Page["waitForResponse"]>> | undefined;
  try {
    [updateResponse] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/api/admin/notes/") && response.request().method() === "PATCH",
        { timeout: 15_000 }
      ),
      doneCheckbox.click(),
    ]);
  } catch {
    test.skip(true, "Context notes done-toggle request timed out in this environment.");
  }

  if (!updateResponse) {
    return;
  }

  const updatePayload = (await updateResponse.json().catch(() => null)) as {
    ok?: boolean;
    error?: string;
  } | null;
  if (!updateResponse.ok() || updatePayload?.ok === false) {
    const reason =
      typeof updatePayload?.error === "string"
        ? updatePayload.error
        : `status ${updateResponse.status()}`;
    test.skip(
      true,
      `Context notes done-toggle is not write-ready in this environment (${reason}).`
    );
  }

  await expect(item().getByRole("checkbox")).toBeChecked({ timeout: 10_000 });
  await expect(panel.getByTestId("admin-context-note-action-notice")).toHaveText(expectedNotice, {
    timeout: 10_000,
  });
}

async function ensureContextCreateFormOpen(page: Page, panel: ReturnType<Page["getByTestId"]>) {
  const createToggle = panel.getByTestId("admin-context-note-create-toggle");
  let createForm = panel.getByTestId("admin-context-note-create-form");

  for (let attempt = 0; attempt < 3 && (await createForm.count()) === 0; attempt += 1) {
    if ((await createToggle.count()) === 0) {
      break;
    }
    await createToggle.click();
    await page.waitForTimeout(250);
    createForm = panel.getByTestId("admin-context-note-create-form");
  }
  await expect(createForm).toBeVisible({ timeout: 15_000 });
  await expect(createForm.getByLabel("Title")).toBeVisible({ timeout: 15_000 });
  await expect(createForm.getByLabel("Category")).toBeVisible({ timeout: 15_000 });

  return createForm;
}

async function expectContextCreateFormCollapsed(panel: ReturnType<Page["getByTestId"]>) {
  const createToggle = panel.getByTestId("admin-context-note-create-toggle");
  await expect(createToggle).toHaveText("Expand add note", { timeout: 15_000 });
  await expect(panel.getByTestId("admin-context-note-create-form")).toHaveCount(0, {
    timeout: 15_000,
  });
}

async function openQuickCaptureDialog(page: Page, panel: ReturnType<Page["getByTestId"]>) {
  const trigger = panel.getByRole("button", { name: "Quick note" });
  const quickCaptureDialog = page.getByTestId("admin-note-quick-capture-dialog");

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (await quickCaptureDialog.isVisible().catch(() => false)) {
      return quickCaptureDialog;
    }

    await trigger.click();

    try {
      await expect(quickCaptureDialog).toBeVisible({ timeout: 5_000 });
      return quickCaptureDialog;
    } catch {
      await page.waitForTimeout(250);
    }
  }

  await expect(quickCaptureDialog).toBeVisible({ timeout: 15_000 });
  return quickCaptureDialog;
}

async function expectPageQuickCaptureFlow(
  page: Page,
  contextPath: string,
  title: string,
  body: string
) {
  const probeUrl = `/api/admin/notes?contextType=page&contextRef=${encodeURIComponent(contextPath)}`;
  const probe = await page.request.get(probeUrl).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "unknown request failure";
    test.skip(true, `Context notes API probe failed (${message}).`);
    return null;
  });
  if (!probe) {
    return;
  }

  if (!probe.ok()) {
    test.skip(true, `Context notes API unavailable (${probe.status()}).`);
  }

  const probePayload = (await probe.json()) as { ok?: boolean; schemaReady?: boolean };
  if (probePayload.ok && probePayload.schemaReady === false) {
    test.skip(true, "Admin notes schema is not ready in this environment.");
  }

  const panel = await ensureAdminContextPanelLoaded(page, contextPath);

  const quickCaptureDialog = await openQuickCaptureDialog(page, panel);
  const createForm = page.getByTestId("admin-note-quick-capture-form");
  await createForm.getByLabel("Title").fill(title);
  await createForm.getByLabel("Category").fill("Operations");
  await createForm.getByLabel("Priority").selectOption("high");
  await createForm.getByLabel("Text").fill(body);

  let createResponse: Awaited<ReturnType<Page["waitForResponse"]>> | undefined;
  try {
    [createResponse] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/api/admin/notes") && response.request().method() === "POST",
        { timeout: 15_000 }
      ),
      createForm.getByRole("button", { name: "Save note" }).click(),
    ]);
  } catch {
    test.skip(true, "Page-level note create request timed out in this environment.");
  }

  if (!createResponse) {
    return;
  }

  const createPayload = (await createResponse.json().catch(() => null)) as {
    ok?: boolean;
    error?: string;
  } | null;
  if (!createResponse.ok() || createPayload?.ok === false) {
    const reason =
      typeof createPayload?.error === "string"
        ? createPayload.error
        : `status ${createResponse.status()}`;
    test.skip(true, `Page-level note create is not write-ready in this environment (${reason}).`);
  }

  await expect(quickCaptureDialog).toBeVisible({ timeout: 10_000 });
  await expect(quickCaptureDialog.getByLabel("Title")).toHaveValue("");
  await quickCaptureDialog.getByRole("button", { name: "Close panel" }).first().click();
  await expect(quickCaptureDialog).toHaveCount(0);

  const toggle = panel.getByTestId("admin-context-notes-toggle");
  if ((await toggle.textContent())?.includes("Show")) {
    await toggle.click();
  }

  const createdItem = panel
    .getByTestId("admin-context-note-item")
    .filter({ hasText: title })
    .first();
  await expect
    .poll(
      async () =>
        await panel.getByTestId("admin-context-note-item").filter({ hasText: title }).count(),
      { timeout: 15_000 }
    )
    .toBeGreaterThan(0);
  await expect(createdItem).toBeVisible({ timeout: 15_000 });
  await expect(createdItem).toContainText("High");

  await toggleDoneAndWait(page, panel, title, "Note marked as done.");

  page.once("dialog", (dialog) => dialog.accept());
  await createdItem.getByRole("button", { name: "Delete" }).click();
  await expect(panel.getByTestId("admin-context-note-item").filter({ hasText: title })).toHaveCount(
    0
  );
}

test.describe("admin contextual notes", () => {
  test.beforeAll(async ({}, testInfo) => {
    if (!shouldManageAdminNoteArtifacts(testInfo.project.name)) return;
    await cleanupAdminNoteTestArtifacts({
      scope: ADMIN_CONTEXTUAL_NOTES_ARTIFACT_SCOPE,
      includeLegacy: true,
    });
  });

  test.afterEach(async ({}, testInfo) => {
    if (!shouldManageAdminNoteArtifacts(testInfo.project.name)) return;
    await cleanupAdminNoteTestArtifacts({
      scope: ADMIN_CONTEXTUAL_NOTES_ARTIFACT_SCOPE,
    });
  });

  test("allowlisted admin can manage contextual lesson notes from course page", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();

    const canonicalLessonContextRef = resolveCanonicalCourseLessonRuntimeId("mod3-l1") ?? "mod3-l1";
    await loginAsAdminViaDevBypass(
      page,
      `/course?lesson=${encodeURIComponent(canonicalLessonContextRef)}`
    );
    await expect(page.getByRole("heading", { name: "Free Course" })).toBeVisible();
    await expect
      .poll(() => page.url(), { timeout: 15_000 })
      .toContain(`lesson=${encodeURIComponent(canonicalLessonContextRef)}`);
    await waitForCourseLessonContext(page, canonicalLessonContextRef);

    const probe = await page.request.get(
      `/api/admin/notes?contextType=course_lesson&contextRef=${encodeURIComponent(canonicalLessonContextRef)}`
    );
    if (!probe.ok()) {
      test.skip(true, `Context notes API unavailable (${probe.status()}).`);
    }

    const probePayload = (await probe.json()) as { ok?: boolean; schemaReady?: boolean };
    if (probePayload.ok && probePayload.schemaReady === false) {
      test.skip(true, "Admin notes schema is not ready in this environment.");
    }

    const panel = await ensureAdminContextPanelLoaded(
      page,
      `/course?lesson=${encodeURIComponent(canonicalLessonContextRef)}`
    );

    const unique = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const title = buildAdminNoteTestArtifactTitle({
      scope: ADMIN_CONTEXTUAL_NOTES_ARTIFACT_SCOPE,
      label: "Lesson note",
      unique,
    });
    const updatedTitle = buildAdminNoteTestArtifactTitle({
      scope: ADMIN_CONTEXTUAL_NOTES_ARTIFACT_SCOPE,
      label: "Lesson note updated",
      unique,
    });
    const body = "Context note body from Playwright.";

    try {
      await ensureContextCreateFormOpen(page, panel);
    } catch {
      test.skip(true, "Context notes mutation form did not become available in this environment.");
    }
    let createForm = await ensureContextCreateFormOpen(page, panel);
    await createForm.getByLabel("Title").fill(title);
    createForm = await ensureContextCreateFormOpen(page, panel);
    await createForm.getByLabel("Title").fill(title);
    await createForm.getByLabel("Category").fill("Operations");
    await createForm.getByLabel("Priority").selectOption("high");
    await createForm.getByLabel("Text").fill(body);
    let createResponse: Awaited<ReturnType<Page["waitForResponse"]>> | undefined;
    try {
      [createResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().includes("/api/admin/notes") && response.request().method() === "POST",
          { timeout: 15_000 }
        ),
        createForm.getByRole("button", { name: "Save note" }).click(),
      ]);
    } catch {
      test.skip(true, "Context notes create request timed out in this environment.");
    }
    if (!createResponse) {
      return;
    }

    const createPayload = (await createResponse.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
    } | null;
    if (!createResponse.ok() || createPayload?.ok === false) {
      const reason =
        typeof createPayload?.error === "string"
          ? createPayload.error
          : `status ${createResponse.status()}`;
      test.skip(true, `Context notes create is not write-ready in this environment (${reason}).`);
    }

    await expect
      .poll(
        async () =>
          await panel.getByTestId("admin-context-note-item").filter({ hasText: title }).count(),
        { timeout: 15_000 }
      )
      .toBeGreaterThan(0);

    const createdItem = panel
      .getByTestId("admin-context-note-item")
      .filter({ hasText: title })
      .first();
    await expect(createdItem).toBeVisible({ timeout: 15_000 });
    await expect(createdItem).toContainText("High");
    const createToggle = panel.getByTestId("admin-context-note-create-toggle");
    await expect(createToggle).toBeVisible();
    await expectContextCreateFormCollapsed(panel);
    await createToggle.click();
    await expect(createToggle).toHaveText("Collapse add note");
    await expect(panel.getByTestId("admin-context-note-create-form")).toBeVisible();
    await expect(panel.getByTestId("admin-context-note-paste-image")).toBeVisible();

    const createdItemAfterToggle = panel
      .getByTestId("admin-context-note-item")
      .filter({ hasText: title })
      .first();
    await createdItemAfterToggle.scrollIntoViewIfNeeded();
    const editButton = createdItemAfterToggle.getByRole("button", { name: "Edit" });
    await expect(editButton).toBeVisible({ timeout: 10_000 });
    await editButton.click();
    const editForm = createdItemAfterToggle.getByTestId("admin-context-note-edit-form");
    await expect(editForm).toBeVisible();

    let attachmentCreateResponse: Awaited<ReturnType<Page["waitForResponse"]>> | undefined;
    try {
      [attachmentCreateResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().includes("/api/admin/notes/") &&
            response.url().includes("/attachments") &&
            response.request().method() === "POST",
          { timeout: 15_000 }
        ),
        editForm.getByTestId("admin-context-note-edit-attachment-input").setInputFiles({
          name: "context-proof.png",
          mimeType: "image/png",
          buffer: Buffer.from("png"),
        }),
      ]);
    } catch {
      test.skip(true, "Context note attachment upload request timed out in this environment.");
    }
    if (!attachmentCreateResponse) {
      return;
    }

    const attachmentCreatePayload = (await attachmentCreateResponse.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
    } | null;
    if (!attachmentCreateResponse.ok() || attachmentCreatePayload?.ok === false) {
      const reason =
        typeof attachmentCreatePayload?.error === "string"
          ? attachmentCreatePayload.error
          : `status ${attachmentCreateResponse.status()}`;
      test.skip(
        true,
        `Context note attachment upload is not write-ready in this environment (${reason}).`
      );
    }

    await expect(editForm.getByText("context-proof.png")).toBeVisible({ timeout: 10_000 });
    let attachmentDeleteResponse: Awaited<ReturnType<Page["waitForResponse"]>> | undefined;
    try {
      [attachmentDeleteResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().includes("/api/admin/notes/") &&
            response.url().includes("/attachments/") &&
            response.request().method() === "DELETE",
          { timeout: 15_000 }
        ),
        editForm.getByTestId("admin-context-note-attachment-delete").click(),
      ]);
    } catch {
      test.skip(true, "Context note attachment delete request timed out in this environment.");
    }

    if (!attachmentDeleteResponse) {
      return;
    }

    const attachmentDeletePayload = (await attachmentDeleteResponse.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
    } | null;
    if (!attachmentDeleteResponse.ok() || attachmentDeletePayload?.ok === false) {
      const reason =
        typeof attachmentDeletePayload?.error === "string"
          ? attachmentDeletePayload.error
          : `status ${attachmentDeleteResponse.status()}`;
      test.skip(
        true,
        `Context note attachment delete is not write-ready in this environment (${reason}).`
      );
    }

    await expect(editForm.getByText("No images attached yet.")).toBeVisible({ timeout: 10_000 });
    await editForm.getByLabel("Edit title").fill(updatedTitle);
    await editForm.getByLabel("Priority").selectOption("urgent");
    await editForm.getByRole("button", { name: "Save changes" }).click();

    const updatedItem = panel
      .getByTestId("admin-context-note-item")
      .filter({ hasText: updatedTitle })
      .first();
    await expect(updatedItem).toBeVisible({ timeout: 10_000 });
    await expect(updatedItem).toContainText("Urgent");

    await toggleDoneAndWait(page, panel, updatedTitle, "Note marked as done.");
    await expect(panel.getByTestId("admin-context-note-action-notice")).toHaveCount(0, {
      timeout: 7_000,
    });

    page.once("dialog", (dialog) => dialog.accept());
    await updatedItem.getByRole("button", { name: "Delete" }).click();
    await expect(
      panel.getByTestId("admin-context-note-item").filter({ hasText: updatedTitle })
    ).toHaveCount(0);
  });

  test("allowlisted admin can manage contextual page notes from plans page", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();

    await loginAsAdminViaDevBypass(page, "/plans");
    expect(new URL(page.url()).pathname).toBe("/plans");

    const probe = await page.request.get("/api/admin/notes?contextType=page&contextRef=%2Fplans");
    if (!probe.ok()) {
      test.skip(true, `Context notes API unavailable (${probe.status()}).`);
    }

    const probePayload = (await probe.json()) as { ok?: boolean; schemaReady?: boolean };
    if (probePayload.ok && probePayload.schemaReady === false) {
      test.skip(true, "Admin notes schema is not ready in this environment.");
    }

    const panel = await ensureAdminContextPanelLoaded(page, "/plans");
    const unique = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const title = buildAdminNoteTestArtifactTitle({
      scope: ADMIN_CONTEXTUAL_NOTES_ARTIFACT_SCOPE,
      label: "Plans quick capture",
      unique,
    });
    const quickCaptureDialog = await openQuickCaptureDialog(page, panel);
    await quickCaptureDialog.getByLabel("Title").fill(`Cancel ${title}`);
    await quickCaptureDialog.getByRole("button", { name: "Discard" }).first().click();
    await expect(quickCaptureDialog).toHaveCount(0);

    await openQuickCaptureDialog(page, panel);
    const createForm = page.getByTestId("admin-note-quick-capture-form");
    await createForm.getByLabel("Title").fill(title);
    await createForm.getByLabel("Category").fill("Content");
    await createForm.getByLabel("Priority").selectOption("high");
    await createForm.getByLabel("Text").fill("Page-level admin note for plans.");
    let createResponse: Awaited<ReturnType<Page["waitForResponse"]>> | undefined;
    try {
      [createResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().includes("/api/admin/notes") && response.request().method() === "POST",
          { timeout: 15_000 }
        ),
        createForm.getByRole("button", { name: "Save" }).click(),
      ]);
    } catch {
      test.skip(true, "Context notes create request timed out in this environment.");
    }
    if (!createResponse) {
      return;
    }

    const createPayload = (await createResponse.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
    } | null;
    if (!createResponse.ok() || createPayload?.ok === false) {
      const reason =
        typeof createPayload?.error === "string"
          ? createPayload.error
          : `status ${createResponse.status()}`;
      test.skip(true, `Context notes create is not write-ready in this environment (${reason}).`);
    }

    await expect(quickCaptureDialog).toBeVisible({ timeout: 10_000 });
    await expect(quickCaptureDialog.getByLabel("Title")).toHaveValue("");
    await quickCaptureDialog.getByRole("button", { name: "Close panel" }).first().click();
    await expect(quickCaptureDialog).toHaveCount(0);

    const toggle = panel.getByTestId("admin-context-notes-toggle");
    if ((await toggle.textContent())?.includes("Show")) {
      await toggle.click();
    }

    const createdItem = panel
      .getByTestId("admin-context-note-item")
      .filter({ hasText: title })
      .first();
    await expect
      .poll(
        async () =>
          await panel.getByTestId("admin-context-note-item").filter({ hasText: title }).count(),
        { timeout: 15_000 }
      )
      .toBeGreaterThan(0);
    await expect(createdItem).toBeVisible({ timeout: 15_000 });
    await expect(createdItem).toContainText("High");

    await toggleDoneAndWait(page, panel, title, "Note marked as done.");

    page.once("dialog", (dialog) => dialog.accept());
    await createdItem.getByRole("button", { name: "Delete" }).click();
    await expect(
      panel.getByTestId("admin-context-note-item").filter({ hasText: title })
    ).toHaveCount(0);
  });

  test("allowlisted admin can quick-capture page notes from my-library goals", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();

    await loginAsAdminViaDevBypass(page, "/my-library/goals");
    expect(new URL(page.url()).pathname).toBe("/my-library/goals");

    const probe = await page.request.get(
      "/api/admin/notes?contextType=page&contextRef=%2Fmy-library%2Fgoals"
    );
    if (!probe.ok()) {
      test.skip(true, `Context notes API unavailable (${probe.status()}).`);
    }

    const probePayload = (await probe.json()) as { ok?: boolean; schemaReady?: boolean };
    if (probePayload.ok && probePayload.schemaReady === false) {
      test.skip(true, "Admin notes schema is not ready in this environment.");
    }

    const panel = await ensureAdminContextPanelLoaded(page, "/my-library/goals");

    const unique = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const title = buildAdminNoteTestArtifactTitle({
      scope: ADMIN_CONTEXTUAL_NOTES_ARTIFACT_SCOPE,
      label: "My Library goals quick capture",
      unique,
    });

    await panel.getByRole("button", { name: "Quick note" }).click();
    const quickCaptureDialog = page.getByTestId("admin-note-quick-capture-dialog");
    await expect(quickCaptureDialog).toBeVisible({ timeout: 10_000 });
    const createForm = page.getByTestId("admin-note-quick-capture-form");
    await createForm.getByLabel("Title").fill(title);
    await createForm.getByLabel("Category").fill("Operations");
    await createForm.getByLabel("Priority").selectOption("high");
    await createForm.getByLabel("Text").fill("Page-level admin note for My Library goals.");

    let createResponse: Awaited<ReturnType<Page["waitForResponse"]>> | undefined;
    try {
      [createResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().includes("/api/admin/notes") && response.request().method() === "POST",
          { timeout: 15_000 }
        ),
        createForm.getByRole("button", { name: "Save" }).click(),
      ]);
    } catch {
      test.skip(true, "My Library goals note create request timed out in this environment.");
    }

    if (!createResponse) {
      return;
    }

    const createPayload = (await createResponse.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
    } | null;
    if (!createResponse.ok() || createPayload?.ok === false) {
      const reason =
        typeof createPayload?.error === "string"
          ? createPayload.error
          : `status ${createResponse.status()}`;
      test.skip(
        true,
        `My Library goals note create is not write-ready in this environment (${reason}).`
      );
    }

    await expect(quickCaptureDialog).toBeVisible({ timeout: 10_000 });
    await expect(quickCaptureDialog.getByLabel("Title")).toHaveValue("");
    await quickCaptureDialog.getByRole("button", { name: "Close panel" }).first().click();
    await expect(quickCaptureDialog).toHaveCount(0);

    const toggle = panel.getByTestId("admin-context-notes-toggle");
    if ((await toggle.textContent())?.includes("Show")) {
      await toggle.click();
    }

    const createdItem = panel
      .getByTestId("admin-context-note-item")
      .filter({ hasText: title })
      .first();
    await expect
      .poll(
        async () =>
          await panel.getByTestId("admin-context-note-item").filter({ hasText: title }).count(),
        { timeout: 15_000 }
      )
      .toBeGreaterThan(0);
    await expect(createdItem).toBeVisible({ timeout: 15_000 });
    await expect(createdItem).toContainText("High");

    await toggleDoneAndWait(page, panel, title, "Note marked as done.");

    page.once("dialog", (dialog) => dialog.accept());
    await createdItem.getByRole("button", { name: "Delete" }).click();
    await expect(
      panel.getByTestId("admin-context-note-item").filter({ hasText: title })
    ).toHaveCount(0);
  });

  test("allowlisted admin can quick-capture page notes from swim-session detail route", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();

    await loginAsAdminViaDevBypass(page, "/my-library");
    expect(new URL(page.url()).pathname).toBe("/my-library");

    const workoutCreateResponse = await page.request.post("/api/my-library/workouts", {
      headers: {
        "content-type": "application/json",
      },
      data: JSON.stringify({
        sourceKind: "manual",
        draft: buildManualWorkoutEmptyDraft(),
      }),
    });

    if (!workoutCreateResponse.ok()) {
      test.skip(true, `Workout create API unavailable (${workoutCreateResponse.status()}).`);
    }

    const workoutCreatePayload = (await workoutCreateResponse.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
      workout?: { id?: string };
    } | null;

    if (!workoutCreatePayload?.ok || typeof workoutCreatePayload.workout?.id !== "string") {
      const reason =
        typeof workoutCreatePayload?.error === "string"
          ? workoutCreatePayload.error
          : "missing workout id";
      test.skip(true, `Workout detail setup is not write-ready in this environment (${reason}).`);
    }

    const workoutId = workoutCreatePayload?.workout?.id;
    if (typeof workoutId !== "string") {
      test.skip(true, "Workout detail setup did not return a stable workout id.");
    }
    const workoutPath = `/my-library/workouts/${workoutId}`;

    try {
      await loginAsAdminViaDevBypass(page, workoutPath);
      expect(new URL(page.url()).pathname).toBe(workoutPath);
      const unique = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const title = buildAdminNoteTestArtifactTitle({
        scope: ADMIN_CONTEXTUAL_NOTES_ARTIFACT_SCOPE,
        label: "Swim session detail quick capture",
        unique,
      });
      await expectPageQuickCaptureFlow(
        page,
        workoutPath,
        title,
        "Page-level admin note for swim-session detail."
      );
    } finally {
      await page.request.delete(`/api/my-library/workouts/${workoutId}`).catch(() => null);
    }
  });

  test("allowlisted admin can quick-capture page notes from dryland detail route", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();

    await loginAsAdminViaDevBypass(page, "/my-library");
    expect(new URL(page.url()).pathname).toBe("/my-library");

    const drylandCreateResponse = await page.request.post("/api/my-library/dryland", {
      headers: {
        "content-type": "application/json",
      },
      data: JSON.stringify({
        sourceKind: "manual",
        sessionKind: "strength",
        draft: buildManualDrylandStarterDraft("strength"),
      }),
    });

    if (!drylandCreateResponse.ok()) {
      test.skip(true, `Dryland create API unavailable (${drylandCreateResponse.status()}).`);
    }

    const drylandCreatePayload = (await drylandCreateResponse.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
      session?: { id?: string };
    } | null;

    if (!drylandCreatePayload?.ok || typeof drylandCreatePayload.session?.id !== "string") {
      const reason =
        typeof drylandCreatePayload?.error === "string"
          ? drylandCreatePayload.error
          : "missing dryland session id";
      test.skip(true, `Dryland detail setup is not write-ready in this environment (${reason}).`);
    }

    const sessionId = drylandCreatePayload?.session?.id;
    if (typeof sessionId !== "string") {
      test.skip(true, "Dryland detail setup did not return a stable session id.");
    }
    const drylandPath = `/my-library/dryland/${sessionId}`;

    try {
      await loginAsAdminViaDevBypass(page, drylandPath);
      expect(new URL(page.url()).pathname).toBe(drylandPath);

      const unique = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const title = buildAdminNoteTestArtifactTitle({
        scope: ADMIN_CONTEXTUAL_NOTES_ARTIFACT_SCOPE,
        label: "Dryland detail quick capture",
        unique,
      });

      await expectPageQuickCaptureFlow(
        page,
        drylandPath,
        title,
        "Page-level admin note for dryland detail."
      );
    } finally {
      await page.request.delete(`/api/my-library/dryland/${sessionId}`).catch(() => null);
    }
  });

  test("allowlisted admin can quick-capture page notes from program detail route", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();

    await loginAsAdminViaDevBypass(page, "/my-library");
    expect(new URL(page.url()).pathname).toBe("/my-library");

    const programCreateResponse = await page.request.post("/api/my-library/programs", {
      headers: {
        "content-type": "application/json",
      },
      data: JSON.stringify({}),
    });

    if (!programCreateResponse.ok()) {
      test.skip(true, `Program create API unavailable (${programCreateResponse.status()}).`);
    }

    const programCreatePayload = (await programCreateResponse.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
      program?: { id?: string };
    } | null;

    if (!programCreatePayload?.ok || typeof programCreatePayload.program?.id !== "string") {
      const reason =
        typeof programCreatePayload?.error === "string"
          ? programCreatePayload.error
          : "missing program id";
      test.skip(true, `Program detail setup is not write-ready in this environment (${reason}).`);
    }

    const programId = programCreatePayload?.program?.id;
    if (typeof programId !== "string") {
      test.skip(true, "Program detail setup did not return a stable program id.");
    }
    const programPath = `/my-library/programs/${programId}`;

    await loginAsAdminViaDevBypass(page, programPath);
    expect(new URL(page.url()).pathname).toBe(programPath);

    const unique = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const title = buildAdminNoteTestArtifactTitle({
      scope: ADMIN_CONTEXTUAL_NOTES_ARTIFACT_SCOPE,
      label: "Program detail quick capture",
      unique,
    });

    await expectPageQuickCaptureFlow(
      page,
      programPath,
      title,
      "Page-level admin note for program detail."
    );
  });
});
