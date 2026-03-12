import { expect, test, type APIRequestContext } from "@playwright/test";

async function getWithSocketHangupRetry(request: APIRequestContext, url: string) {
  try {
    return await request.get(url);
  } catch (error) {
    const message =
      error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    if (!message.includes("socket hang up")) {
      throw error;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 250);
    });
    return request.get(url);
  }
}

test("sitemap contains canonical public routes", async ({ request }) => {
  const res = await getWithSocketHangupRetry(request, "/sitemap.xml");
  expect(res.ok()).toBeTruthy();

  const xml = await res.text();
  expect(xml).toContain("<loc>https://freeswimming.org/our-method</loc>");
  expect(xml).toContain("<loc>https://freeswimming.org/privacy</loc>");
  expect(xml).toContain("<loc>https://freeswimming.org/cookies</loc>");
  expect(xml).not.toContain("<loc>https://freeswimming.org/about</loc>");
});
