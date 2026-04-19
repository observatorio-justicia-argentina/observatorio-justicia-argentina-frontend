import { POLITICAL_ORIGIN_CONFIG, type PoliticalOrigin, type JudgeAppointmentDetail } from "./api";

/**
 * Tests del Expediente Reputacional — Fase 1
 * Cubre: POLITICAL_ORIGIN_CONFIG y los 4 valores de PoliticalOrigin.
 */

describe("POLITICAL_ORIGIN_CONFIG", () => {
  const origenes: PoliticalOrigin[] = ["judicial", "political", "academic", "mixed"];

  it("tiene una entrada para cada valor de PoliticalOrigin", () => {
    origenes.forEach((origen) => {
      expect(POLITICAL_ORIGIN_CONFIG[origen]).toBeDefined();
    });
  });

  it("cada entrada tiene label y color no vacíos", () => {
    origenes.forEach((origen) => {
      const cfg = POLITICAL_ORIGIN_CONFIG[origen];
      expect(typeof cfg.label).toBe("string");
      expect(cfg.label.length).toBeGreaterThan(0);
      expect(typeof cfg.color).toBe("string");
      expect(cfg.color.length).toBeGreaterThan(0);
    });
  });

  it("los colores son hex válidos (#rrggbb)", () => {
    const hexColor = /^#[0-9a-fA-F]{6}$/;
    origenes.forEach((origen) => {
      expect(POLITICAL_ORIGIN_CONFIG[origen].color).toMatch(hexColor);
    });
  });

  it('"judicial" tiene color verde (positivo)', () => {
    // Verde indica carrera judicial pura — el color más "neutro/positivo"
    expect(POLITICAL_ORIGIN_CONFIG.judicial.color).toBe("#3fb950");
  });

  it('"political" tiene color rojo (alerta)', () => {
    // Rojo indica designación con fuerte componente político
    expect(POLITICAL_ORIGIN_CONFIG.political.color).toBe("#f85149");
  });

  it('"academic" tiene color azul', () => {
    expect(POLITICAL_ORIGIN_CONFIG.academic.color).toBe("#74ACDF");
  });

  it('"mixed" tiene color amarillo (intermedio)', () => {
    expect(POLITICAL_ORIGIN_CONFIG.mixed.color).toBe("#F4B942");
  });

  it("los labels describen correctamente cada origen", () => {
    expect(POLITICAL_ORIGIN_CONFIG.judicial.label).toMatch(/judicial/i);
    expect(POLITICAL_ORIGIN_CONFIG.political.label).toMatch(/pol[ií]tica/i);
    expect(POLITICAL_ORIGIN_CONFIG.academic.label).toMatch(/acad[eé]m/i);
    expect(POLITICAL_ORIGIN_CONFIG.mixed.label).toMatch(/mixta/i);
  });
});

// ── JudgeAppointmentDetail — politicalOriginSources ──────────────────────────

describe("JudgeAppointmentDetail.politicalOriginSources", () => {
  it("acepta una lista de fuentes con label y url", () => {
    const detail: JudgeAppointmentDetail = {
      politicalOrigin: "judicial",
      politicalOriginSources: [
        { label: "Ingresó al PJ en 2001", url: "https://example.com/res-45-2001" },
        { label: "Concurso N° 247", url: "https://example.com/concurso-247" },
      ],
    };
    expect(detail.politicalOriginSources).toHaveLength(2);
    detail.politicalOriginSources!.forEach((src) => {
      expect(typeof src.label).toBe("string");
      expect(typeof src.url).toBe("string");
    });
  });

  it("es opcional — puede estar ausente sin romper la interfaz", () => {
    const detail: JudgeAppointmentDetail = {
      politicalOrigin: "political",
    };
    expect(detail.politicalOriginSources).toBeUndefined();
  });

  it("label y url no pueden ser strings vacíos en datos válidos", () => {
    const sources = [{ label: "Resolución senatorial 2020", url: "https://example.com/decreto" }];
    sources.forEach((src) => {
      expect(src.label.length).toBeGreaterThan(0);
      expect(src.url.length).toBeGreaterThan(0);
    });
  });
});
