const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const AUTH_STORAGE_KEY = "eco_lion_auth_token";

export interface ApiResponse<T> {
  status: number;
  data: T;
  headers: Headers;
}

export class ApiRequestError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.data = data;
  }
}

class ApiClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.authToken = localStorage.getItem(AUTH_STORAGE_KEY);
  }

  setAuthToken(token: string) {
    this.authToken = token;
    localStorage.setItem(AUTH_STORAGE_KEY, token);
  }

  clearAuthToken() {
    this.authToken = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  getAuthToken() {
    return this.authToken;
  }

  async rawRequest(path: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    return response;
  }

  async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const response = await this.rawRequest(path, options);

    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (response.status === 401) {
      this.clearAuthToken();
    }
    if (!response.ok) {
      const message =
        (typeof data === "object" && data !== null && "error" in data && typeof data.error === "string")
          ? data.error
          : `Request failed with status ${response.status}`;
      throw new ApiRequestError(response.status, message, data);
    }

    return {
      status: response.status,
      data: data as T,
      headers: response.headers,
    };
  }

  async get<T>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: "GET" });
  }

  async post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    const options: RequestInit = { method: "POST" };

    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    return this.request<T>(path, options);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

export async function apiRequest<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: unknown
): Promise<T> {
  const res = await apiClient.request<T>(path, {
    method,
    body: body ? JSON.stringify(body) : undefined
  });
  return res.data;
}
