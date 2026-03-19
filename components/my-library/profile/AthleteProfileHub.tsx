"use client";

import { useEffect, useMemo, useState } from "react";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";
import {
  ATHLETE_AGE_BAND_OPTIONS,
  buildAthleteProfilePrimaryName,
  type AthleteAgeBand,
} from "@/lib/athlete-profile/mvp";
import type { AthleteProfileSnapshot, AthleteProfileView } from "@/lib/athlete-profile/server";
import { readNavigatorOnlineState } from "@/lib/utils/navigator-online";

type Props = {
  initialSnapshot: AthleteProfileSnapshot;
  userId: string;
};

type ApiError = {
  ok?: boolean;
  error?: string;
  snapshot?: AthleteProfileSnapshot;
};

type AthleteProfileDraft = {
  displayName: string;
  firstName: string;
  lastName: string;
  ageBand: AthleteAgeBand | "";
};

function buildDraft(profile: AthleteProfileView | null): AthleteProfileDraft {
  return {
    displayName: profile?.displayName ?? "",
    firstName: profile?.firstName ?? "",
    lastName: profile?.lastName ?? "",
    ageBand: profile?.ageBand ?? "",
  };
}

function getStorageKey(userId: string) {
  return `my-library-athlete-profile-draft:${userId}`;
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

function serializeDraft(draft: AthleteProfileDraft) {
  return JSON.stringify(draft);
}

export default function AthleteProfileHub({ initialSnapshot, userId }: Props) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [draft, setDraft] = useState(() => buildDraft(initialSnapshot.profile));
  const [actionError, setActionError] = useState(initialSnapshot.loadError ?? "");
  const [actionSuccess, setActionSuccess] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);
  const [draftRecovered, setDraftRecovered] = useState(false);

  const storageKey = useMemo(() => getStorageKey(userId), [userId]);
  const savedDraft = useMemo(() => buildDraft(snapshot.profile), [snapshot.profile]);
  const hasUnsavedChanges = useMemo(
    () => serializeDraft(draft) !== serializeDraft(savedDraft),
    [draft, savedDraft]
  );

  useEffect(() => {
    setIsOnline(readNavigatorOnlineState());

    const fallback = buildDraft(initialSnapshot.profile);
    const storedDraft = getStorageValue(storageKey, fallback);
    setDraft(storedDraft);
    setDraftRecovered(serializeDraft(storedDraft) !== serializeDraft(fallback));
    setActionError(initialSnapshot.loadError ?? "");

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
  }, [initialSnapshot.loadError, initialSnapshot.profile, storageKey]);

  useEffect(() => {
    setStorageValue(storageKey, draft);
  }, [draft, storageKey]);

  async function parseError(response: Response, fallback: string) {
    const payload = (await response.json().catch(() => null)) as ApiError | null;
    return payload?.error || fallback;
  }

  async function refreshProfile() {
    setIsRefreshing(true);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await fetch("/api/my-library/profile", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        setActionError(await parseError(response, "Could not refresh athlete profile right now."));
        return;
      }

      const payload = (await response.json().catch(() => null)) as ApiError | null;
      if (!payload?.ok || !payload.snapshot) {
        setActionError("Could not refresh athlete profile right now.");
        return;
      }

      setSnapshot(payload.snapshot);
      if (!hasUnsavedChanges) {
        setDraft(buildDraft(payload.snapshot.profile));
      }

      void sendClientAnalyticsEvent("athlete_profile_refreshed", {
        hasProfile: Boolean(payload.snapshot.profile),
      });
    } catch {
      setActionError("Could not refresh athlete profile right now.");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();

    if (!snapshot.schemaReady) {
      setActionError("Athlete profile is still syncing in this environment.");
      return;
    }

    if (!isOnline) {
      setActionError("You are offline. Reconnect before saving athlete profile.");
      return;
    }

    setPendingSave(true);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await fetch("/api/my-library/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draft),
      });

      if (!response.ok) {
        setActionError(await parseError(response, "Could not save athlete profile right now."));
        return;
      }

      const payload = (await response.json().catch(() => null)) as ApiError | null;
      if (!payload?.ok || !payload.snapshot) {
        setActionError("Could not save athlete profile right now.");
        return;
      }

      const nextDraft = buildDraft(payload.snapshot.profile);
      setSnapshot(payload.snapshot);
      setDraft(nextDraft);
      clearStorageValue(storageKey);
      setDraftRecovered(false);
      setActionSuccess("Athlete profile saved.");

      void sendClientAnalyticsEvent("athlete_profile_saved", {
        hasAgeBand: Boolean(payload.snapshot.profile?.ageBand),
        hasDisplayName: Boolean(payload.snapshot.profile?.displayName),
      });
    } catch {
      setActionError("Could not save athlete profile right now.");
    } finally {
      setPendingSave(false);
    }
  }

  function resetDraftToSaved() {
    setDraft(savedDraft);
    clearStorageValue(storageKey);
    setDraftRecovered(false);
    setActionError("");
    setActionSuccess("Draft reset to saved athlete profile.");
  }

  const primaryName = buildAthleteProfilePrimaryName({
    displayName: draft.displayName.trim() || null,
    firstName: draft.firstName.trim() || null,
    lastName: draft.lastName.trim() || null,
  });

  if (!snapshot.schemaReady) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 text-sm text-amber-900">
        <p className="font-semibold">Athlete profile is still syncing in this environment.</p>
        <p className="mt-2">
          The profile foundation code is ready, but this environment cannot read the new schema yet.
          Reload later once the database migration is live.
        </p>
        <button
          type="button"
          onClick={() => void refreshProfile()}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-amber-300 bg-white px-4 text-sm font-medium text-amber-900 transition hover:bg-amber-50"
        >
          {isRefreshing ? "Refreshing..." : "Retry"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!isOnline ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900">
          You are offline. Draft changes stay on this device until you reconnect and save.
        </div>
      ) : null}

      {draftRecovered ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/80 px-4 py-3 text-sm text-blue-900">
          Unsaved athlete-profile edits were restored on this device.
        </div>
      ) : null}

      {actionError ? (
        <div
          className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-900"
          role="alert"
        >
          {actionError}
        </div>
      ) : null}

      {actionSuccess ? (
        <div
          className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900"
          aria-live="polite"
        >
          {actionSuccess}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Current athlete profile</h2>
          {!snapshot.profile ? (
            <p className="mt-3 text-sm text-slate-600">
              No private athlete profile is saved yet. Add the swimmer details you want to reuse
              later when metrics, personal records, and broader preferences arrive.
            </p>
          ) : (
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Primary name
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {snapshot.profile.primaryName ?? "Private swimmer"}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Display name
                    </p>
                    <p className="mt-1">{snapshot.profile.displayName ?? "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Age band
                    </p>
                    <p className="mt-1">{snapshot.profile.ageBandLabel ?? "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      First name
                    </p>
                    <p className="mt-1">{snapshot.profile.firstName ?? "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Last name
                    </p>
                    <p className="mt-1">{snapshot.profile.lastName ?? "Not set"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Why save this now</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>Private swimmer context lives here instead of being mixed into notes.</li>
            <li>
              Goals stay about direction. Focus stays about current work. Profile stays stable.
            </li>
            <li>Later generator slices can reuse this context without redesigning the model.</li>
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            This profile is private to your account. Training metrics, personal records, and broader
            preferences come in later slices.
          </p>
        </section>
      </div>

      <form onSubmit={saveProfile} className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Edit athlete profile</h2>
            <p className="mt-2 text-sm text-slate-600">
              Save enough context to make this feel like your own training space now.
            </p>
          </div>
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
              value={draft.displayName}
              onChange={(event) =>
                setDraft((current) => ({ ...current, displayName: event.target.value }))
              }
              placeholder="How you want your swimmer profile to read"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Age band</span>
            <select
              data-testid="athlete-profile-age-band"
              value={draft.ageBand}
              onChange={(event) =>
                setDraft((current) => ({
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
              value={draft.firstName}
              onChange={(event) =>
                setDraft((current) => ({ ...current, firstName: event.target.value }))
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
              value={draft.lastName}
              onChange={(event) =>
                setDraft((current) => ({ ...current, lastName: event.target.value }))
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
            disabled={pendingSave || !isOnline}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {pendingSave ? "Saving..." : "Save athlete profile"}
          </button>
          <button
            type="button"
            onClick={resetDraftToSaved}
            disabled={!hasUnsavedChanges}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            Reset draft
          </button>
          <button
            type="button"
            onClick={() => void refreshProfile()}
            disabled={isRefreshing}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </form>
    </div>
  );
}
