# Tichu-score

Tichu-score is a frontend and backend for recording Tichu games, managing
players and teams, and maintaining statistics between games.

## Starten

Voraussetzungen:

- Docker mit Docker Compose
- macOS oder Ubuntu/Linux
- Eine aktive Netzwerkverbindung, wenn Score-Eingaben vom Smartphone kommen sollen

Das gesamte Projekt wird mit einem Skript gestartet:

```bash
chmod +x start-tichu.sh
./start-tichu.sh
```

Das Skript erkennt automatisch, ob es auf macOS oder Linux läuft, ermittelt die
IP-Adresse des aktiven Netzwerkadapters und setzt die Public URL für Frontend,
QR-Codes und CORS. Das Frontend wird mit dieser URL gebaut und anschließend
gestartet.

Die Desktop-Seite ist danach unter folgender Adresse erreichbar:

```text
http://<HOST-IP>:81
```

Die URL für Score-Eingaben wird auf dem Desktop im Spectator-Bereich als QR-Code
angezeigt. Smartphone und Desktop müssen sich im selben Netzwerk befinden.

Mit `Ctrl+C` werden die Logs beendet und die Container sauber gestoppt.

## Netzwerk-Overrides

Bei mehreren Netzwerkadaptern oder aktiven VPNs kann die IP manuell gesetzt
werden:

```bash
TICHU_HOST_IP=192.168.178.42 ./start-tichu.sh
```

Alternativ kann ein bestimmter Netzwerkadapter ausgewählt werden:

```bash
TICHU_NETWORK_INTERFACE=en0 ./start-tichu.sh
```

Eine feste URL kann ebenfalls vorgegeben werden:

```bash
TICHU_PUBLIC_URL=http://192.168.178.42:81 ./start-tichu.sh
```

Weitere optionale Variablen:

- `TICHU_HOST_IP`: Host-IP, die für Public URL und QR-Codes verwendet wird
- `TICHU_NETWORK_INTERFACE`: Netzwerkadapter für die automatische Erkennung
- `TICHU_PUBLIC_URL`: vollständige URL inklusive Port, überschreibt die IP-Erkennung
- `TICHU_CORS_ORIGINS`: erlaubte Browser-Origins, standardmäßig Loopback plus Public URL
- `SITE_URL`: URL, die nach dem Start im Browser geöffnet wird

## Stoppen und Zurücksetzen

Das Startskript stoppt die Container mit `Ctrl+C`. Die Datenbankdaten bleiben im
Docker-Volume erhalten.

Zum manuellen Stoppen ohne das Skript:

```bash
docker compose down
```

Für einen vollständigen Neuaufbau ohne Docker-Cache:

```bash
docker compose down
docker compose build --no-cache
docker compose up
```

## API

Die Spiel-Endpunkte sind unter `/games` verfügbar:

- `GET /games`: Gibt alle laufenden Spiele zurück.
- `GET /games/{gameId}`: Gibt ein einzelnes Spiel zurück.
- `POST /games`: Startet ein neues Spiel.
- `POST /games/{gameId}/end`: Beendet ein Spiel.
