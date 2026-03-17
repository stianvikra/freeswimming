#!/usr/bin/env bash

# Resolve a usable GitHub CLI binary for local repo tooling.
# Order:
# 1. GH_BIN override (mainly for tests/debug),
# 2. current PATH,
# 3. common macOS Homebrew install paths,
# 4. optional GH_FALLBACK_PATHS colon-separated overrides.

resolve_gh_bin() {
  if [ -n "${GH_BIN:-}" ] && [ -x "${GH_BIN}" ]; then
    printf "%s\n" "${GH_BIN}"
    return 0
  fi

  if command -v gh >/dev/null 2>&1; then
    command -v gh
    return 0
  fi

  local candidate=""
  local fallback_paths="${GH_FALLBACK_PATHS:-/opt/homebrew/bin/gh:/usr/local/bin/gh}"
  local previous_ifs="${IFS}"
  IFS=":"

  for candidate in ${fallback_paths}; do
    if [ -n "${candidate}" ] && [ -x "${candidate}" ]; then
      IFS="${previous_ifs}"
      printf "%s\n" "${candidate}"
      return 0
    fi
  done

  IFS="${previous_ifs}"
  return 1
}

gh_cli_is_authenticated() {
  local gh_bin="${1:-}"
  if [ -z "${gh_bin}" ]; then
    return 1
  fi

  "${gh_bin}" auth status >/dev/null 2>&1
}
