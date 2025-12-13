#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${REPO_DIR}/.env"
EXAMPLE_ENV_FILE="${REPO_DIR}/.env.production.example"
COMPOSE_FILE="${REPO_DIR}/docker-compose.prod.yml"

echo "[deploy] Using repo: ${REPO_DIR}"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "[deploy] Creating .env from .env.production.example"
  cp "${EXAMPLE_ENV_FILE}" "${ENV_FILE}"
  echo "[deploy] Edit ${ENV_FILE} and re-run deploy.sh"
  exit 1
fi

# shellcheck disable=SC2046
source <(grep -E '^[A-Z0-9_]+=' "${ENV_FILE}" | sed 's/^/export /')

APP_DATA_DIR_VALUE="${APP_DATA_DIR:-/opt/mk-news}"

echo "[deploy] Ensuring persistent directories: ${APP_DATA_DIR_VALUE}/uploads"
sudo mkdir -p "${APP_DATA_DIR_VALUE}/uploads"

# The app container runs as UID 1001 (nextjs). Make sure it can write.
sudo chown -R 1001:1001 "${APP_DATA_DIR_VALUE}/uploads"

echo "[deploy] Checking Docker installation..."
if ! command -v docker >/dev/null 2>&1; then
  echo "[deploy] Docker not found. Installing (Ubuntu)..."
  sudo apt-get update -y
  sudo apt-get install -y ca-certificates curl gnupg
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update -y
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

echo "[deploy] Running db migrations + seed..."
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" build migrate

docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" run --rm migrate

echo "[deploy] Building and starting services (caddy + app + db)..."
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" up -d --build db app caddy

echo "[deploy] Done. Check logs with: docker compose --env-file .env -f docker-compose.prod.yml logs -f --tail=200"
