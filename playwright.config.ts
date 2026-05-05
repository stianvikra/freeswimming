import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.PW_PORT ?? 3100);
const baseURL = `http://127.0.0.1:${port}`;
const readinessURL = `${baseURL}/manifest.webmanifest`;
const nextDistDir = process.env.NEXT_DIST_DIR ?? ".next-playwright";
const siteLockEnabled = process.env.SITE_LOCK_ENABLED ?? "0";
const nextDevBundler = process.env.PW_NEXT_DEV_BUNDLER ?? "webpack";
const nextDevBundlerArg = nextDevBundler === "webpack" ? "--webpack " : "";
const nextDevMaxOldSpaceSizeMb = process.env.PW_NEXT_DEV_MAX_OLD_SPACE_SIZE_MB ?? "8192";
const workers = process.env.CI ? 1 : Number(process.env.PW_WORKERS ?? 1);
const outputDir = process.env.PW_OUTPUT_DIR ?? "/tmp/freeswimming-playwright-results";
const supabaseEnv = process.env.FS_SUPABASE_ENV ?? "test";
const useConfiguredSupabase =
  process.env.FS_ALLOW_PROD_SUPABASE === "1" || supabaseEnv === "ci" || supabaseEnv === "preview";
const supabaseUrl = useConfiguredSupabase
  ? (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.com")
  : "https://example.com";
const supabaseAnonKey = useConfiguredSupabase
  ? (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "playwright-anon-key")
  : "playwright-anon-key";
const supabaseServiceRoleKey = useConfiguredSupabase
  ? (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "playwright-service-role-key")
  : "playwright-service-role-key";

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers,
  reporter: "list",
  outputDir,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: [
      `NODE_OPTIONS="--max-old-space-size=${nextDevMaxOldSpaceSizeMb}"`,
      `NEXT_DIST_DIR=${shellQuote(nextDistDir)}`,
      `SITE_LOCK_ENABLED=${shellQuote(siteLockEnabled)}`,
      `FS_SUPABASE_ENV=${shellQuote(supabaseEnv)}`,
      `NEXT_PUBLIC_SUPABASE_URL=${shellQuote(supabaseUrl)}`,
      `NEXT_PUBLIC_SUPABASE_ANON_KEY=${shellQuote(supabaseAnonKey)}`,
      `SUPABASE_SERVICE_ROLE_KEY=${shellQuote(supabaseServiceRoleKey)}`,
      `npm run dev -- ${nextDevBundlerArg}--hostname 127.0.0.1 --port ${port}`,
    ].join(" "),
    // Use a cheap static route that stays accessible under site-lock so readiness
    // does not depend on the home page compiling before tests even start. We
    // default Playwright to webpack because local Turbopack dev servers can
    // stall indefinitely on HTML route compilation for `/`, `/contact`, and
    // `/course` on this repo, which makes the local merge gate unreliable. We
    // also cap local workers below the Playwright auto default because the full
    // matrix is otherwise prone to timeout-heavy false negatives on this repo.
    // Playwright output also lives outside the repo so trace/screenshot writes
    // do not trigger Next dev Fast Refresh mid-test. Tailwind 4 increases local
    // dev-server heap pressure enough that the full matrix can otherwise trip
    // Next's proactive dev restart threshold and create false network failures.
    url: readinessURL,
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
