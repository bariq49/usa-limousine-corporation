#!/usr/bin/env bash
set -euo pipefail

# Post-deploy smokes over the Compose network (does not need public DNS).
# DEPLOY_SERVICES: space-separated subset, or empty/"all" to check everything.

DEPLOY_SERVICES="${DEPLOY_SERVICES:-all}"

from_caddy() {
  local url="$1"
  docker exec usa-limousine-corporation-caddy-1 wget -qO- --timeout=10 "${url}" >/dev/null
}

should_check() {
  local service="$1"
  if [[ "${DEPLOY_SERVICES}" == "all" ]]; then
    return 0
  fi
  local token
  for token in ${DEPLOY_SERVICES}; do
    if [[ "${token}" == "${service}" ]]; then
      return 0
    fi
    if [[ "${token}" == "dashboards" && ( "${service}" == "admin" || "${service}" == "customer" ) ]]; then
      return 0
    fi
  done
  return 1
}

# API must stay up for any deploy (dashboards depend on it).
curl -fsS http://127.0.0.1:3000/api/v1/health >/dev/null
from_caddy http://backend:3000/api/v1/health

checked=("api")

if should_check admin; then
  from_caddy http://admin:3001/auth/login
  checked+=("admin")
fi
if should_check customer; then
  from_caddy http://customer:3002/auth/login
  checked+=("customer")
fi
if should_check website; then
  from_caddy http://website:3003/
  checked+=("website")
fi

echo "Smoke OK: ${checked[*]}"
