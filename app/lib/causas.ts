import type { EstadoCausa } from "./api";

export interface EstadoCausaConfig {
  label: string;
  dot: string;
  text: string;
  bg: string;
  border: string;
}

export const ESTADO_CONFIG: Record<EstadoCausa, EstadoCausaConfig> = {
  activa: {
    label: "Activa",
    dot: "🟢",
    text: "text-success",
    bg: "bg-success-soft",
    border: "border-success/40",
  },
  "demora-moderada": {
    label: "Demora moderada",
    dot: "🟡",
    text: "text-warning",
    bg: "bg-warning-soft",
    border: "border-warning/40",
  },
  "alta-demora": {
    label: "Alta demora",
    dot: "🔴",
    text: "text-danger",
    bg: "bg-danger-soft",
    border: "border-danger/40",
  },
  resuelta: {
    label: "Resuelta",
    dot: "✅",
    text: "text-cream-muted",
    bg: "bg-ink-elevated",
    border: "border-border",
  },
};

export const ESTADOS: Array<EstadoCausa | "todas"> = [
  "todas",
  "alta-demora",
  "demora-moderada",
  "activa",
  "resuelta",
];

export const ESTADO_LABELS: Record<EstadoCausa | "todas", string> = {
  todas: "Todas",
  "alta-demora": "Alta demora",
  "demora-moderada": "Demora moderada",
  activa: "Activa",
  resuelta: "Resuelta",
};

export const ALCANCES = ["Nacional", "Federal", "Provincial"] as const;

export const PROVINCIAS_AR = [
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
