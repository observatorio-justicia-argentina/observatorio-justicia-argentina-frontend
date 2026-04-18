"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import {
  ArchivoPublico,
  Caso,
  fetchJudgeArchivos,
  fetchJudgeCases,
  fetchJudgeBySlug,
  Judge,
  PaginatedResult,
  ResultadoCaso,
} from "../../lib/api";

// ── Mock data ─────────────────────────────────────────────────────────────────
// Fallback cuando el backend no tiene los endpoints aún.

const MOCK_PAGINATED: PaginatedResult<Caso> = {
  data: [
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
  ],
  total: 4,
  page: 1,
  limit: 10,
  totalPages: 1,
};

const MOCK_ARCHIVOS: ArchivoPublico[] = [
  { id: "arch-1", nombre: "Resolución 12345-2024.pdf", url: "#", fechaCarga: "2024-04-01" },
  { id: "arch-2", nombre: "Acta audiencia 98732-2024.pdf", url: "#", fechaCarga: "2024-07-20" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const RESULTADO_LABEL: Record<ResultadoCaso, string> = {
  fta: "No compareció",
  nuevo_arresto: "Nuevo arresto",
  revocada: "Revocada",
  pendiente: "Pendiente",
};

const RESULTADO_COLOR: Record<ResultadoCaso, { bg: string; text: string; border: string }> = {
  fta: { bg: "#f4b94220", text: "#f4b942", border: "#f4b94240" },
  nuevo_arresto: { bg: "#f8514920", text: "#f85149", border: "#f8514940" },
  revocada: { bg: "#a371f720", text: "#a371f7", border: "#a371f740" },
  pendiente: { bg: "#a8a49620", text: "#a8a496", border: "#a8a49640" },
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
      style={{ backgroundColor: "#0f1529" }}
    >
      <span className="text-2xl font-bold" style={{ color }}>
        {value}
      </span>
      <span className="mt-0.5 text-center text-xs" style={{ color: "#a8a496" }}>
        {label}
      </span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5" style={{ borderBottom: "1px solid #242b48" }}>
      <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "#a8a496" }}>
        {label}
      </span>
      <span className="text-sm" style={{ color: "#f4f2e6" }}>
        {value}
      </span>
    </div>
  );
}

function formatARS(amount: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ── Componente principal ──────────────────────────────────────────────────────

const LIMIT = 10;

export default function JudgeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [judge, setJudge] = useState<Judge | null>(null);
  const [paginated, setPaginated] = useState<PaginatedResult<Caso> | null>(null);
  const [archivos, setArchivos] = useState<ArchivoPublico[]>([]);
  const [page, setPage] = useState(1);
  const [loadingJudge, setLoadingJudge] = useState(true);
  const [loadingCasos, setLoadingCasos] = useState(true);
  const [errorJudge, setErrorJudge] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  // Cargar datos del juez por slug
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const found = await fetchJudgeBySlug(slug);
        if (!cancelled) {
          setJudge(found);
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
  }, [slug]);

  // Cargar casos paginados
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoadingCasos(true);
      try {
        const [casosData, archivosData] = await Promise.all([
          fetchJudgeCases(slug, page, LIMIT),
          page === 1 ? fetchJudgeArchivos(slug) : Promise.resolve(archivos),
        ]);
        if (!cancelled) {
          setPaginated(casosData);
          if (page === 1) setArchivos(archivosData);
        }
      } catch {
        if (!cancelled) {
          setPaginated(MOCK_PAGINATED);
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
  }, [slug, page]);

  const failureRate =
    judge && judge.totalReleases > 0
      ? (
          ((judge.ftaCount + judge.newArrestCount + judge.revokedCount) / judge.totalReleases) *
          100
        ).toFixed(1)
      : "0.0";
  const rate = parseFloat(failureRate);
  const rateColor = rate > 20 ? "#f85149" : rate > 10 ? "#c18a38" : "#3fb950";
  const rateBg = rate > 20 ? "#f8514920" : rate > 10 ? "#c18a3820" : "#3fb95020";

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
        className="mb-6 inline-flex items-center gap-1.5 text-sm transition-colors hover:text-[#f4f2e6]"
        style={{ color: "#c18a38" }}
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

      {/* Error */}
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
            style={{ backgroundColor: "#181f38", borderColor: "#242b48" }}
          />
          <div
            className="h-64 animate-pulse rounded-xl border"
            style={{ backgroundColor: "#181f38", borderColor: "#242b48" }}
          />
        </div>
      )}

      {!loadingJudge && judge && (
        <>
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <article
            className="mb-6 overflow-hidden rounded-xl border"
            style={{ backgroundColor: "#181f38", borderColor: "#242b48" }}
          >
            <div
              className="flex flex-wrap items-start justify-between gap-3 px-6 py-5"
              style={{ borderBottom: "1px solid #242b48" }}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1
                    className="font-serif text-2xl font-bold sm:text-3xl"
                    style={{ color: "#f4f2e6" }}
                  >
                    {judge.name}
                  </h1>
                  {judge.isDemoData && (
                    <span
                      className="rounded-full px-2 py-0.5 text-xs"
                      style={{
                        backgroundColor: "#f4b94215",
                        color: "#f4b942",
                        border: "1px solid #f4b94230",
                      }}
                    >
                      Demo
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm" style={{ color: "#c18a38" }}>
                  {judge.court}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: "#a8a496" }}>
                  {locationPath}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: "#c18a3815",
                    color: "#c18a38",
                    border: "1px solid #c18a3830",
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
              <StatBox value={judge.totalReleases} label="Libertades otorgadas" color="#f4f2e6" />
              <StatBox value={judge.ftaCount} label="No compareció" color="#f4b942" />
              <StatBox value={judge.newArrestCount} label="Nuevo arresto" color="#f85149" />
              <StatBox value={judge.revokedCount} label="Medida revocada" color="#a371f7" />
            </div>
          </article>

          {/* ── Info del cargo ─────────────────────────────────────────────── */}
          <section
            className="mb-6 overflow-hidden rounded-xl border"
            style={{ backgroundColor: "#181f38", borderColor: "#242b48" }}
          >
            <div className="px-5 py-3" style={{ borderBottom: "1px solid #242b48" }}>
              <h2 className="text-sm font-semibold" style={{ color: "#f4f2e6" }}>
                Datos del cargo
              </h2>
            </div>
            <div className="grid gap-x-8 px-5 sm:grid-cols-2">
              <div>
                <InfoRow label="Fuero" value={judge.jurisdiction?.fuero ?? "—"} />
                <InfoRow label="Instancia" value={judge.jurisdiction?.instance ?? "—"} />
                <InfoRow
                  label="Alcance / Competencia"
                  value={
                    judge.jurisdiction
                      ? `${judge.jurisdiction.scope} / ${judge.jurisdiction.competence}`
                      : "—"
                  }
                />
                <InfoRow label="Domicilio laboral" value={judge.workAddress ?? "—"} />
              </div>
              <div>
                <InfoRow label="Horario de atención" value={judge.workHours ?? "—"} />
                <InfoRow label="Designado por" value={judge.appointmentBody ?? "—"} />
                <InfoRow label="Fecha de designación" value={judge.appointmentDate ?? "—"} />
                <InfoRow
                  label="Antigüedad en el cargo"
                  value={judge.yearsOnBench != null ? `${judge.yearsOnBench} años` : "—"}
                />
              </div>
            </div>
            {/* Remuneración */}
            {judge.salary && (
              <div className="mx-5 py-2.5" style={{ borderBottom: "1px solid #242b48" }}>
                <span
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: "#a8a496" }}
                >
                  Remuneración bruta mensual
                </span>
                <div className="mt-1 flex flex-wrap items-baseline gap-2">
                  <span className="text-lg font-bold" style={{ color: "#3fb950" }}>
                    {formatARS(judge.salary.grossMonthlyARS)}
                  </span>
                  <span className="text-xs" style={{ color: "#a8a496" }}>
                    {judge.salary.category} — {judge.salary.acordada} ({judge.salary.lastUpdated})
                  </span>
                </div>
              </div>
            )}
            {/* Bio */}
            {judge.publicBio && (
              <div className="px-5 py-3">
                <span
                  className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: "#a8a496" }}
                >
                  Biografía pública
                </span>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: "#a8a496" }}>
                  {judge.publicBio}
                </p>
              </div>
            )}
          </section>

          {/* ── Fuentes ────────────────────────────────────────────────────── */}
          {judge.sourceLinks && judge.sourceLinks.length > 0 && (
            <section
              className="mb-6 overflow-hidden rounded-xl border"
              style={{ backgroundColor: "#181f38", borderColor: "#242b48" }}
            >
              <div className="px-5 py-3" style={{ borderBottom: "1px solid #242b48" }}>
                <h2 className="text-sm font-semibold" style={{ color: "#f4f2e6" }}>
                  Fuentes oficiales
                </h2>
              </div>
              <div className="divide-y" style={{ borderColor: "#242b48" }}>
                {judge.sourceLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-cream/5"
                  >
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: "#c18a38" }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#c18a38" }}>
                        {link.label}
                      </p>
                      <p className="text-xs" style={{ color: "#a8a496" }}>
                        {link.description}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* ── Mock data notice ────────────────────────────────────────────── */}
          {usingMockData && (
            <div
              className="mb-5 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm"
              style={{ backgroundColor: "#f4b94210", borderColor: "#f4b94240", color: "#f4b942" }}
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
                <code className="rounded px-1 text-xs" style={{ backgroundColor: "#242b48" }}>
                  GET /api/judges/:id/casos
                </code>{" "}
                aún no está disponible. Los casos mostrados son ficticios.
              </span>
            </div>
          )}

          {/* ── Casos ──────────────────────────────────────────────────────── */}
          <section className="mb-6">
            <div className="mb-4 flex items-center gap-2">
              <h2 className="font-serif text-xl font-bold" style={{ color: "#f4f2e6" }}>
                Casos registrados
              </h2>
              {paginated && (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: "#242b48", color: "#a8a496" }}
                >
                  {paginated.total}
                </span>
              )}
            </div>

            {loadingCasos ? (
              <div
                className="h-40 animate-pulse rounded-xl border"
                style={{ backgroundColor: "#181f38", borderColor: "#242b48" }}
              />
            ) : !paginated || paginated.data.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center rounded-xl border py-12"
                style={{ borderColor: "#242b48", backgroundColor: "#181f38" }}
              >
                <p className="font-medium" style={{ color: "#f4f2e6" }}>
                  Sin casos registrados
                </p>
                <p className="mt-1 text-sm" style={{ color: "#a8a496" }}>
                  Aún no se han cargado expedientes para este juez.
                </p>
              </div>
            ) : (
              <>
                <div
                  className="overflow-hidden rounded-xl border"
                  style={{ borderColor: "#242b48" }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr
                          style={{ backgroundColor: "#181f38", borderBottom: "1px solid #242b48" }}
                        >
                          {["Expediente", "Fecha resolución", "Tipo de medida", "Resultado"].map(
                            (col) => (
                              <th
                                key={col}
                                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                                style={{ color: "#a8a496" }}
                              >
                                {col}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {paginated.data.map((caso, i) => (
                          <tr
                            key={caso.id}
                            style={{
                              backgroundColor: i % 2 === 0 ? "#0f1529" : "#181f38",
                              borderBottom: "1px solid #242b48",
                            }}
                          >
                            <td
                              className="px-4 py-3 font-mono text-xs"
                              style={{ color: "#c18a38" }}
                            >
                              {caso.nroExpediente}
                            </td>
                            <td className="px-4 py-3" style={{ color: "#f4f2e6" }}>
                              {formatDate(caso.fechaResolucion)}
                            </td>
                            <td className="px-4 py-3" style={{ color: "#a8a496" }}>
                              {caso.tipoMedida}
                            </td>
                            <td className="px-4 py-3">
                              <ResultadoBadge resultado={caso.resultado} />
                              {caso.observaciones && (
                                <p className="mt-1 text-xs" style={{ color: "#a8a496" }}>
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

                {/* Paginación */}
                {paginated.totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs" style={{ color: "#a8a496" }}>
                      Página {paginated.page} de {paginated.totalPages} — {paginated.total} casos en
                      total
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage((p) => p - 1)}
                        disabled={paginated.page === 1}
                        className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40"
                        style={{
                          backgroundColor: "#242b48",
                          color: "#f4f2e6",
                          border: "1px solid #363e5e",
                        }}
                      >
                        ← Anterior
                      </button>
                      <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={paginated.page === paginated.totalPages}
                        className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40"
                        style={{
                          backgroundColor: "#242b48",
                          color: "#f4f2e6",
                          border: "1px solid #363e5e",
                        }}
                      >
                        Siguiente →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>

          {/* ── Documentación pública ──────────────────────────────────────── */}
          {archivos.length > 0 && (
            <section>
              <h2 className="mb-4 font-serif text-xl font-bold" style={{ color: "#f4f2e6" }}>
                Documentación pública
              </h2>
              <div className="space-y-2">
                {archivos.map((archivo) => (
                  <a
                    key={archivo.id}
                    href={archivo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:border-[#c18a38]/40"
                    style={{ backgroundColor: "#181f38", borderColor: "#242b48" }}
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
                      <span className="text-sm" style={{ color: "#f4f2e6" }}>
                        {archivo.nombre}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs" style={{ color: "#a8a496" }}>
                        {formatDate(archivo.fechaCarga)}
                      </span>
                      <svg
                        className="h-4 w-4"
                        style={{ color: "#c18a38" }}
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
