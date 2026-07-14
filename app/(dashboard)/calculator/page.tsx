"use client";

import { useState } from "react";
import LotSizeCalculator from "@/components/calculators/LotSizeCalculator";
import PipCalculator from "@/components/calculators/PipCalculator";
import PositionSizeCalculator from "@/components/calculators/PositionSizeCalculator";
import RiskCalculator from "@/components/calculators/RiskCalculator";
import clsx from "clsx";

const TABS = [
  { id: "lot", label: "Lot Size", component: LotSizeCalculator },
  { id: "pip", label: "Pip Value", component: PipCalculator },
  { id: "position", label: "Position Size", component: PositionSizeCalculator },
  { id: "risk", label: "Risk / Reward", component: RiskCalculator },
] as const;

export default function CalculatorPage() {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("lot");
  const Active = TABS.find((t) => t.id === active)!.component;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calculators</h1>
        <p className="text-sm text-grey mt-1">
          Covers Forex, Gold, Silver, and Crypto. All results are calculated locally.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={clsx(
              "px-4 py-2 rounded-xl text-sm font-medium",
              active === t.id ? "bg-accent text-bg-1" : "text-grey hover:bg-white/5"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-card p-5">
        <Active />
      </div>
    </div>
  );
}
