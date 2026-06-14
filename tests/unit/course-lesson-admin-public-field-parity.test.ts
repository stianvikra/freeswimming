import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

type LessonFieldMapping = {
  publicSection: string;
  adminFieldLabel: string | null;
  dataKey: string;
  editable: boolean;
  reasonIfNo: string | null;
};

const COURSE_LESSON_FIELD_MAPPING: LessonFieldMapping[] = [
  {
    publicSection: "Video / estimated time",
    adminFieldLabel: "Video ID",
    dataKey: "body.youtubeId",
    editable: true,
    reasonIfNo: null,
  },
  {
    publicSection: "Video / estimated time",
    adminFieldLabel: "Estimated minutes",
    dataKey: "body.estMinutes",
    editable: true,
    reasonIfNo: null,
  },
  {
    publicSection: "Lesson goal",
    adminFieldLabel: "Lesson goal",
    dataKey: "body.goal",
    editable: true,
    reasonIfNo: null,
  },
  {
    publicSection: "Quick explanation",
    adminFieldLabel: "Quick explanation",
    dataKey: "body.lessonExperience.quickExplanation",
    editable: true,
    reasonIfNo: null,
  },
  {
    publicSection: "Why this matters",
    adminFieldLabel: "Why this matters",
    dataKey: "body.lessonExperience.whyThisMatters",
    editable: true,
    reasonIfNo: null,
  },
  {
    publicSection: "Dryland practice",
    adminFieldLabel: "Dryland practice title",
    dataKey: "body.lessonExperience.landPractice.title",
    editable: true,
    reasonIfNo: null,
  },
  {
    publicSection: "Dryland practice",
    adminFieldLabel: "Dryland practice steps (one per line)",
    dataKey: "body.lessonExperience.landPractice.steps",
    editable: true,
    reasonIfNo: null,
  },
  {
    publicSection: "Dryland practice safety note",
    adminFieldLabel: "Dryland practice safety note",
    dataKey: "body.lessonExperience.landPractice.safetyNote",
    editable: true,
    reasonIfNo: null,
  },
  {
    publicSection: "Pool drill / water practice",
    adminFieldLabel: "Pool drill title",
    dataKey: "body.lessonExperience.waterPractice.title",
    editable: true,
    reasonIfNo: null,
  },
  {
    publicSection: "Pool drill / water practice",
    adminFieldLabel: "Pool drill steps (one per line)",
    dataKey: "body.lessonExperience.waterPractice.steps",
    editable: true,
    reasonIfNo: null,
  },
  {
    publicSection: "Pool drill / water practice safety note",
    adminFieldLabel: "Water practice safety note",
    dataKey: "body.lessonExperience.waterPractice.safetyNote",
    editable: true,
    reasonIfNo: null,
  },
  {
    publicSection: "What good looks and feels like",
    adminFieldLabel: "What good looks and feels like (one per line)",
    dataKey: "body.lessonExperience.feelCues",
    editable: true,
    reasonIfNo: null,
  },
  {
    publicSection: "Common mistakes",
    adminFieldLabel: "Common mistake",
    dataKey: "body.lessonExperience.commonMistakes[].mistake",
    editable: true,
    reasonIfNo: null,
  },
  {
    publicSection: "Common mistakes",
    adminFieldLabel: "Correction",
    dataKey: "body.lessonExperience.commonMistakes[].fix",
    editable: true,
    reasonIfNo: null,
  },
  {
    publicSection: "Pass criteria",
    adminFieldLabel: "Pass criteria (one per line)",
    dataKey: "body.passCriteria",
    editable: true,
    reasonIfNo: null,
  },
  {
    publicSection: "Next step",
    adminFieldLabel: "Next step",
    dataKey: "body.lessonExperience.nextStep",
    editable: true,
    reasonIfNo: null,
  },
  {
    publicSection: "Support card",
    adminFieldLabel: "Support card title",
    dataKey: "body.lessonExperience.support.title",
    editable: true,
    reasonIfNo: null,
  },
  {
    publicSection: "Support card",
    adminFieldLabel: "Support card body",
    dataKey: "body.lessonExperience.support.body",
    editable: true,
    reasonIfNo: null,
  },
  {
    publicSection: "Practice image assets",
    adminFieldLabel: null,
    dataKey: "body.lessonExperience.landPractice.image / waterPractice.image",
    editable: false,
    reasonIfNo: "Deferred to Lesson Media And Visual Asset Admin V1.",
  },
];

function readRepoFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("course lesson admin/public field parity audit", () => {
  it("documents every public lesson section with an editable admin field or explicit deviation", () => {
    const publicSections = new Set(COURSE_LESSON_FIELD_MAPPING.map((row) => row.publicSection));

    expect([...publicSections]).toEqual([
      "Video / estimated time",
      "Lesson goal",
      "Quick explanation",
      "Why this matters",
      "Dryland practice",
      "Dryland practice safety note",
      "Pool drill / water practice",
      "Pool drill / water practice safety note",
      "What good looks and feels like",
      "Common mistakes",
      "Pass criteria",
      "Next step",
      "Support card",
      "Practice image assets",
    ]);

    for (const row of COURSE_LESSON_FIELD_MAPPING) {
      if (row.editable) {
        expect(row.adminFieldLabel, row.publicSection).toBeTruthy();
        expect(row.reasonIfNo, row.publicSection).toBeNull();
      } else {
        expect(row.adminFieldLabel, row.publicSection).toBeNull();
        expect(row.reasonIfNo, row.publicSection).toMatch(/Deferred|fallback/i);
      }
    }
  });

  it("keeps editable admin labels and field-separation affordances in the lesson editor", () => {
    const adminSource = readRepoFile("components/admin/AdminContentManager.tsx");

    for (const row of COURSE_LESSON_FIELD_MAPPING.filter((mapping) => mapping.editable)) {
      expect(adminSource, row.dataKey).toContain(row.adminFieldLabel);
    }

    expect(adminSource).toContain("Public lesson mirror");
    expect(adminSource).toContain("Shown on lesson page");
    expect(adminSource).toContain("Admin/list fallback");
    expect(adminSource).toContain("Admin/list only");
    expect(adminSource).toContain("Advanced/fallback fields");
    expect(adminSource).toContain("Advanced/fallback");
    expect(adminSource).toContain("Hidden from lesson page");
    expect(adminSource).toContain("Show safety note");
    expect(adminSource).toContain("admin-auto-grow-textarea");
    expect(adminSource).toContain("admin-lesson-dryland-visual-placeholder");
    expect(adminSource).toContain("admin-lesson-water-visual-placeholder");
    expect(adminSource).toContain("Media deferred");
    expect(adminSource).toContain("View changes");
    expect(adminSource).not.toContain("Checkpoint criteria (one per line)");
    expect(adminSource).not.toContain("Show on public lesson");
    expect(adminSource).not.toContain("Legacy section visibility");
  });
});
