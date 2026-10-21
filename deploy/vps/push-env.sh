#!/usr/bin/env bash
set -euo pipefail

# Copy the production .env files from this machine to the VPS (deploys never touch them).
# Usage: VPS_HOST=177.7.55.46 [VPS_USER=root] [SSH_KEY=~/.ssh/usa-limo-github-deploy] bash deploy/vps/push-env.sh

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
VPS_HOST="${VPS_HOST:?Set VPS_HOST, e.g. VPS_HOST=177.7.55.46}"
VPS_USER="${VPS_USER:-root}"
INSTALL_DIR="${INSTALL_DIR:-/opt/usa-limousine-corporation}"
SSH_OPTS=()
if [[ -n "${SSH_KEY:-}" ]]; then
  SSH_OPTS=(-i "${SSH_KEY}")
fi

FILES=(apps/backend/.env.production apps/admin/.env.production apps/customer/.env.production)

for file in "${FILES[@]}"; do
  if [[ ! -f "${ROOT}/${file}" ]]; then
    echo "Missing ${ROOT}/${file}"
    exit 1
  fi
done

ssh "${SSH_OPTS[@]}" "${VPS_USER}@${VPS_HOST}" \
  "mkdir -p ${INSTALL_DIR}/apps/backend ${INSTALL_DIR}/apps/admin ${INSTALL_DIR}/apps/customer"

for file in "${FILES[@]}"; do
  scp "${SSH_OPTS[@]}" "${ROOT}/${file}" "${VPS_USER}@${VPS_HOST}:${INSTALL_DIR}/${file}"
  ssh "${SSH_OPTS[@]}" "${VPS_USER}@${VPS_HOST}" "chmod 600 ${INSTALL_DIR}/${file}"
  echo "Copied ${file}"
done

echo "Env files are on ${VPS_HOST}. Redeploy to apply: Actions → Deploy → Run workflow (scope: all)."
