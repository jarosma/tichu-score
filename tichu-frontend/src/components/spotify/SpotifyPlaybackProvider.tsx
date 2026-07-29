import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getSpotifyJamShareUrl } from "@/lib/config";
import type { SpotifyPlayback, SpotifyProfile } from "@/lib/Types";
import {
  disconnectSpotify,
  finishSpotifyLogin,
  fetchSpotifyPlayback,
  fetchSpotifyProfile,
  hasSpotifyToken,
  isSpotifyConfigured,
  isSpotifyJamUrl,
  SpotifyAuthError,
  SpotifyError,
  startSpotifyLogin,
} from "@/lib/spotify";
import { SpotifyJamDialog } from "./SpotifyJamDialog";
import { SpotifyPlaybackNotification } from "./SpotifyPlaybackNotification";
import {
  SpotifyPlaybackContext,
  type SpotifyNotificationPosition,
  type SpotifyPlaybackContextValue,
  useSpotifyPlayback,
} from "./SpotifyPlaybackContext";
const NOTIFICATION_PREFERENCE_KEY = "tichu.spotify.notification-visible";
const NOTIFICATION_POSITION_KEY = "tichu.spotify.notification-position";
const JAM_URL_KEY = "tichu.spotify.jam-url";

function defaultPosition(): SpotifyNotificationPosition {
  return {
    x: window.innerWidth >= 1024 ? 272 : 16,
    y: Math.max(16, window.innerHeight - 180),
  };
}

function readLocal<T>(
  key: string,
  fallback: T,
  validate: (value: unknown) => value is T,
): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const value: unknown = JSON.parse(raw);
    return validate(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function isNotificationPosition(
  value: unknown,
): value is SpotifyNotificationPosition {
  if (typeof value !== "object" || value === null) return false;
  const position = value as Record<string, unknown>;
  return typeof position.x === "number" && typeof position.y === "number";
}

function writeLocal(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Restricted browser storage must not block playback.
  }
}

export function SpotifyPlaybackProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<SpotifyProfile | null>(null);
  const [connectionLoading, setConnectionLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [playback, setPlayback] = useState<SpotifyPlayback | null>(null);
  const [progressMs, setProgressMs] = useState<number | null>(null);
  const [playbackLoading, setPlaybackLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const progressRef = useRef<number | null>(null);
  const [notificationVisible, setNotificationVisible] = useState(() =>
    readLocal(
      NOTIFICATION_PREFERENCE_KEY,
      true,
      (value): value is boolean => typeof value === "boolean",
    ),
  );
  const [notificationPosition, setNotificationPosition] = useState(() =>
    readLocal(
      NOTIFICATION_POSITION_KEY,
      defaultPosition(),
      isNotificationPosition,
    ),
  );
  const [jamUrl, setJamUrl] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem(JAM_URL_KEY);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    writeLocal(NOTIFICATION_PREFERENCE_KEY, notificationVisible);
  }, [notificationVisible]);

  useEffect(() => {
    writeLocal(NOTIFICATION_POSITION_KEY, notificationPosition);
  }, [notificationPosition]);

  useEffect(() => {
    const queryJam = new URLSearchParams(location.search).get("jam");
    if (!queryJam || !isSpotifyJamUrl(queryJam) || queryJam === jamUrl) return;
    setJamUrl(queryJam);
    writeLocal(JAM_URL_KEY, queryJam);
  }, [jamUrl, location.search]);

  useEffect(() => {
    let active = true;
    const callbackParams = new URLSearchParams(location.search);

    async function loadConnection() {
      setConnectionLoading(true);
      setConnectionError(null);
      try {
        const completed = await finishSpotifyLogin(callbackParams);
        if (completed) {
          const params = new URLSearchParams();
          const queryJam = callbackParams.get("jam");
          if (queryJam) params.set("jam", queryJam);
          navigate(
            { pathname: "/spotify", search: params.toString() },
            { replace: true },
          );
        }
        if (!hasSpotifyToken()) {
          if (active) setProfile(null);
          return;
        }
        const nextProfile = await fetchSpotifyProfile();
        if (active) setProfile(nextProfile);
      } catch (reason) {
        if (!active) return;
        if (reason instanceof SpotifyAuthError) disconnectSpotify();
        setProfile(null);
        setConnectionError(
          reason instanceof SpotifyError
            ? reason.message
            : "Spotify konnte nicht verbunden werden.",
        );
      } finally {
        if (active) setConnectionLoading(false);
      }
    }

    void loadConnection();
    return () => {
      active = false;
    };
  }, [location.search, navigate]);

  useEffect(() => {
    if (!profile) {
      setPlayback(null);
      setProgressMs(null);
      progressRef.current = null;
      setPlaybackError(null);
      return;
    }

    let active = true;
    let firstLoad = true;
    async function refreshPlayback() {
      if (firstLoad) setPlaybackLoading(true);
      try {
        const nextPlayback = await fetchSpotifyPlayback();
        if (active) {
          const nextProgress = nextPlayback?.progressMs ?? null;
          setPlayback(nextPlayback);
          setProgressMs(nextProgress);
          progressRef.current = nextProgress;
          setPlaybackError(null);
        }
      } catch (reason) {
        if (!active) return;
        if (reason instanceof SpotifyAuthError) {
          disconnectSpotify();
          setProfile(null);
          setConnectionError(reason.message);
        } else {
          setPlaybackError(
            reason instanceof SpotifyError
              ? reason.message
              : "Die Wiedergabe konnte nicht geladen werden.",
          );
        }
      } finally {
        if (active) {
          firstLoad = false;
          setPlaybackLoading(false);
        }
      }
    }

    void refreshPlayback();
    const interval = window.setInterval(() => void refreshPlayback(), 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [profile]);

  useEffect(() => {
    if (!profile || !playback?.playing || progressRef.current === null) return;
    const interval = window.setInterval(() => {
      setProgressMs((current) => {
        const progress = progressRef.current ?? current;
        if (progress === null || playback.durationMs === null) return progress;
        const nextProgress = Math.min(progress + 1000, playback.durationMs);
        progressRef.current = nextProgress;
        return nextProgress;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [playback?.durationMs, playback?.playing, playback?.trackId, profile]);

  async function connectSpotify() {
    setConnectionError(null);
    try {
      await startSpotifyLogin();
    } catch (reason) {
      setConnectionError(
        reason instanceof SpotifyError
          ? reason.message
          : "Spotify konnte nicht geöffnet werden.",
      );
    }
  }

  function disconnect() {
    disconnectSpotify();
    setProfile(null);
    setPlayback(null);
    setProgressMs(null);
    progressRef.current = null;
    setConnectionError(null);
  }

  function saveJamUrl(value: string) {
    const normalized = value.trim();
    if (!isSpotifyJamUrl(normalized)) return false;
    setJamUrl(normalized);
    writeLocal(JAM_URL_KEY, normalized);
    const params = new URLSearchParams(location.search);
    params.set("jam", normalized);
    if (location.pathname === "/spotify") {
      navigate({ pathname: "/spotify", search: params.toString() });
    }
    return true;
  }

  const contextValue: SpotifyPlaybackContextValue = {
    configured: isSpotifyConfigured(),
    profile,
    connectionLoading,
    connectionError,
    playback,
    progressMs,
    playbackLoading,
    playbackError,
    notificationVisible,
    setNotificationVisible,
    notificationPosition,
    setNotificationPosition,
    jamUrl,
    saveJamUrl,
    connectSpotify,
    disconnect,
  };

  return (
    <SpotifyPlaybackContext.Provider value={contextValue}>
      {children}
      <SpotifyPlaybackOverlay />
    </SpotifyPlaybackContext.Provider>
  );
}

function SpotifyPlaybackOverlay() {
  const {
    profile,
    playback,
    progressMs,
    playbackLoading,
    playbackError,
    notificationVisible,
    notificationPosition,
    setNotificationPosition,
    jamUrl,
    saveJamUrl,
  } = useSpotifyPlayback();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      {profile && notificationVisible && (
        <SpotifyPlaybackNotification
          playback={playback}
          progressMs={progressMs}
          loading={playbackLoading}
          error={playbackError}
          position={notificationPosition}
          onPositionChange={setNotificationPosition}
          onClick={() => setDialogOpen(true)}
        />
      )}
      <SpotifyJamDialog
        key={jamUrl ?? "spotify-jam-setup"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        spotifyJamUrl={jamUrl}
        shareUrl={jamUrl ? getSpotifyJamShareUrl(jamUrl) : null}
        onSaveJamUrl={saveJamUrl}
        onOpenSpotify={() => window.location.assign("spotify:")}
      />
    </>
  );
}
