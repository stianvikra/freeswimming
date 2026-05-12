#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=/dev/null
source "$(dirname "$0")/lib/bootstrap-node.sh"

require_npm_runtime "[verify-pre-pr]"

bash ./scripts/lib/assert-branch-current-with-base.sh "${VERIFICATION_BASE_REF:-main}"
node ./scripts/assert-supabase-migration-drift.mjs

node ./scripts/verification-scope.mjs --summary
lane="$(node ./scripts/verification-scope.mjs --lane)"

if [ "${lane}" = "docs-only" ]; then
  echo "[verify-pre-pr] Running docs-only verification lane."
  npm run verify:docs-only
else
  echo "[verify-pre-pr] Running full public verification lane."
  bash ./scripts/run-verify-open.sh
fi
