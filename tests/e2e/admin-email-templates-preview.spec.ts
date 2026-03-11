import { expect, test } from "@playwright/test";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Admin e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

test.describe("admin email template preview", () => {
  test("renders sample, fallback, and missing placeholder signals in create preview", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    await page.goto(`/dev/login?next=${encodeURIComponent("/admin?tab=email-templates")}`);
    const pathAfterDevLogin = new URL(page.url()).pathname;

    if (pathAfterDevLogin !== "/admin") {
      test.skip(true, "Dev auth bypass is not enabled in this environment.");
    }

    const noAccessHeading = page.getByRole("heading", { name: "You don't have access" });
    if (await noAccessHeading.isVisible().catch(() => false)) {
      test.skip(true, "Dev bypass account is signed in but not allowlisted/admin.");
    }

    const tabEmailTemplates = page.getByTestId("admin-tab-email-templates");
    if ((await tabEmailTemplates.getAttribute("aria-pressed")) !== "true") {
      await tabEmailTemplates.click();
    }
    await expect(page.getByTestId("admin-active-section-label")).toHaveText("Email templates");

    const createForm = page.getByTestId("admin-email-templates-create-form");
    await expect(createForm).toBeVisible();

    await createForm.getByLabel("Subject").fill("Kode {{code}} i {{app_name}}");
    await createForm
      .getByLabel("Body")
      .fill(
        "Hei {{user_name}}. Bruk {{code}} innen {{expires_minutes}} min. Kontakt {{support_email}}. Ukjent {{custom_token}}."
      );

    const sampleValuesField = createForm.getByLabel("Preview sample values (JSON object)");
    await sampleValuesField.fill('{"code":');
    await expect(createForm.getByTestId("admin-email-template-create-preview-error")).toHaveText(
      "Preview sample values must be valid JSON."
    );

    await sampleValuesField.fill('{"code":"777111","user_name":"QA Tester"}');
    await expect(createForm.getByTestId("admin-email-template-create-preview-error")).toHaveCount(
      0
    );

    const previewPanel = createForm.getByTestId("admin-email-template-create-preview");
    const detectedLine = previewPanel.getByTestId("admin-email-template-create-preview-detected");
    const renderedSubject = previewPanel.getByTestId("admin-email-template-create-preview-subject");
    const renderedBody = previewPanel.getByTestId("admin-email-template-create-preview-body");
    const fallbackLine = previewPanel.getByTestId("admin-email-template-create-preview-fallback");
    const missingLine = previewPanel.getByTestId("admin-email-template-create-preview-missing");

    await expect(detectedLine).toContainText("app_name");
    await expect(detectedLine).toContainText("code");
    await expect(detectedLine).toContainText("custom_token");
    await expect(detectedLine).toContainText("expires_minutes");
    await expect(detectedLine).toContainText("support_email");
    await expect(detectedLine).toContainText("user_name");

    await expect(renderedSubject).toContainText("Kode 777111 i Freeswimming");
    await expect(renderedBody).toContainText("QA Tester");
    await expect(renderedBody).toContainText("777111");
    await expect(renderedBody).toContainText("10");
    await expect(renderedBody).toContainText("support@freeswimming.no");

    await expect(fallbackLine).toContainText("app_name");
    await expect(fallbackLine).toContainText("expires_minutes");
    await expect(fallbackLine).toContainText("support_email");
    await expect(missingLine).toContainText("custom_token");
  });
});
