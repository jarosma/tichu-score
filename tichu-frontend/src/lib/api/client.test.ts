import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ApiError,
  getApiErrorMessage,
  jsonRequest,
  localizeApiError,
  requestJson,
} from "./client";
import { isPlayerArray } from "./validation";

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
      isPlayerArray,
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

    await expect(
      requestJson("/games/game-1/round-results", undefined, isPlayerArray),
    ).rejects.toThrow("Tichu-Angaben sind ungültig");
  });

  it("returns valid JSON only after response validation", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify([
              { id: "player-1", name: "Anna", elo: null, enabled: true },
            ]),
            { status: 200 },
          ),
        ),
    );

    await expect(
      requestJson("/players", undefined, isPlayerArray),
    ).resolves.toEqual([
      { id: "player-1", name: "Anna", elo: null, enabled: true },
    ]);
  });

  it("turns malformed JSON and malformed shapes into German ApiErrors", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("{broken", { status: 200 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ id: "player-1" }]), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      requestJson("/players", undefined, isPlayerArray),
    ).rejects.toEqual(
      expect.objectContaining({
        name: "ApiError",
        message: "Die Serverantwort ist kein gültiges JSON.",
      }),
    );
    await expect(
      requestJson("/players", undefined, isPlayerArray),
    ).rejects.toEqual(
      expect.objectContaining({
        name: "ApiError",
        message: "Die Serverantwort hat ein ungültiges Format.",
      }),
    );
  });

  it("handles primitive error payloads without crashing the error parser", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("null", { status: 500 })),
    );

    await expect(
      requestJson("/players", undefined, isPlayerArray),
    ).rejects.toEqual(
      expect.objectContaining({
        name: "ApiError",
        message: "Der Server konnte die Anfrage nicht verarbeiten.",
      }),
    );
  });
});

describe("jsonRequest", () => {
  it("creates JSON requests and rejects malformed request payloads", () => {
    expect(jsonRequest("POST", { name: "Anna" })).toEqual({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"name":"Anna"}',
    });
    expect(() => jsonRequest("POST", null)).toThrow(ApiError);

    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(() => jsonRequest("POST", circular)).toThrow(
      "Die Anfrage konnte nicht erstellt werden.",
    );
  });
});
