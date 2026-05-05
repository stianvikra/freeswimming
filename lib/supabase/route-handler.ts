import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Database } from "@/types/database";
import { hasSupabaseAuthTokenCookie } from "@/lib/supabase/auth-cookie";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

type CookieStore = Awaited<ReturnType<typeof cookies>>;
type CookieSetOptions = Parameters<CookieStore["set"]>[2];
type PendingCookie = {
  name: string;
  value: string;
  options?: CookieSetOptions;
};

function createRouteHandlerSupabaseClientFromCookieStore(cookieStore: CookieStore) {
  const pendingCookies: PendingCookie[] = [];

  const supabase = createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          pendingCookies.push({ name, value, options });
          try {
            cookieStore.set(name, value, options);
          } catch {}
        });
      },
    },
  });

  const applySupabaseCookies = <T extends NextResponse>(response: T): T => {
    pendingCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });

    return response;
  };

  return { supabase, applySupabaseCookies };
}

export async function createRouteHandlerSupabaseClient() {
  const cookieStore = await cookies();
  return createRouteHandlerSupabaseClientFromCookieStore(cookieStore);
}

export async function createRouteHandlerSupabaseClientIfAuthCookiePresent() {
  const cookieStore = await cookies();
  if (!hasSupabaseAuthTokenCookie(cookieStore.getAll())) return null;

  return createRouteHandlerSupabaseClientFromCookieStore(cookieStore);
}
