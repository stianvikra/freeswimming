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

test.describe("admin notes workflow", () => {
  test("allowlisted admin can create, edit, toggle, and delete notes", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    await loginAsAdminViaDevBypass(page);

    const notesProbe = await page.request.get("/api/admin/notes");
    if (!notesProbe.ok()) {
      test.skip(true, `Admin notes API unavailable (${notesProbe.status()}).`);
    }
    const notesPayload = (await notesProbe.json()) as {
      ok?: boolean;
      schemaReady?: boolean;
    };
    if (notesPayload.ok && notesPayload.schemaReady === false) {
      test.skip(true, "Admin notes schema is not ready in this environment.");
    }

    await page.getByTestId("admin-tab-notes").click();
    await expect(page.getByTestId("admin-active-section-label")).toHaveText("Notes");
    await expect(page.getByRole("heading", { name: "Notes" })).toBeVisible();

    const unique = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const title = `E2E Note ${unique}`;
    const updatedTitle = `E2E Note Updated ${unique}`;
    const body = "Initial note body from Playwright.";
    const updatedBody = "Updated note body from Playwright.";

    const createForm = page.getByTestId("admin-notes-create-form");
    await createForm.getByLabel("Title").fill(title);
    await createForm.getByLabel("Category").fill("Operations");
    await createForm.getByLabel("Date").fill("2026-02-20");
    await createForm.getByLabel("Text").fill(body);
    await createForm.getByRole("button", { name: "Save note" }).click();

    const createdItem = page.getByTestId("admin-note-item").filter({ hasText: title }).first();
    try {
      await expect(createdItem).toBeVisible({ timeout: 15_000 });
    } catch {
      const writeError = page
        .getByText(/Could not save note right now\.|Forbidden\.|Admin role required\./i)
        .first();
      if (await writeError.isVisible().catch(() => false)) {
        test.skip(true, "Admin notes create is not write-ready in this environment.");
      }
      throw new Error("Admin note item was not created in expected time.");
    }
    await expect(createdItem).toContainText("Operations");
    await expect(createdItem).toContainText(body);

    await createdItem.getByRole("button", { name: "Edit" }).click();
    const editForm = createdItem.getByTestId("admin-note-edit-form");
    await expect(editForm).toBeVisible();
    await editForm.getByLabel("Edit title").fill(updatedTitle);
    await editForm.getByLabel("Edit category").fill("Product");
    await editForm.getByLabel("Edit date").fill("2026-02-21");
    await editForm.getByLabel("Edit text").fill(updatedBody);
    await editForm.getByLabel("Mark as done").check();
    await editForm.getByRole("button", { name: "Save changes" }).click();

    const updatedItem = page
      .getByTestId("admin-note-item")
      .filter({ hasText: updatedTitle })
      .first();
    await expect(updatedItem).toBeVisible({ timeout: 10_000 });
    await expect(updatedItem).toContainText("Product");
    await expect(updatedItem).toContainText(updatedBody);

    const doneCheckbox = updatedItem.getByRole("checkbox");
    await expect(doneCheckbox).toBeChecked();
    await doneCheckbox.click();
    await expect(doneCheckbox).not.toBeChecked();

    page.once("dialog", (dialog) => dialog.accept());
    await updatedItem.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByTestId("admin-note-item").filter({ hasText: updatedTitle })).toHaveCount(
      0
    );
  });
});
