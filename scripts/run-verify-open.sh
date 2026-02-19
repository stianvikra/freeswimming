#!/usr/bin/env bash
set -euo pipefail

timestamp="$(date +"%Y%m%d-%H%M%S")"
runs_root="artifacts/test-runs"
run_dir="${runs_root}/${timestamp}"
log_file="${run_dir}/verify.log"

mkdir -p "${run_dir}"

echo "[verify-open] Running with SITE_LOCK_ENABLED=0"
echo "[verify-open] Output log: ${log_file}"

status=0
if SITE_LOCK_ENABLED=0 npm run verify 2>&1 | tee "${log_file}"; then
  status=0
else
  status=$?
fi

if [ -d "test-results" ]; then
  cp -R "test-results" "${run_dir}/test-results"
fi

if [ -d "playwright-report" ]; then
  cp -R "playwright-report" "${run_dir}/playwright-report"
fi

printf "%s\n" "${status}" > "${run_dir}/exit-code.txt"

ln -sfn "${timestamp}" "${runs_root}/latest"

if [ "${status}" -eq 0 ]; then
  echo "[verify-open] PASS"
else
  echo "[verify-open] FAIL (exit ${status})"
fi

exit "${status}"
