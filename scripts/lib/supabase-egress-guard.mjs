import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const PROD_OPT_IN_VALUES = new Set(["1", "true", "yes"]);
const REMOTE_SUPABASE_SUFFIX = ".supabase.co";
const SAFE_EXAMPLE_HOSTS = new Set(["example.com", "www.example.com", "example.supabase.co"]);
const SAFE_LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);

function getEnvValue(env, name) {
  return String(env[name] ?? "").trim();
}

function isEnabled(value) {
  return PROD_OPT_IN_VALUES.has(
    String(value ?? "")
      .trim()
      .toLowerCase()
  );
}

function parseHostname(value) {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function normalizeUrlOrigin(value) {
  try {
    return new URL(value).origin.toLowerCase();
  } catch {
    return null;
  }
}

function isSafeHost(hostname) {
  return SAFE_EXAMPLE_HOSTS.has(hostname) || SAFE_LOCAL_HOSTS.has(hostname);
}

function isRemoteSupabaseCloudHost(hostname) {
  return hostname.endsWith(REMOTE_SUPABASE_SUFFIX) && !isSafeHost(hostname);
}

function isProductionMarkerMatch(value, env) {
  const productionUrl = getEnvValue(env, "FS_PRODUCTION_SUPABASE_URL");
  if (!productionUrl) return false;

  const currentOrigin = normalizeUrlOrigin(value);
  const productionOrigin = normalizeUrlOrigin(productionUrl);
  return Boolean(currentOrigin && productionOrigin && currentOrigin === productionOrigin);
}

function isProductionRuntime(env) {
  return (
    getEnvValue(env, "VERCEL_ENV") === "production" ||
    getEnvValue(env, "FS_SUPABASE_ENV") === "production"
  );
}

function isVercelRuntime(env) {
  return getEnvValue(env, "VERCEL") === "1" || Boolean(getEnvValue(env, "VERCEL_ENV"));
}

function isLocalCommandContext(env) {
  if (isVercelRuntime(env)) return false;
  const supabaseEnv = getEnvValue(env, "FS_SUPABASE_ENV");
  if (supabaseEnv === "production" || supabaseEnv === "preview" || supabaseEnv === "ci") {
    return false;
  }
  return true;
}

function isProdOptIn(env) {
  return isEnabled(getEnvValue(env, "FS_ALLOW_PROD_SUPABASE"));
}

function looksLikeLiveServiceRoleKey(value) {
  const trimmed = String(value ?? "").trim();
  if (trimmed.startsWith("sb_secret_")) return true;
  return trimmed.split(".").length === 3 && trimmed.length > 80;
}

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;

  const normalized = trimmed.startsWith("export ")
    ? trimmed.slice("export ".length).trim()
    : trimmed;
  const equalsIndex = normalized.indexOf("=");
  if (equalsIndex <= 0) return null;

  const key = normalized.slice(0, equalsIndex).trim();
  let value = normalized.slice(equalsIndex + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return { key, value };
}

function readEnvFile(filePath) {
  if (!existsSync(filePath)) return {};

  const values = {};
  const text = readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const parsed = parseEnvLine(line);
    if (!parsed) continue;
    values[parsed.key] = parsed.value;
  }
  return values;
}

export function loadRepoEnv({ repoRoot = process.cwd(), mode = "development" } = {}) {
  const candidates = [".env", `.env.${mode}`, ".env.local", `.env.${mode}.local`];

  const loaded = {};
  for (const candidate of candidates) {
    Object.assign(loaded, readEnvFile(path.join(repoRoot, candidate)));
  }

  return {
    ...loaded,
    ...process.env,
  };
}

export function validateSupabaseEgressGuard(env) {
  const errors = [];
  const supabaseUrl = getEnvValue(env, "NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getEnvValue(env, "SUPABASE_SERVICE_ROLE_KEY");

  if (isProdOptIn(env) || isProductionRuntime(env)) {
    return errors;
  }

  if (supabaseUrl) {
    const hostname = parseHostname(supabaseUrl);
    const isRemoteCloud = hostname ? isRemoteSupabaseCloudHost(hostname) : false;
    const isKnownProduction = isProductionMarkerMatch(supabaseUrl, env);

    if (isKnownProduction) {
      errors.push(
        [
          "NEXT_PUBLIC_SUPABASE_URL matches FS_PRODUCTION_SUPABASE_URL for a non-production command.",
          "Use local/example/isolated Supabase values, or set FS_ALLOW_PROD_SUPABASE=1 for an intentional production smoke check.",
        ].join(" ")
      );
    } else if (isRemoteCloud && isLocalCommandContext(env)) {
      errors.push(
        [
          "NEXT_PUBLIC_SUPABASE_URL points to a Supabase cloud project for a local command.",
          "Use local/example Supabase values, or set FS_ALLOW_PROD_SUPABASE=1 for an intentional production smoke check.",
        ].join(" ")
      );
    }
  }

  if (looksLikeLiveServiceRoleKey(serviceRoleKey) && isLocalCommandContext(env)) {
    errors.push(
      [
        "SUPABASE_SERVICE_ROLE_KEY looks like a live service-role key for a local command.",
        "Use a dummy/local value, or set FS_ALLOW_PROD_SUPABASE=1 for an intentional production operation.",
      ].join(" ")
    );
  }

  return errors;
}
