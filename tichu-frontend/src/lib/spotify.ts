import type { SpotifyPlayback, SpotifyProfile } from "./Types";

const SPOTIFY_ACCOUNTS_URL = "https://accounts.spotify.com";
const SPOTIFY_API_URL = "https://api.spotify.com/v1";
const TOKEN_KEY = "tichu.spotify.token";
const STATE_KEY = "tichu.spotify.oauth-state";
const VERIFIER_KEY = "tichu.spotify.oauth-verifier";
const SCOPES = "user-read-private user-read-playback-state";

const clientId =
  (import.meta.env.VITE_SPOTIFY_CLIENT_ID as string | undefined)?.trim() ?? "";
const redirectUri =
  (import.meta.env.VITE_SPOTIFY_REDIRECT_URI as string | undefined)?.trim() ||
  `${window.location.origin}/spotify`;

interface SpotifyToken {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number;
}

interface SpotifyTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
}

export class SpotifyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpotifyError";
  }
}

export class SpotifyAuthError extends SpotifyError {}

export function isSpotifyConfigured() {
  return clientId.length > 0;
}

export function getSpotifyRedirectUri() {
  return redirectUri;
}

export function hasSpotifyToken() {
  return readToken() !== null;
}

export function isSpotifyJamUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "spotify.link" ||
        url.hostname === "open.spotify.com") &&
      url.pathname !== "/"
    );
  } catch {
    return false;
  }
}

export async function startSpotifyLogin() {
  if (!isSpotifyConfigured()) {
    throw new SpotifyError(
      "Die Spotify Client-ID ist noch nicht konfiguriert.",
    );
  }

  const state = randomString(32);
  const verifier = randomString(64);
  const challenge = await createChallenge(verifier);
  sessionStorage.setItem(STATE_KEY, state);
  sessionStorage.setItem(VERIFIER_KEY, verifier);

  const url = new URL(`${SPOTIFY_ACCOUNTS_URL}/authorize`);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("code_challenge", challenge);
  window.location.assign(url.toString());
}

export async function finishSpotifyLogin(searchParams: URLSearchParams) {
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  if (!code && !error) return false;
  if (error)
    throw new SpotifyAuthError("Die Spotify-Anmeldung wurde abgebrochen.");

  const expectedState = sessionStorage.getItem(STATE_KEY);
  const receivedState = searchParams.get("state");
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);
  sessionStorage.removeItem(VERIFIER_KEY);
  if (!code || !expectedState || expectedState !== receivedState || !verifier) {
    throw new SpotifyAuthError(
      "Die Spotify-Anmeldung konnte nicht verifiziert werden.",
    );
  }

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });
  const response = await fetch(`${SPOTIFY_ACCOUNTS_URL}/api/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok)
    throw new SpotifyAuthError(
      "Spotify konnte die Anmeldung nicht abschließen.",
    );
  saveToken(await readTokenResponse(response));
  return true;
}

export function disconnectSpotify() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(STATE_KEY);
  sessionStorage.removeItem(VERIFIER_KEY);
}

export async function fetchSpotifyProfile(): Promise<SpotifyProfile> {
  const payload = await spotifyJson("/me");
  return {
    displayName: text(payload, "display_name"),
    product: text(payload, "product"),
  };
}

export async function fetchSpotifyPlayback(): Promise<SpotifyPlayback | null> {
  const response = await spotifyFetch("/me/player?additional_types=track");
  if (response.status === 204) return null;
  if (response.status === 403) {
    throw new SpotifyError(
      "Spotify erlaubt die Wiedergabeabfrage nur mit einem Premium-Konto.",
    );
  }
  if (!response.ok)
    throw new SpotifyError(
      "Die aktuelle Wiedergabe konnte nicht geladen werden.",
    );

  const payload: unknown = await response.json();
  if (!isRecord(payload) || !isRecord(payload.item)) return null;
  const item = payload.item;
  if (
    item.type !== "track" ||
    typeof item.id !== "string" ||
    typeof item.name !== "string"
  ) {
    return null;
  }

  const album = isRecord(item.album) ? item.album : null;
  return {
    available: true,
    playing: payload.is_playing === true,
    trackId: item.id,
    trackName: item.name,
    artists: artistNames(item.artists),
    albumName: text(album, "name"),
    imageUrl: firstImage(album),
    spotifyUrl: text(
      isRecord(item.external_urls) ? item.external_urls : null,
      "spotify",
    ),
    progressMs: integerOrNull(payload.progress_ms),
    durationMs: integerOrNull(item.duration_ms),
    deviceName: text(isRecord(payload.device) ? payload.device : null, "name"),
    contextName: null,
  };
}

async function spotifyJson(path: string): Promise<Record<string, unknown>> {
  const response = await spotifyFetch(path);
  if (!response.ok)
    throw new SpotifyError("Spotify-Daten konnten nicht geladen werden.");
  const payload: unknown = await response.json();
  if (!isRecord(payload))
    throw new SpotifyError("Spotify hat ein ungültiges Datenformat geliefert.");
  return payload;
}

async function spotifyFetch(path: string): Promise<Response> {
  const token = await getAccessToken();
  const response = await fetch(`${SPOTIFY_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status === 401) {
    disconnectSpotify();
    throw new SpotifyAuthError("Die Spotify-Anmeldung ist abgelaufen.");
  }
  return response;
}

async function getAccessToken(): Promise<string> {
  const token = readToken();
  if (!token) throw new SpotifyAuthError("Bitte verbinde zuerst Spotify.");
  if (token.expiresAt > Date.now() + 60_000) return token.accessToken;
  if (!token.refreshToken) {
    disconnectSpotify();
    throw new SpotifyAuthError("Die Spotify-Anmeldung ist abgelaufen.");
  }

  const response = await fetch(`${SPOTIFY_ACCOUNTS_URL}/api/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    }),
  });
  if (!response.ok) {
    disconnectSpotify();
    throw new SpotifyAuthError("Die Spotify-Anmeldung ist abgelaufen.");
  }
  const refreshed = await readTokenResponse(response);
  saveToken({
    ...refreshed,
    refreshToken: refreshed.refreshToken ?? token.refreshToken,
  });
  return refreshed.accessToken;
}

async function readTokenResponse(response: Response): Promise<SpotifyToken> {
  const payload: SpotifyTokenResponse = await response.json();
  if (!payload.access_token)
    throw new SpotifyAuthError("Spotify hat kein Zugriffstoken geliefert.");
  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token ?? null,
    expiresAt: Date.now() + (payload.expires_in ?? 3600) * 1000,
  };
}

function readToken(): SpotifyToken | null {
  const raw = sessionStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  try {
    const token: unknown = JSON.parse(raw);
    if (!isRecord(token)) return null;
    if (
      typeof token.accessToken !== "string" ||
      typeof token.expiresAt !== "number"
    )
      return null;
    return {
      accessToken: token.accessToken,
      refreshToken:
        typeof token.refreshToken === "string" ? token.refreshToken : null,
      expiresAt: token.expiresAt,
    };
  } catch {
    return null;
  }
}

function saveToken(token: SpotifyToken) {
  sessionStorage.setItem(TOKEN_KEY, JSON.stringify(token));
}

function randomString(length: number) {
  const values = new Uint8Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (value) =>
    value.toString(16).padStart(2, "0"),
  ).join("");
}

async function createChallenge(verifier: string) {
  if (!crypto.subtle) {
    throw new SpotifyError(
      "Die Spotify-Anmeldung benötigt eine sichere HTTPS-Verbindung.",
    );
  }
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  return base64Url(new Uint8Array(digest));
}

function base64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(
  value: Record<string, unknown> | null | undefined,
  key: string,
): string | null {
  const result = value?.[key];
  return typeof result === "string" && result.trim() ? result : null;
}

function artistNames(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((artist) =>
      isRecord(artist) && typeof artist.name === "string" ? artist.name : null,
    )
    .filter((name): name is string => name !== null);
}

function firstImage(album: Record<string, unknown> | null) {
  const images = album?.images;
  if (!Array.isArray(images) || !isRecord(images[0])) return null;
  return typeof images[0].url === "string" ? images[0].url : null;
}

function integerOrNull(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}
