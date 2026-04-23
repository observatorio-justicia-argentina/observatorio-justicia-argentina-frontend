"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import {
  ArchivoPublico,
  Caso,
  CausaRanking,
  EstadoCausa,
  fetchJudgeArchivos,
  fetchJudgeCases,
  fetchJudgeBySlug,
  fetchJudgeCausasRanking,
  Judge,
  POLITICAL_ORIGIN_CONFIG,
  ResultadoCaso,
} from "../../lib/api";
import { Tag, type TagVariant } from "../../components/Tag";

// ── Helpers ───────────────────────────────────────────────────────────────────

const RESULTADO_LABEL: Record<ResultadoCaso, string> = {
  fta: "No compareció",
  newArrest: "Nuevo arresto",
  revoked: "Revocada",
  ongoing: "Pendiente",
};

const RESULTADO_VARIANT: Record<ResultadoCaso, TagVariant> = {
  fta: "warning",
  newArrest: "danger",
  revoked: "violet",
  ongoing: "neutral",
};

function ResultadoBadge({ resultado }: { resultado: ResultadoCaso }) {
  return <Tag variant={RESULTADO_VARIANT[resultado]}>{RESULTADO_LABEL[resultado]}</Tag>;
}

function StatBox({
  value,
  label,
  valueClass,
}: {
  value: number;
  label: string;
  valueClass: string;
}) {
  return (
    <div className="bg-ink flex flex-col items-center rounded-lg px-4 py-3">
      <span className={`text-2xl font-bold ${valueClass}`}>{value}</span>
      <span className="text-cream-muted mt-0.5 text-center text-xs">{label}</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border flex flex-col gap-0.5 border-b py-2.5">
      <span className="text-cream-muted text-xs font-medium uppercase tracking-wide">{label}</span>
      <span className="text-cream text-sm">{value}</span>
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

function rateClasses(rate: number): string {
  if (rate > 20) return "bg-danger-soft text-danger border-danger/40";
  if (rate > 10) return "bg-gold-soft text-gold border-gold/40";
  return "bg-success-soft text-success border-success/40";
}

// ── Componente principal ──────────────────────────────────────────────────────

const LIMIT = 10;

export default function JudgeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [judge, setJudge] = useState<Judge | null>(null);
  const [paginated, setPaginated] = useState<{
    data: Caso[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);
  const [archivos, setArchivos] = useState<ArchivoPublico[]>([]);
  const [page, setPage] = useState(1);
  const [causasRanking, setCausasRanking] = useState<CausaRanking[]>([]);
  const [loadingJudge, setLoadingJudge] = useState(true);
  const [loadingCasos, setLoadingCasos] = useState(true);
  const [errorJudge, setErrorJudge] = useState<string | null>(null);
  const [errorCasos, setErrorCasos] = useState(false);

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

  // Cargar causas ranking del juez
  useEffect(() => {
    let cancelled = false;
    fetchJudgeCausasRanking(slug)
      .then((data) => {
        if (!cancelled) setCausasRanking(data);
      })
      .catch(() => {
        /* silencioso — la sección simplemente no aparece */
      });
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
          setPaginated(null);
          setArchivos([]);
          setErrorCasos(true);
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
        className="text-gold hover:text-cream mb-6 inline-flex items-center gap-1.5 text-sm transition-colors"
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
        <div className="bg-danger-soft border-danger text-danger rounded-lg border px-4 py-3 text-sm">
          {errorJudge}
        </div>
      )}

      {/* Loading skeleton */}
      {loadingJudge && (
        <div className="space-y-4">
          <div className="shimmer-bg border-border h-40 rounded-xl border" />
          <div className="shimmer-bg border-border h-64 rounded-xl border" />
        </div>
      )}

      {!loadingJudge && judge && (
        <>
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <article className="bg-ink-elevated border-border mb-6 overflow-hidden rounded-xl border">
            <div className="border-border flex flex-wrap items-start justify-between gap-3 border-b px-6 py-5">
              <div className="min-w-0">
                <p className="text-gold mb-2 text-xs font-semibold uppercase tracking-[0.28em]">
                  Perfil Judicial
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-cream font-serif text-3xl font-bold sm:text-4xl lg:text-5xl">
                    {judge.name}
                  </h1>
                  {judge.isDemoData && <Tag variant="warning">Demo</Tag>}
                </div>
                <p className="text-gold mt-1 text-sm">{judge.court}</p>
                <p className="text-cream-muted mt-0.5 text-xs">{locationPath}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Tag variant="gold">{judge.location.province}</Tag>
                <span
                  className={`rounded-sm border px-2.5 py-0.5 text-sm font-bold ${rateClasses(rate)}`}
                >
                  {failureRate}% falla
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
              <StatBox
                value={judge.totalReleases}
                label="Libertades otorgadas"
                valueClass="text-cream"
              />
              <StatBox value={judge.ftaCount} label="No compareció" valueClass="text-warning" />
              <StatBox
                value={judge.newArrestCount}
                label="Nuevo arresto"
                valueClass="text-danger"
              />
              <StatBox
                value={judge.revokedCount}
                label="Medida revocada"
                valueClass="text-violet"
              />
            </div>
          </article>

          {/* ── Info del cargo ─────────────────────────────────────────────── */}
          <section className="bg-ink-elevated border-border mb-6 overflow-hidden rounded-xl border">
            <div className="border-border border-b px-5 py-3">
              <h2 className="text-cream text-sm font-semibold">Datos del cargo</h2>
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
              <div className="border-border mx-5 border-b py-2.5">
                <span className="text-cream-muted text-xs font-medium uppercase tracking-wide">
                  Remuneración bruta mensual
                </span>
                <div className="mt-1 flex flex-wrap items-baseline gap-2">
                  <span className="text-success text-lg font-bold">
                    {formatARS(judge.salary?.grossMonthlyARS ?? 0)}
                  </span>
                  <span className="text-cream-muted text-xs">
                    {judge.salary?.category} — {judge.salary?.acordada} (desde{" "}
                    {judge.salary?.validFrom})
                  </span>
                </div>
              </div>
            )}
            {/* Bio */}
            {judge.publicBio && (
              <div className="px-5 py-3">
                <span className="text-cream-muted text-xs font-medium uppercase tracking-wide">
                  Biografía pública
                </span>
                <p className="text-cream-muted mt-1 text-sm leading-relaxed">{judge.publicBio}</p>
              </div>
            )}
          </section>

          {/* ── Expediente Reputacional ─────────────────────────────────── */}
          {(judge.appointmentDetail || (judge.associations && judge.associations.length > 0)) && (
            <section
              className="mb-6 overflow-hidden rounded-xl border"
              style={{ backgroundColor: "#161b22", borderColor: "#21262d" }}
            >
              <div className="px-5 py-3" style={{ borderBottom: "1px solid #21262d" }}>
                <h2 className="text-sm font-semibold" style={{ color: "#e6edf3" }}>
                  Expediente reputacional
                </h2>
              </div>

              {/* Origen de designación */}
              {judge.appointmentDetail &&
                (() => {
                  const d = judge.appointmentDetail;
                  const cfg = POLITICAL_ORIGIN_CONFIG[d.politicalOrigin];
                  return (
                    <div className="px-5 py-4" style={{ borderBottom: "1px solid #21262d" }}>
                      <p
                        className="mb-3 text-xs font-bold uppercase tracking-wider"
                        style={{ color: "#7d8590" }}
                      >
                        Origen de la designación
                      </p>
                      <span
                        className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold"
                        style={{
                          backgroundColor: cfg.color + "20",
                          color: cfg.color,
                          border: `1px solid ${cfg.color}40`,
                        }}
                      >
                        {cfg.label}
                      </span>
                      {d.politicalOriginDetail && (
                        <p className="mt-2 text-xs leading-relaxed" style={{ color: "#8b949e" }}>
                          {d.politicalOriginDetail}
                        </p>
                      )}

                      {d.politicalOriginSources && d.politicalOriginSources.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {d.politicalOriginSources.map((src, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-1.5 text-xs"
                              style={{ color: "#8b949e" }}
                            >
                              <span className="mt-0.5 shrink-0" style={{ color: "#3d444d" }}>
                                •
                              </span>
                              <a
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline decoration-dotted transition-colors hover:opacity-80"
                                style={{ color: "#74ACDF" }}
                              >
                                {src.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Concurso Magistratura */}
                      {(d.magistraturaScore !== undefined || d.magistraturaRank !== undefined) && (
                        <div className="mt-4 flex flex-wrap gap-3">
                          {d.magistraturaCompetitionId && (
                            <div
                              className="flex-1 rounded-lg px-3 py-2"
                              style={{ backgroundColor: "#0d1117", minWidth: "180px" }}
                            >
                              <p className="text-xs" style={{ color: "#7d8590" }}>
                                Concurso
                              </p>
                              <p
                                className="mt-0.5 text-xs font-medium"
                                style={{ color: "#e6edf3" }}
                              >
                                {d.magistraturaSourceUrl ? (
                                  <a
                                    href={d.magistraturaSourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline"
                                    style={{ color: "#74ACDF" }}
                                  >
                                    {d.magistraturaCompetitionId}
                                  </a>
                                ) : (
                                  d.magistraturaCompetitionId
                                )}
                              </p>
                            </div>
                          )}
                          {d.magistraturaScore !== undefined && (
                            <div
                              className="rounded-lg px-3 py-2"
                              style={{ backgroundColor: "#0d1117" }}
                            >
                              <p className="text-xs" style={{ color: "#7d8590" }}>
                                Puntaje
                              </p>
                              <p className="mt-0.5 text-sm font-bold" style={{ color: "#e6edf3" }}>
                                {d.magistraturaScore.toFixed(1)}
                              </p>
                            </div>
                          )}
                          {d.magistraturaRank !== undefined && (
                            <div
                              className="rounded-lg px-3 py-2"
                              style={{ backgroundColor: "#0d1117" }}
                            >
                              <p className="text-xs" style={{ color: "#7d8590" }}>
                                Puesto en mérito
                              </p>
                              <p className="mt-0.5 text-sm font-bold" style={{ color: "#e6edf3" }}>
                                #{d.magistraturaRank}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Senado */}
                      {d.senateSession && (
                        <div className="mt-4">
                          <p className="mb-1.5 text-xs font-medium" style={{ color: "#7d8590" }}>
                            Acuerdo del Senado
                            {d.senateSession !==
                              "N/A — designación provincial (acuerdo de la Legislatura de Buenos Aires)" && (
                              <span className="ml-2 font-normal">{d.senateSession}</span>
                            )}
                            {d.senateSession.startsWith("N/A") && (
                              <span className="ml-2 font-normal">{d.senateSession}</span>
                            )}
                          </p>
                          {d.senateBackers && d.senateBackers.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {d.senateBackers.map((backer, i) => (
                                <span
                                  key={i}
                                  className="rounded px-2 py-0.5 text-xs"
                                  style={{ backgroundColor: "#21262d", color: "#8b949e" }}
                                >
                                  {backer}
                                </span>
                              ))}
                            </div>
                          )}
                          {d.senateRecordUrl && (
                            <a
                              href={d.senateRecordUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-block text-xs hover:underline"
                              style={{ color: "#74ACDF" }}
                            >
                              ↗ Ver versión taquigráfica
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

              {/* Asociaciones */}
              {judge.associations && judge.associations.length > 0 && (
                <div className="px-5 py-4">
                  <p
                    className="mb-3 text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#7d8590" }}
                  >
                    Vínculos institucionales
                  </p>
                  <div className="flex flex-col gap-3">
                    {judge.associations.map((assoc, i) => (
                      <div key={i} className="flex items-start justify-between gap-3">
                        <div>
                          {assoc.sourceUrl ? (
                            <a
                              href={assoc.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium hover:underline"
                              style={{ color: "#74ACDF" }}
                            >
                              {assoc.name}
                            </a>
                          ) : (
                            <p className="text-sm font-medium" style={{ color: "#e6edf3" }}>
                              {assoc.name}
                            </p>
                          )}
                          {assoc.role && (
                            <p className="text-xs" style={{ color: "#7d8590" }}>
                              {assoc.role}
                            </p>
                          )}
                        </div>
                        {assoc.since && (
                          <span
                            className="shrink-0 rounded px-2 py-0.5 font-mono text-xs"
                            style={{ backgroundColor: "#21262d", color: "#7d8590" }}
                          >
                            desde {assoc.since}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ── Fuentes ────────────────────────────────────────────────────── */}
          {judge.sourceLinks && judge.sourceLinks.length > 0 && (
            <section className="bg-ink-elevated border-border mb-6 overflow-hidden rounded-xl border">
              <div className="border-border border-b px-5 py-3">
                <h2 className="text-cream text-sm font-semibold">Fuentes oficiales</h2>
              </div>
              <div className="divide-border divide-y">
                {judge.sourceLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:bg-cream/5 flex items-start gap-3 px-5 py-3 transition-colors"
                  >
                    <svg
                      className="text-gold mt-0.5 h-4 w-4 shrink-0"
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
                      <p className="text-gold text-sm font-medium">{link.label}</p>
                      <p className="text-cream-muted text-xs">{link.description}</p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* ── Sin conexión notice ─────────────────────────────────────────── */}
          {errorCasos && (
            <div className="border-border bg-ink-elevated mb-5 flex items-center gap-3 rounded-xl border px-5 py-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="text-cream-muted h-5 w-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3l18 18M8.111 8.111A7 7 0 0116.9 16.9M1.42 1.42l.58.58M22 12c0 5.523-4.477 10-10 10M12 2C6.477 2 2 6.477 2 12"
                />
              </svg>
              <div>
                <p className="text-cream text-sm font-medium">Sin conexión con el servidor</p>
                <p className="text-cream-muted text-xs">
                  No se pudieron cargar los casos. Reintentá cuando el servidor esté disponible.
                </p>
              </div>
            </div>
          )}

          {/* ── Casos ──────────────────────────────────────────────────────── */}
          <section className="mb-6">
            <p className="text-gold mb-2 text-xs font-semibold uppercase tracking-[0.28em]">
              Expedientes
            </p>
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-cream font-serif text-2xl font-bold sm:text-3xl">
                Casos registrados
              </h2>
              {paginated && <Tag>{paginated.total}</Tag>}
            </div>

            {loadingCasos ? (
              <div className="shimmer-bg border-border h-40 rounded-xl border" />
            ) : !paginated || paginated.data.length === 0 ? (
              <div className="bg-ink-elevated border-border flex flex-col items-center justify-center rounded-xl border py-12">
                <p className="text-cream font-medium">Sin casos registrados</p>
                <p className="text-cream-muted mt-1 text-sm">
                  Aún no se han cargado expedientes para este juez.
                </p>
              </div>
            ) : (
              <>
                <div className="border-border overflow-hidden rounded-xl border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-ink-elevated border-border border-b">
                          {["Expediente", "Fecha resolución", "Tipo de medida", "Resultado"].map(
                            (col) => (
                              <th
                                key={col}
                                className="text-cream-muted px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
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
                            className={`border-border border-b ${i % 2 === 0 ? "bg-ink" : "bg-ink-elevated"}`}
                          >
                            <td className="text-gold px-4 py-3 font-mono text-xs">
                              {caso.expediente}
                            </td>
                            <td className="text-cream px-4 py-3">
                              {formatDate(caso.decisionDate)}
                            </td>
                            <td className="text-cream-muted px-4 py-3">{caso.decisionType}</td>
                            <td className="px-4 py-3">
                              <ResultadoBadge resultado={caso.outcome} />
                              {caso.outcomeDetail && (
                                <p className="text-cream-muted mt-1 text-xs">
                                  {caso.outcomeDetail}
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
                    <span className="text-cream-muted text-xs">
                      Página {paginated.page} de {paginated.totalPages} — {paginated.total} casos en
                      total
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage((p) => p - 1)}
                        disabled={paginated.page === 1}
                        className="bg-border text-cream border-border-strong hover:bg-cream/5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40"
                      >
                        ← Anterior
                      </button>
                      <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={paginated.page === paginated.totalPages}
                        className="bg-border text-cream border-border-strong hover:bg-cream/5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40"
                      >
                        Siguiente →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>

          {/* ── Causas por tiempo de demora ────────────────────────────────── */}
          {causasRanking.length > 0 && (
            <section className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold" style={{ color: "#e6edf3" }}>
                    Causas por tiempo de demora
                  </h2>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{ backgroundColor: "#21262d", color: "#7d8590" }}
                  >
                    {causasRanking.length}
                  </span>
                </div>
                <Link
                  href="/causas"
                  className="text-xs underline transition-opacity hover:opacity-70"
                  style={{ color: "#74ACDF" }}
                >
                  Ver ranking global →
                </Link>
              </div>

              <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "#21262d" }}>
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "#161b22", borderBottom: "1px solid #21262d" }}>
                      {["Expediente", "Tipo de causa", "Días", "Estado"].map((col) => (
                        <th
                          key={col}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                          style={{ color: "#7d8590" }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {causasRanking.map((causa, idx) => {
                      const estadoCfg: Record<
                        EstadoCausa,
                        { label: string; color: string; bg: string; dot: string }
                      > = {
                        activa: { label: "Activa", color: "#3fb950", bg: "#3fb95015", dot: "🟢" },
                        "demora-moderada": {
                          label: "Demora moderada",
                          color: "#d29922",
                          bg: "#d2992215",
                          dot: "🟡",
                        },
                        "alta-demora": {
                          label: "Alta demora",
                          color: "#f85149",
                          bg: "#f8514915",
                          dot: "🔴",
                        },
                        resuelta: {
                          label: "Resuelta",
                          color: "#7d8590",
                          bg: "#7d859015",
                          dot: "✅",
                        },
                      };
                      const cfg = estadoCfg[causa.estadoCausa];
                      return (
                        <tr
                          key={`${causa.expediente}-${idx}`}
                          style={{
                            borderBottom: "1px solid #21262d",
                            backgroundColor: idx % 2 === 0 ? "transparent" : "#0d111720",
                          }}
                        >
                          <td className="px-4 py-3 font-mono text-xs" style={{ color: "#e6edf3" }}>
                            {causa.expediente}
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: "#e6edf3" }}>
                            {causa.delito}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-base font-bold" style={{ color: cfg.color }}>
                              {causa.diasDesdeInicio.toLocaleString("es-AR")}
                            </span>
                            <span className="ml-1 text-xs" style={{ color: "#7d8590" }}>
                              días
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium"
                              style={{
                                borderColor: cfg.color + "40",
                                backgroundColor: cfg.bg,
                                color: cfg.color,
                              }}
                            >
                              {cfg.dot} {cfg.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <p className="mt-2 text-xs" style={{ color: "#7d8590" }}>
                Ordenadas por días desde inicio (mayor primero).{" "}
                <Link href="/metodologia" className="underline" style={{ color: "#74ACDF" }}>
                  Ver metodología y umbrales
                </Link>
              </p>
            </section>
          )}

          {/* ── Documentación pública ──────────────────────────────────────── */}
          {archivos.length > 0 && (
            <section>
              <p className="text-gold mb-2 text-xs font-semibold uppercase tracking-[0.28em]">
                Archivo
              </p>
              <h2 className="text-cream mb-4 font-serif text-2xl font-bold sm:text-3xl">
                Documentación pública
              </h2>
              <div className="space-y-2">
                {archivos.map((archivo) => (
                  <a
                    key={archivo.id}
                    href={archivo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-ink-elevated border-border hover:border-gold/40 flex items-center justify-between rounded-lg border px-4 py-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className="text-danger h-5 w-5 shrink-0"
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
                      <span className="text-cream text-sm">{archivo.nombre}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-cream-muted text-xs">
                        {formatDate(archivo.fechaCarga)}
                      </span>
                      <svg
                        className="text-gold h-4 w-4"
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
