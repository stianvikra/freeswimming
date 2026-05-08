import { describe, expect, it } from "vitest";
import { buildManualDrylandStarterDraft } from "@/lib/dryland/manual";

describe("buildManualDrylandStarterDraft", () => {
  it("creates a custom-only strength starter draft", () => {
    const draft = buildManualDrylandStarterDraft("strength", new Date("2026-05-07T10:00:00.000Z"));
    const exercise = draft.exercises[0];

    expect(draft.title).toBe("Strength session 2026-05-07");
    expect(draft.sessionKind).toBe("strength");
    expect(exercise?.source).toBe("custom");
    expect(exercise?.bankExerciseId).toBeNull();
    expect(exercise?.sets).toHaveLength(3);
    expect(exercise?.sets.every((set) => set.reps === 8 && set.holdSeconds === null)).toBe(true);
  });

  it("creates a custom-only stretching starter draft", () => {
    const draft = buildManualDrylandStarterDraft(
      "stretching",
      new Date("2026-05-07T10:00:00.000Z")
    );
    const exercise = draft.exercises[0];

    expect(draft.title).toBe("Stretching session 2026-05-07");
    expect(draft.sessionKind).toBe("stretching");
    expect(exercise?.source).toBe("custom");
    expect(exercise?.bankExerciseId).toBeNull();
    expect(exercise?.sets).toHaveLength(2);
    expect(exercise?.sets.every((set) => set.holdSeconds === 30 && set.reps === null)).toBe(true);
  });
});
