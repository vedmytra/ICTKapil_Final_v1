"use client";

import { useAuth } from "@/contexts/auth-context";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { StatCard } from "@/components/ui/card";
import { EquityCurve } from "@/components/dashboard/equity-curve";
import { TradeAnalytics } from "@/components/dashboard/trade-analytics";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, trades, loading } = useDashboardStats();

  const firstName = user?.displayName?.split(" ")[0] || "Trader";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {firstName}</h1>
        <p className="text-sm text-grey">Here&apos;s how your edge is performing.</p>
      </div>

      {loading ? (
        <div className="text-sm text-grey">Loading your stats…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Total Trades" value={String(stats.totalTrades)} />
            <StatCard label="Today" value={String(stats.todaysTrades)} />
            <StatCard label="This Month" value={String(stats.monthlyTrades)} />
            <StatCard
              label="Win Rate"
              value={formatPercent(stats.winningPercent)}
              positive={stats.winningPercent >= 50}
              delta={stats.winningPercent >= 50 ? "Above breakeven" : "Below breakeven"}
            />
            <StatCard label="Profit Factor" value={stats.profitFactor.toFixed(2)} />
            <StatCard label="Average RR" value={`${stats.averageRR.toFixed(2)}R`} />
            <StatCard
              label="Net Profit"
              value={formatCurrency(stats.netProfit)}
              positive={stats.netProfit >= 0}
              delta={stats.netProfit >= 0 ? "In profit" : "In drawdown"}
            />
            <StatCard label="Expectancy" value={formatCurrency(stats.expectancy)} />
            <StatCard label="Current Drawdown" value={formatCurrency(-stats.currentDrawdown)} />
            <StatCard label="Largest Win" value={formatCurrency(stats.largestWin)} positive />
            <StatCard label="Largest Loss" value={formatCurrency(stats.largestLoss)} />
            <StatCard label="Streak" value={`${stats.tradingStreak} trades`} />
          </div>

          <EquityCurve trades={trades} />
          <TradeAnalytics trades={trades} />
        </>
      )}
    </div>
  );
}
