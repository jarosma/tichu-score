import type { ResponseValidator } from "./validation";

const API_BASE_URL = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || "/api"
).replace(/\/$/, "");

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export function getApiErrorMessage(
  reason: unknown,
  fallbackMessage: string,
): string {
  return reason instanceof ApiError ? reason.message : fallbackMessage;
}

function asMessage(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function violationMessages(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((violation) =>
      isRecord(violation) ? asMessage(violation.message) : undefined,
    )
    .filter((message): message is string => Boolean(message));
}

function parseErrorBody(body: string): {
  code?: string;
  detail?: string;
} {
  if (!body.trim()) return {};

  try {
    const data: unknown = JSON.parse(body);
    if (!isRecord(data)) return {};

    const detail = [
      ...violationMessages(data.parameterViolations),
      ...violationMessages(data.propertyViolations),
      ...violationMessages(data.classViolations),
      asMessage(data.message),
    ].find(Boolean);
    return {
      code: asMessage(data.code) ?? asMessage(data.errorCode),
      detail,
    };
  } catch {
    return body.trim().startsWith("<") ? {} : { detail: body.trim() };
  }
}

export function localizeApiError(
  status: number,
  detail: string | undefined,
  fallbackMessage: string,
  code?: string,
): string {
  const normalizedDetail = detail?.toLowerCase() ?? "";
  const normalizedCode = code?.toLowerCase().replace(/[-\s]/g, "_");

  if (status === 0) return "Der Server ist nicht erreichbar.";
  if (
    normalizedCode === "duplicate_name" ||
    normalizedCode === "name_already_exists" ||
    /(?:name|namen).*(?:already exists|duplicate)|(?:already exists|duplicate).*(?:name|namen)/.test(
      normalizedDetail,
    )
  ) {
    return "Dieser Name ist bereits vergeben.";
  }
  if (
    normalizedCode === "game_finish_pending" ||
    /waiting for end confirmation|finish pending|wird gerade beendet/.test(
      normalizedDetail,
    )
  ) {
    return "Das Spiel wird gerade beendet. Bitte warte einen Moment.";
  }
  if (
    /scores? .*multiple|invalid score|scores? must add up/.test(
      normalizedDetail,
    )
  ) {
    return "Die Punkte müssen durch 5 teilbar sein und zusammen ein Vielfaches von 100 ergeben.";
  }
  if (
    /tichu|player cannot submit duplicate|only one successful/.test(
      normalizedDetail,
    )
  ) {
    return "Die Tichu-Angaben sind ungültig. Bitte prüfe die Auswahl.";
  }
  if (
    /teams? (?:are )?not distinct|players? (?:are )?not distinct|different players/.test(
      normalizedDetail,
    )
  ) {
    return "Die beiden Teams müssen aus unterschiedlichen Spielern bestehen.";
  }
  if (/not enabled|disabled player/.test(normalizedDetail)) {
    return "Es können nur aktive Teams und Spieler verwendet werden.";
  }
  if (/belongs to an enabled team/.test(normalizedDetail)) {
    return "Der Spieler gehört noch zu einem aktiven Team.";
  }
  if (/referenced by a game|referenced by a team/.test(normalizedDetail)) {
    return "Dieser Eintrag wird noch verwendet und kann nicht gelöscht werden.";
  }
  if (/does not exist|not found|not available/.test(normalizedDetail)) {
    return "Die angeforderten Daten wurden nicht gefunden.";
  }

  if (status === 400 || normalizedCode === "validation") {
    return "Die Eingaben sind ungültig. Bitte prüfe deine Angaben.";
  }
  if (status === 401)
    return "Für diese Aktion ist eine Anmeldung erforderlich.";
  if (status === 403) return "Du darfst diese Aktion nicht ausführen.";
  if (status === 404) return "Die angeforderten Daten wurden nicht gefunden.";
  if (status === 409) {
    return "Die Änderung ist mit dem aktuellen Stand nicht vereinbar.";
  }
  if (status >= 500) return "Der Server konnte die Anfrage nicht verarbeiten.";

  return fallbackMessage || "Die Anfrage ist fehlgeschlagen.";
}

async function createApiError(
  response: Response,
  fallbackMessage: string,
): Promise<ApiError> {
  let body = "";
  try {
    body = await response.text();
  } catch {
    // The status still provides a safe, localized fallback.
  }
  const { code, detail } = parseErrorBody(body);
  if (import.meta.env.DEV && detail) {
    console.debug("API-Fehlerdetails", { status: response.status, detail });
  }
  return new ApiError(
    localizeApiError(response.status, detail, fallbackMessage, code),
    response.status,
  );
}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, init);
}

export function jsonRequest(
  method: "POST" | "PATCH",
  payload: unknown,
): RequestInit {
  if (
    typeof payload !== "object" ||
    payload === null ||
    Array.isArray(payload)
  ) {
    throw new ApiError("Die Anfrage konnte nicht erstellt werden.", 0);
  }

  let body: string | undefined;
  try {
    body = JSON.stringify(payload);
  } catch {
    throw new ApiError("Die Anfrage konnte nicht erstellt werden.", 0);
  }

  if (body === undefined) {
    throw new ApiError("Die Anfrage konnte nicht erstellt werden.", 0);
  }

  return {
    method,
    headers: { "Content-Type": "application/json" },
    body,
  };
}

async function readJsonResponse<T>(
  response: Response,
  validateResponse: ResponseValidator<T>,
): Promise<T> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError(
      "Die Serverantwort ist kein gültiges JSON.",
      response.status,
    );
  }

  if (!validateResponse(payload)) {
    throw new ApiError(
      "Die Serverantwort hat ein ungültiges Format.",
      response.status,
    );
  }

  return payload;
}

export async function requestJson<T>(
  path: string,
  init: RequestInit | undefined,
  validateResponse: ResponseValidator<T>,
  fallbackMessage = "Die Anfrage ist fehlgeschlagen.",
): Promise<T> {
  let response: Response;
  try {
    response = await apiFetch(path, init);
  } catch {
    throw new ApiError("Der Server ist nicht erreichbar.", 0);
  }

  if (!response.ok) throw await createApiError(response, fallbackMessage);
  return readJsonResponse(response, validateResponse);
}

export async function requestVoid(
  path: string,
  init?: RequestInit,
  fallbackMessage = "Die Anfrage ist fehlgeschlagen.",
): Promise<void> {
  let response: Response;
  try {
    response = await apiFetch(path, init);
  } catch {
    throw new ApiError("Der Server ist nicht erreichbar.", 0);
  }

  if (!response.ok) throw await createApiError(response, fallbackMessage);
}
