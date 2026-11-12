// The one way the web app talks to the API: same-origin /api, proxied by
// app/api/[...path]/route.ts, with cookies and a single silent token refresh.

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// A 401 from these is an answer (wrong password, dead session), not a cue to refresh.
const NO_REFRESH = [
  "/auth/login",
  "/auth/signup",
  "/auth/demo",
  "/auth/refresh",
  "/auth/logout",
];

let onUnauthorized: () => void = () => {};
export function setOnUnauthorized(handler: () => void) {
  onUnauthorized = handler;
}

const send = (endpoint: string, options: RequestInit) =>
  fetch(`/api${endpoint}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });

// Concurrent 401s share one refresh request instead of racing each other.
let refreshing: Promise<boolean> | null = null;
const refreshSession = () =>
  (refreshing ??= send("/auth/refresh", { method: "POST" })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => (refreshing = null)));

export async function api<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  let res = await send(endpoint, options);
  if (res.status === 401 && !NO_REFRESH.includes(endpoint)) {
    if (await refreshSession()) res = await send(endpoint, options);
    if (res.status === 401) onUnauthorized();
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // class-validator sends a list of messages; the first one is enough to act on.
    const message = Array.isArray(data.message)
      ? data.message[0]
      : data.message;
    throw new ApiError(message || `Request failed (${res.status})`, res.status);
  }
  return data as T;
}

export const errorMessage = (
  err: unknown,
  fallback = "Something went wrong. Try again.",
) => (err instanceof Error && err.message ? err.message : fallback);
