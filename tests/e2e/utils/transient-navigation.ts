import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

const DEFAULT_INITIAL_TIMEOUT_MS = 90_000;
const DEFAULT_RETRY_TIMEOUT_MS = 60_000;
const ROUTE_SETTLE_TIMEOUT_MS = 60_000;
const POST_COMMIT_DOMCONTENT_TIMEOUT_MS = 15_000;
const RETRY_URL_SETTLE_TIMEOUT_MS = 3_000;
const RETRY_DELAY_MS = 2_000;
const MAX_GOTO_ATTEMPTS = 8;

function resolveTargetUrl(page: Page, href: string) {
  const currentUrl = page.url();
  const baseUrl = currentUrl.startsWith("http") ? currentUrl : "http://127.0.0.1:3100";
  return new URL(href, baseUrl);
}

function currentPageMatchesTarget(page: Page, href: string) {
  if (page.isClosed()) {
    return false;
  }

  try {
    const currentUrl = new URL(page.url());
    const targetUrl = resolveTargetUrl(page, href);
    return currentUrl.pathname === targetUrl.pathname && currentUrl.search === targetUrl.search;
  } catch {
    return false;
  }
}

function isTransientGotoError(error: unknown) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return /ERR_ABORTED|ERR_CONNECTION_REFUSED|ERR_CONNECTION_RESET|ECONNRESET|Could not connect to the server|frame was detached|interrupted by another navigation|page\.goto: Timeout \d+ms exceeded/i.test(
    errorMessage
  );
}

export async function prewarmRoute(
  page: Page,
  href: string,
  timeoutMs = DEFAULT_INITIAL_TIMEOUT_MS
) {
  return page.request
    .get(href, {
      timeout: timeoutMs,
      failOnStatusCode: false,
    })
    .catch(() => null);
}

export async function gotoWithTransientRetry(
  page: Page,
  href: string,
  initialTimeoutMs = DEFAULT_INITIAL_TIMEOUT_MS
) {
  for (let attempt = 0; attempt < MAX_GOTO_ATTEMPTS; attempt += 1) {
    await prewarmRoute(page, href, attempt === 0 ? initialTimeoutMs : DEFAULT_RETRY_TIMEOUT_MS);

    try {
      await page.goto(href, {
        waitUntil: "commit",
        timeout: attempt === 0 ? initialTimeoutMs : DEFAULT_RETRY_TIMEOUT_MS,
      });
      await page
        .waitForLoadState("domcontentloaded", { timeout: POST_COMMIT_DOMCONTENT_TIMEOUT_MS })
        .catch(() => null);
      return;
    } catch (error) {
      if (currentPageMatchesTarget(page, href)) {
        return;
      }

      if (!isTransientGotoError(error) || attempt === MAX_GOTO_ATTEMPTS - 1) {
        throw error;
      }

      if (page.isClosed()) {
        throw error;
      }

      const settledAfterError = await page
        .waitForURL(
          (url) => {
            try {
              const targetUrl = resolveTargetUrl(page, href);
              return url.pathname === targetUrl.pathname && url.search === targetUrl.search;
            } catch {
              return false;
            }
          },
          {
            timeout: RETRY_URL_SETTLE_TIMEOUT_MS,
            waitUntil: "commit",
          }
        )
        .then(() => true)
        .catch(() => false);

      if (settledAfterError || currentPageMatchesTarget(page, href)) {
        await page
          .waitForLoadState("domcontentloaded", { timeout: POST_COMMIT_DOMCONTENT_TIMEOUT_MS })
          .catch(() => null);
        return;
      }

      if (page.isClosed()) {
        throw error;
      }

      await page.waitForTimeout(RETRY_DELAY_MS * (attempt + 1));
    }
  }
}

export async function waitForRouteToSettle(page: Page) {
  const compilingIndicator = page.getByText("Compiling", { exact: true });

  await expect
    .poll(
      async () => {
        if (page.isClosed()) return "closed";
        return (await compilingIndicator.count()) === 0 ? "settled" : "compiling";
      },
      { timeout: ROUTE_SETTLE_TIMEOUT_MS }
    )
    .toBe("settled");

  await page.waitForTimeout(300);
}

type ClickHrefFallbackOptions = {
  page: Page;
  trigger: Locator;
  href: string;
  expectedUrl: RegExp;
  clickNavigationTimeoutMs?: number;
  gotoTimeoutMs?: number;
};

export async function clickHrefAndAwaitUrlOrRetryGoto({
  page,
  trigger,
  href,
  expectedUrl,
  clickNavigationTimeoutMs = 10_000,
  gotoTimeoutMs = DEFAULT_RETRY_TIMEOUT_MS,
}: ClickHrefFallbackOptions) {
  await trigger.click();
  const navigatedAfterClick = await page
    .waitForURL(expectedUrl, {
      timeout: clickNavigationTimeoutMs,
      waitUntil: "domcontentloaded",
    })
    .then(() => true)
    .catch(() => false);

  if (!navigatedAfterClick) {
    await gotoWithTransientRetry(page, href, gotoTimeoutMs);
    await expect(page).toHaveURL(expectedUrl);
  }
}
