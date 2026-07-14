"use client";

// Ported from the Phase 2/5 Analytics page. Folded into the dashboard
// (rather than added as a brand-new route) so it sits alongside the
// existing stat cards + equity curve without requiring new middleware /
// sidebar entries.

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Trade } from "@/types/trade";
import { statsByStrategy, statsBySymbol } from "@/lib/analytics";
import { Card } from "@/components/ui/card";

export function TradeAnalytics({ trades }: { trades: Trade[] }) {
  const byStrategy = statsByStrategy(trades);
  const bySymbol = statsBySymbol(trades);

  const strategyBars = Object.entries(byStrategy).map(([name, s]) => ({
    name,
    winRate: Number(s.winRate.toFixed(1)),
    pnl: Number(s.totalPnl.toFixed(2)),
  }));

  const symbolBars = Object.entries(bySymbol).map(([name, s]) => ({
    name,
    pnl: Number(s.totalPnl.toFixed(2)),
  }));

  if (strategyBars.length === 0 && symbolBars.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-grey">PnL by Strategy</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={strategyBars}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="name" tick={{ fill: "#BABABA", fontSize: 10 }} />
            <YAxis tick={{ fill: "#BABABA", fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: "#161316",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Bar dataKey="pnl" fill="#FF6D29" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-grey">PnL by Symbol</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={symbolBars}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="name" tick={{ fill: "#BABABA", fontSize: 10 }} />
            <YAxis tick={{ fill: "#BABABA", fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: "#161316",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
            <Bar dataKey="pnl" fill="#4ADE80" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
