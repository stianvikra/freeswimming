#!/usr/bin/env bash

bootstrap_node_runtime() {
  if command -v node >/dev/null 2>&1; then
    return 0
  fi

  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "${NVM_DIR}/nvm.sh" ]; then
    # shellcheck source=/dev/null
    . "${NVM_DIR}/nvm.sh"
    nvm use --silent >/dev/null 2>&1 || nvm use --silent default >/dev/null 2>&1 || true
  fi
}

bootstrap_npm_runtime() {
  if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
    return 0
  fi

  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [ -s "${NVM_DIR}/nvm.sh" ]; then
    # shellcheck source=/dev/null
    . "${NVM_DIR}/nvm.sh"
    nvm use --silent >/dev/null 2>&1 || nvm use --silent default >/dev/null 2>&1 || true
  fi
}

require_node_runtime() {
  local prefix="${1:-[node-bootstrap]}"

  bootstrap_node_runtime
  if ! command -v node >/dev/null 2>&1; then
    echo "${prefix} node not found after repo bootstrap. Run \`nvm use --silent default\` (or load the repo Node LTS) and rerun." >&2
    return 127
  fi
}

require_npm_runtime() {
  local prefix="${1:-[node-bootstrap]}"

  bootstrap_npm_runtime
  if ! command -v node >/dev/null 2>&1; then
    echo "${prefix} node not found after repo bootstrap. Run \`nvm use --silent default\` (or load the repo Node LTS) and rerun." >&2
    return 127
  fi
  if ! command -v npm >/dev/null 2>&1; then
    echo "${prefix} npm not found after repo bootstrap. Run \`nvm use --silent default\` (or load the repo Node LTS) and rerun." >&2
    return 127
  fi
}
