"use client";

import { FilterOptions, SalaryBand, SALARY_BAND_LABELS, SortKey, YearsBand } from "../lib/api";

export type { SortKey, YearsBand };

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
  filterOptions: FilterOptions;
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
  const cls = active
    ? "bg-gold text-cream border-gold"
    : "bg-border text-cream-muted border-border-strong hover:bg-cream/5";
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${cls}`}
    >
      {children}
    </button>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-cream-muted min-w-[80px] shrink-0 text-xs">{label}</span>
      {children}
    </div>
  );
}

export default function JudgeFilters({ filters, onChange, filterOptions }: Props) {
  const { fueros, instances, scopes } = filterOptions;

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
      {/* Búsqueda + Ordenar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <svg
            className="text-gold pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
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
            className="bg-ink-elevated border-border-strong text-cream focus:border-gold placeholder:text-cream-muted w-full rounded-lg border py-2.5 pl-9 pr-4 text-sm outline-none transition-colors focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-cream-muted text-xs font-medium">Ordenar:</span>
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
      <div className="bg-ink border-border rounded-lg border p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-cream-muted text-xs font-bold uppercase tracking-wider">
            Filtros
          </span>
          {hasActiveFilters && (
            <button onClick={clearAll} className="text-danger text-xs hover:underline">
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {fueros.length > 0 && (
            <FilterRow label="Fuero:">
              {fueros.map((f) => (
                <ChipButton
                  key={f}
                  active={filters.activeFuero === f}
                  onClick={() => onChange({ activeFuero: filters.activeFuero === f ? null : f })}
                >
                  {f}
                </ChipButton>
              ))}
            </FilterRow>
          )}

          {instances.length > 0 && (
            <FilterRow label="Instancia:">
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
            </FilterRow>
          )}

          {scopes.length > 0 && (
            <FilterRow label="Alcance:">
              {scopes.map((s) => (
                <ChipButton
                  key={s}
                  active={filters.activeScope === s}
                  onClick={() => onChange({ activeScope: filters.activeScope === s ? null : s })}
                >
                  {s}
                </ChipButton>
              ))}
            </FilterRow>
          )}

          <FilterRow label="Salario:">
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
          </FilterRow>

          <FilterRow label="Antigüedad:">
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
          </FilterRow>
        </div>
      </div>
    </div>
  );
}
