import type {
  CourseLesson,
  CourseLessonExperience,
  CourseLessonExperienceImage,
  CourseLessonExperienceMistake,
  CourseLessonExperiencePractice,
  CourseLessonExperienceSupport,
} from "@/app/course/courseData";
import { getCourseLessonPassCriteria } from "@/lib/course/progress-status";

export type CourseLessonExperienceViewPractice = {
  title: string;
  steps: string[];
  safetyNote?: string;
  image?: CourseLessonExperienceImage;
};

export type CourseLessonExperienceViewModel = {
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
  const experience = normalizeCourseLessonExperienceInput(lesson.lessonExperience);
  const lessonCues = uniqueStrings(getStringArray(lesson.cues));
  const primaryCue = lessonCues[0] ?? "Swim relaxed and controlled.";
  const goal =
    getString(experience?.goal) ?? getString(lesson.goal) ?? "Start with one clear focus.";
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

  const drillSteps = getStringArray(lesson.drill.steps);
  const waterPractice = requirePractice(experience?.waterPractice, {
    title: getString(lesson.drill.title) ?? "Water practice",
    steps:
      drillSteps.length > 0
        ? drillSteps
        : [`Try one short repeat while keeping the cue: ${primaryCue}.`],
    safetyNote: "Reset before quality drops. Use shallow water when you need a calm restart.",
  });

  const authoredMistakes = (experience?.commonMistakes ?? [])
    .map((mistake) => normalizeLessonExperienceMistake(mistake))
    .filter((mistake): mistake is { mistake: string; fix?: string } => Boolean(mistake));
  const fallbackMistakes = getStringArray(lesson.commonMistakes).map((mistake) => ({ mistake }));
  const commonMistakes = authoredMistakes.length > 0 ? authoredMistakes : fallbackMistakes;
  const experienceFeelCues = getStringArray(experience?.feelCues);
  const feelCues = uniqueStrings(
    experienceFeelCues.length > 0 ? experienceFeelCues : [primaryCue, ...lessonCues.slice(1)]
  );

  return {
    goal,
    primaryCue,
    quickExplanation,
    whyThisMatters: getString(experience?.whyThisMatters) ?? undefined,
    landPractice,
    waterPractice,
    commonMistakes,
    feelCues: feelCues.length > 0 ? feelCues : ["Calm, easy, repeatable."],
    masteryCriteria: getCourseLessonPassCriteria(lesson),
    nextStep:
      getString(experience?.nextStep) ??
      getString(lesson.nextStep) ??
      "Continue to the next lesson.",
    support: {
      title: getString(experience?.support?.title) ?? "Need extra help?",
      body:
        getString(experience?.support?.body) ??
        "Free lesson first. If this does not click after a few calm sessions, use support to get structure or feedback.",
    },
  };
}
