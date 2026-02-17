import { timingSafeEqual } from "node:crypto";

type EnvLike = Record<string, string | undefined>;

export type DevAuthBypassConfig = {
  token: string;
  email: string;
  password: string;
};

function requireEnvValue(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function splitHeaderValue(value: string | null): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeHostCandidate(value: string): string {
  const candidate = value.trim();
  if (!candidate) return "";

  try {
    return new URL(candidate).hostname.toLowerCase();
  } catch {}

  if (candidate.startsWith("[")) {
    const bracketIndex = candidate.indexOf("]");
    if (bracketIndex > 1) {
      return candidate.slice(1, bracketIndex).toLowerCase();
    }
  }

  const maybeHostWithPort = candidate.toLowerCase();
  const splitByColon = maybeHostWithPort.split(":");
  if (splitByColon.length === 2 && /^\d+$/.test(splitByColon[1])) {
    const bareHost = splitByColon[0];
    if (bareHost.startsWith("::ffff:")) {
      const mappedV4 = bareHost.slice("::ffff:".length);
      if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(mappedV4)) {
        return mappedV4;
      }
    }
    return bareHost;
  }

  if (maybeHostWithPort.startsWith("::ffff:")) {
    const mappedV4 = maybeHostWithPort.slice("::ffff:".length);
    const normalizedMappedV4 = mappedV4.replace(/:\d+$/, "");
    if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(normalizedMappedV4)) {
      return normalizedMappedV4;
    }
  }

  return maybeHostWithPort;
}

function isPrivateOrLoopbackIpv4(hostname: string): boolean {
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) return false;

  const octets = hostname.split(".").map((part) => Number(part));
  if (octets.some((octet) => !Number.isFinite(octet) || octet < 0 || octet > 255)) return false;

  const [a, b] = octets;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

function isPrivateOrLoopbackIpv6(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  if (normalized === "::1" || normalized === "0:0:0:0:0:0:0:1") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // Unique local
  if (normalized.startsWith("fe80:")) return true; // Link-local
  return false;
}

export function isLocalHostOrIp(value: string): boolean {
  const hostname = normalizeHostCandidate(value);
  if (!hostname) return false;

  if (hostname === "localhost" || hostname.endsWith(".localhost")) return true;
  if (isPrivateOrLoopbackIpv4(hostname)) return true;
  if (isPrivateOrLoopbackIpv6(hostname)) return true;
  return false;
}

export function isLocalDevelopmentRequest(request: Request): boolean {
  const hostHeader = splitHeaderValue(request.headers.get("x-forwarded-host"))[0]
    ? splitHeaderValue(request.headers.get("x-forwarded-host"))[0]
    : splitHeaderValue(request.headers.get("host"))[0];

  if (!hostHeader || !isLocalHostOrIp(hostHeader)) {
    return false;
  }

  const originHeader = request.headers.get("origin");
  if (originHeader) {
    try {
      const originHost = new URL(originHeader).hostname;
      if (!isLocalHostOrIp(originHost)) return false;
    } catch {
      return false;
    }
  }

  const forwardedIp = splitHeaderValue(request.headers.get("x-forwarded-for"))[0];
  if (forwardedIp && !isLocalHostOrIp(forwardedIp)) {
    return false;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp && !isLocalHostOrIp(realIp)) {
    return false;
  }

  return true;
}

export function isDevAuthBypassEnabled(env: EnvLike = process.env): boolean {
  return env.NODE_ENV === "development" && env.DEV_AUTH_BYPASS_ENABLED === "1";
}

export function getDevAuthBypassConfig(env: EnvLike = process.env): DevAuthBypassConfig {
  return {
    token: requireEnvValue(env.DEV_AUTH_BYPASS_TOKEN, "DEV_AUTH_BYPASS_TOKEN"),
    email: requireEnvValue(env.DEV_AUTH_BYPASS_EMAIL, "DEV_AUTH_BYPASS_EMAIL").trim().toLowerCase(),
    password: requireEnvValue(env.DEV_AUTH_BYPASS_PASSWORD, "DEV_AUTH_BYPASS_PASSWORD"),
  };
}

export function isDevAuthTokenValid(inputToken: string | null, expectedToken: string): boolean {
  if (!inputToken || !expectedToken) return false;

  const inputBuffer = Buffer.from(inputToken);
  const expectedBuffer = Buffer.from(expectedToken);
  if (inputBuffer.length !== expectedBuffer.length) return false;

  return timingSafeEqual(inputBuffer, expectedBuffer);
}
