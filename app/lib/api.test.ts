import { getSalaryBand, SALARY_BAND_LABELS } from "./api";

// ── getSalaryBand ─────────────────────────────────────────────────────────────

describe("getSalaryBand", () => {
  describe("banda baja (< $6.000.000)", () => {
    it('devuelve "baja" para salario 0', () => {
      expect(getSalaryBand(0)).toBe("baja");
    });

    it('devuelve "baja" para salario típico inferior', () => {
      expect(getSalaryBand(3_000_000)).toBe("baja");
    });

    it('devuelve "baja" para 5.999.999 (un peso antes del umbral)', () => {
      expect(getSalaryBand(5_999_999)).toBe("baja");
    });
  });

  describe("banda media ($6.000.000 – $10.000.000)", () => {
    it('devuelve "media" en el límite inferior exacto ($6.000.000)', () => {
      expect(getSalaryBand(6_000_000)).toBe("media");
    });

    it('devuelve "media" para un salario intermedio', () => {
      expect(getSalaryBand(8_000_000)).toBe("media");
    });

    it('devuelve "media" en el límite superior exacto ($10.000.000)', () => {
      expect(getSalaryBand(10_000_000)).toBe("media");
    });
  });

  describe("banda alta (> $10.000.000)", () => {
    it('devuelve "alta" para 10.000.001 (un peso sobre el umbral)', () => {
      expect(getSalaryBand(10_000_001)).toBe("alta");
    });

    it('devuelve "alta" para salario elevado', () => {
      expect(getSalaryBand(20_000_000)).toBe("alta");
    });
  });
});

// ── SALARY_BAND_LABELS ────────────────────────────────────────────────────────

describe("SALARY_BAND_LABELS", () => {
  it("tiene una etiqueta para cada banda", () => {
    expect(SALARY_BAND_LABELS.baja).toBeDefined();
    expect(SALARY_BAND_LABELS.media).toBeDefined();
    expect(SALARY_BAND_LABELS.alta).toBeDefined();
  });

  it("las etiquetas son strings no vacíos", () => {
    Object.values(SALARY_BAND_LABELS).forEach((label) => {
      expect(typeof label).toBe("string");
      expect(label.length).toBeGreaterThan(0);
    });
  });
});
