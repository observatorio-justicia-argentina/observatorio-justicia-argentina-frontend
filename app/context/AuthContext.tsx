"use client";

import { createContext, useContext, useEffect, useReducer, useCallback, ReactNode } from "react";
import { authApi, AuthUser, RegisterData } from "../lib/auth-api";

// ── Estado ───────────────────────────────────────────────────────────────────

interface AuthState {
  user: AuthUser | null;
  /** true mientras se verifica la sesión inicial */
  booting: boolean;
}

type Action = { type: "SET_USER"; user: AuthUser } | { type: "CLEAR_USER" } | { type: "BOOT_DONE" };

function reducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case "SET_USER":
      return { user: action.user, booting: false };
    case "CLEAR_USER":
      return { user: null, booting: false };
    case "BOOT_DONE":
      return { ...state, booting: false };
    default:
      return state;
  }
}

// ── Contexto ─────────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { user: null, booting: true });

  // Al montar, intenta recuperar la sesión desde la cookie existente
  useEffect(() => {
    authApi
      .me()
      .then((user) => dispatch({ type: "SET_USER", user }))
      .catch(() => dispatch({ type: "BOOT_DONE" }));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await authApi.login(email, password);
    dispatch({ type: "SET_USER", user });
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const { user } = await authApi.register(data);
    dispatch({ type: "SET_USER", user });
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    dispatch({ type: "CLEAR_USER" });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
