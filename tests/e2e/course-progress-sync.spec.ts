import { expect, test } from "@playwright/test";

async function satisfyDoneGateIfPresent(page: import("@playwright/test").Page) {
  const markDoneButton = page.getByTestId("course-mark-done-button");
  await expect(markDoneButton).toBeVisible();
  if (await markDoneButton.isEnabled()) return;

  const checklist = page.getByTestId("course-done-gate-checklist");
  await expect(checklist).toBeVisible();

  const checkboxes = checklist.getByRole("checkbox");
  const count = await checkboxes.count();
  for (let i = 0; i < count; i += 1) {
    const checkbox = checkboxes.nth(i);
    if (await checkbox.isChecked()) continue;
    await checkbox.check();
  }

  await expect(markDoneButton).toBeEnabled();
}

test("signed-in mark-as-done syncs to account progress API", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "Runs once on desktop Chromium.");

  const lessonId = "mod1-l1";
  const nextPath = `/course?lesson=${encodeURIComponent(lessonId)}`;
  await page.goto(`/dev/login?next=${encodeURIComponent(nextPath)}`);

  if (new URL(page.url()).pathname !== "/course") {
    test.skip(true, "Dev auth bypass is not enabled in this environment.");
  }

  const markDoneButton = page.getByTestId("course-mark-done-button");
  await expect(markDoneButton).toBeVisible();

  await expect
    .poll(
      async () => {
        const response = await page.request.get("/api/progress/course");
        return response.status();
      },
      { timeout: 15_000 }
    )
    .toBe(200);
  await page.waitForTimeout(1_200);

  const initialPressed = (await markDoneButton.getAttribute("aria-pressed")) === "true";
  const expectedAfterToggle = initialPressed ? "false" : "true";
  const expectedAfterRestore = initialPressed ? "true" : "false";

  if (!initialPressed) {
    await satisfyDoneGateIfPresent(page);
  }
  await markDoneButton.click();
  await expect(markDoneButton).toHaveAttribute("aria-pressed", expectedAfterToggle);

  await expect
    .poll(
      async () => {
        const response = await page.request.get("/api/progress/course");
        if (response.status() !== 200) return `status:${response.status()}`;
        const payload = (await response.json()) as {
          rows?: Array<{ lessonId?: string; done?: boolean }>;
        };
        const row = payload.rows?.find((entry) => entry.lessonId === lessonId);
        return row?.done ? "true" : "false";
      },
      { timeout: 20_000 }
    )
    .toBe(expectedAfterToggle);

  await markDoneButton.click();
  await expect(markDoneButton).toHaveAttribute("aria-pressed", expectedAfterRestore);

  await expect
    .poll(
      async () => {
        const response = await page.request.get("/api/progress/course");
        if (response.status() !== 200) return `status:${response.status()}`;
        const payload = (await response.json()) as {
          rows?: Array<{ lessonId?: string; done?: boolean }>;
        };
        const row = payload.rows?.find((entry) => entry.lessonId === lessonId);
        return row?.done ? "true" : "false";
      },
      { timeout: 20_000 }
    )
    .toBe(expectedAfterRestore);
});
