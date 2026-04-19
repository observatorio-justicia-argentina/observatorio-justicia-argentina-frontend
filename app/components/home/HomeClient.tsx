"use client";

import { useState } from "react";
import JurisdictionStats from "../JurisdictionStats";
import JudgesHub from "./JudgesHub";
import { FilterOptions, JudgeCounts, JurisdictionNode } from "../../lib/api";

interface HomeClientProps {
  hierarchy: JurisdictionNode | null;
  filterOptions: FilterOptions;
  judgeCounts: JudgeCounts;
}

export default function HomeClient({ hierarchy, filterOptions, judgeCounts }: HomeClientProps) {
  const [activeProvince, setActiveProvince] = useState<string | null>(null);

  return (
    <>
      {hierarchy && (
        <JurisdictionStats
          hierarchy={hierarchy}
          onProvinceFilter={setActiveProvince}
          activeProvince={activeProvince}
        />
      )}

      <div
        aria-hidden
        className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-10 sm:px-6 lg:px-8"
      >
        <div className="bg-gold/25 h-px flex-1" />
        <span className="text-gold/70 font-serif text-2xl leading-none">§</span>
        <div className="bg-gold/25 h-px flex-1" />
      </div>

      <JudgesHub
        initialJudgeCounts={judgeCounts}
        initialFilterOptions={filterOptions}
        activeProvince={activeProvince}
        onProvinceChange={setActiveProvince}
      />
    </>
  );
}
