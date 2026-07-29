# Tichu Frontend

Die React-Anwendung ist die deutsche Weboberflaeche fuer Spielstart,
Punktestand, Punkteingabe, Verwaltung, Statistiken und den Spotify-Jam-Begleiter.
Die API wird im Entwicklungsserver unter `/api` proxied.

## Voraussetzungen

- Node.js `>=22.12.0 <23` und npm `>=10` (Docker-Basis: Node `22.14.0`)
- Backend: Java 21 und Quarkus `3.30.2`, wie in `tichu-backend/pom.xml`

## Entwicklung

Im Verzeichnis `tichu-frontend`:

```text
npm ci
npm run dev
```

Wichtige Frontend-Befehle:

```text
npm run check
npm run test
npm run build
```

`TICHU_API_PROXY_TARGET` kann in `.env` auf ein anderes Backend zeigen.
`VITE_API_BASE_URL` setzt die API-Basis fuer den Browser. `VITE_PUBLIC_URL`
ueberschreibt die oeffentliche Adresse fuer QR-Links; ohne diese Einstellung
wird die aktuelle Browser-Adresse verwendet.

### Spotify

Die Spotify-Funktion ist frontend-only und benoetigt keinen Backend-Schluessel.
Setze `VITE_SPOTIFY_CLIENT_ID` auf die Client-ID deiner Spotify Developer App
und registriere `VITE_SPOTIFY_REDIRECT_URI` exakt als Redirect-URI. Die Anmeldung
verwendet PKCE; ein Spotify-Client-Secret darf nicht in die Vite-Umgebung.

Der Host verbindet einen Premium-Account, startet den Jam manuell in Spotify und
fuegt danach den Jam-Link ein. Tichu erstellt daraus einen QR-Code. Der Browser
des verbundenen Hosts liest den aktuellen Song ueber Spotify; ohne Backend kann
dieser Live-Status nicht an andere Geraete weitergegeben werden.

Der Button `Spotify-App oeffnen` verwendet den browserseitigen `spotify:`-Deep-Link
ohne feste Playlist oder Song. Ob der Browser damit die installierte Desktop-App
startet, haengt von der lokalen Protokoll-Zuordnung ab; der Web Player bleibt als
Fallback verfuegbar.

Die wichtigsten Routen sind `/`, `/game/new`, `/game/spectate`, `/spotify`,
`/game/:id/spectate`, `/game/:id/score`, `/manage/players`,
`/manage/teams` und `/statistics`. `/manage` leitet auf die Spielerverwaltung
weiter.

## Betrieb

Aus dem Repository-Root wird das Image gebaut; es liefert die statischen Dateien
ueber nginx aus:

```text
docker build -t tichu-frontend ./tichu-frontend
docker run --rm -p 8081:80 tichu-frontend
```

Fuer einen abweichenden QR-Ursprung koennen beim Build
`--build-arg TICHU_PUBLIC_URL=https://...` und
`--build-arg TICHU_API_BASE_URL=/api` gesetzt werden. Die Docker-Basisimages
sind auf konkrete Versionen und Multi-Architektur-Digests gepinnt.

Fuer Spotify koennen zusaetzlich `--build-arg TICHU_SPOTIFY_CLIENT_ID=...`
und `--build-arg TICHU_SPOTIFY_REDIRECT_URI=https://.../spotify` gesetzt
werden. Die Client-ID ist oeffentlich; ein Client-Secret wird nicht verwendet.

Das Startskript oeffnet die Host-Ansicht standardmaessig unter
`http://127.0.0.1:81`, waehrend `TICHU_PUBLIC_URL` weiterhin die LAN-Adresse
fuer QR-Links beschreibt. Mit `SITE_URL` kann die geoeffnete Host-Adresse
ueberschrieben werden.

## Abdeckung

Vitest prueft API-Payloads und Laufzeitvalidierung, Routing, Punkteingabe-Ablaeufe,
Polling, Dialogfokus, responsive DOM-Strukturen und die deutsche Terminologie.
Nicht durch jsdom ersetzt werden ein echter QR-Scan auf einem zweiten LAN-Gerät,
reale Viewports (320/480 Pixel und Landscape) sowie ein manueller
Screenreader-/axe-Durchlauf. Diese drei Prüfungen bleiben vor einem Release
manuell erforderlich.
