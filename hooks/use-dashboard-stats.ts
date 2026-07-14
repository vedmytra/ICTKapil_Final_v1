"use client";

// Reconciled during the Phase 1-5 merge: this hook originally read a
// `journal` Firestore collection typed as `JournalTrade`. The fully-built
// trade journal feature ported from Phase 2/5 writes to the `trades`
// collection using the `Trade` type (see "@/types/trade" and
// "@/lib/tradesService"). Rather than keep two disconnected trade stores,
// this hook now subscribes to the same `trades` collection the Journal page
// uses, so dashboard stats reflect real journal data.

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { subscribeToTrades } from "@/lib/tradesService";
import type { Trade } from "@/types/trade";
import type { DashboardStats } from "@/types/firestore";
import { startOfMonth, startOfDay, isAfter, isSameDay, parseISO } from "date-fns";

const EMPTY_STATS: DashboardStats = {
  totalTrades: 0,
  todaysTrades: 0,
  monthlyTrades: 0,
  winningPercent: 0,
  profitFactor: 0,
  averageRR: 0,
  expectancy: 0,
  currentDrawdown: 0,
  largestWin: 0,
  largestLoss: 0,
  netProfit: 0,
  tradingStreak: 0,
};

export function useDashboardStats() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToTrades(user.uid, (rows) => {
      setTrades(rows);
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const stats = computeStats(trades);
  return { stats, trades, loading };
}

function computeStats(trades: Trade[]): DashboardStats {
  const closed = trades.filter((t) => t.status === "closed" && t.pnl !== undefined);
  if (closed.length === 0) return EMPTY_STATS;

  const now = new Date();
  const monthStart = startOfMonth(now);
  const todayStart = startOfDay(now);

  const wins = closed.filter((t) => (t.pnl ?? 0) > 0);
  const losses = closed.filter((t) => (t.pnl ?? 0) < 0);

  const grossProfit = wins.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0));
  const netProfit = closed.reduce((s, t) => s + (t.pnl ?? 0), 0);

  const winningPercent = (wins.length / closed.length) * 100;
  const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;

  const withRR = closed.filter((t) => t.stopLoss !== undefined && t.takeProfit !== undefined);
  const averageRR =
    withRR.length > 0
      ? withRR.reduce((s, t) => {
          const risk = Math.abs(t.entryPrice - (t.stopLoss as number));
          const reward = Math.abs((t.takeProfit as number) - t.entryPrice);
          return s + (risk > 0 ? reward / risk : 0);
        }, 0) / withRR.length
      : 0;

  const expectancy =
    (winningPercent / 100) * (grossProfit / (wins.length || 1)) -
    (1 - winningPercent / 100) * (grossLoss / (losses.length || 1));

  const sorted = [...closed].sort(
    (a, b) => parseISO(a.entryDate).getTime() - parseISO(b.entryDate).getTime()
  );
  let equity = 0;
  let peak = 0;
  let maxDrawdown = 0;
  for (const t of sorted) {
    equity += t.pnl ?? 0;
    peak = Math.max(peak, equity);
    maxDrawdown = Math.max(maxDrawdown, peak - equity);
  }

  let streak = 0;
  const firstIsWin = (sorted[sorted.length - 1]?.pnl ?? 0) > 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const trade = sorted[i];
if (!trade) continue;

const isWin = (trade.pnl ?? 0) > 0;
    if (isWin === firstIsWin) streak++;
    else break;
  }

  return {
    totalTrades: closed.length,
    todaysTrades: closed.filter((t) => isSameDay(parseISO(t.entryDate), todayStart)).length,
    monthlyTrades: closed.filter((t) => isAfter(parseISO(t.entryDate), monthStart)).length,
    winningPercent,
    profitFactor,
    averageRR,
    expectancy,
    currentDrawdown: maxDrawdown,
    largestWin: wins.length ? Math.max(...wins.map((t) => t.pnl ?? 0)) : 0,
    largestLoss: losses.length ? Math.min(...losses.map((t) => t.pnl ?? 0)) : 0,
    netProfit,
    tradingStreak: streak,
  };
}
