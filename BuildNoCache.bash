#!/usr/bin/env bash

export TICHU_HOST_URL="${TICHU_HOST_URL:-http://192.168.1.37}"

docker compose down --rmi all
docker compose build --no-cache frontend

./StartTichuCounter.bash