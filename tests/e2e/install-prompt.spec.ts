import { expect, test, type Page } from "@playwright/test";

const UNSUPPORTED_BROWSER_MESSAGE =
  "Install is not available in this browser yet. For best support, use Safari, Chrome, or Edge.";
const INSTALL_SUCCESS_MESSAGE =
  "App installed. You can open FreeSwimming from your Dock, Start menu, or home screen.";

async function openMainMenuFromCourse(page: Page) {
  await page.goto("/course?lesson=mod3-l1");
  await page.getByTestId("course-nav-lessons").click();
  await page.getByRole("button", { name: "Menu", exact: true }).click();
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

async function primeInstallPrompt(page: Page, outcome: "accepted" | "dismissed") {
  await page.evaluate((chosenOutcome) => {
    localStorage.removeItem("a2hs_prompt_seen");
    localStorage.removeItem("a2hs_dismissed_at");
    localStorage.removeItem("fs_course_done_lessons");

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
  await page.waitForTimeout(120);
}

test("main menu exposes a persistent install action", async ({ page }) => {
  await openMainMenuFromCourse(page);
  await expect(page.getByTestId("install-app-menu-action")).toBeVisible();
});

test("main menu shows unsupported-browser guidance when install path is unavailable", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name.includes("iphone"),
    "Unsupported-browser path is validated on non-iOS profile."
  );

  await blockBeforeInstallPrompt(page);
  await openMainMenuFromCourse(page);
  await page.getByTestId("install-app-menu-action").click();
  await expect(page.getByText(UNSUPPORTED_BROWSER_MESSAGE)).toBeVisible();
});

test("main menu shows iOS install instructions on iPhone profile", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("iphone"), "iOS-only path.");

  await blockBeforeInstallPrompt(page);
  await openMainMenuFromCourse(page);
  await page.getByTestId("install-app-menu-action").click();

  await expect(page.getByText("Install on iPhone/iPad")).toBeVisible();
  await expect(page.getByText("Add to Home Screen")).toBeVisible();
});

test("main menu shows Mac Safari instructions for Safari-on-mac fallback", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name.includes("iphone"),
    "Mac Safari fallback validation runs on non-iOS profile."
  );

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
  await expect(page.getByText("Install on Mac (Safari)")).toBeVisible();
  await expect(page.getByText("Open File in Safari.")).toBeVisible();
  await expect(page.getByText("Choose Add to Dock.")).toBeVisible();
  await expect(page.getByText("Click Add.")).toBeVisible();
});

test("first successful mark-as-done can trigger contextual install prompt once", async ({
  page,
}) => {
  await page.goto("/course?lesson=mod3-l1");
  const markDoneButton = page.getByRole("button", { name: "Mark as done" });
  await expect(markDoneButton).toBeVisible();

  await primeInstallPrompt(page, "dismissed");

  await markDoneButton.click();

  const prompt = page.getByTestId("a2hs-auto-prompt");
  await expect(prompt).toBeVisible({ timeout: 4_500 });

  await page.getByRole("button", { name: "Not now" }).click();
  await expect(prompt).toBeHidden();

  await page.getByRole("button", { name: "Done" }).click();
  await page.getByRole("button", { name: "Mark as done" }).click();
  await page.waitForTimeout(1_900);
  await expect(prompt).toBeHidden();
});

test("contextual install prompt shows success confirmation after accepted install", async ({
  page,
}) => {
  await page.goto("/course?lesson=mod3-l1");
  const markDoneButton = page.getByRole("button", { name: "Mark as done" });
  await expect(markDoneButton).toBeVisible();

  await primeInstallPrompt(page, "accepted");
  await markDoneButton.click();

  const prompt = page.getByTestId("a2hs-auto-prompt");
  await expect(prompt).toBeVisible({ timeout: 4_500 });
  await page.getByRole("button", { name: "Install app" }).click();
  await expect(page.getByText(INSTALL_SUCCESS_MESSAGE)).toBeVisible();

  await prompt.getByRole("button", { name: "Done" }).click();
  await expect(prompt).toBeHidden();
});
