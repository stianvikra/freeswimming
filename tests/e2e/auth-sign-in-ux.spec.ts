import { expect, test } from "@playwright/test";
import { gotoWithTransientRetry } from "./utils/transient-navigation";

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
    await gotoWithTransientRetry(page, `/auth/sign-in?${params.toString()}`);

    await expect(page.getByTestId("auth-passkey-readiness")).toContainText(
      "What works on this device"
    );
    await expect(page.getByTestId("auth-passkey-readiness")).toContainText("Email code today");
    await expect(page.getByTestId("auth-passkey-readiness")).toContainText(
      "Check your email, then enter the code below."
    );
    await expect(page.getByTestId("auth-request-status")).toContainText(
      "Code sent. Check your email, then enter it below."
    );
    await expect(page.getByTestId("auth-request-status")).toContainText(
      "If you don't see it, check your spam/junk folder."
    );
    await expect(page.getByRole("heading", { name: "Enter code" })).toBeVisible();
    await expect(page.getByLabel("Email")).toHaveValue("test@freeswimming.org");
    await expect(page.getByLabel("Code")).toBeVisible();
    await expect(page.getByTestId("auth-submit-code")).toContainText("Sign in");
    await expect(page.getByTestId("auth-resend-button")).toContainText("Resend code");
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
    await gotoWithTransientRetry(page, `/auth/sign-in?${params.toString()}`);

    await expect(page.getByTestId("auth-request-status")).toContainText(
      /Please wait .* before requesting a new login code\./
    );

    const resendButton = page.getByTestId("auth-resend-button");
    await expect(resendButton).toBeDisabled();
    await expect(resendButton).toContainText(/Resend in \d+s/);
  });

  test("shows actionable error when no sent state exists", async ({ page }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    const params = new URLSearchParams({
      next: "/my-library",
      error: "Enter a valid email address.",
    });
    await gotoWithTransientRetry(page, `/auth/sign-in?${params.toString()}`);

    await expect(page.getByRole("heading", { name: "Get a code" })).toBeVisible();
    await expect(page.getByTestId("auth-passkey-readiness")).toContainText(
      "What works on this device"
    );
    await expect(page.getByTestId("auth-passkey-readiness")).toContainText(
      "Email code sign-in works on this device today."
    );
    await expect(page.getByTestId("auth-request-status")).toContainText(
      "Enter a valid email address."
    );
    await expect(page.getByTestId("auth-submit-request")).toContainText("Send code");
  });
});
