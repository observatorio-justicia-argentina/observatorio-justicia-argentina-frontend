import React from "react";
import { Judge } from "../lib/api";

type JudgeCardProps = Pick<
  Judge,
  "name" | "court" | "location" | "totalReleases" | "ftaCount" | "newArrestCount" | "revokedCount"
>;

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

export default function JudgeCard({
  name,
  court,
  location,
  totalReleases,
  ftaCount,
  newArrestCount,
  revokedCount,
}: JudgeCardProps) {
  const failureRate =
    totalReleases > 0
      ? (((ftaCount + newArrestCount + revokedCount) / totalReleases) * 100).toFixed(1)
      : "0.0";

  const rate = parseFloat(failureRate);
  const rateColor = rate > 20 ? "#f85149" : rate > 10 ? "#F4B942" : "#3fb950";
  const rateBg = rate > 20 ? "#f8514920" : rate > 10 ? "#F4B94220" : "#3fb95020";

  // Si el departamento ya contiene el nombre de la provincia (ej. CABA), no repetir
  const locationPath = location.department.toLowerCase().includes(location.province.toLowerCase())
    ? location.department
    : `${location.province} › ${location.department}`;

  return (
    <article
      className="rounded-xl overflow-hidden border transition-all hover:border-[#74ACDF]/40 hover:shadow-lg hover:shadow-black/30"
      style={{ backgroundColor: "#161b22", borderColor: "#21262d" }}
    >
      {/* Card header */}
      <div
        className="flex items-start justify-between gap-3 px-5 py-4"
        style={{ borderBottom: "1px solid #21262d" }}
      >
        <div className="min-w-0">
          <h3 className="truncate text-base font-bold" style={{ color: "#e6edf3" }}>
            {name}
          </h3>
          <p className="mt-0.5 text-xs" style={{ color: "#74ACDF" }}>
            {court}
          </p>
        </div>
        <span
          className="mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{ backgroundColor: "#74ACDF15", color: "#74ACDF", border: "1px solid #74ACDF30" }}
        >
          {location.province}
        </span>
      </div>

      {/* Jurisdiction breadcrumb */}
      <div
        className="px-5 py-2 text-xs"
        style={{ color: "#7d8590", borderBottom: "1px solid #21262d" }}
      >
        {locationPath}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
        <StatBadge value={totalReleases} label="Libertades" color="#e6edf3" />
        <StatBadge value={ftaCount} label="No comparec." color="#d29922" />
        <StatBadge value={newArrestCount} label="Nuevo arresto" color="#f85149" />
        <StatBadge value={revokedCount} label="Revocada" color="#a371f7" />
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderTop: "1px solid #21262d" }}
      >
        <span className="text-xs" style={{ color: "#7d8590" }}>
          Tasa de falla procesal
        </span>
        <span
          className="rounded-full px-2.5 py-0.5 text-sm font-bold"
          style={{
            backgroundColor: rateBg,
            color: rateColor,
            border: "1px solid " + rateColor + "40",
          }}
        >
          {failureRate}%
        </span>
      </div>
    </article>
  );
}
