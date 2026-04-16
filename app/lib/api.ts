const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3600/api";

// ── Tipos espejados del backend ──────────────────────────────────────────────

export interface JudgeLocation {
  country: string;
  province: string;
  /** Departamento Judicial. En CABA = ciudad entera; en el interior = depto. judicial oficial. */
  department: string;
}

export interface Judge {
  id: number;
  name: string;
  court: string;
  location: JudgeLocation;
  totalReleases: number;
  ftaCount: number;
  newArrestCount: number;
  revokedCount: number;
  totalFailures: number;
  failureRate: number;
}

export type JurisdictionLevel = "country" | "province" | "department";

export interface JurisdictionNode {
  name: string;
  level: JurisdictionLevel;
  path: string;
  totalJudges: number;
  totalReleases: number;
  ftaCount: number;
  newArrestCount: number;
  revokedCount: number;
  totalFailures: number;
  failureRate: number;
  children?: JurisdictionNode[];
}

// ── Funciones de fetch ───────────────────────────────────────────────────────

export async function fetchJudges(): Promise<Judge[]> {
  const res = await fetch(`${API_BASE}/judges`);
  if (!res.ok) throw new Error(`Error ${res.status} al cargar jueces`);
  return res.json();
}

export async function fetchHierarchy(): Promise<JurisdictionNode> {
  const res = await fetch(`${API_BASE}/stats/hierarchy`);
  if (!res.ok) throw new Error(`Error ${res.status} al cargar jerarquía`);
  return res.json();
}
