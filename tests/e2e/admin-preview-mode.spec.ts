import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";
const unauthenticatedDeniedStatuses = new Set([401, 403, 423]);

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Admin preview e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

async function loginAsAdminViaDevBypass(page: Page) {
  await page.goto(`/dev/login?next=${encodeURIComponent("/admin")}`);
  const pathAfterDevLogin = new URL(page.url()).pathname;

  if (pathAfterDevLogin !== "/admin") {
    test.skip(true, "Dev auth bypass is not enabled in this environment.");
  }

  const noAccessHeading = page.getByRole("heading", { name: "You don't have access" });
  if (await noAccessHeading.isVisible().catch(() => false)) {
    test.skip(true, "Dev bypass account is signed in but not allowlisted/admin.");
  }

  await expect(page.getByRole("heading", { name: "Admin console" })).toBeVisible();

  const roleBadge = page.getByText(/^Role:/).first();
  const roleText = (await roleBadge.textContent())?.toLowerCase() ?? "";
  if (!roleText.includes("admin") && !roleText.includes("editor")) {
    test.skip(
      true,
      `Dev bypass role is not admin/editor in this environment (${roleText || "unknown"}).`
    );
  }
}

test.describe("admin preview mode", () => {
  test("denies unauthenticated preview API access", async ({ request }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    const response = await request.get("/api/course/content?preview=1&previewMode=draft");
    expect(
      unauthenticatedDeniedStatuses.has(response.status()),
      `Unexpected status ${response.status()} for unauthenticated preview request`
    ).toBeTruthy();
  });

  test("opens module/lesson preview links and renders preview banner with noindex headers", async ({
    page,
    request,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    await loginAsAdminViaDevBypass(page);

    const contentListLoading = page.getByText("Loading content list…");
    await expect(contentListLoading).toBeHidden({ timeout: 15_000 });

    const lessonWorkspace = page.getByTestId("admin-course-lesson-workspace");
    if (!(await lessonWorkspace.isVisible().catch(() => false))) {
      test.skip(true, "Course workspace is not available in this environment.");
    }
    await expect(lessonWorkspace).toBeVisible();

    const workspaceLessonRow = lessonWorkspace
      .getByTestId("admin-workspace-lesson-row")
      .filter({ hasText: "Welcome & Course Structure" })
      .first();
    if (!(await workspaceLessonRow.isVisible().catch(() => false))) {
      test.skip(true, "Seed lesson for preview test is not available in this environment.");
    }
    await expect(workspaceLessonRow).toBeVisible();

    const lessonPreviewLink = workspaceLessonRow.getByRole("link", { name: "Open preview" });
    await expect(lessonPreviewLink).toHaveAttribute(
      "href",
      /preview=1&previewMode=published&previewType=lesson/
    );

    const moduleWorkspaceRow = page
      .getByTestId("admin-course-module-status-row")
      .filter({ hasText: "Introduction to the Course" })
      .first();
    await expect(moduleWorkspaceRow).toBeVisible();
    await expect(
      moduleWorkspaceRow.getByRole("link", { name: "Open module preview" })
    ).toHaveAttribute("href", /preview=1&previewMode=published&previewType=module/);

    const [previewPage] = await Promise.all([
      page.context().waitForEvent("page"),
      lessonPreviewLink.click(),
    ]);
    await previewPage.waitForLoadState("domcontentloaded");

    const previewBanner = previewPage.getByTestId("course-preview-mode-banner");
    await expect(previewBanner).toBeVisible();
    await expect(previewBanner).toContainText("Preview mode");
    await expect(previewBanner).toContainText("not visible to learners");

    const previewPath = new URL(previewPage.url());
    const previewResponse = await request.get(`${previewPath.pathname}${previewPath.search}`);
    expect(previewResponse.headers()["x-robots-tag"]).toBe("noindex, nofollow, noarchive");
  });
});
