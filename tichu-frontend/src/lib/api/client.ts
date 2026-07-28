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

async function createApiError(
  response: Response,
  fallbackMessage: string,
): Promise<ApiError> {
  const body = await response.text();
  let message = fallbackMessage;

  if (body) {
    try {
      const data = JSON.parse(body) as {
        message?: string;
        parameterViolations?: Array<{ message?: string }>;
        propertyViolations?: Array<{ message?: string }>;
        classViolations?: Array<{ message?: string }>;
      };
      const violations = [
        ...(data.parameterViolations ?? []),
        ...(data.propertyViolations ?? []),
        ...(data.classViolations ?? []),
      ]
        .map((violation) => violation.message)
        .filter(Boolean);
      message = violations[0] ?? data.message ?? message;
    } catch {
      if (!body.trim().startsWith("<")) message = body;
    }
  }

  return new ApiError(message, response.status);
}

export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, init);
}

export async function requestJson<T>(
  path: string,
  init?: RequestInit,
  fallbackMessage = "Die Anfrage ist fehlgeschlagen.",
): Promise<T> {
  let response: Response;
  try {
    response = await apiFetch(path, init);
  } catch {
    throw new ApiError("Der Server ist nicht erreichbar.", 0);
  }

  if (!response.ok) throw await createApiError(response, fallbackMessage);
  return response.json() as Promise<T>;
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

export async function throwApiError(
  response: Response,
  fallbackMessage: string,
): Promise<never> {
  throw await createApiError(response, fallbackMessage);
}
