#!/usr/bin/env node

import process from "node:process";
import { loadRepoEnv, validateSupabaseEgressGuard } from "./lib/supabase-egress-guard.mjs";

function readArgValue(name, fallback) {
  const index = process.argv.indexOf(name);
  if (index < 0) return fallback;
  return process.argv[index + 1] ?? fallback;
}

const context = readArgValue("--context", "local");
const mode = context === "build" || context === "start" ? "production" : "development";
const env = loadRepoEnv({ mode });
const errors = validateSupabaseEgressGuard(env);

if (errors.length > 0) {
  console.error(`[supabase-egress-guard] Refusing unsafe Supabase configuration for ${context}.`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  console.error(
    "- This guard exists to prevent local/dev/test automation from consuming production Supabase egress or mutating production data."
  );
  process.exit(1);
}

console.log(`[supabase-egress-guard] ${context}: OK`);
