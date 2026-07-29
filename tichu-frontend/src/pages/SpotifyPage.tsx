import { ExternalLink, Eye, EyeOff, LogOut, Music2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InlineMessage } from "@/components/feedback/InlineMessage";
import { PageHeader } from "@/components/layout/PageHeader";
import { SpotifyHostPrompt } from "@/components/spotify/SpotifyHostPrompt";
import { useSpotifyPlayback } from "@/components/spotify/SpotifyPlaybackContext";
import { isSpotifyJamUrl } from "@/lib/spotify";

const SPOTIFY_DESKTOP_URI = "spotify:";
const SPOTIFY_WEB_URL = "https://open.spotify.com/";

export function SpotifyPage() {
  const {
    configured,
    profile,
    connectionLoading,
    connectionError,
    notificationVisible,
    setNotificationVisible,
    jamUrl,
    saveJamUrl,
    connectSpotify,
    disconnect,
  } = useSpotifyPlayback();
  const [jamInput, setJamInput] = useState(jamUrl ?? "");
  const [jamError, setJamError] = useState<string | null>(null);
  const validJamUrl = jamUrl && isSpotifyJamUrl(jamUrl) ? jamUrl : null;

  function saveJam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = jamInput.trim();
    if (!isSpotifyJamUrl(normalized) || !saveJamUrl(normalized)) {
      setJamError("Bitte füge einen gültigen Spotify-Jam-Link ein.");
      return;
    }
    setJamError(null);
  }

  return (
    <div className="space-y-6 pb-28">
      <PageHeader
        title="Spotify"
        description="Starte einen Spotify-Jam und teile ihn mit der Runde."
      />

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music2 className="size-5 text-primary" />
            Jam einrichten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {profile ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2 text-sm">
              <span>
                Host verbunden
                {profile.displayName ? ` als ${profile.displayName}` : ""}.
              </span>
              <Button variant="ghost" size="sm" onClick={disconnect}>
                <LogOut />
                Trennen
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Verbinde den Premium-Account, der den Jam hostet.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <a href={SPOTIFY_DESKTOP_URI}>
                <Music2 />
                Spotify-App öffnen
              </a>
            </Button>
            <Button asChild variant="ghost">
              <a href={SPOTIFY_WEB_URL} target="_blank" rel="noreferrer">
                <ExternalLink />
                Web Player
              </a>
            </Button>
          </div>

          <form className="space-y-3" onSubmit={saveJam}>
            <label htmlFor="spotify-jam-url" className="text-sm font-medium">
              Spotify-Jam-Link
            </label>
            <Input
              id="spotify-jam-url"
              type="url"
              inputMode="url"
              placeholder="https://spotify.link/..."
              value={jamInput}
              onChange={(event) => setJamInput(event.target.value)}
              aria-invalid={Boolean(jamError)}
            />
            <Button type="submit" className="w-full">
              Jam-Link übernehmen
            </Button>
            {jamError && (
              <InlineMessage variant="warning">{jamError}</InlineMessage>
            )}
          </form>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <span className="text-sm text-muted-foreground">
              Wiedergabe-Notification
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNotificationVisible(!notificationVisible)}
              aria-pressed={notificationVisible}
            >
              {notificationVisible ? <EyeOff /> : <Eye />}
              {notificationVisible ? "Ausblenden" : "Einblenden"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {connectionError && !profile && (
        <InlineMessage variant="warning" className="mx-auto max-w-2xl">
          {connectionError}
        </InlineMessage>
      )}

      {!configured && (
        <InlineMessage variant="info" className="mx-auto max-w-2xl">
          Spotify ist noch nicht eingerichtet. Hinterlege später
          <code className="mx-1 rounded bg-background px-1 py-0.5 text-xs">
            VITE_SPOTIFY_CLIENT_ID
          </code>
          und die Redirect-URL.
        </InlineMessage>
      )}

      {!connectionLoading && !profile && (
        <SpotifyHostPrompt
          configured={configured}
          loading={connectionLoading}
          error={connectionError}
          onConnect={() => void connectSpotify()}
        />
      )}

      {validJamUrl && (
        <span className="sr-only">Jam-Link ist gespeichert.</span>
      )}
    </div>
  );
}
