type CookieLike = {
  name: string;
  value?: string | null;
};

const SUPABASE_AUTH_TOKEN_COOKIE_PATTERN = /^sb-[a-z0-9-]+-auth-token(?:\.\d+)?$/i;

export function isSupabaseAuthTokenCookieName(name: string): boolean {
  return SUPABASE_AUTH_TOKEN_COOKIE_PATTERN.test(name);
}

export function hasSupabaseAuthTokenCookie(cookies: Iterable<CookieLike>): boolean {
  for (const cookie of cookies) {
    if (!isSupabaseAuthTokenCookieName(cookie.name)) continue;
    if (typeof cookie.value === "string" && cookie.value.length > 0) return true;
  }

  return false;
}
