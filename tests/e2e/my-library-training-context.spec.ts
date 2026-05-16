import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { gotoWithTransientRetry, waitForRouteToSettle } from "./utils/transient-navigation";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Training context e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
  test.slow(
    projectName === "desktop-chromium",
    "Training context bridge flows can take longer under full desktop matrix load."
  );
}

async function loginToMyLibraryViaDevBypass(page: Page) {
  await gotoWithTransientRetry(page, `/dev/login?next=${encodeURIComponent("/my-library")}`);
  const pathAfterLogin = new URL(page.url()).pathname;

  if (pathAfterLogin !== "/my-library") {
    test.skip(true, "Dev auth bypass is not enabled in this environment.");
  }

  await expect(page.getByRole("heading", { name: "My Library" })).toBeVisible();
}

async function waitForTrainingContextClientReady(page: Page) {
  await waitForRouteToSettle(page);
  const hub = page.getByTestId("training-context-hub");
  const ready = await expect(hub)
    .toHaveAttribute("data-client-ready", "true", { timeout: 30_000 })
    .then(() => true)
    .catch(() => false);

  if (ready) {
    return;
  }

  await page.reload({ waitUntil: "domcontentloaded", timeout: 60_000 });
  await waitForRouteToSettle(page);
  await expect(hub).toHaveAttribute("data-client-ready", "true", { timeout: 45_000 });
}

async function waitForGoalsHubClientReady(page: Page) {
  await waitForRouteToSettle(page);
  await expect(page.getByTestId("goals-hub")).toHaveAttribute("data-client-ready", "true", {
    timeout: 30_000,
  });
}

type GoalBridgeSelection = {
  createdGoalTitle: string | null;
  focusHref: string;
  goalId: string;
  goalTitle: string;
  noteHref: string;
};

async function ensureGoalAvailableForBridge(page: Page): Promise<GoalBridgeSelection> {
  let createdGoalTitle: string | null = null;
  let useAsFocusLink = page.getByRole("link", { name: "Use as focus" }).first();

  if ((await useAsFocusLink.count()) === 0) {
    const firstDetailsButton = page.getByRole("button", { name: "Details" }).first();
    if ((await firstDetailsButton.count()) > 0) {
      await firstDetailsButton.click();
      useAsFocusLink = page.getByRole("link", { name: "Use as focus" }).first();
    }
  }

  if ((await useAsFocusLink.count()) === 0) {
    const useTemplateButton = page.getByRole("button", { name: "Use template" }).first();
    if ((await useTemplateButton.count()) === 0) {
      const addGoalButton = page.getByRole("button", { name: "Add goal" });
      if ((await addGoalButton.count()) > 0) {
        await addGoalButton.click();
      }
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

    const createdGoalCard = page.locator("article").filter({ hasText: createdGoalTitle }).first();
    await createdGoalCard.getByRole("button", { name: "Details" }).click();
    useAsFocusLink = page
      .getByTestId(/^goal-card-/)
      .filter({ hasText: createdGoalTitle })
      .getByRole("link", {
        name: "Use as focus",
      });
  }

  await expect(useAsFocusLink).toBeVisible();
  const focusHref = await useAsFocusLink.getAttribute("href");
  expect(focusHref).toBeTruthy();

  const goalId = new URL(focusHref!, "http://127.0.0.1:3000").searchParams.get("goalId");
  expect(goalId).toBeTruthy();

  const goalCard = page.getByTestId(`goal-card-${goalId}`);
  const goalTitle = (await goalCard.getByRole("heading").first().textContent())?.trim() ?? "";
  expect(goalTitle.length).toBeGreaterThan(0);

  const noteHref = await goalCard.getByRole("link", { name: "Add note" }).getAttribute("href");
  expect(noteHref).toBeTruthy();

  return {
    createdGoalTitle,
    focusHref: focusHref!,
    goalId: goalId!,
    goalTitle,
    noteHref: noteHref!,
  };
}

async function archiveCreatedGoalIfNeeded(
  page: Page,
  createdGoalTitle: string | null,
  goalId: string
) {
  if (!createdGoalTitle) return;

  await gotoWithTransientRetry(page, "/my-library/goals", 60_000);
  await waitForGoalsHubClientReady(page);
  const goalCard = page.getByTestId(`goal-card-${goalId}`);
  const detailsButton = goalCard.getByRole("button", { name: "Details" });
  if ((await detailsButton.getAttribute("aria-expanded")) !== "true") {
    await detailsButton.click();
  }
  const archiveGoalResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "PATCH" &&
      response.url().includes(`/api/goals/${goalId}`) &&
      response.ok()
  );
  await goalCard.getByRole("button", { name: "Archive" }).click();
  await archiveGoalResponse;
}

test.describe("my library training context", () => {
  test("overview cards jump to the matching goals, focus, and notes sections", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    testInfo.setTimeout(210_000);

    await loginToMyLibraryViaDevBypass(page);
    await gotoWithTransientRetry(page, "/my-library/training", 60_000);
    await expect(page.getByRole("heading", { name: "My Training", level: 1 })).toBeVisible();
    await waitForTrainingContextClientReady(page);

    await page.getByTestId("training-overview-card-goals").click();
    await expect(page).toHaveURL(/\/my-library\/training#training-goals-section$/);
    await expect(page.getByTestId("training-goals-section")).toBeVisible();

    await page.getByTestId("training-overview-card-focus").click();
    await expect(page).toHaveURL(/\/my-library\/training#training-focus-section$/);
    await expect(page.getByTestId("training-focus-section")).toBeVisible();

    await page.getByTestId("training-overview-card-notes").click();
    await expect(page).toHaveURL(/\/my-library\/training#training-notes-section$/);
    await expect(page.getByTestId("training-notes-section")).toBeVisible();
  });

  test("opens focus workflow from goals with goal context prefilled", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    testInfo.setTimeout(210_000);

    await loginToMyLibraryViaDevBypass(page);
    await gotoWithTransientRetry(page, "/my-library/goals", 60_000);
    await expect(page.getByRole("heading", { name: "Goals", level: 1 })).toBeVisible();
    await waitForGoalsHubClientReady(page);

    const { createdGoalTitle, focusHref, goalId, goalTitle } =
      await ensureGoalAvailableForBridge(page);

    await gotoWithTransientRetry(page, focusHref, 60_000);
    await expect(page).toHaveURL(/\/my-library\/training\?goalId=.*intent=focus/);

    await expect(
      page.getByRole("heading", {
        name: "My Training",
        level: 1,
      })
    ).toBeVisible();
    await waitForTrainingContextClientReady(page);

    await expect(page.getByTestId("training-context-selected-goal")).toContainText(goalTitle);
    await expect(page.getByTestId("training-focus-goal-select")).toHaveValue(goalId!);
    await expect(page.getByTestId("training-focus-form")).toHaveAttribute(
      "data-goal-intent-highlight",
      "true"
    );
    await expect(page.getByTestId("training-focus-intent-badge")).toBeVisible();
    await expect(page.getByTestId("training-note-form-toggle")).toBeVisible();

    await page.getByTestId(`training-goal-context-use-note-${goalId}`).click();
    await expect(page.getByTestId("training-note-goal-select")).toHaveValue(goalId!);
    await expect(page.getByTestId("training-note-form")).toHaveAttribute(
      "data-goal-intent-highlight",
      "true"
    );

    await archiveCreatedGoalIfNeeded(page, createdGoalTitle, goalId);
  });

  test("opens note workflow from goals with note intent highlighted", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    testInfo.setTimeout(210_000);

    await loginToMyLibraryViaDevBypass(page);
    await gotoWithTransientRetry(page, "/my-library/goals", 60_000);
    await expect(page.getByRole("heading", { name: "Goals", level: 1 })).toBeVisible();
    await waitForGoalsHubClientReady(page);

    const { createdGoalTitle, goalId, goalTitle, noteHref } =
      await ensureGoalAvailableForBridge(page);

    await gotoWithTransientRetry(page, noteHref, 60_000);
    await expect(page).toHaveURL(/\/my-library\/training\?goalId=.*intent=note/);

    await expect(
      page.getByRole("heading", {
        name: "My Training",
        level: 1,
      })
    ).toBeVisible();
    await waitForTrainingContextClientReady(page);

    await expect(page.getByTestId("training-context-selected-goal")).toContainText(goalTitle);
    await expect(page.getByTestId("training-note-goal-select")).toHaveValue(goalId);
    await expect(page.getByTestId("training-note-form")).toHaveAttribute(
      "data-goal-intent-highlight",
      "true"
    );
    await expect(page.getByTestId("training-note-intent-badge")).toBeVisible();
    await expect(page.getByText(/was selected from Goals for your next note\./i)).toBeVisible();
    if (
      (await page.getByTestId("training-focus-form-toggle").getAttribute("aria-expanded")) !==
      "true"
    ) {
      await page.getByTestId("training-focus-form-toggle").click();
    }
    await expect(page.getByTestId("training-focus-goal-select")).toHaveValue(goalId);

    await archiveCreatedGoalIfNeeded(page, createdGoalTitle, goalId);
  });

  test("keeps focus and note drafts when the composers are collapsed and reopened", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    await loginToMyLibraryViaDevBypass(page);
    await gotoWithTransientRetry(page, "/my-library/training", 60_000);
    await expect(page.getByRole("heading", { name: "My Training", level: 1 })).toBeVisible();
    await waitForTrainingContextClientReady(page);

    if (
      (await page.getByTestId("training-focus-form-toggle").getAttribute("aria-expanded")) !==
      "true"
    ) {
      await page.getByTestId("training-focus-form-toggle").click();
    }
    await page.getByLabel("Focus title").fill("Hold the line into the catch");
    await page.getByTestId("training-focus-form-toggle").click();
    await expect(page.getByText("Draft ready: Hold the line into the catch")).toBeVisible();
    await page.getByTestId("training-focus-form-toggle").click();
    await expect(page.getByLabel("Focus title")).toHaveValue("Hold the line into the catch");

    if (
      (await page.getByTestId("training-note-form-toggle").getAttribute("aria-expanded")) !== "true"
    ) {
      await page.getByTestId("training-note-form-toggle").click();
    }
    await page
      .getByRole("textbox", { name: "Observation" })
      .fill("Breathing stayed calmer after the second rep.");
    await page.getByTestId("training-note-form-toggle").click();
    await expect(
      page.getByText("Draft ready: Breathing stayed calmer after the second rep.")
    ).toBeVisible();
    await page.getByTestId("training-note-form-toggle").click();
    await expect(page.getByRole("textbox", { name: "Observation" })).toHaveValue(
      "Breathing stayed calmer after the second rep."
    );
  });
});
