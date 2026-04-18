interface StatsBarProps {
  totalJudges: number;
  totalReleases: number;
  totalFailures: number;
}

export default function StatsBar({ totalJudges, totalReleases, totalFailures }: StatsBarProps) {
  const overallRate =
    totalReleases > 0 ? ((totalFailures / totalReleases) * 100).toFixed(1) : "0.0";

  return (
    <div className="bg-ink-elevated border-border w-full border-b">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 px-4 py-3 sm:gap-10 sm:px-6 lg:px-8">
        <Stat value={totalJudges} label="Jueces registrados" />
        <Divider />
        <Stat value={totalReleases.toLocaleString("es-AR")} label="Libertades otorgadas" />
        <Divider />
        <Stat value={totalFailures.toLocaleString("es-AR")} label="Fallas procesales" />
        <Divider />
        <Stat value={`${overallRate}%`} label="Tasa general de falla" accent="gold" />
      </div>
    </div>
  );
}

function Divider() {
  return <div className="bg-border hidden h-6 w-px sm:block" />;
}

function Stat({
  value,
  label,
  accent,
}: {
  value: string | number;
  label: string;
  accent?: "gold" | "gold";
}) {
  const valueClass =
    accent === "gold" ? "text-gold" : accent === "gold" ? "text-gold" : "text-cream";
  return (
    <div className="flex flex-col items-center">
      <span className={`font-serif text-xl font-bold sm:text-2xl ${valueClass}`}>{value}</span>
      <span className="text-cream-muted text-xs">{label}</span>
    </div>
  );
}
