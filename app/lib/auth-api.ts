const API_BASE = "http://localhost:3600/api";

export interface AuthUser {
  id: string;
  nombre: string;
  email: string;
  dni: string;
  telefono: string;
  rol: string;
  createdAt: string;
}

export interface RegisterData {
  nombre: string;
  email: string;
  dni: string;
  telefono: string;
  rol: string;
  password: string;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include", // envía y recibe cookies HTTP-only
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Error del servidor");
  return data as T;
}

export const authApi = {
  register: (data: RegisterData) =>
    apiFetch<{ user: AuthUser; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (email: string, password: string) =>
    apiFetch<{ user: AuthUser; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => apiFetch<AuthUser>("/auth/me"),

  logout: () => apiFetch<{ message: string }>("/auth/logout", { method: "POST" }),
};
