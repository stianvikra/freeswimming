"use client";

import { CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";
import {
  SWIM_CAPABILITY_STROKES,
  formatSwimCapabilityLimitSummary,
  getSwimCapabilityStrokeLabel,
  type SwimCapabilityLimitInput,
  type SwimCapabilityStroke,
} from "@/lib/athlete-profile/capabilities";
import {
  ATHLETE_AGE_BAND_OPTIONS,
  buildAthleteProfilePrimaryName,
  type AthleteAgeBand,
} from "@/lib/athlete-profile/mvp";
import {
  PERSONAL_RECORD_COURSE_OPTIONS,
  PERSONAL_RECORD_STROKE_OPTIONS,
  type PersonalRecordCourse,
  type PersonalRecordStroke,
} from "@/lib/athlete-profile/personal-records";
import {
  formatCssSecondsPer100m,
  TRAINING_POOL_LENGTH_OPTIONS,
  TRAINING_SESSION_DURATION_OPTIONS,
  TRAINING_WEEKDAY_OPTIONS,
  TRAINING_WEEKDAY_VALUES,
  type TrainingWeekday,
} from "@/lib/athlete-profile/training-setup";
import type {
  AthleteProfileSnapshot,
  AthleteProfileView,
  PersonalRecordView,
  SwimCapabilityLimitView,
  TrainingMetricView,
  TrainingPreferencesView,
} from "@/lib/athlete-profile/server";
import { readNavigatorOnlineState } from "@/lib/utils/navigator-online";

type Props = {
  initialSnapshot: AthleteProfileSnapshot;
  userId: string;
};

type ApiError = {
  ok?: boolean;
  error?: string;
  recordId?: string;
  snapshot?: AthleteProfileSnapshot;
};

type AthleteProfileDraft = {
  displayName: string;
  firstName: string;
  lastName: string;
  ageBand: AthleteAgeBand | "";
};

type CssMetricDraft = {
  pace: string;
  recordedOn: string;
  sourceNote: string;
};

type TrainingPreferencesDraft = {
  poolLengthM: "" | "25" | "50";
  availableDays: TrainingWeekday[];
  preferredWeeklySessionCount: string;
  preferredSessionMinutes: "" | "30" | "45" | "60" | "75" | "90";
};

type PersonalRecordDraft = {
  editingRecordId: string | null;
  distanceM: string;
  stroke: PersonalRecordStroke | "";
  course: PersonalRecordCourse | "";
  time: string;
  recordedOn: string;
  sourceNote: string;
};

type CapabilityLimitsDraft = {
  drillMaxRepeatDistanceM: string;
  drillTargetTotalDistanceM: string;
  kickMaxRepeatDistanceM: string;
  kickTargetTotalDistanceM: string;
  strokeLimits: Record<
    SwimCapabilityStroke,
    {
      maxRepeatDistanceM: string;
      maxTotalDistanceM: string;
    }
  >;
};

type TopLevelCapabilityLimitKey = Exclude<keyof CapabilityLimitsDraft, "strokeLimits">;

type ProfileSectionKey = "profile" | "css" | "preferences" | "capabilities" | "records";

type SectionDisclosureState = Record<ProfileSectionKey, boolean>;

type SectionSummaryCopy = {
  summary: string;
  detail: string;
  hasData: boolean;
};

type ReadinessCard = {
  key: ProfileSectionKey;
  label: string;
  scope: string;
  summary: string;
  detail: string;
  hasData: boolean;
  hasUnsavedChanges: boolean;
  isAdvanced?: boolean;
};

const PROFILE_SECTION_ORDER: ProfileSectionKey[] = [
  "profile",
  "css",
  "preferences",
  "records",
  "capabilities",
];
const CORE_PROFILE_SECTION_ORDER: ProfileSectionKey[] = [
  "profile",
  "css",
  "preferences",
  "records",
];
const SECTION_LABELS: Record<ProfileSectionKey, string> = {
  profile: "swimmer identity",
  css: "CSS",
  preferences: "training defaults",
  records: "best times",
  capabilities: "advanced generator limits",
};
const CAPABILITY_INPUT_CLASS =
  "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const PROFILE_SECTION_HEADER_CLASS =
  "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between";
const PROFILE_SECTION_TOGGLE_CLASS =
  "inline-flex h-10 min-w-10 items-center justify-center gap-2 self-end rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:self-auto";
const PROFILE_PRIMARY_BUTTON_CLASS =
  "inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300";
const PROFILE_SECTION_CLASS = "rounded-2xl border border-slate-200 bg-white p-4 sm:p-5";

function CapabilityInputField({
  label,
  testId,
  value,
  placeholder = "",
  unit = "m",
  inputMode = "decimal",
  onChange,
}: {
  label: string;
  testId: string;
  value: string;
  placeholder?: string;
  unit?: string;
  inputMode?: "decimal" | "numeric";
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <span className="relative block">
        <input
          data-testid={testId}
          type="text"
          inputMode={inputMode}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`${CAPABILITY_INPUT_CLASS} pr-10`}
        />
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold text-slate-500">
          {unit}
        </span>
      </span>
    </label>
  );
}

function SectionToggleButton({
  isOpen,
  label,
  testId,
  controls,
  onClick,
}: {
  isOpen: boolean;
  label: string;
  testId: string;
  controls: string;
  onClick: () => void;
}) {
  const Icon = isOpen ? ChevronDown : ChevronRight;

  return (
    <button
      type="button"
      data-testid={testId}
      aria-label={`${isOpen ? "Hide" : "Edit"} ${label}`}
      aria-expanded={isOpen}
      aria-controls={controls}
      onClick={onClick}
      className={PROFILE_SECTION_TOGGLE_CLASS}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">{isOpen ? "Hide" : "Edit"}</span>
    </button>
  );
}

function buildProfileDraft(profile: AthleteProfileView | null): AthleteProfileDraft {
  return {
    displayName: profile?.displayName ?? "",
    firstName: profile?.firstName ?? "",
    lastName: profile?.lastName ?? "",
    ageBand: profile?.ageBand ?? "",
  };
}

function buildCssMetricDraft(metric: TrainingMetricView | null): CssMetricDraft {
  return {
    pace: formatCssSecondsPer100m(metric?.valueSeconds ?? null) ?? "",
    recordedOn: metric?.recordedOn ?? "",
    sourceNote: metric?.sourceNote ?? "",
  };
}

function buildPreferencesDraft(
  preferences: TrainingPreferencesView | null
): TrainingPreferencesDraft {
  return {
    poolLengthM: preferences?.poolLengthM ? (String(preferences.poolLengthM) as "25" | "50") : "",
    availableDays: preferences?.availableDays ?? [],
    preferredWeeklySessionCount: preferences?.preferredWeeklySessionCount
      ? String(preferences.preferredWeeklySessionCount)
      : "",
    preferredSessionMinutes: preferences?.preferredSessionMinutes
      ? (String(
          preferences.preferredSessionMinutes
        ) as TrainingPreferencesDraft["preferredSessionMinutes"])
      : "",
  };
}

function buildPersonalRecordDraft(record: PersonalRecordView | null): PersonalRecordDraft {
  return {
    editingRecordId: record?.id ?? null,
    distanceM: record?.distanceM ? String(record.distanceM) : "",
    stroke: record?.stroke ?? "",
    course: record?.course ?? "",
    time: record?.timeLabel ?? "",
    recordedOn: record?.recordedOn ?? "",
    sourceNote: record?.sourceNote ?? "",
  };
}

function createEmptyCapabilityLimitsDraft(): CapabilityLimitsDraft {
  return {
    drillMaxRepeatDistanceM: "",
    drillTargetTotalDistanceM: "",
    kickMaxRepeatDistanceM: "",
    kickTargetTotalDistanceM: "",
    strokeLimits: SWIM_CAPABILITY_STROKES.reduce(
      (result, stroke) => {
        result[stroke] = {
          maxRepeatDistanceM: "",
          maxTotalDistanceM: "",
        };
        return result;
      },
      {} as CapabilityLimitsDraft["strokeLimits"]
    ),
  };
}

function formatCapabilityDraftDistance(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return "";
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? rounded.toFixed(0) : String(rounded);
}

function buildCapabilityLimitsDraft(limits: SwimCapabilityLimitView[]): CapabilityLimitsDraft {
  const draft = createEmptyCapabilityLimitsDraft();

  for (const limit of limits) {
    if (limit.kind === "drill") {
      draft.drillMaxRepeatDistanceM = formatCapabilityDraftDistance(limit.maxRepeatDistanceM);
      draft.drillTargetTotalDistanceM = formatCapabilityDraftDistance(limit.targetTotalDistanceM);
      continue;
    }

    if (limit.kind === "kick") {
      draft.kickMaxRepeatDistanceM = formatCapabilityDraftDistance(limit.maxRepeatDistanceM);
      draft.kickTargetTotalDistanceM = formatCapabilityDraftDistance(limit.targetTotalDistanceM);
      continue;
    }

    if (limit.kind === "stroke" && limit.stroke) {
      draft.strokeLimits[limit.stroke] = {
        maxRepeatDistanceM: formatCapabilityDraftDistance(limit.maxRepeatDistanceM),
        maxTotalDistanceM: formatCapabilityDraftDistance(limit.maxTotalDistanceM),
      };
    }
  }

  return draft;
}

function buildCapabilityLimitInputs(draft: CapabilityLimitsDraft): SwimCapabilityLimitInput[] {
  return [
    {
      kind: "drill",
      maxRepeatDistanceM: draft.drillMaxRepeatDistanceM,
      targetTotalDistanceM: draft.drillTargetTotalDistanceM,
    },
    {
      kind: "kick",
      maxRepeatDistanceM: draft.kickMaxRepeatDistanceM,
      targetTotalDistanceM: draft.kickTargetTotalDistanceM,
    },
    ...SWIM_CAPABILITY_STROKES.map((stroke) => ({
      kind: "stroke",
      stroke,
      maxRepeatDistanceM: draft.strokeLimits[stroke].maxRepeatDistanceM,
      maxTotalDistanceM: draft.strokeLimits[stroke].maxTotalDistanceM,
    })),
  ];
}

function getStorageKey(
  userId: string,
  scope: "profile" | "css" | "preferences" | "capabilities" | "records"
) {
  return `my-library-athlete-profile-${scope}-draft:${userId}`;
}

function getDisclosureStorageKey(userId: string) {
  return `my-library-athlete-profile-disclosure:${userId}`;
}

function getStorageValue<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return {
      ...fallback,
      ...(JSON.parse(raw) as Record<string, unknown>),
    } as T;
  } catch {
    return fallback;
  }
}

function setStorageValue(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function clearStorageValue(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

function serializeDraft(value: unknown) {
  return JSON.stringify(value);
}

function buildAvailableDaysSummary(days: string[]): string {
  return days.join(", ");
}

function findRecordById(records: PersonalRecordView[], recordId: string | null) {
  if (!recordId) return null;
  return records.find((record) => record.id === recordId) ?? null;
}

function getSectionHasData(snapshot: AthleteProfileSnapshot, section: ProfileSectionKey) {
  switch (section) {
    case "profile":
      return Boolean(snapshot.profile);
    case "css":
      return Boolean(snapshot.cssMetric);
    case "preferences":
      return Boolean(snapshot.preferences);
    case "capabilities":
      return snapshot.swimCapabilityLimits.length > 0;
    case "records":
      return snapshot.personalRecords.length > 0;
  }
}

function getSectionHasIssue(snapshot: AthleteProfileSnapshot, section: ProfileSectionKey) {
  switch (section) {
    case "profile":
      return !snapshot.profileSchemaReady || Boolean(snapshot.loadError);
    case "css":
      return !snapshot.metricsSchemaReady || Boolean(snapshot.metricsLoadError);
    case "preferences":
      return !snapshot.preferencesSchemaReady || Boolean(snapshot.preferencesLoadError);
    case "capabilities":
      return (
        !snapshot.swimCapabilityLimitsSchemaReady || Boolean(snapshot.swimCapabilityLimitsLoadError)
      );
    case "records":
      return !snapshot.personalRecordsSchemaReady || Boolean(snapshot.personalRecordsLoadError);
  }
}

function getRecommendedSetupSection(snapshot: AthleteProfileSnapshot): ProfileSectionKey | null {
  const coreSection = CORE_PROFILE_SECTION_ORDER.find(
    (section) => getSectionHasIssue(snapshot, section) || !getSectionHasData(snapshot, section)
  );

  if (coreSection) return coreSection;

  if (
    getSectionHasIssue(snapshot, "capabilities") ||
    !getSectionHasData(snapshot, "capabilities")
  ) {
    return "capabilities";
  }

  return null;
}

function buildDefaultDisclosureState({
  snapshot,
  hasProfileDraft,
  hasCssDraft,
  hasPreferencesDraft,
  hasCapabilitiesDraft,
  hasRecordDraft,
}: {
  snapshot: AthleteProfileSnapshot;
  hasProfileDraft: boolean;
  hasCssDraft: boolean;
  hasPreferencesDraft: boolean;
  hasCapabilitiesDraft: boolean;
  hasRecordDraft: boolean;
}): SectionDisclosureState {
  const draftState: SectionDisclosureState = {
    profile: hasProfileDraft,
    css: hasCssDraft,
    preferences: hasPreferencesDraft,
    capabilities: hasCapabilitiesDraft,
    records: hasRecordDraft,
  };

  if (Object.values(draftState).some(Boolean)) {
    return draftState;
  }

  const recommendedSection = getRecommendedSetupSection(snapshot);

  return PROFILE_SECTION_ORDER.reduce((result, section) => {
    result[section] = section === recommendedSection;
    return result;
  }, {} as SectionDisclosureState);
}

function normalizeDisclosureState(
  value: Partial<Record<ProfileSectionKey, unknown>>,
  fallback: SectionDisclosureState
): SectionDisclosureState {
  return {
    profile: typeof value.profile === "boolean" ? value.profile : fallback.profile,
    css: typeof value.css === "boolean" ? value.css : fallback.css,
    preferences: typeof value.preferences === "boolean" ? value.preferences : fallback.preferences,
    capabilities:
      typeof value.capabilities === "boolean" ? value.capabilities : fallback.capabilities,
    records: typeof value.records === "boolean" ? value.records : fallback.records,
  };
}

function buildProfileSectionSummary(snapshot: AthleteProfileSnapshot): SectionSummaryCopy {
  if (!snapshot.profileSchemaReady) {
    return {
      summary: "Swimmer profile is still syncing.",
      detail: "Open this section later to save swimmer details.",
      hasData: false,
    };
  }

  if (snapshot.loadError) {
    return {
      summary: "Could not load swimmer profile.",
      detail: snapshot.loadError,
      hasData: false,
    };
  }

  if (!snapshot.profile) {
    return {
      summary: "No swimmer profile saved yet.",
      detail: "Start with the swimmer name and age band you want this space to use.",
      hasData: false,
    };
  }

  return {
    summary: snapshot.profile.primaryName ?? "Private swimmer",
    detail: [snapshot.profile.ageBandLabel ?? "Age band not set", snapshot.profile.displayName]
      .filter(Boolean)
      .join(" · "),
    hasData: true,
  };
}

function buildCssSectionSummary(snapshot: AthleteProfileSnapshot): SectionSummaryCopy {
  if (!snapshot.metricsSchemaReady) {
    return {
      summary: "CSS is still syncing.",
      detail: "Open this section later to save the current test pace.",
      hasData: false,
    };
  }

  if (snapshot.metricsLoadError) {
    return {
      summary: "Could not load CSS.",
      detail: snapshot.metricsLoadError,
      hasData: false,
    };
  }

  if (!snapshot.cssMetric) {
    return {
      summary: "No CSS saved yet.",
      detail: "Add your current pace per 100m so later generator work has a trusted baseline.",
      hasData: false,
    };
  }

  return {
    summary: `${snapshot.cssMetric.paceLabel}/100m`,
    detail: [
      snapshot.cssMetric.recordedOn ?? "Recorded date not set",
      snapshot.cssMetric.sourceNote,
    ]
      .filter(Boolean)
      .join(" · "),
    hasData: true,
  };
}

function buildPreferencesSectionSummary(snapshot: AthleteProfileSnapshot): SectionSummaryCopy {
  if (!snapshot.preferencesSchemaReady) {
    return {
      summary: "Training preferences are still syncing.",
      detail: "Open this section later to save planning defaults.",
      hasData: false,
    };
  }

  if (snapshot.preferencesLoadError) {
    return {
      summary: "Could not load training preferences.",
      detail: snapshot.preferencesLoadError,
      hasData: false,
    };
  }

  if (!snapshot.preferences) {
    return {
      summary: "No training preferences saved yet.",
      detail: "Add the pool and weekly defaults you want later sessions to respect.",
      hasData: false,
    };
  }

  const summaryParts = [
    snapshot.preferences.poolLengthLabel ?? "Pool not set",
    snapshot.preferences.preferredWeeklySessionCount
      ? `${snapshot.preferences.preferredWeeklySessionCount} sessions/week`
      : "Weekly count not set",
    snapshot.preferences.preferredSessionMinutesLabel ?? "Duration not set",
  ];
  const availableDays =
    snapshot.preferences.availableDayLabels.length > 0
      ? buildAvailableDaysSummary(snapshot.preferences.availableDayLabels)
      : "Available days not set";

  return {
    summary: summaryParts.join(" · "),
    detail: availableDays,
    hasData: true,
  };
}

function buildRecordsSectionSummary(snapshot: AthleteProfileSnapshot): SectionSummaryCopy {
  if (!snapshot.personalRecordsSchemaReady) {
    return {
      summary: "Best times are still syncing.",
      detail: "Open this section later to manage saved best times.",
      hasData: false,
    };
  }

  if (snapshot.personalRecordsLoadError) {
    return {
      summary: "Could not load best times.",
      detail: snapshot.personalRecordsLoadError,
      hasData: false,
    };
  }

  if (snapshot.personalRecords.length === 0) {
    return {
      summary: "No best times saved yet.",
      detail: "Start with the events you use most in training.",
      hasData: false,
    };
  }

  return {
    summary: `${snapshot.personalRecords.length} best time${
      snapshot.personalRecords.length === 1 ? "" : "s"
    } saved.`,
    detail: snapshot.personalRecords
      .slice(0, 2)
      .map((record) => record.eventLabel)
      .join(" · "),
    hasData: true,
  };
}

function buildCapabilitiesSectionSummary(snapshot: AthleteProfileSnapshot): SectionSummaryCopy {
  if (!snapshot.swimCapabilityLimitsSchemaReady) {
    return {
      summary: "Advanced generator limits are still syncing.",
      detail: "Open this section later if generated sessions need stricter stroke or skill caps.",
      hasData: false,
    };
  }

  if (snapshot.swimCapabilityLimitsLoadError) {
    return {
      summary: "Could not load advanced generator limits.",
      detail: snapshot.swimCapabilityLimitsLoadError,
      hasData: false,
    };
  }

  if (snapshot.swimCapabilityLimits.length === 0) {
    return {
      summary: "No advanced generator limits saved yet.",
      detail:
        "Optional caps for strokes, drills, and kick when generated sessions need guardrails.",
      hasData: false,
    };
  }

  return {
    summary: `${snapshot.swimCapabilityLimits.length} generator limit${
      snapshot.swimCapabilityLimits.length === 1 ? "" : "s"
    } saved.`,
    detail: snapshot.swimCapabilityLimits
      .slice(0, 2)
      .map((limit) => formatSwimCapabilityLimitSummary(limit))
      .join(" · "),
    hasData: true,
  };
}

function getNoticeClasses(kind: "error" | "success") {
  return kind === "error"
    ? "rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-900"
    : "rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900";
}

export default function AthleteProfileHub({ initialSnapshot, userId }: Props) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [profileDraft, setProfileDraft] = useState(() =>
    buildProfileDraft(initialSnapshot.profile)
  );
  const [cssDraft, setCssDraft] = useState(() => buildCssMetricDraft(initialSnapshot.cssMetric));
  const [preferencesDraft, setPreferencesDraft] = useState(() =>
    buildPreferencesDraft(initialSnapshot.preferences)
  );
  const [capabilityLimitsDraft, setCapabilityLimitsDraft] = useState(() =>
    buildCapabilityLimitsDraft(initialSnapshot.swimCapabilityLimits)
  );
  const [recordDraft, setRecordDraft] = useState(() => buildPersonalRecordDraft(null));
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [isClientReady, setIsClientReady] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [activeStatusSection, setActiveStatusSection] = useState<ProfileSectionKey | null>(null);
  const [sectionOpenState, setSectionOpenState] = useState<SectionDisclosureState>(() =>
    buildDefaultDisclosureState({
      snapshot: initialSnapshot,
      hasProfileDraft: false,
      hasCssDraft: false,
      hasPreferencesDraft: false,
      hasCapabilitiesDraft: false,
      hasRecordDraft: false,
    })
  );
  const [pendingProfileSave, setPendingProfileSave] = useState(false);
  const [pendingCssSave, setPendingCssSave] = useState(false);
  const [pendingPreferencesSave, setPendingPreferencesSave] = useState(false);
  const [pendingCapabilityLimitsSave, setPendingCapabilityLimitsSave] = useState(false);
  const [pendingRecordSave, setPendingRecordSave] = useState(false);
  const [pendingRecordDeleteId, setPendingRecordDeleteId] = useState<string | null>(null);
  const [profileDraftRecovered, setProfileDraftRecovered] = useState(false);
  const [cssDraftRecovered, setCssDraftRecovered] = useState(false);
  const [preferencesDraftRecovered, setPreferencesDraftRecovered] = useState(false);
  const [capabilityLimitsDraftRecovered, setCapabilityLimitsDraftRecovered] = useState(false);
  const [recordDraftRecovered, setRecordDraftRecovered] = useState(false);

  const profileStorageKey = useMemo(() => getStorageKey(userId, "profile"), [userId]);
  const cssStorageKey = useMemo(() => getStorageKey(userId, "css"), [userId]);
  const preferencesStorageKey = useMemo(() => getStorageKey(userId, "preferences"), [userId]);
  const capabilityLimitsStorageKey = useMemo(() => getStorageKey(userId, "capabilities"), [userId]);
  const recordStorageKey = useMemo(() => getStorageKey(userId, "records"), [userId]);
  const disclosureStorageKey = useMemo(() => getDisclosureStorageKey(userId), [userId]);

  const savedProfileDraft = useMemo(() => buildProfileDraft(snapshot.profile), [snapshot.profile]);
  const savedCssDraft = useMemo(
    () => buildCssMetricDraft(snapshot.cssMetric),
    [snapshot.cssMetric]
  );
  const savedPreferencesDraft = useMemo(
    () => buildPreferencesDraft(snapshot.preferences),
    [snapshot.preferences]
  );
  const savedCapabilityLimitsDraft = useMemo(
    () => buildCapabilityLimitsDraft(snapshot.swimCapabilityLimits),
    [snapshot.swimCapabilityLimits]
  );
  const savedRecordDraft = useMemo(
    () =>
      buildPersonalRecordDraft(
        findRecordById(snapshot.personalRecords, recordDraft.editingRecordId)
      ),
    [recordDraft.editingRecordId, snapshot.personalRecords]
  );

  const hasUnsavedProfileChanges = useMemo(
    () => serializeDraft(profileDraft) !== serializeDraft(savedProfileDraft),
    [profileDraft, savedProfileDraft]
  );
  const hasUnsavedCssChanges = useMemo(
    () => serializeDraft(cssDraft) !== serializeDraft(savedCssDraft),
    [cssDraft, savedCssDraft]
  );
  const hasUnsavedPreferencesChanges = useMemo(
    () => serializeDraft(preferencesDraft) !== serializeDraft(savedPreferencesDraft),
    [preferencesDraft, savedPreferencesDraft]
  );
  const hasUnsavedCapabilityLimitsChanges = useMemo(
    () => serializeDraft(capabilityLimitsDraft) !== serializeDraft(savedCapabilityLimitsDraft),
    [capabilityLimitsDraft, savedCapabilityLimitsDraft]
  );
  const hasUnsavedRecordChanges = useMemo(
    () => serializeDraft(recordDraft) !== serializeDraft(savedRecordDraft),
    [recordDraft, savedRecordDraft]
  );

  useEffect(() => {
    setIsOnline(readNavigatorOnlineState());

    const nextProfileFallback = buildProfileDraft(initialSnapshot.profile);
    const nextCssFallback = buildCssMetricDraft(initialSnapshot.cssMetric);
    const nextPreferencesFallback = buildPreferencesDraft(initialSnapshot.preferences);
    const nextCapabilityLimitsFallback = buildCapabilityLimitsDraft(
      initialSnapshot.swimCapabilityLimits
    );
    const nextRecordFallback = buildPersonalRecordDraft(null);

    const storedProfileDraft = getStorageValue(profileStorageKey, nextProfileFallback);
    const storedCssDraft = getStorageValue(cssStorageKey, nextCssFallback);
    const storedPreferencesDraft = getStorageValue(preferencesStorageKey, nextPreferencesFallback);
    const storedCapabilityLimitsDraft = getStorageValue(
      capabilityLimitsStorageKey,
      nextCapabilityLimitsFallback
    );
    const storedRecordDraft = getStorageValue(recordStorageKey, nextRecordFallback);
    const fallbackDisclosureState = buildDefaultDisclosureState({
      snapshot: initialSnapshot,
      hasProfileDraft: serializeDraft(storedProfileDraft) !== serializeDraft(nextProfileFallback),
      hasCssDraft: serializeDraft(storedCssDraft) !== serializeDraft(nextCssFallback),
      hasPreferencesDraft:
        serializeDraft(storedPreferencesDraft) !== serializeDraft(nextPreferencesFallback),
      hasCapabilitiesDraft:
        serializeDraft(storedCapabilityLimitsDraft) !==
        serializeDraft(nextCapabilityLimitsFallback),
      hasRecordDraft: serializeDraft(storedRecordDraft) !== serializeDraft(nextRecordFallback),
    });
    const storedDisclosureState = normalizeDisclosureState(
      getStorageValue(disclosureStorageKey, fallbackDisclosureState),
      fallbackDisclosureState
    );

    setProfileDraft(storedProfileDraft);
    setCssDraft(storedCssDraft);
    setPreferencesDraft(storedPreferencesDraft);
    setCapabilityLimitsDraft(storedCapabilityLimitsDraft);
    setRecordDraft(storedRecordDraft);
    setSectionOpenState(storedDisclosureState);

    setProfileDraftRecovered(
      serializeDraft(storedProfileDraft) !== serializeDraft(nextProfileFallback)
    );
    setCssDraftRecovered(serializeDraft(storedCssDraft) !== serializeDraft(nextCssFallback));
    setPreferencesDraftRecovered(
      serializeDraft(storedPreferencesDraft) !== serializeDraft(nextPreferencesFallback)
    );
    setCapabilityLimitsDraftRecovered(
      serializeDraft(storedCapabilityLimitsDraft) !== serializeDraft(nextCapabilityLimitsFallback)
    );
    setRecordDraftRecovered(
      serializeDraft(storedRecordDraft) !== serializeDraft(nextRecordFallback)
    );
    setActionError("");
    setActionSuccess("");
    setActiveStatusSection(null);
    setIsClientReady(true);

    function onOnline() {
      setIsOnline(true);
    }

    function onOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [
    cssStorageKey,
    capabilityLimitsStorageKey,
    disclosureStorageKey,
    initialSnapshot,
    initialSnapshot.cssMetric,
    initialSnapshot.personalRecords,
    initialSnapshot.preferences,
    initialSnapshot.profile,
    initialSnapshot.swimCapabilityLimits,
    preferencesStorageKey,
    profileStorageKey,
    recordStorageKey,
  ]);

  useEffect(() => {
    if (serializeDraft(profileDraft) === serializeDraft(savedProfileDraft)) {
      clearStorageValue(profileStorageKey);
      return;
    }

    setStorageValue(profileStorageKey, profileDraft);
  }, [profileDraft, profileStorageKey, savedProfileDraft]);

  useEffect(() => {
    if (serializeDraft(cssDraft) === serializeDraft(savedCssDraft)) {
      clearStorageValue(cssStorageKey);
      return;
    }

    setStorageValue(cssStorageKey, cssDraft);
  }, [cssDraft, cssStorageKey, savedCssDraft]);

  useEffect(() => {
    if (serializeDraft(preferencesDraft) === serializeDraft(savedPreferencesDraft)) {
      clearStorageValue(preferencesStorageKey);
      return;
    }

    setStorageValue(preferencesStorageKey, preferencesDraft);
  }, [preferencesDraft, preferencesStorageKey, savedPreferencesDraft]);

  useEffect(() => {
    if (serializeDraft(capabilityLimitsDraft) === serializeDraft(savedCapabilityLimitsDraft)) {
      clearStorageValue(capabilityLimitsStorageKey);
      return;
    }

    setStorageValue(capabilityLimitsStorageKey, capabilityLimitsDraft);
  }, [capabilityLimitsDraft, capabilityLimitsStorageKey, savedCapabilityLimitsDraft]);

  useEffect(() => {
    if (serializeDraft(recordDraft) === serializeDraft(savedRecordDraft)) {
      clearStorageValue(recordStorageKey);
      return;
    }

    setStorageValue(recordStorageKey, recordDraft);
  }, [recordDraft, recordStorageKey, savedRecordDraft]);

  useEffect(() => {
    if (!isClientReady) {
      return;
    }

    setStorageValue(disclosureStorageKey, sectionOpenState);
  }, [disclosureStorageKey, isClientReady, sectionOpenState]);

  async function parseError(response: Response, fallback: string) {
    const payload = (await response.json().catch(() => null)) as ApiError | null;
    return payload?.error || fallback;
  }

  function setSectionStatus(
    section: ProfileSectionKey,
    message: string,
    kind: "error" | "success",
    options?: { collapse?: boolean }
  ) {
    setActiveStatusSection(section);
    setActionError(kind === "error" ? message : "");
    setActionSuccess(kind === "success" ? message : "");

    if (kind === "error") {
      setSectionOpenState((current) => ({ ...current, [section]: true }));
      return;
    }

    if (options?.collapse) {
      setSectionOpenState((current) => ({ ...current, [section]: false }));
    }
  }

  function toggleSection(section: ProfileSectionKey) {
    setSectionOpenState((current) => ({ ...current, [section]: !current[section] }));
  }

  function setSectionOpen(section: ProfileSectionKey, nextOpen: boolean) {
    setSectionOpenState((current) => ({ ...current, [section]: nextOpen }));
  }

  function openSectionFromReadiness(section: ProfileSectionKey) {
    setSectionOpen(section, true);
    window.setTimeout(() => {
      document.querySelector(`[data-profile-section="${section}"]`)?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }, 0);
  }

  function getSectionNotice(section: ProfileSectionKey) {
    if (activeStatusSection !== section) {
      return null;
    }

    if (actionError) {
      return {
        kind: "error" as const,
        message: actionError,
      };
    }

    if (actionSuccess) {
      return {
        kind: "success" as const,
        message: actionSuccess,
      };
    }

    return null;
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();

    if (!snapshot.profileSchemaReady) {
      setSectionStatus("profile", "Swimmer profile is still syncing in this environment.", "error");
      return;
    }

    if (!isOnline) {
      setSectionStatus(
        "profile",
        "You are offline. Reconnect before saving swimmer profile.",
        "error"
      );
      return;
    }

    setPendingProfileSave(true);
    setSectionStatus("profile", "", "success");
    setSectionOpen("profile", true);

    try {
      const response = await fetch("/api/my-library/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileDraft),
      });

      if (!response.ok) {
        setSectionStatus(
          "profile",
          await parseError(response, "Could not save swimmer profile right now."),
          "error"
        );
        return;
      }

      const payload = (await response.json().catch(() => null)) as ApiError | null;
      if (!payload?.ok || !payload.snapshot) {
        setSectionStatus("profile", "Could not save swimmer profile right now.", "error");
        return;
      }

      const nextDraft = buildProfileDraft(payload.snapshot.profile);
      setSnapshot(payload.snapshot);
      setProfileDraft(nextDraft);
      clearStorageValue(profileStorageKey);
      setProfileDraftRecovered(false);
      setSectionStatus("profile", "Swimmer profile saved.", "success", { collapse: true });

      void sendClientAnalyticsEvent("athlete_profile_saved", {
        hasAgeBand: Boolean(payload.snapshot.profile?.ageBand),
        hasDisplayName: Boolean(payload.snapshot.profile?.displayName),
      });
    } catch {
      setSectionStatus("profile", "Could not save swimmer profile right now.", "error");
    } finally {
      setPendingProfileSave(false);
    }
  }

  async function saveCssMetric(event: React.FormEvent) {
    event.preventDefault();

    if (!snapshot.metricsSchemaReady) {
      setSectionStatus("css", "Training metrics are still syncing in this environment.", "error");
      return;
    }

    if (!isOnline) {
      setSectionStatus("css", "You are offline. Reconnect before saving CSS.", "error");
      return;
    }

    setPendingCssSave(true);
    setSectionStatus("css", "", "success");
    setSectionOpen("css", true);

    try {
      const response = await fetch("/api/my-library/profile/metrics", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cssDraft),
      });

      if (!response.ok) {
        setSectionStatus(
          "css",
          await parseError(response, "Could not save CSS right now."),
          "error"
        );
        return;
      }

      const payload = (await response.json().catch(() => null)) as ApiError | null;
      if (!payload?.ok || !payload.snapshot) {
        setSectionStatus("css", "Could not save CSS right now.", "error");
        return;
      }

      const nextDraft = buildCssMetricDraft(payload.snapshot.cssMetric);
      setSnapshot(payload.snapshot);
      setCssDraft(nextDraft);
      clearStorageValue(cssStorageKey);
      setCssDraftRecovered(false);
      setSectionStatus(
        "css",
        payload.snapshot.cssMetric ? "CSS saved." : "CSS cleared.",
        "success",
        { collapse: true }
      );

      void sendClientAnalyticsEvent("training_metric_saved", {
        metricKey: payload.snapshot.cssMetric?.metricKey ?? "css",
        hasCssMetric: Boolean(payload.snapshot.cssMetric),
      });
    } catch {
      setSectionStatus("css", "Could not save CSS right now.", "error");
    } finally {
      setPendingCssSave(false);
    }
  }

  async function savePreferences(event: React.FormEvent) {
    event.preventDefault();

    if (!snapshot.preferencesSchemaReady) {
      setSectionStatus(
        "preferences",
        "Training preferences are still syncing in this environment.",
        "error"
      );
      return;
    }

    if (!isOnline) {
      setSectionStatus(
        "preferences",
        "You are offline. Reconnect before saving training preferences.",
        "error"
      );
      return;
    }

    setPendingPreferencesSave(true);
    setSectionStatus("preferences", "", "success");
    setSectionOpen("preferences", true);

    try {
      const response = await fetch("/api/my-library/profile/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferencesDraft),
      });

      if (!response.ok) {
        setSectionStatus(
          "preferences",
          await parseError(response, "Could not save training preferences right now."),
          "error"
        );
        return;
      }

      const payload = (await response.json().catch(() => null)) as ApiError | null;
      if (!payload?.ok || !payload.snapshot) {
        setSectionStatus("preferences", "Could not save training preferences right now.", "error");
        return;
      }

      const nextDraft = buildPreferencesDraft(payload.snapshot.preferences);
      setSnapshot(payload.snapshot);
      setPreferencesDraft(nextDraft);
      clearStorageValue(preferencesStorageKey);
      setPreferencesDraftRecovered(false);
      setSectionStatus(
        "preferences",
        payload.snapshot.preferences
          ? "Training preferences saved."
          : "Training preferences cleared.",
        "success",
        { collapse: true }
      );

      void sendClientAnalyticsEvent("training_preferences_saved", {
        hasPreferences: Boolean(payload.snapshot.preferences),
        availableDayCount: payload.snapshot.preferences?.availableDays.length ?? 0,
      });
    } catch {
      setSectionStatus("preferences", "Could not save training preferences right now.", "error");
    } finally {
      setPendingPreferencesSave(false);
    }
  }

  async function saveCapabilityLimits(event: React.FormEvent) {
    event.preventDefault();

    if (!snapshot.swimCapabilityLimitsSchemaReady) {
      setSectionStatus(
        "capabilities",
        "Stroke and skill limits are still syncing in this environment.",
        "error"
      );
      return;
    }

    if (!isOnline) {
      setSectionStatus(
        "capabilities",
        "You are offline. Reconnect before saving stroke and skill limits.",
        "error"
      );
      return;
    }

    setPendingCapabilityLimitsSave(true);
    setSectionStatus("capabilities", "", "success");
    setSectionOpen("capabilities", true);

    try {
      const response = await fetch("/api/my-library/profile/capabilities", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          limits: buildCapabilityLimitInputs(capabilityLimitsDraft),
        }),
      });

      if (!response.ok) {
        setSectionStatus(
          "capabilities",
          await parseError(response, "Could not save stroke and skill limits right now."),
          "error"
        );
        return;
      }

      const payload = (await response.json().catch(() => null)) as ApiError | null;
      if (!payload?.ok || !payload.snapshot) {
        setSectionStatus(
          "capabilities",
          "Could not save stroke and skill limits right now.",
          "error"
        );
        return;
      }

      const nextDraft = buildCapabilityLimitsDraft(payload.snapshot.swimCapabilityLimits);
      setSnapshot(payload.snapshot);
      setCapabilityLimitsDraft(nextDraft);
      clearStorageValue(capabilityLimitsStorageKey);
      setCapabilityLimitsDraftRecovered(false);
      setSectionStatus(
        "capabilities",
        payload.snapshot.swimCapabilityLimits.length > 0
          ? "Stroke and skill limits saved."
          : "Stroke and skill limits cleared.",
        "success",
        { collapse: true }
      );

      void sendClientAnalyticsEvent("athlete_profile_saved", {
        section: "stroke_skill_limits",
        limitCount: payload.snapshot.swimCapabilityLimits.length,
      });
    } catch {
      setSectionStatus(
        "capabilities",
        "Could not save stroke and skill limits right now.",
        "error"
      );
    } finally {
      setPendingCapabilityLimitsSave(false);
    }
  }

  async function savePersonalRecord(event: React.FormEvent) {
    event.preventDefault();

    if (!snapshot.personalRecordsSchemaReady) {
      setSectionStatus("records", "Best times are still syncing in this environment.", "error");
      return;
    }

    if (!isOnline) {
      setSectionStatus("records", "You are offline. Reconnect before saving best times.", "error");
      return;
    }

    setPendingRecordSave(true);
    setSectionStatus("records", "", "success");
    setSectionOpen("records", true);

    const isEditing = Boolean(recordDraft.editingRecordId);
    const requestUrl = recordDraft.editingRecordId
      ? `/api/my-library/profile/records/${recordDraft.editingRecordId}`
      : "/api/my-library/profile/records";
    const requestMethod = recordDraft.editingRecordId ? "PUT" : "POST";

    try {
      const response = await fetch(requestUrl, {
        method: requestMethod,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recordDraft),
      });

      if (!response.ok) {
        setSectionStatus(
          "records",
          await parseError(response, "Could not save best time right now."),
          "error"
        );
        return;
      }

      const payload = (await response.json().catch(() => null)) as ApiError | null;
      if (!payload?.ok || !payload.snapshot) {
        setSectionStatus("records", "Could not save best time right now.", "error");
        return;
      }

      const nextDraft = buildPersonalRecordDraft(
        findRecordById(payload.snapshot.personalRecords, payload.recordId ?? null)
      );

      setSnapshot(payload.snapshot);
      setRecordDraft(nextDraft);
      clearStorageValue(recordStorageKey);
      setRecordDraftRecovered(false);
      setSectionStatus(
        "records",
        isEditing ? "Best time updated." : "Best time saved.",
        "success",
        { collapse: true }
      );

      const savedRecord = findRecordById(
        payload.snapshot.personalRecords,
        payload.recordId ?? null
      );
      void sendClientAnalyticsEvent("personal_record_saved", {
        eventLabel: savedRecord?.eventLabel ?? null,
        hasRecordedOn: Boolean(savedRecord?.recordedOn),
      });
    } catch {
      setSectionStatus("records", "Could not save best time right now.", "error");
    } finally {
      setPendingRecordSave(false);
    }
  }

  async function deletePersonalRecord(record: PersonalRecordView) {
    if (!snapshot.personalRecordsSchemaReady) {
      setSectionStatus("records", "Best times are still syncing in this environment.", "error");
      return;
    }

    if (!isOnline) {
      setSectionStatus(
        "records",
        "You are offline. Reconnect before deleting best times.",
        "error"
      );
      return;
    }

    if (!window.confirm(`Delete best time ${record.eventLabel}?`)) {
      return;
    }

    setPendingRecordDeleteId(record.id);
    setSectionStatus("records", "", "success");
    setSectionOpen("records", true);

    try {
      const response = await fetch(`/api/my-library/profile/records/${record.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setSectionStatus(
          "records",
          await parseError(response, "Could not delete best time right now."),
          "error"
        );
        return;
      }

      const payload = (await response.json().catch(() => null)) as ApiError | null;
      if (!payload?.ok || !payload.snapshot) {
        setSectionStatus("records", "Could not delete best time right now.", "error");
        return;
      }

      setSnapshot(payload.snapshot);

      if (recordDraft.editingRecordId === record.id) {
        setRecordDraft(buildPersonalRecordDraft(null));
        clearStorageValue(recordStorageKey);
        setRecordDraftRecovered(false);
      }

      setSectionStatus("records", "Best time deleted.", "success");

      void sendClientAnalyticsEvent("personal_record_deleted", {
        eventLabel: record.eventLabel,
      });
    } catch {
      setSectionStatus("records", "Could not delete best time right now.", "error");
    } finally {
      setPendingRecordDeleteId(null);
    }
  }

  function resetProfileDraftToSaved() {
    setProfileDraft(savedProfileDraft);
    clearStorageValue(profileStorageKey);
    setProfileDraftRecovered(false);
    setSectionStatus("profile", "Draft reset to saved swimmer profile.", "success");
  }

  function resetCssDraftToSaved() {
    setCssDraft(savedCssDraft);
    clearStorageValue(cssStorageKey);
    setCssDraftRecovered(false);
    setSectionStatus("css", "Draft reset to saved CSS.", "success");
  }

  function resetPreferencesDraftToSaved() {
    setPreferencesDraft(savedPreferencesDraft);
    clearStorageValue(preferencesStorageKey);
    setPreferencesDraftRecovered(false);
    setSectionStatus("preferences", "Draft reset to saved training preferences.", "success");
  }

  function resetCapabilityLimitsDraftToSaved() {
    setCapabilityLimitsDraft(savedCapabilityLimitsDraft);
    clearStorageValue(capabilityLimitsStorageKey);
    setCapabilityLimitsDraftRecovered(false);
    setSectionStatus("capabilities", "Draft reset to saved stroke and skill limits.", "success");
  }

  function updateCapabilityLimitDraft(key: TopLevelCapabilityLimitKey, value: string) {
    setCapabilityLimitsDraft((current) => ({ ...current, [key]: value }));
  }

  function updateStrokeCapabilityLimitDraft(
    stroke: SwimCapabilityStroke,
    key: keyof CapabilityLimitsDraft["strokeLimits"][SwimCapabilityStroke],
    value: string
  ) {
    setCapabilityLimitsDraft((current) => ({
      ...current,
      strokeLimits: {
        ...current.strokeLimits,
        [stroke]: {
          ...current.strokeLimits[stroke],
          [key]: value,
        },
      },
    }));
  }

  function resetRecordDraftToSaved() {
    setRecordDraft(savedRecordDraft);
    clearStorageValue(recordStorageKey);
    setRecordDraftRecovered(false);
    setSectionStatus(
      "records",
      recordDraft.editingRecordId
        ? "Draft reset to saved best time."
        : "Draft reset to a new best time.",
      "success"
    );
  }

  function startEditingRecord(record: PersonalRecordView) {
    setRecordDraft(buildPersonalRecordDraft(record));
    setRecordDraftRecovered(false);
    setSectionOpen("records", true);
    setActiveStatusSection(null);
    setActionError("");
    setActionSuccess("");
    window.setTimeout(() => {
      document.getElementById("athlete-record-form")?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }, 0);
  }

  function startNewRecord() {
    setRecordDraft(buildPersonalRecordDraft(null));
    clearStorageValue(recordStorageKey);
    setRecordDraftRecovered(false);
    setSectionOpen("records", true);
    setActiveStatusSection(null);
    setActionError("");
    setActionSuccess("");
    window.setTimeout(() => {
      document.getElementById("athlete-record-form")?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }, 0);
  }

  function toggleAvailableDay(day: TrainingWeekday) {
    setPreferencesDraft((current) => {
      const hasDay = current.availableDays.includes(day);
      const nextSet = hasDay
        ? current.availableDays.filter((value) => value !== day)
        : [...current.availableDays, day];

      return {
        ...current,
        availableDays: TRAINING_WEEKDAY_VALUES.filter((value) => nextSet.includes(value)),
      };
    });
  }

  const primaryName = buildAthleteProfilePrimaryName({
    displayName: profileDraft.displayName.trim() || null,
    firstName: profileDraft.firstName.trim() || null,
    lastName: profileDraft.lastName.trim() || null,
  });
  const currentEditedRecord = findRecordById(snapshot.personalRecords, recordDraft.editingRecordId);
  const profileSummary = buildProfileSectionSummary(snapshot);
  const cssSummary = buildCssSectionSummary(snapshot);
  const preferencesSummary = buildPreferencesSectionSummary(snapshot);
  const capabilitiesSummary = buildCapabilitiesSectionSummary(snapshot);
  const recordsSummary = buildRecordsSectionSummary(snapshot);
  const readinessCards: ReadinessCard[] = [
    {
      key: "profile",
      label: "Identity",
      scope: "Core",
      summary: profileSummary.summary,
      detail: profileSummary.detail,
      hasData: profileSummary.hasData,
      hasUnsavedChanges: hasUnsavedProfileChanges,
    },
    {
      key: "css",
      label: "CSS",
      scope: "Core",
      summary: cssSummary.summary,
      detail: cssSummary.detail,
      hasData: cssSummary.hasData,
      hasUnsavedChanges: hasUnsavedCssChanges,
    },
    {
      key: "preferences",
      label: "Defaults",
      scope: "Core",
      summary: preferencesSummary.summary,
      detail: preferencesSummary.detail,
      hasData: preferencesSummary.hasData,
      hasUnsavedChanges: hasUnsavedPreferencesChanges,
    },
    {
      key: "records",
      label: "Best times",
      scope: "Core",
      summary: recordsSummary.summary,
      detail: recordsSummary.detail,
      hasData: recordsSummary.hasData,
      hasUnsavedChanges: hasUnsavedRecordChanges,
    },
    {
      key: "capabilities",
      label: "Generator limits",
      scope: "Advanced",
      summary: capabilitiesSummary.summary,
      detail: capabilitiesSummary.detail,
      hasData: capabilitiesSummary.hasData,
      hasUnsavedChanges: hasUnsavedCapabilityLimitsChanges,
      isAdvanced: true,
    },
  ];
  const recommendedSection =
    readinessCards.find((card) => card.hasUnsavedChanges)?.key ??
    getRecommendedSetupSection(snapshot);
  const recommendedCard = readinessCards.find((card) => card.key === recommendedSection) ?? null;
  const readyCoreCount = readinessCards.filter((card) => !card.isAdvanced && card.hasData).length;
  const savedSetupCount = readinessCards.filter((card) => card.hasData).length;
  const profileNotice = getSectionNotice("profile");
  const cssNotice = getSectionNotice("css");
  const preferencesNotice = getSectionNotice("preferences");
  const capabilitiesNotice = getSectionNotice("capabilities");
  const recordsNotice = getSectionNotice("records");
  const globalActionError = activeStatusSection === null ? actionError : "";
  const globalActionSuccess = activeStatusSection === null ? actionSuccess : "";

  return (
    <div
      data-testid="athlete-profile-hub"
      data-client-ready={isClientReady ? "true" : "false"}
      className="space-y-6"
    >
      {!isOnline ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
          You are offline. Unsaved profile, CSS, preferences, and best-time changes stay on this
          device until you reconnect and save.
        </div>
      ) : null}

      {profileDraftRecovered ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/80 px-4 py-3 text-sm text-blue-900">
          Unsaved swimmer-profile edits were restored on this device.
        </div>
      ) : null}

      {cssDraftRecovered ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/80 px-4 py-3 text-sm text-blue-900">
          Unsaved CSS edits were restored on this device.
        </div>
      ) : null}

      {preferencesDraftRecovered ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/80 px-4 py-3 text-sm text-blue-900">
          Unsaved training preferences edits were restored on this device.
        </div>
      ) : null}

      {capabilityLimitsDraftRecovered ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/80 px-4 py-3 text-sm text-blue-900">
          Unsaved stroke and skill limit edits were restored on this device.
        </div>
      ) : null}

      {recordDraftRecovered ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/80 px-4 py-3 text-sm text-blue-900">
          Unsaved best-time edits were restored on this device.
        </div>
      ) : null}

      {globalActionError ? (
        <div
          className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-900"
          role="alert"
        >
          {globalActionError}
        </div>
      ) : null}

      {globalActionSuccess ? (
        <div
          className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900"
          aria-live="polite"
        >
          {globalActionSuccess}
        </div>
      ) : null}

      <section
        data-testid="athlete-profile-readiness"
        className="rounded-2xl border border-blue-100 bg-blue-50/80 p-4 sm:p-5"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-semibold tracking-[0.18em] text-blue-700 uppercase">
              Profile readiness
            </p>
            <h2 className="text-lg font-semibold text-slate-950">
              {recommendedCard ? "Next setup action" : "Profile setup is ready"}
            </h2>
            <p className="text-sm text-slate-700">
              {recommendedCard
                ? `${recommendedCard.label}: ${recommendedCard.summary}`
                : "Core profile setup is complete. Advanced generator limits stay available when you need tighter session guardrails."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-semibold text-blue-800">
              {readyCoreCount}/4 core ready
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              {savedSetupCount}/5 saved
            </span>
            {recommendedCard ? (
              <button
                type="button"
                data-testid="athlete-profile-next-action"
                onClick={() => openSectionFromReadiness(recommendedCard.key)}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                {recommendedCard.hasUnsavedChanges
                  ? `Resume ${SECTION_LABELS[recommendedCard.key]}`
                  : `Set up ${SECTION_LABELS[recommendedCard.key]}`}
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 xl:grid xl:grid-cols-5 xl:overflow-visible xl:pb-0">
          {readinessCards.map((card) => {
            const isRecommended = card.key === recommendedSection;
            const statusLabel = card.hasUnsavedChanges
              ? "Unsaved"
              : card.hasData
                ? "Ready"
                : card.isAdvanced
                  ? "Optional"
                  : "Needs setup";

            return (
              <button
                key={card.key}
                type="button"
                data-testid={`athlete-profile-readiness-${card.key}`}
                onClick={() => openSectionFromReadiness(card.key)}
                className={`min-w-40 flex-1 rounded-2xl border bg-white p-3 text-left transition hover:border-blue-200 hover:bg-white xl:min-w-0 ${
                  isRecommended ? "border-blue-300 shadow-sm" : "border-slate-200"
                }`}
              >
                <span className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase">
                    {card.scope}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      card.hasUnsavedChanges
                        ? "bg-amber-50 text-amber-800"
                        : card.hasData
                          ? "bg-emerald-50 text-emerald-800"
                          : card.isAdvanced
                            ? "bg-slate-100 text-slate-600"
                            : "bg-blue-50 text-blue-800"
                    }`}
                  >
                    {card.hasData ? (
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : null}
                    {statusLabel}
                  </span>
                </span>
                <span className="mt-2 block text-sm font-semibold text-slate-950">
                  {card.label}
                </span>
                <span className="mt-1 line-clamp-2 block text-xs leading-5 text-slate-600">
                  {card.summary}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section
        data-testid="athlete-profile-section-profile"
        data-profile-section="profile"
        data-section-open={sectionOpenState.profile ? "true" : "false"}
        className={PROFILE_SECTION_CLASS}
      >
        <div className={PROFILE_SECTION_HEADER_CLASS}>
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
              Swimmer profile
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Swimmer identity</h2>
              {hasUnsavedProfileChanges ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                  Unsaved edits
                </span>
              ) : null}
            </div>
            <p className="text-sm font-medium text-slate-900">{profileSummary.summary}</p>
            <p className="text-sm text-slate-600">{profileSummary.detail}</p>
          </div>
          <SectionToggleButton
            isOpen={sectionOpenState.profile}
            label="swimmer identity"
            testId="athlete-profile-section-toggle-profile"
            controls="athlete-profile-section-body-profile"
            onClick={() => toggleSection("profile")}
          />
        </div>

        {profileNotice && !sectionOpenState.profile ? (
          <div
            className={`mt-4 ${getNoticeClasses(profileNotice.kind)}`}
            role={profileNotice.kind === "error" ? "alert" : undefined}
            aria-live={profileNotice.kind === "success" ? "polite" : undefined}
          >
            {profileNotice.message}
          </div>
        ) : null}

        {sectionOpenState.profile ? (
          <form
            id="athlete-profile-section-body-profile"
            onSubmit={saveProfile}
            className="mt-5 border-t border-slate-200 pt-5"
          >
            {profileNotice ? (
              <div
                className={`${getNoticeClasses(profileNotice.kind)} mb-4`}
                role={profileNotice.kind === "error" ? "alert" : undefined}
                aria-live={profileNotice.kind === "success" ? "polite" : undefined}
              >
                {profileNotice.message}
              </div>
            ) : null}

            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="max-w-2xl text-sm text-slate-600">
                Save enough private swimmer context to make this feel like your own training space.
              </p>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                {primaryName ?? "Private swimmer"}
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Display name</span>
                <input
                  data-testid="athlete-profile-display-name"
                  type="text"
                  value={profileDraft.displayName}
                  onChange={(event) =>
                    setProfileDraft((current) => ({ ...current, displayName: event.target.value }))
                  }
                  placeholder="How you want your swimmer profile to read"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Age band</span>
                <select
                  data-testid="athlete-profile-age-band"
                  value={profileDraft.ageBand}
                  onChange={(event) =>
                    setProfileDraft((current) => ({
                      ...current,
                      ageBand: event.target.value as AthleteAgeBand | "",
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Not set</option>
                  {ATHLETE_AGE_BAND_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>First name</span>
                <input
                  data-testid="athlete-profile-first-name"
                  type="text"
                  value={profileDraft.firstName}
                  onChange={(event) =>
                    setProfileDraft((current) => ({ ...current, firstName: event.target.value }))
                  }
                  placeholder="Optional"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Last name</span>
                <input
                  data-testid="athlete-profile-last-name"
                  type="text"
                  value={profileDraft.lastName}
                  onChange={(event) =>
                    setProfileDraft((current) => ({ ...current, lastName: event.target.value }))
                  }
                  placeholder="Optional"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                data-testid="athlete-profile-save"
                type="submit"
                disabled={pendingProfileSave || !isOnline}
                className={PROFILE_PRIMARY_BUTTON_CLASS}
              >
                {pendingProfileSave ? "Saving..." : "Save swimmer profile"}
              </button>
              <button
                type="button"
                onClick={resetProfileDraftToSaved}
                disabled={!hasUnsavedProfileChanges}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                Reset draft
              </button>
            </div>
          </form>
        ) : null}
      </section>

      <section
        data-testid="athlete-profile-section-css"
        data-profile-section="css"
        data-section-open={sectionOpenState.css ? "true" : "false"}
        className={PROFILE_SECTION_CLASS}
      >
        <div className={PROFILE_SECTION_HEADER_CLASS}>
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">CSS</p>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Current CSS pace</h2>
              {hasUnsavedCssChanges ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                  Unsaved edits
                </span>
              ) : null}
            </div>
            <p className="text-sm font-medium text-slate-900">{cssSummary.summary}</p>
            <p className="text-sm text-slate-600">{cssSummary.detail}</p>
          </div>
          <SectionToggleButton
            isOpen={sectionOpenState.css}
            label="CSS"
            testId="athlete-profile-section-toggle-css"
            controls="athlete-profile-section-body-css"
            onClick={() => toggleSection("css")}
          />
        </div>

        {cssNotice && !sectionOpenState.css ? (
          <div
            className={`mt-4 ${getNoticeClasses(cssNotice.kind)}`}
            role={cssNotice.kind === "error" ? "alert" : undefined}
            aria-live={cssNotice.kind === "success" ? "polite" : undefined}
          >
            {cssNotice.message}
          </div>
        ) : null}

        {sectionOpenState.css ? (
          <form
            id="athlete-profile-section-body-css"
            onSubmit={saveCssMetric}
            className="mt-5 border-t border-slate-200 pt-5"
          >
            {cssNotice ? (
              <div
                className={`${getNoticeClasses(cssNotice.kind)} mb-4`}
                role={cssNotice.kind === "error" ? "alert" : undefined}
                aria-live={cssNotice.kind === "success" ? "polite" : undefined}
              >
                {cssNotice.message}
              </div>
            ) : null}

            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="max-w-2xl text-sm text-slate-600">
                Save your current critical swim speed as pace per 100m so later generator work can
                trust one canonical value.
              </p>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                Stored canonically as seconds per 100m
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>CSS pace (m:ss)</span>
                <input
                  data-testid="athlete-profile-css-pace"
                  type="text"
                  inputMode="numeric"
                  value={cssDraft.pace}
                  onChange={(event) =>
                    setCssDraft((current) => ({ ...current, pace: event.target.value }))
                  }
                  placeholder="1:58"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Recorded on</span>
                <input
                  data-testid="athlete-profile-css-recorded-on"
                  type="date"
                  value={cssDraft.recordedOn}
                  onChange={(event) =>
                    setCssDraft((current) => ({ ...current, recordedOn: event.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-3">
                <span>Source note</span>
                <textarea
                  data-testid="athlete-profile-css-source-note"
                  value={cssDraft.sourceNote}
                  onChange={(event) =>
                    setCssDraft((current) => ({ ...current, sourceNote: event.target.value }))
                  }
                  placeholder="Optional note about the test set or source"
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                data-testid="athlete-profile-css-save"
                type="submit"
                disabled={pendingCssSave || !isOnline}
                className={PROFILE_PRIMARY_BUTTON_CLASS}
              >
                {pendingCssSave ? "Saving..." : "Save CSS"}
              </button>
              <button
                data-testid="athlete-profile-css-reset"
                type="button"
                onClick={resetCssDraftToSaved}
                disabled={!hasUnsavedCssChanges}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                Reset draft
              </button>
            </div>
          </form>
        ) : null}
      </section>

      <section
        data-testid="athlete-profile-section-preferences"
        data-profile-section="preferences"
        data-section-open={sectionOpenState.preferences ? "true" : "false"}
        className={PROFILE_SECTION_CLASS}
      >
        <div className={PROFILE_SECTION_HEADER_CLASS}>
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
              Preferences
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Training defaults</h2>
              {hasUnsavedPreferencesChanges ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                  Unsaved edits
                </span>
              ) : null}
            </div>
            <p className="text-sm font-medium text-slate-900">{preferencesSummary.summary}</p>
            <p className="text-sm text-slate-600">{preferencesSummary.detail}</p>
          </div>
          <SectionToggleButton
            isOpen={sectionOpenState.preferences}
            label="training defaults"
            testId="athlete-profile-section-toggle-preferences"
            controls="athlete-profile-section-body-preferences"
            onClick={() => toggleSection("preferences")}
          />
        </div>

        {preferencesNotice && !sectionOpenState.preferences ? (
          <div
            className={`mt-4 ${getNoticeClasses(preferencesNotice.kind)}`}
            role={preferencesNotice.kind === "error" ? "alert" : undefined}
            aria-live={preferencesNotice.kind === "success" ? "polite" : undefined}
          >
            {preferencesNotice.message}
          </div>
        ) : null}

        {sectionOpenState.preferences ? (
          <form
            id="athlete-profile-section-body-preferences"
            onSubmit={savePreferences}
            className="mt-5 border-t border-slate-200 pt-5"
          >
            {preferencesNotice ? (
              <div
                className={`${getNoticeClasses(preferencesNotice.kind)} mb-4`}
                role={preferencesNotice.kind === "error" ? "alert" : undefined}
                aria-live={preferencesNotice.kind === "success" ? "polite" : undefined}
              >
                {preferencesNotice.message}
              </div>
            ) : null}

            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="max-w-2xl text-sm text-slate-600">
                Save the pool and planning defaults you want later session generation to respect.
              </p>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                Private to your account
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Default pool length</span>
                <select
                  data-testid="athlete-preferences-pool-length"
                  value={preferencesDraft.poolLengthM}
                  onChange={(event) =>
                    setPreferencesDraft((current) => ({
                      ...current,
                      poolLengthM: event.target.value as TrainingPreferencesDraft["poolLengthM"],
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Not set</option>
                  {TRAINING_POOL_LENGTH_OPTIONS.map((option) => (
                    <option key={option.value} value={String(option.value)}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Preferred weekly session count</span>
                <input
                  data-testid="athlete-preferences-weekly-session-count"
                  type="number"
                  min={1}
                  max={14}
                  value={preferencesDraft.preferredWeeklySessionCount}
                  onChange={(event) =>
                    setPreferencesDraft((current) => ({
                      ...current,
                      preferredWeeklySessionCount: event.target.value,
                    }))
                  }
                  placeholder="5"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
                <span>Preferred session duration</span>
                <select
                  data-testid="athlete-preferences-session-minutes"
                  value={preferencesDraft.preferredSessionMinutes}
                  onChange={(event) =>
                    setPreferencesDraft((current) => ({
                      ...current,
                      preferredSessionMinutes: event.target
                        .value as TrainingPreferencesDraft["preferredSessionMinutes"],
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Not set</option>
                  {TRAINING_SESSION_DURATION_OPTIONS.map((option) => (
                    <option key={option.value} value={String(option.value)}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <fieldset className="space-y-3 md:col-span-2">
                <legend className="text-sm font-medium text-slate-700">
                  Available training days
                </legend>
                <div className="grid gap-2 sm:grid-cols-4">
                  {TRAINING_WEEKDAY_OPTIONS.map((option) => {
                    const checked = preferencesDraft.availableDays.includes(option.value);

                    return (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                      >
                        <input
                          data-testid={`athlete-preferences-day-${option.value}`}
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAvailableDay(option.value)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-200"
                        />
                        <span>{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                data-testid="athlete-preferences-save"
                type="submit"
                disabled={pendingPreferencesSave || !isOnline}
                className={PROFILE_PRIMARY_BUTTON_CLASS}
              >
                {pendingPreferencesSave ? "Saving..." : "Save preferences"}
              </button>
              <button
                data-testid="athlete-preferences-reset"
                type="button"
                onClick={resetPreferencesDraftToSaved}
                disabled={!hasUnsavedPreferencesChanges}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                Reset draft
              </button>
            </div>
          </form>
        ) : null}
      </section>

      <section
        data-testid="athlete-profile-section-capabilities"
        data-profile-section="capabilities"
        data-section-open={sectionOpenState.capabilities ? "true" : "false"}
        className={PROFILE_SECTION_CLASS}
      >
        <div className={PROFILE_SECTION_HEADER_CLASS}>
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
              Advanced generator limits
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Stroke and skill limits</h2>
              {hasUnsavedCapabilityLimitsChanges ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                  Unsaved edits
                </span>
              ) : null}
            </div>
            <p className="text-sm font-medium text-slate-900">{capabilitiesSummary.summary}</p>
            <p className="text-sm text-slate-600">{capabilitiesSummary.detail}</p>
          </div>
          <SectionToggleButton
            isOpen={sectionOpenState.capabilities}
            label="advanced generator limits"
            testId="athlete-profile-section-toggle-capabilities"
            controls="athlete-profile-section-body-capabilities"
            onClick={() => toggleSection("capabilities")}
          />
        </div>

        {capabilitiesNotice && !sectionOpenState.capabilities ? (
          <div
            className={`mt-4 ${getNoticeClasses(capabilitiesNotice.kind)}`}
            role={capabilitiesNotice.kind === "error" ? "alert" : undefined}
            aria-live={capabilitiesNotice.kind === "success" ? "polite" : undefined}
          >
            {capabilitiesNotice.message}
          </div>
        ) : null}

        {sectionOpenState.capabilities ? (
          <form
            id="athlete-profile-section-body-capabilities"
            onSubmit={saveCapabilityLimits}
            className="mt-5 border-t border-slate-200 pt-5"
          >
            {capabilitiesNotice ? (
              <div
                className={`${getNoticeClasses(capabilitiesNotice.kind)} mb-4`}
                role={capabilitiesNotice.kind === "error" ? "alert" : undefined}
                aria-live={capabilitiesNotice.kind === "success" ? "polite" : undefined}
              >
                {capabilitiesNotice.message}
              </div>
            ) : null}

            {!snapshot.swimCapabilityLimitsSchemaReady ? (
              <p className="text-sm text-amber-800">
                Stroke and skill limits are still syncing in this environment.
              </p>
            ) : snapshot.swimCapabilityLimitsLoadError ? (
              <p className="text-sm text-rose-700">{snapshot.swimCapabilityLimitsLoadError}</p>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <legend className="px-1 text-sm font-semibold text-slate-900">Drills</legend>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <CapabilityInputField
                        label="Max length"
                        testId="athlete-capability-drill-max-repeat"
                        value={capabilityLimitsDraft.drillMaxRepeatDistanceM}
                        placeholder="25"
                        onChange={(value) =>
                          updateCapabilityLimitDraft("drillMaxRepeatDistanceM", value)
                        }
                      />
                      <CapabilityInputField
                        label="Approx per session"
                        testId="athlete-capability-drill-target-total"
                        value={capabilityLimitsDraft.drillTargetTotalDistanceM}
                        placeholder="200"
                        inputMode="numeric"
                        onChange={(value) =>
                          updateCapabilityLimitDraft("drillTargetTotalDistanceM", value)
                        }
                      />
                    </div>
                  </fieldset>

                  <fieldset className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                    <legend className="px-1 text-sm font-semibold text-slate-900">Kick</legend>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <CapabilityInputField
                        label="Max length"
                        testId="athlete-capability-kick-max-repeat"
                        value={capabilityLimitsDraft.kickMaxRepeatDistanceM}
                        placeholder="25"
                        onChange={(value) =>
                          updateCapabilityLimitDraft("kickMaxRepeatDistanceM", value)
                        }
                      />
                      <CapabilityInputField
                        label="Approx per session"
                        testId="athlete-capability-kick-target-total"
                        value={capabilityLimitsDraft.kickTargetTotalDistanceM}
                        placeholder="200"
                        inputMode="numeric"
                        onChange={(value) =>
                          updateCapabilityLimitDraft("kickTargetTotalDistanceM", value)
                        }
                      />
                    </div>
                  </fieldset>
                </div>

                <fieldset className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <legend className="px-1 text-sm font-semibold text-slate-900">
                    Stroke limits
                  </legend>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {SWIM_CAPABILITY_STROKES.map((stroke) => {
                      const strokeDraft = capabilityLimitsDraft.strokeLimits[stroke];

                      return (
                        <div
                          key={stroke}
                          className="rounded-xl border border-slate-200 bg-white p-3"
                        >
                          <p className="text-sm font-semibold text-slate-900">
                            {getSwimCapabilityStrokeLabel(stroke)}
                          </p>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <CapabilityInputField
                              label="Max length"
                              testId={`athlete-capability-stroke-${stroke}-max-repeat`}
                              value={strokeDraft.maxRepeatDistanceM}
                              onChange={(value) =>
                                updateStrokeCapabilityLimitDraft(
                                  stroke,
                                  "maxRepeatDistanceM",
                                  value
                                )
                              }
                            />
                            <CapabilityInputField
                              label="Max per session"
                              testId={`athlete-capability-stroke-${stroke}-max-total`}
                              value={strokeDraft.maxTotalDistanceM}
                              inputMode="numeric"
                              onChange={(value) =>
                                updateStrokeCapabilityLimitDraft(stroke, "maxTotalDistanceM", value)
                              }
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <button
                    data-testid="athlete-capabilities-save"
                    type="submit"
                    disabled={pendingCapabilityLimitsSave || !isOnline}
                    className={PROFILE_PRIMARY_BUTTON_CLASS}
                  >
                    {pendingCapabilityLimitsSave ? "Saving..." : "Save limits"}
                  </button>
                  <button
                    data-testid="athlete-capabilities-reset"
                    type="button"
                    onClick={resetCapabilityLimitsDraftToSaved}
                    disabled={!hasUnsavedCapabilityLimitsChanges}
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    Reset draft
                  </button>
                </div>
              </>
            )}
          </form>
        ) : null}
      </section>

      <section
        data-testid="athlete-profile-section-records"
        data-profile-section="records"
        data-section-open={sectionOpenState.records ? "true" : "false"}
        className={PROFILE_SECTION_CLASS}
      >
        <div className={PROFILE_SECTION_HEADER_CLASS}>
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
              Best times
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Best times</h2>
              {hasUnsavedRecordChanges ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                  Unsaved edits
                </span>
              ) : null}
            </div>
            <p className="text-sm font-medium text-slate-900">{recordsSummary.summary}</p>
            <p className="text-sm text-slate-600">{recordsSummary.detail}</p>
          </div>
          <SectionToggleButton
            isOpen={sectionOpenState.records}
            label="best times"
            testId="athlete-profile-section-toggle-records"
            controls="athlete-profile-section-body-records"
            onClick={() => toggleSection("records")}
          />
        </div>

        {recordsNotice && !sectionOpenState.records ? (
          <div
            className={`mt-4 ${getNoticeClasses(recordsNotice.kind)}`}
            role={recordsNotice.kind === "error" ? "alert" : undefined}
            aria-live={recordsNotice.kind === "success" ? "polite" : undefined}
          >
            {recordsNotice.message}
          </div>
        ) : null}

        {sectionOpenState.records ? (
          <div
            id="athlete-profile-section-body-records"
            className="mt-5 border-t border-slate-200 pt-5"
          >
            {recordsNotice ? (
              <div
                className={`${getNoticeClasses(recordsNotice.kind)} mb-4`}
                role={recordsNotice.kind === "error" ? "alert" : undefined}
                aria-live={recordsNotice.kind === "success" ? "polite" : undefined}
              >
                {recordsNotice.message}
              </div>
            ) : null}

            {!snapshot.personalRecordsSchemaReady ? (
              <p className="text-sm text-amber-800">
                Best times are still syncing in this environment.
              </p>
            ) : snapshot.personalRecordsLoadError ? (
              <p className="text-sm text-rose-700">{snapshot.personalRecordsLoadError}</p>
            ) : (
              <div className="space-y-4">
                {snapshot.personalRecords.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-4 text-sm text-slate-600">
                    No best times saved yet. Start with the events you use most in training.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {snapshot.personalRecords.map((record) => (
                      <article
                        key={record.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                              <h3 className="text-base font-semibold text-slate-900">
                                {record.eventLabel}
                              </h3>
                              <p className="text-sm text-slate-600">
                                {record.timeLabel}
                                {record.recordedOn ? ` · ${record.recordedOn}` : ""}
                              </p>
                            </div>
                            {record.sourceNote ? (
                              <p className="mt-2 text-sm text-slate-600">{record.sourceNote}</p>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap gap-2 self-end sm:self-auto">
                            <button
                              type="button"
                              data-testid={`athlete-record-edit-${record.id}`}
                              onClick={() => startEditingRecord(record)}
                              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              data-testid={`athlete-record-delete-${record.id}`}
                              onClick={() => void deletePersonalRecord(record)}
                              disabled={pendingRecordDeleteId === record.id}
                              className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-white px-4 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-rose-300"
                            >
                              {pendingRecordDeleteId === record.id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                <form
                  id="athlete-record-form"
                  onSubmit={savePersonalRecord}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {currentEditedRecord ? "Edit best time" : "Add best time"}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">
                        Enter time as 59.87, 1:02.34, or 1:01:02.34.
                      </p>
                    </div>
                    {currentEditedRecord ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={startNewRecord}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Add new
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <label className="space-y-2 text-sm font-medium text-slate-700">
                      <span>Distance (m)</span>
                      <input
                        data-testid="athlete-record-distance-m"
                        type="number"
                        min={25}
                        max={100000}
                        value={recordDraft.distanceM}
                        onChange={(event) =>
                          setRecordDraft((current) => ({
                            ...current,
                            distanceM: event.target.value,
                          }))
                        }
                        placeholder="100"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>

                    <label className="space-y-2 text-sm font-medium text-slate-700">
                      <span>Stroke</span>
                      <select
                        data-testid="athlete-record-stroke"
                        value={recordDraft.stroke}
                        onChange={(event) =>
                          setRecordDraft((current) => ({
                            ...current,
                            stroke: event.target.value as PersonalRecordStroke | "",
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">Choose stroke</option>
                        {PERSONAL_RECORD_STROKE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2 text-sm font-medium text-slate-700">
                      <span>Course</span>
                      <select
                        data-testid="athlete-record-course"
                        value={recordDraft.course}
                        onChange={(event) =>
                          setRecordDraft((current) => ({
                            ...current,
                            course: event.target.value as PersonalRecordCourse | "",
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">Choose course</option>
                        {PERSONAL_RECORD_COURSE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2 text-sm font-medium text-slate-700">
                      <span>Time</span>
                      <input
                        data-testid="athlete-record-time"
                        type="text"
                        inputMode="decimal"
                        value={recordDraft.time}
                        onChange={(event) =>
                          setRecordDraft((current) => ({ ...current, time: event.target.value }))
                        }
                        placeholder="1:02.34"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>

                    <label className="space-y-2 text-sm font-medium text-slate-700">
                      <span>Recorded on</span>
                      <input
                        data-testid="athlete-record-recorded-on"
                        type="date"
                        value={recordDraft.recordedOn}
                        onChange={(event) =>
                          setRecordDraft((current) => ({
                            ...current,
                            recordedOn: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>

                    <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2 xl:col-span-3">
                      <span>Source note</span>
                      <textarea
                        data-testid="athlete-record-source-note"
                        value={recordDraft.sourceNote}
                        onChange={(event) =>
                          setRecordDraft((current) => ({
                            ...current,
                            sourceNote: event.target.value,
                          }))
                        }
                        placeholder="Optional note about meet, set, or source"
                        rows={3}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 transition outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <button
                      data-testid="athlete-record-save"
                      type="submit"
                      disabled={pendingRecordSave || !isOnline}
                      className={PROFILE_PRIMARY_BUTTON_CLASS}
                    >
                      {pendingRecordSave
                        ? "Saving..."
                        : currentEditedRecord
                          ? "Update best time"
                          : "Save best time"}
                    </button>
                    <button
                      data-testid="athlete-record-reset"
                      type="button"
                      onClick={resetRecordDraftToSaved}
                      disabled={!hasUnsavedRecordChanges}
                      className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
                    >
                      Reset draft
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}
