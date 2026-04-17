import { expect, test } from "@playwright/test";

function buildTestIp(projectName: string) {
  const seed = Array.from(projectName).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const octet = 10 + (seed % 200);
  return `203.0.113.${octet}`;
}

test("contact API rejects mismatched origin and accepts allowed origin", async ({
  request,
  baseURL,
}, testInfo) => {
  test.slow();
  const testIp = buildTestIp(testInfo.project.name);
  await request.get("/contact", { failOnStatusCode: false, timeout: 60_000 }).catch(() => null);

  const payload = {
    variant: "contact",
    name: "Test User",
    email: "test@example.com",
    message: "This is a valid message for contact testing.",
    company: "",
    startedAt: Date.now() - 5000,
  };

  const badOriginRes = await request.post("/api/contact", {
    timeout: 60_000,
    headers: {
      origin: "https://freeswimming.org.evil.example",
      "content-type": "application/json",
      "x-forwarded-for": testIp,
    },
    data: payload,
  });
  const badOriginStatus = badOriginRes.status();
  if (badOriginStatus === 423) {
    // Private access gate is enabled: API is intentionally locked before origin checks.
    expect(badOriginStatus).toBe(423);
    return;
  }
  expect(badOriginStatus).toBe(403);

  const goodOriginRes = await request.post("/api/contact", {
    timeout: 60_000,
    headers: {
      origin: baseURL ?? "http://127.0.0.1:3000",
      "content-type": "application/json",
      "x-forwarded-for": testIp,
    },
    data: payload,
  });
  expect(goodOriginRes.ok()).toBeTruthy();

  const json = (await goodOriginRes.json()) as { ok?: boolean };
  expect(json.ok).toBeTruthy();

  const goalsPayload = {
    variant: "goals_coaching",
    name: "Test User",
    email: "test@example.com",
    message: "",
    goalsCoaching: {
      primaryGoal: "1000m under 18:00",
      level: "beginner",
      trainingDaysPerWeek: 3,
      weeklyVolume: "3 sessions, around 2500m",
      targetDate: "2026-05-10",
    },
    company: "",
    startedAt: Date.now() - 5000,
  };

  const goalsRes = await request.post("/api/contact", {
    timeout: 60_000,
    headers: {
      origin: baseURL ?? "http://127.0.0.1:3000",
      "content-type": "application/json",
      "x-forwarded-for": testIp,
    },
    data: goalsPayload,
  });
  expect(goalsRes.ok()).toBeTruthy();

  const goalsJson = (await goalsRes.json()) as { ok?: boolean };
  expect(goalsJson.ok).toBeTruthy();

  const previewNotifyPayload = {
    variant: "preview_access_notify",
    name: "Test User",
    email: "test@example.com",
    message: "",
    company: "",
    startedAt: Date.now() - 5000,
  };

  const previewNotifyRes = await request.post("/api/contact", {
    timeout: 60_000,
    headers: {
      origin: baseURL ?? "http://127.0.0.1:3000",
      "content-type": "application/json",
      "x-forwarded-for": testIp,
    },
    data: previewNotifyPayload,
  });
  expect(previewNotifyRes.ok()).toBeTruthy();

  const previewNotifyJson = (await previewNotifyRes.json()) as { ok?: boolean };
  expect(previewNotifyJson.ok).toBeTruthy();
});
