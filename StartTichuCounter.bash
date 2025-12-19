#!/usr/bin/env bash

TICHU_HOST_IP="${HOST_IP:-http://localhost}"
TICHU_COMPOSE_DIR="${COMPOSE_DIR:-.}"
TICHU_SITE_URL="${SITE_URL:-http://localhost}"

export HOST_IP=$TICHU_HOST_IP

cd "$TICHU_COMPOSE_DIR" || exit 1

trap 'docker compose down' EXIT INT TERM

docker compose up -d

open "$SITE_URL" 2>/dev/null || xdg-open "$TICHU_SITE_URL" 2>/dev/null

docker compose logs -f
