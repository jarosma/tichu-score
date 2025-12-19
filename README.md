# Tichu-score
This repo contains a Front- and Backend to count points for a Tichu game. It also lets you create Players and Teams so 
stats for different Players and Teams can be saved between different Playing sessions.

## How to start it

Configure those ENV-vars:
- TICHU_HOST_IP # Only important needs to be local ip address of host device | Defaults to http://localhost
- TICHU_COMPOSE_DIR # Relative path from `StartTichuCounter.sh` to the root directory of the Project | Defaults to . 
- TICHU_SITE_URL # Which site should be open by `StartTichuCounter.sh` | Defaults to http://localhost 

## How to use it

- Have Docker with docker compose installed.
- Start `StartTichuCounter.sh` 
- Find out the rest your selfe it's not that hard :D