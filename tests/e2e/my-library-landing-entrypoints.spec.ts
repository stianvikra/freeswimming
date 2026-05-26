import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";
import {
  gotoWithTransientRetry,
  prewarmRoute,
  waitForRouteToSettle,
} from "./utils/transient-navigation";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

async function loginViaDevBypass(page: Page, nextPath = "/my-library") {
  const loginHref = `/dev/login?next=${encodeURIComponent(nextPath)}`;
  const loginProbe = await prewarmRoute(page, loginHref);
  if (!loginProbe || loginProbe.status() >= 500) {
    test.skip(true, "Dev auth bypass is not reachable in this environment.");
  }

  await gotoWithTransientRetry(page, loginHref);
  const pathAfterLogin = new URL(page.url()).pathname;

  if (pathAfterLogin !== nextPath) {
    test.skip(true, "Dev auth bypass is not enabled in this environment.");
  }

  await waitForRouteToSettle(page);
}

async function loginToMyLibraryViaDevBypass(page: Page) {
  await loginViaDevBypass(page, "/my-library");
  const libraryHeading = page.getByRole("heading", { name: "My Library" });
  const libraryReady = await libraryHeading.isVisible({ timeout: 15_000 }).catch(() => false);

  if (libraryReady) {
    return;
  }

  const loginHref = `/dev/login?next=${encodeURIComponent("/my-library")}`;
  await gotoWithTransientRetry(page, loginHref);
  if (new URL(page.url()).pathname !== "/my-library") {
    test.skip(true, "Dev auth bypass is not enabled in this environment.");
  }

  await waitForRouteToSettle(page);
  await expect(libraryHeading).toBeVisible({ timeout: 15_000 });
}

test.describe("my library landing entrypoints", () => {
  test("keeps the landing page browse-first and strips low-value helper copy", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Runs once on desktop Chromium.");
    test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
    test.slow();

    await loginToMyLibraryViaDevBypass(page);

    await expect(page.getByRole("heading", { name: "Free Course" })).toBeVisible();
    await expect(page.getByTestId("my-library-today-tabs")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "My Swim Profile" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Goals" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "My Training" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Habits" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Swim Sessions" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Dryland Sessions" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Swim session builder" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Continue Free Course" })).toHaveCount(0);

    await expect(page.getByText(/active goal/i)).toHaveCount(0);
    await expect(
      page.getByText(
        "Add an open focus and capture observations or questions between swim sessions."
      )
    ).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Start free course" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Open profile" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Open goals" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Open My Training" })).toHaveCount(0);

    const freeCourseCard = page
      .getByRole("heading", { name: "Free Course" })
      .locator("xpath=ancestor::section[1]");
    await expect(freeCourseCard).toHaveClass(/fs-library-card-accent/);
    await expect(freeCourseCard.getByRole("link", { name: /^(Start|Continue)$/ })).toBeVisible();
    await expect(freeCourseCard.getByRole("link", { name: /^(Start|Continue)$/ })).toHaveClass(
      /fs-cta-primary/
    );

    const routinesRow = page.getByTestId("my-library-routines-row");
    await expect(routinesRow).toHaveClass(/fs-library-card/);
    await expect(routinesRow.getByRole("heading", { name: "My Routines" })).toBeVisible();
    await expect(routinesRow.getByRole("link", { name: "Open" })).toHaveAttribute(
      "href",
      "/my-library/routines"
    );
    await expect(routinesRow.getByRole("link", { name: "Open" })).toHaveClass(/fs-cta-primary/);
    await expect(routinesRow.locator("p")).toHaveCount(0);
    await expect(page.getByRole("tab", { name: "Micro Sessions" })).toHaveCount(0);
    await expect(page.getByRole("tab", { name: "Habits" })).toHaveCount(0);

    const profileCard = page
      .getByRole("heading", { name: "My Swim Profile" })
      .locator("xpath=ancestor::section[1]");
    await expect(profileCard.getByRole("link", { name: "Open" })).toBeVisible();
    await expect(profileCard.getByRole("link", { name: "Open" })).toHaveClass(/fs-cta-secondary/);
    await expect(profileCard.locator("p")).toHaveCount(0);

    const goalsCard = page
      .getByRole("heading", { name: "Goals" })
      .locator("xpath=ancestor::section[1]");
    await expect(goalsCard.getByRole("link", { name: "Open" })).toBeVisible();

    const swimSessionsCard = page
      .getByRole("heading", { name: "Swim Sessions" })
      .locator("xpath=ancestor::section[1]");
    await expect(swimSessionsCard.getByRole("link", { name: "Open" })).toBeVisible();
    await expect(swimSessionsCard.getByRole("link", { name: "Open" })).toHaveClass(
      /fs-cta-secondary/
    );
    await expect(swimSessionsCard.getByText("Build pool session")).toHaveCount(0);
    await expect(swimSessionsCard.getByText("Build open water session")).toHaveCount(0);
    await expect(swimSessionsCard.getByText("AI session generator")).toHaveCount(0);

    const drylandCard = page
      .getByRole("heading", { name: "Dryland Sessions" })
      .locator("xpath=ancestor::section[1]");
    await expect(drylandCard.getByRole("link", { name: "Open" })).toBeVisible();
    await expect(drylandCard.getByText("Create strength session")).toHaveCount(0);
    await expect(drylandCard.getByText("Create stretching session")).toHaveCount(0);
  });

  test("renders the focused routines destination for signed-in users", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Runs once on desktop Chromium.");
    test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
    test.slow();

    await loginViaDevBypass(page, "/my-library/routines");

    await expect(page.getByRole("heading", { name: "My Routines" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole("link", { name: "Back to My Library" })).toHaveAttribute(
      "href",
      "/my-library"
    );

    const routinesPanel = page.getByTestId("my-library-today-tabs");
    await expect(routinesPanel).toBeVisible();
    await expect(routinesPanel).toHaveClass(/fs-library-card/);
    await expect(routinesPanel.getByText("Routines")).toHaveCount(0);
    await expect(routinesPanel.getByRole("tab", { name: "Micro Sessions" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    await expect(routinesPanel.getByRole("link", { name: "Open" })).toBeVisible();
    await expect(routinesPanel.getByRole("link", { name: "Open" })).toHaveClass(/fs-cta-primary/);
    await expect(routinesPanel.getByRole("link", { name: "Edit" })).toHaveClass(/fs-cta-secondary/);
    await expect(routinesPanel.getByRole("link", { name: "Edit" })).toHaveAttribute(
      "href",
      "/my-library/dryland?micro=edit#micro-sessions"
    );
    await routinesPanel.getByRole("tab", { name: "Habits" }).click();
    await expect(routinesPanel.getByRole("tab", { name: "Habits" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    await expect(routinesPanel.getByRole("link", { name: "Open" })).toHaveAttribute(
      "href",
      "/my-library/habits"
    );
  });

  test("keeps the routines destination protected for anonymous users", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Runs once on desktop Chromium.");
    test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");

    await gotoWithTransientRetry(page, "/my-library/routines");
    await waitForRouteToSettle(page);

    const redirectedUrl = new URL(page.url());
    expect(redirectedUrl.pathname).toBe("/auth/sign-in");
    expect(redirectedUrl.searchParams.get("next")).toBe("/my-library/routines");
  });
});
