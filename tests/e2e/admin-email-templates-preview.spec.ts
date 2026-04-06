import { expect, test, type Locator, type Page } from "@playwright/test";
import { buildAdminEmailTemplateQaTestKey } from "@/lib/admin/email-template-test-records";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

type AdminEmailTemplatesProbeResponse =
  | {
      ok: true;
      schemaReady?: boolean;
      warning?: string | null;
    }
  | {
      ok: false;
      error?: string;
    };

type AdminEmailTemplateCleanupResponse =
  | {
      ok: true;
      deletedCount: number;
      deletedIds: string[];
      deletedTemplateKeys: string[];
    }
  | {
      ok: false;
      error?: string;
    };

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Admin e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

async function moveTemplateStatusAndWait(
  page: Page,
  templateItem: Locator,
  label: "Review" | "Published"
) {
  const responsePromise = page.waitForResponse(
    (response) =>
      /\/api\/admin\/email-templates\/[0-9a-f-]+$/i.test(response.url()) &&
      response.request().method() === "PATCH" &&
      response.status() === 200
  );

  await templateItem.getByRole("button", { name: `Move to ${label}` }).click();
  await responsePromise;
  await expect(
    templateItem
      .locator("span")
      .filter({ hasText: new RegExp(`^${label}$`) })
      .first()
  ).toBeVisible({ timeout: 10_000 });
}

async function cleanupAdminEmailTemplateTestRecords(page: Page) {
  const response = await page.request.post("/api/admin/email-templates/test-records");
  const parsed = (await response.json().catch(() => null)) as AdminEmailTemplateCleanupResponse | null;
  expect(response.ok(), parsed && "ok" in parsed && !parsed.ok ? parsed.error : "Expected successful email-template QA cleanup.").toBe(true);
  if (!parsed?.ok) {
    throw new Error(parsed?.error ?? "Email-template QA cleanup failed.");
  }
}

test.describe("admin email template preview", () => {
  test("renders sample, fallback, and missing placeholder signals in create preview", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);
    test.slow();

    await page.goto(`/dev/login?next=${encodeURIComponent("/admin?tab=email-templates")}`);
    const pathAfterDevLogin = new URL(page.url()).pathname;

    if (pathAfterDevLogin !== "/admin") {
      test.skip(true, "Dev auth bypass is not enabled in this environment.");
    }

    const noAccessHeading = page.getByRole("heading", { name: "You don't have access" });
    if (await noAccessHeading.isVisible().catch(() => false)) {
      test.skip(true, "Dev bypass account is signed in but not allowlisted/admin.");
    }

    const roleLine = page.getByText(/^Role:/).first();
    const roleText = (await roleLine.textContent().catch(() => null))?.toLowerCase() ?? "";
    const canPublishTemplates = roleText.includes("admin");
    if (roleText.includes("viewer")) {
      test.skip(true, "Dev bypass account lacks editor/admin role for template mutations.");
    }

    const emailTemplatesProbe = await page.request.get("/api/admin/email-templates");
    if (!emailTemplatesProbe.ok()) {
      test.skip(true, `Admin email templates API unavailable (${emailTemplatesProbe.status()}).`);
    }
    const emailTemplatesPayload =
      (await emailTemplatesProbe.json()) as AdminEmailTemplatesProbeResponse;
    if (!emailTemplatesPayload.ok) {
      test.skip(true, emailTemplatesPayload.error ?? "Admin email templates API is not ready.");
    }
    if (emailTemplatesPayload.ok && emailTemplatesPayload.schemaReady === false) {
      test.skip(
        true,
        emailTemplatesPayload.warning ?? "Email template schema is not ready in this environment."
      );
    }

    const tabEmailTemplates = page.getByTestId("admin-tab-email-templates");
    if ((await tabEmailTemplates.getAttribute("aria-pressed")) !== "true") {
      await tabEmailTemplates.click();
    }
    await expect(page.getByTestId("admin-active-section-label")).toHaveText("Email templates");

    const schemaWarning = page.getByText(/Admin email templates setup is not ready/i).first();
    if (await schemaWarning.isVisible().catch(() => false)) {
      test.skip(true, "Email template schema is not ready in this environment.");
    }

    const createForm = page.getByTestId("admin-email-templates-create-form");
    await expect(createForm).toBeVisible();

    const subjectField = createForm.getByLabel("Subject");
    const bodyField = createForm.getByLabel("Body");
    await expect(subjectField).toBeEditable();
    await expect(bodyField).toBeEditable();

    await subjectField.fill("Kode {{code}} i {{app_name}}");
    await expect(subjectField).toHaveValue("Kode {{code}} i {{app_name}}");
    await createForm
      .getByLabel("Body")
      .fill(
        "Hei {{user_name}}. Bruk {{code}} innen {{expires_minutes}} min. Kontakt {{support_email}}. Ukjent {{custom_token}}."
      );
    await expect(bodyField).toHaveValue(
      "Hei {{user_name}}. Bruk {{code}} innen {{expires_minutes}} min. Kontakt {{support_email}}. Ukjent {{custom_token}}."
    );

    const sampleValuesField = createForm.getByLabel("Preview sample values (JSON object)");
    await sampleValuesField.fill('{"code":');
    await expect(sampleValuesField).toHaveValue('{"code":');
    await expect
      .poll(
        async () =>
          (await createForm
            .getByTestId("admin-email-template-create-preview-error")
            .textContent()
            .catch(() => null)) ?? null,
        { timeout: 10_000 }
      )
      .toBe("Preview sample values must be valid JSON.");

    await sampleValuesField.fill('{"code":"777111","user_name":"QA Tester"}');
    await expect(sampleValuesField).toHaveValue('{"code":"777111","user_name":"QA Tester"}');
    await expect
      .poll(
        async () =>
          await createForm.getByTestId("admin-email-template-create-preview-error").count(),
        { timeout: 10_000 }
      )
      .toBe(0);

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

    await cleanupAdminEmailTemplateTestRecords(page);

    const templateKey = buildAdminEmailTemplateQaTestKey({
      scope: "preview",
      unique: `${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    });

    try {
      await createForm.getByLabel("Template key").fill(templateKey);
      await createForm.getByLabel("Locale").fill("nb-NO");
      await createForm.getByLabel("Status").selectOption("draft");
      await createForm.getByLabel("Subject").fill("Varsel {{code}} i {{app_name}}");
      await createForm.getByLabel("Body").fill("Kontakt {{support_email}} hvis lenke feiler.");
      await createForm.getByLabel("Required placeholders").fill("code");
      await createForm.getByLabel("Optional placeholders").fill("app_name, support_email");
      await sampleValuesField.fill("{}");

      await createForm.getByRole("button", { name: "Create template" }).click();

      const createdTemplate = page
        .getByTestId("admin-email-template-item")
        .filter({ hasText: `${templateKey} · nb-NO` })
        .first();
      const statusChip = (label: "Draft" | "Review" | "Published") =>
        createdTemplate
          .locator("span")
          .filter({ hasText: new RegExp(`^${label}$`) })
          .first();

      await expect(statusChip("Draft")).toBeVisible();

      await moveTemplateStatusAndWait(page, createdTemplate, "Review");

      if (canPublishTemplates) {
        await moveTemplateStatusAndWait(page, createdTemplate, "Published");
      }

      const editSampleValuesField = createdTemplate.getByLabel(
        "Preview sample values (JSON object)"
      );
      await editSampleValuesField.fill('{"code":');
      await expect(
        createdTemplate.getByText("Preview sample values must be valid JSON.")
      ).toBeVisible({ timeout: 10_000 });

      await editSampleValuesField.fill("{}");
      await expect(
        createdTemplate.getByText("Preview sample values must be valid JSON.")
      ).toHaveCount(0);

      const publishedFallbackLine = createdTemplate
        .locator("p")
        .filter({ hasText: "Fallback defaults used:" })
        .last();
      await expect(publishedFallbackLine).toContainText("app_name");
      await expect(publishedFallbackLine).toContainText("support_email");
    } finally {
      await cleanupAdminEmailTemplateTestRecords(page);
    }
  });
});
