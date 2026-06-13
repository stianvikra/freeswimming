import { expect, test, type Page } from "@playwright/test";
import { COURSE_MODULES } from "../../app/course/courseData";
import { resolveCanonicalCourseLessonRuntimeId } from "../../lib/course/runtime-id-manifest";
import { isMobileProject } from "./project-guards";

const UNSUPPORTED_BROWSER_MESSAGE =
  "Install is not available in this browser yet. For best support, use Safari, Chrome, or Edge.";
const INSTALL_SUCCESS_MESSAGE =
  "App installed. You can open FreeSwimming from your Dock, Start menu, or home screen.";
const INSTALL_PROMPT_LESSON_ID = resolveCanonicalCourseLessonRuntimeId("mod3-l1") ?? "mod3-l1";

async function stubPublishedCourseContent(page: Page) {
  await page.route("**/api/course/content*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        modules: COURSE_MODULES,
        preview: {
          enabled: false,
          mode: "published",
        },
      }),
    });
  });
}

async function gotoInstallPromptLesson(page: Page) {
  await page.goto(`/course?lesson=${encodeURIComponent(INSTALL_PROMPT_LESSON_ID)}`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await waitForCoursePageToSettle(page);
  await expect(page.getByTestId("course-page")).toHaveAttribute(
    "data-active-lesson-id",
    INSTALL_PROMPT_LESSON_ID
  );
}

test.beforeEach(async ({ page }) => {
  await stubPublishedCourseContent(page);
});

async function waitForCoursePageToSettle(page: Page) {
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

async function getCourseLessonsToggle(page: Page) {
  const byTestId = page.getByTestId("course-nav-lessons");
  await expect(byTestId)
    .toBeVisible({ timeout: 2_000 })
    .catch(() => {});

  if (await byTestId.isVisible().catch(() => false)) {
    return byTestId;
  }

  const byAccessibleName = page
    .getByRole("button", { name: /^(Open|Close) lessons menu$/ })
    .first();
  await expect(byAccessibleName).toBeVisible({ timeout: 8_000 });
  return byAccessibleName;
}

async function openMainMenuFromCourse(page: Page) {
  await gotoInstallPromptLesson(page);

  const lessonsToggle = await getCourseLessonsToggle(page);
  const drawer = page.getByRole("dialog", { name: "Navigation menu" });
  const openCourseAttempts: Array<() => Promise<void>> = [
    async () => {
      await lessonsToggle.click();
    },
    async () => {
      await lessonsToggle.focus();
      await page.keyboard.press("Enter");
    },
    async () => {
      await lessonsToggle.click();
    },
    async () => {
      await lessonsToggle.focus();
      await page.keyboard.press("Space");
    },
  ];

  let drawerOpened = false;
  for (const openAttempt of openCourseAttempts) {
    await page.keyboard.press("Escape").catch(() => {});
    await waitForCoursePageToSettle(page);
    await lessonsToggle.scrollIntoViewIfNeeded();
    await openAttempt();
    await expect(drawer)
      .toBeVisible({ timeout: 4_000 })
      .catch(() => {});
    if (await drawer.isVisible().catch(() => false)) {
      drawerOpened = true;
      break;
    }
    await page.waitForTimeout(250);
  }

  expect(drawerOpened).toBe(true);
  await expect(drawer).toBeVisible();

  const menuTab = drawer.getByRole("button", { name: "Main", exact: true });
  const switchToMenuAttempts: Array<() => Promise<void>> = [
    async () => {
      await menuTab.click();
    },
    async () => {
      await menuTab.focus();
      await page.keyboard.press("Enter");
    },
  ];

  for (const switchAttempt of switchToMenuAttempts) {
    await switchAttempt();
    await expect(drawer.getByText("Main menu"))
      .toBeVisible({ timeout: 4_000 })
      .catch(() => {});
    if (
      await drawer
        .getByText("Main menu")
        .isVisible()
        .catch(() => false)
    ) {
      return;
    }
    await page.waitForTimeout(250);
  }

  await expect(drawer.getByText("Main menu")).toBeVisible();
}

async function getCurrentLessonSignature(page: Page) {
  const playLessonButton = page.getByRole("button", { name: /^Play lesson:/ });
  await expect(playLessonButton).toBeVisible();
  const text = await playLessonButton.textContent();
  return (text ?? "").replace(/\s+/g, " ").trim();
}

async function dismissSwipeHintIfPresent(page: Page) {
  const dismissButton = page.getByRole("button", { name: "Dismiss swipe hint" });
  const hintVisible = await dismissButton
    .waitFor({
      state: "visible",
      timeout: 1_500,
    })
    .then(() => true)
    .catch(() => false);

  if (hintVisible) {
    await dismissButton.click();
    await expect(dismissButton).toBeHidden();
  }
}

async function blockBeforeInstallPrompt(page: Page) {
  await page.addInitScript(() => {
    const originalAddEventListener = window.addEventListener.bind(window);
    Object.defineProperty(window, "addEventListener", {
      configurable: true,
      value: (
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
      ) => {
        if (type === "beforeinstallprompt") return;
        originalAddEventListener(type, listener, options);
      },
    });
  });
}

async function dispatchInstallPromptEvent(page: Page, outcome: "accepted" | "dismissed") {
  await page.evaluate((chosenOutcome) => {
    localStorage.removeItem("a2hs_prompt_seen");
    localStorage.removeItem("a2hs_dismissed_at");

    const dispatchInstallPromptEvent = () => {
      const installEvent = new Event("beforeinstallprompt", { cancelable: true }) as Event & {
        prompt?: () => Promise<void>;
        userChoice?: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
      };

      installEvent.prompt = async () => {};
      installEvent.userChoice = Promise.resolve({
        outcome: chosenOutcome,
        platform: "web",
      });

      window.dispatchEvent(installEvent);
    };

    // Fire once immediately and once shortly after to avoid hydration timing races in CI.
    dispatchInstallPromptEvent();
    window.setTimeout(dispatchInstallPromptEvent, 50);
  }, outcome);
}

async function primeInstallPrompt(page: Page, outcome: "accepted" | "dismissed") {
  await page.evaluate(() => {
    localStorage.removeItem("a2hs_prompt_seen");
    localStorage.removeItem("a2hs_dismissed_at");
    localStorage.removeItem("fs_course_done_lessons");
  });
  await dispatchInstallPromptEvent(page, outcome);
  await page.waitForTimeout(120);
}

async function waitForInstallDismissalPersistence(page: Page) {
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const value = localStorage.getItem("a2hs_dismissed_at");
          return typeof value === "string" && value.length > 0;
        }),
      {
        timeout: 5_000,
      }
    )
    .toBe(true);
}

async function satisfyDoneGateIfPresent(page: Page) {
  const markDoneButton = page.getByTestId("course-mark-done-button");
  await expect(markDoneButton).toBeVisible();
  if (await markDoneButton.isEnabled()) return;

  await dismissSwipeHintIfPresent(page);
  const checklist = page.getByTestId("course-done-gate-checklist");
  await expect(checklist).toBeVisible();
  const checkboxes = checklist.getByRole("checkbox");
  await expect
    .poll(async () => await checkboxes.count(), {
      timeout: 5_000,
    })
    .toBeGreaterThan(0);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await dismissSwipeHintIfPresent(page);
    const count = await checkboxes.count();
    for (let i = 0; i < count; i += 1) {
      const currentCheckboxCount = await checkboxes.count();
      if (i >= currentCheckboxCount) {
        break;
      }
      const checkbox = checkboxes.nth(i);
      if (await checkbox.isChecked()) continue;
      await dismissSwipeHintIfPresent(page);
      await expect(checkbox).toBeEnabled();
      await checkbox.check({ force: true });
      await expect(checkbox).toBeChecked();
      await page.waitForTimeout(75);
    }

    if (await markDoneButton.isEnabled()) {
      return;
    }

    await page.waitForTimeout(150);
  }

  await expect
    .poll(async () => markDoneButton.isEnabled(), {
      timeout: 5_000,
    })
    .toBe(true);
}

async function activateMarkDoneButton(page: Page) {
  const markDoneButton = page.getByTestId("course-mark-done-button");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await dismissSwipeHintIfPresent(page);
    await expect(markDoneButton).toBeVisible();
    await expect(markDoneButton).toBeEnabled();
    await markDoneButton.scrollIntoViewIfNeeded();

    try {
      await markDoneButton.click({ timeout: 5_000 });
    } catch {
      await markDoneButton.focus();
      await page.keyboard.press("Enter");
    }

    const completed = await markDoneButton
      .waitFor({
        state: "attached",
        timeout: 250,
      })
      .then(async () => (await markDoneButton.textContent())?.trim() === "Done")
      .catch(() => false);

    if (completed) {
      await expect(markDoneButton).toHaveText("Done");
      return;
    }

    await page.waitForTimeout(150);
  }

  await expect(markDoneButton).toHaveText("Done");
}

async function goToNextLesson(page: Page) {
  const currentLesson = new URL(page.url()).searchParams.get("lesson");
  const currentLessonSignature = await getCurrentLessonSignature(page);
  await page.getByTestId("course-nav-right").click();
  await expect
    .poll(() => new URL(page.url()).searchParams.get("lesson"), {
      timeout: 10_000,
    })
    .not.toBe(currentLesson);
  await expect
    .poll(() => getCurrentLessonSignature(page), {
      timeout: 10_000,
    })
    .not.toBe(currentLessonSignature);
  await waitForCoursePageToSettle(page);
}

test("main menu exposes a persistent install action", async ({ page }, testInfo) => {
  test.skip(
    !isMobileProject(testInfo),
    "Install prompt mobile drawer flow is validated on mobile projects."
  );
  test.slow();

  await openMainMenuFromCourse(page);
  await expect(page.getByTestId("install-app-menu-action")).toBeVisible();
});

test("main menu shows unsupported-browser guidance when install path is unavailable", async ({
  page,
}, testInfo) => {
  test.skip(
    !isMobileProject(testInfo),
    "Install prompt mobile drawer flow is validated on mobile projects."
  );
  test.skip(
    testInfo.project.name.includes("iphone"),
    "Unsupported-browser path is validated on non-iOS profile."
  );
  test.slow();

  await blockBeforeInstallPrompt(page);
  await openMainMenuFromCourse(page);
  await page.getByTestId("install-app-menu-action").click();
  const feedback = page.getByTestId("main-menu-install-feedback");
  await expect(feedback).toBeVisible();
  await expect(feedback).toHaveAttribute("role", "status");
  await expect(feedback).toHaveAttribute("aria-live", "polite");
  await expect(feedback).toHaveAttribute("data-feedback-tone", "warning");
  await expect(feedback).toContainText(UNSUPPORTED_BROWSER_MESSAGE);
  await expect(page.getByTestId("install-app-menu-action")).toHaveAttribute(
    "aria-describedby",
    "main-menu-install-feedback"
  );
});

test("main menu announces native install dismissal as local feedback", async ({
  page,
}, testInfo) => {
  test.skip(
    !isMobileProject(testInfo),
    "Install prompt mobile drawer flow is validated on mobile projects."
  );
  test.slow();

  await openMainMenuFromCourse(page);
  await dispatchInstallPromptEvent(page, "dismissed");
  await page.getByTestId("install-app-menu-action").click();

  const feedback = page.getByTestId("main-menu-install-feedback");
  await expect(feedback).toBeVisible();
  await expect(feedback).toHaveAttribute("role", "status");
  await expect(feedback).toHaveAttribute("data-feedback-tone", "info");
  await expect(feedback).toContainText("No problem. You can install any time from this menu.");
});

test("main menu shows iOS install instructions on iPhone profile", async ({ page }, testInfo) => {
  test.skip(
    !isMobileProject(testInfo),
    "Install prompt mobile drawer flow is validated on mobile projects."
  );
  test.skip(!testInfo.project.name.includes("iphone"), "iOS-only path.");
  test.slow();

  await blockBeforeInstallPrompt(page);
  await openMainMenuFromCourse(page);
  await page.getByTestId("install-app-menu-action").click();

  const guide = page.getByTestId("main-menu-install-ios-guide");
  await expect(guide).toBeVisible();
  await expect(guide).toHaveAttribute("role", "status");
  await expect(guide).toHaveAttribute("aria-live", "polite");
  await expect(guide).toHaveAttribute("data-feedback-tone", "info");
  await expect(guide).toContainText("Install on iPhone/iPad");
  await expect(guide).toContainText("Add to Home Screen");
  await expect(page.getByTestId("install-app-menu-action")).toHaveAttribute(
    "aria-describedby",
    "main-menu-install-ios-guide"
  );
});

test("main menu shows Mac Safari instructions for Safari-on-mac fallback", async ({
  page,
}, testInfo) => {
  test.skip(
    !isMobileProject(testInfo),
    "Install prompt mobile drawer flow is validated on mobile projects."
  );
  test.skip(
    testInfo.project.name.includes("iphone"),
    "Mac Safari fallback validation runs on non-iOS profile."
  );
  test.slow();

  await page.addInitScript(() => {
    const overrideNavigator = (
      property: "userAgent" | "platform" | "maxTouchPoints",
      value: string | number
    ) => {
      try {
        Object.defineProperty(window.navigator, property, {
          configurable: true,
          get: () => value,
        });
        return;
      } catch {}

      try {
        Object.defineProperty(Object.getPrototypeOf(window.navigator), property, {
          configurable: true,
          get: () => value,
        });
      } catch {}
    };

    overrideNavigator(
      "userAgent",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15"
    );
    overrideNavigator("platform", "MacIntel");
    overrideNavigator("maxTouchPoints", 0);

    const originalAddEventListener = window.addEventListener.bind(window);
    Object.defineProperty(window, "addEventListener", {
      configurable: true,
      value: (
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
      ) => {
        if (type === "beforeinstallprompt") return;
        originalAddEventListener(type, listener, options);
      },
    });
  });

  await openMainMenuFromCourse(page);
  await page.getByTestId("install-app-menu-action").click();
  const guide = page.getByTestId("main-menu-install-mac-safari-guide");
  await expect(guide).toBeVisible();
  await expect(guide).toHaveAttribute("role", "status");
  await expect(guide).toHaveAttribute("aria-live", "polite");
  await expect(guide).toHaveAttribute("data-feedback-tone", "info");
  await expect(guide).toContainText("Install on Mac (Safari)");
  await expect(guide).toContainText("Open File in Safari.");
  await expect(guide).toContainText("Choose Add to Dock.");
  await expect(guide).toContainText("Click Add.");
  await expect(page.getByTestId("install-app-menu-action")).toHaveAttribute(
    "aria-describedby",
    "main-menu-install-mac-safari-guide"
  );
});

test("first successful mark-as-done can trigger contextual install prompt once", async ({
  page,
}, testInfo) => {
  test.skip(
    !isMobileProject(testInfo),
    "Install prompt mobile drawer flow is validated on mobile projects."
  );
  test.slow();

  await gotoInstallPromptLesson(page);
  const markDoneButton = page.getByTestId("course-mark-done-button");
  await expect(markDoneButton).toBeVisible();
  await dismissSwipeHintIfPresent(page);

  await primeInstallPrompt(page, "dismissed");

  await satisfyDoneGateIfPresent(page);
  await activateMarkDoneButton(page);

  const prompt = page.getByTestId("a2hs-auto-prompt");
  try {
    await expect(prompt).toBeVisible({ timeout: 3_500 });
  } catch {
    await dispatchInstallPromptEvent(page, "dismissed");
    await expect(prompt).toBeVisible({ timeout: 8_000 });
  }
  await expect(prompt.locator(".fs-library-card")).toBeVisible();
  await expect(prompt.getByRole("button", { name: "Install app" })).toHaveClass(/fs-cta-primary/);
  await expect(prompt.getByRole("button", { name: "Not now" })).toHaveClass(/fs-cta-secondary/);

  await page.getByRole("button", { name: "Not now" }).click();
  await expect(prompt).toBeHidden();
  await waitForInstallDismissalPersistence(page);

  const courseMarkDoneButton = page.getByTestId("course-mark-done-button");
  await courseMarkDoneButton.click();
  await expect(courseMarkDoneButton).toHaveText("Mark as done");
  await activateMarkDoneButton(page);
  await page.waitForTimeout(1_900);
  await expect(prompt).toBeHidden();
});

test("contextual install prompt shows success confirmation after accepted install", async ({
  page,
}, testInfo) => {
  test.skip(
    !isMobileProject(testInfo),
    "Install prompt mobile drawer flow is validated on mobile projects."
  );
  test.slow();

  await gotoInstallPromptLesson(page);
  const markDoneButton = page.getByTestId("course-mark-done-button");
  await expect(markDoneButton).toBeVisible();
  await dismissSwipeHintIfPresent(page);

  await primeInstallPrompt(page, "accepted");
  await satisfyDoneGateIfPresent(page);
  await activateMarkDoneButton(page);

  const prompt = page.getByTestId("a2hs-auto-prompt");
  try {
    await expect(prompt).toBeVisible({ timeout: 3_500 });
  } catch {
    await dispatchInstallPromptEvent(page, "accepted");
    await expect(prompt).toBeVisible({ timeout: 8_000 });
  }
  await expect(prompt.locator(".fs-library-card")).toBeVisible();
  const installButton = prompt.getByRole("button", { name: "Install app" });
  await expect(installButton).toHaveClass(/fs-cta-primary/);
  // Re-prime right before click to avoid losing deferredPrompt in slower iOS CI runs.
  await dispatchInstallPromptEvent(page, "accepted");
  await page.waitForTimeout(80);
  await installButton.click();
  const feedback = page.getByTestId("course-install-prompt-feedback");
  await expect(feedback).toBeVisible({ timeout: 8_000 });
  await expect(feedback).toHaveAttribute("role", "status");
  await expect(feedback).toHaveAttribute("aria-live", "polite");
  await expect(feedback).toHaveAttribute("data-feedback-tone", "success");
  await expect(feedback).toContainText(INSTALL_SUCCESS_MESSAGE);
  await expect(feedback).toHaveClass(/rounded-\[var\(--fs-radius-card\)\]/);

  const doneButton = prompt.getByRole("button", { name: "Done" });
  await expect(doneButton).toHaveClass(/fs-cta-primary/);
  await doneButton.click();
  await expect(prompt).toBeHidden();
});

test("guest sees free-account backup prompt after completing three lessons", async ({
  page,
}, testInfo) => {
  test.skip(
    !isMobileProject(testInfo),
    "Progress backup prompt flow is validated on mobile projects."
  );
  test.slow();

  await page.addInitScript(() => {
    localStorage.removeItem("a2hs_prompt_seen");
    localStorage.setItem("a2hs_dismissed_at", String(Date.now()));
    localStorage.removeItem("fs_course_done_lessons");
    localStorage.removeItem("fs_course_backup_prompt_dismissed_at");
  });
  await gotoInstallPromptLesson(page);
  await dismissSwipeHintIfPresent(page);

  await satisfyDoneGateIfPresent(page);
  await activateMarkDoneButton(page);
  await goToNextLesson(page);

  await satisfyDoneGateIfPresent(page);
  await activateMarkDoneButton(page);
  await goToNextLesson(page);

  await satisfyDoneGateIfPresent(page);
  await activateMarkDoneButton(page);

  const backupPrompt = page.getByTestId("course-backup-prompt");
  await expect(backupPrompt).toBeVisible({ timeout: 10_000 });
  await expect(backupPrompt.locator(".fs-library-card.fs-library-card-accent")).toBeVisible();
  const createAccountLink = backupPrompt.getByRole("link", { name: "Create free account" });
  await expect(createAccountLink).toBeVisible();
  await expect(createAccountLink).toHaveClass(/fs-cta-primary/);
  const activeLessonId = await page
    .getByTestId("course-page")
    .getAttribute("data-active-lesson-id");
  expect(activeLessonId).toBeTruthy();
  await expect(createAccountLink).toHaveAttribute(
    "href",
    `/auth/sign-in?next=%2Fcourse%3Flesson%3D${encodeURIComponent(activeLessonId ?? "")}`
  );
  await expect(backupPrompt.getByRole("button", { name: "Maybe later" })).toHaveClass(
    /fs-cta-secondary/
  );
  await backupPrompt.getByRole("button", { name: "Maybe later" }).click();
  await expect(backupPrompt).toBeHidden();
});
