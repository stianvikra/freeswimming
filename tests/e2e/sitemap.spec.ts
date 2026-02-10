import { expect, test } from "@playwright/test";

test("sitemap contains canonical how-we-teach route", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.ok()).toBeTruthy();

  const xml = await res.text();
  expect(xml).toContain("<loc>https://freeswimming.org/how-we-teach</loc>");
  expect(xml).not.toContain("<loc>https://freeswimming.org/about</loc>");
});
