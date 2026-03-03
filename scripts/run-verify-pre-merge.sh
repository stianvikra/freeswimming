#!/usr/bin/env bash
set -euo pipefail

read_env_file_value() {
  local key="$1"
  local file="$2"
  local raw

  [ -f "$file" ] || return 1

  raw="$(grep -E "^${key}=" "$file" | tail -n1 | cut -d= -f2- || true)"
  [ -n "$raw" ] || return 1

  # Trim matching single/double quotes if present.
  if [[ "$raw" =~ ^\".*\"$ ]]; then
    raw="${raw:1:${#raw}-2}"
  elif [[ "$raw" =~ ^\'.*\'$ ]]; then
    raw="${raw:1:${#raw}-2}"
  fi

  printf '%s' "$raw"
}

# Ensure npm is available (best-effort nvm bootstrap)
if ! command -v npm >/dev/null 2>&1; then
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "${NVM_DIR}/nvm.sh" ]; then
    # shellcheck source=/dev/null
    . "${NVM_DIR}/nvm.sh"
    nvm use --silent >/dev/null 2>&1 || true
  fi
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "[verify-pre-merge] npm not found. Load Node first (for example with nvm)."
  exit 127
fi

echo "[verify-pre-merge] Step 1/2: Public-mode full verification"
SITE_LOCK_ENABLED=0 npm run verify

if [ "${SITE_LOCK_ENABLED:-0}" = "1" ]; then
  # Automation default: wire private-gate bypass token with zero manual setup when available.
  if [ -z "${PW_SITE_LOCK_BYPASS_TOKEN:-}" ]; then
    if [ -n "${SITE_LOCK_BYPASS_TOKEN:-}" ]; then
      export PW_SITE_LOCK_BYPASS_TOKEN="${SITE_LOCK_BYPASS_TOKEN}"
      echo "[verify-pre-merge] Auto-wired PW_SITE_LOCK_BYPASS_TOKEN from SITE_LOCK_BYPASS_TOKEN."
    else
      env_local_token="$(read_env_file_value "SITE_LOCK_BYPASS_TOKEN" ".env.local" || true)"
      if [ -n "${env_local_token:-}" ]; then
        export PW_SITE_LOCK_BYPASS_TOKEN="${env_local_token}"
        echo "[verify-pre-merge] Auto-wired PW_SITE_LOCK_BYPASS_TOKEN from .env.local."
      fi
    fi
  fi

  if [ -z "${PW_SITE_LOCK_PASSWORD:-}" ] && [ -z "${PW_SITE_LOCK_BYPASS_TOKEN:-}" ]; then
    echo "[verify-pre-merge] SITE_LOCK_ENABLED=1 but no private-gate unlock test credential was provided."
    echo "[verify-pre-merge] Export PW_SITE_LOCK_PASSWORD (preferred) or PW_SITE_LOCK_BYPASS_TOKEN and rerun."
    exit 1
  fi

  if [ "${PW_SITE_LOCK_USE_PASSWORD:-0}" = "1" ] && [ -z "${PW_SITE_LOCK_PASSWORD:-}" ]; then
    echo "[verify-pre-merge] PW_SITE_LOCK_USE_PASSWORD=1 requires PW_SITE_LOCK_PASSWORD."
    exit 1
  fi

  if [ -n "${PW_SITE_LOCK_BYPASS_TOKEN:-}" ] && [ "${PW_SITE_LOCK_USE_PASSWORD:-0}" != "1" ]; then
    echo "[verify-pre-merge] Step 2/2 uses bypass-token mode by default (set PW_SITE_LOCK_USE_PASSWORD=1 to force form-unlock path)."
  elif [ -n "${PW_SITE_LOCK_PASSWORD:-}" ]; then
    echo "[verify-pre-merge] Step 2/2 uses password form-unlock mode."
  fi

  echo "[verify-pre-merge] Step 2/2: Private-gate regression"
  SITE_LOCK_ENABLED=1 npm run test:e2e:private-gate
else
  echo "[verify-pre-merge] Step 2/2: Skipped private-gate regression (SITE_LOCK_ENABLED!=1)."
  echo "[verify-pre-merge] If target environment is private-gated, rerun with SITE_LOCK_ENABLED=1 and PW_SITE_LOCK_PASSWORD or PW_SITE_LOCK_BYPASS_TOKEN set."
fi


echo "[verify-pre-merge] PASS"
