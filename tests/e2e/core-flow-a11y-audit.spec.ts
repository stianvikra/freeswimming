import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import {
  gotoWithTransientRetry,
  prewarmRoute,
  waitForRouteToSettle,
} from "./utils/transient-navigation";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

type CoreRoute = {
  href: string;
  heading: string | RegExp;
};

const CORE_PUBLIC_ROUTES: CoreRoute[] = [
  { href: "/", heading: "Adult learner?" },
  { href: "/plans", heading: "Plans" },
  { href: "/en/course", heading: "Free Course" },
  { href: "/auth/sign-in?next=%2Fmy-library", heading: "Sign in to My Library" },
  { href: "/auth/sign-in?next=%2Fadmin", heading: "Sign in to continue" },
  { href: "/checkout/success", heading: "Open My Library when access is ready." },
  { href: "/claim?next=%2Fmy-library", heading: "Recover My Library access." },
];

function runOnceOnDesktopChromium(projectName: string) {
  test.skip(!projectName.startsWith("desktop-"), "Core flow a11y audit is desktop-only.");
  test.skip(projectName !== "desktop-chromium", "Runs once on desktop Chromium.");
  test.skip(isSiteLockEnabled, "Skipped while private access gate is enabled.");
}

function canAttemptDevBypassAuth() {
  const supabaseEnv = process.env.FS_SUPABASE_ENV ?? "test";
  return (
    process.env.FS_ALLOW_PROD_SUPABASE === "1" || supabaseEnv === "ci" || supabaseEnv === "preview"
  );
}

function summarizeViolations(violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"]) {
  return violations
    .map((violation) => {
      const targets = violation.nodes.flatMap((node) => node.target).join(", ");
      return `${violation.id} (${violation.impact ?? "unknown"}): ${violation.help} [${targets}]`;
    })
    .join("\n");
}

async function expectOnePageMain(page: Page) {
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.locator("main main")).toHaveCount(0);
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

async function openRoute(page: Page, route: CoreRoute) {
  await gotoWithTransientRetry(page, route.href, 90_000);
  await waitForRouteToSettle(page);
  await expect(page.getByRole("heading", { name: route.heading, level: 1 })).toBeVisible({
    timeout: 20_000,
  });

  if (route.href === "/en/course") {
    await expect(page).toHaveURL(/\/en\/course\/[^/?]+\/[^/?]+(?:\?.*)?$/, {
      timeout: 20_000,
    });
    await expect(page.getByTestId("course-page")).toHaveAttribute(
      "data-has-resolved-requested-lesson",
      "true",
      { timeout: 20_000 }
    );
    await waitForRouteToSettle(page);
  }
}

async function waitForMenuToggleToHydrate(page: Page) {
  const menuToggle = page.getByTestId("header-menu-toggle");
  await expect(menuToggle).toBeVisible();
  await expect
    .poll(
      () =>
        menuToggle.evaluate((node) =>
          Object.keys(node).some(
            (key) => key.startsWith("__reactProps$") || key.startsWith("__reactFiber$")
          )
        ),
      {
        timeout: 15_000,
        message: "Expected the header menu toggle to finish React hydration.",
      }
    )
    .toBe(true);

  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );

  return menuToggle;
}

async function expectHeaderMenuToggleFocused(page: Page) {
  await expect
    .poll(
      () =>
        page.evaluate(() => (document.activeElement as HTMLElement | null)?.dataset.testid ?? null),
      {
        timeout: 5_000,
      }
    )
    .toBe("header-menu-toggle");
}

async function loginToMyLibraryViaDevBypass(page: Page) {
  if (!canAttemptDevBypassAuth()) {
    test.skip(true, "Dev auth bypass requires a configured Supabase test environment.");
  }

  const loginHref = `/dev/login?next=${encodeURIComponent("/my-library")}`;
  const loginProbe = await prewarmRoute(page, loginHref);
  if (!loginProbe || loginProbe.status() >= 500) {
    test.skip(true, "Dev auth bypass is not reachable in this environment.");
  }

  await gotoWithTransientRetry(page, loginHref);
  const destination = new URL(page.url());
  if (destination.pathname !== "/my-library") {
    if (destination.pathname === "/auth/sign-in") {
      test.skip(true, "Dev auth bypass is not enabled in this environment.");
    }
    test.skip(true, `Dev auth bypass redirected to ${destination.pathname}.`);
  }

  await waitForRouteToSettle(page);
  await expect(page.getByRole("heading", { name: "My Library", level: 1 })).toBeVisible({
    timeout: 20_000,
  });
}

test.describe("AW-006 core flow keyboard, contrast, and semantic audit", () => {
  test("public, auth, and recovery routes have stable landmarks and no serious axe violations", async ({
    page,
  }, testInfo) => {
    test.slow();
    runOnceOnDesktopChromium(testInfo.project.name);

    for (const route of CORE_PUBLIC_ROUTES) {
      await test.step(route.href, async () => {
        await openRoute(page, route);
        await expectOnePageMain(page);
        await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
        await assertNoSeriousOrCriticalAxeViolations(page);
      });
    }
  });

  test("header navigation menu is keyboard operable and restores trigger focus", async ({
    page,
  }, testInfo) => {
    test.slow();
    runOnceOnDesktopChromium(testInfo.project.name);

    for (const route of [
      { href: "/", heading: "Adult learner?" },
      { href: "/en/course", heading: "Free Course" },
    ] satisfies CoreRoute[]) {
      await test.step(route.href, async () => {
        await openRoute(page, route);

        const menuToggle = await waitForMenuToggleToHydrate(page);
        await expect(menuToggle).toHaveAttribute("aria-expanded", "false");
        await menuToggle.focus();
        await expectHeaderMenuToggleFocused(page);

        await menuToggle.press("Enter");
        const dialog = page.getByRole("dialog", { name: "Navigation menu" });
        await expect(dialog).toBeVisible();
        await expect(menuToggle).toHaveAttribute("aria-expanded", "true");
        await expect(dialog.getByRole("button", { name: "Close menu" })).toBeFocused();

        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
        await expect(menuToggle).toHaveAttribute("aria-expanded", "false");
        await expectHeaderMenuToggleFocused(page);
      });
    }
  });

  test("signed-in My Library shell meets the same semantic and axe baseline when dev auth is available", async ({
    page,
  }, testInfo) => {
    test.slow();
    runOnceOnDesktopChromium(testInfo.project.name);

    await loginToMyLibraryViaDevBypass(page);
    await expectOnePageMain(page);
    await expect(page.getByRole("heading", { name: "My Library", level: 1 })).toHaveCount(1);
    await assertNoSeriousOrCriticalAxeViolations(page);
  });
});
