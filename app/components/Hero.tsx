const STEPS = [
  {
    num: "01",
    text: "Cuando una persona es detenida, un juez decide si la libera mientras espera el juicio.",
  },
  {
    num: "02",
    text: "La legislación argentina exige que los fallos judiciales sobre libertades cautelares sean información pública — incluyendo cada caso en que esa libertad fracasó: la persona no se presentó a declarar, fue detenida nuevamente, o le fue revocada la medida.",
  },
  {
    num: "03",
    text: "Nosotros recopilamos esos registros públicos y te mostramos exactamente qué jueces presidieron esos casos — para que puedas ver los datos por vos mismo.",
  },
];

const PRINCIPLES = [
  { icon: "📂", label: "Código abierto" },
  { icon: "📊", label: "Estadístico" },
  { icon: "⚖️", label: "Sin sesgo político" },
  { icon: "🔍", label: "Datos reales" },
];

function StepCard({ num, text }: { num: string; text: string }) {
  return (
    <div className="border-border bg-ink-elevated rounded-xl border p-6 shadow-md shadow-black/30">
      <span className="text-gold mb-3 block font-serif text-4xl font-black leading-none">
        {num}
      </span>
      <p className="text-cream-muted text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function PrincipleChip({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="border-border bg-ink-elevated text-cream-muted flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium">
      <span aria-hidden="true">{icon}</span>
      {label}
    </div>
  );
}

export default function Hero() {
  return (
    <section className="w-full">
      {/* Top hairline — subtle gold */}
      <div className="bg-gold/40 h-[1px]" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {/* Badge */}
        <div className="mb-8 flex justify-center sm:justify-start">
          <span className="bg-gold-soft text-gold border-gold/30 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest">
            Base de Datos de Acceso Público
          </span>
        </div>

        {/* Headline — serif display */}
        <h1 className="text-cream text-center font-serif text-4xl leading-[1.05] tracking-tight sm:text-left sm:text-5xl lg:text-6xl xl:text-7xl">
          Conocé a tus jueces.
          <br />
          <span className="text-gold font-black italic">Exigí rendición de cuentas.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-cream-muted mt-8 max-w-2xl text-center text-base leading-relaxed sm:text-left sm:text-lg">
          Buscá registros judiciales reales para ver qué jueces presidieron casos en los que los
          imputados no se presentaron a declarar, fueron detenidos nuevamente o tuvieron revocada su
          libertad cautelar.{" "}
          <span className="text-cream-subtle">
            Todos los datos provienen de registros públicos.
          </span>
        </p>

        {/* Steps */}
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {STEPS.map(({ num, text }) => (
            <StepCard key={num} num={num} text={text} />
          ))}
        </div>

        {/* Principles row */}
        <div className="mt-10 flex flex-wrap justify-center gap-3 sm:justify-start">
          {PRINCIPLES.map(({ icon, label }) => (
            <PrincipleChip key={label} icon={icon} label={label} />
          ))}
        </div>
      </div>

      {/* Bottom hairline — prominent gold to announce transition to content */}
      <div className="bg-gold h-[2px]" />
    </section>
  );
}
