import { Check, Copy, ExternalLink, Music2, QrCode } from "lucide-react";
import { useState, type FormEvent } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InlineMessage } from "@/components/feedback/InlineMessage";
import { isSpotifyJamUrl } from "@/lib/spotify";

interface SpotifyJamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spotifyJamUrl: string | null;
  shareUrl: string | null;
  onSaveJamUrl: (value: string) => boolean;
  onOpenSpotify: () => void;
}

export function SpotifyJamDialog({
  open,
  onOpenChange,
  spotifyJamUrl,
  shareUrl,
  onSaveJamUrl,
  onOpenSpotify,
}: SpotifyJamDialogProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [jamInput, setJamInput] = useState(spotifyJamUrl ?? "");
  const [jamError, setJamError] = useState<string | null>(null);

  async function copyLink() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  }

  function saveJam(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = jamInput.trim();
    if (!isSpotifyJamUrl(normalized) || !onSaveJamUrl(normalized)) {
      setJamError("Bitte füge einen gültigen Spotify-Jam-Link ein.");
      return;
    }
    setJamError(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="size-5 text-primary" />
            {spotifyJamUrl ? "Spotify-Jam teilen" : "Spotify-Jam einrichten"}
          </DialogTitle>
          <DialogDescription>
            {spotifyJamUrl
              ? "Gäste scannen den QR-Code und öffnen danach den Jam in Spotify."
              : "Starte zuerst einen Jam in der Spotify-App und füge anschließend den Link ein."}
          </DialogDescription>
        </DialogHeader>

        {spotifyJamUrl && shareUrl ? (
          <div className="space-y-5">
            <div className="flex justify-center rounded-xl bg-white p-5">
              <QRCodeCanvas
                value={shareUrl}
                size={280}
                className="h-auto max-w-full"
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            <div className="space-y-3">
              <a
                href={spotifyJamUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 break-all text-sm text-primary underline underline-offset-4"
              >
                <span>{spotifyJamUrl}</span>
                <ExternalLink className="size-4 shrink-0" />
              </a>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => void copyLink()}>
                  {copied ? <Check /> : <Copy />}
                  {copied ? "Tichu-Link kopiert" : "Tichu-Link kopieren"}
                </Button>
                <Button asChild variant="outline">
                  <a href={spotifyJamUrl} target="_blank" rel="noreferrer">
                    <Music2 />
                    In Spotify öffnen
                  </a>
                </Button>
              </div>
              {copyError && (
                <InlineMessage variant="warning">
                  Der Link konnte nicht automatisch kopiert werden.
                </InlineMessage>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <Button onClick={onOpenSpotify} className="w-full">
              <Music2 />
              Spotify-App öffnen
            </Button>
            <form className="space-y-3" onSubmit={saveJam}>
              <label
                htmlFor="spotify-jam-dialog-url"
                className="text-sm font-medium"
              >
                Spotify-Jam-Link
              </label>
              <Input
                id="spotify-jam-dialog-url"
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
