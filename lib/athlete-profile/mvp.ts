import type { Database } from "@/types/database";

export const ATHLETE_AGE_BAND_VALUES = [
  "under_18",
  "18_24",
  "25_34",
  "35_44",
  "45_54",
  "55_64",
  "65_plus",
  "prefer_not_to_say",
] as const;

export type AthleteAgeBand = (typeof ATHLETE_AGE_BAND_VALUES)[number];
export type AthleteProfileRow = Database["public"]["Tables"]["athlete_profiles"]["Row"];
export type AthleteProfileInsert = Database["public"]["Tables"]["athlete_profiles"]["Insert"];
export type AthleteProfileUpdate = Database["public"]["Tables"]["athlete_profiles"]["Update"];

type AthleteProfileInput = {
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  ageBand?: string | null;
};

export type AthleteAgeBandOption = {
  value: AthleteAgeBand;
  label: string;
};

export const ATHLETE_AGE_BAND_OPTIONS: readonly AthleteAgeBandOption[] = [
  { value: "under_18", label: "Under 18" },
  { value: "18_24", label: "18 to 24" },
  { value: "25_34", label: "25 to 34" },
  { value: "35_44", label: "35 to 44" },
  { value: "45_54", label: "45 to 54" },
  { value: "55_64", label: "55 to 64" },
  { value: "65_plus", label: "65+" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

function normalizeText(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function normalizeNullableText(value: string | null | undefined): string | null {
  const normalized = normalizeText(value);
  return normalized.length > 0 ? normalized : null;
}

export function normalizeAthleteAgeBand(value: string | null | undefined): AthleteAgeBand | null {
  const normalized = normalizeText(value);
  if (!normalized) return null;

  return ATHLETE_AGE_BAND_VALUES.find((candidate) => candidate === normalized) ?? null;
}

export function getAthleteAgeBandLabel(value: AthleteAgeBand | null): string | null {
  if (!value) return null;
  return ATHLETE_AGE_BAND_OPTIONS.find((option) => option.value === value)?.label ?? null;
}

export function buildAthleteProfileUpsert(
  input: AthleteProfileInput
): Omit<AthleteProfileInsert, "id" | "user_id" | "created_at" | "updated_at"> | null {
  const displayName = normalizeNullableText(input.displayName);
  const firstName = normalizeNullableText(input.firstName);
  const lastName = normalizeNullableText(input.lastName);
  const ageBand = normalizeAthleteAgeBand(input.ageBand);

  if (!displayName && !firstName && !lastName && !ageBand) {
    return null;
  }

  if (displayName && displayName.length > 80) return null;
  if (firstName && firstName.length > 60) return null;
  if (lastName && lastName.length > 60) return null;
  if (input.ageBand && !ageBand) return null;

  return {
    display_name: displayName,
    first_name: firstName,
    last_name: lastName,
    age_band: ageBand,
  };
}

export function buildAthleteProfilePrimaryName(profile: {
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
}): string | null {
  if (profile.displayName) return profile.displayName;

  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
  return fullName.length > 0 ? fullName : null;
}
