import { describe, expect, it } from "vitest";
import {
  calculateRoundScore,
  getRoundKeyForInput,
  hasRoundInput,
  validateRoundScore,
} from "./score";

describe("hasRoundInput", () => {
  it("treats an untouched or cleared round as empty", () => {
    expect(hasRoundInput(0, 0, null, {})).toBe(false);
    expect(hasRoundInput(0, 0, null, { player1: null })).toBe(false);
    expect(hasRoundInput(0, 0, "team1", {})).toBe(true);
    expect(hasRoundInput(0, 0, null, {})).toBe(false);
    expect(hasRoundInput(0, 0, null, { player1: true })).toBe(true);
    expect(hasRoundInput(0, 0, null, { player1: false })).toBe(true);
    expect(hasRoundInput(0, 0, null, { player1: null })).toBe(false);
  });

  it("keeps negative and non-zero base scores as input", () => {
    expect(hasRoundInput(-50, 150, null, {})).toBe(true);
    expect(hasRoundInput(50, 0, null, {})).toBe(true);
  });
});

describe("getRoundKeyForInput", () => {
  it("does not create a key for an empty round", () => {
    const createKey = () => "new-key";
    expect(getRoundKeyForInput(false, null, createKey)).toBeNull();
  });

  it("reuses a key while retrying the same input", () => {
    let creations = 0;
    const createKey = () => {
      creations += 1;
      return "stable-key";
    };

    const firstKey = getRoundKeyForInput(true, null, createKey);
    const retryKey = getRoundKeyForInput(true, firstKey, createKey);

    expect(firstKey).toBe("stable-key");
    expect(retryKey).toBe(firstKey);
    expect(creations).toBe(1);
  });
});

describe("validateRoundScore", () => {
  it("rejects an empty round", () => {
    expect(validateRoundScore(0, 0, false).valid).toBe(false);
  });

  it("allows a zero-equivalent score only when a special case is active", () => {
    expect(validateRoundScore(0, 0, true).valid).toBe(true);
  });

  it("keeps valid negative scores compatible with the score rules", () => {
    expect(validateRoundScore(-50, 50, true).valid).toBe(true);
  });

  it("requires team scores to be divisible by five", () => {
    expect(validateRoundScore(53, 47, true).message).toContain("durch 5");
  });

  it("requires a round total divisible by one hundred", () => {
    expect(validateRoundScore(50, 50, true).valid).toBe(true);
    expect(validateRoundScore(50, 45, true).valid).toBe(false);
  });
});

describe("calculateRoundScore", () => {
  it("adds Tichu adjustments", () => {
    expect(calculateRoundScore(100, -100, false)).toBe(0);
  });

  it("adds Tichu adjustments to a double victory", () => {
    expect(calculateRoundScore(0, 100, true)).toBe(300);
    expect(calculateRoundScore(0, -100, true)).toBe(100);
  });
});
