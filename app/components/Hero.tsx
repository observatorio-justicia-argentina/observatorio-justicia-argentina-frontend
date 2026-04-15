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

export default function Hero() {
  return (
    <section className="w-full" style={{ borderBottom: "1px solid #21262d" }}>
      {/* Top gradient band */}
      <div
        style={{ height: "2px", background: "linear-gradient(90deg, #74ACDF 0%, #F4B942 100%)" }}
      />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        {/* Badge */}
        <div className="mb-6 flex justify-center sm:justify-start">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
            style={{
              backgroundColor: "#F4B94215",
              color: "#F4B942",
              border: "1px solid #F4B94230",
            }}
          >
            Base de Datos de Acceso Público
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-center text-3xl font-extrabold leading-tight sm:text-left sm:text-4xl lg:text-5xl xl:text-6xl"
          style={{ color: "#e6edf3" }}
        >
          Conocé a tus jueces. <span style={{ color: "#74ACDF" }}>Exigí rendición</span>{" "}
          <span style={{ color: "#F4B942" }}>de cuentas.</span>
        </h1>

        {/* Subheadline */}
        <p
          className="mt-5 max-w-2xl text-center text-base leading-relaxed sm:text-left sm:text-lg"
          style={{ color: "#8b949e" }}
        >
          Buscá registros judiciales reales para ver qué jueces presidieron casos en los que los
          imputados no se presentaron a declarar, fueron detenidos nuevamente o tuvieron revocada su
          libertad cautelar.{" "}
          <span style={{ color: "#7d8590" }}>Todos los datos provienen de registros públicos.</span>
        </p>

        {/* Steps */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {STEPS.map(({ num, text }) => (
            <div
              key={num}
              className="rounded-xl p-5"
              style={{ backgroundColor: "#161b22", border: "1px solid #21262d" }}
            >
              <span
                className="mb-3 block text-3xl font-black leading-none"
                style={{ color: "#F4B942", opacity: 0.9 }}
              >
                {num}
              </span>
              <p className="text-sm leading-relaxed" style={{ color: "#8b949e" }}>
                {text}
              </p>
            </div>
          ))}
        </div>

        {/* Principles row */}
        <div className="mt-10 flex flex-wrap justify-center gap-4 sm:justify-start">
          {[
            { icon: "📂", label: "Código abierto" },
            { icon: "📊", label: "Estadístico" },
            { icon: "⚖️", label: "Sin sesgo político" },
            { icon: "🔍", label: "Datos reales" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
              style={{ backgroundColor: "#21262d", color: "#8b949e", border: "1px solid #30363d" }}
            >
              <span aria-hidden="true">{icon}</span>
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
