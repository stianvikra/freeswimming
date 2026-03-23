import type { APIRequestContext, APIResponse, Page } from "@playwright/test";
import { expect, request as playwrightRequest, test } from "@playwright/test";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";
const transientResponseStatuses = new Set([404]);

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Generator intake e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

async function loginToMyLibraryViaDevBypass(page: Page) {
  await page.goto(`/dev/login?next=${encodeURIComponent("/my-library")}`);
  const pathAfterLogin = new URL(page.url()).pathname;

  if (pathAfterLogin !== "/my-library") {
    test.skip(true, "Dev auth bypass is not enabled in this environment.");
  }

  await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
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
  await expect(page.getByTestId("generator-intake-hub")).toHaveAttribute(
    "data-client-ready",
    "true",
    { timeout: 15_000 }
  );
}

async function waitForWorkoutBuilderClientReady(page: Page) {
  await expect(page.getByTestId("workout-builder-hub")).toHaveAttribute(
    "data-client-ready",
    "true",
    { timeout: 15_000 }
  );
}

test.describe("my library generator intake", () => {
  test("opens generator intake and prepares a deterministic handoff", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();

    await loginToMyLibraryViaDevBypass(page);
    const openGeneratorLink = page.getByRole("link", { name: "Open generator" });
    await expect(openGeneratorLink).toBeVisible();
    await expect(openGeneratorLink).toHaveAttribute("href", "/my-library/generator");
    await openGeneratorLink.click();
    const navigatedAfterClick = await page
      .waitForURL(/\/my-library\/generator$/, { timeout: 7_000 })
      .then(() => true)
      .catch(() => false);
    if (!navigatedAfterClick) {
      const href = await openGeneratorLink.getAttribute("href");
      expect(href).toBeTruthy();
      await page.goto(href!, { waitUntil: "domcontentloaded", timeout: 60_000 });
      await expect(page).toHaveURL(/\/my-library\/generator$/);
    }
    await expect(
      page.getByRole("heading", {
        name: "Generator intake",
        level: 1,
      })
    ).toBeVisible();
    await waitForGeneratorIntakeClientReady(page);

    await expect(
      page.getByText("Notes stay out of default generator prefill in v1.", { exact: false })
    ).toBeVisible();

    await page.getByTestId("generator-intake-target-program").check();
    await page.getByTestId("generator-intake-session-count").fill("4");
    await page.getByTestId("generator-intake-session-minutes").selectOption("45");
    await page.getByTestId("generator-intake-focus-text").fill("Race-pace breathing control");
    await page
      .getByTestId("generator-intake-constraint-text")
      .fill("Keep the first week moderate.");
    await page.getByTestId("generator-intake-prepare").click();

    await expect(page.getByText("Generator handoff prepared for the next slice.")).toBeVisible();
    await expect(page.getByTestId("generator-intake-handoff-preview")).toContainText(
      '"targetType": "program"'
    );
    await expect(page.getByTestId("generator-intake-handoff-preview")).toContainText(
      '"notesIncluded": false'
    );
  });

  test("accepts one generated session draft and reopens it in the workout builder route", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();
    const uniqueTitle = `QA accepted workout ${Date.now()}`;

    await loginToMyLibraryViaDevBypass(page);
    await page.goto("/my-library/generator", { waitUntil: "domcontentloaded", timeout: 60_000 });
    await expect(page).toHaveURL(/\/my-library\/generator$/);
    await waitForGeneratorIntakeClientReady(page);

    await page.getByTestId("generator-intake-target-session").check();
    await page.getByTestId("generator-intake-prepare").click();
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

    const saveResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/my-library/workouts") &&
        response.request().method() === "POST" &&
        response.status() === 200
    );

    await page.getByTestId("session-generator-save").click();
    await saveResponsePromise;

    await expect(
      page.getByText("Workout accepted and saved as a canonical session.")
    ).toBeVisible();
    await expect(page.getByText("Accepted workout loaded.")).toBeVisible();

    await page.getByRole("link", { name: "Start new draft" }).click();
    await page.waitForURL(/\/my-library\/generator$/);
    await waitForGeneratorIntakeClientReady(page);

    const recentWorkouts = page.getByTestId("session-generator-recent-workouts");
    await expect(recentWorkouts).toContainText(uniqueTitle);
    const targetWorkoutTitle = recentWorkouts.getByText(uniqueTitle, { exact: true });
    await expect(targetWorkoutTitle).toBeVisible();
    const targetWorkoutCard = targetWorkoutTitle.locator("..").locator("..");
    const openWorkoutLink = targetWorkoutCard.getByRole("link", { name: "Open" });
    await expect(openWorkoutLink).toBeVisible();
    const workoutHref = await openWorkoutLink.getAttribute("href");
    expect(workoutHref).toBeTruthy();

    await openWorkoutLink.click();
    const navigatedAfterClick = await page
      .waitForURL(/\/my-library\/workouts\/[0-9a-f-]+$/, {
        timeout: 10_000,
        waitUntil: "domcontentloaded",
      })
      .then(() => true)
      .catch(() => false);
    if (!navigatedAfterClick) {
      await page.goto(workoutHref!, { waitUntil: "domcontentloaded", timeout: 60_000 });
      await expect(page).toHaveURL(/\/my-library\/workouts\/[0-9a-f-]+$/);
    }

    await waitForWorkoutBuilderClientReady(page);
    await expect(page.getByRole("heading", { name: "Workout builder", level: 1 })).toBeVisible();
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

    await expect(page.getByText("Workout changes saved to the canonical workout.")).toBeVisible();
    await expect(page.getByTestId("session-generator-draft-preview")).toContainText(
      "Edited in the dedicated workout builder route."
    );
  });
});
