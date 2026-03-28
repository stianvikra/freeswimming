import { expect, test, type Page } from "@playwright/test";

type CourseProgressPollResult = {
  status: number | "transient";
  done: boolean | null;
};

async function getCourseProgressSnapshot(page: Page, canonicalLessonId: string) {
  return page.evaluate(async (lessonId) => {
    try {
      const response = await fetch("/api/progress/course", {
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      });
      if (response.status === 404) {
        return { status: 404, done: null };
      }
      if (!response.ok) {
        return { status: response.status, done: null };
      }

      const payload = (await response.json().catch(() => null)) as {
        rows?: Array<{ lessonId?: string; done?: boolean }>;
      } | null;
      const row = payload?.rows?.find((entry) => entry.lessonId === lessonId);
      return { status: response.status, done: row?.done ?? false };
    } catch {
      return { status: "transient", done: null };
    }
  }, canonicalLessonId) as Promise<CourseProgressPollResult>;
}

async function satisfyDoneGateIfPresent(page: import("@playwright/test").Page) {
  const markDoneButton = page.getByTestId("course-mark-done-button");
  await expect(markDoneButton).toBeVisible();
  if (await markDoneButton.isEnabled()) return;

  const checklist = page.getByTestId("course-done-gate-checklist");
  await expect(checklist).toBeVisible();

  const items = checklist.locator("label");
  const count = await items.count();
  for (let i = 0; i < count; i += 1) {
    const item = items.nth(i);
    const checkbox = item.getByRole("checkbox");
    if (await checkbox.isChecked()) continue;
    await expect(checkbox).toBeEnabled();
    await item.click();
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
        const snapshot = await getCourseProgressSnapshot(page, canonicalLessonId);
        return snapshot.status;
      },
      { timeout: 30_000 }
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
        const snapshot = await getCourseProgressSnapshot(page, canonicalLessonId);
        if (snapshot.status !== 200) return `status:${snapshot.status}`;
        return snapshot.done ? "true" : "false";
      },
      { timeout: 20_000 }
    )
    .toBe(expectedAfterToggle);

  await markDoneButton.click();
  await expect(markDoneButton).toHaveAttribute("aria-pressed", expectedAfterRestore);

  await expect
    .poll(
      async () => {
        const snapshot = await getCourseProgressSnapshot(page, canonicalLessonId);
        if (snapshot.status !== 200) return `status:${snapshot.status}`;
        return snapshot.done ? "true" : "false";
      },
      { timeout: 20_000 }
    )
    .toBe(expectedAfterRestore);
});
