import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { gotoWithTransientRetry, waitForRouteToSettle } from "./utils/transient-navigation";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

type AdminTabAuditTarget = {
  id: string;
  label: string;
  heading: string;
};

const ADMIN_TAB_AUDIT_TARGETS: AdminTabAuditTarget[] = [
  { id: "content", label: "Content", heading: "Content" },
  { id: "qr-links", label: "QR Links", heading: "QR registry" },
  { id: "commerce", label: "Commerce", heading: "Product catalog" },
  { id: "operations", label: "Operations", heading: "Runtime controls" },
  { id: "analytics", label: "Analytics", heading: "Read-only insight dashboard" },
  { id: "users", label: "Users", heading: "Auth user directory" },
  { id: "email-templates", label: "Email templates", heading: "Email templates" },
  { id: "messages", label: "Messages", heading: "Messages" },
  { id: "notes", label: "Notes", heading: "Notes" },
  { id: "categories", label: "Categories", heading: "Categories" },
  { id: "help", label: "Help/Guide", heading: "Help/Guide" },
];

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Admin console a11y audit is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

function summarizeViolations(violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"]) {
  return violations
    .map((violation) => {
      const targets = violation.nodes.flatMap((node) => node.target).join(", ");
      return `${violation.id} (${violation.impact ?? "unknown"}): ${violation.help} [${targets}]`;
    })
    .join("\n");
}

async function assertNoSeriousOrCriticalAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const seriousOrCritical = results.violations.filter((violation) =>
    ["serious", "critical"].includes(violation.impact ?? "")
  );

  expect(seriousOrCritical, summarizeViolations(seriousOrCritical)).toEqual([]);
}

async function expectOnePageMain(page: Page) {
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.locator("main main")).toHaveCount(0);
}

async function expectKeyboardFocusable(locator: Locator) {
  await expect(locator).toBeVisible();
  const canReceiveFocus = await locator.evaluate((element) => {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    element.focus({ preventScroll: true });
    return document.activeElement === element;
  });
  expect(canReceiveFocus).toBe(true);
}

async function waitForHydratedClickHandler(locator: Locator) {
  await expect
    .poll(
      () =>
        locator.evaluate((node) =>
          Object.keys(node).some(
            (key) => key.startsWith("__reactProps$") || key.startsWith("__reactFiber$")
          )
        ),
      {
        timeout: 15_000,
        message: "Expected admin tab control to finish React hydration.",
      }
    )
    .toBe(true);
}

async function loginToAdminViaDevBypass(page: Page) {
  await gotoWithTransientRetry(page, `/dev/login?next=${encodeURIComponent("/admin")}`);
  const destination = new URL(page.url());

  if (destination.pathname !== "/admin") {
    if (destination.pathname === "/auth/sign-in") {
      const errorMessage = destination.searchParams.get("error");
      if (errorMessage && /could not sign in/i.test(errorMessage)) {
        test.skip(
          true,
          "Dev auth bypass is enabled but sign-in failed; check DEV_AUTH_BYPASS_EMAIL/DEV_AUTH_BYPASS_PASSWORD."
        );
      }
      test.skip(true, "Dev auth bypass is not enabled in this environment.");
    }

    if (destination.pathname === "/preview-access") {
      test.skip(true, "Site lock is enabled; dev-login did not reach /admin.");
    }

    test.skip(true, `Dev login redirected to unexpected path (${destination.pathname}).`);
  }

  const noAccessHeading = page.getByRole("heading", { name: "You don't have access" });
  if (await noAccessHeading.isVisible().catch(() => false)) {
    test.skip(true, "Dev bypass account is signed in but not allowlisted for admin.");
  }

  await waitForRouteToSettle(page);
  await expect(page.getByRole("heading", { name: "Admin console", level: 1 })).toBeVisible();

  const roleBadge = page.getByText(/^Role:\s*/i).first();
  await expect(roleBadge).toBeVisible();
  const roleText = ((await roleBadge.textContent()) ?? "").toLowerCase();
  if (!roleText.includes("admin") && !roleText.includes("editor") && !roleText.includes("viewer")) {
    test.skip(true, `Dev bypass role is not an admin-console role (${roleText || "unknown"}).`);
  }
}

async function openTabWithKeyboard(page: Page, target: AdminTabAuditTarget) {
  const tabButton = page.getByTestId(`admin-tab-${target.id}`);
  await expectKeyboardFocusable(tabButton);
  await waitForHydratedClickHandler(tabButton);

  const activeSectionLabel = page.getByTestId("admin-active-section-label");
  const isAlreadyActive = (await tabButton.getAttribute("aria-pressed")) === "true";

  if (!isAlreadyActive) {
    await tabButton.press("Enter");
  }

  await expect(activeSectionLabel).toHaveText(target.label, { timeout: 10_000 });
  await expect(tabButton).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('button[data-testid^="admin-tab-"][aria-pressed="true"]')).toHaveCount(
    1
  );
  await expect(page.getByRole("heading", { name: target.heading, exact: true })).toBeVisible({
    timeout: 20_000,
  });
}

test.describe("AW-006 admin console accessibility audit", () => {
  test("authenticated admin shell and top-level tabs have stable keyboard and axe semantics", async ({
    page,
  }, testInfo) => {
    test.slow();
    runOnceOnDesktopChromium(testInfo.project.name);

    await loginToAdminViaDevBypass(page);
    await expectOnePageMain(page);
    await expect(page.getByRole("heading", { name: "Admin console", level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: "Admin sections" })).toBeVisible();

    for (const target of ADMIN_TAB_AUDIT_TARGETS) {
      await test.step(target.label, async () => {
        await openTabWithKeyboard(page, target);
        await expectOnePageMain(page);
        await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
        await assertNoSeriousOrCriticalAxeViolations(page);
      });
    }
  });
});
