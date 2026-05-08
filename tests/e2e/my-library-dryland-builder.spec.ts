import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { gotoWithTransientRetry, waitForRouteToSettle } from "./utils/transient-navigation";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Dryland builder e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

async function loginToMyLibraryViaDevBypass(page: Page) {
  await gotoWithTransientRetry(page, `/dev/login?next=${encodeURIComponent("/my-library")}`);
  const pathAfterLogin = new URL(page.url()).pathname;

  if (pathAfterLogin !== "/my-library") {
    test.skip(true, "Dev auth bypass is not enabled in this environment.");
  }

  await waitForRouteToSettle(page);
  await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
}

async function waitForDrylandBuilderClientReady(page: Page) {
  await waitForRouteToSettle(page);
  await expect
    .poll(
      async () => await page.getByTestId("dryland-builder-hub").getAttribute("data-client-ready"),
      {
        timeout: 30_000,
      }
    )
    .toBe("true");
}

test.describe("my library dryland builder", () => {
  test("shows the dryland surface and creates a session when the schema is available", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();
    testInfo.setTimeout(240_000);

    await loginToMyLibraryViaDevBypass(page);
    await expect(page.getByRole("heading", { name: "Dryland Sessions" })).toBeVisible();

    const createButton = page.getByTestId("my-library-create-strength-session");
    const schemaReady = await createButton.isVisible().catch(() => false);

    if (!schemaReady) {
      await expect(
        page.getByText("This dryland foundation is still syncing in this environment.")
      ).toBeVisible();
      return;
    }

    const createResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/api/my-library/dryland") &&
        response.request().method() === "POST" &&
        response.status() === 200
    );

    await expect(createButton).toHaveAttribute("data-client-ready", "true", {
      timeout: 15_000,
    });
    await createButton.click();
    const createResponse = await createResponsePromise;
    const createResponseBody = (await createResponse.json()) as {
      ok?: boolean;
      session?: { id?: string };
    };
    const createdSessionId = createResponseBody.session?.id;

    expect(createResponseBody.ok).toBe(true);
    expect(createdSessionId).toMatch(/^[0-9a-f-]+$/i);

    const targetUrl = new RegExp(`/my-library/dryland/${createdSessionId}$`);
    const navigatedAfterCreate = await page
      .waitForURL(targetUrl, {
        timeout: 10_000,
        waitUntil: "domcontentloaded",
      })
      .then(() => true)
      .catch(() => false);

    if (!navigatedAfterCreate) {
      await gotoWithTransientRetry(page, `/my-library/dryland/${createdSessionId}`, 60_000);
    }

    await expect(page).toHaveURL(targetUrl);
    await waitForDrylandBuilderClientReady(page);

    await expect(page.getByTestId("dryland-mode-build")).toHaveAttribute("aria-selected", "true");
    await expect(page.getByTestId("dryland-manual-exercises")).toBeVisible();
    await expect(page.getByTestId("dryland-advanced-bank")).toBeVisible();
    await expect(page.getByTestId("dryland-bank-add-strength-air-squat")).not.toBeVisible();

    await page.getByTestId("dryland-draft-title").fill(`QA dryland ${Date.now()}`);
    await page.getByTestId("dryland-manual-exercise-name-0").fill("Single-leg squat");
    await page.getByTestId("dryland-manual-exercise-set-count-0").fill("2");
    await page.getByTestId("dryland-manual-exercise-target-0").fill("6");
    await page.getByTestId("dryland-manual-exercise-rest-0").fill("75");
    await page.getByTestId("dryland-manual-exercise-load-0").fill("12.5");
    await page.getByTestId("dryland-manual-exercise-notes-0").fill("Control the knee line.");
    await page.getByTestId("dryland-draft-start-timer").click();
    await page.getByTestId("dryland-mode-train").click();
    await page.getByTestId("dryland-set-chip-0-0").click();
    const saveResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/my-library/dryland/${createdSessionId}`) &&
        response.request().method() === "PATCH" &&
        response.status() === 200
    );

    await page.getByTestId("dryland-builder-save").click();
    const saveResponse = await saveResponsePromise;
    const saveResponseBody = (await saveResponse.json()) as {
      ok?: boolean;
      session?: {
        draft?: {
          exercises?: Array<{
            source?: string;
            bankExerciseId?: string | null;
            title?: string;
            sets?: Array<{
              reps?: number | null;
              loadKg?: number | null;
              restSeconds?: number | null;
            }>;
          }>;
        };
      };
    };
    expect(saveResponseBody.ok).toBe(true);
    const savedExercise = saveResponseBody.session?.draft?.exercises?.[0];
    expect(savedExercise?.source).toBe("custom");
    expect(savedExercise?.bankExerciseId).toBeNull();
    expect(savedExercise?.title).toBe("Single-leg squat");
    expect(savedExercise?.sets).toHaveLength(2);
    expect(
      savedExercise?.sets?.every(
        (set) => set.reps === 6 && set.loadKg === 12.5 && set.restSeconds === 75
      )
    ).toBe(true);
    await expect(page.getByTestId("dryland-editor-save-state")).toHaveText(
      "All dryland changes are saved"
    );

    await gotoWithTransientRetry(page, `/my-library/dryland/${createdSessionId}`, 60_000);
    await waitForDrylandBuilderClientReady(page);
    await page.getByTestId("dryland-mode-build").click();
    await expect(page.getByTestId("dryland-manual-exercise-name-0")).toHaveValue(
      "Single-leg squat"
    );
    await expect(page.getByTestId("dryland-manual-exercise-set-count-0")).toHaveValue("2");

    await gotoWithTransientRetry(page, "/my-library/dryland", 60_000);
    await waitForDrylandBuilderClientReady(page);
    await expect(page.getByTestId("dryland-micro-plan-panel")).toBeVisible();

    const microSyncing = await page
      .getByText("Micro Sessions are still syncing in this environment.")
      .isVisible()
      .catch(() => false);

    if (!microSyncing) {
      const startButton = page.getByTestId(`dryland-micro-start-${createdSessionId}`);
      const startNextButton = page.getByTestId(`dryland-micro-start-next-${createdSessionId}`);
      const canStartFreshPlan =
        (await startButton.isVisible().catch(() => false)) ||
        (await startNextButton.isVisible().catch(() => false));

      if (canStartFreshPlan) {
        const startResponsePromise = page.waitForResponse(
          (response) =>
            response.url().includes("/api/my-library/dryland/micro-plans") &&
            response.request().method() === "POST" &&
            response.status() === 200
        );
        if (await startButton.isVisible().catch(() => false)) {
          await startButton.click();
        } else {
          await startNextButton.click();
        }
        await expect((await startResponsePromise).json()).resolves.toMatchObject({ ok: true });
      }

      await expect(page.getByRole("progressbar", { name: "Micro session progress" })).toBeVisible();

      for (let index = 0; index < 6; index += 1) {
        const completeButton = page.locator('[data-testid^="dryland-micro-complete-"]').first();
        if (!(await completeButton.isVisible().catch(() => false))) break;
        if (!(await completeButton.isEnabled().catch(() => false))) break;

        const completeResponsePromise = page.waitForResponse(
          (response) =>
            response.url().includes("/api/my-library/dryland/micro-plans/") &&
            response.request().method() === "PATCH" &&
            response.status() === 200
        );
        await completeButton.click();
        await expect((await completeResponsePromise).json()).resolves.toMatchObject({ ok: true });
      }
    }

    await gotoWithTransientRetry(page, `/my-library/dryland/${createdSessionId}`, 60_000);
    await waitForDrylandBuilderClientReady(page);
    await page.getByTestId("dryland-mode-train").click();

    await page.getByTestId("dryland-session-more").click();
    await page.getByTestId("dryland-delete-current-session").click();

    const deleteResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/api/my-library/dryland/${createdSessionId}`) &&
        response.request().method() === "DELETE" &&
        response.status() === 200
    );

    await page.getByTestId("dryland-confirm-delete-current-session").click();
    const deleteResponse = await deleteResponsePromise;
    const deleteResponseBody = (await deleteResponse.json()) as {
      ok?: boolean;
      deletedSessionId?: string;
    };
    expect(deleteResponseBody.ok).toBe(true);
    expect(deleteResponseBody.deletedSessionId).toBe(createdSessionId);

    const onDrylandBrowseRoute = /^\/my-library\/dryland(?:\?.*)?$/.test(
      new URL(page.url()).pathname + new URL(page.url()).search
    );
    const navigatedAfterDelete = onDrylandBrowseRoute
      ? true
      : await page
          .waitForURL(/\/my-library\/dryland(?:\?.*)?$/, {
            timeout: 20_000,
            waitUntil: "commit",
          })
          .then(() => true)
          .catch(() => false);

    if (!navigatedAfterDelete) {
      await gotoWithTransientRetry(page, "/my-library/dryland", 60_000);
    }

    await expect(page).toHaveURL(/\/my-library\/dryland(?:\?.*)?$/);
    await waitForDrylandBuilderClientReady(page);
  });
});
