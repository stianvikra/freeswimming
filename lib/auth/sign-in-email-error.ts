export type SignInEmailErrorKind =
  | "rate_limited"
  | "service_restricted"
  | "email_delivery"
  | "unknown";

type SignInEmailErrorInput = {
  message?: unknown;
  status?: unknown;
  code?: unknown;
};

export type SignInEmailErrorClassification = {
  kind: SignInEmailErrorKind;
  userMessage: string;
};

export const SIGN_IN_SERVICE_RESTRICTED_MESSAGE =
  "Sign-in is temporarily unavailable because a service limit was reached. Please try again later.";

export const SIGN_IN_EMAIL_DELIVERY_MESSAGE =
  "Email code could not be sent right now. Please try again later.";

export const SIGN_IN_UNKNOWN_EMAIL_ERROR_MESSAGE =
  "Could not send sign-in email right now. Please try again.";

function normalizeLowerText(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeStatus(value: unknown): number | null {
  const status = typeof value === "number" ? value : Number(value);
  return Number.isFinite(status) ? status : null;
}

export function classifySignInEmailError(
  error: SignInEmailErrorInput
): SignInEmailErrorClassification {
  const message = normalizeLowerText(error.message);
  const code = normalizeLowerText(error.code);
  const status = normalizeStatus(error.status);

  if (status === 429 || message.includes("rate limit") || code.includes("rate_limit")) {
    return {
      kind: "rate_limited",
      userMessage: "Please wait about a minute before requesting a new login code.",
    };
  }

  if (
    status === 402 ||
    message.includes("exceed_egress_quota") ||
    message.includes("service for this project is restricted") ||
    message.includes("fair use")
  ) {
    return {
      kind: "service_restricted",
      userMessage: SIGN_IN_SERVICE_RESTRICTED_MESSAGE,
    };
  }

  if (
    message.includes("smtp") ||
    message.includes("email provider") ||
    message.includes("email rate") ||
    code.includes("email")
  ) {
    return {
      kind: "email_delivery",
      userMessage: SIGN_IN_EMAIL_DELIVERY_MESSAGE,
    };
  }

  return {
    kind: "unknown",
    userMessage: SIGN_IN_UNKNOWN_EMAIL_ERROR_MESSAGE,
  };
}
