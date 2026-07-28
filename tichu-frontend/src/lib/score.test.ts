import { describe, expect, it } from "vitest";
import { calculateRoundScore, validateRoundScore } from "./score";

describe("validateRoundScore", () => {
  it("rejects an empty round", () => {
    expect(validateRoundScore(0, 0, false).valid).toBe(false);
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
