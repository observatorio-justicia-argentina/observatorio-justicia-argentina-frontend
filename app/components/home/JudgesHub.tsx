"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import JudgeFilters, { FilterState } from "../JudgeFilters";
import JudgeList from "./JudgeList";
import { Tag } from "../Tag";
import { fetchJudges, FilterOptions, Judge, JudgeCounts, JudgesFetchParams } from "../../lib/api";

const MapArgentina = dynamic(() => import("../MapArgentina"), { ssr: false });

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

interface JudgesHubProps {
  initialJudgeCounts: JudgeCounts;
  initialFilterOptions: FilterOptions;
  activeProvince: string | null;
  onProvinceChange: (p: string | null) => void;
}

export default function JudgesHub({
  initialJudgeCounts,
  initialFilterOptions,
  activeProvince,
  onProvinceChange,
}: JudgesHubProps) {
  const [judges, setJudges] = useState<Judge[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [activeDepto, setActiveDepto] = useState<string | null>(null);
  const [activePartido, setActivePartido] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(filters.search), 350);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [filters.search]);

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
        setError(false);
      } catch {
        setJudges([]);
        setTotal(0);
        setTotalPages(1);
        setError(true);
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

  const hasAnyFilter = !!(
    activeProvince ||
    activeDepto ||
    activePartido ||
    filters.search ||
    filters.activeFuero ||
    filters.activeInstance ||
    filters.activeScope ||
    filters.activeSalaryBand ||
    filters.activeYearsBand
  );

  const totalJudgesAll = Object.values(initialJudgeCounts.byProvince).reduce((s, n) => s + n, 0);

  return (
    <main id="jueces" className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <MapArgentina
          judgeCounts={initialJudgeCounts}
          activeProvince={activeProvince}
          onProvinceSelect={onProvinceChange}
          onDeptoSelect={setActiveDepto}
          onPartidoSelect={setActivePartido}
        />
      </div>

      <p className="text-gold mb-2 text-xs font-semibold uppercase tracking-[0.28em]">Registros</p>
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
        <div className="border-border bg-ink-elevated mb-5 flex items-center gap-3 rounded-xl border px-5 py-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="text-cream-muted h-5 w-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3l18 18M8.111 8.111A7 7 0 0116.9 16.9M1.42 1.42l.58.58M22 12c0 5.523-4.477 10-10 10M12 2C6.477 2 2 6.477 2 12"
            />
          </svg>
          <div>
            <p className="text-cream text-sm font-medium">Backend no disponible</p>
            <p className="text-cream-muted text-xs">
              No se pudo conectar con el servidor. Los datos se mostrarán cuando la conexión se
              restablezca.
            </p>
          </div>
        </div>
      )}

      {!error && (
        <div className="mb-5">
          <JudgeFilters
            filters={filters}
            onChange={patchFilters}
            filterOptions={initialFilterOptions}
          />
        </div>
      )}

      <JudgeList
        judges={judges}
        loading={loading}
        error={error}
        page={page}
        totalPages={totalPages}
        total={total}
        hasAnyFilter={hasAnyFilter}
        onPageChange={fetchPage}
      />

      <footer className="border-border mt-16 border-t pt-8 text-center">
        <p className="text-cream-muted text-xs leading-relaxed">
          Observatorio Judicial Argentino es un proyecto de código abierto, estadístico y sin sesgo
          político. No tiene fines de vigilancia ni de castigo. Los datos provienen de registros
          públicos del poder judicial argentino.
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
  );
}
