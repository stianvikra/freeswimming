#!/usr/bin/env bash
set -euo pipefail

if ! command -v npm >/dev/null 2>&1; then
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "${NVM_DIR}/nvm.sh" ]; then
    # shellcheck source=/dev/null
    . "${NVM_DIR}/nvm.sh"
    nvm use --silent >/dev/null 2>&1 || true
  fi
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "[verify-pre-pr] npm not found. Load Node first (for example with nvm)."
  exit 127
fi

node ./scripts/verification-scope.mjs --summary
lane="$(node ./scripts/verification-scope.mjs --lane)"

if [ "${lane}" = "docs-only" ]; then
  echo "[verify-pre-pr] Running docs-only verification lane."
  npm run verify:docs-only
else
  echo "[verify-pre-pr] Running full public verification lane."
  bash ./scripts/run-verify-open.sh
fi
