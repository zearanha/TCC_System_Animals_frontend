import { getStoredAuthToken } from "@/lib/auth-storage";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3002"
).replace(/\/$/, "");

type RequestConfig = Omit<RequestInit, "body"> & {
  body?: unknown;
};

function collectValidationMessages(value: unknown): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .map((item) => item.trim());
  }

  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap((item) =>
      collectValidationMessages(item)
    );
  }

  return [];
}

async function request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const { body, headers, ...restConfig } = config;
  const token = getStoredAuthToken();
  const isFormDataPayload = typeof FormData !== "undefined" && body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...restConfig,
    headers: {
      ...(isFormDataPayload ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body:
      body === undefined
        ? undefined
        : isFormDataPayload
          ? (body as FormData)
          : JSON.stringify(body),
    cache: "no-store"
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth:unauthorized"));
    }

    let message = `Erro na requisicao (${response.status}).`;
    try {
      const parsed = (await response.json()) as {
        message?: string;
        error?: string;
        details?: unknown;
      };
      if (parsed.message) {
        message = parsed.message;
      } else if (parsed.error) {
        if (parsed.error === "Erro de validacao" && parsed.details) {
          const details = collectValidationMessages(parsed.details);
          message =
            details.length > 0
              ? `${parsed.error}: ${details.join(" | ")}`
              : parsed.error;
        } else {
          message = parsed.error;
        }
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
