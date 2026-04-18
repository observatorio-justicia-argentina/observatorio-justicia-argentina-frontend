"use client";

import { Judge, SALARY_BAND_LABELS, getSalaryBand } from "../lib/api";

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

// ── Componente principal ──────────────────────────────────────────────────────

export default function JudgeCard(judge: Judge) {
  const {
    isDemoData,
    name,
    court,
    location,
    jurisdiction,
    salary,
    totalReleases,
    ftaCount,
    newArrestCount,
    revokedCount,
    totalFailures,
    failureRate,
  } = judge;

  const rateColor = failureRate > 20 ? "#f85149" : failureRate > 10 ? "#F4B942" : "#3fb950";
  const rateBg = failureRate > 20 ? "#f8514920" : failureRate > 10 ? "#F4B94220" : "#3fb95020";

  const locationPath = location.department.toLowerCase().includes(location.province.toLowerCase())
    ? location.department
    : `${location.province} › ${location.department}`;

  const salaryBand = getSalaryBand(salary.grossMonthlyARS);
  const salaryBandColor =
    salaryBand === "alta" ? "#f85149" : salaryBand === "media" ? "#F4B942" : "#3fb950";

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

      {/* ── Escala salarial ── */}
      <div className="flex items-center justify-between px-5 py-2">
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
    </article>
  );
}
