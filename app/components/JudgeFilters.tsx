"use client";

import { Judge, SalaryBand, SALARY_BAND_LABELS, getSalaryBand } from "../lib/api";

export type SortKey =
  | "name"
  | "totalReleases"
  | "ftaCount"
  | "newArrestCount"
  | "revokedCount"
  | "failureRate";

export type YearsBand = "junior" | "mid" | "senior";

export interface FilterState {
  search: string;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  activeFuero: string | null;
  activeInstance: string | null;
  activeScope: string | null;
  activeSalaryBand: SalaryBand | null;
  activeYearsBand: YearsBand | null;
}

interface Props {
  filters: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
  judges: Judge[];
}

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "failureRate", label: "Tasa de falla" },
  { key: "totalReleases", label: "Libertades" },
  { key: "newArrestCount", label: "Nuevos arrestos" },
  { key: "name", label: "Nombre" },
];

const YEARS_BAND_LABELS: Record<YearsBand, string> = {
  junior: "< 5 años",
  mid: "5–15 años",
  senior: "> 15 años",
};

function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
      style={{
        backgroundColor: active ? "#74ACDF" : "#21262d",
        color: active ? "#0d1117" : "#8b949e",
        border: "1px solid " + (active ? "#74ACDF" : "#30363d"),
      }}
    >
      {children}
    </button>
  );
}

export function applyFilters(judges: Judge[], filters: FilterState): Judge[] {
  return judges
    .filter((j) => {
      const q = filters.search.toLowerCase();
      const matchesSearch =
        !q ||
        j.name.toLowerCase().includes(q) ||
        j.court.toLowerCase().includes(q) ||
        j.location.province.toLowerCase().includes(q) ||
        j.location.department.toLowerCase().includes(q) ||
        j.jurisdiction.fuero.toLowerCase().includes(q);

      const matchesFuero = !filters.activeFuero || j.jurisdiction.fuero === filters.activeFuero;
      const matchesInstance =
        !filters.activeInstance || j.jurisdiction.instance === filters.activeInstance;
      const matchesScope = !filters.activeScope || j.jurisdiction.scope === filters.activeScope;
      const matchesSalary =
        !filters.activeSalaryBand ||
        getSalaryBand(j.salary?.grossMonthlyARS ?? 0) === filters.activeSalaryBand;
      const matchesYears =
        !filters.activeYearsBand ||
        (filters.activeYearsBand === "junior" && j.yearsOnBench < 5) ||
        (filters.activeYearsBand === "mid" && j.yearsOnBench >= 5 && j.yearsOnBench <= 15) ||
        (filters.activeYearsBand === "senior" && j.yearsOnBench > 15);

      return (
        matchesSearch &&
        matchesFuero &&
        matchesInstance &&
        matchesScope &&
        matchesSalary &&
        matchesYears
      );
    })
    .sort((a, b) => {
      const { sortKey, sortDir } = filters;
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
}

export default function JudgeFilters({ filters, onChange, judges }: Props) {
  const fueros = [...new Set(judges.map((j) => j.jurisdiction?.fuero).filter(Boolean))];
  const instances = [...new Set(judges.map((j) => j.jurisdiction?.instance).filter(Boolean))];
  const scopes = [...new Set(judges.map((j) => j.jurisdiction?.scope).filter(Boolean))];

  const hasActiveFilters =
    filters.activeFuero ||
    filters.activeInstance ||
    filters.activeScope ||
    filters.activeSalaryBand ||
    filters.activeYearsBand;

  function clearAll() {
    onChange({
      activeFuero: null,
      activeInstance: null,
      activeScope: null,
      activeSalaryBand: null,
      activeYearsBand: null,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Búsqueda */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
            placeholder="Buscar por nombre, tribunal, provincia, fuero..."
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="w-full rounded-lg border py-2.5 pl-9 pr-4 text-sm outline-none"
            style={{ borderColor: "#30363d", backgroundColor: "#161b22", color: "#e6edf3" }}
          />
        </div>

        {/* Ordenar */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium" style={{ color: "#7d8590" }}>
            Ordenar:
          </span>
          {SORT_OPTIONS.map(({ key, label }) => (
            <ChipButton
              key={key}
              active={filters.sortKey === key}
              onClick={() => {
                if (filters.sortKey === key) {
                  onChange({ sortDir: filters.sortDir === "asc" ? "desc" : "asc" });
                } else {
                  onChange({ sortKey: key, sortDir: "desc" });
                }
              }}
            >
              {label} {filters.sortKey === key ? (filters.sortDir === "desc" ? "↓" : "↑") : ""}
            </ChipButton>
          ))}
        </div>
      </div>

      {/* Filtros avanzados */}
      <div
        className="rounded-lg border p-3"
        style={{ backgroundColor: "#0d1117", borderColor: "#21262d" }}
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#7d8590" }}>
            Filtros
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="text-xs hover:underline"
              style={{ color: "#f85149" }}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {/* Fuero */}
          {fueros.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="shrink-0 text-xs" style={{ color: "#7d8590", minWidth: "80px" }}>
                Fuero:
              </span>
              {fueros.map((f) => (
                <ChipButton
                  key={f}
                  active={filters.activeFuero === f}
                  onClick={() => onChange({ activeFuero: filters.activeFuero === f ? null : f })}
                >
                  {f}
                </ChipButton>
              ))}
            </div>
          )}

          {/* Instancia */}
          {instances.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="shrink-0 text-xs" style={{ color: "#7d8590", minWidth: "80px" }}>
                Instancia:
              </span>
              {instances.map((inst) => (
                <ChipButton
                  key={inst}
                  active={filters.activeInstance === inst}
                  onClick={() =>
                    onChange({ activeInstance: filters.activeInstance === inst ? null : inst })
                  }
                >
                  {inst}
                </ChipButton>
              ))}
            </div>
          )}

          {/* Alcance */}
          {scopes.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="shrink-0 text-xs" style={{ color: "#7d8590", minWidth: "80px" }}>
                Alcance:
              </span>
              {scopes.map((s) => (
                <ChipButton
                  key={s}
                  active={filters.activeScope === s}
                  onClick={() => onChange({ activeScope: filters.activeScope === s ? null : s })}
                >
                  {s}
                </ChipButton>
              ))}
            </div>
          )}

          {/* Escala salarial */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="shrink-0 text-xs" style={{ color: "#7d8590", minWidth: "80px" }}>
              Salario:
            </span>
            {(Object.keys(SALARY_BAND_LABELS) as SalaryBand[]).map((band) => (
              <ChipButton
                key={band}
                active={filters.activeSalaryBand === band}
                onClick={() =>
                  onChange({
                    activeSalaryBand: filters.activeSalaryBand === band ? null : band,
                  })
                }
              >
                {SALARY_BAND_LABELS[band]}
              </ChipButton>
            ))}
          </div>

          {/* Antigüedad */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="shrink-0 text-xs" style={{ color: "#7d8590", minWidth: "80px" }}>
              Antigüedad:
            </span>
            {(Object.keys(YEARS_BAND_LABELS) as YearsBand[]).map((band) => (
              <ChipButton
                key={band}
                active={filters.activeYearsBand === band}
                onClick={() =>
                  onChange({
                    activeYearsBand: filters.activeYearsBand === band ? null : band,
                  })
                }
              >
                {YEARS_BAND_LABELS[band]}
              </ChipButton>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
