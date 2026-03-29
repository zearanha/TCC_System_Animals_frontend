import { AuthUser } from "@/types";

const STORAGE_KEY = "monitoramento_animal_auth";

export interface StoredAuthSession {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getStoredAuthSession(): StoredAuthSession | null {
  if (!canUseStorage()) return null;

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue) as StoredAuthSession;
    if (!parsed?.token || !parsed?.user) return null;
    return parsed;
  } catch {
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
