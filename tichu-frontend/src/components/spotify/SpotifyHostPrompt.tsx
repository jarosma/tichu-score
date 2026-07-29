import { LogIn, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SpotifyHostPromptProps {
  configured: boolean;
  loading: boolean;
  error: string | null;
  onConnect: () => void;
}

export function SpotifyHostPrompt({
  configured,
  loading,
  error,
  onConnect,
}: SpotifyHostPromptProps) {
  return (
    <Dialog open onOpenChange={() => undefined}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </span>
            Host mit Spotify verbinden
          </DialogTitle>
          <DialogDescription>
            Verbinde den Premium-Account, der den Jam hostet. Dieses Fenster
            bleibt offen, bis Spotify verbunden ist.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        <Button
          className="w-full"
          onClick={onConnect}
          disabled={!configured || loading}
          data-enter-primary="true"
        >
          <LogIn />
          {loading ? "Verbindung wird geprüft ..." : "Mit Spotify verbinden"}
        </Button>
        {!configured && (
          <p className="text-xs text-muted-foreground">
            Hinterlege zuerst <code>VITE_SPOTIFY_CLIENT_ID</code> in der
            Frontend-Konfiguration.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
