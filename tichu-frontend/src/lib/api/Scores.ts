import type { ScoreRound, SubmitScoreRequest } from "../Types";
import { requestJson } from "./client";
import { apiPaths } from "./paths";

export async function submitScore(
  gameId: string,
  data: SubmitScoreRequest,
): Promise<ScoreRound> {
  return requestJson<ScoreRound>(
    apiPaths.roundResults(gameId),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
    "Fehler beim Übermitteln der Punkte.",
  );
}
