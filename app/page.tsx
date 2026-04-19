"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import DisclaimerModal from "./components/DisclaimerModal";
import Hero from "./components/Hero";
import JudgeCard from "./components/JudgeCard";
import JudgeFilters, { FilterState } from "./components/JudgeFilters";
import JurisdictionStats from "./components/JurisdictionStats";
import StatsBar from "./components/StatsBar";
import { Tag } from "./components/Tag";
import Link from "next/link";
import {
  fetchJudgeCounts,
  fetchFilterOptions,
  fetchJudges,
  fetchHierarchy,
  FilterOptions,
  Judge,
  JudgeCounts,
  JurisdictionNode,
  JudgesFetchParams,
} from "./lib/api";

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

const EMPTY_COUNTS: JudgeCounts = { byProvince: {}, byDepto: {}, byCity: {} };
const EMPTY_OPTIONS: FilterOptions = { fueros: [], instances: [], scopes: [] };

function Pagination({
  page,
  totalPages,
  total,
  limit,
  onChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  const btnBase =
    "flex h-8 min-w-[2rem] items-center justify-center rounded-md border px-2 text-xs font-medium transition-colors";
  const activeBtn = "border-gold bg-gold/10 text-gold";
  const inactiveBtn = "border-border text-cream-muted hover:bg-cream/5";
  const disabledBtn = "border-border text-cream-muted/40 cursor-not-allowed";

  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <p className="text-cream-muted text-xs">
        Mostrando {from}–{to} de {total} jueces
      </p>
      <div className="flex flex-wrap items-center justify-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className={`${btnBase} ${page === 1 ? disabledBtn : inactiveBtn}`}
        >
          ← Ant.
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="text-cream-muted px-1 text-xs">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`${btnBase} ${p === page ? activeBtn : inactiveBtn}`}
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className={`${btnBase} ${page === totalPages ? disabledBtn : inactiveBtn}`}
        >
          Sig. →
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [judges, setJudges] = useState<Judge[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [judgeCounts, setJudgeCounts] = useState<JudgeCounts>(EMPTY_COUNTS);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(EMPTY_OPTIONS);
  const [hierarchy, setHierarchy] = useState<JurisdictionNode | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeProvince, setActiveProvince] = useState<string | null>(null);
  const [activeDepto, setActiveDepto] = useState<string | null>(null);
  const [activePartido, setActivePartido] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cargar datos estáticos una sola vez — independientes entre sí
  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([fetchJudgeCounts(), fetchFilterOptions(), fetchHierarchy()]).then(
      ([countsResult, optionsResult, hierResult]) => {
        if (cancelled) return;
        if (countsResult.status === "fulfilled") setJudgeCounts(countsResult.value);
        if (optionsResult.status === "fulfilled") setFilterOptions(optionsResult.value);
        if (hierResult.status === "fulfilled") setHierarchy(hierResult.value);
        if (countsResult.status === "rejected")
          setError(
            "No se pudo conectar con el backend. Asegurate de que esté corriendo en http://localhost:3600",
          );
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounce de búsqueda
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(filters.search), 350);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [filters.search]);

  // Fetch paginado cuando cambian filtros, página o selección geográfica
  const fetchPage = useCallback(
    async (p: number) => {
      setLoading(true);
      const params: JudgesFetchParams = {
        page: p,
        limit: 9,
        sortKey: filters.sortKey,
        sortDir: filters.sortDir,
        search: debouncedSearch || undefined,
        fuero: filters.activeFuero ?? undefined,
        instance: filters.activeInstance ?? undefined,
        scope: filters.activeScope ?? undefined,
        salaryBand: filters.activeSalaryBand ?? undefined,
        yearsBand: filters.activeYearsBand ?? undefined,
        province: activeProvince ?? undefined,
        department: activeDepto ? `Depto. Judicial ${activeDepto}` : undefined,
        city: activePartido ?? undefined,
      };
      try {
        const result = await fetchJudges(params);
        setJudges(result.data);
        setTotal(result.total);
        setTotalPages(result.totalPages);
        setPage(result.page);
        setError(null);
      } catch {
        setError(
          "No se pudo conectar con el backend. Asegurate de que esté corriendo en http://localhost:3600",
        );
      } finally {
        setLoading(false);
      }
    },
    [
      filters.sortKey,
      filters.sortDir,
      filters.activeFuero,
      filters.activeInstance,
      filters.activeScope,
      filters.activeSalaryBand,
      filters.activeYearsBand,
      debouncedSearch,
      activeProvince,
      activeDepto,
      activePartido,
    ],
  );

  // Al cambiar filtros → volver a página 1
  useEffect(() => {
    fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.sortKey,
    filters.sortDir,
    filters.activeFuero,
    filters.activeInstance,
    filters.activeScope,
    filters.activeSalaryBand,
    filters.activeYearsBand,
    debouncedSearch,
    activeProvince,
    activeDepto,
    activePartido,
  ]);

  function patchFilters(patch: Partial<FilterState>) {
    setFilters((prev) => ({ ...prev, ...patch }));
  }

  const hasAnyFilter =
    activeProvince ||
    activeDepto ||
    activePartido ||
    filters.search ||
    filters.activeFuero ||
    filters.activeInstance ||
    filters.activeScope ||
    filters.activeSalaryBand ||
    filters.activeYearsBand;

  const locationLabel = activePartido
    ? `${activePartido} (${activeDepto})`
    : activeDepto
      ? `Depto. ${activeDepto}`
      : (activeProvince ?? null);

  // Stats bar usa el total general (sin filtros) del hierarchy o de counts
  const totalJudgesAll = Object.values(judgeCounts.byProvince).reduce((s, n) => s + n, 0);

  return (
    <>
      <DisclaimerModal />

      <StatsBar
        totalJudges={totalJudgesAll}
        totalReleases={hierarchy?.totalReleases ?? 0}
        totalFailures={hierarchy?.totalFailures ?? 0}
      />

      <Hero />

      {hierarchy && (
        <JurisdictionStats
          hierarchy={hierarchy}
          onProvinceFilter={setActiveProvince}
          activeProvince={activeProvince}
        />
      )}

      <div
        aria-hidden
        className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-10 sm:px-6 lg:px-8"
      >
        <div className="bg-gold/25 h-px flex-1" />
        <span className="text-gold/70 font-serif text-2xl leading-none">§</span>
        <div className="bg-gold/25 h-px flex-1" />
      </div>

      <main id="jueces" className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        {/* Mapa interactivo */}
        <div className="mb-8">
          <MapArgentina
            judgeCounts={judgeCounts}
            activeProvince={activeProvince}
            onProvinceSelect={setActiveProvince}
            onDeptoSelect={setActiveDepto}
            onPartidoSelect={setActivePartido}
          />
        </div>

        {/* Section header */}
        <p className="text-gold mb-2 text-xs font-semibold uppercase tracking-[0.28em]">
          Registros
        </p>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <h2 className="text-cream font-serif text-3xl font-bold sm:text-4xl">Jueces</h2>
          <Tag>{totalJudgesAll}</Tag>
          {loading && <Tag variant="gold">Cargando</Tag>}
          {!loading && error && <Tag variant="danger">Sin conexión</Tag>}
          {!loading && !error && <Tag variant="success">Datos del backend</Tag>}
          {activeProvince && <Tag variant="gold">Provincia: {activeProvince}</Tag>}
          {activeDepto && <Tag variant="gold">Depto: {activeDepto}</Tag>}
          {activePartido && <Tag variant="gold">Partido: {activePartido}</Tag>}
        </div>

        {error && (
          <div className="bg-danger-soft border-danger text-danger mb-5 rounded-lg border px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Filtros */}
        <div className="mb-5">
          <JudgeFilters filters={filters} onChange={patchFilters} filterOptions={filterOptions} />
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="shimmer-bg border-border h-52 rounded-xl border" />
            ))}
          </div>
        )}

        {/* Judge cards */}
        {!loading && !error && judges.length > 0 && (
          <>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={9}
              onChange={(p) => fetchPage(p)}
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {judges.map((judge) => (
                <Link
                  key={judge.id}
                  href={`/juez/${judge.slug}`}
                  className="focus-visible:ring-gold block rounded-xl focus:outline-none focus-visible:ring-2"
                >
                  <JudgeCard {...judge} />
                </Link>
              ))}
            </div>
          </>
        )}

        {!loading && !error && judges.length === 0 && (
          <div className="bg-ink-elevated border-border flex flex-col items-center justify-center rounded-xl border py-16">
            <p className="text-cream font-medium">No se encontraron jueces</p>
            <p className="text-cream-muted mt-1 text-sm">
              {hasAnyFilter
                ? "Probá ajustando los filtros o hacé click en el mapa para cambiar la selección"
                : "No hay jueces disponibles"}
            </p>
          </div>
        )}

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
            className="text-gold mt-2 inline-block text-xs hover:underline"
          >
            Ver código fuente en GitHub
          </a>
        </footer>
      </main>
    </>
  );
}
