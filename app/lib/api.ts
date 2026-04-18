const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3600/api";

// ── Ubicación ────────────────────────────────────────────────────────────────

export interface JudgeLocation {
  country: string;
  province: string;
  department: string;
  city?: string;
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
  validFrom: string;
  validTo: string | null;
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

// ── Expediente Reputacional — Fase 1 ─────────────────────────────────────────

export interface JudgeAssociation {
  name: string;
  role?: string;
  since?: number;
  sourceUrl?: string;
}

export type PoliticalOrigin = "judicial" | "political" | "academic" | "mixed";

export interface JudgeAppointmentDetail {
  politicalOrigin: PoliticalOrigin;
  politicalOriginDetail?: string;
  magistraturaScore?: number;
  magistraturaRank?: number;
  magistraturaCompetitionId?: string;
  magistraturaSourceUrl?: string;
  senateBackers?: string[];
  senateSession?: string;
  senateRecordUrl?: string;
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
  salary: JudgeSalary | null;
  appointmentDate: string;
  appointmentBody: string;
  yearsOnBench: number;
  totalReleases: number;
  ftaCount: number;
  newArrestCount: number;
  revokedCount: number;
  totalFailures: number;
  failureRate: number;
  cases?: JudgeCase[];
  sourceLinks: JudgeSourceLink[];
  // Opcionales — disponibles en perfiles completos
  publicBio?: string;
  education?: JudgeEducation[];
  careerHistory?: JudgeCareerEntry[];
  notableDecisions?: JudgeNotableDecision[];
  extendedStats?: JudgeExtendedStats;
  // Expediente Reputacional — Fase 1
  associations?: JudgeAssociation[];
  appointmentDetail?: JudgeAppointmentDetail;
}

// ── Bandas salariales y antigüedad ────────────────────────────────────────────

export type SalaryBand = "baja" | "media" | "alta";
export type YearsBand = "junior" | "mid" | "senior";
export type SortKey =
  | "name"
  | "totalReleases"
  | "ftaCount"
  | "newArrestCount"
  | "revokedCount"
  | "failureRate";

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

export type ResultadoCaso = "fta" | "newArrest" | "revoked" | "ongoing";

export interface Caso {
  id: string;
  expediente: string;
  decisionDate: string; // ISO date (YYYY-MM-DD)
  decisionType: string;
  outcome: ResultadoCaso;
  outcomeDetail?: string;
  crime?: string;
  crimeArticle?: string;
  legalBasis?: string;
  sourceFile?: string;
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

// ── Parámetros de fetch paginado ──────────────────────────────────────────────

export interface JudgesFetchParams {
  page?: number;
  limit?: number;
  province?: string;
  department?: string;
  city?: string;
  search?: string;
  fuero?: string;
  instance?: string;
  scope?: string;
  salaryBand?: SalaryBand;
  yearsBand?: YearsBand;
  sortKey?: SortKey;
  sortDir?: "asc" | "desc";
}

export interface JudgeCounts {
  byProvince: Record<string, number>;
  byDepto: Record<string, number>;
  byCity: Record<string, number>;
}

export interface FilterOptions {
  fueros: string[];
  instances: string[];
  scopes: string[];
}

// ── Fetch ────────────────────────────────────────────────────────────────────

export async function fetchJudges(params: JudgesFetchParams = {}): Promise<PaginatedResult<Judge>> {
  const qs = new URLSearchParams();
  (Object.entries(params) as [string, unknown][]).forEach(([k, v]) => {
    if (v != null && v !== "") qs.set(k, String(v));
  });
  const res = await fetch(`${API_BASE}/judges?${qs}`);
  if (!res.ok) throw new Error(`Error ${res.status} al cargar jueces`);
  return res.json();
}

export async function fetchJudgeCounts(): Promise<JudgeCounts> {
  const res = await fetch(`${API_BASE}/judges/counts`);
  if (!res.ok) throw new Error(`Error ${res.status} al cargar conteos`);
  return res.json();
}

export async function fetchFilterOptions(): Promise<FilterOptions> {
  const res = await fetch(`${API_BASE}/judges/options`);
  if (!res.ok) throw new Error(`Error ${res.status} al cargar opciones de filtro`);
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
