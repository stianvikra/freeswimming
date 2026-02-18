import type { User } from "@supabase/supabase-js";

export const ADMIN_ROLE_VALUES = ["admin", "editor", "viewer"] as const;

export type AdminRole = (typeof ADMIN_ROLE_VALUES)[number];

function normalizeRole(value: unknown): AdminRole | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  return ADMIN_ROLE_VALUES.includes(normalized as AdminRole) ? (normalized as AdminRole) : null;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function parseAdminEmailAllowlist(raw: string | undefined): Set<string> {
  const values = (raw ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map(normalizeEmail);
  return new Set(values);
}

export function isAdminEmailAllowlisted(email: string | null | undefined, raw: string | undefined) {
  if (!email) return false;
  return parseAdminEmailAllowlist(raw).has(normalizeEmail(email));
}

export function resolveAdminRoleForUser(
  user: Pick<User, "email" | "app_metadata">,
  options?: {
    allowlistedEmailsRaw?: string | undefined;
  }
): AdminRole | null {
  const claimRole = normalizeRole(user.app_metadata?.admin_role ?? user.app_metadata?.role);
  if (claimRole) return claimRole;

  if (isAdminEmailAllowlisted(user.email, options?.allowlistedEmailsRaw)) {
    return "admin";
  }

  return null;
}
