import { describe, expect, it } from "vitest";
import { COURSE_MODULES } from "@/app/course/courseData";
import { buildPlatformContentSeedItems } from "@/lib/admin/content-import";
import { GUIDE_0_TO_1000M_SESSIONS, GUIDE_0_TO_1000M_SLUG } from "@/lib/guides/guide-0-1000m";
import { GUIDE_POOLSIDE_DRILLS, GUIDE_POOLSIDE_SLUG } from "@/lib/guides/guide-poolside";

describe("buildPlatformContentSeedItems", () => {
  it("matches hardcoded platform structures with deterministic summary counts", () => {
    const lessonCount = COURSE_MODULES.reduce((total, module) => total + module.lessons.length, 0);
    const { items, summary } = buildPlatformContentSeedItems();

    expect(summary).toEqual({
      manifestVersion: 1,
      totalItems:
        COURSE_MODULES.length +
        lessonCount +
        GUIDE_0_TO_1000M_SESSIONS.length +
        GUIDE_POOLSIDE_DRILLS.length,
      courseModules: COURSE_MODULES.length,
      courseLessons: lessonCount,
      guideSessions: GUIDE_0_TO_1000M_SESSIONS.length,
      guideDrills: GUIDE_POOLSIDE_DRILLS.length,
    });
    expect(items).toHaveLength(summary.totalItems);
  });

  it("produces unique slugs and valid parent relations for lessons", () => {
    const { items } = buildPlatformContentSeedItems();
    const bySlug = new Map(items.map((item) => [item.slug, item]));

    expect(bySlug.size).toBe(items.length);
    expect(items.every((item) => item.status === "published")).toBe(true);

    const lessons = items.filter((item) => item.contentType === "course_lesson");
    expect(lessons.length).toBeGreaterThan(0);

    for (const lesson of lessons) {
      expect(lesson.parentSlug).toBeTruthy();
      const parent = bySlug.get(lesson.parentSlug ?? "");
      expect(parent?.contentType).toBe("course_module");
    }
  });

  it("marks guide content with the expected guide slugs in body metadata", () => {
    const { items } = buildPlatformContentSeedItems();
    const sessions = items.filter((item) => item.contentType === "guide_session");
    const drills = items.filter((item) => item.contentType === "guide_drill");

    expect(sessions.length).toBe(GUIDE_0_TO_1000M_SESSIONS.length);
    expect(drills.length).toBe(GUIDE_POOLSIDE_DRILLS.length);

    for (const session of sessions) {
      expect(session.body.guideSlug).toBe(GUIDE_0_TO_1000M_SLUG);
      expect(session.body._meta).toMatchObject({
        manifestVersion: 1,
        sourceCollection: "guide_session",
      });
    }

    for (const drill of drills) {
      expect(drill.body.guideSlug).toBe(GUIDE_POOLSIDE_SLUG);
      expect(drill.body._meta).toMatchObject({
        manifestVersion: 1,
        sourceCollection: "guide_drill",
      });
    }
  });

  it("adds deterministic manifest metadata and checksum per item", () => {
    const first = buildPlatformContentSeedItems().items;
    const second = buildPlatformContentSeedItems().items;

    for (let index = 0; index < first.length; index += 1) {
      const a = first[index];
      const b = second[index];
      const aMeta = (a?.body._meta ?? {}) as { manifestVersion?: number; sourceChecksum?: string };
      const bMeta = (b?.body._meta ?? {}) as { manifestVersion?: number; sourceChecksum?: string };
      expect(a?.slug).toBe(b?.slug);
      expect(a?.body._meta).toMatchObject({
        manifestVersion: 1,
      });
      expect(b?.body._meta).toMatchObject({
        manifestVersion: 1,
      });
      expect(String(aMeta.sourceChecksum)).toMatch(/^[0-9a-f]{64}$/);
      expect(aMeta.sourceChecksum).toBe(bMeta.sourceChecksum);
    }
  });
});
