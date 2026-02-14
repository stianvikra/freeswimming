#!/usr/bin/env bash
set -euo pipefail

if [[ $# -gt 0 ]]; then
  BRANCH="$1"
  shift
else
  BRANCH="main"
fi

DEFAULT_CHECKS=(
  "CI / verify"
  "CodeQL / Analyze (javascript-typescript)"
  "PR Size / size-check"
)

if [[ $# -gt 0 ]]; then
  REQUIRED_CHECKS=("$@")
else
  REQUIRED_CHECKS=("${DEFAULT_CHECKS[@]}")
fi

TOKEN="${GITHUB_TOKEN:-${GH_TOKEN:-}}"

if [[ -z "${TOKEN}" ]]; then
  echo "Missing token. Set GITHUB_TOKEN or GH_TOKEN with repo admin scope."
  exit 1
fi

origin_url="$(git remote get-url origin)"

if [[ "${origin_url}" =~ github\.com[:/]([^/]+)/([^/.]+)(\.git)?$ ]]; then
  OWNER="${BASH_REMATCH[1]}"
  REPO="${BASH_REMATCH[2]}"
else
  echo "Could not parse GitHub owner/repo from origin URL: ${origin_url}"
  exit 1
fi

json_escape() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  value="${value//$'\n'/\\n}"
  printf '%s' "${value}"
}

contexts_json=""
for check in "${REQUIRED_CHECKS[@]}"; do
  escaped="$(json_escape "${check}")"
  if [[ -n "${contexts_json}" ]]; then
    contexts_json+=", "
  fi
  contexts_json+="\"${escaped}\""
done

payload=$(
  cat <<JSON
{
  "required_status_checks": {
    "strict": true,
    "contexts": [${contexts_json}]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "required_approving_review_count": 1,
    "require_last_push_approval": false
  },
  "required_conversation_resolution": true,
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_linear_history": true,
  "lock_branch": false,
  "allow_fork_syncing": true
}
JSON
)

echo "Applying protection to ${OWNER}/${REPO} branch ${BRANCH} ..."
echo "Required checks: ${REQUIRED_CHECKS[*]}"

curl --fail-with-body --silent --show-error \
  -X PUT \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "https://api.github.com/repos/${OWNER}/${REPO}/branches/${BRANCH}/protection" \
  -d "${payload}" >/dev/null

echo "Branch protection applied successfully."
