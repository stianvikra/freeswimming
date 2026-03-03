#!/usr/bin/env bash
set -euo pipefail

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
  if [ -z "${PW_SITE_LOCK_PASSWORD:-}" ] && [ -z "${PW_SITE_LOCK_BYPASS_TOKEN:-}" ]; then
    echo "[verify-pre-merge] SITE_LOCK_ENABLED=1 but no private-gate unlock test credential was provided."
    echo "[verify-pre-merge] Export PW_SITE_LOCK_PASSWORD (preferred) or PW_SITE_LOCK_BYPASS_TOKEN and rerun."
    exit 1
  fi

  if [ -n "${PW_SITE_LOCK_BYPASS_TOKEN:-}" ] && [ -z "${PW_SITE_LOCK_PASSWORD:-}" ]; then
    echo "[verify-pre-merge] Step 2/2 will use PW_SITE_LOCK_BYPASS_TOKEN (password unlock path is not covered in this run)."
  fi

  echo "[verify-pre-merge] Step 2/2: Private-gate regression"
  SITE_LOCK_ENABLED=1 npm run test:e2e:private-gate
else
  echo "[verify-pre-merge] Step 2/2: Skipped private-gate regression (SITE_LOCK_ENABLED!=1)."
  echo "[verify-pre-merge] If target environment is private-gated, rerun with SITE_LOCK_ENABLED=1 and PW_SITE_LOCK_PASSWORD or PW_SITE_LOCK_BYPASS_TOKEN set."
fi


echo "[verify-pre-merge] PASS"
