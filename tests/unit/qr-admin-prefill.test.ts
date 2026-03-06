import { describe, expect, it } from "vitest";
import {
  buildAdminQrPrefillHref,
  parseAdminQrPrefillFromSearch,
} from "@/lib/qr-links/admin-prefill";

describe("admin qr prefill helpers", () => {
  it("builds admin href with sanitized prefill params", () => {
    const href = buildAdminQrPrefillHref({
      slugHint: "  MOD3-L1 ",
      destinationPath: "/course?lesson=mod3-l1",
      contentItemId: "123e4567-e89b-42d3-a456-426614174000",
      contentLabel: "  Kick basics intro  ",
      placementKey: "Course.Lesson.Share",
    });

    const url = new URL(href, "https://freeswimming.org");

    expect(url.pathname).toBe("/admin");
    expect(url.searchParams.get("tab")).toBe("qr-links");
    expect(url.searchParams.get("qrSlug")).toBe("mod3-l1");
    expect(url.searchParams.get("qrDestinationPath")).toBe("/course?lesson=mod3-l1");
    expect(url.searchParams.get("qrContentItemId")).toBe("123e4567-e89b-42d3-a456-426614174000");
    expect(url.searchParams.get("qrContentLabel")).toBe("Kick basics intro");
    expect(url.searchParams.get("qrPlacementKey")).toBe("course.lesson.share");
  });

  it("drops invalid prefill values when parsing query", () => {
    const prefill = parseAdminQrPrefillFromSearch(
      "?qrSlug=INVALID%20SLUG&qrDestinationPath=https://evil.example/steal&qrContentItemId=nope&qrPlacementKey=bad%20key"
    );

    expect(prefill).toBeNull();
  });

  it("parses valid prefill payload from query", () => {
    const prefill = parseAdminQrPrefillFromSearch(
      "?tab=qr-links&qrSlug=mod3-l2&qrDestinationPath=%2Fcourse%3Flesson%3Dmod3-l2&qrContentLabel=Standing%20Leg%20Kicks&qrPlacementKey=course.lesson.share"
    );

    expect(prefill).not.toBeNull();
    expect(prefill).toEqual({
      slug: "mod3-l2",
      destinationPath: "/course?lesson=mod3-l2",
      contentItemId: "",
      contentLabel: "Standing Leg Kicks",
      placementKey: "course.lesson.share",
    });
  });
});
