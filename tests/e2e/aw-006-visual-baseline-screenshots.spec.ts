import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test, type Page, type TestInfo } from "@playwright/test";
import { DEFAULT_LESSON_ID } from "../../app/course/courseData";

type BaselineRoute = {
  path: string;
  ready: (page: Page) => Promise<void>;
  surface: string;
};

const baselineRoutes: BaselineRoute[] = [
  {
    surface: "home",
    path: "/",
    ready: async (page) => {
      await expect(page.getByRole("heading", { name: "Adult learner?" })).toBeVisible();
    },
  },
  {
    surface: "course",
    path: `/course?lesson=${encodeURIComponent(DEFAULT_LESSON_ID)}`,
    ready: async (page) => {
      await expect(page.getByText(/Lesson 1 of \d+/)).toBeVisible();
    },
  },
  {
    surface: "plans",
    path: "/plans",
    ready: async (page) => {
      await expect(page.getByRole("heading", { name: "Plans", exact: true })).toBeVisible();
    },
  },
  {
    surface: "programs",
    path: "/programs",
    ready: async (page) => {
      await expect(page.getByRole("heading", { name: "Swim Programs", exact: true })).toBeVisible();
    },
  },
  {
    surface: "analysis",
    path: "/analysis",
    ready: async (page) => {
      await expect(
        page.getByRole("heading", { name: "Video Analysis", exact: true })
      ).toBeVisible();
    },
  },
  {
    surface: "our-method",
    path: "/our-method",
    ready: async (page) => {
      await expect(page.getByRole("heading", { name: "Our Method", exact: true })).toBeVisible();
    },
  },
  {
    surface: "contact",
    path: "/contact",
    ready: async (page) => {
      await expect(page.getByRole("heading", { name: "Contact", exact: true })).toBeVisible();
    },
  },
];

const supportedProjects = new Map([
  ["desktop-chromium", "desktop"],
  ["mobile-chromium", "mobile"],
]);

function resolveOutputDir(testInfo: TestInfo) {
  return process.env.SCREENSHOT_DIR ?? testInfo.outputPath("aw-006-visual-baseline");
}

function screenshotPath(outputDir: string, route: BaselineRoute, viewport: string) {
  return join(outputDir, `reference-${route.surface}-${viewport}.png`);
}

async function waitForBaselineUi(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle", { timeout: 5_000 }).catch(() => undefined);
  await page.evaluate(async () => {
    if ("fonts" in document) {
      await document.fonts.ready;
    }

    const nearViewportImages = Array.from(document.images).filter((image) => {
      const rect = image.getBoundingClientRect();
      return rect.bottom >= -window.innerHeight && rect.top <= window.innerHeight * 2;
    });

    await Promise.race([
      Promise.all(
        nearViewportImages.map(
          (image) =>
            new Promise<void>((resolve) => {
              if (image.complete) {
                resolve();
                return;
              }

              image.addEventListener("load", () => resolve(), { once: true });
              image.addEventListener("error", () => resolve(), { once: true });
            })
        )
      ),
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, 2_500);
      }),
    ]);
  });
  await page.waitForTimeout(250);
}

test("capture AW-006 public route visual baseline screenshots", async ({ page }, testInfo) => {
  test.skip(
    process.env.FS_AW006_VISUAL_BASELINE !== "1",
    "Enable with npm run screenshots:aw006-baseline."
  );

  const viewport = supportedProjects.get(testInfo.project.name);
  if (!viewport) {
    test.skip(true, "AW-006 visual baselines are captured only on mobile and desktop Chromium.");
    return;
  }
  test.slow();
  test.setTimeout(180_000);

  const outputDir = resolveOutputDir(testInfo);
  mkdirSync(outputDir, { recursive: true });

  for (const route of baselineRoutes) {
    await page.goto(route.path);
    await waitForBaselineUi(page);
    await route.ready(page);
    await page.screenshot({
      animations: "disabled",
      caret: "hide",
      fullPage: true,
      path: screenshotPath(outputDir, route, viewport),
    });
  }
});
