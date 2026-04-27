import { AuthUser } from "@/types";

const STORAGE_KEY = "monitoramento_animal_auth";
const USER_ROLES = ["ADMIN", "AGENTE", "PROPRIETARIO"] as const;

export interface StoredAuthSession {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

function canUseStorage() {
  return typeof window !== "undefined";
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUserRole(value: unknown): value is AuthUser["perfil"] {
  return typeof value === "string" && (USER_ROLES as readonly string[]).includes(value);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isValidAuthUser(value: unknown): value is AuthUser {
  if (!isObject(value)) return false;

  return (
    typeof value.id === "string" &&
    value.id.trim().length > 0 &&
    typeof value.nome === "string" &&
    typeof value.email === "string" &&
    typeof value.ativo === "boolean" &&
    isUserRole(value.perfil) &&
    isNullableString(value.proprietarioId) &&
    isNullableString(value.agenteId)
  );
}

function isValidStoredAuthSession(value: unknown): value is StoredAuthSession {
  if (!isObject(value)) return false;

  return (
    typeof value.token === "string" &&
    value.token.trim().length > 0 &&
    typeof value.expiresAt === "string" &&
    value.expiresAt.trim().length > 0 &&
    isValidAuthUser(value.user)
  );
}

export function getStoredAuthSession(): StoredAuthSession | null {
  if (!canUseStorage()) return null;

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue);
    if (!isValidStoredAuthSession(parsed)) {
      clearStoredAuthSession();
      return null;
    }
    return parsed;
  } catch {
    clearStoredAuthSession();
    return null;
  }
}

export function setStoredAuthSession(session: StoredAuthSession): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredAuthSession(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function getStoredAuthToken(): string | null {
  return getStoredAuthSession()?.token ?? null;
}
