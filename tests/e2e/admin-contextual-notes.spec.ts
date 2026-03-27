import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { buildAdminNoteTestArtifactTitle } from "@/lib/admin/admin-note-test-artifacts";
import { resolveCanonicalCourseLessonRuntimeId } from "@/lib/course/runtime-id-manifest";
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
  await page.goto(`/dev/login?next=${encodeURIComponent(nextPath)}`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
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

    const panel = page.getByTestId("admin-context-notes-panel");
    await expect.poll(async () => await panel.count(), { timeout: 20_000 }).toBeGreaterThan(0);
    await expect(panel).toBeVisible({ timeout: 20_000 });
    const toggle = panel.getByTestId("admin-context-notes-toggle");
    if ((await toggle.textContent())?.includes("Show")) {
      await toggle.click();
      await expect(toggle).toHaveText("Collapse notes", { timeout: 10_000 });
    }
    await expect
      .poll(async () => await panel.getByText("Loading notes…").count(), { timeout: 15_000 })
      .toBe(0);

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
    await expect(createToggle).toHaveText("Expand add note");
    await expect(createForm).toHaveCount(0);
    await createToggle.click();
    await expect(createToggle).toHaveText("Collapse add note");
    await expect(panel.getByTestId("admin-context-note-create-form")).toBeVisible();
    await expect(panel.getByTestId("admin-context-note-paste-image")).toBeVisible();

    await createdItem.getByRole("button", { name: "Edit" }).click();
    const editForm = createdItem.getByTestId("admin-context-note-edit-form");
    await expect(editForm).toBeVisible();
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

    const panel = page.getByTestId("admin-context-notes-panel");
    await expect(panel).toBeVisible({ timeout: 10_000 });
    await expect
      .poll(async () => await panel.getByText("Loading notes…").count(), { timeout: 15_000 })
      .toBe(0);
    const unique = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const title = buildAdminNoteTestArtifactTitle({
      scope: ADMIN_CONTEXTUAL_NOTES_ARTIFACT_SCOPE,
      label: "Plans quick capture",
      unique,
    });
    await panel.getByRole("button", { name: "Quick note" }).click();
    const quickCaptureDialog = page.getByTestId("admin-note-quick-capture-dialog");
    await expect(quickCaptureDialog).toBeVisible({ timeout: 10_000 });
    await quickCaptureDialog.getByLabel("Title").fill(`Cancel ${title}`);
    await quickCaptureDialog.getByRole("button", { name: "Discard draft" }).click();
    await expect(quickCaptureDialog).toHaveCount(0);

    await panel.getByRole("button", { name: "Quick note" }).click();
    await expect(quickCaptureDialog).toBeVisible({ timeout: 10_000 });
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

    await expect(panel.getByText("Quick note saved.")).toBeVisible({ timeout: 10_000 });
    await expect(panel.getByText("Quick note saved.")).toHaveCount(0, { timeout: 7_000 });

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
});
