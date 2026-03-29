"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import {
  clearStoredAuthSession,
  getStoredAuthSession,
  setStoredAuthSession,
  StoredAuthSession,
} from "@/lib/auth-storage";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  registerProprietario,
} from "@/services";
import { AuthUser, LoginPayload, RegisterProprietarioPayload } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (payload: LoginPayload) => Promise<AuthUser>;
  signUpProprietario: (payload: RegisterProprietarioPayload) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    clearStoredAuthSession();
    setUser(null);
    setToken(null);
  }, []);

  const persistSession = useCallback((session: StoredAuthSession) => {
    setStoredAuthSession(session);
    setUser(session.user);
    setToken(session.token);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      const storedSession = getStoredAuthSession();

      if (!storedSession) {
        if (isMounted) setLoading(false);
        return;
      }

      if (isMounted) {
        setUser(storedSession.user);
        setToken(storedSession.token);
      }

      try {
        const freshUser = await getCurrentUser();

        if (!isMounted) return;

        persistSession({
          token: storedSession.token,
          expiresAt: storedSession.expiresAt,
          user: freshUser,
        });
      } catch {
        if (isMounted) {
          clearSession();
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    function handleUnauthorized() {
      clearSession();
    }

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    void bootstrapAuth();

    return () => {
      isMounted = false;
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [clearSession, persistSession]);

  const signIn = useCallback(
    async (payload: LoginPayload) => {
      const session = await loginRequest(payload);
      persistSession(session);
      return session.user;
    },
    [persistSession]
  );

  const signUpProprietario = useCallback(
    async (payload: RegisterProprietarioPayload) => {
      const session = await registerProprietario(payload);
      persistSession(session);
      return session.user;
    },
    [persistSession]
  );

  const signOut = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Ignora erro de logout remoto e limpa sessao local de qualquer forma.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const refreshUser = useCallback(async () => {
    const currentUser = await getCurrentUser();
    const currentSession = getStoredAuthSession();

    if (!currentSession) {
      clearSession();
      return;
    }

    persistSession({
      ...currentSession,
      user: currentUser,
    });
  }, [clearSession, persistSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      signIn,
      signUpProprietario,
      signOut,
      refreshUser,
    }),
    [user, token, loading, signIn, signUpProprietario, signOut, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
