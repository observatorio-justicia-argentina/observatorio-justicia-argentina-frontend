"use client";

import { useState } from "react";

const DISCLAIMER_KEY = "oja-disclaimer-accepted";

const disclaimerText = `AVISO SOBRE LOS DATOS: Cada caso en este sitio representa una situación en la que la medida cautelar o la libertad provisional resultó en una falla procesal — un imputado que fue liberado antes del juicio y luego no se presentó a declarar, fue arrestado por un nuevo delito, o tuvo su libertad revocada. Estos números no reflejan la totalidad de causas de un juez ni su desempeño general. Un juez con mayor cantidad de resoluciones de libertad puede aparecer con mayor frecuencia en estos datos. Toda la información proviene de registros públicos accesibles en el sistema judicial argentino. El Observatorio Judicial Argentino presenta datos públicos y objetivos, y no imputa conducta indebida a ningún individuo. Nuestra misión es la transparencia — no el castigo.`;

interface DisclaimerModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function DisclaimerModal({ forceOpen, onClose }: DisclaimerModalProps) {
  const [dismissed, setDismissed] = useState(false);

  const shouldShow =
    forceOpen ||
    (!dismissed && typeof window !== "undefined" && !localStorage.getItem(DISCLAIMER_KEY));

  const handleClose = () => {
    if (!forceOpen) localStorage.setItem(DISCLAIMER_KEY, "true");
    setDismissed(true);
    onClose?.();
  };

  if (!shouldShow) return null;

  return (
    <div
      className="overlay-enter fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
    >
      <div
        className="modal-enter relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
        style={{ backgroundColor: "#161b22", border: "1px solid #30363d" }}
      >
        {/* Gold top bar */}
        <div style={{ height: "3px", background: "linear-gradient(90deg, #74ACDF, #F4B942)" }} />

        {/* Header */}
        <div
          className="flex items-center gap-3 px-6 py-4"
          style={{ borderBottom: "1px solid #21262d" }}
        >
          <span className="text-2xl" aria-hidden="true">
            ⚖️
          </span>
          <h2
            id="disclaimer-title"
            className="font-bold text-lg leading-tight"
            style={{ color: "#e6edf3" }}
          >
            Aviso sobre los Datos
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm leading-relaxed" style={{ color: "#c9d1d9" }}>
            {disclaimerText}
          </p>

          <div
            className="mt-4 rounded-lg px-4 py-3 text-xs leading-relaxed"
            style={{
              backgroundColor: "#0d1117",
              borderLeft: "3px solid #F4B942",
              color: "#8b949e",
            }}
          >
            <strong style={{ color: "#e6edf3" }}>
              Este sitio es de código abierto, estadístico y sin sesgo político.
            </strong>{" "}
            No tiene fines de vigilancia ni de castigo. Los datos mostrados son registros públicos
            del poder judicial argentino. Actualmente se utilizan datos de muestra mientras se
            integran las fuentes oficiales.
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-3 px-6 pb-5"
          style={{ borderTop: "1px solid #21262d", paddingTop: "1rem" }}
        >
          <button
            onClick={handleClose}
            className="cursor-pointer rounded-lg px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 active:opacity-75"
            style={{ backgroundColor: "#74ACDF", color: "#0d1117" }}
          >
            Entendido, continuar
          </button>
        </div>
      </div>
    </div>
  );
}

export { disclaimerText };
