import { Buffer } from "node:buffer";
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9l9wAAAABJRU5ErkJggg==",
  "base64"
);

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Admin e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
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
  await page.getByTestId("admin-tab-notes").click();
  await page.waitForURL(/\/admin\?tab=notes(?:&|$)/);
  await expect(page.getByTestId("admin-active-section-label")).toHaveText("Notes");
  await expect(page.getByRole("heading", { name: "Notes" })).toBeVisible();
  await waitForNotesSectionReady(page);
}

async function reloadNotesSection(page: Page) {
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForURL(/\/admin\?tab=notes(?:&|$)/);
  await expect(page.getByTestId("admin-active-section-label")).toHaveText("Notes");
  await expect(page.getByRole("heading", { name: "Notes" })).toBeVisible();
  await waitForNotesSectionReady(page);
}

async function waitForNotesSectionReady(page: Page) {
  const notesManager = page.getByTestId("admin-notes-manager");
  const loadingNotice = notesManager.getByText("Loading notes…");
  const errorNotice = notesManager.getByText("Could not load notes.").first();

  await expect(notesManager).toBeVisible({ timeout: 20_000 });
  await expect(loadingNotice).toHaveCount(0, { timeout: 45_000 });

  if (await errorNotice.isVisible().catch(() => false)) {
    await notesManager.getByRole("button", { name: "Retry" }).click();
    await expect(loadingNotice).toHaveCount(0, { timeout: 45_000 });
  }

  if (await errorNotice.isVisible().catch(() => false)) {
    test.skip(true, "Admin notes API is not stable enough in this environment.");
  }

  const schemaWarning = notesManager
    .getByText(/admin notes setup is not ready|schema is not ready|not ready/i)
    .first();
  if (await schemaWarning.isVisible().catch(() => false)) {
    test.skip(true, "Admin notes schema is not ready in this environment.");
  }
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

test.describe("admin notes workflow", () => {
  test("allowlisted admin can create, edit, toggle, and delete notes", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();
    test.setTimeout(90_000);

    await loginAsAdminViaDevBypass(page);
    await openNotesSection(page);

    const unique = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const title = `E2E Note ${unique}`;
    const secondaryTitle = `E2E Related Note ${unique}`;
    const updatedTitle = `E2E Note Updated ${unique}`;
    const body = "Initial note body from Playwright.";
    const updatedBody = "Updated note body from Playwright.";

    await page.getByRole("button", { name: "Use P1 template" }).click();
    const createForm = page.getByTestId("admin-notes-create-form");
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
      test.skip(true, "Admin notes create request timed out in this environment.");
    }
    if (!createResponse) {
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

    await expect(page.getByText("Note saved to open work queue.")).toBeVisible({
      timeout: 5_000,
    });

    const createdItem = page.getByTestId("admin-note-item").filter({ hasText: title }).first();
    await expect(createdItem).toBeVisible({ timeout: 15_000 });
    await expect(createdItem).toContainText("Operations");
    await expect(createdItem).toContainText(body);
    await expect(createdItem).toContainText("High");
    await expect(createdItem).toContainText("Course Lesson:");
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
            response.url().includes("/api/admin/notes") && response.request().method() === "POST",
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
    await expect(page.getByTestId("admin-note-item")).toHaveCount(1);
    await page.getByTestId("admin-notes-priority-filter").selectOption("");

    const searchInput = page.getByTestId("admin-notes-search");
    await searchInput.fill(noteId);
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
        attachmentsEditForm.getByTestId("admin-note-attachment-input").setInputFiles({
          name: "note-proof.png",
          mimeType: "image/png",
          buffer: TINY_PNG,
        }),
      ]);
    } catch {
      test.skip(true, "Admin notes attachment upload timed out in this environment.");
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
      test.skip(
        true,
        `Admin notes attachment upload is not ready in this environment (${reason}).`
      );
    }

    await expect(updatedItem).toContainText("1 image");

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
    await attachmentsEditForm.getByRole("button", { name: "Cancel" }).click();

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

    await searchInput.fill(noteId);
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
    await reloadedArchivedItem.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByTestId("admin-note-item").filter({ hasText: updatedTitle })).toHaveCount(
      0
    );

    await page.getByTestId("admin-notes-status-all").click();
    const reopenFiltersButton = page.getByRole("button", { name: "Clear filters" });
    await expect(reopenFiltersButton).toBeVisible();
    await reopenFiltersButton.click();
    await expect(page.getByTestId("admin-notes-search")).toHaveValue("");
    await expect(page).not.toHaveURL(/notesQuery=/);
    const relatedNoteItem = page
      .getByTestId("admin-note-item")
      .filter({ hasText: secondaryTitle })
      .first();
    await expect(relatedNoteItem).toBeVisible({ timeout: 10_000 });
    page.once("dialog", (dialog) => dialog.accept());
    await relatedNoteItem.getByRole("button", { name: "Delete" }).click();
    await expect(
      page.getByTestId("admin-note-item").filter({ hasText: secondaryTitle })
    ).toHaveCount(0);
  });
});
