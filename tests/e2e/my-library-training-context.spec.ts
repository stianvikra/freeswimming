import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Training context e2e is desktop-only.");
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

async function waitForTrainingContextClientReady(page: Page) {
  await expect(page.getByTestId("training-context-hub")).toHaveAttribute(
    "data-client-ready",
    "true"
  );
}

async function waitForGoalsHubClientReady(page: Page) {
  await expect(page.getByTestId("goals-hub")).toHaveAttribute("data-client-ready", "true");
}

test.describe("my library training context", () => {
  test("opens focus workflow from goals with goal context prefilled", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    await loginToMyLibraryViaDevBypass(page);
    await page.goto("/my-library/goals", { waitUntil: "domcontentloaded", timeout: 60_000 });
    await expect(page.getByRole("heading", { name: "Goals", level: 1 })).toBeVisible();
    await waitForGoalsHubClientReady(page);

    let createdGoalTitle: string | null = null;
    let useAsFocusLink = page.getByRole("link", { name: "Use as focus" }).first();

    if ((await useAsFocusLink.count()) === 0) {
      const browseTemplatesButton = page.getByRole("button", { name: "Browse templates" });
      if ((await browseTemplatesButton.count()) > 0) {
        await browseTemplatesButton.click();
      }
      createdGoalTitle = "1000m under 10:00";
      const createGoalResponse = page.waitForResponse(
        (response) =>
          response.request().method() === "POST" &&
          response.url().includes("/api/goals") &&
          response.ok()
      );
      await page
        .locator("article")
        .filter({ hasText: createdGoalTitle })
        .getByRole("button", { name: "Use template" })
        .click();
      await createGoalResponse;

      useAsFocusLink = page
        .locator("article")
        .filter({ hasText: createdGoalTitle })
        .getByRole("link", {
          name: "Use as focus",
        });
    }

    await expect(useAsFocusLink).toBeVisible();
    const href = await useAsFocusLink.getAttribute("href");
    expect(href).toBeTruthy();

    const goalId = new URL(href!, "http://127.0.0.1:3000").searchParams.get("goalId");
    expect(goalId).toBeTruthy();

    const goalCard = page.getByTestId(`goal-card-${goalId}`);
    const goalTitle = (await goalCard.getByRole("heading").first().textContent())?.trim() ?? "";
    expect(goalTitle.length).toBeGreaterThan(0);

    await useAsFocusLink.click();
    const navigatedAfterClick = await page
      .waitForURL(/\/my-library\/training\?goalId=.*intent=focus/, { timeout: 7_000 })
      .then(() => true)
      .catch(() => false);
    if (!navigatedAfterClick) {
      await page.goto(href!, { waitUntil: "domcontentloaded", timeout: 60_000 });
      await expect(page).toHaveURL(/\/my-library\/training\?goalId=.*intent=focus/);
    }

    await expect(
      page.getByRole("heading", {
        name: "Focus & Notes",
        level: 1,
      })
    ).toBeVisible();
    await waitForTrainingContextClientReady(page);

    await expect(page.getByTestId("training-context-selected-goal")).toContainText(goalTitle);
    await expect(page.getByTestId("training-focus-goal-select")).toHaveValue(goalId!);
    await expect(page.getByTestId("training-note-goal-select")).toHaveValue(goalId!);

    await page.getByTestId(`training-goal-context-use-note-${goalId}`).click();
    await expect(page.getByTestId("training-note-goal-select")).toHaveValue(goalId!);

    if (createdGoalTitle) {
      await page.goto("/my-library/goals", { waitUntil: "domcontentloaded", timeout: 60_000 });
      await waitForGoalsHubClientReady(page);
      const archiveGoalResponse = page.waitForResponse(
        (response) =>
          response.request().method() === "PATCH" &&
          response.url().includes(`/api/goals/${goalId}`) &&
          response.ok()
      );
      await page
        .getByTestId(`goal-card-${goalId}`)
        .getByRole("button", { name: "Archive" })
        .click();
      await archiveGoalResponse;
    }
  });
});
