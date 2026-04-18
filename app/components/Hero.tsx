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

function StepCard({ num, text }: { num: string; text: string }) {
  return (
    <div className="border-border bg-ink-elevated rounded-xl border p-6 shadow-md shadow-black/30">
      <span className="text-gold mb-3 block font-serif text-5xl leading-none">{num}</span>
      <p className="text-cream-muted text-sm leading-relaxed">{text}</p>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Top hairline — subtle gold */}
      <div className="bg-gold/40 relative z-10 h-[1px]" />

      {/* Escudo Nacional Argentino — halftone watermark on the right */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <img
          src="/coat-of-arms.svg"
          alt=""
          className="halftone-mask absolute -right-16 top-1/2 h-[110%] w-auto -translate-y-1/2 opacity-[0.6] [filter:grayscale(1)_contrast(1.4)_brightness(1.05)] sm:-right-8"
        />
        {/* Dark fade from left to right so the escudo bleeds into the ink on the text side */}
        <div className="from-ink via-ink/95 absolute inset-0 bg-gradient-to-r to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {/* Eyebrow */}
        <p className="reveal reveal-delay-1 text-gold mb-6 text-center text-xs font-semibold uppercase tracking-[0.28em] sm:text-left">
          Transparencia Judicial — Argentina
        </p>

        {/* Headline — editorial serif display */}
        <h1 className="reveal reveal-delay-2 text-cream max-w-3xl text-center font-serif text-5xl leading-[1.02] tracking-tight sm:text-left sm:text-6xl lg:text-7xl xl:text-8xl">
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
      </div>

      {/* Bottom hairline — prominent gold to announce transition to content */}
      <div className="bg-gold relative z-10 h-[2px]" />
    </section>
  );
}
