export type PoolsideDrill = {
  id: string;
  title: string;
  summary: string;
  setup: string;
  keyFocus: string[];
  visualAssetPath: string;
  visualAlt: string;
};

export const GUIDE_POOLSIDE_SLUG = "poolside";
export const GUIDE_POOLSIDE_PRODUCT_ID = "guide_poolside";
export const GUIDE_POOLSIDE_PDF_DOWNLOAD_FILENAME = "freeswimming-poolside-guide.pdf";

const DEFAULT_GUIDE_POOLSIDE_PDF_ASSET_PATH = "assets/guides/poolside-guide.pdf";
const SAFE_PDF_PATH_REGEX = /^[A-Za-z0-9/_\-.]+\.pdf$/;

export function getGuidePoolsidePdfAssetPath(
  env: Readonly<Record<string, string | undefined>> = process.env
): string {
  const candidate = env.GUIDE_POOLSIDE_PDF_ASSET_PATH?.trim();
  if (!candidate) return DEFAULT_GUIDE_POOLSIDE_PDF_ASSET_PATH;
  if (candidate.startsWith("/")) return DEFAULT_GUIDE_POOLSIDE_PDF_ASSET_PATH;
  if (candidate.includes("..")) return DEFAULT_GUIDE_POOLSIDE_PDF_ASSET_PATH;
  if (!SAFE_PDF_PATH_REGEX.test(candidate)) return DEFAULT_GUIDE_POOLSIDE_PDF_ASSET_PATH;
  return candidate;
}

export const GUIDE_POOLSIDE_DRILLS: PoolsideDrill[] = [
  {
    id: "D01",
    title: "Streamline push and glide reset",
    summary: "Rebuild body line before adding stroke tempo.",
    setup: "6 x 15m push and glide, then 4 x 25m easy swim with same line.",
    keyFocus: [
      "Chin neutral and eyes down",
      "Ribs tucked so hips stay high",
      "Start first stroke only after glide slows",
    ],
    visualAssetPath: "/guides/poolside/drill-01.svg",
    visualAlt: "Placeholder visual for streamline push and glide with focus markers.",
  },
  {
    id: "D02",
    title: "Side-kick balance hold",
    summary: "Improve side balance and stable breathing posture.",
    setup: "8 x 25m side kick, switch side each length.",
    keyFocus: [
      "Bottom arm fully extended",
      "Top hip stays stacked over bottom hip",
      "Small kick supports balance, not speed",
    ],
    visualAssetPath: "/guides/poolside/drill-02.svg",
    visualAlt: "Placeholder visual for side-kick balance drill with marked body alignment.",
  },
  {
    id: "D03",
    title: "6-1-6 timing rhythm",
    summary: "Connect kick rhythm to clean arm recovery timing.",
    setup: "6 x 50m as 6 kicks side - 1 stroke - 6 kicks side.",
    keyFocus: [
      "Rotate from core, not from shoulders alone",
      "Enter hand softly in line with shoulder",
      "Pause briefly to regain stable line",
    ],
    visualAssetPath: "/guides/poolside/drill-03.svg",
    visualAlt: "Placeholder visual for 6-1-6 timing drill with rotation cues.",
  },
  {
    id: "D04",
    title: "Fist-swim pressure awareness",
    summary: "Improve forearm catch awareness by removing hand paddle effect.",
    setup: "4 x 50m fist swim + 4 x 50m normal swim.",
    keyFocus: [
      "Feel pressure on forearm early",
      "Keep elbow slightly higher than wrist",
      "Do not rush pull when fists are closed",
    ],
    visualAssetPath: "/guides/poolside/drill-04.svg",
    visualAlt: "Placeholder visual for fist-swim drill with catch pressure markers.",
  },
  {
    id: "D05",
    title: "Catch-up with front hold",
    summary: "Build front-quadrant patience and cleaner hand path.",
    setup: "6 x 50m catch-up drill with controlled tempo.",
    keyFocus: [
      "Lead arm stays long until recovering hand nears entry",
      "Avoid crossing center line",
      "Exhale continuously while waiting in front",
    ],
    visualAssetPath: "/guides/poolside/drill-05.svg",
    visualAlt: "Placeholder visual for catch-up drill showing front hold timing.",
  },
  {
    id: "D06",
    title: "Single-arm bodyline control",
    summary: "Integrate one-arm stroke with stable trunk alignment.",
    setup: "6 x 25m right arm + 6 x 25m left arm.",
    keyFocus: [
      "Non-working arm remains forward",
      "Hips stay level through breathing",
      "Finish pull to thigh without over-rotating",
    ],
    visualAssetPath: "/guides/poolside/drill-06.svg",
    visualAlt: "Placeholder visual for single-arm drill with bodyline alignment cues.",
  },
  {
    id: "D07",
    title: "Breath timing snap drill",
    summary: "Reduce long head lift and return face quickly to water.",
    setup: "8 x 25m breathe every 3, focus on fast return.",
    keyFocus: [
      "One goggle remains in water when breathing",
      "Rotate to breath, do not lift",
      "Face returns before hand entry of opposite arm",
    ],
    visualAssetPath: "/guides/poolside/drill-07.svg",
    visualAlt: "Placeholder visual for breath-timing drill with head position cues.",
  },
  {
    id: "D08",
    title: "Finger-drag recovery path",
    summary: "Calm recovery and improve elbow-led motion.",
    setup: "6 x 50m finger drag drill at easy effort.",
    keyFocus: [
      "Elbow leads, hand stays relaxed",
      "Keep recovery narrow and controlled",
      "Entry target stays just outside shoulder line",
    ],
    visualAssetPath: "/guides/poolside/drill-08.svg",
    visualAlt: "Placeholder visual for finger-drag drill with recovery path markers.",
  },
  {
    id: "D09",
    title: "Scull front anchor set",
    summary: "Find better water hold before full pull-through.",
    setup: "6 x 25m front scull + 4 x 50m swim transfer.",
    keyFocus: [
      "Hands and forearms angle to hold water",
      "Small controlled movements only",
      "Maintain long neck and quiet kick",
    ],
    visualAssetPath: "/guides/poolside/drill-09.svg",
    visualAlt: "Placeholder visual for front-scull drill with anchor points.",
  },
  {
    id: "D10",
    title: "Pace-ladder form retention",
    summary: "Keep technique stable as effort gradually increases.",
    setup: "4 x 50m easy/moderate/strong/easy, repeat twice.",
    keyFocus: [
      "Preserve stroke length as speed increases",
      "Hold relaxed shoulders",
      "Count strokes and avoid late-set drift",
    ],
    visualAssetPath: "/guides/poolside/drill-10.svg",
    visualAlt: "Placeholder visual for pace-ladder drill with form checkpoints.",
  },
  {
    id: "D11",
    title: "Turn-out streamline reset",
    summary: "Protect speed after wall and reconnect bodyline fast.",
    setup: "8 x 25m with strict push-off + first three strokes focus.",
    keyFocus: [
      "Explode from wall in tight line",
      "First breath delayed until line is stable",
      "First stroke keeps elbow-front catch",
    ],
    visualAssetPath: "/guides/poolside/drill-11.svg",
    visualAlt: "Placeholder visual for push-off and first strokes after turn.",
  },
  {
    id: "D12",
    title: "Integrated quality round",
    summary: "Combine balance, breath timing, and catch in one controlled round.",
    setup: "3 rounds: 50m drill choice + 50m smooth swim transfer.",
    keyFocus: [
      "Pick one technical cue per 50m",
      "Keep effort below threshold to keep quality high",
      "Log what improved before next session",
    ],
    visualAssetPath: "/guides/poolside/drill-12.svg",
    visualAlt: "Placeholder visual for integrated quality drill round.",
  },
];
