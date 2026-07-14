export type TradeDirection = "long" | "short";
export type TradeStatus = "open" | "closed" | "cancelled";

export interface Trade {
  id: string;
  userId: string;
  symbol: string;
  direction: TradeDirection;
  status: TradeStatus;
  entryPrice: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  lotSize: number;
  pnl?: number;
  pnlPercent?: number;
  fees?: number;
  entryDate: string; // ISO
  exitDate?: string; // ISO
  strategy?: string;
  tags: string[];
  notes?: string;
  screenshotUrls: string[];
  emotion?: "confident" | "fearful" | "greedy" | "neutral" | "revenge" | "fomo";
  createdAt: string;
  updatedAt: string;
}

export type NewTrade = Omit<Trade, "id" | "userId" | "createdAt" | "updatedAt">;

export interface TradeStats {
  totalTrades: number;
  winRate: number;
  totalPnl: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  bestTrade: number;
  worstTrade: number;
  currentStreak: number;
  streakType: "win" | "loss" | "none";
}

// ---------- Phase 3: Backtesting & Strategy Library ----------

export type BacktestResultOutcome = "win" | "loss" | "breakeven";

export interface BacktestEntry {
  id: string;
  userId: string;
  strategyId: string;
  symbol: string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  lotSize: number;
  pnl: number;
  pnlR?: number; // result in R-multiples
  outcome: BacktestResultOutcome;
  timeframe: string;
  date: string; // ISO date of the backtested setup
  notes?: string;
  screenshotUrls: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type NewBacktestEntry = Omit<
  BacktestEntry,
  "id" | "userId" | "createdAt" | "updatedAt"
>;

export interface Strategy {
  id: string;
  userId: string;
  name: string;
  description: string;
  rules: string[];
  timeframes: string[];
  markets: string[];
  tags: string[];
  color: string;
  createdAt: string;
  updatedAt: string;
}

export type NewStrategy = Omit<Strategy, "id" | "userId" | "createdAt" | "updatedAt">;

export interface BacktestStats {
  totalSetups: number;
  winRate: number;
  totalPnl: number;
  totalR: number;
  avgR: number;
  expectancy: number;
  profitFactor: number;
}
