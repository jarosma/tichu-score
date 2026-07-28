export interface ScoreValidation {
  valid: boolean;
  message: string;
}

export function validateRoundScore(
  team1Score: number,
  team2Score: number,
  hasInput: boolean,
): ScoreValidation {
  if (!hasInput) {
    return { valid: false, message: "Gib die Punkte für diese Runde ein." };
  }
  if (team1Score % 5 !== 0 || team2Score % 5 !== 0) {
    return {
      valid: false,
      message: "Beide Teamwerte müssen durch 5 teilbar sein.",
    };
  }
  if ((team1Score + team2Score) % 100 !== 0) {
    return {
      valid: false,
      message: "Die Summe der beiden Teamwerte muss durch 100 teilbar sein.",
    };
  }
  return { valid: true, message: "Runde kann gespeichert werden." };
}

export function calculateRoundScore(
  baseScore: number,
  tichuAdjustment: number,
  doubleVictory: boolean,
): number {
  if (doubleVictory) return 200 + tichuAdjustment;
  return baseScore + tichuAdjustment;
}
