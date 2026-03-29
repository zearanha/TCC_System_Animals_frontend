import { getStoredAuthToken } from "@/lib/auth-storage";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3002"
).replace(/\/$/, "");

type RequestConfig = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const { body, headers, ...restConfig } = config;
  const token = getStoredAuthToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...restConfig,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store"
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth:unauthorized"));
    }

    let message = `Erro na requisicao (${response.status}).`;
    try {
      const parsed = (await response.json()) as { message?: string; error?: string };
      if (parsed.message) {
        message = parsed.message;
      } else if (parsed.error) {
        message = parsed.error;
      }
    } catch {
      // Mantem a mensagem padrao quando a resposta nao e JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: "POST", body }),
  put: <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: "PUT", body }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" })
};
