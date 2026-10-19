#!/usr/bin/env bash
set -euo pipefail

# First-time Hostinger Ubuntu setup. Run as root or with sudo.
# Does not clone git. GitHub Actions rsyncs the repo to INSTALL_DIR.

INSTALL_DIR="${INSTALL_DIR:-/opt/usa-limousine-corporation}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash deploy/vps/bootstrap.sh"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl git rsync ufw

if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi

systemctl enable --now docker

ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

mkdir -p "${INSTALL_DIR}"

id usadeploy >/dev/null 2>&1 || useradd --create-home --shell /bin/bash --groups docker usadeploy
usermod -aG docker usadeploy
chown -R usadeploy:usadeploy "${INSTALL_DIR}"

echo
echo "Bootstrap complete (docker group user: usadeploy)."
echo "Copy production env files into ${INSTALL_DIR}/apps/*/ then rsync or run Actions → Deploy."
echo "Root SSH still works; prefer VPS_USER=usadeploy once that key is installed."
