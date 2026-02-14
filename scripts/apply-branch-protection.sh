#!/usr/bin/env bash
set -euo pipefail

BRANCH="${1:-main}"
STATUS_CHECK="${2:-CI / verify}"
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

status_check_escaped="${STATUS_CHECK//\"/\\\"}"

payload=$(
  cat <<JSON
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["${status_check_escaped}"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
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

curl --fail-with-body --silent --show-error \
  -X PUT \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "https://api.github.com/repos/${OWNER}/${REPO}/branches/${BRANCH}/protection" \
  -d "${payload}" >/dev/null

echo "Branch protection applied successfully."
