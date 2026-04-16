"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import DisclaimerModal from "./components/DisclaimerModal";
import Hero from "./components/Hero";
import JudgeCard from "./components/JudgeCard";
import JudgeFilters, { FilterState, applyFilters } from "./components/JudgeFilters";
import JurisdictionStats from "./components/JurisdictionStats";
import StatsBar from "./components/StatsBar";
import Link from "next/link";
import { fetchHierarchy, fetchJudges, Judge, JurisdictionNode } from "./lib/api";

// El mapa usa APIs del browser (SVG + eventos de mouse) — se carga solo en el cliente
const MapArgentina = dynamic(() => import("./components/MapArgentina"), { ssr: false });

const DEFAULT_FILTERS: FilterState = {
  search: "",
  sortKey: "failureRate",
  sortDir: "desc",
  activeFuero: null,
  activeInstance: null,
  activeScope: null,
  activeSalaryBand: null,
  activeYearsBand: null,
};

export default function HomePage() {
  const [judges, setJudges] = useState<Judge[]>([]);
  const [hierarchy, setHierarchy] = useState<JurisdictionNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeProvince, setActiveProvince] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [judgesData, hierarchyData] = await Promise.all([fetchJudges(), fetchHierarchy()]);
        if (!cancelled) {
          setJudges(judgesData);
          setHierarchy(hierarchyData);
        }
      } catch {
        if (!cancelled) {
          setError(
            "No se pudo conectar con el backend. Asegurate de que esté corriendo en http://localhost:3600",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalReleases = judges.reduce((s, j) => s + j.totalReleases, 0);
  const totalFailures = judges.reduce((s, j) => s + j.totalFailures, 0);

  // Filtrar primero por provincia (del mapa) luego por el resto de filtros
  const judgesInProvince = activeProvince
    ? judges.filter((j) => j.location.province === activeProvince)
    : judges;

  const filtered = applyFilters(judgesInProvince, filters);

  function patchFilters(patch: Partial<FilterState>) {
    setFilters((prev) => ({ ...prev, ...patch }));
  }

  const hasAnyFilter =
    activeProvince ||
    filters.search ||
    filters.activeFuero ||
    filters.activeInstance ||
    filters.activeScope ||
    filters.activeSalaryBand ||
    filters.activeYearsBand;

  return (
    <>
      <DisclaimerModal />

      {/* Stats strip */}
      <StatsBar
        totalJudges={judges.length}
        totalReleases={totalReleases}
        totalFailures={totalFailures}
      />

      {/* Hero */}
      <Hero />

      {/* Jurisdiction hierarchy */}
      {hierarchy && (
        <JurisdictionStats
          hierarchy={hierarchy}
          onProvinceFilter={setActiveProvince}
          activeProvince={activeProvince}
        />
      )}

      <main id="jueces" className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Mapa interactivo */}
        {!loading && !error && (
          <div className="mb-8">
            <MapArgentina
              judges={judges}
              activeProvince={activeProvince}
              onProvinceSelect={setActiveProvince}
            />
          </div>
        )}

        {/* Section header */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-bold" style={{ color: "#e6edf3" }}>
            Jueces
          </h2>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-semibold"
            style={{ backgroundColor: "#21262d", color: "#7d8590" }}
          >
            {judges.length}
          </span>

          {loading && (
            <span
              className="ml-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: "#74ACDF15",
                color: "#74ACDF",
                border: "1px solid #74ACDF30",
              }}
            >
              Cargando...
            </span>
          )}
          {!loading && error && (
            <span
              className="ml-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: "#f8514920",
                color: "#f85149",
                border: "1px solid #f8514930",
              }}
            >
              Sin conexión al backend
            </span>
          )}
          {!loading && !error && (
            <span
              className="ml-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: "#3fb95015",
                color: "#3fb950",
                border: "1px solid #3fb95030",
              }}
            >
              Datos del backend
            </span>
          )}
          {activeProvince && (
            <span
              className="ml-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: "#74ACDF20",
                color: "#74ACDF",
                border: "1px solid #74ACDF50",
              }}
            >
              Provincia: {activeProvince}
            </span>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div
            className="mb-5 rounded-lg border px-4 py-3 text-sm"
            style={{
              backgroundColor: "#f8514910",
              borderColor: "#f85149",
              color: "#f85149",
            }}
          >
            {error}
          </div>
        )}

        {/* Filtros */}
        {!loading && !error && (
          <div className="mb-5">
            <JudgeFilters filters={filters} onChange={patchFilters} judges={judges} />
          </div>
        )}

        {!loading && !error && (
          <p className="mb-4 text-xs" style={{ color: "#7d8590" }}>
            Mostrando {filtered.length} de {judges.length} jueces
            {activeProvince && ` en ${activeProvince}`}
          </p>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-52 animate-pulse rounded-xl border"
                style={{ backgroundColor: "#161b22", borderColor: "#21262d" }}
              />
            ))}
          </div>
        )}

        {/* Judge cards */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((judge) => (
              <Link
                key={judge.id}
                href={`/juez/${judge.id}`}
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#74ACDF] rounded-xl"
              >
                <JudgeCard {...judge} />
              </Link>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div
            className="flex flex-col items-center justify-center rounded-xl border py-16"
            style={{ borderColor: "#21262d", backgroundColor: "#161b22" }}
          >
            <p className="font-medium" style={{ color: "#e6edf3" }}>
              No se encontraron jueces
            </p>
            <p className="mt-1 text-sm" style={{ color: "#7d8590" }}>
              {hasAnyFilter
                ? "Probá ajustando los filtros o hacé click en el mapa para cambiar la provincia"
                : "No hay jueces disponibles"}
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 border-t pt-8 text-center" style={{ borderColor: "#21262d" }}>
          <p className="text-xs leading-relaxed" style={{ color: "#7d8590" }}>
            Observatorio Judicial Argentino es un proyecto de código abierto, estadístico y sin
            sesgo político. No tiene fines de vigilancia ni de castigo. Los datos provienen de
            registros públicos del poder judicial argentino.
          </p>
          <a
            href="https://github.com/observatorio-justicia-argentina/observatorio-justicia-argentina-frontend"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs hover:underline"
            style={{ color: "#74ACDF" }}
          >
            Ver código fuente en GitHub
          </a>
        </footer>
      </main>
    </>
  );
}
