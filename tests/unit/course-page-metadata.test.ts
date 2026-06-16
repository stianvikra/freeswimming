import { describe, expect, it } from "vitest";

import manifest from "@/app/manifest";
import { COURSE_LESSONS_FLAT } from "@/app/course/courseData";
import {
  buildCoursePageMetadata,
  buildCourseStructuredData,
  resolveCoursePageMetadata,
} from "@/app/course/metadata";

const WELCOME_LESSON_CANONICAL_PATH =
  "/en/course/course-module-introduction-to-the-course/course-lesson-introduction-to-the-course-welcome-course-structure";

describe("course page metadata", () => {
  it("builds stable overview metadata for /course", () => {
    const resolved = resolveCoursePageMetadata();
    const metadata = buildCoursePageMetadata();

    expect(resolved).toMatchObject({
      title: "Freestyle Course",
      description: "Free, step-by-step freestyle swimming lessons for adult learners.",
      canonicalPath: "/en/course",
      lesson: null,
      previewEnabled: false,
    });
    expect(metadata.alternates?.canonical).toBe("/en/course");
    expect(metadata.alternates?.languages).toMatchObject({
      en: "/en/course",
      "x-default": "/en/course",
    });
    expect(metadata.robots).toBeUndefined();
  });

  it("builds lesson metadata from canonical course data", () => {
    const lesson = COURSE_LESSONS_FLAT.find((candidate) => candidate.id.includes("--"));
    expect(lesson).toBeDefined();

    const resolved = resolveCoursePageMetadata({ lessonParam: lesson?.id });
    const metadata = buildCoursePageMetadata({ lessonParam: lesson?.id });

    expect(resolved.lesson?.id).toBe(lesson?.id);
    expect(resolved.title).toBe(`${lesson?.title} - Freestyle Course`);
    expect(resolved.description).toContain(lesson?.goal);
    expect(metadata.alternates?.canonical).toBe(resolved.canonicalPath);
    expect(resolved.canonicalPath).toMatch(/^\/en\/course\/course-module-/);
    expect(metadata.openGraph).toMatchObject({
      title: `${lesson?.title} - Freestyle Course`,
      description: resolved.description,
      url: resolved.canonicalPath,
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary",
      title: `${lesson?.title} - Freestyle Course`,
      description: resolved.description,
    });
  });

  it("canonicalizes legacy lesson ids before building canonical URLs", () => {
    const resolved = resolveCoursePageMetadata({ lessonParam: "mod1-l1" });

    expect(resolved.lesson?.id).toBe("intro-course--welcome-course-structure");
    expect(resolved.canonicalPath).toBe(WELCOME_LESSON_CANONICAL_PATH);
  });

  it("falls back to the course overview for unknown lesson values", () => {
    const resolved = resolveCoursePageMetadata({ lessonParam: "unknown-future-lesson" });

    expect(resolved.lesson).toBeNull();
    expect(resolved.title).toBe("Freestyle Course");
    expect(resolved.canonicalPath).toBe("/en/course");
  });

  it("keeps preview URLs out of indexing metadata", () => {
    const metadata = buildCoursePageMetadata({
      lessonParam: "intro-course--welcome-course-structure",
      previewParam: "1",
    });

    expect(metadata.robots).toMatchObject({
      index: false,
      follow: false,
    });
    expect(metadata.alternates?.canonical).toBe(WELCOME_LESSON_CANONICAL_PATH);
  });

  it("builds JSON-LD from public course lesson data", () => {
    const structuredData = buildCourseStructuredData({
      lessonParam: "mod1-l1",
    }) as { "@graph": Array<Record<string, unknown>> };

    expect(structuredData["@graph"]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          "@type": "LearningResource",
          "@id": `https://freeswimming.org${WELCOME_LESSON_CANONICAL_PATH}#lesson`,
          name: "Welcome & Course Structure",
          inLanguage: "en",
          isPartOf: {
            "@id": "https://freeswimming.org/en/course#course",
          },
        }),
        expect.objectContaining({
          "@type": "BreadcrumbList",
        }),
      ])
    );
  });

  it("keeps install manifest icons aligned with the public icon assets", () => {
    const payload = manifest();
    const icons = payload.icons ?? [];
    const iconSources = icons.map((icon) => icon.src);

    expect(payload.name).toBe("freeswimming.org");
    expect(payload.short_name).toBe("FreeSwimming");
    expect(iconSources).toEqual(
      expect.arrayContaining([
        "/icons/icon-192.png",
        "/icons/icon-512.png",
        "/icons/icon-maskable-512.png",
        "/apple-touch-icon.png",
      ])
    );
    expect(icons.find((icon) => icon.src === "/icons/icon-maskable-512.png")).toMatchObject({
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    });
  });
});
