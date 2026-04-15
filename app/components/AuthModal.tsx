"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { RegisterData } from "../lib/auth-api";

const ROLES = [
  "Periodista",
  "Abogado/a",
  "Estudiante de derecho",
  "Ciudadano/a",
  "Funcionario/a público/a",
  "Investigador/a",
  "ONG / Organización civil",
  "Otro",
];

type Tab = "login" | "register";

// ── Componentes auxiliares ───────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1 block text-xs font-semibold" style={{ color: "#7d8590" }}>
      {children}
      {required && <span style={{ color: "#f85149" }}> *</span>}
    </label>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
        style={{ backgroundColor: "#0d1117", borderColor: "#30363d", color: "#e6edf3" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#74ACDF")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#30363d")}
      />
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="rounded-lg border px-4 py-2.5 text-sm"
      style={{ backgroundColor: "#f8514910", borderColor: "#f85149", color: "#f85149" }}
    >
      {message}
    </div>
  );
}

// ── Modal principal ──────────────────────────────────────────────────────────

interface AuthModalProps {
  initialTab?: Tab;
  onClose: () => void;
}

export default function AuthModal({ initialTab = "login", onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register fields
  const [reg, setReg] = useState<RegisterData & { confirmPassword: string }>({
    nombre: "",
    email: "",
    dni: "",
    telefono: "",
    rol: "",
    password: "",
    confirmPassword: "",
  });

  const setR = (k: keyof typeof reg) => (v: string) => setReg((prev) => ({ ...prev, [k]: v }));

  // ── Login submit ──

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  // ── Register submit ──

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (reg.password !== reg.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (reg.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (!/^\d{7,8}$/.test(reg.dni)) {
      setError("El DNI debe tener 7 u 8 dígitos numéricos");
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword: _confirmPassword, ...data } = reg;
      await register(data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl border shadow-2xl"
        style={{ backgroundColor: "#161b22", borderColor: "#21262d" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid #21262d" }}
        >
          <h2 className="text-base font-bold" style={{ color: "#e6edf3" }}>
            {tab === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/5"
            style={{ color: "#7d8590" }}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex" style={{ borderBottom: "1px solid #21262d" }}>
          {(["login", "register"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setError(null);
              }}
              className="flex-1 py-3 text-sm font-medium transition-colors"
              style={{
                color: tab === t ? "#74ACDF" : "#7d8590",
                borderBottom: tab === t ? "2px solid #74ACDF" : "2px solid transparent",
                backgroundColor: "transparent",
              }}
            >
              {t === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          ))}
        </div>

        <div className="px-6 py-5">
          {error && (
            <div className="mb-4">
              <ErrorBanner message={error} />
            </div>
          )}

          {/* ── Login form ── */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <Field
                label="Email"
                type="email"
                value={loginEmail}
                onChange={setLoginEmail}
                placeholder="tu@email.com"
                required
                autoComplete="email"
              />
              <Field
                label="Contraseña"
                type="password"
                value={loginPassword}
                onChange={setLoginPassword}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full rounded-lg py-2.5 text-sm font-semibold transition-all"
                style={{
                  backgroundColor: loading ? "#21262d" : "#74ACDF",
                  color: loading ? "#4d5561" : "#0d1117",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Ingresando..." : "Ingresar"}
              </button>
              <p className="text-center text-xs" style={{ color: "#7d8590" }}>
                ¿No tenés cuenta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setTab("register");
                    setError(null);
                  }}
                  className="hover:underline"
                  style={{ color: "#74ACDF" }}
                >
                  Registrate
                </button>
              </p>
            </form>
          )}

          {/* ── Register form ── */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="flex flex-col gap-3">
              <Field
                label="Nombre y apellido completo"
                value={reg.nombre}
                onChange={setR("nombre")}
                placeholder="Ej: María González"
                required
                autoComplete="name"
              />
              <Field
                label="Email"
                type="email"
                value={reg.email}
                onChange={setR("email")}
                placeholder="tu@email.com"
                required
                autoComplete="email"
              />

              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="DNI"
                  value={reg.dni}
                  onChange={setR("dni")}
                  placeholder="12345678"
                  required
                  autoComplete="off"
                />
                <Field
                  label="Teléfono"
                  type="tel"
                  value={reg.telefono}
                  onChange={setR("telefono")}
                  placeholder="+54 11 1234-5678"
                  required
                  autoComplete="tel"
                />
              </div>

              <div>
                <Label required>Rol / Profesión</Label>
                <select
                  value={reg.rol}
                  onChange={(e) => setR("rol")(e.target.value)}
                  required
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{
                    backgroundColor: "#0d1117",
                    borderColor: "#30363d",
                    color: reg.rol ? "#e6edf3" : "#7d8590",
                  }}
                >
                  <option value="" disabled>
                    Seleccioná tu rol...
                  </option>
                  {ROLES.map((r) => (
                    <option key={r} value={r} style={{ color: "#e6edf3" }}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <Field
                label="Contraseña"
                type="password"
                value={reg.password}
                onChange={setR("password")}
                placeholder="Mínimo 8 caracteres"
                required
                autoComplete="new-password"
              />
              <Field
                label="Confirmar contraseña"
                type="password"
                value={reg.confirmPassword}
                onChange={setR("confirmPassword")}
                placeholder="Repetí la contraseña"
                required
                autoComplete="new-password"
              />

              <p className="text-xs leading-relaxed" style={{ color: "#7d8590" }}>
                Al registrarte aceptás que tu nombre, email y DNI quedan vinculados a cualquier
                informe que cargues. Esto es parte de la trazabilidad civil del sistema.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg py-2.5 text-sm font-semibold transition-all"
                style={{
                  backgroundColor: loading ? "#21262d" : "#74ACDF",
                  color: loading ? "#4d5561" : "#0d1117",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </button>

              <p className="text-center text-xs" style={{ color: "#7d8590" }}>
                ¿Ya tenés cuenta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setTab("login");
                    setError(null);
                  }}
                  className="hover:underline"
                  style={{ color: "#74ACDF" }}
                >
                  Iniciá sesión
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
