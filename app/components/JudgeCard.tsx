"use client";

import { Judge, SALARY_BAND_LABELS, getSalaryBand } from "../lib/api";
import { Tag } from "./Tag";

// ── Sub-componentes ───────────────────────────────────────────────────────────

function StatBadge({
  value,
  label,
  valueClass,
}: {
  value: number;
  label: string;
  valueClass: string;
}) {
  return (
    <div className="bg-ink flex flex-col items-center rounded-lg px-3 py-2">
      <span className={`text-xl font-bold ${valueClass}`}>{value}</span>
      <span className="text-cream-muted mt-0.5 text-center text-xs leading-tight">{label}</span>
    </div>
  );
}

function rateClasses(rate: number): string {
  if (rate > 20) return "bg-danger-soft text-danger border-danger/40";
  if (rate > 10) return "bg-warning-soft text-warning border-warning/40";
  return "bg-success-soft text-success border-success/40";
}

function salaryBandClasses(band: "alta" | "media" | "baja"): string {
  if (band === "alta") return "bg-danger-soft text-danger border-danger/40";
  if (band === "media") return "bg-warning-soft text-warning border-warning/40";
  return "bg-success-soft text-success border-success/40";
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

  const locationPath = location.department.toLowerCase().includes(location.province.toLowerCase())
    ? location.department
    : `${location.province} › ${location.department}`;

  const salaryBand = getSalaryBand(salary?.grossMonthlyARS ?? 0);

  return (
    <article className="bg-ink-elevated border-border hover:border-gold/40 relative overflow-hidden rounded-xl border shadow-lg shadow-black/40 transition-all hover:shadow-xl hover:shadow-black/60">
      {/* Gold side accent — gazette-style article marker */}
      <div aria-hidden className="bg-gold/60 absolute inset-y-0 left-0 w-[3px]" />
      {/* ── Header ── */}
      <div className="border-border flex items-start justify-between gap-3 border-b px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-cream font-serif text-lg font-bold leading-tight">{name}</h3>
            {isDemoData && <Tag variant="gold">Ficticio</Tag>}
          </div>
          <p className="text-gold mt-0.5 text-xs">{court}</p>
        </div>
        <div className="mt-0.5 shrink-0">
          <Tag variant="gold">{location.province}</Tag>
        </div>
      </div>

      {/* ── Jurisdicción ── */}
      <div className="text-cream-muted border-border flex flex-wrap items-center gap-x-3 gap-y-1 border-b px-5 py-2 text-xs">
        <span>{locationPath}</span>
        <span className="text-border-strong">·</span>
        <span>{jurisdiction.fuero}</span>
        <span className="text-border-strong">·</span>
        <span>{jurisdiction.instance}</span>
        <span className="bg-border text-cream-muted rounded px-1.5 py-0.5 text-xs">
          {jurisdiction.scope} / {jurisdiction.competence}
        </span>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
        <StatBadge value={totalReleases} label="Libertades" valueClass="text-cream" />
        <StatBadge value={ftaCount} label="No compareció" valueClass="text-warning" />
        <StatBadge value={newArrestCount} label="Nuevo arresto" valueClass="text-danger" />
        <StatBadge value={revokedCount} label="Revocada" valueClass="text-violet" />
      </div>

      {/* ── Tasa ── */}
      <div className="border-border flex items-center justify-between border-b border-t px-5 py-3">
        <span className="text-cream-muted text-xs">
          Tasa de falla procesal ({totalFailures} de {totalReleases})
        </span>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-sm font-bold ${rateClasses(failureRate)}`}
        >
          {failureRate.toFixed(1)}%
        </span>
      </div>

      {/* ── Escala salarial badge ── */}
      <div className="border-border flex items-center justify-between border-b px-5 py-2">
        <span className="text-cream-muted text-xs">Escala salarial</span>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${salaryBandClasses(salaryBand)}`}
        >
          {SALARY_BAND_LABELS[salaryBand]}
        </span>
      </div>
    </article>
  );
}
