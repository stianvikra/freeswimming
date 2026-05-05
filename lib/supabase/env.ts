import {
  assertSupabaseServiceRoleAllowed,
  assertSupabaseUrlAllowed,
} from "@/lib/supabase/egress-guard";

function requireEnvValue(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseUrl(): string {
  const value = requireEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL");
  assertSupabaseUrlAllowed({
    value,
    name: "NEXT_PUBLIC_SUPABASE_URL",
  });
  return value;
}

export function getSupabaseAnonKey(): string {
  return requireEnvValue(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

export function getSupabaseServiceRoleKey(): string {
  const value = requireEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY");
  assertSupabaseServiceRoleAllowed({
    value,
    name: "SUPABASE_SERVICE_ROLE_KEY",
  });
  return value;
}

export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://127.0.0.1:3000";
}
