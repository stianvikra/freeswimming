import { expect, test } from "@playwright/test";

test("sitemap contains canonical public routes", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.ok()).toBeTruthy();

  const xml = await res.text();
  expect(xml).toContain("<loc>https://freeswimming.org/our-method</loc>");
  expect(xml).toContain("<loc>https://freeswimming.org/privacy</loc>");
  expect(xml).toContain("<loc>https://freeswimming.org/cookies</loc>");
  expect(xml).not.toContain("<loc>https://freeswimming.org/about</loc>");
});
