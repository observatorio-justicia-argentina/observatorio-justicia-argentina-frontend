"use client";

import { useEffect, useRef, useState } from "react";
import { Judge } from "../lib/api";

const HC_MIN_X = -999;
const HC_MAX_Y = 9851;
const HC_WIDTH = 5252;
const HC_HEIGHT = 10850;

interface Vb {
  x: number;
  y: number;
  w: number;
  h: number;
}

const FULL_VB: Vb = { x: HC_MIN_X, y: 0, w: HC_WIDTH, h: HC_HEIGHT };

// CABA inset: viewBox zoomed en CABA/AMBA, posición en el "océano"
const INSET_VIEW = { x: 2340, y: 4010, w: 580, h: 700 };
const INSET_POS = { x: 2860, y: 4600, w: 1700, h: 2060 };

const DEPTO_COLORS: Record<string, string> = {
  "La Plata": "#4f46e5",
  "Avellaneda-Lanús": "#f97316",
  "Lomas de Zamora": "#22c55e",
  Quilmes: "#0ea5e9",
  "La Matanza": "#ef4444",
  Morón: "#a855f7",
  "Moreno-Gral. Rodríguez": "#ec4899",
  "San Martín": "#eab308",
  "San Isidro": "#14b8a6",
  Mercedes: "#84cc16",
  "Zárate-Campana": "#3b82f6",
  "San Nicolás": "#06b6d4",
  Pergamino: "#10b981",
  Junín: "#f59e0b",
  "Trenque Lauquen": "#8b5cf6",
  Dolores: "#fb923c",
  Azul: "#6366f1",
  Necochea: "#4ade80",
  "Mar del Plata": "#38bdf8",
  "Bahía Blanca": "#c084fc",
};

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

type HCGeometry =
  | { type: "MultiPolygon"; coordinates: GeoMultiPolygon }
  | { type: "Polygon"; coordinates: GeoPolygon };

interface GeoFeature {
  type: "Feature";
  properties: { nombre: string; key: string };
  geometry: HCGeometry;
}

interface BaPartidoFeature {
  properties: { name: string; depto: string | null; osm_id: number };
  geometry: HCGeometry;
}

function ringToPath(ring: GeoRing): string {
  const pts = ring.map(([x, y]) => `${x},${HC_MAX_Y - y}`);
  return `M ${pts[0]} L ${pts.slice(1).join(" L ")} Z`;
}

function geometryToPath(geometry: HCGeometry): string {
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.map((p) => p.map(ringToPath).join(" ")).join(" ");
  }
  return geometry.coordinates.map(ringToPath).join(" ");
}

function featureToPath(feature: GeoFeature): string {
  return geometryToPath(feature.geometry);
}

function getFeatureBounds(feature: GeoFeature) {
  let x1 = Infinity,
    y1 = Infinity,
    x2 = -Infinity,
    y2 = -Infinity;
  const absorb = (ring: GeoRing) => {
    ring.forEach(([x, y]) => {
      const sy = HC_MAX_Y - y;
      if (x < x1) x1 = x;
      if (x > x2) x2 = x;
      if (sy < y1) y1 = sy;
      if (sy > y2) y2 = sy;
    });
  };
  if (feature.geometry.type === "MultiPolygon") {
    feature.geometry.coordinates.forEach((p) => p.forEach(absorb));
  } else {
    feature.geometry.coordinates.forEach(absorb);
  }
  return { x1, y1, x2, y2 };
}

function vbForFeature(feature: GeoFeature, paddingRatio = 0.15): Vb {
  const { x1, y1, x2, y2 } = getFeatureBounds(feature);
  const pw = x2 - x1,
    ph = y2 - y1;
  const pad = Math.max(pw, ph) * paddingRatio;
  return { x: x1 - pad, y: y1 - pad, w: pw + pad * 2, h: ph + pad * 2 };
}

function isVbFull(vb: Vb) {
  return vb.x === FULL_VB.x && vb.y === FULL_VB.y && vb.w === FULL_VB.w && vb.h === FULL_VB.h;
}

interface Props {
  judges: Judge[];
  activeProvince: string | null;
  onProvinceSelect: (province: string | null) => void;
}

export default function MapArgentina({ judges, activeProvince, onProvinceSelect }: Props) {
  const [features, setFeatures] = useState<GeoFeature[]>([]);
  const [baPartidos, setBaPartidos] = useState<BaPartidoFeature[]>([]);
  const [tooltip, setTooltip] = useState<{
    title: string;
    subtitle: string;
    x: number;
    y: number;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [vb, setVb] = useState<Vb>(FULL_VB);

  const svgRef = useRef<SVGSVGElement>(null);
  const vbRef = useRef<Vb>(FULL_VB);
  // sx/sy = screen origin, vbx/vby/vbw/vbh = viewBox at drag start, moved = distinguishes drag from click
  const dragRef = useRef<{
    sx: number;
    sy: number;
    vbx: number;
    vby: number;
    vbw: number;
    vbh: number;
    moved: boolean;
  } | null>(null);
  // Evita que el mouseup del drag dispare el toggle del dropdown
  const justDraggedRef = useRef(false);

  useEffect(() => {
    vbRef.current = vb;
  }, [vb]);

  useEffect(() => {
    fetch("/argentina-provinces.json")
      .then((r) => r.json())
      .then((d) => setFeatures(d.features as GeoFeature[]))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (activeProvince === "Buenos Aires" && baPartidos.length === 0) {
      fetch("/buenos-aires-partidos.json")
        .then((r) => r.json())
        .then((d) => setBaPartidos(d.features as BaPartidoFeature[]))
        .catch(() => {});
    }
  }, [activeProvince]);

  // Drag global: mousemove y mouseup en window para que funcionen fuera del SVG
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = e.clientX - d.sx;
      const dy = e.clientY - d.sy;
      if (!d.moved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) d.moved = true;
      if (!d.moved) return;
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      setVb((v) => ({
        ...v,
        x: d.vbx - (dx / rect.width) * d.vbw,
        y: d.vby - (dy / rect.height) * d.vbh,
      }));
    };
    const onUp = () => {
      if (dragRef.current?.moved) {
        justDraggedRef.current = true;
        // Limpia la bandera tras el ciclo de eventos para que el click del botón no se suprima en la próxima apertura
        setTimeout(() => {
          justDraggedRef.current = false;
        }, 100);
      }
      dragRef.current = null;
      setIsDragging(false);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // Wheel zoom — non-passive para poder llamar preventDefault
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const v = vbRef.current;
      const mx = v.x + ((e.clientX - rect.left) / rect.width) * v.w;
      const my = v.y + ((e.clientY - rect.top) / rect.height) * v.h;
      const factor = e.deltaY > 0 ? 1.25 : 0.8;
      setVb({
        x: mx - (mx - v.x) * factor,
        y: my - (my - v.y) * factor,
        w: v.w * factor,
        h: v.h * factor,
      });
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  const judgesByProvince = judges.reduce<Record<string, number>>((acc, j) => {
    acc[j.location.province] = (acc[j.location.province] ?? 0) + 1;
    return acc;
  }, {});

  function getFill(province: string): string {
    if (activeProvince === province) return "#c18a38";
    const count = judgesByProvince[province] ?? 0;
    if (count === 0) return "#1a2340";
    if (count <= 2) return "#242b48";
    if (count <= 5) return "#5b6fa5";
    return "#7c94d0";
  }

  function handleProvinceClick(province: string, feature: GeoFeature) {
    if (justDraggedRef.current || dragRef.current?.moved) return;
    const isActive = activeProvince === province;
    onProvinceSelect(isActive ? null : province);
    if (isActive) {
      setVb(FULL_VB);
    } else {
      // CABA es muy pequeña: usar padding extra y centrar bien
      const padding = province === "CABA" ? 0.6 : 0.15;
      setVb(vbForFeature(feature, padding));
    }
  }

  function handleMouseDown(e: React.MouseEvent<SVGSVGElement>) {
    const v = vbRef.current;
    dragRef.current = {
      sx: e.clientX,
      sy: e.clientY,
      vbx: v.x,
      vby: v.y,
      vbw: v.w,
      vbh: v.h,
      moved: false,
    };
    setIsDragging(true);
  }

  function zoomStep(factor: number) {
    setVb((v) => {
      const cx = v.x + v.w / 2;
      const cy = v.y + v.h / 2;
      const nw = v.w * factor;
      const nh = v.h * factor;
      return { x: cx - nw / 2, y: cy - nh / 2, w: nw, h: nh };
    });
  }

  function resetView() {
    onProvinceSelect(null);
    setVb(FULL_VB);
  }

  const fullView = isVbFull(vb);

  function renderPaths(prefix: string, strokeWidth: number) {
    return features.map((feature) => {
      const hcName = feature.properties.nombre;
      const province = HC_TO_PROVINCE[hcName] ?? hcName;
      const isActive = activeProvince === province;
      const fill = getFill(province);
      const d = featureToPath(feature);
      return (
        <path
          key={`${prefix}-${feature.properties.key}`}
          d={d}
          fill={fill}
          stroke="#363e5e"
          strokeWidth={strokeWidth}
          style={{ cursor: "pointer", transition: "fill 0.15s ease" }}
          onClick={() => handleProvinceClick(province, feature)}
          onMouseEnter={(e) => {
            const count = judgesByProvince[province] ?? 0;
            setTooltip({
              title: province,
              subtitle:
                count === 0
                  ? "Sin jueces relevados"
                  : `${count} juez${count !== 1 ? "es" : ""} relevado${count !== 1 ? "s" : ""}`,
              x: e.clientX,
              y: e.clientY,
            });
          }}
          onMouseLeave={() => setTooltip(null)}
        >
          <title>{province}</title>
        </path>
      );
    });
  }

  return (
    <section
      className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: "#181f38", borderColor: "#242b48" }}
    >
      {/* Toggle header */}
      <button
        onClick={() => {
          if (justDraggedRef.current) return;
          setIsOpen((o) => !o);
        }}
        className="hover:bg-cream/5 flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors"
        style={{ borderBottom: isOpen ? "1px solid #242b48" : "none" }}
      >
        {/* Ícono mapa */}
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: "#c18a3815", border: "1px solid #c18a3830" }}
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4"
            style={{ color: "#c18a38" }}
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 6.75V15m0-8.25c0 0-2.25-.75-4.5 0v8.25m4.5-8.25c0 0 2.25-.75 4.5 0v8.25M9 15c0 0-2.25.75-4.5 0M9 15c0 0 2.25.75 4.5 0M3 6.75A2.25 2.25 0 015.25 4.5h9.5A2.25 2.25 0 0117 6.75v6.5A2.25 2.25 0 0114.75 15.5h-9.5A2.25 2.25 0 013 13.25v-6.5z"
            />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color: "#f4f2e6" }}>
              Mapa jurisdiccional interactivo
            </span>
            {!isOpen && (
              <span
                className="rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: "#c18a3815",
                  color: "#c18a38",
                  border: "1px solid #c18a3830",
                }}
              >
                {activeProvince ?? "Argentina"}
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: "#a8a496" }}>
            {isOpen
              ? "Hacé click en una provincia · scroll para zoom · arrastrá para mover"
              : "Explorá el mapa de provincias — hacé click para desplegar"}
          </p>
        </div>

        {/* Chevron */}
        <div
          className="flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1"
          style={{ borderColor: "#363e5e", color: "#a8a496" }}
        >
          <span className="text-xs">{isOpen ? "Cerrar" : "Abrir"}</span>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3.5 w-3.5 transition-transform duration-200"
            style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="p-4">
          {/* Toolbar */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {/* Zoom controls */}
              {(["−", "+"] as const).map((label, i) => (
                <button
                  key={label}
                  onClick={() => zoomStep(i === 0 ? 1.5 : 0.667)}
                  className="flex h-7 w-7 items-center justify-center rounded border text-sm font-bold hover:bg-cream/5"
                  style={{ borderColor: "#363e5e", color: "#f4f2e6" }}
                  title={i === 0 ? "Alejar" : "Acercar"}
                >
                  {label}
                </button>
              ))}
              {!fullView && (
                <button
                  onClick={resetView}
                  className="rounded border px-2.5 py-1 text-xs font-medium hover:bg-cream/5"
                  style={{ borderColor: "#363e5e", color: "#a8a496" }}
                  title="Ver país completo"
                >
                  ⊙ Todo el país
                </button>
              )}
              {activeProvince && (
                <button
                  onClick={() => {
                    onProvinceSelect(null);
                    setVb(FULL_VB);
                  }}
                  className="rounded border px-2.5 py-1 text-xs font-medium hover:bg-cream/5"
                  style={{ borderColor: "#f85149", color: "#f85149" }}
                >
                  ✕ {activeProvince}
                </button>
              )}
            </div>

            {/* Leyenda */}
            <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: "#a8a496" }}>
              {[
                { bg: "#1c2128", label: "Sin datos", border: "1px solid #363e5e" },
                { bg: "#1f3a5f", label: "1–2 jueces" },
                { bg: "#c18a38", label: "Seleccionada" },
              ].map(({ bg, label, border }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="h-3 w-4 rounded" style={{ backgroundColor: bg, border }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Hint */}
          <p className="mb-2 text-xs" style={{ color: "#a8a496" }}>
            Click para seleccionar · Scroll para zoom · Arrastrá para mover
          </p>

          {/* SVG container */}
          <div
            className="overflow-hidden rounded-lg"
            style={{ backgroundColor: "#0f1529", cursor: isDragging ? "grabbing" : "grab" }}
            onMouseLeave={() => setTooltip(null)}
          >
            {features.length === 0 ? (
              <div
                className="flex h-64 items-center justify-center text-xs"
                style={{ color: "#a8a496" }}
              >
                Cargando mapa...
              </div>
            ) : (
              <svg
                ref={svgRef}
                viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
                style={{ width: "100%", height: "auto", display: "block", maxHeight: "70vh" }}
                xmlns="http://www.w3.org/2000/svg"
                onMouseDown={handleMouseDown}
              >
                {/* Mapa principal */}
                {renderPaths("main", 8)}

                {/* Capa de departamentos judiciales de Buenos Aires */}
                {activeProvince === "Buenos Aires" &&
                  baPartidos.map((partido) => {
                    const depto = partido.properties.depto;
                    const color = depto ? (DEPTO_COLORS[depto] ?? "#a8a496") : "#a8a496";
                    return (
                      <path
                        key={`ba-${partido.properties.osm_id}`}
                        d={geometryToPath(partido.geometry)}
                        fill={`${color}33`}
                        stroke={color}
                        strokeWidth={4}
                        style={{ cursor: "default" }}
                        onMouseEnter={(e) =>
                          setTooltip({
                            title: partido.properties.name,
                            subtitle: `Depto. ${depto ?? "sin datos"}`,
                            x: e.clientX,
                            y: e.clientY,
                          })
                        }
                        onMouseLeave={() => setTooltip(null)}
                        onMouseMove={(e) =>
                          setTooltip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : null))
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    );
                  })}

                {/* Inset CABA/AMBA — solo en vista completa */}
                {fullView && (
                  <g>
                    {/* Indicador sobre CABA */}
                    <rect
                      x={2608}
                      y={4210}
                      width={96}
                      height={105}
                      fill="none"
                      stroke="#c18a38"
                      strokeWidth={6}
                      strokeDasharray="18 8"
                      style={{ pointerEvents: "none" }}
                    />

                    {/* Líneas conectoras */}
                    <line
                      x1={2704}
                      y1={4237}
                      x2={INSET_POS.x}
                      y2={INSET_POS.y + 80}
                      stroke="#c18a3830"
                      strokeWidth={5}
                      strokeDasharray="16 10"
                      style={{ pointerEvents: "none" }}
                    />
                    <line
                      x1={2704}
                      y1={4290}
                      x2={INSET_POS.x}
                      y2={INSET_POS.y + INSET_POS.h - 80}
                      stroke="#c18a3830"
                      strokeWidth={5}
                      strokeDasharray="16 10"
                      style={{ pointerEvents: "none" }}
                    />

                    {/* Fondo inset */}
                    <rect
                      x={INSET_POS.x}
                      y={INSET_POS.y}
                      width={INSET_POS.w}
                      height={INSET_POS.h}
                      rx={24}
                      fill="#0f1529"
                      stroke="#c18a3860"
                      strokeWidth={7}
                    />

                    {/* Título inset */}
                    <text
                      x={INSET_POS.x + 28}
                      y={INSET_POS.y + 68}
                      fill="#a8a496"
                      fontSize={58}
                      fontFamily="system-ui, sans-serif"
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      CABA · Gran Buenos Aires
                    </text>

                    {/* SVG anidado con zoom */}
                    <svg
                      x={INSET_POS.x}
                      y={INSET_POS.y + 80}
                      width={INSET_POS.w}
                      height={INSET_POS.h - 80}
                      viewBox={`${INSET_VIEW.x} ${INSET_VIEW.y} ${INSET_VIEW.w} ${INSET_VIEW.h}`}
                      overflow="hidden"
                    >
                      {renderPaths("inset", 2.5)}

                      {/* Label CABA en el inset */}
                      <text
                        x={2656}
                        y={4261}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#f4f2e6"
                        fontSize={14}
                        fontWeight="bold"
                        fontFamily="system-ui, sans-serif"
                        style={{ pointerEvents: "none", userSelect: "none" }}
                      >
                        CABA
                      </text>
                    </svg>

                    {/* Marco del inset (encima del SVG anidado) */}
                    <rect
                      x={INSET_POS.x}
                      y={INSET_POS.y}
                      width={INSET_POS.w}
                      height={INSET_POS.h}
                      rx={24}
                      fill="none"
                      stroke="#c18a3860"
                      strokeWidth={7}
                      style={{ pointerEvents: "none" }}
                    />
                  </g>
                )}
              </svg>
            )}
          </div>

          {/* Departamentos al seleccionar */}
          {activeProvince &&
            (() => {
              const isBsAs = activeProvince === "Buenos Aires";
              const depts = isBsAs
                ? Object.keys(DEPTO_COLORS)
                : [
                    ...new Set(
                      judges
                        .filter((j) => j.location.province === activeProvince)
                        .map((j) => j.location.department),
                    ),
                  ];
              if (depts.length === 0) return null;
              return (
                <div className="mt-3 border-t pt-3" style={{ borderColor: "#242b48" }}>
                  <p className="mb-2 text-xs font-medium" style={{ color: "#a8a496" }}>
                    {isBsAs
                      ? "Departamentos judiciales — Buenos Aires"
                      : `Departamentos judiciales en ${activeProvince}`}
                    :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {depts.map((dept) => {
                      const color = isBsAs ? DEPTO_COLORS[dept] : "#c18a38";
                      return (
                        <span
                          key={dept}
                          className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: isBsAs ? `${color}20` : "#c18a3815",
                            color: isBsAs ? color : "#c18a38",
                            border: `1px solid ${isBsAs ? `${color}60` : "#c18a3830"}`,
                          }}
                        >
                          {isBsAs && (
                            <span
                              className="inline-block h-2 w-2 rounded-full shrink-0"
                              style={{ backgroundColor: color }}
                            />
                          )}
                          {dept}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border px-3 py-2 text-xs shadow-xl"
          style={{
            top: tooltip.y + 14,
            left: tooltip.x + 14,
            backgroundColor: "#181f38",
            borderColor: "#363e5e",
            color: "#f4f2e6",
          }}
        >
          <p className="font-semibold">{tooltip.title}</p>
          <p style={{ color: "#a8a496" }}>{tooltip.subtitle}</p>
        </div>
      )}
    </section>
  );
}
