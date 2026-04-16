"use client";

import { useEffect, useState } from "react";
import { Judge } from "../lib/api";

// Constantes del sistema de coordenadas Highcharts (ar-all.geo.json)
const HC_MIN_X = -999;
const HC_MAX_Y = 9851; // norte = Y alta → en SVG va al top (Y=0)
const HC_WIDTH = 5252;
const HC_HEIGHT = 10850;

// Nombre Highcharts → nombre en los datos del juez
const HC_TO_PROVINCE: Record<string, string> = {
  "Ciudad de Buenos Aires": "CABA",
  "Buenos Aires": "Buenos Aires",
  Catamarca: "Catamarca",
  Chaco: "Chaco",
  Chubut: "Chubut",
  Córdoba: "Córdoba",
  Corrientes: "Corrientes",
  "Entre Ríos": "Entre Ríos",
  Formosa: "Formosa",
  Jujuy: "Jujuy",
  "La Pampa": "La Pampa",
  "La Rioja": "La Rioja",
  Mendoza: "Mendoza",
  Misiones: "Misiones",
  Neuquén: "Neuquén",
  "Río Negro": "Río Negro",
  Salta: "Salta",
  "San Juan": "San Juan",
  "San Luis": "San Luis",
  "Santa Cruz": "Santa Cruz",
  "Santa Fe": "Santa Fe",
  "Santiago del Estero": "Santiago del Estero",
  "Tierra del Fuego": "Tierra del Fuego",
  Tucumán: "Tucumán",
};

type GeoRing = number[][];
type GeoPolygon = GeoRing[];
type GeoMultiPolygon = GeoPolygon[];

interface GeoFeature {
  type: "Feature";
  properties: { nombre: string; key: string };
  geometry:
    | { type: "MultiPolygon"; coordinates: GeoMultiPolygon }
    | { type: "Polygon"; coordinates: GeoPolygon };
}

function ringToPath(ring: GeoRing): string {
  const pts = ring.map(([x, y]) => `${x},${HC_MAX_Y - y}`);
  return `M ${pts[0]} L ${pts.slice(1).join(" L ")} Z`;
}

/** Convierte un feature a un string de path SVG con Y invertido */
function featureToPath(feature: GeoFeature): string {
  const { geometry } = feature;
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.map((polygon) => polygon.map(ringToPath).join(" ")).join(" ");
  }
  // Polygon
  return geometry.coordinates.map(ringToPath).join(" ");
}

interface Props {
  judges: Judge[];
  activeProvince: string | null;
  onProvinceSelect: (province: string | null) => void;
}

export default function MapArgentina({ judges, activeProvince, onProvinceSelect }: Props) {
  const [features, setFeatures] = useState<GeoFeature[]>([]);
  const [tooltip, setTooltip] = useState<{
    name: string;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    fetch("/argentina-provinces.json")
      .then((r) => r.json())
      .then((d) => setFeatures(d.features as GeoFeature[]))
      .catch(() => {});
  }, []);

  const judgesByProvince = judges.reduce<Record<string, number>>((acc, j) => {
    acc[j.location.province] = (acc[j.location.province] ?? 0) + 1;
    return acc;
  }, {});

  function getFill(province: string): string {
    if (activeProvince === province) return "#74ACDF";
    const count = judgesByProvince[province] ?? 0;
    if (count === 0) return "#1c2128";
    if (count <= 2) return "#1f3a5f";
    if (count <= 5) return "#1e4976";
    return "#1a5e94";
  }

  return (
    <section
      className="rounded-xl border p-4"
      style={{ backgroundColor: "#161b22", borderColor: "#21262d" }}
    >
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold" style={{ color: "#e6edf3" }}>
            Mapa jurisdiccional
          </h3>
          <p className="text-xs" style={{ color: "#7d8590" }}>
            Hacé click en una provincia para filtrar los jueces de esa jurisdicción
          </p>
        </div>
        {activeProvince && (
          <button
            onClick={() => onProvinceSelect(null)}
            className="rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-white/5"
            style={{ borderColor: "#f85149", color: "#f85149" }}
          >
            ✕ Limpiar: {activeProvince}
          </button>
        )}
      </div>

      {/* Leyenda */}
      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs" style={{ color: "#7d8590" }}>
        {[
          { bg: "#1c2128", label: "Sin datos", border: "1px solid #30363d" },
          { bg: "#1f3a5f", label: "1–2 jueces" },
          { bg: "#74ACDF", label: "Seleccionada" },
        ].map(({ bg, label, border }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="h-3 w-4 rounded" style={{ backgroundColor: bg, border }} />
            {label}
          </div>
        ))}
      </div>

      {/* SVG Map */}
      <div
        className="overflow-hidden rounded-lg"
        style={{ backgroundColor: "#0d1117" }}
        onMouseLeave={() => setTooltip(null)}
      >
        {features.length === 0 ? (
          <div
            className="flex h-64 items-center justify-center text-xs"
            style={{ color: "#7d8590" }}
          >
            Cargando mapa...
          </div>
        ) : (
          <svg
            viewBox={`${HC_MIN_X} 0 ${HC_WIDTH} ${HC_HEIGHT}`}
            style={{ width: "100%", height: "auto", display: "block" }}
            xmlns="http://www.w3.org/2000/svg"
          >
            {features.map((feature) => {
              const hcName = feature.properties.nombre;
              const province = HC_TO_PROVINCE[hcName] ?? hcName;
              const isActive = activeProvince === province;
              const fill = getFill(province);
              const d = featureToPath(feature);

              return (
                <path
                  key={feature.properties.key}
                  d={d}
                  fill={fill}
                  stroke="#30363d"
                  strokeWidth={8}
                  style={{ cursor: "pointer", transition: "fill 0.15s ease" }}
                  onClick={() => onProvinceSelect(isActive ? null : province)}
                  onMouseEnter={(e) =>
                    setTooltip({
                      name: province,
                      count: judgesByProvince[province] ?? 0,
                      x: e.clientX,
                      y: e.clientY,
                    })
                  }
                  onMouseMove={(e) => setTooltip((t) => t && { ...t, x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <title>{province}</title>
                </path>
              );
            })}
          </svg>
        )}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border px-3 py-2 text-xs shadow-xl"
          style={{
            top: tooltip.y + 14,
            left: tooltip.x + 14,
            backgroundColor: "#161b22",
            borderColor: "#30363d",
            color: "#e6edf3",
          }}
        >
          <p className="font-semibold">{tooltip.name}</p>
          <p style={{ color: "#7d8590" }}>
            {tooltip.count === 0
              ? "Sin jueces relevados"
              : `${tooltip.count} juez${tooltip.count !== 1 ? "es" : ""} relevado${tooltip.count !== 1 ? "s" : ""}`}
          </p>
        </div>
      )}

      {/* Departamentos al seleccionar */}
      {activeProvince &&
        (() => {
          const depts = [
            ...new Set(
              judges
                .filter((j) => j.location.province === activeProvince)
                .map((j) => j.location.department),
            ),
          ];
          if (depts.length === 0) return null;
          return (
            <div className="mt-3 border-t pt-3" style={{ borderColor: "#21262d" }}>
              <p className="mb-2 text-xs font-medium" style={{ color: "#7d8590" }}>
                Departamentos judiciales en {activeProvince}:
              </p>
              <div className="flex flex-wrap gap-2">
                {depts.map((dept) => (
                  <span
                    key={dept}
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: "#74ACDF15",
                      color: "#74ACDF",
                      border: "1px solid #74ACDF30",
                    }}
                  >
                    {dept}
                  </span>
                ))}
              </div>
            </div>
          );
        })()}
    </section>
  );
}
