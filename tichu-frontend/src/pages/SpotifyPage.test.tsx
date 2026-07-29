import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { SpotifyPlaybackProvider } from "@/components/spotify/SpotifyPlaybackProvider";
import { SpotifyPage } from "./SpotifyPage";

describe("SpotifyPage", () => {
  it("shows the credential-free setup state and accepts a Jam link", async () => {
    render(
      <MemoryRouter>
        <SpotifyPlaybackProvider>
          <SpotifyPage />
        </SpotifyPlaybackProvider>
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(
        screen.getByText(/Spotify ist noch nicht eingerichtet/),
      ).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: /Mit Spotify verbinden/ }),
    ).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Spotify-Jam-Link"), {
      target: { value: "https://spotify.link/example" },
    });
    fireEvent.click(
      screen.getByRole("button", {
        name: "Jam-Link übernehmen",
        hidden: true,
      }),
    );

    expect(
      await screen.findByDisplayValue("https://spotify.link/example"),
    ).toBeInTheDocument();
  });

  it("rejects a non-Spotify Jam link", async () => {
    render(
      <MemoryRouter>
        <SpotifyPlaybackProvider>
          <SpotifyPage />
        </SpotifyPlaybackProvider>
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(
        screen.getByRole("button", {
          name: "Jam-Link übernehmen",
          hidden: true,
        }),
      ).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByLabelText("Spotify-Jam-Link"), {
      target: { value: "https://example.test/jam" },
    });
    fireEvent.click(
      screen.getByRole("button", {
        name: "Jam-Link übernehmen",
        hidden: true,
      }),
    );

    await waitFor(() =>
      expect(document.body.textContent).toContain(
        "Bitte füge einen gültigen Spotify-Jam-Link ein.",
      ),
    );
  });
});
