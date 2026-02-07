
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export interface ApiResponse<T> {
  status: number;
  data: T;
  headers: Headers;
}

class ApiClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.authToken = localStorage.getItem("eco_lion_auth_token");
  }

  setAuthToken(token: string) {
    this.authToken = token;
    localStorage.setItem("eco_lion_auth_token", token);
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

  async request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const response = await this.rawRequest(path, options);
    
    // Handle auth errors (expired token)
    if (response.status === 401) {
        // Potential logic to refresh token or logout
        console.warn("Unauthorized request. Token might be invalid.");
    }

    const text = await response.text();
    let data: T;
    try {
        data = JSON.parse(text) as T;
    } catch {
        data = text as unknown as T;
    }

    return {
        status: response.status,
        data,
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

  async ensureAuth(): Promise<void> {
    const existingToken = localStorage.getItem("eco_lion_auth_token");
    if (existingToken) {
        this.authToken = existingToken;
        return;
    }

    // Anonymous Registration Flow
    console.log("No token found. Registering anonymous user...");

    try {
        // 1. Begin
        const userId = `User-${Date.now()}`;
        const beginRes = await fetch(`${this.baseUrl}/v1/auth/register/begin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ displayName: userId }),
        }).then(r => r.json());

        // 2. Finish (Echo challenge as credential for dev mode)
        const testCredential = `test-credential-${beginRes.challenge}`;
        const finishRes = await fetch(`${this.baseUrl}/v1/auth/register/finish`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sessionId: beginRes.sessionId,
                credential: testCredential,
            }),
        }).then(r => r.json());

        if (finishRes.token) {
            console.log("Registered successfully. Token received.");
            this.setAuthToken(finishRes.token);
        } else {
            console.error("Failed to register anonymous user", finishRes);
        }
    } catch (error) {
        console.error("Auth registration failed:", error);
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

export async function apiRequest<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: unknown
): Promise<T> {
  await apiClient.ensureAuth();
  const res = await apiClient.request<T>(path, { 
    method, 
    body: body ? JSON.stringify(body) : undefined 
  });
  return res.data;
}
