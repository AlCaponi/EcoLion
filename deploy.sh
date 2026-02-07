#!/bin/bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
BRANCH="main"
LOG_FILE="$REPO_DIR/deploy.log"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

cd "$REPO_DIR"

git fetch origin "$BRANCH" > /dev/null 2>&1

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH")

if [ "$LOCAL" = "$REMOTE" ]; then
  exit 0
fi

log "New commit detected: $LOCAL -> $REMOTE"

git pull origin "$BRANCH" >> "$LOG_FILE" 2>&1
log "Pulled latest changes"

VITE_API_BASE_URL=https://ecolionapi.d00.ch docker compose up --build -d >> "$LOG_FILE" 2>&1

log "Rebuild complete"
