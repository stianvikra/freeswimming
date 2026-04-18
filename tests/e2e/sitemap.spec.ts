import { expect, test, type APIRequestContext } from "@playwright/test";

async function getWithSocketHangupRetry(request: APIRequestContext, url: string) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 6; attempt += 1) {
    try {
      return await request.get(url, { timeout: 20_000 });
    } catch (error) {
      lastError = error;
      const message =
        error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
      const isTransientNetworkError =
        message.includes("socket hang up") ||
        message.includes("econnreset") ||
        message.includes("fetch failed") ||
        message.includes("econnrefused") ||
        message.includes("timeout");
      if (!isTransientNetworkError || attempt === 6) {
        throw error;
      }

      await new Promise((resolve) => {
        setTimeout(resolve, 500 * attempt);
      });
    }
  }

  throw lastError;
}

test("sitemap contains canonical public routes", async ({ request }) => {
  test.slow();

  const res = await getWithSocketHangupRetry(request, "/sitemap.xml");
  expect(res.ok()).toBeTruthy();

  const xml = await res.text();
  expect(xml).toContain("<loc>https://freeswimming.org/our-method</loc>");
  expect(xml).toContain("<loc>https://freeswimming.org/privacy</loc>");
  expect(xml).toContain("<loc>https://freeswimming.org/cookies</loc>");
  expect(xml).not.toContain("<loc>https://freeswimming.org/about</loc>");
});
