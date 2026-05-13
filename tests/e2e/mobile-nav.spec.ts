import { expect, test, type Locator, type Page } from "@playwright/test";
import { isMobileProject } from "./project-guards";

async function waitForPageToSettle(page: Page) {
  const compilingIndicator = page.getByText("Compiling", { exact: true });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await expect(compilingIndicator).toHaveCount(0, { timeout: 60_000 });
    await page.waitForTimeout(750);
    if ((await compilingIndicator.count()) === 0) {
      break;
    }
  }

  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );
}

async function openNavigationDrawer(page: Page, menu: Locator, drawer: Locator) {
  const openAttempts: Array<() => Promise<void>> = [
    async () => {
      await menu.click();
    },
    async () => {
      await menu.focus();
      await page.keyboard.press("Enter");
    },
    async () => {
      await menu.click();
    },
    async () => {
      await menu.focus();
      await page.keyboard.press("Space");
    },
  ];

  for (const openAttempt of openAttempts) {
    await page.keyboard.press("Escape").catch(() => {});
    await waitForPageToSettle(page);
    await menu.scrollIntoViewIfNeeded();
    await openAttempt();
    await expect(drawer)
      .toBeVisible({ timeout: 4_000 })
      .catch(() => {});
    if (await drawer.isVisible().catch(() => false)) {
      return;
    }
    await page.waitForTimeout(250);
  }

  await expect(drawer).toBeVisible();
}

test("mobile fixed nav uses contextual links and header menu toggles with Escape", async ({
  page,
}, testInfo) => {
  test.skip(
    !isMobileProject(testInfo),
    "Bottom mobile nav behavior is validated only on mobile projects."
  );
  test.slow();

  await page.goto("/contact", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await waitForPageToSettle(page);

  const nav = page.getByTestId("mobile-fixed-nav");
  await expect(nav).toBeVisible();

  const home = page.getByTestId("mobile-nav-home");
  const course = page.getByTestId("mobile-nav-course");
  const programs = page.getByTestId("mobile-nav-programs");
  const menu = page.getByTestId("header-menu-toggle");

  await expect(home).toHaveAttribute("href", "/");
  await expect(course).toHaveAttribute("href", "/course");
  await expect(programs).toHaveAttribute("href", "/programs");
  await expect(page.getByTestId("mobile-nav-menu")).toHaveCount(0);
  await expect(menu).toBeVisible();

  const homeTag = await home.evaluate((el) => el.tagName);
  const courseTag = await course.evaluate((el) => el.tagName);
  const programsTag = await programs.evaluate((el) => el.tagName);
  expect(homeTag).toBe("A");
  expect(courseTag).toBe("A");
  expect(programsTag).toBe("A");

  await expect(menu).toHaveAttribute("aria-expanded", "false");
  const drawer = page.getByRole("dialog", { name: "Navigation menu" });
  await openNavigationDrawer(page, menu, drawer);
  await expect(drawer).toBeVisible();
  await expect(menu).toHaveAttribute("aria-expanded", "true");

  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});

test("home keeps menu access and shows login CTA", async ({ page }, testInfo) => {
  test.skip(
    !isMobileProject(testInfo),
    "Home mobile navigation behavior is validated only on mobile projects."
  );
  test.slow();

  await page.goto("/", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await waitForPageToSettle(page);

  await expect(page.getByTestId("mobile-fixed-nav")).toBeHidden();
  await expect(page.getByTestId("header-menu-toggle")).toBeVisible();
  await expect(page.getByTestId("header-auth-link")).toBeVisible();
});

test("preview notify route hides fixed mobile nav and keeps header menu access", async ({
  page,
}, testInfo) => {
  test.skip(
    !isMobileProject(testInfo),
    "Early-access mobile navigation behavior is validated only on mobile projects."
  );
  test.slow();

  await page.goto("/contact?source=preview_access_notify", {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await waitForPageToSettle(page);

  await expect(page.getByTestId("mobile-fixed-nav")).toBeHidden();

  const menu = page.getByTestId("header-menu-toggle");
  const drawer = page.getByRole("dialog", { name: "Navigation menu" });

  await expect(menu).toBeVisible();
  await openNavigationDrawer(page, menu, drawer);
  await expect(drawer).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
});
