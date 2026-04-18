"use client";

import { useState } from "react";
import { JurisdictionNode } from "../lib/api";
import { ChevronDownIcon, ChevronRightIcon, XIcon } from "./icons";

// ── Helpers de color ─────────────────────────────────────────────────────────

function rateClasses(rate: number): string {
  if (rate > 20) return "bg-danger-soft text-danger border-danger/40";
  if (rate > 10) return "bg-warning-soft text-warning border-warning/40";
  return "bg-success-soft text-success border-success/40";
}

const LEVEL_LABELS: Record<JurisdictionNode["level"], string> = {
  country: "País",
  province: "Provincia",
  department: "Depto. Judicial",
};

const LEVEL_INDENT: Record<JurisdictionNode["level"], number> = {
  country: 0,
  province: 1,
  department: 2,
};

// ── Componente de un nodo ────────────────────────────────────────────────────

interface NodeRowProps {
  node: JurisdictionNode;
  onFilterClick: (province: string | null) => void;
  activeProvince: string | null;
}

function NodeRow({ node, onFilterClick, activeProvince }: NodeRowProps) {
  const [open, setOpen] = useState(node.level === "country" || node.level === "province");
  const hasChildren = node.children && node.children.length > 0;
  const indent = LEVEL_INDENT[node.level];
  const rate = node.failureRate;

  const isActiveFilter = node.level === "province" && activeProvince === node.name;

  return (
    <div>
      <div
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${
          isActiveFilter ? "bg-gold-soft border-gold/30" : "border-transparent"
        }`}
        style={{ marginLeft: `${indent * 20}px` }}
      >
        {/* Expand/collapse toggle */}
        <button
          onClick={() => hasChildren && setOpen((o) => !o)}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${
            hasChildren ? "text-gold cursor-pointer" : "text-border-strong cursor-default"
          }`}
          aria-label={open ? "Colapsar" : "Expandir"}
        >
          {hasChildren ? (
            open ? (
              <ChevronDownIcon className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <ChevronRightIcon className="h-3.5 w-3.5" aria-hidden />
            )
          ) : (
            <span className="text-xs">·</span>
          )}
        </button>

        {/* Level badge */}
        <span className="bg-border text-cream-muted shrink-0 rounded px-1.5 py-0.5 text-xs font-medium">
          {LEVEL_LABELS[node.level]}
        </span>

        {/* Name */}
        <span className="text-cream flex-1 truncate text-sm font-semibold">{node.name}</span>

        {/* Judge count */}
        <span className="text-cream-muted shrink-0 text-xs">
          {node.totalJudges} {node.totalJudges === 1 ? "juez" : "jueces"}
        </span>

        {/* Failure rate */}
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-bold ${rateClasses(rate)}`}
        >
          {rate.toFixed(1)}%
        </span>

        {/* Filtrar button (only for provinces) */}
        {node.level === "province" && (
          <button
            onClick={() => onFilterClick(isActiveFilter ? null : node.name)}
            className={`flex shrink-0 items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium transition-colors ${
              isActiveFilter
                ? "bg-gold text-cream border-gold"
                : "bg-border text-gold border-gold/40 hover:bg-gold-soft"
            }`}
          >
            {isActiveFilter && <XIcon className="h-3 w-3" aria-hidden />}
            {isActiveFilter ? "Filtro activo" : "Filtrar"}
          </button>
        )}
      </div>

      {/* Children */}
      {hasChildren && open && (
        <div>
          {node.children!.map((child) => (
            <NodeRow
              key={child.path}
              node={child}
              onFilterClick={onFilterClick}
              activeProvince={activeProvince}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────

interface JurisdictionStatsProps {
  hierarchy: JurisdictionNode;
  onProvinceFilter: (province: string | null) => void;
  activeProvince: string | null;
}

export default function JurisdictionStats({
  hierarchy,
  onProvinceFilter,
  activeProvince,
}: JurisdictionStatsProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-4 pt-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 className="text-cream font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          Estadísticas por Jurisdicción
        </h2>
        <span className="bg-border text-cream-muted rounded-full px-2 py-0.5 text-xs font-semibold">
          Argentina → Provincia → Depto. Judicial
        </span>
      </div>

      {/* Summary row for the country */}
      <div className="bg-ink-elevated border-border mb-4 grid grid-cols-2 gap-3 rounded-xl border p-4 shadow-md shadow-black/30 sm:grid-cols-4">
        <SummaryCell label="Total de jueces" value={String(hierarchy.totalJudges)} />
        <SummaryCell
          label="Libertades otorgadas"
          value={hierarchy.totalReleases.toLocaleString("es-AR")}
        />
        <SummaryCell
          label="Fallas procesales"
          value={hierarchy.totalFailures.toLocaleString("es-AR")}
        />
        <SummaryCell
          label="Tasa de falla país"
          value={`${hierarchy.failureRate.toFixed(1)}%`}
          accent={
            hierarchy.failureRate > 20
              ? "danger"
              : hierarchy.failureRate > 10
                ? "warning"
                : "success"
          }
        />
      </div>

      {/* Tree */}
      <div className="bg-ink-elevated border-border rounded-xl border p-4 shadow-md shadow-black/30">
        <NodeRow
          node={hierarchy}
          onFilterClick={onProvinceFilter}
          activeProvince={activeProvince}
        />
      </div>

      <p className={`text-gold mt-2 text-xs ${activeProvince ? "visible" : "invisible"}`}>
        Mostrando jueces de <strong>{activeProvince ?? "—"}</strong>. Hacé clic en &ldquo;✕ Filtro
        activo&rdquo; para ver todos.
      </p>
    </section>
  );
}

function SummaryCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "danger" | "warning" | "success";
}) {
  const valueClass =
    accent === "danger"
      ? "text-danger"
      : accent === "warning"
        ? "text-warning"
        : accent === "success"
          ? "text-success"
          : "text-cream";
  return (
    <div className="flex flex-col items-center">
      <span className={`text-xl font-bold sm:text-2xl ${valueClass}`}>{value}</span>
      <span className="text-cream-muted text-center text-xs">{label}</span>
    </div>
  );
}
