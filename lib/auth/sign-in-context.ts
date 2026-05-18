export type SignInContextSource = "checkout_success" | "claim_entry";

export type SignInContextKind = "admin" | "checkout" | "claim" | "library" | "generic";

export type SignInContextCopy = {
  kind: SignInContextKind;
  source: SignInContextSource | null;
  title: string;
  description: string;
};

export function getSafeSignInContextSource(
  input: string | null | undefined
): SignInContextSource | null {
  if (input === "checkout_success" || input === "claim_entry") {
    return input;
  }

  return null;
}

function getSafePathname(nextPath: string): string {
  try {
    return new URL(nextPath, "https://freeswimming.local").pathname;
  } catch {
    return "/my-library";
  }
}

export function getSignInContextCopy(
  nextPath: string,
  sourceInput: string | null | undefined
): SignInContextCopy {
  const source = getSafeSignInContextSource(sourceInput);
  const pathname = getSafePathname(nextPath);

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return {
      kind: "admin",
      source,
      title: "Sign in to continue",
      description:
        "Use your email to confirm your identity. Admin access is checked after sign-in, so this step does not grant admin access by itself.",
    };
  }

  if (source === "checkout_success") {
    return {
      kind: "checkout",
      source,
      title: "Sign in to My Library",
      description:
        "Use the same email you used at checkout. We confirm your identity first, then entitlement checks attach any available access to My Library.",
    };
  }

  if (source === "claim_entry") {
    return {
      kind: "claim",
      source,
      title: "Sign in to claim access",
      description:
        "Use the same email you used at checkout. We verify your identity first, then claim checks decide which downloads or library items are available.",
    };
  }

  if (pathname === "/my-library" || pathname.startsWith("/my-library/")) {
    return {
      kind: "library",
      source,
      title: "Sign in to My Library",
      description:
        "After verification, you will return to My Library or the member page you opened.",
    };
  }

  return {
    kind: "generic",
    source,
    title: "Sign in to continue",
    description: "After verification, you will return to the page you opened if it is available.",
  };
}

export function buildAuthCallbackUrl(
  origin: string,
  nextPath: string,
  sourceInput?: string | null
): string {
  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("next", nextPath);

  const source = getSafeSignInContextSource(sourceInput);
  if (source) {
    callbackUrl.searchParams.set("source", source);
  }

  return callbackUrl.toString();
}
