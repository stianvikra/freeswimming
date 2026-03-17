import { expect, test, type APIResponse, type Page } from "@playwright/test";

type CourseProgressPayload = {
  rows?: Array<{ lessonId?: string; done?: boolean }>;
};

function isTransientNetworkError(error: unknown): boolean {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return /ECONNRESET|ECONNREFUSED|ETIMEDOUT|Request context disposed|socket hang up|Target page, context or browser has been closed/i.test(
    errorMessage
  );
}

async function getCourseProgressOrNull(page: Page): Promise<APIResponse | null> {
  try {
    return await page.request.get("/api/progress/course");
  } catch (error) {
    if (isTransientNetworkError(error)) {
      return null;
    }
    throw error;
  }
}

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
    await expect(checkbox).toBeEnabled();
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  }

  await expect
    .poll(async () => markDoneButton.isEnabled(), {
      timeout: 5_000,
    })
    .toBe(true);
}

test("signed-in mark-as-done syncs to account progress API", async ({ page }, testInfo) => {
  test.slow();
  test.skip(testInfo.project.name !== "desktop-chromium", "Runs once on desktop Chromium.");

  const lessonId = "mod1-l1";
  const canonicalLessonId = "intro-course--welcome-course-structure";
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
        const response = await getCourseProgressOrNull(page);
        return response?.status() ?? "transient";
      },
      { timeout: 20_000 }
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
        const response = await getCourseProgressOrNull(page);
        if (!response) return "transient";
        if (response.status() !== 200) return `status:${response.status()}`;
        const payload = (await response.json()) as CourseProgressPayload;
        const row = payload.rows?.find((entry) => entry.lessonId === canonicalLessonId);
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
        const response = await getCourseProgressOrNull(page);
        if (!response) return "transient";
        if (response.status() !== 200) return `status:${response.status()}`;
        const payload = (await response.json()) as CourseProgressPayload;
        const row = payload.rows?.find((entry) => entry.lessonId === canonicalLessonId);
        return row?.done ? "true" : "false";
      },
      { timeout: 20_000 }
    )
    .toBe(expectedAfterRestore);
});
