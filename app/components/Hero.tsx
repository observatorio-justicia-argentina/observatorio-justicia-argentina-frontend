import { ChartIcon, FolderIcon, ScaleIcon, SearchIcon } from "./icons";

const STEPS = [
  {
    num: "I",
    text: "Cuando una persona es detenida, un juez decide si la libera mientras espera el juicio.",
  },
  {
    num: "II",
    text: "La legislación argentina exige que los fallos judiciales sobre libertades cautelares sean información pública — incluyendo cada caso en que esa libertad fracasó: la persona no se presentó a declarar, fue detenida nuevamente, o le fue revocada la medida.",
  },
  {
    num: "III",
    text: "Nosotros recopilamos esos registros públicos y te mostramos exactamente qué jueces presidieron esos casos — para que puedas ver los datos por vos mismo.",
  },
];

const PRINCIPLES: {
  Icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
}[] = [
  { Icon: FolderIcon, label: "Código abierto" },
  { Icon: ChartIcon, label: "Estadístico" },
  { Icon: ScaleIcon, label: "Sin sesgo político" },
  { Icon: SearchIcon, label: "Datos reales" },
];

// ── Sol de Mayo halftone ──────────────────────────────────────────────────────
// Stippled concentric rings — reads as an engraved sun, dots grow denser toward the core.

function SolHalftone({ className }: { className?: string }) {
  const dots: { x: number; y: number; r: number; key: string }[] = [];
  for (let ring = 1; ring <= 12; ring++) {
    const radius = ring * 9; // 9, 18, ..., 108
    const dotsInRing = Math.max(6, ring * 6);
    const dotSize = Math.max(0.9, 2.6 - ring * 0.12);
    for (let d = 0; d < dotsInRing; d++) {
      const angle = (d / dotsInRing) * 2 * Math.PI;
      dots.push({
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
        r: dotSize,
        key: `${ring}-${d}`,
      });
    }
  }
  return (
    <svg viewBox="-130 -130 260 260" className={className} aria-hidden>
      <circle r="3.5" fill="currentColor" />
      {dots.map(({ x, y, r, key }) => (
        <circle key={key} cx={x} cy={y} r={r} fill="currentColor" />
      ))}
    </svg>
  );
}

function StepCard({ num, text }: { num: string; text: string }) {
  return (
    <div className="border-border bg-ink-elevated rounded-xl border p-6 shadow-md shadow-black/30">
      <span className="text-gold mb-3 block font-serif text-5xl leading-none">{num}</span>
      <p className="text-cream-muted text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function PrincipleChip({
  Icon,
  label,
}: {
  Icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
}) {
  return (
    <div className="border-border bg-ink-elevated text-cream-muted flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium">
      <Icon className="text-gold h-3.5 w-3.5" aria-hidden />
      {label}
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Top hairline — subtle gold */}
      <div className="bg-gold/40 relative z-10 h-[1px]" />

      {/* Sol de Mayo halftone — stippled engraving, slow rotation */}
      <div
        aria-hidden
        className="text-cream pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <SolHalftone className="sol-rotate h-[140%] w-auto max-w-none opacity-[0.09]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {/* Eyebrow */}
        <p className="reveal reveal-delay-1 text-gold mb-6 text-center text-xs font-semibold uppercase tracking-[0.28em] sm:text-left">
          Transparencia Judicial — Argentina
        </p>

        {/* Headline — editorial serif display */}
        <h1 className="reveal reveal-delay-2 text-cream text-center font-serif text-5xl leading-[1.02] tracking-tight sm:text-left sm:text-6xl lg:text-7xl xl:text-8xl">
          Conocé a tus jueces.
          <br />
          <span className="text-gold italic">Exigí rendición de cuentas.</span>
        </h1>

        {/* Subheadline */}
        <p className="reveal reveal-delay-3 text-cream-muted mt-8 max-w-2xl text-center text-base leading-relaxed sm:text-left sm:text-lg">
          Buscá registros judiciales reales para ver qué jueces presidieron casos en los que los
          imputados no se presentaron a declarar, fueron detenidos nuevamente o tuvieron revocada su
          libertad cautelar.{" "}
          <span className="text-cream-subtle">
            Todos los datos provienen de registros públicos.
          </span>
        </p>

        {/* Steps — roman numerals, gazette style */}
        <div className="reveal reveal-delay-4 mt-14 grid gap-6 sm:grid-cols-3">
          {STEPS.map(({ num, text }) => (
            <StepCard key={num} num={num} text={text} />
          ))}
        </div>

        {/* Principles row */}
        <div className="reveal reveal-delay-5 mt-10 flex flex-wrap justify-center gap-3 sm:justify-start">
          {PRINCIPLES.map(({ Icon, label }) => (
            <PrincipleChip key={label} Icon={Icon} label={label} />
          ))}
        </div>
      </div>

      {/* Bottom hairline — prominent gold to announce transition to content */}
      <div className="bg-gold relative z-10 h-[2px]" />
    </section>
  );
}
