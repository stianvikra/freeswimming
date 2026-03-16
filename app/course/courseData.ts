// app/course/courseData.ts

export type CourseSupportActionId = "videoAnalysis" | "poolsideGuide" | "guide0To1000" | "contact";

export type CourseSupportCard = {
  actions?: Partial<Record<CourseSupportActionId, boolean>>;
  primaryAction?: CourseSupportActionId;
};

export type CourseLesson = {
  id: string; // used in URL: /course?lesson=<id>
  legacyIds?: string[];
  title: string;
  youtubeId: string; // ONLY the video id, not full URL
  estMinutes?: number;
  lessonType?: "learn" | "drill" | "swim";
  drillLabel?: string;
  supportStartAtLessonInModule?: number;
  supportCard?: CourseSupportCard;
  passCriteria?: string[];
  display?: {
    goal?: boolean;
    cues?: boolean;
    commonMistakes?: boolean;
    drill?: boolean;
    checkpoint?: boolean;
    nextStep?: boolean;
    support?: boolean;
  };

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
  legacyIds?: string[];
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
  process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_FS_AUTOGEN_LESSONS !== "0";

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
    id: "mod1",
    title: "Introduction to the Course",
    subtitle: "Start here. Follow the progression calmly.",
    lessons: [
      {
        id: "mod1-l1",
        title: "Welcome & Course Structure",
        youtubeId: "Xh6OblO06LY",
        estMinutes: 3,
        lessonType: "learn",
        goal: "Understand how to use the course and follow the A→Z progression for your level.",
        cues: ["One focus at a time"],
        commonMistakes: ["Trying to learn everything at once", "Skipping steps"],
        drill: {
          title: "Watch lesson and focus on the key concept",
          steps: [
            "Watch the lesson once without rushing.",
            "Keep focus on: One focus at a time.",
            "Apply the key point in your next easy swim session.",
          ],
        },
        nextStep: "Start Module 2 and follow the order",
      },
      {
        id: "mod1-l2",
        title: "Course Navigation Basics",
        youtubeId: "OWRzGHPRdmg",
        estMinutes: 3,
        lessonType: "learn",
        goal: "Know how to navigate the web app so the course feels effortless to use.",
        cues: ["Keep it simple"],
        commonMistakes: ["Getting lost", "Not knowing where to continue"],
        drill: {
          title: "Watch lesson and focus on the key concept",
          steps: [
            "Watch the lesson once without rushing.",
            "Keep focus on: Keep it simple.",
            "Apply the key point in your next easy swim session.",
          ],
        },
        nextStep: "Open Module 1 lessons, then go to Module 2",
      },
      {
        id: "mod1-l3",
        title: "Equipment That Helps",
        youtubeId: "Xh6OblO06LY",
        estMinutes: 3,
        lessonType: "learn",
        goal: "Know what equipment is optional vs helpful, and how to use it without masking mistakes.",
        cues: ["Equipment is optional"],
        commonMistakes: ["Overusing gear", "Using fins to hide balance issues"],
        drill: {
          title: "Optional: goggles, cap, buoyancy shorts (if needed)",
          steps: [
            "Watch the lesson once without rushing.",
            "Keep focus on: Equipment is optional.",
            "Apply the key point in your next easy swim session.",
          ],
        },
        nextStep: "Move on to Module 2",
      },
    ],
  },
  {
    id: "mod2",
    title: "Pool Drills",
    subtitle: "Technique first, effort second.",
    lessons: [
      {
        id: "mod2-l1",
        title: "Why Drills Work (And Why You Won’t Get Exhausted)",
        youtubeId: "OWRzGHPRdmg",
        estMinutes: 3,
        lessonType: "learn",
        goal: "Understand that the goal is technique—coordination, balance, and body position—not fitness.",
        cues: ["Technique first"],
        commonMistakes: ["Swimming too hard", "Chasing speed while learning"],
        drill: {
          title: "Short repeats: 6–10 × 12.5m with full rest",
          steps: [
            "Watch the lesson once without rushing.",
            "Keep focus on: Technique first.",
            "Apply the key point in your next easy swim session.",
          ],
        },
        nextStep: "Go to Kick Drills",
      },
    ],
  },
  {
    id: "mod3",
    title: "Kick Drills",
    subtitle: "Small kick. Stable body line.",
    lessons: [
      {
        id: "mod3-l1",
        title: "Kick Basics: Support, Not Speed",
        youtubeId: "Xh6OblO06LY",
        estMinutes: 3,
        lessonType: "learn",
        goal: "Learn why the kick matters mainly to reduce drag and support a stable body line.",
        cues: ["Small kick, stable line"],
        commonMistakes: ["Kicking from knees", "Big splash", "Tight ankles"],
        drill: {
          title: "Vertical kick test (30–45s) + easy flutter kicks",
          steps: [
            "Watch the lesson once without rushing.",
            "Keep focus on: Small kick, stable line.",
            "Apply the key point in your next easy swim session.",
          ],
        },
        nextStep: "Practice Standing Kicks",
      },
      {
        id: "mod3-l2",
        title: "Standing Leg Kicks (Poolside)",
        youtubeId: "OWRzGHPRdmg",
        estMinutes: 4,
        lessonType: "drill",
        goal: "Feel the water and learn controlled flutter kick with full awareness of the legs.",
        cues: ["Long legs"],
        commonMistakes: ["Kicking like a bicycle", "Pointing toes too hard", "Over-kicking"],
        drill: {
          title: "Standing in shallow water: 3 × 30s easy kicks",
          steps: [
            "Standing in shallow water: 3 × 30s easy kicks",
            "Use cue: Long legs.",
            "Repeat with control, then reset when quality drops.",
          ],
        },
        nextStep: "Move to Body Position Drills",
      },
    ],
  },
  {
    id: "mod4",
    title: "Body Position Drills",
    subtitle: "Build a long, balanced position.",
    lessons: [
      {
        id: "mod4-l1",
        title: "Body Position: The #1 Skill",
        youtubeId: "Xh6OblO06LY",
        estMinutes: 3,
        lessonType: "learn",
        goal: "Understand how body line reduces resistance and makes everything easier.",
        cues: ["Hips up"],
        commonMistakes: ["Lifting head", "Breaking the line", "Over-arching lower back"],
        drill: {
          title: "Wall alignment: ribs down, hips up (30–60s)",
          steps: [
            "Watch the lesson once without rushing.",
            "Keep focus on: Hips up.",
            "Apply the key point in your next easy swim session.",
          ],
        },
        nextStep: "Practice Body Position (Back)",
      },
      {
        id: "mod4-l2",
        title: "Body Position on the Back",
        youtubeId: "OWRzGHPRdmg",
        estMinutes: 4,
        lessonType: "drill",
        goal: "Learn to float balanced on your back with hips high and relaxed breathing.",
        cues: ["Ribs down"],
        commonMistakes: ["Chin lifted", "Tight neck", "Kicking to survive"],
        drill: {
          title: "Back float + gentle kick: 6 × 10–15s",
          steps: [
            "Back float + gentle kick: 6 × 10–15s",
            "Use cue: Ribs down.",
            "Repeat with control, then reset when quality drops.",
          ],
        },
        nextStep: "Practice Body Position (Front)",
      },
      {
        id: "mod4-l3",
        title: "Body Position on the Front",
        youtubeId: "Xh6OblO06LY",
        estMinutes: 4,
        lessonType: "drill",
        goal: "Learn to hold a long line face-down without lifting the head.",
        cues: ["Head neutral"],
        commonMistakes: ["Looking forward", "Holding breath", "Dropping hips"],
        drill: {
          title: "Front glide + exhale: 6 × 6–10s",
          steps: [
            "Front glide + exhale: 6 × 6–10s",
            "Use cue: Head neutral.",
            "Repeat with control, then reset when quality drops.",
          ],
        },
        nextStep: "Practice Body Position (Side)",
      },
      {
        id: "mod4-l4",
        title: "Body Position on the Side (Includes Breathing)",
        youtubeId: "OWRzGHPRdmg",
        estMinutes: 4,
        lessonType: "drill",
        goal: "Learn side balance and breathing without lifting the head.",
        cues: ["One goggle in"],
        commonMistakes: ["Lifting head to breathe", "Over-rotating", "Legs scissor"],
        drill: {
          title: "Side kick drill: 6 × 10–15s each side",
          steps: [
            "Side kick drill: 6 × 10–15s each side",
            "Use cue: One goggle in.",
            "Repeat with control, then reset when quality drops.",
          ],
        },
        nextStep: "Move to Rotation Drills",
      },
    ],
  },
  {
    id: "mod5",
    title: "Rotation Drills",
    subtitle: "Core-led rotation with control.",
    lessons: [
      {
        id: "mod5-l1",
        title: "Rotation: Driven by the Core",
        youtubeId: "Xh6OblO06LY",
        estMinutes: 3,
        lessonType: "learn",
        goal: "Understand why rotation creates power, reduces strain, and makes breathing easier.",
        cues: ["Hip-led rotation"],
        commonMistakes: ["Rotating only shoulders", "Over-rotating", "Kicking wide"],
        drill: {
          title: "Side-to-side roll (easy): 6 × 6–10 reps",
          steps: [
            "Watch the lesson once without rushing.",
            "Keep focus on: Hip-led rotation.",
            "Apply the key point in your next easy swim session.",
          ],
        },
        nextStep: "Practice Rotation Drill (Mummy)",
      },
      {
        id: "mod5-l2",
        title: "Rotation Drill (Mummy)",
        youtubeId: "OWRzGHPRdmg",
        estMinutes: 4,
        lessonType: "drill",
        goal: "Feel the lead arm and body roll working together as one unit.",
        cues: ["Hips lead"],
        commonMistakes: ["Pulling with arms", "Rolling too late", "Losing line"],
        drill: {
          title: "Mummy swim: 6–10 × 12.5m (full rest)",
          steps: [
            "Mummy swim: 6–10 × 12.5m (full rest)",
            "Use cue: Hips lead.",
            "Repeat with control, then reset when quality drops.",
          ],
        },
        nextStep: "Move to Arm Stroke Drills",
      },
    ],
  },
  {
    id: "mod6",
    title: "Arm Stroke Drills",
    subtitle: "Cleaner catch and smoother path.",
    lessons: [
      {
        id: "mod6-l1",
        title: "Arm Stroke Basics: Catch and Path",
        youtubeId: "Xh6OblO06LY",
        estMinutes: 3,
        lessonType: "learn",
        goal: "Learn the purpose of the catch and a clean arm path that supports rotation and balance.",
        cues: ["Reach forward first"],
        commonMistakes: ["Crossing over", "Dropping elbow", "Rushing the stroke"],
        drill: {
          title: "Front scull: 4 × 15–20s",
          steps: [
            "Watch the lesson once without rushing.",
            "Keep focus on: Reach forward first.",
            "Apply the key point in your next easy swim session.",
          ],
        },
        nextStep: "Practice Side Switch",
      },
      {
        id: "mod6-l2",
        title: "Side Switch (Link the Pieces)",
        youtubeId: "OWRzGHPRdmg",
        estMinutes: 4,
        lessonType: "drill",
        goal: "Connect body position + rotation + arm timing using a controlled switch.",
        cues: ["Switch with hips"],
        commonMistakes: ["Pushing water down", "Lifting head", "Over-kicking"],
        drill: {
          title: "Side switch: 6–10 × 12.5m (full rest)",
          steps: [
            "Side switch: 6–10 × 12.5m (full rest)",
            "Use cue: Switch with hips.",
            "Repeat with control, then reset when quality drops.",
          ],
        },
        nextStep: "Do the Side Drill Pass Test, then start Freestyle Build",
      },
    ],
  },
  {
    id: "mod7",
    title: "Freestyle Build",
    subtitle: "Put the pieces together.",
    lessons: [
      {
        id: "mod7-l1",
        title: "Master This Before Freestyle: Side Drill (Pass Test)",
        youtubeId: "Xh6OblO06LY",
        estMinutes: 3,
        lessonType: "learn",
        goal: "Confirm you can hold the line before you swim freestyle and avoid training bad habits.",
        cues: ["Hips up"],
        commonMistakes: ["Kicking too hard", "Sinking legs", "Head lift to breathe"],
        drill: {
          title: "Pass test: 3 × 10–15s each side",
          steps: [
            "Watch the lesson once without rushing.",
            "Keep focus on: Hips up.",
            "Apply the key point in your next easy swim session.",
          ],
        },
        nextStep: "Then do Intro to Swimming",
      },
      {
        id: "mod7-l2",
        title: "Intro to Swimming (Slow to Go Fast)",
        youtubeId: "OWRzGHPRdmg",
        estMinutes: 5,
        lessonType: "swim",
        goal: "Learn how to swim in short, controlled repeats so technique improves fast.",
        cues: ["Full recovery"],
        commonMistakes: ["Swimming too far", "Swimming tired", "Losing focus"],
        drill: {
          title: "6–12 × 12.5–25m, one focus, full rest",
          steps: [
            "6–12 × 12.5–25m, one focus, full rest",
            "Use cue: Full recovery.",
            "Repeat with control, then reset when quality drops.",
          ],
        },
        nextStep: "Move to Putting It Together",
      },
      {
        id: "mod7-l3",
        title: "Putting It Together (3 Big Fixes)",
        youtubeId: "Xh6OblO06LY",
        estMinutes: 5,
        lessonType: "swim",
        goal: "Remove the most common mistakes that cause fatigue, drag, and loss of glide.",
        cues: ["Long line"],
        commonMistakes: ["Cross-over", "Head lift", "Rushing stroke"],
        drill: {
          title: "3 blocks: 4 × 12.5m per block (full rest)",
          steps: [
            "3 blocks: 4 × 12.5m per block (full rest)",
            "Use cue: Long line.",
            "Repeat with control, then reset when quality drops.",
          ],
        },
        nextStep: "Move to Turns (Optional)",
      },
    ],
  },
  {
    id: "mod8",
    title: "Turns (Optional)",
    subtitle: "Optional turns for better flow.",
    lessons: [
      {
        id: "mod8-l1",
        title: "Freestyle Turns: Why They Matter",
        youtubeId: "OWRzGHPRdmg",
        estMinutes: 3,
        lessonType: "learn",
        goal: "Understand why turns improve flow, control, and confidence—even if you’re not competitive.",
        cues: ["Stay relaxed"],
        commonMistakes: ["Stopping at the wall", "Panicking mid-turn"],
        drill: {
          title: "Wall approach + streamline push-off practice",
          steps: [
            "Watch the lesson once without rushing.",
            "Keep focus on: Stay relaxed.",
            "Apply the key point in your next easy swim session.",
          ],
        },
        nextStep: "Practice Turn Drills",
      },
      {
        id: "mod8-l2",
        title: "Freestyle Turn Drills (Step by Step)",
        youtubeId: "Xh6OblO06LY",
        estMinutes: 4,
        lessonType: "drill",
        goal: "Learn a basic, safe progression for learning tumble turns.",
        cues: ["Exhale into the turn"],
        commonMistakes: ["Holding breath", "Turning too late", "Feet too high", "low"],
        drill: {
          title: "Somersault → glide → push off → add rotation",
          steps: [
            "Somersault → glide → push off → add rotation",
            "Use cue: Exhale into the turn.",
            "Repeat with control, then reset when quality drops.",
          ],
        },
        nextStep: "Move to Progress & Motivation",
      },
    ],
  },
  {
    id: "mod9",
    title: "Progress & Motivation",
    subtitle: "Keep improving over time.",
    lessons: [
      {
        id: "mod9-l1",
        title: "Motivation vs Progress (How to Keep Improving)",
        youtubeId: "OWRzGHPRdmg",
        estMinutes: 3,
        lessonType: "learn",
        goal: "Learn how to enjoy swimming while still improving technique long-term.",
        cues: ["Repeat the basics"],
        commonMistakes: ["Only swimming long", "Never revisiting drills"],
        drill: {
          title: "Warm-up template: 5–10 min drills + short focus swims",
          steps: [
            "Watch the lesson once without rushing.",
            "Keep focus on: Repeat the basics.",
            "Apply the key point in your next easy swim session.",
          ],
        },
        nextStep: "Move to Open Water module",
      },
    ],
  },
  {
    id: "mod10",
    title: "Open Water",
    subtitle: "Open-water basics without stress.",
    lessons: [
      {
        id: "mod10-l1",
        title: "Open Water Introduction (Basics)",
        youtubeId: "Xh6OblO06LY",
        estMinutes: 3,
        lessonType: "learn",
        goal: "Learn the key differences in open water: breathing timing, calmness, and positioning for waves.",
        cues: ["Stay calm"],
        commonMistakes: ["Holding breath", "Fighting waves", "Lifting head too much"],
        drill: {
          title: "Breath rhythm: exhale under water, inhale on rotation",
          steps: [
            "Watch the lesson once without rushing.",
            "Keep focus on: Stay calm.",
            "Apply the key point in your next easy swim session.",
          ],
        },
        nextStep: "Practice Sighting Drills",
      },
      {
        id: "mod10-l2",
        title: "Open Water Sighting (Comfortable & Efficient)",
        youtubeId: "OWRzGHPRdmg",
        estMinutes: 4,
        lessonType: "drill",
        goal: "Learn to sight forward without destroying body position and rhythm.",
        cues: ["Eyes forward, head low"],
        commonMistakes: ["Lifting whole head", "Dropping hips", "Sighting too often"],
        drill: {
          title: "Sight every 6–10 strokes: alligator eyes",
          steps: [
            "Sight every 6–10 strokes: alligator eyes",
            "Use cue: Eyes forward, head low.",
            "Repeat with control, then reset when quality drops.",
          ],
        },
        nextStep: "Move to Cold Water module",
      },
    ],
  },
  {
    id: "mod11",
    title: "Cold Water Swimming",
    subtitle: "Cold-water safety first.",
    lessons: [
      {
        id: "mod11-l1",
        title: "Introduction to Cold Water (Overview)",
        youtubeId: "Xh6OblO06LY",
        estMinutes: 3,
        lessonType: "learn",
        goal: "Understand what cold does to breathing and decision-making, and why safety comes first.",
        cues: ["Control breathing"],
        commonMistakes: ["Rushing in", "Hyperventilating", "Going alone"],
        drill: {
          title: "Breath control at edge: 60–90s calm breathing",
          steps: [
            "Watch the lesson once without rushing.",
            "Keep focus on: Control breathing.",
            "Apply the key point in your next easy swim session.",
          ],
        },
        nextStep: "Read Cold Water Safety",
      },
      {
        id: "mod11-l2",
        title: "Cold Water Safety (Non-Negotiables)",
        youtubeId: "OWRzGHPRdmg",
        estMinutes: 3,
        lessonType: "learn",
        goal: "Learn essential safety rules to reduce risk in cold water.",
        cues: ["Safety first"],
        commonMistakes: ["Swimming alone", "No exit plan", "Staying too long"],
        drill: {
          title: "Checklist: buddy, exit plan, short time, warm after",
          steps: [
            "Watch the lesson once without rushing.",
            "Keep focus on: Safety first.",
            "Apply the key point in your next easy swim session.",
          ],
        },
        nextStep: "Go to Additional Resources",
      },
    ],
  },
  {
    id: "mod12",
    title: "Additional Resources",
    subtitle: "Optional extras when you need help.",
    lessons: [
      {
        id: "mod12-l1",
        title: "Poolside Swim Guide (Paid • Optional)",
        youtubeId: "Xh6OblO06LY",
        estMinutes: 3,
        lessonType: "learn",
        goal: "Offer an optional, structured drill guide people can bring to the pool for faster sessions.",
        cues: ["Keep it simple"],
        commonMistakes: ["Overbuying tools", "Expecting gear to replace practice"],
        drill: {
          title: "QR-based drill library + session templates",
          steps: [
            "Watch the lesson once without rushing.",
            "Keep focus on: Keep it simple.",
            "Apply the key point in your next easy swim session.",
          ],
        },
        nextStep: "Optional: upgrade or continue free course",
      },
      {
        id: "mod12-l2",
        title: "Video Analysis (Paid • Optional)",
        youtubeId: "OWRzGHPRdmg",
        estMinutes: 3,
        lessonType: "learn",
        goal: "Offer personalized feedback: top priorities + a drill plan so progress accelerates.",
        cues: ["One priority first"],
        commonMistakes: ["Wanting 20 fixes at once", "Filming wrong angle"],
        drill: {
          title: "Upload short clip: 10–20s front/side view",
          steps: [
            "Watch the lesson once without rushing.",
            "Keep focus on: One priority first.",
            "Apply the key point in your next easy swim session.",
          ],
        },
        nextStep: "Optional: get a personalized plan",
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
