"use client";

import { useState } from "react";
import DisclaimerModal from "./DisclaimerModal";
import SubmitJudgeModal from "./SubmitJudgeModal";
import AuthModal from "./AuthModal";
import { useAuth } from "../context/AuthContext";

function UserInitials({ nombre }: { nombre: string }) {
  const parts = nombre.trim().split(" ");
  const initials =
    parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : parts[0].slice(0, 2);
  return <>{initials.toUpperCase()}</>;
}

export default function Navbar() {
  const { user, booting, logout } = useAuth();

  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSubmitClick = () => {
    if (!user) {
      setAuthOpen(true);
    } else {
      setSubmitOpen(true);
    }
  };

  return (
    <>
      <nav
        className="sticky top-0 z-40 w-full"
        style={{
          backgroundColor: "#0d1117",
          borderBottom: "1px solid #21262d",
          boxShadow: "0 1px 8px rgba(0,0,0,0.5)",
        }}
        aria-label="Navegación principal"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl sm:text-2xl" aria-hidden="true">
              ⚖️
            </span>
            <div className="min-w-0">
              <span
                className="block truncate text-sm font-bold leading-tight"
                style={{ color: "#e6edf3" }}
              >
                Observatorio Judicial Argentino
              </span>
              <span
                className="block text-xs leading-tight font-medium"
                style={{ color: "#74ACDF" }}
              >
                Conocé a los jueces
              </span>
            </div>
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 sm:flex">
            {/* Cargar informe (solo visible logueado) */}
            {user && (
              <button
                onClick={handleSubmitClick}
                className="cursor-pointer rounded-md border px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: "#74ACDF", borderColor: "#74ACDF", color: "#0d1117" }}
              >
                + Cargar informe
              </button>
            )}

            <button
              onClick={() => setDisclaimerOpen(true)}
              className="cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium transition-all hover:bg-white/5"
              style={{ borderColor: "#F4B942", color: "#F4B942" }}
            >
              ⚠ Aviso
            </button>

            <a
              href="https://github.com/observatorio-justicia-argentina/observatorio-justicia-argentina-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border px-3 py-1.5 text-xs font-medium transition-all hover:bg-white/5"
              style={{ borderColor: "#21262d", color: "#7d8590" }}
            >
              Código fuente
            </a>

            {/* Auth section */}
            {booting ? null : user ? (
              /* Usuario logueado — avatar + menú desplegable */
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all hover:bg-white/5"
                  style={{ borderColor: "#30363d", color: "#e6edf3" }}
                >
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: "#74ACDF20",
                      color: "#74ACDF",
                      border: "1px solid #74ACDF40",
                    }}
                  >
                    <UserInitials nombre={user.nombre} />
                  </span>
                  <span className="max-w-30 truncate">{user.nombre.split(" ")[0]}</span>
                  <span style={{ color: "#7d8590" }}>▾</span>
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-1 w-52 rounded-xl border py-1 shadow-2xl"
                    style={{ backgroundColor: "#161b22", borderColor: "#21262d", zIndex: 100 }}
                  >
                    <div className="border-b px-4 py-2.5" style={{ borderColor: "#21262d" }}>
                      <p className="text-xs font-semibold truncate" style={{ color: "#e6edf3" }}>
                        {user.nombre}
                      </p>
                      <p className="text-xs truncate" style={{ color: "#7d8590" }}>
                        {user.email}
                      </p>
                      <p className="mt-0.5 text-xs" style={{ color: "#7d8590" }}>
                        DNI: {user.dni}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        handleSubmitClick();
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs hover:bg-white/5"
                      style={{ color: "#74ACDF" }}
                    >
                      + Cargar informe
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs hover:bg-white/5"
                      style={{ color: "#f85149" }}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* No logueado */
              <button
                onClick={() => setAuthOpen(true)}
                className="cursor-pointer rounded-md border px-3 py-1.5 text-xs font-semibold transition-all hover:bg-white/5"
                style={{ borderColor: "#74ACDF", color: "#74ACDF" }}
              >
                Iniciar sesión
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex sm:hidden items-center justify-center rounded-md p-2 hover:bg-white/5"
            style={{ color: "#7d8590" }}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {menuOpen ? (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ borderTop: "1px solid #21262d", backgroundColor: "#0d1117" }}>
            <div className="flex flex-col gap-1 px-4 py-3">
              {user && (
                <div
                  className="mb-2 rounded-lg p-3"
                  style={{ backgroundColor: "#161b22", border: "1px solid #21262d" }}
                >
                  <p className="text-xs font-semibold" style={{ color: "#e6edf3" }}>
                    {user.nombre}
                  </p>
                  <p className="text-xs" style={{ color: "#7d8590" }}>
                    {user.email}
                  </p>
                </div>
              )}
              <button
                onClick={() => {
                  handleSubmitClick();
                  setMenuOpen(false);
                }}
                className="cursor-pointer rounded-md px-3 py-2 text-left text-sm font-semibold"
                style={{
                  backgroundColor: "#74ACDF15",
                  color: "#74ACDF",
                  border: "1px solid #74ACDF30",
                }}
              >
                + Cargar informe {!user && "(requiere sesión)"}
              </button>
              <button
                onClick={() => {
                  setDisclaimerOpen(true);
                  setMenuOpen(false);
                }}
                className="cursor-pointer rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-white/5"
                style={{ color: "#F4B942" }}
              >
                ⚠ Aviso sobre los datos
              </button>
              <a
                href="https://github.com/observatorio-justicia-argentina/observatorio-justicia-argentina-frontend"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-white/5"
                style={{ color: "#7d8590" }}
              >
                Código fuente
              </a>
              {!booting && !user && (
                <button
                  onClick={() => {
                    setAuthOpen(true);
                    setMenuOpen(false);
                  }}
                  className="cursor-pointer rounded-md border px-3 py-2 text-left text-sm font-semibold"
                  style={{ borderColor: "#74ACDF", color: "#74ACDF" }}
                >
                  Iniciar sesión
                </button>
              )}
              {user && (
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="cursor-pointer rounded-md px-3 py-2 text-left text-sm font-medium hover:bg-white/5"
                  style={{ color: "#f85149" }}
                >
                  Cerrar sesión
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Click outside closes user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
      )}

      {disclaimerOpen && <DisclaimerModal forceOpen onClose={() => setDisclaimerOpen(false)} />}
      {submitOpen && user && <SubmitJudgeModal onClose={() => setSubmitOpen(false)} />}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
