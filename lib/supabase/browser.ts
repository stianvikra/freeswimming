"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getBrowserSupabaseAnonKey, getBrowserSupabaseUrl } from "@/lib/supabase/browser-env";

export function createBrowserSupabaseClient() {
  return createBrowserClient<Database>(getBrowserSupabaseUrl(), getBrowserSupabaseAnonKey());
}
