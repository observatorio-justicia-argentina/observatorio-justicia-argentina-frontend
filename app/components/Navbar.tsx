"use client";

import { useState } from "react";
import DisclaimerModal from "./DisclaimerModal";
import SubmitJudgeModal from "./SubmitJudgeModal";
import AuthModal from "./AuthModal";
import { AlertIcon, ChevronDownIcon, ScaleIcon } from "./icons";
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
        className="bg-ink border-border sticky top-0 z-40 w-full border-b shadow-[0_1px_8px_rgba(0,0,0,0.5)]"
        aria-label="Navegación principal"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex min-w-0 items-center gap-2.5">
            <ScaleIcon className="text-gold h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
            <div className="min-w-0">
              <span className="text-cream block truncate font-serif text-sm font-bold leading-tight sm:text-base">
                Observatorio Judicial Argentino
              </span>
              <span className="text-gold block text-xs font-medium leading-tight">
                Conocé a los jueces
              </span>
            </div>
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 sm:flex">
            {user && (
              <button
                onClick={handleSubmitClick}
                className="bg-gold text-cream hover:bg-gold-strong cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition-colors"
              >
                + Cargar informe
              </button>
            )}

            <a
              href="#jueces"
              className="border-border text-cream hover:bg-cream/5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
            >
              Jueces
            </a>

            <button
              onClick={() => setDisclaimerOpen(true)}
              className="border-gold text-gold hover:bg-gold/10 flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
            >
              <AlertIcon className="h-3.5 w-3.5" aria-hidden />
              Aviso
            </button>

            <a
              href="https://github.com/observatorio-justicia-argentina/observatorio-justicia-argentina-frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="border-border text-cream-muted hover:bg-cream/5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
            >
              Código fuente
            </a>

            {/* Auth section */}
            {booting ? null : user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="border-border-strong text-cream hover:bg-cream/5 flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors"
                >
                  <span className="bg-gold-soft text-gold border-gold/40 flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold">
                    <UserInitials nombre={user.nombre} />
                  </span>
                  <span className="max-w-30 truncate">{user.nombre.split(" ")[0]}</span>
                  <ChevronDownIcon className="text-cream-muted h-3.5 w-3.5" aria-hidden />
                </button>

                {userMenuOpen && (
                  <div className="bg-ink-elevated border-border absolute right-0 z-[100] mt-1 w-52 rounded-xl border py-1 shadow-2xl">
                    <div className="border-border border-b px-4 py-2.5">
                      <p className="text-cream truncate text-xs font-semibold">{user.nombre}</p>
                      <p className="text-cream-muted truncate text-xs">{user.email}</p>
                      <p className="text-cream-muted mt-0.5 text-xs">DNI: {user.dni}</p>
                    </div>
                    <button
                      onClick={() => {
                        handleSubmitClick();
                        setUserMenuOpen(false);
                      }}
                      className="text-gold hover:bg-cream/5 w-full px-4 py-2 text-left text-xs"
                    >
                      + Cargar informe
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="text-danger hover:bg-cream/5 w-full px-4 py-2 text-left text-xs"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="border-gold text-gold hover:bg-gold/10 cursor-pointer rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors"
              >
                Iniciar sesión
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="text-cream-muted hover:bg-cream/5 flex items-center justify-center rounded-md p-2 sm:hidden"
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
          <div className="border-border bg-ink border-t">
            <div className="flex flex-col gap-1 px-4 py-3">
              {user && (
                <div className="bg-ink-elevated border-border mb-2 rounded-lg border p-3">
                  <p className="text-cream text-xs font-semibold">{user.nombre}</p>
                  <p className="text-cream-muted text-xs">{user.email}</p>
                </div>
              )}
              <button
                onClick={() => {
                  handleSubmitClick();
                  setMenuOpen(false);
                }}
                className="bg-gold-soft text-gold border-gold/30 cursor-pointer rounded-md border px-3 py-2 text-left text-sm font-semibold"
              >
                + Cargar informe {!user && "(requiere sesión)"}
              </button>
              <a
                href="#jueces"
                onClick={() => setMenuOpen(false)}
                className="text-cream hover:bg-cream/5 rounded-md px-3 py-2 text-sm font-medium"
              >
                Jueces
              </a>
              <button
                onClick={() => {
                  setDisclaimerOpen(true);
                  setMenuOpen(false);
                }}
                className="text-gold hover:bg-cream/5 flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium"
              >
                <AlertIcon className="h-4 w-4" aria-hidden />
                Aviso sobre los datos
              </button>
              <a
                href="https://github.com/observatorio-justicia-argentina/observatorio-justicia-argentina-frontend"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream-muted hover:bg-cream/5 rounded-md px-3 py-2 text-sm font-medium"
              >
                Código fuente
              </a>
              {!booting && !user && (
                <button
                  onClick={() => {
                    setAuthOpen(true);
                    setMenuOpen(false);
                  }}
                  className="border-gold text-gold cursor-pointer rounded-md border px-3 py-2 text-left text-sm font-semibold"
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
                  className="text-danger hover:bg-cream/5 cursor-pointer rounded-md px-3 py-2 text-left text-sm font-medium"
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
