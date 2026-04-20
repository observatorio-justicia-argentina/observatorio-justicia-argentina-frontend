"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  CausaRanking,
  CausasFilter,
  EstadoCausa,
  fetchCausasRanking,
  PaginatedResult,
} from "../../lib/api";
import { ALCANCES, ESTADO_CONFIG, ESTADO_LABELS, ESTADOS, PROVINCIAS_AR } from "../../lib/causas";
import { Tag } from "../Tag";

function EstadoBadge({ estado }: { estado: EstadoCausa }) {
  const cfg = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG["activa"];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.bg} ${cfg.border} ${cfg.text}`}
    >
      {cfg.dot} {cfg.label}
    </span>
  );
}

function estadoPillClasses(estado: EstadoCausa | "todas", isActive: boolean): string {
  if (!isActive) return "border-border text-cream-muted hover:bg-cream/5";
  if (estado === "todas") return "border-gold/40 bg-gold-soft text-gold";
  const cfg = ESTADO_CONFIG[estado as EstadoCausa] ?? ESTADO_CONFIG["activa"];
  return `${cfg.border} ${cfg.bg} ${cfg.text}`;
}

export default function CausasClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const estadoParam = (searchParams.get("estado") as EstadoCausa | "todas") ?? "todas";
  const provinciaParam = searchParams.get("provincia") ?? "";
  const fueroParam = searchParams.get("fuero") ?? "";
  const alcanceParam = searchParams.get("alcance") as "Nacional" | "Federal" | "Provincial" | null;
  const delitoParam = searchParams.get("delito") ?? "";
  const pageParam = Number(searchParams.get("page") ?? "1");

  const [result, setResult] = useState<PaginatedResult<CausaRanking> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [delitoInput, setDelitoInput] = useState(delitoParam);

  const updateURL = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([k, v]) => {
        if (v === null || v === "" || v === "todas") params.delete(k);
        else params.set(k, v);
      });
      params.delete("page");
      router.push(`/causas?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

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

  useEffect(() => {
    setDelitoInput(delitoParam);
  }, [delitoParam]);

  const hasFilters =
    estadoParam !== "todas" || provinciaParam || fueroParam || alcanceParam || delitoParam;

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Encabezado ──────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-cream font-serif text-2xl font-bold sm:text-3xl">
          Causas por tiempo de demora
        </h1>
        <p className="text-cream-muted mt-2 text-sm leading-relaxed">
          Causas judiciales ordenadas por días desde su inicio. Sin juicio editorial:{" "}
          <strong className="text-cream">el dato es el dato</strong>. Cada usuario puede cruzar los
          filtros y extraer sus propias conclusiones.{" "}
          <Link
            href="/metodologia"
            className="text-gold underline transition-opacity hover:opacity-80"
          >
            Ver metodología y fuentes →
          </Link>
        </p>
        <div className="border-border bg-ink-elevated mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
          <span>📊</span>
          <span className="text-cream-muted">
            Umbrales basados en la mediana del proceso penal argentino (33 meses).{" "}
            <a
              href="https://www.mpf.gob.ar/docs/RepositorioB/Ebooks/qE533.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold underline"
            >
              Procuración General de la Nación
            </a>
            {" · "}
            <a
              href="https://www.csjn.gov.ar/novedades/detalle/13002"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold underline"
            >
              Anuario CSJN 2025
            </a>
          </span>
        </div>
      </div>

      {/* ── Filtros ──────────────────────────────────────────────────────────── */}
      <div className="border-border bg-ink-elevated mb-6 rounded-xl border p-4">
        {/* Estado */}
        <div className="mb-4">
          <p className="text-cream-muted mb-2 text-xs font-semibold uppercase tracking-wider">
            Estado
          </p>
          <div className="flex flex-wrap gap-2">
            {ESTADOS.map((estado) => (
              <button
                key={estado}
                onClick={() => updateURL({ estado: estado === "todas" ? null : estado })}
                className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-all ${estadoPillClasses(estado, estadoParam === estado || (estado === "todas" && !estadoParam))}`}
              >
                {estado !== "todas" && `${ESTADO_CONFIG[estado as EstadoCausa].dot} `}
                {ESTADO_LABELS[estado]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          {/* Provincia */}
          <div className="min-w-[180px]">
            <label className="text-cream-muted mb-1 block text-xs font-semibold uppercase tracking-wider">
              Provincia
            </label>
            <select
              value={provinciaParam}
              onChange={(e) => updateURL({ provincia: e.target.value || null })}
              className={`border-border bg-ink w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${provinciaParam ? "text-cream" : "text-cream-muted"}`}
            >
              <option value="">Todas las provincias</option>
              {PROVINCIAS_AR.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Alcance */}
          <div>
            <p className="text-cream-muted mb-1 text-xs font-semibold uppercase tracking-wider">
              Alcance
            </p>
            <div className="flex gap-2">
              {ALCANCES.map((a) => (
                <button
                  key={a}
                  onClick={() => updateURL({ alcance: alcanceParam === a ? null : a })}
                  className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-all ${alcanceParam === a ? "border-gold/40 bg-gold-soft text-gold" : "border-border text-cream-muted hover:bg-cream/5"}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Tipo de causa */}
          <div className="min-w-[200px] flex-1">
            <label
              htmlFor="delito-input"
              className="text-cream-muted mb-1 block text-xs font-semibold uppercase tracking-wider"
            >
              Tipo de causa
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateURL({ delito: delitoInput || null });
              }}
              className="flex gap-2"
            >
              <input
                id="delito-input"
                type="text"
                value={delitoInput}
                onChange={(e) => setDelitoInput(e.target.value)}
                placeholder="Ej: narcotráfico"
                className="border-border bg-ink text-cream placeholder:text-cream-muted flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold/40"
              />
              <button
                type="submit"
                className="border-border text-gold hover:bg-cream/5 cursor-pointer rounded-lg border px-3 py-2 text-xs font-medium transition-all"
              >
                Buscar
              </button>
            </form>
          </div>
        </div>

        {hasFilters && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => router.push("/causas", { scroll: false })}
              className="text-cream-muted cursor-pointer text-xs underline transition-opacity hover:opacity-70"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}
      </div>

      {/* ── Resultado ────────────────────────────────────────────────────────── */}
      {loading && (
        <div className="text-cream-muted flex items-center justify-center py-20">
          <div className="border-cream-muted h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          <span className="ml-3 text-sm">Cargando causas…</span>
        </div>
      )}

      {error && !loading && (
        <div className="border-danger/30 bg-danger-soft text-danger rounded-xl border px-4 py-6 text-center text-sm">
          {error}
        </div>
      )}

      {result && !loading && !error && (
        <>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-cream-muted text-xs">
                {result.total === 0
                  ? "No se encontraron causas con los filtros seleccionados."
                  : `${result.total} causa${result.total !== 1 ? "s" : ""} encontrada${result.total !== 1 ? "s" : ""}`}
              </span>
              {result.total > 0 && <Tag>{result.total}</Tag>}
            </div>
            {result.total > 0 && (
              <span className="text-cream-muted text-xs">
                Página {result.page} de {result.totalPages}
              </span>
            )}
          </div>

          {result.data.length > 0 && (
            <div className="border-border overflow-x-auto rounded-xl border">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-ink-elevated border-border border-b">
                    {["Magistrado", "Expediente", "Tipo de causa", "Días", "Estado"].map((col) => (
                      <th
                        key={col}
                        className="text-cream-muted px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.data.map((causa, idx) => {
                    const cfg = ESTADO_CONFIG[causa.estadoCausa] ?? ESTADO_CONFIG["activa"];
                    return (
                      <tr
                        key={`${causa.expediente}-${idx}`}
                        className={`border-border border-b ${idx % 2 === 0 ? "bg-ink" : "bg-ink-elevated/40"}`}
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/juez/${causa.judgeSlug}`}
                            className="text-gold text-xs hover:underline"
                          >
                            {causa.judgeName}
                          </Link>
                          <p className="text-cream-muted mt-0.5 text-xs">
                            {causa.provincia} · {causa.fuero}
                          </p>
                        </td>
                        <td className="text-cream px-4 py-3 font-mono text-xs">
                          {causa.expediente}
                        </td>
                        <td className="text-cream-muted px-4 py-3 text-xs">{causa.delito}</td>
                        <td className="px-4 py-3">
                          <span className={`text-base font-bold ${cfg.text}`}>
                            {causa.diasDesdeInicio.toLocaleString("es-AR")}
                          </span>
                          <span className="text-cream-muted ml-1 text-xs">días</span>
                        </td>
                        <td className="px-4 py-3">
                          <EstadoBadge estado={causa.estadoCausa} />
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
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => updateURL({ page: String(pageParam - 1) })}
                disabled={pageParam <= 1}
                className="border-border text-cream-muted disabled:text-cream-muted/40 rounded-md border px-3 py-1.5 text-xs transition-colors hover:bg-cream/5 disabled:cursor-not-allowed"
              >
                ← Ant.
              </button>
              <span className="text-cream-muted text-xs">
                {pageParam} / {result.totalPages}
              </span>
              <button
                onClick={() => updateURL({ page: String(pageParam + 1) })}
                disabled={pageParam >= result.totalPages}
                className="border-border text-cream-muted disabled:text-cream-muted/40 rounded-md border px-3 py-1.5 text-xs transition-colors hover:bg-cream/5 disabled:cursor-not-allowed"
              >
                Sig. →
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
