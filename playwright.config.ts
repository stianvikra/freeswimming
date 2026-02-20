import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PW_PORT ?? 3100);
const baseURL = `http://127.0.0.1:${port}`;
const nextDistDir = process.env.NEXT_DIST_DIR ?? ".next-playwright";
const siteLockEnabled = process.env.SITE_LOCK_ENABLED ?? "0";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: `NEXT_DIST_DIR=${nextDistDir} SITE_LOCK_ENABLED=${siteLockEnabled} npm run dev -- --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI && process.env.PW_REUSE_EXISTING_SERVER === "1",
    timeout: 120_000,
  },
  projects: [
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 7"],
      },
    },
    {
      name: "mobile-iphone-13-pro-max",
      use: {
        ...devices["iPhone 13 Pro Max"],
      },
    },
    {
      name: "tablet-ipad-pro-11",
      use: {
        ...devices["iPad Pro 11"],
      },
    },
    {
      name: "desktop-chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "desktop-webkit",
      use: {
        ...devices["Desktop Safari"],
      },
    },
    {
      name: "desktop-firefox",
      use: {
        ...devices["Desktop Firefox"],
      },
    },
  ],
});
