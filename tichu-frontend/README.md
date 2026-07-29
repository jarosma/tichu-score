# Tichu Frontend

Die React-Anwendung ist die deutsche Weboberflaeche fuer Spielstart,
Punktestand, Punkteingabe, Verwaltung und Statistiken. Die API wird im
Entwicklungsserver unter `/api` proxied.

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

Die wichtigsten Routen sind `/`, `/game/new`, `/game/spectate`,
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

## Abdeckung

Vitest prueft API-Payloads und Laufzeitvalidierung, Routing, Punkteingabe-Ablaeufe,
Polling, Dialogfokus, responsive DOM-Strukturen und die deutsche Terminologie.
Nicht durch jsdom ersetzt werden ein echter QR-Scan auf einem zweiten LAN-Gerät,
reale Viewports (320/480 Pixel und Landscape) sowie ein manueller
Screenreader-/axe-Durchlauf. Diese drei Prüfungen bleiben vor einem Release
manuell erforderlich.
