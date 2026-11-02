import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Next 16.4 requires Hooks 7.1, whose compiler analysis exposes existing
    // component patterns. Keep the core Hooks checks while migration is handled in
    // docs/task-briefs/planned/2026-11-02-react-compiler-lint-adoption.md.
    // Other current and future recommended rules remain enabled by the preset.
    name: "freeswimming/react-compiler-migration",
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/purity": "off",
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".next-early-access-qa/**",
    ".next-debug-routes*/**",
    ".next-playwright*/**",
    ".next-playwright/**",
    ".next-playwright-lock/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
