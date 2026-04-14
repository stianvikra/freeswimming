import { expect, test, type Page } from "@playwright/test";
import { gotoWithTransientRetry, waitForRouteToSettle } from "./utils/transient-navigation";

type CourseProgressPollResult = {
  status: number | "transient";
  done: boolean | null;
};

async function waitForStableChecklistCount(page: Page, minimumStableSamples = 3) {
  const checklist = page.getByTestId("course-done-gate-checklist");
  const checkboxes = checklist.getByRole("checkbox");
  let lastCount = -1;
  let stableSamples = 0;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const nextCount = await checkboxes.count();
    if (nextCount > 0 && nextCount === lastCount) {
      stableSamples += 1;
    } else {
      stableSamples = nextCount > 0 ? 1 : 0;
      lastCount = nextCount;
    }

    if (stableSamples >= minimumStableSamples) {
      return nextCount;
    }

    await page.waitForTimeout(250);
  }

  throw new Error("Course pass-criteria checklist did not stabilize in time.");
}

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
  const passCriteriaMarkDoneButton = page.getByTestId("course-pass-criteria-mark-done-button");
  await expect(markDoneButton).toBeVisible();
  if (await markDoneButton.isEnabled()) return;

  const checklist = page.getByTestId("course-done-gate-checklist");
  await expect(checklist).toBeVisible();
  await expect(passCriteriaMarkDoneButton).toBeVisible();
  const checkboxes = checklist.getByRole("checkbox");
  const stableCount = await waitForStableChecklistCount(page);
  expect(stableCount).toBeGreaterThan(0);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const count = await checkboxes.count();
    for (let i = 0; i < count; i += 1) {
      let checked = false;
      for (let retry = 0; retry < 5; retry += 1) {
        const currentCount = await checkboxes.count();
        if (i >= currentCount) {
          await page.waitForTimeout(100);
          continue;
        }

        const checkbox = checkboxes.nth(i);
        if (await checkbox.isChecked()) {
          checked = true;
          break;
        }

        try {
          await expect(checkbox).toBeEnabled();
          await checkbox.check();
          await expect(checkbox).toBeChecked();
          checked = true;
          break;
        } catch {
          await page.waitForTimeout(150);
        }
      }

      expect(checked).toBe(true);
    }

    if ((await passCriteriaMarkDoneButton.isEnabled()) || (await markDoneButton.isEnabled())) {
      return;
    }

    await page.waitForTimeout(250);
  }

  await expect
    .poll(
      async () =>
        (await passCriteriaMarkDoneButton.isEnabled()) || (await markDoneButton.isEnabled()),
      {
        timeout: 5_000,
      }
    )
    .toBe(true);
}

async function clickEnabledMarkDoneButton(page: Page) {
  const markDoneButton = page.getByTestId("course-mark-done-button");
  const passCriteriaMarkDoneButton = page.getByTestId("course-pass-criteria-mark-done-button");

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (await markDoneButton.isEnabled()) {
      await markDoneButton.click();
      return;
    }

    if (
      (await passCriteriaMarkDoneButton.isVisible().catch(() => false)) &&
      (await passCriteriaMarkDoneButton.isEnabled())
    ) {
      await passCriteriaMarkDoneButton.click();
      return;
    }

    await page.waitForTimeout(200);
  }

  await expect(markDoneButton).toBeEnabled();
  await markDoneButton.click();
}

test("signed-in mark-as-done syncs to account progress API", async ({ page }, testInfo) => {
  test.slow();
  test.skip(testInfo.project.name !== "desktop-chromium", "Runs once on desktop Chromium.");
  testInfo.setTimeout(120_000);

  const lessonId = "mod1-l1";
  const canonicalLessonId = "intro-course--welcome-course-structure";
  const nextPath = `/course?lesson=${encodeURIComponent(lessonId)}`;
  await gotoWithTransientRetry(page, `/dev/login?next=${encodeURIComponent(nextPath)}`);

  if (new URL(page.url()).pathname !== "/course") {
    test.skip(true, "Dev auth bypass is not enabled in this environment.");
  }

  await waitForRouteToSettle(page);
  const markDoneButton = page.getByTestId("course-mark-done-button");
  await expect(markDoneButton).toBeVisible();

  await expect
    .poll(
      async () => {
        const snapshot = await getCourseProgressSnapshot(page, canonicalLessonId);
        return snapshot.status;
      },
      { timeout: 60_000 }
    )
    .toBe(200);
  await page.waitForTimeout(1_200);

  const initialPressed = (await markDoneButton.getAttribute("aria-pressed")) === "true";
  const expectedAfterToggle = initialPressed ? "false" : "true";
  const expectedAfterRestore = initialPressed ? "true" : "false";

  if (!initialPressed) {
    await satisfyDoneGateIfPresent(page);
  }
  await clickEnabledMarkDoneButton(page);
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

  await clickEnabledMarkDoneButton(page);
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
