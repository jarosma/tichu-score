import { GripVertical, Pause, Play, Radio } from "lucide-react";
import { useRef, type PointerEvent } from "react";
import type { SpotifyPlayback } from "@/lib/Types";
import type { SpotifyNotificationPosition } from "./SpotifyPlaybackContext";

interface SpotifyPlaybackNotificationProps {
  playback: SpotifyPlayback | null;
  progressMs: number | null;
  loading: boolean;
  error: string | null;
  position: SpotifyNotificationPosition;
  onPositionChange: (position: SpotifyNotificationPosition) => void;
  onClick: () => void;
}

function formatTime(milliseconds: number | null) {
  if (milliseconds === null) return "--:--";
  const seconds = Math.max(0, Math.floor(milliseconds / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function SpotifyPlaybackNotification({
  playback,
  progressMs,
  loading,
  error,
  position,
  onPositionChange,
  onClick,
}: SpotifyPlaybackNotificationProps) {
  const dragRef = useRef<{
    pointerX: number;
    pointerY: number;
    positionX: number;
    positionY: number;
  } | null>(null);
  const progress =
    playback &&
    progressMs !== null &&
    playback.durationMs !== null &&
    playback.durationMs > 0
      ? Math.min(100, (progressMs / playback.durationMs) * 100)
      : 0;

  function moveNotification(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const width = Math.min(window.innerWidth - 32, 384);
    const height = 112;
    const x = drag.positionX + event.clientX - drag.pointerX;
    const y = drag.positionY + event.clientY - drag.pointerY;
    onPositionChange({
      x: Math.max(8, Math.min(x, window.innerWidth - width - 8)),
      y: Math.max(8, Math.min(y, window.innerHeight - height - 8)),
    });
  }

  return (
    <div
      className="fixed z-30 flex w-[min(calc(100vw-2rem),24rem)] items-stretch gap-1 rounded-xl border bg-card p-2 text-card-foreground shadow-xl"
      style={{ left: position.x, top: position.y }}
    >
      <button
        type="button"
        className="touch-none rounded-md px-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Spotify-Notification verschieben"
        onPointerDown={(event) => {
          dragRef.current = {
            pointerX: event.clientX,
            pointerY: event.clientY,
            positionX: position.x,
            positionY: position.y,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={moveNotification}
        onPointerUp={() => {
          dragRef.current = null;
        }}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
      >
        <GripVertical className="size-4" />
      </button>
      <button
        type="button"
        onClick={onClick}
        className="group flex min-w-0 flex-1 items-center gap-3 rounded-md p-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Spotify-Wiedergabe und Jam anzeigen"
      >
        {playback?.imageUrl ? (
          <img
            src={playback.imageUrl}
            alt=""
            className="size-12 shrink-0 rounded-md object-cover"
          />
        ) : (
          <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Radio className="size-5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {playback?.playing ? (
              <Play className="size-3.5 shrink-0 fill-current text-primary" />
            ) : (
              <Pause className="size-3.5 shrink-0 text-muted-foreground" />
            )}
            <p className="truncate text-sm font-semibold">
              {playback?.trackName ??
                (loading ? "Wiedergabe wird geladen ..." : "Keine Wiedergabe")}
            </p>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {error ?? playback?.artists.join(", ") ?? "Spotify-Jam öffnen"}
          </p>
          {playback && (
            <div className="mt-2">
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>{formatTime(progressMs)}</span>
                <span>{formatTime(playback.durationMs)}</span>
              </div>
            </div>
          )}
        </div>
        <span className="shrink-0 text-xs text-muted-foreground transition group-hover:text-foreground">
          Öffnen
        </span>
      </button>
    </div>
  );
}
