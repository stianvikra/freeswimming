type CourseLessonRuntimeIdentity = {
  canonicalLessonId: string;
  canonicalLessonSlug: string;
  legacyLessonIds: string[];
  legacyLessonSlugs?: string[];
};

type CourseModuleRuntimeIdentity = {
  canonicalModuleId: string;
  canonicalModuleSlug: string;
  legacyModuleIds: string[];
  legacyModuleSlugs?: string[];
  lessons: CourseLessonRuntimeIdentity[];
};

const COURSE_MODULE_RUNTIME_IDENTITIES: CourseModuleRuntimeIdentity[] = [
  {
    canonicalModuleId: "intro-course",
    canonicalModuleSlug: "course-module-introduction-to-the-course",
    legacyModuleIds: ["mod1"],
    lessons: [
      {
        canonicalLessonId: "intro-course--welcome-course-structure",
        canonicalLessonSlug: "course-lesson-introduction-to-the-course-welcome-course-structure",
        legacyLessonIds: ["mod1-l1"],
      },
      {
        canonicalLessonId: "intro-course--course-navigation-basics",
        canonicalLessonSlug: "course-lesson-introduction-to-the-course-course-navigation-basics",
        legacyLessonIds: ["mod1-l2"],
      },
      {
        canonicalLessonId: "intro-course--equipment-that-helps",
        canonicalLessonSlug: "course-lesson-introduction-to-the-course-equipment-that-helps",
        legacyLessonIds: ["mod1-l3"],
      },
    ],
  },
  {
    canonicalModuleId: "pool-drills",
    canonicalModuleSlug: "course-module-pool-drills",
    legacyModuleIds: ["mod2"],
    lessons: [
      {
        canonicalLessonId: "pool-drills--why-drills-work",
        canonicalLessonSlug: "course-lesson-pool-drills-why-drills-work",
        legacyLessonIds: ["mod2-l1"],
      },
    ],
  },
  {
    canonicalModuleId: "kick-drills",
    canonicalModuleSlug: "course-module-kick-drills",
    legacyModuleIds: ["mod3"],
    lessons: [
      {
        canonicalLessonId: "kick-drills--kick-basics-support-not-speed",
        canonicalLessonSlug: "course-lesson-kick-drills-kick-basics-support-not-speed",
        legacyLessonIds: ["mod3-l1"],
      },
      {
        canonicalLessonId: "kick-drills--standing-leg-kicks-poolside",
        canonicalLessonSlug: "course-lesson-kick-drills-standing-leg-kicks-poolside",
        legacyLessonIds: ["mod3-l2"],
      },
    ],
  },
  {
    canonicalModuleId: "body-position",
    canonicalModuleSlug: "course-module-body-position-drills",
    legacyModuleIds: ["mod4"],
    legacyModuleSlugs: ["course-module-breathing-and-floating"],
    lessons: [
      {
        canonicalLessonId: "body-position--body-position-skill",
        canonicalLessonSlug: "course-lesson-body-position-drills-body-position-skill",
        legacyLessonIds: ["mod4-l1"],
      },
      {
        canonicalLessonId: "body-position--body-position-back",
        canonicalLessonSlug: "course-lesson-body-position-drills-body-position-back",
        legacyLessonIds: ["mod4-l2", "breathing-and-floating--floating-back"],
        legacyLessonSlugs: [
          "course-lesson-breathing-and-floating-floating-back",
          "course-lesson-breathing-and-floating-floating-on-the-back",
        ],
      },
      {
        canonicalLessonId: "body-position--body-position-front",
        canonicalLessonSlug: "course-lesson-body-position-drills-body-position-front",
        legacyLessonIds: ["mod4-l3"],
      },
      {
        canonicalLessonId: "body-position--body-position-side-breathing",
        canonicalLessonSlug: "course-lesson-body-position-drills-body-position-side-breathing",
        legacyLessonIds: ["mod4-l4"],
      },
    ],
  },
  {
    canonicalModuleId: "rotation",
    canonicalModuleSlug: "course-module-rotation-drills",
    legacyModuleIds: ["mod5"],
    lessons: [
      {
        canonicalLessonId: "rotation--driven-by-core",
        canonicalLessonSlug: "course-lesson-rotation-drills-driven-by-core",
        legacyLessonIds: ["mod5-l1"],
      },
      {
        canonicalLessonId: "rotation--mummy-drill",
        canonicalLessonSlug: "course-lesson-rotation-drills-mummy-drill",
        legacyLessonIds: ["mod5-l2"],
      },
    ],
  },
  {
    canonicalModuleId: "arm-stroke",
    canonicalModuleSlug: "course-module-arm-stroke-drills",
    legacyModuleIds: ["mod6"],
    lessons: [
      {
        canonicalLessonId: "arm-stroke--catch-and-path",
        canonicalLessonSlug: "course-lesson-arm-stroke-drills-catch-and-path",
        legacyLessonIds: ["mod6-l1"],
      },
      {
        canonicalLessonId: "arm-stroke--side-switch",
        canonicalLessonSlug: "course-lesson-arm-stroke-drills-side-switch",
        legacyLessonIds: ["mod6-l2"],
      },
    ],
  },
  {
    canonicalModuleId: "freestyle-build",
    canonicalModuleSlug: "course-module-freestyle-build",
    legacyModuleIds: ["mod7"],
    lessons: [
      {
        canonicalLessonId: "freestyle-build--side-drill-pass-test",
        canonicalLessonSlug: "course-lesson-freestyle-build-side-drill-pass-test",
        legacyLessonIds: ["mod7-l1"],
      },
      {
        canonicalLessonId: "freestyle-build--intro-to-swimming",
        canonicalLessonSlug: "course-lesson-freestyle-build-intro-to-swimming",
        legacyLessonIds: ["mod7-l2"],
      },
      {
        canonicalLessonId: "freestyle-build--putting-it-together",
        canonicalLessonSlug: "course-lesson-freestyle-build-putting-it-together",
        legacyLessonIds: ["mod7-l3"],
      },
    ],
  },
  {
    canonicalModuleId: "turns",
    canonicalModuleSlug: "course-module-turns-optional",
    legacyModuleIds: ["mod8"],
    lessons: [
      {
        canonicalLessonId: "turns--why-turns-matter",
        canonicalLessonSlug: "course-lesson-turns-optional-why-turns-matter",
        legacyLessonIds: ["mod8-l1"],
      },
      {
        canonicalLessonId: "turns--step-by-step",
        canonicalLessonSlug: "course-lesson-turns-optional-step-by-step",
        legacyLessonIds: ["mod8-l2"],
      },
    ],
  },
  {
    canonicalModuleId: "progress-motivation",
    canonicalModuleSlug: "course-module-progress-motivation",
    legacyModuleIds: ["mod9"],
    lessons: [
      {
        canonicalLessonId: "progress-motivation--keep-improving",
        canonicalLessonSlug: "course-lesson-progress-motivation-keep-improving",
        legacyLessonIds: ["mod9-l1"],
      },
    ],
  },
  {
    canonicalModuleId: "open-water",
    canonicalModuleSlug: "course-module-open-water",
    legacyModuleIds: ["mod10"],
    lessons: [
      {
        canonicalLessonId: "open-water--introduction-basics",
        canonicalLessonSlug: "course-lesson-open-water-introduction-basics",
        legacyLessonIds: ["mod10-l1"],
      },
      {
        canonicalLessonId: "open-water--comfortable-efficient-sighting",
        canonicalLessonSlug: "course-lesson-open-water-comfortable-efficient-sighting",
        legacyLessonIds: ["mod10-l2"],
      },
    ],
  },
  {
    canonicalModuleId: "cold-water",
    canonicalModuleSlug: "course-module-cold-water-swimming",
    legacyModuleIds: ["mod11"],
    lessons: [
      {
        canonicalLessonId: "cold-water--introduction-overview",
        canonicalLessonSlug: "course-lesson-cold-water-swimming-introduction-overview",
        legacyLessonIds: ["mod11-l1"],
      },
      {
        canonicalLessonId: "cold-water--safety-non-negotiables",
        canonicalLessonSlug: "course-lesson-cold-water-swimming-safety-non-negotiables",
        legacyLessonIds: ["mod11-l2"],
      },
    ],
  },
  {
    canonicalModuleId: "additional-resources",
    canonicalModuleSlug: "course-module-additional-resources",
    legacyModuleIds: ["mod12"],
    lessons: [
      {
        canonicalLessonId: "additional-resources--poolside-swim-guide",
        canonicalLessonSlug: "course-lesson-additional-resources-poolside-swim-guide",
        legacyLessonIds: ["mod12-l1"],
      },
      {
        canonicalLessonId: "additional-resources--video-analysis",
        canonicalLessonSlug: "course-lesson-additional-resources-video-analysis",
        legacyLessonIds: ["mod12-l2"],
      },
    ],
  },
];

function normalizeRuntimeId(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
}

function uniqueValues(values: Array<string | null | undefined>): string[] {
  const unique = new Set<string>();

  for (const value of values) {
    const normalized = normalizeRuntimeId(value);
    if (normalized) {
      unique.add(normalized);
    }
  }

  return Array.from(unique);
}

const moduleByRuntimeId = new Map<string, CourseModuleRuntimeIdentity>();
const moduleBySlug = new Map<string, CourseModuleRuntimeIdentity>();
const lessonByRuntimeId = new Map<string, CourseLessonRuntimeIdentity>();
const lessonBySlug = new Map<string, CourseLessonRuntimeIdentity>();
const lessonModuleByRuntimeId = new Map<string, CourseModuleRuntimeIdentity>();
const lessonModuleBySlug = new Map<string, CourseModuleRuntimeIdentity>();

for (const moduleIdentity of COURSE_MODULE_RUNTIME_IDENTITIES) {
  for (const runtimeId of uniqueValues([
    moduleIdentity.canonicalModuleId,
    ...moduleIdentity.legacyModuleIds,
  ])) {
    moduleByRuntimeId.set(runtimeId, moduleIdentity);
  }
  moduleBySlug.set(moduleIdentity.canonicalModuleSlug, moduleIdentity);
  for (const legacySlug of uniqueValues(moduleIdentity.legacyModuleSlugs ?? [])) {
    moduleBySlug.set(legacySlug, moduleIdentity);
  }

  for (const lessonIdentity of moduleIdentity.lessons) {
    for (const runtimeId of uniqueValues([
      lessonIdentity.canonicalLessonId,
      ...lessonIdentity.legacyLessonIds,
    ])) {
      lessonByRuntimeId.set(runtimeId, lessonIdentity);
      lessonModuleByRuntimeId.set(runtimeId, moduleIdentity);
    }
    lessonBySlug.set(lessonIdentity.canonicalLessonSlug, lessonIdentity);
    lessonModuleBySlug.set(lessonIdentity.canonicalLessonSlug, moduleIdentity);
    for (const legacySlug of uniqueValues(lessonIdentity.legacyLessonSlugs ?? [])) {
      lessonBySlug.set(legacySlug, lessonIdentity);
      lessonModuleBySlug.set(legacySlug, moduleIdentity);
    }
  }
}

function findModuleIdentity(value: string | null | undefined): CourseModuleRuntimeIdentity | null {
  const normalized = normalizeRuntimeId(value);
  if (!normalized) return null;
  return moduleByRuntimeId.get(normalized) ?? moduleBySlug.get(normalized) ?? null;
}

function findLessonIdentity(value: string | null | undefined): CourseLessonRuntimeIdentity | null {
  const normalized = normalizeRuntimeId(value);
  if (!normalized) return null;
  return lessonByRuntimeId.get(normalized) ?? lessonBySlug.get(normalized) ?? null;
}

function findLessonModuleIdentity(
  value: string | null | undefined
): CourseModuleRuntimeIdentity | null {
  const normalized = normalizeRuntimeId(value);
  if (!normalized) return null;
  return lessonModuleByRuntimeId.get(normalized) ?? lessonModuleBySlug.get(normalized) ?? null;
}

export function resolveCanonicalCourseModuleRuntimeId(
  value: string | null | undefined
): string | null {
  return findModuleIdentity(value)?.canonicalModuleId ?? null;
}

export function resolveCanonicalCourseLessonRuntimeId(
  value: string | null | undefined
): string | null {
  return findLessonIdentity(value)?.canonicalLessonId ?? null;
}

export function resolveCanonicalCourseModuleSlug(value: string | null | undefined): string | null {
  return findModuleIdentity(value)?.canonicalModuleSlug ?? null;
}

export function resolveCanonicalCourseLessonSlug(value: string | null | undefined): string | null {
  return findLessonIdentity(value)?.canonicalLessonSlug ?? null;
}

export function resolveCanonicalCourseModuleRuntimeIdFromLesson(
  value: string | null | undefined
): string | null {
  const normalized = normalizeRuntimeId(value);
  if (!normalized) return null;
  return (
    lessonModuleByRuntimeId.get(normalized)?.canonicalModuleId ??
    findModuleIdentity(value)?.canonicalModuleId ??
    null
  );
}

export function resolveCourseModuleRuntimeLookupIds(value: string | null | undefined): string[] {
  const identity = findModuleIdentity(value);
  if (!identity) {
    return uniqueValues([value]);
  }

  return uniqueValues([identity.canonicalModuleId, ...identity.legacyModuleIds]);
}

export function resolveCourseLessonRuntimeLookupIds(value: string | null | undefined): string[] {
  const identity = findLessonIdentity(value);
  if (!identity) {
    return uniqueValues([value]);
  }

  return uniqueValues([identity.canonicalLessonId, ...identity.legacyLessonIds]);
}

export function resolveCourseModuleLegacyRuntimeIds(value: string | null | undefined): string[] {
  const identity = findModuleIdentity(value);
  return identity ? uniqueValues(identity.legacyModuleIds) : [];
}

export function resolveCourseLessonLegacyRuntimeIds(value: string | null | undefined): string[] {
  const identity = findLessonIdentity(value);
  return identity ? uniqueValues(identity.legacyLessonIds) : [];
}

export function resolveCanonicalCourseModuleRuntimeIdBySlug(
  value: string | null | undefined
): string | null {
  const normalized = normalizeRuntimeId(value);
  if (!normalized) return null;
  return moduleBySlug.get(normalized)?.canonicalModuleId ?? null;
}

export function resolveCanonicalCourseLessonRuntimeIdBySlug(
  value: string | null | undefined
): string | null {
  const normalized = normalizeRuntimeId(value);
  if (!normalized) return null;
  return lessonBySlug.get(normalized)?.canonicalLessonId ?? null;
}

export function resolveCanonicalCourseModuleRuntimeIdForLessonLookup(
  value: string | null | undefined
): string | null {
  const normalized = normalizeRuntimeId(value);
  if (!normalized) return null;
  return (
    lessonModuleByRuntimeId.get(normalized)?.canonicalModuleId ??
    findLessonModuleIdentity(value)?.canonicalModuleId ??
    null
  );
}
