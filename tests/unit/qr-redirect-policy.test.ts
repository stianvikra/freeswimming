import { describe, expect, it } from "vitest";
import {
  resolveQrRedirectAllowedHosts,
  validateQrRedirectDestination,
} from "@/lib/qr-links/redirect-policy";

describe("qr redirect destination policy", () => {
  it("includes defaults, request host, and env allowlist hosts", () => {
    const hosts = resolveQrRedirectAllowedHosts({
      rawAllowlist: "videos.example.com, https://media.example.org",
      requestHostname: "preview.freeswimming.org",
    });

    expect(hosts.has("freeswimming.org")).toBe(true);
    expect(hosts.has("www.freeswimming.org")).toBe(true);
    expect(hosts.has("preview.freeswimming.org")).toBe(true);
    expect(hosts.has("videos.example.com")).toBe(true);
    expect(hosts.has("media.example.org")).toBe(true);
  });

  it("accepts https destination for allowlisted host", () => {
    const result = validateQrRedirectDestination("https://freeswimming.org/course?lesson=mod1-l1", {
      allowedHosts: new Set(["freeswimming.org"]),
    });

    expect(result).toMatchObject({
      ok: true,
      destinationHost: "freeswimming.org",
    });
  });

  it("blocks non-https destination", () => {
    const result = validateQrRedirectDestination("http://freeswimming.org/course", {
      allowedHosts: new Set(["freeswimming.org"]),
    });

    expect(result).toEqual({
      ok: false,
      reason: "invalid_protocol",
    });
  });

  it("blocks destination with credentials in URL", () => {
    const result = validateQrRedirectDestination("https://user:pass@freeswimming.org/course", {
      allowedHosts: new Set(["freeswimming.org"]),
    });

    expect(result).toEqual({
      ok: false,
      reason: "credentials_not_allowed",
    });
  });

  it("blocks destination host outside allowlist", () => {
    const result = validateQrRedirectDestination("https://evil.example/phish", {
      allowedHosts: new Set(["freeswimming.org"]),
    });

    expect(result).toEqual({
      ok: false,
      reason: "disallowed_host",
    });
  });
});
