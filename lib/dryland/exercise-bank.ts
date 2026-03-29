import type {
  DrylandExerciseDraft,
  DrylandExerciseMediaType,
  DrylandSessionKind,
  DrylandSetDraft,
} from "@/lib/dryland/shared";

export type DrylandExerciseBankItem = {
  id: string;
  sessionKinds: DrylandSessionKind[];
  title: string;
  summary: string;
  howTo: string;
  targetAreas: string[];
  accent: "blue" | "teal" | "amber" | "rose" | "emerald";
  mediaType: DrylandExerciseMediaType;
  mediaUrl: string | null;
  mediaPosterUrl: string | null;
  mediaLabel: string | null;
  defaultSets: DrylandSetDraft[];
};

function buildStrengthSet(
  reps: number,
  restSeconds: number,
  loadKg: number | null = null
): DrylandSetDraft {
  return {
    id: `set-${reps}-${restSeconds}-${loadKg ?? "bw"}`,
    reps,
    holdSeconds: null,
    loadKg,
    restSeconds,
    isCompleted: false,
    completedAt: null,
  };
}

function buildStretchSet(holdSeconds: number, restSeconds: number): DrylandSetDraft {
  return {
    id: `set-hold-${holdSeconds}-${restSeconds}`,
    reps: null,
    holdSeconds,
    loadKg: null,
    restSeconds,
    isCompleted: false,
    completedAt: null,
  };
}

export const DRYLAND_EXERCISE_BANK: DrylandExerciseBankItem[] = [
  {
    id: "strength-air-squat",
    sessionKinds: ["strength"],
    title: "Air squat",
    summary: "Foundational lower-body strength with bodyweight control.",
    howTo:
      "Stand tall, sit the hips back, keep knees tracking over toes, and drive up through the full foot without losing posture.",
    targetAreas: ["Quads", "Glutes", "Core"],
    accent: "blue",
    mediaType: "none",
    mediaUrl: null,
    mediaPosterUrl: null,
    mediaLabel: null,
    defaultSets: [buildStrengthSet(12, 90), buildStrengthSet(12, 90), buildStrengthSet(12, 90)],
  },
  {
    id: "strength-push-up",
    sessionKinds: ["strength"],
    title: "Push-up",
    summary: "Upper-body pressing and trunk control with scalable bodyweight loading.",
    howTo:
      "Keep the body in one line, lower under control, and press without letting the hips sag or shoulders shrug.",
    targetAreas: ["Chest", "Shoulders", "Triceps", "Core"],
    accent: "amber",
    mediaType: "none",
    mediaUrl: null,
    mediaPosterUrl: null,
    mediaLabel: null,
    defaultSets: [buildStrengthSet(10, 90), buildStrengthSet(10, 90), buildStrengthSet(10, 90)],
  },
  {
    id: "strength-dead-bug",
    sessionKinds: ["strength"],
    title: "Dead bug",
    summary: "Midline control and anti-extension work for better trunk stability.",
    howTo:
      "Keep the lower back long on the floor while opposite arm and leg reach away without losing trunk tension.",
    targetAreas: ["Core", "Hip flexor control"],
    accent: "teal",
    mediaType: "none",
    mediaUrl: null,
    mediaPosterUrl: null,
    mediaLabel: null,
    defaultSets: [buildStrengthSet(8, 45), buildStrengthSet(8, 45), buildStrengthSet(8, 45)],
  },
  {
    id: "stretching-hip-flexor",
    sessionKinds: ["stretching"],
    title: "Hip flexor stretch",
    summary: "Open the front of the hip and reduce desk/tight-kick stiffness.",
    howTo:
      "Set up in a half-kneeling lunge, tuck the pelvis slightly, and glide the hips forward until the front hip opens without arching the back.",
    targetAreas: ["Hip flexors", "Front thigh"],
    accent: "emerald",
    mediaType: "none",
    mediaUrl: null,
    mediaPosterUrl: null,
    mediaLabel: null,
    defaultSets: [buildStretchSet(30, 15), buildStretchSet(30, 15)],
  },
  {
    id: "stretching-thoracic-rotation",
    sessionKinds: ["stretching"],
    title: "Thoracic rotation",
    summary: "Improve upper-back rotation and breathing-friendly mobility.",
    howTo:
      "Move from the upper back, keep the hips quiet, and let the chest open gradually without forcing the range.",
    targetAreas: ["Upper back", "Rib cage"],
    accent: "rose",
    mediaType: "none",
    mediaUrl: null,
    mediaPosterUrl: null,
    mediaLabel: null,
    defaultSets: [buildStretchSet(25, 10), buildStretchSet(25, 10)],
  },
  {
    id: "stretching-hamstring",
    sessionKinds: ["stretching"],
    title: "Hamstring stretch",
    summary: "Lengthen the back line without rounding aggressively through the spine.",
    howTo:
      "Keep a long spine, soften the breath, and move only until the hamstrings open clearly without pain or bouncing.",
    targetAreas: ["Hamstrings", "Back line"],
    accent: "blue",
    mediaType: "none",
    mediaUrl: null,
    mediaPosterUrl: null,
    mediaLabel: null,
    defaultSets: [buildStretchSet(30, 10), buildStretchSet(30, 10)],
  },
];

export function getDrylandExerciseBankByKind(sessionKind: DrylandSessionKind) {
  return DRYLAND_EXERCISE_BANK.filter((item) => item.sessionKinds.includes(sessionKind));
}

function buildExerciseId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function cloneSet(set: DrylandSetDraft, index: number): DrylandSetDraft {
  return {
    ...set,
    id: `${set.id}-${index + 1}-${Math.random().toString(36).slice(2, 6)}`,
    isCompleted: false,
    completedAt: null,
  };
}

export function buildDrylandExerciseFromBankItem(
  item: DrylandExerciseBankItem
): DrylandExerciseDraft {
  return {
    id: buildExerciseId(item.id),
    source: "bank",
    bankExerciseId: item.id,
    title: item.title,
    summary: item.summary,
    howTo: item.howTo,
    targetAreas: item.targetAreas,
    accent: item.accent,
    mediaType: item.mediaType,
    mediaUrl: item.mediaUrl,
    mediaPosterUrl: item.mediaPosterUrl,
    mediaLabel: item.mediaLabel,
    notes: "",
    sets: item.defaultSets.map(cloneSet),
  };
}

export function buildCustomDrylandExercise(sessionKind: DrylandSessionKind): DrylandExerciseDraft {
  return {
    id: buildExerciseId(`custom-${sessionKind}`),
    source: "custom",
    bankExerciseId: null,
    title: sessionKind === "strength" ? "Custom strength exercise" : "Custom stretch",
    summary:
      sessionKind === "strength"
        ? "Owner-authored exercise without a shared bank reference yet."
        : "Owner-authored stretch without a shared bank reference yet.",
    howTo: "",
    targetAreas: [],
    accent: sessionKind === "strength" ? "amber" : "emerald",
    mediaType: "none",
    mediaUrl: null,
    mediaPosterUrl: null,
    mediaLabel: null,
    notes: "",
    sets:
      sessionKind === "strength"
        ? [buildStrengthSet(8, 60), buildStrengthSet(8, 60), buildStrengthSet(8, 60)].map(cloneSet)
        : [buildStretchSet(30, 10), buildStretchSet(30, 10)].map(cloneSet),
  };
}
