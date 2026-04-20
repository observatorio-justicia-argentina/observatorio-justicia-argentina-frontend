"use client";

import Link from "next/link";
import JudgeCard from "../JudgeCard";
import { Judge } from "../../lib/api";

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

interface JudgeListProps {
  judges: Judge[] | undefined;
  loading: boolean;
  error: boolean;
  page: number;
  totalPages: number;
  total: number;
  hasAnyFilter: boolean;
  onPageChange: (p: number) => void;
}

export default function JudgeList({
  judges,
  loading,
  error,
  page,
  totalPages,
  total,
  hasAnyFilter,
  onPageChange,
}: JudgeListProps) {
  if (loading && !error) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <div key={i} className="shimmer-bg border-border h-52 rounded-xl border" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-ink-elevated border-border flex flex-col items-center justify-center rounded-xl border py-16">
        <p className="text-cream font-medium">Sin datos disponibles</p>
        <p className="text-cream-muted mt-1 text-sm">
          Revisá la conexión con el servidor y recargá la página
        </p>
      </div>
    );
  }

  if ((judges ?? []).length === 0) {
    return (
      <div className="bg-ink-elevated border-border flex flex-col items-center justify-center rounded-xl border py-16">
        <p className="text-cream font-medium">No se encontraron jueces</p>
        <p className="text-cream-muted mt-1 text-sm">
          {hasAnyFilter
            ? "Probá ajustando los filtros o hacé click en el mapa para cambiar la selección"
            : "No hay jueces disponibles"}
        </p>
      </div>
    );
  }

  return (
    <>
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={9}
        onChange={onPageChange}
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(judges ?? []).map((judge) => (
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
  );
}
