"use client";

import { useState } from "react";
import { Judge, JudgeCase, SALARY_BAND_LABELS, getSalaryBand } from "../lib/api";
import { ChevronDownIcon, ExternalLinkIcon } from "./icons";
import { Tag } from "./Tag";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatARS(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(n);
}

const OUTCOME_CONFIG = {
  fta: {
    label: "No compareció",
    pillCls: "bg-warning-soft text-warning border-warning/40",
    detailCls: "text-warning/80",
  },
  newArrest: {
    label: "Nuevo arresto",
    pillCls: "bg-danger-soft text-danger border-danger/40",
    detailCls: "text-danger/80",
  },
  revoked: {
    label: "Revocada",
    pillCls: "bg-violet-soft text-violet border-violet/40",
    detailCls: "text-violet/80",
  },
  ongoing: {
    label: "En curso",
    pillCls: "bg-success-soft text-success border-success/40",
    detailCls: "text-success/80",
  },
} as const;

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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <span className="text-cream-muted min-w-[170px] shrink-0 text-xs font-medium">{label}</span>
      <span className="text-cream text-xs">{value}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-cream-muted mb-3 text-xs font-bold uppercase tracking-wider">{children}</h4>
  );
}

function CaseRow({ c }: { c: JudgeCase }) {
  const cfg = OUTCOME_CONFIG[c.outcome];
  return (
    <div className="bg-ink border-border rounded-lg border p-3">
      <div className="mb-1.5 flex flex-wrap items-start justify-between gap-2">
        <div>
          <span className="text-gold font-mono text-xs font-semibold">Exp. {c.expediente}</span>
          <span className="text-cream-muted ml-2 text-xs">{c.decisionDate}</span>
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.pillCls}`}>
          {cfg.label}
        </span>
      </div>
      <p className="text-cream text-xs font-medium">{c.defendant}</p>
      <p className="text-cream-muted mt-0.5 text-xs">
        {c.crime} <span className="text-cream-subtle font-mono">({c.crimeArticle})</span>
      </p>
      <p className="text-cream-muted mt-1 text-xs">
        <strong className="text-cream">Resolución:</strong> {c.decisionType} — {c.legalBasis}
      </p>
      {c.outcomeDetail && <p className={`mt-1 text-xs ${cfg.detailCls}`}>{c.outcomeDetail}</p>}
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
    cases = [],
    sourceLinks,
    publicBio,
    education,
    careerHistory,
    notableDecisions,
    extendedStats,
  } = judge;

  const locationPath = location.department.toLowerCase().includes(location.province.toLowerCase())
    ? location.department
    : `${location.province} › ${location.department}`;

  const salaryBand = getSalaryBand(salary?.grossMonthlyARS ?? 0);

  const tabs = [
    { id: "datos" as const, label: "Datos" },
    { id: "causas" as const, label: `Causas (${cases.length})` },
    { id: "fuentes" as const, label: "Fuentes" },
  ];

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

      {/* ── Toggle detalle ── */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="text-gold hover:bg-cream/5 flex w-full items-center justify-between px-5 py-3 text-xs font-medium transition-colors"
      >
        <span>{expanded ? "Ocultar detalle" : "Ver detalle completo"}</span>
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {/* ── Panel expandido ── */}
      {expanded && (
        <div className="border-border border-t">
          {/* Tabs */}
          <div className="border-border flex gap-0 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 border-b-2 bg-transparent py-2.5 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-gold border-gold"
                    : "text-cream-muted border-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Datos */}
          {activeTab === "datos" && (
            <div className="divide-border flex flex-col divide-y">
              {publicBio && (
                <section className="px-5 py-4">
                  <SectionTitle>Perfil público</SectionTitle>
                  <p className="text-cream text-xs leading-relaxed">{publicBio}</p>
                </section>
              )}

              <section className="px-5 py-4">
                <SectionTitle>Datos laborales</SectionTitle>
                <div className="flex flex-col gap-2">
                  <InfoRow label="Domicilio laboral" value={workAddress} />
                  <InfoRow label="Horario de atención" value={workHours} />
                  {salary && (
                    <InfoRow
                      label="Remuneración bruta"
                      value={`${formatARS(salary.grossMonthlyARS)} / mes — ${salary.category} (${salary.acordada}, desde ${salary.validFrom})`}
                    />
                  )}
                  <InfoRow label="Fecha de designación" value={appointmentDate} />
                  <InfoRow label="Organismo designante" value={appointmentBody} />
                  <InfoRow label="Antigüedad en el cargo" value={`${yearsOnBench} años`} />
                </div>
              </section>

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
                      <div key={label} className="bg-ink rounded-lg p-2.5">
                        <p className="text-cream text-xs font-bold">{value}</p>
                        <p className="text-cream-muted mt-0.5 text-xs">{label}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {education && education.length > 0 && (
                <section className="px-5 py-4">
                  <SectionTitle>Formación académica</SectionTitle>
                  <div className="flex flex-col gap-2">
                    {education.map((e, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-gold mt-0.5 text-xs">{e.year}</span>
                        <div>
                          <p className="text-cream text-xs font-medium">{e.degree}</p>
                          <p className="text-cream-muted text-xs">{e.institution}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {careerHistory && careerHistory.length > 0 && (
                <section className="px-5 py-4">
                  <SectionTitle>Trayectoria profesional</SectionTitle>
                  <div className="flex flex-col gap-2">
                    {careerHistory.map((c, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="bg-border text-cream-muted mt-0.5 shrink-0 rounded px-1.5 py-0.5 font-mono text-xs">
                          {c.period}
                        </span>
                        <div>
                          <p className="text-cream text-xs font-medium">{c.role}</p>
                          <p className="text-cream-muted text-xs">{c.institution}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {notableDecisions && notableDecisions.length > 0 && (
                <section className="px-5 py-4">
                  <SectionTitle>Decisiones destacadas</SectionTitle>
                  <div className="flex flex-col gap-3">
                    {notableDecisions.map((d, i) => (
                      <div key={i} className="bg-ink border-border rounded-lg border p-3">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-gold text-xs font-bold">{d.year}</span>
                          {d.article && (
                            <span className="text-cream-muted font-mono text-xs">{d.article}</span>
                          )}
                        </div>
                        <p className="text-cream text-xs leading-relaxed">{d.description}</p>
                        <p className="text-cream-muted mt-1 text-xs">Resultado: {d.outcome}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

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
                      className="text-gold flex items-center gap-1.5 text-xs font-medium hover:underline"
                    >
                      <ExternalLinkIcon className="h-3.5 w-3.5" aria-hidden />
                      {link.label}
                    </a>
                    <p className="text-cream-muted text-xs">{link.description}</p>
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
