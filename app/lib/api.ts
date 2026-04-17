const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3600/api";

// ── Ubicación ────────────────────────────────────────────────────────────────

export interface JudgeLocation {
  country: string;
  province: string;
  department: string;
}

// ── Jurisdicción ─────────────────────────────────────────────────────────────

export interface JudgeJurisdiction {
  fuero: string;
  instance: string;
  scope: "Nacional" | "Federal" | "Provincial";
  competence: "Ordinaria" | "Federal";
}

// ── Remuneración ─────────────────────────────────────────────────────────────

export interface JudgeSalary {
  grossMonthlyARS: number;
  acordada: string;
  category: string;
  lastUpdated: string;
}

// ── Causas ───────────────────────────────────────────────────────────────────

export interface JudgeCase {
  expediente: string;
  defendant: string;
  crime: string;
  crimeArticle: string;
  decisionType: string;
  decisionDate: string;
  legalBasis: string;
  outcome: "fta" | "newArrest" | "revoked" | "ongoing";
  outcomeDate?: string;
  outcomeDetail?: string;
}

// ── Fuentes ──────────────────────────────────────────────────────────────────

export interface JudgeSourceLink {
  label: string;
  url: string;
  description: string;
}

// ── Campos extendidos (opcionales) ────────────────────────────────────────────

export interface JudgeEducation {
  degree: string;
  institution: string;
  year: number;
}

export interface JudgeCareerEntry {
  role: string;
  institution: string;
  period: string;
}

export interface JudgeNotableDecision {
  year: number;
  description: string;
  article?: string;
  outcome: string;
}

export interface JudgeExtendedStats {
  avgResolutionDays: number;
  pendingCases: number;
  recusals: number;
  appealedDecisions: number;
  reversedOnAppeal: number;
  reversalRate: number;
}

// ── Juez ─────────────────────────────────────────────────────────────────────

export interface Judge {
  id: number;
  slug: string;
  isDemoData: boolean;
  name: string;
  court: string;
  location: JudgeLocation;
  jurisdiction: JudgeJurisdiction;
  workAddress: string;
  workHours: string;
  salary: JudgeSalary;
  appointmentDate: string;
  appointmentBody: string;
  yearsOnBench: number;
  totalReleases: number;
  ftaCount: number;
  newArrestCount: number;
  revokedCount: number;
  totalFailures: number;
  failureRate: number;
  cases: JudgeCase[];
  sourceLinks: JudgeSourceLink[];
  // Opcionales — disponibles en perfiles completos
  publicBio?: string;
  education?: JudgeEducation[];
  careerHistory?: JudgeCareerEntry[];
  notableDecisions?: JudgeNotableDecision[];
  extendedStats?: JudgeExtendedStats;
}

// ── Bandas salariales ─────────────────────────────────────────────────────────

export type SalaryBand = "baja" | "media" | "alta";

export function getSalaryBand(grossMonthlyARS: number): SalaryBand {
  if (grossMonthlyARS < 6_000_000) return "baja";
  if (grossMonthlyARS <= 10_000_000) return "media";
  return "alta";
}

export const SALARY_BAND_LABELS: Record<SalaryBand, string> = {
  baja: "Baja (< $6M)",
  media: "Media ($6M – $10M)",
  alta: "Alta (> $10M)",
};

// ── Jerarquía de jurisdicciones ──────────────────────────────────────────────

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

// ── Tipos de detalle de juez (endpoint /judges/:id/casos y /archivos) ────────

export type ResultadoCaso = "fta" | "nuevo_arresto" | "revocada" | "pendiente";

export interface Caso {
  id: string;
  nroExpediente: string;
  fechaResolucion: string; // ISO date (YYYY-MM-DD)
  tipoMedida: string;
  resultado: ResultadoCaso;
  observaciones?: string;
}

export interface ArchivoPublico {
  id: string;
  nombre: string;
  url: string;
  fechaCarga: string; // ISO date
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Fetch ────────────────────────────────────────────────────────────────────

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

export async function fetchJudgeCases(
  slug: string,
  page = 1,
  limit = 10,
): Promise<PaginatedResult<Caso>> {
  const res = await fetch(`${API_BASE}/judges/${slug}/casos?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error(`Error ${res.status} al cargar casos del juez`);
  return res.json();
}

export async function fetchJudgeArchivos(slug: string): Promise<ArchivoPublico[]> {
  const res = await fetch(`${API_BASE}/judges/${slug}/archivos`);
  if (!res.ok) throw new Error(`Error ${res.status} al cargar archivos del juez`);
  return res.json();
}

export async function fetchJudgeBySlug(slug: string): Promise<Judge> {
  const res = await fetch(`${API_BASE}/judges/${slug}`);
  if (!res.ok) throw new Error(`Error ${res.status} al cargar el juez`);
  return res.json();
}
