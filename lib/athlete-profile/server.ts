import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildAthleteProfilePrimaryName,
  getAthleteAgeBandLabel,
  type AthleteAgeBand,
  type AthleteProfileRow,
} from "@/lib/athlete-profile/mvp";
import { isAthleteProfileSchemaMissing } from "@/lib/athlete-profile/schema";
import type { Database } from "@/types/database";

type TypedSupabaseClient = SupabaseClient<Database>;

export const ATHLETE_PROFILE_SELECT = `
  id,
  user_id,
  display_name,
  first_name,
  last_name,
  age_band,
  created_at,
  updated_at
`;

export type AthleteProfileView = {
  id: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  primaryName: string | null;
  ageBand: AthleteAgeBand | null;
  ageBandLabel: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AthleteProfileSnapshot = {
  schemaReady: boolean;
  loadError: string | null;
  profile: AthleteProfileView | null;
};

export function buildAthleteProfileView(row: AthleteProfileRow): AthleteProfileView {
  const primaryName = buildAthleteProfilePrimaryName({
    displayName: row.display_name,
    firstName: row.first_name,
    lastName: row.last_name,
  });

  return {
    id: row.id,
    displayName: row.display_name,
    firstName: row.first_name,
    lastName: row.last_name,
    primaryName,
    ageBand: row.age_band,
    ageBandLabel: getAthleteAgeBandLabel(row.age_band),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function loadAthleteProfileSnapshot(
  supabase: TypedSupabaseClient,
  userId: string
): Promise<AthleteProfileSnapshot> {
  const result = await supabase
    .from("athlete_profiles")
    .select(ATHLETE_PROFILE_SELECT)
    .eq("user_id", userId)
    .maybeSingle();

  if (isAthleteProfileSchemaMissing(result.error)) {
    return {
      schemaReady: false,
      loadError: null,
      profile: null,
    };
  }

  if (result.error) {
    console.error("[AthleteProfile] Failed loading snapshot", result.error);
    return {
      schemaReady: true,
      loadError: "Could not load athlete profile right now.",
      profile: null,
    };
  }

  return {
    schemaReady: true,
    loadError: null,
    profile: result.data ? buildAthleteProfileView(result.data) : null,
  };
}
