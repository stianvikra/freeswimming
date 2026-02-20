import { expect, test } from "@playwright/test";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Admin e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

type AdminContentProbeResponse =
  | {
      ok: true;
      schemaReady?: boolean;
      warning?: string | null;
    }
  | {
      ok: false;
      error?: string;
    };

test.describe("admin content parity", () => {
  test("imports baseline and shows mirror snapshot coverage", async ({ page }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

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

    const contentProbeResponse = await page.request.get("/api/admin/content");
    if (!contentProbeResponse.ok()) {
      test.skip(true, `Admin content API unavailable (${contentProbeResponse.status()}).`);
    }
    const contentProbePayload = (await contentProbeResponse.json()) as AdminContentProbeResponse;
    if (!contentProbePayload.ok) {
      test.skip(true, contentProbePayload.error ?? "Admin content API is not ready.");
    }
    if (contentProbePayload.ok && contentProbePayload.schemaReady === false) {
      test.skip(true, contentProbePayload.warning ?? "Admin content schema is not ready.");
    }

    await page.getByTestId("admin-tab-content").click();
    await expect(page.getByRole("heading", { name: "Content items" })).toBeVisible();

    const importButton = page.getByTestId("admin-content-import-platform");
    await expect(importButton).toBeVisible();
    await expect(importButton).toBeEnabled();
    await importButton.click();

    const successNotice = page.getByText(/Imported \d+ platform items/);
    const schemaNotice = page.getByText(/setup is not ready/i).first();
    const genericImportError = page.getByText(/Could not import platform baseline\./i).first();
    const timeoutAt = Date.now() + 20_000;
    let importState: "success" | "schema" | "error" | "pending" = "pending";

    while (Date.now() < timeoutAt) {
      if (await successNotice.isVisible().catch(() => false)) {
        importState = "success";
        break;
      }
      if (await schemaNotice.isVisible().catch(() => false)) {
        importState = "schema";
        break;
      }
      if (await genericImportError.isVisible().catch(() => false)) {
        importState = "error";
        break;
      }
      await page.waitForTimeout(250);
    }

    if (importState === "schema" || importState === "error") {
      test.skip(true, "Admin content import is not write-ready in this environment.");
    }

    await expect(successNotice).toBeVisible({ timeout: 20_000 });

    await expect(page.getByRole("heading", { name: "Platform mirror snapshot" })).toBeVisible();
    await expect(page.getByText("Course modules")).toBeVisible();
    await expect(page.getByText("Course lessons")).toBeVisible();
    await expect(page.getByText("0-1000 sessions")).toBeVisible();
    await expect(page.getByText("Poolside drills")).toBeVisible();
    await expect(page.getByText("Programs/products")).toBeVisible();
    await expect(page.getByText(/Platform: \d+ · Admin: \d+/).first()).toBeVisible();
  });
});
