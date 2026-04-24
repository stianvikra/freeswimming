"use client";

import { useEffect, useMemo, useState } from "react";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";
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

type ProfileSectionKey = "profile" | "css" | "preferences" | "records";

type SectionDisclosureState = Record<ProfileSectionKey, boolean>;

type SectionSummaryCopy = {
  summary: string;
  detail: string;
  hasData: boolean;
};

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

function getStorageKey(userId: string, scope: "profile" | "css" | "preferences" | "records") {
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

function buildDefaultDisclosureState({
  snapshot,
  hasProfileDraft,
  hasCssDraft,
  hasPreferencesDraft,
  hasRecordDraft,
}: {
  snapshot: AthleteProfileSnapshot;
  hasProfileDraft: boolean;
  hasCssDraft: boolean;
  hasPreferencesDraft: boolean;
  hasRecordDraft: boolean;
}): SectionDisclosureState {
  return {
    profile:
      hasProfileDraft ||
      !snapshot.profileSchemaReady ||
      Boolean(snapshot.loadError) ||
      !snapshot.profile,
    css:
      hasCssDraft ||
      !snapshot.metricsSchemaReady ||
      Boolean(snapshot.metricsLoadError) ||
      !snapshot.cssMetric,
    preferences:
      hasPreferencesDraft ||
      !snapshot.preferencesSchemaReady ||
      Boolean(snapshot.preferencesLoadError) ||
      !snapshot.preferences,
    records:
      hasRecordDraft ||
      !snapshot.personalRecordsSchemaReady ||
      Boolean(snapshot.personalRecordsLoadError) ||
      snapshot.personalRecords.length === 0,
  };
}

function normalizeDisclosureState(
  value: Partial<Record<ProfileSectionKey, unknown>>,
  fallback: SectionDisclosureState
): SectionDisclosureState {
  return {
    profile: typeof value.profile === "boolean" ? value.profile : fallback.profile,
    css: typeof value.css === "boolean" ? value.css : fallback.css,
    preferences: typeof value.preferences === "boolean" ? value.preferences : fallback.preferences,
    records: typeof value.records === "boolean" ? value.records : fallback.records,
  };
}

function buildProfileSectionSummary(snapshot: AthleteProfileSnapshot): SectionSummaryCopy {
  if (!snapshot.profileSchemaReady) {
    return {
      summary: "Athlete profile is still syncing.",
      detail: "Open this section later to save swimmer details.",
      hasData: false,
    };
  }

  if (snapshot.loadError) {
    return {
      summary: "Could not load athlete profile.",
      detail: snapshot.loadError,
      hasData: false,
    };
  }

  if (!snapshot.profile) {
    return {
      summary: "No athlete profile saved yet.",
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
      summary: "Personal records are still syncing.",
      detail: "Open this section later to manage saved bests.",
      hasData: false,
    };
  }

  if (snapshot.personalRecordsLoadError) {
    return {
      summary: "Could not load personal records.",
      detail: snapshot.personalRecordsLoadError,
      hasData: false,
    };
  }

  if (snapshot.personalRecords.length === 0) {
    return {
      summary: "No personal records saved yet.",
      detail: "Start with the events you use most in training.",
      hasData: false,
    };
  }

  return {
    summary: `${snapshot.personalRecords.length} current record${
      snapshot.personalRecords.length === 1 ? "" : "s"
    } saved.`,
    detail: snapshot.personalRecords
      .slice(0, 2)
      .map((record) => record.eventLabel)
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
      hasRecordDraft: false,
    })
  );
  const [pendingProfileSave, setPendingProfileSave] = useState(false);
  const [pendingCssSave, setPendingCssSave] = useState(false);
  const [pendingPreferencesSave, setPendingPreferencesSave] = useState(false);
  const [pendingRecordSave, setPendingRecordSave] = useState(false);
  const [pendingRecordDeleteId, setPendingRecordDeleteId] = useState<string | null>(null);
  const [profileDraftRecovered, setProfileDraftRecovered] = useState(false);
  const [cssDraftRecovered, setCssDraftRecovered] = useState(false);
  const [preferencesDraftRecovered, setPreferencesDraftRecovered] = useState(false);
  const [recordDraftRecovered, setRecordDraftRecovered] = useState(false);

  const profileStorageKey = useMemo(() => getStorageKey(userId, "profile"), [userId]);
  const cssStorageKey = useMemo(() => getStorageKey(userId, "css"), [userId]);
  const preferencesStorageKey = useMemo(() => getStorageKey(userId, "preferences"), [userId]);
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
  const hasUnsavedRecordChanges = useMemo(
    () => serializeDraft(recordDraft) !== serializeDraft(savedRecordDraft),
    [recordDraft, savedRecordDraft]
  );

  useEffect(() => {
    setIsOnline(readNavigatorOnlineState());

    const nextProfileFallback = buildProfileDraft(initialSnapshot.profile);
    const nextCssFallback = buildCssMetricDraft(initialSnapshot.cssMetric);
    const nextPreferencesFallback = buildPreferencesDraft(initialSnapshot.preferences);
    const nextRecordFallback = buildPersonalRecordDraft(null);

    const storedProfileDraft = getStorageValue(profileStorageKey, nextProfileFallback);
    const storedCssDraft = getStorageValue(cssStorageKey, nextCssFallback);
    const storedPreferencesDraft = getStorageValue(preferencesStorageKey, nextPreferencesFallback);
    const storedRecordDraft = getStorageValue(recordStorageKey, nextRecordFallback);
    const fallbackDisclosureState = buildDefaultDisclosureState({
      snapshot: initialSnapshot,
      hasProfileDraft: serializeDraft(storedProfileDraft) !== serializeDraft(nextProfileFallback),
      hasCssDraft: serializeDraft(storedCssDraft) !== serializeDraft(nextCssFallback),
      hasPreferencesDraft:
        serializeDraft(storedPreferencesDraft) !== serializeDraft(nextPreferencesFallback),
      hasRecordDraft: serializeDraft(storedRecordDraft) !== serializeDraft(nextRecordFallback),
    });
    const storedDisclosureState = normalizeDisclosureState(
      getStorageValue(disclosureStorageKey, fallbackDisclosureState),
      fallbackDisclosureState
    );

    setProfileDraft(storedProfileDraft);
    setCssDraft(storedCssDraft);
    setPreferencesDraft(storedPreferencesDraft);
    setRecordDraft(storedRecordDraft);
    setSectionOpenState(storedDisclosureState);

    setProfileDraftRecovered(
      serializeDraft(storedProfileDraft) !== serializeDraft(nextProfileFallback)
    );
    setCssDraftRecovered(serializeDraft(storedCssDraft) !== serializeDraft(nextCssFallback));
    setPreferencesDraftRecovered(
      serializeDraft(storedPreferencesDraft) !== serializeDraft(nextPreferencesFallback)
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
    disclosureStorageKey,
    initialSnapshot,
    initialSnapshot.cssMetric,
    initialSnapshot.personalRecords,
    initialSnapshot.preferences,
    initialSnapshot.profile,
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
      setSectionStatus("profile", "Athlete profile is still syncing in this environment.", "error");
      return;
    }

    if (!isOnline) {
      setSectionStatus(
        "profile",
        "You are offline. Reconnect before saving athlete profile.",
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
          await parseError(response, "Could not save athlete profile right now."),
          "error"
        );
        return;
      }

      const payload = (await response.json().catch(() => null)) as ApiError | null;
      if (!payload?.ok || !payload.snapshot) {
        setSectionStatus("profile", "Could not save athlete profile right now.", "error");
        return;
      }

      const nextDraft = buildProfileDraft(payload.snapshot.profile);
      setSnapshot(payload.snapshot);
      setProfileDraft(nextDraft);
      clearStorageValue(profileStorageKey);
      setProfileDraftRecovered(false);
      setSectionStatus("profile", "Athlete profile saved.", "success", { collapse: true });

      void sendClientAnalyticsEvent("athlete_profile_saved", {
        hasAgeBand: Boolean(payload.snapshot.profile?.ageBand),
        hasDisplayName: Boolean(payload.snapshot.profile?.displayName),
      });
    } catch {
      setSectionStatus("profile", "Could not save athlete profile right now.", "error");
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

  async function savePersonalRecord(event: React.FormEvent) {
    event.preventDefault();

    if (!snapshot.personalRecordsSchemaReady) {
      setSectionStatus(
        "records",
        "Personal records are still syncing in this environment.",
        "error"
      );
      return;
    }

    if (!isOnline) {
      setSectionStatus(
        "records",
        "You are offline. Reconnect before saving personal records.",
        "error"
      );
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
          await parseError(response, "Could not save personal record right now."),
          "error"
        );
        return;
      }

      const payload = (await response.json().catch(() => null)) as ApiError | null;
      if (!payload?.ok || !payload.snapshot) {
        setSectionStatus("records", "Could not save personal record right now.", "error");
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
        isEditing ? "Personal record updated." : "Personal record saved.",
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
      setSectionStatus("records", "Could not save personal record right now.", "error");
    } finally {
      setPendingRecordSave(false);
    }
  }

  async function deletePersonalRecord(record: PersonalRecordView) {
    if (!snapshot.personalRecordsSchemaReady) {
      setSectionStatus(
        "records",
        "Personal records are still syncing in this environment.",
        "error"
      );
      return;
    }

    if (!isOnline) {
      setSectionStatus(
        "records",
        "You are offline. Reconnect before deleting personal records.",
        "error"
      );
      return;
    }

    if (!window.confirm(`Delete ${record.eventLabel}?`)) {
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
          await parseError(response, "Could not delete personal record right now."),
          "error"
        );
        return;
      }

      const payload = (await response.json().catch(() => null)) as ApiError | null;
      if (!payload?.ok || !payload.snapshot) {
        setSectionStatus("records", "Could not delete personal record right now.", "error");
        return;
      }

      setSnapshot(payload.snapshot);

      if (recordDraft.editingRecordId === record.id) {
        setRecordDraft(buildPersonalRecordDraft(null));
        clearStorageValue(recordStorageKey);
        setRecordDraftRecovered(false);
      }

      setSectionStatus("records", "Personal record deleted.", "success");

      void sendClientAnalyticsEvent("personal_record_deleted", {
        eventLabel: record.eventLabel,
      });
    } catch {
      setSectionStatus("records", "Could not delete personal record right now.", "error");
    } finally {
      setPendingRecordDeleteId(null);
    }
  }

  function resetProfileDraftToSaved() {
    setProfileDraft(savedProfileDraft);
    clearStorageValue(profileStorageKey);
    setProfileDraftRecovered(false);
    setSectionStatus("profile", "Draft reset to saved athlete profile.", "success");
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

  function resetRecordDraftToSaved() {
    setRecordDraft(savedRecordDraft);
    clearStorageValue(recordStorageKey);
    setRecordDraftRecovered(false);
    setSectionStatus(
      "records",
      recordDraft.editingRecordId
        ? "Draft reset to saved personal record."
        : "Draft reset to a new personal record.",
      "success"
    );
  }

  function startEditingRecord(record: PersonalRecordView) {
    setRecordDraft(buildPersonalRecordDraft(record));
    setRecordDraftRecovered(false);
    setSectionOpen("records", true);
    setSectionStatus("records", `Editing ${record.eventLabel}.`, "success");
  }

  function startNewRecord() {
    setRecordDraft(buildPersonalRecordDraft(null));
    clearStorageValue(recordStorageKey);
    setRecordDraftRecovered(false);
    setSectionOpen("records", true);
    setSectionStatus("records", "Ready to add a new personal record.", "success");
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
  const recordsSummary = buildRecordsSectionSummary(snapshot);
  const profileNotice = getSectionNotice("profile");
  const cssNotice = getSectionNotice("css");
  const preferencesNotice = getSectionNotice("preferences");
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
          You are offline. Unsaved profile, CSS, preferences, and personal-record changes stay on
          this device until you reconnect and save.
        </div>
      ) : null}

      {profileDraftRecovered ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/80 px-4 py-3 text-sm text-blue-900">
          Unsaved athlete-profile edits were restored on this device.
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

      {recordDraftRecovered ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/80 px-4 py-3 text-sm text-blue-900">
          Unsaved personal-record edits were restored on this device.
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
        data-testid="athlete-profile-section-profile"
        data-section-open={sectionOpenState.profile ? "true" : "false"}
        className="rounded-3xl border border-slate-200 bg-white p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Athlete profile
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Athlete identity</h2>
              {hasUnsavedProfileChanges ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                  Unsaved edits
                </span>
              ) : null}
            </div>
            <p className="text-sm font-medium text-slate-900">{profileSummary.summary}</p>
            <p className="text-sm text-slate-600">{profileSummary.detail}</p>
          </div>
          <button
            type="button"
            data-testid="athlete-profile-section-toggle-profile"
            aria-expanded={sectionOpenState.profile}
            aria-controls="athlete-profile-section-body-profile"
            onClick={() => toggleSection("profile")}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {sectionOpenState.profile
              ? "Collapse"
              : profileSummary.hasData
                ? "Edit profile"
                : "Open profile"}
          </button>
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
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                data-testid="athlete-profile-save"
                type="submit"
                disabled={pendingProfileSave || !isOnline}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {pendingProfileSave ? "Saving..." : "Save athlete profile"}
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
        data-section-open={sectionOpenState.css ? "true" : "false"}
        className="rounded-3xl border border-slate-200 bg-white p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">CSS</p>
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
          <button
            type="button"
            data-testid="athlete-profile-section-toggle-css"
            aria-expanded={sectionOpenState.css}
            aria-controls="athlete-profile-section-body-css"
            onClick={() => toggleSection("css")}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {sectionOpenState.css ? "Collapse" : cssSummary.hasData ? "Edit CSS" : "Open CSS"}
          </button>
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
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button
                data-testid="athlete-profile-css-save"
                type="submit"
                disabled={pendingCssSave || !isOnline}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-cyan-600 px-4 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-300"
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
        data-section-open={sectionOpenState.preferences ? "true" : "false"}
        className="rounded-3xl border border-slate-200 bg-white p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
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
          <button
            type="button"
            data-testid="athlete-profile-section-toggle-preferences"
            aria-expanded={sectionOpenState.preferences}
            aria-controls="athlete-profile-section-body-preferences"
            onClick={() => toggleSection("preferences")}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {sectionOpenState.preferences
              ? "Collapse"
              : preferencesSummary.hasData
                ? "Edit preferences"
                : "Open preferences"}
          </button>
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
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
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
        data-testid="athlete-profile-section-records"
        data-section-open={sectionOpenState.records ? "true" : "false"}
        className="rounded-3xl border border-slate-200 bg-white p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Personal records
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">Event bests</h2>
              {hasUnsavedRecordChanges ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
                  Unsaved edits
                </span>
              ) : null}
            </div>
            <p className="text-sm font-medium text-slate-900">{recordsSummary.summary}</p>
            <p className="text-sm text-slate-600">{recordsSummary.detail}</p>
          </div>
          <button
            type="button"
            data-testid="athlete-profile-section-toggle-records"
            aria-expanded={sectionOpenState.records}
            aria-controls="athlete-profile-section-body-records"
            onClick={() => toggleSection("records")}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {sectionOpenState.records
              ? "Collapse"
              : recordsSummary.hasData
                ? "Edit records"
                : "Open records"}
          </button>
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

            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="max-w-2xl text-sm text-slate-600">
                Save one private current best per event so later generator work can reuse trusted
                event context without guessing.
              </p>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                One current record per event
              </div>
            </div>

            {!snapshot.personalRecordsSchemaReady ? (
              <p className="mt-5 text-sm text-amber-800">
                Personal records are still syncing in this environment.
              </p>
            ) : snapshot.personalRecordsLoadError ? (
              <p className="mt-5 text-sm text-rose-700">{snapshot.personalRecordsLoadError}</p>
            ) : (
              <div className="mt-5 space-y-4">
                {snapshot.personalRecords.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-4 text-sm text-slate-600">
                    No personal records saved yet. Start with the events you use most in training.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {snapshot.personalRecords.map((record) => (
                      <article
                        key={record.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base font-semibold text-slate-900">
                              {record.eventLabel}
                            </h3>
                            <p className="mt-1 text-sm text-slate-600">
                              {record.timeLabel}
                              {record.recordedOn ? ` · ${record.recordedOn}` : ""}
                            </p>
                            {record.sourceNote ? (
                              <p className="mt-2 text-sm text-slate-600">{record.sourceNote}</p>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap gap-2">
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
                  onSubmit={savePersonalRecord}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {currentEditedRecord ? "Edit personal record" : "Add personal record"}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">
                        Use explicit event identity and swimmer-friendly time input: `59.87`,
                        `1:02.34`, or `1:01:02.34`.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentEditedRecord ? (
                        <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                          Editing {currentEditedRecord.eventLabel}
                        </div>
                      ) : null}
                      {currentEditedRecord ? (
                        <button
                          type="button"
                          onClick={startNewRecord}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Start new
                        </button>
                      ) : null}
                    </div>
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
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </label>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <button
                      data-testid="athlete-record-save"
                      type="submit"
                      disabled={pendingRecordSave || !isOnline}
                      className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {pendingRecordSave
                        ? "Saving..."
                        : currentEditedRecord
                          ? "Update personal record"
                          : "Save personal record"}
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
