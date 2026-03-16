import { describe, expect, it } from "vitest";
import {
  toPublishedGuide0To1000Sessions,
  toPublishedPoolsideDrills,
} from "@/lib/admin/content-published";
import { GUIDE_0_TO_1000M_SESSIONS } from "@/lib/guides/guide-0-1000m";
import { GUIDE_POOLSIDE_DRILLS } from "@/lib/guides/guide-poolside";

describe("toPublishedGuide0To1000Sessions", () => {
  it("returns fallback when rows are empty", () => {
    expect(toPublishedGuide0To1000Sessions([])).toEqual(GUIDE_0_TO_1000M_SESSIONS);
  });

  it("maps body fields and keeps stable unique session ids", () => {
    const rows = [
      {
        id: "row-1",
        slug: "guide-0-1000m-session-s01",
        title: "Session 1 mapped",
        summary: "Fallback summary 1",
        sort_order: 0,
        body: {
          sessionId: "S01",
          weekNumber: 1,
          focus: "Mapped focus 1",
          targetSet: "Mapped set 1",
        },
      },
      {
        id: "row-2",
        slug: "guide-0-1000m-session-s01",
        title: "Duplicate should be ignored",
        summary: "Fallback summary 2",
        sort_order: 1,
        body: {
          sessionId: "S01",
          weekNumber: 1,
        },
      },
      {
        id: "row-3",
        slug: "guide-0-1000m-session-s02",
        title: "Session 2 mapped",
        summary: "Fallback summary 3",
        sort_order: 2,
        body: {
          sessionId: "S02",
          weekNumber: 1,
        },
      },
    ];

    const sessions = toPublishedGuide0To1000Sessions(rows);
    expect(sessions).toHaveLength(2);
    expect(sessions[0]).toEqual({
      id: "S01",
      weekNumber: 1,
      title: "Session 1 mapped",
      focus: "Mapped focus 1",
      targetSet: "Mapped set 1",
    });
    expect(sessions[1]?.id).toBe("S02");
  });

  it("keeps legacy slug fallback compatibility for guide sessions without explicit body ids", () => {
    const sessions = toPublishedGuide0To1000Sessions([
      {
        id: "legacy-row",
        slug: "guide-0-1000m-session-s03",
        title: "Legacy session row",
        summary: "Fallback summary",
        sort_order: 2,
        body: {},
      },
    ]);

    expect(sessions[0]?.id).toBe("S03");
  });
});

describe("toPublishedPoolsideDrills", () => {
  it("returns fallback when rows are empty", () => {
    expect(toPublishedPoolsideDrills([])).toEqual(GUIDE_POOLSIDE_DRILLS);
  });

  it("uses deterministic defaults when body fields are missing", () => {
    const rows = [
      {
        id: "row-drill-1",
        slug: "guide-poolside-drill-d01",
        title: "Mapped drill title",
        summary: "Mapped summary",
        sort_order: 0,
        body: {
          drillId: "D01",
        },
      },
    ];

    const drills = toPublishedPoolsideDrills(rows);
    expect(drills).toHaveLength(1);
    expect(drills[0]?.id).toBe("D01");
    expect(drills[0]?.title).toBe("Mapped drill title");
    expect(drills[0]?.summary).toBe("Mapped summary");
    expect(drills[0]?.setup).toBe("Mapped summary");
    expect(drills[0]?.keyFocus).toEqual(["Mapped summary"]);
    expect(drills[0]?.visualAssetPath).toBe("/guides/poolside/drill-01.svg");
    expect(drills[0]?.visualAlt).toBe("Mapped drill title");
  });

  it("keeps legacy slug fallback compatibility for guide drills without explicit body ids", () => {
    const drills = toPublishedPoolsideDrills([
      {
        id: "legacy-drill-row",
        slug: "guide-poolside-drill-d12",
        title: "Legacy drill row",
        summary: "Fallback summary",
        sort_order: 11,
        body: {},
      },
    ]);

    expect(drills[0]?.id).toBe("D12");
  });
});
