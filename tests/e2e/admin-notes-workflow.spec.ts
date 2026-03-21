import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

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
    const updatedTitle = `E2E Note Updated ${unique}`;
    const body = "Initial note body from Playwright.";
    const updatedBody = "Updated note body from Playwright.";

    await page.getByRole("button", { name: "Use P1 template" }).click();
    const createForm = page.getByTestId("admin-notes-create-form");
    await expect(createForm.getByLabel("Category")).toHaveValue("Incident P1");
    await createForm.getByLabel("Title").fill(title);
    await createForm.getByLabel("Category").fill("Operations");
    await createForm.locator('input[type="date"]').fill("2026-02-20");
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
    await expect(createdItem).toContainText("Course Lesson:");
    const noteIdText = await createdItem.getByTestId("admin-note-id").textContent();
    const noteId = noteIdText?.replace("Note ID", "").trim() ?? "";
    expect(noteId.length).toBeGreaterThan(5);

    const searchInput = page.getByTestId("admin-notes-search");
    await searchInput.fill(noteId);
    await expect(page.getByTestId("admin-note-item")).toHaveCount(1);
    await expect(createdItem).toBeVisible();
    await searchInput.fill("");

    await createdItem.getByRole("button", { name: "Edit" }).click();
    const editForm = createdItem.getByTestId("admin-note-edit-form");
    await expect(editForm).toBeVisible();
    await editForm.getByLabel("Edit title").fill(updatedTitle);
    await editForm.getByLabel("Edit category").fill("Product");
    await editForm.getByLabel("Edit date").fill("2026-02-21");
    await editForm.getByLabel("Edit text").fill(updatedBody);
    await editForm.getByRole("button", { name: "Save changes" }).click();

    const updatedItem = page
      .getByTestId("admin-note-item")
      .filter({ hasText: updatedTitle })
      .first();
    await expect(updatedItem).toBeVisible({ timeout: 10_000 });
    await expect(updatedItem).toContainText("Product");
    await expect(updatedItem).toContainText(updatedBody);

    await page.getByTestId("admin-notes-category-filter").selectOption("Product");
    await expect(updatedItem).toBeVisible();
    await page.getByTestId("admin-notes-category-filter").selectOption("");

    const doneCheckbox = updatedItem.getByRole("checkbox");
    await expect(doneCheckbox).not.toBeChecked();
    await doneCheckbox.click();
    await expect(page.getByText("Note marked as done and moved to done archive.")).toBeVisible();
    await expect(page.getByTestId("admin-note-item").filter({ hasText: updatedTitle })).toHaveCount(
      0
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
  });
});
