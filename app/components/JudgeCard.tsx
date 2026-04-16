"use client";

import { useState } from "react";
import { Judge, JudgeCase, SALARY_BAND_LABELS, getSalaryBand } from "../lib/api";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatARS(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

const OUTCOME_CONFIG = {
  fta: { label: "No compareció", color: "#d29922", bg: "#d2992220" },
  newArrest: { label: "Nuevo arresto", color: "#f85149", bg: "#f8514920" },
  revoked: { label: "Revocada", color: "#a371f7", bg: "#a371f720" },
  ongoing: { label: "En curso", color: "#3fb950", bg: "#3fb95020" },
} as const;

// ── Sub-componentes ───────────────────────────────────────────────────────────

function StatBadge({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div
      className="flex flex-col items-center rounded-lg px-3 py-2"
      style={{ backgroundColor: "#0d1117" }}
    >
      <span className="text-xl font-bold" style={{ color }}>
        {value}
      </span>
      <span className="mt-0.5 text-center text-xs leading-tight" style={{ color: "#7d8590" }}>
        {label}
      </span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <span
        className="shrink-0 text-xs font-medium"
        style={{ color: "#7d8590", minWidth: "170px" }}
      >
        {label}
      </span>
      <span className="text-xs" style={{ color: "#c9d1d9" }}>
        {value}
      </span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-3 text-xs font-bold uppercase tracking-wider" style={{ color: "#7d8590" }}>
      {children}
    </h4>
  );
}

function CaseRow({ c }: { c: JudgeCase }) {
  const cfg = OUTCOME_CONFIG[c.outcome];
  return (
    <div
      className="rounded-lg border p-3"
      style={{ backgroundColor: "#0d1117", borderColor: "#21262d" }}
    >
      <div className="mb-1.5 flex flex-wrap items-start justify-between gap-2">
        <div>
          <span className="font-mono text-xs font-semibold" style={{ color: "#74ACDF" }}>
            Exp. {c.expediente}
          </span>
          <span className="ml-2 text-xs" style={{ color: "#7d8590" }}>
            {c.decisionDate}
          </span>
        </div>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: cfg.bg,
            color: cfg.color,
            border: `1px solid ${cfg.color}40`,
          }}
        >
          {cfg.label}
        </span>
      </div>
      <p className="text-xs font-medium" style={{ color: "#e6edf3" }}>
        {c.defendant}
      </p>
      <p className="mt-0.5 text-xs" style={{ color: "#8b949e" }}>
        {c.crime}{" "}
        <span className="font-mono" style={{ color: "#7d8590" }}>
          ({c.crimeArticle})
        </span>
      </p>
      <p className="mt-1 text-xs" style={{ color: "#7d8590" }}>
        <strong style={{ color: "#8b949e" }}>Resolución:</strong> {c.decisionType} — {c.legalBasis}
      </p>
      {c.outcomeDetail && (
        <p className="mt-1 text-xs italic" style={{ color: cfg.color + "cc" }}>
          {c.outcomeDetail}
        </p>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function JudgeCard(judge: Judge) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"datos" | "causas" | "fuentes">("datos");

  const {
    isDemoData,
    name,
    court,
    location,
    jurisdiction,
    workAddress,
    workHours,
    salary,
    appointmentDate,
    appointmentBody,
    yearsOnBench,
    totalReleases,
    ftaCount,
    newArrestCount,
    revokedCount,
    totalFailures,
    failureRate,
    cases,
    sourceLinks,
    publicBio,
    education,
    careerHistory,
    notableDecisions,
    extendedStats,
  } = judge;

  const rateColor = failureRate > 20 ? "#f85149" : failureRate > 10 ? "#F4B942" : "#3fb950";
  const rateBg = failureRate > 20 ? "#f8514920" : failureRate > 10 ? "#F4B94220" : "#3fb95020";

  const locationPath = location.department.toLowerCase().includes(location.province.toLowerCase())
    ? location.department
    : `${location.province} › ${location.department}`;

  const salaryBand = getSalaryBand(salary.grossMonthlyARS);
  const salaryBandColor =
    salaryBand === "alta" ? "#f85149" : salaryBand === "media" ? "#F4B942" : "#3fb950";

  const tabs = [
    { id: "datos" as const, label: "Datos" },
    { id: "causas" as const, label: `Causas (${cases.length})` },
    { id: "fuentes" as const, label: "Fuentes" },
  ];

  return (
    <article
      className="overflow-hidden rounded-xl border transition-all hover:border-[#74ACDF]/40 hover:shadow-lg hover:shadow-black/30"
      style={{ backgroundColor: "#161b22", borderColor: "#21262d" }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-start justify-between gap-3 px-5 py-4"
        style={{ borderBottom: "1px solid #21262d" }}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold" style={{ color: "#e6edf3" }}>
              {name}
            </h3>
            {isDemoData && (
              <span
                className="rounded px-1.5 py-0.5 text-xs font-bold tracking-wider"
                style={{
                  backgroundColor: "#F4B94220",
                  color: "#F4B942",
                  border: "1px solid #F4B94240",
                }}
              >
                FICTICIO
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs" style={{ color: "#74ACDF" }}>
            {court}
          </p>
        </div>
        <span
          className="mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: "#74ACDF15",
            color: "#74ACDF",
            border: "1px solid #74ACDF30",
          }}
        >
          {location.province}
        </span>
      </div>

      {/* ── Jurisdicción ── */}
      <div
        className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-2 text-xs"
        style={{ color: "#7d8590", borderBottom: "1px solid #21262d" }}
      >
        <span>{locationPath}</span>
        <span style={{ color: "#30363d" }}>·</span>
        <span>{jurisdiction.fuero}</span>
        <span style={{ color: "#30363d" }}>·</span>
        <span>{jurisdiction.instance}</span>
        <span
          className="rounded px-1.5 py-0.5 text-xs"
          style={{ backgroundColor: "#21262d", color: "#8b949e" }}
        >
          {jurisdiction.scope} / {jurisdiction.competence}
        </span>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
        <StatBadge value={totalReleases} label="Libertades" color="#e6edf3" />
        <StatBadge value={ftaCount} label="No compareció" color="#d29922" />
        <StatBadge value={newArrestCount} label="Nuevo arresto" color="#f85149" />
        <StatBadge value={revokedCount} label="Revocada" color="#a371f7" />
      </div>

      {/* ── Tasa ── */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderTop: "1px solid #21262d", borderBottom: "1px solid #21262d" }}
      >
        <span className="text-xs" style={{ color: "#7d8590" }}>
          Tasa de falla procesal ({totalFailures} de {totalReleases})
        </span>
        <span
          className="rounded-full px-2.5 py-0.5 text-sm font-bold"
          style={{
            backgroundColor: rateBg,
            color: rateColor,
            border: `1px solid ${rateColor}40`,
          }}
        >
          {failureRate.toFixed(1)}%
        </span>
      </div>

      {/* ── Escala salarial badge ── */}
      <div
        className="flex items-center justify-between px-5 py-2"
        style={{ borderBottom: "1px solid #21262d" }}
      >
        <span className="text-xs" style={{ color: "#7d8590" }}>
          Escala salarial
        </span>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
          style={{
            backgroundColor: salaryBandColor + "20",
            color: salaryBandColor,
            border: `1px solid ${salaryBandColor}40`,
          }}
        >
          {SALARY_BAND_LABELS[salaryBand]}
        </span>
      </div>

      {/* ── Toggle detalle ── */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3 text-xs font-medium transition-colors hover:bg-white/5"
        style={{ color: "#74ACDF" }}
      >
        <span>{expanded ? "Ocultar detalle" : "Ver detalle completo"}</span>
        <span>{expanded ? "▲" : "▼"}</span>
      </button>

      {/* ── Panel expandido ── */}
      {expanded && (
        <div className="border-t" style={{ borderColor: "#21262d" }}>
          {/* Tabs */}
          <div className="flex gap-0 border-b" style={{ borderColor: "#21262d" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 py-2.5 text-xs font-medium transition-colors"
                style={{
                  color: activeTab === tab.id ? "#74ACDF" : "#7d8590",
                  borderBottom:
                    activeTab === tab.id ? "2px solid #74ACDF" : "2px solid transparent",
                  backgroundColor: "transparent",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Datos */}
          {activeTab === "datos" && (
            <div className="flex flex-col divide-y divide-[#21262d]">
              {/* Bio */}
              {publicBio && (
                <section className="px-5 py-4">
                  <SectionTitle>Perfil público</SectionTitle>
                  <p className="text-xs leading-relaxed" style={{ color: "#c9d1d9" }}>
                    {publicBio}
                  </p>
                </section>
              )}

              {/* Datos laborales */}
              <section className="px-5 py-4">
                <SectionTitle>Datos laborales</SectionTitle>
                <div className="flex flex-col gap-2">
                  <InfoRow label="Domicilio laboral" value={workAddress} />
                  <InfoRow label="Horario de atención" value={workHours} />
                  <InfoRow
                    label="Remuneración bruta"
                    value={`${formatARS(salary.grossMonthlyARS)} / mes — ${salary.category} (${salary.acordada}, ${salary.lastUpdated})`}
                  />
                  <InfoRow label="Fecha de designación" value={appointmentDate} />
                  <InfoRow label="Organismo designante" value={appointmentBody} />
                  <InfoRow label="Antigüedad en el cargo" value={`${yearsOnBench} años`} />
                </div>
              </section>

              {/* Stats extendidas */}
              {extendedStats && (
                <section className="px-5 py-4">
                  <SectionTitle>Estadísticas de gestión</SectionTitle>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[
                      {
                        label: "Días prom. resolución",
                        value: `${extendedStats.avgResolutionDays} días`,
                      },
                      { label: "Causas pendientes", value: String(extendedStats.pendingCases) },
                      { label: "Recusaciones", value: String(extendedStats.recusals) },
                      {
                        label: "Resoluciones apeladas",
                        value: String(extendedStats.appealedDecisions),
                      },
                      {
                        label: "Revocadas en Cámara",
                        value: String(extendedStats.reversedOnAppeal),
                      },
                      {
                        label: "Tasa de revocación",
                        value: `${extendedStats.reversalRate.toFixed(1)}%`,
                      },
                    ].map(({ label, value }) => (
                      <div
                        key={label}
                        className="rounded-lg p-2.5"
                        style={{ backgroundColor: "#0d1117" }}
                      >
                        <p className="text-xs font-bold" style={{ color: "#e6edf3" }}>
                          {value}
                        </p>
                        <p className="mt-0.5 text-xs" style={{ color: "#7d8590" }}>
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Educación */}
              {education && education.length > 0 && (
                <section className="px-5 py-4">
                  <SectionTitle>Formación académica</SectionTitle>
                  <div className="flex flex-col gap-2">
                    {education.map((e, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="mt-0.5 text-xs" style={{ color: "#74ACDF" }}>
                          {e.year}
                        </span>
                        <div>
                          <p className="text-xs font-medium" style={{ color: "#e6edf3" }}>
                            {e.degree}
                          </p>
                          <p className="text-xs" style={{ color: "#7d8590" }}>
                            {e.institution}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Trayectoria */}
              {careerHistory && careerHistory.length > 0 && (
                <section className="px-5 py-4">
                  <SectionTitle>Trayectoria profesional</SectionTitle>
                  <div className="flex flex-col gap-2">
                    {careerHistory.map((c, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span
                          className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-xs"
                          style={{ backgroundColor: "#21262d", color: "#7d8590" }}
                        >
                          {c.period}
                        </span>
                        <div>
                          <p className="text-xs font-medium" style={{ color: "#e6edf3" }}>
                            {c.role}
                          </p>
                          <p className="text-xs" style={{ color: "#7d8590" }}>
                            {c.institution}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Decisiones notables */}
              {notableDecisions && notableDecisions.length > 0 && (
                <section className="px-5 py-4">
                  <SectionTitle>Decisiones destacadas</SectionTitle>
                  <div className="flex flex-col gap-3">
                    {notableDecisions.map((d, i) => (
                      <div
                        key={i}
                        className="rounded-lg border p-3"
                        style={{ backgroundColor: "#0d1117", borderColor: "#21262d" }}
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-xs font-bold" style={{ color: "#74ACDF" }}>
                            {d.year}
                          </span>
                          {d.article && (
                            <span className="font-mono text-xs" style={{ color: "#7d8590" }}>
                              {d.article}
                            </span>
                          )}
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: "#c9d1d9" }}>
                          {d.description}
                        </p>
                        <p className="mt-1 text-xs italic" style={{ color: "#7d8590" }}>
                          Resultado: {d.outcome}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* Tab: Causas */}
          {activeTab === "causas" && (
            <section className="px-5 py-4">
              <SectionTitle>Causas relevadas ({cases.length} casos de prueba)</SectionTitle>
              <div className="flex flex-col gap-2">
                {cases.map((c) => (
                  <CaseRow key={c.expediente} c={c} />
                ))}
              </div>
            </section>
          )}

          {/* Tab: Fuentes */}
          {activeTab === "fuentes" && (
            <section className="px-5 py-4">
              <SectionTitle>Fuentes de información (enlaces de referencia)</SectionTitle>
              <div className="flex flex-col gap-3">
                {sourceLinks.map((link) => (
                  <div key={link.url} className="flex flex-col gap-0.5">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium hover:underline"
                      style={{ color: "#74ACDF" }}
                    >
                      ↗ {link.label}
                    </a>
                    <p className="text-xs" style={{ color: "#7d8590" }}>
                      {link.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </article>
  );
}
