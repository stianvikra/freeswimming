type GuardEnv = Record<string, string | undefined>;

const PROD_OPT_IN_VALUES = new Set(["1", "true", "yes"]);
const REMOTE_SUPABASE_SUFFIX = ".supabase.co";
const SAFE_EXAMPLE_HOSTS = new Set(["example.com", "www.example.com", "example.supabase.co"]);
const SAFE_LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);

function getEnvValue(env: GuardEnv, name: string): string {
  return (env[name] ?? "").trim();
}

function isEnabled(value: string): boolean {
  return PROD_OPT_IN_VALUES.has(value.trim().toLowerCase());
}

function isBrowserRuntime(): boolean {
  return typeof window !== "undefined";
}

function parseHostname(value: string): string | null {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isSafeSupabaseHost(hostname: string): boolean {
  return SAFE_EXAMPLE_HOSTS.has(hostname) || SAFE_LOCAL_HOSTS.has(hostname);
}

function isRemoteSupabaseCloudHost(hostname: string): boolean {
  return hostname.endsWith(REMOTE_SUPABASE_SUFFIX) && !isSafeSupabaseHost(hostname);
}

function normalizeUrlOrigin(value: string): string | null {
  try {
    return new URL(value).origin.toLowerCase();
  } catch {
    return null;
  }
}

function isProductionMarkerMatch(value: string, env: GuardEnv): boolean {
  const productionUrl = getEnvValue(env, "FS_PRODUCTION_SUPABASE_URL");
  if (!productionUrl) return false;

  const currentOrigin = normalizeUrlOrigin(value);
  const productionOrigin = normalizeUrlOrigin(productionUrl);
  return Boolean(currentOrigin && productionOrigin && currentOrigin === productionOrigin);
}

function isProductionRuntime(env: GuardEnv): boolean {
  return (
    getEnvValue(env, "VERCEL_ENV") === "production" ||
    getEnvValue(env, "FS_SUPABASE_ENV") === "production"
  );
}

function isVercelRuntime(env: GuardEnv): boolean {
  return getEnvValue(env, "VERCEL") === "1" || Boolean(getEnvValue(env, "VERCEL_ENV"));
}

function isLocalLikeRuntime(env: GuardEnv, isBrowser: boolean): boolean {
  const supabaseEnv = getEnvValue(env, "FS_SUPABASE_ENV");
  if (supabaseEnv === "local" || supabaseEnv === "test") return true;
  if (supabaseEnv === "ci" || supabaseEnv === "preview") return false;

  const nodeEnv = getEnvValue(env, "NODE_ENV");
  if (nodeEnv === "test") return true;
  if (getEnvValue(env, "VITEST")) return true;

  if (isBrowser) {
    return nodeEnv !== "production";
  }

  if (isVercelRuntime(env)) return false;
  return nodeEnv !== "production";
}

function isProdOptIn(env: GuardEnv): boolean {
  return isEnabled(getEnvValue(env, "FS_ALLOW_PROD_SUPABASE"));
}

export function assertSupabaseUrlAllowed(params: {
  value: string;
  name: string;
  env?: GuardEnv;
  isBrowser?: boolean;
}): void {
  const env = params.env ?? process.env;
  const isBrowser = params.isBrowser ?? isBrowserRuntime();
  const hostname = parseHostname(params.value);
  if (!hostname) return;
  if (isSafeSupabaseHost(hostname)) return;
  if (isProdOptIn(env)) return;
  if (isProductionRuntime(env)) return;

  const isRemoteCloudHost = isRemoteSupabaseCloudHost(hostname);
  const isKnownProduction = isProductionMarkerMatch(params.value, env);
  if (!isRemoteCloudHost && !isKnownProduction) return;

  if (isKnownProduction) {
    throw new Error(
      [
        `Unsafe Supabase configuration: ${params.name} matches the known production Supabase origin in a non-production context.`,
        "Use local/example/isolated Supabase settings for development, tests, CI, and preview.",
        "For an intentional production smoke check, set FS_ALLOW_PROD_SUPABASE=1 for that command only.",
      ].join(" ")
    );
  }

  if (isLocalLikeRuntime(env, isBrowser)) {
    throw new Error(
      [
        `Unsafe Supabase configuration: ${params.name} points to a Supabase cloud project in a local/test context.`,
        "Use local/example Supabase settings for development and tests.",
        "For an intentional production smoke check, set FS_ALLOW_PROD_SUPABASE=1 for that command only.",
      ].join(" ")
    );
  }
}

function looksLikeLiveServiceRoleKey(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.startsWith("sb_secret_")) return true;
  const jwtParts = trimmed.split(".");
  return jwtParts.length === 3 && trimmed.length > 80;
}

export function assertSupabaseServiceRoleAllowed(params: {
  value: string;
  name: string;
  env?: GuardEnv;
  isBrowser?: boolean;
}): void {
  const env = params.env ?? process.env;
  const isBrowser = params.isBrowser ?? isBrowserRuntime();
  if (!looksLikeLiveServiceRoleKey(params.value)) return;
  if (isProdOptIn(env)) return;
  if (isProductionRuntime(env)) return;
  if (!isLocalLikeRuntime(env, isBrowser)) return;

  throw new Error(
    [
      `Unsafe Supabase configuration: ${params.name} looks like a live service-role key in a local/test context.`,
      "Use a dummy/local service role value for development and tests.",
      "For an intentional production smoke check, set FS_ALLOW_PROD_SUPABASE=1 for that command only.",
    ].join(" ")
  );
}
