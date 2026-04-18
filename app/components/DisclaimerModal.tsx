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
      className="overlay-enter fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
    >
      <div className="modal-enter bg-ink-elevated border-border-strong relative w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl">
        {/* Top gradient hairline */}
        <div
          className="h-[3px]"
          style={{ background: "linear-gradient(90deg, var(--royal) 0%, var(--gold) 100%)" }}
        />

        {/* Header */}
        <div className="border-border flex items-center gap-3 border-b px-6 py-4">
          <span className="text-2xl" aria-hidden="true">
            ⚖️
          </span>
          <h2
            id="disclaimer-title"
            className="text-cream font-serif text-lg font-bold leading-tight"
          >
            Aviso sobre los Datos
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-cream text-sm leading-relaxed">{disclaimerText}</p>

          <div className="bg-ink border-gold text-cream-muted mt-4 rounded-lg border-l-[3px] px-4 py-3 text-xs leading-relaxed">
            <strong className="text-cream">
              Este sitio es de código abierto, estadístico y sin sesgo político.
            </strong>{" "}
            No tiene fines de vigilancia ni de castigo. Los datos mostrados son registros públicos
            del poder judicial argentino. Actualmente se utilizan datos de muestra mientras se
            integran las fuentes oficiales.
          </div>
        </div>

        {/* Footer */}
        <div className="border-border flex justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={handleClose}
            className="bg-royal text-cream hover:bg-royal-strong cursor-pointer rounded-lg px-6 py-2.5 text-sm font-semibold transition-colors"
          >
            Entendido, continuar
          </button>
        </div>
      </div>
    </div>
  );
}

export { disclaimerText };
