import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  gotoWithTransientRetry,
  prewarmRoute,
  waitForRouteToSettle,
} from "./utils/transient-navigation";

const isSiteLockEnabled = process.env.SITE_LOCK_ENABLED === "1";

type GuideRoute = {
  href: string;
  trackerHeading: string;
  trackerActionName: string | RegExp;
  actionStripTestId: string;
};

const GUIDE_ROUTES: GuideRoute[] = [
  {
    href: "/guides/0-1000m",
    trackerHeading: "0-1000m interactive plan",
    trackerActionName: "Open next session full screen",
    actionStripTestId: "guide-0-1000m-route-actions",
  },
  {
    href: "/guides/poolside",
    trackerHeading: "Poolside interactive guide",
    trackerActionName: "Open next drill",
    actionStripTestId: "guide-poolside-route-actions",
  },
];

function runOnGuideA11yProject(projectName: string) {
  test.skip(
    projectName !== "desktop-chromium" && projectName !== "mobile-chromium",
    "Guide entitlement a11y audit runs only on desktop and mobile Chromium."
  );
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

async function loginToGuideViaDevBypass(page: Page, nextPath: string) {
  const loginHref = `/dev/login?next=${encodeURIComponent(nextPath)}`;
  const loginProbe = await prewarmRoute(page, loginHref);
  if (!loginProbe || loginProbe.status() >= 500) {
    test.skip(true, "Dev auth bypass is not reachable in this environment.");
  }

  await gotoWithTransientRetry(page, loginHref);
  const destination = new URL(page.url());
  if (destination.pathname !== nextPath) {
    if (destination.pathname === "/auth/sign-in") {
      test.skip(true, "Dev auth bypass is not enabled in this environment.");
    }
    test.skip(true, `Dev auth bypass redirected to ${destination.pathname}.`);
  }

  await waitForRouteToSettle(page);
}

async function auditGuideRoute(page: Page, route: GuideRoute) {
  await loginToGuideViaDevBypass(page, route.href);

  await expectOnePageMain(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

  const headingText = (await page.getByRole("heading", { level: 1 }).innerText()).trim();

  if (headingText === "Guide access required") {
    await expectKeyboardFocusable(page.getByRole("link", { name: "View plans" }));
    await expectKeyboardFocusable(page.getByRole("link", { name: "Back to My Library" }));
  } else {
    expect(headingText).toBe(route.trackerHeading);
    await expect(page.getByTestId(route.actionStripTestId)).toBeVisible();
    await expectKeyboardFocusable(page.getByRole("button", { name: "Download PDF" }));
    await expectKeyboardFocusable(page.getByRole("link", { name: "Back to My Library" }));
    await expectKeyboardFocusable(page.getByRole("button", { name: route.trackerActionName }));
  }

  await assertNoSeriousOrCriticalAxeViolations(page);
}

test.describe("AW-006 guide entitlement and tracker accessibility audit", () => {
  test("anonymous guide routes fail closed to sign-in with stable semantics", async ({
    page,
  }, testInfo) => {
    test.slow();
    runOnGuideA11yProject(testInfo.project.name);

    for (const route of GUIDE_ROUTES) {
      await test.step(route.href, async () => {
        await gotoWithTransientRetry(page, route.href);
        await waitForRouteToSettle(page);

        const destination = new URL(page.url());
        expect(destination.pathname).toBe("/auth/sign-in");
        expect(destination.searchParams.get("next")).toBe(route.href);

        await expectOnePageMain(page);
        await expect(
          page.getByRole("heading", { name: "Sign in to continue", level: 1 })
        ).toBeVisible();
        await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
        await expectKeyboardFocusable(page.getByLabel("Email"));
        await expectKeyboardFocusable(page.getByRole("button", { name: "Email sign-in link" }));
        await assertNoSeriousOrCriticalAxeViolations(page);
      });
    }
  });

  for (const route of GUIDE_ROUTES) {
    test(`${route.href} exposes stable semantics and keyboard-reachable guide actions`, async ({
      page,
    }, testInfo) => {
      test.slow();
      runOnGuideA11yProject(testInfo.project.name);

      await auditGuideRoute(page, route);
    });
  }
});
