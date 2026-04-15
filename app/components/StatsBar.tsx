interface StatsBarProps {
  totalJudges: number;
  totalReleases: number;
  totalFailures: number;
}

export default function StatsBar({ totalJudges, totalReleases, totalFailures }: StatsBarProps) {
  const overallRate =
    totalReleases > 0 ? ((totalFailures / totalReleases) * 100).toFixed(1) : "0.0";

  return (
    <div
      className="w-full"
      style={{ backgroundColor: "#161b22", borderBottom: "1px solid #21262d" }}
    >
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
  return <div className="hidden h-6 w-px sm:block" style={{ backgroundColor: "#21262d" }} />;
}

function Stat({
  value,
  label,
  accent,
}: {
  value: string | number;
  label: string;
  accent?: "celeste" | "gold";
}) {
  const color = accent === "gold" ? "#F4B942" : accent === "celeste" ? "#74ACDF" : "#e6edf3";
  return (
    <div className="flex flex-col items-center">
      <span className="text-xl font-bold sm:text-2xl" style={{ color }}>
        {value}
      </span>
      <span className="text-xs" style={{ color: "#7d8590" }}>
        {label}
      </span>
    </div>
  );
}
