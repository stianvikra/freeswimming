import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type PasskeyFactorStatus = "verified" | "unverified";

export type PasskeyFactorSummary = {
  id: string;
  friendlyName: string | null;
  status: PasskeyFactorStatus;
  createdAt: string | null;
  lastChallengedAt: string | null;
};

export type PasskeySecuritySnapshot = {
  currentLevel: "aal1" | "aal2" | null;
  nextLevel: "aal1" | "aal2" | null;
  passkeys: PasskeyFactorSummary[];
};

type PasskeyErrorLike = {
  code?: string | null;
  name?: string | null;
  message?: string | null;
};

type BrowserPasskeySupport = {
  supported: boolean;
  detail: string;
};

const PASSKEY_SERVER_ONLY_SUPPORT: BrowserPasskeySupport = {
  supported: false,
  detail: "Passkeys can only be checked in a browser session.",
};

const PASSKEY_INSECURE_CONTEXT_SUPPORT: BrowserPasskeySupport = {
  supported: false,
  detail: "Passkeys require a secure browser context.",
};

const PASSKEY_BROWSER_UNSUPPORTED_SUPPORT: BrowserPasskeySupport = {
  supported: false,
  detail: "This browser does not expose WebAuthn/passkey support.",
};

const PASSKEY_BROWSER_SUPPORTED_SUPPORT: BrowserPasskeySupport = {
  supported: true,
  detail: "This browser can attempt passkey setup and verification.",
};

type FactorRow = {
  id: string;
  factor_type?: string | null;
  friendly_name?: string | null;
  status: PasskeyFactorStatus;
  created_at?: string | null;
  last_challenged_at?: string | null;
};

export function getBrowserPasskeySupport(): BrowserPasskeySupport {
  if (typeof window === "undefined") {
    return PASSKEY_SERVER_ONLY_SUPPORT;
  }

  if (!window.isSecureContext) {
    return PASSKEY_INSECURE_CONTEXT_SUPPORT;
  }

  if (typeof window.PublicKeyCredential === "undefined") {
    return PASSKEY_BROWSER_UNSUPPORTED_SUPPORT;
  }

  return PASSKEY_BROWSER_SUPPORTED_SUPPORT;
}

export function buildDefaultPasskeyFriendlyName(): string {
  if (typeof navigator === "undefined") return "This device";

  const userAgent = navigator.userAgent;
  if (userAgent.includes("iPhone")) return "iPhone";
  if (userAgent.includes("iPad")) return "iPad";
  if (userAgent.includes("Mac")) return "Mac";
  if (userAgent.includes("Android")) return "Android device";
  if (userAgent.includes("Windows")) return "Windows device";
  return "This device";
}

export function getPasskeyErrorMessage(error: PasskeyErrorLike | null | undefined): string {
  const code = error?.code?.trim().toLowerCase() ?? "";
  const name = error?.name?.trim() ?? "";
  const message = error?.message?.trim() ?? "";
  const lowerMessage = message.toLowerCase();

  if (code === "mfa_webauthn_enroll_not_enabled" || code === "mfa_webauthn_verify_not_enabled") {
    return "Passkeys are not enabled in this Supabase environment yet.";
  }

  if (code === "mfa_factor_not_found") {
    return "That passkey could not be found anymore. Refresh and try again.";
  }

  if (code === "insufficient_aal") {
    return "Verify a passkey in this session before changing that passkey.";
  }

  if (code === "mfa_verified_factor_exists") {
    return "A passkey with this label already exists. Use a more specific device name.";
  }

  if (name === "NotAllowedError" || lowerMessage.includes("notallowederror")) {
    return "Passkey request was cancelled or not approved on this device.";
  }

  if (name === "AbortError" || lowerMessage.includes("aborterror")) {
    return "Passkey request was interrupted before it completed.";
  }

  if (name === "InvalidStateError" || lowerMessage.includes("invalidstateerror")) {
    return "This device says the selected passkey is already registered.";
  }

  if (name === "SecurityError" || lowerMessage.includes("securityerror")) {
    return "This browser blocked the passkey request for security reasons.";
  }

  if (message) {
    return message;
  }

  return "Passkey action could not be completed right now.";
}

export async function loadPasskeySecuritySnapshot(supabase: SupabaseClient<Database>): Promise<
  | {
      ok: true;
      snapshot: PasskeySecuritySnapshot;
    }
  | {
      ok: false;
      error: string;
    }
> {
  const [factorsResult, assuranceResult] = await Promise.all([
    supabase.auth.mfa.listFactors(),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);

  if (factorsResult.error) {
    return { ok: false, error: getPasskeyErrorMessage(factorsResult.error) };
  }

  if (assuranceResult.error) {
    return { ok: false, error: getPasskeyErrorMessage(assuranceResult.error) };
  }

  const passkeys = ((factorsResult.data?.all ?? []) as FactorRow[])
    .filter((factor) => factor.factor_type === "webauthn")
    .filter((factor) => factor.status === "verified" || factor.status === "unverified")
    .filter((factor) => "id" in factor)
    .map((factor) => ({
      id: factor.id,
      friendlyName: factor.friendly_name?.trim() || null,
      status: factor.status,
      createdAt: factor.created_at ?? null,
      lastChallengedAt: factor.last_challenged_at ?? null,
    }));

  return {
    ok: true,
    snapshot: {
      currentLevel: assuranceResult.data?.currentLevel ?? null,
      nextLevel: assuranceResult.data?.nextLevel ?? null,
      passkeys,
    },
  };
}
