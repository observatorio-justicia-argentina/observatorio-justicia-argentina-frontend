"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import {
  ArchivoPublico,
  Caso,
  fetchJudgeArchivos,
  fetchJudgeCases,
  fetchJudges,
  Judge,
  ResultadoCaso,
} from "../../lib/api";

// ── Mock data ─────────────────────────────────────────────────────────────────
// Se usa como fallback hasta que el backend implemente GET /api/judges/:id/casos
// y GET /api/judges/:id/archivos. Remover cuando estén disponibles.

const MOCK_CASOS: Caso[] = [
  {
    id: "mock-1",
    nroExpediente: "12345/2024",
    fechaResolucion: "2024-03-15",
    tipoMedida: "Libertad cautelar",
    resultado: "fta",
    observaciones: "El imputado no se presentó a la audiencia fijada para el 20/04/2024.",
  },
  {
    id: "mock-2",
    nroExpediente: "98732/2024",
    fechaResolucion: "2024-06-02",
    tipoMedida: "Excarcelación",
    resultado: "nuevo_arresto",
    observaciones: "Detenido nuevamente el 14/07/2024 por robo agravado.",
  },
  {
    id: "mock-3",
    nroExpediente: "45210/2023",
    fechaResolucion: "2023-11-20",
    tipoMedida: "Prisión preventiva atenuada",
    resultado: "revocada",
    observaciones: "La Cámara revocó la medida por incumplimiento de condiciones.",
  },
  {
    id: "mock-4",
    nroExpediente: "67891/2025",
    fechaResolucion: "2025-01-10",
    tipoMedida: "Libertad cautelar",
    resultado: "pendiente",
  },
];

const MOCK_ARCHIVOS: ArchivoPublico[] = [
  {
    id: "arch-1",
    nombre: "Resolución 12345-2024.pdf",
    url: "#",
    fechaCarga: "2024-04-01",
  },
  {
    id: "arch-2",
    nombre: "Acta audiencia 98732-2024.pdf",
    url: "#",
    fechaCarga: "2024-07-20",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const RESULTADO_LABEL: Record<ResultadoCaso, string> = {
  fta: "No compareció",
  nuevo_arresto: "Nuevo arresto",
  revocada: "Revocada",
  pendiente: "Pendiente",
};

const RESULTADO_COLOR: Record<ResultadoCaso, { bg: string; text: string; border: string }> = {
  fta: { bg: "#d2992220", text: "#d29922", border: "#d2992240" },
  nuevo_arresto: { bg: "#f8514920", text: "#f85149", border: "#f8514940" },
  revocada: { bg: "#a371f720", text: "#a371f7", border: "#a371f740" },
  pendiente: { bg: "#74ACDF20", text: "#74ACDF", border: "#74ACDF40" },
};

function ResultadoBadge({ resultado }: { resultado: ResultadoCaso }) {
  const c = RESULTADO_COLOR[resultado];
  return (
    <span
      className="rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      {RESULTADO_LABEL[resultado]}
    </span>
  );
}

function StatBox({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div
      className="flex flex-col items-center rounded-lg px-4 py-3"
      style={{ backgroundColor: "#0d1117" }}
    >
      <span className="text-2xl font-bold" style={{ color }}>
        {value}
      </span>
      <span className="mt-0.5 text-center text-xs" style={{ color: "#7d8590" }}>
        {label}
      </span>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function JudgeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const judgeId = Number(id);

  const [judge, setJudge] = useState<Judge | null>(null);
  const [casos, setCasos] = useState<Caso[]>([]);
  const [archivos, setArchivos] = useState<ArchivoPublico[]>([]);
  const [loadingJudge, setLoadingJudge] = useState(true);
  const [loadingCasos, setLoadingCasos] = useState(true);
  const [errorJudge, setErrorJudge] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  // Cargar datos del juez desde la lista existente
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const judges = await fetchJudges();
        if (!cancelled) {
          const found = judges.find((j) => j.id === judgeId) ?? null;
          setJudge(found);
          if (!found) setErrorJudge("Juez no encontrado.");
        }
      } catch {
        if (!cancelled) setErrorJudge("No se pudo conectar con el backend.");
      } finally {
        if (!cancelled) setLoadingJudge(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [judgeId]);

  // Cargar casos e archivos — con fallback a mock data
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingCasos(true);
      try {
        const [casosData, archivosData] = await Promise.all([
          fetchJudgeCases(judgeId),
          fetchJudgeArchivos(judgeId),
        ]);
        if (!cancelled) {
          setCasos(casosData);
          setArchivos(archivosData);
        }
      } catch {
        // El endpoint aún no existe en el backend — usar datos de ejemplo
        if (!cancelled) {
          setCasos(MOCK_CASOS);
          setArchivos(MOCK_ARCHIVOS);
          setUsingMockData(true);
        }
      } finally {
        if (!cancelled) setLoadingCasos(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [judgeId]);

  const failureRate =
    judge && judge.totalReleases > 0
      ? (
          ((judge.ftaCount + judge.newArrestCount + judge.revokedCount) / judge.totalReleases) *
          100
        ).toFixed(1)
      : "0.0";
  const rate = parseFloat(failureRate);
  const rateColor = rate > 20 ? "#f85149" : rate > 10 ? "#F4B942" : "#3fb950";
  const rateBg = rate > 20 ? "#f8514920" : rate > 10 ? "#F4B94220" : "#3fb95020";

  const locationPath =
    judge &&
    (judge.location.department.toLowerCase().includes(judge.location.province.toLowerCase())
      ? judge.location.department
      : `${judge.location.province} › ${judge.location.department}`);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm transition-colors hover:text-[#e6edf3]"
        style={{ color: "#74ACDF" }}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Volver al dashboard
      </Link>

      {/* Error state */}
      {errorJudge && !loadingJudge && (
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          style={{ backgroundColor: "#f8514910", borderColor: "#f85149", color: "#f85149" }}
        >
          {errorJudge}
        </div>
      )}

      {/* Loading skeleton */}
      {loadingJudge && (
        <div className="space-y-4">
          <div
            className="h-40 animate-pulse rounded-xl border"
            style={{ backgroundColor: "#161b22", borderColor: "#21262d" }}
          />
          <div
            className="h-64 animate-pulse rounded-xl border"
            style={{ backgroundColor: "#161b22", borderColor: "#21262d" }}
          />
        </div>
      )}

      {/* Judge header */}
      {!loadingJudge && judge && (
        <>
          <article
            className="rounded-xl border overflow-hidden mb-6"
            style={{ backgroundColor: "#161b22", borderColor: "#21262d" }}
          >
            {/* Header */}
            <div
              className="flex flex-wrap items-start justify-between gap-3 px-6 py-5"
              style={{ borderBottom: "1px solid #21262d" }}
            >
              <div className="min-w-0">
                <h1 className="text-xl font-bold" style={{ color: "#e6edf3" }}>
                  {judge.name}
                </h1>
                <p className="mt-1 text-sm" style={{ color: "#74ACDF" }}>
                  {judge.court}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: "#7d8590" }}>
                  {locationPath}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: "#74ACDF15",
                    color: "#74ACDF",
                    border: "1px solid #74ACDF30",
                  }}
                >
                  {judge.location.province}
                </span>
                <span
                  className="rounded-full px-3 py-0.5 text-sm font-bold"
                  style={{
                    backgroundColor: rateBg,
                    color: rateColor,
                    border: `1px solid ${rateColor}40`,
                  }}
                >
                  {failureRate}% falla procesal
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
              <StatBox value={judge.totalReleases} label="Libertades otorgadas" color="#e6edf3" />
              <StatBox value={judge.ftaCount} label="No compareció" color="#d29922" />
              <StatBox value={judge.newArrestCount} label="Nuevo arresto" color="#f85149" />
              <StatBox value={judge.revokedCount} label="Medida revocada" color="#a371f7" />
            </div>
          </article>

          {/* Mock data notice */}
          {usingMockData && (
            <div
              className="mb-5 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm"
              style={{
                backgroundColor: "#d2992210",
                borderColor: "#d2992240",
                color: "#d29922",
              }}
            >
              <svg
                className="mt-0.5 h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                />
              </svg>
              <span>
                <strong>Vista previa con datos de ejemplo.</strong> El endpoint{" "}
                <code className="rounded px-1 text-xs" style={{ backgroundColor: "#21262d" }}>
                  GET /api/judges/:id/casos
                </code>{" "}
                aún no está implementado en el backend. Los casos mostrados son ficticios.
              </span>
            </div>
          )}

          {/* Cases section */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-base font-bold" style={{ color: "#e6edf3" }}>
                Casos registrados
              </h2>
              {!loadingCasos && (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: "#21262d", color: "#7d8590" }}
                >
                  {casos.length}
                </span>
              )}
            </div>

            {loadingCasos ? (
              <div
                className="h-40 animate-pulse rounded-xl border"
                style={{ backgroundColor: "#161b22", borderColor: "#21262d" }}
              />
            ) : casos.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center rounded-xl border py-12"
                style={{ borderColor: "#21262d", backgroundColor: "#161b22" }}
              >
                <p className="font-medium" style={{ color: "#e6edf3" }}>
                  Sin casos registrados
                </p>
                <p className="mt-1 text-sm" style={{ color: "#7d8590" }}>
                  Aún no se han cargado expedientes para este juez.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border" style={{ borderColor: "#21262d" }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ backgroundColor: "#161b22", borderBottom: "1px solid #21262d" }}>
                        {["Expediente", "Fecha resolución", "Tipo de medida", "Resultado"].map(
                          (col) => (
                            <th
                              key={col}
                              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                              style={{ color: "#7d8590" }}
                            >
                              {col}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {casos.map((caso, i) => (
                        <tr
                          key={caso.id}
                          style={{
                            backgroundColor: i % 2 === 0 ? "#0d1117" : "#161b22",
                            borderBottom: "1px solid #21262d",
                          }}
                        >
                          <td className="px-4 py-3 font-mono text-xs" style={{ color: "#74ACDF" }}>
                            {caso.nroExpediente}
                          </td>
                          <td className="px-4 py-3" style={{ color: "#e6edf3" }}>
                            {new Date(caso.fechaResolucion + "T00:00:00").toLocaleDateString(
                              "es-AR",
                              { day: "2-digit", month: "2-digit", year: "numeric" },
                            )}
                          </td>
                          <td className="px-4 py-3" style={{ color: "#8b949e" }}>
                            {caso.tipoMedida}
                          </td>
                          <td className="px-4 py-3">
                            <ResultadoBadge resultado={caso.resultado} />
                            {caso.observaciones && (
                              <p className="mt-1 text-xs" style={{ color: "#7d8590" }}>
                                {caso.observaciones}
                              </p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* Documents section */}
          {!loadingCasos && archivos.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 text-base font-bold" style={{ color: "#e6edf3" }}>
                Documentación pública
              </h2>
              <div className="space-y-2">
                {archivos.map((archivo) => (
                  <a
                    key={archivo.id}
                    href={archivo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:border-[#74ACDF]/40"
                    style={{ backgroundColor: "#161b22", borderColor: "#21262d" }}
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className="h-5 w-5 shrink-0"
                        style={{ color: "#f85149" }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                      <span className="text-sm" style={{ color: "#e6edf3" }}>
                        {archivo.nombre}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs" style={{ color: "#7d8590" }}>
                        {new Date(archivo.fechaCarga + "T00:00:00").toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                      <svg
                        className="h-4 w-4"
                        style={{ color: "#74ACDF" }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
