import type { ScoreRound, SubmitScoreRequest } from "../Types";
import { jsonRequest, requestJson } from "./client";
import { apiPaths } from "./paths";
import { isScoreRound } from "./validation";

export async function submitScore(
  gameId: string,
  data: SubmitScoreRequest,
): Promise<ScoreRound> {
  return requestJson<ScoreRound>(
    apiPaths.roundResults(gameId),
    jsonRequest("POST", data),
    isScoreRound,
    "Fehler beim Übermitteln der Punkte.",
  );
}
