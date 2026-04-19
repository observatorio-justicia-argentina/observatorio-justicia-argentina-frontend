import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Metodología | Observatorio de Justicia Argentina",
  description:
    "Cómo calculamos los datos del Observatorio: umbrales, fuentes estadísticas oficiales y la distinción entre dato duro y dato de contexto.",
};

export default function MetodologiaPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      {/* ── Encabezado ──────────────────────────────────────────────────────── */}
      <div className="mb-10">
        <Link
          href="/causas"
          className="mb-4 inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
          style={{ color: "#74ACDF" }}
        >
          ← Volver a causas
        </Link>
        <h1 className="mt-2 text-3xl font-bold" style={{ color: "#e6edf3" }}>
          Metodología y fuentes
        </h1>
        <p className="mt-3 text-base leading-relaxed" style={{ color: "#7d8590" }}>
          El Observatorio no acusa. Publica información pública trabajada y cruda para que
          periodistas, abogados y ciudadanos puedan acceder, analizar y sacar sus propias
          conclusiones. Esta página documenta exactamente cómo se calculan los datos.
        </p>
      </div>

      <div className="space-y-10">
        {/* ── Sección 1: Criterio de clasificación ──────────────────────────── */}
        <section>
          <h2 className="mb-4 text-xl font-semibold" style={{ color: "#e6edf3" }}>
            1. Criterio de clasificación por tiempo
          </h2>
          <div
            className="mb-4 rounded-xl border-l-4 p-4 text-sm"
            style={{
              borderLeftColor: "#74ACDF",
              backgroundColor: "#74ACDF08",
              color: "#e6edf3",
            }}
          >
            <strong>Principio:</strong> Las categorías describen únicamente el tiempo transcurrido
            desde el inicio de la causa hasta hoy. No implican juicio sobre la conducta, intención
            ni responsabilidad del magistrado.
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#7d8590" }}>
            El dato es:{" "}
            <strong style={{ color: "#e6edf3" }}>
              fecha de inicio + ausencia de resolución + días transcurridos
            </strong>
            . Cada usuario puede cruzar los filtros y extraer sus propias conclusiones. El
            Observatorio publica el dato; no lo interpreta.
          </p>
        </section>

        {/* ── Sección 2: Umbrales ───────────────────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-xl font-semibold" style={{ color: "#e6edf3" }}>
            2. Umbrales y criterios
          </h2>
          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "#21262d" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#161b22", borderBottom: "1px solid #21262d" }}>
                  {["Estado", "Días desde inicio", "Criterio"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "#7d8590" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    dot: "🟢",
                    label: "Activa",
                    color: "#3fb950",
                    bg: "#3fb95010",
                    dias: "< 365",
                    criterio: "Dentro del primer año. Normal en etapa de instrucción.",
                  },
                  {
                    dot: "🟡",
                    label: "Demora moderada",
                    color: "#d29922",
                    bg: "#d2992210",
                    dias: "365 – 730",
                    criterio:
                      "Supera 1 año sin resolución. Por debajo de la mediana nacional (~1.000 días para el proceso completo).",
                  },
                  {
                    dot: "🔴",
                    label: "Alta demora",
                    color: "#f85149",
                    bg: "#f8514910",
                    dias: "> 730",
                    criterio:
                      "Supera 2 años sin resolución. Excede el umbral para primera instancia según estadísticas de la Procuración General.",
                  },
                  {
                    dot: "✅",
                    label: "Resuelta",
                    color: "#7d8590",
                    bg: "#7d859010",
                    dias: "—",
                    criterio:
                      "La causa tiene resolución registrada (fta, nuevo arresto o revocada).",
                  },
                ].map((row, i) => (
                  <tr
                    key={row.label}
                    style={{
                      borderBottom: "1px solid #21262d",
                      backgroundColor: i % 2 === 0 ? "transparent" : "#0d111715",
                    }}
                  >
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{ backgroundColor: row.bg, color: row.color }}
                      >
                        {row.dot} {row.label}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 font-mono text-sm font-semibold"
                      style={{ color: row.color }}
                    >
                      {row.dias}
                    </td>
                    <td className="px-4 py-3 text-xs leading-relaxed" style={{ color: "#7d8590" }}>
                      {row.criterio}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            className="mt-4 rounded-lg border p-4 text-sm"
            style={{ borderColor: "#21262d", backgroundColor: "#161b22", color: "#7d8590" }}
          >
            <strong style={{ color: "#e6edf3" }}>¿Por qué 730 días y no 1.000 (la mediana)?</strong>
            <p className="mt-2 leading-relaxed">
              La mediana de 1.000 días de la Procuración General corresponde al proceso{" "}
              <em>completo</em>, incluyendo juicio oral, apelaciones y eventual casación. Para una
              causa que lleva más de 2 años sin salir de la etapa de instrucción o sin llegar a
              juicio oral, ya es un indicador claro de estancamiento. Usar 1.000 días como umbral
              sería demasiado permisivo.
            </p>
          </div>
        </section>

        {/* ── Sección 3: Fuentes estadísticas ───────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-xl font-semibold" style={{ color: "#e6edf3" }}>
            3. Fuentes estadísticas
          </h2>

          {/* Datos clave */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            {[
              {
                value: "41 meses",
                label: "Promedio del proceso penal completo",
                source: "Procuración General de la Nación",
              },
              {
                value: "33 meses",
                label: "Mediana del proceso penal completo",
                source: "Procuración General de la Nación",
              },
              {
                value: "609 días",
                label: "Promedio de resolución en CSJN (última instancia)",
                source: "Anuario Estadístico CSJN 2025",
              },
              {
                value: "730 días",
                label: "Umbral de alta demora usado por el Observatorio",
                source: "Derivado de la mediana para primera instancia",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border p-4"
                style={{ borderColor: "#21262d", backgroundColor: "#161b22" }}
              >
                <div className="text-2xl font-bold" style={{ color: "#74ACDF" }}>
                  {stat.value}
                </div>
                <div className="mt-1 text-xs font-medium" style={{ color: "#e6edf3" }}>
                  {stat.label}
                </div>
                <div className="mt-1 text-xs" style={{ color: "#7d8590" }}>
                  {stat.source}
                </div>
              </div>
            ))}
          </div>

          {/* Tabla de fuentes */}
          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "#21262d" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "#161b22", borderBottom: "1px solid #21262d" }}>
                  {["Fuente", "Organismo", "Link"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "#7d8590" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    fuente: "La duración del proceso penal en la República Argentina",
                    organismo: "Procuración General de la Nación (MPF)",
                    url: "https://www.mpf.gob.ar/docs/RepositorioB/Ebooks/qE533.pdf",
                  },
                  {
                    fuente: "Anuario Estadístico 2025",
                    organismo: "Corte Suprema de Justicia de la Nación (CSJN)",
                    url: "https://www.csjn.gov.ar/novedades/detalle/13002",
                  },
                  {
                    fuente: "Portal de Datos Abiertos de la Justicia Argentina",
                    organismo: "Ministerio de Justicia",
                    url: "https://datos.jus.gob.ar/dataset/poderes-judiciales-causas-penales",
                  },
                  {
                    fuente: "Sistema Nacional de Estadísticas Judiciales (SNEJ)",
                    organismo: "Argentina.gob.ar",
                    url: "https://www.argentina.gob.ar/justicia/politicacriminal/estadisticas/snej",
                  },
                  {
                    fuente: "El Plazo Razonable en el Proceso Penal",
                    organismo: "CSJN",
                    url: "https://sj.csjn.gov.ar/homeSJ/notas/nota/68/documento",
                  },
                  {
                    fuente: "Causas penales provinciales",
                    organismo: "Datos Argentina (datos.gob.ar)",
                    url: "https://datos.gob.ar/dataset/justicia-poderes-judiciales---causas-penales",
                  },
                ].map((row, i) => (
                  <tr
                    key={row.url}
                    style={{
                      borderBottom: "1px solid #21262d",
                      backgroundColor: i % 2 === 0 ? "transparent" : "#0d111715",
                    }}
                  >
                    <td className="px-4 py-3 text-xs font-medium" style={{ color: "#e6edf3" }}>
                      {row.fuente}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#7d8590" }}>
                      {row.organismo}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs underline transition-opacity hover:opacity-70"
                        style={{ color: "#74ACDF" }}
                      >
                        Ver documento →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs italic" style={{ color: "#7d8590" }}>
            Nota: los datos de la Procuración corresponden al proceso completo (denuncia → sentencia
            firme). Los de la CSJN corresponden solo a la última instancia. No son comparables
            directamente.
          </p>
        </section>

        {/* ── Sección 4: Dato duro vs. dato de contexto ─────────────────────── */}
        <section>
          <h2 className="mb-4 text-xl font-semibold" style={{ color: "#e6edf3" }}>
            4. Dato duro vs. dato de contexto
          </h2>
          <p className="mb-4 text-sm leading-relaxed" style={{ color: "#7d8590" }}>
            El Observatorio distingue dos tipos de información en el Expediente Reputacional de cada
            magistrado:
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                tipo: "Dato duro",
                color: "#74ACDF",
                bg: "#74ACDF10",
                desc: "Objetivo, verificable, con fuente oficial.",
                ejemplos: [
                  "Tasa de fracasos sobre libertades otorgadas",
                  "Días sin resolución de una causa",
                  "Puntaje y rango en concurso de Magistratura",
                  "Senadores que avalaron el pliego",
                  "Sueldo bruto publicado en acordada oficial",
                ],
              },
              {
                tipo: "Dato de contexto",
                color: "#d29922",
                bg: "#d2992210",
                desc: "Informativo, requiere interpretación del lector.",
                ejemplos: [
                  "Vínculo con asociaciones judiciales",
                  "Origen político de la designación",
                  "Carrera previa en el Poder Ejecutivo",
                  "Formación académica",
                ],
              },
            ].map((col) => (
              <div
                key={col.tipo}
                className="rounded-xl border p-4"
                style={{ borderColor: col.color + "30", backgroundColor: col.bg }}
              >
                <h3 className="text-sm font-bold" style={{ color: col.color }}>
                  {col.tipo}
                </h3>
                <p className="mt-1 text-xs" style={{ color: "#7d8590" }}>
                  {col.desc}
                </p>
                <ul className="mt-3 space-y-1">
                  {col.ejemplos.map((e) => (
                    <li
                      key={e}
                      className="flex items-start gap-2 text-xs"
                      style={{ color: "#e6edf3" }}
                    >
                      <span style={{ color: col.color }}>·</span>
                      {e}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm" style={{ color: "#7d8590" }}>
            Los datos de contexto siempre se presentan con su fuente y{" "}
            <strong style={{ color: "#e6edf3" }}>sin calificativo editorial</strong>. El
            Observatorio no infiere intención detrás de los datos.
          </p>
        </section>

        {/* ── Sección 5: Limitaciones actuales ─────────────────────────────── */}
        <section>
          <h2 className="mb-4 text-xl font-semibold" style={{ color: "#e6edf3" }}>
            5. Limitaciones actuales
          </h2>
          <div
            className="rounded-xl border-l-4 p-4"
            style={{
              borderLeftColor: "#F4B942",
              backgroundColor: "#F4B94208",
            }}
          >
            <ul className="space-y-2 text-sm" style={{ color: "#7d8590" }}>
              <li className="flex items-start gap-2">
                <span style={{ color: "#F4B942" }}>⚠</span>
                <span>
                  <strong style={{ color: "#e6edf3" }}>Datos demo:</strong> todos los perfiles de
                  magistrados y causas son ficticios en esta versión. Los nombres, expedientes y
                  fechas son inventados para ilustrar el esquema completo.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "#F4B942" }}>⚠</span>
                <span>
                  <strong style={{ color: "#e6edf3" }}>Sin base de datos real:</strong> cuando se
                  integre el PJN (Poder Judicial de la Nación), las fechas y estados se calcularán
                  dinámicamente desde datos reales.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span style={{ color: "#F4B942" }}>⚠</span>
                <span>
                  <strong style={{ color: "#e6edf3" }}>Umbrales revisables:</strong> los 730 días
                  son un punto de partida conservador. Se revisarán cuando haya datos suficientes
                  para calibrar por fuero y jurisdicción.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── Pie ───────────────────────────────────────────────────────────── */}
        <div
          className="rounded-xl border p-6 text-center"
          style={{ borderColor: "#21262d", backgroundColor: "#161b22" }}
        >
          <p className="text-sm font-medium" style={{ color: "#e6edf3" }}>
            ¿Encontraste un error metodológico o una fuente mejor?
          </p>
          <p className="mt-1 text-xs" style={{ color: "#7d8590" }}>
            El código es abierto. Podés abrir un issue o un PR en GitHub.
          </p>
          <a
            href="https://github.com/observatorio-justicia-argentina/observatorio-justicia-argentina-frontend"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block rounded-lg border px-4 py-2 text-xs font-medium transition-all hover:bg-white/5"
            style={{ borderColor: "#30363d", color: "#74ACDF" }}
          >
            Ver código fuente →
          </a>
        </div>
      </div>
    </main>
  );
}
