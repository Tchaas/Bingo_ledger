const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user";

type StorageType = "local" | "session";

export class ApiError extends Error {
  status: number;
  data?: Record<string, unknown>;

  constructor(message: string, status: number, data?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const getStorage = (type: StorageType) =>
  type === "local" ? localStorage : sessionStorage;

const readFromStorage = (key: string): string | null =>
  localStorage.getItem(key) ?? sessionStorage.getItem(key);

const getTokenStorageType = (): StorageType | null => {
  if (localStorage.getItem(REFRESH_TOKEN_KEY)) {
    return "local";
  }
  if (sessionStorage.getItem(REFRESH_TOKEN_KEY)) {
    return "session";
  }
  return null;
};

export const getAuthStorageType = (): StorageType | null => getTokenStorageType();

export const getAccessToken = () => readFromStorage(ACCESS_TOKEN_KEY);

export const getRefreshToken = () => readFromStorage(REFRESH_TOKEN_KEY);

export const setAuthTokens = (
  tokens: { accessToken: string; refreshToken: string },
  rememberMe: boolean
) => {
  clearAuthStorage();
  const storage = getStorage(rememberMe ? "local" : "session");
  storage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  storage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
};

export const setStoredUser = (user: unknown, rememberMe: boolean) => {
  const storage = getStorage(rememberMe ? "local" : "session");
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(USER_KEY);
  storage.setItem(USER_KEY, JSON.stringify(user));
};

export const getStoredUser = <T>(): T | null => {
  const stored = readFromStorage(USER_KEY);
  return stored ? (JSON.parse(stored) as T) : null;
};

export const clearAuthStorage = () => {
  [localStorage, sessionStorage].forEach((storage) => {
    storage.removeItem(ACCESS_TOKEN_KEY);
    storage.removeItem(REFRESH_TOKEN_KEY);
    storage.removeItem(USER_KEY);
  });
};

const updateAccessToken = (token: string) => {
  const storageType = getTokenStorageType();
  if (!storageType) {
    return;
  }
  getStorage(storageType).setItem(ACCESS_TOKEN_KEY, token);
};

const parseErrorMessage = (data: Record<string, unknown>, fallback: string) => {
  const errorText =
    (typeof data.error === "string" && data.error) ||
    (typeof data.message === "string" && data.message) ||
    fallback;

  if (Array.isArray(data.required)) {
    return `${errorText}: ${data.required.join(", ")}`;
  }

  return errorText;
};

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  if (!response.ok) {
    clearAuthStorage();
    return false;
  }

  const data = (await response.json()) as { access_token?: string };
  if (data.access_token) {
    updateAccessToken(data.access_token);
    return true;
  }

  return false;
};

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  skipAuth?: boolean;
  retry?: boolean;
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const { body, headers, skipAuth, retry = true, ...rest } = options;
  const accessToken = getAccessToken();
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("Content-Type") && body && !(body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (!skipAuth && accessToken) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
    body:
      body && !(body instanceof FormData) ? JSON.stringify(body) : (body as BodyInit | null),
  });

  if (response.status === 401 && retry && !skipAuth && path !== "/auth/refresh") {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request<T>(path, { ...options, retry: false });
    }
  }

  if (!response.ok) {
    let errorData: Record<string, unknown> = {};
    try {
      errorData = (await response.json()) as Record<string, unknown>;
    } catch (error) {
      errorData = {};
    }

    throw new ApiError(
      parseErrorMessage(errorData, response.statusText),
      response.status,
      errorData
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
};

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
