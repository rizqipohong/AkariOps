#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"
NODE_DIR="${AKARIOPS_NODE_DIR:-${NARUHINA_NODE_DIR:-$HOME/.nvm/versions/node/v20.19.1/bin}}"

if [ -x "$NODE_DIR/node" ] && [ -x "$NODE_DIR/npm" ]; then
  export PATH="$NODE_DIR:$PATH"
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed or not found in PATH." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is not installed or not found in PATH." >&2
  exit 1
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "Node.js 20 or newer is required to run AkariOps." >&2
  echo "Current node: $(node -v)" >&2
  echo "Set AKARIOPS_NODE_DIR to a Node 20 bin path if needed." >&2
  exit 1
fi

cd "$PROJECT_ROOT"
exec "$@"
