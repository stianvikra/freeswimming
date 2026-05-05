function requireBrowserEnvValue(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getBrowserSupabaseUrl(): string {
  return requireBrowserEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL");
}

export function getBrowserSupabaseAnonKey(): string {
  return requireBrowserEnvValue(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}
