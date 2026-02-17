import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getDevAuthBypassConfig,
  isDevAuthBypassEnabled,
  isDevAuthTokenValid,
  isLocalDevelopmentRequest,
  isLocalHostOrIp,
} from "@/lib/auth/dev-auth-bypass";

function buildRequest(headers: Record<string, string>) {
  return new Request("http://127.0.0.1:3000/api/dev-login", {
    method: "POST",
    headers,
    body: "{}",
  });
}

describe("dev auth bypass helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("enables bypass only for development mode with explicit flag", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("DEV_AUTH_BYPASS_ENABLED", "1");
    expect(isDevAuthBypassEnabled()).toBe(true);

    vi.stubEnv("DEV_AUTH_BYPASS_ENABLED", "0");
    expect(isDevAuthBypassEnabled()).toBe(false);

    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("DEV_AUTH_BYPASS_ENABLED", "1");
    expect(isDevAuthBypassEnabled()).toBe(false);
  });

  it("loads required bypass config values from env", () => {
    vi.stubEnv("DEV_AUTH_BYPASS_TOKEN", "token-value");
    vi.stubEnv("DEV_AUTH_BYPASS_EMAIL", " Dev.User@Example.com ");
    vi.stubEnv("DEV_AUTH_BYPASS_PASSWORD", "password-value");

    expect(getDevAuthBypassConfig()).toEqual({
      token: "token-value",
      email: "dev.user@example.com",
      password: "password-value",
    });
  });

  it("throws if bypass config env is missing", () => {
    vi.stubEnv("DEV_AUTH_BYPASS_TOKEN", "");
    vi.stubEnv("DEV_AUTH_BYPASS_EMAIL", "");
    vi.stubEnv("DEV_AUTH_BYPASS_PASSWORD", "");

    expect(() => getDevAuthBypassConfig()).toThrowError(
      "Missing required environment variable: DEV_AUTH_BYPASS_TOKEN"
    );
  });

  it("validates token equality safely", () => {
    expect(isDevAuthTokenValid("same-token", "same-token")).toBe(true);
    expect(isDevAuthTokenValid("bad-token", "same-token")).toBe(false);
    expect(isDevAuthTokenValid(null, "same-token")).toBe(false);
  });

  it("recognizes localhost, loopback, and private hosts", () => {
    expect(isLocalHostOrIp("localhost")).toBe(true);
    expect(isLocalHostOrIp("127.0.0.1")).toBe(true);
    expect(isLocalHostOrIp("192.168.1.42")).toBe(true);
    expect(isLocalHostOrIp("10.1.2.3")).toBe(true);
    expect(isLocalHostOrIp("172.16.0.9")).toBe(true);
    expect(isLocalHostOrIp("172.31.255.10")).toBe(true);
    expect(isLocalHostOrIp("172.32.0.1")).toBe(false);
    expect(isLocalHostOrIp("freeswimming.org")).toBe(false);
  });

  it("allows only local development requests", () => {
    const okLocal = buildRequest({
      "content-type": "application/json",
      origin: "http://127.0.0.1:3000",
      "x-forwarded-host": "127.0.0.1:3000",
      "x-forwarded-for": "127.0.0.1",
    });
    expect(isLocalDevelopmentRequest(okLocal)).toBe(true);

    const badHost = buildRequest({
      "content-type": "application/json",
      origin: "http://127.0.0.1:3000",
      "x-forwarded-host": "freeswimming.org",
    });
    expect(isLocalDevelopmentRequest(badHost)).toBe(false);

    const badOrigin = buildRequest({
      "content-type": "application/json",
      origin: "https://freeswimming.org",
      "x-forwarded-host": "127.0.0.1:3000",
    });
    expect(isLocalDevelopmentRequest(badOrigin)).toBe(false);

    const badForwardedIp = buildRequest({
      "content-type": "application/json",
      origin: "http://127.0.0.1:3000",
      "x-forwarded-host": "127.0.0.1:3000",
      "x-forwarded-for": "203.0.113.18",
    });
    expect(isLocalDevelopmentRequest(badForwardedIp)).toBe(false);
  });
});
