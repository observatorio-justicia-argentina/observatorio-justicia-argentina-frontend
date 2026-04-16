"use client";

export default function DisclaimerBanner() {
  return (
    <div
      role="banner"
      style={{
        backgroundColor: "#161b22",
        borderBottom: "1px solid #F4B94230",
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-start gap-x-2 gap-y-1 px-4 py-2 sm:px-6 lg:px-8">
        <span
          className="shrink-0 rounded px-1.5 py-0.5 text-xs font-bold"
          style={{ backgroundColor: "#F4B94220", color: "#F4B942", border: "1px solid #F4B94240" }}
        >
          pre-v1.0
        </span>
        <p className="text-xs leading-relaxed" style={{ color: "#8b949e" }}>
          <strong style={{ color: "#c9d1d9" }}>Datos de muestra.</strong> Los registros actuales son
          ilustrativos. La integración de fuentes judiciales oficiales estará disponible en la
          versión 1.0.{" "}
          <strong style={{ color: "#c9d1d9" }}>Este sitio no imputa conducta indebida</strong> a
          ningún individuo; presenta datos públicos con fines de transparencia estadística.
        </p>
      </div>
    </div>
  );
}
