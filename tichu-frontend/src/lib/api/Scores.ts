import type { SubmitScoreRequest } from "../Types";
import { requestVoid } from "./client";
import { apiPaths } from "./paths";

export async function submitScore(
  gameId: string,
  data: SubmitScoreRequest,
): Promise<void> {
  return requestVoid(
    apiPaths.roundResults(gameId),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
    "Fehler beim Übermitteln der Punkte.",
  );
}
