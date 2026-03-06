type ResolveQrRedirectAllowedHostsOptions = {
  rawAllowlist?: string | undefined;
  requestHostname: string;
};

export type QrRedirectDestinationValidationResult =
  | {
      ok: true;
      destinationUrl: string;
      destinationHost: string;
    }
  | {
      ok: false;
      reason: "invalid_url" | "invalid_protocol" | "credentials_not_allowed" | "disallowed_host";
    };

const DEFAULT_ALLOWED_HOSTS = ["freeswimming.org", "www.freeswimming.org"];

function normalizeHostnameCandidate(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    const hostname = parsed.hostname.trim().toLowerCase();
    if (!hostname) return null;
    if (!/^[a-z0-9.-]+$/.test(hostname)) return null;
    return hostname;
  } catch {
    return null;
  }
}

export function resolveQrRedirectAllowedHosts(
  options: ResolveQrRedirectAllowedHostsOptions
): Set<string> {
  const hosts = new Set<string>();

  for (const defaultHost of DEFAULT_ALLOWED_HOSTS) {
    hosts.add(defaultHost);
  }

  const requestHost = normalizeHostnameCandidate(options.requestHostname);
  if (requestHost) {
    hosts.add(requestHost);
  }

  const candidates = (options.rawAllowlist ?? "")
    .split(",")
    .map((value) => normalizeHostnameCandidate(value))
    .filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    hosts.add(candidate);
  }

  return hosts;
}

export function validateQrRedirectDestination(
  value: string,
  options: {
    allowedHosts: Set<string>;
  }
): QrRedirectDestinationValidationResult {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return { ok: false, reason: "invalid_url" };
  }

  if (parsed.protocol !== "https:") {
    return { ok: false, reason: "invalid_protocol" };
  }

  if (parsed.username || parsed.password) {
    return { ok: false, reason: "credentials_not_allowed" };
  }

  const destinationHost = parsed.hostname.toLowerCase();
  if (!options.allowedHosts.has(destinationHost)) {
    return { ok: false, reason: "disallowed_host" };
  }

  return {
    ok: true,
    destinationUrl: parsed.toString(),
    destinationHost,
  };
}
