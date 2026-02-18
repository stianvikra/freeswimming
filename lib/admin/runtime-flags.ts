import type { Database } from "@/types/database";

export const ADMIN_RUNTIME_FLAG_KEYS = ["soft_launch_banner"] as const;

export type AdminRuntimeFlagKey = (typeof ADMIN_RUNTIME_FLAG_KEYS)[number];
export type AdminRuntimeFlagRow = Database["public"]["Tables"]["admin_runtime_flags"]["Row"];

export type UpdateAdminRuntimeFlagPayload = {
  enabled?: unknown;
};

type ParseUpdateAdminRuntimeFlagResult =
  | {
      ok: true;
      value: {
        enabled: boolean;
      };
    }
  | {
      ok: false;
      error: string;
    };

export function isAdminRuntimeFlagKey(value: string): value is AdminRuntimeFlagKey {
  return ADMIN_RUNTIME_FLAG_KEYS.includes(value as AdminRuntimeFlagKey);
}

export function parseUpdateAdminRuntimeFlagPayload(
  payload: UpdateAdminRuntimeFlagPayload
): ParseUpdateAdminRuntimeFlagResult {
  if (typeof payload.enabled !== "boolean") {
    return { ok: false, error: "enabled must be true or false." };
  }

  return {
    ok: true,
    value: {
      enabled: payload.enabled,
    },
  };
}
