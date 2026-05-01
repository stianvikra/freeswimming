#!/usr/bin/env bash
set -euo pipefail

prefix="${ASSERT_BRANCH_CURRENT_PREFIX:-[branch-current]}"
remote="${ASSERT_BRANCH_CURRENT_REMOTE:-origin}"
base_branch="${1:-${VERIFICATION_BASE_REF:-main}}"
base_branch="${base_branch#${remote}/}"
base_ref="${remote}/${base_branch}"

fail() {
  echo "${prefix} FAIL: $*" >&2
  exit 1
}

if [ "${ASSERT_BRANCH_CURRENT_TEST_BYPASS:-0}" = "1" ]; then
  if [ "${NODE_ENV:-}" = "test" ] || [ -n "${VITEST:-}" ] || [ -n "${VITEST_WORKER_ID:-}" ]; then
    echo "${prefix} SKIP: test bypass enabled for branch-current assertion." >&2
    exit 0
  fi

  fail "test bypass was requested outside a test environment."
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  fail "not inside a git worktree."
fi

branch="$(git branch --show-current 2>/dev/null || true)"
if [ -z "${branch}" ]; then
  fail "detached HEAD is not supported for local PR gates. Check out a feature branch and rerun."
fi

if ! git fetch --quiet "${remote}" "${base_branch}"; then
  fail "could not fetch ${base_ref}. Run \`git fetch ${remote} ${base_branch}\` and rerun."
fi

if ! git rev-parse --verify --quiet "${base_ref}" >/dev/null; then
  fail "could not resolve ${base_ref} after fetch."
fi

if git merge-base --is-ancestor "${base_ref}" HEAD; then
  base_short="$(git rev-parse --short "${base_ref}")"
  head_short="$(git rev-parse --short HEAD)"
  echo "${prefix} PASS: ${branch} contains ${base_ref} (${base_short}); HEAD ${head_short} is current with base." >&2
  exit 0
fi

echo "${prefix} FAIL: ${branch} is out-of-date with ${base_ref}." >&2
echo "${prefix} Missing base commit(s):" >&2
git log --oneline --max-count=8 "HEAD..${base_ref}" >&2 || true
echo "${prefix} Update before continuing:" >&2
echo "${prefix}   git fetch ${remote} ${base_branch} && git rebase ${base_ref}" >&2
echo "${prefix} Then rerun the same gate or PR command." >&2
exit 1
