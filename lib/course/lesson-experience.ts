import type {
  CourseLesson,
  CourseLessonExperience,
  CourseLessonExperienceDisplay,
  CourseLessonExperienceImage,
  CourseLessonExperienceMistake,
  CourseLessonExperiencePractice,
  CourseLessonExperienceSupport,
  CourseLessonExperienceVariant,
} from "@/app/course/courseData";
import { getCourseLessonPassCriteria } from "@/lib/course/progress-status";

export type CourseLessonExperienceViewDisplay = Required<CourseLessonExperienceDisplay>;

export type CourseLessonExperienceViewPractice = {
  title: string;
  steps: string[];
  safetyNote?: string;
  image?: CourseLessonExperienceImage;
};

export type CourseLessonExperienceViewModel = {
  variant: CourseLessonExperienceVariant;
  display: CourseLessonExperienceViewDisplay;
  goal: string;
  primaryCue: string;
  quickExplanation: string;
  whyThisMatters?: string;
  landPractice: CourseLessonExperienceViewPractice;
  waterPractice: CourseLessonExperienceViewPractice;
  commonMistakes: Array<{
    mistake: string;
    fix?: string;
  }>;
  feelCues: string[];
  masteryCriteria: string[];
  nextStep: string;
  support: {
    title: string;
    body: string;
  };
};

const DISPLAY_KEYS = [
  "quickExplanation",
  "whyThisMatters",
  "landPractice",
  "landSafetyNote",
  "waterPractice",
  "waterSafetyNote",
  "feelCues",
  "commonMistakes",
  "nextStep",
  "support",
] as const;

const DISPLAY_DEFAULTS_BY_VARIANT: Record<
  CourseLessonExperienceVariant,
  CourseLessonExperienceViewDisplay
> = {
  concept: {
    quickExplanation: true,
    whyThisMatters: true,
    landPractice: false,
    landSafetyNote: true,
    waterPractice: false,
    waterSafetyNote: true,
    feelCues: true,
    commonMistakes: true,
    nextStep: true,
    support: true,
  },
  dryland: {
    quickExplanation: true,
    whyThisMatters: true,
    landPractice: true,
    landSafetyNote: true,
    waterPractice: false,
    waterSafetyNote: true,
    feelCues: true,
    commonMistakes: true,
    nextStep: true,
    support: true,
  },
  water_drill: {
    quickExplanation: true,
    whyThisMatters: true,
    landPractice: true,
    landSafetyNote: true,
    waterPractice: true,
    waterSafetyNote: true,
    feelCues: true,
    commonMistakes: true,
    nextStep: true,
    support: true,
  },
  swim_set: {
    quickExplanation: true,
    whyThisMatters: false,
    landPractice: false,
    landSafetyNote: true,
    waterPractice: true,
    waterSafetyNote: true,
    feelCues: true,
    commonMistakes: false,
    nextStep: true,
    support: true,
  },
  custom: {
    quickExplanation: true,
    whyThisMatters: true,
    landPractice: true,
    landSafetyNote: true,
    waterPractice: true,
    waterSafetyNote: true,
    feelCues: true,
    commonMistakes: true,
    nextStep: true,
    support: true,
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function getStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => getString(entry)).filter((entry): entry is string => Boolean(entry));
}

function getBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function normalizeVariant(value: unknown): CourseLessonExperienceVariant | undefined {
  if (
    value === "concept" ||
    value === "dryland" ||
    value === "water_drill" ||
    value === "swim_set" ||
    value === "custom"
  ) {
    return value;
  }
  return undefined;
}

function normalizeDisplay(value: unknown): CourseLessonExperienceDisplay | undefined {
  if (!isRecord(value)) return undefined;

  const display: CourseLessonExperienceDisplay = {};
  for (const key of DISPLAY_KEYS) {
    if (typeof value[key] === "boolean") {
      display[key] = value[key];
    }
  }

  return Object.keys(display).length > 0 ? display : undefined;
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const value of values) {
    const normalized = value.trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    unique.push(normalized);
  }
  return unique;
}

function normalizePractice(value: unknown): CourseLessonExperiencePractice | undefined {
  if (!isRecord(value)) return undefined;

  const title = getString(value.title) ?? undefined;
  const steps = getStringArray(value.steps);
  const safetyNote = getString(value.safetyNote) ?? undefined;
  const image = normalizePracticeImage(value.image);

  if (!title && steps.length === 0 && !safetyNote && !image) return undefined;

  return {
    title,
    steps: steps.length > 0 ? steps : undefined,
    safetyNote,
    image,
  };
}

function normalizeLocalImageSrc(value: unknown): string | undefined {
  const src = getString(value);
  if (!src) return undefined;
  if (!src.startsWith("/") || src.startsWith("//")) return undefined;
  return src;
}

function normalizePracticeImage(value: unknown): CourseLessonExperienceImage | undefined {
  if (!isRecord(value)) return undefined;

  const src = normalizeLocalImageSrc(value.src);
  const alt = getString(value.alt) ?? undefined;
  const caption = getString(value.caption) ?? undefined;
  if (!src && !alt && !caption) return undefined;

  return { src, alt, caption };
}

function normalizeMistake(value: unknown): CourseLessonExperienceMistake | undefined {
  const mistakeText = getString(value);
  if (mistakeText) return mistakeText;
  if (!isRecord(value)) return undefined;

  const mistake = getString(value.mistake) ?? undefined;
  const fix = getString(value.fix) ?? undefined;
  if (!mistake && !fix) return undefined;

  return { mistake, fix };
}

function normalizeMistakes(value: unknown): CourseLessonExperienceMistake[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const mistakes = value
    .map((entry) => normalizeMistake(entry))
    .filter((entry): entry is CourseLessonExperienceMistake => Boolean(entry));
  return mistakes.length > 0 ? mistakes : undefined;
}

function normalizeSupport(value: unknown): CourseLessonExperienceSupport | undefined {
  if (!isRecord(value)) return undefined;

  const title = getString(value.title) ?? undefined;
  const body = getString(value.body) ?? undefined;
  if (!title && !body) return undefined;

  return { title, body };
}

export function normalizeCourseLessonExperienceInput(
  value: unknown
): CourseLessonExperience | undefined {
  if (!isRecord(value)) return undefined;

  const experience: CourseLessonExperience = {};

  const variant = normalizeVariant(value.variant);
  if (variant) experience.variant = variant;

  const display = normalizeDisplay(value.display);
  if (display) experience.display = display;

  const goal = getString(value.goal);
  if (goal) experience.goal = goal;

  const quickExplanation = getString(value.quickExplanation);
  if (quickExplanation) experience.quickExplanation = quickExplanation;

  const whyThisMatters = getString(value.whyThisMatters);
  if (whyThisMatters) experience.whyThisMatters = whyThisMatters;

  const landPractice = normalizePractice(value.landPractice);
  if (landPractice) experience.landPractice = landPractice;

  const waterPractice = normalizePractice(value.waterPractice);
  if (waterPractice) experience.waterPractice = waterPractice;

  const commonMistakes = normalizeMistakes(value.commonMistakes);
  if (commonMistakes) experience.commonMistakes = commonMistakes;

  const feelCues = getStringArray(value.feelCues);
  if (feelCues.length > 0) experience.feelCues = uniqueStrings(feelCues);

  const nextStep = getString(value.nextStep);
  if (nextStep) experience.nextStep = nextStep;

  const support = normalizeSupport(value.support);
  if (support) experience.support = support;

  return Object.keys(experience).length > 0 ? experience : undefined;
}

function resolveDefaultVariant(lesson: CourseLesson): CourseLessonExperienceVariant {
  if (lesson.lessonType === "learn") return "concept";
  if (lesson.lessonType === "swim") return "swim_set";
  return "water_drill";
}

function resolveExperienceDisplay(
  variant: CourseLessonExperienceVariant,
  display: CourseLessonExperienceDisplay | undefined
): CourseLessonExperienceViewDisplay {
  return {
    ...DISPLAY_DEFAULTS_BY_VARIANT[variant],
    ...display,
  };
}

function mapLegacyDisplayToLessonExperienceDisplay(
  display: CourseLesson["display"]
): CourseLessonExperienceDisplay | undefined {
  if (!isRecord(display)) return undefined;

  const mappedDisplay: CourseLessonExperienceDisplay = {};
  const cues = getBoolean(display.cues);
  if (typeof cues === "boolean") mappedDisplay.feelCues = cues;

  const commonMistakes = getBoolean(display.commonMistakes);
  if (typeof commonMistakes === "boolean") mappedDisplay.commonMistakes = commonMistakes;

  const drill = getBoolean(display.drill);
  if (drill === false) {
    mappedDisplay.landPractice = false;
    mappedDisplay.waterPractice = false;
  }

  const nextStep = getBoolean(display.nextStep);
  if (typeof nextStep === "boolean") mappedDisplay.nextStep = nextStep;

  const support = getBoolean(display.support);
  if (typeof support === "boolean") mappedDisplay.support = support;

  return Object.keys(mappedDisplay).length > 0 ? mappedDisplay : undefined;
}

export function buildCourseLessonExperienceFromLegacyLessonFields(
  lesson: CourseLesson
): CourseLessonExperience | undefined {
  const experience: CourseLessonExperience = {};

  const display = mapLegacyDisplayToLessonExperienceDisplay(lesson.display);
  if (display) experience.display = display;

  const goal = getString(lesson.goal);
  if (goal) experience.goal = goal;

  const lessonCues = uniqueStrings(getStringArray(lesson.cues));
  if (lessonCues.length > 0) experience.feelCues = lessonCues;

  const legacyMistakes = getStringArray(lesson.commonMistakes);
  if (legacyMistakes.length > 0) experience.commonMistakes = legacyMistakes;

  const lessonDrill: Record<string, unknown> | null = isRecord(lesson.drill) ? lesson.drill : null;
  const waterPractice = normalizePractice({
    title: lessonDrill?.title,
    steps: lessonDrill?.steps,
  });
  if (waterPractice) experience.waterPractice = waterPractice;

  const nextStep = getString(lesson.nextStep);
  if (nextStep) experience.nextStep = nextStep;

  return Object.keys(experience).length > 0 ? experience : undefined;
}

function mergeObjects<T extends object>(
  fallback: T | undefined,
  preferred: T | undefined
): T | undefined {
  if (!fallback) return preferred;
  if (!preferred) return fallback;
  const merged = { ...fallback } as Record<string, unknown>;
  for (const [key, value] of Object.entries(preferred)) {
    if (typeof value !== "undefined") {
      merged[key] = value;
    }
  }
  return merged as T;
}

function mergeCourseLessonExperience(
  fallback: CourseLessonExperience | undefined,
  preferred: CourseLessonExperience | undefined
): CourseLessonExperience | undefined {
  if (!fallback) return preferred;
  if (!preferred) return fallback;

  return {
    ...fallback,
    ...preferred,
    display: mergeObjects(fallback.display, preferred.display),
    landPractice: mergeObjects(fallback.landPractice, preferred.landPractice),
    waterPractice: mergeObjects(fallback.waterPractice, preferred.waterPractice),
    support: mergeObjects(fallback.support, preferred.support),
  };
}

export function resolveCourseLessonExperience(
  lesson: CourseLesson
): CourseLessonExperience | undefined {
  return mergeCourseLessonExperience(
    buildCourseLessonExperienceFromLegacyLessonFields(lesson),
    normalizeCourseLessonExperienceInput(lesson.lessonExperience)
  );
}

function normalizeLessonExperienceMistake(
  mistake: CourseLessonExperienceMistake
): { mistake: string; fix?: string } | null {
  const mistakeText = getString(mistake);
  if (mistakeText) return { mistake: mistakeText };
  if (!isRecord(mistake)) return null;

  const normalizedMistake = getString(mistake.mistake);
  if (!normalizedMistake) return null;

  const fix = getString(mistake.fix) ?? undefined;
  return { mistake: normalizedMistake, fix };
}

function requirePractice(
  practice: CourseLessonExperiencePractice | undefined,
  fallback: CourseLessonExperienceViewPractice
): CourseLessonExperienceViewPractice {
  const title = getString(practice?.title) ?? fallback.title;
  const steps = getStringArray(practice?.steps);
  const safetyNote = getString(practice?.safetyNote) ?? fallback.safetyNote;
  const image = normalizePracticeImage(practice?.image) ?? fallback.image;

  return {
    title,
    steps: steps.length > 0 ? steps : fallback.steps,
    safetyNote,
    image,
  };
}

export function buildCourseLessonExperienceViewModel(
  lesson: CourseLesson
): CourseLessonExperienceViewModel {
  const legacyExperience = buildCourseLessonExperienceFromLegacyLessonFields(lesson);
  const experience = resolveCourseLessonExperience(lesson);
  const variant = normalizeVariant(experience?.variant) ?? resolveDefaultVariant(lesson);
  const display = resolveExperienceDisplay(variant, experience?.display);
  const experienceFeelCues = getStringArray(experience?.feelCues);
  const legacyFeelCues = getStringArray(legacyExperience?.feelCues);
  const primaryCue = legacyFeelCues[0] ?? "Swim relaxed and controlled.";
  const goal = getString(experience?.goal) ?? "Start with one clear focus.";
  const quickExplanation =
    getString(experience?.quickExplanation) ??
    `${goal} Keep the cue simple: ${primaryCue}. Add effort only after the movement feels calm.`;

  const landPractice = requirePractice(experience?.landPractice, {
    title: "Dryland cue rehearsal",
    steps: [
      `Stand tall and rehearse the cue: ${primaryCue}.`,
      "Move slowly enough that you can notice tension before you enter the water.",
      "Take three calm breaths, then repeat the same focus in the pool.",
    ],
  });

  const waterPractice = requirePractice(experience?.waterPractice, {
    title: "Water practice",
    steps: [`Try one short repeat while keeping the cue: ${primaryCue}.`],
    safetyNote: "Reset before quality drops. Use shallow water when you need a calm restart.",
  });

  const authoredMistakes = (experience?.commonMistakes ?? [])
    .map((mistake) => normalizeLessonExperienceMistake(mistake))
    .filter((mistake): mistake is { mistake: string; fix?: string } => Boolean(mistake));
  const commonMistakes = authoredMistakes;
  const feelCues = uniqueStrings(experienceFeelCues.length > 0 ? experienceFeelCues : [primaryCue]);

  return {
    variant,
    display,
    goal,
    primaryCue,
    quickExplanation,
    whyThisMatters: getString(experience?.whyThisMatters) ?? undefined,
    landPractice,
    waterPractice,
    commonMistakes,
    feelCues: feelCues.length > 0 ? feelCues : ["Calm, easy, repeatable."],
    masteryCriteria: getCourseLessonPassCriteria(lesson),
    nextStep: getString(experience?.nextStep) ?? "Continue to the next lesson.",
    support: {
      title: getString(experience?.support?.title) ?? "Need extra help?",
      body:
        getString(experience?.support?.body) ??
        "Free lesson first. If this does not click after a few calm sessions, use support to get structure or feedback.",
    },
  };
}
