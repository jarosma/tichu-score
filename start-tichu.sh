#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

cleanup() {
  if [[ "${TICHU_STARTED:-}" == "true" ]]; then
    printf '\nStoppe Tichu ...\n'
    docker compose down
  fi
}

trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

fail() {
  printf 'Fehler: %s\n' "$1" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Benötigtes Kommando fehlt: $1"
}

detect_host_ip() {
  if [[ -n "${TICHU_HOST_IP:-}" ]]; then
    printf '%s\n' "$TICHU_HOST_IP"
    return
  fi

  local system interface detected_ip
  system="$(uname -s)"
  interface="${TICHU_NETWORK_INTERFACE:-}"

  case "$system" in
    Darwin)
      require_command route
      require_command ipconfig
      if [[ -z "$interface" ]]; then
        interface="$(route -n get default 2>/dev/null | awk '/interface:/{print $2}')"
      fi
      [[ -n "$interface" ]] || return
      ipconfig getifaddr "$interface" 2>/dev/null || true
      ;;
    Linux)
      require_command ip
      if [[ -n "$interface" ]]; then
        ip -4 addr show dev "$interface" scope global 2>/dev/null \
          | awk '/inet /{sub(/\/.*/, "", $2); print $2; exit}'
      else
        detected_ip="$(ip route get 1.1.1.1 2>/dev/null \
          | awk '{for (i = 1; i <= NF; i++) if ($i == "src") {print $(i + 1); exit}}')"
        if [[ -n "$detected_ip" ]]; then
          printf '%s\n' "$detected_ip"
        else
          hostname -I 2>/dev/null | awk '{print $1}'
        fi
      fi
      ;;
    *)
      fail "Nicht unterstütztes Betriebssystem: $system. Setze TICHU_HOST_IP manuell."
      ;;
  esac
}

require_command docker
require_command curl

if [[ -n "${TICHU_PUBLIC_URL:-}" ]]; then
  TICHU_PUBLIC_URL="${TICHU_PUBLIC_URL%/}"
else
  host_ip="$(detect_host_ip)"
  [[ -n "$host_ip" ]] || fail "Keine Host-IP gefunden. Setze TICHU_HOST_IP manuell."
  TICHU_PUBLIC_URL="http://${host_ip}:81"
fi

export TICHU_PUBLIC_URL
default_cors_origins="http://127.0.0.1:81,http://localhost:81,$TICHU_PUBLIC_URL"
export TICHU_CORS_ORIGINS="${TICHU_CORS_ORIGINS:-$default_cors_origins}"
TICHU_SITE_URL="${SITE_URL:-http://127.0.0.1:81}"

docker compose config --quiet

printf 'Starte Tichu ...\n'
printf 'Public URL: %s\n' "$TICHU_PUBLIC_URL"
printf 'Mobile Score-URLs verwenden diese Adresse automatisch.\n'

docker compose up --build -d
TICHU_STARTED=true

printf 'Warte auf das Frontend ...\n'
ready=false
for _ in {1..30}; do
  if curl --fail --silent --show-error "$TICHU_PUBLIC_URL/" >/dev/null 2>&1; then
    ready=true
    break
  fi
  sleep 1
done

if [[ "$ready" != "true" ]]; then
  docker compose ps
  fail "Das Frontend ist unter $TICHU_PUBLIC_URL nicht erreichbar."
fi

printf 'Desktop-URL: %s\n' "$TICHU_SITE_URL"
case "$(uname -s)" in
  Darwin)
    open "$TICHU_SITE_URL" >/dev/null 2>&1 || true
    ;;
  Linux)
    if command -v xdg-open >/dev/null 2>&1; then
      xdg-open "$TICHU_SITE_URL" >/dev/null 2>&1 || true
    fi
    ;;
esac

printf 'Docker-Logs folgen. Mit Ctrl+C werden die Container beendet.\n\n'
docker compose logs -f
