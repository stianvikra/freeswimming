type EnvLike = Record<string, string | undefined>;

export type SiteLockMode = "password";

export type SiteLockConfig = {
  enabled: boolean;
  mode: SiteLockMode;
  passwordHash: string;
  bypassToken: string;
  cookieName: string;
  sessionMaxAgeSeconds: number;
};

const DEFAULT_SITE_LOCK_MODE: SiteLockMode = "password";
const DEFAULT_SITE_LOCK_COOKIE_NAME = "fs_preview_access";
const DEFAULT_SITE_LOCK_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const integer = Math.floor(parsed);
  if (integer <= 0) return fallback;
  return integer;
}

export function isSiteLockEnabled(env: EnvLike = process.env): boolean {
  return env.SITE_LOCK_ENABLED === "1";
}

function requireEnvValue(value: string | undefined, name: string): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return trimmed;
}

export function getSiteLockConfig(env: EnvLike = process.env): SiteLockConfig {
  const enabled = isSiteLockEnabled(env);
  const modeRaw = (env.SITE_LOCK_MODE ?? DEFAULT_SITE_LOCK_MODE).trim().toLowerCase();

  const cookieName = env.SITE_LOCK_COOKIE_NAME?.trim() || DEFAULT_SITE_LOCK_COOKIE_NAME;
  const sessionMaxAgeSeconds = parsePositiveInteger(
    env.SITE_LOCK_SESSION_MAX_AGE_SECONDS,
    DEFAULT_SITE_LOCK_SESSION_MAX_AGE_SECONDS
  );

  if (!enabled) {
    return {
      enabled: false,
      mode: DEFAULT_SITE_LOCK_MODE,
      passwordHash: "",
      bypassToken: "",
      cookieName,
      sessionMaxAgeSeconds,
    };
  }

  if (modeRaw !== DEFAULT_SITE_LOCK_MODE) {
    throw new Error(`Unsupported SITE_LOCK_MODE: ${modeRaw}`);
  }

  return {
    enabled: true,
    mode: DEFAULT_SITE_LOCK_MODE,
    passwordHash: requireEnvValue(env.SITE_LOCK_PASSWORD_HASH, "SITE_LOCK_PASSWORD_HASH"),
    bypassToken: requireEnvValue(env.SITE_LOCK_BYPASS_TOKEN, "SITE_LOCK_BYPASS_TOKEN"),
    cookieName,
    sessionMaxAgeSeconds,
  };
}
