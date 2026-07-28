import { afterEach, describe, expect, it, vi } from "vitest";
import { getApiErrorMessage, localizeApiError, requestJson } from "./client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("localizeApiError", () => {
  it("maps duplicate names and validation details to German messages", () => {
    expect(
      localizeApiError(
        409,
        "Team name already exists",
        "Team konnte nicht erstellt werden.",
      ),
    ).toBe("Dieser Name ist bereits vergeben.");
    expect(
      localizeApiError(
        400,
        "Scores must add up to a multiple of 100",
        "Fehler beim Übermitteln der Punkte.",
      ),
    ).toContain("Punkte müssen");
  });

  it("uses a safe German fallback for unknown technical details", () => {
    expect(
      localizeApiError(
        500,
        "NullPointerException at Service.java:42",
        "Die Anfrage ist fehlgeschlagen.",
      ),
    ).toBe("Der Server konnte die Anfrage nicht verarbeiten.");
    expect(
      getApiErrorMessage(new Error("raw technical detail"), "Sichere Meldung"),
    ).toBe("Sichere Meldung");
  });
});

describe("requestJson", () => {
  it("does not expose a plain-text backend duplicate error", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response("Player name already exists", { status: 409 }),
        ),
    );

    const result = requestJson(
      "/players",
      undefined,
      "Spieler konnte nicht erstellt werden.",
    );

    await expect(result).rejects.toEqual(
      expect.objectContaining({
        message: "Dieser Name ist bereits vergeben.",
        status: 409,
      }),
    );
  });

  it("maps structured validation violations", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            parameterViolations: [
              {
                message: "Only one successful Tichu call is allowed per round",
              },
            ],
          }),
          { status: 400 },
        ),
      ),
    );

    await expect(requestJson("/games/game-1/round-results")).rejects.toThrow(
      "Tichu-Angaben sind ungültig",
    );
  });
});
