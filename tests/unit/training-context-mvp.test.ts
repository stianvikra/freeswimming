import { describe, expect, it } from "vitest";
import {
  buildTrainingFocusInsert,
  buildTrainingNoteInsert,
  getDefaultTrainingNoteStatus,
  normalizeTrainingFocusStatus,
  isValidTrainingNoteState,
  resolveTrainingNoteResolvedAt,
} from "@/lib/training-context/mvp";

describe("training context model", () => {
  it("builds a valid focus insert payload", () => {
    const insert = buildTrainingFocusInsert({
      title: "Longer exhale before breathing",
      details: "Relax the neck and keep one goggle in the water.",
      goalId: "goal-1",
    });

    expect(insert).toMatchObject({
      title: "Longer exhale before breathing",
      goal_id: "goal-1",
      status: "open",
      is_primary: false,
    });
  });

  it("normalizes legacy active focus status to open", () => {
    expect(normalizeTrainingFocusStatus("active")).toBe("open");
  });

  it("rejects invalid focus titles", () => {
    expect(
      buildTrainingFocusInsert({
        title: "No",
      })
    ).toBeNull();
  });

  it("defaults question notes to unanswered and observation notes to open", () => {
    expect(getDefaultTrainingNoteStatus("question")).toBe("unanswered");
    expect(getDefaultTrainingNoteStatus("observation")).toBe("open");
  });

  it("builds a valid question note insert payload", () => {
    const insert = buildTrainingNoteInsert({
      noteType: "question",
      body: "Am I lifting my head before rotating to breathe?",
      goalId: "goal-1",
      focusId: "focus-1",
    });

    expect(insert).toMatchObject({
      note_type: "question",
      status: "unanswered",
      goal_id: "goal-1",
      focus_id: "focus-1",
    });
  });

  it("rejects too-short note bodies", () => {
    expect(
      buildTrainingNoteInsert({
        noteType: "observation",
        body: "No",
      })
    ).toBeNull();
  });

  it("requires answer text for answered questions and forbids answers on observations", () => {
    expect(isValidTrainingNoteState("question", "answered", null)).toBe(false);
    expect(isValidTrainingNoteState("question", "answered", "Keep one goggle down")).toBe(true);
    expect(isValidTrainingNoteState("observation", "open", "No")).toBe(false);
  });

  it("computes resolved timestamps only for resolved note states", () => {
    expect(resolveTrainingNoteResolvedAt("open", "2026-03-19T10:00:00.000Z")).toBeNull();
    expect(resolveTrainingNoteResolvedAt("answered", "2026-03-19T10:00:00.000Z")).toBe(
      "2026-03-19T10:00:00.000Z"
    );
  });
});
