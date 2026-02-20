import { describe, expect, it } from "vitest";
import { buildAdminContentMirrorSnapshot } from "@/lib/admin/content-mirror";

describe("buildAdminContentMirrorSnapshot", () => {
  it("returns metrics for content and program coverage", () => {
    const snapshot = buildAdminContentMirrorSnapshot([], []);

    expect(snapshot.metrics).toHaveLength(5);
    expect(snapshot.metrics.map((entry) => entry.key)).toEqual([
      "course_module",
      "course_lesson",
      "guide_session",
      "guide_drill",
      "programs",
    ]);
    expect(snapshot.summary.mismatchCount).toBeGreaterThan(0);
  });
});
