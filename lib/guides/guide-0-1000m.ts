export type Guide0To1000Session = {
  id: string;
  weekNumber: number;
  title: string;
  focus: string;
  targetSet: string;
};

export const GUIDE_0_TO_1000M_SLUG = "0-1000m";
export const GUIDE_0_TO_1000M_PRODUCT_ID = "guide_0_1000m";
export const GUIDE_0_TO_1000M_PDF_DOWNLOAD_FILENAME = "freeswimming-0-1000m-guide.pdf";

const DEFAULT_GUIDE_0_TO_1000M_PDF_ASSET_PATH = "assets/guides/0-1000m-guide.pdf";
const SAFE_PDF_PATH_REGEX = /^[A-Za-z0-9/_\-.]+\.pdf$/;

export function getGuide0To1000PdfAssetPath(
  env: Readonly<Record<string, string | undefined>> = process.env
): string {
  const candidate = env.GUIDE_0_TO_1000M_PDF_ASSET_PATH?.trim();
  if (!candidate) return DEFAULT_GUIDE_0_TO_1000M_PDF_ASSET_PATH;
  if (candidate.startsWith("/")) return DEFAULT_GUIDE_0_TO_1000M_PDF_ASSET_PATH;
  if (candidate.includes("..")) return DEFAULT_GUIDE_0_TO_1000M_PDF_ASSET_PATH;
  if (!SAFE_PDF_PATH_REGEX.test(candidate)) return DEFAULT_GUIDE_0_TO_1000M_PDF_ASSET_PATH;
  return candidate;
}

export const GUIDE_0_TO_1000M_SESSIONS: Guide0To1000Session[] = [
  {
    id: "S01",
    weekNumber: 1,
    title: "Baseline and breathing rhythm",
    focus: "Set calm breathing cadence and smooth exhale.",
    targetSet: "6 x 50m easy + 4 x 25m drill focus",
  },
  {
    id: "S02",
    weekNumber: 1,
    title: "Body line and head position",
    focus: "Hold long shape with neutral head.",
    targetSet: "8 x 50m with 20s rest",
  },
  {
    id: "S03",
    weekNumber: 2,
    title: "Kick support without over-kicking",
    focus: "Use small kick for balance, not speed.",
    targetSet: "4 x 100m aerobic + 4 x 25m kick control",
  },
  {
    id: "S04",
    weekNumber: 2,
    title: "Front quadrant timing",
    focus: "Keep stroke patient and connected.",
    targetSet: "10 x 50m negative split",
  },
  {
    id: "S05",
    weekNumber: 3,
    title: "Catch setup and early pressure",
    focus: "Build stable catch before pull-through.",
    targetSet: "6 x 75m technique + 4 x 25m fist drill",
  },
  {
    id: "S06",
    weekNumber: 3,
    title: "Rotation control",
    focus: "Rotate from core without crossing line.",
    targetSet: "5 x 100m with bilateral breathing",
  },
  {
    id: "S07",
    weekNumber: 4,
    title: "Aerobic durability",
    focus: "Stay relaxed while distance grows.",
    targetSet: "3 x 200m steady + 4 x 50m easy",
  },
  {
    id: "S08",
    weekNumber: 4,
    title: "Pace awareness",
    focus: "Hold even pacing across reps.",
    targetSet: "12 x 50m at controlled threshold",
  },
  {
    id: "S09",
    weekNumber: 5,
    title: "Turns and push-off line",
    focus: "Protect momentum out of wall.",
    targetSet: "8 x 75m with turn focus",
  },
  {
    id: "S10",
    weekNumber: 5,
    title: "Stroke length under fatigue",
    focus: "Keep distance-per-stroke late in set.",
    targetSet: "4 x 150m + 4 x 50m build",
  },
  {
    id: "S11",
    weekNumber: 6,
    title: "Tempo and relaxation balance",
    focus: "Increase tempo without losing form.",
    targetSet: "16 x 25m tempo ladder + 4 x 100m easy",
  },
  {
    id: "S12",
    weekNumber: 6,
    title: "Mid-plan check session",
    focus: "Re-check breathing, body line, and catch.",
    targetSet: "1 x 400m continuous + technique reset reps",
  },
  {
    id: "S13",
    weekNumber: 7,
    title: "Endurance extension",
    focus: "Stay efficient across longer repeats.",
    targetSet: "3 x 250m with 30s rest",
  },
  {
    id: "S14",
    weekNumber: 7,
    title: "Broken 500 prep",
    focus: "Manage effort and stroke quality.",
    targetSet: "5 x 100m + 1 x 50m at target effort",
  },
  {
    id: "S15",
    weekNumber: 8,
    title: "Technique under threshold effort",
    focus: "Protect form when heart rate rises.",
    targetSet: "8 x 75m threshold + 4 x 25m reset",
  },
  {
    id: "S16",
    weekNumber: 8,
    title: "Race-pace rhythm control",
    focus: "Lock in repeatable target pace.",
    targetSet: "10 x 50m at target 1000m pace",
  },
  {
    id: "S17",
    weekNumber: 9,
    title: "Long aerobic confidence",
    focus: "Build confidence for uninterrupted swim.",
    targetSet: "2 x 300m + 4 x 50m easy",
  },
  {
    id: "S18",
    weekNumber: 9,
    title: "Broken 800 rehearsal",
    focus: "Practice fueling and pacing strategy.",
    targetSet: "4 x 200m with stable split times",
  },
  {
    id: "S19",
    weekNumber: 10,
    title: "Pre-test sharpening",
    focus: "Stay crisp and relaxed before test day.",
    targetSet: "6 x 50m build + 4 x 25m easy",
  },
  {
    id: "S20",
    weekNumber: 10,
    title: "1000m completion session",
    focus: "Swim controlled, confident, and continuous.",
    targetSet: "1 x 1000m continuous + easy cooldown",
  },
];
