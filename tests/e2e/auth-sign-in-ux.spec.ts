import { expect, test } from "@playwright/test";

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Auth e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
}

test.describe("auth sign-in ux", () => {
  test("shows deterministic sent state and code entry flow", async ({ page }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    const params = new URLSearchParams({
      next: "/my-library",
      sent: "1",
      email: "test@freeswimming.org",
    });
    await page.goto(`/auth/sign-in?${params.toString()}`);

    await expect(page.getByTestId("auth-passkey-readiness")).toContainText(
      "Passkeys on this device"
    );
    await expect(page.getByTestId("auth-passkey-readiness")).toContainText("Passkey-ready browser");
    await expect(page.getByTestId("auth-request-status")).toContainText(
      "Sign-in code sent. Enter it below."
    );
    await expect(page.getByTestId("auth-request-status")).toContainText(
      "If you don't see it, check your spam/junk folder."
    );
    await expect(page.getByRole("heading", { name: "Enter sign-in code" })).toBeVisible();
    await expect(page.getByLabel("Email")).toHaveValue("test@freeswimming.org");
    await expect(page.getByLabel("Sign-in code")).toBeVisible();
    await expect(page.getByTestId("auth-resend-button")).toBeVisible();
  });

  test("shows cooldown guidance and disables resend while cooldown is active", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    const params = new URLSearchParams({
      next: "/my-library",
      sent: "1",
      email: "test@freeswimming.org",
      error: "Please wait before retrying.",
      cooldownUntil: String(Date.now() + 90_000),
    });
    await page.goto(`/auth/sign-in?${params.toString()}`);

    await expect(page.getByTestId("auth-request-status")).toContainText(
      /Please wait .* before requesting a new login code\./
    );

    const resendButton = page.getByTestId("auth-resend-button");
    await expect(resendButton).toBeDisabled();
    await expect(resendButton).toContainText(/Request new login code in \d+s/);
  });

  test("shows actionable error when no sent state exists", async ({ page }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    const params = new URLSearchParams({
      next: "/my-library",
      error: "Enter a valid email address.",
    });
    await page.goto(`/auth/sign-in?${params.toString()}`);

    await expect(page.getByRole("heading", { name: "Email code sign-in" })).toBeVisible();
    await expect(page.getByTestId("auth-passkey-readiness")).toContainText(
      "Passkeys on this device"
    );
    await expect(page.getByTestId("auth-request-status")).toContainText(
      "Enter a valid email address."
    );
    await expect(page.getByTestId("auth-submit-request")).toBeVisible();
  });
});
