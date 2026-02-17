import { describe, expect, it } from "vitest";
import { getFirstIncompleteId, splitItemsByCompletion } from "@/lib/guides/guide-tracker-ui";

type Item = { id: string };

const ITEMS: Item[] = [{ id: "A" }, { id: "B" }, { id: "C" }];

describe("guide tracker ui helpers", () => {
  it("splits items into incomplete and completed by progress map", () => {
    const split = splitItemsByCompletion(ITEMS, {
      A: { completed: true },
      B: { completed: false },
      C: { completed: true },
    });

    expect(split.incomplete.map((item) => item.id)).toEqual(["B"]);
    expect(split.completed.map((item) => item.id)).toEqual(["A", "C"]);
  });

  it("returns first incomplete id, otherwise first item id", () => {
    expect(
      getFirstIncompleteId(ITEMS, {
        A: { completed: true },
        B: { completed: false },
        C: { completed: true },
      })
    ).toBe("B");

    expect(
      getFirstIncompleteId(ITEMS, {
        A: { completed: true },
        B: { completed: true },
        C: { completed: true },
      })
    ).toBe("A");
  });

  it("returns null for empty input", () => {
    expect(getFirstIncompleteId([], {})).toBeNull();
  });
});
