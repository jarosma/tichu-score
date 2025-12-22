#!/usr/bin/env bash

export TICHU_HOST_URL="${TICHU_HOST_URL:-http://192.168.1.37}"
TICHU_COMPOSE_DIR="${COMPOSE_DIR:-.}"
TICHU_SITE_URL="${SITE_URL:-http://localhost:81}"

cd "$TICHU_COMPOSE_DIR" || exit 1

trap 'docker compose down' EXIT INT TERM

docker compose up -d

open "$TICHU_SITE_URL" 2>/dev/null || xdg-open "$TICHU_SITE_URL" 2>/dev/null

docker compose logs -f
