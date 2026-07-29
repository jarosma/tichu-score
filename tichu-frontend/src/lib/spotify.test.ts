import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  disconnectSpotify,
  fetchSpotifyPlayback,
  fetchSpotifyProfile,
  isSpotifyConfigured,
} from "./spotify";

describe("Spotify browser client", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("is disabled when no client ID is configured", () => {
    expect(isSpotifyConfigured()).toBe(false);
  });

  it("reads the connected profile and current track", async () => {
    sessionStorage.setItem(
      "tichu.spotify.token",
      JSON.stringify({
        accessToken: "test-token",
        refreshToken: null,
        expiresAt: Date.now() + 300_000,
      }),
    );
    const fetchMock = vi.spyOn(globalThis, "fetch");
    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ display_name: "Host", product: "premium" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            is_playing: true,
            progress_ms: 12_000,
            device: { name: "Wohnzimmer" },
            item: {
              type: "track",
              id: "track-1",
              name: "Song",
              duration_ms: 180_000,
              artists: [{ name: "Artist" }],
              album: {
                name: "Album",
                images: [{ url: "https://image.test/cover.jpg" }],
              },
              external_urls: {
                spotify: "https://open.spotify.com/track/track-1",
              },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );

    await expect(fetchSpotifyProfile()).resolves.toEqual({
      displayName: "Host",
      product: "premium",
    });
    await expect(fetchSpotifyPlayback()).resolves.toMatchObject({
      available: true,
      playing: true,
      trackName: "Song",
      artists: ["Artist"],
      deviceName: "Wohnzimmer",
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      headers: { Authorization: "Bearer test-token" },
    });
  });

  it("returns no playback when Spotify reports an idle player", async () => {
    sessionStorage.setItem(
      "tichu.spotify.token",
      JSON.stringify({
        accessToken: "test-token",
        refreshToken: null,
        expiresAt: Date.now() + 300_000,
      }),
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 204 }),
    );

    await expect(fetchSpotifyPlayback()).resolves.toBeNull();
  });

  it("clears the local connection", () => {
    sessionStorage.setItem("tichu.spotify.token", "token");
    disconnectSpotify();
    expect(sessionStorage.getItem("tichu.spotify.token")).toBeNull();
  });
});
