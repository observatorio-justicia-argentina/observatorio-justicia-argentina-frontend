"use client";

export default function DisclaimerBanner() {
  return (
    <div role="banner" className="bg-ink-elevated border-gold/30 border-b">
      <div className="mx-auto flex max-w-7xl flex-wrap items-start gap-x-2 gap-y-1 px-4 py-2 sm:px-6 lg:px-8">
        <span className="bg-gold-soft text-gold border-gold/40 shrink-0 rounded border px-1.5 py-0.5 text-xs font-bold">
          pre-v1.0
        </span>
        <p className="text-cream-muted text-xs leading-relaxed">
          <strong className="text-cream">Datos de muestra.</strong> Los registros actuales son
          ilustrativos. La integración de fuentes judiciales oficiales estará disponible en la
          versión 1.0.{" "}
          <strong className="text-cream">Este sitio no imputa conducta indebida</strong> a ningún
          individuo; presenta datos públicos con fines de transparencia estadística.
        </p>
      </div>
    </div>
  );
}
