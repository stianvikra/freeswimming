#!/usr/bin/env bash
set -euo pipefail

echo "[pre-merge-gate] Step 1/2: Run local pre-merge verification"
npm run verify:pre-merge

echo "[pre-merge-gate] Step 2/2: Refresh PR body with latest pre-merge evidence"
npm run pr:create:safari -- --refresh-body

echo "[pre-merge-gate] PASS"
