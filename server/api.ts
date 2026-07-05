/* eslint-disable @typescript-eslint/no-unused-vars */

interface FetchOptions extends RequestInit {
  cache?: RequestCache;
  credentials?: RequestCredentials;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const AUTH_COOKIE_NAME = "Stevia-token";
const AUTH_STORAGE_KEY = "Stevia-token";

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const FETCH_TIMEOUT_MS = parsePositiveInt(process.env.API_FETCH_TIMEOUT_MS, 6000);
const API_UNAVAILABLE_COOLDOWN_MS = parsePositiveInt(process.env.API_UNAVAILABLE_COOLDOWN_MS, 8000);
let apiUnavailableUntil = 0;

const AUTH_COOKIE_OPTIONS = {
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

function getCurrentLocale(): string {
  if (typeof window === "undefined") return "en";
  const match = window.location.pathname.match(/^\/(en|ar)(?:\/|$)/);
  return match?.[1] || "en";
}

function setBrowserCookie(name: string, value: string, options: Record<string, any> = {}): void {
  if (typeof document === "undefined") return;
  const parts = [`${name}=${encodeURIComponent(value)}`, `path=${options.path || "/"}`];
  if (options.sameSite) parts.push(`samesite=${options.sameSite}`);
  if (options.secure) parts.push("secure");
  if (typeof options.maxAge === "number") parts.push(`max-age=${options.maxAge}`);
  document.cookie = parts.join("; ");
}

function deleteBrowserCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0`;
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const localToken = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (localToken) return localToken;
  } catch {}

  const cookies = typeof document !== "undefined" && document.cookie ? document.cookie.split("; ") : [];
  const found = cookies.find((part) => part.startsWith(`${AUTH_COOKIE_NAME}=`));
  return found ? decodeURIComponent(found.slice(AUTH_COOKIE_NAME.length + 1)) : null;
}

export async function setAuthToken(token: string): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AUTH_STORAGE_KEY, token);
  } catch {}
  setBrowserCookie(AUTH_COOKIE_NAME, token, { ...AUTH_COOKIE_OPTIONS, maxAge: 60 * 60 * 24 * 30 });
}

export async function clearAuthToken(): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {}
  }
  deleteBrowserCookie(AUTH_COOKIE_NAME);
}







function isApiInCooldown(): boolean {
  return Date.now() < apiUnavailableUntil;
}

function markApiUnavailable(): void {
  apiUnavailableUntil = Date.now() + API_UNAVAILABLE_COOLDOWN_MS;
}

function getErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const err = error as any;
  return err?.cause?.code || err?.code;
}

function getErrorName(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const err = error as any;
  return err?.name || err?.cause?.name;
}

function isNetworkFailure(error: unknown): boolean {
  const code = getErrorCode(error);
  const name = getErrorName(error);
  const message = error instanceof Error ? error.message.toLowerCase() : String(error ?? "").toLowerCase();

  const networkCodes = new Set([
    "UND_ERR_CONNECT_TIMEOUT",
    "UND_ERR_HEADERS_TIMEOUT",
    "UND_ERR_SOCKET",
    "ECONNREFUSED",
    "ENOTFOUND",
    "ETIMEDOUT",
  ]);

  return (
    name === "AbortError" ||
    (code ? networkCodes.has(code) : false) ||
    message.includes("fetch failed") ||
    message.includes("network")
  );
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const locale = getCurrentLocale();
  const { cache, ...restOptions } = options;

  const method = String(restOptions.method || "GET").toUpperCase();
  const shouldCache = method === "GET" || method === "HEAD";
  let effectiveCache: RequestCache = cache ?? (shouldCache ? "default" : "no-store");
  let fetchTimeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    if (!BASE_URL) {
      throw new Error(JSON.stringify({ error: "Missing NEXT_PUBLIC_API_URL", status: "error" }));
    }

    if (isApiInCooldown()) {
      return { error: "API temporarily unavailable", status: "error" } as T;
    }

    const token = getStoredToken();
    if (token && typeof cache === "undefined" && shouldCache) {
      effectiveCache = "no-store";
    }

    const base = BASE_URL.replace(/\/+$/g, "");
    const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${base}${path}`;

    const headers = new Headers(restOptions.headers || {});
    headers.set("Accept", "application/json");
    headers.set("X-Requested-With", "XMLHttpRequest");
    headers.set("X-Localization", locale);
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const body = restOptions.body;
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    if (body && typeof body === "string" && !isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const { headers: _ignoredHeaders, ...rest } = restOptions;

    let signal: AbortSignal | undefined = rest.signal;
    if (!signal) {
      const controller = new AbortController();
      signal = controller.signal;
      fetchTimeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    }

    let response = await fetch(url, {
      ...rest,
      signal,
      cache: effectiveCache,
      headers,
    });

    if (fetchTimeoutId) clearTimeout(fetchTimeoutId);

    const parseSuccessfulResponse = async (res: Response): Promise<T> => {
      const successContentType = res.headers.get("content-type");
      if (successContentType && successContentType.includes("application/json")) {
        return (await res.json()) as T;
      }
      const text = await res.text();
      return { error: "API returned non-JSON response", status: res.status, details: text.substring(0, 200) } as T;
    };

    if (!response.ok) {
      if (response.status === 401) {
        await clearAuthToken();

        const canRetryAsGuest = Boolean(token) && method === "GET" && !path.startsWith("/user") && path !== "/logout";
        if (canRetryAsGuest) {
          const retryHeaders = new Headers(headers);
          retryHeaders.delete("Authorization");
          response = await fetch(url, {
            ...rest,
            signal,
            cache: "no-store",
            headers: retryHeaders,
          });
          if (response.ok) {
            return parseSuccessfulResponse(response);
          }
        }
      }

      const contentType = response.headers.get("content-type");
      const errorText = await response.text();
      let errorData: any;

      if (contentType && contentType.includes("application/json")) {
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText, status: response.status };
        }
      } else {
        errorData = {
          error: "API returned non-JSON response",
          status: response.status,
          details: errorText.substring(0, 200),
        };
      }

      if (response.status === 404) {
        return errorData as T;
      }

      throw new Error(JSON.stringify(errorData));
    }

    return parseSuccessfulResponse(response);
  } catch (error) {
    if (fetchTimeoutId) clearTimeout(fetchTimeoutId);
    if (isNetworkFailure(error)) markApiUnavailable();
    if (process.env.NODE_ENV !== "production") {
      const isUnauth = error instanceof Error && error.message.includes("Unauthenticated");
      if (!isUnauth) {
        console.error("API request failed:", error);
      }
    }

    if (error instanceof Error) {
      try {
        return JSON.parse(error.message) as T;
      } catch {
        return { error: error.message, status: "error" } as T;
      }
    }

    return { error: "An unexpected error occurred", status: "error" } as T;
  }
}

export async function get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
  return fetchApi<T>(endpoint, { method: "GET", ...options });
}

export async function post<T>(endpoint: string, data: unknown, options?: FetchOptions): Promise<T> {
  return fetchApi<T>(endpoint, { method: "POST", body: JSON.stringify(data), ...options });
}

export async function postFormData<T>(endpoint: string, data: FormData, options?: FetchOptions): Promise<T> {
  return fetchApi<T>(endpoint, { method: "POST", body: data, ...options });
}

export async function put<T>(endpoint: string, data: unknown, options?: FetchOptions): Promise<T> {
  return fetchApi<T>(endpoint, { method: "PUT", body: JSON.stringify(data), ...options });
}

export async function putFormData<T>(endpoint: string, data: FormData, options?: FetchOptions): Promise<T> {
  return fetchApi<T>(endpoint, { method: "PUT", body: data, ...options });
}

export async function del<T>(endpoint: string, options?: FetchOptions): Promise<T> {
  return fetchApi<T>(endpoint, { method: "DELETE", ...options });
}
