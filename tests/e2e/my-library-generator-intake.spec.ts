import type { APIRequestContext, APIResponse, Page } from "@playwright/test";
import { expect, request as playwrightRequest, test } from "@playwright/test";
import {
  clickHrefAndAwaitUrlOrRetryGoto,
  gotoWithTransientRetry,
  prewarmRoute,
  waitForRouteToSettle,
} from "./utils/transient-navigation";
import { collectHydrationConsoleMessages } from "./utils/hydration-console";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";
const transientResponseStatuses = new Set([404]);

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Generator intake e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

async function loginToMyLibraryViaDevBypass(page: Page) {
  const loginHref = `/dev/login?next=${encodeURIComponent("/my-library")}`;
  const loginProbe = await prewarmRoute(page, loginHref);
  if (!loginProbe || loginProbe.status() >= 500) {
    test.skip(true, "Dev auth bypass is not reachable in this environment.");
  }

  await gotoWithTransientRetry(page, loginHref);
  const pathAfterLogin = new URL(page.url()).pathname;

  if (pathAfterLogin !== "/my-library") {
    test.skip(true, "Dev auth bypass is not enabled in this environment.");
  }

  await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
}

async function ensureDevBypassRoute(page: Page, expectedPath: string) {
  const currentPath = new URL(page.url()).pathname;

  if (currentPath === expectedPath) {
    return;
  }

  if (currentPath === "/auth/sign-in") {
    const loginHref = `/dev/login?next=${encodeURIComponent(expectedPath)}`;
    const loginProbe = await prewarmRoute(page, loginHref);
    if (!loginProbe || loginProbe.status() >= 500) {
      test.skip(true, "Dev auth bypass is not reachable in this environment.");
    }

    await gotoWithTransientRetry(page, loginHref);
    const pathAfterRelogin = new URL(page.url()).pathname;

    if (pathAfterRelogin !== expectedPath) {
      test.skip(true, "Dev auth bypass is not enabled in this environment.");
    }

    return;
  }

  throw new Error(`Expected route ${expectedPath}, received ${currentPath}.`);
}

async function createAuthenticatedRequestContext(page: Page): Promise<APIRequestContext> {
  return playwrightRequest.newContext({
    baseURL: new URL(page.url()).origin,
    storageState: await page.context().storageState(),
  });
}

async function sendWithTransientRetry(send: () => Promise<APIResponse>) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await send();
      if (!transientResponseStatuses.has(response.status()) || attempt === 3) {
        return response;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isTransientNetworkError =
        /timeout|Request context disposed|ECONNREFUSED|ECONNRESET|ENOTFOUND|EAI_AGAIN|socket hang up/i.test(
          errorMessage
        );
      if (!isTransientNetworkError || attempt === 3) {
        throw error;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  throw new Error("Transient retry exhausted.");
}

async function prewarmSessionDraftRoute(page: Page) {
  const authenticatedRequest = await createAuthenticatedRequestContext(page);

  try {
    const response = await sendWithTransientRetry(() =>
      authenticatedRequest.post("/api/my-library/generator/session-draft", {
        headers: {
          "content-type": "application/json",
        },
        data: JSON.stringify({
          overrides: {
            targetType: "program",
          },
        }),
      })
    );

    expect(response.status()).toBe(422);
  } finally {
    await authenticatedRequest.dispose();
  }
}

async function waitForGeneratorIntakeClientReady(page: Page) {
  await expect(page.getByTestId("generator-intake-hub")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("generator-intake-hub")).toHaveAttribute(
    "data-client-ready",
    "true",
    {
      timeout: 15_000,
    }
  );
  await expect(page.getByTestId("session-generator-focus-text")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("session-generator-generate")).toBeVisible({ timeout: 15_000 });
}

async function waitForWorkoutBuilderClientReady(page: Page) {
  await waitForRouteToSettle(page);
  await expect
    .poll(
      async () => await page.getByTestId("workout-builder-hub").getAttribute("data-client-ready"),
      {
        timeout: 30_000,
      }
    )
    .toBe("true");
  await expect(page.getByTestId("workout-editor-metadata-toggle")).toBeVisible({
    timeout: 15_000,
  });
}

async function ensureWorkoutMetadataOpen(page: Page) {
  const metadataToggle = page.getByTestId("workout-editor-metadata-toggle");
  await expect(metadataToggle).toBeVisible({ timeout: 15_000 });
  await expect(metadataToggle).toBeEnabled({ timeout: 15_000 });
  await metadataToggle.scrollIntoViewIfNeeded();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if ((await metadataToggle.getAttribute("aria-expanded")) === "true") {
      break;
    }

    await metadataToggle.click();
    await page.waitForTimeout(250);

    const opened = await page
      .getByTestId("session-draft-title")
      .isVisible()
      .catch(() => false);
    if (opened) {
      break;
    }
  }

  await expect(metadataToggle).toHaveAttribute("aria-expanded", "true", { timeout: 15_000 });
  await expect(page.getByTestId("session-draft-title")).toBeVisible({ timeout: 15_000 });
}

async function openAdvancedToolsIfCollapsed(page: Page) {
  const toggle = page.getByTestId("workout-editor-support-tools-toggle");
  await expect(toggle).toBeVisible({ timeout: 15_000 });

  if ((await toggle.getAttribute("aria-expanded")) === "false") {
    await toggle.click();
  }

  await expect(toggle).toHaveAttribute("aria-expanded", "true");
}

async function waitForWorkoutLibraryBrowseReady(page: Page) {
  await waitForRouteToSettle(page);
  await expect(page.getByTestId("workout-builder-hub")).toBeVisible({ timeout: 15_000 });
  await expect(
    page.getByRole("heading", {
      name: "My Swim Sessions",
      level: 1,
    })
  ).toBeVisible({ timeout: 15_000 });
}

async function openGeneratorFromMyLibrary(page: Page) {
  const openGeneratorLink = page.getByRole("link", { name: "AI session generator" });
  await expect(openGeneratorLink).toBeVisible({ timeout: 15_000 });
  await expect(openGeneratorLink).toHaveAttribute("href", "/my-library/generator");
  const href = (await openGeneratorLink.getAttribute("href")) ?? "";
  expect(href).toBe("/my-library/generator");
  await prewarmRoute(page, href, 90_000);
  await clickHrefAndAwaitUrlOrRetryGoto({
    page,
    trigger: openGeneratorLink,
    href,
    expectedUrl: /\/my-library\/generator$/,
    clickNavigationTimeoutMs: 7_000,
  });
  await ensureDevBypassRoute(page, "/my-library/generator");

  await expect(page).toHaveURL(/\/my-library\/generator$/);
}

test.describe("my library generator intake", () => {
  test("opens the AI generator with saved-library context and session-only settings", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();
    testInfo.setTimeout(240_000);

    await loginToMyLibraryViaDevBypass(page);
    await openGeneratorFromMyLibrary(page);
    await expect(
      page.getByRole("heading", {
        name: "AI session generator",
        level: 1,
      })
    ).toBeVisible();
    await waitForGeneratorIntakeClientReady(page);

    await expect(
      page.getByRole("heading", { name: "Saved My Library details", level: 2 })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Session notes and setup", level: 3 })
    ).toBeVisible();
    await expect(page.getByTestId("generator-intake-session-count")).toHaveCount(0);
    await expect(page.getByTestId("generator-intake-target-program")).toHaveCount(0);
    await page.getByTestId("session-generator-focus-text").fill("Race-pace breathing control");
    await page
      .getByTestId("session-generator-constraint-text")
      .fill("Keep the first week moderate.");
    const sourceToggle = page.getByTestId("generator-intake-source-toggle");
    await expect(sourceToggle).toHaveAttribute("aria-expanded", "false");
    await sourceToggle.scrollIntoViewIfNeeded();
    await sourceToggle.click();
    await expect(sourceToggle).toHaveAttribute("aria-expanded", "true", { timeout: 15_000 });

    await expect(page.getByRole("heading", { name: "Athlete profile", level: 3 })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole("link", { name: "Edit athlete profile" })).toBeVisible({
      timeout: 15_000,
    });
  });

  test("accepts one generated session draft and reopens it in the workout builder route", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();
    testInfo.setTimeout(240_000);
    const uniqueTitle = `QA accepted workout ${Date.now()}`;

    await loginToMyLibraryViaDevBypass(page);
    const hydrationConsoleMessages = collectHydrationConsoleMessages(page);
    await openGeneratorFromMyLibrary(page);
    await waitForGeneratorIntakeClientReady(page);

    await page.getByTestId("session-generator-focus-text").fill("Breathing timing under fatigue");
    await prewarmSessionDraftRoute(page);

    const generateResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/my-library/generator/session-draft") &&
        response.request().method() === "POST" &&
        response.status() === 200
    );

    await page.getByTestId("session-generator-generate").click();
    await generateResponsePromise;

    const titleInput = page.getByTestId("session-draft-title");
    await expect(titleInput).toBeVisible();
    await titleInput.fill("QA edited session draft");

    await page.getByTestId("session-draft-step-toggle-0").click();
    const firstStepName = page.getByTestId("session-draft-step-name-0");
    await firstStepName.fill("QA warmup block");
    await titleInput.fill(uniqueTitle);

    await expect(page.getByTestId("session-generator-draft-preview")).toContainText(uniqueTitle);
    await expect(page.getByTestId("session-generator-draft-preview")).toContainText(
      "QA warmup block"
    );

    const saveButton = page.getByTestId("session-generator-save");
    const canonicalSaveUnavailable = await saveButton.isDisabled().catch(() => false);

    if (canonicalSaveUnavailable) {
      await expect(
        page.getByText(
          "Saving to My Swim Sessions is still syncing in this environment. You can generate and review a session here, but Save to My Swim Sessions stays unavailable until sync finishes."
        )
      ).toBeVisible();
      return;
    }

    const saveResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/my-library/workouts") &&
        response.request().method() === "POST" &&
        response.status() === 200
    );

    await saveButton.click();
    await saveResponsePromise;

    await expect(page.getByText("Session saved to My Swim Sessions.")).toBeVisible();

    const openSessionsLink = page.getByRole("link", { name: "My Swim Sessions" });
    await openSessionsLink.click();
    await page.waitForURL(/\/my-library\/workouts$/);
    await waitForWorkoutLibraryBrowseReady(page);

    const targetWorkoutCard = page.getByTestId(/saved-workout-card-/).filter({
      has: page.getByText(uniqueTitle, { exact: true }),
    });
    await expect(targetWorkoutCard).toBeVisible();
    const openWorkoutLink = targetWorkoutCard.getByRole("link", { name: "Open" });
    await expect(openWorkoutLink).toBeVisible();
    const workoutHref = await openWorkoutLink.getAttribute("href");
    expect(workoutHref).toBeTruthy();
    await clickHrefAndAwaitUrlOrRetryGoto({
      page,
      trigger: openWorkoutLink,
      href: workoutHref!,
      expectedUrl: /\/my-library\/workouts\/[0-9a-f-]+$/,
      clickNavigationTimeoutMs: 10_000,
    });
    await expect(page).toHaveURL(/\/my-library\/workouts\/[0-9a-f-]+$/);

    await waitForWorkoutBuilderClientReady(page);
    await expect(
      page.getByRole("heading", { name: "Pool session builder", level: 1 })
    ).toBeVisible();
    await ensureWorkoutMetadataOpen(page);
    await expect(page.getByTestId("session-draft-title")).toHaveValue(uniqueTitle);

    await page
      .getByTestId("session-draft-description")
      .fill("Edited in the dedicated workout builder route.");

    const patchResponsePromise = page.waitForResponse(
      (response) =>
        /\/api\/my-library\/workouts\/[0-9a-f-]+$/.test(response.url()) &&
        response.request().method() === "PATCH" &&
        response.status() === 200
    );

    await page.getByTestId("workout-builder-save").click();
    await patchResponsePromise;

    await expect(page.getByText("Changes saved to this session.")).toBeVisible();
    await expect(page.getByTestId("workout-editor-support-tools-toggle")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    await expect(page.getByTestId("session-generator-draft-preview")).toHaveCount(0);
    await openAdvancedToolsIfCollapsed(page);
    await expect(page.getByTestId("session-generator-draft-preview")).toContainText(
      "Edited in the dedicated workout builder route."
    );
    expect(hydrationConsoleMessages).toEqual([]);
  });
});
