import { expect, test } from "@playwright/test";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Admin help e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

test.describe("admin help center", () => {
  test("allowlisted admin can open help tab and read plain-language operations guide", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    await page.goto(`/dev/login?next=${encodeURIComponent("/admin")}`);
    if (new URL(page.url()).pathname !== "/admin") {
      test.skip(true, "Dev auth bypass is not enabled in this environment.");
    }

    const noAccessHeading = page.getByRole("heading", { name: "You don't have access" });
    if (await noAccessHeading.isVisible().catch(() => false)) {
      test.skip(true, "Dev bypass account is signed in but not allowlisted/admin.");
    }

    const helpTab = page.getByTestId("admin-tab-help");
    await expect(helpTab).toBeVisible();
    await helpTab.click();

    await expect(page.getByTestId("admin-active-section-label")).toHaveText("Help/Guide");
    await expect(page.getByTestId("admin-help-center")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Help/Guide" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "How the Content page works" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Buttons and what they do" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What can be edited right now" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Connected services" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Daily playbooks" })).toBeVisible();
    await expect(
      page.getByText("Move to draft / Move to review / Publish / Archive:")
    ).toBeVisible();
    await expect(page.getByText("Edit:")).toBeVisible();
    await expect(
      page.getByText(
        "Module, lesson, session, drill, page, and product-copy rows can be edited directly."
      )
    ).toBeVisible();
    await expect(page.getByText("Search field:")).toBeVisible();
    await expect(page.getByText("All types filter:")).toBeVisible();
    await expect(page.getByText("Quick type buttons:")).toBeVisible();
    await expect(page.getByText("Course Workspace / All Content tabs:")).toBeVisible();
    await expect(page.getByText("Mirror snapshot cards:")).toBeVisible();
    await expect(page.getByText("Module workspace:")).toBeVisible();
    await expect(page.getByText("Course status board:")).toBeVisible();
    await expect(
      page.getByText("Show course modules and lessons in full content list:")
    ).toBeVisible();
    await expect(page.getByText("Edit lesson:")).toBeVisible();
    await expect(page.getByText("Open preview:")).toBeVisible();
    await expect(page.getByText("Open lesson:")).toBeVisible();
    await expect(page.getByText("All statuses filter:")).toBeVisible();
    await expect(page.getByText("Sort content list:")).toBeVisible();
    await expect(page.getByText("Lesson body editor:")).toBeVisible();
    await expect(page.getByText("Section visibility:")).toBeVisible();
    await expect(page.getByText("Clear focus:")).toBeVisible();
    await expect(page.getByText("Save changes:")).toBeVisible();
    await expect(page.getByText("Cancel:")).toBeVisible();
    await expect(page.getByText("Open password page:")).toBeVisible();
    await expect(
      page.getByText("If a workflow changes, update this Help/Guide page in the same PR.")
    ).toBeVisible();
  });
});
