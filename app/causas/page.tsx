"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import {
  CausaRanking,
  CausasFilter,
  EstadoCausa,
  fetchCausasRanking,
  PaginatedResult,
} from "../lib/api";

// ── Colores y etiquetas de estado ────────────────────────────────────────────

const ESTADO_CONFIG: Record<
  EstadoCausa,
  { label: string; color: string; bg: string; dot: string }
> = {
  activa: {
    label: "Activa",
    color: "#3fb950",
    bg: "#3fb95015",
    dot: "🟢",
  },
  demorada: {
    label: "Demorada",
    color: "#d29922",
    bg: "#d2992215",
    dot: "🟡",
  },
  cajoneada: {
    label: "Cajoneada",
    color: "#f85149",
    bg: "#f8514915",
    dot: "🔴",
  },
  resuelta: {
    label: "Resuelta",
    color: "#7d8590",
    bg: "#7d859015",
    dot: "✅",
  },
};

const ESTADOS: Array<EstadoCausa | "todas"> = [
  "todas",
  "cajoneada",
  "demorada",
  "activa",
  "resuelta",
];
const ESTADO_LABELS: Record<EstadoCausa | "todas", string> = {
  todas: "Todas",
  cajoneada: "Cajoneada",
  demorada: "Demorada",
  activa: "Activa",
  resuelta: "Resuelta",
};

const ALCANCES = ["Nacional", "Federal", "Provincial"] as const;
const PROVINCIAS = [
  "CABA",
  "Buenos Aires",
  "Córdoba",
  "Santa Fe",
  "Mendoza",
  "Tucumán",
  "Entre Ríos",
  "Chaco",
  "Corrientes",
  "Misiones",
  "Salta",
  "Santiago del Estero",
  "San Juan",
  "Jujuy",
  "Río Negro",
  "Neuquén",
  "Formosa",
  "Chubut",
  "San Luis",
  "Catamarca",
  "La Rioja",
  "La Pampa",
  "Santa Cruz",
  "Tierra del Fuego",
];

// ── Componente principal (envuelto en Suspense) ───────────────────────────────

function CausasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Leer filtros desde URL
  const estadoParam = (searchParams.get("estado") as EstadoCausa | "todas") ?? "todas";
  const provinciaParam = searchParams.get("provincia") ?? "";
  const fueroParam = searchParams.get("fuero") ?? "";
  const alcanceParam = searchParams.get("alcance") as "Nacional" | "Federal" | "Provincial" | null;
  const delitoParam = searchParams.get("delito") ?? "";
  const pageParam = Number(searchParams.get("page") ?? "1");

  const [result, setResult] = useState<PaginatedResult<CausaRanking> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inputs controlados (para el input libre de delito)
  const [delitoInput, setDelitoInput] = useState(delitoParam);

  // Actualiza la URL sin recargar — los efectos secundarios reaccionan
  const updateURL = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([k, v]) => {
        if (v === null || v === "" || v === "todas") {
          params.delete(k);
        } else {
          params.set(k, v);
        }
      });
      params.delete("page"); // reset pagination on filter change
      router.push(`/causas?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  // Fetch cuando cambian los params de la URL
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const filter: CausasFilter = {
      estado: estadoParam === "todas" ? undefined : estadoParam,
      provincia: provinciaParam || undefined,
      fuero: fueroParam || undefined,
      alcance: alcanceParam ?? undefined,
      delito: delitoParam || undefined,
      page: pageParam,
      limit: 20,
    };

    fetchCausasRanking(filter)
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error al cargar los datos");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [estadoParam, provinciaParam, fueroParam, alcanceParam, delitoParam, pageParam]);

  // Sincronizar input de delito cuando cambia la URL
  useEffect(() => {
    setDelitoInput(delitoParam);
  }, [delitoParam]);

  const handleDelitoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL({ delito: delitoInput || null });
  };

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Encabezado ──────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: "#e6edf3" }}>
          Causas por tiempo de demora
        </h1>
        <p className="mt-2 text-sm" style={{ color: "#7d8590" }}>
          Causas judiciales ordenadas por días desde su inicio. Sin juicio editorial:{" "}
          <strong style={{ color: "#e6edf3" }}>el dato es el dato</strong>. Cada usuario puede
          cruzar los filtros y extraer sus propias conclusiones.{" "}
          <Link
            href="/metodologia"
            className="underline transition-colors hover:opacity-80"
            style={{ color: "#74ACDF" }}
          >
            Ver metodología y fuentes →
          </Link>
        </p>

        {/* Fuente estadística */}
        <div
          className="mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs"
          style={{ borderColor: "#21262d", backgroundColor: "#161b22", color: "#7d8590" }}
        >
          <span>📊</span>
          <span>
            Umbrales basados en la mediana del proceso penal argentino (33 meses).{" "}
            <a
              href="https://www.mpf.gob.ar/docs/RepositorioB/Ebooks/qE533.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: "#74ACDF" }}
            >
              Procuración General de la Nación
            </a>{" "}
            ·{" "}
            <a
              href="https://www.csjn.gov.ar/novedades/detalle/13002"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: "#74ACDF" }}
            >
              Anuario CSJN 2025
            </a>
          </span>
        </div>
      </div>

      {/* ── Filtros ──────────────────────────────────────────────────────────── */}
      <div
        className="mb-6 rounded-xl border p-4"
        style={{ backgroundColor: "#161b22", borderColor: "#21262d" }}
      >
        {/* Estado — pills */}
        <div className="mb-4">
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#7d8590" }}
          >
            Estado
          </p>
          <div className="flex flex-wrap gap-2">
            {ESTADOS.map((estado) => {
              const active = estadoParam === estado || (estado === "todas" && !estadoParam);
              const cfg = estado !== "todas" ? ESTADO_CONFIG[estado] : null;
              return (
                <button
                  key={estado}
                  onClick={() => updateURL({ estado: estado === "todas" ? null : estado })}
                  className="cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-all"
                  style={{
                    borderColor: active ? (cfg?.color ?? "#74ACDF") : "#30363d",
                    backgroundColor: active ? (cfg?.bg ?? "#74ACDF15") : "transparent",
                    color: active ? (cfg?.color ?? "#74ACDF") : "#7d8590",
                  }}
                >
                  {cfg?.dot && `${cfg.dot} `}
                  {ESTADO_LABELS[estado]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          {/* Provincia */}
          <div className="min-w-[180px]">
            <label
              className="mb-1 block text-xs font-semibold uppercase tracking-wider"
              style={{ color: "#7d8590" }}
            >
              Provincia
            </label>
            <select
              value={provinciaParam}
              onChange={(e) => updateURL({ provincia: e.target.value || null })}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none"
              style={{
                backgroundColor: "#0d1117",
                borderColor: "#30363d",
                color: provinciaParam ? "#e6edf3" : "#7d8590",
              }}
            >
              <option value="">Todas las provincias</option>
              {PROVINCIAS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Alcance */}
          <div>
            <p
              className="mb-1 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "#7d8590" }}
            >
              Alcance
            </p>
            <div className="flex gap-2">
              {ALCANCES.map((a) => (
                <button
                  key={a}
                  onClick={() => updateURL({ alcance: alcanceParam === a ? null : a })}
                  className="cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-all"
                  style={{
                    borderColor: alcanceParam === a ? "#74ACDF" : "#30363d",
                    backgroundColor: alcanceParam === a ? "#74ACDF15" : "transparent",
                    color: alcanceParam === a ? "#74ACDF" : "#7d8590",
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Tipo de causa (búsqueda libre) */}
          <div className="flex-1 min-w-[200px]">
            <label
              htmlFor="delito-input"
              className="mb-1 block text-xs font-semibold uppercase tracking-wider"
              style={{ color: "#7d8590" }}
            >
              Tipo de causa
            </label>
            <form onSubmit={handleDelitoSubmit} className="flex gap-2">
              <input
                id="delito-input"
                type="text"
                value={delitoInput}
                onChange={(e) => setDelitoInput(e.target.value)}
                placeholder="Ej: narcotráfico"
                className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1"
                style={{
                  backgroundColor: "#0d1117",
                  borderColor: "#30363d",
                  color: "#e6edf3",
                }}
              />
              <button
                type="submit"
                className="cursor-pointer rounded-lg border px-3 py-2 text-xs font-medium transition-all hover:bg-white/5"
                style={{ borderColor: "#30363d", color: "#74ACDF" }}
              >
                Buscar
              </button>
            </form>
          </div>
        </div>

        {/* Limpiar filtros */}
        {(estadoParam !== "todas" ||
          provinciaParam ||
          fueroParam ||
          alcanceParam ||
          delitoParam) && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => router.push("/causas", { scroll: false })}
              className="cursor-pointer text-xs underline transition-opacity hover:opacity-70"
              style={{ color: "#7d8590" }}
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}
      </div>

      {/* ── Resultado ────────────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-20" style={{ color: "#7d8590" }}>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span className="ml-3 text-sm">Cargando causas…</span>
        </div>
      )}

      {error && !loading && (
        <div
          className="rounded-xl border px-4 py-6 text-center text-sm"
          style={{ borderColor: "#f8514930", backgroundColor: "#f8514910", color: "#f85149" }}
        >
          {error}
        </div>
      )}

      {result && !loading && !error && (
        <>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs" style={{ color: "#7d8590" }}>
              {result.total === 0
                ? "No se encontraron causas con los filtros seleccionados."
                : `${result.total} causa${result.total !== 1 ? "s" : ""} encontrada${result.total !== 1 ? "s" : ""}`}
            </p>
            {result.total > 0 && (
              <p className="text-xs" style={{ color: "#7d8590" }}>
                Página {result.page} de {result.totalPages}
              </p>
            )}
          </div>

          {result.data.length > 0 && (
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "#21262d" }}>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr style={{ backgroundColor: "#161b22", borderBottom: "1px solid #21262d" }}>
                    {[
                      "Magistrado",
                      "Jurisdicción",
                      "Expediente",
                      "Tipo de causa",
                      "Días",
                      "Estado",
                    ].map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "#7d8590" }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.data.map((causa, idx) => {
                    const cfg = ESTADO_CONFIG[causa.estadoCausa];
                    return (
                      <tr
                        key={`${causa.expediente}-${idx}`}
                        style={{
                          borderBottom: "1px solid #21262d",
                          backgroundColor: idx % 2 === 0 ? "transparent" : "#0d111720",
                        }}
                        className="transition-colors hover:bg-white/[0.02]"
                      >
                        {/* Magistrado */}
                        <td className="px-4 py-3">
                          <Link
                            href={`/juez/${causa.judgeSlug}`}
                            className="font-medium transition-colors hover:underline"
                            style={{ color: "#74ACDF" }}
                          >
                            {causa.judgeName}
                          </Link>
                        </td>

                        {/* Jurisdicción */}
                        <td className="px-4 py-3">
                          <div className="text-xs font-medium" style={{ color: "#e6edf3" }}>
                            {causa.provincia}
                          </div>
                          <div className="text-xs" style={{ color: "#7d8590" }}>
                            {causa.fuero}
                          </div>
                          <div
                            className="mt-0.5 inline-block rounded px-1.5 py-0.5 text-xs"
                            style={{
                              backgroundColor:
                                causa.alcance === "Federal"
                                  ? "#74ACDF15"
                                  : causa.alcance === "Nacional"
                                    ? "#3fb95015"
                                    : "#d2992215",
                              color:
                                causa.alcance === "Federal"
                                  ? "#74ACDF"
                                  : causa.alcance === "Nacional"
                                    ? "#3fb950"
                                    : "#d29922",
                            }}
                          >
                            {causa.alcance}
                          </div>
                        </td>

                        {/* Expediente */}
                        <td className="px-4 py-3 font-mono text-xs" style={{ color: "#e6edf3" }}>
                          {causa.expediente}
                        </td>

                        {/* Delito */}
                        <td className="px-4 py-3 text-xs" style={{ color: "#e6edf3" }}>
                          {causa.delito}
                        </td>

                        {/* Días */}
                        <td className="px-4 py-3">
                          <span
                            className="text-lg font-bold"
                            style={{
                              color:
                                causa.estadoCausa === "cajoneada"
                                  ? "#f85149"
                                  : causa.estadoCausa === "demorada"
                                    ? "#d29922"
                                    : causa.estadoCausa === "activa"
                                      ? "#3fb950"
                                      : "#7d8590",
                            }}
                          >
                            {causa.diasDesdeInicio.toLocaleString("es-AR")}
                          </span>
                          <span className="ml-1 text-xs" style={{ color: "#7d8590" }}>
                            días
                          </span>
                        </td>

                        {/* Estado */}
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium"
                            style={{
                              borderColor: cfg.color + "40",
                              backgroundColor: cfg.bg,
                              color: cfg.color,
                            }}
                          >
                            {cfg.dot} {cfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {result.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                disabled={result.page <= 1}
                onClick={() => updateURL({ page: String(result.page - 1) })}
                className="cursor-pointer rounded-lg border px-3 py-2 text-xs font-medium disabled:cursor-default disabled:opacity-40"
                style={{ borderColor: "#30363d", color: "#e6edf3" }}
              >
                ← Anterior
              </button>
              <span className="text-xs" style={{ color: "#7d8590" }}>
                {result.page} / {result.totalPages}
              </span>
              <button
                disabled={result.page >= result.totalPages}
                onClick={() => updateURL({ page: String(result.page + 1) })}
                className="cursor-pointer rounded-lg border px-3 py-2 text-xs font-medium disabled:cursor-default disabled:opacity-40"
                style={{ borderColor: "#30363d", color: "#e6edf3" }}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

// ── Export con Suspense (necesario por useSearchParams) ───────────────────────

export default function CausasPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center py-20" style={{ color: "#7d8590" }}>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </div>
      }
    >
      <CausasContent />
    </Suspense>
  );
}
