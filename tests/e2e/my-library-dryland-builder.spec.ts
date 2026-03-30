import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Dryland builder e2e is desktop-only.");
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

async function waitForDrylandBuilderClientReady(page: Page) {
  await expect(page.getByTestId("dryland-builder-hub")).toHaveAttribute(
    "data-client-ready",
    "true",
    { timeout: 15_000 }
  );
}

test.describe("my library dryland builder", () => {
  test("shows the dryland surface and creates a session when the schema is available", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();

    await loginToMyLibraryViaDevBypass(page);
    await expect(page.getByRole("heading", { name: "Dryland builder" })).toBeVisible();

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
      await page.goto(`/my-library/dryland/${createdSessionId}`, {
        timeout: 60_000,
        waitUntil: "domcontentloaded",
      });
    }

    await expect(page).toHaveURL(targetUrl);
    await waitForDrylandBuilderClientReady(page);

    await page.getByTestId("dryland-draft-title").fill(`QA dryland ${Date.now()}`);
    await page.getByTestId("dryland-draft-start-timer").click();
    await page.getByTestId("dryland-add-custom-exercise").click();
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
    };
    expect(saveResponseBody.ok).toBe(true);
    await expect(page.getByTestId("dryland-editor-save-state")).toHaveText(
      "All dryland changes are saved"
    );

    await page.getByTestId("dryland-delete-current-session").click();
    await page.getByTestId("dryland-confirm-delete-current-session").click();
    await page.waitForURL("/my-library/dryland", {
      timeout: 10_000,
      waitUntil: "domcontentloaded",
    });
  });
});
