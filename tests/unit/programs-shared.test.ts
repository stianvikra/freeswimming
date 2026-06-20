import { describe, expect, it } from "vitest";
import {
  buildProgramAssignmentDate,
  buildManualProgramStarterState,
  countProgramAssignments,
  normalizeProgramForPersistence,
} from "@/lib/programs/shared";

describe("programs shared", () => {
  it("builds a canonical starter program shell", () => {
    const starter = buildManualProgramStarterState(new Date("2026-06-24T12:00:00.000Z"));

    expect(starter.title).toBe("New program");
    expect(starter.startsOn).toBe("2026-06-22");
    expect(starter.weeks).toHaveLength(1);
    expect(starter.weeks[0]?.label).toBe("Week 1");
    expect(starter.weeks[0]?.assignments).toEqual([]);
  });

  it("normalizes assignment ordering within each day", () => {
    const normalized = normalizeProgramForPersistence({
      title: "Race prep shell",
      startsOn: "2026-06-22",
      weeks: [
        {
          id: "week-1",
          label: "Week 1",
          assignments: [
            { id: "a-2", workoutId: "workout-2", dayIndex: 0, position: 3 },
            { id: "a-1", workoutId: "workout-1", dayIndex: 0, position: 0 },
            { id: "a-3", workoutId: "workout-3", dayIndex: 2, position: 7 },
          ],
        },
      ],
    });

    expect(normalized.ok).toBe(true);
    if (!normalized.ok) return;

    expect(normalized.value.startsOn).toBe("2026-06-22");
    expect(normalized.value.weeks[0]?.assignments).toEqual([
      { id: "a-1", workoutId: "workout-1", dayIndex: 0, position: 0 },
      { id: "a-2", workoutId: "workout-2", dayIndex: 0, position: 1 },
      { id: "a-3", workoutId: "workout-3", dayIndex: 2, position: 0 },
    ]);
    expect(countProgramAssignments(normalized.value.weeks)).toBe(3);
  });

  it("rejects duplicate assignment ids", () => {
    const normalized = normalizeProgramForPersistence({
      title: "Race prep shell",
      startsOn: "2026-06-22",
      weeks: [
        {
          id: "week-1",
          label: "Week 1",
          assignments: [
            { id: "duplicate", workoutId: "workout-1", dayIndex: 0, position: 0 },
            { id: "duplicate", workoutId: "workout-2", dayIndex: 1, position: 0 },
          ],
        },
      ],
    });

    expect(normalized).toEqual({
      ok: false,
      error: "Week 1 includes a duplicated assignment id.",
    });
  });

  it("requires program startsOn to be a Monday before persistence", () => {
    expect(
      normalizeProgramForPersistence({
        title: "Race prep shell",
        startsOn: "2026-06-23",
        weeks: [{ id: "week-1", label: "Week 1", assignments: [] }],
      })
    ).toEqual({
      ok: false,
      error: "Week 1 start date must be a Monday.",
    });
    expect(
      normalizeProgramForPersistence({
        title: "Race prep shell",
        startsOn: null,
        weeks: [{ id: "week-1", label: "Week 1", assignments: [] }],
      })
    ).toEqual({
      ok: false,
      error: "Choose a Monday start date for week 1 before saving.",
    });
  });

  it("derives planned assignment dates from the program start week", () => {
    expect(buildProgramAssignmentDate("2026-06-22", 0, 0)).toBe("2026-06-22");
    expect(buildProgramAssignmentDate("2026-06-22", 0, 6)).toBe("2026-06-28");
    expect(buildProgramAssignmentDate("2026-06-22", 2, 3)).toBe("2026-07-09");
  });
});
