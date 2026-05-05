import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { hasSupabaseAuthTokenCookie } from "@/lib/supabase/auth-cookie";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

function createServerSupabaseClientFromCookieStore(cookieStore: CookieStore) {
  return createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server components cannot always write cookies directly.
          // Middleware and route handlers handle session cookie refresh.
        }
      },
    },
  });
}

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerSupabaseClientFromCookieStore(cookieStore);
}

export async function createServerSupabaseClientIfAuthCookiePresent() {
  const cookieStore = await cookies();
  if (!hasSupabaseAuthTokenCookie(cookieStore.getAll())) return null;

  return createServerSupabaseClientFromCookieStore(cookieStore);
}

export async function getServerSupabaseUserIfAuthCookiePresent() {
  const supabase = await createServerSupabaseClientIfAuthCookiePresent();
  if (!supabase) {
    return {
      supabase: null,
      user: null,
      error: null,
      hasAuthCookie: false,
    };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return {
    supabase,
    user: user ?? null,
    error,
    hasAuthCookie: true,
  };
}
