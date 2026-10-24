#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE_DIR="${ROOT}/deploy/vps"
BACKEND_ENV="${ROOT}/apps/backend/.env.production"
ADMIN_ENV="${ROOT}/apps/admin/.env.production"
CUSTOMER_ENV="${ROOT}/apps/customer/.env.production"
WEBSITE_ENV="${ROOT}/apps/website/.env.production"
SKIP_GIT_PULL="${SKIP_GIT_PULL:-1}"
BRANCH="${DEPLOY_BRANCH:-main}"
# Space-separated compose services, or "all" (default).
DEPLOY_SERVICES="${DEPLOY_SERVICES:-all}"
RECREATE_CADDY="${RECREATE_CADDY:-1}"
# Backend start runs `prisma migrate deploy`, so back up Postgres first (outside the rsync target).
BACKUP_BEFORE_DEPLOY="${BACKUP_BEFORE_DEPLOY:-1}"
BACKUP_DIR="${BACKUP_DIR:-/opt/usa-limousine-corporation-backups}"
BACKUP_KEEP="${BACKUP_KEEP:-10}"
POSTGRES_CONTAINER="usa-limousine-corporation-postgres-1"

ALL_APPS=(backend admin customer website)

# Compose file references every app env_file; all must exist even for a partial deploy.
require_env_files() {
  local env_file
  for env_file in "${BACKEND_ENV}" "${ADMIN_ENV}" "${CUSTOMER_ENV}" "${WEBSITE_ENV}"; do
    if [[ ! -f "${env_file}" ]]; then
      echo "Missing ${env_file}"
      echo "Create it locally (see sibling .env / .env.example), or on the VPS at /opt/usa-limousine-corporation/..."
      echo "This script is meant to run on the VPS after GitHub Actions rsync — not against /opt/usa-limousine-corporation on your laptop."
      exit 1
    fi
  done
}

require_env_files

if [[ "${SKIP_GIT_PULL}" != "1" && -d "${ROOT}/.git" ]]; then
  git -C "${ROOT}" fetch origin "${BRANCH}"
  git -C "${ROOT}" checkout "${BRANCH}"
  git -C "${ROOT}" pull --ff-only origin "${BRANCH}"
fi

compose() {
  docker compose --env-file "${BACKEND_ENV}" --env-file "${ADMIN_ENV}" --env-file "${CUSTOMER_ENV}" --env-file "${WEBSITE_ENV}" "$@"
}

resolve_services() {
  local raw token
  SERVICES=()
  if [[ "${DEPLOY_SERVICES}" == "all" ]]; then
    SERVICES=("${ALL_APPS[@]}")
    return
  fi

  for token in ${DEPLOY_SERVICES}; do
    case "${token}" in
      backend | admin | customer | website)
        SERVICES+=("${token}")
        ;;
      dashboards)
        SERVICES+=(admin customer)
        ;;
      *)
        echo "Unknown deploy service: ${token}"
        exit 1
        ;;
    esac
  done

  # Deduplicate while preserving order
  local -A seen=()
  local unique=()
  for token in "${SERVICES[@]}"; do
    if [[ -z "${seen[${token}]+x}" ]]; then
      seen["${token}"]=1
      unique+=("${token}")
    fi
  done
  SERVICES=("${unique[@]}")

  if [[ "${#SERVICES[@]}" -eq 0 ]]; then
    echo "No services selected for deploy."
    exit 1
  fi
}

image_name() {
  echo "usa-limousine-corporation-${1}"
}

container_name() {
  echo "usa-limousine-corporation-${1}-1"
}

tag_previous() {
  local service image
  for service in "${SERVICES[@]}"; do
    image="$(image_name "${service}")"
    if docker image inspect "${image}:latest" >/dev/null 2>&1; then
      docker tag "${image}:latest" "${image}:previous"
    fi
  done
}

rollback() {
  echo "Health check failed — rolling back rebuilt services: ${SERVICES[*]}"
  local service image
  for service in "${SERVICES[@]}"; do
    image="$(image_name "${service}")"
    if docker image inspect "${image}:previous" >/dev/null 2>&1; then
      docker tag "${image}:previous" "${image}:latest"
    fi
  done
  cd "${COMPOSE_DIR}"
  compose up -d --no-build "${SERVICES[@]}"
}

container_healthy() {
  local name="$1"
  local status
  status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{end}}' "${name}" 2>/dev/null || true)"
  [[ "${status}" == "healthy" ]]
}

wait_healthy() {
  local i service
  for i in $(seq 1 60); do
    local ok=1
    if ! curl -fsS http://127.0.0.1:3000/api/v1/health >/dev/null 2>&1; then
      ok=0
    fi
    for service in "${SERVICES[@]}"; do
      if [[ "${service}" == "backend" ]]; then
        continue
      fi
      if ! container_healthy "$(container_name "${service}")"; then
        ok=0
      fi
    done
    if [[ "${ok}" -eq 1 ]]; then
      return 0
    fi
    sleep 3
  done
  return 1
}

dump_service_logs() {
  local service="$1"
  local name
  name="$(container_name "${service}")"
  if docker ps -a --format '{{.Names}}' | grep -qx "${name}"; then
    echo "=== ${service} logs (${name}, last 200 lines) ==="
    docker logs --tail 200 "${name}" 2>&1 || true
  fi
}

# gzip'd pg_dump; aborts the deploy (set -e + pipefail) if the dump fails.
backup_database() {
  if ! docker ps --format '{{.Names}}' | grep -qx "${POSTGRES_CONTAINER}"; then
    echo "Postgres is not running yet (first deploy?) — skipping database backup."
    return 0
  fi

  mkdir -p "${BACKUP_DIR}"
  chmod 700 "${BACKUP_DIR}"
  local file
  file="${BACKUP_DIR}/db-$(date -u +%Y%m%dT%H%M%SZ).sql.gz"
  docker exec "${POSTGRES_CONTAINER}" sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-privileges' | gzip > "${file}"
  echo "Database backup: ${file} ($(du -h "${file}" | cut -f1))"

  # Keep the newest BACKUP_KEEP dumps.
  ls -1t "${BACKUP_DIR}"/db-*.sql.gz | tail -n +"$((BACKUP_KEEP + 1))" | xargs -r rm --
}

resolve_services
echo "Deploying services: ${SERVICES[*]}"

if [[ " ${SERVICES[*]} " == *" backend "* ]]; then
  if ! grep -q '^FIREBASE_PROJECT_ID=.' "${BACKEND_ENV}"; then
    echo "WARN: FIREBASE_PROJECT_ID is missing in ${BACKEND_ENV} — FCM will show not_configured on /health"
    echo "      Add FIREBASE_* to apps/backend/.env.production on the VPS (deploy does not rsync .env files)."
  fi
  if ! grep -q '^TWILIO_ACCOUNT_SID=.' "${BACKEND_ENV}"; then
    echo "WARN: TWILIO_ACCOUNT_SID is missing in ${BACKEND_ENV} — SMS will show not_configured on /health"
    echo "      Add TWILIO_* to apps/backend/.env.production on the VPS (deploy does not rsync .env files)."
  fi
fi

if [[ " ${SERVICES[*]} " == *" admin "* ]]; then
  if ! grep -q '^NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=.' "${ADMIN_ENV}"; then
    echo "WARN: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing in ${ADMIN_ENV} — admin maps will fail"
    echo "      Add it to apps/admin/.env.production on the VPS, then redeploy admin (deploy does not rsync .env files)."
  fi
fi

if [[ " ${SERVICES[*]} " == *" backend "* && "${BACKUP_BEFORE_DEPLOY}" == "1" ]]; then
  backup_database
fi

cd "${ROOT}"
tag_previous
cd "${COMPOSE_DIR}"

compose up -d postgres redis
compose up -d --build "${SERVICES[@]}"
compose ps

if ! wait_healthy; then
  echo "Health check failed after deploy."
  for service in "${SERVICES[@]}"; do
    dump_service_logs "${service}"
  done
  rollback || true
  exit 1
fi

if [[ "${RECREATE_CADDY}" == "1" ]]; then
  compose up -d --force-recreate --no-deps caddy
fi

DEPLOY_SERVICES="${SERVICES[*]}" bash "${COMPOSE_DIR}/smoke.sh"

echo "API health: $(curl -fsS http://127.0.0.1:3000/api/v1/health)"
echo "Deployed: ${SERVICES[*]}"
echo "Admin: https://admin.usalimocorp.com"
echo "Customer: https://customer.usalimocorp.com"
echo "Website: https://demo.usalimocorp.com"
