"use client";

import { useState } from "react";
import { JurisdictionNode } from "../lib/api";

// ── Helpers de color ─────────────────────────────────────────────────────────

function rateColor(rate: number) {
  if (rate > 20) return "#f85149";
  if (rate > 10) return "#F4B942";
  return "#3fb950";
}
function rateBg(rate: number) {
  if (rate > 20) return "#f8514920";
  if (rate > 10) return "#F4B94220";
  return "#3fb95020";
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
        className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors"
        style={{
          marginLeft: `${indent * 20}px`,
          backgroundColor: isActiveFilter ? "#74ACDF10" : "transparent",
          border: isActiveFilter ? "1px solid #74ACDF30" : "1px solid transparent",
        }}
      >
        {/* Expand/collapse toggle */}
        <button
          onClick={() => hasChildren && setOpen((o) => !o)}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs"
          style={{
            color: hasChildren ? "#74ACDF" : "#30363d",
            cursor: hasChildren ? "pointer" : "default",
          }}
          aria-label={open ? "Colapsar" : "Expandir"}
        >
          {hasChildren ? (open ? "▼" : "▶") : "·"}
        </button>

        {/* Level badge */}
        <span
          className="shrink-0 rounded px-1.5 py-0.5 text-xs font-medium"
          style={{ backgroundColor: "#21262d", color: "#7d8590" }}
        >
          {LEVEL_LABELS[node.level]}
        </span>

        {/* Name */}
        <span className="flex-1 text-sm font-semibold truncate" style={{ color: "#e6edf3" }}>
          {node.name}
        </span>

        {/* Judge count */}
        <span className="shrink-0 text-xs" style={{ color: "#7d8590" }}>
          {node.totalJudges} {node.totalJudges === 1 ? "juez" : "jueces"}
        </span>

        {/* Failure rate */}
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold"
          style={{
            backgroundColor: rateBg(rate),
            color: rateColor(rate),
            border: `1px solid ${rateColor(rate)}40`,
          }}
        >
          {rate.toFixed(1)}%
        </span>

        {/* Filtrar button (only for provinces) */}
        {node.level === "province" && (
          <button
            onClick={() => onFilterClick(isActiveFilter ? null : node.name)}
            className="shrink-0 rounded px-2 py-0.5 text-xs font-medium transition-colors"
            style={{
              backgroundColor: isActiveFilter ? "#74ACDF" : "#21262d",
              color: isActiveFilter ? "#0d1117" : "#74ACDF",
              border: "1px solid " + (isActiveFilter ? "#74ACDF" : "#74ACDF40"),
            }}
          >
            {isActiveFilter ? "✕ Filtro activo" : "Filtrar"}
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
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-lg font-bold" style={{ color: "#e6edf3" }}>
          Estadísticas por Jurisdicción
        </h2>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-semibold"
          style={{ backgroundColor: "#21262d", color: "#7d8590" }}
        >
          Argentina → Provincia → Depto. Judicial
        </span>
      </div>

      {/* Summary row for the country */}
      <div
        className="mb-4 grid grid-cols-2 gap-3 rounded-xl border p-4 sm:grid-cols-4"
        style={{ backgroundColor: "#161b22", borderColor: "#21262d" }}
      >
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
            hierarchy.failureRate > 20 ? "red" : hierarchy.failureRate > 10 ? "gold" : "green"
          }
        />
      </div>

      {/* Tree */}
      <div
        className="rounded-xl border p-4"
        style={{ backgroundColor: "#161b22", borderColor: "#21262d" }}
      >
        <NodeRow
          node={hierarchy}
          onFilterClick={onProvinceFilter}
          activeProvince={activeProvince}
        />
      </div>

      <p
        className="mt-2 text-xs"
        style={{ color: "#74ACDF", visibility: activeProvince ? "visible" : "hidden" }}
      >
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
  accent?: "red" | "gold" | "green";
}) {
  const color =
    accent === "red"
      ? "#f85149"
      : accent === "gold"
        ? "#F4B942"
        : accent === "green"
          ? "#3fb950"
          : "#e6edf3";
  return (
    <div className="flex flex-col items-center">
      <span className="text-xl font-bold sm:text-2xl" style={{ color }}>
        {value}
      </span>
      <span className="text-center text-xs" style={{ color: "#7d8590" }}>
        {label}
      </span>
    </div>
  );
}
