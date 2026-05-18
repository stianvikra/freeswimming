import { expect, test } from "@playwright/test";
import { gotoWithTransientRetry } from "./utils/transient-navigation";

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Auth e2e is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
}

function runOnceOnMobileChromium(projectName: string) {
  test.skip(!projectName.startsWith("mobile-"), "Auth mobile e2e is mobile-only.");
  test.skip(projectName !== "mobile-chromium", "Runs once on mobile Chromium.");
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

    await expect(page.getByTestId("auth-passkey-readiness")).toHaveCount(0);
    await expect(page.getByTestId("auth-context-copy")).toContainText(
      "After verification, you will return to My Library or the member page you opened."
    );
    await expect(page.getByTestId("auth-request-status")).toContainText(
      "Sign-in email sent. Open the secure link first."
    );
    await expect(page.getByTestId("auth-request-status")).toContainText(
      "If you're using the iPhone Home Screen app or the link opens in Safari, enter the one-time code below instead."
    );
    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
    await expect(
      page.getByText(
        "Open the secure link sent to test@freeswimming.org. If you're using the Home Screen app or the link opens in Safari, enter the one-time code below."
      )
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toHaveValue("test@freeswimming.org");
    await expect(page.getByLabel("One-time code")).toBeVisible();
    await expect(
      page.getByText(
        "Use this in the Home Screen app if the link opens in Safari or does not open."
      )
    ).toBeVisible();
    await expect(page.getByTestId("auth-submit-code")).toContainText("Sign in with code");
    await expect(page.getByTestId("auth-resend-button")).toContainText("Resend sign-in email");
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
      /Please wait .* before requesting a new sign-in email\./
    );

    const resendButton = page.getByTestId("auth-resend-button");
    await expect(resendButton).toBeDisabled();
    await expect(resendButton).toContainText(/Resend email in \d+s/);
  });

  test("shows actionable error when no sent state exists", async ({ page }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    const params = new URLSearchParams({
      next: "/my-library",
      error: "Enter a valid email address.",
    });
    await gotoWithTransientRetry(page, `/auth/sign-in?${params.toString()}`);

    await expect(page.getByRole("heading", { name: "Email sign-in link" })).toBeVisible();
    await expect(page.getByTestId("auth-passkey-readiness")).toHaveCount(0);
    await expect(page.getByTestId("auth-request-status")).toContainText(
      "Enter a valid email address."
    );
    await expect(page.getByTestId("auth-submit-request")).toContainText("Email sign-in link");
  });

  test("explains admin context without promising admin access", async ({ page }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    await gotoWithTransientRetry(page, "/auth/sign-in?next=%2Fadmin");

    await expect(page.getByRole("heading", { name: "Sign in to continue" })).toBeVisible();
    await expect(page.getByTestId("auth-context-copy")).toContainText(
      "Use your email to confirm your identity."
    );
    await expect(page.getByTestId("auth-context-copy")).toContainText(
      "Admin access is checked after sign-in"
    );
    await expect(page.getByTestId("auth-context-copy")).toContainText(
      "does not grant admin access by itself"
    );
    await expect(page.getByRole("heading", { name: "Email sign-in link" })).toBeVisible();
  });

  test("explains claim context without promising downloads before checks", async ({
    page,
  }, testInfo) => {
    runOnceOnDesktopChromium(testInfo.project.name);

    const params = new URLSearchParams({
      next: "/my-library",
      source: "claim_entry",
      email: "buyer@example.com",
    });
    await gotoWithTransientRetry(page, `/auth/sign-in?${params.toString()}`);

    await expect(page.getByRole("heading", { name: "Sign in to claim access" })).toBeVisible();
    await expect(page.getByTestId("auth-context-copy")).toContainText(
      "Use the same email you used at checkout."
    );
    await expect(page.getByTestId("auth-context-copy")).toContainText("claim checks decide");
    await expect(page.locator('input[name="source"]').first()).toHaveValue("claim_entry");
  });

  test("keeps mobile code fallback clear of the fixed bottom nav", async ({ page }, testInfo) => {
    runOnceOnMobileChromium(testInfo.project.name);

    const params = new URLSearchParams({
      next: "/my-library",
      sent: "1",
      email: "test@freeswimming.org",
    });
    await gotoWithTransientRetry(page, `/auth/sign-in?${params.toString()}`);

    await expect(page.getByTestId("mobile-fixed-nav")).toHaveCount(0);
    await expect(page.getByLabel("One-time code")).toBeVisible();
    await expect(
      page.getByText(
        "Use this in the Home Screen app if the link opens in Safari or does not open."
      )
    ).toBeVisible();
    await expect(page.getByTestId("auth-submit-code")).toBeVisible();
  });

  test("keeps checkout context readable on mobile", async ({ page }, testInfo) => {
    runOnceOnMobileChromium(testInfo.project.name);

    const params = new URLSearchParams({
      next: "/my-library",
      source: "checkout_success",
    });
    await gotoWithTransientRetry(page, `/auth/sign-in?${params.toString()}`);

    await expect(page.getByTestId("mobile-fixed-nav")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Sign in to My Library" })).toBeVisible();
    await expect(page.getByTestId("auth-context-copy")).toContainText(
      "Use the same email you used at checkout."
    );
    await expect(page.getByTestId("auth-context-copy")).toContainText(
      "entitlement checks attach any available access"
    );
    await expect(page.locator('input[name="source"]').first()).toHaveValue("checkout_success");
    await expect(page.getByTestId("auth-submit-request")).toBeVisible();
  });
});
