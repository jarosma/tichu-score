import { createContext, useContext } from "react";
import type { SpotifyPlayback, SpotifyProfile } from "@/lib/Types";

export interface SpotifyNotificationPosition {
  x: number;
  y: number;
}

export interface SpotifyPlaybackContextValue {
  configured: boolean;
  profile: SpotifyProfile | null;
  connectionLoading: boolean;
  connectionError: string | null;
  playback: SpotifyPlayback | null;
  progressMs: number | null;
  playbackLoading: boolean;
  playbackError: string | null;
  notificationVisible: boolean;
  setNotificationVisible: (visible: boolean) => void;
  notificationPosition: SpotifyNotificationPosition;
  setNotificationPosition: (position: SpotifyNotificationPosition) => void;
  jamUrl: string | null;
  saveJamUrl: (value: string) => boolean;
  connectSpotify: () => Promise<void>;
  disconnect: () => void;
}

export const SpotifyPlaybackContext =
  createContext<SpotifyPlaybackContextValue | null>(null);

export function useSpotifyPlayback() {
  const context = useContext(SpotifyPlaybackContext);
  if (!context) {
    throw new Error(
      "useSpotifyPlayback must be used inside SpotifyPlaybackProvider",
    );
  }
  return context;
}
