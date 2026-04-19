"use client";

import { useEffect, useRef, useState } from "react";
import { Judge } from "../lib/api";
import { ArgentinaIcon } from "./icons";

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

function getPartidosBounds(partidos: BaPartidoFeature[], paddingRatio = 0.1): Vb {
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
  for (const p of partidos) {
    if (p.geometry.type === "MultiPolygon") {
      p.geometry.coordinates.forEach((poly) => poly.forEach(absorb));
    } else {
      p.geometry.coordinates.forEach(absorb);
    }
  }
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
  const [activeDepto, setActiveDepto] = useState<string | null>(null);
  const [activePartido, setActivePartido] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    title: string;
    subtitle: string;
    x: number;
    y: number;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [vb, setVb] = useState<Vb>(FULL_VB);

  // Viewbox stored for going back to province level from depto
  const provinceVbRef = useRef<Vb>(FULL_VB);

  const svgRef = useRef<SVGSVGElement>(null);
  const vbRef = useRef<Vb>(FULL_VB);
  const dragRef = useRef<{
    sx: number;
    sy: number;
    vbx: number;
    vby: number;
    vbw: number;
    vbh: number;
    moved: boolean;
  } | null>(null);
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
  }, [activeProvince, baPartidos.length]);

  // Drag global
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

  // Wheel zoom
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

  // Group partidos by judicial department
  const deptosMap = baPartidos.reduce<Record<string, BaPartidoFeature[]>>((acc, p) => {
    const depto = p.properties.depto ?? "Sin departamento";
    if (!acc[depto]) acc[depto] = [];
    acc[depto].push(p);
    return acc;
  }, {});

  function getFill(province: string): string {
    // When selected, use a muted dark color so department overlays are readable
    if (activeProvince === province) return "#1a2235";
    const count = judgesByProvince[province] ?? 0;
    if (count === 0) return "#1a2340";
    if (count <= 2) return "#242b48";
    if (count <= 5) return "#5b6fa5";
    return "#7c94d0";
  }

  function handleProvinceClick(province: string, feature: GeoFeature) {
    if (justDraggedRef.current || dragRef.current?.moved) return;
    const isActive = activeProvince === province;
    setActiveDepto(null);
    setActivePartido(null);
    onProvinceSelect(isActive ? null : province);
    if (isActive) {
      setVb(FULL_VB);
    } else {
      const padding = province === "CABA" ? 0.6 : 0.15;
      const newVb = vbForFeature(feature, padding);
      provinceVbRef.current = newVb;
      setVb(newVb);
    }
  }

  function handleDeptoClick(depto: string, partidos: BaPartidoFeature[]) {
    if (justDraggedRef.current || dragRef.current?.moved) return;
    setActiveDepto(depto);
    setActivePartido(null);
    setVb(getPartidosBounds(partidos, 0.12));
  }

  function handlePartidoClick(partido: BaPartidoFeature) {
    if (justDraggedRef.current || dragRef.current?.moved) return;
    setActivePartido(partido.properties.name);
    setVb(getPartidosBounds([partido], 0.2));
  }

  function goBackToProvince() {
    setActiveDepto(null);
    setActivePartido(null);
    setVb(provinceVbRef.current);
  }

  function goBackToDepto() {
    setActivePartido(null);
    if (activeDepto && deptosMap[activeDepto]) {
      setVb(getPartidosBounds(deptosMap[activeDepto], 0.12));
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
    setActiveDepto(null);
    setActivePartido(null);
    setVb(FULL_VB);
  }

  const fullView = isVbFull(vb);

  // Level indicator for hint text and header
  const level = activeDepto ? 2 : activeProvince ? 1 : 0;
  const hintText = [
    "Hacé click en una provincia · scroll para zoom · arrastrá para mover",
    "Hacé click en un departamento judicial para explorar sus partidos",
    "Hacé click en un partido · scroll para zoom · arrastrá para mover",
  ][level];

  const headerBadge = activeDepto
    ? `${activeProvince} › ${activeDepto}${activePartido ? ` › ${activePartido}` : ""}`
    : (activeProvince ?? "Argentina");

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
          style={{
            cursor: activeProvince && !isActive ? "default" : "pointer",
            transition: "fill 0.15s ease",
          }}
          onClick={() => {
            // Clicking non-active province while one is selected → ignore
            if (activeProvince && !isActive) return;
            handleProvinceClick(province, feature);
          }}
          onMouseEnter={(e) => {
            if (activeProvince && !isActive) return;
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
      className="overflow-hidden rounded-xl border shadow-md shadow-black/30"
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
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: "#d0a04a15", border: "1px solid #d0a04a30" }}
        >
          <ArgentinaIcon className="text-gold h-5 w-5" aria-hidden />
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
                  backgroundColor: "#d0a04a15",
                  color: "#d0a04a",
                  border: "1px solid #d0a04a30",
                }}
              >
                {headerBadge}
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: "#a8a496" }}>
            {isOpen ? hintText : "Explorá el mapa de provincias — hacé click para desplegar"}
          </p>
        </div>

        <div
          className="flex shrink-0 items-center gap-2 text-sm font-medium"
          style={{ color: "#a8a496" }}
        >
          <span>{isOpen ? "Cerrar" : "Abrir"}</span>
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5 transition-transform duration-200"
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
              {/* Zoom */}
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
                >
                  ⊙ Todo el país
                </button>
              )}

              {/* Breadcrumb navigation */}
              {activeProvince && !activeDepto && (
                <button
                  onClick={resetView}
                  className="rounded border px-2.5 py-1 text-xs font-medium hover:bg-cream/5"
                  style={{ borderColor: "#f85149", color: "#f85149" }}
                >
                  ✕ {activeProvince}
                </button>
              )}
              {activeDepto && (
                <>
                  <button
                    onClick={goBackToProvince}
                    className="rounded border px-2.5 py-1 text-xs font-medium hover:bg-cream/5"
                    style={{ borderColor: "#363e5e", color: "#a8a496" }}
                  >
                    ← {activeProvince}
                  </button>
                  <span style={{ color: "#363e5e" }}>/</span>
                  <button
                    onClick={activePartido ? goBackToDepto : goBackToProvince}
                    className="rounded border px-2.5 py-1 text-xs font-medium hover:bg-cream/5"
                    style={{
                      borderColor: activePartido ? "#363e5e" : "#f85149",
                      color: activePartido ? "#a8a496" : "#f85149",
                    }}
                  >
                    {activePartido ? activeDepto : `✕ ${activeDepto}`}
                  </button>
                  {activePartido && (
                    <>
                      <span style={{ color: "#363e5e" }}>/</span>
                      <button
                        onClick={goBackToDepto}
                        className="rounded border px-2.5 py-1 text-xs font-medium hover:bg-cream/5"
                        style={{ borderColor: "#f85149", color: "#f85149" }}
                      >
                        ✕ {activePartido}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Leyenda */}
            <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: "#a8a496" }}>
              {level === 0 &&
                [
                  { bg: "#1c2128", label: "Sin datos", border: "1px solid #363e5e" },
                  { bg: "#242b48", label: "1–2 jueces" },
                  { bg: "#5b6fa5", label: "3–5 jueces" },
                ].map(({ bg, label, border }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span className="h-3 w-4 rounded" style={{ backgroundColor: bg, border }} />
                    {label}
                  </div>
                ))}
              {level >= 1 && (
                <span className="text-xs" style={{ color: "#a8a496" }}>
                  {level === 1
                    ? "Cada color = departamento judicial"
                    : `Partidos de ${activeDepto}`}
                </span>
              )}
            </div>
          </div>

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
                {/* Capa base: provincias */}
                {renderPaths("main", 8)}

                {/* Level 1: departamentos judiciales clickeables */}
                {activeProvince === "Buenos Aires" &&
                  !activeDepto &&
                  Object.entries(deptosMap).map(([depto, partidos]) => {
                    const color = DEPTO_COLORS[depto] ?? "#a8a496";
                    const d = partidos.map((p) => geometryToPath(p.geometry)).join(" ");
                    return (
                      <path
                        key={`depto-${depto}`}
                        d={d}
                        fill={`${color}35`}
                        stroke={color}
                        strokeWidth={5}
                        style={{ cursor: "pointer", transition: "fill 0.12s ease" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeptoClick(depto, partidos);
                        }}
                        onMouseEnter={(e) =>
                          setTooltip({
                            title: depto,
                            subtitle: "Departamento judicial — hacé click para explorar partidos",
                            x: e.clientX,
                            y: e.clientY,
                          })
                        }
                        onMouseLeave={() => setTooltip(null)}
                        onMouseMove={(e) =>
                          setTooltip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : null))
                        }
                      >
                        <title>{depto}</title>
                      </path>
                    );
                  })}

                {/* Level 2: partidos individuales del departamento seleccionado */}
                {activeProvince === "Buenos Aires" &&
                  activeDepto &&
                  (() => {
                    const color = DEPTO_COLORS[activeDepto] ?? "#a8a496";
                    const deptoPartidos = deptosMap[activeDepto] ?? [];
                    return (
                      <>
                        {/* Borde del departamento (highlight de fondo) */}
                        <path
                          d={deptoPartidos.map((p) => geometryToPath(p.geometry)).join(" ")}
                          fill={`${color}20`}
                          stroke={color}
                          strokeWidth={10}
                          style={{ pointerEvents: "none" }}
                        />
                        {/* Partidos individuales clickeables */}
                        {deptoPartidos.map((partido) => {
                          const isSelected = partido.properties.name === activePartido;
                          return (
                            <path
                              key={`partido-${partido.properties.osm_id}`}
                              d={geometryToPath(partido.geometry)}
                              fill={isSelected ? `${color}60` : `${color}25`}
                              stroke={isSelected ? color : `${color}90`}
                              strokeWidth={isSelected ? 8 : 3}
                              style={{ cursor: "pointer", transition: "fill 0.12s ease" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePartidoClick(partido);
                              }}
                              onMouseEnter={(e) =>
                                setTooltip({
                                  title: partido.properties.name,
                                  subtitle: `Departamento ${activeDepto}`,
                                  x: e.clientX,
                                  y: e.clientY,
                                })
                              }
                              onMouseLeave={() => setTooltip(null)}
                              onMouseMove={(e) =>
                                setTooltip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : null))
                              }
                            >
                              <title>{partido.properties.name}</title>
                            </path>
                          );
                        })}
                      </>
                    );
                  })()}

                {/* Inset CABA/AMBA — solo en vista completa */}
                {fullView && (
                  <g>
                    <rect
                      x={2608}
                      y={4210}
                      width={96}
                      height={105}
                      fill="none"
                      stroke="#d0a04a"
                      strokeWidth={6}
                      strokeDasharray="18 8"
                      style={{ pointerEvents: "none" }}
                    />
                    <line
                      x1={2704}
                      y1={4237}
                      x2={INSET_POS.x}
                      y2={INSET_POS.y + 80}
                      stroke="#d0a04a30"
                      strokeWidth={5}
                      strokeDasharray="16 10"
                      style={{ pointerEvents: "none" }}
                    />
                    <line
                      x1={2704}
                      y1={4290}
                      x2={INSET_POS.x}
                      y2={INSET_POS.y + INSET_POS.h - 80}
                      stroke="#d0a04a30"
                      strokeWidth={5}
                      strokeDasharray="16 10"
                      style={{ pointerEvents: "none" }}
                    />
                    <rect
                      x={INSET_POS.x}
                      y={INSET_POS.y}
                      width={INSET_POS.w}
                      height={INSET_POS.h}
                      rx={24}
                      fill="#0f1529"
                      stroke="#d0a04a60"
                      strokeWidth={7}
                    />
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
                    <svg
                      x={INSET_POS.x}
                      y={INSET_POS.y + 80}
                      width={INSET_POS.w}
                      height={INSET_POS.h - 80}
                      viewBox={`${INSET_VIEW.x} ${INSET_VIEW.y} ${INSET_VIEW.w} ${INSET_VIEW.h}`}
                      overflow="hidden"
                    >
                      {renderPaths("inset", 2.5)}
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
                    <rect
                      x={INSET_POS.x}
                      y={INSET_POS.y}
                      width={INSET_POS.w}
                      height={INSET_POS.h}
                      rx={24}
                      fill="none"
                      stroke="#d0a04a60"
                      strokeWidth={7}
                      style={{ pointerEvents: "none" }}
                    />
                  </g>
                )}
              </svg>
            )}
          </div>

          {/* Panel inferior: departamentos o partidos */}
          {activeProvince === "Buenos Aires" && !activeDepto && baPartidos.length > 0 && (
            <div className="mt-3 border-t pt-3" style={{ borderColor: "#242b48" }}>
              <p className="mb-2 text-xs font-medium" style={{ color: "#a8a496" }}>
                Departamentos judiciales — Buenos Aires:
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(deptosMap).map((depto) => {
                  const color = DEPTO_COLORS[depto] ?? "#a8a496";
                  return (
                    <button
                      key={depto}
                      onClick={() => handleDeptoClick(depto, deptosMap[depto])}
                      className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors hover:opacity-80"
                      style={{
                        backgroundColor: `${color}20`,
                        color,
                        border: `1px solid ${color}60`,
                      }}
                    >
                      <span
                        className="inline-block h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      {depto}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeDepto && (
            <div className="mt-3 border-t pt-3" style={{ borderColor: "#242b48" }}>
              <p className="mb-2 text-xs font-medium" style={{ color: "#a8a496" }}>
                Partidos — {activeDepto}:
              </p>
              <div className="flex flex-wrap gap-2">
                {(deptosMap[activeDepto] ?? []).map((partido) => {
                  const color = DEPTO_COLORS[activeDepto] ?? "#a8a496";
                  const isSelected = partido.properties.name === activePartido;
                  return (
                    <button
                      key={partido.properties.osm_id}
                      onClick={() => handlePartidoClick(partido)}
                      className="rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors hover:opacity-80"
                      style={{
                        backgroundColor: isSelected ? `${color}40` : `${color}15`,
                        color: isSelected ? color : `${color}cc`,
                        border: `1px solid ${isSelected ? color : `${color}50`}`,
                      }}
                    >
                      {partido.properties.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
