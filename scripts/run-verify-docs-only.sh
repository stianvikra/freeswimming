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
  echo "[verify-docs-only] npm not found. Load Node first (for example with nvm)."
  exit 127
fi

timestamp="$(date +"%Y%m%d-%H%M%S")"
runs_root="artifacts/test-runs"
run_dir="${runs_root}/${timestamp}"
log_file="${run_dir}/verify.log"

mkdir -p "${run_dir}"
printf "%s\n" "docs-only" > "${run_dir}/mode.txt"

echo "[verify-docs-only] Running docs-only verification lane"
echo "[verify-docs-only] Output log: ${log_file}"

status=0
if {
  node ./scripts/verification-scope.mjs --summary --assert-docs-only
  npm run lint:briefs:all
  npm run lint:admin-audit
  npm run lint:env-parity
  npm run lint:pr-body:generated
} 2>&1 | tee "${log_file}"; then
  status=0
else
  status=$?
fi

printf "%s\n" "${status}" > "${run_dir}/exit-code.txt"
ln -sfn "${timestamp}" "${runs_root}/latest"

if [ "${status}" -eq 0 ]; then
  echo "[verify-docs-only] PASS"
else
  echo "[verify-docs-only] FAIL (exit ${status})"
fi

exit "${status}"
