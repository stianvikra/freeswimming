// app/course/courseData.ts

export type CourseLesson = {
  id: string; // used in URL: /course?lesson=<id>
  title: string;
  youtubeId: string; // ONLY the video id, not full URL
  estMinutes?: number;

  goal: string;
  cues: string[];
  commonMistakes?: string[];
  drill: {
    title: string;
    steps: string[];
  };
  nextStep: string;

  // Optional extras for later
  tags?: string[];
};

export type CourseModule = {
  id: string;
  title: string;
  subtitle?: string;
  lessons: CourseLesson[];
};

/**
 * ✅ Auto-generate extra lessons for local visual testing only.
 * - Runs only in development.
 * - Can be disabled with NEXT_PUBLIC_FS_AUTOGEN_LESSONS=0
 * - Count can be tuned with NEXT_PUBLIC_FS_AUTOGEN_COUNT_M1
 * - Keeps your real lessons untouched
 */
const SHOULD_AUTOGEN =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_FS_AUTOGEN_LESSONS !== "0";

const autogenCountRaw = Number(process.env.NEXT_PUBLIC_FS_AUTOGEN_COUNT_M1 ?? "12");
const AUTOGEN_COUNT_M1 =
  Number.isFinite(autogenCountRaw) && autogenCountRaw >= 2 ? Math.floor(autogenCountRaw) : 12;

function withAutoLessons(module: CourseModule, totalTarget: number): CourseModule {
  if (!SHOULD_AUTOGEN) return module;
  if (module.lessons.length >= totalTarget) return module;

  const seedLessons = module.lessons;
  if (seedLessons.length === 0) return module;

  const next = [...seedLessons];
  let n = seedLessons.length + 1;

  while (next.length < totalTarget) {
    const seed = seedLessons[(next.length - seedLessons.length) % seedLessons.length];

    // Always unique + stable-ish ids
    const id = `${module.id}-auto-${n}`;

    next.push({
      ...seed,
      id,
      title: `${seed.title} (Auto ${n})`,
      // Slight variation so it doesn’t look copy-paste
      estMinutes: seed.estMinutes ? Math.max(2, seed.estMinutes + ((n % 3) - 1)) : undefined,
      goal: `${seed.goal}`,
      nextStep: `Test lesson ${n}: only for scrolling/fade on mobile.`,
      // Keep cues/drill/etc from seed
    });

    n += 1;
  }

  return { ...module, lessons: next };
}

const COURSE_MODULES_BASE: CourseModule[] = [
  {
    id: "m1",
    title: "Intro",
    subtitle: "A few tips on the way.",
    lessons: [
      {
        id: "m1-l1",
        title: "Test video - Boknafjorden",
        youtubeId: "Xh6OblO06LY",
        estMinutes: 4,
        goal: "Find a long, stable body line so your effort moves you forward — not down.",
        cues: ["Head neutral (look slightly forward/down)", "Long spine, light chest", "Hips close to the surface"],
        commonMistakes: [
          "Lifting the head to breathe",
          "Kicking harder instead of fixing balance",
          "Tension in neck/shoulders",
        ],
        drill: {
          title: "Superman glide (easy version)",
          steps: ["Push off gently and hold a long line", "Keep head neutral and exhale slowly", "Reset after 5–8 seconds and repeat"],
        },
        nextStep: "Repeat this in 2 swim sessions before moving to the next lesson.",
        tags: ["foundation", "balance"],
      },
      {
        id: "m1-l2",
        title: "Test video 2",
        youtubeId: "OWRzGHPRdmg",
        estMinutes: 3,
        goal: "Use a neutral head position to lift the hips without kicking harder.",
        cues: ["Chin slightly tucked", "Eyes down-forward", "Neck relaxed"],
        commonMistakes: ["Looking forward too much", "Tensing the neck"],
        drill: {
          title: "Head-only reset",
          steps: ["Swim easy freestyle for 10–15m", "Only adjust head position — nothing else", "Notice how hips change when head changes"],
        },
        nextStep: "If legs still sink, re-do lesson 1 for two more sessions.",
        tags: ["body position"],
      },
    ],
  },
  {
    id: "m2",
    title: "Balance",
    subtitle: "Stop fighting the water. Feel stable and calm.",
    lessons: [
      {
        id: "m2-l1",
        title: "Balance without brute force",
        youtubeId: "dQw4w9WgXcQ",
        estMinutes: 4,
        goal: "Stay balanced with less tension so your stroke becomes smoother.",
        cues: ["Relax the shoulders", "Long exhale", "Quiet kick"],
        commonMistakes: ["Holding breath", "Over-kicking to stay afloat"],
        drill: {
          title: "Easy balance swim",
          steps: ["Swim slow for 15–25m", "Focus only on relaxation + exhale", "Repeat 4–6 times"],
        },
        nextStep: "Do this drill at the start of every session for one week.",
        tags: ["calm", "efficiency"],
      },
    ],
  },
  {
    id: "m3",
    title: "Breathing rhythm",
    subtitle: "Stay calm. Stay consistent.",
    lessons: [
      {
        id: "m3-l1",
        title: "Exhale fixes panic",
        youtubeId: "dQw4w9WgXcQ",
        estMinutes: 5,
        goal: "Build a breathing rhythm that keeps you relaxed and controlled.",
        cues: ["Exhale underwater", "Small inhale", "Return head smoothly"],
        commonMistakes: ["Holding breath", "Big gasp inhale", "Lifting head"],
        drill: {
          title: "Bubble-breathe pattern",
          steps: ["Swim easy and exhale bubbles continuously", "Breathe every 2 or 3 strokes (pick one)", "Repeat 6–10 x 25m"],
        },
        nextStep: "When you feel calm and repeatable, move to the next module.",
        tags: ["breathing", "confidence"],
      },
    ],
  },
  {
    id: "m4",
    title: "Timing",
    subtitle: "Coordinate kick + catch for better flow.",
    lessons: [
      {
        id: "m4-l1",
        title: "Smooth timing (no rushing)",
        youtubeId: "dQw4w9WgXcQ",
        estMinutes: 4,
        goal: "Stop rushing. Improve flow so each stroke gives you more distance.",
        cues: ["Long line", "Gentle kick", "Patient front arm"],
        commonMistakes: ["Spinning arms fast", "Kicking to compensate"],
        drill: {
          title: "Slow swim with one focus",
          steps: ["Swim easy and slow for 25m", "Only focus on ‘patient lead arm’", "Repeat 6–8 times"],
        },
        nextStep: "Repeat for two sessions. If you rush again, slow down and reset.",
        tags: ["timing", "flow"],
      },
    ],
  },
      id: "m4",
    title: "Timing",
    subtitle: "Coordinate kick + catch for better flow.",
    lessons: [
      {
        id: "m4-l1",
        title: "Smooth timing (no rushing)",
        youtubeId: "dQw4w9WgXcQ",
        estMinutes: 4,
        goal: "Stop rushing. Improve flow so each stroke gives you more distance.",
        cues: ["Long line", "Gentle kick", "Patient front arm"],
        commonMistakes: ["Spinning arms fast", "Kicking to compensate"],
        drill: {
          title: "Slow swim with one focus",
          steps: ["Swim easy and slow for 25m", "Only focus on ‘patient lead arm’", "Repeat 6–8 times"],
        },
        nextStep: "Repeat for two sessions. If you rush again, slow down and reset.",
        tags: ["timing", "flow"],
      },
    ],
  },
];

const PLACEHOLDER_VIDEO_IDS = new Set(["dQw4w9WgXcQ"]);

function isPlaceholderLesson(lesson: CourseLesson) {
  return (
    PLACEHOLDER_VIDEO_IDS.has(lesson.youtubeId) ||
    /test video/i.test(lesson.title) ||
    /test lesson/i.test(lesson.nextStep)
  );
}

export const HAS_PLACEHOLDER_CONTENT = COURSE_MODULES_BASE.some((mod) =>
  mod.lessons.some((lesson) => isPlaceholderLesson(lesson))
);

if (
  typeof window === "undefined" &&
  process.env.NODE_ENV !== "development" &&
  HAS_PLACEHOLDER_CONTENT
) {
  console.warn(
    "[courseData] Placeholder lesson content detected outside development. Replace before production launch."
  );
}

// ✅ Final exported modules (auto-filled only in dev)
export const COURSE_MODULES: CourseModule[] = COURSE_MODULES_BASE.map((m) =>
  m.id === "m1" ? withAutoLessons(m, AUTOGEN_COUNT_M1) : m
);

export const DEFAULT_LESSON_ID = COURSE_MODULES[0]?.lessons[0]?.id ?? "m1-l1";

/** Helper: flatten lessons for quick lookup / next-prev */
export const COURSE_LESSONS_FLAT: CourseLesson[] = COURSE_MODULES.flatMap((m) => m.lessons);

export function findLesson(lessonId: string | null | undefined): CourseLesson {
  if (!lessonId) return COURSE_LESSONS_FLAT[0] ?? COURSE_MODULES[0].lessons[0];
  return (
    COURSE_LESSONS_FLAT.find((l) => l.id === lessonId) ??
    COURSE_LESSONS_FLAT[0] ??
    COURSE_MODULES[0].lessons[0]
  );
}

export function getNextPrevLessonIds(lessonId: string): {
  prevId: string | null;
  nextId: string | null;
} {
  const idx = COURSE_LESSONS_FLAT.findIndex((l) => l.id === lessonId);
  if (idx === -1) return { prevId: null, nextId: null };
  return {
    prevId: idx > 0 ? COURSE_LESSONS_FLAT[idx - 1].id : null,
    nextId: idx < COURSE_LESSONS_FLAT.length - 1 ? COURSE_LESSONS_FLAT[idx + 1].id : null,
  };
}
