import { describe, expect, it } from "vitest";
import {
  parseCreateQrRedirectLinkPayload,
  parseUpdateQrRedirectLinkPayload,
} from "@/lib/qr-links/admin";

describe("qr admin payload parser", () => {
  it("parses valid create payload", () => {
    const result = parseCreateQrRedirectLinkPayload({
      slug: "intro-video",
      destinationUrl: "https://freeswimming.org/course?lesson=mod1-l1",
      status: "active",
      contentLabel: "Module 1 intro",
      placementKey: "course.support-card",
      contentItemId: "123e4567-e89b-42d3-a456-426614174000",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toMatchObject({
      slug: "intro-video",
      status: "active",
      contentLabel: "Module 1 intro",
      placementKey: "course.support-card",
      contentItemId: "123e4567-e89b-42d3-a456-426614174000",
    });
  });

  it("rejects invalid create slug and destination", () => {
    const result = parseCreateQrRedirectLinkPayload({
      slug: "bad_slug",
      destinationUrl: "",
    });

    expect(result).toMatchObject({
      ok: false,
    });
  });

  it("parses valid update payload including clears", () => {
    const result = parseUpdateQrRedirectLinkPayload({
      destinationUrl: "https://freeswimming.org/course",
      status: "disabled",
      contentItemId: null,
      ownerUserId: "",
      contentLabel: "  New label  ",
      placementKey: "Course.Support.Card",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toMatchObject({
      destinationUrl: "https://freeswimming.org/course",
      status: "disabled",
      hasContentItemId: true,
      contentItemId: null,
      hasOwnerUserId: true,
      ownerUserId: null,
      contentLabel: "New label",
      placementKey: "course.support.card",
    });
  });

  it("rejects update payload with no changes", () => {
    const result = parseUpdateQrRedirectLinkPayload({});
    expect(result).toEqual({
      ok: false,
      error: "No changes detected.",
    });
  });

  it("rejects update payload with invalid placement key chars", () => {
    const result = parseUpdateQrRedirectLinkPayload({
      placementKey: "invalid key with spaces",
    });

    expect(result).toMatchObject({
      ok: false,
      error:
        "placementKey may only contain lowercase letters, numbers, dot, underscore, colon, or dash.",
    });
  });
});
