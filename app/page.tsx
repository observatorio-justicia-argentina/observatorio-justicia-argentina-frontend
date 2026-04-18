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
          <h2 className="text-cream font-serif text-2xl font-bold">Jueces</h2>
          <span className="bg-border text-cream-muted rounded-full px-2 py-0.5 text-xs font-semibold">
            {judges.length}
          </span>

          {loading && (
            <span className="bg-royal-soft text-royal border-royal/30 ml-1 rounded-full border px-2.5 py-0.5 text-xs font-medium">
              Cargando...
            </span>
          )}
          {!loading && error && (
            <span className="bg-danger-soft text-danger border-danger/30 ml-1 rounded-full border px-2.5 py-0.5 text-xs font-medium">
              Sin conexión al backend
            </span>
          )}
          {!loading && !error && (
            <span className="bg-success-soft text-success border-success/30 ml-1 rounded-full border px-2.5 py-0.5 text-xs font-medium">
              Datos del backend
            </span>
          )}
          {activeProvince && (
            <span className="bg-royal-soft text-royal border-royal/50 ml-1 rounded-full border px-2.5 py-0.5 text-xs font-medium">
              Provincia: {activeProvince}
            </span>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-danger-soft border-danger text-danger mb-5 rounded-lg border px-4 py-3 text-sm">
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
          <p className="text-cream-muted mb-4 text-xs">
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
                className="bg-ink-elevated border-border h-52 animate-pulse rounded-xl border"
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
                href={`/juez/${judge.slug}`}
                className="focus-visible:ring-royal block rounded-xl focus:outline-none focus-visible:ring-2"
              >
                <JudgeCard {...judge} />
              </Link>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="bg-ink-elevated border-border flex flex-col items-center justify-center rounded-xl border py-16">
            <p className="text-cream font-medium">No se encontraron jueces</p>
            <p className="text-cream-muted mt-1 text-sm">
              {hasAnyFilter
                ? "Probá ajustando los filtros o hacé click en el mapa para cambiar la provincia"
                : "No hay jueces disponibles"}
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="border-border mt-16 border-t pt-8 text-center">
          <p className="text-cream-muted text-xs leading-relaxed">
            Observatorio Judicial Argentino es un proyecto de código abierto, estadístico y sin
            sesgo político. No tiene fines de vigilancia ni de castigo. Los datos provienen de
            registros públicos del poder judicial argentino.
          </p>
          <a
            href="https://github.com/observatorio-justicia-argentina/observatorio-justicia-argentina-frontend"
            target="_blank"
            rel="noopener noreferrer"
            className="text-royal mt-2 inline-block text-xs hover:underline"
          >
            Ver código fuente en GitHub
          </a>
        </footer>
      </main>
    </>
  );
}
