"use client";

import { useEffect, useState } from "react";
import DisclaimerModal from "./components/DisclaimerModal";
import Hero from "./components/Hero";
import JudgeCard from "./components/JudgeCard";
import JurisdictionStats from "./components/JurisdictionStats";
import StatsBar from "./components/StatsBar";
import { fetchHierarchy, fetchJudges, Judge, JurisdictionNode } from "./lib/api";

type SortKey =
  | "name"
  | "totalReleases"
  | "ftaCount"
  | "newArrestCount"
  | "revokedCount"
  | "failureRate";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "failureRate", label: "Tasa de falla" },
  { key: "totalReleases", label: "Libertades" },
  { key: "newArrestCount", label: "Nuevos arrestos" },
  { key: "name", label: "Nombre" },
];

export default function HomePage() {
  const [judges, setJudges] = useState<Judge[]>([]);
  const [hierarchy, setHierarchy] = useState<JurisdictionNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("failureRate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [activeProvince, setActiveProvince] = useState<string | null>(null);

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

  const filtered = judges
    .filter((j) => {
      const matchesSearch =
        j.name.toLowerCase().includes(search.toLowerCase()) ||
        j.court.toLowerCase().includes(search.toLowerCase()) ||
        j.location.province.toLowerCase().includes(search.toLowerCase()) ||
        j.location.department.toLowerCase().includes(search.toLowerCase());

      const matchesProvince = activeProvince ? j.location.province === activeProvince : true;

      return matchesSearch && matchesProvince;
    })
    .sort((a, b) => {
      let av: number | string;
      let bv: number | string;
      if (sortKey === "name") {
        av = a.name;
        bv = b.name;
      } else if (sortKey === "failureRate") {
        av = a.failureRate;
        bv = b.failureRate;
      } else {
        av = a[sortKey];
        bv = b[sortKey];
      }
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv, "es") : bv.localeCompare(av, "es");
      }
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

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

      {/* Judge browser */}
      <main id="jueces" className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-lg font-bold" style={{ color: "#e6edf3" }}>
            Jueces
          </h2>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-semibold"
            style={{ backgroundColor: "#21262d", color: "#7d8590" }}
          >
            {judges.length}
          </span>
          {loading ? (
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
          ) : error ? (
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
          ) : (
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
              Filtrado: {activeProvince}
            </span>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div
            className="mb-5 rounded-lg border px-4 py-3 text-sm"
            style={{ backgroundColor: "#f8514910", borderColor: "#f85149", color: "#f85149" }}
          >
            {error}
          </div>
        )}

        {/* Search & sort controls */}
        {!loading && !error && (
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-sm">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                style={{ color: "#74ACDF" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
              <input
                type="search"
                placeholder="Buscar por nombre, tribunal, provincia o depto. judicial..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border py-2.5 pl-9 pr-4 text-sm outline-none"
                style={{
                  borderColor: "#30363d",
                  backgroundColor: "#161b22",
                  color: "#e6edf3",
                }}
                aria-label="Buscar jueces"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium" style={{ color: "#7d8590" }}>
                Ordenar:
              </span>
              {SORT_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleSort(key)}
                  className="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: sortKey === key ? "#74ACDF" : "#21262d",
                    color: sortKey === key ? "#0d1117" : "#8b949e",
                    border: "1px solid " + (sortKey === key ? "#74ACDF" : "#30363d"),
                  }}
                  aria-pressed={sortKey === key}
                >
                  {label} {sortKey === key ? (sortDir === "desc" ? "↓" : "↑") : ""}
                </button>
              ))}
            </div>
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

        {/* Judge cards grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((judge) => (
              <JudgeCard key={judge.id} {...judge} />
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
              Probá con otro término de búsqueda
              {activeProvince && " o quitá el filtro de provincia"}
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
