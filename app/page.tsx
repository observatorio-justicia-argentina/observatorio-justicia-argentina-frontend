import DisclaimerModal from "./components/DisclaimerModal";
import Hero from "./components/Hero";
import StatsBar from "./components/StatsBar";
import HomeClient from "./components/home/HomeClient";
import {
  fetchHierarchy,
  fetchJudgeCounts,
  fetchFilterOptions,
  FilterOptions,
  JudgeCounts,
} from "./lib/api";

const EMPTY_COUNTS: JudgeCounts = { byProvince: {}, byDepto: {}, byCity: {} };
const EMPTY_OPTIONS: FilterOptions = { fueros: [], instances: [], scopes: [] };

export default async function HomePage() {
  const [hierarchyResult, countsResult, optionsResult] = await Promise.allSettled([
    fetchHierarchy(),
    fetchJudgeCounts(),
    fetchFilterOptions(),
  ]);

  const hierarchy = hierarchyResult.status === "fulfilled" ? hierarchyResult.value : null;
  const judgeCounts = countsResult.status === "fulfilled" ? countsResult.value : EMPTY_COUNTS;
  const filterOptions = optionsResult.status === "fulfilled" ? optionsResult.value : EMPTY_OPTIONS;

  const totalJudgesAll = Object.values(judgeCounts.byProvince).reduce((s, n) => s + n, 0);

  return (
    <>
      <DisclaimerModal />
      <StatsBar
        totalJudges={totalJudgesAll}
        totalReleases={hierarchy?.totalReleases ?? 0}
        totalFailures={hierarchy?.totalFailures ?? 0}
      />
      <Hero />
      <HomeClient hierarchy={hierarchy} filterOptions={filterOptions} judgeCounts={judgeCounts} />
    </>
  );
}
