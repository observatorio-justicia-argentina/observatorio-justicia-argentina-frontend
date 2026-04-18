"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { RegisterData } from "../lib/auth-api";
import { XIcon } from "./icons";

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
    <label className="text-cream-muted mb-1 block text-xs font-semibold">
      {children}
      {required && <span className="text-danger"> *</span>}
    </label>
  );
}

const INPUT_CLASSES =
  "bg-ink border-border-strong text-cream focus:border-gold w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:outline-none placeholder:text-cream-muted";

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
        className={INPUT_CLASSES}
      />
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-danger-soft border-danger text-danger rounded-lg border px-4 py-2.5 text-sm">
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

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

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

  const submitBtnCls = loading
    ? "bg-border text-cream-subtle cursor-not-allowed"
    : "bg-gold text-cream hover:bg-gold-strong cursor-pointer";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-ink-elevated border-border w-full max-w-md rounded-2xl border shadow-2xl">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-cream font-serif text-lg font-bold">
            {tab === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </h2>
          <button
            onClick={onClose}
            className="text-cream-muted hover:bg-cream/5 flex h-8 w-8 items-center justify-center rounded-lg"
            aria-label="Cerrar"
          >
            <XIcon className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-border flex border-b">
          {(["login", "register"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setError(null);
              }}
              className={`flex-1 border-b-2 bg-transparent py-3 text-sm font-medium transition-colors ${
                tab === t ? "text-gold border-gold" : "text-cream-muted border-transparent"
              }`}
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
                className={`mt-1 w-full rounded-lg py-2.5 text-sm font-semibold transition-colors ${submitBtnCls}`}
              >
                {loading ? "Ingresando..." : "Ingresar"}
              </button>
              <p className="text-cream-muted text-center text-xs">
                ¿No tenés cuenta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setTab("register");
                    setError(null);
                  }}
                  className="text-gold hover:underline"
                >
                  Registrate
                </button>
              </p>
            </form>
          )}

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
                  className={`${INPUT_CLASSES} ${reg.rol ? "text-cream" : "text-cream-muted"}`}
                >
                  <option value="" disabled>
                    Seleccioná tu rol...
                  </option>
                  {ROLES.map((r) => (
                    <option key={r} value={r} className="text-cream">
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

              <p className="text-cream-muted text-xs leading-relaxed">
                Al registrarte aceptás que tu nombre, email y DNI quedan vinculados a cualquier
                informe que cargues. Esto es parte de la trazabilidad civil del sistema.
              </p>

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-lg py-2.5 text-sm font-semibold transition-colors ${submitBtnCls}`}
              >
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </button>

              <p className="text-cream-muted text-center text-xs">
                ¿Ya tenés cuenta?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setTab("login");
                    setError(null);
                  }}
                  className="text-gold hover:underline"
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
