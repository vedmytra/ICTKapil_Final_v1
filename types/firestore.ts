import type { Timestamp } from "firebase/firestore";

export interface BaseDoc {
  uid: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type Session = "Asia" | "London" | "New York" | "London-NY Overlap";
export type Emotion = "Calm" | "Confident" | "Fearful" | "Greedy" | "Revenge" | "FOMO" | "Neutral";

// NOTE (merge/phase-5 reconciliation): the original scaffold defined a
// `JournalTrade` shape here (pair/entry/exit/netProfit/tradeDate...) and its
// own `BacktestEntry`. The ported Phase 2/5 trade journal + backtesting
// features (fully built, incl. CSV import/export, screenshot upload, R
// multiples) use a different, more complete schema — see "@/types/trade"
// (`Trade`, `BacktestEntry`, `Strategy`). To avoid two parallel, disconnected
// data models feeding the same dashboard, the canonical trade/backtest model
// is now the one in "@/types/trade", and `JournalTrade`/old `BacktestEntry`
// were removed from here. `DashboardStats` below is kept and is now computed
// from `Trade[]` in `hooks/use-dashboard-stats.ts`.

export interface NoteDoc extends BaseDoc {
  id: string;
  title: string;
  content: string; // rich text HTML
  folder: string;
  checklist: { id: string; text: string; done: boolean }[];
  voiceNoteUrl?: string;
  imageUrls: string[];
}

export interface GoalDoc extends BaseDoc {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
}

export interface ChecklistDoc extends BaseDoc {
  id: string;
  type: "OrderBlock" | "FVG" | "Liquidity" | "SMT" | "Risk" | "Trade";
  items: { id: string; text: string; checked: boolean }[];
}

export interface WatchlistItem extends BaseDoc {
  id: string;
  pair: string;
  bias: "Bullish" | "Bearish" | "Neutral";
  note: string;
}

export interface UserSettings extends BaseDoc {
  theme: "dark" | "light" | "orange" | "custom";
  accentColor: string;
  fontSize: "sm" | "md" | "lg";
  animations: boolean;
  language: "en" | "hi" | "hinglish";
}

export interface DashboardStats {
  totalTrades: number;
  todaysTrades: number;
  monthlyTrades: number;
  winningPercent: number;
  profitFactor: number;
  averageRR: number;
  expectancy: number;
  currentDrawdown: number;
  largestWin: number;
  largestLoss: number;
  netProfit: number;
  tradingStreak: number;
}
