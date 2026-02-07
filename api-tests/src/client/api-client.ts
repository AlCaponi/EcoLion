type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiClientOptions {
  baseUrl: string;
  authToken?: string;
}

export interface ApiResponse<T> {
  status: number;
  data: T;
  headers: Headers;
}

export function createApiClient(options: ApiClientOptions) {
  const { baseUrl } = options;
  let authToken = options.authToken;

  async function request<T>(
    path: string,
    method: HttpMethod = "GET",
    body?: unknown,
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let data: T;
    try {
      data = JSON.parse(text) as T;
    } catch {
      data = text as unknown as T;
    }

    return { status: res.status, data, headers: res.headers };
  }

  return {
    get: <T>(path: string) => request<T>(path, "GET"),
    post: <T>(path: string, body?: unknown) => request<T>(path, "POST", body),
    put: <T>(path: string, body?: unknown) => request<T>(path, "PUT", body),
    patch: <T>(path: string, body?: unknown) =>
      request<T>(path, "PATCH", body),
    delete: <T>(path: string) => request<T>(path, "DELETE"),
    setAuthToken: (token: string) => {
      authToken = token;
    },
    getAuthToken: () => authToken,
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
