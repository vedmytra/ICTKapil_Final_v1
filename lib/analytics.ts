import { Trade, TradeStats } from "@/types/trade";
import { format, parseISO, startOfDay } from "date-fns";

export function computeTradeStats(trades: Trade[]): TradeStats {
  const closed = trades.filter((t) => t.status === "closed" && t.pnl !== undefined);

  if (closed.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      totalPnl: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      bestTrade: 0,
      worstTrade: 0,
      currentStreak: 0,
      streakType: "none",
    };
  }

  const wins = closed.filter((t) => (t.pnl ?? 0) > 0);
  const losses = closed.filter((t) => (t.pnl ?? 0) < 0);
  const totalPnl = closed.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  const grossProfit = wins.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + (t.pnl ?? 0), 0));

  const sortedByDate = [...closed].sort(
    (a, b) => parseISO(a.entryDate).getTime() - parseISO(b.entryDate).getTime()
  );
  let currentStreak = 0;
  let streakType: TradeStats["streakType"] = "none";
  for (let i = sortedByDate.length - 1; i >= 0; i--) {
    const isWin = (sortedByDate[i].pnl ?? 0) > 0;
    if (i === sortedByDate.length - 1) {
      streakType = isWin ? "win" : "loss";
      currentStreak = 1;
    } else if ((isWin && streakType === "win") || (!isWin && streakType === "loss")) {
      currentStreak++;
    } else {
      break;
    }
  }

  return {
    totalTrades: closed.length,
    winRate: (wins.length / closed.length) * 100,
    totalPnl,
    avgWin: wins.length ? grossProfit / wins.length : 0,
    avgLoss: losses.length ? grossLoss / losses.length : 0,
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0,
    bestTrade: Math.max(...closed.map((t) => t.pnl ?? 0)),
    worstTrade: Math.min(...closed.map((t) => t.pnl ?? 0)),
    currentStreak,
    streakType,
  };
}

/** Daily PnL buckets, keyed by yyyy-MM-dd, for calendar view and equity curve. */
export function groupPnlByDay(trades: Trade[]): Record<string, number> {
  const closed = trades.filter((t) => t.status === "closed" && t.exitDate);
  const map: Record<string, number> = {};
  for (const t of closed) {
    const key = format(startOfDay(parseISO(t.exitDate!)), "yyyy-MM-dd");
    map[key] = (map[key] ?? 0) + (t.pnl ?? 0);
  }
  return map;
}

export function buildEquityCurve(trades: Trade[]): { date: string; equity: number }[] {
  const closed = [...trades]
    .filter((t) => t.status === "closed" && t.exitDate)
    .sort((a, b) => parseISO(a.exitDate!).getTime() - parseISO(b.exitDate!).getTime());

  let running = 0;
  return closed.map((t) => {
    running += t.pnl ?? 0;
    return { date: t.exitDate!, equity: Number(running.toFixed(2)) };
  });
}

export function statsByStrategy(trades: Trade[]): Record<string, TradeStats> {
  const strategies = Array.from(
    new Set(trades.map((t) => t.strategy).filter(Boolean))
  ) as string[];
  const result: Record<string, TradeStats> = {};
  for (const s of strategies) {
    result[s] = computeTradeStats(trades.filter((t) => t.strategy === s));
  }
  return result;
}

export function statsBySymbol(trades: Trade[]): Record<string, TradeStats> {
  const symbols = Array.from(new Set(trades.map((t) => t.symbol)));
  const result: Record<string, TradeStats> = {};
  for (const s of symbols) {
    result[s] = computeTradeStats(trades.filter((t) => t.symbol === s));
  }
  return result;
}
