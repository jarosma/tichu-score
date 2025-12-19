const hostIp = import.meta.env.VITE_HOST_IP;
const BASE_URL = "http://" + hostIp + ":8080";

interface SubmitScoreRequest {
  team1Score: number;
  team2Score: number;
}

export async function submitScore(
  gameId: string,
  data: SubmitScoreRequest,
): Promise<void> {
  const res = await fetch(`${BASE_URL}/play/${gameId}/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Fehler beim Übermitteln des Scores");
  }
}
