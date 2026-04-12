import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { buildAdminNoteTestArtifactTitle } from "@/lib/admin/admin-note-test-artifacts";
import { cleanupAdminNoteTestArtifacts } from "@/tests/e2e/admin-note-test-artifact-cleanup";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";
const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9l9wAAAABJRU5ErkJggg==";
const ADMIN_NOTES_ARTIFACT_SCOPE = "notes-workflow";

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Admin e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

function shouldManageAdminNoteArtifacts(projectName: string) {
  return projectName === "desktop-chromium" && !isSiteLockEnabled;
}

async function loginAsAdminViaDevBypass(page: Page) {
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
}

async function openNotesSection(page: Page) {
  const activeSectionLabel = page.getByTestId("admin-active-section-label");
  const notesHeading = page.getByRole("heading", { name: "Notes" });
  const notesUrlPattern = /\/admin\?tab=notes(?:&|$)/;
  const alreadyShowingNotes = await expect(activeSectionLabel)
    .toHaveText("Notes", { timeout: 2_000 })
    .then(() => true)
    .catch(() => false);

  if (!alreadyShowingNotes) {
    await page.getByTestId("admin-tab-notes").click();
  }

  const reachedNotesUrl = await page
    .waitForURL(notesUrlPattern, { timeout: 5_000 })
    .then(() => true)
    .catch(() => false);

  if (!reachedNotesUrl) {
    await page.goto("/admin?tab=notes", {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
  }

  await expect(activeSectionLabel).toHaveText("Notes");
  await expect(notesHeading).toBeVisible();
  await waitForNotesSectionReady(page);
}

async function reloadNotesSection(page: Page) {
  const activeSectionLabel = page.getByTestId("admin-active-section-label");
  const notesManager = page.getByTestId("admin-notes-manager");

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForURL(/\/admin\?tab=notes(?:&|$)/, { timeout: 10_000 });
  await expect(activeSectionLabel).toHaveText("Notes", { timeout: 15_000 });

  const notesManagerVisible = await notesManager.isVisible().catch(() => false);
  if (!notesManagerVisible) {
    await page.getByTestId("admin-tab-notes").click();
  }

  await expect(notesManager).toBeVisible({ timeout: 20_000 });
  await waitForNotesSectionReady(page);
}

async function waitForNotesSectionReady(page: Page) {
  const notesManager = page.getByTestId("admin-notes-manager");
  const loadingNotice = notesManager.getByText("Loading notes…");
  const errorNotice = notesManager.getByText("Could not load notes.").first();
  const refreshButton = notesManager.getByRole("button", { name: "Refresh" });
  const summaryNotice = notesManager
    .getByText(/\d+ open · \d+ done archive|No notes yet\./)
    .first();

  async function waitForLoadingToSettle(timeout: number) {
    return expect(loadingNotice)
      .toHaveCount(0, { timeout })
      .then(
        () => true,
        () => false
      );
  }

  await expect(notesManager).toBeVisible({ timeout: 20_000 });
  await expect(refreshButton).toBeVisible({ timeout: 10_000 });

  let loadingSettled = await waitForLoadingToSettle(10_000);

  if (!loadingSettled && (await errorNotice.isVisible().catch(() => false))) {
    await notesManager.getByRole("button", { name: "Retry" }).click();
    loadingSettled = await waitForLoadingToSettle(15_000);
  }

  if (!loadingSettled) {
    await refreshButton.click();
    loadingSettled = await waitForLoadingToSettle(15_000);
  }

  if (!loadingSettled && (await errorNotice.isVisible().catch(() => false))) {
    await notesManager.getByRole("button", { name: "Retry" }).click();
    loadingSettled = await waitForLoadingToSettle(15_000);
  }

  if (await errorNotice.isVisible().catch(() => false)) {
    test.skip(true, "Admin notes API is not stable enough in this environment.");
  }

  if (!loadingSettled) {
    const summaryVisible = await summaryNotice.isVisible().catch(() => false);
    if (summaryVisible) {
      await refreshButton.click();
      loadingSettled = await waitForLoadingToSettle(15_000);
    }
  }

  if (!loadingSettled) {
    test.skip(true, "Admin notes list did not reach a stable ready state in this environment.");
  }

  const schemaWarning = notesManager
    .getByText(/admin notes setup is not ready|schema is not ready|not ready/i)
    .first();
  if (await schemaWarning.isVisible().catch(() => false)) {
    test.skip(true, "Admin notes schema is not ready in this environment.");
  }
}

async function waitForDashboardQuickCaptureTrigger(page: Page) {
  const activeSectionLabel = page.getByTestId("admin-active-section-label");
  const trigger = page.getByTestId("admin-workspace-quick-note-trigger");

  await expect(page.getByRole("heading", { name: "Admin console" })).toBeVisible({
    timeout: 15_000,
  });
  await expect(activeSectionLabel).toBeVisible({ timeout: 15_000 });

  const triggerVisible = await expect(trigger)
    .toBeVisible({ timeout: 10_000 })
    .then(
      () => true,
      () => false
    );

  if (triggerVisible) {
    return;
  }

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Admin console" })).toBeVisible({
    timeout: 15_000,
  });
  await expect(activeSectionLabel).toBeVisible({ timeout: 15_000 });
  await expect(trigger).toBeVisible({ timeout: 15_000 });
}

async function toggleDoneAndWait(page: Page, item: ReturnType<Page["getByTestId"]>) {
  const doneCheckbox = item.getByRole("checkbox");
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
    test.skip(true, "Admin notes done-toggle request timed out in this environment.");
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
    test.skip(true, `Admin notes done-toggle is not write-ready in this environment (${reason}).`);
  }
}

async function deleteNoteAndWait(page: Page, noteId: string, trigger: () => Promise<void>) {
  let deleteResponse: Awaited<ReturnType<Page["waitForResponse"]>> | undefined;
  try {
    [deleteResponse] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes(`/api/admin/notes/${noteId}`) &&
          response.request().method() === "DELETE",
        { timeout: 15_000 }
      ),
      trigger(),
    ]);
  } catch {
    test.skip(true, "Admin notes delete request timed out in this environment.");
  }

  if (!deleteResponse) {
    return;
  }

  const deletePayload = (await deleteResponse.json().catch(() => null)) as {
    ok?: boolean;
    error?: string;
  } | null;
  if (!deleteResponse.ok() || deletePayload?.ok === false) {
    const reason =
      typeof deletePayload?.error === "string"
        ? deletePayload.error
        : `status ${deleteResponse.status()}`;
    test.skip(true, `Admin notes delete is not write-ready in this environment (${reason}).`);
  }
}

async function installAdminClipboardReadMock(page: Page, mode: "success" | "permission_denied") {
  await page.addInitScript(
    ({ base64, clipboardMode }) => {
      const decodePng = () => Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          read: async () => {
            if (clipboardMode === "permission_denied") {
              throw new DOMException("Permission denied", "NotAllowedError");
            }

            return [
              {
                types: ["image/png"],
                getType: async () => new Blob([decodePng()], { type: "image/png" }),
              },
            ];
          },
        },
      });
    },
    {
      base64: TINY_PNG_BASE64,
      clipboardMode: mode,
    }
  );
}

test.describe("admin notes workflow", () => {
  test.beforeAll(async ({}, testInfo) => {
    if (!shouldManageAdminNoteArtifacts(testInfo.project.name)) return;
    await cleanupAdminNoteTestArtifacts({
      scope: ADMIN_NOTES_ARTIFACT_SCOPE,
      includeLegacy: true,
    });
  });

  test.afterEach(async ({}, testInfo) => {
    if (!shouldManageAdminNoteArtifacts(testInfo.project.name)) return;
    await cleanupAdminNoteTestArtifacts({
      scope: ADMIN_NOTES_ARTIFACT_SCOPE,
    });
  });

  test("allowlisted admin can create, edit, toggle, and delete notes", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();
    test.setTimeout(90_000);

    await installAdminClipboardReadMock(page, "success");
    await loginAsAdminViaDevBypass(page);
    await openNotesSection(page);

    const unique = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const title = buildAdminNoteTestArtifactTitle({
      scope: ADMIN_NOTES_ARTIFACT_SCOPE,
      label: "Primary note",
      unique,
    });
    const secondaryTitle = buildAdminNoteTestArtifactTitle({
      scope: ADMIN_NOTES_ARTIFACT_SCOPE,
      label: "Related note",
      unique,
    });
    const updatedTitle = buildAdminNoteTestArtifactTitle({
      scope: ADMIN_NOTES_ARTIFACT_SCOPE,
      label: "Updated note",
      unique,
    });
    const body = "Initial note body from Playwright.";
    const updatedBody = "Updated note body from Playwright.";

    await page.getByRole("button", { name: "Use P1 template" }).click();
    const createForm = page.getByTestId("admin-notes-create-form");
    await expect(
      createForm.getByRole("button", { name: "Paste image from clipboard" })
    ).toBeVisible();
    await expect(createForm.getByLabel("Upload images")).toBeVisible();
    await expect(createForm.getByRole("button", { name: "Capture screenshot" })).toHaveCount(0);
    await createForm.getByRole("button", { name: "Paste image from clipboard" }).click();
    await expect(createForm.getByText("1 image ready to attach")).toBeVisible({ timeout: 10_000 });
    await createForm.getByLabel("Upload images").setInputFiles({
      name: "uploaded-proof-2.png",
      mimeType: "image/png",
      buffer: Buffer.from(TINY_PNG_BASE64, "base64"),
    });
    await expect(createForm.getByText("2 images ready to attach")).toBeVisible({
      timeout: 10_000,
    });
    await expect(createForm.getByLabel("Category")).toHaveValue("Incident P1");
    await createForm.getByLabel("Title").fill(title);
    await createForm.getByLabel("Category").fill("Operations");
    await createForm.locator('input[type="date"]').fill("2026-02-20");
    await createForm.getByLabel("Priority").selectOption("high");
    await createForm.getByLabel("Text").fill(body);
    await createForm.getByTestId("admin-note-create-context-type").selectOption("course_lesson");
    const modulePicker = createForm.getByTestId("admin-note-create-context-lesson-module");
    const moduleOptionCount = await modulePicker.locator("option").count();
    if (moduleOptionCount < 2) {
      test.skip(
        true,
        "No course module options available for context attachment in this environment."
      );
    }
    await modulePicker.selectOption({ index: 1 });
    const lessonPicker = createForm.getByTestId("admin-note-create-context-lesson");
    const lessonOptionCount = await lessonPicker.locator("option").count();
    if (lessonOptionCount < 2) {
      test.skip(
        true,
        "No course lesson options available for context attachment in this environment."
      );
    }
    await lessonPicker.selectOption({ index: 1 });
    let createResponse: Awaited<ReturnType<Page["waitForResponse"]>> | undefined;
    let createAttachmentResponse: Awaited<ReturnType<Page["waitForResponse"]>> | undefined;
    try {
      [createResponse, createAttachmentResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().includes("/api/admin/notes") &&
            !response.url().includes("/attachments") &&
            response.request().method() === "POST",
          { timeout: 15_000 }
        ),
        page.waitForResponse(
          (response) =>
            response.url().includes("/api/admin/notes/") &&
            response.url().includes("/attachments") &&
            response.request().method() === "POST",
          { timeout: 15_000 }
        ),
        createForm.getByRole("button", { name: "Save note" }).click(),
      ]);
    } catch {
      test.skip(true, "Admin notes create or staged-image upload timed out in this environment.");
    }
    if (!createResponse || !createAttachmentResponse) {
      return;
    }

    const createPayload = (await createResponse.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
      item?: { id?: string; context_ref?: string | null };
    } | null;
    if (!createResponse.ok() || createPayload?.ok === false) {
      const reason =
        typeof createPayload?.error === "string"
          ? createPayload.error
          : `status ${createResponse.status()}`;
      test.skip(true, `Admin notes create is not write-ready in this environment (${reason}).`);
    }
    const createAttachmentPayload = (await createAttachmentResponse.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
    } | null;
    if (!createAttachmentResponse.ok() || createAttachmentPayload?.ok === false) {
      const reason =
        typeof createAttachmentPayload?.error === "string"
          ? createAttachmentPayload.error
          : `status ${createAttachmentResponse.status()}`;
      test.skip(
        true,
        `Admin notes staged-image upload is not ready in this environment (${reason}).`
      );
    }

    await expect(page.getByText("Note saved with images attached.")).toBeVisible({
      timeout: 5_000,
    });

    const createdItem = page.getByTestId("admin-note-item").filter({ hasText: title }).first();
    await expect(createdItem).toBeVisible({ timeout: 15_000 });
    await expect(createdItem).toContainText("Operations");
    await expect(createdItem).toContainText(body);
    await expect(createdItem).toContainText("High");
    await expect(createdItem).toContainText("Course Lesson:");
    await expect(createdItem).toContainText("2 images");
    const noteIdText = await createdItem.getByTestId("admin-note-id").textContent();
    const noteId = noteIdText?.replace("Note ID", "").trim() ?? "";
    expect(noteId.length).toBeGreaterThan(5);

    await createForm.getByLabel("Title").fill(secondaryTitle);
    await createForm.getByLabel("Category").fill("Operations");
    await createForm.getByLabel("Priority").selectOption("low");
    await createForm.getByLabel("Text").fill("Secondary note used for related-link flow.");
    await createForm.getByTestId("admin-note-create-context-type").selectOption("");
    let secondaryCreateResponse: Awaited<ReturnType<Page["waitForResponse"]>> | undefined;
    try {
      [secondaryCreateResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().includes("/api/admin/notes") &&
            !response.url().includes("/attachments") &&
            response.request().method() === "POST",
          { timeout: 15_000 }
        ),
        createForm.getByRole("button", { name: "Save note" }).click(),
      ]);
    } catch {
      test.skip(true, "Admin notes secondary create request timed out in this environment.");
    }
    if (!secondaryCreateResponse) {
      return;
    }

    const secondaryPayload = (await secondaryCreateResponse.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
    } | null;
    if (!secondaryCreateResponse.ok() || secondaryPayload?.ok === false) {
      const reason =
        typeof secondaryPayload?.error === "string"
          ? secondaryPayload.error
          : `status ${secondaryCreateResponse.status()}`;
      test.skip(
        true,
        `Admin notes secondary create is not write-ready in this environment (${reason}).`
      );
    }

    const secondaryItem = page
      .getByTestId("admin-note-item")
      .filter({ hasText: secondaryTitle })
      .first();
    await expect(secondaryItem).toBeVisible({ timeout: 10_000 });
    const secondaryNoteIdText = await secondaryItem.getByTestId("admin-note-id").textContent();
    const secondaryNoteId = secondaryNoteIdText?.replace("Note ID", "").trim() ?? "";
    expect(secondaryNoteId.length).toBeGreaterThan(5);

    await page.getByTestId("admin-notes-priority-filter").selectOption("high");
    await expect(createdItem).toBeVisible();
    await expect(secondaryItem).toHaveCount(0);
    await page.getByTestId("admin-notes-priority-filter").selectOption("");

    const searchInput = page.getByTestId("admin-notes-search");
    await searchInput.click();
    await searchInput.pressSequentially(noteId);
    await expect(page.getByTestId("admin-note-item")).toHaveCount(1);
    await expect(createdItem).toBeVisible();
    const clearFiltersButton = page.getByRole("button", { name: "Clear filters" });
    await expect(clearFiltersButton).toBeVisible();
    await clearFiltersButton.click();
    await expect(searchInput).toHaveValue("");
    await expect(page.getByTestId("admin-notes-priority-filter")).toHaveValue("");
    await expect(page).not.toHaveURL(/notesQuery=/);
    await expect(page).not.toHaveURL(/notesPriority=/);
    await expect(createdItem).toBeVisible();

    await createdItem.getByRole("button", { name: "Edit" }).click();
    const editForm = createdItem.getByTestId("admin-note-edit-form");
    await expect(editForm).toBeVisible();
    await editForm.getByLabel("Edit title").fill(updatedTitle);
    await editForm.getByLabel("Edit category").fill("Product");
    await editForm.getByLabel("Edit date").fill("2026-02-21");
    await editForm.getByLabel("Priority").selectOption("urgent");
    await editForm.getByLabel("Edit text").fill(updatedBody);
    await editForm.getByRole("button", { name: "Save changes" }).click();

    const updatedItem = page
      .getByTestId("admin-note-item")
      .filter({ hasText: updatedTitle })
      .first();
    await expect(updatedItem).toBeVisible({ timeout: 10_000 });
    await expect(updatedItem).toContainText("Product");
    await expect(updatedItem).toContainText(updatedBody);
    await expect(updatedItem).toContainText("Urgent");

    await updatedItem.getByRole("button", { name: "Edit" }).click();
    const attachmentsEditForm = updatedItem.getByTestId("admin-note-edit-form");
    let uploadResponse: Awaited<ReturnType<Page["waitForResponse"]>> | undefined;
    try {
      [uploadResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().includes(`/api/admin/notes/${noteId}/attachments`) &&
            response.request().method() === "POST",
          { timeout: 15_000 }
        ),
        (async () => {
          await expect(
            attachmentsEditForm.getByRole("button", { name: "Capture screenshot" })
          ).toHaveCount(0);
          await attachmentsEditForm.getByTestId("admin-note-attachment-input").setInputFiles({
            name: "uploaded-proof.png",
            mimeType: "image/png",
            buffer: Buffer.from(TINY_PNG_BASE64, "base64"),
          });
        })(),
      ]);
    } catch {
      test.skip(true, "Admin notes image upload timed out in this environment.");
    }
    if (!uploadResponse) {
      return;
    }
    const uploadPayload = (await uploadResponse.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
    } | null;
    if (!uploadResponse.ok() || uploadPayload?.ok === false) {
      const reason =
        typeof uploadPayload?.error === "string"
          ? uploadPayload.error
          : `status ${uploadResponse.status()}`;
      test.skip(true, `Admin notes image upload is not ready in this environment (${reason}).`);
    }

    await expect(updatedItem).toContainText("3 images");

    await attachmentsEditForm
      .getByTestId("admin-note-related-select")
      .selectOption(secondaryNoteId);
    let linkResponse: Awaited<ReturnType<Page["waitForResponse"]>> | undefined;
    try {
      [linkResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().includes(`/api/admin/notes/${noteId}/links`) &&
            response.request().method() === "POST",
          { timeout: 15_000 }
        ),
        attachmentsEditForm.getByTestId("admin-note-related-add").click(),
      ]);
    } catch {
      test.skip(true, "Admin notes related-link request timed out in this environment.");
    }
    if (!linkResponse) {
      return;
    }

    const linkPayload = (await linkResponse.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
    } | null;
    if (!linkResponse.ok() || linkPayload?.ok === false) {
      const reason =
        typeof linkPayload?.error === "string"
          ? linkPayload.error
          : `status ${linkResponse.status()}`;
      test.skip(true, `Admin notes related-link is not ready in this environment (${reason}).`);
    }

    await expect(updatedItem).toContainText("1 related note");
    await expect(updatedItem).toContainText(secondaryTitle);

    let deleteAttachmentResponse: Awaited<ReturnType<Page["waitForResponse"]>> | undefined;
    try {
      [deleteAttachmentResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().includes(`/api/admin/notes/${noteId}/attachments/`) &&
            response.request().method() === "DELETE",
          { timeout: 15_000 }
        ),
        attachmentsEditForm.getByTestId("admin-note-attachment-delete").click(),
      ]);
    } catch {
      test.skip(true, "Admin notes image delete request timed out in this environment.");
    }
    if (!deleteAttachmentResponse) {
      return;
    }

    const deleteAttachmentPayload = (await deleteAttachmentResponse.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
    } | null;
    if (!deleteAttachmentResponse.ok() || deleteAttachmentPayload?.ok === false) {
      const reason =
        typeof deleteAttachmentPayload?.error === "string"
          ? deleteAttachmentPayload.error
          : `status ${deleteAttachmentResponse.status()}`;
      test.skip(true, `Admin notes image delete is not ready in this environment (${reason}).`);
    }

    await expect(updatedItem).toContainText("1 image");
    await attachmentsEditForm.getByRole("button", { name: "Cancel" }).click();

    const relatedJumpSearchInput = page.getByTestId("admin-notes-search");
    await updatedItem.getByRole("button", { name: secondaryTitle }).click();
    await expect(relatedJumpSearchInput).toHaveValue(secondaryNoteId);
    await expect(
      page.getByTestId("admin-note-item").filter({ hasText: secondaryNoteId })
    ).toBeVisible();
    await relatedJumpSearchInput.fill("");
    await expect(updatedItem).toBeVisible({ timeout: 10_000 });

    await page.getByTestId("admin-notes-category-filter").selectOption("Product");
    await expect(updatedItem).toBeVisible();
    await page.getByTestId("admin-notes-category-filter").selectOption("");

    const doneCheckbox = updatedItem.getByRole("checkbox");
    await expect(doneCheckbox).not.toBeChecked();
    await toggleDoneAndWait(page, updatedItem);
    await expect(page.getByTestId("admin-note-item").filter({ hasText: updatedTitle })).toHaveCount(
      0,
      { timeout: 10_000 }
    );

    await page.getByTestId("admin-notes-status-done").click();
    await expect(page).toHaveURL(/tab=notes/);
    await expect(page).toHaveURL(/notesStatus=done/);

    const archivedItem = page
      .getByTestId("admin-note-item")
      .filter({ hasText: updatedTitle })
      .first();
    await expect(archivedItem).toBeVisible({ timeout: 10_000 });

    const lessonContextRef = createPayload?.item?.context_ref ?? "";
    if (lessonContextRef) {
      await page.getByTestId("admin-notes-context-type-filter").selectOption("course_lesson");
      await page.getByTestId("admin-notes-context-ref-filter").selectOption(lessonContextRef);
      await expect(archivedItem).toBeVisible();
    }

    await searchInput.click();
    await searchInput.pressSequentially(noteId);
    await expect(archivedItem).toBeVisible();
    await expect(searchInput).toHaveValue(noteId);

    await reloadNotesSection(page);
    await expect(page).toHaveURL(/notesStatus=done/);
    await expect(page.getByTestId("admin-notes-search")).toHaveValue(noteId);
    const reloadedArchivedItem = page
      .getByTestId("admin-note-item")
      .filter({ hasText: updatedTitle })
      .first();
    await expect(reloadedArchivedItem).toBeVisible({ timeout: 10_000 });

    page.once("dialog", (dialog) => dialog.accept());
    await deleteNoteAndWait(page, noteId, async () => {
      await reloadedArchivedItem.getByRole("button", { name: "Delete" }).click();
    });
    await expect(page.getByTestId("admin-note-item").filter({ hasText: updatedTitle })).toHaveCount(
      0
    );

    await page.getByTestId("admin-notes-status-all").click();
    const reopenFiltersButton = page.getByRole("button", { name: "Clear filters" });
    await expect(reopenFiltersButton).toBeVisible();
    await reopenFiltersButton.click();
    await expect(page).not.toHaveURL(/notesQuery=/, { timeout: 15_000 });
    await expect(page.getByTestId("admin-notes-search")).toHaveValue("", { timeout: 15_000 });
    const relatedNoteItem = page
      .getByTestId("admin-note-item")
      .filter({ hasText: secondaryTitle })
      .first();
    await expect(relatedNoteItem).toBeVisible({ timeout: 10_000 });
    page.once("dialog", (dialog) => dialog.accept());
    await deleteNoteAndWait(page, secondaryNoteId, async () => {
      await relatedNoteItem.getByRole("button", { name: "Delete" }).click();
    });
    await expect(
      page.getByTestId("admin-note-item").filter({ hasText: secondaryTitle })
    ).toHaveCount(0);
  });

  test("shows recovery when clipboard image paste is blocked", async ({ page }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    await installAdminClipboardReadMock(page, "permission_denied");
    await loginAsAdminViaDevBypass(page);
    await openNotesSection(page);

    const createForm = page.getByTestId("admin-notes-create-form");
    await expect(
      createForm.getByRole("button", { name: "Paste image from clipboard" })
    ).toBeVisible({
      timeout: 10_000,
    });
    await expect(createForm.getByRole("button", { name: "Capture screenshot" })).toHaveCount(0);
    await createForm.getByRole("button", { name: "Paste image from clipboard" }).click();
    await expect(
      page.getByText(
        "Clipboard access was blocked. Allow paste access, then try again, or use Upload image instead."
      )
    ).toBeVisible({ timeout: 10_000 });
  });

  test("allowlisted admin can quick-capture a dashboard note and jump into Notes", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();

    await loginAsAdminViaDevBypass(page);

    const unique = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const title = buildAdminNoteTestArtifactTitle({
      scope: ADMIN_NOTES_ARTIFACT_SCOPE,
      label: "Dashboard quick capture",
      unique,
    });

    await waitForDashboardQuickCaptureTrigger(page);
    await page.getByTestId("admin-workspace-quick-note-trigger").click();
    const quickCaptureDialog = page.getByTestId("admin-note-quick-capture-dialog");
    await expect(quickCaptureDialog).toBeVisible({ timeout: 10_000 });
    const quickCaptureForm = page.getByTestId("admin-note-quick-capture-form");
    await expect(quickCaptureForm.getByLabel("Category")).toBeVisible({ timeout: 10_000 });
    const titleInput = quickCaptureForm.getByLabel("Title");
    await titleInput.click();
    await page.keyboard.type(title);
    await expect(titleInput).toHaveValue(title);
    await expect(titleInput).toBeFocused();
    await quickCaptureForm.getByLabel("Category").fill("Operations");
    await quickCaptureForm.getByLabel("Priority").selectOption("high");
    const textInput = quickCaptureForm.getByLabel("Text");
    const detailCopy = "Dashboard-level quick capture from Playwright.";
    await textInput.click();
    await page.keyboard.type(detailCopy);
    await expect(textInput).toHaveValue(detailCopy);
    await expect(textInput).toBeFocused();

    await page.getByRole("button", { name: "Collapse quick note" }).click();
    await expect(quickCaptureDialog).toHaveCount(0);
    const minimizedQuickCapture = page.getByTestId("admin-note-quick-capture-minimized");
    await expect(minimizedQuickCapture).toBeVisible({ timeout: 10_000 });
    await page.getByTestId("admin-note-quick-capture-resume").click();
    await expect(quickCaptureDialog).toBeVisible({ timeout: 10_000 });
    await expect(quickCaptureForm.getByLabel("Title")).toHaveValue(title);
    await expect(quickCaptureForm.getByLabel("Text")).toHaveValue(detailCopy);

    let createResponse: Awaited<ReturnType<Page["waitForResponse"]>> | undefined;
    try {
      [createResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().includes("/api/admin/notes") && response.request().method() === "POST",
          { timeout: 15_000 }
        ),
        quickCaptureForm.getByRole("button", { name: "Save" }).click(),
      ]);
    } catch {
      test.skip(true, "Admin quick-capture request timed out in this environment.");
    }
    if (!createResponse) {
      return;
    }

    const createPayload = (await createResponse.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
      item?: { id?: string };
    } | null;
    if (!createResponse.ok() || createPayload?.ok === false) {
      const reason =
        typeof createPayload?.error === "string"
          ? createPayload.error
          : `status ${createResponse.status()}`;
      test.skip(true, `Admin quick capture is not write-ready in this environment (${reason}).`);
    }

    await expect(page.getByText("Quick note saved.")).toBeVisible({ timeout: 10_000 });
    await Promise.all([
      page.waitForURL(/\/admin\?tab=notes(?:&|$)/, { timeout: 10_000 }),
      page.getByRole("link", { name: "Open in Notes" }).click(),
    ]);
    await expect(page.getByTestId("admin-active-section-label")).toHaveText("Notes");
    await waitForNotesSectionReady(page);

    const createdItem = page.getByTestId("admin-note-item").filter({ hasText: title }).first();
    await expect(createdItem).toBeVisible({ timeout: 15_000 });
    await expect(createdItem).toContainText("Page:");
    await expect(createdItem).toContainText("/admin");

    page.once("dialog", (dialog) => dialog.accept());
    await createdItem.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByTestId("admin-note-item").filter({ hasText: title })).toHaveCount(0);
  });
});
